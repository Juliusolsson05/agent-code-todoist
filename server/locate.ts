import { execFile } from 'node:child_process'
import { access, constants, readdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'

// Finding the user's `td` and the environment it needs.
//
// WHY this is more than `which td`: the service is forked by Agent Code's main
// process and inherits ITS environment. When the app is launched from Finder,
// main's PATH is the minimal launchd PATH plus what agent-code's toolchain
// prepends (src/main/setup/toolchain.ts applyToolEnv: the dirs of the resolved
// claude/codex binaries, /opt/homebrew/bin, /usr/local/bin). A `td` installed with
// `npm i -g` under nvm/fnm/volta lives somewhere else entirely and is invisible.
//
// So the ladder is: explicit setting → inherited PATH → well-known install dirs →
// the user's LOGIN SHELL's PATH (one probe, cached). The login-shell probe is last
// because it is the slow one (~100–500 ms, and it runs the user's dotfiles).
//
// The second job is the env td RUNS with. td's bin is `#!/usr/bin/env node` and
// needs Node >= 24 (package engines). If we only found td but ran it with main's
// PATH, `env node` could resolve to no node at all (Finder launch) or an old one.
// We therefore put td's own directory first (nvm/volta/brew all colocate `node`
// next to their global bins) followed by the login-shell PATH.

export type Located = { path: string; env: NodeJS.ProcessEnv }
export type LocateResult = { found: Located | null; searched: string[] }

async function isExecutable(path: string): Promise<boolean> {
  try {
    await access(path, constants.X_OK)
    return true
  } catch {
    return false
  }
}

let loginShellPath: Promise<string | null> | null = null

/** PATH as the user's login shell sees it. Cached for the service lifetime —
 *  dotfiles do not change between two clicks, and re-running them per call
 *  would add latency to every td invocation. `refresh` re-probes (used by the
 *  "Check again" button after the user installs td in a terminal). */
export function loginPath(refresh = false): Promise<string | null> {
  if (process.platform === 'win32') return Promise.resolve(null)
  if (!loginShellPath || refresh) {
    const shell = process.env.SHELL || '/bin/zsh'
    // -l (login) without -i: interactive mode can print prompts/motd into stdout
    // and some setups block on tty checks. Markers make the PATH extractable even
    // if a profile prints noise.
    loginShellPath = new Promise(resolve => {
      execFile(shell, ['-lc', 'printf "__TD_PATH__%s__TD_END__" "$PATH"'], { timeout: 5000, env: { ...process.env, TERM: 'dumb' } }, (error, stdout) => {
        if (error) return resolve(null)
        const match = /__TD_PATH__(.*)__TD_END__/s.exec(String(stdout))
        resolve(match ? match[1] : null)
      })
    })
  }
  return loginShellPath
}

function joinPaths(...parts: Array<string | null | undefined>): string {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of parts) {
    for (const dir of (part ?? '').split(delimiter)) {
      if (!dir || seen.has(dir)) continue
      seen.add(dir)
      out.push(dir)
    }
  }
  return out.join(delimiter)
}

/** Newest-first nvm node bin dirs. nvm users often have several Node versions
 *  and only the newest satisfies td's >=24 engine. */
async function nvmBins(home: string): Promise<string[]> {
  const root = join(home, '.nvm', 'versions', 'node')
  try {
    const versions = await readdir(root)
    return versions
      .filter(name => /^v\d+/.test(name))
      .sort((a, b) => compareVersions(b.slice(1), a.slice(1)))
      .map(name => join(root, name, 'bin'))
  } catch {
    return []
  }
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0)
  const pb = b.split('.').map(n => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff) return diff
  }
  return 0
}

export async function wellKnownDirs(): Promise<string[]> {
  const home = homedir()
  return [
    '/opt/homebrew/bin',
    '/usr/local/bin',
    join(home, '.local', 'bin'),
    join(home, '.npm-global', 'bin'),
    join(home, '.volta', 'bin'),
    join(home, 'Library', 'pnpm'),
    join(home, '.bun', 'bin'),
    ...(await nvmBins(home)),
  ]
}

export function envFor(tdPath: string, shellPath: string | null): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PATH: joinPaths(dirname(tdPath), shellPath, process.env.PATH, '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'),
    // Machine output only: no ANSI colour in error text we surface, no spinner
    // frames on stderr (we also pass --no-spinner), no accessibility prefixes.
    NO_COLOR: '1',
    FORCE_COLOR: '0',
    TD_ACCESSIBLE: '',
    // A TODOIST_API_TOKEN inherited from whoever launched Agent Code would
    // silently override the Keychain account the user signed in with in OUR
    // setup screen. td documents that the env var always wins; we keep it only
    // if the user deliberately set it (then auth status reports source=env).
  }
}

export async function locateTd(settingPath: string | undefined, options: { refresh?: boolean } = {}): Promise<LocateResult> {
  const searched: string[] = []
  const name = process.platform === 'win32' ? 'td.cmd' : 'td'

  if (settingPath && settingPath.trim()) {
    const path = settingPath.trim().replace(/^~(?=\/)/, homedir())
    searched.push(path)
    if (await isExecutable(path)) return { found: { path, env: envFor(path, await loginPath(options.refresh)) }, searched }
    // An explicit setting that is wrong must not be silently replaced by
    // something else we found: the user pointed at a specific binary for a
    // reason (e.g. a pre-release). Report it as not found.
    return { found: null, searched }
  }

  const tryDirs = async (dirs: string[]): Promise<string | null> => {
    for (const dir of dirs) {
      const candidate = join(dir, name)
      if (searched.includes(candidate)) continue
      searched.push(candidate)
      if (await isExecutable(candidate)) return candidate
    }
    return null
  }

  const inherited = (process.env.PATH ?? '').split(delimiter).filter(Boolean)
  const fromInherited = (await tryDirs(inherited)) ?? (await tryDirs(await wellKnownDirs()))
  if (fromInherited) return { found: { path: fromInherited, env: envFor(fromInherited, await loginPath(options.refresh)) }, searched }

  const shellPath = await loginPath(options.refresh)
  const fromShell = shellPath ? await tryDirs(shellPath.split(delimiter).filter(Boolean)) : null
  if (fromShell) return { found: { path: fromShell, env: envFor(fromShell, shellPath) }, searched }
  return { found: null, searched }
}

export async function locateBrew(): Promise<string | null> {
  for (const candidate of ['/opt/homebrew/bin/brew', '/usr/local/bin/brew']) {
    if (await isExecutable(candidate)) return candidate
  }
  return null
}

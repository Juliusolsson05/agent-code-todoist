import { spawn } from 'node:child_process'

// Running one td command and turning its result into data or a typed error.
//
// Contract we rely on (verified against td 5.4.10, see the plan's Evidence):
// - success → exit 0, JSON on stdout (`--json`).
// - failure → exit 1, `{"error":{"code","message","hints"}}` on STDERR. Recorded
//   verbatim while signed out: tests/fixtures/td-signed-out-today.json.
//
// WHY execFile-style spawn with an args array and never a shell: task titles,
// descriptions and comments are user text that will contain quotes, `$`, `;`
// and newlines. Passing them as argv elements makes injection impossible by
// construction; a shell string would need escaping we could get wrong once.
//
// WHY our own 20 s cap: the host kills the whole service when an invoke passes
// 30 s (serviceHost.ts invokeTimeoutMs) and reports an unknown outcome. Killing
// just the td child at 20 s keeps the service alive and gives the user a clear
// "timed out" instead of a dead bridge. The mutation may still have happened
// server-side, which is why the UI refetches after a TIMEOUT rather than
// assuming failure.

export class TdError extends Error {
  constructor(readonly code: string, message: string, readonly hints: string[] = []) {
    // The bridge only carries `message`; prefixing the code is how the runtime
    // and views branch on it (src/shared/types.ts tdErrorCode).
    super(`${code}: ${message}${hints.length ? ` (${hints.join(' ')})` : ''}`)
  }
}

export type RunOptions = {
  env: NodeJS.ProcessEnv
  timeoutMs?: number
  stdin?: string
  /** Most commands print JSON; `--version` prints a bare string. */
  expectJson?: boolean
}

const MAX_OUTPUT = 16 * 1024 * 1024

/** Map td/cli-core error codes onto the few the UI acts on. Unknown codes keep
 *  their message under TD_FAILED so nothing is swallowed. */
export function mapTdErrorCode(code: string): string {
  if (code === 'NO_TOKEN' || code === 'USER_NOT_FOUND' || code === 'NOT_AUTHENTICATED') return 'NO_TOKEN'
  if (/AUTH|SCOPE|UNAUTHORIZED|FORBIDDEN|TOKEN/i.test(code)) return 'AUTH'
  return 'TD_FAILED'
}

/** Parse td's error envelope out of stderr. Tolerates leading noise lines
 *  (warnings td prints before the envelope, e.g. plaintext-storage notices). */
export function parseErrorEnvelope(stderr: string): { code: string; message: string; hints: string[] } | null {
  const start = stderr.indexOf('{"error"')
  const candidates = start >= 0 ? [stderr.slice(start)] : []
  candidates.push(...stderr.split('\n').filter(line => line.trim().startsWith('{')))
  for (const text of candidates) {
    try {
      const parsed = JSON.parse(text.trim()) as { error?: { code?: unknown; message?: unknown; hints?: unknown } }
      if (parsed?.error && typeof parsed.error.code === 'string') {
        return {
          code: parsed.error.code,
          message: typeof parsed.error.message === 'string' ? parsed.error.message : parsed.error.code,
          hints: Array.isArray(parsed.error.hints) ? parsed.error.hints.filter((h): h is string => typeof h === 'string') : [],
        }
      }
    } catch {
      // not this line
    }
  }
  return null
}

function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\u001b\[[0-9;]*[A-Za-z]/g, '')
}

export function runTd(tdPath: string, args: string[], options: RunOptions): Promise<unknown> {
  const { env, timeoutMs = 20_000, stdin, expectJson = true } = options
  return new Promise((resolve, reject) => {
    let child: ReturnType<typeof spawn>
    try {
      // --no-spinner first: it is a GLOBAL flag and must precede the command.
      child = spawn(tdPath, ['--no-spinner', ...args], { env, stdio: ['pipe', 'pipe', 'pipe'] })
    } catch (error) {
      reject(new TdError('TD_NOT_FOUND', String((error as Error).message)))
      return
    }
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn()
    }
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      setTimeout(() => child.kill('SIGKILL'), 1500).unref()
      finish(() => reject(new TdError('TIMEOUT', `td ${args.slice(0, 2).join(' ')} did not answer within ${Math.round(timeoutMs / 1000)} s. The change may still have been saved; refresh to check.`)))
    }, timeoutMs)
    child.stdout!.setEncoding('utf8')
    child.stderr!.setEncoding('utf8')
    child.stdout!.on('data', chunk => { if (stdout.length < MAX_OUTPUT) stdout += chunk })
    child.stderr!.on('data', chunk => { if (stderr.length < MAX_OUTPUT) stderr += chunk })
    child.on('error', error => {
      const code = (error as NodeJS.ErrnoException).code
      finish(() => reject(new TdError(code === 'ENOENT' || code === 'EACCES' ? 'TD_NOT_FOUND' : 'TD_FAILED', error.message)))
    })
    child.on('close', exitCode => {
      finish(() => {
        if (exitCode === 0) {
          if (!expectJson) return resolve(stdout.trim())
          const text = stdout.trim()
          if (!text) return resolve(null)
          try {
            resolve(JSON.parse(text))
          } catch {
            reject(new TdError('BAD_OUTPUT', `td printed something that is not JSON: ${stripAnsi(text).slice(0, 200)}`))
          }
          return
        }
        const envelope = parseErrorEnvelope(stderr)
        if (envelope) return reject(new TdError(mapTdErrorCode(envelope.code), envelope.message, envelope.hints))
        // `env: node: No such file or directory` (exit 127) is the classic
        // "td found, Node missing" case from a Finder-launched app.
        const text = stripAnsi(stderr || stdout).trim()
        if (exitCode === 127 || /env: node|node: No such file/i.test(text)) {
          return reject(new TdError('TD_NOT_FOUND', `td was found but Node.js is not available to run it (${text.slice(0, 160)}). Install Node 24+ or set the td path in settings.`))
        }
        reject(new TdError('TD_FAILED', text.slice(0, 600) || `td exited with code ${exitCode}`))
      })
    })
    if (stdin !== undefined) child.stdin!.end(stdin)
    else child.stdin!.end()
  })
}

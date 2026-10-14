import { spawn, type ChildProcess } from 'node:child_process'

import type { JobKind, JobStatus } from '../src/shared/types'

// Long-running setup jobs: `td auth login` and `brew install todoist-cli`.
//
// WHY detached jobs instead of awaiting them inside an invoke: Agent Code kills a
// service whose invoke exceeds 30 s (serviceHost.ts) and never replays it. A login
// waits for a human in a browser; a brew install downloads Node. Both routinely
// exceed 30 s, and dying mid-OAuth would leave td's callback server orphaned on
// port 8765 and the next attempt failing with "port in use". So `login`/`install`
// return immediately, the child keeps running inside the service, and the UI
// polls `status`, which reports this JobStatus.
//
// One job at a time: a second login while one is waiting would race two OAuth
// callback servers; an install during a login makes no sense.
//
// Process GROUPS, not processes: `brew install` runs curl, git, ruby and
// post-install scripts as children. Signalling only brew left them alive,
// still holding our stdout/stderr pipes, so the job never saw 'close' and sat
// in "running" forever with every later job answered BUSY (review of PR #2,
// reproduced with a parent/worker pair). Each job is spawned `detached`, which
// makes it the leader of its own group, and is stopped with a signal to the
// whole group, escalating to SIGKILL. The job is finished on the leader's
// 'exit', not on 'close', so a straggler holding a pipe cannot wedge it.
//
// Residual, accepted: if the HOST kills this service abruptly (no `stop`), a
// running job's group is orphaned — exactly as a non-detached child would be.
// td's OAuth wait gives up by itself after its own timeout.

type Running = { status: JobStatus; child: ChildProcess; timer: ReturnType<typeof setTimeout> }

/** How long a group gets to exit on SIGTERM before SIGKILL. */
export const KILL_GRACE_MS = 3_000

function signalGroup(child: ChildProcess, signal: NodeJS.Signals): void {
  if (!child.pid) return
  try {
    // Negative pid = the whole process group the detached child leads.
    process.kill(-child.pid, signal)
  } catch {
    // ESRCH: the group is already gone.
  }
}

function stopGroup(child: ChildProcess): void {
  signalGroup(child, 'SIGTERM')
  const escalate = setTimeout(() => signalGroup(child, 'SIGKILL'), KILL_GRACE_MS)
  escalate.unref?.()
}

let current: Running | null = null
let last: JobStatus | null = null

const LIMITS: Record<JobKind, number> = {
  login: 5 * 60_000,
  install: 15 * 60_000,
}

export function jobStatus(): JobStatus | null {
  return current ? { ...current.status } : last
}

export function clearFinishedJob(): void {
  if (!current) last = null
}

/** Authorize URL printed by `td auth login --no-browser-open` (cli-core prints
 *  it before waiting on the callback). */
const AUTHORIZE_URL = /https:\/\/[^\s"']*\/oauth\/authorize\?[^\s"']+/

export type StartJob = {
  kind: JobKind
  command: string
  args: string[]
  env: NodeJS.ProcessEnv
  onUrl?: (url: string) => void
  onDone?: (status: JobStatus) => void
}

export function startJob(job: StartJob): JobStatus {
  if (current) {
    if (current.status.kind === job.kind) return { ...current.status }
    throw new Error(`BUSY: ${current.status.kind === 'login' ? 'Sign-in' : 'Installation'} is still running.`)
  }
  const status: JobStatus = { kind: job.kind, state: 'running', startedAt: Date.now(), authorizeUrl: null, detail: null }
  const child = spawn(job.command, job.args, { env: job.env, stdio: ['ignore', 'pipe', 'pipe'], detached: true })
  let output = ''
  const onData = (chunk: Buffer) => {
    output = (output + chunk.toString('utf8')).slice(-8000)
    if (!status.authorizeUrl) {
      const match = AUTHORIZE_URL.exec(output)
      if (match) {
        status.authorizeUrl = match[0]
        job.onUrl?.(match[0])
      }
    }
  }
  child.stdout?.on('data', onData)
  child.stderr?.on('data', onData)

  const timer = setTimeout(() => {
    status.detail = job.kind === 'login'
      ? 'Sign-in was not completed within 5 minutes.'
      : 'Installation did not finish within 15 minutes.'
    stopGroup(child)
  }, LIMITS[job.kind])

  const finish = (state: JobStatus['state'], detail: string | null) => {
    if (!current || current.child !== child) return
    clearTimeout(timer)
    status.state = state
    status.detail = status.detail ?? detail
    last = { ...status }
    current = null
    job.onDone?.(last)
  }
  child.on('error', error => finish('failed', error.message))
  child.on('exit', code => {
    // Give the last buffered output a moment to arrive (it is how a failure
    // explains itself), but never wait on pipes a straggler may hold.
    setTimeout(() => {
      // Anything the leader left behind (a cancelled brew's curl) goes too.
      signalGroup(child, 'SIGKILL')
      const tail = output.replace(/\u001b\[[0-9;]*[A-Za-z]/g, '').trim().split('\n').slice(-4).join('\n')
      finish(code === 0 ? 'succeeded' : 'failed', code === 0 ? null : tail || `exited with code ${code}`)
    }, 50)
  })
  current = { status, child, timer }
  return { ...status }
}

export function cancelJob(): void {
  if (!current) return
  current.status.detail = 'Cancelled.'
  stopGroup(current.child)
}

/** Service shutdown: no grace period, the process is about to go away. */
export function killJobs(): void {
  if (current) signalGroup(current.child, 'SIGKILL')
}

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

type Running = { status: JobStatus; child: ChildProcess; timer: ReturnType<typeof setTimeout> }

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
  const child = spawn(job.command, job.args, { env: job.env, stdio: ['ignore', 'pipe', 'pipe'] })
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
    child.kill('SIGTERM')
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
  child.on('close', code => {
    const tail = output.replace(/\u001b\[[0-9;]*[A-Za-z]/g, '').trim().split('\n').slice(-4).join('\n')
    finish(code === 0 ? 'succeeded' : 'failed', code === 0 ? null : tail || `exited with code ${code}`)
  })
  current = { status, child, timer }
  return { ...status }
}

export function cancelJob(): void {
  if (!current) return
  current.status.detail = 'Cancelled.'
  current.child.kill('SIGTERM')
}

export function killJobs(): void {
  if (current) current.child.kill('SIGKILL')
}

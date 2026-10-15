import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, afterEach, test } from 'node:test'

import { cancelJob, jobStatus, KILL_GRACE_MS, killJobs, startJob } from '../server/jobs.ts'

// Setup jobs (`brew install`, `td auth login`) spawn children of their own:
// brew runs curl, git and ruby. Review of PR #2 reproduced Cancel signalling
// only brew, leaving the worker alive and holding the pipes, so the job stayed
// "running" forever. These tests use a real parent + worker pair: a shell that
// backgrounds a `sleep` (which inherits stdout) and waits on it.

const dir = await mkdtemp(join(tmpdir(), 'td-jobs-'))
after(() => rm(dir, { recursive: true, force: true }))

const alive = pid => { try { process.kill(pid, 0); return true } catch { return false } }

async function until(predicate, ms, what) {
  const start = Date.now()
  while (!predicate()) {
    if (Date.now() - start > ms) throw new Error(`timed out waiting for ${what}`)
    await new Promise(r => setTimeout(r, 25))
  }
}

let n = 0
async function startWorkerJob({ ignoreTerm = false } = {}) {
  const pidFile = join(dir, `worker-${n++}.pid`)
  const script = `${ignoreTerm ? "trap '' TERM; " : ''}sleep 30 & echo $! > ${pidFile}; wait`
  startJob({ kind: 'install', command: '/bin/sh', args: ['-c', script], env: process.env })
  let worker = null
  const start = Date.now()
  while (!worker) {
    worker = Number((await readFile(pidFile, 'utf8').catch(() => '')).trim()) || null
    if (Date.now() - start > 3000) throw new Error('worker never started')
    await new Promise(r => setTimeout(r, 25))
  }
  return worker
}

afterEach(async () => {
  killJobs()
  await until(() => jobStatus()?.state !== 'running', 5000, 'job cleanup')
})

test('Cancel stops the whole job, workers included, and the job finishes', async () => {
  const worker = await startWorkerJob()
  cancelJob()
  await until(() => jobStatus()?.state !== 'running', 2000, 'the job to finish')
  assert.equal(jobStatus().state, 'failed')
  assert.equal(jobStatus().detail, 'Cancelled.')
  await until(() => !alive(worker), 1000, 'the worker to die')
})

test('a job that ignores SIGTERM is killed after the grace period', async () => {
  const worker = await startWorkerJob({ ignoreTerm: true })
  cancelJob()
  await new Promise(r => setTimeout(r, 300))
  assert.equal(jobStatus().state, 'running', 'premise: SIGTERM is ignored')
  await until(() => jobStatus()?.state !== 'running', KILL_GRACE_MS + 2000, 'SIGKILL escalation')
  await until(() => !alive(worker), 1000, 'the worker to die')
})

test('service shutdown kills a running job’s whole group at once', async () => {
  const worker = await startWorkerJob({ ignoreTerm: true })
  killJobs()
  await until(() => !alive(worker), 1000, 'the worker to die')
  await until(() => jobStatus()?.state !== 'running', 1000, 'the job to finish')
})

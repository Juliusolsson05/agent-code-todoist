import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import { TodoistApi, TodoistRequestError } from '@doist/todoist-sdk'

import type { Located } from './locate'
import { TdError } from './run'

// The service's long-lived Todoist API client.
//
// WHY not `td` per request any more (owner decision A, 2026-10-15): every td
// call is a fresh Node process — ~220–360 ms before its first HTTP request —
// and td adds lookups we do not need (a GET before every write, /user before
// Inbox, the task fetched twice for its comments). Seven evaluators measured
// beta.4: completing one task cost 5 td processes; the same Today request
// through a warm SDK client took 4.4 ms instead of ~357 ms. td itself is a
// wrapper around this exact SDK (@doist/todoist-sdk, the version td 5.4.10
// ships), so the wire contract does not change.
//
// td stays the owner of the ACCOUNT: locating it, OAuth sign-in/out, auth
// status, and storing the token in the macOS Keychain. We borrow the token
// through its supported `td auth token view` command, keep it in this
// process's memory only, and never return, log, store or pass it as argv.

type Client = { api: TodoistApi; key: string }

let client: Client | null = null

/** Forget the client (and with it the token): sign-out, AUTH errors, identity
 *  or td-path changes. The next request reads the token again. */
export function dropClient(): void {
  client = null
}

/**
 * The token td would use, without going through a JSON parser that could echo
 * it into an error (run.ts BAD_OUTPUT prints the start of stdout).
 *
 * Precedence mirrors td's own: an explicit TODOIST_API_TOKEN in td's
 * environment wins (td refuses `token view` then — "TOKEN_FROM_ENV"), else the
 * stored account td is signed into.
 */
async function readToken(found: Located): Promise<string> {
  const fromEnv = found.env.TODOIST_API_TOKEN?.trim()
  if (fromEnv) return fromEnv
  const token = await new Promise<string>((resolve, reject) => {
    const child = spawn(found.path, ['--no-spinner', 'auth', 'token', 'view'], { env: found.env, stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    let err = ''
    child.stdout.on('data', chunk => { out += chunk })
    child.stderr.on('data', chunk => { err += chunk })
    const timer = setTimeout(() => child.kill('SIGKILL'), 10_000)
    child.on('error', () => { clearTimeout(timer); reject(new TdError('TD_NOT_FOUND', 'The Todoist CLI (td) could not be started.')) })
    child.on('close', () => {
      clearTimeout(timer)
      const value = out.trim()
      // A token is one line of URL-safe characters. Anything else is td
      // explaining a problem; classify it without repeating stdout.
      if (/^[A-Za-z0-9._-]{20,}$/.test(value)) return resolve(value)
      if (/NO_TOKEN|not (logged|signed) in|no (saved )?token/i.test(err)) return reject(new TdError('NO_TOKEN', 'Not signed in to Todoist.'))
      reject(new TdError('AUTH', 'td did not hand over a Todoist token. Sign in again.'))
    })
  })
  return token
}

export async function api(found: Located, generation: number): Promise<TodoistApi> {
  const key = `${generation}|${found.path}`
  if (client?.key === key) return client.api
  const token = await readToken(found)
  const next = { api: new TodoistApi(token), key }
  client = next
  return next.api
}

/** A fresh X-Request-Id for one write. The SDK retries network errors up to
 *  three times, and Todoist ignores a repeated request id, so a retried write
 *  can never apply twice — the "never replay a write" rule, kept. */
export const requestId = (): string => randomUUID()

/** SDK and network failures → the error codes the UI branches on. */
export function mapApiError(error: unknown): TdError {
  if (error instanceof TdError) return error
  if (error instanceof TodoistRequestError) {
    const status = error.httpStatusCode
    const detail = describe(error.responseData) ?? error.message
    if (status === 401) {
      dropClient()
      return new TdError('AUTH', 'Todoist rejected the saved sign-in (401). Sign in again.')
    }
    // 403 is NOT a sign-in problem: a read-only token writing, or a shared
    // project without permission. AUTH would swap the pane to the sign-in
    // screen (and suppress the toast) while the token is perfectly valid.
    if (status === 403) return new TdError('TD_FAILED', `Todoist refused this (403): ${detail}`)
    if (status === 404) return new TdError('TD_FAILED', 'That item no longer exists in Todoist.')
    if (status === 429) return new TdError('TD_FAILED', 'Todoist is rate-limiting requests; try again in a moment.')
    if (status && status >= 500) return new TdError('TD_FAILED', `Todoist had a server error (${status}).`)
    if (status) return new TdError('TD_FAILED', detail)
    return new TdError('TD_FAILED', `Could not reach Todoist: ${error.message}`)
  }
  return new TdError('TD_FAILED', (error as Error)?.message ?? String(error))
}

function describe(data: unknown): string | null {
  if (!data) return null
  if (typeof data === 'string') return data.slice(0, 300)
  if (typeof data === 'object') {
    const value = (data as { error?: unknown; error_tag?: unknown }).error
    if (typeof value === 'string') return value.slice(0, 300)
  }
  return null
}

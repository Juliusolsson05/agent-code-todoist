# Todoist inside Agent Code

**Status:** in progress · **Size:** long plan (new repo, native service, full UI) · **Mode:** full build
**Repo:** `Juliusolsson05/agent-code-todoist` (private until the owner decides; local: `~/Desktop/Development/agent-code-todoist`,
worktree `.worktrees/todoist-in-agent-code`, branch `feat/todoist-in-agent-code`) · **Issue:** #1
**Host:** Agent Code as shipped on 2026-10-14 (`d0c3df99`), extension SDK `v0.11.0`. **No host changes.**

## Outcome

The user said: "build out an extension that will bundle Todoist into the application, probably using the
CLI … make sure it bakes in all functionality and that the UI is really good … this should work out of the
box with the current features we are shipping with the extension system."

Installing this extension gives Agent Code a first-class Todoist pane:

- Sidebar navigation: Today, Upcoming, Inbox, Completed, every project (nested, coloured), labels, saved
  filters, and search.
- Task list grouped the way Todoist groups it (Overdue / Today; by date for Upcoming; by section for a
  project), with priority-coloured checkboxes, due/deadline/duration/recurring/labels/project metadata.
- A natural-language quick-add bar (`Review PR tomorrow 3pm p1 #Work @review`) with live token
  highlighting, plus a structured add form.
- A task detail drawer: edit title, description, due, deadline, duration, priority, labels; move to
  project/section; subtasks; comments (read and post); complete, reopen, delete, open in Todoist.
- Create projects, sections and labels from the sidebar.
- Optimistic completion with Undo; keyboard-first navigation.
- A separate Quick Add modal reachable from the command palette (and an optional chord), which can link
  the new task to an agent that is open in the current tab.
- Optional background "task is due now" toasts.
- Guided setup for the two prerequisites: the `td` CLI (offer `brew install todoist-cli`) and sign-in
  (`td auth login`, the browser OAuth flow; token lands in the macOS Keychain).

Assumed (not said by the user; defaults from the decision list in chat, accepted with "lets build it"):
CLI via a bundled service (1A), button-driven sign-in (2), read-write (3), panel + modal + commands (5),
refresh while visible (6), separate repo with id `todoist` (7). Decision 4 was widened by the user from
"v1 scope" to "all functionality". Decision 9 (install `td` here / user signs in to record fixtures) was not
answered — see **Verification boundary**.

## Evidence (verified 2026-10-14, do not re-derive)

### The CLI
- Official CLI: `@doist/todoist-cli` 5.4.10 (npm, MIT), binary `td`, Homebrew `todoist-cli` 5.4.9
  (depends on Homebrew `node`). `engines.node >= 24`. Bin script is `dist/index.js` with a
  `#!/usr/bin/env node` shebang, so whichever `node` is first on PATH runs it.
- Auth: `td auth login` = OAuth PKCE in the browser, callback on `localhost:8765` (small fallback range),
  token stored via `@napi-rs/keyring` in the OS credential store. `TODOIST_API_TOKEN` overrides.
  `--no-browser-open` prints the authorize URL instead of opening it. `--read-only` requests `data:read`.
- Machine output: `--json` on every command we use. Lists print `{"results":[…],"nextCursor":string|null}`
  (`formatPaginatedJson`, `dist/lib/output.js:429`). `--full` emits the whole SDK entity instead of the
  "essential fields" projection. Entities are camelCase SDK objects (Date fields serialised to ISO strings).
- Errors: exit code 1, JSON envelope on **stderr**:
  `{"error":{"code":"NO_TOKEN","message":"…","hints":["…"]}}` — recorded verbatim while signed out
  (`tests/fixtures/td-signed-out-*.json`).
- Mutations without an entity (`complete`, `uncomplete`, `delete`, `archive`) print
  `{"ok":true,"command":…,"messages":[…]}` under `--json`; `add`/`update`/`quickadd`/comment `add` print the
  entity. Destructive commands need `--yes`.
- `td --help --json` dumps the whole command tree (191 KB, recorded once into the scratchpad, flags below are
  copied from it):
  - `today|upcoming [days]|inbox`: `--limit --cursor --all --json --full`
  - `completed list`: `--search --since --until --project --limit --cursor --all --json --full`
  - `task list`: `--project --parent --label --priority --due --filter <query> --limit --cursor --all --json --full`
  - `task view <ref>`: `--json --full --include-children`
  - `task add [content]`: `--due --deadline --priority p1-p4 --project --section --labels a,b --parent
    --description --duration --json`
  - `task quickadd <text>`: `--json` (natural-language parser server side)
  - `task update <ref>`: `--content --due/--no-due --deadline/--no-deadline --priority --labels/--no-labels
    --description --duration --json`
  - `task move <ref>`: `--project --section --parent --no-parent --no-section --json`
  - `task complete|uncomplete|delete <ref>` (`--yes` for delete) `--json`
  - `project list|create|update|archive|delete`, `section list [project]|create`, `label list|create`,
    `filter list|view`, `comment list <task ref>|add <task ref> --content`
  - `auth status|login|logout --json`; status success = `{id,email,fullName,authMode,authScope,…}`
- Refs accept `id:<id>`, a name, or a Todoist URL. We always pass `id:<id>` so names can never be
  fuzzy-matched to the wrong entity.
- Cost: `td` cold start ≈ 0.32–0.62 s on this machine before any network.
- SDK entity shapes are zod schemas in `@doist/todoist-sdk` 15.3.1 (`TaskSchema`, project/label/section/
  comment schemas) and the SDK ships its own test defaults (`dist/esm/test-utils/test-defaults.js`). Colour
  keys map to hex in `dist/types/utils/colors.d.ts` (berry_red #b8255f … taupe #ccac93).

### The host (agent-code `d0c3df99`)
- Services: `utilityProcess.fork(entry, [], {stdio:'ignore'})` (`src/main/extensions/serviceHost.ts:34`),
  inherits main's env. Ready deadline 10 s, **invoke deadline 30 s → on timeout the host KILLS the service**
  (unknown outcome is never replayed), ≤ 32 pending invokes, start is explicit and idempotent.
- Main's `PATH` is rebuilt in `src/main/setup/toolchain.ts:applyToolEnv` = dirs of resolved provider CLIs +
  `/opt/homebrew/bin` + `/usr/local/bin` + the inherited (Finder: minimal) PATH. An nvm-only `td` is **not**
  on it.
- Runtime/view bridge: ≤ 4096 JSON values, depth 32, 128 Ki characters per message; startup deadline 10 s;
  invocation 30 s.
- Views: sandboxed frame, no network, no popups / top-level navigation. CSS must be injected by the view.
  `--theme-*` tokens are pushed before mount. Escape closes the view unless `preventDefault()`.
- Commands whose id equals a view id open that view (`apps/host/derive.ts`). Keybinding contributions are
  dropped when they collide with a first-party chord (`extensionMayClaim`).
- Settings contributions are written to the extension's own storage under the full setting id; the manifest
  default is display-only.
- Permissions used here and what they buy:
  - `service.run` — start/invoke the bundled `td` bridge (native, unsandboxed; consent dialog says so).
  - `notifications.show` — due-now toasts from the background runtime.
  - `sessions.observe`, `workspace.observe`, `panes.observe` — "link this task to an agent in the current tab".

## Architecture

```
 view frame (React)            runtime frame (hidden)               service (Node child)
 ───────────────────           ──────────────────────               ────────────────────
 Panel  ─ request(name,in) ──▶ TodoistRuntime                       td-bridge
 QuickAdd modal               • owns service start (single)         • locate td (setting → PATH →
       ◀─ publish(state) ───  • routes requests → services.invoke     login-shell probe → known dirs)
                              • bumps `revision` after mutations    • execFile(td, args) no shell,
                              • polls due tasks (opt-in setting)      20 s cap, JSON parse, error map
                              • reads settings from storage         • compacts entities to Row types
                                                                    • login / brew install as detached
                                                                      jobs, polled via `status`
                                                                    • openUrl (http/https only)  
```

Why the runtime sits in the middle instead of views invoking the service directly: two views (panel and
modal) must agree that a mutation happened. The runtime is the only context that sees every mutation and can
publish one `revision` that every view subscribes to, so the panel refreshes after a modal quick-add without
polling. It also gives the service exactly one owner for start/stop.

Why a native service at all: the sandbox cannot spawn processes, and the user asked for the CLI. The service
is the only shipped mechanism that can run `td`; using it means the extension never sees or stores the
Todoist token (it stays in the Keychain, owned by `td`).

Why long operations are jobs: `td auth login` waits for the human in a browser and `brew install` can take
minutes. Any invoke over 30 s gets the whole service killed by the host, so these are spawned detached,
tracked in the service, and the UI polls `status`.

### Service RPC contract (`todoist.td`)

All handlers take/return JSON. Errors reject with `TdError` text `"<CODE>: <message>"` so the runtime can
map them (`NO_TOKEN` → setup screen, `TD_NOT_FOUND`, `TIMEOUT`, `TD_FAILED`).

| name | params | result |
| --- | --- | --- |
| `status` | `{ tdPath?: string }` | `SetupStatus` |
| `install` | `{}` | `SetupStatus` (starts brew job) |
| `login` | `{ readOnly?: boolean }` | `SetupStatus` (starts login job; `authorizeUrl` once known) |
| `cancelJob` | `{}` | `SetupStatus` |
| `logout` | `{}` | `SetupStatus` |
| `meta` | `{}` | `Meta` = `{ projects: ProjectRow[], sections: SectionRow[], labels: LabelRow[], filters: FilterRow[], user }` |
| `list` | `ListQuery` | `TaskPage` = `{ tasks: TaskRow[], nextCursor: string|null, truncated: boolean }` |
| `task` | `{ id }` | `TaskDetail` = `{ task: TaskRow, children: TaskRow[], comments: CommentRow[] }` |
| `quickAdd` | `{ text }` | `TaskRow` |
| `add` | `TaskDraft` | `TaskRow` |
| `update` | `{ id } & TaskPatch` | `TaskRow` |
| `move` | `{ id, projectId?, sectionId?, parentId? , noSection?, noParent? }` | `{ ok: true }` |
| `complete` / `uncomplete` / `delete` | `{ id }` | `{ ok: true }` |
| `comment` | `{ taskId, content }` | `CommentRow` |
| `createProject` | `{ name, color?, parentId?, favorite? }` | `ProjectRow` |
| `createSection` | `{ projectId, name }` | `SectionRow` |
| `createLabel` | `{ name, color? }` | `LabelRow` |
| `openUrl` | `{ url }` | `{ ok: true }` (http/https only) |

`ListQuery` = `{ kind: 'today'|'upcoming'|'inbox'|'project'|'label'|'filter'|'search'|'completed', id?, query?, cursor? }`.

`TaskRow` (compact, ≈ 15 JSON values) = `{ id, content, description, priority(1-4 API), due: {date, datetime,
string, recurring} | null, deadline: string|null, duration: {amount, unit}|null, projectId, sectionId,
parentId, labels[], order, commentCount, completedAt|null, url }`.

Budget rule (`src/shared/budget.ts`): every reply is measured with the host's own rules (JSON value count
and string length); task pages are trimmed from the end until they fit 3500 values / 110 000 chars and then
flagged `truncated` with the cursor preserved. This keeps a 300-task Today view from failing at the bridge.

### Runtime contract (`views.publish('todoist.main' | 'todoist.quickAdd', HostState)`)

`HostState` = `{ revision: number, setup: SetupStatus, settings: Settings, lastError: string|null }`.
View requests: every service RPC name above (`runtime.request(name, input)`), plus `settings` and
`agents` (current tab's agent sessions: `{id, title, cwd, kind, activity}`).

### UI (view frames)

- `src/view/App.tsx` — layout: sidebar (collapsible, auto-collapsed under 640 px), header with view title,
  count and refresh, quick-add bar, list, detail drawer (right; full-width sheet under 760 px).
- `SetupScreen` — states: `checking`, `td-missing` (Install with Homebrew / copy npm command / set path /
  check again), `installing` (live elapsed timer), `signed-out` (Sign in with Todoist, read-only toggle),
  `signing-in` (authorize URL shown with Open again / Cancel), `error`.
- `TaskList` + `TaskRow` — grouped, keyboard focus ring, hover actions (schedule, priority, more).
- `QuickAddBar` — token highlighter for `p1-p4`, `#project`, `@label`, `/section`, natural dates.
- `TaskDetail` — inline-editing fields, label picker, project/section picker, subtasks, comments.
- `QuickAddModal` (second view entry) — big input, agent link chips, "Add" / "Add and open".
- Styling: one CSS file using `--theme-*` tokens only (never `--color-*`), Todoist priority hues
  (#d1453b / #eb8909 / #246fe0), project colours from the SDK palette.
- Keyboard: `j/k` or arrows move, `x`/space complete, `Enter` open, `e` edit title, `1-4` priority,
  `t` schedule today, `q` or `a` focus quick add, `/` search, `r` refresh, `Esc` close drawer (and
  `preventDefault` so the host does not close the pane).

## Tasks

1. **Scaffold** — `package.json`, `tsconfig.json`, `vite.config.ts` (SDK preset, two view entries + runtime),
   esbuild service build, `.gitignore` (dist committed), manifest. Hands to 2: `ExtensionManifest` JSON.
2. **Shared model** (`src/shared/`) — `types.ts` (Row types, SetupStatus, ListQuery, HostState),
   `budget.ts` (`countJsonValues`, `fitTasks`, `pageOf`, `toJson`), `colors.ts`, `dates.ts` (group/format due dates against a
   supplied `now`), `quickAddTokens.ts` (highlight spans).
3. **Service** (`server/`) — `locate.ts` (`locateTd(settingPath)`), `run.ts` (`runTd(args, opts)` →
   parsed JSON or `TdError`), `compact.ts` (SDK entity → Row), `jobs.ts` (login / install), `handlers.ts`
   (RPC table), `service.ts` (SDK `runService`).
4. **Runtime** (`src/runtime.ts`) — start service on first request, request router, revision publishing,
   settings, agents, due-reminder poller.
5. **Views** — panel (`src/view.tsx`) and quick-add modal (`src/quickAddView.tsx`) with the components above.
6. **Tests** (`tests/*.test.mjs`, `node --test`) and dev preview (`dev/`): see Tests.
7. **README** (install, prerequisites, permissions explained, keyboard map, troubleshooting).

## Tests

Runner: `dev/test.mjs` bundles each `*.test.mjs` with esbuild (packages external) and runs `node --test` — the
Skitgubbe pattern. Fixture provenance: `tests/sdk.mjs` builds td's `--json --full` output from
`@doist/todoist-sdk` 15.3.1's own test defaults run through its own zod schemas; the signed-out stderr envelope
is the recorded file `tests/fixtures/td-5.4.10-signed-out-today.stderr`.

- `tests/compact.test.mjs` — every field the UI reads, against SDK entities; due timestamp split; priority stays
  API-numbered; nulls never undefined; degraded input; description clipping; project/section/label/comment.
- `tests/run.test.mjs` — `runTd` against fake td executables: recorded NO_TOKEN envelope, JSON success, hostile
  argv survives as one element, stdin quick add, TIMEOUT kill, missing binary, missing Node (exit 127),
  non-JSON stdout.
- `tests/handlers.test.mjs` — the exact argv the handlers build (`--flag=value`, `id:` refs, p1 mapping, label
  comma, `--no-*` clears), id validation, an oversized page delivered whole in chunks with its cursor, the
  per-request deadline (slow failure not retried, hang cut at the budget, fast failure retried), openUrl scheme
  refusal.
- `tests/jobs.test.mjs` — setup jobs against a real parent + worker process pair: Cancel kills the whole group,
  SIGTERM-ignoring jobs are SIGKILLed after the grace period, shutdown kills at once.
- `tests/status-race.test.mjs` — two fixture tds (accounts A slow, B fast): a late answer from the old td does not
  replace the new account's user.
- `tests/model.test.mjs` — budget constants equal the host's, a 300-task page crosses in legal parts and
  reassembles exactly, surrogate-safe splitting, `toJson`, local-day semantics, Today/Upcoming grouping order,
  quick-add token kinds, boundaries and the ` // description` marker, the quick-add follow-up planner, saved-filter
  completeness (`filterPage` on td's two JSON shapes), the agent-session filter.
- `testing/extension-contract.test.mjs` (`npm run test:extension`, builds first) — manifest namespacing and view
  reachability, exact permission list, committed entries export their contracts with no `jsxDEV`, and the
  built service answers `status`/rejects bad input over the real SDK `runService` wire.
- **Integration (`npm run test:integration`, owner request mid-build):** the pinned real `td` 5.4.10 binary
  (devDependency) runs end to end against `tests/support/fakeTodoist.mjs`, a stateful fake of the Todoist API v1.
  - Interception: the SDK's undici `EnvHttpProxyAgent` honours `HTTPS_PROXY`, and Node honours
    `NODE_EXTRA_CA_CERTS`. `tests/support/interceptor.mjs` mints a throwaway CA with openssl and terminates TLS
    for `api.todoist.com` locally. Every proxy env case is set, because undici prefers the lowercase name and an
    inherited `https_proxy` once sent test traffic to the real API.
  - Payloads come from Doist's official OpenAPI examples (`tests/support/openapi.mjs`, pruned spec vendored by
    `dev/vendor-openapi.mjs` with its sha256).
  - Suites:
    - `integration/reads` — every list kind, meta, sections, task detail, unicode, clipping, cursor pagination.
    - `integration/writes` — every mutation's exact API body plus the state on the next read.
    - `integration/faults` — revoked token, 429, 5xx, a failed write is never replayed, 404, malformed and future
      payloads, hung API, dead network, no token in messages.
    - `integration/runtime` — the real runtime in a simulated host (`tests/support/host.mjs`) whose messages pass
      a copy of Agent Code's `isExtensionJson` (`tests/support/bridge.mjs`), calling the service through its real
      request door (`server/invoke.ts`); plus scripted-service cases for account switches, stale status answers,
      the Settings-page watcher, reminder paging/windows/rescheduling and the quick-failure-only retry.
    - `integration/large` — a 300-project/200-label account, a task with 50 × 4,000-char comments, a 130-task
      list with 20 labels each, a multi-query saved filter — all through `tests/support/viaBridge.mjs`.
    - `integration/golden` — a saved transcript of 21 operations' requests and rows
      (`tests/fixtures/golden/td-5.4.10.json`, days normalised, `UPDATE_GOLDEN=1` re-records and refuses
      failures).
  - Files run one at a time, because parallel `td` processes on a loaded machine hit the 20 s deadline.
- **UI (`npm run test:ui`, added from review):** `uitests/ui.test.mjs` mounts the real view modules in Chromium
  (`dev/harness.html`) with their runtime requests forwarded over Playwright to the real runtime → service → td →
  fake API. The harness registers Agent Code's frame Escape listener first, exactly as `frameDocument.ts` does, so
  "Esc closed the pane" is observable. One case per UI review finding, plus rapid entry and failed-add recovery.
- Dev preview (`npm run preview`, `npm run shots`): the real view modules against `dev/fakeHost.ts` with Agent
  Code's Nord and Light token values; screenshots reviewed for every state.

## Verification

- `npm run typecheck`, `npm test`, `NODE_ENV=production npm run build`, `npm run test:extension`.
- Visual review of dev-preview screenshots (narrow pane, wide pane, drawer, setup states, modal).

## Verification boundary

- Agent Code itself is not launched here (standing rule). Install via Settings → Extensions and the consent
  dialog are verified only by the contract test, not in the app; the owner is trying `v0.1.0-beta.1` live.
- No authenticated `td` output was recorded: `td` is not installed globally and nobody is signed in. The
  signed-out envelopes are real; signed-in shapes come from the SDK's own schemas/defaults. Recording live
  fixtures needs the user to run `td auth login` — `npm run record` is provided for that and redacts.
- Login/browser and Homebrew install jobs are exercised only with fake binaries.

## Out of scope

- Sending a task to an agent as a prompt (no host capability for prompt delivery exists).
- Reminders management, attachments upload, workspaces/folders admin, sharing/collaborators, templates,
  backups, billing, activity log (all reachable in Todoist proper via "Open in Todoist").
- Multi-account switching UI (td supports it; we use td's default account and show which one).

## Rulings

- Ruling: always pass `id:<id>` refs to `td` — names fuzzy-match and could edit the wrong task — cost if wrong: none.
- Ruling: lists use `--full` and compact service-side — essential projection lacks `childOrder`, `noteCount`,
  `completedAt` the UI needs — cost: bigger stdout inside the service only.
- Ruling: Quick Add chord `cmd+alt+t` — **UNCONFIRMED** product call; verified unbound in agent-code `defaults.ts` today, and the host drops it if first-party later claims it.
- Ruling: ids must start alphanumeric (`/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/`) — caught by a test: `--yes` passed the
  first regex; harmless behind `id:` but it is the value interpolated into every mutation — cost: none (Todoist ids
  are numeric/base32).
- Ruling: quick-add `#`/`@` tokens need whitespace before them and a date needs a real sentence boundary after —
  caught by tests: `jane@example.com` was highlighted as a label, `Monday.com` as a date — cost: a rare true token
  glued to punctuation is not highlighted (hint layer only; Todoist still parses it).
- Ruling: GitHub repo is **public** (owner, 2026-10-14). It started private, but Agent Code downloads the
  release tarball WITHOUT the gh token (it only authenticates the API lookups), so a private repo cannot be
  installed at all. Betas are published as normal (not pre-) releases because the installer resolves
  `releases/latest`, which skips pre-releases.
- Ruling: sections load per project (`sections` RPC + view cache) — `td section list` refuses to run without a
  project; the first version's account-wide call silently returned nothing (found by the integration run).
- Ruling: the service retries a failed READ once, never a write — td does not retry a transient 5xx; replaying
  a write could duplicate a task.
- Ruling: AUTH (revoked token) re-checks setup like NO_TOKEN — otherwise every action toasted HTTP 401.
- Ruling: Completed asks for the last 14 days — td's default window is today only.
- Ruling: due-now toasts default OFF — background polling spawns `td` every few minutes; opt-in only.
- Ruling: `openUrl` accepts http(s) only — the service is unsandboxed and must not open `file:`/custom schemes;
  any web host is allowed because links inside users' own tasks (PRs, docs) would otherwise be dead in the
  sandboxed frame. (Changed during build from "Todoist origins only".)

- Ruling: replies too large for one bridge message are CHUNKED, never trimmed (`src/shared/budget.ts`, `server/invoke.ts`)
  — trimming dropped td's cursor and nothing bounded `meta`/`task`, and an invalid reply makes the host kill the
  service — cost: a large reply costs one extra request per 96k characters.
- Ruling: one 25 s deadline per service request (`INVOKE_BUDGET_MS`), shared by every td call in it, retries
  included; the runtime restarts-and-retries a read only if the failure came within 2 s — the host kills the
  service at 30 s and retires the whole runtime when a view request passes 30 s.
- Ruling: saved filters load up to 1000 tasks in one go and say "showing the first N" when more may exist — td
  cannot page multi-query or sorted filters — cost: a >1000-task filter is partial (and says so).
- Ruling: quick add sends the typed line untouched and applies view/picker intent afterwards from the RETURNED
  task (`src/shared/quickAddPlan.ts`) — appending syntax corrupted ` // description` lines and the tokenizer
  mis-routed `#123` — cost: one extra td call when the parser did not already apply the intent.
- Ruling: the pane opens on the "Open on" setting every time; the last view is no longer remembered — otherwise
  the setting did nothing after the first session.
- Ruling: Escape is handled on `document` in the bubble phase (`src/ui/keys.ts`) — the host's own `window`
  listener runs before any later `window` listener, so our preventDefault was too late.

## Review of PR #2 (one round: Codex on the service and runtime, Claude on the UI, host contract and tests)

Both reviewers gave the verdict FIX-BEFORE-MERGE. Every finding was checked against the code before it was fixed. Each fix has a regression test, and each test was mutation-checked: the fix was reverted and the test went red. All 22 mutations were caught.

| # | Finding | Verdict | Disposition |
|---|---|---|---|
| S1 | `meta` (300 projects + 200 labels) and `task` (50 × 4k comments) exceed the bridge, so the host kills the service | valid, P1 | fixed in `b163be7`: replies are chunked, never trimmed (`integration/large`) |
| S2 | A retried read can outlive the host's 30 s | valid, P1 | fixed in `b163be7`: one 25 s deadline per request; the runtime retries only quick failures |
| S3 | Filters and trimmed pages lose tasks with no "Load more" | valid | fixed in `b163be7`: no trimming; multi-query and sorted filters report `truncated` |
| S4 | Cancel and quit leave setup-job workers alive, and the job sticks at "running" | valid | fixed in `b163be7`: process groups, finish on exit, SIGKILL escalation (`tests/jobs`) |
| S5 | Changing the td path or account leaves stale views; Settings-page path edits are ignored | valid | fixed in `b163be7`: identity-based reload, and the watcher re-locates `td` |
| S6 | A late status answer overwrites the new account's user | valid | fixed in `b163be7`: a configuration generation in the service plus a sequence in the runtime |
| S7 | Due reminders read only page 1 of Today | valid | fixed in `b163be7`: follows up to 10 pages |
| S-tz | Floating times use the device timezone, not the account's | overstated | declined: per the API spec, a floating time *is* wall-clock local, and fixed-zone times arrive as `Z` |
| S-crash | A login can be orphaned if the host kills the service abruptly | valid, residual | accepted and documented in `server/jobs.ts`; a non-detached child is orphaned the same way |
| S-flake | One delete timed out under the reviewer's concurrent load | not reproduced | integration runs green sequentially, locally and on CI; files already run one at a time |
| F1 | Esc closes the whole pane when a drawer, help or search is open | valid, high | fixed in `b6d256f`: handler moved to `document` (`src/ui/keys.ts`) |
| F2 | Quick add puts " today" or " p1" inside a ` // description` | valid, high | fixed in `b6d256f`: line sent untouched, intent applied from the returned task |
| F3 | A partial quick-add failure invites a duplicate | valid | fixed in `b6d256f`: `PartialAdd` message; input cleared; never re-added |
| F4 | `#123` cancels the project move | valid | fixed in `b6d256f`: decided from the returned project |
| F5 | A double click completes a recurring task twice | valid | fixed in `b6d256f`: in-flight guard per task |
| F6 | The drawer paints "completed" after a failure, or for a recurring task | valid | fixed in `b6d256f`: drawer reloads on success and on every revision |
| F7 | Enter and Space are taken from focused buttons | valid | fixed in `b6d256f`: `isActivatable` exemption |
| F8 | A mutation discards loaded pages | valid | fixed in `b6d256f`: refresh reloads as many pages as were shown |
| F9 | The "Open on" setting has no effect after the first session | valid | fixed in `b6d256f`: last view is no longer persisted |
| F10 | Agent sessions with no kind are hidden | valid | fixed in `b6d256f`: `isAgentSession` excludes only `terminal` and `extension-view` |
| F11 | The description draft is lost when switching tasks | valid | fixed in `b6d256f`: an open editor saves on unmount |
| F12 | No Cancel button for a sign-in without a URL, or for an install | valid | fixed in `b6d256f` |
| F13 | A failed create clears the form | valid | fixed in `b6d256f` |
| F14 | Label view appends `@"name with spaces"` | valid | fixed in `b6d256f`: labels are applied by update, not as text |
| Sus-1 | The fake returns 204 where the spec says 200 + `{}` | valid (test fidelity) | the fake now follows the spec; a 204 case is kept in `faults` |
| Sus-2 | Title double save on Enter then blur | valid | fixed: a ref-guarded save (UI test asserts exactly one update) |
| Sus-3 | A rollback overwrites a later edit | valid | fixed: reload on failure |
| Sus-4 | Timed tasks from earlier today are listed under Overdue | product call | declined: the existing tested intent is kept |
| Sus-5 | An unknown `@label` in quick add | not a defect | declined: meta refetches on the revision bump |
| Sus-6 | Search Esc leaves "Search: …" as the title | valid | fixed in `b6d256f` |
| Fidelity | The fake's quick-add parser, `resolveDue`, and the UI having no tests | valid | fixed: spec-faithful parser, bad due strings rejected, `uitests/` (15 cases) |
| Mutants | R5, R9, R10, R11 and the job/PATH survivors | valid | covered: new runtime, jobs and PATH tests, each mutation-checked |
| New | The quick-add bar wiped text typed while an add was still in flight (found by the UI suite) | valid | fixed in `b6d256f`: field cleared at submit |

## Additions after the first beta (owner requests, 2026-10-14)

- **Todoist: Open in Modal** (`todoist.window`, `src/windowView.tsx`): the same `App` with `variant="modal"`.
  The host sizes a modal from its content (agent-code `frameDocument.ts` reportSize), so the modal root has a
  fixed natural size (1100×720; the host scales it down on small windows) instead of the pane's `100vh`, and the
  header gains a close button. The runtime publishes to all three views.
- **Delete from the keyboard:** ⌫/Delete on the focused task, or the row's trash button, opens a confirmation
  (Delete focused: Enter confirms; Esc cancels and never reaches the host). Ruling: confirm, not undo — Todoist's
  API has no undelete — cost: one extra keystroke.
- Tests: `uitests/` cases for both, each mutation-checked.
- Small review round (Codex) on the additions. Its verdict was FIX-BEFORE-MERGE. All six findings were valid and are
  fixed in the next commit, each with a mutation-checked UI test:
  | Finding | Disposition |
  |---|---|
  | ⌫ in a child's drawer deleted the parent the list had focused | the drawer's task wins (`openId ?? focused`) |
  | Esc did not cancel the confirmation while a picker was open | the dialog owns Escape (document capture); ⌫ is ignored inside pickers |
  | A late delete failure refetched the old view into the new one | recovery refreshes the CURRENT view (`viewRef`) |
  | The count omitted sub-tasks hidden by the filter | the count comes from the server's task detail; "and any sub-tasks" until it arrives |
  | Focus went to a deleted child | successor = next SURVIVING task; the whole subtree is removed at once |
  | Tab escaped the dialog | Tab is trapped, `aria-modal` set, focus restored (found while fixing: focus was captured after autoFocus) |
  Not added: a read-only-account test (the fake world cannot sign td in read-only); the guard is the same
  `user.readOnly` check that already hides every write control.

- **Todoist look by default** (owner, 2026-10-15): Todoist's own design tokens, light and dark, read from
  app.todoist.com's computed styles (`.theme_todoist`, `.theme_dark`), plus its system font stack and logo, applied
  through `data-td-theme="todoist"` in `src/styles.css`. Light or dark follows Agent Code's canvas luminance.
  The setting "Use Agent Code's colours" (`todoist.inheritTheme`, boolean) restores the host-token mapping.
  Ruling: a boolean, not a theme picker — Agent Code settings have no enum type — cost: none for two choices.
  Ruling: priority colours become CSS variables because Todoist's dark priorities differ (#ff7066 etc.).

## Snappiness evaluation (2026-10-15, seven evaluators, verified, do not re-derive)

The owner reported that the UI "is glitchy and does not feel snappy" and is "half assed compared to the vision".
Seven evaluators (Codex 1/3/5/7, Claude 2/4/6) measured beta.4 (`b1a0651`) through the real harness. Their reports are
in `.worktrees/eval-briefs/report-*.md`, which is git-ignored, with probes under `/tmp`. The causes agree across reports:

1. **One fresh `td` process per request.** A `td` call costs about 220–360 ms before its first HTTP request.
   A warm `@doist/todoist-sdk` client making the same Today call took 4.4 ms median (eval 3). `td` also adds
   lookups: a GET before every write, `/user` before Inbox, and a re-GET of the task for comments.
   A detail view with 25 children costs 29 HTTP requests through `td`, against 3 through the SDK.
2. **Every mutation refetches everything.** One global `revision` makes each view reload the list, `meta`
   (3 `td` processes), sections, and an open drawer. Completing one row costs 5 `td` processes and 7 HTTP requests.
   Quick add in Today costs 10 and 13. With pane + modal + Quick Add open, one completion costs 12 `td` processes
   (evals 2, 3, 6, 7).
3. **Optimism is incomplete or wrong.**
   - Completion clears its marker after a 650 ms timer, so the row shows unchecked again before it leaves.
     This lasts up to 1.8 s with fast clicks (evals 2, 4, 5, 6).
   - Undo removes the row first and only then brings it back.
   - Quick add, reschedule and move wait for the server.
   - The drawer opens on a skeleton, even though the row already has its data, and re-skeletons on every j/k.
4. **Visible churn.** One `loading` flag hides the count, spins Refresh and hides "Add section" on every background
   refetch. Each view switch flashes the empty state and "0", then a skeleton, then rows: there is no per-view cache.
   Projects render flat, then regroup. A priority change reorders the list without motion.
5. **Races.**
   - A held j with the drawer open starts 15 detail RPCs.
   - Quick add steals focus back after it finishes.
   - The comment and sub-task forms clear the next draft.
   - A stale detail response overwrites a newer edit.
   - A failed patch's recovery loads the old view into the new one (same bug as the delete case).
   - Load more cancels the reconciling refresh.
   - Writes to the same task can land out of order.
   - A comment appears twice.
   - Add section can be submitted twice (eval 5).
6. **Render waste.** The inline `onOpen`, `onFocus` and `onDelete` callbacks defeat `TaskItem.memo`, so all N rows
   render on every j. Stable callbacks cut row renders by 99% (eval 1). Virtualization is not needed at 300 tasks.
7. **Host and frame.**
   - Quick Add's `width:min(620px,100vw)` is circular in an intrinsically sized modal. It renders 300×150, and its
     pickers are clipped by 45–58%.
   - The 1100×720 workspace modal is scaled down on small windows, so text is about 10 px at 900 px wide.
   - The modal reveals large → tiny → final.
   - Bridge IPC itself is cheap, about 1 ms simulated (eval 7).
   Host issues to file: preferred or responsive modal sizing, and not revealing a frame before its first size.

What was fine: quick-add typing is local, hover is pure CSS, popovers don't jump, styles are injected once,
React is bundled once, and there are no host remounts or resize loops.

The resulting direction is in "Rebuild for feel" below. It is pending the owner's decisions.

## Rebuild for feel (owner: "yes go with all of these", 2026-10-15)

Decisions, all owner-confirmed:
- **A.** The service talks to the Todoist API directly through `@doist/todoist-sdk`, with one long-lived client.
  `td` is kept for locating the binary, sign-in, sign-out, `auth status`, and handing over the token.
- **B.** Match Todoist's own app as closely as the frame allows.
- **C.** Rebuild in this PR and ship it as beta.5.

### Service (`server/`)
- `server/api.ts` owns the client.
  - **Token.** Read `TODOIST_API_TOKEN` from td's environment if set. Otherwise read stdout of
    `td auth token view` through a private raw spawn; its failures are sanitized and never echo stdout.
  - **Client.** `new TodoistApi(token, { customFetch })`, where `customFetch` aborts at the request deadline
    (`INVOKE_BUDGET_MS` scope).
  - **Cache.** The client is cached per configuration generation. It is cleared on logout, on an AUTH error, on
    an identity or td-path change, and when status reports signed-out.
  - **Secrecy.** The token never leaves the service: no RPC reply, no storage, no argv, no error text.
- **Writes** pass a fresh `requestId` (X-Request-Id). The SDK retries network errors 3 times, and Todoist drops
  duplicate request ids, so a retried write cannot apply twice.
- **Errors.** `mapSdkError`: 401/403 → AUTH; abort or deadline → TIMEOUT; network → TD_FAILED; other 4xx/5xx →
  TD_FAILED with Todoist's message.
- **Reads.** Every read keeps its RPC shape (`TaskPage`, `Meta`, `TaskDetail`, …).
  - Today: `getTasksByFilter('(today | overdue) & (assigned to: me | !assigned)')`.
  - Upcoming: `getTasksByFilter('(due before: 14 days) & (assigned to: me | !assigned)')`.
  - Inbox: `getTasks({projectId: inbox})`, where inbox is `getUser().inboxProjectId`, cached.
  - Project: `getTasks({projectId})`. Label: `getTasks({label})`.
  - Filter: the stored query, split on top-level commas, each section paged.
  - Search: `getTasksByFilter('search: …')`.
  - Completed: `getCompletedTasksByCompletionDate(14 days)`.
  - Meta: projects and labels, all pages, plus filters through `sync(['filters'])`.
  - Sections: `getSections`.
  - Task detail: `getTask` + `getTasks({parentId})` + `getComments({taskId})`, run in parallel.
- **Writes return canonical entities.**
  - `complete` returns `{task}`, re-read after the close: a recurring task rolls forward, a finished one is
    `checked`. `delete` and `uncomplete` return the id or the task.
  - `addWithIntent({text, intent})` runs the quick-add parser, then `planFollowUps` inside ONE invoke, so there
    is one change and one publish. It returns `{task, partial?}`.

### Runtime (`src/runtime.ts`)
- **Change feed.** Every mutation publishes small typed changes, `{seq, kind: 'upsert'|'remove'|'meta', task?, id?,
  reason?}`, in `HostState.changes`, which keeps the last 50. Views apply the changes after their last seen
  `seq`. If they have fallen out of the window, they revalidate.
- **Revisions.** `revision` now bumps only for an identity change, an explicit refresh, or the periodic
  external-change sync (every 60 s while a view is open). `metaRevision` bumps only for project, label or
  section mutations and for identity changes.
- **Caches.** Meta and the last page of every list query are cached in the runtime and invalidated by the
  changes above. A view gets a cached reply at once (`list` with `cached: true`) and revalidates quietly.
  - Today, Inbox, Upcoming and meta are prefetched once setup is ready, so the first open paints from cache.

### Views (`src/ui/`)
- **`store.ts`**, one per frame, read through `useSyncExternalStore`:
  - an entity map of tasks;
  - query results keyed by the view's key: ids, cursor, `truncated`, and `state` ('empty' | 'fresh' | 'stale');
  - an optimistic overlay per task, plus a hidden set for completing and deleted tasks;
  - a per-task write queue: writes to one task are serialized, and unsent field edits are coalesced.
- **Membership.** Changes are applied with predicates that mirror the server queries:
  - Today: due ≤ today and not completed. Upcoming: due < today + 14 days.
  - Inbox and project: projectId. Label: labels contain it. Completed: the completed tasks list.
  - Search and saved filters cannot be matched locally: they update rows in place, remove completed or deleted
    ones, and revalidate.
- **Optimistic everything, reconciled from what the server returns.**
  - Complete: the check animates, the row collapses, the toast appears at click time with Undo, and focus moves
    to the next row.
  - Undo restores the row at once.
  - Reschedule from the presets, priority, move, delete, edit, quick add: a pending row appears at Enter.
- **Quiet revalidation.** Nothing hides or spins during it. The first load of a view shows a skeleton only after
  150 ms without a cache.
- **Task view.** A Todoist-style task modal over the list, so nothing reflows. It is seeded from the row and
  renders at once; comments and sub-tasks load into place. It is not remounted per task, and its detail requests
  are coalesced while j/k is held.
- **Smaller fixes:**
  - stable row callbacks;
  - FLIP animation for reorders;
  - toasts at the bottom left, with merged completions and an exit animation;
  - "+ Add task" inline editors at the bottom of the list and of each section, as in Todoist;
  - comment and sub-task drafts captured at submit;
  - submit guards on every create;
  - comments upserted by id.
- **Quick Add modal:** a real 600 px width, and pickers rendered in flow inside the modal so nothing is clipped.
- **Workspace modal:** a natural size of 960×640 (scale 1 from about 1070×745).

### Verification
- The existing unit, integration and UI suites still pass. Assertions that were about td's argv move to the
  API-request level; the golden transcript is re-recorded and reviewed.
- New UI cases cover:
  - optimistic completion with no snap-back, plus Undo;
  - view switching from the cache with no empty-state flash;
  - a task modal seeded from the row;
  - each race found by evaluator 5.
- The timing probe from evaluator 2 is re-run, and the before/after table goes into the PR.

## Execution notes

- 2026-10-14: plan committed first; implementation landed in one pass. Owner asked mid-build to follow the Agent
  Code conventions → history restructured: `main` = repo start, this branch = plan + implementation, Issue #1,
  worktree `.worktrees/todoist-in-agent-code`, PR to follow.
- UI reviewed through 16 dev-preview screenshots (Nord + Light, wide/pane/narrow, drawer, pickers, modal, setup
  states). Fixed from review: modal dead space under one-line input; native date-picker glyph black on dark
  themes (frame `color-scheme` now derived from the pushed canvas token).
- Owner then asked for extensive integration tests and saved payload simulations. That became the real-td
  integration layer above. Its first run found four production bugs (sections, completed window, no retry on
  5xx, revoked token) and three fake-data issues where Doist's spec examples disagree with the SDK: `tz_info`,
  `inbox_project_id`, and a comment `item_id`.
- Verified here: typecheck, 34 unit/boundary tests, 4 contract tests on the production build, 44 real-td
  integration tests (green twice in a row sequentially; green on Linux CI), deterministic rebuild.
- Not verified: Agent Code itself (not launched), a real Todoist account, real browser OAuth, real brew.
- Review round done (see Review of PR #2). Owner asked for a beta to try while fixes landed: `v0.1.0-beta.1`
  (pre-fix head `759c7ce`) published as a normal release; repo made public so the installer can download it.

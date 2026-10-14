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
  comma, `--no-*` clears), id validation, oversized page trimmed with cursor withheld, openUrl scheme refusal.
- `tests/model.test.mjs` — budget constants equal the host's, a 300-task page exceeds the bridge and `pageOf`
  fits it, `toJson`, local-day semantics, Today/Upcoming grouping order, quick-add token kinds and boundaries.
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
    - `integration/runtime` — the real runtime in a simulated host whose messages pass a copy of Agent Code's
      `isExtensionJson` (`tests/support/bridge.mjs`).
    - `integration/golden` — a saved transcript of 21 operations' requests and rows
      (`tests/fixtures/golden/td-5.4.10.json`, days normalised, `UPDATE_GOLDEN=1` re-records and refuses
      failures).
  - Files run one at a time, because parallel `td` processes on a loaded machine hit the 20 s deadline.
- Dev preview (`npm run preview`, `npm run shots`): the real view modules against `dev/fakeHost.ts` with Agent
  Code's Nord and Light token values; screenshots reviewed for every state.

## Verification

- `npm run typecheck`, `npm test`, `NODE_ENV=production npm run build`, `npm run test:extension`.
- Visual review of dev-preview screenshots (narrow pane, wide pane, drawer, setup states, modal).

## Verification boundary

- Agent Code itself is not launched here (standing rule). Install via Settings → Extensions → Load folder…
  and the consent dialog are verified only by the contract test, not in the app.
- No authenticated `td` output was recorded: `td` is not installed globally and nobody is signed in. The
  signed-out envelopes are real; signed-in shapes come from the SDK's own schemas/defaults. Recording live
  fixtures needs the user to run `td auth login` — `npm run record` is provided for that and redacts.
- Login/browser and Homebrew install jobs are exercised only with fake binaries.

## Out of scope

- Sending a task to an agent as a prompt (no host capability for prompt delivery exists).
- Reminders management, attachments upload, workspaces/folders admin, sharing/collaborators, templates,
  backups, billing, activity log (all reachable in Todoist proper via "Open in Todoist").
- Multi-account switching UI (td supports it; we use td's default account and show which one).
- Publishing the GitHub repo/release — needs the owner's go-ahead.

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
- Ruling: GitHub repo created **private** — publishing a public repo is the owner's call; Agent Code can install
  from a private repo through its gh-auth path — cost: flip visibility when ready.
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

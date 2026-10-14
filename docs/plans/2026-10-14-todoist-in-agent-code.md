# Todoist inside Agent Code

**Status:** in progress · **Size:** long plan (new repo, native service, full UI) · **Mode:** full build
**Repo:** `Juliusolsson05/agent-code-todoist` (local: `~/Desktop/Development/agent-code-todoist`)
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
                                                                    • openUrl (todoist.com only)
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
| `openUrl` | `{ url }` | `{ ok: true }` (only `https://app.todoist.com/` and `https://todoist.com/`) |

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
   `budget.ts` (`countJsonValues`, `fitTaskPage`), `colors.ts`, `dates.ts` (group/format due dates against a
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

- `compact.test.mjs` — fixtures are the SDK's own `test-defaults` entities parsed through the SDK's
  `TaskSchema`/project/section/label/comment schemas and serialised exactly like `td --json --full`
  (`JSON.stringify`, Date → ISO). Fails before `compact.ts` exists / when a field is mis-mapped (e.g.
  priority inverted, due datetime dropped).
- `run.test.mjs` — drives `runTd` against a fake `td` script that replays the **recorded** signed-out stderr
  envelope (`tests/fixtures/td-signed-out-today.json`) with exit 1 and asserts `NO_TOKEN` mapping; plus a
  hang script asserting the 20 s cap becomes `TIMEOUT` (cap injected small).
- `budget.test.mjs` — a 600-task page built from the SDK default task trims to the host bound and keeps
  `nextCursor`; the bound constants are asserted equal to the host's (4096 / 128 Ki) minus headroom.
- `dates.test.mjs`, `quickAddTokens.test.mjs` — grouping (overdue / today / tomorrow / weekday) and token
  spans with fixed `now`.
- `extension-contract.test.mjs` — manifest ↔ built files ↔ command/view/activation consistency (Skitgubbe
  pattern) and the built service answering `status` over the real SDK `runService` wire with a fake
  `parentPort` and a fake `td` on PATH.
- Dev preview (`dev/`): the real view modules mounted against a fake runtime fed by the same fixtures, captured
  with Playwright screenshots in light and dark tokens for the UI review. This is a standalone browser page,
  not Agent Code.

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
- Ruling: Quick Add chord `cmd+alt+t` — **UNCONFIRMED**; the host silently drops it if first-party owns it.
- Ruling: due-now toasts default OFF — background polling spawns `td` every few minutes; opt-in only.
- Ruling: `openUrl` restricted to Todoist web origins — the service is unsandboxed native code and must not
  become a generic URL/command launcher for the frame.

## Execution notes

(appended during the build)

# Todoist for Agent Code

Your Todoist inside [Agent Code](https://github.com/Juliusolsson05/agent-code): Today, Upcoming,
Inbox, projects, labels and filters in a pane, a natural-language quick add, a full task
editor, and a Quick Add modal that can link a task to the agent you are working with.

It runs Doist's official command-line app, [`td`](https://github.com/Doist/todoist-cli),
on your Mac. `td` signs you in through Todoist's own OAuth page and keeps the token in
your macOS Keychain — this extension never sees or stores it.

## Install

1. Agent Code → **Settings → Extensions** → enter `Juliusolsson05/agent-code-todoist` →
   **Install**, and approve the permissions (below).
2. Run **Todoist: Open** from the command palette.
3. The pane walks you through the rest:
   - **Install the Todoist CLI.** One click runs `brew install todoist-cli`. Without
     Homebrew, run `npm install -g @doist/todoist-cli` in a terminal; this needs
     Node.js 24 or newer.
   - **Sign in with Todoist.** Your browser opens Todoist's sign-in page. Approve the
     request and come back. There is an option for read-only access.

If you already use `td` in a terminal you are signed in already.

## What you get

| | |
| --- | --- |
| **Todoist: Open** | The pane: sidebar, grouped task list, quick add, task drawer |
| **Todoist: Open in Modal** | The same workspace in a floating window, without giving up a pane |
| **Todoist: Quick Add Task** (⌘⌥T) | Modal quick add from anywhere, with agent linking |
| **Todoist: Refresh** | Reload every open Todoist view |

In the pane:

- **Quick add** understands Todoist's syntax, and highlights the parts it will consume:
  - `tomorrow 3pm` sets the date.
  - `p1` sets the priority.
  - `#Project`, `/Section` and `@label` file and tag the task.
  - `{deadline}` sets a deadline.

  Tasks added in Today default to today. Tasks added in a project or label view land
  there.
- **The task drawer** opens when you click a task. You can:
  - edit the title and description (Markdown supported);
  - set the due date, deadline, duration, priority and labels;
  - move the task to another project or section;
  - add and complete sub-tasks;
  - read and write comments;
  - delete the task, or open it in Todoist.
- **Complete with Undo.** Recurring tasks show their next date instead.
- **Create** projects (with colour), sections and labels.

### Keyboard

| Key | Action |
| --- | --- |
| `q` / `a` | Focus quick add |
| `/` | Search |
| `j` `k` / `↓` `↑` | Move between tasks |
| `Enter` / `o` | Open task |
| `x` / `Space` | Complete / reopen |
| `1`–`4` | Priority p1–p4 |
| `t` | Schedule for today |
| `⌫` / `Delete` | Delete the focused task (asks first; Enter confirms, Esc cancels) |
| `r` | Refresh |
| `[` | Toggle sidebar |
| `?` | All shortcuts |
| `Esc` | Close drawer / search |

## Settings

Settings → Extensions → Todoist:

- **Path to the td CLI.** Set this only if `td` lives somewhere unusual. The default
  search covers:
  - Homebrew;
  - `~/.local/bin`, npm-global, Volta, pnpm and nvm;
  - your login shell's `PATH`.
- **Open on.** `today`, `upcoming` or `inbox`.
- **Toast when a task becomes due** (off by default). While Agent Code runs, Today is
  checked in the background and a toast appears when a timed task comes due.
- **Due check interval.** In minutes.
- **Use Agent Code's colours** (off by default). Off, the extension looks like Todoist:
  its colours, font and logo, light or dark following Agent Code. On, it uses your Agent
  Code theme instead.

## Permissions, and why

| Permission | Used for |
| --- | --- |
| `service.run` | Runs a small Node helper that calls `td`. Like any native program, it runs with your user's privileges. It only runs `td`, plus `brew`/`open` when you click Install or open a link. |
| `notifications.show` | The optional "due now" toasts |
| `sessions.observe`, `workspace.observe`, `panes.observe` | Lists the agents in your current tab so Quick Add can link a task to one. The extension reads only titles, folders and whether the agent is working. |

No network permission is requested. All Todoist traffic goes through `td`.

## Troubleshooting

- **"td was found but Node.js is not available"**: `td` needs Node 24+. Install with
  Homebrew (`brew install todoist-cli` brings its own Node), or point the setting at a
  `td` whose Node is 24+.
- **Sign-in page lost:** while waiting, the pane shows **Open the page again**.
- **Wrong account:** use the sign-out button under your name in the sidebar, then sign
  in again. `td accounts` manages several accounts.
- **`TODOIST_API_TOKEN` set in your environment:** `td` always prefers it over the
  Keychain login.

## Development

```bash
NODE_ENV=development npm install --include=dev
npm run preview          # the real views against a fake Todoist, at http://localhost:5199
npm run shots            # screenshots of every state into dev/shots/
npm test                 # model, td boundary and handler tests
npm run test:integration # the real td 5.4.10 against a fake Todoist API
npm run test:ui          # the views in Chromium, end to end (npx playwright install chromium once)
npm run test:extension   # production build + install contract against dist/
npm run record           # optional: record your own redacted td output
```

Always build with `NODE_ENV=production` (the `test:extension` script does). `dist/` and
`dist-service/` are committed on purpose: Agent Code installs from the repository's source
tarball. CI fails if they are stale.

To try local changes in the app, use Settings → Extensions → **Load Folder…** on this
directory, then **Reload** after each build.

## License

MIT

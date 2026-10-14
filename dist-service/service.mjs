// node_modules/agent-code-extension-api/dist/service.js
function defineService(module) {
  return module;
}
var errorText = (error) => String(error?.message ?? error).slice(0, 2e3);
function runService(module) {
  const port = globalThis.process?.parentPort;
  if (!port)
    throw new Error("runService() requires an Agent Code service process (process.parentPort).");
  const handlers2 = /* @__PURE__ */ new Map();
  let ready = false;
  let stopping = false;
  const context = {
    ready(endpoints) {
      if (ready || stopping)
        return;
      ready = true;
      port.postMessage({ kind: "ready", ...endpoints?.length ? { endpoints } : {} });
    },
    onRequest(name, handler) {
      if (!/^[a-zA-Z][a-zA-Z0-9_.-]{0,63}$/.test(name))
        throw new Error(`Invalid service request name: ${name}`);
      handlers2.set(name, handler);
      return { dispose: () => {
        if (handlers2.get(name) === handler)
          handlers2.delete(name);
      } };
    },
    log: (line) => {
      port.postMessage({ kind: "log", line: String(line).slice(0, 2e3) });
    }
  };
  port.on("message", ({ data }) => {
    const message = data;
    if (!message || typeof message.kind !== "string")
      return;
    if (message.kind === "request" && typeof message.id === "string" && typeof message.name === "string") {
      const { id, name, params } = message;
      void (async () => {
        const handler = handlers2.get(name);
        try {
          if (!handler)
            throw new Error(`No service handler registered for ${name}`);
          const value = await handler(params);
          if (!stopping)
            port.postMessage({ kind: "result", id, ok: true, ...value === void 0 ? {} : { value } });
        } catch (error) {
          if (!stopping)
            port.postMessage({ kind: "result", id, ok: false, error: errorText(error) });
        }
      })();
      return;
    }
    if (message.kind === "shutdown" && typeof message.id === "string") {
      const { id } = message;
      stopping = true;
      void (async () => {
        try {
          await module.stop?.();
        } catch {
        }
        port.postMessage({ kind: "stopped", id });
      })();
    }
  });
  void Promise.resolve(module.start(context)).catch((error) => {
    context.log(`service start failed: ${errorText(error)}`);
  });
}

// server/handlers.ts
import { spawn as spawn3 } from "node:child_process";

// src/shared/budget.ts
var HOST_MAX_CHARS = 128 * 1024;
var PAGE_MAX_VALUES = 3500;
var PAGE_MAX_CHARS = 11e4;
function countJsonValues(value) {
  if (value === null || typeof value !== "object") return 1;
  let count = 1;
  if (Array.isArray(value)) {
    for (const item of value) count += countJsonValues(item);
  } else {
    for (const item of Object.values(value)) {
      if (item !== void 0) count += countJsonValues(item);
    }
  }
  return count;
}
function fitTasks(tasks, maxValues = PAGE_MAX_VALUES, maxChars = PAGE_MAX_CHARS) {
  let values = 8;
  let chars = 64;
  const kept = [];
  for (const task2 of tasks) {
    const taskValues = countJsonValues(task2);
    const taskChars = JSON.stringify(task2).length + 1;
    if (values + taskValues > maxValues || chars + taskChars > maxChars) {
      return { tasks: kept, truncated: true };
    }
    values += taskValues;
    chars += taskChars;
    kept.push(task2);
  }
  return { tasks: kept, truncated: false };
}
function pageOf(tasks, nextCursor) {
  const fitted = fitTasks(tasks);
  return { tasks: fitted.tasks, nextCursor: fitted.truncated ? null : nextCursor, truncated: fitted.truncated };
}
function toJson(value) {
  return value === void 0 ? null : JSON.parse(JSON.stringify(value));
}
var LIST_DESCRIPTION_CHARS = 280;
var DETAIL_DESCRIPTION_CHARS = 16e3;
var COMMENT_CHARS = 4e3;

// src/shared/colors.ts
var TODOIST_COLORS = {
  berry_red: "#b8255f",
  red: "#db4035",
  orange: "#ff9933",
  yellow: "#fad000",
  olive_green: "#afb83b",
  lime_green: "#7ecc49",
  green: "#299438",
  mint_green: "#6accbc",
  teal: "#158fad",
  sky_blue: "#14aaf5",
  light_blue: "#96c3eb",
  blue: "#4073ff",
  grape: "#884dff",
  violet: "#af38eb",
  lavender: "#eb96eb",
  magenta: "#e05194",
  salmon: "#ff8d85",
  charcoal: "#808080",
  grey: "#b8b8b8",
  taupe: "#ccac93"
};
var COLOR_KEYS = Object.keys(TODOIST_COLORS);
function priorityLabel(priority) {
  return `p${5 - Math.min(4, Math.max(1, priority))}`;
}

// server/compact.ts
var str = (value, fallback = "") => typeof value === "string" ? value : fallback;
var strOrNull = (value) => typeof value === "string" && value ? value : null;
var num = (value, fallback = 0) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
var bool = (value) => value === true;
var isObj = (value) => !!value && typeof value === "object" && !Array.isArray(value);
function clip(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}\u2026` : text;
}
function compactDue(raw) {
  if (!isObj(raw)) return null;
  const date = str(raw.date);
  if (!date) return null;
  const datetime = strOrNull(raw.datetime) ?? (date.length > 10 && date.includes("T") ? date : null);
  return {
    date: date.slice(0, 10),
    datetime,
    string: str(raw.string),
    recurring: bool(raw.isRecurring)
  };
}
function compactTask(raw, descriptionChars = LIST_DESCRIPTION_CHARS) {
  if (!isObj(raw)) return null;
  const id = str(raw.id);
  if (!id) return null;
  const priority = Math.min(4, Math.max(1, Math.round(num(raw.priority, 1))));
  const duration = isObj(raw.duration) && (raw.duration.unit === "minute" || raw.duration.unit === "day") ? { amount: num(raw.duration.amount), unit: raw.duration.unit } : null;
  return {
    id,
    content: str(raw.content),
    description: clip(str(raw.description), descriptionChars),
    priority,
    due: compactDue(raw.due),
    deadline: isObj(raw.deadline) ? strOrNull(raw.deadline.date) : null,
    duration,
    projectId: str(raw.projectId),
    sectionId: strOrNull(raw.sectionId),
    parentId: strOrNull(raw.parentId),
    labels: Array.isArray(raw.labels) ? raw.labels.filter((l) => typeof l === "string") : [],
    order: num(raw.childOrder, num(raw.order)),
    commentCount: num(raw.noteCount, num(raw.commentCount)),
    completedAt: strOrNull(raw.completedAt),
    url: str(raw.url) || `https://app.todoist.com/app/task/${encodeURIComponent(id)}`
  };
}
function compactProject(raw) {
  if (!isObj(raw) || !str(raw.id)) return null;
  return {
    id: str(raw.id),
    name: str(raw.name, "Untitled"),
    color: str(raw.color, "charcoal"),
    parentId: strOrNull(raw.parentId),
    order: num(raw.childOrder),
    isFavorite: bool(raw.isFavorite),
    isInbox: bool(raw.inboxProject),
    isShared: bool(raw.isShared),
    viewStyle: str(raw.viewStyle, "list"),
    url: str(raw.url) || `https://app.todoist.com/app/project/${encodeURIComponent(str(raw.id))}`
  };
}
function compactSection(raw) {
  if (!isObj(raw) || !str(raw.id)) return null;
  return { id: str(raw.id), projectId: str(raw.projectId), name: str(raw.name), order: num(raw.sectionOrder) };
}
function compactLabel(raw) {
  if (!isObj(raw) || !str(raw.name)) return null;
  return { id: str(raw.id, str(raw.name)), name: str(raw.name), color: str(raw.color, "charcoal"), isFavorite: bool(raw.isFavorite), order: num(raw.order) };
}
function compactFilter(raw) {
  if (!isObj(raw) || !str(raw.id)) return null;
  return { id: str(raw.id), name: str(raw.name), query: str(raw.query), color: str(raw.color, "charcoal"), isFavorite: bool(raw.isFavorite) };
}
function compactComment(raw) {
  if (!isObj(raw) || !str(raw.id)) return null;
  const file = isObj(raw.fileAttachment) ? raw.fileAttachment : null;
  return {
    id: str(raw.id),
    content: clip(str(raw.content), COMMENT_CHARS),
    postedAt: str(raw.postedAt),
    attachment: file ? { name: str(file.fileName, "attachment"), url: str(file.fileUrl, str(file.url)), type: str(file.fileType, str(file.resourceType)) } : null
  };
}
function compactUser(raw) {
  if (!isObj(raw) || !str(raw.id)) return null;
  const mode = str(raw.authMode);
  return {
    id: str(raw.id),
    email: str(raw.email),
    fullName: str(raw.fullName),
    readOnly: mode === "read-only" || /^data:read$/.test(str(raw.authScope))
  };
}
function resultsOf(raw) {
  if (Array.isArray(raw)) return { results: raw, nextCursor: null };
  if (isObj(raw) && Array.isArray(raw.results)) return { results: raw.results, nextCursor: strOrNull(raw.nextCursor) };
  return { results: [], nextCursor: null };
}
function compactAll(items, fn) {
  const out = [];
  for (const item of items) {
    const row = fn(item);
    if (row) out.push(row);
  }
  return out;
}

// server/jobs.ts
import { spawn } from "node:child_process";
var current = null;
var last = null;
var LIMITS = {
  login: 5 * 6e4,
  install: 15 * 6e4
};
function jobStatus() {
  return current ? { ...current.status } : last;
}
function clearFinishedJob() {
  if (!current) last = null;
}
var AUTHORIZE_URL = /https:\/\/[^\s"']*\/oauth\/authorize\?[^\s"']+/;
function startJob(job) {
  if (current) {
    if (current.status.kind === job.kind) return { ...current.status };
    throw new Error(`BUSY: ${current.status.kind === "login" ? "Sign-in" : "Installation"} is still running.`);
  }
  const status2 = { kind: job.kind, state: "running", startedAt: Date.now(), authorizeUrl: null, detail: null };
  const child = spawn(job.command, job.args, { env: job.env, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  const onData = (chunk) => {
    output = (output + chunk.toString("utf8")).slice(-8e3);
    if (!status2.authorizeUrl) {
      const match = AUTHORIZE_URL.exec(output);
      if (match) {
        status2.authorizeUrl = match[0];
        job.onUrl?.(match[0]);
      }
    }
  };
  child.stdout?.on("data", onData);
  child.stderr?.on("data", onData);
  const timer = setTimeout(() => {
    status2.detail = job.kind === "login" ? "Sign-in was not completed within 5 minutes." : "Installation did not finish within 15 minutes.";
    child.kill("SIGTERM");
  }, LIMITS[job.kind]);
  const finish = (state, detail) => {
    if (!current || current.child !== child) return;
    clearTimeout(timer);
    status2.state = state;
    status2.detail = status2.detail ?? detail;
    last = { ...status2 };
    current = null;
    job.onDone?.(last);
  };
  child.on("error", (error) => finish("failed", error.message));
  child.on("close", (code) => {
    const tail = output.replace(/\u001b\[[0-9;]*[A-Za-z]/g, "").trim().split("\n").slice(-4).join("\n");
    finish(code === 0 ? "succeeded" : "failed", code === 0 ? null : tail || `exited with code ${code}`);
  });
  current = { status: status2, child, timer };
  return { ...status2 };
}
function cancelJob() {
  if (!current) return;
  current.status.detail = "Cancelled.";
  current.child.kill("SIGTERM");
}
function killJobs() {
  if (current) current.child.kill("SIGKILL");
}

// server/locate.ts
import { execFile } from "node:child_process";
import { access, constants, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { delimiter, dirname, join } from "node:path";
async function isExecutable(path) {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
var loginShellPath = null;
function loginPath(refresh = false) {
  if (process.platform === "win32") return Promise.resolve(null);
  if (!loginShellPath || refresh) {
    const shell = process.env.SHELL || "/bin/zsh";
    loginShellPath = new Promise((resolve) => {
      execFile(shell, ["-lc", 'printf "__TD_PATH__%s__TD_END__" "$PATH"'], { timeout: 5e3, env: { ...process.env, TERM: "dumb" } }, (error, stdout) => {
        if (error) return resolve(null);
        const match = /__TD_PATH__(.*)__TD_END__/s.exec(String(stdout));
        resolve(match ? match[1] : null);
      });
    });
  }
  return loginShellPath;
}
function joinPaths(...parts) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const part of parts) {
    for (const dir of (part ?? "").split(delimiter)) {
      if (!dir || seen.has(dir)) continue;
      seen.add(dir);
      out.push(dir);
    }
  }
  return out.join(delimiter);
}
async function nvmBins(home) {
  const root = join(home, ".nvm", "versions", "node");
  try {
    const versions = await readdir(root);
    return versions.filter((name) => /^v\d+/.test(name)).sort((a, b) => compareVersions(b.slice(1), a.slice(1))).map((name) => join(root, name, "bin"));
  } catch {
    return [];
  }
}
function compareVersions(a, b) {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff) return diff;
  }
  return 0;
}
async function wellKnownDirs() {
  const home = homedir();
  return [
    "/opt/homebrew/bin",
    "/usr/local/bin",
    join(home, ".local", "bin"),
    join(home, ".npm-global", "bin"),
    join(home, ".volta", "bin"),
    join(home, "Library", "pnpm"),
    join(home, ".bun", "bin"),
    ...await nvmBins(home)
  ];
}
function envFor(tdPath, shellPath) {
  return {
    ...process.env,
    PATH: joinPaths(dirname(tdPath), shellPath, process.env.PATH, "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"),
    // Machine output only: no ANSI colour in error text we surface, no spinner
    // frames on stderr (we also pass --no-spinner), no accessibility prefixes.
    NO_COLOR: "1",
    FORCE_COLOR: "0",
    TD_ACCESSIBLE: ""
    // A TODOIST_API_TOKEN inherited from whoever launched Agent Code would
    // silently override the Keychain account the user signed in with in OUR
    // setup screen. td documents that the env var always wins; we keep it only
    // if the user deliberately set it (then auth status reports source=env).
  };
}
async function locateTd(settingPath2, options = {}) {
  const searched = [];
  const name = process.platform === "win32" ? "td.cmd" : "td";
  if (settingPath2 && settingPath2.trim()) {
    const path = settingPath2.trim().replace(/^~(?=\/)/, homedir());
    searched.push(path);
    if (await isExecutable(path)) return { found: { path, env: envFor(path, await loginPath(options.refresh)) }, searched };
    return { found: null, searched };
  }
  const tryDirs = async (dirs) => {
    for (const dir of dirs) {
      const candidate = join(dir, name);
      if (searched.includes(candidate)) continue;
      searched.push(candidate);
      if (await isExecutable(candidate)) return candidate;
    }
    return null;
  };
  const inherited = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  const fromInherited = await tryDirs(inherited) ?? await tryDirs(await wellKnownDirs());
  if (fromInherited) return { found: { path: fromInherited, env: envFor(fromInherited, await loginPath(options.refresh)) }, searched };
  const shellPath = await loginPath(options.refresh);
  const fromShell = shellPath ? await tryDirs(shellPath.split(delimiter).filter(Boolean)) : null;
  if (fromShell) return { found: { path: fromShell, env: envFor(fromShell, shellPath) }, searched };
  return { found: null, searched };
}
async function locateBrew() {
  for (const candidate of ["/opt/homebrew/bin/brew", "/usr/local/bin/brew"]) {
    if (await isExecutable(candidate)) return candidate;
  }
  return null;
}

// server/run.ts
import { spawn as spawn2 } from "node:child_process";
var TdError = class extends Error {
  constructor(code, message, hints = []) {
    super(`${code}: ${message}${hints.length ? ` (${hints.join(" ")})` : ""}`);
    this.code = code;
    this.hints = hints;
  }
};
var MAX_OUTPUT = 16 * 1024 * 1024;
function mapTdErrorCode(code) {
  if (code === "NO_TOKEN" || code === "USER_NOT_FOUND" || code === "NOT_AUTHENTICATED") return "NO_TOKEN";
  if (/AUTH|SCOPE|UNAUTHORIZED|FORBIDDEN|TOKEN/i.test(code)) return "AUTH";
  return "TD_FAILED";
}
function parseErrorEnvelope(stderr) {
  const start = stderr.indexOf('{"error"');
  const candidates = start >= 0 ? [stderr.slice(start)] : [];
  candidates.push(...stderr.split("\n").filter((line) => line.trim().startsWith("{")));
  for (const text of candidates) {
    try {
      const parsed = JSON.parse(text.trim());
      if (parsed?.error && typeof parsed.error.code === "string") {
        return {
          code: parsed.error.code,
          message: typeof parsed.error.message === "string" ? parsed.error.message : parsed.error.code,
          hints: Array.isArray(parsed.error.hints) ? parsed.error.hints.filter((h) => typeof h === "string") : []
        };
      }
    } catch {
    }
  }
  return null;
}
function stripAnsi(text) {
  return text.replace(/\u001b\[[0-9;]*[A-Za-z]/g, "");
}
function runTd(tdPath, args, options) {
  const { env, timeoutMs = 2e4, stdin, expectJson = true } = options;
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn2(tdPath, ["--no-spinner", ...args], { env, stdio: ["pipe", "pipe", "pipe"] });
    } catch (error) {
      reject(new TdError("TD_NOT_FOUND", String(error.message)));
      return;
    }
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 1500).unref();
      finish(() => reject(new TdError("TIMEOUT", `td ${args.slice(0, 2).join(" ")} did not answer within ${Math.round(timeoutMs / 1e3)} s. The change may still have been saved; refresh to check.`)));
    }, timeoutMs);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      if (stdout.length < MAX_OUTPUT) stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      if (stderr.length < MAX_OUTPUT) stderr += chunk;
    });
    child.on("error", (error) => {
      const code = error.code;
      finish(() => reject(new TdError(code === "ENOENT" || code === "EACCES" ? "TD_NOT_FOUND" : "TD_FAILED", error.message)));
    });
    child.on("close", (exitCode) => {
      finish(() => {
        if (exitCode === 0) {
          if (!expectJson) return resolve(stdout.trim());
          const text2 = stdout.trim();
          if (!text2) return resolve(null);
          try {
            resolve(JSON.parse(text2));
          } catch {
            reject(new TdError("BAD_OUTPUT", `td printed something that is not JSON: ${stripAnsi(text2).slice(0, 200)}`));
          }
          return;
        }
        const envelope = parseErrorEnvelope(stderr);
        if (envelope) return reject(new TdError(mapTdErrorCode(envelope.code), envelope.message, envelope.hints));
        const text = stripAnsi(stderr || stdout).trim();
        if (exitCode === 127 || /env: node|node: No such file/i.test(text)) {
          return reject(new TdError("TD_NOT_FOUND", `td was found but Node.js is not available to run it (${text.slice(0, 160)}). Install Node 24+ or set the td path in settings.`));
        }
        reject(new TdError("TD_FAILED", text.slice(0, 600) || `td exited with code ${exitCode}`));
      });
    });
    if (stdin !== void 0) child.stdin.end(stdin);
    else child.stdin.end();
  });
}

// server/handlers.ts
var PAGE_LIMIT = 120;
var located = null;
var tdVersion = null;
var cachedUser = null;
var settingPath = "";
async function resolveTd(refresh = false) {
  if (located && !refresh) return { located, searched: [] };
  const result = await locateTd(settingPath, { refresh });
  located = result.found;
  return { located, searched: result.searched };
}
async function td(args, options = {}) {
  const { located: found } = await resolveTd();
  if (!found) throw new TdError("TD_NOT_FOUND", "The Todoist CLI (td) is not installed or could not be found.");
  try {
    return await runTd(found.path, args, { env: found.env, ...options });
  } catch (error) {
    if (error instanceof TdError && error.code === "TD_NOT_FOUND") located = null;
    if (error instanceof TdError && error.code === "NO_TOKEN") cachedUser = null;
    throw error;
  }
}
var ref = (id) => `id:${id}`;
function requireString(value, field, max = 2e4) {
  if (typeof value !== "string" || !value.trim()) throw new TdError("INVALID", `${field} is required.`);
  if (value.length > max) throw new TdError("INVALID", `${field} is too long.`);
  return value;
}
function optionalId(value) {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value) ? value : null;
}
function requireId(value, field = "id") {
  const id = optionalId(value);
  if (!id) throw new TdError("INVALID", `${field} is not a valid Todoist id.`);
  return id;
}
function asObject(params) {
  return params && typeof params === "object" && !Array.isArray(params) ? params : {};
}
async function status(params) {
  const p = asObject(params);
  const nextSetting = typeof p.tdPath === "string" ? p.tdPath : settingPath;
  const refresh = p.refresh === true || nextSetting !== settingPath;
  settingPath = nextSetting;
  const job = jobStatus();
  const brew = await locateBrew();
  const base = { brew, job, checkedAt: Date.now() };
  const { located: found, searched } = await resolveTd(refresh || job?.state === "succeeded");
  if (!found) {
    return toJson({ state: "td-missing", td: null, searched, user: null, error: null, ...base });
  }
  if (job?.state === "running") {
    return toJson({ state: job.kind === "install" ? "td-missing" : "signed-out", td: tdVersion?.path === found.path ? { path: found.path, version: tdVersion.version, node: null } : null, searched, user: null, error: null, ...base });
  }
  try {
    if (!tdVersion || tdVersion.path !== found.path || refresh) {
      tdVersion = { path: found.path, version: String(await td(["--version"], { expectJson: false, timeoutMs: 1e4 })) };
    }
    const info = { path: found.path, version: tdVersion.version, node: null };
    try {
      const user = compactUser(await td(["auth", "status", "--json"], { timeoutMs: 15e3 }));
      cachedUser = user;
      if (job?.state === "succeeded") clearFinishedJob();
      return toJson({ state: user ? "ready" : "signed-out", td: info, searched, user, error: null, ...base });
    } catch (error) {
      if (error instanceof TdError && (error.code === "NO_TOKEN" || error.code === "AUTH")) {
        return toJson({ state: "signed-out", td: info, searched, user: null, error: error.code === "AUTH" ? error.message : null, ...base });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof TdError && error.code === "TD_NOT_FOUND") {
      return toJson({ state: "td-missing", td: null, searched, user: null, error: error.message, ...base });
    }
    return toJson({ state: "error", td: tdVersion ? { path: found.path, version: tdVersion.version, node: null } : null, searched, user: null, error: error.message, ...base });
  }
}
function openExternal(url) {
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open";
  const child = spawn3(opener, [url], { stdio: "ignore", detached: true });
  child.on("error", () => {
  });
  child.unref();
}
async function login(params) {
  const p = asObject(params);
  const { located: found } = await resolveTd();
  if (!found) throw new TdError("TD_NOT_FOUND", "Install the Todoist CLI first.");
  const args = ["--no-spinner", "auth", "login", "--no-browser-open", ...p.readOnly === true ? ["--read-only"] : []];
  startJob({ kind: "login", command: found.path, args, env: found.env, onUrl: openExternal, onDone: () => {
    cachedUser = null;
  } });
  return status({});
}
async function install() {
  const brew = await locateBrew();
  if (!brew) throw new TdError("INVALID", "Homebrew is not installed. Install td with: npm install -g @doist/todoist-cli");
  const shellPath = await loginPath();
  startJob({
    kind: "install",
    command: brew,
    args: ["install", "todoist-cli"],
    env: {
      ...process.env,
      PATH: [shellPath, process.env.PATH, "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"].filter(Boolean).join(":"),
      // No prompts can be answered from here; never let brew wait on stdin.
      NONINTERACTIVE: "1",
      HOMEBREW_NO_ENV_HINTS: "1"
    },
    onDone: () => {
      located = null;
      tdVersion = null;
    }
  });
  return status({});
}
async function cancel() {
  cancelJob();
  return status({});
}
async function logout() {
  await td(["auth", "logout", "--json"]);
  cachedUser = null;
  return status({ refresh: true });
}
async function openUrl(params) {
  const url = requireString(asObject(params).url, "url", 2048);
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new TdError("INVALID", "Not a URL.");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new TdError("INVALID", "Only web links can be opened.");
  openExternal(parsed.toString());
  return { ok: true };
}
async function meta() {
  const [projects, sections, labels, filters] = await Promise.all([
    td(["project", "list", "--all", "--json", "--full"]),
    td(["section", "list", "--all", "--json", "--full"]).catch(() => ({ results: [] })),
    td(["label", "list", "--all", "--json", "--full"]).catch(() => ({ results: [] })),
    // Saved filters are a Pro feature; a free account must still get a sidebar.
    td(["filter", "list", "--json", "--full"]).catch(() => ({ results: [] }))
  ]);
  const projectRows = compactAll(resultsOf(projects).results, compactProject).sort((a, b) => Number(b.isInbox) - Number(a.isInbox) || a.order - b.order);
  return toJson({
    projects: projectRows,
    sections: compactAll(resultsOf(sections).results, compactSection).sort((a, b) => a.order - b.order),
    labels: compactAll(resultsOf(labels).results, compactLabel).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    filters: compactAll(resultsOf(filters).results, compactFilter),
    user: cachedUser
  });
}
function listArgs(query) {
  const page = ["--json", "--full", `--limit=${PAGE_LIMIT}`, ...query.cursor ? [`--cursor=${query.cursor}`] : []];
  switch (query.kind) {
    case "today":
      return ["today", ...page];
    case "upcoming":
      return ["upcoming", "14", ...page];
    case "inbox":
      return ["inbox", ...page];
    case "project":
      return ["task", "list", `--project=${ref(requireId(query.id, "project"))}`, ...page];
    case "label":
      return ["task", "list", `--label=${requireString(query.query, "label", 200)}`, ...page];
    case "filter":
      if (query.id) return ["filter", "view", ref(requireId(query.id, "filter")), ...page];
      return ["task", "list", `--filter=${requireString(query.query, "filter", 1e3)}`, ...page];
    case "search":
      return ["task", "list", `--filter=search: ${requireString(query.query, "search", 200).replace(/[,&|]/g, " ")}`, ...page];
    case "completed":
      return ["completed", "list", ...page];
    default:
      throw new TdError("INVALID", "Unknown list.");
  }
}
async function list(params) {
  const query = asObject(params);
  const raw = await td(listArgs(query));
  if (raw && typeof raw === "object" && Array.isArray(raw.sections)) {
    const seen = /* @__PURE__ */ new Set();
    const tasks = [];
    for (const section of raw.sections) {
      for (const task2 of compactAll(section.results ?? [], (item) => compactTask(item))) {
        if (seen.has(task2.id)) continue;
        seen.add(task2.id);
        tasks.push(task2);
      }
    }
    return toJson(pageOf(tasks, null));
  }
  const { results, nextCursor } = resultsOf(raw);
  return toJson(pageOf(compactAll(results, (item) => compactTask(item)), nextCursor));
}
async function task(params) {
  const id = requireId(asObject(params).id);
  const [raw, comments] = await Promise.all([
    td(["task", "view", ref(id), "--json", "--full", "--include-children"]),
    td(["comment", "list", ref(id), "--json", "--full", "--limit=50"]).catch(() => ({ results: [] }))
  ]);
  const row = compactTask(raw, DETAIL_DESCRIPTION_CHARS);
  if (!row) throw new TdError("BAD_OUTPUT", "td returned no task.");
  const children = Array.isArray(raw.children) ? raw.children : [];
  return toJson({
    task: row,
    children: compactAll(children, (item) => compactTask(item)).sort((a, b) => a.order - b.order),
    comments: compactAll(resultsOf(comments).results, compactComment).sort((a, b) => a.postedAt.localeCompare(b.postedAt))
  });
}
function taskFrom(raw) {
  const row = compactTask(raw, DETAIL_DESCRIPTION_CHARS);
  if (!row) throw new TdError("BAD_OUTPUT", "td did not return the task.");
  return toJson(row);
}
function priorityFlag(value) {
  return typeof value === "number" && value >= 1 && value <= 4 ? [`--priority=${priorityLabel(value)}`] : [];
}
function labelsValue(value) {
  if (!Array.isArray(value)) return null;
  return value.filter((l) => typeof l === "string" && !!l.trim()).map((l) => l.replace(/,/g, " ").trim()).join(",");
}
async function quickAdd(params) {
  const text = requireString(asObject(params).text, "text", 2e3);
  return taskFrom(await td(["task", "quickadd", "--stdin", "--json"], { stdin: text }));
}
async function add(params) {
  const draft = asObject(params);
  const args = ["task", "add", `--content=${requireString(draft.content, "Task name", 2e3)}`, "--json"];
  if (draft.description) args.push(`--description=${String(draft.description).slice(0, 16e3)}`);
  if (draft.due) args.push(`--due=${draft.due}`);
  if (draft.deadline) args.push(`--deadline=${draft.deadline}`);
  if (draft.duration) args.push(`--duration=${draft.duration}`);
  args.push(...priorityFlag(draft.priority));
  const projectId = optionalId(draft.projectId);
  const sectionId = optionalId(draft.sectionId);
  const parentId = optionalId(draft.parentId);
  if (projectId) args.push(`--project=${ref(projectId)}`);
  if (sectionId) args.push(`--section=${ref(sectionId)}`);
  if (parentId) args.push(`--parent=${ref(parentId)}`);
  const labels = labelsValue(draft.labels);
  if (labels) args.push(`--labels=${labels}`);
  return taskFrom(await td(args));
}
async function update(params) {
  const p = asObject(params);
  const id = requireId(p.id);
  const args = ["task", "update", ref(id), "--json"];
  if (p.content !== void 0) args.push(`--content=${requireString(p.content, "Task name", 2e3)}`);
  if (p.description !== void 0) args.push(`--description=${String(p.description).slice(0, 16e3)}`);
  if (p.due !== void 0) args.push(p.due ? `--due=${p.due}` : "--no-due");
  if (p.deadline !== void 0) args.push(p.deadline ? `--deadline=${p.deadline}` : "--no-deadline");
  if (p.duration !== void 0 && p.duration) args.push(`--duration=${p.duration}`);
  args.push(...priorityFlag(p.priority));
  if (p.labels !== void 0) {
    const labels = labelsValue(p.labels);
    args.push(labels ? `--labels=${labels}` : "--no-labels");
  }
  if (args.length === 4) throw new TdError("INVALID", "Nothing to update.");
  return taskFrom(await td(args));
}
async function move(params) {
  const p = asObject(params);
  const args = ["task", "move", ref(requireId(p.id)), "--json"];
  const projectId = optionalId(p.projectId);
  const sectionId = optionalId(p.sectionId);
  const parentId = optionalId(p.parentId);
  if (projectId) args.push(`--project=${ref(projectId)}`);
  if (sectionId) args.push(`--section=${ref(sectionId)}`);
  else if (p.noSection === true) args.push("--no-section");
  if (parentId) args.push(`--parent=${ref(parentId)}`);
  else if (p.noParent === true) args.push("--no-parent");
  if (args.length === 4) throw new TdError("INVALID", "Nowhere to move to.");
  await td(args);
  return { ok: true };
}
async function complete(params) {
  await td(["task", "complete", ref(requireId(asObject(params).id)), "--json"]);
  return { ok: true };
}
async function uncomplete(params) {
  await td(["task", "uncomplete", ref(requireId(asObject(params).id)), "--json"]);
  return { ok: true };
}
async function remove(params) {
  await td(["task", "delete", ref(requireId(asObject(params).id)), "--yes", "--json"]);
  return { ok: true };
}
async function comment(params) {
  const p = asObject(params);
  const raw = await td(["comment", "add", ref(requireId(p.taskId, "task")), `--content=${requireString(p.content, "Comment", 15e3)}`, "--json"]);
  const row = compactComment(raw);
  if (!row) throw new TdError("BAD_OUTPUT", "td did not return the comment.");
  return toJson(row);
}
async function createProject(params) {
  const p = asObject(params);
  const args = ["project", "create", `--name=${requireString(p.name, "Project name", 120)}`, "--json"];
  if (typeof p.color === "string" && /^[a-z_]{2,20}$/.test(p.color)) args.push(`--color=${p.color}`);
  const parentId = optionalId(p.parentId);
  if (parentId) args.push(`--parent=${ref(parentId)}`);
  if (p.favorite === true) args.push("--favorite");
  const row = compactProject(await td(args));
  if (!row) throw new TdError("BAD_OUTPUT", "td did not return the project.");
  return toJson(row);
}
async function createSection(params) {
  const p = asObject(params);
  const raw = await td(["section", "create", `--name=${requireString(p.name, "Section name", 120)}`, `--project=${ref(requireId(p.projectId, "project"))}`, "--json"]);
  const row = compactSection(raw);
  if (!row) throw new TdError("BAD_OUTPUT", "td did not return the section.");
  return toJson(row);
}
async function createLabel(params) {
  const p = asObject(params);
  const args = ["label", "create", `--name=${requireString(p.name, "Label name", 60).replace(/^@/, "")}`, "--json"];
  if (typeof p.color === "string" && /^[a-z_]{2,20}$/.test(p.color)) args.push(`--color=${p.color}`);
  const row = compactLabel(await td(args));
  if (!row) throw new TdError("BAD_OUTPUT", "td did not return the label.");
  return toJson(row);
}
var handlers = {
  status,
  login,
  install,
  cancelJob: cancel,
  logout,
  openUrl,
  meta,
  list,
  task,
  quickAdd,
  add,
  update,
  move,
  complete,
  uncomplete,
  delete: remove,
  comment,
  createProject,
  createSection,
  createLabel
};

// server/service.ts
runService(defineService({
  start(context) {
    for (const [name, handler] of Object.entries(handlers)) {
      context.onRequest(name, (params) => handler(params));
    }
    context.ready();
  },
  stop() {
    killJobs();
  }
}));

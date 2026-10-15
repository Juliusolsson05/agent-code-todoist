import { a as X, f as N, b as Y, c as z, e as Q, L as V } from "./shared-types.js";
import { q as C, a as Z } from "./shared-listModel.js";
const D = "todoist.td", tt = ["todoist.main", "todoist.quickAdd", "todoist.window"], W = /* @__PURE__ */ new Set(["status", "meta", "sections", "list", "task"]), H = "chunk", et = 2e3, M = /* @__PURE__ */ new Set([
  "quickAdd",
  "addWithIntent",
  "add",
  "update",
  "move",
  "complete",
  "uncomplete",
  "delete",
  "comment",
  "createProject",
  "createSection",
  "createLabel"
]), $ = /* @__PURE__ */ new Set(["login", "install", "cancelJob", "openUrl", "logout"]), L = 40;
function st(o, r, u) {
  const l = r ?? {}, h = u ?? {};
  switch (o) {
    case "quickAdd":
    case "add":
    case "update":
      return u ? [{ kind: "upsert", task: u }] : [];
    case "addWithIntent":
    case "move":
    case "uncomplete":
      return h.task ? [{ kind: "upsert", task: h.task }] : [];
    case "complete":
      return h.task && !h.task.completedAt ? [{ kind: "upsert", task: h.task }] : l.id ? [{ kind: "remove", id: l.id, reason: "completed", task: h.task ?? null }] : [];
    case "delete":
      return l.id ? [{ kind: "remove", id: l.id, reason: "deleted", task: null }] : [];
    case "comment":
      return l.taskId && u ? [{ kind: "comment", taskId: l.taskId, comment: u }] : [];
    case "createProject":
    case "createSection":
    case "createLabel":
      return [{ kind: "meta" }];
    default:
      return [];
  }
}
function nt(o) {
  return o.description.length > V ? { ...o, description: `${o.description.slice(0, V - 1)}…` } : o;
}
const at = 6e4, it = {
  tdPath: "",
  defaultView: "today",
  dueReminders: !1,
  reminderIntervalMinutes: 5,
  inheritTheme: !1
}, ct = X({
  async activate(o) {
    const { api: r } = o;
    let u = 1, l = 1, h = 0, g = [], c = null;
    const v = /* @__PURE__ */ new Map();
    let k = null, f = it, I = null;
    const S = async () => {
      const [t, s, n, e, a] = await Promise.all([
        r.storage.get("todoist.tdPath"),
        r.storage.get("todoist.defaultView"),
        r.storage.get("todoist.dueReminders"),
        r.storage.get("todoist.reminderIntervalMinutes"),
        r.storage.get("todoist.inheritTheme")
      ]);
      return f = {
        tdPath: typeof t == "string" ? t : "",
        defaultView: s === "upcoming" || s === "inbox" ? s : "today",
        dueReminders: n === !0,
        reminderIntervalMinutes: typeof e == "number" && e >= 1 ? Math.min(120, Math.round(e)) : 5,
        inheritTheme: a === !0
      }, f;
    }, m = async () => {
      const t = { revision: u, metaRevision: l, changeSeq: h, changes: g, setup: c, settings: f };
      await Promise.all(tt.map((s) => o.views.publish(s, z(t)).catch(() => {
      })));
    }, A = () => (I || (I = r.services.start(D).then(() => {
    }, (t) => {
      throw I = null, t;
    })), I), b = async (t, s) => {
      await A();
      const n = Date.now();
      try {
        return await r.services.invoke(D, t, s);
      } catch (e) {
        const a = String(e?.message ?? e);
        if (W.has(t) && Date.now() - n <= et && /not running|exited|no longer active|stopped/i.test(a))
          return I = null, await A(), r.services.invoke(D, t, s);
        throw e;
      }
    }, R = async (t, s) => Q(await b(t, s), (n, e) => b(H, { id: n, index: e })), E = (t) => `${t?.state}|${t?.user?.id ?? ""}|${t?.td?.path ?? ""}`, _ = () => {
      u++, l++, J(), c?.state === "ready" && x();
    };
    let q = 0;
    const p = async (t = !1) => {
      await S();
      const s = ++q, n = await R("status", { tdPath: f.tdPath, refresh: t });
      if (s !== q) return c ?? n;
      const e = E(c);
      return c = n, e !== E(c) && _(), await m(), c;
    }, F = () => ({
      now: /* @__PURE__ */ new Date(),
      inboxId: k?.projects.find((t) => t.isInbox)?.id ?? null,
      userId: c?.user?.id ?? null
    }), G = async (t) => {
      if (!t.length) return;
      const s = F();
      for (const n of t) {
        const e = { ...n.kind === "upsert" ? { ...n, task: nt(n.task) } : n, seq: ++h };
        if (g.push(e), e.kind === "meta") {
          l++, k = null;
          continue;
        }
        for (const a of v.values()) {
          const w = new Map(a.page.tasks.map((i) => [i.id, i])), d = Z(a.page.tasks.map((i) => i.id), a.query, e, s, (i) => w.get(i)?.parentId ?? null);
          e.kind === "upsert" && w.set(e.task.id, e.task), e.kind === "remove" && e.task && w.set(e.id, e.task), a.page = { ...a.page, tasks: d.map((i) => w.get(i)).filter((i) => !!i) };
        }
      }
      g.length > L && (g = g.slice(-L)), await m();
    }, J = () => {
      v.clear(), k = null, g = [];
    }, j = [{ kind: "today" }, { kind: "inbox" }, { kind: "upcoming" }], x = () => {
      R("meta").then((t) => {
        N(t) && (k = t);
      }, () => {
      });
      for (const t of j)
        R("list", t).then((s) => {
          N(s) && v.set(C(t), { query: t, page: s });
        }, () => {
        });
    };
    for (const t of [...W, H, ...M, ...$])
      o.registerRequest(t, async (s) => {
        if (t === "status")
          return p((s ?? {}).refresh === !0);
        const n = s ?? {};
        if (n.cached === !0 && t === "list")
          return v.get(C(s))?.page ?? null;
        if (n.cached === !0 && t === "meta") return k;
        try {
          const e = await b(t, s ?? void 0);
          if (t === "list" && !n.cursor && e && N(e)) {
            const a = s;
            v.set(C(a), { query: { kind: a.kind, id: a.id, query: a.query }, page: e });
          }
          if (t === "meta" && e && N(e) && (k = e), M.has(t) && await G(st(t, s, e)), $.has(t) && t !== "openUrl") {
            ++q;
            const a = E(c);
            c = e, a !== E(c) && _(), await m();
          }
          return e;
        } catch (e) {
          const a = Y(e);
          throw M.has(t) && a === "TIMEOUT" && (u++, await m()), (a === "NO_TOKEN" || a === "AUTH" || a === "TD_NOT_FOUND") && p(!0).catch(() => {
          }), e;
        }
      });
    o.registerRequest("settings", async () => await S()), o.registerRequest("setSetting", async (t) => {
      const s = t ?? {}, n = ["todoist.defaultView", "todoist.dueReminders", "todoist.reminderIntervalMinutes", "todoist.tdPath", "todoist.inheritTheme"];
      if (!s.key || !n.includes(s.key) || s.value === void 0) throw new Error("INVALID: Unknown setting.");
      return await r.storage.set(s.key, s.value), await S(), s.key === "todoist.tdPath" ? await p(!0) : await m(), P(), f;
    }), o.registerCommand("todoist.refresh", async () => {
      u++, await p(!0);
    });
    let y = null;
    const K = 10, T = new Set(await r.storage.get("todoist.announced") ?? []), O = async () => {
      try {
        if (!f.dueReminders || (c?.state === "ready" ? c : await p()).state !== "ready") return;
        const s = [];
        let n = null;
        for (let d = 0; d < K; d++) {
          const i = await R("list", { kind: "today", cursor: n });
          if (s.push(...i.tasks), n = i.nextCursor, !n) break;
        }
        const e = Date.now(), a = f.reminderIntervalMinutes * 6e4;
        let w = !1;
        for (const d of s) {
          const i = d.due?.datetime ? Date.parse(d.due.datetime) : NaN;
          if (!Number.isFinite(i) || i > e || e - i > a + 6e4) continue;
          const U = `${d.id}@${d.due.datetime}`;
          T.has(U) || (T.add(U), w = !0, await r.notifications.show(`Due now: ${d.content}`.slice(0, 200)).catch(() => {
          }));
        }
        if (w) {
          const d = [...T].slice(-200);
          T.clear(), d.forEach((i) => T.add(i)), await r.storage.set("todoist.announced", d);
        }
      } catch {
      }
    }, P = () => {
      y && clearInterval(y), y = null, f.dueReminders && (y = setInterval(() => void O(), f.reminderIntervalMinutes * 6e4), O());
    }, B = setInterval(() => {
      const t = f;
      S().then(async (s) => {
        JSON.stringify(s) !== JSON.stringify(t) && (s.tdPath !== t.tdPath ? await p(!0) : await m(), P());
      }).catch(() => {
      });
    }, at);
    o.subscriptions.push({
      dispose: () => {
        y && clearInterval(y), clearInterval(B);
      }
    }), await S(), await m(), P();
  }
});
export {
  at as SETTINGS_WATCH_MS,
  ct as default
};

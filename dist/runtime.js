import { a as b, b as M } from "./shared-types.js";
function O(n) {
  return n === void 0 ? null : JSON.parse(JSON.stringify(n));
}
const p = "todoist.td", D = ["todoist.main", "todoist.quickAdd"], E = /* @__PURE__ */ new Set(["status", "meta", "list", "task"]), S = /* @__PURE__ */ new Set([
  "quickAdd",
  "add",
  "update",
  "move",
  "complete",
  "uncomplete",
  "delete",
  "comment",
  "createProject",
  "createSection",
  "createLabel",
  "logout"
]), P = /* @__PURE__ */ new Set(["login", "install", "cancelJob", "openUrl"]), U = {
  tdPath: "",
  defaultView: "today",
  dueReminders: !1,
  reminderIntervalMinutes: 5
}, A = b({
  async activate(n) {
    const { api: a } = n;
    let l = 1, o = null, r = U, w = null;
    const f = async () => {
      const [t, e, s, i] = await Promise.all([
        a.storage.get("todoist.tdPath"),
        a.storage.get("todoist.defaultView"),
        a.storage.get("todoist.dueReminders"),
        a.storage.get("todoist.reminderIntervalMinutes")
      ]);
      return r = {
        tdPath: typeof t == "string" ? t : "",
        defaultView: e === "upcoming" || e === "inbox" ? e : "today",
        dueReminders: s === !0,
        reminderIntervalMinutes: typeof i == "number" && i >= 1 ? Math.min(120, Math.round(i)) : 5
      }, r;
    }, c = async () => {
      const t = { revision: l, setup: o, settings: r };
      await Promise.all(D.map((e) => n.views.publish(e, O(t)).catch(() => {
      })));
    }, I = () => (w || (w = a.services.start(p).then(() => {
    }, (t) => {
      throw w = null, t;
    })), w), v = async (t, e) => {
      await I();
      try {
        return await a.services.invoke(p, t, e);
      } catch (s) {
        const i = String(s?.message ?? s);
        if (E.has(t) && /not running|exited|no longer active|timed out|stopped/i.test(i))
          return w = null, await I(), a.services.invoke(p, t, e);
        throw s;
      }
    }, h = async (t = !1) => {
      await f();
      const e = o?.state;
      return o = await v("status", { tdPath: r.tdPath, refresh: t }), e !== o.state && l++, await c(), o;
    };
    for (const t of [...E, ...S, ...P])
      n.registerRequest(t, async (e) => {
        if (t === "status")
          return h((e ?? {}).refresh === !0);
        try {
          const s = await v(t, e ?? void 0);
          return S.has(t) && (l++, await c()), P.has(t) && t !== "openUrl" && (o = s, await c()), s;
        } catch (s) {
          const i = M(s);
          throw S.has(t) && i === "TIMEOUT" && (l++, await c()), (i === "NO_TOKEN" || i === "TD_NOT_FOUND") && h(!0).catch(() => {
          }), s;
        }
      });
    n.registerRequest("settings", async () => await f()), n.registerRequest("setSetting", async (t) => {
      const e = t ?? {}, s = ["todoist.defaultView", "todoist.dueReminders", "todoist.reminderIntervalMinutes", "todoist.tdPath"];
      if (!e.key || !s.includes(e.key) || e.value === void 0) throw new Error("INVALID: Unknown setting.");
      return await a.storage.set(e.key, e.value), await f(), e.key === "todoist.tdPath" ? await h(!0) : await c(), y(), r;
    }), n.registerCommand("todoist.refresh", async () => {
      l++, await h(!0);
    });
    let u = null;
    const m = new Set(await a.storage.get("todoist.announced") ?? []), k = async () => {
      try {
        if (!r.dueReminders || (o?.state === "ready" ? o : await h()).state !== "ready") return;
        const e = await v("list", { kind: "today" }), s = Date.now(), i = r.reminderIntervalMinutes * 6e4;
        let N = !1;
        for (const d of e.tasks) {
          const g = d.due?.datetime ? Date.parse(d.due.datetime) : NaN;
          if (!Number.isFinite(g) || g > s || s - g > i + 6e4) continue;
          const R = `${d.id}@${d.due.datetime}`;
          m.has(R) || (m.add(R), N = !0, await a.notifications.show(`Due now: ${d.content}`.slice(0, 200)).catch(() => {
          }));
        }
        if (N) {
          const d = [...m].slice(-200);
          m.clear(), d.forEach((g) => m.add(g)), await a.storage.set("todoist.announced", d);
        }
      } catch {
      }
    }, y = () => {
      u && clearInterval(u), u = null, r.dueReminders && (u = setInterval(() => void k(), r.reminderIntervalMinutes * 6e4), k());
    }, T = setInterval(() => {
      const t = JSON.stringify(r);
      f().then((e) => {
        JSON.stringify(e) !== t && (y(), c());
      }).catch(() => {
      });
    }, 6e4);
    n.subscriptions.push({
      dispose: () => {
        u && clearInterval(u), clearInterval(T);
      }
    }), await f(), await c(), y();
  }
});
export {
  A as default
};

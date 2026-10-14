import { a as O, b as V, c as q, e as C } from "./shared-types.js";
const k = "todoist.td", $ = ["todoist.main", "todoist.quickAdd"], b = /* @__PURE__ */ new Set(["status", "meta", "sections", "list", "task"]), D = "chunk", H = 2e3, R = /* @__PURE__ */ new Set([
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
]), A = /* @__PURE__ */ new Set(["login", "install", "cancelJob", "openUrl"]), J = 6e4, W = {
  tdPath: "",
  defaultView: "today",
  dueReminders: !1,
  reminderIntervalMinutes: 5
}, G = O({
  async activate(d) {
    const { api: n } = d;
    let l = 1, i = null, r = W, h = null;
    const m = async () => {
      const [t, e, s, a] = await Promise.all([
        n.storage.get("todoist.tdPath"),
        n.storage.get("todoist.defaultView"),
        n.storage.get("todoist.dueReminders"),
        n.storage.get("todoist.reminderIntervalMinutes")
      ]);
      return r = {
        tdPath: typeof t == "string" ? t : "",
        defaultView: e === "upcoming" || e === "inbox" ? e : "today",
        dueReminders: s === !0,
        reminderIntervalMinutes: typeof a == "number" && a >= 1 ? Math.min(120, Math.round(a)) : 5
      }, r;
    }, u = async () => {
      const t = { revision: l, setup: i, settings: r };
      await Promise.all($.map((e) => d.views.publish(e, q(t)).catch(() => {
      })));
    }, T = () => (h || (h = n.services.start(k).then(() => {
    }, (t) => {
      throw h = null, t;
    })), h), y = async (t, e) => {
      await T();
      const s = Date.now();
      try {
        return await n.services.invoke(k, t, e);
      } catch (a) {
        const I = String(a?.message ?? a);
        if (b.has(t) && Date.now() - s <= H && /not running|exited|no longer active|stopped/i.test(I))
          return h = null, await T(), n.services.invoke(k, t, e);
        throw a;
      }
    }, E = async (t, e) => C(await y(t, e), (s, a) => y(D, { id: s, index: a })), v = (t) => `${t?.state}|${t?.user?.id ?? ""}|${t?.td?.path ?? ""}`;
    let p = 0;
    const w = async (t = !1) => {
      await m();
      const e = ++p, s = await E("status", { tdPath: r.tdPath, refresh: t });
      if (e !== p) return i ?? s;
      const a = v(i);
      return i = s, a !== v(i) && l++, await u(), i;
    };
    for (const t of [...b, D, ...R, ...A])
      d.registerRequest(t, async (e) => {
        if (t === "status")
          return w((e ?? {}).refresh === !0);
        try {
          const s = await y(t, e ?? void 0);
          if (R.has(t) && (l++, await u()), A.has(t) && t !== "openUrl") {
            ++p;
            const a = v(i);
            i = s, a !== v(i) && l++, await u();
          }
          return s;
        } catch (s) {
          const a = V(s);
          throw R.has(t) && a === "TIMEOUT" && (l++, await u()), (a === "NO_TOKEN" || a === "AUTH" || a === "TD_NOT_FOUND") && w(!0).catch(() => {
          }), s;
        }
      });
    d.registerRequest("settings", async () => await m()), d.registerRequest("setSetting", async (t) => {
      const e = t ?? {}, s = ["todoist.defaultView", "todoist.dueReminders", "todoist.reminderIntervalMinutes", "todoist.tdPath"];
      if (!e.key || !s.includes(e.key) || e.value === void 0) throw new Error("INVALID: Unknown setting.");
      return await n.storage.set(e.key, e.value), await m(), e.key === "todoist.tdPath" ? await w(!0) : await u(), S(), r;
    }), d.registerCommand("todoist.refresh", async () => {
      l++, await w(!0);
    });
    let f = null;
    const U = 10, g = new Set(await n.storage.get("todoist.announced") ?? []), N = async () => {
      try {
        if (!r.dueReminders || (i?.state === "ready" ? i : await w()).state !== "ready") return;
        const e = [];
        let s = null;
        for (let o = 0; o < U; o++) {
          const c = await E("list", { kind: "today", cursor: s });
          if (e.push(...c.tasks), s = c.nextCursor, !s) break;
        }
        const a = Date.now(), I = r.reminderIntervalMinutes * 6e4;
        let P = !1;
        for (const o of e) {
          const c = o.due?.datetime ? Date.parse(o.due.datetime) : NaN;
          if (!Number.isFinite(c) || c > a || a - c > I + 6e4) continue;
          const M = `${o.id}@${o.due.datetime}`;
          g.has(M) || (g.add(M), P = !0, await n.notifications.show(`Due now: ${o.content}`.slice(0, 200)).catch(() => {
          }));
        }
        if (P) {
          const o = [...g].slice(-200);
          g.clear(), o.forEach((c) => g.add(c)), await n.storage.set("todoist.announced", o);
        }
      } catch {
      }
    }, S = () => {
      f && clearInterval(f), f = null, r.dueReminders && (f = setInterval(() => void N(), r.reminderIntervalMinutes * 6e4), N());
    }, _ = setInterval(() => {
      const t = r;
      m().then(async (e) => {
        JSON.stringify(e) !== JSON.stringify(t) && (e.tdPath !== t.tdPath ? await w(!0) : await u(), S());
      }).catch(() => {
      });
    }, J);
    d.subscriptions.push({
      dispose: () => {
        f && clearInterval(f), clearInterval(_);
      }
    }), await m(), await u(), S();
  }
});
export {
  J as SETTINGS_WATCH_MS,
  G as default
};

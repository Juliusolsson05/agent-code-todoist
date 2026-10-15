function d(e) {
  return Math.floor(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()) / 864e5);
}
function f(e) {
  const [o, t, r] = e.slice(0, 10).split("-").map(Number);
  return new Date(o, (t || 1) - 1, r || 1);
}
function c(e) {
  return e.datetime ? d(new Date(e.datetime)) : d(f(e.date));
}
function I(e, o) {
  if (!e) return "none";
  const t = d(o), r = c(e);
  return r < t || r === t && e.datetime && new Date(e.datetime).getTime() < o.getTime() ? "overdue" : r === t ? "today" : r === t + 1 ? "tomorrow" : r < t + 7 ? "week" : "future";
}
const g = new Intl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit" }), w = new Intl.DateTimeFormat(void 0, { weekday: "long" }), p = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric" }), h = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", year: "numeric" }), T = new Intl.DateTimeFormat(void 0, { weekday: "short", month: "short", day: "numeric" });
function v(e, o) {
  const t = d(o), r = c(e), u = e.datetime ? new Date(e.datetime) : f(e.date);
  let n;
  return r === t ? n = "Today" : r === t + 1 ? n = "Tomorrow" : r === t - 1 ? n = "Yesterday" : r > t && r < t + 7 ? n = w.format(u) : u.getFullYear() === o.getFullYear() ? n = p.format(u) : n = h.format(u), e.datetime ? `${n} ${g.format(u)}` : n;
}
function Y(e, o) {
  const t = f(e), r = d(t) - d(o);
  return r === 0 ? "Today" : r === 1 ? "Tomorrow" : r < 0 ? `${p.format(t)} (passed)` : t.getFullYear() === o.getFullYear() ? p.format(t) : h.format(t);
}
function F(e) {
  if (e.unit === "day") return e.amount === 1 ? "1 day" : `${e.amount} days`;
  const o = Math.floor(e.amount / 60), t = e.amount % 60;
  return o && t ? `${o}h ${t}m` : o ? `${o}h` : `${t}m`;
}
function y(e, o) {
  const t = e.due?.datetime ? new Date(e.due.datetime).getTime() : Number.POSITIVE_INFINITY, r = o.due?.datetime ? new Date(o.due.datetime).getTime() : Number.POSITIVE_INFINITY;
  return t !== r ? t - r : e.priority !== o.priority ? o.priority - e.priority : e.order - o.order;
}
function b(e, o) {
  const t = [], r = [];
  for (const n of e) (I(n.due, o) === "overdue" ? t : r).push(n);
  t.sort((n, s) => (n.due && s.due ? c(n.due) - c(s.due) : 0) || y(n, s)), r.sort(y);
  const u = [];
  return t.length && u.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: t }), u.push({ key: "today", title: "Today", subtitle: T.format(o), tone: "today", tasks: r }), u;
}
function M(e, o) {
  const t = d(o), r = /* @__PURE__ */ new Map(), u = [], n = [];
  for (const a of e) {
    if (!a.due) {
      n.push(a);
      continue;
    }
    const i = c(a.due);
    if (i < t) {
      u.push(a);
      continue;
    }
    const m = r.get(i) ?? [];
    m.push(a), r.set(i, m);
  }
  const s = [];
  u.length && s.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: u.sort(y) });
  for (const a of [...r.keys()].sort((i, m) => i - m)) {
    const i = new Date(a * 864e5), m = new Date(i.getUTCFullYear(), i.getUTCMonth(), i.getUTCDate()), l = a === t ? "Today" : a === t + 1 ? "Tomorrow" : w.format(m);
    s.push({
      key: `day-${a}`,
      title: l,
      subtitle: T.format(m),
      tone: a === t ? "today" : a === t + 1 ? "tomorrow" : "future",
      tasks: r.get(a).sort(y)
    });
  }
  return n.length && s.push({ key: "undated", title: "No date", tasks: n }), s;
}
function $(e, o) {
  const t = d(o), r = /* @__PURE__ */ new Map();
  for (const u of e) {
    const n = u.completedAt ? d(new Date(u.completedAt)) : t, s = r.get(n) ?? [];
    s.push(u), r.set(n, s);
  }
  return [...r.keys()].sort((u, n) => n - u).map((u) => {
    const n = new Date(u * 864e5), s = new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
    return {
      key: `done-${u}`,
      title: u === t ? "Today" : u === t - 1 ? "Yesterday" : T.format(s),
      tasks: r.get(u).sort((a, i) => (i.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    };
  });
}
function A(e) {
  return `${e.kind}:${e.id ?? ""}:${e.query ?? ""}`;
}
function D(e, o) {
  const t = e.responsibleUid;
  return !t || !o.userId || t === o.userId;
}
function k(e, o, t) {
  if (e.kind === "completed") return o.completedAt ? "in" : "out";
  if (o.completedAt) return "out";
  switch (e.kind) {
    case "today":
      return !o.due || !D(o, t) ? "out" : d(f(o.due.date)) <= d(t.now) ? "in" : "out";
    case "upcoming":
      return !o.due || !D(o, t) ? "out" : d(f(o.due.date)) < d(t.now) + 14 ? "in" : "out";
    case "inbox":
      return t.inboxId ? o.projectId === t.inboxId ? "in" : "out" : "unknown";
    case "project":
      return o.projectId === e.id ? "in" : "out";
    case "label":
      return o.labels.includes(e.query ?? "") ? "in" : "out";
    default:
      return "unknown";
  }
}
function C(e, o, t, r, u) {
  if (t.kind === "meta" || t.kind === "comment") return e;
  if (t.kind === "remove") {
    if (o.kind === "completed" && t.reason === "completed" && t.task)
      return e.includes(t.id) ? e : [t.id, ...e];
    const a = /* @__PURE__ */ new Set([t.id]);
    if (t.reason === "deleted" && u)
      for (let i = !0; i; ) {
        i = !1;
        for (const m of e) {
          const l = u(m);
          l && a.has(l) && !a.has(m) && (a.add(m), i = !0);
        }
      }
    return e.filter((i) => !a.has(i));
  }
  const n = e.includes(t.task.id), s = k(o, t.task, r);
  return s === "out" ? n ? e.filter((a) => a !== t.task.id) : e : s === "in" && !n ? [...e, t.task.id] : e;
}
export {
  C as a,
  M as b,
  $ as c,
  I as d,
  F as e,
  v as f,
  b as g,
  Y as h,
  k as m,
  A as q
};

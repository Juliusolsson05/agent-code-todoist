import { r as d, t as Pt, c as Mt, j as e, o as Ne, b as Q, L as Ae, q as lt, v as ut, I as Me, T as Ft, w as Lt, x as Ot, y as qt, z as zt, U as Kt, E as _t, u as Je, G as ue, M as Ut, H as mt, J as Xe, K as He, P as Ee, C as Ve, R as pt, N as ht, O as ft, F as rt, Q as xt, D as jt, d as bt, e as Yt, f as Bt, V as Wt, a as Ht, W as Vt, S as Qt, X as Gt, g as Jt, p as Xt, h as Zt, Y as es, Z as ts, _ as ss } from "./shared-SetupScreen.js";
import { t as Z, b as ns } from "./shared-types.js";
const Ze = 864e5;
function re(s) {
  return Math.floor(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate()) / Ze);
}
function et(s) {
  const [t, a, o] = s.slice(0, 10).split("-").map(Number);
  return new Date(t, (a || 1) - 1, o || 1);
}
function Ce(s) {
  return s.datetime ? re(new Date(s.datetime)) : re(et(s.date));
}
function Re(s, t) {
  if (!s) return "none";
  const a = re(t), o = Ce(s);
  return o < a || o === a && s.datetime && new Date(s.datetime).getTime() < t.getTime() ? "overdue" : o === a ? "today" : o === a + 1 ? "tomorrow" : o < a + 7 ? "week" : "future";
}
const as = new Intl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit" }), yt = new Intl.DateTimeFormat(void 0, { weekday: "long" }), Qe = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric" }), kt = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", year: "numeric" }), tt = new Intl.DateTimeFormat(void 0, { weekday: "short", month: "short", day: "numeric" });
function Ge(s, t) {
  const a = re(t), o = Ce(s), m = s.datetime ? new Date(s.datetime) : et(s.date);
  let c;
  return o === a ? c = "Today" : o === a + 1 ? c = "Tomorrow" : o === a - 1 ? c = "Yesterday" : o > a && o < a + 7 ? c = yt.format(m) : m.getFullYear() === t.getFullYear() ? c = Qe.format(m) : c = kt.format(m), s.datetime ? `${c} ${as.format(m)}` : c;
}
function is(s, t) {
  const a = et(s), o = re(a) - re(t);
  return o === 0 ? "Today" : o === 1 ? "Tomorrow" : o < 0 ? `${Qe.format(a)} (passed)` : a.getFullYear() === t.getFullYear() ? Qe.format(a) : kt.format(a);
}
function vt(s) {
  if (s.unit === "day") return s.amount === 1 ? "1 day" : `${s.amount} days`;
  const t = Math.floor(s.amount / 60), a = s.amount % 60;
  return t && a ? `${t}h ${a}m` : t ? `${t}h` : `${a}m`;
}
function Pe(s, t) {
  const a = s.due?.datetime ? new Date(s.due.datetime).getTime() : Number.POSITIVE_INFINITY, o = t.due?.datetime ? new Date(t.due.datetime).getTime() : Number.POSITIVE_INFINITY;
  return a !== o ? a - o : s.priority !== t.priority ? t.priority - s.priority : s.order - t.order;
}
function ls(s, t) {
  const a = [], o = [];
  for (const c of s) (Re(c.due, t) === "overdue" ? a : o).push(c);
  a.sort((c, r) => (c.due && r.due ? Ce(c.due) - Ce(r.due) : 0) || Pe(c, r)), o.sort(Pe);
  const m = [];
  return a.length && m.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: a }), m.push({ key: "today", title: "Today", subtitle: tt.format(t), tone: "today", tasks: o }), m;
}
function rs(s, t) {
  const a = re(t), o = /* @__PURE__ */ new Map(), m = [], c = [];
  for (const x of s) {
    if (!x.due) {
      c.push(x);
      continue;
    }
    const h = Ce(x.due);
    if (h < a) {
      m.push(x);
      continue;
    }
    const f = o.get(h) ?? [];
    f.push(x), o.set(h, f);
  }
  const r = [];
  m.length && r.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: m.sort(Pe) });
  for (const x of [...o.keys()].sort((h, f) => h - f)) {
    const h = new Date(x * Ze), f = new Date(h.getUTCFullYear(), h.getUTCMonth(), h.getUTCDate()), y = x === a ? "Today" : x === a + 1 ? "Tomorrow" : yt.format(f);
    r.push({
      key: `day-${x}`,
      title: y,
      subtitle: tt.format(f),
      tone: x === a ? "today" : x === a + 1 ? "tomorrow" : "future",
      tasks: o.get(x).sort(Pe)
    });
  }
  return c.length && r.push({ key: "undated", title: "No date", tasks: c }), r;
}
function os(s, t) {
  const a = re(t), o = /* @__PURE__ */ new Map();
  for (const m of s) {
    const c = m.completedAt ? re(new Date(m.completedAt)) : a, r = o.get(c) ?? [];
    r.push(m), o.set(c, r);
  }
  return [...o.keys()].sort((m, c) => c - m).map((m) => {
    const c = new Date(m * Ze), r = new Date(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate());
    return {
      key: `done-${m}`,
      title: m === a ? "Today" : m === a - 1 ? "Yesterday" : tt.format(r),
      tasks: o.get(m).sort((x, h) => (h.completedAt ?? "").localeCompare(x.completedAt ?? ""))
    };
  });
}
function cs(s) {
  return document.addEventListener("keydown", s), () => document.removeEventListener("keydown", s);
}
function ds(s) {
  return s instanceof Element && !!s.closest('button, a[href], summary, select, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="option"], [role="checkbox"], [role="tab"], [role="switch"]');
}
const us = d.forwardRef(function({ placeholder: t, contextLabel: a, disabled: o, onSubmit: m, autoFocus: c, large: r }, x) {
  const [h, f] = d.useState(""), [y, N] = d.useState(0), g = y > 0, D = d.useRef(null), k = d.useRef(null);
  d.useImperativeHandle(x, () => ({ focus: () => D.current?.focus() }), []);
  const A = () => {
    k.current && D.current && (k.current.scrollLeft = D.current.scrollLeft);
  }, P = async () => {
    const v = h.trim();
    if (v) {
      f(""), N((l) => l + 1);
      try {
        await m(v) || f((l) => l || v);
      } finally {
        N((l) => l - 1), requestAnimationFrame(() => D.current?.focus());
      }
    }
  }, z = Pt(h), $ = h ? Mt(h) : "", S = z.some((v) => v.kind !== "text");
  return /* @__PURE__ */ e.jsxs("div", { className: `td-quickadd${r ? " is-large" : ""}${g ? " is-busy" : ""}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-field", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-quickadd-plus", children: /* @__PURE__ */ e.jsx(Ne, {}) }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-stack", children: [
        /* @__PURE__ */ e.jsxs("div", { ref: k, className: "td-quickadd-mirror", "aria-hidden": "true", children: [
          z.map((v, l) => /* @__PURE__ */ e.jsx("span", { className: `tok-${v.kind}`, children: v.text }, l)),
          "​"
        ] }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            ref: D,
            className: "td-quickadd-input",
            value: h,
            disabled: o,
            autoFocus: c,
            spellCheck: !1,
            placeholder: t,
            "aria-label": "Quick add task",
            onChange: (v) => {
              f(v.target.value), requestAnimationFrame(A);
            },
            onScroll: A,
            onKeyDown: (v) => {
              v.key === "Enter" && !v.nativeEvent.isComposing ? (v.preventDefault(), P()) : v.key === "Escape" && h ? (v.preventDefault(), v.stopPropagation(), f("")) : v.key === "Escape" && (v.preventDefault(), v.stopPropagation(), D.current?.blur());
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-primary td-quickadd-submit", disabled: !h.trim() || o, onClick: () => void P(), children: g && !h.trim() ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : "Add" })
    ] }),
    (S || a) && /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-hint", children: [
      S && $ ? /* @__PURE__ */ e.jsxs("span", { children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: $ }),
        "”"
      ] }) : null,
      a ? /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: a }) : null
    ] })
  ] });
});
function gt(s, t) {
  return s.kind === t.kind && (s.id ?? null) === (t.id ?? null) && (s.query ?? null) === (t.query ?? null);
}
function ms({ meta: s, current: t, counts: a, user: o, onSelect: m, onSearch: c, onCreateProject: r, onCreateLabel: x, onSignOut: h }) {
  const [f, y] = d.useState({ favorites: !0, projects: !0, labels: !1, filters: !1 }), [N, g] = d.useState(null), [D, k] = d.useState(""), [A, P] = d.useState("charcoal"), z = s?.projects.find((l) => l.isInbox), $ = (l, q, E, G, ee) => /* @__PURE__ */ e.jsxs(
    "button",
    {
      className: `td-nav-item${gt(t, l) ? " is-active" : ""}`,
      onClick: () => m(l),
      title: E,
      children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", style: ee ? { color: ee } : void 0, children: q }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: E }),
        G ? /* @__PURE__ */ e.jsx("span", { className: "td-nav-count", children: G }) : null
      ]
    },
    `${l.kind}:${l.id ?? l.query ?? ""}`
  ), S = [
    ...s?.projects.filter((l) => l.isFavorite && !l.isInbox).map((l) => $({ kind: "project", id: l.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: Q(l.color) } }), l.name)) ?? [],
    ...s?.labels.filter((l) => l.isFavorite).map((l) => $({ kind: "label", query: l.name }, /* @__PURE__ */ e.jsx(Ae, {}), l.name, null, Q(l.color))) ?? [],
    ...s?.filters.filter((l) => l.isFavorite).map((l) => $({ kind: "filter", id: l.id, query: l.query }, /* @__PURE__ */ e.jsx(lt, {}), l.name, null, Q(l.color))) ?? []
  ], v = async (l) => {
    l.preventDefault();
    const q = D.trim();
    !q || !(N === "project" ? await r(q, A) : N === "label" && await x(q)) || (k(""), g(null));
  };
  return /* @__PURE__ */ e.jsxs("nav", { className: "td-sidebar", "aria-label": "Todoist navigation", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-item", onClick: c, title: "Search (/)", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", children: /* @__PURE__ */ e.jsx(ut, {}) }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: "Search" }),
        /* @__PURE__ */ e.jsx("kbd", { children: "/" })
      ] }),
      $({ kind: "inbox" }, /* @__PURE__ */ e.jsx(Me, {}), "Inbox", a.inbox, "#246fe0"),
      $({ kind: "today" }, /* @__PURE__ */ e.jsx(Ft, {}), "Today", a.today, "#058527"),
      $({ kind: "upcoming" }, /* @__PURE__ */ e.jsx(Kt, {}), "Upcoming", null, "#692fc2"),
      $({ kind: "completed" }, /* @__PURE__ */ e.jsx(_t, {}), "Completed", null, "#eb8909")
    ] }),
    S.length > 0 && /* @__PURE__ */ e.jsx($e, { title: "Favorites", open: f.favorites, onToggle: () => y((l) => ({ ...l, favorites: !l.favorites })), children: S }),
    /* @__PURE__ */ e.jsxs(
      $e,
      {
        title: "My Projects",
        open: f.projects,
        onToggle: () => y((l) => ({ ...l, projects: !l.projects })),
        onAdd: () => {
          g("project"), k(""), y((l) => ({ ...l, projects: !0 }));
        },
        children: [
          !s && /* @__PURE__ */ e.jsx(ps, {}),
          s && Lt(s.projects).filter(({ project: l }) => l.id !== z?.id).map(({ project: l, depth: q }) => /* @__PURE__ */ e.jsx("div", { style: { paddingLeft: q * 12 }, children: $({ kind: "project", id: l.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: Q(l.color) } }), l.name) }, l.id)),
          N === "project" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (l) => void v(l), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: D, onChange: (l) => k(l.target.value), placeholder: "Project name", onKeyDown: (l) => {
              l.key === "Escape" && (l.preventDefault(), l.stopPropagation(), g(null));
            } }),
            /* @__PURE__ */ e.jsx("div", { className: "td-swatches", children: Ot.map((l) => /* @__PURE__ */ e.jsx("button", { type: "button", title: l.replace("_", " "), className: `td-swatch${l === A ? " is-on" : ""}`, style: { background: Q(l) }, onClick: () => P(l) }, l)) }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => g(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !D.trim(), children: "Add project" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e.jsxs(
      $e,
      {
        title: "Labels",
        open: f.labels,
        onToggle: () => y((l) => ({ ...l, labels: !l.labels })),
        onAdd: () => {
          g("label"), k(""), y((l) => ({ ...l, labels: !0 }));
        },
        children: [
          s?.labels.map((l) => $({ kind: "label", query: l.name }, /* @__PURE__ */ e.jsx(Ae, {}), l.name, null, Q(l.color))),
          s && !s.labels.length && N !== "label" && /* @__PURE__ */ e.jsx("div", { className: "td-nav-empty", children: "No labels" }),
          N === "label" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (l) => void v(l), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: D, onChange: (l) => k(l.target.value), placeholder: "Label name", onKeyDown: (l) => {
              l.key === "Escape" && (l.preventDefault(), l.stopPropagation(), g(null));
            } }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => g(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !D.trim(), children: "Add label" })
            ] })
          ] })
        ]
      }
    ),
    s && s.filters.length > 0 && /* @__PURE__ */ e.jsx($e, { title: "Filters", open: f.filters, onToggle: () => y((l) => ({ ...l, filters: !l.filters })), children: s.filters.map((l) => $({ kind: "filter", id: l.id, query: l.query }, /* @__PURE__ */ e.jsx(lt, {}), l.name, null, Q(l.color))) }),
    o && /* @__PURE__ */ e.jsxs("div", { className: "td-account", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-avatar", children: (o.fullName || o.email || "?").slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ e.jsxs("span", { className: "td-account-text", children: [
        /* @__PURE__ */ e.jsx("span", { children: o.fullName || o.email }),
        o.readOnly && /* @__PURE__ */ e.jsx("span", { className: "td-dim td-small", children: "Read-only" })
      ] }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Sign out of td", onClick: h, children: /* @__PURE__ */ e.jsx(qt, { size: 13 }) })
    ] })
  ] });
}
function $e({ title: s, open: t, onToggle: a, onAdd: o, children: m }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-heading", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-heading-btn", onClick: a, "aria-expanded": t, children: [
        /* @__PURE__ */ e.jsx(zt, { size: 12, className: t ? "" : "is-collapsed" }),
        s
      ] }),
      o && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: `Add ${s.toLowerCase().replace("my ", "").replace(/s$/, "")}`, onClick: o, children: /* @__PURE__ */ e.jsx(Ne, { size: 12 }) })
    ] }),
    t && m
  ] });
}
function ps() {
  return /* @__PURE__ */ e.jsx(e.Fragment, { children: [70, 55, 80].map((s) => /* @__PURE__ */ e.jsx("div", { className: "td-nav-item", children: /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${s}%` } }) }, s)) });
}
const We = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"]))/g;
function xe(s, t, a = "i") {
  const o = [];
  let m = 0, c = 0;
  We.lastIndex = 0;
  for (let r = We.exec(s); r; r = We.exec(s)) {
    r.index > m && o.push(s.slice(m, r.index));
    const x = `${a}${c++}`;
    r[2] || r[3] ? o.push(/* @__PURE__ */ e.jsx("strong", { children: r[2] ?? r[3] }, x)) : r[4] || r[5] ? o.push(/* @__PURE__ */ e.jsx("em", { children: r[4] ?? r[5] }, x)) : r[6] ? o.push(/* @__PURE__ */ e.jsx("code", { children: r[6] }, x)) : r[7] && r[8] ? o.push(/* @__PURE__ */ e.jsx(ot, { url: r[8], open: t, children: r[7] }, x)) : r[9] && o.push(/* @__PURE__ */ e.jsx(ot, { url: r[9], open: t, children: hs(r[9]) }, x)), m = r.index + r[0].length;
  }
  return m < s.length && o.push(s.slice(m)), o;
}
function hs(s) {
  try {
    const t = new URL(s), a = t.pathname.length > 28 ? `${t.pathname.slice(0, 26)}…` : t.pathname;
    return `${t.hostname.replace(/^www\./, "")}${a === "/" ? "" : a}`;
  } catch {
    return s;
  }
}
function ot({ url: s, open: t, children: a }) {
  return /* @__PURE__ */ e.jsx(
    "a",
    {
      className: "td-link",
      href: s,
      title: s,
      onClick: (o) => {
        o.preventDefault(), o.stopPropagation(), t(s);
      },
      children: a
    }
  );
}
function ct({ text: s, open: t }) {
  const a = s.replace(/\r\n/g, `
`).split(`
`), o = [];
  let m = 0, c = 0;
  for (; m < a.length; ) {
    const r = a[m];
    if (r.startsWith("```")) {
      const h = [];
      for (m++; m < a.length && !a[m].startsWith("```"); ) h.push(a[m++]);
      m++, o.push(/* @__PURE__ */ e.jsx("pre", { className: "td-md-pre", children: /* @__PURE__ */ e.jsx("code", { children: h.join(`
`) }) }, c++));
      continue;
    }
    if (/^\s*[-*]\s+/.test(r)) {
      const h = [];
      for (; m < a.length && /^\s*[-*]\s+/.test(a[m]); ) h.push(a[m++].replace(/^\s*[-*]\s+/, ""));
      o.push(/* @__PURE__ */ e.jsx("ul", { children: h.map((f, y) => /* @__PURE__ */ e.jsx("li", { children: xe(f, t, `l${c}-${y}`) }, y)) }, c++));
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(r)) {
      const h = [];
      for (; m < a.length && /^\s*\d+[.)]\s+/.test(a[m]); ) h.push(a[m++].replace(/^\s*\d+[.)]\s+/, ""));
      o.push(/* @__PURE__ */ e.jsx("ol", { children: h.map((f, y) => /* @__PURE__ */ e.jsx("li", { children: xe(f, t, `o${c}-${y}`) }, y)) }, c++));
      continue;
    }
    if (r.startsWith("> ")) {
      const h = [];
      for (; m < a.length && a[m].startsWith("> "); ) h.push(a[m++].slice(2));
      o.push(/* @__PURE__ */ e.jsx("blockquote", { children: xe(h.join(" "), t, `q${c}`) }, c++));
      continue;
    }
    if (!r.trim()) {
      m++;
      continue;
    }
    const x = [];
    for (; m < a.length && a[m].trim() && !/^(```|\s*[-*]\s+|\s*\d+[.)]\s+|> )/.test(a[m]); ) x.push(a[m++]);
    o.push(
      /* @__PURE__ */ e.jsx("p", { children: x.map((h, f) => /* @__PURE__ */ e.jsxs(d.Fragment, { children: [
        f > 0 && /* @__PURE__ */ e.jsx("br", {}),
        xe(h, t, `p${c}-${f}`)
      ] }, f)) }, c++)
    );
  }
  return /* @__PURE__ */ e.jsx("div", { className: "td-md", children: o });
}
const Nt = ["15m", "30m", "45m", "1h", "1h30m", "2h", "3h", "4h"];
function fs({ taskId: s, meta: t, now: a, revision: o, onClose: m, onToggle: c, onOpenTask: r, onError: x, onOpenUrl: h, onCreateLabel: f, onNeedSections: y }) {
  const N = Je(), [g, D] = d.useState(null), [k, A] = d.useState(null), [P, z] = d.useState(null), [$, S] = d.useState(""), v = d.useRef(null), l = d.useRef(""), q = d.useRef(null), E = (n) => {
    v.current = n, z(n);
  }, G = (n) => {
    l.current = n, S(n);
  }, [ee, te] = d.useState(null), [Fe, je] = d.useState(!1), [oe, J] = d.useState(""), [se, _] = d.useState(""), [U, be] = d.useState(!1), B = { due: d.useRef(null), priority: d.useRef(null), labels: d.useRef(null), project: d.useRef(null) }, W = async () => {
    try {
      A(null), D(await N.call("task", { id: s }));
    } catch (n) {
      A(Z(n));
    }
  };
  d.useEffect(() => {
    D(null), E(null), je(!1), J(""), W();
  }, [s]);
  const ye = d.useRef(o);
  d.useEffect(() => {
    o !== ye.current && W();
  }, [o]), q.current = g?.task ?? null, d.useEffect(() => () => {
    const n = v.current, T = q.current;
    if (!n || !T) return;
    const R = dt(n, l.current, T);
    R && N.call("update", { id: T.id, ...R }).catch((L) => x(Z(L)));
  }, []);
  const H = async (n) => {
    if (!g) return;
    const T = g;
    D({ ...g, task: { ...g.task, ...js(n) } });
    try {
      const R = await N.call("update", { id: g.task.id, ...n });
      D((L) => L && { ...L, task: R });
    } catch (R) {
      D(T), W(), x(Z(R));
    }
  }, we = async (n, T) => {
    if (g)
      try {
        await N.call("move", { id: g.task.id, projectId: n, ...T ? { sectionId: T } : { noSection: !0 } }), D({ ...g, task: { ...g.task, projectId: n, sectionId: T } });
      } catch (R) {
        x(Z(R));
      }
  }, ke = g?.task.projectId;
  if (d.useEffect(() => {
    ke && y(ke);
  }, [ke, y]), k)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", {}),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: m, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(ue, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
        /* @__PURE__ */ e.jsx("p", { children: k }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void W(), children: "Try again" })
      ] })
    ] });
  if (!g)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: 120 } }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: m, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(ue, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "80%", height: 20, marginBottom: 14 } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "60%" } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "40%", marginTop: 8 } })
      ] })
    ] });
  const { task: j, children: ne, comments: ae } = g, me = t.projects.find((n) => n.id === j.projectId), pe = t.sections.find((n) => n.id === j.sectionId), ie = !!j.completedAt, ve = Re(j.due, a), he = async () => {
    const n = v.current;
    if (!n) return;
    E(null);
    const T = dt(n, l.current, j);
    T && await H(T);
  };
  return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", "aria-label": "Task details", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: B.project, className: "td-crumb", onClick: () => te("project"), title: "Move to project / section", children: [
        me?.isInbox ? /* @__PURE__ */ e.jsx(Me, { size: 13 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: Q(me?.color) } }),
        /* @__PURE__ */ e.jsx("span", { children: me?.name ?? "Project" }),
        pe && /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
          "/ ",
          pe.name
        ] }),
        /* @__PURE__ */ e.jsx(Ut, { size: 12, className: "td-crumb-move" })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-tools", children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open in Todoist", onClick: () => h(j.url), children: /* @__PURE__ */ e.jsx(mt, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn danger", title: "Delete task", onClick: () => je(!0), children: /* @__PURE__ */ e.jsx(Xe, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: m, children: /* @__PURE__ */ e.jsx(ue, {}) })
      ] })
    ] }),
    Fe && /* @__PURE__ */ e.jsxs("div", { className: "td-confirm", children: [
      /* @__PURE__ */ e.jsxs("span", { children: [
        "Delete this task",
        ne.length ? ` and its ${ne.length} subtask${ne.length > 1 ? "s" : ""}` : "",
        "? This cannot be undone."
      ] }),
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => je(!1), children: "Cancel" }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            className: "td-btn td-btn-danger",
            autoFocus: !0,
            onClick: async () => {
              try {
                await N.call("delete", { id: j.id }), m();
              } catch (n) {
                x(Z(n));
              }
            },
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
      j.parentId && /* @__PURE__ */ e.jsxs("button", { className: "td-parent-link", onClick: () => r(j.parentId), children: [
        /* @__PURE__ */ e.jsx(He, { size: 12 }),
        " Open parent task"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-title-row", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox lg p${j.priority}${ie ? " is-checked" : ""}`,
            style: { "--prio": Ee[j.priority] },
            "aria-label": ie ? "Reopen task" : "Complete task",
            onClick: async () => {
              await c(j) && W();
            },
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        P === "title" ? /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-title",
            value: $,
            rows: Math.min(5, Math.max(1, Math.ceil($.length / 40))),
            onChange: (n) => G(n.target.value),
            onBlur: () => void he(),
            onKeyDown: (n) => {
              n.key === "Enter" && !n.shiftKey && (n.preventDefault(), he()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), E(null));
            }
          }
        ) : /* @__PURE__ */ e.jsx("h2", { className: `td-drawer-title${ie ? " is-done" : ""}`, onClick: () => {
          G(j.content), E("title");
        }, title: "Click to edit", children: xe(j.content, h, "title") })
      ] }),
      P === "description" ? /* @__PURE__ */ e.jsxs("div", { className: "td-edit-desc-wrap", children: [
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-desc",
            value: $,
            placeholder: "Description (Markdown supported)",
            onChange: (n) => G(n.target.value),
            onKeyDown: (n) => {
              n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), he()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), E(null));
            }
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-edit-actions", children: [
          /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "⌘↵ to save" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => E(null), children: "Cancel" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", onClick: () => void he(), children: "Save" })
        ] })
      ] }) : j.description ? /* @__PURE__ */ e.jsx("div", { className: "td-desc", onClick: (n) => {
        n.target.closest("a") || (G(j.description), E("description"));
      }, title: "Click to edit", children: /* @__PURE__ */ e.jsx(ct, { text: j.description, open: h }) }) : /* @__PURE__ */ e.jsx("button", { className: "td-add-desc", onClick: () => {
        G(""), E("description");
      }, children: "Add description" }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-props", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Ve, { size: 13 }),
          "Due"
        ] }),
        /* @__PURE__ */ e.jsx("button", { ref: B.due, className: `td-prop-value tone-${ve}`, onClick: () => te("due"), children: j.due ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          j.due.recurring && /* @__PURE__ */ e.jsx(pt, { size: 12 }),
          Ge(j.due, a),
          /* @__PURE__ */ e.jsx("span", { className: "td-dim td-prop-sub", children: j.due.recurring ? j.due.string : "" })
        ] }) : /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "No date" }) }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(ht, { size: 13 }),
          "Deadline"
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-value-wrap", children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              className: `td-date-input${j.deadline ? "" : " is-empty"}`,
              value: j.deadline ?? "",
              onChange: (n) => void H({ deadline: n.target.value }),
              "aria-label": "Deadline"
            }
          ),
          j.deadline && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Clear deadline", onClick: () => void H({ deadline: "" }), children: /* @__PURE__ */ e.jsx(ue, { size: 12 }) })
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(ft, { size: 13 }),
          "Duration"
        ] }),
        /* @__PURE__ */ e.jsxs(
          "select",
          {
            className: "td-select",
            value: j.duration ? xs(j.duration) : "",
            onChange: (n) => {
              n.target.value && H({ duration: n.target.value });
            },
            "aria-label": "Duration",
            children: [
              /* @__PURE__ */ e.jsx("option", { value: "", disabled: !0, children: j.duration ? vt(j.duration) : "None" }),
              Nt.map((n) => /* @__PURE__ */ e.jsx("option", { value: n, children: n.replace("h30m", "h 30m") }, n))
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(rt, { size: 13, color: "currentColor" }),
          "Priority"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: B.priority, className: "td-prop-value", onClick: () => te("priority"), children: [
          /* @__PURE__ */ e.jsx(rt, { size: 13, color: j.priority === 1 ? "var(--td-muted)" : Ee[j.priority] }),
          "Priority ",
          5 - j.priority
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Ae, { size: 13 }),
          "Labels"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-prop-labels", children: [
          j.labels.map((n) => {
            const T = t.labels.find((R) => R.name === n);
            return /* @__PURE__ */ e.jsxs("span", { className: "td-label-pill", style: { "--label": Q(T?.color) }, children: [
              n,
              /* @__PURE__ */ e.jsx("button", { title: `Remove ${n}`, onClick: () => void H({ labels: j.labels.filter((R) => R !== n) }), children: /* @__PURE__ */ e.jsx(ue, { size: 10 }) })
            ] }, n);
          }),
          /* @__PURE__ */ e.jsx("button", { ref: B.labels, className: "td-icon-btn sm", title: "Add label", onClick: () => te("labels"), children: /* @__PURE__ */ e.jsx(Ne, { size: 12 }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(He, { size: 13 }),
          " Sub-tasks ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: ne.length || "" })
        ] }),
        ne.map((n) => /* @__PURE__ */ e.jsxs("div", { className: `td-subtask${n.completedAt ? " is-done" : ""}`, children: [
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: `td-checkbox sm p${n.priority}`,
              style: { "--prio": Ee[n.priority] },
              "aria-label": "Complete sub-task",
              onClick: async () => {
                await c(n) && W();
              },
              children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
            }
          ),
          /* @__PURE__ */ e.jsx("button", { className: "td-subtask-title", onClick: () => r(n.id), children: xe(n.content, h, n.id) }),
          n.due && /* @__PURE__ */ e.jsx("span", { className: `td-chip td-due tone-${Re(n.due, a)}`, children: Ge(n.due, a) })
        ] }, n.id)),
        /* @__PURE__ */ e.jsxs(
          "form",
          {
            className: "td-inline-add",
            onSubmit: async (n) => {
              n.preventDefault();
              const T = se.trim();
              if (!(!T || U)) {
                be(!0);
                try {
                  const R = await N.call("add", { content: T, parentId: j.id, projectId: j.projectId });
                  D((L) => L && { ...L, children: [...L.children, R] }), _("");
                } catch (R) {
                  x(Z(R));
                } finally {
                  be(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(Ne, { size: 13 }),
              /* @__PURE__ */ e.jsx("input", { value: se, onChange: (n) => _(n.target.value), placeholder: "Add sub-task", onKeyDown: (n) => {
                n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
              } })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(xt, { size: 13 }),
          " Comments ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: ae.length || "" })
        ] }),
        ae.map((n) => /* @__PURE__ */ e.jsxs("div", { className: "td-comment", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-comment-meta", children: new Date(n.postedAt).toLocaleString(void 0, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }),
          n.content && /* @__PURE__ */ e.jsx(ct, { text: n.content, open: h }),
          n.attachment && /* @__PURE__ */ e.jsxs("button", { className: "td-attachment", onClick: () => n.attachment?.url && h(n.attachment.url), children: [
            "📎 ",
            n.attachment.name
          ] })
        ] }, n.id)),
        /* @__PURE__ */ e.jsxs(
          "form",
          {
            className: "td-comment-form",
            onSubmit: async (n) => {
              n.preventDefault();
              const T = oe.trim();
              if (!(!T || U)) {
                be(!0);
                try {
                  const R = await N.call("comment", { taskId: j.id, content: T });
                  D((L) => L && { ...L, comments: [...L.comments, R] }), J("");
                } catch (R) {
                  x(Z(R));
                } finally {
                  be(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(
                "textarea",
                {
                  value: oe,
                  onChange: (n) => J(n.target.value),
                  placeholder: "Write a comment",
                  rows: oe.includes(`
`) ? 4 : 2,
                  onKeyDown: (n) => {
                    n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), n.currentTarget.form.requestSubmit()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
                  }
                }
              ),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !oe.trim() || U, children: "Comment" })
            ]
          }
        )
      ] })
    ] }),
    ee === "due" && /* @__PURE__ */ e.jsx(jt, { anchor: B.due.current, current: j.due?.string, onPick: (n) => void H({ due: n }), onClose: () => te(null) }),
    ee === "priority" && /* @__PURE__ */ e.jsx(bt, { anchor: B.priority.current, current: j.priority, onPick: (n) => void H({ priority: n }), onClose: () => te(null) }),
    ee === "labels" && /* @__PURE__ */ e.jsx(
      Yt,
      {
        anchor: B.labels.current,
        labels: t.labels,
        selected: j.labels,
        onChange: (n) => void H({ labels: n }),
        onCreate: f,
        onClose: () => te(null)
      }
    ),
    ee === "project" && /* @__PURE__ */ e.jsx(Bt, { anchor: B.project.current, meta: t, current: { projectId: j.projectId, sectionId: j.sectionId }, onPick: (n) => void we(n.projectId, n.sectionId), onClose: () => te(null) })
  ] });
}
function dt(s, t, a) {
  if (s === "title") {
    const o = t.trim();
    return o && o !== a.content ? { content: o } : null;
  }
  return t !== a.description ? { description: t } : null;
}
function xs(s) {
  if (s.unit === "day") return "";
  const t = Math.floor(s.amount / 60), a = s.amount % 60, o = `${t ? `${t}h` : ""}${a ? `${a}m` : ""}`;
  return Nt.includes(o) ? o : "";
}
function js(s) {
  const t = {};
  return s.content !== void 0 && (t.content = s.content), s.description !== void 0 && (t.description = s.description), s.priority !== void 0 && (t.priority = s.priority), s.labels !== void 0 && (t.labels = s.labels), s.deadline !== void 0 && (t.deadline = s.deadline || null), s.due === "" && (t.due = null), t;
}
const bs = d.memo(function({
  task: t,
  lookup: a,
  now: o,
  showProject: m,
  focused: c,
  completing: r,
  depth: x = 0,
  childCount: h = 0,
  onToggle: f,
  onOpen: y,
  onPatch: N,
  onFocus: g,
  onOpenUrl: D,
  onDelete: k
}) {
  const [A, P] = d.useState(null), z = d.useRef(null), $ = d.useRef(null), S = !!t.completedAt || r, v = Re(t.due, o), l = a.project(t.projectId), q = a.section(t.sectionId);
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: `td-task${c ? " is-focused" : ""}${S ? " is-done" : ""}${r ? " is-completing" : ""}`,
      style: x ? { paddingLeft: 12 + x * 26 } : void 0,
      "data-task-id": t.id,
      role: "listitem",
      "aria-label": t.content,
      onMouseDown: () => g(t),
      onClick: (E) => {
        E.target.closest("button, a, input") || y(t);
      },
      children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox p${t.priority}`,
            style: { "--prio": Ee[t.priority] },
            "aria-label": S ? "Reopen task" : "Complete task",
            title: S ? "Reopen" : "Complete",
            onClick: () => f(t),
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-task-title", children: xe(t.content, D, t.id) }),
          t.description && !S && /* @__PURE__ */ e.jsx("div", { className: "td-task-desc", children: t.description.split(`
`)[0] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-task-meta", children: [
            t.due && /* @__PURE__ */ e.jsxs("span", { className: `td-chip td-due tone-${v}`, title: t.due.string, children: [
              t.due.recurring ? /* @__PURE__ */ e.jsx(pt, { size: 12 }) : /* @__PURE__ */ e.jsx(Ve, { size: 12 }),
              Ge(t.due, o)
            ] }),
            t.deadline && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-deadline", title: "Deadline", children: [
              /* @__PURE__ */ e.jsx(ht, { size: 12 }),
              is(t.deadline, o)
            ] }),
            t.duration && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Duration", children: [
              /* @__PURE__ */ e.jsx(ft, { size: 12 }),
              vt(t.duration)
            ] }),
            h > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Subtasks", children: [
              /* @__PURE__ */ e.jsx(He, { size: 12 }),
              h
            ] }),
            t.commentCount > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Comments", children: [
              /* @__PURE__ */ e.jsx(xt, { size: 12 }),
              t.commentCount
            ] }),
            t.labels.map((E) => /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-label", style: { color: Q(a.label(E)?.color) }, children: [
              /* @__PURE__ */ e.jsx(Ae, { size: 12 }),
              E
            ] }, E)),
            t.completedAt && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", children: [
              "Completed ",
              new Date(t.completedAt).toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" })
            ] }),
            m && l && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-project-chip", children: [
              l.isInbox ? /* @__PURE__ */ e.jsx(Me, { size: 12 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: Q(l.color) } }),
              l.name,
              q ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
                " / ",
                q.name
              ] }) : null
            ] })
          ] })
        ] }),
        !S && /* @__PURE__ */ e.jsxs("div", { className: "td-task-actions", children: [
          /* @__PURE__ */ e.jsx("button", { ref: z, type: "button", className: "td-icon-btn", title: "Schedule (t = today)", onClick: () => P("due"), children: /* @__PURE__ */ e.jsx(Ve, {}) }),
          /* @__PURE__ */ e.jsx("button", { ref: $, type: "button", className: "td-icon-btn", title: "Priority (1–4)", onClick: () => P("priority"), children: /* @__PURE__ */ e.jsx(Wt, {}) }),
          k && /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-icon-btn danger", title: "Delete (⌫)", onClick: () => k(t), children: /* @__PURE__ */ e.jsx(Xe, {}) })
        ] }),
        A === "due" && /* @__PURE__ */ e.jsx(jt, { anchor: z.current, current: t.due?.string, onPick: (E) => N(t, { due: E }), onClose: () => P(null) }),
        A === "priority" && /* @__PURE__ */ e.jsx(bt, { anchor: $.current, current: t.priority, onPick: (E) => N(t, { priority: E }), onClose: () => P(null) })
      ]
    }
  );
}), ys = 650;
function Ts({ variant: s = "pane" } = {}) {
  const t = Je(), a = Ht(t), o = Vt(), m = a?.setup?.state === "ready";
  return d.useEffect(() => {
    t.call("status", {}).catch(() => {
    });
  }, [t]), m ? /* @__PURE__ */ e.jsx(ks, { variant: s, revision: a.revision, defaultView: a.settings.defaultView, now: o, user: a.setup.user }) : /* @__PURE__ */ e.jsx("div", { className: Ct(s), children: /* @__PURE__ */ e.jsx(Qt, { setup: a?.setup ?? null, onRetry: async () => {
    await t.call("status", { refresh: !0 });
  } }) });
}
const Ct = (s, t = "") => `td-root${s === "modal" ? " td-window-root" : ""}${t}`;
function ks({ variant: s, revision: t, defaultView: a, now: o, user: m }) {
  const c = Je(), [r, x] = d.useState({ kind: a }), [h, f] = Gt(c, "todoist.ui.sidebar", !0), [y, N] = d.useState(null), [g, D] = d.useState({}), [k, A] = d.useState([]), [P, z] = d.useState(null), [$, S] = d.useState(!1), [v, l] = d.useState(!0), [q, E] = d.useState(!1), [G, ee] = d.useState(null), [te, Fe] = d.useState({ today: null, inbox: null }), [je, oe] = d.useState(/* @__PURE__ */ new Set()), [J, se] = d.useState(null), [_, U] = d.useState(null), [be, B] = d.useState([]), [W, ye] = d.useState(!1), [H, we] = d.useState(""), [ke, j] = d.useState(() => window.innerWidth), [ne, ae] = d.useState(!1), [me, pe] = d.useState(!1), [ie, ve] = d.useState(null), he = d.useRef(r);
  he.current = r;
  const [n, T] = d.useState(null), R = d.useRef(null), L = d.useRef(null), Le = d.useRef(null), ge = d.useRef(0), Oe = d.useRef(1), qe = d.useRef(/* @__PURE__ */ new Set()), ce = ke < 640, wt = ke < 820, ze = ce ? ne : h;
  d.useEffect(() => {
    const i = () => j(window.innerWidth);
    return window.addEventListener("resize", i), () => window.removeEventListener("resize", i);
  }, []);
  const V = d.useCallback((i, u = {}) => {
    const p = Date.now() + Math.random();
    B((b) => [...b.slice(-2), { id: p, message: i, ...u }]), setTimeout(() => B((b) => b.filter((I) => I.id !== p)), u.action ? 6e3 : u.tone === "error" ? 7e3 : 3e3);
  }, []), M = d.useCallback((i) => {
    const u = ns(i);
    u === "NO_TOKEN" || u === "AUTH" || u === "TD_NOT_FOUND" || V(Z(i), { tone: "error" });
  }, [V]), Ke = d.useCallback((i) => {
    c.call("openUrl", { url: i }).catch(M);
  }, [c, M]);
  d.useEffect(() => {
    let i = !0;
    return c.call("meta", {}).then((u) => {
      i && N(u);
    }, M), () => {
      i = !1;
    };
  }, [c, t, M]);
  const _e = d.useCallback((i) => {
    c.call("sections", { projectId: i }).then(
      (u) => D((p) => ({ ...p, [i]: u })),
      () => {
      }
    );
  }, [c]), X = d.useMemo(
    () => y ? { ...y, sections: Object.values(g).flat() } : null,
    [y, g]
  ), Y = d.useCallback(async (i, u = "reset", p = null) => {
    const b = ++ge.current, I = u === "append";
    I ? E(!0) : l(!0);
    try {
      let C = await c.call("list", { ...i, cursor: I ? p : null }), K = C.tasks;
      if (u === "refresh")
        for (let w = 1; w < Oe.current && C.nextCursor && b === ge.current; w++)
          C = await c.call("list", { ...i, cursor: C.nextCursor }), K = [...K, ...C.tasks.filter((F) => !K.some((le) => le.id === F.id))];
      if (b !== ge.current) return;
      if (I ? Oe.current += 1 : u === "reset" && (Oe.current = 1), A((w) => I ? [...w, ...K.filter((F) => !w.some((le) => le.id === F.id))] : K), z(C.nextCursor), S(C.truncated), ee(null), !I && (i.kind === "today" || i.kind === "inbox")) {
        const w = K.filter((F) => !F.completedAt).length;
        Fe((F) => ({ ...F, [i.kind]: C.nextCursor ? null : w }));
      }
    } catch (C) {
      if (b !== ge.current) return;
      ee(Z(C)), M(C);
    } finally {
      b === ge.current && (l(!1), E(!1));
    }
  }, [c, M]), Ue = JSON.stringify(r), st = d.useRef(null);
  d.useEffect(() => {
    const i = st.current === Ue;
    st.current = Ue, Y(r, i ? "refresh" : "reset");
  }, [Ue, t, Y]);
  const nt = d.useMemo(() => {
    const i = new Map(X?.projects.map((b) => [b.id, b])), u = new Map(X?.sections.map((b) => [b.id, b])), p = new Map(X?.labels.map((b) => [b.name, b]));
    return {
      project: (b) => i.get(b),
      section: (b) => b ? u.get(b) : void 0,
      label: (b) => p.get(b)
    };
  }, [X]), Ye = X?.projects.find((i) => i.isInbox), fe = r.kind === "project" ? r.id : r.kind === "inbox" ? Ye?.id : void 0, de = fe ? nt.project(fe) : void 0;
  d.useEffect(() => {
    fe && _e(fe);
  }, [fe, t, _e]);
  const { groups: De, depths: Dt, childCounts: St } = d.useMemo(() => gs(r, k, o, X, fe), [r, k, o, X, fe]), O = d.useMemo(() => De.flatMap((i) => i.tasks), [De]), Se = d.useCallback(async (i) => {
    if (qe.current.has(i.id)) return !1;
    qe.current.add(i.id);
    const u = () => {
      qe.current.delete(i.id);
    };
    if (i.completedAt)
      try {
        return await c.call("uncomplete", { id: i.id }), V("Task reopened"), !0;
      } catch (p) {
        return M(p), !1;
      } finally {
        u();
      }
    oe((p) => new Set(p).add(i.id));
    try {
      return await c.call("complete", { id: i.id }), V(i.due?.recurring ? `Completed — next: ${i.due.string}` : "Task completed", {
        action: i.due?.recurring ? void 0 : {
          label: "Undo",
          run: () => {
            c.call("uncomplete", { id: i.id }).then(() => V("Task reopened"), M);
          }
        }
      }), setTimeout(() => {
        oe((p) => {
          const b = new Set(p);
          return b.delete(i.id), b;
        }), u();
      }, ys), !0;
    } catch (p) {
      return oe((b) => {
        const I = new Set(b);
        return I.delete(i.id), I;
      }), u(), M(p), !1;
    }
  }, [c, V, M]), Ie = d.useCallback(async (i, u) => {
    u.priority !== void 0 && A((p) => p.map((b) => b.id === i.id ? { ...b, priority: u.priority } : b));
    try {
      await c.call("update", { id: i.id, ...u });
    } catch (p) {
      M(p), Y(r, "refresh");
    }
  }, [c, M, Y, r]), It = d.useCallback(async (i) => {
    let u;
    try {
      u = await c.call("quickAdd", { text: i });
    } catch (p) {
      return M(p), !1;
    }
    try {
      await Jt(u, Xt(u, {
        due: r.kind === "today" ? "today" : null,
        labels: r.kind === "label" && r.query ? [r.query] : [],
        projectId: r.kind === "project" ? r.id : null,
        inboxId: Ye?.id ?? null
      }), {
        update: (p) => c.call("update", p),
        move: (p) => c.call("move", p)
      }), V(`Added “${u.content}”`, { action: { label: "Open", run: () => U(u.id) } });
    } catch (p) {
      const b = p instanceof Zt ? `${p.message} ${Z(p.cause)}` : Z(p);
      V(b, { tone: "error", action: { label: "Open", run: () => U(u.id) } });
    }
    return !0;
  }, [c, r, V, M, Ye?.id]), Be = d.useCallback((i, u) => {
    ve({ id: i, task: u ?? null, subtasks: null }), c.call("task", { id: i }).then(
      (p) => ve((b) => b?.id === i ? { id: i, task: p.task, subtasks: p.children.length } : b),
      () => {
      }
      // keep the cautious wording; deleting still works
    );
  }, [c]), Tt = d.useCallback(async (i) => {
    ve(null);
    const u = /* @__PURE__ */ new Set([i.id]);
    for (let I = !0; I; ) {
      I = !1;
      for (const C of k) C.parentId && u.has(C.parentId) && !u.has(C.id) && (u.add(C.id), I = !0);
    }
    A((I) => I.filter((C) => !u.has(C.id))), _ && u.has(_) && U(null);
    const p = O.findIndex((I) => I.id === i.id);
    if (p >= 0 || J && u.has(J)) {
      const I = p >= 0 ? p : O.findIndex((K) => K.id === J), C = O.slice(I + 1).find((K) => !u.has(K.id)) ?? O.slice(0, Math.max(0, I)).reverse().find((K) => !u.has(K.id));
      se(C?.id ?? null);
    }
    const b = i.task?.content ?? "task";
    try {
      await c.call("delete", { id: i.id }), V(`Deleted “${b}”`);
    } catch (I) {
      M(I), Y(he.current, "refresh");
    }
  }, [c, V, M, Y, _, J, O, k]), at = d.useCallback(async (i) => {
    try {
      await c.call("createLabel", { name: i });
    } catch (u) {
      throw M(u), u;
    }
  }, [c, M]), it = d.useCallback((i) => {
    ye(!1), ae(!1), se(null), gt(i, r) ? Y(i, "reset") : (A([]), z(null), x(i)), Le.current?.scrollTo({ top: 0 });
  }, [r, x, Y]);
  d.useEffect(() => {
    if (!W) return;
    const i = H.trim();
    if (!i) return;
    const u = setTimeout(() => {
      A([]), x({ kind: "search", query: i });
    }, 350);
    return () => clearTimeout(u);
  }, [H, W]);
  const Te = d.useCallback(() => {
    ye(!1), we(""), r.kind === "search" && (A([]), x({ kind: a }));
  }, [r.kind, a]);
  d.useEffect(() => cs((u) => {
    const p = u.target, b = p.closest('input, textarea, select, [contenteditable="true"]');
    if (u.key === "Escape") {
      if (u.defaultPrevented) return;
      if (me) {
        u.preventDefault(), pe(!1);
        return;
      }
      if (_) {
        u.preventDefault(), U(null);
        return;
      }
      if (W || r.kind === "search") {
        u.preventDefault(), Te();
        return;
      }
      if (ne) {
        u.preventDefault(), ae(!1);
        return;
      }
      return;
    }
    if (b || u.metaKey || u.ctrlKey || u.altKey || ie) return;
    const I = O.findIndex((F) => F.id === J), C = I >= 0 ? O[I] : null, K = (F) => {
      if (!O.length) return;
      const le = O[Math.max(0, Math.min(O.length - 1, (I < 0 ? F > 0 ? -1 : O.length : I) + F))];
      se(le.id), Le.current?.querySelector(`[data-task-id="${CSS.escape(le.id)}"]`)?.scrollIntoView({ block: "nearest" }), _ && U(le.id);
    }, w = u.key;
    if (!((w === "Enter" || w === " ") && ds(p)))
      if (w === "j" || w === "ArrowDown")
        u.preventDefault(), K(1);
      else if (w === "k" || w === "ArrowUp")
        u.preventDefault(), K(-1);
      else if ((w === "Enter" || w === "o") && C)
        u.preventDefault(), U(C.id);
      else if ((w === "x" || w === " ") && C)
        u.preventDefault(), Se(C);
      else if (/^[1-4]$/.test(w) && C)
        u.preventDefault(), Ie(C, { priority: 5 - Number(w) });
      else if (w === "t" && C)
        u.preventDefault(), Ie(C, { due: "today" });
      else if ((w === "Backspace" || w === "Delete") && !m?.readOnly && !p.closest('.td-popover, [role="dialog"]')) {
        const F = _ ?? C?.id;
        F && (u.preventDefault(), Be(F, O.find((le) => le.id === F)));
      } else w === "q" || w === "a" ? (u.preventDefault(), R.current?.focus()) : w === "/" ? (u.preventDefault(), ye(!0), requestAnimationFrame(() => L.current?.focus())) : w === "r" ? (u.preventDefault(), Y(r, "refresh"), c.call("meta", {}).then(N, () => {
      })) : w === "[" ? (u.preventDefault(), ce ? ae((F) => !F) : f(!h)) : w === "?" && (u.preventDefault(), pe((F) => !F));
  }), [O, J, _, W, ne, me, Se, Ie, Y, r, c, ce, h, f, Te, ie, m?.readOnly, Be]);
  const $t = vs(r, X), Et = O.filter((i) => !i.completedAt && !je.has(i.id)).length, At = r.kind === "today" ? "Due today unless you type a date" : r.kind === "project" && de ? `Adds to #${de.name}` : r.kind === "label" ? `Tagged @${r.query}` : r.kind === "inbox" ? "Adds to Inbox" : null, Rt = !m?.readOnly && r.kind !== "completed";
  return /* @__PURE__ */ e.jsxs("div", { className: Ct(s, ce ? " is-narrow" : ""), children: [
    /* @__PURE__ */ e.jsxs("div", { className: `td-layout${ze && !ce ? " has-sidebar" : ""}`, children: [
      ze && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        ce && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => ae(!1) }),
        /* @__PURE__ */ e.jsx(
          ms,
          {
            meta: X,
            current: r,
            counts: te,
            user: m,
            onSelect: it,
            onSearch: () => {
              ye(!0), ae(!1), requestAnimationFrame(() => L.current?.focus());
            },
            onCreateProject: async (i, u) => {
              try {
                const p = await c.call("createProject", { name: i, color: u });
                return it({ kind: "project", id: p.id }), !0;
              } catch (p) {
                return M(p), !1;
              }
            },
            onCreateLabel: async (i) => {
              try {
                return await at(i), !0;
              } catch {
                return !1;
              }
            },
            onSignOut: () => {
              c.call("logout", {}).catch(M);
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("main", { className: "td-main", children: [
        /* @__PURE__ */ e.jsxs("header", { className: "td-header", children: [
          /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: ze ? "Hide sidebar ([)" : "Show sidebar ([)", onClick: () => ce ? ae((i) => !i) : f(!h), children: /* @__PURE__ */ e.jsx(es, {}) }),
          W ? /* @__PURE__ */ e.jsxs("div", { className: "td-search", children: [
            /* @__PURE__ */ e.jsx(ut, {}),
            /* @__PURE__ */ e.jsx(
              "input",
              {
                ref: L,
                value: H,
                onChange: (i) => we(i.target.value),
                placeholder: "Search tasks",
                onKeyDown: (i) => {
                  i.key === "Escape" && (i.preventDefault(), Te()), i.key === "ArrowDown" && (i.preventDefault(), i.target.blur(), O[0] && se(O[0].id));
                }
              }
            ),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", onClick: Te, title: "Close search", children: /* @__PURE__ */ e.jsx(ue, { size: 12 }) })
          ] }) : /* @__PURE__ */ e.jsxs("div", { className: "td-title", children: [
            r.kind === "project" && de && /* @__PURE__ */ e.jsx("span", { className: "td-dot lg", style: { background: Q(de.color) } }),
            r.kind === "inbox" && /* @__PURE__ */ e.jsx(Me, {}),
            /* @__PURE__ */ e.jsx("h1", { children: $t }),
            !v && r.kind !== "completed" && /* @__PURE__ */ e.jsxs("span", { className: "td-title-count", children: [
              Et,
              P ? "+" : ""
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-header-tools", children: [
            de && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open project in Todoist", onClick: () => Ke(de.url), children: /* @__PURE__ */ e.jsx(mt, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Keyboard shortcuts (?)", onClick: () => pe(!0), children: /* @__PURE__ */ e.jsx(ts, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: `td-icon-btn${v ? " is-spinning" : ""}`, title: "Refresh (r)", onClick: () => {
              Y(r, "refresh"), c.call("meta", {}).then(N, () => {
              });
            }, children: /* @__PURE__ */ e.jsx(ss, {}) }),
            s === "modal" && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: () => void c.context.api.ui.close(), children: /* @__PURE__ */ e.jsx(ue, {}) })
          ] })
        ] }),
        Rt && /* @__PURE__ */ e.jsx("div", { className: "td-add-row", children: /* @__PURE__ */ e.jsx(
          us,
          {
            ref: R,
            placeholder: ce ? "Add a task" : 'Add a task — "Review PR tomorrow 3pm p1 #Work @review"',
            contextLabel: At,
            onSubmit: It
          }
        ) }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-list", ref: Le, role: "list", children: [
          v && !k.length ? /* @__PURE__ */ e.jsx(Cs, {}) : G && !k.length ? /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
            /* @__PURE__ */ e.jsx("p", { children: "Couldn’t load this list." }),
            /* @__PURE__ */ e.jsx("p", { className: "td-dim td-small", children: G }),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void Y(r, "reset"), children: "Try again" })
          ] }) : O.length ? De.map((i) => /* @__PURE__ */ e.jsxs("section", { className: "td-group", children: [
            (De.length > 1 || i.subtitle || i.key !== "all") && i.title && /* @__PURE__ */ e.jsxs("h2", { className: `td-group-title${i.tone ? ` tone-${i.tone}` : ""}`, children: [
              i.title,
              i.subtitle && /* @__PURE__ */ e.jsx("span", { className: "td-group-sub", children: i.subtitle }),
              /* @__PURE__ */ e.jsx("span", { className: "td-group-count", children: i.tasks.length })
            ] }),
            i.tasks.map((u) => /* @__PURE__ */ e.jsx(
              bs,
              {
                task: u,
                lookup: nt,
                now: o,
                showProject: r.kind !== "project" && r.kind !== "inbox",
                focused: J === u.id || _ === u.id,
                completing: je.has(u.id),
                depth: Dt.get(u.id) ?? 0,
                childCount: St.get(u.id) ?? 0,
                onToggle: Se,
                onOpen: (p) => {
                  se(p.id), U(p.id);
                },
                onPatch: Ie,
                onFocus: (p) => se(p.id),
                onOpenUrl: Ke,
                onDelete: m?.readOnly ? void 0 : (p) => {
                  se(p.id), Be(p.id, p);
                }
              },
              u.id
            ))
          ] }, i.key)) : /* @__PURE__ */ e.jsx(Ns, { view: r }),
          (P || $) && O.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "td-more", children: P ? /* @__PURE__ */ e.jsxs("button", { className: "td-btn", disabled: q, onClick: () => void Y(r, "append", P), children: [
            q ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
            " Load more"
          ] }) : /* @__PURE__ */ e.jsxs("span", { className: "td-dim td-small", children: [
            "Showing the first ",
            O.length,
            " tasks — this filter has more than can be loaded here. Open it in Todoist for the rest."
          ] }) }),
          r.kind === "project" && de && !m?.readOnly && !v && (n !== null ? /* @__PURE__ */ e.jsxs(
            "form",
            {
              className: "td-section-add",
              onSubmit: async (i) => {
                if (i.preventDefault(), !!n.trim())
                  try {
                    await c.call("createSection", { projectId: de.id, name: n.trim() }), T(null);
                  } catch (u) {
                    M(u);
                  }
              },
              children: [
                /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: n, onChange: (i) => T(i.target.value), placeholder: "Section name", onKeyDown: (i) => {
                  i.key === "Escape" && (i.preventDefault(), i.stopPropagation(), T(null));
                } }),
                /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !n.trim(), children: "Add section" }),
                /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => T(null), children: "Cancel" })
              ]
            }
          ) : /* @__PURE__ */ e.jsxs("button", { className: "td-add-section", onClick: () => T(""), children: [
            /* @__PURE__ */ e.jsx(Ne, { size: 12 }),
            " Add section"
          ] }))
        ] })
      ] }),
      _ && X && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        wt && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => U(null) }),
        /* @__PURE__ */ e.jsx(
          fs,
          {
            taskId: _,
            meta: X,
            now: o,
            onClose: () => U(null),
            onToggle: Se,
            onOpenTask: (i) => U(i),
            revision: t,
            onError: (i) => V(i, { tone: "error" }),
            onOpenUrl: Ke,
            onCreateLabel: at,
            onNeedSections: _e
          },
          _
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "td-toasts", "aria-live": "polite", children: be.map((i) => /* @__PURE__ */ e.jsxs("div", { className: `td-toast${i.tone === "error" ? " is-error" : ""}`, children: [
      /* @__PURE__ */ e.jsx("span", { children: i.message }),
      i.action && /* @__PURE__ */ e.jsx("button", { onClick: () => {
        i.action.run(), B((u) => u.filter((p) => p.id !== i.id));
      }, children: i.action.label })
    ] }, i.id)) }),
    me && /* @__PURE__ */ e.jsx(Ds, { onClose: () => pe(!1) }),
    ie && /* @__PURE__ */ e.jsx(ws, { target: ie, onCancel: () => ve(null), onConfirm: () => void Tt(ie) })
  ] });
}
function vs(s, t) {
  switch (s.kind) {
    case "today":
      return "Today";
    case "upcoming":
      return "Upcoming";
    case "inbox":
      return "Inbox";
    case "completed":
      return "Completed";
    case "search":
      return `Search: ${s.query ?? ""}`;
    case "label":
      return `@${s.query ?? ""}`;
    case "filter":
      return t?.filters.find((a) => a.id === s.id)?.name ?? "Filter";
    case "project":
      return t?.projects.find((a) => a.id === s.id)?.name ?? "Project";
  }
}
function gs(s, t, a, o, m) {
  const c = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), x = new Set(t.map((f) => f.id));
  for (const f of t) f.parentId && x.has(f.parentId) && r.set(f.parentId, (r.get(f.parentId) ?? 0) + 1);
  if (s.kind === "today") return { groups: ls(t, a), depths: c, childCounts: r };
  if (s.kind === "upcoming") return { groups: rs(t, a), depths: c, childCounts: r };
  if (s.kind === "completed") return { groups: os(t, a), depths: c, childCounts: r };
  if ((s.kind === "project" || s.kind === "inbox") && m) {
    const f = (o?.sections ?? []).filter((k) => k.projectId === m), y = /* @__PURE__ */ new Map();
    for (const k of t) {
      const A = k.sectionId && f.some((z) => z.id === k.sectionId) ? k.sectionId : null, P = y.get(A) ?? [];
      P.push(k), y.set(A, P);
    }
    const N = (k) => {
      const A = new Set(k.map((S) => S.id)), P = k.filter((S) => !S.parentId || !A.has(S.parentId)).sort((S, v) => S.order - v.order), z = [], $ = (S, v) => {
        z.push(S), c.set(S.id, v), k.filter((l) => l.parentId === S.id).sort((l, q) => l.order - q.order).forEach((l) => $(l, Math.min(v + 1, 4)));
      };
      return P.forEach((S) => $(S, 0)), z;
    }, g = [], D = y.get(null) ?? [];
    (D.length || !f.length) && g.push({ key: "all", title: "", tasks: N(D) });
    for (const k of f)
      g.push({ key: k.id, title: k.name, tasks: N(y.get(k.id) ?? []) });
    return { groups: g.filter((k) => k.tasks.length || k.key !== "all"), depths: c, childCounts: r };
  }
  return { groups: [{ key: "all", title: "", tasks: [...t].sort((f, y) => y.priority - f.priority || (f.due?.date ?? "9999").localeCompare(y.due?.date ?? "9999") || f.order - y.order) }], depths: c, childCounts: r };
}
function Ns({ view: s }) {
  const t = {
    today: ["You’re all done for today", "Enjoy the rest of your day — or add something below."],
    upcoming: ["Nothing scheduled in the next two weeks", "Tasks with a due date show up here."],
    inbox: ["Inbox zero", "New tasks without a project land here."],
    completed: ["No completed tasks yet", "Tasks you complete show up here."],
    search: ["No matching tasks", "Search looks at task names."]
  }, [a, o] = t[s.kind] ?? ["No tasks here", "Add one with the bar above."];
  return /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
    /* @__PURE__ */ e.jsxs("svg", { width: "96", height: "72", viewBox: "0 0 96 72", "aria-hidden": "true", className: "td-empty-art", children: [
      /* @__PURE__ */ e.jsx("rect", { x: "14", y: "10", width: "68", height: "52", rx: "10", fill: "var(--td-surface-hi)" }),
      /* @__PURE__ */ e.jsx("circle", { cx: "32", cy: "30", r: "6", fill: "none", stroke: "var(--td-accent)", strokeWidth: "2.5" }),
      /* @__PURE__ */ e.jsx("path", { d: "m29.4 30.2 2 2 3.6-3.8", fill: "none", stroke: "var(--td-accent)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }),
      /* @__PURE__ */ e.jsx("rect", { x: "44", y: "27", width: "26", height: "5", rx: "2.5", fill: "var(--td-border-hi)" }),
      /* @__PURE__ */ e.jsx("rect", { x: "26", y: "44", width: "44", height: "5", rx: "2.5", fill: "var(--td-border)" })
    ] }),
    /* @__PURE__ */ e.jsx("p", { className: "td-empty-title", children: a }),
    /* @__PURE__ */ e.jsx("p", { className: "td-dim", children: o })
  ] });
}
function Cs() {
  return /* @__PURE__ */ e.jsx("div", { className: "td-skeleton-list", "aria-busy": "true", children: [78, 52, 64, 40, 70].map((s, t) => /* @__PURE__ */ e.jsxs("div", { className: "td-task is-skeleton", children: [
    /* @__PURE__ */ e.jsx("span", { className: "td-checkbox" }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${s}%` } }),
      /* @__PURE__ */ e.jsx("span", { className: "td-skel sm", style: { width: `${s / 2}%` } })
    ] })
  ] }, t)) });
}
function ws({ target: s, onCancel: t, onConfirm: a }) {
  const o = d.useRef(null), m = d.useRef(t);
  m.current = t;
  const [c] = d.useState(() => document.activeElement);
  d.useEffect(() => {
    const f = (y) => {
      if (y.key === "Escape")
        y.preventDefault(), y.stopPropagation(), m.current();
      else if (y.key === "Tab") {
        const N = [...o.current?.querySelectorAll("button") ?? []];
        if (!N.length) return;
        y.preventDefault();
        const g = N.indexOf(document.activeElement);
        N[(g + (y.shiftKey ? -1 : 1) + N.length) % N.length].focus();
      }
    };
    return document.addEventListener("keydown", f, !0), () => {
      document.removeEventListener("keydown", f, !0), c?.isConnected && c.focus();
    };
  }, []);
  const { task: r, subtasks: x } = s, h = x === null ? " and any sub-tasks" : x > 0 ? ` and its ${x} sub-task${x > 1 ? "s" : ""} (with anything nested under them)` : "";
  return /* @__PURE__ */ e.jsx("div", { className: "td-modal-scrim", onClick: t, children: /* @__PURE__ */ e.jsxs("div", { ref: o, className: "td-help td-delete", onClick: (f) => f.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": "Delete task", children: [
    /* @__PURE__ */ e.jsx("div", { className: "td-help-head", children: /* @__PURE__ */ e.jsx("h2", { children: "Delete task?" }) }),
    /* @__PURE__ */ e.jsxs("p", { children: [
      r ? `“${r.content}”` : "This task",
      h,
      " will be deleted. This cannot be undone."
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-delete-actions", children: [
      /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: t, children: "Cancel" }),
      /* @__PURE__ */ e.jsxs("button", { className: "td-btn td-btn-danger", autoFocus: !0, onClick: a, children: [
        /* @__PURE__ */ e.jsx(Xe, { size: 13 }),
        " Delete"
      ] })
    ] })
  ] }) });
}
function Ds({ onClose: s }) {
  const t = [
    ["q / a", "Quick add"],
    ["/", "Search"],
    ["j / k  ↓ / ↑", "Move between tasks"],
    ["Enter / o", "Open task"],
    ["x / Space", "Complete / reopen"],
    ["1 – 4", "Set priority"],
    ["t", "Schedule for today"],
    ["⌫ / Delete", "Delete task (asks first)"],
    ["r", "Refresh"],
    ["[", "Toggle sidebar"],
    ["Esc", "Close help / drawer / search"],
    ["⌘⌥T", "Quick Add from anywhere in Agent Code"]
  ];
  return /* @__PURE__ */ e.jsx("div", { className: "td-modal-scrim", onClick: s, children: /* @__PURE__ */ e.jsxs("div", { className: "td-help", onClick: (a) => a.stopPropagation(), role: "dialog", "aria-label": "Keyboard shortcuts", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-help-head", children: [
      /* @__PURE__ */ e.jsx("h2", { children: "Keyboard shortcuts" }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: s, children: /* @__PURE__ */ e.jsx(ue, {}) })
    ] }),
    /* @__PURE__ */ e.jsx("dl", { children: t.map(([a, o]) => /* @__PURE__ */ e.jsxs("div", { children: [
      /* @__PURE__ */ e.jsx("dt", { children: a.split("  ").map((m) => /* @__PURE__ */ e.jsx("kbd", { children: m }, m)) }),
      /* @__PURE__ */ e.jsx("dd", { children: o })
    ] }, a)) })
  ] }) });
}
export {
  Ts as A
};

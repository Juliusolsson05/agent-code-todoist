import { r as d, t as At, c as Rt, j as e, n as Ne, b as V, L as Ae, o as it, q as dt, I as Me, T as Pt, v as Mt, w as Ft, x as Lt, y as Ot, U as qt, z as zt, u as Qe, E as de, M as Kt, G as ut, H as Ge, J as Be, P as Ee, C as We, R as mt, K as pt, N as ht, F as lt, O as ft, D as xt, d as jt, e as _t, f as Ut, Q as Yt, a as Bt, V as Wt, S as Ht, W as Vt, g as Qt, p as Gt, h as Jt, X as Xt, Y as Zt, Z as es } from "./shared-SetupScreen.js";
import { t as X, b as ts } from "./shared-types.js";
const Je = 864e5;
function le(s) {
  return Math.floor(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate()) / Je);
}
function Xe(s) {
  const [t, a, o] = s.slice(0, 10).split("-").map(Number);
  return new Date(t, (a || 1) - 1, o || 1);
}
function Ce(s) {
  return s.datetime ? le(new Date(s.datetime)) : le(Xe(s.date));
}
function Re(s, t) {
  if (!s) return "none";
  const a = le(t), o = Ce(s);
  return o < a || o === a && s.datetime && new Date(s.datetime).getTime() < t.getTime() ? "overdue" : o === a ? "today" : o === a + 1 ? "tomorrow" : o < a + 7 ? "week" : "future";
}
const ss = new Intl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit" }), bt = new Intl.DateTimeFormat(void 0, { weekday: "long" }), He = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric" }), yt = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", year: "numeric" }), Ze = new Intl.DateTimeFormat(void 0, { weekday: "short", month: "short", day: "numeric" });
function Ve(s, t) {
  const a = le(t), o = Ce(s), u = s.datetime ? new Date(s.datetime) : Xe(s.date);
  let c;
  return o === a ? c = "Today" : o === a + 1 ? c = "Tomorrow" : o === a - 1 ? c = "Yesterday" : o > a && o < a + 7 ? c = bt.format(u) : u.getFullYear() === t.getFullYear() ? c = He.format(u) : c = yt.format(u), s.datetime ? `${c} ${ss.format(u)}` : c;
}
function ns(s, t) {
  const a = Xe(s), o = le(a) - le(t);
  return o === 0 ? "Today" : o === 1 ? "Tomorrow" : o < 0 ? `${He.format(a)} (passed)` : a.getFullYear() === t.getFullYear() ? He.format(a) : yt.format(a);
}
function kt(s) {
  if (s.unit === "day") return s.amount === 1 ? "1 day" : `${s.amount} days`;
  const t = Math.floor(s.amount / 60), a = s.amount % 60;
  return t && a ? `${t}h ${a}m` : t ? `${t}h` : `${a}m`;
}
function Pe(s, t) {
  const a = s.due?.datetime ? new Date(s.due.datetime).getTime() : Number.POSITIVE_INFINITY, o = t.due?.datetime ? new Date(t.due.datetime).getTime() : Number.POSITIVE_INFINITY;
  return a !== o ? a - o : s.priority !== t.priority ? t.priority - s.priority : s.order - t.order;
}
function as(s, t) {
  const a = [], o = [];
  for (const c of s) (Re(c.due, t) === "overdue" ? a : o).push(c);
  a.sort((c, r) => (c.due && r.due ? Ce(c.due) - Ce(r.due) : 0) || Pe(c, r)), o.sort(Pe);
  const u = [];
  return a.length && u.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: a }), u.push({ key: "today", title: "Today", subtitle: Ze.format(t), tone: "today", tasks: o }), u;
}
function is(s, t) {
  const a = le(t), o = /* @__PURE__ */ new Map(), u = [], c = [];
  for (const x of s) {
    if (!x.due) {
      c.push(x);
      continue;
    }
    const p = Ce(x.due);
    if (p < a) {
      u.push(x);
      continue;
    }
    const f = o.get(p) ?? [];
    f.push(x), o.set(p, f);
  }
  const r = [];
  u.length && r.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: u.sort(Pe) });
  for (const x of [...o.keys()].sort((p, f) => p - f)) {
    const p = new Date(x * Je), f = new Date(p.getUTCFullYear(), p.getUTCMonth(), p.getUTCDate()), v = x === a ? "Today" : x === a + 1 ? "Tomorrow" : bt.format(f);
    r.push({
      key: `day-${x}`,
      title: v,
      subtitle: Ze.format(f),
      tone: x === a ? "today" : x === a + 1 ? "tomorrow" : "future",
      tasks: o.get(x).sort(Pe)
    });
  }
  return c.length && r.push({ key: "undated", title: "No date", tasks: c }), r;
}
function ls(s, t) {
  const a = le(t), o = /* @__PURE__ */ new Map();
  for (const u of s) {
    const c = u.completedAt ? le(new Date(u.completedAt)) : a, r = o.get(c) ?? [];
    r.push(u), o.set(c, r);
  }
  return [...o.keys()].sort((u, c) => c - u).map((u) => {
    const c = new Date(u * Je), r = new Date(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate());
    return {
      key: `done-${u}`,
      title: u === a ? "Today" : u === a - 1 ? "Yesterday" : Ze.format(r),
      tasks: o.get(u).sort((x, p) => (p.completedAt ?? "").localeCompare(x.completedAt ?? ""))
    };
  });
}
function rs(s) {
  return document.addEventListener("keydown", s), () => document.removeEventListener("keydown", s);
}
function os(s) {
  return s instanceof Element && !!s.closest('button, a[href], summary, select, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="option"], [role="checkbox"], [role="tab"], [role="switch"]');
}
const cs = d.forwardRef(function({ placeholder: t, contextLabel: a, disabled: o, onSubmit: u, autoFocus: c, large: r }, x) {
  const [p, f] = d.useState(""), [v, D] = d.useState(0), g = v > 0, C = d.useRef(null), k = d.useRef(null);
  d.useImperativeHandle(x, () => ({ focus: () => C.current?.focus() }), []);
  const $ = () => {
    k.current && C.current && (k.current.scrollLeft = C.current.scrollLeft);
  }, A = async () => {
    const y = p.trim();
    if (y) {
      f(""), D((l) => l + 1);
      try {
        await u(y) || f((l) => l || y);
      } finally {
        D((l) => l - 1), requestAnimationFrame(() => C.current?.focus());
      }
    }
  }, O = At(p), S = p ? Rt(p) : "", w = O.some((y) => y.kind !== "text");
  return /* @__PURE__ */ e.jsxs("div", { className: `td-quickadd${r ? " is-large" : ""}${g ? " is-busy" : ""}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-field", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-quickadd-plus", children: /* @__PURE__ */ e.jsx(Ne, {}) }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-stack", children: [
        /* @__PURE__ */ e.jsxs("div", { ref: k, className: "td-quickadd-mirror", "aria-hidden": "true", children: [
          O.map((y, l) => /* @__PURE__ */ e.jsx("span", { className: `tok-${y.kind}`, children: y.text }, l)),
          "​"
        ] }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            ref: C,
            className: "td-quickadd-input",
            value: p,
            disabled: o,
            autoFocus: c,
            spellCheck: !1,
            placeholder: t,
            "aria-label": "Quick add task",
            onChange: (y) => {
              f(y.target.value), requestAnimationFrame($);
            },
            onScroll: $,
            onKeyDown: (y) => {
              y.key === "Enter" && !y.nativeEvent.isComposing ? (y.preventDefault(), A()) : y.key === "Escape" && p ? (y.preventDefault(), y.stopPropagation(), f("")) : y.key === "Escape" && (y.preventDefault(), y.stopPropagation(), C.current?.blur());
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-primary td-quickadd-submit", disabled: !p.trim() || o, onClick: () => void A(), children: g && !p.trim() ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : "Add" })
    ] }),
    (w || a) && /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-hint", children: [
      w && S ? /* @__PURE__ */ e.jsxs("span", { children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: S }),
        "”"
      ] }) : null,
      a ? /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: a }) : null
    ] })
  ] });
});
function vt(s, t) {
  return s.kind === t.kind && (s.id ?? null) === (t.id ?? null) && (s.query ?? null) === (t.query ?? null);
}
function ds({ meta: s, current: t, counts: a, user: o, onSelect: u, onSearch: c, onCreateProject: r, onCreateLabel: x, onSignOut: p }) {
  const [f, v] = d.useState({ favorites: !0, projects: !0, labels: !1, filters: !1 }), [D, g] = d.useState(null), [C, k] = d.useState(""), [$, A] = d.useState("charcoal"), O = s?.projects.find((l) => l.isInbox), S = (l, F, I, Q, Z) => /* @__PURE__ */ e.jsxs(
    "button",
    {
      className: `td-nav-item${vt(t, l) ? " is-active" : ""}`,
      onClick: () => u(l),
      title: I,
      children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", style: Z ? { color: Z } : void 0, children: F }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: I }),
        Q ? /* @__PURE__ */ e.jsx("span", { className: "td-nav-count", children: Q }) : null
      ]
    },
    `${l.kind}:${l.id ?? l.query ?? ""}`
  ), w = [
    ...s?.projects.filter((l) => l.isFavorite && !l.isInbox).map((l) => S({ kind: "project", id: l.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: V(l.color) } }), l.name)) ?? [],
    ...s?.labels.filter((l) => l.isFavorite).map((l) => S({ kind: "label", query: l.name }, /* @__PURE__ */ e.jsx(Ae, {}), l.name, null, V(l.color))) ?? [],
    ...s?.filters.filter((l) => l.isFavorite).map((l) => S({ kind: "filter", id: l.id, query: l.query }, /* @__PURE__ */ e.jsx(it, {}), l.name, null, V(l.color))) ?? []
  ], y = async (l) => {
    l.preventDefault();
    const F = C.trim();
    !F || !(D === "project" ? await r(F, $) : D === "label" && await x(F)) || (k(""), g(null));
  };
  return /* @__PURE__ */ e.jsxs("nav", { className: "td-sidebar", "aria-label": "Todoist navigation", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-item", onClick: c, title: "Search (/)", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", children: /* @__PURE__ */ e.jsx(dt, {}) }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: "Search" }),
        /* @__PURE__ */ e.jsx("kbd", { children: "/" })
      ] }),
      S({ kind: "inbox" }, /* @__PURE__ */ e.jsx(Me, {}), "Inbox", a.inbox, "#246fe0"),
      S({ kind: "today" }, /* @__PURE__ */ e.jsx(Pt, {}), "Today", a.today, "#058527"),
      S({ kind: "upcoming" }, /* @__PURE__ */ e.jsx(qt, {}), "Upcoming", null, "#692fc2"),
      S({ kind: "completed" }, /* @__PURE__ */ e.jsx(zt, {}), "Completed", null, "#eb8909")
    ] }),
    w.length > 0 && /* @__PURE__ */ e.jsx($e, { title: "Favorites", open: f.favorites, onToggle: () => v((l) => ({ ...l, favorites: !l.favorites })), children: w }),
    /* @__PURE__ */ e.jsxs(
      $e,
      {
        title: "My Projects",
        open: f.projects,
        onToggle: () => v((l) => ({ ...l, projects: !l.projects })),
        onAdd: () => {
          g("project"), k(""), v((l) => ({ ...l, projects: !0 }));
        },
        children: [
          !s && /* @__PURE__ */ e.jsx(us, {}),
          s && Mt(s.projects).filter(({ project: l }) => l.id !== O?.id).map(({ project: l, depth: F }) => /* @__PURE__ */ e.jsx("div", { style: { paddingLeft: F * 12 }, children: S({ kind: "project", id: l.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: V(l.color) } }), l.name) }, l.id)),
          D === "project" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (l) => void y(l), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: C, onChange: (l) => k(l.target.value), placeholder: "Project name", onKeyDown: (l) => {
              l.key === "Escape" && (l.preventDefault(), l.stopPropagation(), g(null));
            } }),
            /* @__PURE__ */ e.jsx("div", { className: "td-swatches", children: Ft.map((l) => /* @__PURE__ */ e.jsx("button", { type: "button", title: l.replace("_", " "), className: `td-swatch${l === $ ? " is-on" : ""}`, style: { background: V(l) }, onClick: () => A(l) }, l)) }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => g(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !C.trim(), children: "Add project" })
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
        onToggle: () => v((l) => ({ ...l, labels: !l.labels })),
        onAdd: () => {
          g("label"), k(""), v((l) => ({ ...l, labels: !0 }));
        },
        children: [
          s?.labels.map((l) => S({ kind: "label", query: l.name }, /* @__PURE__ */ e.jsx(Ae, {}), l.name, null, V(l.color))),
          s && !s.labels.length && D !== "label" && /* @__PURE__ */ e.jsx("div", { className: "td-nav-empty", children: "No labels" }),
          D === "label" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (l) => void y(l), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: C, onChange: (l) => k(l.target.value), placeholder: "Label name", onKeyDown: (l) => {
              l.key === "Escape" && (l.preventDefault(), l.stopPropagation(), g(null));
            } }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => g(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !C.trim(), children: "Add label" })
            ] })
          ] })
        ]
      }
    ),
    s && s.filters.length > 0 && /* @__PURE__ */ e.jsx($e, { title: "Filters", open: f.filters, onToggle: () => v((l) => ({ ...l, filters: !l.filters })), children: s.filters.map((l) => S({ kind: "filter", id: l.id, query: l.query }, /* @__PURE__ */ e.jsx(it, {}), l.name, null, V(l.color))) }),
    o && /* @__PURE__ */ e.jsxs("div", { className: "td-account", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-avatar", children: (o.fullName || o.email || "?").slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ e.jsxs("span", { className: "td-account-text", children: [
        /* @__PURE__ */ e.jsx("span", { children: o.fullName || o.email }),
        o.readOnly && /* @__PURE__ */ e.jsx("span", { className: "td-dim td-small", children: "Read-only" })
      ] }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Sign out of td", onClick: p, children: /* @__PURE__ */ e.jsx(Lt, { size: 13 }) })
    ] })
  ] });
}
function $e({ title: s, open: t, onToggle: a, onAdd: o, children: u }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-heading", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-heading-btn", onClick: a, "aria-expanded": t, children: [
        /* @__PURE__ */ e.jsx(Ot, { size: 12, className: t ? "" : "is-collapsed" }),
        s
      ] }),
      o && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: `Add ${s.toLowerCase().replace("my ", "").replace(/s$/, "")}`, onClick: o, children: /* @__PURE__ */ e.jsx(Ne, { size: 12 }) })
    ] }),
    t && u
  ] });
}
function us() {
  return /* @__PURE__ */ e.jsx(e.Fragment, { children: [70, 55, 80].map((s) => /* @__PURE__ */ e.jsx("div", { className: "td-nav-item", children: /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${s}%` } }) }, s)) });
}
const Ye = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"]))/g;
function je(s, t, a = "i") {
  const o = [];
  let u = 0, c = 0;
  Ye.lastIndex = 0;
  for (let r = Ye.exec(s); r; r = Ye.exec(s)) {
    r.index > u && o.push(s.slice(u, r.index));
    const x = `${a}${c++}`;
    r[2] || r[3] ? o.push(/* @__PURE__ */ e.jsx("strong", { children: r[2] ?? r[3] }, x)) : r[4] || r[5] ? o.push(/* @__PURE__ */ e.jsx("em", { children: r[4] ?? r[5] }, x)) : r[6] ? o.push(/* @__PURE__ */ e.jsx("code", { children: r[6] }, x)) : r[7] && r[8] ? o.push(/* @__PURE__ */ e.jsx(rt, { url: r[8], open: t, children: r[7] }, x)) : r[9] && o.push(/* @__PURE__ */ e.jsx(rt, { url: r[9], open: t, children: ms(r[9]) }, x)), u = r.index + r[0].length;
  }
  return u < s.length && o.push(s.slice(u)), o;
}
function ms(s) {
  try {
    const t = new URL(s), a = t.pathname.length > 28 ? `${t.pathname.slice(0, 26)}…` : t.pathname;
    return `${t.hostname.replace(/^www\./, "")}${a === "/" ? "" : a}`;
  } catch {
    return s;
  }
}
function rt({ url: s, open: t, children: a }) {
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
function ot({ text: s, open: t }) {
  const a = s.replace(/\r\n/g, `
`).split(`
`), o = [];
  let u = 0, c = 0;
  for (; u < a.length; ) {
    const r = a[u];
    if (r.startsWith("```")) {
      const p = [];
      for (u++; u < a.length && !a[u].startsWith("```"); ) p.push(a[u++]);
      u++, o.push(/* @__PURE__ */ e.jsx("pre", { className: "td-md-pre", children: /* @__PURE__ */ e.jsx("code", { children: p.join(`
`) }) }, c++));
      continue;
    }
    if (/^\s*[-*]\s+/.test(r)) {
      const p = [];
      for (; u < a.length && /^\s*[-*]\s+/.test(a[u]); ) p.push(a[u++].replace(/^\s*[-*]\s+/, ""));
      o.push(/* @__PURE__ */ e.jsx("ul", { children: p.map((f, v) => /* @__PURE__ */ e.jsx("li", { children: je(f, t, `l${c}-${v}`) }, v)) }, c++));
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(r)) {
      const p = [];
      for (; u < a.length && /^\s*\d+[.)]\s+/.test(a[u]); ) p.push(a[u++].replace(/^\s*\d+[.)]\s+/, ""));
      o.push(/* @__PURE__ */ e.jsx("ol", { children: p.map((f, v) => /* @__PURE__ */ e.jsx("li", { children: je(f, t, `o${c}-${v}`) }, v)) }, c++));
      continue;
    }
    if (r.startsWith("> ")) {
      const p = [];
      for (; u < a.length && a[u].startsWith("> "); ) p.push(a[u++].slice(2));
      o.push(/* @__PURE__ */ e.jsx("blockquote", { children: je(p.join(" "), t, `q${c}`) }, c++));
      continue;
    }
    if (!r.trim()) {
      u++;
      continue;
    }
    const x = [];
    for (; u < a.length && a[u].trim() && !/^(```|\s*[-*]\s+|\s*\d+[.)]\s+|> )/.test(a[u]); ) x.push(a[u++]);
    o.push(
      /* @__PURE__ */ e.jsx("p", { children: x.map((p, f) => /* @__PURE__ */ e.jsxs(d.Fragment, { children: [
        f > 0 && /* @__PURE__ */ e.jsx("br", {}),
        je(p, t, `p${c}-${f}`)
      ] }, f)) }, c++)
    );
  }
  return /* @__PURE__ */ e.jsx("div", { className: "td-md", children: o });
}
const gt = ["15m", "30m", "45m", "1h", "1h30m", "2h", "3h", "4h"];
function ps({ taskId: s, meta: t, now: a, revision: o, onClose: u, onToggle: c, onOpenTask: r, onError: x, onOpenUrl: p, onCreateLabel: f, onNeedSections: v }) {
  const D = Qe(), [g, C] = d.useState(null), [k, $] = d.useState(null), [A, O] = d.useState(null), [S, w] = d.useState(""), y = d.useRef(null), l = d.useRef(""), F = d.useRef(null), I = (n) => {
    y.current = n, O(n);
  }, Q = (n) => {
    l.current = n, w(n);
  }, [Z, ee] = d.useState(null), [Fe, be] = d.useState(!1), [re, ue] = d.useState(""), [te, U] = d.useState(""), [K, ye] = d.useState(!1), Y = { due: d.useRef(null), priority: d.useRef(null), labels: d.useRef(null), project: d.useRef(null) }, B = async () => {
    try {
      $(null), C(await D.call("task", { id: s }));
    } catch (n) {
      $(X(n));
    }
  };
  d.useEffect(() => {
    C(null), I(null), be(!1), ue(""), B();
  }, [s]);
  const ke = d.useRef(o);
  d.useEffect(() => {
    o !== ke.current && B();
  }, [o]), F.current = g?.task ?? null, d.useEffect(() => () => {
    const n = y.current, E = F.current;
    if (!n || !E) return;
    const T = ct(n, l.current, E);
    T && D.call("update", { id: E.id, ...T }).catch((M) => x(X(M)));
  }, []);
  const W = async (n) => {
    if (!g) return;
    const E = g;
    C({ ...g, task: { ...g.task, ...fs(n) } });
    try {
      const T = await D.call("update", { id: g.task.id, ...n });
      C((M) => M && { ...M, task: T });
    } catch (T) {
      C(E), B(), x(X(T));
    }
  }, we = async (n, E) => {
    if (g)
      try {
        await D.call("move", { id: g.task.id, projectId: n, ...E ? { sectionId: E } : { noSection: !0 } }), C({ ...g, task: { ...g.task, projectId: n, sectionId: E } });
      } catch (T) {
        x(X(T));
      }
  }, ve = g?.task.projectId;
  if (d.useEffect(() => {
    ve && v(ve);
  }, [ve, v]), k)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", {}),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: u, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(de, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
        /* @__PURE__ */ e.jsx("p", { children: k }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void B(), children: "Try again" })
      ] })
    ] });
  if (!g)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: 120 } }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: u, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(de, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "80%", height: 20, marginBottom: 14 } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "60%" } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "40%", marginTop: 8 } })
      ] })
    ] });
  const { task: j, children: ne, comments: ae } = g, me = t.projects.find((n) => n.id === j.projectId), pe = t.sections.find((n) => n.id === j.sectionId), G = !!j.completedAt, he = Re(j.due, a), se = async () => {
    const n = y.current;
    if (!n) return;
    I(null);
    const E = ct(n, l.current, j);
    E && await W(E);
  };
  return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", "aria-label": "Task details", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: Y.project, className: "td-crumb", onClick: () => ee("project"), title: "Move to project / section", children: [
        me?.isInbox ? /* @__PURE__ */ e.jsx(Me, { size: 13 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: V(me?.color) } }),
        /* @__PURE__ */ e.jsx("span", { children: me?.name ?? "Project" }),
        pe && /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
          "/ ",
          pe.name
        ] }),
        /* @__PURE__ */ e.jsx(Kt, { size: 12, className: "td-crumb-move" })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-tools", children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open in Todoist", onClick: () => p(j.url), children: /* @__PURE__ */ e.jsx(ut, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn danger", title: "Delete task", onClick: () => be(!0), children: /* @__PURE__ */ e.jsx(Ge, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: u, children: /* @__PURE__ */ e.jsx(de, {}) })
      ] })
    ] }),
    Fe && /* @__PURE__ */ e.jsxs("div", { className: "td-confirm", children: [
      /* @__PURE__ */ e.jsxs("span", { children: [
        "Delete this task",
        ne.length ? ` and its ${ne.length} subtask${ne.length > 1 ? "s" : ""}` : "",
        "? This cannot be undone."
      ] }),
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => be(!1), children: "Cancel" }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            className: "td-btn td-btn-danger",
            autoFocus: !0,
            onClick: async () => {
              try {
                await D.call("delete", { id: j.id }), u();
              } catch (n) {
                x(X(n));
              }
            },
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
      j.parentId && /* @__PURE__ */ e.jsxs("button", { className: "td-parent-link", onClick: () => r(j.parentId), children: [
        /* @__PURE__ */ e.jsx(Be, { size: 12 }),
        " Open parent task"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-title-row", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox lg p${j.priority}${G ? " is-checked" : ""}`,
            style: { "--prio": Ee[j.priority] },
            "aria-label": G ? "Reopen task" : "Complete task",
            onClick: async () => {
              await c(j) && B();
            },
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        A === "title" ? /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-title",
            value: S,
            rows: Math.min(5, Math.max(1, Math.ceil(S.length / 40))),
            onChange: (n) => Q(n.target.value),
            onBlur: () => void se(),
            onKeyDown: (n) => {
              n.key === "Enter" && !n.shiftKey && (n.preventDefault(), se()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), I(null));
            }
          }
        ) : /* @__PURE__ */ e.jsx("h2", { className: `td-drawer-title${G ? " is-done" : ""}`, onClick: () => {
          Q(j.content), I("title");
        }, title: "Click to edit", children: je(j.content, p, "title") })
      ] }),
      A === "description" ? /* @__PURE__ */ e.jsxs("div", { className: "td-edit-desc-wrap", children: [
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-desc",
            value: S,
            placeholder: "Description (Markdown supported)",
            onChange: (n) => Q(n.target.value),
            onKeyDown: (n) => {
              n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), se()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), I(null));
            }
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-edit-actions", children: [
          /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "⌘↵ to save" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => I(null), children: "Cancel" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", onClick: () => void se(), children: "Save" })
        ] })
      ] }) : j.description ? /* @__PURE__ */ e.jsx("div", { className: "td-desc", onClick: (n) => {
        n.target.closest("a") || (Q(j.description), I("description"));
      }, title: "Click to edit", children: /* @__PURE__ */ e.jsx(ot, { text: j.description, open: p }) }) : /* @__PURE__ */ e.jsx("button", { className: "td-add-desc", onClick: () => {
        Q(""), I("description");
      }, children: "Add description" }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-props", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(We, { size: 13 }),
          "Due"
        ] }),
        /* @__PURE__ */ e.jsx("button", { ref: Y.due, className: `td-prop-value tone-${he}`, onClick: () => ee("due"), children: j.due ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          j.due.recurring && /* @__PURE__ */ e.jsx(mt, { size: 12 }),
          Ve(j.due, a),
          /* @__PURE__ */ e.jsx("span", { className: "td-dim td-prop-sub", children: j.due.recurring ? j.due.string : "" })
        ] }) : /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "No date" }) }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(pt, { size: 13 }),
          "Deadline"
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-value-wrap", children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              className: `td-date-input${j.deadline ? "" : " is-empty"}`,
              value: j.deadline ?? "",
              onChange: (n) => void W({ deadline: n.target.value }),
              "aria-label": "Deadline"
            }
          ),
          j.deadline && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Clear deadline", onClick: () => void W({ deadline: "" }), children: /* @__PURE__ */ e.jsx(de, { size: 12 }) })
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(ht, { size: 13 }),
          "Duration"
        ] }),
        /* @__PURE__ */ e.jsxs(
          "select",
          {
            className: "td-select",
            value: j.duration ? hs(j.duration) : "",
            onChange: (n) => {
              n.target.value && W({ duration: n.target.value });
            },
            "aria-label": "Duration",
            children: [
              /* @__PURE__ */ e.jsx("option", { value: "", disabled: !0, children: j.duration ? kt(j.duration) : "None" }),
              gt.map((n) => /* @__PURE__ */ e.jsx("option", { value: n, children: n.replace("h30m", "h 30m") }, n))
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(lt, { size: 13, color: "currentColor" }),
          "Priority"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: Y.priority, className: "td-prop-value", onClick: () => ee("priority"), children: [
          /* @__PURE__ */ e.jsx(lt, { size: 13, color: j.priority === 1 ? "var(--td-muted)" : Ee[j.priority] }),
          "Priority ",
          5 - j.priority
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Ae, { size: 13 }),
          "Labels"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-prop-labels", children: [
          j.labels.map((n) => {
            const E = t.labels.find((T) => T.name === n);
            return /* @__PURE__ */ e.jsxs("span", { className: "td-label-pill", style: { "--label": V(E?.color) }, children: [
              n,
              /* @__PURE__ */ e.jsx("button", { title: `Remove ${n}`, onClick: () => void W({ labels: j.labels.filter((T) => T !== n) }), children: /* @__PURE__ */ e.jsx(de, { size: 10 }) })
            ] }, n);
          }),
          /* @__PURE__ */ e.jsx("button", { ref: Y.labels, className: "td-icon-btn sm", title: "Add label", onClick: () => ee("labels"), children: /* @__PURE__ */ e.jsx(Ne, { size: 12 }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(Be, { size: 13 }),
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
                await c(n) && B();
              },
              children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
            }
          ),
          /* @__PURE__ */ e.jsx("button", { className: "td-subtask-title", onClick: () => r(n.id), children: je(n.content, p, n.id) }),
          n.due && /* @__PURE__ */ e.jsx("span", { className: `td-chip td-due tone-${Re(n.due, a)}`, children: Ve(n.due, a) })
        ] }, n.id)),
        /* @__PURE__ */ e.jsxs(
          "form",
          {
            className: "td-inline-add",
            onSubmit: async (n) => {
              n.preventDefault();
              const E = te.trim();
              if (!(!E || K)) {
                ye(!0);
                try {
                  const T = await D.call("add", { content: E, parentId: j.id, projectId: j.projectId });
                  C((M) => M && { ...M, children: [...M.children, T] }), U("");
                } catch (T) {
                  x(X(T));
                } finally {
                  ye(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(Ne, { size: 13 }),
              /* @__PURE__ */ e.jsx("input", { value: te, onChange: (n) => U(n.target.value), placeholder: "Add sub-task", onKeyDown: (n) => {
                n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
              } })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(ft, { size: 13 }),
          " Comments ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: ae.length || "" })
        ] }),
        ae.map((n) => /* @__PURE__ */ e.jsxs("div", { className: "td-comment", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-comment-meta", children: new Date(n.postedAt).toLocaleString(void 0, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }),
          n.content && /* @__PURE__ */ e.jsx(ot, { text: n.content, open: p }),
          n.attachment && /* @__PURE__ */ e.jsxs("button", { className: "td-attachment", onClick: () => n.attachment?.url && p(n.attachment.url), children: [
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
              const E = re.trim();
              if (!(!E || K)) {
                ye(!0);
                try {
                  const T = await D.call("comment", { taskId: j.id, content: E });
                  C((M) => M && { ...M, comments: [...M.comments, T] }), ue("");
                } catch (T) {
                  x(X(T));
                } finally {
                  ye(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(
                "textarea",
                {
                  value: re,
                  onChange: (n) => ue(n.target.value),
                  placeholder: "Write a comment",
                  rows: re.includes(`
`) ? 4 : 2,
                  onKeyDown: (n) => {
                    n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), n.currentTarget.form.requestSubmit()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
                  }
                }
              ),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !re.trim() || K, children: "Comment" })
            ]
          }
        )
      ] })
    ] }),
    Z === "due" && /* @__PURE__ */ e.jsx(xt, { anchor: Y.due.current, current: j.due?.string, onPick: (n) => void W({ due: n }), onClose: () => ee(null) }),
    Z === "priority" && /* @__PURE__ */ e.jsx(jt, { anchor: Y.priority.current, current: j.priority, onPick: (n) => void W({ priority: n }), onClose: () => ee(null) }),
    Z === "labels" && /* @__PURE__ */ e.jsx(
      _t,
      {
        anchor: Y.labels.current,
        labels: t.labels,
        selected: j.labels,
        onChange: (n) => void W({ labels: n }),
        onCreate: f,
        onClose: () => ee(null)
      }
    ),
    Z === "project" && /* @__PURE__ */ e.jsx(Ut, { anchor: Y.project.current, meta: t, current: { projectId: j.projectId, sectionId: j.sectionId }, onPick: (n) => void we(n.projectId, n.sectionId), onClose: () => ee(null) })
  ] });
}
function ct(s, t, a) {
  if (s === "title") {
    const o = t.trim();
    return o && o !== a.content ? { content: o } : null;
  }
  return t !== a.description ? { description: t } : null;
}
function hs(s) {
  if (s.unit === "day") return "";
  const t = Math.floor(s.amount / 60), a = s.amount % 60, o = `${t ? `${t}h` : ""}${a ? `${a}m` : ""}`;
  return gt.includes(o) ? o : "";
}
function fs(s) {
  const t = {};
  return s.content !== void 0 && (t.content = s.content), s.description !== void 0 && (t.description = s.description), s.priority !== void 0 && (t.priority = s.priority), s.labels !== void 0 && (t.labels = s.labels), s.deadline !== void 0 && (t.deadline = s.deadline || null), s.due === "" && (t.due = null), t;
}
const xs = d.memo(function({
  task: t,
  lookup: a,
  now: o,
  showProject: u,
  focused: c,
  completing: r,
  depth: x = 0,
  childCount: p = 0,
  onToggle: f,
  onOpen: v,
  onPatch: D,
  onFocus: g,
  onOpenUrl: C,
  onDelete: k
}) {
  const [$, A] = d.useState(null), O = d.useRef(null), S = d.useRef(null), w = !!t.completedAt || r, y = Re(t.due, o), l = a.project(t.projectId), F = a.section(t.sectionId);
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: `td-task${c ? " is-focused" : ""}${w ? " is-done" : ""}${r ? " is-completing" : ""}`,
      style: x ? { paddingLeft: 12 + x * 26 } : void 0,
      "data-task-id": t.id,
      role: "listitem",
      "aria-label": t.content,
      onMouseDown: () => g(t),
      onClick: (I) => {
        I.target.closest("button, a, input") || v(t);
      },
      children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox p${t.priority}`,
            style: { "--prio": Ee[t.priority] },
            "aria-label": w ? "Reopen task" : "Complete task",
            title: w ? "Reopen" : "Complete",
            onClick: () => f(t),
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-task-title", children: je(t.content, C, t.id) }),
          t.description && !w && /* @__PURE__ */ e.jsx("div", { className: "td-task-desc", children: t.description.split(`
`)[0] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-task-meta", children: [
            t.due && /* @__PURE__ */ e.jsxs("span", { className: `td-chip td-due tone-${y}`, title: t.due.string, children: [
              t.due.recurring ? /* @__PURE__ */ e.jsx(mt, { size: 12 }) : /* @__PURE__ */ e.jsx(We, { size: 12 }),
              Ve(t.due, o)
            ] }),
            t.deadline && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-deadline", title: "Deadline", children: [
              /* @__PURE__ */ e.jsx(pt, { size: 12 }),
              ns(t.deadline, o)
            ] }),
            t.duration && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Duration", children: [
              /* @__PURE__ */ e.jsx(ht, { size: 12 }),
              kt(t.duration)
            ] }),
            p > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Subtasks", children: [
              /* @__PURE__ */ e.jsx(Be, { size: 12 }),
              p
            ] }),
            t.commentCount > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Comments", children: [
              /* @__PURE__ */ e.jsx(ft, { size: 12 }),
              t.commentCount
            ] }),
            t.labels.map((I) => /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-label", style: { color: V(a.label(I)?.color) }, children: [
              /* @__PURE__ */ e.jsx(Ae, { size: 12 }),
              I
            ] }, I)),
            t.completedAt && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", children: [
              "Completed ",
              new Date(t.completedAt).toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" })
            ] }),
            u && l && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-project-chip", children: [
              l.isInbox ? /* @__PURE__ */ e.jsx(Me, { size: 12 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: V(l.color) } }),
              l.name,
              F ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
                " / ",
                F.name
              ] }) : null
            ] })
          ] })
        ] }),
        !w && /* @__PURE__ */ e.jsxs("div", { className: "td-task-actions", children: [
          /* @__PURE__ */ e.jsx("button", { ref: O, type: "button", className: "td-icon-btn", title: "Schedule (t = today)", onClick: () => A("due"), children: /* @__PURE__ */ e.jsx(We, {}) }),
          /* @__PURE__ */ e.jsx("button", { ref: S, type: "button", className: "td-icon-btn", title: "Priority (1–4)", onClick: () => A("priority"), children: /* @__PURE__ */ e.jsx(Yt, {}) }),
          k && /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-icon-btn danger", title: "Delete (⌫)", onClick: () => k(t), children: /* @__PURE__ */ e.jsx(Ge, {}) })
        ] }),
        $ === "due" && /* @__PURE__ */ e.jsx(xt, { anchor: O.current, current: t.due?.string, onPick: (I) => D(t, { due: I }), onClose: () => A(null) }),
        $ === "priority" && /* @__PURE__ */ e.jsx(jt, { anchor: S.current, current: t.priority, onPick: (I) => D(t, { priority: I }), onClose: () => A(null) })
      ]
    }
  );
}), js = 650;
function Ss({ variant: s = "pane" } = {}) {
  const t = Qe(), a = Bt(t), o = Wt(), u = a?.setup?.state === "ready";
  return d.useEffect(() => {
    t.call("status", {}).catch(() => {
    });
  }, [t]), u ? /* @__PURE__ */ e.jsx(bs, { variant: s, revision: a.revision, defaultView: a.settings.defaultView, now: o, user: a.setup.user }) : /* @__PURE__ */ e.jsx("div", { className: Nt(s), children: /* @__PURE__ */ e.jsx(Ht, { setup: a?.setup ?? null, onRetry: async () => {
    await t.call("status", { refresh: !0 });
  } }) });
}
const Nt = (s, t = "") => `td-root${s === "modal" ? " td-window-root" : ""}${t}`;
function bs({ variant: s, revision: t, defaultView: a, now: o, user: u }) {
  const c = Qe(), [r, x] = d.useState({ kind: a }), [p, f] = Vt(c, "todoist.ui.sidebar", !0), [v, D] = d.useState(null), [g, C] = d.useState({}), [k, $] = d.useState([]), [A, O] = d.useState(null), [S, w] = d.useState(!1), [y, l] = d.useState(!0), [F, I] = d.useState(!1), [Q, Z] = d.useState(null), [ee, Fe] = d.useState({ today: null, inbox: null }), [be, re] = d.useState(/* @__PURE__ */ new Set()), [ue, te] = d.useState(null), [U, K] = d.useState(null), [ye, Y] = d.useState([]), [B, ke] = d.useState(!1), [W, we] = d.useState(""), [ve, j] = d.useState(() => window.innerWidth), [ne, ae] = d.useState(!1), [me, pe] = d.useState(!1), [G, he] = d.useState(null), [se, n] = d.useState(null), E = d.useRef(null), T = d.useRef(null), M = d.useRef(null), ge = d.useRef(0), Le = d.useRef(1), Oe = d.useRef(/* @__PURE__ */ new Set()), oe = ve < 640, Ct = ve < 820, qe = oe ? ne : p;
  d.useEffect(() => {
    const i = () => j(window.innerWidth);
    return window.addEventListener("resize", i), () => window.removeEventListener("resize", i);
  }, []);
  const H = d.useCallback((i, m = {}) => {
    const h = Date.now() + Math.random();
    Y((b) => [...b.slice(-2), { id: h, message: i, ...m }]), setTimeout(() => Y((b) => b.filter((L) => L.id !== h)), m.action ? 6e3 : m.tone === "error" ? 7e3 : 3e3);
  }, []), P = d.useCallback((i) => {
    const m = ts(i);
    m === "NO_TOKEN" || m === "AUTH" || m === "TD_NOT_FOUND" || H(X(i), { tone: "error" });
  }, [H]), ze = d.useCallback((i) => {
    c.call("openUrl", { url: i }).catch(P);
  }, [c, P]);
  d.useEffect(() => {
    let i = !0;
    return c.call("meta", {}).then((m) => {
      i && D(m);
    }, P), () => {
      i = !1;
    };
  }, [c, t, P]);
  const Ke = d.useCallback((i) => {
    c.call("sections", { projectId: i }).then(
      (m) => C((h) => ({ ...h, [i]: m })),
      () => {
      }
    );
  }, [c]), J = d.useMemo(
    () => v ? { ...v, sections: Object.values(g).flat() } : null,
    [v, g]
  ), _ = d.useCallback(async (i, m = "reset", h = null) => {
    const b = ++ge.current, L = m === "append";
    L ? I(!0) : l(!0);
    try {
      let R = await c.call("list", { ...i, cursor: L ? h : null }), ie = R.tasks;
      if (m === "refresh")
        for (let N = 1; N < Le.current && R.nextCursor && b === ge.current; N++)
          R = await c.call("list", { ...i, cursor: R.nextCursor }), ie = [...ie, ...R.tasks.filter((z) => !ie.some((xe) => xe.id === z.id))];
      if (b !== ge.current) return;
      if (L ? Le.current += 1 : m === "reset" && (Le.current = 1), $((N) => L ? [...N, ...ie.filter((z) => !N.some((xe) => xe.id === z.id))] : ie), O(R.nextCursor), w(R.truncated), Z(null), !L && (i.kind === "today" || i.kind === "inbox")) {
        const N = ie.filter((z) => !z.completedAt).length;
        Fe((z) => ({ ...z, [i.kind]: R.nextCursor ? null : N }));
      }
    } catch (R) {
      if (b !== ge.current) return;
      Z(X(R)), P(R);
    } finally {
      b === ge.current && (l(!1), I(!1));
    }
  }, [c, P]), _e = JSON.stringify(r), et = d.useRef(null);
  d.useEffect(() => {
    const i = et.current === _e;
    et.current = _e, _(r, i ? "refresh" : "reset");
  }, [_e, t, _]);
  const tt = d.useMemo(() => {
    const i = new Map(J?.projects.map((b) => [b.id, b])), m = new Map(J?.sections.map((b) => [b.id, b])), h = new Map(J?.labels.map((b) => [b.name, b]));
    return {
      project: (b) => i.get(b),
      section: (b) => b ? m.get(b) : void 0,
      label: (b) => h.get(b)
    };
  }, [J]), Ue = J?.projects.find((i) => i.isInbox), fe = r.kind === "project" ? r.id : r.kind === "inbox" ? Ue?.id : void 0, ce = fe ? tt.project(fe) : void 0;
  d.useEffect(() => {
    fe && Ke(fe);
  }, [fe, t, Ke]);
  const { groups: De, depths: wt, childCounts: st } = d.useMemo(() => ks(r, k, o, J, fe), [r, k, o, J, fe]), q = d.useMemo(() => De.flatMap((i) => i.tasks), [De]), Se = d.useCallback(async (i) => {
    if (Oe.current.has(i.id)) return !1;
    Oe.current.add(i.id);
    const m = () => {
      Oe.current.delete(i.id);
    };
    if (i.completedAt)
      try {
        return await c.call("uncomplete", { id: i.id }), H("Task reopened"), !0;
      } catch (h) {
        return P(h), !1;
      } finally {
        m();
      }
    re((h) => new Set(h).add(i.id));
    try {
      return await c.call("complete", { id: i.id }), H(i.due?.recurring ? `Completed — next: ${i.due.string}` : "Task completed", {
        action: i.due?.recurring ? void 0 : {
          label: "Undo",
          run: () => {
            c.call("uncomplete", { id: i.id }).then(() => H("Task reopened"), P);
          }
        }
      }), setTimeout(() => {
        re((h) => {
          const b = new Set(h);
          return b.delete(i.id), b;
        }), m();
      }, js), !0;
    } catch (h) {
      return re((b) => {
        const L = new Set(b);
        return L.delete(i.id), L;
      }), m(), P(h), !1;
    }
  }, [c, H, P]), Ie = d.useCallback(async (i, m) => {
    m.priority !== void 0 && $((h) => h.map((b) => b.id === i.id ? { ...b, priority: m.priority } : b));
    try {
      await c.call("update", { id: i.id, ...m });
    } catch (h) {
      P(h), _(r, "refresh");
    }
  }, [c, P, _, r]), Dt = d.useCallback(async (i) => {
    let m;
    try {
      m = await c.call("quickAdd", { text: i });
    } catch (h) {
      return P(h), !1;
    }
    try {
      await Qt(m, Gt(m, {
        due: r.kind === "today" ? "today" : null,
        labels: r.kind === "label" && r.query ? [r.query] : [],
        projectId: r.kind === "project" ? r.id : null,
        inboxId: Ue?.id ?? null
      }), {
        update: (h) => c.call("update", h),
        move: (h) => c.call("move", h)
      }), H(`Added “${m.content}”`, { action: { label: "Open", run: () => K(m.id) } });
    } catch (h) {
      const b = h instanceof Jt ? `${h.message} ${X(h.cause)}` : X(h);
      H(b, { tone: "error", action: { label: "Open", run: () => K(m.id) } });
    }
    return !0;
  }, [c, r, H, P, Ue?.id]), St = d.useCallback(async (i) => {
    he(null), $((b) => b.filter((L) => L.id !== i.id && L.parentId !== i.id)), U === i.id && K(null);
    const m = q.findIndex((b) => b.id === i.id), h = q[m + 1] ?? q[m - 1];
    te(h && h.id !== i.id ? h.id : null);
    try {
      await c.call("delete", { id: i.id }), H(`Deleted “${i.content}”`);
    } catch (b) {
      P(b), _(r, "refresh");
    }
  }, [c, H, P, _, r, U, q]), nt = d.useCallback(async (i) => {
    try {
      await c.call("createLabel", { name: i });
    } catch (m) {
      throw P(m), m;
    }
  }, [c, P]), at = d.useCallback((i) => {
    ke(!1), ae(!1), te(null), vt(i, r) ? _(i, "reset") : ($([]), O(null), x(i)), M.current?.scrollTo({ top: 0 });
  }, [r, x, _]);
  d.useEffect(() => {
    if (!B) return;
    const i = W.trim();
    if (!i) return;
    const m = setTimeout(() => {
      $([]), x({ kind: "search", query: i });
    }, 350);
    return () => clearTimeout(m);
  }, [W, B]);
  const Te = d.useCallback(() => {
    ke(!1), we(""), r.kind === "search" && ($([]), x({ kind: a }));
  }, [r.kind, a]);
  d.useEffect(() => rs((m) => {
    const h = m.target, b = h.closest('input, textarea, select, [contenteditable="true"]');
    if (m.key === "Escape") {
      if (m.defaultPrevented) return;
      if (G) {
        m.preventDefault(), he(null);
        return;
      }
      if (me) {
        m.preventDefault(), pe(!1);
        return;
      }
      if (U) {
        m.preventDefault(), K(null);
        return;
      }
      if (B || r.kind === "search") {
        m.preventDefault(), Te();
        return;
      }
      if (ne) {
        m.preventDefault(), ae(!1);
        return;
      }
      return;
    }
    if (b || m.metaKey || m.ctrlKey || m.altKey || G) return;
    const L = q.findIndex((z) => z.id === ue), R = L >= 0 ? q[L] : null, ie = (z) => {
      if (!q.length) return;
      const xe = q[Math.max(0, Math.min(q.length - 1, (L < 0 ? z > 0 ? -1 : q.length : L) + z))];
      te(xe.id), M.current?.querySelector(`[data-task-id="${CSS.escape(xe.id)}"]`)?.scrollIntoView({ block: "nearest" }), U && K(xe.id);
    }, N = m.key;
    (N === "Enter" || N === " ") && os(h) || (N === "j" || N === "ArrowDown" ? (m.preventDefault(), ie(1)) : N === "k" || N === "ArrowUp" ? (m.preventDefault(), ie(-1)) : (N === "Enter" || N === "o") && R ? (m.preventDefault(), K(R.id)) : (N === "x" || N === " ") && R ? (m.preventDefault(), Se(R)) : /^[1-4]$/.test(N) && R ? (m.preventDefault(), Ie(R, { priority: 5 - Number(N) })) : N === "t" && R ? (m.preventDefault(), Ie(R, { due: "today" })) : (N === "Backspace" || N === "Delete") && R && !u?.readOnly ? (m.preventDefault(), he(R)) : N === "q" || N === "a" ? (m.preventDefault(), E.current?.focus()) : N === "/" ? (m.preventDefault(), ke(!0), requestAnimationFrame(() => T.current?.focus())) : N === "r" ? (m.preventDefault(), _(r, "refresh"), c.call("meta", {}).then(D, () => {
    })) : N === "[" ? (m.preventDefault(), oe ? ae((z) => !z) : f(!p)) : N === "?" && (m.preventDefault(), pe((z) => !z)));
  }), [q, ue, U, B, ne, me, Se, Ie, _, r, c, oe, p, f, Te, G, u?.readOnly]);
  const It = ys(r, J), Tt = q.filter((i) => !i.completedAt && !be.has(i.id)).length, $t = r.kind === "today" ? "Due today unless you type a date" : r.kind === "project" && ce ? `Adds to #${ce.name}` : r.kind === "label" ? `Tagged @${r.query}` : r.kind === "inbox" ? "Adds to Inbox" : null, Et = !u?.readOnly && r.kind !== "completed";
  return /* @__PURE__ */ e.jsxs("div", { className: Nt(s, oe ? " is-narrow" : ""), children: [
    /* @__PURE__ */ e.jsxs("div", { className: `td-layout${qe && !oe ? " has-sidebar" : ""}`, children: [
      qe && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        oe && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => ae(!1) }),
        /* @__PURE__ */ e.jsx(
          ds,
          {
            meta: J,
            current: r,
            counts: ee,
            user: u,
            onSelect: at,
            onSearch: () => {
              ke(!0), ae(!1), requestAnimationFrame(() => T.current?.focus());
            },
            onCreateProject: async (i, m) => {
              try {
                const h = await c.call("createProject", { name: i, color: m });
                return at({ kind: "project", id: h.id }), !0;
              } catch (h) {
                return P(h), !1;
              }
            },
            onCreateLabel: async (i) => {
              try {
                return await nt(i), !0;
              } catch {
                return !1;
              }
            },
            onSignOut: () => {
              c.call("logout", {}).catch(P);
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("main", { className: "td-main", children: [
        /* @__PURE__ */ e.jsxs("header", { className: "td-header", children: [
          /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: qe ? "Hide sidebar ([)" : "Show sidebar ([)", onClick: () => oe ? ae((i) => !i) : f(!p), children: /* @__PURE__ */ e.jsx(Xt, {}) }),
          B ? /* @__PURE__ */ e.jsxs("div", { className: "td-search", children: [
            /* @__PURE__ */ e.jsx(dt, {}),
            /* @__PURE__ */ e.jsx(
              "input",
              {
                ref: T,
                value: W,
                onChange: (i) => we(i.target.value),
                placeholder: "Search tasks",
                onKeyDown: (i) => {
                  i.key === "Escape" && (i.preventDefault(), Te()), i.key === "ArrowDown" && (i.preventDefault(), i.target.blur(), q[0] && te(q[0].id));
                }
              }
            ),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", onClick: Te, title: "Close search", children: /* @__PURE__ */ e.jsx(de, { size: 12 }) })
          ] }) : /* @__PURE__ */ e.jsxs("div", { className: "td-title", children: [
            r.kind === "project" && ce && /* @__PURE__ */ e.jsx("span", { className: "td-dot lg", style: { background: V(ce.color) } }),
            r.kind === "inbox" && /* @__PURE__ */ e.jsx(Me, {}),
            /* @__PURE__ */ e.jsx("h1", { children: It }),
            !y && r.kind !== "completed" && /* @__PURE__ */ e.jsxs("span", { className: "td-title-count", children: [
              Tt,
              A ? "+" : ""
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-header-tools", children: [
            ce && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open project in Todoist", onClick: () => ze(ce.url), children: /* @__PURE__ */ e.jsx(ut, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Keyboard shortcuts (?)", onClick: () => pe(!0), children: /* @__PURE__ */ e.jsx(Zt, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: `td-icon-btn${y ? " is-spinning" : ""}`, title: "Refresh (r)", onClick: () => {
              _(r, "refresh"), c.call("meta", {}).then(D, () => {
              });
            }, children: /* @__PURE__ */ e.jsx(es, {}) }),
            s === "modal" && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: () => void c.context.api.ui.close(), children: /* @__PURE__ */ e.jsx(de, {}) })
          ] })
        ] }),
        Et && /* @__PURE__ */ e.jsx("div", { className: "td-add-row", children: /* @__PURE__ */ e.jsx(
          cs,
          {
            ref: E,
            placeholder: oe ? "Add a task" : 'Add a task — "Review PR tomorrow 3pm p1 #Work @review"',
            contextLabel: $t,
            onSubmit: Dt
          }
        ) }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-list", ref: M, role: "list", children: [
          y && !k.length ? /* @__PURE__ */ e.jsx(gs, {}) : Q && !k.length ? /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
            /* @__PURE__ */ e.jsx("p", { children: "Couldn’t load this list." }),
            /* @__PURE__ */ e.jsx("p", { className: "td-dim td-small", children: Q }),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void _(r, "reset"), children: "Try again" })
          ] }) : q.length ? De.map((i) => /* @__PURE__ */ e.jsxs("section", { className: "td-group", children: [
            (De.length > 1 || i.subtitle || i.key !== "all") && i.title && /* @__PURE__ */ e.jsxs("h2", { className: `td-group-title${i.tone ? ` tone-${i.tone}` : ""}`, children: [
              i.title,
              i.subtitle && /* @__PURE__ */ e.jsx("span", { className: "td-group-sub", children: i.subtitle }),
              /* @__PURE__ */ e.jsx("span", { className: "td-group-count", children: i.tasks.length })
            ] }),
            i.tasks.map((m) => /* @__PURE__ */ e.jsx(
              xs,
              {
                task: m,
                lookup: tt,
                now: o,
                showProject: r.kind !== "project" && r.kind !== "inbox",
                focused: ue === m.id || U === m.id,
                completing: be.has(m.id),
                depth: wt.get(m.id) ?? 0,
                childCount: st.get(m.id) ?? 0,
                onToggle: Se,
                onOpen: (h) => {
                  te(h.id), K(h.id);
                },
                onPatch: Ie,
                onFocus: (h) => te(h.id),
                onOpenUrl: ze,
                onDelete: u?.readOnly ? void 0 : (h) => {
                  te(h.id), he(h);
                }
              },
              m.id
            ))
          ] }, i.key)) : /* @__PURE__ */ e.jsx(vs, { view: r }),
          (A || S) && q.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "td-more", children: A ? /* @__PURE__ */ e.jsxs("button", { className: "td-btn", disabled: F, onClick: () => void _(r, "append", A), children: [
            F ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
            " Load more"
          ] }) : /* @__PURE__ */ e.jsxs("span", { className: "td-dim td-small", children: [
            "Showing the first ",
            q.length,
            " tasks — this filter has more than can be loaded here. Open it in Todoist for the rest."
          ] }) }),
          r.kind === "project" && ce && !u?.readOnly && !y && (se !== null ? /* @__PURE__ */ e.jsxs(
            "form",
            {
              className: "td-section-add",
              onSubmit: async (i) => {
                if (i.preventDefault(), !!se.trim())
                  try {
                    await c.call("createSection", { projectId: ce.id, name: se.trim() }), n(null);
                  } catch (m) {
                    P(m);
                  }
              },
              children: [
                /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: se, onChange: (i) => n(i.target.value), placeholder: "Section name", onKeyDown: (i) => {
                  i.key === "Escape" && (i.preventDefault(), i.stopPropagation(), n(null));
                } }),
                /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !se.trim(), children: "Add section" }),
                /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => n(null), children: "Cancel" })
              ]
            }
          ) : /* @__PURE__ */ e.jsxs("button", { className: "td-add-section", onClick: () => n(""), children: [
            /* @__PURE__ */ e.jsx(Ne, { size: 12 }),
            " Add section"
          ] }))
        ] })
      ] }),
      U && J && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        Ct && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => K(null) }),
        /* @__PURE__ */ e.jsx(
          ps,
          {
            taskId: U,
            meta: J,
            now: o,
            onClose: () => K(null),
            onToggle: Se,
            onOpenTask: (i) => K(i),
            revision: t,
            onError: (i) => H(i, { tone: "error" }),
            onOpenUrl: ze,
            onCreateLabel: nt,
            onNeedSections: Ke
          },
          U
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "td-toasts", "aria-live": "polite", children: ye.map((i) => /* @__PURE__ */ e.jsxs("div", { className: `td-toast${i.tone === "error" ? " is-error" : ""}`, children: [
      /* @__PURE__ */ e.jsx("span", { children: i.message }),
      i.action && /* @__PURE__ */ e.jsx("button", { onClick: () => {
        i.action.run(), Y((m) => m.filter((h) => h.id !== i.id));
      }, children: i.action.label })
    ] }, i.id)) }),
    me && /* @__PURE__ */ e.jsx(Cs, { onClose: () => pe(!1) }),
    G && /* @__PURE__ */ e.jsx(Ns, { task: G, subtasks: st.get(G.id) ?? 0, onCancel: () => he(null), onConfirm: () => void St(G) })
  ] });
}
function ys(s, t) {
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
function ks(s, t, a, o, u) {
  const c = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), x = new Set(t.map((f) => f.id));
  for (const f of t) f.parentId && x.has(f.parentId) && r.set(f.parentId, (r.get(f.parentId) ?? 0) + 1);
  if (s.kind === "today") return { groups: as(t, a), depths: c, childCounts: r };
  if (s.kind === "upcoming") return { groups: is(t, a), depths: c, childCounts: r };
  if (s.kind === "completed") return { groups: ls(t, a), depths: c, childCounts: r };
  if ((s.kind === "project" || s.kind === "inbox") && u) {
    const f = (o?.sections ?? []).filter((k) => k.projectId === u), v = /* @__PURE__ */ new Map();
    for (const k of t) {
      const $ = k.sectionId && f.some((O) => O.id === k.sectionId) ? k.sectionId : null, A = v.get($) ?? [];
      A.push(k), v.set($, A);
    }
    const D = (k) => {
      const $ = new Set(k.map((w) => w.id)), A = k.filter((w) => !w.parentId || !$.has(w.parentId)).sort((w, y) => w.order - y.order), O = [], S = (w, y) => {
        O.push(w), c.set(w.id, y), k.filter((l) => l.parentId === w.id).sort((l, F) => l.order - F.order).forEach((l) => S(l, Math.min(y + 1, 4)));
      };
      return A.forEach((w) => S(w, 0)), O;
    }, g = [], C = v.get(null) ?? [];
    (C.length || !f.length) && g.push({ key: "all", title: "", tasks: D(C) });
    for (const k of f)
      g.push({ key: k.id, title: k.name, tasks: D(v.get(k.id) ?? []) });
    return { groups: g.filter((k) => k.tasks.length || k.key !== "all"), depths: c, childCounts: r };
  }
  return { groups: [{ key: "all", title: "", tasks: [...t].sort((f, v) => v.priority - f.priority || (f.due?.date ?? "9999").localeCompare(v.due?.date ?? "9999") || f.order - v.order) }], depths: c, childCounts: r };
}
function vs({ view: s }) {
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
function gs() {
  return /* @__PURE__ */ e.jsx("div", { className: "td-skeleton-list", "aria-busy": "true", children: [78, 52, 64, 40, 70].map((s, t) => /* @__PURE__ */ e.jsxs("div", { className: "td-task is-skeleton", children: [
    /* @__PURE__ */ e.jsx("span", { className: "td-checkbox" }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${s}%` } }),
      /* @__PURE__ */ e.jsx("span", { className: "td-skel sm", style: { width: `${s / 2}%` } })
    ] })
  ] }, t)) });
}
function Ns({ task: s, subtasks: t, onCancel: a, onConfirm: o }) {
  return /* @__PURE__ */ e.jsx("div", { className: "td-modal-scrim", onClick: a, children: /* @__PURE__ */ e.jsxs("div", { className: "td-help td-delete", onClick: (u) => u.stopPropagation(), role: "dialog", "aria-label": "Delete task", children: [
    /* @__PURE__ */ e.jsx("div", { className: "td-help-head", children: /* @__PURE__ */ e.jsx("h2", { children: "Delete task?" }) }),
    /* @__PURE__ */ e.jsxs("p", { children: [
      "“",
      s.content,
      "”",
      t ? ` and its ${t} sub-task${t > 1 ? "s" : ""}` : "",
      " will be deleted. This cannot be undone."
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-delete-actions", children: [
      /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: a, children: "Cancel" }),
      /* @__PURE__ */ e.jsxs("button", { className: "td-btn td-btn-danger", autoFocus: !0, onClick: o, children: [
        /* @__PURE__ */ e.jsx(Ge, { size: 13 }),
        " Delete"
      ] })
    ] })
  ] }) });
}
function Cs({ onClose: s }) {
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
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: s, children: /* @__PURE__ */ e.jsx(de, {}) })
    ] }),
    /* @__PURE__ */ e.jsx("dl", { children: t.map(([a, o]) => /* @__PURE__ */ e.jsxs("div", { children: [
      /* @__PURE__ */ e.jsx("dt", { children: a.split("  ").map((u) => /* @__PURE__ */ e.jsx("kbd", { children: u }, u)) }),
      /* @__PURE__ */ e.jsx("dd", { children: o })
    ] }, a)) })
  ] }) });
}
export {
  Ss as A
};

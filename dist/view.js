import { r as u, t as et, c as wt, j as e, l as fe, b as K, L as Ce, m as Qe, n as tt, I as Ie, T as Ct, p as St, o as Dt, q as It, v as Tt, U as $t, w as Et, u as Ke, x as de, M as At, E as st, y as Pt, z as Re, P as we, C as Le, R as nt, G as at, H as it, F as Ge, J as lt, D as ot, d as rt, e as Mt, f as qt, K as Ft, a as Rt, N as Lt, S as Ot, O as Je, Q as zt, V as Kt, W as _t, i as Ut, g as Bt, h as Yt, B as Wt, k as Vt, s as Ht } from "./shared-SetupScreen.js";
import { t as ie, b as Qt, d as Gt } from "./shared-types.js";
const _e = 864e5;
function J(s) {
  return Math.floor(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate()) / _e);
}
function Ue(s) {
  const [t, a, c] = s.slice(0, 10).split("-").map(Number);
  return new Date(t, (a || 1) - 1, c || 1);
}
function xe(s) {
  return s.datetime ? J(new Date(s.datetime)) : J(Ue(s.date));
}
function Se(s, t) {
  if (!s) return "none";
  const a = J(t), c = xe(s);
  return c < a || c === a && s.datetime && new Date(s.datetime).getTime() < t.getTime() ? "overdue" : c === a ? "today" : c === a + 1 ? "tomorrow" : c < a + 7 ? "week" : "future";
}
const Jt = new Intl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit" }), ct = new Intl.DateTimeFormat(void 0, { weekday: "long" }), Oe = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric" }), dt = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", year: "numeric" }), Be = new Intl.DateTimeFormat(void 0, { weekday: "short", month: "short", day: "numeric" });
function ze(s, t) {
  const a = J(t), c = xe(s), r = s.datetime ? new Date(s.datetime) : Ue(s.date);
  let o;
  return c === a ? o = "Today" : c === a + 1 ? o = "Tomorrow" : c === a - 1 ? o = "Yesterday" : c > a && c < a + 7 ? o = ct.format(r) : r.getFullYear() === t.getFullYear() ? o = Oe.format(r) : o = dt.format(r), s.datetime ? `${o} ${Jt.format(r)}` : o;
}
function Xt(s, t) {
  const a = Ue(s), c = J(a) - J(t);
  return c === 0 ? "Today" : c === 1 ? "Tomorrow" : c < 0 ? `${Oe.format(a)} (passed)` : a.getFullYear() === t.getFullYear() ? Oe.format(a) : dt.format(a);
}
function ut(s) {
  if (s.unit === "day") return s.amount === 1 ? "1 day" : `${s.amount} days`;
  const t = Math.floor(s.amount / 60), a = s.amount % 60;
  return t && a ? `${t}h ${a}m` : t ? `${t}h` : `${a}m`;
}
function De(s, t) {
  const a = s.due?.datetime ? new Date(s.due.datetime).getTime() : Number.POSITIVE_INFINITY, c = t.due?.datetime ? new Date(t.due.datetime).getTime() : Number.POSITIVE_INFINITY;
  return a !== c ? a - c : s.priority !== t.priority ? t.priority - s.priority : s.order - t.order;
}
function Zt(s, t) {
  const a = [], c = [];
  for (const o of s) (Se(o.due, t) === "overdue" ? a : c).push(o);
  a.sort((o, m) => (o.due && m.due ? xe(o.due) - xe(m.due) : 0) || De(o, m)), c.sort(De);
  const r = [];
  return a.length && r.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: a }), r.push({ key: "today", title: "Today", subtitle: Be.format(t), tone: "today", tasks: c }), r;
}
function es(s, t) {
  const a = J(t), c = /* @__PURE__ */ new Map(), r = [], o = [];
  for (const b of s) {
    if (!b.due) {
      o.push(b);
      continue;
    }
    const p = xe(b.due);
    if (p < a) {
      r.push(b);
      continue;
    }
    const h = c.get(p) ?? [];
    h.push(b), c.set(p, h);
  }
  const m = [];
  r.length && m.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: r.sort(De) });
  for (const b of [...c.keys()].sort((p, h) => p - h)) {
    const p = new Date(b * _e), h = new Date(p.getUTCFullYear(), p.getUTCMonth(), p.getUTCDate()), y = b === a ? "Today" : b === a + 1 ? "Tomorrow" : ct.format(h);
    m.push({
      key: `day-${b}`,
      title: y,
      subtitle: Be.format(h),
      tone: b === a ? "today" : b === a + 1 ? "tomorrow" : "future",
      tasks: c.get(b).sort(De)
    });
  }
  return o.length && m.push({ key: "undated", title: "No date", tasks: o }), m;
}
function ts(s, t) {
  const a = J(t), c = /* @__PURE__ */ new Map();
  for (const r of s) {
    const o = r.completedAt ? J(new Date(r.completedAt)) : a, m = c.get(o) ?? [];
    m.push(r), c.set(o, m);
  }
  return [...c.keys()].sort((r, o) => o - r).map((r) => {
    const o = new Date(r * _e), m = new Date(o.getUTCFullYear(), o.getUTCMonth(), o.getUTCDate());
    return {
      key: `done-${r}`,
      title: r === a ? "Today" : r === a - 1 ? "Yesterday" : Be.format(m),
      tasks: c.get(r).sort((b, p) => (p.completedAt ?? "").localeCompare(b.completedAt ?? ""))
    };
  });
}
const ss = u.forwardRef(function({ placeholder: t, contextLabel: a, disabled: c, onSubmit: r, autoFocus: o, large: m }, b) {
  const [p, h] = u.useState(""), [y, C] = u.useState(!1), v = u.useRef(null), w = u.useRef(null);
  u.useImperativeHandle(b, () => ({ focus: () => v.current?.focus() }), []);
  const k = () => {
    w.current && v.current && (w.current.scrollLeft = v.current.scrollLeft);
  }, E = async () => {
    const x = p.trim();
    if (!(!x || y)) {
      C(!0);
      try {
        await r(x) && h("");
      } finally {
        C(!1), requestAnimationFrame(() => v.current?.focus());
      }
    }
  }, A = et(p), D = p ? wt(p) : "", N = A.some((x) => x.kind !== "text");
  return /* @__PURE__ */ e.jsxs("div", { className: `td-quickadd${m ? " is-large" : ""}${y ? " is-busy" : ""}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-field", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-quickadd-plus", children: /* @__PURE__ */ e.jsx(fe, {}) }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-stack", children: [
        /* @__PURE__ */ e.jsxs("div", { ref: w, className: "td-quickadd-mirror", "aria-hidden": "true", children: [
          A.map((x, I) => /* @__PURE__ */ e.jsx("span", { className: `tok-${x.kind}`, children: x.text }, I)),
          "​"
        ] }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            ref: v,
            className: "td-quickadd-input",
            value: p,
            disabled: c,
            autoFocus: o,
            spellCheck: !1,
            placeholder: t,
            "aria-label": "Quick add task",
            onChange: (x) => {
              h(x.target.value), requestAnimationFrame(k);
            },
            onScroll: k,
            onKeyDown: (x) => {
              x.key === "Enter" && !x.nativeEvent.isComposing ? (x.preventDefault(), E()) : x.key === "Escape" && p ? (x.preventDefault(), x.stopPropagation(), h("")) : x.key === "Escape" && (x.preventDefault(), x.stopPropagation(), v.current?.blur());
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-primary td-quickadd-submit", disabled: !p.trim() || y || c, onClick: () => void E(), children: y ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : "Add" })
    ] }),
    (N || a) && /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-hint", children: [
      N && D ? /* @__PURE__ */ e.jsxs("span", { children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: D }),
        "”"
      ] }) : null,
      a ? /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: a }) : null
    ] })
  ] });
});
function mt(s, t) {
  return s.kind === t.kind && (s.id ?? null) === (t.id ?? null) && (s.query ?? null) === (t.query ?? null);
}
function ns({ meta: s, current: t, counts: a, user: c, onSelect: r, onSearch: o, onCreateProject: m, onCreateLabel: b, onSignOut: p }) {
  const [h, y] = u.useState({ favorites: !0, projects: !0, labels: !1, filters: !1 }), [C, v] = u.useState(null), [w, k] = u.useState(""), [E, A] = u.useState("charcoal"), D = s?.projects.find((l) => l.isInbox), N = (l, T, V, Y, H) => /* @__PURE__ */ e.jsxs(
    "button",
    {
      className: `td-nav-item${mt(t, l) ? " is-active" : ""}`,
      onClick: () => r(l),
      title: V,
      children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", style: H ? { color: H } : void 0, children: T }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: V }),
        Y ? /* @__PURE__ */ e.jsx("span", { className: "td-nav-count", children: Y }) : null
      ]
    },
    `${l.kind}:${l.id ?? l.query ?? ""}`
  ), x = [
    ...s?.projects.filter((l) => l.isFavorite && !l.isInbox).map((l) => N({ kind: "project", id: l.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: K(l.color) } }), l.name)) ?? [],
    ...s?.labels.filter((l) => l.isFavorite).map((l) => N({ kind: "label", query: l.name }, /* @__PURE__ */ e.jsx(Ce, {}), l.name, null, K(l.color))) ?? [],
    ...s?.filters.filter((l) => l.isFavorite).map((l) => N({ kind: "filter", id: l.id, query: l.query }, /* @__PURE__ */ e.jsx(Qe, {}), l.name, null, K(l.color))) ?? []
  ], I = async (l) => {
    l.preventDefault();
    const T = w.trim();
    T && (C === "project" && await m(T, E), C === "label" && await b(T), k(""), v(null));
  };
  return /* @__PURE__ */ e.jsxs("nav", { className: "td-sidebar", "aria-label": "Todoist navigation", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-item", onClick: o, title: "Search (/)", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", children: /* @__PURE__ */ e.jsx(tt, {}) }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: "Search" }),
        /* @__PURE__ */ e.jsx("kbd", { children: "/" })
      ] }),
      N({ kind: "inbox" }, /* @__PURE__ */ e.jsx(Ie, {}), "Inbox", a.inbox, "#246fe0"),
      N({ kind: "today" }, /* @__PURE__ */ e.jsx(Ct, {}), "Today", a.today, "#058527"),
      N({ kind: "upcoming" }, /* @__PURE__ */ e.jsx($t, {}), "Upcoming", null, "#692fc2"),
      N({ kind: "completed" }, /* @__PURE__ */ e.jsx(Et, {}), "Completed", null, "#eb8909")
    ] }),
    x.length > 0 && /* @__PURE__ */ e.jsx(Ne, { title: "Favorites", open: h.favorites, onToggle: () => y((l) => ({ ...l, favorites: !l.favorites })), children: x }),
    /* @__PURE__ */ e.jsxs(
      Ne,
      {
        title: "My Projects",
        open: h.projects,
        onToggle: () => y((l) => ({ ...l, projects: !l.projects })),
        onAdd: () => {
          v("project"), k(""), y((l) => ({ ...l, projects: !0 }));
        },
        children: [
          !s && /* @__PURE__ */ e.jsx(as, {}),
          s && St(s.projects).filter(({ project: l }) => l.id !== D?.id).map(({ project: l, depth: T }) => /* @__PURE__ */ e.jsx("div", { style: { paddingLeft: T * 12 }, children: N({ kind: "project", id: l.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: K(l.color) } }), l.name) }, l.id)),
          C === "project" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (l) => void I(l), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: w, onChange: (l) => k(l.target.value), placeholder: "Project name", onKeyDown: (l) => {
              l.key === "Escape" && (l.preventDefault(), l.stopPropagation(), v(null));
            } }),
            /* @__PURE__ */ e.jsx("div", { className: "td-swatches", children: Dt.map((l) => /* @__PURE__ */ e.jsx("button", { type: "button", title: l.replace("_", " "), className: `td-swatch${l === E ? " is-on" : ""}`, style: { background: K(l) }, onClick: () => A(l) }, l)) }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => v(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !w.trim(), children: "Add project" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e.jsxs(
      Ne,
      {
        title: "Labels",
        open: h.labels,
        onToggle: () => y((l) => ({ ...l, labels: !l.labels })),
        onAdd: () => {
          v("label"), k(""), y((l) => ({ ...l, labels: !0 }));
        },
        children: [
          s?.labels.map((l) => N({ kind: "label", query: l.name }, /* @__PURE__ */ e.jsx(Ce, {}), l.name, null, K(l.color))),
          s && !s.labels.length && C !== "label" && /* @__PURE__ */ e.jsx("div", { className: "td-nav-empty", children: "No labels" }),
          C === "label" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (l) => void I(l), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: w, onChange: (l) => k(l.target.value), placeholder: "Label name", onKeyDown: (l) => {
              l.key === "Escape" && (l.preventDefault(), l.stopPropagation(), v(null));
            } }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => v(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !w.trim(), children: "Add label" })
            ] })
          ] })
        ]
      }
    ),
    s && s.filters.length > 0 && /* @__PURE__ */ e.jsx(Ne, { title: "Filters", open: h.filters, onToggle: () => y((l) => ({ ...l, filters: !l.filters })), children: s.filters.map((l) => N({ kind: "filter", id: l.id, query: l.query }, /* @__PURE__ */ e.jsx(Qe, {}), l.name, null, K(l.color))) }),
    c && /* @__PURE__ */ e.jsxs("div", { className: "td-account", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-avatar", children: (c.fullName || c.email || "?").slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ e.jsxs("span", { className: "td-account-text", children: [
        /* @__PURE__ */ e.jsx("span", { children: c.fullName || c.email }),
        c.readOnly && /* @__PURE__ */ e.jsx("span", { className: "td-dim td-small", children: "Read-only" })
      ] }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Sign out of td", onClick: p, children: /* @__PURE__ */ e.jsx(It, { size: 13 }) })
    ] })
  ] });
}
function Ne({ title: s, open: t, onToggle: a, onAdd: c, children: r }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-heading", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-heading-btn", onClick: a, "aria-expanded": t, children: [
        /* @__PURE__ */ e.jsx(Tt, { size: 12, className: t ? "" : "is-collapsed" }),
        s
      ] }),
      c && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: `Add ${s.toLowerCase().replace("my ", "").replace(/s$/, "")}`, onClick: c, children: /* @__PURE__ */ e.jsx(fe, { size: 12 }) })
    ] }),
    t && r
  ] });
}
function as() {
  return /* @__PURE__ */ e.jsx(e.Fragment, { children: [70, 55, 80].map((s) => /* @__PURE__ */ e.jsx("div", { className: "td-nav-item", children: /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${s}%` } }) }, s)) });
}
const Fe = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"]))/g;
function ue(s, t, a = "i") {
  const c = [];
  let r = 0, o = 0;
  Fe.lastIndex = 0;
  for (let m = Fe.exec(s); m; m = Fe.exec(s)) {
    m.index > r && c.push(s.slice(r, m.index));
    const b = `${a}${o++}`;
    m[2] || m[3] ? c.push(/* @__PURE__ */ e.jsx("strong", { children: m[2] ?? m[3] }, b)) : m[4] || m[5] ? c.push(/* @__PURE__ */ e.jsx("em", { children: m[4] ?? m[5] }, b)) : m[6] ? c.push(/* @__PURE__ */ e.jsx("code", { children: m[6] }, b)) : m[7] && m[8] ? c.push(/* @__PURE__ */ e.jsx(Xe, { url: m[8], open: t, children: m[7] }, b)) : m[9] && c.push(/* @__PURE__ */ e.jsx(Xe, { url: m[9], open: t, children: is(m[9]) }, b)), r = m.index + m[0].length;
  }
  return r < s.length && c.push(s.slice(r)), c;
}
function is(s) {
  try {
    const t = new URL(s), a = t.pathname.length > 28 ? `${t.pathname.slice(0, 26)}…` : t.pathname;
    return `${t.hostname.replace(/^www\./, "")}${a === "/" ? "" : a}`;
  } catch {
    return s;
  }
}
function Xe({ url: s, open: t, children: a }) {
  return /* @__PURE__ */ e.jsx(
    "a",
    {
      className: "td-link",
      href: s,
      title: s,
      onClick: (c) => {
        c.preventDefault(), c.stopPropagation(), t(s);
      },
      children: a
    }
  );
}
function Ze({ text: s, open: t }) {
  const a = s.replace(/\r\n/g, `
`).split(`
`), c = [];
  let r = 0, o = 0;
  for (; r < a.length; ) {
    const m = a[r];
    if (m.startsWith("```")) {
      const p = [];
      for (r++; r < a.length && !a[r].startsWith("```"); ) p.push(a[r++]);
      r++, c.push(/* @__PURE__ */ e.jsx("pre", { className: "td-md-pre", children: /* @__PURE__ */ e.jsx("code", { children: p.join(`
`) }) }, o++));
      continue;
    }
    if (/^\s*[-*]\s+/.test(m)) {
      const p = [];
      for (; r < a.length && /^\s*[-*]\s+/.test(a[r]); ) p.push(a[r++].replace(/^\s*[-*]\s+/, ""));
      c.push(/* @__PURE__ */ e.jsx("ul", { children: p.map((h, y) => /* @__PURE__ */ e.jsx("li", { children: ue(h, t, `l${o}-${y}`) }, y)) }, o++));
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(m)) {
      const p = [];
      for (; r < a.length && /^\s*\d+[.)]\s+/.test(a[r]); ) p.push(a[r++].replace(/^\s*\d+[.)]\s+/, ""));
      c.push(/* @__PURE__ */ e.jsx("ol", { children: p.map((h, y) => /* @__PURE__ */ e.jsx("li", { children: ue(h, t, `o${o}-${y}`) }, y)) }, o++));
      continue;
    }
    if (m.startsWith("> ")) {
      const p = [];
      for (; r < a.length && a[r].startsWith("> "); ) p.push(a[r++].slice(2));
      c.push(/* @__PURE__ */ e.jsx("blockquote", { children: ue(p.join(" "), t, `q${o}`) }, o++));
      continue;
    }
    if (!m.trim()) {
      r++;
      continue;
    }
    const b = [];
    for (; r < a.length && a[r].trim() && !/^(```|\s*[-*]\s+|\s*\d+[.)]\s+|> )/.test(a[r]); ) b.push(a[r++]);
    c.push(
      /* @__PURE__ */ e.jsx("p", { children: b.map((p, h) => /* @__PURE__ */ e.jsxs(u.Fragment, { children: [
        h > 0 && /* @__PURE__ */ e.jsx("br", {}),
        ue(p, t, `p${o}-${h}`)
      ] }, h)) }, o++)
    );
  }
  return /* @__PURE__ */ e.jsx("div", { className: "td-md", children: c });
}
const pt = ["15m", "30m", "45m", "1h", "1h30m", "2h", "3h", "4h"];
function ls({ taskId: s, meta: t, now: a, onClose: c, onToggle: r, onOpenTask: o, onChanged: m, onError: b, onOpenUrl: p, onCreateLabel: h, onNeedSections: y }) {
  const C = Ke(), [v, w] = u.useState(null), [k, E] = u.useState(null), [A, D] = u.useState(null), [N, x] = u.useState(""), [I, l] = u.useState(null), [T, V] = u.useState(!1), [Y, H] = u.useState(""), [je, be] = u.useState(""), [me, X] = u.useState(!1), z = { due: u.useRef(null), priority: u.useRef(null), labels: u.useRef(null), project: u.useRef(null) }, Z = async () => {
    try {
      E(null), w(await C.call("task", { id: s }));
    } catch (n) {
      E(ie(n));
    }
  };
  u.useEffect(() => {
    w(null), D(null), V(!1), H(""), Z();
  }, [s]);
  const R = async (n) => {
    if (!v) return;
    const S = v;
    w({ ...v, task: { ...v.task, ...rs(n) } });
    try {
      const $ = await C.call("update", { id: v.task.id, ...n });
      w((P) => P && { ...P, task: $ }), m();
    } catch ($) {
      w(S), b(ie($));
    }
  }, W = async (n, S) => {
    if (v)
      try {
        await C.call("move", { id: v.task.id, projectId: n, ...S ? { sectionId: S } : { noSection: !0 } }), w({ ...v, task: { ...v.task, projectId: n, sectionId: S } }), m();
      } catch ($) {
        b(ie($));
      }
  }, pe = v?.task.projectId;
  if (u.useEffect(() => {
    pe && y(pe);
  }, [pe, y]), k)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", {}),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: c, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(de, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
        /* @__PURE__ */ e.jsx("p", { children: k }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void Z(), children: "Try again" })
      ] })
    ] });
  if (!v)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: 120 } }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: c, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(de, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "80%", height: 20, marginBottom: 14 } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "60%" } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "40%", marginTop: 8 } })
      ] })
    ] });
  const { task: f, children: _, comments: Q } = v, le = t.projects.find((n) => n.id === f.projectId), oe = t.sections.find((n) => n.id === f.sectionId), re = !!f.completedAt, Te = Se(f.due, a), ee = async () => {
    const n = N.trim(), S = A;
    D(null), S === "title" && n && n !== f.content && await R({ content: n }), S === "description" && N !== f.description && await R({ description: N });
  };
  return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", "aria-label": "Task details", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: z.project, className: "td-crumb", onClick: () => l("project"), title: "Move to project / section", children: [
        le?.isInbox ? /* @__PURE__ */ e.jsx(Ie, { size: 13 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: K(le?.color) } }),
        /* @__PURE__ */ e.jsx("span", { children: le?.name ?? "Project" }),
        oe && /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
          "/ ",
          oe.name
        ] }),
        /* @__PURE__ */ e.jsx(At, { size: 12, className: "td-crumb-move" })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-tools", children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open in Todoist", onClick: () => p(f.url), children: /* @__PURE__ */ e.jsx(st, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn danger", title: "Delete task", onClick: () => V(!0), children: /* @__PURE__ */ e.jsx(Pt, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: c, children: /* @__PURE__ */ e.jsx(de, {}) })
      ] })
    ] }),
    T && /* @__PURE__ */ e.jsxs("div", { className: "td-confirm", children: [
      /* @__PURE__ */ e.jsxs("span", { children: [
        "Delete this task",
        _.length ? ` and its ${_.length} subtask${_.length > 1 ? "s" : ""}` : "",
        "? This cannot be undone."
      ] }),
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => V(!1), children: "Cancel" }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            className: "td-btn td-btn-danger",
            autoFocus: !0,
            onClick: async () => {
              try {
                await C.call("delete", { id: f.id }), m(), c();
              } catch (n) {
                b(ie(n));
              }
            },
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
      f.parentId && /* @__PURE__ */ e.jsxs("button", { className: "td-parent-link", onClick: () => o(f.parentId), children: [
        /* @__PURE__ */ e.jsx(Re, { size: 12 }),
        " Open parent task"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-title-row", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox lg p${f.priority}${re ? " is-checked" : ""}`,
            style: { "--prio": we[f.priority] },
            "aria-label": re ? "Reopen task" : "Complete task",
            onClick: async () => {
              await r(f), w((n) => n && { ...n, task: { ...n.task, completedAt: re ? null : (/* @__PURE__ */ new Date()).toISOString() } });
            },
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        A === "title" ? /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-title",
            value: N,
            rows: Math.min(5, Math.max(1, Math.ceil(N.length / 40))),
            onChange: (n) => x(n.target.value),
            onBlur: () => void ee(),
            onKeyDown: (n) => {
              n.key === "Enter" && !n.shiftKey && (n.preventDefault(), ee()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), D(null));
            }
          }
        ) : /* @__PURE__ */ e.jsx("h2", { className: `td-drawer-title${re ? " is-done" : ""}`, onClick: () => {
          x(f.content), D("title");
        }, title: "Click to edit", children: ue(f.content, p, "title") })
      ] }),
      A === "description" ? /* @__PURE__ */ e.jsxs("div", { className: "td-edit-desc-wrap", children: [
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-desc",
            value: N,
            placeholder: "Description (Markdown supported)",
            onChange: (n) => x(n.target.value),
            onKeyDown: (n) => {
              n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), ee()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), D(null));
            }
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-edit-actions", children: [
          /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "⌘↵ to save" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => D(null), children: "Cancel" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", onClick: () => void ee(), children: "Save" })
        ] })
      ] }) : f.description ? /* @__PURE__ */ e.jsx("div", { className: "td-desc", onClick: (n) => {
        n.target.closest("a") || (x(f.description), D("description"));
      }, title: "Click to edit", children: /* @__PURE__ */ e.jsx(Ze, { text: f.description, open: p }) }) : /* @__PURE__ */ e.jsx("button", { className: "td-add-desc", onClick: () => {
        x(""), D("description");
      }, children: "Add description" }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-props", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Le, { size: 13 }),
          "Due"
        ] }),
        /* @__PURE__ */ e.jsx("button", { ref: z.due, className: `td-prop-value tone-${Te}`, onClick: () => l("due"), children: f.due ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          f.due.recurring && /* @__PURE__ */ e.jsx(nt, { size: 12 }),
          ze(f.due, a),
          /* @__PURE__ */ e.jsx("span", { className: "td-dim td-prop-sub", children: f.due.recurring ? f.due.string : "" })
        ] }) : /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "No date" }) }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(at, { size: 13 }),
          "Deadline"
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-value-wrap", children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              className: `td-date-input${f.deadline ? "" : " is-empty"}`,
              value: f.deadline ?? "",
              onChange: (n) => void R({ deadline: n.target.value }),
              "aria-label": "Deadline"
            }
          ),
          f.deadline && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Clear deadline", onClick: () => void R({ deadline: "" }), children: /* @__PURE__ */ e.jsx(de, { size: 12 }) })
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(it, { size: 13 }),
          "Duration"
        ] }),
        /* @__PURE__ */ e.jsxs(
          "select",
          {
            className: "td-select",
            value: f.duration ? os(f.duration) : "",
            onChange: (n) => {
              n.target.value && R({ duration: n.target.value });
            },
            "aria-label": "Duration",
            children: [
              /* @__PURE__ */ e.jsx("option", { value: "", disabled: !0, children: f.duration ? ut(f.duration) : "None" }),
              pt.map((n) => /* @__PURE__ */ e.jsx("option", { value: n, children: n.replace("h30m", "h 30m") }, n))
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Ge, { size: 13, color: "currentColor" }),
          "Priority"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: z.priority, className: "td-prop-value", onClick: () => l("priority"), children: [
          /* @__PURE__ */ e.jsx(Ge, { size: 13, color: f.priority === 1 ? "var(--td-muted)" : we[f.priority] }),
          "Priority ",
          5 - f.priority
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Ce, { size: 13 }),
          "Labels"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-prop-labels", children: [
          f.labels.map((n) => {
            const S = t.labels.find(($) => $.name === n);
            return /* @__PURE__ */ e.jsxs("span", { className: "td-label-pill", style: { "--label": K(S?.color) }, children: [
              n,
              /* @__PURE__ */ e.jsx("button", { title: `Remove ${n}`, onClick: () => void R({ labels: f.labels.filter(($) => $ !== n) }), children: /* @__PURE__ */ e.jsx(de, { size: 10 }) })
            ] }, n);
          }),
          /* @__PURE__ */ e.jsx("button", { ref: z.labels, className: "td-icon-btn sm", title: "Add label", onClick: () => l("labels"), children: /* @__PURE__ */ e.jsx(fe, { size: 12 }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(Re, { size: 13 }),
          " Sub-tasks ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: _.length || "" })
        ] }),
        _.map((n) => /* @__PURE__ */ e.jsxs("div", { className: `td-subtask${n.completedAt ? " is-done" : ""}`, children: [
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: `td-checkbox sm p${n.priority}`,
              style: { "--prio": we[n.priority] },
              "aria-label": "Complete sub-task",
              onClick: async () => {
                await r(n), w((S) => S && { ...S, children: S.children.filter(($) => $.id !== n.id) });
              },
              children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
            }
          ),
          /* @__PURE__ */ e.jsx("button", { className: "td-subtask-title", onClick: () => o(n.id), children: ue(n.content, p, n.id) }),
          n.due && /* @__PURE__ */ e.jsx("span", { className: `td-chip td-due tone-${Se(n.due, a)}`, children: ze(n.due, a) })
        ] }, n.id)),
        /* @__PURE__ */ e.jsxs(
          "form",
          {
            className: "td-inline-add",
            onSubmit: async (n) => {
              n.preventDefault();
              const S = je.trim();
              if (!(!S || me)) {
                X(!0);
                try {
                  const $ = await C.call("add", { content: S, parentId: f.id, projectId: f.projectId });
                  w((P) => P && { ...P, children: [...P.children, $] }), be(""), m();
                } catch ($) {
                  b(ie($));
                } finally {
                  X(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(fe, { size: 13 }),
              /* @__PURE__ */ e.jsx("input", { value: je, onChange: (n) => be(n.target.value), placeholder: "Add sub-task", onKeyDown: (n) => {
                n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
              } })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(lt, { size: 13 }),
          " Comments ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: Q.length || "" })
        ] }),
        Q.map((n) => /* @__PURE__ */ e.jsxs("div", { className: "td-comment", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-comment-meta", children: new Date(n.postedAt).toLocaleString(void 0, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }),
          n.content && /* @__PURE__ */ e.jsx(Ze, { text: n.content, open: p }),
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
              const S = Y.trim();
              if (!(!S || me)) {
                X(!0);
                try {
                  const $ = await C.call("comment", { taskId: f.id, content: S });
                  w((P) => P && { ...P, comments: [...P.comments, $] }), H("");
                } catch ($) {
                  b(ie($));
                } finally {
                  X(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(
                "textarea",
                {
                  value: Y,
                  onChange: (n) => H(n.target.value),
                  placeholder: "Write a comment",
                  rows: Y.includes(`
`) ? 4 : 2,
                  onKeyDown: (n) => {
                    n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), n.currentTarget.form.requestSubmit()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
                  }
                }
              ),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !Y.trim() || me, children: "Comment" })
            ]
          }
        )
      ] })
    ] }),
    I === "due" && /* @__PURE__ */ e.jsx(ot, { anchor: z.due.current, current: f.due?.string, onPick: (n) => void R({ due: n }), onClose: () => l(null) }),
    I === "priority" && /* @__PURE__ */ e.jsx(rt, { anchor: z.priority.current, current: f.priority, onPick: (n) => void R({ priority: n }), onClose: () => l(null) }),
    I === "labels" && /* @__PURE__ */ e.jsx(
      Mt,
      {
        anchor: z.labels.current,
        labels: t.labels,
        selected: f.labels,
        onChange: (n) => void R({ labels: n }),
        onCreate: h,
        onClose: () => l(null)
      }
    ),
    I === "project" && /* @__PURE__ */ e.jsx(qt, { anchor: z.project.current, meta: t, current: { projectId: f.projectId, sectionId: f.sectionId }, onPick: (n) => void W(n.projectId, n.sectionId), onClose: () => l(null) })
  ] });
}
function os(s) {
  if (s.unit === "day") return "";
  const t = Math.floor(s.amount / 60), a = s.amount % 60, c = `${t ? `${t}h` : ""}${a ? `${a}m` : ""}`;
  return pt.includes(c) ? c : "";
}
function rs(s) {
  const t = {};
  return s.content !== void 0 && (t.content = s.content), s.description !== void 0 && (t.description = s.description), s.priority !== void 0 && (t.priority = s.priority), s.labels !== void 0 && (t.labels = s.labels), s.deadline !== void 0 && (t.deadline = s.deadline || null), s.due === "" && (t.due = null), t;
}
const cs = u.memo(function({
  task: t,
  lookup: a,
  now: c,
  showProject: r,
  focused: o,
  completing: m,
  depth: b = 0,
  childCount: p = 0,
  onToggle: h,
  onOpen: y,
  onPatch: C,
  onFocus: v,
  onOpenUrl: w
}) {
  const [k, E] = u.useState(null), A = u.useRef(null), D = u.useRef(null), N = !!t.completedAt || m, x = Se(t.due, c), I = a.project(t.projectId), l = a.section(t.sectionId);
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: `td-task${o ? " is-focused" : ""}${N ? " is-done" : ""}${m ? " is-completing" : ""}`,
      style: b ? { paddingLeft: 12 + b * 26 } : void 0,
      "data-task-id": t.id,
      role: "listitem",
      "aria-label": t.content,
      onMouseDown: () => v(t),
      onClick: (T) => {
        T.target.closest("button, a, input") || y(t);
      },
      children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox p${t.priority}`,
            style: { "--prio": we[t.priority] },
            "aria-label": N ? "Reopen task" : "Complete task",
            title: N ? "Reopen" : "Complete",
            onClick: () => h(t),
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-task-title", children: ue(t.content, w, t.id) }),
          t.description && !N && /* @__PURE__ */ e.jsx("div", { className: "td-task-desc", children: t.description.split(`
`)[0] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-task-meta", children: [
            t.due && /* @__PURE__ */ e.jsxs("span", { className: `td-chip td-due tone-${x}`, title: t.due.string, children: [
              t.due.recurring ? /* @__PURE__ */ e.jsx(nt, { size: 12 }) : /* @__PURE__ */ e.jsx(Le, { size: 12 }),
              ze(t.due, c)
            ] }),
            t.deadline && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-deadline", title: "Deadline", children: [
              /* @__PURE__ */ e.jsx(at, { size: 12 }),
              Xt(t.deadline, c)
            ] }),
            t.duration && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Duration", children: [
              /* @__PURE__ */ e.jsx(it, { size: 12 }),
              ut(t.duration)
            ] }),
            p > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Subtasks", children: [
              /* @__PURE__ */ e.jsx(Re, { size: 12 }),
              p
            ] }),
            t.commentCount > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Comments", children: [
              /* @__PURE__ */ e.jsx(lt, { size: 12 }),
              t.commentCount
            ] }),
            t.labels.map((T) => /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-label", style: { color: K(a.label(T)?.color) }, children: [
              /* @__PURE__ */ e.jsx(Ce, { size: 12 }),
              T
            ] }, T)),
            t.completedAt && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", children: [
              "Completed ",
              new Date(t.completedAt).toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" })
            ] }),
            r && I && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-project-chip", children: [
              I.isInbox ? /* @__PURE__ */ e.jsx(Ie, { size: 12 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: K(I.color) } }),
              I.name,
              l ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
                " / ",
                l.name
              ] }) : null
            ] })
          ] })
        ] }),
        !N && /* @__PURE__ */ e.jsxs("div", { className: "td-task-actions", children: [
          /* @__PURE__ */ e.jsx("button", { ref: A, type: "button", className: "td-icon-btn", title: "Schedule (t = today)", onClick: () => E("due"), children: /* @__PURE__ */ e.jsx(Le, {}) }),
          /* @__PURE__ */ e.jsx("button", { ref: D, type: "button", className: "td-icon-btn", title: "Priority (1–4)", onClick: () => E("priority"), children: /* @__PURE__ */ e.jsx(Ft, {}) })
        ] }),
        k === "due" && /* @__PURE__ */ e.jsx(ot, { anchor: A.current, current: t.due?.string, onPick: (T) => C(t, { due: T }), onClose: () => E(null) }),
        k === "priority" && /* @__PURE__ */ e.jsx(rt, { anchor: D.current, current: t.priority, onPick: (T) => C(t, { priority: T }), onClose: () => E(null) })
      ]
    }
  );
}), ds = 650;
function us() {
  const s = Ke(), t = Rt(s), a = Lt(), c = t?.setup?.state === "ready";
  return u.useEffect(() => {
    s.call("status", {}).catch(() => {
    });
  }, [s]), c ? /* @__PURE__ */ e.jsx(ms, { revision: t.revision, defaultView: t.settings.defaultView, now: a, user: t.setup.user }) : /* @__PURE__ */ e.jsx("div", { className: "td-root", children: /* @__PURE__ */ e.jsx(Ot, { setup: t?.setup ?? null, onRetry: async () => {
    await s.call("status", { refresh: !0 });
  } }) });
}
function ms({ revision: s, defaultView: t, now: a, user: c }) {
  const r = Ke(), [o, m, b] = Je(r, "todoist.ui.view", { kind: t }), [p, h] = Je(r, "todoist.ui.sidebar", !0), [y, C] = u.useState(null), [v, w] = u.useState({}), [k, E] = u.useState([]), [A, D] = u.useState(null), [N, x] = u.useState(!1), [I, l] = u.useState(!0), [T, V] = u.useState(!1), [Y, H] = u.useState(null), [je, be] = u.useState({ today: null, inbox: null }), [me, X] = u.useState(/* @__PURE__ */ new Set()), [z, Z] = u.useState(null), [R, W] = u.useState(null), [pe, f] = u.useState([]), [_, Q] = u.useState(!1), [le, oe] = u.useState(""), [re, Te] = u.useState(() => window.innerWidth), [ee, n] = u.useState(!1), [S, $] = u.useState(!1), [P, he] = u.useState(null), Ye = u.useRef(null), $e = u.useRef(null), Ee = u.useRef(null), ye = u.useRef(0), te = re < 640, ht = re < 820, Ae = te ? ee : p;
  u.useEffect(() => {
    const i = () => Te(window.innerWidth);
    return window.addEventListener("resize", i), () => window.removeEventListener("resize", i);
  }, []);
  const G = u.useCallback((i, d = {}) => {
    const g = Date.now() + Math.random();
    f((j) => [...j.slice(-2), { id: g, message: i, ...d }]), setTimeout(() => f((j) => j.filter((F) => F.id !== g)), d.action ? 6e3 : d.tone === "error" ? 7e3 : 3e3);
  }, []), M = u.useCallback((i) => {
    const d = Qt(i);
    d === "NO_TOKEN" || d === "AUTH" || d === "TD_NOT_FOUND" || G(ie(i), { tone: "error" });
  }, [G]), Pe = u.useCallback((i) => {
    r.call("openUrl", { url: i }).catch(M);
  }, [r, M]);
  u.useEffect(() => {
    let i = !0;
    return r.call("meta", {}).then((d) => {
      i && C(d);
    }, M), () => {
      i = !1;
    };
  }, [r, s, M]);
  const Me = u.useCallback((i) => {
    r.call("sections", { projectId: i }).then(
      (d) => w((g) => ({ ...g, [i]: d })),
      () => {
      }
    );
  }, [r]), U = u.useMemo(
    () => y ? { ...y, sections: Object.values(v).flat() } : null,
    [y, v]
  ), B = u.useCallback(async (i, d = !1, g = null) => {
    const j = ++ye.current;
    d ? V(!0) : l(!0);
    try {
      const F = await r.call("list", { ...i, cursor: g });
      if (j !== ye.current) return;
      if (E((O) => d ? [...O, ...F.tasks.filter((ne) => !O.some((q) => q.id === ne.id))] : F.tasks), D(F.nextCursor), x(F.truncated), H(null), !d && (i.kind === "today" || i.kind === "inbox")) {
        const O = F.tasks.filter((ne) => !ne.completedAt).length;
        be((ne) => ({ ...ne, [i.kind]: F.nextCursor ? null : O }));
      }
    } catch (F) {
      if (j !== ye.current) return;
      H(ie(F)), M(F);
    } finally {
      j === ye.current && (l(!1), V(!1));
    }
  }, [r, M]), ft = JSON.stringify(o);
  u.useEffect(() => {
    b && B(o);
  }, [ft, s, b, B]);
  const We = u.useMemo(() => {
    const i = new Map(U?.projects.map((j) => [j.id, j])), d = new Map(U?.sections.map((j) => [j.id, j])), g = new Map(U?.labels.map((j) => [j.name, j]));
    return {
      project: (j) => i.get(j),
      section: (j) => j ? d.get(j) : void 0,
      label: (j) => g.get(j)
    };
  }, [U]), xt = U?.projects.find((i) => i.isInbox), ce = o.kind === "project" ? o.id : o.kind === "inbox" ? xt?.id : void 0, se = ce ? We.project(ce) : void 0;
  u.useEffect(() => {
    ce && Me(ce);
  }, [ce, s, Me]);
  const { groups: ke, depths: jt, childCounts: bt } = u.useMemo(() => hs(o, k, a, U, ce), [o, k, a, U, ce]), L = u.useMemo(() => ke.flatMap((i) => i.tasks), [ke]), ve = u.useCallback(async (i) => {
    if (i.completedAt) {
      try {
        await r.call("uncomplete", { id: i.id }), G("Task reopened");
      } catch (d) {
        M(d);
      }
      return;
    }
    X((d) => new Set(d).add(i.id));
    try {
      await r.call("complete", { id: i.id }), G(i.due?.recurring ? `Completed — next: ${i.due.string}` : "Task completed", {
        action: i.due?.recurring ? void 0 : {
          label: "Undo",
          run: () => {
            r.call("uncomplete", { id: i.id }).then(() => G("Task reopened"), M);
          }
        }
      }), setTimeout(() => X((d) => {
        const g = new Set(d);
        return g.delete(i.id), g;
      }), ds);
    } catch (d) {
      X((g) => {
        const j = new Set(g);
        return j.delete(i.id), j;
      }), M(d);
    }
  }, [r, G, M]), ge = u.useCallback(async (i, d) => {
    d.priority !== void 0 && E((g) => g.map((j) => j.id === i.id ? { ...j, priority: d.priority } : j));
    try {
      await r.call("update", { id: i.id, ...d });
    } catch (g) {
      M(g), B(o);
    }
  }, [r, M, B, o]), yt = u.useCallback(async (i) => {
    const d = et(i);
    let g = i;
    o.kind === "today" && !d.some((j) => j.kind === "date") && (g = `${i} today`), o.kind === "label" && o.query && !d.some((j) => j.kind === "label" && j.text.slice(1).replace(/"/g, "") === o.query) && (g = `${g} @${/\s/.test(o.query) ? `"${o.query}"` : o.query}`);
    try {
      const j = await r.call("quickAdd", { text: g });
      return o.kind === "project" && o.id && j.projectId !== o.id && !d.some((F) => F.kind === "project") && await r.call("move", { id: j.id, projectId: o.id }), G(`Added “${j.content}”`, { action: { label: "Open", run: () => W(j.id) } }), !0;
    } catch (j) {
      return M(j), !1;
    }
  }, [r, o, G, M]), Ve = u.useCallback(async (i) => {
    try {
      await r.call("createLabel", { name: i });
    } catch (d) {
      throw M(d), d;
    }
  }, [r, M]), He = u.useCallback((i) => {
    Q(!1), n(!1), Z(null), mt(i, o) ? B(i) : (E([]), D(null), m(i)), Ee.current?.scrollTo({ top: 0 });
  }, [o, m, B]);
  u.useEffect(() => {
    if (!_) return;
    const i = le.trim();
    if (!i) return;
    const d = setTimeout(() => {
      E([]), m({ kind: "search", query: i });
    }, 350);
    return () => clearTimeout(d);
  }, [le, _]), u.useEffect(() => {
    const i = (d) => {
      const j = d.target.closest('input, textarea, select, [contenteditable="true"]');
      if (d.key === "Escape") {
        if (S) {
          d.preventDefault(), $(!1);
          return;
        }
        if (R) {
          d.preventDefault(), W(null);
          return;
        }
        if (_) {
          d.preventDefault(), Q(!1), oe("");
          return;
        }
        if (ee) {
          d.preventDefault(), n(!1);
          return;
        }
        return;
      }
      if (j || d.metaKey || d.ctrlKey || d.altKey) return;
      const F = L.findIndex((ae) => ae.id === z), O = F >= 0 ? L[F] : null, ne = (ae) => {
        if (!L.length) return;
        const qe = L[Math.max(0, Math.min(L.length - 1, (F < 0 ? ae > 0 ? -1 : L.length : F) + ae))];
        Z(qe.id), Ee.current?.querySelector(`[data-task-id="${CSS.escape(qe.id)}"]`)?.scrollIntoView({ block: "nearest" }), R && W(qe.id);
      }, q = d.key;
      q === "j" || q === "ArrowDown" ? (d.preventDefault(), ne(1)) : q === "k" || q === "ArrowUp" ? (d.preventDefault(), ne(-1)) : (q === "Enter" || q === "o") && O ? (d.preventDefault(), W(O.id)) : (q === "x" || q === " ") && O ? (d.preventDefault(), ve(O)) : /^[1-4]$/.test(q) && O ? (d.preventDefault(), ge(O, { priority: 5 - Number(q) })) : q === "t" && O ? (d.preventDefault(), ge(O, { due: "today" })) : q === "q" || q === "a" ? (d.preventDefault(), Ye.current?.focus()) : q === "/" ? (d.preventDefault(), Q(!0), requestAnimationFrame(() => $e.current?.focus())) : q === "r" ? (d.preventDefault(), B(o), r.call("meta", {}).then(C, () => {
      })) : q === "[" ? (d.preventDefault(), te ? n((ae) => !ae) : h(!p)) : q === "?" && (d.preventDefault(), $((ae) => !ae));
    };
    return window.addEventListener("keydown", i), () => window.removeEventListener("keydown", i);
  }, [L, z, R, _, ee, S, ve, ge, B, o, r, te, p, h]);
  const kt = ps(o, U), vt = L.filter((i) => !i.completedAt && !me.has(i.id)).length, gt = o.kind === "today" ? "Due today unless you type a date" : o.kind === "project" && se ? `Adds to #${se.name}` : o.kind === "label" ? `Tagged @${o.query}` : o.kind === "inbox" ? "Adds to Inbox" : null, Nt = !c?.readOnly && o.kind !== "completed";
  return /* @__PURE__ */ e.jsxs("div", { className: `td-root${te ? " is-narrow" : ""}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: `td-layout${Ae && !te ? " has-sidebar" : ""}`, children: [
      Ae && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        te && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => n(!1) }),
        /* @__PURE__ */ e.jsx(
          ns,
          {
            meta: U,
            current: o,
            counts: je,
            user: c,
            onSelect: He,
            onSearch: () => {
              Q(!0), n(!1), requestAnimationFrame(() => $e.current?.focus());
            },
            onCreateProject: async (i, d) => {
              try {
                const g = await r.call("createProject", { name: i, color: d });
                He({ kind: "project", id: g.id });
              } catch (g) {
                M(g);
              }
            },
            onCreateLabel: async (i) => {
              try {
                await Ve(i);
              } catch {
              }
            },
            onSignOut: () => {
              r.call("logout", {}).catch(M);
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("main", { className: "td-main", children: [
        /* @__PURE__ */ e.jsxs("header", { className: "td-header", children: [
          /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: Ae ? "Hide sidebar ([)" : "Show sidebar ([)", onClick: () => te ? n((i) => !i) : h(!p), children: /* @__PURE__ */ e.jsx(zt, {}) }),
          _ ? /* @__PURE__ */ e.jsxs("div", { className: "td-search", children: [
            /* @__PURE__ */ e.jsx(tt, {}),
            /* @__PURE__ */ e.jsx(
              "input",
              {
                ref: $e,
                value: le,
                onChange: (i) => oe(i.target.value),
                placeholder: "Search tasks",
                onKeyDown: (i) => {
                  i.key === "Escape" && (i.preventDefault(), i.stopPropagation(), Q(!1), oe("")), i.key === "ArrowDown" && (i.preventDefault(), i.target.blur(), L[0] && Z(L[0].id));
                }
              }
            ),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", onClick: () => {
              Q(!1), oe("");
            }, title: "Close search", children: /* @__PURE__ */ e.jsx(de, { size: 12 }) })
          ] }) : /* @__PURE__ */ e.jsxs("div", { className: "td-title", children: [
            o.kind === "project" && se && /* @__PURE__ */ e.jsx("span", { className: "td-dot lg", style: { background: K(se.color) } }),
            o.kind === "inbox" && /* @__PURE__ */ e.jsx(Ie, {}),
            /* @__PURE__ */ e.jsx("h1", { children: kt }),
            !I && o.kind !== "completed" && /* @__PURE__ */ e.jsxs("span", { className: "td-title-count", children: [
              vt,
              A ? "+" : ""
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-header-tools", children: [
            se && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open project in Todoist", onClick: () => Pe(se.url), children: /* @__PURE__ */ e.jsx(st, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Keyboard shortcuts (?)", onClick: () => $(!0), children: /* @__PURE__ */ e.jsx(Kt, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: `td-icon-btn${I ? " is-spinning" : ""}`, title: "Refresh (r)", onClick: () => {
              B(o), r.call("meta", {}).then(C, () => {
              });
            }, children: /* @__PURE__ */ e.jsx(_t, {}) })
          ] })
        ] }),
        Nt && /* @__PURE__ */ e.jsx("div", { className: "td-add-row", children: /* @__PURE__ */ e.jsx(
          ss,
          {
            ref: Ye,
            placeholder: te ? "Add a task" : 'Add a task — "Review PR tomorrow 3pm p1 #Work @review"',
            contextLabel: gt,
            onSubmit: yt
          }
        ) }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-list", ref: Ee, role: "list", children: [
          I && !k.length ? /* @__PURE__ */ e.jsx(xs, {}) : Y && !k.length ? /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
            /* @__PURE__ */ e.jsx("p", { children: "Couldn’t load this list." }),
            /* @__PURE__ */ e.jsx("p", { className: "td-dim td-small", children: Y }),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void B(o), children: "Try again" })
          ] }) : L.length ? ke.map((i) => /* @__PURE__ */ e.jsxs("section", { className: "td-group", children: [
            (ke.length > 1 || i.subtitle || i.key !== "all") && i.title && /* @__PURE__ */ e.jsxs("h2", { className: `td-group-title${i.tone ? ` tone-${i.tone}` : ""}`, children: [
              i.title,
              i.subtitle && /* @__PURE__ */ e.jsx("span", { className: "td-group-sub", children: i.subtitle }),
              /* @__PURE__ */ e.jsx("span", { className: "td-group-count", children: i.tasks.length })
            ] }),
            i.tasks.map((d) => /* @__PURE__ */ e.jsx(
              cs,
              {
                task: d,
                lookup: We,
                now: a,
                showProject: o.kind !== "project" && o.kind !== "inbox",
                focused: z === d.id || R === d.id,
                completing: me.has(d.id),
                depth: jt.get(d.id) ?? 0,
                childCount: bt.get(d.id) ?? 0,
                onToggle: ve,
                onOpen: (g) => {
                  Z(g.id), W(g.id);
                },
                onPatch: ge,
                onFocus: (g) => Z(g.id),
                onOpenUrl: Pe
              },
              d.id
            ))
          ] }, i.key)) : /* @__PURE__ */ e.jsx(fs, { view: o }),
          (A || N) && L.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "td-more", children: A ? /* @__PURE__ */ e.jsxs("button", { className: "td-btn", disabled: T, onClick: () => void B(o, !0, A), children: [
            T ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
            " Load more"
          ] }) : /* @__PURE__ */ e.jsxs("span", { className: "td-dim td-small", children: [
            "Showing the first ",
            L.length,
            " tasks. Narrow the list with a project, label or search."
          ] }) }),
          o.kind === "project" && se && !c?.readOnly && !I && (P !== null ? /* @__PURE__ */ e.jsxs(
            "form",
            {
              className: "td-section-add",
              onSubmit: async (i) => {
                if (i.preventDefault(), !!P.trim())
                  try {
                    await r.call("createSection", { projectId: se.id, name: P.trim() }), he(null);
                  } catch (d) {
                    M(d);
                  }
              },
              children: [
                /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: P, onChange: (i) => he(i.target.value), placeholder: "Section name", onKeyDown: (i) => {
                  i.key === "Escape" && (i.preventDefault(), i.stopPropagation(), he(null));
                } }),
                /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !P.trim(), children: "Add section" }),
                /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => he(null), children: "Cancel" })
              ]
            }
          ) : /* @__PURE__ */ e.jsxs("button", { className: "td-add-section", onClick: () => he(""), children: [
            /* @__PURE__ */ e.jsx(fe, { size: 12 }),
            " Add section"
          ] }))
        ] })
      ] }),
      R && U && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        ht && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => W(null) }),
        /* @__PURE__ */ e.jsx(
          ls,
          {
            taskId: R,
            meta: U,
            now: a,
            onClose: () => W(null),
            onToggle: ve,
            onOpenTask: (i) => W(i),
            onChanged: () => {
            },
            onError: (i) => G(i, { tone: "error" }),
            onOpenUrl: Pe,
            onCreateLabel: Ve,
            onNeedSections: Me
          },
          R
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "td-toasts", "aria-live": "polite", children: pe.map((i) => /* @__PURE__ */ e.jsxs("div", { className: `td-toast${i.tone === "error" ? " is-error" : ""}`, children: [
      /* @__PURE__ */ e.jsx("span", { children: i.message }),
      i.action && /* @__PURE__ */ e.jsx("button", { onClick: () => {
        i.action.run(), f((d) => d.filter((g) => g.id !== i.id));
      }, children: i.action.label })
    ] }, i.id)) }),
    S && /* @__PURE__ */ e.jsx(js, { onClose: () => $(!1) })
  ] });
}
function ps(s, t) {
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
function hs(s, t, a, c, r) {
  const o = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), b = new Set(t.map((h) => h.id));
  for (const h of t) h.parentId && b.has(h.parentId) && m.set(h.parentId, (m.get(h.parentId) ?? 0) + 1);
  if (s.kind === "today") return { groups: Zt(t, a), depths: o, childCounts: m };
  if (s.kind === "upcoming") return { groups: es(t, a), depths: o, childCounts: m };
  if (s.kind === "completed") return { groups: ts(t, a), depths: o, childCounts: m };
  if ((s.kind === "project" || s.kind === "inbox") && r) {
    const h = (c?.sections ?? []).filter((k) => k.projectId === r), y = /* @__PURE__ */ new Map();
    for (const k of t) {
      const E = k.sectionId && h.some((D) => D.id === k.sectionId) ? k.sectionId : null, A = y.get(E) ?? [];
      A.push(k), y.set(E, A);
    }
    const C = (k) => {
      const E = new Set(k.map((x) => x.id)), A = k.filter((x) => !x.parentId || !E.has(x.parentId)).sort((x, I) => x.order - I.order), D = [], N = (x, I) => {
        D.push(x), o.set(x.id, I), k.filter((l) => l.parentId === x.id).sort((l, T) => l.order - T.order).forEach((l) => N(l, Math.min(I + 1, 4)));
      };
      return A.forEach((x) => N(x, 0)), D;
    }, v = [], w = y.get(null) ?? [];
    (w.length || !h.length) && v.push({ key: "all", title: "", tasks: C(w) });
    for (const k of h)
      v.push({ key: k.id, title: k.name, tasks: C(y.get(k.id) ?? []) });
    return { groups: v.filter((k) => k.tasks.length || k.key !== "all"), depths: o, childCounts: m };
  }
  return { groups: [{ key: "all", title: "", tasks: [...t].sort((h, y) => y.priority - h.priority || (h.due?.date ?? "9999").localeCompare(y.due?.date ?? "9999") || h.order - y.order) }], depths: o, childCounts: m };
}
function fs({ view: s }) {
  const t = {
    today: ["You’re all done for today", "Enjoy the rest of your day — or add something below."],
    upcoming: ["Nothing scheduled in the next two weeks", "Tasks with a due date show up here."],
    inbox: ["Inbox zero", "New tasks without a project land here."],
    completed: ["No completed tasks yet", "Tasks you complete show up here."],
    search: ["No matching tasks", "Search looks at task names."]
  }, [a, c] = t[s.kind] ?? ["No tasks here", "Add one with the bar above."];
  return /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
    /* @__PURE__ */ e.jsxs("svg", { width: "96", height: "72", viewBox: "0 0 96 72", "aria-hidden": "true", className: "td-empty-art", children: [
      /* @__PURE__ */ e.jsx("rect", { x: "14", y: "10", width: "68", height: "52", rx: "10", fill: "var(--td-surface-hi)" }),
      /* @__PURE__ */ e.jsx("circle", { cx: "32", cy: "30", r: "6", fill: "none", stroke: "var(--td-accent)", strokeWidth: "2.5" }),
      /* @__PURE__ */ e.jsx("path", { d: "m29.4 30.2 2 2 3.6-3.8", fill: "none", stroke: "var(--td-accent)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }),
      /* @__PURE__ */ e.jsx("rect", { x: "44", y: "27", width: "26", height: "5", rx: "2.5", fill: "var(--td-border-hi)" }),
      /* @__PURE__ */ e.jsx("rect", { x: "26", y: "44", width: "44", height: "5", rx: "2.5", fill: "var(--td-border)" })
    ] }),
    /* @__PURE__ */ e.jsx("p", { className: "td-empty-title", children: a }),
    /* @__PURE__ */ e.jsx("p", { className: "td-dim", children: c })
  ] });
}
function xs() {
  return /* @__PURE__ */ e.jsx("div", { className: "td-skeleton-list", "aria-busy": "true", children: [78, 52, 64, 40, 70].map((s, t) => /* @__PURE__ */ e.jsxs("div", { className: "td-task is-skeleton", children: [
    /* @__PURE__ */ e.jsx("span", { className: "td-checkbox" }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${s}%` } }),
      /* @__PURE__ */ e.jsx("span", { className: "td-skel sm", style: { width: `${s / 2}%` } })
    ] })
  ] }, t)) });
}
function js({ onClose: s }) {
  const t = [
    ["q / a", "Quick add"],
    ["/", "Search"],
    ["j / k  ↓ / ↑", "Move between tasks"],
    ["Enter / o", "Open task"],
    ["x / Space", "Complete / reopen"],
    ["1 – 4", "Set priority"],
    ["t", "Schedule for today"],
    ["r", "Refresh"],
    ["[", "Toggle sidebar"],
    ["Esc", "Close drawer / search"],
    ["⌘⌥T", "Quick Add from anywhere in Agent Code"]
  ];
  return /* @__PURE__ */ e.jsx("div", { className: "td-modal-scrim", onClick: s, children: /* @__PURE__ */ e.jsxs("div", { className: "td-help", onClick: (a) => a.stopPropagation(), role: "dialog", "aria-label": "Keyboard shortcuts", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-help-head", children: [
      /* @__PURE__ */ e.jsx("h2", { children: "Keyboard shortcuts" }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: s, children: /* @__PURE__ */ e.jsx(de, {}) })
    ] }),
    /* @__PURE__ */ e.jsx("dl", { children: t.map(([a, c]) => /* @__PURE__ */ e.jsxs("div", { children: [
      /* @__PURE__ */ e.jsx("dt", { children: a.split("  ").map((r) => /* @__PURE__ */ e.jsx("kbd", { children: r }, r)) }),
      /* @__PURE__ */ e.jsx("dd", { children: c })
    ] }, a)) })
  ] }) });
}
const ks = Gt({
  mount(s, t) {
    Ut(Ht);
    const a = Bt(), c = Yt(s);
    return c.render(
      /* @__PURE__ */ e.jsx(Wt.Provider, { value: Vt(t), children: /* @__PURE__ */ e.jsx(us, {}) })
    ), () => {
      a(), queueMicrotask(() => c.unmount());
    };
  }
});
export {
  ks as default
};

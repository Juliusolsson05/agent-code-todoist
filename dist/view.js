import { r as u, t as Ge, c as kt, j as e, l as me, b as K, L as ve, m as Ye, n as Je, I as we, T as vt, p as gt, o as Nt, q as wt, v as Ct, U as St, w as Dt, u as Re, x as re, M as It, E as Xe, y as Tt, z as Pe, P as ke, C as Me, R as Ze, G as et, H as tt, F as We, J as st, D as nt, d as at, e as $t, f as At, K as Et, a as Pt, N as Mt, S as qt, O as Ve, Q as Ft, V as Rt, W as Lt, i as zt, g as Ot, h as Kt, B as _t, k as Bt, s as Ut } from "./shared-SetupScreen.js";
import { t as se, b as Yt, d as Wt } from "./shared-types.js";
const Le = 864e5;
function H(s) {
  return Math.floor(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate()) / Le);
}
function ze(s) {
  const [t, a, c] = s.slice(0, 10).split("-").map(Number);
  return new Date(t, (a || 1) - 1, c || 1);
}
function pe(s) {
  return s.datetime ? H(new Date(s.datetime)) : H(ze(s.date));
}
function ge(s, t) {
  if (!s) return "none";
  const a = H(t), c = pe(s);
  return c < a || c === a && s.datetime && new Date(s.datetime).getTime() < t.getTime() ? "overdue" : c === a ? "today" : c === a + 1 ? "tomorrow" : c < a + 7 ? "week" : "future";
}
const Vt = new Intl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit" }), it = new Intl.DateTimeFormat(void 0, { weekday: "long" }), qe = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric" }), lt = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", year: "numeric" }), Oe = new Intl.DateTimeFormat(void 0, { weekday: "short", month: "short", day: "numeric" });
function Fe(s, t) {
  const a = H(t), c = pe(s), r = s.datetime ? new Date(s.datetime) : ze(s.date);
  let l;
  return c === a ? l = "Today" : c === a + 1 ? l = "Tomorrow" : c === a - 1 ? l = "Yesterday" : c > a && c < a + 7 ? l = it.format(r) : r.getFullYear() === t.getFullYear() ? l = qe.format(r) : l = lt.format(r), s.datetime ? `${l} ${Vt.format(r)}` : l;
}
function Ht(s, t) {
  const a = ze(s), c = H(a) - H(t);
  return c === 0 ? "Today" : c === 1 ? "Tomorrow" : c < 0 ? `${qe.format(a)} (passed)` : a.getFullYear() === t.getFullYear() ? qe.format(a) : lt.format(a);
}
function ot(s) {
  if (s.unit === "day") return s.amount === 1 ? "1 day" : `${s.amount} days`;
  const t = Math.floor(s.amount / 60), a = s.amount % 60;
  return t && a ? `${t}h ${a}m` : t ? `${t}h` : `${a}m`;
}
function Ne(s, t) {
  const a = s.due?.datetime ? new Date(s.due.datetime).getTime() : Number.POSITIVE_INFINITY, c = t.due?.datetime ? new Date(t.due.datetime).getTime() : Number.POSITIVE_INFINITY;
  return a !== c ? a - c : s.priority !== t.priority ? t.priority - s.priority : s.order - t.order;
}
function Qt(s, t) {
  const a = [], c = [];
  for (const l of s) (ge(l.due, t) === "overdue" ? a : c).push(l);
  a.sort((l, m) => (l.due && m.due ? pe(l.due) - pe(m.due) : 0) || Ne(l, m)), c.sort(Ne);
  const r = [];
  return a.length && r.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: a }), r.push({ key: "today", title: "Today", subtitle: Oe.format(t), tone: "today", tasks: c }), r;
}
function Gt(s, t) {
  const a = H(t), c = /* @__PURE__ */ new Map(), r = [], l = [];
  for (const y of s) {
    if (!y.due) {
      l.push(y);
      continue;
    }
    const p = pe(y.due);
    if (p < a) {
      r.push(y);
      continue;
    }
    const x = c.get(p) ?? [];
    x.push(y), c.set(p, x);
  }
  const m = [];
  r.length && m.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: r.sort(Ne) });
  for (const y of [...c.keys()].sort((p, x) => p - x)) {
    const p = new Date(y * Le), x = new Date(p.getUTCFullYear(), p.getUTCMonth(), p.getUTCDate()), h = y === a ? "Today" : y === a + 1 ? "Tomorrow" : it.format(x);
    m.push({
      key: `day-${y}`,
      title: h,
      subtitle: Oe.format(x),
      tone: y === a ? "today" : y === a + 1 ? "tomorrow" : "future",
      tasks: c.get(y).sort(Ne)
    });
  }
  return l.length && m.push({ key: "undated", title: "No date", tasks: l }), m;
}
function Jt(s, t) {
  const a = H(t), c = /* @__PURE__ */ new Map();
  for (const r of s) {
    const l = r.completedAt ? H(new Date(r.completedAt)) : a, m = c.get(l) ?? [];
    m.push(r), c.set(l, m);
  }
  return [...c.keys()].sort((r, l) => l - r).map((r) => {
    const l = new Date(r * Le), m = new Date(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate());
    return {
      key: `done-${r}`,
      title: r === a ? "Today" : r === a - 1 ? "Yesterday" : Oe.format(m),
      tasks: c.get(r).sort((y, p) => (p.completedAt ?? "").localeCompare(y.completedAt ?? ""))
    };
  });
}
const Xt = u.forwardRef(function({ placeholder: t, contextLabel: a, disabled: c, onSubmit: r, autoFocus: l, large: m }, y) {
  const [p, x] = u.useState(""), [h, w] = u.useState(!1), v = u.useRef(null), $ = u.useRef(null);
  u.useImperativeHandle(y, () => ({ focus: () => v.current?.focus() }), []);
  const k = () => {
    $.current && v.current && ($.current.scrollLeft = v.current.scrollLeft);
  }, A = async () => {
    const j = p.trim();
    if (!(!j || h)) {
      w(!0);
      try {
        await r(j) && x("");
      } finally {
        w(!1), requestAnimationFrame(() => v.current?.focus());
      }
    }
  }, T = Ge(p), E = p ? kt(p) : "", g = T.some((j) => j.kind !== "text");
  return /* @__PURE__ */ e.jsxs("div", { className: `td-quickadd${m ? " is-large" : ""}${h ? " is-busy" : ""}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-field", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-quickadd-plus", children: /* @__PURE__ */ e.jsx(me, {}) }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-stack", children: [
        /* @__PURE__ */ e.jsxs("div", { ref: $, className: "td-quickadd-mirror", "aria-hidden": "true", children: [
          T.map((j, C) => /* @__PURE__ */ e.jsx("span", { className: `tok-${j.kind}`, children: j.text }, C)),
          "​"
        ] }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            ref: v,
            className: "td-quickadd-input",
            value: p,
            disabled: c,
            autoFocus: l,
            spellCheck: !1,
            placeholder: t,
            "aria-label": "Quick add task",
            onChange: (j) => {
              x(j.target.value), requestAnimationFrame(k);
            },
            onScroll: k,
            onKeyDown: (j) => {
              j.key === "Enter" && !j.nativeEvent.isComposing ? (j.preventDefault(), A()) : j.key === "Escape" && p ? (j.preventDefault(), j.stopPropagation(), x("")) : j.key === "Escape" && (j.preventDefault(), j.stopPropagation(), v.current?.blur());
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-primary td-quickadd-submit", disabled: !p.trim() || h || c, onClick: () => void A(), children: h ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : "Add" })
    ] }),
    (g || a) && /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-hint", children: [
      g && E ? /* @__PURE__ */ e.jsxs("span", { children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: E }),
        "”"
      ] }) : null,
      a ? /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: a }) : null
    ] })
  ] });
});
function rt(s, t) {
  return s.kind === t.kind && (s.id ?? null) === (t.id ?? null) && (s.query ?? null) === (t.query ?? null);
}
function Zt({ meta: s, current: t, counts: a, user: c, onSelect: r, onSearch: l, onCreateProject: m, onCreateLabel: y, onSignOut: p }) {
  const [x, h] = u.useState({ favorites: !0, projects: !0, labels: !1, filters: !1 }), [w, v] = u.useState(null), [$, k] = u.useState(""), [A, T] = u.useState("charcoal"), E = s?.projects.find((o) => o.isInbox), g = (o, S, U, Q, ne) => /* @__PURE__ */ e.jsxs(
    "button",
    {
      className: `td-nav-item${rt(t, o) ? " is-active" : ""}`,
      onClick: () => r(o),
      title: U,
      children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", style: ne ? { color: ne } : void 0, children: S }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: U }),
        Q ? /* @__PURE__ */ e.jsx("span", { className: "td-nav-count", children: Q }) : null
      ]
    },
    `${o.kind}:${o.id ?? o.query ?? ""}`
  ), j = [
    ...s?.projects.filter((o) => o.isFavorite && !o.isInbox).map((o) => g({ kind: "project", id: o.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: K(o.color) } }), o.name)) ?? [],
    ...s?.labels.filter((o) => o.isFavorite).map((o) => g({ kind: "label", query: o.name }, /* @__PURE__ */ e.jsx(ve, {}), o.name, null, K(o.color))) ?? [],
    ...s?.filters.filter((o) => o.isFavorite).map((o) => g({ kind: "filter", id: o.id, query: o.query }, /* @__PURE__ */ e.jsx(Ye, {}), o.name, null, K(o.color))) ?? []
  ], C = async (o) => {
    o.preventDefault();
    const S = $.trim();
    S && (w === "project" && await m(S, A), w === "label" && await y(S), k(""), v(null));
  };
  return /* @__PURE__ */ e.jsxs("nav", { className: "td-sidebar", "aria-label": "Todoist navigation", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-item", onClick: l, title: "Search (/)", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", children: /* @__PURE__ */ e.jsx(Je, {}) }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: "Search" }),
        /* @__PURE__ */ e.jsx("kbd", { children: "/" })
      ] }),
      g({ kind: "inbox" }, /* @__PURE__ */ e.jsx(we, {}), "Inbox", a.inbox, "#246fe0"),
      g({ kind: "today" }, /* @__PURE__ */ e.jsx(vt, {}), "Today", a.today, "#058527"),
      g({ kind: "upcoming" }, /* @__PURE__ */ e.jsx(St, {}), "Upcoming", null, "#692fc2"),
      g({ kind: "completed" }, /* @__PURE__ */ e.jsx(Dt, {}), "Completed", null, "#eb8909")
    ] }),
    j.length > 0 && /* @__PURE__ */ e.jsx(ye, { title: "Favorites", open: x.favorites, onToggle: () => h((o) => ({ ...o, favorites: !o.favorites })), children: j }),
    /* @__PURE__ */ e.jsxs(
      ye,
      {
        title: "My Projects",
        open: x.projects,
        onToggle: () => h((o) => ({ ...o, projects: !o.projects })),
        onAdd: () => {
          v("project"), k(""), h((o) => ({ ...o, projects: !0 }));
        },
        children: [
          !s && /* @__PURE__ */ e.jsx(es, {}),
          s && gt(s.projects).filter(({ project: o }) => o.id !== E?.id).map(({ project: o, depth: S }) => /* @__PURE__ */ e.jsx("div", { style: { paddingLeft: S * 12 }, children: g({ kind: "project", id: o.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: K(o.color) } }), o.name) }, o.id)),
          w === "project" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (o) => void C(o), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: $, onChange: (o) => k(o.target.value), placeholder: "Project name", onKeyDown: (o) => {
              o.key === "Escape" && (o.preventDefault(), o.stopPropagation(), v(null));
            } }),
            /* @__PURE__ */ e.jsx("div", { className: "td-swatches", children: Nt.map((o) => /* @__PURE__ */ e.jsx("button", { type: "button", title: o.replace("_", " "), className: `td-swatch${o === A ? " is-on" : ""}`, style: { background: K(o) }, onClick: () => T(o) }, o)) }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => v(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !$.trim(), children: "Add project" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e.jsxs(
      ye,
      {
        title: "Labels",
        open: x.labels,
        onToggle: () => h((o) => ({ ...o, labels: !o.labels })),
        onAdd: () => {
          v("label"), k(""), h((o) => ({ ...o, labels: !0 }));
        },
        children: [
          s?.labels.map((o) => g({ kind: "label", query: o.name }, /* @__PURE__ */ e.jsx(ve, {}), o.name, null, K(o.color))),
          s && !s.labels.length && w !== "label" && /* @__PURE__ */ e.jsx("div", { className: "td-nav-empty", children: "No labels" }),
          w === "label" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (o) => void C(o), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: $, onChange: (o) => k(o.target.value), placeholder: "Label name", onKeyDown: (o) => {
              o.key === "Escape" && (o.preventDefault(), o.stopPropagation(), v(null));
            } }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => v(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !$.trim(), children: "Add label" })
            ] })
          ] })
        ]
      }
    ),
    s && s.filters.length > 0 && /* @__PURE__ */ e.jsx(ye, { title: "Filters", open: x.filters, onToggle: () => h((o) => ({ ...o, filters: !o.filters })), children: s.filters.map((o) => g({ kind: "filter", id: o.id, query: o.query }, /* @__PURE__ */ e.jsx(Ye, {}), o.name, null, K(o.color))) }),
    c && /* @__PURE__ */ e.jsxs("div", { className: "td-account", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-avatar", children: (c.fullName || c.email || "?").slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ e.jsxs("span", { className: "td-account-text", children: [
        /* @__PURE__ */ e.jsx("span", { children: c.fullName || c.email }),
        c.readOnly && /* @__PURE__ */ e.jsx("span", { className: "td-dim td-small", children: "Read-only" })
      ] }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Sign out of td", onClick: p, children: /* @__PURE__ */ e.jsx(wt, { size: 13 }) })
    ] })
  ] });
}
function ye({ title: s, open: t, onToggle: a, onAdd: c, children: r }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-heading", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-heading-btn", onClick: a, "aria-expanded": t, children: [
        /* @__PURE__ */ e.jsx(Ct, { size: 12, className: t ? "" : "is-collapsed" }),
        s
      ] }),
      c && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: `Add ${s.toLowerCase().replace("my ", "").replace(/s$/, "")}`, onClick: c, children: /* @__PURE__ */ e.jsx(me, { size: 12 }) })
    ] }),
    t && r
  ] });
}
function es() {
  return /* @__PURE__ */ e.jsx(e.Fragment, { children: [70, 55, 80].map((s) => /* @__PURE__ */ e.jsx("div", { className: "td-nav-item", children: /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${s}%` } }) }, s)) });
}
const Ee = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"]))/g;
function ce(s, t, a = "i") {
  const c = [];
  let r = 0, l = 0;
  Ee.lastIndex = 0;
  for (let m = Ee.exec(s); m; m = Ee.exec(s)) {
    m.index > r && c.push(s.slice(r, m.index));
    const y = `${a}${l++}`;
    m[2] || m[3] ? c.push(/* @__PURE__ */ e.jsx("strong", { children: m[2] ?? m[3] }, y)) : m[4] || m[5] ? c.push(/* @__PURE__ */ e.jsx("em", { children: m[4] ?? m[5] }, y)) : m[6] ? c.push(/* @__PURE__ */ e.jsx("code", { children: m[6] }, y)) : m[7] && m[8] ? c.push(/* @__PURE__ */ e.jsx(He, { url: m[8], open: t, children: m[7] }, y)) : m[9] && c.push(/* @__PURE__ */ e.jsx(He, { url: m[9], open: t, children: ts(m[9]) }, y)), r = m.index + m[0].length;
  }
  return r < s.length && c.push(s.slice(r)), c;
}
function ts(s) {
  try {
    const t = new URL(s), a = t.pathname.length > 28 ? `${t.pathname.slice(0, 26)}…` : t.pathname;
    return `${t.hostname.replace(/^www\./, "")}${a === "/" ? "" : a}`;
  } catch {
    return s;
  }
}
function He({ url: s, open: t, children: a }) {
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
function Qe({ text: s, open: t }) {
  const a = s.replace(/\r\n/g, `
`).split(`
`), c = [];
  let r = 0, l = 0;
  for (; r < a.length; ) {
    const m = a[r];
    if (m.startsWith("```")) {
      const p = [];
      for (r++; r < a.length && !a[r].startsWith("```"); ) p.push(a[r++]);
      r++, c.push(/* @__PURE__ */ e.jsx("pre", { className: "td-md-pre", children: /* @__PURE__ */ e.jsx("code", { children: p.join(`
`) }) }, l++));
      continue;
    }
    if (/^\s*[-*]\s+/.test(m)) {
      const p = [];
      for (; r < a.length && /^\s*[-*]\s+/.test(a[r]); ) p.push(a[r++].replace(/^\s*[-*]\s+/, ""));
      c.push(/* @__PURE__ */ e.jsx("ul", { children: p.map((x, h) => /* @__PURE__ */ e.jsx("li", { children: ce(x, t, `l${l}-${h}`) }, h)) }, l++));
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(m)) {
      const p = [];
      for (; r < a.length && /^\s*\d+[.)]\s+/.test(a[r]); ) p.push(a[r++].replace(/^\s*\d+[.)]\s+/, ""));
      c.push(/* @__PURE__ */ e.jsx("ol", { children: p.map((x, h) => /* @__PURE__ */ e.jsx("li", { children: ce(x, t, `o${l}-${h}`) }, h)) }, l++));
      continue;
    }
    if (m.startsWith("> ")) {
      const p = [];
      for (; r < a.length && a[r].startsWith("> "); ) p.push(a[r++].slice(2));
      c.push(/* @__PURE__ */ e.jsx("blockquote", { children: ce(p.join(" "), t, `q${l}`) }, l++));
      continue;
    }
    if (!m.trim()) {
      r++;
      continue;
    }
    const y = [];
    for (; r < a.length && a[r].trim() && !/^(```|\s*[-*]\s+|\s*\d+[.)]\s+|> )/.test(a[r]); ) y.push(a[r++]);
    c.push(
      /* @__PURE__ */ e.jsx("p", { children: y.map((p, x) => /* @__PURE__ */ e.jsxs(u.Fragment, { children: [
        x > 0 && /* @__PURE__ */ e.jsx("br", {}),
        ce(p, t, `p${l}-${x}`)
      ] }, x)) }, l++)
    );
  }
  return /* @__PURE__ */ e.jsx("div", { className: "td-md", children: c });
}
const ct = ["15m", "30m", "45m", "1h", "1h30m", "2h", "3h", "4h"];
function ss({ taskId: s, meta: t, now: a, onClose: c, onToggle: r, onOpenTask: l, onChanged: m, onError: y, onOpenUrl: p, onCreateLabel: x }) {
  const h = Re(), [w, v] = u.useState(null), [$, k] = u.useState(null), [A, T] = u.useState(null), [E, g] = u.useState(""), [j, C] = u.useState(null), [o, S] = u.useState(!1), [U, Q] = u.useState(""), [ne, de] = u.useState(""), [ae, G] = u.useState(!1), L = { due: u.useRef(null), priority: u.useRef(null), labels: u.useRef(null), project: u.useRef(null) }, Y = async () => {
    try {
      k(null), v(await h.call("task", { id: s }));
    } catch (n) {
      k(se(n));
    }
  };
  u.useEffect(() => {
    v(null), T(null), S(!1), Q(""), Y();
  }, [s]);
  const F = async (n) => {
    if (!w) return;
    const D = w;
    v({ ...w, task: { ...w.task, ...as(n) } });
    try {
      const I = await h.call("update", { id: w.task.id, ...n });
      v((P) => P && { ...P, task: I }), m();
    } catch (I) {
      v(D), y(se(I));
    }
  }, Ce = async (n, D) => {
    if (w)
      try {
        await h.call("move", { id: w.task.id, projectId: n, ...D ? { sectionId: D } : { noSection: !0 } }), v({ ...w, task: { ...w.task, projectId: n, sectionId: D } }), m();
      } catch (I) {
        y(se(I));
      }
  };
  if ($)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", {}),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: c, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(re, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
        /* @__PURE__ */ e.jsx("p", { children: $ }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void Y(), children: "Try again" })
      ] })
    ] });
  if (!w)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: 120 } }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: c, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(re, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "80%", height: 20, marginBottom: 14 } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "60%" } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "40%", marginTop: 8 } })
      ] })
    ] });
  const { task: f, children: _, comments: W } = w, ie = t.projects.find((n) => n.id === f.projectId), le = t.sections.find((n) => n.id === f.sectionId), oe = !!f.completedAt, Se = ge(f.due, a), J = async () => {
    const n = E.trim(), D = A;
    T(null), D === "title" && n && n !== f.content && await F({ content: n }), D === "description" && E !== f.description && await F({ description: E });
  };
  return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", "aria-label": "Task details", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: L.project, className: "td-crumb", onClick: () => C("project"), title: "Move to project / section", children: [
        ie?.isInbox ? /* @__PURE__ */ e.jsx(we, { size: 13 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: K(ie?.color) } }),
        /* @__PURE__ */ e.jsx("span", { children: ie?.name ?? "Project" }),
        le && /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
          "/ ",
          le.name
        ] }),
        /* @__PURE__ */ e.jsx(It, { size: 12, className: "td-crumb-move" })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-tools", children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open in Todoist", onClick: () => p(f.url), children: /* @__PURE__ */ e.jsx(Xe, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn danger", title: "Delete task", onClick: () => S(!0), children: /* @__PURE__ */ e.jsx(Tt, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: c, children: /* @__PURE__ */ e.jsx(re, {}) })
      ] })
    ] }),
    o && /* @__PURE__ */ e.jsxs("div", { className: "td-confirm", children: [
      /* @__PURE__ */ e.jsxs("span", { children: [
        "Delete this task",
        _.length ? ` and its ${_.length} subtask${_.length > 1 ? "s" : ""}` : "",
        "? This cannot be undone."
      ] }),
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => S(!1), children: "Cancel" }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            className: "td-btn td-btn-danger",
            autoFocus: !0,
            onClick: async () => {
              try {
                await h.call("delete", { id: f.id }), m(), c();
              } catch (n) {
                y(se(n));
              }
            },
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
      f.parentId && /* @__PURE__ */ e.jsxs("button", { className: "td-parent-link", onClick: () => l(f.parentId), children: [
        /* @__PURE__ */ e.jsx(Pe, { size: 12 }),
        " Open parent task"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-title-row", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox lg p${f.priority}${oe ? " is-checked" : ""}`,
            style: { "--prio": ke[f.priority] },
            "aria-label": oe ? "Reopen task" : "Complete task",
            onClick: async () => {
              await r(f), v((n) => n && { ...n, task: { ...n.task, completedAt: oe ? null : (/* @__PURE__ */ new Date()).toISOString() } });
            },
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        A === "title" ? /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-title",
            value: E,
            rows: Math.min(5, Math.max(1, Math.ceil(E.length / 40))),
            onChange: (n) => g(n.target.value),
            onBlur: () => void J(),
            onKeyDown: (n) => {
              n.key === "Enter" && !n.shiftKey && (n.preventDefault(), J()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), T(null));
            }
          }
        ) : /* @__PURE__ */ e.jsx("h2", { className: `td-drawer-title${oe ? " is-done" : ""}`, onClick: () => {
          g(f.content), T("title");
        }, title: "Click to edit", children: ce(f.content, p, "title") })
      ] }),
      A === "description" ? /* @__PURE__ */ e.jsxs("div", { className: "td-edit-desc-wrap", children: [
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-desc",
            value: E,
            placeholder: "Description (Markdown supported)",
            onChange: (n) => g(n.target.value),
            onKeyDown: (n) => {
              n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), J()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), T(null));
            }
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-edit-actions", children: [
          /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "⌘↵ to save" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => T(null), children: "Cancel" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", onClick: () => void J(), children: "Save" })
        ] })
      ] }) : f.description ? /* @__PURE__ */ e.jsx("div", { className: "td-desc", onClick: (n) => {
        n.target.closest("a") || (g(f.description), T("description"));
      }, title: "Click to edit", children: /* @__PURE__ */ e.jsx(Qe, { text: f.description, open: p }) }) : /* @__PURE__ */ e.jsx("button", { className: "td-add-desc", onClick: () => {
        g(""), T("description");
      }, children: "Add description" }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-props", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Me, { size: 13 }),
          "Due"
        ] }),
        /* @__PURE__ */ e.jsx("button", { ref: L.due, className: `td-prop-value tone-${Se}`, onClick: () => C("due"), children: f.due ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          f.due.recurring && /* @__PURE__ */ e.jsx(Ze, { size: 12 }),
          Fe(f.due, a),
          /* @__PURE__ */ e.jsx("span", { className: "td-dim td-prop-sub", children: f.due.recurring ? f.due.string : "" })
        ] }) : /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "No date" }) }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(et, { size: 13 }),
          "Deadline"
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-value-wrap", children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              className: `td-date-input${f.deadline ? "" : " is-empty"}`,
              value: f.deadline ?? "",
              onChange: (n) => void F({ deadline: n.target.value }),
              "aria-label": "Deadline"
            }
          ),
          f.deadline && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Clear deadline", onClick: () => void F({ deadline: "" }), children: /* @__PURE__ */ e.jsx(re, { size: 12 }) })
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(tt, { size: 13 }),
          "Duration"
        ] }),
        /* @__PURE__ */ e.jsxs(
          "select",
          {
            className: "td-select",
            value: f.duration ? ns(f.duration) : "",
            onChange: (n) => {
              n.target.value && F({ duration: n.target.value });
            },
            "aria-label": "Duration",
            children: [
              /* @__PURE__ */ e.jsx("option", { value: "", disabled: !0, children: f.duration ? ot(f.duration) : "None" }),
              ct.map((n) => /* @__PURE__ */ e.jsx("option", { value: n, children: n.replace("h30m", "h 30m") }, n))
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(We, { size: 13, color: "currentColor" }),
          "Priority"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: L.priority, className: "td-prop-value", onClick: () => C("priority"), children: [
          /* @__PURE__ */ e.jsx(We, { size: 13, color: f.priority === 1 ? "var(--td-muted)" : ke[f.priority] }),
          "Priority ",
          5 - f.priority
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(ve, { size: 13 }),
          "Labels"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-prop-labels", children: [
          f.labels.map((n) => {
            const D = t.labels.find((I) => I.name === n);
            return /* @__PURE__ */ e.jsxs("span", { className: "td-label-pill", style: { "--label": K(D?.color) }, children: [
              n,
              /* @__PURE__ */ e.jsx("button", { title: `Remove ${n}`, onClick: () => void F({ labels: f.labels.filter((I) => I !== n) }), children: /* @__PURE__ */ e.jsx(re, { size: 10 }) })
            ] }, n);
          }),
          /* @__PURE__ */ e.jsx("button", { ref: L.labels, className: "td-icon-btn sm", title: "Add label", onClick: () => C("labels"), children: /* @__PURE__ */ e.jsx(me, { size: 12 }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(Pe, { size: 13 }),
          " Sub-tasks ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: _.length || "" })
        ] }),
        _.map((n) => /* @__PURE__ */ e.jsxs("div", { className: `td-subtask${n.completedAt ? " is-done" : ""}`, children: [
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: `td-checkbox sm p${n.priority}`,
              style: { "--prio": ke[n.priority] },
              "aria-label": "Complete sub-task",
              onClick: async () => {
                await r(n), v((D) => D && { ...D, children: D.children.filter((I) => I.id !== n.id) });
              },
              children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
            }
          ),
          /* @__PURE__ */ e.jsx("button", { className: "td-subtask-title", onClick: () => l(n.id), children: ce(n.content, p, n.id) }),
          n.due && /* @__PURE__ */ e.jsx("span", { className: `td-chip td-due tone-${ge(n.due, a)}`, children: Fe(n.due, a) })
        ] }, n.id)),
        /* @__PURE__ */ e.jsxs(
          "form",
          {
            className: "td-inline-add",
            onSubmit: async (n) => {
              n.preventDefault();
              const D = ne.trim();
              if (!(!D || ae)) {
                G(!0);
                try {
                  const I = await h.call("add", { content: D, parentId: f.id, projectId: f.projectId });
                  v((P) => P && { ...P, children: [...P.children, I] }), de(""), m();
                } catch (I) {
                  y(se(I));
                } finally {
                  G(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(me, { size: 13 }),
              /* @__PURE__ */ e.jsx("input", { value: ne, onChange: (n) => de(n.target.value), placeholder: "Add sub-task", onKeyDown: (n) => {
                n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
              } })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(st, { size: 13 }),
          " Comments ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: W.length || "" })
        ] }),
        W.map((n) => /* @__PURE__ */ e.jsxs("div", { className: "td-comment", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-comment-meta", children: new Date(n.postedAt).toLocaleString(void 0, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }),
          n.content && /* @__PURE__ */ e.jsx(Qe, { text: n.content, open: p }),
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
              const D = U.trim();
              if (!(!D || ae)) {
                G(!0);
                try {
                  const I = await h.call("comment", { taskId: f.id, content: D });
                  v((P) => P && { ...P, comments: [...P.comments, I] }), Q("");
                } catch (I) {
                  y(se(I));
                } finally {
                  G(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(
                "textarea",
                {
                  value: U,
                  onChange: (n) => Q(n.target.value),
                  placeholder: "Write a comment",
                  rows: U.includes(`
`) ? 4 : 2,
                  onKeyDown: (n) => {
                    n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), n.currentTarget.form.requestSubmit()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
                  }
                }
              ),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !U.trim() || ae, children: "Comment" })
            ]
          }
        )
      ] })
    ] }),
    j === "due" && /* @__PURE__ */ e.jsx(nt, { anchor: L.due.current, current: f.due?.string, onPick: (n) => void F({ due: n }), onClose: () => C(null) }),
    j === "priority" && /* @__PURE__ */ e.jsx(at, { anchor: L.priority.current, current: f.priority, onPick: (n) => void F({ priority: n }), onClose: () => C(null) }),
    j === "labels" && /* @__PURE__ */ e.jsx(
      $t,
      {
        anchor: L.labels.current,
        labels: t.labels,
        selected: f.labels,
        onChange: (n) => void F({ labels: n }),
        onCreate: x,
        onClose: () => C(null)
      }
    ),
    j === "project" && /* @__PURE__ */ e.jsx(At, { anchor: L.project.current, meta: t, current: { projectId: f.projectId, sectionId: f.sectionId }, onPick: (n) => void Ce(n.projectId, n.sectionId), onClose: () => C(null) })
  ] });
}
function ns(s) {
  if (s.unit === "day") return "";
  const t = Math.floor(s.amount / 60), a = s.amount % 60, c = `${t ? `${t}h` : ""}${a ? `${a}m` : ""}`;
  return ct.includes(c) ? c : "";
}
function as(s) {
  const t = {};
  return s.content !== void 0 && (t.content = s.content), s.description !== void 0 && (t.description = s.description), s.priority !== void 0 && (t.priority = s.priority), s.labels !== void 0 && (t.labels = s.labels), s.deadline !== void 0 && (t.deadline = s.deadline || null), s.due === "" && (t.due = null), t;
}
const is = u.memo(function({
  task: t,
  lookup: a,
  now: c,
  showProject: r,
  focused: l,
  completing: m,
  depth: y = 0,
  childCount: p = 0,
  onToggle: x,
  onOpen: h,
  onPatch: w,
  onFocus: v,
  onOpenUrl: $
}) {
  const [k, A] = u.useState(null), T = u.useRef(null), E = u.useRef(null), g = !!t.completedAt || m, j = ge(t.due, c), C = a.project(t.projectId), o = a.section(t.sectionId);
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: `td-task${l ? " is-focused" : ""}${g ? " is-done" : ""}${m ? " is-completing" : ""}`,
      style: y ? { paddingLeft: 12 + y * 26 } : void 0,
      "data-task-id": t.id,
      role: "listitem",
      "aria-label": t.content,
      onMouseDown: () => v(t),
      onClick: (S) => {
        S.target.closest("button, a, input") || h(t);
      },
      children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox p${t.priority}`,
            style: { "--prio": ke[t.priority] },
            "aria-label": g ? "Reopen task" : "Complete task",
            title: g ? "Reopen" : "Complete",
            onClick: () => x(t),
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-task-title", children: ce(t.content, $, t.id) }),
          t.description && !g && /* @__PURE__ */ e.jsx("div", { className: "td-task-desc", children: t.description.split(`
`)[0] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-task-meta", children: [
            t.due && /* @__PURE__ */ e.jsxs("span", { className: `td-chip td-due tone-${j}`, title: t.due.string, children: [
              t.due.recurring ? /* @__PURE__ */ e.jsx(Ze, { size: 12 }) : /* @__PURE__ */ e.jsx(Me, { size: 12 }),
              Fe(t.due, c)
            ] }),
            t.deadline && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-deadline", title: "Deadline", children: [
              /* @__PURE__ */ e.jsx(et, { size: 12 }),
              Ht(t.deadline, c)
            ] }),
            t.duration && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Duration", children: [
              /* @__PURE__ */ e.jsx(tt, { size: 12 }),
              ot(t.duration)
            ] }),
            p > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Subtasks", children: [
              /* @__PURE__ */ e.jsx(Pe, { size: 12 }),
              p
            ] }),
            t.commentCount > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Comments", children: [
              /* @__PURE__ */ e.jsx(st, { size: 12 }),
              t.commentCount
            ] }),
            t.labels.map((S) => /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-label", style: { color: K(a.label(S)?.color) }, children: [
              /* @__PURE__ */ e.jsx(ve, { size: 12 }),
              S
            ] }, S)),
            t.completedAt && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", children: [
              "Completed ",
              new Date(t.completedAt).toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" })
            ] }),
            r && C && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-project-chip", children: [
              C.isInbox ? /* @__PURE__ */ e.jsx(we, { size: 12 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: K(C.color) } }),
              C.name,
              o ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
                " / ",
                o.name
              ] }) : null
            ] })
          ] })
        ] }),
        !g && /* @__PURE__ */ e.jsxs("div", { className: "td-task-actions", children: [
          /* @__PURE__ */ e.jsx("button", { ref: T, type: "button", className: "td-icon-btn", title: "Schedule (t = today)", onClick: () => A("due"), children: /* @__PURE__ */ e.jsx(Me, {}) }),
          /* @__PURE__ */ e.jsx("button", { ref: E, type: "button", className: "td-icon-btn", title: "Priority (1–4)", onClick: () => A("priority"), children: /* @__PURE__ */ e.jsx(Et, {}) })
        ] }),
        k === "due" && /* @__PURE__ */ e.jsx(nt, { anchor: T.current, current: t.due?.string, onPick: (S) => w(t, { due: S }), onClose: () => A(null) }),
        k === "priority" && /* @__PURE__ */ e.jsx(at, { anchor: E.current, current: t.priority, onPick: (S) => w(t, { priority: S }), onClose: () => A(null) })
      ]
    }
  );
}), ls = 650;
function os() {
  const s = Re(), t = Pt(s), a = Mt(), c = t?.setup?.state === "ready";
  return u.useEffect(() => {
    s.call("status", {}).catch(() => {
    });
  }, [s]), c ? /* @__PURE__ */ e.jsx(rs, { revision: t.revision, defaultView: t.settings.defaultView, now: a, user: t.setup.user }) : /* @__PURE__ */ e.jsx("div", { className: "td-root", children: /* @__PURE__ */ e.jsx(qt, { setup: t?.setup ?? null, onRetry: async () => {
    await s.call("status", { refresh: !0 });
  } }) });
}
function rs({ revision: s, defaultView: t, now: a, user: c }) {
  const r = Re(), [l, m, y] = Ve(r, "todoist.ui.view", { kind: t }), [p, x] = Ve(r, "todoist.ui.sidebar", !0), [h, w] = u.useState(null), [v, $] = u.useState([]), [k, A] = u.useState(null), [T, E] = u.useState(!1), [g, j] = u.useState(!0), [C, o] = u.useState(!1), [S, U] = u.useState(null), [Q, ne] = u.useState({ today: null, inbox: null }), [de, ae] = u.useState(/* @__PURE__ */ new Set()), [G, L] = u.useState(null), [Y, F] = u.useState(null), [Ce, f] = u.useState([]), [_, W] = u.useState(!1), [ie, le] = u.useState(""), [oe, Se] = u.useState(() => window.innerWidth), [J, n] = u.useState(!1), [D, I] = u.useState(!1), [P, ue] = u.useState(null), Ke = u.useRef(null), De = u.useRef(null), Ie = u.useRef(null), he = u.useRef(0), X = oe < 640, dt = oe < 820, Te = X ? J : p;
  u.useEffect(() => {
    const i = () => Se(window.innerWidth);
    return window.addEventListener("resize", i), () => window.removeEventListener("resize", i);
  }, []);
  const V = u.useCallback((i, d = {}) => {
    const N = Date.now() + Math.random();
    f((b) => [...b.slice(-2), { id: N, message: i, ...d }]), setTimeout(() => f((b) => b.filter((R) => R.id !== N)), d.action ? 6e3 : d.tone === "error" ? 7e3 : 3e3);
  }, []), M = u.useCallback((i) => {
    const d = Yt(i);
    d === "NO_TOKEN" || d === "TD_NOT_FOUND" || V(se(i), { tone: "error" });
  }, [V]), $e = u.useCallback((i) => {
    r.call("openUrl", { url: i }).catch(M);
  }, [r, M]);
  u.useEffect(() => {
    let i = !0;
    return r.call("meta", {}).then((d) => {
      i && w(d);
    }, M), () => {
      i = !1;
    };
  }, [r, s, M]);
  const B = u.useCallback(async (i, d = !1, N = null) => {
    const b = ++he.current;
    d ? o(!0) : j(!0);
    try {
      const R = await r.call("list", { ...i, cursor: N });
      if (b !== he.current) return;
      if ($((O) => d ? [...O, ...R.tasks.filter((ee) => !O.some((q) => q.id === ee.id))] : R.tasks), A(R.nextCursor), E(R.truncated), U(null), !d && (i.kind === "today" || i.kind === "inbox")) {
        const O = R.tasks.filter((ee) => !ee.completedAt).length;
        ne((ee) => ({ ...ee, [i.kind]: R.nextCursor ? null : O }));
      }
    } catch (R) {
      if (b !== he.current) return;
      U(se(R)), M(R);
    } finally {
      b === he.current && (j(!1), o(!1));
    }
  }, [r, M]), ut = JSON.stringify(l);
  u.useEffect(() => {
    y && B(l);
  }, [ut, s, y, B]);
  const _e = u.useMemo(() => {
    const i = new Map(h?.projects.map((b) => [b.id, b])), d = new Map(h?.sections.map((b) => [b.id, b])), N = new Map(h?.labels.map((b) => [b.name, b]));
    return {
      project: (b) => i.get(b),
      section: (b) => b ? d.get(b) : void 0,
      label: (b) => N.get(b)
    };
  }, [h]), mt = h?.projects.find((i) => i.isInbox), xe = l.kind === "project" ? l.id : l.kind === "inbox" ? mt?.id : void 0, Z = xe ? _e.project(xe) : void 0, { groups: fe, depths: pt, childCounts: ht } = u.useMemo(() => ds(l, v, a, h, xe), [l, v, a, h, xe]), z = u.useMemo(() => fe.flatMap((i) => i.tasks), [fe]), je = u.useCallback(async (i) => {
    if (i.completedAt) {
      try {
        await r.call("uncomplete", { id: i.id }), V("Task reopened");
      } catch (d) {
        M(d);
      }
      return;
    }
    ae((d) => new Set(d).add(i.id));
    try {
      await r.call("complete", { id: i.id }), V(i.due?.recurring ? `Completed — next: ${i.due.string}` : "Task completed", {
        action: i.due?.recurring ? void 0 : {
          label: "Undo",
          run: () => {
            r.call("uncomplete", { id: i.id }).then(() => V("Task reopened"), M);
          }
        }
      }), setTimeout(() => ae((d) => {
        const N = new Set(d);
        return N.delete(i.id), N;
      }), ls);
    } catch (d) {
      ae((N) => {
        const b = new Set(N);
        return b.delete(i.id), b;
      }), M(d);
    }
  }, [r, V, M]), be = u.useCallback(async (i, d) => {
    d.priority !== void 0 && $((N) => N.map((b) => b.id === i.id ? { ...b, priority: d.priority } : b));
    try {
      await r.call("update", { id: i.id, ...d });
    } catch (N) {
      M(N), B(l);
    }
  }, [r, M, B, l]), xt = u.useCallback(async (i) => {
    const d = Ge(i);
    let N = i;
    l.kind === "today" && !d.some((b) => b.kind === "date") && (N = `${i} today`), l.kind === "label" && l.query && !d.some((b) => b.kind === "label" && b.text.slice(1).replace(/"/g, "") === l.query) && (N = `${N} @${/\s/.test(l.query) ? `"${l.query}"` : l.query}`);
    try {
      const b = await r.call("quickAdd", { text: N });
      return l.kind === "project" && l.id && b.projectId !== l.id && !d.some((R) => R.kind === "project") && await r.call("move", { id: b.id, projectId: l.id }), V(`Added “${b.content}”`, { action: { label: "Open", run: () => F(b.id) } }), !0;
    } catch (b) {
      return M(b), !1;
    }
  }, [r, l, V, M]), Be = u.useCallback(async (i) => {
    try {
      await r.call("createLabel", { name: i });
    } catch (d) {
      throw M(d), d;
    }
  }, [r, M]), Ue = u.useCallback((i) => {
    W(!1), n(!1), L(null), rt(i, l) ? B(i) : ($([]), A(null), m(i)), Ie.current?.scrollTo({ top: 0 });
  }, [l, m, B]);
  u.useEffect(() => {
    if (!_) return;
    const i = ie.trim();
    if (!i) return;
    const d = setTimeout(() => {
      $([]), m({ kind: "search", query: i });
    }, 350);
    return () => clearTimeout(d);
  }, [ie, _]), u.useEffect(() => {
    const i = (d) => {
      const b = d.target.closest('input, textarea, select, [contenteditable="true"]');
      if (d.key === "Escape") {
        if (D) {
          d.preventDefault(), I(!1);
          return;
        }
        if (Y) {
          d.preventDefault(), F(null);
          return;
        }
        if (_) {
          d.preventDefault(), W(!1), le("");
          return;
        }
        if (J) {
          d.preventDefault(), n(!1);
          return;
        }
        return;
      }
      if (b || d.metaKey || d.ctrlKey || d.altKey) return;
      const R = z.findIndex((te) => te.id === G), O = R >= 0 ? z[R] : null, ee = (te) => {
        if (!z.length) return;
        const Ae = z[Math.max(0, Math.min(z.length - 1, (R < 0 ? te > 0 ? -1 : z.length : R) + te))];
        L(Ae.id), Ie.current?.querySelector(`[data-task-id="${CSS.escape(Ae.id)}"]`)?.scrollIntoView({ block: "nearest" }), Y && F(Ae.id);
      }, q = d.key;
      q === "j" || q === "ArrowDown" ? (d.preventDefault(), ee(1)) : q === "k" || q === "ArrowUp" ? (d.preventDefault(), ee(-1)) : (q === "Enter" || q === "o") && O ? (d.preventDefault(), F(O.id)) : (q === "x" || q === " ") && O ? (d.preventDefault(), je(O)) : /^[1-4]$/.test(q) && O ? (d.preventDefault(), be(O, { priority: 5 - Number(q) })) : q === "t" && O ? (d.preventDefault(), be(O, { due: "today" })) : q === "q" || q === "a" ? (d.preventDefault(), Ke.current?.focus()) : q === "/" ? (d.preventDefault(), W(!0), requestAnimationFrame(() => De.current?.focus())) : q === "r" ? (d.preventDefault(), B(l), r.call("meta", {}).then(w, () => {
      })) : q === "[" ? (d.preventDefault(), X ? n((te) => !te) : x(!p)) : q === "?" && (d.preventDefault(), I((te) => !te));
    };
    return window.addEventListener("keydown", i), () => window.removeEventListener("keydown", i);
  }, [z, G, Y, _, J, D, je, be, B, l, r, X, p, x]);
  const ft = cs(l, h), jt = z.filter((i) => !i.completedAt && !de.has(i.id)).length, bt = l.kind === "today" ? "Due today unless you type a date" : l.kind === "project" && Z ? `Adds to #${Z.name}` : l.kind === "label" ? `Tagged @${l.query}` : l.kind === "inbox" ? "Adds to Inbox" : null, yt = !c?.readOnly && l.kind !== "completed";
  return /* @__PURE__ */ e.jsxs("div", { className: `td-root${X ? " is-narrow" : ""}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: `td-layout${Te && !X ? " has-sidebar" : ""}`, children: [
      Te && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        X && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => n(!1) }),
        /* @__PURE__ */ e.jsx(
          Zt,
          {
            meta: h,
            current: l,
            counts: Q,
            user: c,
            onSelect: Ue,
            onSearch: () => {
              W(!0), n(!1), requestAnimationFrame(() => De.current?.focus());
            },
            onCreateProject: async (i, d) => {
              try {
                const N = await r.call("createProject", { name: i, color: d });
                Ue({ kind: "project", id: N.id });
              } catch (N) {
                M(N);
              }
            },
            onCreateLabel: async (i) => {
              try {
                await Be(i);
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
          /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: Te ? "Hide sidebar ([)" : "Show sidebar ([)", onClick: () => X ? n((i) => !i) : x(!p), children: /* @__PURE__ */ e.jsx(Ft, {}) }),
          _ ? /* @__PURE__ */ e.jsxs("div", { className: "td-search", children: [
            /* @__PURE__ */ e.jsx(Je, {}),
            /* @__PURE__ */ e.jsx(
              "input",
              {
                ref: De,
                value: ie,
                onChange: (i) => le(i.target.value),
                placeholder: "Search tasks",
                onKeyDown: (i) => {
                  i.key === "Escape" && (i.preventDefault(), i.stopPropagation(), W(!1), le("")), i.key === "ArrowDown" && (i.preventDefault(), i.target.blur(), z[0] && L(z[0].id));
                }
              }
            ),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", onClick: () => {
              W(!1), le("");
            }, title: "Close search", children: /* @__PURE__ */ e.jsx(re, { size: 12 }) })
          ] }) : /* @__PURE__ */ e.jsxs("div", { className: "td-title", children: [
            l.kind === "project" && Z && /* @__PURE__ */ e.jsx("span", { className: "td-dot lg", style: { background: K(Z.color) } }),
            l.kind === "inbox" && /* @__PURE__ */ e.jsx(we, {}),
            /* @__PURE__ */ e.jsx("h1", { children: ft }),
            !g && l.kind !== "completed" && /* @__PURE__ */ e.jsxs("span", { className: "td-title-count", children: [
              jt,
              k ? "+" : ""
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-header-tools", children: [
            Z && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open project in Todoist", onClick: () => $e(Z.url), children: /* @__PURE__ */ e.jsx(Xe, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Keyboard shortcuts (?)", onClick: () => I(!0), children: /* @__PURE__ */ e.jsx(Rt, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: `td-icon-btn${g ? " is-spinning" : ""}`, title: "Refresh (r)", onClick: () => {
              B(l), r.call("meta", {}).then(w, () => {
              });
            }, children: /* @__PURE__ */ e.jsx(Lt, {}) })
          ] })
        ] }),
        yt && /* @__PURE__ */ e.jsx("div", { className: "td-add-row", children: /* @__PURE__ */ e.jsx(
          Xt,
          {
            ref: Ke,
            placeholder: X ? "Add a task" : 'Add a task — "Review PR tomorrow 3pm p1 #Work @review"',
            contextLabel: bt,
            onSubmit: xt
          }
        ) }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-list", ref: Ie, role: "list", children: [
          g && !v.length ? /* @__PURE__ */ e.jsx(ms, {}) : S && !v.length ? /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
            /* @__PURE__ */ e.jsx("p", { children: "Couldn’t load this list." }),
            /* @__PURE__ */ e.jsx("p", { className: "td-dim td-small", children: S }),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void B(l), children: "Try again" })
          ] }) : z.length ? fe.map((i) => /* @__PURE__ */ e.jsxs("section", { className: "td-group", children: [
            (fe.length > 1 || i.subtitle || i.key !== "all") && i.title && /* @__PURE__ */ e.jsxs("h2", { className: `td-group-title${i.tone ? ` tone-${i.tone}` : ""}`, children: [
              i.title,
              i.subtitle && /* @__PURE__ */ e.jsx("span", { className: "td-group-sub", children: i.subtitle }),
              /* @__PURE__ */ e.jsx("span", { className: "td-group-count", children: i.tasks.length })
            ] }),
            i.tasks.map((d) => /* @__PURE__ */ e.jsx(
              is,
              {
                task: d,
                lookup: _e,
                now: a,
                showProject: l.kind !== "project" && l.kind !== "inbox",
                focused: G === d.id || Y === d.id,
                completing: de.has(d.id),
                depth: pt.get(d.id) ?? 0,
                childCount: ht.get(d.id) ?? 0,
                onToggle: je,
                onOpen: (N) => {
                  L(N.id), F(N.id);
                },
                onPatch: be,
                onFocus: (N) => L(N.id),
                onOpenUrl: $e
              },
              d.id
            ))
          ] }, i.key)) : /* @__PURE__ */ e.jsx(us, { view: l }),
          (k || T) && z.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "td-more", children: k ? /* @__PURE__ */ e.jsxs("button", { className: "td-btn", disabled: C, onClick: () => void B(l, !0, k), children: [
            C ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
            " Load more"
          ] }) : /* @__PURE__ */ e.jsxs("span", { className: "td-dim td-small", children: [
            "Showing the first ",
            z.length,
            " tasks. Narrow the list with a project, label or search."
          ] }) }),
          l.kind === "project" && Z && !c?.readOnly && !g && (P !== null ? /* @__PURE__ */ e.jsxs(
            "form",
            {
              className: "td-section-add",
              onSubmit: async (i) => {
                if (i.preventDefault(), !!P.trim())
                  try {
                    await r.call("createSection", { projectId: Z.id, name: P.trim() }), ue(null);
                  } catch (d) {
                    M(d);
                  }
              },
              children: [
                /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: P, onChange: (i) => ue(i.target.value), placeholder: "Section name", onKeyDown: (i) => {
                  i.key === "Escape" && (i.preventDefault(), i.stopPropagation(), ue(null));
                } }),
                /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !P.trim(), children: "Add section" }),
                /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => ue(null), children: "Cancel" })
              ]
            }
          ) : /* @__PURE__ */ e.jsxs("button", { className: "td-add-section", onClick: () => ue(""), children: [
            /* @__PURE__ */ e.jsx(me, { size: 12 }),
            " Add section"
          ] }))
        ] })
      ] }),
      Y && h && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        dt && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => F(null) }),
        /* @__PURE__ */ e.jsx(
          ss,
          {
            taskId: Y,
            meta: h,
            now: a,
            onClose: () => F(null),
            onToggle: je,
            onOpenTask: (i) => F(i),
            onChanged: () => {
            },
            onError: (i) => V(i, { tone: "error" }),
            onOpenUrl: $e,
            onCreateLabel: Be
          },
          Y
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "td-toasts", "aria-live": "polite", children: Ce.map((i) => /* @__PURE__ */ e.jsxs("div", { className: `td-toast${i.tone === "error" ? " is-error" : ""}`, children: [
      /* @__PURE__ */ e.jsx("span", { children: i.message }),
      i.action && /* @__PURE__ */ e.jsx("button", { onClick: () => {
        i.action.run(), f((d) => d.filter((N) => N.id !== i.id));
      }, children: i.action.label })
    ] }, i.id)) }),
    D && /* @__PURE__ */ e.jsx(ps, { onClose: () => I(!1) })
  ] });
}
function cs(s, t) {
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
function ds(s, t, a, c, r) {
  const l = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), y = new Set(t.map((x) => x.id));
  for (const x of t) x.parentId && y.has(x.parentId) && m.set(x.parentId, (m.get(x.parentId) ?? 0) + 1);
  if (s.kind === "today") return { groups: Qt(t, a), depths: l, childCounts: m };
  if (s.kind === "upcoming") return { groups: Gt(t, a), depths: l, childCounts: m };
  if (s.kind === "completed") return { groups: Jt(t, a), depths: l, childCounts: m };
  if ((s.kind === "project" || s.kind === "inbox") && r) {
    const x = (c?.sections ?? []).filter((k) => k.projectId === r), h = /* @__PURE__ */ new Map();
    for (const k of t) {
      const A = k.sectionId && x.some((E) => E.id === k.sectionId) ? k.sectionId : null, T = h.get(A) ?? [];
      T.push(k), h.set(A, T);
    }
    const w = (k) => {
      const A = new Set(k.map((j) => j.id)), T = k.filter((j) => !j.parentId || !A.has(j.parentId)).sort((j, C) => j.order - C.order), E = [], g = (j, C) => {
        E.push(j), l.set(j.id, C), k.filter((o) => o.parentId === j.id).sort((o, S) => o.order - S.order).forEach((o) => g(o, Math.min(C + 1, 4)));
      };
      return T.forEach((j) => g(j, 0)), E;
    }, v = [], $ = h.get(null) ?? [];
    ($.length || !x.length) && v.push({ key: "all", title: "", tasks: w($) });
    for (const k of x)
      v.push({ key: k.id, title: k.name, tasks: w(h.get(k.id) ?? []) });
    return { groups: v.filter((k) => k.tasks.length || k.key !== "all"), depths: l, childCounts: m };
  }
  return { groups: [{ key: "all", title: "", tasks: [...t].sort((x, h) => h.priority - x.priority || (x.due?.date ?? "9999").localeCompare(h.due?.date ?? "9999") || x.order - h.order) }], depths: l, childCounts: m };
}
function us({ view: s }) {
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
function ms() {
  return /* @__PURE__ */ e.jsx("div", { className: "td-skeleton-list", "aria-busy": "true", children: [78, 52, 64, 40, 70].map((s, t) => /* @__PURE__ */ e.jsxs("div", { className: "td-task is-skeleton", children: [
    /* @__PURE__ */ e.jsx("span", { className: "td-checkbox" }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${s}%` } }),
      /* @__PURE__ */ e.jsx("span", { className: "td-skel sm", style: { width: `${s / 2}%` } })
    ] })
  ] }, t)) });
}
function ps({ onClose: s }) {
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
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: s, children: /* @__PURE__ */ e.jsx(re, {}) })
    ] }),
    /* @__PURE__ */ e.jsx("dl", { children: t.map(([a, c]) => /* @__PURE__ */ e.jsxs("div", { children: [
      /* @__PURE__ */ e.jsx("dt", { children: a.split("  ").map((r) => /* @__PURE__ */ e.jsx("kbd", { children: r }, r)) }),
      /* @__PURE__ */ e.jsx("dd", { children: c })
    ] }, a)) })
  ] }) });
}
const fs = Wt({
  mount(s, t) {
    zt(Ut);
    const a = Ot(), c = Kt(s);
    return c.render(
      /* @__PURE__ */ e.jsx(_t.Provider, { value: Bt(t), children: /* @__PURE__ */ e.jsx(os, {}) })
    ), () => {
      a(), queueMicrotask(() => c.unmount());
    };
  }
});
export {
  fs as default
};

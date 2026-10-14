import { r as d, t as St, c as Dt, j as e, n as ve, b as Y, L as Ae, o as et, q as it, I as Me, T as It, v as Tt, w as $t, x as Et, y as At, U as Rt, z as Pt, u as We, E as fe, M as Mt, G as rt, H as Ft, J as _e, P as Ee, C as Ue, R as lt, K as ot, N as ct, F as tt, O as dt, D as ut, d as mt, e as Lt, f as qt, Q as Ot, a as zt, V as Kt, S as _t, W as Ut, g as Yt, p as Bt, h as Wt, X as Ht, Y as Vt, Z as Qt, i as Gt, k as Jt, l as Xt, B as Zt, m as es, s as ts } from "./shared-SetupScreen.js";
import { t as G, b as ss, d as ns } from "./shared-types.js";
const He = 864e5;
function ae(t) {
  return Math.floor(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / He);
}
function Ve(t) {
  const [s, a, c] = t.slice(0, 10).split("-").map(Number);
  return new Date(s, (a || 1) - 1, c || 1);
}
function ge(t) {
  return t.datetime ? ae(new Date(t.datetime)) : ae(Ve(t.date));
}
function Re(t, s) {
  if (!t) return "none";
  const a = ae(s), c = ge(t);
  return c < a || c === a && t.datetime && new Date(t.datetime).getTime() < s.getTime() ? "overdue" : c === a ? "today" : c === a + 1 ? "tomorrow" : c < a + 7 ? "week" : "future";
}
const as = new Intl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit" }), pt = new Intl.DateTimeFormat(void 0, { weekday: "long" }), Ye = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric" }), ht = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", year: "numeric" }), Qe = new Intl.DateTimeFormat(void 0, { weekday: "short", month: "short", day: "numeric" });
function Be(t, s) {
  const a = ae(s), c = ge(t), l = t.datetime ? new Date(t.datetime) : Ve(t.date);
  let o;
  return c === a ? o = "Today" : c === a + 1 ? o = "Tomorrow" : c === a - 1 ? o = "Yesterday" : c > a && c < a + 7 ? o = pt.format(l) : l.getFullYear() === s.getFullYear() ? o = Ye.format(l) : o = ht.format(l), t.datetime ? `${o} ${as.format(l)}` : o;
}
function is(t, s) {
  const a = Ve(t), c = ae(a) - ae(s);
  return c === 0 ? "Today" : c === 1 ? "Tomorrow" : c < 0 ? `${Ye.format(a)} (passed)` : a.getFullYear() === s.getFullYear() ? Ye.format(a) : ht.format(a);
}
function ft(t) {
  if (t.unit === "day") return t.amount === 1 ? "1 day" : `${t.amount} days`;
  const s = Math.floor(t.amount / 60), a = t.amount % 60;
  return s && a ? `${s}h ${a}m` : s ? `${s}h` : `${a}m`;
}
function Pe(t, s) {
  const a = t.due?.datetime ? new Date(t.due.datetime).getTime() : Number.POSITIVE_INFINITY, c = s.due?.datetime ? new Date(s.due.datetime).getTime() : Number.POSITIVE_INFINITY;
  return a !== c ? a - c : t.priority !== s.priority ? s.priority - t.priority : t.order - s.order;
}
function rs(t, s) {
  const a = [], c = [];
  for (const o of t) (Re(o.due, s) === "overdue" ? a : c).push(o);
  a.sort((o, m) => (o.due && m.due ? ge(o.due) - ge(m.due) : 0) || Pe(o, m)), c.sort(Pe);
  const l = [];
  return a.length && l.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: a }), l.push({ key: "today", title: "Today", subtitle: Qe.format(s), tone: "today", tasks: c }), l;
}
function ls(t, s) {
  const a = ae(s), c = /* @__PURE__ */ new Map(), l = [], o = [];
  for (const x of t) {
    if (!x.due) {
      o.push(x);
      continue;
    }
    const p = ge(x.due);
    if (p < a) {
      l.push(x);
      continue;
    }
    const h = c.get(p) ?? [];
    h.push(x), c.set(p, h);
  }
  const m = [];
  l.length && m.push({ key: "overdue", title: "Overdue", tone: "overdue", tasks: l.sort(Pe) });
  for (const x of [...c.keys()].sort((p, h) => p - h)) {
    const p = new Date(x * He), h = new Date(p.getUTCFullYear(), p.getUTCMonth(), p.getUTCDate()), v = x === a ? "Today" : x === a + 1 ? "Tomorrow" : pt.format(h);
    m.push({
      key: `day-${x}`,
      title: v,
      subtitle: Qe.format(h),
      tone: x === a ? "today" : x === a + 1 ? "tomorrow" : "future",
      tasks: c.get(x).sort(Pe)
    });
  }
  return o.length && m.push({ key: "undated", title: "No date", tasks: o }), m;
}
function os(t, s) {
  const a = ae(s), c = /* @__PURE__ */ new Map();
  for (const l of t) {
    const o = l.completedAt ? ae(new Date(l.completedAt)) : a, m = c.get(o) ?? [];
    m.push(l), c.set(o, m);
  }
  return [...c.keys()].sort((l, o) => o - l).map((l) => {
    const o = new Date(l * He), m = new Date(o.getUTCFullYear(), o.getUTCMonth(), o.getUTCDate());
    return {
      key: `done-${l}`,
      title: l === a ? "Today" : l === a - 1 ? "Yesterday" : Qe.format(m),
      tasks: c.get(l).sort((x, p) => (p.completedAt ?? "").localeCompare(x.completedAt ?? ""))
    };
  });
}
function cs(t) {
  return document.addEventListener("keydown", t), () => document.removeEventListener("keydown", t);
}
function ds(t) {
  return t instanceof Element && !!t.closest('button, a[href], summary, select, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="option"], [role="checkbox"], [role="tab"], [role="switch"]');
}
const us = d.forwardRef(function({ placeholder: s, contextLabel: a, disabled: c, onSubmit: l, autoFocus: o, large: m }, x) {
  const [p, h] = d.useState(""), [v, I] = d.useState(0), g = v > 0, N = d.useRef(null), y = d.useRef(null);
  d.useImperativeHandle(x, () => ({ focus: () => N.current?.focus() }), []);
  const E = () => {
    y.current && N.current && (y.current.scrollLeft = N.current.scrollLeft);
  }, M = async () => {
    const b = p.trim();
    if (b) {
      h(""), I((i) => i + 1);
      try {
        await l(b) || h((i) => i || b);
      } finally {
        I((i) => i - 1), requestAnimationFrame(() => N.current?.focus());
      }
    }
  }, F = St(p), C = p ? Dt(p) : "", w = F.some((b) => b.kind !== "text");
  return /* @__PURE__ */ e.jsxs("div", { className: `td-quickadd${m ? " is-large" : ""}${g ? " is-busy" : ""}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-field", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-quickadd-plus", children: /* @__PURE__ */ e.jsx(ve, {}) }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-stack", children: [
        /* @__PURE__ */ e.jsxs("div", { ref: y, className: "td-quickadd-mirror", "aria-hidden": "true", children: [
          F.map((b, i) => /* @__PURE__ */ e.jsx("span", { className: `tok-${b.kind}`, children: b.text }, i)),
          "​"
        ] }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            ref: N,
            className: "td-quickadd-input",
            value: p,
            disabled: c,
            autoFocus: o,
            spellCheck: !1,
            placeholder: s,
            "aria-label": "Quick add task",
            onChange: (b) => {
              h(b.target.value), requestAnimationFrame(E);
            },
            onScroll: E,
            onKeyDown: (b) => {
              b.key === "Enter" && !b.nativeEvent.isComposing ? (b.preventDefault(), M()) : b.key === "Escape" && p ? (b.preventDefault(), b.stopPropagation(), h("")) : b.key === "Escape" && (b.preventDefault(), b.stopPropagation(), N.current?.blur());
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-primary td-quickadd-submit", disabled: !p.trim() || c, onClick: () => void M(), children: g && !p.trim() ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : "Add" })
    ] }),
    (w || a) && /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-hint", children: [
      w && C ? /* @__PURE__ */ e.jsxs("span", { children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: C }),
        "”"
      ] }) : null,
      a ? /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: a }) : null
    ] })
  ] });
});
function xt(t, s) {
  return t.kind === s.kind && (t.id ?? null) === (s.id ?? null) && (t.query ?? null) === (s.query ?? null);
}
function ms({ meta: t, current: s, counts: a, user: c, onSelect: l, onSearch: o, onCreateProject: m, onCreateLabel: x, onSignOut: p }) {
  const [h, v] = d.useState({ favorites: !0, projects: !0, labels: !1, filters: !1 }), [I, g] = d.useState(null), [N, y] = d.useState(""), [E, M] = d.useState("charcoal"), F = t?.projects.find((i) => i.isInbox), C = (i, T, q, B, ee) => /* @__PURE__ */ e.jsxs(
    "button",
    {
      className: `td-nav-item${xt(s, i) ? " is-active" : ""}`,
      onClick: () => l(i),
      title: q,
      children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", style: ee ? { color: ee } : void 0, children: T }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: q }),
        B ? /* @__PURE__ */ e.jsx("span", { className: "td-nav-count", children: B }) : null
      ]
    },
    `${i.kind}:${i.id ?? i.query ?? ""}`
  ), w = [
    ...t?.projects.filter((i) => i.isFavorite && !i.isInbox).map((i) => C({ kind: "project", id: i.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: Y(i.color) } }), i.name)) ?? [],
    ...t?.labels.filter((i) => i.isFavorite).map((i) => C({ kind: "label", query: i.name }, /* @__PURE__ */ e.jsx(Ae, {}), i.name, null, Y(i.color))) ?? [],
    ...t?.filters.filter((i) => i.isFavorite).map((i) => C({ kind: "filter", id: i.id, query: i.query }, /* @__PURE__ */ e.jsx(et, {}), i.name, null, Y(i.color))) ?? []
  ], b = async (i) => {
    i.preventDefault();
    const T = N.trim();
    !T || !(I === "project" ? await m(T, E) : I === "label" && await x(T)) || (y(""), g(null));
  };
  return /* @__PURE__ */ e.jsxs("nav", { className: "td-sidebar", "aria-label": "Todoist navigation", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-item", onClick: o, title: "Search (/)", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", children: /* @__PURE__ */ e.jsx(it, {}) }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: "Search" }),
        /* @__PURE__ */ e.jsx("kbd", { children: "/" })
      ] }),
      C({ kind: "inbox" }, /* @__PURE__ */ e.jsx(Me, {}), "Inbox", a.inbox, "#246fe0"),
      C({ kind: "today" }, /* @__PURE__ */ e.jsx(It, {}), "Today", a.today, "#058527"),
      C({ kind: "upcoming" }, /* @__PURE__ */ e.jsx(Rt, {}), "Upcoming", null, "#692fc2"),
      C({ kind: "completed" }, /* @__PURE__ */ e.jsx(Pt, {}), "Completed", null, "#eb8909")
    ] }),
    w.length > 0 && /* @__PURE__ */ e.jsx($e, { title: "Favorites", open: h.favorites, onToggle: () => v((i) => ({ ...i, favorites: !i.favorites })), children: w }),
    /* @__PURE__ */ e.jsxs(
      $e,
      {
        title: "My Projects",
        open: h.projects,
        onToggle: () => v((i) => ({ ...i, projects: !i.projects })),
        onAdd: () => {
          g("project"), y(""), v((i) => ({ ...i, projects: !0 }));
        },
        children: [
          !t && /* @__PURE__ */ e.jsx(ps, {}),
          t && Tt(t.projects).filter(({ project: i }) => i.id !== F?.id).map(({ project: i, depth: T }) => /* @__PURE__ */ e.jsx("div", { style: { paddingLeft: T * 12 }, children: C({ kind: "project", id: i.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: Y(i.color) } }), i.name) }, i.id)),
          I === "project" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (i) => void b(i), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: N, onChange: (i) => y(i.target.value), placeholder: "Project name", onKeyDown: (i) => {
              i.key === "Escape" && (i.preventDefault(), i.stopPropagation(), g(null));
            } }),
            /* @__PURE__ */ e.jsx("div", { className: "td-swatches", children: $t.map((i) => /* @__PURE__ */ e.jsx("button", { type: "button", title: i.replace("_", " "), className: `td-swatch${i === E ? " is-on" : ""}`, style: { background: Y(i) }, onClick: () => M(i) }, i)) }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => g(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !N.trim(), children: "Add project" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e.jsxs(
      $e,
      {
        title: "Labels",
        open: h.labels,
        onToggle: () => v((i) => ({ ...i, labels: !i.labels })),
        onAdd: () => {
          g("label"), y(""), v((i) => ({ ...i, labels: !0 }));
        },
        children: [
          t?.labels.map((i) => C({ kind: "label", query: i.name }, /* @__PURE__ */ e.jsx(Ae, {}), i.name, null, Y(i.color))),
          t && !t.labels.length && I !== "label" && /* @__PURE__ */ e.jsx("div", { className: "td-nav-empty", children: "No labels" }),
          I === "label" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (i) => void b(i), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: N, onChange: (i) => y(i.target.value), placeholder: "Label name", onKeyDown: (i) => {
              i.key === "Escape" && (i.preventDefault(), i.stopPropagation(), g(null));
            } }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => g(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !N.trim(), children: "Add label" })
            ] })
          ] })
        ]
      }
    ),
    t && t.filters.length > 0 && /* @__PURE__ */ e.jsx($e, { title: "Filters", open: h.filters, onToggle: () => v((i) => ({ ...i, filters: !i.filters })), children: t.filters.map((i) => C({ kind: "filter", id: i.id, query: i.query }, /* @__PURE__ */ e.jsx(et, {}), i.name, null, Y(i.color))) }),
    c && /* @__PURE__ */ e.jsxs("div", { className: "td-account", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-avatar", children: (c.fullName || c.email || "?").slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ e.jsxs("span", { className: "td-account-text", children: [
        /* @__PURE__ */ e.jsx("span", { children: c.fullName || c.email }),
        c.readOnly && /* @__PURE__ */ e.jsx("span", { className: "td-dim td-small", children: "Read-only" })
      ] }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Sign out of td", onClick: p, children: /* @__PURE__ */ e.jsx(Et, { size: 13 }) })
    ] })
  ] });
}
function $e({ title: t, open: s, onToggle: a, onAdd: c, children: l }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-heading", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-heading-btn", onClick: a, "aria-expanded": s, children: [
        /* @__PURE__ */ e.jsx(At, { size: 12, className: s ? "" : "is-collapsed" }),
        t
      ] }),
      c && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: `Add ${t.toLowerCase().replace("my ", "").replace(/s$/, "")}`, onClick: c, children: /* @__PURE__ */ e.jsx(ve, { size: 12 }) })
    ] }),
    s && l
  ] });
}
function ps() {
  return /* @__PURE__ */ e.jsx(e.Fragment, { children: [70, 55, 80].map((t) => /* @__PURE__ */ e.jsx("div", { className: "td-nav-item", children: /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${t}%` } }) }, t)) });
}
const Ke = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"]))/g;
function xe(t, s, a = "i") {
  const c = [];
  let l = 0, o = 0;
  Ke.lastIndex = 0;
  for (let m = Ke.exec(t); m; m = Ke.exec(t)) {
    m.index > l && c.push(t.slice(l, m.index));
    const x = `${a}${o++}`;
    m[2] || m[3] ? c.push(/* @__PURE__ */ e.jsx("strong", { children: m[2] ?? m[3] }, x)) : m[4] || m[5] ? c.push(/* @__PURE__ */ e.jsx("em", { children: m[4] ?? m[5] }, x)) : m[6] ? c.push(/* @__PURE__ */ e.jsx("code", { children: m[6] }, x)) : m[7] && m[8] ? c.push(/* @__PURE__ */ e.jsx(st, { url: m[8], open: s, children: m[7] }, x)) : m[9] && c.push(/* @__PURE__ */ e.jsx(st, { url: m[9], open: s, children: hs(m[9]) }, x)), l = m.index + m[0].length;
  }
  return l < t.length && c.push(t.slice(l)), c;
}
function hs(t) {
  try {
    const s = new URL(t), a = s.pathname.length > 28 ? `${s.pathname.slice(0, 26)}…` : s.pathname;
    return `${s.hostname.replace(/^www\./, "")}${a === "/" ? "" : a}`;
  } catch {
    return t;
  }
}
function st({ url: t, open: s, children: a }) {
  return /* @__PURE__ */ e.jsx(
    "a",
    {
      className: "td-link",
      href: t,
      title: t,
      onClick: (c) => {
        c.preventDefault(), c.stopPropagation(), s(t);
      },
      children: a
    }
  );
}
function nt({ text: t, open: s }) {
  const a = t.replace(/\r\n/g, `
`).split(`
`), c = [];
  let l = 0, o = 0;
  for (; l < a.length; ) {
    const m = a[l];
    if (m.startsWith("```")) {
      const p = [];
      for (l++; l < a.length && !a[l].startsWith("```"); ) p.push(a[l++]);
      l++, c.push(/* @__PURE__ */ e.jsx("pre", { className: "td-md-pre", children: /* @__PURE__ */ e.jsx("code", { children: p.join(`
`) }) }, o++));
      continue;
    }
    if (/^\s*[-*]\s+/.test(m)) {
      const p = [];
      for (; l < a.length && /^\s*[-*]\s+/.test(a[l]); ) p.push(a[l++].replace(/^\s*[-*]\s+/, ""));
      c.push(/* @__PURE__ */ e.jsx("ul", { children: p.map((h, v) => /* @__PURE__ */ e.jsx("li", { children: xe(h, s, `l${o}-${v}`) }, v)) }, o++));
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(m)) {
      const p = [];
      for (; l < a.length && /^\s*\d+[.)]\s+/.test(a[l]); ) p.push(a[l++].replace(/^\s*\d+[.)]\s+/, ""));
      c.push(/* @__PURE__ */ e.jsx("ol", { children: p.map((h, v) => /* @__PURE__ */ e.jsx("li", { children: xe(h, s, `o${o}-${v}`) }, v)) }, o++));
      continue;
    }
    if (m.startsWith("> ")) {
      const p = [];
      for (; l < a.length && a[l].startsWith("> "); ) p.push(a[l++].slice(2));
      c.push(/* @__PURE__ */ e.jsx("blockquote", { children: xe(p.join(" "), s, `q${o}`) }, o++));
      continue;
    }
    if (!m.trim()) {
      l++;
      continue;
    }
    const x = [];
    for (; l < a.length && a[l].trim() && !/^(```|\s*[-*]\s+|\s*\d+[.)]\s+|> )/.test(a[l]); ) x.push(a[l++]);
    c.push(
      /* @__PURE__ */ e.jsx("p", { children: x.map((p, h) => /* @__PURE__ */ e.jsxs(d.Fragment, { children: [
        h > 0 && /* @__PURE__ */ e.jsx("br", {}),
        xe(p, s, `p${o}-${h}`)
      ] }, h)) }, o++)
    );
  }
  return /* @__PURE__ */ e.jsx("div", { className: "td-md", children: c });
}
const jt = ["15m", "30m", "45m", "1h", "1h30m", "2h", "3h", "4h"];
function fs({ taskId: t, meta: s, now: a, revision: c, onClose: l, onToggle: o, onOpenTask: m, onError: x, onOpenUrl: p, onCreateLabel: h, onNeedSections: v }) {
  const I = We(), [g, N] = d.useState(null), [y, E] = d.useState(null), [M, F] = d.useState(null), [C, w] = d.useState(""), b = d.useRef(null), i = d.useRef(""), T = d.useRef(null), q = (n) => {
    b.current = n, F(n);
  }, B = (n) => {
    i.current = n, w(n);
  }, [ee, J] = d.useState(null), [Ne, me] = d.useState(!1), [ie, te] = d.useState(""), [X, _] = d.useState(""), [be, re] = d.useState(!1), z = { due: d.useRef(null), priority: d.useRef(null), labels: d.useRef(null), project: d.useRef(null) }, W = async () => {
    try {
      E(null), N(await I.call("task", { id: t }));
    } catch (n) {
      E(G(n));
    }
  };
  d.useEffect(() => {
    N(null), q(null), me(!1), te(""), W();
  }, [t]);
  const ye = d.useRef(c);
  d.useEffect(() => {
    c !== ye.current && W();
  }, [c]), T.current = g?.task ?? null, d.useEffect(() => () => {
    const n = b.current, D = T.current;
    if (!n || !D) return;
    const $ = at(n, i.current, D);
    $ && I.call("update", { id: D.id, ...$ }).catch((R) => x(G(R)));
  }, []);
  const H = async (n) => {
    if (!g) return;
    const D = g;
    N({ ...g, task: { ...g.task, ...js(n) } });
    try {
      const $ = await I.call("update", { id: g.task.id, ...n });
      N((R) => R && { ...R, task: $ });
    } catch ($) {
      N(D), W(), x(G($));
    }
  }, Ce = async (n, D) => {
    if (g)
      try {
        await I.call("move", { id: g.task.id, projectId: n, ...D ? { sectionId: D } : { noSection: !0 } }), N({ ...g, task: { ...g.task, projectId: n, sectionId: D } });
      } catch ($) {
        x(G($));
      }
  }, ke = g?.task.projectId;
  if (d.useEffect(() => {
    ke && v(ke);
  }, [ke, v]), y)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", {}),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: l, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(fe, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
        /* @__PURE__ */ e.jsx("p", { children: y }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void W(), children: "Try again" })
      ] })
    ] });
  if (!g)
    return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: 120 } }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: l, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(fe, {}) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "80%", height: 20, marginBottom: 14 } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "60%" } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "40%", marginTop: 8 } })
      ] })
    ] });
  const { task: f, children: U, comments: je } = g, le = s.projects.find((n) => n.id === f.projectId), oe = s.sections.find((n) => n.id === f.sectionId), se = !!f.completedAt, we = Re(f.due, a), ce = async () => {
    const n = b.current;
    if (!n) return;
    q(null);
    const D = at(n, i.current, f);
    D && await H(D);
  };
  return /* @__PURE__ */ e.jsxs("aside", { className: "td-drawer", "aria-label": "Task details", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-head", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: z.project, className: "td-crumb", onClick: () => J("project"), title: "Move to project / section", children: [
        le?.isInbox ? /* @__PURE__ */ e.jsx(Me, { size: 13 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: Y(le?.color) } }),
        /* @__PURE__ */ e.jsx("span", { children: le?.name ?? "Project" }),
        oe && /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
          "/ ",
          oe.name
        ] }),
        /* @__PURE__ */ e.jsx(Mt, { size: 12, className: "td-crumb-move" })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-tools", children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open in Todoist", onClick: () => p(f.url), children: /* @__PURE__ */ e.jsx(rt, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn danger", title: "Delete task", onClick: () => me(!0), children: /* @__PURE__ */ e.jsx(Ft, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: l, children: /* @__PURE__ */ e.jsx(fe, {}) })
      ] })
    ] }),
    Ne && /* @__PURE__ */ e.jsxs("div", { className: "td-confirm", children: [
      /* @__PURE__ */ e.jsxs("span", { children: [
        "Delete this task",
        U.length ? ` and its ${U.length} subtask${U.length > 1 ? "s" : ""}` : "",
        "? This cannot be undone."
      ] }),
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => me(!1), children: "Cancel" }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            className: "td-btn td-btn-danger",
            autoFocus: !0,
            onClick: async () => {
              try {
                await I.call("delete", { id: f.id }), l();
              } catch (n) {
                x(G(n));
              }
            },
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-body", children: [
      f.parentId && /* @__PURE__ */ e.jsxs("button", { className: "td-parent-link", onClick: () => m(f.parentId), children: [
        /* @__PURE__ */ e.jsx(_e, { size: 12 }),
        " Open parent task"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-title-row", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox lg p${f.priority}${se ? " is-checked" : ""}`,
            style: { "--prio": Ee[f.priority] },
            "aria-label": se ? "Reopen task" : "Complete task",
            onClick: async () => {
              await o(f) && W();
            },
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        M === "title" ? /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-title",
            value: C,
            rows: Math.min(5, Math.max(1, Math.ceil(C.length / 40))),
            onChange: (n) => B(n.target.value),
            onBlur: () => void ce(),
            onKeyDown: (n) => {
              n.key === "Enter" && !n.shiftKey && (n.preventDefault(), ce()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), q(null));
            }
          }
        ) : /* @__PURE__ */ e.jsx("h2", { className: `td-drawer-title${se ? " is-done" : ""}`, onClick: () => {
          B(f.content), q("title");
        }, title: "Click to edit", children: xe(f.content, p, "title") })
      ] }),
      M === "description" ? /* @__PURE__ */ e.jsxs("div", { className: "td-edit-desc-wrap", children: [
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            autoFocus: !0,
            className: "td-edit-desc",
            value: C,
            placeholder: "Description (Markdown supported)",
            onChange: (n) => B(n.target.value),
            onKeyDown: (n) => {
              n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), ce()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), q(null));
            }
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-edit-actions", children: [
          /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "⌘↵ to save" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => q(null), children: "Cancel" }),
          /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", onClick: () => void ce(), children: "Save" })
        ] })
      ] }) : f.description ? /* @__PURE__ */ e.jsx("div", { className: "td-desc", onClick: (n) => {
        n.target.closest("a") || (B(f.description), q("description"));
      }, title: "Click to edit", children: /* @__PURE__ */ e.jsx(nt, { text: f.description, open: p }) }) : /* @__PURE__ */ e.jsx("button", { className: "td-add-desc", onClick: () => {
        B(""), q("description");
      }, children: "Add description" }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-props", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Ue, { size: 13 }),
          "Due"
        ] }),
        /* @__PURE__ */ e.jsx("button", { ref: z.due, className: `td-prop-value tone-${we}`, onClick: () => J("due"), children: f.due ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          f.due.recurring && /* @__PURE__ */ e.jsx(lt, { size: 12 }),
          Be(f.due, a),
          /* @__PURE__ */ e.jsx("span", { className: "td-dim td-prop-sub", children: f.due.recurring ? f.due.string : "" })
        ] }) : /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "No date" }) }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(ot, { size: 13 }),
          "Deadline"
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-value-wrap", children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              className: `td-date-input${f.deadline ? "" : " is-empty"}`,
              value: f.deadline ?? "",
              onChange: (n) => void H({ deadline: n.target.value }),
              "aria-label": "Deadline"
            }
          ),
          f.deadline && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Clear deadline", onClick: () => void H({ deadline: "" }), children: /* @__PURE__ */ e.jsx(fe, { size: 12 }) })
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(ct, { size: 13 }),
          "Duration"
        ] }),
        /* @__PURE__ */ e.jsxs(
          "select",
          {
            className: "td-select",
            value: f.duration ? xs(f.duration) : "",
            onChange: (n) => {
              n.target.value && H({ duration: n.target.value });
            },
            "aria-label": "Duration",
            children: [
              /* @__PURE__ */ e.jsx("option", { value: "", disabled: !0, children: f.duration ? ft(f.duration) : "None" }),
              jt.map((n) => /* @__PURE__ */ e.jsx("option", { value: n, children: n.replace("h30m", "h 30m") }, n))
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(tt, { size: 13, color: "currentColor" }),
          "Priority"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: z.priority, className: "td-prop-value", onClick: () => J("priority"), children: [
          /* @__PURE__ */ e.jsx(tt, { size: 13, color: f.priority === 1 ? "var(--td-muted)" : Ee[f.priority] }),
          "Priority ",
          5 - f.priority
        ] }),
        /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
          /* @__PURE__ */ e.jsx(Ae, { size: 13 }),
          "Labels"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-prop-labels", children: [
          f.labels.map((n) => {
            const D = s.labels.find(($) => $.name === n);
            return /* @__PURE__ */ e.jsxs("span", { className: "td-label-pill", style: { "--label": Y(D?.color) }, children: [
              n,
              /* @__PURE__ */ e.jsx("button", { title: `Remove ${n}`, onClick: () => void H({ labels: f.labels.filter(($) => $ !== n) }), children: /* @__PURE__ */ e.jsx(fe, { size: 10 }) })
            ] }, n);
          }),
          /* @__PURE__ */ e.jsx("button", { ref: z.labels, className: "td-icon-btn sm", title: "Add label", onClick: () => J("labels"), children: /* @__PURE__ */ e.jsx(ve, { size: 12 }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(_e, { size: 13 }),
          " Sub-tasks ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: U.length || "" })
        ] }),
        U.map((n) => /* @__PURE__ */ e.jsxs("div", { className: `td-subtask${n.completedAt ? " is-done" : ""}`, children: [
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: `td-checkbox sm p${n.priority}`,
              style: { "--prio": Ee[n.priority] },
              "aria-label": "Complete sub-task",
              onClick: async () => {
                await o(n) && W();
              },
              children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
            }
          ),
          /* @__PURE__ */ e.jsx("button", { className: "td-subtask-title", onClick: () => m(n.id), children: xe(n.content, p, n.id) }),
          n.due && /* @__PURE__ */ e.jsx("span", { className: `td-chip td-due tone-${Re(n.due, a)}`, children: Be(n.due, a) })
        ] }, n.id)),
        /* @__PURE__ */ e.jsxs(
          "form",
          {
            className: "td-inline-add",
            onSubmit: async (n) => {
              n.preventDefault();
              const D = X.trim();
              if (!(!D || be)) {
                re(!0);
                try {
                  const $ = await I.call("add", { content: D, parentId: f.id, projectId: f.projectId });
                  N((R) => R && { ...R, children: [...R.children, $] }), _("");
                } catch ($) {
                  x(G($));
                } finally {
                  re(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(ve, { size: 13 }),
              /* @__PURE__ */ e.jsx("input", { value: X, onChange: (n) => _(n.target.value), placeholder: "Add sub-task", onKeyDown: (n) => {
                n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
              } })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
        /* @__PURE__ */ e.jsxs("h3", { children: [
          /* @__PURE__ */ e.jsx(dt, { size: 13 }),
          " Comments ",
          /* @__PURE__ */ e.jsx("span", { className: "td-count", children: je.length || "" })
        ] }),
        je.map((n) => /* @__PURE__ */ e.jsxs("div", { className: "td-comment", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-comment-meta", children: new Date(n.postedAt).toLocaleString(void 0, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }),
          n.content && /* @__PURE__ */ e.jsx(nt, { text: n.content, open: p }),
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
              const D = ie.trim();
              if (!(!D || be)) {
                re(!0);
                try {
                  const $ = await I.call("comment", { taskId: f.id, content: D });
                  N((R) => R && { ...R, comments: [...R.comments, $] }), te("");
                } catch ($) {
                  x(G($));
                } finally {
                  re(!1);
                }
              }
            },
            children: [
              /* @__PURE__ */ e.jsx(
                "textarea",
                {
                  value: ie,
                  onChange: (n) => te(n.target.value),
                  placeholder: "Write a comment",
                  rows: ie.includes(`
`) ? 4 : 2,
                  onKeyDown: (n) => {
                    n.key === "Enter" && (n.metaKey || n.ctrlKey) && (n.preventDefault(), n.currentTarget.form.requestSubmit()), n.key === "Escape" && (n.preventDefault(), n.stopPropagation(), n.target.blur());
                  }
                }
              ),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !ie.trim() || be, children: "Comment" })
            ]
          }
        )
      ] })
    ] }),
    ee === "due" && /* @__PURE__ */ e.jsx(ut, { anchor: z.due.current, current: f.due?.string, onPick: (n) => void H({ due: n }), onClose: () => J(null) }),
    ee === "priority" && /* @__PURE__ */ e.jsx(mt, { anchor: z.priority.current, current: f.priority, onPick: (n) => void H({ priority: n }), onClose: () => J(null) }),
    ee === "labels" && /* @__PURE__ */ e.jsx(
      Lt,
      {
        anchor: z.labels.current,
        labels: s.labels,
        selected: f.labels,
        onChange: (n) => void H({ labels: n }),
        onCreate: h,
        onClose: () => J(null)
      }
    ),
    ee === "project" && /* @__PURE__ */ e.jsx(qt, { anchor: z.project.current, meta: s, current: { projectId: f.projectId, sectionId: f.sectionId }, onPick: (n) => void Ce(n.projectId, n.sectionId), onClose: () => J(null) })
  ] });
}
function at(t, s, a) {
  if (t === "title") {
    const c = s.trim();
    return c && c !== a.content ? { content: c } : null;
  }
  return s !== a.description ? { description: s } : null;
}
function xs(t) {
  if (t.unit === "day") return "";
  const s = Math.floor(t.amount / 60), a = t.amount % 60, c = `${s ? `${s}h` : ""}${a ? `${a}m` : ""}`;
  return jt.includes(c) ? c : "";
}
function js(t) {
  const s = {};
  return t.content !== void 0 && (s.content = t.content), t.description !== void 0 && (s.description = t.description), t.priority !== void 0 && (s.priority = t.priority), t.labels !== void 0 && (s.labels = t.labels), t.deadline !== void 0 && (s.deadline = t.deadline || null), t.due === "" && (s.due = null), s;
}
const bs = d.memo(function({
  task: s,
  lookup: a,
  now: c,
  showProject: l,
  focused: o,
  completing: m,
  depth: x = 0,
  childCount: p = 0,
  onToggle: h,
  onOpen: v,
  onPatch: I,
  onFocus: g,
  onOpenUrl: N
}) {
  const [y, E] = d.useState(null), M = d.useRef(null), F = d.useRef(null), C = !!s.completedAt || m, w = Re(s.due, c), b = a.project(s.projectId), i = a.section(s.sectionId);
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      className: `td-task${o ? " is-focused" : ""}${C ? " is-done" : ""}${m ? " is-completing" : ""}`,
      style: x ? { paddingLeft: 12 + x * 26 } : void 0,
      "data-task-id": s.id,
      role: "listitem",
      "aria-label": s.content,
      onMouseDown: () => g(s),
      onClick: (T) => {
        T.target.closest("button, a, input") || v(s);
      },
      children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox p${s.priority}`,
            style: { "--prio": Ee[s.priority] },
            "aria-label": C ? "Reopen task" : "Complete task",
            title: C ? "Reopen" : "Complete",
            onClick: () => h(s),
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-task-title", children: xe(s.content, N, s.id) }),
          s.description && !C && /* @__PURE__ */ e.jsx("div", { className: "td-task-desc", children: s.description.split(`
`)[0] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-task-meta", children: [
            s.due && /* @__PURE__ */ e.jsxs("span", { className: `td-chip td-due tone-${w}`, title: s.due.string, children: [
              s.due.recurring ? /* @__PURE__ */ e.jsx(lt, { size: 12 }) : /* @__PURE__ */ e.jsx(Ue, { size: 12 }),
              Be(s.due, c)
            ] }),
            s.deadline && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-deadline", title: "Deadline", children: [
              /* @__PURE__ */ e.jsx(ot, { size: 12 }),
              is(s.deadline, c)
            ] }),
            s.duration && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Duration", children: [
              /* @__PURE__ */ e.jsx(ct, { size: 12 }),
              ft(s.duration)
            ] }),
            p > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Subtasks", children: [
              /* @__PURE__ */ e.jsx(_e, { size: 12 }),
              p
            ] }),
            s.commentCount > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Comments", children: [
              /* @__PURE__ */ e.jsx(dt, { size: 12 }),
              s.commentCount
            ] }),
            s.labels.map((T) => /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-label", style: { color: Y(a.label(T)?.color) }, children: [
              /* @__PURE__ */ e.jsx(Ae, { size: 12 }),
              T
            ] }, T)),
            s.completedAt && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", children: [
              "Completed ",
              new Date(s.completedAt).toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" })
            ] }),
            l && b && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-project-chip", children: [
              b.isInbox ? /* @__PURE__ */ e.jsx(Me, { size: 12 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: Y(b.color) } }),
              b.name,
              i ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
                " / ",
                i.name
              ] }) : null
            ] })
          ] })
        ] }),
        !C && /* @__PURE__ */ e.jsxs("div", { className: "td-task-actions", children: [
          /* @__PURE__ */ e.jsx("button", { ref: M, type: "button", className: "td-icon-btn", title: "Schedule (t = today)", onClick: () => E("due"), children: /* @__PURE__ */ e.jsx(Ue, {}) }),
          /* @__PURE__ */ e.jsx("button", { ref: F, type: "button", className: "td-icon-btn", title: "Priority (1–4)", onClick: () => E("priority"), children: /* @__PURE__ */ e.jsx(Ot, {}) })
        ] }),
        y === "due" && /* @__PURE__ */ e.jsx(ut, { anchor: M.current, current: s.due?.string, onPick: (T) => I(s, { due: T }), onClose: () => E(null) }),
        y === "priority" && /* @__PURE__ */ e.jsx(mt, { anchor: F.current, current: s.priority, onPick: (T) => I(s, { priority: T }), onClose: () => E(null) })
      ]
    }
  );
}), ys = 650;
function ks() {
  const t = We(), s = zt(t), a = Kt(), c = s?.setup?.state === "ready";
  return d.useEffect(() => {
    t.call("status", {}).catch(() => {
    });
  }, [t]), c ? /* @__PURE__ */ e.jsx(vs, { revision: s.revision, defaultView: s.settings.defaultView, now: a, user: s.setup.user }) : /* @__PURE__ */ e.jsx("div", { className: "td-root", children: /* @__PURE__ */ e.jsx(_t, { setup: s?.setup ?? null, onRetry: async () => {
    await t.call("status", { refresh: !0 });
  } }) });
}
function vs({ revision: t, defaultView: s, now: a, user: c }) {
  const l = We(), [o, m] = d.useState({ kind: s }), [x, p] = Ut(l, "todoist.ui.sidebar", !0), [h, v] = d.useState(null), [I, g] = d.useState({}), [N, y] = d.useState([]), [E, M] = d.useState(null), [F, C] = d.useState(!1), [w, b] = d.useState(!0), [i, T] = d.useState(!1), [q, B] = d.useState(null), [ee, J] = d.useState({ today: null, inbox: null }), [Ne, me] = d.useState(/* @__PURE__ */ new Set()), [ie, te] = d.useState(null), [X, _] = d.useState(null), [be, re] = d.useState([]), [z, W] = d.useState(!1), [ye, H] = d.useState(""), [Ce, ke] = d.useState(() => window.innerWidth), [f, U] = d.useState(!1), [je, le] = d.useState(!1), [oe, se] = d.useState(null), we = d.useRef(null), ce = d.useRef(null), n = d.useRef(null), D = d.useRef(0), $ = d.useRef(1), R = d.useRef(/* @__PURE__ */ new Set()), de = Ce < 640, bt = Ce < 820, Fe = de ? f : x;
  d.useEffect(() => {
    const r = () => ke(window.innerWidth);
    return window.addEventListener("resize", r), () => window.removeEventListener("resize", r);
  }, []);
  const Z = d.useCallback((r, u = {}) => {
    const j = Date.now() + Math.random();
    re((k) => [...k.slice(-2), { id: j, message: r, ...u }]), setTimeout(() => re((k) => k.filter((O) => O.id !== j)), u.action ? 6e3 : u.tone === "error" ? 7e3 : 3e3);
  }, []), P = d.useCallback((r) => {
    const u = ss(r);
    u === "NO_TOKEN" || u === "AUTH" || u === "TD_NOT_FOUND" || Z(G(r), { tone: "error" });
  }, [Z]), Le = d.useCallback((r) => {
    l.call("openUrl", { url: r }).catch(P);
  }, [l, P]);
  d.useEffect(() => {
    let r = !0;
    return l.call("meta", {}).then((u) => {
      r && v(u);
    }, P), () => {
      r = !1;
    };
  }, [l, t, P]);
  const qe = d.useCallback((r) => {
    l.call("sections", { projectId: r }).then(
      (u) => g((j) => ({ ...j, [r]: u })),
      () => {
      }
    );
  }, [l]), V = d.useMemo(
    () => h ? { ...h, sections: Object.values(I).flat() } : null,
    [h, I]
  ), Q = d.useCallback(async (r, u = "reset", j = null) => {
    const k = ++D.current, O = u === "append";
    O ? T(!0) : b(!0);
    try {
      let A = await l.call("list", { ...r, cursor: O ? j : null }), ne = A.tasks;
      if (u === "refresh")
        for (let S = 1; S < $.current && A.nextCursor && k === D.current; S++)
          A = await l.call("list", { ...r, cursor: A.nextCursor }), ne = [...ne, ...A.tasks.filter((L) => !ne.some((he) => he.id === L.id))];
      if (k !== D.current) return;
      if (O ? $.current += 1 : u === "reset" && ($.current = 1), y((S) => O ? [...S, ...ne.filter((L) => !S.some((he) => he.id === L.id))] : ne), M(A.nextCursor), C(A.truncated), B(null), !O && (r.kind === "today" || r.kind === "inbox")) {
        const S = ne.filter((L) => !L.completedAt).length;
        J((L) => ({ ...L, [r.kind]: A.nextCursor ? null : S }));
      }
    } catch (A) {
      if (k !== D.current) return;
      B(G(A)), P(A);
    } finally {
      k === D.current && (b(!1), T(!1));
    }
  }, [l, P]), Oe = JSON.stringify(o), Ge = d.useRef(null);
  d.useEffect(() => {
    const r = Ge.current === Oe;
    Ge.current = Oe, Q(o, r ? "refresh" : "reset");
  }, [Oe, t, Q]);
  const Je = d.useMemo(() => {
    const r = new Map(V?.projects.map((k) => [k.id, k])), u = new Map(V?.sections.map((k) => [k.id, k])), j = new Map(V?.labels.map((k) => [k.name, k]));
    return {
      project: (k) => r.get(k),
      section: (k) => k ? u.get(k) : void 0,
      label: (k) => j.get(k)
    };
  }, [V]), ze = V?.projects.find((r) => r.isInbox), pe = o.kind === "project" ? o.id : o.kind === "inbox" ? ze?.id : void 0, ue = pe ? Je.project(pe) : void 0;
  d.useEffect(() => {
    pe && qe(pe);
  }, [pe, t, qe]);
  const { groups: Se, depths: yt, childCounts: kt } = d.useMemo(() => Ns(o, N, a, V, pe), [o, N, a, V, pe]), K = d.useMemo(() => Se.flatMap((r) => r.tasks), [Se]), De = d.useCallback(async (r) => {
    if (R.current.has(r.id)) return !1;
    R.current.add(r.id);
    const u = () => {
      R.current.delete(r.id);
    };
    if (r.completedAt)
      try {
        return await l.call("uncomplete", { id: r.id }), Z("Task reopened"), !0;
      } catch (j) {
        return P(j), !1;
      } finally {
        u();
      }
    me((j) => new Set(j).add(r.id));
    try {
      return await l.call("complete", { id: r.id }), Z(r.due?.recurring ? `Completed — next: ${r.due.string}` : "Task completed", {
        action: r.due?.recurring ? void 0 : {
          label: "Undo",
          run: () => {
            l.call("uncomplete", { id: r.id }).then(() => Z("Task reopened"), P);
          }
        }
      }), setTimeout(() => {
        me((j) => {
          const k = new Set(j);
          return k.delete(r.id), k;
        }), u();
      }, ys), !0;
    } catch (j) {
      return me((k) => {
        const O = new Set(k);
        return O.delete(r.id), O;
      }), u(), P(j), !1;
    }
  }, [l, Z, P]), Ie = d.useCallback(async (r, u) => {
    u.priority !== void 0 && y((j) => j.map((k) => k.id === r.id ? { ...k, priority: u.priority } : k));
    try {
      await l.call("update", { id: r.id, ...u });
    } catch (j) {
      P(j), Q(o, "refresh");
    }
  }, [l, P, Q, o]), vt = d.useCallback(async (r) => {
    let u;
    try {
      u = await l.call("quickAdd", { text: r });
    } catch (j) {
      return P(j), !1;
    }
    try {
      await Yt(u, Bt(u, {
        due: o.kind === "today" ? "today" : null,
        labels: o.kind === "label" && o.query ? [o.query] : [],
        projectId: o.kind === "project" ? o.id : null,
        inboxId: ze?.id ?? null
      }), {
        update: (j) => l.call("update", j),
        move: (j) => l.call("move", j)
      }), Z(`Added “${u.content}”`, { action: { label: "Open", run: () => _(u.id) } });
    } catch (j) {
      const k = j instanceof Wt ? `${j.message} ${G(j.cause)}` : G(j);
      Z(k, { tone: "error", action: { label: "Open", run: () => _(u.id) } });
    }
    return !0;
  }, [l, o, Z, P, ze?.id]), Xe = d.useCallback(async (r) => {
    try {
      await l.call("createLabel", { name: r });
    } catch (u) {
      throw P(u), u;
    }
  }, [l, P]), Ze = d.useCallback((r) => {
    W(!1), U(!1), te(null), xt(r, o) ? Q(r, "reset") : (y([]), M(null), m(r)), n.current?.scrollTo({ top: 0 });
  }, [o, m, Q]);
  d.useEffect(() => {
    if (!z) return;
    const r = ye.trim();
    if (!r) return;
    const u = setTimeout(() => {
      y([]), m({ kind: "search", query: r });
    }, 350);
    return () => clearTimeout(u);
  }, [ye, z]);
  const Te = d.useCallback(() => {
    W(!1), H(""), o.kind === "search" && (y([]), m({ kind: s }));
  }, [o.kind, s]);
  d.useEffect(() => cs((u) => {
    const j = u.target, k = j.closest('input, textarea, select, [contenteditable="true"]');
    if (u.key === "Escape") {
      if (u.defaultPrevented) return;
      if (je) {
        u.preventDefault(), le(!1);
        return;
      }
      if (X) {
        u.preventDefault(), _(null);
        return;
      }
      if (z || o.kind === "search") {
        u.preventDefault(), Te();
        return;
      }
      if (f) {
        u.preventDefault(), U(!1);
        return;
      }
      return;
    }
    if (k || u.metaKey || u.ctrlKey || u.altKey) return;
    const O = K.findIndex((L) => L.id === ie), A = O >= 0 ? K[O] : null, ne = (L) => {
      if (!K.length) return;
      const he = K[Math.max(0, Math.min(K.length - 1, (O < 0 ? L > 0 ? -1 : K.length : O) + L))];
      te(he.id), n.current?.querySelector(`[data-task-id="${CSS.escape(he.id)}"]`)?.scrollIntoView({ block: "nearest" }), X && _(he.id);
    }, S = u.key;
    (S === "Enter" || S === " ") && ds(j) || (S === "j" || S === "ArrowDown" ? (u.preventDefault(), ne(1)) : S === "k" || S === "ArrowUp" ? (u.preventDefault(), ne(-1)) : (S === "Enter" || S === "o") && A ? (u.preventDefault(), _(A.id)) : (S === "x" || S === " ") && A ? (u.preventDefault(), De(A)) : /^[1-4]$/.test(S) && A ? (u.preventDefault(), Ie(A, { priority: 5 - Number(S) })) : S === "t" && A ? (u.preventDefault(), Ie(A, { due: "today" })) : S === "q" || S === "a" ? (u.preventDefault(), we.current?.focus()) : S === "/" ? (u.preventDefault(), W(!0), requestAnimationFrame(() => ce.current?.focus())) : S === "r" ? (u.preventDefault(), Q(o, "refresh"), l.call("meta", {}).then(v, () => {
    })) : S === "[" ? (u.preventDefault(), de ? U((L) => !L) : p(!x)) : S === "?" && (u.preventDefault(), le((L) => !L)));
  }), [K, ie, X, z, f, je, De, Ie, Q, o, l, de, x, p, Te]);
  const gt = gs(o, V), Nt = K.filter((r) => !r.completedAt && !Ne.has(r.id)).length, Ct = o.kind === "today" ? "Due today unless you type a date" : o.kind === "project" && ue ? `Adds to #${ue.name}` : o.kind === "label" ? `Tagged @${o.query}` : o.kind === "inbox" ? "Adds to Inbox" : null, wt = !c?.readOnly && o.kind !== "completed";
  return /* @__PURE__ */ e.jsxs("div", { className: `td-root${de ? " is-narrow" : ""}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: `td-layout${Fe && !de ? " has-sidebar" : ""}`, children: [
      Fe && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        de && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => U(!1) }),
        /* @__PURE__ */ e.jsx(
          ms,
          {
            meta: V,
            current: o,
            counts: ee,
            user: c,
            onSelect: Ze,
            onSearch: () => {
              W(!0), U(!1), requestAnimationFrame(() => ce.current?.focus());
            },
            onCreateProject: async (r, u) => {
              try {
                const j = await l.call("createProject", { name: r, color: u });
                return Ze({ kind: "project", id: j.id }), !0;
              } catch (j) {
                return P(j), !1;
              }
            },
            onCreateLabel: async (r) => {
              try {
                return await Xe(r), !0;
              } catch {
                return !1;
              }
            },
            onSignOut: () => {
              l.call("logout", {}).catch(P);
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("main", { className: "td-main", children: [
        /* @__PURE__ */ e.jsxs("header", { className: "td-header", children: [
          /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: Fe ? "Hide sidebar ([)" : "Show sidebar ([)", onClick: () => de ? U((r) => !r) : p(!x), children: /* @__PURE__ */ e.jsx(Ht, {}) }),
          z ? /* @__PURE__ */ e.jsxs("div", { className: "td-search", children: [
            /* @__PURE__ */ e.jsx(it, {}),
            /* @__PURE__ */ e.jsx(
              "input",
              {
                ref: ce,
                value: ye,
                onChange: (r) => H(r.target.value),
                placeholder: "Search tasks",
                onKeyDown: (r) => {
                  r.key === "Escape" && (r.preventDefault(), Te()), r.key === "ArrowDown" && (r.preventDefault(), r.target.blur(), K[0] && te(K[0].id));
                }
              }
            ),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", onClick: Te, title: "Close search", children: /* @__PURE__ */ e.jsx(fe, { size: 12 }) })
          ] }) : /* @__PURE__ */ e.jsxs("div", { className: "td-title", children: [
            o.kind === "project" && ue && /* @__PURE__ */ e.jsx("span", { className: "td-dot lg", style: { background: Y(ue.color) } }),
            o.kind === "inbox" && /* @__PURE__ */ e.jsx(Me, {}),
            /* @__PURE__ */ e.jsx("h1", { children: gt }),
            !w && o.kind !== "completed" && /* @__PURE__ */ e.jsxs("span", { className: "td-title-count", children: [
              Nt,
              E ? "+" : ""
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-header-tools", children: [
            ue && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open project in Todoist", onClick: () => Le(ue.url), children: /* @__PURE__ */ e.jsx(rt, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Keyboard shortcuts (?)", onClick: () => le(!0), children: /* @__PURE__ */ e.jsx(Vt, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: `td-icon-btn${w ? " is-spinning" : ""}`, title: "Refresh (r)", onClick: () => {
              Q(o, "refresh"), l.call("meta", {}).then(v, () => {
              });
            }, children: /* @__PURE__ */ e.jsx(Qt, {}) })
          ] })
        ] }),
        wt && /* @__PURE__ */ e.jsx("div", { className: "td-add-row", children: /* @__PURE__ */ e.jsx(
          us,
          {
            ref: we,
            placeholder: de ? "Add a task" : 'Add a task — "Review PR tomorrow 3pm p1 #Work @review"',
            contextLabel: Ct,
            onSubmit: vt
          }
        ) }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-list", ref: n, role: "list", children: [
          w && !N.length ? /* @__PURE__ */ e.jsx(ws, {}) : q && !N.length ? /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
            /* @__PURE__ */ e.jsx("p", { children: "Couldn’t load this list." }),
            /* @__PURE__ */ e.jsx("p", { className: "td-dim td-small", children: q }),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => void Q(o, "reset"), children: "Try again" })
          ] }) : K.length ? Se.map((r) => /* @__PURE__ */ e.jsxs("section", { className: "td-group", children: [
            (Se.length > 1 || r.subtitle || r.key !== "all") && r.title && /* @__PURE__ */ e.jsxs("h2", { className: `td-group-title${r.tone ? ` tone-${r.tone}` : ""}`, children: [
              r.title,
              r.subtitle && /* @__PURE__ */ e.jsx("span", { className: "td-group-sub", children: r.subtitle }),
              /* @__PURE__ */ e.jsx("span", { className: "td-group-count", children: r.tasks.length })
            ] }),
            r.tasks.map((u) => /* @__PURE__ */ e.jsx(
              bs,
              {
                task: u,
                lookup: Je,
                now: a,
                showProject: o.kind !== "project" && o.kind !== "inbox",
                focused: ie === u.id || X === u.id,
                completing: Ne.has(u.id),
                depth: yt.get(u.id) ?? 0,
                childCount: kt.get(u.id) ?? 0,
                onToggle: De,
                onOpen: (j) => {
                  te(j.id), _(j.id);
                },
                onPatch: Ie,
                onFocus: (j) => te(j.id),
                onOpenUrl: Le
              },
              u.id
            ))
          ] }, r.key)) : /* @__PURE__ */ e.jsx(Cs, { view: o }),
          (E || F) && K.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "td-more", children: E ? /* @__PURE__ */ e.jsxs("button", { className: "td-btn", disabled: i, onClick: () => void Q(o, "append", E), children: [
            i ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
            " Load more"
          ] }) : /* @__PURE__ */ e.jsxs("span", { className: "td-dim td-small", children: [
            "Showing the first ",
            K.length,
            " tasks — this filter has more than can be loaded here. Open it in Todoist for the rest."
          ] }) }),
          o.kind === "project" && ue && !c?.readOnly && !w && (oe !== null ? /* @__PURE__ */ e.jsxs(
            "form",
            {
              className: "td-section-add",
              onSubmit: async (r) => {
                if (r.preventDefault(), !!oe.trim())
                  try {
                    await l.call("createSection", { projectId: ue.id, name: oe.trim() }), se(null);
                  } catch (u) {
                    P(u);
                  }
              },
              children: [
                /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: oe, onChange: (r) => se(r.target.value), placeholder: "Section name", onKeyDown: (r) => {
                  r.key === "Escape" && (r.preventDefault(), r.stopPropagation(), se(null));
                } }),
                /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !oe.trim(), children: "Add section" }),
                /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => se(null), children: "Cancel" })
              ]
            }
          ) : /* @__PURE__ */ e.jsxs("button", { className: "td-add-section", onClick: () => se(""), children: [
            /* @__PURE__ */ e.jsx(ve, { size: 12 }),
            " Add section"
          ] }))
        ] })
      ] }),
      X && V && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        bt && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => _(null) }),
        /* @__PURE__ */ e.jsx(
          fs,
          {
            taskId: X,
            meta: V,
            now: a,
            onClose: () => _(null),
            onToggle: De,
            onOpenTask: (r) => _(r),
            revision: t,
            onError: (r) => Z(r, { tone: "error" }),
            onOpenUrl: Le,
            onCreateLabel: Xe,
            onNeedSections: qe
          },
          X
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "td-toasts", "aria-live": "polite", children: be.map((r) => /* @__PURE__ */ e.jsxs("div", { className: `td-toast${r.tone === "error" ? " is-error" : ""}`, children: [
      /* @__PURE__ */ e.jsx("span", { children: r.message }),
      r.action && /* @__PURE__ */ e.jsx("button", { onClick: () => {
        r.action.run(), re((u) => u.filter((j) => j.id !== r.id));
      }, children: r.action.label })
    ] }, r.id)) }),
    je && /* @__PURE__ */ e.jsx(Ss, { onClose: () => le(!1) })
  ] });
}
function gs(t, s) {
  switch (t.kind) {
    case "today":
      return "Today";
    case "upcoming":
      return "Upcoming";
    case "inbox":
      return "Inbox";
    case "completed":
      return "Completed";
    case "search":
      return `Search: ${t.query ?? ""}`;
    case "label":
      return `@${t.query ?? ""}`;
    case "filter":
      return s?.filters.find((a) => a.id === t.id)?.name ?? "Filter";
    case "project":
      return s?.projects.find((a) => a.id === t.id)?.name ?? "Project";
  }
}
function Ns(t, s, a, c, l) {
  const o = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), x = new Set(s.map((h) => h.id));
  for (const h of s) h.parentId && x.has(h.parentId) && m.set(h.parentId, (m.get(h.parentId) ?? 0) + 1);
  if (t.kind === "today") return { groups: rs(s, a), depths: o, childCounts: m };
  if (t.kind === "upcoming") return { groups: ls(s, a), depths: o, childCounts: m };
  if (t.kind === "completed") return { groups: os(s, a), depths: o, childCounts: m };
  if ((t.kind === "project" || t.kind === "inbox") && l) {
    const h = (c?.sections ?? []).filter((y) => y.projectId === l), v = /* @__PURE__ */ new Map();
    for (const y of s) {
      const E = y.sectionId && h.some((F) => F.id === y.sectionId) ? y.sectionId : null, M = v.get(E) ?? [];
      M.push(y), v.set(E, M);
    }
    const I = (y) => {
      const E = new Set(y.map((w) => w.id)), M = y.filter((w) => !w.parentId || !E.has(w.parentId)).sort((w, b) => w.order - b.order), F = [], C = (w, b) => {
        F.push(w), o.set(w.id, b), y.filter((i) => i.parentId === w.id).sort((i, T) => i.order - T.order).forEach((i) => C(i, Math.min(b + 1, 4)));
      };
      return M.forEach((w) => C(w, 0)), F;
    }, g = [], N = v.get(null) ?? [];
    (N.length || !h.length) && g.push({ key: "all", title: "", tasks: I(N) });
    for (const y of h)
      g.push({ key: y.id, title: y.name, tasks: I(v.get(y.id) ?? []) });
    return { groups: g.filter((y) => y.tasks.length || y.key !== "all"), depths: o, childCounts: m };
  }
  return { groups: [{ key: "all", title: "", tasks: [...s].sort((h, v) => v.priority - h.priority || (h.due?.date ?? "9999").localeCompare(v.due?.date ?? "9999") || h.order - v.order) }], depths: o, childCounts: m };
}
function Cs({ view: t }) {
  const s = {
    today: ["You’re all done for today", "Enjoy the rest of your day — or add something below."],
    upcoming: ["Nothing scheduled in the next two weeks", "Tasks with a due date show up here."],
    inbox: ["Inbox zero", "New tasks without a project land here."],
    completed: ["No completed tasks yet", "Tasks you complete show up here."],
    search: ["No matching tasks", "Search looks at task names."]
  }, [a, c] = s[t.kind] ?? ["No tasks here", "Add one with the bar above."];
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
function ws() {
  return /* @__PURE__ */ e.jsx("div", { className: "td-skeleton-list", "aria-busy": "true", children: [78, 52, 64, 40, 70].map((t, s) => /* @__PURE__ */ e.jsxs("div", { className: "td-task is-skeleton", children: [
    /* @__PURE__ */ e.jsx("span", { className: "td-checkbox" }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${t}%` } }),
      /* @__PURE__ */ e.jsx("span", { className: "td-skel sm", style: { width: `${t / 2}%` } })
    ] })
  ] }, s)) });
}
function Ss({ onClose: t }) {
  const s = [
    ["q / a", "Quick add"],
    ["/", "Search"],
    ["j / k  ↓ / ↑", "Move between tasks"],
    ["Enter / o", "Open task"],
    ["x / Space", "Complete / reopen"],
    ["1 – 4", "Set priority"],
    ["t", "Schedule for today"],
    ["r", "Refresh"],
    ["[", "Toggle sidebar"],
    ["Esc", "Close help / drawer / search"],
    ["⌘⌥T", "Quick Add from anywhere in Agent Code"]
  ];
  return /* @__PURE__ */ e.jsx("div", { className: "td-modal-scrim", onClick: t, children: /* @__PURE__ */ e.jsxs("div", { className: "td-help", onClick: (a) => a.stopPropagation(), role: "dialog", "aria-label": "Keyboard shortcuts", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-help-head", children: [
      /* @__PURE__ */ e.jsx("h2", { children: "Keyboard shortcuts" }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: t, children: /* @__PURE__ */ e.jsx(fe, {}) })
    ] }),
    /* @__PURE__ */ e.jsx("dl", { children: s.map(([a, c]) => /* @__PURE__ */ e.jsxs("div", { children: [
      /* @__PURE__ */ e.jsx("dt", { children: a.split("  ").map((l) => /* @__PURE__ */ e.jsx("kbd", { children: l }, l)) }),
      /* @__PURE__ */ e.jsx("dd", { children: c })
    ] }, a)) })
  ] }) });
}
const Ts = ns({
  mount(t, s) {
    Gt(ts);
    const a = Jt(), c = Xt(t);
    return c.render(
      /* @__PURE__ */ e.jsx(Zt.Provider, { value: es(s), children: /* @__PURE__ */ e.jsx(ks, {}) })
    ), () => {
      a(), queueMicrotask(() => c.unmount());
    };
  }
});
export {
  Ts as default
};

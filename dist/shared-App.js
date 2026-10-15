import { r as h, j as e, m as fe, t as Rt, c as at, C as Ie, F as Ae, P as be, L as ge, I as xe, f as O, D as Ke, b as He, d as ot, e as lt, n as oe, T as _e, o as Xe, p as ct, q as qt, v as Tt, w as $t, x as Mt, y as Pt, U as At, z as zt, u as Oe, M as Lt, E as dt, G as ze, H as ut, R as ht, J as mt, K as pt, N as Ft, a as Kt, O as Ht, S as _t, Q as Ot, V as Wt, W as Vt, X as Bt } from "./shared-SetupScreen.js";
import { g as Qt, b as Ut, c as Gt, m as Yt, q as ae, a as Xt, d as Le, f as Fe, e as ft, h as Jt } from "./shared-listModel.js";
import { t as ye, b as Zt } from "./shared-types.js";
const Je = h.forwardRef(function({ meta: t, base: s, hint: n, onSubmit: i, onLabelCreate: d }, a) {
  const [f, j] = h.useState(!1), [y, o] = h.useState(""), [l, b] = h.useState(""), [g, k] = h.useState(""), [p, C] = h.useState(1), [S, M] = h.useState([]), [N, $] = h.useState(null), [D, m] = h.useState(null), E = h.useRef(null), F = h.useRef(null), R = { due: h.useRef(null), priority: h.useRef(null), labels: h.useRef(null), project: h.useRef(null) };
  h.useImperativeHandle(a, () => ({
    open: () => {
      j(!0), requestAnimationFrame(() => {
        E.current?.focus(), E.current?.scrollIntoView({ block: "nearest" });
      });
    }
  }), []);
  const W = () => {
    o(""), b(""), k(""), C(1), M([]), $(null);
  }, L = () => {
    W(), j(!1), m(null);
  }, K = async () => {
    const w = y.trim();
    if (!w) return;
    const Y = {
      ...s,
      due: g || s.due || null,
      priority: p > 1 ? p : s.priority,
      labels: [.../* @__PURE__ */ new Set([...s.labels ?? [], ...S])],
      projectId: N?.projectId ?? s.projectId ?? null,
      sectionId: N ? N.sectionId : s.sectionId ?? null,
      note: l.trim() || null
    }, H = { text: y, description: l };
    W(), E.current?.focus(), await i(w, Y) || (o((A) => A || H.text), b((A) => A || H.description));
  };
  if (!f)
    return /* @__PURE__ */ e.jsxs("button", { className: "td-add-task-btn", onClick: () => {
      j(!0), requestAnimationFrame(() => E.current?.focus());
    }, children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-add-task-plus", children: /* @__PURE__ */ e.jsx(fe, { size: 13 }) }),
      " Add task"
    ] });
  const G = Rt(y), V = y && G.some((w) => w.kind !== "text") ? at(y) : "", P = t?.projects.find((w) => w.id === (N?.projectId ?? s.projectId)) ?? t?.projects.find((w) => w.isInbox), B = t?.sections.find((w) => w.id === (N ? N.sectionId : s.sectionId));
  return /* @__PURE__ */ e.jsxs("div", { className: "td-add-editor", onKeyDown: (w) => {
    w.key === "Escape" && !D && (w.preventDefault(), w.stopPropagation(), L());
  }, children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-quickadd-stack td-add-editor-title", children: [
      /* @__PURE__ */ e.jsxs("div", { ref: F, className: "td-quickadd-mirror", "aria-hidden": "true", children: [
        G.map((w, Y) => /* @__PURE__ */ e.jsx("span", { className: `tok-${w.kind}`, children: w.text }, Y)),
        "​"
      ] }),
      /* @__PURE__ */ e.jsx(
        "input",
        {
          ref: E,
          className: "td-quickadd-input",
          value: y,
          spellCheck: !1,
          placeholder: "Task name",
          "aria-label": "Task name",
          onChange: (w) => {
            o(w.target.value), requestAnimationFrame(() => {
              F.current && E.current && (F.current.scrollLeft = E.current.scrollLeft);
            });
          },
          onKeyDown: (w) => {
            w.key === "Enter" && !w.nativeEvent.isComposing && (w.preventDefault(), K());
          }
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx(
      "textarea",
      {
        className: "td-add-editor-desc",
        value: l,
        placeholder: "Description",
        rows: l.includes(`
`) ? 3 : 1,
        onChange: (w) => b(w.target.value),
        onKeyDown: (w) => {
          w.key === "Enter" && (w.metaKey || w.ctrlKey) && (w.preventDefault(), K());
        }
      }
    ),
    (V || n) && /* @__PURE__ */ e.jsx("div", { className: "td-add-editor-hint", children: V ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      "Adds “",
      /* @__PURE__ */ e.jsx("b", { children: V }),
      "”"
    ] }) : n }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-qa-chips", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: R.due, type: "button", className: `td-qa-chip${g ? " is-set" : ""}`, onClick: () => m("due"), children: [
        /* @__PURE__ */ e.jsx(Ie, { size: 13 }),
        g || "Date"
      ] }),
      /* @__PURE__ */ e.jsxs("button", { ref: R.priority, type: "button", className: `td-qa-chip${p > 1 ? " is-set" : ""}`, onClick: () => m("priority"), children: [
        /* @__PURE__ */ e.jsx(Ae, { size: 13, color: p === 1 ? "var(--td-muted)" : be[p] }),
        p > 1 ? `P${5 - p}` : "Priority"
      ] }),
      /* @__PURE__ */ e.jsxs("button", { ref: R.labels, type: "button", className: `td-qa-chip${S.length ? " is-set" : ""}`, onClick: () => m("labels"), children: [
        /* @__PURE__ */ e.jsx(ge, { size: 13 }),
        S.length ? S.join(", ") : "Labels"
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-add-editor-foot", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: R.project, type: "button", className: "td-qa-project", onClick: () => m("project"), children: [
        P?.isInbox || !P ? /* @__PURE__ */ e.jsx(xe, { size: 14 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: O(P.color) } }),
        P?.name ?? "Inbox",
        B ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
          " / ",
          B.name
        ] }) : null
      ] }),
      /* @__PURE__ */ e.jsx("span", { className: "td-flex" }),
      /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: L, children: "Cancel" }),
      /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-primary", disabled: !y.trim(), onClick: () => void K(), children: "Add task" })
    ] }),
    D === "due" && /* @__PURE__ */ e.jsx(Ke, { anchor: R.due.current, current: g, onPick: k, onClose: () => m(null) }),
    D === "priority" && /* @__PURE__ */ e.jsx(He, { anchor: R.priority.current, current: p, onPick: (w) => C(w), onClose: () => m(null) }),
    D === "labels" && t && /* @__PURE__ */ e.jsx(ot, { anchor: R.labels.current, labels: t.labels, selected: S, onChange: M, onCreate: d, onClose: () => m(null) }),
    D === "project" && t && /* @__PURE__ */ e.jsx(lt, { anchor: R.project.current, meta: t, current: N ?? void 0, onPick: $, onClose: () => m(null) })
  ] });
});
function es(r) {
  return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
}
function ts(r) {
  return r instanceof Element && !!r.closest('button, a[href], summary, select, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="option"], [role="checkbox"], [role="tab"], [role="switch"]');
}
function ss(r, t) {
  switch (r.kind) {
    case "today":
      return "Today";
    case "upcoming":
      return "Upcoming";
    case "inbox":
      return "Inbox";
    case "completed":
      return "Completed";
    case "search":
      return `Search: ${r.query ?? ""}`;
    case "label":
      return `@${r.query ?? ""}`;
    case "filter":
      return t?.filters.find((s) => s.id === r.id)?.name ?? "Filter";
    case "project":
      return t?.projects.find((s) => s.id === r.id)?.name ?? "Project";
  }
}
function ns(r, t, s, n, i) {
  const d = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), f = new Set(t.map((y) => y.id));
  for (const y of t) y.parentId && f.has(y.parentId) && a.set(y.parentId, (a.get(y.parentId) ?? 0) + 1);
  if (r.kind === "today") return { groups: Qt(t, s), depths: d, childCounts: a };
  if (r.kind === "upcoming") return { groups: Ut(t, s), depths: d, childCounts: a };
  if (r.kind === "completed") return { groups: Gt(t, s), depths: d, childCounts: a };
  if ((r.kind === "project" || r.kind === "inbox") && i) {
    const y = (n?.sections ?? []).filter((k) => k.projectId === i), o = /* @__PURE__ */ new Map();
    for (const k of t) {
      const p = k.sectionId && y.some((S) => S.id === k.sectionId) ? k.sectionId : null, C = o.get(p) ?? [];
      C.push(k), o.set(p, C);
    }
    const l = (k) => {
      const p = new Set(k.map((N) => N.id)), C = k.filter((N) => !N.parentId || !p.has(N.parentId)).sort((N, $) => N.order - $.order), S = [], M = (N, $) => {
        S.push(N), d.set(N.id, $), k.filter((D) => D.parentId === N.id).sort((D, m) => D.order - m.order).forEach((D) => M(D, Math.min($ + 1, 4)));
      };
      return C.forEach((N) => M(N, 0)), S;
    }, b = [], g = o.get(null) ?? [];
    (g.length || !y.length) && b.push({ key: "all", title: "", tasks: l(g) });
    for (const k of y)
      b.push({ key: k.id, title: k.name, tasks: l(o.get(k.id) ?? []) });
    return { groups: b.filter((k) => k.tasks.length || k.key !== "all"), depths: d, childCounts: a };
  }
  return { groups: [{ key: "all", title: "", tasks: [...t].sort((y, o) => o.priority - y.priority || (y.due?.date ?? "9999").localeCompare(o.due?.date ?? "9999") || y.order - o.order) }], depths: d, childCounts: a };
}
function is({ view: r }) {
  const t = {
    today: ["You’re all done for today", "Enjoy the rest of your day — or add something below."],
    upcoming: ["Nothing scheduled in the next two weeks", "Tasks with a due date show up here."],
    inbox: ["Inbox zero", "New tasks without a project land here."],
    completed: ["No completed tasks yet", "Tasks you complete show up here."],
    search: ["No matching tasks", "Search looks at task names."]
  }, [s, n] = t[r.kind] ?? ["No tasks here", "Add one with the bar above."];
  return /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
    /* @__PURE__ */ e.jsxs("svg", { width: "96", height: "72", viewBox: "0 0 96 72", "aria-hidden": "true", className: "td-empty-art", children: [
      /* @__PURE__ */ e.jsx("rect", { x: "14", y: "10", width: "68", height: "52", rx: "10", fill: "var(--td-surface-hi)" }),
      /* @__PURE__ */ e.jsx("circle", { cx: "32", cy: "30", r: "6", fill: "none", stroke: "var(--td-accent)", strokeWidth: "2.5" }),
      /* @__PURE__ */ e.jsx("path", { d: "m29.4 30.2 2 2 3.6-3.8", fill: "none", stroke: "var(--td-accent)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }),
      /* @__PURE__ */ e.jsx("rect", { x: "44", y: "27", width: "26", height: "5", rx: "2.5", fill: "var(--td-border-hi)" }),
      /* @__PURE__ */ e.jsx("rect", { x: "26", y: "44", width: "44", height: "5", rx: "2.5", fill: "var(--td-border)" })
    ] }),
    /* @__PURE__ */ e.jsx("p", { className: "td-empty-title", children: s }),
    /* @__PURE__ */ e.jsx("p", { className: "td-dim", children: n })
  ] });
}
function rs() {
  return /* @__PURE__ */ e.jsx("div", { className: "td-skeleton-list", "aria-busy": "true", children: [78, 52, 64, 40, 70].map((r, t) => /* @__PURE__ */ e.jsxs("div", { className: "td-task is-skeleton", children: [
    /* @__PURE__ */ e.jsx("span", { className: "td-checkbox" }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${r}%` } }),
      /* @__PURE__ */ e.jsx("span", { className: "td-skel sm", style: { width: `${r / 2}%` } })
    ] })
  ] }, t)) });
}
function as({ target: r, onCancel: t, onConfirm: s }) {
  const n = h.useRef(null), i = h.useRef(t);
  i.current = t;
  const [d] = h.useState(() => document.activeElement);
  h.useEffect(() => {
    const y = (o) => {
      if (o.key === "Escape")
        o.preventDefault(), o.stopPropagation(), i.current();
      else if (o.key === "Tab") {
        const l = [...n.current?.querySelectorAll("button") ?? []];
        if (!l.length) return;
        o.preventDefault();
        const b = l.indexOf(document.activeElement);
        l[(b + (o.shiftKey ? -1 : 1) + l.length) % l.length].focus();
      }
    };
    return document.addEventListener("keydown", y, !0), () => {
      document.removeEventListener("keydown", y, !0), d?.isConnected && d.focus();
    };
  }, []);
  const { task: a, subtasks: f } = r, j = f === null ? " and any sub-tasks" : f > 0 ? ` and its ${f} sub-task${f > 1 ? "s" : ""} (with anything nested under them)` : "";
  return /* @__PURE__ */ e.jsx("div", { className: "td-modal-scrim", onClick: t, children: /* @__PURE__ */ e.jsxs("div", { ref: n, className: "td-help td-delete", onClick: (y) => y.stopPropagation(), role: "dialog", "aria-modal": "true", "aria-label": "Delete task", children: [
    /* @__PURE__ */ e.jsx("div", { className: "td-help-head", children: /* @__PURE__ */ e.jsx("h2", { children: "Delete task?" }) }),
    /* @__PURE__ */ e.jsxs("p", { children: [
      a ? `“${a.content}”` : "This task",
      j,
      " will be deleted. This cannot be undone."
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-delete-actions", children: [
      /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: t, children: "Cancel" }),
      /* @__PURE__ */ e.jsxs("button", { className: "td-btn td-btn-danger", autoFocus: !0, onClick: s, children: [
        /* @__PURE__ */ e.jsx(_e, { size: 13 }),
        " Delete"
      ] })
    ] })
  ] }) });
}
function os({ onClose: r }) {
  const t = [
    ["q / a", "Add task"],
    ["/", "Search"],
    ["j / k  ↓ / ↑", "Move between tasks"],
    ["Enter / o", "Open task"],
    ["x / Space", "Complete / reopen"],
    ["1 – 4", "Set priority"],
    ["t", "Schedule for today"],
    ["⌫ / Delete", "Delete task (asks first)"],
    ["r", "Refresh"],
    ["[", "Toggle sidebar"],
    ["Esc", "Close help / task / search"],
    ["⌘⌥T", "Quick Add from anywhere in Agent Code"]
  ];
  return /* @__PURE__ */ e.jsx("div", { className: "td-modal-scrim", onClick: r, children: /* @__PURE__ */ e.jsxs("div", { className: "td-help", onClick: (s) => s.stopPropagation(), role: "dialog", "aria-label": "Keyboard shortcuts", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-help-head", children: [
      /* @__PURE__ */ e.jsx("h2", { children: "Keyboard shortcuts" }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: r, children: /* @__PURE__ */ e.jsx(oe, {}) })
    ] }),
    /* @__PURE__ */ e.jsx("dl", { children: t.map(([s, n]) => /* @__PURE__ */ e.jsxs("div", { children: [
      /* @__PURE__ */ e.jsx("dt", { children: s.split("  ").map((i) => /* @__PURE__ */ e.jsx("kbd", { children: i }, i)) }),
      /* @__PURE__ */ e.jsx("dd", { children: n })
    ] }, s)) })
  ] }) });
}
function ls() {
  const [r, t] = h.useState([]), s = h.useRef(/* @__PURE__ */ new Map()), n = (a) => {
    clearTimeout(s.current.get(a)), t((f) => f.map((j) => j.id === a ? { ...j, leaving: !0 } : j)), setTimeout(() => t((f) => f.filter((j) => j.id !== a)), 160);
  }, i = (a, f) => {
    clearTimeout(s.current.get(a)), s.current.set(a, setTimeout(() => n(a), f));
  }, d = (a, f = {}) => {
    const j = f.action ? 6e3 : f.tone === "error" ? 7e3 : 3e3;
    if (f.completion && f.action) {
      const o = f.action.run;
      let l = null;
      if (t((g) => {
        const k = g.find((C) => C.undos && !C.leaving);
        if (!k) return g;
        l = k.id;
        const p = [...k.undos, o];
        return g.map((C) => C.id === k.id ? { ...C, message: `${p.length} tasks completed`, undos: p, action: { label: "Undo", run: () => p.forEach((S) => S()) } } : C);
      }), l !== null) {
        i(l, j);
        return;
      }
      const b = Date.now() + Math.random();
      t((g) => [...g.filter((k) => !k.leaving).slice(-2), { id: b, message: a, tone: f.tone, action: f.action, undos: [o] }]), i(b, j);
      return;
    }
    const y = Date.now() + Math.random();
    t((o) => [...o.filter((l) => !l.leaving).slice(-2), { id: y, message: a, tone: f.tone, action: f.action }]), i(y, j);
  };
  return h.useEffect(() => () => {
    for (const a of s.current.values()) clearTimeout(a);
  }, []), { toasts: r, toast: d, dismiss: n };
}
function cs({ toasts: r, onDismiss: t }) {
  return /* @__PURE__ */ e.jsx("div", { className: "td-toasts", "aria-live": "polite", children: r.map((s) => /* @__PURE__ */ e.jsxs("div", { className: `td-toast${s.tone === "error" ? " is-error" : ""}${s.leaving ? " is-leaving" : ""}`, children: [
    /* @__PURE__ */ e.jsx("span", { children: s.message }),
    s.action && /* @__PURE__ */ e.jsx("button", { onClick: () => {
      s.action.run(), t(s.id);
    }, children: s.action.label }),
    /* @__PURE__ */ e.jsx("button", { className: "td-toast-close", "aria-label": "Dismiss", onClick: () => t(s.id), children: /* @__PURE__ */ e.jsx(oe, { size: 11 }) })
  ] }, s.id)) });
}
function xt(r, t) {
  return r.kind === t.kind && (r.id ?? null) === (t.id ?? null) && (r.query ?? null) === (t.query ?? null);
}
function ds({ meta: r, current: t, counts: s, user: n, onSelect: i, onSearch: d, onAddTask: a, onCreateProject: f, onCreateLabel: j, onSignOut: y }) {
  const [o, l] = h.useState({ favorites: !0, projects: !0, labels: !1, filters: !1 }), [b, g] = h.useState(null), [k, p] = h.useState(""), [C, S] = h.useState("charcoal"), M = r?.projects.find((m) => m.isInbox), N = (m, E, F, R, W) => /* @__PURE__ */ e.jsxs(
    "button",
    {
      className: `td-nav-item${xt(t, m) ? " is-active" : ""}`,
      onClick: () => i(m),
      title: F,
      children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", style: W ? { color: W } : void 0, children: E }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: F }),
        R ? /* @__PURE__ */ e.jsx("span", { className: "td-nav-count", children: R }) : null
      ]
    },
    `${m.kind}:${m.id ?? m.query ?? ""}`
  ), $ = [
    ...r?.projects.filter((m) => m.isFavorite && !m.isInbox).map((m) => N({ kind: "project", id: m.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: O(m.color) } }), m.name)) ?? [],
    ...r?.labels.filter((m) => m.isFavorite).map((m) => N({ kind: "label", query: m.name }, /* @__PURE__ */ e.jsx(ge, {}), m.name, null, O(m.color))) ?? [],
    ...r?.filters.filter((m) => m.isFavorite).map((m) => N({ kind: "filter", id: m.id, query: m.query }, /* @__PURE__ */ e.jsx(Xe, {}), m.name, null, O(m.color))) ?? []
  ], D = async (m) => {
    m.preventDefault();
    const E = k.trim();
    !E || !(b === "project" ? await f(E, C) : b === "label" && await j(E)) || (p(""), g(null));
  };
  return /* @__PURE__ */ e.jsxs("nav", { className: "td-sidebar", "aria-label": "Todoist navigation", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
      a && /* @__PURE__ */ e.jsxs("button", { className: "td-nav-item td-nav-addtask", onClick: a, title: "Add task (q)", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon td-nav-add-icon", children: /* @__PURE__ */ e.jsx(fe, { size: 14 }) }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: "Add task" })
      ] }),
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-item", onClick: d, title: "Search (/)", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-icon", children: /* @__PURE__ */ e.jsx(ct, {}) }),
        /* @__PURE__ */ e.jsx("span", { className: "td-nav-label", children: "Search" }),
        /* @__PURE__ */ e.jsx("kbd", { children: "/" })
      ] }),
      N({ kind: "inbox" }, /* @__PURE__ */ e.jsx(xe, {}), "Inbox", s.inbox, "#246fe0"),
      N({ kind: "today" }, /* @__PURE__ */ e.jsx(qt, {}), "Today", s.today, "#058527"),
      N({ kind: "upcoming" }, /* @__PURE__ */ e.jsx(At, {}), "Upcoming", null, "#692fc2"),
      N({ kind: "completed" }, /* @__PURE__ */ e.jsx(zt, {}), "Completed", null, "#eb8909")
    ] }),
    $.length > 0 && /* @__PURE__ */ e.jsx(De, { title: "Favorites", open: o.favorites, onToggle: () => l((m) => ({ ...m, favorites: !m.favorites })), children: $ }),
    /* @__PURE__ */ e.jsxs(
      De,
      {
        title: "My Projects",
        open: o.projects,
        onToggle: () => l((m) => ({ ...m, projects: !m.projects })),
        onAdd: () => {
          g("project"), p(""), l((m) => ({ ...m, projects: !0 }));
        },
        children: [
          !r && /* @__PURE__ */ e.jsx(us, {}),
          r && Tt(r.projects).filter(({ project: m }) => m.id !== M?.id).map(({ project: m, depth: E }) => /* @__PURE__ */ e.jsx("div", { style: { paddingLeft: E * 12 }, children: N({ kind: "project", id: m.id }, /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: O(m.color) } }), m.name) }, m.id)),
          b === "project" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (m) => void D(m), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: k, onChange: (m) => p(m.target.value), placeholder: "Project name", onKeyDown: (m) => {
              m.key === "Escape" && (m.preventDefault(), m.stopPropagation(), g(null));
            } }),
            /* @__PURE__ */ e.jsx("div", { className: "td-swatches", children: $t.map((m) => /* @__PURE__ */ e.jsx("button", { type: "button", title: m.replace("_", " "), className: `td-swatch${m === C ? " is-on" : ""}`, style: { background: O(m) }, onClick: () => S(m) }, m)) }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => g(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !k.trim(), children: "Add project" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ e.jsxs(
      De,
      {
        title: "Labels",
        open: o.labels,
        onToggle: () => l((m) => ({ ...m, labels: !m.labels })),
        onAdd: () => {
          g("label"), p(""), l((m) => ({ ...m, labels: !0 }));
        },
        children: [
          r?.labels.map((m) => N({ kind: "label", query: m.name }, /* @__PURE__ */ e.jsx(ge, {}), m.name, null, O(m.color))),
          r && !r.labels.length && b !== "label" && /* @__PURE__ */ e.jsx("div", { className: "td-nav-empty", children: "No labels" }),
          b === "label" && /* @__PURE__ */ e.jsxs("form", { className: "td-nav-add", onSubmit: (m) => void D(m), children: [
            /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: k, onChange: (m) => p(m.target.value), placeholder: "Label name", onKeyDown: (m) => {
              m.key === "Escape" && (m.preventDefault(), m.stopPropagation(), g(null));
            } }),
            /* @__PURE__ */ e.jsxs("div", { className: "td-nav-add-actions", children: [
              /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => g(null), children: "Cancel" }),
              /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !k.trim(), children: "Add label" })
            ] })
          ] })
        ]
      }
    ),
    r && r.filters.length > 0 && /* @__PURE__ */ e.jsx(De, { title: "Filters", open: o.filters, onToggle: () => l((m) => ({ ...m, filters: !m.filters })), children: r.filters.map((m) => N({ kind: "filter", id: m.id, query: m.query }, /* @__PURE__ */ e.jsx(Xe, {}), m.name, null, O(m.color))) }),
    n && /* @__PURE__ */ e.jsxs("div", { className: "td-account", children: [
      /* @__PURE__ */ e.jsx("span", { className: "td-avatar", children: (n.fullName || n.email || "?").slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ e.jsxs("span", { className: "td-account-text", children: [
        /* @__PURE__ */ e.jsx("span", { children: n.fullName || n.email }),
        n.readOnly && /* @__PURE__ */ e.jsx("span", { className: "td-dim td-small", children: "Read-only" })
      ] }),
      /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Sign out of td", onClick: y, children: /* @__PURE__ */ e.jsx(Mt, { size: 13 }) })
    ] })
  ] });
}
function De({ title: r, open: t, onToggle: s, onAdd: n, children: i }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "td-nav-group", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-nav-heading", children: [
      /* @__PURE__ */ e.jsxs("button", { className: "td-nav-heading-btn", onClick: s, "aria-expanded": t, children: [
        /* @__PURE__ */ e.jsx(Pt, { size: 12, className: t ? "" : "is-collapsed" }),
        r
      ] }),
      n && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: `Add ${r.toLowerCase().replace("my ", "").replace(/s$/, "")}`, onClick: n, children: /* @__PURE__ */ e.jsx(fe, { size: 12 }) })
    ] }),
    t && i
  ] });
}
function us() {
  return /* @__PURE__ */ e.jsx(e.Fragment, { children: [70, 55, 80].map((r) => /* @__PURE__ */ e.jsx("div", { className: "td-nav-item", children: /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: `${r}%` } }) }, r)) });
}
class hs {
  tasks = /* @__PURE__ */ new Map();
  overlay = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  hidden = /* @__PURE__ */ new Set();
  phases = /* @__PURE__ */ new Map();
  queries = /* @__PURE__ */ new Map();
  details = /* @__PURE__ */ new Map();
  /** Lists each hidden task was in, so Undo puts it back where it was. */
  hiddenFrom = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  writeQueues = /* @__PURE__ */ new Map();
  /** When each task last changed locally or through the feed. A list or
   *  detail response whose request STARTED before that is older than what we
   *  show, and must not overwrite it (review: an old detail reply undid a
   *  newer rename in the drawer). */
  touched = /* @__PURE__ */ new Map();
  removedAt = /* @__PURE__ */ new Map();
  version = 0;
  lastSeq = 0;
  subscribe = (t) => (this.listeners.add(t), () => {
    this.listeners.delete(t);
  });
  getVersion = () => this.version;
  emit() {
    this.version++;
    for (const t of this.listeners) t();
  }
  // ---- reading -------------------------------------------------------------
  /** A task as the user should see it: server truth plus pending edits. */
  task(t) {
    const s = this.tasks.get(t);
    if (!s) return;
    const n = this.overlay.get(t);
    return n ? { ...s, ...n } : s;
  }
  query(t) {
    return this.queries.get(t);
  }
  isHidden(t) {
    return this.hidden.has(t);
  }
  phase(t) {
    return this.phases.get(t);
  }
  isPending(t) {
    return (this.pending.get(t) ?? 0) > 0;
  }
  detail(t) {
    return this.details.get(t);
  }
  /**
   * The rows a list shows right now. Pending edits are applied, hidden tasks
   * are left out, and a task an optimistic edit moved OUT of the list (Today →
   * tomorrow) leaves at once instead of waiting for the server.
   */
  rows(t, s) {
    const n = this.queries.get(t);
    if (!n) return [];
    const i = [];
    for (const d of n.ids) {
      if (this.hidden.has(d) && !this.phases.has(d)) continue;
      const a = this.task(d);
      a && (this.overlay.has(d) && Yt(n.query, a, s) === "out" || i.push(a));
    }
    return i;
  }
  // ---- server data ---------------------------------------------------------
  ensureQuery(t) {
    const s = ae(t);
    let n = this.queries.get(s);
    return n || (n = { query: { kind: t.kind, id: t.id, query: t.query }, ids: [], cursor: null, truncated: !1, status: "empty", error: null, pages: 0, refreshing: !1, fetchedAt: 0 }, this.queries.set(s, n)), n;
  }
  setRefreshing(t, s) {
    const n = this.ensureQuery(t);
    n.refreshing !== s && (this.queries.set(ae(t), { ...n, refreshing: s }), this.emit());
  }
  /**
   * Install fetched pages. `pages` is the full set fetched for a refresh (so
   * the ids are exactly the server's), or one page to append.
   */
  setPages(t, s, n, i = Date.now()) {
    const d = this.ensureQuery(t), a = (l) => (this.touched.get(l) ?? 0) > i;
    for (const l of s) for (const b of l.tasks) a(b.id) || this.tasks.set(b.id, b);
    const f = s.flatMap((l) => l.tasks.map((b) => b.id)).filter((l) => !((this.removedAt.get(l) ?? 0) > i)), j = s.at(-1), y = n === "replace" ? d.ids.filter((l) => a(l) && !f.includes(l)) : [], o = n === "append" ? [...d.ids, ...f.filter((l) => !d.ids.includes(l))] : ms([...f, ...y]);
    for (const l of [...this.hidden]) !this.phases.has(l) && !o.includes(l) && this.forgetHidden(l);
    this.queries.set(ae(t), {
      ...d,
      ids: o,
      cursor: j?.nextCursor ?? null,
      truncated: j?.truncated ?? !1,
      status: "ready",
      error: null,
      pages: n === "append" ? d.pages + 1 : Math.max(1, s.length),
      refreshing: !1,
      fetchedAt: Date.now()
    }), this.emit();
  }
  setError(t, s) {
    const n = this.ensureQuery(t);
    this.queries.set(ae(t), { ...n, error: s, refreshing: !1, status: n.status === "ready" ? "ready" : "error" }), this.emit();
  }
  setDetail(t, s = Date.now()) {
    const n = (f) => (this.touched.get(f) ?? 0) > s, i = this.details.get(t.task.id);
    n(t.task.id) || this.tasks.set(t.task.id, t.task);
    for (const f of t.children) n(f.id) || this.tasks.set(f.id, f);
    const d = this.tasks.get(t.task.id) ?? t.task;
    let a = t.comments;
    for (const f of i?.comments ?? []) a = $e(a, f);
    this.details.set(t.task.id, { task: d, children: t.children.map((f) => this.tasks.get(f.id) ?? f), comments: a }), this.emit();
  }
  /** Apply one change from the runtime's feed (another view's edit, or this
   *  view's own edit confirmed). Idempotent: applying it twice is harmless. */
  applyChange(t, s) {
    if (t.seq <= this.lastSeq || (this.lastSeq = t.seq, t.kind === "meta")) return;
    const n = Date.now();
    if (t.kind === "upsert" && this.touched.set(t.task.id, n), t.kind === "remove" && (this.touched.set(t.id, n), this.removedAt.set(t.id, n)), t.kind === "comment") {
      const i = this.tasks.get(t.taskId);
      i && this.tasks.set(i.id, { ...i, commentCount: i.commentCount + 1 });
      const d = this.details.get(t.taskId);
      d && this.details.set(t.taskId, { ...d, comments: $e(d.comments, t.comment) }), this.emit();
      return;
    }
    if (t.kind === "upsert") {
      const i = this.tasks.get(t.task.id), d = i && i.description.length > t.task.description.length && t.task.description.endsWith("…") ? { ...t.task, description: i.description } : t.task;
      this.tasks.set(d.id, d);
      const a = this.details.get(d.id);
      if (a && this.details.set(d.id, { ...a, task: d }), d.parentId) {
        const f = this.details.get(d.parentId);
        f && this.details.set(d.parentId, { ...f, children: Ze(f.children, d) });
      }
    }
    if (t.kind === "remove") {
      t.task && this.tasks.set(t.id, t.task);
      for (const i of this.details.values())
        i.children.some((d) => d.id === t.id) && this.details.set(i.task.id, { ...i, children: i.children.filter((d) => d.id !== t.id) });
    }
    for (const [i, d] of this.queries) {
      const a = Xt(d.ids, d.query, t, s, (f) => this.tasks.get(f)?.parentId ?? null);
      a !== d.ids && this.queries.set(i, { ...d, ids: a });
    }
    t.kind === "remove" && !this.phases.has(t.id) && this.forgetHidden(t.id), this.emit();
  }
  /** A comment this view just posted (the feed may deliver it too; upserted
   *  by id either way). */
  addComment(t, s) {
    const n = this.details.get(t);
    n && this.details.set(t, { ...n, comments: $e(n.comments, s) }), this.emit();
  }
  /** A sub-task this view just created. */
  addChild(t, s) {
    this.tasks.set(s.id, s), this.touched.set(s.id, Date.now());
    const n = this.details.get(t);
    n && this.details.set(t, { ...n, children: Ze(n.children, s) }), this.emit();
  }
  /** Put a task into a list now (a quick add's pending row, a server row we
   *  know belongs there). */
  insert(t, s) {
    const n = this.ensureQuery(t);
    this.tasks.set(s.id, s), this.touched.set(s.id, Date.now()), n.ids.includes(s.id) || this.queries.set(ae(t), { ...n, ids: [...n.ids, s.id] }), this.emit();
  }
  /** Drop a task everywhere (a pending row being replaced by the real one). */
  drop(t) {
    this.tasks.delete(t);
    for (const [s, n] of this.queries) n.ids.includes(t) && this.queries.set(s, { ...n, ids: n.ids.filter((i) => i !== t) });
    this.emit();
  }
  // ---- optimistic edits ----------------------------------------------------
  /**
   * Show an edit at once and run it in order with the task's other writes.
   *
   * Writes to one task are SERIALIZED: pressing 1 then 4 must leave the task
   * at p4 on the server, which two concurrent requests do not guarantee
   * (review: they landed p1). The overlay stays until the task's last write
   * settles; by then the change feed has delivered the server's version.
   */
  edit(t, s, n) {
    return this.overlay.set(t, { ...this.overlay.get(t), ...s }), this.pending.set(t, (this.pending.get(t) ?? 0) + 1), this.touched.set(t, Date.now()), this.emit(), this.serialize(t, n).finally(() => {
      const i = (this.pending.get(t) ?? 1) - 1;
      if (i > 0) {
        this.pending.set(t, i);
        return;
      }
      this.pending.delete(t), this.overlay.delete(t), this.emit();
    });
  }
  /** Run `send` after every earlier write to the same task. */
  serialize(t, s) {
    const i = (this.writeQueues.get(t) ?? Promise.resolve()).then(s, s), d = i.catch(() => {
    });
    return this.writeQueues.set(t, d), d.then(() => {
      this.writeQueues.get(t) === d && this.writeQueues.delete(t);
    }), i;
  }
  setPhase(t, s) {
    s ? this.phases.set(t, s) : this.phases.delete(t), this.emit();
  }
  /** Take a task (and its sub-tasks) out of every list until confirmed or undone. */
  hide(t) {
    const s = /* @__PURE__ */ new Set([t]);
    for (let n = !0; n; ) {
      n = !1;
      for (const i of this.tasks.values()) i.parentId && s.has(i.parentId) && !s.has(i.id) && (s.add(i.id), n = !0);
    }
    for (const n of s)
      this.touched.set(n, Date.now()), this.hidden.add(n), this.hiddenFrom.set(n, [...this.queries].filter(([, i]) => i.ids.includes(n)).map(([i]) => i));
    return this.emit(), [...s];
  }
  /** Undo / failure: the task comes back to the lists it was in, at once. */
  unhide(t) {
    const s = [t, ...[...this.hidden].filter((n) => this.isDescendant(n, t))];
    for (const n of s) {
      this.hidden.delete(n), this.phases.delete(n);
      for (const i of this.hiddenFrom.get(n) ?? []) {
        const d = this.queries.get(i);
        d && !d.ids.includes(n) && this.queries.set(i, { ...d, ids: [...d.ids, n] });
      }
      this.hiddenFrom.delete(n);
    }
    this.emit();
  }
  forgetHidden(t) {
    this.hidden.delete(t), this.hiddenFrom.delete(t);
  }
  isDescendant(t, s) {
    for (let n = this.tasks.get(t)?.parentId; n; n = this.tasks.get(n)?.parentId)
      if (n === s) return !0;
    return !1;
  }
}
function ms(r) {
  return [...new Set(r)];
}
function $e(r, t) {
  return r.some((s) => s.id === t.id) ? r.map((s) => s.id === t.id ? t : s) : [...r, t];
}
function Ze(r, t) {
  return t.completedAt ? r.filter((s) => s.id !== t.id) : r.some((s) => s.id === t.id) ? r.map((s) => s.id === t.id ? t : s) : [...r, t];
}
const v = new hs();
function jt() {
  return h.useSyncExternalStore(v.subscribe, v.getVersion), v;
}
function et(r, t = /* @__PURE__ */ new Date()) {
  const s = (d) => {
    const a = new Date(t);
    return a.setDate(a.getDate() + d), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
  }, n = r.trim().toLowerCase();
  if (n === "" || n === "no date") return null;
  if (n === "today") return { date: s(0), datetime: null, string: "today", recurring: !1 };
  if (n === "tomorrow") return { date: s(1), datetime: null, string: "tomorrow", recurring: !1 };
  const i = t.getDay();
  if (n === "saturday") return { date: s((6 - i + 7) % 7 || 7), datetime: null, string: "Saturday", recurring: !1 };
  if (n === "next monday") return { date: s((1 - i + 7) % 7 || 7), datetime: null, string: "next Monday", recurring: !1 };
}
const Me = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"]))/g;
function ue(r, t, s = "i") {
  const n = [];
  let i = 0, d = 0;
  Me.lastIndex = 0;
  for (let a = Me.exec(r); a; a = Me.exec(r)) {
    a.index > i && n.push(r.slice(i, a.index));
    const f = `${s}${d++}`;
    a[2] || a[3] ? n.push(/* @__PURE__ */ e.jsx("strong", { children: a[2] ?? a[3] }, f)) : a[4] || a[5] ? n.push(/* @__PURE__ */ e.jsx("em", { children: a[4] ?? a[5] }, f)) : a[6] ? n.push(/* @__PURE__ */ e.jsx("code", { children: a[6] }, f)) : a[7] && a[8] ? n.push(/* @__PURE__ */ e.jsx(tt, { url: a[8], open: t, children: a[7] }, f)) : a[9] && n.push(/* @__PURE__ */ e.jsx(tt, { url: a[9], open: t, children: ps(a[9]) }, f)), i = a.index + a[0].length;
  }
  return i < r.length && n.push(r.slice(i)), n;
}
function ps(r) {
  try {
    const t = new URL(r), s = t.pathname.length > 28 ? `${t.pathname.slice(0, 26)}…` : t.pathname;
    return `${t.hostname.replace(/^www\./, "")}${s === "/" ? "" : s}`;
  } catch {
    return r;
  }
}
function tt({ url: r, open: t, children: s }) {
  return /* @__PURE__ */ e.jsx(
    "a",
    {
      className: "td-link",
      href: r,
      title: r,
      onClick: (n) => {
        n.preventDefault(), n.stopPropagation(), t(r);
      },
      children: s
    }
  );
}
function st({ text: r, open: t }) {
  const s = r.replace(/\r\n/g, `
`).split(`
`), n = [];
  let i = 0, d = 0;
  for (; i < s.length; ) {
    const a = s[i];
    if (a.startsWith("```")) {
      const j = [];
      for (i++; i < s.length && !s[i].startsWith("```"); ) j.push(s[i++]);
      i++, n.push(/* @__PURE__ */ e.jsx("pre", { className: "td-md-pre", children: /* @__PURE__ */ e.jsx("code", { children: j.join(`
`) }) }, d++));
      continue;
    }
    if (/^\s*[-*]\s+/.test(a)) {
      const j = [];
      for (; i < s.length && /^\s*[-*]\s+/.test(s[i]); ) j.push(s[i++].replace(/^\s*[-*]\s+/, ""));
      n.push(/* @__PURE__ */ e.jsx("ul", { children: j.map((y, o) => /* @__PURE__ */ e.jsx("li", { children: ue(y, t, `l${d}-${o}`) }, o)) }, d++));
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(a)) {
      const j = [];
      for (; i < s.length && /^\s*\d+[.)]\s+/.test(s[i]); ) j.push(s[i++].replace(/^\s*\d+[.)]\s+/, ""));
      n.push(/* @__PURE__ */ e.jsx("ol", { children: j.map((y, o) => /* @__PURE__ */ e.jsx("li", { children: ue(y, t, `o${d}-${o}`) }, o)) }, d++));
      continue;
    }
    if (a.startsWith("> ")) {
      const j = [];
      for (; i < s.length && s[i].startsWith("> "); ) j.push(s[i++].slice(2));
      n.push(/* @__PURE__ */ e.jsx("blockquote", { children: ue(j.join(" "), t, `q${d}`) }, d++));
      continue;
    }
    if (!a.trim()) {
      i++;
      continue;
    }
    const f = [];
    for (; i < s.length && s[i].trim() && !/^(```|\s*[-*]\s+|\s*\d+[.)]\s+|> )/.test(s[i]); ) f.push(s[i++]);
    n.push(
      /* @__PURE__ */ e.jsx("p", { children: f.map((j, y) => /* @__PURE__ */ e.jsxs(h.Fragment, { children: [
        y > 0 && /* @__PURE__ */ e.jsx("br", {}),
        ue(j, t, `p${d}-${y}`)
      ] }, y)) }, d++)
    );
  }
  return /* @__PURE__ */ e.jsx("div", { className: "td-md", children: n });
}
function fs(r) {
  const t = h.useRef(/* @__PURE__ */ new Map()), s = h.useCallback(async (i, d = {}) => {
    const a = ae(i), f = (t.current.get(a) ?? 0) + 1;
    t.current.set(a, f);
    const j = () => t.current.get(a) === f, y = v.ensureQuery(i), o = Date.now();
    if (y.status === "empty" && d.cacheFirst) {
      const l = await r.call("list", { ...i, cursor: null, cached: !0 }).catch(() => null);
      l && j() && v.query(a)?.status === "empty" && v.setPages(i, [l], "replace", o);
    }
    v.setRefreshing(i, !0);
    try {
      const l = Math.max(1, v.query(a)?.pages ?? 1), b = [];
      let g = null;
      for (let k = 0; k < l; k++) {
        const p = await r.call("list", { ...i, cursor: g });
        if (b.push(p), g = p.nextCursor, !g || !j()) break;
      }
      j() && v.setPages(i, b, "replace", o);
    } catch (l) {
      throw j() && v.setError(i, ye(l)), l;
    }
  }, [r]), n = h.useCallback(async (i) => {
    const d = ae(i), a = v.query(d);
    if (!a?.cursor || a.refreshing) return;
    const f = t.current.get(d) ?? 0, j = Date.now(), y = await r.call("list", { ...i, cursor: a.cursor });
    (t.current.get(d) ?? 0) === f && v.setPages(i, [y], "append", j);
  }, [r]);
  return { revalidate: s, loadMore: n };
}
function xs(r, t) {
  const [s, n] = h.useState(null), [i, d] = h.useState({}), a = h.useRef(/* @__PURE__ */ new Map()), f = h.useRef(t);
  h.useEffect(() => {
    let o = !0;
    return (async () => {
      if (!s) {
        const b = await r.call("meta", { cached: !0 }).catch(() => null);
        b && o && n((g) => g ?? b);
      }
      const l = await r.call("meta", {}).catch(() => null);
      l && o && n(l);
    })(), () => {
      o = !1;
    };
  }, [r, t]);
  const j = h.useCallback((o, l = !1) => {
    if (!l && (i[o] || a.current.has(o))) return;
    const b = r.call("sections", { projectId: o }).then(
      (g) => d((k) => js(k[o], g) ? k : { ...k, [o]: g }),
      () => {
      }
    ).finally(() => a.current.delete(o));
    a.current.set(o, b);
  }, [r, i]);
  return h.useEffect(() => {
    if (f.current !== t) {
      f.current = t;
      for (const o of Object.keys(i)) j(o, !0);
    }
  }, [t]), { meta: h.useMemo(() => s ? { ...s, sections: Object.values(i).flat() } : null, [s, i]), ensureSections: j, setMeta: n };
}
function js(r, t) {
  return !!r && r.length === t.length && r.every((s, n) => s.id === t[n].id && s.name === t[n].name && s.order === t[n].order);
}
function bs(r, t, s) {
  const n = h.useRef(t);
  n.current = t;
  const i = h.useRef(s);
  i.current = s;
  const d = h.useRef(!0);
  h.useEffect(() => {
    const a = r.changes ?? [];
    if (d.current) {
      d.current = !1, v.lastSeq = Math.max(v.lastSeq, r.changeSeq ?? 0);
      return;
    }
    const f = a[0]?.seq ?? (r.changeSeq ?? 0) + 1;
    v.lastSeq > 0 && f > v.lastSeq + 1 && i.current();
    for (const j of a) v.applyChange(j, n.current);
    v.lastSeq = Math.max(v.lastSeq, r.changeSeq ?? 0);
  }, [r.changeSeq, r.changes]);
}
function gs(r, t, s) {
  const [n, i] = h.useState(!1), d = h.useRef(s);
  return d.current = s, h.useEffect(() => {
    if (!t) return;
    let a = !0;
    const f = v.detail(t) ? 0 : 120, j = setTimeout(() => {
      const y = Date.now();
      i(!v.detail(t)), r.call("task", { id: t }).then(
        (o) => {
          a && v.setDetail(o, y);
        },
        (o) => {
          a && !v.detail(t) && d.current(ye(o));
        }
      ).finally(() => {
        a && i(!1);
      });
    }, f);
    return () => {
      a = !1, clearTimeout(j);
    };
  }, [r, t]), { loading: n };
}
const bt = ["15m", "30m", "45m", "1h", "1h30m", "2h", "3h", "4h"];
function ys({ taskId: r, meta: t, now: s, actions: n, readOnly: i, onClose: d, onOpenTask: a, onDelete: f, onOpenUrl: j, onCreateLabel: y, onNeedSections: o, onError: l }) {
  const b = Oe(), g = jt(), { loading: k } = gs(b, r, l), p = g.task(r) ?? g.detail(r)?.task, C = g.detail(r), [S, M] = h.useState(null), [N, $] = h.useState(""), [D, m] = h.useState(null), [E, F] = h.useState(""), [R, W] = h.useState(""), L = { due: h.useRef(null), priority: h.useRef(null), labels: h.useRef(null), project: h.useRef(null) }, K = h.useRef(null), G = h.useRef(""), V = h.useRef(p);
  V.current = p;
  const P = (c) => {
    K.current = c, M(c);
  }, B = (c) => {
    G.current = c, $(c);
  }, w = (c) => {
    const q = V.current;
    q && n.update(q, c).catch(() => {
    });
  };
  h.useEffect(() => () => {
    const c = K.current, q = V.current;
    if (c && q) {
      const Q = it(c, G.current, q);
      Q && n.update(q, Q).catch(() => {
      });
    }
    K.current = null, M(null), m(null);
  }, [r]);
  const Y = p?.projectId;
  if (h.useEffect(() => {
    Y && o(Y);
  }, [Y, o]), !p)
    return /* @__PURE__ */ e.jsxs(nt, { onClose: d, children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-task-modal-head", children: [
        /* @__PURE__ */ e.jsx("span", { className: "td-skel", style: { width: 120 } }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", onClick: d, title: "Close (Esc)", children: /* @__PURE__ */ e.jsx(oe, {}) })
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "td-task-modal-body", children: /* @__PURE__ */ e.jsxs("div", { className: "td-task-modal-main", children: [
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "80%", height: 20, marginBottom: 14 } }),
        /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "60%" } })
      ] }) })
    ] });
  const H = t.projects.find((c) => c.id === p.projectId), A = t.sections.find((c) => c.id === p.sectionId), he = !!p.completedAt || g.isHidden(p.id), me = Le(p.due, s), ke = (C?.children ?? []).filter((c) => !g.isHidden(c.id)).map((c) => g.task(c.id) ?? c), Z = C?.comments ?? [], ie = C?.task.description && C.task.description.length > p.description.length ? C.task.description : p.description, _ = () => {
    const c = K.current;
    if (!c) return;
    P(null);
    const q = it(c, G.current, { ...p, description: ie });
    q && w(q);
  }, pe = async () => {
    const c = E.trim();
    if (c) {
      F("");
      try {
        const q = await b.call("comment", { taskId: p.id, content: c });
        g.addComment(p.id, q);
      } catch (q) {
        F((Q) => Q || c), l(ye(q));
      }
    }
  }, le = async () => {
    const c = R.trim();
    if (c) {
      W("");
      try {
        const q = await b.call("add", { content: c, parentId: p.id, projectId: p.projectId });
        g.addChild(p.id, q);
      } catch (q) {
        W((Q) => Q || c), l(ye(q));
      }
    }
  };
  return /* @__PURE__ */ e.jsxs(nt, { onClose: d, children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-task-modal-head", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: L.project, className: "td-crumb", onClick: () => !i && m("project"), title: "Move to project / section", children: [
        H?.isInbox ? /* @__PURE__ */ e.jsx(xe, { size: 13 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: O(H?.color) } }),
        /* @__PURE__ */ e.jsx("span", { children: H?.name ?? "Project" }),
        A && /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
          "/ ",
          A.name
        ] }),
        !i && /* @__PURE__ */ e.jsx(Lt, { size: 12, className: "td-crumb-move" })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-tools", children: [
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open in Todoist", onClick: () => j(p.url), children: /* @__PURE__ */ e.jsx(dt, {}) }),
        !i && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn danger", title: "Delete task (⌫)", onClick: () => f(p), children: /* @__PURE__ */ e.jsx(_e, {}) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: d, children: /* @__PURE__ */ e.jsx(oe, {}) })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-task-modal-body", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-task-modal-main", children: [
        p.parentId && /* @__PURE__ */ e.jsxs("button", { className: "td-parent-link", onClick: () => a(p.parentId), children: [
          /* @__PURE__ */ e.jsx(ze, { size: 12 }),
          " Open parent task"
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-drawer-title-row", children: [
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              className: `td-checkbox lg p${p.priority}${he ? " is-checked" : ""}`,
              style: { "--prio": be[p.priority] },
              "aria-label": he ? "Reopen task" : "Complete task",
              disabled: i,
              onClick: () => he ? n.reopen(p) : n.complete(p),
              children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
            }
          ),
          S === "title" ? /* @__PURE__ */ e.jsx(
            "textarea",
            {
              autoFocus: !0,
              className: "td-edit-title",
              value: N,
              rows: Math.min(5, Math.max(1, Math.ceil(N.length / 40))),
              onChange: (c) => B(c.target.value),
              onBlur: _,
              onKeyDown: (c) => {
                c.key === "Enter" && !c.shiftKey && (c.preventDefault(), _()), c.key === "Escape" && (c.preventDefault(), c.stopPropagation(), P(null));
              }
            }
          ) : /* @__PURE__ */ e.jsx("h2", { className: `td-drawer-title${he ? " is-done" : ""}`, onClick: () => {
            i || (B(p.content), P("title"));
          }, title: "Click to edit", children: ue(p.content, j, "title") })
        ] }),
        S === "description" ? /* @__PURE__ */ e.jsxs("div", { className: "td-edit-desc-wrap", children: [
          /* @__PURE__ */ e.jsx(
            "textarea",
            {
              autoFocus: !0,
              className: "td-edit-desc",
              value: N,
              placeholder: "Description (Markdown supported)",
              onChange: (c) => B(c.target.value),
              onKeyDown: (c) => {
                c.key === "Enter" && (c.metaKey || c.ctrlKey) && (c.preventDefault(), _()), c.key === "Escape" && (c.preventDefault(), c.stopPropagation(), P(null));
              }
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: "td-edit-actions", children: [
            /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "⌘↵ to save" }),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => P(null), children: "Cancel" }),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", onClick: _, children: "Save" })
          ] })
        ] }) : ie ? /* @__PURE__ */ e.jsx("div", { className: "td-desc", onClick: (c) => {
          i || c.target.closest("a") || (B(ie), P("description"));
        }, title: "Click to edit", children: /* @__PURE__ */ e.jsx(st, { text: ie, open: j }) }) : i ? null : /* @__PURE__ */ e.jsx("button", { className: "td-add-desc", onClick: () => {
          B(""), P("description");
        }, children: "Add description" }),
        /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
          /* @__PURE__ */ e.jsxs("h3", { children: [
            /* @__PURE__ */ e.jsx(ze, { size: 13 }),
            " Sub-tasks ",
            /* @__PURE__ */ e.jsx("span", { className: "td-count", children: ke.length || "" })
          ] }),
          ke.map((c) => /* @__PURE__ */ e.jsxs("div", { className: `td-subtask${c.completedAt ? " is-done" : ""}`, children: [
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                className: `td-checkbox sm p${c.priority}`,
                style: { "--prio": be[c.priority] },
                "aria-label": "Complete sub-task",
                disabled: i,
                onClick: () => n.complete(c),
                children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
              }
            ),
            /* @__PURE__ */ e.jsx("button", { className: "td-subtask-title", onClick: () => a(c.id), children: ue(c.content, j, c.id) }),
            c.due && /* @__PURE__ */ e.jsx("span", { className: `td-chip td-due tone-${Le(c.due, s)}`, children: Fe(c.due, s) })
          ] }, c.id)),
          k && !C && /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "45%", margin: "6px 0" } }),
          !i && /* @__PURE__ */ e.jsxs("form", { className: "td-inline-add", onSubmit: (c) => {
            c.preventDefault(), le();
          }, children: [
            /* @__PURE__ */ e.jsx(fe, { size: 13 }),
            /* @__PURE__ */ e.jsx("input", { value: R, onChange: (c) => W(c.target.value), placeholder: "Add sub-task", onKeyDown: (c) => {
              c.key === "Escape" && (c.preventDefault(), c.stopPropagation(), c.target.blur());
            } })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("section", { className: "td-section-block", children: [
          /* @__PURE__ */ e.jsxs("h3", { children: [
            /* @__PURE__ */ e.jsx(ut, { size: 13 }),
            " Comments ",
            /* @__PURE__ */ e.jsx("span", { className: "td-count", children: Z.length || "" })
          ] }),
          Z.map((c) => /* @__PURE__ */ e.jsxs("div", { className: "td-comment", children: [
            /* @__PURE__ */ e.jsx("div", { className: "td-comment-meta", children: new Date(c.postedAt).toLocaleString(void 0, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }),
            c.content && /* @__PURE__ */ e.jsx(st, { text: c.content, open: j }),
            c.attachment && /* @__PURE__ */ e.jsxs("button", { className: "td-attachment", onClick: () => c.attachment?.url && j(c.attachment.url), children: [
              "📎 ",
              c.attachment.name
            ] })
          ] }, c.id)),
          k && !C && /* @__PURE__ */ e.jsx("div", { className: "td-skel", style: { width: "70%", margin: "6px 0" } }),
          !i && /* @__PURE__ */ e.jsxs("form", { className: "td-comment-form", onSubmit: (c) => {
            c.preventDefault(), pe();
          }, children: [
            /* @__PURE__ */ e.jsx(
              "textarea",
              {
                value: E,
                onChange: (c) => F(c.target.value),
                placeholder: "Write a comment",
                rows: E.includes(`
`) ? 4 : 2,
                onKeyDown: (c) => {
                  c.key === "Enter" && (c.metaKey || c.ctrlKey) && (c.preventDefault(), c.currentTarget.form.requestSubmit()), c.key === "Escape" && (c.preventDefault(), c.stopPropagation(), c.target.blur());
                }
              }
            ),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !E.trim(), children: "Comment" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("aside", { className: "td-task-modal-side", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "td-side-row", children: [
          /* @__PURE__ */ e.jsx("span", { className: "td-prop-label", children: "Project" }),
          /* @__PURE__ */ e.jsxs("button", { className: "td-prop-value", disabled: i, onClick: () => m("project"), children: [
            H?.isInbox ? /* @__PURE__ */ e.jsx(xe, { size: 13 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: O(H?.color) } }),
            H?.name ?? "Project",
            A ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
              " / ",
              A.name
            ] }) : null
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-side-row", children: [
          /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
            /* @__PURE__ */ e.jsx(Ie, { size: 13 }),
            "Date"
          ] }),
          /* @__PURE__ */ e.jsx("button", { ref: L.due, className: `td-prop-value tone-${me}`, disabled: i, onClick: () => m("due"), children: p.due ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            p.due.recurring && /* @__PURE__ */ e.jsx(ht, { size: 12 }),
            Fe(p.due, s),
            /* @__PURE__ */ e.jsx("span", { className: "td-dim td-prop-sub", children: p.due.recurring ? p.due.string : "" })
          ] }) : /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: "No date" }) })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-side-row", children: [
          /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
            /* @__PURE__ */ e.jsx(mt, { size: 13 }),
            "Deadline"
          ] }),
          /* @__PURE__ */ e.jsxs("span", { className: "td-prop-value-wrap", children: [
            /* @__PURE__ */ e.jsx("input", { type: "date", className: `td-date-input${p.deadline ? "" : " is-empty"}`, value: p.deadline ?? "", disabled: i, onChange: (c) => w({ deadline: c.target.value }), "aria-label": "Deadline" }),
            p.deadline && !i && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", title: "Clear deadline", onClick: () => w({ deadline: "" }), children: /* @__PURE__ */ e.jsx(oe, { size: 12 }) })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-side-row", children: [
          /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
            /* @__PURE__ */ e.jsx(Ae, { size: 13, color: "currentColor" }),
            "Priority"
          ] }),
          /* @__PURE__ */ e.jsxs("button", { ref: L.priority, className: "td-prop-value", disabled: i, onClick: () => m("priority"), children: [
            /* @__PURE__ */ e.jsx(Ae, { size: 13, color: p.priority === 1 ? "var(--td-muted)" : be[p.priority] }),
            "P",
            5 - p.priority
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-side-row", children: [
          /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
            /* @__PURE__ */ e.jsx(ge, { size: 13 }),
            "Labels"
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-prop-labels", children: [
            p.labels.map((c) => {
              const q = t.labels.find((Q) => Q.name === c);
              return /* @__PURE__ */ e.jsxs("span", { className: "td-label-pill", style: { "--label": O(q?.color) }, children: [
                c,
                !i && /* @__PURE__ */ e.jsx("button", { title: `Remove ${c}`, onClick: () => w({ labels: p.labels.filter((Q) => Q !== c) }), children: /* @__PURE__ */ e.jsx(oe, { size: 10 }) })
              ] }, c);
            }),
            !i && /* @__PURE__ */ e.jsx("button", { ref: L.labels, className: "td-icon-btn sm", title: "Add label", onClick: () => m("labels"), children: /* @__PURE__ */ e.jsx(fe, { size: 12 }) })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-side-row", children: [
          /* @__PURE__ */ e.jsxs("span", { className: "td-prop-label", children: [
            /* @__PURE__ */ e.jsx(pt, { size: 13 }),
            "Duration"
          ] }),
          /* @__PURE__ */ e.jsxs("select", { className: "td-select", value: p.duration ? ks(p.duration) : "", disabled: i, onChange: (c) => {
            c.target.value && w({ duration: c.target.value });
          }, "aria-label": "Duration", children: [
            /* @__PURE__ */ e.jsx("option", { value: "", disabled: !0, children: p.duration ? ft(p.duration) : "None" }),
            bt.map((c) => /* @__PURE__ */ e.jsx("option", { value: c, children: c.replace("h30m", "h 30m") }, c))
          ] })
        ] })
      ] })
    ] }),
    D === "due" && /* @__PURE__ */ e.jsx(Ke, { anchor: L.due.current, current: p.due?.string, onPick: (c) => w({ due: c }), onClose: () => m(null) }),
    D === "priority" && /* @__PURE__ */ e.jsx(He, { anchor: L.priority.current, current: p.priority, onPick: (c) => w({ priority: c }), onClose: () => m(null) }),
    D === "labels" && /* @__PURE__ */ e.jsx(ot, { anchor: L.labels.current, labels: t.labels, selected: p.labels, onChange: (c) => w({ labels: c }), onCreate: y, onClose: () => m(null) }),
    D === "project" && /* @__PURE__ */ e.jsx(lt, { anchor: L.project.current, meta: t, current: { projectId: p.projectId, sectionId: p.sectionId }, onPick: (c) => void n.move(p, c).catch(() => {
    }), onClose: () => m(null) })
  ] });
}
function nt({ onClose: r, children: t }) {
  return /* @__PURE__ */ e.jsx("div", { className: "td-task-modal-scrim", onMouseDown: (s) => {
    s.target === s.currentTarget && r();
  }, children: /* @__PURE__ */ e.jsx("div", { className: "td-task-modal", role: "dialog", "aria-label": "Task details", children: t }) });
}
function it(r, t, s) {
  if (r === "title") {
    const n = t.trim();
    return n && n !== s.content ? { content: n } : null;
  }
  return t !== s.description ? { description: t } : null;
}
function ks(r) {
  if (r.unit === "day") return "";
  const t = Math.floor(r.amount / 60), s = r.amount % 60, n = `${t ? `${t}h` : ""}${s ? `${s}m` : ""}`;
  return bt.includes(n) ? n : "";
}
const vs = h.memo(function({
  task: t,
  lookup: s,
  now: n,
  showProject: i,
  focused: d,
  phase: a,
  pending: f,
  depth: j = 0,
  childCount: y = 0,
  actions: o
}) {
  const [l, b] = h.useState(null), g = h.useRef(null), k = h.useRef(null), p = h.useRef(null), C = !!t.completedAt || !!a, S = t.id.startsWith("pending-");
  h.useLayoutEffect(() => {
    a === "collapsing" && p.current && p.current.style.setProperty("--row-h", `${p.current.offsetHeight}px`);
  }, [a]);
  const M = Le(t.due, n), N = s.project(t.projectId), $ = s.section(t.sectionId);
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      ref: p,
      className: `td-task${d ? " is-focused" : ""}${C ? " is-done" : ""}${a ? ` is-${a}` : ""}${f || S ? " is-pending" : ""}`,
      style: j ? { paddingLeft: 12 + j * 26 } : void 0,
      "data-task-id": t.id,
      role: "listitem",
      "aria-label": t.content,
      onMouseDown: () => !S && o.focus(t),
      onClick: (D) => {
        S || D.target.closest("button, a, input") || o.open(t);
      },
      children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            className: `td-checkbox p${t.priority}`,
            style: { "--prio": be[t.priority] },
            "aria-label": C ? "Reopen task" : "Complete task",
            title: C ? "Reopen" : "Complete",
            disabled: S,
            onClick: () => o.toggle(t),
            children: /* @__PURE__ */ e.jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ e.jsx("path", { d: "m4.6 8.3 2.3 2.3 4.6-4.9" }) })
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "td-task-main", children: [
          /* @__PURE__ */ e.jsx("div", { className: "td-task-title", children: ue(t.content, o.openUrl, t.id) }),
          t.description && !C && /* @__PURE__ */ e.jsx("div", { className: "td-task-desc", children: t.description.split(`
`)[0] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-task-meta", children: [
            t.due && /* @__PURE__ */ e.jsxs("span", { className: `td-chip td-due tone-${M}`, title: t.due.string, children: [
              t.due.recurring ? /* @__PURE__ */ e.jsx(ht, { size: 12 }) : /* @__PURE__ */ e.jsx(Ie, { size: 12 }),
              Fe(t.due, n)
            ] }),
            t.deadline && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-deadline", title: "Deadline", children: [
              /* @__PURE__ */ e.jsx(mt, { size: 12 }),
              Jt(t.deadline, n)
            ] }),
            t.duration && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Duration", children: [
              /* @__PURE__ */ e.jsx(pt, { size: 12 }),
              ft(t.duration)
            ] }),
            y > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Subtasks", children: [
              /* @__PURE__ */ e.jsx(ze, { size: 12 }),
              y
            ] }),
            t.commentCount > 0 && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", title: "Comments", children: [
              /* @__PURE__ */ e.jsx(ut, { size: 12 }),
              t.commentCount
            ] }),
            t.labels.map((D) => /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-label", style: { color: O(s.label(D)?.color) }, children: [
              /* @__PURE__ */ e.jsx(ge, { size: 12 }),
              D
            ] }, D)),
            t.completedAt && /* @__PURE__ */ e.jsxs("span", { className: "td-chip", children: [
              "Completed ",
              new Date(t.completedAt).toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" })
            ] }),
            i && N && /* @__PURE__ */ e.jsxs("span", { className: "td-chip td-project-chip", children: [
              N.isInbox ? /* @__PURE__ */ e.jsx(xe, { size: 12 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot sm", style: { background: O(N.color) } }),
              N.name,
              $ ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
                " / ",
                $.name
              ] }) : null
            ] })
          ] })
        ] }),
        !C && !S && /* @__PURE__ */ e.jsxs("div", { className: "td-task-actions", children: [
          /* @__PURE__ */ e.jsx("button", { ref: g, type: "button", className: "td-icon-btn", title: "Schedule (t = today)", onClick: () => b("due"), children: /* @__PURE__ */ e.jsx(Ie, {}) }),
          /* @__PURE__ */ e.jsx("button", { ref: k, type: "button", className: "td-icon-btn", title: "Priority (1–4)", onClick: () => b("priority"), children: /* @__PURE__ */ e.jsx(Ft, {}) }),
          o.remove && /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-icon-btn danger", title: "Delete (⌫)", onClick: () => o.remove(t), children: /* @__PURE__ */ e.jsx(_e, {}) })
        ] }),
        l === "due" && /* @__PURE__ */ e.jsx(Ke, { anchor: g.current, current: t.due?.string, onPick: (D) => o.patch(t, { due: D }), onClose: () => b(null) }),
        l === "priority" && /* @__PURE__ */ e.jsx(He, { anchor: k.current, current: t.priority, onPick: (D) => o.patch(t, { priority: D }), onClose: () => b(null) })
      ]
    }
  );
});
function Ns(r, t, s) {
  const n = h.useRef(/* @__PURE__ */ new Map()), i = h.useRef(s);
  h.useLayoutEffect(() => {
    const d = r.current;
    if (!d) return;
    const a = d.querySelectorAll("[data-task-id]"), f = /* @__PURE__ */ new Map(), j = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches, y = i.current === s;
    i.current = s;
    const o = d.getBoundingClientRect().top - d.scrollTop;
    for (const l of a) {
      const b = l.dataset.taskId, g = l.getBoundingClientRect().top - o;
      f.set(b, g);
      const k = n.current.get(b);
      if (!y || j || k === void 0) continue;
      const p = k - g;
      Math.abs(p) < 2 || (l.style.transition = "none", l.style.transform = `translateY(${p}px)`, requestAnimationFrame(() => {
        l.style.transition = "transform 180ms cubic-bezier(.2, 0, 0, 1)", l.style.transform = "", setTimeout(() => {
          l.style.transition = "";
        }, 200);
      }));
    }
    n.current = f;
  }, [r, t, s]);
}
const Pe = 250, rt = 200;
let ws = 0;
function Cs(r, t) {
  const s = h.useRef(t);
  s.current = t;
  const n = h.useRef(/* @__PURE__ */ new Set());
  return h.useMemo(() => ({ complete: (o) => {
    if (n.current.has(o.id)) return;
    n.current.add(o.id);
    const l = () => n.current.delete(o.id);
    if (o.completedAt) {
      v.hide(o.id), v.serialize(o.id, () => r.call("uncomplete", { id: o.id })).then(
        () => s.current.toast("Task reopened"),
        (g) => {
          v.unhide(o.id), s.current.fail(g);
        }
      ).finally(l);
      return;
    }
    if (v.setPhase(o.id, "checked"), o.due?.recurring) {
      s.current.toast(`Completed — next: ${o.due.string}`), v.serialize(o.id, () => r.call("complete", { id: o.id })).then(
        () => {
        },
        (g) => s.current.fail(g)
      ).finally(() => {
        setTimeout(() => v.setPhase(o.id, null), Pe + rt), l();
      });
      return;
    }
    v.hide(o.id), setTimeout(() => v.isHidden(o.id) && v.setPhase(o.id, "collapsing"), Pe), setTimeout(() => {
      v.isHidden(o.id) && (v.setPhase(o.id, null), s.current.onGone(o.id));
    }, Pe + rt);
    let b = !1;
    s.current.toast("Task completed", {
      completion: o.id,
      action: {
        label: "Undo",
        run: () => {
          b = !0, v.unhide(o.id), v.serialize(o.id, () => r.call("uncomplete", { id: o.id })).catch((g) => s.current.fail(g));
        }
      }
    }), v.serialize(o.id, () => r.call("complete", { id: o.id })).then(
      () => {
      },
      (g) => {
        b || v.unhide(o.id), s.current.fail(g);
      }
    ).finally(l);
  }, reopen: (o) => {
    v.unhide(o.id), v.serialize(o.id, () => r.call("uncomplete", { id: o.id })).catch((l) => s.current.fail(l));
  }, update: (o, l) => {
    const b = {};
    if (l.content !== void 0 && (b.content = l.content), l.description !== void 0 && (b.description = l.description), l.priority !== void 0 && (b.priority = l.priority), l.labels !== void 0 && (b.labels = l.labels), l.deadline !== void 0 && (b.deadline = l.deadline || null), l.due !== void 0) {
      const g = et(l.due);
      g !== void 0 && (b.due = g);
    }
    return v.edit(o.id, b, () => r.call("update", { id: o.id, ...l })).catch((g) => {
      throw s.current.fail(g), g;
    });
  }, move: (o, l) => v.edit(
    o.id,
    { projectId: l.projectId, sectionId: l.sectionId },
    () => r.call("move", { id: o.id, projectId: l.projectId, ...l.sectionId ? { sectionId: l.sectionId } : { noSection: !0 } })
  ).catch((b) => {
    throw s.current.fail(b), b;
  }), remove: (o, l) => {
    v.hide(o), s.current.onGone(o), v.serialize(o, () => r.call("delete", { id: o })).then(
      () => s.current.toast(`Deleted “${l}”`),
      (b) => {
        v.unhide(o), s.current.fail(b);
      }
    );
  }, add: async (o, l, b) => {
    const g = `pending-${++ws}`, k = l.due ? et(l.due) : null;
    v.insert(b, {
      id: g,
      content: at(o) || o,
      description: l.note ?? "",
      priority: l.priority ?? 1,
      due: k ?? null,
      deadline: null,
      duration: null,
      projectId: l.projectId ?? l.inboxId ?? "",
      sectionId: l.sectionId ?? null,
      parentId: null,
      labels: l.labels ?? [],
      order: Number.MAX_SAFE_INTEGER,
      commentCount: 0,
      completedAt: null,
      url: ""
    });
    try {
      const p = await r.call("addWithIntent", { text: o, intent: l });
      return v.drop(g), v.insert(b, p.task), p.partial && s.current.toast(p.partial, { tone: "error" }), !0;
    } catch (p) {
      return v.drop(g), s.current.fail(p), !1;
    }
  }, isPendingRow: (o) => o.startsWith("pending-") }), [r]);
}
function qs({ variant: r = "pane" } = {}) {
  const t = Oe(), s = Kt(t), n = Ht(), i = s?.setup?.state === "ready";
  return h.useEffect(() => {
    t.call("status", {}).catch(() => {
    });
  }, [t]), i ? /* @__PURE__ */ e.jsx(Ds, { variant: r, host: s, now: n, user: s.setup.user }) : /* @__PURE__ */ e.jsx("div", { className: gt(r), children: /* @__PURE__ */ e.jsx(_t, { setup: s?.setup ?? null, onRetry: async () => {
    await t.call("status", { refresh: !0 });
  } }) });
}
const gt = (r, t = "") => `td-root${r === "modal" ? " td-window-root" : ""}${t}`;
function Ss(r, t) {
  const [s, n] = h.useState(!1);
  return h.useEffect(() => {
    if (!r) {
      n(!1);
      return;
    }
    const i = setTimeout(() => n(!0), t);
    return () => clearTimeout(i);
  }, [r, t]), s;
}
function Ds({ variant: r, host: t, now: s, user: n }) {
  const i = Oe(), d = jt(), [a, f] = h.useState({ kind: t.settings.defaultView }), j = ae(a), [y, o] = Ot(i, "todoist.ui.sidebar", !0), { meta: l, ensureSections: b, setMeta: g } = xs(i, t.metaRevision), [k, p] = h.useState(null), [C, S] = h.useState(null), [M, N] = h.useState(!1), [$, D] = h.useState(""), [m, E] = h.useState(() => window.innerWidth), [F, R] = h.useState(!1), [W, L] = h.useState(!1), [K, G] = h.useState(null), [V, P] = h.useState(null), B = h.useRef(!1), w = h.useRef(null), Y = h.useRef(null), H = h.useRef(null), A = h.useRef(a);
  A.current = a;
  const { toasts: he, toast: me, dismiss: ke } = ls(), Z = m < 640, ie = Z ? F : y;
  h.useEffect(() => {
    const u = () => E(window.innerWidth);
    return window.addEventListener("resize", u), () => window.removeEventListener("resize", u);
  }, []);
  const _ = h.useCallback((u) => {
    const x = Zt(u);
    x === "NO_TOKEN" || x === "AUTH" || x === "TD_NOT_FOUND" || me(ye(u), { tone: "error" });
  }, [me]), pe = h.useCallback((u) => {
    i.call("openUrl", { url: u }).catch(_);
  }, [i, _]), le = l?.projects.find((u) => u.isInbox)?.id ?? null, c = h.useMemo(() => ({ now: s, inboxId: le, userId: n?.id ?? null }), [s, le, n?.id]), { revalidate: q, loadMore: Q } = fs(i), X = h.useCallback((u, x = !1) => {
    q(u, { cacheFirst: x }).catch(() => {
    });
  }, [q]);
  h.useEffect(() => {
    X(a, !0);
  }, [j]);
  const We = h.useRef(t.revision);
  h.useEffect(() => {
    t.revision !== We.current && (We.current = t.revision, X(A.current));
  }, [t.revision, X]), h.useEffect(() => {
    const u = () => {
      document.visibilityState === "visible" && X(A.current);
    };
    window.addEventListener("focus", u), document.addEventListener("visibilitychange", u);
    const x = setInterval(u, 6e4);
    return () => {
      window.removeEventListener("focus", u), document.removeEventListener("visibilitychange", u), clearInterval(x);
    };
  }, [X]), bs(t, c, () => X(A.current));
  const re = a.kind === "project" ? a.id : a.kind === "inbox" ? le ?? void 0 : void 0, ce = re ? l?.projects.find((u) => u.id === re) : void 0;
  h.useEffect(() => {
    re && b(re);
  }, [re, b]);
  const ee = d.query(j), ve = d.rows(j, c), yt = Ss(!ee || ee.status === "empty", 150), kt = h.useMemo(() => {
    const u = new Map(l?.projects.map((I) => [I.id, I])), x = new Map(l?.sections.map((I) => [I.id, I])), z = new Map(l?.labels.map((I) => [I.name, I]));
    return {
      project: (I) => u.get(I),
      section: (I) => I ? x.get(I) : void 0,
      label: (I) => z.get(I)
    };
  }, [l]), { groups: Ne, depths: vt, childCounts: Nt } = h.useMemo(() => ns(a, ve, s, l, re), [a, ve, s, l, re]), se = h.useMemo(() => Ne.flatMap((u) => u.tasks), [Ne]);
  Ns(H, se.map((u) => u.id).join(","), j);
  const Ve = d.query("today::"), Be = d.query("inbox::"), wt = {
    today: Ve?.status === "ready" && !Ve.cursor ? d.rows("today::", c).filter((u) => !d.phase(u.id)).length : null,
    inbox: Be?.status === "ready" && !Be.cursor ? d.rows("inbox::", c).filter((u) => !d.phase(u.id)).length : null
  }, Ee = h.useRef(se);
  Ee.current = se;
  const J = Cs(i, {
    toast: me,
    fail: _,
    onGone: (u) => {
      p((x) => {
        if (x !== u) return x;
        const z = Ee.current, I = z.findIndex((te) => te.id === u);
        return (z.slice(I + 1).find((te) => !d.isHidden(te.id)) ?? z.slice(0, Math.max(0, I)).reverse().find((te) => !d.isHidden(te.id)))?.id ?? null;
      }), S((x) => x === u && !d.task(u)?.due?.recurring ? null : x);
    }
  }), je = h.useCallback((u, x) => {
    G({ id: u, task: x ?? d.task(u) ?? null, subtasks: null }), i.call("task", { id: u }).then(
      (z) => G((I) => I?.id === u ? { id: u, task: z.task, subtasks: z.children.length } : I),
      () => {
      }
    );
  }, [i, d]), Ct = h.useMemo(() => ({
    toggle: (u) => J.complete(u),
    open: (u) => {
      p(u.id), S(u.id);
    },
    focus: (u) => p(u.id),
    patch: (u, x) => {
      J.update(u, x).catch(() => {
      });
    },
    remove: n?.readOnly ? void 0 : (u) => {
      p(u.id), je(u.id, u);
    },
    openUrl: pe
  }), [J, n?.readOnly, je, pe]), Qe = h.useCallback((u) => ({
    due: a.kind === "today" ? "today" : null,
    labels: a.kind === "label" && a.query ? [a.query] : [],
    projectId: a.kind === "project" ? a.id ?? null : null,
    sectionId: u ?? null,
    inboxId: le
  }), [a, le]), Ue = h.useCallback((u, x) => J.add(u, x, A.current), [J]), we = h.useCallback(async (u) => {
    try {
      await i.call("createLabel", { name: u });
    } catch (x) {
      throw _(x), x;
    }
  }, [i, _]), Ge = h.useCallback((u) => {
    N(!1), R(!1), p(null), xt(u, A.current) ? X(u) : f(u), H.current?.scrollTo({ top: 0 });
  }, [X]);
  h.useEffect(() => {
    if (!M) return;
    const u = $.trim();
    if (!u) return;
    const x = setTimeout(() => f({ kind: "search", query: u }), 250);
    return () => clearTimeout(x);
  }, [$, M]);
  const Ce = h.useCallback(() => {
    N(!1), D(""), A.current.kind === "search" && f({ kind: t.settings.defaultView });
  }, [t.settings.defaultView]), Re = h.useCallback(() => {
    X(A.current), i.call("meta", {}).then((u) => {
      u && g(u);
    }, () => {
    });
  }, [i, X, g]);
  h.useEffect(() => es((x) => {
    const z = x.target, I = z.closest('input, textarea, select, [contenteditable="true"]');
    if (x.key === "Escape") {
      if (x.defaultPrevented) return;
      if (W) {
        x.preventDefault(), L(!1);
        return;
      }
      if (C) {
        x.preventDefault(), S(null);
        return;
      }
      if (M || A.current.kind === "search") {
        x.preventDefault(), Ce();
        return;
      }
      if (F) {
        x.preventDefault(), R(!1);
        return;
      }
      return;
    }
    if (I || x.metaKey || x.ctrlKey || x.altKey || K) return;
    const de = Ee.current, te = de.findIndex((U) => U.id === k), ne = te >= 0 ? de[te] : null, Ye = (U) => {
      if (!de.length) return;
      const Te = de[Math.max(0, Math.min(de.length - 1, (te < 0 ? U > 0 ? -1 : de.length : te) + U))];
      p(Te.id), H.current?.querySelector(`[data-task-id="${CSS.escape(Te.id)}"]`)?.scrollIntoView({ block: "nearest" }), C && S(Te.id);
    }, T = x.key;
    if (!((T === "Enter" || T === " ") && ts(z)))
      if (T === "j" || T === "ArrowDown")
        x.preventDefault(), Ye(1);
      else if (T === "k" || T === "ArrowUp")
        x.preventDefault(), Ye(-1);
      else if ((T === "Enter" || T === "o") && ne)
        x.preventDefault(), S(ne.id);
      else if ((T === "x" || T === " ") && ne)
        x.preventDefault(), J.complete(ne);
      else if (/^[1-4]$/.test(T) && ne)
        x.preventDefault(), J.update(ne, { priority: 5 - Number(T) }).catch(() => {
        });
      else if (T === "t" && ne)
        x.preventDefault(), J.update(ne, { due: "today" }).catch(() => {
        });
      else if ((T === "Backspace" || T === "Delete") && !n?.readOnly && !z.closest('.td-popover, [role="dialog"]:not(.td-task-modal)')) {
        const U = C ?? ne?.id;
        U && (x.preventDefault(), je(U, d.task(U)));
      } else (T === "q" || T === "a") && !n?.readOnly ? (x.preventDefault(), w.current?.open()) : T === "/" ? (x.preventDefault(), N(!0), requestAnimationFrame(() => Y.current?.focus())) : T === "r" ? (x.preventDefault(), Re()) : T === "[" ? (x.preventDefault(), Z ? R((U) => !U) : o(!y)) : T === "?" && (x.preventDefault(), L((U) => !U));
  }), [k, C, M, F, W, J, Z, y, o, Ce, K, n?.readOnly, je, Re, d]);
  const St = ss(a, l), Dt = se.filter((u) => !u.completedAt && !d.phase(u.id)).length, qe = !n?.readOnly && a.kind !== "completed", It = a.kind === "today" ? "Due today unless you type a date" : a.kind === "label" ? `Tagged @${a.query}` : null, Se = ee?.status === "ready", Et = (a.kind === "project" || a.kind === "inbox") && !!re;
  return /* @__PURE__ */ e.jsxs("div", { className: gt(r, Z ? " is-narrow" : ""), children: [
    /* @__PURE__ */ e.jsxs("div", { className: `td-layout${ie && !Z ? " has-sidebar" : ""}`, children: [
      ie && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        Z && /* @__PURE__ */ e.jsx("div", { className: "td-scrim", onClick: () => R(!1) }),
        /* @__PURE__ */ e.jsx(
          ds,
          {
            meta: l,
            current: a,
            counts: wt,
            user: n,
            onSelect: Ge,
            onAddTask: qe ? () => {
              R(!1), w.current?.open();
            } : void 0,
            onSearch: () => {
              N(!0), R(!1), requestAnimationFrame(() => Y.current?.focus());
            },
            onCreateProject: async (u, x) => {
              try {
                const z = await i.call("createProject", { name: u, color: x });
                return Ge({ kind: "project", id: z.id }), !0;
              } catch (z) {
                return _(z), !1;
              }
            },
            onCreateLabel: async (u) => {
              try {
                return await we(u), !0;
              } catch {
                return !1;
              }
            },
            onSignOut: () => {
              i.call("logout", {}).catch(_);
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("main", { className: "td-main", children: [
        /* @__PURE__ */ e.jsxs("header", { className: "td-header", children: [
          /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: ie ? "Hide sidebar ([)" : "Show sidebar ([)", onClick: () => Z ? R((u) => !u) : o(!y), children: /* @__PURE__ */ e.jsx(Wt, {}) }),
          M ? /* @__PURE__ */ e.jsxs("div", { className: "td-search", children: [
            /* @__PURE__ */ e.jsx(ct, {}),
            /* @__PURE__ */ e.jsx(
              "input",
              {
                ref: Y,
                value: $,
                onChange: (u) => D(u.target.value),
                placeholder: "Search tasks",
                onKeyDown: (u) => {
                  u.key === "Escape" && (u.preventDefault(), Ce()), u.key === "ArrowDown" && (u.preventDefault(), u.target.blur(), se[0] && p(se[0].id));
                }
              }
            ),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn sm", onClick: Ce, title: "Close search", children: /* @__PURE__ */ e.jsx(oe, { size: 12 }) })
          ] }) : /* @__PURE__ */ e.jsxs("div", { className: "td-title", children: [
            a.kind === "project" && ce && /* @__PURE__ */ e.jsx("span", { className: "td-dot lg", style: { background: O(ce.color) } }),
            a.kind === "inbox" && /* @__PURE__ */ e.jsx(xe, {}),
            /* @__PURE__ */ e.jsx("h1", { children: St }),
            Se && a.kind !== "completed" && /* @__PURE__ */ e.jsxs("span", { className: "td-title-count", children: [
              Dt,
              ee?.cursor ? "+" : ""
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "td-header-tools", children: [
            ce && !ce.isInbox && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Open project in Todoist", onClick: () => pe(ce.url), children: /* @__PURE__ */ e.jsx(dt, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Keyboard shortcuts (?)", onClick: () => L(!0), children: /* @__PURE__ */ e.jsx(Vt, {}) }),
            /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Refresh (r)", onClick: Re, children: /* @__PURE__ */ e.jsx(Bt, {}) }),
            r === "modal" && /* @__PURE__ */ e.jsx("button", { className: "td-icon-btn", title: "Close (Esc)", onClick: () => void i.context.api.ui.close(), children: /* @__PURE__ */ e.jsx(oe, {}) })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "td-list", ref: H, role: "list", children: [
          !Se && !ve.length ? ee?.status === "error" ? /* @__PURE__ */ e.jsxs("div", { className: "td-empty", children: [
            /* @__PURE__ */ e.jsx("p", { children: "Couldn’t load this list." }),
            /* @__PURE__ */ e.jsx("p", { className: "td-dim td-small", children: ee.error }),
            /* @__PURE__ */ e.jsx("button", { className: "td-btn", onClick: () => X(a), children: "Try again" })
          ] }) : yt ? /* @__PURE__ */ e.jsx(rs, {}) : null : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
            !se.length && /* @__PURE__ */ e.jsx(is, { view: a }),
            Ne.map((u) => /* @__PURE__ */ e.jsxs("section", { className: "td-group", children: [
              (Ne.length > 1 || u.subtitle || u.key !== "all") && u.title && /* @__PURE__ */ e.jsxs("h2", { className: `td-group-title${u.tone ? ` tone-${u.tone}` : ""}`, children: [
                u.title,
                u.subtitle && /* @__PURE__ */ e.jsx("span", { className: "td-group-sub", children: u.subtitle }),
                /* @__PURE__ */ e.jsx("span", { className: "td-group-count", children: u.tasks.filter((x) => !d.phase(x.id)).length })
              ] }),
              u.tasks.map((x) => /* @__PURE__ */ e.jsx(
                vs,
                {
                  task: x,
                  lookup: kt,
                  now: s,
                  showProject: a.kind !== "project" && a.kind !== "inbox",
                  focused: k === x.id || C === x.id,
                  phase: d.phase(x.id),
                  pending: d.isPending(x.id),
                  depth: vt.get(x.id) ?? 0,
                  childCount: Nt.get(x.id) ?? 0,
                  actions: Ct
                },
                x.id
              )),
              Et && qe && u.key !== "all" && /* @__PURE__ */ e.jsx(Je, { meta: l, base: Qe(u.key), onSubmit: Ue, onLabelCreate: we })
            ] }, u.key))
          ] }),
          qe && (Se || ve.length > 0) && /* @__PURE__ */ e.jsx(Je, { ref: w, meta: l, base: Qe(null), hint: It, onSubmit: Ue, onLabelCreate: we }),
          (ee?.cursor || ee?.truncated) && se.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "td-more", children: ee.cursor ? /* @__PURE__ */ e.jsx("button", { className: "td-btn", disabled: ee.refreshing, onClick: () => void Q(a).catch(_), children: "Load more" }) : /* @__PURE__ */ e.jsxs("span", { className: "td-dim td-small", children: [
            "Showing the first ",
            se.length,
            " tasks — this filter has more than can be loaded here. Open it in Todoist for the rest."
          ] }) }),
          a.kind === "project" && ce && !n?.readOnly && Se && (V !== null ? /* @__PURE__ */ e.jsxs(
            "form",
            {
              className: "td-section-add",
              onSubmit: async (u) => {
                u.preventDefault();
                const x = V.trim();
                if (!(!x || B.current)) {
                  B.current = !0;
                  try {
                    await i.call("createSection", { projectId: ce.id, name: x }), P(null);
                  } catch (z) {
                    _(z);
                  } finally {
                    B.current = !1;
                  }
                }
              },
              children: [
                /* @__PURE__ */ e.jsx("input", { autoFocus: !0, value: V, onChange: (u) => P(u.target.value), placeholder: "Section name", onKeyDown: (u) => {
                  u.key === "Escape" && (u.preventDefault(), u.stopPropagation(), P(null));
                } }),
                /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-primary", disabled: !V.trim(), children: "Add section" }),
                /* @__PURE__ */ e.jsx("button", { type: "button", className: "td-btn td-btn-ghost", onClick: () => P(null), children: "Cancel" })
              ]
            }
          ) : /* @__PURE__ */ e.jsxs("button", { className: "td-add-section", onClick: () => P(""), children: [
            /* @__PURE__ */ e.jsx(fe, { size: 12 }),
            " Add section"
          ] }))
        ] })
      ] })
    ] }),
    C && l && /* @__PURE__ */ e.jsx(
      ys,
      {
        taskId: C,
        meta: l,
        now: s,
        actions: J,
        readOnly: !!n?.readOnly,
        onClose: () => S(null),
        onOpenTask: (u) => S(u),
        onDelete: (u) => je(u.id, u),
        onError: (u) => me(u, { tone: "error" }),
        onOpenUrl: pe,
        onCreateLabel: we,
        onNeedSections: b
      }
    ),
    /* @__PURE__ */ e.jsx(cs, { toasts: he, onDismiss: ke }),
    W && /* @__PURE__ */ e.jsx(os, { onClose: () => L(!1) }),
    K && /* @__PURE__ */ e.jsx(
      as,
      {
        target: K,
        onCancel: () => G(null),
        onConfirm: () => {
          const u = K;
          G(null), S((x) => x === u.id ? null : x), J.remove(u.id, u.task?.content ?? "task");
        }
      }
    )
  ] });
}
export {
  qs as A
};

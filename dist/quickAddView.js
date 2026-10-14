import { u as _, a as G, r as s, t as J, j as e, S as U, c as M, C as X, F as Z, P as ee, L as te, A as se, I as ne, b as ae, D as ie, d as le, e as ce, f as oe, i as re, s as de, g as ue, h as me, B as pe, k as he } from "./shared-SetupScreen.js";
import { t as je, d as xe } from "./shared-types.js";
function be() {
  const n = _(), r = G(n), [i, x] = s.useState(null), [h, P] = s.useState(""), [c, B] = s.useState(null), [b, O] = s.useState(""), [d, H] = s.useState(1), [f, K] = s.useState([]), [N, V] = s.useState([]), [I, Q] = s.useState(null), [y, u] = s.useState(null), [C, q] = s.useState(!1), [A, R] = s.useState(null), [$, L] = s.useState(null), T = s.useRef(null), m = { project: s.useRef(null), due: s.useRef(null), priority: s.useRef(null), labels: s.useRef(null) }, S = r?.setup?.state === "ready";
  s.useEffect(() => {
    n.call("status", {}).catch(() => {
    });
  }, [n]), s.useEffect(() => {
    S && n.call("meta", {}).then(x, () => {
    });
  }, [n, S, r?.revision]), s.useEffect(() => {
    const t = n.context.api;
    let j = !0;
    const p = async () => {
      try {
        const [v, g, o] = await Promise.all([t.sessions.observe(), t.workspace.observe(), t.panes.observe()]);
        if (!j) return;
        const W = new Set(o.find((a) => a.tabId === g.activeTabId)?.leafSessionIds ?? []), Y = v.filter((a) => a.kind && !/terminal|shell|extension/i.test(a.kind)).map((a) => ({ id: a.id, title: a.title || a.kind || "Agent", cwd: a.cwd, kind: a.kind, inActiveTab: W.has(a.id), working: a.activity === "working" })).sort((a, D) => Number(D.inActiveTab) - Number(a.inActiveTab) || a.title.localeCompare(D.title));
        V(Y.slice(0, 12));
      } catch {
      }
    };
    p();
    let l = () => {
    };
    try {
      l = t.sessions.subscribe(() => void p());
    } catch {
    }
    return () => {
      j = !1, l();
    };
  }, [n]);
  const k = s.useMemo(() => J(h), [h]), w = i?.projects.find((t) => t.id === c?.projectId) ?? i?.projects.find((t) => t.isInbox), E = i?.sections.find((t) => t.id === c?.sectionId), F = N.find((t) => t.id === I) ?? null, z = async (t) => {
    const j = h.trim();
    if (!(!j || C)) {
      q(!0), R(null);
      try {
        let p = j;
        b && !k.some((o) => o.kind === "date") && (p += ` ${b}`), d > 1 && !k.some((o) => o.kind === "priority") && (p += ` p${5 - d}`);
        const l = await n.call("quickAdd", { text: p }), v = f.filter((o) => !l.labels.includes(o)), g = F ? fe(F, l.description) : null;
        (v.length || g !== null) && await n.call("update", {
          id: l.id,
          ...v.length ? { labels: [...l.labels, ...v] } : {},
          ...g !== null ? { description: g } : {}
        }), c && !k.some((o) => o.kind === "project") && (l.projectId !== c.projectId || c.sectionId) && await n.call("move", { id: l.id, projectId: c.projectId, ...c.sectionId ? { sectionId: c.sectionId } : {} }), t ? (P(""), L(l.content), setTimeout(() => L(null), 2500), T.current?.focus()) : await n.context.api.ui.close();
      } catch (p) {
        R(je(p));
      } finally {
        q(!1);
      }
    }
  };
  return S ? /* @__PURE__ */ e.jsxs("div", { className: "td-root td-modal-root", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-qa", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-field", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "td-qa-mirror", "aria-hidden": "true", children: [
          k.map((t, j) => /* @__PURE__ */ e.jsx("span", { className: `tok-${t.kind}`, children: t.text }, j)),
          "​"
        ] }),
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            ref: T,
            autoFocus: !0,
            rows: 1,
            value: h,
            spellCheck: !1,
            placeholder: 'Task name — try "Review PR tomorrow 3pm p1 #Work @review"',
            onChange: (t) => P(t.target.value.replace(/\n/g, " ")),
            onKeyDown: (t) => {
              t.key === "Enter" && !t.nativeEvent.isComposing && (t.preventDefault(), z(t.shiftKey));
            }
          }
        )
      ] }),
      k.some((t) => t.kind !== "text") && M(h) && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-preview", children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: M(h) }),
        "”"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-chips", children: [
        /* @__PURE__ */ e.jsxs("button", { ref: m.due, className: `td-qa-chip${b ? " is-set" : ""}`, onClick: () => u("due"), children: [
          /* @__PURE__ */ e.jsx(X, { size: 13 }),
          b || "Date"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: m.priority, className: `td-qa-chip${d > 1 ? " is-set" : ""}`, onClick: () => u("priority"), children: [
          /* @__PURE__ */ e.jsx(Z, { size: 13, color: d === 1 ? "var(--td-muted)" : ee[d] }),
          d > 1 ? `P${5 - d}` : "Priority"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: m.labels, className: `td-qa-chip${f.length ? " is-set" : ""}`, onClick: () => u("labels"), children: [
          /* @__PURE__ */ e.jsx(te, { size: 13 }),
          f.length ? f.join(", ") : "Labels"
        ] })
      ] }),
      N.length > 0 && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-agents", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "td-qa-agents-label", children: [
          /* @__PURE__ */ e.jsx(se, { size: 13 }),
          " Link to agent"
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "td-qa-agent-list", children: N.map((t) => /* @__PURE__ */ e.jsxs(
          "button",
          {
            className: `td-agent-chip${I === t.id ? " is-on" : ""}`,
            title: t.cwd,
            onClick: () => Q(I === t.id ? null : t.id),
            children: [
              /* @__PURE__ */ e.jsx("span", { className: `td-agent-dot${t.working ? " is-working" : ""}` }),
              t.title,
              t.inActiveTab && /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: " · this tab" })
            ]
          },
          t.id
        )) })
      ] }),
      A && /* @__PURE__ */ e.jsx("div", { className: "td-warn", children: A }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-foot", children: [
        /* @__PURE__ */ e.jsxs("button", { ref: m.project, className: "td-qa-project", onClick: () => u("project"), children: [
          w?.isInbox || !w ? /* @__PURE__ */ e.jsx(ne, { size: 14 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: ae(w.color) } }),
          w?.name ?? "Inbox",
          E ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
            " / ",
            E.name
          ] }) : null
        ] }),
        /* @__PURE__ */ e.jsx("span", { className: "td-qa-hint", children: $ ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          "Added “",
          $,
          "”"
        ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("kbd", { children: "↵" }),
          " add · ",
          /* @__PURE__ */ e.jsx("kbd", { children: "⇧↵" }),
          " add another"
        ] }) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => void n.context.api.ui.close(), children: "Cancel" }),
        /* @__PURE__ */ e.jsxs("button", { className: "td-btn td-btn-primary", disabled: !h.trim() || C, onClick: () => void z(!1), children: [
          C ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
          " Add task"
        ] })
      ] })
    ] }),
    y === "due" && /* @__PURE__ */ e.jsx(ie, { anchor: m.due.current, current: b, onPick: O, onClose: () => u(null) }),
    y === "priority" && /* @__PURE__ */ e.jsx(le, { anchor: m.priority.current, current: d, onPick: H, onClose: () => u(null) }),
    y === "labels" && i && /* @__PURE__ */ e.jsx(
      ce,
      {
        anchor: m.labels.current,
        labels: i.labels,
        selected: f,
        onChange: K,
        onCreate: async (t) => {
          await n.call("createLabel", { name: t }), x(await n.call("meta", {}));
        },
        onClose: () => u(null)
      }
    ),
    y === "project" && i && /* @__PURE__ */ e.jsx(oe, { anchor: m.project.current, meta: i, current: c ?? void 0, onPick: B, onClose: () => u(null) })
  ] }) : /* @__PURE__ */ e.jsx("div", { className: "td-root td-modal-root", children: /* @__PURE__ */ e.jsx(U, { setup: r?.setup ?? null, onRetry: async () => {
    await n.call("status", { refresh: !0 });
  } }) });
}
function fe(n, r) {
  const i = `From agent: **${n.title}** — \`${n.cwd}\``;
  return r ? `${r}

${i}` : i;
}
const ge = xe({
  mount(n, r) {
    re(de);
    const i = ue(), x = me(n);
    return x.render(
      /* @__PURE__ */ e.jsx(pe.Provider, { value: he(r), children: /* @__PURE__ */ e.jsx(be, {}) })
    ), () => {
      i(), queueMicrotask(() => x.unmount());
    };
  }
});
export {
  ge as default
};

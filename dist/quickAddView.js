import { u as Z, a as ee, r as n, t as se, j as e, S as te, c as H, C as ne, F as ae, P as ie, L as ce, A as le, I as oe, b as re, D as de, d as ue, e as me, f as pe, g as he, p as je, h as xe, i as fe, s as be, k as ve, l as ge, m as ke, B as ye, n as we } from "./shared-SetupScreen.js";
import { t as R, d as Ne } from "./shared-types.js";
function Ie(t) {
  return t !== "terminal" && t !== "extension-view";
}
function Ce() {
  const t = Z(), j = ee(t), [r, v] = n.useState(null), [d, K] = n.useState({}), [u, T] = n.useState(""), [x, U] = n.useState(null), [g, V] = n.useState(""), [m, Q] = n.useState(1), [f, W] = n.useState([]), [I, Y] = n.useState([]), [C, _] = n.useState(null), [k, l] = n.useState(null), [S, P] = n.useState(!1), [$, A] = n.useState(null), [E, F] = n.useState(null), L = n.useRef(null), o = { project: n.useRef(null), due: n.useRef(null), priority: n.useRef(null), labels: n.useRef(null) }, q = j?.setup?.state === "ready";
  n.useEffect(() => {
    t.call("status", {}).catch(() => {
    });
  }, [t]), n.useEffect(() => {
    q && t.call("meta", {}).then(v, () => {
    });
  }, [t, q, j?.revision]), n.useEffect(() => {
    const s = t.context.api;
    let c = !0;
    const h = async () => {
      try {
        const [N, a, G] = await Promise.all([s.sessions.observe(), s.workspace.observe(), s.panes.observe()]);
        if (!c) return;
        const J = new Set(G.find((i) => i.tabId === a.activeTabId)?.leafSessionIds ?? []), X = N.filter((i) => Ie(i.kind)).map((i) => ({ id: i.id, title: i.title || i.kind || "Agent", cwd: i.cwd, kind: i.kind, inActiveTab: J.has(i.id), working: i.activity === "working" })).sort((i, O) => Number(O.inActiveTab) - Number(i.inActiveTab) || i.title.localeCompare(O.title));
        Y(X.slice(0, 12));
      } catch {
      }
    };
    h();
    let w = () => {
    };
    try {
      w = s.sessions.subscribe(() => void h());
    } catch {
    }
    return () => {
      c = !1, w();
    };
  }, [t]);
  const b = x?.projectId ?? r?.projects.find((s) => s.isInbox)?.id;
  n.useEffect(() => {
    !b || d[b] || t.call("sections", { projectId: b }).then((s) => K((c) => ({ ...c, [b]: s })), () => {
    });
  }, [t, b, d]);
  const p = n.useMemo(() => r ? { ...r, sections: Object.values(d).flat() } : null, [r, d]), M = n.useMemo(() => se(u), [u]), y = p?.projects.find((s) => s.id === x?.projectId) ?? p?.projects.find((s) => s.isInbox), z = p?.sections.find((s) => s.id === x?.sectionId), D = I.find((s) => s.id === C) ?? null, B = async (s) => {
    const c = u.trim();
    if (!c || S) return;
    P(!0), A(null);
    let h;
    try {
      h = await t.call("quickAdd", { text: c });
    } catch (a) {
      A(R(a)), P(!1);
      return;
    }
    const w = r?.projects.find((a) => a.isInbox)?.id ?? null, N = () => {
      T(""), F(h.content), setTimeout(() => F(null), 2500), L.current?.focus();
    };
    try {
      await he(h, je(h, {
        due: g || null,
        priority: m,
        labels: f,
        projectId: x?.projectId ?? null,
        sectionId: x?.sectionId ?? null,
        inboxId: w,
        note: D ? Se(D) : null
      }), {
        update: (a) => t.call("update", a),
        move: (a) => t.call("move", a)
      }), s ? N() : await t.context.api.ui.close();
    } catch (a) {
      N(), A(a instanceof xe ? `${a.message} ${R(a.cause)}` : R(a));
    } finally {
      P(!1);
    }
  };
  return q ? /* @__PURE__ */ e.jsxs("div", { className: "td-root td-modal-root", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-qa", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-field", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "td-qa-mirror", "aria-hidden": "true", children: [
          M.map((s, c) => /* @__PURE__ */ e.jsx("span", { className: `tok-${s.kind}`, children: s.text }, c)),
          "​"
        ] }),
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            ref: L,
            autoFocus: !0,
            rows: 1,
            value: u,
            spellCheck: !1,
            placeholder: 'Task name — try "Review PR tomorrow 3pm p1 #Work @review"',
            onChange: (s) => T(s.target.value.replace(/\n/g, " ")),
            onKeyDown: (s) => {
              s.key === "Enter" && !s.nativeEvent.isComposing && (s.preventDefault(), B(s.shiftKey));
            }
          }
        )
      ] }),
      M.some((s) => s.kind !== "text") && H(u) && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-preview", children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: H(u) }),
        "”"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-chips", children: [
        /* @__PURE__ */ e.jsxs("button", { ref: o.due, className: `td-qa-chip${g ? " is-set" : ""}`, onClick: () => l("due"), children: [
          /* @__PURE__ */ e.jsx(ne, { size: 13 }),
          g || "Date"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: o.priority, className: `td-qa-chip${m > 1 ? " is-set" : ""}`, onClick: () => l("priority"), children: [
          /* @__PURE__ */ e.jsx(ae, { size: 13, color: m === 1 ? "var(--td-muted)" : ie[m] }),
          m > 1 ? `P${5 - m}` : "Priority"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: o.labels, className: `td-qa-chip${f.length ? " is-set" : ""}`, onClick: () => l("labels"), children: [
          /* @__PURE__ */ e.jsx(ce, { size: 13 }),
          f.length ? f.join(", ") : "Labels"
        ] })
      ] }),
      I.length > 0 && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-agents", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "td-qa-agents-label", children: [
          /* @__PURE__ */ e.jsx(le, { size: 13 }),
          " Link to agent"
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "td-qa-agent-list", children: I.map((s) => /* @__PURE__ */ e.jsxs(
          "button",
          {
            className: `td-agent-chip${C === s.id ? " is-on" : ""}`,
            title: s.cwd,
            onClick: () => _(C === s.id ? null : s.id),
            children: [
              /* @__PURE__ */ e.jsx("span", { className: `td-agent-dot${s.working ? " is-working" : ""}` }),
              s.title,
              s.inActiveTab && /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: " · this tab" })
            ]
          },
          s.id
        )) })
      ] }),
      $ && /* @__PURE__ */ e.jsx("div", { className: "td-warn", children: $ }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-foot", children: [
        /* @__PURE__ */ e.jsxs("button", { ref: o.project, className: "td-qa-project", onClick: () => l("project"), children: [
          y?.isInbox || !y ? /* @__PURE__ */ e.jsx(oe, { size: 14 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: re(y.color) } }),
          y?.name ?? "Inbox",
          z ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
            " / ",
            z.name
          ] }) : null
        ] }),
        /* @__PURE__ */ e.jsx("span", { className: "td-qa-hint", children: E ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          "Added “",
          E,
          "”"
        ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("kbd", { children: "↵" }),
          " add · ",
          /* @__PURE__ */ e.jsx("kbd", { children: "⇧↵" }),
          " add another"
        ] }) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => void t.context.api.ui.close(), children: "Cancel" }),
        /* @__PURE__ */ e.jsxs("button", { className: "td-btn td-btn-primary", disabled: !u.trim() || S, onClick: () => void B(!1), children: [
          S ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
          " Add task"
        ] })
      ] })
    ] }),
    k === "due" && /* @__PURE__ */ e.jsx(de, { anchor: o.due.current, current: g, onPick: V, onClose: () => l(null) }),
    k === "priority" && /* @__PURE__ */ e.jsx(ue, { anchor: o.priority.current, current: m, onPick: Q, onClose: () => l(null) }),
    k === "labels" && p && /* @__PURE__ */ e.jsx(
      me,
      {
        anchor: o.labels.current,
        labels: p.labels,
        selected: f,
        onChange: W,
        onCreate: async (s) => {
          await t.call("createLabel", { name: s }), v(await t.call("meta", {}));
        },
        onClose: () => l(null)
      }
    ),
    k === "project" && p && /* @__PURE__ */ e.jsx(pe, { anchor: o.project.current, meta: p, current: x ?? void 0, onPick: U, onClose: () => l(null) })
  ] }) : /* @__PURE__ */ e.jsx("div", { className: "td-root td-modal-root", children: /* @__PURE__ */ e.jsx(te, { setup: j?.setup ?? null, onRetry: async () => {
    await t.call("status", { refresh: !0 });
  } }) });
}
function Se(t) {
  return `From agent: **${t.title}** — \`${t.cwd}\``;
}
const qe = Ne({
  mount(t, j) {
    fe(be);
    const r = ve(), v = ge(j.runtime), d = ke(t);
    return d.render(
      /* @__PURE__ */ e.jsx(ye.Provider, { value: we(j), children: /* @__PURE__ */ e.jsx(Ce, {}) })
    ), () => {
      r(), v(), queueMicrotask(() => d.unmount());
    };
  }
});
export {
  qe as default
};

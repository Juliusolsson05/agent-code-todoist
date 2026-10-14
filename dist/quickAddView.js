import { u as Z, a as ee, r as n, t as se, j as e, S as te, c as H, C as ne, F as ae, P as ie, L as ce, A as le, I as oe, b as re, D as de, d as ue, e as pe, f as me, g as he, p as xe, h as je, i as fe, s as be, k as ve, l as ge, B as ke, m as ye } from "./shared-SetupScreen.js";
import { t as R, d as we } from "./shared-types.js";
function Ne(t) {
  return t !== "terminal" && t !== "extension-view";
}
function Ie() {
  const t = Z(), x = ee(t), [r, j] = n.useState(null), [v, K] = n.useState({}), [d, $] = n.useState(""), [h, U] = n.useState(null), [g, V] = n.useState(""), [u, Q] = n.useState(1), [f, W] = n.useState([]), [I, Y] = n.useState([]), [C, _] = n.useState(null), [k, l] = n.useState(null), [S, P] = n.useState(!1), [E, A] = n.useState(null), [F, T] = n.useState(null), L = n.useRef(null), o = { project: n.useRef(null), due: n.useRef(null), priority: n.useRef(null), labels: n.useRef(null) }, q = x?.setup?.state === "ready";
  n.useEffect(() => {
    t.call("status", {}).catch(() => {
    });
  }, [t]), n.useEffect(() => {
    q && t.call("meta", {}).then(j, () => {
    });
  }, [t, q, x?.revision]), n.useEffect(() => {
    const s = t.context.api;
    let c = !0;
    const m = async () => {
      try {
        const [N, a, G] = await Promise.all([s.sessions.observe(), s.workspace.observe(), s.panes.observe()]);
        if (!c) return;
        const J = new Set(G.find((i) => i.tabId === a.activeTabId)?.leafSessionIds ?? []), X = N.filter((i) => Ne(i.kind)).map((i) => ({ id: i.id, title: i.title || i.kind || "Agent", cwd: i.cwd, kind: i.kind, inActiveTab: J.has(i.id), working: i.activity === "working" })).sort((i, O) => Number(O.inActiveTab) - Number(i.inActiveTab) || i.title.localeCompare(O.title));
        Y(X.slice(0, 12));
      } catch {
      }
    };
    m();
    let w = () => {
    };
    try {
      w = s.sessions.subscribe(() => void m());
    } catch {
    }
    return () => {
      c = !1, w();
    };
  }, [t]);
  const b = h?.projectId ?? r?.projects.find((s) => s.isInbox)?.id;
  n.useEffect(() => {
    !b || v[b] || t.call("sections", { projectId: b }).then((s) => K((c) => ({ ...c, [b]: s })), () => {
    });
  }, [t, b, v]);
  const p = n.useMemo(() => r ? { ...r, sections: Object.values(v).flat() } : null, [r, v]), M = n.useMemo(() => se(d), [d]), y = p?.projects.find((s) => s.id === h?.projectId) ?? p?.projects.find((s) => s.isInbox), z = p?.sections.find((s) => s.id === h?.sectionId), D = I.find((s) => s.id === C) ?? null, B = async (s) => {
    const c = d.trim();
    if (!c || S) return;
    P(!0), A(null);
    let m;
    try {
      m = await t.call("quickAdd", { text: c });
    } catch (a) {
      A(R(a)), P(!1);
      return;
    }
    const w = r?.projects.find((a) => a.isInbox)?.id ?? null, N = () => {
      $(""), T(m.content), setTimeout(() => T(null), 2500), L.current?.focus();
    };
    try {
      await he(m, xe(m, {
        due: g || null,
        priority: u,
        labels: f,
        projectId: h?.projectId ?? null,
        sectionId: h?.sectionId ?? null,
        inboxId: w,
        note: D ? Ce(D) : null
      }), {
        update: (a) => t.call("update", a),
        move: (a) => t.call("move", a)
      }), s ? N() : await t.context.api.ui.close();
    } catch (a) {
      N(), A(a instanceof je ? `${a.message} ${R(a.cause)}` : R(a));
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
            value: d,
            spellCheck: !1,
            placeholder: 'Task name — try "Review PR tomorrow 3pm p1 #Work @review"',
            onChange: (s) => $(s.target.value.replace(/\n/g, " ")),
            onKeyDown: (s) => {
              s.key === "Enter" && !s.nativeEvent.isComposing && (s.preventDefault(), B(s.shiftKey));
            }
          }
        )
      ] }),
      M.some((s) => s.kind !== "text") && H(d) && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-preview", children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: H(d) }),
        "”"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-chips", children: [
        /* @__PURE__ */ e.jsxs("button", { ref: o.due, className: `td-qa-chip${g ? " is-set" : ""}`, onClick: () => l("due"), children: [
          /* @__PURE__ */ e.jsx(ne, { size: 13 }),
          g || "Date"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: o.priority, className: `td-qa-chip${u > 1 ? " is-set" : ""}`, onClick: () => l("priority"), children: [
          /* @__PURE__ */ e.jsx(ae, { size: 13, color: u === 1 ? "var(--td-muted)" : ie[u] }),
          u > 1 ? `P${5 - u}` : "Priority"
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
      E && /* @__PURE__ */ e.jsx("div", { className: "td-warn", children: E }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-foot", children: [
        /* @__PURE__ */ e.jsxs("button", { ref: o.project, className: "td-qa-project", onClick: () => l("project"), children: [
          y?.isInbox || !y ? /* @__PURE__ */ e.jsx(oe, { size: 14 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: re(y.color) } }),
          y?.name ?? "Inbox",
          z ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
            " / ",
            z.name
          ] }) : null
        ] }),
        /* @__PURE__ */ e.jsx("span", { className: "td-qa-hint", children: F ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          "Added “",
          F,
          "”"
        ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("kbd", { children: "↵" }),
          " add · ",
          /* @__PURE__ */ e.jsx("kbd", { children: "⇧↵" }),
          " add another"
        ] }) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => void t.context.api.ui.close(), children: "Cancel" }),
        /* @__PURE__ */ e.jsxs("button", { className: "td-btn td-btn-primary", disabled: !d.trim() || S, onClick: () => void B(!1), children: [
          S ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
          " Add task"
        ] })
      ] })
    ] }),
    k === "due" && /* @__PURE__ */ e.jsx(de, { anchor: o.due.current, current: g, onPick: V, onClose: () => l(null) }),
    k === "priority" && /* @__PURE__ */ e.jsx(ue, { anchor: o.priority.current, current: u, onPick: Q, onClose: () => l(null) }),
    k === "labels" && p && /* @__PURE__ */ e.jsx(
      pe,
      {
        anchor: o.labels.current,
        labels: p.labels,
        selected: f,
        onChange: W,
        onCreate: async (s) => {
          await t.call("createLabel", { name: s }), j(await t.call("meta", {}));
        },
        onClose: () => l(null)
      }
    ),
    k === "project" && p && /* @__PURE__ */ e.jsx(me, { anchor: o.project.current, meta: p, current: h ?? void 0, onPick: U, onClose: () => l(null) })
  ] }) : /* @__PURE__ */ e.jsx("div", { className: "td-root td-modal-root", children: /* @__PURE__ */ e.jsx(te, { setup: x?.setup ?? null, onRetry: async () => {
    await t.call("status", { refresh: !0 });
  } }) });
}
function Ce(t) {
  return `From agent: **${t.title}** — \`${t.cwd}\``;
}
const Ae = we({
  mount(t, x) {
    fe(be);
    const r = ve(), j = ge(t);
    return j.render(
      /* @__PURE__ */ e.jsx(ke.Provider, { value: ye(x), children: /* @__PURE__ */ e.jsx(Ie, {}) })
    ), () => {
      r(), queueMicrotask(() => j.unmount());
    };
  }
});
export {
  Ae as default
};

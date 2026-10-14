import { u as X, a as Z, r as s, t as ee, j as e, S as te, c as H, C as se, F as ne, P as ae, L as ie, A as ce, I as le, b as oe, D as re, d as de, e as ue, f as pe, i as me, s as he, g as je, h as xe, B as be, k as fe } from "./shared-SetupScreen.js";
import { t as ke, d as ve } from "./shared-types.js";
function ge() {
  const n = X(), d = Z(n), [l, b] = s.useState(null), [w, K] = s.useState({}), [j, R] = s.useState(""), [i, V] = s.useState(null), [f, Q] = s.useState(""), [u, W] = s.useState(1), [k, Y] = s.useState([]), [S, _] = s.useState([]), [P, G] = s.useState(null), [N, p] = s.useState(null), [q, $] = s.useState(!1), [E, L] = s.useState(null), [T, F] = s.useState(null), M = s.useRef(null), m = { project: s.useRef(null), due: s.useRef(null), priority: s.useRef(null), labels: s.useRef(null) }, A = d?.setup?.state === "ready";
  s.useEffect(() => {
    n.call("status", {}).catch(() => {
    });
  }, [n]), s.useEffect(() => {
    A && n.call("meta", {}).then(b, () => {
    });
  }, [n, A, d?.revision]), s.useEffect(() => {
    const t = n.context.api;
    let o = !0;
    const h = async () => {
      try {
        const [y, I, r] = await Promise.all([t.sessions.observe(), t.workspace.observe(), t.panes.observe()]);
        if (!o) return;
        const J = new Set(r.find((a) => a.tabId === I.activeTabId)?.leafSessionIds ?? []), U = y.filter((a) => a.kind && !/terminal|shell|extension/i.test(a.kind)).map((a) => ({ id: a.id, title: a.title || a.kind || "Agent", cwd: a.cwd, kind: a.kind, inActiveTab: J.has(a.id), working: a.activity === "working" })).sort((a, O) => Number(O.inActiveTab) - Number(a.inActiveTab) || a.title.localeCompare(O.title));
        _(U.slice(0, 12));
      } catch {
      }
    };
    h();
    let c = () => {
    };
    try {
      c = t.sessions.subscribe(() => void h());
    } catch {
    }
    return () => {
      o = !1, c();
    };
  }, [n]);
  const v = i?.projectId ?? l?.projects.find((t) => t.isInbox)?.id;
  s.useEffect(() => {
    !v || w[v] || n.call("sections", { projectId: v }).then((t) => K((o) => ({ ...o, [v]: t })), () => {
    });
  }, [n, v, w]);
  const x = s.useMemo(() => l ? { ...l, sections: Object.values(w).flat() } : null, [l, w]), g = s.useMemo(() => ee(j), [j]), C = x?.projects.find((t) => t.id === i?.projectId) ?? x?.projects.find((t) => t.isInbox), z = x?.sections.find((t) => t.id === i?.sectionId), D = S.find((t) => t.id === P) ?? null, B = async (t) => {
    const o = j.trim();
    if (!(!o || q)) {
      $(!0), L(null);
      try {
        let h = o;
        f && !g.some((r) => r.kind === "date") && (h += ` ${f}`), u > 1 && !g.some((r) => r.kind === "priority") && (h += ` p${5 - u}`);
        const c = await n.call("quickAdd", { text: h }), y = k.filter((r) => !c.labels.includes(r)), I = D ? ye(D, c.description) : null;
        (y.length || I !== null) && await n.call("update", {
          id: c.id,
          ...y.length ? { labels: [...c.labels, ...y] } : {},
          ...I !== null ? { description: I } : {}
        }), i && !g.some((r) => r.kind === "project") && (c.projectId !== i.projectId || i.sectionId) && await n.call("move", { id: c.id, projectId: i.projectId, ...i.sectionId ? { sectionId: i.sectionId } : {} }), t ? (R(""), F(c.content), setTimeout(() => F(null), 2500), M.current?.focus()) : await n.context.api.ui.close();
      } catch (h) {
        L(ke(h));
      } finally {
        $(!1);
      }
    }
  };
  return A ? /* @__PURE__ */ e.jsxs("div", { className: "td-root td-modal-root", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-qa", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-field", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "td-qa-mirror", "aria-hidden": "true", children: [
          g.map((t, o) => /* @__PURE__ */ e.jsx("span", { className: `tok-${t.kind}`, children: t.text }, o)),
          "​"
        ] }),
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            ref: M,
            autoFocus: !0,
            rows: 1,
            value: j,
            spellCheck: !1,
            placeholder: 'Task name — try "Review PR tomorrow 3pm p1 #Work @review"',
            onChange: (t) => R(t.target.value.replace(/\n/g, " ")),
            onKeyDown: (t) => {
              t.key === "Enter" && !t.nativeEvent.isComposing && (t.preventDefault(), B(t.shiftKey));
            }
          }
        )
      ] }),
      g.some((t) => t.kind !== "text") && H(j) && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-preview", children: [
        "Adds “",
        /* @__PURE__ */ e.jsx("b", { children: H(j) }),
        "”"
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-chips", children: [
        /* @__PURE__ */ e.jsxs("button", { ref: m.due, className: `td-qa-chip${f ? " is-set" : ""}`, onClick: () => p("due"), children: [
          /* @__PURE__ */ e.jsx(se, { size: 13 }),
          f || "Date"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: m.priority, className: `td-qa-chip${u > 1 ? " is-set" : ""}`, onClick: () => p("priority"), children: [
          /* @__PURE__ */ e.jsx(ne, { size: 13, color: u === 1 ? "var(--td-muted)" : ae[u] }),
          u > 1 ? `P${5 - u}` : "Priority"
        ] }),
        /* @__PURE__ */ e.jsxs("button", { ref: m.labels, className: `td-qa-chip${k.length ? " is-set" : ""}`, onClick: () => p("labels"), children: [
          /* @__PURE__ */ e.jsx(ie, { size: 13 }),
          k.length ? k.join(", ") : "Labels"
        ] })
      ] }),
      S.length > 0 && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-agents", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "td-qa-agents-label", children: [
          /* @__PURE__ */ e.jsx(ce, { size: 13 }),
          " Link to agent"
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "td-qa-agent-list", children: S.map((t) => /* @__PURE__ */ e.jsxs(
          "button",
          {
            className: `td-agent-chip${P === t.id ? " is-on" : ""}`,
            title: t.cwd,
            onClick: () => G(P === t.id ? null : t.id),
            children: [
              /* @__PURE__ */ e.jsx("span", { className: `td-agent-dot${t.working ? " is-working" : ""}` }),
              t.title,
              t.inActiveTab && /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: " · this tab" })
            ]
          },
          t.id
        )) })
      ] }),
      E && /* @__PURE__ */ e.jsx("div", { className: "td-warn", children: E }),
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-foot", children: [
        /* @__PURE__ */ e.jsxs("button", { ref: m.project, className: "td-qa-project", onClick: () => p("project"), children: [
          C?.isInbox || !C ? /* @__PURE__ */ e.jsx(le, { size: 14 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: oe(C.color) } }),
          C?.name ?? "Inbox",
          z ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
            " / ",
            z.name
          ] }) : null
        ] }),
        /* @__PURE__ */ e.jsx("span", { className: "td-qa-hint", children: T ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          "Added “",
          T,
          "”"
        ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx("kbd", { children: "↵" }),
          " add · ",
          /* @__PURE__ */ e.jsx("kbd", { children: "⇧↵" }),
          " add another"
        ] }) }),
        /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => void n.context.api.ui.close(), children: "Cancel" }),
        /* @__PURE__ */ e.jsxs("button", { className: "td-btn td-btn-primary", disabled: !j.trim() || q, onClick: () => void B(!1), children: [
          q ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
          " Add task"
        ] })
      ] })
    ] }),
    N === "due" && /* @__PURE__ */ e.jsx(re, { anchor: m.due.current, current: f, onPick: Q, onClose: () => p(null) }),
    N === "priority" && /* @__PURE__ */ e.jsx(de, { anchor: m.priority.current, current: u, onPick: W, onClose: () => p(null) }),
    N === "labels" && x && /* @__PURE__ */ e.jsx(
      ue,
      {
        anchor: m.labels.current,
        labels: x.labels,
        selected: k,
        onChange: Y,
        onCreate: async (t) => {
          await n.call("createLabel", { name: t }), b(await n.call("meta", {}));
        },
        onClose: () => p(null)
      }
    ),
    N === "project" && x && /* @__PURE__ */ e.jsx(pe, { anchor: m.project.current, meta: x, current: i ?? void 0, onPick: V, onClose: () => p(null) })
  ] }) : /* @__PURE__ */ e.jsx("div", { className: "td-root td-modal-root", children: /* @__PURE__ */ e.jsx(te, { setup: d?.setup ?? null, onRetry: async () => {
    await n.call("status", { refresh: !0 });
  } }) });
}
function ye(n, d) {
  const l = `From agent: **${n.title}** — \`${n.cwd}\``;
  return d ? `${d}

${l}` : l;
}
const Ne = ve({
  mount(n, d) {
    me(he);
    const l = je(), b = xe(n);
    return b.render(
      /* @__PURE__ */ e.jsx(be.Provider, { value: fe(d), children: /* @__PURE__ */ e.jsx(ge, {}) })
    ), () => {
      l(), queueMicrotask(() => b.unmount());
    };
  }
});
export {
  Ne as default
};

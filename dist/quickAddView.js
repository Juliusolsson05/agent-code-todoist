import { u as X, a as Z, r as s, t as ee, j as e, S as te, c as O, C as se, F as ne, P as ae, L as ie, D as ce, b as le, d as re, e as oe, A as de, I as ue, f as me, i as pe, s as he, g as je, h as xe, k as be, B as fe, l as ve } from "./shared-SetupScreen.js";
import { t as ke, d as ge } from "./shared-types.js";
function ye(n) {
  return n !== "terminal" && n !== "extension-view";
}
function Ie() {
  const n = X(), h = Z(n), [o, v] = s.useState(null), [d, H] = s.useState({}), [u, N] = s.useState(""), [j, K] = s.useState(null), [k, V] = s.useState(""), [m, W] = s.useState(1), [x, Q] = s.useState([]), [w, Y] = s.useState([]), [C, _] = s.useState(null), [g, l] = s.useState(null), [S, R] = s.useState(!1), [T, P] = s.useState(null), [E, L] = s.useState(null), $ = s.useRef(null), r = { project: s.useRef(null), due: s.useRef(null), priority: s.useRef(null), labels: s.useRef(null) }, q = h?.setup?.state === "ready";
  s.useEffect(() => {
    n.call("status", {}).catch(() => {
    });
  }, [n]), s.useEffect(() => {
    q && n.call("meta", {}).then(v, () => {
    });
  }, [n, q, h?.revision]), s.useEffect(() => {
    const t = n.context.api;
    let i = !0;
    const I = async () => {
      try {
        const [c, A, G] = await Promise.all([t.sessions.observe(), t.workspace.observe(), t.panes.observe()]);
        if (!i) return;
        const J = new Set(G.find((a) => a.tabId === A.activeTabId)?.leafSessionIds ?? []), U = c.filter((a) => ye(a.kind)).map((a) => ({ id: a.id, title: a.title || a.kind || "Agent", cwd: a.cwd, kind: a.kind, inActiveTab: J.has(a.id), working: a.activity === "working" })).sort((a, B) => Number(B.inActiveTab) - Number(a.inActiveTab) || a.title.localeCompare(B.title));
        Y(U.slice(0, 12));
      } catch {
      }
    };
    I();
    let f = () => {
    };
    try {
      f = t.sessions.subscribe(() => void I());
    } catch {
    }
    return () => {
      i = !1, f();
    };
  }, [n]);
  const b = j?.projectId ?? o?.projects.find((t) => t.isInbox)?.id;
  s.useEffect(() => {
    !b || d[b] || n.call("sections", { projectId: b }).then((t) => H((i) => ({ ...i, [b]: t })), () => {
    });
  }, [n, b, d]);
  const p = s.useMemo(() => o ? { ...o, sections: Object.values(d).flat() } : null, [o, d]), F = s.useMemo(() => ee(u), [u]), y = p?.projects.find((t) => t.id === j?.projectId) ?? p?.projects.find((t) => t.isInbox), M = p?.sections.find((t) => t.id === j?.sectionId), z = w.find((t) => t.id === C) ?? null, D = async (t) => {
    const i = u.trim();
    if (!i || S) return;
    R(!0), P(null);
    const I = o?.projects.find((c) => c.isInbox)?.id ?? null, f = i;
    N("");
    try {
      const c = await n.call("addWithIntent", {
        text: f,
        intent: {
          due: k || null,
          priority: m,
          labels: x,
          projectId: j?.projectId ?? null,
          sectionId: j?.sectionId ?? null,
          inboxId: I,
          note: z ? Ne(z) : null
        }
      });
      if (c.partial)
        P(c.partial);
      else if (t)
        L(c.task.content), setTimeout(() => L(null), 2500);
      else {
        await n.context.api.ui.close();
        return;
      }
      $.current?.focus();
    } catch (c) {
      N((A) => A || f), P(ke(c));
    } finally {
      R(!1);
    }
  };
  return q ? /* @__PURE__ */ e.jsx("div", { className: "td-root td-modal-root", children: /* @__PURE__ */ e.jsxs("div", { className: "td-qa", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "td-qa-field", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "td-qa-mirror", "aria-hidden": "true", children: [
        F.map((t, i) => /* @__PURE__ */ e.jsx("span", { className: `tok-${t.kind}`, children: t.text }, i)),
        "​"
      ] }),
      /* @__PURE__ */ e.jsx(
        "textarea",
        {
          ref: $,
          autoFocus: !0,
          rows: 1,
          value: u,
          spellCheck: !1,
          placeholder: 'Task name — try "Review PR tomorrow 3pm p1 #Work @review"',
          onChange: (t) => N(t.target.value.replace(/\n/g, " ")),
          onKeyDown: (t) => {
            t.key === "Enter" && !t.nativeEvent.isComposing && (t.preventDefault(), D(t.shiftKey));
          }
        }
      )
    ] }),
    F.some((t) => t.kind !== "text") && O(u) && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-preview", children: [
      "Adds “",
      /* @__PURE__ */ e.jsx("b", { children: O(u) }),
      "”"
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-qa-chips", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: r.due, className: `td-qa-chip${k ? " is-set" : ""}`, onClick: () => l("due"), children: [
        /* @__PURE__ */ e.jsx(se, { size: 13 }),
        k || "Date"
      ] }),
      /* @__PURE__ */ e.jsxs("button", { ref: r.priority, className: `td-qa-chip${m > 1 ? " is-set" : ""}`, onClick: () => l("priority"), children: [
        /* @__PURE__ */ e.jsx(ne, { size: 13, color: m === 1 ? "var(--td-muted)" : ae[m] }),
        m > 1 ? `P${5 - m}` : "Priority"
      ] }),
      /* @__PURE__ */ e.jsxs("button", { ref: r.labels, className: `td-qa-chip${x.length ? " is-set" : ""}`, onClick: () => l("labels"), children: [
        /* @__PURE__ */ e.jsx(ie, { size: 13 }),
        x.length ? x.join(", ") : "Labels"
      ] })
    ] }),
    g === "due" && /* @__PURE__ */ e.jsx(ce, { inline: !0, anchor: r.due.current, current: k, onPick: V, onClose: () => l(null) }),
    g === "priority" && /* @__PURE__ */ e.jsx(le, { inline: !0, anchor: r.priority.current, current: m, onPick: W, onClose: () => l(null) }),
    g === "labels" && p && /* @__PURE__ */ e.jsx(
      re,
      {
        inline: !0,
        anchor: r.labels.current,
        labels: p.labels,
        selected: x,
        onChange: Q,
        onCreate: async (t) => {
          await n.call("createLabel", { name: t }), v(await n.call("meta", {}));
        },
        onClose: () => l(null)
      }
    ),
    g === "project" && p && /* @__PURE__ */ e.jsx(oe, { inline: !0, anchor: r.project.current, meta: p, current: j ?? void 0, onPick: K, onClose: () => l(null) }),
    w.length > 0 && /* @__PURE__ */ e.jsxs("div", { className: "td-qa-agents", children: [
      /* @__PURE__ */ e.jsxs("span", { className: "td-qa-agents-label", children: [
        /* @__PURE__ */ e.jsx(de, { size: 13 }),
        " Link to agent"
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "td-qa-agent-list", children: w.map((t) => /* @__PURE__ */ e.jsxs(
        "button",
        {
          className: `td-agent-chip${C === t.id ? " is-on" : ""}`,
          title: t.cwd,
          onClick: () => _(C === t.id ? null : t.id),
          children: [
            /* @__PURE__ */ e.jsx("span", { className: `td-agent-dot${t.working ? " is-working" : ""}` }),
            t.title,
            t.inActiveTab && /* @__PURE__ */ e.jsx("span", { className: "td-dim", children: " · this tab" })
          ]
        },
        t.id
      )) })
    ] }),
    T && /* @__PURE__ */ e.jsx("div", { className: "td-warn", children: T }),
    /* @__PURE__ */ e.jsxs("div", { className: "td-qa-foot", children: [
      /* @__PURE__ */ e.jsxs("button", { ref: r.project, className: "td-qa-project", onClick: () => l("project"), children: [
        y?.isInbox || !y ? /* @__PURE__ */ e.jsx(ue, { size: 14 }) : /* @__PURE__ */ e.jsx("span", { className: "td-dot", style: { background: me(y.color) } }),
        y?.name ?? "Inbox",
        M ? /* @__PURE__ */ e.jsxs("span", { className: "td-dim", children: [
          " / ",
          M.name
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
      /* @__PURE__ */ e.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => void n.context.api.ui.close(), children: "Cancel" }),
      /* @__PURE__ */ e.jsxs("button", { className: "td-btn td-btn-primary", disabled: !u.trim() || S, onClick: () => void D(!1), children: [
        S ? /* @__PURE__ */ e.jsx("span", { className: "td-spinner" }) : null,
        " Add task"
      ] })
    ] })
  ] }) }) : /* @__PURE__ */ e.jsx("div", { className: "td-root td-modal-root", children: /* @__PURE__ */ e.jsx(te, { setup: h?.setup ?? null, onRetry: async () => {
    await n.call("status", { refresh: !0 });
  } }) });
}
function Ne(n) {
  return `From agent: **${n.title}** — \`${n.cwd}\``;
}
const Se = ge({
  mount(n, h) {
    pe(he);
    const o = je(), v = xe(h.runtime), d = be(n);
    return d.render(
      /* @__PURE__ */ e.jsx(fe.Provider, { value: ve(h), children: /* @__PURE__ */ e.jsx(Ie, {}) })
    ), () => {
      o(), v(), queueMicrotask(() => d.unmount());
    };
  }
});
export {
  Se as default
};

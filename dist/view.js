import { i as a, k as i, l as n, j as s, B as m, m as c, s as u } from "./shared-SetupScreen.js";
import { d } from "./shared-types.js";
import { A as p } from "./shared-App.js";
const j = d({
  mount(t, o) {
    a(u);
    const r = i(), e = n(t);
    return e.render(
      /* @__PURE__ */ s.jsx(m.Provider, { value: c(o), children: /* @__PURE__ */ s.jsx(p, {}) })
    ), () => {
      r(), queueMicrotask(() => e.unmount());
    };
  }
});
export {
  j as default
};

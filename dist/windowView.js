import { i as a, k as i, l as n, j as o, B as m, m as c, s as d } from "./shared-SetupScreen.js";
import { d as u } from "./shared-types.js";
import { A as l } from "./shared-App.js";
const j = u({
  mount(t, s) {
    a(d);
    const r = i(), e = n(t);
    return e.render(
      /* @__PURE__ */ o.jsx(m.Provider, { value: c(s), children: /* @__PURE__ */ o.jsx(l, { variant: "modal" }) })
    ), () => {
      r(), queueMicrotask(() => e.unmount());
    };
  }
});
export {
  j as default
};

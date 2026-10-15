import { i as n, k as i, l as m, m as c, j as o, B as d, n as u, s as p } from "./shared-SetupScreen.js";
import { d as l } from "./shared-types.js";
import { A as f } from "./shared-App.js";
const w = l({
  mount(t, e) {
    n(p);
    const r = i(), a = m(e.runtime), s = c(t);
    return s.render(
      /* @__PURE__ */ o.jsx(d.Provider, { value: u(e), children: /* @__PURE__ */ o.jsx(f, { variant: "modal" }) })
    ), () => {
      r(), a(), queueMicrotask(() => s.unmount());
    };
  }
});
export {
  w as default
};

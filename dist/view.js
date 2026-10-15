import { i as a, k as i, l as m, m as c, j as t, B as u, n as p, s as d } from "./shared-SetupScreen.js";
import { d as l } from "./shared-types.js";
import { A as f } from "./shared-App.js";
const y = l({
  mount(o, e) {
    a(d);
    const r = i(), n = m(e.runtime), s = c(o);
    return s.render(
      /* @__PURE__ */ t.jsx(u.Provider, { value: p(e), children: /* @__PURE__ */ t.jsx(f, {}) })
    ), () => {
      r(), n(), queueMicrotask(() => s.unmount());
    };
  }
});
export {
  y as default
};

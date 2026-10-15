import { i as n, g as i, h as m, k as c, j as t, B as u, l as p, s as d } from "./shared-SetupScreen.js";
import { d as l } from "./shared-types.js";
import { A as h } from "./shared-App.js";
const y = l({
  mount(o, e) {
    n(d);
    const r = i(), a = m(e.runtime), s = c(o);
    return s.render(
      /* @__PURE__ */ t.jsx(u.Provider, { value: p(e), children: /* @__PURE__ */ t.jsx(h, {}) })
    ), () => {
      r(), a(), queueMicrotask(() => s.unmount());
    };
  }
});
export {
  y as default
};

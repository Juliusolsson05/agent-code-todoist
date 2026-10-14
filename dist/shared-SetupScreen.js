import { t as pd } from "./shared-types.js";
var Ja = { exports: {} }, rl = {}, eu = { exports: {} }, T = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Xn = Symbol.for("react.element"), md = Symbol.for("react.portal"), hd = Symbol.for("react.fragment"), vd = Symbol.for("react.strict_mode"), gd = Symbol.for("react.profiler"), xd = Symbol.for("react.provider"), yd = Symbol.for("react.context"), wd = Symbol.for("react.forward_ref"), kd = Symbol.for("react.suspense"), Sd = Symbol.for("react.memo"), Ed = Symbol.for("react.lazy"), Ai = Symbol.iterator;
function jd(e) {
  return e === null || typeof e != "object" ? null : (e = Ai && e[Ai] || e["@@iterator"], typeof e == "function" ? e : null);
}
var tu = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, nu = Object.assign, ru = {};
function on(e, t, n) {
  this.props = e, this.context = t, this.refs = ru, this.updater = n || tu;
}
on.prototype.isReactComponent = {};
on.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
on.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function lu() {
}
lu.prototype = on.prototype;
function Wo(e, t, n) {
  this.props = e, this.context = t, this.refs = ru, this.updater = n || tu;
}
var Qo = Wo.prototype = new lu();
Qo.constructor = Wo;
nu(Qo, on.prototype);
Qo.isPureReactComponent = !0;
var Vi = Array.isArray, ou = Object.prototype.hasOwnProperty, Ko = { current: null }, iu = { key: !0, ref: !0, __self: !0, __source: !0 };
function au(e, t, n) {
  var r, l = {}, o = null, i = null;
  if (t != null) for (r in t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (o = "" + t.key), t) ou.call(t, r) && !iu.hasOwnProperty(r) && (l[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) l.children = n;
  else if (1 < a) {
    for (var u = Array(a), d = 0; d < a; d++) u[d] = arguments[d + 2];
    l.children = u;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) l[r] === void 0 && (l[r] = a[r]);
  return { $$typeof: Xn, type: e, key: o, ref: i, props: l, _owner: Ko.current };
}
function Cd(e, t) {
  return { $$typeof: Xn, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Yo(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Xn;
}
function Nd(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var Hi = /\/+/g;
function jl(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Nd("" + e.key) : t.toString(36);
}
function wr(e, t, n, r, l) {
  var o = typeof e;
  (o === "undefined" || o === "boolean") && (e = null);
  var i = !1;
  if (e === null) i = !0;
  else switch (o) {
    case "string":
    case "number":
      i = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case Xn:
        case md:
          i = !0;
      }
  }
  if (i) return i = e, l = l(i), e = r === "" ? "." + jl(i, 0) : r, Vi(l) ? (n = "", e != null && (n = e.replace(Hi, "$&/") + "/"), wr(l, t, n, "", function(d) {
    return d;
  })) : l != null && (Yo(l) && (l = Cd(l, n + (!l.key || i && i.key === l.key ? "" : ("" + l.key).replace(Hi, "$&/") + "/") + e)), t.push(l)), 1;
  if (i = 0, r = r === "" ? "." : r + ":", Vi(e)) for (var a = 0; a < e.length; a++) {
    o = e[a];
    var u = r + jl(o, a);
    i += wr(o, t, n, u, l);
  }
  else if (u = jd(e), typeof u == "function") for (e = u.call(e), a = 0; !(o = e.next()).done; ) o = o.value, u = r + jl(o, a++), i += wr(o, t, n, u, l);
  else if (o === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return i;
}
function nr(e, t, n) {
  if (e == null) return e;
  var r = [], l = 0;
  return wr(e, r, "", "", function(o) {
    return t.call(n, o, l++);
  }), r;
}
function zd(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
    }, function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var se = { current: null }, kr = { transition: null }, _d = { ReactCurrentDispatcher: se, ReactCurrentBatchConfig: kr, ReactCurrentOwner: Ko };
function uu() {
  throw Error("act(...) is not supported in production builds of React.");
}
T.Children = { map: nr, forEach: function(e, t, n) {
  nr(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return nr(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return nr(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!Yo(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
T.Component = on;
T.Fragment = hd;
T.Profiler = gd;
T.PureComponent = Wo;
T.StrictMode = vd;
T.Suspense = kd;
T.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = _d;
T.act = uu;
T.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = nu({}, e.props), l = e.key, o = e.ref, i = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (o = t.ref, i = Ko.current), t.key !== void 0 && (l = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (u in t) ou.call(t, u) && !iu.hasOwnProperty(u) && (r[u] = t[u] === void 0 && a !== void 0 ? a[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    a = Array(u);
    for (var d = 0; d < u; d++) a[d] = arguments[d + 2];
    r.children = a;
  }
  return { $$typeof: Xn, type: e.type, key: l, ref: o, props: r, _owner: i };
};
T.createContext = function(e) {
  return e = { $$typeof: yd, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: xd, _context: e }, e.Consumer = e;
};
T.createElement = au;
T.createFactory = function(e) {
  var t = au.bind(null, e);
  return t.type = e, t;
};
T.createRef = function() {
  return { current: null };
};
T.forwardRef = function(e) {
  return { $$typeof: wd, render: e };
};
T.isValidElement = Yo;
T.lazy = function(e) {
  return { $$typeof: Ed, _payload: { _status: -1, _result: e }, _init: zd };
};
T.memo = function(e, t) {
  return { $$typeof: Sd, type: e, compare: t === void 0 ? null : t };
};
T.startTransition = function(e) {
  var t = kr.transition;
  kr.transition = {};
  try {
    e();
  } finally {
    kr.transition = t;
  }
};
T.unstable_act = uu;
T.useCallback = function(e, t) {
  return se.current.useCallback(e, t);
};
T.useContext = function(e) {
  return se.current.useContext(e);
};
T.useDebugValue = function() {
};
T.useDeferredValue = function(e) {
  return se.current.useDeferredValue(e);
};
T.useEffect = function(e, t) {
  return se.current.useEffect(e, t);
};
T.useId = function() {
  return se.current.useId();
};
T.useImperativeHandle = function(e, t, n) {
  return se.current.useImperativeHandle(e, t, n);
};
T.useInsertionEffect = function(e, t) {
  return se.current.useInsertionEffect(e, t);
};
T.useLayoutEffect = function(e, t) {
  return se.current.useLayoutEffect(e, t);
};
T.useMemo = function(e, t) {
  return se.current.useMemo(e, t);
};
T.useReducer = function(e, t, n) {
  return se.current.useReducer(e, t, n);
};
T.useRef = function(e) {
  return se.current.useRef(e);
};
T.useState = function(e) {
  return se.current.useState(e);
};
T.useSyncExternalStore = function(e, t, n) {
  return se.current.useSyncExternalStore(e, t, n);
};
T.useTransition = function() {
  return se.current.useTransition();
};
T.version = "18.3.1";
eu.exports = T;
var R = eu.exports;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Pd = R, Md = Symbol.for("react.element"), Td = Symbol.for("react.fragment"), Ld = Object.prototype.hasOwnProperty, Id = Pd.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Rd = { key: !0, ref: !0, __self: !0, __source: !0 };
function su(e, t, n) {
  var r, l = {}, o = null, i = null;
  n !== void 0 && (o = "" + n), t.key !== void 0 && (o = "" + t.key), t.ref !== void 0 && (i = t.ref);
  for (r in t) Ld.call(t, r) && !Rd.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: Md, type: e, key: o, ref: i, props: l, _owner: Id.current };
}
rl.Fragment = Td;
rl.jsx = su;
rl.jsxs = su;
Ja.exports = rl;
var f = Ja.exports, du = { exports: {} }, we = {}, cu = { exports: {} }, fu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(e) {
  function t(j, P) {
    var M = j.length;
    j.push(P);
    e: for (; 0 < M; ) {
      var Q = M - 1 >>> 1, q = j[Q];
      if (0 < l(q, P)) j[Q] = P, j[M] = q, M = Q;
      else break e;
    }
  }
  function n(j) {
    return j.length === 0 ? null : j[0];
  }
  function r(j) {
    if (j.length === 0) return null;
    var P = j[0], M = j.pop();
    if (M !== P) {
      j[0] = M;
      e: for (var Q = 0, q = j.length, er = q >>> 1; Q < er; ) {
        var gt = 2 * (Q + 1) - 1, El = j[gt], xt = gt + 1, tr = j[xt];
        if (0 > l(El, M)) xt < q && 0 > l(tr, El) ? (j[Q] = tr, j[xt] = M, Q = xt) : (j[Q] = El, j[gt] = M, Q = gt);
        else if (xt < q && 0 > l(tr, M)) j[Q] = tr, j[xt] = M, Q = xt;
        else break e;
      }
    }
    return P;
  }
  function l(j, P) {
    var M = j.sortIndex - P.sortIndex;
    return M !== 0 ? M : j.id - P.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var o = performance;
    e.unstable_now = function() {
      return o.now();
    };
  } else {
    var i = Date, a = i.now();
    e.unstable_now = function() {
      return i.now() - a;
    };
  }
  var u = [], d = [], v = 1, h = null, m = 3, x = !1, w = !1, k = !1, _ = typeof setTimeout == "function" ? setTimeout : null, p = typeof clearTimeout == "function" ? clearTimeout : null, s = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function c(j) {
    for (var P = n(d); P !== null; ) {
      if (P.callback === null) r(d);
      else if (P.startTime <= j) r(d), P.sortIndex = P.expirationTime, t(u, P);
      else break;
      P = n(d);
    }
  }
  function g(j) {
    if (k = !1, c(j), !w) if (n(u) !== null) w = !0, kl(S);
    else {
      var P = n(d);
      P !== null && Sl(g, P.startTime - j);
    }
  }
  function S(j, P) {
    w = !1, k && (k = !1, p(z), z = -1), x = !0;
    var M = m;
    try {
      for (c(P), h = n(u); h !== null && (!(h.expirationTime > P) || j && !_e()); ) {
        var Q = h.callback;
        if (typeof Q == "function") {
          h.callback = null, m = h.priorityLevel;
          var q = Q(h.expirationTime <= P);
          P = e.unstable_now(), typeof q == "function" ? h.callback = q : h === n(u) && r(u), c(P);
        } else r(u);
        h = n(u);
      }
      if (h !== null) var er = !0;
      else {
        var gt = n(d);
        gt !== null && Sl(g, gt.startTime - P), er = !1;
      }
      return er;
    } finally {
      h = null, m = M, x = !1;
    }
  }
  var C = !1, N = null, z = -1, W = 5, L = -1;
  function _e() {
    return !(e.unstable_now() - L < W);
  }
  function sn() {
    if (N !== null) {
      var j = e.unstable_now();
      L = j;
      var P = !0;
      try {
        P = N(!0, j);
      } finally {
        P ? dn() : (C = !1, N = null);
      }
    } else C = !1;
  }
  var dn;
  if (typeof s == "function") dn = function() {
    s(sn);
  };
  else if (typeof MessageChannel < "u") {
    var Ui = new MessageChannel(), fd = Ui.port2;
    Ui.port1.onmessage = sn, dn = function() {
      fd.postMessage(null);
    };
  } else dn = function() {
    _(sn, 0);
  };
  function kl(j) {
    N = j, C || (C = !0, dn());
  }
  function Sl(j, P) {
    z = _(function() {
      j(e.unstable_now());
    }, P);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(j) {
    j.callback = null;
  }, e.unstable_continueExecution = function() {
    w || x || (w = !0, kl(S));
  }, e.unstable_forceFrameRate = function(j) {
    0 > j || 125 < j ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : W = 0 < j ? Math.floor(1e3 / j) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return m;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(u);
  }, e.unstable_next = function(j) {
    switch (m) {
      case 1:
      case 2:
      case 3:
        var P = 3;
        break;
      default:
        P = m;
    }
    var M = m;
    m = P;
    try {
      return j();
    } finally {
      m = M;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(j, P) {
    switch (j) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        j = 3;
    }
    var M = m;
    m = j;
    try {
      return P();
    } finally {
      m = M;
    }
  }, e.unstable_scheduleCallback = function(j, P, M) {
    var Q = e.unstable_now();
    switch (typeof M == "object" && M !== null ? (M = M.delay, M = typeof M == "number" && 0 < M ? Q + M : Q) : M = Q, j) {
      case 1:
        var q = -1;
        break;
      case 2:
        q = 250;
        break;
      case 5:
        q = 1073741823;
        break;
      case 4:
        q = 1e4;
        break;
      default:
        q = 5e3;
    }
    return q = M + q, j = { id: v++, callback: P, priorityLevel: j, startTime: M, expirationTime: q, sortIndex: -1 }, M > Q ? (j.sortIndex = M, t(d, j), n(u) === null && j === n(d) && (k ? (p(z), z = -1) : k = !0, Sl(g, M - Q))) : (j.sortIndex = q, t(u, j), w || x || (w = !0, kl(S))), j;
  }, e.unstable_shouldYield = _e, e.unstable_wrapCallback = function(j) {
    var P = m;
    return function() {
      var M = m;
      m = P;
      try {
        return j.apply(this, arguments);
      } finally {
        m = M;
      }
    };
  };
})(fu);
cu.exports = fu;
var Dd = cu.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Od = R, ye = Dd;
function y(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var pu = /* @__PURE__ */ new Set(), Ln = {};
function Tt(e, t) {
  Zt(e, t), Zt(e + "Capture", t);
}
function Zt(e, t) {
  for (Ln[e] = t, e = 0; e < t.length; e++) pu.add(t[e]);
}
var Qe = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), ql = Object.prototype.hasOwnProperty, Fd = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, bi = {}, Bi = {};
function $d(e) {
  return ql.call(Bi, e) ? !0 : ql.call(bi, e) ? !1 : Fd.test(e) ? Bi[e] = !0 : (bi[e] = !0, !1);
}
function Ud(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function Ad(e, t, n, r) {
  if (t === null || typeof t > "u" || Ud(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null) switch (n.type) {
    case 3:
      return !t;
    case 4:
      return t === !1;
    case 5:
      return isNaN(t);
    case 6:
      return isNaN(t) || 1 > t;
  }
  return !1;
}
function de(e, t, n, r, l, o, i) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = l, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = o, this.removeEmptyString = i;
}
var ne = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  ne[e] = new de(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  ne[t] = new de(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  ne[e] = new de(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  ne[e] = new de(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  ne[e] = new de(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  ne[e] = new de(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  ne[e] = new de(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  ne[e] = new de(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  ne[e] = new de(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Xo = /[\-:]([a-z])/g;
function Go(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    Xo,
    Go
  );
  ne[t] = new de(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(Xo, Go);
  ne[t] = new de(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(Xo, Go);
  ne[t] = new de(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  ne[e] = new de(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
ne.xlinkHref = new de("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  ne[e] = new de(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function qo(e, t, n, r) {
  var l = ne.hasOwnProperty(t) ? ne[t] : null;
  (l !== null ? l.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Ad(t, n, l, r) && (n = null), r || l === null ? $d(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : l.mustUseProperty ? e[l.propertyName] = n === null ? l.type === 3 ? !1 : "" : n : (t = l.attributeName, r = l.attributeNamespace, n === null ? e.removeAttribute(t) : (l = l.type, n = l === 3 || l === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Ge = Od.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, rr = Symbol.for("react.element"), Rt = Symbol.for("react.portal"), Dt = Symbol.for("react.fragment"), Zo = Symbol.for("react.strict_mode"), Zl = Symbol.for("react.profiler"), mu = Symbol.for("react.provider"), hu = Symbol.for("react.context"), Jo = Symbol.for("react.forward_ref"), Jl = Symbol.for("react.suspense"), eo = Symbol.for("react.suspense_list"), ei = Symbol.for("react.memo"), Ze = Symbol.for("react.lazy"), vu = Symbol.for("react.offscreen"), Wi = Symbol.iterator;
function cn(e) {
  return e === null || typeof e != "object" ? null : (e = Wi && e[Wi] || e["@@iterator"], typeof e == "function" ? e : null);
}
var b = Object.assign, Cl;
function yn(e) {
  if (Cl === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Cl = t && t[1] || "";
  }
  return `
` + Cl + e;
}
var Nl = !1;
function zl(e, t) {
  if (!e || Nl) return "";
  Nl = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t) if (t = function() {
      throw Error();
    }, Object.defineProperty(t.prototype, "props", { set: function() {
      throw Error();
    } }), typeof Reflect == "object" && Reflect.construct) {
      try {
        Reflect.construct(t, []);
      } catch (d) {
        var r = d;
      }
      Reflect.construct(e, [], t);
    } else {
      try {
        t.call();
      } catch (d) {
        r = d;
      }
      e.call(t.prototype);
    }
    else {
      try {
        throw Error();
      } catch (d) {
        r = d;
      }
      e();
    }
  } catch (d) {
    if (d && r && typeof d.stack == "string") {
      for (var l = d.stack.split(`
`), o = r.stack.split(`
`), i = l.length - 1, a = o.length - 1; 1 <= i && 0 <= a && l[i] !== o[a]; ) a--;
      for (; 1 <= i && 0 <= a; i--, a--) if (l[i] !== o[a]) {
        if (i !== 1 || a !== 1)
          do
            if (i--, a--, 0 > a || l[i] !== o[a]) {
              var u = `
` + l[i].replace(" at new ", " at ");
              return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
            }
          while (1 <= i && 0 <= a);
        break;
      }
    }
  } finally {
    Nl = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? yn(e) : "";
}
function Vd(e) {
  switch (e.tag) {
    case 5:
      return yn(e.type);
    case 16:
      return yn("Lazy");
    case 13:
      return yn("Suspense");
    case 19:
      return yn("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = zl(e.type, !1), e;
    case 11:
      return e = zl(e.type.render, !1), e;
    case 1:
      return e = zl(e.type, !0), e;
    default:
      return "";
  }
}
function to(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Dt:
      return "Fragment";
    case Rt:
      return "Portal";
    case Zl:
      return "Profiler";
    case Zo:
      return "StrictMode";
    case Jl:
      return "Suspense";
    case eo:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case hu:
      return (e.displayName || "Context") + ".Consumer";
    case mu:
      return (e._context.displayName || "Context") + ".Provider";
    case Jo:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case ei:
      return t = e.displayName || null, t !== null ? t : to(e.type) || "Memo";
    case Ze:
      t = e._payload, e = e._init;
      try {
        return to(e(t));
      } catch {
      }
  }
  return null;
}
function Hd(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return to(t);
    case 8:
      return t === Zo ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function ft(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function gu(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function bd(e) {
  var t = gu(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var l = n.get, o = n.set;
    return Object.defineProperty(e, t, { configurable: !0, get: function() {
      return l.call(this);
    }, set: function(i) {
      r = "" + i, o.call(this, i);
    } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function() {
      return r;
    }, setValue: function(i) {
      r = "" + i;
    }, stopTracking: function() {
      e._valueTracker = null, delete e[t];
    } };
  }
}
function lr(e) {
  e._valueTracker || (e._valueTracker = bd(e));
}
function xu(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = gu(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Lr(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function no(e, t) {
  var n = t.checked;
  return b({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function Qi(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = ft(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function yu(e, t) {
  t = t.checked, t != null && qo(e, "checked", t, !1);
}
function ro(e, t) {
  yu(e, t);
  var n = ft(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? lo(e, t.type, n) : t.hasOwnProperty("defaultValue") && lo(e, t.type, ft(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function Ki(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function lo(e, t, n) {
  (t !== "number" || Lr(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var wn = Array.isArray;
function Qt(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++) l = t.hasOwnProperty("$" + e[n].value), e[n].selected !== l && (e[n].selected = l), l && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + ft(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        e[l].selected = !0, r && (e[l].defaultSelected = !0);
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function oo(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(y(91));
  return b({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Yi(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(y(92));
      if (wn(n)) {
        if (1 < n.length) throw Error(y(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: ft(n) };
}
function wu(e, t) {
  var n = ft(t.value), r = ft(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Xi(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function ku(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function io(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? ku(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var or, Su = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, l) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, l);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (or = or || document.createElement("div"), or.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = or.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function In(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var En = {
  animationIterationCount: !0,
  aspectRatio: !0,
  borderImageOutset: !0,
  borderImageSlice: !0,
  borderImageWidth: !0,
  boxFlex: !0,
  boxFlexGroup: !0,
  boxOrdinalGroup: !0,
  columnCount: !0,
  columns: !0,
  flex: !0,
  flexGrow: !0,
  flexPositive: !0,
  flexShrink: !0,
  flexNegative: !0,
  flexOrder: !0,
  gridArea: !0,
  gridRow: !0,
  gridRowEnd: !0,
  gridRowSpan: !0,
  gridRowStart: !0,
  gridColumn: !0,
  gridColumnEnd: !0,
  gridColumnSpan: !0,
  gridColumnStart: !0,
  fontWeight: !0,
  lineClamp: !0,
  lineHeight: !0,
  opacity: !0,
  order: !0,
  orphans: !0,
  tabSize: !0,
  widows: !0,
  zIndex: !0,
  zoom: !0,
  fillOpacity: !0,
  floodOpacity: !0,
  stopOpacity: !0,
  strokeDasharray: !0,
  strokeDashoffset: !0,
  strokeMiterlimit: !0,
  strokeOpacity: !0,
  strokeWidth: !0
}, Bd = ["Webkit", "ms", "Moz", "O"];
Object.keys(En).forEach(function(e) {
  Bd.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), En[t] = En[e];
  });
});
function Eu(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || En.hasOwnProperty(e) && En[e] ? ("" + t).trim() : t + "px";
}
function ju(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, l = Eu(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : e[n] = l;
  }
}
var Wd = b({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function ao(e, t) {
  if (t) {
    if (Wd[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(y(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(y(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(y(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(y(62));
  }
}
function uo(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var so = null;
function ti(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var co = null, Kt = null, Yt = null;
function Gi(e) {
  if (e = Zn(e)) {
    if (typeof co != "function") throw Error(y(280));
    var t = e.stateNode;
    t && (t = ul(t), co(e.stateNode, e.type, t));
  }
}
function Cu(e) {
  Kt ? Yt ? Yt.push(e) : Yt = [e] : Kt = e;
}
function Nu() {
  if (Kt) {
    var e = Kt, t = Yt;
    if (Yt = Kt = null, Gi(e), t) for (e = 0; e < t.length; e++) Gi(t[e]);
  }
}
function zu(e, t) {
  return e(t);
}
function _u() {
}
var _l = !1;
function Pu(e, t, n) {
  if (_l) return e(t, n);
  _l = !0;
  try {
    return zu(e, t, n);
  } finally {
    _l = !1, (Kt !== null || Yt !== null) && (_u(), Nu());
  }
}
function Rn(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = ul(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(y(231, t, typeof n));
  return n;
}
var fo = !1;
if (Qe) try {
  var fn = {};
  Object.defineProperty(fn, "passive", { get: function() {
    fo = !0;
  } }), window.addEventListener("test", fn, fn), window.removeEventListener("test", fn, fn);
} catch {
  fo = !1;
}
function Qd(e, t, n, r, l, o, i, a, u) {
  var d = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, d);
  } catch (v) {
    this.onError(v);
  }
}
var jn = !1, Ir = null, Rr = !1, po = null, Kd = { onError: function(e) {
  jn = !0, Ir = e;
} };
function Yd(e, t, n, r, l, o, i, a, u) {
  jn = !1, Ir = null, Qd.apply(Kd, arguments);
}
function Xd(e, t, n, r, l, o, i, a, u) {
  if (Yd.apply(this, arguments), jn) {
    if (jn) {
      var d = Ir;
      jn = !1, Ir = null;
    } else throw Error(y(198));
    Rr || (Rr = !0, po = d);
  }
}
function Lt(e) {
  var t = e, n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do
      t = e, t.flags & 4098 && (n = t.return), e = t.return;
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Mu(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function qi(e) {
  if (Lt(e) !== e) throw Error(y(188));
}
function Gd(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Lt(e), t === null) throw Error(y(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var l = n.return;
    if (l === null) break;
    var o = l.alternate;
    if (o === null) {
      if (r = l.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (l.child === o.child) {
      for (o = l.child; o; ) {
        if (o === n) return qi(l), e;
        if (o === r) return qi(l), t;
        o = o.sibling;
      }
      throw Error(y(188));
    }
    if (n.return !== r.return) n = l, r = o;
    else {
      for (var i = !1, a = l.child; a; ) {
        if (a === n) {
          i = !0, n = l, r = o;
          break;
        }
        if (a === r) {
          i = !0, r = l, n = o;
          break;
        }
        a = a.sibling;
      }
      if (!i) {
        for (a = o.child; a; ) {
          if (a === n) {
            i = !0, n = o, r = l;
            break;
          }
          if (a === r) {
            i = !0, r = o, n = l;
            break;
          }
          a = a.sibling;
        }
        if (!i) throw Error(y(189));
      }
    }
    if (n.alternate !== r) throw Error(y(190));
  }
  if (n.tag !== 3) throw Error(y(188));
  return n.stateNode.current === n ? e : t;
}
function Tu(e) {
  return e = Gd(e), e !== null ? Lu(e) : null;
}
function Lu(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Lu(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Iu = ye.unstable_scheduleCallback, Zi = ye.unstable_cancelCallback, qd = ye.unstable_shouldYield, Zd = ye.unstable_requestPaint, K = ye.unstable_now, Jd = ye.unstable_getCurrentPriorityLevel, ni = ye.unstable_ImmediatePriority, Ru = ye.unstable_UserBlockingPriority, Dr = ye.unstable_NormalPriority, ec = ye.unstable_LowPriority, Du = ye.unstable_IdlePriority, ll = null, Ue = null;
function tc(e) {
  if (Ue && typeof Ue.onCommitFiberRoot == "function") try {
    Ue.onCommitFiberRoot(ll, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var Ie = Math.clz32 ? Math.clz32 : lc, nc = Math.log, rc = Math.LN2;
function lc(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (nc(e) / rc | 0) | 0;
}
var ir = 64, ar = 4194304;
function kn(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function Or(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, l = e.suspendedLanes, o = e.pingedLanes, i = n & 268435455;
  if (i !== 0) {
    var a = i & ~l;
    a !== 0 ? r = kn(a) : (o &= i, o !== 0 && (r = kn(o)));
  } else i = n & ~l, i !== 0 ? r = kn(i) : o !== 0 && (r = kn(o));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & l) && (l = r & -r, o = t & -t, l >= o || l === 16 && (o & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - Ie(t), l = 1 << n, r |= e[n], t &= ~l;
  return r;
}
function oc(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function ic(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, o = e.pendingLanes; 0 < o; ) {
    var i = 31 - Ie(o), a = 1 << i, u = l[i];
    u === -1 ? (!(a & n) || a & r) && (l[i] = oc(a, t)) : u <= t && (e.expiredLanes |= a), o &= ~a;
  }
}
function mo(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Ou() {
  var e = ir;
  return ir <<= 1, !(ir & 4194240) && (ir = 64), e;
}
function Pl(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Gn(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Ie(t), e[t] = n;
}
function ac(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - Ie(n), o = 1 << l;
    t[l] = 0, r[l] = -1, e[l] = -1, n &= ~o;
  }
}
function ri(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - Ie(n), l = 1 << r;
    l & t | e[r] & t && (e[r] |= t), n &= ~l;
  }
}
var D = 0;
function Fu(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var $u, li, Uu, Au, Vu, ho = !1, ur = [], lt = null, ot = null, it = null, Dn = /* @__PURE__ */ new Map(), On = /* @__PURE__ */ new Map(), et = [], uc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Ji(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      lt = null;
      break;
    case "dragenter":
    case "dragleave":
      ot = null;
      break;
    case "mouseover":
    case "mouseout":
      it = null;
      break;
    case "pointerover":
    case "pointerout":
      Dn.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      On.delete(t.pointerId);
  }
}
function pn(e, t, n, r, l, o) {
  return e === null || e.nativeEvent !== o ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: o, targetContainers: [l] }, t !== null && (t = Zn(t), t !== null && li(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, l !== null && t.indexOf(l) === -1 && t.push(l), e);
}
function sc(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return lt = pn(lt, e, t, n, r, l), !0;
    case "dragenter":
      return ot = pn(ot, e, t, n, r, l), !0;
    case "mouseover":
      return it = pn(it, e, t, n, r, l), !0;
    case "pointerover":
      var o = l.pointerId;
      return Dn.set(o, pn(Dn.get(o) || null, e, t, n, r, l)), !0;
    case "gotpointercapture":
      return o = l.pointerId, On.set(o, pn(On.get(o) || null, e, t, n, r, l)), !0;
  }
  return !1;
}
function Hu(e) {
  var t = kt(e.target);
  if (t !== null) {
    var n = Lt(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Mu(n), t !== null) {
          e.blockedOn = t, Vu(e.priority, function() {
            Uu(n);
          });
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function Sr(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = vo(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      so = r, n.target.dispatchEvent(r), so = null;
    } else return t = Zn(n), t !== null && li(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function ea(e, t, n) {
  Sr(e) && n.delete(t);
}
function dc() {
  ho = !1, lt !== null && Sr(lt) && (lt = null), ot !== null && Sr(ot) && (ot = null), it !== null && Sr(it) && (it = null), Dn.forEach(ea), On.forEach(ea);
}
function mn(e, t) {
  e.blockedOn === t && (e.blockedOn = null, ho || (ho = !0, ye.unstable_scheduleCallback(ye.unstable_NormalPriority, dc)));
}
function Fn(e) {
  function t(l) {
    return mn(l, e);
  }
  if (0 < ur.length) {
    mn(ur[0], e);
    for (var n = 1; n < ur.length; n++) {
      var r = ur[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (lt !== null && mn(lt, e), ot !== null && mn(ot, e), it !== null && mn(it, e), Dn.forEach(t), On.forEach(t), n = 0; n < et.length; n++) r = et[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < et.length && (n = et[0], n.blockedOn === null); ) Hu(n), n.blockedOn === null && et.shift();
}
var Xt = Ge.ReactCurrentBatchConfig, Fr = !0;
function cc(e, t, n, r) {
  var l = D, o = Xt.transition;
  Xt.transition = null;
  try {
    D = 1, oi(e, t, n, r);
  } finally {
    D = l, Xt.transition = o;
  }
}
function fc(e, t, n, r) {
  var l = D, o = Xt.transition;
  Xt.transition = null;
  try {
    D = 4, oi(e, t, n, r);
  } finally {
    D = l, Xt.transition = o;
  }
}
function oi(e, t, n, r) {
  if (Fr) {
    var l = vo(e, t, n, r);
    if (l === null) Ul(e, t, r, $r, n), Ji(e, r);
    else if (sc(l, e, t, n, r)) r.stopPropagation();
    else if (Ji(e, r), t & 4 && -1 < uc.indexOf(e)) {
      for (; l !== null; ) {
        var o = Zn(l);
        if (o !== null && $u(o), o = vo(e, t, n, r), o === null && Ul(e, t, r, $r, n), o === l) break;
        l = o;
      }
      l !== null && r.stopPropagation();
    } else Ul(e, t, r, null, n);
  }
}
var $r = null;
function vo(e, t, n, r) {
  if ($r = null, e = ti(r), e = kt(e), e !== null) if (t = Lt(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Mu(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return $r = e, null;
}
function bu(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Jd()) {
        case ni:
          return 1;
        case Ru:
          return 4;
        case Dr:
        case ec:
          return 16;
        case Du:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var nt = null, ii = null, Er = null;
function Bu() {
  if (Er) return Er;
  var e, t = ii, n = t.length, r, l = "value" in nt ? nt.value : nt.textContent, o = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++) ;
  var i = n - e;
  for (r = 1; r <= i && t[n - r] === l[o - r]; r++) ;
  return Er = l.slice(e, 1 < r ? 1 - r : void 0);
}
function jr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function sr() {
  return !0;
}
function ta() {
  return !1;
}
function ke(e) {
  function t(n, r, l, o, i) {
    this._reactName = n, this._targetInst = l, this.type = r, this.nativeEvent = o, this.target = i, this.currentTarget = null;
    for (var a in e) e.hasOwnProperty(a) && (n = e[a], this[a] = n ? n(o) : o[a]);
    return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? sr : ta, this.isPropagationStopped = ta, this;
  }
  return b(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = sr);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = sr);
  }, persist: function() {
  }, isPersistent: sr }), t;
}
var an = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, ai = ke(an), qn = b({}, an, { view: 0, detail: 0 }), pc = ke(qn), Ml, Tl, hn, ol = b({}, qn, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: ui, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== hn && (hn && e.type === "mousemove" ? (Ml = e.screenX - hn.screenX, Tl = e.screenY - hn.screenY) : Tl = Ml = 0, hn = e), Ml);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : Tl;
} }), na = ke(ol), mc = b({}, ol, { dataTransfer: 0 }), hc = ke(mc), vc = b({}, qn, { relatedTarget: 0 }), Ll = ke(vc), gc = b({}, an, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), xc = ke(gc), yc = b({}, an, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), wc = ke(yc), kc = b({}, an, { data: 0 }), ra = ke(kc), Sc = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, Ec = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, jc = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Cc(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = jc[e]) ? !!t[e] : !1;
}
function ui() {
  return Cc;
}
var Nc = b({}, qn, { key: function(e) {
  if (e.key) {
    var t = Sc[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = jr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Ec[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: ui, charCode: function(e) {
  return e.type === "keypress" ? jr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? jr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), zc = ke(Nc), _c = b({}, ol, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), la = ke(_c), Pc = b({}, qn, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: ui }), Mc = ke(Pc), Tc = b({}, an, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Lc = ke(Tc), Ic = b({}, ol, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Rc = ke(Ic), Dc = [9, 13, 27, 32], si = Qe && "CompositionEvent" in window, Cn = null;
Qe && "documentMode" in document && (Cn = document.documentMode);
var Oc = Qe && "TextEvent" in window && !Cn, Wu = Qe && (!si || Cn && 8 < Cn && 11 >= Cn), oa = " ", ia = !1;
function Qu(e, t) {
  switch (e) {
    case "keyup":
      return Dc.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function Ku(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var Ot = !1;
function Fc(e, t) {
  switch (e) {
    case "compositionend":
      return Ku(t);
    case "keypress":
      return t.which !== 32 ? null : (ia = !0, oa);
    case "textInput":
      return e = t.data, e === oa && ia ? null : e;
    default:
      return null;
  }
}
function $c(e, t) {
  if (Ot) return e === "compositionend" || !si && Qu(e, t) ? (e = Bu(), Er = ii = nt = null, Ot = !1, e) : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Wu && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Uc = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function aa(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Uc[e.type] : t === "textarea";
}
function Yu(e, t, n, r) {
  Cu(r), t = Ur(t, "onChange"), 0 < t.length && (n = new ai("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var Nn = null, $n = null;
function Ac(e) {
  os(e, 0);
}
function il(e) {
  var t = Ut(e);
  if (xu(t)) return e;
}
function Vc(e, t) {
  if (e === "change") return t;
}
var Xu = !1;
if (Qe) {
  var Il;
  if (Qe) {
    var Rl = "oninput" in document;
    if (!Rl) {
      var ua = document.createElement("div");
      ua.setAttribute("oninput", "return;"), Rl = typeof ua.oninput == "function";
    }
    Il = Rl;
  } else Il = !1;
  Xu = Il && (!document.documentMode || 9 < document.documentMode);
}
function sa() {
  Nn && (Nn.detachEvent("onpropertychange", Gu), $n = Nn = null);
}
function Gu(e) {
  if (e.propertyName === "value" && il($n)) {
    var t = [];
    Yu(t, $n, e, ti(e)), Pu(Ac, t);
  }
}
function Hc(e, t, n) {
  e === "focusin" ? (sa(), Nn = t, $n = n, Nn.attachEvent("onpropertychange", Gu)) : e === "focusout" && sa();
}
function bc(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return il($n);
}
function Bc(e, t) {
  if (e === "click") return il(t);
}
function Wc(e, t) {
  if (e === "input" || e === "change") return il(t);
}
function Qc(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var De = typeof Object.is == "function" ? Object.is : Qc;
function Un(e, t) {
  if (De(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!ql.call(t, l) || !De(e[l], t[l])) return !1;
  }
  return !0;
}
function da(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function ca(e, t) {
  var n = da(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (r = e + n.textContent.length, e <= t && r >= t) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = da(n);
  }
}
function qu(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? qu(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function Zu() {
  for (var e = window, t = Lr(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Lr(e.document);
  }
  return t;
}
function di(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function Kc(e) {
  var t = Zu(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && qu(n.ownerDocument.documentElement, n)) {
    if (r !== null && di(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var l = n.textContent.length, o = Math.min(r.start, l);
        r = r.end === void 0 ? o : Math.min(r.end, l), !e.extend && o > r && (l = r, r = o, o = l), l = ca(n, o);
        var i = ca(
          n,
          r
        );
        l && i && (e.rangeCount !== 1 || e.anchorNode !== l.node || e.anchorOffset !== l.offset || e.focusNode !== i.node || e.focusOffset !== i.offset) && (t = t.createRange(), t.setStart(l.node, l.offset), e.removeAllRanges(), o > r ? (e.addRange(t), e.extend(i.node, i.offset)) : (t.setEnd(i.node, i.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
  }
}
var Yc = Qe && "documentMode" in document && 11 >= document.documentMode, Ft = null, go = null, zn = null, xo = !1;
function fa(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  xo || Ft == null || Ft !== Lr(r) || (r = Ft, "selectionStart" in r && di(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), zn && Un(zn, r) || (zn = r, r = Ur(go, "onSelect"), 0 < r.length && (t = new ai("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = Ft)));
}
function dr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var $t = { animationend: dr("Animation", "AnimationEnd"), animationiteration: dr("Animation", "AnimationIteration"), animationstart: dr("Animation", "AnimationStart"), transitionend: dr("Transition", "TransitionEnd") }, Dl = {}, Ju = {};
Qe && (Ju = document.createElement("div").style, "AnimationEvent" in window || (delete $t.animationend.animation, delete $t.animationiteration.animation, delete $t.animationstart.animation), "TransitionEvent" in window || delete $t.transitionend.transition);
function al(e) {
  if (Dl[e]) return Dl[e];
  if (!$t[e]) return e;
  var t = $t[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in Ju) return Dl[e] = t[n];
  return e;
}
var es = al("animationend"), ts = al("animationiteration"), ns = al("animationstart"), rs = al("transitionend"), ls = /* @__PURE__ */ new Map(), pa = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function mt(e, t) {
  ls.set(e, t), Tt(t, [e]);
}
for (var Ol = 0; Ol < pa.length; Ol++) {
  var Fl = pa[Ol], Xc = Fl.toLowerCase(), Gc = Fl[0].toUpperCase() + Fl.slice(1);
  mt(Xc, "on" + Gc);
}
mt(es, "onAnimationEnd");
mt(ts, "onAnimationIteration");
mt(ns, "onAnimationStart");
mt("dblclick", "onDoubleClick");
mt("focusin", "onFocus");
mt("focusout", "onBlur");
mt(rs, "onTransitionEnd");
Zt("onMouseEnter", ["mouseout", "mouseover"]);
Zt("onMouseLeave", ["mouseout", "mouseover"]);
Zt("onPointerEnter", ["pointerout", "pointerover"]);
Zt("onPointerLeave", ["pointerout", "pointerover"]);
Tt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Tt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Tt("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Tt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Tt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Tt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Sn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), qc = new Set("cancel close invalid load scroll toggle".split(" ").concat(Sn));
function ma(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, Xd(r, t, void 0, e), e.currentTarget = null;
}
function os(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], l = r.event;
    r = r.listeners;
    e: {
      var o = void 0;
      if (t) for (var i = r.length - 1; 0 <= i; i--) {
        var a = r[i], u = a.instance, d = a.currentTarget;
        if (a = a.listener, u !== o && l.isPropagationStopped()) break e;
        ma(l, a, d), o = u;
      }
      else for (i = 0; i < r.length; i++) {
        if (a = r[i], u = a.instance, d = a.currentTarget, a = a.listener, u !== o && l.isPropagationStopped()) break e;
        ma(l, a, d), o = u;
      }
    }
  }
  if (Rr) throw e = po, Rr = !1, po = null, e;
}
function $(e, t) {
  var n = t[Eo];
  n === void 0 && (n = t[Eo] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (is(t, e, 2, !1), n.add(r));
}
function $l(e, t, n) {
  var r = 0;
  t && (r |= 4), is(n, e, r, t);
}
var cr = "_reactListening" + Math.random().toString(36).slice(2);
function An(e) {
  if (!e[cr]) {
    e[cr] = !0, pu.forEach(function(n) {
      n !== "selectionchange" && (qc.has(n) || $l(n, !1, e), $l(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[cr] || (t[cr] = !0, $l("selectionchange", !1, t));
  }
}
function is(e, t, n, r) {
  switch (bu(t)) {
    case 1:
      var l = cc;
      break;
    case 4:
      l = fc;
      break;
    default:
      l = oi;
  }
  n = l.bind(null, t, n, e), l = void 0, !fo || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (l = !0), r ? l !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: l }) : e.addEventListener(t, n, !0) : l !== void 0 ? e.addEventListener(t, n, { passive: l }) : e.addEventListener(t, n, !1);
}
function Ul(e, t, n, r, l) {
  var o = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
    if (r === null) return;
    var i = r.tag;
    if (i === 3 || i === 4) {
      var a = r.stateNode.containerInfo;
      if (a === l || a.nodeType === 8 && a.parentNode === l) break;
      if (i === 4) for (i = r.return; i !== null; ) {
        var u = i.tag;
        if ((u === 3 || u === 4) && (u = i.stateNode.containerInfo, u === l || u.nodeType === 8 && u.parentNode === l)) return;
        i = i.return;
      }
      for (; a !== null; ) {
        if (i = kt(a), i === null) return;
        if (u = i.tag, u === 5 || u === 6) {
          r = o = i;
          continue e;
        }
        a = a.parentNode;
      }
    }
    r = r.return;
  }
  Pu(function() {
    var d = o, v = ti(n), h = [];
    e: {
      var m = ls.get(e);
      if (m !== void 0) {
        var x = ai, w = e;
        switch (e) {
          case "keypress":
            if (jr(n) === 0) break e;
          case "keydown":
          case "keyup":
            x = zc;
            break;
          case "focusin":
            w = "focus", x = Ll;
            break;
          case "focusout":
            w = "blur", x = Ll;
            break;
          case "beforeblur":
          case "afterblur":
            x = Ll;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            x = na;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            x = hc;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            x = Mc;
            break;
          case es:
          case ts:
          case ns:
            x = xc;
            break;
          case rs:
            x = Lc;
            break;
          case "scroll":
            x = pc;
            break;
          case "wheel":
            x = Rc;
            break;
          case "copy":
          case "cut":
          case "paste":
            x = wc;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            x = la;
        }
        var k = (t & 4) !== 0, _ = !k && e === "scroll", p = k ? m !== null ? m + "Capture" : null : m;
        k = [];
        for (var s = d, c; s !== null; ) {
          c = s;
          var g = c.stateNode;
          if (c.tag === 5 && g !== null && (c = g, p !== null && (g = Rn(s, p), g != null && k.push(Vn(s, g, c)))), _) break;
          s = s.return;
        }
        0 < k.length && (m = new x(m, w, null, n, v), h.push({ event: m, listeners: k }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (m = e === "mouseover" || e === "pointerover", x = e === "mouseout" || e === "pointerout", m && n !== so && (w = n.relatedTarget || n.fromElement) && (kt(w) || w[Ke])) break e;
        if ((x || m) && (m = v.window === v ? v : (m = v.ownerDocument) ? m.defaultView || m.parentWindow : window, x ? (w = n.relatedTarget || n.toElement, x = d, w = w ? kt(w) : null, w !== null && (_ = Lt(w), w !== _ || w.tag !== 5 && w.tag !== 6) && (w = null)) : (x = null, w = d), x !== w)) {
          if (k = na, g = "onMouseLeave", p = "onMouseEnter", s = "mouse", (e === "pointerout" || e === "pointerover") && (k = la, g = "onPointerLeave", p = "onPointerEnter", s = "pointer"), _ = x == null ? m : Ut(x), c = w == null ? m : Ut(w), m = new k(g, s + "leave", x, n, v), m.target = _, m.relatedTarget = c, g = null, kt(v) === d && (k = new k(p, s + "enter", w, n, v), k.target = c, k.relatedTarget = _, g = k), _ = g, x && w) t: {
            for (k = x, p = w, s = 0, c = k; c; c = It(c)) s++;
            for (c = 0, g = p; g; g = It(g)) c++;
            for (; 0 < s - c; ) k = It(k), s--;
            for (; 0 < c - s; ) p = It(p), c--;
            for (; s--; ) {
              if (k === p || p !== null && k === p.alternate) break t;
              k = It(k), p = It(p);
            }
            k = null;
          }
          else k = null;
          x !== null && ha(h, m, x, k, !1), w !== null && _ !== null && ha(h, _, w, k, !0);
        }
      }
      e: {
        if (m = d ? Ut(d) : window, x = m.nodeName && m.nodeName.toLowerCase(), x === "select" || x === "input" && m.type === "file") var S = Vc;
        else if (aa(m)) if (Xu) S = Wc;
        else {
          S = bc;
          var C = Hc;
        }
        else (x = m.nodeName) && x.toLowerCase() === "input" && (m.type === "checkbox" || m.type === "radio") && (S = Bc);
        if (S && (S = S(e, d))) {
          Yu(h, S, n, v);
          break e;
        }
        C && C(e, m, d), e === "focusout" && (C = m._wrapperState) && C.controlled && m.type === "number" && lo(m, "number", m.value);
      }
      switch (C = d ? Ut(d) : window, e) {
        case "focusin":
          (aa(C) || C.contentEditable === "true") && (Ft = C, go = d, zn = null);
          break;
        case "focusout":
          zn = go = Ft = null;
          break;
        case "mousedown":
          xo = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          xo = !1, fa(h, n, v);
          break;
        case "selectionchange":
          if (Yc) break;
        case "keydown":
        case "keyup":
          fa(h, n, v);
      }
      var N;
      if (si) e: {
        switch (e) {
          case "compositionstart":
            var z = "onCompositionStart";
            break e;
          case "compositionend":
            z = "onCompositionEnd";
            break e;
          case "compositionupdate":
            z = "onCompositionUpdate";
            break e;
        }
        z = void 0;
      }
      else Ot ? Qu(e, n) && (z = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (z = "onCompositionStart");
      z && (Wu && n.locale !== "ko" && (Ot || z !== "onCompositionStart" ? z === "onCompositionEnd" && Ot && (N = Bu()) : (nt = v, ii = "value" in nt ? nt.value : nt.textContent, Ot = !0)), C = Ur(d, z), 0 < C.length && (z = new ra(z, e, null, n, v), h.push({ event: z, listeners: C }), N ? z.data = N : (N = Ku(n), N !== null && (z.data = N)))), (N = Oc ? Fc(e, n) : $c(e, n)) && (d = Ur(d, "onBeforeInput"), 0 < d.length && (v = new ra("onBeforeInput", "beforeinput", null, n, v), h.push({ event: v, listeners: d }), v.data = N));
    }
    os(h, t);
  });
}
function Vn(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function Ur(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e, o = l.stateNode;
    l.tag === 5 && o !== null && (l = o, o = Rn(e, n), o != null && r.unshift(Vn(e, o, l)), o = Rn(e, t), o != null && r.push(Vn(e, o, l))), e = e.return;
  }
  return r;
}
function It(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function ha(e, t, n, r, l) {
  for (var o = t._reactName, i = []; n !== null && n !== r; ) {
    var a = n, u = a.alternate, d = a.stateNode;
    if (u !== null && u === r) break;
    a.tag === 5 && d !== null && (a = d, l ? (u = Rn(n, o), u != null && i.unshift(Vn(n, u, a))) : l || (u = Rn(n, o), u != null && i.push(Vn(n, u, a)))), n = n.return;
  }
  i.length !== 0 && e.push({ event: t, listeners: i });
}
var Zc = /\r\n?/g, Jc = /\u0000|\uFFFD/g;
function va(e) {
  return (typeof e == "string" ? e : "" + e).replace(Zc, `
`).replace(Jc, "");
}
function fr(e, t, n) {
  if (t = va(t), va(e) !== t && n) throw Error(y(425));
}
function Ar() {
}
var yo = null, wo = null;
function ko(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var So = typeof setTimeout == "function" ? setTimeout : void 0, ef = typeof clearTimeout == "function" ? clearTimeout : void 0, ga = typeof Promise == "function" ? Promise : void 0, tf = typeof queueMicrotask == "function" ? queueMicrotask : typeof ga < "u" ? function(e) {
  return ga.resolve(null).then(e).catch(nf);
} : So;
function nf(e) {
  setTimeout(function() {
    throw e;
  });
}
function Al(e, t) {
  var n = t, r = 0;
  do {
    var l = n.nextSibling;
    if (e.removeChild(n), l && l.nodeType === 8) if (n = l.data, n === "/$") {
      if (r === 0) {
        e.removeChild(l), Fn(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = l;
  } while (n);
  Fn(t);
}
function at(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function xa(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var un = Math.random().toString(36).slice(2), $e = "__reactFiber$" + un, Hn = "__reactProps$" + un, Ke = "__reactContainer$" + un, Eo = "__reactEvents$" + un, rf = "__reactListeners$" + un, lf = "__reactHandles$" + un;
function kt(e) {
  var t = e[$e];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[Ke] || n[$e]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = xa(e); e !== null; ) {
        if (n = e[$e]) return n;
        e = xa(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function Zn(e) {
  return e = e[$e] || e[Ke], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function Ut(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(y(33));
}
function ul(e) {
  return e[Hn] || null;
}
var jo = [], At = -1;
function ht(e) {
  return { current: e };
}
function U(e) {
  0 > At || (e.current = jo[At], jo[At] = null, At--);
}
function O(e, t) {
  At++, jo[At] = e.current, e.current = t;
}
var pt = {}, ie = ht(pt), pe = ht(!1), Nt = pt;
function Jt(e, t) {
  var n = e.type.contextTypes;
  if (!n) return pt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var l = {}, o;
  for (o in n) l[o] = t[o];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = l), l;
}
function me(e) {
  return e = e.childContextTypes, e != null;
}
function Vr() {
  U(pe), U(ie);
}
function ya(e, t, n) {
  if (ie.current !== pt) throw Error(y(168));
  O(ie, t), O(pe, n);
}
function as(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(y(108, Hd(e) || "Unknown", l));
  return b({}, n, r);
}
function Hr(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || pt, Nt = ie.current, O(ie, e), O(pe, pe.current), !0;
}
function wa(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(y(169));
  n ? (e = as(e, t, Nt), r.__reactInternalMemoizedMergedChildContext = e, U(pe), U(ie), O(ie, e)) : U(pe), O(pe, n);
}
var He = null, sl = !1, Vl = !1;
function us(e) {
  He === null ? He = [e] : He.push(e);
}
function of(e) {
  sl = !0, us(e);
}
function vt() {
  if (!Vl && He !== null) {
    Vl = !0;
    var e = 0, t = D;
    try {
      var n = He;
      for (D = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      He = null, sl = !1;
    } catch (l) {
      throw He !== null && (He = He.slice(e + 1)), Iu(ni, vt), l;
    } finally {
      D = t, Vl = !1;
    }
  }
  return null;
}
var Vt = [], Ht = 0, br = null, Br = 0, Se = [], Ee = 0, zt = null, be = 1, Be = "";
function yt(e, t) {
  Vt[Ht++] = Br, Vt[Ht++] = br, br = e, Br = t;
}
function ss(e, t, n) {
  Se[Ee++] = be, Se[Ee++] = Be, Se[Ee++] = zt, zt = e;
  var r = be;
  e = Be;
  var l = 32 - Ie(r) - 1;
  r &= ~(1 << l), n += 1;
  var o = 32 - Ie(t) + l;
  if (30 < o) {
    var i = l - l % 5;
    o = (r & (1 << i) - 1).toString(32), r >>= i, l -= i, be = 1 << 32 - Ie(t) + l | n << l | r, Be = o + e;
  } else be = 1 << o | n << l | r, Be = e;
}
function ci(e) {
  e.return !== null && (yt(e, 1), ss(e, 1, 0));
}
function fi(e) {
  for (; e === br; ) br = Vt[--Ht], Vt[Ht] = null, Br = Vt[--Ht], Vt[Ht] = null;
  for (; e === zt; ) zt = Se[--Ee], Se[Ee] = null, Be = Se[--Ee], Se[Ee] = null, be = Se[--Ee], Se[Ee] = null;
}
var xe = null, ge = null, A = !1, Le = null;
function ds(e, t) {
  var n = je(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function ka(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, xe = e, ge = at(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, xe = e, ge = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = zt !== null ? { id: be, overflow: Be } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = je(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, xe = e, ge = null, !0) : !1;
    default:
      return !1;
  }
}
function Co(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function No(e) {
  if (A) {
    var t = ge;
    if (t) {
      var n = t;
      if (!ka(e, t)) {
        if (Co(e)) throw Error(y(418));
        t = at(n.nextSibling);
        var r = xe;
        t && ka(e, t) ? ds(r, n) : (e.flags = e.flags & -4097 | 2, A = !1, xe = e);
      }
    } else {
      if (Co(e)) throw Error(y(418));
      e.flags = e.flags & -4097 | 2, A = !1, xe = e;
    }
  }
}
function Sa(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  xe = e;
}
function pr(e) {
  if (e !== xe) return !1;
  if (!A) return Sa(e), A = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !ko(e.type, e.memoizedProps)), t && (t = ge)) {
    if (Co(e)) throw cs(), Error(y(418));
    for (; t; ) ds(e, t), t = at(t.nextSibling);
  }
  if (Sa(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(y(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              ge = at(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      ge = null;
    }
  } else ge = xe ? at(e.stateNode.nextSibling) : null;
  return !0;
}
function cs() {
  for (var e = ge; e; ) e = at(e.nextSibling);
}
function en() {
  ge = xe = null, A = !1;
}
function pi(e) {
  Le === null ? Le = [e] : Le.push(e);
}
var af = Ge.ReactCurrentBatchConfig;
function vn(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(y(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(y(147, e));
      var l = r, o = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === o ? t.ref : (t = function(i) {
        var a = l.refs;
        i === null ? delete a[o] : a[o] = i;
      }, t._stringRef = o, t);
    }
    if (typeof e != "string") throw Error(y(284));
    if (!n._owner) throw Error(y(290, e));
  }
  return e;
}
function mr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(y(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function Ea(e) {
  var t = e._init;
  return t(e._payload);
}
function fs(e) {
  function t(p, s) {
    if (e) {
      var c = p.deletions;
      c === null ? (p.deletions = [s], p.flags |= 16) : c.push(s);
    }
  }
  function n(p, s) {
    if (!e) return null;
    for (; s !== null; ) t(p, s), s = s.sibling;
    return null;
  }
  function r(p, s) {
    for (p = /* @__PURE__ */ new Map(); s !== null; ) s.key !== null ? p.set(s.key, s) : p.set(s.index, s), s = s.sibling;
    return p;
  }
  function l(p, s) {
    return p = ct(p, s), p.index = 0, p.sibling = null, p;
  }
  function o(p, s, c) {
    return p.index = c, e ? (c = p.alternate, c !== null ? (c = c.index, c < s ? (p.flags |= 2, s) : c) : (p.flags |= 2, s)) : (p.flags |= 1048576, s);
  }
  function i(p) {
    return e && p.alternate === null && (p.flags |= 2), p;
  }
  function a(p, s, c, g) {
    return s === null || s.tag !== 6 ? (s = Yl(c, p.mode, g), s.return = p, s) : (s = l(s, c), s.return = p, s);
  }
  function u(p, s, c, g) {
    var S = c.type;
    return S === Dt ? v(p, s, c.props.children, g, c.key) : s !== null && (s.elementType === S || typeof S == "object" && S !== null && S.$$typeof === Ze && Ea(S) === s.type) ? (g = l(s, c.props), g.ref = vn(p, s, c), g.return = p, g) : (g = Tr(c.type, c.key, c.props, null, p.mode, g), g.ref = vn(p, s, c), g.return = p, g);
  }
  function d(p, s, c, g) {
    return s === null || s.tag !== 4 || s.stateNode.containerInfo !== c.containerInfo || s.stateNode.implementation !== c.implementation ? (s = Xl(c, p.mode, g), s.return = p, s) : (s = l(s, c.children || []), s.return = p, s);
  }
  function v(p, s, c, g, S) {
    return s === null || s.tag !== 7 ? (s = Ct(c, p.mode, g, S), s.return = p, s) : (s = l(s, c), s.return = p, s);
  }
  function h(p, s, c) {
    if (typeof s == "string" && s !== "" || typeof s == "number") return s = Yl("" + s, p.mode, c), s.return = p, s;
    if (typeof s == "object" && s !== null) {
      switch (s.$$typeof) {
        case rr:
          return c = Tr(s.type, s.key, s.props, null, p.mode, c), c.ref = vn(p, null, s), c.return = p, c;
        case Rt:
          return s = Xl(s, p.mode, c), s.return = p, s;
        case Ze:
          var g = s._init;
          return h(p, g(s._payload), c);
      }
      if (wn(s) || cn(s)) return s = Ct(s, p.mode, c, null), s.return = p, s;
      mr(p, s);
    }
    return null;
  }
  function m(p, s, c, g) {
    var S = s !== null ? s.key : null;
    if (typeof c == "string" && c !== "" || typeof c == "number") return S !== null ? null : a(p, s, "" + c, g);
    if (typeof c == "object" && c !== null) {
      switch (c.$$typeof) {
        case rr:
          return c.key === S ? u(p, s, c, g) : null;
        case Rt:
          return c.key === S ? d(p, s, c, g) : null;
        case Ze:
          return S = c._init, m(
            p,
            s,
            S(c._payload),
            g
          );
      }
      if (wn(c) || cn(c)) return S !== null ? null : v(p, s, c, g, null);
      mr(p, c);
    }
    return null;
  }
  function x(p, s, c, g, S) {
    if (typeof g == "string" && g !== "" || typeof g == "number") return p = p.get(c) || null, a(s, p, "" + g, S);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case rr:
          return p = p.get(g.key === null ? c : g.key) || null, u(s, p, g, S);
        case Rt:
          return p = p.get(g.key === null ? c : g.key) || null, d(s, p, g, S);
        case Ze:
          var C = g._init;
          return x(p, s, c, C(g._payload), S);
      }
      if (wn(g) || cn(g)) return p = p.get(c) || null, v(s, p, g, S, null);
      mr(s, g);
    }
    return null;
  }
  function w(p, s, c, g) {
    for (var S = null, C = null, N = s, z = s = 0, W = null; N !== null && z < c.length; z++) {
      N.index > z ? (W = N, N = null) : W = N.sibling;
      var L = m(p, N, c[z], g);
      if (L === null) {
        N === null && (N = W);
        break;
      }
      e && N && L.alternate === null && t(p, N), s = o(L, s, z), C === null ? S = L : C.sibling = L, C = L, N = W;
    }
    if (z === c.length) return n(p, N), A && yt(p, z), S;
    if (N === null) {
      for (; z < c.length; z++) N = h(p, c[z], g), N !== null && (s = o(N, s, z), C === null ? S = N : C.sibling = N, C = N);
      return A && yt(p, z), S;
    }
    for (N = r(p, N); z < c.length; z++) W = x(N, p, z, c[z], g), W !== null && (e && W.alternate !== null && N.delete(W.key === null ? z : W.key), s = o(W, s, z), C === null ? S = W : C.sibling = W, C = W);
    return e && N.forEach(function(_e) {
      return t(p, _e);
    }), A && yt(p, z), S;
  }
  function k(p, s, c, g) {
    var S = cn(c);
    if (typeof S != "function") throw Error(y(150));
    if (c = S.call(c), c == null) throw Error(y(151));
    for (var C = S = null, N = s, z = s = 0, W = null, L = c.next(); N !== null && !L.done; z++, L = c.next()) {
      N.index > z ? (W = N, N = null) : W = N.sibling;
      var _e = m(p, N, L.value, g);
      if (_e === null) {
        N === null && (N = W);
        break;
      }
      e && N && _e.alternate === null && t(p, N), s = o(_e, s, z), C === null ? S = _e : C.sibling = _e, C = _e, N = W;
    }
    if (L.done) return n(
      p,
      N
    ), A && yt(p, z), S;
    if (N === null) {
      for (; !L.done; z++, L = c.next()) L = h(p, L.value, g), L !== null && (s = o(L, s, z), C === null ? S = L : C.sibling = L, C = L);
      return A && yt(p, z), S;
    }
    for (N = r(p, N); !L.done; z++, L = c.next()) L = x(N, p, z, L.value, g), L !== null && (e && L.alternate !== null && N.delete(L.key === null ? z : L.key), s = o(L, s, z), C === null ? S = L : C.sibling = L, C = L);
    return e && N.forEach(function(sn) {
      return t(p, sn);
    }), A && yt(p, z), S;
  }
  function _(p, s, c, g) {
    if (typeof c == "object" && c !== null && c.type === Dt && c.key === null && (c = c.props.children), typeof c == "object" && c !== null) {
      switch (c.$$typeof) {
        case rr:
          e: {
            for (var S = c.key, C = s; C !== null; ) {
              if (C.key === S) {
                if (S = c.type, S === Dt) {
                  if (C.tag === 7) {
                    n(p, C.sibling), s = l(C, c.props.children), s.return = p, p = s;
                    break e;
                  }
                } else if (C.elementType === S || typeof S == "object" && S !== null && S.$$typeof === Ze && Ea(S) === C.type) {
                  n(p, C.sibling), s = l(C, c.props), s.ref = vn(p, C, c), s.return = p, p = s;
                  break e;
                }
                n(p, C);
                break;
              } else t(p, C);
              C = C.sibling;
            }
            c.type === Dt ? (s = Ct(c.props.children, p.mode, g, c.key), s.return = p, p = s) : (g = Tr(c.type, c.key, c.props, null, p.mode, g), g.ref = vn(p, s, c), g.return = p, p = g);
          }
          return i(p);
        case Rt:
          e: {
            for (C = c.key; s !== null; ) {
              if (s.key === C) if (s.tag === 4 && s.stateNode.containerInfo === c.containerInfo && s.stateNode.implementation === c.implementation) {
                n(p, s.sibling), s = l(s, c.children || []), s.return = p, p = s;
                break e;
              } else {
                n(p, s);
                break;
              }
              else t(p, s);
              s = s.sibling;
            }
            s = Xl(c, p.mode, g), s.return = p, p = s;
          }
          return i(p);
        case Ze:
          return C = c._init, _(p, s, C(c._payload), g);
      }
      if (wn(c)) return w(p, s, c, g);
      if (cn(c)) return k(p, s, c, g);
      mr(p, c);
    }
    return typeof c == "string" && c !== "" || typeof c == "number" ? (c = "" + c, s !== null && s.tag === 6 ? (n(p, s.sibling), s = l(s, c), s.return = p, p = s) : (n(p, s), s = Yl(c, p.mode, g), s.return = p, p = s), i(p)) : n(p, s);
  }
  return _;
}
var tn = fs(!0), ps = fs(!1), Wr = ht(null), Qr = null, bt = null, mi = null;
function hi() {
  mi = bt = Qr = null;
}
function vi(e) {
  var t = Wr.current;
  U(Wr), e._currentValue = t;
}
function zo(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function Gt(e, t) {
  Qr = e, mi = bt = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (fe = !0), e.firstContext = null);
}
function Ne(e) {
  var t = e._currentValue;
  if (mi !== e) if (e = { context: e, memoizedValue: t, next: null }, bt === null) {
    if (Qr === null) throw Error(y(308));
    bt = e, Qr.dependencies = { lanes: 0, firstContext: e };
  } else bt = bt.next = e;
  return t;
}
var St = null;
function gi(e) {
  St === null ? St = [e] : St.push(e);
}
function ms(e, t, n, r) {
  var l = t.interleaved;
  return l === null ? (n.next = n, gi(t)) : (n.next = l.next, l.next = n), t.interleaved = n, Ye(e, r);
}
function Ye(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var Je = !1;
function xi(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function hs(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function We(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function ut(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, I & 2) {
    var l = r.pending;
    return l === null ? t.next = t : (t.next = l.next, l.next = t), r.pending = t, Ye(e, n);
  }
  return l = r.interleaved, l === null ? (t.next = t, gi(r)) : (t.next = l.next, l.next = t), r.interleaved = t, Ye(e, n);
}
function Cr(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, ri(e, n);
  }
}
function ja(e, t) {
  var n = e.updateQueue, r = e.alternate;
  if (r !== null && (r = r.updateQueue, n === r)) {
    var l = null, o = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var i = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
        o === null ? l = o = i : o = o.next = i, n = n.next;
      } while (n !== null);
      o === null ? l = o = t : o = o.next = t;
    } else l = o = t;
    n = { baseState: r.baseState, firstBaseUpdate: l, lastBaseUpdate: o, shared: r.shared, effects: r.effects }, e.updateQueue = n;
    return;
  }
  e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
}
function Kr(e, t, n, r) {
  var l = e.updateQueue;
  Je = !1;
  var o = l.firstBaseUpdate, i = l.lastBaseUpdate, a = l.shared.pending;
  if (a !== null) {
    l.shared.pending = null;
    var u = a, d = u.next;
    u.next = null, i === null ? o = d : i.next = d, i = u;
    var v = e.alternate;
    v !== null && (v = v.updateQueue, a = v.lastBaseUpdate, a !== i && (a === null ? v.firstBaseUpdate = d : a.next = d, v.lastBaseUpdate = u));
  }
  if (o !== null) {
    var h = l.baseState;
    i = 0, v = d = u = null, a = o;
    do {
      var m = a.lane, x = a.eventTime;
      if ((r & m) === m) {
        v !== null && (v = v.next = {
          eventTime: x,
          lane: 0,
          tag: a.tag,
          payload: a.payload,
          callback: a.callback,
          next: null
        });
        e: {
          var w = e, k = a;
          switch (m = t, x = n, k.tag) {
            case 1:
              if (w = k.payload, typeof w == "function") {
                h = w.call(x, h, m);
                break e;
              }
              h = w;
              break e;
            case 3:
              w.flags = w.flags & -65537 | 128;
            case 0:
              if (w = k.payload, m = typeof w == "function" ? w.call(x, h, m) : w, m == null) break e;
              h = b({}, h, m);
              break e;
            case 2:
              Je = !0;
          }
        }
        a.callback !== null && a.lane !== 0 && (e.flags |= 64, m = l.effects, m === null ? l.effects = [a] : m.push(a));
      } else x = { eventTime: x, lane: m, tag: a.tag, payload: a.payload, callback: a.callback, next: null }, v === null ? (d = v = x, u = h) : v = v.next = x, i |= m;
      if (a = a.next, a === null) {
        if (a = l.shared.pending, a === null) break;
        m = a, a = m.next, m.next = null, l.lastBaseUpdate = m, l.shared.pending = null;
      }
    } while (!0);
    if (v === null && (u = h), l.baseState = u, l.firstBaseUpdate = d, l.lastBaseUpdate = v, t = l.shared.interleaved, t !== null) {
      l = t;
      do
        i |= l.lane, l = l.next;
      while (l !== t);
    } else o === null && (l.shared.lanes = 0);
    Pt |= i, e.lanes = i, e.memoizedState = h;
  }
}
function Ca(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], l = r.callback;
    if (l !== null) {
      if (r.callback = null, r = n, typeof l != "function") throw Error(y(191, l));
      l.call(r);
    }
  }
}
var Jn = {}, Ae = ht(Jn), bn = ht(Jn), Bn = ht(Jn);
function Et(e) {
  if (e === Jn) throw Error(y(174));
  return e;
}
function yi(e, t) {
  switch (O(Bn, t), O(bn, e), O(Ae, Jn), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : io(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = io(t, e);
  }
  U(Ae), O(Ae, t);
}
function nn() {
  U(Ae), U(bn), U(Bn);
}
function vs(e) {
  Et(Bn.current);
  var t = Et(Ae.current), n = io(t, e.type);
  t !== n && (O(bn, e), O(Ae, n));
}
function wi(e) {
  bn.current === e && (U(Ae), U(bn));
}
var V = ht(0);
function Yr(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      t.child.return = t, t = t.child;
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    t.sibling.return = t.return, t = t.sibling;
  }
  return null;
}
var Hl = [];
function ki() {
  for (var e = 0; e < Hl.length; e++) Hl[e]._workInProgressVersionPrimary = null;
  Hl.length = 0;
}
var Nr = Ge.ReactCurrentDispatcher, bl = Ge.ReactCurrentBatchConfig, _t = 0, H = null, X = null, Z = null, Xr = !1, _n = !1, Wn = 0, uf = 0;
function re() {
  throw Error(y(321));
}
function Si(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!De(e[n], t[n])) return !1;
  return !0;
}
function Ei(e, t, n, r, l, o) {
  if (_t = o, H = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Nr.current = e === null || e.memoizedState === null ? ff : pf, e = n(r, l), _n) {
    o = 0;
    do {
      if (_n = !1, Wn = 0, 25 <= o) throw Error(y(301));
      o += 1, Z = X = null, t.updateQueue = null, Nr.current = mf, e = n(r, l);
    } while (_n);
  }
  if (Nr.current = Gr, t = X !== null && X.next !== null, _t = 0, Z = X = H = null, Xr = !1, t) throw Error(y(300));
  return e;
}
function ji() {
  var e = Wn !== 0;
  return Wn = 0, e;
}
function Fe() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return Z === null ? H.memoizedState = Z = e : Z = Z.next = e, Z;
}
function ze() {
  if (X === null) {
    var e = H.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = X.next;
  var t = Z === null ? H.memoizedState : Z.next;
  if (t !== null) Z = t, X = e;
  else {
    if (e === null) throw Error(y(310));
    X = e, e = { memoizedState: X.memoizedState, baseState: X.baseState, baseQueue: X.baseQueue, queue: X.queue, next: null }, Z === null ? H.memoizedState = Z = e : Z = Z.next = e;
  }
  return Z;
}
function Qn(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Bl(e) {
  var t = ze(), n = t.queue;
  if (n === null) throw Error(y(311));
  n.lastRenderedReducer = e;
  var r = X, l = r.baseQueue, o = n.pending;
  if (o !== null) {
    if (l !== null) {
      var i = l.next;
      l.next = o.next, o.next = i;
    }
    r.baseQueue = l = o, n.pending = null;
  }
  if (l !== null) {
    o = l.next, r = r.baseState;
    var a = i = null, u = null, d = o;
    do {
      var v = d.lane;
      if ((_t & v) === v) u !== null && (u = u.next = { lane: 0, action: d.action, hasEagerState: d.hasEagerState, eagerState: d.eagerState, next: null }), r = d.hasEagerState ? d.eagerState : e(r, d.action);
      else {
        var h = {
          lane: v,
          action: d.action,
          hasEagerState: d.hasEagerState,
          eagerState: d.eagerState,
          next: null
        };
        u === null ? (a = u = h, i = r) : u = u.next = h, H.lanes |= v, Pt |= v;
      }
      d = d.next;
    } while (d !== null && d !== o);
    u === null ? i = r : u.next = a, De(r, t.memoizedState) || (fe = !0), t.memoizedState = r, t.baseState = i, t.baseQueue = u, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    l = e;
    do
      o = l.lane, H.lanes |= o, Pt |= o, l = l.next;
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Wl(e) {
  var t = ze(), n = t.queue;
  if (n === null) throw Error(y(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, l = n.pending, o = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var i = l = l.next;
    do
      o = e(o, i.action), i = i.next;
    while (i !== l);
    De(o, t.memoizedState) || (fe = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
  }
  return [o, r];
}
function gs() {
}
function xs(e, t) {
  var n = H, r = ze(), l = t(), o = !De(r.memoizedState, l);
  if (o && (r.memoizedState = l, fe = !0), r = r.queue, Ci(ks.bind(null, n, r, e), [e]), r.getSnapshot !== t || o || Z !== null && Z.memoizedState.tag & 1) {
    if (n.flags |= 2048, Kn(9, ws.bind(null, n, r, l, t), void 0, null), J === null) throw Error(y(349));
    _t & 30 || ys(n, t, l);
  }
  return l;
}
function ys(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = H.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, H.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function ws(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Ss(t) && Es(e);
}
function ks(e, t, n) {
  return n(function() {
    Ss(t) && Es(e);
  });
}
function Ss(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !De(e, n);
  } catch {
    return !0;
  }
}
function Es(e) {
  var t = Ye(e, 1);
  t !== null && Re(t, e, 1, -1);
}
function Na(e) {
  var t = Fe();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Qn, lastRenderedState: e }, t.queue = e, e = e.dispatch = cf.bind(null, H, e), [t.memoizedState, e];
}
function Kn(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = H.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, H.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function js() {
  return ze().memoizedState;
}
function zr(e, t, n, r) {
  var l = Fe();
  H.flags |= e, l.memoizedState = Kn(1 | t, n, void 0, r === void 0 ? null : r);
}
function dl(e, t, n, r) {
  var l = ze();
  r = r === void 0 ? null : r;
  var o = void 0;
  if (X !== null) {
    var i = X.memoizedState;
    if (o = i.destroy, r !== null && Si(r, i.deps)) {
      l.memoizedState = Kn(t, n, o, r);
      return;
    }
  }
  H.flags |= e, l.memoizedState = Kn(1 | t, n, o, r);
}
function za(e, t) {
  return zr(8390656, 8, e, t);
}
function Ci(e, t) {
  return dl(2048, 8, e, t);
}
function Cs(e, t) {
  return dl(4, 2, e, t);
}
function Ns(e, t) {
  return dl(4, 4, e, t);
}
function zs(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function _s(e, t, n) {
  return n = n != null ? n.concat([e]) : null, dl(4, 4, zs.bind(null, t, e), n);
}
function Ni() {
}
function Ps(e, t) {
  var n = ze();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Si(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Ms(e, t) {
  var n = ze();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Si(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Ts(e, t, n) {
  return _t & 21 ? (De(n, t) || (n = Ou(), H.lanes |= n, Pt |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, fe = !0), e.memoizedState = n);
}
function sf(e, t) {
  var n = D;
  D = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = bl.transition;
  bl.transition = {};
  try {
    e(!1), t();
  } finally {
    D = n, bl.transition = r;
  }
}
function Ls() {
  return ze().memoizedState;
}
function df(e, t, n) {
  var r = dt(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Is(e)) Rs(t, n);
  else if (n = ms(e, t, n, r), n !== null) {
    var l = ue();
    Re(n, e, r, l), Ds(n, t, r);
  }
}
function cf(e, t, n) {
  var r = dt(e), l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Is(e)) Rs(t, l);
  else {
    var o = e.alternate;
    if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer, o !== null)) try {
      var i = t.lastRenderedState, a = o(i, n);
      if (l.hasEagerState = !0, l.eagerState = a, De(a, i)) {
        var u = t.interleaved;
        u === null ? (l.next = l, gi(t)) : (l.next = u.next, u.next = l), t.interleaved = l;
        return;
      }
    } catch {
    } finally {
    }
    n = ms(e, t, l, r), n !== null && (l = ue(), Re(n, e, r, l), Ds(n, t, r));
  }
}
function Is(e) {
  var t = e.alternate;
  return e === H || t !== null && t === H;
}
function Rs(e, t) {
  _n = Xr = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Ds(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, ri(e, n);
  }
}
var Gr = { readContext: Ne, useCallback: re, useContext: re, useEffect: re, useImperativeHandle: re, useInsertionEffect: re, useLayoutEffect: re, useMemo: re, useReducer: re, useRef: re, useState: re, useDebugValue: re, useDeferredValue: re, useTransition: re, useMutableSource: re, useSyncExternalStore: re, useId: re, unstable_isNewReconciler: !1 }, ff = { readContext: Ne, useCallback: function(e, t) {
  return Fe().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: Ne, useEffect: za, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, zr(
    4194308,
    4,
    zs.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return zr(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return zr(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = Fe();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = Fe();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = df.bind(null, H, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = Fe();
  return e = { current: e }, t.memoizedState = e;
}, useState: Na, useDebugValue: Ni, useDeferredValue: function(e) {
  return Fe().memoizedState = e;
}, useTransition: function() {
  var e = Na(!1), t = e[0];
  return e = sf.bind(null, e[1]), Fe().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = H, l = Fe();
  if (A) {
    if (n === void 0) throw Error(y(407));
    n = n();
  } else {
    if (n = t(), J === null) throw Error(y(349));
    _t & 30 || ys(r, t, n);
  }
  l.memoizedState = n;
  var o = { value: n, getSnapshot: t };
  return l.queue = o, za(ks.bind(
    null,
    r,
    o,
    e
  ), [e]), r.flags |= 2048, Kn(9, ws.bind(null, r, o, n, t), void 0, null), n;
}, useId: function() {
  var e = Fe(), t = J.identifierPrefix;
  if (A) {
    var n = Be, r = be;
    n = (r & ~(1 << 32 - Ie(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Wn++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = uf++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, pf = {
  readContext: Ne,
  useCallback: Ps,
  useContext: Ne,
  useEffect: Ci,
  useImperativeHandle: _s,
  useInsertionEffect: Cs,
  useLayoutEffect: Ns,
  useMemo: Ms,
  useReducer: Bl,
  useRef: js,
  useState: function() {
    return Bl(Qn);
  },
  useDebugValue: Ni,
  useDeferredValue: function(e) {
    var t = ze();
    return Ts(t, X.memoizedState, e);
  },
  useTransition: function() {
    var e = Bl(Qn)[0], t = ze().memoizedState;
    return [e, t];
  },
  useMutableSource: gs,
  useSyncExternalStore: xs,
  useId: Ls,
  unstable_isNewReconciler: !1
}, mf = { readContext: Ne, useCallback: Ps, useContext: Ne, useEffect: Ci, useImperativeHandle: _s, useInsertionEffect: Cs, useLayoutEffect: Ns, useMemo: Ms, useReducer: Wl, useRef: js, useState: function() {
  return Wl(Qn);
}, useDebugValue: Ni, useDeferredValue: function(e) {
  var t = ze();
  return X === null ? t.memoizedState = e : Ts(t, X.memoizedState, e);
}, useTransition: function() {
  var e = Wl(Qn)[0], t = ze().memoizedState;
  return [e, t];
}, useMutableSource: gs, useSyncExternalStore: xs, useId: Ls, unstable_isNewReconciler: !1 };
function Me(e, t) {
  if (e && e.defaultProps) {
    t = b({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function _o(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : b({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var cl = { isMounted: function(e) {
  return (e = e._reactInternals) ? Lt(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = ue(), l = dt(e), o = We(r, l);
  o.payload = t, n != null && (o.callback = n), t = ut(e, o, l), t !== null && (Re(t, e, l, r), Cr(t, e, l));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = ue(), l = dt(e), o = We(r, l);
  o.tag = 1, o.payload = t, n != null && (o.callback = n), t = ut(e, o, l), t !== null && (Re(t, e, l, r), Cr(t, e, l));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = ue(), r = dt(e), l = We(n, r);
  l.tag = 2, t != null && (l.callback = t), t = ut(e, l, r), t !== null && (Re(t, e, r, n), Cr(t, e, r));
} };
function _a(e, t, n, r, l, o, i) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, o, i) : t.prototype && t.prototype.isPureReactComponent ? !Un(n, r) || !Un(l, o) : !0;
}
function Os(e, t, n) {
  var r = !1, l = pt, o = t.contextType;
  return typeof o == "object" && o !== null ? o = Ne(o) : (l = me(t) ? Nt : ie.current, r = t.contextTypes, o = (r = r != null) ? Jt(e, l) : pt), t = new t(n, o), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = cl, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = l, e.__reactInternalMemoizedMaskedChildContext = o), t;
}
function Pa(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && cl.enqueueReplaceState(t, t.state, null);
}
function Po(e, t, n, r) {
  var l = e.stateNode;
  l.props = n, l.state = e.memoizedState, l.refs = {}, xi(e);
  var o = t.contextType;
  typeof o == "object" && o !== null ? l.context = Ne(o) : (o = me(t) ? Nt : ie.current, l.context = Jt(e, o)), l.state = e.memoizedState, o = t.getDerivedStateFromProps, typeof o == "function" && (_o(e, t, o, n), l.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof l.getSnapshotBeforeUpdate == "function" || typeof l.UNSAFE_componentWillMount != "function" && typeof l.componentWillMount != "function" || (t = l.state, typeof l.componentWillMount == "function" && l.componentWillMount(), typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(), t !== l.state && cl.enqueueReplaceState(l, l.state, null), Kr(e, n, l, r), l.state = e.memoizedState), typeof l.componentDidMount == "function" && (e.flags |= 4194308);
}
function rn(e, t) {
  try {
    var n = "", r = t;
    do
      n += Vd(r), r = r.return;
    while (r);
    var l = n;
  } catch (o) {
    l = `
Error generating stack: ` + o.message + `
` + o.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function Ql(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Mo(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var hf = typeof WeakMap == "function" ? WeakMap : Map;
function Fs(e, t, n) {
  n = We(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    Zr || (Zr = !0, Ao = r), Mo(e, t);
  }, n;
}
function $s(e, t, n) {
  n = We(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    n.payload = function() {
      return r(l);
    }, n.callback = function() {
      Mo(e, t);
    };
  }
  var o = e.stateNode;
  return o !== null && typeof o.componentDidCatch == "function" && (n.callback = function() {
    Mo(e, t), typeof r != "function" && (st === null ? st = /* @__PURE__ */ new Set([this]) : st.add(this));
    var i = t.stack;
    this.componentDidCatch(t.value, { componentStack: i !== null ? i : "" });
  }), n;
}
function Ma(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new hf();
    var l = /* @__PURE__ */ new Set();
    r.set(t, l);
  } else l = r.get(t), l === void 0 && (l = /* @__PURE__ */ new Set(), r.set(t, l));
  l.has(n) || (l.add(n), e = Pf.bind(null, e, t, n), t.then(e, e));
}
function Ta(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function La(e, t, n, r, l) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = l, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = We(-1, 1), t.tag = 2, ut(n, t, 1))), n.lanes |= 1), e);
}
var vf = Ge.ReactCurrentOwner, fe = !1;
function ae(e, t, n, r) {
  t.child = e === null ? ps(t, null, n, r) : tn(t, e.child, n, r);
}
function Ia(e, t, n, r, l) {
  n = n.render;
  var o = t.ref;
  return Gt(t, l), r = Ei(e, t, n, r, o, l), n = ji(), e !== null && !fe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, Xe(e, t, l)) : (A && n && ci(t), t.flags |= 1, ae(e, t, r, l), t.child);
}
function Ra(e, t, n, r, l) {
  if (e === null) {
    var o = n.type;
    return typeof o == "function" && !Ri(o) && o.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = o, Us(e, t, o, r, l)) : (e = Tr(n.type, null, r, t, t.mode, l), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (o = e.child, !(e.lanes & l)) {
    var i = o.memoizedProps;
    if (n = n.compare, n = n !== null ? n : Un, n(i, r) && e.ref === t.ref) return Xe(e, t, l);
  }
  return t.flags |= 1, e = ct(o, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Us(e, t, n, r, l) {
  if (e !== null) {
    var o = e.memoizedProps;
    if (Un(o, r) && e.ref === t.ref) if (fe = !1, t.pendingProps = r = o, (e.lanes & l) !== 0) e.flags & 131072 && (fe = !0);
    else return t.lanes = e.lanes, Xe(e, t, l);
  }
  return To(e, t, n, r, l);
}
function As(e, t, n) {
  var r = t.pendingProps, l = r.children, o = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, O(Wt, ve), ve |= n;
  else {
    if (!(n & 1073741824)) return e = o !== null ? o.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, O(Wt, ve), ve |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = o !== null ? o.baseLanes : n, O(Wt, ve), ve |= r;
  }
  else o !== null ? (r = o.baseLanes | n, t.memoizedState = null) : r = n, O(Wt, ve), ve |= r;
  return ae(e, t, l, n), t.child;
}
function Vs(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function To(e, t, n, r, l) {
  var o = me(n) ? Nt : ie.current;
  return o = Jt(t, o), Gt(t, l), n = Ei(e, t, n, r, o, l), r = ji(), e !== null && !fe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l, Xe(e, t, l)) : (A && r && ci(t), t.flags |= 1, ae(e, t, n, l), t.child);
}
function Da(e, t, n, r, l) {
  if (me(n)) {
    var o = !0;
    Hr(t);
  } else o = !1;
  if (Gt(t, l), t.stateNode === null) _r(e, t), Os(t, n, r), Po(t, n, r, l), r = !0;
  else if (e === null) {
    var i = t.stateNode, a = t.memoizedProps;
    i.props = a;
    var u = i.context, d = n.contextType;
    typeof d == "object" && d !== null ? d = Ne(d) : (d = me(n) ? Nt : ie.current, d = Jt(t, d));
    var v = n.getDerivedStateFromProps, h = typeof v == "function" || typeof i.getSnapshotBeforeUpdate == "function";
    h || typeof i.UNSAFE_componentWillReceiveProps != "function" && typeof i.componentWillReceiveProps != "function" || (a !== r || u !== d) && Pa(t, i, r, d), Je = !1;
    var m = t.memoizedState;
    i.state = m, Kr(t, r, i, l), u = t.memoizedState, a !== r || m !== u || pe.current || Je ? (typeof v == "function" && (_o(t, n, v, r), u = t.memoizedState), (a = Je || _a(t, n, a, r, m, u, d)) ? (h || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount()), typeof i.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof i.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = u), i.props = r, i.state = u, i.context = d, r = a) : (typeof i.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    i = t.stateNode, hs(e, t), a = t.memoizedProps, d = t.type === t.elementType ? a : Me(t.type, a), i.props = d, h = t.pendingProps, m = i.context, u = n.contextType, typeof u == "object" && u !== null ? u = Ne(u) : (u = me(n) ? Nt : ie.current, u = Jt(t, u));
    var x = n.getDerivedStateFromProps;
    (v = typeof x == "function" || typeof i.getSnapshotBeforeUpdate == "function") || typeof i.UNSAFE_componentWillReceiveProps != "function" && typeof i.componentWillReceiveProps != "function" || (a !== h || m !== u) && Pa(t, i, r, u), Je = !1, m = t.memoizedState, i.state = m, Kr(t, r, i, l);
    var w = t.memoizedState;
    a !== h || m !== w || pe.current || Je ? (typeof x == "function" && (_o(t, n, x, r), w = t.memoizedState), (d = Je || _a(t, n, d, r, m, w, u) || !1) ? (v || typeof i.UNSAFE_componentWillUpdate != "function" && typeof i.componentWillUpdate != "function" || (typeof i.componentWillUpdate == "function" && i.componentWillUpdate(r, w, u), typeof i.UNSAFE_componentWillUpdate == "function" && i.UNSAFE_componentWillUpdate(r, w, u)), typeof i.componentDidUpdate == "function" && (t.flags |= 4), typeof i.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof i.componentDidUpdate != "function" || a === e.memoizedProps && m === e.memoizedState || (t.flags |= 4), typeof i.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && m === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = w), i.props = r, i.state = w, i.context = u, r = d) : (typeof i.componentDidUpdate != "function" || a === e.memoizedProps && m === e.memoizedState || (t.flags |= 4), typeof i.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && m === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return Lo(e, t, n, r, o, l);
}
function Lo(e, t, n, r, l, o) {
  Vs(e, t);
  var i = (t.flags & 128) !== 0;
  if (!r && !i) return l && wa(t, n, !1), Xe(e, t, o);
  r = t.stateNode, vf.current = t;
  var a = i && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && i ? (t.child = tn(t, e.child, null, o), t.child = tn(t, null, a, o)) : ae(e, t, a, o), t.memoizedState = r.state, l && wa(t, n, !0), t.child;
}
function Hs(e) {
  var t = e.stateNode;
  t.pendingContext ? ya(e, t.pendingContext, t.pendingContext !== t.context) : t.context && ya(e, t.context, !1), yi(e, t.containerInfo);
}
function Oa(e, t, n, r, l) {
  return en(), pi(l), t.flags |= 256, ae(e, t, n, r), t.child;
}
var Io = { dehydrated: null, treeContext: null, retryLane: 0 };
function Ro(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function bs(e, t, n) {
  var r = t.pendingProps, l = V.current, o = !1, i = (t.flags & 128) !== 0, a;
  if ((a = i) || (a = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0), a ? (o = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (l |= 1), O(V, l & 1), e === null)
    return No(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (i = r.children, e = r.fallback, o ? (r = t.mode, o = t.child, i = { mode: "hidden", children: i }, !(r & 1) && o !== null ? (o.childLanes = 0, o.pendingProps = i) : o = ml(i, r, 0, null), e = Ct(e, r, n, null), o.return = t, e.return = t, o.sibling = e, t.child = o, t.child.memoizedState = Ro(n), t.memoizedState = Io, e) : zi(t, i));
  if (l = e.memoizedState, l !== null && (a = l.dehydrated, a !== null)) return gf(e, t, i, r, a, l, n);
  if (o) {
    o = r.fallback, i = t.mode, l = e.child, a = l.sibling;
    var u = { mode: "hidden", children: r.children };
    return !(i & 1) && t.child !== l ? (r = t.child, r.childLanes = 0, r.pendingProps = u, t.deletions = null) : (r = ct(l, u), r.subtreeFlags = l.subtreeFlags & 14680064), a !== null ? o = ct(a, o) : (o = Ct(o, i, n, null), o.flags |= 2), o.return = t, r.return = t, r.sibling = o, t.child = r, r = o, o = t.child, i = e.child.memoizedState, i = i === null ? Ro(n) : { baseLanes: i.baseLanes | n, cachePool: null, transitions: i.transitions }, o.memoizedState = i, o.childLanes = e.childLanes & ~n, t.memoizedState = Io, r;
  }
  return o = e.child, e = o.sibling, r = ct(o, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function zi(e, t) {
  return t = ml({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function hr(e, t, n, r) {
  return r !== null && pi(r), tn(t, e.child, null, n), e = zi(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function gf(e, t, n, r, l, o, i) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = Ql(Error(y(422))), hr(e, t, i, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (o = r.fallback, l = t.mode, r = ml({ mode: "visible", children: r.children }, l, 0, null), o = Ct(o, l, i, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && tn(t, e.child, null, i), t.child.memoizedState = Ro(i), t.memoizedState = Io, o);
  if (!(t.mode & 1)) return hr(e, t, i, null);
  if (l.data === "$!") {
    if (r = l.nextSibling && l.nextSibling.dataset, r) var a = r.dgst;
    return r = a, o = Error(y(419)), r = Ql(o, r, void 0), hr(e, t, i, r);
  }
  if (a = (i & e.childLanes) !== 0, fe || a) {
    if (r = J, r !== null) {
      switch (i & -i) {
        case 4:
          l = 2;
          break;
        case 16:
          l = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          l = 32;
          break;
        case 536870912:
          l = 268435456;
          break;
        default:
          l = 0;
      }
      l = l & (r.suspendedLanes | i) ? 0 : l, l !== 0 && l !== o.retryLane && (o.retryLane = l, Ye(e, l), Re(r, e, l, -1));
    }
    return Ii(), r = Ql(Error(y(421))), hr(e, t, i, r);
  }
  return l.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Mf.bind(null, e), l._reactRetry = t, null) : (e = o.treeContext, ge = at(l.nextSibling), xe = t, A = !0, Le = null, e !== null && (Se[Ee++] = be, Se[Ee++] = Be, Se[Ee++] = zt, be = e.id, Be = e.overflow, zt = t), t = zi(t, r.children), t.flags |= 4096, t);
}
function Fa(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), zo(e.return, t, n);
}
function Kl(e, t, n, r, l) {
  var o = e.memoizedState;
  o === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: l } : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = l);
}
function Bs(e, t, n) {
  var r = t.pendingProps, l = r.revealOrder, o = r.tail;
  if (ae(e, t, r.children, n), r = V.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && Fa(e, n, t);
      else if (e.tag === 19) Fa(e, n, t);
      else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    r &= 1;
  }
  if (O(V, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (l) {
    case "forwards":
      for (n = t.child, l = null; n !== null; ) e = n.alternate, e !== null && Yr(e) === null && (l = n), n = n.sibling;
      n = l, n === null ? (l = t.child, t.child = null) : (l = n.sibling, n.sibling = null), Kl(t, !1, l, n, o);
      break;
    case "backwards":
      for (n = null, l = t.child, t.child = null; l !== null; ) {
        if (e = l.alternate, e !== null && Yr(e) === null) {
          t.child = l;
          break;
        }
        e = l.sibling, l.sibling = n, n = l, l = e;
      }
      Kl(t, !0, n, null, o);
      break;
    case "together":
      Kl(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function _r(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function Xe(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Pt |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(y(153));
  if (t.child !== null) {
    for (e = t.child, n = ct(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = ct(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function xf(e, t, n) {
  switch (t.tag) {
    case 3:
      Hs(t), en();
      break;
    case 5:
      vs(t);
      break;
    case 1:
      me(t.type) && Hr(t);
      break;
    case 4:
      yi(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, l = t.memoizedProps.value;
      O(Wr, r._currentValue), r._currentValue = l;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (O(V, V.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? bs(e, t, n) : (O(V, V.current & 1), e = Xe(e, t, n), e !== null ? e.sibling : null);
      O(V, V.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Bs(e, t, n);
        t.flags |= 128;
      }
      if (l = t.memoizedState, l !== null && (l.rendering = null, l.tail = null, l.lastEffect = null), O(V, V.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, As(e, t, n);
  }
  return Xe(e, t, n);
}
var Ws, Do, Qs, Ks;
Ws = function(e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      n.child.return = n, n = n.child;
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    n.sibling.return = n.return, n = n.sibling;
  }
};
Do = function() {
};
Qs = function(e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    e = t.stateNode, Et(Ae.current);
    var o = null;
    switch (n) {
      case "input":
        l = no(e, l), r = no(e, r), o = [];
        break;
      case "select":
        l = b({}, l, { value: void 0 }), r = b({}, r, { value: void 0 }), o = [];
        break;
      case "textarea":
        l = oo(e, l), r = oo(e, r), o = [];
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Ar);
    }
    ao(n, r);
    var i;
    n = null;
    for (d in l) if (!r.hasOwnProperty(d) && l.hasOwnProperty(d) && l[d] != null) if (d === "style") {
      var a = l[d];
      for (i in a) a.hasOwnProperty(i) && (n || (n = {}), n[i] = "");
    } else d !== "dangerouslySetInnerHTML" && d !== "children" && d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (Ln.hasOwnProperty(d) ? o || (o = []) : (o = o || []).push(d, null));
    for (d in r) {
      var u = r[d];
      if (a = l?.[d], r.hasOwnProperty(d) && u !== a && (u != null || a != null)) if (d === "style") if (a) {
        for (i in a) !a.hasOwnProperty(i) || u && u.hasOwnProperty(i) || (n || (n = {}), n[i] = "");
        for (i in u) u.hasOwnProperty(i) && a[i] !== u[i] && (n || (n = {}), n[i] = u[i]);
      } else n || (o || (o = []), o.push(
        d,
        n
      )), n = u;
      else d === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, a = a ? a.__html : void 0, u != null && a !== u && (o = o || []).push(d, u)) : d === "children" ? typeof u != "string" && typeof u != "number" || (o = o || []).push(d, "" + u) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && (Ln.hasOwnProperty(d) ? (u != null && d === "onScroll" && $("scroll", e), o || a === u || (o = [])) : (o = o || []).push(d, u));
    }
    n && (o = o || []).push("style", n);
    var d = o;
    (t.updateQueue = d) && (t.flags |= 4);
  }
};
Ks = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function gn(e, t) {
  if (!A) switch (e.tailMode) {
    case "hidden":
      t = e.tail;
      for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
      n === null ? e.tail = null : n.sibling = null;
      break;
    case "collapsed":
      n = e.tail;
      for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
      r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
  }
}
function le(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags & 14680064, r |= l.flags & 14680064, l.return = e, l = l.sibling;
  else for (l = e.child; l !== null; ) n |= l.lanes | l.childLanes, r |= l.subtreeFlags, r |= l.flags, l.return = e, l = l.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function yf(e, t, n) {
  var r = t.pendingProps;
  switch (fi(t), t.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return le(t), null;
    case 1:
      return me(t.type) && Vr(), le(t), null;
    case 3:
      return r = t.stateNode, nn(), U(pe), U(ie), ki(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (pr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Le !== null && (bo(Le), Le = null))), Do(e, t), le(t), null;
    case 5:
      wi(t);
      var l = Et(Bn.current);
      if (n = t.type, e !== null && t.stateNode != null) Qs(e, t, n, r, l), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(y(166));
          return le(t), null;
        }
        if (e = Et(Ae.current), pr(t)) {
          r = t.stateNode, n = t.type;
          var o = t.memoizedProps;
          switch (r[$e] = t, r[Hn] = o, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              $("cancel", r), $("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              $("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < Sn.length; l++) $(Sn[l], r);
              break;
            case "source":
              $("error", r);
              break;
            case "img":
            case "image":
            case "link":
              $(
                "error",
                r
              ), $("load", r);
              break;
            case "details":
              $("toggle", r);
              break;
            case "input":
              Qi(r, o), $("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!o.multiple }, $("invalid", r);
              break;
            case "textarea":
              Yi(r, o), $("invalid", r);
          }
          ao(n, o), l = null;
          for (var i in o) if (o.hasOwnProperty(i)) {
            var a = o[i];
            i === "children" ? typeof a == "string" ? r.textContent !== a && (o.suppressHydrationWarning !== !0 && fr(r.textContent, a, e), l = ["children", a]) : typeof a == "number" && r.textContent !== "" + a && (o.suppressHydrationWarning !== !0 && fr(
              r.textContent,
              a,
              e
            ), l = ["children", "" + a]) : Ln.hasOwnProperty(i) && a != null && i === "onScroll" && $("scroll", r);
          }
          switch (n) {
            case "input":
              lr(r), Ki(r, o, !0);
              break;
            case "textarea":
              lr(r), Xi(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof o.onClick == "function" && (r.onclick = Ar);
          }
          r = l, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          i = l.nodeType === 9 ? l : l.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = ku(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = i.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = i.createElement(n, { is: r.is }) : (e = i.createElement(n), n === "select" && (i = e, r.multiple ? i.multiple = !0 : r.size && (i.size = r.size))) : e = i.createElementNS(e, n), e[$e] = t, e[Hn] = r, Ws(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (i = uo(n, r), n) {
              case "dialog":
                $("cancel", e), $("close", e), l = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                $("load", e), l = r;
                break;
              case "video":
              case "audio":
                for (l = 0; l < Sn.length; l++) $(Sn[l], e);
                l = r;
                break;
              case "source":
                $("error", e), l = r;
                break;
              case "img":
              case "image":
              case "link":
                $(
                  "error",
                  e
                ), $("load", e), l = r;
                break;
              case "details":
                $("toggle", e), l = r;
                break;
              case "input":
                Qi(e, r), l = no(e, r), $("invalid", e);
                break;
              case "option":
                l = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, l = b({}, r, { value: void 0 }), $("invalid", e);
                break;
              case "textarea":
                Yi(e, r), l = oo(e, r), $("invalid", e);
                break;
              default:
                l = r;
            }
            ao(n, l), a = l;
            for (o in a) if (a.hasOwnProperty(o)) {
              var u = a[o];
              o === "style" ? ju(e, u) : o === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Su(e, u)) : o === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && In(e, u) : typeof u == "number" && In(e, "" + u) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (Ln.hasOwnProperty(o) ? u != null && o === "onScroll" && $("scroll", e) : u != null && qo(e, o, u, i));
            }
            switch (n) {
              case "input":
                lr(e), Ki(e, r, !1);
                break;
              case "textarea":
                lr(e), Xi(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + ft(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, o = r.value, o != null ? Qt(e, !!r.multiple, o, !1) : r.defaultValue != null && Qt(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = Ar);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
      }
      return le(t), null;
    case 6:
      if (e && t.stateNode != null) Ks(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(y(166));
        if (n = Et(Bn.current), Et(Ae.current), pr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[$e] = t, (o = r.nodeValue !== n) && (e = xe, e !== null)) switch (e.tag) {
            case 3:
              fr(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && fr(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          o && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[$e] = t, t.stateNode = r;
      }
      return le(t), null;
    case 13:
      if (U(V), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (A && ge !== null && t.mode & 1 && !(t.flags & 128)) cs(), en(), t.flags |= 98560, o = !1;
        else if (o = pr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!o) throw Error(y(318));
            if (o = t.memoizedState, o = o !== null ? o.dehydrated : null, !o) throw Error(y(317));
            o[$e] = t;
          } else en(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          le(t), o = !1;
        } else Le !== null && (bo(Le), Le = null), o = !0;
        if (!o) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || V.current & 1 ? G === 0 && (G = 3) : Ii())), t.updateQueue !== null && (t.flags |= 4), le(t), null);
    case 4:
      return nn(), Do(e, t), e === null && An(t.stateNode.containerInfo), le(t), null;
    case 10:
      return vi(t.type._context), le(t), null;
    case 17:
      return me(t.type) && Vr(), le(t), null;
    case 19:
      if (U(V), o = t.memoizedState, o === null) return le(t), null;
      if (r = (t.flags & 128) !== 0, i = o.rendering, i === null) if (r) gn(o, !1);
      else {
        if (G !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (i = Yr(e), i !== null) {
            for (t.flags |= 128, gn(o, !1), r = i.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) o = n, e = r, o.flags &= 14680066, i = o.alternate, i === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = i.childLanes, o.lanes = i.lanes, o.child = i.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = i.memoizedProps, o.memoizedState = i.memoizedState, o.updateQueue = i.updateQueue, o.type = i.type, e = i.dependencies, o.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return O(V, V.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        o.tail !== null && K() > ln && (t.flags |= 128, r = !0, gn(o, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = Yr(i), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), gn(o, !0), o.tail === null && o.tailMode === "hidden" && !i.alternate && !A) return le(t), null;
        } else 2 * K() - o.renderingStartTime > ln && n !== 1073741824 && (t.flags |= 128, r = !0, gn(o, !1), t.lanes = 4194304);
        o.isBackwards ? (i.sibling = t.child, t.child = i) : (n = o.last, n !== null ? n.sibling = i : t.child = i, o.last = i);
      }
      return o.tail !== null ? (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = K(), t.sibling = null, n = V.current, O(V, r ? n & 1 | 2 : n & 1), t) : (le(t), null);
    case 22:
    case 23:
      return Li(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? ve & 1073741824 && (le(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : le(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(y(156, t.tag));
}
function wf(e, t) {
  switch (fi(t), t.tag) {
    case 1:
      return me(t.type) && Vr(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return nn(), U(pe), U(ie), ki(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return wi(t), null;
    case 13:
      if (U(V), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(y(340));
        en();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return U(V), null;
    case 4:
      return nn(), null;
    case 10:
      return vi(t.type._context), null;
    case 22:
    case 23:
      return Li(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var vr = !1, oe = !1, kf = typeof WeakSet == "function" ? WeakSet : Set, E = null;
function Bt(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    B(e, t, r);
  }
  else n.current = null;
}
function Oo(e, t, n) {
  try {
    n();
  } catch (r) {
    B(e, t, r);
  }
}
var $a = !1;
function Sf(e, t) {
  if (yo = Fr, e = Zu(), di(e)) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else e: {
      n = (n = e.ownerDocument) && n.defaultView || window;
      var r = n.getSelection && n.getSelection();
      if (r && r.rangeCount !== 0) {
        n = r.anchorNode;
        var l = r.anchorOffset, o = r.focusNode;
        r = r.focusOffset;
        try {
          n.nodeType, o.nodeType;
        } catch {
          n = null;
          break e;
        }
        var i = 0, a = -1, u = -1, d = 0, v = 0, h = e, m = null;
        t: for (; ; ) {
          for (var x; h !== n || l !== 0 && h.nodeType !== 3 || (a = i + l), h !== o || r !== 0 && h.nodeType !== 3 || (u = i + r), h.nodeType === 3 && (i += h.nodeValue.length), (x = h.firstChild) !== null; )
            m = h, h = x;
          for (; ; ) {
            if (h === e) break t;
            if (m === n && ++d === l && (a = i), m === o && ++v === r && (u = i), (x = h.nextSibling) !== null) break;
            h = m, m = h.parentNode;
          }
          h = x;
        }
        n = a === -1 || u === -1 ? null : { start: a, end: u };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (wo = { focusedElem: e, selectionRange: n }, Fr = !1, E = t; E !== null; ) if (t = E, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, E = e;
  else for (; E !== null; ) {
    t = E;
    try {
      var w = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (w !== null) {
            var k = w.memoizedProps, _ = w.memoizedState, p = t.stateNode, s = p.getSnapshotBeforeUpdate(t.elementType === t.type ? k : Me(t.type, k), _);
            p.__reactInternalSnapshotBeforeUpdate = s;
          }
          break;
        case 3:
          var c = t.stateNode.containerInfo;
          c.nodeType === 1 ? c.textContent = "" : c.nodeType === 9 && c.documentElement && c.removeChild(c.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(y(163));
      }
    } catch (g) {
      B(t, t.return, g);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, E = e;
      break;
    }
    E = t.return;
  }
  return w = $a, $a = !1, w;
}
function Pn(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var l = r = r.next;
    do {
      if ((l.tag & e) === e) {
        var o = l.destroy;
        l.destroy = void 0, o !== void 0 && Oo(t, n, o);
      }
      l = l.next;
    } while (l !== r);
  }
}
function fl(e, t) {
  if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
    var n = t = t.next;
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function Fo(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : t.current = e;
  }
}
function Ys(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Ys(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[$e], delete t[Hn], delete t[Eo], delete t[rf], delete t[lf])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function Xs(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Ua(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || Xs(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function $o(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Ar));
  else if (r !== 4 && (e = e.child, e !== null)) for ($o(e, t, n), e = e.sibling; e !== null; ) $o(e, t, n), e = e.sibling;
}
function Uo(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (Uo(e, t, n), e = e.sibling; e !== null; ) Uo(e, t, n), e = e.sibling;
}
var ee = null, Te = !1;
function qe(e, t, n) {
  for (n = n.child; n !== null; ) Gs(e, t, n), n = n.sibling;
}
function Gs(e, t, n) {
  if (Ue && typeof Ue.onCommitFiberUnmount == "function") try {
    Ue.onCommitFiberUnmount(ll, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      oe || Bt(n, t);
    case 6:
      var r = ee, l = Te;
      ee = null, qe(e, t, n), ee = r, Te = l, ee !== null && (Te ? (e = ee, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : ee.removeChild(n.stateNode));
      break;
    case 18:
      ee !== null && (Te ? (e = ee, n = n.stateNode, e.nodeType === 8 ? Al(e.parentNode, n) : e.nodeType === 1 && Al(e, n), Fn(e)) : Al(ee, n.stateNode));
      break;
    case 4:
      r = ee, l = Te, ee = n.stateNode.containerInfo, Te = !0, qe(e, t, n), ee = r, Te = l;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!oe && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        l = r = r.next;
        do {
          var o = l, i = o.destroy;
          o = o.tag, i !== void 0 && (o & 2 || o & 4) && Oo(n, t, i), l = l.next;
        } while (l !== r);
      }
      qe(e, t, n);
      break;
    case 1:
      if (!oe && (Bt(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (a) {
        B(n, t, a);
      }
      qe(e, t, n);
      break;
    case 21:
      qe(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (oe = (r = oe) || n.memoizedState !== null, qe(e, t, n), oe = r) : qe(e, t, n);
      break;
    default:
      qe(e, t, n);
  }
}
function Aa(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new kf()), t.forEach(function(r) {
      var l = Tf.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(l, l));
    });
  }
}
function Pe(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var l = n[r];
    try {
      var o = e, i = t, a = i;
      e: for (; a !== null; ) {
        switch (a.tag) {
          case 5:
            ee = a.stateNode, Te = !1;
            break e;
          case 3:
            ee = a.stateNode.containerInfo, Te = !0;
            break e;
          case 4:
            ee = a.stateNode.containerInfo, Te = !0;
            break e;
        }
        a = a.return;
      }
      if (ee === null) throw Error(y(160));
      Gs(o, i, l), ee = null, Te = !1;
      var u = l.alternate;
      u !== null && (u.return = null), l.return = null;
    } catch (d) {
      B(l, t, d);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) qs(t, e), t = t.sibling;
}
function qs(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Pe(t, e), Oe(e), r & 4) {
        try {
          Pn(3, e, e.return), fl(3, e);
        } catch (k) {
          B(e, e.return, k);
        }
        try {
          Pn(5, e, e.return);
        } catch (k) {
          B(e, e.return, k);
        }
      }
      break;
    case 1:
      Pe(t, e), Oe(e), r & 512 && n !== null && Bt(n, n.return);
      break;
    case 5:
      if (Pe(t, e), Oe(e), r & 512 && n !== null && Bt(n, n.return), e.flags & 32) {
        var l = e.stateNode;
        try {
          In(l, "");
        } catch (k) {
          B(e, e.return, k);
        }
      }
      if (r & 4 && (l = e.stateNode, l != null)) {
        var o = e.memoizedProps, i = n !== null ? n.memoizedProps : o, a = e.type, u = e.updateQueue;
        if (e.updateQueue = null, u !== null) try {
          a === "input" && o.type === "radio" && o.name != null && yu(l, o), uo(a, i);
          var d = uo(a, o);
          for (i = 0; i < u.length; i += 2) {
            var v = u[i], h = u[i + 1];
            v === "style" ? ju(l, h) : v === "dangerouslySetInnerHTML" ? Su(l, h) : v === "children" ? In(l, h) : qo(l, v, h, d);
          }
          switch (a) {
            case "input":
              ro(l, o);
              break;
            case "textarea":
              wu(l, o);
              break;
            case "select":
              var m = l._wrapperState.wasMultiple;
              l._wrapperState.wasMultiple = !!o.multiple;
              var x = o.value;
              x != null ? Qt(l, !!o.multiple, x, !1) : m !== !!o.multiple && (o.defaultValue != null ? Qt(
                l,
                !!o.multiple,
                o.defaultValue,
                !0
              ) : Qt(l, !!o.multiple, o.multiple ? [] : "", !1));
          }
          l[Hn] = o;
        } catch (k) {
          B(e, e.return, k);
        }
      }
      break;
    case 6:
      if (Pe(t, e), Oe(e), r & 4) {
        if (e.stateNode === null) throw Error(y(162));
        l = e.stateNode, o = e.memoizedProps;
        try {
          l.nodeValue = o;
        } catch (k) {
          B(e, e.return, k);
        }
      }
      break;
    case 3:
      if (Pe(t, e), Oe(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        Fn(t.containerInfo);
      } catch (k) {
        B(e, e.return, k);
      }
      break;
    case 4:
      Pe(t, e), Oe(e);
      break;
    case 13:
      Pe(t, e), Oe(e), l = e.child, l.flags & 8192 && (o = l.memoizedState !== null, l.stateNode.isHidden = o, !o || l.alternate !== null && l.alternate.memoizedState !== null || (Mi = K())), r & 4 && Aa(e);
      break;
    case 22:
      if (v = n !== null && n.memoizedState !== null, e.mode & 1 ? (oe = (d = oe) || v, Pe(t, e), oe = d) : Pe(t, e), Oe(e), r & 8192) {
        if (d = e.memoizedState !== null, (e.stateNode.isHidden = d) && !v && e.mode & 1) for (E = e, v = e.child; v !== null; ) {
          for (h = E = v; E !== null; ) {
            switch (m = E, x = m.child, m.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Pn(4, m, m.return);
                break;
              case 1:
                Bt(m, m.return);
                var w = m.stateNode;
                if (typeof w.componentWillUnmount == "function") {
                  r = m, n = m.return;
                  try {
                    t = r, w.props = t.memoizedProps, w.state = t.memoizedState, w.componentWillUnmount();
                  } catch (k) {
                    B(r, n, k);
                  }
                }
                break;
              case 5:
                Bt(m, m.return);
                break;
              case 22:
                if (m.memoizedState !== null) {
                  Ha(h);
                  continue;
                }
            }
            x !== null ? (x.return = m, E = x) : Ha(h);
          }
          v = v.sibling;
        }
        e: for (v = null, h = e; ; ) {
          if (h.tag === 5) {
            if (v === null) {
              v = h;
              try {
                l = h.stateNode, d ? (o = l.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (a = h.stateNode, u = h.memoizedProps.style, i = u != null && u.hasOwnProperty("display") ? u.display : null, a.style.display = Eu("display", i));
              } catch (k) {
                B(e, e.return, k);
              }
            }
          } else if (h.tag === 6) {
            if (v === null) try {
              h.stateNode.nodeValue = d ? "" : h.memoizedProps;
            } catch (k) {
              B(e, e.return, k);
            }
          } else if ((h.tag !== 22 && h.tag !== 23 || h.memoizedState === null || h === e) && h.child !== null) {
            h.child.return = h, h = h.child;
            continue;
          }
          if (h === e) break e;
          for (; h.sibling === null; ) {
            if (h.return === null || h.return === e) break e;
            v === h && (v = null), h = h.return;
          }
          v === h && (v = null), h.sibling.return = h.return, h = h.sibling;
        }
      }
      break;
    case 19:
      Pe(t, e), Oe(e), r & 4 && Aa(e);
      break;
    case 21:
      break;
    default:
      Pe(
        t,
        e
      ), Oe(e);
  }
}
function Oe(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Xs(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(y(160));
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode;
          r.flags & 32 && (In(l, ""), r.flags &= -33);
          var o = Ua(e);
          Uo(e, o, l);
          break;
        case 3:
        case 4:
          var i = r.stateNode.containerInfo, a = Ua(e);
          $o(e, a, i);
          break;
        default:
          throw Error(y(161));
      }
    } catch (u) {
      B(e, e.return, u);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Ef(e, t, n) {
  E = e, Zs(e);
}
function Zs(e, t, n) {
  for (var r = (e.mode & 1) !== 0; E !== null; ) {
    var l = E, o = l.child;
    if (l.tag === 22 && r) {
      var i = l.memoizedState !== null || vr;
      if (!i) {
        var a = l.alternate, u = a !== null && a.memoizedState !== null || oe;
        a = vr;
        var d = oe;
        if (vr = i, (oe = u) && !d) for (E = l; E !== null; ) i = E, u = i.child, i.tag === 22 && i.memoizedState !== null ? ba(l) : u !== null ? (u.return = i, E = u) : ba(l);
        for (; o !== null; ) E = o, Zs(o), o = o.sibling;
        E = l, vr = a, oe = d;
      }
      Va(e);
    } else l.subtreeFlags & 8772 && o !== null ? (o.return = l, E = o) : Va(e);
  }
}
function Va(e) {
  for (; E !== null; ) {
    var t = E;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            oe || fl(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !oe) if (n === null) r.componentDidMount();
            else {
              var l = t.elementType === t.type ? n.memoizedProps : Me(t.type, n.memoizedProps);
              r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var o = t.updateQueue;
            o !== null && Ca(t, o, r);
            break;
          case 3:
            var i = t.updateQueue;
            if (i !== null) {
              if (n = null, t.child !== null) switch (t.child.tag) {
                case 5:
                  n = t.child.stateNode;
                  break;
                case 1:
                  n = t.child.stateNode;
              }
              Ca(t, i, n);
            }
            break;
          case 5:
            var a = t.stateNode;
            if (n === null && t.flags & 4) {
              n = a;
              var u = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  u.autoFocus && n.focus();
                  break;
                case "img":
                  u.src && (n.src = u.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (t.memoizedState === null) {
              var d = t.alternate;
              if (d !== null) {
                var v = d.memoizedState;
                if (v !== null) {
                  var h = v.dehydrated;
                  h !== null && Fn(h);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(y(163));
        }
        oe || t.flags & 512 && Fo(t);
      } catch (m) {
        B(t, t.return, m);
      }
    }
    if (t === e) {
      E = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, E = n;
      break;
    }
    E = t.return;
  }
}
function Ha(e) {
  for (; E !== null; ) {
    var t = E;
    if (t === e) {
      E = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, E = n;
      break;
    }
    E = t.return;
  }
}
function ba(e) {
  for (; E !== null; ) {
    var t = E;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            fl(4, t);
          } catch (u) {
            B(t, n, u);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (u) {
              B(t, l, u);
            }
          }
          var o = t.return;
          try {
            Fo(t);
          } catch (u) {
            B(t, o, u);
          }
          break;
        case 5:
          var i = t.return;
          try {
            Fo(t);
          } catch (u) {
            B(t, i, u);
          }
      }
    } catch (u) {
      B(t, t.return, u);
    }
    if (t === e) {
      E = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      a.return = t.return, E = a;
      break;
    }
    E = t.return;
  }
}
var jf = Math.ceil, qr = Ge.ReactCurrentDispatcher, _i = Ge.ReactCurrentOwner, Ce = Ge.ReactCurrentBatchConfig, I = 0, J = null, Y = null, te = 0, ve = 0, Wt = ht(0), G = 0, Yn = null, Pt = 0, pl = 0, Pi = 0, Mn = null, ce = null, Mi = 0, ln = 1 / 0, Ve = null, Zr = !1, Ao = null, st = null, gr = !1, rt = null, Jr = 0, Tn = 0, Vo = null, Pr = -1, Mr = 0;
function ue() {
  return I & 6 ? K() : Pr !== -1 ? Pr : Pr = K();
}
function dt(e) {
  return e.mode & 1 ? I & 2 && te !== 0 ? te & -te : af.transition !== null ? (Mr === 0 && (Mr = Ou()), Mr) : (e = D, e !== 0 || (e = window.event, e = e === void 0 ? 16 : bu(e.type)), e) : 1;
}
function Re(e, t, n, r) {
  if (50 < Tn) throw Tn = 0, Vo = null, Error(y(185));
  Gn(e, n, r), (!(I & 2) || e !== J) && (e === J && (!(I & 2) && (pl |= n), G === 4 && tt(e, te)), he(e, r), n === 1 && I === 0 && !(t.mode & 1) && (ln = K() + 500, sl && vt()));
}
function he(e, t) {
  var n = e.callbackNode;
  ic(e, t);
  var r = Or(e, e === J ? te : 0);
  if (r === 0) n !== null && Zi(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Zi(n), t === 1) e.tag === 0 ? of(Ba.bind(null, e)) : us(Ba.bind(null, e)), tf(function() {
      !(I & 6) && vt();
    }), n = null;
    else {
      switch (Fu(r)) {
        case 1:
          n = ni;
          break;
        case 4:
          n = Ru;
          break;
        case 16:
          n = Dr;
          break;
        case 536870912:
          n = Du;
          break;
        default:
          n = Dr;
      }
      n = id(n, Js.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function Js(e, t) {
  if (Pr = -1, Mr = 0, I & 6) throw Error(y(327));
  var n = e.callbackNode;
  if (qt() && e.callbackNode !== n) return null;
  var r = Or(e, e === J ? te : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = el(e, r);
  else {
    t = r;
    var l = I;
    I |= 2;
    var o = td();
    (J !== e || te !== t) && (Ve = null, ln = K() + 500, jt(e, t));
    do
      try {
        zf();
        break;
      } catch (a) {
        ed(e, a);
      }
    while (!0);
    hi(), qr.current = o, I = l, Y !== null ? t = 0 : (J = null, te = 0, t = G);
  }
  if (t !== 0) {
    if (t === 2 && (l = mo(e), l !== 0 && (r = l, t = Ho(e, l))), t === 1) throw n = Yn, jt(e, 0), tt(e, r), he(e, K()), n;
    if (t === 6) tt(e, r);
    else {
      if (l = e.current.alternate, !(r & 30) && !Cf(l) && (t = el(e, r), t === 2 && (o = mo(e), o !== 0 && (r = o, t = Ho(e, o))), t === 1)) throw n = Yn, jt(e, 0), tt(e, r), he(e, K()), n;
      switch (e.finishedWork = l, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(y(345));
        case 2:
          wt(e, ce, Ve);
          break;
        case 3:
          if (tt(e, r), (r & 130023424) === r && (t = Mi + 500 - K(), 10 < t)) {
            if (Or(e, 0) !== 0) break;
            if (l = e.suspendedLanes, (l & r) !== r) {
              ue(), e.pingedLanes |= e.suspendedLanes & l;
              break;
            }
            e.timeoutHandle = So(wt.bind(null, e, ce, Ve), t);
            break;
          }
          wt(e, ce, Ve);
          break;
        case 4:
          if (tt(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var i = 31 - Ie(r);
            o = 1 << i, i = t[i], i > l && (l = i), r &= ~o;
          }
          if (r = l, r = K() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * jf(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = So(wt.bind(null, e, ce, Ve), r);
            break;
          }
          wt(e, ce, Ve);
          break;
        case 5:
          wt(e, ce, Ve);
          break;
        default:
          throw Error(y(329));
      }
    }
  }
  return he(e, K()), e.callbackNode === n ? Js.bind(null, e) : null;
}
function Ho(e, t) {
  var n = Mn;
  return e.current.memoizedState.isDehydrated && (jt(e, t).flags |= 256), e = el(e, t), e !== 2 && (t = ce, ce = n, t !== null && bo(t)), e;
}
function bo(e) {
  ce === null ? ce = e : ce.push.apply(ce, e);
}
function Cf(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var l = n[r], o = l.getSnapshot;
        l = l.value;
        try {
          if (!De(o(), l)) return !1;
        } catch {
          return !1;
        }
      }
    }
    if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
  }
  return !0;
}
function tt(e, t) {
  for (t &= ~Pi, t &= ~pl, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - Ie(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Ba(e) {
  if (I & 6) throw Error(y(327));
  qt();
  var t = Or(e, 0);
  if (!(t & 1)) return he(e, K()), null;
  var n = el(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = mo(e);
    r !== 0 && (t = r, n = Ho(e, r));
  }
  if (n === 1) throw n = Yn, jt(e, 0), tt(e, t), he(e, K()), n;
  if (n === 6) throw Error(y(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, wt(e, ce, Ve), he(e, K()), null;
}
function Ti(e, t) {
  var n = I;
  I |= 1;
  try {
    return e(t);
  } finally {
    I = n, I === 0 && (ln = K() + 500, sl && vt());
  }
}
function Mt(e) {
  rt !== null && rt.tag === 0 && !(I & 6) && qt();
  var t = I;
  I |= 1;
  var n = Ce.transition, r = D;
  try {
    if (Ce.transition = null, D = 1, e) return e();
  } finally {
    D = r, Ce.transition = n, I = t, !(I & 6) && vt();
  }
}
function Li() {
  ve = Wt.current, U(Wt);
}
function jt(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, ef(n)), Y !== null) for (n = Y.return; n !== null; ) {
    var r = n;
    switch (fi(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && Vr();
        break;
      case 3:
        nn(), U(pe), U(ie), ki();
        break;
      case 5:
        wi(r);
        break;
      case 4:
        nn();
        break;
      case 13:
        U(V);
        break;
      case 19:
        U(V);
        break;
      case 10:
        vi(r.type._context);
        break;
      case 22:
      case 23:
        Li();
    }
    n = n.return;
  }
  if (J = e, Y = e = ct(e.current, null), te = ve = t, G = 0, Yn = null, Pi = pl = Pt = 0, ce = Mn = null, St !== null) {
    for (t = 0; t < St.length; t++) if (n = St[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var l = r.next, o = n.pending;
      if (o !== null) {
        var i = o.next;
        o.next = l, r.next = i;
      }
      n.pending = r;
    }
    St = null;
  }
  return e;
}
function ed(e, t) {
  do {
    var n = Y;
    try {
      if (hi(), Nr.current = Gr, Xr) {
        for (var r = H.memoizedState; r !== null; ) {
          var l = r.queue;
          l !== null && (l.pending = null), r = r.next;
        }
        Xr = !1;
      }
      if (_t = 0, Z = X = H = null, _n = !1, Wn = 0, _i.current = null, n === null || n.return === null) {
        G = 1, Yn = t, Y = null;
        break;
      }
      e: {
        var o = e, i = n.return, a = n, u = t;
        if (t = te, a.flags |= 32768, u !== null && typeof u == "object" && typeof u.then == "function") {
          var d = u, v = a, h = v.tag;
          if (!(v.mode & 1) && (h === 0 || h === 11 || h === 15)) {
            var m = v.alternate;
            m ? (v.updateQueue = m.updateQueue, v.memoizedState = m.memoizedState, v.lanes = m.lanes) : (v.updateQueue = null, v.memoizedState = null);
          }
          var x = Ta(i);
          if (x !== null) {
            x.flags &= -257, La(x, i, a, o, t), x.mode & 1 && Ma(o, d, t), t = x, u = d;
            var w = t.updateQueue;
            if (w === null) {
              var k = /* @__PURE__ */ new Set();
              k.add(u), t.updateQueue = k;
            } else w.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              Ma(o, d, t), Ii();
              break e;
            }
            u = Error(y(426));
          }
        } else if (A && a.mode & 1) {
          var _ = Ta(i);
          if (_ !== null) {
            !(_.flags & 65536) && (_.flags |= 256), La(_, i, a, o, t), pi(rn(u, a));
            break e;
          }
        }
        o = u = rn(u, a), G !== 4 && (G = 2), Mn === null ? Mn = [o] : Mn.push(o), o = i;
        do {
          switch (o.tag) {
            case 3:
              o.flags |= 65536, t &= -t, o.lanes |= t;
              var p = Fs(o, u, t);
              ja(o, p);
              break e;
            case 1:
              a = u;
              var s = o.type, c = o.stateNode;
              if (!(o.flags & 128) && (typeof s.getDerivedStateFromError == "function" || c !== null && typeof c.componentDidCatch == "function" && (st === null || !st.has(c)))) {
                o.flags |= 65536, t &= -t, o.lanes |= t;
                var g = $s(o, a, t);
                ja(o, g);
                break e;
              }
          }
          o = o.return;
        } while (o !== null);
      }
      rd(n);
    } catch (S) {
      t = S, Y === n && n !== null && (Y = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function td() {
  var e = qr.current;
  return qr.current = Gr, e === null ? Gr : e;
}
function Ii() {
  (G === 0 || G === 3 || G === 2) && (G = 4), J === null || !(Pt & 268435455) && !(pl & 268435455) || tt(J, te);
}
function el(e, t) {
  var n = I;
  I |= 2;
  var r = td();
  (J !== e || te !== t) && (Ve = null, jt(e, t));
  do
    try {
      Nf();
      break;
    } catch (l) {
      ed(e, l);
    }
  while (!0);
  if (hi(), I = n, qr.current = r, Y !== null) throw Error(y(261));
  return J = null, te = 0, G;
}
function Nf() {
  for (; Y !== null; ) nd(Y);
}
function zf() {
  for (; Y !== null && !qd(); ) nd(Y);
}
function nd(e) {
  var t = od(e.alternate, e, ve);
  e.memoizedProps = e.pendingProps, t === null ? rd(e) : Y = t, _i.current = null;
}
function rd(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = wf(n, t), n !== null) {
        n.flags &= 32767, Y = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        G = 6, Y = null;
        return;
      }
    } else if (n = yf(n, t, ve), n !== null) {
      Y = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      Y = t;
      return;
    }
    Y = t = e;
  } while (t !== null);
  G === 0 && (G = 5);
}
function wt(e, t, n) {
  var r = D, l = Ce.transition;
  try {
    Ce.transition = null, D = 1, _f(e, t, n, r);
  } finally {
    Ce.transition = l, D = r;
  }
  return null;
}
function _f(e, t, n, r) {
  do
    qt();
  while (rt !== null);
  if (I & 6) throw Error(y(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(y(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var o = n.lanes | n.childLanes;
  if (ac(e, o), e === J && (Y = J = null, te = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || gr || (gr = !0, id(Dr, function() {
    return qt(), null;
  })), o = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || o) {
    o = Ce.transition, Ce.transition = null;
    var i = D;
    D = 1;
    var a = I;
    I |= 4, _i.current = null, Sf(e, n), qs(n, e), Kc(wo), Fr = !!yo, wo = yo = null, e.current = n, Ef(n), Zd(), I = a, D = i, Ce.transition = o;
  } else e.current = n;
  if (gr && (gr = !1, rt = e, Jr = l), o = e.pendingLanes, o === 0 && (st = null), tc(n.stateNode), he(e, K()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) l = t[n], r(l.value, { componentStack: l.stack, digest: l.digest });
  if (Zr) throw Zr = !1, e = Ao, Ao = null, e;
  return Jr & 1 && e.tag !== 0 && qt(), o = e.pendingLanes, o & 1 ? e === Vo ? Tn++ : (Tn = 0, Vo = e) : Tn = 0, vt(), null;
}
function qt() {
  if (rt !== null) {
    var e = Fu(Jr), t = Ce.transition, n = D;
    try {
      if (Ce.transition = null, D = 16 > e ? 16 : e, rt === null) var r = !1;
      else {
        if (e = rt, rt = null, Jr = 0, I & 6) throw Error(y(331));
        var l = I;
        for (I |= 4, E = e.current; E !== null; ) {
          var o = E, i = o.child;
          if (E.flags & 16) {
            var a = o.deletions;
            if (a !== null) {
              for (var u = 0; u < a.length; u++) {
                var d = a[u];
                for (E = d; E !== null; ) {
                  var v = E;
                  switch (v.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Pn(8, v, o);
                  }
                  var h = v.child;
                  if (h !== null) h.return = v, E = h;
                  else for (; E !== null; ) {
                    v = E;
                    var m = v.sibling, x = v.return;
                    if (Ys(v), v === d) {
                      E = null;
                      break;
                    }
                    if (m !== null) {
                      m.return = x, E = m;
                      break;
                    }
                    E = x;
                  }
                }
              }
              var w = o.alternate;
              if (w !== null) {
                var k = w.child;
                if (k !== null) {
                  w.child = null;
                  do {
                    var _ = k.sibling;
                    k.sibling = null, k = _;
                  } while (k !== null);
                }
              }
              E = o;
            }
          }
          if (o.subtreeFlags & 2064 && i !== null) i.return = o, E = i;
          else e: for (; E !== null; ) {
            if (o = E, o.flags & 2048) switch (o.tag) {
              case 0:
              case 11:
              case 15:
                Pn(9, o, o.return);
            }
            var p = o.sibling;
            if (p !== null) {
              p.return = o.return, E = p;
              break e;
            }
            E = o.return;
          }
        }
        var s = e.current;
        for (E = s; E !== null; ) {
          i = E;
          var c = i.child;
          if (i.subtreeFlags & 2064 && c !== null) c.return = i, E = c;
          else e: for (i = s; E !== null; ) {
            if (a = E, a.flags & 2048) try {
              switch (a.tag) {
                case 0:
                case 11:
                case 15:
                  fl(9, a);
              }
            } catch (S) {
              B(a, a.return, S);
            }
            if (a === i) {
              E = null;
              break e;
            }
            var g = a.sibling;
            if (g !== null) {
              g.return = a.return, E = g;
              break e;
            }
            E = a.return;
          }
        }
        if (I = l, vt(), Ue && typeof Ue.onPostCommitFiberRoot == "function") try {
          Ue.onPostCommitFiberRoot(ll, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      D = n, Ce.transition = t;
    }
  }
  return !1;
}
function Wa(e, t, n) {
  t = rn(n, t), t = Fs(e, t, 1), e = ut(e, t, 1), t = ue(), e !== null && (Gn(e, 1, t), he(e, t));
}
function B(e, t, n) {
  if (e.tag === 3) Wa(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      Wa(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (st === null || !st.has(r))) {
        e = rn(n, e), e = $s(t, e, 1), t = ut(t, e, 1), e = ue(), t !== null && (Gn(t, 1, e), he(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function Pf(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = ue(), e.pingedLanes |= e.suspendedLanes & n, J === e && (te & n) === n && (G === 4 || G === 3 && (te & 130023424) === te && 500 > K() - Mi ? jt(e, 0) : Pi |= n), he(e, t);
}
function ld(e, t) {
  t === 0 && (e.mode & 1 ? (t = ar, ar <<= 1, !(ar & 130023424) && (ar = 4194304)) : t = 1);
  var n = ue();
  e = Ye(e, t), e !== null && (Gn(e, t, n), he(e, n));
}
function Mf(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), ld(e, n);
}
function Tf(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode, l = e.memoizedState;
      l !== null && (n = l.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(y(314));
  }
  r !== null && r.delete(t), ld(e, n);
}
var od;
od = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || pe.current) fe = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return fe = !1, xf(e, t, n);
    fe = !!(e.flags & 131072);
  }
  else fe = !1, A && t.flags & 1048576 && ss(t, Br, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      _r(e, t), e = t.pendingProps;
      var l = Jt(t, ie.current);
      Gt(t, n), l = Ei(null, t, r, e, l, n);
      var o = ji();
      return t.flags |= 1, typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, me(r) ? (o = !0, Hr(t)) : o = !1, t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null, xi(t), l.updater = cl, t.stateNode = l, l._reactInternals = t, Po(t, r, e, n), t = Lo(null, t, r, !0, o, n)) : (t.tag = 0, A && o && ci(t), ae(null, t, l, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (_r(e, t), e = t.pendingProps, l = r._init, r = l(r._payload), t.type = r, l = t.tag = If(r), e = Me(r, e), l) {
          case 0:
            t = To(null, t, r, e, n);
            break e;
          case 1:
            t = Da(null, t, r, e, n);
            break e;
          case 11:
            t = Ia(null, t, r, e, n);
            break e;
          case 14:
            t = Ra(null, t, r, Me(r.type, e), n);
            break e;
        }
        throw Error(y(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Me(r, l), To(e, t, r, l, n);
    case 1:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Me(r, l), Da(e, t, r, l, n);
    case 3:
      e: {
        if (Hs(t), e === null) throw Error(y(387));
        r = t.pendingProps, o = t.memoizedState, l = o.element, hs(e, t), Kr(t, r, null, n);
        var i = t.memoizedState;
        if (r = i.element, o.isDehydrated) if (o = { element: r, isDehydrated: !1, cache: i.cache, pendingSuspenseBoundaries: i.pendingSuspenseBoundaries, transitions: i.transitions }, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
          l = rn(Error(y(423)), t), t = Oa(e, t, r, n, l);
          break e;
        } else if (r !== l) {
          l = rn(Error(y(424)), t), t = Oa(e, t, r, n, l);
          break e;
        } else for (ge = at(t.stateNode.containerInfo.firstChild), xe = t, A = !0, Le = null, n = ps(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (en(), r === l) {
            t = Xe(e, t, n);
            break e;
          }
          ae(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return vs(t), e === null && No(t), r = t.type, l = t.pendingProps, o = e !== null ? e.memoizedProps : null, i = l.children, ko(r, l) ? i = null : o !== null && ko(r, o) && (t.flags |= 32), Vs(e, t), ae(e, t, i, n), t.child;
    case 6:
      return e === null && No(t), null;
    case 13:
      return bs(e, t, n);
    case 4:
      return yi(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = tn(t, null, r, n) : ae(e, t, r, n), t.child;
    case 11:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Me(r, l), Ia(e, t, r, l, n);
    case 7:
      return ae(e, t, t.pendingProps, n), t.child;
    case 8:
      return ae(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return ae(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, l = t.pendingProps, o = t.memoizedProps, i = l.value, O(Wr, r._currentValue), r._currentValue = i, o !== null) if (De(o.value, i)) {
          if (o.children === l.children && !pe.current) {
            t = Xe(e, t, n);
            break e;
          }
        } else for (o = t.child, o !== null && (o.return = t); o !== null; ) {
          var a = o.dependencies;
          if (a !== null) {
            i = o.child;
            for (var u = a.firstContext; u !== null; ) {
              if (u.context === r) {
                if (o.tag === 1) {
                  u = We(-1, n & -n), u.tag = 2;
                  var d = o.updateQueue;
                  if (d !== null) {
                    d = d.shared;
                    var v = d.pending;
                    v === null ? u.next = u : (u.next = v.next, v.next = u), d.pending = u;
                  }
                }
                o.lanes |= n, u = o.alternate, u !== null && (u.lanes |= n), zo(
                  o.return,
                  n,
                  t
                ), a.lanes |= n;
                break;
              }
              u = u.next;
            }
          } else if (o.tag === 10) i = o.type === t.type ? null : o.child;
          else if (o.tag === 18) {
            if (i = o.return, i === null) throw Error(y(341));
            i.lanes |= n, a = i.alternate, a !== null && (a.lanes |= n), zo(i, n, t), i = o.sibling;
          } else i = o.child;
          if (i !== null) i.return = o;
          else for (i = o; i !== null; ) {
            if (i === t) {
              i = null;
              break;
            }
            if (o = i.sibling, o !== null) {
              o.return = i.return, i = o;
              break;
            }
            i = i.return;
          }
          o = i;
        }
        ae(e, t, l.children, n), t = t.child;
      }
      return t;
    case 9:
      return l = t.type, r = t.pendingProps.children, Gt(t, n), l = Ne(l), r = r(l), t.flags |= 1, ae(e, t, r, n), t.child;
    case 14:
      return r = t.type, l = Me(r, t.pendingProps), l = Me(r.type, l), Ra(e, t, r, l, n);
    case 15:
      return Us(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, l = t.pendingProps, l = t.elementType === r ? l : Me(r, l), _r(e, t), t.tag = 1, me(r) ? (e = !0, Hr(t)) : e = !1, Gt(t, n), Os(t, r, l), Po(t, r, l, n), Lo(null, t, r, !0, e, n);
    case 19:
      return Bs(e, t, n);
    case 22:
      return As(e, t, n);
  }
  throw Error(y(156, t.tag));
};
function id(e, t) {
  return Iu(e, t);
}
function Lf(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function je(e, t, n, r) {
  return new Lf(e, t, n, r);
}
function Ri(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function If(e) {
  if (typeof e == "function") return Ri(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Jo) return 11;
    if (e === ei) return 14;
  }
  return 2;
}
function ct(e, t) {
  var n = e.alternate;
  return n === null ? (n = je(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Tr(e, t, n, r, l, o) {
  var i = 2;
  if (r = e, typeof e == "function") Ri(e) && (i = 1);
  else if (typeof e == "string") i = 5;
  else e: switch (e) {
    case Dt:
      return Ct(n.children, l, o, t);
    case Zo:
      i = 8, l |= 8;
      break;
    case Zl:
      return e = je(12, n, t, l | 2), e.elementType = Zl, e.lanes = o, e;
    case Jl:
      return e = je(13, n, t, l), e.elementType = Jl, e.lanes = o, e;
    case eo:
      return e = je(19, n, t, l), e.elementType = eo, e.lanes = o, e;
    case vu:
      return ml(n, l, o, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case mu:
          i = 10;
          break e;
        case hu:
          i = 9;
          break e;
        case Jo:
          i = 11;
          break e;
        case ei:
          i = 14;
          break e;
        case Ze:
          i = 16, r = null;
          break e;
      }
      throw Error(y(130, e == null ? e : typeof e, ""));
  }
  return t = je(i, n, t, l), t.elementType = e, t.type = r, t.lanes = o, t;
}
function Ct(e, t, n, r) {
  return e = je(7, e, r, t), e.lanes = n, e;
}
function ml(e, t, n, r) {
  return e = je(22, e, r, t), e.elementType = vu, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function Yl(e, t, n) {
  return e = je(6, e, null, t), e.lanes = n, e;
}
function Xl(e, t, n) {
  return t = je(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function Rf(e, t, n, r, l) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Pl(0), this.expirationTimes = Pl(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Pl(0), this.identifierPrefix = r, this.onRecoverableError = l, this.mutableSourceEagerHydrationData = null;
}
function Di(e, t, n, r, l, o, i, a, u) {
  return e = new Rf(e, t, n, a, u), t === 1 ? (t = 1, o === !0 && (t |= 8)) : t = 0, o = je(3, null, null, t), e.current = o, o.stateNode = e, o.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, xi(o), e;
}
function Df(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Rt, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function ad(e) {
  if (!e) return pt;
  e = e._reactInternals;
  e: {
    if (Lt(e) !== e || e.tag !== 1) throw Error(y(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (me(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(y(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (me(n)) return as(e, n, t);
  }
  return t;
}
function ud(e, t, n, r, l, o, i, a, u) {
  return e = Di(n, r, !0, e, l, o, i, a, u), e.context = ad(null), n = e.current, r = ue(), l = dt(n), o = We(r, l), o.callback = t ?? null, ut(n, o, l), e.current.lanes = l, Gn(e, l, r), he(e, r), e;
}
function hl(e, t, n, r) {
  var l = t.current, o = ue(), i = dt(l);
  return n = ad(n), t.context === null ? t.context = n : t.pendingContext = n, t = We(o, i), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = ut(l, t, i), e !== null && (Re(e, l, i, o), Cr(e, l, i)), i;
}
function tl(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Qa(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Oi(e, t) {
  Qa(e, t), (e = e.alternate) && Qa(e, t);
}
function Of() {
  return null;
}
var sd = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function Fi(e) {
  this._internalRoot = e;
}
vl.prototype.render = Fi.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(y(409));
  hl(e, t, null, null);
};
vl.prototype.unmount = Fi.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Mt(function() {
      hl(null, e, null, null);
    }), t[Ke] = null;
  }
};
function vl(e) {
  this._internalRoot = e;
}
vl.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Au();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < et.length && t !== 0 && t < et[n].priority; n++) ;
    et.splice(n, 0, e), n === 0 && Hu(e);
  }
};
function $i(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function gl(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function Ka() {
}
function Ff(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var o = r;
      r = function() {
        var d = tl(i);
        o.call(d);
      };
    }
    var i = ud(t, r, e, 0, null, !1, !1, "", Ka);
    return e._reactRootContainer = i, e[Ke] = i.current, An(e.nodeType === 8 ? e.parentNode : e), Mt(), i;
  }
  for (; l = e.lastChild; ) e.removeChild(l);
  if (typeof r == "function") {
    var a = r;
    r = function() {
      var d = tl(u);
      a.call(d);
    };
  }
  var u = Di(e, 0, !1, null, null, !1, !1, "", Ka);
  return e._reactRootContainer = u, e[Ke] = u.current, An(e.nodeType === 8 ? e.parentNode : e), Mt(function() {
    hl(t, u, n, r);
  }), u;
}
function xl(e, t, n, r, l) {
  var o = n._reactRootContainer;
  if (o) {
    var i = o;
    if (typeof l == "function") {
      var a = l;
      l = function() {
        var u = tl(i);
        a.call(u);
      };
    }
    hl(t, i, e, l);
  } else i = Ff(n, t, e, l, r);
  return tl(i);
}
$u = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = kn(t.pendingLanes);
        n !== 0 && (ri(t, n | 1), he(t, K()), !(I & 6) && (ln = K() + 500, vt()));
      }
      break;
    case 13:
      Mt(function() {
        var r = Ye(e, 1);
        if (r !== null) {
          var l = ue();
          Re(r, e, 1, l);
        }
      }), Oi(e, 1);
  }
};
li = function(e) {
  if (e.tag === 13) {
    var t = Ye(e, 134217728);
    if (t !== null) {
      var n = ue();
      Re(t, e, 134217728, n);
    }
    Oi(e, 134217728);
  }
};
Uu = function(e) {
  if (e.tag === 13) {
    var t = dt(e), n = Ye(e, t);
    if (n !== null) {
      var r = ue();
      Re(n, e, t, r);
    }
    Oi(e, t);
  }
};
Au = function() {
  return D;
};
Vu = function(e, t) {
  var n = D;
  try {
    return D = e, t();
  } finally {
    D = n;
  }
};
co = function(e, t, n) {
  switch (t) {
    case "input":
      if (ro(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = ul(r);
            if (!l) throw Error(y(90));
            xu(r), ro(r, l);
          }
        }
      }
      break;
    case "textarea":
      wu(e, n);
      break;
    case "select":
      t = n.value, t != null && Qt(e, !!n.multiple, t, !1);
  }
};
zu = Ti;
_u = Mt;
var $f = { usingClientEntryPoint: !1, Events: [Zn, Ut, ul, Cu, Nu, Ti] }, xn = { findFiberByHostInstance: kt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Uf = { bundleType: xn.bundleType, version: xn.version, rendererPackageName: xn.rendererPackageName, rendererConfig: xn.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: Ge.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Tu(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: xn.findFiberByHostInstance || Of, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var xr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!xr.isDisabled && xr.supportsFiber) try {
    ll = xr.inject(Uf), Ue = xr;
  } catch {
  }
}
we.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = $f;
we.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!$i(t)) throw Error(y(200));
  return Df(e, t, null, n);
};
we.createRoot = function(e, t) {
  if (!$i(e)) throw Error(y(299));
  var n = !1, r = "", l = sd;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (l = t.onRecoverableError)), t = Di(e, 1, !1, null, null, n, !1, r, l), e[Ke] = t.current, An(e.nodeType === 8 ? e.parentNode : e), new Fi(t);
};
we.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(y(188)) : (e = Object.keys(e).join(","), Error(y(268, e)));
  return e = Tu(t), e = e === null ? null : e.stateNode, e;
};
we.flushSync = function(e) {
  return Mt(e);
};
we.hydrate = function(e, t, n) {
  if (!gl(t)) throw Error(y(200));
  return xl(null, e, t, !0, n);
};
we.hydrateRoot = function(e, t, n) {
  if (!$i(e)) throw Error(y(405));
  var r = n != null && n.hydratedSources || null, l = !1, o = "", i = sd;
  if (n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (i = n.onRecoverableError)), t = ud(t, null, e, 1, n ?? null, l, !1, o, i), e[Ke] = t.current, An(e), r) for (e = 0; e < r.length; e++) n = r[e], l = n._getVersion, l = l(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, l] : t.mutableSourceEagerHydrationData.push(
    n,
    l
  );
  return new vl(t);
};
we.render = function(e, t, n) {
  if (!gl(t)) throw Error(y(200));
  return xl(null, e, t, !1, n);
};
we.unmountComponentAtNode = function(e) {
  if (!gl(e)) throw Error(y(40));
  return e._reactRootContainer ? (Mt(function() {
    xl(null, null, e, !1, function() {
      e._reactRootContainer = null, e[Ke] = null;
    });
  }), !0) : !1;
};
we.unstable_batchedUpdates = Ti;
we.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!gl(n)) throw Error(y(200));
  if (e == null || e._reactInternals === void 0) throw Error(y(38));
  return xl(e, t, n, !1, r);
};
we.version = "18.3.1-next-f1338f8080-20240426";
function dd() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(dd);
    } catch (e) {
      console.error(e);
    }
}
dd(), du.exports = we;
var Af = du.exports, Vf, Ya = Af;
Vf = Ya.createRoot, Ya.hydrateRoot;
const dp = ':root{--td-bg: var(--theme-canvas, #1e1f22);--td-surface: var(--theme-surface, #25262a);--td-surface-hi: var(--theme-surface-hi, #2d2f34);--td-elevated: var(--theme-panel-elevated-bg, var(--td-surface-hi));--td-ink: var(--theme-ink, #e8e8ea);--td-dim: var(--theme-ink-dim, #b4b6bc);--td-muted: var(--theme-muted, #8a8d94);--td-border: var(--theme-border, #34363c);--td-border-hi: var(--theme-border-hi, #45484f);--td-accent: var(--theme-accent, #e44332);--td-accent-fg: var(--theme-accent-fg, #ffffff);--td-accent-soft: var(--theme-accent-soft, color-mix(in srgb, var(--td-accent) 16%, transparent));--td-hover: var(--theme-row-hover-bg, color-mix(in srgb, var(--td-ink) 5.5%, transparent));--td-selected: var(--theme-row-selected-bg, color-mix(in srgb, var(--td-accent) 13%, transparent));--td-danger: var(--theme-danger, #e5534b);--td-focus: var(--theme-focus-ring, var(--td-accent));--td-input-bg: var(--theme-input-bg, var(--td-surface));--td-input-border: var(--theme-input-border, var(--td-border));--td-font: var(--theme-app-font, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif);--td-mono: var(--theme-font-code, ui-monospace, "SF Mono", Menlo, monospace);--td-brand: #e44332;--td-radius: 8px;--td-shadow: 0 10px 30px -8px rgb(0 0 0 / .45), 0 2px 6px rgb(0 0 0 / .18);--tone-overdue: #e5534b;--tone-today: #2fa84f;--tone-tomorrow: #d9822b;--tone-week: #9d6cf0;--tone-future: var(--td-dim)}*{box-sizing:border-box}html,body{margin:0;height:100%}body{background:var(--td-bg);color:var(--td-ink);font-family:var(--td-font);font-size:13px;line-height:1.45;-webkit-font-smoothing:antialiased}button,input,textarea,select{font:inherit;color:inherit}button{cursor:pointer}button:disabled{cursor:default;opacity:.55}:focus-visible{outline:2px solid var(--td-focus);outline-offset:1px;border-radius:6px}code{font-family:var(--td-mono);font-size:.92em;background:var(--td-surface-hi);border-radius:4px;padding:.05em .35em}kbd{font-family:var(--td-mono);font-size:10.5px;min-width:18px;display:inline-flex;justify-content:center;padding:1px 5px;border-radius:4px;border:1px solid var(--td-border-hi);border-bottom-width:2px;color:var(--td-dim);background:var(--td-surface)}.td-root{height:100vh;display:flex;flex-direction:column;overflow:hidden;position:relative}.td-dim{color:var(--td-muted)}.td-small{font-size:11.5px}.td-warn{color:var(--td-danger);background:color-mix(in srgb,var(--td-danger) 10%,transparent);border:1px solid color-mix(in srgb,var(--td-danger) 30%,transparent);padding:8px 10px;border-radius:var(--td-radius);margin:10px 0 0;font-size:12.5px;white-space:pre-wrap}.td-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 12px;border-radius:6px;border:1px solid var(--td-border-hi);background:var(--td-surface);font-weight:500;font-size:12.5px;white-space:nowrap;transition:background .12s,border-color .12s,color .12s}.td-btn:hover:not(:disabled){background:var(--td-surface-hi)}.td-btn-primary{background:var(--td-accent);border-color:transparent;color:var(--td-accent-fg)}.td-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--td-accent) 86%,black)}.td-btn-danger{background:var(--td-danger);border-color:transparent;color:#fff}.td-btn-ghost{background:transparent;border-color:transparent;color:var(--td-dim)}.td-btn-ghost:hover:not(:disabled){background:var(--td-hover);color:var(--td-ink)}.td-btn-lg{height:36px;padding:0 18px;font-size:13.5px;border-radius:8px}.td-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;border:0;background:transparent;color:var(--td-muted);flex:none;transition:background .12s,color .12s}.td-icon-btn:hover{background:var(--td-hover);color:var(--td-ink)}.td-icon-btn.sm{width:22px;height:22px;border-radius:5px}.td-icon-btn.danger:hover{color:var(--td-danger)}.td-icon-btn.is-spinning svg{animation:td-spin .9s linear infinite}.td-spinner{width:13px;height:13px;border-radius:50%;display:inline-block;flex:none;border:2px solid color-mix(in srgb,currentColor 25%,transparent);border-top-color:currentColor;animation:td-spin .7s linear infinite;vertical-align:-2px}@keyframes td-spin{to{transform:rotate(360deg)}}.td-dot{width:9px;height:9px;border-radius:50%;display:inline-block;flex:none}.td-dot.sm{width:7px;height:7px}.td-dot.lg{width:11px;height:11px}.td-skel{display:block;height:11px;border-radius:5px;background:linear-gradient(90deg,var(--td-surface-hi),color-mix(in srgb,var(--td-surface-hi) 60%,var(--td-border-hi)),var(--td-surface-hi));background-size:200% 100%;animation:td-shimmer 1.3s ease-in-out infinite}.td-skel.sm{height:8px;margin-top:7px;opacity:.7}@keyframes td-shimmer{0%{background-position:100% 0}to{background-position:-100% 0}}.td-layout{flex:1;display:flex;min-height:0;position:relative}.td-sidebar{width:236px;flex:none;overflow-y:auto;padding:10px 8px 0;background:var(--td-surface);border-right:1px solid var(--td-border);display:flex;flex-direction:column;gap:6px}.is-narrow .td-sidebar{position:absolute;z-index:30;top:0;bottom:0;left:0;width:min(260px,86vw);box-shadow:var(--td-shadow);animation:td-slide-in .16s ease-out}@keyframes td-slide-in{0%{transform:translate(-12px);opacity:.4}}.td-scrim{position:absolute;inset:0;z-index:25;background:#00000059;animation:td-fade .15s}@keyframes td-fade{0%{opacity:0}}.td-nav-group{display:flex;flex-direction:column;gap:1px}.td-nav-item{display:flex;align-items:center;gap:9px;width:100%;min-height:30px;padding:4px 8px;border:0;border-radius:6px;background:transparent;text-align:left;color:var(--td-ink)}.td-nav-item:hover{background:var(--td-hover)}.td-nav-item.is-active{background:var(--td-selected);color:var(--td-ink);font-weight:600}.td-nav-item kbd{margin-left:auto}.td-nav-icon{width:18px;display:inline-flex;justify-content:center;color:var(--td-muted);flex:none}.td-nav-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-nav-count{font-size:11px;color:var(--td-muted);font-variant-numeric:tabular-nums}.td-nav-heading{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding:0 2px 2px 4px}.td-nav-heading-btn{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:2px 4px;border-radius:5px;font-size:11.5px;font-weight:600;color:var(--td-muted);letter-spacing:.01em}.td-nav-heading-btn:hover{color:var(--td-ink);background:var(--td-hover)}.td-nav-heading-btn svg{transition:transform .15s}.td-nav-heading-btn svg.is-collapsed{transform:rotate(-90deg)}.td-nav-heading .td-icon-btn{opacity:0}.td-nav-group:hover .td-nav-heading .td-icon-btn,.td-nav-heading .td-icon-btn:focus-visible{opacity:1}.td-nav-empty{color:var(--td-muted);font-size:12px;padding:4px 10px 4px 35px}.td-nav-add{display:flex;flex-direction:column;gap:8px;padding:6px 6px 8px;margin:2px 0;background:var(--td-bg);border:1px solid var(--td-border);border-radius:var(--td-radius)}.td-nav-add input{height:30px;padding:0 8px;border-radius:6px;border:1px solid var(--td-input-border);background:var(--td-input-bg);outline:none}.td-nav-add input:focus{border-color:var(--td-focus)}.td-nav-add-actions{display:flex;justify-content:flex-end;gap:6px}.td-swatches{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}.td-swatch{aspect-ratio:1;border-radius:50%;border:2px solid transparent;padding:0}.td-swatch.is-on{border-color:var(--td-ink);box-shadow:0 0 0 1px var(--td-bg) inset}.td-account{margin-top:auto;display:flex;align-items:center;gap:8px;padding:10px 6px;border-top:1px solid var(--td-border);position:sticky;bottom:0;background:var(--td-surface)}.td-avatar{width:24px;height:24px;border-radius:50%;background:var(--td-accent);color:var(--td-accent-fg);display:grid;place-items:center;font-weight:700;font-size:11px;flex:none}.td-account-text{flex:1;min-width:0;display:flex;flex-direction:column;font-size:12px}.td-account-text>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-main{flex:1;min-width:0;display:flex;flex-direction:column}.td-header{display:flex;align-items:center;gap:8px;padding:10px 14px 6px 10px;min-height:48px}.td-title{flex:1;min-width:0;display:flex;align-items:center;gap:8px}.td-title h1{margin:0;font-size:18px;font-weight:700;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-title-count{color:var(--td-muted);font-size:12.5px;font-variant-numeric:tabular-nums}.td-header-tools{display:flex;gap:2px;margin-left:auto}.td-search{flex:1;display:flex;align-items:center;gap:8px;height:32px;padding:0 6px 0 10px;border-radius:8px;border:1px solid var(--td-focus);background:var(--td-input-bg);color:var(--td-muted)}.td-search input{flex:1;border:0;outline:none;background:transparent;color:var(--td-ink);font-size:14px}.td-add-row{padding:2px 14px 8px}.td-quickadd-field{display:flex;align-items:center;gap:8px;height:38px;padding:0 5px 0 10px;border:1px solid var(--td-input-border);border-radius:9px;background:var(--td-input-bg);transition:border-color .12s,box-shadow .12s}.td-quickadd-field:focus-within{border-color:var(--td-focus);box-shadow:0 0 0 3px color-mix(in srgb,var(--td-focus) 18%,transparent)}.td-quickadd-plus{color:var(--td-accent);display:inline-flex}.td-quickadd-stack{position:relative;flex:1;min-width:0;height:100%}.td-quickadd-mirror,.td-quickadd-input{position:absolute;inset:0;padding:0;margin:0;border:0;font:inherit;font-size:13.5px;line-height:36px;letter-spacing:normal;white-space:pre}.td-quickadd-mirror{overflow:hidden;color:var(--td-ink);pointer-events:none}.td-quickadd-input{width:100%;background:transparent;color:transparent;caret-color:var(--td-ink);outline:none}.td-quickadd-input::placeholder{color:var(--td-muted)}.td-quickadd-input::selection{background:color-mix(in srgb,var(--td-accent) 30%,transparent);color:transparent}.td-quickadd-submit{height:28px;padding:0 14px}.td-quickadd-hint{display:flex;gap:12px;justify-content:space-between;padding:5px 4px 0;font-size:11.5px;color:var(--td-dim)}.td-quickadd-hint b{color:var(--td-ink);font-weight:600}.tok-priority,.tok-project,.tok-label,.tok-section,.tok-assignee,.tok-deadline,.tok-date{border-radius:4px;box-decoration-break:clone}.tok-date{background:color-mix(in srgb,var(--tone-today) 20%,transparent);color:color-mix(in srgb,var(--tone-today) 70%,var(--td-ink))}.tok-priority{background:color-mix(in srgb,#d1453b 22%,transparent);color:color-mix(in srgb,#d1453b 70%,var(--td-ink))}.tok-project,.tok-section{background:color-mix(in srgb,#246fe0 22%,transparent);color:color-mix(in srgb,#4b8cf0 75%,var(--td-ink))}.tok-label{background:color-mix(in srgb,var(--tone-week) 22%,transparent);color:color-mix(in srgb,var(--tone-week) 70%,var(--td-ink))}.tok-assignee,.tok-deadline{background:color-mix(in srgb,var(--tone-tomorrow) 22%,transparent);color:color-mix(in srgb,var(--tone-tomorrow) 70%,var(--td-ink))}.td-list{flex:1;overflow-y:auto;padding:0 6px 60px;scroll-padding:40px}.td-group{margin-bottom:10px}.td-group-title{position:sticky;top:0;z-index:2;display:flex;align-items:baseline;gap:8px;margin:0;padding:12px 10px 6px;font-size:12.5px;font-weight:700;background:linear-gradient(var(--td-bg) 78%,transparent);border-bottom:1px solid var(--td-border)}.td-group-title.tone-overdue{color:var(--tone-overdue)}.td-group-sub{font-weight:500;color:var(--td-muted);font-size:11.5px}.td-group-count{margin-left:auto;font-weight:500;color:var(--td-muted);font-size:11px;font-variant-numeric:tabular-nums}.td-task{position:relative;display:flex;align-items:flex-start;gap:10px;padding:8px 10px 8px 12px;border-radius:8px;cursor:default;border-bottom:1px solid color-mix(in srgb,var(--td-border) 55%,transparent);transition:background .1s,opacity .35s,transform .35s}.td-task:hover{background:var(--td-hover)}.td-task.is-focused{background:var(--td-selected);box-shadow:inset 2px 0 0 var(--td-accent)}.td-task.is-completing{opacity:.35;transform:translate(6px)}.td-task.is-done .td-task-title{color:var(--td-muted);text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--td-muted) 60%,transparent)}.td-task.is-skeleton{pointer-events:none}.td-task-main{flex:1;min-width:0;padding-top:1px}.td-task-title{font-size:13.5px;line-height:1.4;overflow-wrap:anywhere}.td-task-title strong{font-weight:650}.td-task-desc{color:var(--td-muted);font-size:12px;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-task-meta{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:3px}.td-task-meta:empty{display:none}.td-chip{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--td-muted);white-space:nowrap}.td-chip svg{flex:none}.td-project-chip{margin-left:auto}.td-due.tone-overdue,.tone-overdue.td-prop-value{color:var(--tone-overdue)}.td-due.tone-today,.tone-today.td-prop-value{color:var(--tone-today)}.td-due.tone-tomorrow,.tone-tomorrow.td-prop-value{color:var(--tone-tomorrow)}.td-due.tone-week,.tone-week.td-prop-value{color:var(--tone-week)}.td-deadline{color:var(--td-dim)}.td-label{opacity:.92}.td-task-actions{display:flex;gap:0;opacity:0;transition:opacity .12s;margin:-3px -4px 0 0}.td-task:hover .td-task-actions,.td-task.is-focused .td-task-actions,.td-task-actions:focus-within{opacity:1}.td-checkbox{--prio: var(--td-muted);position:relative;flex:none;width:18px;height:18px;margin-top:1px;padding:0;border-radius:50%;border:1.6px solid var(--prio);background:transparent;display:grid;place-items:center;transition:background .12s}.td-checkbox.p4,.td-checkbox.p3,.td-checkbox.p2{background:color-mix(in srgb,var(--prio) 12%,transparent);border-width:2px}.td-checkbox svg{width:12px;height:12px;fill:none;stroke:var(--prio);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;opacity:0;transition:opacity .12s}.td-checkbox:hover svg{opacity:.85}.td-task.is-done .td-checkbox,.td-checkbox.is-checked,.td-task.is-completing .td-checkbox{background:var(--prio);border-color:var(--prio)}.td-task.is-done .td-checkbox svg,.td-checkbox.is-checked svg,.td-task.is-completing .td-checkbox svg{opacity:1;stroke:#fff}.td-checkbox.p1{--prio: var(--td-muted)}.td-task.is-done .td-checkbox.p1,.td-checkbox.p1.is-checked{background:var(--td-muted)}.td-checkbox.lg{width:22px;height:22px;margin-top:3px}.td-checkbox.lg svg{width:14px;height:14px}.td-checkbox.sm{width:15px;height:15px}.td-checkbox.sm svg{width:10px;height:10px}.td-task.is-skeleton .td-checkbox{border-color:var(--td-border-hi)}.td-link{color:var(--td-accent);text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--td-accent) 40%,transparent);cursor:pointer}.td-link:hover{border-bottom-color:var(--td-accent)}.td-more{display:flex;justify-content:center;padding:14px}.td-add-section{display:flex;align-items:center;gap:8px;width:calc(100% - 20px);margin:12px 10px;padding:6px 0;border:0;background:transparent;color:var(--td-muted);font-size:12.5px;font-weight:600;position:relative}.td-add-section:before,.td-add-section:after{content:"";height:1px;flex:1;background:transparent}.td-add-section:hover{color:var(--td-accent)}.td-add-section:hover:before,.td-add-section:hover:after{background:var(--td-accent)}.td-section-add{display:flex;gap:6px;padding:10px}.td-section-add input{flex:1;height:28px;padding:0 8px;border-radius:6px;border:1px solid var(--td-focus);background:var(--td-input-bg);outline:none;font-weight:600}.td-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;padding:48px 20px;color:var(--td-dim)}.td-empty p{margin:0}.td-empty-title{color:var(--td-ink);font-weight:650;font-size:14px}.td-empty-art{margin-bottom:8px}.td-drawer{width:min(440px,48%);flex:none;display:flex;flex-direction:column;min-height:0;background:var(--td-surface);border-left:1px solid var(--td-border);animation:td-drawer-in .16s ease-out}@keyframes td-drawer-in{0%{transform:translate(10px);opacity:.5}}@media (max-width: 819px){.td-drawer{position:absolute;z-index:30;right:0;top:0;bottom:0;width:min(460px,100%);box-shadow:var(--td-shadow)}}.td-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 8px 8px 12px;border-bottom:1px solid var(--td-border);min-height:46px}.td-drawer-tools{display:flex;gap:2px}.td-crumb{display:inline-flex;align-items:center;gap:6px;min-width:0;border:0;background:transparent;padding:4px 8px;border-radius:6px;font-size:12.5px;color:var(--td-dim)}.td-crumb span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-crumb:hover{background:var(--td-hover);color:var(--td-ink)}.td-crumb-move{opacity:0}.td-crumb:hover .td-crumb-move{opacity:.8}.td-drawer-body{flex:1;overflow-y:auto;padding:14px 16px 40px}.td-parent-link{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;padding:0;margin-bottom:8px;color:var(--td-muted);font-size:12px}.td-parent-link:hover{color:var(--td-accent)}.td-drawer-title-row{display:flex;gap:12px;align-items:flex-start}.td-drawer-title{font-size:17px;font-weight:650;line-height:1.35;flex:1;cursor:text;border-radius:6px;padding:1px 4px;margin:0 0 0 -4px;overflow-wrap:anywhere}.td-drawer-title:hover{background:var(--td-hover)}.td-drawer-title.is-done{text-decoration:line-through;color:var(--td-muted)}.td-edit-title,.td-edit-desc{flex:1;width:100%;resize:vertical;border:1px solid var(--td-focus);border-radius:7px;background:var(--td-input-bg);padding:6px 8px;outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--td-focus) 16%,transparent)}.td-edit-title{font-size:16px;font-weight:650}.td-edit-desc-wrap{margin:10px 0 0 34px}.td-edit-desc{min-height:110px;font-size:13px}.td-edit-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:6px}.td-edit-actions .td-dim{margin-right:auto;font-size:11.5px}.td-desc{margin:8px 0 0 34px;padding:2px 4px;border-radius:6px;color:var(--td-dim);cursor:text}.td-desc:hover{background:var(--td-hover)}.td-add-desc{display:block;margin:8px 0 0 30px;border:0;background:transparent;color:var(--td-muted);padding:2px 4px;font-size:13px}.td-add-desc:hover{color:var(--td-ink)}.td-props{display:grid;grid-template-columns:96px 1fr;align-items:center;gap:6px 10px;margin:18px 0 6px;padding:12px;border-radius:10px;background:var(--td-bg);border:1px solid var(--td-border)}.td-prop-label{display:inline-flex;align-items:center;gap:7px;color:var(--td-muted);font-size:12px}.td-prop-value{justify-self:start;display:inline-flex;align-items:center;gap:6px;min-height:26px;padding:2px 8px;margin-left:-8px;border:0;border-radius:6px;background:transparent;text-align:left;font-size:12.5px}.td-prop-value:hover{background:var(--td-hover)}.td-prop-sub{margin-left:4px;font-size:11.5px}.td-prop-value-wrap{display:flex;align-items:center;gap:4px}.td-date-input,.td-select{height:26px;padding:0 6px;margin-left:-6px;border-radius:6px;border:1px solid transparent;background:transparent;font-size:12.5px}.td-date-input.is-empty{color:var(--td-muted)}.td-date-input:hover,.td-select:hover{border-color:var(--td-border-hi)}.td-select{justify-self:start}.td-prop-labels{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.td-label-pill{--label: var(--td-muted);display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 3px 0 8px;border-radius:11px;font-size:11.5px;color:var(--label);background:color-mix(in srgb,var(--label) 14%,transparent)}.td-label-pill button{border:0;background:transparent;color:inherit;display:inline-flex;padding:3px;border-radius:50%;opacity:.7}.td-label-pill button:hover{opacity:1;background:color-mix(in srgb,var(--label) 20%,transparent)}.td-section-block{margin-top:20px}.td-section-block h3{display:flex;align-items:center;gap:6px;margin:0 0 6px;font-size:12.5px;font-weight:700;color:var(--td-dim)}.td-count{color:var(--td-muted);font-weight:500}.td-subtask{display:flex;align-items:center;gap:9px;padding:5px 2px;border-bottom:1px solid color-mix(in srgb,var(--td-border) 55%,transparent)}.td-subtask-title{flex:1;min-width:0;text-align:left;border:0;background:transparent;padding:0;font-size:13px;overflow-wrap:anywhere}.td-subtask-title:hover{color:var(--td-accent)}.td-inline-add{display:flex;align-items:center;gap:9px;padding:6px 2px;color:var(--td-muted)}.td-inline-add input{flex:1;border:0;outline:none;background:transparent;font-size:13px}.td-inline-add:focus-within{color:var(--td-accent)}.td-comment{padding:9px 11px;border-radius:9px;background:var(--td-bg);border:1px solid var(--td-border);margin-bottom:6px}.td-comment-meta{font-size:11px;color:var(--td-muted);margin-bottom:2px}.td-attachment{border:1px solid var(--td-border-hi);background:var(--td-surface);border-radius:6px;padding:3px 8px;font-size:12px;margin-top:4px}.td-comment-form{display:flex;flex-direction:column;gap:6px;margin-top:8px}.td-comment-form textarea{resize:vertical;min-height:54px;padding:8px 10px;border-radius:9px;border:1px solid var(--td-input-border);background:var(--td-input-bg);outline:none;font-size:13px}.td-comment-form textarea:focus{border-color:var(--td-focus)}.td-comment-form .td-btn{align-self:flex-end}.td-confirm{display:flex;flex-direction:column;gap:8px;padding:10px 14px;background:color-mix(in srgb,var(--td-danger) 10%,var(--td-surface));border-bottom:1px solid color-mix(in srgb,var(--td-danger) 30%,transparent);font-size:12.5px}.td-confirm>div{display:flex;justify-content:flex-end;gap:6px}.td-md p,.td-md ul,.td-md ol,.td-md blockquote,.td-md-pre{margin:0 0 6px}.td-md p:last-child{margin-bottom:0}.td-md ul,.td-md ol{padding-left:18px}.td-md blockquote{border-left:3px solid var(--td-border-hi);padding-left:8px;color:var(--td-muted)}.td-md-pre{background:var(--td-surface-hi);padding:8px;border-radius:6px;overflow-x:auto;font-family:var(--td-mono);font-size:12px}.td-md-pre code{background:none;padding:0}.td-popover{position:fixed;z-index:100;display:flex;flex-direction:column;overflow:hidden;background:var(--td-elevated);border:1px solid var(--td-border-hi);border-radius:10px;box-shadow:var(--td-shadow);animation:td-pop .12s ease-out}@keyframes td-pop{0%{opacity:0;transform:translateY(-3px) scale(.985)}}.td-popover-input{flex:none;height:36px;padding:0 12px;border:0;border-bottom:1px solid var(--td-border);background:transparent;outline:none;font-size:13px}.td-menu{overflow-y:auto;padding:4px;display:flex;flex-direction:column;gap:1px}.td-menu-item{display:flex;align-items:center;gap:9px;width:100%;min-height:30px;padding:4px 10px;border:0;border-radius:6px;background:transparent;text-align:left}.td-menu-item.is-active{background:var(--td-hover)}.td-menu-item.is-section{font-size:12.5px}.td-menu-icon{width:18px;display:inline-flex;justify-content:center;color:var(--td-muted);flex:none}.td-due-icon-today{color:var(--tone-today)}.td-due-icon-tomorrow{color:var(--tone-tomorrow)}.td-due-icon-weekend{color:#246fe0}.td-due-icon-week{color:var(--tone-week)}.td-menu-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-menu-hint{color:var(--td-muted);font-size:11.5px}.td-menu-empty{padding:10px;color:var(--td-muted);font-size:12px;text-align:center}.td-popover-foot{padding:7px 12px;border-top:1px solid var(--td-border);font-size:11px;color:var(--td-muted)}.td-check{width:14px;height:14px;border-radius:4px;border:1.5px solid var(--td-border-hi);flex:none}.td-check.is-on{background:var(--td-accent);border-color:var(--td-accent);box-shadow:inset 0 0 0 2px var(--td-elevated)}.td-section-glyph{width:9px;height:2px;background:var(--td-muted);border-radius:1px}.td-toasts{position:absolute;left:50%;bottom:14px;transform:translate(-50%);z-index:200;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;width:max-content;max-width:calc(100% - 24px)}.td-toast{pointer-events:auto;display:flex;align-items:center;gap:14px;padding:8px 8px 8px 14px;min-height:36px;background:var(--td-ink);color:var(--td-bg);border-radius:9px;box-shadow:var(--td-shadow);font-size:12.5px;animation:td-toast-in .18s ease-out;max-width:100%}.td-toast span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-toast.is-error{background:var(--td-danger);color:#fff}.td-toast button{border:0;background:transparent;color:inherit;font-weight:700;padding:4px 8px;border-radius:6px}.td-toast button:hover{background:color-mix(in srgb,currentColor 14%,transparent)}@keyframes td-toast-in{0%{opacity:0;transform:translateY(6px)}}.td-modal-scrim{position:absolute;inset:0;z-index:150;background:#0006;display:grid;place-items:center;animation:td-fade .12s}.td-help{width:min(380px,calc(100% - 24px));background:var(--td-elevated);border:1px solid var(--td-border-hi);border-radius:12px;box-shadow:var(--td-shadow);padding:6px 16px 14px}.td-help-head{display:flex;align-items:center;justify-content:space-between}.td-help h2{font-size:14px;margin:8px 0}.td-help dl{margin:0}.td-help dl>div{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--td-border)}.td-help dt{display:flex;gap:4px}.td-help dd{margin:0;color:var(--td-dim)}.td-setup{flex:1;display:grid;place-items:center;padding:24px;overflow-y:auto}.td-setup-card{width:min(460px,100%);display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:28px 26px 20px;border-radius:16px;background:var(--td-surface);border:1px solid var(--td-border)}.td-setup-card h1{margin:4px 0 0;font-size:18px;letter-spacing:-.01em}.td-setup-card p{margin:0;color:var(--td-dim)}.td-setup-alt{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:6px}.td-cmd{display:inline-flex;align-items:center;gap:12px;padding:6px 6px 6px 10px;border-radius:8px;border:1px solid var(--td-border-hi);background:var(--td-bg)}.td-cmd code{background:none;padding:0}.td-cmd .td-dim{font-size:11px;padding:2px 6px;border-radius:4px;background:var(--td-surface-hi)}.td-check-row{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--td-dim)}.td-progress{display:flex;gap:12px;align-items:flex-start;text-align:left;padding:14px;border-radius:10px;background:var(--td-bg);border:1px solid var(--td-border);width:100%}.td-progress .td-spinner{margin-top:3px;color:var(--td-accent)}.td-progress-actions{display:flex;gap:6px;margin-top:10px}.td-setup-foot{display:flex;gap:6px;margin-top:6px}.td-path-form{display:flex;gap:6px;width:100%}.td-path-form input{flex:1;height:28px;padding:0 8px;border-radius:6px;border:1px solid var(--td-input-border);background:var(--td-input-bg);outline:none;font-family:var(--td-mono);font-size:11.5px}.td-setup-ver{margin-top:6px!important;font-family:var(--td-mono);font-size:10.5px;word-break:break-all}.td-modal-root{height:auto;min-height:0;width:min(620px,100vw);background:var(--td-surface)}.td-modal-root .td-setup{padding:12px}.td-modal-root .td-setup-card{border:0;background:transparent}.td-qa{display:flex;flex-direction:column;gap:10px;padding:16px 16px 12px}.td-qa-field{position:relative}.td-qa-field textarea,.td-qa-mirror{display:block;width:100%;margin:0;padding:4px 2px;border:0;font:inherit;font-size:17px;font-weight:600;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;letter-spacing:normal}.td-qa-mirror{position:relative;pointer-events:none;color:var(--td-ink);min-height:1.45em}.td-qa-field textarea{position:absolute;inset:0;height:100%;resize:none;overflow:hidden;background:transparent;color:transparent;caret-color:var(--td-ink);outline:none}.td-qa-field textarea::placeholder{color:var(--td-muted);font-weight:500}.td-qa-preview{font-size:12px;color:var(--td-dim);margin-top:-4px}.td-qa-chips{display:flex;flex-wrap:wrap;gap:6px}.td-qa-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:7px;border:1px solid var(--td-border-hi);background:transparent;font-size:12.5px;color:var(--td-dim);max-width:240px}.td-qa-chip:hover{background:var(--td-hover);color:var(--td-ink)}.td-qa-chip.is-set{color:var(--td-ink);border-color:color-mix(in srgb,var(--td-accent) 45%,var(--td-border-hi));background:var(--td-accent-soft)}.td-qa-agents{display:flex;flex-direction:column;gap:6px;padding-top:10px;border-top:1px solid var(--td-border)}.td-qa-agents-label{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--td-muted);font-weight:600}.td-qa-agent-list{display:flex;flex-wrap:wrap;gap:6px}.td-agent-chip{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:13px;font-size:12px;border:1px solid var(--td-border-hi);background:var(--td-bg);max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-agent-chip:hover{border-color:var(--td-dim)}.td-agent-chip.is-on{border-color:var(--td-accent);background:var(--td-accent-soft)}.td-agent-dot{width:7px;height:7px;border-radius:50%;background:var(--td-muted);flex:none}.td-agent-dot.is-working{background:var(--tone-today);box-shadow:0 0 0 3px color-mix(in srgb,var(--tone-today) 25%,transparent)}.td-qa-foot{display:flex;align-items:center;gap:8px;padding-top:12px;border-top:1px solid var(--td-border)}.td-qa-project{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 10px;border:0;border-radius:7px;background:transparent;font-size:12.5px;font-weight:600}.td-qa-project:hover{background:var(--td-hover)}.td-qa-hint{margin-left:auto;font-size:11.5px;color:var(--td-muted);display:inline-flex;align-items:center;gap:4px}@media (max-width: 480px){.td-qa-hint{display:none}}@media (max-width: 520px){.td-header{padding:8px 8px 4px 6px}.td-add-row{padding:2px 8px 6px}.td-list{padding:0 2px 60px}.td-project-chip{margin-left:0}.td-props{grid-template-columns:84px 1fr}}@media (prefers-reduced-motion: reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}';
function cp(e) {
  const t = e;
  return {
    context: t,
    async call(n, r) {
      const l = r === void 0 ? void 0 : JSON.parse(JSON.stringify(r));
      return await t.runtime.request(n, l);
    }
  };
}
const Hf = R.createContext(null);
function bf() {
  const e = R.useContext(Hf);
  if (!e) throw new Error("Bridge missing");
  return e;
}
function fp(e) {
  const [t, n] = R.useState(() => e.context.runtime.state());
  return R.useEffect(() => (n(e.context.runtime.state()), e.context.runtime.subscribe((r) => n(r))), [e]), t;
}
function pp() {
  const [e, t] = R.useState(() => /* @__PURE__ */ new Date());
  return R.useEffect(() => {
    const n = setInterval(() => t(/* @__PURE__ */ new Date()), 6e4);
    return () => clearInterval(n);
  }, []), e;
}
function mp(e, t, n) {
  const [r, l] = R.useState(n), [o, i] = R.useState(!1);
  return R.useEffect(() => {
    let u = !0;
    return e.context.api.storage.get(t).then((d) => {
      u && (d != null && l(d), i(!0));
    }, () => i(!0)), () => {
      u = !1;
    };
  }, [e, t]), [r, (u) => {
    l(u), e.context.api.storage.set(t, u).catch(() => {
    });
  }, o];
}
const Xa = "agent-code-todoist-styles";
function hp(e) {
  if (document.getElementById(Xa)) return;
  const t = document.createElement("style");
  t.id = Xa, t.textContent = e, document.head.append(t);
}
function vp() {
  const e = document.documentElement, t = () => {
    const r = document.createElement("div");
    r.style.color = getComputedStyle(e).getPropertyValue("--theme-canvas").trim() || "#1e1f22", document.body.append(r);
    const l = getComputedStyle(r).color.match(/[\d.]+/g)?.map(Number) ?? [30, 31, 34];
    r.remove();
    const i = (0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]) / 255 > 0.5 ? "light" : "dark";
    e.style.colorScheme !== i && (e.style.colorScheme = i);
  };
  t();
  const n = new MutationObserver(t);
  return n.observe(e, { attributes: !0, attributeFilter: ["style"] }), () => n.disconnect();
}
const Bo = {
  berry_red: "#b8255f",
  red: "#db4035",
  orange: "#ff9933",
  yellow: "#fad000",
  olive_green: "#afb83b",
  lime_green: "#7ecc49",
  green: "#299438",
  mint_green: "#6accbc",
  teal: "#158fad",
  sky_blue: "#14aaf5",
  light_blue: "#96c3eb",
  blue: "#4073ff",
  grape: "#884dff",
  violet: "#af38eb",
  lavender: "#eb96eb",
  magenta: "#e05194",
  salmon: "#ff8d85",
  charcoal: "#808080",
  grey: "#b8b8b8",
  taupe: "#ccac93"
}, gp = Object.keys(Bo);
function cd(e) {
  return e && Bo[e] || Bo.charcoal;
}
const Bf = {
  4: "#d1453b",
  3: "#eb8909",
  2: "#246fe0",
  1: "var(--td-muted)"
};
function Wf(e) {
  return `p${5 - Math.min(4, Math.max(1, e))}`;
}
const nl = "(?:mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:rs(?:day)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)", Ga = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)", Gl = "(?:(?:at\\s+)?\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)|at\\s+\\d{1,2}(?::\\d{2})?|(?:at\\s+)?(?:noon|midnight))", Qf = `(?:today|tod|tonight|tomorrow|tom|yesterday|next\\s+(?:week|month|year|${nl})|this\\s+(?:weekend|week)|${nl}|in\\s+\\d+\\s+(?:days?|weeks?|months?)|${Ga}\\s+\\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}(?:st|nd|rd|th)?\\s+${Ga}|\\d{4}-\\d{2}-\\d{2})`, Kf = `(?:every\\s+(?:other\\s+)?(?:day|weekday|workday|week|month|year|morning|evening|${nl}(?:\\s*(?:,|and)\\s*${nl})*|\\d+\\s+(?:days?|weeks?|months?|years?)))`, Yf = `(?:${Kf}(?:\\s+${Gl})?|${Qf}(?:\\s+${Gl})?|${Gl})`, yr = new RegExp(
  [
    "(?<priority>\\bp[1-4]\\b)",
    // # and @ only start a token at a word boundary of whitespace: otherwise
    // "jane@example.com" became a label and "page#section" a project.
    '(?<project>(?<=\\s|^)#(?:"[^"]+"|[^\\s#@/+{]+))',
    '(?<label>(?<=\\s|^)@(?:"[^"]+"|[^\\s#@/+{]+))',
    '(?<section>(?<=\\s|^)/(?:"[^"]+"|[^\\s#@/+{]+))',
    "(?<assignee>(?<=\\s|^)\\+[^\\s#@/+{]+)",
    "(?<deadline>\\{[^}]+\\})",
    // Trailing punctuation counts as a boundary only when the sentence ends
    // there ("call mom tomorrow."), not inside a word like "Monday.com".
    `(?<date>(?<=\\s|^)${Yf}(?=\\s|$|[.,;!?](?:\\s|$)))`
  ].join("|"),
  "gi"
);
function Xf(e) {
  const t = [];
  let n = 0;
  yr.lastIndex = 0;
  for (let r = yr.exec(e); r; r = yr.exec(e)) {
    if (r[0].length === 0) {
      yr.lastIndex++;
      continue;
    }
    const l = r.groups ?? {}, o = Object.keys(l).find((i) => l[i] !== void 0) ?? "text";
    r.index > n && t.push({ kind: "text", text: e.slice(n, r.index), start: n, end: r.index }), t.push({ kind: o, text: r[0], start: r.index, end: r.index + r[0].length }), n = r.index + r[0].length;
  }
  return n < e.length && t.push({ kind: "text", text: e.slice(n), start: n, end: e.length }), t;
}
function xp(e) {
  return Xf(e).filter((t) => t.kind === "text").map((t) => t.text).join("").replace(/\s+/g, " ").trim();
}
function F({ size: e = 16, children: t, ...n }) {
  return /* @__PURE__ */ f.jsx("svg", { width: e, height: e, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", ...n, children: t });
}
const Gf = ({ day: e, ...t }) => /* @__PURE__ */ f.jsxs(F, { ...t, children: [
  /* @__PURE__ */ f.jsx("rect", { x: "2.5", y: "3", width: "11", height: "10.5", rx: "2" }),
  /* @__PURE__ */ f.jsx("path", { d: "M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4" }),
  /* @__PURE__ */ f.jsx("text", { x: "8", y: "12", textAnchor: "middle", fontSize: "5.4", fontWeight: "700", fill: "currentColor", stroke: "none", fontFamily: "system-ui, sans-serif", children: e ?? (/* @__PURE__ */ new Date()).getDate() })
] }), qf = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("rect", { x: "2.5", y: "3", width: "11", height: "10.5", rx: "2" }),
  /* @__PURE__ */ f.jsx("path", { d: "M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4M5 8.5h1M7.5 8.5h1M10 8.5h1M5 11h1M7.5 11h1" })
] }), Zf = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("path", { d: "M2.5 9.5 4.2 3.8a1 1 0 0 1 1-.8h5.6a1 1 0 0 1 1 .8l1.7 5.7v2.5a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z" }),
  /* @__PURE__ */ f.jsx("path", { d: "M2.5 9.5h3l.8 1.5h3.4l.8-1.5h3" })
] }), yp = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("circle", { cx: "8", cy: "8", r: "5.6" }),
  /* @__PURE__ */ f.jsx("path", { d: "m5.6 8.1 1.6 1.6 3.3-3.4" })
] }), wp = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("circle", { cx: "7", cy: "7", r: "4.3" }),
  /* @__PURE__ */ f.jsx("path", { d: "m10.2 10.2 3.3 3.3" })
] }), Jf = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("path", { d: "M2.5 3.5v4l6 6 5-5-6-6h-4a1 1 0 0 0-1 1z" }),
  /* @__PURE__ */ f.jsx("circle", { cx: "5.5", cy: "5.5", r: "0.9", fill: "currentColor", stroke: "none" })
] }), kp = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "M2.5 3.5h11l-4.2 5v4l-2.6 1.2V8.5z" }) }), ep = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "M8 3v10M3 8h10" }) }), tp = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "m4 4 8 8M12 4l-8 8" }) }), Sp = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "m4 6 4 4 4-4" }) }), np = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("path", { d: "M13 8a5 5 0 1 1-1.5-3.6" }),
  /* @__PURE__ */ f.jsx("path", { d: "M13 2.8v2.6h-2.6" })
] }), Ep = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "M3.5 14V2.8M3.5 3h8.2l-1.6 3 1.6 3H3.5" }) }), rp = ({ color: e, ...t }) => /* @__PURE__ */ f.jsxs(F, { ...t, stroke: e, children: [
  /* @__PURE__ */ f.jsx("path", { d: "M3.5 14V2.8" }),
  /* @__PURE__ */ f.jsx("path", { d: "M3.5 3h8.2l-1.6 3 1.6 3H3.5z", fill: e })
] }), lp = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("rect", { x: "2.5", y: "3", width: "11", height: "10.5", rx: "2" }),
  /* @__PURE__ */ f.jsx("path", { d: "M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4" })
] }), jp = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("circle", { cx: "8", cy: "8", r: "5.6" }),
  /* @__PURE__ */ f.jsx("path", { d: "M8 5v3.2l2 1.3" })
] }), Cp = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("circle", { cx: "8", cy: "8", r: "5.6" }),
  /* @__PURE__ */ f.jsx("circle", { cx: "8", cy: "8", r: "2.6" }),
  /* @__PURE__ */ f.jsx("circle", { cx: "8", cy: "8", r: ".6", fill: "currentColor" })
] }), Np = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("path", { d: "M3 7a5 5 0 0 1 8.6-2.6L13 5.8M13 2.8v3h-3" }),
  /* @__PURE__ */ f.jsx("path", { d: "M13 9a5 5 0 0 1-8.6 2.6L3 10.2M3 13.2v-3h3" })
] }), zp = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "M3 3.5h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 2.3v-2.3H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" }) }), _p = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.6a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.6" }) }), op = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "M9 3h4v4M13 3 7.5 8.5M11 9.5V13H3V5h3.5" }) }), Pp = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("path", { d: "M4 2.5v6.5a2 2 0 0 0 2 2h6" }),
  /* @__PURE__ */ f.jsx("path", { d: "m10 9 2 2-2 2" })
] }), Mp = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("rect", { x: "2", y: "3", width: "12", height: "10", rx: "1.8" }),
  /* @__PURE__ */ f.jsx("path", { d: "M6 3v10" })
] }), Tp = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "M2.5 8h8M8 5l3 3-3 3M13.5 3v10" }) }), Lp = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("rect", { x: "3", y: "4.5", width: "10", height: "8", rx: "2" }),
  /* @__PURE__ */ f.jsx("path", { d: "M8 2v2.5M6 8.2v.6M10 8.2v.6M6.3 10.8h3.4" })
] }), Ip = (e) => /* @__PURE__ */ f.jsxs(F, { ...e, children: [
  /* @__PURE__ */ f.jsx("rect", { x: "1.8", y: "4", width: "12.4", height: "8", rx: "1.5" }),
  /* @__PURE__ */ f.jsx("path", { d: "M4.5 6.6h.01M7 6.6h.01M9.5 6.6h.01M12 6.6h.01M5 9.5h6" })
] }), Rp = (e) => /* @__PURE__ */ f.jsx(F, { ...e, children: /* @__PURE__ */ f.jsx("path", { d: "M6.5 13.5h-3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3M10.5 11 13.5 8l-3-3M13.5 8h-7" }) }), qa = (e) => /* @__PURE__ */ f.jsxs("svg", { width: e.size ?? 28, height: e.size ?? 28, viewBox: "0 0 32 32", "aria-hidden": "true", children: [
  /* @__PURE__ */ f.jsx("rect", { width: "32", height: "32", rx: "8", fill: "var(--td-brand)" }),
  /* @__PURE__ */ f.jsx("path", { d: "m9.5 16.5 4.5 4.5 8.5-9", fill: "none", stroke: "#fff", strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round" })
] });
function yl({ anchor: e, onClose: t, children: n, width: r = 260, align: l = "start" }) {
  const o = R.useRef(null), [i, a] = R.useState(null);
  return R.useLayoutEffect(() => {
    if (!e) return;
    const u = () => {
      const d = e.getBoundingClientRect(), v = o.current?.offsetHeight ?? 240, h = window.innerWidth, x = window.innerHeight - d.bottom - 8, w = d.top - 8, k = x < Math.min(v, 220) && w > x, _ = Math.max(140, (k ? w : x) - 4), p = k ? Math.max(4, d.top - 4 - Math.min(v, _)) : d.bottom + 4, s = Math.min(r, h - 16), c = l === "end" ? d.right - s : d.left;
      a({ top: p, left: Math.max(8, Math.min(c, h - s - 8)), maxHeight: _ });
    };
    return u(), window.addEventListener("resize", u), () => window.removeEventListener("resize", u);
  }, [e, r, l]), R.useEffect(() => {
    const u = (v) => {
      const h = v.target;
      o.current?.contains(h) || e?.contains(h) || t();
    }, d = (v) => {
      v.key === "Escape" && (v.preventDefault(), v.stopPropagation(), t());
    };
    return document.addEventListener("pointerdown", u, !0), document.addEventListener("keydown", d, !0), () => {
      document.removeEventListener("pointerdown", u, !0), document.removeEventListener("keydown", d, !0);
    };
  }, [e, t]), /* @__PURE__ */ f.jsx(
    "div",
    {
      ref: o,
      className: "td-popover",
      role: "dialog",
      style: { top: i?.top ?? -9999, left: i?.left ?? -9999, width: Math.min(r, window.innerWidth - 16), maxHeight: i?.maxHeight },
      children: n
    }
  );
}
function wl(e, t) {
  const [n, r] = R.useState(0);
  return R.useEffect(() => {
    r((o) => Math.min(o, Math.max(0, e - 1)));
  }, [e]), { active: n, setActive: r, onKeyDown: (o) => {
    o.key === "ArrowDown" ? (o.preventDefault(), r((i) => e ? (i + 1) % e : 0)) : o.key === "ArrowUp" ? (o.preventDefault(), r((i) => e ? (i - 1 + e) % e : 0)) : o.key === "Enter" && (o.preventDefault(), e && t(n));
  } };
}
const ip = [
  { label: "Today", value: "today", hint: Za(0), icon: "today" },
  { label: "Tomorrow", value: "tomorrow", hint: Za(1), icon: "tomorrow" },
  { label: "This weekend", value: "saturday", hint: "Sat", icon: "weekend" },
  { label: "Next week", value: "next monday", hint: "Mon", icon: "week" },
  { label: "No date", value: "", hint: "", icon: "none" }
];
function Za(e) {
  const t = /* @__PURE__ */ new Date();
  return t.setDate(t.getDate() + e), t.toLocaleDateString(void 0, { weekday: "short" });
}
function Dp({ anchor: e, current: t, onPick: n, onClose: r, placeholder: l }) {
  const [o, i] = R.useState(""), a = ip, { active: u, setActive: d, onKeyDown: v } = wl(a.length, (h) => {
    n(a[h].value), r();
  });
  return /* @__PURE__ */ f.jsxs(yl, { anchor: e, onClose: r, width: 250, children: [
    /* @__PURE__ */ f.jsx(
      "form",
      {
        onSubmit: (h) => {
          h.preventDefault(), o.trim() && (n(o.trim()), r());
        },
        children: /* @__PURE__ */ f.jsx(
          "input",
          {
            autoFocus: !0,
            className: "td-popover-input",
            placeholder: l ?? (t ? `Due: ${t}` : 'Type a date — "fri 3pm", "every mon"'),
            value: o,
            onChange: (h) => i(h.target.value),
            onKeyDown: (h) => {
              o || v(h);
            }
          }
        )
      }
    ),
    /* @__PURE__ */ f.jsx("div", { className: "td-menu", role: "menu", children: a.map((h, m) => /* @__PURE__ */ f.jsxs(
      "button",
      {
        type: "button",
        role: "menuitem",
        className: `td-menu-item${m === u ? " is-active" : ""}`,
        onMouseEnter: () => d(m),
        onClick: () => {
          n(h.value), r();
        },
        children: [
          /* @__PURE__ */ f.jsx("span", { className: `td-menu-icon td-due-icon-${h.icon}`, children: h.icon === "today" ? /* @__PURE__ */ f.jsx(Gf, {}) : h.icon === "none" ? /* @__PURE__ */ f.jsx(tp, {}) : h.icon === "week" ? /* @__PURE__ */ f.jsx(qf, {}) : /* @__PURE__ */ f.jsx(lp, {}) }),
          /* @__PURE__ */ f.jsx("span", { className: "td-menu-label", children: h.label }),
          /* @__PURE__ */ f.jsx("span", { className: "td-menu-hint", children: h.hint })
        ]
      },
      h.label
    )) }),
    /* @__PURE__ */ f.jsx("div", { className: "td-popover-foot", children: 'Todoist understands "every weekday 9am", "in 3 days", "Oct 20".' })
  ] });
}
function Op({ anchor: e, current: t, onPick: n, onClose: r }) {
  const l = [4, 3, 2, 1], { active: o, setActive: i } = wl(l.length, () => {
  });
  return /* @__PURE__ */ f.jsx(yl, { anchor: e, onClose: r, width: 190, children: /* @__PURE__ */ f.jsx("div", { className: "td-menu", role: "menu", children: l.map((a, u) => /* @__PURE__ */ f.jsxs(
    "button",
    {
      type: "button",
      role: "menuitemradio",
      "aria-checked": a === t,
      autoFocus: a === t,
      className: `td-menu-item${u === o ? " is-active" : ""}`,
      onMouseEnter: () => i(u),
      onClick: () => {
        n(a), r();
      },
      children: [
        /* @__PURE__ */ f.jsx("span", { className: "td-menu-icon", children: /* @__PURE__ */ f.jsx(rp, { color: a === 1 ? "var(--td-muted)" : Bf[a] }) }),
        /* @__PURE__ */ f.jsxs("span", { className: "td-menu-label", children: [
          "Priority ",
          5 - a
        ] }),
        /* @__PURE__ */ f.jsx("span", { className: "td-menu-hint", children: a === t ? "✓" : Wf(a) })
      ]
    },
    a
  )) }) });
}
function Fp({ anchor: e, labels: t, selected: n, onChange: r, onCreate: l, onClose: o }) {
  const [i, a] = R.useState(""), [u, d] = R.useState(!1), v = i.trim().replace(/^@/, "").toLowerCase(), h = t.filter((c) => !v || c.name.toLowerCase().includes(v)), m = t.some((c) => c.name.toLowerCase() === v), x = !!l && !!v && !m, w = (c) => r(n.includes(c) ? n.filter((g) => g !== c) : [...n, c]), { active: k, setActive: _, onKeyDown: p } = wl(h.length + (x ? 1 : 0), (c) => {
    c < h.length ? w(h[c].name) : s();
  }), s = async () => {
    if (!(!l || !v || u)) {
      d(!0);
      try {
        await l(i.trim().replace(/^@/, "")), r([...n, i.trim().replace(/^@/, "")]), a("");
      } finally {
        d(!1);
      }
    }
  };
  return /* @__PURE__ */ f.jsxs(yl, { anchor: e, onClose: o, width: 250, children: [
    /* @__PURE__ */ f.jsx("input", { autoFocus: !0, className: "td-popover-input", placeholder: "Type a label", value: i, onChange: (c) => a(c.target.value), onKeyDown: p }),
    /* @__PURE__ */ f.jsxs("div", { className: "td-menu", role: "menu", children: [
      h.map((c, g) => /* @__PURE__ */ f.jsxs(
        "button",
        {
          type: "button",
          role: "menuitemcheckbox",
          "aria-checked": n.includes(c.name),
          className: `td-menu-item${g === k ? " is-active" : ""}`,
          onMouseEnter: () => _(g),
          onClick: () => w(c.name),
          children: [
            /* @__PURE__ */ f.jsx("span", { className: "td-menu-icon", style: { color: cd(c.color) }, children: /* @__PURE__ */ f.jsx(Jf, {}) }),
            /* @__PURE__ */ f.jsx("span", { className: "td-menu-label", children: c.name }),
            /* @__PURE__ */ f.jsx("span", { className: `td-check${n.includes(c.name) ? " is-on" : ""}` })
          ]
        },
        c.id
      )),
      x && /* @__PURE__ */ f.jsxs("button", { type: "button", className: `td-menu-item${k === h.length ? " is-active" : ""}`, onClick: () => void s(), disabled: u, children: [
        /* @__PURE__ */ f.jsx("span", { className: "td-menu-icon", children: /* @__PURE__ */ f.jsx(ep, {}) }),
        /* @__PURE__ */ f.jsxs("span", { className: "td-menu-label", children: [
          "Create label “",
          i.trim().replace(/^@/, ""),
          "”"
        ] })
      ] }),
      !h.length && !x && /* @__PURE__ */ f.jsx("div", { className: "td-menu-empty", children: "No labels yet. Type a name to create one." })
    ] })
  ] });
}
function $p({ anchor: e, meta: t, current: n, onPick: r, onClose: l }) {
  const [o, i] = R.useState(""), a = o.trim().replace(/^#/, "").toLowerCase(), u = R.useMemo(() => {
    const m = [];
    for (const { project: x, depth: w } of ap(t.projects)) {
      const k = t.sections.filter((s) => s.projectId === x.id), _ = !a || x.name.toLowerCase().includes(a), p = k.filter((s) => !a || s.name.toLowerCase().includes(a) || _);
      (_ || p.length) && m.push({ key: x.id, target: { projectId: x.id, sectionId: null }, project: x, depth: w });
      for (const s of p)
        m.push({ key: `${x.id}/${s.id}`, target: { projectId: x.id, sectionId: s.id }, project: x, section: s.name, depth: w + 1 });
    }
    return m;
  }, [t, a]), { active: d, setActive: v, onKeyDown: h } = wl(u.length, (m) => {
    r(u[m].target), l();
  });
  return /* @__PURE__ */ f.jsxs(yl, { anchor: e, onClose: l, width: 280, children: [
    /* @__PURE__ */ f.jsx("input", { autoFocus: !0, className: "td-popover-input", placeholder: "Type a project or section", value: o, onChange: (m) => i(m.target.value), onKeyDown: h }),
    /* @__PURE__ */ f.jsxs("div", { className: "td-menu", role: "menu", children: [
      u.map((m, x) => {
        const w = n?.projectId === m.target.projectId && (n?.sectionId ?? null) === m.target.sectionId;
        return /* @__PURE__ */ f.jsxs(
          "button",
          {
            type: "button",
            role: "menuitemradio",
            "aria-checked": w,
            className: `td-menu-item${x === d ? " is-active" : ""}${m.section ? " is-section" : ""}`,
            style: { paddingLeft: 10 + m.depth * 14 },
            onMouseEnter: () => v(x),
            onClick: () => {
              r(m.target), l();
            },
            children: [
              /* @__PURE__ */ f.jsx("span", { className: "td-menu-icon", children: m.section ? /* @__PURE__ */ f.jsx("span", { className: "td-section-glyph" }) : m.project.isInbox ? /* @__PURE__ */ f.jsx(Zf, {}) : /* @__PURE__ */ f.jsx("span", { className: "td-dot", style: { background: cd(m.project.color) } }) }),
              /* @__PURE__ */ f.jsx("span", { className: "td-menu-label", children: m.section ?? m.project.name }),
              /* @__PURE__ */ f.jsx("span", { className: "td-menu-hint", children: w ? "✓" : "" })
            ]
          },
          m.key
        );
      }),
      !u.length && /* @__PURE__ */ f.jsx("div", { className: "td-menu-empty", children: "No matching project." })
    ] })
  ] });
}
function ap(e) {
  const t = /* @__PURE__ */ new Map(), n = new Set(e.map((o) => o.id));
  for (const o of e) {
    const i = o.parentId && n.has(o.parentId) ? o.parentId : null, a = t.get(i) ?? [];
    a.push(o), t.set(i, a);
  }
  const r = [], l = (o, i) => {
    const a = (t.get(o) ?? []).sort((u, d) => Number(d.isInbox) - Number(u.isInbox) || u.order - d.order);
    for (const u of a)
      r.push({ project: u, depth: i }), i < 6 && l(u.id, i + 1);
  };
  return l(null, 0), r;
}
function Up({ setup: e, onRetry: t }) {
  const n = bf(), [r, l] = R.useState(null), [o, i] = R.useState(null), [a, u] = R.useState(!1), [d, v] = R.useState(""), [h, m] = R.useState(!1), [x, w] = R.useState(!1), k = e?.job ?? null, _ = k?.state === "running", p = up(_ ? k.startedAt : null);
  R.useEffect(() => {
    if (!_) return;
    const S = setInterval(() => void n.call("status", {}).catch(() => {
    }), 1500);
    return () => clearInterval(S);
  }, [_, n]);
  const s = async (S, C) => {
    l(S), i(null);
    try {
      await C();
    } catch (N) {
      i(pd(N));
    } finally {
      l(null);
    }
  }, c = async (S) => {
    try {
      await navigator.clipboard.writeText(S), w(!0), setTimeout(() => w(!1), 1500);
    } catch {
    }
  };
  if (!e)
    return /* @__PURE__ */ f.jsx("div", { className: "td-setup", children: /* @__PURE__ */ f.jsxs("div", { className: "td-setup-card", children: [
      /* @__PURE__ */ f.jsx(qa, { size: 40 }),
      /* @__PURE__ */ f.jsx("h1", { children: "Todoist" }),
      /* @__PURE__ */ f.jsxs("p", { className: "td-dim", children: [
        /* @__PURE__ */ f.jsx("span", { className: "td-spinner" }),
        " Looking for the Todoist CLI…"
      ] })
    ] }) });
  const g = k && k.state === "failed" ? k : null;
  return /* @__PURE__ */ f.jsx("div", { className: "td-setup", children: /* @__PURE__ */ f.jsxs("div", { className: "td-setup-card", children: [
    /* @__PURE__ */ f.jsx(qa, { size: 40 }),
    /* @__PURE__ */ f.jsx("h1", { children: e.state === "td-missing" ? "Install the Todoist CLI" : e.state === "signed-out" ? "Sign in to Todoist" : "Todoist is unavailable" }),
    e.state === "td-missing" && !_ && /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
      /* @__PURE__ */ f.jsxs("p", { children: [
        "This extension runs Doist's official command-line app, ",
        /* @__PURE__ */ f.jsx("code", { children: "td" }),
        ", on your Mac. It was not found",
        e.searched.length ? ` (looked in ${e.searched.length} places)` : "",
        "."
      ] }),
      e.brew ? /* @__PURE__ */ f.jsxs("button", { className: "td-btn td-btn-primary td-btn-lg", disabled: !!r, onClick: () => void s("install", () => n.call("install", {})), children: [
        r === "install" ? /* @__PURE__ */ f.jsx("span", { className: "td-spinner" }) : null,
        " Install with Homebrew"
      ] }) : null,
      /* @__PURE__ */ f.jsxs("div", { className: "td-setup-alt", children: [
        /* @__PURE__ */ f.jsx("span", { className: "td-dim", children: e.brew ? "Or in a terminal:" : "Install it in a terminal:" }),
        /* @__PURE__ */ f.jsxs("button", { className: "td-cmd", onClick: () => void c(e.brew ? "brew install todoist-cli" : "npm install -g @doist/todoist-cli"), title: "Copy", children: [
          /* @__PURE__ */ f.jsx("code", { children: e.brew ? "brew install todoist-cli" : "npm install -g @doist/todoist-cli" }),
          /* @__PURE__ */ f.jsx("span", { className: "td-dim", children: x ? "Copied" : "Copy" })
        ] }),
        /* @__PURE__ */ f.jsx("span", { className: "td-dim td-small", children: "Requires Node.js 24 or newer when installed with npm." })
      ] })
    ] }),
    e.state === "td-missing" && _ && k?.kind === "install" && /* @__PURE__ */ f.jsxs("div", { className: "td-progress", children: [
      /* @__PURE__ */ f.jsx("span", { className: "td-spinner" }),
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("b", { children: "Installing todoist-cli with Homebrew…" }),
        /* @__PURE__ */ f.jsxs("div", { className: "td-dim td-small", children: [
          p,
          ". This can take a few minutes the first time."
        ] })
      ] })
    ] }),
    e.state === "signed-out" && !_ && /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
      /* @__PURE__ */ f.jsxs("p", { children: [
        "Sign in once with your Todoist account. Your browser opens Todoist's sign-in page; the token is stored in your macOS Keychain by ",
        /* @__PURE__ */ f.jsx("code", { children: "td" }),
        ", never by this extension."
      ] }),
      e.error && /* @__PURE__ */ f.jsx("p", { className: "td-warn", children: e.error }),
      /* @__PURE__ */ f.jsxs("button", { className: "td-btn td-btn-primary td-btn-lg", disabled: !!r, onClick: () => void s("login", () => n.call("login", { readOnly: a })), children: [
        r === "login" ? /* @__PURE__ */ f.jsx("span", { className: "td-spinner" }) : null,
        " Sign in with Todoist"
      ] }),
      /* @__PURE__ */ f.jsxs("label", { className: "td-check-row", children: [
        /* @__PURE__ */ f.jsx("input", { type: "checkbox", checked: a, onChange: (S) => u(S.target.checked) }),
        "Read-only access (you can view tasks but not change them)"
      ] }),
      /* @__PURE__ */ f.jsxs("p", { className: "td-dim td-small", children: [
        "Already use ",
        /* @__PURE__ */ f.jsx("code", { children: "td" }),
        " in a terminal? Run ",
        /* @__PURE__ */ f.jsx("code", { children: "td auth login" }),
        " there and press Check again."
      ] })
    ] }),
    _ && k?.kind === "login" && /* @__PURE__ */ f.jsxs("div", { className: "td-progress", children: [
      /* @__PURE__ */ f.jsx("span", { className: "td-spinner" }),
      /* @__PURE__ */ f.jsxs("div", { children: [
        /* @__PURE__ */ f.jsx("b", { children: "Waiting for you to approve access in your browser…" }),
        /* @__PURE__ */ f.jsxs("div", { className: "td-dim td-small", children: [
          p,
          ". Come back here when the page says you are signed in."
        ] }),
        k.authorizeUrl && /* @__PURE__ */ f.jsxs("div", { className: "td-progress-actions", children: [
          /* @__PURE__ */ f.jsxs("button", { className: "td-btn", onClick: () => void n.call("openUrl", { url: k.authorizeUrl }), children: [
            /* @__PURE__ */ f.jsx(op, { size: 13 }),
            " Open the page again"
          ] }),
          /* @__PURE__ */ f.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => void s("cancel", () => n.call("cancelJob", {})), children: "Cancel" })
        ] })
      ] })
    ] }),
    e.state === "error" && /* @__PURE__ */ f.jsx("p", { className: "td-warn", children: e.error }),
    g && /* @__PURE__ */ f.jsxs("p", { className: "td-warn", children: [
      g.kind === "login" ? "Sign-in did not finish" : "Installation failed",
      ": ",
      g.detail
    ] }),
    o && /* @__PURE__ */ f.jsx("p", { className: "td-warn", children: o }),
    !_ && /* @__PURE__ */ f.jsxs("div", { className: "td-setup-foot", children: [
      /* @__PURE__ */ f.jsxs("button", { className: "td-btn td-btn-ghost", disabled: !!r, onClick: () => void s("retry", t), children: [
        /* @__PURE__ */ f.jsx(np, { size: 13 }),
        " Check again"
      ] }),
      e.state === "td-missing" && /* @__PURE__ */ f.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => m((S) => !S), children: "Set td path…" })
    ] }),
    h && e.state === "td-missing" && /* @__PURE__ */ f.jsxs(
      "form",
      {
        className: "td-path-form",
        onSubmit: (S) => {
          S.preventDefault(), s("path", () => n.call("setSetting", { key: "todoist.tdPath", value: d.trim() }));
        },
        children: [
          /* @__PURE__ */ f.jsx("input", { value: d, onChange: (S) => v(S.target.value), placeholder: "/Users/you/.nvm/versions/node/v24.0.0/bin/td" }),
          /* @__PURE__ */ f.jsx("button", { className: "td-btn", children: "Use" })
        ]
      }
    ),
    e.td && /* @__PURE__ */ f.jsxs("p", { className: "td-dim td-small td-setup-ver", children: [
      "td ",
      e.td.version,
      " · ",
      e.td.path
    ] })
  ] }) });
}
function up(e) {
  const [t, n] = R.useState(Date.now());
  if (R.useEffect(() => {
    if (e === null) return;
    const l = setInterval(() => n(Date.now()), 1e3);
    return () => clearInterval(l);
  }, [e]), e === null) return "";
  const r = Math.max(0, Math.round((t - e) / 1e3));
  return r < 60 ? `${r} s` : `${Math.floor(r / 60)} min ${r % 60} s`;
}
export {
  Lp as A,
  Hf as B,
  lp as C,
  Dp as D,
  op as E,
  rp as F,
  Cp as G,
  jp as H,
  Zf as I,
  zp as J,
  Ep as K,
  Jf as L,
  Tp as M,
  pp as N,
  mp as O,
  Bf as P,
  Mp as Q,
  Np as R,
  Up as S,
  Gf as T,
  qf as U,
  Ip as V,
  np as W,
  fp as a,
  cd as b,
  xp as c,
  Op as d,
  Fp as e,
  $p as f,
  vp as g,
  Vf as h,
  hp as i,
  f as j,
  cp as k,
  ep as l,
  kp as m,
  wp as n,
  gp as o,
  ap as p,
  Rp as q,
  R as r,
  dp as s,
  Xf as t,
  bf as u,
  Sp as v,
  yp as w,
  tp as x,
  _p as y,
  Pp as z
};

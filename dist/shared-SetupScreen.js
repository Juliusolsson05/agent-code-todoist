import { e as pd, t as md } from "./shared-types.js";
var Ja = { exports: {} }, ro = {}, es = { exports: {} }, T = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Xn = Symbol.for("react.element"), hd = Symbol.for("react.portal"), vd = Symbol.for("react.fragment"), gd = Symbol.for("react.strict_mode"), xd = Symbol.for("react.profiler"), yd = Symbol.for("react.provider"), wd = Symbol.for("react.context"), kd = Symbol.for("react.forward_ref"), Sd = Symbol.for("react.suspense"), Ed = Symbol.for("react.memo"), jd = Symbol.for("react.lazy"), Ui = Symbol.iterator;
function Cd(e) {
  return e === null || typeof e != "object" ? null : (e = Ui && e[Ui] || e["@@iterator"], typeof e == "function" ? e : null);
}
var ts = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, ns = Object.assign, rs = {};
function ln(e, t, n) {
  this.props = e, this.context = t, this.refs = rs, this.updater = n || ts;
}
ln.prototype.isReactComponent = {};
ln.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
ln.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function os() {
}
os.prototype = ln.prototype;
function Wl(e, t, n) {
  this.props = e, this.context = t, this.refs = rs, this.updater = n || ts;
}
var Ql = Wl.prototype = new os();
Ql.constructor = Wl;
ns(Ql, ln.prototype);
Ql.isPureReactComponent = !0;
var Ai = Array.isArray, ls = Object.prototype.hasOwnProperty, Kl = { current: null }, is = { key: !0, ref: !0, __self: !0, __source: !0 };
function as(e, t, n) {
  var r, o = {}, l = null, i = null;
  if (t != null) for (r in t.ref !== void 0 && (i = t.ref), t.key !== void 0 && (l = "" + t.key), t) ls.call(t, r) && !is.hasOwnProperty(r) && (o[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) o.children = n;
  else if (1 < a) {
    for (var s = Array(a), d = 0; d < a; d++) s[d] = arguments[d + 2];
    o.children = s;
  }
  if (e && e.defaultProps) for (r in a = e.defaultProps, a) o[r] === void 0 && (o[r] = a[r]);
  return { $$typeof: Xn, type: e, key: l, ref: i, props: o, _owner: Kl.current };
}
function zd(e, t) {
  return { $$typeof: Xn, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Yl(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Xn;
}
function Nd(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var Vi = /\/+/g;
function Co(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Nd("" + e.key) : t.toString(36);
}
function wr(e, t, n, r, o) {
  var l = typeof e;
  (l === "undefined" || l === "boolean") && (e = null);
  var i = !1;
  if (e === null) i = !0;
  else switch (l) {
    case "string":
    case "number":
      i = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case Xn:
        case hd:
          i = !0;
      }
  }
  if (i) return i = e, o = o(i), e = r === "" ? "." + Co(i, 0) : r, Ai(o) ? (n = "", e != null && (n = e.replace(Vi, "$&/") + "/"), wr(o, t, n, "", function(d) {
    return d;
  })) : o != null && (Yl(o) && (o = zd(o, n + (!o.key || i && i.key === o.key ? "" : ("" + o.key).replace(Vi, "$&/") + "/") + e)), t.push(o)), 1;
  if (i = 0, r = r === "" ? "." : r + ":", Ai(e)) for (var a = 0; a < e.length; a++) {
    l = e[a];
    var s = r + Co(l, a);
    i += wr(l, t, n, s, o);
  }
  else if (s = Cd(e), typeof s == "function") for (e = s.call(e), a = 0; !(l = e.next()).done; ) l = l.value, s = r + Co(l, a++), i += wr(l, t, n, s, o);
  else if (l === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return i;
}
function nr(e, t, n) {
  if (e == null) return e;
  var r = [], o = 0;
  return wr(e, r, "", "", function(l) {
    return t.call(n, l, o++);
  }), r;
}
function _d(e) {
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
var ue = { current: null }, kr = { transition: null }, Pd = { ReactCurrentDispatcher: ue, ReactCurrentBatchConfig: kr, ReactCurrentOwner: Kl };
function ss() {
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
  if (!Yl(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
T.Component = ln;
T.Fragment = vd;
T.Profiler = xd;
T.PureComponent = Wl;
T.StrictMode = gd;
T.Suspense = Sd;
T.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Pd;
T.act = ss;
T.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = ns({}, e.props), o = e.key, l = e.ref, i = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (l = t.ref, i = Kl.current), t.key !== void 0 && (o = "" + t.key), e.type && e.type.defaultProps) var a = e.type.defaultProps;
    for (s in t) ls.call(t, s) && !is.hasOwnProperty(s) && (r[s] = t[s] === void 0 && a !== void 0 ? a[s] : t[s]);
  }
  var s = arguments.length - 2;
  if (s === 1) r.children = n;
  else if (1 < s) {
    a = Array(s);
    for (var d = 0; d < s; d++) a[d] = arguments[d + 2];
    r.children = a;
  }
  return { $$typeof: Xn, type: e.type, key: o, ref: l, props: r, _owner: i };
};
T.createContext = function(e) {
  return e = { $$typeof: wd, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: yd, _context: e }, e.Consumer = e;
};
T.createElement = as;
T.createFactory = function(e) {
  var t = as.bind(null, e);
  return t.type = e, t;
};
T.createRef = function() {
  return { current: null };
};
T.forwardRef = function(e) {
  return { $$typeof: kd, render: e };
};
T.isValidElement = Yl;
T.lazy = function(e) {
  return { $$typeof: jd, _payload: { _status: -1, _result: e }, _init: _d };
};
T.memo = function(e, t) {
  return { $$typeof: Ed, type: e, compare: t === void 0 ? null : t };
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
T.unstable_act = ss;
T.useCallback = function(e, t) {
  return ue.current.useCallback(e, t);
};
T.useContext = function(e) {
  return ue.current.useContext(e);
};
T.useDebugValue = function() {
};
T.useDeferredValue = function(e) {
  return ue.current.useDeferredValue(e);
};
T.useEffect = function(e, t) {
  return ue.current.useEffect(e, t);
};
T.useId = function() {
  return ue.current.useId();
};
T.useImperativeHandle = function(e, t, n) {
  return ue.current.useImperativeHandle(e, t, n);
};
T.useInsertionEffect = function(e, t) {
  return ue.current.useInsertionEffect(e, t);
};
T.useLayoutEffect = function(e, t) {
  return ue.current.useLayoutEffect(e, t);
};
T.useMemo = function(e, t) {
  return ue.current.useMemo(e, t);
};
T.useReducer = function(e, t, n) {
  return ue.current.useReducer(e, t, n);
};
T.useRef = function(e) {
  return ue.current.useRef(e);
};
T.useState = function(e) {
  return ue.current.useState(e);
};
T.useSyncExternalStore = function(e, t, n) {
  return ue.current.useSyncExternalStore(e, t, n);
};
T.useTransition = function() {
  return ue.current.useTransition();
};
T.version = "18.3.1";
es.exports = T;
var R = es.exports;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Md = R, Td = Symbol.for("react.element"), Ld = Symbol.for("react.fragment"), Id = Object.prototype.hasOwnProperty, Rd = Md.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Dd = { key: !0, ref: !0, __self: !0, __source: !0 };
function us(e, t, n) {
  var r, o = {}, l = null, i = null;
  n !== void 0 && (l = "" + n), t.key !== void 0 && (l = "" + t.key), t.ref !== void 0 && (i = t.ref);
  for (r in t) Id.call(t, r) && !Dd.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) o[r] === void 0 && (o[r] = t[r]);
  return { $$typeof: Td, type: e, key: l, ref: i, props: o, _owner: Rd.current };
}
ro.Fragment = Ld;
ro.jsx = us;
ro.jsxs = us;
Ja.exports = ro;
var c = Ja.exports, ds = { exports: {} }, we = {}, cs = { exports: {} }, fs = {};
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
      if (0 < o(q, P)) j[Q] = P, j[M] = q, M = Q;
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
        var gt = 2 * (Q + 1) - 1, jo = j[gt], xt = gt + 1, tr = j[xt];
        if (0 > o(jo, M)) xt < q && 0 > o(tr, jo) ? (j[Q] = tr, j[xt] = M, Q = xt) : (j[Q] = jo, j[gt] = M, Q = gt);
        else if (xt < q && 0 > o(tr, M)) j[Q] = tr, j[xt] = M, Q = xt;
        else break e;
      }
    }
    return P;
  }
  function o(j, P) {
    var M = j.sortIndex - P.sortIndex;
    return M !== 0 ? M : j.id - P.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var l = performance;
    e.unstable_now = function() {
      return l.now();
    };
  } else {
    var i = Date, a = i.now();
    e.unstable_now = function() {
      return i.now() - a;
    };
  }
  var s = [], d = [], v = 1, h = null, m = 3, x = !1, y = !1, k = !1, _ = typeof setTimeout == "function" ? setTimeout : null, f = typeof clearTimeout == "function" ? clearTimeout : null, u = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function p(j) {
    for (var P = n(d); P !== null; ) {
      if (P.callback === null) r(d);
      else if (P.startTime <= j) r(d), P.sortIndex = P.expirationTime, t(s, P);
      else break;
      P = n(d);
    }
  }
  function g(j) {
    if (k = !1, p(j), !y) if (n(s) !== null) y = !0, So(S);
    else {
      var P = n(d);
      P !== null && Eo(g, P.startTime - j);
    }
  }
  function S(j, P) {
    y = !1, k && (k = !1, f(N), N = -1), x = !0;
    var M = m;
    try {
      for (p(P), h = n(s); h !== null && (!(h.expirationTime > P) || j && !_e()); ) {
        var Q = h.callback;
        if (typeof Q == "function") {
          h.callback = null, m = h.priorityLevel;
          var q = Q(h.expirationTime <= P);
          P = e.unstable_now(), typeof q == "function" ? h.callback = q : h === n(s) && r(s), p(P);
        } else r(s);
        h = n(s);
      }
      if (h !== null) var er = !0;
      else {
        var gt = n(d);
        gt !== null && Eo(g, gt.startTime - P), er = !1;
      }
      return er;
    } finally {
      h = null, m = M, x = !1;
    }
  }
  var C = !1, z = null, N = -1, W = 5, L = -1;
  function _e() {
    return !(e.unstable_now() - L < W);
  }
  function un() {
    if (z !== null) {
      var j = e.unstable_now();
      L = j;
      var P = !0;
      try {
        P = z(!0, j);
      } finally {
        P ? dn() : (C = !1, z = null);
      }
    } else C = !1;
  }
  var dn;
  if (typeof u == "function") dn = function() {
    u(un);
  };
  else if (typeof MessageChannel < "u") {
    var $i = new MessageChannel(), fd = $i.port2;
    $i.port1.onmessage = un, dn = function() {
      fd.postMessage(null);
    };
  } else dn = function() {
    _(un, 0);
  };
  function So(j) {
    z = j, C || (C = !0, dn());
  }
  function Eo(j, P) {
    N = _(function() {
      j(e.unstable_now());
    }, P);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(j) {
    j.callback = null;
  }, e.unstable_continueExecution = function() {
    y || x || (y = !0, So(S));
  }, e.unstable_forceFrameRate = function(j) {
    0 > j || 125 < j ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : W = 0 < j ? Math.floor(1e3 / j) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return m;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(s);
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
    return q = M + q, j = { id: v++, callback: P, priorityLevel: j, startTime: M, expirationTime: q, sortIndex: -1 }, M > Q ? (j.sortIndex = M, t(d, j), n(s) === null && j === n(d) && (k ? (f(N), N = -1) : k = !0, Eo(g, M - Q))) : (j.sortIndex = q, t(s, j), y || x || (y = !0, So(S))), j;
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
})(fs);
cs.exports = fs;
var Od = cs.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var bd = R, ye = Od;
function w(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var ps = /* @__PURE__ */ new Set(), Ln = {};
function Tt(e, t) {
  Zt(e, t), Zt(e + "Capture", t);
}
function Zt(e, t) {
  for (Ln[e] = t, e = 0; e < t.length; e++) ps.add(t[e]);
}
var Qe = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Zo = Object.prototype.hasOwnProperty, Fd = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Hi = {}, Bi = {};
function $d(e) {
  return Zo.call(Bi, e) ? !0 : Zo.call(Hi, e) ? !1 : Fd.test(e) ? Bi[e] = !0 : (Hi[e] = !0, !1);
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
function de(e, t, n, r, o, l, i) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = o, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = l, this.removeEmptyString = i;
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
var Xl = /[\-:]([a-z])/g;
function Gl(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    Xl,
    Gl
  );
  ne[t] = new de(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(Xl, Gl);
  ne[t] = new de(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(Xl, Gl);
  ne[t] = new de(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  ne[e] = new de(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
ne.xlinkHref = new de("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  ne[e] = new de(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function ql(e, t, n, r) {
  var o = ne.hasOwnProperty(t) ? ne[t] : null;
  (o !== null ? o.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Ad(t, n, o, r) && (n = null), r || o === null ? $d(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : o.mustUseProperty ? e[o.propertyName] = n === null ? o.type === 3 ? !1 : "" : n : (t = o.attributeName, r = o.attributeNamespace, n === null ? e.removeAttribute(t) : (o = o.type, n = o === 3 || o === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Ge = bd.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, rr = Symbol.for("react.element"), Rt = Symbol.for("react.portal"), Dt = Symbol.for("react.fragment"), Zl = Symbol.for("react.strict_mode"), Jo = Symbol.for("react.profiler"), ms = Symbol.for("react.provider"), hs = Symbol.for("react.context"), Jl = Symbol.for("react.forward_ref"), el = Symbol.for("react.suspense"), tl = Symbol.for("react.suspense_list"), ei = Symbol.for("react.memo"), Ze = Symbol.for("react.lazy"), vs = Symbol.for("react.offscreen"), Wi = Symbol.iterator;
function cn(e) {
  return e === null || typeof e != "object" ? null : (e = Wi && e[Wi] || e["@@iterator"], typeof e == "function" ? e : null);
}
var H = Object.assign, zo;
function yn(e) {
  if (zo === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    zo = t && t[1] || "";
  }
  return `
` + zo + e;
}
var No = !1;
function _o(e, t) {
  if (!e || No) return "";
  No = !0;
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
      for (var o = d.stack.split(`
`), l = r.stack.split(`
`), i = o.length - 1, a = l.length - 1; 1 <= i && 0 <= a && o[i] !== l[a]; ) a--;
      for (; 1 <= i && 0 <= a; i--, a--) if (o[i] !== l[a]) {
        if (i !== 1 || a !== 1)
          do
            if (i--, a--, 0 > a || o[i] !== l[a]) {
              var s = `
` + o[i].replace(" at new ", " at ");
              return e.displayName && s.includes("<anonymous>") && (s = s.replace("<anonymous>", e.displayName)), s;
            }
          while (1 <= i && 0 <= a);
        break;
      }
    }
  } finally {
    No = !1, Error.prepareStackTrace = n;
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
      return e = _o(e.type, !1), e;
    case 11:
      return e = _o(e.type.render, !1), e;
    case 1:
      return e = _o(e.type, !0), e;
    default:
      return "";
  }
}
function nl(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Dt:
      return "Fragment";
    case Rt:
      return "Portal";
    case Jo:
      return "Profiler";
    case Zl:
      return "StrictMode";
    case el:
      return "Suspense";
    case tl:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case hs:
      return (e.displayName || "Context") + ".Consumer";
    case ms:
      return (e._context.displayName || "Context") + ".Provider";
    case Jl:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case ei:
      return t = e.displayName || null, t !== null ? t : nl(e.type) || "Memo";
    case Ze:
      t = e._payload, e = e._init;
      try {
        return nl(e(t));
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
      return nl(t);
    case 8:
      return t === Zl ? "StrictMode" : "Mode";
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
function gs(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Bd(e) {
  var t = gs(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var o = n.get, l = n.set;
    return Object.defineProperty(e, t, { configurable: !0, get: function() {
      return o.call(this);
    }, set: function(i) {
      r = "" + i, l.call(this, i);
    } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function() {
      return r;
    }, setValue: function(i) {
      r = "" + i;
    }, stopTracking: function() {
      e._valueTracker = null, delete e[t];
    } };
  }
}
function or(e) {
  e._valueTracker || (e._valueTracker = Bd(e));
}
function xs(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = gs(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Lr(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function rl(e, t) {
  var n = t.checked;
  return H({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function Qi(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = ft(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function ys(e, t) {
  t = t.checked, t != null && ql(e, "checked", t, !1);
}
function ol(e, t) {
  ys(e, t);
  var n = ft(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? ll(e, t.type, n) : t.hasOwnProperty("defaultValue") && ll(e, t.type, ft(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function Ki(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function ll(e, t, n) {
  (t !== "number" || Lr(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var wn = Array.isArray;
function Qt(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
    for (n = 0; n < e.length; n++) o = t.hasOwnProperty("$" + e[n].value), e[n].selected !== o && (e[n].selected = o), o && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + ft(n), t = null, o = 0; o < e.length; o++) {
      if (e[o].value === n) {
        e[o].selected = !0, r && (e[o].defaultSelected = !0);
        return;
      }
      t !== null || e[o].disabled || (t = e[o]);
    }
    t !== null && (t.selected = !0);
  }
}
function il(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(w(91));
  return H({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Yi(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(w(92));
      if (wn(n)) {
        if (1 < n.length) throw Error(w(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: ft(n) };
}
function ws(e, t) {
  var n = ft(t.value), r = ft(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Xi(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function ks(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function al(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? ks(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var lr, Ss = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, o) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, o);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for (lr = lr || document.createElement("div"), lr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = lr.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
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
}, Wd = ["Webkit", "ms", "Moz", "O"];
Object.keys(En).forEach(function(e) {
  Wd.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), En[t] = En[e];
  });
});
function Es(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || En.hasOwnProperty(e) && En[e] ? ("" + t).trim() : t + "px";
}
function js(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, o = Es(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : e[n] = o;
  }
}
var Qd = H({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function sl(e, t) {
  if (t) {
    if (Qd[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(w(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(w(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(w(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(w(62));
  }
}
function ul(e, t) {
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
var dl = null;
function ti(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var cl = null, Kt = null, Yt = null;
function Gi(e) {
  if (e = Zn(e)) {
    if (typeof cl != "function") throw Error(w(280));
    var t = e.stateNode;
    t && (t = so(t), cl(e.stateNode, e.type, t));
  }
}
function Cs(e) {
  Kt ? Yt ? Yt.push(e) : Yt = [e] : Kt = e;
}
function zs() {
  if (Kt) {
    var e = Kt, t = Yt;
    if (Yt = Kt = null, Gi(e), t) for (e = 0; e < t.length; e++) Gi(t[e]);
  }
}
function Ns(e, t) {
  return e(t);
}
function _s() {
}
var Po = !1;
function Ps(e, t, n) {
  if (Po) return e(t, n);
  Po = !0;
  try {
    return Ns(e, t, n);
  } finally {
    Po = !1, (Kt !== null || Yt !== null) && (_s(), zs());
  }
}
function Rn(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = so(n);
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
  if (n && typeof n != "function") throw Error(w(231, t, typeof n));
  return n;
}
var fl = !1;
if (Qe) try {
  var fn = {};
  Object.defineProperty(fn, "passive", { get: function() {
    fl = !0;
  } }), window.addEventListener("test", fn, fn), window.removeEventListener("test", fn, fn);
} catch {
  fl = !1;
}
function Kd(e, t, n, r, o, l, i, a, s) {
  var d = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, d);
  } catch (v) {
    this.onError(v);
  }
}
var jn = !1, Ir = null, Rr = !1, pl = null, Yd = { onError: function(e) {
  jn = !0, Ir = e;
} };
function Xd(e, t, n, r, o, l, i, a, s) {
  jn = !1, Ir = null, Kd.apply(Yd, arguments);
}
function Gd(e, t, n, r, o, l, i, a, s) {
  if (Xd.apply(this, arguments), jn) {
    if (jn) {
      var d = Ir;
      jn = !1, Ir = null;
    } else throw Error(w(198));
    Rr || (Rr = !0, pl = d);
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
function Ms(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function qi(e) {
  if (Lt(e) !== e) throw Error(w(188));
}
function qd(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Lt(e), t === null) throw Error(w(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var o = n.return;
    if (o === null) break;
    var l = o.alternate;
    if (l === null) {
      if (r = o.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (o.child === l.child) {
      for (l = o.child; l; ) {
        if (l === n) return qi(o), e;
        if (l === r) return qi(o), t;
        l = l.sibling;
      }
      throw Error(w(188));
    }
    if (n.return !== r.return) n = o, r = l;
    else {
      for (var i = !1, a = o.child; a; ) {
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
      if (!i) {
        for (a = l.child; a; ) {
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
        if (!i) throw Error(w(189));
      }
    }
    if (n.alternate !== r) throw Error(w(190));
  }
  if (n.tag !== 3) throw Error(w(188));
  return n.stateNode.current === n ? e : t;
}
function Ts(e) {
  return e = qd(e), e !== null ? Ls(e) : null;
}
function Ls(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Ls(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Is = ye.unstable_scheduleCallback, Zi = ye.unstable_cancelCallback, Zd = ye.unstable_shouldYield, Jd = ye.unstable_requestPaint, K = ye.unstable_now, ec = ye.unstable_getCurrentPriorityLevel, ni = ye.unstable_ImmediatePriority, Rs = ye.unstable_UserBlockingPriority, Dr = ye.unstable_NormalPriority, tc = ye.unstable_LowPriority, Ds = ye.unstable_IdlePriority, oo = null, $e = null;
function nc(e) {
  if ($e && typeof $e.onCommitFiberRoot == "function") try {
    $e.onCommitFiberRoot(oo, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var Ie = Math.clz32 ? Math.clz32 : lc, rc = Math.log, oc = Math.LN2;
function lc(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (rc(e) / oc | 0) | 0;
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
  var r = 0, o = e.suspendedLanes, l = e.pingedLanes, i = n & 268435455;
  if (i !== 0) {
    var a = i & ~o;
    a !== 0 ? r = kn(a) : (l &= i, l !== 0 && (r = kn(l)));
  } else i = n & ~o, i !== 0 ? r = kn(i) : l !== 0 && (r = kn(l));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & o) && (o = r & -r, l = t & -t, o >= l || o === 16 && (l & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - Ie(t), o = 1 << n, r |= e[n], t &= ~o;
  return r;
}
function ic(e, t) {
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
function ac(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, o = e.expirationTimes, l = e.pendingLanes; 0 < l; ) {
    var i = 31 - Ie(l), a = 1 << i, s = o[i];
    s === -1 ? (!(a & n) || a & r) && (o[i] = ic(a, t)) : s <= t && (e.expiredLanes |= a), l &= ~a;
  }
}
function ml(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function Os() {
  var e = ir;
  return ir <<= 1, !(ir & 4194240) && (ir = 64), e;
}
function Mo(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Gn(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Ie(t), e[t] = n;
}
function sc(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var o = 31 - Ie(n), l = 1 << o;
    t[o] = 0, r[o] = -1, e[o] = -1, n &= ~l;
  }
}
function ri(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - Ie(n), o = 1 << r;
    o & t | e[r] & t && (e[r] |= t), n &= ~o;
  }
}
var D = 0;
function bs(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Fs, oi, $s, Us, As, hl = !1, sr = [], ot = null, lt = null, it = null, Dn = /* @__PURE__ */ new Map(), On = /* @__PURE__ */ new Map(), et = [], uc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Ji(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      ot = null;
      break;
    case "dragenter":
    case "dragleave":
      lt = null;
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
function pn(e, t, n, r, o, l) {
  return e === null || e.nativeEvent !== l ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: l, targetContainers: [o] }, t !== null && (t = Zn(t), t !== null && oi(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, o !== null && t.indexOf(o) === -1 && t.push(o), e);
}
function dc(e, t, n, r, o) {
  switch (t) {
    case "focusin":
      return ot = pn(ot, e, t, n, r, o), !0;
    case "dragenter":
      return lt = pn(lt, e, t, n, r, o), !0;
    case "mouseover":
      return it = pn(it, e, t, n, r, o), !0;
    case "pointerover":
      var l = o.pointerId;
      return Dn.set(l, pn(Dn.get(l) || null, e, t, n, r, o)), !0;
    case "gotpointercapture":
      return l = o.pointerId, On.set(l, pn(On.get(l) || null, e, t, n, r, o)), !0;
  }
  return !1;
}
function Vs(e) {
  var t = kt(e.target);
  if (t !== null) {
    var n = Lt(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Ms(n), t !== null) {
          e.blockedOn = t, As(e.priority, function() {
            $s(n);
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
    var n = vl(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      dl = r, n.target.dispatchEvent(r), dl = null;
    } else return t = Zn(n), t !== null && oi(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function ea(e, t, n) {
  Sr(e) && n.delete(t);
}
function cc() {
  hl = !1, ot !== null && Sr(ot) && (ot = null), lt !== null && Sr(lt) && (lt = null), it !== null && Sr(it) && (it = null), Dn.forEach(ea), On.forEach(ea);
}
function mn(e, t) {
  e.blockedOn === t && (e.blockedOn = null, hl || (hl = !0, ye.unstable_scheduleCallback(ye.unstable_NormalPriority, cc)));
}
function bn(e) {
  function t(o) {
    return mn(o, e);
  }
  if (0 < sr.length) {
    mn(sr[0], e);
    for (var n = 1; n < sr.length; n++) {
      var r = sr[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (ot !== null && mn(ot, e), lt !== null && mn(lt, e), it !== null && mn(it, e), Dn.forEach(t), On.forEach(t), n = 0; n < et.length; n++) r = et[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < et.length && (n = et[0], n.blockedOn === null); ) Vs(n), n.blockedOn === null && et.shift();
}
var Xt = Ge.ReactCurrentBatchConfig, br = !0;
function fc(e, t, n, r) {
  var o = D, l = Xt.transition;
  Xt.transition = null;
  try {
    D = 1, li(e, t, n, r);
  } finally {
    D = o, Xt.transition = l;
  }
}
function pc(e, t, n, r) {
  var o = D, l = Xt.transition;
  Xt.transition = null;
  try {
    D = 4, li(e, t, n, r);
  } finally {
    D = o, Xt.transition = l;
  }
}
function li(e, t, n, r) {
  if (br) {
    var o = vl(e, t, n, r);
    if (o === null) Uo(e, t, r, Fr, n), Ji(e, r);
    else if (dc(o, e, t, n, r)) r.stopPropagation();
    else if (Ji(e, r), t & 4 && -1 < uc.indexOf(e)) {
      for (; o !== null; ) {
        var l = Zn(o);
        if (l !== null && Fs(l), l = vl(e, t, n, r), l === null && Uo(e, t, r, Fr, n), l === o) break;
        o = l;
      }
      o !== null && r.stopPropagation();
    } else Uo(e, t, r, null, n);
  }
}
var Fr = null;
function vl(e, t, n, r) {
  if (Fr = null, e = ti(r), e = kt(e), e !== null) if (t = Lt(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Ms(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return Fr = e, null;
}
function Hs(e) {
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
      switch (ec()) {
        case ni:
          return 1;
        case Rs:
          return 4;
        case Dr:
        case tc:
          return 16;
        case Ds:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var nt = null, ii = null, Er = null;
function Bs() {
  if (Er) return Er;
  var e, t = ii, n = t.length, r, o = "value" in nt ? nt.value : nt.textContent, l = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++) ;
  var i = n - e;
  for (r = 1; r <= i && t[n - r] === o[l - r]; r++) ;
  return Er = o.slice(e, 1 < r ? 1 - r : void 0);
}
function jr(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function ur() {
  return !0;
}
function ta() {
  return !1;
}
function ke(e) {
  function t(n, r, o, l, i) {
    this._reactName = n, this._targetInst = o, this.type = r, this.nativeEvent = l, this.target = i, this.currentTarget = null;
    for (var a in e) e.hasOwnProperty(a) && (n = e[a], this[a] = n ? n(l) : l[a]);
    return this.isDefaultPrevented = (l.defaultPrevented != null ? l.defaultPrevented : l.returnValue === !1) ? ur : ta, this.isPropagationStopped = ta, this;
  }
  return H(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = ur);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = ur);
  }, persist: function() {
  }, isPersistent: ur }), t;
}
var an = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, ai = ke(an), qn = H({}, an, { view: 0, detail: 0 }), mc = ke(qn), To, Lo, hn, lo = H({}, qn, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: si, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== hn && (hn && e.type === "mousemove" ? (To = e.screenX - hn.screenX, Lo = e.screenY - hn.screenY) : Lo = To = 0, hn = e), To);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : Lo;
} }), na = ke(lo), hc = H({}, lo, { dataTransfer: 0 }), vc = ke(hc), gc = H({}, qn, { relatedTarget: 0 }), Io = ke(gc), xc = H({}, an, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), yc = ke(xc), wc = H({}, an, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), kc = ke(wc), Sc = H({}, an, { data: 0 }), ra = ke(Sc), Ec = {
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
}, jc = {
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
}, Cc = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function zc(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Cc[e]) ? !!t[e] : !1;
}
function si() {
  return zc;
}
var Nc = H({}, qn, { key: function(e) {
  if (e.key) {
    var t = Ec[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = jr(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? jc[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: si, charCode: function(e) {
  return e.type === "keypress" ? jr(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? jr(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), _c = ke(Nc), Pc = H({}, lo, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), oa = ke(Pc), Mc = H({}, qn, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: si }), Tc = ke(Mc), Lc = H({}, an, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Ic = ke(Lc), Rc = H({}, lo, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Dc = ke(Rc), Oc = [9, 13, 27, 32], ui = Qe && "CompositionEvent" in window, Cn = null;
Qe && "documentMode" in document && (Cn = document.documentMode);
var bc = Qe && "TextEvent" in window && !Cn, Ws = Qe && (!ui || Cn && 8 < Cn && 11 >= Cn), la = " ", ia = !1;
function Qs(e, t) {
  switch (e) {
    case "keyup":
      return Oc.indexOf(t.keyCode) !== -1;
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
function Ks(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var Ot = !1;
function Fc(e, t) {
  switch (e) {
    case "compositionend":
      return Ks(t);
    case "keypress":
      return t.which !== 32 ? null : (ia = !0, la);
    case "textInput":
      return e = t.data, e === la && ia ? null : e;
    default:
      return null;
  }
}
function $c(e, t) {
  if (Ot) return e === "compositionend" || !ui && Qs(e, t) ? (e = Bs(), Er = ii = nt = null, Ot = !1, e) : null;
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
      return Ws && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Uc = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function aa(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Uc[e.type] : t === "textarea";
}
function Ys(e, t, n, r) {
  Cs(r), t = $r(t, "onChange"), 0 < t.length && (n = new ai("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var zn = null, Fn = null;
function Ac(e) {
  lu(e, 0);
}
function io(e) {
  var t = $t(e);
  if (xs(t)) return e;
}
function Vc(e, t) {
  if (e === "change") return t;
}
var Xs = !1;
if (Qe) {
  var Ro;
  if (Qe) {
    var Do = "oninput" in document;
    if (!Do) {
      var sa = document.createElement("div");
      sa.setAttribute("oninput", "return;"), Do = typeof sa.oninput == "function";
    }
    Ro = Do;
  } else Ro = !1;
  Xs = Ro && (!document.documentMode || 9 < document.documentMode);
}
function ua() {
  zn && (zn.detachEvent("onpropertychange", Gs), Fn = zn = null);
}
function Gs(e) {
  if (e.propertyName === "value" && io(Fn)) {
    var t = [];
    Ys(t, Fn, e, ti(e)), Ps(Ac, t);
  }
}
function Hc(e, t, n) {
  e === "focusin" ? (ua(), zn = t, Fn = n, zn.attachEvent("onpropertychange", Gs)) : e === "focusout" && ua();
}
function Bc(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return io(Fn);
}
function Wc(e, t) {
  if (e === "click") return io(t);
}
function Qc(e, t) {
  if (e === "input" || e === "change") return io(t);
}
function Kc(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var De = typeof Object.is == "function" ? Object.is : Kc;
function $n(e, t) {
  if (De(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var o = n[r];
    if (!Zo.call(t, o) || !De(e[o], t[o])) return !1;
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
function qs(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? qs(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function Zs() {
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
function Yc(e) {
  var t = Zs(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && qs(n.ownerDocument.documentElement, n)) {
    if (r !== null && di(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var o = n.textContent.length, l = Math.min(r.start, o);
        r = r.end === void 0 ? l : Math.min(r.end, o), !e.extend && l > r && (o = r, r = l, l = o), o = ca(n, l);
        var i = ca(
          n,
          r
        );
        o && i && (e.rangeCount !== 1 || e.anchorNode !== o.node || e.anchorOffset !== o.offset || e.focusNode !== i.node || e.focusOffset !== i.offset) && (t = t.createRange(), t.setStart(o.node, o.offset), e.removeAllRanges(), l > r ? (e.addRange(t), e.extend(i.node, i.offset)) : (t.setEnd(i.node, i.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
  }
}
var Xc = Qe && "documentMode" in document && 11 >= document.documentMode, bt = null, gl = null, Nn = null, xl = !1;
function fa(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  xl || bt == null || bt !== Lr(r) || (r = bt, "selectionStart" in r && di(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), Nn && $n(Nn, r) || (Nn = r, r = $r(gl, "onSelect"), 0 < r.length && (t = new ai("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = bt)));
}
function dr(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var Ft = { animationend: dr("Animation", "AnimationEnd"), animationiteration: dr("Animation", "AnimationIteration"), animationstart: dr("Animation", "AnimationStart"), transitionend: dr("Transition", "TransitionEnd") }, Oo = {}, Js = {};
Qe && (Js = document.createElement("div").style, "AnimationEvent" in window || (delete Ft.animationend.animation, delete Ft.animationiteration.animation, delete Ft.animationstart.animation), "TransitionEvent" in window || delete Ft.transitionend.transition);
function ao(e) {
  if (Oo[e]) return Oo[e];
  if (!Ft[e]) return e;
  var t = Ft[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in Js) return Oo[e] = t[n];
  return e;
}
var eu = ao("animationend"), tu = ao("animationiteration"), nu = ao("animationstart"), ru = ao("transitionend"), ou = /* @__PURE__ */ new Map(), pa = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function mt(e, t) {
  ou.set(e, t), Tt(t, [e]);
}
for (var bo = 0; bo < pa.length; bo++) {
  var Fo = pa[bo], Gc = Fo.toLowerCase(), qc = Fo[0].toUpperCase() + Fo.slice(1);
  mt(Gc, "on" + qc);
}
mt(eu, "onAnimationEnd");
mt(tu, "onAnimationIteration");
mt(nu, "onAnimationStart");
mt("dblclick", "onDoubleClick");
mt("focusin", "onFocus");
mt("focusout", "onBlur");
mt(ru, "onTransitionEnd");
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
var Sn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Zc = new Set("cancel close invalid load scroll toggle".split(" ").concat(Sn));
function ma(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, Gd(r, t, void 0, e), e.currentTarget = null;
}
function lu(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], o = r.event;
    r = r.listeners;
    e: {
      var l = void 0;
      if (t) for (var i = r.length - 1; 0 <= i; i--) {
        var a = r[i], s = a.instance, d = a.currentTarget;
        if (a = a.listener, s !== l && o.isPropagationStopped()) break e;
        ma(o, a, d), l = s;
      }
      else for (i = 0; i < r.length; i++) {
        if (a = r[i], s = a.instance, d = a.currentTarget, a = a.listener, s !== l && o.isPropagationStopped()) break e;
        ma(o, a, d), l = s;
      }
    }
  }
  if (Rr) throw e = pl, Rr = !1, pl = null, e;
}
function F(e, t) {
  var n = t[El];
  n === void 0 && (n = t[El] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (iu(t, e, 2, !1), n.add(r));
}
function $o(e, t, n) {
  var r = 0;
  t && (r |= 4), iu(n, e, r, t);
}
var cr = "_reactListening" + Math.random().toString(36).slice(2);
function Un(e) {
  if (!e[cr]) {
    e[cr] = !0, ps.forEach(function(n) {
      n !== "selectionchange" && (Zc.has(n) || $o(n, !1, e), $o(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[cr] || (t[cr] = !0, $o("selectionchange", !1, t));
  }
}
function iu(e, t, n, r) {
  switch (Hs(t)) {
    case 1:
      var o = fc;
      break;
    case 4:
      o = pc;
      break;
    default:
      o = li;
  }
  n = o.bind(null, t, n, e), o = void 0, !fl || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (o = !0), r ? o !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: o }) : e.addEventListener(t, n, !0) : o !== void 0 ? e.addEventListener(t, n, { passive: o }) : e.addEventListener(t, n, !1);
}
function Uo(e, t, n, r, o) {
  var l = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
    if (r === null) return;
    var i = r.tag;
    if (i === 3 || i === 4) {
      var a = r.stateNode.containerInfo;
      if (a === o || a.nodeType === 8 && a.parentNode === o) break;
      if (i === 4) for (i = r.return; i !== null; ) {
        var s = i.tag;
        if ((s === 3 || s === 4) && (s = i.stateNode.containerInfo, s === o || s.nodeType === 8 && s.parentNode === o)) return;
        i = i.return;
      }
      for (; a !== null; ) {
        if (i = kt(a), i === null) return;
        if (s = i.tag, s === 5 || s === 6) {
          r = l = i;
          continue e;
        }
        a = a.parentNode;
      }
    }
    r = r.return;
  }
  Ps(function() {
    var d = l, v = ti(n), h = [];
    e: {
      var m = ou.get(e);
      if (m !== void 0) {
        var x = ai, y = e;
        switch (e) {
          case "keypress":
            if (jr(n) === 0) break e;
          case "keydown":
          case "keyup":
            x = _c;
            break;
          case "focusin":
            y = "focus", x = Io;
            break;
          case "focusout":
            y = "blur", x = Io;
            break;
          case "beforeblur":
          case "afterblur":
            x = Io;
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
            x = vc;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            x = Tc;
            break;
          case eu:
          case tu:
          case nu:
            x = yc;
            break;
          case ru:
            x = Ic;
            break;
          case "scroll":
            x = mc;
            break;
          case "wheel":
            x = Dc;
            break;
          case "copy":
          case "cut":
          case "paste":
            x = kc;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            x = oa;
        }
        var k = (t & 4) !== 0, _ = !k && e === "scroll", f = k ? m !== null ? m + "Capture" : null : m;
        k = [];
        for (var u = d, p; u !== null; ) {
          p = u;
          var g = p.stateNode;
          if (p.tag === 5 && g !== null && (p = g, f !== null && (g = Rn(u, f), g != null && k.push(An(u, g, p)))), _) break;
          u = u.return;
        }
        0 < k.length && (m = new x(m, y, null, n, v), h.push({ event: m, listeners: k }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (m = e === "mouseover" || e === "pointerover", x = e === "mouseout" || e === "pointerout", m && n !== dl && (y = n.relatedTarget || n.fromElement) && (kt(y) || y[Ke])) break e;
        if ((x || m) && (m = v.window === v ? v : (m = v.ownerDocument) ? m.defaultView || m.parentWindow : window, x ? (y = n.relatedTarget || n.toElement, x = d, y = y ? kt(y) : null, y !== null && (_ = Lt(y), y !== _ || y.tag !== 5 && y.tag !== 6) && (y = null)) : (x = null, y = d), x !== y)) {
          if (k = na, g = "onMouseLeave", f = "onMouseEnter", u = "mouse", (e === "pointerout" || e === "pointerover") && (k = oa, g = "onPointerLeave", f = "onPointerEnter", u = "pointer"), _ = x == null ? m : $t(x), p = y == null ? m : $t(y), m = new k(g, u + "leave", x, n, v), m.target = _, m.relatedTarget = p, g = null, kt(v) === d && (k = new k(f, u + "enter", y, n, v), k.target = p, k.relatedTarget = _, g = k), _ = g, x && y) t: {
            for (k = x, f = y, u = 0, p = k; p; p = It(p)) u++;
            for (p = 0, g = f; g; g = It(g)) p++;
            for (; 0 < u - p; ) k = It(k), u--;
            for (; 0 < p - u; ) f = It(f), p--;
            for (; u--; ) {
              if (k === f || f !== null && k === f.alternate) break t;
              k = It(k), f = It(f);
            }
            k = null;
          }
          else k = null;
          x !== null && ha(h, m, x, k, !1), y !== null && _ !== null && ha(h, _, y, k, !0);
        }
      }
      e: {
        if (m = d ? $t(d) : window, x = m.nodeName && m.nodeName.toLowerCase(), x === "select" || x === "input" && m.type === "file") var S = Vc;
        else if (aa(m)) if (Xs) S = Qc;
        else {
          S = Bc;
          var C = Hc;
        }
        else (x = m.nodeName) && x.toLowerCase() === "input" && (m.type === "checkbox" || m.type === "radio") && (S = Wc);
        if (S && (S = S(e, d))) {
          Ys(h, S, n, v);
          break e;
        }
        C && C(e, m, d), e === "focusout" && (C = m._wrapperState) && C.controlled && m.type === "number" && ll(m, "number", m.value);
      }
      switch (C = d ? $t(d) : window, e) {
        case "focusin":
          (aa(C) || C.contentEditable === "true") && (bt = C, gl = d, Nn = null);
          break;
        case "focusout":
          Nn = gl = bt = null;
          break;
        case "mousedown":
          xl = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          xl = !1, fa(h, n, v);
          break;
        case "selectionchange":
          if (Xc) break;
        case "keydown":
        case "keyup":
          fa(h, n, v);
      }
      var z;
      if (ui) e: {
        switch (e) {
          case "compositionstart":
            var N = "onCompositionStart";
            break e;
          case "compositionend":
            N = "onCompositionEnd";
            break e;
          case "compositionupdate":
            N = "onCompositionUpdate";
            break e;
        }
        N = void 0;
      }
      else Ot ? Qs(e, n) && (N = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (N = "onCompositionStart");
      N && (Ws && n.locale !== "ko" && (Ot || N !== "onCompositionStart" ? N === "onCompositionEnd" && Ot && (z = Bs()) : (nt = v, ii = "value" in nt ? nt.value : nt.textContent, Ot = !0)), C = $r(d, N), 0 < C.length && (N = new ra(N, e, null, n, v), h.push({ event: N, listeners: C }), z ? N.data = z : (z = Ks(n), z !== null && (N.data = z)))), (z = bc ? Fc(e, n) : $c(e, n)) && (d = $r(d, "onBeforeInput"), 0 < d.length && (v = new ra("onBeforeInput", "beforeinput", null, n, v), h.push({ event: v, listeners: d }), v.data = z));
    }
    lu(h, t);
  });
}
function An(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function $r(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var o = e, l = o.stateNode;
    o.tag === 5 && l !== null && (o = l, l = Rn(e, n), l != null && r.unshift(An(e, l, o)), l = Rn(e, t), l != null && r.push(An(e, l, o))), e = e.return;
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
function ha(e, t, n, r, o) {
  for (var l = t._reactName, i = []; n !== null && n !== r; ) {
    var a = n, s = a.alternate, d = a.stateNode;
    if (s !== null && s === r) break;
    a.tag === 5 && d !== null && (a = d, o ? (s = Rn(n, l), s != null && i.unshift(An(n, s, a))) : o || (s = Rn(n, l), s != null && i.push(An(n, s, a)))), n = n.return;
  }
  i.length !== 0 && e.push({ event: t, listeners: i });
}
var Jc = /\r\n?/g, ef = /\u0000|\uFFFD/g;
function va(e) {
  return (typeof e == "string" ? e : "" + e).replace(Jc, `
`).replace(ef, "");
}
function fr(e, t, n) {
  if (t = va(t), va(e) !== t && n) throw Error(w(425));
}
function Ur() {
}
var yl = null, wl = null;
function kl(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var Sl = typeof setTimeout == "function" ? setTimeout : void 0, tf = typeof clearTimeout == "function" ? clearTimeout : void 0, ga = typeof Promise == "function" ? Promise : void 0, nf = typeof queueMicrotask == "function" ? queueMicrotask : typeof ga < "u" ? function(e) {
  return ga.resolve(null).then(e).catch(rf);
} : Sl;
function rf(e) {
  setTimeout(function() {
    throw e;
  });
}
function Ao(e, t) {
  var n = t, r = 0;
  do {
    var o = n.nextSibling;
    if (e.removeChild(n), o && o.nodeType === 8) if (n = o.data, n === "/$") {
      if (r === 0) {
        e.removeChild(o), bn(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = o;
  } while (n);
  bn(t);
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
var sn = Math.random().toString(36).slice(2), Fe = "__reactFiber$" + sn, Vn = "__reactProps$" + sn, Ke = "__reactContainer$" + sn, El = "__reactEvents$" + sn, of = "__reactListeners$" + sn, lf = "__reactHandles$" + sn;
function kt(e) {
  var t = e[Fe];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[Ke] || n[Fe]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = xa(e); e !== null; ) {
        if (n = e[Fe]) return n;
        e = xa(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function Zn(e) {
  return e = e[Fe] || e[Ke], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function $t(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(w(33));
}
function so(e) {
  return e[Vn] || null;
}
var jl = [], Ut = -1;
function ht(e) {
  return { current: e };
}
function $(e) {
  0 > Ut || (e.current = jl[Ut], jl[Ut] = null, Ut--);
}
function O(e, t) {
  Ut++, jl[Ut] = e.current, e.current = t;
}
var pt = {}, ie = ht(pt), pe = ht(!1), zt = pt;
function Jt(e, t) {
  var n = e.type.contextTypes;
  if (!n) return pt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var o = {}, l;
  for (l in n) o[l] = t[l];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = o), o;
}
function me(e) {
  return e = e.childContextTypes, e != null;
}
function Ar() {
  $(pe), $(ie);
}
function ya(e, t, n) {
  if (ie.current !== pt) throw Error(w(168));
  O(ie, t), O(pe, n);
}
function au(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var o in r) if (!(o in t)) throw Error(w(108, Hd(e) || "Unknown", o));
  return H({}, n, r);
}
function Vr(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || pt, zt = ie.current, O(ie, e), O(pe, pe.current), !0;
}
function wa(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(w(169));
  n ? (e = au(e, t, zt), r.__reactInternalMemoizedMergedChildContext = e, $(pe), $(ie), O(ie, e)) : $(pe), O(pe, n);
}
var Ve = null, uo = !1, Vo = !1;
function su(e) {
  Ve === null ? Ve = [e] : Ve.push(e);
}
function af(e) {
  uo = !0, su(e);
}
function vt() {
  if (!Vo && Ve !== null) {
    Vo = !0;
    var e = 0, t = D;
    try {
      var n = Ve;
      for (D = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      Ve = null, uo = !1;
    } catch (o) {
      throw Ve !== null && (Ve = Ve.slice(e + 1)), Is(ni, vt), o;
    } finally {
      D = t, Vo = !1;
    }
  }
  return null;
}
var At = [], Vt = 0, Hr = null, Br = 0, Se = [], Ee = 0, Nt = null, He = 1, Be = "";
function yt(e, t) {
  At[Vt++] = Br, At[Vt++] = Hr, Hr = e, Br = t;
}
function uu(e, t, n) {
  Se[Ee++] = He, Se[Ee++] = Be, Se[Ee++] = Nt, Nt = e;
  var r = He;
  e = Be;
  var o = 32 - Ie(r) - 1;
  r &= ~(1 << o), n += 1;
  var l = 32 - Ie(t) + o;
  if (30 < l) {
    var i = o - o % 5;
    l = (r & (1 << i) - 1).toString(32), r >>= i, o -= i, He = 1 << 32 - Ie(t) + o | n << o | r, Be = l + e;
  } else He = 1 << l | n << o | r, Be = e;
}
function ci(e) {
  e.return !== null && (yt(e, 1), uu(e, 1, 0));
}
function fi(e) {
  for (; e === Hr; ) Hr = At[--Vt], At[Vt] = null, Br = At[--Vt], At[Vt] = null;
  for (; e === Nt; ) Nt = Se[--Ee], Se[Ee] = null, Be = Se[--Ee], Se[Ee] = null, He = Se[--Ee], Se[Ee] = null;
}
var xe = null, ge = null, U = !1, Le = null;
function du(e, t) {
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
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = Nt !== null ? { id: He, overflow: Be } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = je(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, xe = e, ge = null, !0) : !1;
    default:
      return !1;
  }
}
function Cl(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function zl(e) {
  if (U) {
    var t = ge;
    if (t) {
      var n = t;
      if (!ka(e, t)) {
        if (Cl(e)) throw Error(w(418));
        t = at(n.nextSibling);
        var r = xe;
        t && ka(e, t) ? du(r, n) : (e.flags = e.flags & -4097 | 2, U = !1, xe = e);
      }
    } else {
      if (Cl(e)) throw Error(w(418));
      e.flags = e.flags & -4097 | 2, U = !1, xe = e;
    }
  }
}
function Sa(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  xe = e;
}
function pr(e) {
  if (e !== xe) return !1;
  if (!U) return Sa(e), U = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !kl(e.type, e.memoizedProps)), t && (t = ge)) {
    if (Cl(e)) throw cu(), Error(w(418));
    for (; t; ) du(e, t), t = at(t.nextSibling);
  }
  if (Sa(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(w(317));
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
function cu() {
  for (var e = ge; e; ) e = at(e.nextSibling);
}
function en() {
  ge = xe = null, U = !1;
}
function pi(e) {
  Le === null ? Le = [e] : Le.push(e);
}
var sf = Ge.ReactCurrentBatchConfig;
function vn(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(w(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(w(147, e));
      var o = r, l = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === l ? t.ref : (t = function(i) {
        var a = o.refs;
        i === null ? delete a[l] : a[l] = i;
      }, t._stringRef = l, t);
    }
    if (typeof e != "string") throw Error(w(284));
    if (!n._owner) throw Error(w(290, e));
  }
  return e;
}
function mr(e, t) {
  throw e = Object.prototype.toString.call(t), Error(w(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function Ea(e) {
  var t = e._init;
  return t(e._payload);
}
function fu(e) {
  function t(f, u) {
    if (e) {
      var p = f.deletions;
      p === null ? (f.deletions = [u], f.flags |= 16) : p.push(u);
    }
  }
  function n(f, u) {
    if (!e) return null;
    for (; u !== null; ) t(f, u), u = u.sibling;
    return null;
  }
  function r(f, u) {
    for (f = /* @__PURE__ */ new Map(); u !== null; ) u.key !== null ? f.set(u.key, u) : f.set(u.index, u), u = u.sibling;
    return f;
  }
  function o(f, u) {
    return f = ct(f, u), f.index = 0, f.sibling = null, f;
  }
  function l(f, u, p) {
    return f.index = p, e ? (p = f.alternate, p !== null ? (p = p.index, p < u ? (f.flags |= 2, u) : p) : (f.flags |= 2, u)) : (f.flags |= 1048576, u);
  }
  function i(f) {
    return e && f.alternate === null && (f.flags |= 2), f;
  }
  function a(f, u, p, g) {
    return u === null || u.tag !== 6 ? (u = Xo(p, f.mode, g), u.return = f, u) : (u = o(u, p), u.return = f, u);
  }
  function s(f, u, p, g) {
    var S = p.type;
    return S === Dt ? v(f, u, p.props.children, g, p.key) : u !== null && (u.elementType === S || typeof S == "object" && S !== null && S.$$typeof === Ze && Ea(S) === u.type) ? (g = o(u, p.props), g.ref = vn(f, u, p), g.return = f, g) : (g = Tr(p.type, p.key, p.props, null, f.mode, g), g.ref = vn(f, u, p), g.return = f, g);
  }
  function d(f, u, p, g) {
    return u === null || u.tag !== 4 || u.stateNode.containerInfo !== p.containerInfo || u.stateNode.implementation !== p.implementation ? (u = Go(p, f.mode, g), u.return = f, u) : (u = o(u, p.children || []), u.return = f, u);
  }
  function v(f, u, p, g, S) {
    return u === null || u.tag !== 7 ? (u = Ct(p, f.mode, g, S), u.return = f, u) : (u = o(u, p), u.return = f, u);
  }
  function h(f, u, p) {
    if (typeof u == "string" && u !== "" || typeof u == "number") return u = Xo("" + u, f.mode, p), u.return = f, u;
    if (typeof u == "object" && u !== null) {
      switch (u.$$typeof) {
        case rr:
          return p = Tr(u.type, u.key, u.props, null, f.mode, p), p.ref = vn(f, null, u), p.return = f, p;
        case Rt:
          return u = Go(u, f.mode, p), u.return = f, u;
        case Ze:
          var g = u._init;
          return h(f, g(u._payload), p);
      }
      if (wn(u) || cn(u)) return u = Ct(u, f.mode, p, null), u.return = f, u;
      mr(f, u);
    }
    return null;
  }
  function m(f, u, p, g) {
    var S = u !== null ? u.key : null;
    if (typeof p == "string" && p !== "" || typeof p == "number") return S !== null ? null : a(f, u, "" + p, g);
    if (typeof p == "object" && p !== null) {
      switch (p.$$typeof) {
        case rr:
          return p.key === S ? s(f, u, p, g) : null;
        case Rt:
          return p.key === S ? d(f, u, p, g) : null;
        case Ze:
          return S = p._init, m(
            f,
            u,
            S(p._payload),
            g
          );
      }
      if (wn(p) || cn(p)) return S !== null ? null : v(f, u, p, g, null);
      mr(f, p);
    }
    return null;
  }
  function x(f, u, p, g, S) {
    if (typeof g == "string" && g !== "" || typeof g == "number") return f = f.get(p) || null, a(u, f, "" + g, S);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case rr:
          return f = f.get(g.key === null ? p : g.key) || null, s(u, f, g, S);
        case Rt:
          return f = f.get(g.key === null ? p : g.key) || null, d(u, f, g, S);
        case Ze:
          var C = g._init;
          return x(f, u, p, C(g._payload), S);
      }
      if (wn(g) || cn(g)) return f = f.get(p) || null, v(u, f, g, S, null);
      mr(u, g);
    }
    return null;
  }
  function y(f, u, p, g) {
    for (var S = null, C = null, z = u, N = u = 0, W = null; z !== null && N < p.length; N++) {
      z.index > N ? (W = z, z = null) : W = z.sibling;
      var L = m(f, z, p[N], g);
      if (L === null) {
        z === null && (z = W);
        break;
      }
      e && z && L.alternate === null && t(f, z), u = l(L, u, N), C === null ? S = L : C.sibling = L, C = L, z = W;
    }
    if (N === p.length) return n(f, z), U && yt(f, N), S;
    if (z === null) {
      for (; N < p.length; N++) z = h(f, p[N], g), z !== null && (u = l(z, u, N), C === null ? S = z : C.sibling = z, C = z);
      return U && yt(f, N), S;
    }
    for (z = r(f, z); N < p.length; N++) W = x(z, f, N, p[N], g), W !== null && (e && W.alternate !== null && z.delete(W.key === null ? N : W.key), u = l(W, u, N), C === null ? S = W : C.sibling = W, C = W);
    return e && z.forEach(function(_e) {
      return t(f, _e);
    }), U && yt(f, N), S;
  }
  function k(f, u, p, g) {
    var S = cn(p);
    if (typeof S != "function") throw Error(w(150));
    if (p = S.call(p), p == null) throw Error(w(151));
    for (var C = S = null, z = u, N = u = 0, W = null, L = p.next(); z !== null && !L.done; N++, L = p.next()) {
      z.index > N ? (W = z, z = null) : W = z.sibling;
      var _e = m(f, z, L.value, g);
      if (_e === null) {
        z === null && (z = W);
        break;
      }
      e && z && _e.alternate === null && t(f, z), u = l(_e, u, N), C === null ? S = _e : C.sibling = _e, C = _e, z = W;
    }
    if (L.done) return n(
      f,
      z
    ), U && yt(f, N), S;
    if (z === null) {
      for (; !L.done; N++, L = p.next()) L = h(f, L.value, g), L !== null && (u = l(L, u, N), C === null ? S = L : C.sibling = L, C = L);
      return U && yt(f, N), S;
    }
    for (z = r(f, z); !L.done; N++, L = p.next()) L = x(z, f, N, L.value, g), L !== null && (e && L.alternate !== null && z.delete(L.key === null ? N : L.key), u = l(L, u, N), C === null ? S = L : C.sibling = L, C = L);
    return e && z.forEach(function(un) {
      return t(f, un);
    }), U && yt(f, N), S;
  }
  function _(f, u, p, g) {
    if (typeof p == "object" && p !== null && p.type === Dt && p.key === null && (p = p.props.children), typeof p == "object" && p !== null) {
      switch (p.$$typeof) {
        case rr:
          e: {
            for (var S = p.key, C = u; C !== null; ) {
              if (C.key === S) {
                if (S = p.type, S === Dt) {
                  if (C.tag === 7) {
                    n(f, C.sibling), u = o(C, p.props.children), u.return = f, f = u;
                    break e;
                  }
                } else if (C.elementType === S || typeof S == "object" && S !== null && S.$$typeof === Ze && Ea(S) === C.type) {
                  n(f, C.sibling), u = o(C, p.props), u.ref = vn(f, C, p), u.return = f, f = u;
                  break e;
                }
                n(f, C);
                break;
              } else t(f, C);
              C = C.sibling;
            }
            p.type === Dt ? (u = Ct(p.props.children, f.mode, g, p.key), u.return = f, f = u) : (g = Tr(p.type, p.key, p.props, null, f.mode, g), g.ref = vn(f, u, p), g.return = f, f = g);
          }
          return i(f);
        case Rt:
          e: {
            for (C = p.key; u !== null; ) {
              if (u.key === C) if (u.tag === 4 && u.stateNode.containerInfo === p.containerInfo && u.stateNode.implementation === p.implementation) {
                n(f, u.sibling), u = o(u, p.children || []), u.return = f, f = u;
                break e;
              } else {
                n(f, u);
                break;
              }
              else t(f, u);
              u = u.sibling;
            }
            u = Go(p, f.mode, g), u.return = f, f = u;
          }
          return i(f);
        case Ze:
          return C = p._init, _(f, u, C(p._payload), g);
      }
      if (wn(p)) return y(f, u, p, g);
      if (cn(p)) return k(f, u, p, g);
      mr(f, p);
    }
    return typeof p == "string" && p !== "" || typeof p == "number" ? (p = "" + p, u !== null && u.tag === 6 ? (n(f, u.sibling), u = o(u, p), u.return = f, f = u) : (n(f, u), u = Xo(p, f.mode, g), u.return = f, f = u), i(f)) : n(f, u);
  }
  return _;
}
var tn = fu(!0), pu = fu(!1), Wr = ht(null), Qr = null, Ht = null, mi = null;
function hi() {
  mi = Ht = Qr = null;
}
function vi(e) {
  var t = Wr.current;
  $(Wr), e._currentValue = t;
}
function Nl(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function Gt(e, t) {
  Qr = e, mi = Ht = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (fe = !0), e.firstContext = null);
}
function ze(e) {
  var t = e._currentValue;
  if (mi !== e) if (e = { context: e, memoizedValue: t, next: null }, Ht === null) {
    if (Qr === null) throw Error(w(308));
    Ht = e, Qr.dependencies = { lanes: 0, firstContext: e };
  } else Ht = Ht.next = e;
  return t;
}
var St = null;
function gi(e) {
  St === null ? St = [e] : St.push(e);
}
function mu(e, t, n, r) {
  var o = t.interleaved;
  return o === null ? (n.next = n, gi(t)) : (n.next = o.next, o.next = n), t.interleaved = n, Ye(e, r);
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
function hu(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function We(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function st(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, I & 2) {
    var o = r.pending;
    return o === null ? t.next = t : (t.next = o.next, o.next = t), r.pending = t, Ye(e, n);
  }
  return o = r.interleaved, o === null ? (t.next = t, gi(r)) : (t.next = o.next, o.next = t), r.interleaved = t, Ye(e, n);
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
    var o = null, l = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var i = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
        l === null ? o = l = i : l = l.next = i, n = n.next;
      } while (n !== null);
      l === null ? o = l = t : l = l.next = t;
    } else o = l = t;
    n = { baseState: r.baseState, firstBaseUpdate: o, lastBaseUpdate: l, shared: r.shared, effects: r.effects }, e.updateQueue = n;
    return;
  }
  e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
}
function Kr(e, t, n, r) {
  var o = e.updateQueue;
  Je = !1;
  var l = o.firstBaseUpdate, i = o.lastBaseUpdate, a = o.shared.pending;
  if (a !== null) {
    o.shared.pending = null;
    var s = a, d = s.next;
    s.next = null, i === null ? l = d : i.next = d, i = s;
    var v = e.alternate;
    v !== null && (v = v.updateQueue, a = v.lastBaseUpdate, a !== i && (a === null ? v.firstBaseUpdate = d : a.next = d, v.lastBaseUpdate = s));
  }
  if (l !== null) {
    var h = o.baseState;
    i = 0, v = d = s = null, a = l;
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
          var y = e, k = a;
          switch (m = t, x = n, k.tag) {
            case 1:
              if (y = k.payload, typeof y == "function") {
                h = y.call(x, h, m);
                break e;
              }
              h = y;
              break e;
            case 3:
              y.flags = y.flags & -65537 | 128;
            case 0:
              if (y = k.payload, m = typeof y == "function" ? y.call(x, h, m) : y, m == null) break e;
              h = H({}, h, m);
              break e;
            case 2:
              Je = !0;
          }
        }
        a.callback !== null && a.lane !== 0 && (e.flags |= 64, m = o.effects, m === null ? o.effects = [a] : m.push(a));
      } else x = { eventTime: x, lane: m, tag: a.tag, payload: a.payload, callback: a.callback, next: null }, v === null ? (d = v = x, s = h) : v = v.next = x, i |= m;
      if (a = a.next, a === null) {
        if (a = o.shared.pending, a === null) break;
        m = a, a = m.next, m.next = null, o.lastBaseUpdate = m, o.shared.pending = null;
      }
    } while (!0);
    if (v === null && (s = h), o.baseState = s, o.firstBaseUpdate = d, o.lastBaseUpdate = v, t = o.shared.interleaved, t !== null) {
      o = t;
      do
        i |= o.lane, o = o.next;
      while (o !== t);
    } else l === null && (o.shared.lanes = 0);
    Pt |= i, e.lanes = i, e.memoizedState = h;
  }
}
function Ca(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], o = r.callback;
    if (o !== null) {
      if (r.callback = null, r = n, typeof o != "function") throw Error(w(191, o));
      o.call(r);
    }
  }
}
var Jn = {}, Ue = ht(Jn), Hn = ht(Jn), Bn = ht(Jn);
function Et(e) {
  if (e === Jn) throw Error(w(174));
  return e;
}
function yi(e, t) {
  switch (O(Bn, t), O(Hn, e), O(Ue, Jn), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : al(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = al(t, e);
  }
  $(Ue), O(Ue, t);
}
function nn() {
  $(Ue), $(Hn), $(Bn);
}
function vu(e) {
  Et(Bn.current);
  var t = Et(Ue.current), n = al(t, e.type);
  t !== n && (O(Hn, e), O(Ue, n));
}
function wi(e) {
  Hn.current === e && ($(Ue), $(Hn));
}
var A = ht(0);
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
var Ho = [];
function ki() {
  for (var e = 0; e < Ho.length; e++) Ho[e]._workInProgressVersionPrimary = null;
  Ho.length = 0;
}
var zr = Ge.ReactCurrentDispatcher, Bo = Ge.ReactCurrentBatchConfig, _t = 0, V = null, X = null, Z = null, Xr = !1, _n = !1, Wn = 0, uf = 0;
function re() {
  throw Error(w(321));
}
function Si(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!De(e[n], t[n])) return !1;
  return !0;
}
function Ei(e, t, n, r, o, l) {
  if (_t = l, V = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, zr.current = e === null || e.memoizedState === null ? pf : mf, e = n(r, o), _n) {
    l = 0;
    do {
      if (_n = !1, Wn = 0, 25 <= l) throw Error(w(301));
      l += 1, Z = X = null, t.updateQueue = null, zr.current = hf, e = n(r, o);
    } while (_n);
  }
  if (zr.current = Gr, t = X !== null && X.next !== null, _t = 0, Z = X = V = null, Xr = !1, t) throw Error(w(300));
  return e;
}
function ji() {
  var e = Wn !== 0;
  return Wn = 0, e;
}
function be() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return Z === null ? V.memoizedState = Z = e : Z = Z.next = e, Z;
}
function Ne() {
  if (X === null) {
    var e = V.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = X.next;
  var t = Z === null ? V.memoizedState : Z.next;
  if (t !== null) Z = t, X = e;
  else {
    if (e === null) throw Error(w(310));
    X = e, e = { memoizedState: X.memoizedState, baseState: X.baseState, baseQueue: X.baseQueue, queue: X.queue, next: null }, Z === null ? V.memoizedState = Z = e : Z = Z.next = e;
  }
  return Z;
}
function Qn(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Wo(e) {
  var t = Ne(), n = t.queue;
  if (n === null) throw Error(w(311));
  n.lastRenderedReducer = e;
  var r = X, o = r.baseQueue, l = n.pending;
  if (l !== null) {
    if (o !== null) {
      var i = o.next;
      o.next = l.next, l.next = i;
    }
    r.baseQueue = o = l, n.pending = null;
  }
  if (o !== null) {
    l = o.next, r = r.baseState;
    var a = i = null, s = null, d = l;
    do {
      var v = d.lane;
      if ((_t & v) === v) s !== null && (s = s.next = { lane: 0, action: d.action, hasEagerState: d.hasEagerState, eagerState: d.eagerState, next: null }), r = d.hasEagerState ? d.eagerState : e(r, d.action);
      else {
        var h = {
          lane: v,
          action: d.action,
          hasEagerState: d.hasEagerState,
          eagerState: d.eagerState,
          next: null
        };
        s === null ? (a = s = h, i = r) : s = s.next = h, V.lanes |= v, Pt |= v;
      }
      d = d.next;
    } while (d !== null && d !== l);
    s === null ? i = r : s.next = a, De(r, t.memoizedState) || (fe = !0), t.memoizedState = r, t.baseState = i, t.baseQueue = s, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    o = e;
    do
      l = o.lane, V.lanes |= l, Pt |= l, o = o.next;
    while (o !== e);
  } else o === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Qo(e) {
  var t = Ne(), n = t.queue;
  if (n === null) throw Error(w(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, o = n.pending, l = t.memoizedState;
  if (o !== null) {
    n.pending = null;
    var i = o = o.next;
    do
      l = e(l, i.action), i = i.next;
    while (i !== o);
    De(l, t.memoizedState) || (fe = !0), t.memoizedState = l, t.baseQueue === null && (t.baseState = l), n.lastRenderedState = l;
  }
  return [l, r];
}
function gu() {
}
function xu(e, t) {
  var n = V, r = Ne(), o = t(), l = !De(r.memoizedState, o);
  if (l && (r.memoizedState = o, fe = !0), r = r.queue, Ci(ku.bind(null, n, r, e), [e]), r.getSnapshot !== t || l || Z !== null && Z.memoizedState.tag & 1) {
    if (n.flags |= 2048, Kn(9, wu.bind(null, n, r, o, t), void 0, null), J === null) throw Error(w(349));
    _t & 30 || yu(n, t, o);
  }
  return o;
}
function yu(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = V.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, V.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function wu(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Su(t) && Eu(e);
}
function ku(e, t, n) {
  return n(function() {
    Su(t) && Eu(e);
  });
}
function Su(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !De(e, n);
  } catch {
    return !0;
  }
}
function Eu(e) {
  var t = Ye(e, 1);
  t !== null && Re(t, e, 1, -1);
}
function za(e) {
  var t = be();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Qn, lastRenderedState: e }, t.queue = e, e = e.dispatch = ff.bind(null, V, e), [t.memoizedState, e];
}
function Kn(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = V.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, V.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function ju() {
  return Ne().memoizedState;
}
function Nr(e, t, n, r) {
  var o = be();
  V.flags |= e, o.memoizedState = Kn(1 | t, n, void 0, r === void 0 ? null : r);
}
function co(e, t, n, r) {
  var o = Ne();
  r = r === void 0 ? null : r;
  var l = void 0;
  if (X !== null) {
    var i = X.memoizedState;
    if (l = i.destroy, r !== null && Si(r, i.deps)) {
      o.memoizedState = Kn(t, n, l, r);
      return;
    }
  }
  V.flags |= e, o.memoizedState = Kn(1 | t, n, l, r);
}
function Na(e, t) {
  return Nr(8390656, 8, e, t);
}
function Ci(e, t) {
  return co(2048, 8, e, t);
}
function Cu(e, t) {
  return co(4, 2, e, t);
}
function zu(e, t) {
  return co(4, 4, e, t);
}
function Nu(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function _u(e, t, n) {
  return n = n != null ? n.concat([e]) : null, co(4, 4, Nu.bind(null, t, e), n);
}
function zi() {
}
function Pu(e, t) {
  var n = Ne();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Si(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Mu(e, t) {
  var n = Ne();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Si(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function Tu(e, t, n) {
  return _t & 21 ? (De(n, t) || (n = Os(), V.lanes |= n, Pt |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, fe = !0), e.memoizedState = n);
}
function df(e, t) {
  var n = D;
  D = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = Bo.transition;
  Bo.transition = {};
  try {
    e(!1), t();
  } finally {
    D = n, Bo.transition = r;
  }
}
function Lu() {
  return Ne().memoizedState;
}
function cf(e, t, n) {
  var r = dt(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Iu(e)) Ru(t, n);
  else if (n = mu(e, t, n, r), n !== null) {
    var o = se();
    Re(n, e, r, o), Du(n, t, r);
  }
}
function ff(e, t, n) {
  var r = dt(e), o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Iu(e)) Ru(t, o);
  else {
    var l = e.alternate;
    if (e.lanes === 0 && (l === null || l.lanes === 0) && (l = t.lastRenderedReducer, l !== null)) try {
      var i = t.lastRenderedState, a = l(i, n);
      if (o.hasEagerState = !0, o.eagerState = a, De(a, i)) {
        var s = t.interleaved;
        s === null ? (o.next = o, gi(t)) : (o.next = s.next, s.next = o), t.interleaved = o;
        return;
      }
    } catch {
    } finally {
    }
    n = mu(e, t, o, r), n !== null && (o = se(), Re(n, e, r, o), Du(n, t, r));
  }
}
function Iu(e) {
  var t = e.alternate;
  return e === V || t !== null && t === V;
}
function Ru(e, t) {
  _n = Xr = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Du(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, ri(e, n);
  }
}
var Gr = { readContext: ze, useCallback: re, useContext: re, useEffect: re, useImperativeHandle: re, useInsertionEffect: re, useLayoutEffect: re, useMemo: re, useReducer: re, useRef: re, useState: re, useDebugValue: re, useDeferredValue: re, useTransition: re, useMutableSource: re, useSyncExternalStore: re, useId: re, unstable_isNewReconciler: !1 }, pf = { readContext: ze, useCallback: function(e, t) {
  return be().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: ze, useEffect: Na, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Nr(
    4194308,
    4,
    Nu.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Nr(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Nr(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = be();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = be();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = cf.bind(null, V, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = be();
  return e = { current: e }, t.memoizedState = e;
}, useState: za, useDebugValue: zi, useDeferredValue: function(e) {
  return be().memoizedState = e;
}, useTransition: function() {
  var e = za(!1), t = e[0];
  return e = df.bind(null, e[1]), be().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = V, o = be();
  if (U) {
    if (n === void 0) throw Error(w(407));
    n = n();
  } else {
    if (n = t(), J === null) throw Error(w(349));
    _t & 30 || yu(r, t, n);
  }
  o.memoizedState = n;
  var l = { value: n, getSnapshot: t };
  return o.queue = l, Na(ku.bind(
    null,
    r,
    l,
    e
  ), [e]), r.flags |= 2048, Kn(9, wu.bind(null, r, l, n, t), void 0, null), n;
}, useId: function() {
  var e = be(), t = J.identifierPrefix;
  if (U) {
    var n = Be, r = He;
    n = (r & ~(1 << 32 - Ie(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Wn++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = uf++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, mf = {
  readContext: ze,
  useCallback: Pu,
  useContext: ze,
  useEffect: Ci,
  useImperativeHandle: _u,
  useInsertionEffect: Cu,
  useLayoutEffect: zu,
  useMemo: Mu,
  useReducer: Wo,
  useRef: ju,
  useState: function() {
    return Wo(Qn);
  },
  useDebugValue: zi,
  useDeferredValue: function(e) {
    var t = Ne();
    return Tu(t, X.memoizedState, e);
  },
  useTransition: function() {
    var e = Wo(Qn)[0], t = Ne().memoizedState;
    return [e, t];
  },
  useMutableSource: gu,
  useSyncExternalStore: xu,
  useId: Lu,
  unstable_isNewReconciler: !1
}, hf = { readContext: ze, useCallback: Pu, useContext: ze, useEffect: Ci, useImperativeHandle: _u, useInsertionEffect: Cu, useLayoutEffect: zu, useMemo: Mu, useReducer: Qo, useRef: ju, useState: function() {
  return Qo(Qn);
}, useDebugValue: zi, useDeferredValue: function(e) {
  var t = Ne();
  return X === null ? t.memoizedState = e : Tu(t, X.memoizedState, e);
}, useTransition: function() {
  var e = Qo(Qn)[0], t = Ne().memoizedState;
  return [e, t];
}, useMutableSource: gu, useSyncExternalStore: xu, useId: Lu, unstable_isNewReconciler: !1 };
function Me(e, t) {
  if (e && e.defaultProps) {
    t = H({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function _l(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : H({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var fo = { isMounted: function(e) {
  return (e = e._reactInternals) ? Lt(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = se(), o = dt(e), l = We(r, o);
  l.payload = t, n != null && (l.callback = n), t = st(e, l, o), t !== null && (Re(t, e, o, r), Cr(t, e, o));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = se(), o = dt(e), l = We(r, o);
  l.tag = 1, l.payload = t, n != null && (l.callback = n), t = st(e, l, o), t !== null && (Re(t, e, o, r), Cr(t, e, o));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = se(), r = dt(e), o = We(n, r);
  o.tag = 2, t != null && (o.callback = t), t = st(e, o, r), t !== null && (Re(t, e, r, n), Cr(t, e, r));
} };
function _a(e, t, n, r, o, l, i) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, l, i) : t.prototype && t.prototype.isPureReactComponent ? !$n(n, r) || !$n(o, l) : !0;
}
function Ou(e, t, n) {
  var r = !1, o = pt, l = t.contextType;
  return typeof l == "object" && l !== null ? l = ze(l) : (o = me(t) ? zt : ie.current, r = t.contextTypes, l = (r = r != null) ? Jt(e, o) : pt), t = new t(n, l), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = fo, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = o, e.__reactInternalMemoizedMaskedChildContext = l), t;
}
function Pa(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && fo.enqueueReplaceState(t, t.state, null);
}
function Pl(e, t, n, r) {
  var o = e.stateNode;
  o.props = n, o.state = e.memoizedState, o.refs = {}, xi(e);
  var l = t.contextType;
  typeof l == "object" && l !== null ? o.context = ze(l) : (l = me(t) ? zt : ie.current, o.context = Jt(e, l)), o.state = e.memoizedState, l = t.getDerivedStateFromProps, typeof l == "function" && (_l(e, t, l, n), o.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (t = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), t !== o.state && fo.enqueueReplaceState(o, o.state, null), Kr(e, n, o, r), o.state = e.memoizedState), typeof o.componentDidMount == "function" && (e.flags |= 4194308);
}
function rn(e, t) {
  try {
    var n = "", r = t;
    do
      n += Vd(r), r = r.return;
    while (r);
    var o = n;
  } catch (l) {
    o = `
Error generating stack: ` + l.message + `
` + l.stack;
  }
  return { value: e, source: t, stack: o, digest: null };
}
function Ko(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Ml(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var vf = typeof WeakMap == "function" ? WeakMap : Map;
function bu(e, t, n) {
  n = We(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    Zr || (Zr = !0, Ul = r), Ml(e, t);
  }, n;
}
function Fu(e, t, n) {
  n = We(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var o = t.value;
    n.payload = function() {
      return r(o);
    }, n.callback = function() {
      Ml(e, t);
    };
  }
  var l = e.stateNode;
  return l !== null && typeof l.componentDidCatch == "function" && (n.callback = function() {
    Ml(e, t), typeof r != "function" && (ut === null ? ut = /* @__PURE__ */ new Set([this]) : ut.add(this));
    var i = t.stack;
    this.componentDidCatch(t.value, { componentStack: i !== null ? i : "" });
  }), n;
}
function Ma(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new vf();
    var o = /* @__PURE__ */ new Set();
    r.set(t, o);
  } else o = r.get(t), o === void 0 && (o = /* @__PURE__ */ new Set(), r.set(t, o));
  o.has(n) || (o.add(n), e = Mf.bind(null, e, t, n), t.then(e, e));
}
function Ta(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function La(e, t, n, r, o) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = o, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = We(-1, 1), t.tag = 2, st(n, t, 1))), n.lanes |= 1), e);
}
var gf = Ge.ReactCurrentOwner, fe = !1;
function ae(e, t, n, r) {
  t.child = e === null ? pu(t, null, n, r) : tn(t, e.child, n, r);
}
function Ia(e, t, n, r, o) {
  n = n.render;
  var l = t.ref;
  return Gt(t, o), r = Ei(e, t, n, r, l, o), n = ji(), e !== null && !fe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Xe(e, t, o)) : (U && n && ci(t), t.flags |= 1, ae(e, t, r, o), t.child);
}
function Ra(e, t, n, r, o) {
  if (e === null) {
    var l = n.type;
    return typeof l == "function" && !Ri(l) && l.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = l, $u(e, t, l, r, o)) : (e = Tr(n.type, null, r, t, t.mode, o), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (l = e.child, !(e.lanes & o)) {
    var i = l.memoizedProps;
    if (n = n.compare, n = n !== null ? n : $n, n(i, r) && e.ref === t.ref) return Xe(e, t, o);
  }
  return t.flags |= 1, e = ct(l, r), e.ref = t.ref, e.return = t, t.child = e;
}
function $u(e, t, n, r, o) {
  if (e !== null) {
    var l = e.memoizedProps;
    if ($n(l, r) && e.ref === t.ref) if (fe = !1, t.pendingProps = r = l, (e.lanes & o) !== 0) e.flags & 131072 && (fe = !0);
    else return t.lanes = e.lanes, Xe(e, t, o);
  }
  return Tl(e, t, n, r, o);
}
function Uu(e, t, n) {
  var r = t.pendingProps, o = r.children, l = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, O(Wt, ve), ve |= n;
  else {
    if (!(n & 1073741824)) return e = l !== null ? l.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, O(Wt, ve), ve |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = l !== null ? l.baseLanes : n, O(Wt, ve), ve |= r;
  }
  else l !== null ? (r = l.baseLanes | n, t.memoizedState = null) : r = n, O(Wt, ve), ve |= r;
  return ae(e, t, o, n), t.child;
}
function Au(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function Tl(e, t, n, r, o) {
  var l = me(n) ? zt : ie.current;
  return l = Jt(t, l), Gt(t, o), n = Ei(e, t, n, r, l, o), r = ji(), e !== null && !fe ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~o, Xe(e, t, o)) : (U && r && ci(t), t.flags |= 1, ae(e, t, n, o), t.child);
}
function Da(e, t, n, r, o) {
  if (me(n)) {
    var l = !0;
    Vr(t);
  } else l = !1;
  if (Gt(t, o), t.stateNode === null) _r(e, t), Ou(t, n, r), Pl(t, n, r, o), r = !0;
  else if (e === null) {
    var i = t.stateNode, a = t.memoizedProps;
    i.props = a;
    var s = i.context, d = n.contextType;
    typeof d == "object" && d !== null ? d = ze(d) : (d = me(n) ? zt : ie.current, d = Jt(t, d));
    var v = n.getDerivedStateFromProps, h = typeof v == "function" || typeof i.getSnapshotBeforeUpdate == "function";
    h || typeof i.UNSAFE_componentWillReceiveProps != "function" && typeof i.componentWillReceiveProps != "function" || (a !== r || s !== d) && Pa(t, i, r, d), Je = !1;
    var m = t.memoizedState;
    i.state = m, Kr(t, r, i, o), s = t.memoizedState, a !== r || m !== s || pe.current || Je ? (typeof v == "function" && (_l(t, n, v, r), s = t.memoizedState), (a = Je || _a(t, n, a, r, m, s, d)) ? (h || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount()), typeof i.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof i.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = s), i.props = r, i.state = s, i.context = d, r = a) : (typeof i.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    i = t.stateNode, hu(e, t), a = t.memoizedProps, d = t.type === t.elementType ? a : Me(t.type, a), i.props = d, h = t.pendingProps, m = i.context, s = n.contextType, typeof s == "object" && s !== null ? s = ze(s) : (s = me(n) ? zt : ie.current, s = Jt(t, s));
    var x = n.getDerivedStateFromProps;
    (v = typeof x == "function" || typeof i.getSnapshotBeforeUpdate == "function") || typeof i.UNSAFE_componentWillReceiveProps != "function" && typeof i.componentWillReceiveProps != "function" || (a !== h || m !== s) && Pa(t, i, r, s), Je = !1, m = t.memoizedState, i.state = m, Kr(t, r, i, o);
    var y = t.memoizedState;
    a !== h || m !== y || pe.current || Je ? (typeof x == "function" && (_l(t, n, x, r), y = t.memoizedState), (d = Je || _a(t, n, d, r, m, y, s) || !1) ? (v || typeof i.UNSAFE_componentWillUpdate != "function" && typeof i.componentWillUpdate != "function" || (typeof i.componentWillUpdate == "function" && i.componentWillUpdate(r, y, s), typeof i.UNSAFE_componentWillUpdate == "function" && i.UNSAFE_componentWillUpdate(r, y, s)), typeof i.componentDidUpdate == "function" && (t.flags |= 4), typeof i.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof i.componentDidUpdate != "function" || a === e.memoizedProps && m === e.memoizedState || (t.flags |= 4), typeof i.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && m === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = y), i.props = r, i.state = y, i.context = s, r = d) : (typeof i.componentDidUpdate != "function" || a === e.memoizedProps && m === e.memoizedState || (t.flags |= 4), typeof i.getSnapshotBeforeUpdate != "function" || a === e.memoizedProps && m === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return Ll(e, t, n, r, l, o);
}
function Ll(e, t, n, r, o, l) {
  Au(e, t);
  var i = (t.flags & 128) !== 0;
  if (!r && !i) return o && wa(t, n, !1), Xe(e, t, l);
  r = t.stateNode, gf.current = t;
  var a = i && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && i ? (t.child = tn(t, e.child, null, l), t.child = tn(t, null, a, l)) : ae(e, t, a, l), t.memoizedState = r.state, o && wa(t, n, !0), t.child;
}
function Vu(e) {
  var t = e.stateNode;
  t.pendingContext ? ya(e, t.pendingContext, t.pendingContext !== t.context) : t.context && ya(e, t.context, !1), yi(e, t.containerInfo);
}
function Oa(e, t, n, r, o) {
  return en(), pi(o), t.flags |= 256, ae(e, t, n, r), t.child;
}
var Il = { dehydrated: null, treeContext: null, retryLane: 0 };
function Rl(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Hu(e, t, n) {
  var r = t.pendingProps, o = A.current, l = !1, i = (t.flags & 128) !== 0, a;
  if ((a = i) || (a = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0), a ? (l = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (o |= 1), O(A, o & 1), e === null)
    return zl(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (i = r.children, e = r.fallback, l ? (r = t.mode, l = t.child, i = { mode: "hidden", children: i }, !(r & 1) && l !== null ? (l.childLanes = 0, l.pendingProps = i) : l = ho(i, r, 0, null), e = Ct(e, r, n, null), l.return = t, e.return = t, l.sibling = e, t.child = l, t.child.memoizedState = Rl(n), t.memoizedState = Il, e) : Ni(t, i));
  if (o = e.memoizedState, o !== null && (a = o.dehydrated, a !== null)) return xf(e, t, i, r, a, o, n);
  if (l) {
    l = r.fallback, i = t.mode, o = e.child, a = o.sibling;
    var s = { mode: "hidden", children: r.children };
    return !(i & 1) && t.child !== o ? (r = t.child, r.childLanes = 0, r.pendingProps = s, t.deletions = null) : (r = ct(o, s), r.subtreeFlags = o.subtreeFlags & 14680064), a !== null ? l = ct(a, l) : (l = Ct(l, i, n, null), l.flags |= 2), l.return = t, r.return = t, r.sibling = l, t.child = r, r = l, l = t.child, i = e.child.memoizedState, i = i === null ? Rl(n) : { baseLanes: i.baseLanes | n, cachePool: null, transitions: i.transitions }, l.memoizedState = i, l.childLanes = e.childLanes & ~n, t.memoizedState = Il, r;
  }
  return l = e.child, e = l.sibling, r = ct(l, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function Ni(e, t) {
  return t = ho({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function hr(e, t, n, r) {
  return r !== null && pi(r), tn(t, e.child, null, n), e = Ni(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function xf(e, t, n, r, o, l, i) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = Ko(Error(w(422))), hr(e, t, i, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (l = r.fallback, o = t.mode, r = ho({ mode: "visible", children: r.children }, o, 0, null), l = Ct(l, o, i, null), l.flags |= 2, r.return = t, l.return = t, r.sibling = l, t.child = r, t.mode & 1 && tn(t, e.child, null, i), t.child.memoizedState = Rl(i), t.memoizedState = Il, l);
  if (!(t.mode & 1)) return hr(e, t, i, null);
  if (o.data === "$!") {
    if (r = o.nextSibling && o.nextSibling.dataset, r) var a = r.dgst;
    return r = a, l = Error(w(419)), r = Ko(l, r, void 0), hr(e, t, i, r);
  }
  if (a = (i & e.childLanes) !== 0, fe || a) {
    if (r = J, r !== null) {
      switch (i & -i) {
        case 4:
          o = 2;
          break;
        case 16:
          o = 8;
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
          o = 32;
          break;
        case 536870912:
          o = 268435456;
          break;
        default:
          o = 0;
      }
      o = o & (r.suspendedLanes | i) ? 0 : o, o !== 0 && o !== l.retryLane && (l.retryLane = o, Ye(e, o), Re(r, e, o, -1));
    }
    return Ii(), r = Ko(Error(w(421))), hr(e, t, i, r);
  }
  return o.data === "$?" ? (t.flags |= 128, t.child = e.child, t = Tf.bind(null, e), o._reactRetry = t, null) : (e = l.treeContext, ge = at(o.nextSibling), xe = t, U = !0, Le = null, e !== null && (Se[Ee++] = He, Se[Ee++] = Be, Se[Ee++] = Nt, He = e.id, Be = e.overflow, Nt = t), t = Ni(t, r.children), t.flags |= 4096, t);
}
function ba(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Nl(e.return, t, n);
}
function Yo(e, t, n, r, o) {
  var l = e.memoizedState;
  l === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: o } : (l.isBackwards = t, l.rendering = null, l.renderingStartTime = 0, l.last = r, l.tail = n, l.tailMode = o);
}
function Bu(e, t, n) {
  var r = t.pendingProps, o = r.revealOrder, l = r.tail;
  if (ae(e, t, r.children, n), r = A.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && ba(e, n, t);
      else if (e.tag === 19) ba(e, n, t);
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
  if (O(A, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (o) {
    case "forwards":
      for (n = t.child, o = null; n !== null; ) e = n.alternate, e !== null && Yr(e) === null && (o = n), n = n.sibling;
      n = o, n === null ? (o = t.child, t.child = null) : (o = n.sibling, n.sibling = null), Yo(t, !1, o, n, l);
      break;
    case "backwards":
      for (n = null, o = t.child, t.child = null; o !== null; ) {
        if (e = o.alternate, e !== null && Yr(e) === null) {
          t.child = o;
          break;
        }
        e = o.sibling, o.sibling = n, n = o, o = e;
      }
      Yo(t, !0, n, null, l);
      break;
    case "together":
      Yo(t, !1, null, null, void 0);
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
  if (e !== null && t.child !== e.child) throw Error(w(153));
  if (t.child !== null) {
    for (e = t.child, n = ct(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = ct(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function yf(e, t, n) {
  switch (t.tag) {
    case 3:
      Vu(t), en();
      break;
    case 5:
      vu(t);
      break;
    case 1:
      me(t.type) && Vr(t);
      break;
    case 4:
      yi(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, o = t.memoizedProps.value;
      O(Wr, r._currentValue), r._currentValue = o;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (O(A, A.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Hu(e, t, n) : (O(A, A.current & 1), e = Xe(e, t, n), e !== null ? e.sibling : null);
      O(A, A.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Bu(e, t, n);
        t.flags |= 128;
      }
      if (o = t.memoizedState, o !== null && (o.rendering = null, o.tail = null, o.lastEffect = null), O(A, A.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Uu(e, t, n);
  }
  return Xe(e, t, n);
}
var Wu, Dl, Qu, Ku;
Wu = function(e, t) {
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
Dl = function() {
};
Qu = function(e, t, n, r) {
  var o = e.memoizedProps;
  if (o !== r) {
    e = t.stateNode, Et(Ue.current);
    var l = null;
    switch (n) {
      case "input":
        o = rl(e, o), r = rl(e, r), l = [];
        break;
      case "select":
        o = H({}, o, { value: void 0 }), r = H({}, r, { value: void 0 }), l = [];
        break;
      case "textarea":
        o = il(e, o), r = il(e, r), l = [];
        break;
      default:
        typeof o.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Ur);
    }
    sl(n, r);
    var i;
    n = null;
    for (d in o) if (!r.hasOwnProperty(d) && o.hasOwnProperty(d) && o[d] != null) if (d === "style") {
      var a = o[d];
      for (i in a) a.hasOwnProperty(i) && (n || (n = {}), n[i] = "");
    } else d !== "dangerouslySetInnerHTML" && d !== "children" && d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (Ln.hasOwnProperty(d) ? l || (l = []) : (l = l || []).push(d, null));
    for (d in r) {
      var s = r[d];
      if (a = o?.[d], r.hasOwnProperty(d) && s !== a && (s != null || a != null)) if (d === "style") if (a) {
        for (i in a) !a.hasOwnProperty(i) || s && s.hasOwnProperty(i) || (n || (n = {}), n[i] = "");
        for (i in s) s.hasOwnProperty(i) && a[i] !== s[i] && (n || (n = {}), n[i] = s[i]);
      } else n || (l || (l = []), l.push(
        d,
        n
      )), n = s;
      else d === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, a = a ? a.__html : void 0, s != null && a !== s && (l = l || []).push(d, s)) : d === "children" ? typeof s != "string" && typeof s != "number" || (l = l || []).push(d, "" + s) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && (Ln.hasOwnProperty(d) ? (s != null && d === "onScroll" && F("scroll", e), l || a === s || (l = [])) : (l = l || []).push(d, s));
    }
    n && (l = l || []).push("style", n);
    var d = l;
    (t.updateQueue = d) && (t.flags |= 4);
  }
};
Ku = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function gn(e, t) {
  if (!U) switch (e.tailMode) {
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
function oe(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var o = e.child; o !== null; ) n |= o.lanes | o.childLanes, r |= o.subtreeFlags & 14680064, r |= o.flags & 14680064, o.return = e, o = o.sibling;
  else for (o = e.child; o !== null; ) n |= o.lanes | o.childLanes, r |= o.subtreeFlags, r |= o.flags, o.return = e, o = o.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function wf(e, t, n) {
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
      return oe(t), null;
    case 1:
      return me(t.type) && Ar(), oe(t), null;
    case 3:
      return r = t.stateNode, nn(), $(pe), $(ie), ki(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (pr(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Le !== null && (Hl(Le), Le = null))), Dl(e, t), oe(t), null;
    case 5:
      wi(t);
      var o = Et(Bn.current);
      if (n = t.type, e !== null && t.stateNode != null) Qu(e, t, n, r, o), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(w(166));
          return oe(t), null;
        }
        if (e = Et(Ue.current), pr(t)) {
          r = t.stateNode, n = t.type;
          var l = t.memoizedProps;
          switch (r[Fe] = t, r[Vn] = l, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              F("cancel", r), F("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              F("load", r);
              break;
            case "video":
            case "audio":
              for (o = 0; o < Sn.length; o++) F(Sn[o], r);
              break;
            case "source":
              F("error", r);
              break;
            case "img":
            case "image":
            case "link":
              F(
                "error",
                r
              ), F("load", r);
              break;
            case "details":
              F("toggle", r);
              break;
            case "input":
              Qi(r, l), F("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!l.multiple }, F("invalid", r);
              break;
            case "textarea":
              Yi(r, l), F("invalid", r);
          }
          sl(n, l), o = null;
          for (var i in l) if (l.hasOwnProperty(i)) {
            var a = l[i];
            i === "children" ? typeof a == "string" ? r.textContent !== a && (l.suppressHydrationWarning !== !0 && fr(r.textContent, a, e), o = ["children", a]) : typeof a == "number" && r.textContent !== "" + a && (l.suppressHydrationWarning !== !0 && fr(
              r.textContent,
              a,
              e
            ), o = ["children", "" + a]) : Ln.hasOwnProperty(i) && a != null && i === "onScroll" && F("scroll", r);
          }
          switch (n) {
            case "input":
              or(r), Ki(r, l, !0);
              break;
            case "textarea":
              or(r), Xi(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof l.onClick == "function" && (r.onclick = Ur);
          }
          r = o, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          i = o.nodeType === 9 ? o : o.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = ks(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = i.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = i.createElement(n, { is: r.is }) : (e = i.createElement(n), n === "select" && (i = e, r.multiple ? i.multiple = !0 : r.size && (i.size = r.size))) : e = i.createElementNS(e, n), e[Fe] = t, e[Vn] = r, Wu(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (i = ul(n, r), n) {
              case "dialog":
                F("cancel", e), F("close", e), o = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                F("load", e), o = r;
                break;
              case "video":
              case "audio":
                for (o = 0; o < Sn.length; o++) F(Sn[o], e);
                o = r;
                break;
              case "source":
                F("error", e), o = r;
                break;
              case "img":
              case "image":
              case "link":
                F(
                  "error",
                  e
                ), F("load", e), o = r;
                break;
              case "details":
                F("toggle", e), o = r;
                break;
              case "input":
                Qi(e, r), o = rl(e, r), F("invalid", e);
                break;
              case "option":
                o = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, o = H({}, r, { value: void 0 }), F("invalid", e);
                break;
              case "textarea":
                Yi(e, r), o = il(e, r), F("invalid", e);
                break;
              default:
                o = r;
            }
            sl(n, o), a = o;
            for (l in a) if (a.hasOwnProperty(l)) {
              var s = a[l];
              l === "style" ? js(e, s) : l === "dangerouslySetInnerHTML" ? (s = s ? s.__html : void 0, s != null && Ss(e, s)) : l === "children" ? typeof s == "string" ? (n !== "textarea" || s !== "") && In(e, s) : typeof s == "number" && In(e, "" + s) : l !== "suppressContentEditableWarning" && l !== "suppressHydrationWarning" && l !== "autoFocus" && (Ln.hasOwnProperty(l) ? s != null && l === "onScroll" && F("scroll", e) : s != null && ql(e, l, s, i));
            }
            switch (n) {
              case "input":
                or(e), Ki(e, r, !1);
                break;
              case "textarea":
                or(e), Xi(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + ft(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, l = r.value, l != null ? Qt(e, !!r.multiple, l, !1) : r.defaultValue != null && Qt(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof o.onClick == "function" && (e.onclick = Ur);
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
      return oe(t), null;
    case 6:
      if (e && t.stateNode != null) Ku(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(w(166));
        if (n = Et(Bn.current), Et(Ue.current), pr(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[Fe] = t, (l = r.nodeValue !== n) && (e = xe, e !== null)) switch (e.tag) {
            case 3:
              fr(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && fr(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          l && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[Fe] = t, t.stateNode = r;
      }
      return oe(t), null;
    case 13:
      if ($(A), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (U && ge !== null && t.mode & 1 && !(t.flags & 128)) cu(), en(), t.flags |= 98560, l = !1;
        else if (l = pr(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!l) throw Error(w(318));
            if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(w(317));
            l[Fe] = t;
          } else en(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          oe(t), l = !1;
        } else Le !== null && (Hl(Le), Le = null), l = !0;
        if (!l) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || A.current & 1 ? G === 0 && (G = 3) : Ii())), t.updateQueue !== null && (t.flags |= 4), oe(t), null);
    case 4:
      return nn(), Dl(e, t), e === null && Un(t.stateNode.containerInfo), oe(t), null;
    case 10:
      return vi(t.type._context), oe(t), null;
    case 17:
      return me(t.type) && Ar(), oe(t), null;
    case 19:
      if ($(A), l = t.memoizedState, l === null) return oe(t), null;
      if (r = (t.flags & 128) !== 0, i = l.rendering, i === null) if (r) gn(l, !1);
      else {
        if (G !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (i = Yr(e), i !== null) {
            for (t.flags |= 128, gn(l, !1), r = i.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) l = n, e = r, l.flags &= 14680066, i = l.alternate, i === null ? (l.childLanes = 0, l.lanes = e, l.child = null, l.subtreeFlags = 0, l.memoizedProps = null, l.memoizedState = null, l.updateQueue = null, l.dependencies = null, l.stateNode = null) : (l.childLanes = i.childLanes, l.lanes = i.lanes, l.child = i.child, l.subtreeFlags = 0, l.deletions = null, l.memoizedProps = i.memoizedProps, l.memoizedState = i.memoizedState, l.updateQueue = i.updateQueue, l.type = i.type, e = i.dependencies, l.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return O(A, A.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        l.tail !== null && K() > on && (t.flags |= 128, r = !0, gn(l, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = Yr(i), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), gn(l, !0), l.tail === null && l.tailMode === "hidden" && !i.alternate && !U) return oe(t), null;
        } else 2 * K() - l.renderingStartTime > on && n !== 1073741824 && (t.flags |= 128, r = !0, gn(l, !1), t.lanes = 4194304);
        l.isBackwards ? (i.sibling = t.child, t.child = i) : (n = l.last, n !== null ? n.sibling = i : t.child = i, l.last = i);
      }
      return l.tail !== null ? (t = l.tail, l.rendering = t, l.tail = t.sibling, l.renderingStartTime = K(), t.sibling = null, n = A.current, O(A, r ? n & 1 | 2 : n & 1), t) : (oe(t), null);
    case 22:
    case 23:
      return Li(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? ve & 1073741824 && (oe(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : oe(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(w(156, t.tag));
}
function kf(e, t) {
  switch (fi(t), t.tag) {
    case 1:
      return me(t.type) && Ar(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return nn(), $(pe), $(ie), ki(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return wi(t), null;
    case 13:
      if ($(A), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(w(340));
        en();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return $(A), null;
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
var vr = !1, le = !1, Sf = typeof WeakSet == "function" ? WeakSet : Set, E = null;
function Bt(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    B(e, t, r);
  }
  else n.current = null;
}
function Ol(e, t, n) {
  try {
    n();
  } catch (r) {
    B(e, t, r);
  }
}
var Fa = !1;
function Ef(e, t) {
  if (yl = br, e = Zs(), di(e)) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else e: {
      n = (n = e.ownerDocument) && n.defaultView || window;
      var r = n.getSelection && n.getSelection();
      if (r && r.rangeCount !== 0) {
        n = r.anchorNode;
        var o = r.anchorOffset, l = r.focusNode;
        r = r.focusOffset;
        try {
          n.nodeType, l.nodeType;
        } catch {
          n = null;
          break e;
        }
        var i = 0, a = -1, s = -1, d = 0, v = 0, h = e, m = null;
        t: for (; ; ) {
          for (var x; h !== n || o !== 0 && h.nodeType !== 3 || (a = i + o), h !== l || r !== 0 && h.nodeType !== 3 || (s = i + r), h.nodeType === 3 && (i += h.nodeValue.length), (x = h.firstChild) !== null; )
            m = h, h = x;
          for (; ; ) {
            if (h === e) break t;
            if (m === n && ++d === o && (a = i), m === l && ++v === r && (s = i), (x = h.nextSibling) !== null) break;
            h = m, m = h.parentNode;
          }
          h = x;
        }
        n = a === -1 || s === -1 ? null : { start: a, end: s };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (wl = { focusedElem: e, selectionRange: n }, br = !1, E = t; E !== null; ) if (t = E, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, E = e;
  else for (; E !== null; ) {
    t = E;
    try {
      var y = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (y !== null) {
            var k = y.memoizedProps, _ = y.memoizedState, f = t.stateNode, u = f.getSnapshotBeforeUpdate(t.elementType === t.type ? k : Me(t.type, k), _);
            f.__reactInternalSnapshotBeforeUpdate = u;
          }
          break;
        case 3:
          var p = t.stateNode.containerInfo;
          p.nodeType === 1 ? p.textContent = "" : p.nodeType === 9 && p.documentElement && p.removeChild(p.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(w(163));
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
  return y = Fa, Fa = !1, y;
}
function Pn(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var o = r = r.next;
    do {
      if ((o.tag & e) === e) {
        var l = o.destroy;
        o.destroy = void 0, l !== void 0 && Ol(t, n, l);
      }
      o = o.next;
    } while (o !== r);
  }
}
function po(e, t) {
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
function bl(e) {
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
function Yu(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Yu(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Fe], delete t[Vn], delete t[El], delete t[of], delete t[lf])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function Xu(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function $a(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || Xu(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Fl(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Ur));
  else if (r !== 4 && (e = e.child, e !== null)) for (Fl(e, t, n), e = e.sibling; e !== null; ) Fl(e, t, n), e = e.sibling;
}
function $l(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for ($l(e, t, n), e = e.sibling; e !== null; ) $l(e, t, n), e = e.sibling;
}
var ee = null, Te = !1;
function qe(e, t, n) {
  for (n = n.child; n !== null; ) Gu(e, t, n), n = n.sibling;
}
function Gu(e, t, n) {
  if ($e && typeof $e.onCommitFiberUnmount == "function") try {
    $e.onCommitFiberUnmount(oo, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      le || Bt(n, t);
    case 6:
      var r = ee, o = Te;
      ee = null, qe(e, t, n), ee = r, Te = o, ee !== null && (Te ? (e = ee, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : ee.removeChild(n.stateNode));
      break;
    case 18:
      ee !== null && (Te ? (e = ee, n = n.stateNode, e.nodeType === 8 ? Ao(e.parentNode, n) : e.nodeType === 1 && Ao(e, n), bn(e)) : Ao(ee, n.stateNode));
      break;
    case 4:
      r = ee, o = Te, ee = n.stateNode.containerInfo, Te = !0, qe(e, t, n), ee = r, Te = o;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!le && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        o = r = r.next;
        do {
          var l = o, i = l.destroy;
          l = l.tag, i !== void 0 && (l & 2 || l & 4) && Ol(n, t, i), o = o.next;
        } while (o !== r);
      }
      qe(e, t, n);
      break;
    case 1:
      if (!le && (Bt(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
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
      n.mode & 1 ? (le = (r = le) || n.memoizedState !== null, qe(e, t, n), le = r) : qe(e, t, n);
      break;
    default:
      qe(e, t, n);
  }
}
function Ua(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new Sf()), t.forEach(function(r) {
      var o = Lf.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(o, o));
    });
  }
}
function Pe(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var o = n[r];
    try {
      var l = e, i = t, a = i;
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
      if (ee === null) throw Error(w(160));
      Gu(l, i, o), ee = null, Te = !1;
      var s = o.alternate;
      s !== null && (s.return = null), o.return = null;
    } catch (d) {
      B(o, t, d);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) qu(t, e), t = t.sibling;
}
function qu(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Pe(t, e), Oe(e), r & 4) {
        try {
          Pn(3, e, e.return), po(3, e);
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
        var o = e.stateNode;
        try {
          In(o, "");
        } catch (k) {
          B(e, e.return, k);
        }
      }
      if (r & 4 && (o = e.stateNode, o != null)) {
        var l = e.memoizedProps, i = n !== null ? n.memoizedProps : l, a = e.type, s = e.updateQueue;
        if (e.updateQueue = null, s !== null) try {
          a === "input" && l.type === "radio" && l.name != null && ys(o, l), ul(a, i);
          var d = ul(a, l);
          for (i = 0; i < s.length; i += 2) {
            var v = s[i], h = s[i + 1];
            v === "style" ? js(o, h) : v === "dangerouslySetInnerHTML" ? Ss(o, h) : v === "children" ? In(o, h) : ql(o, v, h, d);
          }
          switch (a) {
            case "input":
              ol(o, l);
              break;
            case "textarea":
              ws(o, l);
              break;
            case "select":
              var m = o._wrapperState.wasMultiple;
              o._wrapperState.wasMultiple = !!l.multiple;
              var x = l.value;
              x != null ? Qt(o, !!l.multiple, x, !1) : m !== !!l.multiple && (l.defaultValue != null ? Qt(
                o,
                !!l.multiple,
                l.defaultValue,
                !0
              ) : Qt(o, !!l.multiple, l.multiple ? [] : "", !1));
          }
          o[Vn] = l;
        } catch (k) {
          B(e, e.return, k);
        }
      }
      break;
    case 6:
      if (Pe(t, e), Oe(e), r & 4) {
        if (e.stateNode === null) throw Error(w(162));
        o = e.stateNode, l = e.memoizedProps;
        try {
          o.nodeValue = l;
        } catch (k) {
          B(e, e.return, k);
        }
      }
      break;
    case 3:
      if (Pe(t, e), Oe(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        bn(t.containerInfo);
      } catch (k) {
        B(e, e.return, k);
      }
      break;
    case 4:
      Pe(t, e), Oe(e);
      break;
    case 13:
      Pe(t, e), Oe(e), o = e.child, o.flags & 8192 && (l = o.memoizedState !== null, o.stateNode.isHidden = l, !l || o.alternate !== null && o.alternate.memoizedState !== null || (Mi = K())), r & 4 && Ua(e);
      break;
    case 22:
      if (v = n !== null && n.memoizedState !== null, e.mode & 1 ? (le = (d = le) || v, Pe(t, e), le = d) : Pe(t, e), Oe(e), r & 8192) {
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
                var y = m.stateNode;
                if (typeof y.componentWillUnmount == "function") {
                  r = m, n = m.return;
                  try {
                    t = r, y.props = t.memoizedProps, y.state = t.memoizedState, y.componentWillUnmount();
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
                  Va(h);
                  continue;
                }
            }
            x !== null ? (x.return = m, E = x) : Va(h);
          }
          v = v.sibling;
        }
        e: for (v = null, h = e; ; ) {
          if (h.tag === 5) {
            if (v === null) {
              v = h;
              try {
                o = h.stateNode, d ? (l = o.style, typeof l.setProperty == "function" ? l.setProperty("display", "none", "important") : l.display = "none") : (a = h.stateNode, s = h.memoizedProps.style, i = s != null && s.hasOwnProperty("display") ? s.display : null, a.style.display = Es("display", i));
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
      Pe(t, e), Oe(e), r & 4 && Ua(e);
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
          if (Xu(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(w(160));
      }
      switch (r.tag) {
        case 5:
          var o = r.stateNode;
          r.flags & 32 && (In(o, ""), r.flags &= -33);
          var l = $a(e);
          $l(e, l, o);
          break;
        case 3:
        case 4:
          var i = r.stateNode.containerInfo, a = $a(e);
          Fl(e, a, i);
          break;
        default:
          throw Error(w(161));
      }
    } catch (s) {
      B(e, e.return, s);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function jf(e, t, n) {
  E = e, Zu(e);
}
function Zu(e, t, n) {
  for (var r = (e.mode & 1) !== 0; E !== null; ) {
    var o = E, l = o.child;
    if (o.tag === 22 && r) {
      var i = o.memoizedState !== null || vr;
      if (!i) {
        var a = o.alternate, s = a !== null && a.memoizedState !== null || le;
        a = vr;
        var d = le;
        if (vr = i, (le = s) && !d) for (E = o; E !== null; ) i = E, s = i.child, i.tag === 22 && i.memoizedState !== null ? Ha(o) : s !== null ? (s.return = i, E = s) : Ha(o);
        for (; l !== null; ) E = l, Zu(l), l = l.sibling;
        E = o, vr = a, le = d;
      }
      Aa(e);
    } else o.subtreeFlags & 8772 && l !== null ? (l.return = o, E = l) : Aa(e);
  }
}
function Aa(e) {
  for (; E !== null; ) {
    var t = E;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            le || po(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !le) if (n === null) r.componentDidMount();
            else {
              var o = t.elementType === t.type ? n.memoizedProps : Me(t.type, n.memoizedProps);
              r.componentDidUpdate(o, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var l = t.updateQueue;
            l !== null && Ca(t, l, r);
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
              var s = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  s.autoFocus && n.focus();
                  break;
                case "img":
                  s.src && (n.src = s.src);
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
                  h !== null && bn(h);
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
            throw Error(w(163));
        }
        le || t.flags & 512 && bl(t);
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
function Va(e) {
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
function Ha(e) {
  for (; E !== null; ) {
    var t = E;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            po(4, t);
          } catch (s) {
            B(t, n, s);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var o = t.return;
            try {
              r.componentDidMount();
            } catch (s) {
              B(t, o, s);
            }
          }
          var l = t.return;
          try {
            bl(t);
          } catch (s) {
            B(t, l, s);
          }
          break;
        case 5:
          var i = t.return;
          try {
            bl(t);
          } catch (s) {
            B(t, i, s);
          }
      }
    } catch (s) {
      B(t, t.return, s);
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
var Cf = Math.ceil, qr = Ge.ReactCurrentDispatcher, _i = Ge.ReactCurrentOwner, Ce = Ge.ReactCurrentBatchConfig, I = 0, J = null, Y = null, te = 0, ve = 0, Wt = ht(0), G = 0, Yn = null, Pt = 0, mo = 0, Pi = 0, Mn = null, ce = null, Mi = 0, on = 1 / 0, Ae = null, Zr = !1, Ul = null, ut = null, gr = !1, rt = null, Jr = 0, Tn = 0, Al = null, Pr = -1, Mr = 0;
function se() {
  return I & 6 ? K() : Pr !== -1 ? Pr : Pr = K();
}
function dt(e) {
  return e.mode & 1 ? I & 2 && te !== 0 ? te & -te : sf.transition !== null ? (Mr === 0 && (Mr = Os()), Mr) : (e = D, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Hs(e.type)), e) : 1;
}
function Re(e, t, n, r) {
  if (50 < Tn) throw Tn = 0, Al = null, Error(w(185));
  Gn(e, n, r), (!(I & 2) || e !== J) && (e === J && (!(I & 2) && (mo |= n), G === 4 && tt(e, te)), he(e, r), n === 1 && I === 0 && !(t.mode & 1) && (on = K() + 500, uo && vt()));
}
function he(e, t) {
  var n = e.callbackNode;
  ac(e, t);
  var r = Or(e, e === J ? te : 0);
  if (r === 0) n !== null && Zi(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Zi(n), t === 1) e.tag === 0 ? af(Ba.bind(null, e)) : su(Ba.bind(null, e)), nf(function() {
      !(I & 6) && vt();
    }), n = null;
    else {
      switch (bs(r)) {
        case 1:
          n = ni;
          break;
        case 4:
          n = Rs;
          break;
        case 16:
          n = Dr;
          break;
        case 536870912:
          n = Ds;
          break;
        default:
          n = Dr;
      }
      n = id(n, Ju.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function Ju(e, t) {
  if (Pr = -1, Mr = 0, I & 6) throw Error(w(327));
  var n = e.callbackNode;
  if (qt() && e.callbackNode !== n) return null;
  var r = Or(e, e === J ? te : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = eo(e, r);
  else {
    t = r;
    var o = I;
    I |= 2;
    var l = td();
    (J !== e || te !== t) && (Ae = null, on = K() + 500, jt(e, t));
    do
      try {
        _f();
        break;
      } catch (a) {
        ed(e, a);
      }
    while (!0);
    hi(), qr.current = l, I = o, Y !== null ? t = 0 : (J = null, te = 0, t = G);
  }
  if (t !== 0) {
    if (t === 2 && (o = ml(e), o !== 0 && (r = o, t = Vl(e, o))), t === 1) throw n = Yn, jt(e, 0), tt(e, r), he(e, K()), n;
    if (t === 6) tt(e, r);
    else {
      if (o = e.current.alternate, !(r & 30) && !zf(o) && (t = eo(e, r), t === 2 && (l = ml(e), l !== 0 && (r = l, t = Vl(e, l))), t === 1)) throw n = Yn, jt(e, 0), tt(e, r), he(e, K()), n;
      switch (e.finishedWork = o, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(w(345));
        case 2:
          wt(e, ce, Ae);
          break;
        case 3:
          if (tt(e, r), (r & 130023424) === r && (t = Mi + 500 - K(), 10 < t)) {
            if (Or(e, 0) !== 0) break;
            if (o = e.suspendedLanes, (o & r) !== r) {
              se(), e.pingedLanes |= e.suspendedLanes & o;
              break;
            }
            e.timeoutHandle = Sl(wt.bind(null, e, ce, Ae), t);
            break;
          }
          wt(e, ce, Ae);
          break;
        case 4:
          if (tt(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, o = -1; 0 < r; ) {
            var i = 31 - Ie(r);
            l = 1 << i, i = t[i], i > o && (o = i), r &= ~l;
          }
          if (r = o, r = K() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * Cf(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = Sl(wt.bind(null, e, ce, Ae), r);
            break;
          }
          wt(e, ce, Ae);
          break;
        case 5:
          wt(e, ce, Ae);
          break;
        default:
          throw Error(w(329));
      }
    }
  }
  return he(e, K()), e.callbackNode === n ? Ju.bind(null, e) : null;
}
function Vl(e, t) {
  var n = Mn;
  return e.current.memoizedState.isDehydrated && (jt(e, t).flags |= 256), e = eo(e, t), e !== 2 && (t = ce, ce = n, t !== null && Hl(t)), e;
}
function Hl(e) {
  ce === null ? ce = e : ce.push.apply(ce, e);
}
function zf(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var o = n[r], l = o.getSnapshot;
        o = o.value;
        try {
          if (!De(l(), o)) return !1;
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
  for (t &= ~Pi, t &= ~mo, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - Ie(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Ba(e) {
  if (I & 6) throw Error(w(327));
  qt();
  var t = Or(e, 0);
  if (!(t & 1)) return he(e, K()), null;
  var n = eo(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = ml(e);
    r !== 0 && (t = r, n = Vl(e, r));
  }
  if (n === 1) throw n = Yn, jt(e, 0), tt(e, t), he(e, K()), n;
  if (n === 6) throw Error(w(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, wt(e, ce, Ae), he(e, K()), null;
}
function Ti(e, t) {
  var n = I;
  I |= 1;
  try {
    return e(t);
  } finally {
    I = n, I === 0 && (on = K() + 500, uo && vt());
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
  ve = Wt.current, $(Wt);
}
function jt(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, tf(n)), Y !== null) for (n = Y.return; n !== null; ) {
    var r = n;
    switch (fi(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && Ar();
        break;
      case 3:
        nn(), $(pe), $(ie), ki();
        break;
      case 5:
        wi(r);
        break;
      case 4:
        nn();
        break;
      case 13:
        $(A);
        break;
      case 19:
        $(A);
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
  if (J = e, Y = e = ct(e.current, null), te = ve = t, G = 0, Yn = null, Pi = mo = Pt = 0, ce = Mn = null, St !== null) {
    for (t = 0; t < St.length; t++) if (n = St[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var o = r.next, l = n.pending;
      if (l !== null) {
        var i = l.next;
        l.next = o, r.next = i;
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
      if (hi(), zr.current = Gr, Xr) {
        for (var r = V.memoizedState; r !== null; ) {
          var o = r.queue;
          o !== null && (o.pending = null), r = r.next;
        }
        Xr = !1;
      }
      if (_t = 0, Z = X = V = null, _n = !1, Wn = 0, _i.current = null, n === null || n.return === null) {
        G = 1, Yn = t, Y = null;
        break;
      }
      e: {
        var l = e, i = n.return, a = n, s = t;
        if (t = te, a.flags |= 32768, s !== null && typeof s == "object" && typeof s.then == "function") {
          var d = s, v = a, h = v.tag;
          if (!(v.mode & 1) && (h === 0 || h === 11 || h === 15)) {
            var m = v.alternate;
            m ? (v.updateQueue = m.updateQueue, v.memoizedState = m.memoizedState, v.lanes = m.lanes) : (v.updateQueue = null, v.memoizedState = null);
          }
          var x = Ta(i);
          if (x !== null) {
            x.flags &= -257, La(x, i, a, l, t), x.mode & 1 && Ma(l, d, t), t = x, s = d;
            var y = t.updateQueue;
            if (y === null) {
              var k = /* @__PURE__ */ new Set();
              k.add(s), t.updateQueue = k;
            } else y.add(s);
            break e;
          } else {
            if (!(t & 1)) {
              Ma(l, d, t), Ii();
              break e;
            }
            s = Error(w(426));
          }
        } else if (U && a.mode & 1) {
          var _ = Ta(i);
          if (_ !== null) {
            !(_.flags & 65536) && (_.flags |= 256), La(_, i, a, l, t), pi(rn(s, a));
            break e;
          }
        }
        l = s = rn(s, a), G !== 4 && (G = 2), Mn === null ? Mn = [l] : Mn.push(l), l = i;
        do {
          switch (l.tag) {
            case 3:
              l.flags |= 65536, t &= -t, l.lanes |= t;
              var f = bu(l, s, t);
              ja(l, f);
              break e;
            case 1:
              a = s;
              var u = l.type, p = l.stateNode;
              if (!(l.flags & 128) && (typeof u.getDerivedStateFromError == "function" || p !== null && typeof p.componentDidCatch == "function" && (ut === null || !ut.has(p)))) {
                l.flags |= 65536, t &= -t, l.lanes |= t;
                var g = Fu(l, a, t);
                ja(l, g);
                break e;
              }
          }
          l = l.return;
        } while (l !== null);
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
  (G === 0 || G === 3 || G === 2) && (G = 4), J === null || !(Pt & 268435455) && !(mo & 268435455) || tt(J, te);
}
function eo(e, t) {
  var n = I;
  I |= 2;
  var r = td();
  (J !== e || te !== t) && (Ae = null, jt(e, t));
  do
    try {
      Nf();
      break;
    } catch (o) {
      ed(e, o);
    }
  while (!0);
  if (hi(), I = n, qr.current = r, Y !== null) throw Error(w(261));
  return J = null, te = 0, G;
}
function Nf() {
  for (; Y !== null; ) nd(Y);
}
function _f() {
  for (; Y !== null && !Zd(); ) nd(Y);
}
function nd(e) {
  var t = ld(e.alternate, e, ve);
  e.memoizedProps = e.pendingProps, t === null ? rd(e) : Y = t, _i.current = null;
}
function rd(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = kf(n, t), n !== null) {
        n.flags &= 32767, Y = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        G = 6, Y = null;
        return;
      }
    } else if (n = wf(n, t, ve), n !== null) {
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
  var r = D, o = Ce.transition;
  try {
    Ce.transition = null, D = 1, Pf(e, t, n, r);
  } finally {
    Ce.transition = o, D = r;
  }
  return null;
}
function Pf(e, t, n, r) {
  do
    qt();
  while (rt !== null);
  if (I & 6) throw Error(w(327));
  n = e.finishedWork;
  var o = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(w(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var l = n.lanes | n.childLanes;
  if (sc(e, l), e === J && (Y = J = null, te = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || gr || (gr = !0, id(Dr, function() {
    return qt(), null;
  })), l = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || l) {
    l = Ce.transition, Ce.transition = null;
    var i = D;
    D = 1;
    var a = I;
    I |= 4, _i.current = null, Ef(e, n), qu(n, e), Yc(wl), br = !!yl, wl = yl = null, e.current = n, jf(n), Jd(), I = a, D = i, Ce.transition = l;
  } else e.current = n;
  if (gr && (gr = !1, rt = e, Jr = o), l = e.pendingLanes, l === 0 && (ut = null), nc(n.stateNode), he(e, K()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) o = t[n], r(o.value, { componentStack: o.stack, digest: o.digest });
  if (Zr) throw Zr = !1, e = Ul, Ul = null, e;
  return Jr & 1 && e.tag !== 0 && qt(), l = e.pendingLanes, l & 1 ? e === Al ? Tn++ : (Tn = 0, Al = e) : Tn = 0, vt(), null;
}
function qt() {
  if (rt !== null) {
    var e = bs(Jr), t = Ce.transition, n = D;
    try {
      if (Ce.transition = null, D = 16 > e ? 16 : e, rt === null) var r = !1;
      else {
        if (e = rt, rt = null, Jr = 0, I & 6) throw Error(w(331));
        var o = I;
        for (I |= 4, E = e.current; E !== null; ) {
          var l = E, i = l.child;
          if (E.flags & 16) {
            var a = l.deletions;
            if (a !== null) {
              for (var s = 0; s < a.length; s++) {
                var d = a[s];
                for (E = d; E !== null; ) {
                  var v = E;
                  switch (v.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Pn(8, v, l);
                  }
                  var h = v.child;
                  if (h !== null) h.return = v, E = h;
                  else for (; E !== null; ) {
                    v = E;
                    var m = v.sibling, x = v.return;
                    if (Yu(v), v === d) {
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
              var y = l.alternate;
              if (y !== null) {
                var k = y.child;
                if (k !== null) {
                  y.child = null;
                  do {
                    var _ = k.sibling;
                    k.sibling = null, k = _;
                  } while (k !== null);
                }
              }
              E = l;
            }
          }
          if (l.subtreeFlags & 2064 && i !== null) i.return = l, E = i;
          else e: for (; E !== null; ) {
            if (l = E, l.flags & 2048) switch (l.tag) {
              case 0:
              case 11:
              case 15:
                Pn(9, l, l.return);
            }
            var f = l.sibling;
            if (f !== null) {
              f.return = l.return, E = f;
              break e;
            }
            E = l.return;
          }
        }
        var u = e.current;
        for (E = u; E !== null; ) {
          i = E;
          var p = i.child;
          if (i.subtreeFlags & 2064 && p !== null) p.return = i, E = p;
          else e: for (i = u; E !== null; ) {
            if (a = E, a.flags & 2048) try {
              switch (a.tag) {
                case 0:
                case 11:
                case 15:
                  po(9, a);
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
        if (I = o, vt(), $e && typeof $e.onPostCommitFiberRoot == "function") try {
          $e.onPostCommitFiberRoot(oo, e);
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
  t = rn(n, t), t = bu(e, t, 1), e = st(e, t, 1), t = se(), e !== null && (Gn(e, 1, t), he(e, t));
}
function B(e, t, n) {
  if (e.tag === 3) Wa(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      Wa(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (ut === null || !ut.has(r))) {
        e = rn(n, e), e = Fu(t, e, 1), t = st(t, e, 1), e = se(), t !== null && (Gn(t, 1, e), he(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function Mf(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = se(), e.pingedLanes |= e.suspendedLanes & n, J === e && (te & n) === n && (G === 4 || G === 3 && (te & 130023424) === te && 500 > K() - Mi ? jt(e, 0) : Pi |= n), he(e, t);
}
function od(e, t) {
  t === 0 && (e.mode & 1 ? (t = ar, ar <<= 1, !(ar & 130023424) && (ar = 4194304)) : t = 1);
  var n = se();
  e = Ye(e, t), e !== null && (Gn(e, t, n), he(e, n));
}
function Tf(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), od(e, n);
}
function Lf(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode, o = e.memoizedState;
      o !== null && (n = o.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(w(314));
  }
  r !== null && r.delete(t), od(e, n);
}
var ld;
ld = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || pe.current) fe = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return fe = !1, yf(e, t, n);
    fe = !!(e.flags & 131072);
  }
  else fe = !1, U && t.flags & 1048576 && uu(t, Br, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      _r(e, t), e = t.pendingProps;
      var o = Jt(t, ie.current);
      Gt(t, n), o = Ei(null, t, r, e, o, n);
      var l = ji();
      return t.flags |= 1, typeof o == "object" && o !== null && typeof o.render == "function" && o.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, me(r) ? (l = !0, Vr(t)) : l = !1, t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, xi(t), o.updater = fo, t.stateNode = o, o._reactInternals = t, Pl(t, r, e, n), t = Ll(null, t, r, !0, l, n)) : (t.tag = 0, U && l && ci(t), ae(null, t, o, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (_r(e, t), e = t.pendingProps, o = r._init, r = o(r._payload), t.type = r, o = t.tag = Rf(r), e = Me(r, e), o) {
          case 0:
            t = Tl(null, t, r, e, n);
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
        throw Error(w(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : Me(r, o), Tl(e, t, r, o, n);
    case 1:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : Me(r, o), Da(e, t, r, o, n);
    case 3:
      e: {
        if (Vu(t), e === null) throw Error(w(387));
        r = t.pendingProps, l = t.memoizedState, o = l.element, hu(e, t), Kr(t, r, null, n);
        var i = t.memoizedState;
        if (r = i.element, l.isDehydrated) if (l = { element: r, isDehydrated: !1, cache: i.cache, pendingSuspenseBoundaries: i.pendingSuspenseBoundaries, transitions: i.transitions }, t.updateQueue.baseState = l, t.memoizedState = l, t.flags & 256) {
          o = rn(Error(w(423)), t), t = Oa(e, t, r, n, o);
          break e;
        } else if (r !== o) {
          o = rn(Error(w(424)), t), t = Oa(e, t, r, n, o);
          break e;
        } else for (ge = at(t.stateNode.containerInfo.firstChild), xe = t, U = !0, Le = null, n = pu(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (en(), r === o) {
            t = Xe(e, t, n);
            break e;
          }
          ae(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return vu(t), e === null && zl(t), r = t.type, o = t.pendingProps, l = e !== null ? e.memoizedProps : null, i = o.children, kl(r, o) ? i = null : l !== null && kl(r, l) && (t.flags |= 32), Au(e, t), ae(e, t, i, n), t.child;
    case 6:
      return e === null && zl(t), null;
    case 13:
      return Hu(e, t, n);
    case 4:
      return yi(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = tn(t, null, r, n) : ae(e, t, r, n), t.child;
    case 11:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : Me(r, o), Ia(e, t, r, o, n);
    case 7:
      return ae(e, t, t.pendingProps, n), t.child;
    case 8:
      return ae(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return ae(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, o = t.pendingProps, l = t.memoizedProps, i = o.value, O(Wr, r._currentValue), r._currentValue = i, l !== null) if (De(l.value, i)) {
          if (l.children === o.children && !pe.current) {
            t = Xe(e, t, n);
            break e;
          }
        } else for (l = t.child, l !== null && (l.return = t); l !== null; ) {
          var a = l.dependencies;
          if (a !== null) {
            i = l.child;
            for (var s = a.firstContext; s !== null; ) {
              if (s.context === r) {
                if (l.tag === 1) {
                  s = We(-1, n & -n), s.tag = 2;
                  var d = l.updateQueue;
                  if (d !== null) {
                    d = d.shared;
                    var v = d.pending;
                    v === null ? s.next = s : (s.next = v.next, v.next = s), d.pending = s;
                  }
                }
                l.lanes |= n, s = l.alternate, s !== null && (s.lanes |= n), Nl(
                  l.return,
                  n,
                  t
                ), a.lanes |= n;
                break;
              }
              s = s.next;
            }
          } else if (l.tag === 10) i = l.type === t.type ? null : l.child;
          else if (l.tag === 18) {
            if (i = l.return, i === null) throw Error(w(341));
            i.lanes |= n, a = i.alternate, a !== null && (a.lanes |= n), Nl(i, n, t), i = l.sibling;
          } else i = l.child;
          if (i !== null) i.return = l;
          else for (i = l; i !== null; ) {
            if (i === t) {
              i = null;
              break;
            }
            if (l = i.sibling, l !== null) {
              l.return = i.return, i = l;
              break;
            }
            i = i.return;
          }
          l = i;
        }
        ae(e, t, o.children, n), t = t.child;
      }
      return t;
    case 9:
      return o = t.type, r = t.pendingProps.children, Gt(t, n), o = ze(o), r = r(o), t.flags |= 1, ae(e, t, r, n), t.child;
    case 14:
      return r = t.type, o = Me(r, t.pendingProps), o = Me(r.type, o), Ra(e, t, r, o, n);
    case 15:
      return $u(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, o = t.pendingProps, o = t.elementType === r ? o : Me(r, o), _r(e, t), t.tag = 1, me(r) ? (e = !0, Vr(t)) : e = !1, Gt(t, n), Ou(t, r, o), Pl(t, r, o, n), Ll(null, t, r, !0, e, n);
    case 19:
      return Bu(e, t, n);
    case 22:
      return Uu(e, t, n);
  }
  throw Error(w(156, t.tag));
};
function id(e, t) {
  return Is(e, t);
}
function If(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function je(e, t, n, r) {
  return new If(e, t, n, r);
}
function Ri(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function Rf(e) {
  if (typeof e == "function") return Ri(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Jl) return 11;
    if (e === ei) return 14;
  }
  return 2;
}
function ct(e, t) {
  var n = e.alternate;
  return n === null ? (n = je(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function Tr(e, t, n, r, o, l) {
  var i = 2;
  if (r = e, typeof e == "function") Ri(e) && (i = 1);
  else if (typeof e == "string") i = 5;
  else e: switch (e) {
    case Dt:
      return Ct(n.children, o, l, t);
    case Zl:
      i = 8, o |= 8;
      break;
    case Jo:
      return e = je(12, n, t, o | 2), e.elementType = Jo, e.lanes = l, e;
    case el:
      return e = je(13, n, t, o), e.elementType = el, e.lanes = l, e;
    case tl:
      return e = je(19, n, t, o), e.elementType = tl, e.lanes = l, e;
    case vs:
      return ho(n, o, l, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case ms:
          i = 10;
          break e;
        case hs:
          i = 9;
          break e;
        case Jl:
          i = 11;
          break e;
        case ei:
          i = 14;
          break e;
        case Ze:
          i = 16, r = null;
          break e;
      }
      throw Error(w(130, e == null ? e : typeof e, ""));
  }
  return t = je(i, n, t, o), t.elementType = e, t.type = r, t.lanes = l, t;
}
function Ct(e, t, n, r) {
  return e = je(7, e, r, t), e.lanes = n, e;
}
function ho(e, t, n, r) {
  return e = je(22, e, r, t), e.elementType = vs, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function Xo(e, t, n) {
  return e = je(6, e, null, t), e.lanes = n, e;
}
function Go(e, t, n) {
  return t = je(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function Df(e, t, n, r, o) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Mo(0), this.expirationTimes = Mo(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Mo(0), this.identifierPrefix = r, this.onRecoverableError = o, this.mutableSourceEagerHydrationData = null;
}
function Di(e, t, n, r, o, l, i, a, s) {
  return e = new Df(e, t, n, a, s), t === 1 ? (t = 1, l === !0 && (t |= 8)) : t = 0, l = je(3, null, null, t), e.current = l, l.stateNode = e, l.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, xi(l), e;
}
function Of(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: Rt, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function ad(e) {
  if (!e) return pt;
  e = e._reactInternals;
  e: {
    if (Lt(e) !== e || e.tag !== 1) throw Error(w(170));
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
    throw Error(w(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (me(n)) return au(e, n, t);
  }
  return t;
}
function sd(e, t, n, r, o, l, i, a, s) {
  return e = Di(n, r, !0, e, o, l, i, a, s), e.context = ad(null), n = e.current, r = se(), o = dt(n), l = We(r, o), l.callback = t ?? null, st(n, l, o), e.current.lanes = o, Gn(e, o, r), he(e, r), e;
}
function vo(e, t, n, r) {
  var o = t.current, l = se(), i = dt(o);
  return n = ad(n), t.context === null ? t.context = n : t.pendingContext = n, t = We(l, i), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = st(o, t, i), e !== null && (Re(e, o, i, l), Cr(e, o, i)), i;
}
function to(e) {
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
function bf() {
  return null;
}
var ud = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function bi(e) {
  this._internalRoot = e;
}
go.prototype.render = bi.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(w(409));
  vo(e, t, null, null);
};
go.prototype.unmount = bi.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Mt(function() {
      vo(null, e, null, null);
    }), t[Ke] = null;
  }
};
function go(e) {
  this._internalRoot = e;
}
go.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Us();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < et.length && t !== 0 && t < et[n].priority; n++) ;
    et.splice(n, 0, e), n === 0 && Vs(e);
  }
};
function Fi(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function xo(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function Ka() {
}
function Ff(e, t, n, r, o) {
  if (o) {
    if (typeof r == "function") {
      var l = r;
      r = function() {
        var d = to(i);
        l.call(d);
      };
    }
    var i = sd(t, r, e, 0, null, !1, !1, "", Ka);
    return e._reactRootContainer = i, e[Ke] = i.current, Un(e.nodeType === 8 ? e.parentNode : e), Mt(), i;
  }
  for (; o = e.lastChild; ) e.removeChild(o);
  if (typeof r == "function") {
    var a = r;
    r = function() {
      var d = to(s);
      a.call(d);
    };
  }
  var s = Di(e, 0, !1, null, null, !1, !1, "", Ka);
  return e._reactRootContainer = s, e[Ke] = s.current, Un(e.nodeType === 8 ? e.parentNode : e), Mt(function() {
    vo(t, s, n, r);
  }), s;
}
function yo(e, t, n, r, o) {
  var l = n._reactRootContainer;
  if (l) {
    var i = l;
    if (typeof o == "function") {
      var a = o;
      o = function() {
        var s = to(i);
        a.call(s);
      };
    }
    vo(t, i, e, o);
  } else i = Ff(n, t, e, o, r);
  return to(i);
}
Fs = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = kn(t.pendingLanes);
        n !== 0 && (ri(t, n | 1), he(t, K()), !(I & 6) && (on = K() + 500, vt()));
      }
      break;
    case 13:
      Mt(function() {
        var r = Ye(e, 1);
        if (r !== null) {
          var o = se();
          Re(r, e, 1, o);
        }
      }), Oi(e, 1);
  }
};
oi = function(e) {
  if (e.tag === 13) {
    var t = Ye(e, 134217728);
    if (t !== null) {
      var n = se();
      Re(t, e, 134217728, n);
    }
    Oi(e, 134217728);
  }
};
$s = function(e) {
  if (e.tag === 13) {
    var t = dt(e), n = Ye(e, t);
    if (n !== null) {
      var r = se();
      Re(n, e, t, r);
    }
    Oi(e, t);
  }
};
Us = function() {
  return D;
};
As = function(e, t) {
  var n = D;
  try {
    return D = e, t();
  } finally {
    D = n;
  }
};
cl = function(e, t, n) {
  switch (t) {
    case "input":
      if (ol(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var o = so(r);
            if (!o) throw Error(w(90));
            xs(r), ol(r, o);
          }
        }
      }
      break;
    case "textarea":
      ws(e, n);
      break;
    case "select":
      t = n.value, t != null && Qt(e, !!n.multiple, t, !1);
  }
};
Ns = Ti;
_s = Mt;
var $f = { usingClientEntryPoint: !1, Events: [Zn, $t, so, Cs, zs, Ti] }, xn = { findFiberByHostInstance: kt, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Uf = { bundleType: xn.bundleType, version: xn.version, rendererPackageName: xn.rendererPackageName, rendererConfig: xn.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: Ge.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = Ts(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: xn.findFiberByHostInstance || bf, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var xr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!xr.isDisabled && xr.supportsFiber) try {
    oo = xr.inject(Uf), $e = xr;
  } catch {
  }
}
we.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = $f;
we.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Fi(t)) throw Error(w(200));
  return Of(e, t, null, n);
};
we.createRoot = function(e, t) {
  if (!Fi(e)) throw Error(w(299));
  var n = !1, r = "", o = ud;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = Di(e, 1, !1, null, null, n, !1, r, o), e[Ke] = t.current, Un(e.nodeType === 8 ? e.parentNode : e), new bi(t);
};
we.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(w(188)) : (e = Object.keys(e).join(","), Error(w(268, e)));
  return e = Ts(t), e = e === null ? null : e.stateNode, e;
};
we.flushSync = function(e) {
  return Mt(e);
};
we.hydrate = function(e, t, n) {
  if (!xo(t)) throw Error(w(200));
  return yo(null, e, t, !0, n);
};
we.hydrateRoot = function(e, t, n) {
  if (!Fi(e)) throw Error(w(405));
  var r = n != null && n.hydratedSources || null, o = !1, l = "", i = ud;
  if (n != null && (n.unstable_strictMode === !0 && (o = !0), n.identifierPrefix !== void 0 && (l = n.identifierPrefix), n.onRecoverableError !== void 0 && (i = n.onRecoverableError)), t = sd(t, null, e, 1, n ?? null, o, !1, l, i), e[Ke] = t.current, Un(e), r) for (e = 0; e < r.length; e++) n = r[e], o = n._getVersion, o = o(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, o] : t.mutableSourceEagerHydrationData.push(
    n,
    o
  );
  return new go(t);
};
we.render = function(e, t, n) {
  if (!xo(t)) throw Error(w(200));
  return yo(null, e, t, !1, n);
};
we.unmountComponentAtNode = function(e) {
  if (!xo(e)) throw Error(w(40));
  return e._reactRootContainer ? (Mt(function() {
    yo(null, null, e, !1, function() {
      e._reactRootContainer = null, e[Ke] = null;
    });
  }), !0) : !1;
};
we.unstable_batchedUpdates = Ti;
we.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!xo(n)) throw Error(w(200));
  if (e == null || e._reactInternals === void 0) throw Error(w(38));
  return yo(e, t, n, !1, r);
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
dd(), ds.exports = we;
var Af = ds.exports, Vf, Ya = Af;
Vf = Ya.createRoot, Ya.hydrateRoot;
const fp = ':root{--td-bg: var(--theme-canvas, #1e1f22);--td-surface: var(--theme-surface, #25262a);--td-surface-hi: var(--theme-surface-hi, #2d2f34);--td-elevated: var(--theme-panel-elevated-bg, var(--td-surface-hi));--td-ink: var(--theme-ink, #e8e8ea);--td-dim: var(--theme-ink-dim, #b4b6bc);--td-muted: var(--theme-muted, #8a8d94);--td-border: var(--theme-border, #34363c);--td-border-hi: var(--theme-border-hi, #45484f);--td-accent: var(--theme-accent, #e44332);--td-accent-fg: var(--theme-accent-fg, #ffffff);--td-accent-soft: var(--theme-accent-soft, color-mix(in srgb, var(--td-accent) 16%, transparent));--td-hover: var(--theme-row-hover-bg, color-mix(in srgb, var(--td-ink) 5.5%, transparent));--td-selected: var(--theme-row-selected-bg, color-mix(in srgb, var(--td-accent) 13%, transparent));--td-danger: var(--theme-danger, #e5534b);--td-focus: var(--theme-focus-ring, var(--td-accent));--td-input-bg: var(--theme-input-bg, var(--td-surface));--td-input-border: var(--theme-input-border, var(--td-border));--td-font: var(--theme-app-font, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif);--td-mono: var(--theme-font-code, ui-monospace, "SF Mono", Menlo, monospace);--td-brand: #e44332;--td-radius: 8px;--td-shadow: 0 10px 30px -8px rgb(0 0 0 / .45), 0 2px 6px rgb(0 0 0 / .18);--tone-overdue: #e5534b;--tone-today: #2fa84f;--tone-tomorrow: #d9822b;--tone-week: #9d6cf0;--tone-future: var(--td-dim);--td-p1: #d1453b;--td-p2: #eb8909;--td-p3: #246fe0}:root[data-td-theme=todoist]{--td-bg: #ffffff;--td-surface: #fcfaf8;--td-surface-hi: #f8f5f2;--td-elevated: #ffffff;--td-ink: #202020;--td-dim: #666666;--td-muted: #999999;--td-border: #eeeeee;--td-border-hi: #e6e6e6;--td-accent: #dc4c3e;--td-accent-fg: #ffffff;--td-accent-soft: #ffefe5;--td-hover: #f2efed;--td-selected: #ffefe5;--td-danger: #dc4c3e;--td-focus: #dc4c3e;--td-input-bg: #ffffff;--td-input-border: #e6e6e6;--td-font: -apple-system, "system-ui", "Segoe UI", "Noto Sans", system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";--td-brand: #e44232;--td-shadow: 0 8px 24px -6px rgb(0 0 0 / .16), 0 1px 4px rgb(0 0 0 / .08);--tone-overdue: #d1453b;--tone-today: #058527;--tone-tomorrow: #ad6200;--tone-week: #692ec2;--td-p1: #d1453b;--td-p2: #eb8909;--td-p3: #246fe0}:root[data-td-theme=todoist][data-td-mode=dark]{--td-bg: #1f1f1f;--td-surface: #262626;--td-surface-hi: #322f2a;--td-elevated: #282828;--td-ink: #ffffff;--td-dim: #cccccc;--td-muted: #808080;--td-border: #3d3d3d;--td-border-hi: #4b4b4b;--td-accent: #de4c4a;--td-accent-soft: #472525;--td-hover: #322f2a;--td-selected: #472525;--td-danger: #de4c4a;--td-focus: #e26a60;--td-input-bg: #282828;--td-input-border: #3d3d3d;--td-shadow: 0 10px 30px -8px rgb(0 0 0 / .6), 0 2px 6px rgb(0 0 0 / .3);--tone-overdue: #ff7066;--tone-today: #25b84c;--tone-tomorrow: #ff9a14;--tone-week: #a970ff;--td-p1: #ff7066;--td-p2: #ff9a13;--td-p3: #5297ff}:root[data-td-theme=todoist] .td-nav-item.is-active{color:#d33322}:root[data-td-theme=todoist][data-td-mode=dark] .td-nav-item.is-active{color:#e26a60}:root:not([data-td-theme=agent-code]) .td-mark-own,:root[data-td-theme=agent-code] .td-mark-todoist{display:none}*{box-sizing:border-box}html,body{margin:0;height:100%}body{background:var(--td-bg);color:var(--td-ink);font-family:var(--td-font);font-size:13px;line-height:1.45;-webkit-font-smoothing:antialiased}button,input,textarea,select{font:inherit;color:inherit}button{cursor:pointer}button:disabled{cursor:default;opacity:.55}:focus-visible{outline:2px solid var(--td-focus);outline-offset:1px;border-radius:6px}code{font-family:var(--td-mono);font-size:.92em;background:var(--td-surface-hi);border-radius:4px;padding:.05em .35em}kbd{font-family:var(--td-mono);font-size:10.5px;min-width:18px;display:inline-flex;justify-content:center;padding:1px 5px;border-radius:4px;border:1px solid var(--td-border-hi);border-bottom-width:2px;color:var(--td-dim);background:var(--td-surface)}.td-root{height:100vh;display:flex;flex-direction:column;overflow:hidden;position:relative}.td-dim{color:var(--td-muted)}.td-small{font-size:11.5px}.td-warn{color:var(--td-danger);background:color-mix(in srgb,var(--td-danger) 10%,transparent);border:1px solid color-mix(in srgb,var(--td-danger) 30%,transparent);padding:8px 10px;border-radius:var(--td-radius);margin:10px 0 0;font-size:12.5px;white-space:pre-wrap}.td-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 12px;border-radius:6px;border:1px solid var(--td-border-hi);background:var(--td-surface);font-weight:500;font-size:12.5px;white-space:nowrap;transition:background .12s,border-color .12s,color .12s}.td-btn:hover:not(:disabled){background:var(--td-surface-hi)}.td-btn-primary{background:var(--td-accent);border-color:transparent;color:var(--td-accent-fg)}.td-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--td-accent) 86%,black)}.td-btn-danger{background:var(--td-danger);border-color:transparent;color:#fff}.td-btn-ghost{background:transparent;border-color:transparent;color:var(--td-dim)}.td-btn-ghost:hover:not(:disabled){background:var(--td-hover);color:var(--td-ink)}.td-btn-lg{height:36px;padding:0 18px;font-size:13.5px;border-radius:8px}.td-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;border:0;background:transparent;color:var(--td-muted);flex:none;transition:background .12s,color .12s}.td-icon-btn:hover{background:var(--td-hover);color:var(--td-ink)}.td-icon-btn.sm{width:22px;height:22px;border-radius:5px}.td-icon-btn.danger:hover{color:var(--td-danger)}.td-icon-btn.is-spinning svg{animation:td-spin .9s linear infinite}.td-spinner{width:13px;height:13px;border-radius:50%;display:inline-block;flex:none;border:2px solid color-mix(in srgb,currentColor 25%,transparent);border-top-color:currentColor;animation:td-spin .7s linear infinite;vertical-align:-2px}@keyframes td-spin{to{transform:rotate(360deg)}}.td-dot{width:9px;height:9px;border-radius:50%;display:inline-block;flex:none}.td-dot.sm{width:7px;height:7px}.td-dot.lg{width:11px;height:11px}.td-skel{display:block;height:11px;border-radius:5px;background:linear-gradient(90deg,var(--td-surface-hi),color-mix(in srgb,var(--td-surface-hi) 60%,var(--td-border-hi)),var(--td-surface-hi));background-size:200% 100%;animation:td-shimmer 1.3s ease-in-out infinite}.td-skel.sm{height:8px;margin-top:7px;opacity:.7}@keyframes td-shimmer{0%{background-position:100% 0}to{background-position:-100% 0}}.td-layout{flex:1;display:flex;min-height:0;position:relative}.td-sidebar{width:236px;flex:none;overflow-y:auto;padding:10px 8px 0;background:var(--td-surface);border-right:1px solid var(--td-border);display:flex;flex-direction:column;gap:6px}.is-narrow .td-sidebar{position:absolute;z-index:30;top:0;bottom:0;left:0;width:min(260px,86vw);box-shadow:var(--td-shadow);animation:td-slide-in .16s ease-out}@keyframes td-slide-in{0%{transform:translate(-12px);opacity:.4}}.td-scrim{position:absolute;inset:0;z-index:25;background:#00000059;animation:td-fade .15s}@keyframes td-fade{0%{opacity:0}}.td-nav-group{display:flex;flex-direction:column;gap:1px}.td-nav-item{display:flex;align-items:center;gap:9px;width:100%;min-height:30px;padding:4px 8px;border:0;border-radius:6px;background:transparent;text-align:left;color:var(--td-ink)}.td-nav-item:hover{background:var(--td-hover)}.td-nav-item.is-active{background:var(--td-selected);color:var(--td-ink);font-weight:600}.td-nav-item kbd{margin-left:auto}.td-nav-icon{width:18px;display:inline-flex;justify-content:center;color:var(--td-muted);flex:none}.td-nav-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-nav-count{font-size:11px;color:var(--td-muted);font-variant-numeric:tabular-nums}.td-nav-heading{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding:0 2px 2px 4px}.td-nav-heading-btn{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:2px 4px;border-radius:5px;font-size:11.5px;font-weight:600;color:var(--td-muted);letter-spacing:.01em}.td-nav-heading-btn:hover{color:var(--td-ink);background:var(--td-hover)}.td-nav-heading-btn svg{transition:transform .15s}.td-nav-heading-btn svg.is-collapsed{transform:rotate(-90deg)}.td-nav-heading .td-icon-btn{opacity:0}.td-nav-group:hover .td-nav-heading .td-icon-btn,.td-nav-heading .td-icon-btn:focus-visible{opacity:1}.td-nav-empty{color:var(--td-muted);font-size:12px;padding:4px 10px 4px 35px}.td-nav-add{display:flex;flex-direction:column;gap:8px;padding:6px 6px 8px;margin:2px 0;background:var(--td-bg);border:1px solid var(--td-border);border-radius:var(--td-radius)}.td-nav-add input{height:30px;padding:0 8px;border-radius:6px;border:1px solid var(--td-input-border);background:var(--td-input-bg);outline:none}.td-nav-add input:focus{border-color:var(--td-focus)}.td-nav-add-actions{display:flex;justify-content:flex-end;gap:6px}.td-swatches{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}.td-swatch{aspect-ratio:1;border-radius:50%;border:2px solid transparent;padding:0}.td-swatch.is-on{border-color:var(--td-ink);box-shadow:0 0 0 1px var(--td-bg) inset}.td-account{margin-top:auto;display:flex;align-items:center;gap:8px;padding:10px 6px;border-top:1px solid var(--td-border);position:sticky;bottom:0;background:var(--td-surface)}.td-avatar{width:24px;height:24px;border-radius:50%;background:var(--td-accent);color:var(--td-accent-fg);display:grid;place-items:center;font-weight:700;font-size:11px;flex:none}.td-account-text{flex:1;min-width:0;display:flex;flex-direction:column;font-size:12px}.td-account-text>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-main{flex:1;min-width:0;display:flex;flex-direction:column}.td-header{display:flex;align-items:center;gap:8px;padding:10px 14px 6px 10px;min-height:48px}.td-title{flex:1;min-width:0;display:flex;align-items:center;gap:8px}.td-title h1{margin:0;font-size:18px;font-weight:700;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-title-count{color:var(--td-muted);font-size:12.5px;font-variant-numeric:tabular-nums}.td-header-tools{display:flex;gap:2px;margin-left:auto}.td-search{flex:1;display:flex;align-items:center;gap:8px;height:32px;padding:0 6px 0 10px;border-radius:8px;border:1px solid var(--td-focus);background:var(--td-input-bg);color:var(--td-muted)}.td-search input{flex:1;border:0;outline:none;background:transparent;color:var(--td-ink);font-size:14px}.td-add-row{padding:2px 14px 8px}.td-quickadd-field{display:flex;align-items:center;gap:8px;height:38px;padding:0 5px 0 10px;border:1px solid var(--td-input-border);border-radius:9px;background:var(--td-input-bg);transition:border-color .12s,box-shadow .12s}.td-quickadd-field:focus-within{border-color:var(--td-focus);box-shadow:0 0 0 3px color-mix(in srgb,var(--td-focus) 18%,transparent)}.td-quickadd-plus{color:var(--td-accent);display:inline-flex}.td-quickadd-stack{position:relative;flex:1;min-width:0;height:100%}.td-quickadd-mirror,.td-quickadd-input{position:absolute;inset:0;padding:0;margin:0;border:0;font:inherit;font-size:13.5px;line-height:36px;letter-spacing:normal;white-space:pre}.td-quickadd-mirror{overflow:hidden;color:var(--td-ink);pointer-events:none}.td-quickadd-input{width:100%;background:transparent;color:transparent;caret-color:var(--td-ink);outline:none}.td-quickadd-input::placeholder{color:var(--td-muted)}.td-quickadd-input::selection{background:color-mix(in srgb,var(--td-accent) 30%,transparent);color:transparent}.td-quickadd-submit{height:28px;padding:0 14px}.td-quickadd-hint{display:flex;gap:12px;justify-content:space-between;padding:5px 4px 0;font-size:11.5px;color:var(--td-dim)}.td-quickadd-hint b{color:var(--td-ink);font-weight:600}.tok-priority,.tok-project,.tok-label,.tok-section,.tok-assignee,.tok-deadline,.tok-date{border-radius:4px;box-decoration-break:clone}.tok-date{background:color-mix(in srgb,var(--tone-today) 20%,transparent);color:color-mix(in srgb,var(--tone-today) 70%,var(--td-ink))}.tok-priority{background:color-mix(in srgb,#d1453b 22%,transparent);color:color-mix(in srgb,#d1453b 70%,var(--td-ink))}.tok-project,.tok-section{background:color-mix(in srgb,#246fe0 22%,transparent);color:color-mix(in srgb,#4b8cf0 75%,var(--td-ink))}.tok-label{background:color-mix(in srgb,var(--tone-week) 22%,transparent);color:color-mix(in srgb,var(--tone-week) 70%,var(--td-ink))}.tok-assignee,.tok-deadline{background:color-mix(in srgb,var(--tone-tomorrow) 22%,transparent);color:color-mix(in srgb,var(--tone-tomorrow) 70%,var(--td-ink))}.tok-description{color:var(--td-muted)}.td-list{flex:1;overflow-y:auto;padding:0 6px 60px;scroll-padding:40px}.td-group{margin-bottom:10px}.td-group-title{position:sticky;top:0;z-index:2;display:flex;align-items:baseline;gap:8px;margin:0;padding:12px 10px 6px;font-size:12.5px;font-weight:700;background:linear-gradient(var(--td-bg) 78%,transparent);border-bottom:1px solid var(--td-border)}.td-group-title.tone-overdue{color:var(--tone-overdue)}.td-group-sub{font-weight:500;color:var(--td-muted);font-size:11.5px}.td-group-count{margin-left:auto;font-weight:500;color:var(--td-muted);font-size:11px;font-variant-numeric:tabular-nums}.td-task{position:relative;display:flex;align-items:flex-start;gap:10px;padding:7px 10px 7px 12px;cursor:default;overflow:hidden;border-bottom:1px solid var(--td-border)}.td-task:hover{background:var(--td-hover)}.td-task.is-focused{background:var(--td-selected)}.td-task.is-pending{opacity:.6}.td-task.is-collapsing{animation:td-collapse .2s cubic-bezier(.2,0,0,1) forwards;pointer-events:none}@keyframes td-collapse{0%{max-height:var(--row-h, 60px);opacity:1}to{max-height:0;opacity:0;padding-top:0;padding-bottom:0;border-bottom-width:0}}.td-task.is-checked .td-checkbox{animation:td-check-pop .22s ease-out}@keyframes td-check-pop{40%{transform:scale(1.18)}}.td-task.is-done .td-task-title{color:var(--td-muted);text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--td-muted) 60%,transparent)}.td-task.is-skeleton{pointer-events:none}.td-task-main{flex:1;min-width:0;padding-top:1px}.td-task-title{font-size:13.5px;line-height:1.4;overflow-wrap:anywhere}.td-task-title strong{font-weight:650}.td-task-desc{color:var(--td-muted);font-size:12px;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-task-meta{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:3px}.td-task-meta:empty{display:none}.td-chip{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--td-muted);white-space:nowrap}.td-chip svg{flex:none}.td-project-chip{margin-left:auto}.td-due.tone-overdue,.tone-overdue.td-prop-value{color:var(--tone-overdue)}.td-due.tone-today,.tone-today.td-prop-value{color:var(--tone-today)}.td-due.tone-tomorrow,.tone-tomorrow.td-prop-value{color:var(--tone-tomorrow)}.td-due.tone-week,.tone-week.td-prop-value{color:var(--tone-week)}.td-deadline{color:var(--td-dim)}.td-label{opacity:.92}.td-task-actions{display:flex;gap:0;opacity:0;margin:-3px -4px 0 0}.td-task:hover .td-task-actions,.td-task.is-focused .td-task-actions,.td-task-actions:focus-within{opacity:1}.td-checkbox{--prio: var(--td-muted);position:relative;flex:none;width:18px;height:18px;margin-top:1px;padding:0;border-radius:50%;border:1.6px solid var(--prio);background:transparent;display:grid;place-items:center;transition:background .12s}.td-checkbox.p4,.td-checkbox.p3,.td-checkbox.p2{background:color-mix(in srgb,var(--prio) 12%,transparent);border-width:2px}.td-checkbox svg{width:12px;height:12px;fill:none;stroke:var(--prio);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;opacity:0;transition:opacity .12s}.td-checkbox:hover svg{opacity:.85}.td-task.is-done .td-checkbox,.td-checkbox.is-checked{background:var(--prio);border-color:var(--prio)}.td-task.is-done .td-checkbox svg,.td-checkbox.is-checked svg{opacity:1;stroke:#fff}.td-checkbox.p1{--prio: var(--td-muted)}.td-task.is-done .td-checkbox.p1,.td-checkbox.p1.is-checked{background:var(--td-muted)}.td-checkbox.lg{width:22px;height:22px;margin-top:3px}.td-checkbox.lg svg{width:14px;height:14px}.td-checkbox.sm{width:15px;height:15px}.td-checkbox.sm svg{width:10px;height:10px}.td-task.is-skeleton .td-checkbox{border-color:var(--td-border-hi)}.td-link{color:var(--td-accent);text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--td-accent) 40%,transparent);cursor:pointer}.td-link:hover{border-bottom-color:var(--td-accent)}.td-more{display:flex;justify-content:center;padding:14px}.td-add-section{display:flex;align-items:center;gap:8px;width:calc(100% - 20px);margin:12px 10px;padding:6px 0;border:0;background:transparent;color:var(--td-muted);font-size:12.5px;font-weight:600;position:relative}.td-add-section:before,.td-add-section:after{content:"";height:1px;flex:1;background:transparent}.td-add-section:hover{color:var(--td-accent)}.td-add-section:hover:before,.td-add-section:hover:after{background:var(--td-accent)}.td-section-add{display:flex;gap:6px;padding:10px}.td-section-add input{flex:1;height:28px;padding:0 8px;border-radius:6px;border:1px solid var(--td-focus);background:var(--td-input-bg);outline:none;font-weight:600}.td-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;padding:48px 20px;color:var(--td-dim)}.td-empty p{margin:0}.td-empty-title{color:var(--td-ink);font-weight:650;font-size:14px}.td-empty-art{margin-bottom:8px}.td-drawer{width:min(440px,48%);flex:none;display:flex;flex-direction:column;min-height:0;background:var(--td-surface);border-left:1px solid var(--td-border);animation:td-drawer-in .16s ease-out}@keyframes td-drawer-in{0%{transform:translate(10px);opacity:.5}}@media (max-width: 819px){.td-drawer{position:absolute;z-index:30;right:0;top:0;bottom:0;width:min(460px,100%);box-shadow:var(--td-shadow)}}.td-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 8px 8px 12px;border-bottom:1px solid var(--td-border);min-height:46px}.td-drawer-tools{display:flex;gap:2px}.td-crumb{display:inline-flex;align-items:center;gap:6px;min-width:0;border:0;background:transparent;padding:4px 8px;border-radius:6px;font-size:12.5px;color:var(--td-dim)}.td-crumb span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-crumb:hover{background:var(--td-hover);color:var(--td-ink)}.td-crumb-move{opacity:0}.td-crumb:hover .td-crumb-move{opacity:.8}.td-drawer-body{flex:1;overflow-y:auto;padding:14px 16px 40px}.td-parent-link{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;padding:0;margin-bottom:8px;color:var(--td-muted);font-size:12px}.td-parent-link:hover{color:var(--td-accent)}.td-drawer-title-row{display:flex;gap:12px;align-items:flex-start}.td-drawer-title{font-size:17px;font-weight:650;line-height:1.35;flex:1;cursor:text;border-radius:6px;padding:1px 4px;margin:0 0 0 -4px;overflow-wrap:anywhere}.td-drawer-title:hover{background:var(--td-hover)}.td-drawer-title.is-done{text-decoration:line-through;color:var(--td-muted)}.td-edit-title,.td-edit-desc{flex:1;width:100%;resize:vertical;border:1px solid var(--td-focus);border-radius:7px;background:var(--td-input-bg);padding:6px 8px;outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--td-focus) 16%,transparent)}.td-edit-title{font-size:16px;font-weight:650}.td-edit-desc-wrap{margin:10px 0 0 34px}.td-edit-desc{min-height:110px;font-size:13px}.td-edit-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:6px}.td-edit-actions .td-dim{margin-right:auto;font-size:11.5px}.td-desc{margin:8px 0 0 34px;padding:2px 4px;border-radius:6px;color:var(--td-dim);cursor:text}.td-desc:hover{background:var(--td-hover)}.td-add-desc{display:block;margin:8px 0 0 30px;border:0;background:transparent;color:var(--td-muted);padding:2px 4px;font-size:13px}.td-add-desc:hover{color:var(--td-ink)}.td-props{display:grid;grid-template-columns:96px 1fr;align-items:center;gap:6px 10px;margin:18px 0 6px;padding:12px;border-radius:10px;background:var(--td-bg);border:1px solid var(--td-border)}.td-prop-label{display:inline-flex;align-items:center;gap:7px;color:var(--td-muted);font-size:12px}.td-prop-value{justify-self:start;display:inline-flex;align-items:center;gap:6px;min-height:26px;padding:2px 8px;margin-left:-8px;border:0;border-radius:6px;background:transparent;text-align:left;font-size:12.5px}.td-prop-value:hover{background:var(--td-hover)}.td-prop-sub{margin-left:4px;font-size:11.5px}.td-prop-value-wrap{display:flex;align-items:center;gap:4px}.td-date-input,.td-select{height:26px;padding:0 6px;margin-left:-6px;border-radius:6px;border:1px solid transparent;background:transparent;font-size:12.5px}.td-date-input.is-empty{color:var(--td-muted)}.td-date-input:hover,.td-select:hover{border-color:var(--td-border-hi)}.td-select{justify-self:start}.td-prop-labels{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.td-label-pill{--label: var(--td-muted);display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 3px 0 8px;border-radius:11px;font-size:11.5px;color:var(--label);background:color-mix(in srgb,var(--label) 14%,transparent)}.td-label-pill button{border:0;background:transparent;color:inherit;display:inline-flex;padding:3px;border-radius:50%;opacity:.7}.td-label-pill button:hover{opacity:1;background:color-mix(in srgb,var(--label) 20%,transparent)}.td-section-block{margin-top:20px}.td-section-block h3{display:flex;align-items:center;gap:6px;margin:0 0 6px;font-size:12.5px;font-weight:700;color:var(--td-dim)}.td-count{color:var(--td-muted);font-weight:500}.td-subtask{display:flex;align-items:center;gap:9px;padding:5px 2px;border-bottom:1px solid color-mix(in srgb,var(--td-border) 55%,transparent)}.td-subtask-title{flex:1;min-width:0;text-align:left;border:0;background:transparent;padding:0;font-size:13px;overflow-wrap:anywhere}.td-subtask-title:hover{color:var(--td-accent)}.td-inline-add{display:flex;align-items:center;gap:9px;padding:6px 2px;color:var(--td-muted)}.td-inline-add input{flex:1;border:0;outline:none;background:transparent;font-size:13px}.td-inline-add:focus-within{color:var(--td-accent)}.td-comment{padding:9px 11px;border-radius:9px;background:var(--td-bg);border:1px solid var(--td-border);margin-bottom:6px}.td-comment-meta{font-size:11px;color:var(--td-muted);margin-bottom:2px}.td-attachment{border:1px solid var(--td-border-hi);background:var(--td-surface);border-radius:6px;padding:3px 8px;font-size:12px;margin-top:4px}.td-comment-form{display:flex;flex-direction:column;gap:6px;margin-top:8px}.td-comment-form textarea{resize:vertical;min-height:54px;padding:8px 10px;border-radius:9px;border:1px solid var(--td-input-border);background:var(--td-input-bg);outline:none;font-size:13px}.td-comment-form textarea:focus{border-color:var(--td-focus)}.td-comment-form .td-btn{align-self:flex-end}.td-confirm{display:flex;flex-direction:column;gap:8px;padding:10px 14px;background:color-mix(in srgb,var(--td-danger) 10%,var(--td-surface));border-bottom:1px solid color-mix(in srgb,var(--td-danger) 30%,transparent);font-size:12.5px}.td-confirm>div{display:flex;justify-content:flex-end;gap:6px}.td-md p,.td-md ul,.td-md ol,.td-md blockquote,.td-md-pre{margin:0 0 6px}.td-md p:last-child{margin-bottom:0}.td-md ul,.td-md ol{padding-left:18px}.td-md blockquote{border-left:3px solid var(--td-border-hi);padding-left:8px;color:var(--td-muted)}.td-md-pre{background:var(--td-surface-hi);padding:8px;border-radius:6px;overflow-x:auto;font-family:var(--td-mono);font-size:12px}.td-md-pre code{background:none;padding:0}.td-popover.is-inline{position:static;margin:8px 0 2px;max-height:260px;box-shadow:none;animation:none}.td-popover{position:fixed;z-index:100;display:flex;flex-direction:column;overflow:hidden;background:var(--td-elevated);border:1px solid var(--td-border-hi);border-radius:10px;box-shadow:var(--td-shadow);animation:td-pop .12s ease-out}@keyframes td-pop{0%{opacity:0;transform:translateY(-3px) scale(.985)}}.td-popover-input{flex:none;height:36px;padding:0 12px;border:0;border-bottom:1px solid var(--td-border);background:transparent;outline:none;font-size:13px}.td-menu{overflow-y:auto;padding:4px;display:flex;flex-direction:column;gap:1px}.td-menu-item{display:flex;align-items:center;gap:9px;width:100%;min-height:30px;padding:4px 10px;border:0;border-radius:6px;background:transparent;text-align:left}.td-menu-item.is-active{background:var(--td-hover)}.td-menu-item.is-section{font-size:12.5px}.td-menu-icon{width:18px;display:inline-flex;justify-content:center;color:var(--td-muted);flex:none}.td-due-icon-today{color:var(--tone-today)}.td-due-icon-tomorrow{color:var(--tone-tomorrow)}.td-due-icon-weekend{color:#246fe0}.td-due-icon-week{color:var(--tone-week)}.td-menu-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-menu-hint{color:var(--td-muted);font-size:11.5px}.td-menu-empty{padding:10px;color:var(--td-muted);font-size:12px;text-align:center}.td-popover-foot{padding:7px 12px;border-top:1px solid var(--td-border);font-size:11px;color:var(--td-muted)}.td-check{width:14px;height:14px;border-radius:4px;border:1.5px solid var(--td-border-hi);flex:none}.td-check.is-on{background:var(--td-accent);border-color:var(--td-accent);box-shadow:inset 0 0 0 2px var(--td-elevated)}.td-section-glyph{width:9px;height:2px;background:var(--td-muted);border-radius:1px}.td-toasts{position:absolute;left:14px;bottom:14px;z-index:200;display:flex;flex-direction:column;gap:6px;align-items:flex-start;pointer-events:none;max-width:min(420px,calc(100% - 28px))}.td-toast{pointer-events:auto;display:flex;align-items:center;gap:14px;padding:8px 8px 8px 14px;min-height:36px;background:var(--td-ink);color:var(--td-bg);border-radius:9px;box-shadow:var(--td-shadow);font-size:12.5px;animation:td-toast-in .18s ease-out;max-width:100%}.td-toast span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-toast.is-error{background:var(--td-danger);color:#fff}.td-toast button{border:0;background:transparent;color:inherit;font-weight:700;padding:4px 8px;border-radius:6px}.td-toast button:hover{background:color-mix(in srgb,currentColor 14%,transparent)}@keyframes td-toast-in{0%{opacity:0;transform:translateY(6px)}}.td-toast.is-leaving{animation:td-toast-out .16s ease-in forwards}@keyframes td-toast-out{to{opacity:0;transform:translateY(4px)}}.td-toast button.td-toast-close{padding:4px;opacity:.6}.td-toast button.td-toast-close:hover{opacity:1}.td-modal-scrim{position:absolute;inset:0;z-index:150;background:#0006;display:grid;place-items:center;animation:td-fade .12s}.td-help{width:min(380px,calc(100% - 24px));background:var(--td-elevated);border:1px solid var(--td-border-hi);border-radius:12px;box-shadow:var(--td-shadow);padding:6px 16px 14px}.td-delete p{margin:2px 0 12px;color:var(--td-dim);font-size:13px;line-height:1.45}.td-delete-actions{display:flex;justify-content:flex-end;gap:8px}.td-help-head{display:flex;align-items:center;justify-content:space-between}.td-help h2{font-size:14px;margin:8px 0}.td-help dl{margin:0}.td-help dl>div{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--td-border)}.td-help dt{display:flex;gap:4px}.td-help dd{margin:0;color:var(--td-dim)}.td-setup{flex:1;display:grid;place-items:center;padding:24px;overflow-y:auto}.td-setup-card{width:min(460px,100%);display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:28px 26px 20px;border-radius:16px;background:var(--td-surface);border:1px solid var(--td-border)}.td-setup-card h1{margin:4px 0 0;font-size:18px;letter-spacing:-.01em}.td-setup-card p{margin:0;color:var(--td-dim)}.td-setup-alt{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:6px}.td-cmd{display:inline-flex;align-items:center;gap:12px;padding:6px 6px 6px 10px;border-radius:8px;border:1px solid var(--td-border-hi);background:var(--td-bg)}.td-cmd code{background:none;padding:0}.td-cmd .td-dim{font-size:11px;padding:2px 6px;border-radius:4px;background:var(--td-surface-hi)}.td-check-row{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--td-dim)}.td-progress{display:flex;gap:12px;align-items:flex-start;text-align:left;padding:14px;border-radius:10px;background:var(--td-bg);border:1px solid var(--td-border);width:100%}.td-progress .td-spinner{margin-top:3px;color:var(--td-accent)}.td-progress-actions{display:flex;gap:6px;margin-top:10px}.td-setup-foot{display:flex;gap:6px;margin-top:6px}.td-path-form{display:flex;gap:6px;width:100%}.td-path-form input{flex:1;height:28px;padding:0 8px;border-radius:6px;border:1px solid var(--td-input-border);background:var(--td-input-bg);outline:none;font-family:var(--td-mono);font-size:11.5px}.td-setup-ver{margin-top:6px!important;font-family:var(--td-mono);font-size:10.5px;word-break:break-all}.td-root.td-window-root{width:960px;height:640px}.td-modal-root{height:auto;min-height:0;width:600px;background:var(--td-surface)}.td-modal-root .td-setup{padding:12px}.td-modal-root .td-setup-card{border:0;background:transparent}.td-qa{display:flex;flex-direction:column;gap:10px;padding:16px 16px 12px}.td-qa-field{position:relative}.td-qa-field textarea,.td-qa-mirror{display:block;width:100%;margin:0;padding:4px 2px;border:0;font:inherit;font-size:17px;font-weight:600;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;letter-spacing:normal}.td-qa-mirror{position:relative;pointer-events:none;color:var(--td-ink);min-height:1.45em}.td-qa-field textarea{position:absolute;inset:0;height:100%;resize:none;overflow:hidden;background:transparent;color:transparent;caret-color:var(--td-ink);outline:none}.td-qa-field textarea::placeholder{color:var(--td-muted);font-weight:500}.td-qa-preview{font-size:12px;color:var(--td-dim);margin-top:-4px}.td-qa-chips{display:flex;flex-wrap:wrap;gap:6px}.td-qa-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:7px;border:1px solid var(--td-border-hi);background:transparent;font-size:12.5px;color:var(--td-dim);max-width:240px}.td-qa-chip:hover{background:var(--td-hover);color:var(--td-ink)}.td-qa-chip.is-set{color:var(--td-ink);border-color:color-mix(in srgb,var(--td-accent) 45%,var(--td-border-hi));background:var(--td-accent-soft)}.td-qa-agents{display:flex;flex-direction:column;gap:6px;padding-top:10px;border-top:1px solid var(--td-border)}.td-qa-agents-label{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--td-muted);font-weight:600}.td-qa-agent-list{display:flex;flex-wrap:wrap;gap:6px}.td-agent-chip{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:13px;font-size:12px;border:1px solid var(--td-border-hi);background:var(--td-bg);max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.td-agent-chip:hover{border-color:var(--td-dim)}.td-agent-chip.is-on{border-color:var(--td-accent);background:var(--td-accent-soft)}.td-agent-dot{width:7px;height:7px;border-radius:50%;background:var(--td-muted);flex:none}.td-agent-dot.is-working{background:var(--tone-today);box-shadow:0 0 0 3px color-mix(in srgb,var(--tone-today) 25%,transparent)}.td-qa-foot{display:flex;align-items:center;gap:8px;padding-top:12px;border-top:1px solid var(--td-border)}.td-qa-project{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 10px;border:0;border-radius:7px;background:transparent;font-size:12.5px;font-weight:600}.td-qa-project:hover{background:var(--td-hover)}.td-qa-hint{margin-left:auto;font-size:11.5px;color:var(--td-muted);display:inline-flex;align-items:center;gap:4px}@media (max-width: 480px){.td-qa-hint{display:none}}@media (max-width: 520px){.td-header{padding:8px 8px 4px 6px}.td-add-row{padding:2px 8px 6px}.td-list{padding:0 2px 60px}.td-project-chip{margin-left:0}.td-props{grid-template-columns:84px 1fr}}@media (prefers-reduced-motion: reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}.td-task-modal-scrim{position:absolute;inset:0;z-index:120;background:#00000059;display:grid;place-items:start center;padding:6vh 16px 16px;animation:td-fade .12s}.td-task-modal{width:min(860px,100%);max-height:86vh;display:flex;flex-direction:column;overflow:hidden;background:var(--td-elevated);border:1px solid var(--td-border);border-radius:12px;box-shadow:var(--td-shadow);animation:td-modal-in .14s cubic-bezier(.2,0,0,1)}@keyframes td-modal-in{0%{opacity:0;transform:translateY(6px) scale(.99)}}.td-task-modal-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 8px 8px 14px;border-bottom:1px solid var(--td-border);min-height:46px}.td-task-modal-body{flex:1;min-height:0;display:flex;overflow:hidden}.td-task-modal-main{flex:1;min-width:0;overflow-y:auto;padding:16px 18px 32px}.td-task-modal-side{flex:none;width:250px;overflow-y:auto;padding:14px 14px 24px;display:flex;flex-direction:column;gap:2px;background:var(--td-surface);border-left:1px solid var(--td-border)}.td-side-row{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:8px 0;border-bottom:1px solid var(--td-border)}.td-side-row:last-child{border-bottom:0}.td-side-row .td-prop-label{font-size:11.5px;font-weight:600;color:var(--td-dim);display:inline-flex;align-items:center;gap:6px}.td-side-row .td-prop-value{margin-left:-6px}@media (max-width: 700px){.td-task-modal-scrim{padding:0;place-items:stretch}.td-task-modal{width:100%;max-height:none;border-radius:0}.td-task-modal-body{flex-direction:column;overflow-y:auto}.td-task-modal-main{overflow:visible}.td-task-modal-side{width:auto;border-left:0;border-top:1px solid var(--td-border);overflow:visible}}.td-add-task-btn{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px 8px 12px;border:0;background:transparent;color:var(--td-muted);font-size:13px;text-align:left}.td-add-task-plus{width:18px;height:18px;display:grid;place-items:center;border-radius:50%;color:var(--td-accent)}.td-add-task-btn:hover{color:var(--td-accent)}.td-add-task-btn:hover .td-add-task-plus{background:var(--td-accent);color:var(--td-accent-fg)}.td-add-editor{margin:6px 6px 10px;padding:10px 12px 8px;border:1px solid var(--td-border-hi);border-radius:10px;background:var(--td-bg);display:flex;flex-direction:column;gap:6px}.td-add-editor:focus-within{border-color:color-mix(in srgb,var(--td-ink) 30%,var(--td-border-hi))}.td-add-editor-title{height:26px;flex:none}.td-add-editor-title .td-quickadd-input,.td-add-editor-title .td-quickadd-mirror{font-size:14px;font-weight:600;line-height:26px}.td-add-editor-desc{border:0;background:transparent;resize:none;outline:none;font-size:12.5px;color:var(--td-dim);padding:0}.td-add-editor-hint{font-size:11.5px;color:var(--td-muted)}.td-add-editor-foot{display:flex;align-items:center;gap:6px;padding-top:8px;margin-top:2px;border-top:1px solid var(--td-border)}.td-flex{flex:1}.td-nav-item.td-nav-addtask{color:var(--td-accent);font-weight:600}.td-nav-add-icon{width:18px;height:18px;border-radius:50%;background:var(--td-accent);color:var(--td-accent-fg)!important;display:grid;place-items:center}';
function pp(e) {
  const t = e;
  return {
    context: t,
    async call(n, r) {
      const o = r === void 0 ? void 0 : JSON.parse(JSON.stringify(r)), l = await t.runtime.request(n, o);
      return await pd(l, (i, a) => t.runtime.request("chunk", { id: i, index: a }));
    }
  };
}
const Hf = R.createContext(null);
function Bf() {
  const e = R.useContext(Hf);
  if (!e) throw new Error("Bridge missing");
  return e;
}
function mp(e) {
  const [t, n] = R.useState(() => e.context.runtime.state());
  return R.useEffect(() => (n(e.context.runtime.state()), e.context.runtime.subscribe((r) => n(r))), [e]), t;
}
function hp() {
  const [e, t] = R.useState(() => /* @__PURE__ */ new Date());
  return R.useEffect(() => {
    const n = setInterval(() => t(/* @__PURE__ */ new Date()), 6e4);
    return () => clearInterval(n);
  }, []), e;
}
function vp(e, t, n) {
  const [r, o] = R.useState(n), [l, i] = R.useState(!1);
  return R.useEffect(() => {
    let s = !0;
    return e.context.api.storage.get(t).then((d) => {
      s && (d != null && o(d), i(!0));
    }, () => i(!0)), () => {
      s = !1;
    };
  }, [e, t]), [r, (s) => {
    o(s), e.context.api.storage.set(t, s).catch(() => {
    });
  }, l];
}
const Xa = "agent-code-todoist-styles";
function gp(e) {
  if (document.getElementById(Xa)) return;
  const t = document.createElement("style");
  t.id = Xa, t.textContent = e, document.head.append(t);
}
function xp() {
  const e = document.documentElement, t = () => {
    const r = document.createElement("div");
    r.style.color = getComputedStyle(e).getPropertyValue("--theme-canvas").trim() || "#1e1f22", document.body.append(r);
    const o = getComputedStyle(r).color.match(/[\d.]+/g)?.map(Number) ?? [30, 31, 34];
    r.remove();
    const i = (0.2126 * o[0] + 0.7152 * o[1] + 0.0722 * o[2]) / 255 > 0.5 ? "light" : "dark";
    e.style.colorScheme !== i && (e.style.colorScheme = i), e.dataset.tdMode !== i && (e.dataset.tdMode = i);
  };
  t();
  const n = new MutationObserver(t);
  return n.observe(e, { attributes: !0, attributeFilter: ["style"] }), () => n.disconnect();
}
function yp(e) {
  const t = document.documentElement, n = (r) => {
    const l = r?.settings?.inheritTheme === !0 ? "agent-code" : "todoist";
    t.dataset.tdTheme !== l && (t.dataset.tdTheme = l);
  };
  return n(e.state()), e.subscribe(n);
}
const Bl = {
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
}, wp = Object.keys(Bl);
function cd(e) {
  return e && Bl[e] || Bl.charcoal;
}
const Wf = {
  4: "var(--td-p1)",
  3: "var(--td-p2)",
  2: "var(--td-p3)",
  1: "var(--td-muted)"
};
function Qf(e) {
  return `p${5 - Math.min(4, Math.max(1, e))}`;
}
const no = "(?:mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:rs(?:day)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)", Ga = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)", qo = "(?:(?:at\\s+)?\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)|at\\s+\\d{1,2}(?::\\d{2})?|(?:at\\s+)?(?:noon|midnight))", Kf = `(?:today|tod|tonight|tomorrow|tom|yesterday|next\\s+(?:week|month|year|${no})|this\\s+(?:weekend|week)|${no}|in\\s+\\d+\\s+(?:days?|weeks?|months?)|${Ga}\\s+\\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}(?:st|nd|rd|th)?\\s+${Ga}|\\d{4}-\\d{2}-\\d{2})`, Yf = `(?:every\\s+(?:other\\s+)?(?:day|weekday|workday|week|month|year|morning|evening|${no}(?:\\s*(?:,|and)\\s*${no})*|\\d+\\s+(?:days?|weeks?|months?|years?)))`, Xf = `(?:${Yf}(?:\\s+${qo})?|${Kf}(?:\\s+${qo})?|${qo})`, yr = new RegExp(
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
    `(?<date>(?<=\\s|^)${Xf}(?=\\s|$|[.,;!?](?:\\s|$)))`
  ].join("|"),
  "gi"
), Gf = /(?:^|\s)\/\/(?=\s|$)/;
function qf(e) {
  const t = [], n = Gf.exec(e), r = n ? n.index + (n[0].startsWith("/") ? 0 : 1) : e.length, o = e.slice(0, r);
  let l = 0;
  yr.lastIndex = 0;
  for (let i = yr.exec(o); i; i = yr.exec(o)) {
    if (i[0].length === 0) {
      yr.lastIndex++;
      continue;
    }
    const a = i.groups ?? {}, s = Object.keys(a).find((d) => a[d] !== void 0) ?? "text";
    i.index > l && t.push({ kind: "text", text: e.slice(l, i.index), start: l, end: i.index }), t.push({ kind: s, text: i[0], start: i.index, end: i.index + i[0].length }), l = i.index + i[0].length;
  }
  return l < o.length && t.push({ kind: "text", text: o.slice(l), start: l, end: o.length }), r < e.length && t.push({ kind: "description", text: e.slice(r), start: r, end: e.length }), t;
}
function kp(e) {
  return qf(e).filter((t) => t.kind === "text").map((t) => t.text).join("").replace(/\s+/g, " ").trim();
}
function b({ size: e = 16, children: t, ...n }) {
  return /* @__PURE__ */ c.jsx("svg", { width: e, height: e, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", ...n, children: t });
}
const Zf = ({ day: e, ...t }) => /* @__PURE__ */ c.jsxs(b, { ...t, children: [
  /* @__PURE__ */ c.jsx("rect", { x: "2.5", y: "3", width: "11", height: "10.5", rx: "2" }),
  /* @__PURE__ */ c.jsx("path", { d: "M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4" }),
  /* @__PURE__ */ c.jsx("text", { x: "8", y: "12", textAnchor: "middle", fontSize: "5.4", fontWeight: "700", fill: "currentColor", stroke: "none", fontFamily: "system-ui, sans-serif", children: e ?? (/* @__PURE__ */ new Date()).getDate() })
] }), Jf = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("rect", { x: "2.5", y: "3", width: "11", height: "10.5", rx: "2" }),
  /* @__PURE__ */ c.jsx("path", { d: "M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4M5 8.5h1M7.5 8.5h1M10 8.5h1M5 11h1M7.5 11h1" })
] }), ep = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("path", { d: "M2.5 9.5 4.2 3.8a1 1 0 0 1 1-.8h5.6a1 1 0 0 1 1 .8l1.7 5.7v2.5a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z" }),
  /* @__PURE__ */ c.jsx("path", { d: "M2.5 9.5h3l.8 1.5h3.4l.8-1.5h3" })
] }), Sp = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("circle", { cx: "8", cy: "8", r: "5.6" }),
  /* @__PURE__ */ c.jsx("path", { d: "m5.6 8.1 1.6 1.6 3.3-3.4" })
] }), Ep = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("circle", { cx: "7", cy: "7", r: "4.3" }),
  /* @__PURE__ */ c.jsx("path", { d: "m10.2 10.2 3.3 3.3" })
] }), tp = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("path", { d: "M2.5 3.5v4l6 6 5-5-6-6h-4a1 1 0 0 0-1 1z" }),
  /* @__PURE__ */ c.jsx("circle", { cx: "5.5", cy: "5.5", r: "0.9", fill: "currentColor", stroke: "none" })
] }), jp = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "M2.5 3.5h11l-4.2 5v4l-2.6 1.2V8.5z" }) }), np = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "M8 3v10M3 8h10" }) }), rp = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "m4 4 8 8M12 4l-8 8" }) }), Cp = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "m4 6 4 4 4-4" }) }), op = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("path", { d: "M13 8a5 5 0 1 1-1.5-3.6" }),
  /* @__PURE__ */ c.jsx("path", { d: "M13 2.8v2.6h-2.6" })
] }), zp = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "M3.5 14V2.8M3.5 3h8.2l-1.6 3 1.6 3H3.5" }) }), lp = ({ color: e, ...t }) => /* @__PURE__ */ c.jsxs(b, { ...t, style: { stroke: e }, children: [
  /* @__PURE__ */ c.jsx("path", { d: "M3.5 14V2.8" }),
  /* @__PURE__ */ c.jsx("path", { d: "M3.5 3h8.2l-1.6 3 1.6 3H3.5z", style: { fill: e } })
] }), ip = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("rect", { x: "2.5", y: "3", width: "11", height: "10.5", rx: "2" }),
  /* @__PURE__ */ c.jsx("path", { d: "M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4" })
] }), Np = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("circle", { cx: "8", cy: "8", r: "5.6" }),
  /* @__PURE__ */ c.jsx("path", { d: "M8 5v3.2l2 1.3" })
] }), _p = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("circle", { cx: "8", cy: "8", r: "5.6" }),
  /* @__PURE__ */ c.jsx("circle", { cx: "8", cy: "8", r: "2.6" }),
  /* @__PURE__ */ c.jsx("circle", { cx: "8", cy: "8", r: ".6", fill: "currentColor" })
] }), Pp = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("path", { d: "M3 7a5 5 0 0 1 8.6-2.6L13 5.8M13 2.8v3h-3" }),
  /* @__PURE__ */ c.jsx("path", { d: "M13 9a5 5 0 0 1-8.6 2.6L3 10.2M3 13.2v-3h3" })
] }), Mp = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "M3 3.5h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 2.3v-2.3H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" }) }), Tp = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.6a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.6" }) }), ap = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "M9 3h4v4M13 3 7.5 8.5M11 9.5V13H3V5h3.5" }) }), Lp = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("path", { d: "M4 2.5v6.5a2 2 0 0 0 2 2h6" }),
  /* @__PURE__ */ c.jsx("path", { d: "m10 9 2 2-2 2" })
] }), Ip = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("rect", { x: "2", y: "3", width: "12", height: "10", rx: "1.8" }),
  /* @__PURE__ */ c.jsx("path", { d: "M6 3v10" })
] }), Rp = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "M2.5 8h8M8 5l3 3-3 3M13.5 3v10" }) }), Dp = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("rect", { x: "3", y: "4.5", width: "10", height: "8", rx: "2" }),
  /* @__PURE__ */ c.jsx("path", { d: "M8 2v2.5M6 8.2v.6M10 8.2v.6M6.3 10.8h3.4" })
] }), Op = (e) => /* @__PURE__ */ c.jsxs(b, { ...e, children: [
  /* @__PURE__ */ c.jsx("rect", { x: "1.8", y: "4", width: "12.4", height: "8", rx: "1.5" }),
  /* @__PURE__ */ c.jsx("path", { d: "M4.5 6.6h.01M7 6.6h.01M9.5 6.6h.01M12 6.6h.01M5 9.5h6" })
] }), bp = (e) => /* @__PURE__ */ c.jsx(b, { ...e, children: /* @__PURE__ */ c.jsx("path", { d: "M6.5 13.5h-3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3M10.5 11 13.5 8l-3-3M13.5 8h-7" }) }), qa = (e) => /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
  /* @__PURE__ */ c.jsxs("svg", { className: "td-mark-todoist", width: e.size ?? 28, height: e.size ?? 28, viewBox: "0 0 32 32", "aria-hidden": "true", children: [
    /* @__PURE__ */ c.jsx("path", { fillRule: "evenodd", clipRule: "evenodd", fill: "#E44232", d: "M4 0h24c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4H4c-2.2 0-4-1.8-4-4v-5.374l.057.033c1.365.794 4.592 2.674 5.382 3.12.478.27.936.263 1.397-.003l6.328-3.641.012-.007.035-.02 6.575-3.784c.277-.16.291-.652-.02-.829l-.217-.124c-.316-.18-.726-.413-.901-.516a1.02 1.02 0 0 0-.998.012c-.154.09-10.5 6.038-10.847 6.235a1.349 1.349 0 0 1-1.338 0L0 19.927v-2.693l.057.033c1.365.795 4.592 2.674 5.382 3.12.478.27.936.264 1.397-.002.276-.16 3.307-1.903 6.367-3.664l.024-.014 6.559-3.775c.277-.16.291-.651-.02-.828l-.217-.124c-.316-.18-.726-.414-.901-.517a1.02 1.02 0 0 0-.998.012c-.154.09-10.5 6.039-10.847 6.235a1.349 1.349 0 0 1-1.338 0L0 14.535v-2.693l.056.033a943.17 943.17 0 0 0 5.383 3.12c.478.27.936.264 1.397-.002l6.374-3.668.008-.005c3.2-1.84 6.426-3.698 6.568-3.78.277-.16.291-.65-.02-.828l-.217-.124c-.317-.18-.727-.414-.901-.516a1.02 1.02 0 0 0-.998.012c-.154.089-10.5 6.038-10.847 6.235a1.349 1.349 0 0 1-1.338 0L0 9.143V4c0-2.2 1.8-4 4-4Z" }),
    /* @__PURE__ */ c.jsx("path", { fill: "#fff", d: "M6.836 14.993c.276-.16 3.311-1.906 6.374-3.668l.008-.005c3.2-1.84 6.426-3.698 6.568-3.78.277-.16.29-.65-.02-.828l-.217-.124c-.316-.18-.727-.414-.902-.516a1.02 1.02 0 0 0-.997.012c-.155.089-10.501 6.038-10.847 6.235a1.349 1.349 0 0 1-1.339 0L0 9.143v2.698l.056.033c1.364.795 4.592 2.674 5.383 3.12.478.27.936.264 1.397-.002Z" }),
    /* @__PURE__ */ c.jsx("path", { fill: "#fff", d: "m6.836 20.385 6.366-3.664.024-.014 6.56-3.775c.277-.16.29-.651-.02-.828l-.217-.124c-.316-.18-.727-.414-.902-.517a1.02 1.02 0 0 0-.997.012c-.155.09-10.501 6.039-10.847 6.235a1.349 1.349 0 0 1-1.339 0L0 14.535v2.699l.057.033c1.365.795 4.591 2.674 5.382 3.12.478.27.936.264 1.397-.002Z" }),
    /* @__PURE__ */ c.jsx("path", { fill: "#fff", d: "m13.21 22.108-6.374 3.668c-.461.266-.919.273-1.397.003-.79-.446-4.018-2.326-5.382-3.12L0 22.626v-2.699l5.464 3.175c.413.238.925.235 1.339 0 .346-.197 10.692-6.146 10.847-6.235a1.02 1.02 0 0 1 .997-.012c.175.103.586.336.902.516l.218.124c.31.177.296.669.019.829l-6.575 3.784Z" })
  ] }),
  /* @__PURE__ */ c.jsxs("svg", { className: "td-mark-own", width: e.size ?? 28, height: e.size ?? 28, viewBox: "0 0 32 32", "aria-hidden": "true", children: [
    /* @__PURE__ */ c.jsx("rect", { width: "32", height: "32", rx: "8", style: { fill: "var(--td-brand)" } }),
    /* @__PURE__ */ c.jsx("path", { d: "m9.5 16.5 4.5 4.5 8.5-9", fill: "none", stroke: "#fff", strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round" })
  ] })
] });
function wo({ anchor: e, onClose: t, children: n, width: r = 260, align: o = "start", inline: l = !1 }) {
  const i = R.useRef(null), [a, s] = R.useState(null);
  return R.useLayoutEffect(() => {
    if (!e || l) return;
    const d = () => {
      const v = e.getBoundingClientRect(), h = i.current?.offsetHeight ?? 240, m = window.innerWidth, y = window.innerHeight - v.bottom - 8, k = v.top - 8, _ = y < Math.min(h, 220) && k > y, f = Math.max(140, (_ ? k : y) - 4), u = _ ? Math.max(4, v.top - 4 - Math.min(h, f)) : v.bottom + 4, p = Math.min(r, m - 16), g = o === "end" ? v.right - p : v.left;
      s({ top: u, left: Math.max(8, Math.min(g, m - p - 8)), maxHeight: f });
    };
    return d(), window.addEventListener("resize", d), () => window.removeEventListener("resize", d);
  }, [e, r, o, l]), R.useEffect(() => {
    const d = (h) => {
      const m = h.target;
      i.current?.contains(m) || e?.contains(m) || t();
    }, v = (h) => {
      h.key === "Escape" && (h.preventDefault(), h.stopPropagation(), t());
    };
    return document.addEventListener("pointerdown", d, !0), document.addEventListener("keydown", v, !0), () => {
      document.removeEventListener("pointerdown", d, !0), document.removeEventListener("keydown", v, !0);
    };
  }, [e, t]), /* @__PURE__ */ c.jsx(
    "div",
    {
      ref: i,
      className: `td-popover${l ? " is-inline" : ""}`,
      role: "dialog",
      style: l ? void 0 : { top: a?.top ?? -9999, left: a?.left ?? -9999, width: Math.min(r, window.innerWidth - 16), maxHeight: a?.maxHeight },
      children: n
    }
  );
}
function ko(e, t) {
  const [n, r] = R.useState(0);
  return R.useEffect(() => {
    r((l) => Math.min(l, Math.max(0, e - 1)));
  }, [e]), { active: n, setActive: r, onKeyDown: (l) => {
    l.key === "ArrowDown" ? (l.preventDefault(), r((i) => e ? (i + 1) % e : 0)) : l.key === "ArrowUp" ? (l.preventDefault(), r((i) => e ? (i - 1 + e) % e : 0)) : l.key === "Enter" && (l.preventDefault(), e && t(n));
  } };
}
const sp = [
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
function Fp({ anchor: e, current: t, onPick: n, onClose: r, placeholder: o, inline: l }) {
  const [i, a] = R.useState(""), s = sp, { active: d, setActive: v, onKeyDown: h } = ko(s.length, (m) => {
    n(s[m].value), r();
  });
  return /* @__PURE__ */ c.jsxs(wo, { anchor: e, inline: l, onClose: r, width: 250, children: [
    /* @__PURE__ */ c.jsx(
      "form",
      {
        onSubmit: (m) => {
          m.preventDefault(), i.trim() && (n(i.trim()), r());
        },
        children: /* @__PURE__ */ c.jsx(
          "input",
          {
            autoFocus: !0,
            className: "td-popover-input",
            placeholder: o ?? (t ? `Due: ${t}` : 'Type a date — "fri 3pm", "every mon"'),
            value: i,
            onChange: (m) => a(m.target.value),
            onKeyDown: (m) => {
              i || h(m);
            }
          }
        )
      }
    ),
    /* @__PURE__ */ c.jsx("div", { className: "td-menu", role: "menu", children: s.map((m, x) => /* @__PURE__ */ c.jsxs(
      "button",
      {
        type: "button",
        role: "menuitem",
        className: `td-menu-item${x === d ? " is-active" : ""}`,
        onMouseEnter: () => v(x),
        onClick: () => {
          n(m.value), r();
        },
        children: [
          /* @__PURE__ */ c.jsx("span", { className: `td-menu-icon td-due-icon-${m.icon}`, children: m.icon === "today" ? /* @__PURE__ */ c.jsx(Zf, {}) : m.icon === "none" ? /* @__PURE__ */ c.jsx(rp, {}) : m.icon === "week" ? /* @__PURE__ */ c.jsx(Jf, {}) : /* @__PURE__ */ c.jsx(ip, {}) }),
          /* @__PURE__ */ c.jsx("span", { className: "td-menu-label", children: m.label }),
          /* @__PURE__ */ c.jsx("span", { className: "td-menu-hint", children: m.hint })
        ]
      },
      m.label
    )) }),
    /* @__PURE__ */ c.jsx("div", { className: "td-popover-foot", children: 'Todoist understands "every weekday 9am", "in 3 days", "Oct 20".' })
  ] });
}
function $p({ anchor: e, current: t, onPick: n, onClose: r, inline: o }) {
  const l = [4, 3, 2, 1], { active: i, setActive: a } = ko(l.length, () => {
  });
  return /* @__PURE__ */ c.jsx(wo, { anchor: e, inline: o, onClose: r, width: 190, children: /* @__PURE__ */ c.jsx("div", { className: "td-menu", role: "menu", children: l.map((s, d) => /* @__PURE__ */ c.jsxs(
    "button",
    {
      type: "button",
      role: "menuitemradio",
      "aria-checked": s === t,
      autoFocus: s === t,
      className: `td-menu-item${d === i ? " is-active" : ""}`,
      onMouseEnter: () => a(d),
      onClick: () => {
        n(s), r();
      },
      children: [
        /* @__PURE__ */ c.jsx("span", { className: "td-menu-icon", children: /* @__PURE__ */ c.jsx(lp, { color: s === 1 ? "var(--td-muted)" : Wf[s] }) }),
        /* @__PURE__ */ c.jsxs("span", { className: "td-menu-label", children: [
          "Priority ",
          5 - s
        ] }),
        /* @__PURE__ */ c.jsx("span", { className: "td-menu-hint", children: s === t ? "✓" : Qf(s) })
      ]
    },
    s
  )) }) });
}
function Up({ anchor: e, labels: t, selected: n, onChange: r, onCreate: o, onClose: l, inline: i }) {
  const [a, s] = R.useState(""), [d, v] = R.useState(!1), h = a.trim().replace(/^@/, "").toLowerCase(), m = t.filter((g) => !h || g.name.toLowerCase().includes(h)), x = t.some((g) => g.name.toLowerCase() === h), y = !!o && !!h && !x, k = (g) => r(n.includes(g) ? n.filter((S) => S !== g) : [...n, g]), { active: _, setActive: f, onKeyDown: u } = ko(m.length + (y ? 1 : 0), (g) => {
    g < m.length ? k(m[g].name) : p();
  }), p = async () => {
    if (!(!o || !h || d)) {
      v(!0);
      try {
        await o(a.trim().replace(/^@/, "")), r([...n, a.trim().replace(/^@/, "")]), s("");
      } finally {
        v(!1);
      }
    }
  };
  return /* @__PURE__ */ c.jsxs(wo, { anchor: e, inline: i, onClose: l, width: 250, children: [
    /* @__PURE__ */ c.jsx("input", { autoFocus: !0, className: "td-popover-input", placeholder: "Type a label", value: a, onChange: (g) => s(g.target.value), onKeyDown: u }),
    /* @__PURE__ */ c.jsxs("div", { className: "td-menu", role: "menu", children: [
      m.map((g, S) => /* @__PURE__ */ c.jsxs(
        "button",
        {
          type: "button",
          role: "menuitemcheckbox",
          "aria-checked": n.includes(g.name),
          className: `td-menu-item${S === _ ? " is-active" : ""}`,
          onMouseEnter: () => f(S),
          onClick: () => k(g.name),
          children: [
            /* @__PURE__ */ c.jsx("span", { className: "td-menu-icon", style: { color: cd(g.color) }, children: /* @__PURE__ */ c.jsx(tp, {}) }),
            /* @__PURE__ */ c.jsx("span", { className: "td-menu-label", children: g.name }),
            /* @__PURE__ */ c.jsx("span", { className: `td-check${n.includes(g.name) ? " is-on" : ""}` })
          ]
        },
        g.id
      )),
      y && /* @__PURE__ */ c.jsxs("button", { type: "button", className: `td-menu-item${_ === m.length ? " is-active" : ""}`, onClick: () => void p(), disabled: d, children: [
        /* @__PURE__ */ c.jsx("span", { className: "td-menu-icon", children: /* @__PURE__ */ c.jsx(np, {}) }),
        /* @__PURE__ */ c.jsxs("span", { className: "td-menu-label", children: [
          "Create label “",
          a.trim().replace(/^@/, ""),
          "”"
        ] })
      ] }),
      !m.length && !y && /* @__PURE__ */ c.jsx("div", { className: "td-menu-empty", children: "No labels yet. Type a name to create one." })
    ] })
  ] });
}
function Ap({ anchor: e, meta: t, current: n, onPick: r, onClose: o, inline: l }) {
  const [i, a] = R.useState(""), s = i.trim().replace(/^#/, "").toLowerCase(), d = R.useMemo(() => {
    const x = [];
    for (const { project: y, depth: k } of up(t.projects)) {
      const _ = t.sections.filter((p) => p.projectId === y.id), f = !s || y.name.toLowerCase().includes(s), u = _.filter((p) => !s || p.name.toLowerCase().includes(s) || f);
      (f || u.length) && x.push({ key: y.id, target: { projectId: y.id, sectionId: null }, project: y, depth: k });
      for (const p of u)
        x.push({ key: `${y.id}/${p.id}`, target: { projectId: y.id, sectionId: p.id }, project: y, section: p.name, depth: k + 1 });
    }
    return x;
  }, [t, s]), { active: v, setActive: h, onKeyDown: m } = ko(d.length, (x) => {
    r(d[x].target), o();
  });
  return /* @__PURE__ */ c.jsxs(wo, { anchor: e, inline: l, onClose: o, width: 280, children: [
    /* @__PURE__ */ c.jsx("input", { autoFocus: !0, className: "td-popover-input", placeholder: "Type a project or section", value: i, onChange: (x) => a(x.target.value), onKeyDown: m }),
    /* @__PURE__ */ c.jsxs("div", { className: "td-menu", role: "menu", children: [
      d.map((x, y) => {
        const k = n?.projectId === x.target.projectId && (n?.sectionId ?? null) === x.target.sectionId;
        return /* @__PURE__ */ c.jsxs(
          "button",
          {
            type: "button",
            role: "menuitemradio",
            "aria-checked": k,
            className: `td-menu-item${y === v ? " is-active" : ""}${x.section ? " is-section" : ""}`,
            style: { paddingLeft: 10 + x.depth * 14 },
            onMouseEnter: () => h(y),
            onClick: () => {
              r(x.target), o();
            },
            children: [
              /* @__PURE__ */ c.jsx("span", { className: "td-menu-icon", children: x.section ? /* @__PURE__ */ c.jsx("span", { className: "td-section-glyph" }) : x.project.isInbox ? /* @__PURE__ */ c.jsx(ep, {}) : /* @__PURE__ */ c.jsx("span", { className: "td-dot", style: { background: cd(x.project.color) } }) }),
              /* @__PURE__ */ c.jsx("span", { className: "td-menu-label", children: x.section ?? x.project.name }),
              /* @__PURE__ */ c.jsx("span", { className: "td-menu-hint", children: k ? "✓" : "" })
            ]
          },
          x.key
        );
      }),
      !d.length && /* @__PURE__ */ c.jsx("div", { className: "td-menu-empty", children: "No matching project." })
    ] })
  ] });
}
function up(e) {
  const t = /* @__PURE__ */ new Map(), n = new Set(e.map((l) => l.id));
  for (const l of e) {
    const i = l.parentId && n.has(l.parentId) ? l.parentId : null, a = t.get(i) ?? [];
    a.push(l), t.set(i, a);
  }
  const r = [], o = (l, i) => {
    const a = (t.get(l) ?? []).sort((s, d) => Number(d.isInbox) - Number(s.isInbox) || s.order - d.order);
    for (const s of a)
      r.push({ project: s, depth: i }), i < 6 && o(s.id, i + 1);
  };
  return o(null, 0), r;
}
function Vp({ setup: e, onRetry: t }) {
  const n = Bf(), [r, o] = R.useState(null), [l, i] = R.useState(null), [a, s] = R.useState(!1), [d, v] = R.useState(""), [h, m] = R.useState(!1), [x, y] = R.useState(!1), k = e?.job ?? null, _ = k?.state === "running", f = dp(_ ? k.startedAt : null);
  R.useEffect(() => {
    if (!_) return;
    const S = setInterval(() => void n.call("status", {}).catch(() => {
    }), 1500);
    return () => clearInterval(S);
  }, [_, n]);
  const u = async (S, C) => {
    o(S), i(null);
    try {
      await C();
    } catch (z) {
      i(md(z));
    } finally {
      o(null);
    }
  }, p = async (S) => {
    try {
      await navigator.clipboard.writeText(S), y(!0), setTimeout(() => y(!1), 1500);
    } catch {
    }
  };
  if (!e)
    return /* @__PURE__ */ c.jsx("div", { className: "td-setup", children: /* @__PURE__ */ c.jsxs("div", { className: "td-setup-card", children: [
      /* @__PURE__ */ c.jsx(qa, { size: 40 }),
      /* @__PURE__ */ c.jsx("h1", { children: "Todoist" }),
      /* @__PURE__ */ c.jsxs("p", { className: "td-dim", children: [
        /* @__PURE__ */ c.jsx("span", { className: "td-spinner" }),
        " Looking for the Todoist CLI…"
      ] })
    ] }) });
  const g = k && k.state === "failed" ? k : null;
  return /* @__PURE__ */ c.jsx("div", { className: "td-setup", children: /* @__PURE__ */ c.jsxs("div", { className: "td-setup-card", children: [
    /* @__PURE__ */ c.jsx(qa, { size: 40 }),
    /* @__PURE__ */ c.jsx("h1", { children: e.state === "td-missing" ? "Install the Todoist CLI" : e.state === "signed-out" ? "Sign in to Todoist" : "Todoist is unavailable" }),
    e.state === "td-missing" && !_ && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      /* @__PURE__ */ c.jsxs("p", { children: [
        "This extension runs Doist's official command-line app, ",
        /* @__PURE__ */ c.jsx("code", { children: "td" }),
        ", on your Mac. It was not found",
        e.searched.length ? ` (looked in ${e.searched.length} places)` : "",
        "."
      ] }),
      e.brew ? /* @__PURE__ */ c.jsxs("button", { className: "td-btn td-btn-primary td-btn-lg", disabled: !!r, onClick: () => void u("install", () => n.call("install", {})), children: [
        r === "install" ? /* @__PURE__ */ c.jsx("span", { className: "td-spinner" }) : null,
        " Install with Homebrew"
      ] }) : null,
      /* @__PURE__ */ c.jsxs("div", { className: "td-setup-alt", children: [
        /* @__PURE__ */ c.jsx("span", { className: "td-dim", children: e.brew ? "Or in a terminal:" : "Install it in a terminal:" }),
        /* @__PURE__ */ c.jsxs("button", { className: "td-cmd", onClick: () => void p(e.brew ? "brew install todoist-cli" : "npm install -g @doist/todoist-cli"), title: "Copy", children: [
          /* @__PURE__ */ c.jsx("code", { children: e.brew ? "brew install todoist-cli" : "npm install -g @doist/todoist-cli" }),
          /* @__PURE__ */ c.jsx("span", { className: "td-dim", children: x ? "Copied" : "Copy" })
        ] }),
        /* @__PURE__ */ c.jsx("span", { className: "td-dim td-small", children: "Requires Node.js 24 or newer when installed with npm." })
      ] })
    ] }),
    e.state === "td-missing" && _ && k?.kind === "install" && /* @__PURE__ */ c.jsxs("div", { className: "td-progress", children: [
      /* @__PURE__ */ c.jsx("span", { className: "td-spinner" }),
      /* @__PURE__ */ c.jsxs("div", { children: [
        /* @__PURE__ */ c.jsx("b", { children: "Installing todoist-cli with Homebrew…" }),
        /* @__PURE__ */ c.jsxs("div", { className: "td-dim td-small", children: [
          f,
          ". This can take a few minutes the first time."
        ] }),
        /* @__PURE__ */ c.jsx("div", { className: "td-progress-actions", children: /* @__PURE__ */ c.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => void u("cancel", () => n.call("cancelJob", {})), children: "Cancel" }) })
      ] })
    ] }),
    e.state === "signed-out" && !_ && /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
      /* @__PURE__ */ c.jsxs("p", { children: [
        "Sign in once with your Todoist account. Your browser opens Todoist's sign-in page; the token is stored in your macOS Keychain by ",
        /* @__PURE__ */ c.jsx("code", { children: "td" }),
        ", never by this extension."
      ] }),
      e.error && /* @__PURE__ */ c.jsx("p", { className: "td-warn", children: e.error }),
      /* @__PURE__ */ c.jsxs("button", { className: "td-btn td-btn-primary td-btn-lg", disabled: !!r, onClick: () => void u("login", () => n.call("login", { readOnly: a })), children: [
        r === "login" ? /* @__PURE__ */ c.jsx("span", { className: "td-spinner" }) : null,
        " Sign in with Todoist"
      ] }),
      /* @__PURE__ */ c.jsxs("label", { className: "td-check-row", children: [
        /* @__PURE__ */ c.jsx("input", { type: "checkbox", checked: a, onChange: (S) => s(S.target.checked) }),
        "Read-only access (you can view tasks but not change them)"
      ] }),
      /* @__PURE__ */ c.jsxs("p", { className: "td-dim td-small", children: [
        "Already use ",
        /* @__PURE__ */ c.jsx("code", { children: "td" }),
        " in a terminal? Run ",
        /* @__PURE__ */ c.jsx("code", { children: "td auth login" }),
        " there and press Check again."
      ] })
    ] }),
    _ && k?.kind === "login" && /* @__PURE__ */ c.jsxs("div", { className: "td-progress", children: [
      /* @__PURE__ */ c.jsx("span", { className: "td-spinner" }),
      /* @__PURE__ */ c.jsxs("div", { children: [
        /* @__PURE__ */ c.jsx("b", { children: "Waiting for you to approve access in your browser…" }),
        /* @__PURE__ */ c.jsxs("div", { className: "td-dim td-small", children: [
          f,
          ". Come back here when the page says you are signed in."
        ] }),
        /* @__PURE__ */ c.jsxs("div", { className: "td-progress-actions", children: [
          k.authorizeUrl && /* @__PURE__ */ c.jsxs("button", { className: "td-btn", onClick: () => void n.call("openUrl", { url: k.authorizeUrl }), children: [
            /* @__PURE__ */ c.jsx(ap, { size: 13 }),
            " Open the page again"
          ] }),
          /* @__PURE__ */ c.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => void u("cancel", () => n.call("cancelJob", {})), children: "Cancel" })
        ] })
      ] })
    ] }),
    e.state === "error" && /* @__PURE__ */ c.jsx("p", { className: "td-warn", children: e.error }),
    g && /* @__PURE__ */ c.jsxs("p", { className: "td-warn", children: [
      g.kind === "login" ? "Sign-in did not finish" : "Installation failed",
      ": ",
      g.detail
    ] }),
    l && /* @__PURE__ */ c.jsx("p", { className: "td-warn", children: l }),
    !_ && /* @__PURE__ */ c.jsxs("div", { className: "td-setup-foot", children: [
      /* @__PURE__ */ c.jsxs("button", { className: "td-btn td-btn-ghost", disabled: !!r, onClick: () => void u("retry", t), children: [
        /* @__PURE__ */ c.jsx(op, { size: 13 }),
        " Check again"
      ] }),
      e.state === "td-missing" && /* @__PURE__ */ c.jsx("button", { className: "td-btn td-btn-ghost", onClick: () => m((S) => !S), children: "Set td path…" })
    ] }),
    h && e.state === "td-missing" && /* @__PURE__ */ c.jsxs(
      "form",
      {
        className: "td-path-form",
        onSubmit: (S) => {
          S.preventDefault(), u("path", () => n.call("setSetting", { key: "todoist.tdPath", value: d.trim() }));
        },
        children: [
          /* @__PURE__ */ c.jsx("input", { value: d, onChange: (S) => v(S.target.value), placeholder: "/Users/you/.nvm/versions/node/v24.0.0/bin/td" }),
          /* @__PURE__ */ c.jsx("button", { className: "td-btn", children: "Use" })
        ]
      }
    ),
    e.td && /* @__PURE__ */ c.jsxs("p", { className: "td-dim td-small td-setup-ver", children: [
      "td ",
      e.td.version,
      " · ",
      e.td.path
    ] })
  ] }) });
}
function dp(e) {
  const [t, n] = R.useState(Date.now());
  if (R.useEffect(() => {
    if (e === null) return;
    const o = setInterval(() => n(Date.now()), 1e3);
    return () => clearInterval(o);
  }, [e]), e === null) return "";
  const r = Math.max(0, Math.round((t - e) / 1e3));
  return r < 60 ? `${r} s` : `${Math.floor(r / 60)} min ${r % 60} s`;
}
export {
  Dp as A,
  Hf as B,
  ip as C,
  Fp as D,
  ap as E,
  lp as F,
  Lp as G,
  Mp as H,
  ep as I,
  _p as J,
  Np as K,
  tp as L,
  Rp as M,
  zp as N,
  hp as O,
  Wf as P,
  vp as Q,
  Pp as R,
  Vp as S,
  Tp as T,
  Jf as U,
  Ip as V,
  Op as W,
  op as X,
  mp as a,
  $p as b,
  kp as c,
  Up as d,
  Ap as e,
  cd as f,
  xp as g,
  yp as h,
  gp as i,
  c as j,
  Vf as k,
  pp as l,
  np as m,
  rp as n,
  jp as o,
  Ep as p,
  Zf as q,
  R as r,
  fp as s,
  qf as t,
  Bf as u,
  up as v,
  wp as w,
  bp as x,
  Cp as y,
  Sp as z
};

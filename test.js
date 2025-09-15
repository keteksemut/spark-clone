var f = n(38367),
  h = n(42080),
  p = n(19594),
  _ = n.n(p);
let m = (0, l.forwardRef)((e, t) => {
  let {
      open: n = !1,
      minHeight: i = 0,
      maxHeight: s = 1 / 0,
      displayScrollbarOnOpen: a = !0,
      dispatchResize: u = !0,
      className: c,
      children: p,
      animation: m,
      id: g,
    } = e,
    v = (0, l.useRef)(!1),
    b = d(t),
    y = (0, l.useRef)(null),
    w = (0, l.useRef)(0),
    [k, x] = (0, l.useState)(n || !1),
    j = (0, l.useCallback)(() => {
      if (!y.current || !b.current) return;
      (clearTimeout(w.current), y.current.removeAttribute("inert"));
      let e = (null == m ? void 0 : m.openDuration) || 0.6;
      ((0, h.eR)(
        b.current,
        e,
        {
          height: Math.min(s, y.current.clientHeight) + "px",
        },
        {
          ease: (null == m ? void 0 : m.openEaseCSS) || "default",
        },
      ),
        (w.current = window.setTimeout(() => {
          y.current &&
            b.current &&
            (s < y.current.clientHeight
              ? a && (b.current.style.overflow = "auto")
              : (b.current.style.height = "auto"),
            u && f.U.onResize());
        }, 1e3 * e)));
    }, []),
    O = (0, l.useCallback)(() => {
      if (!y.current || !b.current) return;
      (clearTimeout(w.current), y.current.setAttribute("inert", ""));
      let e = (null == m ? void 0 : m.closeDuration) || 0.6,
        t = Math.min(s, y.current.clientHeight);
      (a && (b.current.style.overflow = "hidden"),
        (0, h.eR)(b.current, 0, {
          height: t + "px",
        }),
        e > 0 &&
          window.setTimeout(() => {
            b.current &&
              ((0, h.eR)(
                b.current,
                e,
                {
                  height: i,
                },
                {
                  ease: (null == m ? void 0 : m.closeEaseCSS) || "default",
                },
              ),
              (w.current = window.setTimeout(() => {
                b.current && u && f.U.onResize();
              }, 1e3 * e)));
          }, 20));
    }, []);
  return (
    (0, l.useEffect)(() => {
      (n ? (j(), x(!0)) : (O(), x(!1)), (v.current = !0));
    }, [n]),
    (0, r.jsx)("div", {
      className: o()(_().collapse, c),
      ref: b,
      id: g,
      "aria-hidden": !k,
      children: (0, r.jsx)("div", {
        ref: y,
        children: p,
      }),
    })
  );
});
var g = n(29906),
  v = n(14849),
  b = n.n(v);
let y = (e) => {
    let [t, n] = (0, l.useState)(
        e
          ? g.Z2.getById(e)
          : {
              id: e || "",
              isOpen: !1,
            },
      ),
      [r, i] = (0, l.useState)(e ? g.Z2.getState() : null),
      s = (0, l.useCallback)(() => {
        let r = e ? g.Z2.getById(e) : null,
          s = g.Z2.getState();
        (s ? i(s) : i(null),
          r
            ? (t && r.isOpen === t.isOpen) ||
              n({
                id: e || "",
                isOpen: r.isOpen,
              })
            : n(null));
      }, [e, t]);
    return (
      (0, l.useEffect)(
        () => (
          g.Z2.subscribe(s),
          () => {
            g.Z2.unsubscribe(s);
          }
        ),
        [s],
      ),
      {
        id: (null == t ? void 0 : t.id) || e || "",
        isOpen: (null == t ? void 0 : t.isOpen) || !1,
        globalState: r,
      }
    );
  },
  w = (0, l.createContext)({
    id: "",
    showOnHover: !1,
  }),
  k = (e) => {
    let {
        id: t,
        open: n,
        children: s,
        showOnHover: u,
        closeOnOutsideClick: c,
        className: d,
      } = e,
      f = (0, a.usePathname)(),
      h = (0, l.useRef)(null),
      [p, _] = (0, l.useState)(n || !1);
    ((0, l.useEffect)(() => g.Z2[n ? "open" : "close"](t), [n, t]),
      (0, l.useEffect)(() => g.Z2.close(t), [f, t]),
      (0, l.useEffect)(
        () => (
          (0, g.BE)({
            id: t,
            isOpen: p,
          }),
          () => {
            (0, g.HJ)(t);
          }
        ),
        [t, p],
      ));
    let m = (0, l.useCallback)(() => {
      let e = g.Z2.getById(t);
      e && _(e.isOpen);
    }, [t]);
    (0, l.useEffect)(
      () => (
        g.Z2.subscribe(m),
        () => {
          g.Z2.unsubscribe(m);
        }
      ),
      [m],
    );
    let v = (0, l.useCallback)(() => {
      if (u) {
        var e;
        g.Z2[
          (
            null == h
              ? void 0
              : null === (e = h.current) || void 0 === e
                ? void 0
                : e.contains(document.activeElement)
          )
            ? "open"
            : "close"
        ](t);
      }
    }, [t, u]);
    return (
      (0, l.useEffect)(
        () => (
          document.addEventListener("focus", v, !0),
          () => {
            document.removeEventListener("focus", v, !0);
          }
        ),
        [v],
      ),
      (0, i.O)({
        ref: h,
        handler: () => c && g.Z2.close(t),
      }),
      (0, r.jsx)(w.Provider, {
        value: {
          id: t,
          showOnHover: u,
        },
        children: (0, r.jsx)("div", {
          ref: h,
          className: o()(b().root, d),
          onMouseEnter: () => u && g.Z2.open(t),
          onMouseLeave: () => u && g.Z2.close(t),
          children: s,
        }),
      })
    );
  };
((k.displayName = "Dropdown"),
  (k.Popover = (e) => {
    let { children: t, className: n } = e,
      { id: i, showOnHover: s } = (0, l.useContext)(w),
      { isOpen: a } = y(i) || {},
      u = (0, l.useRef)(null);
    return (
      (0, l.useEffect)(() => {
        u.current &&
          !s &&
          u.current
            .querySelectorAll("a, button, input, textarea, select, details")
            .forEach((e) => {
              e.tabIndex = a ? 0 : -1;
            });
      }, [a, s]),
      (0, l.useEffect)(() => {
        let e = (e) => {
          a && ("Escape" === e.key || "Esc" === e.key) && g.Z2.close(i);
        };
        return (
          window.addEventListener("keydown", e),
          () => {
            window.removeEventListener("keydown", e);
          }
        );
      }, [a, i]),
      (0, r.jsx)("div", {
        className: o()(b().popover, a && b().popover_open, n),
        id: i,
        "aria-hidden": !a,
        ref: u,
        children: t,
      })
    );
  }),
  (k.Collapse = (e) => {
    let { id: t } = (0, l.useContext)(w),
      { isOpen: n = !1 } = y(t) || {};
    return (0, r.jsx)(m, {
      id: t,
      open: n,
      ...e,
    });
  }),
  (k.Button = (e) => {
    let { children: t, className: n, hasIcon: i = !0 } = e,
      { id: s, showOnHover: a } = (0, l.useContext)(w),
      { isOpen: d } = y(s) || {};
    return (0, r.jsx)("button", {
      className: o()(b().button, n),
      onClick: () => {
        a || g.Z2.toggle(s);
      },
      "aria-controls": s,
      "aria-expanded": d,
      children: (0, r.jsxs)("span", {
        className: b().label,
        children: [
          t,
          i &&
            (0, r.jsxs)("span", {
              className: b().iconContainer,
              children: [
                (0, r.jsx)(u, {
                  className: o()(b().iconMinus, d && b().iconMinus_expanded),
                }),
                (0, r.jsx)(c, {
                  className: o()(b().iconPlus, d && b().iconPlus_expanded),
                }),
              ],
            }),
        ],
      }),
    });
  }));

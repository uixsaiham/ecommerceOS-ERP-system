/* @ds-bundle: {"format":4,"namespace":"CommerceOS","components":[{"name":"Button"},{"name":"Input"},{"name":"Select"},{"name":"SearchField"},{"name":"Checkbox"},{"name":"Tabs"},{"name":"Badge"},{"name":"StatusIndicator"},{"name":"Card"},{"name":"MetricCard"},{"name":"Table"},{"name":"DropdownMenu"},{"name":"Modal"},{"name":"Tooltip"},{"name":"Toast"},{"name":"Alert"},{"name":"Pagination"},{"name":"Breadcrumbs"},{"name":"EmptyState"},{"name":"ErrorState"},{"name":"Spinner"},{"name":"Skeleton"},{"name":"Icon"}]} */
(function () {
  "use strict";
  var React = window.React, ReactDOM = window.ReactDOM;
  var h = React.createElement, useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useId = React.useId, useMemo = React.useMemo, useCallback = React.useCallback;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); }
    return out.join(" ");
  }
  function omit(obj, keys) {
    var o = {};
    for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) o[k] = obj[k]; }
    return o;
  }
  function useControlled(value, defaultValue) {
    var st = useState(defaultValue);
    var isCtl = value !== undefined;
    return [isCtl ? value : st[0], function (v) { if (!isCtl) st[1](v); }];
  }

  /* ---------- Icon: 24px grid, 1.75 stroke, round caps ---------- */
  var P = {
    search: ["c11,11,7", "M20 20l-4-4"],
    "chevron-down": ["M6 9l6 6 6-6"],
    "chevron-up": ["M18 15l-6-6-6 6"],
    "chevron-right": ["M9 6l6 6-6 6"],
    "chevron-left": ["M15 6l-6 6 6 6"],
    "chevrons-up-down": ["M8 9l4-4 4 4", "M8 15l4 4 4-4"],
    "arrow-up": ["M12 19V5", "M5 12l7-7 7 7"],
    "arrow-down": ["M12 5v14", "M19 12l-7 7-7-7"],
    "trending-up": ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
    "trending-down": ["M3 7l6 6 4-4 8 8", "M15 17h6v-6"],
    x: ["M6 6l12 12", "M18 6L6 18"],
    check: ["M5 12.5l4.5 4.5L19 7"],
    minus: ["M6 12h12"],
    plus: ["M12 5v14", "M5 12h14"],
    filter: ["M4 5h16l-6 7.5V18l-4 2v-7.5L4 5z"],
    sliders: ["M4 7h9", "M17 7h3", "c15,7,2", "M4 17h3", "M11 17h9", "c9,17,2"],
    "more-horizontal": ["c6,12,1", "c12,12,1", "c18,12,1"],
    "alert-triangle": ["M10.3 4.3L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z", "M12 9.5v4", "M12 17h.01"],
    "alert-circle": ["c12,12,9", "M12 8v4.5", "M12 16h.01"],
    info: ["c12,12,9", "M12 11v5", "M12 8h.01"],
    "check-circle": ["c12,12,9", "M8.5 12.5l2.5 2.5 4.5-5"],
    package: ["M21 8l-9-5-9 5v8l9 5 9-5V8z", "M3 8l9 5 9-5", "M12 13v8", "M7.5 5.5l9 5"],
    inbox: ["M3 13h5l1.5 3h5l1.5-3h5", "M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2.5-8z"],
    truck: ["M3 6h11v10H3z", "M14 9h4l3 3v4h-7", "c7,18,2", "c17,18,2"],
    download: ["M12 4v11", "M7 10l5 5 5-5", "M5 20h14"],
    upload: ["M12 15V4", "M7 9l5-5 5 5", "M5 20h14"],
    refresh: ["M4 12a8 8 0 0 1 13.7-5.7L20 8.5", "M20 4v4.5h-4.5", "M20 12a8 8 0 0 1-13.7 5.7L4 15.5", "M4 20v-4.5h4.5"],
    edit: ["M4 20h4L19 9l-4-4L4 16v4z", "M13.5 6.5l4 4"],
    trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 13h10l1-13", "M10 11v5", "M14 11v5"],
    copy: ["M9 8h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z", "M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"],
    eye: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z", "c12,12,3"],
    calendar: ["M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "M3 10h18", "M8 3v4", "M16 3v4"],
    lock: ["M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z", "M8 11V7a4 4 0 0 1 8 0v4"],
    "file-text": ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z", "M14 3v5h5", "M9 13h6", "M9 17h6"],
    users: ["c9,8,3.5", "M2.5 20a6.5 6.5 0 0 1 13 0", "M16 4.5a3.5 3.5 0 0 1 0 7", "M18 14.5a6.5 6.5 0 0 1 3.5 5.5"],
    "cloud-off": ["M3 3l18 18", "M8 6.5A6 6 0 0 1 17.7 10H18a4 4 0 0 1 2.4 7.2", "M16 19H7a5 5 0 0 1-1.6-9.7"],
    dashboard: ["M4 4h7v9H4z", "M13 4h7v5h-7z", "M13 11h7v9h-7z", "M4 15h7v5H4z"],
    "shopping-bag": ["M6 7h12l1 13H5L6 7z", "M9 10V6a3 3 0 0 1 6 0v4"],
    tag: ["M4 4h7l9 9-7 7-9-9V4z", "c8.5,8.5,1.5"],
    warehouse: ["M3 21V9l9-5 9 5v12", "M7 21v-8h10v8", "M7 17h10"],
    "clipboard-list": ["M9 3h6v3H9z", "M15 4.5h3a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1h3", "M9 11h6", "M9 15h6", "M9 19h3"],
    factory: ["M3 20V10l6 4v-4l6 4V5h6v15H3z", "M7 17h2", "M12 17h2", "M17 17h1"],
    "rotate-ccw": ["M3 12a9 9 0 1 0 2.6-6.4L3 8", "M3 3v5h5"],
    wallet: ["M19 7V5a1 1 0 0 0-1-1H6a2 2 0 0 0 0 4h13a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6", "c16,13.5,1.25"],
    megaphone: ["M3 10v4h3l7 5V5l-7 5H3z", "M17 9a4 4 0 0 1 0 6", "M20 6.5a8 8 0 0 1 0 11"],
    "bar-chart": ["M4 20h16", "M7 16v-5", "M12 16V6", "M17 16V9"],
    "shield-check": ["M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z", "M9 12l2 2 4-4"],
    settings: ["M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", "c12,12,3"],
    plug: ["M12 22v-5", "M9 8V2", "M15 8V2", "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"],
    bell: ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.94 1.94 0 0 0 3.4 0"],
    "help-circle": ["c12,12,9", "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3", "M12 17h.01"],
    menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
    "panel-left": ["M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z", "M9 4v16"],
    "chevrons-left": ["M11 17l-5-5 5-5", "M18 17l-5-5 5-5"],
    "chevrons-right": ["M13 17l5-5-5-5", "M6 17l5-5-5-5"],
    store: ["M3 9l1.5-5h15L21 9", "M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0", "M5 12v8h14v-8", "M10 20v-5h4v5"],
    "log-out": ["M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4", "M16 17l5-5-5-5", "M21 12H9"],
    user: ["c12,8,4", "M4 21a8 8 0 0 1 16 0"],
    clock: ["c12,12,9", "M12 7v5l3 2"],
    "arrow-right": ["M5 12h14", "M13 6l6 6-6 6"],
    "credit-card": ["M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", "M3 10h18"],
    keyboard: ["M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z", "M7 10h.01", "M11 10h.01", "M15 10h.01", "M7 14h10"]
  };
  function Icon(props) {
    var paths = P[props.name] || P.info;
    var label = props.label;
    return h("svg", {
      className: cx("cx-icon", props.className), viewBox: "0 0 24 24", width: props.size || 16, height: props.size || 16,
      "aria-hidden": label ? undefined : "true", role: label ? "img" : undefined, "aria-label": label, focusable: "false"
    }, paths.map(function (d, i) {
      if (d.charAt(0) === "c") { var p = d.slice(1).split(","); return h("circle", { key: i, cx: p[0], cy: p[1], r: p[2] }); }
      return h("path", { key: i, d: d });
    }));
  }
  Icon.names = Object.keys(P);

  /* ---------- Spinner, Skeleton ---------- */
  function Spinner(props) {
    var size = props.size || "sm";
    var el = h("span", { className: cx("cx-spinner", size !== "sm" && "cx-spinner-" + size, props.className), role: props.label ? "status" : undefined, "aria-label": props.label, "aria-hidden": props.label ? undefined : "true" });
    if (props.text) return h("span", { className: "cx-loading", role: "status" }, el, props.text);
    return el;
  }
  function Skeleton(props) {
    var variant = props.variant || "text";
    var style = Object.assign({ width: props.width != null ? props.width : (variant === "text" ? "100%" : undefined), height: props.height }, props.style);
    if (variant === "circle") { style.width = props.size || 32; style.height = props.size || 32; }
    if (props.lines && props.lines > 1) {
      var items = [];
      for (var i = 0; i < props.lines; i++) items.push(h("span", { key: i, className: "cx-skel cx-skel-text", style: { width: i === props.lines - 1 ? "60%" : "100%" } }));
      return h("span", { className: "cx-skel-stack", "aria-hidden": "true" }, items);
    }
    return h("span", { className: cx("cx-skel", variant === "text" && "cx-skel-text", variant === "circle" && "cx-skel-circle", props.className), style: style, "aria-hidden": "true" });
  }

  /* ---------- Button ---------- */
  function Button(props) {
    var variant = props.variant || "secondary", size = props.size || "md";
    var rest = omit(props, ["variant", "size", "icon", "iconRight", "iconOnly", "loading", "className", "children", "href", "type"]);
    var cls = cx("cx-btn", "cx-btn-" + variant, size !== "md" && "cx-btn-" + size, props.iconOnly && "cx-btn-icononly", props.className);
    var content = [
      props.loading ? h(Spinner, { key: "s" }) : (props.icon ? h(Icon, { key: "i", name: props.icon }) : null),
      props.iconOnly ? null : h(React.Fragment, { key: "c" }, props.children),
      props.iconRight && !props.iconOnly ? h(Icon, { key: "r", name: props.iconRight }) : null
    ];
    if (props.href) return h("a", Object.assign({ className: cls, href: props.href }, rest), content);
    return h("button", Object.assign({ type: props.type || "button", className: cls, "aria-busy": props.loading ? "true" : undefined }, rest, { disabled: props.disabled || props.loading }), content);
  }

  /* ---------- Field shell ---------- */
  function Field(p) {
    return h("div", { className: cx("cx-field", p.className) },
      p.label ? h("label", { className: "cx-label", htmlFor: p.id }, p.label,
        p.required ? h("span", { className: "cx-req", "aria-hidden": "true" }, "*") : null,
        p.optional ? h("span", { className: "cx-optional" }, "Optional") : null) : null,
      p.children,
      p.error ? h("div", { className: "cx-err", id: p.id + "-err" }, h(Icon, { name: "alert-circle" }), h("span", null, p.error))
        : (p.hint ? h("div", { className: "cx-hint", id: p.id + "-hint" }, p.hint) : null));
  }
  function describedBy(id, p) { return p.error ? id + "-err" : (p.hint ? id + "-hint" : undefined); }

  function Input(props) {
    var autoId = useId(); var id = props.id || autoId; var size = props.size || "md";
    var rest = omit(props, ["label", "hint", "error", "optional", "prefix", "suffix", "icon", "size", "className", "id", "width"]);
    return h(Field, { id: id, label: props.label, hint: props.hint, error: props.error, required: props.required, optional: props.optional, className: props.className },
      h("div", { className: cx("cx-control", size !== "md" && "cx-control-" + size, props.error && "is-invalid", props.disabled && "is-disabled"), style: props.width ? { width: props.width } : undefined },
        props.icon ? h(Icon, { name: props.icon }) : null,
        props.prefix ? h("span", { className: "cx-affix" }, props.prefix) : null,
        h("input", Object.assign({ id: id, "aria-invalid": props.error ? "true" : undefined, "aria-describedby": describedBy(id, props) }, rest)),
        props.suffix ? h("span", { className: "cx-affix" }, props.suffix) : null));
  }

  function Select(props) {
    var autoId = useId(); var id = props.id || autoId; var size = props.size || "md";
    var rest = omit(props, ["label", "hint", "error", "optional", "options", "placeholder", "size", "className", "id", "children", "width", "onValueChange"]);
    var onChange = function (e) { if (props.onChange) props.onChange(e); if (props.onValueChange) props.onValueChange(e.target.value); };
    var opts = props.options ? props.options.map(function (o) {
      var v = typeof o === "object" ? o : { value: o, label: String(o) };
      return h("option", { key: v.value, value: v.value, disabled: v.disabled }, v.label);
    }) : props.children;
    return h(Field, { id: id, label: props.label, hint: props.hint, error: props.error, required: props.required, optional: props.optional, className: props.className },
      h("div", { className: cx("cx-control cx-select", size !== "md" && "cx-control-" + size, props.error && "is-invalid", props.disabled && "is-disabled"), style: props.width ? { width: props.width } : undefined },
        h("select", Object.assign({ id: id, "aria-invalid": props.error ? "true" : undefined, "aria-describedby": describedBy(id, props) }, rest, { onChange: onChange }),
          props.placeholder ? h("option", { value: "", disabled: true }, props.placeholder) : null, opts),
        h(Icon, { name: "chevron-down", className: "cx-select-chevron" })));
  }

  function SearchField(props) {
    var autoId = useId(); var id = props.id || autoId; var size = props.size || "md";
    var ctl = useControlled(props.value, props.defaultValue || ""); var value = ctl[0], setValue = ctl[1];
    var ref = useRef(null);
    var shortcut = props.shortcut === undefined ? "/" : props.shortcut;
    useEffect(function () {
      if (!shortcut) return;
      function onKey(e) {
        var t = e.target, tag = t && t.tagName;
        if (e.key !== shortcut || e.metaKey || e.ctrlKey || e.altKey) return;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
        e.preventDefault(); if (ref.current) ref.current.focus();
      }
      document.addEventListener("keydown", onKey);
      return function () { document.removeEventListener("keydown", onKey); };
    }, [shortcut]);
    function change(v) { setValue(v); if (props.onChange) props.onChange(v); }
    return h("div", { className: cx("cx-control cx-search", size !== "md" && "cx-control-" + size, props.className), style: props.width ? { width: props.width } : undefined, role: "search" },
      props.loading ? h(Spinner, null) : h(Icon, { name: "search" }),
      h("label", { className: "cx-sr", htmlFor: id }, props.label || "Search"),
      h("input", {
        id: id, ref: ref, type: "search", value: value, placeholder: props.placeholder || "Search", autoComplete: "off",
        onChange: function (e) { change(e.target.value); },
        onKeyDown: function (e) { if (e.key === "Escape" && value) { e.preventDefault(); change(""); if (props.onClear) props.onClear(); } if (e.key === "Enter" && props.onSubmit) props.onSubmit(value); }
      }),
      value ? h("button", { type: "button", className: "cx-search-clear", "aria-label": "Clear search", onClick: function () { change(""); if (props.onClear) props.onClear(); if (ref.current) ref.current.focus(); } }, h(Icon, { name: "x" }))
        : (shortcut ? h("kbd", { className: "cx-kbd", "aria-hidden": "true" }, shortcut) : null));
  }

  /* ---------- Checkbox ---------- */
  function Checkbox(props) {
    var autoId = useId(); var id = props.id || autoId; var ref = useRef(null);
    useEffect(function () { if (ref.current) ref.current.indeterminate = !!props.indeterminate; }, [props.indeterminate]);
    var input = h("span", { className: "cx-check-wrap" },
      h("input", {
        ref: ref, id: id, type: "checkbox", checked: !!props.checked, disabled: props.disabled, "aria-label": props.label ? undefined : props["aria-label"],
        onChange: function (e) { if (props.onChange) props.onChange(e.target.checked, e); }, onClick: props.onClick
      }),
      h("span", { className: "cx-check-box", "aria-hidden": "true" }, h(Icon, { name: props.indeterminate ? "minus" : "check" })));
    if (!props.label) return h("span", { className: cx("cx-check", props.disabled && "is-disabled", props.className) }, input);
    return h("label", { className: cx("cx-check", props.disabled && "is-disabled", props.className), htmlFor: id }, input, h("span", null, props.label));
  }

  /* ---------- Tabs ---------- */
  function Tabs(props) {
    var items = props.items || [];
    var ctl = useControlled(props.value, props.defaultValue || (items[0] && items[0].id)); var value = ctl[0], setValue = ctl[1];
    var base = useId(); var listRef = useRef(null);
    function select(id) { setValue(id); if (props.onChange) props.onChange(id); }
    function onKey(e) {
      var enabled = items.filter(function (t) { return !t.disabled; });
      var idx = enabled.findIndex(function (t) { return t.id === value; }); var next = null;
      if (e.key === "ArrowRight") next = enabled[(idx + 1) % enabled.length];
      else if (e.key === "ArrowLeft") next = enabled[(idx - 1 + enabled.length) % enabled.length];
      else if (e.key === "Home") next = enabled[0];
      else if (e.key === "End") next = enabled[enabled.length - 1];
      if (next) {
        e.preventDefault(); select(next.id);
        var btn = listRef.current && listRef.current.querySelector('[data-tab="' + next.id + '"]'); if (btn) btn.focus();
      }
    }
    var list = h("div", { ref: listRef, role: "tablist", "aria-label": props["aria-label"], className: cx("cx-tabs", props.variant === "segmented" && "cx-tabs-segmented", props.className), onKeyDown: onKey },
      items.map(function (t) {
        var sel = t.id === value;
        return h("button", {
          key: t.id, type: "button", role: "tab", className: "cx-tab", "data-tab": t.id, id: base + "-tab-" + t.id,
          "aria-selected": sel ? "true" : "false", "aria-controls": props.renderPanel ? base + "-panel" : undefined,
          tabIndex: sel ? 0 : -1, disabled: t.disabled, onClick: function () { select(t.id); }
        }, t.label, t.count != null ? h("span", { className: "cx-tab-count" }, t.count) : null);
      }));
    if (!props.renderPanel) return list;
    return h("div", null, list, h("div", { role: "tabpanel", id: base + "-panel", "aria-labelledby": base + "-tab-" + value, tabIndex: 0, className: "cx-focus" }, props.renderPanel(value)));
  }

  /* ---------- Badge, StatusIndicator ---------- */
  function Badge(props) {
    var tone = props.tone || "neutral";
    return h("span", { className: cx("cx-badge", tone !== "neutral" && "cx-badge-" + tone, props.size === "lg" && "cx-badge-lg", props.className) },
      props.dot ? h("span", { className: cx("cx-dot", "cx-dot-" + tone), style: { width: 6, height: 6 }, "aria-hidden": "true" }) : null,
      props.icon ? h(Icon, { name: props.icon }) : null, props.children);
  }

  var STATUS = {
    draft: ["neutral", "Draft"], pending: ["warning", "Pending"], awaiting_payment: ["warning", "Awaiting payment"],
    processing: ["info", "Processing"], picking: ["info", "Picking"], packed: ["brand", "Packed"], shipped: ["brand", "Shipped"],
    in_transit: ["info", "In transit"], delivered: ["success", "Delivered"], completed: ["success", "Completed"],
    on_hold: ["danger", "On hold"], payment_failed: ["danger", "Payment failed"], cancelled: ["neutral", "Cancelled"],
    refunded: ["neutral", "Refunded"], returned: ["neutral", "Returned"],
    in_stock: ["success", "In stock"], low_stock: ["warning", "Low stock"], out_of_stock: ["danger", "Out of stock"],
    overstock: ["info", "Overstock"], confirmed: ["info", "Confirmed"], ready_to_ship: ["brand", "Ready to ship"],
    unfulfilled: ["warning", "Unfulfilled"], partially_fulfilled: ["warning", "Partially fulfilled"], fulfilled: ["success", "Fulfilled"], refund_pending: ["warning", "Refund pending"], awaiting_approval: ["warning", "Awaiting approval"],
    backordered: ["info", "Backordered"], discontinued: ["neutral", "Discontinued"],
    paid: ["success", "Paid"], partially_paid: ["warning", "Partially paid"], unpaid: ["warning", "Unpaid"], overdue: ["danger", "Overdue"],
    ordered: ["info", "Ordered"], partially_received: ["warning", "Partially received"], received: ["success", "Received"],
    active: ["success", "Active"], inactive: ["neutral", "Inactive"], invited: ["info", "Invited"], suspended: ["danger", "Suspended"]
  };
  function StatusIndicator(props) {
    var s = STATUS[props.status] || [props.tone || "neutral", props.status];
    var tone = props.tone || s[0], label = props.label || s[1];
    if (props.variant === "badge") return h(Badge, { tone: tone, dot: true }, label);
    return h("span", { className: cx("cx-status", props.className) },
      h("span", { className: cx("cx-dot", tone !== "neutral" && "cx-dot-" + tone, props.pulse && "cx-dot-pulse"), "aria-hidden": "true" }),
      h("span", null, label),
      props.meta ? h("span", { className: "cx-status-meta" }, props.meta) : null);
  }

  /* ---------- Tooltip ---------- */
  function Tooltip(props) {
    var st = useState(false), show = st[0], setShow = st[1]; var id = useId(); var timer = useRef(null);
    var open = props.open != null ? props.open : show;
    function on() { clearTimeout(timer.current); timer.current = setTimeout(function () { setShow(true); }, props.delay != null ? props.delay : 300); }
    function off() { clearTimeout(timer.current); setShow(false); }
    useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
    var child = React.Children.toArray(props.children).filter(React.isValidElement)[0];
    var trigger = child ? React.cloneElement(child, { "aria-describedby": open ? id : undefined }) : props.children;
    return h("span", {
      className: "cx-tip-wrap", onMouseEnter: on, onMouseLeave: off, onFocus: function () { setShow(true); }, onBlur: off,
      onKeyDown: function (e) { if (e.key === "Escape") off(); }
    }, trigger,
      open ? h("span", { role: "tooltip", id: id, className: cx("cx-tip", props.side === "bottom" && "cx-tip-bottom") }, props.content,
        props.shortcut ? h("kbd", { className: "cx-kbd" }, props.shortcut) : null) : null);
  }

  /* ---------- Card, MetricCard ---------- */
  function Card(props) {
    var hasHead = props.title || props.actions;
    return h("section", { className: cx("cx-card", props.compact && "cx-card-compact", props.className), style: props.style, "aria-label": typeof props.title === "string" ? props.title : undefined },
      hasHead ? h("header", { className: cx("cx-card-head", !props.divider && props.divider !== undefined && "is-flush") },
        h("div", { style: { minWidth: 0 } },
          props.title ? h("h3", { className: "cx-card-title" }, props.title) : null,
          props.description ? h("p", { className: "cx-card-desc" }, props.description) : null),
        props.actions ? h("div", { className: "cx-btn-group" }, props.actions) : null) : null,
      h("div", { className: cx("cx-card-body", props.flush && "is-flush") }, props.children),
      props.footer ? h("footer", { className: "cx-card-foot" }, props.footer) : null);
  }

  function Sparkline(p) {
    var d = p.data; if (!d || d.length < 2) return null;
    var W = 200, H = 32, pad = 3, min = Math.min.apply(null, d), max = Math.max.apply(null, d), rng = max - min || 1;
    var pts = d.map(function (v, i) { return [(i / (d.length - 1)) * (W - pad * 2) + pad, H - pad - ((v - min) / rng) * (H - pad * 2)]; });
    var line = pts.map(function (q, i) { return (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" ");
    var last = pts[pts.length - 1];
    return h("svg", { className: "cx-spark", viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", "aria-hidden": "true" },
      h("path", { className: "cx-spark-area", d: line + " L" + last[0].toFixed(1) + " " + H + " L" + pad + " " + H + " Z", opacity: 0.7 }),
      h("path", { className: "cx-spark-line", d: line, vectorEffect: "non-scaling-stroke" }),
      h("circle", { className: "cx-spark-end", cx: last[0], cy: last[1], r: 2.5 }));
  }
  function MetricCard(props) {
    var dl = props.delta; var dir = dl && (dl.direction || "flat");
    var good = dl && (dl.good != null ? dl.good : dir === "up");
    var tone = !dl || dir === "flat" ? "flat" : (good ? "up" : "down");
    return h("section", { className: cx("cx-card cx-metric", props.className), "aria-label": typeof props.label === "string" ? props.label : undefined },
      h("div", { className: "cx-metric-label" }, h("span", null, props.label), props.info ? h(Tooltip, { content: props.info }, h("button", { type: "button", className: "cx-iconbtn", "aria-label": "About this metric" }, h(Icon, { name: "info" }))) : null),
      props.loading ? h(Skeleton, { width: "60%", height: 36, variant: "rect" }) : h("div", { className: "cx-metric-value" }, props.value),
      h("div", { className: "cx-metric-foot" },
        dl && !props.loading ? h("span", { className: "cx-delta cx-delta-" + tone },
          h(Icon, { name: dir === "up" ? "trending-up" : dir === "down" ? "trending-down" : "minus" }),
          dl.value, h("span", { className: "cx-sr" }, good ? " (favorable)" : dir === "flat" ? "" : " (unfavorable)")) : null,
        props.comparison ? h("span", null, props.comparison) : null),
      props.trend && !props.loading ? h(Sparkline, { data: props.trend }) : null);
  }

  /* ---------- Table ---------- */
  function Table(props) {
    var columns = props.columns || [], rowKey = props.rowKey || "id";
    var selCtl = useControlled(props.selected, []); var selected = selCtl[0];
    var sortCtl = useControlled(props.sort, props.defaultSort || null); var sort = sortCtl[0];
    function setSelected(v) { selCtl[1](v); if (props.onSelectedChange) props.onSelectedChange(v); }
    function setSort(v) { sortCtl[1](v); if (props.onSortChange) props.onSortChange(v); }
    var rows = useMemo(function () {
      var r = props.rows || [];
      if (!sort || props.sort !== undefined || props.manualSort) return r;
      var col = columns.find(function (c) { return c.key === sort.key; }); if (!col) return r;
      var get = col.sortValue || function (row) { return row[col.key]; };
      return r.slice().sort(function (a, b) {
        var x = get(a), y = get(b); var res = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return sort.dir === "desc" ? -res : res;
      });
    }, [props.rows, sort, columns, props.sort, props.manualSort]);
    var ids = rows.map(function (r) { return r[rowKey]; });
    var allSel = ids.length > 0 && ids.every(function (id) { return selected.indexOf(id) >= 0; });
    var someSel = !allSel && ids.some(function (id) { return selected.indexOf(id) >= 0; });
    function toggleAll(on) { setSelected(on ? ids.slice() : []); }
    function toggle(id, on) { setSelected(on ? selected.concat([id]) : selected.filter(function (x) { return x !== id; })); }
    function sortBy(key) {
      if (!sort || sort.key !== key) setSort({ key: key, dir: "asc" });
      else if (sort.dir === "asc") setSort({ key: key, dir: "desc" });
      else setSort(null);
    }
    var colCount = columns.length + (props.selectable ? 1 : 0) + (props.rowActions ? 1 : 0);
    var head = h("thead", null, h("tr", null,
      props.selectable ? h("th", { className: "cx-col-check", scope: "col" }, h(Checkbox, { "aria-label": "Select all rows", checked: allSel, indeterminate: someSel, onChange: toggleAll, disabled: props.loading || !ids.length })) : null,
      columns.map(function (c) {
        var sorted = sort && sort.key === c.key;
        var aria = sorted ? (sort.dir === "asc" ? "ascending" : "descending") : (c.sortable ? "none" : undefined);
        return h("th", { key: c.key, scope: "col", className: c.align ? "is-" + c.align : undefined, style: { width: c.width }, "aria-sort": aria },
          c.sortable ? h("button", { type: "button", className: cx("cx-th-sort", sorted && "is-sorted"), onClick: function () { sortBy(c.key); } },
            c.header, h(Icon, { name: sorted ? (sort.dir === "asc" ? "arrow-up" : "arrow-down") : "chevrons-up-down" })) : c.header);
      }),
      props.rowActions ? h("th", { className: "cx-col-actions", scope: "col" }, h("span", { className: "cx-sr" }, "Actions")) : null));
    var body;
    if (props.loading) {
      var sk = []; for (var i = 0; i < (props.loadingRows || 5); i++) {
        sk.push(h("tr", { key: i }, props.selectable ? h("td", { className: "cx-col-check" }, h(Skeleton, { variant: "rect", width: 16, height: 16 })) : null,
          columns.map(function (c, j) { return h("td", { key: c.key, className: c.align ? "is-" + c.align : undefined }, h(Skeleton, { width: j === 0 ? "70%" : (c.align === "right" ? 56 : "55%"), style: { display: "inline-block" } })); }),
          props.rowActions ? h("td", { className: "cx-col-actions" }) : null));
      }
      body = h("tbody", { "aria-busy": "true" }, sk);
    } else if (props.error || !rows.length) {
      body = h("tbody", { className: "cx-table-empty" }, h("tr", null, h("td", { colSpan: colCount }, props.error || props.empty || h(EmptyState, { size: "sm", icon: "inbox", title: "No records", description: "Records you add will appear here." }))));
    } else {
      body = h("tbody", null, rows.map(function (r) {
        var id = r[rowKey], isSel = selected.indexOf(id) >= 0;
        return h("tr", { key: id, className: isSel ? "is-selected" : undefined, "aria-selected": props.selectable ? (isSel ? "true" : "false") : undefined, onClick: props.onRowClick ? function (e) { if (e.target.closest("button,a,input,label")) return; props.onRowClick(r); } : undefined, style: props.onRowClick ? { cursor: "pointer" } : undefined },
          props.selectable ? h("td", { className: "cx-col-check" }, h(Checkbox, { "aria-label": "Select row " + id, checked: isSel, onChange: function (on) { toggle(id, on); } })) : null,
          columns.map(function (c) { return h("td", { key: c.key, className: c.align ? "is-" + c.align : undefined }, c.render ? c.render(r) : r[c.key]); }),
          props.rowActions ? h("td", { className: "cx-col-actions" }, props.rowActions(r)) : null);
      }));
    }
    var bulk = props.selectable && selected.length && props.bulkActions ? h("div", { className: "cx-bulkbar", role: "region", "aria-label": "Bulk actions" },
      h("span", null, selected.length + " selected"),
      h(Button, { variant: "ghost", size: "sm", onClick: function () { setSelected([]); } }, "Clear"),
      h("div", { className: "cx-bulkbar-actions" }, props.bulkActions(selected))) : null;
    return h("div", { className: cx("cx-table-wrap", props.className) },
      bulk || props.toolbar || null,
      h("div", { className: "cx-table-scroll", style: props.maxHeight ? { maxHeight: props.maxHeight, overflowY: "auto" } : undefined },
        h("table", { className: cx("cx-table", props.density === "compact" && "cx-table-compact"), "aria-label": props["aria-label"], "aria-rowcount": props.totalRows },
          props.caption ? h("caption", { className: "cx-sr" }, props.caption) : null, head, body)),
      props.footer ? h("div", { style: { borderTop: "1px solid var(--border)" } }, props.footer) : null);
  }
  function TableToolbar(props) {
    return h("div", { className: "cx-table-toolbar" }, props.children, props.end ? h("div", { className: "cx-table-toolbar-end" }, props.end) : null);
  }

  /* ---------- DropdownMenu ---------- */
  function DropdownMenu(props) {
    var st = useState(!!props.defaultOpen), open = st[0], setOpen = st[1];
    var wrap = useRef(null), menu = useRef(null), menuId = useId();
    useEffect(function () {
      if (!open) return;
      function onDoc(e) { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); }
      document.addEventListener("mousedown", onDoc);
      return function () { document.removeEventListener("mousedown", onDoc); };
    }, [open]);
    function focusItem(dir) {
      var els = menu.current ? Array.prototype.slice.call(menu.current.querySelectorAll(".cx-menu-item:not([disabled])")) : [];
      if (!els.length) return; var i = els.indexOf(document.activeElement);
      var n = dir === "first" ? 0 : dir === "last" ? els.length - 1 : (i + dir + els.length) % els.length; els[n].focus();
    }
    function openMenu(focus) { setOpen(true); setTimeout(function () { focusItem(focus || "first"); }, 0); }
    function close(refocus) { setOpen(false); if (refocus && wrap.current) { var b = wrap.current.querySelector("[aria-haspopup]"); if (b) b.focus(); } }
    function onMenuKey(e) {
      if (e.key === "ArrowDown") { e.preventDefault(); focusItem(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); focusItem(-1); }
      else if (e.key === "Home") { e.preventDefault(); focusItem("first"); }
      else if (e.key === "End") { e.preventDefault(); focusItem("last"); }
      else if (e.key === "Escape" || e.key === "Tab") { if (e.key === "Escape") e.preventDefault(); close(e.key === "Escape"); }
    }
    var trigger = props.trigger || h(Button, { variant: "secondary", iconRight: "chevron-down" }, props.label || "Actions");
    trigger = React.cloneElement(trigger, {
      "aria-haspopup": "menu", "aria-expanded": open ? "true" : "false", "aria-controls": open ? menuId : undefined,
      onClick: function () { open ? setOpen(false) : openMenu("first"); },
      onKeyDown: function (e) { if (e.key === "ArrowDown") { e.preventDefault(); openMenu("first"); } if (e.key === "ArrowUp") { e.preventDefault(); openMenu("last"); } }
    });
    return h("div", { className: "cx-dd", ref: wrap }, trigger,
      open ? h("div", { className: cx("cx-menu", props.align === "end" ? "cx-menu-end" : "cx-menu-start"), role: "menu", id: menuId, ref: menu, onKeyDown: onMenuKey },
        (props.items || []).map(function (it, i) {
          if (it.type === "separator") return h("div", { key: i, className: "cx-menu-sep", role: "separator" });
          if (it.type === "group") return h("div", { key: i, className: "cx-menu-group", role: "presentation" }, it.label);
          return h("button", {
            key: i, type: "button", role: "menuitem", tabIndex: -1, disabled: it.disabled, className: cx("cx-menu-item", it.danger && "is-danger"),
            onClick: function () { close(true); if (it.onSelect) it.onSelect(); }
          }, it.icon ? h(Icon, { name: it.icon }) : null, h("span", null, it.label), it.shortcut ? h("span", { className: "cx-menu-shortcut" }, it.shortcut) : null);
        })) : null);
  }

  /* ---------- Modal ---------- */
  function Modal(props) {
    var panel = useRef(null), titleId = useId(), descId = useId();
    useEffect(function () {
      if (!props.open) return;
      var prev = document.activeElement;
      var t = setTimeout(function () {
        if (!panel.current) return;
        var target = (props.initialFocus && panel.current.querySelector(props.initialFocus)) || panel.current.querySelector("[data-autofocus]") || panel.current.querySelector("input,select,textarea") || panel.current;
        target.focus();
      }, 0);
      function onKey(e) {
        if (e.key === "Escape" && props.onClose) { e.stopPropagation(); props.onClose(); }
        if (e.key === "Tab" && panel.current) {
          var f = panel.current.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
          if (!f.length) return; var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
      document.addEventListener("keydown", onKey);
      return function () { clearTimeout(t); document.removeEventListener("keydown", onKey); if (prev && prev.focus) prev.focus(); };
    }, [props.open]);
    if (!props.open) return null;
    var node = h("div", { className: "cx-overlay", onMouseDown: function (e) { if (e.target === e.currentTarget && props.dismissible !== false && props.onClose) props.onClose(); } },
      h("div", { ref: panel, role: props.tone === "danger" ? "alertdialog" : "dialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": props.description ? descId : undefined, tabIndex: -1, className: cx("cx-modal", "cx-modal-" + (props.size || "md")) },
        h("div", { className: "cx-modal-head" },
          props.tone === "danger" ? h("span", { className: "cx-modal-icon" }, h(Icon, { name: "alert-triangle" })) : null,
          h("div", { className: "cx-modal-titles" },
            h("h2", { className: "cx-modal-title", id: titleId }, props.title),
            props.description ? h("p", { className: "cx-modal-desc", id: descId }, props.description) : null),
          h("button", { type: "button", className: "cx-iconbtn", "aria-label": "Close", onClick: props.onClose }, h(Icon, { name: "x" }))),
        props.children ? h("div", { className: "cx-modal-body" }, props.children) : null,
        props.footer ? h("div", { className: "cx-modal-foot" }, props.footer) : null));
    return props.inline ? node : ReactDOM.createPortal(node, document.body);
  }

  /* ---------- Toast ---------- */
  var TONE_ICON = { success: "check-circle", danger: "alert-circle", warning: "alert-triangle", info: "info", neutral: "info" };
  function Toast(props) {
    var tone = props.tone || "neutral";
    return h("div", { className: cx("cx-toast", props.className), role: tone === "danger" ? "alert" : "status" },
      h(Icon, { name: TONE_ICON[tone], className: "cx-tone-" + tone }),
      h("div", { className: "cx-toast-body" },
        h("div", { className: "cx-toast-title" }, props.title),
        props.message ? h("div", { className: "cx-toast-msg" }, props.message) : null,
        props.action ? h("div", { className: "cx-toast-action" }, h(Button, { variant: "link", onClick: props.action.onClick }, props.action.label)) : null),
      props.onDismiss ? h("button", { type: "button", className: "cx-iconbtn", "aria-label": "Dismiss notification", onClick: props.onDismiss }, h(Icon, { name: "x" })) : null);
  }
  var ToastCtx = React.createContext(null);
  function ToastProvider(props) {
    var st = useState([]), list = st[0], setList = st[1]; var seq = useRef(0);
    var dismiss = useCallback(function (id) { setList(function (l) { return l.filter(function (t) { return t.id !== id; }); }); }, []);
    var show = useCallback(function (t) {
      var id = ++seq.current; var dur = t.duration != null ? t.duration : (t.tone === "danger" ? 0 : 5000);
      setList(function (l) { return l.concat([Object.assign({ id: id }, t)]).slice(-4); });
      if (dur) setTimeout(function () { dismiss(id); }, dur);
      return id;
    }, [dismiss]);
    var api = useMemo(function () { return { show: show, dismiss: dismiss }; }, [show, dismiss]);
    return h(ToastCtx.Provider, { value: api }, props.children,
      h("div", { className: "cx-toasts", "aria-live": "polite" }, list.map(function (t) {
        return h(Toast, Object.assign({ key: t.id }, t, { onDismiss: function () { dismiss(t.id); } }));
      })));
  }
  function useToast() { var c = React.useContext(ToastCtx); if (!c) throw new Error("useToast needs a ToastProvider above it."); return c; }

  /* ---------- Alert ---------- */
  function Alert(props) {
    var tone = props.tone || "info";
    return h("div", { className: cx("cx-alert", "cx-alert-" + tone, props.className), role: tone === "danger" ? "alert" : "status" },
      h(Icon, { name: TONE_ICON[tone], className: "cx-tone-" + tone }),
      h("div", { className: "cx-alert-body" },
        props.title ? h("div", { className: "cx-alert-title" }, props.title) : null,
        props.children ? h("div", null, props.children) : null,
        props.actions ? h("div", { className: "cx-alert-actions" }, props.actions) : null),
      props.onDismiss ? h("button", { type: "button", className: "cx-iconbtn", "aria-label": "Dismiss", onClick: props.onDismiss }, h(Icon, { name: "x" })) : null);
  }

  /* ---------- Pagination ---------- */
  function pageList(page, count, sib) {
    var out = [], start = Math.max(2, page - sib), end = Math.min(count - 1, page + sib);
    if (page - sib <= 3) { start = 2; end = Math.min(count - 1, Math.max(end, 2 + sib * 2)); }
    if (page + sib >= count - 2) { end = count - 1; start = Math.max(2, Math.min(start, count - 1 - sib * 2)); }
    out.push(1); if (start > 2) out.push("gap-a");
    for (var i = start; i <= end; i++) out.push(i);
    if (end < count - 1) out.push("gap-b"); if (count > 1) out.push(count);
    return out;
  }
  function Pagination(props) {
    var size = props.pageSize || 25, total = props.total || 0, count = Math.max(1, Math.ceil(total / size));
    var page = Math.min(Math.max(1, props.page || 1), count);
    var from = total ? (page - 1) * size + 1 : 0, to = Math.min(total, page * size);
    var nf = new Intl.NumberFormat("en-US");
    function go(p) { if (p >= 1 && p <= count && p !== page && props.onPageChange) props.onPageChange(p); }
    return h("nav", { className: cx("cx-pager", props.className), "aria-label": "Pagination" },
      h("span", { className: "cx-pager-range", "aria-live": "polite" }, h("strong", null, nf.format(from) + "–" + nf.format(to)), " of ", nf.format(total) + " " + (props.itemLabel || "results")),
      props.onPageSizeChange ? h("span", { className: "cx-pager-size" }, "Rows per page",
        h(Select, { size: "sm", "aria-label": "Rows per page", value: String(size), options: (props.pageSizeOptions || [25, 50, 100]).map(String), onValueChange: function (v) { props.onPageSizeChange(Number(v)); } })) : null,
      h("div", { className: "cx-pager-pages" },
        h("button", { type: "button", className: "cx-page-btn", "aria-label": "Previous page", disabled: page <= 1, onClick: function () { go(page - 1); } }, h(Icon, { name: "chevron-left" })),
        pageList(page, count, props.siblingCount != null ? props.siblingCount : 1).map(function (p) {
          if (typeof p === "string") return h("span", { key: p, className: "cx-page-gap", "aria-hidden": "true" }, "…");
          return h("button", { key: p, type: "button", className: "cx-page-btn", "aria-current": p === page ? "page" : undefined, "aria-label": "Page " + p, onClick: function () { go(p); } }, nf.format(p));
        }),
        h("button", { type: "button", className: "cx-page-btn", "aria-label": "Next page", disabled: page >= count, onClick: function () { go(page + 1); } }, h(Icon, { name: "chevron-right" }))));
  }

  /* ---------- Breadcrumbs ---------- */
  function Breadcrumbs(props) {
    var items = props.items || [], max = props.maxItems || 4;
    var shown = items.length > max ? [items[0], { label: "…", collapsed: true }].concat(items.slice(items.length - (max - 2))) : items;
    return h("nav", { className: cx("cx-crumbs", props.className), "aria-label": "Breadcrumb" },
      h("ol", null, shown.map(function (it, i) {
        var last = i === shown.length - 1;
        var inner = last ? h("span", { "aria-current": "page" }, it.label)
          : it.collapsed ? h("span", { title: items.slice(1, items.length - (max - 2)).map(function (x) { return x.label; }).join(" / ") }, "…")
            : h("a", { href: it.href || "#", onClick: it.onClick }, it.label);
        return h("li", { key: i, className: "cx-crumb" }, inner, last ? null : h(Icon, { name: "chevron-right", className: "cx-crumb-sep" }));
      })));
  }

  /* ---------- EmptyState, ErrorState ---------- */
  function EmptyState(props) {
    var size = props.size || "md";
    return h("div", { className: cx("cx-state", size !== "md" && "cx-state-" + size, props.className) },
      props.icon !== null ? h("span", { className: "cx-state-icon", "aria-hidden": "true" }, h(Icon, { name: props.icon || "inbox" })) : null,
      h("div", { className: "cx-state-text" },
        h("h3", { className: "cx-state-title" }, props.title),
        props.description ? h("p", { className: "cx-state-desc" }, props.description) : null),
      props.action || props.secondaryAction ? h("div", { className: "cx-state-actions" }, props.secondaryAction, props.action) : null,
      props.children);
  }
  function ErrorState(props) {
    var size = props.size || "md";
    return h("div", { className: cx("cx-state", size !== "md" && "cx-state-" + size, props.className), role: "alert" },
      h("span", { className: "cx-state-icon is-danger", "aria-hidden": "true" }, h(Icon, { name: props.icon || "alert-triangle" })),
      h("div", { className: "cx-state-text" },
        h("h3", { className: "cx-state-title" }, props.title || "Couldn’t load this data"),
        h("p", { className: "cx-state-desc" }, props.description || "Check your connection and try again. If it keeps happening, contact your admin with the reference below.")),
      props.onRetry || props.secondaryAction ? h("div", { className: "cx-state-actions" }, props.secondaryAction,
        props.onRetry ? h(Button, { variant: "secondary", icon: "refresh", onClick: props.onRetry, loading: props.retrying }, props.retryLabel || "Try again") : null) : null,
      props.code ? h("span", { className: "cx-state-code" }, "Reference " + props.code) : null);
  }

  window.CommerceOS = Object.assign(window.CommerceOS || {}, {
    Button: Button, Input: Input, Select: Select, SearchField: SearchField, Checkbox: Checkbox, Tabs: Tabs,
    Badge: Badge, StatusIndicator: StatusIndicator, STATUS: STATUS, Card: Card, MetricCard: MetricCard,
    Table: Table, TableToolbar: TableToolbar, DropdownMenu: DropdownMenu, Modal: Modal, Tooltip: Tooltip,
    Toast: Toast, ToastProvider: ToastProvider, useToast: useToast, Alert: Alert, Pagination: Pagination,
    Breadcrumbs: Breadcrumbs, EmptyState: EmptyState, ErrorState: ErrorState, Spinner: Spinner, Skeleton: Skeleton, Icon: Icon
  });
})();

/* CommerceOS app shell: the global navigation every page reuses.
   NAV is the single source of truth for the information architecture (module → submenu → page).
   Sidebar renders it for desktop (persistent, user-collapsible), tablet (icon rail that expands as an
   overlay) and mobile (drawer that drills into one module at a time). PageTrail derives breadcrumbs
   from the same tree. Load after components/bundle.js. */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement, useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useLayoutEffect = React.useLayoutEffect;
  var DS = window.CommerceOS, Icon = DS.Icon;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); }
    return out.join(" ");
  }

  /* ---------- Information architecture ----------
     Paths are "module" or "module/page". Only pages that exist have an href; the rest are routed
     through Sidebar's onNavigate until they are built. */
  var NAV = [
    { key: "main", label: null, items: [
      { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "Main.dc.html" },
      { key: "sales", label: "Sales", icon: "shopping-bag", children: [
        { key: "orders", label: "Orders", href: "Orders.dc.html" },
        { key: "abandoned-carts", label: "Abandoned Carts", href: "AbandonedCarts.dc.html" },
        { key: "returns", label: "Returns & Refunds", href: "Returns.dc.html" },
        { key: "channels", label: "Sales Channels", href: "SalesChannels.dc.html" }] },
      { key: "products", label: "Products", icon: "tag", children: [
        { key: "all", label: "All Products", href: "Products.dc.html" },
        { key: "categories", label: "Categories", href: "Categories.dc.html" },
        { key: "collections", label: "Collections", href: "Collections.dc.html" },
        { key: "reviews", label: "Product Reviews", href: "ProductReviews.dc.html" },
        { key: "attributes", label: "Attributes", href: "Attributes.dc.html" }] },
      { key: "inventory", label: "Inventory", icon: "package", children: [
        { key: "overview", label: "Overview", href: "InventoryOverview.dc.html" },
        { key: "stock-levels", label: "Stock Levels", href: "StockLevels.dc.html" },
        { key: "transfers", label: "Stock Transfers", href: "StockTransfers.dc.html" },
        { key: "adjustments", label: "Stock Adjustments", href: "StockAdjustments.dc.html" },
        { key: "low-stock", label: "Low Stock", href: "LowStock.dc.html" }] },
      { key: "warehouses", label: "Warehouses", icon: "warehouse", children: [
        { key: "all", label: "All Warehouses", href: "Warehouses.dc.html" },
        { key: "stock", label: "Stock by Warehouse", href: "StockByWarehouse.dc.html" },
        { key: "receiving", label: "Receiving", href: "Receiving.dc.html" },
        { key: "transfers", label: "Transfers", href: "WarehouseTransfers.dc.html" }] },
      { key: "procurement", label: "Procurement", icon: "clipboard-list", children: [
        { key: "purchase-orders", label: "Purchase Orders", href: "PurchaseOrders.dc.html" },
        { key: "suppliers", label: "Suppliers", href: "Suppliers.dc.html" },
        { key: "goods-received", label: "Goods Received", href: "GoodsReceived.dc.html" },
        { key: "purchase-returns", label: "Purchase Returns", href: "PurchaseReturns.dc.html" }] },
      { key: "customers", label: "Customers", icon: "users", children: [
        { key: "all", label: "All Customers", href: "Customers.dc.html" },
        { key: "segments", label: "Segments", href: "Segments.dc.html" },
        { key: "groups", label: "Customer Groups", href: "CustomerGroups.dc.html" },
        { key: "activity", label: "Customer Activity", href: "CustomerActivity.dc.html" }] },
      { key: "fulfillment", label: "Fulfillment", icon: "truck", children: [
        { key: "overview", label: "Overview", href: "FulfillmentOverview.dc.html" },
        { key: "picking", label: "Picking", href: "Picking.dc.html" },
        { key: "packing", label: "Packing", href: "Packing.dc.html" },
        { key: "shipping", label: "Shipping", href: "Shipping.dc.html" },
        { key: "tracking", label: "Delivery Tracking", href: "DeliveryTracking.dc.html" }] },
      { key: "finance", label: "Finance", icon: "wallet", children: [
        { key: "overview", label: "Overview" },
        { key: "payments", label: "Payments" },
        { key: "refunds", label: "Refunds" },
        { key: "expenses", label: "Expenses" },
        { key: "transactions", label: "Transactions" }] },
      { key: "marketing", label: "Marketing", icon: "megaphone", children: [
        { key: "campaigns", label: "Campaigns" },
        { key: "discounts", label: "Discounts" },
        { key: "coupons", label: "Coupons" },
        { key: "promotions", label: "Promotions" }] },
      { key: "analytics", label: "Analytics", icon: "bar-chart", children: [
        { key: "sales", label: "Sales Analytics" },
        { key: "products", label: "Product Analytics" },
        { key: "customers", label: "Customer Analytics" },
        { key: "inventory", label: "Inventory Analytics" },
        { key: "financial", label: "Financial Reports" }] }] },
    { key: "management", label: "Management", items: [
      { key: "users", label: "Users & Roles", icon: "shield-check" },
      { key: "integrations", label: "Integrations", icon: "plug" },
      { key: "settings", label: "Settings", icon: "settings" }] }
  ];

  /* Actionable counts only. Pages pass live values through the `badges` prop. */
  var DEFAULT_BADGES = {
    "sales/orders": { count: 24, label: "pending" },
    "sales/returns": { count: 5, label: "pending" },
    "products/reviews": { count: 12, label: "to moderate" },
    "inventory/low-stock": { count: 18, label: "low stock", tone: "warning" }
  };

  function findModule(key) {
    for (var g = 0; g < NAV.length; g++) {
      for (var i = 0; i < NAV[g].items.length; i++) { if (NAV[g].items[i].key === key) return NAV[g].items[i]; }
    }
    return null;
  }
  function resolve(path) {
    var parts = String(path || "").split("/"), mod = findModule(parts[0]), page = null;
    if (mod && mod.children && parts[1]) {
      for (var i = 0; i < mod.children.length; i++) { if (mod.children[i].key === parts[1]) page = mod.children[i]; }
    }
    return { module: mod, page: page };
  }
  function hrefOf(mod, page) { return (page || mod).href || "#" + mod.key + (page ? "/" + page.key : ""); }
  function badgeText(n) { return n > 99 ? "99+" : String(n); }

  /* Breadcrumbs: none on top-level pages; module / page on submenu pages; + record on detail pages. */
  function trailItems(path, record) {
    var r = resolve(path), items = [];
    if (!r.module) return items;
    if (r.page) {
      items.push({ label: r.module.label });
      items.push({ label: r.page.label, href: record ? hrefOf(r.module, r.page) : null });
    } else {
      if (!record) return items;
      items.push({ label: r.module.label, href: hrefOf(r.module) });
    }
    if (record) items.push({ label: record });
    return items;
  }

  function PageTrail(props) {
    var items = props.items || trailItems(props.current, props.record);
    if (!items.length) return null;
    return h("nav", { className: cx("cx-crumbs cx-trail", props.className), "aria-label": "Breadcrumb" },
      h("ol", null, items.map(function (it, i) {
        var last = i === items.length - 1;
        var inner = last ? h("span", { "aria-current": "page" }, it.label)
          : it.href ? h("a", { href: it.href, onClick: it.onClick }, it.label)
            : h("span", { className: "cx-trail-plain" }, it.label);
        return h("li", { key: i, className: "cx-crumb" }, inner, last ? null : h(Icon, { name: "chevron-right", className: "cx-crumb-sep" }));
      })));
  }

  function viewportMode() { var w = window.innerWidth; return w < 768 ? "mobile" : w < 1280 ? "tablet" : "desktop"; }
  function useViewportMode() {
    var st = useState(viewportMode);
    useEffect(function () {
      function on() { st[1](viewportMode()); }
      window.addEventListener("resize", on);
      return function () { window.removeEventListener("resize", on); };
    }, []);
    return st[0];
  }
  function isShown(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
  function moveFocus(container, selector, e) {
    var els = Array.prototype.filter.call(container.querySelectorAll(selector), isShown);
    var i = els.indexOf(document.activeElement), next = null;
    if (e.key === "ArrowDown") next = els[(i + 1) % els.length];
    else if (e.key === "ArrowUp") next = els[(i - 1 + els.length) % els.length];
    else if (e.key === "Home") next = els[0];
    else if (e.key === "End") next = els[els.length - 1];
    if (next) { e.preventDefault(); next.focus(); }
  }

  /* ---------- Sidebar ----------
     props: current ("sales/orders"), collapsed + onToggleCollapse (desktop), drawerOpen + onDrawerClose (mobile),
     stores [{key,label,sub}] + store + onStoreChange, user {name,role,email,initials}, badges, onNavigate(path)
     for pages without an href, onAccountAction(key), onToggleTheme + themeLabel (optional). */
  function Sidebar(props) {
    var cur = resolve(props.current), activeKey = cur.module ? cur.module.key : null;
    var mode = useViewportMode();
    var badges = props.badges || DEFAULT_BADGES;
    var stores = props.stores || [{ key: "default", label: "My Store" }];
    var store = stores.filter(function (s) { return s.key === props.store; })[0] || stores[0];
    var user = props.user || { name: "Sarah Johnson", role: "Operations Manager", email: "sarah@commerceos.app", initials: "SJ" };

    var s1 = useState(activeKey), openKey = s1[0], setOpenKey = s1[1];   // expanded module (accordion)
    var s2 = useState(null), menu = s2[0], setMenu = s2[1];             // "store" | "account"
    var s3 = useState(null), fly = s3[0], setFly = s3[1];               // rail flyout { key, top, left }
    var s4 = useState(false), peek = s4[0], setPeek = s4[1];            // tablet rail expanded as overlay
    var s5 = useState(null), drill = s5[0], setDrill = s5[1];           // mobile drawer: module being shown
    var s6 = useState(null), tip = s6[0], setTip = s6[1];
    var rootRef = useRef(null), flyRef = useRef(null), lastDrill = useRef(null), focusNext = useRef(null);

    var drawer = mode === "mobile";
    var rail = mode === "desktop" ? !!props.collapsed : mode === "tablet" ? !peek : false;

    useEffect(function () { setOpenKey(activeKey); }, [props.current]);
    useEffect(function () {
      if (!props.drawerOpen) return;
      setDrill(cur.page ? activeKey : null);
      focusNext.current = cur.page ? ".cx-drill-back" : ".cx-drill-root [data-nav]";
    }, [props.drawerOpen]);
    useEffect(function () { setMenu(null); setFly(null); setTip(null); if (mode !== "tablet") setPeek(false); }, [mode]);
    useEffect(function () { setFly(null); setTip(null); }, [rail]);
    if (drill) lastDrill.current = drill;

    // Move focus after a drill-down / menu open, once the target exists.
    useEffect(function () {
      var sel = focusNext.current; focusNext.current = null;
      if (!sel || !rootRef.current) return;
      var el = (sel.charAt(0) === "@" ? flyRef.current : rootRef.current);
      el = el && el.querySelector(sel.charAt(0) === "@" ? sel.slice(1) : sel);
      if (el) setTimeout(function () { el.focus(); }, drawer ? 220 : 0);
    });

    // Keep the flyout inside the viewport.
    useLayoutEffect(function () {
      if (!fly || !flyRef.current) return;
      var r = flyRef.current.getBoundingClientRect(), max = window.innerHeight - 8;
      if (r.bottom > max) flyRef.current.style.top = Math.max(8, fly.top - (r.bottom - max)) + "px";
    }, [fly]);

    function toggleRail() {
      setTip(null);
      if (mode === "desktop" && props.onToggleCollapse) props.onToggleCollapse();
      else if (mode === "tablet") setPeek(function (p) { return !p; });
    }
    function closeAll() { setMenu(null); setFly(null); }

    useEffect(function () {
      function down(e) { if (!(e.target.closest && e.target.closest("[data-side-pop]"))) closeAll(); }
      function key(e) {
        var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
        if (e.key === "[" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey && !drawer) { e.preventDefault(); toggleRail(); }
        if (e.key === "Escape") {
          if (menu || fly) {
            var back = fly ? "[data-mod=\"" + fly.key + "\"]" : menu === "store" ? ".cx-store-btn" : ".cx-user-btn";
            closeAll(); focusNext.current = back;
          } else if (peek) setPeek(false);
          else if (drawer && props.drawerOpen && props.onDrawerClose) props.onDrawerClose();
        }
      }
      document.addEventListener("mousedown", down);
      document.addEventListener("keydown", key);
      return function () { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
    });

    function go(path, item, e) {
      closeAll(); setTip(null);
      if (mode === "tablet") setPeek(false);
      if (!item.href && props.onNavigate) {
        e.preventDefault();
        props.onNavigate(path);
        if (drawer && props.onDrawerClose) props.onDrawerClose();
      }
    }
    function tipFor(label) {
      if (!rail) return {};
      function show(e) { var r = e.currentTarget.getBoundingClientRect(); setTip({ label: label, top: r.top + r.height / 2, left: r.right + 10 }); }
      function hide() { setTip(null); }
      return { onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide };
    }
    function openMenu(name, e) {
      setTip(null); setFly(null);
      setMenu(menu === name ? null : name);
      if (menu !== name && e.detail === 0) focusNext.current = "[data-side-menu] [role^=menuitem]";
    }
    function toggleFly(mod, el, viaKeyboard) {
      setTip(null); setMenu(null);
      if (fly && fly.key === mod.key) { setFly(null); return; }
      var r = el.getBoundingClientRect();
      setFly({ key: mod.key, top: r.top - 4, left: r.right + 8 });
      if (viaKeyboard) focusNext.current = "@.cx-nav-link";
    }
    function badgeEl(b) {
      return b ? h("span", { className: cx("cx-nav-badge", b.tone && "is-" + b.tone), "aria-hidden": "true" }, badgeText(b.count)) : null;
    }
    function hasBadge(mod) {
      return !!(mod.children && mod.children.some(function (c) { return badges[mod.key + "/" + c.key]; }));
    }

    function renderLink(mod, c) {
      var path = mod.key + "/" + c.key, b = badges[path], current = cur.module === mod && cur.page === c;
      return h("li", { key: c.key },
        h("a", {
          className: cx("cx-nav-link", current && "is-current"), href: hrefOf(mod, c), "data-nav": "",
          "aria-current": current ? "page" : undefined, "aria-label": b ? c.label + ", " + b.count + " " + b.label : undefined,
          onClick: function (e) { go(path, c, e); }
        }, h("span", { className: "cx-nav-lbl" }, c.label), badgeEl(b)));
    }

    function renderLeaf(mod) {
      var current = activeKey === mod.key && !cur.page, b = badges[mod.key];
      return h("li", { key: mod.key },
        h("a", Object.assign({
          className: cx("cx-nav-mod", current && "is-active is-here"), href: hrefOf(mod), "data-nav": "",
          "aria-current": current ? "page" : undefined, "aria-label": rail || b ? mod.label + (b ? ", " + b.count + " " + b.label : "") : undefined,
          onClick: function (e) { go(mod.key, mod, e); }
        }, tipFor(mod.label)), h(Icon, { name: mod.icon }), h("span", { className: "cx-nav-lbl" }, mod.label), badgeEl(b)));
    }

    function renderModule(mod) {
      if (!mod.children) return renderLeaf(mod);
      var active = activeKey === mod.key, attention = hasBadge(mod);
      if (rail) {
        var flown = !!(fly && fly.key === mod.key);
        return h("li", { key: mod.key, "data-side-pop": "" },
          h("button", Object.assign({
            type: "button", className: cx("cx-nav-mod", active && "is-active is-here", flown && "is-pressed"), "data-nav": "", "data-mod": mod.key,
            "aria-haspopup": "true", "aria-expanded": flown, "aria-label": mod.label + (active && cur.page ? ", current: " + cur.page.label : "") + (attention ? ", needs attention" : ""),
            onClick: function (e) { toggleFly(mod, e.currentTarget, e.detail === 0); },
            onKeyDown: function (e) { if (e.key === "ArrowRight" && !flown) { e.preventDefault(); toggleFly(mod, e.currentTarget, true); } }
          }, flown ? {} : tipFor(mod.label)), h(Icon, { name: mod.icon }), attention ? h("span", { className: "cx-nav-dot", "aria-hidden": "true" }) : null));
      }
      var open = openKey === mod.key, subId = "cx-sub-" + mod.key;
      return h("li", { key: mod.key, className: cx("cx-nav-group", open && "is-open") },
        h("button", {
          type: "button", className: cx("cx-nav-mod", active && "is-active", active && !open && "is-here"), "data-nav": "", "data-mod": mod.key,
          "aria-expanded": open, "aria-controls": subId, "aria-label": mod.label + (attention && !open ? ", needs attention" : ""),
          onClick: function () { setOpenKey(open ? null : mod.key); },
          onKeyDown: function (e) {
            if (e.key === "ArrowRight" && !open) { e.preventDefault(); setOpenKey(mod.key); }
            if (e.key === "ArrowLeft" && open) { e.preventDefault(); setOpenKey(null); }
          }
        }, h(Icon, { name: mod.icon }), h("span", { className: "cx-nav-lbl" }, mod.label),
          attention && !open ? h("span", { className: "cx-nav-dot", "aria-hidden": "true" }) : null,
          h(Icon, { name: "chevron-down", className: "cx-nav-chev" })),
        h("div", { className: "cx-nav-sub", id: subId },
          h("div", { className: "cx-nav-sub-in" }, h("ul", {
            onKeyDown: function (e) { if (e.key === "ArrowLeft") { e.preventDefault(); setOpenKey(null); focusNext.current = "[data-mod=\"" + mod.key + "\"]"; } }
          }, mod.children.map(function (c) { return renderLink(mod, c); })))));
    }

    function navKeys(e) { if (rootRef.current) moveFocus(e.currentTarget, "[data-nav]", e); }

    function renderTree() {
      return h("nav", { className: "cx-side-nav", "aria-label": "Modules", onKeyDown: navKeys, onScroll: function () { if (fly) setFly(null); setTip(null); } },
        NAV.map(function (g) {
          return h(React.Fragment, { key: g.key },
            g.label ? h("div", { className: "cx-side-group", id: "cx-grp-" + g.key }, h("span", null, g.label)) : null,
            h("ul", { className: "cx-side-list", "aria-labelledby": g.label ? "cx-grp-" + g.key : undefined }, g.items.map(renderModule)));
        }));
    }

    function renderDrill() {
      var subMod = findModule(drill || lastDrill.current);
      var root = NAV.map(function (g) {
        return h(React.Fragment, { key: g.key },
          g.label ? h("div", { className: "cx-side-group" }, h("span", null, g.label)) : null,
          h("ul", { className: "cx-side-list" }, g.items.map(function (mod) {
            if (!mod.children) return renderLeaf(mod);
            var active = activeKey === mod.key, attention = hasBadge(mod);
            return h("li", { key: mod.key },
              h("button", {
                type: "button", className: cx("cx-nav-mod", active && "is-active"), "data-nav": "", "data-mod": mod.key,
                "aria-label": mod.label + (active && cur.page ? ", current: " + cur.page.label : "") + (attention ? ", needs attention" : ""),
                onClick: function () { setDrill(mod.key); focusNext.current = ".cx-drill-back"; }
              }, h(Icon, { name: mod.icon }),
                h("span", { className: "cx-nav-lbl" }, mod.label, active && cur.page ? h("span", { className: "cx-nav-sublbl" }, cur.page.label) : null),
                attention ? h("span", { className: "cx-nav-dot", "aria-hidden": "true" }) : null,
                h(Icon, { name: "chevron-right", className: "cx-nav-chev" })));
          })));
      });
      return h("div", { className: cx("cx-drill", drill && "is-drilled") },
        h("div", { className: "cx-drill-track" },
          h("nav", { className: "cx-drill-panel cx-drill-root", "aria-label": "Modules", onKeyDown: navKeys }, root),
          h("nav", { className: "cx-drill-panel cx-drill-sub", "aria-label": subMod ? subMod.label : undefined, onKeyDown: navKeys },
            subMod ? [
              h("button", {
                key: "back", type: "button", className: "cx-drill-back", "data-nav": "",
                onClick: function () { setDrill(null); focusNext.current = "[data-mod=\"" + subMod.key + "\"]"; }
              }, h(Icon, { name: "chevron-left" }), "All modules"),
              h("h2", { key: "t", className: "cx-drill-title" }, h(Icon, { name: subMod.icon }), subMod.label),
              h("ul", { key: "l" }, subMod.children.map(function (c) { return renderLink(subMod, c); }))
            ] : null)));
    }

    function menuKeys(e) { moveFocus(e.currentTarget, "[role^=menuitem]", e); }
    function act(key) { setMenu(null); if (props.onAccountAction) props.onAccountAction(key); }
    function item(icon, label, onClick, extra) {
      return h("button", Object.assign({ key: label, type: "button", className: "cx-menu-item", role: "menuitem", onClick: onClick }, extra),
        h(Icon, { name: icon }), h("span", null, label));
    }

    var storeMenu = h("div", { className: "cx-menu cx-side-menu", role: "menu", "aria-label": "Switch store", "data-side-menu": "", onKeyDown: menuKeys },
      h("div", { className: "cx-menu-group" }, "Switch store"),
      stores.map(function (st) {
        var sel = st.key === store.key;
        return h("button", {
          key: st.key, type: "button", className: "cx-menu-item cx-side-mi", role: "menuitemradio", "aria-checked": sel,
          onClick: function () { setMenu(null); if (props.onStoreChange) props.onStoreChange(st.key); }
        }, h(Icon, { name: st.icon || "store" }),
          h("span", { className: "cx-mi-text" }, h("span", null, st.label), st.sub ? h("span", { className: "cx-mi-sub" }, st.sub) : null),
          sel ? h(Icon, { name: "check", className: "cx-mi-check" }) : null);
      }),
      h("div", { className: "cx-menu-sep" }),
      item("settings", "Manage stores", function () { act("stores"); }));

    var accountMenu = h("div", { className: "cx-menu cx-side-menu", role: "menu", "aria-label": "Account", "data-side-menu": "", onKeyDown: menuKeys },
      h("div", { className: "cx-acct-head" },
        h("span", { className: "cx-avatar cx-avatar-lg", "aria-hidden": "true" }, user.initials),
        h("span", { className: "cx-user-text" }, h("span", { className: "cx-user-name" }, user.name), h("span", { className: "cx-user-role" }, user.email || user.role))),
      h("div", { className: "cx-menu-sep" }),
      item("user", "Profile", function () { act("profile"); }),
      item("sliders", "Preferences", function () { act("preferences"); }),
      props.onToggleTheme ? item("eye", props.themeLabel || "Switch theme", function () { setMenu(null); props.onToggleTheme(); }) : null,
      item("help-circle", "Help", function () { act("help"); }),
      h("div", { className: "cx-menu-sep" }),
      item("log-out", "Sign out", function () { act("signout"); }));

    var toggleLabel = rail ? "Expand sidebar" : "Collapse sidebar";
    var flyMod = fly ? findModule(fly.key) : null;
    var scrim = (drawer && props.drawerOpen) || (mode === "tablet" && peek);

    return h(React.Fragment, null,
      scrim ? h("button", {
        type: "button", className: "cx-side-scrim", tabIndex: -1, "aria-label": "Close navigation",
        onClick: function () { if (drawer) { if (props.onDrawerClose) props.onDrawerClose(); } else setPeek(false); }
      }) : null,
      h("aside", {
        ref: rootRef, "aria-label": "Main navigation",
        className: cx("cx-side", rail && "is-rail", mode === "tablet" && peek && "is-peek", drawer && "is-drawer", drawer && props.drawerOpen && "is-open")
      },
        h("div", { className: "cx-side-head" },
          h("div", { className: "cx-side-pop", "data-side-pop": "" },
            h("button", Object.assign({
              type: "button", className: "cx-store-btn", "aria-haspopup": "menu", "aria-expanded": menu === "store",
              "aria-label": "CommerceOS, store: " + store.label + ". Switch store", onClick: function (e) { openMenu("store", e); }
            }, menu === "store" ? {} : tipFor("Switch store · " + store.label)),
              h("span", { className: "cx-logo", "aria-hidden": "true" }, "C"),
              h("span", { className: "cx-store-text" }, h("span", { className: "cx-store-brand" }, "CommerceOS"), h("span", { className: "cx-store-name" }, store.label)),
              h(Icon, { name: "chevrons-up-down", className: "cx-store-chev" })),
            menu === "store" ? storeMenu : null),
          drawer ? h("button", { type: "button", className: "cx-side-close", "aria-label": "Close navigation", onClick: props.onDrawerClose }, h(Icon, { name: "x" })) : null),
        drawer ? renderDrill() : renderTree(),
        h("div", { className: "cx-side-foot" },
          drawer ? null : h("button", Object.assign({
            type: "button", className: "cx-nav-mod cx-side-toggle", onClick: toggleRail, "aria-label": toggleLabel, "aria-expanded": !rail, "aria-keyshortcuts": "["
          }, tipFor(toggleLabel)), h(Icon, { name: rail ? "chevrons-right" : "chevrons-left" }), h("span", { className: "cx-nav-lbl" }, "Collapse sidebar"), h("kbd", { className: "cx-kbd cx-side-kbd", "aria-hidden": "true" }, "[")),
          h("div", { className: "cx-side-pop", "data-side-pop": "" },
            h("button", Object.assign({
              type: "button", className: "cx-user-btn", "aria-haspopup": "menu", "aria-expanded": menu === "account",
              "aria-label": "Account: " + user.name + ", " + user.role, onClick: function (e) { openMenu("account", e); }
            }, menu === "account" ? {} : tipFor(user.name + " · " + user.role)),
              h("span", { className: "cx-avatar", "aria-hidden": "true" }, user.initials),
              h("span", { className: "cx-user-text" }, h("span", { className: "cx-user-name" }, user.name), h("span", { className: "cx-user-role" }, user.role)),
              h(Icon, { name: "chevrons-up-down", className: "cx-user-chev" })),
            menu === "account" ? accountMenu : null)),
        flyMod ? h("div", {
          ref: flyRef, className: "cx-flyout", "data-side-pop": "", style: { top: fly.top, left: fly.left },
          onKeyDown: function (e) { moveFocus(e.currentTarget, ".cx-nav-link", e); if (e.key === "ArrowLeft") { e.preventDefault(); setFly(null); focusNext.current = "[data-mod=\"" + flyMod.key + "\"]"; } }
        },
          h("div", { className: "cx-flyout-head", id: "cx-fly-" + flyMod.key }, flyMod.label),
          h("ul", { "aria-labelledby": "cx-fly-" + flyMod.key }, flyMod.children.map(function (c) { return renderLink(flyMod, c); }))) : null,
        tip && rail ? h("span", { className: "cx-tip cx-side-tip", role: "tooltip", style: { top: tip.top, left: tip.left } }, tip.label) : null));
  }

  window.CommerceOS = Object.assign(window.CommerceOS || {}, {
    Sidebar: Sidebar, PageTrail: PageTrail, NAV: NAV, navResolve: resolve, navTrail: trailItems
  });
})();

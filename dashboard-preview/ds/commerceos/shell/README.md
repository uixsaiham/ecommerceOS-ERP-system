# CommerceOS app shell

Every CommerceOS page uses this shell for global navigation. Don't copy sidebar markup into a page.

- `shell.js` adds `CommerceOS.Sidebar`, `CommerceOS.PageTrail`, `CommerceOS.NAV`, `CommerceOS.navResolve` and `CommerceOS.navTrail`.
- `shell.css` holds the page grid, the sidebar in all its states, and the breadcrumb styles.
- `list.css` holds the shared look of operational list pages: KPI cards, tabs, filter bar, data table, bulk bar, side panels, mobile cards. Abandoned Carts, Returns & Refunds, Sales Channels and the Products pages use it.
- `catalog.js` (in the page folder) is the Fernhill product catalog shared by the Products pages: products, variants, categories, collections and attributes, consistent with the dashboard and Sales Channels data.
- `inventory.js` (in the page folder, load after `catalog.js`) is the stock per SKU per warehouse, reorder points, open POs, transfers and adjustments shared by the Inventory pages, plus the site details, order routing, zones and bins, and receipts used by the Warehouses pages. Its 18 low-stock locations match the sidebar badge.
- `TopBar.dc.html` (in the page folder) is the shared top bar: search, store selector, help, notifications, profile. New pages import it with `<dc-import name="TopBar" store=… stores=… on-store-change=… on-open-drawer=… dark=… on-toggle-theme=…>`. The dashboard and Orders still have their own copy of the same design.
- `NAV` in `shell.js` is the only definition of the module → submenu tree. To add a module or page, edit it there. When a page gets built, give its entry an `href`.

## Using it in a page

```html
<link rel="stylesheet" href="ds/commerceos/shell/shell.css">   <!-- after components/bundle.css -->
<script src="ds/commerceos/shell/shell.js"></script>            <!-- after components/bundle.js -->

<div class="app cx-shell {{appClass}}">                         <!-- appClass: 'is-collapsed' when collapsed -->
  <x-import component-from-global-scope="CommerceOS.Sidebar"
    current="inventory/stock-levels"
    collapsed="{{nav.collapsed}}" on-toggle-collapse="{{toggleCollapse}}"
    drawer-open="{{nav.drawer}}" on-drawer-close="{{closeDrawer}}"
    stores="{{nav.stores}}" store="{{nav.store}}" on-store-change="{{nav.setStore}}"
    user="{{nav.user}}" on-navigate="{{nav.navigate}}"></x-import>
  <div class="main cx-shell-main">
    <header class="top">…menu button (phones only), search, help, notifications…</header>
    <main class="page">
      <x-import component-from-global-scope="CommerceOS.PageTrail" current="inventory/stock-levels" record="SKU-10284"></x-import>
      <h1>…</h1>
```

Wrapper pages that use `dc-import` to embed another page also need both includes in their own `<head>`.

## Rules

| | Desktop ≥1280px | Tablet 768–1279px | Phone <768px |
|---|---|---|---|
| Sidebar | Persistent, 240px. The user can collapse it to a 64px icon rail with the toggle or the `[` key. | 64px icon rail. Expanding opens the full sidebar over the page. | Hidden. The ☰ button in the top bar opens it as a drawer. The drawer shows one module's pages at a time. |
| Submenus | Accordion: one module open at a time. The current page's module opens on load. | Rail: clicking an icon opens that module's pages in a flyout. | Tap a module to see its pages. "All modules" goes back. |

- **Hierarchy:** modules have an icon, 14px medium text, and a chevron. Submenu pages have no icon, use 13px secondary text, and are indented on a guide line. The current page gets a filled background and a brand-colored bar on the guide line. If its module is collapsed, the module row itself gets the filled background.
- **Badges:** only for counts someone needs to act on (orders waiting, returns waiting, low stock). Pass them through the `badges` prop as `{ "module/page": { count, label, tone } }`. A collapsed module, or a module in the rail, shows a dot instead of numbers.
- **Breadcrumbs (`PageTrail`):** none on top-level pages (Dashboard, Users & Roles, Integrations, Settings). On submenu pages they read `Module / Page`. On detail pages they read `Module / Page (link) / Record`. The module name isn't a link, because modules don't have a page of their own.
- **Top bar:** each page keeps its original top bar: search, store selector, help, notifications and profile menu. Changing the top bar isn't part of the shell.

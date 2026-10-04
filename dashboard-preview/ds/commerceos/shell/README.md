# CommerceOS app shell

Every CommerceOS page uses this shell for global navigation. Don't copy sidebar markup into a page.

- `shell.js` adds `CommerceOS.Sidebar`, `CommerceOS.PageTrail`, `CommerceOS.NAV`, `CommerceOS.navResolve` and `CommerceOS.navTrail`.
- `shell.css` holds the page grid, the sidebar in all its states, and the breadcrumb styles.
- `list.css` holds the shared look of operational list pages: KPI cards, tabs, filter bar, data table, bulk bar, side panels, mobile cards. Abandoned Carts, Returns & Refunds, Sales Channels and the Products, Inventory, Warehouses, Procurement, Customers, Fulfillment, Finance and Marketing pages use it. It also holds the record-panel parts (key–value list, line table with inline inputs, progress timeline) first built for Receiving.
- `catalog.js` (in the page folder) is the Fernhill product catalog shared by the Products pages: products, variants, categories, collections and attributes, consistent with the dashboard and Sales Channels data.
- `inventory.js` (in the page folder, load after `catalog.js`) is the stock per SKU per warehouse, reorder points, open POs, transfers and adjustments shared by the Inventory pages, plus the site details, order routing, zones and bins, and receipts used by the Warehouses pages. Its 18 low-stock locations match the sidebar badge.
- `procurement.js` (in the page folder, load after `inventory.js`) is the suppliers, the full purchase-order lifecycle (draft to received), goods received notes matched against supplier invoices, and purchase returns used by the Procurement pages. Every PO in `inventory.js` and on the Receiving page appears here with the same lines and dates. Pages link to each other's records with `?po=`, `?grn=`, `?rtv=` and `?supplier=`.
- `customers.js` (in the page folder, load after `catalog.js`) is the 18,497 customers behind the Customers pages, with groups, saved segments and 7 days of activity. Totals match the dashboard (412 new and 2,846 orders in 30 days, $128,450 split by store as on Sales Channels), and customers named on other pages keep their numbers. The last 30 days' orders are numbered in time order around Sarah Johnson's #ORD-10482, like the Orders page. Links: `Customers.dc.html?c=`, `?segment=`, `?group=`; `Segments.dc.html?segment=`; `CustomerGroups.dc.html?group=`.
- `orders.js` (in the page folder) is the Orders page’s generator copied as is: the same 2,846 orders with the same ids, customers, warehouses, stages and late flags. If the Orders page generator changes, copy it here again.
- `fulfillment.js` (load after `catalog.js`, `inventory.js` and `orders.js`) turns those orders into the Fulfillment queues: confirmed orders to pick, processing orders on pick lists or at the pack stations, ready-to-ship parcels waiting for a label or the carrier, and carrier tracking for shipped and delivered orders. Parcels ship only at each site’s carrier pickup times. The per-warehouse counts on the Warehouses pages (`toShip`, `late`, `shippedToday` in `inventory.js`) match it. Sydney 3PL ships from the partner’s own system and isn’t in the queues. Links: `?wh=` on Picking, Packing and Shipping; `?tab=lists` on Picking; `DeliveryTracking.dc.html?t=<order id>`.
- `returns.js` is the Returns & Refunds page’s generator copied as is (the 64 RMAs, five awaiting refund for $642.30). Copy it again if that page’s generator changes.
- `finance.js` (load after `catalog.js`, `inventory.js`, `orders.js`, `procurement.js`, `fulfillment.js` and `returns.js`) is the Finance data: one payment per order with processor and fee, processor payouts into three bank accounts, refunds, wholesale invoices on Net 30/45 (plus August’s), bills and team claims against category budgets, and the bank ledger with six unmatched lines. Links: `Payments.dc.html?tab=payouts|invoices|failed`, `Refunds.dc.html?tab=failed`, `Expenses.dc.html?tab=budget`, `Transactions.dc.html?tab=unmatched`.
- Revenue everywhere follows the Orders page: $820,443 over 30 days ($213,123 US, $161,443 EU, $401,488 Wholesale, $44,390 Amazon). The dashboard scales per store with separate revenue, order and customer shares (`rf`, `of`, `cf`). Product-level sales in `catalog.js` are still on the earlier, smaller scale.
- `marketing.js` (load after `catalog.js`, `orders.js` and `customers.js`; Promotions also loads `inventory.js`) is the Marketing data: campaigns (email, SMS, flows, ads), automatic discounts, coupon codes and promotions. Codes and discounts are attached to real orders from `orders.js`; audiences are live segment counts; September ad spend matches the Finance bills; the weekend flash sale is the dashboard’s Sep 19–20 spike; creator codes belong to the Press & creators group. Links: `Campaigns.dc.html?c=`, `Discounts.dc.html?d=`, `Coupons.dc.html?code=`, `Promotions.dc.html?p=`.
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

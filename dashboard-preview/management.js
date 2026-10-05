/* Fernhill management data shared by Users & Roles, Integrations and Settings. Built on catalog.js (load it
   first). The team is the people other pages already name: Priya Natarajan (the signed-in user), the order
   owners on the Orders page (Rafiq Hasan, Mei Lin, Jonas Weber), the four warehouse managers in inventory.js,
   the pickers and packers in fulfillment.js and Harbour Logistics’ contact in Sydney. The CommerceOS bill in
   Finance ($1,490 a month) is the Growth plan with 40 seats. Connected apps are the services Finance pays
   for and the processors and carriers on the orders. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var F = window.Fernhill, NOW = F.NOW, DAY = F.DAY, H = 36e5, M = 6e4;
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function u(s) { return (hash(s) % 100000) / 100000; }

  /* ---------- permissions: one level per module per role ---------- */
  var MODULES = [
    { key: 'dashboard', label: 'Dashboard', desc: 'Overview and the needs-attention list' },
    { key: 'sales', label: 'Sales', desc: 'Orders, carts, returns, channels' },
    { key: 'products', label: 'Products', desc: 'Catalog, categories, reviews, prices' },
    { key: 'inventory', label: 'Inventory', desc: 'Stock levels, transfers, adjustments' },
    { key: 'warehouses', label: 'Warehouses', desc: 'Sites, receiving, routing' },
    { key: 'procurement', label: 'Procurement', desc: 'Purchase orders, suppliers, goods received' },
    { key: 'customers', label: 'Customers', desc: 'Profiles, segments, groups' },
    { key: 'fulfillment', label: 'Fulfillment', desc: 'Picking, packing, shipping' },
    { key: 'finance', label: 'Finance', desc: 'Payments, refunds, expenses, bank' },
    { key: 'marketing', label: 'Marketing', desc: 'Campaigns, discounts, coupons' },
    { key: 'analytics', label: 'Analytics', desc: 'Reports and exports' },
    { key: 'management', label: 'Management', desc: 'Users, integrations, settings' }];
  var LEVELS = [
    { key: 'none', label: 'No access', short: '—' },
    { key: 'view', label: 'View', short: 'View' },
    { key: 'edit', label: 'Edit', short: 'Edit' },
    { key: 'full', label: 'Full', short: 'Full', desc: 'Edit, approve and delete' }];
  function perms(str) { var out = {}; str.split(' ').forEach(function (p, i) { out[MODULES[i].key] = { n: 'none', v: 'view', e: 'edit', f: 'full' }[p]; }); return out; }
  /*                                          dash sale prod inv  wh   proc cust ful  fin  mkt  anl  mgmt */
  var ROLES = [
    { key: 'owner', name: 'Owner', desc: 'Everything, including billing and deleting the account. Only one person.', system: true, scoped: false, perms: perms('f f f f f f f f f f f f') },
    { key: 'admin', name: 'Administrator', desc: 'Everything except billing and ownership. Can manage users and integrations.', system: true, scoped: false, perms: perms('f f f f f f f f f f f f') },
    { key: 'ops', name: 'Operations manager', desc: 'Runs orders, stock, buying and shipping across every site.', system: false, scoped: false, perms: perms('v f f f f f e f v v v v') },
    { key: 'whmgr', name: 'Warehouse manager', desc: 'Runs one site: receiving, counts, transfers and its fulfillment queue.', system: false, scoped: true, perms: perms('v v v f f e n f n n v n') },
    { key: 'whstaff', name: 'Warehouse staff', desc: 'Picks, packs and ships at their site. Can record counts, not approve them.', system: false, scoped: true, perms: perms('n v v e v n n e n n n n') },
    { key: 'sales', name: 'Wholesale & accounts', desc: 'Trade accounts: orders, price lists, invoices.', system: false, scoped: false, perms: perms('v f v v n n f v v n v n') },
    { key: 'support', name: 'Customer support', desc: 'Answers customers: orders, returns and refunds up to $250.', system: false, scoped: false, perms: perms('v e v v n n e v n n n n') },
    { key: 'marketing', name: 'Marketing', desc: 'Campaigns, discounts and segments. Sees products and analytics.', system: false, scoped: false, perms: perms('v v e v n n e n n f v n') },
    { key: 'finance', name: 'Finance', desc: 'Payments, refunds, bills and the bank. Approves purchase invoices.', system: false, scoped: false, perms: perms('v v v v n e v n f n f v') },
    { key: 'readonly', name: 'External read-only', desc: 'Partners and the accountant. Sees only what they need.', system: false, scoped: true, perms: perms('n n n v n n n v v n v n') }];

  /* ---------- the team ---------- */
  var WH = { dhk: 'Dhaka', ctg: 'Chattogram', rtm: 'Rotterdam', ewr: 'Newark', syd: 'Sydney' };
  function person(name, role, title, o) {
    o = o || {}; var r = u(name), slug = name.toLowerCase().replace(/[^a-z ]/g, '').split(' ');
    return {
      id: 'USR-' + (1000 + Math.floor(r * 8999)), name: name, title: title, role: role, email: o.email || (slug[0] + (slug.length > 1 ? '.' + slug[slug.length - 1] : '') + '@fernhill.co'),
      scope: o.scope || null, status: o.status || 'active', twofa: o.twofa != null ? o.twofa : r > 0.12, sso: o.sso != null ? o.sso : !o.external,
      lastActive: o.lastActive != null ? o.lastActive : NOW - Math.floor(Math.pow(r, 2) * 4 * DAY + r * 50 * M), created: o.created || NOW - Math.floor((120 + r * 1100) * DAY),
      external: !!o.external, invitedBy: o.invitedBy || null, phone: o.phone || null, initials: F.initials(name)
    };
  }
  var USERS = [
    person('Tahmid Chowdhury', 'owner', 'Founder & CEO', { twofa: true, lastActive: NOW - 3 * H, created: Date.UTC(2021, 2, 15) }),
    person('Priya Natarajan', 'admin', 'Operations Manager', { email: 'priya@fernhill.co', twofa: true, lastActive: NOW - 2 * M, created: Date.UTC(2022, 0, 10) }),
    person('Daniel Okoye', 'finance', 'Finance Manager', { twofa: true, lastActive: NOW - 40 * M }),
    person('Rafiq Hasan', 'sales', 'Wholesale Accounts Lead', { twofa: true, lastActive: NOW - 18 * M }),
    person('Mei Lin', 'marketing', 'Marketing & CRM Lead', { twofa: true, lastActive: NOW - 55 * M }),
    person('Jonas Weber', 'support', 'Customer Support Lead, EU', { twofa: true, lastActive: NOW - 9 * M }),
    person('Aisha Rahman', 'support', 'Customer Support, US', { lastActive: NOW - 2 * H }),
    person('Jamal Uddin', 'whmgr', 'Site Manager, Dhaka', { scope: ['dhk'], twofa: true, lastActive: NOW - 25 * M }),
    person('Nusrat Jahan', 'whmgr', 'Site Manager, Chattogram', { scope: ['ctg'], twofa: true, lastActive: NOW - 3 * H }),
    person('Sofie de Vries', 'whmgr', 'Site Manager, Rotterdam', { scope: ['rtm'], twofa: true, lastActive: NOW - 1 * H }),
    person('Marcus Reed', 'whmgr', 'Site Manager, Newark', { scope: ['ewr'], twofa: false, lastActive: NOW - 14 * H }),
    person('Liam Chen', 'readonly', 'Account Manager, Harbour Logistics', { scope: ['syd'], email: 'liam.chen@harbourlogistics.com.au', external: true, sso: false, twofa: true, lastActive: NOW - 2 * DAY }),
    person('Grace Oduya', 'readonly', 'Accountant, Moore & Vale CPAs', { email: 'grace@moorevale.com', external: true, sso: false, twofa: true, lastActive: NOW - 6 * DAY })
  ];
  var FLOOR = { dhk: [['Rina Akter', 'Picker'], ['Shafiq Islam', 'Picker'], ['Mitu Das', 'Picker'], ['Hasan Ali', 'Picker'], ['Lipi Roy', 'Packer'], ['Arif Hossain', 'Packer']],
    ctg: [['Kamal Uddin', 'Picker'], ['Sumaiya Noor', 'Picker'], ['Babul Mia', 'Picker'], ['Nasrin Sultana', 'Packer']],
    rtm: [['Joris Bakker', 'Picker'], ['Ewa Nowak', 'Picker'], ['Milan de Groot', 'Picker'], ['Lotte Smit', 'Packer'], ['Kees Vos', 'Packer']],
    ewr: [['Carlos Diaz', 'Picker'], ['Tanya Brooks', 'Picker'], ['Dev Shah', 'Picker'], ['Keisha Moore', 'Picker'], ['Grace Kim', 'Packer'], ['Luis Romero', 'Packer']] };
  Object.keys(FLOOR).forEach(function (w) { FLOOR[w].forEach(function (p) { USERS.push(person(p[0], 'whstaff', p[1] + ', ' + WH[w], { scope: [w], sso: false })); }); });
  USERS.push(person('Owen Patel', 'whstaff', 'Picker, Newark', { scope: ['ewr'], status: 'invited', sso: false, twofa: false, lastActive: 0, created: NOW - 2 * DAY, invitedBy: 'Marcus Reed' }));
  USERS.push(person('Studio Kaju', 'marketing', 'Creative agency (contractor)', { email: 'hello@studiokaju.com', external: true, status: 'invited', sso: false, twofa: false, lastActive: 0, created: NOW - 5 * DAY, invitedBy: 'Mei Lin' }));
  USERS.push(person('Tom Hendriks', 'whstaff', 'Packer, Rotterdam (left Aug 29)', { scope: ['rtm'], status: 'deactivated', sso: false, lastActive: Date.UTC(2026, 7, 29, 16, 5) }));

  var PLAN = { name: 'Growth', price: 1490, seats: 40, renews: Date.UTC(2026, 10, 1), card: 'Visa ••4417', billingEmail: 'finance@fernhill.co',
    invoices: [['INV-COS-2609', Date.UTC(2026, 8, 1), 1490, 'Paid'], ['INV-COS-2608', Date.UTC(2026, 7, 1), 1490, 'Paid'], ['INV-COS-2607', Date.UTC(2026, 6, 1), 1490, 'Paid'], ['INV-COS-2606', Date.UTC(2026, 5, 1), 1290, 'Paid'], ['INV-COS-2605', Date.UTC(2026, 4, 1), 1290, 'Paid']],
    features: ['Up to 5 stores and 10 warehouses', '40 team seats', 'API, webhooks and 2 million calls a month', 'SSO with Google Workspace', 'Audit log kept for a year'] };

  /* ---------- audit log: what the team did, newest first (ids match the other pages) ---------- */
  var A = function (mins, who, kind, text, ref, href) { return { ts: NOW - mins * M, who: who, kind: kind, text: text, ref: ref || '', href: href || '' }; };
  var AUDIT = [
    A(2, 'Priya Natarajan', 'login', 'Signed in with Google', 'Chrome on macOS · Dhaka'),
    A(9, 'Jonas Weber', 'order', 'Issued a refund of $48.00 on #ORD-10571', 'RF-7311', 'Refunds.dc.html'),
    A(18, 'Rafiq Hasan', 'order', 'Confirmed wholesale order #ORD-10603 for Lakeside Outfitters', '#ORD-10603', 'Orders.dc.html'),
    A(25, 'Jamal Uddin', 'inventory', 'Requested a stock count adjustment, −24 at Rotterdam', 'ADJ-5521', 'StockAdjustments.dc.html'),
    A(31, 'Priya Natarajan', 'inventory', 'Drafted transfer TR-3116, Sydney to Newark', 'TR-3116', 'StockTransfers.dc.html'),
    A(40, 'Daniel Okoye', 'finance', 'Matched 12 bank lines on Chase ••4821', 'Transactions', 'Transactions.dc.html'),
    A(55, 'Mei Lin', 'marketing', 'Scheduled the Autumn VIP preview email for Oct 3, 14:00', 'Campaign', 'Campaigns.dc.html'),
    A(64, 'Sofie de Vries', 'inventory', 'Received PO-20412 at Rotterdam DC, 3 lines', 'PO-20412', 'Receiving.dc.html'),
    A(80, 'Priya Natarajan', 'user', 'Changed Marcus Reed’s role scope to Newark only', 'Marcus Reed'),
    A(95, 'Daniel Okoye', 'finance', 'Approved bill EXP-3305 from Porto Knit Lda. for $15,155.20', 'EXP-3305', 'Expenses.dc.html'),
    A(130, 'System', 'integration', 'Amazon Seller Central suppressed 14 listings: missing GTIN', 'Amazon US', 'Integrations.dc.html?i=amazon'),
    A(160, 'Priya Natarajan', 'settings', 'Changed the processing target from 36 to 24 hours', 'Orders & fulfillment', 'Settings.dc.html?section=orders'),
    A(185, 'Tahmid Chowdhury', 'login', 'Signed in with Google', 'Safari on iPhone · Dhaka'),
    A(240, 'Nusrat Jahan', 'inventory', 'Approved 9 damaged-stock write-offs at Chattogram', 'Adjustments', 'StockAdjustments.dc.html'),
    A(300, 'Mei Lin', 'marketing', 'Created coupon code COMEBACK15', 'COMEBACK15', 'Coupons.dc.html'),
    A(420, 'Daniel Okoye', 'finance', 'Exported the September P&L', 'Financial Reports', 'FinancialReports.dc.html'),
    A(510, 'System', 'security', '3 failed sign-ins for marcus.reed@fernhill.co, then a successful one', 'Marcus Reed'),
    A(640, 'Priya Natarajan', 'integration', 'Reconnected PostNL after an expired API key', 'PostNL', 'Integrations.dc.html?i=postnl'),
    A(780, 'Rafiq Hasan', 'customer', 'Moved Bramble & Co. to the Wholesale key accounts group', 'Bramble & Co.', 'CustomerGroups.dc.html'),
    A(1020, 'Marcus Reed', 'user', 'Invited Owen Patel as Warehouse staff at Newark', 'Owen Patel'),
    A(1300, 'Jonas Weber', 'order', 'Approved return RMA for #ORD-10322', 'Returns', 'Returns.dc.html'),
    A(1500, 'Priya Natarajan', 'procurement', 'Sent PO-20431 to Narayanganj Garments Ltd.', 'PO-20431', 'PurchaseOrders.dc.html'),
    A(2100, 'Daniel Okoye', 'finance', 'Ran the September payroll, $167,330', 'Payroll', 'Expenses.dc.html'),
    A(2900, 'Priya Natarajan', 'settings', 'Turned on two-step sign-in for administrators', 'Security', 'Settings.dc.html?section=security'),
    A(3600, 'Mei Lin', 'user', 'Invited Studio Kaju as Marketing (contractor)', 'Studio Kaju'),
    A(4400, 'Sofie de Vries', 'inventory', 'Completed the quarterly count, aisle B', 'Counts', 'StockAdjustments.dc.html'),
    A(5800, 'Priya Natarajan', 'user', 'Deactivated Tom Hendriks (left the company)', 'Tom Hendriks'),
    A(7200, 'Tahmid Chowdhury', 'settings', 'Upgraded the plan from Starter to Growth', 'Billing', 'Settings.dc.html?section=billing'),
    A(8600, 'System', 'integration', 'Meta Ads access token expires in 6 days', 'Meta Ads', 'Integrations.dc.html?i=meta')];
  var AUDIT_KINDS = { login: ['Sign-in', 'log-out'], order: ['Orders', 'shopping-bag'], inventory: ['Inventory', 'package'], finance: ['Finance', 'wallet'], marketing: ['Marketing', 'megaphone'], user: ['Users', 'users'], settings: ['Settings', 'settings'], integration: ['Integrations', 'plug'], security: ['Security', 'shield-check'], customer: ['Customers', 'user'], procurement: ['Procurement', 'clipboard-list'] };

  /* ---------- integrations ---------- */
  var CATS = [
    { key: 'channels', label: 'Sales channels' }, { key: 'payments', label: 'Payments' }, { key: 'shipping', label: 'Shipping and 3PL' },
    { key: 'marketing', label: 'Marketing' }, { key: 'finance', label: 'Accounting and banking' }, { key: 'workspace', label: 'Support and workspace' }];
  function app(key, name, cat, desc, o) {
    return Object.assign({ key: key, name: name, cat: cat, desc: desc, status: 'available', account: '', by: '', since: null, lastSync: null, every: '', issue: '', mono: name.replace(/[^A-Za-z ]/g, '').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(),
      toggles: [], scopes: [], log: [], count: null, price: 'Free' }, o || {});
  }
  var T = function (label, on, hint) { return { label: label, on: on, hint: hint || '' }; };
  var L = function (mins, text, tone) { return { ts: NOW - mins * M, text: text, tone: tone || 'success' }; };
  var APPS = [
    app('shopify-us', 'Shopify Plus · Fernhill US', 'channels', 'Orders, customers, products and stock for fernhill.co.', { status: 'connected', account: 'fernhill.myshopify.com', by: 'Priya Natarajan', since: Date.UTC(2022, 0, 12), lastSync: NOW - 2 * M, every: 'Real time (webhooks)', count: { channel: 'Fernhill US', label: 'orders in 30 days' }, price: '$2,300 a month, billed by Shopify',
      toggles: [T('Import orders', true), T('Push stock levels', true, 'Every 5 minutes from Newark and Dhaka'), T('Push prices and compare-at prices', true), T('Import customers', true), T('Publish new products automatically', false)], scopes: ['read_orders', 'write_inventory', 'write_products', 'read_customers'],
      log: [L(2, '6 orders imported'), L(7, 'Stock pushed for 412 SKUs'), L(65, 'Prices pushed for 18 products')] }),
    app('shopify-eu', 'Shopify Plus · Fernhill EU', 'channels', 'Orders, customers, products and stock for fernhill.eu.', { status: 'connected', account: 'fernhill-eu.myshopify.com', by: 'Priya Natarajan', since: Date.UTC(2023, 3, 3), lastSync: NOW - 3 * M, every: 'Real time (webhooks)', count: { channel: 'Fernhill EU', label: 'orders in 30 days' }, price: '€2,120 a month, billed by Shopify',
      toggles: [T('Import orders', true), T('Push stock levels', true, 'Every 5 minutes from Rotterdam and Chattogram'), T('Push prices and compare-at prices', true), T('Import customers', true), T('Publish new products automatically', false)], scopes: ['read_orders', 'write_inventory', 'write_products', 'read_customers'],
      log: [L(3, '4 orders imported'), L(8, 'Stock pushed for 388 SKUs'), L(1440, 'Daily customer sync, 22 new')] }),
    app('amazon', 'Amazon Seller Central · US', 'channels', 'Listings, FBM orders and stock for the Amazon US store.', { status: 'warning', account: 'Fernhill Apparel · Seller ID A2F…7QX', by: 'Rafiq Hasan', since: Date.UTC(2024, 4, 20), lastSync: NOW - 12 * M, every: 'Every 15 minutes', count: { channel: 'Amazon US', label: 'orders in 30 days' }, price: 'Free',
      issue: '14 listings are suppressed because they have no GTIN. Add barcodes in All Products to bring them back.', issueHref: 'Products.dc.html',
      toggles: [T('Import orders', true), T('Push stock levels', true, 'From Newark only'), T('Push prices', true), T('Create listings for new products', false)], scopes: ['Orders', 'Listings', 'Inventory', 'Reports'],
      log: [L(12, '3 orders imported'), L(130, '14 listings suppressed: missing GTIN', 'warning'), L(240, 'Stock pushed for 196 SKUs')] }),
    app('wholesale', 'Fernhill Wholesale portal', 'channels', 'The B2B ordering portal for trade accounts, built into CommerceOS.', { status: 'connected', account: 'trade.fernhill.co', by: 'Built in', since: Date.UTC(2021, 8, 1), lastSync: NOW - 1 * M, every: 'Built in', count: { channel: 'Wholesale', label: 'orders in 30 days' }, price: 'Included',
      toggles: [T('Show live stock to buyers', true), T('Allow orders below minimum quantity', false), T('Send invoices automatically', true, 'Net 30 or Net 45 from the customer group')], scopes: [], log: [L(18, 'Order #ORD-10603 placed by Lakeside Outfitters'), L(300, 'Price list “Wholesale key accounts” republished')] }),
    app('etsy', 'Etsy', 'channels', 'Sell home goods and accessories on Etsy.'), app('faire', 'Faire', 'channels', 'Wholesale marketplace for independent shops.'),

    app('stripe', 'Stripe', 'payments', 'Card payments and payouts for both Shopify stores.', { status: 'connected', account: 'acct_1L…9Fh (US) · acct_1N…2Qa (EU)', by: 'Daniel Okoye', since: Date.UTC(2022, 0, 12), lastSync: NOW - 4 * M, every: 'Real time (webhooks)', count: { pay: 'Card', label: 'card payments in 30 days' }, price: '2.9% + 30¢ a payment',
      toggles: [T('Import payouts and fees', true), T('Match payouts to bank lines', true), T('Import disputes', true)], scopes: ['Payments', 'Payouts', 'Disputes'], log: [L(4, 'Payout po_1Q… in transit, $18,412.60'), L(1300, 'Dispute opened on #ORD-10214, $312.40', 'warning')] }),
    app('paypal', 'PayPal', 'payments', 'PayPal checkout and payouts.', { status: 'connected', account: 'payments@fernhill.co', by: 'Daniel Okoye', since: Date.UTC(2022, 5, 2), lastSync: NOW - 30 * M, every: 'Every 30 minutes', count: { pay: 'PayPal', label: 'PayPal payments in 30 days' }, price: '3.49% + 49¢ a payment',
      toggles: [T('Import payouts and fees', true), T('Match payouts to bank lines', true)], scopes: ['Transactions', 'Balances'], log: [L(30, '9 payments imported'), L(1440, 'Daily payout, $1,212.40')] }),
    app('bkash', 'bKash Merchant', 'payments', 'Mobile wallet payments for Bangladesh orders.', { status: 'connected', account: 'Merchant 01711-40…', by: 'Daniel Okoye', since: Date.UTC(2023, 1, 14), lastSync: NOW - 20 * M, every: 'Every 20 minutes', count: { pay: 'bKash', label: 'bKash payments in 30 days' }, price: '1.5% a payment',
      toggles: [T('Import payments', true), T('Send refunds through bKash', true, 'Refunds to closed wallets fail and go to the Failed tab')], scopes: ['Checkout', 'Refund', 'Settlement'], log: [L(20, '14 payments imported'), L(900, '2 refunds failed: wallet closed', 'warning')] }),
    app('klarna', 'Klarna', 'payments', 'Buy now, pay later at checkout.'),

    app('pathao', 'Pathao Courier', 'shipping', 'Same-day and next-day delivery in Bangladesh, with cash on delivery.', { status: 'connected', account: 'Merchant 88104', by: 'Jamal Uddin', since: Date.UTC(2022, 2, 1), lastSync: NOW - 6 * M, every: 'Every 10 minutes', count: { carrier: 'Pathao Courier', label: 'parcels in 30 days' }, price: 'Per parcel',
      toggles: [T('Buy labels', true), T('Import tracking', true), T('Import cash-on-delivery remittances', true, 'Into BRAC Bank ••7720')], scopes: ['Orders', 'Tracking', 'Payments'], log: [L(6, 'Tracking updated for 41 parcels'), L(1500, 'COD remittance, ৳1,240,800')] }),
    app('dhl', 'DHL eCommerce', 'shipping', 'Labels and tracking from Newark, Dhaka and Chattogram.', { status: 'connected', account: 'Account 5320…118', by: 'Marcus Reed', since: Date.UTC(2022, 0, 20), lastSync: NOW - 5 * M, every: 'Every 15 minutes', count: { carrier: 'DHL eCommerce', label: 'parcels in 30 days' }, price: 'Per label',
      toggles: [T('Buy labels', true), T('Import tracking', true), T('Book pickups automatically', true, 'At each site’s pickup time')], scopes: ['Shipping', 'Tracking', 'Pickups'], log: [L(5, 'Tracking updated for 63 parcels'), L(90, '28 labels bought at Newark')] }),
    app('postnl', 'PostNL', 'shipping', 'Parcels from Rotterdam across the EU.', { status: 'connected', account: 'Customer 10392', by: 'Sofie de Vries', since: Date.UTC(2023, 3, 3), lastSync: NOW - 8 * M, every: 'Every 15 minutes', price: 'Per label',
      toggles: [T('Buy labels', true), T('Import tracking', true), T('Book pickups automatically', true)], scopes: ['Shipping', 'Tracking'], log: [L(8, 'Tracking updated for 37 parcels'), L(640, 'Reconnected with a new API key by Priya Natarajan', 'info'), L(700, 'API key expired', 'danger')] }),
    app('fedex', 'FedEx', 'shipping', 'Express parcels from Newark.', { status: 'connected', account: 'Account 7781…04', by: 'Marcus Reed', since: Date.UTC(2024, 1, 2), lastSync: NOW - 15 * M, every: 'Every 15 minutes', count: { carrier: 'FedEx', label: 'parcels in 30 days' }, price: 'Per label',
      toggles: [T('Buy labels', true), T('Import tracking', true)], scopes: ['Ship', 'Track'], log: [L(15, 'Tracking updated for 12 parcels')] }),
    app('harbour', 'Harbour Logistics (3PL)', 'shipping', 'Sydney 3PL: stock levels in, orders out, from their own system.', { status: 'connected', account: 'Client FERN-AU', by: 'Priya Natarajan', since: Date.UTC(2024, 8, 9), lastSync: NOW - 58 * M, every: 'Every hour', price: 'Per order and per pallet',
      toggles: [T('Send Australian orders', true), T('Import stock levels', true), T('Import receipts', true)], scopes: ['Orders', 'Stock', 'ASN'], log: [L(58, 'Stock imported for 214 SKUs'), L(118, '7 orders sent')] }),
    app('shipstation', 'ShipStation', 'shipping', 'Multi-carrier label printing and rate shopping.'),

    app('klaviyo', 'Klaviyo', 'marketing', 'Email and SMS: profiles, segments and campaign results.', { status: 'connected', account: 'Fernhill (2 lists)', by: 'Mei Lin', since: Date.UTC(2022, 3, 18), lastSync: NOW - 10 * M, every: 'Every 10 minutes', price: '$1,840 a month',
      toggles: [T('Sync customers and consent', true), T('Sync saved segments as lists', true), T('Import campaign results', true)], scopes: ['Profiles', 'Lists', 'Campaigns', 'Metrics'], log: [L(10, '31 profiles updated'), L(55, 'Campaign “Autumn VIP preview” scheduled')] }),
    app('meta', 'Meta Ads', 'marketing', 'Facebook and Instagram ads, catalog and conversions.', { status: 'warning', account: 'Fernhill Business Manager', by: 'Mei Lin', since: Date.UTC(2022, 6, 1), lastSync: NOW - 35 * M, every: 'Every hour', price: 'Ad spend billed by Meta',
      issue: 'The access token expires on Oct 7. Reconnect to keep catalog and spend syncing.', toggles: [T('Sync product catalog', true), T('Send purchase conversions', true), T('Import spend', true)], scopes: ['ads_read', 'catalog_management'], log: [L(35, 'Spend imported, Sep 30: $1,041.20'), L(8600, 'Token expires in 6 days', 'warning')] }),
    app('google-ads', 'Google Ads & Merchant Center', 'marketing', 'Shopping feed, ads spend and conversions.', { status: 'connected', account: 'Merchant 1209…44', by: 'Mei Lin', since: Date.UTC(2022, 6, 1), lastSync: NOW - 50 * M, every: 'Every hour', price: 'Ad spend billed by Google',
      toggles: [T('Sync shopping feed', true), T('Import spend', true), T('Send conversions', true)], scopes: ['Content API', 'Ads reporting'], log: [L(50, 'Feed updated, 812 items')] }),
    app('tiktok', 'TikTok Ads', 'marketing', 'TikTok spend and conversions.', { status: 'connected', account: 'Fernhill Ads 7311…', by: 'Mei Lin', since: Date.UTC(2025, 1, 10), lastSync: NOW - 70 * M, every: 'Every hour', price: 'Ad spend billed by TikTok',
      toggles: [T('Import spend', true), T('Send conversions', true)], scopes: ['Reporting', 'Events'], log: [L(70, 'Spend imported')] }),
    app('pinterest', 'Pinterest Ads', 'marketing', 'Catalog and ads on Pinterest.'),

    app('chase', 'Chase bank feed', 'finance', 'Daily bank lines for Chase Business ••4821 (USD).', { status: 'connected', account: 'Chase Business ••4821', by: 'Daniel Okoye', since: Date.UTC(2022, 0, 5), lastSync: NOW - 4 * H, every: 'Daily, 05:00 UTC', price: 'Free',
      toggles: [T('Import transactions', true), T('Suggest matches', true)], scopes: ['Read transactions'], log: [L(240, '9 lines imported, 6 matched')] }),
    app('wise', 'Wise', 'finance', 'EUR account for Stripe EU payouts and Rotterdam bills.', { status: 'connected', account: 'Wise EUR ••1093', by: 'Daniel Okoye', since: Date.UTC(2023, 3, 1), lastSync: NOW - 4 * H, every: 'Daily, 05:00 UTC', price: 'Free',
      toggles: [T('Import transactions', true), T('Suggest matches', true)], scopes: ['Read transactions'], log: [L(240, '4 lines imported')] }),
    app('brac', 'BRAC Bank statement import', 'finance', 'BDT account for bKash and cash-on-delivery remittances.', { status: 'warning', account: 'BRAC Bank ••7720', by: 'Daniel Okoye', since: Date.UTC(2023, 1, 1), lastSync: Date.UTC(2026, 8, 30, 11, 0), every: 'Manual CSV upload', price: 'Free',
      issue: 'BRAC Bank has no live feed. The last statement was uploaded Sep 30; upload October’s to keep matching up to date.', toggles: [T('Suggest matches', true)], scopes: [], log: [L(1360, 'Statement uploaded: 31 lines', 'info')] }),
    app('xero', 'Xero', 'finance', 'Post journals, invoices and bills to your ledger.'),
    app('quickbooks', 'QuickBooks Online', 'finance', 'Post journals, invoices and bills to your ledger.'),
    app('avalara', 'Avalara', 'finance', 'US sales tax calculation and filing.'),

    app('gorgias', 'Gorgias', 'workspace', 'Help desk: order details next to every ticket.', { status: 'connected', account: 'fernhill.gorgias.com', by: 'Jonas Weber', since: Date.UTC(2023, 5, 1), lastSync: NOW - 1 * M, every: 'Real time', price: '$750 a month',
      toggles: [T('Show orders in tickets', true), T('Allow refunds from tickets', true, 'Up to $250, as in the Customer support role'), T('Allow cancellations from tickets', false)], scopes: ['Orders', 'Customers', 'Refunds'], log: [L(9, 'Refund RF-7311 issued from ticket #48210')] }),
    app('google', 'Google Workspace', 'workspace', 'Single sign-on for everyone with a fernhill.co address.', { status: 'connected', account: 'fernhill.co', by: 'Tahmid Chowdhury', since: Date.UTC(2021, 2, 15), lastSync: NOW - 2 * M, every: 'At each sign-in', price: '$612 a month',
      toggles: [T('Sign in with Google', true), T('Create users from the directory', false)], scopes: ['openid', 'email', 'profile'], log: [L(2, 'Priya Natarajan signed in')] }),
    app('slack', 'Slack', 'workspace', 'Alerts for late orders, low stock and failed payments.', { status: 'connected', account: 'fernhill.slack.com · #ops-alerts', by: 'Priya Natarajan', since: Date.UTC(2023, 8, 1), lastSync: NOW - 22 * M, every: 'As events happen', price: 'Free',
      toggles: [T('Late orders', true), T('Low stock', true), T('Failed payments', true), T('Daily summary at 08:00', false)], scopes: ['chat:write'], log: [L(22, 'Alert: 17 orders past the 24h target')] }),
    app('zendesk', 'Zendesk', 'workspace', 'Help desk with order context.')];

  var API_KEYS = [
    { id: 'key_live_reporting', name: 'BI warehouse export', prefix: 'cos_live_8f2a', scopes: ['Read orders', 'Read inventory', 'Read finance'], by: 'Daniel Okoye', created: Date.UTC(2025, 10, 3), used: NOW - 3 * H },
    { id: 'key_live_label', name: 'Label printer bridge, Newark', prefix: 'cos_live_c71e', scopes: ['Read orders', 'Write fulfillment'], by: 'Marcus Reed', created: Date.UTC(2024, 1, 2), used: NOW - 6 * M },
    { id: 'key_live_old', name: 'Old Zapier key', prefix: 'cos_live_19bd', scopes: ['Read orders'], by: 'Priya Natarajan', created: Date.UTC(2023, 4, 9), used: Date.UTC(2026, 1, 11) }];
  var WEBHOOKS = [
    { id: 'wh_1', url: 'https://hooks.fernhill.co/erp/orders', events: ['order.created', 'order.cancelled'], on: true, ok: 0.999, last: NOW - 2 * M },
    { id: 'wh_2', url: 'https://bi.fernhill.co/ingest/stock', events: ['inventory.updated'], on: true, ok: 0.994, last: NOW - 4 * M },
    { id: 'wh_3', url: 'https://old-zap.example.com/hook/3391', events: ['order.created'], on: false, ok: 0.41, last: Date.UTC(2026, 1, 11) }];

  /* ---------- settings defaults ---------- */
  var SETTINGS = {
    business: { name: 'Fernhill', legal: 'Fernhill Apparel Ltd.', email: 'hello@fernhill.co', phone: '+880 2 5501 2290', address: 'Plot 14, Tejgaon Industrial Area, Dhaka 1208, Bangladesh', vat: 'BIN 004418722-0101',
      tz: 'Asia/Dhaka', currency: 'USD', weight: 'kg', dims: 'cm', fiscal: '1', dateFmt: 'MMM D, YYYY' },
    stores: [
      { key: 'us', name: 'Fernhill US', domain: 'fernhill.co', currency: 'USD', taxIncl: false, from: 'Newark, NJ', lang: 'English (US)' },
      { key: 'eu', name: 'Fernhill EU', domain: 'fernhill.eu', currency: 'EUR', taxIncl: true, from: 'Rotterdam DC', lang: 'English, German, Dutch' },
      { key: 'wholesale', name: 'Wholesale', domain: 'trade.fernhill.co', currency: 'USD', taxIncl: false, from: 'Dhaka and Chattogram', lang: 'English' },
      { key: 'amazon', name: 'Amazon US', domain: 'amazon.com', currency: 'USD', taxIncl: false, from: 'Newark, NJ', lang: 'English (US)' }],
    rates: { auto: true, eur: '1.084', bdt: '119.6', aud: '1.52', updated: NOW - 4 * H },
    taxes: [
      { key: 'us', region: 'United States', how: 'Sales tax by state, calculated at checkout', rate: 'Varies', reg: '12 states registered', on: true },
      { key: 'eu', region: 'European Union', how: 'VAT One-Stop Shop, registered in the Netherlands', rate: '21% (NL) · destination rates', reg: 'NL859301772B01', on: true },
      { key: 'bd', region: 'Bangladesh', how: 'VAT on domestic sales', rate: '15%', reg: 'BIN 004418722-0101', on: true },
      { key: 'au', region: 'Australia', how: 'GST, collected by the 3PL’s storefront', rate: '10%', reg: 'ABN 41 622 018 554', on: true },
      { key: 'uk', region: 'United Kingdom', how: 'Not registered. Orders ship DDP-free with a duties notice', rate: '—', reg: '', on: false }],
    orders: { prefix: '#ORD-', target: '24', autoConfirm: true, cancelUnpaid: '48', split: true, holdHigh: true, highValue: '1500', returnsDays: '30', restock: true },
    inventory: { costing: 'avg', safety: '7', overselling: false, reserve: true, countA: 'monthly', countB: 'quarterly', countC: 'yearly', approveOver: '500', lowNotify: true },
    notify: [
      { key: 'late', label: 'Orders past the processing target', email: true, slack: true, app: true },
      { key: 'low', label: 'Stock below reorder point', email: true, slack: true, app: true },
      { key: 'failed', label: 'Failed payments', email: true, slack: true, app: true },
      { key: 'refund', label: 'Refunds waiting for approval', email: true, slack: false, app: true },
      { key: 'po', label: 'Purchase orders waiting for approval', email: true, slack: false, app: true },
      { key: 'review', label: 'New product reviews to moderate', email: false, slack: false, app: true },
      { key: 'integration', label: 'Integration errors', email: true, slack: true, app: true },
      { key: 'digest', label: 'Daily summary at 08:00', email: true, slack: false, app: false }],
    security: { twofa: 'admins', session: '12', sso: true, ssoOnly: false, pwLen: '12', ipAllow: false, ips: '' }
  };

  window.FernhillManagement = { MODULES: MODULES, LEVELS: LEVELS, ROLES: ROLES, USERS: USERS, WH: WH, PLAN: PLAN, AUDIT: AUDIT, AUDIT_KINDS: AUDIT_KINDS, CATS: CATS, APPS: APPS, API_KEYS: API_KEYS, WEBHOOKS: WEBHOOKS, SETTINGS: SETTINGS };
})();

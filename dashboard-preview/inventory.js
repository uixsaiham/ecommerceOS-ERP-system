/* Fernhill inventory shared by the Inventory pages (Overview, Stock Levels, Stock Transfers, Stock
   Adjustments, Low Stock). Built on catalog.js (load it first). Stock is held per variant per warehouse
   and adds up to the catalog's per-variant stock. Matches the dashboard: the same 8 SKUs below reorder
   level and 3 overstocked locations; with 10 more locations short where another warehouse has spare
   stock, that makes the 18 low-stock locations on the sidebar badge. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var F = window.Fernhill, NOW = F.NOW, DAY = F.DAY;

  var WAREHOUSES = [
    { key: 'dhk', name: 'Dhaka Warehouse', short: 'Dhaka', city: 'Dhaka, Bangladesh', kind: 'Own warehouse', capacity: 14000, serves: 'Wholesale and Fernhill US overflow', carrier: 'Pathao Courier' },
    { key: 'ctg', name: 'Chattogram Warehouse', short: 'Chattogram', city: 'Chattogram, Bangladesh', kind: 'Own warehouse', capacity: 9000, serves: 'Wholesale exports and Fernhill EU overflow', carrier: 'Pathao Courier' },
    { key: 'rtm', name: 'Rotterdam DC', short: 'Rotterdam', city: 'Rotterdam, Netherlands', kind: 'Distribution center', capacity: 12000, serves: 'Fernhill EU', carrier: 'PostNL' },
    { key: 'ewr', name: 'Newark, NJ', short: 'Newark', city: 'Newark, New Jersey, US', kind: 'Distribution center', capacity: 15000, serves: 'Fernhill US and Amazon US', carrier: 'DHL eCommerce' },
    { key: 'syd', name: 'Sydney 3PL', short: 'Sydney', city: 'Sydney, Australia', kind: 'Third-party logistics', capacity: 4000, serves: 'Australia and New Zealand orders', carrier: 'Australia Post' }
  ];
  var WH = {}; WAREHOUSES.forEach(function (w) { WH[w.key] = w; });
  function whByName(name) { return WAREHOUSES.filter(function (w) { return w.name === name; })[0]; }

  var SUPPLIER_BY_ORIGIN = { Bangladesh: ['Narayanganj Garments Ltd.', 21], Portugal: ['Porto Knit Lda.', 28], Scotland: ['Highland Mill', 35], Vietnam: ['Saigon Outdoor Co.', 42],
    Lithuania: ['Baltic Linen UAB', 30], Turkey: ['Anatolia Socks', 24], England: ['Northwind Textiles', 28], India: ['Jaipur Silk House', 30] };
  function supplierOf(p) { if (p.vendor === 'Dhaka Loom Co.') return ['Dhaka Loom Co.', 18]; if (p.vendor === 'Highland Mill' || p.vendor === 'Porto Knit Lda.') return [p.vendor, SUPPLIER_BY_ORIGIN[p.origin][1]]; return SUPPLIER_BY_ORIGIN[p.origin] || ['Narayanganj Garments Ltd.', 21]; }

  /* SKUs the dashboard names: all their stock sits in one warehouse */
  var PINNED = { 'SKU-OVS-SAND-L': 'ewr', 'SKU-TOT-NAT-OS': 'ewr', 'SKU-HOD-FOR-S': 'syd', 'SKU-CRD-TAN-OS': 'ewr', 'SKU-TSH-NAVY-M': 'rtm', 'SKU-BNE-CHR-OS': 'rtm',
    'SKU-SCK-MIX-3942': 'rtm', 'SKU-TSH-BLK-L': 'ewr', 'SKU-RSH-OLV-M': 'rtm', 'SKU-SHT-STN-32': 'ewr', 'SKU-HAT-NAT-OS': 'syd' };
  var MAX = { 'SKU-RSH-OLV-M': 150, 'SKU-SHT-STN-32': 200, 'SKU-HAT-NAT-OS': 120 };
  /* short at one warehouse while others hold plenty: a transfer fixes these */
  var LOCAL_SHORT = [['SKU-TEE-WHT-M', 'rtm'], ['SKU-OXF-LBL-L', 'ewr'], ['SKU-CHN-NVY-32', 'ewr'], ['SKU-HOD-GRY-M', 'rtm'], ['SKU-FCS-NVY-L', 'ewr'],
    ['SKU-PKT-ECR-M', 'rtm'], ['SKU-MHS-CHR-3942', 'ewr'], ['SKU-JUT-NAT-OS', 'rtm'], ['SKU-BNE-NVY-OS', 'ewr'], ['SKU-TEE-BLK-L', 'ewr']];

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function weightsFor(p) {
    var on = function (c) { return p.channels.indexOf(c) >= 0; };
    return { dhk: on('wh') ? 0.2 : 0.1, ctg: on('wh') ? 0.12 : 0.05, rtm: on('eu') ? 0.3 : 0.04, ewr: on('us') || on('amz') ? 0.36 : 0.1, syd: p.parent === 'outer' || p.cat === 'hats' || p.cat === 'tees' ? 0.08 : 0.02 };
  }

  var ITEMS = [];   // one per variant: { sku, p, v, stock: {wh: n}, reorder: {wh: n}, max: {wh: n}, v30, committed: {wh: n} }
  F.PRODUCTS.forEach(function (p) {
    var sup = supplierOf(p), totalW = 0, n = p.variants.length;
    p.variants.forEach(function (v, vi) {
      var r = F.rng(hash(v.sku)), it = { sku: v.sku, p: p, v: v, stock: {}, reorder: {}, max: {}, committed: {}, supplier: sup[0], lead: sup[1] };
      if (PINNED[v.sku]) {
        WAREHOUSES.forEach(function (w) { it.stock[w.key] = w.key === PINNED[v.sku] ? v.stock : 0; it.reorder[w.key] = w.key === PINNED[v.sku] ? v.reorder : 0; });
        if (MAX[v.sku]) it.max[PINNED[v.sku]] = MAX[v.sku];
      } else {
        var w0 = weightsFor(p), keys = Object.keys(w0), sum = keys.reduce(function (a, k) { return a + w0[k]; }, 0), left = v.stock;
        keys.forEach(function (k, i) {
          var share = i === keys.length - 1 ? left : Math.min(left, Math.round(v.stock * w0[k] / sum * (0.85 + r() * 0.3)));
          it.stock[k] = share; left -= share;
        });
        keys.forEach(function (k) { it.reorder[k] = Math.floor(it.stock[k] * 0.3); });
      }
      /* demand: product sales spread over variants (middle sizes sell more) */
      var mid = v.size === 'M' || v.size === 'L' || v.size === '32' || v.size === '39–42' ? 1.35 : v.size === 'XS' || v.size === '36' || v.size === '43–46' ? 0.7 : 1;
      it.wt = mid * (0.8 + r() * 0.4); totalW += it.wt;
      it.r = r;
      ITEMS.push(it);
    });
    ITEMS.slice(ITEMS.length - n).forEach(function (it) { it.v30 = p.status === 'active' ? p.sold30 * it.wt / totalW : 0; });
  });
  var BY_SKU = {}; ITEMS.forEach(function (it) { BY_SKU[it.sku] = it; });

  LOCAL_SHORT.forEach(function (x) {
    var it = BY_SKU[x[0]], k = x[1]; if (!it) return;
    var donor = WAREHOUSES.map(function (w) { return w.key; }).filter(function (w) { return w !== k; }).sort(function (a, b) { return it.stock[b] - it.stock[a]; })[0];
    var keep = Math.max(1, Math.floor(Math.max(it.reorder[k], 12) * 0.35)), move = it.stock[k] - keep;
    it.reorder[k] = Math.max(it.reorder[k], 12);
    it.stock[k] = keep; it.stock[donor] += move; it.reorder[donor] = Math.floor(it.stock[donor] * 0.3);
  });
  /* committed: reserved for open orders, roughly two days of demand at each location */
  ITEMS.forEach(function (it) {
    var tot = WAREHOUSES.reduce(function (a, w) { return a + it.stock[w.key]; }, 0);
    WAREHOUSES.forEach(function (w) { it.committed[w.key] = tot ? Math.min(it.stock[w.key], Math.round(it.v30 / 15 * it.stock[w.key] / tot)) : 0; });
  });

  /* ---------- purchase orders still open (inbound) ---------- */
  var POS = [
    { id: 'PO-20431', supplier: 'Narayanganj Garments Ltd.', wh: 'ewr', eta: NOW + 8 * DAY, status: 'In production', lines: [['SKU-TOT-NAT-OS', 400]] },
    { id: 'PO-20428', supplier: 'Porto Knit Lda.', wh: 'rtm', eta: NOW + 12 * DAY, status: 'Shipped', lines: [['SKU-TSH-NAVY-M', 120], ['SKU-TSH-NAVY-S', 60]] },
    { id: 'PO-20435', supplier: 'Porto Knit Lda.', wh: 'ewr', eta: NOW + 19 * DAY, status: 'Confirmed', lines: [['SKU-TSH-BLK-L', 90], ['SKU-TSH-BLK-M', 60]] },
    { id: 'PO-20440', supplier: 'Highland Mill', wh: 'rtm', eta: NOW + 26 * DAY, status: 'Confirmed', lines: [['SKU-BNE-CHR-OS', 150]] },
    { id: 'PO-20437', supplier: 'Porto Knit Lda.', wh: 'ewr', eta: NOW + 21 * DAY, status: 'In production', lines: [['SKU-CHC-CHR-S', 30], ['SKU-CHC-CHR-M', 40], ['SKU-CHC-CHR-L', 30], ['SKU-CHC-NVY-S', 25], ['SKU-CHC-NVY-M', 30], ['SKU-CHC-NVY-L', 25]] },
    { id: 'PO-20426', supplier: 'Narayanganj Garments Ltd.', wh: 'dhk', eta: NOW + 5 * DAY, status: 'Ready to ship', lines: [['SKU-TEE-WHT-M', 300], ['SKU-TEE-WHT-L', 240], ['SKU-CHN-STN-32', 120]] }
  ];
  var INBOUND = {};   // sku → [{ wh, qty, ref, eta }]
  function addInbound(sku, x) { (INBOUND[sku] = INBOUND[sku] || []).push(x); }
  POS.forEach(function (po) { po.lines.forEach(function (l) { addInbound(l[0], { wh: po.wh, qty: l[1], ref: po.id, eta: po.eta, kind: 'po', supplier: po.supplier }); }); });

  /* ---------- transfers ---------- */
  var USERS = ['Priya Natarajan', 'Jamal Uddin', 'Sofie de Vries', 'Marcus Reed', 'Nusrat Jahan'];
  var TRANSFERS = [
    { id: 'TR-3116', from: 'syd', to: 'ewr', status: 'draft', created: NOW - 2 * 36e5, eta: null, by: 'Priya Natarajan', carrier: null, note: 'Straw bucket hats are overstocked in Sydney going into the southern winter.', lines: [['SKU-HAT-NAT-OS', 176]] },
    { id: 'TR-3115', from: 'ewr', to: 'rtm', status: 'requested', created: NOW - 9 * 36e5, eta: null, by: 'Sofie de Vries', carrier: null, note: 'Rotterdam asked for summer shorts for the EU end-of-season sale.', lines: [['SKU-SHT-STN-32', 240], ['SKU-SHT-NVY-32', 60]] },
    { id: 'TR-3112', from: 'dhk', to: 'rtm', status: 'in_transit', created: NOW - 9 * DAY, shipped: NOW - 7 * DAY, eta: NOW + 2 * DAY, by: 'Jamal Uddin', carrier: 'Maersk LCL + PostNL', ref: 'MAEU 7741 2093', note: 'Monthly EU replenishment.', lines: [['SKU-TEE-WHT-M', 140], ['SKU-TEE-BLK-M', 120], ['SKU-HOD-FOR-M', 60], ['SKU-PKT-ECR-L', 80]] },
    { id: 'TR-3109', from: 'ctg', to: 'rtm', status: 'in_transit', created: NOW - 16 * DAY, shipped: NOW - 14 * DAY, eta: NOW - 3 * DAY, by: 'Jamal Uddin', carrier: 'Maersk LCL', ref: 'MAEU 7738 5521', delayed: 'Held at Rotterdam customs for a textile-origin check since Sep 28.', lines: [['SKU-CHN-NVY-32', 90], ['SKU-CHN-OLV-32', 70], ['SKU-OXF-WHT-M', 60]] },
    { id: 'TR-3110', from: 'dhk', to: 'ewr', status: 'in_transit', created: NOW - 12 * DAY, shipped: NOW - 10 * DAY, eta: NOW + 4 * DAY, by: 'Jamal Uddin', carrier: 'DHL Global Forwarding', ref: 'DHL 4410 8823 19', note: 'US restock before the holiday catalog.', lines: [['SKU-OXF-LBL-L', 70], ['SKU-FCS-NVY-L', 60], ['SKU-JUT-NAT-OS', 100]] }
  ];
  (function buildHistory() {
    var r = F.rng(3307), routes = [['dhk', 'rtm'], ['dhk', 'ewr'], ['ctg', 'rtm'], ['ewr', 'syd'], ['rtm', 'ewr'], ['dhk', 'ctg'], ['ewr', 'rtm']], active = ITEMS.filter(function (it) { return it.p.status === 'active'; });
    for (var i = 0; i < 30; i++) {
      var rt = routes[Math.floor(r() * routes.length)], age = 4 + i * 2.1 + r() * 2, nl = 1 + Math.floor(r() * 4), lines = [], seen = {};
      for (var l = 0; l < nl; l++) { var it = active[Math.floor(r() * active.length)]; if (seen[it.sku]) continue; seen[it.sku] = 1; lines.push([it.sku, 10 * (2 + Math.floor(r() * 14))]); }
      var cancelled = r() < 0.07, short = !cancelled && r() < 0.12;
      /* door-to-door days by route: in-country 2, sea freight to or from Bangladesh 14, Sydney 6, US–EU 8; ~1 in 6 runs a few days late */
      var bdA = rt[0] === 'dhk' || rt[0] === 'ctg', bdB = rt[1] === 'dhk' || rt[1] === 'ctg', td = bdA && bdB ? 2 : bdA || bdB ? 14 : (rt[0] === 'syd' || rt[1] === 'syd') ? 6 : 8;
      var took = td - 0.6 + r() * 1.4 + (r() < 0.16 ? 2 + r() * 3 : 0);
      TRANSFERS.push({ id: 'TR-' + (3107 - i), from: rt[0], to: rt[1], status: cancelled ? 'cancelled' : 'received', created: NOW - (age + took + 2) * DAY, shipped: cancelled ? null : NOW - (age + took) * DAY,
        eta: NOW - age * DAY, received: cancelled ? null : NOW - age * DAY, by: USERS[Math.floor(r() * USERS.length)], carrier: rt[0] === 'ewr' && rt[1] === 'syd' ? 'DHL Express' : rt[0] === 'dhk' && rt[1] === 'ctg' ? 'Pathao Freight' : 'Maersk LCL',
        lines: lines, shortBy: short ? Math.max(1, Math.round(lines[0][1] * 0.05)) : 0, note: cancelled ? 'Cancelled: stock was sold before pickup.' : '' });
    }
  })();
  TRANSFERS.forEach(function (t) { if (t.status === 'in_transit') t.lines.forEach(function (l) { addInbound(l[0], { wh: t.to, qty: l[1], ref: t.id, eta: t.eta, kind: 'transfer', from: t.from }); }); });

  /* ---------- adjustments ---------- */
  var REASONS = [
    { key: 'count', label: 'Cycle count', sign: 0 }, { key: 'damaged', label: 'Damaged', sign: -1 }, { key: 'lost', label: 'Lost or stolen', sign: -1 },
    { key: 'found', label: 'Found stock', sign: 1 }, { key: 'return', label: 'Customer return restocked', sign: 1 }, { key: 'quality', label: 'Quality hold', sign: -1 },
    { key: 'sample', label: 'Samples and marketing', sign: -1 }, { key: 'correction', label: 'Receiving correction', sign: 0 }
  ];
  var REASON = {}; REASONS.forEach(function (x) { REASON[x.key] = x; });
  var NOTES = {
    count: ['Weekly cycle count, zone A.', 'Cycle count after a mis-pick report.', 'Blind count by the night shift.', 'Recount after a short pick.'],
    damaged: ['Torn during picking.', 'Water damage in the carton.', 'Stained at the seam, not sellable.', 'Crushed in an inbound carton.'],
    lost: ['Missing after a recount; flagged to the site lead.', 'Not found after a full aisle search.'],
    found: ['Found in the wrong bin during a count.', 'Found in returns staging.'],
    'return': ['Return passed inspection.', 'Return restocked as new.', 'Exchange return restocked.'],
    quality: ['Loose stitching on a batch sample; held for the supplier.', 'Color mismatch against the approved swatch.'],
    sample: ['Photo shoot for the autumn lookbook.', 'Samples for the wholesale buyer meeting.', 'Influencer seeding.'],
    correction: ['Receiving entered the wrong size.', 'Supplier packing list differed from the ASN.']
  };
  var ADJUSTMENTS = [
    { id: 'ADJ-5521', sku: 'SKU-RSH-NVY-M', wh: 'rtm', qty: -24, reason: 'count', status: 'pending', ts: NOW - 3 * 36e5, by: 'Sofie de Vries', note: 'Quarterly count: bin B-12-01 had 24 fewer than the system. Possibly mis-picked as Olive.' },
    { id: 'ADJ-5520', sku: 'SKU-SHT-STN-34', wh: 'ewr', qty: -22, reason: 'damaged', status: 'pending', ts: NOW - 6 * 36e5, by: 'Marcus Reed', note: 'Roof leak over aisle 7 soaked a carton of 22. Photos attached to the facilities ticket.' },
    { id: 'ADJ-5518', sku: 'SKU-JUT-NAT-OS', wh: 'dhk', qty: 80, reason: 'found', status: 'pending', ts: NOW - 20 * 36e5, by: 'Jamal Uddin', note: 'Two cartons found in returns staging, never put away after the July wholesale return.' }
  ];
  (function buildLog() {
    var r = F.rng(9113), active = ITEMS.filter(function (it) { return it.p.status === 'active'; }), weights = [['count', 0.3], ['damaged', 0.17], ['lost', 0.06], ['found', 0.07], ['return', 0.26], ['quality', 0.05], ['sample', 0.05], ['correction', 0.04]];
    for (var i = 0; i < 64; i++) {
      var x = r(), reason = 'count'; for (var k = 0; k < weights.length; k++) { x -= weights[k][1]; if (x <= 0) { reason = weights[k][0]; break; } }
      var it = active[Math.floor(r() * active.length)], whs = WAREHOUSES.filter(function (w) { return it.stock[w.key] > 0; }), wh = (whs[Math.floor(r() * whs.length)] || WAREHOUSES[3]).key;
      var mag = reason === 'return' ? 1 + Math.floor(r() * 3) : reason === 'sample' ? 1 + Math.floor(r() * 4) : 1 + Math.floor(Math.pow(r(), 2) * 18);
      var sign = REASON[reason].sign || (r() < 0.62 ? -1 : 1), rejected = r() < 0.04;
      ADJUSTMENTS.push({ id: 'ADJ-' + (5517 - i), sku: it.sku, wh: wh, qty: sign * mag, reason: reason, status: rejected ? 'rejected' : 'applied', ts: NOW - (1 + i * 0.85 + r() * 0.8) * DAY,
        by: USERS[Math.floor(r() * USERS.length)], note: NOTES[reason][Math.floor(r() * NOTES[reason].length)], approvedBy: mag >= 20 ? 'Priya Natarajan' : null,
        rejectNote: rejected ? 'Recount matched the system. No change needed.' : null });
    }
  })();

  /* inventory value trend: weekly value at cost for the last 12 weeks, ending at today's figure */
  function activeValue() { return ITEMS.reduce(function (a, it) { return a + (it.p.status === 'active' ? WAREHOUSES.reduce(function (b, w) { return b + it.stock[w.key]; }, 0) * it.p.cost : 0); }, 0); }
  var VALUE_TREND = (function () {
    var end = activeValue(), shape = [0.93, 0.95, 0.98, 1.0, 1.04, 1.07, 1.06, 1.03, 1.05, 1.08, 1.04, 1.0], out = [];
    for (var i = 0; i < 12; i++) out.push({ ts: NOW - (11 - i) * 7 * DAY, value: Math.round(end * shape[i] / shape[11]) });
    return out;
  })();

  /* ---------- helpers ---------- */
  function onHand(it, wh) { return wh ? it.stock[wh] : WAREHOUSES.reduce(function (a, w) { return a + it.stock[w.key]; }, 0); }
  function committed(it, wh) { return wh ? it.committed[wh] : WAREHOUSES.reduce(function (a, w) { return a + it.committed[w.key]; }, 0); }
  function inbound(it, wh) { return (INBOUND[it.sku] || []).filter(function (x) { return !wh || x.wh === wh; }); }
  function inboundQty(it, wh) { return inbound(it, wh).reduce(function (a, x) { return a + x.qty; }, 0); }
  function velocity(it, wh) { var tot = onHand(it); var d = it.v30 / 30; return wh ? (tot ? d * it.stock[wh] / tot : 0) : d; }
  function reorderAt(it, wh) { return wh ? it.reorder[wh] : WAREHOUSES.reduce(function (a, w) { return a + it.reorder[w.key]; }, 0); }
  /* stock state for a SKU at one location: out, low, over, ok, none (not stocked there) */
  function locState(it, wh) {
    if (it.p.status !== 'active') return 'none';
    if (!it.reorder[wh] && !it.stock[wh]) return 'none';
    if (it.stock[wh] === 0) return 'out';
    if (it.stock[wh] < it.reorder[wh]) return 'low';
    if (it.max[wh] && it.stock[wh] > it.max[wh]) return 'over';
    return 'ok';
  }
  function skuState(it) {
    if (it.p.status !== 'active') return 'inactive';
    var st = WAREHOUSES.map(function (w) { return locState(it, w.key); });
    if (onHand(it) === 0) return 'out';
    if (it.v.stock < it.v.reorder) return 'low';
    if (st.indexOf('over') >= 0) return 'over';
    if (st.indexOf('low') >= 0 || st.indexOf('out') >= 0) return 'local';
    return 'ok';
  }
  function daysCover(it, wh) { var d = velocity(it, wh); return d > 0 ? (wh ? it.stock[wh] : onHand(it)) / d : Infinity; }
  function coverLabel(days) { return days === Infinity ? 'No recent sales' : days < 1 ? 'Under a day' : days > 365 ? 'Over a year' : Math.round(days) + ' days'; }


  /* ---------- warehouse operations (Warehouses pages) ---------- */
  var OPS = {
    dhk: { address: 'Plot 14, Tejgaon Industrial Area, Dhaka 1208', manager: 'Jamal Uddin', phone: '+880 2 5501 2290', staff: 22, sqm: 3200, docks: 4, hours: 'Sat–Thu, 08:00–20:00', cutoff: '16:00', tz: 'BST',
      status: 'busy', note: '25 orders are past the 24-hour processing target after the weekend sale. Two extra pickers are on the afternoon shift.', shippedToday: 10, toShip: 100, late: 25, onTime: 0.97, accuracy: 0.995, pickHours: 5.2, cost: 0.92 },
    ctg: { address: 'Bay Terminal Road, Patenga, Chattogram 4204', manager: 'Nusrat Jahan', phone: '+880 31 250 4471', staff: 14, sqm: 2400, docks: 3, hours: 'Sat–Thu, 08:00–20:00', cutoff: '15:00', tz: 'BST',
      status: 'operational', note: '17 orders are past the 24-hour target; most are export orders waiting on the 16:00 Pathao pickup.', shippedToday: 4, toShip: 73, late: 17, onTime: 0.98, accuracy: 0.993, pickHours: 6.1, cost: 0.88 },
    rtm: { address: 'Waalhaven Zuidzijde 41, 3089 JH Rotterdam', manager: 'Sofie de Vries', phone: '+31 10 808 2140', staff: 26, sqm: 4100, docks: 6, hours: 'Mon–Sat, 07:00–22:00', cutoff: '15:00', tz: 'CET',
      status: 'busy', note: '20 orders are past the 24-hour processing target. Two pickers are out sick this week.', shippedToday: 0, toShip: 70, late: 20, onTime: 0.86, accuracy: 0.991, pickHours: 19.4, cost: 1.64 },
    ewr: { address: '600 Doremus Avenue, Newark, NJ 07105', manager: 'Marcus Reed', phone: '+1 (973) 555-0148', staff: 31, sqm: 5200, docks: 8, hours: 'Mon–Fri, 06:00–22:00 · Sat, 08:00–16:00', cutoff: '14:00', tz: 'ET',
      status: 'operational', note: 'Roof leak over aisle 7 is being repaired. Bins C-07-01 to C-07-05 are blocked until Oct 3.', shippedToday: 0, toShip: 43, late: 9, onTime: 0.95, accuracy: 0.996, pickHours: 7.8, cost: 1.38 },
    syd: { address: 'Unit 3, 20 Bourke Road, Alexandria NSW 2015', manager: 'Liam Chen (Harbour Logistics)', phone: '+61 2 9037 4410', staff: 6, sqm: 900, docks: 2, hours: 'Mon–Fri, 08:00–17:00', cutoff: '13:00', tz: 'AEST',
      status: 'operational', partner: 'Harbour Logistics Pty Ltd', shippedToday: 19, toShip: 7, late: 0, onTime: 0.99, accuracy: 0.998, pickHours: 4.1, cost: 2.65 }
  };
  WAREHOUSES.forEach(function (w) { Object.assign(w, OPS[w.key]); });

  /* order routing: which warehouse ships each channel's orders first; the next one takes over when stock runs out */
  var ROUTING = [
    { channel: 'us', label: 'Fernhill US', order: ['ewr', 'dhk', 'syd'], rule: 'nearest', note: 'Australia and New Zealand orders ship from Sydney 3PL.' },
    { channel: 'eu', label: 'Fernhill EU', order: ['rtm', 'ctg'], rule: 'priority' },
    { channel: 'wh', label: 'Wholesale', order: ['dhk', 'ctg'], rule: 'priority' },
    { channel: 'amz', label: 'Amazon US', order: ['ewr'], rule: 'priority' }
  ];

  /* zones and bins: zone by top-level category, aisle and level from the SKU */
  var ZONES = [
    { key: 'A', label: 'Zone A · Tops', cats: ['tops'], share: 0.46 }, { key: 'B', label: 'Zone B · Outerwear', cats: ['outer'], share: 0.15 },
    { key: 'C', label: 'Zone C · Bottoms', cats: ['bottoms'], share: 0.15 }, { key: 'D', label: 'Zone D · Accessories', cats: ['acc', 'home'], share: 0.16 },
    { key: 'E', label: 'Zone E · Overflow and returns', cats: [], share: 0.08 }
  ];
  function zoneOf(it) { var top = it.p.parent || it.p.cat; for (var i = 0; i < 4; i++) if (ZONES[i].cats.indexOf(top) >= 0) return ZONES[i].key; return 'D'; }
  var BIN = {};
  ITEMS.forEach(function (it) {
    var h = hash(it.sku), z = zoneOf(it);
    WAREHOUSES.forEach(function (w, i) {
      var over = it.max[w.key] && it.stock[w.key] > it.max[w.key];
      BIN[it.sku + '@' + w.key] = (over ? 'E' : z) + '-' + pad2(1 + ((h >>> (i * 3)) % 20)) + '-' + pad2(1 + ((h >>> 7) % 5));
    });
  });
  function binOf(it, wh) { return BIN[it.sku + '@' + wh]; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  /* stock age: days since the oldest units at a location were received */
  function ageOf(it, wh) { if (!it.stock[wh]) return 0; var r = F.rng(hash(it.sku + wh)), cov = daysCover(it, wh); return Math.round(Math.min(420, (cov === Infinity ? 300 : cov) * (0.08 + Math.pow(r(), 1.5) * 0.6) + 2 + r() * 25)); }
  /* last full count per zone and warehouse */
  var COUNTS = {};
  WAREHOUSES.forEach(function (w, i) { ZONES.forEach(function (z, j) { COUNTS[w.key + z.key] = NOW - ((i * 7 + j * 11) % 41 + 3) * DAY; }); });

  /* ---------- receiving ---------- */
  var RECEIPTS = [];
  (function buildReceipts() {
    var seq = 8841;
    function rc(o) { o.id = 'RCV-' + seq--; RECEIPTS.push(o); }
    rc({ ref: 'PO-20424', kind: 'po', from: 'Narayanganj Garments Ltd.', wh: 'ewr', status: 'receiving', eta: NOW - 3 * 36e5, arrived: NOW - 2.5 * 36e5, dock: 'Dock 3', carrier: 'Maersk + DHL drayage', cartons: 42,
      lines: [['SKU-TEE-WHT-M', 180, 180, 0], ['SKU-TEE-BLK-M', 160, 120, 0], ['SKU-TEE-NVY-L', 140, null, null], ['SKU-CHN-NVY-34', 90, null, null]] });
    rc({ ref: 'PO-20430', kind: 'po', from: 'Dhaka Loom Co.', wh: 'dhk', status: 'arrived', eta: NOW - 1 * 36e5, arrived: NOW - 0.6 * 36e5, dock: 'Dock 1', carrier: 'Pathao Freight', cartons: 9,
      lines: [['SKU-SCF-IND-OS', 60, null, null], ['SKU-SCF-RST-OS', 60, null, null], ['SKU-CMP-IND-M', 30, null, null], ['SKU-JUT-NAT-OS', 120, null, null]] });
    rc({ ref: 'PO-20412', kind: 'po', from: 'Highland Mill', wh: 'rtm', status: 'completed', eta: NOW - 6 * 36e5, arrived: NOW - 5 * 36e5, completed: NOW - 12 * 6e4, dock: 'Dock 2', carrier: 'DFDS Logistics', cartons: 24, by: 'Sofie de Vries',
      lines: [['SKU-LMB-OAT-M', 80, 80, 0], ['SKU-LMB-OAT-L', 80, 72, 0], ['SKU-LMB-FOR-M', 60, 60, 0], ['SKU-LSC-OAT-OS', 50, 46, 2]] });
    POS.forEach(function (po) { if (po.status === 'Shipped' || po.status === 'Ready to ship' || po.status === 'Confirmed' || po.status === 'In production')
      rc({ ref: po.id, kind: 'po', from: po.supplier, wh: po.wh, status: 'expected', eta: po.eta, dock: null, carrier: po.status === 'Shipped' ? 'Maersk LCL' : 'Booked on dispatch', cartons: Math.ceil(po.lines.reduce(function (a, l) { return a + l[1]; }, 0) / 24), poStatus: po.status,
        lines: po.lines.map(function (l) { return [l[0], l[1], null, null]; }) }); });
    TRANSFERS.forEach(function (t) { if (t.status === 'in_transit') rc({ ref: t.id, kind: 'transfer', from: WH[t.from].name, wh: t.to, status: 'expected', eta: t.eta, dock: null, carrier: t.carrier, cartons: Math.ceil(t.lines.reduce(function (a, l) { return a + l[1]; }, 0) / 30), delayed: t.delayed,
      lines: t.lines.map(function (l) { return [l[0], l[1], null, null]; }) }); });
    var r = F.rng(6151), sups = ['Narayanganj Garments Ltd.', 'Porto Knit Lda.', 'Saigon Outdoor Co.', 'Baltic Linen UAB', 'Anatolia Socks', 'Highland Mill', 'Dhaka Loom Co.'], active = ITEMS.filter(function (it) { return it.p.status === 'active'; });
    for (var i = 0; i < 26; i++) {
      var wx = r(), w = wx < 0.35 ? 'ewr' : wx < 0.6 ? 'rtm' : wx < 0.85 ? 'dhk' : wx < 0.95 ? 'ctg' : 'syd', at = NOW - (1 + i * 1.1 + r()) * DAY, nl = 2 + Math.floor(r() * 4), lines = [], seen = {};
      var sup = sups[Math.floor(r() * sups.length)], own = active.filter(function (x) { return x.supplier === sup; }); if (!own.length) own = active;
      for (var l = 0; l < nl; l++) { var it = own[Math.floor(r() * own.length)]; if (seen[it.sku]) continue; seen[it.sku] = 1; var q = 20 * (2 + Math.floor(r() * 9)), short = r() < 0.03 ? Math.ceil(q * 0.05) : 0, dmg = r() < 0.03 ? 1 + Math.floor(r() * 3) : 0; lines.push([it.sku, q, q - short, dmg]); }
      rc({ ref: 'PO-' + (20411 - i), kind: 'po', from: sup, wh: w, status: 'completed', eta: at - 2 * 36e5, arrived: at - 2 * 36e5, completed: at, dock: 'Dock ' + (1 + Math.floor(r() * WH[w].docks)), carrier: 'Freight', cartons: Math.ceil(lines.reduce(function (a, x) { return a + x[1]; }, 0) / 24), by: WH[w].manager.split(' (')[0], lines: lines });
    }
  })();
  window.FernhillInventory = {
    WAREHOUSES: WAREHOUSES, WH: WH, whByName: whByName, ITEMS: ITEMS, BY_SKU: BY_SKU, POS: POS, INBOUND: INBOUND, TRANSFERS: TRANSFERS, ADJUSTMENTS: ADJUSTMENTS,
    REASONS: REASONS, REASON: REASON, USERS: USERS, VALUE_TREND: VALUE_TREND,
    ROUTING: ROUTING, ZONES: ZONES, zoneOf: zoneOf, binOf: binOf, ageOf: ageOf, COUNTS: COUNTS, RECEIPTS: RECEIPTS,
    onHand: onHand, committed: committed, inbound: inbound, inboundQty: inboundQty, velocity: velocity, reorderAt: reorderAt, locState: locState, skuState: skuState, daysCover: daysCover, coverLabel: coverLabel
  };
})();

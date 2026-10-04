/* Fernhill fulfillment shared by the Fulfillment pages (Overview, Picking, Packing, Shipping, Delivery
   Tracking). Built on catalog.js, inventory.js and orders.js (load them first). Every order here is an order
   on the Orders page with the same id, customer, warehouse, delivery method and late flag:
   confirmed orders wait to be picked, processing orders are being picked or packed, ready-to-ship orders
   wait for a label or the carrier, and shipped orders are tracked with the carrier. Sydney 3PL ships its
   own orders from Harbour Logistics’ system, so it isn’t in these queues. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var F = window.Fernhill, I = window.FernhillInventory, O = window.FernhillOrders, NOW = F.NOW, DAY = F.DAY, DAY0 = F.DAY0, H = 36e5, M = 6e4;

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function srng(s) { return F.rng(hash(s)); }
  var SITES = ['dhk', 'ctg', 'rtm', 'ewr'];
  var SITE_OF = {}; O.WAREHOUSES.forEach(function (n) { SITE_OF[n] = I.whByName(n).key; });
  var BD = { dhk: 1, ctg: 1 };

  /* people and stations per site */
  var PICKERS = { dhk: ['Rina Akter', 'Shafiq Islam', 'Mitu Das', 'Hasan Ali'], ctg: ['Kamal Uddin', 'Sumaiya Noor', 'Babul Mia'], rtm: ['Joris Bakker', 'Ewa Nowak', 'Milan de Groot'], ewr: ['Carlos Diaz', 'Tanya Brooks', 'Dev Shah', 'Keisha Moore'] };
  var PACKERS = { dhk: ['Lipi Roy', 'Arif Hossain'], ctg: ['Nasrin Sultana'], rtm: ['Lotte Smit', 'Kees Vos'], ewr: ['Grace Kim', 'Luis Romero'] };
  var STATIONS = { dhk: 4, ctg: 2, rtm: 4, ewr: 6 };
  var OUT = { rtm: ['Ahmed Benali', 'Sanne Mulder'] };   // two Rotterdam pickers out sick this week

  /* carriers: Orders uses DHL eCommerce for standard, FedEx for express; same-day goes to a local courier */
  function carrierFor(o, site) {
    if (o.delivery === 'Store pickup') return 'Collection';
    if (o.delivery === 'Same-day') return BD[site] ? 'Pathao Courier' : site === 'rtm' ? 'Trunkrs' : 'Uber Direct';
    return o.carrier;
  }
  var PICKUPS = {
    dhk: [['Pathao Courier', 11], ['DHL eCommerce', 15.5], ['FedEx', 16], ['Pathao Courier', 17.5]], ctg: [['DHL eCommerce', 14.5], ['FedEx', 15], ['Pathao Courier', 16]],
    rtm: [['Trunkrs', 12], ['DHL eCommerce', 15], ['FedEx', 15.5], ['PostNL', 17]], ewr: [['Uber Direct', 11], ['FedEx', 13.5], ['DHL eCommerce', 14], ['Uber Direct', 16]]
  };
  /* site local hour → UTC timestamp today */
  var TZ = { dhk: 6, ctg: 6, rtm: 2, ewr: -4 }, OPEN_AT = { dhk: 8, ctg: 8, rtm: 7, ewr: 6 };
  function localToday(site, hour) { return DAY0 + (hour - TZ[site]) * H; }
  function localHour(site, ts) { var d = new Date(ts + TZ[site] * H); return (d.getUTCHours() < 10 ? '0' : '') + d.getUTCHours() + ':' + (d.getUTCMinutes() < 10 ? '0' : '') + d.getUTCMinutes(); }

  function linesOf(o) {
    var map = {}, order = [];
    o.skus.forEach(function (s) { if (!map[s]) { map[s] = 0; order.push(s); } map[s]++; });
    var left = o.items - order.reduce(function (a, s) { return a + map[s]; }, 0), i = 0;
    while (left > 0) { map[order[i % order.length]]++; left--; i++; }
    return order.map(function (s) { var it = I.BY_SKU[s]; return { sku: s, qty: map[s], name: it.p.name, variant: it.v.label, price: it.p.price }; });
  }
  function bin(sku, site) { return I.binOf(I.BY_SKU[sku], site); }
  function priority(o) { return o.delivery === 'Same-day' ? 0 : o.delivery === 'Express' ? 1 : o.channel === 'Wholesale' ? 3 : 2; }

  /* ---------- open orders: the fulfillment queue ---------- */
  var OPEN = [], LISTS = [], listSeq = { dhk: 0, ctg: 0, rtm: 0, ewr: 0 };
  O.ORDERS.forEach(function (o) {
    if (['confirmed', 'processing', 'ready_to_ship'].indexOf(o.stage) < 0) return;
    var site = SITE_OF[o.warehouse], r = srng(o.id), x = r();
    var f = { id: o.id, order: o, site: site, customer: o.customer, channel: o.channel, delivery: o.delivery, carrier: carrierFor(o, site), late: o.delayed, lateNote: o.delayNote, ts: o.ts,
      lines: linesOf(o), units: o.items, total: o.total, b2b: o.channel === 'Wholesale' && o.items >= 10, priority: priority(o) };
    if (o.stage === 'confirmed') f.step = 'pick';
    else if (o.stage === 'processing') f.step = x < 0.62 ? 'picking' : 'pack';
    else f.step = 'ship';
    if (f.step === 'pack' || f.step === 'ship') {
      f.pickedBy = PICKERS[site][Math.floor(r() * PICKERS[site].length)];
      f.picked = Math.min(NOW - 10 * M, Math.max(o.ts + 40 * M, NOW - (0.3 + r() * 5) * H));
    }
    var opens = localToday(site, OPEN_AT[site]);
    if (f.picked && f.picked >= DAY0 && f.picked < opens) f.picked = Math.min(NOW - 10 * M, opens + r() * 40 * M);
    if (f.step === 'ship') {
      f.packedBy = PACKERS[site][Math.floor(r() * PACKERS[site].length)];
      f.packed = Math.min(NOW - 5 * M, f.picked + (8 + r() * 40) * M);
      f.box = boxFor(f); f.weight = weightOf(f);
      f.label = f.carrier === 'Collection' ? null : o.delayed || r() < 0.65 ? trackingNo(f.carrier, o.id) : null;
      f.missed = o.delayed && f.carrier !== 'Collection';
      if (f.missed) {   /* packed before the last pickup that passed without collecting it */
        var past = []; for (var dd = -2; dd <= 0; dd++) PICKUPS[site].forEach(function (p) { var t = localToday(site, p[1]) + dd * DAY; if (t <= NOW) past.push(t); });
        f.packed = Math.max.apply(null, past) - (25 + r() * 90) * M; f.picked = Math.min(f.picked, f.packed - 15 * M);
      }
    }
    OPEN.push(f);
  });
  /* picking: today’s pick lists, about 8 orders each, highest priority first */
  SITES.forEach(function (site) {
    var picking = OPEN.filter(function (f) { return f.site === site && f.step === 'picking'; }).sort(function (a, b) { return a.priority - b.priority || a.ts - b.ts; });
    for (var i = 0; i < picking.length; i += 8) {
      var batch = picking.slice(i, i + 8), r = srng(site + i), n = ++listSeq[site];
      var id = 'PL-' + site.toUpperCase() + '-' + (1000 + n * 7 + (site === 'rtm' ? 300 : site === 'ewr' ? 600 : site === 'ctg' ? 150 : 0));
      var queued = n > PICKERS[site].length, picker = queued ? null : PICKERS[site][n - 1], started = queued ? null : NOW - (12 + r() * 95) * M;
      var lines = [];
      batch.forEach(function (f) { f.list = id; f.lines.forEach(function (l) { lines.push({ order: f.id, sku: l.sku, qty: l.qty, name: l.name, variant: l.variant, bin: bin(l.sku, site) }); }); });
      lines.sort(function (a, b) { return a.bin < b.bin ? -1 : a.bin > b.bin ? 1 : 0; });
      var done = queued ? 0 : Math.floor(lines.length * (0.15 + r() * 0.7));
      lines.forEach(function (l, k) { l.picked = k < done ? l.qty : 0; });
      LISTS.push({ id: id, site: site, picker: picker, started: started, orders: batch.map(function (f) { return f.id; }), lines: lines, status: queued ? 'queued' : 'picking', cart: 'Cart ' + (1 + (n - 1) % 6) });
    }
  });

  function boxFor(f) { var u = f.units; return f.b2b ? 'Carton ×' + Math.ceil(u / 24) : u === 1 ? (f.lines[0].sku.indexOf('RSH') >= 0 || f.lines[0].sku.indexOf('OVS') >= 0 ? 'Mailer M' : 'Mailer S') : u <= 3 ? 'Box S' : u <= 6 ? 'Box M' : 'Box L'; }
  function weightOf(f) { return Math.round(f.lines.reduce(function (a, l) { var s = l.sku; return a + l.qty * (s.indexOf('RSH') >= 0 ? 0.62 : s.indexOf('HOD') >= 0 ? 0.55 : s.indexOf('OVS') >= 0 ? 0.38 : s.indexOf('SHT') >= 0 ? 0.3 : s.indexOf('TOT') >= 0 ? 0.25 : 0.15); }, 0.12) * 100) / 100; }
  function trackingNo(carrier, id) {
    var n = hash(carrier + id), d = String(n % 1e10); while (d.length < 10) d = '0' + d;
    return carrier === 'FedEx' ? '7' + d.slice(0, 11) + '4' : carrier === 'DHL eCommerce' ? 'GM' + d + '42' : carrier === 'Pathao Courier' ? 'PTH-' + d.slice(0, 8) : carrier === 'Trunkrs' ? 'TRK' + d.slice(0, 9) : carrier === 'PostNL' ? '3S' + d : 'UD-' + d.slice(0, 7);
  }

  /* ---------- shipped and delivered orders: carrier tracking ---------- */
  var EXCEPTIONS = [['Address problem', 'Carrier couldn’t find the street number. Waiting for a corrected address.'], ['Delivery attempt failed', 'No one home; parcel taken to a pickup point.'],
    ['Held at customs', 'Import duties unpaid; customs is holding the parcel.'], ['Damaged in transit', 'Carrier reported the parcel damaged at the sorting hub.']];
  var SHIPMENTS = [];
  O.ORDERS.forEach(function (o) {
    if (o.stage !== 'shipped' && o.stage !== 'delivered') return;
    var site = SITE_OF[o.warehouse], r = srng('s' + o.id), carrier = carrierFor(o, site);
    if (carrier === 'Collection') carrier = 'Collection';
    /* handed over at the site’s next carrier pickup after packing (pickups run every day at fixed local times) */
    var ready = o.ts + (o.delivery === 'Same-day' ? 1 + r() * 3 : 5 + r() * 26) * H, slots = PICKUPS[site].map(function (p) { return p[1]; }), shipped = null;
    for (var d = Math.floor((ready - DAY0) / DAY) - 1; shipped == null && d < 2; d++) slots.forEach(function (hr) { var t = localToday(site, hr) + d * DAY; if (shipped == null && t >= ready) shipped = t; });
    if (shipped == null || shipped > NOW - 10 * M) { var past = []; for (var d2 = -2; d2 <= 0; d2++) slots.forEach(function (hr) { var t = localToday(site, hr) + d2 * DAY; if (t <= NOW - 10 * M) past.push(t); }); shipped = Math.max.apply(null, past); }
    var intl = BD[site] && o.channel !== 'Wholesale' && o.delivery !== 'Same-day';
    var transit = o.delivery === 'Same-day' ? 0.3 : carrier === 'Collection' ? 0.5 : o.delivery === 'Express' ? (intl ? 4 : 2) : (intl ? 9 : 4);
    var eta = shipped + transit * DAY;
    var s = { id: o.id, order: o, site: site, customer: o.customer, channel: o.channel, delivery: o.delivery, carrier: carrier, tracking: carrier === 'Collection' ? null : trackingNo(carrier, o.id),
      shipped: shipped, eta: eta, units: o.items, total: o.total, intl: intl, orderStage: o.stage };
    var elapsed = (NOW - shipped) / DAY;
    if (o.stage === 'shipped' && o.delayed) {
      var ex = carrier === 'Collection' ? ['Not collected', 'Waiting at the pickup desk. Orders not collected within 21 days are cancelled and refunded.'] : EXCEPTIONS[hash(o.id) % EXCEPTIONS.length];
      s.status = 'exception'; s.exception = ex[0]; s.exNote = ex[1]; s.exAt = carrier === 'Collection' ? shipped + 7 * DAY : NOW - (3 + r() * 45) * H;
    }
    else if (o.stage === 'delivered' || elapsed > transit + 0.6) { var slip = r() < 0.08 ? 1 + r() * 3 : (r() - 0.75) * 0.8; s.status = 'delivered'; s.delivered = Math.max(shipped + 2 * H, Math.min(NOW - 30 * M, eta + slip * DAY)); if (o.stage === 'shipped') s.unsynced = true; }
    else if (elapsed > transit - 0.3 && o.delivery !== 'Same-day') s.status = 'out';
    else if (elapsed < 0.25) s.status = 'label';
    else s.status = 'transit';
    if (s.status !== 'delivered' && s.status !== 'exception' && NOW > eta + 0.5 * DAY) s.status = 'late';
    SHIPMENTS.push(s);
  });

  function scans(s) {
    var w = I.WH[s.site], out = [], r = srng('t' + s.id);
    out.push({ ts: s.shipped - (20 + r() * 60) * M, label: 'Label created', place: w.short });
    if (s.status === 'label') return out.reverse();
    out.push({ ts: s.shipped, label: s.carrier === 'Collection' ? 'Ready for collection' : 'Picked up by ' + s.carrier, place: w.short });
    var span = Math.max(0, Math.min(NOW, s.delivered || s.exAt || NOW) - s.shipped), hubs = s.intl ? [w.short + ' export hub', 'Leipzig hub', 'Cincinnati hub', 'Destination facility'] : [w.short + ' sorting center', 'Regional hub', 'Destination facility'];
    if (s.delivery !== 'Same-day' && s.carrier !== 'Collection') hubs.forEach(function (hb, k) { var t = s.shipped + span * (k + 1) / (hubs.length + 1.5); if (t < NOW) out.push({ ts: t, label: k === 0 ? 'Departed ' + hb : 'Arrived at ' + hb, place: hb }); });
    if (s.status === 'out' || s.status === 'delivered') out.push({ ts: s.status === 'delivered' ? s.delivered - 3 * H : NOW - (1 + r() * 3) * H, label: 'Out for delivery', place: 'Local courier' });
    if (s.status === 'delivered') out.push({ ts: s.delivered, label: s.carrier === 'Collection' ? 'Collected by the customer' : 'Delivered', place: r() < 0.6 ? 'Front door' : r() < 0.5 ? 'Handed to resident' : 'Parcel locker' });
    if (s.status === 'exception') out.push({ ts: s.exAt, label: s.exception, place: s.exNote, bad: true });
    return out.sort(function (a, b) { return b.ts - a.ts; });
  }

  /* per-site numbers the Warehouses pages show */
  var SITE_STATS = {};
  SITES.concat(['syd']).forEach(function (site) {
    var open = OPEN.filter(function (f) { return f.site === site; });
    SITE_STATS[site] = { toShip: open.length, late: open.filter(function (f) { return f.late; }).length,
      shippedToday: SHIPMENTS.filter(function (s) { return s.site === site && s.shipped >= DAY0; }).length };
  });

  window.FernhillFulfillment = {
    SITES: SITES, OPEN: OPEN, LISTS: LISTS, SHIPMENTS: SHIPMENTS, scans: scans, bin: bin, PICKERS: PICKERS, PACKERS: PACKERS, STATIONS: STATIONS, OUT: OUT, PICKUPS: PICKUPS, TZ: TZ,
    localToday: localToday, localHour: localHour, boxFor: boxFor, weightOf: weightOf, trackingNo: trackingNo, SITE_STATS: SITE_STATS, EXCEPTIONS: EXCEPTIONS
  };
})();

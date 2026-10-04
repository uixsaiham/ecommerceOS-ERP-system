/* Fernhill procurement shared by the Procurement pages (Purchase Orders, Suppliers, Goods Received,
   Purchase Returns). Built on catalog.js and inventory.js (load both first). Every PO inventory.js knows
   about is here with the same supplier, warehouse, lines and dates: the six open POs on Stock Levels and
   Low Stock, the two at the dock and the 27 received ones on the Receiving page. Goods received notes are
   the completed PO receipts, matched against the supplier's invoice. Purchase returns come from damaged
   units on those receipts and from quality holds in Stock Adjustments. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var F = window.Fernhill, I = window.FernhillInventory, NOW = F.NOW, DAY = F.DAY, H = 36e5;

  /* lead times match inventory.js (supplier per SKU, days from order to arrival) */
  var SUPPLIERS = [
    { key: 'ngl', name: 'Narayanganj Garments Ltd.', city: 'Narayanganj, Bangladesh', contact: 'Rafiq Hossain', role: 'Export manager', email: 'rafiq@nglbd.com', phone: '+880 1711 402118',
      currency: 'USD', terms: 'Net 60', incoterm: 'FOB Chattogram', moq: 300, since: 2019, lead: 21, status: 'active', makes: 'Cotton jersey tees, chinos and twill shorts' },
    { key: 'pkl', name: 'Porto Knit Lda.', city: 'Porto, Portugal', contact: 'Inês Carvalho', role: 'Account manager', email: 'ines.carvalho@portoknit.pt', phone: '+351 22 600 4471',
      currency: 'EUR', terms: 'Net 30', incoterm: 'DAP', moq: 120, since: 2021, lead: 28, status: 'active', makes: 'Heavyweight tees, sweats and knit polos' },
    { key: 'hlm', name: 'Highland Mill', city: 'Hawick, Scotland', contact: 'Callum Fraser', role: 'Sales director', email: 'callum@highlandmill.co.uk', phone: '+44 1450 372 118',
      currency: 'GBP', terms: 'Net 30', incoterm: 'DAP', moq: 100, since: 2020, lead: 35, status: 'active', makes: 'Lambswool knitwear, scarves and beanies' },
    { key: 'sgo', name: 'Saigon Outdoor Co.', city: 'Ho Chi Minh City, Vietnam', contact: 'Linh Tran', role: 'Key account lead', email: 'linh.tran@saigonoutdoor.vn', phone: '+84 28 3822 5140',
      currency: 'USD', terms: 'Net 45', incoterm: 'FOB Cat Lai', moq: 200, since: 2022, lead: 42, status: 'review', makes: 'Rain shells, field jackets and liners',
      statusNote: 'Two of their last four deliveries arrived late and PO-20438 hasn’t been confirmed. Quarterly review with Linh on Oct 14.' },
    { key: 'blu', name: 'Baltic Linen UAB', city: 'Kaunas, Lithuania', contact: 'Rūta Kazlauskienė', role: 'Export coordinator', email: 'ruta@balticlinen.lt', phone: '+370 37 409 221',
      currency: 'EUR', terms: 'Net 30', incoterm: 'DAP', moq: 100, since: 2022, lead: 30, status: 'active', makes: 'Linen shirts, shorts and home textiles' },
    { key: 'ans', name: 'Anatolia Socks', city: 'Istanbul, Turkey', contact: 'Emre Yıldız', role: 'Owner', email: 'emre@anatoliasocks.com.tr', phone: '+90 212 555 0193',
      currency: 'EUR', terms: 'Net 45', incoterm: 'EXW Istanbul', moq: 500, since: 2023, lead: 24, status: 'active', makes: 'Merino and cotton socks' },
    { key: 'nwt', name: 'Northwind Textiles', city: 'Bradford, England', contact: 'Hannah Pearce', role: 'Account manager', email: 'hannah@northwindtextiles.co.uk', phone: '+44 1274 880 412',
      currency: 'GBP', terms: 'Net 30', incoterm: 'DAP', moq: 150, since: 2021, lead: 28, status: 'active', makes: 'Wool trousers, overshirts and flannel' },
    { key: 'jsh', name: 'Jaipur Silk House', city: 'Jaipur, India', contact: 'Ananya Mehta', role: 'Export manager', email: 'ananya@jaipursilkhouse.in', phone: '+91 141 270 6633',
      currency: 'USD', terms: 'Net 45', incoterm: 'FOB Mundra', moq: 80, since: 2023, lead: 30, status: 'active', makes: 'Block-printed scarves, camp shirts and cushion covers' },
    { key: 'dlc', name: 'Dhaka Loom Co.', city: 'Dhaka, Bangladesh', contact: 'Tanvir Ahmed', role: 'Production manager', email: 'tanvir@dhakaloom.com', phone: '+880 1819 220 457',
      currency: 'USD', terms: 'Net 30', incoterm: 'EXW Dhaka', moq: 60, since: 2020, lead: 18, status: 'active', makes: 'Handloom scarves, jute bags and cotton camp shirts' }
  ];
  var SUP = {}, SUP_BY_NAME = {};
  SUPPLIERS.forEach(function (s) { SUP[s.key] = s; SUP_BY_NAME[s.name] = s; });
  function catalogOf(key) { return I.ITEMS.filter(function (it) { return it.supplier === SUP[key].name && it.p.status === 'active'; }); }
  /* what they make: their top categories in the catalog, by number of products */
  SUPPLIERS.forEach(function (s) {
    var cat = catalogOf(s.key), seen = {}, n = {};
    s.skus = cat.length;
    cat.forEach(function (it) { if (seen[it.p.id || it.p.name]) return; seen[it.p.id || it.p.name] = 1; n[it.p.cat] = (n[it.p.cat] || 0) + 1; });
    var top = Object.keys(n).sort(function (a, b) { return n[b] - n[a]; }).slice(0, 3).map(function (k) { return F.catOf(k).name.toLowerCase(); });
    if (top.length) s.makes = top.join(', ').replace(/^./, function (c) { return c.toUpperCase(); });
  });

  function line(sku, qty, rec, dmg) { var it = I.BY_SKU[sku]; return { sku: sku, qty: qty, cost: it ? it.p.cost : 0, rec: rec == null ? null : rec, dmg: dmg == null ? null : dmg }; }
  function seeded(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return F.rng(h >>> 0); }
  var BUYERS = ['Priya Natarajan', 'Jamal Uddin', 'Sofie de Vries', 'Marcus Reed'];

  /* ---------- purchase orders ----------
     status: draft · sent (waiting for the supplier to confirm) · confirmed · production · ready · shipped · receiving · received · cancelled */
  var POS = [];
  var OPEN_STATUS = { 'Confirmed': 'confirmed', 'In production': 'production', 'Ready to ship': 'ready', 'Shipped': 'shipped' };

  /* received and at-the-dock POs: from the Receiving page */
  I.RECEIPTS.forEach(function (r) {
    if (r.kind !== 'po' || r.status === 'expected') return;
    var s = SUP_BY_NAME[r.from], rnd = seeded(r.ref), arrived = r.arrived || r.eta;
    var created = arrived - (s.lead + 1 + rnd() * 3) * DAY, late = rnd() < (s.key === 'sgo' ? 0.6 : s.key === 'dlc' ? 0.3 : 0) ? 3 + Math.round(rnd() * 6) : 0;
    var po = { id: r.ref, supplier: s.key, wh: r.wh, rcv: r.id, by: BUYERS[Math.floor(rnd() * BUYERS.length)],
      created: created, sent: created + (2 + rnd() * 20) * H, confirmed: created + (1 + rnd() * 2) * DAY, shipped: arrived - (s.lead * 0.55) * DAY,
      eta: arrived - late * DAY, arrived: arrived, received: r.status === 'completed' ? r.completed : null, status: r.status === 'completed' ? 'received' : 'receiving',
      supplierRef: s.key.toUpperCase() + '-' + (4100 + Math.floor(rnd() * 800)), lines: r.lines.map(function (l) { return line(l[0], l[1], l[2], l[3]); }) };
    POS.push(po);
  });
  /* open POs: the same six as inventory.js */
  I.POS.forEach(function (o) {
    var s = SUP_BY_NAME[o.supplier], rnd = seeded(o.id), created = o.eta - (s.lead + 2) * DAY;
    var st = OPEN_STATUS[o.status];
    POS.push({ id: o.id, supplier: s.key, wh: o.wh, by: BUYERS[Math.floor(rnd() * BUYERS.length)], created: created, sent: created + 3 * H, confirmed: created + (1 + rnd()) * DAY,
      shipped: st === 'shipped' ? NOW - 9 * DAY : null, eta: o.eta, status: st, supplierRef: s.key.toUpperCase() + '-' + (4100 + Math.floor(rnd() * 800)),
      tracking: st === 'shipped' ? 'MAEU 7752 1184' : null, lines: o.lines.map(function (l) { return line(l[0], l[1]); }) });
  });
  /* the rest of the pipeline: waiting for confirmation, cancelled, drafts */
  function pick(key, n, qty) { return catalogOf(key).slice(0, n).map(function (it, i) { return line(it.sku, qty[i % qty.length]); }); }
  function lowFor(key) { return catalogOf(key).filter(function (it) { var st = I.skuState(it); return st === 'low' || st === 'out'; }); }
  var ngLow = lowFor('ngl'), dlLow = lowFor('dlc');
  POS.push(
    { id: 'PO-20438', supplier: 'sgo', wh: 'ewr', by: 'Marcus Reed', created: NOW - 3 * DAY - 2 * H, sent: NOW - 3 * DAY, eta: NOW + 39 * DAY, status: 'sent', note: 'Holiday restock of rainwear for the US store.', reminded: NOW - 26 * H, lines: pick('sgo', 3, [120, 80, 60]) },
    { id: 'PO-20439', supplier: 'blu', wh: 'rtm', by: 'Sofie de Vries', created: NOW - 6 * H, sent: NOW - 5 * H, eta: NOW + 30 * DAY, status: 'sent', note: 'Spring linen pre-order, early to secure mill capacity.', lines: pick('blu', 3, [100, 80, 60]) },
    { id: 'PO-20436', supplier: 'ans', wh: 'rtm', by: 'Sofie de Vries', created: NOW - 11 * DAY, sent: NOW - 11 * DAY + 2 * H, cancelled: NOW - 8 * DAY, eta: null, status: 'cancelled', cancelNote: 'Anatolia couldn’t meet the 500-pair minimum per color in time. Reordered as PO-20431’s companion in November.', lines: pick('ans', 2, [300, 200]) },
    { id: 'PO-20441', supplier: 'ngl', wh: 'ewr', by: 'Priya Natarajan', created: NOW - 40 * 6e4, eta: NOW + 21 * DAY, status: 'draft', note: 'Created from Low Stock: SKUs below reorder point at Newark.',
      lines: (ngLow.length ? ngLow.slice(0, 4) : catalogOf('ngl').slice(0, 3)).map(function (it) { return line(it.sku, Math.max(60, Math.ceil(Math.max(I.reorderAt(it) * 2 - I.onHand(it), 60) / 20) * 20)); }) },
    { id: 'PO-20442', supplier: 'dlc', wh: 'dhk', by: 'Jamal Uddin', created: NOW - 20 * H, eta: NOW + 18 * DAY, status: 'draft', note: 'Wholesale reorder for the winter catalog.',
      lines: (dlLow.length ? dlLow.slice(0, 3) : catalogOf('dlc').slice(0, 3)).map(function (it, i) { return line(it.sku, [80, 60, 40][i]); }) }
  );
  POS.forEach(function (po) { po.value = po.lines.reduce(function (a, l) { return a + l.qty * l.cost; }, 0); po.units = po.lines.reduce(function (a, l) { return a + l.qty; }, 0); });
  POS.sort(function (a, b) { return b.id < a.id ? -1 : 1; });
  var PO = {}; POS.forEach(function (p) { PO[p.id] = p; });

  /* ---------- goods received notes: one per completed PO receipt, matched against the invoice ----------
     match: awaiting (no invoice yet) · mismatch (invoice differs from what was received at PO price) · ready (matched, approve it) · approved (scheduled) · paid */
  var GRNS = [], gseq = 6120;
  POS.filter(function (p) { return p.status === 'received'; }).sort(function (a, b) { return b.received - a.received; }).forEach(function (p, i) {
    var s = SUP[p.supplier], rnd = seeded('g' + p.id), age = (NOW - p.received) / DAY;
    var g = { id: 'GRN-' + (gseq - i), po: p.id, rcv: p.rcv, supplier: p.supplier, wh: p.wh, received: p.received, by: I.WH[p.wh].manager.split(' (')[0], invoice: null, status: 'awaiting' };
    if (age > 1.5) {
      /* suppliers invoice what they shipped: the ordered quantity. The latest EUR invoice added a 4% energy surcharge that isn’t on the PO. */
      var bump = s.currency === 'EUR' && age < 12 && !GRNS.some(function (x) { return x.invoice && x.invoice.bump; }) ? 1.04 : 1;
      var billed = p.lines.reduce(function (a, l) { return a + l.qty * l.cost * bump; }, 0);
      g.invoice = { id: s.key.toUpperCase() + '-INV-' + (22000 + Math.floor(rnd() * 7000)), amount: Math.round(billed * 100) / 100, date: p.received - (2 + rnd() * 4) * DAY, bump: bump !== 1,
        due: p.received + Number(s.terms.replace(/\D/g, '')) * DAY };
    }
    GRNS.push(g);
  });
  function grnValues(g) {
    var p = PO[g.po], ordered = 0, accepted = 0, shortV = 0, dmgV = 0;
    p.lines.forEach(function (l) { var rec = l.rec || 0, dmg = l.dmg || 0; ordered += l.qty * l.cost; accepted += (rec - dmg) * l.cost; shortV += Math.max(0, l.qty - rec) * l.cost; dmgV += dmg * l.cost; });
    var inv = g.invoice ? g.invoice.amount : null, diff = inv == null ? 0 : inv - accepted;
    return { ordered: ordered, accepted: accepted, shortV: shortV, dmgV: dmgV, invoiced: inv, diff: diff, priceDiff: g.invoice && g.invoice.bump ? inv - ordered : 0 };
  }
  GRNS.forEach(function (g) {
    if (!g.invoice) return;
    var v = grnValues(g), age = (NOW - g.received) / DAY;
    if (Math.abs(v.diff) < 0.5) g.status = age > 16 ? 'paid' : age > 6 ? 'approved' : 'ready';
    else g.status = age > 20 ? 'paid' : 'mismatch';   // older ones were settled with a credit note
    if (g.status === 'paid') g.paid = g.invoice.due - 2 * DAY < NOW ? g.invoice.due - 2 * DAY : g.received + 14 * DAY;
    if (g.status === 'approved') g.approved = g.received + 3 * DAY;
  });
  var GRN_BY_PO = {}; GRNS.forEach(function (g) { GRN_BY_PO[g.po] = g; });

  /* ---------- purchase returns (to the supplier) ----------
     status: draft · requested (waiting for an RMA) · approved (RMA issued, ship it back) · shipped · credited · replaced · rejected */
  var RETURNS = [], rseq = 1187;
  function ret(o) { o.id = 'RTV-' + rseq--; o.value = o.lines.reduce(function (a, l) { return a + l.qty * (I.BY_SKU[l.sku] ? I.BY_SKU[l.sku].p.cost : 0); }, 0); o.units = o.lines.reduce(function (a, l) { return a + l.qty; }, 0); RETURNS.push(o); }
  /* damaged on arrival: one return per receipt with damage */
  GRNS.forEach(function (g) {
    var p = PO[g.po], dm = p.lines.filter(function (l) { return l.dmg > 0; });
    if (!dm.length) return;
    var age = (NOW - g.received) / DAY, rnd = seeded('r' + g.id), s = SUP[p.supplier];
    var st = age < 1 ? 'draft' : age < 4 ? 'requested' : age < 8 ? 'approved' : age < 13 ? 'shipped' : rnd() < 0.3 ? 'replaced' : 'credited';
    var o = { supplier: p.supplier, po: p.id, grn: g.id, wh: p.wh, reason: 'damaged', resolution: st === 'replaced' ? 'replace' : 'credit', status: st, created: g.received + 2 * H, by: g.by,
      note: ['Torn cartons on arrival; units soiled.', 'Crushed in transit, fabric creased beyond steaming.', 'Water damage on the bottom carton.'][Math.floor(rnd() * 3)],
      lines: dm.map(function (l) { return { sku: l.sku, qty: l.dmg }; }) };
    if (st !== 'draft') o.requested = o.created + 5 * H;
    if (['approved', 'shipped', 'credited', 'replaced'].indexOf(st) >= 0) { o.rma = 'RMA-' + s.key.toUpperCase() + '-' + (300 + Math.floor(rnd() * 600)); o.approved = o.requested + (1 + rnd()) * DAY; }
    if (['shipped', 'credited', 'replaced'].indexOf(st) >= 0) { o.shipped = o.approved + 1.5 * DAY; o.carrier = 'DHL Express'; o.tracking = 'DHL ' + (5100 + Math.floor(rnd() * 800)) + ' ' + (1000 + Math.floor(rnd() * 8000)); }
    if (st === 'credited') { o.closed = o.shipped + 4 * DAY; o.credit = 'CN-' + (8000 + Math.floor(rnd() * 1500)); }
    if (st === 'replaced') { o.closed = o.shipped + 5 * DAY; o.replacementPo = p.id; }
    ret(o);
  });
  /* quality holds from Stock Adjustments */
  I.ADJUSTMENTS.filter(function (a) { return a.reason === 'quality' && a.status === 'applied'; }).forEach(function (a) {
    var it = I.BY_SKU[a.sku], s = SUP_BY_NAME[it.supplier], age = (NOW - a.ts) / DAY, rnd = seeded('q' + a.id);
    var st = age < 5 ? 'requested' : age < 12 ? 'shipped' : 'credited';
    var o = { supplier: s.key, adj: a.id, wh: a.wh, reason: 'defect', resolution: 'credit', status: st, created: a.ts + 3 * H, by: a.by, note: a.note, lines: [{ sku: a.sku, qty: Math.abs(a.qty) }] };
    o.requested = o.created + 2 * H;
    if (st !== 'requested') { o.rma = 'RMA-' + s.key.toUpperCase() + '-' + (300 + Math.floor(rnd() * 600)); o.approved = o.requested + DAY; o.shipped = o.approved + 2 * DAY; o.carrier = 'DHL Express'; o.tracking = 'DHL ' + (5100 + Math.floor(rnd() * 800)) + ' ' + (1000 + Math.floor(rnd() * 8000)); }
    if (st === 'credited') { o.closed = o.shipped + 5 * DAY; o.credit = 'CN-' + (8000 + Math.floor(rnd() * 1500)); }
    ret(o);
  });
  /* two that need a decision */
  var pk = catalogOf('pkl'), sg = catalogOf('sgo');
  if (pk.length) ret({ supplier: 'pkl', po: 'PO-20428', wh: 'rtm', reason: 'wrong', resolution: 'replace', status: 'approved', created: NOW - 2 * DAY, requested: NOW - 2 * DAY + 3 * H, approved: NOW - 20 * H, rma: 'RMA-PKL-612', by: 'Sofie de Vries',
    note: 'Pre-shipment samples for PO-20428 came in Charcoal instead of Navy. Porto Knit will swap them before the main shipment leaves.', lines: [{ sku: pk[0].sku, qty: 12 }] });
  if (sg.length) ret({ supplier: 'sgo', wh: 'ewr', reason: 'defect', resolution: 'credit', status: 'rejected', created: NOW - 16 * DAY, requested: NOW - 16 * DAY + 4 * H, closed: NOW - 9 * DAY, by: 'Marcus Reed',
    note: 'Seam tape lifting on the hood after one wash test.', rejectNote: 'Saigon Outdoor says the wash test used a hotter cycle than the care label allows and declined the credit. Escalated in the Oct 14 review.', lines: [{ sku: sg[0].sku, qty: 18 }] });
  var hl = catalogOf('hlm'), an = catalogOf('ans');
  if (hl.length) ret({ supplier: 'hlm', wh: 'rtm', reason: 'defect', resolution: 'credit', status: 'shipped', created: NOW - 9 * DAY, requested: NOW - 9 * DAY + 2 * H, approved: NOW - 7 * DAY, shipped: NOW - 3 * DAY,
    rma: 'RMA-HLM-447', carrier: 'DFDS Logistics', tracking: 'DFDS 2210 7781', by: 'Sofie de Vries', note: 'Pilling after light wear on a batch of lambswool; customer returns traced to one dye lot.', lines: [{ sku: hl[0].sku, qty: 14 }, { sku: (hl[1] || hl[0]).sku, qty: 9 }] });
  if (an.length) ret({ supplier: 'ans', wh: 'ewr', reason: 'defect', resolution: 'credit', status: 'requested', created: NOW - 2 * DAY - 4 * H, requested: NOW - 2 * DAY, by: 'Marcus Reed',
    note: 'Heel seams unravelling on 3 of 10 pairs checked from the August delivery.', lines: [{ sku: an[0].sku, qty: 40 }] });
  RETURNS.sort(function (a, b) { return b.created - a.created; });

  var REASONS = { damaged: 'Damaged on arrival', defect: 'Quality defect', wrong: 'Wrong item or color', over: 'Over-delivered', late: 'Arrived too late to sell' };

  /* supplier scorecard from the last 90 days of POs */
  function scorecard(key) {
    var done = POS.filter(function (p) { return p.supplier === key && p.status === 'received' && NOW - p.received <= 90 * DAY; });
    var ordered = 0, rec = 0, dmg = 0, onTime = 0, leadSum = 0;
    done.forEach(function (p) {
      p.lines.forEach(function (l) { ordered += l.qty; rec += l.rec || 0; dmg += l.dmg || 0; });
      if (p.arrived <= p.eta + DAY) onTime++;
      leadSum += (p.arrived - p.created) / DAY;
    });
    var open = POS.filter(function (p) { return p.supplier === key && ['sent', 'confirmed', 'production', 'ready', 'shipped', 'receiving'].indexOf(p.status) >= 0; });
    var spend = POS.filter(function (p) { return p.supplier === key && (p.status === 'received' || p.status === 'receiving') && NOW - p.created <= 365 * DAY; }).reduce(function (a, p) { return a + p.value; }, 0);
    return { pos: done.length, onTime: done.length ? onTime / done.length : null, fill: ordered ? rec / ordered : null, defect: rec ? dmg / rec : null,
      lead: done.length ? leadSum / done.length : SUP[key].lead, open: open, openValue: open.reduce(function (a, p) { return a + p.value; }, 0), spend: spend,
      returns: RETURNS.filter(function (r) { return r.supplier === key; }) };
  }

  window.FernhillProcurement = {
    SUPPLIERS: SUPPLIERS, SUP: SUP, SUP_BY_NAME: SUP_BY_NAME, catalogOf: catalogOf, POS: POS, PO: PO, GRNS: GRNS, GRN_BY_PO: GRN_BY_PO, grnValues: grnValues,
    RETURNS: RETURNS, REASONS: REASONS, scorecard: scorecard, line: line, BUYERS: BUYERS
  };
})();

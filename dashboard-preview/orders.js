/* Fernhill orders: the same 2,846 orders, last 30 days, that the Orders page generates (same seed, same
   code, copied from Orders.dc.html so the ids, customers, warehouses and stages match it one to one).
   Used by the Fulfillment pages. If the Orders page generator changes, copy it here again.
   Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var NOW = Date.UTC(2026, 9, 1, 9, 42);
  var DAY0 = Date.UTC(2026, 9, 1);
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var STAGES = [
    { key: 'pending', label: 'Pending' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'processing', label: 'Processing' }, { key: 'ready_to_ship', label: 'Ready to ship' },
    { key: 'shipped', label: 'Shipped' }, { key: 'delivered', label: 'Delivered' }, { key: 'cancelled', label: 'Cancelled' }, { key: 'returned', label: 'Returned' }
  ];
  var STAGE_LABEL = {}; STAGES.forEach(function (s) { STAGE_LABEL[s.key] = s.label; });
  var STAGE_FIELDS = {
    pending: { status: 'pending', fulfillment: 'unfulfilled' }, confirmed: { status: 'confirmed', fulfillment: 'unfulfilled', payment: 'paid' },
    processing: { status: 'processing', fulfillment: 'processing', payment: 'paid' }, ready_to_ship: { status: 'processing', fulfillment: 'ready_to_ship', payment: 'paid' },
    shipped: { status: 'processing', fulfillment: 'shipped', payment: 'paid' }, delivered: { status: 'completed', fulfillment: 'delivered', payment: 'paid' },
    returned: { status: 'completed', fulfillment: 'returned' }, cancelled: { status: 'cancelled', fulfillment: 'unfulfilled' }
  };
  var PAY = { paid: ['success', 'Paid', 'check-circle'], pending: ['warning', 'Pending', 'clock'], failed: ['danger', 'Failed', 'alert-circle'], partially_refunded: ['info', 'Partially refunded', 'rotate-ccw'], refunded: ['neutral', 'Refunded', 'rotate-ccw'] };
  var FUL = { unfulfilled: ['warning', 'Unfulfilled', 'inbox'], processing: ['info', 'Processing', 'package'], ready_to_ship: ['brand', 'Ready to ship', 'clipboard-list'], shipped: ['brand', 'Shipped', 'truck'], delivered: ['success', 'Delivered', 'check-circle'], returned: ['neutral', 'Returned', 'rotate-ccw'] };
  var ORD_STATUS = { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', completed: 'Completed', cancelled: 'Cancelled' };
  var WAREHOUSES = ['Dhaka Warehouse', 'Chattogram Warehouse', 'Rotterdam DC', 'Newark, NJ'];
  var CHANNELS = ['Fernhill US', 'Fernhill EU', 'Wholesale', 'Amazon US'];
  var PAY_METHODS = ['Card', 'PayPal', 'bKash', 'Bank transfer', 'Cash on delivery'];
  var DELIVERY = ['Standard', 'Express', 'Same-day', 'Store pickup'];
  var CARRIERS = { Standard: 'DHL eCommerce', Express: 'FedEx', 'Same-day': 'Pathao Courier', 'Store pickup': 'pickup' };
  var TEAM = ['Priya Natarajan', 'Rafiq Hasan', 'Mei Lin', 'Jonas Weber'];
  var FIRST = ['Sarah', 'Ayesha', 'Daniel', 'Lena', 'Marcus', 'Nusrat', 'Tomás', 'Grace', 'Hiroshi', 'Fatima', 'Oliver', 'Priya', 'Tanvir', 'Chloé', 'Kwame', 'Sofia', 'Imran', 'Emily', 'Lucas', 'Mehjabin', 'Noah', 'Aiko', 'Rahim', 'Elena', 'James', 'Zara', 'Arjun', 'Hannah', 'Mateo', 'Sadia'];
  var LAST = ['Johnson', 'Rahman', 'Okafor', 'Lindqvist', 'Chowdhury', 'Herrera', 'Mbeki', 'Tanaka', 'Hossain', 'Bennett', 'Shah', 'Dubois', 'Mensah', 'Rossi', 'Karim', 'Walsh', 'Silva', 'Islam', 'Nguyen', 'Fischer', 'Ahmed', 'Kowalski', 'Patel', 'Haque', 'Moreau'];
  var DOMAINS = ['gmail.com', 'outlook.com', 'proton.me', 'icloud.com', 'yahoo.com'];
  var B2B = ['Harbor & Pine Co.', 'Northwind Retail', 'Lakeside Outfitters', 'Dhaka Lifestyle Ltd.', 'Bramble & Co.'];
  var PRODUCTS = [
    ['Merino crew tee', 'SKU-TSH-NAVY-M', 58], ['Merino crew tee', 'SKU-TSH-BLK-L', 58], ['Linen overshirt', 'SKU-OVS-SAND-L', 96], ['Canvas tote', 'SKU-TOT-NAT-OS', 34],
    ['Organic hoodie', 'SKU-HOD-FOR-S', 88], ['Wool beanie', 'SKU-BNE-CHR-OS', 29], ['Recycled socks 3-pack', 'SKU-SCK-MIX-3942', 24], ['North Sea rain shell', 'SKU-RSH-OLV-M', 148],
    ['Summer shorts', 'SKU-SHT-STN-32', 54], ['Leather card holder', 'SKU-CRD-TAN-OS', 42], ['Straw bucket hat', 'SKU-HAT-NAT-OS', 36], ['Jamdani scarf', 'SKU-SCF-IND-OS', 64]
  ];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(ts) { var d = new Date(ts); return MON[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); }
  function fmtWhen(ts) { var d = new Date(ts), t = pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()); if (ts >= DAY0) return 'Today, ' + t; if (ts >= DAY0 - 864e5) return 'Yesterday, ' + t; return MON[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + t; }
  function hoursAgo(ts) { return (NOW - ts) / 36e5; }
  /* only the trade accounts order through Wholesale; retail orders pick a retail store (same random draw as before) */
function retailChannel(x) { var c = CHANNELS[Math.floor(x * 4)]; return c === 'Wholesale' ? 'Fernhill US' : c; }
function buildOrders() {
    var r = rng(20261001);
    // age in days drawn per stage, then sorted: newest first. Deterministic in every engine.
    var AGE = { pending: [0, 2.2], confirmed: [0.1, 1.6], processing: [0.3, 3.2], ready_to_ship: [0.6, 2.6], shipped: [1, 16], delivered: [5, 25], returned: [9, 21], cancelled: [0, 30] };
    var QUOTA = [['pending', 124], ['confirmed', 58], ['processing', 187], ['ready_to_ship', 41], ['shipped', 1842], ['delivered', 505], ['returned', 19], ['cancelled', 70]];
    var keyed = [];
    QUOTA.forEach(function (q) { for (var n = 0; n < q[1]; n++) { var g = AGE[q[0]]; keyed.push({ st: q[0], k: g[0] + Math.pow(r(), q[0] === 'shipped' ? 1.4 : 1) * (g[1] - g[0]) }); } });
    keyed.sort(function (x, y) { return x.k - y.k; });
    var seq = keyed.map(function (x) { return x.st; }), i;
    var out = [], step = 30 * 24 * 60 / seq.length;
    for (i = 0; i < seq.length; i++) {
      var stage = seq[i], ts = NOW - Math.round((i + 0.2 + r() * 0.7) * step * 60000);
      var b2b = r() < 0.04, first = FIRST[Math.floor(r() * FIRST.length)], last = LAST[Math.floor(r() * LAST.length)];
      var name = b2b ? B2B[Math.floor(r() * B2B.length)] : first + ' ' + last;
      var email = b2b ? 'orders@' + name.toLowerCase().replace(/[^a-z]+/g, '') + '.com' : (first + '.' + last).toLowerCase().normalize('NFD').replace(/[^a-z.]/g, '') + '@' + DOMAINS[Math.floor(r() * DOMAINS.length)];
      var wh = WAREHOUSES[Math.floor(Math.pow(r(), 1.3) * 4)];
      var bd = wh === 'Dhaka Warehouse' || wh === 'Chattogram Warehouse';
      var phone = bd ? '+880 17' + Math.floor(10 + r() * 89) + '-' + Math.floor(100000 + r() * 899999) : '+1 (' + Math.floor(201 + r() * 700) + ') 555-' + pad2(Math.floor(r() * 100)) + pad2(Math.floor(r() * 100));
      var lines = b2b ? 3 + Math.floor(r() * 4) : 1 + Math.floor(Math.pow(r(), 2) * 4), items = 0, total = 0, skus = [];
      for (var l = 0; l < lines; l++) { var p = PRODUCTS[Math.floor(r() * PRODUCTS.length)], qty = b2b ? 10 + Math.floor(r() * 30) : (r() < 0.8 ? 1 : 2); items += qty; total += p[2] * qty * (b2b ? 0.55 : 1); skus.push(p[1]); }
      var delivery = b2b ? 'Standard' : DELIVERY[Math.floor(Math.pow(r(), 1.6) * 4)];
      total += delivery === 'Express' ? 18 : delivery === 'Same-day' ? 12 : delivery === 'Store pickup' ? 0 : (total > 120 ? 0 : 8.5);
      var payMethod = b2b ? 'Bank transfer' : bd ? (r() < 0.45 ? 'bKash' : r() < 0.5 ? 'Cash on delivery' : 'Card') : (r() < 0.75 ? 'Card' : 'PayPal');
      var f = STAGE_FIELDS[stage], payment = f.payment || 'paid';
      if (stage === 'pending') payment = r() < 0.27 ? 'failed' : 'pending';
      if (stage === 'cancelled') payment = r() < 0.4 ? 'refunded' : r() < 0.6 ? 'failed' : 'pending';
      if (stage === 'returned') payment = r() < 0.6 ? 'refunded' : 'partially_refunded';
      if (stage === 'delivered' && r() < 0.03) payment = 'partially_refunded';
      var age = hoursAgo(ts), delayed = false, delayNote = '';
      if ((stage === 'confirmed' || stage === 'processing') && age > 36 && r() < 0.3) { delayed = true; delayNote = 'Past the 24h processing target by ' + Math.round(age - 24) + 'h'; }
      if (stage === 'ready_to_ship' && age > 36 && r() < 0.5) { delayed = true; delayNote = 'Missed carrier pickup, waiting ' + Math.round(age) + 'h'; }
      if (stage === 'shipped' && age > 24 * 9 && r() < 0.006) { delayed = true; delayNote = 'Delivery exception reported by carrier'; }
      out.push({ id: '', stage: stage, status: f.status, fulfillment: f.fulfillment, payment: payment, ts: ts, customer: name, email: email, phone: phone, items: items, total: Math.round(total * 100) / 100,
        skus: skus, warehouse: wh, channel: b2b ? 'Wholesale' : bd ? (r() < 0.5 ? 'Fernhill US' : 'Fernhill EU') : retailChannel(r()), payMethod: payMethod, delivery: delivery,
        carrier: CARRIERS[delivery], delayed: delayed, delayNote: delayNote, owner: TEAM[Math.floor(r() * TEAM.length)] });
    }
    out.sort(function (a, b) { return b.ts - a.ts; });
    // the order from the brief
    var k = out.findIndex(function (o) { return o.ts < Date.UTC(2026, 8, 30, 21, 20) && o.stage === 'shipped'; });
    Object.assign(out[k], { customer: 'Sarah Johnson', email: 'sarah.johnson@gmail.com', phone: '+1 (415) 555-0142', items: 3, total: 248.5, payment: 'paid', stage: 'shipped', status: 'processing', fulfillment: 'shipped', warehouse: 'Dhaka Warehouse', channel: 'Fernhill US', delayed: false, skus: ['SKU-OVS-SAND-L', 'SKU-TSH-NAVY-M', 'SKU-SCF-IND-OS'], ts: Date.UTC(2026, 8, 30, 21, 14) });
    out.forEach(function (o, i) {
      o.id = '#ORD-' + (10482 + k - i); o.idLower = o.id.toLowerCase().slice(1); o.customerLower = o.customer.toLowerCase(); o.skusLower = o.skus.join(' ').toLowerCase();
      o.phoneDigits = o.phone.replace(/[^0-9]/g, ''); o.idNum = 10482 + k - i;
    });
    return out;
  }
  var ORDERS = buildOrders();
  window.FernhillOrders = { ORDERS: ORDERS, WAREHOUSES: WAREHOUSES, CHANNELS: CHANNELS, CARRIERS: CARRIERS, STAGES: STAGES, PRODUCTS: PRODUCTS, TEAM: TEAM };
})();

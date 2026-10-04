/* Fernhill returns: the same RMAs the Returns & Refunds page generates (same seed, same code, copied from
   Returns.dc.html). Used by Finance for the five refunds waiting to be paid ($642.30, as on the dashboard).
   If the Returns page generator changes, copy it here again. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var NOW = Date.UTC(2026, 9, 1, 9, 42), DAY0 = Date.UTC(2026, 9, 1);
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var STORES = [
    { key: 'all', label: 'All stores', sub: '4 stores · USD', icon: 'store', factor: 1 },
    { key: 'us', label: 'Fernhill US', sub: 'Shopify · fernhill.co', icon: 'shopping-bag', factor: 0.52 },
    { key: 'eu', label: 'Fernhill EU', sub: 'Shopify · fernhill.eu', icon: 'shopping-bag', factor: 0.27 },
    { key: 'wholesale', label: 'Wholesale', sub: 'B2B portal', icon: 'factory', factor: 0.13 },
    { key: 'amazon', label: 'Amazon US', sub: 'Marketplace', icon: 'tag', factor: 0.08 }
  ];
  var USER = { name: 'Priya Natarajan', role: 'Operations Manager', email: 'priya@fernhill.co', initials: 'PN' };
  function navLabel(path) { var r = window.CommerceOS.navResolve(path); return r.page ? r.page.label : r.module ? r.module.label : path; }
  var PRODUCTS = [
    ['Merino crew tee', 'SKU-TSH-NAVY-M', 58], ['Linen overshirt', 'SKU-OVS-SAND-L', 96], ['Canvas tote', 'SKU-TOT-NAT-OS', 34], ['Organic hoodie', 'SKU-HOD-FOR-S', 88],
    ['Wool beanie', 'SKU-BNE-CHR-OS', 29], ['Recycled socks 3-pack', 'SKU-SCK-MIX-3942', 24], ['North Sea rain shell', 'SKU-RSH-OLV-M', 148], ['Summer shorts', 'SKU-SHT-STN-32', 54],
    ['Leather card holder', 'SKU-CRD-TAN-OS', 42], ['Straw bucket hat', 'SKU-HAT-NAT-OS', 36], ['Jamdani scarf', 'SKU-SCF-IND-OS', 64]
  ];
  function prod(name) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i][0] === name) return PRODUCTS[i]; }
  var WAREHOUSES = ['Dhaka Warehouse', 'Chattogram Warehouse', 'Rotterdam DC', 'Newark, NJ'];
  var FIRST = ['Sarah', 'Ayesha', 'Daniel', 'Lena', 'Marcus', 'Nusrat', 'Tomás', 'Grace', 'Hiroshi', 'Fatima', 'Oliver', 'Tanvir', 'Chloé', 'Kwame', 'Sofia', 'Imran', 'Emily', 'Lucas', 'Mehjabin', 'Noah', 'Aiko', 'Rahim', 'Elena', 'James', 'Zara', 'Arjun', 'Hannah', 'Mateo', 'Sadia'];
  var LAST = ['Johnson', 'Rahman', 'Okafor', 'Lindqvist', 'Chowdhury', 'Herrera', 'Mbeki', 'Tanaka', 'Hossain', 'Bennett', 'Shah', 'Dubois', 'Mensah', 'Rossi', 'Karim', 'Walsh', 'Silva', 'Islam', 'Nguyen', 'Fischer', 'Ahmed', 'Patel', 'Haque', 'Moreau'];
  var DOMAINS = ['gmail.com', 'outlook.com', 'proton.me', 'icloud.com', 'yahoo.com'];
  var REASONS = ['Wrong size', 'Damaged in transit', 'Not as described', 'Changed mind', 'Defective', 'Wrong item sent'];
  var NOTES = {
    'Wrong size': ['Runs a size small, I’d like the next size up.', 'Too long in the sleeves.', 'Fits loose around the shoulders.'],
    'Damaged in transit': ['The box arrived crushed and the item is torn.', 'Water damage on the packaging and the fabric.'],
    'Not as described': ['The colour is much darker than in the photos.', 'Material feels thinner than described.'],
    'Changed mind': ['Found something else, never worn.', 'Bought two, keeping one.'],
    'Defective': ['Zip broke on the second wear.', 'Seam came apart after one wash.'],
    'Wrong item sent': ['Ordered navy, got black.', 'Received a different product.']
  };
  var RES_LABEL = { refund: 'Refund', exchange: 'Exchange', store_credit: 'Store credit' };
  var RES_OPTS = [{ value: 'refund', label: 'Refund' }, { value: 'exchange', label: 'Exchange' }, { value: 'store_credit', label: 'Store credit' }];
  var STATUS = {
    requested: ['warning', 'Requested', 'inbox'], approved: ['info', 'Awaiting item', 'truck'], received: ['brand', 'Inspecting', 'package'],
    refund_pending: ['warning', 'Refund pending', 'clock'], completed: ['success', 'Completed', 'check-circle'], rejected: ['neutral', 'Rejected', 'x']
  };
  var STEPS = ['Requested', 'Approved', 'Received', 'Refunded'];
  var STEP_INDEX = { requested: 0, approved: 1, received: 2, refund_pending: 3, completed: 4, rejected: 0 };
  var CARRIER = { 'Dhaka Warehouse': 'Pathao Courier', 'Chattogram Warehouse': 'Pathao Courier', 'Rotterdam DC': 'PostNL', 'Newark, NJ': 'DHL eCommerce' };
  var REJECT_REASONS = [
    { value: 'window', label: 'Outside the 30-day return window' }, { value: 'worn', label: 'Item shows signs of wear' },
    { value: 'final', label: 'Final-sale item, not returnable' }, { value: 'missing', label: 'Missing original tags or packaging' }
  ];
  var CREATE_DEFAULT = { order: '', customer: '', sku: 'SKU-TSH-NAVY-M', qty: '1', reason: 'Wrong size', res: 'refund', approve: true, tried: false };
  // the five refunds the dashboard reports: $642.30 total, oldest 3 days
  var PENDING = [
    { items: ['North Sea rain shell', 'Leather card holder'], ship: 8.5, fee: false, reason: 'Damaged in transit', age: 3.1 },
    { items: ['North Sea rain shell', 'Summer shorts'], ship: 8.5, fee: true, reason: 'Changed mind', age: 2.4 },
    { items: ['Linen overshirt', 'Straw bucket hat'], ship: 0, fee: false, reason: 'Not as described', age: 1.6 },
    { items: ['Wool beanie', 'Recycled socks 3-pack'], ship: 8.5, fee: false, reason: 'Wrong item sent', age: 0.9 },
    { items: ['Recycled socks 3-pack', 'Straw bucket hat'], ship: 0, fee: false, reason: 'Defective', age: 0.3 }
  ];
  function trackingFor(x) { var n = x.id.replace(/[^0-9]/g, ''); return (x.carrier === 'PostNL' ? '3SFERN' : x.carrier === 'Pathao Courier' ? 'PTH-' : 'GM6052') + n + '0' + (x.orderId.replace(/[^0-9]/g, '').slice(-3)); }
  function buildReturns() {
    var r = rng(4417), out = [];
    var QUOTA = [['requested', 9, 0.05, 2], ['approved', 11, 1, 6], ['received', 6, 2.5, 8], ['completed', 28, 5, 30], ['rejected', 5, 2, 28]];
    function person() {
      var first = FIRST[Math.floor(r() * FIRST.length)], last = LAST[Math.floor(r() * LAST.length)];
      return { name: first + ' ' + last, email: (first + '.' + last).toLowerCase().normalize('NFD').replace(/[^a-z.]/g, '') + '@' + DOMAINS[Math.floor(r() * DOMAINS.length)] };
    }
    function base(status, ageDays, items, reason) {
      var p = person(), wh = WAREHOUSES[Math.floor(Math.pow(r(), 1.3) * 4)], bd = wh === 'Dhaka Warehouse' || wh === 'Chattogram Warehouse';
      var channel = bd ? (r() < 0.5 ? 'Fernhill US' : 'Fernhill EU') : wh === 'Rotterdam DC' ? 'Fernhill EU' : r() < 0.75 ? 'Fernhill US' : 'Amazon US';
      var ts = NOW - Math.round(ageDays * 864e5), lines = [];
      (items || [PRODUCTS[Math.floor(r() * PRODUCTS.length)][0]]).forEach(function (nm) { var pp = prod(nm); lines.push({ name: pp[0], sku: pp[1], qty: !items && r() < 0.15 ? 2 : 1, price: pp[2] }); });
      var why = reason || REASONS[Math.floor(r() * REASONS.length)], notes = NOTES[why];
      var res = why === 'Wrong size' ? (r() < 0.6 ? 'exchange' : 'refund') : r() < 0.18 ? 'store_credit' : 'refund';
      return { id: '', orderId: '#ORD-' + (10180 + Math.floor(r() * 300)), customer: p.name, email: p.email, channel: channel,
        payMethod: bd ? (r() < 0.6 ? 'bKash' : 'Card') : r() < 0.78 ? 'Card' : 'PayPal', delivered: ts - (1 + r() * 9) * 864e5,
        lines: lines, reason: why, note: notes[Math.floor(r() * notes.length)], resolution: res, status: status, ts: ts, since: ts,
        carrier: CARRIER[wh], tracking: '', warehouse: wh, fee: 0, shipRefund: 0, amount: 0, log: [] };
    }
    QUOTA.forEach(function (q) {
      for (var n = 0; n < q[1]; n++) {
        var x = base(q[0], q[2] + r() * (q[3] - q[2]));
        if (q[0] === 'received' || q[0] === 'refund_pending') x.resolution = x.resolution === 'exchange' ? 'refund' : x.resolution;
        var sub = x.lines.reduce(function (a, l) { return a + l.qty * l.price; }, 0);
        if (x.reason === 'Damaged in transit' || x.reason === 'Wrong item sent') x.shipRefund = 8.5;
        if (x.reason === 'Changed mind' && x.resolution === 'refund') x.fee = Math.round(sub * 10) / 100;
        x.amount = Math.round((sub - x.fee + x.shipRefund) * 100) / 100;
        if (q[0] === 'approved') x.since = x.ts + 6 * 36e5;
        if (q[0] === 'received') x.since = NOW - (0.2 + r() * 1.5) * 864e5;
        if (q[0] === 'completed') { x.completedAt = x.ts + (3 + r() * 6) * 864e5; if (x.completedAt > NOW) x.completedAt = NOW - 36e5; x.since = x.completedAt; x.condition = r() < 0.85 ? 'resellable' : 'damaged'; x.restockAt = x.warehouse; }
        if (q[0] === 'rejected') { x.rejectReason = REJECT_REASONS[Math.floor(r() * REJECT_REASONS.length)].label; x.since = x.ts + 864e5; }
        out.push(x);
      }
    });
    PENDING.forEach(function (pd) {
      var x = base('refund_pending', pd.age + 2 + r() * 3, pd.items, pd.reason), sub = x.lines.reduce(function (a, l) { return a + l.qty * l.price; }, 0);
      x.resolution = 'refund'; x.shipRefund = pd.ship; x.fee = pd.fee ? Math.round(sub * 10) / 100 : 0;
      x.amount = Math.round((sub - x.fee + x.shipRefund) * 100) / 100; x.since = NOW - pd.age * 864e5; x.condition = 'resellable'; x.restockAt = x.warehouse;
      out.push(x);
    });
    out.sort(function (a, b) { return b.ts - a.ts; });
    out.forEach(function (x, i) { x.id = 'RMA-' + (3099 - i); if (x.status !== 'requested') x.tracking = trackingFor(x); });
    return out;
  }
  var RETURNS = buildReturns();
  window.FernhillReturns = { RETURNS: RETURNS, STATUS: STATUS, RES_LABEL: RES_LABEL };
})();

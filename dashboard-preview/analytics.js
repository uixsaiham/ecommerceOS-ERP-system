/* Fernhill analytics shared by the Analytics pages. Each function reads the data files its page loads:
   sales() needs orders.js (and marketing.js for discounts); products() catalog.js; customers() customers.js;
   inventory() inventory.js; finance() finance.js and its inputs. The daily revenue and order curves are the
   dashboard’s own (same shape and totals: $820,443 and 2,846 orders, Sep 1–30, against $804,813 and 2,613
   for Aug 2–31), so the Sales chart and the dashboard chart match. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var F = window.Fernhill, NOW = F.NOW, DAY = F.DAY, DAY0 = F.DAY0;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function scaleTo(arr, total, round) {
    var s = arr.reduce(function (a, b) { return a + b; }, 0), out = arr.map(function (v) { return v / s * total; });
    if (!round) return out.map(function (v) { return Math.round(v * 100) / 100; });
    var r = out.map(Math.round), diff = total - r.reduce(function (a, b) { return a + b; }, 0); r[r.length - 1] += diff; return r;
  }
  function dayLabel(i) { var d = new Date(Date.UTC(2026, 7, 2 + i)); return MON[d.getUTCMonth()] + ' ' + d.getUTCDate(); }
  /* store shares of revenue, orders and customers, as on the dashboard */
  var SHARE = { all: [1, 1, 1], us: [0.2598, 0.4891, 0.5516], eu: [0.1968, 0.3728, 0.3328], wholesale: [0.4893, 0.039, 0.0008], amazon: [0.0541, 0.0991, 0.1149] };
  var CHANNEL_OF_STORE = { us: 'Fernhill US', eu: 'Fernhill EU', wholesale: 'Wholesale', amazon: 'Amazon US' };

  function daily() {
    var WK = [1.12, 1.08, 0.98, 0.96, 0.97, 0.95, 1.02], rev = [], ord = [];
    for (var i = 0; i < 60; i++) {
      var base = 1 + 0.004 * i, wk = WK[i % 7], promo = (i === 48 || i === 49);
      rev.push(base * wk * (1 + 0.06 * Math.sin(i * 1.7) + 0.03 * Math.cos(i * 0.9)) * (promo ? 1.22 : 1));
      ord.push(base * wk * (1 + 0.05 * Math.sin(i * 1.3 + 1)) * (promo ? 1.3 : 1));
    }
    return { rev: scaleTo(rev.slice(0, 30), 804813).concat(scaleTo(rev.slice(30), 820443)), ord: scaleTo(ord.slice(0, 30), 2613, true).concat(scaleTo(ord.slice(30), 2846, true)), labels: Array.from({ length: 60 }, function (_, i) { return dayLabel(i); }) };
  }

  /* ---------- sales ---------- */
  function sales(store, days) {
    var O = window.FernhillOrders.ORDERS, D = daily(), sh = SHARE[store] || SHARE.all, ch = CHANNEL_OF_STORE[store];
    days = days || 30;
    var a = 60 - days, cur = { rev: D.rev.slice(a).map(function (v) { return v * sh[0]; }), ord: D.ord.slice(a).map(function (v) { return Math.round(v * sh[1]); }) };
    var prev = { rev: D.rev.slice(a - days, a).map(function (v) { return v * sh[0]; }), ord: D.ord.slice(a - days, a).map(function (v) { return Math.round(v * sh[1]); }) };
    var since = NOW - days * DAY, orders = O.filter(function (o) { return (!ch || o.channel === ch) && o.ts >= since; });
    /* weekly by store (orders) */
    var weeks = [], w0 = Date.UTC(2026, 7, 31);   // Mondays
    for (var w = w0; w < NOW; w += 7 * DAY) if (w + 7 * DAY > since) weeks.push(w);
    var byWeek = ['Fernhill US', 'Fernhill EU', 'Wholesale', 'Amazon US'].map(function (c) { return { label: c, values: weeks.map(function (w) { return orders.filter(function (o) { return o.channel === c && o.ts >= Math.max(w, since) && o.ts < w + 7 * DAY; }).reduce(function (s, o) { return s + o.total; }, 0); }) }; }).filter(function (s) { return s.values.some(function (v) { return v > 0; }); });
    var md = function (t) { var d = new Date(t); return MON[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
    var weekLabels = weeks.map(function (w) { return md(Math.max(w, since)); }), weekFull = weeks.map(function (w) { var e = Math.min(w + 6 * DAY, NOW); return md(Math.max(w, since)) + ' – ' + md(e) + (e - Math.max(w, since) < 6 * DAY ? ' (part week)' : ''); });
    /* weekday × hour (UTC) */
    /* weekday × hour: the dashboard’s daily orders spread over its hour-of-day curve (the Orders page spaces
       orders evenly in time, so it can’t answer “when”) — average orders in that hour on that weekday */
    var DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], HOUR_W = [0.012, 0.008, 0.006, 0.005, 0.005, 0.008, 0.015, 0.028, 0.040, 0.050, 0.055, 0.060, 0.066, 0.064, 0.058, 0.054, 0.052, 0.056, 0.062, 0.070, 0.072, 0.064, 0.050, 0.030];
    var hw = HOUR_W.reduce(function (x, y) { return x + y; }, 0), perDow = DOW.map(function () { return [0, 0]; });
    cur.ord.forEach(function (n, i) { var d = new Date(Date.UTC(2026, 7, 2 + a + i)), k = (d.getUTCDay() + 6) % 7; perDow[k][0] += n; perDow[k][1]++; });
    var heat = perDow.map(function (x) { var avg = x[1] ? x[0] / x[1] : 0; return HOUR_W.map(function (w) { return Math.round(avg * w / hw * 10) / 10; }); });
    function group(key) { var m = {}; orders.forEach(function (o) { var k = o[key]; m[k] = m[k] || { label: k, value: 0, n: 0 }; m[k].value += o.total; m[k].n++; }); return Object.keys(m).map(function (k) { return m[k]; }).sort(function (x, y) { return y.value - x.value; }); }
    var bins = [[0, 50, '<$50', 'Under $50'], [50, 100, '$50+', '$50 to $100'], [100, 200, '$100+', '$100 to $200'], [200, 500, '$200+', '$200 to $500'], [500, 2000, '$500+', '$500 to $2,000'], [2000, 1e9, '$2k+', '$2,000 and over']];
    var sizes = bins.map(function (b) { var l = orders.filter(function (o) { return o.total >= b[0] && o.total < b[1]; }); return { label: b[2], full: b[3], n: l.length, value: l.reduce(function (s, o) { return s + o.total; }, 0) }; });
    var K = window.FernhillMarketing, disc = K ? K.REDEMPTIONS.filter(function (r) { return r.pct && r.ts >= since && (!ch || r.order.channel === ch); }) : [];
    return { labels: D.labels.slice(a), prevLabels: D.labels.slice(a - days, a), cur: cur, prev: prev, orders: orders, byWeek: byWeek, weekLabels: weekLabels, weekFull: weekFull, heat: heat, dow: DOW,
      byMethod: group('payMethod'), byWarehouse: group('warehouse'), byDelivery: group('delivery'), byChannel: group('channel'), sizes: sizes, discounted: disc };
  }

  /* ---------- products ---------- */
  function products(store) {
    var key = { us: 'us', eu: 'eu', wholesale: 'wh', amazon: 'amz' }[store];
    var act = F.PRODUCTS.filter(function (p) { return p.status === 'active'; }).map(function (p) {
      var rev = key ? p.revCh[key] || 0 : p.rev30, units = key ? Math.round(p.unitsCh[key] || 0) : p.sold30;
      var net = units ? rev / units : p.price;
      return { p: p, rev: rev, units: units, margin: units ? (net - p.cost) / net : (p.price - p.cost) / p.price, sell: units + p.stock ? units / (units + p.stock) : 0, top: F.catOf(p.parent || p.cat).name };
    });
    return { list: act, store: key };
  }

  /* ---------- customers ---------- */
  /* customer channel key for a store key */
  var CUST_CH = { us: 'us', eu: 'eu', wholesale: 'wh', amazon: 'amz' };
  /* lifecycle stages: one per customer, in the same terms as the saved segments on the Segments page */
  var STAGES = [
    { key: 'new', label: 'New', seg: 'new30', desc: 'First order in the last 30 days' },
    { key: 'active', label: 'Active repeat', seg: 'repeat', desc: 'Two or more orders, the latest within 90 days' },
    { key: 'onetime', label: 'One-time', seg: 'onetime', desc: 'One order, 31 to 365 days ago' },
    { key: 'risk', label: 'At risk', seg: 'risk', desc: 'Two or more orders, nothing for 90 to 365 days' },
    { key: 'lapsed', label: 'Lapsed', seg: 'lapsed', desc: 'No order in over a year' }];
  function stageOf(c) {
    var since = (NOW - c.lastTs) / DAY;
    if (NOW - c.firstTs <= 30 * DAY) return 'new';
    if (since > 365) return 'lapsed';
    if (c.orders >= 2) return since <= 90 ? 'active' : 'risk';
    return 'onetime';
  }
  function customers(store, group) {
    var C = window.FernhillCustomers, ch = CUST_CH[store];
    return C.CUSTOMERS.filter(function (c) { return (!ch || c.channel === ch) && (!group || c.group === group); });
  }

  var cohortCache = {};
  function cohorts(store) {
    var ck = store || 'all';
    if (cohortCache[ck]) return cohortCache[ck];
    var C = window.FernhillCustomers, ch = CUST_CH[store], months = [], start = Date.UTC(2026, 0, 1);
    for (var m = 0; m < 9; m++) months.push(Date.UTC(2026, m, 1));
    var monthIdx = function (ts) { var d = new Date(ts); return (d.getUTCFullYear() - 2026) * 12 + d.getUTCMonth(); };
    var size = months.map(function () { return 0; }), active = months.map(function () { return Array.from({ length: 9 }, function () { return 0; }); });
    C.CUSTOMERS.forEach(function (c) {
      if (c.firstTs < start || c.b2b || (ch && c.channel !== ch)) return;
      var m0 = monthIdx(c.firstTs); if (m0 > 8) m0 = 8;
      size[m0]++;
      var seen = {};
      C.ordersOf(c).forEach(function (o) { var k = monthIdx(o.ts) - m0; if (k >= 1 && k <= 8 && !seen[k]) { seen[k] = 1; active[m0][k]++; } });
    });
    return (cohortCache[ck] = { labels: months.map(function (t) { var d = new Date(t); return MON[d.getUTCMonth()] + ' ’26'; }), size: size, pct: active.map(function (r, i) { return r.map(function (v, k) { return k === 0 ? 1 : i + k > 8 ? null : size[i] ? v / size[i] : 0; }); }) });
  }

  /* ---------- inventory ---------- */
  function inventory() {
    var I = window.FernhillInventory, items = I.ITEMS.filter(function (it) { return it.p.status === 'active'; });
    var GROUP = function (it) { var t = it.p.parent || it.p.cat; return t === 'tops' ? 'Tops' : t === 'bottoms' ? 'Bottoms' : t === 'outer' ? 'Outerwear' : 'Accessories and home'; };
    var whs = I.WAREHOUSES;
    var valueBy = ['Tops', 'Bottoms', 'Outerwear', 'Accessories and home'].map(function (g) { return { label: g, values: whs.map(function (w) { return items.filter(function (it) { return GROUP(it) === g; }).reduce(function (s, it) { return s + it.stock[w.key] * it.p.cost; }, 0); }) }; });
    var AGE = [[0, 30, '0–30 days'], [31, 90, '31–90 days'], [91, 180, '91–180 days'], [181, 9999, 'Over 180 days']];
    var age = whs.map(function (w) { var parts = AGE.map(function (b) { return items.reduce(function (s, it) { var a = I.ageOf(it, w.key); return s + (it.stock[w.key] && a >= b[0] && a <= b[1] ? it.stock[w.key] * it.p.cost : 0); }, 0); }); return { label: w.name, parts: parts, value: parts.reduce(function (x, y) { return x + y; }, 0) }; });
    var COV = [[0, 14, 'Under 2 weeks'], [14, 30, '2–4 weeks'], [30, 60, '1–2 months'], [60, 120, '2–4 months'], [120, 365, '4–12 months'], [365, 1e9, 'Over a year']];
    var cover = COV.map(function (b) { var l = items.filter(function (it) { var d = I.daysCover(it); return I.onHand(it) > 0 && d >= b[0] && d < b[1]; }); return { label: b[2], full: b[3], n: l.length, value: l.reduce(function (s, it) { return s + I.onHand(it) * it.p.cost; }, 0) }; });
    return { items: items, whs: whs, valueBy: valueBy, age: age, ageBuckets: AGE.map(function (b) { return b[2]; }), cover: cover, group: GROUP };
  }

  /* ---------- finance: three months, September from finance.js ---------- */
  function months() {
    var M = window.FernhillFinance, P = M.PNL, net = P.gross - P.cancelled - P.refunds;
    var sep = { label: 'September', gross: P.gross, cancelled: P.cancelled, refunds: P.refunds, cogs: P.cogs, fees: P.fees, opex: P.opex };
    var AUG = { shipping: 21980, payroll: 166900, marketing: 70460, facilities: 117200, software: 9610, packaging: 10840, professional: 6200, travel: 2380 };
    var JUL = { shipping: 20140, payroll: 165300, marketing: 61200, facilities: 117200, software: 9480, packaging: 9920, professional: 5100, travel: 1960 };
    function mk(label, gross, k, ox) { return { label: label, gross: gross, cancelled: gross * (P.cancelled / P.gross) * k, refunds: gross * (P.refunds / P.gross) * (2 - k), cogs: (gross - gross * (P.cancelled / P.gross)) * (P.cogs / (P.gross - P.cancelled)) * (0.98 + k * 0.02), fees: gross * (P.fees / P.gross), opex: ox }; }
    return [mk('July', 781260, 0.97, JUL), mk('August', 804813, 1.02, AUG), sep].map(function (m) {
      m.net = m.gross - m.cancelled - m.refunds; m.gp = m.net - m.cogs; m.opexTotal = Object.keys(m.opex).reduce(function (a, k) { return a + m.opex[k]; }, 0); m.op = m.gp - m.fees - m.opexTotal; return m;
    });
  }

  window.FernhillAnalytics = { daily: daily, sales: sales, products: products, customers: customers, cohorts: cohorts, STAGES: STAGES, stageOf: stageOf, CUST_CH: CUST_CH, inventory: inventory, months: months, SHARE: SHARE, CHANNEL_OF_STORE: CHANNEL_OF_STORE };
})();

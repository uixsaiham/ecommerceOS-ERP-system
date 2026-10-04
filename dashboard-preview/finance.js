/* Fernhill finance shared by the Finance pages (Overview, Payments, Refunds, Expenses, Transactions).
   Built on catalog.js, inventory.js, orders.js, procurement.js, fulfillment.js and returns.js (load them
   first). Every payment is an order on the Orders page with the same amount, method and payment status, so
   30-day sales are the dashboard’s $820,443. Processors pay out into three bank accounts; supplier bills
   are the invoices on Goods Received; carrier bills follow the parcels in Delivery Tracking; the five
   refunds waiting for approval are the ones on Returns & Refunds ($642.30). Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var F = window.Fernhill, I = window.FernhillInventory, O = window.FernhillOrders, P = window.FernhillProcurement, X = window.FernhillFulfillment, R = window.FernhillReturns;
  var NOW = F.NOW, DAY = F.DAY, DAY0 = F.DAY0, H = 36e5, WIN = NOW - 30 * DAY;
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function srng(s) { return F.rng(hash(s)); }
  function r2(n) { return Math.round(n * 100) / 100; }
  function dayStart(ts) { return Math.floor(ts / DAY) * DAY; }

  var ACCOUNTS = [
    { key: 'usd', name: 'Chase Business ••4821', bank: 'JPMorgan Chase', currency: 'USD', opening: 412380.55, use: 'Stripe US, PayPal, Amazon, wholesale wires, US bills' },
    { key: 'eur', name: 'Wise EUR ••1093', bank: 'Wise', currency: 'EUR', opening: 146410.2, use: 'Stripe EU payouts, Rotterdam bills' },
    { key: 'bdt', name: 'BRAC Bank ••7720', bank: 'BRAC Bank', currency: 'BDT', opening: 58940.75, use: 'bKash and cash-on-delivery remittances, Bangladesh payroll' }
  ];
  var ACC = {}; ACCOUNTS.forEach(function (a) { ACC[a.key] = a; });
  var KEY_ACCOUNTS = { 'Northwind Retail': 45, 'Harbor & Pine Co.': 45, 'Lakeside Outfitters': 45, 'Dhaka Lifestyle Ltd.': 45, 'Bramble & Co.': 30 };

  /* processor and fee per order */
  function processorOf(o) {
    if (o.channel === 'Amazon US') return 'Amazon';
    if (o.channel === 'Wholesale') return 'Bank transfer';
    return { Card: 'Stripe', PayPal: 'PayPal', bKash: 'bKash', 'Cash on delivery': 'Pathao COD', 'Bank transfer': 'Bank transfer' }[o.payMethod];
  }
  function feeOf(o, proc) {
    var t = o.total, bd = o.warehouse === 'Dhaka Warehouse' || o.warehouse === 'Chattogram Warehouse';
    if (proc === 'Amazon') return r2(t * 0.15);
    if (proc === 'Stripe') return r2(o.channel === 'Fernhill EU' ? t * 0.015 + 0.27 : bd ? t * 0.039 + 0.3 : t * 0.029 + 0.3);
    if (proc === 'PayPal') return r2(t * 0.0349 + 0.49);
    if (proc === 'bKash') return r2(t * 0.015);
    if (proc === 'Pathao COD') return r2(t * 0.01);
    return KEY_ACCOUNTS[o.customer] && (o.customer === 'Dhaka Lifestyle Ltd.' || o.customer === 'Bramble & Co.') ? 15 : 0;   // incoming international wire
  }
  function accountOf(o, proc) { return proc === 'bKash' || proc === 'Pathao COD' ? 'bdt' : proc === 'Stripe' && o.channel === 'Fernhill EU' ? 'eur' : 'usd'; }
  var BRANDS = ['Visa', 'Visa', 'Mastercard', 'Mastercard', 'Amex'];

  /* ---------- payments: one per order ---------- */
  var PAYMENTS = O.ORDERS.map(function (o) {
    var proc = processorOf(o), r = srng('p' + o.id), fee = o.payment === 'failed' || o.payment === 'pending' ? 0 : feeOf(o, proc);
    var p = { id: 'PAY-' + o.idNum, order: o, orderId: o.id, customer: o.customer, channel: o.channel, method: proc === 'Amazon' ? 'Amazon Pay' : o.payMethod, processor: proc, amount: o.total, fee: fee,
      status: o.payment, ts: o.ts, account: accountOf(o, proc) };
    if (proc === 'Stripe') { p.card = BRANDS[Math.floor(r() * BRANDS.length)] + ' ••' + String(1000 + Math.floor(r() * 9000)); }
    if (proc === 'bKash') p.card = 'bKash ••' + String(100 + Math.floor(r() * 900)) + '-' + String(1000 + Math.floor(r() * 9000));
    if (proc === 'Bank transfer') {
      /* the Orders page marks trade orders paid when the invoice is accepted; the wire arrives near the due date */
      p.terms = KEY_ACCOUNTS[o.customer] || 30; p.invoice = 'INV-' + (40000 + o.idNum); p.due = o.ts + p.terms * DAY;
      p.wired = o.payment === 'paid' ? o.ts + (p.terms - 9 + r() * 13) * DAY : null;
      p.invoiceStatus = o.payment === 'failed' ? 'void' : p.wired && p.wired <= NOW ? 'paid' : p.due < NOW ? 'overdue' : 'open';
      if (o.customer === 'Dhaka Lifestyle Ltd.' && p.invoiceStatus === 'open' && o.ts < NOW - 40 * DAY) p.invoiceStatus = 'overdue';
    }
    if (o.payment === 'failed') p.failReason = proc === 'bKash' ? 'Wallet PIN not confirmed in time' : ['Card declined: insufficient funds', 'Card declined: do not honor', '3-D Secure check failed', 'Card expired'][Math.floor(r() * 4)];
    if (o.payment === 'pending') p.pendingReason = proc === 'Pathao COD' ? 'Courier collects cash on delivery' : proc === 'Bank transfer' ? 'Invoice sent, waiting for the wire' : 'Customer hasn’t finished paying';
    p.net = r2(p.amount - p.fee);
    return p;
  });
  /* August wholesale invoices: placed before the Orders page’s 30 days, paid by wire in September (two are late) */
  var PRIOR_INVOICES = [], pseq = 47100;
  Object.keys(KEY_ACCOUNTS).forEach(function (name) {
    var rr = srng('aug' + name), n = 4 + Math.floor(rr() * 3), terms = KEY_ACCOUNTS[name];
    for (var i = 0; i < n; i++) {
      var ts = Date.UTC(2026, 7, 1) + (i + rr() * 0.8) * (30 / n) * DAY, amt = r2(2400 + rr() * 4800), due = ts + terms * DAY;
      var late = (name === 'Dhaka Lifestyle Ltd.' && i === 0) || (name === 'Bramble & Co.' && i === 1);
      var wired = late ? null : Math.min(due + (rr() - 0.6) * 6 * DAY, NOW - 6 * H);
      var inv = { id: 'PAY-A' + (pseq + i), invoice: 'INV-' + (pseq++), customer: name, channel: 'Wholesale', processor: 'Bank transfer', method: 'Bank transfer', amount: amt, fee: name === 'Dhaka Lifestyle Ltd.' || name === 'Bramble & Co.' ? 15 : 0,
        status: late ? 'pending' : 'paid', ts: ts, terms: terms, due: due, wired: wired, invoiceStatus: late ? (due < NOW ? 'overdue' : 'open') : wired <= NOW ? 'paid' : 'open', account: 'usd', orderId: 'August order', prior: true };
      inv.net = r2(inv.amount - inv.fee);
      PRIOR_INVOICES.push(inv);
    }
  });
  var PAY_BY_ORDER = {}; PAYMENTS.forEach(function (p) { PAY_BY_ORDER[p.orderId] = p; });

  /* ---------- refunds ---------- */
  var REFUNDS = [], rseq = 7290;
  PAYMENTS.forEach(function (p) {
    if (p.status !== 'refunded' && p.status !== 'partially_refunded') return;
    var o = p.order, r = srng('r' + o.id), full = p.status === 'refunded';
    var amt = full ? p.amount : r2(p.amount * (0.25 + r() * 0.35)), at = Math.min(NOW - 2 * H, o.ts + (o.stage === 'cancelled' ? 0.2 + r() : 6 + r() * 8) * DAY);
    var reason = o.stage === 'cancelled' ? 'Order cancelled' : o.stage === 'returned' ? 'Returned' : ['Item out of stock after payment', 'Late delivery goodwill credit', 'Damaged item, kept by customer', 'Price adjustment'][Math.floor(r() * 4)];
    var st = NOW - at < 5 * DAY && (p.processor === 'Stripe' || p.processor === 'PayPal') ? 'processing' : 'completed';
    if (p.processor === 'bKash' && r() < 0.35) st = 'failed';
    REFUNDS.push({ id: 'RF-' + (rseq--), payment: p, orderId: o.id, customer: o.customer, channel: o.channel, processor: p.processor, method: p.method, amount: amt, full: full, reason: reason, ts: at, status: st,
      by: ['Priya Natarajan', 'Rafiq Hasan', 'Mei Lin', 'Jonas Weber'][Math.floor(r() * 4)], failNote: st === 'failed' ? 'bKash rejected the refund: the wallet was closed. Send it by bank transfer or store credit.' : null,
      arrives: st === 'processing' ? at + (p.processor === 'PayPal' ? 1 : 7) * DAY : null, feeLost: p.processor === 'Stripe' || p.processor === 'Amazon' ? r2(p.fee * (amt / p.amount)) : 0 });
  });
  /* the five returns waiting for a refund (Returns & Refunds page) */
  R.RETURNS.filter(function (x) { return x.status === 'refund_pending'; }).forEach(function (x) {
    REFUNDS.push({ id: 'RF-' + (rseq--), rma: x.id, orderId: x.orderId, customer: x.customer, channel: x.channel, processor: x.payMethod === 'bKash' ? 'bKash' : x.payMethod === 'PayPal' ? 'PayPal' : 'Stripe', method: x.payMethod,
      amount: x.amount, full: false, reason: 'Return ' + x.id + ': ' + x.reason.toLowerCase(), ts: x.since, status: 'awaiting', lines: x.lines, fee: x.fee, shipRefund: x.shipRefund, condition: x.condition, by: null });
  });
  REFUNDS.sort(function (a, b) { return b.ts - a.ts; });

  /* ---------- payouts: processors settle into the bank accounts ---------- */
  var PAYOUTS = [], poSeq = 5810;
  function payoutDate(p) {
    var t = p.ts;
    if (p.processor === 'Stripe') return dayStart(t) + 2 * DAY + 7 * H;
    if (p.processor === 'PayPal') return dayStart(t) + DAY + 5 * H;
    if (p.processor === 'bKash') { var d = new Date(dayStart(t) + DAY), add = (7 - d.getUTCDay()) % 7; return dayStart(t) + DAY + add * DAY + 4 * H; }            // Sundays
    if (p.processor === 'Pathao COD') { var dl = p.order.stage === 'delivered' || p.order.stage === 'returned' ? t + 6 * DAY : null; if (!dl) return null; var dd = new Date(dl), w = dd.getUTCDay(), k = w <= 1 ? 1 - w : w <= 4 ? 4 - w : 8 - w; return dayStart(dl) + k * DAY + 6 * H; }   // Mon and Thu
    if (p.processor === 'Amazon') { var cyc = [Date.UTC(2026, 8, 8), Date.UTC(2026, 8, 22), Date.UTC(2026, 9, 6), Date.UTC(2026, 9, 20)]; for (var i = 0; i < cyc.length; i++) if (cyc[i] >= t + 7 * DAY) return cyc[i] + 9 * H; return null; }
    return null;
  }
  var groups = {};
  PAYMENTS.forEach(function (p) {
    if (p.processor === 'Bank transfer' || p.status === 'failed' || p.status === 'pending') return;
    var d = payoutDate(p); if (d == null) return;
    var key = p.processor + '|' + p.account + '|' + d;
    (groups[key] = groups[key] || { processor: p.processor, account: p.account, date: d, payments: [], refunds: [] }).payments.push(p);
  });
  REFUNDS.forEach(function (rf) {
    if (rf.status === 'awaiting' || rf.status === 'failed' || !rf.payment) return;
    var p = rf.payment, d = payoutDate({ ts: rf.ts, processor: p.processor, order: p.order }); if (d == null) return;
    var key = p.processor + '|' + p.account + '|' + d; if (groups[key]) groups[key].refunds.push(rf);
  });
  Object.keys(groups).map(function (k) { return groups[k]; }).sort(function (a, b) { return a.date - b.date; }).forEach(function (g) {
    var gross = g.payments.reduce(function (a, p) { return a + p.amount; }, 0), fees = g.payments.reduce(function (a, p) { return a + p.fee; }, 0), refunds = g.refunds.reduce(function (a, rf) { return a + rf.amount; }, 0);
    g.gross = r2(gross); g.fees = r2(fees); g.refundTotal = r2(refunds); g.net = r2(gross - fees - refunds);
    g.status = g.date <= NOW - 2 * H ? 'paid' : g.date <= NOW + DAY ? 'in_transit' : 'scheduled';
    if (g.processor === 'Amazon' && g.status !== 'paid') g.reserve = r2(g.net * 0.05);
    g.id = 'PYT-' + g.processor.slice(0, 3).toUpperCase() + '-' + (poSeq++);
    PAYOUTS.push(g);
  });
  PAYOUTS.sort(function (a, b) { return b.date - a.date; });

  /* ---------- expenses and bills ---------- */
  var EXPENSES = [], eseq = 3301;
  function ex(o) { o.id = o.id || 'EXP-' + (eseq++); o.amount = r2(o.amount); EXPENSES.push(o); return o; }
  var CATS = [
    { key: 'inventory', label: 'Inventory & suppliers', budget: 360000 }, { key: 'shipping', label: 'Shipping & carriers', budget: 52000 }, { key: 'payroll', label: 'Payroll', budget: 170000 },
    { key: 'marketing', label: 'Marketing', budget: 80000 }, { key: 'facilities', label: 'Warehouses & rent', budget: 125000 }, { key: 'software', label: 'Software', budget: 11000 },
    { key: 'packaging', label: 'Packaging', budget: 12000 }, { key: 'professional', label: 'Professional services', budget: 8000 }, { key: 'travel', label: 'Travel & other', budget: 6000 }
  ];
  var CAT = {}; CATS.forEach(function (c) { CAT[c.key] = c; });
  /* supplier invoices from Goods Received */
  P.GRNS.forEach(function (g) {
    if (!g.invoice) return;
    var sup = P.SUP[g.supplier], st = g.status === 'paid' ? 'paid' : g.status === 'approved' ? 'scheduled' : g.status === 'ready' ? 'approval' : 'review';
    ex({ vendor: sup.name, cat: 'inventory', desc: 'Invoice ' + g.invoice.id + ' for ' + g.po, amount: g.approvedAmount || g.invoice.amount, date: g.invoice.date, due: g.invoice.due, status: st, paid: g.paid || null,
      account: sup.currency === 'EUR' ? 'eur' : 'usd', ref: g.id, link: 'GoodsReceived.dc.html?grn=' + g.id, recurring: false, by: 'Goods Received' });
  });
  /* carriers bill weekly for what they collected */
  var RATE = { 'DHL eCommerce': 9.8, FedEx: 24.5, 'Pathao Courier': 1.4, Trunkrs: 6.1, 'Uber Direct': 11.2, PostNL: 5.6 };
  var weeks = [Date.UTC(2026, 8, 7), Date.UTC(2026, 8, 14), Date.UTC(2026, 8, 21), Date.UTC(2026, 8, 28)];
  Object.keys(RATE).forEach(function (c) {
    weeks.forEach(function (w, i) {
      var n = X.SHIPMENTS.filter(function (s) { return s.carrier === c && s.shipped >= w - 7 * DAY && s.shipped < w; }).length; if (!n) return;
      var inv = w + DAY, due = inv + 14 * DAY, st = due < NOW ? 'paid' : i === weeks.length - 1 ? 'approval' : 'scheduled';
      ex({ vendor: c, cat: 'shipping', desc: F.plural(n, 'parcel') + ', week of ' + F.fmtDate(w - 7 * DAY).replace(', 2026', ''), amount: n * RATE[c] * (0.9 + srng(c + i)() * 0.2), date: inv, due: due, status: st, paid: st === 'paid' ? due - DAY : null,
        account: c === 'Pathao Courier' ? 'bdt' : c === 'Trunkrs' || c === 'PostNL' ? 'eur' : 'usd', recurring: true, by: 'Carrier invoice' });
    });
  });
  /* monthly fixed costs (September) */
  var SEP30 = Date.UTC(2026, 8, 30), SEP1 = Date.UTC(2026, 8, 1), OCT1 = DAY0;
  [['Payroll · US and Netherlands', 'payroll', 96400, SEP30, 'usd'], ['Payroll · Bangladesh', 'payroll', 39650, SEP30, 'bdt'], ['Payroll · Rotterdam DC', 'payroll', 31280, SEP30, 'eur'],
   ['Prologis · Newark lease', 'facilities', 48000, SEP1, 'usd'], ['Waalhaven Vastgoed · Rotterdam lease', 'facilities', 41200, SEP1, 'eur'], ['Tejgaon Estates · Dhaka lease', 'facilities', 9800, SEP1, 'bdt'],
   ['Patenga Properties · Chattogram lease', 'facilities', 6200, SEP1, 'bdt'], ['Harbour Logistics · Sydney 3PL, September', 'facilities', 11840, SEP30, 'usd'],
   ['Meta Ads', 'marketing', 31240.18, SEP30, 'usd'], ['Google Ads', 'marketing', 29415.6, SEP30, 'usd'], ['TikTok Ads', 'marketing', 6820.4, SEP30, 'usd'], ['Klaviyo', 'software', 1840, SEP1, 'usd'],
   ['Shopify Plus · Fernhill US', 'software', 2300, SEP1, 'usd'], ['Shopify Plus · Fernhill EU', 'software', 2300, SEP1, 'eur'], ['CommerceOS', 'software', 1490, SEP1, 'usd'], ['Gorgias', 'software', 750, SEP1, 'usd'],
   ['Google Workspace', 'software', 612, SEP1, 'usd'], ['Figma', 'software', 375, SEP1, 'usd'], ['Coastline Packaging · mailers and boxes', 'packaging', 8940, Date.UTC(2026, 8, 12), 'eur'],
   ['Dhaka Box Works · cartons', 'packaging', 2180, Date.UTC(2026, 8, 18), 'bdt'], ['Moore & Vale CPAs · monthly bookkeeping', 'professional', 4500, SEP30, 'usd'], ['Van Dijk Advocaten · EU trademark filing', 'professional', 1800, Date.UTC(2026, 8, 16), 'eur']]
    .forEach(function (e) {
      var payroll = e[1] === 'payroll', paid = e[3] <= NOW - DAY || payroll;
      ex({ vendor: e[0].split(' · ')[0], cat: e[1], desc: e[0].indexOf(' · ') > 0 ? e[0].split(' · ').slice(1).join(' · ') : e[1] === 'software' ? 'Monthly subscription' : 'September', amount: e[2], date: e[3], due: e[3] + (e[1] === 'professional' ? 15 : 0) * DAY,
        status: e[1] === 'professional' && e[3] === SEP30 ? 'scheduled' : paid ? 'paid' : 'scheduled', paid: paid ? e[3] + (payroll ? 0 : 2 * DAY) : null, account: e[4], recurring: true, by: payroll ? 'Gusto and BRAC payroll' : 'Recurring bill' });
    });
  /* October bills due soon */
  [['Prologis · Newark lease', 'facilities', 48000, 'usd'], ['Waalhaven Vastgoed · Rotterdam lease', 'facilities', 41200, 'eur'], ['Tejgaon Estates · Dhaka lease', 'facilities', 9800, 'bdt'], ['Patenga Properties · Chattogram lease', 'facilities', 6200, 'bdt'],
   ['Shopify Plus · Fernhill US', 'software', 2300, 'usd'], ['Shopify Plus · Fernhill EU', 'software', 2300, 'eur'], ['CommerceOS', 'software', 1490, 'usd'], ['Klaviyo', 'software', 1840, 'usd']].forEach(function (e) {
    ex({ vendor: e[0].split(' · ')[0], cat: e[1], desc: (e[0].split(' · ')[1] || 'Monthly subscription') + ', October', amount: e[2], date: OCT1, due: OCT1 + (e[1] === 'facilities' ? 4 : 0) * DAY, status: 'scheduled', paid: null, account: e[3], recurring: true, by: 'Recurring bill' });
  });
  /* claims from the team, waiting for approval */
  [['Mei Lin', 'marketing', 'Lumen Studio', 'Autumn lookbook photo shoot, 2 days', 4850, 1.2, true], ['Jamal Uddin', 'travel', 'Biman Bangladesh', 'Flights Dhaka–Chattogram for the cycle count', 186.4, 0.6, true],
   ['Sofie de Vries', 'travel', 'NS International', 'Train to Antwerp, stockist visit', 142.8, 2.1, true], ['Marcus Reed', 'facilities', 'Home Depot', 'Tarps and buckets for the aisle 7 roof leak', 318.65, 3.4, true],
   ['Priya Natarajan', 'marketing', 'Printful', 'Lookbook proofs', 96.2, 0.4, false], ['Rafiq Hasan', 'professional', 'Fiverr', 'Product photo retouching, 120 images', 640, 4.8, false],
   ['Jonas Weber', 'travel', 'Lufthansa', 'Flight to the Copenhagen trade show', 412.3, 5.6, true], ['Nusrat Jahan', 'packaging', 'Chattogram Stationers', 'Packing tape and labels (BDT 21,400)', 195.1, 1.9, true]]
    .forEach(function (e) { ex({ vendor: e[2], cat: e[1], desc: e[3], amount: e[4], date: NOW - e[5] * DAY, due: null, status: 'approval', paid: null, account: e[1] === 'travel' && e[0] === 'Sofie de Vries' ? 'eur' : e[0] === 'Jamal Uddin' || e[0] === 'Nusrat Jahan' ? 'bdt' : 'usd', recurring: false, by: e[0], receipt: e[6], claim: true }); });
  EXPENSES.sort(function (a, b) { return b.date - a.date; });

  /* ---------- transactions: every movement on the three accounts ---------- */
  var TX = [], tseq = 90120;
  function tx(o) { o.id = 'TX-' + (tseq++); o.amount = r2(o.amount); TX.push(o); }
  PAYOUTS.forEach(function (g) { if (g.status !== 'paid' || g.date < WIN) return; tx({ ts: g.date, account: g.account, amount: g.net, desc: g.processor + ' payout ' + g.id, kind: 'payout', match: g.id, matched: true, cp: g.processor }); });
  PAYMENTS.concat(PRIOR_INVOICES).forEach(function (p) { if (p.processor !== 'Bank transfer' || p.invoiceStatus !== 'paid') return; var at = p.wired; if (at < WIN) return; tx({ ts: at, account: 'usd', amount: p.net, desc: 'Wire from ' + p.customer + ' · ' + p.invoice, kind: 'wire', match: p.invoice, matched: true, cp: p.customer }); });
  EXPENSES.forEach(function (e) { if (e.status !== 'paid' || !e.paid || e.paid < WIN) return; tx({ ts: e.paid, account: e.account, amount: -e.amount, desc: e.vendor + ' · ' + e.desc, kind: 'expense', match: e.id, matched: true, cp: e.vendor, cat: e.cat }); });
  REFUNDS.forEach(function (rf) { if ((rf.processor === 'bKash' || rf.method === 'Cash on delivery') && rf.status === 'completed') tx({ ts: rf.ts, account: 'bdt', amount: -rf.amount, desc: 'Refund to ' + rf.customer + ' · ' + rf.orderId, kind: 'refund', match: rf.id, matched: true, cp: rf.customer }); });
  /* EUR swept to USD every Friday */
  [Date.UTC(2026, 8, 4), Date.UTC(2026, 8, 11), Date.UTC(2026, 8, 18), Date.UTC(2026, 8, 25)].forEach(function (d, i) { var a = [9000, 11000, 8500, 10000][i];
    tx({ ts: d + 14 * H, account: 'eur', amount: -a, desc: 'Transfer to Chase ••4821 (EUR → USD at 1.0' + (82 + i) + ')', kind: 'transfer', match: 'FX-' + (220 + i), matched: true, cp: 'Wise' });
    tx({ ts: d + 15 * H, account: 'usd', amount: a * (1.082 + i * 0.001), desc: 'Transfer from Wise EUR ••1093', kind: 'transfer', match: 'FX-' + (220 + i), matched: true, cp: 'Wise' }); });
  /* the ones nobody has matched yet */
  tx({ ts: NOW - 0.4 * DAY, account: 'usd', amount: 2140.5, desc: 'ACH CREDIT LAKESIDE OUTFTR', kind: 'wire', matched: false, cp: 'Lakeside Outfitters', hint: 'Probably a part payment of a Lakeside invoice. Amount doesn’t match any open invoice.' });
  tx({ ts: NOW - 1.3 * DAY, account: 'usd', amount: -49.0, desc: 'CHASE MONTHLY SERVICE FEE', kind: 'fee', matched: false, cp: 'JPMorgan Chase', hint: 'Bank fee. Record it as an expense under Professional services.' });
  tx({ ts: NOW - 2.2 * DAY, account: 'bdt', amount: 214.5, desc: 'BKASH MERCHANT SETTLEMENT ADJ', kind: 'payout', matched: false, cp: 'bKash', hint: 'bKash adjustment for a disputed charge in September. Match it to the bKash payout.' });
  tx({ ts: NOW - 3.1 * DAY, account: 'eur', amount: -386.2, desc: 'CARD PURCHASE IKEA DELFT', kind: 'expense', matched: false, cp: 'IKEA', hint: 'No receipt yet. Ask the Rotterdam team what it was for.' });
  tx({ ts: NOW - 4.5 * DAY, account: 'usd', amount: -1250, desc: 'CARD PURCHASE LINKEDIN ADS', kind: 'expense', matched: false, cp: 'LinkedIn', hint: 'Recruiting ad for the Newark night shift. Record it under Marketing.' });
  tx({ ts: NOW - 6.0 * DAY, account: 'usd', amount: -312.4, desc: 'STRIPE DISPUTE #DP-88213', kind: 'fee', matched: false, cp: 'Stripe', hint: 'Chargeback on a Fernhill US order. Respond in Payments within 7 days.' });
  TX.sort(function (a, b) { return a.ts - b.ts; });
  var bal = {}; ACCOUNTS.forEach(function (a) { bal[a.key] = a.opening; });
  TX.forEach(function (t) { bal[t.account] = r2(bal[t.account] + t.amount); t.balance = bal[t.account]; });
  ACCOUNTS.forEach(function (a) { a.balance = bal[a.key]; });
  TX.reverse();

  /* ---------- profit and loss, last 30 days ---------- */
  var COSTRATIO = {}; O.PRODUCTS.forEach(function (p) { var it = I.BY_SKU[p[1]]; COSTRATIO[p[1]] = it ? it.p.cost / it.p.price : 0.4; });
  function cogsOf(o) { var k = o.skus.reduce(function (a, s) { return a + COSTRATIO[s]; }, 0) / o.skus.length; return o.total * k / (o.channel === 'Wholesale' ? 0.55 : 1); }
  var inWin = O.ORDERS.filter(function (o) { return o.stage !== 'cancelled' && o.payment !== 'failed'; });
  var PNL = { gross: O.ORDERS.reduce(function (a, o) { return a + o.total; }, 0), cancelled: O.ORDERS.filter(function (o) { return o.stage === 'cancelled' || o.payment === 'failed'; }).reduce(function (a, o) { return a + o.total; }, 0),
    refunds: REFUNDS.filter(function (rf) { return rf.status !== 'awaiting' && rf.status !== 'failed' && rf.reason !== 'Order cancelled'; }).reduce(function (a, rf) { return a + rf.amount; }, 0),
    cogs: inWin.reduce(function (a, o) { return a + cogsOf(o); }, 0), fees: PAYMENTS.reduce(function (a, p) { return a + p.fee; }, 0) };
  function catSpend(cat, from, to) { return EXPENSES.filter(function (e) { return e.cat === cat && e.date >= from && e.date < to; }).reduce(function (a, e) { return a + e.amount; }, 0); }
  PNL.opex = {}; CATS.forEach(function (c) { if (c.key !== 'inventory') PNL.opex[c.key] = catSpend(c.key, SEP1, OCT1); });

  window.FernhillFinance = {
    ACCOUNTS: ACCOUNTS, ACC: ACC, PAYMENTS: PAYMENTS, PRIOR_INVOICES: PRIOR_INVOICES, INVOICES: PAYMENTS.filter(function (p) { return p.processor === 'Bank transfer'; }).concat(PRIOR_INVOICES), PAY_BY_ORDER: PAY_BY_ORDER, REFUNDS: REFUNDS, PAYOUTS: PAYOUTS, EXPENSES: EXPENSES, CATS: CATS, CAT: CAT, TX: TX, PNL: PNL, catSpend: catSpend,
    SEP1: SEP1, OCT1: OCT1, WIN: WIN
  };
})();

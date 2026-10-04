/* Fernhill customers shared by the Customers pages (All Customers, Segments, Customer Groups, Customer
   Activity). Built on catalog.js (load it first). Matches the dashboard: 18,497 customers with at least one
   order, 412 of them new in the last 30 days (5 today), 2,846 orders and $128,450 in the last 30 days split
   by store as on Sales Channels. The customers other pages name keep their numbers: Sarah Johnson’s
   #ORD-10482, the dashboard’s recent orders, and the search results for Lena Okafor, Nora Whitfield,
   Northwind Retail and Harbor & Pine Co. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var F = window.Fernhill, NOW = F.NOW, DAY = F.DAY, DAY0 = F.DAY0, H = 36e5;
  var FOUNDED = Date.UTC(2021, 2, 15), WIN = NOW - 30 * DAY;
  var TOTAL = 18497, NEW30 = 412, NEW_TODAY = 5, ORD30 = 2846;
  var REV30 = { us: 66794, eu: 34682, wh: 16699, amz: 10275 };
  var ANCHOR = Date.UTC(2026, 8, 30, 21, 14);   // #ORD-10482, Sarah Johnson

  var FIRST = ['Sarah', 'Ayesha', 'Daniel', 'Lena', 'Marcus', 'Nusrat', 'Tomás', 'Grace', 'Hiroshi', 'Fatima', 'Oliver', 'Priya', 'Tanvir', 'Chloé', 'Kwame', 'Sofia', 'Imran', 'Emily', 'Lucas', 'Mehjabin',
    'Noah', 'Aiko', 'Rahim', 'Elena', 'James', 'Zara', 'Arjun', 'Hannah', 'Mateo', 'Sadia', 'Olivia', 'Liam', 'Emma', 'Ethan', 'Mia', 'Jonas', 'Freya', 'Lars', 'Anouk', 'Sem', 'Julia', 'Felix', 'Clara',
    'Hugo', 'Léa', 'Louis', 'Ines', 'Matteo', 'Giulia', 'Ava', 'Isaac', 'Nadia', 'Farhan', 'Tasnim', 'Ruby', 'Jack', 'Charlotte', 'Leo', 'Maya', 'Sven', 'Ingrid', 'Ciara', 'Sean', 'Amara', 'Kofi', 'Yuki', 'Ren', 'Wei', 'Ana'];
  var LAST = ['Johnson', 'Rahman', 'Okafor', 'Lindqvist', 'Chowdhury', 'Herrera', 'Mbeki', 'Tanaka', 'Hossain', 'Bennett', 'Shah', 'Dubois', 'Mensah', 'Rossi', 'Karim', 'Walsh', 'Silva', 'Islam', 'Nguyen',
    'Fischer', 'Ahmed', 'Kowalski', 'Patel', 'Haque', 'Moreau', 'Smith', 'Brown', 'Miller', 'Davis', 'Garcia', 'Wilson', 'Taylor', 'Anderson', 'Clarke', 'de Jong', 'Jansen', 'Bakker', 'Visser', 'Müller',
    'Schmidt', 'Weber', 'Martin', 'Bernard', 'Laurent', 'Peeters', 'Nilsson', 'Larsen', 'Murphy', 'Kelly', 'García', 'Romano', 'Ricci', 'Kim', 'Chen', 'Wong', 'Sato', 'Ito', 'Begum', 'Sarkar', 'Das', 'Mitchell', 'Reid', 'Novak'];
  var DOMAINS = ['gmail.com', 'outlook.com', 'proton.me', 'icloud.com', 'yahoo.com', 'hotmail.com'];
  var PLACES = {
    US: { country: 'United States', cities: [['Brooklyn', 'NY'], ['San Francisco', 'CA'], ['Austin', 'TX'], ['Portland', 'OR'], ['Seattle', 'WA'], ['Chicago', 'IL'], ['Denver', 'CO'], ['Boston', 'MA'], ['Los Angeles', 'CA'], ['Minneapolis', 'MN'], ['Atlanta', 'GA'], ['Philadelphia', 'PA']], phone: 'us' },
    CA: { country: 'Canada', cities: [['Toronto', 'ON'], ['Vancouver', 'BC'], ['Montréal', 'QC']], phone: 'us' },
    BD: { country: 'Bangladesh', cities: [['Dhaka'], ['Chattogram'], ['Sylhet'], ['Khulna']], phone: 'bd' },
    AU: { country: 'Australia', cities: [['Sydney', 'NSW'], ['Melbourne', 'VIC'], ['Brisbane', 'QLD']], phone: 'au' },
    NZ: { country: 'New Zealand', cities: [['Auckland'], ['Wellington']], phone: 'au' },
    NL: { country: 'Netherlands', cities: [['Amsterdam'], ['Rotterdam'], ['Utrecht'], ['The Hague']], phone: 'eu' },
    DE: { country: 'Germany', cities: [['Berlin'], ['Hamburg'], ['Munich'], ['Cologne']], phone: 'eu' },
    FR: { country: 'France', cities: [['Paris'], ['Lyon'], ['Nantes']], phone: 'eu' },
    BE: { country: 'Belgium', cities: [['Antwerp'], ['Brussels'], ['Ghent']], phone: 'eu' },
    SE: { country: 'Sweden', cities: [['Stockholm'], ['Gothenburg']], phone: 'eu' },
    DK: { country: 'Denmark', cities: [['Copenhagen'], ['Aarhus']], phone: 'eu' },
    IE: { country: 'Ireland', cities: [['Dublin'], ['Cork']], phone: 'eu' },
    ES: { country: 'Spain', cities: [['Madrid'], ['Barcelona']], phone: 'eu' },
    IT: { country: 'Italy', cities: [['Milan'], ['Turin']], phone: 'eu' }
  };
  /* where each store's customers live */
  var MIX = { us: [['US', 0.72], ['BD', 0.13], ['CA', 0.06], ['AU', 0.07], ['NZ', 0.02]], eu: [['NL', 0.3], ['DE', 0.24], ['FR', 0.12], ['BE', 0.1], ['SE', 0.07], ['DK', 0.06], ['IE', 0.05], ['ES', 0.03], ['IT', 0.03]], amz: [['US', 1]] };
  var SOURCES = ['Instagram', 'Google search', 'Google Shopping', 'Referral', 'Newsletter', 'Direct', 'TikTok', 'Pinterest'];
  var SOURCE_W = [0.22, 0.2, 0.12, 0.1, 0.08, 0.17, 0.06, 0.05];

  /* scramble integer seeds: the shared LCG gives near-identical first draws for neighbouring seeds */
  function srng(n) { var x = (n >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ (x >>> 16), 0x85ebca6b); x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35); return F.rng((x ^ (x >>> 16)) >>> 0); }
  function pickW(r, list) { var x = r(); for (var i = 0; i < list.length; i++) { x -= list[i][1]; if (x <= 0) return list[i][0]; } return list[list.length - 1][0]; }
  function gauss(r) { return Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r()); }
  function pad(n, w) { var s = String(n); while (s.length < w) s = '0' + s; return s; }
  function phoneFor(kind, r) {
    if (kind === 'us') return '+1 (' + (201 + Math.floor(r() * 700)) + ') 555-' + pad(Math.floor(r() * 10000), 4);
    if (kind === 'bd') return '+880 17' + Math.floor(10 + r() * 89) + '-' + Math.floor(100000 + r() * 899999);
    if (kind === 'au') return '+61 4' + pad(Math.floor(r() * 100), 2) + ' ' + pad(Math.floor(r() * 1000), 3) + ' ' + pad(Math.floor(r() * 1000), 3);
    return '+' + (30 + Math.floor(r() * 20)) + ' 6 ' + pad(Math.floor(r() * 10000), 4) + ' ' + pad(Math.floor(r() * 10000), 4);
  }
  var EMAILS = {};
  function emailFor(first, last, r, amz) {
    if (amz) return Math.floor(r() * 1e12).toString(36) + '@marketplace.amazon.com';
    var base = (first + '.' + last).toLowerCase().normalize('NFD').replace(/[^a-z.]/g, ''), dom = DOMAINS[Math.floor(r() * DOMAINS.length)], e = base + '@' + dom, n = 2;
    while (EMAILS[e]) { e = base + n + '@' + dom; n++; }
    EMAILS[e] = 1; return e;
  }

  var CUSTOMERS = [], r = F.rng(18497);
  function make(o) { o.id = 'CUS-' + (100001 + CUSTOMERS.length); CUSTOMERS.push(o); return o; }

  /* ---------- wholesale and organisations ---------- */
  var B2B = [
    ['Northwind Retail', 'Chicago', 'US', 'Diane Porter', 'orders@northwindretail.com', 'ws2', 46, 182400, [[NOW - 6 * DAY - 3 * H, 4860]]],
    ['Harbor & Pine Co.', 'Portland', 'US', 'Evan Brooks', 'orders@harborandpine.com', 'ws2', 12, 41760, [[DAY0 + 9 * H + 12 * 6e4, 3920]]],
    ['Lakeside Outfitters', 'Minneapolis', 'US', 'Kara Lindgren', 'buying@lakesideoutfitters.com', 'ws2', 21, 64310, [[NOW - 13 * DAY, 3380]]],
    ['Dhaka Lifestyle Ltd.', 'Dhaka', 'BD', 'Sharmin Akter', 'orders@dhakalifestyle.com.bd', 'ws2', 33, 52870, [[NOW - 19 * DAY, 2410]]],
    ['Bramble & Co.', 'Bristol', 'GB', 'Tom Ashworth', 'hello@brambleandco.co.uk', 'ws1', 9, 18240, [[NOW - 24 * DAY, 2129]]],
    ['Kollektiv Store', 'Berlin', 'DE', 'Mira Hoffmann', 'einkauf@kollektiv.store', 'ws1', 7, 13980, []], ['Saltmarsh Supply', 'Boston', 'US', 'Owen Fitzgerald', 'po@saltmarshsupply.com', 'ws1', 6, 11420, []],
    ['Maison Lune', 'Paris', 'FR', 'Camille Roux', 'achats@maisonlune.fr', 'ws1', 5, 9850, []], ['Nordvik Concept', 'Copenhagen', 'DK', 'Astrid Holm', 'indkob@nordvik.dk', 'ws1', 8, 15730, []],
    ['High Desert Goods', 'Denver', 'US', 'Rosa Medina', 'orders@highdesertgoods.com', 'ws1', 4, 6920, []], ['The Fold', 'Amsterdam', 'NL', 'Daan Visser', 'inkoop@thefold.nl', 'ws1', 6, 10310, []],
    ['Cedar & Stone', 'Seattle', 'US', 'Ben Okoro', 'buyers@cedarandstone.com', 'ws1', 3, 5480, []], ['Banani Threads', 'Dhaka', 'BD', 'Farzana Rahman', 'orders@bananithreads.com', 'ws1', 11, 14260, []],
    ['Coastal Common', 'Sydney', 'AU', 'Mia Thornton', 'orders@coastalcommon.com.au', 'ws1', 4, 7940, []]
  ];
  PLACES.GB = { country: 'United Kingdom', cities: [['Bristol']], phone: 'eu' };
  B2B.forEach(function (b, i) {
    var rb = srng(900 + i), first = b[8].length ? b[8][0][0] : NOW - (40 + rb() * 200) * DAY, created = NOW - (300 + rb() * 900) * DAY;
    make({ name: b[0], company: b[0], contact: b[3], email: b[4], phone: phoneFor(PLACES[b[2]].phone, rb), city: b[1], cc: b[2], country: PLACES[b[2]].country, channel: 'wh', b2b: true,
      created: created, firstTs: created + 5 * DAY, lastTs: b[8].length ? b[8][0][0] : NOW - (32 + rb() * 70) * DAY, orders: b[6], spent: b[7], ord30: b[8].length, rev30: b[8].reduce(function (a, x) { return a + x[1]; }, 0),
      recent: b[8].map(function (x) { return { ts: x[0], total: x[1] }; }), returns: Math.floor(b[6] / 15), consent: { email: true, sms: false }, group: b[5], tags: ['Wholesale'], source: 'Wholesale rep', terms: b[5] === 'ws2' ? 'Net 45' : 'Net 30' });
  });
  [['Pacific Crest Museum Store', 'San Francisco', 'US', 'Lauren Kim', 'store@pacificcrestmuseum.org', 4, 2380], ['Ridgeline Outdoor Club', 'Boulder', 'US', 'Sam Patel', 'gear@ridgelineclub.org', 3, 1460], ['Green Shore Trust', 'Rotterdam', 'NL', 'Eva Jansen', 'shop@greenshore.nl', 2, 940]]
    .forEach(function (b, i) {
      var rb = srng(950 + i), created = NOW - (200 + rb() * 500) * DAY, cities = PLACES[b[2]];
      make({ name: b[0], company: b[0], contact: b[3], email: b[4], phone: phoneFor(cities.phone, rb), city: b[1], cc: b[2], country: cities.country, channel: b[2] === 'NL' ? 'eu' : 'us', b2b: false, org: true,
        created: created, firstTs: created, lastTs: NOW - (35 + rb() * 120) * DAY, orders: b[5], spent: b[6], ord30: 0, rev30: 0, returns: 0, consent: { email: true, sms: false }, group: 'taxex', tags: ['Non-profit'], source: 'Direct' });
    });

  /* ---------- named customers from other pages ---------- */
  var NAMED = [
    { name: 'Sarah Johnson', email: 'sarah.johnson@gmail.com', phone: '+1 (415) 555-0142', city: 'San Francisco', st: 'CA', cc: 'US', channel: 'us', orders: 5, spent: 612.4, first: Date.UTC(2023, 10, 3), recent: [[ANCHOR, 248.5, 'shipped', 3]], source: 'Instagram', email1: true },
    { name: 'Lena Okafor', email: 'lena.okafor@mail.com', phone: '+1 (646) 555-0187', city: 'Brooklyn', st: 'NY', cc: 'US', channel: 'us', orders: 7, spent: 1204, first: Date.UTC(2024, 2, 18), recent: [[DAY0 + 9 * H + 38 * 6e4, 214.5, 'confirmed', 3], [NOW - 17 * DAY, 118, 'delivered', 2]], source: 'Referral', email1: true },
    { name: 'Nora Whitfield', email: 'nora.w@mail.com', phone: '+1 (503) 555-0119', city: 'Portland', st: 'OR', cc: 'US', channel: 'us', orders: 3, spent: 388, first: Date.UTC(2025, 4, 2), last: NOW - 52 * DAY, recent: [], source: 'Google search', email1: true },
    { name: 'Marcus Lindqvist', email: 'marcus.lindqvist@proton.me', phone: '+46 70 412 8830', city: 'Stockholm', cc: 'SE', channel: 'eu', orders: 2, spent: 133, first: Date.UTC(2026, 3, 9), recent: [[DAY0 + 8 * H + 47 * 6e4, 39, 'shipped', 1]], source: 'Instagram', email1: false },
    { name: 'Aiko Tanaka', email: 'aiko.tanaka@icloud.com', phone: '+1 (206) 555-0164', city: 'Seattle', st: 'WA', cc: 'US', channel: 'us', orders: 4, spent: 471.9, first: Date.UTC(2025, 0, 22), recent: [[DAY0 + 8 * H + 5 * 6e4, 128.9, 'processing', 2]], source: 'Pinterest', email1: true },
    { name: 'Daniel Ruiz', email: 'k7d2q9v1r4@marketplace.amazon.com', phone: '', city: 'Austin', st: 'TX', cc: 'US', channel: 'amz', orders: 1, spent: 0, first: DAY0 - 1 * H - 19 * 6e4, recent: [[DAY0 - 1 * H - 19 * 6e4, 64, 'cancelled', 1]], source: 'Amazon', email1: false },
    { name: 'Grace Mbeki', email: 'grace.mbeki@outlook.com', phone: '+31 6 2841 9910', city: 'Utrecht', cc: 'NL', channel: 'eu', orders: 6, spent: 702.4, first: Date.UTC(2024, 8, 14), recent: [[DAY0 - 2 * H - 44 * 6e4, 187.2, 'ready_to_ship', 4]], source: 'Newsletter', email1: true },
    { name: 'Tomás Herrera', email: 'tomas.herrera@gmail.com', phone: '+1 (312) 555-0138', city: 'Chicago', st: 'IL', cc: 'US', channel: 'us', orders: 2, spent: 96, first: Date.UTC(2026, 6, 2), recent: [[DAY0 - 4 * H - 58 * 6e4, 96, 'payment_failed', 2]], source: 'Google Shopping', email1: true },
    { name: 'Priya Shah', email: 'priya.shah@yahoo.com', phone: '+1 (617) 555-0171', city: 'Boston', st: 'MA', cc: 'US', channel: 'us', orders: 9, spent: 1418.75, first: Date.UTC(2023, 5, 11), recent: [[DAY0 - DAY - 8 * H - 40 * 6e4, 342.75, 'delivered', 6]], source: 'Instagram', email1: true }
  ];
  NAMED.forEach(function (n) {
    var parts = n.name.split(' ');
    make({ name: n.name, first: parts[0], email: n.email, phone: n.phone, city: n.city, st: n.st, cc: n.cc, country: PLACES[n.cc].country, channel: n.channel, created: n.first, firstTs: n.first,
      lastTs: n.recent.length ? n.recent[0][0] : n.last, orders: n.orders, spent: n.spent || n.recent.reduce(function (a, x) { return a + x[1]; }, 0), ord30: n.recent.length,
      rev30: n.recent.reduce(function (a, x) { return a + x[1]; }, 0), recent: n.recent.map(function (x) { return { ts: x[0], total: x[1], status: x[2], items: x[3] }; }),
      returns: n.name === 'Priya Shah' ? 2 : 0, consent: { email: n.email1, sms: n.name === 'Lena Okafor' }, group: n.spent >= 1000 ? 'vip' : 'retail', tags: [], source: n.source, pinned: true });
  });
  CUSTOMERS.forEach(function (c) { EMAILS[c.email] = 1; });

  /* ---------- staff and press (retail customers with their own group) ---------- */
  var STAFF = ['Priya Natarajan', 'Jamal Uddin', 'Sofie de Vries', 'Marcus Reed', 'Nusrat Jahan', 'Rafiq Hasan', 'Mei Lin', 'Jonas Weber', 'Callie Ortiz', 'Tahmid Alam', 'Femke Bos', 'Andre Lewis', 'Ruth Haile', 'Nina Varga'];
  var PRESS = ['Juno Park', 'Felix Adeyemi', 'Saskia Mol', 'Ola Nordin', 'Bea Castillo', 'Rishi Varma', 'Hana Ito', 'Max Keller', 'Iris Vogel', 'Theo Grant', 'Lina Haddad', 'Cosima Brandt', 'Dev Arora', 'Ellie Shaw', 'Paulo Reis', 'Mona Saleh', 'Kit Hartley', 'Zoe Lam', 'Ines Barros', 'Arlo Quinn', 'Sana Mirza', 'Jasper Vos'];

  /* ---------- everyone else ---------- */
  var fixedNew = 0;
  var restN = TOTAL - CUSTOMERS.length - STAFF.length - PRESS.length;
  function addRetail(i, opts) {
    var rr = srng(5000 + i * 7);
    var channel = opts.channel || (rr() < 0.115 ? 'amz' : rr() < 0.62 ? 'us' : 'eu');
    var cc = pickW(rr, MIX[channel]), place = PLACES[cc], city = place.cities[Math.floor(rr() * place.cities.length)];
    var first = opts.first || FIRST[Math.floor(rr() * FIRST.length)], last = opts.last || LAST[Math.floor(rr() * LAST.length)];
    var isNew = !!opts.isNew;
    var firstTs = isNew ? (opts.today ? DAY0 + rr() * (NOW - DAY0) : WIN + rr() * (DAY0 - WIN)) : FOUNDED + (WIN - FOUNDED) * Math.sqrt(rr());
    var orders = isNew ? 1 : rr() < 0.56 ? 1 : 2 + Math.floor(Math.pow(rr(), 2.6) * 14) + (rr() < 0.01 ? 12 + Math.floor(rr() * 20) : 0);
    var base = channel === 'amz' ? 52 : cc === 'BD' ? 38 : channel === 'eu' ? 78 : 72;
    var aov = Math.max(18, base * Math.exp(0.38 * gauss(rr)));
    var lastTs = orders === 1 ? firstTs : firstTs + (WIN - firstTs) * (1 - Math.pow(rr(), 1.7) * 0.95);
    var src = channel === 'amz' ? 'Amazon' : SOURCES[(function () { var x = rr(); for (var k = 0; k < SOURCE_W.length; k++) { x -= SOURCE_W[k]; if (x <= 0) return k; } return 0; })()];
    var guest = channel !== 'amz' && rr() < 0.18;
    return make({ name: first + ' ' + last, first: first, email: emailFor(first, last, rr, channel === 'amz'), phone: channel === 'amz' ? '' : phoneFor(place.phone, rr), city: city[0], st: city[1], cc: cc, country: place.country,
      channel: channel, created: firstTs - (guest ? 0 : rr() * 20 * DAY), guest: guest, firstTs: firstTs, lastTs: lastTs, orders: orders, aov: aov, spent: orders * aov, ord30: isNew ? 1 : 0, rev30: 0,
      returns: 0, consent: { email: channel !== 'amz' && rr() < 0.47, sms: channel !== 'amz' && rr() < 0.11 }, group: opts.group || 'retail', tags: opts.tags || [], source: opts.source || src, isNew: isNew });
  }
  STAFF.forEach(function (n, i) { var p = n.split(' '); var c = addRetail(i + 30000, { first: p[0], last: p.slice(1).join(' '), channel: i % 3 === 2 ? 'eu' : 'us', group: 'staff', tags: ['Staff'], source: 'Direct' }); c.email = (p[0] + '.' + p.slice(1).join('')).toLowerCase().normalize('NFD').replace(/[^a-z.]/g, '') + '@fernhill.co'; c.consent.email = true; });
  PRESS.forEach(function (n, i) { var p = n.split(' '); addRetail(i + 31000, { first: p[0], last: p[1], group: 'press', tags: ['Press'], source: 'Instagram' }); });
  for (var i = 0; i < restN; i++) {
    var newOne = i < NEW30 - 1;   // Marcus Lindqvist-style named customers aren't new; Tomás Herrera ordered first in July
    addRetail(i, { isNew: newOne, today: newOne && fixedNew++ < NEW_TODAY });
  }
  /* Daniel Ruiz’s Amazon order on Sep 30 was his first: he is the 412th new customer */
  CUSTOMERS.filter(function (c) { return c.name === 'Daniel Ruiz'; })[0].isNew = true;

  /* ---------- the last 30 days: 2,846 orders ---------- */
  var placed = CUSTOMERS.reduce(function (a, c) { return a + c.ord30; }, 0);
  var rp = F.rng(2846), pool = CUSTOMERS.filter(function (c) { return !c.b2b && !c.pinned && !c.isNew && !c.org && c.orders >= 2; });
  var wsum = 0, cum = pool.map(function (c) { wsum += c.orders / Math.max(0.4, (WIN - c.firstTs) / (365 * DAY)); return wsum; });
  /* 34 new customers ordered twice */
  CUSTOMERS.filter(function (c) { return c.isNew && !c.pinned; }).slice(0, 34).forEach(function (c) { c.ord30 = 2; c.orders = 2; c.spent = 2 * c.aov; placed++; });
  while (placed < ORD30) {
    var x = rp() * wsum, lo = 0, hi = cum.length - 1;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (cum[mid] < x) lo = mid + 1; else hi = mid; }
    var c = pool[lo];
    if (c.ord30 >= c.orders - 1) continue;
    c.ord30++; placed++;
  }
  /* dates and revenue for the 30-day orders, scaled per store to the Sales Channels revenue */
  var raw = { us: 0, eu: 0, amz: 0, wh: 0 }, fixed = { us: 0, eu: 0, amz: 0, wh: 0 };
  CUSTOMERS.forEach(function (c) {
    if (!c.ord30) return;
    if (c.recent) { fixed[c.channel] += c.rev30; return; }
    var rc = srng(c.id.charCodeAt(9) * 7919 + Number(c.id.slice(4))), ts = [];
    for (var k = 0; k < c.ord30; k++) ts.push(c.isNew && k === 0 ? c.firstTs : WIN + rc() * (NOW - WIN));
    if (c.isNew) ts = ts.map(function (t) { return Math.max(t, c.firstTs); });
    ts.sort(function (a, b) { return b - a; });
    c.recent = ts.map(function (t) { var v = c.aov * Math.exp(0.3 * gauss(rc)); raw[c.channel] += v; return { ts: t, total: v }; });
    c.lastTs = ts[0];
  });
  ['us', 'eu', 'amz'].forEach(function (ch) {
    var k = (REV30[ch] - fixed[ch]) / raw[ch];
    CUSTOMERS.forEach(function (c) {
      if (c.channel !== ch || c.pinned || !c.recent || c.b2b) return;
      c.recent.forEach(function (o) { o.total = Math.round(o.total * k * 100) / 100; });
      c.rev30 = c.recent.reduce(function (a, o) { return a + o.total; }, 0);
      c.spent = (c.orders - c.ord30) * c.aov + c.rev30;
    });
  });
  CUSTOMERS.forEach(function (c) {
    c.spent = Math.round(c.spent * 100) / 100;
    if (!c.b2b) c.returns = c.returns || Math.floor(c.orders * (c.channel === 'amz' ? 0.05 : 0.09) * (0.4 + srng(Number(c.id.slice(4)))() * 1.6) + (c.orders > 6 && Number(c.id.slice(4)) % 23 === 0 ? 3 : 0));
    c.aov = c.orders ? c.spent / c.orders : 0;
    if (c.group === 'retail' && c.spent >= 1000) c.group = 'vip';
    if (c.group === 'vip' && c.tags.indexOf('VIP') < 0) c.tags = c.tags.concat(['VIP']);
    if (c.returns >= 3 && c.returns / c.orders >= 0.3) c.tags = c.tags.concat(['Frequent returner']);
    if (c.guest) c.tags = c.tags.concat(['Guest checkout']);
    c.nameLower = c.name.toLowerCase(); c.emailLower = c.email.toLowerCase();
  });
  var BY_ID = {}; CUSTOMERS.forEach(function (c) { BY_ID[c.id] = c; });
  /* number the last 30 days’ orders in time order, as the Orders page does: Sarah Johnson’s is #ORD-10482 */
  (function numberRecent() {
    var all = []; CUSTOMERS.forEach(function (c) { (c.recent || []).forEach(function (o) { all.push(o); }); });
    all.sort(function (a, b) { return a.ts - b.ts; });
    var k = all.findIndex(function (o) { return o.ts === ANCHOR; });
    all.forEach(function (o, i) { o.id = '#ORD-' + (10482 + i - k); });
  })();

  /* ---------- order history for one customer (deterministic, adds up to orders and spent) ---------- */
  var PRODUCTS = F.PRODUCTS.filter(function (p) { return p.status === 'active'; });
  function orderId(ts) { return '#ORD-' + (ts >= WIN ? 10482 + Math.round((ts - ANCHOR) / (30 * DAY) * ORD30) : 1001 + Math.round((10482 - ORD30 - 1001) * Math.pow(Math.max(0, ts - FOUNDED) / (WIN - FOUNDED), 1.6))); }
  function ordersOf(c) {
    var ro = srng(Number(c.id.slice(4)) * 31 + 7), out = [], old = c.orders - c.ord30, oldSpent = c.spent - c.rev30;
    (c.recent || []).forEach(function (o) { out.push({ id: o.id, ts: o.ts, total: o.total, status: o.status || (NOW - o.ts < 2 * DAY ? 'processing' : NOW - o.ts < 9 * DAY ? 'shipped' : 'delivered'), items: o.items || (c.b2b ? 40 + Math.floor(ro() * 80) : 1 + Math.floor(Math.pow(ro(), 2) * 4)) }); });
    var end = c.ord30 ? Math.min(WIN, c.lastTs) : c.lastTs, tsList = [];
    for (var k = 0; k < old; k++) tsList.push(k === 0 ? c.firstTs : k === old - 1 && !c.ord30 ? c.lastTs : c.firstTs + ro() * (end - c.firstTs));
    tsList.sort(function (a, b) { return b - a; });
    var w = tsList.map(function () { return 0.6 + ro() * 0.8; }), ws = w.reduce(function (a, b) { return a + b; }, 0);
    tsList.forEach(function (t, k) { var ret = ro() < c.returns / Math.max(1, c.orders); out.push({ ts: t, total: Math.round(oldSpent * w[k] / ws * 100) / 100, status: ret ? 'returned' : 'delivered', items: c.b2b ? 40 + Math.floor(ro() * 120) : 1 + Math.floor(Math.pow(ro(), 2) * 4) }); });
    out.sort(function (a, b) { return b.ts - a.ts; });
    out.forEach(function (o) {
      o.id = o.id || orderId(o.ts);
      var n = c.b2b ? 4 : Math.min(o.items, 3), picks = [];
      for (var j = 0; j < n; j++) picks.push(PRODUCTS[Math.floor(ro() * PRODUCTS.length)].name);
      o.products = picks.filter(function (p, j) { return picks.indexOf(p) === j; });
    });
    return out;
  }

  /* ---------- groups: pricing, terms and perks (membership is set by hand or by a rule) ---------- */
  var GROUPS = [
    { key: 'retail', name: 'Retail', desc: 'Everyone who isn’t in another group. Standard prices and checkout.', discount: 0, terms: 'Pay at checkout', shipping: 'Free over $120', tax: true, priceList: 'Retail', auto: null, system: true, tone: 'neutral' },
    { key: 'vip', name: 'VIP Club', desc: 'Customers who’ve spent $1,000 or more. Early access to drops and free express shipping.', discount: 10, terms: 'Pay at checkout', shipping: 'Free express', tax: true, priceList: 'Retail', auto: { field: 'spent', op: 'gte', value: '1000' }, tone: 'brand', perks: ['Early access to new drops (48 h)', 'Free express shipping', 'Birthday gift card, $20'] },
    { key: 'staff', name: 'Staff', desc: 'Fernhill employees. Limited to 6 orders a year, shipped to a home address.', discount: 30, terms: 'Pay at checkout', shipping: 'Free standard', tax: true, priceList: 'Retail', auto: { field: 'email', op: 'ends', value: '@fernhill.co' }, tone: 'info', limit: '6 orders a year', perks: ['30% off everything', 'Free standard shipping'] },
    { key: 'press', name: 'Press & creators', desc: 'Editors, stylists and creators we seed product to. Orders are free and need approval.', discount: 100, terms: 'Approval required', shipping: 'Free express', tax: true, priceList: 'Retail', auto: null, tone: 'warning', perks: ['Free product on approval', 'Not counted in sales reports'] },
    { key: 'ws1', name: 'Wholesale', desc: 'Independent stockists ordering through the B2B portal. Minimum order $1,500.', discount: 45, terms: 'Net 30', shipping: 'Freight, billed', tax: false, priceList: 'Wholesale 2026', auto: null, tone: 'success', minOrder: 1500, perks: ['Wholesale price list', 'Net 30 invoicing', 'Line sheets two weeks early'] },
    { key: 'ws2', name: 'Wholesale key accounts', desc: 'Our four biggest stockists. Deeper pricing, longer terms and a named account manager.', discount: 50, terms: 'Net 45', shipping: 'Free freight over $3,000', tax: false, priceList: 'Wholesale 2026', auto: null, tone: 'success', minOrder: 2500, manager: 'Jamal Uddin', perks: ['Key-account price list', 'Net 45 invoicing', 'Exclusive colorways'] },
    { key: 'taxex', name: 'Tax-exempt organisations', desc: 'Museums, clubs and non-profits with an exemption certificate on file.', discount: 15, terms: 'Net 30', shipping: 'Free standard', tax: false, priceList: 'Retail', auto: null, tone: 'neutral', perks: ['No sales tax with a valid certificate', '15% off'] }
  ];
  var GROUP = {}; GROUPS.forEach(function (g) { GROUP[g.key] = g; });

  /* ---------- segments: saved rules, counted live ---------- */
  var SEG_FIELDS = [
    { value: 'orders', label: 'Number of orders', kind: 'number' }, { value: 'spent', label: 'Total spent', kind: 'number', prefix: '$' }, { value: 'aov', label: 'Average order value', kind: 'number', prefix: '$' },
    { value: 'lastOrder', label: 'Last order', kind: 'days' }, { value: 'firstOrder', label: 'First order', kind: 'days' }, { value: 'returns', label: 'Returns', kind: 'number' },
    { value: 'channel', label: 'Store', kind: 'text' }, { value: 'country', label: 'Country', kind: 'text' }, { value: 'source', label: 'Found us through', kind: 'text' },
    { value: 'group', label: 'Customer group', kind: 'text' }, { value: 'consent', label: 'Email marketing', kind: 'bool' }
  ];
  function ruleMatch(c, rule) {
    var n = Number(rule.value);
    switch (rule.field) {
      case 'orders': case 'spent': case 'aov': case 'returns':
        var x = c[rule.field]; return rule.op === 'lt' ? x < n : rule.op === 'gt' ? x > n : rule.op === 'gte' ? x >= n : rule.op === 'lte' ? x <= n : Math.round(x) === n;
      case 'lastOrder': case 'firstOrder':
        var t = rule.field === 'lastOrder' ? c.lastTs : c.firstTs; return rule.op === 'within' ? NOW - t <= n * DAY : NOW - t > n * DAY;
      case 'consent': return rule.op === 'yes' ? c.consent.email : !c.consent.email;
      default: var v = rule.field === 'channel' ? c.channel : rule.field === 'country' ? c.country : rule.field === 'group' ? c.group : c.source;
        return rule.op === 'neq' ? v !== rule.value : v === rule.value;
    }
  }
  function segmentMembers(seg, list) {
    list = list || CUSTOMERS;
    if (!seg.rules.length) return [];
    return list.filter(function (c) { return seg.match === 'any' ? seg.rules.some(function (r) { return ruleMatch(c, r); }) : seg.rules.every(function (r) { return ruleMatch(c, r); }); });
  }
  var SEGMENTS = [
    { key: 'vip', name: 'VIP customers', desc: 'Spent $1,000 or more across all stores, wholesale accounts included.', match: 'all', rules: [{ field: 'spent', op: 'gte', value: '1000' }], by: 'Priya Natarajan', updated: NOW - 41 * DAY, usedIn: ['Autumn VIP preview (email)', 'VIP Club group'], tone: 'brand', pinned: true },
    { key: 'repeat', name: 'Repeat buyers', desc: 'Two or more orders, any store.', match: 'all', rules: [{ field: 'orders', op: 'gte', value: '2' }], by: 'Priya Natarajan', updated: NOW - 120 * DAY, usedIn: ['Loyalty welcome flow'], tone: 'success', pinned: true },
    { key: 'new30', name: 'New in the last 30 days', desc: 'First order in the last 30 days. Gets the second-order nudge.', match: 'all', rules: [{ field: 'firstOrder', op: 'within', value: '30' }], by: 'Mei Lin', updated: NOW - 64 * DAY, usedIn: ['Second-order nudge (email)'], tone: 'info', pinned: true },
    { key: 'risk', name: 'At risk', desc: 'Bought at least twice but nothing in the last 90 days.', match: 'all', rules: [{ field: 'orders', op: 'gte', value: '2' }, { field: 'lastOrder', op: 'before', value: '90' }, { field: 'lastOrder', op: 'within', value: '365' }], by: 'Mei Lin', updated: NOW - 9 * DAY, usedIn: ['We miss you, 15% off (email)'], tone: 'warning', pinned: true },
    { key: 'lapsed', name: 'Lapsed', desc: 'No order in over a year.', match: 'all', rules: [{ field: 'lastOrder', op: 'before', value: '365' }], by: 'Mei Lin', updated: NOW - 9 * DAY, usedIn: [], tone: 'neutral' },
    { key: 'onetime', name: 'One-time buyers', desc: 'Exactly one order, placed more than 30 days ago.', match: 'all', rules: [{ field: 'orders', op: 'eq', value: '1' }, { field: 'firstOrder', op: 'before', value: '30' }], by: 'Mei Lin', updated: NOW - 64 * DAY, usedIn: ['Second-order nudge (email)'], tone: 'neutral' },
    { key: 'subs-quiet', name: 'Subscribed, quiet for 6 months', desc: 'Opted in to email but no order in 180 days. Good for win-back tests.', match: 'all', rules: [{ field: 'consent', op: 'yes', value: '' }, { field: 'lastOrder', op: 'before', value: '180' }], by: 'Mei Lin', updated: NOW - 3 * DAY, usedIn: [], tone: 'warning' },
    { key: 'eu', name: 'Fernhill EU customers', desc: 'Ordered from fernhill.eu. Used for EU-only launches and VAT-inclusive pricing.', match: 'all', rules: [{ field: 'channel', op: 'eq', value: 'eu' }], by: 'Sofie de Vries', updated: NOW - 200 * DAY, usedIn: ['EU end-of-season sale'], tone: 'info' },
    { key: 'bd', name: 'Bangladesh', desc: 'Customers in Bangladesh, shipped from Dhaka. bKash and cash on delivery.', match: 'all', rules: [{ field: 'country', op: 'eq', value: 'Bangladesh' }], by: 'Jamal Uddin', updated: NOW - 88 * DAY, usedIn: ['Puja collection (SMS)'], tone: 'info' },
    { key: 'returners', name: 'Frequent returners', desc: 'Three or more returns. Excluded from free-returns promos.', match: 'all', rules: [{ field: 'returns', op: 'gte', value: '3' }], by: 'Priya Natarajan', updated: NOW - 30 * DAY, usedIn: ['Free returns exclusion'], tone: 'danger' },
    { key: 'big-baskets', name: 'Big baskets', desc: 'Average order of $150 or more.', match: 'all', rules: [{ field: 'aov', op: 'gte', value: '150' }, { field: 'group', op: 'neq', value: 'ws1' }, { field: 'group', op: 'neq', value: 'ws2' }], by: 'Mei Lin', updated: NOW - 14 * DAY, usedIn: [], tone: 'brand' },
    { key: 'insta', name: 'Found us on Instagram', desc: 'First-touch source was Instagram.', match: 'all', rules: [{ field: 'source', op: 'eq', value: 'Instagram' }], by: 'Mei Lin', updated: NOW - 51 * DAY, usedIn: ['Creator drop retargeting'], tone: 'neutral' }
  ];

  /* ---------- activity: the last 7 days ---------- */
  var ACT_TYPES = {
    order: { label: 'Placed an order', icon: 'shopping-bag', tone: 't-brand' }, signup: { label: 'Created an account', icon: 'user', tone: 't-success' },
    cart: { label: 'Abandoned a cart', icon: 'clock', tone: 't-warning' }, review: { label: 'Wrote a review', icon: 'edit', tone: 't-info' },
    return: { label: 'Requested a return', icon: 'rotate-ccw', tone: 't-warning' }, support: { label: 'Contacted support', icon: 'help-circle', tone: 't-danger' },
    email: { label: 'Clicked an email', icon: 'megaphone', tone: 't-info' }, unsub: { label: 'Unsubscribed', icon: 'x', tone: 't-neutral' }, profile: { label: 'Updated their profile', icon: 'settings', tone: 't-neutral' }
  };
  var ACTIVITY = [];
  (function buildActivity() {
    var ra = F.rng(7070), since = NOW - 7 * DAY, active = CUSTOMERS.filter(function (c) { return !c.b2b && !c.org; });
    function anyone() { return active[Math.floor(ra() * active.length)]; }
    function at() { var d = Math.floor(ra() * 7), t = DAY0 - d * DAY + (0.25 + ra() * 0.72) * DAY; return t > NOW ? null : t; }
    CUSTOMERS.forEach(function (c) {
      (c.recent || []).forEach(function (o) {
        if (o.ts < since) return;
        ACTIVITY.push({ type: 'order', ts: o.ts, cid: c.id, value: o.total, detail: o.id + (o.status === 'payment_failed' ? ' · payment failed' : o.status === 'cancelled' ? ' · cancelled' : '') });
      });
      if (c.isNew && c.firstTs >= since && !c.guest && c.channel !== 'amz') ACTIVITY.push({ type: 'signup', ts: c.firstTs - (2 + ra() * 30) * 6e4, cid: c.id, detail: 'via ' + c.source });
    });
    var CAMPAIGNS = ['Autumn layers lookbook', 'Merino is back in stock', 'Second-order nudge', 'We miss you, 15% off'];
    var CARTS = ['Linen overshirt, Merino crew tee', 'North Sea rain shell', 'Organic hoodie ×2', 'Waxed field jacket', 'Canvas tote, Wool beanie', 'Relaxed chino, Oxford shirt'];
    var TOPICS = [['Where is my order?', 'open'], ['Exchange for a different size', 'open'], ['Discount code not working', 'solved'], ['Damaged item on arrival', 'open'], ['Change delivery address', 'solved'], ['Wholesale enquiry', 'solved'], ['Sizing advice for merino tee', 'solved']];
    var RETURNS = ['Too small', 'Too big', 'Changed my mind', 'Not as pictured', 'Arrived damaged'];
    for (var k = 0; k < 1060; k++) {
      var x = ra(), c = anyone(), t = at(), type;
      if (t == null) continue;
      if (x < 0.46) type = 'email'; else if (x < 0.66) type = 'cart'; else if (x < 0.74) type = 'profile'; else if (x < 0.82) type = 'support'; else if (x < 0.9) type = 'review'; else if (x < 0.96) type = 'return'; else type = 'unsub';
      if ((type === 'email' || type === 'unsub' || type === 'cart' || type === 'profile' || type === 'support') && c.channel === 'amz') continue;   // Amazon keeps these
      if ((type === 'review' || type === 'return') && c.lastTs > t) continue;
      var ev = { type: type, ts: t, cid: c.id };
      if (type === 'email') ev.detail = CAMPAIGNS[Math.floor(ra() * (t > NOW - 2 * DAY ? 2 : 4))];
      if (type === 'cart') { ev.detail = CARTS[Math.floor(ra() * CARTS.length)]; ev.value = Math.round((40 + ra() * 180) * 100) / 100; ev.recovered = ra() < 0.12; }
      if (type === 'profile') ev.detail = ['Changed shipping address', 'Added a phone number', 'Updated size preferences', 'Changed password'][Math.floor(ra() * 4)];
      if (type === 'support') { var tp = TOPICS[Math.floor(ra() * TOPICS.length)]; ev.detail = tp[0]; ev.open = tp[1] === 'open' && t > NOW - 2 * DAY; }
      if (type === 'review') { ev.rating = ra() < 0.7 ? 5 : ra() < 0.6 ? 4 : 2 + Math.floor(ra() * 2); ev.detail = PRODUCTS[Math.floor(ra() * PRODUCTS.length)].name; }
      if (type === 'return') ev.detail = RETURNS[Math.floor(ra() * RETURNS.length)];
      if (type === 'unsub') ev.detail = ['Too many emails', 'No longer interested', 'No reason given'][Math.floor(ra() * 3)];
      ACTIVITY.push(ev);
    }
    ACTIVITY.sort(function (a, b) { return b.ts - a.ts; });
    ACTIVITY.forEach(function (e, i) { e.id = 'EV-' + (ACTIVITY.length - i); });
  })();

  var CHANNEL_LABEL = { us: 'Fernhill US', eu: 'Fernhill EU', wh: 'Wholesale', amz: 'Amazon US' };
  window.FernhillCustomers = {
    CUSTOMERS: CUSTOMERS, BY_ID: BY_ID, ordersOf: ordersOf, orderId: orderId, GROUPS: GROUPS, GROUP: GROUP, SEGMENTS: SEGMENTS, SEG_FIELDS: SEG_FIELDS, ruleMatch: ruleMatch, segmentMembers: segmentMembers,
    ACTIVITY: ACTIVITY, ACT_TYPES: ACT_TYPES, CHANNEL_LABEL: CHANNEL_LABEL, PLACES: PLACES, SOURCES: SOURCES.concat(['Amazon', 'Wholesale rep']), WIN: WIN, NEW30: NEW30, ORD30: ORD30
  };
})();

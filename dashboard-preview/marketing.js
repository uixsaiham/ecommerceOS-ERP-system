/* Fernhill marketing shared by the Marketing pages (Campaigns, Discounts, Coupons, Promotions). Built on
   catalog.js, orders.js and customers.js (load them first). Codes and automatic discounts are attached to
   real orders on the Orders page, so redemptions show the same order ids, customers and totals. Audiences
   are live counts of the segments on the Segments page; ad spend matches September’s Meta, Google and
   TikTok bills in Finance; the weekend flash sale is the Sep 19–20 spike on the dashboard; creator codes
   belong to the Press & creators group; COMEBACK codes come from Abandoned Carts. Snapshot: Oct 1 2026 09:42 UTC. */
(function () {
  "use strict";
  var F = window.Fernhill, O = window.FernhillOrders, C = window.FernhillCustomers, NOW = F.NOW, DAY = F.DAY, DAY0 = F.DAY0, H = 36e5;
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function u(s) { return (hash(s) % 100000) / 100000; }
  function r2(n) { return Math.round(n * 100) / 100; }
  function D(m, d, h) { return Date.UTC(2026, m - 1, d, h || 0); }
  var SEG = {}; C.SEGMENTS.forEach(function (s) { SEG[s.key] = s; });
  function segSize(key) { return SEG[key] ? C.segmentMembers(SEG[key]).length : 0; }
  var SUBSCRIBED = C.CUSTOMERS.filter(function (c) { return c.consent.email && c.channel !== 'amz'; }).length;
  var SMS = C.CUSTOMERS.filter(function (c) { return c.consent.sms; }).length;

  /* ---------- promotions: sales events that bundle discounts, codes and campaigns ---------- */
  var PROMOS = [
    { key: 'flash', name: 'Weekend flash sale', desc: '25% off linen and summer styles for 48 hours to clear end-of-season stock.', start: D(9, 19), end: D(9, 21), stores: ['us', 'eu'], goal: 18000, budget: 6500, owner: 'Mei Lin', tone: 'brand' },
    { key: 'eu-eos', name: 'EU end-of-season sale', desc: '30% off summer shorts on fernhill.eu before the autumn range lands.', start: D(9, 1), end: D(9, 16), stores: ['eu'], goal: 12000, budget: 3500, owner: 'Sofie de Vries', tone: 'info' },
    { key: 'creator', name: 'Juno Park × Fernhill capsule', desc: 'Creator drop: four pieces styled by Juno Park, with codes for her and three other creators.', start: D(9, 22), end: D(10, 13), stores: ['us', 'eu'], goal: 9000, budget: 2500, owner: 'Mei Lin', tone: 'success' },
    { key: 'vip', name: 'Autumn VIP early access', desc: 'VIP Club members shop the autumn range two days early with 15% off.', start: D(10, 6), end: D(10, 9), stores: ['us', 'eu'], goal: 40000, budget: 6500, owner: 'Priya Natarajan', tone: 'warning' },
    { key: 'puja', name: 'Puja collection launch', desc: 'Jamdani scarves and festive shirts for Durga Puja, Bangladesh only, with 20% off by SMS.', start: D(10, 10), end: D(10, 21), stores: ['us'], region: 'Bangladesh', goal: 18000, budget: 3000, owner: 'Jamal Uddin', tone: 'info' },
    { key: 'bfcm', name: 'Black Friday and Cyber Monday', desc: 'Our biggest weekend. Plan: 30% sitewide, free express shipping, gift with purchase over $200.', start: D(11, 27), end: D(12, 1), stores: ['us', 'eu', 'amazon'], goal: 210000, budget: 52000, owner: 'Priya Natarajan', tone: 'danger', draft: true },
    { key: 'gift', name: 'Holiday gift guide', desc: 'Gift edits by price, free gift wrap, last order dates by country.', start: D(12, 2), end: D(12, 22), stores: ['us', 'eu'], goal: 120000, budget: 15000, owner: 'Mei Lin', tone: 'success', draft: true }
  ];
  PROMOS.forEach(function (p) { p.status = p.draft ? 'draft' : NOW < p.start ? 'scheduled' : NOW >= p.end ? 'ended' : 'live'; });
  var PROMO = {}; PROMOS.forEach(function (p) { PROMO[p.key] = p; });

  /* ---------- automatic discounts (no code) ---------- */
  var DISCOUNTS = [
    { key: 'freeship', name: 'Free shipping over $120', kind: 'shipping', value: 0, applies: 'Retail orders of $120 or more', eligible: 'Everyone · Fernhill US and EU', start: D(1, 15) - 400 * DAY, end: null, stores: ['us', 'eu'], combines: true },
    { key: 'vip10', name: 'VIP Club 10% off', kind: 'percent', value: 10, applies: 'Everything except gift cards', eligible: 'Customer group: VIP Club', start: D(3, 1), end: null, stores: ['us', 'eu'], combines: false, group: 'vip' },
    { key: 'staff30', name: 'Staff 30% off', kind: 'percent', value: 30, applies: 'Everything, 6 orders a year', eligible: 'Customer group: Staff', start: D(1, 1) - 300 * DAY, end: null, stores: ['us', 'eu'], combines: false, group: 'staff' },
    { key: 'tees3', name: '3 merino tees for $150', kind: 'bundle', value: 150, applies: 'Merino crew tee, any color and size', eligible: 'Everyone', start: D(8, 15), end: null, stores: ['us', 'eu'], combines: true },
    { key: 'flash25', name: 'Flash sale 25% off', kind: 'percent', value: 25, applies: 'Collections: Linen edit, Summer essentials', eligible: 'Everyone', start: D(9, 19), end: D(9, 21), stores: ['us', 'eu'], combines: false, promo: 'flash' },
    { key: 'shorts30', name: 'Summer shorts 30% off', kind: 'percent', value: 30, applies: 'Summer shorts, all sizes', eligible: 'Fernhill EU only', start: D(9, 1), end: D(9, 16), stores: ['eu'], combines: false, promo: 'eu-eos' },
    { key: 'vipearly', name: 'Autumn early access 15% off', kind: 'percent', value: 15, applies: 'Collection: Autumn ’26', eligible: 'Customer group: VIP Club', start: D(10, 6), end: D(10, 9), stores: ['us', 'eu'], combines: false, promo: 'vip' },
    { key: 'gwp', name: 'Free canvas tote over $200', kind: 'gift', value: 34, applies: 'Orders of $200 or more', eligible: 'Everyone', start: D(11, 27), end: D(12, 2), stores: ['us', 'eu'], combines: true, promo: 'bfcm', draft: true }
  ];

  /* ---------- coupon codes ---------- */
  var COUPONS = [
    { code: 'WELCOME10', kind: 'percent', value: 10, purpose: 'First order, from the newsletter sign-up form', limit: 'Once per customer · first order only', start: D(1, 1) - 380 * DAY, end: null, stores: ['us', 'eu'], rate: 0.055, leak: true },
    { code: 'FERNHILL15', kind: 'percent', value: 15, purpose: 'Win-back flow for customers quiet for 90+ days', limit: 'Unique codes · 14 days each', start: D(6, 1), end: null, stores: ['us', 'eu'], rate: 0.014, unique: true, campaign: 'flow-winback' },
    { code: 'COMEBACK10', kind: 'percent', value: 10, purpose: 'Abandoned cart, final reminder', limit: 'Unique codes · 72 hours', start: D(4, 1), end: null, stores: ['us', 'eu'], rate: 0.012, unique: true, campaign: 'flow-cart' },
    { code: 'COMEBACK15', kind: 'percent', value: 15, purpose: 'Abandoned cart over $200', limit: 'Unique codes · 72 hours', start: D(4, 1), end: null, stores: ['us', 'eu'], rate: 0.004, unique: true, campaign: 'flow-cart' },
    { code: 'JUNO15', kind: 'percent', value: 15, purpose: 'Creator code · Juno Park', limit: 'Unlimited · ends Oct 12', start: D(9, 22), end: D(10, 13), stores: ['us', 'eu'], rate: 0.018, creator: 'Juno Park', promo: 'creator', from: D(9, 22) },
    { code: 'FELIX15', kind: 'percent', value: 15, purpose: 'Creator code · Felix Adeyemi', limit: 'Unlimited · ends Oct 12', start: D(9, 22), end: D(10, 13), stores: ['us', 'eu'], rate: 0.008, creator: 'Felix Adeyemi', promo: 'creator', from: D(9, 22) },
    { code: 'SASKIA15', kind: 'percent', value: 15, purpose: 'Creator code · Saskia Mol', limit: 'Unlimited · ends Oct 12', start: D(9, 22), end: D(10, 13), stores: ['eu'], rate: 0.011, creator: 'Saskia Mol', promo: 'creator', from: D(9, 22), eu: true },
    { code: 'OLA15', kind: 'percent', value: 15, purpose: 'Creator code · Ola Nordin', limit: 'Unlimited · ends Oct 12', start: D(9, 22), end: D(10, 13), stores: ['eu'], rate: 0.004, creator: 'Ola Nordin', promo: 'creator', from: D(9, 22), eu: true },
    { code: 'SORRY20', kind: 'percent', value: 20, purpose: 'Customer service goodwill after a late or damaged delivery', limit: 'Single use · issued by the support team', start: D(1, 1), end: null, stores: ['us', 'eu'], rate: 0.003 },
    { code: 'PUJA20', kind: 'percent', value: 20, purpose: 'Puja collection, by SMS to customers in Bangladesh', limit: 'Once per customer', start: D(10, 10), end: D(10, 21), stores: ['us'], rate: 0, promo: 'puja' },
    { code: 'STUDENT10', kind: 'percent', value: 10, purpose: 'Student discount via UNiDAYS', limit: 'Verified students · once a month', start: D(1, 1), end: D(8, 31), stores: ['us'], rate: 0 }
  ];
  COUPONS.forEach(function (c) { c.status = NOW < c.start ? 'scheduled' : c.end && NOW >= c.end ? 'expired' : 'active'; });
  var COUPON = {}; COUPONS.forEach(function (c) { COUPON[c.code] = c; });

  /* ---------- attach codes and discounts to real orders (last 30 days) ---------- */
  var REDEMPTIONS = [];   // { order, code | discount, pct, discount, ts }
  var flashEnd = D(9, 21), flashStart = D(9, 19);
  O.ORDERS.forEach(function (o) {
    if (o.channel === 'Wholesale') return;
    var x = u('m' + o.id), retail = o.channel === 'Fernhill US' || o.channel === 'Fernhill EU', applied = null;
    if (retail && o.ts >= flashStart && o.ts < flashEnd && x < 0.62) applied = { disc: 'flash25', pct: 25 };
    else if (o.channel === 'Fernhill EU' && o.ts < D(9, 16) && o.skus.indexOf('SKU-SHT-STN-32') >= 0) applied = { disc: 'shorts30', pct: 30 };
    else if (retail) {
      var acc = 0;
      for (var i = 0; i < COUPONS.length && !applied; i++) {
        var c = COUPONS[i]; if (!c.rate || o.ts < (c.from || 0) || (c.eu && o.channel !== 'Fernhill EU')) continue;
        acc += c.rate; if (x < acc) applied = { code: c.code, pct: c.value };
      }
      if (!applied && u('v' + o.id) < 0.045) applied = { disc: 'vip10', pct: 10 };
      if (!applied && o.skus.filter(function (s) { return s.indexOf('SKU-TSH') === 0; }).length >= 2 && o.items >= 3 && u('t' + o.id) < 0.5) applied = { disc: 'tees3', pct: 14 };
    }
    if (o.channel === 'Amazon US' && x < 0.05) applied = null;
    if (applied) { applied.order = o; applied.ts = o.ts; applied.discount = r2(o.total * applied.pct / (100 - applied.pct)); REDEMPTIONS.push(applied); }
    if (retail && o.total >= 120 && !applied) REDEMPTIONS.push({ disc: 'freeship', order: o, ts: o.ts, pct: 0, discount: o.channel === 'Fernhill EU' ? 6.9 : 8.5 });
  });
  function usesOf(key, isCode) { return REDEMPTIONS.filter(function (r) { return isCode ? r.code === key : r.disc === key; }); }
  function sum(list, k) { return list.reduce(function (a, r) { return a + (k ? r[k] : r.order.total); }, 0); }
  COUPONS.forEach(function (c) { c.uses = usesOf(c.code, true); c.redeemed = c.uses.length + (c.code === 'WELCOME10' ? 1840 : c.code === 'FERNHILL15' ? 412 : c.code === 'COMEBACK10' ? 690 : c.code === 'SORRY20' ? 96 : c.code === 'STUDENT10' ? 318 : 0); });
  DISCOUNTS.forEach(function (d) { d.uses = usesOf(d.key, false); d.status = d.draft ? 'draft' : NOW < d.start ? 'scheduled' : d.end && NOW >= d.end ? 'ended' : 'active'; });
  /* WELCOME10 leaked to a deals site: returning customers have been using it this week */
  var welcome = COUPON.WELCOME10, wk = welcome.uses.filter(function (r) { return r.ts > NOW - 7 * DAY; });
  welcome.leakNote = { site: 'dealhunt.io', since: NOW - 6 * DAY, repeat: Math.round(wk.length * 0.58), week: wk.length };

  /* ---------- campaigns ---------- */
  var CAMPAIGNS = [];
  function camp(o) { o.id = o.id || 'CMP-' + (2400 + CAMPAIGNS.length); CAMPAIGNS.push(o); return o; }
  function emailStats(sent, open, click, conv, aov, unsub) { var opens = Math.round(sent * open), clicks = Math.round(sent * click), orders = Math.round(clicks * conv); return { sent: sent, delivered: Math.round(sent * 0.987), opens: opens, clicks: clicks, orders: orders, revenue: r2(orders * aov), unsubs: Math.round(sent * (unsub || 0.0016)) }; }
  camp({ name: 'Autumn layers lookbook', kind: 'email', status: 'sent', audience: 'All subscribers', audienceSize: SUBSCRIBED, sent: D(9, 24, 14), subject: 'Layer up: the autumn lookbook is here', owner: 'Mei Lin', stats: emailStats(SUBSCRIBED, 0.412, 0.034, 0.061, 168) });
  camp({ name: 'Merino is back in stock', kind: 'email', status: 'sent', audience: 'Repeat buyers, subscribed', audienceSize: Math.round(segSize('repeat') * 0.48), sent: D(9, 29, 13), subject: 'Your favorite merino tee is back (in every size)', owner: 'Mei Lin', stats: emailStats(Math.round(segSize('repeat') * 0.48), 0.468, 0.052, 0.074, 141) });
  camp({ name: 'Weekend flash sale', kind: 'email', status: 'sent', audience: 'All subscribers', audienceSize: SUBSCRIBED, sent: D(9, 19, 7), subject: '48 hours only: 25% off linen and summer', owner: 'Mei Lin', promo: 'flash', stats: emailStats(SUBSCRIBED, 0.448, 0.061, 0.083, 132, 0.0031) });
  camp({ name: 'Weekend flash sale · SMS', kind: 'sms', status: 'sent', audience: 'SMS subscribers', audienceSize: SMS, sent: D(9, 19, 8), subject: 'Fernhill: 25% off linen & summer, this weekend only.', owner: 'Mei Lin', promo: 'flash', stats: { sent: SMS, delivered: Math.round(SMS * 0.97), opens: null, clicks: Math.round(SMS * 0.094), orders: Math.round(SMS * 0.094 * 0.11), revenue: r2(Math.round(SMS * 0.094 * 0.11) * 124), unsubs: Math.round(SMS * 0.008) } });
  camp({ name: 'EU end-of-season sale', kind: 'email', status: 'sent', audience: 'Fernhill EU customers, subscribed', audienceSize: Math.round(segSize('eu') * 0.44), sent: D(9, 1, 8), subject: 'Sale: summer shorts 30% off', owner: 'Sofie de Vries', promo: 'eu-eos', stats: emailStats(Math.round(segSize('eu') * 0.44), 0.395, 0.041, 0.058, 96) });
  camp({ id: 'flow-welcome', name: 'Loyalty welcome flow', kind: 'flow', status: 'active', audience: 'Repeat buyers', audienceSize: segSize('repeat'), sent: D(3, 3), subject: '3 emails after the second order: thank you, care guide, VIP Club progress', owner: 'Priya Natarajan', stats: emailStats(1820, 0.52, 0.071, 0.042, 154) });
  camp({ id: 'flow-nudge', name: 'Second-order nudge', kind: 'flow', status: 'active', audience: 'New in the last 30 days', audienceSize: segSize('new30'), sent: D(5, 12), subject: '2 emails, 10 and 21 days after a first order', owner: 'Mei Lin', stats: emailStats(1260, 0.48, 0.058, 0.064, 138) });
  camp({ id: 'flow-winback', name: 'We miss you, 15% off', kind: 'flow', status: 'active', audience: 'At risk', audienceSize: segSize('risk'), sent: D(6, 1), subject: 'It’s been a while: 15% off with FERNHILL15', owner: 'Mei Lin', coupon: 'FERNHILL15', stats: emailStats(1140, 0.31, 0.029, 0.081, 162, 0.0046) });
  camp({ id: 'flow-cart', name: 'Abandoned cart reminders', kind: 'flow', status: 'active', audience: 'Shoppers who left a cart', audienceSize: 214, sent: D(4, 1), subject: '3 reminders: 1 hour, 24 hours, 72 hours with COMEBACK10', owner: 'Rafiq Hasan', coupon: 'COMEBACK10', link: 'AbandonedCarts.dc.html', stats: emailStats(1650, 0.49, 0.112, 0.162, 149) });
  camp({ name: 'Autumn VIP preview', kind: 'email', status: 'scheduled', audience: 'VIP customers', audienceSize: segSize('vip'), sent: D(10, 6, 7), subject: 'You’re first: the autumn range, 15% off for 48 hours', owner: 'Priya Natarajan', promo: 'vip', stats: null });
  camp({ name: 'Puja collection', kind: 'sms', status: 'scheduled', audience: 'Bangladesh', audienceSize: segSize('bd'), sent: D(10, 10, 4), subject: 'Fernhill Puja collection is here. 20% off with PUJA20.', owner: 'Jamal Uddin', promo: 'puja', coupon: 'PUJA20', stats: null });
  camp({ name: 'Black Friday early access', kind: 'email', status: 'draft', audience: 'All subscribers', audienceSize: SUBSCRIBED, sent: null, subject: '(draft) Early access starts Thursday', owner: 'Priya Natarajan', promo: 'bfcm', stats: null });
  /* paid ads: September spend matches the Meta, Google and TikTok bills in Finance */
  function ads(name, platform, spend, roas, ctr, cpm, status, audience, promo) {
    var impressions = Math.round(spend / cpm * 1000), clicks = Math.round(impressions * ctr), revenue = r2(spend * roas);
    return camp({ name: name, kind: 'ads', platform: platform, status: status, audience: audience, audienceSize: null, sent: D(9, 1), owner: 'Mei Lin', promo: promo,
      stats: { spend: spend, impressions: impressions, clicks: clicks, orders: Math.round(revenue / 152), revenue: revenue, roas: roas, ctr: ctr } });
  }
  ads('Autumn prospecting', 'Meta Ads', 18640.18, 2.6, 0.0118, 9.4, 'active', 'Lookalike of repeat buyers, US and EU');
  ads('Creator drop retargeting', 'Meta Ads', 12600, 4.1, 0.0182, 12.8, 'active', 'Found us on Instagram, 30-day site visitors', 'creator');
  ads('Brand search', 'Google Ads', 6215.6, 9.8, 0.142, 38, 'active', 'Searches for “fernhill”');
  ads('Shopping · all products', 'Google Ads', 23200, 3.1, 0.0124, 7.2, 'active', 'Google Shopping, US and EU');
  ads('Juno Park capsule', 'TikTok Ads', 6820.4, 1.9, 0.0089, 6.1, 'active', 'Ages 22–38, US and EU', 'creator');
  CAMPAIGNS.forEach(function (c) { c.promoName = c.promo ? PROMO[c.promo].name : null; });

  /* promotion results from their discounts, codes and campaigns */
  PROMOS.forEach(function (p) {
    var uses = REDEMPTIONS.filter(function (r) { return (r.disc && (DISCOUNTS.filter(function (d) { return d.key === r.disc; })[0] || {}).promo === p.key) || (r.code && COUPON[r.code].promo === p.key); });
    p.orders = uses.length; p.revenue = sum(uses); p.cost = sum(uses, 'discount');
    p.campaigns = CAMPAIGNS.filter(function (c) { return c.promo === p.key; });
    p.discounts = DISCOUNTS.filter(function (d) { return d.promo === p.key; }); p.coupons = COUPONS.filter(function (c) { return c.promo === p.key; });
  });

  window.FernhillMarketing = { PROMOS: PROMOS, PROMO: PROMO, DISCOUNTS: DISCOUNTS, COUPONS: COUPONS, COUPON: COUPON, CAMPAIGNS: CAMPAIGNS, REDEMPTIONS: REDEMPTIONS, SUBSCRIBED: SUBSCRIBED, SMS: SMS, segSize: segSize, sum: sum };
})();

/* CommerceOS charts: VizLine, VizColumns, VizRank, VizHeat, VizScatter, VizSpark. Load after
   components/bundle.js and viz.css. Every chart has a hover/focus tooltip and a table view, a legend
   for two or more series, thin marks (2px lines, <=24px columns with a 4px rounded end, 2px gaps),
   one y-axis, and text in text colors only. Series colors come from --series-1..4 in fixed order. */
(function () {
  "use strict";
  var React = window.React, h = React.createElement, useState = React.useState, useRef = React.useRef;
  var SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

  function int(n) { return Math.round(n).toLocaleString('en-US'); }
  function fmt(v, kind, full) {
    if (v == null || isNaN(v)) return '—';
    var a = Math.abs(v), s = v < 0 ? '−' : '';
    if (kind === 'pct') return (v * 100).toFixed(full ? 1 : (a < 0.1 ? 1 : 0)) + '%';
    if (kind === 'days') return int(v) + (full ? ' days' : 'd');
    if (kind === 'ratio') return v.toFixed(1) + '×';
    if (kind === 'dec1') return v.toFixed(1);
    var money = kind === 'money' || kind === 'money2';
    if (full) return s + (money ? '$' : '') + (kind === 'money2' ? a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : int(a));
    if (a >= 1e6) return s + (money ? '$' : '') + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M';
    if (a >= 1e4) return s + (money ? '$' : '') + Math.round(a / 1e3) + 'k';
    if (a >= 1e3) return s + (money ? '$' : '') + (a / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return s + (money ? '$' : '') + (kind === 'money2' ? a.toFixed(2) : int(a));
  }
  function ticks(max, min) {
    min = min || 0; var span = Math.max(1e-9, max - min), raw = span / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), step = p;
    [1, 2, 2.5, 5, 10].some(function (m) { step = m * p; return span / step <= 4.5; });
    var lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, out = [];
    for (var v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return { lo: lo, hi: hi, list: out };
  }
  function color(i, s) { return s && s.color ? s.color : s && s.muted ? 'var(--series-muted)' : SERIES[i % SERIES.length]; }
  function tipRow(c, label, value, dashed, box) {
    return h('div', { className: 'vz-tip-r', key: label }, h('span', { className: 'vz-tip-k' }, c ? h('span', { className: box ? 'vz-sw' : 'vz-ln' + (dashed ? ' is-dashed' : ''), style: box ? { background: c } : { borderColor: c } }) : null, label), h('strong', null, value));
  }
  function Tip(props) {
    if (!props.tip) return null;
    var t = props.tip, style = t.flip ? { right: (100 - t.x) + '%', top: t.y, marginRight: 12 } : { left: t.x + '%', top: t.y, marginLeft: 12 };
    return h('div', { className: 'vz-tip', role: 'status', style: style }, h('div', { className: 'vz-tip-h' }, t.title), t.rows);
  }
  function Legend(props) {
    if (!props.items || props.items.length < 2) return null;
    return h('div', { className: 'vz-legend', 'aria-hidden': 'true' }, props.items.map(function (s, i) {
      var c = color(i, s);
      return h('span', { className: 'vz-key', key: s.label }, props.kind === 'line' ? h('span', { className: 'vz-ln' + (s.dashed ? ' is-dashed' : ''), style: { borderColor: c } }) : h('span', { className: 'vz-sw', style: { background: c } }), s.label);
    }));
  }
  function Table(props) {
    return h('div', { className: 'vz-table-wrap' }, h('table', { className: 'vz-table' },
      props.caption ? h('caption', { className: 'cx-sr' }, props.caption) : null,
      h('thead', null, h('tr', null, props.head.map(function (c, i) { return h('th', { key: i, scope: 'col' }, c); }))),
      h('tbody', null, props.rows.map(function (r, i) { return h('tr', { key: i }, r.map(function (c, j) { return j === 0 ? h('th', { key: j, scope: 'row', style: { fontWeight: 400, background: 'none', position: 'static', textAlign: 'left', color: 'var(--text-primary)' } }, c) : h('td', { key: j }, c); })); }))));
  }
  function Foot(props) { return h('div', { className: 'vz-foot' }, h('button', { type: 'button', className: 'vz-toggle', 'aria-pressed': props.on, onClick: props.toggle }, props.on ? 'Show chart' : 'Show as table')); }
  function Axis(props) {
    return h(React.Fragment, null,
      h('div', { className: 'vz-y', style: { height: props.height }, 'aria-hidden': 'true' }, props.t.list.map(function (v) { return h('span', { key: v, style: { bottom: ((v - props.t.lo) / (props.t.hi - props.t.lo) * 100) + '%' } }, fmt(v, props.kind)); })));
  }
  function Grid(props) { return props.t.list.map(function (v) { return h('span', { key: v, className: 'vz-gl', style: { bottom: ((v - props.t.lo) / (props.t.hi - props.t.lo) * 100) + '%' } }); }); }
  function xLabels(labels, every) { every = every || Math.ceil(labels.length / 7); return labels.map(function (l, i) { return (i % every === 0 || i === labels.length - 1) && !(i === labels.length - 1 && i % every !== 0 && i % every < every / 2) ? { l: l, i: i } : null; }).filter(Boolean); }

  /* ---------- line: one or more series over time, crosshair + tooltip ---------- */
  function VizLine(props) {
    var st = useState(null), hov = st[0], setHov = st[1], tb = useState(false), table = tb[0], setTable = tb[1], ref = useRef(null);
    var labels = props.labels || [], series = props.series || [], n = labels.length, H = Number(props.height) || 220, kind = props.format || 'money';
    var all = []; series.forEach(function (s) { s.values.forEach(function (v) { if (v != null) all.push(v); }); });
    var t = ticks(Math.max.apply(null, all.concat([0])) * 1.05, props.min != null ? props.min : 0);
    var X = function (i) { return n <= 1 ? 50 : i / (n - 1) * 100; }, Y = function (v) { return 100 - (v - t.lo) / (t.hi - t.lo) * 100; };
    var path = function (vals) { var d = '', pen = false; vals.forEach(function (v, i) { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(3) + ',' + Y(v).toFixed(3); pen = true; }); return d; };
    var label = props.title || 'Line chart';
    if (table) return h('div', { className: 'vz' }, h(Table, { caption: label, head: [props.xName || ''].concat(series.map(function (s) { return s.label; })), rows: labels.map(function (l, i) { return [props.fullLabels ? props.fullLabels[i] : l].concat(series.map(function (s) { return fmt(s.values[i], kind, true); })); }) }), h(Foot, { on: true, toggle: function () { setTable(false); } }));
    var tip = null;
    if (hov != null) {
      tip = { x: X(hov), y: 8, flip: X(hov) > 62, title: props.fullLabels ? props.fullLabels[hov] : labels[hov],
        rows: series.map(function (s, i) { return tipRow(color(i, s), s.label, fmt(s.values[hov], kind, true), s.dashed); }).concat(props.tipExtra ? props.tipExtra(hov) : []) };
    }
    var last = series[0] ? series[0].values[n - 1] : null;
    var keys = function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setHov(function (v) { var c = v == null ? (e.key === 'ArrowRight' ? 0 : n - 1) : v + (e.key === 'ArrowRight' ? 1 : -1); return Math.max(0, Math.min(n - 1, c)); }); } if (e.key === 'Escape') setHov(null); };
    return h('div', { className: 'vz', ref: ref },
      h(Legend, { items: series, kind: 'line' }),
      h('div', { className: 'vz-frame' + (last != null && !props.noEnd ? ' has-end' : '') },
        h(Axis, { t: t, kind: kind, height: H }),
        h('div', { className: 'vz-plot', style: { height: H }, tabIndex: 0, role: 'img', 'aria-label': label + '. Use the arrow keys to read values, or show as table.', onKeyDown: keys, onBlur: function () { setHov(null); } },
          h(Grid, { t: t }),
          (props.refs || []).map(function (r) { return h(React.Fragment, { key: r.label }, h('span', { className: 'vz-ref-h', style: { bottom: ((r.value - t.lo) / (t.hi - t.lo) * 100) + '%' } }), h('span', { className: 'vz-ref-l', style: { bottom: ((r.value - t.lo) / (t.hi - t.lo) * 100) + '%', right: 0, transform: 'translateY(-2px)' } }, r.label)); }),
          h('svg', { className: 'vz-svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
            props.area && series[0] ? h('path', { className: 'vz-area', d: path(series[0].values) + 'L100,100L0,100Z', fill: color(0, series[0]) }) : null,
            series.slice().reverse().map(function (s, ri) { var i = series.length - 1 - ri; return h('path', { key: s.label, className: 'vz-line' + (s.dashed ? ' is-dashed' : ''), d: path(s.values), stroke: color(i, s) }); })),
          last != null && !props.noEnd ? h('span', { className: 'vz-end', style: { left: '100%', bottom: (100 - Y(last)) + '%' } }, fmt(last, kind)) : null,
          hov != null ? h('span', { className: 'vz-cross', style: { left: X(hov) + '%' } }) : null,
          hov != null ? series.map(function (s, i) { var v = s.values[hov]; return v == null ? null : h('span', { key: s.label, className: 'vz-dot', style: { left: X(hov) + '%', bottom: (100 - Y(v)) + '%', background: color(i, s) } }); }) : null,
          h('div', { className: 'vz-hits' }, labels.map(function (l, i) { return h('div', { key: i, className: 'vz-hit', onMouseEnter: function () { setHov(i); }, onMouseLeave: function () { setHov(null); } }); })),
          h(Tip, { tip: tip })),
        h('div', { className: 'vz-x', 'aria-hidden': 'true' }, xLabels(labels, props.every).map(function (x) { return h('span', { key: x.i, style: { left: X(x.i) + '%' } }, x.l); }))),
      h(Foot, { on: false, toggle: function () { setTable(true); } }));
  }

  /* ---------- columns: categories or time buckets, stacked when there are several series ---------- */
  function VizColumns(props) {
    var st = useState(null), hov = st[0], setHov = st[1], tb = useState(false), table = tb[0], setTable = tb[1];
    var labels = props.labels || [], series = props.series || [], n = labels.length, H = Number(props.height) || 220, kind = props.format || 'money';
    var totals = labels.map(function (_, i) { return series.reduce(function (a, s) { return a + (s.values[i] || 0); }, 0); });
    var t = ticks(Math.max.apply(null, totals.concat([0])) * 1.08);
    var label = props.title || 'Column chart';
    if (table) return h('div', { className: 'vz' }, h(Table, { caption: label, head: [props.xName || ''].concat(series.map(function (s) { return s.label; })).concat(series.length > 1 ? ['Total'] : []), rows: labels.map(function (l, i) { return [props.fullLabels ? props.fullLabels[i] : l].concat(series.map(function (s) { return fmt(s.values[i], kind, true); })).concat(series.length > 1 ? [fmt(totals[i], kind, true)] : []); }) }), h(Foot, { on: true, toggle: function () { setTable(false); } }));
    var tip = null;
    if (hov != null) { var x = (hov + 0.5) / n * 100;
      tip = { x: x, y: 8, flip: x > 62, title: props.fullLabels ? props.fullLabels[hov] : labels[hov], rows: series.map(function (s, i) { return tipRow(color(i, s), s.label, fmt(s.values[hov], kind, true), false, true); }).concat(series.length > 1 ? [tipRow(null, 'Total', fmt(totals[hov], kind, true))] : []).concat(props.tipExtra ? props.tipExtra(hov) : []) }; }
    var caps = props.caps !== false && n <= 14;
    return h('div', { className: 'vz' },
      h(Legend, { items: series, kind: 'bar' }),
      h('div', { className: 'vz-frame' },
        h(Axis, { t: t, kind: kind, height: H }),
        h('div', { className: 'vz-plot', style: { height: H } },
          h(Grid, { t: t }),
          h('div', { className: 'vz-cols' }, labels.map(function (l, i) {
            return h('div', { key: i, className: 'vz-band', tabIndex: 0, role: 'img', 'aria-label': (props.fullLabels ? props.fullLabels[i] : l) + ': ' + series.map(function (s) { return s.label + ' ' + fmt(s.values[i], kind, true); }).join(', '),
              onMouseEnter: function () { setHov(i); }, onMouseLeave: function () { setHov(null); }, onFocus: function () { setHov(i); }, onBlur: function () { setHov(null); } },
              caps && totals[i] ? h('span', { className: 'vz-cap', style: { bottom: (totals[i] / t.hi * 100) + '%' } }, fmt(totals[i], kind)) : null,
              h('div', { className: 'vz-stack' }, series.map(function (s, j) { var v = s.values[i] || 0; return v > 0 ? h('span', { key: j, className: 'vz-seg', style: { height: Math.max(1, v / t.hi * H - 2) + 'px', background: color(j, s) } }) : null; })));
          })),
          h(Tip, { tip: tip })),
        h('div', { className: 'vz-x', 'aria-hidden': 'true' }, labels.map(function (l, i) { return n <= 14 || i % Math.ceil(n / 10) === 0 ? h('span', { key: i, style: { left: ((i + 0.5) / n * 100) + '%' } }, l) : null; }))),
      h(Foot, { on: false, toggle: function () { setTable(true); } }));
  }

  /* ---------- ranked horizontal bars, optionally split into parts ---------- */
  function VizRank(props) {
    var st = useState(null), hov = st[0], setHov = st[1], tb = useState(false), table = tb[0], setTable = tb[1];
    var items = props.items || [], kind = props.format || 'money', parts = props.parts || null;
    var max = Math.max.apply(null, items.map(function (x) { return x.value; }).concat([1e-9]));
    var label = props.title || 'Ranking';
    if (table) return h('div', { className: 'vz' }, h(Table, { caption: label, head: [props.itemName || ''].concat(parts ? parts.map(function (p) { return p.label; }) : []).concat([props.valueName || 'Value']).concat(props.extraHead ? [props.extraHead] : []),
      rows: items.map(function (x) { return [x.label].concat(parts ? x.parts.map(function (v) { return fmt(v, kind, true); }) : []).concat([fmt(x.value, kind, true)]).concat(props.extraHead ? [x.extra || ''] : []); }) }), h(Foot, { on: true, toggle: function () { setTable(false); } }));
    return h('div', { className: 'vz' },
      parts ? h(Legend, { items: parts, kind: 'bar' }) : null,
      h('ul', { className: 'vz-rank', style: props.labelWidth ? { '--vz-lab': props.labelWidth } : null }, items.map(function (x, i) {
        var w = x.value / max * 78;
        return h('li', { key: x.label + i, tabIndex: 0, 'aria-label': x.label + ': ' + fmt(x.value, kind, true) + (x.sub ? ', ' + x.sub : ''), onMouseEnter: function () { setHov(i); }, onMouseLeave: function () { setHov(null); }, onFocus: function () { setHov(i); }, onBlur: function () { setHov(null); }, style: { position: 'relative' } },
          h('span', { className: 'vz-rank-l' }, h('span', null, x.label), x.sub ? h('span', { className: 'o-sub' }, x.sub) : null),
          h('span', { className: 'vz-rank-b' },
            parts ? h('span', { className: 'vz-rank-stack', style: { width: Math.max(0.5, w) + '%' } }, x.parts.map(function (v, j) { return v > 0 ? h('span', { key: j, style: { flex: v + ' 1 0', background: color(j, parts[j]) } }) : null; }))
              : h('span', { className: 'vz-rank-bar', style: { width: Math.max(0.5, w) + '%', background: x.color || color(0, props.series) } }),
            h('span', { className: 'vz-rank-v' }, fmt(x.value, kind, props.fullValues))),
          hov === i && (parts || x.tip) ? h('div', { className: 'vz-tip', style: { left: 'calc(' + (props.labelWidth || '160px') + ' + 24px)', top: 22 } }, h('div', { className: 'vz-tip-h' }, x.label),
            parts ? parts.map(function (p, j) { return tipRow(color(j, p), p.label, fmt(x.parts[j], kind, true), false, true); }) : null, x.tip ? x.tip.map(function (r) { return tipRow(null, r[0], r[1]); }) : null) : null);
      })),
      h(Foot, { on: false, toggle: function () { setTable(true); } }));
  }

  /* ---------- heatmap: rows × columns on one sequential hue ---------- */
  function VizHeat(props) {
    var st = useState(null), hov = st[0], setHov = st[1], tb = useState(false), table = tb[0], setTable = tb[1];
    var rows = props.rows, cols = props.cols, vals = props.values, kind = props.format || 'int';
    var max = Math.max.apply(null, [].concat.apply([], vals).concat([1e-9])), every = props.colEvery || 1;
    var step = function (v) { return v <= 0 ? 0 : Math.min(7, 1 + Math.floor(v / max * 6.999)); };
    var label = props.title || 'Heatmap';
    if (table) return h('div', { className: 'vz' }, h(Table, { caption: label, head: [''].concat(cols), rows: rows.map(function (r, i) { return [r].concat(vals[i].map(function (v) { return fmt(v, kind, true); })); }) }), h(Foot, { on: true, toggle: function () { setTable(false); } }));
    return h('div', { className: 'vz' },
      h('div', { className: 'vz-heat', style: { gridTemplateColumns: 'auto repeat(' + cols.length + ', minmax(0, 1fr))', position: 'relative' } },
        h('span', null), cols.map(function (c, j) { return h('span', { key: 'h' + j, className: 'vz-heat-h' }, j % every === 0 ? c : ''); }),
        rows.map(function (r, i) {
          return [h('span', { key: 'r' + i, className: 'vz-heat-r' }, r)].concat(cols.map(function (c, j) {
            var v = vals[i][j];
            return h('span', { key: i + '-' + j, className: 'vz-heat-c', tabIndex: j === 0 && i === 0 ? 0 : -1, style: { background: 'var(--seq-' + step(v) + ')' }, 'aria-label': r + ' ' + c + ': ' + fmt(v, kind, true),
              onMouseEnter: function () { setHov([i, j]); }, onMouseLeave: function () { setHov(null); }, onFocus: function () { setHov([i, j]); }, onBlur: function () { setHov(null); },
              onKeyDown: function (e) { var d = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key]; if (!d) return; e.preventDefault(); var ni = Math.max(0, Math.min(rows.length - 1, i + d[0])), nj = Math.max(0, Math.min(cols.length - 1, j + d[1])); var el = e.currentTarget.parentNode.querySelectorAll('.vz-heat-c')[ni * cols.length + nj]; if (el) el.focus(); } });
          }));
        }),
        hov ? h('div', { className: 'vz-tip', style: hov[1] / cols.length > 0.6 ? { right: ((cols.length - hov[1]) / cols.length * 100) + '%', top: (hov[0] + 1) * 24 + 14 } : { left: ((hov[1] + 1) / cols.length * 92 + 6) + '%', top: (hov[0] + 1) * 24 + 14 } },
          h('div', { className: 'vz-tip-h' }, rows[hov[0]] + ' · ' + (props.colFull ? props.colFull[hov[1]] : cols[hov[1]])), tipRow(null, props.valueName || 'Value', fmt(vals[hov[0]][hov[1]], kind, true)), props.tipExtra ? props.tipExtra(hov[0], hov[1]) : null) : null),
      h('div', { className: 'vz-scale', 'aria-hidden': 'true' }, h('span', null, props.lowLabel || fmt(0, kind)), h('span', { className: 'vz-scale-bar' }, [1, 2, 3, 4, 5, 6, 7].map(function (k) { return h('span', { key: k, style: { background: 'var(--seq-' + k + ')' } }); })), h('span', null, props.highLabel || fmt(max, kind))),
      h(Foot, { on: false, toggle: function () { setTable(true); } }));
  }

  /* ---------- scatter: one dot per item, up to three groups ---------- */
  function VizScatter(props) {
    var st = useState(null), hov = st[0], setHov = st[1], tb = useState(false), table = tb[0], setTable = tb[1];
    var pts = props.points || [], groups = props.groups || [{ key: '_', label: props.title }], H = Number(props.height) || 260, xk = props.xFormat || 'int', yk = props.yFormat || 'pct';
    var tx = ticks(Math.max.apply(null, pts.map(function (p) { return p.x; }).concat([0])) * 1.05), ty = ticks(Math.max.apply(null, pts.map(function (p) { return p.y; }).concat([0])) * 1.05, props.yMin != null ? props.yMin : 0);
    var X = function (v) { return (v - tx.lo) / (tx.hi - tx.lo) * 100; }, Y = function (v) { return (v - ty.lo) / (ty.hi - ty.lo) * 100; };
    var gi = function (p) { var k = groups.findIndex(function (g) { return g.key === (p.group || '_'); }); return k < 0 ? 0 : k; };
    var label = props.title || 'Scatter';
    if (table) return h('div', { className: 'vz' }, h(Table, { caption: label, head: [props.itemName || ''].concat(groups.length > 1 ? ['Group'] : []).concat([props.xLabel, props.yLabel]), rows: pts.map(function (p) { return [p.label].concat(groups.length > 1 ? [groups[gi(p)].label] : []).concat([fmt(p.x, xk, true), fmt(p.y, yk, true)]); }) }), h(Foot, { on: true, toggle: function () { setTable(false); } }));
    var p = hov != null ? pts[hov] : null;
    return h('div', { className: 'vz' },
      h(Legend, { items: groups.length > 1 ? groups : null, kind: 'bar' }),
      h('div', { className: 'vz-frame' },
        h(Axis, { t: ty, kind: yk, height: H }),
        h('div', { className: 'vz-plot', style: { height: H, borderLeft: '1px solid var(--vz-axis)' } },
          h('span', { className: 'vz-ylab' }, props.yLabel),
          h(Grid, { t: ty }),
          props.refX != null ? h(React.Fragment, null, h('span', { className: 'vz-ref', style: { left: X(props.refX) + '%' } }), h('span', { className: 'vz-ref-l', style: { left: 'calc(' + X(props.refX) + '% + 4px)', top: 2 } }, props.refXLabel)) : null,
          props.refY != null ? h(React.Fragment, null, h('span', { className: 'vz-ref-h', style: { bottom: Y(props.refY) + '%' } }), h('span', { className: 'vz-ref-l', style: { right: 2, bottom: 'calc(' + Y(props.refY) + '% + 2px)' } }, props.refYLabel)) : null,
          pts.map(function (q, i) { var c = color(gi(q), groups[gi(q)]);
            return h(React.Fragment, { key: i }, h('span', { className: 'vz-pt-hit', tabIndex: 0, 'aria-label': q.label + ': ' + props.xLabel + ' ' + fmt(q.x, xk, true) + ', ' + props.yLabel + ' ' + fmt(q.y, yk, true), style: { left: X(q.x) + '%', bottom: Y(q.y) + '%' },
              onMouseEnter: function () { setHov(i); }, onMouseLeave: function () { setHov(null); }, onFocus: function () { setHov(i); }, onBlur: function () { setHov(null); } }), h('span', { className: 'vz-pt' + (hov === i ? ' is-on' : ''), style: { left: X(q.x) + '%', bottom: Y(q.y) + '%', background: c } })); }),
          p ? h('div', { className: 'vz-tip', style: X(p.x) > 60 ? { right: (100 - X(p.x)) + '%', bottom: Y(p.y) + '%', marginRight: 14 } : { left: X(p.x) + '%', bottom: Y(p.y) + '%', marginLeft: 14 } },
            h('div', { className: 'vz-tip-h' }, p.label), p.sub ? h('div', { style: { marginBottom: 4 } }, p.sub) : null, tipRow(null, props.xLabel, fmt(p.x, xk, true)), tipRow(null, props.yLabel, fmt(p.y, yk, true))) : null),
        h('div', { className: 'vz-x', 'aria-hidden': 'true' }, tx.list.map(function (v) { return h('span', { key: v, style: { left: X(v) + '%' } }, fmt(v, xk)); })),
        h('div', { className: 'vz-xlab' }, props.xLabel)),
      h(Foot, { on: false, toggle: function () { setTable(true); } }));
  }

  /* ---------- sparkline for stat tiles: earlier points muted, the latest in the accent ---------- */
  function VizSpark(props) {
    var v = props.values || [], n = v.length; if (n < 2) return null;
    var lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), sp = hi - lo || 1;
    var pts = v.map(function (x, i) { return (i / (n - 1) * 100).toFixed(2) + ',' + (28 - (x - lo) / sp * 24).toFixed(2); });
    return h('svg', { viewBox: '0 0 100 30', preserveAspectRatio: 'none', width: '100%', height: 30, 'aria-hidden': 'true', style: { display: 'block', overflow: 'visible' } },
      h('polyline', { points: pts.join(' '), fill: 'none', stroke: 'var(--series-muted)', strokeWidth: 2, vectorEffect: 'non-scaling-stroke', strokeLinejoin: 'round' }),
      h('polyline', { points: pts.slice(-Math.max(2, Math.ceil(n / 4))).join(' '), fill: 'none', stroke: 'var(--series-1)', strokeWidth: 2, vectorEffect: 'non-scaling-stroke', strokeLinejoin: 'round' }));
  }

  window.CommerceOS = Object.assign(window.CommerceOS || {}, { VizLine: VizLine, VizColumns: VizColumns, VizRank: VizRank, VizHeat: VizHeat, VizScatter: VizScatter, VizSpark: VizSpark, vizFormat: fmt });
})();

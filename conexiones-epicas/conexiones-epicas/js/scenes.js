/* =========================================================
   CONEXIONES ÉPICAS · scenes.js
   Escenarios SVG originales en perspectiva isométrica.
   Cada escena es estática; el motor enciende o apaga "capas"
   (atributo data-l) para mostrar las transformaciones.
   Una capa "!nombre" se ve cuando "nombre" NO está activo.
   ========================================================= */
(function () {
  'use strict';

  var TW = 56, TH = 28;
  var VB = { x: -440, y: -130, w: 880, h: 600 };

  function iso(x, y, z) { return [(x - y) * TW / 2, (x + y) * TH / 2 - (z || 0)]; }
  function P(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function poly(a, fill, extra) { return '<polygon points="' + P(a) + '" fill="' + fill + '"' + (extra ? ' ' + extra : '') + '/>'; }
  function topf(x, y, w, d, z) { return [iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)]; }
  function tile(x, y, w, d, fill, z, extra) { return poly(topf(x, y, w, d, z || 0), fill, extra); }
  function box(x, y, w, d, h, c, z, round) {
    z = z || 0;
    var r = function (col) { return round ? 'stroke="' + col + '" stroke-width="' + round + '" stroke-linejoin="round"' : ''; };
    var t = topf(x, y, w, d, z + h);
    var L = [iso(x, y + d, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x, y + d, z)];
    var R = [iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x + w, y, z)];
    return poly(L, c[1], r(c[1])) + poly(R, c[2], r(c[2])) + poly(t, c[0], r(c[0]));
  }
  function n(v) { return Number(v).toFixed(1); }

  /* ---------- Paleta ---------- */
  var C = { blue: '#1F4FD8', blueD: '#163A9E', turq: '#17BFAE', turqD: '#0E9A8C', coral: '#FF6B57', coralD: '#E04F3D', yellow: '#FFC83D', yellowD: '#E8A91A', ink: '#0F1F4B', white: '#FFFFFF', sand: '#FFF1C9' };
  var KG = ['#8BE6BC', '#FFB38A', '#F08A64'];          // isla infantil: pasto y arena
  var AG = ['#EDF2FA', '#2D5FD8', '#1D45AD'];          // isla adultos: plaza y basamento azul

  /* ---------- Colector con orden de profundidad ---------- */
  function Scene() { this.items = []; }
  Scene.prototype.add = function (depth, svg, layer, cls) {
    this.items.push({ d: depth, s: svg, l: layer || '', c: cls || '', i: this.items.length });
    return this;
  };
  Scene.prototype.out = function () {
    return this.items.slice().sort(function (a, b) { return a.d - b.d || a.i - b.i; }).map(function (it) {
      if (!it.l && !it.c) return it.s;
      return '<g class="' + (it.l ? 'lyr ' : '') + it.c + '"' + (it.l ? ' data-l="' + it.l + '"' : '') + '>' + it.s + '</g>';
    }).join('');
  };

  /* ---------- Fondo luminoso: mar, cielo y olas ---------- */
  function background() {
    var s = '<defs>' +
      '<linearGradient id="gWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8F3FF"/><stop offset=".45" stop-color="#9FDDF5"/><stop offset="1" stop-color="#54AEF2"/></linearGradient>' +
      '<radialGradient id="gGlow"><stop offset="0" stop-color="#FFE37A" stop-opacity=".95"/><stop offset="1" stop-color="#FFE37A" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="gGlowT"><stop offset="0" stop-color="#7FF3E4" stop-opacity=".9"/><stop offset="1" stop-color="#7FF3E4" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    s += '<rect x="' + VB.x + '" y="' + VB.y + '" width="' + VB.w + '" height="' + VB.h + '" fill="url(#gWater)"/>';
    var waves = [[-380, 60], [250, 20], [-300, 330], [300, 380], [-60, 440], [120, -60], [-200, -40], [360, 230]];
    s += '<g class="waves">';
    waves.forEach(function (w, i) {
      s += '<path class="wave w' + (i % 3) + '" d="M' + w[0] + ' ' + w[1] + ' q 12 -7 24 0 t 24 0 t 24 0" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>';
    });
    s += '</g>';
    // nubes suaves
    s += '<g opacity=".85"><ellipse cx="-330" cy="-80" rx="46" ry="14" fill="#fff"/><ellipse cx="-300" cy="-90" rx="26" ry="14" fill="#fff"/>' +
      '<ellipse cx="320" cy="-95" rx="40" ry="12" fill="#fff"/><ellipse cx="345" cy="-104" rx="22" ry="12" fill="#fff"/></g>';
    return s;
  }

  function island(sc, x, y, w, d, style, h) {
    h = h || 22;
    var kids = style === 'k';
    sc.add(-2000 + x + y, tile(x - 0.35, y - 0.35, w + 0.7, d + 0.7, '#1F6FC9', -h - 6, 'opacity=".16"'));
    sc.add(-1000 + x + y, box(x, y, w, d, h, kids ? KG : AG, -h, kids ? 14 : 0));
    if (!kids) sc.add(-999 + x + y, tile(x + 0.15, y + 0.15, w - 0.3, d - 0.3, '#F7FAFF', 0.5));
  }

  /* ---------- Objetos ---------- */
  function tree(x, y, s, style) {
    var p = iso(x, y), X = p[0], Y = p[1]; s = s || 1;
    if (style === 'a') {
      return '<ellipse cx="' + X + '" cy="' + Y + '" rx="' + 11 * s + '" ry="' + 5 * s + '" fill="#0F1F4B" opacity=".12"/>' +
        '<rect x="' + n(X - 2 * s) + '" y="' + n(Y - 14 * s) + '" width="' + n(4 * s) + '" height="' + n(14 * s) + '" fill="#7A5236"/>' +
        '<polygon points="' + n(X) + ',' + n(Y - 56 * s) + ' ' + n(X - 15 * s) + ',' + n(Y - 12 * s) + ' ' + n(X + 15 * s) + ',' + n(Y - 12 * s) + '" fill="#17BFAE"/>' +
        '<polygon points="' + n(X) + ',' + n(Y - 56 * s) + ' ' + n(X) + ',' + n(Y - 12 * s) + ' ' + n(X + 15 * s) + ',' + n(Y - 12 * s) + '" fill="#0E9A8C"/>';
    }
    return '<ellipse cx="' + X + '" cy="' + Y + '" rx="' + 13 * s + '" ry="' + 6 * s + '" fill="#0F1F4B" opacity=".12"/>' +
      '<rect x="' + n(X - 3 * s) + '" y="' + n(Y - 18 * s) + '" width="' + n(6 * s) + '" height="' + n(18 * s) + '" rx="3" fill="#B0703F"/>' +
      '<circle cx="' + X + '" cy="' + n(Y - 30 * s) + '" r="' + n(17 * s) + '" fill="#2EC4A0"/>' +
      '<circle cx="' + n(X + 6 * s) + '" cy="' + n(Y - 26 * s) + '" r="' + n(10 * s) + '" fill="#22A98A"/>' +
      '<circle cx="' + n(X - 6 * s) + '" cy="' + n(Y - 36 * s) + '" r="' + n(6 * s) + '" fill="#9AF2D6" opacity=".8"/>';
  }
  function bush(x, y, col) {
    var p = iso(x, y);
    return '<ellipse cx="' + p[0] + '" cy="' + (p[1] - 6) + '" rx="13" ry="9" fill="' + (col || '#3CCB9F') + '"/><ellipse cx="' + (p[0] - 4) + '" cy="' + (p[1] - 10) + '" rx="5" ry="3" fill="#A8F5DD"/>';
  }
  function flower(x, y, col) {
    var p = iso(x, y);
    return '<circle cx="' + p[0] + '" cy="' + (p[1] - 3) + '" r="3.5" fill="' + col + '"/><circle cx="' + p[0] + '" cy="' + (p[1] - 3) + '" r="1.4" fill="#fff"/>';
  }
  function lamp(x, y, style) {
    var p = iso(x, y), X = p[0], Y = p[1];
    var head = style === 'a'
      ? '<rect x="' + (X - 7) + '" y="' + (Y - 52) + '" width="14" height="5" rx="2" fill="#0F1F4B"/>'
      : '<circle cx="' + X + '" cy="' + (Y - 50) + '" r="7" fill="#FFF6D6" stroke="#FF6B57" stroke-width="3"/>';
    return '<rect x="' + (X - 1.5) + '" y="' + (Y - 48) + '" width="3" height="48" fill="#33415C"/>' + head;
  }
  function lampGlow(x, y) {
    var p = iso(x, y);
    return '<circle cx="' + p[0] + '" cy="' + (p[1] - 50) + '" r="26" fill="url(#gGlow)"/>';
  }
  function bunting(a, b, cols) {
    var A = iso(a[0], a[1], a[2]), B = iso(b[0], b[1], b[2]);
    var s = '<path d="M' + n(A[0]) + ' ' + n(A[1]) + ' Q ' + n((A[0] + B[0]) / 2) + ' ' + n((A[1] + B[1]) / 2 + 14) + ' ' + n(B[0]) + ' ' + n(B[1]) + '" stroke="#33415C" stroke-width="1.5" fill="none"/>';
    cols = cols || [C.coral, C.yellow, C.turq, C.blue];
    for (var i = 1; i < 8; i++) {
      var t = i / 8;
      var mx = (1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * ((A[0] + B[0]) / 2) + t * t * B[0];
      var my = (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * ((A[1] + B[1]) / 2 + 14) + t * t * B[1];
      s += '<polygon points="' + n(mx - 5) + ',' + n(my) + ' ' + n(mx + 5) + ',' + n(my) + ' ' + n(mx) + ',' + n(my + 11) + '" fill="' + cols[i % cols.length] + '"/>';
    }
    return s;
  }
  function figure(x, y, col, o) {
    o = o || {};
    var p = iso(x, y, o.z || 0), X = p[0], Y = p[1], s = o.s || 1, skin = o.skin || '#C98B62', hair = o.hair || '#3A2A20';
    var g = '<ellipse cx="' + X + '" cy="' + Y + '" rx="' + n(10 * s) + '" ry="' + n(4 * s) + '" fill="#0F1F4B" opacity=".15"/>';
    if (o.wheel) {
      g += '<circle cx="' + n(X - 2 * s) + '" cy="' + n(Y - 9 * s) + '" r="' + n(9 * s) + '" fill="#E8EEF8" stroke="#33415C" stroke-width="' + n(2.6 * s) + '"/>' +
        '<rect x="' + n(X - 4 * s) + '" y="' + n(Y - 36 * s) + '" width="' + n(11 * s) + '" height="' + n(19 * s) + '" rx="' + n(5 * s) + '" fill="' + col + '"/>' +
        '<rect x="' + n(X - 4 * s) + '" y="' + n(Y - 20 * s) + '" width="' + n(14 * s) + '" height="' + n(5 * s) + '" rx="2" fill="' + col + '"/>' +
        '<circle cx="' + n(X + 1.5 * s) + '" cy="' + n(Y - 42 * s) + '" r="' + n(6.5 * s) + '" fill="' + skin + '"/>' +
        '<path d="M' + n(X - 5 * s) + ' ' + n(Y - 43 * s) + ' a' + n(6.5 * s) + ' ' + n(6.5 * s) + ' 0 0 1 ' + n(13 * s) + ' 0z" fill="' + hair + '"/>';
    } else {
      g += '<rect x="' + n(X - 4 * s) + '" y="' + n(Y - 12 * s) + '" width="' + n(3.2 * s) + '" height="' + n(12 * s) + '" rx="1.5" fill="#33415C"/>' +
        '<rect x="' + n(X + 0.8 * s) + '" y="' + n(Y - 12 * s) + '" width="' + n(3.2 * s) + '" height="' + n(12 * s) + '" rx="1.5" fill="#33415C"/>' +
        '<rect x="' + n(X - 6 * s) + '" y="' + n(Y - 32 * s) + '" width="' + n(12 * s) + '" height="' + n(22 * s) + '" rx="' + n(6 * s) + '" fill="' + col + '"/>' +
        '<circle cx="' + X + '" cy="' + n(Y - 38 * s) + '" r="' + n(6.5 * s) + '" fill="' + skin + '"/>' +
        '<path d="M' + n(X - 6.5 * s) + ' ' + n(Y - 39 * s) + ' a' + n(6.5 * s) + ' ' + n(6.5 * s) + ' 0 0 1 ' + n(13 * s) + ' 0z" fill="' + hair + '"/>';
    }
    if (o.arm) g += '<path d="M' + n(X + 5 * s) + ' ' + n(Y - 28 * s) + ' l' + n(8 * s) + ' ' + n(-10 * s) + '" stroke="' + skin + '" stroke-width="' + n(3.4 * s) + '" stroke-linecap="round"/>';
    return g;
  }
  function board(x, y, w, h, col, z, inner) {
    var p = iso(x, y, z || 0), X = p[0], Y = p[1];
    return '<rect x="' + (X - 2) + '" y="' + (Y - 22) + '" width="4" height="22" fill="#33415C"/>' +
      '<rect x="' + (X - w / 2) + '" y="' + (Y - 22 - h) + '" width="' + w + '" height="' + h + '" rx="6" fill="' + col + '" stroke="#0F1F4B" stroke-width="2"/>' +
      (inner ? '<g transform="translate(' + n(X - w / 2) + ' ' + n(Y - 22 - h) + ')">' + inner + '</g>' : '');
  }
  function star(cx, cy, r, fill, extra) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      pts.push(n(cx + Math.cos(a) * rr) + ',' + n(cy + Math.sin(a) * rr));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + fill + '" ' + (extra || '') + '/>';
  }
  function plankRow(sc, axis, a1, a2, c, style, gapLayer) {
    var col = style === 'k' ? ['#FFD8A8', '#E8A66E', '#D48C55'] : ['#DDE6F3', '#8FA3C4', '#73879F'];
    var step = 0.375, idx = 0;
    for (var t = a1; t < a2 - 0.01; t += step, idx++) {
      var svg = axis === 'x' ? box(t, c - 0.5, step - 0.06, 1, 3, col, -3) : box(c - 0.5, t, 1, step - 0.06, 3, col, -3);
      var d = axis === 'x' ? t + c : c + t;
      if (gapLayer && idx === 2) {
        sc.add(d, svg, gapLayer);
        var hole = axis === 'x' ? tile(t, c - 0.5, step - 0.06, 1, 'none', 0, 'stroke="#FF6B57" stroke-width="2.5" stroke-dasharray="5 4"') : tile(c - 0.5, t, 1, step - 0.06, 'none', 0, 'stroke="#FF6B57" stroke-width="2.5" stroke-dasharray="5 4"');
        sc.add(d, hole, '!' + gapLayer);
      } else sc.add(d, svg);
    }
    // barandas
    var r1a, r1b, r2a, r2b;
    if (axis === 'x') { r1a = iso(a1, c - 0.5, 12); r1b = iso(a2, c - 0.5, 12); r2a = iso(a1, c + 0.5, 12); r2b = iso(a2, c + 0.5, 12); }
    else { r1a = iso(c - 0.5, a1, 12); r1b = iso(c - 0.5, a2, 12); r2a = iso(c + 0.5, a1, 12); r2b = iso(c + 0.5, a2, 12); }
    var rc = style === 'k' ? C.coral : C.blue;
    sc.add((axis === 'x' ? a1 + c : c + a1) - 0.6, '<line x1="' + n(r1a[0]) + '" y1="' + n(r1a[1]) + '" x2="' + n(r1b[0]) + '" y2="' + n(r1b[1]) + '" stroke="' + rc + '" stroke-width="3" stroke-linecap="round"/>');
    sc.add((axis === 'x' ? a2 + c : c + a2) + 0.6, '<line x1="' + n(r2a[0]) + '" y1="' + n(r2a[1]) + '" x2="' + n(r2b[0]) + '" y2="' + n(r2b[1]) + '" stroke="' + rc + '" stroke-width="3" stroke-linecap="round"/>');
  }
  function pathCells(sc, cells, fill, layer) {
    cells.forEach(function (c) { sc.add(-500 + c[0] + c[1], tile(c[0] + 0.06, c[1] + 0.06, (c[2] || 1) - 0.12, (c[3] || 1) - 0.12, fill, 0.5), layer); });
  }
  function glowAt(x, y, z, r, turq) {
    var p = iso(x, y, z || 0);
    return '<circle cx="' + n(p[0]) + '" cy="' + n(p[1]) + '" r="' + (r || 40) + '" fill="url(#' + (turq ? 'gGlowT' : 'gGlow') + ')"/>';
  }
  function building(x, y, w, d, h, palette, z, winCol) {
    var s = box(x, y, w, d, h, palette, z || 0);
    z = z || 0; winCol = winCol || '#BFE6FF';
    for (var u = 0.25; u < w - 0.3; u += 0.6) for (var v = 10; v < h - 8; v += 15)
      s += poly([iso(x + u, y + d, z + v + 9), iso(x + u + 0.38, y + d, z + v + 9), iso(x + u + 0.38, y + d, z + v), iso(x + u, y + d, z + v)], winCol);
    for (var u2 = 0.25; u2 < d - 0.3; u2 += 0.6) for (var v2 = 10; v2 < h - 8; v2 += 15)
      s += poly([iso(x + w, y + u2, z + v2 + 9), iso(x + w, y + u2 + 0.38, z + v2 + 9), iso(x + w, y + u2 + 0.38, z + v2), iso(x + w, y + u2, z + v2)], winCol, 'opacity=".85"');
    return s;
  }
  function dimOverlay() {
    return '<rect x="' + VB.x + '" y="' + VB.y + '" width="' + VB.w + '" height="' + VB.h + '" fill="#E3E9F2" opacity=".62"/>';
  }
  function at(x, y, z) { return iso(x, y, z); }

  /* =========================================================
     ESCENA: ENTRADA
     ========================================================= */
  function entrada() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'k', 30);
    // mitad adultos (derecha) con plaza clara
    sc.add(-900, tile(7.6, 1.4, 5, 5, '#EEF3FA', 0.4));
    // plaza central
    sc.add(-600, tile(5.6, 5.6, 2.8, 2.8, C.sand, 0.6) + tile(6.3, 6.3, 1.4, 1.4, '#FFE39A', 0.8));
    // caminos
    pathCells(sc, [[6.5, 8.4, 1, 1], [6.5, 9.4, 1, 1], [6.5, 10.4, 1, 1], [6.5, 11.4, 1, 1]], C.sand);
    pathCells(sc, [[8.4, 6.5, 1, 1], [9.4, 6.5, 1, 1], [10.4, 6.5, 1, 1], [11.4, 6.5, 1, 1]], '#FFFFFF');
    // fuente del centro
    var f = at(7, 7, 0);
    sc.add(14, '<ellipse cx="' + f[0] + '" cy="' + f[1] + '" rx="28" ry="14" fill="#5BC8F5" stroke="#1F4FD8" stroke-width="3"/>' +
      '<path class="spark" d="M' + f[0] + ' ' + (f[1] - 4) + ' q-8 -22 0 -30 q8 8 0 30" fill="#BDF0FF"/>');
    // faro del fondo
    var b = at(3, 3, 0);
    sc.add(6, box(2.6, 2.6, 0.8, 0.8, 70, ['#FFFFFF', '#FF8A6B', '#F06A50']) +
      '<rect x="' + (b[0] - 6) + '" y="' + (b[1] - 98) + '" width="12" height="16" rx="4" fill="#FFE37A" stroke="#0F1F4B" stroke-width="2"/>' +
      '<circle cx="' + b[0] + '" cy="' + (b[1] - 90) + '" r="34" fill="url(#gGlow)" class="pulse"/>');
    // puerta infantil: arco redondeado
    var g = at(7, 12.4, 0);
    sc.add(19.4, '<path d="M' + (g[0] - 34) + ' ' + g[1] + ' v-40 a34 34 0 0 1 68 0 v40" stroke="#FF6B57" stroke-width="12" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (g[0] - 34) + ' ' + g[1] + ' v-40 a34 34 0 0 1 68 0 v40" stroke="#FFC83D" stroke-width="4" fill="none" stroke-dasharray="2 12" stroke-linecap="round"/>' +
      '<circle cx="' + (g[0] - 44) + '" cy="' + (g[1] - 74) + '" r="10" fill="#17BFAE"/><path d="M' + (g[0] - 44) + ' ' + (g[1] - 64) + ' q4 14 -2 24" stroke="#33415C" fill="none"/>' +
      '<circle cx="' + (g[0] + 46) + '" cy="' + (g[1] - 80) + '" r="11" fill="#FFC83D"/><path d="M' + (g[0] + 46) + ' ' + (g[1] - 69) + ' q-4 14 2 24" stroke="#33415C" fill="none"/>');
    // puerta adultos: pabellón moderno
    sc.add(19.4, box(11.4, 6, 1.4, 2, 6, ['#DDE6F3', '#8FA3C4', '#73879F']) +
      box(11.5, 6.05, 0.25, 0.25, 54, [C.blue, C.blueD, C.blueD], 6) + box(11.5, 7.7, 0.25, 0.25, 54, [C.blue, C.blueD, C.blueD], 6) +
      box(11.3, 5.9, 1.6, 2.2, 6, ['#17BFAE', '#0E9A8C', '#0E9A8C'], 60));
    // árboles y detalles
    [[2, 9, 1.1], [3.2, 11.2, 0.9], [1.8, 6.5, 0.8], [4.6, 2, 0.8], [9.5, 2.2, 0.9, 'a'], [11.8, 3.8, 1, 'a'], [10, 11, 0.9], [12, 10, 0.8, 'a'], [4.5, 10, 0.7]].forEach(function (t) {
      sc.add(t[0] + t[1], tree(t[0], t[1], t[2], t[3]));
    });
    [[5, 11, C.coral], [4.2, 9.6, C.yellow], [9.6, 4, C.turq], [10.5, 9.8, C.coral], [3, 7.5, C.blue]].forEach(function (fl) { sc.add(fl[0] + fl[1], flower(fl[0], fl[1], fl[2])); });
    // islitas lejanas
    island(sc, -1.6, 13.6, 1.6, 1.6, 'k', 12);
    sc.add(15.6, tree(-0.8, 14.4, 0.7));
    island(sc, 13.4, -1.4, 1.6, 1.6, 'a', 12);
    sc.add(12.6, building(13.6, -1.2, 1, 1, 34, ['#FFFFFF', '#2D5FD8', '#1D45AD']));
    return {
      svg: sc.out(),
      anchors: { ninos: [7, 12.4, 20], adultos: [12.2, 7, 30], faro: [3, 3, 80] },
      desc: 'Una gran isla luminosa. En el centro, una plaza con una fuente. Un camino de arena lleva a la izquierda hasta un arco de colores: el espacio de niños. Un camino blanco lleva a la derecha hasta un pabellón moderno: el espacio de jóvenes y adultos. Al fondo brilla un faro.'
    };
  }

  /* =========================================================
     ESCENA: MAPA (hub). Misma geometría, dos estilos.
     Islas: P (izq), M (arriba), C (centro), V (der), B (abajo)
     ========================================================= */
  function hub(style) {
    var k = style === 'k', sc = new Scene();
    island(sc, 5, 0, 3.5, 3.5, style);
    island(sc, 0, 5, 3.5, 3.5, style);
    island(sc, 5, 5, 4, 4, style, 28);
    island(sc, 10.5, 5, 3.5, 3.5, style);
    island(sc, 5, 10.5, 3.5, 3.5, style);
    // puentes
    plankRow(sc, 'x', 3.5, 5, 6.75, style, 'tabla');
    plankRow(sc, 'y', 3.5, 5, 6.75, style);
    plankRow(sc, 'x', 9, 10.5, 6.75, style);
    plankRow(sc, 'y', 9, 10.5, 6.75, style);
    // luces de conexión sobre cada puente (al completar la misión)
    [['P', 4.25, 6.75], ['M', 6.75, 4.25], ['V', 9.75, 6.75], ['B', 6.75, 9.75]].forEach(function (b) {
      sc.add(b[1] + b[2] + 0.5, glowAt(b[1], b[2], 6, 30, true), 'done-' + b[0]);
    });
    // caminos del centro
    var pc = k ? C.sand : '#FFFFFF';
    pathCells(sc, [[5, 6.25, 1, 1.0], [6, 6.25, 1, 1], [7, 6.25, 1, 1], [6.25, 7.25, 1, 1], [6.25, 8.1, 1, 0.9]], pc);
    sc.add(-480, tile(8.06, 6.31, 0.88, 0.88, '#33415C', 0.5, 'opacity=".55"'), '!piedra');
    sc.add(-480, tile(8.06, 6.31, 0.88, 0.88, pc, 0.5), 'piedra');
    var hs = at(8.5, 6.75, 0);
    sc.add(16, '<circle cx="' + hs[0] + '" cy="' + (hs[1] - 3) + '" r="9" fill="none" stroke="#FF6B57" stroke-width="2.5" stroke-dasharray="4 4"/>', '!piedra');
    sc.add(16, '<ellipse cx="' + hs[0] + '" cy="' + (hs[1] - 4) + '" rx="10" ry="7" fill="#9AA7BD"/><ellipse cx="' + (hs[0] - 3) + '" cy="' + (hs[1] - 7) + '" rx="4" ry="2" fill="#D6DEEA"/>', 'piedra');
    // escenario
    var es = at(6.1, 6.1, 12);
    if (k) {
      sc.add(12, box(5.3, 5.3, 1.6, 1.6, 12, ['#FFD36B', '#FF8A6B', '#F06A50'], 0, 6) +
        '<path d="M' + (es[0] - 28) + ' ' + es[1] + ' v-26 a28 28 0 0 1 56 0 v26" stroke="#1F4FD8" stroke-width="8" fill="none" stroke-linecap="round"/>');
    } else {
      sc.add(12, box(5.3, 5.3, 1.6, 1.6, 10, ['#DDE6F3', '#2D5FD8', '#1D45AD']) +
        '<rect x="' + (es[0] - 32) + '" y="' + (es[1] - 58) + '" width="64" height="40" rx="3" fill="#0F1F4B"/>' +
        '<rect x="' + (es[0] - 36) + '" y="' + (es[1] - 62) + '" width="4" height="62" fill="#33415C"/><rect x="' + (es[0] + 32) + '" y="' + (es[1] - 62) + '" width="4" height="62" fill="#33415C"/>');
    }
    sc.add(12.1, '<rect x="' + (es[0] - 26) + '" y="' + (es[1] - 54) + '" width="52" height="32" rx="3" fill="#9FB0C8"/>', '!lit');
    sc.add(12.1, (k ? '' : '<rect x="' + (es[0] - 28) + '" y="' + (es[1] - 55) + '" width="56" height="34" rx="2" fill="#17BFAE"/><path d="M' + (es[0] - 20) + ' ' + (es[1] - 30) + ' l10 -12 l8 7 l10 -14 l12 19z" fill="#FFC83D"/>') + glowAt(6.1, 6.1, 50, 46), 'lit');
    // estrella del escenario (pieza infantil)
    if (k) {
      sc.add(12.2, star(es[0], es[1] - 50, 15, 'none', 'stroke="#FF6B57" stroke-width="2.5" stroke-dasharray="4 3"'), '!estrella');
      sc.add(12.2, star(es[0], es[1] - 50, 16, '#FFC83D', 'stroke="#E8A91A" stroke-width="2"'), 'estrella');
    }
    // faro de la misión final
    var fb = at(8.3, 8.3, 0);
    sc.add(16.6, box(7.95, 7.95, 0.7, 0.7, 46, k ? ['#FFFFFF', '#17BFAE', '#0E9A8C'] : ['#FFFFFF', '#1F4FD8', '#163A9E']) +
      '<circle cx="' + fb[0] + '" cy="' + (fb[1] - 60) + '" r="10" fill="#C9D3E2" stroke="#0F1F4B" stroke-width="2"/>');
    sc.add(16.7, '<circle cx="' + fb[0] + '" cy="' + (fb[1] - 60) + '" r="10" fill="#FFE37A" stroke="#0F1F4B" stroke-width="2"/>' + '<circle cx="' + fb[0] + '" cy="' + (fb[1] - 60) + '" r="48" fill="url(#gGlow)" class="pulse"/>', 'final-on');
    sc.add(16.7, '<circle cx="' + fb[0] + '" cy="' + (fb[1] - 60) + '" r="40" fill="url(#gGlowT)"/>', 'done-C');
    // faroles
    [[5.4, 8.6], [8.6, 5.4]].forEach(function (l) {
      sc.add(l[0] + l[1], lamp(l[0], l[1], style));
      sc.add(l[0] + l[1] + 0.1, lampGlow(l[0], l[1]), 'lit');
    });

    /* --- Islas satélite --- */
    if (k) {
      // P: patio (tobogán y hamaca)
      sc.add(6.8, box(0.8, 5.6, 0.6, 0.6, 30, ['#FFC83D', '#E8A91A', '#D4951A'], 0, 4));
      var sl = at(1.4, 5.9, 30), sl2 = at(2.8, 6.0, 0);
      sc.add(7.6, '<path d="M' + sl[0] + ' ' + sl[1] + ' Q ' + (sl[0] + 20) + ' ' + (sl[1] + 30) + ' ' + sl2[0] + ' ' + sl2[1] + '" stroke="#FF6B57" stroke-width="9" fill="none" stroke-linecap="round"/>');
      var sw = at(1.6, 7.6, 0);
      sc.add(9.2, '<path d="M' + (sw[0] - 20) + ' ' + sw[1] + ' l6 -40 h28 l6 40" stroke="#1F4FD8" stroke-width="4" fill="none"/><line x1="' + (sw[0] - 4) + '" y1="' + (sw[1] - 40) + '" x2="' + (sw[0] - 4) + '" y2="' + (sw[1] - 14) + '" stroke="#33415C"/><line x1="' + (sw[0] + 6) + '" y1="' + (sw[1] - 40) + '" x2="' + (sw[0] + 6) + '" y2="' + (sw[1] - 14) + '" stroke="#33415C"/><rect x="' + (sw[0] - 7) + '" y="' + (sw[1] - 15) + '" width="16" height="4" rx="2" fill="#FF6B57"/>');
      sc.add(8.6, tree(0.6, 8, 0.7));
      // M: mensaje (buzón y barrilete)
      var bz = at(6.4, 1.8, 0);
      sc.add(8.2, '<rect x="' + (bz[0] - 2) + '" y="' + (bz[1] - 30) + '" width="4" height="30" fill="#33415C"/><rect x="' + (bz[0] - 14) + '" y="' + (bz[1] - 48) + '" width="28" height="20" rx="9" fill="#FF6B57" stroke="#0F1F4B" stroke-width="2"/><rect x="' + (bz[0] - 8) + '" y="' + (bz[1] - 41) + '" width="16" height="3" rx="1.5" fill="#0F1F4B"/>');
      sc.add(6, tree(7.8, 0.6, 0.9));
      var kt = at(5.4, 0.4, 90);
      sc.add(5.8, '<polygon points="' + kt[0] + ',' + (kt[1] - 18) + ' ' + (kt[0] + 13) + ',' + kt[1] + ' ' + kt[0] + ',' + (kt[1] + 18) + ' ' + (kt[0] - 13) + ',' + kt[1] + '" fill="#FFC83D" stroke="#0F1F4B" stroke-width="2"/><path d="M' + kt[0] + ' ' + (kt[1] + 18) + ' q10 20 -4 34 q-10 14 4 30" stroke="#0F1F4B" fill="none" stroke-width="1.5"/>');
      // V: ronda de voces (anfiteatro)
      var am = at(12.25, 6.75, 0);
      sc.add(18.4, '<ellipse cx="' + am[0] + '" cy="' + am[1] + '" rx="44" ry="22" fill="#FFE39A" stroke="#E8A91A" stroke-width="3"/><ellipse cx="' + am[0] + '" cy="' + am[1] + '" rx="26" ry="13" fill="#FFF6DC"/>');
      [[11.4, 6.1, C.coral], [13.1, 7.4, C.blue], [12.6, 5.9, C.turq]].forEach(function (f) { sc.add(f[0] + f[1] + 0.5, figure(f[0], f[1], f[2], { s: 0.8 })); });
      // B: construcción (bloques y grúa)
      sc.add(17.2, box(5.6, 11, 0.8, 0.8, 14, ['#FFC83D', '#E8A91A', '#D4951A'], 0, 4) + box(5.7, 11.1, 0.6, 0.6, 12, ['#FF8A6B', '#F06A50', '#E04F3D'], 14, 4));
      sc.add(19, box(7.4, 11.2, 0.25, 0.25, 70, [C.blue, C.blueD, C.blueD]));
      var cr = at(7.5, 11.3, 70), cr2 = at(5.9, 11.3, 70);
      sc.add(19.1, '<line x1="' + cr[0] + '" y1="' + cr[1] + '" x2="' + cr2[0] + '" y2="' + cr2[1] + '" stroke="#1F4FD8" stroke-width="5"/><line x1="' + (cr2[0] + 8) + '" y1="' + cr2[1] + '" x2="' + (cr2[0] + 8) + '" y2="' + (cr2[1] + 20) + '" stroke="#33415C"/>');
      sc.add(20, tree(7.6, 13.4, 0.7));
    } else {
      // P: centro de eventos con jardín
      sc.add(6.6, building(0.4, 5.4, 2, 1.4, 34, ['#FFFFFF', '#2D5FD8', '#1D45AD']));
      sc.add(7.5, box(1.4, 6.8, 1, 0.5, 3, ['#DDE6F3', '#8FA3C4', '#73879F']));
      sc.add(-400, tile(0.4, 7.2, 2.6, 1, '#5FD3B8', 0.6));
      [[0.7, 7.8], [1.6, 8.1], [2.6, 7.7]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], 0.55, 'a')); });
      // M: torre del estudio digital
      sc.add(5.6, building(6, 0.8, 1.4, 1.4, 120, ['#FFFFFF', '#1F4FD8', '#163A9E']));
      var an = at(6.7, 1.5, 120);
      sc.add(5.7, '<line x1="' + an[0] + '" y1="' + an[1] + '" x2="' + an[0] + '" y2="' + (an[1] - 26) + '" stroke="#33415C" stroke-width="2"/><circle cx="' + an[0] + '" cy="' + (an[1] - 28) + '" r="4" fill="#FF6B57"/>');
      sc.add(4, tree(5.4, 2.8, 0.6, 'a'));
      // V: centro cultural con mirador
      sc.add(16.2, building(11, 5.4, 2, 1.8, 40, ['#FFFFFF', '#17BFAE', '#0E9A8C'], 0, '#E9FFFB'));
      sc.add(16.5, box(11.3, 5.7, 1, 1, 4, ['#FFC83D', '#E8A91A', '#D4951A'], 40));
      var mr = at(11.8, 6.2, 44);
      sc.add(16.6, '<path d="M' + (mr[0] - 20) + ' ' + mr[1] + ' v-14 M' + (mr[0] + 20) + ' ' + mr[1] + ' v-14" stroke="#0F1F4B" stroke-width="2"/>');
      sc.add(20, tree(13.5, 7.9, 0.6, 'a'));
      // B: barrio con casas
      [[5.4, 11, '#FF6B57'], [6.9, 11.2, '#FFC83D'], [5.6, 12.6, '#17BFAE']].forEach(function (h) {
        sc.add(h[0] + h[1], building(h[0], h[1], 1.1, 1, 26, ['#FFFFFF', h[2], h[2]], 0, '#FFFFFF'));
      });
      sc.add(21, tree(7.8, 13.4, 0.6, 'a'));
      // pistas del código
      sc.add(14.2, board(8.6, 5.6, 46, 30, '#FFFFFF', 0, '<rect x="6" y="7" width="34" height="4" rx="2" fill="#1F4FD8"/><rect x="6" y="15" width="26" height="3" rx="1.5" fill="#33415C"/><rect x="6" y="21" width="30" height="3" rx="1.5" fill="#33415C"/>'));
      sc.add(14.2, board(5.6, 8.6, 50, 34, '#FFF6DC', 0, '<path d="M8 26 q10 -18 18 -6 t18 -12" stroke="#FF6B57" stroke-width="3" fill="none" stroke-dasharray="4 3"/><circle cx="8" cy="26" r="3" fill="#1F4FD8"/><circle cx="44" cy="8" r="3" fill="#17BFAE"/>'));
      // banderines del escenario
      [[-22, C.coral], [-7, C.yellow], [8, C.turq], [23, C.blue]].forEach(function (b) {
        sc.add(12.3, '<polygon points="' + (es[0] + b[0] - 6) + ',' + (es[1] - 72) + ' ' + (es[0] + b[0] + 6) + ',' + (es[1] - 72) + ' ' + (es[0] + b[0]) + ',' + (es[1] - 60) + '" fill="' + b[1] + '"/>');
      });
    }
    // piezas escondidas (niños)
    if (k) {
      var pt = at(7.6, 12.8, 0);
      sc.add(20.5, '<g transform="rotate(-18 ' + pt[0] + ' ' + pt[1] + ')"><rect x="' + (pt[0] - 18) + '" y="' + (pt[1] - 8) + '" width="36" height="10" rx="2" fill="#E8A66E" stroke="#8A5A3C" stroke-width="2"/><path d="M' + (pt[0] - 12) + ' ' + (pt[1] - 3) + ' h24" stroke="#8A5A3C" stroke-width="1.2"/></g>', '!got-tabla');
      var ps = at(5.8, 1.4, 0);
      sc.add(7.3, star(ps[0], ps[1] - 8, 10, '#FFC83D', 'stroke="#E8A91A" stroke-width="2"') + '<circle cx="' + ps[0] + '" cy="' + (ps[1] - 8) + '" r="18" fill="url(#gGlow)"/>', '!got-estrella');
      var pp = at(13.2, 7.8, 0);
      sc.add(21.1, '<ellipse cx="' + pp[0] + '" cy="' + (pp[1] - 5) + '" rx="10" ry="7" fill="#9AA7BD" stroke="#5E6B82" stroke-width="2"/>', '!got-piedra');
    }
    // secretos (detalles que aparecen en el paisaje)
    var s1 = at(2.4, 4.2, 110);
    sc.add(50, '<g class="float"><polygon points="' + s1[0] + ',' + (s1[1] - 14) + ' ' + (s1[0] + 10) + ',' + s1[1] + ' ' + s1[0] + ',' + (s1[1] + 14) + ' ' + (s1[0] - 10) + ',' + s1[1] + '" fill="#FF6B57"/><path d="M' + s1[0] + ' ' + (s1[1] + 14) + ' q8 16 -4 30" stroke="#0F1F4B" fill="none" stroke-width="1.5"/></g>', 'sec-1');
    var s2 = at(10.5, 1.8, 120);
    sc.add(50, '<path d="M' + (s2[0] - 70) + ' ' + (s2[1] + 40) + ' a70 70 0 0 1 140 0" stroke="#FF6B57" stroke-width="6" fill="none" opacity=".75"/><path d="M' + (s2[0] - 62) + ' ' + (s2[1] + 40) + ' a62 62 0 0 1 124 0" stroke="#FFC83D" stroke-width="6" fill="none" opacity=".75"/><path d="M' + (s2[0] - 54) + ' ' + (s2[1] + 40) + ' a54 54 0 0 1 108 0" stroke="#17BFAE" stroke-width="6" fill="none" opacity=".75"/>', 'sec-2');
    var s3 = at(11.5, 11.5, 0);
    sc.add(50, '<path class="fish" d="M' + s3[0] + ' ' + s3[1] + ' q12 -10 24 0 q-12 10 -24 0 l-8 -6 v12z" fill="#FFC83D" stroke="#0F1F4B" stroke-width="1.5"/>', 'sec-3');
    var s4 = at(0.8, 10.6, 60);
    sc.add(50, '<path d="M' + s4[0] + ' ' + s4[1] + ' q6 -6 12 0 q6 -6 12 0" stroke="#0F1F4B" stroke-width="2" fill="none"/><path d="M' + (s4[0] + 30) + ' ' + (s4[1] - 14) + ' q5 -5 10 0 q5 -5 10 0" stroke="#0F1F4B" stroke-width="2" fill="none"/>', 'sec-4');
    sc.add(50, bunting([5.2, 9, 40], [9, 5.2, 40]), 'sec-5');
    // banderines de misión completa
    [['P', [0.3, 5.3, 34], [3.2, 5.3, 34]], ['M', [5.3, 0.3, 34], [8.2, 0.3, 34]], ['V', [10.8, 8.2, 30], [13.7, 8.2, 30]], ['B', [5.3, 13.7, 26], [8.2, 13.7, 26]]].forEach(function (b) {
      sc.add(30, bunting(b[1], b[2]), 'done-' + b[0]);
    });
    sc.add(9000, dimOverlay(), '!lit');
    var anchors = {
      P: [1.75, 6.75, 40], M: [6.75, 1.75, 40], V: [12.25, 6.75, 40], B: [6.75, 12.25, 40], C: [8.3, 8.3, 70],
      'slot-tabla': [4.25, 6.75, 6], 'slot-estrella': [6.1, 6.1, 62], 'slot-piedra': [8.5, 6.75, 4],
      'piece-tabla': [7.6, 12.8, 6], 'piece-estrella': [5.8, 1.4, 16], 'piece-piedra': [13.2, 7.8, 6],
      cartel: [8.6, 5.6, 46], escenario: [6.1, 6.1, 70], mapa: [5.6, 8.6, 50]
    };
    return {
      svg: sc.out(), anchors: anchors,
      desc: k
        ? 'Un archipiélago de islas redondeadas unidas por puentes de madera. En el centro hay una plaza con un escenario y un faro. Alrededor: el patio con tobogán, la isla del buzón y el barrilete, la ronda de las voces y la isla de construcción.'
        : 'Un archipiélago de plazas modernas unidas por puentes. En el centro hay un escenario con pantalla y un faro. Alrededor: el centro de eventos con jardín, la torre del estudio digital, el centro cultural con mirador y el barrio.'
    };
  }

  /* =========================================================
     MISIONES INFANTILES
     ========================================================= */
  function patio() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'k', 26);
    // camino de piedras sueltas (antes)
    var stones = [[11.5, 7], [10.5, 7.2], [9.5, 6.8], [8.5, 7.1], [7.5, 6.9], [6.5, 7.2], [5.5, 6.8], [4.6, 6.4], [4.4, 5.4], [4.6, 4.4]];
    stones.forEach(function (s, i) {
      var p = at(s[0], s[1], 0);
      sc.add(-300 + s[0] + s[1], '<ellipse cx="' + p[0] + '" cy="' + (p[1] - 2) + '" rx="' + (7 + (i % 3) * 2) + '" ry="5" fill="#B9C3D3" stroke="#7E8BA3" stroke-width="1.5"/><ellipse cx="' + (p[0] + 9) + '" cy="' + (p[1] + 3) + '" rx="4" ry="3" fill="#B9C3D3"/>', '!camino_liso');
    });
    // camino liso (después)
    pathCells(sc, [[11, 6.5], [10, 6.5], [9, 6.5], [8, 6.5], [7, 6.5], [6, 6.5], [5, 6.5], [4, 6.5], [4, 5.5], [4, 4.5]], C.sand, 'camino_liso');
    // tobogán
    sc.add(5, box(2.2, 2.4, 1, 1, 34, ['#FFC83D', '#E8A91A', '#D4951A'], 0, 5));
    var t1 = at(3.2, 2.9, 34), t2 = at(5.2, 2.6, 2);
    sc.add(7, '<path d="M' + t1[0] + ' ' + t1[1] + ' Q ' + (t1[0] + 30) + ' ' + (t1[1] + 30) + ' ' + t2[0] + ' ' + t2[1] + '" stroke="#FF6B57" stroke-width="13" fill="none" stroke-linecap="round"/>');
    var lad = at(2.7, 3.4, 0);
    sc.add(6.2, '<g stroke="#1F4FD8" stroke-width="3"><line x1="' + (lad[0] - 8) + '" y1="' + lad[1] + '" x2="' + (lad[0] - 8) + '" y2="' + (lad[1] - 36) + '"/><line x1="' + (lad[0] + 4) + '" y1="' + (lad[1] + 4) + '" x2="' + (lad[0] + 4) + '" y2="' + (lad[1] - 32) + '"/>' +
      [6, 14, 22, 30].map(function (v) { return '<line x1="' + (lad[0] - 8) + '" y1="' + (lad[1] - v) + '" x2="' + (lad[0] + 4) + '" y2="' + (lad[1] - v + 4) + '"/>'; }).join('') + '</g>');
    // rampa al tobogán
    sc.add(6.4, poly([at(2.2, 3.4, 34), at(3.2, 3.4, 34), at(3.2, 6.2, 0), at(2.2, 6.2, 0)], '#7FD6FF', 'stroke="#1F4FD8" stroke-width="2"') +
      '<line x1="' + at(2.2, 3.4, 44)[0] + '" y1="' + at(2.2, 3.4, 44)[1] + '" x2="' + at(2.2, 6.2, 10)[0] + '" y2="' + at(2.2, 6.2, 10)[1] + '" stroke="#1F4FD8" stroke-width="3"/>', 'rampa');
    // cartel de reglas
    sc.add(9.5, board(7, 2.6, 66, 46, '#FFFFFF', 0,
      '<g fill="#33415C">' + [8, 14, 20, 26, 32, 38].map(function (y) { return '<rect x="7" y="' + y + '" width="' + (52 - (y % 3) * 6) + '" height="2.4" rx="1"/>'; }).join('') + '</g>'), '!reglas_dibujos');
    sc.add(9.5, board(7, 2.6, 66, 46, '#FFFFFF', 0,
      '<circle cx="14" cy="14" r="6" fill="#FFC83D"/><path d="M10 34 l6 -10 l6 10z" fill="#1F4FD8"/><rect x="28" y="8" width="12" height="12" rx="3" fill="#17BFAE"/><path d="M30 34 h10 M35 29 v10" stroke="#FF6B57" stroke-width="3"/><circle cx="54" cy="14" r="5" fill="#FF6B57"/><path d="M48 34 q6 -10 12 0" stroke="#0F1F4B" stroke-width="2.5" fill="none"/>'), 'reglas_dibujos');
    // tambores
    function drum(x, y, c) { var p = at(x, y, 0); return '<ellipse cx="' + p[0] + '" cy="' + (p[1] - 2) + '" rx="13" ry="6" fill="' + c + '"/><rect x="' + (p[0] - 13) + '" y="' + (p[1] - 20) + '" width="26" height="18" fill="' + c + '"/><ellipse cx="' + p[0] + '" cy="' + (p[1] - 20) + '" rx="13" ry="6" fill="#FFF6DC" stroke="#0F1F4B" stroke-width="1.5"/>'; }
    sc.add(19, drum(9.5, 9.5, C.coral) + drum(10.4, 9.1, C.blue));
    sc.add(20, drum(10.6, 10.2, C.turq) + drum(9.8, 10.6, C.yellow), 'mas_tambores');
    var sn = at(9.9, 9.4, 30);
    sc.add(20.2, '<g class="soundwaves" stroke="#FF6B57" stroke-width="3" fill="none" stroke-linecap="round"><path d="M' + (sn[0] + 20) + ' ' + (sn[1] - 6) + ' q8 8 0 16"/><path d="M' + (sn[0] + 28) + ' ' + (sn[1] - 12) + ' q14 14 0 28"/><path d="M' + (sn[0] - 20) + ' ' + (sn[1] - 6) + ' q-8 8 0 16"/></g>', '!tambores_suaves');
    sc.add(20.2, '<g fill="#FFFFFF" stroke="#17BFAE" stroke-width="2"><ellipse cx="' + at(9.5, 9.5, 20)[0] + '" cy="' + at(9.5, 9.5, 20)[1] + '" rx="10" ry="4"/><ellipse cx="' + at(10.4, 9.1, 20)[0] + '" cy="' + at(10.4, 9.1, 20)[1] + '" rx="10" ry="4"/></g><path d="M' + (sn[0] + 18) + ' ' + sn[1] + ' q5 5 0 10" stroke="#17BFAE" stroke-width="3" fill="none" stroke-linecap="round"/>', 'tambores_suaves');
    // arenero
    sc.add(13.5, box(3.5, 9.4, 1.8, 1.6, 4, ['#FFE39A', '#E8A66E', '#D48C55'], 0, 4) + '<circle cx="' + at(4.3, 10.1, 4)[0] + '" cy="' + at(4.3, 10.1, 4)[1] + '" r="5" fill="#FF6B57"/>');
    // rincón tranquilo
    var rt = at(2.4, 11.2, 0);
    sc.add(13.6, '<path d="M' + (rt[0] - 30) + ' ' + rt[1] + ' L ' + rt[0] + ' ' + (rt[1] - 44) + ' L ' + (rt[0] + 30) + ' ' + rt[1] + 'z" fill="#17BFAE" stroke="#0E9A8C" stroke-width="3" stroke-linejoin="round"/><path d="M' + (rt[0] - 8) + ' ' + rt[1] + ' L ' + rt[0] + ' ' + (rt[1] - 30) + ' L ' + (rt[0] + 8) + ' ' + rt[1] + 'z" fill="#0F1F4B" opacity=".35"/><ellipse cx="' + (rt[0] + 34) + '" cy="' + (rt[1] - 2) + '" rx="12" ry="6" fill="#FFC83D"/><ellipse cx="' + (rt[0] - 36) + '" cy="' + (rt[1] - 2) + '" rx="10" ry="5" fill="#FF6B57"/>', 'rincon_tranquilo');
    // huellas de dinosaurio
    var prints = '';
    [[10.5, 6.8], [9.2, 6.9], [7.8, 6.8], [6.4, 6.9], [5, 6.8]].forEach(function (h) { var p = at(h[0], h[1], 1); prints += '<g fill="#1F4FD8" opacity=".85"><ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="5" ry="3"/><circle cx="' + (p[0] - 5) + '" cy="' + (p[1] - 4) + '" r="1.8"/><circle cx="' + p[0] + '" cy="' + (p[1] - 5) + '" r="1.8"/><circle cx="' + (p[0] + 5) + '" cy="' + (p[1] - 4) + '" r="1.8"/></g>'; });
    sc.add(-200, prints, 'huellas');
    // pintura (cambio decorativo)
    sc.add(40, bunting([2, 1.3, 60], [12.6, 1.3, 60], [C.coral, C.yellow, C.turq, C.blue]) + bunting([12.6, 1.3, 60], [12.6, 12, 50]), 'pintar');
    // árboles
    [[1.6, 1.6, 1], [12, 3, 0.9], [1.8, 8, 0.8], [12, 12, 0.9], [6.5, 11.8, 0.8]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], t[2])); });
    [[8.5, 4.5, C.coral], [11, 9, C.yellow], [6, 9.5, C.turq], [3, 8.8, C.blue]].forEach(function (f) { sc.add(f[0] + f[1], flower(f[0], f[1], f[2])); });
    // niñas y niños jugando (al comprobar)
    sc.add(9.8, figure(4.6, 5.2, C.coral, { wheel: true, s: 1, skin: '#8D5A3B' }), 'test');
    sc.add(12.6, figure(3.4, 9.6, C.yellow, { s: 0.95, skin: '#F1C7A3', hair: '#C2562E' }), 'test');
    sc.add(10, figure(7.2, 3.6, C.turq, { s: 0.95, skin: '#C98B62', arm: true }), 'test');
    sc.add(17, figure(8.6, 8.4, C.blue, { s: 0.95, skin: '#6B4430', hair: '#1A1210' }), 'test');
    // secreto: caracol arcoíris
    var sn2 = at(12.3, 1.8, 0);
    sc.add(14.2, '<g><path d="M' + (sn2[0] - 10) + ' ' + sn2[1] + ' h22" stroke="#7FD6FF" stroke-width="5" stroke-linecap="round"/><circle cx="' + sn2[0] + '" cy="' + (sn2[1] - 8) + '" r="9" fill="#FF6B57"/><circle cx="' + sn2[0] + '" cy="' + (sn2[1] - 8) + '" r="5" fill="#FFC83D"/><circle cx="' + sn2[0] + '" cy="' + (sn2[1] - 8) + '" r="2" fill="#17BFAE"/></g>', 'secret');
    return {
      svg: sc.out(),
      anchors: { tobogan: [2.7, 2.9, 50], cartel: [7, 2.6, 80], tambores: [10, 9.8, 34], camino: [8, 7, 6], arenero: [4.4, 10.2, 14], secret: [12.3, 1.8, 10] },
      desc: 'El patio: un tobogán alto con escalera, un camino de piedras sueltas desde la entrada, un cartel con reglas escritas en letra chica, tambores muy sonoros y un arenero.'
    };
  }

  function mensaje() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'k', 26);
    sc.add(-400, tile(5, 5, 4, 4, C.sand, 0.5));
    var f = at(7, 7, 0);
    sc.add(14, '<ellipse cx="' + f[0] + '" cy="' + f[1] + '" rx="44" ry="22" fill="#5BC8F5" stroke="#1F4FD8" stroke-width="4"/><ellipse cx="' + f[0] + '" cy="' + (f[1] - 2) + '" rx="12" ry="6" fill="#1F4FD8"/><path class="spark" d="M' + f[0] + ' ' + (f[1] - 4) + ' q-14 -34 0 -46 q14 12 0 46" fill="#BDF0FF"/>');
    // botella en la orilla
    var bo = at(2.2, 11.6, 0);
    sc.add(13.8, '<g transform="rotate(-30 ' + bo[0] + ' ' + bo[1] + ')"><rect x="' + (bo[0] - 6) + '" y="' + (bo[1] - 22) + '" width="12" height="22" rx="4" fill="#9FE8D8" stroke="#0E9A8C" stroke-width="2"/><rect x="' + (bo[0] - 3) + '" y="' + (bo[1] - 28) + '" width="6" height="7" fill="#B0703F"/><rect x="' + (bo[0] - 3) + '" y="' + (bo[1] - 17) + '" width="6" height="9" fill="#FFFFFF"/></g>');
    // árbol con barrilete
    sc.add(12.4, tree(10, 2.4, 1.3));
    var kt = at(10.6, 2, 70);
    sc.add(12.5, '<polygon points="' + kt[0] + ',' + (kt[1] - 18) + ' ' + (kt[0] + 14) + ',' + kt[1] + ' ' + kt[0] + ',' + (kt[1] + 18) + ' ' + (kt[0] - 14) + ',' + kt[1] + '" fill="#FF6B57" stroke="#0F1F4B" stroke-width="2"/><line x1="' + (kt[0] - 14) + '" y1="' + kt[1] + '" x2="' + (kt[0] + 14) + '" y2="' + kt[1] + '" stroke="#0F1F4B"/><path d="M' + kt[0] + ' ' + (kt[1] + 18) + ' q10 14 -2 26" stroke="#0F1F4B" fill="none"/>');
    // buzón
    var bz = at(11, 10, 0);
    sc.add(21, '<rect x="' + (bz[0] - 3) + '" y="' + (bz[1] - 34) + '" width="6" height="34" fill="#33415C"/><rect x="' + (bz[0] - 18) + '" y="' + (bz[1] - 56) + '" width="36" height="26" rx="11" fill="#FFC83D" stroke="#0F1F4B" stroke-width="2"/><rect x="' + (bz[0] - 10) + '" y="' + (bz[1] - 46) + '" width="20" height="4" rx="2" fill="#0F1F4B"/><rect x="' + (bz[0] + 18) + '" y="' + (bz[1] - 56) + '" width="4" height="16" fill="#FF6B57"/>');
    // cómo se comparte el mensaje
    sc.add(10.2, board(5.4, 4.6, 58, 38, '#FFFFFF', 0, '<g fill="#1F4FD8"><rect x="7" y="8" width="44" height="4" rx="2"/><rect x="7" y="16" width="36" height="3" rx="1.5"/><rect x="7" y="23" width="40" height="3" rx="1.5"/></g>'), 'fmt-texto');
    var sp = at(9.2, 5, 0);
    sc.add(14.3, '<rect x="' + (sp[0] - 2) + '" y="' + (sp[1] - 34) + '" width="4" height="34" fill="#33415C"/><path d="M' + (sp[0] - 4) + ' ' + (sp[1] - 46) + ' l20 -12 v34 l-20 -12z" fill="#17BFAE" stroke="#0F1F4B" stroke-width="2"/><path d="M' + (sp[0] + 22) + ' ' + (sp[1] - 52) + ' q8 10 0 20 M' + (sp[0] + 28) + ' ' + (sp[1] - 58) + ' q14 16 0 32" stroke="#17BFAE" stroke-width="3" fill="none"/>', 'fmt-audio');
    sc.add(13, board(4.6, 8.6, 62, 40, '#FFF6DC', 0, '<g transform="translate(6 6)">' + '<path d="M2 26 q8 -24 16 0z" fill="#5BC8F5"/><circle cx="34" cy="12" r="9" fill="#FFC83D"/><circle cx="38" cy="10" r="8" fill="#FFF6DC"/><circle cx="46" cy="24" r="6" fill="#FF6B57"/></g>'), 'fmt-imagenes');
    // niñas y niños leyendo el mensaje
    sc.add(13.4, figure(6, 7.4, C.blue, { s: 0.95, skin: '#C98B62' }), 'test');
    sc.add(15, figure(8.2, 6.8, C.yellow, { s: 0.95, skin: '#F1C7A3', hair: '#7A4A20' }), 'test');
    sc.add(16, figure(7.6, 8.4, C.coral, { s: 0.95, skin: '#6B4430', hair: '#1A1210' }), 'test');
    // farolitos al completar
    sc.add(40, bunting([4.6, 4.6, 46], [9.4, 4.6, 46], [C.yellow, C.coral, C.turq]) + bunting([4.6, 4.6, 46], [4.6, 9.4, 46], [C.turq, C.yellow, C.blue]), 'done');
    // árboles
    [[2, 2, 1], [2.4, 7, 0.8], [12.2, 6, 0.9], [7.4, 12.2, 0.8]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], t[2])); });
    [[4, 3, C.coral], [11.4, 7.6, C.yellow], [9, 11.4, C.blue]].forEach(function (fl) { sc.add(fl[0] + fl[1], flower(fl[0], fl[1], fl[2])); });
    // secreto: pez que salta en la fuente
    sc.add(14.5, '<path class="fish" d="M' + (f[0] + 20) + ' ' + (f[1] - 30) + ' q10 -9 20 0 q-10 9 -20 0 l-7 -5 v10z" fill="#FFC83D" stroke="#0F1F4B" stroke-width="1.5"/>', 'secret');
    return {
      svg: sc.out(),
      anchors: { botella: [2.2, 11.6, 20], barrilete: [10.6, 2, 80], buzon: [11, 10, 60], secret: [7.3, 7.3, 26] },
      desc: 'Una plaza con una fuente en el centro. En la orilla hay una botella, en un árbol quedó enganchado un barrilete y cerca de la entrada hay un buzón amarillo.'
    };
  }

  function voces() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'k', 26);
    var c = at(7, 7, 0);
    sc.add(-300, '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="150" ry="75" fill="#FFE39A" stroke="#E8A91A" stroke-width="4"/><ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="100" ry="50" fill="#FFF1C9"/><ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="48" ry="24" fill="#FFE39A"/>');
    // pizarra de pictogramas
    sc.add(8, board(4, 3.6, 70, 46, '#FFFFFF', 0, '<rect x="6" y="6" width="16" height="16" rx="3" fill="#FFC83D"/><rect x="27" y="6" width="16" height="16" rx="3" fill="#17BFAE"/><rect x="48" y="6" width="16" height="16" rx="3" fill="#FF6B57"/><rect x="6" y="27" width="58" height="4" rx="2" fill="#33415C"/>'));
    // banco
    sc.add(19.6, box(9.6, 9.4, 1.6, 0.5, 8, ['#FFB38A', '#E8A66E', '#D48C55'], 0, 3));
    // ronda de chicos
    var kids = [[5.6, 6.6, C.coral, '#8D5A3B', '#1A1210'], [6.6, 5.5, C.turq, '#F1C7A3', '#C2562E'], [8.2, 6, C.blue, '#C98B62', '#3A2A20'], [8.6, 7.8, C.yellow, '#6B4430', '#1A1210'], [6.4, 8.6, '#9B7BFF', '#E0A882', '#5A3A20']];
    kids.forEach(function (k, i) { sc.add(k[0] + k[1], figure(k[0], k[1], k[2], { s: 1, skin: k[3], hair: k[4], arm: i === 2 })); });
    // actividades incorporadas
    var kt = at(3, 9.5, 110);
    sc.add(60, '<g class="float"><polygon points="' + kt[0] + ',' + (kt[1] - 16) + ' ' + (kt[0] + 12) + ',' + kt[1] + ' ' + kt[0] + ',' + (kt[1] + 16) + ' ' + (kt[0] - 12) + ',' + kt[1] + '" fill="#FF6B57" stroke="#0F1F4B" stroke-width="2"/><path d="M' + kt[0] + ' ' + (kt[1] + 16) + ' q-12 30 8 60" stroke="#0F1F4B" fill="none"/></g><g class="float"><polygon points="' + (kt[0] + 80) + ',' + (kt[1] - 40) + ' ' + (kt[0] + 90) + ',' + (kt[1] - 26) + ' ' + (kt[0] + 80) + ',' + (kt[1] - 12) + ' ' + (kt[0] + 70) + ',' + (kt[1] - 26) + '" fill="#FFC83D" stroke="#0F1F4B" stroke-width="2"/></g>', 'act-barriletes');
    var so = at(10.6, 4, 0), so2 = at(11.6, 5.8, 0);
    sc.add(15.2, '<path d="M' + so[0] + ' ' + (so[1] - 20) + ' Q ' + ((so[0] + so2[0]) / 2) + ' ' + (so[1] + 20) + ' ' + so2[0] + ' ' + (so2[1] - 20) + '" stroke="#FF6B57" stroke-width="4" fill="none"/>' + figure(10.6, 4, C.turq, { s: 0.8, arm: true }) + figure(11.6, 5.8, C.blue, { s: 0.8, arm: true }), 'act-soga');
    var tr = at(11.2, 11, 0);
    sc.add(22.3, '<rect x="' + (tr[0] - 16) + '" y="' + (tr[1] - 22) + '" width="32" height="20" rx="4" fill="#B0703F" stroke="#0F1F4B" stroke-width="2"/><path d="M' + (tr[0] - 16) + ' ' + (tr[1] - 22) + ' q16 -14 32 0" fill="#D48C55" stroke="#0F1F4B" stroke-width="2"/><rect x="' + (tr[0] - 3) + '" y="' + (tr[1] - 16) + '" width="6" height="7" fill="#FFC83D"/><circle cx="' + tr[0] + '" cy="' + (tr[1] - 30) + '" r="22" fill="url(#gGlow)"/>', 'act-tesoro');
    var gl = at(3.2, 5.6, 0);
    sc.add(8.9, '<path d="M' + (gl[0] - 20) + ' ' + gl[1] + ' v-28 h40 v28" stroke="#FFFFFF" stroke-width="4" fill="none"/><circle cx="' + (gl[0] + 30) + '" cy="' + (gl[1] + 8) + '" r="7" fill="#FFFFFF" stroke="#0F1F4B" stroke-width="2"/>', 'act-futbol');
    [[2, 2, 1], [12, 2.4, 0.9], [2, 12, 0.9], [12.2, 8.6, 0.8]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], t[2])); });
    // secreto: nido en el árbol
    var ni = at(12, 2.4, 50);
    sc.add(14.5, '<ellipse cx="' + ni[0] + '" cy="' + ni[1] + '" rx="12" ry="6" fill="#B0703F"/><circle cx="' + (ni[0] - 4) + '" cy="' + (ni[1] - 5) + '" r="4" fill="#FFFFFF"/><circle cx="' + (ni[0] + 4) + '" cy="' + (ni[1] - 5) + '" r="4" fill="#BDF0FF"/>', 'secret');
    return {
      svg: sc.out(),
      anchors: { ronda: [7, 7, 40], pizarra: [4, 3.6, 80], banco: [10.4, 9.6, 20], secret: [12, 2.4, 54] },
      desc: 'Una ronda en el centro de una plaza redonda. A un costado hay una pizarra con pictogramas y del otro lado un banco. Cinco chicas y chicos conversan en ronda.'
    };
  }

  var ZONES = { rio: [2.2, 11.4], centro: [7, 7], arbol: [3, 3], entrada: [11.4, 6.6] };
  function construccion() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'k', 26);
    // zona río: franja larga junto al agua
    sc.add(-450, tile(1.3, 10.6, 10.4, 1.6, '#BDEBFF', 0.5));
    sc.add(-440, '<path d="M' + at(1.5, 11.4, 1)[0] + ' ' + at(1.5, 11.4, 1)[1] + ' L ' + at(11.4, 11.4, 1)[0] + ' ' + at(11.4, 11.4, 1)[1] + '" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8 6"/>');
    // centro liso
    sc.add(-450, tile(5.4, 5.4, 3.2, 3.2, C.sand, 0.5));
    // árbol grande con sombra
    sc.add(-450, '<ellipse cx="' + at(3, 3)[0] + '" cy="' + at(3, 3)[1] + '" rx="70" ry="34" fill="#4FB98E" opacity=".45"/>');
    sc.add(5.5, tree(2.6, 2.6, 1.8));
    // entrada: arco visible
    var en = at(12.4, 6.6, 0);
    sc.add(19, '<path d="M' + (en[0] - 24) + ' ' + en[1] + ' v-30 a24 24 0 0 1 48 0 v30" stroke="#1F4FD8" stroke-width="9" fill="none" stroke-linecap="round"/>');
    sc.add(-450, tile(10.4, 5.8, 2.2, 1.6, '#FFFFFF', 0.5));
    // etiquetas de zonas (placas de suelo)
    function plate(x, y, col) { return tile(x - 0.35, y - 0.35, 0.7, 0.7, col, 0.8, 'stroke="#0F1F4B" stroke-width="1.5"'); }
    sc.add(-100, plate(2.2, 11.4, '#5BC8F5') + plate(7, 7, '#FFC83D') + plate(3, 3, '#2EC4A0') + plate(11.4, 6.6, '#FF6B57'));
    // ítems en cada zona
    function item(id, z) {
      var p = at(z[0], z[1], 0), X = p[0], Y = p[1];
      if (id === 'huellas') return [0, 1, 2].map(function (i) { return '<g fill="#1F4FD8"><ellipse cx="' + (X - 22 + i * 22) + '" cy="' + (Y - 4 + (i % 2) * 6) + '" rx="7" ry="4"/><circle cx="' + (X - 28 + i * 22) + '" cy="' + (Y - 10 + (i % 2) * 6) + '" r="2.4"/><circle cx="' + (X - 22 + i * 22) + '" cy="' + (Y - 11 + (i % 2) * 6) + '" r="2.4"/><circle cx="' + (X - 16 + i * 22) + '" cy="' + (Y - 10 + (i % 2) * 6) + '" r="2.4"/></g>'; }).join('');
      if (id === 'canciones') return '<ellipse cx="' + (X - 14) + '" cy="' + (Y - 2) + '" rx="12" ry="6" fill="#FF6B57"/><ellipse cx="' + (X + 14) + '" cy="' + (Y + 2) + '" rx="12" ry="6" fill="#17BFAE"/><path d="M' + (X - 2) + ' ' + (Y - 40) + ' v18 M' + (X - 2) + ' ' + (Y - 40) + ' l12 -4 v16" stroke="#0F1F4B" stroke-width="3" fill="none"/><circle cx="' + (X - 6) + '" cy="' + (Y - 22) + '" r="4" fill="#0F1F4B"/><circle cx="' + (X + 6) + '" cy="' + (Y - 26) + '" r="4" fill="#0F1F4B"/>';
      if (id === 'mapa') return '<rect x="' + (X - 2) + '" y="' + (Y - 20) + '" width="4" height="20" fill="#33415C"/><rect x="' + (X - 28) + '" y="' + (Y - 58) + '" width="56" height="40" rx="5" fill="#FFF6DC" stroke="#0F1F4B" stroke-width="2"/><path d="M' + (X - 20) + ' ' + (Y - 26) + ' q10 -16 20 -4 t20 -12" stroke="#FF6B57" stroke-width="3" fill="none" stroke-dasharray="4 3"/><circle cx="' + (X - 20) + '" cy="' + (Y - 26) + '" r="3" fill="#1F4FD8"/>';
      if (id === 'carrera') return '<path d="M' + (X - 40) + ' ' + (Y + 4) + ' L ' + (X + 40) + ' ' + (Y - 36) + '" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/><path d="M' + (X - 40) + ' ' + (Y + 4) + ' L ' + (X + 40) + ' ' + (Y - 36) + '" stroke="#FF6B57" stroke-width="2" stroke-dasharray="6 6"/><rect x="' + (X + 38) + '" y="' + (Y - 66) + '" width="3" height="30" fill="#33415C"/><polygon points="' + (X + 41) + ',' + (Y - 66) + ' ' + (X + 58) + ',' + (Y - 60) + ' ' + (X + 41) + ',' + (Y - 54) + '" fill="#FFC83D"/>';
      return '';
    }
    ['huellas', 'canciones', 'mapa', 'carrera'].forEach(function (id) {
      Object.keys(ZONES).forEach(function (z) {
        var zz = ZONES[z];
        sc.add(zz[0] + zz[1] + 0.3, item(id, zz), 'z-' + id + '-' + z);
      });
    });
    // equipo
    sc.add(13, figure(6.2, 7.6, C.coral, { wheel: true, skin: '#8D5A3B' }), 'test');
    sc.add(5, figure(4, 2.4, C.yellow, { skin: '#F1C7A3', hair: '#C2562E' }), 'test');
    sc.add(18, figure(11, 7.4, C.turq, { skin: '#C98B62', arm: true }), 'test');
    sc.add(14, figure(3.4, 10.8, C.blue, { skin: '#6B4430', hair: '#1A1210' }), 'test');
    sc.add(40, bunting([1.4, 1.4, 70], [12.6, 1.4, 60]), 'done');
    [[12, 2, 0.9], [8.6, 2, 0.7], [1.8, 7, 0.7]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], t[2])); });
    // secreto: casita de pájaros
    var bh = at(2.6, 2.6, 66);
    sc.add(5.6, '<rect x="' + (bh[0] + 10) + '" y="' + (bh[1] - 6) + '" width="14" height="14" fill="#FFC83D" stroke="#0F1F4B" stroke-width="1.5"/><polygon points="' + (bh[0] + 8) + ',' + (bh[1] - 6) + ' ' + (bh[0] + 17) + ',' + (bh[1] - 15) + ' ' + (bh[0] + 26) + ',' + (bh[1] - 6) + '" fill="#FF6B57"/><circle cx="' + (bh[0] + 17) + '" cy="' + (bh[1] + 1) + '" r="2.5" fill="#0F1F4B"/>', 'secret');
    return {
      svg: sc.out(),
      anchors: { rio: [2.2, 11.4, 20], centro: [7, 7, 20], arbol: [3, 3, 30], entrada: [11.4, 6.6, 34], secret: [3.2, 2.6, 70] },
      desc: 'Una isla dividida en cuatro zonas: junto al río hay una franja larga; en el centro, un suelo liso; en un rincón, un árbol grande con sombra; y a la derecha, el arco de entrada.'
    };
  }

  function finalNinos() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'k', 26);
    sc.add(-400, tile(4, 4, 6, 6, C.sand, 0.5));
    // escenario de la celebración
    var es = at(3.4, 3.4, 12);
    sc.add(6, box(2.2, 2.2, 2.4, 2.4, 12, ['#FFD36B', '#FF8A6B', '#F06A50'], 0, 6) + '<path d="M' + (es[0] - 40) + ' ' + es[1] + ' v-30 a40 40 0 0 1 80 0 v30" stroke="#1F4FD8" stroke-width="9" fill="none" stroke-linecap="round"/>');
    // escalones vs rampa
    sc.add(8.2, box(4.6, 3, 0.4, 1.2, 8, ['#FFB38A', '#E8A66E', '#D48C55']) + box(5, 3, 0.4, 1.2, 4, ['#FFB38A', '#E8A66E', '#D48C55']), '!rampa');
    sc.add(8.2, poly([at(4.6, 3, 12), at(4.6, 4.2, 12), at(6.4, 4.2, 0), at(6.4, 3, 0)], '#7FD6FF', 'stroke="#1F4FD8" stroke-width="2"'), 'rampa');
    // mesas
    function table(x, y, c) { return box(x, y, 1, 0.7, 8, ['#FFFFFF', c, c]) + '<circle cx="' + at(x + 0.5, y + 0.35, 8)[0] + '" cy="' + (at(x + 0.5, y + 0.35, 8)[1] - 4) + '" r="5" fill="#FFC83D"/>'; }
    sc.add(16.3, table(8, 7.6, C.coral));
    sc.add(13, table(5.6, 6.8, C.turq));
    // invitaciones
    sc.add(19.6, board(10.6, 9, 54, 34, '#FFFFFF', 0, '<g fill="#1F4FD8"><rect x="6" y="7" width="40" height="4" rx="2"/><rect x="6" y="15" width="32" height="3" rx="1.5"/><rect x="6" y="21" width="36" height="3" rx="1.5"/></g>'), 'inv-texto');
    sc.add(19.6, board(11.6, 7.4, 54, 34, '#FFF6DC', 0, '<path d="M6 26 l8 -14 l8 14z" fill="#FF6B57"/><circle cx="30" cy="14" r="7" fill="#FFC83D"/><rect x="40" y="10" width="8" height="16" rx="2" fill="#17BFAE"/>'), 'inv-dibujos');
    var sp = at(12, 5.4, 0);
    sc.add(17.6, '<rect x="' + (sp[0] - 2) + '" y="' + (sp[1] - 32) + '" width="4" height="32" fill="#33415C"/><path d="M' + (sp[0] - 4) + ' ' + (sp[1] - 44) + ' l20 -12 v34 l-20 -12z" fill="#17BFAE" stroke="#0F1F4B" stroke-width="2"/>', 'inv-audio');
    // música fuerte vs rincón tranquilo
    var mu = at(9, 4.4, 0);
    sc.add(13.6, '<rect x="' + (mu[0] - 14) + '" y="' + (mu[1] - 44) + '" width="28" height="44" rx="4" fill="#0F1F4B"/><circle cx="' + mu[0] + '" cy="' + (mu[1] - 28) + '" r="9" fill="#33415C"/><g class="soundwaves" stroke="#FF6B57" stroke-width="3" fill="none"><path d="M' + (mu[0] + 20) + ' ' + (mu[1] - 34) + ' q10 10 0 20"/><path d="M' + (mu[0] + 28) + ' ' + (mu[1] - 42) + ' q18 18 0 36"/></g>', 'musica_fuerte');
    var rt = at(2.6, 10.8, 0);
    sc.add(13.4, '<path d="M' + (rt[0] - 30) + ' ' + rt[1] + ' L ' + rt[0] + ' ' + (rt[1] - 44) + ' L ' + (rt[0] + 30) + ' ' + rt[1] + 'z" fill="#17BFAE" stroke="#0E9A8C" stroke-width="3" stroke-linejoin="round"/><ellipse cx="' + (rt[0] + 34) + '" cy="' + (rt[1] - 2) + '" rx="12" ry="6" fill="#FFC83D"/>', 'rincon');
    // votación con pictogramas
    sc.add(9.2, board(4.4, 4.8, 64, 40, '#FFFFFF', 0, '<rect x="6" y="6" width="14" height="14" rx="3" fill="#FF6B57"/><rect x="25" y="6" width="14" height="14" rx="3" fill="#FFC83D"/><rect x="44" y="6" width="14" height="14" rx="3" fill="#17BFAE"/><g fill="#1F4FD8"><circle cx="13" cy="28" r="3"/><circle cx="13" cy="34" r="3"/><circle cx="32" cy="28" r="3"/><circle cx="51" cy="28" r="3"/><circle cx="51" cy="34" r="3"/></g>'), 'voto');
    // camino liso hasta la plaza
    pathCells(sc, [[12, 6], [11, 6], [10, 6]], '#FFFFFF', 'camino');
    sc.add(-250, '<g>' + [[12.2, 6.2], [11.4, 6.6], [10.6, 6.2]].map(function (s) { var p = at(s[0], s[1], 0); return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="9" ry="5" fill="#B9C3D3" stroke="#7E8BA3"/>'; }).join('') + '</g>', '!camino');
    // juegos de todos
    var kt = at(10, 2, 120);
    sc.add(60, '<g class="float"><polygon points="' + kt[0] + ',' + (kt[1] - 16) + ' ' + (kt[0] + 12) + ',' + kt[1] + ' ' + kt[0] + ',' + (kt[1] + 16) + ' ' + (kt[0] - 12) + ',' + kt[1] + '" fill="#FF6B57" stroke="#0F1F4B" stroke-width="2"/></g>' + bunting([1.4, 1.4, 70], [12.6, 1.4, 60]) + bunting([1.4, 1.4, 70], [1.4, 12.6, 60]), 'juegos');
    sc.add(40, glowAt(7, 7, 0, 140), 'done');
    var kids = [[6.8, 8.6, C.coral, true, '#8D5A3B'], [7.8, 9.2, C.yellow, false, '#F1C7A3'], [9, 8.8, C.turq, false, '#C98B62'], [6.2, 9.8, C.blue, false, '#6B4430'], [8.4, 10.2, '#9B7BFF', false, '#E0A882']];
    kids.forEach(function (k) { sc.add(k[0] + k[1], figure(k[0], k[1], k[2], { wheel: k[3], skin: k[4], arm: !k[3] }), 'test'); });
    [[1.6, 6, 0.9], [12, 12, 0.9], [12.4, 2, 0.8]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], t[2])); });
    var fw = at(6, 2, 160);
    sc.add(70, star(fw[0], fw[1], 12, '#FFC83D') + star(fw[0] + 60, fw[1] + 20, 8, '#FF6B57') + star(fw[0] - 50, fw[1] + 30, 9, '#17BFAE'), 'secret');
    return {
      svg: sc.out(),
      anchors: { escenario: [3.4, 3.4, 60], mesas: [6.1, 7.1, 20], entrada: [11.6, 6.4, 10], cartelera: [11, 8.4, 70], secret: [6, 2, 150] },
      desc: 'La plaza de la celebración: un escenario con escalones, mesas, una entrada con piedras y un cartel para la invitación.'
    };
  }

  /* =========================================================
     MISIONES DE JÓVENES Y ADULTOS
     ========================================================= */
  function evento() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'a', 26);
    sc.add(-400, tile(1.5, 9, 11, 3.5, '#5FD3B8', 0.5));
    // edificio del evento
    sc.add(4, building(2, 2, 5, 4, 60, ['#FFFFFF', '#2D5FD8', '#1D45AD']));
    // escalinata de entrada
    sc.add(7.6, box(3.6, 6, 1.8, 0.4, 12, ['#DDE6F3', '#8FA3C4', '#73879F']) + box(3.6, 6.4, 1.8, 0.4, 8, ['#DDE6F3', '#8FA3C4', '#73879F']) + box(3.6, 6.8, 1.8, 0.4, 4, ['#DDE6F3', '#8FA3C4', '#73879F']));
    sc.add(7.7, poly([at(5.6, 6, 12), at(6.6, 6, 12), at(6.6, 9.2, 0), at(5.6, 9.2, 0)], '#7FD6FF', 'stroke="#1F4FD8" stroke-width="2"') + '<line x1="' + at(5.6, 6, 22)[0] + '" y1="' + at(5.6, 6, 22)[1] + '" x2="' + at(5.6, 9.2, 10)[0] + '" y2="' + at(5.6, 9.2, 10)[1] + '" stroke="#1F4FD8" stroke-width="3"/>', 'rampa');
    // pantalla con video
    var sc1 = at(9.6, 3.6, 0);
    sc.add(13.2, '<rect x="' + (sc1[0] - 3) + '" y="' + (sc1[1] - 40) + '" width="6" height="40" fill="#33415C"/><rect x="' + (sc1[0] - 52) + '" y="' + (sc1[1] - 104) + '" width="104" height="66" rx="5" fill="#0F1F4B"/><rect x="' + (sc1[0] - 47) + '" y="' + (sc1[1] - 99) + '" width="94" height="56" rx="3" fill="#2D5FD8"/><circle cx="' + (sc1[0] - 14) + '" cy="' + (sc1[1] - 76) + '" r="10" fill="#FFC83D"/><path d="M' + (sc1[0] + 6) + ' ' + (sc1[1] - 50) + ' l18 -26 l18 26z" fill="#17BFAE"/>');
    sc.add(13.3, '<rect x="' + (sc1[0] - 44) + '" y="' + (sc1[1] - 58) + '" width="88" height="12" rx="3" fill="#0F1F4B"/><rect x="' + (sc1[0] - 38) + '" y="' + (sc1[1] - 54) + '" width="76" height="4" rx="2" fill="#FFFFFF"/>', 'subtitulos');
    sc.add(13.4, figure(11.2, 3.2, C.coral, { s: 0.9, arm: true, skin: '#C98B62' }) + '<circle cx="' + at(11.2, 3.2, 40)[0] + '" cy="' + at(11.2, 3.2, 40)[1] + '" r="20" fill="url(#gGlowT)"/>', 'interprete');
    // anuncio
    sc.add(19.6, board(11.4, 8.6, 60, 40, '#FFFFFF', 0, '<rect x="6" y="6" width="48" height="16" rx="3" fill="#FF6B57"/><g fill="#9FB0C8">' + [26, 30, 34].map(function (y) { return '<rect x="6" y="' + y + '" width="' + (44 - y / 3) + '" height="1.6"/>'; }).join('') + '</g>'), '!anuncio_claro');
    sc.add(19.6, board(11.4, 8.6, 60, 40, '#FFFFFF', 0, '<rect x="6" y="6" width="48" height="10" rx="3" fill="#1F4FD8"/><g fill="#0F1F4B"><rect x="6" y="20" width="40" height="4" rx="2"/><rect x="6" y="28" width="30" height="4" rx="2"/></g><circle cx="50" cy="30" r="5" fill="#FFC83D"/>'), 'anuncio_claro');
    sc.add(19.7, board(11.4, 10.6, 80, 26, '#FFC83D', 0, '<rect x="8" y="9" width="64" height="8" rx="3" fill="#0F1F4B"/>'), 'cartel_grande');
    // mesa de organización
    sc.add(16, box(8, 7.6, 1.6, 0.8, 9, ['#FFFFFF', '#17BFAE', '#0E9A8C']));
    sc.add(15.8, figure(8.6, 7.2, '#33415C', { s: 0.9, skin: '#F1C7A3' }) + figure(9.4, 7.2, '#33415C', { s: 0.9, skin: '#C98B62' }));
    sc.add(17.6, figure(9.2, 8.8, C.yellow, { s: 0.9, skin: '#8D5A3B', arm: true }) + figure(7.6, 8.8, C.turq, { s: 0.9, skin: '#E0A882' }) + '<circle cx="' + at(8.8, 8, 30)[0] + '" cy="' + at(8.8, 8, 30)[1] + '" r="54" fill="url(#gGlowT)"/>', 'asamblea');
    // acompañante que decide
    sc.add(16.1, figure(6.6, 9.4, '#33415C', { s: 0.95, skin: '#E0A882', arm: true }), 'acompanante');
    // participantes al comprobar
    sc.add(15.4, figure(6.2, 9.2, C.coral, { wheel: true, skin: '#8D5A3B', hair: '#1A1210' }), 'test');
    sc.add(16.5, figure(10.4, 6, C.blue, { skin: '#F1C7A3', hair: '#7A4A20' }), 'test');
    sc.add(19.2, figure(9.6, 9.6, '#9B7BFF', { skin: '#E0A882', hair: '#D6D6D6' }), 'test');
    sc.add(14, figure(4.4, 9.6, C.yellow, { skin: '#6B4430', hair: '#1A1210' }), 'test');
    // música fuerte
    var mu = at(12, 4, 0);
    sc.add(16, '<rect x="' + (mu[0] - 12) + '" y="' + (mu[1] - 40) + '" width="24" height="40" rx="3" fill="#0F1F4B"/><circle cx="' + mu[0] + '" cy="' + (mu[1] - 24) + '" r="8" fill="#33415C"/>', 'musica');
    [[1.6, 11.6], [3, 12.2], [12.2, 1.8], [12.4, 12.2]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], 0.7, 'a')); });
    sc.add(40, bunting([2, 2, 76], [7, 2, 76], [C.yellow, C.turq, C.coral]), 'done');
    // secreto: mural en la pared
    sc.add(4.5, poly([at(2.4, 6, 50), at(4.2, 6, 50), at(4.2, 6, 24), at(2.4, 6, 24)], '#FFC83D') + poly([at(2.6, 6, 46), at(3.4, 6, 46), at(3.4, 6, 30), at(2.6, 6, 30)], '#FF6B57'), 'secret');
    return {
      svg: sc.out(),
      anchors: { anuncio: [11.4, 8.6, 74], ingreso: [4.5, 6.4, 30], video: [9.6, 3.6, 110], organizacion: [8.8, 8, 26], secret: [3.3, 6, 54] },
      desc: 'Un edificio moderno para el evento. La entrada tiene una escalinata. A la derecha hay una pantalla con un video, adelante un cartel de anuncio y una mesa donde dos personas organizan el programa.'
    };
  }

  function reparar() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'a', 26);
    sc.add(5, building(2, 2, 6, 3, 50, ['#FFFFFF', '#1F4FD8', '#163A9E']));
    // gran pantalla con la publicación
    var p = at(9, 6, 0), X = p[0], Y = p[1];
    sc.add(15, '<rect x="' + (X - 4) + '" y="' + (Y - 40) + '" width="8" height="40" fill="#33415C"/><rect x="' + (X - 120) + '" y="' + (Y - 190) + '" width="240" height="154" rx="10" fill="#0F1F4B"/><rect x="' + (X - 112) + '" y="' + (Y - 182) + '" width="224" height="138" rx="6" fill="#FFFFFF"/>' +
      '<rect x="' + (X - 104) + '" y="' + (Y - 174) + '" width="96" height="64" rx="4" fill="#2D5FD8"/><path d="M' + (X - 92) + ' ' + (Y - 118) + ' l22 -28 l18 20 l12 -12 l18 20z" fill="#17BFAE"/><circle cx="' + (X - 36) + '" cy="' + (Y - 158) + '" r="8" fill="#FFC83D"/>' +
      '<rect x="' + (X + 2) + '" y="' + (Y - 174) + '" width="102" height="64" rx="4" fill="#33415C"/><polygon points="' + (X + 46) + ',' + (Y - 154) + ' ' + (X + 64) + ',' + (Y - 142) + ' ' + (X + 46) + ',' + (Y - 130) + '" fill="#FFFFFF"/>');
    // título con bajo contraste (antes) / buen contraste (después)
    sc.add(15.1, '<rect x="' + (X - 104) + '" y="' + (Y - 100) + '" width="208" height="18" rx="3" fill="#E9EEF5"/><rect x="' + (X - 98) + '" y="' + (Y - 95) + '" width="150" height="8" rx="3" fill="#C6D0DE"/>', '!contraste');
    sc.add(15.1, '<rect x="' + (X - 104) + '" y="' + (Y - 100) + '" width="208" height="18" rx="3" fill="#0F1F4B"/><rect x="' + (X - 98) + '" y="' + (Y - 95) + '" width="150" height="8" rx="3" fill="#FFC83D"/>', 'contraste');
    // texto largo / claro
    sc.add(15.1, '<g fill="#9FB0C8">' + [-74, -68, -62, -56].map(function (d) { return '<rect x="' + (X - 104) + '" y="' + (Y + d) + '" width="200" height="3" rx="1.5"/>'; }).join('') + '</g>', '!claro');
    sc.add(15.1, '<g fill="#0F1F4B"><rect x="' + (X - 104) + '" y="' + (Y - 76) + '" width="140" height="6" rx="3"/><rect x="' + (X - 104) + '" y="' + (Y - 64) + '" width="110" height="6" rx="3"/></g>', 'claro');
    sc.add(15.2, '<rect x="' + (X + 8) + '" y="' + (Y - 124) + '" width="90" height="10" rx="2" fill="#0F1F4B"/><rect x="' + (X + 14) + '" y="' + (Y - 121) + '" width="78" height="4" rx="2" fill="#FFFFFF"/>', 'subtitulos');
    sc.add(15.2, '<rect x="' + (X - 104) + '" y="' + (Y - 124) + '" width="40" height="12" rx="6" fill="#FFC83D"/><rect x="' + (X - 98) + '" y="' + (Y - 120) + '" width="28" height="4" rx="2" fill="#0F1F4B"/>', 'alt');
    sc.add(15.3, '<g transform="translate(' + (X + 112) + ' ' + (Y - 196) + ')"><circle r="16" fill="#17BFAE"/><path d="M-6 -4 h4 l6 -6 v20 l-6 -6 h-4z" fill="#FFFFFF"/></g>', 'formatos');
    // personas que revisan
    sc.add(14, figure(5, 8.6, C.blue, { skin: '#F1C7A3', hair: '#7A4A20' }), 'test');
    sc.add(15.6, figure(6.4, 9.2, '#9B7BFF', { skin: '#E0A882', hair: '#D6D6D6' }), 'test');
    sc.add(17, figure(7.6, 9.4, C.coral, { skin: '#8D5A3B' }), 'test');
    sc.add(18, figure(8.6, 9.4, C.yellow, { skin: '#6B4430', hair: '#1A1210' }), 'test');
    [[1.6, 11], [12.2, 2], [12, 12], [2.6, 12.4]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], 0.7, 'a')); });
    sc.add(40, bunting([2, 2, 66], [8, 2, 66], [C.yellow, C.turq, C.coral]), 'done');
    var sk = at(11.4, 10.8, 0);
    sc.add(22.2, '<circle cx="' + sk[0] + '" cy="' + (sk[1] - 10) + '" r="10" fill="#FFFFFF" stroke="#1F4FD8" stroke-width="2"/><path d="M' + (sk[0] - 4) + ' ' + (sk[1] - 10) + ' l3 3 l6 -6" stroke="#17BFAE" stroke-width="3" fill="none"/>', 'secret');
    return {
      svg: sc.out(),
      anchors: { video: [11.2, 4.4, 150], imagen: [6.6, 7.6, 160], texto: [8, 7, 90], colores: [8.8, 7.4, 110], secret: [11.4, 10.8, 20] },
      desc: 'Un estudio digital con una gran pantalla que muestra una publicación: una imagen, un video, un título y un texto.'
    };
  }

  function control() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'a', 26);
    // centro cultural (punto de salida)
    sc.add(8, building(5, 2, 3.4, 2.4, 44, ['#FFFFFF', '#17BFAE', '#0E9A8C'], 0, '#E9FFFB'));
    // micro
    var bus = at(8.6, 6.6, 0);
    sc.add(15.4, box(7.8, 6.2, 2.2, 0.9, 20, ['#FFC83D', '#E8A91A', '#D4951A'], 2) + '<circle cx="' + at(8.2, 7.1, 0)[0] + '" cy="' + (at(8.2, 7.1, 0)[1] - 2) + '" r="5" fill="#0F1F4B"/><circle cx="' + at(9.6, 7.1, 0)[0] + '" cy="' + (at(9.6, 7.1, 0)[1] - 2) + '" r="5" fill="#0F1F4B"/>');
    // destino museo (escaleras)
    sc.add(13, building(1.6, 8.6, 2.6, 2.4, 40, ['#FFFFFF', '#2D5FD8', '#1D45AD']) + box(2, 11, 1.8, 0.4, 10, ['#DDE6F3', '#8FA3C4', '#73879F']) + box(2, 11.4, 1.8, 0.4, 5, ['#DDE6F3', '#8FA3C4', '#73879F']));
    // destino parque con cancha
    sc.add(-300, tile(9, 9, 3.6, 3, '#5FD3B8', 0.6) + tile(9.4, 9.4, 2.8, 2.2, '#2EC4A0', 0.8, 'stroke="#FFFFFF" stroke-width="2"'));
    var gl = at(10.8, 10.5, 0);
    sc.add(-290, '<line x1="' + at(9.4, 10.5, 1)[0] + '" y1="' + at(9.4, 10.5, 1)[1] + '" x2="' + at(12.2, 10.5, 1)[0] + '" y2="' + at(12.2, 10.5, 1)[1] + '" stroke="#FFFFFF" stroke-width="2"/>');
    // ruta elegida
    sc.add(-200, '<path d="M' + bus[0] + ' ' + bus[1] + ' Q ' + (bus[0] - 120) + ' ' + (bus[1] + 20) + ' ' + at(3, 10, 0)[0] + ' ' + at(3, 10, 0)[1] + '" stroke="#FF6B57" stroke-width="5" fill="none" stroke-dasharray="10 8" stroke-linecap="round"/>', 'dest-museo');
    sc.add(-200, '<path d="M' + bus[0] + ' ' + bus[1] + ' Q ' + (bus[0] + 10) + ' ' + (bus[1] + 60) + ' ' + gl[0] + ' ' + (gl[1] - 6) + '" stroke="#17BFAE" stroke-width="5" fill="none" stroke-dasharray="10 8" stroke-linecap="round"/>', 'dest-parque');
    sc.add(23, '<circle cx="' + gl[0] + '" cy="' + gl[1] + '" r="70" fill="url(#gGlowT)"/>', 'dest-parque');
    // sol / tarde
    var sun = at(2, 2, 170);
    sc.add(70, '<circle cx="' + sun[0] + '" cy="' + sun[1] + '" r="20" fill="#FFC83D"/><g stroke="#FFC83D" stroke-width="3">' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { var r = a * Math.PI / 180; return '<line x1="' + n(sun[0] + Math.cos(r) * 26) + '" y1="' + n(sun[1] + Math.sin(r) * 26) + '" x2="' + n(sun[0] + Math.cos(r) * 34) + '" y2="' + n(sun[1] + Math.sin(r) * 34) + '"/>'; }).join('') + '</g>', 'hora-manana');
    sc.add(70, '<circle cx="' + sun[0] + '" cy="' + (sun[1] + 60) + '" r="24" fill="#FF6B57"/><circle cx="' + sun[0] + '" cy="' + (sun[1] + 60) + '" r="50" fill="url(#gGlow)"/>', 'hora-tarde');
    // personas y sus roles
    sc.add(14.2, figure(6, 8.2, C.coral, { wheel: true, skin: '#8D5A3B' }));
    sc.add(13.6, figure(7, 6.6, '#9B7BFF', { skin: '#E0A882', hair: '#D6D6D6' }), '!ines-fuera');
    sc.add(16, figure(10.4, 5.6, C.yellow, { skin: '#6B4430', hair: '#1A1210' }));
    sc.add(14.8, figure(4.6, 10.2, C.blue, { skin: '#F1C7A3', hair: '#7A4A20' }));
    var cam = at(4.6, 10.2, 34);
    sc.add(14.9, '<rect x="' + (cam[0] + 4) + '" y="' + (cam[1] - 4) + '" width="16" height="11" rx="2" fill="#0F1F4B"/><circle cx="' + (cam[0] + 12) + '" cy="' + (cam[1] + 1.5) + '" r="3.5" fill="#7FD6FF"/>', 'rol-fotos');
    [[12, 2, 0.8], [12.4, 4.4, 0.7], [1.6, 4, 0.7]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], t[2], 'a')); });
    sc.add(40, bunting([5, 2, 60], [8.4, 2, 60], [C.yellow, C.turq, C.coral]), 'done');
    var sh = at(12.2, 12.2, 0);
    sc.add(24.5, '<circle cx="' + sh[0] + '" cy="' + (sh[1] - 6) + '" r="7" fill="#FFFFFF" stroke="#0F1F4B" stroke-width="1.5"/><path d="M' + (sh[0] - 7) + ' ' + (sh[1] - 6) + ' h14 M' + sh[0] + ' ' + (sh[1] - 13) + ' v14" stroke="#0F1F4B" stroke-width="1"/>', 'secret');
    return {
      svg: sc.out(),
      anchors: { centro: [6.7, 3.2, 60], micro: [8.9, 6.6, 30], museo: [2.9, 9.8, 54], parque: [10.8, 10.5, 10], secret: [12.2, 12.2, 10] },
      desc: 'El centro cultural, un micro listo para salir y dos destinos posibles: un museo con escalinata y un parque con cancha.'
    };
  }

  function domino() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'a', 26);
    // calle
    sc.add(-450, tile(1.2, 6.2, 11.6, 1.6, '#DDE6F3', 0.5));
    // centro comunitario de dos pisos
    sc.add(5, building(2, 2, 4, 3, 64, ['#FFFFFF', '#2D5FD8', '#1D45AD']));
    sc.add(5.2, poly([at(2.4, 5, 60), at(5.6, 5, 60), at(5.6, 5, 40), at(2.4, 5, 40)], '#FFC83D'));
    sc.add(7.9, box(3, 5, 1.6, 0.4, 10, ['#DDE6F3', '#8FA3C4', '#73879F']) + box(3, 5.4, 1.6, 0.4, 5, ['#DDE6F3', '#8FA3C4', '#73879F']));
    sc.add(8.4, box(6, 3, 0.8, 1, 64, ['#FFFFFF', '#17BFAE', '#0E9A8C']), 'ascensor');
    sc.add(8.3, board(6.4, 5.6, 46, 30, '#FFFFFF', 0, '<rect x="6" y="6" width="34" height="6" rx="2" fill="#17BFAE"/><path d="M10 22 h26" stroke="#0F1F4B" stroke-width="3"/>'), 'planta_baja');
    // casas del barrio
    [[8, 1.6, '#FF6B57'], [10.2, 2, '#FFC83D'], [8.6, 9, '#17BFAE'], [10.8, 9.4, '#FF6B57'], [2, 9, '#FFC83D']].forEach(function (h) { sc.add(h[0] + h[1], building(h[0], h[1], 1.4, 1.4, 30, ['#FFFFFF', h[2], h[2]], 0, '#FFFFFF')); });
    // antena / teléfono (inscripción en línea)
    var an = at(11.6, 5, 0);
    sc.add(16.6, '<rect x="' + (an[0] - 2) + '" y="' + (an[1] - 60) + '" width="4" height="60" fill="#33415C"/><g stroke="#17BFAE" stroke-width="3" fill="none"><path d="M' + (an[0] - 12) + ' ' + (an[1] - 66) + ' q12 -12 24 0"/><path d="M' + (an[0] - 20) + ' ' + (an[1] - 72) + ' q20 -20 40 0"/></g>', 'online');
    var ck = at(12, 7.6, 0);
    sc.add(19.6, '<circle cx="' + ck[0] + '" cy="' + (ck[1] - 34) + '" r="16" fill="#FFFFFF" stroke="#1F4FD8" stroke-width="3"/><path d="M' + ck[0] + ' ' + (ck[1] - 44) + ' v10 l7 4" stroke="#0F1F4B" stroke-width="3" fill="none"/><rect x="' + (ck[0] - 2) + '" y="' + (ck[1] - 18) + '" width="4" height="18" fill="#33415C"/>', 'horario');
    sc.add(19, figure(7.4, 11.6, C.turq, { skin: '#C98B62', arm: true }) + figure(6.4, 11.8, C.coral, { skin: '#F1C7A3' }) + '<circle cx="' + at(7, 11.6, 30)[0] + '" cy="' + at(7, 11.6, 30)[1] + '" r="44" fill="url(#gGlowT)"/>', 'consulta');
    sc.add(16, box(9.6, 4.6, 1.4, 1, 18, ['#E3E9F2', '#9FB0C8', '#8597B0']) + '<rect x="' + (at(10.3, 5.6, 30)[0] - 18) + '" y="' + (at(10.3, 5.6, 30)[1] - 4) + '" width="36" height="8" rx="3" fill="#FF6B57"/>', 'separado');
    // fichas de dominó a lo largo de la calle
    for (var i = 0; i < 6; i++) {
      var dx = 3 + i * 1.6, d = at(dx, 7, 0);
      sc.add(dx + 7, '<rect x="' + (d[0] - 6) + '" y="' + (d[1] - 32) + '" width="12" height="32" rx="2" fill="#FF6B57" stroke="#0F1F4B" stroke-width="2"/><circle cx="' + d[0] + '" cy="' + (d[1] - 24) + '" r="2" fill="#FFFFFF"/><circle cx="' + d[0] + '" cy="' + (d[1] - 10) + '" r="2" fill="#FFFFFF"/>', '!c' + (i + 1) + '-ok');
      sc.add(dx + 7, '<g transform="rotate(62 ' + n(d[0] + 6) + ' ' + n(d[1]) + ')"><rect x="' + (d[0] - 6) + '" y="' + (d[1] - 32) + '" width="12" height="32" rx="2" fill="#17BFAE" stroke="#0F1F4B" stroke-width="2"/></g><circle cx="' + d[0] + '" cy="' + (d[1] - 6) + '" r="18" fill="url(#gGlowT)"/>', 'c' + (i + 1) + '-ok');
    }
    [[1.6, 12, 0.7], [12.4, 12.4, 0.7], [12.4, 1.4, 0.7]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], t[2], 'a')); });
    sc.add(40, bunting([2, 2, 80], [6, 2, 80], [C.yellow, C.turq, C.coral]), 'done');
    var gt = at(1.6, 12, 30);
    sc.add(14.5, '<path d="M' + (gt[0] + 10) + ' ' + gt[1] + ' q6 -14 12 0 q-6 10 -12 0" fill="#FF6B57"/><path d="M' + (gt[0] + 16) + ' ' + (gt[1] - 6) + ' v-14" stroke="#33415C"/>', 'secret');
    return {
      svg: sc.out(),
      anchors: { centro: [4, 3.4, 80], escalera: [3.8, 5.2, 20], calle: [7, 7, 30], barrio: [9.2, 9.6, 40], secret: [1.8, 12, 34] },
      desc: 'Una calle del barrio con un centro comunitario de dos pisos. El taller de radio está en el primer piso y se llega por escalera. A lo largo de la calle hay una fila de fichas de dominó.'
    };
  }

  function finalAdultos() {
    var sc = new Scene();
    island(sc, 1, 1, 12, 12, 'a', 26);
    sc.add(-400, tile(3.5, 3.5, 7, 7, '#FFFFFF', 0.5) + tile(1.4, 10.6, 11, 2, '#5FD3B8', 0.6));
    // escenario
    var es = at(4, 4, 10);
    sc.add(6, box(2.4, 2.4, 3.2, 2.2, 10, ['#DDE6F3', '#2D5FD8', '#1D45AD']) + '<rect x="' + (es[0] - 50) + '" y="' + (es[1] - 80) + '" width="100" height="58" rx="4" fill="#0F1F4B"/><rect x="' + (es[0] - 46) + '" y="' + (es[1] - 76) + '" width="92" height="50" rx="3" fill="#2D5FD8"/>');
    sc.add(6.1, '<rect x="' + (es[0] - 42) + '" y="' + (es[1] - 38) + '" width="84" height="9" rx="2" fill="#0F1F4B"/><rect x="' + (es[0] - 36) + '" y="' + (es[1] - 35) + '" width="72" height="3" rx="1.5" fill="#FFFFFF"/>', 'subtitulos');
    sc.add(6.2, figure(6.2, 2.6, C.coral, { s: 0.9, skin: '#C98B62', arm: true, z: 10 }), 'interprete');
    sc.add(8.5, box(5.6, 3.2, 0.4, 1.4, 6, ['#DDE6F3', '#8FA3C4', '#73879F']) + box(6, 3.2, 0.4, 1.4, 3, ['#DDE6F3', '#8FA3C4', '#73879F']), '!rampa');
    sc.add(8.5, poly([at(5.6, 3.2, 10), at(5.6, 4.6, 10), at(7.6, 4.6, 0), at(7.6, 3.2, 0)], '#7FD6FF', 'stroke="#1F4FD8" stroke-width="2"'), 'rampa');
    // puesto de información
    sc.add(17.4, box(10, 7, 1.6, 0.8, 10, ['#FFFFFF', '#FFC83D', '#E8A91A']) + board(10.8, 7.4, 52, 32, '#FFFFFF', 10, '<rect x="6" y="6" width="40" height="5" rx="2" fill="#1F4FD8"/><rect x="6" y="15" width="30" height="4" rx="2" fill="#0F1F4B"/>'), 'info_clara');
    sc.add(17.6, '<g transform="translate(' + at(11.6, 7.4, 30)[0] + ' ' + at(11.6, 7.4, 30)[1] + ')"><circle r="12" fill="#17BFAE"/><path d="M-5 -3 h3 l5 -5 v16 l-5 -5 h-3z" fill="#FFFFFF"/></g>', 'audio_guia');
    // zona tranquila
    var zt = at(2.6, 11.4, 0);
    sc.add(14.6, '<rect x="' + (zt[0] - 40) + '" y="' + (zt[1] - 36) + '" width="80" height="36" rx="18" fill="#7FD6FF" stroke="#1F4FD8" stroke-width="2"/><ellipse cx="' + (zt[0] - 14) + '" cy="' + (zt[1] - 6) + '" rx="12" ry="5" fill="#FFC83D"/><ellipse cx="' + (zt[0] + 14) + '" cy="' + (zt[1] - 6) + '" rx="12" ry="5" fill="#FF6B57"/>', 'zona_tranquila');
    // asamblea / urna con opciones
    sc.add(16.8, figure(8, 8.8, C.yellow, { skin: '#6B4430', hair: '#1A1210', arm: true }) + figure(9, 9, '#9B7BFF', { skin: '#E0A882', hair: '#D6D6D6', arm: true }) + figure(8.8, 7.8, C.blue, { skin: '#F1C7A3', arm: true }) + '<circle cx="' + at(8.6, 8.6, 30)[0] + '" cy="' + at(8.6, 8.6, 30)[1] + '" r="56" fill="url(#gGlowT)"/>', 'asamblea');
    sc.add(16.9, box(7.4, 9.4, 0.6, 0.6, 14, ['#FFFFFF', '#1F4FD8', '#163A9E']), 'votacion');
    // transporte
    sc.add(22.4, box(10.6, 11, 2, 0.9, 18, ['#FFC83D', '#E8A91A', '#D4951A'], 2), 'transporte');
    // música fuerte
    var mu = at(10.6, 3, 0);
    sc.add(13.6, '<rect x="' + (mu[0] - 14) + '" y="' + (mu[1] - 46) + '" width="28" height="46" rx="3" fill="#0F1F4B"/><g class="soundwaves" stroke="#FF6B57" stroke-width="3" fill="none"><path d="M' + (mu[0] + 20) + ' ' + (mu[1] - 34) + ' q10 10 0 20"/></g>', 'musica_fuerte');
    sc.add(13, figure(6, 7.6, '#33415C', { s: 0.95, skin: '#E0A882', arm: true }), 'acompanante');
    // público
    [[5.2, 6.6, C.coral, true, '#8D5A3B'], [6.6, 6.2, C.turq, false, '#C98B62'], [7.2, 7.2, C.yellow, false, '#6B4430']].forEach(function (f) { sc.add(f[0] + f[1], figure(f[0], f[1], f[2], { wheel: f[3], skin: f[4] }), 'test'); });
    [[12.4, 1.8, 0.8], [1.6, 2, 0.8], [12.4, 5.4, 0.7]].forEach(function (t) { sc.add(t[0] + t[1], tree(t[0], t[1], t[2], 'a')); });
    sc.add(40, bunting([3.5, 3.5, 70], [10.5, 3.5, 70], [C.yellow, C.turq, C.coral]) + bunting([3.5, 3.5, 70], [3.5, 10.5, 70], [C.blue, C.coral, C.yellow]) + glowAt(7, 7, 0, 160), 'done');
    var sp = at(1.8, 6.4, 0);
    sc.add(8.3, '<rect x="' + (sp[0] - 12) + '" y="' + (sp[1] - 22) + '" width="24" height="22" rx="3" fill="#FFF6DC" stroke="#0F1F4B" stroke-width="1.5"/><path d="M' + (sp[0] - 6) + ' ' + (sp[1] - 12) + ' h12 M' + (sp[0] - 6) + ' ' + (sp[1] - 7) + ' h8" stroke="#1F4FD8" stroke-width="2"/>', 'secret');
    return {
      svg: sc.out(),
      anchors: { escenario: [4, 4, 90], plaza: [7, 7, 10], ingreso: [11, 11, 30], organizacion: [9, 8.6, 40], secret: [1.8, 6.4, 26] },
      desc: 'La plaza mayor, preparada para un gran evento: un escenario con pantalla, un espacio central, un ingreso y un lugar para organizar.'
    };
  }

  /* =========================================================
     AVATARES Y PICTOGRAMAS (para tarjetas HTML)
     ========================================================= */
  function avatar(p) {
    var a = p.look || {};
    var bg = a.bg || '#E8F4FF', body = a.body || C.blue, skin = a.skin || '#C98B62', hair = a.hair || '#3A2A20';
    var s = '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false">' +
      '<circle cx="32" cy="32" r="31" fill="' + bg + '"/>';
    if (a.wheel) s += '<circle cx="22" cy="50" r="11" fill="none" stroke="#33415C" stroke-width="3"/>';
    s += '<path d="M14 64 q0 -22 18 -22 q18 0 18 22z" fill="' + body + '"/>' +
      '<circle cx="32" cy="27" r="12" fill="' + skin + '"/>';
    if (a.hairStyle === 'long') s += '<path d="M19 28 q-2 -18 13 -18 q15 0 13 18 v12 h-4 v-14 q-9 -2 -18 0 v14 h-4z" fill="' + hair + '"/>';
    else if (a.hairStyle === 'curly') s += '<g fill="' + hair + '"><circle cx="22" cy="20" r="6"/><circle cx="30" cy="15" r="7"/><circle cx="39" cy="17" r="6"/><circle cx="44" cy="24" r="5"/><circle cx="20" cy="27" r="4"/></g>';
    else if (a.hairStyle === 'bun') s += '<path d="M20 25 q0 -13 12 -13 q12 0 12 13 q-12 -6 -24 0z" fill="' + hair + '"/><circle cx="32" cy="11" r="5" fill="' + hair + '"/>';
    else if (a.hairStyle === 'cap') s += '<path d="M19 24 q0 -12 13 -12 q13 0 13 12z" fill="' + (a.cap || C.coral) + '"/><rect x="38" y="21" width="12" height="4" rx="2" fill="' + (a.cap || C.coral) + '"/>';
    else s += '<path d="M20 25 q0 -13 12 -13 q12 0 12 13 q-12 -5 -24 0z" fill="' + hair + '"/>';
    s += '<circle cx="27.5" cy="28" r="1.6" fill="#0F1F4B"/><circle cx="36.5" cy="28" r="1.6" fill="#0F1F4B"/><path d="M28 33 q4 3 8 0" stroke="#0F1F4B" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    if (a.glasses) s += '<g fill="none" stroke="#0F1F4B" stroke-width="1.6"><circle cx="27.5" cy="28" r="4"/><circle cx="36.5" cy="28" r="4"/><path d="M31.5 28 h1"/></g>';
    if (a.phones) s += '<path d="M19 28 q0 -16 13 -16 q13 0 13 16" stroke="#0F1F4B" stroke-width="2.5" fill="none"/><rect x="16" y="25" width="6" height="9" rx="3" fill="' + C.turq + '"/><rect x="42" y="25" width="6" height="9" rx="3" fill="' + C.turq + '"/>';
    if (a.camera) s += '<rect x="36" y="46" width="16" height="11" rx="2" fill="#0F1F4B"/><circle cx="44" cy="51.5" r="3.5" fill="#7FD6FF"/>';
    if (a.cane) s += '<line x1="50" y1="40" x2="56" y2="64" stroke="#FFFFFF" stroke-width="3"/><line x1="54.5" y1="58" x2="56" y2="64" stroke="#FF6B57" stroke-width="3"/>';
    s += '</svg>';
    return s;
  }

  var PICTOS = {
    fuente: '<path d="M8 40 h32 l-4 6 h-24z" fill="#1F4FD8"/><path d="M24 38 q-10 -18 0 -28 q10 10 0 28" fill="#5BC8F5"/><path d="M14 30 q-4 -6 2 -10 M34 30 q4 -6 -2 -10" stroke="#5BC8F5" stroke-width="3" fill="none"/>',
    luna: '<circle cx="26" cy="24" r="14" fill="#FFC83D"/><circle cx="32" cy="20" r="12" fill="#E8F4FF"/><circle cx="10" cy="10" r="2" fill="#FFC83D"/><circle cx="40" cy="38" r="2" fill="#FFC83D"/>',
    sol: '<circle cx="24" cy="24" r="10" fill="#FFC83D"/><g stroke="#FFC83D" stroke-width="3" stroke-linecap="round"><path d="M24 4 v6 M24 38 v6 M4 24 h6 M38 24 h6 M10 10 l4 4 M34 34 l4 4 M38 10 l-4 4 M10 38 l4 -4"/></g>',
    manana: '<path d="M4 36 h40" stroke="#1F4FD8" stroke-width="3"/><path d="M12 36 a12 12 0 0 1 24 0" fill="#FFC83D"/><path d="M24 8 v8 M10 16 l5 5 M38 16 l-5 5" stroke="#FFC83D" stroke-width="3" stroke-linecap="round"/>',
    juego: '<rect x="6" y="16" width="36" height="20" rx="10" fill="#FF6B57"/><path d="M14 22 v8 M10 26 h8" stroke="#FFFFFF" stroke-width="3"/><circle cx="32" cy="24" r="2.5" fill="#FFFFFF"/><circle cx="36" cy="29" r="2.5" fill="#FFFFFF"/>',
    pelota: '<circle cx="24" cy="24" r="16" fill="#FFFFFF" stroke="#0F1F4B" stroke-width="2.5"/><polygon points="24,16 31,21 28,29 20,29 17,21" fill="#0F1F4B"/>',
    libro: '<path d="M6 12 q9 -4 18 2 v24 q-9 -6 -18 -2z" fill="#17BFAE"/><path d="M42 12 q-9 -4 -18 2 v24 q9 -6 18 -2z" fill="#1F4FD8"/>',
    rio: '<path d="M2 18 q8 -6 16 0 t16 0 t16 0 M2 28 q8 -6 16 0 t16 0 t16 0 M2 38 q8 -6 16 0 t16 0 t16 0" stroke="#1F4FD8" stroke-width="3" fill="none"/>',
    escuela: '<path d="M6 20 l18 -12 l18 12z" fill="#FF6B57"/><rect x="10" y="20" width="28" height="20" fill="#FFC83D"/><rect x="20" y="28" width="8" height="12" fill="#0F1F4B"/>',
    barrilete: '<polygon points="24,4 38,20 24,36 10,20" fill="#FF6B57" stroke="#0F1F4B" stroke-width="2"/><path d="M10 20 h28 M24 4 v32" stroke="#0F1F4B" stroke-width="1.5"/><path d="M24 36 q8 6 -2 10" stroke="#0F1F4B" fill="none"/>',
    viento: '<path d="M4 16 h26 a6 6 0 1 0 -6 -6 M4 26 h34 a6 6 0 1 1 -6 6 M4 36 h18" stroke="#1F4FD8" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    plaza: '<path d="M4 40 h40" stroke="#33415C" stroke-width="3"/><circle cx="14" cy="22" r="8" fill="#2EC4A0"/><rect x="13" y="28" width="2.5" height="12" fill="#B0703F"/><rect x="24" y="32" width="18" height="4" rx="2" fill="#FF6B57"/><path d="M26 36 v4 M40 36 v4" stroke="#FF6B57" stroke-width="2.5"/>',
    soga: '<path d="M6 34 q18 -36 36 0" stroke="#FF6B57" stroke-width="3.5" fill="none"/><circle cx="6" cy="36" r="4" fill="#1F4FD8"/><circle cx="42" cy="36" r="4" fill="#1F4FD8"/><path d="M22 42 l2 -10 l2 10" stroke="#0F1F4B" stroke-width="2.5" fill="none"/>',
    tesoro: '<rect x="8" y="20" width="32" height="20" rx="3" fill="#B0703F" stroke="#0F1F4B" stroke-width="2"/><path d="M8 20 q16 -14 32 0" fill="#D48C55" stroke="#0F1F4B" stroke-width="2"/><rect x="21" y="24" width="6" height="7" fill="#FFC83D"/>',
    tv: '<rect x="6" y="10" width="36" height="24" rx="3" fill="#33415C"/><rect x="10" y="14" width="28" height="16" fill="#7FD6FF"/><path d="M18 40 h12" stroke="#33415C" stroke-width="3"/>',
    playa: '<path d="M2 36 q22 -8 44 0 v8 h-44z" fill="#FFE39A"/><path d="M2 30 q8 -4 16 0 t16 0 t16 0" stroke="#1F4FD8" stroke-width="3" fill="none"/><circle cx="36" cy="12" r="6" fill="#FFC83D"/>',
    estrella: '<polygon points="24,4 29,18 44,18 32,27 36,42 24,33 12,42 16,27 4,18 19,18" fill="#FFC83D" stroke="#E8A91A" stroke-width="2"/>',
    tabla: '<rect x="4" y="18" width="40" height="12" rx="2" fill="#E8A66E" stroke="#8A5A3C" stroke-width="2"/><path d="M10 24 h28" stroke="#8A5A3C" stroke-width="1.4"/>',
    piedra: '<ellipse cx="24" cy="26" rx="16" ry="12" fill="#9AA7BD" stroke="#5E6B82" stroke-width="2"/><ellipse cx="19" cy="21" rx="5" ry="3" fill="#D6DEEA"/>',
    ola: '<path d="M4 32 q6 -14 14 -6 q4 4 8 -2 q6 -12 18 -2" stroke="#1F4FD8" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M4 40 h40" stroke="#5BC8F5" stroke-width="3"/>',
    hoja: '<path d="M8 40 q0 -30 32 -32 q2 30 -32 32z" fill="#2EC4A0"/><path d="M8 40 l24 -24" stroke="#0E9A8C" stroke-width="2.5"/>',
    llave: '<circle cx="14" cy="24" r="8" fill="none" stroke="#E8A91A" stroke-width="4"/><path d="M22 24 h20 M34 24 v7 M40 24 v5" stroke="#E8A91A" stroke-width="4" stroke-linecap="round"/>',
    mano: '<path d="M16 42 v-18 q0 -3 3 -3 q3 0 3 3 v-10 q0 -3 3 -3 q3 0 3 3 v8 q0 -3 3 -3 q3 0 3 3 v4 q0 -3 3 -3 q3 0 3 3 v8 q0 8 -8 8z" fill="#E0A882" stroke="#0F1F4B" stroke-width="1.6"/>',
    nota: '<path d="M18 36 v-24 l18 -4 v24" stroke="#0F1F4B" stroke-width="3" fill="none"/><circle cx="14" cy="36" r="5" fill="#0F1F4B"/><circle cx="32" cy="32" r="5" fill="#0F1F4B"/>',
    ojo: '<path d="M4 24 q20 -20 40 0 q-20 20 -40 0z" fill="#FFFFFF" stroke="#0F1F4B" stroke-width="2.5"/><circle cx="24" cy="24" r="6" fill="#1F4FD8"/>',
    oreja: '<path d="M30 40 q-10 4 -12 -6 q-8 -4 -6 -14 q2 -14 14 -14 q12 0 12 12 q0 8 -6 12 q-2 2 -2 10z" fill="#E0A882" stroke="#0F1F4B" stroke-width="2"/>',
    texto: '<rect x="8" y="6" width="32" height="36" rx="3" fill="#FFFFFF" stroke="#0F1F4B" stroke-width="2"/><path d="M14 14 h20 M14 21 h20 M14 28 h14 M14 35 h18" stroke="#1F4FD8" stroke-width="2.5"/>',
    grupo: '<circle cx="14" cy="18" r="5" fill="#FF6B57"/><circle cx="24" cy="14" r="5" fill="#FFC83D"/><circle cx="34" cy="18" r="5" fill="#17BFAE"/><path d="M6 38 q8 -14 16 0 M16 36 q8 -16 16 0 M26 38 q8 -14 16 0" fill="#1F4FD8"/>',
    mapa: '<path d="M4 10 l12 -4 l14 4 l14 -4 v32 l-14 4 l-14 -4 l-12 4z" fill="#FFF6DC" stroke="#0F1F4B" stroke-width="2"/><path d="M10 30 q8 -12 14 -4 t14 -10" stroke="#FF6B57" stroke-width="2.5" fill="none" stroke-dasharray="3 3"/>',
    camara: '<rect x="6" y="14" width="36" height="24" rx="4" fill="#0F1F4B"/><circle cx="24" cy="26" r="8" fill="#7FD6FF" stroke="#FFFFFF" stroke-width="2"/><rect x="14" y="10" width="10" height="5" fill="#0F1F4B"/>'
  };
  function picto(name, size) {
    size = size || 48;
    return '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">' + (PICTOS[name] || '') + '</svg>';
  }

  window.Scenes = {
    VB: VB,
    list: { entrada: entrada, hubK: function () { return hub('k'); }, hubA: function () { return hub('a'); }, patio: patio, mensaje: mensaje, voces: voces, construccion: construccion, finalNinos: finalNinos, evento: evento, reparar: reparar, control: control, domino: domino, finalAdultos: finalAdultos },
    cache: {},
    get: function (name) {
      if (!this.cache[name]) {
        var r = this.list[name]();
        var vb = r.vb = r.vb || (/^hub/.test(name) ? { x: -330, y: -102, w: 660, h: 450 } : name === 'entrada' ? VB : { x: -365, y: -95, w: 730, h: 498 });
        r.svg = '<svg viewBox="' + vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" focusable="false">' + background() + r.svg + '</svg>';
        this.cache[name] = r;
      }
      return this.cache[name];
    },
    toPercent: function (a, vb) {
      vb = vb || VB;
      var p = iso(a[0], a[1], a[2] || 0);
      return [(p[0] - vb.x) / vb.w * 100, (p[1] - vb.y) / vb.h * 100];
    },
    avatar: avatar,
    picto: picto
  };
})();

/* Les Douceurs d'Elo : dessin des gâteaux en SVG (configurateur, pièce montée, thèmes enfants).
   Gateau.svg(options) renvoie le balisage d'un gâteau vu de trois quarts. */
(function () {
  'use strict';
  var CX = 200, BASE = 404;
  var uid = 0;

  function ombrer(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function c(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); }
    return '#' + ((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1);
  }
  function arcY(x, cx, rx, ry, yt) { var t = (x - cx) / rx; return yt + ry * Math.sqrt(Math.max(0, 1 - t * t)); }
  function rnd(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  function fleur(x, y, r, coul, coeur, rot) {
    var s = '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (rot || 0) + ')">';
    for (var i = 0; i < 5; i++) {
      var a = i * 72 * Math.PI / 180;
      s += '<ellipse cx="' + (Math.cos(a) * r * .55).toFixed(1) + '" cy="' + (Math.sin(a) * r * .55).toFixed(1) + '" rx="' + (r * .55).toFixed(1) + '" ry="' + (r * .4).toFixed(1) + '" transform="rotate(' + (i * 72) + ' ' + (Math.cos(a) * r * .55).toFixed(1) + ' ' + (Math.sin(a) * r * .55).toFixed(1) + ')" fill="' + coul + '"/>';
    }
    return s + '<circle r="' + (r * .28).toFixed(1) + '" fill="' + (coeur || '#e9c46a') + '"/></g>';
  }
  function feuille(x, y, rot, coul) {
    return '<path transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot + ')" d="M0 0 C6 -5 14 -5 20 0 C14 5 6 5 0 0Z" fill="' + coul + '"/>';
  }
  function fraise(x, y, s) {
    return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + s + ')"><path d="M0 -9 C8 -9 10 -2 6 6 C4 10 1 12 0 12 C-1 12 -4 10 -6 6 C-10 -2 -8 -9 0 -9Z" fill="#c8313f"/>' +
      '<circle cx="-2.5" cy="-1" r=".8" fill="#f6d27a"/><circle cx="2.5" cy="1" r=".8" fill="#f6d27a"/><circle cx="0" cy="5" r=".8" fill="#f6d27a"/>' +
      '<path d="M-6 -9 L0 -6 L6 -9 L3 -12 L0 -10 L-3 -12Z" fill="#4f7d3a"/></g>';
  }
  function rosette(x, y, r, coul) {
    var o = ombrer(coul, -.12);
    return '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"><circle r="' + r + '" fill="' + coul + '"/><path d="M' + (-r * .7) + ' 0 a' + (r * .7) + ' ' + (r * .7) + ' 0 1 1 ' + (r * 1.1) + ' ' + (-r * .4) + '" fill="none" stroke="' + o + '" stroke-width="1.4"/><circle cy="' + (-r * .5) + '" r="' + (r * .45) + '" fill="' + ombrer(coul, .25) + '"/></g>';
  }

  var ICONES = {
    couronne: function (c) { return '<path d="M-22 10 L-26 -14 L-12 -2 L0 -20 L12 -2 L26 -14 L22 10Z" fill="' + c + '" stroke="#8c6a36" stroke-width="1.2"/><circle cx="0" cy="-20" r="3" fill="#f6e7cf"/><circle cx="-26" cy="-14" r="2.5" fill="#f6e7cf"/><circle cx="26" cy="-14" r="2.5" fill="#f6e7cf"/>'; },
    etoile: function (c) { return '<path d="M0 -24 L6 -8 L23 -8 L9 2 L14 19 L0 9 L-14 19 L-9 2 L-23 -8 L-6 -8Z" fill="' + c + '" stroke="#8c6a36" stroke-width="1"/>'; },
    licorne: function (c) { return '<path d="M-7 14 L0 -30 L7 14Z" fill="' + c + '"/><path d="M-6 8 L6 4 M-4.5 -2 L4.5 -6 M-3 -12 L3 -16" stroke="#fff" stroke-width="2"/>'; },
    coquillage: function (c) { return '<path d="M0 16 C-20 14 -24 -4 -14 -16 C-6 -24 6 -24 14 -16 C24 -4 20 14 0 16Z" fill="' + c + '"/><path d="M0 16 L0 -20 M0 16 L-10 -16 M0 16 L10 -16 M0 16 L-17 -6 M0 16 L17 -6" stroke="#fff" stroke-width="1.4" opacity=".8"/>'; },
    feuille: function (c) { return '<path d="M0 18 C-22 4 -18 -20 0 -26 C18 -20 22 4 0 18Z" fill="' + c + '"/><path d="M0 18 L0 -22" stroke="#fff" stroke-width="1.5" opacity=".7"/>'; },
    ballon: function (c) { return '<circle r="20" fill="#fff" stroke="#2e211b" stroke-width="1.5"/><path d="M0 -8 L8 -2 L5 8 L-5 8 L-8 -2Z" fill="#2e211b"/><path d="M0 -8 L0 -20 M8 -2 L19 -6 M5 8 L12 16 M-5 8 L-12 16 M-8 -2 L-19 -6" stroke="#2e211b" stroke-width="1.3"/>'; },
    fusee: function (c) { return '<path d="M0 -28 C10 -18 10 0 7 12 L-7 12 C-10 0 -10 -18 0 -28Z" fill="#f4f1ec" stroke="#2e211b" stroke-width="1.2"/><circle cy="-8" r="4.5" fill="' + c + '" stroke="#2e211b"/><path d="M-7 4 L-15 16 L-6 12Z M7 4 L15 16 L6 12Z" fill="' + c + '"/><path d="M-4 13 L0 24 L4 13Z" fill="#f0a12f"/>'; },
    dino: function (c) { return '<path d="M-24 14 C-24 0 -10 -6 0 -4 C8 -14 20 -14 22 -6 C24 0 16 2 10 2 L10 14Z" fill="' + c + '"/><path d="M-14 -3 L-10 -12 L-6 -4 M-4 -5 L0 -14 L3 -6" fill="' + ombrer(c, -.25) + '"/><circle cx="16" cy="-8" r="1.8" fill="#2e211b"/>'; },
    arcenciel: function () { var cs = ['#e76f51', '#f4a261', '#e9c46a', '#8ab17d', '#6aa6c8'], s = ''; for (var i = 0; i < 5; i++) { s += '<path d="M' + (-26 + i * 4) + ' 14 A' + (26 - i * 4) + ' ' + (26 - i * 4) + ' 0 0 1 ' + (26 - i * 4) + ' 14" fill="none" stroke="' + cs[i] + '" stroke-width="4"/>'; } return s; },
    nuage: function (c) { return '<path d="M-22 10 C-30 10 -30 -4 -20 -4 C-20 -16 -4 -18 0 -8 C6 -18 22 -14 20 -2 C30 -2 30 10 22 10Z" fill="' + c + '" stroke="#8fb8d8" stroke-width="1.2"/>'; },
    fleur: function (c) { return fleur(0, 0, 18, c, '#f6d27a', 0); }
  };

  /* options : {
       etages: [{w, h}], creme, accent, finition: 'lisse'|'naked'|'drip', parfum: [genoise, creme, garniture],
       deco: {fleurs, or, perles, fruits, rosettes}, texte, bougie, icone, cupcakes: n, cupcakesSeuls }
  */
  function svg(o) {
    uid++;
    var id = 'g' + uid, s = '', defs = '', cr = o.creme || '#fbf3ea', ac = o.accent || '#b48a4e';
    var et = o.etages || [], deco = o.deco || {}, R = rnd(7 + et.length * 13);
    var parfum = o.parfum || ['#f0dbb2', '#fbf3ea', '#d9475b'];
    defs += '<linearGradient id="' + id + 'sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>';
    defs += '<radialGradient id="' + id + 'pl" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9d2c8"/></radialGradient>';
    defs += '<linearGradient id="' + id + 'or" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc9e"/><stop offset=".5" stop-color="#c89a4a"/><stop offset="1" stop-color="#8c6a36"/></linearGradient>';

    var w0 = et.length ? et[0].w : 220;
    var cupOnly = o.cupcakesSeuls;
    // ombre et plateau
    s += '<ellipse cx="' + CX + '" cy="' + (BASE + 14) + '" rx="' + (w0 / 2 + 46) + '" ry="16" fill="#2e211b" opacity=".12"/>';
    if (!cupOnly) {
      s += '<ellipse cx="' + CX + '" cy="' + (BASE + 4) + '" rx="' + (w0 / 2 + 28) + '" ry="' + ((w0 / 2 + 28) * .22).toFixed(1) + '" fill="url(#' + id + 'pl)" stroke="#cfc6ba"/>';
      s += '<path d="M' + (CX - w0 / 2 - 28) + ' ' + (BASE + 4) + ' v5 a' + (w0 / 2 + 28) + ' ' + ((w0 / 2 + 28) * .22).toFixed(1) + ' 0 0 0 ' + (w0 + 56) + ' 0 v-5" fill="#cfc6ba"/>';
    }

    var yb = BASE, sommet = BASE, rxTop = 0;
    et.forEach(function (t, i) {
      var rx = t.w / 2, ry = rx * .22, yt = yb - t.h, cl = id + 'c' + i;
      var corps = 'M' + (CX - rx) + ' ' + yt + ' V' + yb + ' A' + rx + ' ' + ry.toFixed(1) + ' 0 0 0 ' + (CX + rx) + ' ' + yb + ' V' + yt + ' A' + rx + ' ' + ry.toFixed(1) + ' 0 0 1 ' + (CX - rx) + ' ' + yt + 'Z';
      defs += '<clipPath id="' + cl + '"><path d="' + corps + '"/></clipPath>';
      var g = '<g class="etage" style="animation-delay:' + (i * 70) + 'ms">';
      if (o.finition === 'naked') {
        g += '<path d="' + corps + '" fill="' + parfum[0] + '"/>';
        var bandes = '', n = Math.max(2, Math.round(t.h / 34)), hb = t.h / n;
        for (var k = 0; k < n; k++) {
          var y0 = yt + k * hb + hb * .62;
          bandes += '<rect x="' + (CX - rx) + '" y="' + y0.toFixed(1) + '" width="' + t.w + '" height="' + (hb * .2).toFixed(1) + '" fill="' + parfum[1] + '"/>';
          bandes += '<rect x="' + (CX - rx) + '" y="' + (y0 + hb * .2).toFixed(1) + '" width="' + t.w + '" height="' + (hb * .12).toFixed(1) + '" fill="' + parfum[2] + '"/>';
        }
        g += '<g clip-path="url(#' + cl + ')">' + bandes + '<rect x="' + (CX - rx) + '" y="' + yt + '" width="' + t.w + '" height="' + (t.h + ry) + '" fill="' + cr + '" opacity=".38"/></g>';
      } else {
        g += '<path d="' + corps + '" fill="' + cr + '"/>';
      }
      g += '<path d="' + corps + '" fill="url(#' + id + 'sh)"/>';
      // dessus
      var topCol = o.finition === 'drip' ? ac : (o.finition === 'naked' ? ombrer(cr, -.03) : ombrer(cr, .35));
      g += '<ellipse cx="' + CX + '" cy="' + yt + '" rx="' + rx + '" ry="' + ry.toFixed(1) + '" fill="' + topCol + '"/>';
      if (o.finition === 'drip') {
        var p = 'M' + (CX - rx) + ' ' + yt, nb = Math.max(6, Math.round(t.w / 22)), pas = t.w / nb;
        for (var d = 0; d < nb; d++) {
          var x1 = CX - rx + d * pas, xm = x1 + pas * .5, x2 = x1 + pas;
          var ym = arcY(xm, CX, rx, ry, yt), y2 = arcY(x2, CX, rx, ry, yt);
          var L = 8 + R() * (t.h * .42), lw = pas * .22;
          p += ' L' + (xm - lw).toFixed(1) + ' ' + arcY(xm - lw, CX, rx, ry, yt).toFixed(1) + ' V' + (ym + L).toFixed(1) + ' a' + lw.toFixed(1) + ' ' + lw.toFixed(1) + ' 0 0 0 ' + (2 * lw).toFixed(1) + ' 0 V' + arcY(xm + lw, CX, rx, ry, yt).toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1);
        }
        p += ' A' + rx + ' ' + ry.toFixed(1) + ' 0 0 0 ' + (CX - rx) + ' ' + yt + 'Z';
        g += '<path d="' + p + '" fill="' + ac + '"/><ellipse cx="' + (CX - rx * .35) + '" cy="' + (yt - ry * .2).toFixed(1) + '" rx="' + (rx * .3).toFixed(1) + '" ry="' + (ry * .25).toFixed(1) + '" fill="#fff" opacity=".22"/>';
      }
      if (deco.or) {
        for (var q = 0; q < 3; q++) {
          var gx = CX - rx * .7 + R() * rx * 1.2, gy = yt + ry + 10 + R() * (t.h - ry - 24);
          g += '<path d="M' + gx.toFixed(1) + ' ' + gy.toFixed(1) + ' l' + (6 + R() * 8).toFixed(1) + ' -4 l5 7 l-3 8 l-9 1 l-4 -6Z" fill="url(#' + id + 'or)" opacity=".95"/>';
        }
      }
      if (deco.perles) {
        var np = Math.round(t.w / 11);
        for (var m = 0; m <= np; m++) {
          var px = CX - rx + 5 + m * (t.w - 10) / np;
          g += '<circle cx="' + px.toFixed(1) + '" cy="' + (arcY(px, CX, rx, ry, yb) - 4).toFixed(1) + '" r="3.6" fill="#fffaf0" stroke="#d9cbb3" stroke-width=".8"/>';
        }
      }
      if (deco.rosettes) {
        var nr = Math.max(4, Math.round(t.w / 34));
        for (var z = 0; z < nr; z++) {
          var rxp = CX - rx + 14 + z * (t.w - 28) / (nr - 1);
          g += rosette(rxp, arcY(rxp, CX, rx, ry, yt) - 4, 7, o.finition === 'drip' ? ombrer(cr, .3) : ombrer(cr, .45));
        }
      }
      g += '</g>';
      s += g;
      yb = yt; sommet = yt; rxTop = rx;
      t._yt = yt; t._rx = rx; t._ry = ry;
    });

    // fleurs en cascade
    if (deco.fleurs && et.length) {
      var fc = o.couleurFleurs || '#e8a6a6';
      et.forEach(function (t, i) {
        var nf = i === et.length - 1 ? 4 : 2;
        for (var f = 0; f < nf; f++) {
          var fx = CX + t._rx * (.35 + R() * .45) * (i % 2 ? -1 : 1), fy = t._yt + t._ry * .6 + (i === et.length - 1 ? -4 : 6) + R() * 10;
          s += feuille(fx - 6, fy + 4, 150 + R() * 40, '#7d9a6a') + feuille(fx + 4, fy + 6, 20 + R() * 30, '#8aa878');
          s += fleur(fx, fy, 9 + R() * 5, f % 2 ? ombrer(fc, .35) : fc, '#f3d27a', R() * 60);
        }
      });
    }
    if (deco.fruits && et.length) {
      var tt = et[et.length - 1];
      for (var fr = 0; fr < 5; fr++) {
        var frx = CX - tt._rx * .6 + fr * tt._rx * .3;
        s += fraise(frx, tt._yt - 2 + (fr % 2) * 5, 1);
      }
    }

    // décor du sommet
    var ryTop = et.length ? et[et.length - 1]._ry : 0, hautTop = sommet - ryTop - 4;
    if (o.bougie && et.length) {
      var ch = String(o.bougie).slice(0, 2), x0 = CX - (ch.length - 1) * 17;
      for (var b = 0; b < ch.length; b++) {
        var bx = x0 + b * 34;
        s += '<g transform="translate(' + bx + ' ' + (sommet - 6) + ')"><text x="0" y="0" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="56" fill="url(#' + id + 'or)" stroke="#8c6a36" stroke-width=".8">' + ch[b] + '</text>' +
          '<rect x="-1" y="-58" width="2" height="9" fill="#2e211b"/><path class="bougie-flamme" d="M0 -74 C5 -66 5 -60 0 -58 C-5 -60 -5 -66 0 -74Z" fill="#f4a73b"/><path class="bougie-flamme" d="M0 -69 C2.5 -64 2.5 -61 0 -60 C-2.5 -61 -2.5 -64 0 -69Z" fill="#fff3c4"/></g>';
      }
      hautTop = sommet - 80;
    } else if (o.icone && ICONES[o.icone]) {
      s += '<g transform="translate(' + CX + ' ' + (sommet - 26) + ')">' + ICONES[o.icone](ac) + '</g>';
      hautTop = sommet - 54;
    }
    if (o.texte && et.length) {
      var ty = hautTop - 20, txt = String(o.texte).slice(0, 22).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      s += '<path d="M' + (CX - 40) + ' ' + (sommet + 2) + ' L' + (CX - 40) + ' ' + (ty + 6) + ' M' + (CX + 40) + ' ' + (sommet + 2) + ' L' + (CX + 40) + ' ' + (ty + 6) + '" stroke="#b48a4e" stroke-width="1.6"/>';
      s += '<text x="' + CX + '" y="' + ty + '" text-anchor="middle" font-family="Pinyon Script, cursive" font-size="' + (txt.length > 12 ? 28 : 36) + '" fill="url(#' + id + 'or)" stroke="#8c6a36" stroke-width=".5">' + txt + '</text>';
    }

    // cupcakes
    var nc = o.cupcakes || 0;
    if (nc) {
      var cupS = '';
      var total = nc, cols = cupOnly ? Math.min(5, total) : total, rows = Math.ceil(total / cols);
      for (var c = 0; c < total; c++) {
        var col = c % cols, row = Math.floor(c / cols), cx, cy;
        if (cupOnly) { cx = CX - (cols - 1) * 36 + col * 72 + (row % 2 ? 8 : -8); cy = BASE - 40 - (rows - 1 - row) * 84; }
        else { var milieu = (total - 1) / 2; cx = CX - milieu * 50 + c * 50; cy = BASE + 24 - Math.pow(c - milieu, 2) * 2.2; }
        cupS += cupcake(cx, cy, cupOnly ? 1.3 : .72, o.creme || '#f6e7cf', ac, deco);
      }
      s += cupS;
    }
    return '<svg class="gateau-rendu" viewBox="0 0 400 440" role="img" aria-label="' + (o.label || 'Aperçu du gâteau') + '"><defs>' + defs + '</defs>' + s + '</svg>';
  }

  function cupcake(x, y, k, creme, ac, deco) {
    var s = '<g class="etage" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + k + ')">';
    s += '<path d="M-20 -22 L20 -22 L15 4 L-15 4Z" fill="#c9a77a"/><path d="M-12 -22 L-10 4 M-4 -22 L-3 4 M4 -22 L3 4 M12 -22 L10 4" stroke="#a9875a" stroke-width="1.5"/>';
    s += '<path d="M-24 -22 C-28 -34 -16 -38 -12 -40 C-12 -52 12 -52 12 -40 C16 -38 28 -34 24 -22Z" fill="' + creme + '"/>';
    s += '<path d="M-16 -32 C-8 -28 8 -28 16 -32 M-8 -43 C-3 -40 3 -40 8 -43" stroke="' + ombrer(creme, -.12) + '" stroke-width="1.6" fill="none"/>';
    if (deco && deco.fruits) s += fraise(0, -52, .7);
    else if (deco && deco.or) s += '<path d="M-4 -50 l6 -3 l4 5 l-2 5 l-7 0Z" fill="#d4a94f"/>';
    else s += '<circle cy="-50" r="4" fill="' + ac + '"/>';
    return s + '</g>';
  }

  window.Gateau = { svg: svg, ombrer: ombrer, icones: Object.keys(ICONES) };
})();

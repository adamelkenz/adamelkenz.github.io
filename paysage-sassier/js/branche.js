/* Vieille branche d'olivier, peinte en code, qui longe le bord droit du site.

   - Le bois (tronc noueux, grosse branche de l'accueil, moignons coupés) est
     statique : il est peint une fois, par tranches, dans des canvas cachés.
     L'écorce est une texture calculée pixel par pixel (crevasses, plaques,
     lichens, éclairage en relief) plaquée le long des courbes.
   - Rameaux, feuilles et olives bougent : canvas fixe de la taille de
     l'écran, on ne redessine que le visible.
   - La souris bouscule les feuilles ; secouées, elles se retournent et
     montrent leur revers argenté, puis certaines tombent. Le vent fait de
     même par rafales, le défilement fait frémir le feuillage. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.createElement('canvas');
  canvas.className = 'rameau';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var DPR = 1, VW = 0, VH = 0, DOC_H = 0, W = 0;
  var boughs = [], twigs = [], falling = [], chunks = {}, pieces = [];
  var CH = 700;                          // hauteur d'une tranche de bois en cache
  var mouse = { x: -1e4, y: -1e4, cy: 0, vx: 0, vy: 0, t: 0, on: false };
  var scrollY = window.scrollY, lastScroll = scrollY;
  var BARK = null;

  /* ---------- outils ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var R = rng(1);
  function rr(a, b) { return a + (b - a) * R(); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function mk(w, h, scale) {
    var s = scale || DPR, c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w * s)); c.height = Math.max(1, Math.ceil(h * s));
    var x = c.getContext('2d'); x.scale(s, s);
    return { c: c, x: x };
  }

  // Bruit de valeur, périodique en x (pour une écorce qui se raccorde).
  function hash(x, y) {
    var h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0;
    h = Math.imul(h ^ h >>> 13, 1274126177);
    return ((h ^ h >>> 16) >>> 0) / 4294967296;
  }
  function vnoise(x, y, px) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash(x0, yi), b = hash(x1, yi), c = hash(x0, yi + 1), d = hash(x1, yi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }
  function fbm(x, y, px, oct) {
    var s = 0, amp = 0.5, n = 0;
    for (var i = 0; i < oct; i++) { s += vnoise(x, y, px) * amp; n += amp; x *= 2; y *= 2; px *= 2; amp *= 0.5; }
    return s / n;
  }
  // bruit 1D lisse pour les irrégularités du bois
  function n1(x, seed) { return vnoise(x, seed, 1 << 20) * 2 - 1; }

  /* ---------- texture d'écorce ---------- */
  // u : le long de la branche (périodique sur TW), v : en travers (0 = côté éclairé).
  var TW = 512, TH = 128, TWX = TW + 64;
  function makeBark() {
    var s = mk(TWX, TH, 1), x = s.x, img = x.createImageData(TWX, TH), d = img.data;
    var hgt = new Float32Array(TWX * TH), lich = new Float32Array(TWX * TH), tone = new Float32Array(TWX * TH);
    var u, v, i;
    for (v = 0; v < TH; v++) {
      for (u = 0; u < TWX; u++) {
        var X = u / TW * 4, Y = v / TH * 5;
        // crevasses longitudinales, déformées pour casser la régularité
        var wx = fbm(X * 2 + 3, Y * 0.6, 8, 3) * 0.9;
        var f = fbm(X + wx, Y + wx * 0.4, 4, 5);
        var crev = Math.pow(Math.abs(f * 2 - 1), 0.42);
        // plaques d'écorce séparées par des fentes transversales
        var pl = fbm(X * 3 + 7, Y * 1.1 + 3, 12, 3);
        var brk = smooth(0.0, 0.09, Math.abs(vnoise(X * 5 + 1, Y * 0.8 + 9, 20) - 0.5));
        var grain = vnoise(u / 4, v / 2, TW / 4);
        i = v * TWX + u;
        hgt[i] = (crev * 0.66 + pl * 0.3) * (0.8 + 0.2 * brk) + grain * 0.04;
        lich[i] = fbm(X * 1.3 + 31, Y * 0.5 + 17, 8, 4);
        tone[i] = fbm(X * 0.5 + 5, Y * 0.3 + 9, 3, 3);
      }
    }
    var L = [-0.35, -0.75, 0.56];                                    // lumière : en haut, côté v = 0
    for (v = 0; v < TH; v++) {
      for (u = 0; u < TWX; u++) {
        i = v * TWX + u;
        var hu = hgt[v * TWX + Math.min(u + 1, TWX - 1)] - hgt[v * TWX + Math.max(u - 1, 0)];
        var hv = hgt[Math.min(v + 1, TH - 1) * TWX + u] - hgt[Math.max(v - 1, 0) * TWX + u];
        var nx = -hu * 7, ny = -hv * 10, nz = 1, nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
        var diff = clamp((nx * L[0] + ny * L[1] + nz * L[2]) / nl, 0, 1);
        var h = hgt[i];
        var ao = 0.28 + 0.72 * smooth(0.08, 0.55, h);
        var shade = (0.42 + diff * 0.78) * ao;
        // gris argenté sur les crêtes, brun chaud au fond des crevasses
        var t = tone[i];
        var r = lerp(44, 168, h) + (t - 0.5) * 34;
        var g = lerp(37, 162, h) + (t - 0.5) * 24;
        var b = lerp(31, 148, h) + (t - 0.5) * 14;
        // lichens gris-vert sur les crêtes
        var lc = smooth(0.6, 0.7, lich[i]) * smooth(0.45, 0.7, h);
        if (lc > 0) {
          var sp = vnoise(u / 1.6, v / 1.6, Math.round(TW / 1.6)) > 0.45 ? 1 : 0.55;
          r = lerp(r, 170, lc * sp); g = lerp(g, 174, lc * sp); b = lerp(b, 138, lc * sp);
        }
        d[i * 4] = clamp(r * shade, 0, 255);
        d[i * 4 + 1] = clamp(g * shade, 0, 255);
        d[i * 4 + 2] = clamp(b * shade, 0, 255);
        d[i * 4 + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    return s.c;
  }

  /* ---------- sprites : feuilles, olives ---------- */
  function leafOutline(x, len, wid, pl, curl) {
    var n = 26, i, t, hw;
    x.beginPath(); x.moveTo(pl, 0);
    for (i = 1; i <= n; i++) {
      t = i / n; hw = wid * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.9);
      x.lineTo(pl + t * (len - pl), -hw + curl * t * t * wid);
    }
    for (i = n - 1; i >= 1; i--) {
      t = i / n; hw = wid * 0.92 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.9);
      x.lineTo(pl + t * (len - pl), hw + curl * t * t * wid);
    }
    x.closePath();
  }

  // Feuille d'olivier : lancéolée, dessus vert-gris mat, revers argenté duveteux.
  function leafSprites(len, wid) {
    var pad = 10, w = len + pad * 2, h = wid * 2 + pad * 2 + 6, pl = len * 0.07;
    var curl = rr(-0.5, 0.5), hue = rr(72, 88), dl = rr(-4, 4);
    function face(under) {
      var s = mk(w, h), x = s.x;
      x.translate(pad, h / 2);
      x.strokeStyle = under ? '#8d8f78' : '#5d5a45'; x.lineWidth = 1.2; x.lineCap = 'round';
      x.beginPath(); x.moveTo(0, 0); x.lineTo(pl + 1, 0); x.stroke();
      leafOutline(x, len, wid, pl, curl);
      var g = x.createLinearGradient(pl, -wid, len, wid);
      if (under) {
        g.addColorStop(0, 'hsl(' + (hue - 10) + ',12%,' + (62 + dl) + '%)');
        g.addColorStop(0.5, 'hsl(' + (hue - 6) + ',14%,' + (72 + dl) + '%)');
        g.addColorStop(1, 'hsl(' + (hue - 8) + ',10%,' + (66 + dl) + '%)');
      } else {
        g.addColorStop(0, 'hsl(' + hue + ',22%,' + (22 + dl) + '%)');
        g.addColorStop(0.55, 'hsl(' + (hue + 2) + ',20%,' + (29 + dl) + '%)');
        g.addColorStop(1, 'hsl(' + (hue + 4) + ',18%,' + (34 + dl) + '%)');
      }
      x.fillStyle = g; x.fill();
      x.save(); x.clip();
      if (under) {
        // duvet argenté : poils étoilés en minuscules points
        for (var k = 0; k < len * wid * 0.5; k++) {
          x.fillStyle = 'rgba(240,242,230,' + rr(0.08, 0.3) + ')';
          x.fillRect(pl + R() * (len - pl), (R() * 2 - 1) * wid, 0.8, 0.8);
        }
      } else {
        // reflet cireux, très léger, et moitié inférieure dans l'ombre
        var sh = x.createLinearGradient(0, -wid, 0, wid);
        sh.addColorStop(0, 'rgba(230,235,210,.16)'); sh.addColorStop(0.45, 'rgba(230,235,210,0)');
        sh.addColorStop(0.55, 'rgba(10,15,5,0)'); sh.addColorStop(1, 'rgba(10,15,5,.22)');
        x.fillStyle = sh; x.fillRect(0, -wid - 2, len + 2, wid * 2 + 4);
      }
      x.restore();
      // nervure médiane
      x.strokeStyle = under ? 'rgba(120,120,95,.7)' : 'rgba(170,175,140,.55)'; x.lineWidth = under ? 1 : 0.8;
      x.beginPath(); x.moveTo(pl, 0); x.quadraticCurveTo((pl + len) / 2, curl * wid * 0.3, len * 0.97, curl * wid * 0.9); x.stroke();
      // marge légèrement enroulée : liseré clair
      leafOutline(x, len, wid, pl, curl);
      x.strokeStyle = under ? 'rgba(90,92,72,.55)' : 'rgba(165,170,135,.45)'; x.lineWidth = 0.7; x.stroke();
      return s.c;
    }
    var o = mk(w, h), y = o.x;
    y.translate(pad - 3000, h / 2);
    y.shadowColor = 'rgba(30,36,20,.42)'; y.shadowBlur = 4 * DPR; y.shadowOffsetX = 3000 * DPR;
    leafOutline(y, len, wid, pl, curl); y.fillStyle = '#000'; y.fill();
    return { top: face(false), under: face(true), shadow: o.c, ox: pad, oy: h / 2, w: w, h: h, len: len };
  }

  // Olive : drupe ovale, verte, violacée ou noire, au reflet net.
  function oliveSprite(r) {
    var pad = 8, rw = r, rh = r * 1.32, w = rw * 2 + pad * 2, h = rh * 2 + pad * 2;
    var s = mk(w, h), x = s.x, kind = R();
    var c = kind < 0.45 ? ['#c3c873', '#8e9a3c', '#4f5a1c'] :
            kind < 0.75 ? ['#9a6a7c', '#5c2c40', '#2a1220'] : ['#5a5060', '#211a24', '#0b080c'];
    x.translate(w / 2, h / 2);
    x.beginPath(); x.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
    var g = x.createRadialGradient(-rw * 0.35, -rh * 0.35, rw * 0.1, 0, 0, rh * 1.1);
    g.addColorStop(0, c[0]); g.addColorStop(0.45, c[1]); g.addColorStop(1, c[2]);
    x.fillStyle = g; x.fill();
    x.fillStyle = 'rgba(255,255,250,.75)';
    x.beginPath(); x.ellipse(-rw * 0.38, -rh * 0.42, rw * 0.2, rh * 0.12, -0.5, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,250,.18)';
    x.beginPath(); x.ellipse(rw * 0.3, rh * 0.45, rw * 0.35, rh * 0.18, 0.4, 0, Math.PI * 2); x.fill();
    var o = mk(w, h), y = o.x;
    y.translate(w / 2 - 3000, h / 2);
    y.shadowColor = 'rgba(25,25,15,.4)'; y.shadowBlur = 4 * DPR; y.shadowOffsetX = 3000 * DPR;
    y.beginPath(); y.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2); y.fill();
    return { img: s.c, shadow: o.c, ox: w / 2, oy: h / 2, w: w, h: h, rh: rh };
  }

  /* ---------- géométrie du bois ---------- */
  // Une « bough » : ligne médiane + largeur, bords gauche/droite, abscisse curviligne.
  function makeBough(center, widthAt, seed, opts) {
    opts = opts || {};
    var pts = [], s = 0, i;
    for (i = 0; i < center.length; i++) {
      var p = center[i];
      if (i > 0) { var q = center[i - 1]; s += Math.hypot(p.x - q.x, p.y - q.y); }
      pts.push({ x: p.x, y: p.y, s: s });
    }
    var total = s;
    // renflements, nœuds, irrégularités de section
    var knots = [];
    for (var k = 0; k < total / 140; k++) knots.push({ s: rr(0, total), a: rr(0.15, 0.4), wdt: rr(10, 26) });
    for (i = 0; i < pts.length; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      var dx = b.x - a.x, dy = b.y - a.y, dl = Math.hypot(dx, dy) || 1;
      var nx = -dy / dl, ny = dx / dl;
      var t = pts[i].s / (total || 1), w = widthAt(t);
      var bump = 0;
      knots.forEach(function (kn) { bump += kn.a * Math.exp(-Math.pow((pts[i].s - kn.s) / kn.wdt, 2)); });
      var irr = n1(pts[i].s / 45, seed) * 0.12 + n1(pts[i].s / 13, seed + 7) * 0.05;
      var wl = w / 2 * (1 + irr + bump * (0.7 + 0.6 * n1(kn0(i), seed + 3)));
      var wr = w / 2 * (1 - irr * 0.6 + bump * (0.7 + 0.6 * n1(kn0(i) + 9, seed + 5)));
      pts[i].w = w; pts[i].nx = nx; pts[i].ny = ny;
      pts[i].lx = pts[i].x + nx * wl; pts[i].ly = pts[i].y + ny * wl;
      pts[i].rx = pts[i].x - nx * wr; pts[i].ry = pts[i].y - ny * wr;
    }
    function kn0(i) { return i * 0.05; }
    var y0 = Infinity, y1 = -Infinity, x0 = Infinity, x1 = -Infinity;
    pts.forEach(function (p) {
      y0 = Math.min(y0, p.ly, p.ry); y1 = Math.max(y1, p.ly, p.ry);
      x0 = Math.min(x0, p.lx, p.rx); x1 = Math.max(x1, p.lx, p.rx);
    });
    var bo = { pts: pts, total: total, x0: x0, x1: x1, y0: y0, y1: y1, seed: seed,
               knots: knots, cut: !!opts.cut, uOff: rr(0, TW) };
    if (!opts.detached) boughs.push(bo);
    return bo;
  }

  // Ligne médiane tortueuse : courbe de Bézier + coudes + ondulations.
  function gnarlyCurve(p0, p1, p2, step, amp, seed) {
    var len = Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y);
    var n = Math.max(4, Math.round(len / step)), out = [];
    for (var i = 0; i <= n; i++) {
      var u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
      var x = a * p0.x + b * p1.x + c * p2.x, y = a * p0.y + b * p1.y + c * p2.y;
      var tx = 2 * (1 - u) * (p1.x - p0.x) + 2 * u * (p2.x - p1.x), ty = 2 * (1 - u) * (p1.y - p0.y) + 2 * u * (p2.y - p1.y);
      var tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
      var d = (n1(u * len / 120, seed) * 0.8 + n1(u * len / 37, seed + 1) * 0.35) * amp * Math.sin(Math.PI * Math.min(1, u * 1.2));
      out.push({ x: x + nx * d, y: y + ny * d });
    }
    return out;
  }

  function pointOn(bo, t) {
    var target = t * bo.total, p = bo.pts, i = 0;
    while (i < p.length - 1 && p[i + 1].s < target) i++;
    return p[i];
  }

  /* ---------- rameaux, feuilles, olives ---------- */
  function addTwig(bx, by, ang, L, w0, S, opt) {
    var tw = { bx: bx, by: by, ang: ang, L: L, w0: w0, bend: rr(-0.18, 0.18) * L,
               a: 0, v: 0, k: 0.028, d: 0.93, phase: rr(0, 6.3), leaves: [], olives: [] };
    tw.at = function (u) {
      var ca = Math.cos(tw.ang), sa = Math.sin(tw.ang), x = u * tw.L, y = 4 * u * (1 - u) * tw.bend;
      return { x: x * ca - y * sa, y: x * sa + y * ca };
    };
    // feuilles opposées par paires, serrées vers l'extrémité (port de l'olivier)
    var pairs = opt.pairs || 4;
    for (var i = 0; i < pairs; i++) {
      var u = lerp(0.22, 0.94, Math.pow(i / Math.max(1, pairs - 1), 0.8));
      for (var sd = -1; sd <= 1; sd += 2) {
        var len = rr(38, 58) * S, wid = len * rr(0.1, 0.13);
        tw.leaves.push(mkLeaf(tw, u, sd * rr(0.35, 0.75), len, wid));
      }
    }
    var tl = rr(42, 60) * S;
    tw.leaves.push(mkLeaf(tw, 1, rr(-0.12, 0.12), tl, tl * 0.115));
    if (opt.olives) {
      var cnt = 2 + (R() * 3 | 0), ua = rr(0.35, 0.65);
      for (var j = 0; j < cnt; j++) {
        var r = rr(5, 7) * S;
        tw.olives.push({ u: ua, r: r, stalk: rr(6, 14) * S, sp: oliveSprite(r), p: rr(-0.5, 0.5), v: 0 });
      }
    }
    tw.y0 = by - L - 70 * S; tw.y1 = by + L + 70 * S;
    twigs.push(tw);
  }
  function mkLeaf(tw, u, rel, len, wid) {
    return { u: u, rel: rel, sp: leafSprites(len, wid), a: 0, v: 0, tw: 0, tv: 0,
             k: rr(0.04, 0.06), d: 0.9, phase: rr(0, 6.3), dir: R() < 0.5 ? -1 : 1, gone: 0, grow: 1 };
  }

  /* ---------- construction ---------- */
  function marginRight() {
    var content = Math.min(W, 1200), gutter = clamp(W * 0.04, 16, 56);
    return (W - content) / 2 + gutter;
  }

  function pageSeed() {
    var h = 0, s = location.pathname;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761) >>> 0;
    return h % 100000;
  }

  function build() {
    R = rng(document.querySelector('.hero-art') ? 1975 : 1975 + pageSeed());
    W = document.documentElement.clientWidth;
    DOC_H = Math.max(document.documentElement.scrollHeight, VH);
    boughs = []; twigs = []; falling = []; chunks = {}; pieces = [];
    var m = marginRight(), mobile = W < 760;
    var S = mobile ? 0.5 : clamp(m / 176, 0.62, 1.35);
    var edge = mobile ? W - 10 : W - Math.max(30, m * 0.42);
    var reach = mobile ? 14 : Math.max(30, m * 0.6);
    var top = 64, bot = DOC_H - 20;

    // tronc : entre par le bord en haut, descend dans la marge en se tordant
    var c = [], ph = rr(0, 6);
    var amp1 = mobile ? 4 : m * 0.16, amp2 = mobile ? 3 : m * 0.1;
    for (var y = top; y <= bot; y += 5) {
      var x = edge + Math.sin(y / 300 + ph) * amp1 + Math.sin(y / 820 + 2) * amp2 +
              n1(y / 70, 3) * (mobile ? 2 : 9 * S) + n1(y / 19, 4) * (mobile ? 0.6 : 2 * S);
      if (y < top + 240) { var e = (y - top) / 240; x = lerp(W + 50, x, 1 - Math.pow(1 - e, 2.4)); }
      c.push({ x: x, y: y });
    }
    var wTop = mobile ? 11 : 30 * S, wBot = mobile ? 5 : 11 * S;
    var trunk = makeBough(c, function (t) { return lerp(wTop, wBot, Math.pow(t, 0.7)); }, 11);

    // moignons de branches coupées le long du tronc
    for (var sy = top + 420; sy < bot - 200; sy += rr(520, 900)) {
      var sp = pointOn(trunk, (sy - top) / (bot - top));
      var side = R() < 0.6 ? -1 : 1, sa = side < 0 ? Math.PI + rr(0.3, 0.7) : -rr(0.3, 0.7);
      var sl = sp.w * rr(0.8, 1.3);
      makeBough([{ x: sp.x, y: sp.y }, { x: sp.x + Math.cos(sa) * sl, y: sp.y + Math.sin(sa) * sl }],
                function () { return sp.w * 0.5; }, 40 + sy | 0, { cut: true });
    }

    // grosse branche tortueuse dans l'illustration d'accueil, qui fourche
    var art = document.querySelector('.hero-art');
    if (art) {
      var b = art.getBoundingClientRect(), bt = b.top + scrollY;
      var p0 = pointOn(trunk, ((bt + b.height * (mobile ? 0.3 : 0.45)) - top) / (bot - top));
      var end = { x: b.left + b.width * 0.06, y: bt + b.height * (mobile ? 0.22 : 0.2) };
      var ctl = { x: b.left + b.width * 0.62, y: bt + b.height * 0.9 };
      var lc = gnarlyCurve(p0, ctl, end, 5, mobile ? 6 : 16, 21);
      var limb = makeBough(lc, function (t) { return lerp(p0.w * 0.82, 4, Math.pow(t, 0.75)); }, 21);
      var f1 = pointOn(limb, 0.45);
      var fork = makeBough(gnarlyCurve(f1, { x: f1.x - b.width * 0.12, y: f1.y - b.height * 0.5 },
        { x: b.left + b.width * 0.42, y: bt + b.height * 0.02 }, 5, mobile ? 4 : 10, 33),
        function (t) { return lerp(f1.w * 0.6, 3, Math.pow(t, 0.8)); }, 33);
      var f2 = pointOn(limb, 0.68);
      var fork2 = makeBough(gnarlyCurve(f2, { x: f2.x - b.width * 0.1, y: f2.y + b.height * 0.2 },
        { x: b.left + b.width * 0.24, y: bt + b.height * 0.56 }, 5, mobile ? 3 : 8, 44),
        function (t) { return lerp(f2.w * 0.55, 2.5, Math.pow(t, 0.8)); }, 44);
      var LS = mobile ? 0.8 : 1.1;
      [[limb, 10], [fork, 6], [fork2, 4]].forEach(function (pair, bi) {
        var bo = pair[0], n = pair[1];
        for (var k = 0; k < n; k++) {
          var t = 0.2 + 0.8 * (k + 0.5) / n, p = pointOn(bo, t), q = pointOn(bo, Math.min(1, t + 0.02));
          var dir = Math.atan2(q.y - p.y, q.x - p.x), s2 = k % 2 ? -1 : 1;
          addTwig(p.x, p.y, dir + s2 * rr(0.5, 1.0), rr(55, 95) * LS, 2.4, LS,
                  { pairs: (rr(4, 7) | 0), olives: (k + bi) % 3 === 1 });
        }
        var tip = bo.pts[bo.pts.length - 1], pre = bo.pts[bo.pts.length - 4];
        addTwig(tip.x, tip.y, Math.atan2(tip.y - pre.y, tip.x - pre.x), rr(50, 70) * LS, 2.2, LS, { pairs: 5 });
      });
    }

    // rameaux le long du tronc
    var y2 = top + 170;
    while (y2 < bot - 50) {
      var p = pointOn(trunk, (y2 - top) / (bot - top));
      var inward = R() < (mobile ? 0.5 : 0.7);
      var base = inward ? Math.PI + rr(0.3, 0.85) : -rr(0.3, 0.85);
      if (!inward && R() < 0.4) base = rr(0.15, 0.55);
      var L = inward ? Math.min(reach * rr(0.6, 1), 125 * S) : rr(40, 85) * S;
      if (mobile && !inward) L = rr(18, 30);
      var off = inward ? -1 : 1;
      addTwig(p.x + off * p.w * 0.3, p.y, base, L, Math.max(1.4, p.w * 0.16), S,
              { pairs: (inward ? rr(4, 7) : rr(3, 5)) | 0, olives: R() < 0.22 });
      y2 += rr(mobile ? 90 : 85, mobile ? 170 : 160);
    }
    var end2 = trunk.pts[trunk.pts.length - 1];
    addTwig(end2.x, end2.y, -Math.PI / 2 - 0.5, 45 * S, 2, S, { pairs: 4 });

    // pages intérieures : l'arbre s'organise autour du contenu
    if (!art && !mobile) growAroundPage(trunk, S, m, top, bot);
  }

  /* ---------- l'arbre contourne le contenu ---------- */
  // Grille d'occupation de la page (texte, images, formulaires…) et carte des
  // distances au contenu le plus proche : les branches ne poussent que là où
  // il reste de la place.
  var GRID = 16, gw = 0, gh = 0, occ = null, dist = null;

  function buildClearance() {
    gw = Math.ceil(W / GRID) + 1; gh = Math.ceil(DOC_H / GRID) + 1;
    occ = new Uint8Array(gw * gh);
    function mark(x0, y0, x1, y1, pad) {
      var a = Math.max(0, Math.floor((x0 - pad) / GRID)), b = Math.min(gw - 1, Math.floor((x1 + pad) / GRID));
      var c = Math.max(0, Math.floor((y0 - pad) / GRID)), d = Math.min(gh - 1, Math.floor((y1 + pad) / GRID));
      for (var j = c; j <= d; j++) for (var i = a; i <= b; i++) occ[j * gw + i] = 1;
    }
    mark(0, 0, W, 70, 0);                                   // bandeau de navigation
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), range = document.createRange(), n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.trim() || !n.parentElement || n.parentElement.closest('script,style,noscript')) continue;
      range.selectNodeContents(n);
      var rs = range.getClientRects();
      for (var k = 0; k < rs.length; k++) {
        var r = rs[k];
        if (r.width && r.height) mark(r.left, r.top + scrollY, r.right, r.bottom + scrollY, 12);
      }
    }
    document.querySelectorAll('img, svg, input, select, textarea, button, .ph, .label, .fiche, .fiche-card a, .toc, .encadre, .cta, .faq details, .map, .specimen').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width && r.height) mark(r.left, r.top + scrollY, r.right, r.bottom + scrollY, 10);
    });
    // éléments collants : ils balaient toute la hauteur de leur parent
    document.querySelectorAll('.art-side, .index-art').forEach(function (el) {
      var r = el.getBoundingClientRect(), q = el.parentElement.getBoundingClientRect();
      if (r.width) mark(r.left, q.top + scrollY, r.right, q.bottom + scrollY, 12);
    });
    distanceField();
  }

  function distanceField() {
    var N = gw * gh, D = dist = new Float32Array(N), i, j, k, v, SQ = 1.4142;
    for (k = 0; k < N; k++) D[k] = occ[k] ? 0 : 1e6;
    for (j = 0; j < gh; j++) for (i = 0; i < gw; i++) {
      k = j * gw + i; v = D[k];
      if (i > 0) v = Math.min(v, D[k - 1] + 1);
      if (j > 0) {
        v = Math.min(v, D[k - gw] + 1);
        if (i > 0) v = Math.min(v, D[k - gw - 1] + SQ);
        if (i < gw - 1) v = Math.min(v, D[k - gw + 1] + SQ);
      }
      D[k] = v;
    }
    for (j = gh - 1; j >= 0; j--) for (i = gw - 1; i >= 0; i--) {
      k = j * gw + i; v = D[k];
      if (i < gw - 1) v = Math.min(v, D[k + 1] + 1);
      if (j < gh - 1) {
        v = Math.min(v, D[k + gw] + 1);
        if (i < gw - 1) v = Math.min(v, D[k + gw + 1] + SQ);
        if (i > 0) v = Math.min(v, D[k + gw - 1] + SQ);
      }
      D[k] = v;
    }
  }

  function clearAt(x, y) {
    if (y > DOC_H - 4 || x > W - 4) return 200;                // pied de page et marge du tronc
    var i = Math.floor(x / GRID), j = Math.floor(y / GRID);
    if (i < 0 || j < 0 || i >= gw || j >= gh) return 0;
    return dist[j * gw + i] * GRID;
  }

  function occupyPath(pts, rad) {
    for (var k = 0; k < pts.length; k += 2) {
      var p = pts[k], r = Math.ceil(rad / GRID);
      var ci = Math.floor(p.x / GRID), cj = Math.floor(p.y / GRID);
      for (var j = cj - r; j <= cj + r; j++) for (var i = ci - r; i <= ci + r; i++)
        if (i >= 0 && j >= 0 && i < gw && j < gh) occ[j * gw + i] = 1;
    }
    distanceField();
  }

  // Croissance pas à pas : à chaque pas on choisit la direction qui garde
  // le plus de place tout en allant vers le but, avec un peu d'hésitation.
  function grow(start, ang, goal, maxLen, mode, stopX, w0, targetX) {
    var pos = { x: start.x, y: start.y }, pts = [{ x: pos.x, y: pos.y }], len = 0, STEP = 6, seed = R() * 1000;
    while (len < maxLen) {
      var best = null, need = lerp(w0, 3, Math.min(1, len / maxLen)) / 2 + 14;
      // les troncs verticaux sont ramenés vers le milieu de la marge
      if (targetX !== undefined) {
        var pull = clamp((targetX - pos.x) / 120, -0.7, 0.7);
        goal = mode === 'down' ? Math.PI / 2 - pull : -Math.PI / 2 + pull;
      }
      // d'abord de petites inflexions ; si c'est bouché, elle tourne franchement
      for (var spread = 4; spread <= 12 && !best; spread += 8) {
        for (var k = -spread; k <= spread; k++) {
          var a = ang + k * 0.1, nx = pos.x + Math.cos(a) * STEP, ny = pos.y + Math.sin(a) * STEP;
          var c = clearAt(nx, ny);
          if (len > 50 && c < need) continue;
          if (mode === 'cross' && Math.cos(a) > 0.25) continue;         // une traversée ne revient pas vers le tronc
          var sc = Math.min(c, 70) / 70 * 0.6 + Math.cos(a - goal) * (mode === 'cross' ? 1.4 : 1) - Math.abs(k) * 0.03 + n1(len / 90 + k * 0.3, seed) * 0.35;
          if (!best || sc > best.s) best = { a: a, x: nx, y: ny, s: sc };
        }
      }
      if (!best) break;
      ang = best.a; pos = { x: best.x, y: best.y };
      pts.push(pos); len += STEP;
      if (mode === 'cross' && pos.x < stopX) return { pts: pts, len: len, reached: true, ang: ang };
      if (mode === 'cross' && len > 220 && start.x - pos.x < len * 0.4) break;   // elle tourne en rond : abandon
      if (pos.x < 8 || pos.x > W + 40 || pos.y < 70) break;
    }
    return { pts: pts, len: len, reached: false, ang: ang };
  }

  function smoothPts(pts, it) {
    for (var n = 0; n < it; n++) {
      var out = [pts[0]];
      for (var i = 1; i < pts.length - 1; i++) {
        var a = pts[Math.max(0, i - 2)], b = pts[i - 1], c = pts[i], d = pts[i + 1], e = pts[Math.min(pts.length - 1, i + 2)];
        out.push({ x: (a.x + b.x + c.x + d.x + e.x) / 5, y: (a.y + b.y + c.y + d.y + e.y) / 5 });
      }
      out.push(pts[pts.length - 1]);
      pts = out;
    }
    return pts;
  }

  // Une branche libre : bois peint en tranches, rameaux là où il y a de la place.
  function makeLimb(path, w0, S) {
    path = smoothPts(path, 3);
    var bo = makeBough(path, function (t) { return lerp(w0, 3.2, Math.pow(t, 0.8)); }, (R() * 9999) | 0, { detached: true });
    for (var k = Math.floor(bo.y0 / CH); k <= Math.floor(bo.y1 / CH); k++) pieces.push({ boughs: [bo], ya: k * CH, yb: (k + 1) * CH, img: null });
    var p = bo.pts, s = rr(40, 80);
    for (var i = 2; i < p.length - 2; i++) {
      if (p[i].s < s) continue;
      s += rr(60, 115);
      var tang = Math.atan2(p[i + 2].y - p[i - 2].y, p[i + 2].x - p[i - 2].x), best = null;
      for (var sd = -1; sd <= 1; sd += 2) {
        var dir = tang + sd * rr(0.6, 1.15), L = rr(50, 95) * S;
        var room = clearAt(p[i].x + Math.cos(dir) * L * 0.6, p[i].y + Math.sin(dir) * L * 0.6);
        if (!best || room > best.room) best = { dir: dir, L: L, room: room };
      }
      if (best.room < 34) continue;
      var Lf = Math.min(best.L, best.room * 0.7);
      if (Lf < 30) continue;
      addTwig(p[i].x, p[i].y, best.dir, Lf, Math.max(1.4, p[i].w * 0.22), S, { pairs: Lf > 60 ? (rr(4, 6) | 0) : 3, olives: R() < 0.2 });
    }
    var tip = p[p.length - 1], pre = p[Math.max(0, p.length - 5)];
    addTwig(tip.x, tip.y, Math.atan2(tip.y - pre.y, tip.x - pre.x), rr(45, 65) * S, 2, S, { pairs: 4 });
    occupyPath(p, w0 / 2 + 26);
    return bo;
  }

  function growAroundPage(trunk, S, m, top, bot) {
    buildClearance();
    var leftX = Math.max(26, m * 0.42), y = top + 60, made = 0;
    // de grosses branches partent du tronc et traversent la page par les vides
    while (y < bot - 240 && made < 5) {
      var p = pointOn(trunk, (y - top) / (bot - top));
      var cross = grow({ x: p.x - p.w * 0.3, y: p.y }, Math.PI + rr(-0.25, 0.1), Math.PI, W * 1.3, 'cross', leftX + 24, p.w * 0.6);
      var lastC = cross.pts[cross.pts.length - 1];
      if (cross.len > 220 && p.x - lastC.x > 260) {
        var path = cross.pts;
        // arrivée dans la marge de gauche : elle redescend en second tronc
        if (cross.reached && R() < 0.75) {
          var down = grow(path[path.length - 1], cross.ang, Math.PI / 2, made ? rr(450, 1100) : rr(1400, 2600), 'down', 0, p.w * 0.5, leftX);
          path = path.concat(down.pts.slice(1));
        }
        makeLimb(path, p.w * 0.6, S);
        made++;
        y += rr(600, 1050);
      } else y += rr(80, 150);                                    // pas de place ici : un peu plus bas
    }
    // un autre tronc surgit du pied de page, à gauche, et remonte
    if (R() < 0.85) {
      var up = grow({ x: leftX + rr(-6, 6), y: bot + 30 }, -Math.PI / 2, -Math.PI / 2, rr(500, 1000), 'up', 0, 24 * S, leftX);
      if (up.len > 200) makeLimb(up.pts, 24 * S, S);
    }
  }

  /* ---------- peinture du bois (en cache, par tranches) ---------- */
  function paintBough(x, bo, ya, yb, pass) {
    var p = bo.pts, i, n = p.length;
    var i0 = 0, i1 = n - 1;
    while (i0 < n - 1 && Math.max(p[i0].ly, p[i0].ry, p[i0 + 1].ly, p[i0 + 1].ry) < ya) i0++;
    while (i1 > 0 && Math.min(p[i1].ly, p[i1].ry, p[i1 - 1].ly, p[i1 - 1].ry) > yb) i1--;
    if (i1 <= i0) return;
    i0 = Math.max(0, i0 - 1); i1 = Math.min(n - 1, i1 + 1);

    function outline() {
      x.beginPath(); x.moveTo(p[i0].lx, p[i0].ly);
      for (i = i0 + 1; i <= i1; i++) x.lineTo(p[i].lx, p[i].ly);
      for (i = i1; i >= i0; i--) x.lineTo(p[i].rx, p[i].ry);
      x.closePath();
    }

    if (pass === 'shadow') {
      x.save(); x.translate(-5000, 0);
      x.shadowColor = 'rgba(30,32,22,.38)'; x.shadowBlur = 12 * DPR;
      x.shadowOffsetX = (5000 + 7) * DPR; x.shadowOffsetY = 11 * DPR;
      outline(); x.fillStyle = '#000'; x.fill(); x.restore();
      return;
    }

    // écorce : chaque tronçon reçoit sa part de texture, transformée en affine
    var UPX = 2;                                   // pixels de texture par px de branche
    for (i = i0; i < i1; i++) {
      var a = p[i], b = p[i + 1];
      var u0 = ((a.s * UPX + bo.uOff) % TW), du = (b.s - a.s) * UPX;
      if (du <= 0) continue;
      x.save();
      x.beginPath();
      // léger débord pour éviter les joints visibles
      var ex = (b.x - a.x) * 0.15, ey = (b.y - a.y) * 0.15;
      x.moveTo(a.lx - ex, a.ly - ey); x.lineTo(b.lx + ex, b.ly + ey);
      x.lineTo(b.rx + ex, b.ry + ey); x.lineTo(a.rx - ex, a.ry - ey);
      x.closePath(); x.clip();
      var Ux = (b.lx - a.lx) / du, Uy = (b.ly - a.ly) / du;
      var Vx = (a.rx - a.lx) / TH, Vy = (a.ry - a.ly) / TH;
      x.transform(Ux, Uy, Vx, Vy, a.lx - u0 * Ux, a.ly - u0 * Uy);
      x.drawImage(BARK, Math.max(0, u0 - 4), 0, du + 8, TH, Math.max(0, u0 - 4), 0, du + 8, TH);
      x.restore();
    }
    // modelé cylindrique : clair côté lumière, sombre et rebond de lumière de l'autre
    for (i = i0; i < i1; i++) {
      var c = p[i], d = p[i + 1];
      var g = x.createLinearGradient(c.lx, c.ly, c.rx, c.ry);
      g.addColorStop(0, 'rgba(25,18,12,.55)');
      g.addColorStop(0.1, 'rgba(255,250,232,.10)');
      g.addColorStop(0.32, 'rgba(255,250,232,.04)');
      g.addColorStop(0.6, 'rgba(20,14,8,.12)');
      g.addColorStop(0.88, 'rgba(14,10,6,.5)');
      g.addColorStop(0.96, 'rgba(60,55,45,.35)');
      g.addColorStop(1, 'rgba(10,8,5,.7)');
      x.fillStyle = g;
      x.beginPath(); x.moveTo(c.lx, c.ly); x.lineTo(d.lx, d.ly); x.lineTo(d.rx, d.ry); x.lineTo(c.rx, c.ry); x.closePath();
      x.fill();
    }
    // nœuds : yeux de bois cernés
    bo.knots.forEach(function (kn, k) {
      if (k % 2) return;
      var q = pointOn(bo, kn.s / bo.total);
      if (q.y < ya - 40 || q.y > yb + 40 || q.w < 7) return;
      var off = n1(k * 3.1, bo.seed) * 0.25;
      var cx = q.x + q.nx * q.w * off, cy = q.y + q.ny * q.w * off;
      var ang = Math.atan2(q.ny, q.nx) + Math.PI / 2;
      var rx = q.w * rr(0.16, 0.26), ry = rx * rr(0.45, 0.65);
      for (var r = 3; r >= 0; r--) {
        x.beginPath(); x.ellipse(cx, cy, rx * (1 + r * 0.35), ry * (1 + r * 0.3), ang, 0, Math.PI * 2);
        x.strokeStyle = r % 2 ? 'rgba(20,14,8,.35)' : 'rgba(200,190,160,.18)'; x.lineWidth = 1; x.stroke();
      }
      var kg = x.createRadialGradient(cx - rx * 0.2, cy - ry * 0.2, 0, cx, cy, rx);
      kg.addColorStop(0, '#1a120c'); kg.addColorStop(0.7, '#3a2d22'); kg.addColorStop(1, 'rgba(58,45,34,0)');
      x.fillStyle = kg; x.beginPath(); x.ellipse(cx, cy, rx, ry, ang, 0, Math.PI * 2); x.fill();
    });
    // moignon coupé : tranche claire avec cernes
    if (bo.cut) {
      var e = p[n - 1], f = p[n - 2];
      if (e.y > ya - 40 && e.y < yb + 40) {
        var ca = Math.atan2(e.y - f.y, e.x - f.x), rw = e.w * 0.5;
        x.save(); x.translate(e.x, e.y); x.rotate(ca);
        x.beginPath(); x.ellipse(0, 0, rw * 0.35, rw, 0, 0, Math.PI * 2);
        var cg = x.createRadialGradient(0, 0, 0, 0, 0, rw);
        cg.addColorStop(0, '#8a7556'); cg.addColorStop(0.7, '#a48e69'); cg.addColorStop(0.92, '#6e5c44'); cg.addColorStop(1, '#3a2f24');
        x.fillStyle = cg; x.fill();
        x.strokeStyle = 'rgba(70,55,38,.4)'; x.lineWidth = 0.6;
        for (var rg = 1; rg <= 4; rg++) { x.beginPath(); x.ellipse(0, 0, rw * 0.35 * rg / 5, rw * rg / 5, 0, 0, Math.PI * 2); x.stroke(); }
        x.fillStyle = 'rgba(40,30,20,.6)';
        x.beginPath(); x.moveTo(0, 0); x.lineTo(rw * 0.08, rw * 0.7); x.lineTo(-rw * 0.03, rw * 0.6); x.fill();   // fente de séchage
        x.restore();
      }
    }
  }

  function chunk(k) {
    if (chunks[k] !== undefined) return chunks[k];
    var list = boughs.filter(function (bo) { return bo.y1 > k * CH - 30 && bo.y0 < (k + 1) * CH + 30; });
    return (chunks[k] = paintSlice(list, k * CH, (k + 1) * CH));
  }

  function paintSlice(list, ya, yb) {
    var x0 = Infinity, x1 = -Infinity;
    list.forEach(function (bo) {
      bo.pts.forEach(function (p) {
        if (p.y > ya - 40 && p.y < yb + 40) { x0 = Math.min(x0, p.lx, p.rx); x1 = Math.max(x1, p.lx, p.rx); }
      });
    });
    if (!list.length || x0 === Infinity) return null;
    x0 = Math.floor(x0 - 50); x1 = Math.ceil(Math.min(x1 + 60, W + 80));
    var c = mk(x1 - x0, CH), x = c.x;
    x.translate(-x0, -ya);
    list.forEach(function (bo) { paintBough(x, bo, ya, yb, 'shadow'); });
    list.forEach(function (bo) { paintBough(x, bo, ya, yb, 'bark'); });
    return { img: c.c, x: x0, y: ya, w: x1 - x0, h: CH };
  }

  /* ---------- rendu à l'écran ---------- */
  function twigWorld(tw, u) {
    var l = tw.at(u), c = Math.cos(tw.a), s = Math.sin(tw.a);
    return { x: tw.bx + l.x * c - l.y * s, y: tw.by + l.x * s + l.y * c };
  }

  var cheap = false;
  function drawLeaf(sp, x, y, ang, twist, alpha) {
    var cy = Math.cos(twist), sy = 0.38 + 0.62 * Math.abs(cy);
    var img = cy >= 0 ? sp.top : sp.under;
    if (!cheap) {
      ctx.save(); ctx.translate(x + 4, y + 7); ctx.rotate(ang); ctx.scale(1, sy);
      ctx.globalAlpha = alpha * 0.85; ctx.drawImage(sp.shadow, -sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1, sy * (cy >= 0 ? 1 : -1));
    ctx.globalAlpha = alpha; ctx.drawImage(img, -sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
  }

  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, VW, VH);
    ctx.translate(0, -scrollY);
    var y0 = scrollY, y1 = scrollY + VH;
    for (var k = Math.floor(y0 / CH); k <= Math.floor(y1 / CH); k++) {
      var ch = chunk(k);
      if (ch) ctx.drawImage(ch.img, ch.x, ch.y, ch.w, ch.h);
    }
    pieces.forEach(function (pc) {
      if (pc.yb < y0 || pc.ya > y1) {
        if (pc.img && (pc.yb < y0 - 2 * VH || pc.ya > y1 + 2 * VH)) pc.img = null;   // mémoire
        return;
      }
      if (pc.img === null) pc.img = paintSlice(pc.boughs, pc.ya, pc.yb) || false;
      if (pc.img) ctx.drawImage(pc.img.img, pc.img.x, pc.img.y, pc.img.w, pc.img.h);
    });
    var vis = twigs.filter(function (t) { return t.y1 > y0 && t.y0 < y1; });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    vis.forEach(function (tw) {
      var pts = [];
      for (var i = 0; i <= 8; i++) pts.push(twigWorld(tw, i / 8));
      // rameau : gris-brun, avec un filet de lumière
      [['rgba(30,32,22,.18)', 1.3, 3, 5], ['#4a4438', 1, 0, 0], ['#8a8574', 0.4, -0.5, -0.4]].forEach(function (Ly) {
        ctx.strokeStyle = Ly[0];
        for (var j = 0; j < 8; j += 2) {
          ctx.lineWidth = Math.max(0.5, lerp(tw.w0, 0.9, (j + 1) / 8) * Ly[1]);
          ctx.beginPath(); ctx.moveTo(pts[j].x + Ly[2], pts[j].y + Ly[3]);
          ctx.lineTo(pts[j + 1].x + Ly[2], pts[j + 1].y + Ly[3]); ctx.lineTo(pts[j + 2].x + Ly[2], pts[j + 2].y + Ly[3]);
          ctx.stroke();
        }
      });
      tw.olives.forEach(function (ol) {
        var at = twigWorld(tw, ol.u), ex = at.x + Math.sin(ol.p) * ol.stalk, ey = at.y + Math.cos(ol.p) * ol.stalk;
        ctx.strokeStyle = '#5d5843'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(at.x, at.y); ctx.lineTo(ex, ey); ctx.stroke();
        var cx = ex + Math.sin(ol.p) * ol.sp.rh * 0.9, cy = ey + Math.cos(ol.p) * ol.sp.rh * 0.9;
        ctx.save(); ctx.translate(cx + 4, cy + 6); ctx.rotate(-ol.p); ctx.globalAlpha = 0.9;
        ctx.drawImage(ol.sp.shadow, -ol.sp.ox, -ol.sp.oy, ol.sp.w, ol.sp.h); ctx.restore();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-ol.p);
        ctx.drawImage(ol.sp.img, -ol.sp.ox, -ol.sp.oy, ol.sp.w, ol.sp.h); ctx.restore();
      });
    });
    vis.forEach(function (tw) {
      tw.leaves.forEach(function (lf) {
        if (lf.gone) return;
        var at = twigWorld(tw, lf.u);
        drawLeaf(lf.sp, at.x, at.y, tw.ang + tw.a + lf.rel + lf.a * Math.PI / 180, lf.tw, Math.min(1, lf.grow * 1.4));
      });
    });
    falling.forEach(function (f) { drawLeaf(f.sp, f.x, f.y, f.rot, f.flip, f.alpha); });
  }

  /* ---------- physique ---------- */
  var REACH = 80;
  function step(dt, time) {
    var wind = Math.sin(time * 0.7) * 0.6 + Math.sin(time * 1.9 + 1) * 0.3 + Math.sin(time * 0.23) * 0.4;
    var gust = Math.max(0, Math.sin(time * 0.31) * Math.sin(time * 0.17 + 1)) * 1.1;
    var speed = Math.abs(mouse.vx) + Math.abs(mouse.vy);
    var y0 = scrollY - 200, y1 = scrollY + VH + 200;
    twigs.forEach(function (tw) {
      if (tw.y1 < y0 || tw.y0 > y1) return;
      var mid = twigWorld(tw, 0.6);
      if (mouse.on) {
        var dx = mouse.x - mid.x, dy = mouse.y - mid.y, dist = Math.hypot(dx, dy), lim = REACH + tw.L * 0.5;
        if (dist < lim) {
          var rx = mouse.x - tw.bx, ry = mouse.y - tw.by, r2 = Math.max(rx * rx + ry * ry, 900);
          tw.v += (rx * mouse.vy - ry * mouse.vx) / r2 * 0.35 * (1 - dist / lim);
        }
      }
      var restT = Math.sin(time * 1.1 + tw.phase) * 0.012 * (1 + wind + gust);
      tw.v += (restT - tw.a) * tw.k * dt; tw.v *= Math.pow(tw.d, dt); tw.a = clamp(tw.a + tw.v * dt, -0.35, 0.35);

      tw.leaves.forEach(function (lf) {
        if (lf.gone) {
          lf.gone -= dt * 16.7;
          if (lf.gone <= 0) { lf.gone = 0; lf.grow = 0.15; lf.a = -25; }
          return;
        }
        if (lf.grow < 1) lf.grow = Math.min(1, lf.grow + 0.012 * dt);
        var base = twigWorld(tw, lf.u), ang = tw.ang + tw.a + lf.rel + lf.a * Math.PI / 180;
        var cx = base.x + Math.cos(ang) * lf.sp.len * 0.55, cy = base.y + Math.sin(ang) * lf.sp.len * 0.55;
        if (mouse.on) {
          var dx2 = mouse.x - cx, dy2 = mouse.y - cy, d2 = Math.hypot(dx2, dy2);
          if (d2 < REACH) {
            var rx2 = mouse.x - base.x, ry2 = mouse.y - base.y, rr2 = Math.max(rx2 * rx2 + ry2 * ry2, 300);
            var f = 1 - d2 / REACH, tq = (rx2 * mouse.vy - ry2 * mouse.vx) / rr2;
            lf.v += tq * 57.3 * 0.6 * f * f;
            lf.tv += Math.abs(tq) * 2.2 * f * lf.dir + speed * 0.004 * f * lf.dir;   // elle se retourne
            if (speed > 30 && d2 < 30 && falling.length < 8 && Math.random() < 0.22) drop(lf, base, ang);
          }
        }
        var rest = Math.sin(time * 1.6 + lf.phase) * 2.4 * (0.5 + 0.5 * wind) - tw.v * 120;
        lf.v += (rest - lf.a) * lf.k * dt; lf.v *= Math.pow(lf.d, dt);
        lf.v = clamp(lf.v, -16, 16); lf.a = clamp(lf.a + lf.v * dt, -70, 70);
        // torsion : les rafales montrent le revers argenté, comme un olivier au vent
        var restTw = (Math.sin(time * 2.3 + lf.phase * 1.7) * 0.25 + Math.sin(time * 0.9 + lf.phase) * gust) * lf.dir;
        lf.tv += (restTw - lf.tw) * 0.035 * dt; lf.tv *= Math.pow(0.9, dt);
        lf.tv = clamp(lf.tv, -0.5, 0.5); lf.tw = clamp(lf.tw + lf.tv * dt, -3.4, 3.4);
      });

      tw.olives.forEach(function (ol) {
        var at = twigWorld(tw, ol.u);
        var cx = at.x + Math.sin(ol.p) * (ol.stalk + ol.sp.rh), cy = at.y + Math.cos(ol.p) * (ol.stalk + ol.sp.rh);
        if (mouse.on) {
          var d3 = Math.hypot(mouse.x - cx, mouse.y - cy);
          if (d3 < 30) ol.v -= mouse.vx * 0.004 * (1 - d3 / 30);
        }
        ol.v += (-Math.sin(ol.p) * 0.02 - tw.v * 0.08) * dt; ol.v *= Math.pow(0.975, dt);
        ol.p = clamp(ol.p + ol.v * dt, -1.2, 1.2);
      });
    });

    for (var i = falling.length - 1; i >= 0; i--) {
      var f = falling[i];
      f.t += dt;
      f.vy = Math.min(f.vy + 0.05 * dt, 1.4);
      f.vx = f.vx * Math.pow(0.97, dt) + Math.sin(f.t / 22 + f.ph) * 0.1 * dt;
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.rot += (Math.sin(f.t / 30 + f.ph) * 0.03 + f.spin) * dt;
      f.flip += 0.09 * dt;
      f.alpha = clamp(1 - (f.t - 220) / 90, 0, 1);
      if (f.alpha <= 0) falling.splice(i, 1);
    }
    mouse.vx *= Math.pow(0.82, dt); mouse.vy *= Math.pow(0.82, dt);
  }

  function drop(lf, base, ang) {
    lf.gone = 7000;
    falling.push({ sp: lf.sp, x: base.x, y: base.y, rot: ang, vx: mouse.vx * 0.15 + (Math.random() - 0.5),
                   vy: -0.6, spin: (Math.random() - 0.5) * 0.04, flip: lf.tw, ph: Math.random() * 6, t: 0, alpha: 1 });
  }

  /* ---------- boucle, événements ---------- */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    VW = window.innerWidth; VH = window.innerHeight;
    canvas.width = Math.round(VW * DPR); canvas.height = Math.round(VH * DPR);
    canvas.style.width = VW + 'px'; canvas.style.height = VH + 'px';
    scrollY = window.scrollY;
    if (!BARK) { R = rng(7); BARK = makeBark(); }
    build();
    render();
  }

  var last = 0, running = false, cost = 0;
  function frame(t) {
    if (document.hidden) { running = false; return; }
    var dt = last ? clamp((t - last) / 16.7, 0.2, 3) : 1;
    last = t;
    var t0 = performance.now();
    step(dt, t / 1000);
    render();
    cost = cost * 0.95 + (performance.now() - t0) * 0.05;
    if (cost > 14 && !cheap) cheap = true;
    requestAnimationFrame(frame);
  }
  function start() { if (!running && !reduce) { running = true; last = 0; requestAnimationFrame(frame); } }

  window.addEventListener('pointermove', function (e) {
    var now = performance.now(), dt = Math.max(8, now - (mouse.t || now - 16));
    var x = e.clientX, y = e.clientY + scrollY;
    if (mouse.on) {
      mouse.vx = mouse.vx * 0.4 + ((x - mouse.x) / dt * 16.7) * 0.6;
      mouse.vy = mouse.vy * 0.4 + ((y - mouse.y) / dt * 16.7) * 0.6;
    }
    mouse.x = x; mouse.y = y; mouse.cy = e.clientY; mouse.t = now; mouse.on = true;
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.on = false; });
  window.addEventListener('blur', function () { mouse.on = false; });

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
    var dv = clamp(scrollY - lastScroll, -60, 60);
    lastScroll = scrollY;
    if (mouse.on) mouse.y = mouse.cy + scrollY;
    twigs.forEach(function (tw) {
      if (tw.y1 < scrollY || tw.y0 > scrollY + VH) return;
      tw.v += dv * 0.00012 * (tw.phase > 3 ? 1 : -1);
      tw.leaves.forEach(function (lf) { lf.v += dv * 0.02 * (lf.phase > 3 ? 1 : -1); lf.tv += Math.abs(dv) * 0.002 * lf.dir; });
    });
    if (reduce) render();
  }, { passive: true });

  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });

  var rt;
  function scheduleResize() { clearTimeout(rt); rt = setTimeout(resize, 150); }
  window.addEventListener('resize', scheduleResize);
  if ('ResizeObserver' in window) {
    var lastH = 0;
    new ResizeObserver(function () {
      var h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 40) { lastH = h; scheduleResize(); }
    }).observe(document.body);
  }

  function init() {
    resize(); start();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleResize);
  }
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();

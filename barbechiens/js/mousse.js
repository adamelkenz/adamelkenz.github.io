/* Barbechiens · la transition « mousse » : des bulles de shampoing gonflent
   jusqu’à couvrir la photo, la photo change, puis les bulles éclatent.
   Utilisée par le cadre de l’accueil et par le menu des soins. */
(function () {
  'use strict';
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function charger(src) {
    return new Promise(function (ok) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = im.onerror = function () { ok(im); };
      im.src = src;
      if (im.decode) im.decode().then(function () { ok(im); }, function () {});
    });
  }

  function dessinerBulle(ctx, x, y, r, a) {
    if (r <= .5) return;
    ctx.globalAlpha = a;
    var g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(.55, '#fff6fa');
    g.addColorStop(.86, '#fbd9e6');
    g.addColorStop(1, '#f4b3cb');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    ctx.lineWidth = Math.max(1, r * .05);
    ctx.strokeStyle = 'rgba(214, 92, 140, .45)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.beginPath(); ctx.ellipse(x - r * .38, y - r * .42, r * .2, r * .12, -.6, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function Mousse(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.occupe = false;
  }
  Mousse.prototype.taille = function () {
    var b = this.c.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = b.width; this.h = b.height;
    this.c.width = Math.round(b.width * dpr); this.c.height = Math.round(b.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  Mousse.prototype.bulles = function (ox, oy) {
    var w = this.w, h = this.h, liste = [], diag = Math.hypot(w, h);
    var pas = Math.max(34, Math.min(w, h) / 6.5);
    for (var y = -pas / 2; y < h + pas; y += pas * .8) {
      for (var x = -pas / 2; x < w + pas; x += pas * .8) {
        var px = x + (Math.random() - .5) * pas * .7, py = y + (Math.random() - .5) * pas * .7;
        var d = Math.hypot(px - ox, py - oy) / diag;
        liste.push({ x: px, y: py, r: pas * (.62 + Math.random() * .5), d: d * .55 + Math.random() * .12, p: Math.random() * .5 });
      }
    }
    return liste;
  };
  /* Change l’image avec la mousse. opts : { x, y } point de départ (0–1). */
  Mousse.prototype.changer = function (img, src, alt, opts) {
    var self = this;
    opts = opts || {};
    if (self.occupe) return Promise.resolve();
    var pret = charger(src);
    if (reduit) {
      return pret.then(function () { img.src = src; if (alt != null) img.alt = alt; });
    }
    self.occupe = true;
    self.taille();
    var ox = (opts.x != null ? opts.x : Math.random()) * self.w, oy = (opts.y != null ? opts.y : 1) * self.h;
    var bulles = self.bulles(ox, oy), ctx = self.ctx;
    var tCouvre = 620, tEclate = 720, t0 = null, change = false, charge = false, tChange = 0;
    pret.then(function () { charge = true; });
    return new Promise(function (fin) {
      function image(t) {
        if (!t0) t0 = t;
        var e = t - t0;
        ctx.clearRect(0, 0, self.w, self.h);
        if (!change) {
          var k = Math.min(1, e / tCouvre);
          // voile de mousse sous les bulles pour ne laisser aucun trou
          ctx.fillStyle = 'rgba(253, 231, 240,' + Math.max(0, (k - .45) / .55).toFixed(3) + ')';
          ctx.fillRect(0, 0, self.w, self.h);
          bulles.forEach(function (b) {
            var kk = Math.max(0, Math.min(1, (k - b.d) / .45));
            var s = kk < 1 ? 1 + 2.7 * Math.pow(kk - 1, 3) + 1.7 * Math.pow(kk - 1, 2) : 1;
            dessinerBulle(ctx, b.x + Math.sin(e / 300 + b.p * 9) * 2, b.y, b.r * Math.max(0, s), 1);
          });
          if (k >= 1 && charge) {
            img.src = src; if (alt != null) img.alt = alt;
            change = true; tChange = e;
          }
        } else {
          var q = Math.min(1, (e - tChange) / tEclate);
          ctx.fillStyle = 'rgba(253, 231, 240,' + Math.max(0, 1 - q * 3).toFixed(3) + ')';
          ctx.fillRect(0, 0, self.w, self.h);
          bulles.forEach(function (b) {
            var debut = b.p * .55, kk = Math.max(0, Math.min(1, (q - debut) / .35));
            if (kk >= 1) return;
            if (kk > .6) {
              // éclat : petit anneau qui s’ouvre
              var z = (kk - .6) / .4;
              ctx.globalAlpha = 1 - z;
              ctx.strokeStyle = '#f4b3cb'; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (1 + z * .5), 0, 6.2832); ctx.stroke();
              ctx.globalAlpha = 1;
            } else {
              dessinerBulle(ctx, b.x, b.y - kk * 10, b.r * (1 + kk * .12), 1);
            }
          });
          if (q >= 1) {
            ctx.clearRect(0, 0, self.w, self.h);
            self.occupe = false;
            fin();
            return;
          }
        }
        requestAnimationFrame(image);
      }
      requestAnimationFrame(image);
    });
  };

  window.Mousse = Mousse;

  /* ---------- Le beau gosse du jour (accueil) ---------- */
  var PORTRAITS = [
    ['h020', 'Spitz noir et feu'],
    ['h061', 'Samoyède tout sourire'],
    ['h257', 'Petit roux duveteux'],
    ['h049', 'Caniche roux en coupe nounours'],
    ['h085', 'Shih tzu, langue rose'],
    ['h103', 'Berger australien aux yeux clairs'],
    ['h244', 'Spitz chocolat'],
    ['h249', 'Golden retriever'],
    ['h290', 'Bichon à la frimousse ronde'],
    ['h095', 'Terre-neuve, langue au vent'],
    ['h138', 'Petit épagneul, coup de langue'],
    ['h316', 'Berger australien rouge merle']
  ];
  var cadre = document.querySelector('[data-cadre]');
  if (!cadre) return;
  var img = cadre.querySelector('[data-cadre-img]');
  var legende = cadre.querySelector('[data-cadre-legende]');
  var bouton = document.querySelector('[data-cadre-suivant]');
  var mousse = new Mousse(cadre.querySelector('[data-mousse]'));
  var i = 0, minuterie = null, visible = true, survol = false;

  function src(n) { return 'img/heros/' + PORTRAITS[n][0] + '.webp'; }
  function suivant(opts) {
    if (mousse.occupe) return;
    i = (i + 1) % PORTRAITS.length;
    var nom = PORTRAITS[i][1];
    mousse.changer(img, src(i), nom + ', après son toilettage, sur la table bleue du salon', opts).then(function () {
      legende.textContent = nom;
      new Image().src = src((i + 1) % PORTRAITS.length);
    });
    setTimeout(function () { legende.textContent = nom; }, reduit ? 0 : 640);
  }
  function relancer() {
    clearInterval(minuterie);
    if (reduit) return;
    minuterie = setInterval(function () { if (visible && !survol && !document.hidden) suivant(); }, 5600);
  }
  bouton.addEventListener('click', function () { suivant({ x: .9, y: .9 }); relancer(); });
  cadre.addEventListener('click', function (e) {
    var b = cadre.querySelector('.cadre-photo').getBoundingClientRect();
    suivant({ x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height });
    relancer();
  });
  cadre.addEventListener('pointerenter', function () { survol = true; });
  cadre.addEventListener('pointerleave', function () { survol = false; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cadre);
  }
  new Image().src = src(1);
  relancer();
})();

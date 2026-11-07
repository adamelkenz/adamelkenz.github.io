/* Les Douceurs d'Elo : comportements communs (navigation, apparitions, horaires, découpe, avis, visionneuse…) */
(function () {
  'use strict';
  var D = document, H = D.documentElement, ELO = window.ELO = window.ELO || {};
  var reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finPointeur = matchMedia('(pointer: fine)').matches;
  function $(s, c) { return (c || D).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); }

  /* ---------- utilitaires partagés ---------- */
  ELO.wa = function (texte) { return 'https://wa.me/' + ELO.whatsapp + '?text=' + encodeURIComponent(texte); };
  ELO.sms = function (texte) { return 'sms:' + ELO.telLien + (/iP(hone|ad|od)/.test(navigator.userAgent) ? '&' : '?') + 'body=' + encodeURIComponent(texte); };
  var toastEl;
  ELO.toast = function (msg) {
    if (!toastEl) { toastEl = D.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); D.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('visible');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 3200);
  };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  ELO.ics = function (o) {
    // o : {titre, date: 'AAAA-MM-JJ', annuel, rappelJours, description, nom}
    var d = o.date.replace(/-/g, ''), fin = new Date(o.date + 'T12:00:00'); fin.setDate(fin.getDate() + 1);
    var dfin = fin.getFullYear() + pad(fin.getMonth() + 1) + pad(fin.getDate());
    var now = new Date(), stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + '00Z';
    function esc(t) { return String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
    var l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Les Douceurs d\'Elo//Rappel//FR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + d + '-' + Math.random().toString(36).slice(2) + '@lesdouceursdelo', 'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + dfin, 'SUMMARY:' + esc(o.titre), 'DESCRIPTION:' + esc(o.description || '')];
    if (o.annuel) l.push('RRULE:FREQ=YEARLY');
    var j = o.rappelJours || 14;
    l.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Pensez au gâteau : ' + o.titre), 'TRIGGER:-P' + j + 'D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR');
    var blob = new Blob([l.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (o.nom || 'rappel-douceurs-elo') + '.ics';
    D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  ELO.heureParis = function () {
    try {
      var p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var jours = { 'lun.': 0, 'mar.': 1, 'mer.': 2, 'jeu.': 3, 'ven.': 4, 'sam.': 5, 'dim.': 6 };
      return { j: jours[o.weekday], m: parseInt(o.hour, 10) % 24 * 60 + parseInt(o.minute, 10) };
    } catch (e) { var n = new Date(); return { j: (n.getDay() + 6) % 7, m: n.getHours() * 60 + n.getMinutes() }; }
  };
  function minutes(h) { var p = h.split(':'); return +p[0] * 60 + +p[1]; }
  function hh(h) { var p = h.split(':'); return +p[0] + 'h' + (p[1] !== '00' ? p[1] : ''); }

  /* ---------- en-tête ---------- */
  var ent = $('.entete'), dernier = 0;
  function surScroll() {
    var y = scrollY;
    if (ent) {
      ent.classList.toggle('fond', y > 20);
      if (!H.classList.contains('menu-ouvert')) ent.classList.toggle('cache', y > 400 && y > dernier + 4);
      if (y < dernier - 4) ent.classList.remove('cache');
    }
    var bm = $('.barre-mobile'); if (bm) bm.classList.toggle('visible', y > 380);
    var rh = $('.retour-haut'); if (rh) rh.classList.toggle('visible', y > 900);
    dernier = y;
  }
  addEventListener('scroll', surScroll, { passive: true }); surScroll();

  var burger = $('.burger');
  if (burger) burger.addEventListener('click', function () {
    var o = H.classList.toggle('menu-ouvert');
    burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
    $$('.menu-mobile > ul > li').forEach(function (li, i) { li.style.transitionDelay = o ? (120 + i * 45) + 'ms' : '0ms'; });
  });
  $$('.menu-mobile a').forEach(function (a) { a.addEventListener('click', function () { H.classList.remove('menu-ouvert'); if (burger) burger.setAttribute('aria-expanded', 'false'); }); });
  $$('.sous-btn').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); var li = b.parentNode, o = li.classList.toggle('ouvert'); b.setAttribute('aria-expanded', o); });
  });
  D.addEventListener('click', function () { $$('.a-sous.ouvert').forEach(function (li) { li.classList.remove('ouvert'); $('.sous-btn', li).setAttribute('aria-expanded', 'false'); }); });
  D.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (H.classList.contains('menu-ouvert')) { H.classList.remove('menu-ouvert'); burger && burger.focus(); }
      $$('.a-sous.ouvert').forEach(function (li) { li.classList.remove('ouvert'); });
    }
  });
  var rh = $('.retour-haut'); if (rh) rh.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' }); });

  /* ---------- apparitions ---------- */
  var cibles = $$('[data-r], .mots, .etapes, [data-compte], .scene-decoupe');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add('vu'); io.unobserve(el);
        if (el.hasAttribute('data-compte')) compter(el);
        if (el.classList.contains('scene-decoupe') && !el.dataset.touche) setTimeout(function () { ouvrirDecoupe(el, true); }, 500);
      });
    }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
    cibles.forEach(function (c) { io.observe(c); });
  } else cibles.forEach(function (c) { c.classList.add('vu'); });

  function compter(el) {
    var fin = parseFloat(el.getAttribute('data-compte').replace(',', '.')), dec = (el.getAttribute('data-compte').split(/[.,]/)[1] || '').length;
    if (reduit) { el.textContent = fin.toFixed(dec).replace('.', ','); return; }
    var t0 = null, duree = 1600;
    function pas(t) {
      if (!t0) t0 = t; var k = Math.min(1, (t - t0) / duree), v = fin * (1 - Math.pow(1 - k, 3));
      el.textContent = v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
      if (k < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }

  /* ---------- horaires et statut ---------- */
  function majHoraires() {
    if (!ELO.horaires) return;
    var n = ELO.heureParis(), h = ELO.horaires, auj = h[n.j], ouvert = auj && n.m >= minutes(auj[0]) && n.m < minutes(auj[1]), txt;
    if (ouvert) txt = 'Ouvert maintenant · ferme à ' + hh(auj[1]);
    else {
      var k = 0, j = n.j;
      if (auj && n.m < minutes(auj[0])) txt = 'Fermé · ouvre aujourd\'hui à ' + hh(auj[0]);
      else {
        for (k = 1; k <= 7; k++) { j = (n.j + k) % 7; if (h[j]) break; }
        txt = 'Fermé · ouvre ' + (k === 1 ? 'demain' : ELO.jours[j].toLowerCase()) + ' à ' + hh(h[j][0]);
      }
    }
    $$('.statut').forEach(function (s) { s.textContent = txt; s.classList.toggle('ferme', !ouvert); });
    $$('.horaires li[data-j]').forEach(function (li) { li.classList.toggle('auj', +li.getAttribute('data-j') === n.j); });
  }
  majHoraires(); setInterval(majHoraires, 60000);

  /* ---------- curseurs (remplissage) ---------- */
  function remplir(r) { var p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--p', p + '%'); }
  ELO.remplir = remplir;
  $$('input[type="range"]').forEach(function (r) { remplir(r); r.addEventListener('input', function () { remplir(r); }); });

  /* ---------- poussière d'or (héros) ---------- */
  var cv = $('#poussiere');
  if (cv && !reduit) {
    var ctx = cv.getContext('2d'), parts = [], W, Hh, mx = 0, my = 0, actif = true, dpr = Math.min(2, devicePixelRatio || 1);
    function taille() { W = cv.offsetWidth; Hh = cv.offsetHeight; cv.width = W * dpr; cv.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    taille(); addEventListener('resize', taille);
    var N = Math.min(70, Math.round(W / 18));
    for (var i = 0; i < N; i++) parts.push({ x: Math.random() * W, y: Math.random() * Hh, r: .6 + Math.random() * 2.2, v: .15 + Math.random() * .45, o: .25 + Math.random() * .55, p: Math.random() * 6.28, z: .3 + Math.random() });
    addEventListener('pointermove', function (e) { mx = (e.clientX / innerWidth - .5); my = (e.clientY / innerHeight - .5); }, { passive: true });
    new IntersectionObserver(function (e) { actif = e[0].isIntersecting; if (actif) requestAnimationFrame(boucle); }).observe(cv);
    function boucle() {
      if (!actif) return;
      ctx.clearRect(0, 0, W, Hh);
      parts.forEach(function (p) {
        p.y -= p.v; p.p += .02; if (p.y < -10) { p.y = Hh + 10; p.x = Math.random() * W; }
        var x = p.x + Math.sin(p.p) * 8 + mx * 30 * p.z, y = p.y + my * 20 * p.z;
        ctx.beginPath(); ctx.fillStyle = 'rgba(180,138,78,' + (p.o * (.6 + .4 * Math.sin(p.p * 2))) + ')';
        ctx.arc(x, y, p.r, 0, 6.283); ctx.fill();
      });
      requestAnimationFrame(boucle);
    }
    requestAnimationFrame(boucle);
  }

  /* ---------- inclinaison des cartes et boutons aimantés ---------- */
  if (finPointeur && !reduit) {
    $$('.carte-univers').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
        c.style.transform = 'perspective(900px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
    $$('.aimant').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- découpe : parfums et tranche ---------- */
  function ouvrirDecoupe(sc, etat) {
    sc.classList.toggle('ouverte', etat);
    var b = $('[data-couper]'); if (b) { b.setAttribute('aria-pressed', etat); $('span', b).textContent = etat ? 'Replacer la part' : 'Couper une part'; }
  }
  var scene = $('.scene-decoupe');
  if (scene && ELO.parfums) {
    var bc = $('[data-couper]');
    if (bc) bc.addEventListener('click', function () { scene.dataset.touche = 1; ouvrirDecoupe(scene, !scene.classList.contains('ouverte')); });
    scene.addEventListener('click', function () { scene.dataset.touche = 1; ouvrirDecoupe(scene, !scene.classList.contains('ouverte')); });
    scene.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scene.click(); } });
    $$('[data-parfum]').forEach(function (p) {
      p.addEventListener('click', function () {
        var f = ELO.parfums.filter(function (x) { return x[0] === p.getAttribute('data-parfum'); })[0]; if (!f) return;
        $$('[data-parfum]').forEach(function (q) { q.setAttribute('aria-pressed', q === p); });
        $$('.couche.g', scene).forEach(function (e) { e.style.fill = f[2]; });
        $$('.couche.c', scene).forEach(function (e) { e.style.fill = f[3]; });
        $$('.couche.f', scene).forEach(function (e) { e.style.fill = f[4]; });
        var cc = $$('.compo-couches span.c'); if (cc.length) { cc[0].style.background = f[2]; cc[1].style.background = f[3]; cc[2].style.background = f[4]; }
        var nom = $('[data-nom-parfum]'); if (nom) nom.textContent = f[1];
        scene.dataset.touche = 1; ouvrirDecoupe(scene, true);
      });
    });
  }

  /* ---------- carrousel d'avis ---------- */
  $$('.carrousel').forEach(function (car) {
    var cartes = $$('.avis-carte', car), pts = $$('.points span', car), i = 0, t;
    if (cartes.length < 2) return;
    function aller(n) {
      i = (n + cartes.length) % cartes.length;
      cartes.forEach(function (c, k) { c.classList.toggle('actif', k === i); c.setAttribute('aria-hidden', k !== i); });
      pts.forEach(function (p, k) { p.classList.toggle('actif', k === i); });
    }
    function auto() { clearInterval(t); if (!reduit) t = setInterval(function () { aller(i + 1); }, 6500); }
    var p = $('.prec', car), s = $('.suiv', car);
    p && p.addEventListener('click', function () { aller(i - 1); auto(); });
    s && s.addEventListener('click', function () { aller(i + 1); auto(); });
    car.addEventListener('pointerenter', function () { clearInterval(t); });
    car.addEventListener('pointerleave', auto);
    var x0 = null;
    car.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { aller(i + (dx < 0 ? 1 : -1)); auto(); } x0 = null; });
    aller(0); auto();
  });

  /* ---------- filtres de galerie ---------- */
  $$('[data-filtres]').forEach(function (bloc) {
    var gal = $(bloc.getAttribute('data-filtres'));
    $$('button', bloc).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filtre');
        $$('button', bloc).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var n = 0;
        $$('figure', gal).forEach(function (fig) {
          var ok = f === 'tout' || (' ' + fig.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
          fig.classList.toggle('cache', !ok);
          if (ok) { fig.classList.remove('entre'); void fig.offsetWidth; fig.style.animationDelay = (n++ * 60) + 'ms'; fig.classList.add('entre'); }
        });
      });
    });
  });

  /* ---------- visionneuse ---------- */
  var vis, visImg, visCap, liste = [], pos = 0, retourFocus;
  function construireVis() {
    vis = D.createElement('div'); vis.className = 'visionneuse'; vis.setAttribute('role', 'dialog'); vis.setAttribute('aria-modal', 'true'); vis.setAttribute('aria-label', 'Visionneuse de photos');
    vis.innerHTML = '<button class="prec" aria-label="Photo précédente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="suiv" aria-label="Photo suivante"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<button class="fermer" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    D.body.appendChild(vis); visImg = $('img', vis); visCap = $('figcaption', vis);
    $('.prec', vis).addEventListener('click', function () { montrer(pos - 1); });
    $('.suiv', vis).addEventListener('click', function () { montrer(pos + 1); });
    $('.fermer', vis).addEventListener('click', fermerVis);
    vis.addEventListener('click', function (e) { if (e.target === vis || e.target.tagName === 'FIGURE') fermerVis(); });
    var x0 = null;
    vis.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    vis.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) montrer(pos + (dx < 0 ? 1 : -1)); x0 = null; });
    D.addEventListener('keydown', function (e) {
      if (!vis.classList.contains('ouverte')) return;
      if (e.key === 'Escape') fermerVis(); if (e.key === 'ArrowLeft') montrer(pos - 1); if (e.key === 'ArrowRight') montrer(pos + 1);
    });
  }
  function montrer(n) {
    pos = (n + liste.length) % liste.length; var b = liste[pos];
    visImg.src = b.getAttribute('data-grand'); visImg.alt = b.getAttribute('data-alt') || ''; visCap.textContent = b.getAttribute('data-legende') || '';
  }
  function fermerVis() { vis.classList.remove('ouverte'); D.body.style.overflow = ''; if (retourFocus) retourFocus.focus(); }
  D.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button.zoom'); if (!b) return;
    if (!vis) construireVis();
    var groupe = b.closest('[data-galerie]') || D.body;
    liste = $$('button.zoom', groupe).filter(function (x) { return !x.closest('figure.cache'); });
    retourFocus = b; montrer(liste.indexOf(b)); vis.classList.add('ouverte'); D.body.style.overflow = 'hidden'; $('.fermer', vis).focus();
  });

  /* ---------- plan à la demande ---------- */
  $$('[data-plan]').forEach(function (b) {
    b.addEventListener('click', function () {
      var z = b.closest('.carte-plan'), f = D.createElement('iframe');
      f.src = b.getAttribute('data-plan'); f.title = 'Plan d\'accès à la boutique Les Douceurs d\'Elo'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      z.innerHTML = ''; z.appendChild(f);
    });
  });

  /* ---------- liens de message pré-remplis ---------- */
  $$('[data-wa]').forEach(function (a) { a.href = ELO.wa(a.getAttribute('data-wa')); });

  /* ---------- année ---------- */
  $$('[data-annee]').forEach(function (s) { s.textContent = new Date().getFullYear(); });

  try { sessionStorage.setItem('elo-intro', '1'); } catch (e) {}
  setTimeout(function () { H.classList.remove('intro'); }, 2600);
})();

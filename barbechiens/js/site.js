/* Barbechiens · comportements communs : en-tête, menu, apparitions,
   statut ouvert/fermé (heure de Paris), compteurs, séance photo de Noël. */
(function () {
  'use strict';

  var SALON = window.SALON = {
    tel: '+33659218702',
    telTexte: '06 59 21 87 02',
    email: 'barbechiens@gmail.com',
    // 0 = dimanche … 6 = samedi ; créneaux en minutes depuis minuit
    horaires: {
      0: [],
      1: [[540, 750], [810, 1050]],
      2: [[540, 750], [810, 1050]],
      3: [],
      4: [[540, 750], [810, 1050]],
      5: [[540, 750], [810, 1050]],
      6: [[540, 960]]
    },
    ouverture: '2026-04-13',
    noel: { debut: '2026-11-21T09:00:00+01:00', fin: '2026-11-21T12:00:00+01:00' }
  };

  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Heure de Paris ---------- */
  var fmtParis = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' });
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function paris(d) {
    var o = {};
    fmtParis.formatToParts(d || new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { jour: WD[o.weekday], min: (+o.hour) * 60 + (+o.minute), a: +o.year, m: +o.month, j: +o.day };
  }
  function heure(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + ' h' + (m ? ' ' + (m < 10 ? '0' : '') + m : '');
  }
  window.BC = { paris: paris, heure: heure, JOURS: JOURS, reduit: reduit };

  function statut() {
    var p = paris(), cr = SALON.horaires[p.jour], txt, cls;
    for (var i = 0; i < cr.length; i++) {
      if (p.min >= cr[i][0] && p.min < cr[i][1]) {
        var reste = cr[i][1] - p.min;
        cls = reste <= 30 ? 'bientot' : 'ouvert';
        txt = '<b>Ouvert</b> · ferme à ' + heure(cr[i][1]);
        if (i === 0 && cr.length > 1) txt += ', réouvre à ' + heure(cr[1][0]);
        return { txt: txt, cls: cls };
      }
      if (p.min < cr[i][0]) {
        var avant = cr[i][0] - p.min;
        if (i > 0) return { txt: '<b>Pause déjeuner</b> · réouvre à ' + heure(cr[i][0]), cls: avant <= 30 ? 'bientot' : 'ferme' };
        return { txt: (avant <= 60 ? '<b>Ouvre bientôt</b>' : '<b>Fermé</b>') + ' · ouvre à ' + heure(cr[i][0]), cls: avant <= 60 ? 'bientot' : 'ferme' };
      }
    }
    for (var k = 1; k <= 7; k++) {
      var j = (p.jour + k) % 7;
      if (SALON.horaires[j].length) {
        var quand = k === 1 ? 'demain' : JOURS[j];
        return { txt: '<b>Fermé</b> · ouvre ' + quand + ' à ' + heure(SALON.horaires[j][0][0]), cls: 'ferme' };
      }
    }
    return { txt: '', cls: 'ferme' };
  }
  function majStatut() {
    var s = statut();
    document.querySelectorAll('[data-statut]').forEach(function (el) {
      el.innerHTML = s.txt;
      el.classList.remove('ouvert', 'ferme', 'bientot');
      el.classList.add(s.cls);
    });
    var j = paris().jour;
    document.querySelectorAll('.horaires tr').forEach(function (tr) { tr.classList.toggle('auj', +tr.dataset.j === j); });
  }
  majStatut();
  setInterval(majStatut, 30000);

  /* ---------- En-tête, progression, barre mobile ---------- */
  var entete = document.querySelector('.entete');
  var barre = document.querySelector('.progression i');
  var mobile = document.querySelector('.barre-mobile');
  var hero = document.getElementById('accueil');
  var pied = document.querySelector('.pied');
  var attente = false;
  function defile() {
    attente = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    entete.classList.toggle('colle', y > 30);
    if (barre) barre.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0);
    if (mobile) {
      var basHero = hero ? hero.offsetTop + hero.offsetHeight - 200 : 400;
      var hautPied = pied ? pied.getBoundingClientRect().top : 9999;
      mobile.classList.toggle('visible', y > basHero && hautPied > window.innerHeight - 40);
    }
  }
  window.addEventListener('scroll', function () { if (!attente) { attente = true; requestAnimationFrame(defile); } }, { passive: true });
  defile();

  /* ---------- Menu mobile ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu-mobile');
  function fermerMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Ouvrir le menu'); }
  menuBtn.addEventListener('click', function () {
    var ouvrir = menu.hidden;
    menu.hidden = !ouvrir;
    menuBtn.setAttribute('aria-expanded', String(ouvrir));
    menuBtn.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) fermerMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { fermerMenu(); menuBtn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1060 && !menu.hidden) fermerMenu(); });

  /* ---------- Lien actif dans la navigation ---------- */
  var liens = {};
  document.querySelectorAll('.nav a').forEach(function (a) { liens[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var ioNav = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting && liens[e.target.id]) {
          Object.keys(liens).forEach(function (k) { liens[k].classList.remove('actif'); });
          liens[e.target.id].classList.add('actif');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(liens).forEach(function (id) { var s = document.getElementById(id); if (s) ioNav.observe(s); });
  }

  /* ---------- Apparitions et compteurs ---------- */
  var moisOuverts = (function () {
    var p = paris(), o = SALON.ouverture.split('-').map(Number);
    var m = (p.a - o[0]) * 12 + (p.m - o[1]) - (p.j < o[2] ? 1 : 0);
    return Math.max(1, m);
  })();
  document.querySelectorAll('[data-mois]').forEach(function (el) { el.dataset.compte = moisOuverts; el.textContent = moisOuverts; });

  function compter(el) {
    var fin = parseFloat(el.dataset.compte), virgule = el.hasAttribute('data-virgule');
    if (reduit) return;
    var t0 = null, duree = 1300;
    function pas(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / duree), v = fin * (1 - Math.pow(1 - k, 3));
      el.textContent = virgule ? v.toFixed(1).replace('.', ',') : Math.round(v);
      if (k < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }
  var aMonter = document.querySelectorAll('.monte');
  if ('IntersectionObserver' in window && !reduit) {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('vu');
        e.target.querySelectorAll('[data-compte]').forEach(compter);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    aMonter.forEach(function (el) { io.observe(el); });
  } else {
    aMonter.forEach(function (el) { el.classList.add('vu'); });
  }

  /* ---------- Année ---------- */
  document.querySelectorAll('[data-annee]').forEach(function (el) { el.textContent = paris().a; });

  /* ---------- Séance photo de Noël ---------- */
  var debutNoel = new Date(SALON.noel.debut), finNoel = new Date(SALON.noel.fin);
  var smsNoel = 'Bonjour Pauline, je voudrais réserver un créneau pour la séance photo de Noël du samedi 21 novembre, pour mon chien. Merci !';
  document.querySelectorAll('[data-sms-noel]').forEach(function (a) { a.href = 'sms:' + SALON.tel + '?&body=' + encodeURIComponent(smsNoel); });
  function noel() {
    var maintenant = new Date();
    if (maintenant >= finNoel) {
      document.querySelectorAll('[data-noel], [data-noel-lien], [data-noel-puce]').forEach(function (el) { el.hidden = true; });
      document.querySelectorAll('[data-noel-etat]').forEach(function (el) { el.textContent = 'C’était ce jour-là'; el.classList.add('passe'); });
      return false;
    }
    var ms = debutNoel - maintenant, cases = document.querySelectorAll('[data-cr]');
    if (ms <= 0) {
      document.querySelectorAll('.cr-titre').forEach(function (el) { el.textContent = 'C’est maintenant, jusqu’à midi !'; });
      document.querySelectorAll('[data-noel-etat]').forEach(function (el) { el.textContent = 'Aujourd’hui'; });
      ms = 0;
    }
    var s = Math.floor(ms / 1000), v = { j: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    cases.forEach(function (el) { var n = v[el.dataset.cr]; el.textContent = el.dataset.cr === 'j' ? n : (n < 10 ? '0' : '') + n; });
    return true;
  }
  if (noel()) setInterval(noel, 1000);
})();

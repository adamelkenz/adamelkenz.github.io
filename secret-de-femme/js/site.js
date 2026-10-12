/* Secret de Femme — infos pratiques et petites interactions.
   Coordonnées de l'institut : ici (et dans le JSON-LD de index.html). */
var SALON = {
  tel: '+33676480478',
  telAffiche: '06 76 48 04 78',
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales
  horaires: {
    0: [],
    1: [[8.5, 17.5]],
    2: [[8.5, 17.5]],
    3: [[10.5, 18]],
    4: [[14, 20]],
    5: [[8.5, 17.5]],
    6: [[9, 14]]
  }
};

(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // téléphone
  document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = 'tel:' + SALON.tel; });
  document.querySelectorAll('[data-tel-texte]').forEach(function (s) { s.textContent = SALON.telAffiche; });
  var annee = document.querySelector('[data-annee]');
  if (annee) annee.textContent = new Date().getFullYear();

  // ouvert / fermé, à l'heure de Paris quel que soit le fuseau du visiteur
  function maintenant() {
    var f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
    var o = {};
    f.formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { j: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'].indexOf(o.weekday), h: +o.hour + o.minute / 60 };
  }
  function hfr(h) {
    var m = Math.round((h % 1) * 60);
    return Math.floor(h) + ' h' + (m ? (m < 10 ? ' 0' : ' ') + m : '');
  }
  var n = maintenant();
  var statut = document.querySelector('[data-statut]');
  if (statut && n.j >= 0) {
    var cr = SALON.horaires[n.j] || [], txt, cls;
    var ouvert = cr.filter(function (c) { return n.h >= c[0] && n.h < c[1]; })[0];
    if (ouvert) { cls = 'ouvert'; txt = 'Ouvert jusqu\'à ' + hfr(ouvert[1]) + ' · sur rendez-vous'; }
    else {
      cls = 'ferme';
      var plusTard = cr.filter(function (c) { return c[0] > n.h; })[0];
      if (plusTard) txt = 'Fermé pour le moment · ouvre à ' + hfr(plusTard[0]);
      else {
        var noms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        for (var k = 1; k <= 7; k++) {
          var j = (n.j + k) % 7, c = SALON.horaires[j] || [];
          if (c.length) { txt = 'Fermé · réouverture ' + (k === 1 ? 'demain' : noms[j]) + ' à ' + hfr(c[0][0]); break; }
        }
      }
    }
    if (txt) { statut.classList.add(cls); statut.innerHTML = '<i></i>' + txt; }
  }
  var ligne = document.querySelector('.horaires tr[data-j="' + n.j + '"]');
  if (ligne) ligne.className = 'auj';

  // en-tête plus opaque une fois l'accueil quitté
  var entete = document.querySelector('.entete');
  function majEntete() { entete.classList.toggle('defile', window.scrollY > 40); }
  if (entete) { majEntete(); window.addEventListener('scroll', majEntete, { passive: true }); }

  // menu téléphone
  var bouton = document.querySelector('.menu-btn'), menu = document.getElementById('menu-mobile');
  if (bouton && menu) {
    var ferme = function () { menu.hidden = true; bouton.setAttribute('aria-expanded', 'false'); bouton.setAttribute('aria-label', 'Ouvrir le menu'); majEntete(); };
    bouton.addEventListener('click', function () {
      var ouvre = menu.hidden;
      menu.hidden = !ouvre;
      bouton.setAttribute('aria-expanded', String(ouvre));
      bouton.setAttribute('aria-label', ouvre ? 'Fermer le menu' : 'Ouvrir le menu');
      if (ouvre) entete.classList.add('defile'); else majEntete();
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) ferme(); });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !bouton.contains(e.target)) ferme();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { ferme(); bouton.focus(); } });
  }

  // apparition douce des blocs
  var blocs = document.querySelectorAll('.monte');
  if ('IntersectionObserver' in window && !calme) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocs.forEach(function (b) { io.observe(b); });
  } else blocs.forEach(function (b) { b.classList.add('vu'); });

  // barre du bas (téléphone) : visible une fois l'accueil dépassé
  var barre = document.querySelector('.barre-mobile'), accueil = document.querySelector('.hero');
  if (barre && accueil && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { barre.classList.toggle('visible', !es[0].isIntersecting); },
      { rootMargin: '-40% 0px 0px 0px' }).observe(accueil);
  } else if (barre) barre.classList.add('visible');

  // le lotus de l'accueil s'ouvre à l'arrivée, puis suit le défilement
  var lotus = document.querySelector('[data-lotus]');
  if (lotus) {
    if (calme) lotus.style.setProperty('--o', '1');
    else {
      var prevu = false;
      var majLotus = function () {
        prevu = false;
        var p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.5)));
        lotus.style.setProperty('--o', (0.82 + 0.18 * p).toFixed(3));
      };
      requestAnimationFrame(function () { requestAnimationFrame(function () { lotus.classList.add('eclos'); majLotus(); }); });
      window.addEventListener('scroll', function () {
        if (!prevu) { prevu = true; requestAnimationFrame(majLotus); }
      }, { passive: true });
    }
  }

  // les petites animations ne tournent que lorsqu'elles sont à l'écran
  if ('IntersectionObserver' in window && !calme) {
    var veille = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('en-pause', !e.isIntersecting); });
    }, { rootMargin: '60px 0px' });
    document.querySelectorAll('.hero-medaillon, .plan-epingle, .cadeau-carte').forEach(function (el) { veille.observe(el); });
  }

  // onglets de la carte des soins (flèches, Début, Fin)
  var onglets = document.querySelector('[data-onglets]');
  if (onglets) {
    var tabs = [].slice.call(onglets.querySelectorAll('[role="tab"]'));
    var choisit = function (t, focus) {
      tabs.forEach(function (x) {
        var actif = x === t;
        x.setAttribute('aria-selected', String(actif));
        x.tabIndex = actif ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !actif;
      });
      if (focus) t.focus();
      if (t.scrollIntoView && onglets.querySelector('[role="tablist"]').scrollWidth > onglets.clientWidth) {
        t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: calme ? 'auto' : 'smooth' });
      }
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { choisit(t); });
      t.addEventListener('keydown', function (e) {
        var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault();
        choisit(tabs[(k + tabs.length) % tabs.length], true);
      });
    });
    tabs.forEach(function (x, i) {
      x.setAttribute('aria-selected', String(i === 0));
      x.tabIndex = i === 0 ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = i !== 0;
    });
  }

  // plan Google Maps : chargé seulement à la demande du visiteur
  var plan = document.querySelector('[data-plan]');
  if (plan) {
    plan.querySelector('[data-plan-btn]').addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.title = 'Plan d\'accès à Secret de Femme, parc d\'activité rue Belle Fontaine à Rosselange';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = 'https://www.google.com/maps?q=49.2728664,6.0561293&z=16&output=embed';
      plan.innerHTML = '';
      plan.appendChild(f);
      f.focus();
    });
  }
})();

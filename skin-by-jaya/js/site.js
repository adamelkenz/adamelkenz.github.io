/* Skin By Jaya — infos pratiques et petites interactions.
   Coordonnées de l'institut : ici (et dans le JSON-LD de index.html). */
var SALON = {
  tel: '+33610133857',
  telAffiche: '06 10 13 38 57',
  reservation: 'https://www.treatwell.fr/salon/skin-by-jaya/',
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales
  horaires: {
    0: [],
    1: [[10, 20]],
    2: [[10, 20]],
    3: [[10, 20]],
    4: [[10, 20]],
    5: [[10, 20]],
    6: [[10, 20]]
  }
};

(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // téléphone, lien de réservation, année
  document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = 'tel:' + SALON.tel; });
  document.querySelectorAll('[data-tel-texte]').forEach(function (s) { s.textContent = SALON.telAffiche; });
  document.querySelectorAll('[data-resa]').forEach(function (a) { a.href = SALON.reservation; });
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
    if (ouvert) { cls = 'ouvert'; txt = 'Ouvert aujourd\'hui jusqu\'à ' + hfr(ouvert[1]); }
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
    if (txt) { statut.classList.add(cls); statut.innerHTML = '<i></i><span>' + txt + '<span class="statut-plus"> · réservation en ligne 24 h/24</span></span>'; }
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
    var ferme = function () { menu.hidden = true; bouton.setAttribute('aria-expanded', 'false'); bouton.setAttribute('aria-label', 'Ouvrir le menu'); };
    bouton.addEventListener('click', function () {
      var ouvre = menu.hidden;
      menu.hidden = !ouvre;
      bouton.setAttribute('aria-expanded', String(ouvre));
      bouton.setAttribute('aria-label', ouvre ? 'Fermer le menu' : 'Ouvrir le menu');
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

  // les animations décoratives ne tournent que lorsque leur section est à l'écran
  if ('IntersectionObserver' in window && !calme) {
    var veille = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('en-pause', !e.isIntersecting); });
    }, { rootMargin: '100px 0px' });
    document.querySelectorAll('.portrait, .plan').forEach(function (el) { el.classList.add('en-pause'); veille.observe(el); });
  }

  // onglets de la carte des soins (flèches gauche / droite au clavier)
  var onglets = [].slice.call(document.querySelectorAll('.onglets [role="tab"]'));
  function choisit(o, focus) {
    onglets.forEach(function (t) {
      var actif = t === o;
      t.setAttribute('aria-selected', String(actif));
      t.tabIndex = actif ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !actif;
    });
    if (focus) o.focus();
  }
  onglets.forEach(function (o, i) {
    o.addEventListener('click', function () { choisit(o); });
    o.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        choisit(onglets[(i + (e.key === 'ArrowRight' ? 1 : -1) + onglets.length) % onglets.length], true);
      }
    });
  });

  // FAQ : une seule réponse ouverte à la fois
  var questions = document.querySelectorAll('.faq-liste details');
  questions.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) questions.forEach(function (x) { if (x !== d) x.open = false; });
    });
  });

  // plan Google Maps : chargé seulement à la demande du visiteur
  var plan = document.querySelector('[data-plan]');
  if (plan) {
    plan.querySelector('[data-plan-btn]').addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.title = 'Plan d\'accès à l\'institut Skin By Jaya';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = 'https://www.google.com/maps?q=Skin+By+Jaya,+3+Passage+Doisy,+75017+Paris&z=16&output=embed';
      plan.innerHTML = '';
      plan.appendChild(f);
      f.focus();
    });
  }
})();

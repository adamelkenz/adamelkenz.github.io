/* L'atelier du poil — infos pratiques et petites interactions.
   Coordonnées du salon : ici (et dans le JSON-LD de index.html). */
var SALON = {
  tel: '+33610445773',
  telAffiche: '06 10 44 57 73',
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales
  horaires: {
    0: [],
    1: [],
    2: [[8.5, 12], [13, 18]],
    3: [[8.5, 12], [13, 18]],
    4: [[8.5, 12], [13, 18]],
    5: [[8.5, 12], [13, 18]],
    6: [[8.5, 12], [13, 18]]
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
      var dejaOuvert = cr.some(function (c) { return c[1] <= n.h; });
      if (plusTard) txt = (dejaOuvert ? 'Pause déjeuner · rouvre à ' : 'Fermé pour le moment · ouvre à ') + hfr(plusTard[0]);
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
    var ferme = function () { menu.hidden = true; bouton.setAttribute('aria-expanded', 'false'); bouton.setAttribute('aria-label', 'Ouvrir le menu'); };
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

  // barre d'appel du bas (téléphone) : visible une fois l'accueil dépassé
  var barre = document.querySelector('.barre-mobile'), accueil = document.querySelector('.hero');
  if (barre && accueil && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { barre.classList.toggle('visible', !es[0].isIntersecting); },
      { rootMargin: '-40% 0px 0px 0px' }).observe(accueil);
  } else if (barre) barre.classList.add('visible');

  // les petites animations ne tournent que lorsqu'elles sont à l'écran
  if ('IntersectionObserver' in window && !calme) {
    var veille = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('en-pause', !e.isIntersecting); });
    }, { rootMargin: '60px 0px' });
    document.querySelectorAll('.hero-sceau, .plan-epingle').forEach(function (el) { veille.observe(el); });
  }

  // onglets des tarifs (flèches, Début, Fin)
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
    choisit(tabs[0]);
  }

  // plan Google Maps : chargé seulement à la demande du visiteur
  var plan = document.querySelector('[data-plan]');
  if (plan) {
    plan.querySelector('[data-plan-btn]').addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.title = 'Plan d\'accès à L\'atelier du poil, 77 rue Saint-Jacques à Monpazier';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = 'https://www.google.com/maps?q=L%27atelier+du+poil,+77+Rue+Saint-Jacques,+24540+Monpazier&z=17&output=embed';
      plan.innerHTML = '';
      plan.appendChild(f);
      f.focus();
    });
  }
})();

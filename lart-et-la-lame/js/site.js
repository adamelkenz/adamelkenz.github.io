/* L'Art & La Lame — infos pratiques et petites interactions.
   Coordonnées et horaires du salon : ici (et dans le JSON-LD de index.html). */
var SALON = {
  tel: '+33367769247',
  telAffiche: '03 67 76 92 47',
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales
  horaires: {
    0: [],
    1: [[9, 19]],
    2: [[9, 19]],
    3: [[9, 19]],
    4: [[9, 19]],
    5: [[9, 19]],
    6: [[9, 15]]
  },
  // offre d'ouverture (Planity) : -20 % sur toutes les prestations, dates incluses
  offre: { debut: '2026-10-05', fin: '2026-10-17', taux: 0.2 }
};

(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // bouton « verre liquide » : la distorsion SVG de l'arrière-plan n'est rendue que par Chromium ;
  // ailleurs, le bouton garde un simple flou.
  if (window.chrome && window.CSS && CSS.supports('backdrop-filter', 'url(#verre)')) {
    document.documentElement.classList.add('verre-svg');
  }

  // téléphone
  document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = 'tel:' + SALON.tel; });
  document.querySelectorAll('[data-tel-texte]').forEach(function (s) { s.textContent = SALON.telAffiche; });
  var annee = document.querySelector('[data-annee]');
  if (annee) annee.textContent = new Date().getFullYear();

  // date et heure de Paris, quel que soit le fuseau du visiteur
  function maintenant() {
    var f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
    var o = {};
    f.formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return {
      j: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'].indexOf(o.weekday),
      h: +o.hour + o.minute / 60,
      date: o.year + '-' + o.month + '-' + o.day
    };
  }
  function hfr(h) {
    var m = Math.round((h % 1) * 60);
    return Math.floor(h) + ' h' + (m ? (m < 10 ? ' 0' : ' ') + m : '');
  }
  var n = maintenant();

  // prix : « 25 € », « 13,60 € »
  function euros(x) {
    var r = Math.round(x * 100) / 100;
    return (r % 1 ? r.toFixed(2).replace('.', ',') : String(r)) + ' €';
  }
  var offre = n.date >= SALON.offre.debut && n.date <= SALON.offre.fin;
  window.LAME = { offre: offre, taux: SALON.offre.taux, euros: euros };
  if (offre) {
    document.querySelectorAll('[data-offre]').forEach(function (el) { el.hidden = false; });
    document.querySelectorAll('[data-prix]').forEach(function (b) {
      var p = +b.getAttribute('data-prix'), plus = /^\+/.test(b.textContent.trim()) ? '+ ' : '';
      b.innerHTML = '<s>' + plus + euros(p) + '</s>' + plus + euros(p * (1 - SALON.offre.taux));
      b.setAttribute('aria-label', 'Prix ' + euros(p) + ', ' + euros(p * (1 - SALON.offre.taux)) + ' avec l\'offre d\'ouverture');
    });
  }

  // ouvert / fermé
  document.querySelectorAll('[data-statut]').forEach(function (statut) {
    if (n.j < 0) return;
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
  });
  var ligne = document.querySelector('.horaires tr[data-j="' + n.j + '"]');
  if (ligne) ligne.className = 'auj';

  // en-tête opaque une fois l'accueil quitté
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

  // apparition douce des blocs (et tracé du fil d'or sous les titres)
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

  // onglets de la carte (flèches, Début, Fin)
  var onglets = document.querySelector('[data-onglets]');
  if (onglets) {
    var liste = onglets.querySelector('[role="tablist"]');
    var tabs = [].slice.call(onglets.querySelectorAll('[role="tab"]'));
    var choisit = function (t, focus) {
      tabs.forEach(function (x) {
        var actif = x === t;
        x.setAttribute('aria-selected', String(actif));
        x.tabIndex = actif ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !actif;
      });
      if (focus) t.focus();
      if (liste.scrollWidth > liste.clientWidth) {
        liste.scrollTo({ left: t.offsetLeft - (liste.clientWidth - t.offsetWidth) / 2, behavior: calme ? 'auto' : 'smooth' });
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
      f.title = 'Plan d\'accès à L\'Art & La Lame, 1A rue des Charretiers à Ammerschwihr';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = 'https://www.google.com/maps?q=L%27art+et+la+lame,+1A+Rue+des+Charretiers,+68770+Ammerschwihr&ll=48.1255661,7.285343&z=16&output=embed';
      plan.innerHTML = '';
      plan.appendChild(f);
      f.focus();
    });
  }
})();

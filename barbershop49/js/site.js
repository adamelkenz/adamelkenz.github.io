/* Barbershop49 — infos pratiques et petites interactions.
   À COMPLÉTER : toutes les coordonnées du salon sont ici (et dans le JSON-LD de index.html). */
var SALON = {
  tel: '+33241000000',            // À COMPLÉTER — format international
  telAffiche: '02 41 00 00 00',   // À COMPLÉTER
  reservation: '',                // À COMPLÉTER — lien Planity / Booksy / autre ; vide = appel
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales
  horaires: {                     // À COMPLÉTER
    0: [], 1: [],
    2: [[9.5, 19]], 3: [[9.5, 19]], 4: [[9.5, 19]], 5: [[9.5, 19]], 6: [[9, 18]]
  }
};

(function () {
  // liens « réserver » et « appeler »
  var resa = SALON.reservation || ('tel:' + SALON.tel);
  document.querySelectorAll('[data-resa]').forEach(function (a) {
    a.href = resa;
    if (SALON.reservation) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  document.querySelectorAll('[data-tel]').forEach(function (a) {
    a.href = 'tel:' + SALON.tel;
    if (a.hasAttribute('data-tel-texte')) a.textContent = SALON.telAffiche;
  });

  // heure de Paris, quel que soit le fuseau du visiteur
  function maintenant() {
    var f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
    var o = {};
    f.formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    var jours = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    return { j: jours.indexOf(o.weekday), h: +o.hour + o.minute / 60 };
  }
  function hfr(h) {
    var m = Math.round((h % 1) * 60);
    return Math.floor(h) + ' h' + (m ? (m < 10 ? '0' : '') + m : '');
  }
  function duree(d) {
    var m = Math.round(d * 60);
    return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60 < 10 ? '0' : '') + (m % 60) : '');
  }

  var n = maintenant();
  var statut = document.querySelector('[data-statut]');
  if (statut && n.j >= 0) {
    var cr = SALON.horaires[n.j] || [];
    var ouvert = cr.filter(function (c) { return n.h >= c[0] && n.h < c[1]; })[0];
    var txt, cls;
    if (ouvert) {
      cls = 'ouvert';
      txt = 'Ouvert · ferme dans ' + duree(ouvert[1] - n.h);
    } else {
      cls = 'ferme';
      var plusTard = cr.filter(function (c) { return c[0] > n.h; })[0];
      if (plusTard) txt = 'Fermé · ouvre à ' + hfr(plusTard[0]);
      else {
        var noms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        for (var k = 1; k <= 7; k++) {
          var j = (n.j + k) % 7, c = SALON.horaires[j] || [];
          if (c.length) { txt = 'Fermé · ouvre ' + (k === 1 ? 'demain' : noms[j]) + ' à ' + hfr(c[0][0]); break; }
        }
      }
    }
    if (txt) { statut.className = 'statut ' + cls; statut.innerHTML = '<i></i>' + txt; }
  }
  var ligne = document.querySelector('.horaires tr[data-j="' + n.j + '"]');
  if (ligne) ligne.className = 'auj';

  // profondeur du salon : les plans bougent un peu avec la souris et le défilement
  var hero = document.querySelector('.hero');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var prevuH = false, mx = 0, my = 0;
    var majH = function () {
      prevuH = false;
      hero.style.setProperty('--sy', Math.min(window.scrollY, hero.offsetHeight).toFixed(1));
      hero.style.setProperty('--mx', mx.toFixed(3));
      hero.style.setProperty('--my', my.toFixed(3));
    };
    var demandeH = function () { if (!prevuH) { prevuH = true; requestAnimationFrame(majH); } };
    window.addEventListener('scroll', demandeH, { passive: true });
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', function (e) {
        mx = e.clientX / window.innerWidth * 2 - 1;
        my = e.clientY / window.innerHeight * 2 - 1;
        demandeH();
      });
    }
  }

  // apparition douce des blocs
  var blocs = document.querySelectorAll('.monte');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocs.forEach(function (b) { io.observe(b); });
  } else blocs.forEach(function (b) { b.classList.add('vu'); });
})();

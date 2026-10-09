/* Passion Coiffure by Yasmine — infos pratiques et petites interactions.
   Coordonnées du salon : ici (et dans le JSON-LD de index.html). */
var SALON = {
  reservation: 'https://www.planity.com/passion-coiffure-by-yasmine-59990-saultain',
  tel: '',          // format international, ex. '+33327000000' ; vide = ligne téléphone masquée
  telAffiche: '',   // ex. '03 27 00 00 00'
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales
  horaires: {
    0: [],
    1: [[14, 18.5]],
    2: [[9, 18.5]],
    3: [[9, 14]],
    4: [[9, 18.5]],
    5: [[9, 18.5]],
    6: [[8.5, 18]]
  }
};

(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // liens de réservation et téléphone
  document.querySelectorAll('[data-resa]').forEach(function (a) {
    a.href = SALON.reservation; a.target = '_blank'; a.rel = 'noopener';
  });
  if (SALON.tel) {
    document.querySelectorAll('[data-ligne-tel]').forEach(function (l) { l.hidden = false; });
    document.querySelectorAll('[data-tel]').forEach(function (a) {
      a.href = 'tel:' + SALON.tel;
      if (a.hasAttribute('data-tel-texte')) a.textContent = SALON.telAffiche || SALON.tel;
    });
  }
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
    if (txt) { statut.className = statut.className.replace(/\b(ouvert|ferme)\b/g, '') + ' ' + cls; statut.innerHTML = '<i></i>' + txt; }
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

  // barre de réservation du bas (téléphone) : visible une fois l'accueil dépassé
  var barre = document.querySelector('.barre-mobile'), accueil = document.querySelector('.hero');
  if (barre && accueil && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { barre.classList.toggle('visible', !es[0].isIntersecting); },
      { rootMargin: '-40% 0px 0px 0px' }).observe(accueil);
  } else if (barre) barre.classList.add('visible');

  // lignes de coupe : les ciseaux avancent avec le défilement et coupent tant qu'on fait défiler
  var coupes = [].slice.call(document.querySelectorAll('.coupe'));
  if (coupes.length) {
    var prevu = false, finCoupe;
    var majCoupes = function () {
      prevu = false;
      var h = window.innerHeight;
      coupes.forEach(function (d) {
        var r = d.getBoundingClientRect();
        var p = (h * .92 - r.top) / (h * .6);
        d.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
      });
    };
    majCoupes();
    window.addEventListener('scroll', function () {
      if (!prevu) { prevu = true; requestAnimationFrame(majCoupes); }
      if (calme) return;
      coupes.forEach(function (d) {
        var p = +d.style.getPropertyValue('--p');
        d.classList.toggle('coupe-active', p > 0 && p < 1);
      });
      clearTimeout(finCoupe);
      finCoupe = setTimeout(function () { coupes.forEach(function (d) { d.classList.remove('coupe-active'); }); }, 180);
    }, { passive: true });
    window.addEventListener('resize', majCoupes);
  }

  // le sèche-cheveux souffle sur les pétales
  var seche = document.querySelector('.cocon-seche');
  if (seche) {
    var souffle = function () {
      seche.classList.add('souffle');
      clearTimeout(seche._t);
      seche._t = setTimeout(function () { seche.classList.remove('souffle'); }, 1400);
      if (!window.Sakura) return;
      var r = seche.getBoundingClientRect();
      window.Sakura.eclat(r.left + r.width * .92, r.top + r.height * .38, 26, 1);
      window.Sakura.rafale(3.5);
    };
    seche.addEventListener('click', souffle);
  }

  // un clic dans le vide fait éclore une petite gerbe de pétales
  document.addEventListener('click', function (e) {
    if (!window.Sakura || e.target.closest('a, button, input, iframe, .menu-mobile')) return;
    window.Sakura.eclat(e.clientX, e.clientY, 12, 0);
  });
})();

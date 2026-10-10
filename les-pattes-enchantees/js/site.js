/* Les Pattes Enchantées — infos pratiques, petites interactions et le toilettage à la baguette.
   Coordonnées du salon : ici (et dans le JSON-LD de index.html). */
var SALON = {
  tel: '+33777946551',
  telAffiche: '07 77 94 65 51',
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales
  horaires: {
    0: [],
    1: [[9, 18]],
    2: [[9, 18]],
    3: [[9, 18]],
    4: [[9, 18]],
    5: [[9, 18]],
    6: [[9, 18]]
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
    if (ouvert) { cls = 'ouvert'; txt = 'Ouvert aujourd\'hui jusqu\'à ' + hfr(ouvert[1]) + ' · sur rendez-vous'; }
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

  // traces de pattes : elles se posent une à une pendant qu'on fait défiler
  var chemins = [].slice.call(document.querySelectorAll('.pas'));
  if (chemins.length) {
    var prevu = false;
    var majPas = function () {
      prevu = false;
      var h = window.innerHeight;
      chemins.forEach(function (c) {
        var r = c.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (h * .95 - r.top) / (h * .55)));
        var pattes = c.children, nb = calme ? (p > 0 ? pattes.length : 0) : Math.round(p * pattes.length);
        for (var i = 0; i < pattes.length; i++) pattes[i].classList.toggle('pose', i < nb);
      });
    };
    majPas();
    window.addEventListener('scroll', function () { if (!prevu) { prevu = true; requestAnimationFrame(majPas); } }, { passive: true });
    window.addEventListener('resize', majPas);
  }

  // les animations décoratives ne tournent que lorsque leur section est à l'écran
  if ('IntersectionObserver' in window && !calme) {
    var veille = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('en-pause', !e.isIntersecting); });
    }, { rootMargin: '100px 0px' });
    document.querySelectorAll('.hero-scene, .sorciers, .magie, .deroule, .plan-epingle').forEach(function (el) {
      el.classList.add('en-pause'); veille.observe(el);
    });
  }

  // plan Google Maps : chargé seulement à la demande du visiteur
  var plan = document.querySelector('[data-plan]');
  if (plan) {
    plan.querySelector('[data-plan-btn]').addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.title = 'Plan d\'accès au salon Les Pattes Enchantées';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = 'https://www.google.com/maps?q=Les+pattes+enchant%C3%A9es,+228+Rue+Jean+Jaur%C3%A8s,+62122+Lapugnoy&z=16&output=embed';
      plan.innerHTML = '';
      plan.appendChild(f);
      f.focus();
    });
  }

  /* ---------- les petits sorciers : polaroïds qui s'inclinent, visionneuse ---------- */
  var polas = [].slice.call(document.querySelectorAll('[data-photo]'));
  if (polas.length && !calme && window.matchMedia('(pointer: fine)').matches) {
    polas.forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        b.classList.add('suit');
        b.style.setProperty('--ty', (px * 14).toFixed(2) + 'deg');
        b.style.setProperty('--tx', (-py * 14).toFixed(2) + 'deg');
      });
      b.addEventListener('pointerleave', function () {
        b.classList.remove('suit'); b.style.removeProperty('--tx'); b.style.removeProperty('--ty');
      });
    });
  }
  var vis = document.querySelector('[data-visionneuse]');
  if (vis && polas.length) {
    var vImg = vis.querySelector('[data-v-img]'), vLeg = vis.querySelector('[data-v-legende]'), courant = 0;
    var montre = function (i) {
      courant = (i + polas.length) % polas.length;
      var b = polas[courant], img = b.querySelector('img'), leg = b.querySelector('.polaroid-legende');
      vImg.src = img.getAttribute('data-grand'); vImg.alt = img.alt;
      vLeg.innerHTML = leg.innerHTML;
    };
    polas.forEach(function (b, i) {
      b.addEventListener('click', function () {
        montre(i);
        if (vis.showModal) vis.showModal(); else vis.setAttribute('open', '');
      });
    });
    var fermeVis = function () { if (vis.close) vis.close(); else vis.removeAttribute('open'); };
    vis.querySelector('[data-v-fermer]').addEventListener('click', fermeVis);
    vis.querySelector('[data-v-prec]').addEventListener('click', function () { montre(courant - 1); });
    vis.querySelector('[data-v-suiv]').addEventListener('click', function () { montre(courant + 1); });
    vis.addEventListener('click', function (e) { if (e.target === vis) fermeVis(); });
    vis.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') montre(courant - 1);
      if (e.key === 'ArrowRight') montre(courant + 1);
    });
    var x0 = null;
    vis.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    vis.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) montre(courant + (dx < 0 ? 1 : -1));
    });
  }
})();

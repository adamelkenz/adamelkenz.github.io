/* Bulle de poils — infos pratiques, avant/après et petites interactions.
   Coordonnées de la toiletteuse : ici (et dans le JSON-LD de index.html). */
var TOILETTEUSE = {
  tel: '+33630648093',
  telAffiche: '06 30 64 80 93',
  mobile: true, // numéro de portable : la demande de rendez-vous part par SMS
  // horaires : [jour 0=dimanche … 6=samedi] = [[début, fin], …] en heures décimales
  horaires: {
    0: [],
    1: [[9, 18.5]],
    2: [[9, 18.5]],
    3: [[9, 18.5]],
    4: [[9, 18.5]],
    5: [[9, 18.5]],
    6: [[9, 18.5]]
  }
};

(function () {
  var T = TOILETTEUSE;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // téléphone
  document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = 'tel:' + T.tel; });
  document.querySelectorAll('[data-sms]').forEach(function (a) { a.href = 'sms:' + T.tel; });
  document.querySelectorAll('[data-tel-texte]').forEach(function (s) { s.textContent = T.telAffiche; });
  var annee = document.querySelector('[data-annee]');
  if (annee) annee.textContent = new Date().getFullYear();

  // disponible / en repos, à l'heure de Paris quel que soit le fuseau du visiteur
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
    var cr = T.horaires[n.j] || [], txt, cls;
    var ouvert = cr.filter(function (c) { return n.h >= c[0] && n.h < c[1]; })[0];
    if (ouvert) { cls = 'ouvert'; txt = 'En tournée aujourd\'hui jusqu\'à ' + hfr(ouvert[1]) + ' · joignable pour un rendez-vous'; }
    else {
      cls = 'ferme';
      var plusTard = cr.filter(function (c) { return c[0] > n.h; })[0];
      if (plusTard) txt = 'Pas encore en tournée · départ à ' + hfr(plusTard[0]) + ', laissez un SMS';
      else {
        var noms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        for (var k = 1; k <= 7; k++) {
          var j = (n.j + k) % 7, c = T.horaires[j] || [];
          if (c.length) { txt = 'Tournée terminée · reprise ' + (k === 1 ? 'demain' : noms[j]) + ' à ' + hfr(c[0][0]) + ', laissez un SMS'; break; }
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

  // les animations décoratives ne tournent que lorsque leur section est à l'écran
  if ('IntersectionObserver' in window && !calme) {
    var veille = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('en-pause', !e.isIntersecting); });
    }, { rootMargin: '100px 0px' });
    document.querySelectorAll('.hero-bulles, .maison, .carte-zone').forEach(function (el) {
      el.classList.add('en-pause'); veille.observe(el);
    });
  }

  // les photos-bulles de l'accueil font « boing » quand on les touche
  document.querySelectorAll('.pbulle').forEach(function (b) {
    b.addEventListener('pointerdown', function () {
      if (calme) return;
      b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing');
    });
    b.addEventListener('animationend', function (e) { if (e.animationName === 'boing') b.classList.remove('boing'); });
  });

  /* ---------- avant / après : une bulle qui grossit depuis le doigt ---------- */
  var aa = document.querySelector('[data-aa]');
  if (aa) {
    var apres = aa.querySelector('[data-aa-apres]'), anneau = aa.querySelector('[data-aa-anneau]');
    var etiquette = aa.querySelector('[data-aa-etiquette]'), btnAA = document.querySelector('[data-aa-btn]');
    var montreApres = false, enCours = false;
    var basculeAA = function (x, y) {
      if (enCours) return;
      var r = aa.getBoundingClientRect();
      if (x == null) { x = r.width / 2; y = r.height * .4; }
      var px = (x / r.width * 100).toFixed(1) + '%', py = (y / r.height * 100).toFixed(1) + '%';
      // rayon qui couvre tout le cadre depuis ce point
      var rmax = Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(r.width - x, y), Math.hypot(x, r.height - y), Math.hypot(r.width - x, r.height - y)));
      montreApres = !montreApres;
      etiquette.textContent = montreApres ? 'Après' : 'Avant';
      aa.classList.toggle('apres', montreApres);
      if (btnAA) { btnAA.textContent = montreApres ? 'Revoir l\'avant' : 'Voir l\'après'; btnAA.setAttribute('aria-pressed', String(montreApres)); }
      if (calme) { apres.style.clipPath = montreApres ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)'; return; }
      enCours = true;
      // départ : sans transition, la bulle se place au point touché
      apres.classList.remove('anime'); anneau.classList.remove('anime');
      apres.style.clipPath = 'circle(' + (montreApres ? 0 : rmax) + 'px at ' + px + ' ' + py + ')';
      anneau.style.left = px; anneau.style.top = py;
      anneau.style.width = anneau.style.height = (montreApres ? 0 : rmax * 2) + 'px';
      anneau.style.opacity = '1';
      void aa.offsetWidth;
      apres.classList.add('anime'); anneau.classList.add('anime');
      apres.style.clipPath = 'circle(' + (montreApres ? rmax : 0) + 'px at ' + px + ' ' + py + ')';
      anneau.style.width = anneau.style.height = (montreApres ? rmax * 2 : 0) + 'px';
      anneau.style.opacity = '0';
      setTimeout(function () { enCours = false; }, 980);
    };
    aa.addEventListener('click', function (e) {
      var r = aa.getBoundingClientRect();
      basculeAA(e.clientX - r.left, e.clientY - r.top);
    });
    if (btnAA) btnAA.addEventListener('click', function () { basculeAA(); });
  }

  /* ---------- les soins : filtre chien / chat, ajout à la demande ---------- */
  var pastilles = [].slice.call(document.querySelectorAll('[data-filtre]'));
  var soins = [].slice.call(document.querySelectorAll('.soin'));
  function filtre(animal) {
    pastilles.forEach(function (p) { p.setAttribute('aria-pressed', String(p.getAttribute('data-filtre') === animal)); });
    soins.forEach(function (s) { s.classList.toggle('masque', (s.getAttribute('data-pour') || '').split(' ').indexOf(animal) < 0); });
  }
  pastilles.forEach(function (p) {
    p.addEventListener('click', function () {
      var a = p.getAttribute('data-filtre');
      filtre(a);
      if (window.RDV) window.RDV.animal(a);
    });
  });

  function envol(depuis) {
    if (calme) return;
    var r = depuis.getBoundingClientRect(), parent = depuis.closest('.soin'), rp = parent.getBoundingClientRect();
    for (var i = 0; i < 3; i++) {
      var b = document.createElement('span');
      b.className = 'bulle-envol';
      b.style.left = (r.left - rp.left + 14 + i * 22) + 'px';
      b.style.top = (r.top - rp.top) + 'px';
      b.style.setProperty('--vx', ((i - 1) * 14) + 'px');
      b.style.animationDelay = (i * .08) + 's';
      b.style.width = b.style.height = (12 + i * 5) + 'px';
      parent.appendChild(b);
      b.addEventListener('animationend', function () { this.remove(); });
    }
  }
  document.querySelectorAll('[data-ajouter]').forEach(function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      if (!window.RDV) return;
      var ajoute = window.RDV.basculeSoin(b.getAttribute('data-ajouter'));
      if (ajoute) envol(b);
    });
  });
  // la demande de rendez-vous prévient quand elle change : on suit ses soins et son animal
  document.addEventListener('rdv:maj', function (e) {
    var etat = e.detail;
    document.querySelectorAll('[data-ajouter]').forEach(function (b) {
      var oui = etat.soins.indexOf(b.getAttribute('data-ajouter')) > -1;
      b.setAttribute('aria-pressed', String(oui));
      b.textContent = oui ? 'Dans ma demande' : 'Ajouter à ma demande';
    });
    if (etat.animal) filtre(etat.animal);
  });
  filtre('chien');
})();

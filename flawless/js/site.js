/* Flawless — coordonnées, animations et petites interactions.
   Coordonnées et horaires de l'institut : ici. Un champ laissé vide est simplement masqué sur le site. */
var INSTITUT = {
  tel: '+33607826588',          // format international
  telAffiche: '06 07 82 65 88',
  mobile: true,                 // le numéro reçoit les SMS (bouton « Envoyer par SMS »)
  email: '',
  adresse: '640 rue du Pourtour, 45390 Briarres-sur-Essonne',
  instagram: '',
  facebook: '',
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales
  horaires: {
    1: [[9, 19]], 2: [[9, 19]], 3: [[9, 19]], 4: [[9, 19]], 5: [[9, 19]],
    6: [[8, 12]]
  }
};

(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finPointeur = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var html = document.documentElement;

  /* ---------- rideau d'ouverture (une fois par session) ---------- */
  var rideau = document.querySelector('.rideau');
  var hero = document.querySelector('.hero');
  var dejaVu = false;
  try { dejaVu = sessionStorage.getItem('flawless-rideau') === '1'; } catch (e) {}
  function lancerHero() { hero.classList.add('pret'); }
  if (!rideau || dejaVu || calme) {
    if (rideau) rideau.classList.add('vu');
    requestAnimationFrame(lancerHero);
  } else {
    try { sessionStorage.setItem('flawless-rideau', '1'); } catch (e) {}
    setTimeout(function () {
      rideau.classList.add('part');
      setTimeout(lancerHero, 300);
      setTimeout(function () { rideau.classList.add('vu'); }, 1100);
    }, 2100);
  }

  /* ---------- lettres du nom ---------- */
  document.querySelectorAll('[data-lettres]').forEach(function (el) {
    var t = el.textContent, out = '';
    for (var i = 0; i < t.length; i++) out += '<span class="lettre" aria-hidden="true" style="--i:' + i + '">' + t[i] + '</span>';
    el.setAttribute('aria-label', t);
    el.setAttribute('role', 'text');
    el.innerHTML = out;
  });
  var titre = document.querySelector('.hero-titre');
  if (titre && !calme) {
    var obs = new MutationObserver(function () {
      if (hero.classList.contains('pret')) { titre.classList.add('lettres-pretes'); obs.disconnect(); }
    });
    obs.observe(hero, { attributes: true, attributeFilter: ['class'] });
  } else if (titre) titre.classList.add('lettres-pretes');

  /* ---------- en-tête qui se cache au défilement ---------- */
  var entete = document.querySelector('.entete');
  var dernierY = window.scrollY;
  var menuOuvert = false;
  function surDefilement() {
    var y = window.scrollY;
    entete.classList.toggle('colle', y > 30);
    entete.classList.toggle('masque', !menuOuvert && y > 400 && y > dernierY + 2);
    if (y < dernierY - 2) entete.classList.remove('masque');
    dernierY = y;
  }
  window.addEventListener('scroll', surDefilement, { passive: true });
  surDefilement();

  /* ---------- menu mobile ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mobile');
  function basculerMenu(ouvrir) {
    menuOuvert = ouvrir;
    burger.setAttribute('aria-expanded', ouvrir);
    burger.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.hidden = !ouvrir;
    html.classList.toggle('menu-ouvert', ouvrir);
    document.body.style.overflow = ouvrir ? 'hidden' : '';
    entete.classList.remove('masque');
  }
  burger.addEventListener('click', function () { basculerMenu(!menuOuvert); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) basculerMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOuvert) basculerMenu(false); });

  /* ---------- lien actif dans la navigation ---------- */
  var liensNav = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (!en.isIntersecting) return;
        liensNav.forEach(function (a) { a.classList.toggle('actif', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- curseur ---------- */
  var curseur = document.querySelector('.curseur');
  var souris = { x: innerWidth / 2, y: innerHeight / 2 };
  if (finPointeur && curseur && !calme) {
    var point = curseur.querySelector('.curseur-point');
    var anneau = curseur.querySelector('.curseur-anneau');
    var texte = curseur.querySelector('.curseur-texte');
    var ax = souris.x, ay = souris.y;
    document.addEventListener('pointermove', function (e) {
      souris.x = e.clientX; souris.y = e.clientY;
      point.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      var cible = e.target.closest ? e.target.closest('[data-curseur], a, button, input, select, textarea') : null;
      var label = cible && cible.getAttribute('data-curseur');
      if (cible && cible.classList.contains('comparer-curseur')) label = 'Glisser';
      curseur.classList.toggle('label', !!label);
      curseur.classList.toggle('lien', !!cible && !label);
      if (label) texte.textContent = label;
      curseur.classList.remove('cache');
    });
    document.addEventListener('pointerleave', function () { curseur.classList.add('cache'); });
    (function boucle() {
      ax += (souris.x - ax) * .18; ay += (souris.y - ay) * .18;
      anneau.style.transform = 'translate(' + ax + 'px,' + ay + 'px)';
      requestAnimationFrame(boucle);
    })();
  }

  /* ---------- boutons aimantés ---------- */
  if (finPointeur && !calme) {
    document.querySelectorAll('.aimant').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--x', ((e.clientX - r.left - r.width / 2) * .25) + 'px');
        b.style.setProperty('--y', ((e.clientY - r.top - r.height / 2) * .35) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--x', '0px'); b.style.setProperty('--y', '0px'); });
    });
  }

  /* ---------- parallaxe du visuel d'accueil ---------- */
  var visuel = document.querySelector('[data-parallaxe]');
  if (visuel && finPointeur && !calme) {
    hero.addEventListener('pointermove', function (e) {
      var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      visuel.style.setProperty('--px', (nx * -14) + 'px');
      visuel.style.setProperty('--py', (ny * -14) + 'px');
    });
  }

  /* ---------- manifeste : mots qui s'allument, portrait qui se dessine ---------- */
  var manifeste = document.querySelector('[data-mots]');
  var mots = [];
  if (manifeste) {
    manifeste.innerHTML = manifeste.innerHTML.split(/(\s+)/).map(function (m) {
      return /^\s+$/.test(m) || !m ? m : '<span class="mot">' + m + '</span>';
    }).join('');
    mots = manifeste.querySelectorAll('.mot');
  }
  var traces = document.querySelectorAll('.trace path');
  var institut = document.querySelector('.institut');

  /* ---------- bandeau défilant, accéléré par la vitesse de défilement ---------- */
  var bandeau = document.querySelector('.bandeau-piste');
  if (bandeau) bandeau.innerHTML += bandeau.innerHTML;
  var posBandeau = 0, vitesse = 0, yPrec = window.scrollY;

  function image() {
    var y = window.scrollY, h = innerHeight;
    if (institut && (mots.length || traces.length)) {
      var r = institut.getBoundingClientRect();
      var p = calme ? 1 : Math.min(1, Math.max(0, (h * .85 - r.top) / (r.height * .7)));
      var n = Math.round(p * mots.length);
      for (var i = 0; i < mots.length; i++) mots[i].classList.toggle('allume', i < n);
      traces.forEach(function (t, k) {
        var debut = k / traces.length * .5;
        var q = Math.min(1, Math.max(0, (p - debut) / .5));
        t.style.setProperty('--trace', 1 - q);
      });
    }
    if (bandeau && !calme) {
      vitesse += ((y - yPrec) * .15 - vitesse) * .1;
      yPrec = y;
      posBandeau -= .6 + Math.abs(vitesse);
      var moitie = bandeau.scrollWidth / 2;
      if (-posBandeau > moitie) posBandeau += moitie;
      bandeau.style.transform = 'translate3d(' + posBandeau + 'px,0,0)';
    }
    if (!calme) requestAnimationFrame(image);
  }
  requestAnimationFrame(image);

  /* ---------- les soins : accordéon ---------- */
  var soins = document.querySelectorAll('.soin');
  function ouvrirSoin(s, ouvrir) {
    s.classList.toggle('ouvert', ouvrir);
    s.querySelector('.soin-tete').setAttribute('aria-expanded', ouvrir);
  }
  soins.forEach(function (s) {
    var tete = s.querySelector('.soin-tete');
    tete.addEventListener('click', function () {
      var ouvrir = !s.classList.contains('ouvert');
      soins.forEach(function (x) { ouvrirSoin(x, x === s && ouvrir); });
    });
  });
  if (soins.length) ouvrirSoin(soins[0], true);
  // sur écran tactile, les icônes se dessinent à l'apparition
  if (!finPointeur && 'IntersectionObserver' in window) {
    var ioSoin = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vu'); ioSoin.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -20% 0px' });
    soins.forEach(function (s) { ioSoin.observe(s); });
  }

  /* ---------- avant / après ---------- */
  var comparer = document.querySelector('.comparer');
  if (comparer) {
    var range = comparer.querySelector('.comparer-curseur');
    var placer = function (v) { comparer.style.setProperty('--pos', v + '%'); };
    range.addEventListener('input', function () { placer(range.value); });
    // glisser directement sur l'image (y compris au doigt, sans bloquer le défilement vertical)
    var glisse = false;
    var depuis = function (e) {
      var r = comparer.getBoundingClientRect();
      var v = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100));
      range.value = v; placer(v);
    };
    comparer.addEventListener('pointerdown', function (e) { glisse = true; comparer.classList.add('actif'); depuis(e); });
    window.addEventListener('pointermove', function (e) { if (glisse) depuis(e); });
    window.addEventListener('pointerup', function () { glisse = false; comparer.classList.remove('actif'); });
    window.addEventListener('pointercancel', function () { glisse = false; comparer.classList.remove('actif'); });
    // petite démonstration à la première apparition
    if (!calme && 'IntersectionObserver' in window) {
      var ioComp = new IntersectionObserver(function (entrees) {
        if (!entrees[0].isIntersecting) return;
        ioComp.disconnect();
        var t0 = null;
        (function demo(t) {
          if (glisse) return;
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 2200);
          var v = 50 + Math.sin(k * Math.PI * 2) * 28 * (1 - k * .3);
          if (k >= 1) v = 50;
          range.value = v; placer(v);
          if (k < 1) requestAnimationFrame(demo);
        })(performance.now());
      }, { threshold: .6 });
      ioComp.observe(comparer);
    }
  }

  /* ---------- la cabine : jour / soir ---------- */
  var cabine = document.querySelector('.cabine');
  if (cabine) {
    var lueurs = cabine.querySelector('.lueurs');
    var points = '';
    for (var l = 0; l < 26; l++) {
      points += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;--d:' + (2 + Math.random() * 3).toFixed(2) + 's;--r:' + (-Math.random() * 4).toFixed(2) + 's"></i>';
    }
    lueurs.innerHTML = points;
    var momentTitre = cabine.querySelector('[data-moment-titre]');
    var momentTexte = cabine.querySelector('[data-moment-texte]');
    var textes = {
      jour: ['baigné de lumière', 'Murs sable, bois blond, linge blanc et bouquet de pampas : une cabine pensée pour que vous vous sentiez bien dès la porte franchie.'],
      soir: ['à la lueur douce', 'Le soir venu, la lumière se tamise, une guirlande s\'allume sur l\'échelle de bois : le décor idéal pour un massage ou un soin cocooning.']
    };
    cabine.querySelectorAll('[data-moment]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-moment');
        cabine.classList.toggle('soir', m === 'soir');
        cabine.querySelectorAll('[data-moment]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        momentTitre.textContent = textes[m][0];
        momentTexte.textContent = textes[m][1];
      });
    });
    var photos = cabine.querySelector('.cabine-photos');
    var agrandir = function () { visionner(cabine.classList.contains('soir') ? photos.querySelector('.cabine-soir') : photos.querySelector('.cabine-jour'), photos); };
    photos.addEventListener('click', agrandir);
    photos.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); agrandir(); } });
  }

  function visionner(img, retourFocus) {
    var fond = document.createElement('div');
    fond.className = 'visionneuse';
    fond.setAttribute('role', 'dialog');
    fond.setAttribute('aria-modal', 'true');
    fond.setAttribute('aria-label', img.alt);
    var grande = new Image();
    grande.srcset = img.srcset; grande.sizes = '90vw'; grande.src = img.currentSrc || img.src; grande.alt = img.alt;
    var fermer = document.createElement('button');
    fermer.type = 'button'; fermer.setAttribute('aria-label', 'Fermer'); fermer.innerHTML = '&times;';
    fond.appendChild(grande); fond.appendChild(fermer);
    document.body.appendChild(fond);
    document.body.style.overflow = 'hidden';
    fermer.focus();
    function clore() { fond.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', touche); if (retourFocus) retourFocus.focus(); }
    function touche(e) { if (e.key === 'Escape') clore(); if (e.key === 'Tab') { e.preventDefault(); fermer.focus(); } }
    fond.addEventListener('click', clore);
    document.addEventListener('keydown', touche);
  }

  /* ---------- révélations au défilement ---------- */
  var aReveler = document.querySelectorAll('.titre, .valeurs li, .soins-tete > p, .comparer, .regard-points, .cabine-photos, .avis-carte, .rdv-choix fieldset, .carte-rdv, .info');
  if ('IntersectionObserver' in window && !calme) {
    var ioRev = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vu'); ioRev.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    aReveler.forEach(function (el) { el.setAttribute('data-revele', ''); ioRev.observe(el); });
  }

  /* ---------- coordonnées ---------- */
  var I = INSTITUT;
  function montrer(champ, ok) { document.querySelectorAll('[data-champ="' + champ + '"]').forEach(function (el) { el.hidden = !ok; }); }
  document.querySelectorAll('[data-tel]').forEach(function (a) { if (I.tel) a.href = 'tel:' + I.tel; });
  document.querySelectorAll('[data-tel-texte]').forEach(function (s) { s.textContent = I.telAffiche || I.tel; });
  document.querySelectorAll('[data-adresse]').forEach(function (s) { s.textContent = I.adresse; });
  document.querySelectorAll('[data-carte]').forEach(function (a) { a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Flawless, ' + I.adresse); });
  var reseaux = document.querySelector('[data-reseaux]');
  if (I.instagram) reseaux.insertAdjacentHTML('beforeend', '<a href="' + I.instagram + '" target="_blank" rel="noopener">Instagram</a>');
  if (I.facebook) reseaux.insertAdjacentHTML('beforeend', '<a href="' + I.facebook + '" target="_blank" rel="noopener">Facebook</a>');
  var aHoraires = Object.keys(I.horaires).length > 0;
  montrer('adresse', !!I.adresse); montrer('tel', !!I.tel);
  montrer('horaires', aHoraires); montrer('reseaux', !!(I.instagram || I.facebook));
  var menuTel = document.querySelector('.menu-tel');
  if (menuTel) menuTel.hidden = !I.tel;

  var annee = document.querySelector('[data-annee]');
  if (annee) annee.textContent = new Date().getFullYear();

  // horaires et statut ouvert / fermé, à l'heure de Paris
  function hfr(h) { var m = Math.round((h % 1) * 60); return Math.floor(h) + ' h' + (m ? (m < 10 ? ' 0' : ' ') + m : ''); }
  var noms = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  if (aHoraires) {
    var f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
    var o = {};
    f.formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    var j = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'].indexOf(o.weekday), h = +o.hour + o.minute / 60;
    var liste = document.querySelector('[data-horaires]');
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var cr = I.horaires[d] || [];
      var li = document.createElement('li');
      if (d === j) li.className = 'aujourdhui';
      li.innerHTML = '<span>' + noms[d] + '</span><span>' + (cr.length ? cr.map(function (c) { return hfr(c[0]) + ' – ' + hfr(c[1]); }).join(', ') : 'Fermé') + '</span>';
      liste.appendChild(li);
    });
    var cr = I.horaires[j] || [];
    var ouvert = cr.filter(function (c) { return h >= c[0] && h < c[1]; })[0];
    var texteStatut, prochain = '';
    if (ouvert) texteStatut = 'Ouvert jusqu\'à ' + hfr(ouvert[1]);
    else {
      var ensuite = cr.filter(function (c) { return c[0] > h; })[0];
      if (ensuite) texteStatut = 'Fermé · ouvre à ' + hfr(ensuite[0]);
      else {
        for (var k = 1; k <= 7; k++) {
          var d2 = (j + k) % 7;
          if ((I.horaires[d2] || []).length) { prochain = (k === 1 ? 'demain' : noms[d2].toLowerCase()) + ' à ' + hfr(I.horaires[d2][0][0]); break; }
        }
        texteStatut = 'Fermé · ouvre ' + prochain;
      }
    }
    document.querySelectorAll('[data-statut], [data-statut-court]').forEach(function (s) {
      s.classList.toggle('ouvert', !!ouvert);
      s.textContent = s.hasAttribute('data-statut-court') ? (ouvert ? 'L\'institut est ouvert · jusqu\'à ' + hfr(ouvert[1]) : texteStatut.replace('Fermé · ', 'Fermé pour le moment · ')) : texteStatut;
      s.hidden = false;
    });
  }
})();

/* Les Fleurs de Florencia — coordonnées, animations et petites interactions.
   Coordonnées et horaires de la boutique : ici. Un champ laissé vide est simplement masqué sur le site. */
var BOUTIQUE = {
  tel: '',            // format international, ex. '+33555000000'
  telAffiche: '',     // ex. '05 55 00 00 00'
  mobile: false,      // true si le numéro reçoit les SMS (bouton « Envoyer par SMS »)
  email: '',
  adresse: '',        // ex. '3 rue Victor Hugo, 87400 Saint-Léonard-de-Noblat'
  instagram: '',
  facebook: '',
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales ; {} = non renseignés
  horaires: {}
};

(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finPointeur = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var html = document.documentElement;

  /* ---------- rideau d'ouverture (une fois par session) ---------- */
  var rideau = document.querySelector('.rideau');
  var hero = document.querySelector('.hero');
  var dejaVu = false;
  try { dejaVu = sessionStorage.getItem('florencia-rideau') === '1'; } catch (e) {}
  function lancerHero() { hero.classList.add('pret'); }
  if (!rideau || dejaVu || calme) {
    if (rideau) rideau.classList.add('vu');
    requestAnimationFrame(lancerHero);
  } else {
    try { sessionStorage.setItem('florencia-rideau', '1'); } catch (e) {}
    setTimeout(function () {
      rideau.classList.add('part');
      setTimeout(lancerHero, 250);
      setTimeout(function () { rideau.classList.add('vu'); }, 1050);
    }, 1500);
  }

  /* ---------- lettres du titre ---------- */
  document.querySelectorAll('[data-lettres]').forEach(function (el, n) {
    var t = el.textContent, out = '';
    for (var i = 0; i < t.length; i++) {
      out += t[i] === ' ' ? ' ' : '<span class="lettre" style="--i:' + i + '">' + t[i] + '</span>';
    }
    el.setAttribute('aria-label', t);
    el.innerHTML = out;
    el.querySelectorAll('.lettre').forEach(function (l) { l.setAttribute('aria-hidden', 'true'); });
    el.style.setProperty('--depart', (n * 350) + 'ms');
  });
  // l'animation des lettres ne démarre qu'avec la classe « pret » du hero
  var titre = document.querySelector('.hero-titre');
  if (titre && !calme) {
    var obs = new MutationObserver(function () {
      if (hero.classList.contains('pret')) { titre.classList.add('lettres-pretes'); obs.disconnect(); }
    });
    obs.observe(hero, { attributes: true, attributeFilter: ['class'] });
    if (hero.classList.contains('pret')) titre.classList.add('lettres-pretes');
  }

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
      var cible = e.target.closest ? e.target.closest('[data-curseur], a, button, [role="tab"], textarea, input, select') : null;
      var label = cible && cible.getAttribute('data-curseur');
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

  /* ---------- mots du manifeste et tracé de la fleur ---------- */
  var manifeste = document.querySelector('[data-mots]');
  var mots = [];
  if (manifeste) {
    var morceaux = manifeste.innerHTML.split(/(\s+)/);
    manifeste.innerHTML = morceaux.map(function (m) { return /^\s+$/.test(m) || !m ? m : '<span class="mot">' + m + '</span>'; }).join('');
    mots = manifeste.querySelectorAll('.mot');
  }
  var traces = document.querySelectorAll('.trace path');
  var atelier = document.querySelector('.atelier');

  /* ---------- défilement horizontal épinglé des créations ---------- */
  var creations = document.querySelector('.creations');
  var piste = document.querySelector('.creations-piste');
  var grandEcran = window.matchMedia('(min-width: 901px)');
  var decalage = 0;
  function mesurerCreations() {
    if (!creations) return;
    var epingler = grandEcran.matches && !calme;
    creations.classList.toggle('epingle', epingler);
    if (epingler) {
      piste.style.transform = '';
      decalage = Math.max(0, piste.scrollWidth - innerWidth);
      creations.style.height = (innerHeight + decalage) + 'px';
    } else {
      decalage = 0;
      creations.style.height = '';
      piste.style.transform = '';
    }
  }

  /* ---------- bandeau défilant, accéléré par la vitesse de défilement ---------- */
  var bandeau = document.querySelector('.bandeau-piste');
  if (bandeau) bandeau.innerHTML += bandeau.innerHTML;
  var posBandeau = 0, vitesse = 0, yPrec = window.scrollY;

  function image() {
    var y = window.scrollY, h = innerHeight;
    // manifeste
    if (atelier && (mots.length || traces.length)) {
      var r = atelier.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (h * .85 - r.top) / (r.height * .75)));
      if (calme) p = 1;
      var n = Math.round(p * mots.length);
      for (var i = 0; i < mots.length; i++) mots[i].classList.toggle('allume', i < n);
      traces.forEach(function (t, k) {
        var debut = k / traces.length * .55;
        var q = Math.min(1, Math.max(0, (p - debut) / .45));
        t.style.setProperty('--trace', 1 - q);
      });
    }
    // créations
    if (decalage && creations.classList.contains('epingle')) {
      var rc = creations.getBoundingClientRect();
      var pc = Math.min(1, Math.max(0, -rc.top / decalage));
      piste.style.transform = 'translate3d(' + (-pc * decalage) + 'px,0,0)';
    }
    // bandeau
    if (bandeau && !calme) {
      vitesse += ((y - yPrec) * .15 - vitesse) * .1;
      yPrec = y;
      posBandeau -= .6 + Math.abs(vitesse);
      var moitie = bandeau.scrollWidth / 2;
      if (-posBandeau > moitie) posBandeau += moitie;
      bandeau.style.transform = 'translate3d(' + posBandeau + 'px,0,0)';
    }
    requestAnimationFrame(image);
  }
  mesurerCreations();
  window.addEventListener('resize', mesurerCreations);
  window.addEventListener('load', mesurerCreations);
  requestAnimationFrame(image);

  /* ---------- cartes qui s'inclinent ---------- */
  if (finPointeur && !calme) {
    document.querySelectorAll('[data-incliner]').forEach(function (c) {
      var img = c.querySelector('.carte-image');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', ((nx - .5) * 10) + 'deg');
        c.style.setProperty('--rx', ((.5 - ny) * 8) + 'deg');
        if (img) { img.style.setProperty('--lx', (nx * 100) + '%'); img.style.setProperty('--ly', (ny * 100) + '%'); }
      });
      c.addEventListener('pointerleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- volets de la boutique et visionneuse ---------- */
  var volets = document.querySelectorAll('.volet');
  function ouvrirVolet(v) { volets.forEach(function (x) { x.classList.toggle('est-ouvert', x === v); }); }
  function visionner(img) {
    var fond = document.createElement('div');
    fond.className = 'visionneuse';
    fond.setAttribute('role', 'dialog');
    fond.setAttribute('aria-modal', 'true');
    fond.setAttribute('aria-label', img.alt);
    var grande = new Image();
    grande.src = img.currentSrc || img.src;
    grande.srcset = img.srcset; grande.sizes = '90vw'; grande.alt = img.alt;
    var fermer = document.createElement('button');
    fermer.type = 'button'; fermer.setAttribute('aria-label', 'Fermer'); fermer.innerHTML = '&times;';
    fond.appendChild(grande); fond.appendChild(fermer);
    document.body.appendChild(fond);
    document.body.style.overflow = 'hidden';
    fermer.focus();
    function clore() { fond.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', touche); img.closest('.volet').focus(); }
    function touche(e) { if (e.key === 'Escape') clore(); }
    fond.addEventListener('click', function (e) { if (e.target !== grande) clore(); });
    document.addEventListener('keydown', touche);
  }
  volets.forEach(function (v) {
    if (finPointeur) v.addEventListener('pointerenter', function () { ouvrirVolet(v); });
    v.addEventListener('focus', function () { ouvrirVolet(v); });
    v.addEventListener('click', function () {
      if (!v.classList.contains('est-ouvert')) { ouvrirVolet(v); return; }
      visionner(v.querySelector('img'));
    });
    v.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); visionner(v.querySelector('img')); } });
  });

  /* ---------- révélations au défilement ---------- */
  var aReveler = document.querySelectorAll('.titre, .carte-image, .valeurs li, .boutique-intro, .volets, .scene, .choix, .demande, .coordonnees, .composer-tete p, .saisons-tete p');
  if ('IntersectionObserver' in window && !calme) {
    var ioRev = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vu'); ioRev.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    aReveler.forEach(function (el, i) {
            el.setAttribute('data-revele', '');
      ioRev.observe(el);
    });
  }

  /* ---------- coordonnées ---------- */
  var B = BOUTIQUE;
  function montrer(champ, ok) { var el = document.querySelector('[data-champ="' + champ + '"]'); if (el) el.hidden = !ok; }
  document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = 'tel:' + B.tel; });
  document.querySelectorAll('[data-tel-texte]').forEach(function (s) { s.textContent = B.telAffiche || B.tel; });
  document.querySelectorAll('[data-email]').forEach(function (a) { a.href = 'mailto:' + B.email; });
  document.querySelectorAll('[data-email-texte]').forEach(function (s) { s.textContent = B.email; });
  document.querySelectorAll('[data-adresse]').forEach(function (s) { s.textContent = B.adresse; });
  document.querySelectorAll('[data-carte]').forEach(function (a) { a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Les Fleurs de Florencia, ' + B.adresse); });
  var reseaux = document.querySelector('[data-reseaux]');
  if (B.instagram) reseaux.insertAdjacentHTML('beforeend', '<a href="' + B.instagram + '" target="_blank" rel="noopener">Instagram</a>');
  if (B.facebook) reseaux.insertAdjacentHTML('beforeend', '<a href="' + B.facebook + '" target="_blank" rel="noopener">Facebook</a>');
  var aHoraires = Object.keys(B.horaires).length > 0;
  montrer('adresse', !!B.adresse); montrer('tel', !!B.tel); montrer('email', !!B.email);
  montrer('horaires', aHoraires); montrer('reseaux', !!(B.instagram || B.facebook));
  document.querySelector('[data-vide]').hidden = !!(B.adresse || B.tel || B.email);

  var annee = document.querySelector('[data-annee]');
  if (annee) annee.textContent = new Date().getFullYear();

  // horaires et statut ouvert / fermé, à l'heure de Paris
  function hfr(h) { var m = Math.round((h % 1) * 60); return Math.floor(h) + ' h' + (m ? (m < 10 ? ' 0' : ' ') + m : ''); }
  if (aHoraires) {
    var f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
    var o = {};
    f.formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    var j = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'].indexOf(o.weekday), h = +o.hour + o.minute / 60;
    var noms = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    var liste = document.querySelector('[data-horaires]');
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var cr = B.horaires[d] || [];
      var li = document.createElement('li');
      if (d === j) li.className = 'aujourdhui';
      li.innerHTML = '<span>' + noms[d] + '</span><span>' + (cr.length ? cr.map(function (c) { return hfr(c[0]) + ' – ' + hfr(c[1]); }).join(', ') : 'Fermé') + '</span>';
      liste.appendChild(li);
    });
    var statut = document.querySelector('[data-statut]');
    var cr = B.horaires[j] || [];
    var ouvert = cr.filter(function (c) { return h >= c[0] && h < c[1]; })[0];
    if (ouvert) { statut.classList.add('ouvert'); statut.textContent = 'Ouvert jusqu\'à ' + hfr(ouvert[1]); }
    else {
      var ensuite = cr.filter(function (c) { return c[0] > h; })[0];
      statut.textContent = ensuite ? 'Fermé · ouvre à ' + hfr(ensuite[0]) : 'Fermé pour aujourd\'hui';
    }
  }

  /* ---------- demande de commande ---------- */
  var message = document.getElementById('message');
  var date = document.getElementById('date');
  var budget = document.getElementById('budget');
  var retour = document.querySelector('.demande-retour');
  var envoiEmail = document.querySelector('[data-envoi="email"]');
  var envoiSms = document.querySelector('[data-envoi="sms"]');
  var appel = document.querySelector('[data-envoi="appel"]');
  if (date) date.min = new Date().toISOString().slice(0, 10);

  function texteDemande() {
    var t = message.value.trim();
    if (date.value) {
      var d = new Date(date.value + 'T12:00:00');
      t += '\n\nPour le ' + d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '.';
    }
    if (budget.value) t += '\nBudget : ' + budget.value.toLowerCase() + '.';
    return t.trim();
  }
  function majLiens() {
    var t = texteDemande();
    if (B.email) envoiEmail.href = 'mailto:' + B.email + '?subject=' + encodeURIComponent('Demande de bouquet') + '&body=' + encodeURIComponent(t);
    if (B.tel && B.mobile) envoiSms.href = 'sms:' + B.tel + '?&body=' + encodeURIComponent(t);
    if (B.tel) appel.href = 'tel:' + B.tel;
  }
  envoiEmail.hidden = !B.email;
  envoiSms.hidden = !(B.tel && B.mobile);
  appel.hidden = !B.tel;
  [message, date, budget].forEach(function (el) { el.addEventListener('input', majLiens); el.addEventListener('change', majLiens); });
  majLiens();

  document.querySelector('[data-copier]').addEventListener('click', function () {
    var t = texteDemande();
    if (!t) { retour.textContent = 'Écrivez d\'abord quelques mots sur votre envie.'; message.focus(); return; }
    function ok() { retour.textContent = 'Demande copiée. Il ne reste plus qu\'à nous la transmettre.'; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { message.select(); retour.textContent = 'Sélectionnez le texte puis copiez-le.'; });
    else { message.select(); try { document.execCommand('copy'); ok(); } catch (e) {} }
  });

  // le composeur de bouquet remplit la demande
  window.FLORENCIA = {
    remplir: function (t) {
      message.value = t;
      majLiens();
      retour.textContent = 'Votre bouquet est dans la demande : complétez-la si vous le souhaitez.';
    }
  };
})();

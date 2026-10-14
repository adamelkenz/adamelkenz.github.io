/* Allô P'tites Pattes — infos pratiques et petites interactions communes.
   Téléphone et horaires du salon : ici (et dans le JSON-LD de index.html). */
var SALON = {
  tel: '+33470416965',
  telAffiche: '04 70 41 69 65',
  // horaires : [jour 0=dimanche … 6=samedi] = [[début, fin], …] en heures décimales
  horaires: {
    0: [],
    1: [[9, 12], [14, 18]],
    2: [[9, 12], [14, 18]],
    3: [[9, 12], [14, 18]],
    4: [[9, 12], [14, 18]],
    5: [[9, 12], [14, 18]],
    6: []
  }
};

(function () {
  var S = SALON;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var aIO = 'IntersectionObserver' in window;
  if (!aIO) document.documentElement.classList.add('no-io');

  // téléphone
  document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = 'tel:' + S.tel; });
  document.querySelectorAll('[data-tel-texte]').forEach(function (s) { s.textContent = S.telAffiche; });
  var annee = document.querySelector('[data-annee]');
  if (annee) annee.textContent = new Date().getFullYear();

  /* ---------- ouvert / fermé, à l'heure de Paris quel que soit le fuseau du visiteur ---------- */
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
  function majStatut() {
    var n = maintenant();
    if (n.j < 0) return;
    var noms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var cr = S.horaires[n.j] || [], txt, cls;
    var ouvert = cr.filter(function (c) { return n.h >= c[0] && n.h < c[1]; })[0];
    var plusTard = cr.filter(function (c) { return c[0] > n.h; })[0];
    if (ouvert) { cls = 'ouvert'; txt = 'Ouvert · jusqu’à ' + hfr(ouvert[1]) + ', appelez Chloé'; }
    else if (plusTard && cr[0][0] < n.h) { cls = 'pause'; txt = 'Pause de midi · réouverture à ' + hfr(plusTard[0]); }
    else if (plusTard) { cls = 'ferme'; txt = 'Fermé · ouvre aujourd’hui à ' + hfr(plusTard[0]); }
    else {
      cls = 'ferme';
      for (var k = 1; k <= 7; k++) {
        var j = (n.j + k) % 7, c = S.horaires[j] || [];
        if (c.length) { txt = 'Fermé · réouverture ' + (k === 1 ? 'demain' : noms[j]) + ' à ' + hfr(c[0][0]); break; }
      }
    }
    document.querySelectorAll('[data-statut]').forEach(function (el) {
      el.classList.remove('ouvert', 'ferme', 'pause');
      if (txt) { el.classList.add(cls); el.innerHTML = '<i></i>' + txt; }
    });
    document.querySelectorAll('.horaires tr').forEach(function (tr) { tr.classList.toggle('auj', +tr.getAttribute('data-j') === n.j); });
  }
  majStatut();
  setInterval(majStatut, 60000);

  /* ---------- en-tête : fond au défilement, barre de progression, rubrique active ---------- */
  var entete = document.querySelector('.entete');
  var barreProg = document.querySelector('.progression');
  var liens = [].slice.call(document.querySelectorAll('.nav a'));
  var tictac = false;
  function auDefilement() {
    tictac = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (entete) entete.classList.toggle('defile', y > 40);
    if (barreProg) barreProg.style.setProperty('--p', h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
  }
  window.addEventListener('scroll', function () { if (!tictac) { tictac = true; requestAnimationFrame(auDefilement); } }, { passive: true });
  auDefilement();
  if (aIO && liens.length) {
    var parId = {};
    liens.forEach(function (a) { parId[a.getAttribute('href').slice(1)] = a; });
    // toutes les sections sont suivies : celles qui ne sont pas dans le menu n'y allument rien
    var ioNav = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var a = parId[e.target.id];
        liens.forEach(function (l) { l.classList.toggle('actif', l === a); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach(function (s) { ioNav.observe(s); });
  }

  /* ---------- menu téléphone ---------- */
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

  /* ---------- apparition douce des blocs ---------- */
  var blocs = document.querySelectorAll('.monte, .plan');
  if (aIO && !calme) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocs.forEach(function (b) { io.observe(b); });
  } else blocs.forEach(function (b) { b.classList.add('vu'); });

  /* ---------- barre d'appel du bas (téléphone) : visible une fois l'accueil dépassé ---------- */
  var barre = document.querySelector('.barre-mobile'), accueil = document.querySelector('.hero');
  if (barre && accueil && aIO) {
    new IntersectionObserver(function (es) { barre.classList.toggle('visible', !es[0].isIntersecting); },
      { rootMargin: '-40% 0px 0px 0px' }).observe(accueil);
  } else if (barre) barre.classList.add('visible');

  /* ---------- les animations décoratives ne tournent que lorsque leur zone est à l'écran ---------- */
  if (aIO && !calme) {
    var veille = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('en-pause', !e.isIntersecting); });
    }, { rootMargin: '80px 0px' });
    document.querySelectorAll('.hero, .ruban, .soins-bloc, .jeu, .pied').forEach(function (el) { veille.observe(el); });
  }

  /* ---------- compteurs ---------- */
  var compteurs = document.querySelectorAll('[data-compte]');
  function compte(el) {
    var fin = +el.getAttribute('data-compte'), virgule = el.hasAttribute('data-virgule');
    var t0 = performance.now(), duree = 1300;
    (function pas(t) {
      var k = Math.min(1, (t - t0) / duree), v = fin * (1 - Math.pow(1 - k, 3));
      el.textContent = virgule ? v.toFixed(1).replace('.', ',') : Math.round(v);
      if (k < 1) requestAnimationFrame(pas);
    })(t0);
  }
  if (aIO && !calme) {
    var ioC = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { compte(e.target); ioC.unobserve(e.target); } });
    }, { threshold: .6 });
    compteurs.forEach(function (c) { c.textContent = c.hasAttribute('data-virgule') ? '0,0' : '0'; ioC.observe(c); });
  }

  /* ---------- le ruban des soins : défile, et file plus vite quand on fait défiler la page ---------- */
  var ruban = document.querySelector('[data-ruban]');
  if (ruban && !calme && ruban.animate) {
    [].slice.call(ruban.children).forEach(function (n) { ruban.appendChild(n.cloneNode(true)); });
    var anim = ruban.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 42000, iterations: Infinity });
    var vitesse = 1, cible = 1, dernierY = window.scrollY, rubanVu = true, boucleActive = false;
    window.addEventListener('scroll', function () {
      var dy = window.scrollY - dernierY; dernierY = window.scrollY;
      if (!rubanVu) return;
      cible = Math.max(-6, Math.min(8, 1 + dy * .35));
      lance();
    }, { passive: true });
    var boucle = function () {
      cible += (1 - cible) * .04;
      vitesse += (cible - vitesse) * .12;
      anim.playbackRate = vitesse;
      if (Math.abs(vitesse - 1) < .01 && Math.abs(cible - 1) < .01) { anim.playbackRate = 1; boucleActive = false; return; }
      requestAnimationFrame(boucle);
    };
    var lance = function () { if (!boucleActive) { boucleActive = true; requestAnimationFrame(boucle); } };
    if (aIO) new IntersectionObserver(function (es) {
      rubanVu = es[0].isIntersecting;
      if (rubanVu) anim.play(); else anim.pause();
    }).observe(ruban.parentNode);
  }

  /* ---------- la coupure de presse ---------- */
  var presse = document.getElementById('presse'), btnPresse = document.querySelector('[data-presse]');
  if (presse && btnPresse && presse.showModal) {
    btnPresse.addEventListener('click', function () { presse.showModal(); });
    presse.addEventListener('click', function (e) { if (e.target === presse || e.target.closest('[data-fermer]')) presse.close(); });
  } else if (btnPresse) {
    btnPresse.addEventListener('click', function () { window.open('img/article-571.webp', '_blank'); });
  }

  /* ---------- le carrousel des avis ---------- */
  var car = document.querySelector('[data-carrousel]');
  if (car) {
    var piste = car.querySelector('[data-piste]'), avis = [].slice.call(piste.children);
    var points = car.querySelector('[data-points]'), idx = 0, minuteur = null, survol = false, visible = false;
    avis.forEach(function (a, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Avis ' + (i + 1) + ' sur ' + avis.length);
      b.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><use href="#patte"/></svg>';
      b.addEventListener('click', function () { va(i, true); });
      points.appendChild(b);
    });
    var boutonsPts = [].slice.call(points.children);
    function va(i, parUtilisateur) {
      idx = (i + avis.length) % avis.length;
      piste.style.transform = 'translateX(' + (-idx * 100) + '%)';
      avis.forEach(function (a, k) { a.setAttribute('aria-hidden', String(k !== idx)); a.inert = k !== idx; });
      boutonsPts.forEach(function (b, k) { b.setAttribute('aria-current', String(k === idx)); });
      if (parUtilisateur) relance();
    }
    function relance() {
      clearInterval(minuteur);
      if (!calme && visible && !survol) minuteur = setInterval(function () { va(idx + 1); }, 7000);
    }
    car.querySelector('[data-prec]').addEventListener('click', function () { va(idx - 1, true); });
    car.querySelector('[data-suiv]').addEventListener('click', function () { va(idx + 1, true); });
    car.addEventListener('pointerenter', function () { survol = true; relance(); });
    car.addEventListener('pointerleave', function () { survol = false; relance(); });
    car.addEventListener('focusin', function () { survol = true; relance(); });
    car.addEventListener('focusout', function () { survol = false; relance(); });
    // glisser du doigt
    var x0 = null;
    piste.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    piste.addEventListener('pointerup', function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) va(idx + (dx < 0 ? 1 : -1), true);
    });
    piste.addEventListener('pointercancel', function () { x0 = null; });
    if (aIO) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; relance(); }).observe(car);
    else { visible = true; }
    va(0);
    relance();
  }

  /* ---------- des traces de pattes qui traversent le pied de page ---------- */
  var traces = document.querySelector('.traces');
  if (traces && !calme) {
    for (var i = 0; i < 12; i++) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      p.setAttribute('viewBox', '0 0 32 32');
      p.innerHTML = '<use href="#patte"/>';
      var x = 4 + i * 8, y = 78 - i * 5.6 + (i % 2 ? -5 : 5);
      p.style.left = x + '%';
      p.style.top = y + '%';
      p.style.transform = 'rotate(' + (62 + (i % 2 ? -10 : 10)) + 'deg)';
      p.style.animationDelay = (i * .32) + 's';
      traces.appendChild(p);
    }
  }
})();

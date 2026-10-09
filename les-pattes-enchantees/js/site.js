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

  /* ---------- la métamorphose : la baguette efface le pelage ébouriffé ---------- */
  var scene = document.querySelector('[data-scene]');
  if (!scene) return;
  var svg = scene.querySelector('svg.chien'), traces = svg.querySelector('[data-traces]');
  var astuce = scene.querySelector('[data-astuce]'), tadaa = scene.querySelector('[data-tadaa]');
  var jauge = document.querySelector('[data-jauge]'), jaugeTxt = document.querySelector('[data-jauge-texte]');
  var etats = [].slice.call(document.querySelectorAll('[data-etats] li'));
  var btnSort = document.querySelector('[data-sort]'), btnEncore = document.querySelector('[data-encore]');
  var NS = 'http://www.w3.org/2000/svg', RAYON = 30, PAS = 12, SEUIL = .6;
  tadaa.setAttribute('role', 'status');

  // la grille des zones de pelage à brosser (centres de cases qui tombent dans le chien ébouriffé)
  var formes = [].slice.call(svg.querySelectorAll('.hirsute > path')).filter(function (p) {
    var f = p.getAttribute('fill'); return f && f !== 'none';
  });
  var cases = [];
  for (var y = 60; y < 430; y += PAS) {
    for (var x = 70; x < 380; x += PAS) {
      var dedans = formes.some(function (p) {
        try { return p.isPointInFill(new DOMPoint(x, y)); }
        catch (e) { var pt = svg.createSVGPoint(); pt.x = x; pt.y = y; return p.isPointInFill(pt); }
      });
      if (dedans) cases.push({ x: x, y: y, ok: false });
    }
  }
  var brossees = 0, fini = false, dernier = null, auto = null;

  function versSvg(cx, cy) {
    var pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function versEcran(x, y) {
    var pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
    return pt.matrixTransform(svg.getScreenCTM());
  }

  function maj() {
    var p = cases.length ? brossees / cases.length : 1;
    var pct = Math.min(100, Math.round(p / SEUIL * 100));
    if (fini) pct = 100;
    jauge.style.setProperty('--v', pct / 100);
    jauge.setAttribute('aria-valuenow', pct);
    jaugeTxt.textContent = pct;
    etats.forEach(function (li) { li.classList.toggle('fait', pct >= +li.getAttribute('data-seuil')); });
    if (!fini && p >= SEUIL) termine();
  }

  function brosse(x, y) {
    if (fini) return;
    if (dernier && Math.hypot(x - dernier.x, y - dernier.y) < 9) return;
    dernier = { x: x, y: y };
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', RAYON);
    traces.appendChild(c);
    for (var i = 0; i < cases.length; i++) {
      var k = cases[i];
      if (!k.ok && (k.x - x) * (k.x - x) + (k.y - y) * (k.y - y) <= RAYON * RAYON) { k.ok = true; brossees++; }
    }
    if (astuce) astuce.classList.add('cache');
    maj();
  }

  function termine() {
    fini = true;
    if (auto) { cancelAnimationFrame(auto); auto = null; }
    svg.classList.add('fini');
    astuce.classList.add('cache');
    tadaa.hidden = false;
    var avaitFocus = document.activeElement === btnSort;
    btnSort.hidden = true; btnEncore.hidden = false;
    if (avaitFocus) btnEncore.focus();
    maj();
    if (window.Magie) {
      [[200, 170], [200, 300], [120, 200], [290, 200], [200, 400]].forEach(function (p, i) {
        setTimeout(function () { var e = versEcran(p[0], p[1]); window.Magie.eclat(e.x, e.y, 18); }, i * 90);
      });
    }
  }

  function recommence() {
    fini = false; brossees = 0; dernier = null;
    cases.forEach(function (k) { k.ok = false; });
    while (traces.firstChild) traces.removeChild(traces.firstChild);
    svg.classList.remove('fini');
    tadaa.hidden = true; astuce.classList.remove('cache');
    btnSort.hidden = false; btnEncore.hidden = true;
    maj();
    btnSort.focus();
  }

  // à la souris on brosse en survolant ; au doigt ou au stylet, en glissant
  var appuye = false;
  svg.addEventListener('pointerdown', function (e) {
    appuye = true;
    if (svg.setPointerCapture) svg.setPointerCapture(e.pointerId);
    var p = versSvg(e.clientX, e.clientY); brosse(p.x, p.y);
  });
  svg.addEventListener('pointermove', function (e) {
    if (fini || (e.pointerType !== 'mouse' && !appuye)) return;
    var p = versSvg(e.clientX, e.clientY);
    brosse(p.x, p.y);
    if (window.Magie && e.pointerType !== 'mouse') window.Magie.trainee(e.clientX, e.clientY);
    if (window.Magie && Math.random() < .5) window.Magie.trainee(e.clientX, e.clientY);
  });
  ['pointerup', 'pointercancel'].forEach(function (t) { svg.addEventListener(t, function () { appuye = false; dernier = null; }); });
  svg.addEventListener('pointerleave', function () { dernier = null; });

  // le bouton : la baguette fait le tour du chien toute seule
  btnSort.addEventListener('click', function () {
    if (fini || auto) return;
    if (calme) { termine(); return; }
    var points = [], ligneY = 0;
    for (var yy = 80; yy <= 420; yy += 40, ligneY++) {
      for (var s = 0; s <= 10; s++) {
        var xx = 80 + (ligneY % 2 ? 10 - s : s) * 28;
        points.push([xx, yy]);
      }
    }
    var i = 0;
    var pas = function () {
      for (var r = 0; r < 3 && i < points.length; r++, i++) {
        brosse(points[i][0], points[i][1]);
        if (window.Magie && i % 2) { var e = versEcran(points[i][0], points[i][1]); window.Magie.trainee(e.x, e.y); }
      }
      if (!fini && i < points.length) auto = requestAnimationFrame(pas);
      else { auto = null; if (!fini) termine(); }
    };
    dernier = null;
    auto = requestAnimationFrame(pas);
  });
  btnEncore.addEventListener('click', recommence);
  maj();

  // la mouche tourne autour de la tête tant qu'il n'est pas toiletté
  var mouche = svg.querySelector('[data-mouche]'), voit = true;
  if (mouche) {
    mouche.setAttribute('transform', 'translate(290 110)');
    if (!calme) {
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { voit = es[0].isIntersecting; }).observe(svg);
      var vole = function (t) {
        if (voit && !fini) {
          var s = t / 1000;
          var x = 200 + Math.sin(s * 1.3) * 120 + Math.sin(s * 3.1) * 14;
          var y = 120 + Math.sin(s * 2.1) * 40 + Math.cos(s * 4.3) * 10;
          mouche.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (Math.cos(s * 1.3) > 0 ? 0 : 180) + ') scale(1 ' + (Math.cos(s * 1.3) > 0 ? 1 : -1) + ')');
        }
        requestAnimationFrame(vole);
      };
      requestAnimationFrame(vole);
    }
  }
})();

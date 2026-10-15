/* Barbechiens · galerie : filtres par gabarit ou par scène, affichage par paquets,
   visionneuse plein écran (clavier, glisser du doigt). */
(function () {
  'use strict';
  var galerie = document.querySelector('[data-galerie]');
  if (!galerie) return;
  var items = Array.prototype.slice.call(galerie.children);
  var filtres = document.querySelectorAll('[data-filtre]');
  var plus = document.querySelector('[data-galerie-plus]');
  var compte = document.querySelector('[data-galerie-compte]');
  var PAQUET = window.matchMedia('(max-width: 560px)').matches ? 16 : 24;
  var filtre = 'tous', montres = PAQUET, liste = [];

  // compteurs sur les filtres
  var n = { tous: items.length };
  items.forEach(function (li) { n[li.dataset.cat] = (n[li.dataset.cat] || 0) + 1; });
  document.querySelectorAll('[data-n]').forEach(function (el) { el.textContent = n[el.dataset.n] || 0; });

  function afficher(anime, depuis) {
    liste = items.filter(function (li) { return filtre === 'tous' || li.dataset.cat === filtre; });
    items.forEach(function (li) { li.classList.add('cache'); li.classList.remove('entre'); });
    liste.forEach(function (li, i) {
      if (i < montres) {
        li.classList.remove('cache');
        if (anime && i >= depuis) { li.style.setProperty('--e', ((i - depuis) % PAQUET) * .03 + 's'); li.classList.add('entre'); }
      }
    });
    var vus = Math.min(montres, liste.length);
    compte.textContent = vus + ' photo' + (vus > 1 ? 's' : '') + ' sur ' + liste.length;
    plus.hidden = vus >= liste.length;
  }
  filtres.forEach(function (b) {
    b.addEventListener('click', function () {
      filtres.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      filtre = b.dataset.filtre;
      montres = PAQUET;
      afficher(true, 0);
    });
  });
  plus.addEventListener('click', function () {
    var avant = montres;
    montres += PAQUET;
    afficher(true, avant);
    var premier = liste[avant];
    if (premier) { var bt = premier.querySelector('button'); if (bt) bt.focus({ preventScroll: true }); }
  });
  afficher(false, 0);

  /* ---------- Visionneuse ---------- */
  var dlg = document.querySelector('[data-visionneuse]');
  var vImg = dlg.querySelector('[data-v-img]');
  var vLeg = dlg.querySelector('[data-v-legende]');
  var vPos = dlg.querySelector('[data-v-pos]');
  var courant = 0;
  function montrer(i) {
    var vis = liste;
    courant = (i + vis.length) % vis.length;
    var b = vis[courant].querySelector('button');
    var petite = b.querySelector('img');
    vImg.src = petite.currentSrc || petite.src;
    vImg.alt = petite.alt;
    var grand = new Image();
    grand.onload = function () { if (vis[courant] && vis[courant].querySelector('button') === b) vImg.src = grand.src; };
    grand.src = b.dataset.grand;
    vLeg.textContent = b.dataset.legende;
    vPos.textContent = b.dataset.catNom + ' · ' + (courant + 1) + ' / ' + vis.length;
    [1, -1].forEach(function (d) { var v = vis[(courant + d + vis.length) % vis.length]; if (v) new Image().src = v.querySelector('button').dataset.grand; });
  }
  galerie.addEventListener('click', function (e) {
    var b = e.target.closest('.vignette');
    if (!b) return;
    var i = liste.indexOf(b.parentElement);
    if (i < 0) return;
    montrer(i);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  });
  function fermer() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  dlg.addEventListener('close', function () {
    document.body.style.overflow = '';
    var li = liste[courant];
    if (li) li.querySelector('button').focus({ preventScroll: true });
  });
  dlg.querySelector('[data-fermer]').addEventListener('click', fermer);
  dlg.querySelector('[data-v-prec]').addEventListener('click', function () { montrer(courant - 1); });
  dlg.querySelector('[data-v-suiv]').addEventListener('click', function () { montrer(courant + 1); });
  var glisse = false;
  dlg.addEventListener('click', function (e) { if (glisse) { glisse = false; return; } if (e.target === dlg || e.target.tagName === 'FIGURE') fermer(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); montrer(courant - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); montrer(courant + 1); }
  });
  var x0 = null;
  dlg.addEventListener('pointerdown', function (e) { x0 = e.clientX; glisse = false; });
  dlg.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) { glisse = true; montrer(courant + (dx < 0 ? 1 : -1)); }
  });
})();

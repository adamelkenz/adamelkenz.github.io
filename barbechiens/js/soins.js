/* Barbechiens · le menu des soins : un soin ouvert à la fois,
   sa photo arrive sous une vague de mousse. */
(function () {
  'use strict';
  var liste = document.querySelector('[data-soins]');
  var scene = document.querySelector('[data-soins-scene]');
  if (!liste || !scene || !window.Mousse) return;
  var img = scene.querySelector('[data-soins-img]');
  var etiquette = scene.querySelector('[data-soins-etiquette]');
  var mousse = new window.Mousse(scene.querySelector('[data-mousse]'));
  var boutons = Array.prototype.slice.call(liste.querySelectorAll('.soin'));
  var attente = null;

  function choisir(btn) {
    boutons.forEach(function (b) { b.setAttribute('aria-expanded', String(b === btn)); });
    var nom = btn.querySelector('.soin-nom').textContent;
    var src = btn.dataset.photo;
    if (img.getAttribute('src') === src) return;
    if (mousse.occupe) { attente = btn; return; }
    mousse.changer(img, src, btn.dataset.alt, { x: .5, y: 1 }).then(function () {
      if (attente) { var b = attente; attente = null; if (b.dataset.photo !== img.getAttribute('src')) choisir(b); }
    });
    setTimeout(function () { etiquette.textContent = nom; }, window.BC && window.BC.reduit ? 0 : 620);
  }
  boutons.forEach(function (b) {
    b.addEventListener('click', function () { choisir(b); });
  });
  // précharge les photos des soins quand la section approche
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return;
      boutons.forEach(function (b) { new Image().src = b.dataset.photo; });
      io.disconnect();
    }, { rootMargin: '400px 0px' });
    io.observe(liste);
  }
})();

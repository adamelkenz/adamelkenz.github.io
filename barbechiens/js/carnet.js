/* Barbechiens · le carnet du salon : défilement horizontal à la souris,
   boutons précédent / suivant et barre d’avancement. */
(function () {
  'use strict';
  var carnet = document.querySelector('[data-carnet]');
  if (!carnet) return;
  var barre = document.querySelector('[data-carnet-barre]');
  var prec = document.querySelector('[data-carnet-prec]');
  var suiv = document.querySelector('[data-carnet-suiv]');

  function maj() {
    var max = carnet.scrollWidth - carnet.clientWidth;
    var vu = carnet.clientWidth / carnet.scrollWidth;
    var p = max > 0 ? carnet.scrollLeft / max : 1;
    barre.style.setProperty('--c', Math.min(1, vu + (1 - vu) * p).toFixed(3));
    prec.disabled = carnet.scrollLeft < 4;
    suiv.disabled = carnet.scrollLeft > max - 4;
  }
  function pas() {
    var page = carnet.querySelector('.page');
    return page ? page.getBoundingClientRect().width + 24 : 300;
  }
  prec.addEventListener('click', function () { carnet.scrollBy({ left: -pas(), behavior: 'smooth' }); });
  suiv.addEventListener('click', function () { carnet.scrollBy({ left: pas(), behavior: 'smooth' }); });
  carnet.addEventListener('scroll', function () { requestAnimationFrame(maj); }, { passive: true });
  window.addEventListener('resize', maj);
  maj();

  // glisser à la souris (le doigt défile déjà nativement)
  var x0 = 0, s0 = 0, tire = false, bouge = false;
  carnet.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    tire = true; bouge = false; x0 = e.clientX; s0 = carnet.scrollLeft;
  });
  window.addEventListener('pointermove', function (e) {
    if (!tire) return;
    var dx = e.clientX - x0;
    if (Math.abs(dx) > 4) { bouge = true; carnet.classList.add('tire'); }
    if (bouge) carnet.scrollLeft = s0 - dx;
  });
  window.addEventListener('pointerup', function () {
    if (!tire) return;
    tire = false;
    carnet.classList.remove('tire');
  });
  carnet.addEventListener('click', function (e) { if (bouge) { e.preventDefault(); e.stopPropagation(); bouge = false; } }, true);
  carnet.addEventListener('dragstart', function (e) { e.preventDefault(); });
})();

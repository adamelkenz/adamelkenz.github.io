/* Poteau de barbier : se remplit avec la progression de la page,
   et ses bandes montent quand on descend. Un clic ramène en haut. */
(function () {
  var p = document.createElement('button');
  p.className = 'poteau';
  p.type = 'button';
  p.setAttribute('aria-label', 'Remonter en haut de la page');
  p.innerHTML = '<span class="boule"></span><span class="cap"></span>' +
    '<span class="verre"><span class="bandes"></span></span>' +
    '<span class="cap"></span><span class="boule"></span><span class="info">0 %</span>';
  document.body.appendChild(p);

  var bandes = p.querySelector('.bandes');
  var info = p.querySelector('.info');
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prevu = false;

  function maj() {
    prevu = false;
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var y = window.scrollY || doc.scrollTop;
    var t = Math.min(1, Math.max(0, y / max));
    bandes.style.height = (6 + t * 94).toFixed(2) + '%';
    if (!calme.matches) bandes.style.backgroundPosition = '0 ' + (-y * 0.45).toFixed(1) + 'px';
    info.textContent = Math.round(t * 100) + ' %';
    p.classList.toggle('plein', t > 0.985);
  }
  function demande() { if (!prevu) { prevu = true; requestAnimationFrame(maj); } }

  window.addEventListener('scroll', demande, { passive: true });
  window.addEventListener('resize', demande);
  p.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: calme.matches ? 'auto' : 'smooth' });
  });
  maj();
})();

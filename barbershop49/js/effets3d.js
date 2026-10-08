/* Barbershop49 — effets 3D et interactions par section.
   Les inclinaisons passent par la propriété CSS `rotate`, qui se combine
   avec les `transform` d'apparition sans les écraser. */
(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var souris = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function rejoue(el, cls) { // relance une animation CSS même si elle vient de jouer
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  function active(el, fn) { // clic, Entrée et Espace
    el.addEventListener('click', fn);
    el.addEventListener('keydown', function (e) {
      if (el.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fn(); }
    });
  }
  function premiereFois(el, fn) { // quand l'élément entre à l'écran pour la première fois
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: .5 });
    io.observe(el);
  }

  // ---------- tarifs : les lignes se retournent une à une ----------
  document.querySelectorAll('.letterboard li').forEach(function (li, i) { li.style.setProperty('--i', i); });

  // ---------- lexique : cartes à retourner ----------
  var mots = document.querySelectorAll('.mot');
  mots.forEach(function (m) {
    var dt = m.querySelector('dt'), dd = m.querySelector('dd');
    if (!dt || !dd) return;
    dd.setAttribute('data-terme', dt.firstChild.textContent.trim());
    var ind = document.createElement('span');
    ind.className = 'indice';
    ind.setAttribute('aria-hidden', 'true');
    ind.textContent = '↻ Voir la définition';
    m.appendChild(ind);
    m.setAttribute('role', 'button');
    m.setAttribute('aria-pressed', 'false');
    m.setAttribute('aria-label', dt.firstChild.textContent.trim() + ' : ' + dd.textContent.trim());
    active(m, function () { m.setAttribute('aria-pressed', String(m.classList.toggle('retourne'))); });
  });
  if (mots[0] && !calme) premiereFois(mots[0], function () { // petite démonstration
    setTimeout(function () { mots[0].classList.add('retourne'); }, 500);
    setTimeout(function () { mots[0].classList.remove('retourne'); }, 2100);
  });

  // ---------- infos : pancarte suspendue ----------
  var pancarte = document.querySelector('.pancarte');
  if (pancarte) {
    var balancier = pancarte.querySelector('.balancier');
    active(pancarte, function () { pancarte.classList.toggle('retournee'); rejoue(balancier, 'secoue'); });
    if (souris) pancarte.addEventListener('pointerenter', function () { rejoue(balancier, 'secoue'); });
    premiereFois(pancarte, function () { rejoue(balancier, 'secoue'); });
  }

  if (calme) return;

  // ---------- inclinaison 3D (souris) ou au défilement (téléphone) ----------
  var tilts = [].slice.call(document.querySelectorAll('[data-tilt]'));
  tilts.forEach(function (el) {
    var r = document.createElement('span');
    r.className = 'reflet';
    r.setAttribute('aria-hidden', 'true');
    el.appendChild(r);
  });

  function pose(el, rx, ry, nx, ny) {
    var a = Math.sqrt(rx * rx + ry * ry);
    el.style.rotate = a < .02 ? '' : (rx / a).toFixed(3) + ' ' + (ry / a).toFixed(3) + ' 0 ' + a.toFixed(2) + 'deg';
    el.style.setProperty('--tx', nx.toFixed(3));
    el.style.setProperty('--ty', ny.toFixed(3));
    el.style.setProperty('--gx', (50 + nx * 50).toFixed(1) + '%');
    el.style.setProperty('--gy', (50 + ny * 50).toFixed(1) + '%');
  }

  if (souris) {
    tilts.forEach(function (el) {
      var max = +el.getAttribute('data-tilt') || 8;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        el.classList.add('suit');
        pose(el, -ny * max, nx * max, nx, ny);
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('suit');
        pose(el, 0, 0, 0, 0);
      });
    });
  } else {
    // pas de souris : les cartes basculent doucement selon leur position à l'écran
    var auDoigt = tilts.filter(function (el) { return !el.hasAttribute('data-tilt-souris'); });
    var prevu = false;
    var majDoigt = function () {
      prevu = false;
      var vh = window.innerHeight;
      auDoigt.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        var p = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / (vh / 2)));
        var max = (+el.getAttribute('data-tilt') || 8) * .9;
        pose(el, p * max, 0, 0, p);
      });
    };
    window.addEventListener('scroll', function () { if (!prevu) { prevu = true; requestAnimationFrame(majDoigt); } }, { passive: true });
    majDoigt();
  }

  // ---------- galerie : carrousel 3D sur téléphone ----------
  var galerie = document.querySelector('.galerie');
  if (galerie) {
    var etroit = window.matchMedia('(max-width: 760px)');
    var items = [].slice.call(galerie.children);
    var prevuG = false;
    var majG = function () {
      prevuG = false;
      if (!etroit.matches) {
        items.forEach(function (li) { li.style.rotate = li.style.scale = li.style.filter = li.style.zIndex = ''; });
        return;
      }
      var centre = galerie.scrollLeft + galerie.clientWidth / 2;
      items.forEach(function (li) {
        var d = (li.offsetLeft + li.offsetWidth / 2 - centre) / li.offsetWidth;
        var ad = Math.min(1.4, Math.abs(d));
        li.style.rotate = 'y ' + (Math.max(-1.4, Math.min(1.4, d)) * -38).toFixed(1) + 'deg';
        li.style.scale = (1 - Math.min(1, ad) * .14).toFixed(3);
        li.style.filter = 'brightness(' + (1 - Math.min(1, ad) * .45).toFixed(2) + ')';
        li.style.zIndex = String(10 - Math.round(ad * 4));
      });
    };
    var demandeG = function () { if (!prevuG) { prevuG = true; requestAnimationFrame(majG); } };
    galerie.addEventListener('scroll', demandeG, { passive: true });
    window.addEventListener('resize', demandeG);
    majG();
  }
})();

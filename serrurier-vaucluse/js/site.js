// Effets communs à toutes les pages : apparition au défilement, fonds animés, galerie.
document.getElementById('year').textContent = new Date().getFullYear();

// Prestations, tarifs et « Pourquoi nous » : éléments qui apparaissent en cascade au défilement.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('#services .section-head, #services .card, #tarifs .price, #pourquoi .why, #fonctionnement .step');
  items.forEach((el) => el.classList.add('reveal'));
  document.documentElement.classList.add('reveal-on');
  const io = new IntersectionObserver((entries) => {
    // Décalage relatif aux éléments qui entrent ensemble (une rangée sur ordi, une carte sur mobile).
    entries.filter((en) => en.isIntersecting).forEach((en, j) => {
      en.target.style.setProperty('--d', j * 120 + 'ms');
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
})();

// Fonds animés : petits symboles placés sur une grille avec un décalage aléatoire,
// qui flottent et scintillent (ou tournent pour les engrenages).
const fillSky = (sky, { shapes, cols, rows, size, opacity, spin = [] }) => {
  if (!sky) return '';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const colors = ['var(--cyan)', 'var(--violet)', 'var(--line)', 'var(--halo)'];
  let html = '', i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++, i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const vars = [
        `left:${((c + rnd(.1, .9)) / cols * 100).toFixed(1)}%`, `top:${((r + rnd(.1, .9)) / rows * 100).toFixed(1)}%`,
        `--sz:${rnd(size[0], size[1]).toFixed(0)}px`, `--c:${colors[i % colors.length]}`,
        `--fd:${rnd(7, 15).toFixed(1)}s`, `--fdl:${(-rnd(0, 15)).toFixed(1)}s`,
        `--dx:${rnd(-25, 25).toFixed(0)}px`, `--dy:${rnd(-45, -10).toFixed(0)}px`, `--rot:${rnd(-60, 60).toFixed(0)}deg`,
        `--td:${rnd(spin.includes(shape) ? 6 : 2, spin.includes(shape) ? 12 : 5).toFixed(1)}s`, `--tdl:${(-rnd(0, 5)).toFixed(1)}s`,
        `--o1:${rnd(opacity[0], opacity[1]).toFixed(2)}`, `--o2:${rnd(opacity[2], opacity[3]).toFixed(2)}`,
      ].join(';');
      html += `<span class="sky-star${spin.includes(shape) ? ' spin' : ''}" style="${vars}"><svg><use href="#${shape}"/></svg></span>`;
    }
  }
  return html;
};
const small = window.innerWidth < 720;

// Prestations : clés, cadenas, portes et boucliers.
(() => {
  const sky = document.querySelector('#services .sky');
  if (!sky) return;
  sky.innerHTML = fillSky(sky, {
    shapes: ['i-key', 'i-key', 'i-lock', 'i-unlock', 'i-door', 'i-shield', 'i-cylinder', 'i-shutter', 'i-mailbox', 'i-gear'],
    spin: ['i-gear'],
    cols: small ? 3 : 8, rows: small ? 9 : 6, size: [18, 34], opacity: [.15, .3, .4, .7],
  });
})();

// Tarifs : étincelles, pièces et étoiles filantes.
(() => {
  const sky = document.querySelector('#tarifs .sky');
  if (!sky) return;
  let html = fillSky(sky, {
    shapes: ['i-sparkle', 'i-sparkle', 'i-sparkle', 'i-euro', 'i-key'],
    cols: small ? 3 : 7, rows: small ? 6 : 5, size: [8, 24], opacity: [.1, .3, .45, .9],
  });
  [[-10, 8, 9, 0], [5, 40, 11, -4], [-15, 65, 13, -8]].forEach(([l, t, d, dl]) => {
    html += `<span class="shoot" style="left:${l}%;top:${t}%;--sd:${d}s;--sdl:${dl}s"></span>`;
  });
  sky.innerHTML = html;
})();

// Galerie des réalisations : agrandissement en plein écran (photos et vidéos), flèches et clavier.
(() => {
  const shots = [...document.querySelectorAll('.gallery .shot')];
  if (!shots.length) return;
  const box = document.createElement('dialog');
  box.className = 'lightbox';
  box.setAttribute('aria-label', 'Réalisation agrandie');
  box.innerHTML = `
    <div class="lb-media"></div>
    <p class="lb-cap"></p>
    <button type="button" class="lb-btn lb-close" aria-label="Fermer">×</button>
    <button type="button" class="lb-btn lb-prev" aria-label="Précédente">‹</button>
    <button type="button" class="lb-btn lb-next" aria-label="Suivante">›</button>`;
  document.body.appendChild(box);
  const media = box.querySelector('.lb-media'), cap = box.querySelector('.lb-cap');
  let cur = 0;

  function show(i) {
    cur = (i + shots.length) % shots.length;
    const s = shots[cur], img = s.querySelector('img');
    media.innerHTML = '';
    if (s.dataset.video) {
      const v = document.createElement('video');
      Object.assign(v, { src: s.dataset.video, controls: true, autoplay: true, playsInline: true, poster: s.dataset.full || img.src });
      media.appendChild(v);
    } else {
      const big = new Image();
      big.src = s.dataset.full; big.alt = img.alt;
      media.appendChild(big);
    }
    cap.innerHTML = s.querySelector('figcaption').innerHTML;
  }
  shots.forEach((s, i) => s.querySelector('.shot-open').addEventListener('click', () => { show(i); box.showModal(); }));
  box.querySelector('.lb-close').addEventListener('click', () => box.close());
  box.querySelector('.lb-prev').addEventListener('click', () => show(cur - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(cur + 1));
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  box.addEventListener('close', () => { media.innerHTML = ''; });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
})();

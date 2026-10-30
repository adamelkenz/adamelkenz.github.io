// Effets communs à toutes les pages : chargement différé de la 3D et de la carte, en-tête,
// apparition au défilement, cartes interactives, compteurs, FAQ animée, fonds animés, galerie.
document.getElementById('year').textContent = new Date().getFullYear();

const BASE_JS = new URL('.', document.currentScript.src).href;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const small = window.innerWidth < 720;

const loadScript = (src) => new Promise((ok, ko) => {
  const s = document.createElement('script');
  s.src = src; s.onload = ok; s.onerror = ko;
  document.head.appendChild(s);
});
const loadStyle = (href) => {
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
};
const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 400));

// Scène 3D du hero : three.js n'est téléchargé qu'au premier geste du visiteur (souris, défilement,
// toucher, clavier) ou quelques secondes après l'affichage, pour que la page reste rapide à charger.
(() => {
  const door = document.getElementById('door3d');
  if (!door) return;
  const events = ['pointermove', 'pointerdown', 'scroll', 'touchstart', 'keydown'];
  let started = false, timer;
  const start = () => {
    if (started) return;
    started = true;
    clearTimeout(timer);
    events.forEach((ev) => window.removeEventListener(ev, start));
    idle(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
      .then(() => loadScript(BASE_JS + 'door3d.js'))
      .then(() => door.classList.add('ready'))
      .catch(() => door.classList.add('ready')));
  };
  events.forEach((ev) => window.addEventListener(ev, start, { once: true, passive: true }));
  const arm = () => { timer = setTimeout(start, 6000); };
  if (document.readyState === 'complete') arm(); else window.addEventListener('load', arm, { once: true });
})();

// Carte des zones : Leaflet n'est téléchargé qu'à l'approche de la carte.
(() => {
  const map = document.getElementById('zone-map');
  if (!map) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((en) => en.isIntersecting)) return;
    io.disconnect();
    loadStyle('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css');
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js')
      .then(() => loadScript(BASE_JS + 'zones-map.js'));
  }, { rootMargin: '600px 0px' });
  io.observe(map);
})();

// En-tête : ombre au défilement, barre de progression et lien actif du menu.
(() => {
  const header = document.querySelector('header.site');
  if (!header) return;
  const bar = document.createElement('div');
  bar.className = 'progress';
  header.appendChild(bar);
  const top = document.createElement('button');
  top.type = 'button';
  top.className = 'to-top';
  top.setAttribute('aria-label', 'Revenir en haut de la page');
  top.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="tt-track" cx="20" cy="20" r="17"/><circle class="tt-ring" cx="20" cy="20" r="17"/><path d="M14 22l6-6 6 6"/></svg>';
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  document.body.appendChild(top);
  const ring = top.querySelector('.tt-ring');

  const links = [...document.querySelectorAll('nav.main a[href^="#"]')]
    .map((a) => ({ a, sec: document.querySelector(a.getAttribute('href')) })).filter((l) => l.sec);

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    const k = max > 0 ? Math.min(1, y / max) : 0;
    header.classList.toggle('scrolled', y > 10);
    bar.style.transform = `scaleX(${k})`;
    ring.style.strokeDashoffset = String(107 * (1 - k));
    top.classList.toggle('show', y > 600);
    let cur = null;
    links.forEach((l) => { if (l.sec.getBoundingClientRect().top < window.innerHeight * 0.35) cur = l; });
    links.forEach((l) => l.a.classList.toggle('active', l === cur));
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

// Apparition au défilement : chaque bloc arrive en fondu, en cascade avec ses voisins.
(() => {
  if (reduced || !('IntersectionObserver' in window)) return;
  const groups = [
    ['.section-head', ''],
    ['#services .card, #tarifs .price, #pourquoi .why, #fonctionnement .step, .local aside .card, #quartiers .card', ''],
    ['.city-card, .faq details, .chips li', 'r-soft'],
    ['.shot', 'r-zoom'],
    ['.prose > h2, .prose > h3, .prose > p, .prose > ul, .article-body > *', 'r-soft'],
    ['.zone-wrap, .contact-info, #contact form, .cta-band .container > *', 'r-side'],
  ];
  const items = [];
  groups.forEach(([sel, cls]) => document.querySelectorAll(sel).forEach((el) => {
    if (el.closest('.hero') || el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    if (cls) el.classList.add(cls);
    items.push(el);
  }));
  document.documentElement.classList.add('reveal-on');
  const io = new IntersectionObserver((entries) => {
    // Décalage relatif aux éléments qui entrent ensemble (une rangée sur ordi, une carte sur mobile).
    entries.filter((en) => en.isIntersecting).forEach((en, j) => {
      en.target.style.setProperty('--d', Math.min(j, 8) * 90 + 'ms');
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
})();

// Cartes : légère inclinaison 3D et reflet lumineux qui suit la souris (ordinateur uniquement).
(() => {
  if (reduced || !finePointer) return;
  document.querySelectorAll('#services .card, .price, .city-card, #quartiers .card, .guide-card, .why').forEach((el) => {
    el.classList.add('tilt');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 6).toFixed(2)}deg) rotateY(${((x - 0.5) * 7).toFixed(2)}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

// Boutons d'appel : attirés par la souris, et onde au clic.
(() => {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      if (reduced) return;
      const r = btn.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'ripple';
      s.style.left = e.clientX - r.left + 'px';
      s.style.top = e.clientY - r.top + 'px';
      btn.appendChild(s);
      setTimeout(() => s.remove(), 650);
    });
  });
  if (reduced || !finePointer) return;
  document.querySelectorAll('.btn-light, .header-call').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width, dy = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = `translate(${(dx * 8).toFixed(1)}px, ${(dy * 6).toFixed(1)}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
})();

// Hero : halo qui suit la souris, mots qui défilent et compteurs.
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (finePointer && !reduced) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--hx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      hero.style.setProperty('--hy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }
  const rot = hero.querySelector('.rot');
  if (rot && !reduced) {
    const words = rot.dataset.words.split('|');
    let i = 0;
    setInterval(() => {
      rot.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        rot.textContent = words[i];
        rot.classList.remove('out');
      }, 320);
    }, 2600);
  }
  const counters = hero.querySelectorAll('[data-count]');
  if (reduced) return;
  counters.forEach((el) => {
    const end = +el.dataset.count;
    if (!end) return;
    const t0 = performance.now() + 300, dur = 1200;
    el.textContent = '0';
    const step = (t) => {
      const k = Math.max(0, Math.min(1, (t - t0) / dur));
      el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})();

// FAQ : ouverture et fermeture en douceur (la balise <details> reste fonctionnelle sans JS).
(() => {
  if (reduced) return;
  document.querySelectorAll('.faq details').forEach((d) => {
    const sum = d.querySelector('summary'), body = d.querySelector('p');
    if (!sum || !body) return;
    sum.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = '1';
      if (!d.open) {
        d.open = true;
        const h = body.scrollHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' })
          .onfinish = () => { delete d.dataset.busy; };
      } else {
        const h = body.scrollHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 240, easing: 'ease-in' })
          .onfinish = () => { d.open = false; delete d.dataset.busy; };
      }
    });
  });
})();

// Fonds animés : petits symboles placés sur une grille avec un décalage aléatoire,
// qui flottent et scintillent (ou tournent pour les engrenages).
const fillSky = (sky, { shapes, cols, rows, size, opacity, spin = [] }) => {
  if (!sky) return '';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const colors = ['var(--cyan)', 'var(--violet)', '#3D6BFF', 'var(--cyan-ink)'];
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

// Prestations : clés, cadenas, portes et boucliers.
(() => {
  const sky = document.querySelector('#services .sky');
  if (!sky) return;
  sky.innerHTML = fillSky(sky, {
    shapes: ['i-key', 'i-key', 'i-lock', 'i-unlock', 'i-door', 'i-shield', 'i-cylinder', 'i-shutter', 'i-mailbox', 'i-gear'],
    spin: ['i-gear'],
    cols: small ? 3 : 8, rows: small ? 9 : 6, size: [18, 34], opacity: [.08, .18, .25, .45],
  });
})();

// Tarifs : étincelles, pièces et étoiles filantes.
(() => {
  const sky = document.querySelector('#tarifs .sky');
  if (!sky) return;
  let html = fillSky(sky, {
    shapes: ['i-sparkle', 'i-sparkle', 'i-sparkle', 'i-euro', 'i-key'],
    cols: small ? 3 : 7, rows: small ? 6 : 5, size: [8, 24], opacity: [.08, .2, .3, .6],
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
    if (!reduced) media.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
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
  // Balayage du doigt sur mobile
  let x0 = null;
  box.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();

/* Studio ponytail : profil de tête, la queue de cheval suit la hauteur choisie ;
   frange, demi-tête et lace frontal se dessinent selon la version. */
(() => {
  'use strict';
  const bloc = document.querySelector('[data-ponytail]');
  if (!bloc) return;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const C = { x: 188, y: 166, r: 95 };
  const svg = bloc.querySelector('svg');
  const g = (n) => svg.querySelector(`[data-pt-${n}]`);
  const gQueue = g('queue'); const gPlaques = g('plaques'); const gFrange = g('frange'); const gLache = g('lache');
  const lace = g('lace'); const elastique = g('elastique');
  const curseur = bloc.querySelector('[data-pt-hauteur]');
  const hauteurTexte = bloc.querySelector('[data-pt-hauteur-texte]');

  const chemins = (groupe, n) => Array.from({ length: n }, () => {
    const p = document.createElementNS(NS, 'path');
    groupe.appendChild(p);
    return p;
  });
  const queue = chemins(gQueue, 13);
  const plaques = chemins(gPlaques, 7);
  const frange = chemins(gFrange, 8);
  const lache = chemins(gLache, 12);
  const DEPARTS = [[262, 128], [250, 144], [236, 160], [220, 174], [204, 190], [178, 216], [152, 240]];
  const f = (v) => v.toFixed(1);

  let h = .7; let hCible = .7; let ouvF = 0; let ouvL = 0; let cibleF = 0; let cibleL = 0; let raf = 0;

  const dessiner = (t) => {
    const a = (128 + h * 110) * Math.PI / 180;
    const nx = Math.cos(a); const ny = Math.sin(a);
    const tx = -ny; const ty = nx;
    const P = { x: C.x + C.r * nx, y: C.y + C.r * ny };
    const vent = reduit ? 0 : Math.sin(t / 900) * 4;
    elastique.setAttribute('cx', f(P.x)); elastique.setAttribute('cy', f(P.y));
    elastique.setAttribute('transform', `rotate(${f(a * 180 / Math.PI)} ${f(P.x)} ${f(P.y)})`);
    queue.forEach((p, i) => {
      const k = i - (queue.length - 1) / 2;
      const sx = P.x + tx * k * 1.3; const sy = P.y + ty * k * 1.3;
      const ex = P.x + nx * 40 - 34 + k * 5.5 + vent * (1 + Math.abs(k) / 4);
      const ey = Math.min(456, P.y + 250 - Math.abs(k) * 4);
      const c1x = sx + nx * 58; const c1y = sy + ny * 58 - 6;
      const c2x = P.x + nx * 92 - 20 + k * 2; const c2y = P.y + ny * 30 + 80;
      p.setAttribute('d', `M${f(sx)} ${f(sy)}C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f((c2x + ex) / 2)} ${f((c2y + ey) / 2 + 20)}S${f(ex + 3)} ${f(ey - 40)} ${f(ex)} ${f(ey)}`);
    });
    plaques.forEach((p, i) => {
      const [x, y] = DEPARTS[i];
      const mx = (x + P.x) / 2; const my = (y + P.y) / 2;
      const ox = mx - C.x; const oy = my - C.y; const l = Math.hypot(ox, oy) || 1;
      p.setAttribute('d', `M${x} ${y}Q${f(mx + (ox / l) * 22)} ${f(my + (oy / l) * 22)} ${f(P.x)} ${f(P.y)}`);
    });
    frange.forEach((p, i) => {
      const o = ouvF;
      const x0 = 232 + i * 4.5; const y0 = 88 + i * 4;
      const ex = 268 + i * 2.6 + (1 - o) * -24; const ey = 120 + (40 + i * 2.5) * o;
      p.setAttribute('d', `M${f(x0)} ${f(y0)}C${f(x0 + 30)} ${f(y0 + 2)} ${f(ex + 14)} ${f(ey - 34 * o)} ${f(ex)} ${f(ey)}`);
      p.style.opacity = String(o);
    });
    lache.forEach((p, i) => {
      const ang = (100 + i * 6.5) * Math.PI / 180;
      const sx = C.x + (C.r + 1) * Math.cos(ang); const sy = C.y + (C.r + 1) * Math.sin(ang);
      const longueur = 190 * ouvL;
      const ex = sx - 34 + i * 1.5 + vent; const ey = sy + longueur;
      p.setAttribute('d', `M${f(sx)} ${f(sy)}C${f(sx - 28)} ${f(sy + longueur * .3)} ${f(ex + 14)} ${f(sy + longueur * .6)} ${f(ex)} ${f(ey)}`);
      p.style.opacity = String(Math.min(1, ouvL * 1.4));
    });
  };

  const boucle = (t) => {
    const k = reduit ? 1 : .12;
    h += (hCible - h) * k; ouvF += (cibleF - ouvF) * k; ouvL += (cibleL - ouvL) * k;
    dessiner(t);
    raf = requestAnimationFrame(boucle);
  };

  const maj = () => {
    hCible = curseur.value / 100;
    hauteurTexte.textContent = hCible < .34 ? 'basse' : hCible < .67 ? 'au milieu' : 'haute';
    const v = bloc.querySelector('input[name="version"]:checked');
    cibleF = v.value === 'ponytail-frange' ? 1 : 0;
    cibleL = v.value === 'ponytail-demi-tete' ? 1 : 0;
    lace.classList.toggle('visible', v.value === 'ponytail-lace-frontal');
    bloc.querySelector('[data-pt-nom]').textContent = v.dataset.nom;
    bloc.querySelector('[data-pt-prix]').textContent = v.dataset.prix;
    bloc.querySelector('[data-pt-duree]').textContent = v.dataset.duree;
    const note = `Hauteur souhaitée : ${hauteurTexte.textContent}`;
    bloc.querySelector('[data-pt-reserver]').href = `../reserver/?p=${v.value}&n=${encodeURIComponent(note)}`;
  };
  bloc.addEventListener('input', maj);
  bloc.addEventListener('change', maj);
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !raf) raf = requestAnimationFrame(boucle);
    if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
  }).observe(svg);
  maj();
  h = reduit ? hCible : .1;
  dessiner(0);
})();

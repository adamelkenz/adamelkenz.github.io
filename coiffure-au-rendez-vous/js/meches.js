/* Mèches de soie : des cheveux fins ondulent en fond de héros, et s'écartent sous le pointeur
   comme sous un peigne. La mèche oblique du logo donne l'inclinaison générale. */
(() => {
  'use strict';
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IVOIRE = '244,236,230';
  const PAMPA = '215,194,166';

  document.querySelectorAll('[data-meches]').forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const discret = canvas.classList.contains('meches-discret');
    let W = 0; let H = 0; let meches = [];
    let visible = true; let raf = 0; let t0 = performance.now();
    const pointeur = { x: -9999, y: -9999, vx: 0, px: -9999, py: -9999 };

    const creer = () => {
      const n = Math.round(Math.min(discret ? 70 : 120, Math.max(34, W / (discret ? 18 : 12))));
      const segments = Math.max(14, Math.round(H / 34));
      meches = [];
      for (let i = 0; i < n; i++) {
        const x0 = ((i + Math.random() * .9) / n) * (W + 240) - 120;
        const pts = [];
        for (let j = 0; j <= segments; j++) pts.push({ o: 0, v: 0 });
        meches.push({
          x0, pts, segments,
          phase: Math.random() * Math.PI * 2,
          amp: 6 + Math.random() * 20,
          freq: .0025 + Math.random() * .003,
          vit: .25 + Math.random() * .35,
          alpha: (discret ? .03 : .05) + Math.random() * (discret ? .08 : .15),
          largeur: .45 + Math.random() * .9,
          dore: Math.random() < .12,
        });
      }
    };

    const dimension = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = parent.clientWidth; H = parent.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      creer();
    };

    const dessiner = (t) => {
      ctx.clearRect(0, 0, W, H);
      const temps = (t - t0) / 1000;
      const R = Math.min(170, W * .22);
      pointeur.vx *= .9;
      for (const m of meches) {
        const pas = (H + 80) / m.segments;
        ctx.beginPath();
        let xPrec = 0; let yPrec = 0;
        for (let j = 0; j <= m.segments; j++) {
          const y = -40 + j * pas;
          const pente = (y - H / 2) * -.16;
          const base = m.x0 + pente + Math.sin(y * m.freq + m.phase + temps * m.vit) * m.amp;
          const p = m.pts[j];
          if (!reduit) {
            const dx = base + p.o - pointeur.x;
            const dy = y - pointeur.y;
            const dist = Math.hypot(dx, dy);
            let cible = 0;
            if (dist < R) {
              const f = 1 - dist / R;
              cible = Math.sign(dx || 1) * f * f * 70 + pointeur.vx * f * 1.6;
            }
            p.v += (cible - p.o) * .06;
            p.v *= .84;
            p.o += p.v;
          }
          const x = base + p.o;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.quadraticCurveTo(xPrec, yPrec, (xPrec + x) / 2, (yPrec + y) / 2);
          xPrec = x; yPrec = y;
        }
        ctx.lineTo(xPrec, yPrec);
        ctx.strokeStyle = `rgba(${m.dore ? PAMPA : IVOIRE},${m.alpha})`;
        ctx.lineWidth = m.largeur;
        ctx.stroke();
      }
    };

    const boucle = (t) => {
      dessiner(t);
      raf = visible && !reduit ? requestAnimationFrame(boucle) : 0;
    };
    const relancer = () => { if (!raf && visible && !reduit) raf = requestAnimationFrame(boucle); };

    addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (pointeur.px > -9000) pointeur.vx += (x - pointeur.px) * .5;
      pointeur.vx = Math.max(-60, Math.min(60, pointeur.vx));
      pointeur.x = x; pointeur.y = y; pointeur.px = x; pointeur.py = y;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { pointeur.x = -9999; pointeur.px = -9999; });

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) relancer(); }).observe(canvas);
    let attente;
    addEventListener('resize', () => {
      clearTimeout(attente);
      attente = setTimeout(() => {
        if (Math.abs(parent.clientWidth - W) > 2 || Math.abs(parent.clientHeight - H) > 80) { dimension(); if (reduit) dessiner(performance.now()); }
      }, 160);
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) relancer(); });

    dimension();
    if (reduit) dessiner(performance.now()); else relancer();
  });
})();

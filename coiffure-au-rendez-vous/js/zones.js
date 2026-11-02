/* Schéma de tête : chaque technique dessine sa zone (closure, frontal, tissage…). */
(() => {
  'use strict';
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-zones]').forEach((bloc) => {
    const boutons = [...bloc.querySelectorAll('[data-choix]')];
    const panneaux = [...bloc.querySelectorAll('[data-panneau]')];
    const groupes = [...bloc.querySelectorAll('.zone')];
    const cles = boutons.map((b) => b.dataset.choix);
    let courant = -1;
    let auto = !reduit;
    let visible = false;

    const choisir = (i) => {
      courant = i;
      const k = cles[i];
      boutons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.choix === k)));
      panneaux.forEach((p) => { p.hidden = p.dataset.panneau !== k; });
      groupes.forEach((g) => {
        g.classList.remove('actif');
        if (g.dataset.zone === k) { void g.getBoundingClientRect(); g.classList.add('actif'); }
      });
    };

    boutons.forEach((b, i) => b.addEventListener('click', () => { auto = false; choisir(i); }));
    bloc.addEventListener('keydown', (e) => {
      const i = boutons.indexOf(document.activeElement);
      if (i < 0 || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + boutons.length) % boutons.length;
      boutons[n].focus(); auto = false; choisir(n);
    });

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && courant < 0) choisir(0);
    }, { threshold: .35 }).observe(bloc);

    setInterval(() => {
      if (auto && visible && !document.hidden && !bloc.matches(':hover')) choisir((courant + 1) % cles.length);
    }, 4600);
  });
})();

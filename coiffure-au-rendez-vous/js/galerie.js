/* Galerie : piste à glisser (souris, doigt, molette), filtres par allure et visionneuse plein écran. */
(() => {
  'use strict';
  const piste = document.querySelector('[data-galerie]');
  if (!piste) return;
  const UI = window.CRV_UI || {};
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [...piste.querySelectorAll('.galerie-item')];
  const barre = document.querySelector('[data-galerie-barre]');

  if (UI.glisser) UI.glisser(piste, { molette: true });

  /* progression */
  const progression = () => {
    const max = piste.scrollWidth - piste.clientWidth;
    const part = piste.clientWidth / piste.scrollWidth;
    const p = max > 0 ? piste.scrollLeft / max : 0;
    barre.style.width = `${Math.max(8, part * 100)}%`;
    barre.style.left = `${p * (100 - Math.max(8, part * 100))}%`;
  };
  piste.addEventListener('scroll', progression, { passive: true });
  addEventListener('resize', progression);
  progression();

  const defiler = (sens) => piste.scrollBy({ left: sens * piste.clientWidth * .8, behavior: reduit ? 'auto' : 'smooth' });
  document.querySelector('[data-galerie-prec]').addEventListener('click', () => defiler(-1));
  document.querySelector('[data-galerie-suiv]').addEventListener('click', () => defiler(1));
  piste.addEventListener('keydown', (e) => {
    if (e.target !== piste) return;
    if (e.key === 'ArrowRight') { defiler(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { defiler(-1); e.preventDefault(); }
  });

  /* filtres */
  const filtres = [...document.querySelectorAll('[data-filtrer]')];
  filtres.forEach((f) => f.addEventListener('click', () => {
    const k = f.dataset.filtrer;
    filtres.forEach((x) => x.setAttribute('aria-pressed', String(x === f)));
    items.forEach((it) => {
      const montre = k === 'tout' || it.dataset.filtre === k;
      it.classList.toggle('masque', !montre);
      it.querySelector('button').tabIndex = montre ? 0 : -1;
    });
    piste.scrollTo({ left: 0, behavior: reduit ? 'auto' : 'smooth' });
    setTimeout(progression, 650);
  }));

  /* visionneuse */
  const dlg = document.querySelector('[data-visionneuse]');
  const img = dlg.querySelector('[data-visionneuse-img]');
  const legende = dlg.querySelector('[data-visionneuse-legende]');
  let courant = 0;
  let declencheur = null;
  const visibles = () => items.filter((it) => !it.classList.contains('masque'));
  const montrer = (it) => {
    const b = it.querySelector('button');
    const vignette = b.querySelector('img');
    courant = visibles().indexOf(it);
    img.src = b.dataset.grande;
    img.alt = vignette.alt;
    legende.textContent = vignette.alt;
  };
  const ouvrir = (it) => {
    declencheur = it.querySelector('button');
    montrer(it);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  };
  const fermer = () => { if (dlg.open) dlg.close(); };
  const voisin = (sens) => {
    const v = visibles();
    montrer(v[(courant + sens + v.length) % v.length]);
  };
  piste.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ouvrir]');
    if (b && !piste.classList.contains('saisie')) ouvrir(b.closest('.galerie-item'));
  });
  dlg.addEventListener('close', () => { document.body.style.overflow = ''; if (declencheur) declencheur.focus(); });
  dlg.querySelector('[data-visionneuse-fermer]').addEventListener('click', fermer);
  dlg.querySelector('[data-visionneuse-prec]').addEventListener('click', () => voisin(-1));
  dlg.querySelector('[data-visionneuse-suiv]').addEventListener('click', () => voisin(1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) fermer(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') voisin(1);
    if (e.key === 'ArrowLeft') voisin(-1);
  });
  let x0 = null;
  dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) voisin(dx < 0 ? 1 : -1);
    x0 = null;
  });
})();

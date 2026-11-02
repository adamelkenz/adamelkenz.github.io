/* Coiffure au Rendez-Vous — interactions communes à toutes les pages. */
(() => {
  'use strict';
  const d = document;
  const html = d.documentElement;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fin = matchMedia('(pointer: fine)').matches;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const borne = (v, a, b) => Math.min(b, Math.max(a, v));

  $$('[data-annee]').forEach((e) => { e.textContent = new Date().getFullYear(); });

  /* ---------------------------------------------------------- rideau d'ouverture + logo du héros */
  const rideau = $('[data-rideau]');
  const wordmark = $('[data-wordmark]');
  const cadre = $('.hero-cadre');
  const animerLogo = () => {
    if (wordmark) wordmark.classList.add('anime');
    if (cadre) cadre.classList.add('vu');
  };
  if (rideau && html.classList.contains('intro')) {
    try { sessionStorage.setItem('crv-intro', '1'); } catch (e) { /* navigation privée */ }
    const timers = [];
    const fini = () => { html.classList.remove('intro'); rideau.remove(); };
    const etape = (c) => rideau.classList.add(c);
    timers.push(setTimeout(() => etape('etape-1'), 80));
    timers.push(setTimeout(() => etape('etape-2'), 900));
    timers.push(setTimeout(() => { etape('etape-3'); rideau.style.pointerEvents = 'none'; }, 1900));
    timers.push(setTimeout(animerLogo, 2250));
    timers.push(setTimeout(fini, 3300));
    const passer = () => {
      timers.forEach(clearTimeout);
      rideau.classList.add('etape-1', 'etape-2', 'etape-3');
      rideau.style.pointerEvents = 'none';
      animerLogo();
      setTimeout(fini, 1000);
    };
    rideau.style.pointerEvents = 'auto';
    rideau.addEventListener('click', passer, { once: true });
    addEventListener('keydown', passer, { once: true });
  } else {
    if (rideau) rideau.remove();
    setTimeout(animerLogo, 120);
  }

  /* ---------------------------------------------------------- en-tête */
  const entete = $('[data-entete]');
  let dernierY = scrollY;
  const surDefilement = () => {
    const y = scrollY;
    entete.classList.toggle('defile', y > 30);
    const menuOuvert = html.classList.contains('menu-ouvert');
    entete.classList.toggle('cache', !menuOuvert && y > 500 && y > dernierY + 4);
    if (y < dernierY - 4) entete.classList.remove('cache');
    dernierY = y;
  };
  addEventListener('scroll', surDefilement, { passive: true });
  surDefilement();

  /* sous-menu Prestations */
  const deroulant = $('[data-deroulant]');
  if (deroulant) {
    const bouton = $('button', deroulant);
    let delai;
    const ouvrir = (o) => {
      deroulant.classList.toggle('ouvert', o);
      bouton.setAttribute('aria-expanded', String(o));
    };
    bouton.addEventListener('click', () => ouvrir(!deroulant.classList.contains('ouvert')));
    if (fin) {
      deroulant.addEventListener('mouseenter', () => { clearTimeout(delai); ouvrir(true); });
      deroulant.addEventListener('mouseleave', () => { delai = setTimeout(() => ouvrir(false), 220); });
    }
    d.addEventListener('click', (e) => { if (!deroulant.contains(e.target)) ouvrir(false); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && deroulant.classList.contains('ouvert')) { ouvrir(false); bouton.focus(); } });
    deroulant.addEventListener('focusout', (e) => { if (!deroulant.contains(e.relatedTarget)) ouvrir(false); });
  }

  /* menu mobile */
  const burger = $('.burger');
  const menu = $('[data-menu-mobile]');
  if (burger && menu) {
    const basculer = (o) => {
      menu.classList.toggle('ouvert', o);
      html.classList.toggle('menu-ouvert', o);
      burger.setAttribute('aria-expanded', String(o));
      burger.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
      d.body.style.overflow = o ? 'hidden' : '';
      if (o) entete.classList.remove('cache');
    };
    burger.addEventListener('click', () => basculer(!menu.classList.contains('ouvert')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => basculer(false)));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('ouvert')) { basculer(false); burger.focus(); } });
  }

  /* ---------------------------------------------------------- titres mot à mot */
  const decouper = (el) => {
    let n = 0;
    const masque = (mot, enveloppe) => {
      const m = d.createElement('span');
      m.className = 'mot-masque';
      const s = d.createElement('span');
      s.style.transitionDelay = `${n++ * 55}ms`;
      if (enveloppe) { const e = enveloppe.cloneNode(false); e.textContent = mot; s.appendChild(e); } else s.textContent = mot;
      m.appendChild(s);
      return m;
    };
    const frag = d.createDocumentFragment();
    const traiter = (texte, enveloppe) => {
      texte.split(/( +)/).forEach((morceau, i) => {
        if (!morceau) return;
        const precedent = frag.lastChild;
        if (/^ +$/.test(morceau)) frag.appendChild(d.createTextNode(' '));
        else if (i === 0 && !enveloppe && precedent && precedent.className === 'mot-masque' && /^[,.;:!?…»)]/.test(morceau)) {
          precedent.firstChild.appendChild(d.createTextNode(morceau));
        } else frag.appendChild(masque(morceau, enveloppe));
      });
    };
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 3) traiter(node.textContent);
      else if (node.nodeName === 'BR') frag.appendChild(node.cloneNode());
      else traiter(node.textContent, node);
    });
    el.textContent = '';
    el.appendChild(frag);
  };
  if (!reduit) $$('[data-lignes]').forEach(decouper);

  /* ---------------------------------------------------------- apparitions */
  const aObserver = $$('.revele, [data-lignes], .diplomee-visuel');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entrees) => {
      let rang = 0;
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.classList.contains('revele')) el.style.transitionDelay = `${Math.min(rang++, 6) * 90}ms`;
        el.classList.add('vu');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    aObserver.forEach((el) => io.observe(el));
  } else aObserver.forEach((el) => el.classList.add('vu'));

  /* ---------------------------------------------------------- compteurs */
  const compteurs = $$('[data-compte]');
  if (compteurs.length && 'IntersectionObserver' in window && !reduit) {
    const io = new IntersectionObserver((entrees) => entrees.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const cible = +el.dataset.compte;
      const t0 = performance.now();
      const pas = (t) => {
        const p = borne((t - t0) / 1700, 0, 1);
        el.textContent = Math.round(cible * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(pas);
      };
      el.textContent = '0';
      requestAnimationFrame(pas);
    }), { threshold: .6 });
    compteurs.forEach((c) => io.observe(c));
  }

  /* ---------------------------------------------------------- manifeste mot à mot au défilement */
  const manifeste = $('[data-mots]');
  if (manifeste) {
    const accents = ['confiance', 'revitalisée', 'épanouie.'];
    const mots = manifeste.textContent.trim().split(/\s+/).map((m) => {
      const s = d.createElement('span');
      s.className = 'mot' + (accents.includes(m) ? ' accent' : '');
      s.textContent = m;
      return s;
    });
    manifeste.textContent = '';
    mots.forEach((m, i) => { manifeste.appendChild(m); if (i < mots.length - 1) manifeste.appendChild(d.createTextNode(' ')); });
    const maj = () => {
      const r = manifeste.getBoundingClientRect();
      const vh = innerHeight;
      const p = borne((vh * .82 - r.top) / (r.height + vh * .25), 0, 1);
      const n = Math.round(p * mots.length);
      mots.forEach((m, i) => m.classList.toggle('allume', i < n));
    };
    addEventListener('scroll', maj, { passive: true });
    maj();
  }

  /* ---------------------------------------------------------- boucle d'animation partagée */
  const taches = new Set();
  let enCours = false;
  const boucle = (t) => {
    taches.forEach((f) => f(t));
    if (taches.size) requestAnimationFrame(boucle); else enCours = false;
  };
  const animer = (f) => { taches.add(f); if (!enCours) { enCours = true; requestAnimationFrame(boucle); } return () => taches.delete(f); };

  /* vitesse de défilement (rubans, sceaux) */
  let vitesse = 0;
  let yPrec = scrollY;
  addEventListener('scroll', () => { vitesse += (scrollY - yPrec); yPrec = scrollY; }, { passive: true });

  /* rubans défilants */
  if (!reduit) {
    $$('[data-ruban]').forEach((r) => {
      const piste = $('.ruban-piste', r);
      let x = 0;
      let dir = 1;
      let visible = true;
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(r);
      let tPrec = 0;
      animer((t) => {
        const dt = Math.min(48, t - (tPrec || t));
        tPrec = t;
        if (!visible) return;
        if (Math.abs(vitesse) > 1) dir = vitesse > 0 ? 1 : -1;
        const largeur = piste.scrollWidth / 2;
        x -= dir * (0.045 + Math.min(Math.abs(vitesse), 120) * 0.01) * dt;
        if (x <= -largeur) x += largeur;
        if (x > 0) x -= largeur;
        piste.style.transform = `translate3d(${x}px,0,0)`;
      });
    });
    /* sceaux */
    $$('[data-sceau] .sceau-tour').forEach((g) => {
      let a = 0;
      animer(() => { a += 0.12 + Math.abs(vitesse) * 0.05; g.style.transform = `rotate(${(a % 360).toFixed(2)}deg)`; });
    });
  }
  animer(() => { vitesse *= 0.86; });

  /* ---------------------------------------------------------- curseur, inclinaison, magnétisme */
  if (fin && !reduit) {
    const curseur = $('.curseur');
    const point = $('.curseur-point', curseur);
    const anneau = $('.curseur-anneau', curseur);
    const texte = $('.curseur-texte', curseur);
    let mx = -100; let my = -100; let ax = -100; let ay = -100;
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      curseur.classList.add('visible');
      const cible = e.target.closest('[data-curseur]');
      const lien = e.target.closest('a, button, label, input, summary, [data-pile-carte]');
      curseur.classList.toggle('etiquette', !!cible);
      if (cible) texte.textContent = cible.dataset.curseur;
      curseur.classList.toggle('lien', !cible && !!lien);
    }, { passive: true });
    d.addEventListener('pointerleave', () => curseur.classList.remove('visible'));
    animer(() => {
      ax += (mx - ax) * 0.18; ay += (my - ay) * 0.18;
      point.style.transform = `translate3d(${mx}px,${my}px,0)`;
      anneau.style.transform = `translate3d(${ax}px,${ay}px,0)`;
    });

    const incliner = (el, force) => {
      let rx = 0; let ry = 0; let cx = 0; let cy = 0; let actif = false; let stop = null;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        ry = ((e.clientX - r.left) / r.width - .5) * force * 2;
        rx = -((e.clientY - r.top) / r.height - .5) * force * 2;
        if (!actif) { actif = true; stop = animer(() => {
          cx += (rx - cx) * .12; cy += (ry - cy) * .12;
          el.style.transform = `perspective(900px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
          if (!actif && Math.abs(cx) < .02 && Math.abs(cy) < .02) { el.style.transform = ''; stop(); }
        }); }
      });
      el.addEventListener('pointerleave', () => { rx = 0; ry = 0; actif = false; });
    };
    $$('[data-tilt]').forEach((el) => incliner(el, 6));
    $$('[data-tilt-leger]').forEach((el) => incliner(el, 3));

    $$('[data-magnetique]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------- index des prestations : aperçu qui suit le pointeur */
  const index = $('[data-index]');
  if (index && fin) {
    const apercu = $('.index-apercu', index);
    const image = $('img', apercu);
    let x = 0; let y = 0; let px = 0; let py = 0; let stop = null;
    index.addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (!stop) { px = x; py = y; stop = animer(() => {
        px += (x - px) * .14; py += (y - py) * .14;
        apercu.style.left = `${px + 30}px`; apercu.style.top = `${py - 140}px`;
      }); }
    });
    $$('.index-ligne', index).forEach((l) => l.addEventListener('pointerenter', () => {
      if (!image.src.endsWith(l.dataset.photo)) image.src = l.dataset.photo;
      apercu.classList.add('visible');
    }));
    index.addEventListener('pointerleave', () => { apercu.classList.remove('visible'); if (stop) { stop(); stop = null; } });
  }

  /* ---------------------------------------------------------- vidéo du héros */
  const video = $('.hero-video');
  const pause = $('[data-video-pause]');
  if (video && pause) {
    let voulue = !reduit;
    const etat = () => {
      pause.classList.toggle('en-pause', video.paused);
      pause.setAttribute('aria-label', video.paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause');
    };
    if (reduit) video.pause();
    video.addEventListener('play', etat);
    video.addEventListener('pause', etat);
    pause.addEventListener('click', () => { voulue = video.paused; if (video.paused) video.play(); else video.pause(); });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && voulue) video.play().catch(() => {});
      else if (!e.isIntersecting) video.pause();
    }).observe(video);
    etat();
  }

  /* ---------------------------------------------------------- pile de photos */
  $$('[data-pile]').forEach((pile) => {
    const cartes = $$('[data-pile-carte]', pile);
    if (cartes.length < 2) return;
    let ordre = cartes.map((_, i) => i);
    const poses = [
      'translate3d(0,0,0) rotate(0deg) scale(1)',
      'translate3d(22px,16px,0) rotate(5deg) scale(.95)',
      'translate3d(-20px,28px,0) rotate(-6deg) scale(.9)',
    ];
    const placer = () => ordre.forEach((c, rang) => {
      const el = cartes[c];
      el.style.zIndex = String(cartes.length - rang);
      el.style.transform = poses[Math.min(rang, poses.length - 1)];
      el.style.filter = rang ? 'brightness(.55)' : '';
      el.setAttribute('aria-hidden', rang ? 'true' : 'false');
    });
    let occupe = false;
    const suivante = (sens = 1) => {
      if (occupe) return;
      occupe = true;
      const haut = cartes[ordre[0]];
      haut.style.transform = `translate3d(${sens * 120}%, -4%, 0) rotate(${sens * 16}deg)`;
      setTimeout(() => {
        ordre = ordre.slice(1).concat(ordre[0]);
        placer();
        occupe = false;
      }, reduit ? 0 : 420);
    };
    placer();
    $('[data-pile-suivante]', pile).addEventListener('click', () => { suivante(1); auto = false; });
    /* glisser la carte du dessus */
    let x0 = null; let dx = 0;
    cartes.forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        if (el !== cartes[ordre[0]]) return;
        x0 = e.clientX; dx = 0; el.classList.add('glisse'); el.setPointerCapture(e.pointerId); auto = false;
      });
      el.addEventListener('pointermove', (e) => {
        if (x0 === null) return;
        dx = e.clientX - x0;
        el.style.transform = `translate3d(${dx}px,0,0) rotate(${dx / 18}deg)`;
      });
      const lacher = () => {
        if (x0 === null) return;
        x0 = null; el.classList.remove('glisse');
        if (Math.abs(dx) > 70) suivante(dx > 0 ? 1 : -1); else placer();
      };
      el.addEventListener('pointerup', lacher);
      el.addEventListener('pointercancel', lacher);
    });
    let auto = !reduit;
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(pile);
    setInterval(() => { if (auto && visible && !d.hidden) suivante(1); }, 4200);
  });

  /* ---------------------------------------------------------- étapes : la mèche se trace au défilement */
  $$('[data-etapes]').forEach((bloc) => {
    const chemin = $('.etapes-meche path', bloc);
    const etapes = $$('[data-etape]', bloc);
    const maj = () => {
      const r = bloc.getBoundingClientRect();
      const vh = innerHeight;
      const p = borne((vh * .62 - r.top) / r.height, 0, 1);
      chemin.style.setProperty('--trace', String(1 - p));
      etapes.forEach((e) => e.classList.toggle('atteinte', e.getBoundingClientRect().top < vh * .62));
    };
    addEventListener('scroll', maj, { passive: true });
    addEventListener('resize', maj);
    maj();
  });

  /* ---------------------------------------------------------- pistes horizontales : glisser à la souris */
  const glisser = (piste, opts = {}) => {
    let x0 = 0; let s0 = 0; let actif = false; let bouge = false; let v = 0; let dernier = 0; let tDernier = 0; let stop = null;
    piste.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      actif = true; bouge = false; x0 = e.clientX; s0 = piste.scrollLeft; v = 0; dernier = e.clientX; tDernier = performance.now();
      if (stop) { stop(); stop = null; }
    });
    addEventListener('pointermove', (e) => {
      if (!actif) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 5 && !bouge) { bouge = true; piste.classList.add('saisie'); }
      if (!bouge) return;
      piste.scrollLeft = s0 - dx;
      const t = performance.now();
      v = (e.clientX - dernier) / Math.max(1, t - tDernier);
      dernier = e.clientX; tDernier = t;
    });
    addEventListener('pointerup', () => {
      if (!actif) return;
      actif = false;
      setTimeout(() => piste.classList.remove('saisie'), 0);
      if (!bouge || reduit) return;
      let vit = v * 16;
      stop = animer(() => {
        piste.scrollLeft -= vit;
        vit *= .94;
        if (Math.abs(vit) < .4) { stop(); stop = null; }
      });
    });
    piste.addEventListener('click', (e) => { if (bouge) { e.preventDefault(); e.stopPropagation(); bouge = false; } }, true);
    if (opts.molette) {
      piste.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        const max = piste.scrollWidth - piste.clientWidth;
        if ((e.deltaY > 0 && piste.scrollLeft < max - 2) || (e.deltaY < 0 && piste.scrollLeft > 2)) {
          piste.scrollLeft += e.deltaY; e.preventDefault();
        }
      }, { passive: false });
    }
  };
  $$('[data-glisse]').forEach((p) => glisser(p));

  /* ---------------------------------------------------------- guide « quel tissage ? » */
  $$('[data-guide]').forEach((g) => {
    const etapes = $$('[data-guide-etape]', g);
    const montrer = (id) => {
      etapes.forEach((e) => { e.hidden = e.dataset.guideEtape !== id; });
      const cible = etapes.find((e) => !e.hidden);
      const titre = cible && $('h3', cible);
      if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus({ preventScroll: true }); }
    };
    g.addEventListener('click', (e) => {
      const b = e.target.closest('[data-aller]');
      if (b) { montrer(b.dataset.aller); return; }
      if (e.target.closest('[data-guide-recommencer]')) montrer('q1');
    });
  });

  /* ---------------------------------------------------------- formations : objectif → programme */
  const guideFormations = $('[data-formations-guide]');
  if (guideFormations) {
    guideFormations.addEventListener('click', (e) => {
      const b = e.target.closest('[data-formation-cible]');
      if (!b) return;
      $$('[data-formation-cible]', guideFormations).forEach((x) => x.classList.toggle('choisi', x === b));
      $$('.tarif').forEach((t) => t.classList.toggle('illumine', t.id === b.dataset.formationCible));
      const cible = d.getElementById(b.dataset.formationCible);
      if (cible) cible.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ---------------------------------------------------------- curseurs : remplissage de la piste */
  const remplir = (r) => r.style.setProperty('--p', `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
  $$('input[type="range"]').forEach((r) => { remplir(r); r.addEventListener('input', () => remplir(r)); });

  window.CRV_UI = { animer, glisser, reduit, fin };
})();

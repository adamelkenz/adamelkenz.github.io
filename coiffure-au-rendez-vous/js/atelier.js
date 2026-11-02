/* Atelier de confection : la chevelure se dessine mèche par mèche selon la base, la texture,
   la longueur et la couleur choisies ; le projet part ensuite sur WhatsApp.
   Mode « styling » (page nattes & brushing) : seule l'allure change. */
(() => {
  'use strict';
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const WHATSAPP = '33762747882';
  const TEXTURES = {
    lisse: { A: .6, lambda: 80, var: .05, ecart: .035, nom: 'lisse' },
    wave: { A: 9, lambda: 66, var: .16, ecart: .07, nom: 'body wave' },
    boucle: { A: 9.5, lambda: 21, var: .9, ecart: .13, nom: 'bouclée' },
  };
  const REPERES = [[10, 'menton'], [14, 'épaules'], [18, 'poitrine'], [22, 'mi-dos'], [26, 'taille'], [30, 'hanches']];
  const BASES = {
    frontal: 'M134 172C136 110 168 84 200 84C232 84 264 110 266 172',
    closure: 'M176 74Q200 64 224 74L222 116Q200 110 178 116Z',
  };
  const yFin = (L) => 246 + (L - 10) * 14.95;
  const N = 16;

  document.querySelectorAll('[data-atelier]').forEach((bloc) => {
    const mode = bloc.dataset.atelier;
    const svg = bloc.querySelector('.atelier-svg');
    const gCheveux = svg.querySelector('[data-cheveux]');
    const base = svg.querySelector('[data-base]');
    const gReperes = svg.querySelector('[data-reperes]');
    const chemins = [];
    for (let i = 0; i < N * 2; i++) {
      const p = document.createElementNS(NS, 'path');
      gCheveux.appendChild(p);
      chemins.push(p);
    }
    const reperes = [];
    if (mode === 'complet') {
      REPERES.forEach(([L, nom]) => {
        const g = document.createElementNS(NS, 'g');
        const y = yFin(L);
        g.innerHTML = `<line x1="334" x2="396" y1="${y}" y2="${y}"/><text x="396" y="${y - 5}" text-anchor="end">${L}"</text><text x="396" y="${y + 12}" text-anchor="end">${nom}</text>`;
        gReperes.appendChild(g);
        reperes.push([L, nom, g]);
      });
    }

    const choix = () => {
      const val = (n) => { const e = bloc.querySelector(`input[name="${n}"]:checked`); return e ? e.value : null; };
      const texture = val(`texture-${mode}`) || 'lisse';
      const r = bloc.querySelector('[data-longueur]');
      const coul = bloc.querySelector('input[name="couleur"]:checked');
      return {
        texture,
        L: r ? +r.value : 22,
        base: val('base') || 'frontal',
        teinte: coul ? coul.dataset.teinte : '#efe6df',
        couleur: coul ? coul.value : 'noir',
        couleurNom: coul ? coul.parentElement.textContent.trim() : '',
      };
    };

    /* état animé */
    const cible = { L: 22, A: 0, lambda: 80, var: .05, ecart: .035 };
    const etat = { ...cible };
    let teinte = '#efe6df'; let meches = false;

    const tracer = (temps) => {
      const yE = yFin(etat.L);
      for (let s = -1, k = 0; s <= 1; s += 2) {
        for (let j = 0; j < N; j++, k++) {
          const th = ((j + .5) / N) * (Math.PI / 2) * .96;
          const sx = 200 + s * Math.sin(th) * 70;
          const sy = 172 - Math.cos(th) * 96;
          const hx = 200 + s * (74 + (N - 1 - j) * 2.6);
          const fin = yE - (j % 3) * 5;
          const phase = j * etat.var + (s > 0 ? .4 : 0) + temps;
          let d = `M${sx.toFixed(1)} ${sy.toFixed(1)}C${(sx + s * 26 * (1 - j / N)).toFixed(1)} ${(sy - 6).toFixed(1)} ${(hx + s * 6).toFixed(1)} 118 ${hx.toFixed(1)} 180`;
          for (let y = 187; y <= fin; y += 7) {
            const env = Math.min(1, (y - 180) / 60);
            const x = hx + s * (y - 180) * (etat.ecart + j * .0016) + etat.A * env * Math.sin(((y - 180) / etat.lambda) * Math.PI * 2 + phase);
            d += `L${x.toFixed(1)} ${y}`;
          }
          chemins[k].setAttribute('d', d);
          chemins[k].style.stroke = meches && j >= N - 4 ? '#e2c58f' : teinte;
        }
      }
    };

    let raf = 0; let derniere = 0;
    const balancement = () => (reduit ? 0 : Math.sin(performance.now() / 1400) * .25);
    const pas = (t) => {
      const dt = Math.min(50, t - (derniere || t)); derniere = t;
      const k = 1 - Math.pow(.0015, dt / 1000);
      let reste = 0;
      for (const c of Object.keys(cible)) {
        etat[c] += (cible[c] - etat[c]) * k;
        reste += Math.abs(cible[c] - etat[c]);
      }
      tracer(balancement());
      raf = requestAnimationFrame(pas);
      if (reste < .01 && reduit) { cancelAnimationFrame(raf); raf = 0; }
    };

    const appliquer = (instantane) => {
      const c = choix();
      const tx = TEXTURES[c.texture];
      Object.assign(cible, { L: c.L, A: tx.A, lambda: tx.lambda, var: tx.var, ecart: tx.ecart });
      teinte = c.teinte; meches = c.couleur === 'meches';
      if (base) base.setAttribute('d', BASES[c.base]);
      if (instantane || reduit) Object.assign(etat, cible);
      if (mode === 'complet') {
        const sortie = bloc.querySelector('[data-longueur-sortie]');
        const repere = [...REPERES].reverse().find(([L]) => L <= c.L) || REPERES[0];
        sortie.textContent = `${c.L} pouces · ${Math.round(c.L * 2.54)} cm`;
        bloc.querySelector('[data-longueur-texte]').textContent = `${c.L}"`;
        bloc.querySelector('[data-repere]').textContent = repere[1];
        reperes.forEach(([L, , g]) => g.classList.toggle('actif', L === repere[0]));
        const notes = bloc.querySelector('textarea[name="notes"]').value.trim();
        const msg = `Bonjour, je souhaite une confection de perruque :\n- base : ${c.base === 'frontal' ? 'lace frontal' : 'closure'}\n- texture : ${tx.nom}\n- longueur : ${c.L} pouces (${Math.round(c.L * 2.54)} cm)\n- couleur : ${c.couleurNom.toLowerCase()}${notes ? `\n- précisions : ${notes}` : ''}\nPouvez-vous me conseiller ? Merci !`;
        bloc.querySelector('[data-atelier-whatsapp]').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
      }
      if (!raf) { derniere = 0; raf = requestAnimationFrame(pas); }
    };

    bloc.addEventListener('input', () => appliquer(false));
    bloc.addEventListener('change', () => appliquer(false));
    let visible = false;
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) { derniere = 0; raf = requestAnimationFrame(pas); }
      if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
    }).observe(svg);
    /* première apparition : les cheveux poussent depuis la racine */
    appliquer(true);
    if (!reduit) { etat.L = 10; etat.A = 0; }
    tracer(0);
  });
})();

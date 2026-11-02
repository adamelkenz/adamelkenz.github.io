/* Réservation : total, durée, acompte et dates clés calculés en direct, message prêt pour WhatsApp ou SMS.
   Aussi : calcul de la date de dépôt d'une perruque extérieure (page Pose perruque). */
(() => {
  'use strict';
  const D = window.CRV;
  if (!D) return;
  const P = D.politique;
  const presta = Object.fromEntries(D.prestations.map((p) => [p.id, p]));
  const euros = (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v);
  const duree = (m) => { const h = Math.floor(m / 60); const r = m % 60; return h ? `${h} h${r ? ` ${String(r).padStart(2, '0')}` : ''}` : `${r} min`; };
  const aujourdhui = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const lireDate = (v) => { if (!v) return null; const [y, m, j] = v.split('-').map(Number); return new Date(y, m - 1, j); };
  const versChamp = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  const plus = (dt, j) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + j);
  const jolie = (dt) => dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', ...(dt.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}) });

  /* ---------------------------------------------------------- date de dépôt d'une perruque extérieure */
  document.querySelectorAll('[data-calcul-depot]').forEach((bloc) => {
    const champ = bloc.querySelector('[data-calcul-date]');
    const sortie = bloc.querySelector('[data-calcul-sortie]');
    champ.min = versChamp(aujourdhui());
    champ.addEventListener('input', () => {
      const rdv = lireDate(champ.value);
      if (!rdv) return;
      const depot = plus(rdv, -P.depot_perruque_j);
      if (depot < aujourdhui()) {
        sortie.innerHTML = `Trop juste pour cette date&nbsp;: la perruque doit être déposée ${P.depot_perruque_j}&nbsp;jours avant. Premier rendez-vous possible&nbsp;: <strong>${jolie(plus(aujourdhui(), P.depot_perruque_j))}</strong>.`;
      } else {
        sortie.innerHTML = `Déposez votre perruque à l'institut au plus tard le <strong>${jolie(depot)}</strong>. <a href="../reserver/?p=pose-wig-exterieure&amp;d=${champ.value}">Réserver la pose pour le ${jolie(rdv)}</a>`;
      }
    });
  });

  /* ---------------------------------------------------------- formulaire de réservation */
  const form = document.querySelector('[data-rdv]');
  if (!form) return;
  const ticket = document.querySelector('[data-ticket]');
  const q = (s) => ticket.querySelector(s);
  const champDate = form.querySelector('[data-rdv-date]');
  champDate.min = versChamp(aujourdhui());

  /* préremplissage depuis l'adresse : ?p=pose-closure&p=nattes-sous-perruque&d=2026-12-14&n=… */
  const params = new URLSearchParams(location.search);
  const voulus = params.getAll('p').flatMap((v) => v.split(','));
  voulus.forEach((id) => { const c = form.querySelector(`input[name="p"][value="${CSS.escape(id)}"]`); if (c) c.checked = true; });
  if (params.get('d') && /^\d{4}-\d{2}-\d{2}$/.test(params.get('d'))) champDate.value = params.get('d');
  if (params.get('n')) form.querySelector('textarea[name="notes"]').value = params.get('n').slice(0, 300);

  let totalAffiche = 0; let animTotal = 0;
  const animerTotal = (cible) => {
    cancelAnimationFrame(animTotal);
    const depart = totalAffiche; const t0 = performance.now();
    const el = q('[data-ticket-total]');
    const pas = (t) => {
      const p = Math.min(1, (t - t0) / 500);
      totalAffiche = depart + (cible - depart) * (1 - Math.pow(1 - p, 3));
      el.textContent = cible ? euros(Math.round(totalAffiche)) : '—';
      if (p < 1) animTotal = requestAnimationFrame(pas); else { totalAffiche = cible; el.textContent = cible ? euros(cible) : '—'; }
    };
    animTotal = requestAnimationFrame(pas);
  };

  let message = '';
  const maj = () => {
    const choisis = [...form.querySelectorAll('input[name="p"]:checked')].map((c) => presta[c.value]).filter(Boolean);
    const total = choisis.reduce((s, p) => s + p.prix, 0);
    const minutes = choisis.reduce((s, p) => s + p.duree, 0);
    const acompte = Math.round(total * P.acompte_pct) / 100;
    const lignes = q('[data-ticket-lignes]');
    lignes.innerHTML = '';
    if (!choisis.length) {
      lignes.innerHTML = '<li class="ticket-vide">Sélectionnez une ou plusieurs prestations.</li>';
    } else {
      choisis.forEach((p) => {
        const li = document.createElement('li');
        const a = document.createElement('span'); a.textContent = `${p.nom} · ${p.jours || duree(p.duree)}`;
        const b = document.createElement('span'); b.textContent = euros(p.prix);
        li.append(a, b); lignes.appendChild(li);
      });
    }
    animerTotal(total);
    q('[data-ticket-duree]').textContent = minutes ? duree(minutes) : '—';
    q('[data-ticket-acompte]').textContent = total ? euros(acompte) : '—';

    /* dates clés */
    const dates = q('[data-ticket-dates]');
    dates.innerHTML = '';
    const ajouter = (html) => { const li = document.createElement('li'); li.innerHTML = html; dates.appendChild(li); };
    const rdv = lireDate(champDate.value);
    const exterieure = choisis.some((p) => p.id === 'pose-wig-exterieure');
    if (rdv) {
      const limite = plus(rdv, -Math.ceil(P.annulation_h / 24));
      if (limite < aujourdhui()) ajouter(`Votre date est dans moins de ${P.annulation_h}&nbsp;h&nbsp;: appelez l'institut au ${D.tel} pour vérifier la disponibilité.`);
      else ajouter(`Modification ou annulation possible jusqu'au <strong>${jolie(limite)}</strong> (${P.annulation_h}&nbsp;h avant).`);
      if (exterieure) {
        const depot = plus(rdv, -P.depot_perruque_j);
        if (depot < aujourdhui()) ajouter(`Perruque extérieure&nbsp;: dépôt ${P.depot_perruque_j}&nbsp;jours avant impossible pour cette date. Choisissez au plus tôt le <strong>${jolie(plus(aujourdhui(), P.depot_perruque_j))}</strong>.`);
        else ajouter(`Déposez votre perruque à l'institut au plus tard le <strong>${jolie(depot)}</strong>.`);
      }
    } else if (exterieure) {
      ajouter(`Perruque extérieure&nbsp;: à déposer à l'institut <strong>${P.depot_perruque_j}&nbsp;jours avant</strong> le rendez-vous.`);
    }
    if (choisis.length) ajouter(`Retard toléré&nbsp;: <strong>${P.retard_min}&nbsp;minutes</strong>.`);

    /* message */
    const moment = form.querySelector('input[name="moment"]:checked').value;
    const prenom = form.querySelector('input[name="prenom"]').value.trim();
    const notes = form.querySelector('textarea[name="notes"]').value.trim();
    message = [
      `Bonjour ${D.nom}, je souhaite prendre rendez-vous.`,
      '',
      'Prestations :',
      ...choisis.map((p) => `- ${p.nom} (${euros(p.prix)})`),
      `Total : ${euros(total)} · durée estimée ${duree(minutes)}`,
      rdv ? `Date souhaitée : ${jolie(rdv)}${moment ? `, ${moment}` : ''}` : (moment ? `Moment préféré : ${moment}` : 'Date : à convenir'),
      prenom ? `Prénom : ${prenom}` : null,
      notes ? `Précisions : ${notes}` : null,
      '',
      `J'ai bien noté l'acompte de ${P.acompte_pct} % (${euros(acompte)}) pour confirmer le rendez-vous. Merci !`,
    ].filter((l) => l !== null).join('\n');
    q('[data-ticket-message]').textContent = choisis.length ? message : 'Le message apparaît ici dès qu’une prestation est choisie.';
    const actif = choisis.length > 0;
    const wa = q('[data-envoi="whatsapp"]'); const sms = q('[data-envoi="sms"]');
    wa.href = `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(message)}`;
    sms.href = `sms:${D.telIntl}?&body=${encodeURIComponent(message)}`;
    [wa, sms].forEach((b) => { b.setAttribute('aria-disabled', String(!actif)); b.tabIndex = actif ? 0 : -1; });
  };

  form.addEventListener('input', maj);
  form.addEventListener('change', maj);
  const copier = q('[data-copier]');
  copier.addEventListener('click', async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      copier.textContent = 'Message copié ✓';
    } catch (e) {
      copier.textContent = 'Copie impossible : sélectionnez l’aperçu';
      q('.ticket-apercu').open = true;
    }
    setTimeout(() => { copier.textContent = 'Copier le message'; }, 2400);
  });
  maj();
})();

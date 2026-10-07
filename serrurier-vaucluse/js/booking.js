// Formulaire de demande : vérifie les créneaux libres et crée le rendez-vous dans Google Agenda
// via l'application web Google Apps Script (URL dans l'attribut data-endpoint du formulaire).
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Numéro affiché dans les messages d'erreur (attribut data-phone du formulaire)
  const PHONE = form.dataset.phone || '06 68 88 51 51';
  // Doit correspondre à CONFIG.SLOTS dans _outils/google-apps-script/Code.gs
  const SLOTS = [
    ['08-10', '8h – 10h', 8],
    ['10-12', '10h – 12h', 10],
    ['14-16', '14h – 16h', 14],
    ['16-18', '16h – 18h', 16],
    ['18-20', '18h – 20h', 18]
  ];

  const f = form.elements;
  const msg = document.getElementById('formMsg');
  const btn = form.querySelector('button[type="submit"]');
  const slotFields = document.getElementById('slotFields');
  const endpoint = () => (form.dataset.endpoint || '').trim();

  const pad = n => String(n).padStart(2, '0');
  const isoDay = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const maxDay = new Date();
  maxDay.setDate(maxDay.getDate() + 60);
  f.date.min = isoDay(new Date());
  f.date.max = isoDay(maxDay);

  function show(text, isError) {
    msg.textContent = text;
    msg.className = 'form-msg show' + (isError ? ' error' : '');
  }

  function fillSlots(busy) {
    const day = f.date.value;
    f.creneau.innerHTML = '';
    if (!day) {
      f.creneau.add(new Option("Choisissez une date", ''));
      return;
    }
    f.creneau.add(new Option('Choisissez un créneau', ''));
    const now = new Date();
    const isToday = day === isoDay(now);
    let free = 0;
    SLOTS.forEach(([value, label, startHour]) => {
      const past = isToday && startHour <= now.getHours();
      const taken = !!busy && busy.includes(value);
      const o = new Option(label + (taken ? ' — complet' : past ? ' — passé' : ''), value);
      o.disabled = taken || past;
      if (!o.disabled) free++;
      f.creneau.add(o);
    });
    if (!free) f.creneau.options[0].text = 'Aucun créneau libre ce jour-là';
  }

  // Interroge l'agenda pour griser les créneaux déjà pris
  let lastRequest = 0;
  async function loadSlots() {
    fillSlots(null);
    const day = f.date.value;
    if (!day || !endpoint()) return;
    const id = ++lastRequest;
    f.creneau.disabled = true;
    f.creneau.options[0].text = 'Vérification des disponibilités…';
    try {
      const res = await fetch(endpoint() + '?date=' + encodeURIComponent(day));
      const data = await res.json();
      if (id === lastRequest) fillSlots(data.ok ? data.busy : null);
    } catch (e) {
      if (id === lastRequest) fillSlots(null); // le serveur revérifiera à l'envoi
    } finally {
      if (id === lastRequest) f.creneau.disabled = false;
    }
  }

  function syncUrgent() {
    const on = f.urgent.checked;
    slotFields.classList.toggle('off', on);
    f.date.required = f.creneau.required = !on;
  }

  function validate() {
    const errors = [];
    const mark = (el, bad) => el.setAttribute('aria-invalid', bad ? 'true' : 'false');
    const nom = f.nom.value.trim();
    const tel = f.tel.value.trim();
    const email = f.email.value.trim();
    const telOk = /^[+0-9 ().-]{8,20}$/.test(tel) && tel.replace(/\D/g, '').length >= 9;
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    mark(f.nom, !nom);
    mark(f.tel, !telOk);
    mark(f.email, !emailOk);
    if (!nom) errors.push('votre nom');
    if (!telOk) errors.push('un numéro de téléphone valide');
    if (!emailOk) errors.push('un e-mail valide (ou laissez le champ vide)');
    if (!f.urgent.checked) {
      mark(f.date, !f.date.value);
      mark(f.creneau, !!f.date.value && !f.creneau.value);
      if (!f.date.value) errors.push('une date');
      else if (!f.creneau.value) errors.push('un créneau');
    }
    return errors;
  }

  f.date.addEventListener('change', loadSlots);
  f.urgent.addEventListener('change', syncUrgent);
  form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      show("Merci d'indiquer " + errors.join(', ') + '.', true);
      return;
    }
    if (!endpoint()) {
      // Pas encore de prise de rendez-vous en ligne : on prépare un SMS avec la demande
      const lignes = [
        'Demande d\'intervention',
        `Nom : ${f.nom.value.trim()}`, `Tél : ${f.tel.value.trim()}`,
        f.ville.value.trim() && `Ville : ${f.ville.value.trim()}`,
        `Prestation : ${f.prestation.value}`,
        f.urgent.checked ? 'URGENT : dès que possible' : `Souhaité : ${f.date.value} ${f.creneau.options[f.creneau.selectedIndex].text}`,
        f.message.value.trim()
      ].filter(Boolean).join('\n');
      const intl = '+33' + PHONE.replace(/\D/g, '').replace(/^0/, '');
      if (window.matchMedia('(pointer: coarse)').matches) {
        show(`Votre application SMS s'ouvre avec votre demande : il ne reste qu'à l'envoyer. Pour une urgence, appelez le ${PHONE}.`);
        window.location.href = `sms:${intl}?&body=${encodeURIComponent(lignes)}`;
      } else {
        show(`Pour nous transmettre votre demande, appelez ou envoyez un SMS au ${PHONE}. Nous vous rappelons rapidement.`);
      }
      return;
    }

    const payload = {
      nom: f.nom.value.trim(),
      tel: f.tel.value.trim(),
      email: f.email.value.trim(),
      ville: f.ville.value.trim(),
      prestation: f.prestation.value,
      message: f.message.value.trim(),
      urgent: f.urgent.checked,
      date: f.date.value,
      creneau: f.creneau.value,
      website: f.website.value // piège à robots
    };

    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';
    try {
      // text/plain évite la requête préalable CORS, que Google Apps Script ne gère pas
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        show(data.urgent
          ? `Demande urgente reçue. Un serrurier vous rappelle au ${payload.tel} dans les plus brefs délais.`
          : `Merci ! Votre rendez-vous est enregistré pour le ${data.when}. Nous vous rappelons pour le confirmer.`);
        form.reset();
        syncUrgent();
        fillSlots(null);
      } else if (data.error === 'pris' || data.error === 'passe') {
        show("Ce créneau n'est plus disponible. Choisissez-en un autre.", true);
        loadSlots();
      } else {
        show(`Votre demande n'a pas pu être enregistrée. Appelez-nous au ${PHONE}.`, true);
      }
    } catch (err) {
      show(`Connexion impossible pour le moment. Appelez-nous au ${PHONE}.`, true);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  syncUrgent();
})();

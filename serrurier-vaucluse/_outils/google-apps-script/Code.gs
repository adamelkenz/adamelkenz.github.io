/**
 * Serrurier Vaucluse : prise de rendez-vous du site dans Google Agenda.
 *
 * GET  ?date=AAAA-MM-JJ  → { ok: true, busy: ['08-10', ...] }  créneaux déjà pris ce jour-là
 * POST (JSON en text/plain) → crée l'événement dans l'agenda et prévient le serrurier par e-mail
 *      → { ok: true, when: 'mardi 14 octobre, 10h – 12h' } ou { ok: true, urgent: true }
 *      → { ok: false, error: 'pris' | 'passe' | 'invalide' }
 *
 * Installation : voir INSTALLATION.md.
 */
const CONFIG = {
  CALENDAR_ID: 'primary',        // agenda principal du compte qui déploie le script
  NOTIFY_EMAIL: '',              // e-mail qui reçoit les demandes ; vide = compte qui déploie le script
  BUSINESS: 'Serrurier Vaucluse',
  PHONE: '06 68 88 51 51',
  MAX_DAYS: 60,                  // réservation possible jusqu'à J+60
  URGENT_MINUTES: 60,            // durée du créneau bloqué pour une urgence
  // Doit correspondre à SLOTS dans js/booking.js
  SLOTS: { '08-10': [8, 10], '10-12': [10, 12], '14-16': [14, 16], '16-18': [16, 18], '18-20': [18, 20] },
};

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function doGet(e) {
  const day = String((e && e.parameter && e.parameter.date) || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return json({ ok: false, error: 'invalide' });
  return json({ ok: true, busy: busySlots(day) });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'invalide' }); }
  if (d.website) return json({ ok: true, urgent: !!d.urgent, when: '' });   // piège à robots : on ignore
  const nom = clean(d.nom, 80), tel = clean(d.tel, 20);
  if (!nom || tel.replace(/\D/g, '').length < 9) return json({ ok: false, error: 'invalide' });
  const info = {
    nom, tel, email: clean(d.email, 120), ville: clean(d.ville, 60),
    prestation: clean(d.prestation, 60) || 'Autre', message: clean(d.message, 1000),
  };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    if (d.urgent) {
      const start = new Date(), end = new Date(start.getTime() + CONFIG.URGENT_MINUTES * 60000);
      cal.createEvent('🚨 URGENT – ' + info.prestation + ' – ' + nom, start, end, { description: describe(info, 'URGENCE : rappeler dès que possible'), location: info.ville });
      notify('🚨 Demande URGENTE – ' + info.prestation + ' – ' + (info.ville || 'ville non précisée'), info, 'URGENCE : rappeler dès que possible');
      return json({ ok: true, urgent: true });
    }

    const day = String(d.date || ''), slot = String(d.creneau || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !CONFIG.SLOTS[slot]) return json({ ok: false, error: 'invalide' });
    const [start, end] = slotRange(day, slot);
    const now = new Date(), max = new Date(now.getTime() + CONFIG.MAX_DAYS * 86400000);
    if (start <= now || start > max) return json({ ok: false, error: 'passe' });
    if (busySlots(day).indexOf(slot) !== -1) return json({ ok: false, error: 'pris' });

    const when = label(start, slot);
    cal.createEvent(info.prestation + ' – ' + nom, start, end, { description: describe(info, 'Rendez-vous : ' + when), location: info.ville });
    notify('Nouveau rendez-vous – ' + when + ' – ' + info.prestation, info, 'Rendez-vous : ' + when);
    if (info.email) {
      MailApp.sendEmail({
        to: info.email, name: CONFIG.BUSINESS,
        subject: 'Votre demande de rendez-vous – ' + CONFIG.BUSINESS,
        body: 'Bonjour ' + nom + ',\n\nNous avons bien reçu votre demande pour le ' + when + ' (' + info.prestation + ').\n' +
              'Nous vous rappelons pour la confirmer. Pour toute urgence : ' + CONFIG.PHONE + '.\n\n' + CONFIG.BUSINESS,
      });
    }
    return json({ ok: true, when });
  } finally {
    lock.releaseLock();
  }
}

// Créneaux du jour qui chevauchent un événement de l'agenda
function busySlots(day) {
  const cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  const [d0] = slotRange(day, '08-10');
  const from = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), 0, 0);
  const to = new Date(from.getTime() + 86400000);
  const events = cal.getEvents(from, to).filter(ev => !ev.isAllDayEvent() && ev.getMyStatus() !== CalendarApp.GuestStatus.NO);
  return Object.keys(CONFIG.SLOTS).filter(slot => {
    const [s, e] = slotRange(day, slot);
    return events.some(ev => ev.getStartTime() < e && ev.getEndTime() > s);
  });
}

function slotRange(day, slot) {
  const p = day.split('-').map(Number), h = CONFIG.SLOTS[slot];
  return [new Date(p[0], p[1] - 1, p[2], h[0], 0), new Date(p[0], p[1] - 1, p[2], h[1], 0)];
}

function label(start, slot) {
  const h = CONFIG.SLOTS[slot];
  return JOURS[start.getDay()] + ' ' + start.getDate() + ' ' + MOIS[start.getMonth()] + ', ' + h[0] + 'h – ' + h[1] + 'h';
}

function describe(i, head) {
  return [head, '', 'Nom : ' + i.nom, 'Téléphone : ' + i.tel,
          i.email ? 'E-mail : ' + i.email : null, i.ville ? 'Ville : ' + i.ville : null,
          'Prestation : ' + i.prestation, i.message ? '\nMessage :\n' + i.message : null, '', 'Demande envoyée depuis le site.']
    .filter(x => x !== null).join('\n');
}

function notify(subject, info, head) {
  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail(),
    subject, body: describe(info, head) + '\n\nRappeler : ' + info.tel,
    replyTo: info.email || undefined,
  });
}

function clean(v, max) { return String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// À lancer une fois depuis l'éditeur pour accorder les autorisations (Agenda + e-mail)
function autoriser() {
  CalendarApp.getCalendarById(CONFIG.CALENDAR_ID).getName();
  Logger.log('Agenda : ' + CalendarApp.getCalendarById(CONFIG.CALENDAR_ID).getName() + ' – quota e-mails restant : ' + MailApp.getRemainingDailyQuota());
}

/* Flawless — préparation de la demande de rendez-vous (soins, jours, moment), envoyée par SMS. */
(function () {
  var I = window.INSTITUT || { horaires: {} };
  var form = document.querySelector('.rdv-choix');
  if (!form) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var NOMS = {
    epilation: 'Épilation', visage: 'Soin visage', massage: 'Massage relaxant', browlift: 'Brow lift',
    cils: 'Rehaussement de cils', sourcils: 'Restructuration des sourcils', microblading: 'Microblading'
  };
  var MOMENTS = { matin: 'le matin', midi: 'entre midi et deux', 'apres-midi': 'l\'après-midi', fin: 'en fin de journée' };
  var etat = { soins: [], zones: [], jours: [], moment: '' };

  var apercu = document.querySelector('[data-apercu]');
  var retour = document.querySelector('.carte-rdv-retour');
  var zones = document.querySelector('[data-zones]');
  var prenom = document.getElementById('prenom');
  var visite = document.getElementById('visite');
  var mot = document.getElementById('mot');
  var sms = document.querySelector('[data-envoi="sms"]');
  var appel = document.querySelector('[data-envoi="appel"]');
  var noteSamedi = document.querySelector('[data-note-samedi]');

  /* ---------- jours : les six prochains jours d'ouverture ---------- */
  var conteneurJours = document.querySelector('[data-groupe="jours"]');
  var court = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  var long = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var moisCourt = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var jours = [];
  (function () {
    var d = new Date(); d.setHours(12, 0, 0, 0);
    var maintenant = new Date().getHours() + new Date().getMinutes() / 60;
    var aujourdHui = I.horaires[d.getDay()] || [];
    // aujourd'hui seulement s'il reste au moins deux heures d'ouverture
    if (!aujourdHui.length || aujourdHui[aujourdHui.length - 1][1] - maintenant < 2) d.setDate(d.getDate() + 1);
    for (var n = 0; jours.length < 6 && n < 21; n++) {
      if ((I.horaires[d.getDay()] || []).length) jours.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  })();
  jours.forEach(function (d, k) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'jour'; b.setAttribute('aria-pressed', 'false');
    b.setAttribute('data-valeur', k);
    b.setAttribute('aria-label', long[d.getDay()] + ' ' + d.getDate() + ' ' + mois[d.getMonth()]);
    b.innerHTML = '<small>' + court[d.getDay()] + '</small><strong>' + d.getDate() + '</strong><small>' + moisCourt[d.getMonth()] + '</small>';
    conteneurJours.appendChild(b);
  });

  /* ---------- sélections ---------- */
  function basculer(liste, v) {
    var i = liste.indexOf(v);
    if (i < 0) liste.push(v); else liste.splice(i, 1);
  }
  form.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-valeur]');
    if (!b || b.disabled) return;
    var groupe = b.parentNode.getAttribute('data-groupe');
    var v = b.getAttribute('data-valeur');
    if (groupe === 'soins') basculer(etat.soins, v);
    else if (groupe === 'zones') basculer(etat.zones, v);
    else if (groupe === 'jours') basculer(etat.jours, +v);
    else if (groupe === 'moment') etat.moment = etat.moment === v ? '' : v;
    synchroniser();
  });
  [prenom, visite, mot].forEach(function (el) { el.addEventListener('input', rediger); el.addEventListener('change', rediger); });

  function synchroniser() {
    form.querySelectorAll('[data-groupe="soins"] [data-valeur]').forEach(function (b) { b.setAttribute('aria-pressed', etat.soins.indexOf(b.getAttribute('data-valeur')) > -1); });
    form.querySelectorAll('[data-groupe="zones"] [data-valeur]').forEach(function (b) { b.setAttribute('aria-pressed', etat.zones.indexOf(b.getAttribute('data-valeur')) > -1); });
    form.querySelectorAll('[data-groupe="jours"] [data-valeur]').forEach(function (b) { b.setAttribute('aria-pressed', etat.jours.indexOf(+b.getAttribute('data-valeur')) > -1); });
    zones.hidden = etat.soins.indexOf('epilation') < 0;
    // le samedi, l'institut ferme à midi
    var choisis = etat.jours.map(function (k) { return jours[k]; });
    var samedi = choisis.some(function (d) { return d.getDay() === 6; });
    var queSamedi = choisis.length > 0 && choisis.every(function (d) { return d.getDay() === 6; });
    noteSamedi.hidden = !samedi;
    form.querySelectorAll('[data-groupe="moment"] [data-valeur]').forEach(function (b) {
      var v = b.getAttribute('data-valeur');
      b.disabled = queSamedi && v !== 'matin';
      if (b.disabled && etat.moment === v) etat.moment = '';
      b.setAttribute('aria-pressed', etat.moment === v);
    });
    rediger();
  }

  /* ---------- rédaction de la demande ---------- */
  function listeFr(t) { return t.length < 2 ? t.join('') : t.slice(0, -1).join(', ') + ' ou ' + t[t.length - 1]; }
  function texteJours() {
    var choisis = etat.jours.slice().sort(function (a, b) { return a - b; }).map(function (k) { return jours[k]; });
    if (!choisis.length) return '';
    var morceaux = choisis.map(function (d, i) {
      var memeMois = i < choisis.length - 1 && choisis[i + 1].getMonth() === d.getMonth();
      return long[d.getDay()] + ' ' + (d.getDate() === 1 ? '1er' : d.getDate()) + (memeMois ? '' : ' ' + mois[d.getMonth()]);
    });
    return listeFr(morceaux);
  }
  function texteDemande() {
    if (!etat.soins.length) return '';
    var lignes = ['Bonjour, je souhaiterais prendre rendez-vous chez Flawless pour :'];
    etat.soins.forEach(function (s) {
      var l = '• ' + NOMS[s];
      if (s === 'epilation' && etat.zones.length) l += ' (' + etat.zones.join(', ').toLowerCase() + ')';
      lignes.push(l);
    });
    var j = texteJours();
    var m = etat.moment ? MOMENTS[etat.moment] : '';
    if (j || m) lignes.push('', 'Mes disponibilités : ' + (j || 'quand cela vous arrange') + (m ? ', plutôt ' + m : '') + '.');
    if (visite.value === 'oui') lignes.push('C\'est ma première visite à l\'institut.');
    if (mot.value.trim()) lignes.push('', mot.value.trim());
    lignes.push('', 'Merci !' + (prenom.value.trim() ? ' ' + prenom.value.trim() : ''));
    return lignes.join('\n');
  }

  var dernier = null;
  function rediger() {
    var t = texteDemande();
    apercu.classList.toggle('vide', !t);
    apercu.textContent = t || 'Choisissez au moins un soin : votre demande s\'écrira ici, prête à être envoyée.';
    if (t && dernier !== null && t !== dernier && !calme) {
      apercu.classList.remove('maj'); void apercu.offsetWidth; apercu.classList.add('maj');
    }
    dernier = t;
    var corps = encodeURIComponent(t);
    if (I.tel && I.mobile) sms.href = 'sms:' + I.tel + (t ? '?&body=' + corps : '');
    if (I.tel) appel.href = 'tel:' + I.tel;
    retour.textContent = '';
  }
  sms.hidden = !(I.tel && I.mobile);
  appel.hidden = !I.tel;
  sms.addEventListener('click', function (e) {
    if (!texteDemande()) { e.preventDefault(); retour.textContent = 'Choisissez d\'abord le ou les soins qui vous font envie.'; form.querySelector('[data-groupe="soins"] button').focus(); }
  });

  document.querySelector('[data-copier]').addEventListener('click', function () {
    var t = texteDemande();
    if (!t) { retour.textContent = 'Choisissez d\'abord le ou les soins qui vous font envie.'; return; }
    function ok() { retour.textContent = 'Demande copiée. Collez-la dans un SMS au ' + (I.telAffiche || I.tel) + '.'; }
    function repli() {
      var zone = document.createElement('textarea');
      zone.value = t; zone.setAttribute('readonly', ''); zone.style.position = 'fixed'; zone.style.opacity = '0';
      document.body.appendChild(zone); zone.select();
      try { document.execCommand('copy'); ok(); } catch (e) { retour.textContent = 'Copie impossible : sélectionnez le texte de la carte.'; }
      zone.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, repli);
    else repli();
  });

  /* ---------- « Ajouter à mon rendez-vous » depuis la liste des soins ---------- */
  var cibles = { epilation: ['epilation'], visage: ['visage'], massage: ['massage'], microblading: ['microblading'], regard: [] };
  document.querySelectorAll('[data-ajouter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cle = b.getAttribute('data-ajouter');
      cibles[cle].forEach(function (s) { if (etat.soins.indexOf(s) < 0) etat.soins.push(s); });
      synchroniser();
      b.classList.add('ajoute');
      b.firstChild.textContent = cle === 'regard' ? 'Choisir mon soin du regard ' : 'Ajouté à mon rendez-vous ';
      document.getElementById('rendez-vous').scrollIntoView({ behavior: calme ? 'auto' : 'smooth' });
      if (cle === 'regard') {
        // trois soins possibles : on les met en avant pour laisser choisir
        ['browlift', 'cils', 'sourcils'].forEach(function (s, k) {
          var p = form.querySelector('[data-valeur="' + s + '"]');
          if (!p || calme) return;
          setTimeout(function () { p.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)', borderColor: '#9a6a4f' }, { transform: 'scale(1)' }], { duration: 700, easing: 'ease-out' }); }, 700 + k * 140);
        });
      }
    });
  });

  synchroniser();
})();

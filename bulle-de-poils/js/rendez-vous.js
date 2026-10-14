/* Bulle de poils — préparation de la demande de rendez-vous (animal, soins, commune, jours), envoyée par SMS. */
(function () {
  var T = window.TOILETTEUSE || { horaires: {} };
  var Z = window.ZONE;
  var form = document.querySelector('.rdv-choix');
  if (!form) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var NOMS = {
    bain: 'Bain et séchage', tonte: 'Tonte', ciseaux: 'Coupe aux ciseaux', epilation: 'Épilation',
    demelage: 'Démêlage', debourrage: 'Débourrage', hygiene: 'Soins d\'hygiène', conseil: 'Je ne sais pas trop : j\'aimerais vos conseils'
  };
  var ORDRE = ['bain', 'tonte', 'ciseaux', 'epilation', 'demelage', 'debourrage', 'hygiene', 'conseil'];
  var CHIEN_SEUL = ['ciseaux', 'epilation'];
  var MOMENTS = { matin: 'plutôt le matin', 'apres-midi': 'plutôt l\'après-midi' };
  var etat = { animal: '', gabarit: '', soins: [], jours: [], moment: '' };

  var apercu = form.parentNode.querySelector('[data-apercu]');
  var retour = form.parentNode.querySelector('[data-retour]');
  var sms = form.parentNode.querySelector('[data-envoi="sms"]');
  var appel = form.parentNode.querySelector('[data-envoi="appel"]');
  var blocGabarit = form.querySelector('[data-gabarit]');
  var nomAnimal = document.getElementById('nom-animal'), race = document.getElementById('race');
  var commune = document.getElementById('commune-rdv'), aideZone = form.querySelector('[data-zone-rdv]');
  var prenom = document.getElementById('prenom'), premiere = document.getElementById('premiere'), mot = document.getElementById('mot');

  /* ---------- jours : les six prochains jours de tournée ---------- */
  var conteneurJours = form.querySelector('[data-groupe="jours"]');
  var court = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  var long = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var moisCourt = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var jours = [];
  (function () {
    var d = new Date(); d.setHours(12, 0, 0, 0);
    var maintenant = new Date().getHours() + new Date().getMinutes() / 60;
    var aujourdHui = T.horaires[d.getDay()] || [];
    // aujourd'hui seulement s'il reste au moins deux heures de tournée
    if (!aujourdHui.length || aujourdHui[aujourdHui.length - 1][1] - maintenant < 2) d.setDate(d.getDate() + 1);
    for (var n = 0; jours.length < 6 && n < 21; n++) {
      if ((T.horaires[d.getDay()] || []).length) jours.push(new Date(d));
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
    return i < 0;
  }
  function choisirAnimal(a) {
    etat.animal = a;
    if (a === 'chat') {
      etat.gabarit = '';
      etat.soins = etat.soins.filter(function (s) { return CHIEN_SEUL.indexOf(s) < 0; });
    }
  }
  form.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-valeur]');
    if (!b || b.disabled) return;
    var groupe = b.parentNode.getAttribute('data-groupe');
    var v = b.getAttribute('data-valeur');
    if (groupe === 'animal') choisirAnimal(etat.animal === v ? '' : v);
    else if (groupe === 'gabarit') etat.gabarit = etat.gabarit === v ? '' : v;
    else if (groupe === 'soins') basculer(etat.soins, v);
    else if (groupe === 'jours') basculer(etat.jours, +v);
    else if (groupe === 'moment') etat.moment = etat.moment === v ? '' : v;
    synchroniser();
  });
  [nomAnimal, race, prenom, premiere, mot].forEach(function (el) { el.addEventListener('input', rediger); el.addEventListener('change', rediger); });
  commune.addEventListener('input', function () { verifierCommune(false); rediger(); });
  commune.addEventListener('change', function () { verifierCommune(true); rediger(); });

  function marquer(groupe, actif) {
    form.querySelectorAll('[data-groupe="' + groupe + '"] [data-valeur]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(actif(b.getAttribute('data-valeur'))));
    });
  }
  function synchroniser() {
    marquer('animal', function (v) { return etat.animal === v; });
    marquer('gabarit', function (v) { return etat.gabarit === v; });
    marquer('soins', function (v) { return etat.soins.indexOf(v) > -1; });
    marquer('jours', function (v) { return etat.jours.indexOf(+v) > -1; });
    marquer('moment', function (v) { return etat.moment === v; });
    blocGabarit.hidden = etat.animal !== 'chien';
    form.querySelectorAll('[data-chien]').forEach(function (b) { b.hidden = etat.animal === 'chat'; });
    rediger();
    document.dispatchEvent(new CustomEvent('rdv:maj', { detail: { animal: etat.animal, soins: etat.soins.slice() } }));
  }

  /* ---------- la commune : dans la zone ou pas ? ---------- */
  var communeConnue = null;
  function verifierCommune(fin) {
    communeConnue = null;
    aideZone.className = 'champ-aide';
    aideZone.textContent = '';
    if (!Z || !commune.value.trim()) return;
    var r = Z.trouve(commune.value);
    if (r.commune && (!r.devine || fin)) {
      var c = r.commune, e = Z.etat(c.km);
      if (r.devine) commune.value = c.nom;
      communeConnue = c;
      aideZone.classList.add(e);
      aideZone.textContent = e === 'dedans'
        ? '✓ Dans la zone de tournée (' + Z.kmFr(c.km) + ' de Mouzeuil)'
        : 'En bordure de zone (' + Z.kmFr(c.km) + ') : Mary vous dira si c\'est possible.';
    } else if (fin && !r.commune && !r.liste) {
      aideZone.classList.add('dehors');
      aideZone.textContent = 'Commune hors de la liste des 30 km : Mary vous dira si elle peut passer.';
    }
  }

  /* ---------- rédaction de la demande ---------- */
  function listeFr(t) { return t.length < 2 ? t.join('') : t.slice(0, -1).join(', ') + ' ou ' + t[t.length - 1]; }
  function texteJours() {
    var choisis = etat.jours.slice().sort(function (a, b) { return a - b; }).map(function (k) { return jours[k]; });
    if (!choisis.length) return '';
    return listeFr(choisis.map(function (d, i) {
      var memeMois = i < choisis.length - 1 && choisis[i + 1].getMonth() === d.getMonth();
      return long[d.getDay()] + ' ' + (d.getDate() === 1 ? '1er' : d.getDate()) + (memeMois ? '' : ' ' + mois[d.getMonth()]);
    }));
  }
  function texteDemande() {
    if (!etat.soins.length) return '';
    var nom = nomAnimal.value.trim();
    var qui = etat.animal === 'chien' ? 'mon chien' : etat.animal === 'chat' ? 'mon chat' : 'mon compagnon';
    if (nom) qui += ' ' + nom;
    var details = [etat.gabarit ? etat.gabarit + ' gabarit' : '', race.value.trim()].filter(Boolean);
    var lignes = ['Bonjour Mary, je souhaiterais un toilettage à domicile pour ' + qui + (details.length ? ' (' + details.join(', ') + ')' : '') + ' :'];
    ORDRE.forEach(function (s) { if (etat.soins.indexOf(s) > -1) lignes.push('• ' + NOMS[s]); });
    lignes.push('');
    var lieu = (communeConnue ? communeConnue.nom : commune.value.trim());
    if (lieu) lignes.push('J\'habite à ' + lieu + '.');
    var j = texteJours(), m = etat.moment ? MOMENTS[etat.moment] : '';
    if (j || m) lignes.push('Mes disponibilités : ' + (j || 'quand cela vous arrange') + (m ? ', ' + m : '') + '.');
    if (premiere.value === 'oui') lignes.push('Ce serait sa première séance avec vous.');
    if (premiere.value === 'non') lignes.push('Vous connaissez déjà ' + (nom || (etat.animal === 'chat' ? 'mon chat' : etat.animal === 'chien' ? 'mon chien' : 'mon animal')) + '.');
    if (mot.value.trim()) lignes.push('', mot.value.trim());
    if (lignes[lignes.length - 1] === '') lignes.pop();
    lignes.push('', 'Merci !' + (prenom.value.trim() ? ' ' + prenom.value.trim() : ''));
    return lignes.join('\n');
  }

  var dernier = null;
  function rediger() {
    var t = texteDemande();
    apercu.classList.toggle('vide', !t);
    apercu.textContent = t || 'Choisissez au moins un soin (ou « conseillez-moi ») : votre message s\'écrira ici, prêt à être envoyé.';
    if (t && dernier !== null && t !== dernier && !calme) {
      apercu.classList.remove('maj'); void apercu.offsetWidth; apercu.classList.add('maj');
    }
    dernier = t;
    if (T.tel && T.mobile) sms.href = 'sms:' + T.tel + (t ? '?&body=' + encodeURIComponent(t) : '');
    if (T.tel) appel.href = 'tel:' + T.tel;
    retour.textContent = '';
  }
  sms.hidden = !(T.tel && T.mobile);
  appel.hidden = !T.tel;
  function demandeSoins() {
    retour.textContent = 'Choisissez d\'abord au moins un soin.';
    form.querySelector('[data-groupe="soins"] button:not([hidden])').focus();
  }
  sms.addEventListener('click', function (e) { if (!texteDemande()) { e.preventDefault(); demandeSoins(); } });

  form.parentNode.querySelector('[data-copier]').addEventListener('click', function () {
    var t = texteDemande();
    if (!t) { demandeSoins(); return; }
    function ok() { retour.textContent = 'Message copié. Collez-le dans un SMS au ' + (T.telAffiche || T.tel) + '.'; }
    function repli() {
      var zone = document.createElement('textarea');
      zone.value = t; zone.setAttribute('readonly', ''); zone.style.position = 'fixed'; zone.style.opacity = '0';
      document.body.appendChild(zone); zone.select();
      try { document.execCommand('copy'); ok(); } catch (e) { retour.textContent = 'Copie impossible : sélectionnez le texte du message.'; }
      zone.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, repli);
    else repli();
  });

  /* ---------- liens avec les autres sections (soins, tournée) ---------- */
  window.RDV = {
    animal: function (a) { choisirAnimal(a); synchroniser(); },
    basculeSoin: function (v) {
      // sans animal choisi, on reprend celui sélectionné dans la section des soins
      if (!etat.animal) {
        var p = document.querySelector('[data-filtre][aria-pressed="true"]');
        if (p) choisirAnimal(p.getAttribute('data-filtre'));
      }
      var ajoute = basculer(etat.soins, v);
      synchroniser();
      return ajoute;
    },
    commune: function (nom) { commune.value = nom; verifierCommune(true); rediger(); }
  };

  synchroniser();
})();

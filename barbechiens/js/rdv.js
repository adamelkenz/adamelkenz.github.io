/* Barbechiens · le message de rendez-vous qui s’écrit tout seul,
   à envoyer par SMS ou par e-mail au salon. */
(function () {
  'use strict';
  var form = document.querySelector('[data-rdv-form]');
  if (!form) return;
  var SALON = window.SALON || { tel: '+33659218702', email: 'barbechiens@gmail.com' };
  var bulle = document.querySelector('[data-sms]');
  var aSms = document.querySelector('[data-envoyer-sms]');
  var aMail = document.querySelector('[data-envoyer-mail]');
  var copier = document.querySelector('[data-copier]');
  var retour = document.querySelector('[data-retour]');
  var rappel = document.querySelector('[data-rdv-fid]');
  var fid = null;

  var SOINS = { bain: 'bain-brushing', ciseaux: 'retouche ciseaux', coupe: 'coupe', tonte: 'tonte', epilation: 'épilation', souspoil: 'démêlage / sous-poil', oreilles: 'oreilles & yeux', chiot: 'initiation chiot' };
  var GABARITS = { petit: 'petit gabarit', moyen: 'gabarit moyen', grand: 'grand gabarit', geant: 'très grand gabarit' };
  var JOURS = { 1: 'lundi', 2: 'mardi', 4: 'jeudi', 5: 'vendredi', 6: 'samedi' };

  function valeurs(groupe) {
    return Array.prototype.map.call(form.querySelectorAll('[data-groupe="' + groupe + '"] [aria-pressed="true"]'), function (b) { return b.dataset.valeur; });
  }
  function champ(nom) { var el = form.querySelector('[data-champ="' + nom + '"]'); return el ? el.value.trim() : ''; }
  function liste(t) { return t.length < 2 ? t.join('') : t.slice(0, -1).join(', ') + ' et ' + t[t.length - 1]; }

  function message() {
    var nom = champ('nom'), race = champ('race'), gab = valeurs('gabarit')[0], soins = valeurs('soins');
    var jours = valeurs('jours'), moment = valeurs('moment')[0], premiere = valeurs('premiere')[0];
    var remarque = champ('remarque'), prenom = champ('prenom');
    var l = ['Bonjour Pauline,'];
    var qui = nom ? nom : 'mon chien';
    var details = [race, gab ? GABARITS[gab] : ''].filter(Boolean).join(', ');
    var soinsTxt = soins.filter(function (s) { return SOINS[s]; }).map(function (s) { return SOINS[s]; });
    var phrase = 'Je souhaiterais un rendez-vous pour ' + qui + (details ? ' (' + details + ')' : '');
    if (soinsTxt.length) phrase += ' : ' + liste(soinsTxt);
    l.push(phrase + '.');
    if (soins.indexOf('conseil') > -1) l.push('Je ne sais pas trop quel soin choisir : pouvez-vous me conseiller ?');
    if (soins.indexOf('noel') > -1) l.push('J’aimerais aussi un créneau pour la séance photo de Noël du samedi 21 novembre.');
    if (jours.length || moment) {
      var dispo = 'Je suis disponible ' + (jours.length ? liste(jours.sort().map(function (j) { return 'le ' + JOURS[j]; })) : 'n’importe quel jour');
      if (moment) dispo += moment === 'matin' ? ', plutôt le matin' : ', plutôt l’après-midi';
      l.push(dispo + '.');
    }
    if (fid) l.push('Remise fidélité : son dernier toilettage date du ' + fid.dernier + ', je voudrais revenir entre le ' + fid.debut + ' et le ' + fid.fin + '.');
    if (premiere === 'oui') l.push('Ce sera sa première visite au salon.');
    if (premiere === 'non') l.push('Vous le connaissez déjà !');
    if (remarque) l.push('À savoir : ' + remarque.replace(/\.$/, '') + '.');
    l.push('Merci !' + (prenom ? ' ' + prenom : ''));
    return l.join('\n');
  }

  function maj() {
    var m = message();
    bulle.textContent = m;
    aSms.href = 'sms:' + SALON.tel + '?&body=' + encodeURIComponent(m);
    var nom = champ('nom');
    aMail.href = 'mailto:' + SALON.email + '?subject=' + encodeURIComponent('Rendez-vous toilettage' + (nom ? ' pour ' + nom : '')) + '&body=' + encodeURIComponent(m);
  }

  form.addEventListener('click', function (e) {
    var b = e.target.closest('.puces button');
    if (!b) return;
    var groupe = b.parentElement, on = b.getAttribute('aria-pressed') !== 'true';
    if (groupe.hasAttribute('data-unique')) groupe.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', String(on));
    maj();
  });
  form.addEventListener('input', maj);

  copier.addEventListener('click', function () {
    var m = message();
    function ok() { retour.textContent = 'Message copié, il n’y a plus qu’à le coller !'; setTimeout(function () { retour.textContent = ''; }, 3500); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(m).then(ok, secours);
    else secours();
    function secours() {
      var t = document.createElement('textarea');
      t.value = m; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (_) { retour.textContent = 'Sélectionnez le message pour le copier.'; }
      t.remove();
    }
  });

  document.addEventListener('bc:fidelite', function (e) {
    fid = e.detail;
    rappel.hidden = false;
    rappel.textContent = 'Remise fidélité : à revenir entre le ' + fid.debut + ' et le ' + fid.fin + '. C’est noté dans le message.';
    maj();
  });

  maj();
})();

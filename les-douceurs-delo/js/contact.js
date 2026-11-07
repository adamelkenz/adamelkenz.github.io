/* Les Douceurs d'Elo : demande de devis (envoi par WhatsApp ou SMS, aucune donnée stockée) */
(function () {
  'use strict';
  var f = document.getElementById('form-devis'); if (!f) return;
  var ELO = window.ELO;
  try { var o = new URLSearchParams(location.search).get('occasion'); if (o) { var opt = f.occasion.querySelector('option[value="' + o + '"]'); if (opt) f.occasion.value = o; } } catch (e) {}
  var min = new Date(); min.setDate(min.getDate() + 1); f.date.min = min.toISOString().slice(0, 10);
  function message() {
    var l = ['Bonjour Elo ! Demande de devis depuis votre site :', '• Occasion : ' + f.occasion.options[f.occasion.selectedIndex].text];
    if (f.date.value) l.push('• Date : ' + new Date(f.date.value + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    if (f.parts.value) l.push('• Nombre de personnes : ' + f.parts.value);
    if (f.parfum.value) l.push('• Parfum : ' + f.parfum.value);
    if (f.retrait.value) l.push('• ' + f.retrait.options[f.retrait.selectedIndex].text);
    if (f.message.value.trim()) l.push('• Mon idée : ' + f.message.value.trim());
    l.push('', (f.prenom.value.trim() || '') + (f.telephone.value.trim() ? ' · ' + f.telephone.value.trim() : ''));
    return l.join('\n').trim();
  }
  function valide() {
    if (!f.reportValidity()) return false;
    return true;
  }
  f.addEventListener('submit', function (e) { e.preventDefault(); if (valide()) window.open(ELO.wa(message()), '_blank', 'noopener'); });
  f.querySelector('[data-sms]').addEventListener('click', function () { if (valide()) location.href = ELO.sms(message()); });
  var ap = f.querySelector('[data-apercu]'), zone = f.querySelector('[data-apercu-zone]');
  function majApercu() { if (zone) zone.textContent = message(); }
  f.addEventListener('input', majApercu); majApercu();
  if (ap) ap.addEventListener('click', function () { zone.hidden = !zone.hidden; ap.textContent = zone.hidden ? 'Voir le message' : 'Masquer le message'; });
})();

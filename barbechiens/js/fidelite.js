/* Barbechiens · la fenêtre fidélité : −10 % si le chien revient
   entre 4 et 6 semaines après son dernier toilettage. */
(function () {
  'use strict';
  var input = document.querySelector('[data-fid-date]');
  if (!input) return;
  var periode = document.querySelector('[data-fid-periode]');
  var zone = document.querySelector('[data-fid-zone]');
  var auj = document.querySelector('[data-fid-auj]');
  var cal = document.querySelector('[data-fid-cal]');
  var conseil = document.querySelector('[data-fid-conseil]');
  var reserver = document.querySelector('[data-fid-reserver]');
  var JOUR = 864e5;
  var fJour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  var fCourt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });
  var fMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

  function aujourdhui() {
    var p = window.BC ? window.BC.paris() : null;
    var d = p ? new Date(p.a, p.m - 1, p.j, 12) : new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function plus(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function ferme(d) { return d.getDay() === 0 || d.getDay() === 3; }
  function ouvertSuivant(d, sens) { var x = new Date(d); while (ferme(x)) x = plus(x, sens); return x; }

  var today = aujourdhui();
  input.max = iso(today);
  input.value = iso(today);
  var etat = null;

  function calcul() {
    if (!input.value) { periode.textContent = 'Choisissez une date'; return; }
    var v = input.value.split('-').map(Number);
    var dernier = new Date(v[0], v[1] - 1, v[2], 12);
    var debut = plus(dernier, 28), fin = plus(dernier, 42);
    var annee = debut.getFullYear() !== fin.getFullYear() ? ' ' + debut.getFullYear() : '';
    periode.textContent = 'Du ' + fJour.format(debut) + annee + ' au ' + fJour.format(fin) + ' ' + fin.getFullYear();

    // règle de 0 à 8 semaines
    var semaines = (today - dernier) / JOUR / 7;
    auj.classList.toggle('dehors', semaines < 0 || semaines > 8);
    auj.style.left = Math.max(0, Math.min(100, semaines / 8 * 100)) + '%';
    zone.style.left = '50%'; zone.style.width = '25%';

    // calendrier : de lundi à dimanche autour de la fenêtre
    var lundi = plus(debut, -((debut.getDay() + 6) % 7));
    var dimanche = plus(fin, (7 - fin.getDay()) % 7);
    var html = '';
    var m1 = fMois.format(debut), m2 = fMois.format(fin);
    html += '<p class="cal-mois">' + (m1 === m2 ? m1 : m1.replace(/ \d{4}$/, (debut.getFullYear() === fin.getFullYear() ? '' : '$&')) + ' – ' + m2) + '</p>';
    ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(function (j) { html += '<span class="cal-tete" aria-hidden="true">' + j + '</span>'; });
    for (var d = new Date(lundi); d <= dimanche; d = plus(d, 1)) {
      var dans = d >= debut && d <= fin;
      var cls = 'j ' + (dans ? 'dans' : 'hors') + (dans && ferme(d) ? ' ferme' : '') + (iso(d) === iso(today) ? ' auj' : '');
      html += '<span class="' + cls + '" title="' + fJour.format(d) + (dans ? (ferme(d) ? ' : fermé' : ' : dans la fenêtre') : '') + '">' + d.getDate() + '</span>';
    }
    cal.innerHTML = html;

    // conseil
    var jusquAuDebut = Math.round((debut - today) / JOUR), jusquALaFin = Math.round((fin - today) / JOUR);
    if (dernier > today) conseil.textContent = 'Cette date est dans le futur : indiquez plutôt celle de son dernier toilettage.';
    else if (jusquAuDebut > 0) conseil.textContent = 'La fenêtre s’ouvre dans ' + jusquAuDebut + ' jour' + (jusquAuDebut > 1 ? 's' : '') + '. Réservez dès maintenant pour garder votre créneau !';
    else if (jusquALaFin >= 0) conseil.textContent = 'C’est le moment : ' + (jusquALaFin === 0 ? 'dernier jour' : 'il reste ' + jusquALaFin + ' jour' + (jusquALaFin > 1 ? 's' : '')) + ' pour profiter des −10 %.';
    else conseil.textContent = 'Cette fenêtre est passée, mais le prochain toilettage en ouvrira une nouvelle.';

    var d1 = ouvertSuivant(debut, 1), d2 = ouvertSuivant(fin, -1);
    etat = { dernier: fCourt.format(dernier), debut: fCourt.format(d1), fin: fCourt.format(d2), passe: jusquALaFin < 0 };
    reserver.hidden = etat.passe || dernier > today;
  }
  input.addEventListener('change', calcul);
  input.addEventListener('input', calcul);
  calcul();

  reserver.addEventListener('click', function () {
    if (etat) document.dispatchEvent(new CustomEvent('bc:fidelite', { detail: etat }));
  });
})();

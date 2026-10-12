/* Secret de Femme — simulateur d'épilation définitive au laser diode.
   Tarifs de l'institut (Planity) : [zone, prix à la séance, forfait 6 séances, durée en min, groupe].
   Les zones d'un même groupe s'excluent (ex. maillot classique / brésilien / intégral).
   cond = « sous certaines conditions », vu à l'institut. */
var LASER = {
  femme: [
    { z: 'Lèvres', s: 20, f: 110, d: 15, cond: true },
    { z: 'Menton', s: 20, f: 110, d: 15, cond: true },
    { z: 'Inter-sourcilier', s: 15, f: 80, d: 15, cond: true },
    { z: 'Aisselles', s: 50, f: 280, d: 15 },
    { z: 'Maillot classique', s: 40, f: 220, d: 20, g: 'maillot' },
    { z: 'Maillot brésilien', s: 50, f: 280, d: 30, g: 'maillot' },
    { z: 'Maillot intégral', s: 80, f: 460, d: 30, g: 'maillot' },
    { z: 'Demi-bras', s: 60, f: 340, d: 15, g: 'bras' },
    { z: 'Bras', s: 80, f: 460, d: 30, g: 'bras' },
    { z: 'Demi-jambes', s: 80, f: 460, d: 30, g: 'jambes' },
    { z: 'Jambes complètes', s: 150, f: 880, d: 60, g: 'jambes' }
  ],
  homme: [
    { z: 'Pommettes', s: 25, f: 140, d: 15 },
    { z: 'Barbe (cou)', s: 50, f: 290, d: 15 },
    { z: 'Inter-sourcilier', s: 15, f: 80, d: 15 },
    { z: 'Aisselles', s: 60, f: 340, d: 15 },
    { z: 'Demi-bras', s: 70, f: 400, d: 20, g: 'bras' },
    { z: 'Bras', s: 90, f: 520, d: 35, g: 'bras' },
    { z: 'Dos', s: 90, f: 520, d: 30 },
    { z: 'Torse', s: 90, f: 520, d: 30 },
    { z: 'Demi-jambes', s: 90, f: 520, d: 40, g: 'jambes' },
    { z: 'Jambes complètes', s: 160, f: 940, d: 60, g: 'jambes' }
  ]
};

(function () {
  var sim = document.querySelector('[data-simulateur]');
  if (!sim) return;
  var zones = sim.querySelector('[data-zones]');
  var el = function (n) { return sim.querySelector('[data-' + n + ']'); };
  var euros = function (v) { return v.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' €'; };
  var duree = function (m) { return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60 < 10 ? '0' : '') + (m % 60) : ''); };
  var qui = 'femme';

  function dessine() {
    zones.innerHTML = '';
    LASER[qui].forEach(function (x, i) {
      var id = 'z-' + qui + '-' + i;
      var lab = document.createElement('label');
      lab.className = 'zone' + (x.g ? ' zone-groupe' : '');
      lab.setAttribute('for', id);
      lab.innerHTML = '<input type="checkbox" id="' + id + '" value="' + i + '"' + (x.g ? ' data-groupe="' + x.g + '"' : '') + '>' +
        '<span class="zone-nom">' + x.z + (x.cond ? '<sup>*</sup>' : '') + '</span>' +
        '<span class="zone-prix">' + euros(x.s) + '</span>';
      zones.appendChild(lab);
    });
    calcule();
  }

  function calcule() {
    var choisies = [].slice.call(zones.querySelectorAll('input:checked')).map(function (c) { return LASER[qui][+c.value]; });
    var s = 0, f = 0, d = 0, cond = false;
    choisies.forEach(function (x) { s += x.s; f += x.f; d += x.d; cond = cond || !!x.cond; });
    el('vide').hidden = choisies.length > 0;
    el('chiffres').hidden = choisies.length === 0;
    el('conditions').hidden = !cond;
    el('resume').hidden = choisies.length === 0;
    if (!choisies.length) return;
    el('resume-txt').innerHTML = '<b>' + euros(s) + '</b> la séance · <b>' + euros(f) + '</b> les 6';
    el('seance').textContent = euros(s);
    el('forfait').textContent = euros(f);
    el('par-seance').textContent = 'soit ' + euros(Math.round(f / 6 * 100) / 100) + ' la séance';
    var eco = s * 6 - f;
    el('eco').innerHTML = eco > 0
      ? 'Avec le forfait, vous économisez <b>' + euros(eco) + '</b> par rapport à 6 séances à l\'unité (' + Math.round(eco / (s * 6) * 100) + ' %).'
      : 'Le forfait revient au même prix que 6 séances à l\'unité.';
    el('duree').textContent = 'Durée d\'une séance : environ ' + duree(d) + (choisies.length > 1 ? ' pour ces ' + choisies.length + ' zones' : '') + '.';
  }

  zones.addEventListener('change', function (e) {
    var c = e.target;
    if (c.checked && c.dataset.groupe) {
      zones.querySelectorAll('input[data-groupe="' + c.dataset.groupe + '"]').forEach(function (o) { if (o !== c) o.checked = false; });
    }
    calcule();
  });
  sim.querySelectorAll('input[name="sim-qui"]').forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) { qui = r.value; dessine(); } });
  });
  var coche = sim.querySelector('input[name="sim-qui"]:checked');
  if (coche) qui = coche.value;
  dessine();
})();

/* Les Douceurs d'Elo : calendrier des fêtes (prochaines occasions, compte à rebours, rappels .ics) */
(function () {
  'use strict';
  var ELO = window.ELO = window.ELO || {};
  function d(a, m, j) { return new Date(a, m - 1, j, 12); }
  function paques(a) {
    var b = a % 19, c = Math.floor(a / 100), e = a % 100, f = Math.floor(c / 4), g = c % 4, h = Math.floor((c + 8) / 25), i = Math.floor((c - h + 1) / 3),
      k = (19 * b + c - f - i + 15) % 30, l = Math.floor(e / 4), m = e % 4, n = (32 + 2 * g + 2 * l - k - m) % 7, o = Math.floor((b + 11 * k + 22 * n) / 451),
      mo = Math.floor((k + n - 7 * o + 114) / 31), jo = (k + n - 7 * o + 114) % 31 + 1;
    return d(a, mo, jo);
  }
  function nieme(a, m, rang, jourSem) { // rang 1..4 ou -1 (dernier) ; jourSem 0 = dimanche
    if (rang > 0) { var x = d(a, m, 1); while (x.getDay() !== jourSem) x.setDate(x.getDate() + 1); x.setDate(x.getDate() + (rang - 1) * 7); return x; }
    var y = d(a, m + 1, 0); while (y.getDay() !== jourSem) y.setDate(y.getDate() - 1); return y;
  }
  function meres(a) { var x = nieme(a, 5, -1, 0), pent = paques(a); pent.setDate(pent.getDate() + 49); if (x.toDateString() === pent.toDateString()) x.setDate(x.getDate() + 7); return x; }
  function table(t) { return function (a) { return t[a] ? d.apply(null, [a].concat(t[a])) : null; }; }
  var RAMADAN = { 2026: [2, 18], 2027: [2, 8], 2028: [1, 28], 2029: [1, 16], 2030: [1, 5] };
  var FITR = { 2026: [3, 20], 2027: [3, 10], 2028: [2, 27], 2029: [2, 14], 2030: [2, 4] };
  var ADHA = { 2026: [5, 27], 2027: [5, 17], 2028: [5, 5], 2029: [4, 24], 2030: [4, 13] };
  var R = ELO.racine || '';
  ELO.occasions = [
    { id: 'saint-valentin', nom: 'Saint-Valentin', f: function (a) { return d(a, 2, 14); }, txt: 'Bento cake en cœur, layer cake rouge et or, boîtes de cupcakes à offrir.', lien: 'composer-mon-gateau/?occasion=autre' },
    { id: 'grands-meres', nom: 'Fête des grands-mères', f: function (a) { return nieme(a, 3, 1, 0); }, txt: 'Un layer cake fleuri pour gâter mamie, avec son prénom en lettres dorées.', lien: 'layer-cakes/' },
    { id: 'ramadan', nom: 'Début du Ramadan', f: table(RAMADAN), estimee: true, txt: 'Tiramisu, mignardises et box layer cake pour les ftours en famille.', lien: 'cupcakes-mignardises/' },
    { id: 'aid-fitr', nom: 'Aïd el-Fitr', f: table(FITR), estimee: true, txt: 'Gâteaux « Eid Mubarak », plateaux de douceurs et sweet tables de fête.', lien: 'sweet-table-evenements/' },
    { id: 'paques', nom: 'Pâques', f: paques, txt: 'Layer cake chocolat, nids gourmands et cupcakes printaniers.', lien: 'cupcakes-mignardises/' },
    { id: 'aid-adha', nom: 'Aïd el-Adha', f: table(ADHA), estimee: true, txt: 'Desserts pour recevoir : layer cakes, mignardises, tiramisu.', lien: 'sweet-table-evenements/' },
    { id: 'meres', nom: 'Fête des mères', f: meres, txt: 'Le grand classique : roses, perles et le parfum préféré de maman.', lien: 'layer-cakes/' },
    { id: 'peres', nom: 'Fête des pères', f: function (a) { return nieme(a, 6, 3, 0); }, txt: 'Drip cake chocolat, spéculoos ou caramel beurre salé.', lien: 'layer-cakes/' },
    { id: 'diplomes', nom: 'Saison des diplômes', f: function (a) { return d(a, 6, 27); }, periode: 'fin juin – juillet', txt: 'Layer cakes « diplômé·e », toppers chapeau et formules box + cupcakes.', lien: 'composer-mon-gateau/?occasion=diplome' },
    { id: 'halloween', nom: 'Halloween', f: function (a) { return d(a, 10, 31); }, txt: 'Cupcakes et layer cakes frissonnants pour les enfants (et les grands).', lien: 'anniversaire-enfant/' },
    { id: 'noel', nom: 'Noël', f: function (a) { return d(a, 12, 25); }, txt: 'Layer cakes et mignardises de fête : à réserver tôt, les places partent vite.', lien: 'layer-cakes/' },
    { id: 'reveillon', nom: 'Réveillon du Nouvel An', f: function (a) { return d(a, 12, 31); }, txt: 'Plateaux de mignardises et number cake de la nouvelle année.', lien: 'cupcakes-mignardises/' }
  ];
  ELO.prochaines = function () {
    var auj = new Date(); auj.setHours(0, 0, 0, 0);
    return ELO.occasions.map(function (o) {
      var a = auj.getFullYear(), x = o.f(a);
      if (!x || x < auj) x = o.f(a + 1);
      return x ? { o: o, date: x, jours: Math.round((x - auj) / 864e5) } : null;
    }).filter(Boolean).sort(function (p, q) { return p.date - q.date; });
  };
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  function iso(x) { return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); }
  function longue(x) { return x.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); }

  // liste complète
  var liste = document.getElementById('occasions');
  if (liste) {
    var l = ELO.prochaines(), h = '';
    l.forEach(function (p, i) {
      var avant = new Date(p.date); avant.setDate(avant.getDate() - 10);
      h += '<li class="occasion' + (i === 0 ? ' prochaine' : '') + '" data-r style="--d:' + Math.min(i, 6) + '">' +
        '<div class="date"><b>' + p.date.getDate() + '</b><span>' + MOIS[p.date.getMonth()] + ' ' + p.date.getFullYear() + '</span></div>' +
        '<div><h3>' + p.o.nom + (p.o.estimee ? ' <small class="petit">(date estimée)</small>' : '') + '</h3><p>' + p.o.txt + '</p>' +
        '<p class="petit">' + (p.o.periode ? 'Période : ' + p.o.periode + ' · ' : '') + 'Commandez idéalement avant le <b>' + longue(avant) + '</b> · <a href="' + R + p.o.lien + '">Idées de gâteaux</a> · ' +
        '<button type="button" class="lien-rappel" data-i="' + i + '" style="all:unset;cursor:pointer;color:var(--or-texte);text-decoration:underline;text-underline-offset:3px">Me le rappeler</button></p></div>' +
        '<div class="dans">' + (p.jours === 0 ? '<b>Aujourd\'hui</b>' : 'dans<b>' + p.jours + ' j</b>') + '</div></li>';
    });
    liste.innerHTML = h;
    liste.addEventListener('click', function (e) {
      var b = e.target.closest('.lien-rappel'); if (!b) return;
      var p = l[+b.getAttribute('data-i')];
      ELO.ics({ titre: p.o.nom + ' : commander le gâteau', date: iso(p.date), rappelJours: 14, nom: 'rappel-' + p.o.id,
        description: 'Les Douceurs d\'Elo, ' + (ELO.tel || '') + ' · ' + (ELO.site || '') });
      ELO.toast('Rappel téléchargé : ouvrez le fichier pour l\'ajouter à votre agenda.');
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } }); }, { threshold: .1 });
      liste.querySelectorAll('[data-r]').forEach(function (x) { io.observe(x); });
    }
  }

  // compte à rebours (accueil)
  var cr = document.querySelector('[data-prochaine]');
  if (cr) {
    var p = ELO.prochaines()[0], cible = new Date(p.date); cible.setHours(0, 0, 0, 0);
    cr.querySelector('[data-p-nom]').textContent = p.o.nom;
    cr.querySelector('[data-p-date]').textContent = longue(p.date) + (p.o.estimee ? ' (date estimée)' : '');
    function tic() {
      var ms = Math.max(0, cible - new Date()), j = Math.floor(ms / 864e5), hr = Math.floor(ms / 36e5) % 24, mn = Math.floor(ms / 6e4) % 60;
      cr.querySelector('[data-p-j]').textContent = j; cr.querySelector('[data-p-h]').textContent = hr; cr.querySelector('[data-p-m]').textContent = mn;
    }
    tic(); setInterval(tic, 30000);
  }

  // carnet d'anniversaires (page calendrier)
  var r = document.getElementById('form-carnet');
  if (r) r.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = r.qui.value.trim(), dt = r.quand.value, type = r.type.value;
    if (!p || !dt) { ELO.toast('Indiquez un prénom et une date.'); return; }
    var titre = (type === 'mariage' ? 'Anniversaire de mariage : ' : type === 'fete' ? 'Fête de ' : 'Anniversaire de ') + p;
    ELO.ics({ titre: titre, date: dt, annuel: true, rappelJours: +r.delai.value || 14, nom: 'rappel-' + p.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: 'Rappel de Les Douceurs d\'Elo : pensez au gâteau ! ' + (ELO.tel || '') + ' · ' + (ELO.site || '') });
    ELO.toast('Rappel annuel téléchargé : ajoutez-le à votre agenda.');
    r.reset();
  });
})();

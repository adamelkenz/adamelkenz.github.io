/* Calendrier des fleurs de saison, ouvert sur le mois en cours. */
(function () {
  var zMois = document.querySelector('.mois');
  var zListe = document.querySelector('.saisons-liste');
  var zNom = document.querySelector('[data-mois-nom]');
  var zNote = document.querySelector('[data-note]');
  if (!zMois || !window.DESSIN) return;

  // [nom, dessin, couleur, sens]
  var F = {
    anemone:     ['Anémone', 'gerbera', '#e9eef6', 'Confiance et sincérité', '#1f2433'],
    renoncule:   ['Renoncule', 'renoncule', '#f4b9a8', 'Charme et éclat'],
    mimosa:      ['Mimosa', 'gypsophile', '#f7d23e', 'Sécurité et tendresse'],
    tulipe:      ['Tulipe', 'tulipe', '#e8607a', 'Une déclaration d\'amour'],
    jacinthe:    ['Jacinthe', 'epi', '#8d86d6', 'Bienveillance'],
    amaryllis:   ['Amaryllis', 'tulipe', '#c22a3c', 'Fierté et éclat'],
    hellebore:   ['Hellébore', 'gerbera', '#efe6ee', 'Sérénité', '#c9b24a'],
    jonquille:   ['Jonquille', 'gerbera', '#f9d649', 'Désir et renouveau', '#f29a2e'],
    camelia:     ['Camélia', 'rose', '#e36a83', 'Admiration'],
    muscari:     ['Muscari', 'epi', '#4f61c4', 'Simplicité'],
    lilas:       ['Lilas', 'epi', '#c4a3db', 'Premiers émois amoureux'],
    muguet:      ['Muguet', 'epi', '#fbfaf3', 'Le retour du bonheur'],
    pivoine:     ['Pivoine', 'pivoine', '#f2b4c0', 'Bonheur et prospérité'],
    rose:        ['Rose', 'rose', '#e2566a', 'L\'amour'],
    iris:        ['Iris', 'tulipe', '#6c5bc4', 'Un message, la confiance'],
    delphinium:  ['Delphinium', 'epi', '#5b86d6', 'Légèreté et joie'],
    alstroemere: ['Alstroemère', 'tulipe', '#f39b7f', 'L\'amitié'],
    campanule:   ['Campanule', 'tulipe', '#9b8fe0', 'La gratitude'],
    lavande:     ['Lavande', 'epi', '#9b86c9', 'Calme et sérénité'],
    tournesol:   ['Tournesol', 'gerbera', '#f7b733', 'Joie de vivre', '#5a3b1e'],
    hortensia:   ['Hortensia', 'renoncule', '#a9c1ea', 'Abondance et gratitude'],
    zinnia:      ['Zinnia', 'dahlia', '#f26b5b', 'Une pensée pour un ami absent'],
    agapanthe:   ['Agapanthe', 'gypsophile', '#7f97e0', 'L\'amour'],
    dahlia:      ['Dahlia', 'dahlia', '#d9586f', 'Reconnaissance et élégance'],
    cosmos:      ['Cosmos', 'gerbera', '#f1a7c3', 'Harmonie', '#f2c14e'],
    glaieul:     ['Glaïeul', 'epi', '#f07a6a', 'Force de caractère'],
    aster:       ['Aster', 'gerbera', '#a18ad6', 'Délicatesse', '#f2c14e'],
    amarante:    ['Amarante', 'epi', '#8e1f45', 'L\'immortalité'],
    roseAutomne: ['Rose d\'automne', 'rose', '#d9805e', 'Tendresse'],
    chrysantheme:['Chrysanthème', 'dahlia', '#f1e6c8', 'Hommage et souvenir'],
    physalis:    ['Physalis', 'tulipe', '#ef8a3c', 'La protection'],
    eucalyptus:  ['Eucalyptus', 'eucalyptus', '#9db3a4', 'Protection et fraîcheur'],
    houx:        ['Houx', 'eucalyptus', '#4f7a55', 'Prévoyance', '#c22a3c'],
    gui:         ['Gui', 'eucalyptus', '#a9c08a', 'Bonne fortune', '#fbfaf3']
  };
  var MOIS = [
    ['Janvier', ['anemone', 'renoncule', 'tulipe', 'jacinthe', 'amaryllis', 'hellebore']],
    ['Février', ['mimosa', 'anemone', 'renoncule', 'tulipe', 'jonquille', 'camelia']],
    ['Mars', ['tulipe', 'jonquille', 'renoncule', 'anemone', 'jacinthe', 'muscari']],
    ['Avril', ['tulipe', 'lilas', 'renoncule', 'muscari', 'anemone', 'pivoine']],
    ['Mai', ['pivoine', 'muguet', 'lilas', 'rose', 'iris', 'renoncule']],
    ['Juin', ['pivoine', 'rose', 'delphinium', 'alstroemere', 'campanule', 'lavande']],
    ['Juillet', ['lavande', 'tournesol', 'hortensia', 'rose', 'zinnia', 'agapanthe']],
    ['Août', ['tournesol', 'dahlia', 'hortensia', 'zinnia', 'cosmos', 'glaieul']],
    ['Septembre', ['dahlia', 'cosmos', 'aster', 'roseAutomne', 'amarante', 'hortensia']],
    ['Octobre', ['dahlia', 'chrysantheme', 'aster', 'amarante', 'physalis', 'roseAutomne']],
    ['Novembre', ['chrysantheme', 'amaryllis', 'anemone', 'eucalyptus', 'hellebore', 'physalis']],
    ['Décembre', ['amaryllis', 'hellebore', 'houx', 'gui', 'anemone', 'eucalyptus']]
  ];
  var NOTES = {
    9: 'La Toussaint approche : pensez à réserver vos chrysanthèmes et vos compositions de souvenir.',
    10: 'Pour la Toussaint, chrysanthèmes, coussins et compositions de souvenir se réservent dès maintenant.',
    1: 'Le 14 février, les roses partent vite : réservez votre bouquet de Saint-Valentin quelques jours avant.',
    4: 'Fête des mères et muguet du 1er mai : un bouquet commandé à l\'avance, c\'est l\'assurance des plus belles fleurs.',
    11: 'Pour les fêtes, pensez aux centres de table et aux couronnes de l\'Avent.'
  };

  var courant = new Date().getMonth();
  var choisi = courant;

  MOIS.forEach(function (m, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.id = 'mois-' + i;
    b.setAttribute('aria-controls', 'saisons-liste');
    b.textContent = m[0];
    if (i === courant) b.classList.add('maintenant');
    zMois.appendChild(b);
  });
  zListe.id = 'saisons-liste';
  zListe.setAttribute('role', 'tabpanel');

  function afficher(i, focus) {
    choisi = i;
    zMois.querySelectorAll('button').forEach(function (b, k) {
      b.setAttribute('aria-selected', k === i);
      b.tabIndex = k === i ? 0 : -1;
      if (k === i && focus) { b.focus(); }
      if (k === i) {
        var zone = zMois.getBoundingClientRect(), r = b.getBoundingClientRect();
        zMois.scrollLeft += (r.left + r.width / 2) - (zone.left + zone.width / 2);
      }
    });
    zListe.setAttribute('aria-labelledby', 'mois-' + i);
    zNom.textContent = i === courant ? 'en ce moment' : 'en ' + MOIS[i][0].toLowerCase();
    zListe.innerHTML = MOIS[i][1].map(function (k, n) {
      var x = F[k];
      return '<article class="fleur-saison" style="--i:' + n + '">' +
        '<svg viewBox="-34 -34 68 68" aria-hidden="true">' + window.DESSIN.fleur(x[1], x[2], 28, x[4]) + '</svg>' +
        '<div><h3>' + x[0] + '</h3><p>' + x[3] + '</p></div></article>';
    }).join('');
    var note = NOTES[i];
    zNote.hidden = !note;
    zNote.textContent = note || '';
  }

  zMois.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) afficher([].indexOf.call(zMois.children, b));
  });
  zMois.addEventListener('keydown', function (e) {
    var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === 'Home') d = -choisi;
    if (e.key === 'End') d = 11 - choisi;
    if (d === undefined) return;
    e.preventDefault();
    afficher((choisi + d + 12) % 12, true);
  });
  afficher(courant);
})();

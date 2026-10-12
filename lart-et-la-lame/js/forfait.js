/* Le bon forfait : additionne les prestations choisies et signale le forfait quand il revient moins cher
   (ou au même prix pour une barbe plus soignée). Prix et durées de la carte Planity du salon. */
(function () {
  var PRESTA = {
    coupe: { nom: 'Coupe', prix: 25, min: 30 },
    transfo: { nom: 'Coupe transformation', prix: 30, min: 45 },
    couronne: { nom: 'Couronne', prix: 17, min: 30 },
    minute: { nom: 'Barbe minute', prix: 15, min: 20 },
    precision: { nom: 'Barbe précision', prix: 20, min: 30 },
    soin: { nom: 'Soin visage éclat', prix: 10, min: 30 },
    massage: { nom: 'Massage', prix: 10, min: 10 },
    cire: { nom: 'Tea-wax oreilles ou nez', prix: 7, min: 30 }
  };
  var FORFAIT = {
    simple: { nom: 'Forfait coupe + barbe précision', prix: 40, min: 60 },
    complet: { nom: 'Forfait coupe + barbe précision + soin visage éclat', prix: 50, min: 75 }
  };
  var PLANITY = 'https://www.planity.com/lart-la-lame-68770-ammerschwihr';

  var form = document.querySelector('[data-calcul]');
  if (!form) return;
  var sortie = form.querySelector('[data-resultat]');
  var L = window.LAME || { offre: false, taux: 0, euros: function (x) { return x + ' €'; } };

  function duree(m) {
    var h = Math.floor(m / 60), r = m % 60;
    return h ? h + ' h' + (r ? ' ' + (r < 10 ? '0' : '') + r : '') : r + ' min';
  }

  function calcule() {
    var coupe = form.querySelector('[name="coupe"]:checked').value;
    var barbe = form.querySelector('[name="barbe"]:checked').value;
    var extras = [].slice.call(form.querySelectorAll('[name="extra"]:checked')).map(function (c) { return c.value; });
    var soin = extras.indexOf('soin') > -1;

    // ce que l'on réserve, à la carte
    var choix = [];
    if (coupe) choix.push(coupe);
    if (barbe) choix.push(barbe);
    choix = choix.concat(extras);
    if (!choix.length) {
      sortie.innerHTML = '<p class="resultat-vide">Choisissez au moins une prestation.</p>';
      return;
    }
    var carte = choix.reduce(function (s, k) { return s + PRESTA[k].prix; }, 0);

    // le forfait remplace la coupe, la barbe précision et éventuellement le soin
    var lignes = [], total = 0, min = 0, conseil = '';
    var avecForfait = coupe === 'coupe' && barbe === 'precision';
    if (avecForfait) {
      var f = soin ? FORFAIT.complet : FORFAIT.simple;
      lignes.push('<strong>' + f.nom + '</strong>');
      total += f.prix; min += f.min;
      choix = choix.filter(function (k) { return k !== 'coupe' && k !== 'precision' && !(soin && k === 'soin'); });
    }
    choix.forEach(function (k) { lignes.push(PRESTA[k].nom); total += PRESTA[k].prix; min += PRESTA[k].min; });

    if (avecForfait) {
      conseil = 'Le forfait vous fait économiser <b>' + L.euros(carte - total) + '</b> par rapport à la carte.';
    } else if (coupe === 'coupe' && barbe === 'minute') {
      var fm = soin ? FORFAIT.complet : FORFAIT.simple;
      conseil = 'Astuce : au même prix, le <b>' + fm.nom.toLowerCase() + '</b> remplace la barbe minute par la barbe précision (' + L.euros(fm.prix) + ', ' + duree(fm.min) + ').';
    } else if (coupe === 'coupe' && !barbe) {
      var fs = soin ? FORFAIT.complet : FORFAIT.simple;
      conseil = 'Avec une barbe précision, le <b>' + fs.nom.toLowerCase() + '</b> coûte ' + L.euros(fs.prix) + ' : la barbe revient à ' + L.euros(fs.prix - PRESTA.coupe.prix - (soin ? PRESTA.soin.prix : 0)) + ' au lieu de ' + L.euros(PRESTA.precision.prix) + '.';
    }

    var prix = '<b>' + L.euros(L.offre ? total * (1 - L.taux) : total) + '</b>';
    if (L.offre) prix += '<s>' + L.euros(total) + '</s>';
    sortie.innerHTML =
      '<div>' +
        '<p class="total">' + prix + '<span>' + duree(min) + (L.offre ? ' · offre d\'ouverture −20 %' : '') + '</span></p>' +
        '<p class="detail">À réserver : ' + lignes.join(' + ') + '</p>' +
        (conseil ? '<p class="conseil">' + conseil + '</p>' : '') +
      '</div>' +
      '<a class="btn-verre sur-sombre" href="' + PLANITY + '" target="_blank" rel="noopener"><span>Réserver sur Planity</span></a>';
  }

  form.addEventListener('change', calcule);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  calcule();
})();

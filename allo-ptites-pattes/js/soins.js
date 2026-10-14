/* Allô P'tites Pattes — « Chaque pelage a sa routine » : on choisit le poil de son chien,
   les soins qui le concernent s'allument dans l'ordre et un repère s'affiche.
   Repères indicatifs : Chloé adapte toujours la séance au chien qu'elle a devant elle. */
(function () {
  var boutons = [].slice.call(document.querySelectorAll('[data-pelage]'));
  var liste = document.querySelector('[data-soins]');
  var panneau = document.querySelector('[data-routine]');
  if (!boutons.length || !liste || !panneau) return;

  var NOMS = {
    bain: 'Bain & séchage', brushing: 'Brushing', coupe: 'Coupe', demelage: 'Démêlage',
    hygiene: 'Hygiène', griffes: 'Griffes', oreilles: 'Oreilles', complet: 'Toilettage complet'
  };
  var ROUTINES = {
    court: {
      titre: 'La routine du poil court',
      etapes: ['bain', 'brushing', 'griffes', 'oreilles'],
      repere: 'Repère : un passage tous les 2 à 3 mois',
      conseil: 'Entre deux visites, un coup de gant en caoutchouc chaque semaine retire le poil mort… et en laisse moins sur le canapé.'
    },
    long: {
      titre: 'La routine du poil long',
      etapes: ['demelage', 'bain', 'brushing', 'hygiene', 'griffes'],
      repere: 'Repère : tous les 2 à 3 mois, et à chaque mue',
      conseil: 'Au printemps et à l’automne, le sous-poil tombe par poignées : un brossage par semaine à la maison, deux pendant la mue.'
    },
    boucle: {
      titre: 'La routine du poil bouclé',
      etapes: ['demelage', 'bain', 'coupe', 'hygiene', 'oreilles', 'griffes'],
      repere: 'Repère : toutes les 6 à 8 semaines',
      conseil: 'Ce poil-là pousse sans s’arrêter et feutre vite : brossez jusqu’à la peau deux ou trois fois par semaine.'
    },
    soyeux: {
      titre: 'La routine du poil soyeux',
      etapes: ['demelage', 'bain', 'coupe', 'oreilles', 'hygiene', 'griffes'],
      repere: 'Repère : toutes les 6 à 8 semaines',
      conseil: 'Les longues oreilles tombantes aiment être vérifiées chaque semaine, et un peigne passé derrière elles évite les nœuds.'
    }
  };
  var CAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  var cartes = {};
  [].slice.call(liste.querySelectorAll('[data-soin]')).forEach(function (li) { cartes[li.getAttribute('data-soin')] = li; });

  function choisit(cle) {
    var r = ROUTINES[cle];
    boutons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pelage') === cle)); });
    liste.classList.add('filtre');
    Object.keys(cartes).forEach(function (k) {
      var li = cartes[k], rang = r.etapes.indexOf(k), dedans = rang >= 0 || k === 'complet';
      li.classList.toggle('dans-routine', dedans);
      li.querySelector('.etape').textContent = k === 'complet' ? '★' : (rang >= 0 ? rang + 1 : '');
    });
    var html = '<div class="routine-tete"><p class="routine-titre">' + r.titre + '</p><p class="routine-freq">' + CAL + r.repere + '</p></div><ol class="routine-etapes">';
    r.etapes.forEach(function (k, i) {
      if (i) html += '<li class="fleche" aria-hidden="true" style="--i:' + (i * 2 - 1) + '">→</li>';
      html += '<li style="--i:' + i * 2 + '"><b>' + (i + 1) + '</b>' + NOMS[k] + '</li>';
    });
    html += '</ol><p class="routine-conseil"><b>Le petit conseil&nbsp;:</b> ' + r.conseil +
      '<small>Ou tout en une fois avec le toilettage complet ★. Repère indicatif&nbsp;: Chloé adapte toujours la séance à votre chien.</small></p>';
    panneau.innerHTML = html;
  }
  boutons.forEach(function (b) {
    b.addEventListener('click', function () { choisit(b.getAttribute('data-pelage')); });
  });
})();

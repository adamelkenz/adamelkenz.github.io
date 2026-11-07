/* Les Douceurs d'Elo : aperçu des cupcakes à votre image + estimation des quantités (entreprises) */
(function () {
  'use strict';
  var ELO = window.ELO;
  var f = document.getElementById('form-logo'), boite = document.querySelector('.boite-cupcakes');
  if (f && boite) {
    var image = null;
    function maj() {
      var nom = f.societe.value.trim() || 'Votre logo', marque = f.couleur.value, glacage = f.querySelector('[name="glacage"]:checked');
      boite.style.setProperty('--marque', marque);
      boite.style.setProperty('--glacage', glacage ? glacage.value : '#f6e7cf');
      boite.style.setProperty('--moule', marque);
      boite.querySelectorAll('.disque').forEach(function (d, i) {
        d.style.setProperty('--r', ((i % 3) - 1) * 6 + 'deg');
        if (image) { d.innerHTML = ''; var im = new Image(); im.src = image; im.alt = ''; d.appendChild(im); }
        else d.textContent = nom.length > 14 ? nom.split(/\s+/).map(function (m) { return m[0]; }).join('').slice(0, 4).toUpperCase() : nom;
      });
    }
    f.addEventListener('input', maj);
    f.logo.addEventListener('change', function () {
      var fi = f.logo.files[0]; if (!fi) { image = null; maj(); return; }
      if (!/^image\//.test(fi.type) || fi.size > 4e6) { ELO.toast('Choisissez une image (PNG, JPG ou SVG) de moins de 4 Mo.'); f.logo.value = ''; return; }
      var lr = new FileReader(); lr.onload = function () { image = lr.result; maj(); ELO.toast('Aperçu mis à jour : votre fichier reste sur votre appareil.'); }; lr.readAsDataURL(fi);
    });
    var eff = f.querySelector('[data-effacer]'); if (eff) eff.addEventListener('click', function () { image = null; f.logo.value = ''; maj(); });
    maj();
  }

  var q = document.getElementById('form-quantites');
  if (q) {
    var TYPES = {
      pause: { lib: 'Pause café / séminaire', par: 1.5, txt: function (n, p) { return Math.ceil(n * p) + ' douceurs : ' + Math.ceil(n * p / 2) + ' cupcakes + ' + Math.floor(n * p / 2) + ' mignardises'; } },
      cocktail: { lib: 'Cocktail / inauguration', par: 3, txt: function (n, p) { var t = Math.ceil(n * p); return t + ' pièces sucrées ≈ ' + Math.ceil(t / 20) + ' plateaux de 20 mignardises'; } },
      equipe: { lib: 'Anniversaire d\'équipe / pot de départ', par: 1, txt: function (n) { return n + ' parts : ' + (n <= 12 ? 'un layer cake ' + (n <= 6 ? '4/6' : n <= 8 ? '6/8' : '10/12') + ' parts' : n <= 30 ? 'un gâteau 2 étages' : 'un gâteau 3 étages ou plusieurs layer cakes'); } },
      cadeau: { lib: 'Cadeaux clients / partenaires', par: 1, txt: function (n) { return n + ' coffrets (box de cupcakes ou box layer cake), à votre image'; } }
    };
    function calc() {
      var n = +q.personnes.value, t = TYPES[q.querySelector('[name="type"]:checked').value];
      q.querySelector('[data-out-personnes]').textContent = n;
      q.querySelector('[data-quantite]').textContent = t.txt(n, t.par);
      var vis = q.querySelector('.parts-visu'), total = Math.min(120, Math.ceil(n * t.par)), h = '';
      for (var i = 0; i < total; i++) h += '<i style="--n:' + i + '"' + (i % 2 ? ' class="cup"' : '') + '></i>';
      vis.innerHTML = h;
      q._msg = ['Bonjour Elo ! Demande de devis entreprise :', '• Événement : ' + t.lib, '• Nombre de personnes : ' + n, '• Estimation du site : ' + t.txt(n, t.par),
        '• Société : ' + ((f && f.societe.value.trim()) || 'à préciser'), '• Date : à préciser', '', 'Merci de me recontacter.'].join('\n');
    }
    q.addEventListener('input', calc);
    q.addEventListener('submit', function (e) { e.preventDefault(); window.open(ELO.wa(q._msg), '_blank', 'noopener'); });
    calc();
  }
})();

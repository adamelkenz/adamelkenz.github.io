/* Les Douceurs d'Elo : choix du thème d'anniversaire enfant + rappel d'agenda */
(function () {
  'use strict';
  var zone = document.getElementById('studio-enfant'); if (!zone || !window.Gateau) return;
  var ELO = window.ELO, rendu = zone.querySelector('.rendu'), f = document.getElementById('form-enfant');
  var THEMES = {
    jungle: { nom: 'Jungle & safari', creme: '#f5ecd2', accent: '#5b7f3a', finition: 'lisse', icone: 'feuille', deco: { rosettes: true }, pal: ['#f5ecd2', '#5b7f3a', '#c8963e'] },
    princesse: { nom: 'Princesse', creme: '#f6d9dc', accent: '#d4a24c', finition: 'lisse', icone: 'couronne', deco: { perles: true, fleurs: true }, fleurs: '#e8a6b5', pal: ['#f6d9dc', '#d4a24c', '#e8a6b5'] },
    licorne: { nom: 'Licorne', creme: '#fbeef3', accent: '#d7b46a', finition: 'lisse', icone: 'licorne', deco: { fleurs: true, rosettes: true }, fleurs: '#c9a0dc', pal: ['#fbeef3', '#c9a0dc', '#d7b46a'] },
    sirene: { nom: 'Sirène & océan', creme: '#d7eef0', accent: '#4fa3a5', finition: 'drip', icone: 'coquillage', deco: { perles: true }, pal: ['#d7eef0', '#4fa3a5', '#f2c6c2'] },
    espace: { nom: 'Espace', creme: '#25304d', accent: '#e9c46a', finition: 'lisse', icone: 'fusee', deco: { or: true }, pal: ['#25304d', '#e9c46a', '#e76f51'] },
    dinos: { nom: 'Dinosaures', creme: '#dfe8cf', accent: '#6b8f3a', finition: 'lisse', icone: 'dino', deco: { rosettes: true }, pal: ['#dfe8cf', '#6b8f3a', '#e9a23b'] },
    foot: { nom: 'Football', creme: '#ffffff', accent: '#2f7d4a', finition: 'drip', icone: 'ballon', deco: {}, pal: ['#ffffff', '#2f7d4a', '#2e211b'] },
    arcenciel: { nom: 'Arc-en-ciel', creme: '#ffffff', accent: '#f4a261', finition: 'lisse', icone: 'arcenciel', deco: { rosettes: true }, pal: ['#e76f51', '#e9c46a', '#6aa6c8'] },
    nuage: { nom: 'Petit nuage', creme: '#d6e6f2', accent: '#ffffff', finition: 'lisse', icone: 'nuage', deco: { perles: true }, pal: ['#d6e6f2', '#ffffff', '#8fb8d8'] },
    jardin: { nom: 'Jardin fleuri', creme: '#fbf3ea', accent: '#e8a6a6', finition: 'lisse', icone: 'fleur', deco: { fleurs: true }, fleurs: '#e8a6a6', pal: ['#fbf3ea', '#e8a6a6', '#8aa878'] },
    gourmand: { nom: 'Gourmand chocolat', creme: '#6b4330', accent: '#3f2519', finition: 'drip', icone: null, deco: { fruits: true, or: true }, pal: ['#6b4330', '#3f2519', '#c8313f'] }
  };
  var theme = 'jungle';
  zone.querySelectorAll('.theme-btn').forEach(function (b) {
    var t = THEMES[b.getAttribute('data-theme')];
    b.querySelector('.pal').innerHTML = t.pal.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('');
    b.addEventListener('click', function () {
      theme = b.getAttribute('data-theme');
      zone.querySelectorAll('.theme-btn').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      maj(true);
    });
  });
  function maj(rebond) {
    var t = THEMES[theme], age = f.age.value;
    zone.querySelector('[data-out-age]').textContent = age + (age === '1' ? ' an' : ' ans');
    rendu.innerHTML = Gateau.svg({ etages: [{ w: 236, h: 160 }], creme: t.creme, accent: t.accent, couleurFleurs: t.fleurs || t.accent, finition: t.finition,
      icone: f.bougieAge.checked ? null : t.icone, bougie: f.bougieAge.checked ? age : '', deco: t.deco, texte: f.prenom.value.trim(), label: 'Aperçu du gâteau ' + t.nom });
    if (rebond) rendu.querySelectorAll('.etage').forEach(function (e) { e.classList.add('rebond'); });
    zone.querySelector('[data-nom-theme]').textContent = t.nom;
  }
  function message() {
    var t = THEMES[theme], p = f.prenom.value.trim();
    return ['Bonjour Elo ! Je prépare un anniversaire et je souhaite un devis :', '• Thème : ' + t.nom, '• Âge : ' + f.age.value + ' ans',
      p ? '• Prénom à inscrire : ' + p : '• Prénom : à préciser', '• Nombre d\'invités : ' + (f.invites.value || 'à préciser'),
      '• Date de la fête : ' + (f.date.value ? new Date(f.date.value + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'à préciser'),
      '• Idées : layer cake, cupcakes assortis, sweet table…', '', 'Merci !'].join('\n');
  }
  f.addEventListener('input', function () { maj(false); });
  f.addEventListener('submit', function (e) { e.preventDefault(); window.open(ELO.wa(message()), '_blank', 'noopener'); });
  maj(true);

  // rappel annuel
  var r = document.getElementById('form-rappel');
  if (r) r.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = r.prenomRappel.value.trim() || 'mon enfant', d = r.dateRappel.value;
    if (!d) { ELO.toast('Indiquez la date d\'anniversaire.'); return; }
    ELO.ics({ titre: 'Anniversaire de ' + p, date: d, annuel: true, rappelJours: +r.delai.value || 14, nom: 'anniversaire-' + p.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: 'Rappel de Les Douceurs d\'Elo : pensez à commander le gâteau ! ' + ELO.tel + ' · ' + ELO.site });
    ELO.toast('Rappel téléchargé : ouvrez le fichier pour l\'ajouter à votre agenda.');
  });
})();

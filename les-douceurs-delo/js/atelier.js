/* Les Douceurs d'Elo : configurateur « Composer mon gâteau » */
(function () {
  'use strict';
  var f = document.getElementById('form-atelier'); if (!f || !window.Gateau) return;
  var ELO = window.ELO, rendu = document.querySelector('#atelier .rendu');
  var prixEl = document.querySelector('[data-prix]'), resumeEl = document.querySelector('[data-resume]');
  function val(n) { var e = f.querySelector('[name="' + n + '"]:checked'); return e ? e.value : ''; }
  function lib(n) { var e = f.querySelector('[name="' + n + '"]:checked'); return e ? e.getAttribute('data-lib') : ''; }
  function libs(n) { return [].map.call(f.querySelectorAll('[name="' + n + '"]:checked'), function (e) { return e.getAttribute('data-lib'); }); }
  function fmt(id) { return ELO.formats.filter(function (x) { return x.id === id; })[0]; }
  function parfum(id) { return ELO.parfums.filter(function (x) { return x[0] === id; })[0]; }

  // pré-sélection depuis l'adresse (?occasion=mariage&format=etages3)
  try {
    var q = new URLSearchParams(location.search);
    ['occasion', 'format', 'parfum'].forEach(function (k) { var v = q.get(k); if (v) { var e = f.querySelector('[name="' + k + '"][value="' + v + '"]'); if (e) e.checked = true; } });
  } catch (e) {}

  function options() {
    var F = fmt(val('format')) || ELO.formats[1], p = parfum(val('parfum')) || ELO.parfums[1];
    var deco = {}; [].forEach.call(f.querySelectorAll('[name="deco"]:checked'), function (e) { deco[e.value] = true; });
    return {
      etages: F.etages.map(function (t) { return { w: t[0], h: t[1] }; }), cupcakes: F.cupcakes, cupcakesSeuls: !F.etages.length,
      creme: val('teinte') || '#fbf3ea', accent: val('accent') || '#c9a14e', couleurFleurs: val('accent') || '#e8a6a6',
      finition: val('finition') || 'lisse', parfum: [p[2], p[3], p[4]], deco: deco,
      texte: f.texte.value.trim(), bougie: f.bougie.value.replace(/\D/g, '').slice(0, 2),
      label: 'Aperçu : ' + F.nom + ', ' + p[1]
    };
  }
  var dernierFormat = '';
  function maj() {
    var o = options(), F = fmt(val('format')) || ELO.formats[1];
    rendu.innerHTML = Gateau.svg(o);
    if (dernierFormat !== F.id) { [].forEach.call(rendu.querySelectorAll('.etage'), function (e) { e.classList.add('rebond'); }); dernierFormat = F.id; }
    prixEl.textContent = F.prix ? 'dès ' + F.prix + ' €' : 'Sur devis';
    var d = libs('deco');
    resumeEl.textContent = F.nom + ' · ' + lib('parfum') + ' · ' + lib('finition') + (d.length ? ' · ' + d.join(', ') : '') + (F.parts ? ' · ' + F.parts : '');
    f.querySelector('[data-bloc-bougie]').hidden = !o.etages.length;
  }
  function message() {
    var d = libs('deco'), date = f.date.value ? new Date(f.date.value + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'à définir';
    var l = ['Bonjour Elo ! Je souhaite un devis pour ce gâteau composé sur votre site :',
      '• Occasion : ' + (lib('occasion') || '—'), '• Format : ' + lib('format'), '• Parfum : ' + lib('parfum'),
      '• Finition : ' + lib('finition'), '• Teinte : ' + lib('teinte') + ' / accent ' + lib('accent').toLowerCase(),
      '• Décor : ' + (d.length ? d.join(', ') : 'à voir ensemble')];
    if (f.texte.value.trim()) l.push('• Texte : « ' + f.texte.value.trim() + ' »');
    if (f.bougie.value.trim()) l.push('• Chiffre : ' + f.bougie.value.trim());
    l.push('• Date souhaitée : ' + date);
    if (f.details.value.trim()) l.push('• Précisions : ' + f.details.value.trim());
    if (f.prenom.value.trim()) l.push('', 'De la part de : ' + f.prenom.value.trim());
    return l.join('\n');
  }
  f.addEventListener('input', maj);
  f.addEventListener('change', maj);
  f.addEventListener('submit', function (e) { e.preventDefault(); window.open(ELO.wa(message()), '_blank', 'noopener'); });
  var bs = f.querySelector('[data-sms]'); if (bs) bs.addEventListener('click', function () { location.href = ELO.sms(message()); });
  var bc = f.querySelector('[data-copier]');
  if (bc) bc.addEventListener('click', function () {
    var t = message();
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { ELO.toast('Récapitulatif copié : collez-le dans votre message.'); }, function () { prompt('Copiez ce récapitulatif :', t); });
  });
  var bh = document.querySelector('[data-hasard]');
  if (bh) bh.addEventListener('click', function () {
    ['format', 'parfum', 'finition', 'teinte', 'accent'].forEach(function (n) {
      var opts = f.querySelectorAll('[name="' + n + '"]'); opts[Math.floor(Math.random() * opts.length)].checked = true;
    });
    [].forEach.call(f.querySelectorAll('[name="deco"]'), function (e) { e.checked = Math.random() > .55; });
    dernierFormat = ''; maj(); ELO.toast('Une idée surprise ! Ajustez-la à votre goût.');
  });
  var min = new Date(); min.setDate(min.getDate() + 2); f.date.min = min.toISOString().slice(0, 10);
  maj();
})();

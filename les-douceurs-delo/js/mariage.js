/* Les Douceurs d'Elo : simulateur de pièce montée (page mariage) */
(function () {
  'use strict';
  var f = document.getElementById('form-mariage'); if (!f || !window.Gateau) return;
  var ELO = window.ELO, rendu = document.querySelector('#simulateur-mariage .rendu');
  var PARTS = { 15: 12, 20: 20, 25: 32, 30: 45, 35: 60, 40: 80 };
  var PALIERS = [[25, [20, 15]], [45, [25, 20, 15]], [70, [30, 25, 20]], [100, [30, 25, 20, 15]], [130, [35, 30, 25, 20]], [165, [35, 30, 25, 20, 15]], [240, [40, 35, 30, 25, 20]]];
  var STYLES = {
    perles: { finition: 'lisse', deco: { perles: true }, lib: 'Crème lisse & perles' },
    fleurs: { finition: 'lisse', deco: { fleurs: true }, lib: 'Fleurs en cascade' },
    or: { finition: 'lisse', deco: { or: true, perles: true }, lib: 'Feuille d\'or' },
    naked: { finition: 'naked', deco: { fleurs: true, fruits: true }, lib: 'Naked cake champêtre' },
    rosettes: { finition: 'lisse', deco: { rosettes: true, perles: true }, lib: 'Rosettes & dentelle' }
  };
  function val(n) { var e = f.querySelector('[name="' + n + '"]:checked'); return e ? e.value : ''; }
  function lib(n) { var e = f.querySelector('[name="' + n + '"]:checked'); return e ? e.getAttribute('data-lib') : ''; }
  function palier(n) { for (var i = 0; i < PALIERS.length; i++) if (n <= PALIERS[i][0]) return PALIERS[i]; return PALIERS[PALIERS.length - 1]; }
  function calc() {
    var n = +f.invites.value, p = palier(n), d = p[1], parts = d.reduce(function (s, x) { return s + PARTS[x]; }, 0);
    var extra = Math.max(0, n - parts);
    return { n: n, diam: d, parts: parts, extra: extra };
  }
  function maj() {
    var c = calc(), st = STYLES[val('style')] || STYLES.perles, nb = c.diam.length;
    var h = nb <= 3 ? 96 : nb === 4 ? 80 : 66;
    document.querySelector('[data-out-invites]').textContent = c.n;
    rendu.innerHTML = Gateau.svg({
      etages: c.diam.map(function (d) { return { w: 70 + d * 6, h: h }; }),
      creme: val('teinte') || '#fbf3ea', accent: '#c9a14e', couleurFleurs: val('fleurs') || '#e8c8be',
      finition: st.finition, deco: st.deco, parfum: ['#f0dbb2', '#fbf3ea', '#d9475b'],
      texte: f.initiales.value.trim(), label: 'Aperçu de la pièce montée ' + nb + ' étages'
    });
    [].forEach.call(rendu.querySelectorAll('.etage'), function (e) { e.classList.add('rebond'); });
    document.querySelector('[data-etages]').textContent = nb + ' étages';
    document.querySelector('[data-diametres]').textContent = 'Ø ' + c.diam.join(' / ') + ' cm';
    document.querySelector('[data-parts]').textContent = '≈ ' + c.parts + ' parts';
    var cons = document.querySelector('[data-conseil]');
    cons.innerHTML = c.extra > 0
      ? 'Pour ' + c.n + ' invités, complétez avec un <b>gâteau de service</b> ou environ <b>' + c.extra + ' cupcakes</b> présentés en sweet table.'
      : 'Belle marge : <b>' + (c.parts - c.n) + ' parts</b> d\'avance pour les gourmands et le lendemain.';
  }
  function message() {
    var c = calc();
    return ['Bonjour Elo ! Nous préparons notre mariage et aimerions un devis pour une pièce montée :',
      '• Invités : ' + c.n, '• Proposition du simulateur : ' + c.diam.length + ' étages (Ø ' + c.diam.join('/') + ' cm, ≈ ' + c.parts + ' parts)',
      '• Style : ' + lib('style'), '• Teinte : ' + lib('teinte'), '• Couleur des fleurs / accents : ' + lib('fleurs'),
      f.initiales.value.trim() ? '• Topper : « ' + f.initiales.value.trim() + ' »' : '• Topper : à définir',
      '• Date du mariage : ' + (f.date.value ? new Date(f.date.value + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'à préciser'),
      '', 'Merci !'].join('\n');
  }
  f.addEventListener('input', maj);
  f.addEventListener('submit', function (e) { e.preventDefault(); window.open(ELO.wa(message()), '_blank', 'noopener'); });
  maj();
})();

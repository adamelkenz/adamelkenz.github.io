/* Les Douceurs d'Elo : « Combien de parts ? » (tarifs, layer cakes) */
(function () {
  'use strict';
  var f = document.getElementById('form-parts'); if (!f) return;
  var ELO = window.ELO;
  function F(id) { return ELO.formats.filter(function (x) { return x.id === id; })[0]; }
  function conseil(n) {
    if (n <= 2) return { fmt: ['bento'], txt: 'Un bento cake, le petit gâteau à partager à deux' };
    if (n <= 6) return { fmt: ['layer46'], txt: 'Un layer cake 4/6 parts' };
    if (n <= 8) return { fmt: ['layer68'], txt: 'Un layer cake 6/8 parts' };
    if (n <= 12) return { fmt: ['layer1012'], txt: 'Un layer cake 10/12 parts' };
    if (n <= 20) return { fmt: ['layer1012', 'layer68'], txt: 'Un layer cake 10/12 + un 6/8, ou un gâteau 2 étages' };
    if (n <= 30) return { fmt: ['etages2'], txt: 'Un gâteau 2 étages' };
    if (n <= 60) return { fmt: ['etages3'], txt: 'Une pièce montée 3 étages' };
    if (n <= 100) return { fmt: ['etages4'], txt: 'Une pièce montée 4 étages' };
    return { fmt: ['etages4'], txt: 'Une pièce montée 4 étages + cupcakes ou gâteau de service', extra: n - 100 };
  }
  function maj() {
    var invites = +f.invites.value, autres = f.autres.checked, n = autres ? Math.ceil(invites * .8) : invites;
    f.querySelector('[data-out-invites]').textContent = invites;
    var c = conseil(n), prix = 0, devis = false;
    c.fmt.forEach(function (id) { var x = F(id); if (x && x.prix) prix += x.prix; else devis = true; });
    f.querySelector('[data-p-format]').textContent = c.txt;
    f.querySelector('[data-p-parts]').textContent = n + (n > 1 ? ' parts' : ' part');
    f.querySelector('[data-p-budget]').textContent = devis ? 'Sur devis' : 'dès ' + prix + ' €';
    var h = '', tot = Math.min(invites, 150);
    for (var i = 0; i < tot; i++) h += '<i style="--n:' + i + '"' + (autres && i >= n ? ' class="cup"' : '') + '></i>';
    f.querySelector('.parts-visu').innerHTML = h;
    var lien = f.querySelector('[data-p-lien]'); if (lien) lien.href = lien.getAttribute('data-base') + '?format=' + c.fmt[0];
  }
  f.addEventListener('input', maj);
  maj();
})();

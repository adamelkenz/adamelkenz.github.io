/* Allô P'tites Pattes — « Allô ? On s'appelle ! » : les rendez-vous se prennent par téléphone
   (une ligne fixe, donc pas de SMS). Quelques choix, et le pense-bête de l'appel s'écrit tout seul ;
   le vieux téléphone à cadran compose le numéro du salon. */
(function () {
  var form = document.querySelector('[data-appel-form]');
  var script = document.querySelector('[data-script]');
  if (!form || !script) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var combine = document.querySelector('.combine');
  var retour = document.querySelector('[data-retour]');
  var ecran = document.querySelector('[data-ecran]');
  var cadran = document.querySelector('[data-cadran]');
  var trous = document.querySelector('[data-trous]');
  var champNom = form.querySelector('[data-champ="nom"]'), champRace = form.querySelector('[data-champ="race"]');

  var SOINS = {
    complet: 'un toilettage complet', bain: 'un bain avec séchage', brushing: 'un brushing', coupe: 'une coupe',
    demelage: 'un démêlage', hygiene: 'les soins d’hygiène', griffes: 'la coupe des griffes', oreilles: 'le nettoyage des oreilles'
  };
  var GABARITS = { petit: 'de petit gabarit', moyen: 'de taille moyenne', grand: 'de grand gabarit' };
  var JOURS = { 1: 'lundi', 2: 'mardi', 3: 'mercredi', 4: 'jeudi', 5: 'vendredi' };

  function choix(groupe) {
    return [].slice.call(form.querySelectorAll('[data-groupe="' + groupe + '"] [aria-pressed="true"]')).map(function (b) { return b.getAttribute('data-valeur'); });
  }
  function enumere(liste, et) {
    if (liste.length < 2) return liste.join('');
    return liste.slice(0, -1).join(', ') + ' ' + et + ' ' + liste[liste.length - 1];
  }
  function propre(v) { return (v || '').replace(/\s+/g, ' ').trim(); }

  function redige() {
    var nom = propre(champNom && champNom.value), race = propre(champRace && champRace.value);
    var gab = choix('gabarit')[0], soins = choix('soins'), jours = choix('jours'), moment = choix('moment')[0], premiere = choix('premiere')[0];
    var lignes = ['Bonjour Chloé ! Je vous appelle pour prendre rendez-vous.'];

    var chien = 'C’est pour ' + (nom || 'mon chien');
    if (race) chien += ', ' + (nom ? 'mon ' : 'un ') + race + (gab ? ' ' + GABARITS[gab] : '');
    else if (gab) chien += ', ' + (nom ? 'un chien ' : '') + GABARITS[gab];
    lignes.push(chien + '.');

    var voulus = soins.filter(function (s) { return SOINS[s]; }).map(function (s) { return SOINS[s]; });
    if (voulus.length) lignes.push('J’aimerais ' + enumere(voulus, 'et') + '.');
    if (soins.indexOf('conseil') >= 0) lignes.push(voulus.length ? 'Et j’aimerais votre avis sur ce qui lui conviendrait le mieux.' : 'Je ne sais pas trop quels soins choisir : pourrez-vous me conseiller ?');

    var quand = '';
    if (jours.length === 5) quand = 'n’importe quel jour de la semaine';
    else if (jours.length) quand = enumere(jours.map(function (j) { return 'le ' + JOURS[j]; }), 'ou');
    var heure = moment === 'matin' ? 'le matin' : moment === 'aprem' ? 'l’après-midi' : '';
    if (quand || heure) lignes.push('Je suis plutôt disponible ' + [quand, heure].filter(Boolean).join(', ') + '.');

    if (premiere === 'oui') lignes.push('Ce sera ' + (nom ? 'la première visite de ' + nom : 'sa première visite') + ' au salon.');
    if (premiere === 'non') lignes.push('Vous connaissez déjà ' + (nom || 'mon chien') + ' !');
    lignes.push('Merci, à bientôt !');
    script.textContent = lignes.join('\n');
  }

  // puces : choix multiples, ou un seul choix quand le groupe est marqué data-unique
  form.addEventListener('click', function (e) {
    var b = e.target.closest('.puces button');
    if (!b) return;
    var groupe = b.parentNode, unique = groupe.hasAttribute('data-unique');
    var etait = b.getAttribute('aria-pressed') === 'true';
    if (unique) [].slice.call(groupe.children).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', String(!etait));
    redige();
  });
  form.addEventListener('input', redige);
  redige();

  /* ---------- copier le pense-bête ---------- */
  var btnCopie = document.querySelector('[data-copier]');
  function dit(txt) {
    if (!retour) return;
    retour.textContent = txt;
    clearTimeout(dit.t);
    dit.t = setTimeout(function () { retour.textContent = ''; }, 4000);
  }
  if (btnCopie) btnCopie.addEventListener('click', function () {
    var txt = script.textContent;
    var ok = function () { dit('Pense-bête copié : il ne reste qu’à appeler !'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(ok, function () { selectionne(); });
    } else selectionne();
    function selectionne() {
      var r = document.createRange(); r.selectNodeContents(script);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      try { if (document.execCommand('copy')) { ok(); return; } } catch (err) { /* rien */ }
      dit('Texte sélectionné : copiez-le avec Ctrl+C.');
    }
  });

  /* ---------- le téléphone à cadran ---------- */
  var BUTEE = 40; // la butée du cadran, en degrés (sens horaire, 0 = à droite)
  var NUMERO = '0470416965';
  if (trous) {
    var svgNS = 'http://www.w3.org/2000/svg';
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(function (chiffre, i) {
      var a = (BUTEE - 60 - 30 * i) * Math.PI / 180;
      var c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', (Math.cos(a) * 23.5).toFixed(2));
      c.setAttribute('cy', (Math.sin(a) * 23.5).toFixed(2));
      c.setAttribute('r', '4.6');
      trous.appendChild(c);
    });
  }
  function formate(ch) { return ch.replace(/(\d{2})(?=\d)/g, '$1 '); }
  var compose = false;
  function tourne(chiffre) {
    // le chiffre n emmène le cadran de 60° + 30° × (n − 1) ; le 0 vaut 10
    var n = chiffre === 0 ? 10 : chiffre, angle = 60 + 30 * (n - 1);
    var aller = 120 + angle * 2.2, retourT = 140 + angle * 2.6, t0 = performance.now();
    return new Promise(function (fini) {
      (function pas(t) {
        var dt = t - t0, a;
        if (dt < aller) { var u = dt / aller; a = angle * (1 - Math.pow(1 - u, 2)); }
        else if (dt < aller + 70) a = angle;
        else if (dt < aller + 70 + retourT) { var v = (dt - aller - 70) / retourT; a = angle * (1 - v * v); }
        else { cadran.setAttribute('transform', 'rotate(0)'); fini(); return; }
        cadran.setAttribute('transform', 'rotate(' + a.toFixed(1) + ')');
        requestAnimationFrame(pas);
      })(t0);
    });
  }
  function composeNumero() {
    if (compose || !cadran || !ecran) return;
    if (calme) { ecran.textContent = formate(NUMERO); return; }
    compose = true;
    var tape = '';
    ecran.textContent = ' ';
    var suite = Promise.resolve();
    NUMERO.split('').forEach(function (c) {
      suite = suite.then(function () { return tourne(+c); }).then(function () {
        tape += c; ecran.textContent = formate(tape);
      });
    });
    suite.then(function () {
      compose = false;
      if (combine) { combine.classList.remove('sonne'); void combine.offsetWidth; combine.classList.add('sonne'); }
    });
  }
  // il compose tout seul la première fois qu'on le voit
  if (combine && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { composeNumero(); io.disconnect(); }
    }, { threshold: .5 });
    io.observe(combine);
  }
  var btnAppel = document.querySelector('[data-composer]');
  if (btnAppel) btnAppel.addEventListener('click', function () {
    if (combine) { combine.classList.remove('sonne'); void combine.offsetWidth; combine.classList.add('sonne'); }
    composeNumero();
  });
})();

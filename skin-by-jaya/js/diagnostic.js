/* Skin By Jaya — diagnostic de peau : quatre questions, puis le soin de la carte qui colle le mieux.
   Les prix et durées sont ceux de la carte (index.html) ; à modifier aux deux endroits. */
(function () {
  var diag = document.querySelector('[data-diag]');
  if (!diag) return;

  // cibles : 0 à 3 selon la priorité ; doux : convient aux peaux sensibles ; flash : sans suites visibles
  var SOINS = [
    { id: 'glow', en: {"nom": "Jaya Glow Protocol", "but": "Signature treatment · radiance & dark-spot correction", "pourquoi": "A gentle peel, microneedling and renewing actives work together to even out the complexion and fade dark spots."}, nom: 'Protocole Jaya Glow', but: 'Soin signature · éclat & correction des taches', duree: '1 h 30', prix: 130, cure: 330,
      cibles: { taches: 3, eclat: 2, texture: 1 }, doux: false, flash: false,
      pourquoi: 'Peeling doux, microneedling et actifs rénovateurs travaillent ensemble pour unifier le teint et estomper les taches.' },
    { id: 'peeling', en: {"nom": "Custom peel", "but": "Dark spots & uneven tone", "pourquoi": "A peel chosen for your skin that smooths texture and gradually fades dark spots."}, nom: 'Peeling sur mesure', but: 'Taches & teint irrégulier', duree: '1 h 30', prix: 90, cure: 240,
      cibles: { taches: 3, texture: 2, eclat: 1 }, doux: false, flash: false, gras: true,
      pourquoi: 'Un peeling choisi pour votre peau, qui lisse le grain et atténue progressivement les taches.' },
    { id: 'micro', en: {"nom": "Targeted microneedling", "but": "Regeneration & skin quality", "pourquoi": "It boosts skin renewal: refined texture, less visible pores and marks."}, nom: 'Microneedling ciblé', but: 'Régénération & qualité de peau', duree: '1 h 30', prix: 80, cure: null,
      cibles: { texture: 3, taches: 1, eclat: 1 }, doux: false, flash: false, gras: true,
      pourquoi: 'Il stimule le renouvellement de la peau&nbsp;: grain affiné, pores et marques moins visibles.' },
    { id: 'detox', en: {"nom": "Anti-pollution detox", "but": "Hydra Skin Facial · purity & radiance", "pourquoi": "Deep cleansing and rehydration: your skin breathes again and gets its healthy glow back."}, nom: 'Détox anti-pollution', but: 'Hydra Skin Facial · pureté & éclat', duree: '1 h', prix: 70, cure: 180,
      cibles: { eclat: 2, texture: 1 }, doux: true, flash: true, gras: true, hydrate: true,
      pourquoi: 'Nettoyage en profondeur et réhydratation&nbsp;: la peau respire et retrouve sa bonne mine.' },
    { id: 'liftant', en: {"nom": "Lifting facial", "but": "Instant tightening effect", "pourquoi": "A tightening treatment that tones and redefines the jawline, perfect before a big day."}, nom: 'Soin liftant', but: 'Effet tenseur immédiat', duree: '1 h 30', prix: 90, cure: 230,
      cibles: { fermete: 2, eclat: 1 }, doux: true, flash: true,
      pourquoi: 'Un soin tenseur qui tonifie et redessine l\'ovale, parfait avant un rendez-vous important.' },
    { id: 'prx', en: {"nom": "PRX-T33", "but": "Biorevitalising peel", "pourquoi": "A peel that works on both firmness and radiance, usually with discreet after-effects."}, nom: 'PRX-T33', but: 'Peeling biorevitalisant', duree: '1 h 30', prix: 130, cure: 330,
      cibles: { fermete: 2, eclat: 2, texture: 1 }, doux: true, flash: true,
      pourquoi: 'Un peeling qui travaille à la fois la fermeté et l\'éclat, avec des suites généralement discrètes.' },
    { id: 'exo', en: {"nom": "Exosomes", "but": "Regenerative Therapy", "pourquoi": "A regenerating treatment that brings vitality and quality back to tired or sensitised skin."}, nom: 'Exosomes', but: 'Regenerative Therapy', duree: '1 h 30', prix: 180, cure: 470,
      cibles: { eclat: 2, fermete: 1, texture: 2 }, doux: true, flash: false, hydrate: true,
      pourquoi: 'Un soin régénérant pour redonner vitalité et qualité aux peaux fatiguées ou sensibilisées.' },
    { id: 'glass', en: {"nom": "Glass Skin", "but": "Deep hydration · glass-skin effect", "pourquoi": "The premium treatment for plump, smooth, luminous skin, the kind that catches the light."}, nom: 'Glass Skin', but: 'Hydratation profonde · effet peau de verre', duree: '30 min', prix: 420, cure: null,
      cibles: { eclat: 3 }, doux: true, flash: true, hydrate: true,
      pourquoi: 'Le soin premium pour une peau rebondie, lisse et lumineuse, celle qui accroche la lumière.' },
    { id: 'hifu-bas', en: {"nom": "HIFU lower face", "but": "High-precision lift, without surgery", "pourquoi": "Focused ultrasound that gradually firms the jawline and lower face."}, nom: 'HIFU bas du visage', but: 'Lift haute précision, sans chirurgie', duree: '1 h', prix: 120, cure: 360,
      cibles: { fermete: 3 }, doux: true, flash: false,
      pourquoi: 'Des ultrasons focalisés qui raffermissent l\'ovale et le bas du visage, progressivement.' },
    { id: 'hifu', en: {"nom": "Full-face HIFU", "but": "High-precision lift, without surgery", "pourquoi": "Focused ultrasound across the whole face for a lifting effect that builds over the weeks."}, nom: 'HIFU visage complet', but: 'Lift haute précision, sans chirurgie', duree: '1 h 30', prix: 220, cure: 580,
      cibles: { fermete: 3, texture: 1 }, doux: true, flash: false,
      pourquoi: 'Des ultrasons focalisés sur tout le visage pour un effet lift qui s\'installe au fil des semaines.' }
  ];
  var ORDRE = ['priorite', 'peau', 'budget', 'rythme'];

  var etapes = ORDRE.map(function (q) { return diag.querySelector('[data-q="' + q + '"]'); });
  var resultat = diag.querySelector('[data-diag-resultat]');
  var barre = diag.querySelector('[data-diag-barre]');
  var libelle = diag.querySelector('[data-diag-etape]');
  var retour = diag.querySelector('[data-diag-retour]');
  var rep = {}, courant = 0, attente;

  var trad = window.trad || function (fr) { return fr; };
  function txt(s, champ) { return window.LANGUE === 'en' && s.en ? s.en[champ] : s[champ]; }
  function euros(n) { return n + '&nbsp;€'; }
  function niveau(prix) { return prix < 100 ? 1 : prix <= 150 ? 2 : 3; }

  function note(s) {
    var c = s.cibles[rep.priorite] || 0;
    if (!c) return -Infinity;
    var v = c * 4;
    var b = +rep.budget, n = niveau(s.prix);
    v += n === b ? 3 : n < b ? 1 : -4 * (n - b);
    if (rep.peau === 'sensible') v += s.doux ? 1.5 : -3;
    if (rep.peau === 'grasse' && s.gras) v += 1.5;
    if (rep.peau === 'seche' && s.hydrate) v += 1.5;
    if (rep.rythme === 'flash') v += s.flash ? 2 : -1.5;
    else v += s.cure ? 1.5 : -1;
    return v;
  }

  function blocPrix(s) {
    var h = '<div><dt>' + s.duree + '</dt><dd>' + euros(s.prix) + '</dd></div>';
    if (s.cure) h += '<div><dt>' + trad('Cure de 3', 'Course of 3') + '</dt><dd>' + euros(s.cure) + '</dd></div>';
    return h;
  }

  function montreResultat() {
    var classes = SOINS.map(function (s) { return { s: s, v: note(s) }; })
      .filter(function (x) { return x.v > -Infinity; })
      .sort(function (a, b) { return b.v - a.v; });
    var s = classes[0].s, alt = classes[1] && classes[1].s;
    var pourquoi = txt(s, 'pourquoi');
    if (rep.peau === 'sensible' && s.doux) pourquoi += trad(' Un protocole doux, adapté aux peaux réactives.', ' A gentle protocol, suited to reactive skin.');
    if (rep.rythme === 'cure' && s.cure) pourquoi += trad(' En cure de trois séances, le résultat s\'installe durablement.', ' Over a course of three sessions, the results settle in for the long term.');
    if (rep.rythme === 'flash' && s.flash) pourquoi += trad(' Un bon choix pour être belle rapidement, avant un événement.', ' A good choice to look your best quickly, before an event.');

    resultat.querySelector('[data-r-nom]').textContent = txt(s, 'nom');
    resultat.querySelector('[data-r-but]').textContent = txt(s, 'but');
    resultat.querySelector('[data-r-pourquoi]').innerHTML = pourquoi;
    resultat.querySelector('[data-r-prix]').innerHTML = blocPrix(s);
    var a = resultat.querySelector('[data-r-alt]');
    if (alt) {
      a.hidden = false;
      a.innerHTML = trad('À envisager aussi&nbsp;: ', 'Also worth considering: ') + '<b>' + txt(alt, 'nom') + '</b> · ' + alt.duree + ', ' + euros(alt.prix) +
        (alt.cure ? trad(' (cure de 3&nbsp;: ', ' (course of 3: ') + euros(alt.cure) + ')' : '') + '.';
    } else a.hidden = true;
  }

  function va(i) {
    courant = i;
    etapes.forEach(function (e, k) { e.hidden = k !== i; });
    var fin = i >= ORDRE.length;
    resultat.hidden = !fin;
    retour.hidden = i === 0 || fin;
    barre.style.width = (fin ? 100 : (i + 1) / ORDRE.length * 100) + '%';
    libelle.textContent = fin ? trad('Votre résultat', 'Your result') : 'Question ' + (i + 1) + trad(' sur ', ' of ') + ORDRE.length;
    if (fin) { montreResultat(); resultat.focus({ preventScroll: true }); }
  }
  if (window.LANGUE === 'en') libelle.textContent = 'Question 1 of ' + ORDRE.length;
  // changement de langue : on réécrit l'étape et, s'il est affiché, le résultat
  document.addEventListener('langue', function () {
    var fin = courant >= ORDRE.length;
    libelle.textContent = fin ? trad('Votre résultat', 'Your result') : 'Question ' + (courant + 1) + trad(' sur ', ' of ') + ORDRE.length;
    if (fin) montreResultat();
  });

  // au clic, on passe tout seul à la question suivante ; au clavier, les flèches choisissent et Entrée valide
  etapes.forEach(function (e, k) {
    var fleche = false;
    function suite(delai) {
      clearTimeout(attente);
      attente = setTimeout(function () {
        va(k + 1);
        var suivant = etapes[k + 1];
        if (suivant) {
          var coche = suivant.querySelector('input:checked') || suivant.querySelector('input');
          if (coche && diag.contains(document.activeElement)) coche.focus({ preventScroll: true });
        }
      }, delai);
    }
    e.addEventListener('keydown', function (ev) {
      if (/^Arrow/.test(ev.key)) fleche = true;
      if (ev.key === 'Enter' && rep[ORDRE[k]]) { ev.preventDefault(); suite(0); }
    });
    e.addEventListener('change', function (ev) {
      rep[ORDRE[k]] = ev.target.value;
      if (fleche) { fleche = false; return; }
      suite(320);
    });
  });
  retour.addEventListener('click', function () { clearTimeout(attente); va(Math.max(0, courant - 1)); });
  diag.querySelector('[data-diag-refaire]').addEventListener('click', function () {
    rep = {};
    diag.querySelectorAll('input').forEach(function (i) { i.checked = false; });
    va(0);
    var premier = etapes[0].querySelector('input');
    if (premier) premier.focus({ preventScroll: true });
  });
})();

/* Beauty by Léna — coordonnées, animations et interactions.
   Coordonnées et horaires de l'institut : ici. Un champ laissé vide est simplement masqué sur le site. */
var SALON = {
  tel: '',            // format international, ex. '+33600000000' (bouton « Envoyer par SMS »)
  telAffiche: '',     // ex. '06 00 00 00 00'
  whatsapp: '',       // ex. '+33600000000' (bouton « Envoyer sur WhatsApp »)
  email: '',
  adresse: '',        // ex. '12 avenue …, 13920 Saint-Mitre-les-Remparts'
  reservation: '',    // lien de réservation en ligne (Planity, etc.)
  instagram: '',      // lien complet du profil
  facebook: '',
  carte: 'https://www.google.com/maps/search/?api=1&query=Beauty%20by%20L%C3%A9na%20Saint-Mitre-les-Remparts',
  // horaires : [jour 0=dimanche … 6=samedi] = [[ouverture, fermeture], …] en heures décimales ; {} = non renseignés
  // ex. { 2: [[9, 12], [14, 19]], 3: [[9, 19]], 6: [[9, 16]] }
  horaires: {}
};

(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finPointeur = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var html = document.documentElement;
  if (finPointeur) html.classList.add('pointeur-fin');
  function bornes(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function eclat(x, y) { if (window.paillettesEclat) window.paillettesEclat(x, y); }

  /* ---------- coordonnées ---------- */
  var JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  var aHoraires = Object.keys(SALON.horaires).length > 0;
  document.querySelectorAll('[data-si]').forEach(function (el) {
    var cle = el.getAttribute('data-si');
    var ok = cle === 'horaires' ? aHoraires : !!SALON[cle];
    el.hidden = !ok;
    if (ok && el.tagName === 'A') el.href = SALON[cle];
  });
  document.querySelectorAll('[data-champ]').forEach(function (el) {
    var cle = el.getAttribute('data-champ');
    if (cle === 'tel') { el.textContent = SALON.telAffiche || SALON.tel; el.href = 'tel:' + SALON.tel; }
    else if (cle === 'email') { el.textContent = SALON.email; el.href = 'mailto:' + SALON.email; }
    else el.textContent = SALON[cle];
  });
  document.querySelectorAll('[data-lien="carte"]').forEach(function (a) { a.href = SALON.carte; });

  function heure(h) { var m = Math.round((h % 1) * 60); return Math.floor(h) + ' h' + (m ? (m < 10 ? '0' : '') + m : ''); }
  if (aHoraires) {
    var liste = document.querySelector('.horaires-liste');
    var maintenant = new Date();
    var auj = maintenant.getDay();
    var hNow = maintenant.getHours() + maintenant.getMinutes() / 60;
    [1, 2, 3, 4, 5, 6, 0].forEach(function (j) {
      var li = document.createElement('li');
      var p = SALON.horaires[j];
      li.innerHTML = '<span>' + JOURS[j] + '</span><span>' + (p && p.length ? p.map(function (c) { return heure(c[0]) + ' – ' + heure(c[1]); }).join(', ') : 'Fermé') + '</span>';
      if (j === auj) li.className = 'aujourdhui';
      liste.appendChild(li);
    });
    var ouvert = (SALON.horaires[auj] || []).some(function (c) { return hNow >= c[0] && hNow < c[1]; });
    var statut = document.querySelector('.statut');
    statut.textContent = ouvert ? 'Ouvert en ce moment' : 'Fermé en ce moment';
    statut.classList.toggle('ouvert', ouvert);
  }

  /* ---------- titres lettre par lettre ---------- */
  document.querySelectorAll('[data-lettres]').forEach(function (el, l) {
    var texte = el.textContent;
    el.setAttribute('aria-label', texte);
    el.innerHTML = texte.split('').map(function (c, i) {
      return '<span class="lettre" aria-hidden="true" style="--i:' + i + ';--l:' + l + '">' + (c === ' ' ? ' ' : c) + '</span>';
    }).join('');
  });

  /* ---------- rideau d'ouverture (une fois par session) ---------- */
  var rideau = document.querySelector('.rideau');
  var hero = document.querySelector('.hero');
  var dejaVu = false;
  try { dejaVu = sessionStorage.getItem('lena-rideau') === '1'; } catch (e) {}
  function lancerHero() { hero.classList.add('pret'); }
  if (!rideau || dejaVu || calme) {
    if (rideau) rideau.classList.add('vu');
    requestAnimationFrame(lancerHero);
  } else {
    try { sessionStorage.setItem('lena-rideau', '1'); } catch (e) {}
    requestAnimationFrame(function () { requestAnimationFrame(function () { rideau.classList.add('trace'); }); });
    setTimeout(function () { rideau.classList.add('verni'); }, 1250);
    setTimeout(function () { rideau.classList.add('ouvre'); lancerHero(); }, 1950);
    setTimeout(function () { rideau.classList.add('vu'); }, 3300);
  }

  /* ---------- en-tête, jauge de vernis ---------- */
  var entete = document.querySelector('.entete');
  var jauge = document.querySelector('.jauge');
  var dernierY = window.scrollY;
  var menuOuvert = false;
  function surDefilement() {
    var y = window.scrollY;
    entete.classList.toggle('defile', y > 30);
    entete.classList.toggle('masque', !menuOuvert && y > 700 && y > dernierY + 4);
    if (y < dernierY - 4 || y < 700) entete.classList.remove('masque');
    dernierY = y;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (jauge) jauge.style.setProperty('--p', max > 0 ? (y / max).toFixed(3) : 0);
  }
  window.addEventListener('scroll', surDefilement, { passive: true });
  surDefilement();

  /* ---------- menu mobile ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mobile');
  function basculerMenu(ouvrir) {
    menuOuvert = ouvrir;
    burger.setAttribute('aria-expanded', ouvrir);
    if (ouvrir) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('ouvert'); }); entete.classList.remove('masque'); }
    else { menu.classList.remove('ouvert'); menu.hidden = true; }
    document.body.style.overflow = ouvrir ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { basculerMenu(!menuOuvert); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) basculerMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOuvert) basculerMenu(false); });

  /* ---------- lien actif ---------- */
  var liensNav = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var ioNav = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) liensNav.forEach(function (a) { a.classList.toggle('actif', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { ioNav.observe(s); });
  }

  /* ---------- apparitions ---------- */
  var aReveler = document.querySelectorAll('[data-apparition], [data-devoiler]');
  aReveler.forEach(function (el) {
    var freres = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.hasAttribute('data-apparition'); });
    var n = freres.indexOf(el);
    if (n > 0) el.style.setProperty('--retard', Math.min(n, 6) * 0.09 + 's');
  });
  if ('IntersectionObserver' in window && !calme) {
    var ioApp = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (!en.isIntersecting) return;
        (en.target.cibles || [en.target]).forEach(function (c) { c.classList.add('vu'); });
        ioApp.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    aReveler.forEach(function (el) {
      // un élément masqué par clip-path n'a pas de surface visible : on observe son parent
      if (el.hasAttribute('data-devoiler')) { el.parentNode.cibles = [el]; ioApp.observe(el.parentNode); }
      else ioApp.observe(el);
    });
  } else {
    aReveler.forEach(function (el) { el.classList.add('vu'); });
  }

  /* ---------- manifeste : les mots s'allument au défilement ---------- */
  var manifeste = document.querySelector('[data-mots]');
  var mots = [];
  if (manifeste) {
    var accents = /^(forme|teinte|brillance|millimètre|détail)/i;
    manifeste.innerHTML = manifeste.textContent.split(/(\s+)/).map(function (m) {
      if (!m || /^\s+$/.test(m)) return m;
      return '<span class="mot' + (accents.test(m) ? ' accent' : '') + '">' + m + '</span>';
    }).join('');
    mots = manifeste.querySelectorAll('.mot');
  }

  /* ---------- curseur ---------- */
  var curseur = document.querySelector('.curseur');
  var souris = { x: -100, y: -100 }, anneau = { x: -100, y: -100 };
  if (finPointeur && curseur) {
    var texteCurseur = curseur.querySelector('.curseur-texte');
    document.addEventListener('pointermove', function (e) {
      souris.x = e.clientX; souris.y = e.clientY;
      curseur.style.setProperty('--cx', e.clientX + 'px');
      curseur.style.setProperty('--cy', e.clientY + 'px');
      curseur.classList.remove('cache');
      var cible = e.target.closest ? e.target.closest('a, button, label, select, input, textarea, [data-curseur]') : null;
      var image = e.target.closest ? e.target.closest('.oeuvre-cadre') : null;
      curseur.classList.toggle('sur-image', !!image);
      curseur.classList.toggle('sur-lien', !!cible && !image);
      if (image) texteCurseur.textContent = 'Voir';
    }, { passive: true });
    document.addEventListener('pointerleave', function () { curseur.classList.add('cache'); });
    document.addEventListener('pointerdown', function () { curseur.style.setProperty('--s', '.8'); });
    document.addEventListener('pointerup', function () { curseur.style.setProperty('--s', '1'); });
  }

  /* ---------- boutons aimantés ---------- */
  if (finPointeur && !calme) {
    document.querySelectorAll('.aimant').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--x', ((e.clientX - r.left - r.width / 2) * 0.28) + 'px');
        b.style.setProperty('--y', ((e.clientY - r.top - r.height / 2) * 0.38) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--x', '0px'); b.style.setProperty('--y', '0px'); });
    });
  }
  document.querySelectorAll('.bouton-plein').forEach(function (b) {
    b.addEventListener('click', function (e) { eclat(e.clientX, e.clientY); });
  });

  /* ---------- accueil : éventail au pointeur et au défilement ---------- */
  var cible = { x: 0, y: 0 }, pos = { x: 0, y: 0 };
  if (finPointeur && !calme) {
    hero.addEventListener('pointermove', function (e) {
      cible.x = (e.clientX / window.innerWidth - 0.5) * 2;
      cible.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    hero.addEventListener('pointerleave', function () { cible.x = 0; cible.y = 0; });
  }

  /* ---------- prestations : aperçu photo qui suit le pointeur ---------- */
  var apercu = document.querySelector('.presta-apercu');
  var apImg = apercu && apercu.querySelector('img');
  var ap = { x: 0, y: 0, tx: 0, ty: 0, actif: false };
  if (finPointeur && apercu) {
    document.querySelectorAll('.presta').forEach(function (p) {
      p.addEventListener('pointerenter', function (e) {
        var src = 'img/' + p.getAttribute('data-photo') + '-480.webp';
        if (apImg.getAttribute('src') !== src) apImg.setAttribute('src', src);
        if (!ap.actif) { ap.x = e.clientX; ap.y = e.clientY; }
        ap.actif = true;
      });
      p.addEventListener('pointermove', function (e) { ap.tx = e.clientX; ap.ty = e.clientY; });
    });
    document.querySelector('.presta-liste').addEventListener('pointerleave', function () { ap.actif = false; });
  }

  /* ---------- bandeau défilant (accéléré par le défilement) ---------- */
  var piste = document.querySelector('.bandeau-piste');
  var bx = 0, vitesse = 0, yPrec = window.scrollY;

  /* ---------- galerie : les créations se distribuent comme un jeu de cartes ---------- */
  var galerie = document.querySelector('.galerie');
  var gPiste = galerie.querySelector('.galerie-piste');
  var gBarre = galerie.querySelector('.galerie-barre');
  var oeuvres = galerie.querySelectorAll('.oeuvre');
  var cartes = Array.prototype.slice.call(galerie.querySelectorAll('.oeuvre, .oeuvre-fin'));
  var PAQUET = [-9, 6, -4, 9, -1];   // inclinaison de chaque carte dans le paquet
  var epingle = false, ecarts = [];
  function adoucir(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function mesurerGalerie() {
    epingle = window.innerWidth > 1000 && !calme;
    galerie.classList.toggle('distribue', epingle);
    cartes.forEach(function (c) { c.style.transform = ''; });
    if (!epingle) { galerie.style.height = ''; return; }
    galerie.style.height = Math.round(window.innerHeight * 2.4) + 'px';
    var cx = gPiste.clientWidth / 2, cy = gPiste.clientHeight / 2;
    ecarts = cartes.map(function (c, i) {
      c.style.zIndex = cartes.length - i;
      return { x: cx - (c.offsetLeft + c.offsetWidth / 2), y: cy - (c.offsetTop + c.offsetHeight / 2) };
    });
  }
  mesurerGalerie();
  window.addEventListener('resize', mesurerGalerie);
  window.addEventListener('load', mesurerGalerie);
  gPiste.addEventListener('scroll', function () {
    if (epingle) return;
    var max = gPiste.scrollWidth - gPiste.clientWidth;
    gBarre.style.setProperty('--gp', max > 0 ? gPiste.scrollLeft / max : 0);
  }, { passive: true });

  /* inclinaison et reflet des créations */
  if (finPointeur && !calme) {
    document.querySelectorAll('[data-incliner] .oeuvre-cadre').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', ((x - 0.5) * 14) + 'deg');
        c.style.setProperty('--rx', ((0.5 - y) * 12) + 'deg');
        c.style.setProperty('--gl', x.toFixed(3));
      });
      c.addEventListener('pointerleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }

  /* visionneuse */
  var cadres = Array.prototype.slice.call(document.querySelectorAll('.oeuvre-cadre'));
  function visionner(index) {
    if (curseur) curseur.classList.remove('sur-image', 'sur-lien');
    var fond = document.createElement('div');
    fond.className = 'visionneuse';
    fond.setAttribute('role', 'dialog');
    fond.setAttribute('aria-modal', 'true');
    fond.setAttribute('aria-label', 'Création agrandie');
    fond.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="v-fermer" type="button" aria-label="Fermer">×</button>' +
      '<button class="v-prec" type="button" aria-label="Création précédente">←</button>' +
      '<button class="v-suiv" type="button" aria-label="Création suivante">→</button>';
    var img = fond.querySelector('img'), leg = fond.querySelector('figcaption');
    function montrer(i) {
      index = (i + cadres.length) % cadres.length;
      var source = cadres[index].querySelector('img');
      img.src = source.currentSrc.replace(/-(320|480)\.webp$/, '.webp');
      img.alt = source.alt;
      leg.innerHTML = cadres[index].closest('.oeuvre').querySelector('figcaption').innerHTML.replace(/<span>.*?<\/span>\s*/, '');
      img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
    }
    function clore() { fond.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', touche); cadres[index].focus(); }
    function touche(e) {
      if (e.key === 'Escape') clore();
      else if (e.key === 'ArrowRight') montrer(index + 1);
      else if (e.key === 'ArrowLeft') montrer(index - 1);
    }
    fond.addEventListener('click', function (e) {
      if (e.target.closest('.v-prec')) montrer(index - 1);
      else if (e.target.closest('.v-suiv')) montrer(index + 1);
      else if (e.target.closest('.v-fermer') || e.target === fond) clore();
    });
    var debut = null;
    fond.addEventListener('touchstart', function (e) { debut = e.touches[0].clientX; }, { passive: true });
    fond.addEventListener('touchend', function (e) {
      if (debut === null) return;
      var dx = e.changedTouches[0].clientX - debut;
      if (Math.abs(dx) > 50) montrer(index + (dx < 0 ? 1 : -1));
      debut = null;
    });
    document.addEventListener('keydown', touche);
    document.body.appendChild(fond);
    document.body.style.overflow = 'hidden';
    montrer(index);
    fond.querySelector('.v-fermer').focus();
  }
  cadres.forEach(function (c, i) { c.addEventListener('click', function () { visionner(i); }); });

  /* ---------- rituel : fil doré ---------- */
  var rituel = document.querySelector('.rituel');
  var rEtapes = rituel.querySelector('.rituel-etapes');
  var rFil = rituel.querySelector('.rituel-fil');
  function placerFil() { rFil.style.setProperty('--fil-haut', rEtapes.offsetTop + 'px'); }
  placerFil();
  window.addEventListener('resize', placerFil);

  /* ---------- boucle d'animation ---------- */
  var institutImg = document.querySelector('.institut-photo img');
  function boucle() {
    var vh = window.innerHeight;
    var y = window.scrollY;
    var dy = y - yPrec; yPrec = y;
    vitesse += (dy - vitesse) * 0.12;

    // curseur
    if (finPointeur && curseur) {
      anneau.x += (souris.x - anneau.x) * 0.2;
      anneau.y += (souris.y - anneau.y) * 0.2;
      curseur.style.setProperty('--ax', anneau.x.toFixed(1) + 'px');
      curseur.style.setProperty('--ay', anneau.y.toFixed(1) + 'px');
    }

    // accueil
    var rh = hero.getBoundingClientRect();
    if (rh.bottom > 0) {
      pos.x += (cible.x - pos.x) * 0.06;
      pos.y += (cible.y - pos.y) * 0.06;
      hero.style.setProperty('--px', pos.x.toFixed(3));
      hero.style.setProperty('--py', pos.y.toFixed(3));
      var ouv = bornes(-rh.top / (rh.height * 0.7), 0, 1);
      hero.style.setProperty('--ouv', ouv.toFixed(3));
      hero.style.setProperty('--defil', ouv.toFixed(3));
    }

    // bandeau
    if (piste && !calme) {
      bx -= 0.6 + Math.abs(vitesse) * 0.35;
      var moitie = piste.scrollWidth / 2;
      if (moitie && -bx >= moitie) bx += moitie;
      piste.style.setProperty('--bx', bx.toFixed(1) + 'px');
      piste.style.setProperty('--bs', bornes(-vitesse * 0.25, -8, 8).toFixed(2) + 'deg');
    }

    // manifeste
    if (mots.length) {
      var rm = manifeste.getBoundingClientRect();
      var pm = calme ? 1 : bornes((vh * 0.85 - rm.top) / (rm.height + vh * 0.35), 0, 1);
      var nb = Math.round(pm * mots.length);
      for (var i = 0; i < mots.length; i++) mots[i].classList.toggle('allume', i < nb);
    }

    // aperçu des prestations
    if (apercu) {
      var vx = ap.tx - ap.x;
      ap.x += vx * 0.14; ap.y += (ap.ty - ap.y) * 0.14;
      apercu.style.setProperty('--ax', ap.x.toFixed(1) + 'px');
      apercu.style.setProperty('--ay', ap.y.toFixed(1) + 'px');
      apercu.style.setProperty('--ar', bornes(vx * 0.12, -14, 14).toFixed(2) + 'deg');
      apercu.style.setProperty('--as', ap.actif ? 1 : 0);
    }

    // galerie
    if (epingle) {
      var rg = galerie.getBoundingClientRect();
      if (rg.top < vh && rg.bottom > 0) {
        var pg = bornes(-rg.top / (rg.height - vh), 0, 1);
        gBarre.style.setProperty('--gp', pg.toFixed(3));
        cartes.forEach(function (c, i) {
          var e = adoucir(bornes((pg - 0.06 - i * 0.07) / 0.55, 0, 1)), k = 1 - e;
          var d = ecarts[i];
          c.style.transform = 'translate3d(' + (d.x * k + (i - 2) * 12 * k).toFixed(1) + 'px,' + (d.y * k + Math.abs(i - 2) * 8 * k).toFixed(1) + 'px,0) rotate(' + (PAQUET[i] * k).toFixed(2) + 'deg) scale(' + (1 - 0.06 * k).toFixed(3) + ')';
          c.style.setProperty('--legende', bornes((e - 0.75) / 0.25, 0, 1).toFixed(2));
        });
        oeuvres.forEach(function (o) {
          var r = o.getBoundingClientRect();
          o.querySelector('img').style.setProperty('--par', (((r.left + r.width / 2) / window.innerWidth - 0.5) * -22).toFixed(1) + 'px');
        });
      }
    }

    // rituel
    var rr = rituel.getBoundingClientRect();
    if (rr.top < vh && rr.bottom > 0) rFil.style.setProperty('--rp', calme ? 1 : bornes((vh * 0.8 - rr.top) / (rr.height * 0.75), 0, 1).toFixed(3));

    // institut : léger parallaxe
    if (institutImg && !calme) {
      var ri = institutImg.parentNode.getBoundingClientRect();
      if (ri.top < vh && ri.bottom > 0) institutImg.parentNode.style.transform = 'translateY(' + (((ri.top + ri.height / 2) / vh - 0.5) * -40).toFixed(1) + 'px)';
    }

    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);

  /* ---------- demande de rendez-vous ---------- */
  var form = document.querySelector('.rdv-form');
  var apercuTexte = form.querySelector('.apercu-texte');
  var envois = form.querySelector('.envois');
  var note = form.querySelector('.envoi-note');
  var lookJoint = form.querySelector('.look-joint');
  var look = null;

  function message() {
    var d = new FormData(form);
    var prenom = (d.get('prenom') || '').trim();
    var dispos = d.getAll('dispo');
    var lignes = ['Bonjour Léna, je souhaite prendre rendez-vous pour : ' + d.get('presta') + '.'];
    if (look) lignes.push('Look souhaité : ' + look.texte + '.');
    if (dispos.length) lignes.push('Mes disponibilités : ' + dispos.join(', ') + '.');
    var mot = (d.get('message') || '').trim();
    if (mot) lignes.push(mot);
    lignes.push(prenom ? 'Merci, ' + prenom : 'Merci !');
    return lignes.join('\n');
  }
  function majApercu() { apercuTexte.textContent = message(); }
  form.addEventListener('input', majApercu);
  form.addEventListener('change', majApercu);

  var canaux = [];
  if (SALON.tel) canaux.push({ nom: 'Envoyer par SMS', lien: function (m) { return 'sms:' + SALON.tel + '?&body=' + encodeURIComponent(m); } });
  if (SALON.whatsapp) canaux.push({ nom: 'Envoyer sur WhatsApp', lien: function (m) { return 'https://wa.me/' + SALON.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(m); }, nouvel: true });
  if (SALON.email) canaux.push({ nom: 'Envoyer par e-mail', lien: function (m) { return 'mailto:' + SALON.email + '?subject=' + encodeURIComponent('Demande de rendez-vous') + '&body=' + encodeURIComponent(m); } });
  if (SALON.instagram) canaux.push({ nom: 'Écrire sur Instagram', copier: true, lien: function () { return SALON.instagram; }, nouvel: true });
  if (!canaux.length) canaux.push({ nom: 'Copier et contacter l\'institut', copier: true, lien: function () { return SALON.carte; }, nouvel: true });

  function copier(texte) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texte);
    return new Promise(function (ok, ko) {
      var t = document.createElement('textarea');
      t.value = texte; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? ok() : ko(); } catch (e) { ko(); }
      t.remove();
    });
  }
  function verifier() {
    var champ = form.querySelector('#f-prenom');
    var ok = champ.value.trim().length > 0;
    champ.parentNode.classList.toggle('erreur', !ok);
    if (!ok) { note.textContent = 'Indiquez votre prénom pour que Léna sache qui la contacte.'; champ.focus(); }
    return ok;
  }
  canaux.forEach(function (c, i) {
    var a = document.createElement('a');
    a.className = 'bouton ' + (i === 0 ? 'bouton-plein' : 'bouton-ligne') + ' aimant';
    a.innerHTML = '<span>' + c.nom + '</span>';
    a.href = c.lien(message());
    if (c.nouvel) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', function (e) {
      if (!verifier()) { e.preventDefault(); return; }
      var m = message();
      a.href = c.lien(m);
      eclat(e.clientX, e.clientY);
      if (c.copier) {
        copier(m).then(function () {
          note.textContent = SALON.instagram ? 'Message copié : collez-le dans la conversation Instagram.' : 'Message copié : retrouvez les coordonnées de l\'institut sur sa fiche Google.';
        }, function () { note.textContent = 'Recopiez le message ci-dessus pour l\'envoyer à l\'institut.'; });
      } else note.textContent = 'Votre messagerie s\'ouvre avec le message prêt à partir.';
    });
    envois.appendChild(a);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  window.addEventListener('lena:look', function (e) {
    look = e.detail;
    lookJoint.hidden = false;
    lookJoint.querySelector('.look-texte').textContent = look.texte;
    lookJoint.querySelector('.look-pastille').style.background = look.pastille;
    majApercu();
  });
  lookJoint.querySelector('.look-retirer').addEventListener('click', function () { look = null; lookJoint.hidden = true; majApercu(); });
  majApercu();
})();

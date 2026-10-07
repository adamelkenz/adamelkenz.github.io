/* Aaagency – interactions de la page d'accueil. */
(function () {
  'use strict';

  // Adresse qui reçoit les demandes du formulaire.
  var EMAIL = 'contact@aaagency.fr';

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function fermerMenu() {
    nav.classList.remove('ouvert');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
  }
  burger.addEventListener('click', function () {
    var ouvert = nav.classList.toggle('ouvert');
    burger.setAttribute('aria-expanded', String(ouvert));
    burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) fermerMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermerMenu(); });

  /* ---------- En-tête au défilement ---------- */
  var entete = document.getElementById('entete');
  function surDefilement() { entete.classList.toggle('defile', window.scrollY > 8); }
  window.addEventListener('scroll', surDefilement, { passive: true });
  surDefilement();

  /* ---------- Démo de l'assistant IA ---------- */
  var fil = document.getElementById('chat-fil');
  var SCENARIO = [
    ['visiteur', 'Un créneau demain ?'],
    ['ia', 'Oui : 9h ou 11h30 ?'],
    ['visiteur', '9h svp'],
    ['ok', '✓ Réservé · SMS envoyé']
  ];
  function ajouter(b) {
    fil.appendChild(b);
    // La carte est petite : seules les 3 dernières bulles restent visibles.
    while (fil.children.length > 3) fil.removeChild(fil.firstChild);
  }
  function bulle(type, texte) {
    var b = document.createElement('div');
    b.className = 'bulle bulle-' + type;
    b.textContent = texte;
    return b;
  }
  function jouer() {
    fil.textContent = '';
    if (reduit) {
      SCENARIO.slice(-3).forEach(function (m) { fil.appendChild(bulle(m[0], m[1])); });
      return;
    }
    var i = 0;
    (function suivant() {
      if (i >= SCENARIO.length) { setTimeout(jouer, 4200); return; }
      var m = SCENARIO[i++];
      if (m[0] === 'visiteur') {
        ajouter(bulle(m[0], m[1]));
        setTimeout(suivant, 1100);
        return;
      }
      var attente = bulle('ia', '');
      attente.innerHTML = '<span class="tape" aria-label="L’assistant écrit"><i></i><i></i><i></i></span>';
      ajouter(attente);
      setTimeout(function () {
        fil.replaceChild(bulle(m[0], m[1]), attente);
        setTimeout(suivant, 1500);
      }, 1300);
    })();
  }
  if (fil) setTimeout(jouer, 600);

  /* ---------- Apparition des blocs ---------- */
  var blocs = document.querySelectorAll('.section .carte');
  if ('IntersectionObserver' in window && !reduit) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('vu'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocs.forEach(function (b) { b.classList.add('revele'); obs.observe(b); });
  }

  /* ---------- Offre choisie → formulaire ---------- */
  document.querySelectorAll('[data-projet]').forEach(function (a) {
    a.addEventListener('click', function () {
      var radio = document.querySelector('input[name="projet"][value="' + a.dataset.projet + '"]');
      if (radio) radio.checked = true;
    });
  });

  /* ---------- Formulaire de contact ---------- */
  document.querySelectorAll('[data-email]').forEach(function (a) {
    a.href = 'mailto:' + EMAIL;
    a.textContent = EMAIL;
  });

  var form = document.getElementById('formulaire');
  var statut = document.getElementById('form-statut');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalides = [];
    ['nom', 'email', 'message'].forEach(function (nom) {
      var champ = form.elements[nom];
      var ok = champ.value.trim() !== '' && champ.checkValidity();
      champ.setAttribute('aria-invalid', String(!ok));
      if (!ok) invalides.push(champ);
    });
    if (invalides.length) {
      statut.className = 'form-statut erreur';
      statut.textContent = 'Merci de remplir votre nom, un e-mail valide et votre besoin.';
      invalides[0].focus();
      return;
    }
    var d = form.elements;
    var corps = [
      'Projet : ' + d.projet.value,
      'Nom : ' + d.nom.value.trim(),
      'E-mail : ' + d.email.value.trim(),
      d.tel.value.trim() ? 'Téléphone : ' + d.tel.value.trim() : '',
      d.entreprise.value.trim() ? 'Entreprise : ' + d.entreprise.value.trim() : '',
      '',
      d.message.value.trim()
    ].filter(function (l, i) { return l !== '' || i === 5; }).join('\n');
    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent('Nouveau projet – ' + d.projet.value) +
      '&body=' + encodeURIComponent(corps);
    statut.className = 'form-statut ok';
    statut.textContent = 'Votre messagerie s’ouvre avec la demande pré-remplie : il ne reste qu’à l’envoyer.';
  });

  document.getElementById('annee').textContent = new Date().getFullYear();
})();

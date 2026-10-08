/* Clément Sassier Paysage — comportements de la page (sans dépendance) */
(function () {
  'use strict';

  // Coordonnées : à remplir quand on les aura, tout le reste suit.
  var CONTACT = {
    tel: '',   // ex. '06 12 34 56 78'
    email: ''  // ex. 'contact@sassier-paysage.fr'
  };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Tracé des planches et apparitions au défilement */
  $$('.draw').forEach(function (svg) {
    var paths = $$('[pathLength]', svg);
    var step = Math.min(30, 1100 / Math.max(paths.length, 1));
    paths.forEach(function (p, i) { p.style.transitionDelay = (i * step) + 'ms'; });
  });
  $$('.plate-head, .index li, .specimen, .cal li, .label, .fiche, .prose, .compare-block').forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.classList.contains('draw') ? 'is-drawn' : 'is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$('.draw, .reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.draw').forEach(function (el) { el.classList.add('is-drawn'); });
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Filtre par saison */
  var buttons = $$('.filters button');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      $$('.herbarium .specimen').forEach(function (s) {
        s.classList.toggle('is-hidden', f !== 'tout' && s.getAttribute('data-season') !== f);
      });
    });
  });

  /* Visionneuse (seulement pour les vraies photos) */
  var lb = $('.lightbox');
  var lbImg = $('img', lb);
  var lbCap = $('figcaption', lb);
  var lastFocus = null;
  function closeLb() { lb.hidden = true; lbImg.removeAttribute('src'); if (lastFocus) lastFocus.focus(); }
  $$('.herbarium .specimen img').forEach(function (img) {
    img.tabIndex = 0;
    function open() {
      lastFocus = img;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      var cap = img.closest('figure').querySelector('figcaption');
      lbCap.textContent = cap ? cap.textContent : '';
      lb.hidden = false;
      $('.lb-close', lb).focus();
    }
    img.addEventListener('click', open);
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-close')) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* Avant / après */
  $$('.compare').forEach(function (c) {
    var r = $('input', c);
    r.addEventListener('input', function () { c.style.setProperty('--pos', r.value + '%'); });
  });

  /* Calendrier : mois en cours */
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var m = new Date().getMonth();
  var cur = $$('.cal li')[m];
  if (cur) {
    cur.classList.add('now');
    $('.cal-now').textContent = 'Nous sommes en ' + MOIS[m] + ' : ' + $('p', cur).textContent;
  }

  /* Coordonnées */
  var telLink = $('[data-contact="tel"]');
  var mailLink = $('[data-contact="mail"]');
  if (CONTACT.tel) { telLink.textContent = CONTACT.tel; telLink.href = 'tel:' + CONTACT.tel.replace(/\s/g, ''); }
  else telLink.classList.add('todo');
  if (CONTACT.email) { mailLink.textContent = CONTACT.email; mailLink.href = 'mailto:' + CONTACT.email; }
  else mailLink.classList.add('todo');

  /* Fiche de demande */
  var form = $('#fiche');
  var msg = $('.fiche-msg', form);
  var d = new Date();
  $('#fiche-no').textContent = String(d.getFullYear()).slice(2) + '-' + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 90) + 10);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var bad = !f.value.trim();
      f.closest('label').classList.toggle('invalid', bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    msg.classList.remove('err');
    if (!ok) { msg.classList.add('err'); msg.textContent = 'Il manque votre nom ou votre téléphone.'; return; }

    var v = function (n) { return form.elements[n].value.trim(); };
    var body = [
      'Nom : ' + v('nom'),
      'Téléphone : ' + v('tel'),
      'Commune : ' + v('commune'),
      'Travaux : ' + v('travaux'),
      'Surface : ' + v('surface'),
      '',
      v('message')
    ].join('\n');

    if (!CONTACT.email) {
      msg.classList.add('err');
      msg.textContent = 'L\'envoi sera actif dès que l\'adresse e-mail sera ajoutée au site.';
      return;
    }
    window.location.href = 'mailto:' + CONTACT.email +
      '?subject=' + encodeURIComponent('Demande de devis — ' + v('travaux') + ' — ' + (v('commune') || v('nom'))) +
      '&body=' + encodeURIComponent(body);
    msg.textContent = 'Votre messagerie s\'ouvre avec la fiche remplie. Il ne reste qu\'à envoyer.';
  });
})();

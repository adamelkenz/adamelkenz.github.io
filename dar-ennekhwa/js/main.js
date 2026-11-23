(function () {
  'use strict';
  var WA_NUMBER = '212600000000'; // ← remplacer par le vrai numéro WhatsApp (format international, sans +)
  var PRICE = 240;
  var DESC = {
    fr: 'Coupe droite moderne en tissu noble respirant, col en V bordé d’une sfifa tressée ton-sur-ton et boutons aakad façonnés à la main à Fès.',
    en: 'Modern straight cut in breathable noble fabric, V-neck trimmed with tone-on-tone braided sfifa and hand-knotted aakad buttons from Fez.'
  };
  var PRODUCTS = [
    { id: 'vert-sauge', fr: 'Vert Sauge', en: 'Sage Green', hex: '#7B9986', n: 4, badge: ['Best-Seller', 'Best-Seller'] },
    { id: 'vert-emeraude', fr: 'Vert Émeraude', en: 'Emerald Green', hex: '#1E4331', n: 4, badge: ['Nouveau', 'New'] },
    { id: 'gris-souris', fr: 'Gris Souris', en: 'Mouse Grey', hex: '#7A7E85', n: 4 },
    { id: 'bleu-nuit', fr: 'Bleu Nuit', en: 'Midnight Blue', hex: '#202B49', n: 4, badge: ['Iconique', 'Iconic'] },
    { id: 'prune-royale', fr: 'Prune Royale', en: 'Royal Plum', hex: '#54293D', n: 4 },
    { id: 'noir-absolu', fr: 'Noir Absolu', en: 'Absolute Black', hex: '#1F2022', n: 4, badge: ['Intemporel', 'Timeless'] },
    { id: 'camel-dore', fr: 'Camel Doré', en: 'Golden Camel', hex: '#A7845A', n: 4 },
    { id: 'sable-doux', fr: 'Sable Doux', en: 'Soft Sand', hex: '#CBBBA8', n: 3 }
  ];
  var SIZES = ['S', 'M', 'L', 'XL'];

  var EN = {
    announce: 'Free delivery across Morocco <b>✦</b> Cash on delivery',
    nav1: 'Our House', nav2: 'Collection', nav3: 'Sizes', nav4: 'Care',
    heroEye: 'Marhaban bikum ✦ Winter Collection',
    heroH1: 'More than a garment, <em>a presence.</em>',
    heroLead: 'Traditional Moroccan elegance reimagined, trimmed with sfifa and crafted in Fez.',
    heroCta1: 'Explore the collection', heroCta2: 'Our House',
    fPrice: 'Single price', fSizes: '4 sizes', fShip: 'Free delivery', tagSmall: 'Collection',
    mEye: 'Our House ✦ Fez', mTitle: 'The artisan soul of Fez',
    mBody: 'Inspired by the artisan soul of Fez and the know-how of its master craftsmen, DAR ENNEKHWA reinvents traditional Moroccan clothing for today’s man. Timeless cuts, noble fabrics and the excellence of handwork — for those who wear their heritage with poise.',
    s1: 'From', s2: 'Sizes', s3: 'Delivery', s3v: 'Free 24-48h', s4: 'Payment', s4v: 'On delivery',
    a1t: 'Free delivery', a1p: 'Across Morocco, in 24 to 48h straight to your door.',
    a2t: 'Cash on delivery', a2p: 'No advance payment: you pay when you receive it.',
    a3t: 'Fassi craftsmanship', a3p: 'Braided sfifa and aakad buttons carefully made in Fez.',
    a4t: 'Easy exchange', a4p: 'Personal guidance and simple size exchange.',
    cEye: 'Our men’s creations', cTitle: 'The Fassi Gandoura Collection',
    cLead: 'Eight shades, one modern straight cut. Pick your colour and order in seconds.',
    wEye: 'Personal advice on WhatsApp', wTitle: 'Torn between two shades or two sizes?',
    wLead: 'Our team will guide you according to your build and the occasion.', wBtn: 'Need help choosing?',
    tEye: 'Moroccan body-fit guide', tTitle: 'Size Guide',
    tLead: 'Cuts designed to Moroccan standards for a fluid, straight and comfortable drape, never tight.',
    th1: 'Size', th2: 'Height', th3: 'Weight', th4: 'Chest', th5: 'Length',
    tTip: '<b>Fit tip:</b> between two sizes, pick the larger one for a looser, more traditional drape.',
    eEye: 'Preserving the nobility of fabrics', eTitle: 'Care Advice',
    eLead: 'To keep your sfifa and embroidery radiant for years.',
    e1: 'Dry cleaning recommended, especially for embroidered pieces, vegetable silk (sabra), wool and velvet.',
    e2: 'Hand wash in cold water with a mild detergent, without rubbing the embroidery or wringing.',
    e3: 'Air dry flat or on a wide hanger, away from direct sun and never in a dryer.',
    e4: 'Iron gently on the reverse with a pressing cloth, never directly on the sfifa.',
    e5: 'Store on a wide hanger in a breathable cover, or folded flat for heavy pieces.',
    dEye: 'Artisan excellence', dTitle: 'The Fassi attention to detail',
    d1t: 'Tone-on-tone sfifa &amp; aakad', d1p: 'Refined V-neck trimmed with matching traditional sfifa and closed with hand-made aakad buttons.',
    d2t: 'Noble, breathable fabric', d2p: 'Fluid drape with a silky touch, crease-resistant, ideal from day to evening.',
    d3t: 'Modern straight cut', d3p: 'Braided three-quarter sleeves for a distinguished look and natural freedom of movement.',
    d4t: 'Secure delivery &amp; payment', d4p: 'Free delivery across Morocco and payment on delivery after checking your parcel.',
    fiche: 'Spec sheet ✦ 240 DH ✦ S / M / L / XL ✦ Free delivery',
    rEye: 'Customer reviews', rTitle: 'Trusted by our customers', size: 'Size',
    r1: 'The fabric quality and the finesse of the sfifa on the Sage Green are remarkable. Received in Casablanca in under 24h.',
    r2: 'I ordered the Midnight Blue and the Golden Camel. Very elegant cut, impeccable drape and smooth cash on delivery.',
    r3: 'A truly modern, sober Fassi craft. The packaging with its spec sheet feels like a couture house. Highly recommended!',
    fTag: 'Tradition ✦ Elegance ✦ Modernity', fShip2: 'Free delivery across Morocco ✦ Cash on delivery',
    mFree: '✓ Free delivery 24-48h', mSize: '1. Choose your size', mQty: 'Quantity',
    mInfo: '2. Your delivery details', mConfirm: 'Confirm on WhatsApp'
  };

  var FR = {}, lang = 'fr';
  try { lang = localStorage.getItem('de-lang') || 'fr'; } catch (e) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  $$('[data-i18n]').forEach(function (el) { FR[el.dataset.i18n] = FR[el.dataset.i18n] || el.innerHTML; });

  var filter = 'all', cur = null, curImg = 0, curSize = 'M', qty = 1;
  var t = function (p, k) { return p[lang === 'en' ? 'en' : 'fr']; };
  var img = function (p, i) { return 'img/' + p.id + '-' + (i + 1) + '.jpg'; };

  function renderFilters() {
    var h = '<button class="chip' + (filter === 'all' ? ' on' : '') + '" data-f="all">' + (lang === 'en' ? 'All shades' : 'Toutes les nuances') + ' (' + PRODUCTS.length + ')</button>';
    PRODUCTS.forEach(function (p) {
      h += '<button class="chip' + (filter === p.id ? ' on' : '') + '" data-f="' + p.id + '"><i style="background:' + p.hex + '"></i>' + t(p) + '</button>';
    });
    $('#filters').innerHTML = h;
  }

  function renderGrid() {
    var L = lang === 'en';
    $('#grid').innerHTML = PRODUCTS.filter(function (p) { return filter === 'all' || p.id === filter; }).map(function (p) {
      var alt = (L ? 'Fassi Gandoura — ' : 'Gandoura Fassi — ') + t(p);
      return '<article class="card" data-id="' + p.id + '" tabindex="0">' +
        (p.badge ? '<span class="badge">' + p.badge[L ? 1 : 0] + '</span>' : '') +
        '<div class="ph"><img loading="lazy" src="' + img(p, 0) + '" alt="' + alt + '"><img loading="lazy" src="' + img(p, 1) + '" alt=""></div>' +
        '<div class="col"><i style="background:' + p.hex + '"></i>' + t(p) + '</div>' +
        '<h3>Gandoura Fassi</h3><div class="price">' + PRICE + ' DH</div>' +
        '<div class="sizes">S · M · L · XL</div>' +
        '<span class="btn btn-blue">' + (L ? 'Order' : 'Commander') + ' →</span></article>';
    }).join('');
  }

  function renderModal() {
    if (!cur) return;
    var L = lang === 'en';
    $('#mmain').src = img(cur, curImg);
    $('#mmain').alt = t(cur);
    $('#mcol').textContent = (L ? 'Men · ' : 'Homme · ') + t(cur);
    $('#mtitle').textContent = (L ? 'Fassi Gandoura — ' : 'Gandoura Fassi — ') + t(cur);
    $('#mprice').textContent = (PRICE * qty) + ' DH';
    $('#mdesc').textContent = DESC[L ? 'en' : 'fr'];
    $('#qv').textContent = qty;
    var th = '';
    for (var i = 0; i < cur.n; i++) th += '<button type="button" data-i="' + i + '" class="' + (i === curImg ? 'on' : '') + '"><img src="' + img(cur, i) + '" alt=""></button>';
    $('#mthumbs').innerHTML = th;
    $('#msizes').innerHTML = SIZES.map(function (s) { return '<button type="button" class="opt' + (s === curSize ? ' on' : '') + '" data-s="' + s + '">' + s + '</button>'; }).join('');
  }

  function openModal(id) {
    cur = PRODUCTS.filter(function (p) { return p.id === id; })[0];
    curImg = 0; qty = 1; renderModal();
    $('#modal').classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function closeModal() { $('#modal').classList.remove('open'); document.body.style.overflow = ''; }

  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(function (el) {
      var k = el.dataset.i18n;
      var v = lang === 'en' && EN[k] != null ? EN[k] : FR[k];
      if (v != null) el.innerHTML = v;
    });
    $$('[data-ph]').forEach(function (el) { el.placeholder = el.dataset.ph.split('|')[lang === 'en' ? 1 : 0]; });
    $('#lang').textContent = lang === 'en' ? 'FR' : 'EN';
    renderFilters(); renderGrid(); renderModal();
  }

  function wa(msg) { window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer'); }

  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-f]'); if (c) { filter = c.dataset.f; renderFilters(); renderGrid(); return; }
    var card = e.target.closest('.card'); if (card) { openModal(card.dataset.id); return; }
    var th = e.target.closest('#mthumbs button'); if (th) { curImg = +th.dataset.i; renderModal(); return; }
    var sz = e.target.closest('#msizes .opt'); if (sz) { curSize = sz.dataset.s; renderModal(); return; }
    if (e.target.closest('#mclose') || e.target === $('#modal')) { closeModal(); return; }
    if (e.target.closest('#qp')) { qty = Math.min(10, qty + 1); renderModal(); return; }
    if (e.target.closest('#qm')) { qty = Math.max(1, qty - 1); renderModal(); return; }
    if (e.target.closest('[data-wa="help"]')) {
      wa(lang === 'en'
        ? 'Hello DAR ENNEKHWA ✨ I need help choosing my colour or size (S / M / L / XL). Can you advise me?'
        : 'Bonjour DAR ENNEKHWA ✨ J’ai besoin d’aide pour choisir ma couleur ou ma taille (S / M / L / XL). Pouvez-vous me conseiller ?');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('card')) { e.preventDefault(); openModal(e.target.dataset.id); }
  });

  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var L = lang === 'en', tot = PRICE * qty;
    var m = L ? [
      'Hello *DAR ENNEKHWA* ✨', 'I would like to place an order:',
      '• *Collection*: Fassi Gandoura Collection (Men)', '• *Item*: Fassi Gandoura — ' + cur.en,
      '• *Size*: ' + curSize, '• *Quantity*: ' + qty, '• *Total*: ' + tot + ' DH (Free delivery)',
      '• *Name*: ' + $('#cn').value.trim(), '• *Phone*: ' + $('#cp').value.trim(), '• *City*: ' + $('#cc').value.trim(),
      '• *Mode*: Cash on delivery (COD)'
    ] : [
      'Bonjour *DAR ENNEKHWA* ✨', 'Je souhaite passer une commande :',
      '• *Collection* : Collection Gandoura Fassi (Homme)', '• *Article* : Gandoura Fassi — ' + cur.fr,
      '• *Taille* : ' + curSize, '• *Quantité* : ' + qty, '• *Total* : ' + tot + ' DH (Livraison Gratuite)',
      '• *Nom* : ' + $('#cn').value.trim(), '• *Téléphone* : ' + $('#cp').value.trim(), '• *Ville* : ' + $('#cc').value.trim(),
      '• *Mode* : Paiement à la livraison (COD)'
    ];
    wa(m.join('\n')); closeModal();
  });

  $('#lang').addEventListener('click', function () {
    lang = lang === 'fr' ? 'en' : 'fr';
    try { localStorage.setItem('de-lang', lang); } catch (e) {}
    applyLang();
  });

  // Hero arch crossfade
  var hi = $$('#heroArch img'), hk = 0;
  setInterval(function () { hi[hk].classList.remove('on'); hk = (hk + 1) % hi.length; hi[hk].classList.add('on'); }, 3800);

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  applyLang();
})();

(function () {
  'use strict';
  // Les produits, collections et réglages sont dans data/catalogue.json
  // (modifiables depuis admin.html).
  var DATA = { settings: {}, collections: [], products: [] };

  var EN = {
    announce: 'Free delivery across Morocco <b>✦</b> Cash on delivery',
    nav1: 'Our House', nav2: 'Collections', nav3: 'Sizes', nav4: 'Care',
    heroEye: 'Marhaban bikum ✦ Winter Collection',
    heroH1: 'More than a garment, <em>a presence.</em>',
    heroLead: 'Traditional Moroccan elegance reimagined, trimmed with sfifa and crafted in Fez.',
    heroCta1: 'Explore the collections', heroCta2: 'Our House',
    fPrice: 'From', fSizes: '4 sizes', fShip: 'Free delivery', tagSmall: 'Collection',
    mEye: 'Our House ✦ Fez', mTitle: 'The artisan soul of Fez',
    mBody: 'Inspired by the artisan soul of Fez and the know-how of its master craftsmen, DAR ENNEKHWA reinvents traditional Moroccan clothing for today’s men and women. Timeless cuts, noble fabrics and the excellence of handwork — for those who wear their heritage with poise.',
    s1: 'From', s2: 'Sizes', s3: 'Delivery', s3v: 'Free 24-48h', s4: 'Payment', s4v: 'On delivery',
    a1t: 'Free delivery', a1p: 'Across Morocco, in 24 to 48h straight to your door.',
    a2t: 'Cash on delivery', a2p: 'No advance payment: you pay when you receive it.',
    a3t: 'Fassi craftsmanship', a3p: 'Braided sfifa and aakad buttons carefully made in Fez.',
    a4t: 'Easy exchange', a4p: 'Personal guidance and simple size exchange.',
    cEye: 'Our men’s &amp; women’s creations', cTitle: 'Our Collections',
    cLead: 'Explore our collections for men and women, discover every artisan detail and order in seconds.',
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
    fiche: 'Spec sheet ✦ Braided sfifa ✦ Hand-made aakad ✦ Free delivery',
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
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  $$('[data-i18n]').forEach(function (el) { FR[el.dataset.i18n] = FR[el.dataset.i18n] || el.innerHTML; });

  var gender = 'all', coll = 'all', shade = 'all';
  var cur = null, curImg = 0, curSize = null, qty = 1;

  var L = function () { return lang === 'en'; };
  // Champ bilingue : l'anglais retombe sur le français s'il est vide
  var tr = function (o, k) { return (L() && o[k + 'En']) || o[k + 'Fr'] || ''; };
  var collOf = function (p) { return DATA.collections.filter(function (c) { return c.id === p.collectionId; })[0] || { nameFr: '', gender: 'homme' }; };
  var gLabel = function (g) { return g === 'femme' ? (L() ? 'Women' : 'Femme') : (L() ? 'Men' : 'Homme'); };
  var fullTitle = function (p) { var c = tr(p, 'color'); return tr(p, 'title') + (c ? ' — ' + c : ''); };
  var NOIMG = 'img/rosette.svg';
  var mainImg = function (p, i) { return (p.images && p.images[i || 0]) || NOIMG; };

  function visibleProducts() {
    return DATA.products.filter(function (p) {
      var c = collOf(p);
      return (gender === 'all' || c.gender === gender) && (coll === 'all' || p.collectionId === coll) && (shade === 'all' || p.id === shade);
    });
  }

  function renderTabs() {
    var counts = { homme: 0, femme: 0 };
    DATA.products.forEach(function (p) { counts[collOf(p).gender]++; });
    // Onglets seulement s'il y a des articles pour les deux
    if (!counts.homme || !counts.femme) { $('#gtabs').innerHTML = ''; gender = 'all'; return; }
    var t = [['all', L() ? 'All' : 'Tout', DATA.products.length], ['homme', gLabel('homme'), counts.homme], ['femme', gLabel('femme'), counts.femme]];
    $('#gtabs').innerHTML = t.map(function (x) { return '<button data-g="' + x[0] + '" class="' + (gender === x[0] ? 'on' : '') + '">' + x[1] + ' (' + x[2] + ')</button>'; }).join('');
  }

  function renderFilters() {
    var cols = DATA.collections.filter(function (c) {
      return (gender === 'all' || c.gender === gender) && DATA.products.some(function (p) { return p.collectionId === c.id; });
    });
    if (coll !== 'all' && !cols.some(function (c) { return c.id === coll; })) coll = 'all';
    var only = cols.length === 1 ? cols[0].id : null;
    if (cols.length > 1) {
      var h = '<button class="chip' + (coll === 'all' ? ' on' : '') + '" data-c="all">' + (L() ? 'All collections' : 'Toutes les collections') + '</button>';
      cols.forEach(function (c) {
        var n = DATA.products.filter(function (p) { return p.collectionId === c.id; }).length;
        h += '<button class="chip' + (coll === c.id ? ' on' : '') + '" data-c="' + esc(c.id) + '">' + esc(tr(c, 'name')) + ' <small>(' + gLabel(c.gender) + ' · ' + n + ')</small></button>';
      });
      $('#filters').innerHTML = h;
    } else $('#filters').innerHTML = '';

    // Nuances : seulement quand une collection est sélectionnée
    var active = coll !== 'all' ? coll : only;
    var cObj = DATA.collections.filter(function (c) { return c.id === active; })[0];
    $('#collDesc').textContent = cObj ? tr(cObj, 'desc') : '';
    var ps = active ? DATA.products.filter(function (p) { return p.collectionId === active && p.hex; }) : [];
    if (ps.length > 1) {
      if (shade !== 'all' && !ps.some(function (p) { return p.id === shade; })) shade = 'all';
      var s = '<button class="chip' + (shade === 'all' ? ' on' : '') + '" data-s="all">' + (L() ? 'All shades' : 'Toutes les nuances') + ' (' + ps.length + ')</button>';
      ps.forEach(function (p) { s += '<button class="chip' + (shade === p.id ? ' on' : '') + '" data-s="' + esc(p.id) + '"><i style="background:' + esc(p.hex) + '"></i>' + esc(tr(p, 'color') || tr(p, 'title')) + '</button>'; });
      $('#shades').innerHTML = s;
    } else { $('#shades').innerHTML = ''; shade = 'all'; }
  }

  function renderGrid() {
    var list = visibleProducts();
    if (!list.length) { $('#grid').innerHTML = '<p class="empty">' + (L() ? 'New pieces coming soon.' : 'Nouvelles pièces bientôt disponibles.') + '</p>'; return; }
    $('#grid').innerHTML = list.map(function (p) {
      var c = collOf(p), color = tr(p, 'color'), badge = tr(p, 'badge');
      var out = p.inStock === false;
      return '<article class="card' + (out ? ' out' : '') + '" data-id="' + esc(p.id) + '" tabindex="0">' +
        (out ? '<span class="badge out">' + (L() ? 'Sold out' : 'Épuisé') + '</span>' : badge ? '<span class="badge">' + esc(badge) + '</span>' : '') +
        '<div class="ph"><img loading="lazy" src="' + esc(mainImg(p)) + '" alt="' + esc(fullTitle(p)) + '">' +
        (p.images && p.images[1] ? '<img loading="lazy" src="' + esc(p.images[1]) + '" alt="">' : '') + '</div>' +
        '<div class="ceyebrow">' + gLabel(c.gender) + ' · ' + esc(tr(c, 'name')) + '</div>' +
        (color ? '<div class="col">' + (p.hex ? '<i style="background:' + esc(p.hex) + '"></i>' : '') + esc(color) + '</div>' : '') +
        '<h3>' + esc(tr(p, 'title')) + '</h3><div class="price">' + esc(p.price) + ' DH</div>' +
        '<div class="sizes">' + esc((p.sizes || []).join(' · ')) + '</div>' +
        '<span class="btn btn-blue">' + (out ? (L() ? 'View' : 'Voir') : (L() ? 'Order' : 'Commander')) + ' →</span></article>';
    }).join('');
  }

  function renderModal() {
    if (!cur) return;
    var c = collOf(cur), out = cur.inStock === false;
    $('#mmain').src = mainImg(cur, curImg);
    $('#mmain').alt = fullTitle(cur);
    $('#mcol').textContent = gLabel(c.gender) + ' · ' + tr(c, 'name');
    $('#mtitle').textContent = fullTitle(cur);
    $('#mprice').textContent = (cur.price * qty) + ' DH';
    $('#mdesc').textContent = tr(cur, 'desc') || tr(c, 'desc');
    $('#qv').textContent = qty;
    var imgs = cur.images && cur.images.length ? cur.images : [NOIMG];
    $('#mthumbs').innerHTML = imgs.length < 2 ? '' : imgs.map(function (src, i) { return '<button type="button" data-i="' + i + '" class="' + (i === curImg ? 'on' : '') + '"><img src="' + esc(src) + '" alt=""></button>'; }).join('');
    $('#msizes').innerHTML = (cur.sizes || []).map(function (s) { return '<button type="button" class="opt' + (s === curSize ? ' on' : '') + '" data-sz="' + esc(s) + '">' + esc(s) + '</button>'; }).join('');
    var btn = $('#form button[type=submit]');
    btn.disabled = out;
    btn.textContent = out ? (L() ? 'Sold out' : 'Épuisé') : (L() ? EN.mConfirm : FR.mConfirm);
  }

  function openModal(id) {
    cur = DATA.products.filter(function (p) { return p.id === id; })[0];
    if (!cur) return;
    curImg = 0; qty = 1;
    var sz = cur.sizes || [];
    curSize = sz.indexOf('M') >= 0 ? 'M' : sz[0] || '';
    renderModal();
    $('#modal').classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function closeModal() { $('#modal').classList.remove('open'); document.body.style.overflow = ''; }

  function renderAll() { renderTabs(); renderFilters(); renderGrid(); renderModal(); }

  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(function (el) {
      var k = el.dataset.i18n;
      var v = L() && EN[k] != null ? EN[k] : FR[k];
      if (v != null) el.innerHTML = v;
    });
    $$('[data-ph]').forEach(function (el) { el.placeholder = el.dataset.ph.split('|')[L() ? 1 : 0]; });
    $('#lang').textContent = L() ? 'FR' : 'EN';
    renderAll();
  }

  function waNumber() { return String(DATA.settings.whatsapp || '').replace(/\D/g, '') || '212600000000'; }
  function wa(msg) { window.open('https://wa.me/' + waNumber() + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer'); }

  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-g]'); if (g) { gender = g.dataset.g; coll = 'all'; shade = 'all'; renderAll(); return; }
    var c = e.target.closest('[data-c]'); if (c) { coll = c.dataset.c; shade = 'all'; renderFilters(); renderGrid(); return; }
    var s = e.target.closest('[data-s]'); if (s) { shade = s.dataset.s; renderFilters(); renderGrid(); return; }
    var card = e.target.closest('.card'); if (card) { openModal(card.dataset.id); return; }
    var th = e.target.closest('#mthumbs button'); if (th) { curImg = +th.dataset.i; renderModal(); return; }
    var sz = e.target.closest('#msizes .opt'); if (sz) { curSize = sz.dataset.sz; renderModal(); return; }
    if (e.target.closest('#mclose') || e.target === $('#modal')) { closeModal(); return; }
    if (e.target.closest('#qp')) { qty = Math.min(10, qty + 1); renderModal(); return; }
    if (e.target.closest('#qm')) { qty = Math.max(1, qty - 1); renderModal(); return; }
    if (e.target.closest('[data-wa="help"]')) {
      wa(L()
        ? 'Hello DAR ENNEKHWA ✨ I need help choosing my colour or size. Can you advise me?'
        : 'Bonjour DAR ENNEKHWA ✨ J’ai besoin d’aide pour choisir ma couleur ou ma taille. Pouvez-vous me conseiller ?');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('card')) { e.preventDefault(); openModal(e.target.dataset.id); }
  });

  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!cur || cur.inStock === false) return;
    var c = collOf(cur), tot = cur.price * qty;
    var fr = function (o, k) { return o[k + 'Fr'] || ''; };
    var en = function (o, k) { return o[k + 'En'] || o[k + 'Fr'] || ''; };
    var title = function (f) { var col = f(cur, 'color'); return f(cur, 'title') + (col ? ' — ' + col : ''); };
    var m = L() ? [
      'Hello *DAR ENNEKHWA* ✨', 'I would like to place an order:',
      '• *Collection*: ' + en(c, 'name') + ' (' + (c.gender === 'femme' ? 'Women' : 'Men') + ')', '• *Item*: ' + title(en),
      '• *Size*: ' + curSize, '• *Quantity*: ' + qty, '• *Total*: ' + tot + ' DH (Free delivery)',
      '• *Name*: ' + $('#cn').value.trim(), '• *Phone*: ' + $('#cp').value.trim(), '• *City*: ' + $('#cc').value.trim(),
      '• *Mode*: Cash on delivery (COD)'
    ] : [
      'Bonjour *DAR ENNEKHWA* ✨', 'Je souhaite passer une commande :',
      '• *Collection* : ' + fr(c, 'name') + ' (' + (c.gender === 'femme' ? 'Femme' : 'Homme') + ')', '• *Article* : ' + title(fr),
      '• *Taille* : ' + curSize, '• *Quantité* : ' + qty, '• *Total* : ' + tot + ' DH (Livraison Gratuite)',
      '• *Nom* : ' + $('#cn').value.trim(), '• *Téléphone* : ' + $('#cp').value.trim(), '• *Ville* : ' + $('#cc').value.trim(),
      '• *Mode* : Paiement à la livraison (COD)'
    ];
    wa(m.join('\n')); closeModal();
  });

  $('#lang').addEventListener('click', function () {
    lang = L() ? 'fr' : 'en';
    try { localStorage.setItem('de-lang', lang); } catch (e) {}
    applyLang();
  });

  // Hero arch crossfade
  var hi = $$('#heroArch img'), hk = 0;
  if (hi.length > 1) setInterval(function () { hi[hk].classList.remove('on'); hk = (hk + 1) % hi.length; hi[hk].classList.add('on'); }, 3800);

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  function applyData() {
    var prices = DATA.products.map(function (p) { return +p.price; }).filter(function (n) { return n > 0; });
    if (prices.length) $$('.js-min').forEach(function (el) { el.textContent = Math.min.apply(null, prices); });
    if (DATA.settings.instagramUrl) $$('.js-ig').forEach(function (a) { a.href = DATA.settings.instagramUrl; });
    renderAll();
  }

  applyLang();
  // no-store + paramètre : on voit tout de suite les changements publiés depuis l'admin
  fetch('data/catalogue.json?v=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      DATA = { settings: d.settings || {}, collections: d.collections || [], products: d.products || [] };
      applyData();
    })
    .catch(function () {
      $('#grid').innerHTML = '<p class="empty">' + (L() ? 'Collection unavailable, please reload the page.' : 'Collection indisponible, veuillez recharger la page.') + '</p>';
    });
})();

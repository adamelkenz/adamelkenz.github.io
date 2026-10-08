/* Poteau de barbier fixé au bord de l'écran : tube de verre, globe lumineux,
   cylindre rayé dessiné en perspective qui tourne en continu tant que la page
   est ouverte (il accélère quand on fait défiler). Un clic ramène en haut. */
(function () {
  var p = document.createElement('button');
  p.className = 'poteau';
  p.type = 'button';
  p.setAttribute('aria-label', 'Remonter en haut de la page');
  p.innerHTML =
    '<span class="halo"></span>' +
    '<span class="bras haut"></span><span class="bras bas"></span>' +
    '<span class="globe"></span><span class="bague"></span>' +
    '<span class="tube"><canvas></canvas></span>' +
    '<span class="bague"></span><span class="socle"></span>' +
    '<span class="info">Haut de page</span>';
  document.body.appendChild(p);

  var cv = p.querySelector('canvas');
  var ctx = cv.getContext('2d');
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)');

  // motif d'une spire : rouge, blanc, bleu, blanc (bornes en fraction du pas)
  var N = 2;
  var COUL = [[228, 36, 54], [252, 248, 240], [38, 78, 176], [252, 248, 240]];
  var BORNES = [0, .3, .5, .8, 1];

  var W = 0, H = 0, img, px, pas, colA, colOmbre, colReflet, colFlou, ligne;

  function prepare() {
    var r = cv.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(4, Math.round(r.width * dpr));
    H = Math.max(4, Math.round(r.height * dpr));
    cv.width = W; cv.height = H;
    img = ctx.createImageData(W, H);
    px = img.data;
    pas = Math.PI * (W / 2) * 1.3;            // hauteur d'un motif complet
    colA = new Float32Array(W);               // angle autour du cylindre (en tours)
    colOmbre = new Float32Array(W);           // ombrage du cylindre
    colReflet = new Float32Array(W);          // reflets spéculaires
    colFlou = new Float32Array(W);            // anticrénelage (plus large sur les bords)
    for (var x = 0; x < W; x++) {
      var u = ((x + .5) / W) * 2 - 1;
      var c = Math.sqrt(Math.max(.003, 1 - u * u));
      colA[x] = Math.asin(u) / (2 * Math.PI);
      colOmbre[x] = .38 + .62 * Math.pow(c, .55);
      colReflet[x] = .7 * Math.exp(-Math.pow((u + .46) / .11, 2)) + .22 * Math.exp(-Math.pow((u - .62) / .07, 2));
      colFlou[x] = Math.min(.2, Math.max(N / Math.PI / W / c, 1 / pas) * .9);
    }
    ligne = new Float32Array(H);              // ombre portée des bagues en haut et en bas
    for (var y = 0; y < H; y++) {
      var b = Math.min(y, H - 1 - y) / H;
      ligne[y] = 1 - .5 * Math.exp(-b / .03);
    }
  }

  function dessine(tour) {
    var i = 0;
    for (var y = 0; y < H; y++) {
      var py = y / pas, v = ligne[y];
      for (var x = 0; x < W; x++, i += 4) {
        var t = N * (colA[x] + tour) + py;
        t -= Math.floor(t);
        var k = t < .3 ? 0 : t < .5 ? 1 : t < .8 ? 2 : 3;
        var c0 = COUL[k], r = c0[0], g = c0[1], bl = c0[2];
        var e = colFlou[x], ds = t - BORNES[k], de = BORNES[k + 1] - t, w, c1;
        if (ds < e) { w = .5 * (1 - ds / e); c1 = COUL[(k + 3) % 4]; }
        else if (de < e) { w = .5 * (1 - de / e); c1 = COUL[(k + 1) % 4]; }
        if (c1) { r += (c1[0] - r) * w; g += (c1[1] - g) * w; bl += (c1[2] - bl) * w; c1 = null; }
        var s = colOmbre[x] * v, sp = colReflet[x] * 255 * v;
        px[i] = r * s + sp; px[i + 1] = g * s + sp; px[i + 2] = bl * s + sp; px[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  var tour = 0, elan = 0, avant = 0, yAvant = window.scrollY, boucle = 0;

  function anime(t) {
    var dt = Math.min(.05, (t - (avant || t)) / 1000);
    avant = t;
    elan *= Math.exp(-dt * 2.5);
    tour += (.32 + elan) * dt;
    dessine(tour);
    boucle = requestAnimationFrame(anime);
  }

  function demarre() {
    cancelAnimationFrame(boucle);
    prepare();
    if (calme.matches) dessine(.1);
    else { avant = 0; boucle = requestAnimationFrame(anime); }
  }

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    elan = Math.min(2.4, elan + Math.abs(y - yAvant) / 260);
    yAvant = y;
  }, { passive: true });
  window.addEventListener('resize', function () { prepare(); if (calme.matches) dessine(.1); });
  if (calme.addEventListener) calme.addEventListener('change', demarre);

  p.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: calme.matches ? 'auto' : 'smooth' });
  });

  demarre();
})();

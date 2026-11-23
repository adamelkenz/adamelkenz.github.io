(function () {
  'use strict';
  // ---------- Configuration ----------
  var DEFAULT_CFG = { owner: 'adamelkenz', repo: 'adamelkenz.github.io', branch: 'master', dir: 'dar-ennekhwa' };
  var SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Taille unique'];
  var MAX_SIDE = 1400, JPEG_Q = 0.85;

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var cfg = DEFAULT_CFG;
  try { cfg = Object.assign({}, DEFAULT_CFG, JSON.parse(store.get('de-cfg') || '{}')); } catch (e) {}
  var token = store.get('de-gh-token') || '';

  var DATA = null, ORIGINAL = '', pending = {}, previews = {};
  var editP = null, formPhotos = [], editC = null, cFromProduct = false;

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var slug = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'item'; };
  var uid = function (base, list) { var id = slug(base), n = 2, out = id; while (list.some(function (x) { return x.id === out; })) out = id + '-' + n++; return out; };
  var join = function () { return Array.prototype.slice.call(arguments).filter(Boolean).join('/').replace(/\/+/g, '/'); };
  var src = function (path) { return previews[path] || path; };
  var gLabel = function (g) { return g === 'femme' ? 'Femme' : 'Homme'; };

  function toast(msg, bad) {
    var t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.className = 'toast'; }, bad ? 6000 : 3500);
  }

  // ---------- GitHub API ----------
  function gh(path, opts) {
    opts = opts || {};
    var h = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (opts.body) h['Content-Type'] = 'application/json';
    return fetch('https://api.github.com' + path, { method: opts.method || 'GET', headers: h, body: opts.body, cache: 'no-store' })
      .then(function (r) {
        if (r.ok) return r.status === 204 ? null : r.json();
        return r.text().then(function (t) { var e = new Error(t || r.statusText); e.status = r.status; throw e; });
      });
  }
  var repoPath = function () { return '/repos/' + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo); };
  function decodeB64(b64) {
    var bin = atob(b64.replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function errText(e) {
    if (e.status === 401) return 'Clé d’accès invalide ou expirée. Créez-en une nouvelle.';
    if (e.status === 403) return 'Cette clé n’a pas le droit de modifier le site (permission « Contents : Read and write » requise).';
    if (e.status === 404) return 'Site introuvable avec cette clé : vérifiez que la clé donne accès au dépôt ' + cfg.owner + '/' + cfg.repo + '.';
    if (e.status === 409 || e.status === 422) return 'Le site a été modifié entre-temps. Rechargez la page puis réessayez.';
    if (!navigator.onLine) return 'Pas de connexion internet.';
    return 'Erreur : ' + (e.message || e).toString().slice(0, 160);
  }

  // ---------- Chargement / publication ----------
  function loadCatalogue() {
    return gh(repoPath() + '/contents/' + join(cfg.dir, 'data/catalogue.json') + '?ref=' + encodeURIComponent(cfg.branch))
      .then(function (j) { return JSON.parse(decodeB64(j.content)); });
  }

  function login() {
    $('#loginErr').textContent = '';
    $('#loginBtn').disabled = true; $('#loginBtn').textContent = 'Connexion…';
    return gh(repoPath())
      .then(function (repo) {
        if (repo.permissions && !repo.permissions.push) { var e = new Error('no push'); e.status = 403; throw e; }
        return loadCatalogue();
      })
      .then(function (d) {
        DATA = { settings: d.settings || {}, collections: d.collections || [], products: d.products || [] };
        ORIGINAL = JSON.stringify(DATA); pending = {};
        store.set('de-gh-token', token);
        showApp();
      })
      .catch(function (e) {
        $('#loginErr').textContent = errText(e);
        showLogin();
      })
      .then(function () { $('#loginBtn').disabled = false; $('#loginBtn').textContent = 'Se connecter'; });
  }

  function usedImages() {
    var s = {}; DATA.products.forEach(function (p) { (p.images || []).forEach(function (i) { s[i] = 1; }); }); return s;
  }
  function isDirty() {
    if (!DATA) return false;
    if (JSON.stringify(DATA) !== ORIGINAL) return true;
    var u = usedImages(); return Object.keys(pending).some(function (k) { return u[k]; });
  }
  function refreshBar() {
    var d = isDirty();
    $('#pubbar').hidden = !d;
    if (d) $('#pubMsg').textContent = 'Modifications non publiées — cliquez sur « Publier » pour les mettre en ligne.';
  }

  function publish() {
    var btn = $('#publish'); btn.disabled = true; btn.textContent = 'Publication…';
    var base = repoPath(), parent, used = usedImages(), files = Object.keys(pending).filter(function (k) { return used[k]; });
    var done = 0;
    $('#pubMsg').textContent = files.length ? 'Envoi des photos…' : 'Publication…';
    gh(base + '/git/ref/heads/' + encodeURIComponent(cfg.branch))
      .then(function (ref) { parent = ref.object.sha; return gh(base + '/git/commits/' + parent); })
      .then(function (commit) {
        var tree = [];
        // envoie les photos une par une (évite les limites de taille)
        return files.reduce(function (pr, path) {
          return pr.then(function () {
            return gh(base + '/git/blobs', { method: 'POST', body: JSON.stringify({ content: pending[path], encoding: 'base64' }) })
              .then(function (b) {
                tree.push({ path: join(cfg.dir, path), mode: '100644', type: 'blob', sha: b.sha });
                $('#pubMsg').textContent = 'Envoi des photos… ' + (++done) + '/' + files.length;
              });
          });
        }, Promise.resolve()).then(function () {
          tree.push({ path: join(cfg.dir, 'data/catalogue.json'), mode: '100644', type: 'blob', content: JSON.stringify(DATA, null, 1) + '\n' });
          return gh(base + '/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree: tree }) });
        });
      })
      .then(function (t) {
        return gh(base + '/git/commits', { method: 'POST', body: JSON.stringify({ message: 'Boutique : mise à jour du catalogue (' + DATA.products.length + ' articles, ' + DATA.collections.length + ' collections)', tree: t.sha, parents: [parent] }) });
      })
      .then(function (c) { return gh(base + '/git/refs/heads/' + encodeURIComponent(cfg.branch), { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) }); })
      .then(function () {
        pending = {}; ORIGINAL = JSON.stringify(DATA);
        refreshBar(); renderAll();
        toast('Publié ✓ Visible sur le site dans 1 à 2 minutes.');
      })
      .catch(function (e) { toast(errText(e), true); $('#pubMsg').textContent = 'La publication a échoué. Vos modifications sont toujours là, réessayez.'; })
      .then(function () { btn.disabled = false; btn.textContent = 'Publier sur le site'; });
  }

  // ---------- Vues ----------
  function showLogin() { $('#loginView').hidden = false; $('#appView').hidden = true; $('#logout').hidden = true; $('#token').value = token; }
  function showApp() {
    $('#loginView').hidden = true; $('#appView').hidden = false; $('#logout').hidden = false;
    $('#setWa').value = DATA.settings.whatsapp || ''; $('#setIg').value = DATA.settings.instagramUrl || '';
    $('#cfgOwner').value = cfg.owner; $('#cfgRepo').value = cfg.repo; $('#cfgBranch').value = cfg.branch; $('#cfgDir').value = cfg.dir;
    renderAll(); refreshBar();
  }
  function collById(id) { return DATA.collections.filter(function (c) { return c.id === id; })[0]; }
  function countIn(id) { return DATA.products.filter(function (p) { return p.collectionId === id; }).length; }

  function collOptions(selected, withAll) {
    var h = withAll ? '<option value="all">Toutes les collections (' + DATA.products.length + ')</option>' : '<option value="">— Choisir une collection —</option>';
    ['homme', 'femme'].forEach(function (g) {
      var cs = DATA.collections.filter(function (c) { return c.gender === g; });
      if (!cs.length) return;
      h += '<optgroup label="' + gLabel(g) + '">' + cs.map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (c.id === selected ? ' selected' : '') + '>' + esc(c.nameFr) + (withAll ? ' (' + countIn(c.id) + ')' : '') + '</option>';
      }).join('') + '</optgroup>';
    });
    return h;
  }

  function renderProducts() {
    var f = $('#pFilter').value || 'all';
    $('#pFilter').innerHTML = collOptions(f, true);
    if (f !== 'all' && !collById(f)) f = 'all';
    $('#pFilter').value = f;
    var orig = {}; try { JSON.parse(ORIGINAL).products.forEach(function (p) { orig[p.id] = JSON.stringify(p); }); } catch (e) {}
    var list = DATA.products.filter(function (p) { return f === 'all' || p.collectionId === f; });
    $('#cntP').textContent = '(' + DATA.products.length + ')';
    if (!DATA.collections.length) { $('#plist').innerHTML = '<div class="empty-a">Commencez par créer une collection (onglet « Collections »), puis ajoutez vos articles.</div>'; return; }
    if (!list.length) { $('#plist').innerHTML = '<div class="empty-a">Aucun article dans cette collection. Cliquez sur « + Nouvel article ».</div>'; return; }
    $('#plist').innerHTML = list.map(function (p) {
      var c = collById(p.collectionId) || { nameFr: '?', gender: 'homme' };
      var changed = orig[p.id] !== JSON.stringify(p);
      return '<div class="pitem' + (changed ? ' new' : '') + '">' +
        '<div class="th">' + (p.images && p.images[0] ? '<img src="' + esc(src(p.images[0])) + '" alt="" loading="lazy">' : '') +
        '<span class="tag ' + (c.gender === 'femme' ? 'f' : '') + '">' + gLabel(c.gender) + '</span>' +
        (p.inStock === false ? '<span class="tag out">Épuisé</span>' : '') + '</div>' +
        '<div class="bd"><h3>' + esc(p.titleFr) + '</h3>' +
        (p.colorFr ? '<div class="meta">' + (p.hex ? '<i style="background:' + esc(p.hex) + '"></i>' : '') + esc(p.colorFr) + '</div>' : '') +
        '<div class="meta">' + esc(c.nameFr) + '</div>' +
        '<div class="pr">' + esc(p.price) + ' DH</div>' +
        (changed ? '<div class="meta" style="color:var(--brass-d)">● Non publié</div>' : '') +
        '<div class="acts"><button class="abtn sm primary" data-edit="' + esc(p.id) + '">Modifier</button>' +
        '<button class="abtn sm" data-dup="' + esc(p.id) + '" title="Créer un article identique (ex. autre couleur)">Dupliquer</button>' +
        '<button class="abtn sm" data-stock="' + esc(p.id) + '">' + (p.inStock === false ? 'Remettre en stock' : 'Épuisé') + '</button></div></div></div>';
    }).join('');
  }

  function renderCollections() {
    $('#cntC').textContent = '(' + DATA.collections.length + ')';
    if (!DATA.collections.length) { $('#clist').innerHTML = '<div class="empty-a">Aucune collection. Cliquez sur « + Nouvelle collection ».</div>'; return; }
    $('#clist').innerHTML = ['homme', 'femme'].map(function (g) {
      return DATA.collections.filter(function (c) { return c.gender === g; }).map(function (c) {
        var n = countIn(c.id);
        return '<div class="citem"><span class="g ' + g + '">' + gLabel(g) + '</span>' +
          '<div class="nm"><b>' + esc(c.nameFr) + '</b><small>' + n + ' article' + (n > 1 ? 's' : '') + (c.nameEn ? ' · EN : ' + esc(c.nameEn) : '') + '</small></div>' +
          '<button class="abtn sm" data-addin="' + esc(c.id) + '">+ Article</button>' +
          '<button class="abtn sm primary" data-cedit="' + esc(c.id) + '">Modifier</button></div>';
      }).join('');
    }).join('');
  }

  function renderAll() { renderProducts(); renderCollections(); refreshBar(); }

  // ---------- Formulaire article ----------
  function renderPhotos() {
    $('#pPhotos').innerHTML = formPhotos.map(function (p, i) {
      return '<div class="ph-it"><img src="' + esc(src(p)) + '" alt="">' + (i === 0 ? '<span class="main">Principale</span>' : '') +
        '<div class="ctl"><button type="button" data-pl="' + i + '" title="Déplacer à gauche">◀</button>' +
        (i ? '<button type="button" data-pm="' + i + '" title="Photo principale">★</button>' : '') +
        '<button type="button" data-pr="' + i + '" title="Déplacer à droite">▶</button>' +
        '<button type="button" data-px="' + i + '" title="Retirer">✕</button></div></div>';
    }).join('');
  }
  function renderSizeChips(sizes) {
    $('#pSizes').innerHTML = SIZE_PRESETS.map(function (s) {
      return '<label><input type="checkbox" value="' + esc(s) + '"' + (sizes.indexOf(s) >= 0 ? ' checked' : '') + '><span>' + esc(s) + '</span></label>';
    }).join('');
    $('#pSizesExtra').value = sizes.filter(function (s) { return SIZE_PRESETS.indexOf(s) < 0; }).join(', ');
  }

  function openProduct(id, opts) {
    opts = opts || {};
    if (!DATA.collections.length) { toast('Créez d’abord une collection.', true); openCollection(null, true); return; }
    var p = id ? DATA.products.filter(function (x) { return x.id === id; })[0] : null;
    var base = p || opts.copy || {};
    editP = p ? p.id : null;
    $('#pFormTitle').textContent = p ? 'Modifier l’article' : (opts.copy ? 'Nouvel article (copie)' : 'Nouvel article');
    var f = $('#pFilter').value;
    var coll = base.collectionId || opts.coll || (f && f !== 'all' ? f : '');
    $('#pColl').innerHTML = collOptions(coll, false);
    $('#pTitleFr').value = base.titleFr || ''; $('#pTitleEn').value = base.titleEn || '';
    $('#pColorFr').value = opts.copy ? '' : base.colorFr || ''; $('#pColorEn').value = opts.copy ? '' : base.colorEn || '';
    $('#pHexOn').checked = !!base.hex; $('#pHex').value = base.hex || '#7b9986';
    $('#pDescFr').value = base.descFr || ''; $('#pDescEn').value = base.descEn || '';
    $('#pPrice').value = base.price != null ? base.price : '';
    $('#pStock').checked = base.inStock !== false;
    $('#pBadgeFr').value = opts.copy ? '' : base.badgeFr || ''; $('#pBadgeEn').value = opts.copy ? '' : base.badgeEn || '';
    renderSizeChips(base.sizes || ['S', 'M', 'L', 'XL']);
    formPhotos = opts.copy ? [] : (base.images || []).slice();
    renderPhotos();
    $('#pDelete').hidden = !p; $('#pErr').textContent = '';
    $('#pModal').classList.add('open');
    setTimeout(function () { (coll ? $('#pTitleFr') : $('#pColl')).focus(); }, 50);
  }

  function saveProduct(e) {
    e.preventDefault();
    var coll = $('#pColl').value, titleFr = $('#pTitleFr').value.trim(), price = $('#pPrice').value;
    if (!coll) { $('#pErr').textContent = 'Choisissez une collection (ou créez-en une).'; return; }
    if (!titleFr) { $('#pErr').textContent = 'Le nom de l’article est obligatoire.'; return; }
    if (price === '' || +price < 0) { $('#pErr').textContent = 'Indiquez un prix.'; return; }
    var sizes = $$('#pSizes input:checked').map(function (i) { return i.value; })
      .concat($('#pSizesExtra').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean));
    sizes = sizes.filter(function (s, i) { return sizes.indexOf(s) === i; });
    if (!sizes.length) { $('#pErr').textContent = 'Choisissez au moins une taille.'; return; }
    var obj = {
      id: editP || uid(titleFr + ' ' + $('#pColorFr').value, DATA.products),
      collectionId: coll,
      titleFr: titleFr, titleEn: $('#pTitleEn').value.trim(),
      colorFr: $('#pColorFr').value.trim(), colorEn: $('#pColorEn').value.trim(),
      hex: $('#pHexOn').checked ? $('#pHex').value : '',
      descFr: $('#pDescFr').value.trim(), descEn: $('#pDescEn').value.trim(),
      price: Math.round(+price), sizes: sizes,
      badgeFr: $('#pBadgeFr').value.trim(), badgeEn: $('#pBadgeEn').value.trim(),
      inStock: $('#pStock').checked,
      images: formPhotos.slice()
    };
    if (editP) DATA.products = DATA.products.map(function (p) { return p.id === editP ? obj : p; });
    else DATA.products.push(obj);
    closeModal($('#pModal'));
    renderAll();
    toast(editP ? 'Article modifié. Pensez à publier.' : 'Article ajouté. Pensez à publier.');
  }

  function addFiles(files) {
    files = Array.prototype.slice.call(files || []).filter(function (f) { return /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name); });
    if (!files.length) return;
    var drop = $('.drop'); drop.classList.add('busy');
    var base = slug(($('#pTitleFr').value || 'article') + ' ' + $('#pColorFr').value);
    files.reduce(function (pr, file) {
      return pr.then(function () {
        return resize(file).then(function (dataUrl) {
          var path = 'img/uploads/' + base + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) + '.jpg';
          pending[path] = dataUrl.split(',')[1]; previews[path] = dataUrl;
          formPhotos.push(path); renderPhotos();
        }).catch(function () { toast('« ' + file.name + ' » n’a pas pu être lue. Essayez en JPG ou PNG.', true); });
      });
    }, Promise.resolve()).then(function () { drop.classList.remove('busy'); $('#pFiles').value = ''; });
  }

  function resize(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1, MAX_SIDE / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
        var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', JPEG_Q));
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('format')); };
      im.src = url;
    });
  }

  // ---------- Formulaire collection ----------
  function openCollection(id, fromProduct) {
    var c = id ? collById(id) : null;
    editC = c ? c.id : null; cFromProduct = !!fromProduct;
    $('#cFormTitle').textContent = c ? 'Modifier la collection' : 'Nouvelle collection';
    $('#cNameFr').value = c ? c.nameFr : ''; $('#cNameEn').value = c ? c.nameEn || '' : '';
    $('#cDescFr').value = c ? c.descFr || '' : ''; $('#cDescEn').value = c ? c.descEn || '' : '';
    $$('input[name=cGender]').forEach(function (r) { r.checked = r.value === (c ? c.gender : 'homme'); });
    $('#cDelete').hidden = !c; $('#cErr').textContent = '';
    $('#cModal').classList.add('open');
    setTimeout(function () { $('#cNameFr').focus(); }, 50);
  }
  function saveCollection(e) {
    e.preventDefault();
    var name = $('#cNameFr').value.trim();
    if (!name) { $('#cErr').textContent = 'Le nom de la collection est obligatoire.'; return; }
    var g = ($$('input[name=cGender]').filter(function (r) { return r.checked; })[0] || {}).value || 'homme';
    var obj = { id: editC || uid(name, DATA.collections), nameFr: name, nameEn: $('#cNameEn').value.trim(), gender: g, descFr: $('#cDescFr').value.trim(), descEn: $('#cDescEn').value.trim() };
    if (editC) DATA.collections = DATA.collections.map(function (c) { return c.id === editC ? obj : c; });
    else DATA.collections.push(obj);
    closeModal($('#cModal'));
    if (cFromProduct && $('#pModal').classList.contains('open')) { $('#pColl').innerHTML = collOptions(obj.id, false); $('#pColl').value = obj.id; }
    renderAll();
    toast((editC ? 'Collection modifiée' : 'Collection « ' + name + ' » créée (' + gLabel(g) + ')') + '. Pensez à publier.');
    if (!editC && !$('#pModal').classList.contains('open') && confirm('Collection créée. Ajouter un premier article dedans maintenant ?')) openProduct(null, { coll: obj.id });
  }
  function deleteCollection() {
    var n = countIn(editC), c = collById(editC);
    if (!confirm(n ? 'Supprimer « ' + c.nameFr + ' » ET ses ' + n + ' article(s) ?' : 'Supprimer la collection « ' + c.nameFr + ' » ?')) return;
    DATA.collections = DATA.collections.filter(function (x) { return x.id !== editC; });
    DATA.products = DATA.products.filter(function (p) { return p.collectionId !== editC; });
    closeModal($('#cModal')); renderAll(); toast('Collection supprimée. Pensez à publier.');
  }

  function closeModal(m) { m.classList.remove('open'); }

  // ---------- Événements ----------
  $('#loginBtn').addEventListener('click', function () {
    token = $('#token').value.trim();
    if (!token) { $('#loginErr').textContent = 'Collez votre clé d’accès GitHub.'; return; }
    login();
  });
  $('#token').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#loginBtn').click(); });
  $('#logout').addEventListener('click', function () {
    if (isDirty() && !confirm('Des modifications ne sont pas publiées et seront perdues. Se déconnecter ?')) return;
    store.del('de-gh-token'); token = ''; DATA = null; pending = {}; $('#pubbar').hidden = true; showLogin();
  });

  $$('.atabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.atabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.tab').forEach(function (t) { t.hidden = t.id !== 'tab-' + b.dataset.tab; });
    });
  });
  $('#pFilter').addEventListener('change', renderProducts);
  $('#addProduct').addEventListener('click', function () { openProduct(null); });
  $('#addCollection').addEventListener('click', function () { openCollection(null); });
  $('#pNewColl').addEventListener('click', function () { openCollection(null, true); });
  $('#pForm').addEventListener('submit', saveProduct);
  $('#cForm').addEventListener('submit', saveCollection);
  $('#cDelete').addEventListener('click', deleteCollection);
  $('#pDelete').addEventListener('click', function () {
    if (!confirm('Supprimer cet article ?')) return;
    DATA.products = DATA.products.filter(function (p) { return p.id !== editP; });
    closeModal($('#pModal')); renderAll(); toast('Article supprimé. Pensez à publier.');
  });
  $('#pFiles').addEventListener('change', function (e) { addFiles(e.target.files); });
  var drop = $('.drop');
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { addFiles(e.dataTransfer.files); });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) { if (e.target.classList.contains('amodal')) closeModal(e.target); return; }
    var d = t.dataset, i;
    if (t.hasAttribute('data-close')) return closeModal(t.closest('.amodal'));
    if (d.edit) return openProduct(d.edit);
    if (d.dup) return openProduct(null, { copy: DATA.products.filter(function (p) { return p.id === d.dup; })[0] });
    if (d.stock) { DATA.products.forEach(function (p) { if (p.id === d.stock) p.inStock = p.inStock === false; }); return renderAll(); }
    if (d.cedit) return openCollection(d.cedit);
    if (d.addin) return openProduct(null, { coll: d.addin });
    if (d.pl != null) { i = +d.pl; if (i > 0) formPhotos.splice(i - 1, 0, formPhotos.splice(i, 1)[0]); return renderPhotos(); }
    if (d.pr != null) { i = +d.pr; if (i < formPhotos.length - 1) formPhotos.splice(i + 1, 0, formPhotos.splice(i, 1)[0]); return renderPhotos(); }
    if (d.pm != null) { formPhotos.unshift(formPhotos.splice(+d.pm, 1)[0]); return renderPhotos(); }
    if (d.px != null) { formPhotos.splice(+d.px, 1); return renderPhotos(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = $$('.amodal.open'); if (open.length) closeModal(open[open.length - 1]);
  });

  $('#saveSettings').addEventListener('click', function () {
    DATA.settings.whatsapp = $('#setWa').value.replace(/\D/g, '');
    DATA.settings.instagramUrl = $('#setIg').value.trim();
    $('#setWa').value = DATA.settings.whatsapp;
    refreshBar(); toast(isDirty() ? 'Réglages appliqués. Pensez à publier.' : 'Aucun changement.');
  });
  $('#saveCfg').addEventListener('click', function () {
    store.set('de-cfg', JSON.stringify({ owner: $('#cfgOwner').value.trim(), repo: $('#cfgRepo').value.trim(), branch: $('#cfgBranch').value.trim(), dir: $('#cfgDir').value.trim() }));
    location.reload();
  });
  $('#publish').addEventListener('click', publish);
  $('#discard').addEventListener('click', function () {
    if (!confirm('Annuler toutes les modifications non publiées ?')) return;
    DATA = JSON.parse(ORIGINAL); pending = {};
    showApp(); toast('Modifications annulées.');
  });
  window.addEventListener('beforeunload', function (e) { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });

  // ---------- Démarrage ----------
  $('#repoName').textContent = cfg.owner + '/' + cfg.repo;
  if (token) login(); else showLogin();
})();

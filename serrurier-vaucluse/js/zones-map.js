// Carte des zones d'intervention : la base d'Avignon reliée aux communes du Vaucluse.
(() => {
  const el = document.getElementById('zone-map');
  if (!el || !window.L) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // data-root : chemin vers la racine du site ; data-focus : commune mise en avant (pages des villes)
  const ROOT = el.dataset.root || '';
  const FOCUS = el.dataset.focus || '';
  const BASE = { name: 'Avignon', lat: 43.9493, lng: 4.8055 };
  // Communes qui ont leur propre page
  const PAGES = {
    'Avignon': 'serrurier-avignon', 'Le Pontet': 'serrurier-le-pontet', 'Sorgues': 'serrurier-sorgues',
    'Carpentras': 'serrurier-carpentras', 'Monteux': 'serrurier-monteux', 'Pernes-les-Fontaines': 'serrurier-pernes-les-fontaines',
    'Orange': 'serrurier-orange', 'Bollène': 'serrurier-bollene', 'Vaison-la-Romaine': 'serrurier-vaison-la-romaine',
    'Valréas': 'serrurier-valreas', 'Cavaillon': 'serrurier-cavaillon', "L'Isle-sur-la-Sorgue": 'serrurier-l-isle-sur-la-sorgue',
    'Apt': 'serrurier-apt', 'Pertuis': 'serrurier-pertuis',
  };
  // [nom, lat, lng, type, description, page] — « city » = Grand Avignon, « near » = reste du département
  const POINTS = [
    ['Avignon', 43.9493, 4.8055, 'city', 'La cité des Papes, notre point de départ.'],
    ['Le Pontet', 43.9617, 4.8606, 'city', 'Commune voisine à l’est d’Avignon.'],
    ['Sorgues', 44.0083, 4.8728, 'city', 'Au nord d’Avignon, entre Rhône et Ouvèze.'],
    ['Morières-lès-Avignon', 43.9406, 4.9050, 'city', 'À l’est d’Avignon, sur la route de Cavaillon.'],
    ['Vedène', 43.9775, 4.9036, 'city', 'Commune du Grand Avignon, au nord-est.'],
    ['Entraigues-sur-la-Sorgue', 43.9989, 4.9269, 'city', 'Entre Avignon et Carpentras.'],
    ['Bédarrides', 44.0400, 4.8975, 'near', 'Au confluent de l’Ouvèze, au nord de Sorgues.'],
    ['Châteauneuf-du-Pape', 44.0561, 4.8325, 'near', 'Le célèbre village viticole, entre Avignon et Orange.'],
    ['Monteux', 44.0361, 4.9967, 'near', 'Aux portes de Carpentras, dans le Comtat Venaissin.'],
    ['Carpentras', 44.0556, 5.0481, 'near', 'La capitale du Comtat Venaissin.'],
    ['Pernes-les-Fontaines', 43.9986, 5.0592, 'near', 'La ville aux quarante fontaines.'],
    ['Le Thor', 43.9292, 4.9950, 'near', 'Sur la Sorgue, entre Avignon et L’Isle-sur-la-Sorgue.'],
    ['L\'Isle-sur-la-Sorgue', 43.9194, 5.0514, 'near', 'La « Venise comtadine » et ses antiquaires.'],
    ['Cavaillon', 43.8375, 5.0381, 'near', 'Au pied du Luberon, sur la Durance.'],
    ['Orange', 44.1381, 4.8075, 'near', 'Le Haut-Vaucluse et son théâtre antique.'],
    ['Bollène', 44.2803, 4.7489, 'near', 'Au nord du département, le long du Rhône.'],
    ['Vaison-la-Romaine', 44.2408, 5.0742, 'near', 'Au pied du Ventoux, dans le Haut-Vaucluse.'],
    ['Valréas', 44.3847, 4.9908, 'near', 'L’Enclave des Papes, tout au nord.'],
    ['Apt', 43.8764, 5.3964, 'near', 'Au cœur du Luberon.'],
    ['Pertuis', 43.6942, 5.5017, 'near', 'Le sud du Luberon, au bord de la Durance.'],
  ].map(([name, lat, lng, type, desc]) => ({ name, lat, lng, type, desc, page: PAGES[name] }));

  const km = (a, b) => {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  // Avignon est la base elle-même : on la garde dans la liste mais sans trajet
  const AREAS = POINTS.filter((p) => p.name !== BASE.name);
  AREAS.forEach((p) => { p.km = km(BASE, p); });
  AREAS.sort((a, b) => a.km - b.km);

  const map = L.map(el, {
    zoomControl: true, scrollWheelZoom: false, dragging: !L.Browser.mobile, tap: true,
    minZoom: 8, maxZoom: 15, zoomSnap: 0.25, attributionControl: true,
  });
  // Fond de carte sombre Esri (Dark Gray Canvas) + calque des noms de lieux
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
  L.tileLayer(ESRI + 'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 15, attribution: 'Fond de carte &copy; Esri, HERE, Garmin, &copy; contributeurs OpenStreetMap',
  }).addTo(map);
  map.createPane('labels'); map.getPane('labels').style.zIndex = 450; map.getPane('labels').style.pointerEvents = 'none';
  L.tileLayer(ESRI + 'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 15, pane: 'labels' }).addTo(map);
  const all = L.latLngBounds([[BASE.lat, BASE.lng], ...AREAS.map((p) => [p.lat, p.lng])]);
  const fit = (animate) => map.fitBounds(all, { padding: [36, 36], animate });
  fit(false);
  map.setMaxBounds(all.pad(1.2));

  // Molette activée seulement après un clic (pour ne pas bloquer le défilement de la page)
  const hint = document.getElementById('zone-hint');
  map.on('click', () => { map.scrollWheelZoom.enable(); hint.classList.add('off'); });
  el.addEventListener('mouseleave', () => { map.scrollWheelZoom.disable(); hint.classList.remove('off'); });
  if (L.Browser.mobile) hint.textContent = 'Deux doigts pour zoomer sur la carte';

  // Arc courbe entre la base et une commune (Bézier quadratique)
  function arc(a, b, bend = 0.22, n = 48) {
    const k = Math.cos(a.lat * Math.PI / 180);
    const ax = a.lng * k, ay = a.lat, bx = b.lng * k, by = b.lat;
    const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay;
    const cx = mx - dy * bend, cy = my + dx * bend;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      const x = u * u * ax + 2 * u * t * cx + t * t * bx, y = u * u * ay + 2 * u * t * cy + t * t * by;
      pts.push([y, x / k]);
    }
    return pts;
  }

  // Réseau discret entre communes voisines (chaque point relié à ses 2 plus proches)
  const net = [];
  const seen = new Set();
  AREAS.forEach((p, i) => {
    AREAS.map((q, j) => ({ j, d: km(p, q) })).filter((o) => o.j !== i).sort((x, y) => x.d - y.d).slice(0, 2).forEach(({ j }) => {
      const key = [i, j].sort().join('-');
      if (seen.has(key)) return; seen.add(key);
      net.push(L.polyline([[p.lat, p.lng], [AREAS[j].lat, AREAS[j].lng]], { color: '#8F7BFF', weight: 1.2, opacity: 0, className: 'znet', interactive: false }).addTo(map));
    });
  });

  // Bouton de la base en tête de liste
  const items = document.getElementById('zone-items');
  const baseLi = document.createElement('li');
  baseLi.innerHTML = '<button type="button"><span class="zl-dot" style="background:var(--halo);box-shadow:0 0 0 2px var(--cyan)"></span><span class="zl-name">Avignon</span><span class="zl-km">base</span></button>';
  items.appendChild(baseLi);

  // Trajets, marqueurs, points mobiles
  const routes = AREAS.map((p, i) => {
    const color = p.type === 'near' ? '#8F7BFF' : '#00D1FF';
    const pts = arc(BASE, p, i % 2 ? 0.22 : -0.22);
    const glow = L.polyline(pts, { color, weight: 7, opacity: 0, className: 'zglow', interactive: false }).addTo(map);
    const line = L.polyline(pts, { color, weight: 2.4, opacity: 0, className: 'zroute', interactive: false }).addTo(map);
    const icon = L.divIcon({ className: 'zm-icon', iconSize: [22, 22], html: `<span class="zm ${p.type}" style="--d:${(i % 6) * 0.4}s"><i></i></span>` });
    const marker = L.marker([p.lat, p.lng], { icon, keyboard: true, title: p.name, riseOnHover: true }).addTo(map);
    marker.bindTooltip(p.name, { direction: 'top', offset: [0, -10], className: 'zone-tip' });
    marker.bindPopup(
      `<strong>${p.name}</strong><span class="pp-type ${p.type}">${p.type === 'near' ? 'Vaucluse' : 'Grand Avignon'}</span>` +
      `<p>${p.desc}</p><span class="pp-km">≈ ${p.km.toFixed(1).replace('.', ',')} km d'Avignon (à vol d'oiseau)</span><br>` +
      (p.page ? `<a class="pp-link" href="${ROOT}${p.page}/">Serrurier à ${p.name} →</a><br>` : '') +
      `<a class="pp-link" href="#contact">Demander une intervention →</a>`);
    const dot = L.circleMarker(pts[0], { radius: 3.5, color, fillColor: '#D6F4FF', weight: 2, opacity: 0, fillOpacity: 0, interactive: false }).addTo(map);

    const li = document.createElement('li');
    li.innerHTML = `<button type="button"><span class="zl-dot ${p.type}"></span><span class="zl-name">${p.name}</span><span class="zl-km">${p.km.toFixed(1).replace('.', ',')} km</span></button>`;
    items.appendChild(li);
    const r = { p, pts, line, glow, marker, dot, btn: li.firstChild, speed: 0.12 + Math.random() * 0.1, offset: Math.random() };

    const on = () => highlight(r), off = () => highlight(null);
    marker.on('mouseover', on); marker.on('mouseout', off);
    marker.on('click', () => select(r));
    li.firstChild.addEventListener('mouseenter', on);
    li.firstChild.addEventListener('mouseleave', off);
    li.firstChild.addEventListener('focus', on);
    li.firstChild.addEventListener('blur', off);
    li.firstChild.addEventListener('click', () => { select(r); r.marker.openPopup(); });
    return r;
  });

  const baseIcon = L.divIcon({ className: 'zm-icon', iconSize: [34, 34], html: '<span class="zm base"><svg><use href="#i-key"/></svg></span>' });
  const baseMarker = L.marker([BASE.lat, BASE.lng], { icon: baseIcon, zIndexOffset: 1000, title: 'Base à Avignon' }).addTo(map);
  baseMarker.bindTooltip('Base à Avignon', { direction: 'top', offset: [0, -16], className: 'zone-tip' });
  baseMarker.bindPopup(`<strong>Serrurier Vaucluse</strong><p>Avignon : le point de départ de nos interventions dans tout le département.</p><a class="pp-link" href="${ROOT}serrurier-avignon/">Serrurier à Avignon →</a><br><a class="pp-link" href="#contact">Nous contacter →</a>`);
  baseLi.firstChild.addEventListener('click', () => {
    active = null; routes.forEach((x) => x.btn.classList.remove('active')); highlight(null);
    map.flyTo([BASE.lat, BASE.lng], Math.max(map.getZoom(), 12), { duration: reduced ? 0 : 0.9 });
    baseMarker.openPopup();
  });

  let active = null;
  function highlight(r) {
    const target = r || active;
    el.classList.toggle('dim', !!target);
    routes.forEach((x) => {
      const hl = x === target;
      x.line.getElement()?.classList.toggle('hl', hl);
      x.glow.getElement()?.classList.toggle('hl', hl);
      x.marker.getElement()?.querySelector('.zm')?.classList.toggle('hl', hl);
    });
  }
  function select(r) {
    active = r;
    routes.forEach((x) => x.btn.classList.toggle('active', x === r));
    highlight(r);
    map.flyTo([r.p.lat, r.p.lng], Math.max(map.getZoom(), 12), { duration: reduced ? 0 : 0.9 });
  }
  map.on('popupclose', () => { active = null; routes.forEach((x) => x.btn.classList.remove('active')); highlight(null); });

  // Animation d'entrée : la base apparaît, puis les trajets se dessinent un à un
  let started = false, timers = [];
  function intro() {
    timers.forEach(clearTimeout); timers = [];
    started = true;
    baseMarker.getElement().querySelector('.zm').classList.add('show');
    routes.forEach((r) => {
      r.line.setStyle({ opacity: 0 }); r.glow.setStyle({ opacity: 0 }); r.dot.setStyle({ opacity: 0, fillOpacity: 0 });
      r.marker.getElement().querySelector('.zm').classList.remove('show');
      r.line.getElement().classList.remove('flow');
    });
    net.forEach((n) => n.setStyle({ opacity: 0 }));
    routes.forEach((r, i) => {
      timers.push(setTimeout(() => {
        const path = r.line.getElement();
        r.line.setStyle({ opacity: 0.95 }); r.glow.setStyle({ opacity: 0.35 });
        if (!reduced) {
          const len = path.getTotalLength();
          path.style.transition = 'none';
          path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
          path.getBoundingClientRect();
          path.style.transition = 'stroke-dashoffset .9s ease-out';
          path.style.strokeDashoffset = 0;
        }
        timers.push(setTimeout(() => {
          r.marker.getElement().querySelector('.zm').classList.add('show');
          path.style.transition = ''; path.style.strokeDasharray = ''; path.style.strokeDashoffset = '';
          if (!reduced) { path.classList.add('flow'); r.dot.setStyle({ opacity: 1, fillOpacity: 1 }); }
        }, reduced ? 0 : 900));
      }, reduced ? 0 : 300 + i * 140));
    });
    const done = reduced ? 0 : 300 + routes.length * 140 + 900;
    timers.push(setTimeout(() => net.forEach((n) => n.setStyle({ opacity: 0.35 })), done));
    // Page d'une ville : on met la commune en avant une fois les trajets dessinés
    const focus = routes.find((r) => r.p.name === FOCUS);
    if (focus) timers.push(setTimeout(() => { select(focus); focus.marker.openPopup(); }, done + 200));
  }
  document.getElementById('zone-replay').addEventListener('click', () => { map.closePopup(); fit(true); intro(); });

  // Points lumineux qui voyagent d'Avignon vers chaque commune
  let visible = false;
  new IntersectionObserver((en) => {
    visible = en[0].isIntersecting;
    if (visible && !started) { map.invalidateSize(); intro(); }
  }, { threshold: 0.35 }).observe(el);
  function tick(now) {
    requestAnimationFrame(tick);
    if (!visible || reduced) return;
    const t = now / 1000;
    routes.forEach((r) => {
      const k = (t * r.speed + r.offset) % 1, f = k * (r.pts.length - 1), i = Math.floor(f), u = f - i;
      const a = r.pts[i], b = r.pts[Math.min(i + 1, r.pts.length - 1)];
      r.dot.setLatLng([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    });
  }
  requestAnimationFrame(tick);
})();

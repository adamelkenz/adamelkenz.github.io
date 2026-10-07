// Scène 3D du hero : une porte forcée qui se répare en boucle.
// Effraction (porte entrouverte, cylindre arraché, éclats) → réparation (porte refermée,
// cylindre neuf, vissage) → verrouillage (la clé tourne, les 3 points sortent).
(function () {
  const container = document.getElementById('door3d');
  if (!container || !window.THREE) return;

  const canvas = document.createElement('canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    container.insertAdjacentHTML('beforeend', '<div class="nogl">La 3D n\'est pas disponible sur cet appareil.</div>');
    return;
  }
  container.insertBefore(canvas, container.firstChild);
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Animation 3D : une porte forcée est réparée puis verrouillée');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  // --- Environnement pour les reflets (tons chauds pour le laiton) ---
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x070b18, side: THREE.BackSide })));
  function panel(color, strength, w, h, pos) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide }));
    m.position.set(pos[0], pos[1], pos[2]);
    m.lookAt(0, 0, 0);
    env.add(m);
  }
  panel(0xffffff, 4, 8, 2.5, [0, 8, 4]);
  panel(0xffd76a, 3.5, 3, 8, [-8, 1, 2]);
  panel(0xfff6cc, 2.5, 3, 8, [8, 0, 3]);
  panel(0xfff1c4, 3, 6, 2.5, [3, 3, 7]);
  panel(0x8f7bff, 1.2, 6, 1.5, [0, -6, 6]);
  scene.environment = pmrem.fromScene(env, 0.04).texture;

  function radialTexture(inner, outer) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  // --- Lumières ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const keyLight = new THREE.DirectionalLight(0xfff6dc, 1.4);
  keyLight.position.set(3, 5, 6);
  scene.add(keyLight);
  const rim = new THREE.PointLight(0x8f7bff, 3, 12);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
  const lockGlow = new THREE.PointLight(0xdff6ff, 0, 4);
  lockGlow.position.set(0.9, -0.2, 1.2);
  scene.add(lockGlow);
  const alarmGlow = new THREE.PointLight(0x8f7bff, 0, 5);
  alarmGlow.position.set(0.9, -0.2, 1.2);
  scene.add(alarmGlow);

  // Halo derrière la porte et ombre au sol
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(0,209,255,1)', 'rgba(0,209,255,0)'),
    transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  halo.scale.set(7, 7, 1);
  halo.position.set(0, 0.2, -1.6);
  scene.add(halo);

  // --- Matériaux ---
  const doorMat = new THREE.MeshPhysicalMaterial({ color: 0x141c3c, metalness: 0.15, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.45 });
  const moldMat = new THREE.MeshPhysicalMaterial({ color: 0x2b3a67, metalness: 0.3, roughness: 0.45, clearcoat: 0.3, envMapIntensity: 0.5, emissive: 0x00d1ff, emissiveIntensity: 0.06 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x121a33, metalness: 0.6, roughness: 0.4 });
  const brass = new THREE.MeshPhysicalMaterial({ color: 0xf2c230, metalness: 0.9, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2, emissive: 0x6b4a00, emissiveIntensity: 0.35 });
  const boltMat = new THREE.MeshStandardMaterial({ color: 0xd6f4ff, metalness: 1, roughness: 0.12, emissive: 0x00d1ff, emissiveIntensity: 0 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd6f4ff, metalness: 1, roughness: 0.12 });
  const worn = new THREE.MeshStandardMaterial({ color: 0x585e6c, metalness: 0.7, roughness: 0.65 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x070b18, metalness: 0.3, roughness: 0.6 });
  const violet = new THREE.MeshStandardMaterial({ color: 0x8f7bff, metalness: 0.7, roughness: 0.25, emissive: 0x8f7bff, emissiveIntensity: 0.25 });
  const neon = new THREE.MeshBasicMaterial({ color: 0x00d1ff, toneMapped: false });
  const crackMat = new THREE.MeshBasicMaterial({ color: 0x8f7bff, transparent: true, opacity: 1, toneMapped: false });
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x2b3a67, metalness: 0.3, roughness: 0.6, transparent: true });

  const add = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };

  const root = new THREE.Group();
  scene.add(root);

  // --- Dimensions ---
  const W = 1.6, H = 3.0, T = 0.12;
  const FRONT = T / 2;
  const LX = W / 2 - 0.24;           // axe de la serrure sur la porte
  const CYL_Y = -0.2, HANDLE_Y = 0.24;
  const BOLTS_Y = [1.0, CYL_Y, -1.15];

  // Bâti : barres sombres derrière la porte, liseré néon
  const frame = new THREE.Group();
  root.add(frame);
  const FZ = -T / 2 - 0.05;
  add(new THREE.BoxGeometry(0.14, H + 0.3, 0.1), frameMat, -W / 2 - 0.05, 0, FZ, frame);
  const jamb = add(new THREE.BoxGeometry(0.14, H + 0.3, 0.1), frameMat, W / 2 + 0.05, 0, FZ, frame);
  add(new THREE.BoxGeometry(W + 0.38, 0.14, 0.1), frameMat, 0, H / 2 + 0.08, FZ, frame);
  add(new THREE.BoxGeometry(W + 0.6, 0.06, 0.6), frameMat, 0, -H / 2 - 0.06, 0, frame);   // seuil
  [[-W / 2 - 0.12, 0, 0.018, H + 0.3], [W / 2 + 0.12, 0, 0.018, H + 0.3], [0, H / 2 + 0.15, W + 0.26, 0.018]].forEach(([x, y, w, h]) => {
    add(new THREE.BoxGeometry(w, h, 0.02), neon, x, y, FZ + 0.06, frame);
  });
  // Gâches (sur le bâti), celle du milieu arrachée pendant l'effraction
  const strikes = BOLTS_Y.map(y => add(new THREE.BoxGeometry(0.05, 0.22, 0.02), brass, W / 2 + 0.03, y, FZ + 0.06, frame));
  const brokenStrike = strikes[1];

  // Porte : pivote autour des gonds (côté gauche)
  const pivot = new THREE.Group();
  pivot.position.x = -W / 2;
  root.add(pivot);
  const door = new THREE.Group();
  door.position.x = W / 2;
  pivot.add(door);
  add(new THREE.BoxGeometry(W, H, T), doorMat, 0, 0, 0, door);
  // Moulures (deux panneaux en relief)
  [[0.62, 1.05], [-0.72, 1.1]].forEach(([y, h]) => {
    const g = new THREE.Group();
    g.position.set(-0.08, y, FRONT);
    door.add(g);
    const w = W - 0.62, b = 0.05;
    add(new THREE.BoxGeometry(w, b, 0.03), moldMat, 0, h / 2, 0.01, g);
    add(new THREE.BoxGeometry(w, b, 0.03), moldMat, 0, -h / 2, 0.01, g);
    add(new THREE.BoxGeometry(b, h, 0.03), moldMat, w / 2, 0, 0.01, g);
    add(new THREE.BoxGeometry(b, h, 0.03), moldMat, -w / 2, 0, 0.01, g);
  });
  // Charnières
  [1.05, 0, -1.05].forEach(y => add(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 16), brass, -W / 2 - 0.02, y, 0, door));
  // Têtière sur la tranche + pênes (multipoints)
  add(new THREE.BoxGeometry(0.012, H - 0.4, 0.06), brass, W / 2 + 0.006, 0, 0, door);
  const bolts = BOLTS_Y.map(y => add(new THREE.BoxGeometry(0.16, 0.1, 0.05), boltMat, W / 2 - 0.08, y, 0, door));
  // Plaque de propreté, poignée, vis
  add(new THREE.BoxGeometry(0.16, 0.92, 0.02), brass, LX, 0.02, FRONT + 0.01, door);
  const rosette = add(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 24), brass, LX, HANDLE_Y, FRONT + 0.04, door);
  rosette.rotation.x = Math.PI / 2;
  const lever = new THREE.Group();
  lever.position.set(LX, HANDLE_Y, FRONT + 0.08);
  door.add(lever);
  add(new THREE.BoxGeometry(0.36, 0.05, 0.05), brass, -0.17, 0, 0.02, lever);
  add(new THREE.SphereGeometry(0.035, 16, 12), brass, -0.35, 0, 0.02, lever);
  const SCREWS = [0.4, -0.38];
  SCREWS.forEach(y => {
    const s = add(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 16), chrome, LX, y, FRONT + 0.026, door);
    s.rotation.x = Math.PI / 2;
  });

  // Fissure lumineuse près de la serrure (effraction)
  const crackPts = [[0.64, 0.25], [0.48, 0.12], [0.55, 0.0], [0.36, -0.12], [0.44, -0.3], [0.26, -0.46], [0.33, -0.62]]
    .map(([x, y]) => new THREE.Vector3(x, y, FRONT + 0.004));
  const crack = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(crackPts), 60, 0.008, 6, false), crackMat, 0, 0, 0, door);

  // Cylindres : l'ancien (abîmé) et le neuf
  function cylinder(mat, ringMat) {
    const g = new THREE.Group();
    const body = add(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 24), mat, 0, 0, 0, g);
    body.rotation.x = Math.PI / 2;
    const ring = add(new THREE.TorusGeometry(0.06, 0.012, 10, 28), ringMat, 0, 0, 0.05, g);
    ring.rotation.z = 0;
    add(new THREE.BoxGeometry(0.014, 0.05, 0.01), dark, 0, -0.005, 0.052, g);
    return g;
  }
  const CYL_HOME = new THREE.Vector3(LX, CYL_Y, FRONT + 0.03);
  const oldCyl = cylinder(worn, worn);
  door.add(oldCyl);
  const newCyl = cylinder(chrome, brass);
  door.add(newCyl);

  // Clé (violette, comme le reste du site)
  const key = new THREE.Group();
  const SHAFT = 0.42;
  const bow = add(new THREE.TorusGeometry(0.1, 0.03, 14, 32), violet, 0, 0, SHAFT + 0.1, key);
  bow.rotation.y = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.02, 0.02, SHAFT, 12), violet, 0, 0, SHAFT / 2, key).rotation.x = Math.PI / 2;
  [[0.06, 0.06], [0.13, 0.04], [0.2, 0.07]].forEach(([z, h]) => add(new THREE.BoxGeometry(0.02, h, 0.04), violet, 0, -0.02 - h / 2, z, key));
  door.add(key);

  // Tournevis
  const driver = new THREE.Group();
  add(new THREE.CylinderGeometry(0.045, 0.05, 0.3, 16), violet, 0, 0, 0.42, driver).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 10), chrome, 0, 0, 0.14, driver).rotation.x = Math.PI / 2;
  door.add(driver);

  // Éclats de bois au sol
  const chips = [];
  for (let i = 0; i < 14; i++) {
    const c = add(new THREE.BoxGeometry(0.04 + Math.random() * 0.08, 0.015, 0.02 + Math.random() * 0.05), chipMat,
      W / 2 - 0.2 + Math.random() * 0.9, -H / 2 + 0.01, 0.1 + Math.random() * 0.5, root);
    c.rotation.y = Math.random() * Math.PI;
    chips.push(c);
  }

  // Ombre au sol
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.6),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.7)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -H / 2 - 0.09, 0.1);
  root.add(shadow);

  // Onde et étincelles au verrouillage
  const wave = add(new THREE.RingGeometry(0.85, 0.95, 64),
    new THREE.MeshBasicMaterial({ color: 0x00d1ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    LX, CYL_Y, FRONT + 0.05, door);
  const SP = 70;
  const spPos = new Float32Array(SP * 3), spVel = new Float32Array(SP * 3);
  const spGeo = new THREE.BufferGeometry();
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  const spMat = new THREE.PointsMaterial({ color: 0x00d1ff, size: 0.06, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  door.add(new THREE.Points(spGeo, spMat));

  // Poussière ambiante
  const N = 160, pts = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 2.4 + Math.random() * 2.5, a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * Math.PI;
    pts[i * 3] = r * Math.cos(a) * Math.cos(b);
    pts[i * 3 + 1] = r * Math.sin(b);
    pts[i * 3 + 2] = r * Math.sin(a) * Math.cos(b) - 1;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const dust = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00d1ff, size: 0.03, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);

  // --- Animation ---
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = t => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
  const seg = (t, a, b) => Math.min(Math.max((t - a) / (b - a), 0), 1);
  const lerp = (a, b, k) => a + (b - a) * k;

  const CYCLE = 11, LOCK_AT = 7.5;
  let lockFx = 0;

  // Indicateur d'état sous la scène
  const statusEl = container.querySelector('.status');
  const statusText = container.querySelector('.status-text');
  let lastText = '';
  function setPhase(ct) {
    const [p, text] = ct < 2.4 ? ['broken', 'Effraction · serrure forcée'] :
      ct < 6.2 ? ['repairing', 'Réparation en cours…'] :
      ct < LOCK_AT ? ['repairing', 'Verrouillage…'] : ['fixed', 'Porte sécurisée ✓'];
    if (!statusEl || text === lastText) return;
    lastText = text;
    statusEl.dataset.phase = p;
    statusText.textContent = text;
  }

  function pose(t, time) {
    // Porte entrouverte qui bat, puis refermée
    const ajar = (0.42 + Math.sin(time * 2.2) * 0.05) * (1 - ease(seg(t, 2.4, 3.2)));
    pivot.rotation.y = ajar;
    lever.rotation.z = t < 2.4 ? -0.35 + Math.sin(time * 9) * 0.04 : -0.35 * (1 - easeOutBack(seg(t, 2.4, 2.9)));

    // Gâche arrachée qui revient en place
    const s = easeOutBack(seg(t, 2.6, 3.3));
    brokenStrike.position.set(lerp(W / 2 + 0.3, W / 2 + 0.03, s), lerp(CYL_Y - 0.5, CYL_Y, s), lerp(0.35, FZ + 0.06, s));
    brokenStrike.rotation.set(0, 0, lerp(1.1, 0, s));

    // Ancien cylindre : de travers, puis arraché
    const out = ease(seg(t, 3.2, 3.8));
    oldCyl.visible = t < 3.8;
    oldCyl.position.set(CYL_HOME.x + out * 0.6, CYL_HOME.y - out * 0.3 + Math.sin(time * 14) * 0.004 * (1 - out), CYL_HOME.z + 0.07 + out * 1.4);
    oldCyl.rotation.set(0.35 + out * 2, 0.2, 0.5 + out * 3);

    // Cylindre neuf qui arrive
    const inn = easeOutBack(seg(t, 3.8, 4.6));
    newCyl.visible = t >= 3.8;
    newCyl.position.set(CYL_HOME.x, CYL_HOME.y, CYL_HOME.z + (1 - inn) * 1.6);
    newCyl.rotation.set(0, 0, (1 - inn) * 3);

    // Tournevis : vis du haut puis vis du bas
    const dIn = ease(seg(t, 4.4, 4.8)), dOut = ease(seg(t, 5.8, 6.2));
    driver.visible = t > 4.4 && t < 6.2;
    const target = t < 5.2 ? SCREWS[0] : SCREWS[1];
    const hop = t > 5.1 && t < 5.3 ? Math.sin(seg(t, 5.1, 5.3) * Math.PI) * 0.15 : 0;
    driver.position.set(LX + (1 - dIn + dOut) * 0.8, target + (1 - dIn + dOut) * 0.4,
      FRONT + 0.03 + (1 - dIn + dOut) * 1.2 + hop);
    driver.rotation.set(0, 0, t > 4.8 && t < 5.8 ? time * 18 : 0);

    // Fissure et éclats qui disparaissent
    crackMat.opacity = 1 - ease(seg(t, 4.0, 5.4));
    crack.visible = crackMat.opacity > 0.01;
    const chipK = 1 - ease(seg(t, 3.2, 4.2));
    chips.forEach(c => { c.scale.setScalar(Math.max(0.001, chipK)); });
    alarmGlow.intensity = t < 2.4 ? 1.5 + Math.sin(time * 8) * 1 : 0;

    // Clé : arrive, tourne, repart en fin de cycle
    const kIn = ease(seg(t, 6.2, 7.0)) - ease(seg(t, 9.6, 10.3));
    key.visible = t > 6.2 && t < 10.3;
    const away = 1 - kIn;
    key.position.set(CYL_HOME.x + away * away * 0.8, CYL_HOME.y + away * away * 0.4, FRONT + 0.03 + away * 1.4);
    const turn = t < 9.6 ? easeOutBack(seg(t, 7.0, 7.5)) : 1 - ease(seg(t, 9.4, 9.8));
    key.rotation.set(0, away * 0.6, -turn * Math.PI / 2 + away * 1.2);

    // Pênes : sortent l'un après l'autre
    bolts.forEach((b, i) => {
      const k = easeOutBack(seg(t, 7.1 + i * 0.12, 7.5 + i * 0.12)) * (1 - ease(seg(t, 10.2, 10.8)));
      b.position.x = W / 2 - 0.08 + k * 0.16;
    });
    lockFx = Math.max(0, Math.min(1, seg(t, 7.4, 7.8) - seg(t, 10.0, 10.8)));
  }

  let sparkAge = 99, waveAge = 99;
  function burst() {
    for (let i = 0; i < SP; i++) {
      spPos[i * 3] = LX; spPos[i * 3 + 1] = CYL_Y; spPos[i * 3 + 2] = FRONT + 0.1;
      const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 2.2;
      spVel[i * 3] = Math.cos(a) * sp;
      spVel[i * 3 + 1] = Math.sin(a) * sp + 1;
      spVel[i * 3 + 2] = 0.5 + Math.random() * 1.5;
    }
    sparkAge = 0;
    waveAge = 0;
  }
  function updateFx(dt) {
    if (sparkAge < 1.3) {
      sparkAge += dt;
      for (let i = 0; i < SP; i++) {
        spVel[i * 3 + 1] -= 5 * dt;
        spPos[i * 3] += spVel[i * 3] * dt;
        spPos[i * 3 + 1] += spVel[i * 3 + 1] * dt;
        spPos[i * 3 + 2] += spVel[i * 3 + 2] * dt;
      }
      spGeo.attributes.position.needsUpdate = true;
      spMat.opacity = Math.max(0, 1 - sparkAge / 1.3);
    }
    if (waveAge < 0.9) {
      waveAge += dt;
      const k = waveAge / 0.9;
      wave.scale.setScalar(0.2 + k * 2.4);
      wave.material.opacity = 0.9 * (1 - k);
    } else {
      wave.material.opacity = 0;
    }
    lockGlow.intensity = lockFx * 1.4;
    boltMat.emissiveIntensity = lockFx * 1.2;
    halo.material.opacity = 0.18 + lockFx * 0.25;
    neon.color.setRGB(0, 0.82 * (0.55 + lockFx * 0.45), 1 * (0.55 + lockFx * 0.45));
  }

  // Souris (inclinaison) et glisser pour faire tourner
  const mouse = { x: 0, y: 0 }, tilt = { x: 0, y: 0 };
  let spin = 0, spinVel = 0, dragging = false, lastX = 0;
  window.addEventListener('pointermove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    if (dragging) {
      spinVel = (e.clientX - lastX) * 0.008;
      spin += spinVel;
      lastX = e.clientX;
    }
  });
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.style.cursor = 'grabbing'; });
  window.addEventListener('pointerup', () => { dragging = false; canvas.style.cursor = ''; });

  function resize() {
    const w = container.clientWidth, h = canvas.clientHeight || container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.userData.dist = camera.aspect < 1.1 ? 7.8 : 7.4;
    camera.userData.lookX = camera.aspect < 1.1 ? 0.3 : 0.45;
    camera.updateProjectionMatrix();
    if (reduceMotion) render(0, 0);
  }

  const INTRO = 1.2;
  let prevT = 0, introDone = reduceMotion;

  function render(time, dt) {
    const t = time / 1000;
    const dist = camera.userData.dist || 7.4;
    camera.position.set(1.6 + Math.sin(t * 0.3) * 0.2, 0.6 + Math.sin(t * 0.4) * 0.08, dist);
    camera.lookAt(camera.userData.lookX || 0.45, -0.2, 0);

    if (reduceMotion) {
      pose(8.5, 0);
      setPhase(8.5);
      lockFx = 1;
      updateFx(0);
    } else {
      const intro = Math.min(t / INTRO, 1);
      root.scale.setScalar(Math.max(0.001, easeOutBack(intro)));
      if (intro >= 1) introDone = true;
      const ct = introDone ? (t - INTRO) % CYCLE : 0;
      if (introDone && prevT < LOCK_AT && ct >= LOCK_AT) burst();
      prevT = ct;
      pose(ct, t);
      if (introDone) setPhase(ct);
      updateFx(dt);
      // Petit « clignement » d'échelle au moment où le cycle recommence
      const blink = Math.sin(seg(ct, 10.5, 11) * Math.PI) * 0.06;
      if (introDone) root.scale.setScalar(1 - blink);

      if (!dragging) { spinVel *= 0.94; spin += spinVel; spin *= 0.97; }
      tilt.x += (mouse.y * 0.15 - tilt.x) * 0.05;
      tilt.y += (mouse.x * 0.35 - tilt.y) * 0.05;
      root.position.y = Math.sin(t * 1.1) * 0.05;
      dust.rotation.y = t * 0.05;
    }
    const introSpin = reduceMotion ? 0 : (1 - ease(Math.min(t / INTRO, 1))) * -Math.PI;
    root.rotation.set(0.04 + tilt.x, -0.5 + tilt.y + spin + introSpin + Math.sin(t * 0.5) * 0.06, 0);
    renderer.render(scene, camera);
  }

  new ResizeObserver(resize).observe(container);
  resize();

  if (reduceMotion) return;

  let visible = true, last = 0, elapsed = 0;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(container);
  const replay = container.querySelector('#replay3d');
  if (replay) replay.addEventListener('click', () => { elapsed = INTRO * 1000; prevT = 0; });
  renderer.setAnimationLoop(now => {
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    if (!visible) return;
    elapsed += dt * 1000;
    render(elapsed, dt);
  });
})();

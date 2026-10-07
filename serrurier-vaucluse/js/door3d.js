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

  // stage : rotations et échelle autour du centre de l'objet ; root : contenu recentré
  const stage = new THREE.Group();
  scene.add(stage);
  const root = new THREE.Group();
  stage.add(root);

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
  // Battant aux arêtes adoucies
  const leafShape = new THREE.Shape();
  const rr = 0.05;
  leafShape.moveTo(-W / 2 + rr, -H / 2);
  leafShape.lineTo(W / 2 - rr, -H / 2); leafShape.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + rr);
  leafShape.lineTo(W / 2, H / 2 - rr); leafShape.quadraticCurveTo(W / 2, H / 2, W / 2 - rr, H / 2);
  leafShape.lineTo(-W / 2 + rr, H / 2); leafShape.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - rr);
  leafShape.lineTo(-W / 2, -H / 2 + rr); leafShape.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + rr, -H / 2);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: T - 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 3, curveSegments: 8 });
  leafGeo.center();
  const leaf = add(leafGeo, doorMat, 0, 0, 0, door);
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
      -0.1 + Math.random() * 0.95, -H / 2 + 0.01, 0.1 + Math.random() * 0.35, root);
    c.rotation.y = Math.random() * Math.PI;
    chips.push(c);
  }

  // Ombre au sol
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.2),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.7)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -H / 2 - 0.09, 0.1);
  root.add(shadow);

  // Onde et étincelles au verrouillage
  const wave = add(new THREE.RingGeometry(0.2, 0.235, 64),
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
    const r = 1.9 + Math.random() * 1.3, a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * Math.PI;
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
    brokenStrike.position.set(lerp(W / 2 + 0.12, W / 2 + 0.03, s), lerp(-H / 2 + 0.05, CYL_Y, s), lerp(0.3, FZ + 0.06, s));
    brokenStrike.rotation.set(lerp(-1.5, 0, s), 0, lerp(1.2, 0, s));

    // Ancien cylindre : de travers, puis il tombe au pied de la porte et disparaît
    const fall = seg(t, 3.2, 3.9), gone = ease(seg(t, 3.9, 4.3));
    oldCyl.visible = t < 4.3;
    oldCyl.position.set(CYL_HOME.x + fall * 0.12, lerp(CYL_HOME.y, -H / 2 + 0.06, fall * fall), CYL_HOME.z + 0.07 + Math.sin(fall * Math.PI) * 0.25);
    oldCyl.rotation.set(0.35 + fall * 2.5, 0.2, 0.5 + fall * 4);
    oldCyl.scale.setScalar(Math.max(0.001, 1 - gone));

    // Cylindre neuf qui arrive
    const inn = easeOutBack(seg(t, 3.8, 4.6));
    newCyl.visible = t >= 3.8;
    newCyl.position.set(CYL_HOME.x, CYL_HOME.y, CYL_HOME.z + (1 - inn) * 0.7);
    newCyl.rotation.set(0, 0, (1 - inn) * 3);

    // Tournevis : vis du haut puis vis du bas
    const dIn = ease(seg(t, 4.4, 4.8)), dOut = ease(seg(t, 5.8, 6.2));
    driver.visible = t > 4.4 && t < 6.2;
    const target = t < 5.2 ? SCREWS[0] : SCREWS[1];
    const hop = t > 5.1 && t < 5.3 ? Math.sin(seg(t, 5.1, 5.3) * Math.PI) * 0.15 : 0;
    const dAway = 1 - dIn + dOut;
    driver.position.set(LX + dAway * 0.4, target + dAway * 0.3, FRONT + 0.03 + dAway * 0.6 + hop);
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
    key.position.set(CYL_HOME.x + away * away * 0.35, CYL_HOME.y + away * away * 0.25, FRONT + 0.03 + away * 0.7);
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
      const a = Math.random() * Math.PI * 2, sp = 0.35 + Math.random() * 0.8;
      spVel[i * 3] = Math.cos(a) * sp;
      spVel[i * 3 + 1] = Math.sin(a) * sp + 0.4;
      spVel[i * 3 + 2] = 0.2 + Math.random() * 0.5;
    }
    sparkAge = 0;
    waveAge = 0;
  }
  function updateFx(dt) {
    if (sparkAge < 1.3) {
      sparkAge += dt;
      for (let i = 0; i < SP; i++) {
        spVel[i * 3 + 1] -= 2 * dt;
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
      wave.scale.setScalar(0.4 + k * 2.2);
      wave.material.opacity = 0.9 * (1 - k);
    } else {
      wave.material.opacity = 0;
    }
    lockGlow.intensity = lockFx * 1.4;
    boltMat.emissiveIntensity = lockFx * 1.2;
    halo.material.opacity = 0.18 + lockFx * 0.25;
    neon.color.setRGB(0, 0.82 * (0.55 + lockFx * 0.45), 1 * (0.55 + lockFx * 0.45));
  }

  // Souris (inclinaison) et glisser pour faire tourner (amplitude limitée pour rester dans le cadre)
  const MAX_YAW = 0.3;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mouse = { x: 0, y: 0 }, tilt = { x: 0, y: 0 };
  let spin = 0, spinVel = 0, dragging = false, lastX = 0;
  window.addEventListener('pointermove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    if (dragging) {
      spinVel = (e.clientX - lastX) * 0.006;
      spin = clamp(spin + spinVel, -MAX_YAW, MAX_YAW);
      lastX = e.clientX;
    }
  });
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.style.cursor = 'grabbing'; });
  window.addEventListener('pointerup', () => { dragging = false; canvas.style.cursor = ''; });

  // --- Cadrage automatique ---
  // On mesure la porte au repos (fermée, verrouillée), on la recentre, puis on cherche la distance
  // de caméra qui la fait tenir entre le bandeau de prix (en haut) et les boutons (en bas),
  // pour toutes les orientations autorisées.
  const BASE_YAW = -0.42, BASE_PITCH = 0.04;
  const CAM_DIR = new THREE.Vector3(0.12, 0.14, 1).normalize();
  const corners = [];
  (function measure() {
    pose(8.6, 0);
    stage.updateMatrixWorld(true);
    const box = new THREE.Box3();
    [frame, leaf, key].forEach(o => box.expandByObject(o));
    bolts.forEach(o => box.expandByObject(o));
    const c = box.getCenter(new THREE.Vector3());
    root.position.copy(c).negate();
    box.translate(root.position);
    for (let i = 0; i < 8; i++) {
      corners.push(new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
    }
  })();
  halo.position.set(0, 0, -1.6);

  const badge = container.querySelector('.price-badge');
  const ui = container.querySelector('.hero-3d-ui');
  const v3 = new THREE.Vector3(), m4 = new THREE.Matrix4(), e3 = new THREE.Euler();
  function fit(w, h) {
    const top = (badge ? badge.offsetHeight : 0) + 16;
    const bottom = (ui ? ui.offsetHeight : 0) + 16;
    const band = Math.max(h - top - bottom, h * 0.5);
    camera.clearViewOffset();
    let d = 8;
    for (let it = 0; it < 6; it++) {
      camera.position.copy(CAM_DIR).multiplyScalar(d);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      let mx = 0, my = 0;
      [-MAX_YAW, -MAX_YAW / 2, 0, MAX_YAW / 2, MAX_YAW].forEach(r => {
        m4.makeRotationFromEuler(e3.set(BASE_PITCH, BASE_YAW + r, 0));
        corners.forEach(p => {
          v3.copy(p).applyMatrix4(m4).project(camera);
          mx = Math.max(mx, Math.abs(v3.x));
          my = Math.max(my, Math.abs(v3.y));
        });
      });
      d *= Math.max(mx / 0.92, my / (0.95 * band / h));
    }
    camera.userData.dist = d;
    // Décale l'image pour centrer la porte dans l'espace libre
    camera.setViewOffset(w, h, 0, (bottom - top) / 2, w, h);
    camera.updateProjectionMatrix();
  }

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fit(w, h);
    if (reduceMotion) render(0, 0);
  }

  const INTRO = 1.2;
  let prevT = 0, introDone = reduceMotion;

  function render(time, dt) {
    const t = time / 1000;
    const d = camera.userData.dist || 8;
    camera.position.copy(CAM_DIR).multiplyScalar(d);
    camera.position.x += Math.sin(t * 0.3) * 0.08;
    camera.position.y += Math.sin(t * 0.4) * 0.05;
    camera.lookAt(0, 0, 0);

    let scale = 1, introSpin = 0;
    if (reduceMotion) {
      pose(8.5, 0);
      setPhase(8.5);
      lockFx = 1;
      updateFx(0);
    } else {
      const intro = Math.min(t / INTRO, 1);
      scale = Math.max(0.001, ease(intro));
      introSpin = (1 - ease(intro)) * -0.6;
      if (intro >= 1) introDone = true;
      const ct = introDone ? (t - INTRO) % CYCLE : 0;
      if (introDone && prevT < LOCK_AT && ct >= LOCK_AT) burst();
      prevT = ct;
      pose(ct, t);
      if (introDone) {
        setPhase(ct);
        // Petit « clignement » d'échelle au moment où le cycle recommence
        scale = 1 - Math.sin(seg(ct, 10.5, 11) * Math.PI) * 0.05;
      }
      updateFx(dt);

      if (!dragging) { spinVel *= 0.94; spin = clamp(spin + spinVel, -MAX_YAW, MAX_YAW); spin *= 0.97; }
      tilt.x += (mouse.y * 0.05 - tilt.x) * 0.05;
      tilt.y += (mouse.x * 0.15 - tilt.y) * 0.05;
      dust.rotation.y = t * 0.05;
    }
    const yaw = clamp(tilt.y + spin + Math.sin(t * 0.5) * 0.05, -MAX_YAW, MAX_YAW);
    stage.scale.setScalar(scale);
    stage.position.y = reduceMotion ? 0 : Math.sin(t * 1.1) * 0.03;
    stage.rotation.set(BASE_PITCH + tilt.x, BASE_YAW + yaw + introSpin, 0);
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

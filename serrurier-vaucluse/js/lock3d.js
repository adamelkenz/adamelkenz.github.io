// Scène 3D du hero : cadenas « Nuit polaire » + clé qui le déverrouille en boucle.
(function () {
  const container = document.getElementById('lock3d');
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
  canvas.setAttribute('aria-label', 'Animation 3D : une clé ouvre un cadenas');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  // --- Environnement pour les reflets métalliques (mini studio généré) ---
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x070b18, side: THREE.BackSide })
  ));
  function panel(color, strength, w, h, pos) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide })
    );
    m.position.set(pos[0], pos[1], pos[2]);
    m.lookAt(0, 0, 0);
    env.add(m);
  }
  panel(0xffffff, 4, 8, 2.5, [0, 8, 4]);
  panel(0xffd76a, 3.5, 3, 8, [-8, 1, 2]);
  panel(0xfff6cc, 2.5, 3, 8, [8, 0, 3]);
  panel(0xfff1c4, 3, 6, 2.5, [3, 3, 7]); // reflet chaud pour le laiton
  panel(0xffffff, 1.5, 6, 1.5, [0, -6, 6]);
  scene.environment = pmrem.fromScene(env, 0.04).texture;

  // Texture de dégradé radial (halo, ombre)
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
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const keyLight = new THREE.DirectionalLight(0xd6f4ff, 1.5);
  keyLight.position.set(3, 5, 6);
  scene.add(keyLight);
  const rim = new THREE.PointLight(0x8f7bff, 3, 12);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
  const unlockGlow = new THREE.PointLight(0x00d1ff, 0, 6);
  unlockGlow.position.set(0, 0.4, 1.8);
  scene.add(unlockGlow);

  // Halo derrière le cadenas et ombre au sol
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(0,209,255,1)', 'rgba(0,209,255,0)'),
    transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  halo.scale.set(6, 6, 1);
  halo.position.set(0, 0.4, -1.5);
  scene.add(halo);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.45;
  scene.add(shadow);

  // --- Matériaux ---
  // Corps en laiton jaune métallique
  const brass = new THREE.MeshPhysicalMaterial({ color: 0xf2c230, metalness: 1, roughness: 0.26, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x121a33, metalness: 0.6, roughness: 0.45 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd6f4ff, metalness: 1, roughness: 0.1 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x8f7bff, metalness: 0.8, roughness: 0.2, emissive: 0x8f7bff, emissiveIntensity: 0.25 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x070b18, metalness: 0.3, roughness: 0.6 });

  const root = new THREE.Group();
  scene.add(root);

  function roundedRect(w, h, r) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }

  // Corps du cadenas
  const W = 2, H = 1.7;
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, 0.28), {
    depth: 0.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 6, curveSegments: 16
  });
  bodyGeo.center();
  root.add(new THREE.Mesh(bodyGeo, brass));
  const FRONT = 0.35;

  // Plaque frontale + rivets
  const plateGeo = new THREE.ExtrudeGeometry(roundedRect(1.25, 1.05, 0.16), {
    depth: 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 12
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(0, -0.08, FRONT - 0.01);
  root.add(plate);
  const rivetGeo = new THREE.SphereGeometry(0.045, 16, 12);
  [[-0.5, 0.33], [0.5, 0.33], [-0.5, -0.49], [0.5, -0.49]].forEach(([x, y]) => {
    const r = new THREE.Mesh(rivetGeo, chrome);
    r.position.set(x, y, FRONT + 0.04);
    r.scale.z = 0.5;
    root.add(r);
  });

  // Serrure (entrée de clé)
  const KH_Y = -0.12;
  const keyhole = new THREE.Group();
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32), dark);
  hole.rotation.x = Math.PI / 2;
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.04), dark);
  slot.position.y = -0.15;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 16, 48), chrome);
  ring.position.y = -0.06;
  keyhole.add(hole, slot, ring);
  keyhole.position.set(0, KH_Y, FRONT + 0.04);
  root.add(keyhole);

  // Anse : pivote autour de sa branche gauche
  const SR = 0.62, LEG = 0.8;
  const shacklePivot = new THREE.Group();
  shacklePivot.position.set(-SR, 0, 0);
  const shackle = new THREE.Group();
  shackle.position.x = SR;
  const arc = new THREE.Mesh(new THREE.TorusGeometry(SR, 0.13, 24, 64, Math.PI), chrome);
  arc.position.y = H / 2 + 0.45;
  const legGeo = new THREE.CylinderGeometry(0.13, 0.13, LEG, 24);
  const legL = new THREE.Mesh(legGeo, chrome);
  const legR = new THREE.Mesh(legGeo, chrome);
  legL.position.set(-SR, H / 2 + 0.45 - LEG / 2, 0);
  legR.position.set(SR, H / 2 + 0.45 - LEG / 2, 0);
  shackle.add(arc, legL, legR);
  shacklePivot.add(shackle);
  root.add(shacklePivot);

  // Clé : anneau + tige + dents, orientée vers -z
  const key = new THREE.Group();
  const SHAFT = 0.95;
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 20, 48), keyMat);
  bow.rotation.y = Math.PI / 2;
  bow.position.z = SHAFT + 0.26;
  const bowCap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 24), keyMat);
  bowCap.rotation.x = Math.PI / 2;
  bowCap.position.z = SHAFT + 0.02;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, SHAFT, 20), keyMat);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = SHAFT / 2;
  key.add(bow, bowCap, shaft);
  [[0.12, 0.14], [0.26, 0.09], [0.4, 0.16], [0.52, 0.1]].forEach(([z, h]) => {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.09), keyMat);
    t.position.set(0, -0.05 - h / 2, z);
    key.add(t);
  });
  root.add(key);

  // Onde de choc au déverrouillage
  const wave = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 0.95, 64),
    new THREE.MeshBasicMaterial({ color: 0x00d1ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  wave.position.set(0, KH_Y, FRONT + 0.06);
  root.add(wave);

  // Étincelles au déverrouillage
  const SP = 70;
  const spPos = new Float32Array(SP * 3);
  const spVel = new Float32Array(SP * 3);
  const spGeo = new THREE.BufferGeometry();
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  const spMat = new THREE.PointsMaterial({
    color: 0x00d1ff, size: 0.07, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
  });
  root.add(new THREE.Points(spGeo, spMat));

  // Poussière ambiante
  const N = 160;
  const pts = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 2 + Math.random() * 2.5, a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * Math.PI;
    pts[i * 3] = r * Math.cos(a) * Math.cos(b);
    pts[i * 3 + 1] = r * Math.sin(b);
    pts[i * 3 + 2] = r * Math.sin(a) * Math.cos(b) - 1;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const dust = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x00d1ff, size: 0.035, transparent: true, opacity: 0.6, depthWrite: false
  }));
  scene.add(dust);

  // Indicateur d'état sous la scène
  const statusEl = container.querySelector('.status');
  const statusText = container.querySelector('.status-text');
  let lastPhase = '';
  function setPhase(ct) {
    const [p, text] = ct < 1.4 ? ['broken', 'Porte verrouillée'] :
      ct < 2.2 ? ['repairing', 'Ouverture en cours…'] :
      ct < 5 ? ['fixed', 'Porte ouverte ✓ · sans dégât'] : ['fixed', 'Serrure refermée ✓'];
    if (!statusEl || text === lastPhase) return;
    lastPhase = text;
    statusEl.dataset.phase = p;
    statusText.textContent = text;
  }

  // --- Animation ---
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = t => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
  const seg = (t, a, b) => Math.min(Math.max((t - a) / (b - a), 0), 1);

  const KEY_OUT = 1.8, KEY_IN = FRONT - 0.6;
  const CYCLE = 7.5, UNLOCK_AT = 2.2;
  let fx = 0; // intensité des effets de déverrouillage (0 → 1)

  function pose(t) {
    // 0–1.4 entrée en arc, 1.4–2.2 rotation, 2.2–2.8 ouverture, 5–5.6 fermeture, 5.6–6.2 rotation retour, 6.2–7.5 sortie
    const insert = ease(seg(t, 0, 1.4)) - ease(seg(t, 6.2, 7.5));
    const away = 1 - insert;
    const jiggle = t > 1.1 && t < 1.45 ? Math.sin((t - 1.1) * 60) * 0.025 * (1.45 - t) / 0.35 : 0;
    const turn = (t < 5.6 ? easeOutBack(seg(t, 1.4, 2.2)) : 1 - ease(seg(t, 5.6, 6.2)));
    const open = t < 5 ? easeOutBack(seg(t, UNLOCK_AT, 2.8)) : 1 - ease(seg(t, 5, 5.6));

    key.position.set(away * away * 1.1 + jiggle, KH_Y + away * away * 0.5, KEY_OUT + (KEY_IN - KEY_OUT) * insert);
    key.rotation.set(0, away * 0.6, -turn * Math.PI / 2 + away * 1.2);
    shacklePivot.position.y = open * 0.45;
    shacklePivot.rotation.y = open * -0.7;
    fx = Math.max(0, Math.min(open, 1));
  }

  function burst() {
    for (let i = 0; i < SP; i++) {
      spPos[i * 3] = 0; spPos[i * 3 + 1] = KH_Y; spPos[i * 3 + 2] = FRONT + 0.1;
      const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 2.2;
      spVel[i * 3] = Math.cos(a) * sp;
      spVel[i * 3 + 1] = Math.sin(a) * sp + 1;
      spVel[i * 3 + 2] = 0.5 + Math.random() * 1.5;
    }
    sparkAge = 0;
    waveAge = 0;
  }
  let sparkAge = 99, waveAge = 99;

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
      wave.scale.setScalar(0.3 + k * 2.6);
      wave.material.opacity = 0.9 * (1 - k);
    } else {
      wave.material.opacity = 0;
    }
    unlockGlow.intensity = fx * 3;
    halo.material.opacity = 0.22 + fx * 0.3;
  }

  // Souris (inclinaison) et glisser pour faire tourner
  const mouse = { x: 0, y: 0 }, tilt = { x: 0, y: 0 };
  let spin = 0, spinVel = 0, dragging = false, lastX = 0;
  window.addEventListener('pointermove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    if (dragging) {
      spinVel = (e.clientX - lastX) * 0.01;
      spin += spinVel;
      lastX = e.clientX;
    }
  });
  canvas.addEventListener('pointerdown', e => {
    dragging = true;
    lastX = e.clientX;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('pointerup', () => {
    dragging = false;
    canvas.style.cursor = '';
  });

  function resize() {
    const w = container.clientWidth, h = canvas.clientHeight || container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.userData.dist = camera.aspect < 1.1 ? 9.5 : 7.4;
    camera.updateProjectionMatrix();
    if (reduceMotion) render(0, 0);
  }

  let prevT = 0, introDone = reduceMotion;
  const INTRO = 1.4;

  function render(time, dt) {
    const t = time / 1000;
    const dist = camera.userData.dist || 7.4;
    camera.position.set(1.6 + Math.sin(t * 0.3) * 0.25, 0.9 + Math.sin(t * 0.4) * 0.1, dist);
    camera.lookAt(0, 0.35, 0);

    if (reduceMotion) {
      pose(3.5);
      setPhase(3.5);
      fx = 1;
      updateFx(0);
    } else {
      // Intro : le cadenas arrive en tournant
      const intro = Math.min(t / INTRO, 1);
      root.scale.setScalar(Math.max(0.001, easeOutBack(intro)));
      if (intro >= 1) introDone = true;

      const ct = introDone ? (t - INTRO) % CYCLE : 0;
      if (introDone && prevT < UNLOCK_AT && ct >= UNLOCK_AT) burst();
      prevT = ct;
      pose(ct);
      if (introDone) setPhase(ct);
      updateFx(dt);

      if (!dragging) { spinVel *= 0.94; spin += spinVel; spin *= 0.97; }
      tilt.x += (mouse.y * 0.25 - tilt.x) * 0.05;
      tilt.y += (mouse.x * 0.45 - tilt.y) * 0.05;
      root.position.y = Math.sin(t * 1.2) * 0.08;
      shadow.material.opacity = 0.8 - root.position.y * 2;
      shadow.scale.setScalar(1 - root.position.y * 0.6);
      dust.rotation.y = t * 0.05;
    }
    const introSpin = reduceMotion ? 0 : (1 - ease(Math.min(t / INTRO, 1))) * -Math.PI * 1.5;
    root.rotation.set(0.08 + tilt.x, -0.55 + tilt.y + spin + introSpin + Math.sin(t * 0.5) * 0.08, 0);
    renderer.render(scene, camera);
  }

  new ResizeObserver(resize).observe(container);
  resize();

  if (reduceMotion) return;

  // Ne calcule l'animation que quand le hero est visible
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

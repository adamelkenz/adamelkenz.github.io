/* Barbershop49 — le fauteuil de barbier en 3D (three.js) et sa mise en lumière.
   creerScene(canvas, { variante }) renvoie de quoi régler la lumière (0 à 1)
   et l'angle de vue ; la page décide quand et comment animer. */
import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export const VARIANTES = {
  classique: { cuir: 0x6e101d, metal: 0xeef0f3, metalRugo: .12, nom: 'Bordeaux & chrome' },
  laiton:    { cuir: 0x141113, metal: 0xd4a85a, metalRugo: .28, nom: 'Noir & laiton' },
  creme:     { cuir: 0xe6dac4, metal: 0xeef0f3, metalRugo: .12, nom: 'Crème & chrome' },
};

// capitonnage : coussins bombés entre des boutons posés en losange (carte de relief calculée)
function textureCapitons(n) {
  const T = 256, c = document.createElement('canvas');
  c.width = c.height = T;
  const g = c.getContext('2d'), img = g.createImageData(T, T), d = img.data;
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const u = x / T * n, v = y / T * n * 1.25;
    const a = (u + v) / 2, b = (u - v) / 2;              // repère tourné de 45°
    const fa = a - Math.floor(a), fb = b - Math.floor(b);
    let h = Math.pow(Math.sin(Math.PI * fa) * Math.sin(Math.PI * fb), .45);
    const da = Math.min(fa, 1 - fa), db = Math.min(fb, 1 - fb);
    if (Math.hypot(da, db) < .07) h = .05;               // le bouton
    const k = Math.round(70 + 185 * h), i = (y * T + x) * 4;
    d[i] = d[i + 1] = d[i + 2] = k; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// environnement des reflets : pièce noire, grand diffuseur au plafond, bandes de lumière, reflet néon
function environnement(renderer) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x060505);
  const panneau = (w, h, pos, rot, couleur, force) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(couleur).multiplyScalar(force), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); s.add(m);
  };
  panneau(3, 1.4, [0, 3.5, .5], [Math.PI / 2, 0, 0], 0xfff1dc, 4);
  panneau(.5, 3, [-3, 1.6, 1.5], [0, Math.PI / 2, 0], 0xffffff, 2.2);
  panneau(.35, 2.6, [3, 1.4, -.5], [0, -Math.PI / 2, 0], 0xffffff, 1.4);
  panneau(2.4, .25, [0, 3.2, -3.2], [0, 0, 0], 0xff4458, 1.1);
  panneau(2, .25, [0, .3, 3.5], [0, Math.PI, 0], 0x7fd8ff, .8);
  panneau(8, 8, [0, -.5, 0], [-Math.PI / 2, 0, 0], 0xb9b2a4, .35);
  panneau(6, 2.5, [0, 1.5, 4], [0, Math.PI, 0], 0xfff1dc, .5);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(s, 0).texture;
  pmrem.dispose();
  return tex;
}

function textureDamier() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    g.fillStyle = (i + j) % 2 ? '#111010' : '#e4ddcd';
    g.fillRect(i * 64, j * 64, 64, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(9, 9);
  t.anisotropy = 8;
  return t;
}

function tube(points, rayon, mat) {
  const courbe = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(courbe, 24, rayon, 12, false), mat);
  m.castShadow = true;
  return m;
}

function construireFauteuil(v) {
  const f = new THREE.Group();
  const capitons = textureCapitons(3);
  const cuirBase = { color: v.cuir, roughness: .5, metalness: 0, clearcoat: .35, clearcoatRoughness: .45, envMapIntensity: .7 };
  const cuir = new THREE.MeshPhysicalMaterial(cuirBase);
  const cuirCapitonne = new THREE.MeshPhysicalMaterial({ ...cuirBase, map: capitons, bumpMap: capitons, bumpScale: 3 });
  const metal = new THREE.MeshStandardMaterial({ color: v.metal, roughness: v.metalRugo, metalness: 1, envMapIntensity: 1.5 });
  const caoutchouc = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: .8 });
  const ajoute = (m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; f.add(m); return m; };

  // socle en dôme, colonne hydraulique, jupe et pompe
  const profil = [[0, 0], [.37, 0], [.375, .012], [.35, .03], [.24, .06], [.1, .08], [.055, .085], [0, .085]].map(p => new THREE.Vector2(...p));
  ajoute(new THREE.Mesh(new THREE.LatheGeometry(profil, 72), metal));
  ajoute(new THREE.Mesh(new THREE.CylinderGeometry(.042, .046, .3, 40), metal), 0, .23, 0);
  const jupe = [[.05, 0], [.07, .02], [.15, .09], [.17, .11], [.17, .12], [0, .12]].map(p => new THREE.Vector2(...p));
  ajoute(new THREE.Mesh(new THREE.LatheGeometry(jupe, 64), metal), 0, .33, 0);
  f.add(tube([[.05, .1, -.02], [.2, .08, -.12], [.33, .05, -.2]], .011, metal));
  ajoute(new THREE.Mesh(new RoundedBoxGeometry(.11, .025, .06, 2, .01), caoutchouc), .36, .045, -.22).rotation.y = -.55;

  // assise
  ajoute(new THREE.Mesh(new RoundedBoxGeometry(.5, .02, .46, 2, .008), metal), 0, .465, .02);
  ajoute(new THREE.Mesh(new RoundedBoxGeometry(.58, .15, .54, 6, .065), cuir), 0, .55, .02);
  ajoute(new THREE.Mesh(new RoundedBoxGeometry(.53, .05, .48, 6, .024), cuir), 0, .635, .035);

  // dossier capitonné, légèrement incliné
  const dossier = new THREE.Group();
  dossier.position.set(0, .64, -.24);
  dossier.rotation.x = -.17;
  f.add(dossier);
  const ajD = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; dossier.add(m); return m; };
  ajD(new THREE.Mesh(new RoundedBoxGeometry(.58, .7, .13, 5, .06), cuir), 0, .35, 0);
  ajD(new THREE.Mesh(new RoundedBoxGeometry(.5, .62, .03, 4, .014), cuirCapitonne), 0, .35, .065);
  // appui-tête sur sa tige
  ajD(new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .16, 20), metal), 0, .79, -.01);
  ajD(new THREE.Mesh(new RoundedBoxGeometry(.32, .12, .11, 5, .05), cuir), 0, .88, .01);

  // accoudoirs : manchette en cuir sur arceau chromé
  for (const s of [-1, 1]) {
    ajoute(new THREE.Mesh(new RoundedBoxGeometry(.1, .065, .46, 4, .03), cuir), s * .345, .8, .04);
    f.add(tube([[s * .345, .77, .23], [s * .35, .7, .27], [s * .33, .6, .25], [s * .3, .53, .2]], .014, metal));
    f.add(tube([[s * .345, .77, -.15], [s * .33, .66, -.2], [s * .3, .56, -.2]], .014, metal));
  }

  // repose-pieds : deux tiges et une plaque striée
  for (const s of [-1, 1]) f.add(tube([[s * .16, .5, .26], [s * .17, .34, .36], [s * .18, .17, .46]], .012, metal));
  ajoute(new THREE.Mesh(new RoundedBoxGeometry(.46, .024, .17, 2, .008), metal), 0, .16, .5);
  for (let i = -5; i <= 5; i++) ajoute(new THREE.Mesh(new THREE.BoxGeometry(.008, .006, .15), caoutchouc), i * .038, .175, .5);

  return f;
}

export function creerScene(canvas, opts = {}) {
  const v = VARIANTES[opts.variante] || VARIANTES.classique;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.capture });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0e0d0c, 3.4, 6);
  scene.environment = environnement(renderer);

  const fauteuil = construireFauteuil(v);
  scene.add(fauteuil);

  const sol = new THREE.Mesh(new THREE.CircleGeometry(4, 64),
    new THREE.MeshStandardMaterial({ map: textureDamier(), color: 0xb9b2a4, roughness: .4, metalness: 0, envMapIntensity: .12 }));
  sol.rotation.x = -Math.PI / 2;
  sol.receiveShadow = true;
  scene.add(sol);

  // le spot au-dessus du fauteuil et une lumière d'ambiance (le reflet néon vient de l'environnement)
  const spot = new THREE.SpotLight(0xfff1dc, 0, 0, .36, .7, 1.2);
  spot.position.set(.3, 3.2, .9);
  spot.target.position.set(0, .55, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -.0004;
  spot.shadow.radius = 6;
  scene.add(spot, spot.target);
  // le faisceau visible : un cône translucide, plus dense près de la lampe
  const degrade = document.createElement('canvas');
  degrade.width = 4; degrade.height = 128;
  const gd = degrade.getContext('2d'), lg = gd.createLinearGradient(0, 0, 0, 128);
  lg.addColorStop(0, '#fff'); lg.addColorStop(.6, '#555'); lg.addColorStop(1, '#000');
  gd.fillStyle = lg; gd.fillRect(0, 0, 4, 128);
  const longueur = spot.position.distanceTo(new THREE.Vector3(.05, 0, .1));
  const faisceau = new THREE.Mesh(
    new THREE.ConeGeometry(Math.tan(.36) * longueur * .92, longueur, 48, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe2bc, alphaMap: new THREE.CanvasTexture(degrade), transparent: true,
      opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  faisceau.position.copy(spot.position).lerp(new THREE.Vector3(.05, 0, .1), .5);
  faisceau.lookAt(spot.position);
  faisceau.rotateX(Math.PI / 2);
  scene.add(faisceau);

  const ambiance = new THREE.HemisphereLight(0x8a7a6a, 0x0a0808, 0);
  scene.add(ambiance);

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 30);
  const cible = new THREE.Vector3(0, .66, 0);
  let angle = .6, recul = 4.1, hauteur = 1.5;

  function place() {
    camera.position.set(Math.sin(angle) * recul, hauteur, Math.cos(angle) * recul);
    camera.lookAt(cible);
  }
  function taille() {
    const w = canvas.clientWidth || 400, h = canvas.clientHeight || 500;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  // t : 0 = noir, 1 = pleinement éclairé
  function lumiere(t) {
    spot.intensity = 30 * t;
    faisceau.material.opacity = .07 * t;
    ambiance.intensity = .02 + .12 * t;
    renderer.toneMappingExposure = .7 + .2 * t;
  }
  taille();
  place();
  lumiere(opts.lumiere ?? 1);

  return {
    renderer, camera,
    rendre() { renderer.render(scene, camera); },
    taille,
    lumiere,
    vue(a, r, h) { angle = a; if (r) recul = r; if (h) hauteur = h; place(); },
    detruire() { renderer.dispose(); },
  };
}

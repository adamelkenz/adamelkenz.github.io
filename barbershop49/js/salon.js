/* Barbershop49 — section « Le salon » : mise en lumière du fauteuil 3D.
   Quand la section arrive à l'écran, le spot s'allume (deux petits à-coups puis
   une montée douce), la caméra s'approche, et le texte apparaît avec la lumière.
   Tout est terminé en 3,5 s ; ensuite la lumière respire et le fauteuil suit
   la souris ou le défilement de quelques degrés. */
const section = document.getElementById('salon');
const figure = section && section.querySelector('.fauteuil-3d');
const canvas = figure && figure.querySelector('canvas');
const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DUREE = 3.5;
const lisse = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const sortie = t => 1 - Math.pow(1 - t, 3);
const borne = (x, a, b) => Math.max(a, Math.min(b, x));

// intensité du spot selon le temps écoulé (s)
function intensite(t) {
  if (t < .4) return .03;
  if (t < .48) return .38;
  if (t < .6) return .07;
  if (t < .67) return .55;
  if (t < .76) return .16;
  if (t < 2) return .16 + .84 * sortie((t - .76) / 1.24);
  return 1;
}

let scene = null, debut = 0, vu = false, visible = false, boucle = 0, dernier = 0, pret = false, envie = false;
let decalage = 0, decalageVise = 0;

function image(maintenant) {
  boucle = 0;
  if (!scene || !visible || document.hidden) return;
  const t = vu ? (maintenant - debut) / 1000 : 0; // avant la séquence : pièce dans le noir
  if ((t > DUREE || !vu) && maintenant - dernier < 33) { boucle = requestAnimationFrame(image); return; } // 30 i/s au repos
  dernier = maintenant;
  const k = lisse(borne((t - .4) / 2.2, 0, 1));
  decalage += (decalageVise - decalage) * .08;
  scene.vue(.95 - .35 * k + decalage, 4.7 - .6 * k);
  scene.lumiere(t < DUREE ? intensite(t) : 1 - .05 * (.5 - .5 * Math.cos((t - DUREE) * Math.PI / 3)));
  scene.rendre();
  boucle = requestAnimationFrame(image);
}
function relance() { if (!boucle && visible) boucle = requestAnimationFrame(image); }

function allume() {
  if (vu || !pret) return;
  vu = true;
  debut = performance.now();
  section.classList.add('allume');
  relance();
}

async function prepare() {
  try {
    const { creerScene } = await import('./fauteuil3d.js');
    scene = creerScene(canvas, { variante: 'classique', lumiere: calme ? 1 : .03 });
    scene.vue(calme ? .6 : .95, calme ? 4.1 : 4.7);
    scene.rendre();
    figure.classList.add('pret');
    window.addEventListener('resize', () => { scene.taille(); relance(); });
  } catch (e) {
    figure.classList.add('sans-3d'); // l'image fixe reste affichée
  }
  pret = true;
  if (envie) allume();
}

if (section && figure && canvas) {
  if (calme) {
    section.classList.add('allume');
    vu = pret = true;
    debut = performance.now() - DUREE * 1000;
  }
  // on charge la 3D un peu avant l'arrivée de la section
  const charge = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { charge.disconnect(); prepare().then(() => { if (visible) relance(); }); }
  }, { rootMargin: '600px 0px' });
  charge.observe(section);
  // la séquence démarre quand le fauteuil est bien à l'écran
  new IntersectionObserver(es => {
    visible = es[0].isIntersecting;
    if (visible && es[0].intersectionRatio >= .35) { envie = true; allume(); }
    if (visible) relance();
  }, { threshold: [0, .35, .6] }).observe(figure);
  document.addEventListener('visibilitychange', relance);

  // le fauteuil tourne de quelques degrés avec la souris, ou avec le défilement au doigt
  if (!calme) {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      section.addEventListener('pointermove', e => {
        const r = figure.getBoundingClientRect();
        decalageVise = borne(((e.clientX - (r.left + r.width / 2)) / r.width) * .35, -.17, .17);
      });
      section.addEventListener('pointerleave', () => { decalageVise = 0; });
    } else {
      window.addEventListener('scroll', () => {
        const r = figure.getBoundingClientRect();
        decalageVise = borne(((r.top + r.height / 2) - innerHeight / 2) / innerHeight * -.34, -.17, .17);
      }, { passive: true });
    }
  }
}

/**
 * Vérifications SEO sur TOUTES les pages du sitemap : title, meta description, H1 unique,
 * canonical, données structurées, outil au-dessus des pubs, maillage interne, affichage mobile.
 */
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import site from '../src/config/site.json' with { type: 'json' };

// Outils déclarés dans src/content/outils : slug FR → nombre d'outils similaires publiés attendus
const dossier = new URL('../src/content/outils/', import.meta.url);
const outils = readdirSync(dossier).map((f) => ({ id: f.replace('.json', ''), ...JSON.parse(readFileSync(new URL(f, dossier), 'utf8')) }));
const publies = new Set(outils.filter((o) => !o.brouillon).map((o) => o.id));
const similairesAttendus = new Map(
  outils.map((o) => ['/' + o.langues.fr.slug, o.similaires.filter((s: string) => publies.has(s)).length]),
);

test('sitemap, robots.txt et pages', async ({ page, request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain(`Sitemap: ${site.url}/sitemap.xml`);

  const sitemap = await (await request.get('/sitemap.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(urls.length).toBeGreaterThan(5);

  const titres = new Set<string>();
  const descriptions = new Set<string>();
  const pagesOutils: string[] = [];

  for (const url of urls) {
    const chemin = url.replace(site.url, '') || '/';
    const rep = await page.goto(chemin);
    expect(rep?.status(), chemin).toBe(200);

    const title = await page.title();
    expect(title.length, `title de ${chemin}`).toBeLessThanOrEqual(60);
    expect(titres.has(title), `title en double : ${title}`).toBe(false);
    titres.add(title);

    const desc = await page.locator('meta[name=description]').getAttribute('content');
    expect(desc!.length, `description de ${chemin}`).toBeLessThanOrEqual(160);
    expect(descriptions.has(desc!), `description en double : ${desc}`).toBe(false);
    descriptions.add(desc!);

    await expect(page.locator('h1'), chemin).toHaveCount(1);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', url);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);

    if (await page.locator('.outil').count()) pagesOutils.push(chemin);
  }

  for (const chemin of pagesOutils) {
    await page.goto(chemin);
    // Données structurées WebApplication + FAQPage
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    const types = ld['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toEqual(expect.arrayContaining(['WebApplication', 'FAQPage', 'BreadcrumbList']));
    const faq = ld['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage');
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(4);

    // L'outil est AVANT toute publicité
    const ordre = await page.evaluate(() => {
      const outil = document.querySelector('.outil')!;
      const pub = document.querySelector('.pub');
      return !pub || !!(outil.compareDocumentPosition(pub) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(ordre, `pub au-dessus de l'outil sur ${chemin}`).toBe(true);

    // Maillage interne : les outils similaires publiés du JSON (4 à 6 quand tout est publié)
    const similaires = await page.locator('.contenu ~ section .carte-outil').count();
    expect(similaires, `outils similaires sur ${chemin}`).toBe(similairesAttendus.get(chemin));
    if (publies.size === outils.length) expect(similaires).toBeGreaterThanOrEqual(4);
    expect(similaires).toBeLessThanOrEqual(6);
  }
});

test('mobile : outil visible sans défiler et aucun débordement horizontal', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const chemin of ['/', '/convertir-webp-en-png', '/outils-image', '/politique-de-confidentialite']) {
    await page.goto(chemin);
    const largeur = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(largeur, `débordement sur ${chemin}`).toBeLessThanOrEqual(360);
  }
  await page.goto('/convertir-webp-en-png');
  const zone = await page.locator('.depot-zone').boundingBox();
  expect(zone!.y, 'la zone de dépôt doit commencer au-dessus de la ligne de flottaison').toBeLessThan(740 - 100);
  await ctx.close();
});

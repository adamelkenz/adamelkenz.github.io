import { test, expect } from '@playwright/test';
import { fixture, telecharger, dimensionsPng, dimensionsJpeg, pixel } from './aides';

test.describe('WebP → PNG', () => {
  test('convertit 2 images, garde dimensions et transparence, propose le ZIP', async ({ page }) => {
    await page.goto('/convertir-webp-en-png');
    await page.locator('input[type=file]').setInputFiles([fixture('photo.webp'), fixture('logo-transparent.webp')]);
    await expect(page.locator('.etat.ok')).toBeVisible();
    await expect(page.locator('.resultat')).toHaveCount(2);

    const a = await telecharger(page, 0);
    expect(a.nom).toBe('photo.png');
    expect(dimensionsPng(a.contenu)).toMatchObject({ largeur: 800, hauteur: 600 });

    const b = await telecharger(page, 1);
    expect(b.nom).toBe('logo-transparent.png');
    expect(dimensionsPng(b.contenu)).toMatchObject({ largeur: 400, hauteur: 300 });
    // coin transparent, centre opaque
    expect((await pixel(page, 1, 2, 2))[3]).toBe(0);
    expect((await pixel(page, 1, 200, 150))[3]).toBe(255);

    await expect(page.locator('[data-action=zip]')).toBeVisible();
    const [zip] = await Promise.all([page.waitForEvent('download'), page.locator('[data-action=zip]').click()]);
    expect(zip.suggestedFilename()).toBe('fichiers-convertis.zip');
  });

  test('refuse un fichier qui n’est pas un WebP', async ({ page }) => {
    await page.goto('/convertir-webp-en-png');
    await page.locator('input[type=file]').setInputFiles(fixture('pas-une-image.txt'));
    await expect(page.locator('.etat.erreur')).toContainText('pas-une-image.txt');
    await expect(page.locator('.resultat')).toHaveCount(0);
  });
});

test.describe('WebP → JPG', () => {
  test('convertit en JPG avec fond blanc à la place de la transparence', async ({ page }) => {
    await page.goto('/convertir-webp-en-jpg');
    await page.locator('input[name=qualite]').fill('80');
    await expect(page.locator('.options output')).toHaveText('80 %');
    await page.locator('input[type=file]').setInputFiles(fixture('logo-transparent.webp'));
    await expect(page.locator('.etat.ok')).toBeVisible();
    // Un seul fichier : pas de bouton ZIP
    await expect(page.locator('[data-action=zip]')).toBeHidden();
    await expect(page.locator('[data-action=recommencer]')).toBeVisible();
    const r = await telecharger(page, 0);
    expect(r.nom).toBe('logo-transparent.jpg');
    expect(dimensionsJpeg(r.contenu)).toEqual({ largeur: 400, hauteur: 300 });
    const [rr, g, bb] = await pixel(page, 0, 2, 2);
    expect(Math.min(rr, g, bb)).toBeGreaterThan(245); // blanc
  });
});

test.describe('HEIC → JPG', () => {
  test('décode une photo HEIC (module WebAssembly) et produit un JPG', async ({ page }) => {
    await page.goto('/convertir-heic-en-jpg');
    await page.locator('input[type=file]').setInputFiles(fixture('photo-iphone.heic'));
    await expect(page.locator('.etat.ok')).toBeVisible({ timeout: 60_000 });
    const r = await telecharger(page, 0);
    expect(r.nom).toBe('photo-iphone.jpg');
    expect(dimensionsJpeg(r.contenu)).toEqual({ largeur: 640, hauteur: 480 });
    // Coin haut-gauche du dégradé de test : rouge dominant
    const [rr, g, b] = await pixel(page, 0, 4, 4);
    expect(rr).toBeGreaterThan(200);
    expect(g).toBeLessThan(60);
    expect(Math.abs(b - 90)).toBeLessThan(40);
  });
});

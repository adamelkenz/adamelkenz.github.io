import { test, expect } from '@playwright/test';
import { statSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { fixture, telecharger, texteDuPdf } from './aides';

const tailleScan = statSync(fixture('scan-lourd.pdf')).size; // ≈ 2,4 Mo

test.describe('Compresser un PDF', () => {
  test('niveau Recommandée : allège les images et garde le texte', async ({ page }) => {
    await page.goto('/compresser-pdf');
    await page.locator('input[type=file]').setInputFiles(fixture('scan-lourd.pdf'));
    await expect(page.locator('.etat.ok')).toBeVisible({ timeout: 60_000 });
    const r = await telecharger(page, 0);
    expect(r.nom).toBe('scan-lourd-compresse.pdf');
    expect(r.contenu.length).toBeLessThan(tailleScan * 0.6);
    expect((await PDFDocument.load(r.contenu)).getPageCount()).toBe(3);
    expect(await texteDuPdf(r.contenu)).toContain('Texte selectionnable page 3');
  });

  test('niveau Maximale : pages converties en images, fichier très léger', async ({ page }) => {
    await page.goto('/compresser-pdf');
    await page.getByLabel('Maximale').check();
    await page.locator('input[type=file]').setInputFiles(fixture('scan-lourd.pdf'));
    await expect(page.locator('.etat.ok')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('.resultat-note')).toContainText('plus sélectionnable');
    const r = await telecharger(page, 0);
    expect(r.contenu.length).toBeLessThan(tailleScan * 0.3);
    expect((await PDFDocument.load(r.contenu)).getPageCount()).toBe(3);
  });

  test('PDF de texte déjà optimisé : message clair, pas de fichier', async ({ page }) => {
    await page.goto('/compresser-pdf');
    await page.locator('input[type=file]').setInputFiles(fixture('doc-a.pdf'));
    await expect(page.locator('.etat')).toContainText('déjà optimisé');
    await expect(page.locator('.resultat')).toHaveCount(0);
  });
});

for (const mo of [2, 1]) {
  test(`moins de ${mo} Mo : passe sous la limite en gardant le texte si possible`, async ({ page }) => {
    await page.goto(`/compresser-pdf-moins-de-${mo}-mo`);
    await page.locator('input[type=file]').setInputFiles(fixture('scan-lourd.pdf'));
    await expect(page.locator('.etat.ok')).toBeVisible({ timeout: 90_000 });
    const r = await telecharger(page, 0);
    expect(r.contenu.length).toBeLessThanOrEqual(mo * 1_000_000);
    // Palier le plus doux : on ne doit pas avoir écrasé la qualité inutilement
    expect(r.contenu.length).toBeGreaterThan(mo * 1_000_000 * 0.3);
    expect(await texteDuPdf(r.contenu)).toContain('Texte selectionnable');
  });
}

test('moins de 1 Mo : un fichier déjà léger n’est pas modifié', async ({ page }) => {
  await page.goto('/compresser-pdf-moins-de-1-mo');
  await page.locator('input[type=file]').setInputFiles(fixture('doc-a.pdf'));
  await expect(page.locator('.etat.ok')).toContainText('déjà');
  await expect(page.locator('.resultat')).toHaveCount(0);
});

test('PDF à mot de passe : message explicite', async ({ page }) => {
  await page.goto('/compresser-pdf-moins-de-1-mo');
  await page.locator('input[type=file]').setInputFiles(fixture('mot-de-passe.pdf'));
  // fichier minuscule → déjà sous la cible ; on vérifie donc sur le compresseur classique
  await page.goto('/compresser-pdf');
  await page.locator('input[type=file]').setInputFiles(fixture('mot-de-passe.pdf'));
  await expect(page.locator('.etat.erreur')).toContainText('mot de passe');
});

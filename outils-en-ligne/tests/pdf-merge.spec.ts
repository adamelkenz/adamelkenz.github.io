import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { fixture, telecharger } from './aides';

test.describe('Fusionner PDF', () => {
  test('fusionne dans l’ordre choisi', async ({ page }) => {
    await page.goto('/fusionner-pdf');
    await page.locator('input[type=file]').setInputFiles([fixture('doc-a.pdf'), fixture('doc-b.pdf')]);
    await expect(page.locator('.fichier')).toHaveCount(2);
    await expect(page.locator('.fichier').first()).toContainText('2 p.');
    // doc-b (paysage) passe en premier
    await page.getByRole('button', { name: 'Monter doc-b.pdf' }).click();
    await expect(page.locator('.fichier').first()).toContainText('doc-b.pdf');
    await page.getByRole('button', { name: 'Fusionner les PDF' }).click();
    await expect(page.locator('.etat.ok')).toBeVisible();
    const r = await telecharger(page, 0);
    expect(r.nom).toBe('fusion.pdf');
    const pdf = await PDFDocument.load(r.contenu);
    expect(pdf.getPageCount()).toBe(3);
    expect(pdf.getPage(0).getWidth()).toBe(842); // page paysage en premier
    expect(pdf.getPage(1).getWidth()).toBe(595);
  });

  test('accepte un PDF protégé contre la modification (ajouté en image)', async ({ page }) => {
    await page.goto('/fusionner-pdf');
    await page.locator('input[type=file]').setInputFiles([fixture('protege.pdf'), fixture('doc-a.pdf')]);
    await expect(page.locator('.fichier')).toHaveCount(2);
    await expect(page.locator('.fichier').first()).toContainText('Protégé contre la modification');
    await page.getByRole('button', { name: 'Fusionner les PDF' }).click();
    await expect(page.locator('.etat.ok')).toBeVisible({ timeout: 60_000 });
    const pdf = await PDFDocument.load((await telecharger(page, 0)).contenu);
    expect(pdf.getPageCount()).toBe(3);
  });

  test('signale un PDF à mot de passe et bloque la fusion', async ({ page }) => {
    await page.goto('/fusionner-pdf');
    await page.locator('input[type=file]').setInputFiles([fixture('mot-de-passe.pdf'), fixture('doc-a.pdf')]);
    await expect(page.locator('.fichier').first()).toContainText('mot de passe');
    await expect(page.getByRole('button', { name: 'Fusionner les PDF' })).toBeDisabled();
    await page.getByRole('button', { name: 'Retirer mot-de-passe.pdf' }).click();
    await expect(page.locator('.fichier')).toHaveCount(1);
  });
});

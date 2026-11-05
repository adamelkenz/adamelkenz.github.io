import { test, expect } from '@playwright/test';
import { fixture, telecharger, infosMp4 } from './aides';

test.describe('MOV → MP4', () => {
  test('mode Rapide : H.264 + AAC recopiés sans réencodage', async ({ page }) => {
    await page.goto('/convertir-mov-en-mp4');
    await page.locator('input[type=file]').setInputFiles(fixture('video-h264.mov'));
    await expect(page.locator('.etat.ok')).toBeVisible({ timeout: 60_000 });
    const r = await telecharger(page, 0);
    expect(r.nom).toBe('video-h264.mp4');
    expect(infosMp4(r.contenu)).toMatchObject({ estMp4: true, h264: true, aac: true });
  });

  test('mode Rapide : HEVC conservé, avec conseil pour la compatibilité', async ({ page }) => {
    await page.goto('/convertir-mov-en-mp4');
    await page.locator('input[type=file]').setInputFiles(fixture('video-hevc.mov'));
    await expect(page.locator('.resultat')).toHaveCount(1, { timeout: 60_000 });
    await expect(page.locator('.etat')).toContainText('Compatibilité maximale');
    const r = await telecharger(page, 0);
    expect(infosMp4(r.contenu)).toMatchObject({ estMp4: true, hevc: true, aac: true });
  });

  test('audio PCM converti en AAC (encodeur WebAssembly si le navigateur n’en a pas)', async ({ page }) => {
    await page.goto('/convertir-mov-en-mp4');
    await page.getByLabel('Compatibilité maximale').check();
    await page.locator('input[type=file]').setInputFiles(fixture('video-pcm.mov'));
    await expect(page.locator('.etat.ok')).toBeVisible({ timeout: 90_000 });
    const r = await telecharger(page, 0);
    const infos = infosMp4(r.contenu);
    expect(infos).toMatchObject({ estMp4: true, h264: true, aac: true });
    expect(infos.pcm).toBe(false);
  });

  test('vidéo non décodable : propose le convertisseur de secours', async ({ page, browserName }) => {
    // Le Chromium de test ne décode pas le HEVC : la compatibilité maximale doit passer par le secours.
    const decodeHevc = await page.goto('/convertir-mov-en-mp4').then(() =>
      page.evaluate(async () => (await VideoDecoder.isConfigSupported({ codec: 'hvc1.1.6.L93.B0' })).supported),
    );
    test.skip(!!decodeHevc, `${browserName} décode le HEVC : pas de secours nécessaire`);
    await page.getByLabel('Compatibilité maximale').check();
    await page.locator('input[type=file]').setInputFiles(fixture('video-hevc.mov'));
    await expect(page.locator('.etat.erreur')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-action=secours]')).toBeVisible();
  });

  test('fichier qui n’est pas une vidéo : message clair', async ({ page }) => {
    await page.goto('/convertir-mov-en-mp4');
    await page.locator('input[type=file]').setInputFiles({ name: 'faux.mov', mimeType: 'video/quicktime', buffer: Buffer.from('pas une vidéo') });
    await expect(page.locator('.etat.erreur')).toContainText("n'est pas une vidéo");
  });
});

/**
 * Script pour convertir le poster HTML en image PNG
 * 
 * Usage:
 *   npm install puppeteer
 *   node generate-poster-image.js
 * 
 * Résultat: poster-lifeline.png dans le même dossier
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePosterImage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlPath = join(__dirname, 'poster-lifeline.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Set viewport to A0 dimensions in pixels (at 96 DPI)
  // A0 = 841mm x 1189mm → ~3179px x 4494px at 96 DPI
  await page.setViewport({ width: 3179, height: 4494 });

  await page.screenshot({
    path: join(__dirname, 'poster-lifeline.png'),
    fullPage: true,
    type: 'png',
  });

  console.log('✅ Poster généré : docs/poster-lifeline.png');
  await browser.close();
}

generatePosterImage().catch(console.error);

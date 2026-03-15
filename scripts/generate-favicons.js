#!/usr/bin/env node
/**
 * generate-favicons.js
 * Usage: node scripts/generate-favicons.js [path-to-logo]
 * Default logo path: src/assets/logo.png
 *
 * Requires: npm install --save-dev sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

// Accept logo path as CLI arg, fall back to src/assets/logo.png
const logoPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, 'src', 'assets', 'logo.png');

if (!fs.existsSync(logoPath)) {
  console.error(`\n❌  Logo not found at: ${logoPath}`);
  console.error('   Pass the path as an argument:');
  console.error('   node scripts/generate-favicons.js path/to/logo.png\n');
  process.exit(1);
}

// Favicon sizes to generate
const SIZES = [
  { name: 'favicon-16x16.png',          size: 16  },
  { name: 'favicon-32x32.png',          size: 32  },
  { name: 'apple-touch-icon.png',       size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log(`\n📷  Source: ${logoPath}`);
  console.log(`📁  Output: ${PUBLIC}\n`);

  for (const { name, size } of SIZES) {
    const outPath = path.join(PUBLIC, name);
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',          // preserve aspect ratio; pad if not square
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent padding
      })
      .png()
      .toFile(outPath);
    console.log(`  ✅  ${size}×${size}  →  public/${name}`);
  }

  // Write site.webmanifest if it doesn't exist yet
  const manifestPath = path.join(PUBLIC, 'site.webmanifest');
  if (!fs.existsSync(manifestPath)) {
    const manifest = {
      name: 'Trip Dashboard',
      short_name: 'Trips',
      icons: [
        { src: '/trip-dashboard/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/trip-dashboard/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#0F0F0F',
      background_color: '#0F0F0F',
      display: 'standalone',
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log('  ✅  public/site.webmanifest created');
  }

  console.log('\n🎉  All favicons generated successfully!\n');
}

generateFavicons().catch((err) => {
  console.error('\n❌  Error generating favicons:', err.message);
  process.exit(1);
});

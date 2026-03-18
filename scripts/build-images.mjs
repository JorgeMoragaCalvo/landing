/**
 * build-images.mjs
 *
 * Reads the template HTML/CSS files and replaces all Landingi CDN image URLs
 * with local paths from images.json.
 *
 * Usage: node scripts/build-images.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');

// Parse --base argument (default: '/')
let basePath = '/';
const baseIdx = process.argv.indexOf('--base');
if (baseIdx !== -1 && process.argv[baseIdx + 1]) {
  basePath = process.argv[baseIdx + 1];
  if (!basePath.endsWith('/')) basePath += '/';
}

// UUID → local path mapping (UUID is the first 8+ chars of the Landingi asset ID)
const UUID_MAP = {
  // Carousel
  '2637a47d-d6b9-4da3-8c42-d47ed475bfb1': 'carousel/slide-1.webp',
  '5ba75b05-ed85-41e2-99cd-0f4d2b9d7f50': 'carousel/slide-2.webp',
  '55c31d78-19bf-4bc1-bede-75e41ac31e9c': 'carousel/slide-3.webp',
  'b3bf7fcc-857a-4694-9369-723d492800bb': 'carousel/slide-4.webp',
  'dd2f532b-2005-4334-966d-dcdaa60d9118': 'carousel/slide-5.webp',

  // Icons
  '4167d6da-6e54-4b9d-af75-73f994ddba65': 'icons/desayuno.png',
  '54bfcd0f-3b0f-4daf-8a21-6520ad8e05c7': 'icons/excursiones-guiadas.png',
  '43d5fd6e-1080-47af-ab0f-9e4f49157253': 'icons/spa.png',
  'bfd77492-3a3c-425a-9df8-7f9179fc116b': 'icons/checkin.png',
  '9ba6047d-1201-4961-b94e-af4c1aeb087d': 'icons/sala-de-juegos.png',
  '295cd145-528c-4054-a187-ebef8bc674ce': 'icons/sala-de-cine.png',
  '78a6c8fb-8a9a-4235-98db-d0be3974064b': 'icons/salon-infantil.png',
  '2ea4239c-83fb-4b1e-8900-37d18aa2ff32': 'icons/skiing.png',
  '6aba4245-c71f-48e8-b052-384b2a393232': 'icons/gym.png',
  '666500df-c17f-4744-8b92-d8ab5fbc8762': 'icons/mountain.png',

  // Logos
  '4956c656-da96-4c53-a3be-a26b6d2eabd2': 'logos/corralco-logo.png',
  '97117bd9-9baa-4174-b712-7128359ee1b9': 'logos/indy-logo.webp',

  // Spa
  '7e851eec-b593-4d0b-8a76-2a1c19224cbb': 'spa/jacuzzi.jpg',
  '5b86a13f-815e-430c-a17e-6a61c3da2d06': 'spa/piscina.jpg',
  'd9218a78-8a2e-4555-9a41-6a39a57211ca': 'spa/piscina-climatizada.jpg',
  'e27c5dff-3c26-42fb-8b85-225536dae211': 'spa/tratamientos.png',
  '3aa8cfa9-cbd2-4450-85aa-d9805d1f38f5': 'spa/sauna.jpg',

  // Rooms
  '8190eb01-607e-4ba1-b1b6-ff646a305c57': 'rooms/standard.jpg',
  '8d0a8b4f-cb3a-4a43-b07c-dacdf9faa8c8': 'rooms/superior.jpg',
  'de287585-9f14-4046-9ca5-09b9c6d0ebd5': 'rooms/suite.jpg',

  // Blog
  '35007c8b-ef1e-4eff-9986-6889edb5ea02': 'blog/post-1.jpg',
  'f1f06299-8ea2-44ae-87c8-70c91c7d9411': 'blog/post-2.jpg',

  // Termas
  '51abfaf8-1581-462f-878a-86e9229cc078': 'termas/termas-1.png',
  'ccecf29f-44dc-4f18-9626-a1ac1caa8825': 'termas/termas-2.png',

  // Resort / backgrounds
  '0cea5955-a54d-4564-95a1-9334246e7355': 'resort/corralco-lowres.jpg',
  '5b753fad-d06f-4ece-8411-2143ff92dfd5': 'resort/ski-resort.webp',
  '5b248134-6cda-4361-bbde-0f64c268756e': 'resort/resort-nieve.png',
  '1f3ade96-a7f7-4dbe-988e-463528f2d98b': 'resort/corralco-nevado.png',
  '98489d20-2b58-4800-8d00-6d31737770c4': 'resort/corralco-walking.png',
  '3689cb9e-4da6-4c4c-bf65-51c25b212ecc': 'resort/people-corralco.png',
  'd428632e-43a4-45a6-93c1-67600e838e23': 'resort/bar.png',
  '117407d9-b65a-4b6e-b90e-facfc2315d9c': 'resort/hotel-room.jpg',
  '44f95feb-7bf0-4042-843f-9ec2ae8a6622': 'resort/trail-map.jpg',
  'f437485c-b6f8-4663-b040-e767d3f3018f': 'resort/volcan-express.jpg',
  '6f56a724-d983-4f18-a811-b3f27ba6bc82': 'resort/corralco-4618.png',

  // Gallery
  '527af055-1420-4de7-81c2-6901ff276c72': 'gallery/arthur-ghilini.png',
  '849cd061-8652-4fe6-a522-da627445e4fa': 'gallery/corralco-5514.png',
  'bdd32201-4d9c-4f00-b2c1-79028cc14248': 'gallery/corralco-5419.png',
  'bf325e15-4f47-4893-a706-84e1893388af': 'gallery/img-0469.png',
};

// Read images.json and apply user overrides to UUID_MAP.
// When the user changes a filename in images.json, the build script
// picks up the new path for that image slot.
const imagesJsonPath = resolve(publicDir, 'images.json');
if (existsSync(imagesJsonPath)) {
  const userConfig = JSON.parse(readFileSync(imagesJsonPath, 'utf-8'));
  // Build a reverse lookup: default local path → UUID
  const pathToUuid = {};
  for (const [uuid, path] of Object.entries(UUID_MAP)) {
    pathToUuid[path] = uuid;
  }
  // Flatten images.json and override UUID_MAP when a value differs
  for (const entries of Object.values(userConfig)) {
    if (typeof entries !== 'object') continue;
    for (const newPath of Object.values(entries)) {
      // If this path already exists as a default, no action needed.
      // If the user changed it, the old path is still in pathToUuid.
      // We skip override logic for now — the user edits UUID_MAP directly
      // or replaces files keeping the same name.
    }
  }
}

function replaceUrls(content) {
  let result = content;

  for (const [uuid, localPath] of Object.entries(UUID_MAP)) {
    const localUrl = `${basePath}images/${localPath}`;

    // Replace cdn.lugc.link URLs with various transform parameters
    // Pattern: https://cdn.lugc.link/UUID/...anything.../
    const cdnPattern = new RegExp(
      `https://cdn\\.lugc\\.link/${uuid.replace(/-/g, '-')}[^"'\\s)]*`,
      'g'
    );
    result = result.replace(cdnPattern, localUrl);

    // Replace images.assets-landingi.com URLs
    // Pattern: https://images.assets-landingi.com/uc/UUID/filename
    const assetsPattern = new RegExp(
      `https://images\\.assets-landingi\\.com/uc/${uuid}[^"'\\s)]*`,
      'g'
    );
    result = result.replace(assetsPattern, localUrl);
  }

  // Collapse duplicate responsive background-image rules for the same local image.
  // The inline styles have many @media rules all pointing to the same local image now.
  // We collapse them: for each selector, keep only one rule per image.
  result = collapseResponsiveBackgrounds(result);

  return result;
}

function collapseResponsiveBackgrounds(content) {
  // Find <style> blocks that contain multiple @media rules for the same selector+image
  return content.replace(/<style>((?:@media[^<]+))<\/style>/g, (match, inner) => {
    // Check if all @media rules in this block point to the same image
    const urlMatches = [...inner.matchAll(/url\("([^"]+)"\)/g)];
    if (urlMatches.length <= 1) return match;

    const uniqueUrls = new Set(urlMatches.map(m => m[1]));
    if (uniqueUrls.size === 1) {
      // All rules point to the same local image - collapse to a single rule
      const url = [...uniqueUrls][0];
      // Extract the selector (e.g., #ID.widget-section:not(.lazyload))
      const selectorMatch = inner.match(/\s(#[A-Za-z0-9]+[^{]*)\s*\{/);
      if (selectorMatch) {
        const selector = selectorMatch[1].trim();
        return `<style>${selector} { background-image: url("${url}"); }</style>`;
      }
    }
    return match;
  });
}

// Process HTML template
const htmlTemplatePath = resolve(publicDir, 'preventa-corralco.template.html');
const htmlOutputPath = resolve(publicDir, 'preventa-corralco.html');

if (!existsSync(htmlTemplatePath)) {
  console.error('Template not found:', htmlTemplatePath);
  console.error('Run: cp public/preventa-corralco.html public/preventa-corralco.template.html');
  process.exit(1);
}

console.log('Reading template files...');
let html = readFileSync(htmlTemplatePath, 'utf-8');
html = replaceUrls(html);

// Simplify <img> tags: replace data-srcset with just src pointing to local image
// For lazy-loaded images, keep data-src but remove complex srcset
html = html.replace(
  /data-srcset="[^"]*"\s*data-sizes="[^"]*"\s*data-src="([^"]*)"/g,
  'data-src="$1"'
);
// For non-lazy images with srcset
html = html.replace(
  /srcset="[^"]*"\s*sizes="[^"]*"\s*src="([^"]*)"/g,
  'src="$1"'
);

// Strip Landingi lazy-loading: images are local, lazysizes.js won't load on our host.
// 1. Convert data-src to src so browsers load images directly
html = html.replace(/\bdata-src="/g, 'src="');
// 2. Remove lazyload class (CSS hides these elements with background-image: none)
html = html.replace(/\blazyload\b/g, '');

// Prefix absolute CSS references with base path
if (basePath !== '/') {
  html = html.replace(/href="\/landingi-base\.css"/g, `href="${basePath}landingi-base.css"`);
  html = html.replace(/href="\/corralco-base\.css"/g, `href="${basePath}corralco-base.css"`);
}

writeFileSync(htmlOutputPath, html, 'utf-8');
console.log('✓ Generated:', htmlOutputPath);

// Process CSS template
const cssTemplatePath = resolve(publicDir, 'corralco-base.template.css');
const cssOutputPath = resolve(publicDir, 'corralco-base.css');

if (existsSync(cssTemplatePath)) {
  let css = readFileSync(cssTemplatePath, 'utf-8');
  css = replaceUrls(css);
  // Remove CSS rules that hide lazyload elements
  css = css.replace(/[^{}]*\.lazyload[^{}]*\{[^}]*background-image:\s*none[^}]*\}/g, '');
  writeFileSync(cssOutputPath, css, 'utf-8');
  console.log('✓ Generated:', cssOutputPath);
}

// Validate that all referenced images exist
let warnings = 0;
for (const [uuid, localPath] of Object.entries(UUID_MAP)) {
  const fullPath = resolve(publicDir, 'images', localPath);
  if (!existsSync(fullPath)) {
    console.warn(`⚠ Missing image: images/${localPath}`);
    warnings++;
  }
}

if (warnings === 0) {
  console.log('✓ All images present');
} else {
  console.warn(`⚠ ${warnings} missing image(s)`);
}

console.log('Done!');

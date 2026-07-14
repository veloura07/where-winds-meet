import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'style.css'), 'utf8');
const scripts = ['engine.js', 'script.js'];
const failures = [];

for (const file of ['style.css', ...scripts, 'assets/nature_valley.png']) {
  if (!existsSync(path.join(root, file))) failures.push(`Missing file: ${file}`);
}

for (const src of [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1])) {
  if (/^(https?:|mailto:|#)/.test(src)) continue;
  if (!existsSync(path.join(root, src))) failures.push(`Broken HTML reference: ${src}`);
}

for (const url of [...css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map(match => match[1])) {
  if (/^(data:|https?:)/.test(url)) continue;
  if (!existsSync(path.join(root, url))) failures.push(`Broken CSS asset reference: ${url}`);
}

for (const id of ['world', 'base-image', 'water-canvas', 'physics-canvas', 'galaxy-canvas', 'terminal-modal']) {
  if (!html.includes(`id="${id}"`)) failures.push(`Missing expected DOM id: ${id}`);
}

if (!html.includes('aria-label=')) failures.push('No aria-label attributes detected.');
if (!css.includes('prefers-reduced-motion')) failures.push('Reduced motion CSS is missing.');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Static validation passed.');

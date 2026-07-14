import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const required = ['index.html', 'style.css', 'script.js', 'engine.js', 'assets/nature_valley.png'];

for (const file of required) {
  if (!existsSync(path.join(root, file))) {
    throw new Error(`Missing required deploy asset: ${file}`);
  }
}

if (!existsSync(dist)) {
  await mkdir(dist, { recursive: true });
}

for (const file of ['script.js', 'engine.js', 'README.md', 'robots.txt', 'site.webmanifest', 'vercel.json']) {
  if (existsSync(path.join(root, file))) {
    await cp(path.join(root, file), path.join(dist, file), { recursive: true });
  }
}

await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });

const html = await readFile(path.join(dist, 'index.html'), 'utf8');
await writeFile(path.join(dist, 'index.html'), html.replace(/%BUILD_TIME%/g, new Date().toISOString()));

console.log(`Built ${path.relative(root, dist)} for static deployment.`);

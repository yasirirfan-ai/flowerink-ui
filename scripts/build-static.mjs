/* Generate the pages and package the browser assets for static hosting. */
import './build-pages.mjs';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
if (relative(root, output) !== 'dist') throw new Error('Invalid static output directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const entries = await readdir(root, { withFileTypes: true });
for (const entry of entries) {
  if (entry.isFile() && ['.html', '.css', '.js'].includes(extname(entry.name))) {
    await cp(resolve(root, entry.name), resolve(output, entry.name));
  }
}
await cp(resolve(root, 'img'), resolve(output, 'img'), { recursive: true });
console.log('Static storefront ready in dist/');

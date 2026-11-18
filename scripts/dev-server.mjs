import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';
import { pipeline } from 'node:stream/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  if (!(await stat(resolve(root, 'index.html'))).isFile()) throw new Error('Missing homepage');
} catch {
  console.error('Flower Ink homepage is missing. Restore index.html and the img folder before starting the preview.');
  process.exit(1);
}
const portFlag = process.argv.indexOf('--port');
const port = Number(portFlag >= 0 ? process.argv[portFlag + 1] : process.env.PORT || 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Use a port between 1 and 65535: npm run dev -- --port 8080');
  process.exit(1);
}

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.zip': 'application/zip', '.txt': 'text/plain; charset=utf-8'
};

const server = createServer(async (request, response) => {
  const reply = (status, message) => {
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : message);
  };
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    return reply(405, 'Method not allowed');
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    return reply(400, 'Invalid URL');
  }
  if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) {
    return reply(404, 'Not found');
  }
  const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  const location = relative(root, file);
  if (isAbsolute(location) || location === '..' || location.startsWith('..' + sep)) {
    return reply(404, 'Not found');
  }
  try {
    const info = await stat(file);
    if (!info.isFile()) return reply(404, 'Not found');
    response.writeHead(200, {
      'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') return response.end();
    await pipeline(createReadStream(file), response);
  } catch (error) {
    if (response.headersSent) return response.destroy();
    reply(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500, 'Unable to serve this file');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already in use. Try: npm run dev -- --port ${port + 1}`
    : `Could not start preview: ${error.message}`);
  process.exit(1);
});
server.listen(port, '0.0.0.0', () => {
  console.log(`\nFlower Ink preview\n  Local:   http://localhost:${port}`);
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal) {
        console.log(`  Network: http://${address.address}:${port}`);
      }
    }
  }
  console.log('\nPress Ctrl+C to stop.\n');
});

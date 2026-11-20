// Local preview server for Neon Coast Cover Studio.
// Serves app/ on http://localhost:8080 (or $PORT) with the MIME types the
// app needs, and refuses paths outside app/. Development use only.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const port = Number(process.env.PORT) || 8080;

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

createServer((req, res) => {
  let path: string;
  try {
    path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(appRoot, '.' + path));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  try {
    const st = statSync(file);
    if (!st.isFile()) throw new Error('not a file');
    res.writeHead(200, {
      'content-type': types[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'content-length': st.size,
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Neon Coast Cover Studio at http://localhost:${port}`);
});

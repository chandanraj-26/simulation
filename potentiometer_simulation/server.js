const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8096;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (e) {
    res.writeHead(400);
    return res.end('Invalid URL');
  }

  let pathname = decodeURIComponent(parsedUrl.pathname);
  if (pathname === '/' || pathname === '') pathname = '/index.html';

  let filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const fallback = path.join(PUBLIC_DIR, 'index.html');
        return fs.readFile(fallback, (err2, content) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(content);
        });
      }
      res.writeHead(500);
      return res.end(`Server Error: ${err.code}`);
    }

    if (stats.isDirectory()) filePath = path.join(filePath, 'index.html');

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        return res.end(`Read Error: ${readErr.code}`);
      }
      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🎛️ Potentiometer Laboratory running at http://localhost:${PORT}`);
});

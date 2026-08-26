import http from 'node:http';
import { products } from './data/products.mjs';

const PORT = process.env.PORT;

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  if (req.method === 'GET' && path === '/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'GET' && path === '/products') {
    sendJson(res, 200, products);
    return;
  }

  const productMatch = path.match(/^\/products\/([^/]+)$/);
  if (req.method === 'GET' && productMatch) {
    const product = products.find((p) => p.id === productMatch[1]);
    if (!product) {
      sendJson(res, 404, { error: 'no such product' });
      return;
    }
    sendJson(res, 200, product);
    return;
  }

  sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, '0.0.0.0');

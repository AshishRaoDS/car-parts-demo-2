import http from 'node:http';
import crypto from 'node:crypto';
import { products } from './data/products.mjs';

const PORT = process.env.PORT;

// Session carts held in process memory, keyed by a server-issued cookie id.
const carts = new Map();

function sendJson(res, status, body, headers) {
  const payload = JSON.stringify(body);
  res.writeHead(status, Object.assign({ 'Content-Type': 'application/json' }, headers || {}));
  res.end(payload);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

function getOrCreateSessionId(req, res) {
  const cookies = parseCookies(req);
  let sessionId = cookies.sessionId;
  let setCookie = null;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    setCookie = 'sessionId=' + sessionId + '; Path=/; HttpOnly; SameSite=Lax';
  }
  if (!carts.has(sessionId)) {
    carts.set(sessionId, new Map());
  }
  return { sessionId, setCookie };
}

function cartResponse(sessionId) {
  const lines = carts.get(sessionId) || new Map();
  const items = [];
  let total = 0;
  lines.forEach((line) => {
    const lineTotal = line.unitPrice * line.quantity;
    total += lineTotal;
    items.push({
      productId: line.productId,
      name: line.name,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: lineTotal
    });
  });
  return { items, total };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      if (!data) { resolve({}); return; }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
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

  if (req.method === 'GET' && path === '/cart') {
    const { sessionId, setCookie } = getOrCreateSessionId(req, res);
    sendJson(res, 200, cartResponse(sessionId), setCookie ? { 'Set-Cookie': setCookie } : null);
    return;
  }

  if (req.method === 'POST' && path === '/cart/items') {
    const { sessionId, setCookie } = getOrCreateSessionId(req, res);
    readBody(req)
      .then((body) => {
        const product = products.find((p) => p.id === body.productId);
        if (!product) {
          sendJson(res, 404, { error: 'no such product' }, setCookie ? { 'Set-Cookie': setCookie } : null);
          return;
        }
        const quantity = Number.isFinite(body.quantity) && body.quantity > 0 ? body.quantity : 1;
        // Increment the existing line's quantity rather than creating a duplicate entry
        // when the same product is added again in the same session.
        const lines = carts.get(sessionId);
        const existing = lines.get(product.id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          lines.set(product.id, {
            productId: product.id,
            name: product.name,
            unitPrice: product.price,
            quantity: quantity
          });
        }
        sendJson(res, 200, cartResponse(sessionId), setCookie ? { 'Set-Cookie': setCookie } : null);
      })
      .catch(() => {
        sendJson(res, 400, { error: 'invalid request body' }, setCookie ? { 'Set-Cookie': setCookie } : null);
      });
    return;
  }

  sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, '0.0.0.0');

import http from 'node:http';
import { pool } from './db.mjs';

const PORT = process.env.PORT;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const SESSION_COOKIE = 'cart_session_id';

function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', ...extraHeaders });
  res.end(payload);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

async function ensureSession(req, res) {
  const cookies = parseCookies(req);
  const existingId = cookies[SESSION_COOKIE];
  if (existingId) {
    const { rows } = await pool.query('SELECT id FROM cart_sessions WHERE id = $1', [existingId]);
    if (rows.length > 0) {
      return { id: existingId, setCookie: null };
    }
  }
  const { rows } = await pool.query('INSERT INTO cart_sessions DEFAULT VALUES RETURNING id');
  const id = rows[0].id;
  return { id, setCookie: `${SESSION_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax` };
}

async function fetchProduct(productId) {
  const resp = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error('product-service error');
  return resp.json();
}

async function buildCartResponse(sessionId) {
  const { rows } = await pool.query(
    'SELECT product_id, quantity FROM cart_items WHERE session_id = $1 ORDER BY created_at ASC',
    [sessionId]
  );
  const items = [];
  let total = 0;
  for (const row of rows) {
    const product = await fetchProduct(row.product_id);
    if (!product) continue;
    const unitPrice = Number(product.price);
    const quantity = row.quantity;
    const lineTotal = Number((unitPrice * quantity).toFixed(2));
    total += lineTotal;
    items.push({
      productId: row.product_id,
      name: product.name,
      unitPrice,
      quantity,
      lineTotal
    });
  }
  return { items, total: Number(total.toFixed(2)) };
}

async function handleHealth(res) {
  try {
    await pool.query('SELECT 1');
    const check = await fetch(`${PRODUCT_SERVICE_URL}/health`);
    if (!check.ok) throw new Error('product-service unhealthy');
    sendJson(res, 200, { status: 'ok' });
  } catch (err) {
    sendJson(res, 503, { status: 'unavailable' });
  }
}

async function handleGetCart(req, res) {
  const { id: sessionId, setCookie } = await ensureSession(req, res);
  const body = await buildCartResponse(sessionId);
  sendJson(res, 200, body, setCookie ? { 'Set-Cookie': setCookie } : {});
}

async function handleAddItem(req, res) {
  const { id: sessionId, setCookie } = await ensureSession(req, res);
  const payload = await readBody(req);
  const productId = payload.productId;
  const quantity = Number.isInteger(payload.quantity) && payload.quantity > 0 ? payload.quantity : 1;

  if (!productId) {
    sendJson(res, 404, { error: 'no such product' }, setCookie ? { 'Set-Cookie': setCookie } : {});
    return;
  }

  const product = await fetchProduct(productId);
  if (!product) {
    sendJson(res, 404, { error: 'no such product' }, setCookie ? { 'Set-Cookie': setCookie } : {});
    return;
  }

  await pool.query(
    `INSERT INTO cart_items (session_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (session_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [sessionId, productId, quantity]
  );

  const body = await buildCartResponse(sessionId);
  sendJson(res, 200, body, setCookie ? { 'Set-Cookie': setCookie } : {});
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/health') {
      await handleHealth(res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/cart') {
      await handleGetCart(req, res);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/cart/items') {
      await handleAddItem(req, res);
      return;
    }

    sendJson(res, 404, { error: 'not found' });
  } catch (err) {
    sendJson(res, 500, { error: 'internal error' });
  }
});

server.listen(PORT, '0.0.0.0');

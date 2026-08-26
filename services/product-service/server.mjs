import http from 'node:http';
import { pool } from './db.mjs';

const PORT = process.env.PORT;

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    imageUrl: row.image_url
  };
}

function toProductDetail(row) {
  return {
    ...toProduct(row),
    description: row.description
  };
}

async function handleHealth(res) {
  try {
    await pool.query('SELECT 1');
    sendJson(res, 200, { status: 'ok' });
  } catch (err) {
    sendJson(res, 503, { status: 'unavailable' });
  }
}

async function handleListProducts(res) {
  const { rows } = await pool.query('SELECT id, name, price, image_url FROM products ORDER BY created_at ASC');
  sendJson(res, 200, rows.map(toProduct));
}

async function handleGetProduct(res, id) {
  const { rows } = await pool.query(
    'SELECT id, name, price, image_url, description FROM products WHERE id = $1',
    [id]
  );
  if (rows.length === 0) {
    sendJson(res, 404, { error: 'no such product' });
    return;
  }
  sendJson(res, 200, toProductDetail(rows[0]));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);

    if (req.method === 'GET' && url.pathname === '/health') {
      await handleHealth(res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/products') {
      await handleListProducts(res);
      return;
    }

    if (req.method === 'GET' && parts[0] === 'api' && parts[1] === 'products' && parts[2]) {
      await handleGetProduct(res, parts[2]);
      return;
    }

    sendJson(res, 404, { error: 'not found' });
  } catch (err) {
    sendJson(res, 500, { error: 'internal error' });
  }
});

server.listen(PORT, '0.0.0.0');

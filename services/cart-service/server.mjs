import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

const PORT = process.env.PORT;
const CATALOG_URL = process.env.CATALOG_SERVICE_URL;

const app = express();
app.use(express.json());
app.use(cookieParser());

// session id -> Map(productId -> { productId, name, unitPrice, quantity })
const carts = new Map();

const SESSION_COOKIE = 'cart_session';

function getSessionId(req, res) {
  let sid = req.cookies[SESSION_COOKIE];
  if (!sid || !carts.has(sid)) {
    sid = crypto.randomUUID();
    res.cookie(SESSION_COOKIE, sid, { httpOnly: true, sameSite: 'lax', path: '/' });
    carts.set(sid, new Map());
  }
  return sid;
}

function serializeCart(sid) {
  const lines = [...carts.get(sid).values()];
  const items = lines.map((l) => ({
    productId: l.productId,
    name: l.name,
    unitPrice: l.unitPrice,
    quantity: l.quantity,
    subtotal: Number((l.unitPrice * l.quantity).toFixed(2)),
  }));
  const total = Number(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));
  return { items, total };
}

app.get('/health', async (req, res) => {
  if (!CATALOG_URL) {
    res.status(500).json({ status: 'error', reason: 'missing CATALOG_SERVICE_URL' });
    return;
  }
  try {
    const r = await fetch(`${CATALOG_URL}/health`);
    if (!r.ok) throw new Error('catalog unhealthy');
    res.status(200).json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error', reason: 'catalog-service unreachable' });
  }
});

app.get('/api/cart', (req, res) => {
  const sid = getSessionId(req, res);
  res.json(serializeCart(sid));
});

app.post('/api/cart/items', async (req, res) => {
  const sid = getSessionId(req, res);
  const { productId } = req.body || {};
  if (!productId) {
    res.status(400).json({ error: 'productId is required' });
    return;
  }
  let product;
  try {
    const r = await fetch(`${CATALOG_URL}/api/products/${encodeURIComponent(productId)}`);
    if (r.status === 404) {
      res.status(404).json({ error: 'productId not found' });
      return;
    }
    if (!r.ok) throw new Error('catalog lookup failed');
    product = await r.json();
  } catch (e) {
    res.status(502).json({ error: 'catalog-service unavailable' });
    return;
  }

  const cart = carts.get(sid);
  const existing = cart.get(productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.set(productId, {
      productId,
      name: product.name,
      unitPrice: product.price,
      quantity: 1,
    });
  }

  res.status(201).json(serializeCart(sid));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`cart-service listening on ${PORT}`);
});

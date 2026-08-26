import express from 'express';

const app = express();
const PORT = process.env.PORT;

// Inline SVG data URIs -- no external network dependency, so page loads
// never stall waiting on an image host that does not exist.
function placeholder(label, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#ffffff">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const products = [
  {
    id: 'p1',
    name: 'Hand-Thrown Ceramic Mug',
    price: 18.0,
    image: placeholder('Ceramic Mug', '#8a4b2f'),
    thumbnail: placeholder('Ceramic Mug', '#8a4b2f'),
    description: 'A stoneware mug, glazed in warm earth tones, thrown by hand and fired to a matte finish. Holds 12oz.'
  },
  {
    id: 'p2',
    name: 'Linen Table Runner',
    price: 32.5,
    image: placeholder('Table Runner', '#3f6b4f'),
    thumbnail: placeholder('Table Runner', '#3f6b4f'),
    description: 'Pre-washed European linen runner, 14 by 72 inches, stone-washed for a soft drape and a relaxed finish.'
  },
  {
    id: 'p3',
    name: 'Cast Iron Trivet',
    price: 24.0,
    image: placeholder('Cast Iron Trivet', '#6f6759'),
    thumbnail: placeholder('Cast Iron Trivet', '#6f6759'),
    description: 'A raw cast iron trivet with a leaf motif, seasoned and ready to protect countertops from hot cookware.'
  },
  {
    id: 'p4',
    name: 'Beeswax Taper Candles (Set of 4)',
    price: 21.0,
    image: placeholder('Beeswax Candles', '#a5372c'),
    thumbnail: placeholder('Beeswax Candles', '#a5372c'),
    description: 'Four hand-dipped beeswax tapers, unscented, with a slow honeyed burn and a natural golden hue.'
  },
  {
    id: 'p5',
    name: 'Woven Market Basket',
    price: 45.0,
    image: placeholder('Market Basket', '#8a4b2f'),
    thumbnail: placeholder('Market Basket', '#8a4b2f'),
    description: 'A sturdy seagrass basket with leather handles, sized for market runs or holding throws by the couch.'
  },
  {
    id: 'p6',
    name: 'Olive Wood Cutting Board',
    price: 38.0,
    image: placeholder('Cutting Board', '#3f6b4f'),
    thumbnail: placeholder('Cutting Board', '#3f6b4f'),
    description: 'A single-piece olive wood board with natural grain variation, finished with food-safe mineral oil.'
  }
];

const productsById = new Map(products.map((p) => [p.id, p]));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/products', (req, res) => {
  res.json(
    products.map(({ id, name, price, image, thumbnail }) => ({
      id,
      name,
      price,
      image,
      thumbnail
    }))
  );
});

app.get('/api/products/:id', (req, res) => {
  const product = productsById.get(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'no such product id' });
    return;
  }
  const { id, name, price, image, description } = product;
  res.json({ id, name, price, image, description });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`catalog-service listening on ${PORT}`);
});

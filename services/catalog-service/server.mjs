import express from 'express';

const app = express();
const PORT = process.env.PORT;

const products = [
  {
    id: 'p1',
    name: 'Hand-Thrown Ceramic Mug',
    price: 18.0,
    image: 'https://images.example.com/products/mug.jpg',
    thumbnail: 'https://images.example.com/products/mug-thumb.jpg',
    description: 'A stoneware mug, glazed in warm earth tones, thrown by hand and fired to a matte finish. Holds 12oz.'
  },
  {
    id: 'p2',
    name: 'Linen Table Runner',
    price: 32.5,
    image: 'https://images.example.com/products/runner.jpg',
    thumbnail: 'https://images.example.com/products/runner-thumb.jpg',
    description: 'Pre-washed European linen runner, 14 by 72 inches, stone-washed for a soft drape and a relaxed finish.'
  },
  {
    id: 'p3',
    name: 'Cast Iron Trivet',
    price: 24.0,
    image: 'https://images.example.com/products/trivet.jpg',
    thumbnail: 'https://images.example.com/products/trivet-thumb.jpg',
    description: 'A raw cast iron trivet with a leaf motif, seasoned and ready to protect countertops from hot cookware.'
  },
  {
    id: 'p4',
    name: 'Beeswax Taper Candles (Set of 4)',
    price: 21.0,
    image: 'https://images.example.com/products/candles.jpg',
    thumbnail: 'https://images.example.com/products/candles-thumb.jpg',
    description: 'Four hand-dipped beeswax tapers, unscented, with a slow honeyed burn and a natural golden hue.'
  },
  {
    id: 'p5',
    name: 'Woven Market Basket',
    price: 45.0,
    image: 'https://images.example.com/products/basket.jpg',
    thumbnail: 'https://images.example.com/products/basket-thumb.jpg',
    description: 'A sturdy seagrass basket with leather handles, sized for market runs or holding throws by the couch.'
  },
  {
    id: 'p6',
    name: 'Olive Wood Cutting Board',
    price: 38.0,
    image: 'https://images.example.com/products/board.jpg',
    thumbnail: 'https://images.example.com/products/board-thumb.jpg',
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

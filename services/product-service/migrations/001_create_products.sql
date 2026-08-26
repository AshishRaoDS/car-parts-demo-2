CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO products (name, price, image_url, description) VALUES
  ('Hand-Thrown Ceramic Mug', 24.00, 'https://picsum.photos/seed/mug/600/400', 'A rustic hand-thrown ceramic mug glazed in warm earth tones. Holds 12oz and is dishwasher safe.'),
  ('Woven Wool Throw Blanket', 68.00, 'https://picsum.photos/seed/blanket/600/400', 'A heavyweight woven wool throw in a herringbone pattern, perfect for cool evenings by the fire.'),
  ('Cast Iron Skillet', 45.00, 'https://picsum.photos/seed/skillet/600/400', 'A pre-seasoned 10-inch cast iron skillet built for a lifetime of searing, baking, and roasting.'),
  ('Linen Table Runner', 32.00, 'https://picsum.photos/seed/runner/600/400', 'A soft washed-linen table runner in natural flax, adding texture to any table setting.'),
  ('Oak Cutting Board', 38.00, 'https://picsum.photos/seed/board/600/400', 'A solid oak end-grain cutting board, hand-finished with food-safe oil.'),
  ('Beeswax Taper Candles (Set of 4)', 19.00, 'https://picsum.photos/seed/candles/600/400', 'Four hand-dipped beeswax taper candles with a natural honey scent and clean burn.');

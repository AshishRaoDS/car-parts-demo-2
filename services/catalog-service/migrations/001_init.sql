-- Catalog data is served from an in-memory seed (products.mjs); this table
-- exists only so the service owns a schema per platform convention.
CREATE TABLE IF NOT EXISTS schema_marker (
  id serial PRIMARY KEY,
  note text NOT NULL DEFAULT 'catalog-service uses in-memory product data, not this table'
);

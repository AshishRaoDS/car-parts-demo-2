-- Store-service currently keeps its catalogue and session carts in memory
-- (see data/products.mjs, server.mjs). This table records nothing but
-- establishes the service's ownership of its schema, as required by the
-- platform's migration convention, and gives the health check a table to
-- reach against the database dependency.
CREATE TABLE IF NOT EXISTS schema_version (
  id INTEGER PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO schema_version (id) VALUES (1) ON CONFLICT DO NOTHING;

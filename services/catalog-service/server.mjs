import express from "express";
import { products } from "./products.mjs";

const app = express();
const PORT = process.env.PORT;

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/products", (req, res) => {
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

app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "product not found" });
    return;
  }
  const { id, name, price, image, description } = product;
  res.json({ id, name, price, image, description });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`catalog-service listening on ${PORT}`);
});

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!products.length) {
    grid.innerHTML = '<p class="empty-state">No products available.</p>';
    return;
  }
  grid.innerHTML = products
    .map(
      (p) => `
      <a class="product-grid-card" href="./product.html?id=${encodeURIComponent(p.id)}">
        <img src="${p.thumbnail}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>$${p.price.toFixed(2)}</p>
      </a>
    `
    )
    .join('');
}

fetch('api/products')
  .then((res) => res.json())
  .then(renderProducts)
  .catch(() => {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '<p class="empty-state">Unable to load products.</p>';
  });

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
        <img class="product-grid-image" src="${p.thumbnail}" alt="${p.name}">
        <div class="product-grid-body">
          <h3 class="product-grid-name">${p.name}</h3>
          <p class="product-grid-price">$${p.price.toFixed(2)}</p>
        </div>
      </a>
    `
    )
    .join('');
}

const grid = document.getElementById('product-grid');
if (grid) {
  fetch('api/products')
    .then((res) => res.json())
    .then(renderProducts)
    .catch(() => {
      grid.innerHTML = '<p class="empty-state">Unable to load products.</p>';
    });
}

const shopCta = document.getElementById('shop-cta');
if (shopCta) {
  shopCta.addEventListener('click', () => {
    window.analytics.track('cta_clicked', { cta: 'shop_the_collection' });
  });
}

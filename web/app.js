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
    .then((products) => {
      renderProducts(products);
      window.analytics.track('product_list_viewed', { count: products.length });
    })
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

const detailMain = document.getElementById('detail-main');
if (detailMain) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) {
    detailMain.innerHTML = '<p class="empty-state">No product specified.</p>';
  } else {
    fetch(`api/products/${encodeURIComponent(productId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((product) => {
        detailMain.innerHTML = `
          <div class="detail-panel">
            <img class="detail-panel-image" src="${product.image}" alt="${product.name}">
            <div>
              <h1 class="detail-panel-name">${product.name}</h1>
              <p class="detail-panel-price">$${Number(product.price).toFixed(2)}</p>
              <p class="detail-panel-desc">${product.description}</p>
              <button id="add-to-cart" class="btn-primary">Add to cart</button>
              <p id="add-confirm" class="detail-panel-confirm">Added to cart.</p>
            </div>
          </div>
        `;
        window.analytics.track('product_detail_viewed', { productId: product.id });
      })
      .catch(() => {
        detailMain.innerHTML = '<p class="empty-state">Unable to load product.</p>';
      });
  }
}

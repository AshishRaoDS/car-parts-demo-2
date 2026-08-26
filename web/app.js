function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!products.length) {
    grid.innerHTML = '<p class="empty-state">No products available.</p>';
    return;
  }
  grid.innerHTML = products
    .map(
      (p) => `
      <a class="product-grid-card" href="./product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${p.name}" data-product-name="${p.name}">
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
              <p id="add-confirm" class="detail-panel-confirm" role="status">Added to cart.</p>
            </div>
          </div>
        `;
        window.analytics.track('product_detail_viewed', { productId: product.id });

        const addBtn = document.getElementById('add-to-cart');
        const confirmMsg = document.getElementById('add-confirm');
        addBtn.addEventListener('click', () => {
          addBtn.disabled = true;
          fetch('api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ productId: product.id }),
          })
            .then((res) => {
              if (!res.ok) throw new Error('add to cart failed');
              return res.json();
            })
            .then(() => {
              confirmMsg.textContent = 'Added to cart.';
              confirmMsg.classList.add('detail-panel-confirm--visible');
              window.analytics.track('product_added_to_cart', { productId: product.id });
            })
            .catch(() => {
              confirmMsg.textContent = 'Unable to add to cart. Please try again.';
              confirmMsg.classList.add('detail-panel-confirm--visible');
            })
            .finally(() => {
              addBtn.disabled = false;
            });
        });
      })
      .catch(() => {
        detailMain.innerHTML = '<p class="empty-state">Unable to load product.</p>';
      });
  }
}

function renderCart(cart) {
  const main = document.getElementById('cart-main');
  if (!cart.items.length) {
    main.innerHTML = '<h1>Your cart</h1><p class="empty-state">Your cart is empty.</p>';
    return;
  }
  const rows = cart.items
    .map(
      (i) => `
      <tr class="cart-table-row">
        <td class="cart-table-cell">${i.name}</td>
        <td class="cart-table-cell">${i.quantity}</td>
        <td class="cart-table-cell">$${Number(i.unitPrice).toFixed(2)}</td>
        <td class="cart-table-cell">$${Number(i.subtotal).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');
  main.innerHTML = `
    <h1>Your cart</h1>
    <table class="cart-table">
      <thead>
        <tr class="cart-table-row">
          <th class="cart-table-cell cart-table-header">Product</th>
          <th class="cart-table-cell cart-table-header">Qty</th>
          <th class="cart-table-cell cart-table-header">Price</th>
          <th class="cart-table-cell cart-table-header">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="cart-table-row cart-table-total-row">
          <td class="cart-table-cell" colspan="3">Total</td>
          <td class="cart-table-cell">$${Number(cart.total).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

const cartMain = document.getElementById('cart-main');
if (cartMain) {
  fetch('api/cart', { credentials: 'same-origin' })
    .then((res) => {
      if (!res.ok) throw new Error('failed to load cart');
      return res.json();
    })
    .then((cart) => {
      renderCart(cart);
      window.analytics.track('cart_viewed', { count: cart.items.length });
    })
    .catch(() => {
      cartMain.innerHTML = '<h1>Your cart</h1><p class="empty-state">Unable to load cart.</p>';
    });
}

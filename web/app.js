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

        const addBtn = document.getElementById('add-to-cart');
        const confirmMsg = document.getElementById('add-confirm');
        const panel = detailMain.querySelector('.detail-panel');
        addBtn.addEventListener('click', () => {
          addBtn.disabled = true;
          const originalLabel = addBtn.textContent;
          addBtn.textContent = 'Adding…';
          fetch('api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id }),
          })
            .then((res) => {
              if (!res.ok) throw new Error('add to cart failed');
              return res.json();
            })
            .then((cart) => {
              window.analytics.track('product_added_to_cart', { productId: product.id });
              if (panel) panel.classList.add('confirm-visible');
              if (confirmMsg) confirmMsg.style.display = 'block';
              addBtn.textContent = originalLabel;
              addBtn.disabled = false;
            })
            .catch(() => {
              addBtn.textContent = originalLabel;
              addBtn.disabled = false;
              if (confirmMsg) {
                confirmMsg.textContent = 'Unable to add to cart. Please try again.';
                confirmMsg.style.display = 'block';
              }
            });
        });
      })
      .catch(() => {
        detailMain.innerHTML = '<p class="empty-state">Unable to load product.</p>';
      });
  }
}

const cartMain = document.getElementById('cart-main');
if (cartMain) {
  fetch('api/cart')
    .then((res) => {
      if (!res.ok) throw new Error('cart load failed');
      return res.json();
    })
    .then((cart) => {
      if (!cart.items.length) {
        cartMain.innerHTML = `
          <div class="empty-state">
            <h2 class="empty-state-title">Your cart is empty</h2>
            <p class="empty-state-body">Browse the collection and add something you like.</p>
            <a class="btn-primary" href="./products.html">Shop the collection</a>
          </div>
        `;
        return;
      }
      const rows = cart.items
        .map(
          (i) => `
          <tr class="cart-table-row">
            <td class="cart-table-cell">${i.name}</td>
            <td class="cart-table-cell">$${Number(i.unitPrice).toFixed(2)}</td>
            <td class="cart-table-cell">${i.quantity}</td>
            <td class="cart-table-cell">$${Number(i.subtotal).toFixed(2)}</td>
          </tr>
        `
        )
        .join('');
      cartMain.innerHTML = `
        <table class="cart-table">
          <thead>
            <tr class="cart-table-row cart-table-header">
              <th class="cart-table-cell">Product</th>
              <th class="cart-table-cell">Unit price</th>
              <th class="cart-table-cell">Qty</th>
              <th class="cart-table-cell">Subtotal</th>
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
    })
    .catch(() => {
      cartMain.innerHTML = '<p class="empty-state">Unable to load cart.</p>';
    });
}

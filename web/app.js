(function () {
  function renderProducts(products) {
    var grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    products.forEach(function (p) {
      var card = document.createElement('a');
      card.className = 'product-card';
      card.href = './detail.html?id=' + encodeURIComponent(p.id);
      card.innerHTML =
        '<div class="product-card-image">' +
        '<img src="' + p.image + '" alt="' + p.name + '" style="width:100%;height:100%;object-fit:cover;">' +
        '</div>' +
        '<div class="product-card-body">' +
        '<h3 class="product-card-name">' + p.name + '</h3>' +
        '<div class="product-card-price">$' + Number(p.price).toFixed(2) + '</div>' +
        '</div>';
      card.addEventListener('click', function () {
        if (window.analytics) window.analytics.track('product_card_clicked', { productId: p.id });
      });
      grid.appendChild(card);
    });
  }

  var grid = document.getElementById('product-grid');
  if (grid) {
    fetch('products')
      .then(function (res) { return res.json(); })
      .then(renderProducts)
      .catch(function () {
        grid.innerHTML = '<div class="empty-state">Unable to load products.</div>';
      });
  }

  function renderDetail(product) {
    var panel = document.getElementById('detail-panel');
    if (!panel) return;
    document.title = product.name + ' — FourPageStore';
    panel.innerHTML =
      '<div class="detail-panel-image">' +
      '<img src="' + product.image + '" alt="' + product.name + '" style="width:100%;height:100%;object-fit:cover;">' +
      '</div>' +
      '<div class="detail-panel-info">' +
      '<h1 class="detail-panel-name">' + product.name + '</h1>' +
      '<p class="detail-panel-price">$' + Number(product.price).toFixed(2) + '</p>' +
      '<p class="detail-panel-description">' + product.description + '</p>' +
      '<button type="button" class="btn-primary" id="add-to-cart-btn" data-product-id="' + product.id + '">Add to cart</button>' +
      '<p class="detail-panel-confirm" id="add-confirm" role="status"></p>' +
      '</div>';
    if (window.analytics) window.analytics.track('product_detail_viewed', { productId: product.id });
  }

  var detailPanel = document.getElementById('detail-panel');
  if (detailPanel) {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (id) {
      fetch('products/' + encodeURIComponent(id))
        .then(function (res) {
          if (!res.ok) throw new Error('not found');
          return res.json();
        })
        .then(renderDetail)
        .catch(function () {
          detailPanel.innerHTML = '<div class="empty-state">Product not found.</div>';
        });
    } else {
      detailPanel.innerHTML = '<div class="empty-state">Product not found.</div>';
    }
  }

  var ctaShop = document.getElementById('cta-shop');
  if (ctaShop) {
    ctaShop.addEventListener('click', function () {
      if (window.analytics) window.analytics.track('landing_cta_clicked', {});
      ctaShop.disabled = true;
      ctaShop.classList.add('btn-primary-done');
      ctaShop.textContent = 'Opening the shop…';
      var status = document.getElementById('cta-status');
      if (status) status.textContent = 'Taking you to the product listing.';
      window.location.href = './listing.html';
    });
  }
})();

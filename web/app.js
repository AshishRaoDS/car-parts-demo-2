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
    fetch('api/store-service/products')
      .then(function (res) { return res.json(); })
      .then(renderProducts)
      .catch(function () {
        grid.innerHTML = '<div class="empty-state">Unable to load products.</div>';
      });
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

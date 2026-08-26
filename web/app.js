(function () {
  function renderProducts(products) {
    var grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    products.forEach(function (p) {
      var card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML =
        '<img src="' + p.image + '" alt="' + p.name + '">' +
        '<h3>' + p.name + '</h3>' +
        '<p>' + p.description + '</p>' +
        '<p>$' + Number(p.price).toFixed(2) + '</p>';
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

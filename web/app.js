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

  fetch('api/store-service/products')
    .then(function (res) { return res.json(); })
    .then(renderProducts)
    .catch(function () {
      var grid = document.getElementById('product-grid');
      if (grid) grid.innerHTML = '<div class="empty-state">Unable to load products.</div>';
    });
})();

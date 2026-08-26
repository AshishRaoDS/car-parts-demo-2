function renderProducts(products) {
  var grid = document.getElementById('product-grid');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = '<div class="empty-state">No products available.</div>';
    return;
  }
  grid.innerHTML = products.map(function (p) {
    return '<a class="product-grid-card" href="./product.html?id=' + p.id + '">' +
      '<img src="' + p.imageUrl + '" alt="' + p.name + '">' +
      '<h3>' + p.name + '</h3>' +
      '<p>$' + p.price + '</p>' +
      '</a>';
  }).join('');
}

function loadProducts() {
  var grid = document.getElementById('product-grid');
  if (!grid) return;
  fetch('api/products')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load products');
      return res.json();
    })
    .then(renderProducts)
    .catch(function () {
      grid.innerHTML = '<div class="empty-state">Unable to load products.</div>';
    });
}

document.addEventListener('DOMContentLoaded', loadProducts);

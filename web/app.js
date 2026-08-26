window.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("product-grid");
  if (!grid) return;

  fetch("api/products")
    .then(function (res) {
      if (!res.ok) throw new Error("failed to load products");
      return res.json();
    })
    .then(function (products) {
      if (window.Analytics) window.Analytics.track("products_loaded", { count: products.length });
      if (!products.length) {
        grid.innerHTML =
          '<div class="empty-state"><p class="empty-state-title">No products available</p></div>';
        return;
      }
      grid.innerHTML = products
        .map(function (p) {
          return (
            '<a class="product-grid-card" href="product.html?id=' +
            encodeURIComponent(p.id) +
            '">' +
            '<img class="product-grid-image" src="' +
            p.thumbnail +
            '" alt="' +
            p.name +
            '" />' +
            '<div class="product-grid-body">' +
            '<p class="product-grid-name">' +
            p.name +
            '</p>' +
            '<p class="product-grid-price">$' +
            p.price +
            '</p>' +
            '</div></a>'
          );
        })
        .join("");
    })
    .catch(function () {
      grid.innerHTML =
        '<div class="empty-state"><p class="empty-state-title">Unable to load products</p></div>';
    });
});

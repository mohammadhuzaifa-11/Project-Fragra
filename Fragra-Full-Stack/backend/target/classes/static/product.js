'use strict';
let currentProduct = null, quantity = 1;
function changeQty(delta) {
    quantity = Math.max(1, Math.min(20, Math.min(currentProduct?.stock || 20, quantity + delta)));
    document.getElementById('qty').textContent = quantity;
}
function showCartPopup() {
    const el = document.getElementById('cartPopup'); el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
}
function addToCart() {
    if (!currentProduct || currentProduct.stock < 1) return;
    fragraAddToCart(currentProduct.id, quantity); showCartPopup();
}
function buyNow() {
    if (!currentProduct || currentProduct.stock < 1) return;
    sessionStorage.setItem('fragraInstantBuy', JSON.stringify([{ productId: currentProduct.id, quantity }]));
    if (fragraRequireAuth('checkout.html')) location.href = 'checkout.html';
}
(async function () {
    const id = new URLSearchParams(location.search).get('id') || '1';
    const error = document.createElement('p'); error.style.cssText = 'text-align:center;color:#c084fc;padding:15px';
    document.querySelector('.product-container')?.before(error);
    try {
        currentProduct = await fragraRequest('/products/' + encodeURIComponent(id));
        document.title = currentProduct.name + ' | Fragra';
        document.querySelector('.product-image img').src = currentProduct.image || 'logo.png';
        document.querySelector('.product-image img').alt = currentProduct.name;
        document.querySelector('.product-image img').onerror = function () { this.onerror = null; this.src = 'logo.png'; };
        document.querySelector('.product-details h3').textContent = currentProduct.brand;
        document.querySelector('.product-details h1').textContent = currentProduct.name;
        document.querySelector('.rating').textContent = currentProduct.stock > 0 ? 'In stock · ' + currentProduct.size : 'Currently out of stock';
        document.querySelector('.description').textContent = currentProduct.description || '';
        document.querySelector('.product-features').innerHTML = `<p><b>Brand:</b> ${fragraEscape(currentProduct.brand)}</p><p><b>Fragrance:</b> ${fragraEscape(currentProduct.fragrance)}</p><p><b>Category:</b> ${fragraEscape(currentProduct.category)}</p><p><b>Size:</b> ${fragraEscape(currentProduct.size)}</p><p><b>Availability:</b> ${currentProduct.stock > 0 ? 'In stock' : 'Out of stock'}</p>`;
        const discount = currentProduct.mrp > currentProduct.price ? Math.round((currentProduct.mrp - currentProduct.price) / currentProduct.mrp * 100) : 0;
        document.querySelector('.product-price .discount').textContent = discount ? discount + '% OFF' : 'FRAGRA';
        document.querySelector('.product-price del').textContent = discount ? fragraRupees(currentProduct.mrp) : '';
        document.querySelector('.product-price h2').textContent = fragraRupees(currentProduct.price);
        for (const b of document.querySelectorAll('.cart-btn,.buy-btn')) { b.disabled = currentProduct.stock < 1; if (currentProduct.stock < 1) b.style.opacity = '.5'; }
        const back = document.querySelector('.product-navbar a[href="dior.html"]');
        if (back) back.href = 'catalog.html?brand=' + encodeURIComponent(currentProduct.brand);
    } catch (e) { error.textContent = e.message; document.querySelector('.product-container').style.display = 'none'; }
})();

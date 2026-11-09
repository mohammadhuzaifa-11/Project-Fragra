'use strict';
let catalogMap = new Map();
async function displayCart() {
    const wrap = document.getElementById('cartItems');
    try {
        const all = await fragraRequest('/products'); catalogMap = new Map(all.map(p => [p.id, p]));
        const cart = fragraCart(); let subtotal = 0;
        wrap.innerHTML = '';
        if (!cart.length) { wrap.innerHTML = '<h2 class="empty-cart">Your cart is empty! <a href="catalog.html">Explore perfumes</a></h2>'; }
        for (const [idx, item] of cart.entries()) {
            const p = catalogMap.get(item.productId); if (!p) continue;
            const amount = Number(p.price) * item.quantity; subtotal += amount;
            const row = document.createElement('div'); row.className = 'cart-product';
            row.innerHTML = `<img alt="${fragraEscape(p.name)}" src="${fragraEscape(p.image || 'logo.png')}"><div class="product-info"><h2>${fragraEscape(p.name)}</h2><p>Price: ${fragraRupees(p.price)}</p><div class="quantity"><button data-index="${idx}" data-qty="-1">−</button><span>${item.quantity}</span><button data-index="${idx}" data-qty="1">+</button></div><p class="item-total">Total: ${fragraRupees(amount)}</p><button class="remove-btn" data-remove="${idx}">Remove</button>${item.quantity > p.stock ? '<p style="color:#bb2525">Only ' + p.stock + ' available</p>' : ''}</div>`;
            row.querySelector('img').onerror = function () { this.onerror = null; this.src = 'logo.png'; };
            wrap.appendChild(row);
        }
        document.getElementById('subtotal').textContent = fragraRupees(subtotal);
        document.getElementById('total').textContent = fragraRupees(subtotal);
    } catch (err) { wrap.textContent = err.message; }
}
function changeQuantity(index, delta) {
    const cart = fragraCart(); if (!cart[index]) return;
    const product = catalogMap.get(cart[index].productId);
    const maximum = Math.min(20, product?.stock || 20);
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    else cart[index].quantity = Math.min(maximum, cart[index].quantity);
    fragraSaveCart(cart); displayCart();
}
function removeItem(index) { const cart = fragraCart(); cart.splice(index, 1); fragraSaveCart(cart); displayCart(); }
function checkout() {
    if (!fragraCart().length) return alert('Your cart is empty!');
    sessionStorage.removeItem('fragraInstantBuy');
    if (fragraRequireAuth('checkout.html')) location.href = 'checkout.html';
}
document.getElementById('cartItems').addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn) return;
    if (btn.dataset.remove !== undefined) removeItem(Number(btn.dataset.remove));
    else if (btn.dataset.qty) changeQuantity(Number(btn.dataset.index), Number(btn.dataset.qty));
});
displayCart();

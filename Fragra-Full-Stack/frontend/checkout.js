'use strict';
if (!fragraRequireAuth('checkout.html')) { /* browser is navigating to login */ }
else (async function () {
    const status = document.getElementById('checkoutMessage');
    const form = document.getElementById('checkoutForm');
    let quick = []; try { quick = JSON.parse(sessionStorage.getItem('fragraInstantBuy') || '[]'); } catch { }
    const items = quick.length ? quick : fragraCart();
    if (!items.length) { location.replace('cart.html'); return; }
    try {
        const products = await fragraRequest('/products');
        const catalog = new Map(products.map(p => [p.id, p]));
        let sum = 0;
        const panel = document.getElementById('checkoutItems');
        panel.innerHTML = '';
        for (const item of items) {
            const p = catalog.get(item.productId);
            if (!p) throw new Error('One product is not available. Please update your cart.');
            if (p.stock < item.quantity) throw new Error('Only ' + p.stock + ' available for ' + p.name + '.');
            const total = p.price * item.quantity; sum += total;
            const row = document.createElement('p'); row.textContent = p.name + ' × ' + item.quantity + ' — ' + fragraRupees(total); panel.appendChild(row);
        }
        document.getElementById('checkoutTotal').textContent = fragraRupees(sum);
        const me = await fragraRequest('/auth/me');
        document.getElementById('recipient').value = me.name;
    } catch (e) {
        if (!fragraSignedIn()) { location.replace('login.html?next=checkout.html'); return; }
        fragraSetStatus(status, e.message, true); form.querySelector('button[type="submit"]').disabled = true;
    }
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
        const payload = { recipient: form.elements.recipient.value.trim(), mobile: form.elements.mobile.value.trim(), address: form.elements.address.value.trim(), city: form.elements.city.value.trim(), state: form.elements.state.value.trim(), pincode: form.elements.pincode.value.trim(), paymentMethod: 'COD', items };
        try {
            const order = await fragraRequest('/orders', { method: 'POST', body: JSON.stringify(payload) });
            if (quick.length) sessionStorage.removeItem('fragraInstantBuy');
            else fragraSaveCart([]);
            location.href = 'order-confirm.html?id=' + encodeURIComponent(order.orderId);
        } catch (err) { fragraSetStatus(status, err.message, true); btn.disabled = false; }
    });
})();

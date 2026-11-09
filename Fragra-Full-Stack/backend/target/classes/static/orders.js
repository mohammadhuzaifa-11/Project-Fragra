'use strict';
(async function () {
    if (!fragraRequireAuth('orders.html')) return;
    const root = document.getElementById('ordersList');
    try {
        const orders = await fragraRequest('/orders');
        root.innerHTML = '';
        if (!orders.length) { root.innerHTML = '<p>No orders yet. <a href="catalog.html">Explore perfumes</a></p>'; return; }
        orders.forEach(order => {
            const row = document.createElement('section'); row.className = 'fragra-card';
            row.innerHTML = `<h2>${fragraEscape(order.orderId)}</h2><p>${new Date(order.createdAt).toLocaleString('en-IN')} · ${fragraEscape(order.status)}</p><p>${order.items.map(i => fragraEscape(i.name) + ' × ' + i.quantity).join('<br>')}</p><p><strong>Total: ${fragraRupees(order.total)}</strong> · Cash on Delivery</p><p><a href="order-confirm.html?id=${encodeURIComponent(order.orderId)}">View order</a></p>${order.status === 'PLACED' ? `<button class="fragra-button" data-cancel="${fragraEscape(order.orderId)}">Cancel order</button>` : ''}`;
            root.appendChild(row);
        });
        root.querySelectorAll('button[data-cancel]').forEach(btn => btn.addEventListener('click', async () => {
            if (!confirm('Cancel this order and return its items to inventory?')) return;
            btn.disabled = true;
            try { await fragraRequest('/orders/' + encodeURIComponent(btn.dataset.cancel) + '/cancel', { method: 'POST' }); location.reload(); }
            catch (e) { alert(e.message); btn.disabled = false; }
        }));
    } catch (e) { if (!fragraSignedIn()) { location.replace('login.html?next=orders.html'); return; } root.textContent = e.message; }
})();

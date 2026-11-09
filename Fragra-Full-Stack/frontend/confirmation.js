'use strict';
(async function () {
    const id = new URLSearchParams(location.search).get('id');
    try {
        if (!id) throw new Error('No order selected.');
        if (!fragraRequireAuth('orders.html')) return;
        const order = await fragraRequest('/orders/' + encodeURIComponent(id));
        document.querySelector('h1').textContent = order.status === 'CANCELLED' ? 'Order Cancelled' : 'Order Confirmed!';
        document.getElementById('orderId').textContent = order.orderId;
        document.getElementById('productName').textContent = order.items.map(x => x.name).join(', ');
        document.getElementById('quantity').textContent = order.items.reduce((n, x) => n + x.quantity, 0);
        document.getElementById('total').textContent = Number(order.total).toLocaleString('en-IN');
        document.querySelector('.status').textContent = order.status;
        if (order.status === 'CANCELLED') document.querySelector('h1').textContent = 'Order Cancelled';
    } catch (e) {
        document.querySelector('h1').textContent = 'Order unavailable';
        document.querySelector('.message').textContent = e.message;
        document.querySelector('.order-details').style.display = 'none';
        document.querySelector('.success-icon').style.display = 'none';
    }
})();

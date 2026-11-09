'use strict';
(async function () {
    if (!fragraRequireAuth('account.html')) return;
    try {
        const customer = await fragraRequest('/auth/me');
        document.getElementById('accountName').textContent = customer.name;
        document.getElementById('accountEmail').textContent = customer.email;
    } catch (e) { if (!fragraSignedIn()) { location.replace('login.html?next=account.html'); return; } fragraSetStatus(document.getElementById('accountMessage'), e.message, true); }
})();

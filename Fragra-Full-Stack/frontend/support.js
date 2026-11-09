'use strict';
const supportForm = document.getElementById('supportForm');
const subject = new URLSearchParams(location.search).get('topic');
if (subject === 'gift') document.getElementById('supportMessageText').value = 'I have a question about gift cards: ';
if (subject === 'sell') document.getElementById('supportMessageText').value = 'I would like to enquire about selling on Fragra: ';
supportForm.addEventListener('submit', async e => {
    e.preventDefault(); const btn = supportForm.querySelector('button'); btn.disabled = true;
    try {
        const data = { name: supportForm.elements.name.value, email: supportForm.elements.email.value, message: supportForm.elements.message.value };
        const result = await fragraRequest('/support', { method: 'POST', body: JSON.stringify(data) });
        fragraSetStatus(document.getElementById('supportStatus'), result.message); supportForm.reset();
    } catch (e) { fragraSetStatus(document.getElementById('supportStatus'), e.message, true); } finally { btn.disabled = false; }
});

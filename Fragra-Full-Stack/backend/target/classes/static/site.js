'use strict';
const FRAGRA_API = '/api';
const FRAGRA_TOKEN_KEY = 'fragraToken';
const FRAGRA_CART_KEY = 'fragraCartV2';

function fragraToken() {
    return localStorage.getItem(FRAGRA_TOKEN_KEY) || sessionStorage.getItem(FRAGRA_TOKEN_KEY) || '';
}
function fragraSignedIn() { return Boolean(fragraToken()); }
async function fragraSignOut() {
    const token = fragraToken();
    if (token) { try { await fetch(FRAGRA_API + '/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }); } catch { } }
    localStorage.removeItem(FRAGRA_TOKEN_KEY);
    localStorage.removeItem('fragraName');
    sessionStorage.removeItem(FRAGRA_TOKEN_KEY);
    sessionStorage.removeItem('fragraName');
    location.href = 'Fragra.html';
}
async function fragraRequest(path, options = {}) {
    const headers = { 'Accept': 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
    if (fragraToken()) headers.Authorization = 'Bearer ' + fragraToken();
    let response;
    try { response = await fetch(FRAGRA_API + path, { ...options, headers }); }
    catch { throw new Error('Could not connect to Fragra server. Make sure the Java backend is running.'); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && !path.startsWith('/auth/login')) {
            localStorage.removeItem(FRAGRA_TOKEN_KEY);
            sessionStorage.removeItem(FRAGRA_TOKEN_KEY);
        }
        throw new Error(data.message || 'Request failed. Please try again.');
    }
    return data;
}
function fragraRupees(value) { return '\u20B9' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
function fragraEscape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fragraCart() {
    try {
        let result = JSON.parse(localStorage.getItem(FRAGRA_CART_KEY) || '[]');
        return Array.isArray(result) ? result.filter(x => Number.isInteger(Number(x.productId)) && Number(x.productId) > 0 && Number.isInteger(Number(x.quantity)) && Number(x.quantity) > 0).map(x => ({ productId: Number(x.productId), quantity: Math.min(20, Number(x.quantity)) })) : [];
    } catch { return []; }
}
function fragraSaveCart(cart) {
    localStorage.setItem(FRAGRA_CART_KEY, JSON.stringify(cart));
    document.querySelectorAll('.fragra-count').forEach(x => x.textContent = cart.reduce((n, x) => n + x.quantity, 0));
}
function fragraAddToCart(productId, quantity) {
    const cart = fragraCart(); const existing = cart.find(x => x.productId === Number(productId));
    if (existing) existing.quantity = Math.min(20, existing.quantity + quantity);
    else cart.push({ productId: Number(productId), quantity: Math.min(20, quantity) });
    fragraSaveCart(cart);
}
function fragraRequireAuth(next = 'checkout.html') {
    if (fragraSignedIn()) return true;
    location.href = 'login.html?next=' + encodeURIComponent(next);
    return false;
}
function fragraSetStatus(el, message, error = false) {
    if (!el) return;
    el.textContent = message; el.style.color = error ? '#d33' : '#8f45c2';
}

// Add behavior without changing the original home page's design, logo, or images.
document.addEventListener('DOMContentLoaded', () => {
    const name = localStorage.getItem('fragraName') || sessionStorage.getItem('fragraName');
    const account = document.querySelector('.nav-singin a');
    if (account && fragraSignedIn()) {
        const span = account.querySelector('span');
        if (span) span.textContent = 'Hello, ' + (name || 'customer');
        account.href = 'account.html';
    }
    document.querySelectorAll('.nav-cart').forEach(el => {
        el.setAttribute('role', 'link'); el.tabIndex = 0;
        el.addEventListener('click', () => location.href = 'cart.html');
        el.addEventListener('keydown', e => { if (e.key === 'Enter') location.href = 'cart.html'; });
    });
    document.querySelectorAll('.nav-return').forEach(el => {
        el.style.cursor = 'pointer'; el.tabIndex = 0; el.setAttribute('role', 'link');
        el.onclick = () => location.href = fragraSignedIn() ? 'orders.html' : 'login.html?next=orders.html';
        el.onkeydown = e => { if (e.key === 'Enter') el.click(); };
    });
    const searchInput = document.querySelector('.search-input');
    const searchSelect = document.querySelector('.search-select');
    function doSearch() {
        const q = searchInput?.value.trim() || '';
        const brand = searchSelect?.value || 'All';
        const p = new URLSearchParams(); if (q) p.set('q', q); if (brand !== 'All') p.set('brand', brand);
        location.href = 'catalog.html' + (p.size ? '?' + p.toString() : '');
    }
    document.querySelector('.search-icon')?.addEventListener('click', doSearch);
    searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    const mappings = [
        ['Explore RAYHAAN', 'brand=Rayhaan'], ['Check Dior', 'brand=Dior'], ['Go with JPG', 'brand=JPG'],
        ['Spicy & Vanilla', 'q=Spicy'], ['Compliment King', 'q=Compliment'],
        ['All rounder', 'q=All%20rounder'], ['Bold & Musculine', 'q=All%20rounder'],
        ['Burst of Freeshness', 'q=Fresh'], ['Sweet Fregrance', 'q=Sweet']
    ];
    document.querySelectorAll('.shop-section .box').forEach(box => {
        const heading = box.querySelector('h2')?.textContent.trim() || '';
        const match = mappings.find(m => m[0].toLowerCase() === heading.toLowerCase());
        const a = box.querySelector('a'); if (a) a.href = 'catalog.html' + (match ? '?' + match[1] : '');
    });
    const panels = document.querySelectorAll('.panel-ops p');
    const panelLinks = ['catalog.html', 'support.html', 'login.html?signup=1', 'support.html?topic=gift', 'support.html?topic=sell'];
    panels.forEach((p, i) => { p.style.cursor = 'pointer'; p.tabIndex = 0; p.setAttribute('role', 'link'); p.onclick = () => location.href = panelLinks[i]; p.onkeydown = e => { if (e.key === 'Enter') p.click(); }; });
    // Preserve footer words and layout, but make the original placeholder links navigable.
    const infoPages = {
        'Career': 'careers', 'Blog': 'blog', 'About Fragra': 'about',
        'Investor Relation': 'investors', 'Fragra Device': 'devices', 'Fragra Scinence': 'science',
        'Condition of use': 'terms', 'Privecy notice': 'privacy',
        'Your ads privacy': 'privacy', 'Thanks': 'thanks'
    };
    document.querySelectorAll('.footer-panel1 a,.footer-panel3 .pages a').forEach(el => {
        const topic = infoPages[el.textContent.trim()];
        if (topic) el.href = 'info.html?topic=' + topic;
    });
    for (const [selector, href] of [['.panel-all', 'catalog.html'], ['.panel-deals', 'catalog.html?q=All%20rounder']]) {
        const item = document.querySelector(selector);
        if (item) { item.style.cursor = 'pointer'; item.tabIndex = 0; item.setAttribute('role', 'link'); item.onclick = () => location.href = href; item.onkeydown = e => { if (e.key === 'Enter') item.click(); }; }
    }
    const backToTop = document.querySelector('.footer-panel');
    if (backToTop) { backToTop.style.cursor = 'pointer'; backToTop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' }); }
});

'use strict';
(async function () {
    const params = new URLSearchParams(location.search);
    const fixedBrand = document.body.dataset.brand || '';
    const brand = fixedBrand || params.get('brand') || '';
    const query = params.get('q') || '';
    const heading = document.querySelector('h1');
    const info = document.querySelector('body > p');
    if (heading && !fixedBrand) heading.textContent = brand ? brand + ' Perfume Collection' : 'Explore Fragra Perfumes';
    if (info && !fixedBrand) info.textContent = query ? 'Results for: ' + query : 'Explore our perfume decants and fragrances.';
    const list = document.querySelector('.shop-section');
    if (!list) return;
    list.innerHTML = '<p style="padding:30px;color:#ddd">Loading fragrances...</p>';
    try {
        const p = new URLSearchParams(); if (brand) p.set('brand', brand); if (query) p.set('q', query);
        const products = await fragraRequest('/products' + (p.size ? '?' + p.toString() : ''));
        list.innerHTML = '';
        if (!products.length) { list.innerHTML = '<p style="padding:35px">No fragrances found. <a href="catalog.html" style="color:#c084fc">View all perfumes</a></p>'; return; }
        for (const product of products) {
            const box = document.createElement('div'); box.className = 'box';
            box.innerHTML = `<h2>${fragraEscape(product.name)}</h2><div class="box-img" role="img" aria-label="${fragraEscape(product.name)}"></div><p>Price: ${fragraRupees(product.price)} \u00B7 ${fragraEscape(product.size)}</p><a href="view-product.html?id=${product.id}">View Product</a>`;
            box.querySelector('.box-img').style.backgroundImage = `url(${JSON.stringify(product.image || 'logo.png')})`;
            list.appendChild(box);
        }
    } catch (e) { list.innerHTML = '<p style="padding:30px">' + fragraEscape(e.message) + '</p>'; }
})();

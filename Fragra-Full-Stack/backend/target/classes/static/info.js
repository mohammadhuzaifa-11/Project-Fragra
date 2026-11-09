'use strict';
const topic = new URLSearchParams(location.search).get('topic') || 'about';
const copy = {
    about: ['About Fragra', 'Fragra is an internship project for discovering and ordering affordable perfume decants so customers can sample a scent before purchasing a larger bottle. Prices, availability and product descriptions currently use demonstration data.'],
    terms: ['Conditions of Use', 'This is a local demonstration storefront, not an active commercial marketplace. Product prices and inventory are sample data. Orders use Cash on Delivery only and are saved locally; no real shipping, payment processing, return handling or customer service guarantee is provided.'],
    privacy: ['Privacy Information', 'This demonstration stores your name, email, BCrypt-hashed password, time-limited session, and orders with shipping details in a local H2 database. Your cart and sign-in token are stored in your browser. Support enquiries are stored in H2. No online payment details are collected. This is descriptive demo information, not a formal legal privacy notice.'],
    thanks: ['Thanks for visiting Fragra', 'Explore the perfume collection, add your favourites to cart, or send an enquiry.'],
    careers: ['Careers at Fragra', 'Recruitment is not available through this internship demonstration. Please use the contact form for enquiries.'],
    blog: ['Fragra Blog', 'Blog publishing is not available yet in this demo. Browse the perfume catalog or send us an enquiry.'],
    investors: ['Investor Relations', 'Investor relations are not available through this internship demonstration. Please send questions using the contact form.'],
    devices: ['Fragra Devices', 'Device sales are not part of this perfume decant demonstration. Explore our fragrances instead.'],
    science: ['Fragrance Science', 'Educational articles are not published yet. You can contact Fragra with fragrance questions.']
};
const [title, text] = copy[topic] || copy.about;
document.title = title + ' | Fragra';
document.getElementById('infoTitle').textContent = title;
document.getElementById('infoText').textContent = text;

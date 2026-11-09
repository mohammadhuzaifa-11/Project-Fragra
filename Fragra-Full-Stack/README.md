# Fragra — full-stack Java internship demo

Your original **Fragra.html**, **fragra.css**, **logo.png**, **back.png**, and existing homepage pictures are kept. The original homepage layout, theme, and logo have not been redesigned. JavaScript connects it to a real Java backend; all pages are served from one server on port 8080.

## Start on Windows (VS Code)

1. Extract this ZIP to a normal folder, for example `Desktop\Fragra-Full-Stack`.
2. Install **JDK 17 or later** and **Apache Maven**. Test in the VS Code terminal with `java -version` and `mvn -version`.
3. Double-click **START-FRAGRA.bat**, or open the VS Code terminal in `backend` and run `mvn spring-boot:run`.
4. On first launch, Maven downloads Spring Boot/H2 libraries. Internet is needed for Maven dependencies once.
5. When the server reports it started, open **http://localhost:8080/** (or http://localhost:8080/Fragra.html).
6. **Do not open the HTML files by double-clicking them** (`file://`), and do not use VS Code Live Server for the main app. The Java server serves the HTML and API on the same origin.
7. To stop the app, press **Ctrl+C** in the terminal. The database remains saved.

## What works

- Guest shopping: homepage, product collections and search, product details.
- Sign up (auto-login), login, persistent login session, account page and logout.
- Add to cart with selected quantity; edit quantities and remove items. Guest cart remains in this browser.
- Buy Now, cart checkout, authentication required before ordering.
- Delivery name/address/mobile/PIN code validation, **Cash on Delivery (COD)** order placement.
- Java server recalculates all prices, validates products and available inventory, and creates persistent database orders.
- Real order confirmation from database, order history, order details and cancellation of newly placed orders (returns stock).
- Support/contact form records enquiries in the backend database.
- REST endpoints: `/api/health`, `/api/products`, `/api/products/{id}`, `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/orders`, `/api/orders/{id}`, `/api/orders/{id}/cancel`, `/api/support`.

## Your perfume images — add later

1. Put your images in **`frontend/perfume-images/`**, for example `my-perfume.jpg`.
2. Open **`backend/src/main/resources/catalog.json`** and change that product's `image` property to `perfume-images/my-perfume.jpg`.
3. In the same JSON file, change the **demo** product names, descriptions, decant sizes, MRPs, prices, and active flags to your actual offerings.
4. Restart the backend. Catalog descriptions/prices/images sync at startup; stock quantities are initially seeded once and then tracked in the database.

To add a new product, copy one JSON object in `catalog.json`, give it a **new unique numeric `id`**, and fill out all properties including initial stock. Editing `stock` in the JSON file does **not** reset existing product inventory; inventory is stored in the database as purchases are made. For a fresh demo, after stopping the server you can remove files beginning with `backend/data/fragra` (this deletes *all* customer accounts and orders too).

**Homepage images and the Fragra logo have not been replaced.** The default product photographs in the starter catalog are the pictures already supplied, used as demo placeholders until you provide final perfume images.

## Folder guide

```
Fragra-Full-Stack/
├── frontend/
│   ├── Fragra.html, fragra.css, logo.png, existing images  # original home
│   ├── login.html, auth.js
│   ├── dior.html, catalog.html, view-product.html, product.js
│   ├── cart.html, cart.js, checkout.html, checkout.js
│   ├── order-confirm.html, orders.html, account.html, support.html
│   └── perfume-images/                                    # add photos here
├── backend/
│   ├── pom.xml                                            # Maven configuration
│   ├── src/main/resources/catalog.json                    # edit products here
│   ├── src/main/resources/application.properties          # database/port
│   ├── src/main/java/com/fragra/                           # Java API + entities
│   └── data/                                              # H2 database, created at runtime
└── START-FRAGRA.bat
```

## Test the app

1. Visit homepage as guest and find a Dior or Rayhaan product.
2. Click Add to Cart, adjust quantity, choose Checkout.
3. Create an account; you will automatically be signed in and returned to checkout.
4. Enter a sample delivery address and choose **Place Order** (COD only).
5. Confirm the order ID appears. Open Account / My Orders and cancel the demo order, then see the new status.
6. Restart the Java backend; your customer and orders remain in H2.

To run backend tests: `cd backend` then `mvn test`.

## Important boundaries

This is a **working local full-stack internship/demo application**, not a deployed commercial store. Products, prices, and stock are example data until you edit them. COD orders are saved but are not automatically shipped. A real online payment gateway, payment verification, delivery courier integration, transactional emails, SMS, gift card issuing, seller accounts, and production administration are **not connected** because they require separate services, credentials, and business setup. Footer corporate links from your original design remain informational placeholders. For a public deployment, you should also configure TLS/HTTPS, a production database, hardened session cookies/CSRF policies, monitoring, backups, rate limits, and operational order management.

### Implementation notes

- Java 17+, Spring Boot 3.4.5, JPA/Hibernate, file-backed H2 database (no MySQL installation required).
- Passwords are hashed with BCrypt; random session tokens are stored only as SHA-256 hashes in the database and expire after seven days.
- Products and order totals are validated on the server, so editing local cart prices cannot change an order total.
- The browser stores its guest cart locally; customer accounts and orders are stored in H2.
- `/api` URLs and the frontend are served together by Spring Boot. Maven copies the `frontend/` resources into the build output when the app starts. Restart the server after modifying frontend source files to ensure changes are reflected.

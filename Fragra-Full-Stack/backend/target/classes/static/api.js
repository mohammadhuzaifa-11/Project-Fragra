const API_URL = "http://localhost:8080/api";

async function getProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const products = await response.json();

        console.log("Connected to Java backend!");
        console.log("Products:", products);

    } catch (error) {
        console.error("Connection failed:", error);
    }
}

getProducts();
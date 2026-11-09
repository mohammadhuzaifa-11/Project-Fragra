document.addEventListener("DOMContentLoaded", function () {

    console.log("Zomato Clone Loaded ");

    const searchInput = document.querySelector("main input");
    const header = document.querySelector("header");


    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            let value = searchInput.value.trim();

            if (value === "") {
                alert("Please enter something to search!");
            } else {
                alert("Searching for: " + value);
            }
        }
    });


    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
            header.style.backgroundColor = "#e23744";
        } else {
            header.style.backgroundColor = "transparent";
        }
    });


    const categories = document.querySelectorAll(".category-card");

    categories.forEach(category => {
        category.addEventListener("click", function () {
            alert("You selected: " + category.innerText);
        });
    });


    const restaurants = document.querySelectorAll(".restaurant-card");

    restaurants.forEach(restaurant => {
        restaurant.addEventListener("click", function () {
            alert("Opening " + restaurant.querySelector("h3").innerText);
        });
    });

    const subscribeBtn = document.getElementById("subscribeBtn");
    const emailInput = document.getElementById("emailInput");

    if (subscribeBtn) {
        subscribeBtn.addEventListener("click", function () {

            const email = emailInput.value.trim();

            if (email === "") {
                alert("Please enter your email!");
                return;
            }

            if (!email.includes("@") || !email.includes(".")) {
                alert("Enter a valid email address!");
                return;
            }

            alert("Subscribed successfully with " + email);
            emailInput.value = "";
        });
    }

});

//this part of the script gets the username of the currently autheticated user and gets the username
//then replaces the USERNAME placeholder in the dom the the real username
window.addEventListener("load", function () {
    //getting the username
    authenticate(getCookie("remember")).then(function (exists) {
        if (exists == true) {
            //this route in the server accepts the cookie then gives the username of the user in the res.username
            fetch("/get-username", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cookie: getCookie("remember") })
            }).then((res) => {
                if (res.ok) return res.json();
            }).then((data) => {
                document.querySelector("#username").innerText = data.username;
            })
        } else {
            window.location.href = "/";
        }
    });

    //getting the cart items
    loadCartItems();
});

function loadCartItems() {
    const cartItems = document.getElementById("cart-items-settings");

    cartItems.innerHTML = ""; //clear the cart DOM

    fetch("/get-cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ cookie: getCookie("remember") })
    }).then(res => {
        if (res.ok) return res.json();
    })
        .then((data) => {
            data.cart.forEach((item, i) => {
                const cartItemContainer = document.createElement("div");
                cartItemContainer.classList.add("cart-item");

                const cartItemDetails = document.createElement("div");
                cartItemDetails.classList.add("cart-item-details");

                const cartItemImage = document.createElement("img");
                cartItemImage.classList.add("cart-item-image");
                cartItemImage.src = "imgs/products/" + data.keys[i] + ".jpg";

                const cartItemDescription = document.createElement("div");
                cartItemDescription.classList.add("cart-item-description");
                cartItemDescription.innerText = item;

                const cartItemCostContainer = document.createElement("div");
                cartItemCostContainer.classList.add("cart-item-cost-container");

                const cartItemCost = document.createElement("div");
                cartItemCost.classList.add("cart-item-cost");
                cartItemCost.innerText = "US $" + data.costs[i] + "ea";

                const cartItemAmount = document.createElement("p");
                cartItemAmount.innerText = "1x";
                cartItemAmount.classList.add("cart-item-quantity");

                const cartItemRemoveButton = document.createElement("img");
                cartItemRemoveButton.classList.add("cart-remove-button");
                cartItemRemoveButton.src = "./imgs/close.png";

                cartItemRemoveButton.onclick = function () {
                    fetch("/remove-cart-item", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ cookie: getCookie("remember"), item: this.parentElement.parentElement.getElementsByClassName("cart-item-description")[0].innerText })
                    }).then(res => {
                        if (res.ok) return res.json();
                    }).then(data => {
                        loadCartItems();
                        //alert(data.message);
                    })
                }

                let itemExists = false;

                for (let j = 0; j < cartItems.children.length; j++) {
                    const child = cartItems.children[j];
                    const d = child.querySelector(".cart-item-description");

                    if (d.innerText == item) {
                        itemExists = true;
                        const quantity = child.querySelector(".cart-item-quantity");
                        quantity.innerText = (Number(quantity.innerText.replaceAll("x", "")) + 1) + "x";
                        const c = child.querySelector(".cart-item-cost");
                        let total = Number(quantity.innerText.replaceAll("x", "")) * Number(data.costs[i]);
                        // c.innerText.replace(/US $.*ea/, '').replaceAll("US $", "").replaceAll("ea", "").replaceAll("Total $", "").split(" ").forEach((item) => { 
                        //     total += Number(data.costs[i]);
                        // });
                        c.innerText = "US $" + data.costs[i] + "ea" + " Total $" + total;
                    }
                }

                if (!itemExists) {
                    cartItems.appendChild(cartItemContainer);
                    cartItemContainer.appendChild(cartItemDetails);
                    cartItemDetails.appendChild(cartItemImage);
                    cartItemDetails.appendChild(cartItemDescription);
                    cartItemContainer.appendChild(cartItemCostContainer);
                    cartItemCostContainer.appendChild(cartItemAmount);
                    cartItemCostContainer.appendChild(cartItemCost);
                    cartItemCostContainer.appendChild(cartItemRemoveButton);
                }
            })

            if (data.cart.length == 0) {
                const emptyCart = document.createElement("div");
                emptyCart.innerText = "Your cart is empty! Time to start shopping!";
                emptyCart.classList.add("empty");
                cartItems.appendChild(emptyCart);
            } else {
                const checkoutButton = document.createElement("button");
                checkoutButton.innerText = "Checkout";
                checkoutButton.classList.add("cart-checkout-button");
                cartItems.appendChild(checkoutButton);

                checkoutButton.onclick = function () {
                    // fetch("/checkout-cart", {
                    //     method: "POST",
                    //     headers: {
                    //         "Content-Type": "application/json"
                    //     },
                    //     body: JSON.stringify({ cookie: getCookie("remember") })
                    // }).then(text => { return text.json() }).then(data => {
                    //     window.location = data.url;
                    // })

                    fetch("/get-checkout-url", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ cookie: getCookie("remember") })
                    }).then((text) => {
                        if (text.ok) {
                            return text.json();
                        }
                    }).then((url) => {
                        window.location.href = url.url;
                    })
                }
            }
        })
}
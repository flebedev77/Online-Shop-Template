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

    fetch("/get-cart", { //ask the server for the user's cart
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ cookie: getCookie("remember") }) //tell the server the user
    }).then(res => {
        if (res.ok) return res.json();
    })
        .then((data) => { //for every item the server sends us
            data.cart.forEach((item, i) => {
                //create a item container
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

                const cartRemoveAmount = document.createElement("input");
                cartRemoveAmount.type = "number";
                cartRemoveAmount.min = "1";
                cartRemoveAmount.max = "100000000";
                cartRemoveAmount.placeholder = "Delete amount";

                const cartItemRemoveButton = document.createElement("img");
                cartItemRemoveButton.classList.add("cart-remove-button");
                cartItemRemoveButton.src = "./imgs/close.png";

                cartItemRemoveButton.onclick = function () {
                    fetch("/remove-cart-item", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ cookie: getCookie("remember"), item: this.parentElement.parentElement.getElementsByClassName("cart-item-description")[0].innerText, deleteAmount: Number(cartRemoveAmount.value) })
                    }).then(res => {
                        if (res.ok) return res.json();
                    }).then(data => {
                        loadCartItems();
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
                        child.querySelector("input").max = quantity.innerText.replaceAll("x", "");
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
                    cartItemCostContainer.appendChild(cartRemoveAmount);
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


//changing username
const newUsernameInput = document.getElementById("change-username-input");
const usernameButton = document.getElementById("username-button");

usernameButton.onclick = function() {
    //check if inputted username is valid the server also checks this
    if (newUsernameInput.value.length <= 100 && newUsernameInput.value.trim() != "") {
        //ask the server to change the username
        fetch("/change-username", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ cookie: getCookie("remember"), username: newUsernameInput.value })
        }).then((res) => {
            if (res.ok) return res.json();
        }).then((data) => {
            setCookie("remember", data.cookie, 1);
            alert(data.message);
            window.location.reload();
        })
    } else if (newUsernameInput.value.length > 100) {
        alert("Username can't be longer than 100 characters");
    } else {
        alert("New username is invalid PS: can't have spaces");
    }
}

//changing password
const oldPasswordInput = document.getElementById("old-password-input");
const newPasswordInput = document.getElementById("new-password-input");
const confirmPasswordInput = document.getElementById("cnfrm-password-input");
const setPasswordButton = document.getElementById("set-password-button");

setPasswordButton.onclick = function() {
    if (newPasswordInput.value == confirmPasswordInput.value) {
        fetch("/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ cookie: getCookie("remember"), oldPassword: oldPasswordInput.value, newPassword: newPasswordInput.value })
        }).then((res) => {
            if (res.ok) return res.json();
        }).then((data) => {
            newPasswordInput.value = "";
            confirmPasswordInput.value = "";
            oldPasswordInput.value = "";
            setCookie("remember", data.cookie, 1);
            alert(data.message);
        });
    } else {
        alert("The confirm password and new passwords dont match");
    }
}
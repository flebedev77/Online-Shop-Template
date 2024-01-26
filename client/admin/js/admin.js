const loginButton = document.getElementById("login-button");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");

const main = document.querySelector("main");
const overview = document.getElementById("overview");

overview.style.display = "none";
main.style.display = "";

loginButton.onclick = function () {
    fetch("/admin-login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    }).then(res => {
        if (res.ok) return res.json()
    }).then((data) => {
        alert(data.message);

        if (data.ok) {
            overview.style.display = "";
            main.style.display = "none";

            setCookie("admin", data.cookie, 1);

            loadOrders(data.data, data.storeItems);
        }
    })
}

function loadOrders(data, storeItems) {
    console.log(storeItems);
    const orderContainer = document.querySelector(".order-container");

    //looping over all the items the person ordered { formDetails: {...}, items: [ { id: 2, quantity: 3 } ] }

    data.forEach((d) => {
        //if of the order in the database
        const entryId = d._id;

        d.items.forEach((item) => {
            const orderItem = document.createElement("span");
            orderItem.classList.add("order");

            const image = document.createElement("img");
            image.src = "../imgs/products/" + item.id + ".jpg";
            image.height = "60";

            const orderInfo = document.createElement("div");
            orderInfo.classList.add("order-info");

            const title = document.createElement("h3");

            const priceContainer = document.createElement("div");
            priceContainer.classList.add("prices-container");

            const orderAmount = document.createElement("p");
            orderAmount.classList.add("order-amount");
            orderAmount.innerText = "x" + item.quantity;

            const eachCost = document.createElement("p");
            eachCost.classList.add("order-amount");

            const totalCost = document.createElement("p");
            totalCost.classList.add("order-amount")

            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");

            const dismiss = document.createElement("button");
            dismiss.innerText = "Dismiss";
            dismiss.id = "dismiss";
            dismiss.entryId = entryId;
            dismiss.itemId = item.id;

            dismiss.onclick = function() {
                fetch("/remove-order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id: this.entryId, cookie: getCookie("admin"), productId: dismiss.itemId })
                }).then((res) => {
                    if (res.ok) return res.json();
                }).then((data) => {
                    if (data.ok) {
                        this.parentElement.parentElement.remove();
                    }
                })
            }

            const view = document.createElement("button");
            view.innerText = "View";
            view.id = "view";

            const hr = document.createElement("hr");

            storeItems.forEach((it) => {
                if (it.id == item.id) {
                    title.innerText = it.name;
                    eachCost.innerText = "AU $" + (it.priceInCents/100);
                    totalCost.innerText = " Total price AU $" + ((it.priceInCents/100) * item.quantity);
                }
            })

            orderContainer.appendChild(hr);

            orderItem.appendChild(image);
            orderItem.appendChild(orderInfo);
            orderInfo.appendChild(title);
            orderInfo.appendChild(priceContainer)
            priceContainer.appendChild(orderAmount);
            priceContainer.appendChild(eachCost);
            priceContainer.appendChild(totalCost);
            orderItem.appendChild(buttonContainer);
            buttonContainer.appendChild(dismiss);
            buttonContainer.appendChild(view);

            orderContainer.appendChild(orderItem);
        })
    })
}
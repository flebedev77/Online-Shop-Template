const loginButton = document.getElementById("login-button");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");

const main = document.querySelector("main");
const overview = document.getElementById("overview");
const orderView = document.getElementById("order-view");

overview.style.display = "none";
orderView.style.display = "none";
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
    const orderContainer = document.querySelector(".order-container");

    //clear the container before loading
    orderContainer.innerHTML = "";

    //looping over all the items the person ordered. data = [{ formDetails: {...}, items: [ { id: 2, quantity: 3 } ] }]

    data.forEach((d) => {
        //if of the order in the database
        const entryId = d._id;
        const formDetails = d.formDetails;

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

            dismiss.onclick = function () {
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

            storeItems.forEach((it) => {
                if (it.id == item.id) {
                    title.innerText = it.name;
                    eachCost.innerText = "AU $" + (it.priceInCents / 100);
                    totalCost.innerText = " Total price AU $" + ((it.priceInCents / 100) * item.quantity);
                }
            })

            const view = document.createElement("button");
            view.innerText = "View";
            view.id = "view";
            view.itemId = item.id;
            view.entryId = entryId;
            view.itemTitle = title.innerText;
            view.itemAmount = item.quantity;
            view.eachCost = eachCost.innerText;
            view.totalCost = totalCost.innerText;

            view.onclick = function () {
                //hide all the screens except for the order view one
                overview.style.display = "none";
                main.style.display = "none";
                orderView.style.display = "";

                //getting the correct image
                document.getElementById("order-view-image").src = "../imgs/products/" + this.itemId + ".jpg";
                //getting the right title
                document.getElementById("product-name-order").innerText = this.itemTitle;
                //getting the right amount
                document.getElementById("order-amount-view").innerText = "x" + this.itemAmount;
                //getting the cost of each item
                document.getElementById("order-each-cost").innerText = this.eachCost;
                //getting the total cost of all the items
                document.getElementById("order-total-cost").innerText = this.totalCost;

                //making the dismiss button work for the correct product
                const overviewDismiss = document.querySelector(".over-dismiss");
                overviewDismiss.entryId = this.entryId;
                overviewDismiss.itemId = this.itemId;

                //keep the element the client is viewing in memory to then delete it if the client pressed the dismiss button
                overviewDismiss.domItem = this.parentElement.parentElement;
                overviewDismiss.onclick = function () {
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
                            this.domItem.remove();
                            overview.style.display = "";
                            main.style.display = "none";
                            orderView.style.display = "none";
                        }
                    })
                }

                //continue filling out shipping information
                const shippingContainer = document.querySelector(".shipping-information-content");
            }

            const hr = document.createElement("hr");

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

//back to overview button working
document.getElementById("back-overview").onclick = function () {
    overview.style.display = "";
    main.style.display = "none";
    orderView.style.display = "none";
}
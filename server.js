require("dotenv").config();
const express = require("express");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
let bodyParser = require('body-parser');

const fs = require("fs");

//change to desired port
const port = 3000;

const storeItems = new Map([
    [1, { priceInCents: 49900, name: "Apple iPhone 12 Pro Max 128GB Unlocked Smartphone - Very Good" }],
    [2, { priceInCents: 16500, name: "Sony WF-1000XM4 Noise Canceling Wireless Earbud Headphones - Silver" }],
    [3, { priceInCents: 157200, name: "Lenovo ThinkPad X1 Carbon Gen 10 Intel Laptop, 14 IPS, i7-1270P vPro®, 32GB" }],
    [4, { priceInCents: 8800, name: "Bose SoundLink Flex SE Bluetooth Waterproof Speaker, Certified Refurbished" }],
    [5, { priceInCents: 31000, name: "Apple iPhone 12 64GB Factory Unlocked AT&T T-Mobile Verizon Excellent Condition" }],
    [6, { priceInCents: 45000, name: "Jordan 1 Retro High OG Chicago Reimagined Lost & Found 2022" }],
    [7, { priceInCents: 269900, name: "Microsoft Surface Laptop Studio i5-16-512 Win11 Platinum" }],
    [8, { priceInCents: 51900, name: "ASRock AMD Radeon RX 6800 Challenger Pro CLP 16G OC Used one year warranty" }],
    [9, { priceInCents: 29900, name: "Lenovo ThinkCentre M720Q Mini Desktop PC i5 8500T 8-16-32GB RAM SSD Win 11 WiFi" }],
]);

//make sure to change to actual domain in production
const URL = `http://127.0.0.1:${port}/`; //my local development ip
const author = "© flebedev77";

const Datastore = require("nedb")
const products = new Datastore({ filename: 'data/products.json', autoload: true });
const accounts = new Datastore({ filename: "data/accounts.json", autoload: true });

app.set("views", "client");
app.set("view engine", "ejs");

app.use(express.static("client"));
app.use(express.json());
app.use(function (err, req, res, next) {
    const allowedOrigins = ['http://127.0.0.1:3000', 'http://192.168.1.109:3000', "http://localhost:3000"];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    //res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

//routes
//home
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
})
//payment cancel page
app.get("/cancel", (req, res) => {
    res.sendFile(__dirname + "/client/cancel.html");
})
//login page
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/client/login.html");
})
//signup page
app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/client/signup.html");
})

//account page
app.get("/account", (req, res) => {
    res.sendFile(__dirname + "/client/account.html");
})

//signup form
app.post("/signup", async (req, res) => {
    console.log("Account created: " + JSON.stringify(req.body));

    let accountValid = true;

    accounts.find({}, function (err, docs) {
        //if there is an account already with the same username don't create a new account
        for (let i = 0; i < docs.length; i++) {
            let data = docs[i];
            if (data.username == req.body.username) {
                accountValid = false;
            }
        }

        if (accountValid == true) {
            const account = {
                username: req.body.username,
                password: req.body.password,
                cart: []
            }
            //generate cookie
            let cookie = req.body.username + ":" + req.body.password;
            //encode cookie
            cookie = Buffer.from(cookie).toString('base64');
            //insert account into database
            accounts.insert(account);
            //respod with sucess
            res.json({ data: "Successfuly created your account!", ok: true, redirect: URL, cookie });
        } else {
            //if there is an account with same name respond with an error
            res.json({ data: "Username taken, please choose another username", ok: false, redirect: URL, cookie: null });
        }
    });
})

//login form
app.post("/login", (req, res) => {
    console.log("Account login " + JSON.stringify(req.body));

    let accountExists = false;

    accounts.find({}, (err, docs) => {
        docs.forEach((data) => {
            if (req.body.username && req.body.password && data.username == req.body.username && data.password == req.body.password) {
                accountExists = true;
            }
        })
        if (accountExists) {
            //generate cookie
            let cookie = req.body.username + ":" + req.body.password;
            //encode cookie
            cookie = Buffer.from(cookie).toString('base64');
            //respod with sucess
            res.json({ data: "Successfuly logged into your account!", ok: true, redirect: URL, cookie });
        } else {
            //if there is an account with same name respond with an error
            res.json({ data: "Username or password wrong", ok: false, redirect: URL, cookie: null });
        }
    })
})

//authentication
app.post("/authenticate", (req, res) => {
    //decode base64 authentication cookie
    const cookie = Buffer.from(req.body.cookie, 'base64').toString('ascii');

    //get the username and password into seperate variables
    const username = cookie.split(":")[0];
    const password = cookie.split(":")[1];

    //find the account in the database
    accounts.find({ username, password }, (err, docs) => {
        //if there was an account/s found
        if (docs.length != 0) {
            res.json({ ok: true, message: "Sucessful Authentication" });
        }
        //if account not found respond with authenication failed
        else {
            res.json({ ok: false, message: "Account Not Found " });
        }
    });
})

//Shopping cart stuff
app.post("/add-cart", (req, res) => {
    //decode base64 authentication cookie
    const cookie = Buffer.from(req.body.cookie, 'base64').toString('ascii');

    //get the username and password into seperate variables
    const username = cookie.split(":")[0];
    const password = cookie.split(":")[1];

    accounts.find({ username, password }, (err, docs) => {
        docs.forEach((doc) => {
            const combinedCart = doc.cart;
            for (let i = 0; i < Number(req.body.quantity); i++) {
                combinedCart.push(req.body.cart);
            }
            accounts.update({ username, password }, { username, password, cart: combinedCart }, {}, function (err, num) {
                console.log("Added " + JSON.stringify(req.body.cart) + " to " + username);
                res.json({ message: "sucess" })
            })
        })
    })
})

app.post("/get-cart", (req, res) => {
    //decode base64 authentication cookie
    const cookie = Buffer.from(req.body.cookie, 'base64').toString('ascii');

    //get the username and password into seperate variables
    const username = cookie.split(":")[0];
    const password = cookie.split(":")[1];

    accounts.find({ username, password }, (err, docs) => {
        docs.forEach((doc) => {
            if (doc.cart) {
                const cart = doc.cart.map((item) => {
                    return storeItems.get(Number(item)).name;
                })
                const costs = doc.cart.map((item) => {
                    return storeItems.get(Number(item)).priceInCents / 100;
                })
                const keys = doc.cart.map((item) => {
                    return item
                })
                res.json({ cart, costs, keys });
            }
        })
        if (docs.length == 0) {
            res.json({ cart: [], costs: [], keys: [] })
        }
    })
})

app.post("/remove-cart-item", (req, res) => {
    //decode base64 authentication cookie
    const cookie = Buffer.from(req.body.cookie, 'base64').toString('ascii');

    //get the username and password into seperate variables
    const username = cookie.split(":")[0];
    const password = cookie.split(":")[1];

    accounts.find({ username, password }, (err, docs) => {
        docs.forEach((doc) => {
            //get the product id from name
            let id = 0;
            let combinedCart = doc.cart;
            let deletedOne = false;
            storeItems.forEach((value, i) => {
                if (value.name == req.body.item) id = i;
            })

            //make a new array which will be the new cart items and find an item with the is specified and delete
            for (let i = doc.cart.length - 1; i >= 0; i--) {
                if (deletedOne) continue;
                let item = doc.cart[i];
                if (item == id) {
                    combinedCart.splice(i, 1);
                    deletedOne = true;
                }
            }

            //update the database and respond
            accounts.update({ username, password }, { username, password, cart: combinedCart }, {}, function (err, num) {
                console.log("Removed " + JSON.stringify(id) + " to " + username);
                res.json({ message: "Sucessfully removed the item " });
            })
        })
    })
})

//route for an item
app.get("/items/:productName", (req, res) => {
    let result = req.params.productName.replaceAll("_", " ").replaceAll("&amp;", "&");
    let itemCost = Infinity;
    let itemName = "";
    let currentItemId = 1;

    for (let i = 1; i < storeItems.size + 1; i++) {
        let item = storeItems.get(i);
        if (item.name == result) {
            itemCost = item.priceInCents;
            currentItemId = i;
            itemName = item.name;
        }
    }

    if (itemCost == Infinity) {
        result = Number(result);
        if (result != null) {
            let item = storeItems.get(result);
            if (item != null) {
                itemCost = item.priceInCents;
                currentItemId = result;
                itemName = item.name;
            }
        }
    }

    let description = "This item has no description";

    if (itemCost != Infinity) {
        if (result != null) {
            if (fs.existsSync(__dirname + "/product_descriptions/" + result)) {
                fs.readFile(__dirname + "/product_descriptions/" + result, 'utf8', (err, data) => {
                    description = data;

                    res.render("product", {
                        itemName,
                        URL,
                        itemCost,
                        itemId: currentItemId,
                        author,
                        description: description
                    });
                })
            } else {
                res.render("product", {
                    itemName,
                    URL,
                    itemCost,
                    itemId: currentItemId,
                    author,
                    description: description
                });
            }
        }
    }
});

//route for checkout
app.get("/checkout/:item", (req, res) => {
    //example url "ebay.com/checkout/1$quantity=2,3$quantity=5"
    const params = req.params.item.split("$quantity=");
    params[1] = params[1].split(",")[0];

    //TODO make total price and quantity appear on checkout page
    let totalPrice = 0;
    let totalQuantity = 0;

    let items = req.params.item.split(",");
    items.splice(0, 1);
    items = items.map((item) => {
        let parts = item.split("$quantity=");
        let name = "";
        let price = 0;
        storeItems.forEach((storeItem, id) => {
            if (id == parts[0]) {
                name = storeItem.name;
                price = storeItem.priceInCents;
            }
        })
        return {
            id: parts[0],
            quantity: parts[1],
            name,
            price
        }
    })

    let price = Infinity;
    let name = Infinity;
    storeItems.forEach((item, i) => {
        if (i == params[0]) {
            price = item.priceInCents;
            name = item.name;
        }
    })

    if (price != Infinity && params[1].trim() != "" && params[1] != null) {
        items.forEach((item) => {
            totalPrice += Number(item.price) * Number(item.quantity);
            totalQuantity += Number(item.quantity);
        })
        totalQuantity += Number(params[1]);
        totalPrice += Number(price) * Number(params[1]);

        res.render("checkout", {
            itemName: name,
            URL,
            quantity: Number(params[1]),
            price,
            items: JSON.stringify(items),
            id: params[0],
            totalPrice,
            totalQuantity
        });
    } else {
        res.render(__dirname + "/client/404.ejs", {
            URL,
            author
        });
    }
})

//route for search
app.get("/search/:search", (req, res) => {
    let items = [];
    const search = req.params.search.replaceAll("'", "").replaceAll('"', "").replaceAll("_", " ");

    storeItems.forEach((item, id) => {
        if (item.name.toLowerCase().includes(search.toLowerCase())) {
            items.push({
                name: item.name,
                priceInCents: item.priceInCents,
                id
            });
        }
    })
    res.render("search", {
        URL,
        search,
        items: JSON.stringify({ items })
    });
})

//checkout
app.post("/checkout-cart", async (req, res) => {


    return
    //decode base64 authentication cookie
    const cookie = Buffer.from(req.body.cookie, 'base64').toString('ascii');

    //get the username and password into seperate variables
    const username = cookie.split(":")[0];
    const password = cookie.split(":")[1];

    accounts.find({ username, password }, async (err, docs) => {
        docs.forEach(async (doc) => {
            let addedItems = "";
            let cart = doc.cart.map((id) => {
                let q = 0;

                doc.cart.forEach((j) => {
                    if (j == id) {
                        q++;
                    }
                })

                if (!addedItems.includes(id)) {
                    addedItems += id;
                    return { id, quantity: q };
                }
                return { id: -100, quantity: -100 };
            })
            for (let i = cart.length - 1; i >= 0; i--) {
                if (cart[i].id == -100) cart.splice(i, 1);
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: cart.map(item => {
                    const storeItem = storeItems.get(Number(item.id))
                    return {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: storeItem.name,
                            },
                            unit_amount: storeItem.priceInCents,
                        },
                        quantity: item.quantity,
                    }
                }),
                success_url: `${URL}success.html`,
                cancel_url: `${URL}`,
            })
            accounts.update({ username, password }, { username, password, cart: [] }, {}, function (err, num) {
                res.json({ url: session.url })
            })
        })
    })
})

//gets items from specified account and generetes a checkout link
app.post("/get-checkout-url", (req, res) => {
    //decode base64 authentication cookie
    const cookie = Buffer.from(req.body.cookie, 'base64').toString('ascii');

    //get the username and password into seperate variables
    const username = cookie.split(":")[0];
    const password = cookie.split(":")[1];

    function containsId(arr, id) {
        let found = false;
        let index = 0;
        arr.forEach((arr, i) => {
            if (arr.id == id) {
                index = i;
                found = true;
            }
        })
        return { found, index };
    }
    accounts.find({ username, password }, (err, docs) => {
        docs.forEach((account) => {
            let link = URL + "checkout/";
            let accountItems = [];
            account.cart.forEach((cartItem) => {
                const id = Number(cartItem);
                let result = containsId(accountItems, id);
                if (result.found) {
                    accountItems[result.index].quantity++;
                } else {
                    accountItems.push({
                        id,
                        name: storeItems.get(id).name,
                        priceInCents: storeItems.get(id).priceInCents,
                        quantity: 1
                    })
                }

            })

            accountItems.forEach((accountItem) => {
                link += accountItem.id + "$quantity=" + accountItem.quantity + ",";
            })

            link = link.slice(0, -1);
            res.json({ url: link });
        })
    })
})

app.post("/get-username", (req, res) => {
    //decode the cookie
    const cookie = Buffer.from(req.body.cookie, 'base64').toString('ascii');

    //get the username and password into seperate variables
    const username = cookie.split(":")[0];
    //const password = cookie.split(":")[1];

    //find the user with the specified username
    accounts.findOne({ username: username }, function (err, doc) {
        //error handling
        if (err) {
            console.error(err);
            return;
        }

        res.json({ username: doc.username });
    })
});

app.post("/change-username", (req, res) => {
    //decode the cookie
    const user = decodeCredentialCookie(req.body.cookie); //returns an object with username and password

    const username = user.username;
    const password = user.password;

    //check is the new username is valid
    if (req.body.username.trim() != "" && req.body.username.length <= 100) {
        accounts.update({ username, password }, { username: req.body.username, password }, {}, function (err, num) {
            console.log("Changed username from " + username + " to " + req.body.username);

            //generate new cookie
            let cookie = encodeCookie(req.body.username, password);

            res.json({ message: "Sucessfully changed username to " + req.body.username, cookie });
        })
    }
});

app.post("/change-password", (req, res) => {
    const user = decodeCredentialCookie(req.body.cookie);

    //check if the old password is right
    if (user.password == req.body.oldPassword) {
        accounts.update({ username: user.username, password: user.password }, { username: user.username, password: req.body.newPassword }, {}, function(err, num) {
            res.json({ message: "Sucessfully changed your password", cookie: encodeCookie(user.username, req.body.newPassword) })
        });
    } else {
        //if the password is wrong send the old cookie and tell the user that the password was wrong
        res.json({ message: "Old password wrong", cookie: req.body.cookie });
    }
})

app.post("/create-checkout", async (req, res) => {

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.map(item => {
            const storeItem = storeItems.get(item.id)
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: storeItem.name,
                    },
                    unit_amount: storeItem.priceInCents,
                },
                quantity: item.quantity,
            }
        }),
        success_url: `${URL}success.html`,
        cancel_url: `${URL}`,
    })
    res.json({ url: session.url })
})

app.use((req, res, next) => {
    res.status(404).render(__dirname + "/client/404.ejs", {
        URL,
        author
    });
})

app.listen(port, console.log(`Server listening on port ${port}`));

app.use((err, req, res, next) => {
    res.status(500).render(__dirname + "/client/404.ejs", {
        URL,
        author
    });
})

function decodeCredentialCookie(cookie) {
    //decode the cookie
    const c = Buffer.from(cookie, 'base64').toString('ascii');

    //get the username and password into seperate variables
    const username = c.split(":")[0];
    const password = c.split(":")[1];

    return { username, password };
}

function encodeCookie(username, password) {
    let cookie = username + ":" + password;
    //encode cookie
    return Buffer.from(cookie).toString('base64');
}
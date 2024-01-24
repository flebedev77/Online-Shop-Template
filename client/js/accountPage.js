//this script gets the username of the currently autheticated user and gets the username
//then replaces the USERNAME placeholder in the dom the the real username
window.addEventListener("load", function () {
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
    })
});
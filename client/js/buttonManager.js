async function authenticate(hash) {
    return new Promise((resolve, reject) => {
        const data = {
            cookie: hash
        }
        fetch("/authenticate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(text => { if (text.ok) return text.json() }).then(data => {
            console.log(data.message);
            
            if (data.ok) resolve(true)
            else reject(false)
        });
    })
}

window.onload = function () {
    authenticate(getCookie("remember")).then(function (value) {
        if (value == true) {
            console.log("Account logged in");

            const Login = document.querySelector(".login-button");
            Login.style.display = "none";
        }
    })
}

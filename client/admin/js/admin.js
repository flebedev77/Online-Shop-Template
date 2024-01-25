const loginButton = document.getElementById("login-button");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");

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
            console.log(data.data);
        }
    })
}
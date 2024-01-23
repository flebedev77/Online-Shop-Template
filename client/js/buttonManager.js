//this script is responsible for hiding unessesary buttons
// eg Dont show the login button when logged in

async function authenticate(hash) {
    return new Promise((resolve, reject) => {
        const data = {
            cookie: hash
        }
        fetch("http://" + window.location.host + "/authenticate", {
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
    //returns a list of [Sign up button, My account button, Sign out button]
    const Signup = document.getElementsByClassName("signup-button");

    Signup[1].style.display = "none"
    Signup[2].style.display = "none"

    authenticate(getCookie("remember")).then(function (value) {
        if (value == true) {
            console.log("Account logged in");

            const Login = document.querySelector(".login-button");
            Login.style.display = "none";

            //get the sign up button from the list
            Signup[0].style.display = "none";


            Signup[1].style.display = ""
            Signup[2].style.display = ""
        }
    })
}

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
            else resolve(false)
        });
    })
}
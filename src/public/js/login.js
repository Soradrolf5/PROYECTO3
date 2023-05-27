async function login() {

    const email = document.getElementById("emailLogin").value
    const pass = document.getElementById("passwordLogin").value

    await fetch(`/api/session/login`, {
        method: 'POST',
        body: JSON.stringify({email: `${email}`, password: `${pass}` }),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(result => result.json())
    .then(json => {
        console.log(json);
        location.assign('/products')
    })
}

async function logout() {

    await fetch(`/logout`, {
        method: 'GET'
    })

    location.assign('/login')
}

async function redirectLogin() {

    location.assign('/login')
}

async function redirectRegister() {
    location.assign('/register')
}
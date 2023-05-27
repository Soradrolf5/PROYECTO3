async function register() {

    const registerForm = document.getElementById('registerForm')
    const data = new FormData(registerForm)
    const formInputs={}

    data.forEach((value, key) => formInputs[key] = value)

    await fetch(`/api/session/register`, {
        method: 'POST',
        body: JSON.stringify(formInputs),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(result => result.json())
    .then(json => {
        console.log(json);
        location.assign('/products')
    })
}
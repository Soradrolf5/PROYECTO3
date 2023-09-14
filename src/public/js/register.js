const form = document.getElementById("registerForm");

form.addEventListener('submit', event => {
    event.preventDefault();

    const data = new FormData(form);
    const object = {};

    data.forEach((value, key) => {
        object[key] = value;
    });

    // Validar que la contraseña no esté en blanco
    const password = object['password'];
    if (!password) {
        Swal.fire({
            icon: 'error',
            title: 'Oops, the account wasn\'t created',
            text: 'Password is required'
        });
        return; // Detener el envío de la solicitud si no se proporciona una contraseña
    }

    fetch('/api/session/register', {
        method: 'POST',
        body: JSON.stringify(object),
        headers: {
            'Content-type': 'application/json'
        }
    })
    .then(result => result.json())
    .then(json => {
        if (json.status == 'Ok') {
            Swal.fire({
                icon: 'success',
                title: 'Account created successfully'
            });
            setTimeout(function() {location.replace('/login');}, 900);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops, the account wasn\'t created',
                text: json.message || 'An error occurred'
            });
        }
    });
});
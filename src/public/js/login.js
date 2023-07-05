document.getElementById("loginButton").addEventListener("click", function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    fetch("/api/session/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
      headers: {
        "Content-type": "application/json"
      }
    })
      .then(result => result.json())
      .then(json => {
        console.log(json);
        location.assign("/products");
      });
  });
  
  function logout() {
    fetch("/logout", {
      method: "GET"
    })
      .then(() => {
        location.assign("/login");
      });
  }
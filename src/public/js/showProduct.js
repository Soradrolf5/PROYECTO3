async function showProduct() {
    console.log("ENTRA EN SHOW")
    const prodId = document.getElementById("productId").value
    location.href = `http://localhost:8080/api/products/${prodId}`
}
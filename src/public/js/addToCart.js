async function addToCart() {
    console.log("ENTRA EN EL SCRIPT1")
    const cartId = document.getElementById("cartId").value
    const productId = document.getElementById("productId").innerHTML
    console.log(`CARTID: ${cartId}`)
    const quantity = document.getElementById("quantity").value
    console.log(`QUANTITY: ${quantity}`)

    await fetch(`http://localhost:8080/api/carts/${cartId}/products/${productId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({productQuantity: quantity})
    })
}
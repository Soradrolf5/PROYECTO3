import fs from 'fs'

export default class CartManager {
    constructor() {
        this.path= './files/carts.json'
        this.latestId = 1
        this.carts = []
    }



    async getallCarts() {
        try {
            this.carts = await fs.promises.readFile(this.path)
            if (this.carts.length == 0) {
                this.carts = []
            }
            else {
                this.carts = JSON.parse(this.carts)
            }
            return this.carts

        } catch (error) {
            console.log (`ERROR getting all carts. Msg: ${error}`)
            return {error: `Cannot get all carts. Msg: ${error}`}
        }
    }

   
    async createNewCart() {
        try {
            let newCart = {
                id: 0,
                products: []
            }
            this.carts = await this.getallCarts()
            newCart.id = ++ this.latestId
            this.carts.push(newCart)
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts))

            return newCart

        } catch (error) {
            console.log ("error")
            return "Error"
        } 


    }

    addProductToCart(productId, cart) {
        try{
            let item = cart.products.filter(prod => prod.product == productId)
            if (item.length == 0) {
                cart.products.push({product: productId, quantity: 1})
            }
            else {
                cart.products = cart.products.map(key => {if (key.product == productId) {key.quantity += 1} return key})
            }
            
            return cart
            
        }catch (error) {
            console.log ("error")
        }        
    }
    async getCartById(id) {
        try {
        const carts = await this.getallCarts();
        const cart = carts.find(item => item.id === parseInt(id));
        if (!cart) {
            throw { message: `Cart with ID ${id} not found`, status: 404 };
        }
        return cart;
        } catch (error) {
        console.log(`ERROR getting cart with id ${id}. Msg: ${error.message}`);
        return { error: error.message };
        }
      }

 
    async updateCart(cart, product) {
        try {
            const updatedCart = this.addProductToCart(product.id, cart);
            const allCarts = await this.getallCarts();
            const updatedCarts = allCarts.map(c => c.id === cart.id ? updatedCart : c);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedCarts));
            return updatedCart;
        } catch (error) {
            console.log(`ERROR updating cart ${cart.id}. Msg: ${error}`);
        }
   }
   
}
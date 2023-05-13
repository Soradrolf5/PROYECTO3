import cartModel from "../models/cart.model.js"

export default class Cart {
    constructor() {
    }

    async getallCarts() {
        try {
            return {status: 'successful', value: await cartModel.find()}

        } catch (error) {
            console.log (`ERROR getting all carts. Msg: ${error}`)
            return {status: 'failed', error: `Cannot get all carts. Msg: ${error}`}
        }
    }

    //Creates new cart with the proper id and an empty array of products and adds it to cart file
    async createNewCart() {
        try {
            const newCart = await cartModel.create({});
            
            return {status: 'successful', value: newCart};
        } catch (error) {
            console.log (`ERROR creating cart. Msg: ${error}`)
            return {error: `Cannot create cart. Msg: ${error}`}
        }
    }

    //Gets a cart by a particular id
    async getCartById(id) {
        try{
            let cartById = await cartModel.findById(id)
            if (cartById != null) {
                return {status: 'successful', value: cartById}
            } else { 
                throw new Error(`ID ${id} not found`)
            }
        }
        catch (error) {
            console.log (`ERROR getting cart with id ${id}. Msg: ${error}`)
            return {error: `Cannot get cart with id ${id}. ${error}`}
            
        }
    }

    //Updates a cart with a specific id and a specific product 
    async updateCart(cartId, productId) {
        try {
            let oldCart = (await this.getCartById(cartId)).value

            console.log(`OLDCART: ${oldCart}`)

            oldCart = this.addProductToCart(productId, oldCart)

            console.log(`OLDCARTUPDATED: ${oldCart}`)
            
            let newCart = await cartModel.findOneAndUpdate({_id: `${oldCart._id}`}, oldCart, {new: true})

            console.log(`NEWCART: ${newCart}`)

            return newCart
        }
        catch (error) {
            console.log (`ERROR updating cart ${cartId}. Msg: ${error}`)
        }

    }
   
    //Adds a product into the cart
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
            console.log (`ERROR adding product ${productId}. Msg: ${error}`)
        }        
    }
}

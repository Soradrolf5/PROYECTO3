import cartModel from "../models/cart.model.js"
import mongoose from 'mongoose'
import { ObjectId } from 'mongoose';
export default class Cart {
    constructor() {
    }

    async getallCarts() {
        try {
            let carts = await cartModel.find().lean().populate('products.product')

            return {status: 'successful', value: carts}

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
            return {status: 'failed', error: `Cannot create cart. Msg: ${error}`}
        }
    }

    //Gets a cart by a particular id
    async getCartById(id) {
        try{
            let cartById = await cartModel.findById(id.toString()).lean().populate('products.product');
            if (cartById != null) {
                return {status: 'successful', value: cartById}
            } else { 
                throw new Error(`ID ${id} not found`)
            }
        }
        catch (error) {
            console.log (`ERROR getting cart with id ${id}. Msg: ${error}`)
            return {status: 'failed', error: `Cannot get cart with id ${id}. ${error}`}
            
        }
    }

    //Adds a product into the cart
    addProductToCart(productId, cart, quantity = 1) {
        try{

            let item = cart.products.filter(prod => prod.product._id == productId)
            if (item.length == 0) {
                cart.products.push({product: productId, quantity: quantity})
            }
            else {
                cart.products = cart.products.map(key => {if (key.product._id == productId) {key.quantity += quantity} return key})
            }        
            
            return cart
            
        }catch (error) {
            console.log (`ERROR adding product ${productId}. Msg: ${error}`)
        }        
    }

    deleteProductFromCart(productId, cart) {
        try{

            let item = cart.products.filter(prod => prod.product._id.toString() == productId)
            if (item.length > 0) {
                cart.products = cart.products.filter(prod => prod.product._id.toString() != productId)
            }
            
            return cart
            
        }catch (error) {
            console.log (`ERROR deleting product ${productId}. Msg: ${error}`)
        }        
    }

    //Updates a cart with a specific id and a specific product 
    async updateCart(cartId, productId, prodQuantity = 1, deleteProd = false) {
        try {
            let oldCart = (await this.getCartById(cartId)).value

            if (deleteProd == false) {
                if (typeof productId == 'object') {
                    productId.forEach(prdId => {
                        oldCart = this.addProductToCart(prdId, oldCart)
                    });
                }
                else{
                    oldCart = this.addProductToCart(productId, oldCart, prodQuantity)
                }
            }
            else {
                oldCart = this.deleteProductFromCart(productId, oldCart)
            }

            let newCart = await cartModel.findOneAndUpdate({_id: `${oldCart._id}`}, oldCart, {new: true}).lean().populate('products.product')

            return {status: 'successful', value: newCart}
        }
        catch (error) {
            console.log (`ERROR updating cart ${cartId}. Msg: ${error}`)
            return {status: 'failed', error: `Cannot update cart with id ${cartId}. ${error}`}
        }

    }

    async deleteCart(cartId) {
        try {
            let cartDeleted = await cartModel.findOneAndDelete({_id: `${cartId}`}).lean()
            if (cartDeleted != null) {
                return {status: 'successful', value: `Cart ${cartId} deleted. ${cartDeleted}`}
            }
            else {
                throw new Error (`Cart with id ${id} not found`)
            }
        }
        catch (error) {
            console.log (`ERROR deleting cart ${cartId}. Msg: ${error}`)
            return {status: 'failed', error: `Cannot delete cart with id ${cartId}. ${error}`}
        }
    }

    async emptyCart(cartId) {
        try {
            let cart = (await this.getCartById(cartId)).value

            cart.products = []

            let emptyCart = await cartModel.findOneAndUpdate({_id: `${cart._id}`}, cart, {new: true})

            return {status: 'successful', value: emptyCart}
        }
        catch (error) {
            console.log (`ERROR emptying cart ${cartId}. Msg: ${error}`)
            return {status: 'failed', error: `Cannot empty cart with id ${cartId}. ${error}`}
        }
    }
}

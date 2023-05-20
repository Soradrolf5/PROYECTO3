import {Router} from 'express'
import Cart from '../dao/dbManagers/carts.dbclass.js'
import Product from '../dao/dbManagers/products.dbclass.js'
import mongoose from 'mongoose'

const router = Router()

// let filePathCart = `./files/carts.json`
// let filePathProduct = `./files/products.json`
let cart = new Cart()
let product = new Product()


// Only used for postman test purposes, to check updates and values of existing carts
router.get('/', async (req, res) => {
    const getCart = await cart.getallCarts()
    if (getCart.status == 'successful') {
        res.send(getCart.value)
    }
    else{
        res.send(getCart)
    }
})

router.get('/:cid', async (req, res) => {
    const getCart = await cart.getCartById(req.params.cid)
    if (getCart.status == 'successful') {
        res.send(getCart.value)
    }
    else{
        res.send(getCart)
    }
})

router.post('/', async (req, res) => {
    const newCart = await cart.createNewCart() 
    if (newCart.status == 'successful') {
        res.send(newCart.value)
    }
    else{
        res.send(newCart)
    }
})

router.post('/:cid/product/:pid', async (req, res) => {
    
    let validProduct = await product.getProductById(req.params.pid)
    
    if (validProduct.status == 'successful') {
        const cartExists = await cart.getCartById(req.params.cid)
        if (cartExists.status == 'successful') {
            const updateCart = await cart.updateCart(req.params.cid, req.params.pid)
            res.send(updateCart.value)
        }
        else {
            res.status(404).send(`Cart with id ${req.params.cid} not found`)
        }
        
    }
    else {
        res.status(404).send(`Product with id ${req.params.pid} not found`)
    }
    
})

router.put('/:cid', async (req, res) => {

    const cartUpdated = await cart.updateCart(req.params.cid, req.body.productsIds)
    if (cartUpdated.status == 'successful') {
        res.send(cartUpdated.value)
    }
    else{
        res.send(cartUpdated)
    }
    

})

router.put('/:cid/products/:pid', async (req, res) => {
    
    let validProduct = await product.getProductById(req.params.pid)
    if (validProduct.status == 'successful') {
        const cartExists = await cart.getCartById(req.params.cid)
        if (cartExists.status == 'successful') {
            const updateCart = await cart.updateCart(req.params.cid, req.params.pid, Number(req.body.productQuantity))

            res.send(updateCart.value.products.filter(prod => prod.product._id == req.params.pid))
        }
        else {
            res.status(404).send(cart)
        }
    }
    else {
        res.status(404).send(validProduct)
    }
})

router.delete('/:cid/products/:pid', async (req, res) => {

    let validProduct = await product.getProductById(req.params.pid)
    if (validProduct.status == 'successful') {
        const cartExists = await cart.getCartById(req.params.cid)
        if (cartExists.status == 'successful') {
            const updateCart = await cart.updateCart(req.params.cid, req.params.pid, 1, true)
        
            res.send(updateCart.value)
        }
        else{
            res.send(updateCart)
        }
    }
    else {
        res.status(404).send(`Product with id ${req.params.pid} not found`)
    }
})

router.delete('/:cid', async (req, res) => {
    const emptyCart = await cart.emptyCart(req.params.cid)
    res.send(emptyCart)
})

export default router
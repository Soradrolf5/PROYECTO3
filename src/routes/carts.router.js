import {Router} from 'express'
import Cart from '../dao/dbManagers/carts.dbclass.js'
import Product from '../dao/dbManagers/products.dbclass.js'

const router = Router()

// let filePathCart = `./files/carts.json`
// let filePathProduct = `./files/products.json`
let cart = new Cart()
let product = new Product()

// Only used for postman test purposes, to check updates and values of existing carts
router.get('/', async (req,res) => {
    const getCart = await cart.getallCarts()
    res.send(getCart.value)
})

router.get('/:cid', async (req,res) => {
    const getCart = await cart.getCartById(req.params.cid)
    res.send(getCart.products)
})

router.post('/', async (req, res) => {
    const newCart = await cart.createNewCart() 
    res.send(newCart)
})

router.post('/:cid/product/:pid', async (req,res) => {
    let validProduct = await product.getProductById(req.params.pid)
    
    if (validProduct.status == 'successful') {
        const updateCart = await cart.updateCart(req.params.cid, req.params.pid)
        res.send(updateCart)
    }
    else {
        res.status(404).send(`Product with id ${req.params.pid} not found`)
    }
    
})

export default router
import { Router } from "express";
import Product from "../dao/dbManagers/products.dbclass.js";
import Cart from "../dao/dbManagers/carts.dbclass.js";
import cartModel from "../dao/models/cart.model.js"
import mongoose from 'mongoose';
const pm = new Product();
const cm = new Cart();

const router = Router();
let product = new Product()
let cart = new Cart()

let productsList = []

router.get('/products', async (req,res) => {
    let productsData = (await product.getProducts(req.query.limit, req.query.page, req.query.sort, req.query.query)).payload
    res.render('index', {layout: 'main', productsData})
})

router.get('/carts/:cid', async (req,res) => {
    let cartData = (await cart.getCartById(req.params.cid)).value
    const cartId = cartData._id
    const cartProducts = cartData.products
    res.render('cart', {layout: 'main', cartId, cartData, cartProducts})
})

export default router;
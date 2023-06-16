import express from 'express'
import Product from "../dao/dbManagers/products.dbclass.js";
import Cart from "../dao/dbManagers/carts.dbclass.js";
import cartModel from "../dao/models/cart.model.js"
import { ObjectId } from 'mongoose';
import { cookieExtractor } from '../config/passport.js'
import passport from "passport";
const pm = new Product();
const cm = new Cart();
const router = express.Router()
let product = new Product()
let cart = new Cart()

let productsList = []

router.get('/products', async (req,res) => {

    const isUserLogged = req.session.user ? true : false
    const userLogged = req.session.user
    
    let productsData = (await product.getProducts(req.query.limit, req.query.page, req.query.sort, req.query.query)).payload

    res.render('index', {layout: 'main', productsData, userLogged, isUserLogged})
})

router.get('/carts/:cid', async (req, res) => {
  const cartResponse = await cart.getCartById(req.params.cid.toString()); // Convertir el ID a cadena de texto
  if (cartResponse.status === 'successful') {
    const cartData = cartResponse.value;
    const cartId = cartData._id;
    const cartProducts = cartData.products;
    res.render('cart', { layout: 'main', cartId, cartData, cartProducts });
  } else {
    res.status(404).send('Cart not found');
  }
});

router.get('/', async (req,res) => {
    res.redirect('/login')
})

router.get('/login', async (req,res) => {
    const isUserLogged = req.session.user ? true : false
    const userLogged = req.session.user
    
    res.render('login', {layout: 'main', isUserLogged})
})

router.get("/logout", async (req, res) => {
    
    req.session.destroy();
    res.send("Session logged out");
});

router.get('/register', async (req,res) => {
  const isUserLogged = false
  res.render('register', {layout: 'main', isUserLogged})
})


export default router
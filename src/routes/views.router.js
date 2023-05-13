import {Router} from 'express'
import Product from '../dao/dbManagers/products.dbclass.js';

let filePath = './files/products.json'
const router =  Router()
const pmanager = new Product(`${filePath}`)
let productsList = []



router.get("/", async (req,res) =>  {
    let allProducts = await pmanager.getProducts()
    res.render("index",   {
        title:"Productos",
        products: allProducts
    })
})

router.get('/realtimeproducts', async (req,res) => {
    productsList = await pmanager.getProducts()
    res.render('realTimeProducts', {layout: 'main', productsList})

    
})

router.post('/realtimeproducts', async (req,res) => {
    productsList = await pmanager.getProducts()
    let errorDelete = false

    if (req.query.method == 'DELETE') {
        const prodToDelete = await pmanager.getProductById(Number(req.body.id))

        if (prodToDelete.status == 'successful') {

            const deleteProduct = await pmanager.deleteProduct(Number(req.body.id))
            productsList = productsList.filter(item => item.id != Number(req.body.id))     
            
            res.render('realTimeProducts', {layout: 'main', productsList, errorDelete})
        }
        else {
            errorDelete = true
            const errorMessage = `Product with ID ${Number(req.body.id)} doesn't exist`
            
            res.render('realTimeProducts', {layout: 'main', productsList, errorDelete, errorMessage})
        }

        
    }
    else{

        const productAdded = await pmanager.addProduct(req.body)
        productsList.push(req.body)
        res.render('realTimeProducts', {layout: 'main', productsList})
    }
})

export default router
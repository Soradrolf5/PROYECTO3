import productModel from "../models/product.model.js"
import mongoose from 'mongoose'
export default class Product {
  constructor() {
  }

   //Validates the object sent in product has the property property defined and it is not the id.
   validateProperty(property, product) {
    if ((property == 'id') || !(property in product)) {
        
        throw new Error (`Property ${property} is not valid`)
    }
    
    return true
}

//Get all products in products database. 
//Results con be filtered by limit of documents, the page, sorted by price ascendiong or descending or a particular query sent in {"property": "value"} format
async getProducts(limit = 10, page = 1, sort = undefined, query = {}, baseUrl) {

    let options = {
        limit: `${limit}`,
        page: `${page}`,
        lean: true
    }
    
    if (sort == 'asc' || sort == 'desc') {
        options.sort = {price: `${sort}`}
    }

    if (query.length > 0) {
        query = JSON.parse(query)
    }

    try {
        const products = await productModel.paginate(query, options)

        let response = {
            status: 'success', 
            payload: products.docs, 
            totalPages: products.totalPages, 
            prevPage: products.prevPage, 
            nextPage: products.nextPage, 
            page:products.page, 
            hasPrevPage: products.hasPrevPage, 
            hasNextPage: products.hasNextPage, 
            prevLink: null, 
            nextLink: null
        }

        if (response.hasPrevPage) {
            response.prevLink = `${baseUrl}/?limit=${limit}&page=${page - 1}&sort=${sort}&query=${JSON.stringify(query)}`
        }
        if (response.hasNextPage) {
            response.nextLink = `${baseUrl}/?limit=${limit}&page=${page + 1}&sort=${sort}&query=${JSON.stringify(query)}`
        }
   
        return response
    }
    catch (error) {
        console.log(`ERROR getting all products. Msg: ${error}`)
        return {status: 'error', payload: `${error}`, totalPages: NaN, prevPage: NaN, nextPage: NaN, page:NaN, hasPrevPage: false, hasNextPage: false, prevLink: null, nextLink: null}

    }
}

//Adds a product to the products collection
async addProduct(product) {
    try{
        const productExist = await productModel.findOne({title: `${product.title}`})
        if (productExist == null) {
            const result = await productModel.create(product);
            return {status: 'successful', value: result};
        }
        else {
            throw new Error(`Product already exists. Please use update PUT query instead`) 
        }
        
    }catch (error) {
        console.log (`ERROR adding product ${product}. Msg: ${error}`)
        return {status: 'failed', error: `ERROR adding product ${JSON.stringify(product)}. Msg: ${error}`}
    }        
}

//Get a product by a particular id
async getProductById(id) {
    try{
        let productById = await productModel.findById(id)
        if (productById != null) {
            return {status: 'successful', value: productById}
        } else { 
            throw new Error(`ID ${id} not found`)
        }
    }
    catch (error) {
        console.log (`ERROR getting product with id ${id}. Msg: ${error}`)
        return {status: 'failed', error: `ERROR getting product with id ${id}. Msg: ${error}`}
        
    }
}

//Updates the property with value of a product with matching id  
async updateProduct(id, newValues) {
    try {
        let oldProduct = (await this.getProductById(id)).value

        Object.keys(newValues).forEach(property => {
            if (this.validateProperty(property, oldProduct)) {
                oldProduct[property] = newValues[property]
            }
        });
       
        let productUpdated = await productModel.findOneAndUpdate({_id: `${oldProduct._id}`}, oldProduct)

        return {status: 'successful', value: productUpdated}
    }
    catch (error) {
        return {status: 'failed', error: `there is an invalid property trying to be modified. Msg: ${error}`}
    }

}

//Deletes a product with the id sent
async deleteProduct(id) {
    try {
        let productDeleted = await productModel.findOneAndDelete({_id: `${id}`})
        if (productDeleted != null) {
            return {status: 'successful', value: `Product ${id} deleted. ${productDeleted}`}
        }
        else {
            throw new Error (`Product with id ${id} not found`)
        }
        
    }
    catch (error) {
        console.log (`ERROR deleting product ${id}. Msg: ${error}`)
        return {status: 'failed', error: `ERROR deleting product ${id}. Msg: ${error}`} 
    }
}
}

import productModel from "../models/product.model.js"

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

  //Get all products in products database
  async getProducts(limit = undefined) {
      const products = await productModel.find()

      if (limit != undefined) {
          products = products.slice(0, limit + 1)
      }

      return products
  }

  //Adds a product to the products collection
  async addProduct(product) {
      try{
        const productExist = await productModel.findOne({ code: `${product.code}` })
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

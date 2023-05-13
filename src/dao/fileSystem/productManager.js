import fs from 'fs'


export default class ProductManager {
    constructor() {
        this.path = './files/products.json'
        this.latestId = 1;
        this.products = []
    }
   
 


    async addProduct(newProduct) {
      const { title, description, price, thumbnail, code, stock } = newProduct;
    
      if (!title || !description || !price || !thumbnail || !code || !stock) {
        throw new Error("Error: todos los campos son obligatorios");
      }
    
      // Lee los productos existentes del archivo JSON
      let existingProducts = [];
      try {
        const data = await fs.promises.readFile(this.path);
        existingProducts = JSON.parse(data);
      } catch (err) {
        console.error(`Error al leer el archivo JSON: ${err}`);
        throw err; // re-lanzamos la excepción para que sea capturada en el controlador de la ruta
      }
    
      // Encuentra el ID más grande y establece el valor de latestId
      let maxId = 0;
      existingProducts.forEach(product => {
        if (product.id > maxId) {
          maxId = product.id;
        }
      });
      this.latestId = maxId + 1;
    
      // Verifica si ya existe un producto con el mismo código
      const found = existingProducts.some((product) => product.code === code);
    
      if (found) {
        throw new Error(`Error: Ya existe un producto con el código ${code}`); // lanzamos la excepción indicando que el producto ya existe
      }
    
      // Agrega el nuevo producto a los productos existentes
      const newproduct = {
        title: title,
        description: description,
        price: price,
        thumbnail: thumbnail,
        code: code,
        stock: stock,
        id: this.latestId
      };
      existingProducts.push(newproduct);
    
      // Escribe todos los productos en el archivo JSON
      try {
        await fs.promises.writeFile(this.path, JSON.stringify(existingProducts));
        console.log("Producto agregado con éxito");
      } catch (err) {
        console.error(`Error al escribir en el archivo JSON: ${err}`);
        throw err; // re-lanzamos la excepción para que sea capturada en el controlador de la ruta
      }
    }
    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            const products = JSON.parse(data);
            console.log(products);
            return products;
        } catch (error) {
            console.log(error);
            return;
        }
    }

    
    async getProductById(id) {
      try {
        const data = await fs.promises.readFile(this.path, 'utf-8'); 
        const products = JSON.parse(data);
        const product = products.find(product => product.id === id);
        if (product) {
          return { status: 'successful', value: product };
        } else {
          throw new Error(`Product with id ${id} not found`);
        }
      } catch (error) {
        console.log(`ERROR getting product with id ${id}. Msg: ${error}`);
        return { status: 'failed', error: `ERROR getting product with id ${id}. Msg: ${error}` };
      }
    }

    async updateProduct(productId, updateData) {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        const products = JSON.parse(data);
      
        const index = products.findIndex((product) => product.id === productId);
        if (index === -1) {
          console.log('Error: producto no encontrado');
          return;
        }
      
        // Actualizar los campos especificados en updateData
        for (let field in updateData) {
          if (field in products[index]) {
            products[index][field] = updateData[field];
          }
        }
      
        fs.writeFile(this.path, JSON.stringify(products), (err) => {
          if (err) throw err;
          console.log('Producto actualizado con éxito desde updateProduct');
        });
      }

      async deleteProduct (productId){
        const data = await fs.promises.readFile(this.path, 'utf-8');
        const products = JSON.parse(data);
      
        const deleteItemFilter = products.filter(product => product.id !== productId);
      
        if (deleteItemFilter.length === products.length) {
          console.log(`Error: No se encontró producto con ID ${productId}`);
          return;
        }
      
        fs.writeFile(this.path, JSON.stringify(deleteItemFilter), err => {
          if (err) throw err;
          console.log('Producto borrado con éxito desde deleteProduct');
        });
    }
}
import { tickets as Ticket } from '../dao/factory.js';
import { CartsService as cm, ProductsService as pm } from '../dao/repository/index.js';
import { CustomError, errorCodes, generateErrorInfo } from '../utils/errors.js';

import {faker} from '@faker-js/faker';
import { transport } from '../utils/utils.js';

const tm = new Ticket();

export default class TicketController {
    get = async(req, res, next) => { // Funciona
        req.logger.http(`${req.method} at ${req.url} - ${new Date().toLocaleDateString()}`);

        try {
            let result = await tm.get();
            if (!result) {
                CustomError.createError({name: "No info avaliable", cause: generateErrorInfo.getEmptyDatabase(), code: 3});
                req.logger.warning('La base de datos de tickets está vacía');
            }

            res.send({status: "Ok", payload: result});
        } catch(error) {
            next(error)
        }
    }

    getOne = async(req, res, next) => { // Funciona
        req.logger.http(`${req.method} at ${req.url} - ${new Date().toLocaleDateString()}`);

        try {
            let id = req.params.tid;
            let result = await tm.getOne(id)
            if (result == null) {
                CustomError.createError({statusCode: 404, name: "There is no ticket with that ID", cause: generateErrorInfo.idNotFound(), code: 2});
                req.logger.error(`El ticket ID no es válido: ${id} en ${req.url}`);
            }
            
            res.send({status: "Ok", payload: result});
        } catch (error) {
            next(error);
        }
    }

    post = async (req, res, next) => {
        req.logger.http(`${req.method} at ${req.url} - ${new Date().toLocaleDateString()}`);
    
        try {
            let cid = req.params.cid;
    
            let cart = await cm.getOne(cid);
            let cartProducts = cart.products;
            let ticketTotal = 0;
            let valid = false;
            let ticketItems = []; // Aquí almacenaremos el detalle de la compra
    
            cartProducts.forEach(async (productInCart) => {
                const product = await pm.getOne(productInCart._id);
                
                if (product && productInCart.quantity <= product.stock) {
                    // Realizar la compra del producto y actualizar el stock
                    const currentProduct = product;
                    currentProduct.stock -= productInCart.quantity;
                    ticketTotal += currentProduct.price * productInCart.quantity;
                    pm.put(currentProduct._id, currentProduct);
    
                    // Agregar este producto al detalle de la compra del ticket
                    ticketItems.push({
                        product_id: currentProduct._id,
                        product_name: currentProduct.title, // Usa el campo 'title' para obtener el nombre del producto
                        quantity: productInCart.quantity,
                        unit_price: currentProduct.price,
                    });
    
                    // Eliminar el producto del carrito
                    const index = cart.products.findIndex((item) => item._id.equals(currentProduct._id));
                    if (index !== -1) {
                        cart.products.splice(index, 1);
                    }
                    
                    valid = true;
                }
            });
    
            if (!valid) {
                CustomError.createError({
                    statusCode: 400,
                    name: "There are no products to buy",
                    cause: generateErrorInfo.getEmptyDatabase(),
                    code: 4
                });
                req.logger.error(`No hay productos para comprar en el carrito ${cid}. Ruta ${req.url}`);
            }
    
            cart.products = cartProducts;
            cm.put(cart._id, cart);
    
            let date = new Date(Date.now()).toLocaleString();
            let code = faker.database.mongodbObjectId();
            let user = req.user.user.email;
    
            // Crea el ticket con el detalle de la compra
            tm.post({
                code,
                purchaser: user,
                purchase_datetime: date,
                amount: ticketTotal,
                items: ticketItems, // Aquí asignamos el detalle de la compra al ticket
            });
    
            // Genera la cadena HTML del correo electrónico con detalles de productos
            const ticketHTML = `
                <div style="background-color: black; color: green;">
                    <h1>Tu ticket</h1>
                    <p><strong>Código del ticket:</strong> ${code}</p>
                    <p><strong>Fecha de compra:</strong> ${date}</p>
                    <p><strong>Comprador:</strong> ${user}</p>
                    <p><strong>Total:</strong> ${ticketTotal}</p>
                    <h2>Detalle de la compra:</h2>
                    <ul>
                        ${ticketItems.map(item => `
                            <li>
                                <p><strong>Producto:</strong> ${item.product_name}</p>
                                <p><strong>Cantidad:</strong> ${item.quantity}</p>
                                <p><strong>Precio unitario:</strong> ${item.unit_price}</p>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
    
            try {
                transport.sendMail({
                    from: 'flordaros5@gmail.com',
                    to: user,
                    subject: 'Gracias por comprar',
                    html: ticketHTML,
                });
            } catch (error) {}
    
            res.send({status: "Ok", message: "Hope you like what you bought", payload: `The code of the ticket is ${code} and the total is ${ticketTotal}`});
        } catch(error) {
            next(error);
        }
    }
}
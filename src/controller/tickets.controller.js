import { tickets as Ticket } from '../dao/factory.js';
import { CartsService as cm, ProductsService as pm } from '../dao/repository/index.js';
import { CustomError, errorCodes, generateErrorInfo } from '../utils/errors.js';

import {faker} from '@faker-js/faker';
import { transport } from '../utils/utils.js';
import mongoose from 'mongoose';

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
    
            // ... Resto de tu código ...
    
            cartProducts.forEach(async (productInCart) => {
                const product = await pm.getOne(productInCart._id);
    
                if (product && productInCart.quantity <= product.stock) {
                    // Realizar la compra del producto y actualizar el stock
                    const currentProduct = product;
    
                    // Comprueba si currentProduct._id es un ObjectId y conviértelo si no lo es
                    if (!mongoose.Types.ObjectId.isValid(currentProduct._id)) {
                        currentProduct._id = mongoose.Types.ObjectId(currentProduct._id);
                    }
    
                    // Resto del código para realizar la compra y actualizar el stock
    
                    currentProduct.stock -= productInCart.quantity;
                    ticketTotal += currentProduct.price * productInCart.quantity;
                    pm.put(currentProduct._id, currentProduct);
    
                    // Resto del código...
    
                    // Verifica si productInCart._id es un ObjectId antes de usar equals
                    if (
                        mongoose.Types.ObjectId.isValid(productInCart._id) &&
                        mongoose.Types.ObjectId.isValid(currentProduct._id) &&
                        productInCart._id.equals(currentProduct._id)
                    ) {
                        // Eliminar el producto del carrito
                        const index = cart.products.findIndex((item) =>
                            item._id.equals(currentProduct._id)
                        );
                        if (index !== -1) {
                            cart.products.splice(index, 1);
                        }
                    }
    
                    valid = true;
                }
            });
    
            // Verifica que los datos estén compatibles antes de continuar
            if (!valid || ticketTotal <= 0) {
                CustomError.createError({
                    statusCode: 400,
                    name: "Invalid Purchase Data",
                    cause: "Invalid purchase data or no products to buy",
                    code: 5,
                });
                req.logger.error(
                    `Datos de compra inválidos en el carrito ${cid}. Ruta ${req.url}`
                );
                return res.status(400).send({
                    status: "Error",
                    message: "Invalid purchase data or no products to buy",
                });
            }
    
            // Resto de tu código...
    
            res.send({status: "Ok", message: "Hope you like what you bought", payload: `The code of the ticket is ${code} and the total is ${ticketTotal}`});
        } catch(error) {
            next(error);
        }
    }
}
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
    
            if (!cart || !cart.products || cart.products.length === 0) {
                return res.status(400).send({
                    status: "Error",
                    message: "No products in the cart",
                });
            }
    
            let cartProducts = cart.products;
            let ticketTotal = 0;
            let valid = false;
            let ticketItems = [];
    
            for (const productInCart of cartProducts) {
                const product = await pm.getOne(productInCart._id);
    
                if (product && productInCart.quantity <= product.stock) {
                    const currentProduct = product;
    
                    if (!mongoose.Types.ObjectId.isValid(currentProduct._id)) {
                        currentProduct._id = mongoose.Types.ObjectId(currentProduct._id);
                    }
    
                    currentProduct.stock -= productInCart.quantity;
                    ticketTotal += currentProduct.price * productInCart.quantity;
                    pm.put(currentProduct._id, currentProduct);
    
                    if (
                        mongoose.Types.ObjectId.isValid(productInCart._id) &&
                        mongoose.Types.ObjectId.isValid(currentProduct._id) &&
                        productInCart._id.equals(currentProduct._id)
                    ) {
                        const index = cart.products.findIndex((item) =>
                            item._id.equals(currentProduct._id)
                        );
                        if (index !== -1) {
                            cart.products.splice(index, 1);
                        }
                    }
    
                    valid = true;
    
                    ticketItems.push({
                        product_id: currentProduct._id,
                        product_name: currentProduct.title,
                        quantity: productInCart.quantity,
                        unit_price: currentProduct.price,
                    });
                }
            }
    
            if (!valid || ticketTotal <= 0) {
                return res.status(400).send({
                    status: "Error",
                    message: "Invalid purchase data or no products to buy",
                });
            }
    
            let date = new Date(Date.now()).toLocaleString();
            let code = new mongoose.Types.ObjectId().toHexString();
    
            let user = req.user.user.email;
            const newTicket = {
                code,
                purchaser: user,
                purchase_datetime: date,
                amount: ticketTotal,
                items: ticketItems,
            };
    
            tm.post(newTicket);
    
           
        // Elimina los productos del carrito después de la compra
        cart.products = [];

        // Actualiza el carrito en la base de datos para reflejar que está vacío
        await cm.put(cid, cart);

        try {
            transport.sendMail({
                from: 'flordaros5@gmail.com',
                to: user,
                subject: 'Gracias por comprar',
                html: `
                    <div style="background-color: black; color: green; display: flex; flex-direction: column; justify-content: center;  align-items: center;">
                    <h1>Tu ticket es ${code} y el total es ${ticketTotal}</h1>
                    <p>Fecha de compra: ${date}</p>
                    <p>Usuario: ${user}</p>
                    <h2>Detalle de compra:</h2>
                    <ul>
                        ${ticketItems.map((item) => `<li>${item.product_name} (ID: ${item.product_id}), Cantidad: ${item.quantity}, Precio Unitario: ${item.unit_price}</li>`).join('')}
                    </ul>
                    </div>
                `,
            });
        } catch (error) {}

        res.send({
            status: "Ok",
            message: "Hope you like what you bought",
            payload: `
                thanks ${user}, 
                The code of the ticket is ${code} and the total is ${ticketTotal}. 
                Detalle de compra:
                
                    ${ticketItems.map((item) => `
                        ${item.product_name} (ID: ${item.product_id}),
                        Cantidad: ${item.quantity},
                        Precio Unitario: ${item.unit_price}
                    `).join('')}
                
            `
        });
            
    } catch (error) {
        next(error);
    }
};
}
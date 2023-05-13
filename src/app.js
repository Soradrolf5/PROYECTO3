import express from 'express'
import productsRouter from './routes/products.router.js'
import cartsRouter from './routes/carts.router.js'
import viewsRouter from './routes/views.router.js'
import messageRouter from './routes/messages.router.js';
import {engine} from "express-handlebars"
import __dirname from "../utils.js"
import * as path from "path"
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import Product from './dao/dbManagers/products.dbclass.js'
import Message from './dao/dbManagers/messages.dbclass.js';



const pManager = new Product();
const mManager = new Message();


const app = express();
const PORT = 3030;
const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});


mongoose.connect('mongodb+srv://Soradrolf5:Soradrolf5125@cluster0.somhlid.mongodb.net/')
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(error => {
    console.log(`Cannot connect to database: ${error}`);
    process.exit();
  });

const io = new Server(server); // crea el servidor de sockets

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter)
app.use('/api/messages', messageRouter);
//estructura handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname + "/views"));

//archivos estaticos
app.use("/", express.static(__dirname + "/public"));



let messages = await mManager.getAll();
let products = await pManager.getProducts();


// Eventos socket.io
io.on('connection', socket => {
    console.log("Se inicio la comunicacion");

    socket.on('products', data => { 
        io.emit(data); 
    })

    socket.on("message", data => { 
        mm.addMessage(data);
        messages.push(data);
        
        io.emit('Messages', messages);
    })

    socket.on('authenticated', data => { 
        socket.broadcast.emit('newUserConnected', data);
        socket.emit('Messages', messages);
    })

    socket.emit('products', products);
    
    socket.on('products', data => { 
        products.push(data);
        io.emit('products', products);
    })
})


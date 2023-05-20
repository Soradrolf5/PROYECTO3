import express from 'express'
import productsRouter from './routes/products.router.js'
import cartsRouter from './routes/carts.router.js'
import viewsRouter from './routes/views.router.js'
import messageRouter from './routes/messages.router.js';
import handlebars from 'express-handlebars'
import __dirname from "./utils.js"
import mongoose from 'mongoose';


const app = express();
const PORT = 3030;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

mongoose.connect('mongodb+srv://Soradrolf5:Soradrolf5125@cluster0.somhlid.mongodb.net/')
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(error => {
    console.log(`Cannot connect to database: ${error}`);
    process.exit();
  });



app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter)
app.use('/api/messages', messageRouter);
//estructura handlebars
app.engine('handlebars', handlebars.engine());
app.set("views", __dirname+"/views");
app.set("view engine", 'handlebars');

//archivos estaticos
app.use(express.static(__dirname + "/public"));







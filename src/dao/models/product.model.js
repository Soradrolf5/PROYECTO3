import mongoose from "mongoose"

const productsCollection = 'products'

const productSchema = new mongoose.Schema({
    id: mongoose.ObjectId,
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    price: { 
        type: Number,
        required: true
    },
    status: Boolean,
    stock: {
        type: Number,
        required: true
    },
    category: String,
    thumbnails: {
        type: [String],
        required: true,
        default: []
    }
})

const productModel = mongoose.model(productsCollection, productSchema)

export default productModel
import mongoose from "mongoose";


const messagesCollection = 'messages'

const messageSchema = new mongoose.Schema({
    id: mongoose.ObjectId,
    content: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    date: {
        type: Date
    }
})

const messageModel = mongoose.model(messagesCollection, messageSchema)

export default messageModel
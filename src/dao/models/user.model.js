import mongoose from "mongoose"



const usersCollection = 'users'

const userSchema = new mongoose.Schema({
    id: mongoose.ObjectId,
    first_name: String,
    last_name: String,
    age: Number,
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    cart: {
        type: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'carts'
            }
        ],
        default: []
    },
    role: {
        type: String,
        default: "user"
    }

})

const userModel = mongoose.model(usersCollection, userSchema)

export default userModel
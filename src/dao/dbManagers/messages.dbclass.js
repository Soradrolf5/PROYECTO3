import messageModel from "../models/messages.model.js"
import mongoose from 'mongoose'
export default class Message {
    constructor() {
    }

    //Get all products in products database
    async getMessages() {
        return await messageModel.find()
    }

    //Adds a product to the products collection
    async addMessage(message) {
        try{
            const currentDate = new Date()
            message.date = currentDate
            const newMessage = await messageModel.create(message);
            return {status: 'successful', value: newMessage};
            
        }catch (error) {
            console.log (`ERROR adding message ${message}. Msg: ${error}`)
            return {status: 'failed', error: `ERROR adding new message ${JSON.stringify(message)}. Msg: ${error}`}
        }        
    }
}
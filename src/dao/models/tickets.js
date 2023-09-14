import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ticketsCollection = 'tickets';

const ticketSchema = new mongoose.Schema({
    purchaser: String,
    purchase_datetime: String,
    amount: Number,
    code: {
        type: String,
        unique: true
    },
    items: [{
        product_id: mongoose.Schema.Types.ObjectId,
        product_name: String,
        quantity: Number,
        unit_price: Number,
    }],
});

const ticketsModel = mongoose.model(ticketsCollection, ticketSchema);

export default ticketsModel;
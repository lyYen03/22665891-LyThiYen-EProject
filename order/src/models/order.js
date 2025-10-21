const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true }, // 🔹 thêm dòng này
    products: [{
        _id: String,
        name: String,
        price: Number,
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'orders' });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
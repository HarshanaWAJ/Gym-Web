const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema ({
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    payment: {
        type: Number,
        required: true
    },
    card_holder: {
        type: String,
        required: true
    },
    card_number: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('Payment', paymentSchema);
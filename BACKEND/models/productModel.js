const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    catrgory:{
        type: String,
        required: true,
    },
    qty:{
        type: Number,
        required: true,
        default: 0,
    },
    date_of_purchase: {
        type: Date,
        default: Date.now,
    },
    expiry_date: {
        type: Date,
        required: true,
    },
    img_url: {
        type: String,
        required: true,
    },

})

module.exports = mongoose.model('Product', productSchema);
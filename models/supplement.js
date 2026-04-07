const mongoose = require('mongoose');

const SupplementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    ingredients: {
        type: [String],
        required: true
    },
    usage: {
        type: String,
        required: true
    },
    availableStock: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // linked to Category model
}, { timestamps: true });

module.exports = mongoose.model('Supplement', SupplementSchema);

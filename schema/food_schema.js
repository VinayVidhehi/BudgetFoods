
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    id: {
        type: String,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    price: {
        type: Number,
    },
    ingredients: {
        type: [String],
    },
    allergens: {
        type: [String],
    },
    calories: {
        type: Number,
    },
    image: {
        type: String,
    },
    origin: {
        type: String,
    }
    });

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;

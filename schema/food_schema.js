const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodSchema = new Schema({
    foodId: {
        type: String,
        required: true,
        unique: true // Ensure foodId is unique
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    restaurant: {
        type: Schema.Types.ObjectId, // Reference to the Restaurant schema
        ref: 'Restaurant' // The model name of the referenced schema
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

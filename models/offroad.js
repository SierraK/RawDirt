const mongoose = require("mongoose");

// SCHEMA
const offroadSchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    price: String,
    location: String,
    lat: Number,
    lng: Number,
    vin: String,
    odometer: Number,
    make: String,
    makeModel: String,
    createdAt: {type: Date, default: Date.now},
    description: String,
    title: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]  
});
module.exports = mongoose.model("Offroad", offroadSchema);
const { Schema, model } = require('mongoose');

module.exports.Profile = model('Profile', Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    phone: Number,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postcode: Number,
    country: String
}, {timestamps: true}));
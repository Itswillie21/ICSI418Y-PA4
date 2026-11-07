const mongoose = require("mongoose");

// Structure for users stored in MongoDB
const userSchema = new mongoose.Schema({
    f_name: {
        type: String,
        required: true
    },

    l_name: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
});

// Make the User model available to the server
module.exports = mongoose.model("User", userSchema);
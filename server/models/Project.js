const mongoose = require("mongoose");

// Structure for projects stored in MongoDB
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true,
        enum: ["Planning", "Active", "Completed"]
    },

    project_lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

// Make the Project model available to the server
module.exports = mongoose.model("Project", projectSchema);
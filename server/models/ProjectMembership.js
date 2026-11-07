const mongoose = require("mongoose");

// Connects users to the projects they belong to
const projectMembershipSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

// Make the ProjectMembership model available to the server
module.exports = mongoose.model(
    "ProjectMembership",
    projectMembershipSchema
);
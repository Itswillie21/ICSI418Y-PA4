
const mongoose = require("mongoose");

// Structure for user stories stored in MongoDB
const userStorySchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        required: true,
        enum: ["High", "Medium", "Low"]
    },
    status: {
        type: String,
        enum: ["To Do", "In Progress", "Done"],
        default: "To Do"
    },
    assigned_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
});

module.exports = mongoose.model("UserStory", userStorySchema);

const Project = require("./models/Project");
const User = require("./models/User");
const ProjectMembership = require("./models/ProjectMembership");
const UserStory = require("./models/UserStory");

const priorities = ["High", "Medium", "Low"];
const statuses = ["To Do", "In Progress", "Done"];

function validId(value) {
    return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);
}

function validText(value) {
    return typeof value === "string" && value.trim().length > 0;
}

async function checkAssignment(projectId, userId) {
    if (userId === null) return null;
    if (!validId(userId)) return "Invalid assigned user ID.";

    if (!(await User.exists({ _id: userId }))) {
        return "Assigned user does not exist.";
    }

    const membership = await ProjectMembership.exists({
        project_id: projectId,
        user_id: userId
    });

    if (!membership) {
        return "Assigned user must be a member of this project.";
    }

    return null;
}

module.exports = function registerStoryRoutes(app) {

    // Get all stories for a project
    app.get("/projects/:projectId/stories", async function (req, res) {
        const { projectId } = req.params;

        if (!validId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID." });
        }

        try {
            if (!(await Project.exists({ _id: projectId }))) {
                return res.status(404).json({ message: "Project does not exist." });
            }

            const stories = await UserStory.find({ project_id: projectId })
                .sort({ _id: -1 })
                .populate("assigned_user_id", "f_name l_name username");

            res.json(stories);
        } catch (error) {
            console.error("Get stories error:", error);
            res.status(500).json({ message: "Could not retrieve stories." });
        }
    });

    // Create a story with To Do status
    app.post("/projects/:projectId/stories", async function (req, res) {
        const { projectId } = req.params;
        const { title, description, priority, status } = req.body || {};
        const assignedId = (req.body || {}).assigned_user_id ?? null;

        if (!validId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID." });
        }

        if (!validText(title) || !validText(description)) {
            return res.status(400).json({ message: "Title and description are required." });
        }

        if (!priorities.includes(priority)) {
            return res.status(400).json({ message: "Invalid priority." });
        }

        if (status !== undefined && status !== "To Do") {
            return res.status(400).json({ message: "New stories must start as To Do." });
        }

        if (Object.prototype.hasOwnProperty.call(req.body || {}, "project_id")) {
            return res.status(400).json({ message: "Project is selected by the URL." });
        }

        try {
            if (!(await Project.exists({ _id: projectId }))) {
                return res.status(404).json({ message: "Project does not exist." });
            }

            const assignmentError = await checkAssignment(projectId, assignedId);

            if (assignmentError) {
                return res.status(400).json({ message: assignmentError });
            }

            const story = await UserStory.create({
                project_id: projectId,
                title: title.trim(),
                description: description.trim(),
                priority,
                status: "To Do",
                assigned_user_id: assignedId
            });

            await story.populate("assigned_user_id", "f_name l_name username");

            res.status(201).json({
                message: "Story created successfully.",
                story
            });
        } catch (error) {
            console.error("Create story error:", error);
            res.status(500).json({ message: "Could not create story." });
        }
    });

    // Edit a story without changing its project
    app.put("/projects/:projectId/stories/:storyId", async function (req, res) {
        const { projectId, storyId } = req.params;
        const { title, description, priority, status } = req.body || {};
        const assignedId = (req.body || {}).assigned_user_id ?? null;

        if (!validId(projectId) || !validId(storyId)) {
            return res.status(400).json({ message: "Invalid project or story ID." });
        }

        if (Object.prototype.hasOwnProperty.call(req.body || {}, "project_id")) {
            return res.status(400).json({ message: "A story cannot move to another project." });
        }

        if (!validText(title) || !validText(description)) {
            return res.status(400).json({ message: "Title and description are required." });
        }

        if (!priorities.includes(priority) || !statuses.includes(status)) {
            return res.status(400).json({ message: "Invalid priority or status." });
        }

        try {
            if (!(await Project.exists({ _id: projectId }))) {
                return res.status(404).json({ message: "Project does not exist." });
            }

            const story = await UserStory.findOne({
                _id: storyId,
                project_id: projectId
            });

            if (!story) {
                return res.status(404).json({ message: "Story does not exist in this project." });
            }

            const assignmentError = await checkAssignment(projectId, assignedId);

            if (assignmentError) {
                return res.status(400).json({ message: assignmentError });
            }

            story.title = title.trim();
            story.description = description.trim();
            story.priority = priority;
            story.status = status;
            story.assigned_user_id = assignedId;

            await story.save();
            await story.populate("assigned_user_id", "f_name l_name username");

            res.json({
                message: "Story updated successfully.",
                story
            });
        } catch (error) {
            console.error("Update story error:", error);
            res.status(500).json({ message: "Could not update story." });
        }
    });

    // Delete a story from its original project
    app.delete("/projects/:projectId/stories/:storyId", async function (req, res) {
        const { projectId, storyId } = req.params;

        if (!validId(projectId) || !validId(storyId)) {
            return res.status(400).json({ message: "Invalid project or story ID." });
        }

        try {
            if (!(await Project.exists({ _id: projectId }))) {
                return res.status(404).json({ message: "Project does not exist." });
            }

            const story = await UserStory.findOneAndDelete({
                _id: storyId,
                project_id: projectId
            });

            if (!story) {
                return res.status(404).json({ message: "Story does not exist in this project." });
            }

            res.json({ message: "Story deleted successfully." });
        } catch (error) {
            console.error("Delete story error:", error);
            res.status(500).json({ message: "Could not delete story." });
        }
    });
};

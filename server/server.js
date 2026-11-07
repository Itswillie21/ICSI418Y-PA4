const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const Project = require("./models/Project");
const ProjectMembership = require("./models/ProjectMembership");

const app = express();

app.use(cors());
app.use(express.json());

// Basic route to confirm the server is running
app.get("/", function (req, res) {
    res.send("PA3 server is running");
});

// Create a new user
app.post("/signup", async function (req, res) {
    const { f_name, l_name, username, password } = req.body;

    if (!f_name || !l_name || !username || !password) {
        return res.status(400).json({
            message: "All signup fields are required."
        });
    }

    try {
        const existingUser = await User.findOne({ username: username });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists."
            });
        }

        const newUser = new User({
            f_name: f_name,
            l_name: l_name,
            username: username,
            password: password
        });

        await newUser.save();

        res.status(201).json({
            message: "User created successfully."
        });
    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Server error while creating user."
        });
    }
});

// Log in an existing user
app.post("/login", async function (req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required."
        });
    }

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({
                message: "Username does not exist."
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Incorrect password."
            });
        }

        res.status(200).json({
            message: "Login successful."
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error while logging in."
        });
    }
});

// Get all registered users
app.get("/users", async function (req, res) {
    try {
        const users = await User.find().select(
            "_id f_name l_name username"
        );

        res.status(200).json(users);
    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Server error while retrieving users."
        });
    }
});

// Create a new project
app.post("/projects", async function (req, res) {
    const {
        name,
        description,
        status,
        project_lead_id
    } = req.body;

    if (!name || !description || !status || !project_lead_id) {
        return res.status(400).json({
            message: "All project fields are required."
        });
    }

    try {
        const projectLead = await User.findById(project_lead_id);

        if (!projectLead) {
            return res.status(404).json({
                message: "Selected Project Lead does not exist."
            });
        }

        const newProject = new Project({
            name: name,
            description: description,
            status: status,
            project_lead_id: project_lead_id
        });

        await newProject.save();

        // Project Lead automatically becomes a member
        const leadMembership = new ProjectMembership({
            project_id: newProject._id,
            user_id: project_lead_id
        });

        await leadMembership.save();

        res.status(201).json({
            message: "Project created successfully.",
            project: newProject
        });
    } catch (error) {
        console.error("Create project error:", error);

        res.status(500).json({
            message: "Server error while creating project."
        });
    }
});

// Get all projects
app.get("/projects", async function (req, res) {
    try {
        const projects = await Project.find().populate(
            "project_lead_id",
            "f_name l_name username"
        );

        res.status(200).json(projects);
    } catch (error) {
        console.error("Get projects error:", error);

        res.status(500).json({
            message: "Server error while retrieving projects."
        });
    }
});

// Get members of a project
app.get(
    "/projects/:projectId/members",
    async function (req, res) {
        const { projectId } = req.params;

        try {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    message: "Project does not exist."
                });
            }

            const memberships =
                await ProjectMembership.find({
                    project_id: projectId
                }).populate(
                    "user_id",
                    "_id f_name l_name username"
                );

            res.status(200).json(memberships);
        } catch (error) {
            console.error("Get members error:", error);

            res.status(500).json({
                message:
                    "Server error while retrieving project members."
            });
        }
    }
);

// Add a member to a project
app.post(
    "/projects/:projectId/members",
    async function (req, res) {
        const { projectId } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                message: "A user must be selected."
            });
        }

        try {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    message: "Project does not exist."
                });
            }

            const user = await User.findById(user_id);

            if (!user) {
                return res.status(404).json({
                    message: "User does not exist."
                });
            }

            const existingMembership =
                await ProjectMembership.findOne({
                    project_id: projectId,
                    user_id: user_id
                });

            if (existingMembership) {
                return res.status(409).json({
                    message:
                        "User is already a member of this project."
                });
            }

            const membership = new ProjectMembership({
                project_id: projectId,
                user_id: user_id
            });

            await membership.save();

            res.status(201).json({
                message: "Member added successfully."
            });
        } catch (error) {
            console.error("Add member error:", error);

            res.status(500).json({
                message:
                    "Server error while adding project member."
            });
        }
    }
);

// Remove a non-lead member
app.delete(
    "/projects/:projectId/members/:userId",
    async function (req, res) {
        const { projectId, userId } = req.params;

        try {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    message: "Project does not exist."
                });
            }

            if (project.project_lead_id.toString() === userId) {
                return res.status(400).json({
                    message:
                        "The Project Lead cannot be removed."
                });
            }

            const membership =
                await ProjectMembership.findOneAndDelete({
                    project_id: projectId,
                    user_id: userId
                });

            if (!membership) {
                return res.status(404).json({
                    message:
                        "Project membership does not exist."
                });
            }

            res.status(200).json({
                message: "Member removed successfully."
            });
        } catch (error) {
            console.error("Remove member error:", error);

            res.status(500).json({
                message:
                    "Server error while removing project member."
            });
        }
    }
);

const PORT = 5000;

// Connect to MongoDB before starting the server
mongoose
    .connect(process.env.MONGO_URI)
    .then(function () {
        console.log("Connected to MongoDB");

        app.listen(PORT, function () {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(function (error) {
        console.error("MongoDB connection failed:", error);
    });
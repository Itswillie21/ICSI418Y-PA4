import { useEffect, useState } from "react";

function CreateProject() {
    const [users, setUsers] = useState([]);

    const [projectData, setProjectData] = useState({
        name: "",
        description: "",
        status: "Planning",
        project_lead_id: ""
    });

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(function () {
        async function loadUsers() {
            try {
                const response = await fetch(
                    "http://localhost:5000/users"
                );

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Load users error:", error);
                setMessage("Could not load registered users.");
                setIsError(true);
            }
        }

        loadUsers();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setProjectData({
            ...projectData,
            [name]: value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setIsError(false);

        try {
            const response = await fetch(
                "http://localhost:5000/projects",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(projectData)
                }
            );

            const data = await response.json();

            setMessage(data.message);
            setIsError(!response.ok);

            if (response.ok) {
                setProjectData({
                    name: "",
                    description: "",
                    status: "Planning",
                    project_lead_id: ""
                });
            }
        } catch (error) {
            console.error("Create project error:", error);
            setMessage("Could not connect to the server.");
            setIsError(true);
        }
    }

    return (
        <section className="project-card">
            <h1>Create Project</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="projectName">
                    Project Name
                </label>

                <input
                    type="text"
                    id="projectName"
                    name="name"
                    value={projectData.name}
                    onChange={handleChange}
                />

                <label htmlFor="projectDescription">
                    Description
                </label>

                <textarea
                    id="projectDescription"
                    name="description"
                    value={projectData.description}
                    onChange={handleChange}
                />

                <label htmlFor="projectStatus">
                    Status
                </label>

                <select
                    id="projectStatus"
                    name="status"
                    value={projectData.status}
                    onChange={handleChange}
                >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                </select>

                <label htmlFor="projectLead">
                    Project Lead
                </label>

                <select
                    id="projectLead"
                    name="project_lead_id"
                    value={projectData.project_lead_id}
                    onChange={handleChange}
                >
                    <option value="">
                        Select a Project Lead
                    </option>

                    {users.map(function (user) {
                        return (
                            <option
                                key={user._id}
                                value={user._id}
                            >
                                {user.f_name} {user.l_name}
                                {" - "}
                                {user.username}
                            </option>
                        );
                    })}
                </select>

                <button type="submit">
                    Create Project
                </button>
            </form>

            {message && (
                <p className={isError ? "message error" : "message success"}>
                    {message}
                </p>
            )}
        </section>
    );
}

export default CreateProject;
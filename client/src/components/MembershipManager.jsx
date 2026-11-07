import { useEffect, useState } from "react";

function MembershipManager() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);

    const [selectedProject, setSelectedProject] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(function () {
        async function loadData() {
            try {
                const projectResponse = await fetch(
                    "http://localhost:5000/projects"
                );

                const userResponse = await fetch(
                    "http://localhost:5000/users"
                );

                const projectData =
                    await projectResponse.json();

                const userData =
                    await userResponse.json();

                setProjects(projectData);
                setUsers(userData);
            } catch (error) {
                console.error("Load membership data error:", error);
                setMessage("Could not load project data.");
                setIsError(true);
            }
        }

        loadData();
    }, []);

    async function loadMembers(projectId) {
        if (!projectId) {
            setMembers([]);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/projects/${projectId}/members`
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message);
                setIsError(true);
                return;
            }

            setMembers(data);
        } catch (error) {
            console.error("Load members error:", error);
            setMessage("Could not load project members.");
            setIsError(true);
        }
    }

    function handleProjectChange(event) {
        const projectId = event.target.value;

        setSelectedProject(projectId);
        setSelectedUser("");
        setMessage("");
        setMembers([]);

        loadMembers(projectId);
    }

    async function handleAddMember(event) {
        event.preventDefault();

        if (!selectedProject) {
            setMessage("A project must be selected.");
            setIsError(true);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/projects/${selectedProject}/members`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: selectedUser
                    })
                }
            );

            const data = await response.json();

            setMessage(data.message);
            setIsError(!response.ok);

            if (response.ok) {
                setSelectedUser("");
                loadMembers(selectedProject);
            }
        } catch (error) {
            console.error("Add member error:", error);
            setMessage("Could not connect to the server.");
            setIsError(true);
        }
    }

    async function handleRemoveMember(userId) {
        try {
            const response = await fetch(
                `http://localhost:5000/projects/${selectedProject}/members/${userId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            setMessage(data.message);
            setIsError(!response.ok);

            if (response.ok) {
                loadMembers(selectedProject);
            }
        } catch (error) {
            console.error("Remove member error:", error);
            setMessage("Could not connect to the server.");
            setIsError(true);
        }
    }

    const currentProject = projects.find(function (project) {
        return project._id === selectedProject;
    });

    return (
        <section className="membership-section">
            <h1>Manage Memberships</h1>

            <label htmlFor="membershipProject">
                Project
            </label>

            <select
                id="membershipProject"
                value={selectedProject}
                onChange={handleProjectChange}
            >
                <option value="">
                    Select a Project
                </option>

                {projects.map(function (project) {
                    return (
                        <option
                            key={project._id}
                            value={project._id}
                        >
                            {project.name}
                        </option>
                    );
                })}
            </select>

            {selectedProject && (
                <>
                    <h2>Current Members</h2>

                    <div className="member-list">
                        {members.map(function (membership) {
                            const user = membership.user_id;

                            const isLead =
                                currentProject &&
                                currentProject.project_lead_id &&
                                currentProject.project_lead_id._id === user._id;

                            return (
                                <div
                                    className="member-item"
                                    key={membership._id}
                                >
                                    <span>
                                        {user.f_name} {user.l_name}
                                        {" "}
                                        ({user.username})
                                        {isLead && " - Project Lead"}
                                    </span>

                                    {!isLead && (
                                        <button
                                            type="button"
                                            onClick={function () {
                                                handleRemoveMember(user._id);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={handleAddMember}>
                        <label htmlFor="membershipUser">
                            Add Member
                        </label>

                        <select
                            id="membershipUser"
                            value={selectedUser}
                            onChange={function (event) {
                                setSelectedUser(event.target.value);
                            }}
                        >
                            <option value="">
                                Select a User
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
                            Add Member
                        </button>
                    </form>
                </>
            )}

            {message && (
                <p className={isError ? "message error" : "message success"}>
                    {message}
                </p>
            )}
        </section>
    );
}

export default MembershipManager;
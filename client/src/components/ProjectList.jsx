import { useEffect, useState } from "react";

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(function () {
        async function loadProjects() {
            try {
                const response = await fetch(
                    "http://localhost:5000/projects"
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(data.message);
                    return;
                }

                setProjects(data);
            } catch (error) {
                console.error("Load projects error:", error);
                setMessage("Could not load projects.");
            }
        }

        loadProjects();
    }, []);

    return (
        <section className="projects-section">
            <h1>Projects</h1>

            {message && (
                <p className="message error">
                    {message}
                </p>
            )}

            {projects.length === 0 && !message ? (
                <p>No projects have been created yet.</p>
            ) : (
                <div className="project-list">
                    {projects.map(function (project) {
                        const lead = project.project_lead_id;

                        return (
                            <article
                                className="project-item"
                                key={project._id}
                            >
                                <h2>{project.name}</h2>

                                <p>{project.description}</p>

                                <p>
                                    <strong>Status:</strong>{" "}
                                    {project.status}
                                </p>

                                <p>
                                    <strong>Project Lead:</strong>{" "}
                                    {lead
                                        ? `${lead.f_name} ${lead.l_name} (${lead.username})`
                                        : "Unknown"}
                                </p>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default ProjectList;
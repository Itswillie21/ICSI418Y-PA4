
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

function emptyForm() {
    return {
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do",
        assigned_user_id: ""
    };
}

function StoryBacklog() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [members, setMembers] = useState([]);
    const [stories, setStories] = useState([]);
    const [form, setForm] = useState(emptyForm());
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // Load available projects
    useEffect(function () {
        async function loadProjects() {
            try {
                const response = await fetch(`${API}/projects`);
                const data = await response.json();

                if (!response.ok) throw new Error(data.message);
                setProjects(data);
            } catch (error) {
                setMessage(error.message || "Could not load projects.");
                setIsError(true);
            }
        }

        loadProjects();
    }, []);

    // Load members and stories when the project changes
    useEffect(function () {
        if (!selectedProject) return;

        let active = true;

        async function loadProjectData() {
            setLoading(true);

            try {
                const [membersResponse, storiesResponse] = await Promise.all([
                    fetch(`${API}/projects/${selectedProject}/members`),
                    fetch(`${API}/projects/${selectedProject}/stories`)
                ]);

                const memberData = await membersResponse.json();
                const storyData = await storiesResponse.json();

                if (!membersResponse.ok) throw new Error(memberData.message);
                if (!storiesResponse.ok) throw new Error(storyData.message);

                if (active) {
                    setMembers(memberData);
                    setStories(storyData);
                }
            } catch (error) {
                if (active) {
                    setMessage(error.message || "Could not load backlog.");
                    setIsError(true);
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadProjectData();

        return function () {
            active = false;
        };
    }, [selectedProject]);

    async function refreshStories() {
        const response = await fetch(
            `${API}/projects/${selectedProject}/stories`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);
        setStories(data);
    }

    function changeProject(event) {
        setSelectedProject(event.target.value);
        setMembers([]);
        setStories([]);
        setForm(emptyForm());
        setEditingId(null);
        setMessage("");
        setIsError(false);
    }

    function changeForm(event) {
        const { name, value } = event.target;
        setForm(previous => ({ ...previous, [name]: value }));
    }

    function startEditing(story) {
        setEditingId(story._id);
        setForm({
            title: story.title,
            description: story.description,
            priority: story.priority,
            status: story.status,
            assigned_user_id: story.assigned_user_id?._id || ""
        });
        setMessage("");
    }

    function cancelEditing() {
        setEditingId(null);
        setForm(emptyForm());
        setMessage("");
    }

    // Create or update a story
    async function saveStory(event) {
        event.preventDefault();

        if (!form.title.trim() || !form.description.trim()) {
            setMessage("Title and description are required.");
            setIsError(true);
            return;
        }

        const payload = {
            title: form.title,
            description: form.description,
            priority: form.priority,
            assigned_user_id: form.assigned_user_id || null
        };

        if (editingId) payload.status = form.status;

        const url = editingId
            ? `${API}/projects/${selectedProject}/stories/${editingId}`
            : `${API}/projects/${selectedProject}/stories`;

        try {
            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            await refreshStories();
            setEditingId(null);
            setForm(emptyForm());
            setMessage(data.message);
            setIsError(false);
        } catch (error) {
            setMessage(error.message || "Could not save story.");
            setIsError(true);
        }
    }

    // Confirm before deleting a story
    async function deleteStory(story) {
        if (!window.confirm(`Delete "${story.title}"?`)) return;

        try {
            const response = await fetch(
                `${API}/projects/${selectedProject}/stories/${story._id}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            await refreshStories();

            if (editingId === story._id) cancelEditing();

            setMessage(data.message);
            setIsError(false);
        } catch (error) {
            setMessage(error.message || "Could not delete story.");
            setIsError(true);
        }
    }

    return (
        <section className="backlog-section">
            <h1>Project Backlog</h1>

            <label htmlFor="backlogProject">Project</label>
            <select
                id="backlogProject"
                value={selectedProject}
                onChange={changeProject}
            >
                <option value="">Select a Project</option>
                {projects.map(project => (
                    <option key={project._id} value={project._id}>
                        {project.name}
                    </option>
                ))}
            </select>

            {message && (
                <p className={isError ? "message error" : "message success"}>
                    {message}
                </p>
            )}

            {!selectedProject && <p>Select a project to view its stories.</p>}

            {selectedProject && (
                <>
                    <h2>Stories</h2>

                    {loading ? (
                        <p>Loading backlog...</p>
                    ) : stories.length === 0 ? (
                        <p>This project has no stories yet.</p>
                    ) : (
                        <div className="story-list">
                            {stories.map(story => {
                                const assigned = story.assigned_user_id;
                                const name = assigned
                                    ? `${assigned.f_name} ${assigned.l_name} (${assigned.username})`
                                    : "Unassigned";

                                return (
                                    <article key={story._id} className="story-item">
                                        <h3>{story.title}</h3>
                                        <p>{story.description}</p>
                                        <p>
                                            Priority: {story.priority} |
                                            Status: {story.status}
                                        </p>
                                        <p>Assigned Member: {name}</p>

                                        <div className="story-actions">
                                            <button
                                                type="button"
                                                onClick={() => startEditing(story)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteStory(story)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    <div className="story-form">
                        <h2>{editingId ? "Edit Story" : "Create Story"}</h2>

                        <form onSubmit={saveStory}>
                            <label htmlFor="storyTitle">Title</label>
                            <input
                                id="storyTitle"
                                name="title"
                                value={form.title}
                                onChange={changeForm}
                                required
                            />

                            <label htmlFor="storyDescription">Description</label>
                            <textarea
                                id="storyDescription"
                                name="description"
                                value={form.description}
                                onChange={changeForm}
                                placeholder="As a [user], I want [goal], so that [benefit]."
                                required
                            />

                            <label htmlFor="storyPriority">Priority</label>
                            <select
                                id="storyPriority"
                                name="priority"
                                value={form.priority}
                                onChange={changeForm}
                            >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>

                            <label htmlFor="storyAssigned">Assigned Member</label>
                            <select
                                id="storyAssigned"
                                name="assigned_user_id"
                                value={form.assigned_user_id}
                                onChange={changeForm}
                            >
                                <option value="">Unassigned</option>

                                {members.map(member => {
                                    const user = member.user_id;
                                    if (!user) return null;

                                    return (
                                        <option key={user._id} value={user._id}>
                                            {user.f_name} {user.l_name} ({user.username})
                                        </option>
                                    );
                                })}
                            </select>

                            {editingId ? (
                                <>
                                    <label htmlFor="storyStatus">Status</label>
                                    <select
                                        id="storyStatus"
                                        name="status"
                                        value={form.status}
                                        onChange={changeForm}
                                    >
                                        <option>To Do</option>
                                        <option>In Progress</option>
                                        <option>Done</option>
                                    </select>
                                </>
                            ) : (
                                <p>New stories start with To Do status.</p>
                            )}

                            <div className="story-actions">
                                <button type="submit">
                                    {editingId ? "Save Changes" : "Create Story"}
                                </button>

                                {editingId && (
                                    <button type="button" onClick={cancelEditing}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </>
            )}
        </section>
    );
}

export default StoryBacklog;
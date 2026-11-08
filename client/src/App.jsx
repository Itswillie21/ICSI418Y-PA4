
import { useState } from "react";
import "./App.css";

import CreateProject from "./components/CreateProject";
import ProjectList from "./components/ProjectList";
import MembershipManager from "./components/MembershipManager";
import StoryBacklog from "./components/StoryBacklog";

function App() {
    const [page, setPage] = useState("account");
    const [isLogin, setIsLogin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [signupData, setSignupData] = useState({
        f_name: "",
        l_name: "",
        username: "",
        password: ""
    });

    const [loginData, setLoginData] = useState({
        username: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // Update signup form fields
    function handleSignupChange(event) {
        const { name, value } = event.target;

        setSignupData({
            ...signupData,
            [name]: value
        });
    }

    // Update login form fields
    function handleLoginChange(event) {
        const { name, value } = event.target;

        setLoginData({
            ...loginData,
            [name]: value
        });
    }

    // Send signup information to the backend
    async function handleSignup(event) {
        event.preventDefault();

        setMessage("");
        setIsError(false);

        try {
            const response = await fetch(
                "http://localhost:5000/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(signupData)
                }
            );

            const data = await response.json();

            setMessage(data.message);
            setIsError(!response.ok);

            if (response.ok) {
                setSignupData({
                    f_name: "",
                    l_name: "",
                    username: "",
                    password: ""
                });
            }
        } catch (error) {
            console.error("Signup request failed:", error);
            setMessage("Could not connect to the server.");
            setIsError(true);
        }
    }

    // Send login information to the backend
    async function handleLogin(event) {
        event.preventDefault();

        setMessage("");
        setIsError(false);

        try {
            const response = await fetch(
                "http://localhost:5000/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(loginData)
                }
            );

            const data = await response.json();

            setMessage(data.message);
            setIsError(!response.ok);

            if (response.ok) {
                setLoginData({
                    username: "",
                    password: ""
                });

                setIsAuthenticated(true);
                setPage("projects");
            }
        } catch (error) {
            console.error("Login request failed:", error);
            setMessage("Could not connect to the server.");
            setIsError(true);
        }
    }

    // Switch between login and signup
    function switchForm() {
        setIsLogin(!isLogin);
        setMessage("");
        setIsError(false);
    }

    // Log out and return to the login screen
    function handleLogout() {
        setIsAuthenticated(false);
        setPage("account");
        setIsLogin(true);
        setMessage("");
        setIsError(false);
    }

    return (
        <>
            {isAuthenticated && (
                <header className="site-header">
                    <h1>Project Management Portal</h1>

                    <nav className="main-nav">
                        <button
                            type="button"
                            onClick={function () {
                                setPage("create");
                            }}
                        >
                            Create Project
                        </button>

                        <button
                            type="button"
                            onClick={function () {
                                setPage("projects");
                            }}
                        >
                            Projects
                        </button>

                        <button
                            type="button"
                            onClick={function () {
                                setPage("memberships");
                            }}
                        >
                            Memberships
                        </button>

                        <button
                            type="button"
                            onClick={function () {
                                setPage("backlog");
                            }}
                        >
                            Backlog
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </nav>
                </header>
            )}

            <main>
                {!isAuthenticated ? (
                    <section>
                        <h1>
                            {isLogin ? "Login" : "Create Account"}
                        </h1>

                        {isLogin ? (
                            <form onSubmit={handleLogin}>
                                <label htmlFor="loginUsername">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    id="loginUsername"
                                    name="username"
                                    value={loginData.username}
                                    onChange={handleLoginChange}
                                />

                                <label htmlFor="loginPassword">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    id="loginPassword"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                />

                                <button type="submit">
                                    Login
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup}>
                                <label htmlFor="f_name">
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    id="f_name"
                                    name="f_name"
                                    value={signupData.f_name}
                                    onChange={handleSignupChange}
                                />

                                <label htmlFor="l_name">
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    id="l_name"
                                    name="l_name"
                                    value={signupData.l_name}
                                    onChange={handleSignupChange}
                                />

                                <label htmlFor="signupUsername">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    id="signupUsername"
                                    name="username"
                                    value={signupData.username}
                                    onChange={handleSignupChange}
                                />

                                <label htmlFor="signupPassword">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    id="signupPassword"
                                    name="password"
                                    value={signupData.password}
                                    onChange={handleSignupChange}
                                />

                                <button type="submit">
                                    Sign Up
                                </button>
                            </form>
                        )}

                        {message && (
                            <p
                                className={
                                    isError
                                        ? "message error"
                                        : "message success"
                                }
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="button"
                            className="switch-button"
                            onClick={switchForm}
                        >
                            {isLogin
                                ? "Need an account? Sign Up"
                                : "Already have an account? Login"}
                        </button>
                    </section>
                ) : (
                    <>
                        {page === "create" && (
                            <CreateProject />
                        )}

                        {page === "projects" && (
                            <ProjectList />
                        )}

                        {page === "memberships" && (
                            <MembershipManager />
                        )}

                        {page === "backlog" && (
                            <StoryBacklog />
                        )}
                    </>
                )}
            </main>
        </>
    );
}

export default App;
# ICSI 418Y Programming Assignment 4

## User Stories and Project Backlog

This project extends Programming Assignment 3 by adding user stories and project backlogs to the existing full-stack application. The project creation, project viewing, membership management, Login, and Signup functionality from previous assignments is still included.

The application uses:

- React
- Node.js
- Express
- MongoDB
- Mongoose

The interface continues the purple and gold school-inspired styling used in the previous assignment.

## Features

### User Accounts

The existing Signup and Login functionality from Programming Assignment 2 is still included.

Users can:

- Create an account
- Log in using a username and password
- Receive clear success and error messages
- Log out of the application

After a successful login, the user can access the project-management features.

### Create Projects

Registered users can create software projects with:

- Project Name
- Description
- Status
- Project Lead

Available project statuses are:

- Planning
- Active
- Completed

The Project Lead is selected from users already registered in the application.

When a project is created, the selected Project Lead is automatically added as a member of the project.

### View Projects

The Projects interface displays the projects stored in MongoDB.

Each project displays:

- Project Name
- Description
- Status
- Project Lead

The Project Lead is displayed using the user's information instead of only displaying a MongoDB ObjectId.

### Manage Project Memberships

The Memberships interface allows users to:

- Select a project
- View the current members of the project
- Add a registered user to the project
- Remove a non-lead member from the project

The application also enforces the following membership rules:

- A user cannot be added to the same project more than once
- The Project Lead is automatically a project member
- The current Project Lead cannot be removed
- A user can belong to multiple different projects
- A project can contain multiple users
- A member with assigned stories cannot be removed from that project, including when those stories are Done

Assigned stories must first be reassigned, unassigned, or deleted before the member can be removed.

### User Stories and Project Backlogs

The Backlog interface allows users to create, view, edit, and delete user stories for individual projects.

Each story includes a title, description, priority, status, and assigned member. Descriptions follow the format "As a [type of user], I want [goal], so that [benefit]."

Priorities are High, Medium, or Low. New stories begin with the status To Do, which can later be changed to In Progress or Done.

Stories can be assigned to a current member of the selected project or left Unassigned. Changes are saved in MongoDB, and deleting a story requires confirmation.

## MongoDB Collections

The application uses four main MongoDB collections:

### Users

Stores registered application users.

Example fields:

- `_id`
- `f_name`
- `l_name`
- `username`
- `password`

### Projects

Stores project information.

Example fields:

- `_id`
- `name`
- `description`
- `status`
- `project_lead_id`

`project_lead_id` stores an ObjectId reference to an existing User.

### ProjectMemberships

Represents the relationship between users and projects.

Example fields:

- `_id`
- `project_id`
- `user_id`

Both fields use MongoDB ObjectId references rather than storing copied project names or usernames.

This allows the application to represent a many-to-many relationship:

- One user may participate in multiple projects
- One project may contain multiple users

### UserStories

Stores the user stories associated with each project.

Fields:

- `_id`
- `project_id`
- `title`
- `description`
- `priority`
- `status`
- `assigned_user_id`

`project_id` references the story's project, while `assigned_user_id` references a User or is null when Unassigned.

## Running the Application

Node.js, npm, and a MongoDB connection are required. The frontend and backend run in separate terminals.

Create a `.env` file inside the `server` folder containing:

```text
MONGO_URI=your_mongodb_connection_string
```

From the main project folder, start the backend:

```cmd
cd server
npm install
node server.js
```

Open a second terminal from the main project folder and start the frontend:

```cmd
cd client
npm install
npm run dev
```

Open the address displayed by Vite, normally `http://localhost:5173`.

## Preparing Test Data

Create at least three registered users and two projects, including at least one non-lead project member. Create five user stories across the two projects with all three priorities and statuses represented, including assigned and unassigned stories.

Test creating, editing, deleting, and switching between project backlogs. Verify that assignments are limited to project members, that members with assigned stories cannot be removed, and that changes remain after refreshing the page.
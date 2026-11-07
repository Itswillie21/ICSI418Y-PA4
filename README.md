# ICSI 418Y Programming Assignment 3

## Projects and Project Memberships

This project extends Programming Assignment 2 by adding project creation, project viewing, and project membership management to the existing full-stack Login and Signup application.

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

## MongoDB Collections

The application uses three main MongoDB collections:

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
# Task-Link Monorepo

A professional monorepo structure for the Task-Link project, separating frontend and backend concerns.

## Project Structure

- **`frontend/`**: React + Vite application.
- **`backend/`**: Node.js Express backend server.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v7 or higher for workspaces support)

### Installation

Install dependencies for both frontend and backend from the root directory:

```bash
npm install
```

### Development

You can run the development servers using the following scripts from the root:

- **Run Frontend**: `npm run frontend`
- **Run Backend**: `npm run backend`
- **Run Both**: `npm run start`

## Backend API Details

### Features
- MongoDB (Mongoose) for storing users
- Express for API routes (/api/signup, /api/login, /api/role)
- bcrypt for password hashing
- JWT for authentication tokens
- CORS setup for frontend connection
- Environment variables for secure keys

### API Flow
- **Signup**: `POST /api/signup` with `{ fullName, email, password }` → Returns user info.
- **Select Role**: `POST /api/role` with `{ email, role }` → Updates user’s role.
- **Login**: `POST /api/login` with `{ email, password }` → Verifies credentials, returns JWT + role.

## Configuration

- **Frontend**: Configuration is located in `frontend/vite.config.js`.
- **Backend**: Configuration and environment variables are managed in the `backend/` directory.


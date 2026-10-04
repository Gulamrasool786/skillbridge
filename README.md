# SkillBridge — Freelance Marketplace

A full-stack marketplace that connects clients with freelancers through searchable profiles, project briefs, and private messaging.

Built with React, Node.js, Express, and MongoDB, SkillBridge brings talent discovery and project conversations into one workspace.

## Live Demo

- **Vercel:** https://skillbridge-6ugz.vercel.app/
- **Netlify:** https://brilliant-crepe-2d2d2f.netlify.app/
- **Backend Health:** https://skillbridge-moula-ali.vercel.app/api/health
- **Repository:** https://github.com/Gulamrasool786/skillbridge

Both frontend deployments connect to the same backend and database.

## Overview

SkillBridge supports two account roles:

**Clients** can discover freelancers, review their services, create project briefs, and start conversations.

**Freelancers** can create service profiles, manage their publication status, and communicate with potential clients.

The project demonstrates frontend development, REST API design, session-based authentication, database persistence, and cloud deployment.

## Features

### Authentication and Accounts

- Account registration and login
- Client and freelancer roles
- Session-based authentication with HTTP-only cookies
- MongoDB-backed session storage
- Password hashing with bcrypt
- Protected routes and role-aware navigation
- Logout functionality

### Talent Discovery

- Browse published freelancer profiles
- Search by name, headline, category, or skill
- Filter profiles by category
- View service descriptions, skills, starting prices, and delivery estimates
- Save freelancers to a shortlist

### Freelancer Profiles

- Create and edit a service profile
- Add a headline, description, category, and skills
- Set a starting price and estimated delivery time
- Save a profile as a draft
- Publish or unpublish a profile
- Display published profiles in the talent directory

### Client Projects

- Create project briefs with a title, description, category, and budget
- Store project drafts in MongoDB
- View projects associated with the signed-in account
- Handle loading, empty, and error states

### Messaging

- Start conversations from freelancer profiles
- Exchange private messages
- Browse conversation history
- Load older messages
- Display unread-message indicators and read status
- Refresh conversations through polling

### User Interface

- Responsive dashboard layout
- Search and category filters
- Account-aware navigation
- Form validation and feedback
- Loading states and retry controls

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| State Management | React Context and Hooks |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | express-session, connect-mongo, bcryptjs |
| Hosting | Vercel and Netlify |
| Version Control | Git and GitHub |

## Architecture

The React frontend sends requests to relative `/api` endpoints.

During local development, Vite forwards those requests to the Express server. In production, hosting rewrites forward them to the Vercel backend.

The backend handles authentication, validation, and application data. MongoDB Atlas stores application records and sessions.

| Application | Deployment |
|---|---|
| React frontend | Vercel and Netlify |
| Express API | Vercel |
| Database and session storage | MongoDB Atlas |

## Project Structure

    skillbridge/
    ├── client/
    │   ├── public/
    │   │   └── _redirects
    │   ├── src/
    │   │   ├── components/
    │   │   ├── context/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── package.json
    │   ├── vercel.json
    │   └── vite.config.js
    ├── server/
    │   ├── src/
    │   │   ├── config/
    │   │   ├── controllers/
    │   │   ├── middleware/
    │   │   ├── models/
    │   │   ├── routes/
    │   │   ├── app.js
    │   │   └── server.js
    │   └── package.json
    ├── .gitignore
    └── README.md

## Getting Started

### Prerequisites

- A Node.js version supported by the installed Vite release
- npm
- Git
- A MongoDB database connection

### 1. Clone the repository

    git clone https://github.com/Gulamrasool786/skillbridge.git
    cd skillbridge

### 2. Install dependencies

    cd client
    npm install
    cd ../server
    npm install

### 3. Configure the backend

Create `server/.env`:

    PORT=5000
    NODE_ENV=development
    MONGODB_URI=your_mongodb_connection_string
    SESSION_SECRET=your_long_random_session_secret

Replace the placeholder values with your own configuration.

Keep `.env` files out of version control. Database credentials and session secrets belong on the backend.

### 4. Start the backend

From the `server` folder:

    npm run dev

The local API runs at:

    http://localhost:5000

Check the connection at:

    http://localhost:5000/api/health

### 5. Start the frontend

Open a second terminal from the repository root:

    cd client
    npm run dev

Open:

    http://localhost:5173

Keep both development servers running.

## Frontend Commands

Run these commands inside `client`:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate the production build |
| `npm run preview` | Preview the frontend build locally |
| `npm run lint` | Run ESLint |

The production frontend is generated in `client/dist`.

The preview command serves the frontend build; backend access still requires a running API and suitable routing.

## API Overview

| Route Group | Purpose |
|---|---|
| `/api/health` | API health check |
| `/api/auth` | Registration, login, session checks, and logout |
| `/api/projects` | Client project management |
| `/api/freelancer-profiles` | Freelancer profile management and publication |
| `/api/talent` | Public directory of published profiles |
| `/api/conversations` | Conversations and messaging |

Protected endpoints require a valid application session.

## Deployment

### Backend on Vercel

The backend project uses `server` as its root directory.

Configure these environment variables in the backend deployment:

- `MONGODB_URI`
- `SESSION_SECRET`
- `NODE_ENV=production`

The API must be publicly reachable by the frontend. Application authentication protects private endpoints.

### Frontend on Vercel

The frontend is deployed as a separate project from the same repository:

| Setting | Value |
|---|---|
| Root Directory | `client` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

`client/vercel.json` forwards API requests and provides the React routing fallback.

### Frontend on Netlify

| Setting | Value |
|---|---|
| Base Directory | `client` |
| Build Command | `npm run build` |
| Publish Directory | `dist`, relative to the base directory |

`client/public/_redirects` forwards API requests and supports direct navigation to React pages.

When deploying your own copy, update the backend destination in both hosting configurations.

## Suggested Demo Flow

1. Register a freelancer account.
2. Complete and publish a freelancer profile.
3. Open Discover Talent and find the published profile.
4. Register or log in with a client account.
5. Create a project brief.
6. Open a freelancer profile and start a conversation.
7. Use separate browser sessions to test messaging between accounts.

Use fictional information when creating public demonstration content.

## Current Scope

SkillBridge is a portfolio and learning project under active development.

- Messaging uses polling rather than WebSockets.
- The saved-talent shortlist currently resets on refresh.
- Client projects are stored as drafts.
- Payments, escrow, contracts, and order fulfillment are not implemented.
- Listed prices describe freelancer services; they do not initiate a payment.

## Future Improvements

- Persistent saved-talent lists
- Project proposals and hiring workflows
- Milestones and delivery tracking
- Reviews and ratings
- File attachments in conversations
- Notifications
- Administrative moderation tools
- Automated testing and accessibility improvements

These are planned enhancements, not currently available features.

## Author

**Gulam Rasool**  
Full-Stack Web Developer | Machine Learning Enthusiast

- GitHub: https://github.com/Gulamrasool786
- Portfolio: https://gulamrasool.netlify.app/

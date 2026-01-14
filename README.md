# GigFlow

GigFlow is a mini freelance marketplace where users can post gigs, bid on projects, and hire freelancers with atomic transaction safety and real-time notifications.

## Project Structure

```
gigflow/
├── server/   # Node.js, Express, MongoDB, Socket.IO
└── client/   # Vite, React, Tailwind CSS
```

## Tech Stack

*   **Backend**: Node.js, Express, MongoDB, Socket.IO
*   **Frontend**: React (Vite), Tailwind CSS
*   **Authentication**: JWT (HttpOnly cookies)
*   **Database**: MongoDB (transactions enabled)
*   **Realtime**: Socket.IO notifications

## Prerequisites

*   **Node.js**: v18+
*   **MongoDB**:
    *   MongoDB Atlas (recommended – replica set enabled by default)
    *   Local MongoDB must be configured as a replica set to support transactions

### MongoDB Replica Set (Local Only)

Required for atomic hiring using MongoDB transactions.

```bash
mongod --replSet rs0 --dbpath <your-data-path> --port 27017

mongosh
rs.initiate()
```

## Environment Variables

**`server/.env`**
```env
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=dev_secret_change_later
PORT=5000
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Setup & Running (Local Development)

### 1. Start the Backend

```bash
cd server
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Features

*   **User Authentication**: Secure JWT-based authentication using HttpOnly cookies
*   **Gig Marketplace**: Post gigs, browse gigs, bid on projects
*   **Atomic Hiring**: MongoDB transactions ensure only one freelancer can be hired per gig
*   **Real-time Notifications**: Socket.IO notifies freelancers instantly when hired
*   **Modern UI**: Responsive UI built with Tailwind CSS

## Known Issues / Limitations

*   **Socket.IO in Production**: Socket.IO is configured for local development by default. In production, the Socket.IO client URL must explicitly point to the deployed backend domain. Incorrect configuration may result in connection attempts to localhost.
*   **Frontend Build Caching**: When deployed on platforms like Vercel, stale builds may be served if environment variables change. A full redeploy (with cache cleared) may be required after updating API or Socket.IO URLs.
*   **API Base Path Sensitivity**: The frontend relies on `VITE_API_BASE_URL`. Misconfiguration can lead to duplicated paths such as `/api/api/...` and result in 404 errors.
*   **Single Region Assumption**: The system assumes a single backend region. Multi-region deployments may require additional session and Socket.IO handling.
*   **Demo-Oriented Auth Flow**: Auto-login persistence is intentionally disabled in some parts of the frontend for demo clarity. This is not production-hardened behavior.

## Status

This project is fully functional for local development and demonstrates:

*   Secure authentication
*   Transaction-safe hiring logic
*   Real-time event handling
*   Clean separation of frontend and backend concerns

Production deployment may require additional configuration depending on the hosting provider.

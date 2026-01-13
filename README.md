# GigFlow

GigFlow is a mini freelance marketplace where users can post gigs, bid on them, and hire freelancers with atomic transaction safety and real-time notifications.

## Project Structure

- `server/`: Node.js, Express, MongoDB
- `client/`: Vite, React, Tailwind CSS v4

## Prerequisites

1.  **Node.js**: v18+
2.  **MongoDB**: Must be running as a **Replica Set** to support transactions.

### Setting up MongoDB Replica Set (Local)

Run these commands in your terminal to convert your standalone MongoDB to a replica set (required for atomic hiring):

```bash
# Stop any running mongod instance first
# Start mongod with replSet flag
mongod --replSet rs0 --dbpath <your-data-path> --port 27017

# In a separate terminal, open mongo shell
mongosh
# Inside mongosh run:
rs.initiate()
```

## Setup & Running

1.  **Install & Run Server**
    ```bash
    cd server
    npm install
    npm run dev
    ```
    Creates server on `http://localhost:5000`.

2.  **Install & Run Client**
    ```bash
    cd client
    npm install
    npm run dev
    ```
    Opens application on `http://localhost:5173`.

## Features

- **Authentication**: JWT in HttpOnly cookies.
- **Atomic Hiring**: Ensures only one freelancer can be hired per gig using MongoDB Transactions.
- **Real-time Notifications**: Socket.io alerts the freelancer when hired.
- **Tailwind CSS v4**: Modern styling with latest engine.

## Environment Variables

**server/.env**
```
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=dev_secret_change_later
PORT=5000
CLIENT_URL=http://localhost:5173
```

Office Attendance & Leave Management System

A full-stack web application for managing employee attendance, office
check-in/check-out, leave applications, and leave policies. The system
provides separate employee and administrator workflows, location-aware
attendance, and real-time attendance updates using Socket.IO.
Live Application
- Frontend (Vercel):
  https://office-attendance-system-six.vercel.app/
- Backend API (Render):
  https://office-attendance-system-9r41.onrender.com
- Backend health endpoint:
  https://office-attendance-system-9r41.onrender.com/api/health
Features
Authentication and access
- Employee and administrator login.
- JWT-based authentication.
- Protected API routes.
- Role-based administrator access.
Attendance management
- Employee check-in and check-out.
- Attendance records with timestamps.
- Location capture using latitude and longitude.
- Office geofence validation when enabled.
- Present and Late attendance statuses.
- Attendance history and working-time calculation.
Admin dashboard
- Attendance overview and daily records.
- Employee attendance filtering.
- Office settings.
- Leave management.
- Yearly leave-policy configuration.
Leave management
- Employee leave applications.
- Configurable leave types and yearly limits.
- Paid/unpaid leave settings.
- Administrator leave-policy updates.
Real-time updates
- Socket.IO connections authenticated with JWT.
- Personal user rooms and an administrator room.
- Attendance check-in/check-out events broadcast to relevant
  dashboards.
- Dashboard pages reload attendance data when an update event arrives.
Technology Stack
Frontend: React, Vite, JavaScript, Tailwind CSS, Axios, Socket.IO
Client.
Backend: Node.js, Express, MongoDB, Mongoose, JSON Web Token (JWT),
Socket.IO, CORS.
Project Structure
attendance-app/
├── client/
│   ├── src/
│   │   ├── api.js
│   │   ├── socket.js
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── employee/
│   │   └── ...
│   ├── .env
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   └── package.json
└── README.md
This is a high-level structure; the repository may contain additional
files.
Prerequisites
- Node.js (LTS recommended)
- npm
- MongoDB (local instance or MongoDB Atlas)
- Git
Environment Variables
Backend
Create server/.env:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXX
Use the exact variable names expected by your backend configuration.
Never commit real credentials or production secrets.
Frontend
Create client/.env for local development:
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
Important: VITE_API_URL must contain only the backend base URL.
The Axios configuration appends /api automatically. Do not add /api
to this variable.

For the deployed Vercel frontend, configure:
VITE_API_URL=https://office-attendance-system-9r41.onrender.com
VITE_SOCKET_URL=https://office-attendance-system-9r41.onrender.com
Redeploy the frontend after changing Vite environment variables.
Installation and Local Setup
Clone the repository:
git clone https://github.com/Anas-Saifi7/Office-Attendance-System/
cd attendance-app
Install backend dependencies:
cd server
npm install
In a second terminal, install frontend dependencies:
cd attendance-app/client
npm install
Create and configure the backend and frontend .env files.
Start the Backend
From the server directory:
npm run dev
If the project does not define a dev script, use the script configured
in server/package.json, or run:
npx nodemon server.js
The backend should connect to MongoDB and listen on the configured port
(5000 by default).
Start the Frontend
From the client directory:
npm run dev
Open the local Vite URL shown in the terminal, normally:
http://localhost:5173
API Route Groups
  Route prefix          Purpose
  /api/auth           Authentication
/api/attendance     Employee attendance
/api/admin          Administrator operations
/api/leaves         Leave management
/api/leave-policy   Leave-policy retrieval and updates
/api/health         Backend health check

Most application routes require a valid JWT. Administrator-only
operations also require the administrator role.
Health Check
GET https://office-attendance-system-9r41.onrender.com/api/health
Expected response:
{
  "ok": true
}
Real-Time Attendance
The backend attaches Socket.IO to the HTTP server. The frontend connects
using the JWT stored after login.

After an authenticated connection: - The socket joins its personal
user:<userId> room. - Administrators also join the role:admin
room. - Check-in and check-out actions emit the attendance:updated
event. - Relevant dashboard pages listen for this event and reload
attendance data.

For production, ensure the backend host supports WebSocket connections
and the frontend's VITE_SOCKET_URL points to the deployed backend.
Deployment
Backend --- Render
1. Deploy the server application to Render.
2. Configure MONGO_URI, JWT_SECRET, and any other required backend
   environment variables.
3. Use the PORT value supplied by Render.
4. Configure CORS to allow the deployed Vercel frontend origin:
   https://office-attendance-system-six.vercel.app
5. Deploy the latest backend code, including the Socket.IO setup.
Frontend --- Vercel
1. Set VITE_API_URL to:
   https://office-attendance-system-9r41.onrender.com
2. Set VITE_SOCKET_URL to:
   https://office-attendance-system-9r41.onrender.com
3. Build and deploy the frontend.
4. Redeploy whenever Vite environment variables change.
Troubleshooting
API URL contains /api/api
Use:
VITE_API_URL=http://localhost:5000
Do not use http://localhost:5000/api, because the Axios client appends
/api itself.
Login required
- Sign in through the application first.
- Check that the browser has a token in localStorage.
- Confirm API requests include Authorization: Bearer <token>.
- Never share your actual JWT token.
Socket connection refused
- Confirm the backend is running.
- Confirm VITE_SOCKET_URL points to the correct backend.
- Confirm Socket.IO is attached to the HTTP server that listens on the
  configured port.
- Check backend CORS settings.
- Restart Vite after changing frontend .env files.
Leave Policy returns 404
The backend route is mounted at /api/leave-policy. Use the shared
Axios client, for example:
api.get("/leave-policy", { params: { year: 2026 } });
Avoid constructing a separate URL that omits the /api prefix.
Security Notes
- Keep .env files out of Git.
- Use a strong, unique JWT_SECRET.
- Never commit database credentials, access tokens, or private keys.
- Validate and authorize protected operations on the backend.
- Restrict production CORS origins to trusted frontend domains.
Development Workflow
git add .
git commit -m "Describe your changes"
git push origin main

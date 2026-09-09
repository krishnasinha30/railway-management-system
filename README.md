# Railway Management System

Railway Information, Simplified. This project is being built as a smart station operations and passenger information portal for passengers, station employees, and administrators.

## Implemented Phases

The project now includes the Phase 1 foundation plus authentication, train and station workflows, employee operations, admin train management, passenger booking requests, seed data, and Postman coverage:

- React + Vite frontend with Tailwind CSS, Framer Motion, Lucide icons, and a responsive branded landing page.
- Railway-inspired visual system using the supplied Rail Center direction: ink navy, plum, orchid, white, and a warm alert accent.
- Responsive navbar with mobile menu, search surface, station board preview, feature cards, and footer.
- Express backend with CORS, JSON parsing, request logging, environment loading, and a root health response.
- MongoDB connection configuration compatible with both `MONGO_URI` and `MONGODB_URI`.
- Vite development proxy from `/api` to the backend on port `5000`.
- JWT and bcrypt authentication with passenger, employee, and admin roles.
- Protected REST APIs for trains, stations, announcements, tasks, bookings, and dashboards.
- Employee operational updates restricted to platform, status, delay, and estimated-time fields.
- Responsive login, registration, train search, train details, booking request, station board, dashboard, and operations screens.
- Demo seed data and the `postman/Railway-Management-System.postman_collection.json` collection.
- Passenger booking history, mock PNR lookup, wallet top-ups/refunds, food vendor ordering, food status tracking, profile/saved-passenger APIs, and admin user blocking.
- Docker Compose for frontend, backend, and MongoDB plus GitHub Actions validation.

## Run Locally

Open two terminals from `railway-management-system`.

### Backend

```bash
cd server
npm install
npm run dev
```

The API starts at `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

For a production client check, run `npm run build` inside `client`.

## Environment

Copy `server/.env.example` to `server/.env` and provide a MongoDB connection string and JWT secret. The frontend can optionally use `client/.env.example` to set `VITE_API_URL`.

## Deployment Preparation (Render + Vercel + GitHub Actions)

### 1. Push the project to GitHub

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create MongoDB Atlas database

1. Sign in to MongoDB Atlas.
2. Create a new cluster and database user.
3. Allow network access from `0.0.0.0/0` for testing, or restrict it later.
4. Copy the connection string and replace the user/password placeholders.
5. Save it as the `MONGO_URI` for the backend.

### 3. Configure Render backend

1. Create a new Web Service on Render.
2. Connect the GitHub repository and select the backend folder or root project as the service source.
3. Set the build command to `npm install`.
4. Set the start command to `npm start`.
5. Add these environment variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/railway-management-system
JWT_SECRET=your_long_secure_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://YOUR-VERCEL-FRONTEND.vercel.app
NODE_ENV=production
```

### 4. Configure the frontend on Vercel

1. Import the repository into Vercel.
2. Set the project root to the `client` folder if needed.
3. Add these Vercel environment variables:

```env
VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com/api
VITE_SOCKET_URL=https://YOUR-RENDER-BACKEND.onrender.com
```

4. Deploy the project.
5. After the frontend is live, update `CLIENT_URL` in Render to the new Vercel domain.

### 5. Health check and CI

The backend exposes a public health endpoint:

```bash
GET /api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Railway Management System API is running",
  "timestamp": "2026-09-09T12:00:00.000Z"
}
```

GitHub Actions runs on every push and pull request. It installs the frontend dependencies, builds the React client, installs backend dependencies, and runs the backend syntax check. Secrets are never hardcoded in the workflow.

### 6. Common deployment errors

- CORS error: make sure the deployed Vercel URL is in `CLIENT_URL` and the frontend is using `VITE_API_URL`.
- Build failure: confirm `npm install` and `npm run build` both succeed locally before pushing.
- MongoDB connection failure: verify `MONGO_URI`, Atlas network access, and database user credentials.
- Invalid environment variable: check empty values, typos, and missing `NODE_ENV` or `JWT_SECRET`.
- Socket.io connection failure: confirm `VITE_SOCKET_URL` matches the backend deployment URL without trailing path issues.
- React refresh 404 error: add the Vercel rewrite config for SPA routes.

### Deployment checklist

- [ ] GitHub repo is connected
- [ ] MongoDB Atlas has a valid database and user
- [ ] Render backend has all required environment variables
- [ ] Vercel frontend has `VITE_API_URL` and `VITE_SOCKET_URL`
- [ ] `CLIENT_URL` is updated after frontend deployment
- [ ] `/api/health` returns `200` on the deployed backend
- [ ] GitHub Actions passes on push and pull request

## Demo Scope

This is an academic demonstration. Booking, wallet payments, PNR status, food delivery, train locations, and operational updates are simulated; the system does not connect to IRCTC, real payment providers, or GPS services.

The current implementation includes Socket.io updates for train status, announcements, bookings, food orders, and wallet changes; Docker Compose for MongoDB, API, and frontend; GitHub Actions validation; and role-protected passenger, employee, and admin screens.

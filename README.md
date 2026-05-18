# Customer Self-Service Portal

Customer Self-Service Portal is a full-stack web application where customers can:
- register and log in,
- create and track support cases,
- browse knowledge articles,
- participate in community discussions.

The project includes a TypeScript backend (Express + MongoDB) and a TypeScript frontend (React + Vite).

## Tech Stack

### Backend
- Node.js 18+
- Express + TypeScript
- MongoDB (Mongoose)
- Redis (ioredis)
- JWT auth + bcrypt
- Salesforce REST integration
- Nodemailer
- Winston logging
- Swagger docs
- Jest + Supertest

### Frontend
- React 18 + TypeScript
- Vite
- React Router 6
- Redux Toolkit
- TanStack Query v5
- Axios
- MUI v5
- Formik + Yup
- React Toastify
- Vitest + React Testing Library

## Repository Structure

```text
customer-self-service-portal/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   ├── render.yaml
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Local Development

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs at `http://localhost:5000`.
Health check: `http://localhost:5000/health`.
Swagger: `http://localhost:5000/api-docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

Use `backend/.env.example` as the source of truth.
Main keys include:
- `PORT`, `NODE_ENV`, `FRONTEND_URL`
- `MONGODB_URI`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_TLS`
- `JWT_SECRET`, `JWT_EXPIRE_TIME`
- Salesforce credentials
- SMTP credentials

### Frontend (`frontend/.env`)

Use `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Customer Portal
```

For production, set `VITE_API_URL` to your deployed backend API.

## Scripts

### Backend

```bash
npm run dev
npm run build
npm start
npm test
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm test
```

## Deployment

### Backend (Render)

- `backend/render.yaml` is included for Blueprint deploy.
- Build command: `npm install && npm run build`
- Start command: `npm start`

Important:
- Ensure `backend/tsconfig.json` outputs `dist/server.js`.
- Configure all required env vars in Render.

### Frontend (Vercel)

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set env var:
  - `VITE_API_URL=https://<your-backend-domain>/api`

## Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test -- --run
```

## Notes

- Backend is resilient to Redis/Salesforce outages (degrades gracefully).
- Auth token is stored in browser localStorage as `token`.
- API base URL is environment-driven and not hardcoded.

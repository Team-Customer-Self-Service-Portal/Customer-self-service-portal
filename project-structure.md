# Project Structure

This document reflects the current repository layout and purpose of each major folder.

```text
customer-self-service-portal/
├── backend/
│   ├── src/
│   │   ├── config/                 # MongoDB, Redis, Swagger setup
│   │   ├── controllers/            # Route controllers grouped by module
│   │   │   ├── auth/
│   │   │   ├── cases/
│   │   │   ├── knowledge/
│   │   │   ├── community/
│   │   │   └── users/
│   │   ├── middleware/             # Auth, validation, rate-limit, errors, logging
│   │   ├── models/                 # Mongoose models
│   │   ├── routes/                 # API route modules
│   │   ├── services/               # Salesforce, email, cache services
│   │   ├── types/                  # TypeScript types
│   │   ├── utils/                  # Helpers, constants, logger, validators
│   │   └── server.ts               # App bootstrap + graceful shutdown
│   ├── tests/
│   │   ├── integration/
│   │   ├── unit/
│   │   └── setup.ts
│   ├── .env.example
│   ├── Dockerfile
│   ├── render.yaml
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                    # Axios instance + typed API modules
│   │   ├── components/             # Common/auth/cases/knowledge/community UI components
│   │   ├── hooks/                  # Auth + React Query hooks
│   │   ├── pages/                  # Route pages by feature
│   │   ├── store/                  # Redux store and slices
│   │   ├── styles/                 # Theme + global styles
│   │   ├── tests/                  # Vitest component/page tests
│   │   ├── types/                  # Frontend domain and API response types
│   │   ├── utils/                  # Formatters, constants, validators
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

## Architecture Summary

- **Backend** provides REST APIs under `/api`, handles authentication, business logic, and integrations.
- **Frontend** consumes backend APIs, manages UI state with Redux Toolkit and server state with React Query.
- **Deployment** is split by service:
  - Backend on Render
  - Frontend on Vercel

## Conventions

- TypeScript strict mode is enabled in both apps.
- API responses follow `success/data` and `success/message` patterns.
- Environment variables are required for all environment-specific configuration.

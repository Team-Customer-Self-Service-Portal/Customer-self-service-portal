customer-self-service-portal/
├── backend/                         # Node.js API Server
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.ts          # MongoDB connection
│   │   │   ├── redis.ts             # Redis configuration
│   │   │   └── swagger.ts           # API documentation
│   │   ├── controllers/             # Request handlers
│   │   │   ├── auth/
│   │   │   │   ├── authController.ts
│   │   │   │   └── index.ts
│   │   │   ├── cases/
│   │   │   │   ├── caseController.ts
│   │   │   │   └── index.ts
│   │   │   ├── knowledge/
│   │   │   │   ├── knowledgeController.ts
│   │   │   │   └── index.ts
│   │   │   ├── community/
│   │   │   │   ├── communityController.ts
│   │   │   │   └── index.ts
│   │   │   └── users/
│   │   │       ├── userController.ts
│   │   │       └── index.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── validation.ts        # Input validation
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   ├── rateLimiter.ts       # Rate limiting
│   │   │   └── logger.ts            # Request logging
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.ts              # User model
│   │   │   ├── Case.ts              # Support case model
│   │   │   ├── KnowledgeArticle.ts  # Knowledge base model
│   │   │   ├── Community.ts         # Community post model
│   │   │   └── index.ts
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.ts              # Authentication routes
│   │   │   ├── cases.ts             # Case management routes
│   │   │   ├── knowledge.ts         # Knowledge base routes
│   │   │   ├── community.ts         # Community routes
│   │   │   ├── users.ts             # User management routes
│   │   │   └── index.ts
│   │   ├── services/                # Business logic
│   │   │   ├── salesforce/
│   │   │   │   ├── salesforceService.ts
│   │   │   │   ├── caseSync.ts
│   │   │   │   └── index.ts
│   │   │   ├── email/
│   │   │   │   ├── emailService.ts
│   │   │   │   └── templates/
│   │   │   ├── cache/
│   │   │   │   ├── cacheService.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.ts         # Application constants
│   │   │   ├── helpers.ts           # Helper functions
│   │   │   ├── validators.ts        # Custom validators
│   │   │   └── logger.ts            # Winston logger setup
│   │   ├── types/                   # TypeScript type definitions
│   │   │   ├── auth.ts
│   │   │   ├── salesforce.ts
│   │   │   └── index.ts
│   │   └── server.ts                # Express app setup
│   ├── tests/                       # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.ts
│   ├── logs/                        # Log files
│   ├── .env.example                 # Environment template
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── Dockerfile
│   └── README.md
├── frontend/                        # React.js Application
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── common/              # Shared components
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── Footer/
│   │   │   │   ├── LoadingSpinner/
│   │   │   │   ├── ErrorBoundary/
│   │   │   │   └── index.ts
│   │   │   ├── auth/                # Authentication components
│   │   │   │   ├── LoginForm/
│   │   │   │   ├── RegisterForm/
│   │   │   │   ├── ProtectedRoute/
│   │   │   │   └── index.ts
│   │   │   ├── cases/               # Case management components
│   │   │   │   ├── CaseList/
│   │   │   │   ├── CaseDetail/
│   │   │   │   ├── CreateCase/
│   │   │   │   └── index.ts
│   │   │   ├── knowledge/           # Knowledge base components
│   │   │   │   ├── ArticleList/
│   │   │   │   ├── ArticleDetail/
│   │   │   │   ├── SearchBox/
│   │   │   │   └── index.ts
│   │   │   ├── community/           # Community components
│   │   │   │   ├── PostList/
│   │   │   │   ├── PostDetail/
│   │   │   │   ├── CreatePost/
│   │   │   │   └── index.ts
│   │   │   └── layout/              # Layout components
│   │   │       ├── DashboardLayout/
│   │   │       ├── AuthLayout/
│   │   │       └── index.ts
│   │   ├── pages/                   # Page components
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ForgotPassword.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── index.ts
│   │   │   ├── cases/
│   │   │   │   ├── Cases.tsx
│   │   │   │   ├── CaseDetail.tsx
│   │   │   │   └── CreateCase.tsx
│   │   │   ├── knowledge/
│   │   │   │   ├── KnowledgeBase.tsx
│   │   │   │   └── ArticleView.tsx
│   │   │   ├── community/
│   │   │   │   ├── Community.tsx
│   │   │   │   └── PostView.tsx
│   │   │   └── profile/
│   │   │       └── Profile.tsx
│   │   ├── services/                # API services
│   │   │   ├── api.ts               # Axios configuration
│   │   │   ├── authService.ts       # Authentication API
│   │   │   ├── caseService.ts       # Case management API
│   │   │   ├── knowledgeService.ts  # Knowledge base API
│   │   │   ├── communityService.ts  # Community API
│   │   │   └── index.ts
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts           # Authentication hook
│   │   │   ├── useApi.ts            # API calling hook
│   │   │   ├── useLocalStorage.ts   # Local storage hook
│   │   │   └── index.ts
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.tsx      # Authentication context
│   │   │   ├── ThemeContext.tsx     # Theme context
│   │   │   └── index.ts
│   │   ├── store/                   # Redux store
│   │   │   ├── slices/              # Redux slices
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── caseSlice.ts
│   │   │   │   ├── knowledgeSlice.ts
│   │   │   │   └── communitySlice.ts
│   │   │   ├── store.ts             # Store configuration
│   │   │   └── index.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.ts         # App constants
│   │   │   ├── helpers.ts           # Helper functions
│   │   │   ├── validators.ts        # Form validators
│   │   │   └── formatters.ts        # Data formatters
│   │   ├── styles/                  # Styling files
│   │   │   ├── globals.css          # Global styles
│   │   │   ├── theme.ts             # MUI theme
│   │   │   └── variables.css        # CSS variables
│   │   ├── assets/                  # Static assets
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   ├── types/                   # TypeScript types
│   │   │   ├── auth.ts
│   │   │   ├── case.ts
│   │   │   ├── knowledge.ts
│   │   │   ├── community.ts
│   │   │   └── index.ts
│   │   ├── App.tsx                  # Main App component
│   │   ├── index.tsx                # Entry point
│   │   └── setupTests.ts            # Test setup
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
├── docs/                           # Documentation
│   ├── api/                        # API documentation
│   │   ├── authentication.md
│   │   ├── cases.md
│   │   ├── knowledge.md
│   │   └── community.md
│   ├── deployment/                 # Deployment guides
│   │   ├── docker.md
│   │   ├── aws.md
│   │   └── production.md
│   └── user-guides/               # User documentation
│       ├── getting-started.md
│       └── features.md
├── scripts/                       # Build/deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── seed-data.js
├── docker/                        # Docker configurations
│   ├── nginx/
│   │   └── nginx.conf
│   └── mongodb/
│       └── init.js
├── .github/                       # GitHub workflows
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── docker-compose.yml             # Production docker compose
├── docker-compose.dev.yml         # Development docker compose
├── .gitignore
├── README.md
└── CHANGELOG.md

# Customer Self-Service Portal with Salesforce Integration

A comprehensive, production-ready customer self-service portal built with React.js, Node.js, MongoDB, and Salesforce REST API integration. This application enables customers to manage support cases, access knowledge base articles, and participate in community discussions.

## 🚀 Features

### Core Functionality
- **Real-time Case Management**: Create, view, update, and track support cases
- **Knowledge Base**: Search and browse help articles and documentation
- **Community Forum**: Ask questions, share solutions, and interact with other users
- **User Authentication**: Secure JWT-based authentication with role management
- **Salesforce Integration**: Seamless synchronization with Salesforce Cases and Knowledge Articles

### Technical Highlights
- **Scalable Architecture**: Microservice-ready modular design
- **High Performance**: Redis caching, optimized database queries, and CDN support
- **Security First**: Input validation, rate limiting, and security headers
- **Production Ready**: Docker containerization, monitoring, and comprehensive logging
- **Developer Experience**: TypeScript, ESLint, Prettier, and automated testing

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session storage and caching
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest with Supertest

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit + React Query
- **UI Library**: Material-UI (MUI) 5
- **Routing**: React Router 6
- **Forms**: Formik with Yup validation
- **Testing**: React Testing Library + Jest

### Integration & DevOps
- **Salesforce**: REST API integration
- **Containerization**: Docker & Docker Compose
- **Load Balancer**: Nginx
- **Monitoring**: Winston logging + Sentry (optional)
- **CI/CD**: GitHub Actions (optional)

## 📁 Project Structure

```
customer-self-service-portal/
├── backend/                     # Node.js API Server
│   ├── src/
│   │   ├── config/             # Database, Redis, Swagger configs
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic & external APIs
│   │   ├── utils/             # Helper functions
│   │   └── server.ts          # Express app setup
│   ├── tests/                 # Test files
│   ├── package.json
│   └── Dockerfile

├── frontend/                   # React.js Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store & slices
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Helper functions
│   │   └── App.tsx           # Main App component
│   ├── public/
│   ├── package.json
│   └── Dockerfile

├── docs/                      # Documentation
├── docker/                    # Docker configurations
├── scripts/                   # Build/deployment scripts
├── docker-compose.yml         # Development environment
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB 5.0+
- Redis 6+
- Salesforce Developer Account
- Docker & Docker Compose (optional)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd customer-self-service-portal
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your configuration
```

4. **Start Services**
```bash
# Option 1: Using Docker Compose (Recommended)
docker-compose up -d

# Option 2: Manual startup
# Terminal 1: Start MongoDB and Redis
mongod
redis-server

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm start
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/customer-portal
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE_TIME=7d

# Salesforce
SALESFORCE_INSTANCE_URL=https://yourdomain.my.salesforce.com
SALESFORCE_CLIENT_ID=your-client-id
SALESFORCE_CLIENT_SECRET=your-client-secret
SALESFORCE_USERNAME=your-username
SALESFORCE_PASSWORD=your-password
SALESFORCE_SECURITY_TOKEN=your-security-token
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Customer Portal
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
```

### Salesforce Setup

1. **Create Connected App**
   - Go to Setup → App Manager → New Connected App
   - Enable OAuth Settings
   - Add Required OAuth Scopes: `api`, `refresh_token`
   - Note down Client ID and Client Secret

2. **Configure User**
   - Reset Security Token if needed
   - Ensure user has appropriate permissions for Cases and Knowledge Articles

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start           # Start production server
npm test            # Run tests
npm run lint        # Lint code
npm run format      # Format code
```

#### Frontend
```bash
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
npm run lint        # Lint code
npm run format      # Format code
```

### API Documentation

Access the interactive API documentation at http://localhost:5000/api-docs

Key endpoints:
- `POST /api/auth/login` - User authentication
- `GET /api/cases` - List user cases
- `POST /api/cases` - Create new case
- `GET /api/knowledge` - Browse knowledge articles
- `GET /api/community` - Community posts

## 🏗️ Architecture Decisions

### Why This Tech Stack?

#### Backend Technologies
- **Node.js + Express**: Fast, lightweight, and excellent for API development
- **MongoDB**: Flexible document structure perfect for varying case data
- **Redis**: High-performance caching for improved response times
- **TypeScript**: Type safety and better developer experience

#### Frontend Technologies
- **React**: Component-based architecture for maintainable UI
- **Redux Toolkit**: Predictable state management with less boilerplate
- **Material-UI**: Professional design system with accessibility support
- **React Query**: Server state management with caching and optimistic updates

#### Integration & DevOps
- **Docker**: Consistent development and deployment environments
- **Salesforce REST API**: Leverage existing CRM data and processes
- **JWT Authentication**: Stateless authentication suitable for distributed systems

### Performance Optimizations
- Redis caching for frequently accessed data
- Database indexing for optimized queries
- Code splitting and lazy loading in React
- Image optimization and CDN support
- Compression middleware for API responses

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration
- Security headers with Helmet.js

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.yml up -d

# Or build individual services
docker build -t customer-portal-backend ./backend
docker build -t customer-portal-frontend ./frontend
```

### Manual Deployment
1. Build backend: `npm run build`
2. Build frontend: `npm run build`
3. Deploy built files to your hosting platform
4. Configure environment variables
5. Start services with process manager (PM2, etc.)

## 📊 Monitoring & Analytics

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking and alerting
- Performance monitoring

### Health Checks
- Database connectivity checks
- External API health monitoring
- System resource monitoring
- Custom health check endpoints

## 🧪 Testing

### Backend Testing
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Testing
```bash
npm test                   # Run all tests
npm run test:coverage     # Coverage report
```

Test coverage includes:
- Unit tests for utilities and services
- Integration tests for API endpoints
- Component tests for UI elements
- End-to-end tests for critical user flows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an [issue](../../issues)
- Contact the development team

## 🔮 Roadmap

### Upcoming Features
- [ ] Mobile responsive design improvements
- [ ] Push notifications
- [ ] Advanced search with filters
- [ ] File attachments for cases
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced analytics dashboard
- [ ] SSO integration
- [ ] Automated case routing
- [ ] AI-powered suggestions
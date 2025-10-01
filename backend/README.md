# Alumni Management Backend

A comprehensive Express.js backend for the Alumni Management Dashboard application with full CRUD operations, authentication, file uploads, and analytics.

## 🚀 Features

### Core Functionality
- **Alumni Management**: Complete CRUD operations for alumni profiles
- **Event Management**: Event creation, registration, and attendance tracking
- **Communication System**: Mass communications, templates, and delivery tracking
- **Donation Management**: Donation processing, campaigns, and analytics
- **Mentorship Program**: Mentor-mentee matching and connection management
- **Dashboard Analytics**: Real-time metrics and activity feeds

### Technical Features
- **Authentication**: Clerk integration with JWT token validation
- **Database**: MongoDB with Mongoose ODM and comprehensive schemas
- **File Uploads**: Secure file handling with image processing
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Rate limiting, input sanitization, and security headers
- **Caching**: In-memory caching for performance optimization
- **Validation**: Comprehensive request validation with express-validator
- **Error Handling**: Global error handling with detailed error responses
- **Logging**: Structured logging with Winston

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   ├── logger.ts    # Winston logger setup
│   │   └── swagger.ts   # API documentation
│   ├── controllers/     # Route controllers
│   │   └── dashboardController.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # Authentication middleware
│   │   ├── errorHandler.ts # Error handling
│   │   ├── security.ts  # Security middleware
│   │   └── validation.ts # Request validation
│   ├── models/          # Mongoose schemas
│   │   ├── AlumniProfile.ts
│   │   ├── Communication.ts
│   │   ├── Donation.ts
│   │   ├── Event.ts
│   │   ├── Mentorship.ts
│   │   └── User.ts
│   ├── routes/          # API routes
│   │   ├── alumni.ts
│   │   ├── auth.ts
│   │   ├── communications.ts
│   │   ├── dashboard.ts
│   │   ├── donations.ts
│   │   ├── events.ts
│   │   ├── mentorship.ts
│   │   ├── upload.ts
│   │   └── webhooks.ts
│   ├── scripts/         # Utility scripts
│   │   └── seed.ts      # Database seeding
│   ├── services/        # Business logic services
│   │   ├── cacheService.ts
│   │   └── uploadService.ts
│   └── server.ts        # Main application file
├── uploads/             # File upload directory
├── logs/               # Application logs
└── tests/              # Test files
```

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/alumni-management
MONGODB_TEST_URI=mongodb://localhost:27017/alumni-management-test

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Logging
LOG_LEVEL=info
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Seed the database (optional):**
```bash
npm run seed
```

## 📚 API Documentation

### Interactive Documentation
Visit `http://localhost:5000/api-docs` when the server is running to access the interactive Swagger UI documentation.

### API Endpoints Overview

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/webhooks/clerk` - Clerk webhook handler

#### Alumni Management
- `GET /api/alumni` - List alumni with filters and search
- `GET /api/alumni/:id` - Get specific alumni profile
- `POST /api/alumni` - Create alumni profile (admin)
- `PUT /api/alumni/:id` - Update alumni profile
- `DELETE /api/alumni/:id` - Delete alumni profile (admin)
- `GET /api/alumni/stats/overview` - Alumni statistics (admin)

#### Event Management
- `GET /api/events` - List events with filters
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Cancel registration
- `GET /api/events/:id/attendees` - Get event attendees (admin)
- `GET /api/events/stats/overview` - Event statistics (admin)

#### Communication System
- `GET /api/communications` - List communications (admin)
- `GET /api/communications/:id` - Get specific communication (admin)
- `POST /api/communications` - Create communication (admin)
- `PUT /api/communications/:id` - Update communication (admin)
- `DELETE /api/communications/:id` - Delete communication (admin)
- `POST /api/communications/:id/send` - Send communication (admin)
- `GET /api/communications/templates/list` - List templates (admin)
- `POST /api/communications/templates` - Create template (admin)
- `GET /api/communications/stats/overview` - Communication statistics (admin)

#### Donation Management
- `GET /api/donations` - List donations (admin)
- `GET /api/donations/:id` - Get specific donation (admin)
- `POST /api/donations` - Create donation
- `PUT /api/donations/:id/status` - Update donation status (admin)
- `GET /api/donations/campaigns/list` - List campaigns
- `GET /api/donations/campaigns/:id` - Get specific campaign
- `POST /api/donations/campaigns` - Create campaign (admin)
- `PUT /api/donations/campaigns/:id` - Update campaign (admin)
- `GET /api/donations/stats/overview` - Donation statistics (admin)

#### Mentorship Program
- `GET /api/mentorship/connections` - List mentorship connections
- `GET /api/mentorship/mentors` - List available mentors
- `GET /api/mentorship/mentors/:id` - Get specific mentor profile
- `POST /api/mentorship/mentors` - Create mentor profile
- `POST /api/mentorship/mentees` - Create mentee profile
- `POST /api/mentorship/connections` - Request mentorship connection
- `PUT /api/mentorship/connections/:id/status` - Update connection status
- `POST /api/mentorship/connections/:id/feedback` - Add feedback
- `GET /api/mentorship/stats/overview` - Mentorship statistics (admin)

#### Dashboard & Analytics
- `GET /api/dashboard/metrics` - Dashboard metrics
- `GET /api/dashboard/activities` - Recent activities

#### File Upload
- `POST /api/upload/profile-image` - Upload profile image
- `POST /api/upload/event-image` - Upload event image (admin)
- `POST /api/upload/documents` - Upload documents (admin)
- `DELETE /api/upload/delete` - Delete uploaded file (admin)

## 🔒 Security Features

### Authentication & Authorization
- **Clerk Integration**: Secure JWT token validation
- **Role-based Access Control**: Admin, Alumni, and Guest roles
- **Route Protection**: Middleware for authenticated and admin routes

### Security Middleware
- **Rate Limiting**: Configurable rate limits for different endpoints
- **Input Sanitization**: XSS protection and input cleaning
- **Security Headers**: Helmet.js for security headers
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Request Size Limiting**: Protection against large payloads

### File Upload Security
- **File Type Validation**: Whitelist of allowed file types
- **File Size Limits**: Configurable maximum file sizes
- **Secure File Storage**: Organized upload directory structure
- **Path Traversal Protection**: Prevention of directory traversal attacks

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- Unit tests for models and services
- Integration tests for API endpoints
- Authentication and authorization tests
- File upload functionality tests

## 📊 Database Seeding

The application includes a comprehensive seeding script to populate the database with sample data:

```bash
npm run seed
```

**Seeded Data Includes:**
- 6 sample users (1 admin, 5 alumni)
- 5 alumni profiles with realistic data
- 3 sample events with registrations
- 2 donation campaigns with donations
- Communication templates and sent communications
- Mentor/mentee profiles and connections

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
CLERK_SECRET_KEY=your_production_clerk_secret
API_BASE_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Performance Features

### Caching
- **In-memory Caching**: Dashboard metrics and activities caching
- **TTL Support**: Configurable time-to-live for cached data
- **Cache Invalidation**: Automatic cleanup of expired entries

### Database Optimization
- **Indexing**: Optimized database indexes for common queries
- **Aggregation Pipelines**: Efficient data aggregation for analytics
- **Connection Pooling**: MongoDB connection pool management

### File Management
- **Automatic Cleanup**: Scheduled cleanup of temporary files
- **Image Processing**: Optimized image resizing and compression
- **Static File Serving**: Efficient static file delivery

## 🔧 Development Tools

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Code Quality
- **TypeScript**: Full TypeScript support with strict mode
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the logs in the `logs/` directory
- Check the GitHub issues for known problems
- Contact the development team

---

**Built with ❤️ using Express.js, MongoDB, and TypeScript**
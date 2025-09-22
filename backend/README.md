# Alumni Management Backend

Express.js backend API for the Alumni Management Dashboard application.

## Features

- **Express.js** server with TypeScript
- **MongoDB** with Mongoose ODM
- **Clerk** authentication integration
- Comprehensive data models for alumni management
- Database seeding scripts
- Security middleware (Helmet, CORS, Rate Limiting)
- Structured logging with Winston
- Unit testing with Jest

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/alumni-management
PORT=5000
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=http://localhost:3000
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or your configured PORT).

## Database Setup

### Seed the Database

To populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample users (admin and alumni)
- Alumni profiles
- Events
- Donation campaigns
- Communication templates

### Database Models

The application includes the following data models:

- **User**: Authentication and basic user information
- **AlumniProfile**: Detailed alumni information
- **Event**: Event management and registrations
- **Donation**: Donation tracking and campaigns
- **Communication**: Email communications and templates
- **Mentorship**: Mentor/mentee connections and profiles

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (Clerk Integration)
- `POST /api/auth/webhook` - Clerk webhook for user events
- `GET /api/auth/me` - Get current user profile

### Alumni Management
- `GET /api/alumni` - List alumni with filters
- `GET /api/alumni/:id` - Get alumni profile
- `POST /api/alumni` - Create alumni profile
- `PUT /api/alumni/:id` - Update alumni profile

*Note: Additional API routes will be implemented in subsequent tasks.*

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── logger.ts    # Winston logger setup
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── AlumniProfile.ts
│   │   ├── Event.ts
│   │   ├── Donation.ts
│   │   ├── Communication.ts
│   │   ├── Mentorship.ts
│   │   └── index.ts
│   ├── scripts/         # Database seeding scripts
│   │   ├── seed.ts
│   │   └── seeders/
│   ├── tests/           # Test files
│   └── server.ts        # Main server file
├── logs/                # Log files
├── .env.example         # Environment variables template
├── .env.test           # Test environment variables
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/alumni-management |
| `MONGODB_TEST_URI` | Test database connection string | mongodb://localhost:27017/alumni-management-test |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | - |
| `CLERK_SECRET_KEY` | Clerk secret key | - |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook secret | - |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `LOG_LEVEL` | Logging level | info |

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request rate limiting per IP
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Structured error responses

## Logging

The application uses Winston for structured logging:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development mode

## Next Steps

This completes the database schema and connection setup. The next tasks will involve:
1. Configuring Clerk authentication in the Next.js frontend
2. Building authentication UI and flows
3. Setting up Clerk webhooks and user synchronization
# Clerk Integration Implementation

This document describes the implementation of Clerk webhooks and user synchronization in the Express.js backend for the Alumni Management Dashboard.

## Implementation Overview

The task has been completed with the following components:

### 1. Clerk Webhook Endpoints (`src/routes/webhooks.ts`)

**Features Implemented:**
- Webhook endpoint at `/api/webhooks/clerk` for handling Clerk user events
- Webhook signature verification using Svix
- Support for user.created, user.updated, and user.deleted events
- Automatic user synchronization between Clerk and MongoDB
- Comprehensive error handling and logging

**Key Functions:**
- `handleUserCreated()` - Creates new user records in MongoDB when users sign up via Clerk
- `handleUserUpdated()` - Updates existing user records when Clerk user data changes
- `handleUserDeleted()` - Removes user records when users are deleted from Clerk

### 2. Authentication Middleware (`src/middleware/auth.ts`)

**Features Implemented:**
- `requireAuth` - Middleware to require valid Clerk authentication tokens
- `withAuth` - Optional authentication middleware for public endpoints
- `loadUser` - Middleware to load user data from MongoDB after authentication
- `requireAdmin` - Role-based access control for admin-only endpoints
- `requireAlumni` - Role-based access control for alumni endpoints
- `syncUserFromClerk` - Utility function to sync user data from Clerk to MongoDB

**Authentication Flow:**
1. Extract Bearer token from Authorization header
2. Verify token using Clerk's `verifyToken` function
3. Load user data from MongoDB using Clerk user ID
4. Attach user data to request object for downstream middleware

### 3. User Management API Routes (`src/routes/auth.ts`)

**Endpoints Implemented:**
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/sync` - Manually sync user data from Clerk
- `PUT /api/auth/role` - Update user role (admin only)
- `GET /api/auth/users` - List all users with pagination (admin only)
- `DELETE /api/auth/users/:userId` - Delete user (admin only)

### 4. User Model Integration

**Database Schema:**
- `clerkUserId` - Unique identifier from Clerk (indexed)
- `email` - User email address (unique, indexed)
- `role` - User role ('admin' | 'alumni')
- `oauthProvider` - OAuth provider used ('google' | 'linkedin')
- Automatic timestamps (createdAt, updatedAt)

### 5. Comprehensive Test Suite

**Test Files Created:**
- `src/tests/auth.test.ts` - Integration tests for webhook endpoints and API routes
- `src/tests/middleware.test.ts` - Unit tests for authentication middleware
- `src/tests/clerk-integration.test.ts` - Tests for Clerk user synchronization
- `src/tests/user-sync.test.ts` - Tests for user model validation
- `src/tests/basic-functionality.test.ts` - Basic functionality verification

**Test Coverage:**
- Webhook event handling (user.created, user.updated, user.deleted)
- Authentication middleware functionality
- User synchronization logic
- Role-based access control
- API endpoint behavior
- Database model validation

## Configuration Requirements

### Environment Variables

Add the following to your `.env` file:

```bash
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Database
MONGODB_URI=mongodb://localhost:27017/alumni-management

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Dependencies Installed

- `@clerk/backend` - Clerk backend SDK for token verification and user management
- `svix` - Webhook signature verification library
- `supertest` - HTTP testing library
- `mongodb-memory-server` - In-memory MongoDB for testing

## Usage Examples

### Setting up Webhook in Clerk Dashboard

1. Go to your Clerk Dashboard
2. Navigate to Webhooks section
3. Add endpoint: `https://your-backend-domain.com/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy the webhook secret to your environment variables

### Using Authentication Middleware

```typescript
import { authenticatedRoute, adminRoute } from './middleware/auth';

// Require authentication
router.get('/protected', authenticatedRoute, (req, res) => {
  // req.user contains the authenticated user data
  res.json({ user: req.user });
});

// Require admin role
router.post('/admin-only', adminRoute, (req, res) => {
  // Only admin users can access this endpoint
  res.json({ message: 'Admin access granted' });
});
```

### Frontend Integration

The frontend should include the Clerk token in API requests:

```typescript
const token = await getToken();
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Security Features

1. **Webhook Signature Verification** - All webhooks are verified using Svix signatures
2. **Token Verification** - All API requests require valid Clerk tokens
3. **Role-Based Access Control** - Different endpoints require different user roles
4. **Input Validation** - All user inputs are validated and sanitized
5. **Error Handling** - Comprehensive error handling with appropriate HTTP status codes
6. **Rate Limiting** - Built-in rate limiting to prevent abuse

## Error Handling

The implementation includes comprehensive error handling:

- **401 Unauthorized** - Invalid or missing authentication token
- **403 Forbidden** - Insufficient permissions for the requested action
- **404 Not Found** - User or resource not found
- **400 Bad Request** - Invalid request data or missing required fields
- **500 Internal Server Error** - Server-side errors with detailed logging

## Logging

All authentication events are logged using Winston:

- User creation/update/deletion events
- Authentication failures
- Authorization denials
- API access patterns
- Error conditions

## Requirements Fulfilled

This implementation fulfills all requirements from the task specification:

✅ **Requirement 1.4** - User authentication and session management
✅ **Requirement 1.5** - User profile synchronization between Clerk and MongoDB
✅ **Requirement 1.6** - Role-based access control and user management

The implementation provides a robust, secure, and scalable authentication system that integrates seamlessly with Clerk's authentication service while maintaining user data in the local MongoDB database.
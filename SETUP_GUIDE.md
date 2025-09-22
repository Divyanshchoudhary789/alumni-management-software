# Alumni Management Dashboard Setup Guide

## Quick Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and update the following values:

```bash
cp .env.example .env.local
```

### 2. Clerk Authentication Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select existing one
3. Go to **API Keys** section
4. Copy your keys and update `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your-actual-key-here"
CLERK_SECRET_KEY="sk_test_your-actual-key-here"
CLERK_WEBHOOK_SECRET="whsec_your-actual-webhook-secret"
```

### 3. OAuth Providers (Optional)

To enable Google/LinkedIn sign-in:

1. In Clerk Dashboard, go to **User & Authentication** > **Social Connections**
2. Enable Google and/or LinkedIn
3. Configure OAuth credentials from respective providers

### 4. Database Setup

Update the database URL in `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/alumni_db"
```

Or use MongoDB:

```env
DATABASE_URL="mongodb://localhost:27017/alumni_db"
```

### 5. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 6. Run the Application

```bash
# Frontend (from root)
npm run dev

# Backend (from backend directory)
cd backend
npm run dev
```

## Troubleshooting

### Clerk Middleware Error

If you see "clerkMiddleware() was not run", ensure:
- Middleware file is at `src/middleware.ts` (not root `middleware.ts`)
- Environment variables are properly set
- Clerk keys are valid (not placeholder values)

### Invalid Publishable Key

- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_test_` or `pk_live_`
- Key should be from your actual Clerk application
- No quotes or extra spaces in the key

### Database Connection Issues

- Ensure database server is running
- Check connection string format
- Verify database exists and user has proper permissions

## Development

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

### Building for Production

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

## Support

If you encounter issues:
1. Check the console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that services (database, Clerk) are properly configured
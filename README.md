# Alumni Management Dashboard

A comprehensive web application for managing alumni networks, built with Next.js 14, Mantine UI v8, and TypeScript.

## Features

- **Dashboard Overview**: Key metrics and recent activities
- **Alumni Directory**: Searchable and filterable alumni profiles
- **Event Management**: Create and manage alumni events
- **Communication Tools**: Send newsletters and announcements
- **Donation Tracking**: Monitor and manage donations
- **Mentorship Program**: Connect mentors with mentees
- **Analytics & Reporting**: Data insights and custom reports
- **System Administration**: User management and settings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **UI Library**: Mantine UI v8
- **Styling**: PostCSS with Mantine preset
- **Code Quality**: ESLint, Prettier, TypeScript
- **Database**: PostgreSQL (planned)
- **Authentication**: JWT-based authentication (planned)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alumni-management-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local` with your actual values.

5. Validate your environment setup:
```bash
npm run validate-env
```

6. Run the development server:
```bash
npm run dev
```

7. In a separate terminal, start the backend:
```bash
cd backend
npm install
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run validate-env` - Validate environment configuration
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
├── stores/                # State management
├── types/                 # TypeScript definitions
└── styles/                # Additional styles
```

## Environment Variables

See `.env.example` for all required environment variables.

### Clerk Authentication Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your publishable key and secret key
4. Update `.env.local` with the actual keys (not placeholder values)

### Troubleshooting

If you encounter authentication errors:
- Ensure Clerk keys are valid (start with `pk_test_` and `sk_test_`)
- Check that `src/middleware.ts` exists
- Run `npm run validate-env` to check configuration

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/dashboard'
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      fullName: 'Test User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      imageUrl: 'https://example.com/avatar.jpg',
      publicMetadata: { role: 'admin' },
    },
    isLoaded: true,
  }),
  useClerk: () => ({
    signOut: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()
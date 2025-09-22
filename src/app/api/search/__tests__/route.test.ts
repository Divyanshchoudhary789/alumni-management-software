import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

const { auth } = require('@clerk/nextjs/server');

describe('/api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    auth.mockResolvedValue({ userId: null });
    
    const request = new NextRequest('http://localhost:3000/api/search?q=test');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns empty results for short queries', async () => {
    auth.mockResolvedValue({ userId: 'test-user-id' });
    
    const request = new NextRequest('http://localhost:3000/api/search?q=a');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results).toEqual([]);
  });

  it('returns empty results when no query provided', async () => {
    auth.mockResolvedValue({ userId: 'test-user-id' });
    
    const request = new NextRequest('http://localhost:3000/api/search');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results).toEqual([]);
  });

  it('returns filtered mock results for valid queries', async () => {
    auth.mockResolvedValue({ userId: 'test-user-id' });
    
    const request = new NextRequest('http://localhost:3000/api/search?q=john');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results).toHaveLength(1);
    expect(data.results[0].title).toBe('John Doe');
    expect(data.results[0].type).toBe('alumni');
  });

  it('returns multiple results for broader queries', async () => {
    auth.mockResolvedValue({ userId: 'test-user-id' });
    
    const request = new NextRequest('http://localhost:3000/api/search?q=event');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.results.some((r: any) => r.type === 'event')).toBe(true);
  });

  it('handles case-insensitive search', async () => {
    auth.mockResolvedValue({ userId: 'test-user-id' });
    
    const request = new NextRequest('http://localhost:3000/api/search?q=JOHN');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results).toHaveLength(1);
    expect(data.results[0].title).toBe('John Doe');
  });
});
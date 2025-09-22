import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Mock search results for development
    const mockResults = [
      {
        id: '1',
        type: 'alumni',
        title: 'John Doe',
        description: 'Class of 2020, Software Engineer at Tech Corp',
        url: '/dashboard/alumni/1',
      },
      {
        id: '2',
        type: 'event',
        title: 'Alumni Networking Event',
        description: 'Annual networking event - March 15, 2024',
        url: '/dashboard/events/2',
      },
      {
        id: '3',
        type: 'communication',
        title: 'Monthly Newsletter',
        description: 'February 2024 newsletter',
        url: '/dashboard/communications/3',
      },
      {
        id: '4',
        type: 'alumni',
        title: 'Sarah Johnson',
        description: 'Class of 2018, Marketing Manager at Solutions Inc',
        url: '/dashboard/alumni/4',
      },
      {
        id: '5',
        type: 'event',
        title: 'Tech Talk Series',
        description: 'Monthly tech talks for alumni',
        url: '/dashboard/events/5',
      },
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ results: mockResults });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
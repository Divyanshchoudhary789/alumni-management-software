import { apiClient } from '@/lib/api';
import { Event, EventRegistration } from '@/types';

export interface EventsListResponse {
  events: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRegistrations: number;
  averageAttendance: number;
  monthlyEvents: Array<{ month: string; count: number }>;
  popularEvents: Array<{ title: string; registrations: number }>;
}

class EventsApiService {
  // Get all events with filters
  async getEvents(filters: EventFilters = {}): Promise<EventsListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<EventsListResponse>(endpoint);
  }

  // Get single event
  async getEventById(id: string): Promise<Event> {
    return apiClient.get<Event>(`/api/events/${id}`);
  }

  // Create event (admin only)
  async createEvent(data: Partial<Event>): Promise<Event> {
    return apiClient.post<Event>('/api/events', data);
  }

  // Update event (admin only)
  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    return apiClient.put<Event>(`/api/events/${id}`, data);
  }

  // Delete event (admin only)
  async deleteEvent(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/events/${id}`);
  }

  // Register for event
  async registerForEvent(eventId: string): Promise<{ message: string; registration: EventRegistration }> {
    return apiClient.post<{ message: string; registration: EventRegistration }>(`/api/events/${eventId}/register`);
  }

  // Unregister from event
  async unregisterFromEvent(eventId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/events/${eventId}/register`);
  }

  // Get event attendees (admin only)
  async getEventAttendees(eventId: string): Promise<{
    attendees: Array<{
      registration: EventRegistration;
      alumni: any;
    }>;
    stats: {
      totalRegistered: number;
      attended: number;
      cancelled: number;
    };
  }> {
    return apiClient.get(`/api/events/${eventId}/attendees`);
  }

  // Get events statistics (admin only)
  async getEventsStats(): Promise<EventStats> {
    return apiClient.get<EventStats>('/api/events/stats/overview');
  }

  // Search events
  async searchEvents(query: string): Promise<Event[]> {
    const response = await this.getEvents({ search: query, limit: 10 });
    return response.events;
  }
}

export const eventsApiService = new EventsApiService();
import { Event, EventRegistration } from '@/types';
import { mockData } from '@/lib/mock-data';
import {
  simulateDelay,
  simulateError,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  filterByText,
  sortByField,
  generateId,
  mockErrors,
  MockApiResponse,
  PaginatedResponse
} from './base';

// In-memory storage for mock data
let eventsData = [...mockData.events];
let registrationsData = [...mockData.eventRegistrations];

export interface EventFilters {
  search?: string;
  status?: Event['status'];
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
}

export interface EventSortOptions {
  field: keyof Event;
  direction: 'asc' | 'desc';
}

class MockEventService {
  // Get all events with filtering, sorting, and pagination
  async getEvents(
    filters?: EventFilters,
    sort?: EventSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Event>> {
    await simulateDelay();
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    let filteredEvents = [...eventsData];
    
    // Apply filters
    if (filters) {
      if (filters.search) {
        filteredEvents = filterByText(filteredEvents, filters.search, [
          'title', 'description', 'location'
        ]);
      }
      
      if (filters.status) {
        filteredEvents = filteredEvents.filter(e => e.status === filters.status);
      }
      
      if (filters.dateFrom) {
        filteredEvents = filteredEvents.filter(e => e.eventDate >= filters.dateFrom!);
      }
      
      if (filters.dateTo) {
        filteredEvents = filteredEvents.filter(e => e.eventDate <= filters.dateTo!);
      }
      
      if (filters.location) {
        filteredEvents = filteredEvents.filter(e => 
          e.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
    }
    
    // Apply sorting
    if (sort) {
      filteredEvents = sortByField(filteredEvents, sort.field, sort.direction);
    } else {
      // Default sort by event date
      filteredEvents = sortByField(filteredEvents, 'eventDate', 'asc');
    }
    
    // Add registration counts to events
    const eventsWithRegistrations = filteredEvents.map(event => ({
      ...event,
      registrations: registrationsData.filter(r => r.eventId === event.id)
    }));
    
    return createPaginatedResponse(eventsWithRegistrations, page, limit);
  }
  
  // Get single event
  async getEventById(id: string): Promise<MockApiResponse<Event>> {
    await simulateDelay(100, 300);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const event = eventsData.find(e => e.id === id);
    
    if (!event) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    // Add registrations to event
    const eventWithRegistrations = {
      ...event,
      registrations: registrationsData.filter(r => r.eventId === id)
    };
    
    return createSuccessResponse(eventWithRegistrations);
  }
  
  // Create new event
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'registrations'>): Promise<MockApiResponse<Event>> {
    await simulateDelay(300, 600);
    
    if (simulateError(0.03)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    // Validate required fields
    if (!eventData.title || !eventData.eventDate || !eventData.location) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Title, event date, and location are required.'
      });
    }
    
    // Validate event date is in the future for published events
    if (eventData.status === 'published' && eventData.eventDate <= new Date()) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Published events must have a future date.'
      });
    }
    
    const newEvent: Event = {
      ...eventData,
      id: generateId(),
      registrations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    eventsData.push(newEvent);
    
    return createSuccessResponse(newEvent, 'Event created successfully');
  }
  
  // Update event
  async updateEvent(id: string, updates: Partial<Event>): Promise<MockApiResponse<Event>> {
    await simulateDelay(200, 500);
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const eventIndex = eventsData.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const existingEvent = eventsData[eventIndex];
    
    // Validate updates
    if (updates.title === '') {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Event title cannot be empty.'
      });
    }
    
    // Don't allow changing past events to published
    if (updates.status === 'published' && updates.eventDate && updates.eventDate <= new Date()) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Cannot publish events with past dates.'
      });
    }
    
    const updatedEvent = {
      ...existingEvent,
      ...updates,
      updatedAt: new Date()
    };
    
    eventsData[eventIndex] = updatedEvent;
    
    // Add registrations
    const eventWithRegistrations = {
      ...updatedEvent,
      registrations: registrationsData.filter(r => r.eventId === id)
    };
    
    return createSuccessResponse(eventWithRegistrations, 'Event updated successfully');
  }
  
  // Delete event
  async deleteEvent(id: string): Promise<MockApiResponse<{ id: string }>> {
    await simulateDelay(200, 400);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const eventIndex = eventsData.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    // Remove event and all its registrations
    eventsData.splice(eventIndex, 1);
    registrationsData = registrationsData.filter(r => r.eventId !== id);
    
    return createSuccessResponse({ id }, 'Event deleted successfully');
  }
  
  // Register for event
  async registerForEvent(eventId: string, alumniId: string): Promise<MockApiResponse<EventRegistration>> {
    await simulateDelay(200, 400);
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const event = eventsData.find(e => e.id === eventId);
    
    if (!event) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    // Check if event is published and registration is open
    if (event.status !== 'published') {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Cannot register for unpublished events.'
      });
    }
    
    if (new Date() > event.registrationDeadline) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Registration deadline has passed.'
      });
    }
    
    // Check if already registered
    const existingRegistration = registrationsData.find(
      r => r.eventId === eventId && r.alumniId === alumniId
    );
    
    if (existingRegistration) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Already registered for this event.'
      });
    }
    
    // Check capacity
    const currentRegistrations = registrationsData.filter(
      r => r.eventId === eventId && r.status === 'registered'
    ).length;
    
    if (currentRegistrations >= event.capacity) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Event is at full capacity.'
      });
    }
    
    const newRegistration: EventRegistration = {
      id: generateId(),
      eventId,
      alumniId,
      registrationDate: new Date(),
      status: 'registered'
    };
    
    registrationsData.push(newRegistration);
    
    return createSuccessResponse(newRegistration, 'Successfully registered for event');
  }
  
  // Cancel event registration
  async cancelRegistration(eventId: string, alumniId: string): Promise<MockApiResponse<{ id: string }>> {
    await simulateDelay(150, 300);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const registrationIndex = registrationsData.findIndex(
      r => r.eventId === eventId && r.alumniId === alumniId
    );
    
    if (registrationIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const registration = registrationsData[registrationIndex];
    
    // Update status to cancelled instead of deleting
    registrationsData[registrationIndex] = {
      ...registration,
      status: 'cancelled'
    };
    
    return createSuccessResponse({ id: registration.id }, 'Registration cancelled successfully');
  }
  
  // Get event registrations
  async getEventRegistrations(eventId: string): Promise<MockApiResponse<EventRegistration[]>> {
    await simulateDelay(100, 250);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const event = eventsData.find(e => e.id === eventId);
    
    if (!event) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const registrations = registrationsData.filter(r => r.eventId === eventId);
    
    return createSuccessResponse(registrations);
  }
  
  // Get upcoming events
  async getUpcomingEvents(limit: number = 5): Promise<MockApiResponse<Event[]>> {
    await simulateDelay(100, 200);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const now = new Date();
    const upcomingEvents = eventsData
      .filter(e => e.status === 'published' && e.eventDate > now)
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
      .slice(0, limit)
      .map(event => ({
        ...event,
        registrations: registrationsData.filter(r => r.eventId === event.id)
      }));
    
    return createSuccessResponse(upcomingEvents);
  }
  
  // Get event statistics
  async getEventStats(): Promise<MockApiResponse<{
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    totalRegistrations: number;
    averageAttendance: number;
    popularEvents: Array<{ eventId: string; title: string; registrations: number }>;
  }>> {
    await simulateDelay(150, 300);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const now = new Date();
    const totalEvents = eventsData.length;
    const upcomingEvents = eventsData.filter(e => e.status === 'published' && e.eventDate > now).length;
    const completedEvents = eventsData.filter(e => e.status === 'completed').length;
    const totalRegistrations = registrationsData.filter(r => r.status === 'registered' || r.status === 'attended').length;
    
    // Calculate average attendance for completed events
    const completedEventsWithAttendance = eventsData
      .filter(e => e.status === 'completed')
      .map(event => {
        const registrations = registrationsData.filter(r => r.eventId === event.id);
        const attended = registrations.filter(r => r.status === 'attended').length;
        const registered = registrations.filter(r => r.status === 'registered' || r.status === 'attended').length;
        return registered > 0 ? (attended / registered) * 100 : 0;
      });
    
    const averageAttendance = completedEventsWithAttendance.length > 0
      ? completedEventsWithAttendance.reduce((sum, rate) => sum + rate, 0) / completedEventsWithAttendance.length
      : 0;
    
    // Get popular events
    const popularEvents = eventsData
      .map(event => ({
        eventId: event.id,
        title: event.title,
        registrations: registrationsData.filter(r => r.eventId === event.id && r.status !== 'cancelled').length
      }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 5);
    
    const stats = {
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalRegistrations,
      averageAttendance: Math.round(averageAttendance * 100) / 100,
      popularEvents
    };
    
    return createSuccessResponse(stats);
  }
}

export const mockEventService = new MockEventService();
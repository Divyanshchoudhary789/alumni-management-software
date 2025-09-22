import { MentorshipConnection } from '@/types';
import { mockData, mockMentorProfiles, mockMenteeRequests } from '@/lib/mock-data';
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
let mentorshipData = [...mockData.mentorshipConnections];
let mentorProfilesData = [...mockMentorProfiles];
let menteeRequestsData = [...mockMenteeRequests];

export interface MentorshipFilters {
  search?: string;
  status?: MentorshipConnection['status'];
  mentorId?: string;
  menteeId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MentorshipSortOptions {
  field: keyof MentorshipConnection;
  direction: 'asc' | 'desc';
}

class MockMentorshipService {
  // Get all mentorship connections with filtering, sorting, and pagination
  async getMentorshipConnections(
    filters?: MentorshipFilters,
    sort?: MentorshipSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<MentorshipConnection>> {
    await simulateDelay();
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    let filteredConnections = [...mentorshipData];
    
    // Apply filters
    if (filters) {
      if (filters.search) {
        filteredConnections = filterByText(filteredConnections, filters.search, [
          'notes'
        ]);
      }
      
      if (filters.status) {
        filteredConnections = filteredConnections.filter(c => c.status === filters.status);
      }
      
      if (filters.mentorId) {
        filteredConnections = filteredConnections.filter(c => c.mentorId === filters.mentorId);
      }
      
      if (filters.menteeId) {
        filteredConnections = filteredConnections.filter(c => c.menteeId === filters.menteeId);
      }
      
      if (filters.dateFrom) {
        filteredConnections = filteredConnections.filter(c => c.startDate >= filters.dateFrom!);
      }
      
      if (filters.dateTo) {
        filteredConnections = filteredConnections.filter(c => c.startDate <= filters.dateTo!);
      }
    }
    
    // Apply sorting
    if (sort) {
      filteredConnections = sortByField(filteredConnections, sort.field, sort.direction);
    } else {
      // Default sort by start date (newest first)
      filteredConnections = sortByField(filteredConnections, 'startDate', 'desc');
    }
    
    return createPaginatedResponse(filteredConnections, page, limit);
  }
  
  // Get single mentorship connection
  async getMentorshipById(id: string): Promise<MockApiResponse<MentorshipConnection>> {
    await simulateDelay(100, 300);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const connection = mentorshipData.find(c => c.id === id);
    
    if (!connection) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    return createSuccessResponse(connection);
  }
  
  // Create new mentorship connection
  async createMentorshipConnection(
    connectionData: Omit<MentorshipConnection, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MockApiResponse<MentorshipConnection>> {
    await simulateDelay(300, 600);
    
    if (simulateError(0.03)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    // Validate required fields
    if (!connectionData.mentorId || !connectionData.menteeId) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Mentor ID and mentee ID are required.'
      });
    }
    
    // Check if connection already exists
    const existingConnection = mentorshipData.find(
      c => c.mentorId === connectionData.mentorId && 
           c.menteeId === connectionData.menteeId &&
           (c.status === 'active' || c.status === 'pending')
    );
    
    if (existingConnection) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'An active or pending mentorship connection already exists between these users.'
      });
    }
    
    // Check mentor availability
    const mentorProfile = mentorProfilesData.find(p => p.alumniId === connectionData.mentorId);
    if (mentorProfile) {
      const activeMentorships = mentorshipData.filter(
        c => c.mentorId === connectionData.mentorId && c.status === 'active'
      ).length;
      
      if (activeMentorships >= mentorProfile.maxMentees) {
        throw createErrorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Mentor has reached maximum mentee capacity.'
        });
      }
    }
    
    const newConnection: MentorshipConnection = {
      ...connectionData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mentorshipData.push(newConnection);
    
    // Update mentor profile current mentees count
    if (mentorProfile && newConnection.status === 'active') {
      const profileIndex = mentorProfilesData.findIndex(p => p.alumniId === connectionData.mentorId);
      if (profileIndex !== -1) {
        mentorProfilesData[profileIndex].currentMentees++;
      }
    }
    
    return createSuccessResponse(newConnection, 'Mentorship connection created successfully');
  }
  
  // Update mentorship connection
  async updateMentorshipConnection(id: string, updates: Partial<MentorshipConnection>): Promise<MockApiResponse<MentorshipConnection>> {
    await simulateDelay(200, 500);
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const connectionIndex = mentorshipData.findIndex(c => c.id === id);
    
    if (connectionIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const existingConnection = mentorshipData[connectionIndex];
    
    const updatedConnection = {
      ...existingConnection,
      ...updates,
      updatedAt: new Date()
    };
    
    mentorshipData[connectionIndex] = updatedConnection;
    
    // Update mentor profile counts if status changed
    if (updates.status && updates.status !== existingConnection.status) {
      const mentorProfile = mentorProfilesData.find(p => p.alumniId === existingConnection.mentorId);
      if (mentorProfile) {
        const profileIndex = mentorProfilesData.findIndex(p => p.alumniId === existingConnection.mentorId);
        if (profileIndex !== -1) {
          if (existingConnection.status === 'active' && updates.status !== 'active') {
            mentorProfilesData[profileIndex].currentMentees--;
          } else if (existingConnection.status !== 'active' && updates.status === 'active') {
            mentorProfilesData[profileIndex].currentMentees++;
          }
        }
      }
    }
    
    return createSuccessResponse(updatedConnection, 'Mentorship connection updated successfully');
  }
  
  // Delete mentorship connection
  async deleteMentorshipConnection(id: string): Promise<MockApiResponse<{ id: string }>> {
    await simulateDelay(200, 400);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const connectionIndex = mentorshipData.findIndex(c => c.id === id);
    
    if (connectionIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const connection = mentorshipData[connectionIndex];
    
    // Update mentor profile count
    if (connection.status === 'active') {
      const mentorProfile = mentorProfilesData.find(p => p.alumniId === connection.mentorId);
      if (mentorProfile) {
        const profileIndex = mentorProfilesData.findIndex(p => p.alumniId === connection.mentorId);
        if (profileIndex !== -1) {
          mentorProfilesData[profileIndex].currentMentees--;
        }
      }
    }
    
    mentorshipData.splice(connectionIndex, 1);
    
    return createSuccessResponse({ id }, 'Mentorship connection deleted successfully');
  }
  
  // Get mentor profiles
  async getMentorProfiles(available?: boolean): Promise<MockApiResponse<typeof mentorProfilesData>> {
    await simulateDelay(100, 250);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    let profiles = [...mentorProfilesData];
    
    if (available !== undefined) {
      profiles = profiles.filter(p => 
        available ? (p.isActive && p.currentMentees < p.maxMentees) : !p.isActive || p.currentMentees >= p.maxMentees
      );
    }
    
    return createSuccessResponse(profiles);
  }
  
  // Get mentee requests
  async getMenteeRequests(status?: string): Promise<MockApiResponse<typeof menteeRequestsData>> {
    await simulateDelay(100, 250);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    let requests = [...menteeRequestsData];
    
    if (status) {
      requests = requests.filter(r => r.status === status);
    }
    
    return createSuccessResponse(requests);
  }
  
  // Create mentee request
  async createMenteeRequest(requestData: Omit<typeof menteeRequestsData[0], 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<MockApiResponse<typeof menteeRequestsData[0]>> {
    await simulateDelay(200, 400);
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    // Check if user already has a pending request
    const existingRequest = menteeRequestsData.find(
      r => r.alumniId === requestData.alumniId && r.status === 'pending'
    );
    
    if (existingRequest) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'You already have a pending mentorship request.'
      });
    }
    
    const newRequest = {
      ...requestData,
      id: generateId(),
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    menteeRequestsData.push(newRequest);
    
    return createSuccessResponse(newRequest, 'Mentorship request submitted successfully');
  }
  
  // Suggest mentor matches
  async suggestMentorMatches(menteeRequestId: string): Promise<MockApiResponse<Array<{
    mentorId: string;
    score: number;
    matchReasons: string[];
  }>>> {
    await simulateDelay(300, 600);
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const menteeRequest = menteeRequestsData.find(r => r.id === menteeRequestId);
    
    if (!menteeRequest) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const availableMentors = mentorProfilesData.filter(m => 
      m.isActive && m.currentMentees < m.maxMentees
    );
    
    const scoredMatches = availableMentors.map(mentor => {
      let score = 0;
      const matchReasons: string[] = [];
      
      // Specialization match
      const specializationMatch = mentor.specializations.some(spec =>
        menteeRequest.requestedSpecializations.some(reqSpec =>
          spec.toLowerCase().includes(reqSpec.toLowerCase()) ||
          reqSpec.toLowerCase().includes(spec.toLowerCase())
        )
      );
      if (specializationMatch) {
        score += 40;
        matchReasons.push('Specialization match');
      }
      
      // Industry match
      const industryMatch = mentor.industries.some(industry =>
        menteeRequest.preferredMentorIndustries.includes(industry)
      );
      if (industryMatch) {
        score += 30;
        matchReasons.push('Industry experience');
      }
      
      // Availability match
      if (mentor.availability === 'Available') {
        score += 20;
        matchReasons.push('Available for mentoring');
      } else if (mentor.availability === 'Limited') {
        score += 10;
        matchReasons.push('Limited availability');
      }
      
      // Experience bonus
      if (mentor.yearsOfExperience >= 5) {
        score += 10;
        matchReasons.push('Experienced professional');
      }
      
      return {
        mentorId: mentor.alumniId,
        score,
        matchReasons
      };
    });
    
    const topMatches = scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    return createSuccessResponse(topMatches);
  }
  
  // Get mentorship statistics
  async getMentorshipStats(): Promise<MockApiResponse<{
    totalConnections: number;
    activeConnections: number;
    completedConnections: number;
    pendingConnections: number;
    totalMentors: number;
    availableMentors: number;
    totalMenteeRequests: number;
    pendingRequests: number;
    successRate: number;
    averageDurationDays: number;
  }>> {
    await simulateDelay(150, 300);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const totalConnections = mentorshipData.length;
    const activeConnections = mentorshipData.filter(c => c.status === 'active').length;
    const completedConnections = mentorshipData.filter(c => c.status === 'completed').length;
    const pendingConnections = mentorshipData.filter(c => c.status === 'pending').length;
    
    const totalMentors = mentorProfilesData.length;
    const availableMentors = mentorProfilesData.filter(m => 
      m.isActive && m.currentMentees < m.maxMentees
    ).length;
    
    const totalMenteeRequests = menteeRequestsData.length;
    const pendingRequests = menteeRequestsData.filter(r => r.status === 'pending').length;
    
    const successRate = totalConnections > 0 ? (completedConnections / totalConnections) * 100 : 0;
    
    // Calculate average duration for completed mentorships
    const completedWithDuration = mentorshipData.filter(c => c.status === 'completed');
    const averageDuration = completedWithDuration.length > 0 
      ? completedWithDuration.reduce((sum, c) => {
          const duration = (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24);
          return sum + duration;
        }, 0) / completedWithDuration.length
      : 0;
    
    const stats = {
      totalConnections,
      activeConnections,
      completedConnections,
      pendingConnections,
      totalMentors,
      availableMentors,
      totalMenteeRequests,
      pendingRequests,
      successRate: Math.round(successRate * 100) / 100,
      averageDurationDays: Math.round(averageDuration)
    };
    
    return createSuccessResponse(stats);
  }
}

export const mockMentorshipService = new MockMentorshipService();
import { apiClient } from '@/lib/api';
import { MentorshipConnection } from '@/types';

export interface MentorshipListResponse {
  connections: MentorshipConnection[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MentorshipFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
  mentorId?: string;
  menteeId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MentorshipStats {
  totalConnections: number;
  activeConnections: number;
  completedConnections: number;
  pendingRequests: number;
  totalMentors: number;
  totalMentees: number;
  averageConnectionDuration: number;
  successRate: number;
  monthlyStats: Array<{ month: string; new: number; completed: number }>;
  skillsDistribution: Array<{ skill: string; count: number }>;
}

export interface MentorProfile {
  id: string;
  alumniId: string;
  skills: string[];
  expertise: string[];
  industries: string[];
  yearsOfExperience: number;
  menteeCapacity: number;
  currentMentees: number;
  bio: string;
  availability: string;
  preferredCommunication: string[];
  isActive: boolean;
  rating: number;
  totalMentorships: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenteeProfile {
  id: string;
  alumniId: string;
  goals: string[];
  interests: string[];
  careerStage: 'student' | 'recent_graduate' | 'early_career' | 'mid_career';
  preferredMentorExperience: number;
  preferredIndustries: string[];
  bio: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class MentorshipApiService {
  // Get all mentorship connections with filters
  async getMentorshipConnections(
    filters: MentorshipFilters = {}
  ): Promise<MentorshipListResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/mentorship${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<MentorshipListResponse>(endpoint);
  }

  // Get single mentorship connection
  async getMentorshipById(id: string): Promise<MentorshipConnection> {
    return apiClient.get<MentorshipConnection>(`/api/mentorship/${id}`);
  }

  // Create mentorship connection
  async createMentorshipConnection(data: {
    mentorId: string;
    menteeId: string;
    goals?: string[];
    notes?: string;
  }): Promise<MentorshipConnection> {
    return apiClient.post<MentorshipConnection>('/mentorship', data);
  }

  // Update mentorship connection
  async updateMentorshipConnection(
    id: string,
    data: Partial<MentorshipConnection>
  ): Promise<MentorshipConnection> {
    return apiClient.put<MentorshipConnection>(`/api/mentorship/${id}`, data);
  }

  // Delete mentorship connection
  async deleteMentorshipConnection(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/mentorship/${id}`);
  }

  // Accept mentorship request
  async acceptMentorshipRequest(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/api/mentorship/${id}/accept`);
  }

  // Decline mentorship request
  async declineMentorshipRequest(
    id: string,
    reason?: string
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      `/api/mentorship/${id}/decline`,
      { reason }
    );
  }

  // Complete mentorship
  async completeMentorship(
    id: string,
    feedback?: string
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      `/api/mentorship/${id}/complete`,
      { feedback }
    );
  }

  // Get mentorship statistics
  async getMentorshipStats(): Promise<MentorshipStats> {
    return apiClient.get<MentorshipStats>('/mentorship/stats/overview');
  }

  // Get mentor profiles
  async getMentorProfiles(
    filters: {
      page?: number;
      limit?: number;
      skills?: string[];
      industries?: string[];
      minExperience?: number;
      availability?: boolean;
    } = {}
  ): Promise<{
    mentors: MentorProfile[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const endpoint = `/api/mentorship/mentors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }

  // Get mentee profiles
  async getMenteeProfiles(
    filters: {
      page?: number;
      limit?: number;
      goals?: string[];
      careerStage?: string;
      industries?: string[];
    } = {}
  ): Promise<{
    mentees: MenteeProfile[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const endpoint = `/api/mentorship/mentees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }

  // Create mentor profile
  async createMentorProfile(
    data: Partial<MentorProfile>
  ): Promise<MentorProfile> {
    return apiClient.post<MentorProfile>('/mentorship/mentors', data);
  }

  // Update mentor profile
  async updateMentorProfile(
    id: string,
    data: Partial<MentorProfile>
  ): Promise<MentorProfile> {
    return apiClient.put<MentorProfile>(`/api/mentorship/mentors/${id}`, data);
  }

  // Create mentee profile
  async createMenteeProfile(
    data: Partial<MenteeProfile>
  ): Promise<MenteeProfile> {
    return apiClient.post<MenteeProfile>('/mentorship/mentees', data);
  }

  // Update mentee profile
  async updateMenteeProfile(
    id: string,
    data: Partial<MenteeProfile>
  ): Promise<MenteeProfile> {
    return apiClient.put<MenteeProfile>(`/api/mentorship/mentees/${id}`, data);
  }

  // Get mentor suggestions for a mentee
  async getMentorSuggestions(
    menteeId: string,
    limit: number = 10
  ): Promise<{
    suggestions: Array<{
      mentor: MentorProfile;
      matchScore: number;
      matchReasons: string[];
    }>;
  }> {
    return apiClient.get(
      `/api/mentorship/mentees/${menteeId}/suggestions?limit=${limit}`
    );
  }

  // Get mentee suggestions for a mentor
  async getMenteeSuggestions(
    mentorId: string,
    limit: number = 10
  ): Promise<{
    suggestions: Array<{
      mentee: MenteeProfile;
      matchScore: number;
      matchReasons: string[];
    }>;
  }> {
    return apiClient.get(
      `/api/mentorship/mentors/${mentorId}/suggestions?limit=${limit}`
    );
  }
}

export const mentorshipApiService = new MentorshipApiService();

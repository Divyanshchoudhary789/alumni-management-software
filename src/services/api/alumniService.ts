import { apiClient } from '@/lib/api';
import { AlumniProfile } from '@/types';

export interface AlumniListResponse {
  alumni: AlumniProfile[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AlumniFilters {
  page?: number;
  limit?: number;
  search?: string;
  graduationYear?: number;
  location?: string;
  company?: string;
  skills?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AlumniStats {
  totalAlumni: number;
  publicProfiles: number;
  privateProfiles: number;
  recentAlumni: number;
  graduationYearStats: Array<{ _id: number; count: number }>;
  locationStats: Array<{ _id: string; count: number }>;
  companyStats: Array<{ _id: string; count: number }>;
}

class AlumniApiService {
  // Get all alumni with filters
  async getAlumni(filters: AlumniFilters = {}): Promise<AlumniListResponse> {
    return apiClient.get<AlumniListResponse>('/alumni', filters);
  }

  // Get single alumni profile
  async getAlumniById(id: string): Promise<AlumniProfile> {
    return apiClient.get<AlumniProfile>(`/alumni/${id}`);
  }

  // Create alumni profile (admin only)
  async createAlumni(data: Partial<AlumniProfile>): Promise<AlumniProfile> {
    return apiClient.post<AlumniProfile>('/alumni', data);
  }

  // Update alumni profile
  async updateAlumni(
    id: string,
    data: Partial<AlumniProfile>
  ): Promise<AlumniProfile> {
    return apiClient.put<AlumniProfile>(`/alumni/${id}`, data);
  }

  // Delete alumni profile (admin only)
  async deleteAlumni(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/alumni/${id}`);
  }

  // Get alumni statistics (admin only)
  async getAlumniStats(): Promise<AlumniStats> {
    return apiClient.get<AlumniStats>('/alumni/stats/overview');
  }

  // Search alumni
  async searchAlumni(query: string): Promise<AlumniProfile[]> {
    const response = await this.getAlumni({ search: query, limit: 10 });
    return response.alumni;
  }
}

export const alumniApiService = new AlumniApiService();

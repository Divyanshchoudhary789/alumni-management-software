import { apiClientInstance, withErrorHandling } from '@/lib/apiClient';
import { AlumniProfile } from '@/types';

/**
 * Service abstraction layer for alumni profile operations
 * This service provides a unified interface for alumni profile operations
 * that automatically handles API switching, error handling, and caching
 */
export class AlumniProfileService {
  /**
   * Get alumni profile by ID with error handling and caching
   */
  async getAlumniById(id: string): Promise<{ data: AlumniProfile }> {
    return withErrorHandling(
      async () => {
        const profile = await apiClientInstance.alumni.getAlumniById(id);
        // Handle different response formats between mock and real API
        if (profile && typeof profile === 'object' && 'data' in profile) {
          return profile as { data: AlumniProfile };
        } else {
          return { data: profile as AlumniProfile };
        }
      },
      {
        fallbackToMock: true,
        retryCount: 2,
        cacheKey: `alumni-profile-${id}`,
        cacheTtl: 5 * 60 * 1000, // 5 minutes
      }
    );
  }

  /**
   * Validate profile ID format
   */
  validateProfileId(id: string): boolean {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    // Basic validation - should be non-empty string
    // In a real implementation, you might want more specific validation
    return id.trim().length > 0;
  }

  /**
   * Update alumni profile
   */
  async updateAlumni(id: string, data: Partial<AlumniProfile>): Promise<{ data: AlumniProfile }> {
    return withErrorHandling(
      async () => {
        const profile = await apiClientInstance.alumni.updateAlumni(id, data);
        // Handle different response formats between mock and real API
        if (profile && typeof profile === 'object' && 'data' in profile) {
          return profile as { data: AlumniProfile };
        } else {
          return { data: profile as AlumniProfile };
        }
      },
      {
        fallbackToMock: true,
        retryCount: 1, // Less retries for write operations
      }
    );
  }

  /**
   * Get all alumni with filters
   */
  async getAlumni(filters: any = {}): Promise<{ data: AlumniProfile[] }> {
    return withErrorHandling(
      async () => {
        const response = await apiClientInstance.alumni.getAlumni(filters);
        // Handle different response formats between mock and real API
        if ('data' in response) {
          return response;
        } else if ('alumni' in response) {
          return { data: (response as any).alumni };
        } else {
          return { data: response as AlumniProfile[] };
        }
      },
      {
        fallbackToMock: true,
        retryCount: 2,
        cacheKey: `alumni-list-${JSON.stringify(filters)}`,
        cacheTtl: 2 * 60 * 1000, // 2 minutes for list data
      }
    );
  }

  /**
   * Create new alumni profile
   */
  async createAlumni(data: Partial<AlumniProfile>): Promise<{ data: AlumniProfile }> {
    return withErrorHandling(
      async () => {
        const profile = await apiClientInstance.alumni.createAlumni(data);
        // Handle different response formats between mock and real API
        if (profile && typeof profile === 'object' && 'data' in profile) {
          return profile as { data: AlumniProfile };
        } else {
          return { data: profile as AlumniProfile };
        }
      },
      {
        fallbackToMock: true,
        retryCount: 1,
      }
    );
  }

  /**
   * Delete alumni profile
   */
  async deleteAlumni(id: string): Promise<{ message: string }> {
    return withErrorHandling(
      async () => {
        const result = await apiClientInstance.alumni.deleteAlumni(id);
        // Handle different response formats between mock and real API
        if (result && typeof result === 'object' && 'message' in result) {
          return result as { message: string };
        } else {
          return { message: 'Alumni profile deleted successfully' };
        }
      },
      {
        fallbackToMock: true,
        retryCount: 1,
      }
    );
  }

  /**
   * Search alumni profiles
   */
  async searchAlumni(query: string): Promise<{ data: AlumniProfile[] }> {
    return withErrorHandling(
      async () => {
        const profiles = await apiClientInstance.alumni.searchAlumni(query);
        // Handle different response formats between mock and real API
        if (profiles && typeof profiles === 'object' && 'data' in profiles) {
          return profiles as { data: AlumniProfile[] };
        } else {
          return { data: profiles as AlumniProfile[] };
        }
      },
      {
        fallbackToMock: true,
        retryCount: 2,
        cacheKey: `alumni-search-${query}`,
        cacheTtl: 1 * 60 * 1000, // 1 minute for search results
      }
    );
  }

  /**
   * Get alumni statistics
   */
  async getAlumniStats(): Promise<any> {
    return withErrorHandling(
      async () => {
        return await apiClientInstance.alumni.getAlumniStats();
      },
      {
        fallbackToMock: true,
        retryCount: 2,
        cacheKey: 'alumni-stats',
        cacheTtl: 10 * 60 * 1000, // 10 minutes for stats
      }
    );
  }
}

// Export singleton instance
export const alumniProfileService = new AlumniProfileService();
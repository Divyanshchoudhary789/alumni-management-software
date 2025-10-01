// API Client Switcher - Allows switching between mock and real API services
import { mockApiClient, MockApiClient } from '@/lib/mock-services';
import { realApiClient, ApiClient } from '@/services/api';

// Configuration for API mode
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
const BACKEND_AVAILABLE = process.env.NEXT_PUBLIC_BACKEND_AVAILABLE === 'true';

// Cache for API responses
class ApiResponseCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

const apiCache = new ApiResponseCache();

// Type that combines both API client interfaces
type CombinedApiClient = MockApiClient & ApiClient;

// Create a unified API client that can switch between mock and real services
class UnifiedApiClient {
  private useRealApi: boolean;
  private backendAvailable: boolean;

  constructor() {
    this.useRealApi = USE_REAL_API;
    this.backendAvailable = BACKEND_AVAILABLE;
  }

  // Method to check if backend is available
  async checkBackendHealth(): Promise<boolean> {
    if (!this.useRealApi) return true; // Mock services are always "available"

    try {
      const { checkBackendHealth } = await import('@/services/api');
      return await checkBackendHealth();
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  // Method to switch API mode
  setApiMode(useReal: boolean) {
    this.useRealApi = useReal;
  }

  // Method to get the appropriate API client
  getApiClient(): CombinedApiClient {
    if (this.useRealApi && this.backendAvailable) {
      return realApiClient as CombinedApiClient;
    }
    return mockApiClient as CombinedApiClient;
  }

  // Getter for current API mode
  get isUsingRealApi(): boolean {
    return this.useRealApi && this.backendAvailable;
  }

  get isUsingMockApi(): boolean {
    return !this.useRealApi || !this.backendAvailable;
  }

  // Individual service getters that automatically switch
  get alumni() {
    return this.getApiClient().alumni;
  }

  get auth() {
    return this.isUsingRealApi ? realApiClient.auth : mockApiClient.alumni; // Mock doesn't have auth service
  }

  get events() {
    return this.getApiClient().events;
  }

  get dashboard() {
    return this.getApiClient().dashboard;
  }

  get donations() {
    return this.getApiClient().donations;
  }

  get communications() {
    return this.getApiClient().communications;
  }

  get mentorship() {
    return this.getApiClient().mentorship;
  }

  get analytics() {
    return this.getApiClient().analytics;
  }

  get settings() {
    return this.getApiClient().settings;
  }
}

// Create and export the unified API client instance
export const apiClientInstance = new UnifiedApiClient();

// Export individual services for direct access
export const alumniService = () => apiClientInstance.alumni;
export const authService = () => apiClientInstance.auth;
export const eventsService = () => apiClientInstance.events;
export const dashboardService = () => apiClientInstance.dashboard;
export const donationsService = () => apiClientInstance.donations;
export const communicationsService = () => apiClientInstance.communications;
export const mentorshipService = () => apiClientInstance.mentorship;
export const analyticsService = () => apiClientInstance.analytics;
export const settingsService = () => apiClientInstance.settings;

// Utility function to initialize API client with backend health check
export const initializeApiClient = async (): Promise<void> => {
  if (USE_REAL_API) {
    const isHealthy = await apiClientInstance.checkBackendHealth();
    if (!isHealthy) {
      console.warn('Backend is not available, falling back to mock services');
      apiClientInstance.setApiMode(false);
    } else {
      console.log('Backend is healthy, using real API services');
    }
  } else {
    console.log('Using mock API services (configured)');
  }
};

// Error handling wrapper for API calls with retry logic
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  options: {
    fallbackToMock?: boolean;
    retryCount?: number;
    retryDelay?: number;
    cacheKey?: string;
    cacheTtl?: number;
  } = {}
): Promise<T> => {
  const {
    fallbackToMock = true,
    retryCount = 2,
    retryDelay = 1000,
    cacheKey,
    cacheTtl = 5 * 60 * 1000,
  } = options;

  // Check cache first
  if (cacheKey) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  let lastError: Error;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const result = await apiCall();

      // Cache successful result
      if (cacheKey) {
        apiCache.set(cacheKey, result, cacheTtl);
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `API call failed (attempt ${attempt + 1}/${retryCount + 1}):`,
        error
      );

      // If this is the last attempt and we should fallback to mock
      if (
        attempt === retryCount &&
        fallbackToMock &&
        apiClientInstance.isUsingRealApi
      ) {
        console.warn('Falling back to mock services due to API error');
        apiClientInstance.setApiMode(false);
        try {
          const result = await apiCall();
          if (cacheKey) {
            apiCache.set(cacheKey, result, cacheTtl);
          }
          return result;
        } catch (mockError) {
          console.error('Mock API also failed:', mockError);
          throw lastError; // Throw the original error
        }
      }

      // Wait before retrying (except on last attempt)
      if (attempt < retryCount) {
        await new Promise(resolve =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }
    }
  }

  throw lastError!;
};

// Export the main API client for backward compatibility
export default apiClientInstance;

// API Configuration and Base Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === 'development' &&
      (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your-') ||
       !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

    if (isDevMode) {
      // In development mode, return dev user data as token
      try {
        const devUser = localStorage.getItem('dev-user');
        if (devUser) {
          return devUser; // Return the dev user JSON as the token
        }
      } catch (error) {
        console.warn('Could not get dev user:', error);
      }
      return null;
    }

    try {
      // Try to get Clerk token from window.Clerk
      const clerk = (window as any).Clerk;
      if (clerk && clerk.session) {
        const token = await clerk.session.getToken();
        return token;
      }
    } catch (error) {
      console.warn('Could not get Clerk token:', error);
    }

    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      // Check if we're in development mode
      const isDevMode = process.env.NODE_ENV === 'development' &&
        (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your-') ||
         !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

      if (isDevMode) {
        // In development mode, send as x-dev-token header
        config.headers = {
          ...config.headers,
          'x-dev-token': token,
        };
      } else {
        // Production mode - use Authorization header
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: {
            message: `HTTP error! status: ${response.status}`,
            code: 'HTTP_ERROR',
          },
        }));

        const apiError: ApiError = errorData.error || {
          message: `Request failed with status ${response.status}`,
          code: 'REQUEST_FAILED',
        };

        throw new ApiClientError(
          apiError.message,
          response.status,
          apiError.code,
          apiError.details
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      console.error(`API request failed: ${endpoint}`, error);
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload request
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      // Check if we're in development mode
      const isDevMode = process.env.NODE_ENV === 'development' &&
        (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your-') ||
         !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

      if (isDevMode) {
        // In development mode, send as x-dev-token header
        headers['x-dev-token'] = token;
      } else {
        // Production mode - use Authorization header
        headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/api${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: {
            message: `HTTP error! status: ${response.status}`,
            code: 'HTTP_ERROR',
          },
        }));

        const apiError: ApiError = errorData.error || {
          message: `Upload failed with status ${response.status}`,
          code: 'UPLOAD_FAILED',
        };

        throw new ApiClientError(
          apiError.message,
          response.status,
          apiError.code,
          apiError.details
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      console.error(`Upload failed: ${endpoint}`, error);
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Upload failed',
        0,
        'UPLOAD_ERROR'
      );
    }
  }
}

// Custom error class for API errors
export class ApiClientError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Health check function
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health');
    return true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

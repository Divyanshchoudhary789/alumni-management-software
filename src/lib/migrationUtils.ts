// Migration utilities for replacing mock services with real API services
import { notifications } from '@mantine/notifications';

// Error handling wrapper for API calls during migration
export const handleApiError = (
  error: any,
  fallbackMessage: string = 'An error occurred'
) => {
  const message = error?.message || fallbackMessage;
  console.error('API Error:', error);

  notifications.show({
    title: 'Error',
    message,
    color: 'red',
  });

  return message;
};

// Success notification helper
export const showSuccessNotification = (
  message: string,
  title: string = 'Success'
) => {
  notifications.show({
    title,
    message,
    color: 'green',
  });
};

// Loading state helper
export const createLoadingState = <T>(initialData: T) => ({
  data: initialData,
  loading: true,
  error: null,
});

// Transform mock API response to match real API response format
export const transformMockResponse = <T>(mockResponse: { data: T }) =>
  mockResponse.data;

// Retry logic for API calls
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Cache management for API responses
class ApiCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
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

export const apiCache = new ApiCache();

// Optimistic update helper
export const withOptimisticUpdate = <T, U>(
  currentData: T[],
  updateFn: (data: T[]) => T[],
  apiCall: () => Promise<U>,
  onSuccess?: (result: U) => void,
  onError?: (error: Error) => void
) => {
  // Apply optimistic update
  const optimisticData = updateFn(currentData);

  // Return promise that handles the API call
  return apiCall()
    .then(result => {
      onSuccess?.(result);
      return { data: optimisticData, success: true };
    })
    .catch(error => {
      onError?.(error);
      // Revert optimistic update on error
      return { data: currentData, success: false, error };
    });
};

// Pagination helper
export const createPaginationState = (
  initialPage: number = 1,
  initialLimit: number = 10
) => ({
  page: initialPage,
  limit: initialLimit,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

// Filter helper
export const createFiltersState = <T extends Record<string, any>>() => ({
  filters: {} as Partial<T>,
  setFilter: (key: keyof T, value: any) => ({ [key]: value }),
  clearFilters: () => ({}) as Partial<T>,
  hasActiveFilters: (filters: Partial<T>) => Object.keys(filters).length > 0,
});

// Sort helper
export const createSortState = <T>(
  initialField: keyof T,
  initialDirection: 'asc' | 'desc' = 'asc'
) => ({
  field: initialField,
  direction: initialDirection,
  toggle: (field: keyof T) => ({
    field,
    direction:
      field === initialField && initialDirection === 'asc' ? 'desc' : 'asc',
  }),
});

// Debounce helper for search
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Import React for the useDebounce hook
import React from 'react';

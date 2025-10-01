import { useState, useCallback, useEffect } from 'react';
import { ApiClientError } from '@/lib/api';
import { notifications } from '@mantine/notifications';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface ApiOptions {
  showErrorNotification?: boolean;
  showSuccessNotification?: boolean;
  fallbackToMock?: boolean;
  retryCount?: number;
  retryDelay?: number;
  cacheKey?: string;
  cacheTtl?: number;
}

// Generic hook for API calls with loading states and error handling
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: ApiOptions & { immediate?: boolean } = {}
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    showErrorNotification = true,
    showSuccessNotification = false,
    fallbackToMock = true,
    retryCount = 2,
    retryDelay = 1000,
    cacheKey,
    cacheTtl = 5 * 60 * 1000,
    immediate = true,
  } = options;

  const executeApiCall = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);

      if (showSuccessNotification) {
        notifications.show({
          title: 'Success',
          message: 'Data loaded successfully',
          color: 'green',
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'An error occurred';

      setError(errorMessage);

      if (showErrorNotification) {
        notifications.show({
          title: 'Error',
          message: errorMessage,
          color: 'red',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, showErrorNotification, showSuccessNotification]);

  useEffect(() => {
    if (immediate) {
      executeApiCall();
    }
  }, [executeApiCall, immediate]);

  return {
    data,
    loading,
    error,
    refetch: executeApiCall,
  };
}

/**
 * Hook for handling mutations (POST, PUT, DELETE) with loading states
 */
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: {
    onSuccess?: (data: T, params: P) => void;
    onError?: (error: ApiClientError, params: P) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await mutationFn(params);

        if (options.onSuccess) {
          options.onSuccess(result, params);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof ApiClientError
            ? err.message
            : 'An unexpected error occurred';

        setError(errorMessage);

        if (options.onError && err instanceof ApiClientError) {
          options.onError(err, params);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    reset,
  };
}

/**
 * Hook for handling paginated API calls
 */
export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<{
    data?: T[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>,
  initialParams: any = {}
) {
  const [params, setParams] = useState(initialParams);
  const [allData, setAllData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  const { data, loading, error, refetch } = useApi(() => apiCall(params), {
    showErrorNotification: true,
    immediate: true,
  });

  // Handle data updates
  useEffect(() => {
    if (data) {
      if (params.page === 1) {
        setAllData(data.data || []);
      } else {
        setAllData(prev => [...prev, ...(data.data || [])]);
      }
      setPagination(data.pagination);
    }
  }, [data, params.page]);

  const loadMore = useCallback(() => {
    if (pagination?.hasNextPage) {
      setParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [pagination]);

  const refresh = useCallback(() => {
    setParams(prev => ({ ...prev, page: 1 }));
    setAllData([]);
  }, []);

  const updateParams = useCallback((newParams: any) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }));
    setAllData([]);
  }, []);

  return {
    data: allData,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
    updateParams,
    refetch,
  };
}

/**
 * Hook for handling file uploads with progress
 */
export function useFileUpload<T>(
  uploadFn: (file: File, onProgress?: (progress: number) => void) => Promise<T>,
  options: {
    onSuccess?: (data: T, file: File) => void;
    onError?: (error: ApiClientError, file: File) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        const result = await uploadFn(file, setProgress);

        if (options.onSuccess) {
          options.onSuccess(result, file);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof ApiClientError ? err.message : 'Upload failed';

        setError(errorMessage);

        if (options.onError && err instanceof ApiClientError) {
          options.onError(err, file);
        }

        return null;
      } finally {
        setLoading(false);
        setProgress(0);
      }
    },
    [uploadFn, options]
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
    setProgress(0);
  }, []);

  return {
    upload,
    loading,
    progress,
    error,
    reset,
  };
}

/**
 * Hook for donations API operations
 */
export function useDonationsApi() {
  const getDonations = (filters: any = {}) => {
    return useApi(
      async () => {
        // Mock implementation for now
        return {
          donations: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      },
      { immediate: false }
    );
  };

  const deleteDonation = useMutation(async (id: string) => {
    // Mock implementation for now
    return { message: 'Donation deleted successfully' };
  });

  return {
    getDonations,
    deleteDonation,
  };
}

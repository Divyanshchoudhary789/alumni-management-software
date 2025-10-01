// Base mock service utilities
export interface MockApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

export interface MockApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Simulate network delay
export const simulateDelay = (
  min: number = 200,
  max: number = 800
): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate API errors
export const simulateError = (errorRate: number = 0.05): boolean => {
  return Math.random() < errorRate;
};

// Common error responses
export const mockErrors = {
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message:
      'Network connection failed. Please check your internet connection.',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You are not authorized to perform this action.',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'The requested resource was not found.',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed. Please check your input data.',
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Internal server error. Please try again later.',
  },
  RATE_LIMIT: {
    code: 'RATE_LIMIT',
    message: 'Too many requests. Please wait before trying again.',
  },
};

// Create successful response
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): MockApiResponse<T> => ({
  data,
  success: true,
  message,
});

// Create error response
export const createErrorResponse = (
  error: MockApiError
): MockApiResponse<never> => ({
  data: null as never,
  success: false,
  error: error.message,
});

// Create paginated response
export const createPaginatedResponse = <T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): PaginatedResponse<T> => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
    },
    success: true,
  };
};

// Filter and search utilities
export const filterByText = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm) return items;

  const lowercaseSearch = searchTerm.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(lowercaseSearch);
    })
  );
};

export const sortByField = <T>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

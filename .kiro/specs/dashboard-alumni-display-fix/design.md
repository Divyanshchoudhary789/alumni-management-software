# Design Document

## Overview

This design document addresses critical issues in the Alumni Management Dashboard where the dashboard appears empty and newly added alumni data (including images) are not displaying properly. The system has a complete UI/UX implementation and backend API, but there are data flow and integration issues preventing proper display of information.

**Root Cause Analysis:**
Based on the codebase analysis, the issues stem from:
1. **API Mode Configuration**: The frontend is configured to use mock services (`NEXT_PUBLIC_USE_REAL_API="false"`) instead of the real backend API
2. **Backend Health Check Failures**: The system falls back to mock services when backend health checks fail
3. **Data Synchronization Issues**: Frontend components may not be properly refreshing after data mutations
4. **Error Handling Gaps**: Silent failures in API calls that don't provide user feedback
5. **Image Upload Integration**: Profile images may not be properly integrated between frontend and backend

**Solution Approach:**
The fix involves ensuring proper API integration, improving error handling, implementing real-time data updates, and fixing the image upload workflow.

## Architecture

### Current Architecture Issues

**Frontend API Client Configuration:**
```typescript
// Current problematic configuration
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true'; // Currently false
const BACKEND_AVAILABLE = process.env.NEXT_PUBLIC_BACKEND_AVAILABLE === 'true'; // Currently false
```

**API Client Fallback Logic:**
The system automatically falls back to mock services when:
- Backend health check fails
- API requests encounter errors
- Environment variables are not properly configured

### Fixed Architecture Design

**1. Environment Configuration Fix:**
```typescript
// Updated environment variables needed
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_BACKEND_AVAILABLE=true
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**2. Enhanced API Client with Better Error Handling:**
```typescript
class EnhancedApiClient {
  private async requestWithFallback<T>(
    apiCall: () => Promise<T>,
    fallbackCall?: () => Promise<T>
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      // Log error and show user feedback
      this.handleApiError(error);
      
      // Only fallback if explicitly requested
      if (fallbackCall && this.shouldFallback(error)) {
        return await fallbackCall();
      }
      
      throw error;
    }
  }
}
```

**3. Real-time Data Synchronization:**
```typescript
// Implement optimistic updates with rollback
const useOptimisticMutation = <T, U>(
  mutationFn: (data: T) => Promise<U>,
  onSuccess: (result: U) => void
) => {
  // Optimistic update logic
  // Rollback on failure
  // Refresh data on success
};
```

## Components and Interfaces

### 1. Enhanced Dashboard Metrics Component

**Current Issue:** Dashboard shows empty state even when data exists in backend

**Fix Design:**
```typescript
interface DashboardMetricsProps {
  forceRefresh?: boolean;
  showErrorDetails?: boolean;
}

const EnhancedMetricsGrid: React.FC<DashboardMetricsProps> = ({
  forceRefresh,
  showErrorDetails
}) => {
  const {
    data: metrics,
    loading,
    error,
    refetch
  } = useApi(() => dashboardApiService.getDashboardMetrics(), {
    immediate: true,
    showErrorNotification: true,
    retryCount: 3,
    retryDelay: 1000
  });

  // Handle empty data vs loading vs error states
  if (loading) return <MetricsSkeletonLoader />;
  if (error) return <MetricsErrorState error={error} onRetry={refetch} />;
  if (!metrics) return <MetricsEmptyState onRefresh={refetch} />;
  
  return <MetricsDisplay metrics={metrics} />;
};
```

### 2. Enhanced Alumni Directory Component

**Current Issue:** Newly added alumni don't appear in directory

**Fix Design:**
```typescript
const EnhancedAlumniDirectory: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const {
    data: alumniData,
    loading,
    error,
    refetch
  } = useApi(() => alumniApiService.getAlumni(), {
    immediate: true,
    dependencies: [refreshTrigger] // Re-fetch when trigger changes
  });

  // Listen for alumni creation events
  useEffect(() => {
    const handleAlumniCreated = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    // Event listener for alumni creation
    window.addEventListener('alumni:created', handleAlumniCreated);
    return () => window.removeEventListener('alumni:created', handleAlumniCreated);
  }, []);

  return (
    <AlumniDirectoryView
      alumni={alumniData?.alumni || []}
      loading={loading}
      error={error}
      onRefresh={refetch}
    />
  );
};
```

### 3. Enhanced Alumni Form Component

**Current Issue:** Form submission doesn't trigger directory refresh

**Fix Design:**
```typescript
const EnhancedAlumniForm: React.FC = () => {
  const { mutate: createAlumni, loading } = useMutation(
    (data: AlumniFormData) => alumniApiService.createAlumni(data),
    {
      onSuccess: (newAlumni) => {
        // Show success notification
        notifications.show({
          title: 'Success',
          message: 'Alumni profile created successfully',
          color: 'green'
        });
        
        // Trigger directory refresh
        window.dispatchEvent(new CustomEvent('alumni:created', {
          detail: newAlumni
        }));
        
        // Navigate to alumni directory
        router.push('/dashboard/alumni');
      },
      onError: (error) => {
        // Show detailed error message
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create alumni profile',
          color: 'red'
        });
      }
    }
  );

  return <AlumniFormView onSubmit={createAlumni} loading={loading} />;
};
```

### 4. Enhanced Image Upload Component

**Current Issue:** Profile images not displaying after upload

**Fix Design:**
```typescript
interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  onError: (error: string) => void;
}

const EnhancedImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  onError
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      // Validate file
      if (!isValidImageFile(file)) {
        throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images.');
      }
      
      // Create preview immediately
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      // Upload to backend
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.upload('/upload/profile-image', formData);
      
      // Update with final URL
      setPreviewUrl(response.imageUrl);
      onImageChange(response.imageUrl);
      
      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green'
      });
      
    } catch (error) {
      // Rollback preview
      setPreviewUrl(currentImage);
      onError(error.message);
      
      notifications.show({
        title: 'Upload Failed',
        message: error.message,
        color: 'red'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ImageUploadView
      previewUrl={previewUrl}
      uploading={uploading}
      onFileSelect={handleFileUpload}
    />
  );
};
```

## Data Models

### Enhanced API Response Models

```typescript
// Enhanced error response model
interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

// Enhanced success response model
interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    cached?: boolean;
  };
}

// Enhanced alumni profile model with image handling
interface EnhancedAlumniProfile extends AlumniProfile {
  profileImage?: {
    url: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
    fileSize: number;
    mimeType: string;
  };
}
```

### Data Validation Models

```typescript
// Form validation schemas
const alumniFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  graduationYear: z.number().min(1950).max(new Date().getFullYear()),
  degree: z.string().min(1, 'Degree is required'),
  profileImage: z.string().url().optional(),
  // ... other fields
});

// API response validation
const dashboardMetricsSchema = z.object({
  totalAlumni: z.number().min(0),
  activeMembers: z.number().min(0),
  upcomingEvents: z.number().min(0),
  monthlyDonations: z.number().min(0),
  trends: z.object({
    alumniGrowth: z.number(),
    memberActivity: z.number(),
    eventAttendance: z.number(),
    donationGrowth: z.number(),
  })
});
```

## Error Handling

### 1. API Error Classification

```typescript
enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  BACKEND_UNAVAILABLE = 'BACKEND_UNAVAILABLE',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR'
}

class ApiErrorHandler {
  static handle(error: ApiClientError): UserFeedback {
    switch (error.code) {
      case ApiErrorType.NETWORK_ERROR:
        return {
          title: 'Connection Error',
          message: 'Please check your internet connection and try again.',
          action: 'retry',
          severity: 'warning'
        };
        
      case ApiErrorType.BACKEND_UNAVAILABLE:
        return {
          title: 'Service Unavailable',
          message: 'The server is temporarily unavailable. Please try again later.',
          action: 'retry',
          severity: 'error'
        };
        
      case ApiErrorType.VALIDATION_ERROR:
        return {
          title: 'Invalid Data',
          message: error.details?.fieldErrors || 'Please check your input and try again.',
          action: 'fix',
          severity: 'warning'
        };
        
      default:
        return {
          title: 'Unexpected Error',
          message: 'Something went wrong. Please try again.',
          action: 'retry',
          severity: 'error'
        };
    }
  }
}
```

### 2. User Feedback Components

```typescript
// Error boundary for API errors
const ApiErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback
          error={error}
          onRetry={resetError}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

// Loading states with timeout
const LoadingWithTimeout: React.FC<{ timeout?: number }> = ({ timeout = 10000 }) => {
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowTimeout(true), timeout);
    return () => clearTimeout(timer);
  }, [timeout]);
  
  if (showTimeout) {
    return (
      <TimeoutError
        message="This is taking longer than expected"
        onRetry={() => window.location.reload()}
      />
    );
  }
  
  return <SkeletonLoader />;
};
```

## Testing Strategy

### 1. API Integration Testing

```typescript
// Test API client with real backend
describe('API Integration', () => {
  beforeEach(async () => {
    // Ensure backend is running
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      throw new Error('Backend is not available for testing');
    }
  });

  test('should fetch dashboard metrics', async () => {
    const metrics = await dashboardApiService.getDashboardMetrics();
    expect(metrics).toMatchSchema(dashboardMetricsSchema);
  });

  test('should create and retrieve alumni', async () => {
    const newAlumni = await alumniApiService.createAlumni(mockAlumniData);
    expect(newAlumni.id).toBeDefined();
    
    const retrieved = await alumniApiService.getAlumniById(newAlumni.id);
    expect(retrieved).toEqual(newAlumni);
  });
});
```

### 2. Error Handling Testing

```typescript
// Test error scenarios
describe('Error Handling', () => {
  test('should handle network errors gracefully', async () => {
    // Mock network failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useApi(() => dashboardApiService.getDashboardMetrics()));
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error.code).toBe('NETWORK_ERROR');
    });
  });

  test('should show appropriate error messages', async () => {
    render(<DashboardPage />);
    
    // Simulate API error
    mockApiError('BACKEND_UNAVAILABLE');
    
    await waitFor(() => {
      expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
```

### 3. Data Flow Testing

```typescript
// Test data synchronization
describe('Data Synchronization', () => {
  test('should refresh alumni list after creation', async () => {
    const { getByRole, getByText } = render(<AlumniManagementPage />);
    
    // Create new alumni
    fireEvent.click(getByRole('button', { name: /add alumni/i }));
    
    // Fill form and submit
    await fillAlumniForm(mockAlumniData);
    fireEvent.click(getByRole('button', { name: /save/i }));
    
    // Verify alumni appears in list
    await waitFor(() => {
      expect(getByText(mockAlumniData.firstName)).toBeInTheDocument();
    });
  });
});
```

The design focuses on fixing the core issues while maintaining the existing architecture. The key improvements include proper API configuration, enhanced error handling, real-time data synchronization, and robust image upload functionality. The solution ensures that users get immediate feedback on their actions and that data flows correctly between the frontend and backend systems.
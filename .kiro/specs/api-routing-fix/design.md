# Design Document

## Overview

The API routing fix addresses a critical configuration mismatch in the alumni management system where the API client is adding `/api` prefixes to endpoints that already include `/api`, resulting in malformed URLs with double prefixes. This design outlines a clean solution that standardizes endpoint definitions and URL construction.

## Architecture

The fix involves two main architectural components:

1. **API Client Layer** (`src/lib/api.ts`) - Handles base URL construction and request processing
2. **Service Layer** (`src/services/api/*.ts`) - Defines endpoint paths and makes API calls

The current architecture has a mismatch where:
- API Client adds `/api` prefix: `${baseURL}/api${endpoint}`
- Services define endpoints with `/api` prefix: `/api/donations/stats/overview`
- Result: `/api/api/donations/stats/overview` (incorrect)

## Components and Interfaces

### API Client Configuration

**Current Implementation:**
```typescript
// In src/lib/api.ts
const url = `${this.baseURL}/api${endpoint}`;
```

**Proposed Solution:**
```typescript
// Option 1: Remove /api prefix from client, keep in services
const url = `${this.baseURL}${endpoint}`;

// Option 2: Keep /api prefix in client, remove from services  
const url = `${this.baseURL}/api${endpoint}`;
```

### Service Endpoint Definitions

**Current Implementation:**
```typescript
// In src/services/api/donationsService.ts
return apiClient.get<DonationStats>('/api/donations/stats/overview');
```

**Proposed Solution (Option 2 - Recommended):**
```typescript
// Remove /api prefix from service calls
return apiClient.get<DonationStats>('/donations/stats/overview');
```

### Affected Services

The following services need endpoint path updates:
- `src/services/api/donationsService.ts`
- `src/services/api/alumniService.ts`
- `src/services/api/eventsService.ts`
- `src/services/api/communicationsService.ts`
- `src/services/api/mentorshipService.ts`
- `src/services/api/dashboardService.ts`

## Data Models

No data model changes are required. This is purely a URL construction fix.

## Error Handling

### Current Error State
- 404 errors for all API endpoints with double `/api` prefix
- Generic "Route not found" messages
- Frontend components failing to load data

### Improved Error Handling
- Proper HTTP status codes for actual endpoint issues
- Clear error messages distinguishing between routing and business logic errors
- Consistent error response format across all endpoints

## Testing Strategy

### Unit Tests
- Test API client URL construction with various endpoint formats
- Verify service calls generate correct URLs
- Test error handling for malformed endpoints

### Integration Tests
- End-to-end tests for critical user flows (dashboard loading, donation stats)
- API endpoint accessibility tests
- Cross-service communication tests

### Manual Testing Checklist
1. Dashboard loads without 404 errors
2. Donation statistics display correctly
3. All navigation works properly
4. Error states show meaningful messages
5. Network tab shows correct API URLs

## Implementation Approach

**Recommended Solution: Option 2**

Keep the `/api` prefix in the API client and remove it from all service endpoint definitions. This approach:

1. **Maintains consistency** - All URLs constructed in one place
2. **Reduces duplication** - No need to repeat `/api` in every service call
3. **Easier maintenance** - Single point of configuration for API prefix
4. **Better separation of concerns** - Services focus on endpoint paths, client handles base URL construction

### Migration Steps

1. **Phase 1**: Update all service files to remove `/api` prefix from endpoint paths
2. **Phase 2**: Test each service individually to ensure correct URL construction
3. **Phase 3**: Run integration tests to verify end-to-end functionality
4. **Phase 4**: Deploy and monitor for any remaining routing issues

### Rollback Plan

If issues arise, the fix can be quickly reverted by:
1. Restoring the original service files with `/api` prefixes
2. Or alternatively, removing `/api` from the API client URL construction

This is a low-risk change that can be implemented and tested incrementally.
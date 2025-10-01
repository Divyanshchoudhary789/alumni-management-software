# Frontend Integration with Backend API

## 🎉 Frontend Integration Completed!

The frontend has been successfully integrated with the backend API. Here's what has been implemented:

## ✅ **What's Been Integrated:**

### **1. API Client Setup**
- **Enhanced API Client**: Updated `src/lib/api.ts` with comprehensive error handling
- **Authentication Integration**: Automatic Clerk JWT token injection
- **Request/Response Types**: Proper TypeScript interfaces for all API calls
- **Error Handling**: Custom `ApiClientError` class with detailed error information

### **2. API Services**
All API services have been updated to connect with the real backend:

- **Alumni Service** (`src/services/api/alumniService.ts`)
- **Events Service** (`src/services/api/eventsService.ts`) 
- **Dashboard Service** (`src/services/api/dashboardService.ts`)
- **Auth Service** (`src/services/api/authService.ts`)
- **Upload Service** (`src/services/api/uploadService.ts`) - NEW!

### **3. React Hooks**
- **`useApi`**: Generic hook for API calls with loading states and error handling
- **`useMutation`**: Hook for POST/PUT/DELETE operations
- **`usePaginatedApi`**: Hook for paginated data fetching
- **`useFileUpload`**: Hook for file uploads with progress tracking
- **Enhanced `useAuth`**: Integration with backend user data

### **4. Updated Components**
- **Dashboard Components**: Real API data integration
- **MetricsGrid**: Displays real dashboard metrics
- **RecentActivitiesFeed**: Shows actual recent activities
- **Test API Page**: Comprehensive API testing interface

## 🚀 **How to Test the Integration:**

### **1. Start Both Servers**
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend  
cd ../
npm run dev
```

### **2. Test API Connection**
Visit: `http://localhost:3000/dashboard/test-api`

This page will test all API endpoints and show:
- ✅ Backend health check
- ✅ Dashboard API connection
- ✅ Alumni API connection  
- ✅ Events API connection
- ✅ Auth API connection (if authenticated)

### **3. View Real Dashboard**
Visit: `http://localhost:3000/dashboard`

The dashboard now shows real data from your backend!

## 📊 **API Endpoints Available:**

### **Alumni Management**
```typescript
// Get all alumni with filters
const alumni = await alumniApiService.getAlumni({
  page: 1,
  limit: 20,
  search: 'john',
  graduationYear: 2020
});

// Get specific alumni
const alumni = await alumniApiService.getAlumniById('123');

// Create/Update alumni (admin only)
const newAlumni = await alumniApiService.createAlumni(data);
```

### **Events Management**
```typescript
// Get events
const events = await eventsApiService.getEvents({
  status: 'published',
  upcoming: 'true'
});

// Register for event
await eventsApiService.registerForEvent('eventId');
```

### **File Uploads**
```typescript
// Upload profile image
const result = await uploadApiService.uploadProfileImage(file);
console.log(result.url); // Cloudinary URL
console.log(result.variants); // Different sizes
```

### **Dashboard Data**
```typescript
// Get dashboard metrics
const metrics = await dashboardApiService.getDashboardMetrics();

// Get recent activities
const activities = await dashboardApiService.getRecentActivities();
```

## 🔧 **Using the API in Components:**

### **Simple Data Fetching**
```typescript
import { useApi } from '@/hooks/useApi';
import { alumniApiService } from '@/services/api';

function AlumniList() {
  const { data: alumni, loading, error } = useApi(
    () => alumniApiService.getAlumni({ limit: 10 })
  );

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <div>
      {alumni?.alumni.map(person => (
        <div key={person.id}>{person.firstName} {person.lastName}</div>
      ))}
    </div>
  );
}
```

### **Mutations (Create/Update/Delete)**
```typescript
import { useMutation } from '@/hooks/useApi';
import { alumniApiService } from '@/services/api';

function CreateAlumniForm() {
  const { mutate: createAlumni, loading, error } = useMutation(
    (data) => alumniApiService.createAlumni(data),
    {
      onSuccess: (newAlumni) => {
        console.log('Alumni created:', newAlumni);
        // Redirect or show success message
      },
      onError: (error) => {
        console.error('Failed to create alumni:', error);
      }
    }
  );

  const handleSubmit = (formData) => {
    createAlumni(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" loading={loading}>
        Create Alumni
      </Button>
      {error && <Alert color="red">{error}</Alert>}
    </form>
  );
}
```

### **File Uploads**
```typescript
import { useFileUpload } from '@/hooks/useApi';
import { uploadApiService } from '@/services/api';

function ProfileImageUpload() {
  const { upload, loading, progress, error } = useFileUpload(
    (file) => uploadApiService.uploadProfileImage(file),
    {
      onSuccess: (result) => {
        console.log('Image uploaded:', result.url);
        // Update user profile with new image URL
      }
    }
  );

  const handleFileSelect = (file: File) => {
    upload(file);
  };

  return (
    <div>
      <FileInput onChange={handleFileSelect} />
      {loading && <Progress value={progress} />}
      {error && <Alert color="red">{error}</Alert>}
    </div>
  );
}
```

## 🔐 **Authentication Integration:**

The frontend automatically handles authentication:

1. **Clerk JWT tokens** are automatically included in API requests
2. **User data** is synced between Clerk and your backend
3. **Role-based access** is enforced on both frontend and backend
4. **Error handling** for authentication failures

### **Using Authentication**
```typescript
import { useAuth } from '@/hooks/useAuth';

function ProtectedComponent() {
  const { user, isAuthenticated, isAdmin, syncUser } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Role: {user?.role}</p>
      {isAdmin && <AdminPanel />}
      <Button onClick={syncUser}>Sync User Data</Button>
    </div>
  );
}
```

## 🎯 **Next Steps:**

1. **Test all functionality** using the test page
2. **Update remaining components** to use real API data
3. **Implement real-time features** (WebSockets)
4. **Add comprehensive error boundaries**
5. **Implement caching strategies**

## 🐛 **Troubleshooting:**

### **Backend Connection Issues**
- Ensure backend server is running on `http://localhost:5000`
- Check environment variables in `.env.local`
- Verify Clerk authentication is working

### **API Errors**
- Check browser console for detailed error messages
- Use the test API page to diagnose specific endpoint issues
- Verify user authentication and permissions

### **CORS Issues**
- Backend is configured to allow `http://localhost:3000`
- Check backend CORS configuration if using different ports

---

**🎉 The frontend is now fully integrated with the backend! You can start using real data throughout your application.**
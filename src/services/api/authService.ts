import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  role: 'admin' | 'alumni';
  oauthProvider: 'google' | 'linkedin';
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AuthApiService {
  // Get current user profile
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  // Sync user data from Clerk
  async syncUser(): Promise<{ message: string; user: User }> {
    return apiClient.post<{ message: string; user: User }>('/auth/sync');
  }

  // Update user role (admin only)
  async updateUserRole(
    userId: string,
    role: 'admin' | 'alumni'
  ): Promise<{ message: string; user: User }> {
    return apiClient.put<{ message: string; user: User }>('/auth/role', {
      userId,
      role,
    });
  }

  // Get all users (admin only)
  async getUsers(
    params: {
      page?: number;
      limit?: number;
      role?: 'admin' | 'alumni';
      search?: string;
    } = {}
  ): Promise<UsersListResponse> {
    return apiClient.get<UsersListResponse>('/auth/users', params);
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/auth/users/${userId}`);
  }
}

export const authApiService = new AuthApiService();

import { apiClient } from '@/lib/api';
import { Communication } from '@/types';

export interface CommunicationsListResponse {
  communications: Communication[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CommunicationFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'email' | 'newsletter' | 'announcement' | 'reminder';
  status?: 'draft' | 'scheduled' | 'sent' | 'failed';
  startDate?: string;
  endDate?: string;
  targetAudience?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CommunicationStats {
  totalCommunications: number;
  sentCommunications: number;
  scheduledCommunications: number;
  draftCommunications: number;
  totalRecipients: number;
  averageOpenRate: number;
  averageClickRate: number;
  monthlyStats: Array<{
    month: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  typeDistribution: Array<{ type: string; count: number }>;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'newsletter' | 'announcement' | 'reminder';
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplatesListResponse {
  templates: CommunicationTemplate[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class CommunicationsApiService {
  // Get all communications with filters
  async getCommunications(
    filters: CommunicationFilters = {}
  ): Promise<CommunicationsListResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/communications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<CommunicationsListResponse>(endpoint);
  }

  // Get single communication
  async getCommunicationById(id: string): Promise<Communication> {
    return apiClient.get<Communication>(`/api/communications/${id}`);
  }

  // Create communication
  async createCommunication(
    data: Partial<Communication>
  ): Promise<Communication> {
    return apiClient.post<Communication>('/communications', data);
  }

  // Update communication
  async updateCommunication(
    id: string,
    data: Partial<Communication>
  ): Promise<Communication> {
    return apiClient.put<Communication>(`/api/communications/${id}`, data);
  }

  // Delete communication
  async deleteCommunication(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/communications/${id}`);
  }

  // Send communication
  async sendCommunication(
    id: string
  ): Promise<{ message: string; sentCount: number }> {
    return apiClient.post<{ message: string; sentCount: number }>(
      `/api/communications/${id}/send`
    );
  }

  // Schedule communication
  async scheduleCommunication(
    id: string,
    scheduledDate: Date
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      `/api/communications/${id}/schedule`,
      {
        scheduledDate: scheduledDate.toISOString(),
      }
    );
  }

  // Get communication statistics
  async getCommunicationStats(): Promise<CommunicationStats> {
    return apiClient.get<CommunicationStats>('/communications/stats/overview');
  }

  // Get communication analytics
  async getCommunicationAnalytics(id: string): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  }> {
    return apiClient.get(`/api/communications/${id}/analytics`);
  }

  // Get all templates
  async getTemplates(
    filters: { page?: number; limit?: number; type?: string } = {}
  ): Promise<TemplatesListResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/communications/templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<TemplatesListResponse>(endpoint);
  }

  // Get single template
  async getTemplateById(id: string): Promise<CommunicationTemplate> {
    return apiClient.get<CommunicationTemplate>(
      `/api/communications/templates/${id}`
    );
  }

  // Create template
  async createTemplate(
    data: Partial<CommunicationTemplate>
  ): Promise<CommunicationTemplate> {
    return apiClient.post<CommunicationTemplate>(
      '/communications/templates',
      data
    );
  }

  // Update template
  async updateTemplate(
    id: string,
    data: Partial<CommunicationTemplate>
  ): Promise<CommunicationTemplate> {
    return apiClient.put<CommunicationTemplate>(
      `/api/communications/templates/${id}`,
      data
    );
  }

  // Delete template
  async deleteTemplate(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `/api/communications/templates/${id}`
    );
  }

  // Preview communication with template
  async previewCommunication(
    templateId: string,
    data: Record<string, any>
  ): Promise<{
    subject: string;
    content: string;
  }> {
    return apiClient.post(
      `/api/communications/templates/${templateId}/preview`,
      data
    );
  }
}

export const communicationsApiService = new CommunicationsApiService();

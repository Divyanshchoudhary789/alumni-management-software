import { apiClient } from '@/lib/api';
import { Donation, DonationCampaign } from '@/types';

export interface DonationsListResponse {
  donations: Donation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface DonationFilters {
  page?: number;
  limit?: number;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  donorId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  uniqueDonors: number;
  monthlyTrends: Array<{ month: string; amount: number; count: number }>;
  topDonors: Array<{
    donorName: string;
    totalAmount: number;
    donationCount: number;
  }>;
  campaignPerformance: Array<{
    campaignName: string;
    raised: number;
    goal: number;
    percentage: number;
  }>;
}

export interface CampaignsListResponse {
  campaigns: DonationCampaign[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class DonationsApiService {
  // Get all donations with filters
  async getDonations(
    filters: DonationFilters = {}
  ): Promise<DonationsListResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/donations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<DonationsListResponse>(endpoint);
  }

  // Get single donation
  async getDonationById(id: string): Promise<Donation> {
    return apiClient.get<Donation>(`/donations/${id}`);
  }

  // Create donation
  async createDonation(data: Partial<Donation>): Promise<Donation> {
    return apiClient.post<Donation>('/donations', data);
  }

  // Update donation (admin only)
  async updateDonation(id: string, data: Partial<Donation>): Promise<Donation> {
    return apiClient.put<Donation>(`/donations/${id}`, data);
  }

  // Delete donation (admin only)
  async deleteDonation(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/donations/${id}`);
  }

  // Get donation statistics
  async getDonationStats(): Promise<DonationStats> {
    return apiClient.get<DonationStats>('/donations/stats/overview');
  }

  // Get all campaigns
  async getCampaigns(
    filters: { page?: number; limit?: number; status?: string } = {}
  ): Promise<CampaignsListResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/donations/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<CampaignsListResponse>(endpoint);
  }

  // Get single campaign
  async getCampaignById(id: string): Promise<DonationCampaign> {
    return apiClient.get<DonationCampaign>(`/donations/campaigns/${id}`);
  }

  // Create campaign (admin only)
  async createCampaign(
    data: Partial<DonationCampaign>
  ): Promise<DonationCampaign> {
    return apiClient.post<DonationCampaign>('/donations/campaigns', data);
  }

  // Update campaign (admin only)
  async updateCampaign(
    id: string,
    data: Partial<DonationCampaign>
  ): Promise<DonationCampaign> {
    return apiClient.put<DonationCampaign>(`/donations/campaigns/${id}`, data);
  }

  // Delete campaign (admin only)
  async deleteCampaign(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/donations/campaigns/${id}`);
  }

  // Get donations by campaign
  async getDonationsByCampaign(
    campaignId: string,
    filters: DonationFilters = {}
  ): Promise<DonationsListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('campaignId', campaignId);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'campaignId') {
        queryParams.append(key, value.toString());
      }
    });

    return apiClient.get<DonationsListResponse>(
      `/donations?${queryParams.toString()}`
    );
  }
}

export const donationsApiService = new DonationsApiService();

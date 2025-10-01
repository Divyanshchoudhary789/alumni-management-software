import { Donation } from '@/types';
import { mockData, mockDonationCampaigns } from '@/lib/mock-data';
import {
  simulateDelay,
  simulateError,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  filterByText,
  sortByField,
  generateId,
  mockErrors,
  MockApiResponse,
  PaginatedResponse,
} from './base';

// In-memory storage for mock data
const donationsData = [...mockData.donations];
const campaignsData = [...mockDonationCampaigns];

export interface DonationFilters {
  search?: string;
  status?: Donation['status'];
  purpose?: string;
  campaignId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface DonationSortOptions {
  field: keyof Donation;
  direction: 'asc' | 'desc';
}

class MockDonationService {
  // Get all donations with filtering, sorting, and pagination
  async getDonations(
    filters?: DonationFilters,
    sort?: DonationSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Donation>> {
    await simulateDelay();

    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    let filteredDonations = [...donationsData];

    // Apply filters
    if (filters) {
      if (filters.search) {
        filteredDonations = filterByText(filteredDonations, filters.search, [
          'purpose',
          'paymentMethod',
        ]);
      }

      if (filters.status) {
        filteredDonations = filteredDonations.filter(
          d => d.status === filters.status
        );
      }

      if (filters.purpose) {
        filteredDonations = filteredDonations.filter(d =>
          d.purpose.toLowerCase().includes(filters.purpose!.toLowerCase())
        );
      }

      if (filters.campaignId) {
        filteredDonations = filteredDonations.filter(
          d => d.campaignId === filters.campaignId
        );
      }

      if (filters.dateFrom) {
        filteredDonations = filteredDonations.filter(
          d => d.donationDate >= filters.dateFrom!
        );
      }

      if (filters.dateTo) {
        filteredDonations = filteredDonations.filter(
          d => d.donationDate <= filters.dateTo!
        );
      }

      if (filters.amountMin !== undefined) {
        filteredDonations = filteredDonations.filter(
          d => d.amount >= filters.amountMin!
        );
      }

      if (filters.amountMax !== undefined) {
        filteredDonations = filteredDonations.filter(
          d => d.amount <= filters.amountMax!
        );
      }
    }

    // Apply sorting
    if (sort) {
      filteredDonations = sortByField(
        filteredDonations,
        sort.field,
        sort.direction
      );
    } else {
      // Default sort by donation date (newest first)
      filteredDonations = sortByField(
        filteredDonations,
        'donationDate',
        'desc'
      );
    }

    return createPaginatedResponse(filteredDonations, page, limit);
  }

  // Get single donation
  async getDonationById(id: string): Promise<MockApiResponse<Donation>> {
    await simulateDelay(100, 300);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const donation = donationsData.find(d => d.id === id);

    if (!donation) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }

    return createSuccessResponse(donation);
  }

  // Create new donation
  async createDonation(
    donationData: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MockApiResponse<Donation>> {
    await simulateDelay(300, 800); // Longer delay for payment processing

    if (simulateError(0.05)) {
      // Higher error rate for payment processing
      throw createErrorResponse({
        code: 'PAYMENT_ERROR',
        message:
          'Payment processing failed. Please try again or use a different payment method.',
      });
    }

    // Validate required fields
    if (
      !donationData.donorId ||
      !donationData.amount ||
      !donationData.purpose
    ) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Donor ID, amount, and purpose are required.',
      });
    }

    // Validate amount
    if (donationData.amount <= 0) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Donation amount must be greater than zero.',
      });
    }

    if (donationData.amount > 100000) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message:
          'Donation amount cannot exceed $100,000. Please contact us for larger donations.',
      });
    }

    const newDonation: Donation = {
      ...donationData,
      id: generateId(),
      status: 'pending', // Start as pending, then process
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    donationsData.push(newDonation);

    // Simulate payment processing
    setTimeout(() => {
      const donationIndex = donationsData.findIndex(
        d => d.id === newDonation.id
      );
      if (donationIndex !== -1) {
        donationsData[donationIndex] = {
          ...donationsData[donationIndex],
          status: Math.random() > 0.05 ? 'completed' : 'failed', // 95% success rate
          updatedAt: new Date(),
        };
      }
    }, 2000);

    return createSuccessResponse(
      newDonation,
      'Donation submitted for processing'
    );
  }

  // Update donation status (admin only)
  async updateDonationStatus(
    id: string,
    status: Donation['status']
  ): Promise<MockApiResponse<Donation>> {
    await simulateDelay(200, 400);

    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }

    const donationIndex = donationsData.findIndex(d => d.id === id);

    if (donationIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }

    const updatedDonation = {
      ...donationsData[donationIndex],
      status,
      updatedAt: new Date(),
    };

    donationsData[donationIndex] = updatedDonation;

    return createSuccessResponse(
      updatedDonation,
      'Donation status updated successfully'
    );
  }

  // Get donation campaigns
  async getCampaigns(): Promise<MockApiResponse<typeof campaignsData>> {
    await simulateDelay(100, 250);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    // Update raised amounts based on current donations
    const updatedCampaigns = campaignsData.map(campaign => {
      const campaignDonations = donationsData.filter(
        d => d.campaignId === campaign.id && d.status === 'completed'
      );
      const raised = campaignDonations.reduce((sum, d) => sum + d.amount, 0);

      return {
        ...campaign,
        raised,
      };
    });

    return createSuccessResponse(updatedCampaigns);
  }

  // Get donation statistics
  async getDonationStats(): Promise<
    MockApiResponse<{
      totalDonations: number;
      totalAmount: number;
      averageDonation: number;
      completedDonations: number;
      pendingDonations: number;
      failedDonations: number;
      monthlyTotals: Record<string, number>;
      topDonors: Array<{
        donorId: string;
        totalAmount: number;
        donationCount: number;
      }>;
      purposeBreakdown: Record<string, { amount: number; count: number }>;
      paymentMethodBreakdown: Record<string, number>;
    }>
  > {
    await simulateDelay(150, 400);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const completedDonations = donationsData.filter(
      d => d.status === 'completed'
    );
    const totalAmount = completedDonations.reduce(
      (sum, d) => sum + d.amount,
      0
    );
    const averageDonation =
      completedDonations.length > 0
        ? totalAmount / completedDonations.length
        : 0;

    // Monthly totals
    const monthlyTotals = completedDonations.reduce(
      (acc, donation) => {
        const month = donation.donationDate.toISOString().slice(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + donation.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    // Top donors
    const donorTotals = completedDonations.reduce(
      (acc, donation) => {
        if (!acc[donation.donorId]) {
          acc[donation.donorId] = { totalAmount: 0, donationCount: 0 };
        }
        acc[donation.donorId].totalAmount += donation.amount;
        acc[donation.donorId].donationCount += 1;
        return acc;
      },
      {} as Record<string, { totalAmount: number; donationCount: number }>
    );

    const topDonors = Object.entries(donorTotals)
      .map(([donorId, stats]) => ({ donorId, ...stats }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    // Purpose breakdown
    const purposeBreakdown = completedDonations.reduce(
      (acc, donation) => {
        if (!acc[donation.purpose]) {
          acc[donation.purpose] = { amount: 0, count: 0 };
        }
        acc[donation.purpose].amount += donation.amount;
        acc[donation.purpose].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>
    );

    // Payment method breakdown
    const paymentMethodBreakdown = completedDonations.reduce(
      (acc, donation) => {
        acc[donation.paymentMethod] = (acc[donation.paymentMethod] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const stats = {
      totalDonations: donationsData.length,
      totalAmount,
      averageDonation: Math.round(averageDonation * 100) / 100,
      completedDonations: completedDonations.length,
      pendingDonations: donationsData.filter(d => d.status === 'pending')
        .length,
      failedDonations: donationsData.filter(d => d.status === 'failed').length,
      monthlyTotals,
      topDonors,
      purposeBreakdown,
      paymentMethodBreakdown,
    };

    return createSuccessResponse(stats);
  }

  // Get recent donations
  async getRecentDonations(
    limit: number = 10
  ): Promise<MockApiResponse<Donation[]>> {
    await simulateDelay(100, 200);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const recentDonations = donationsData
      .filter(d => d.status === 'completed')
      .sort((a, b) => b.donationDate.getTime() - a.donationDate.getTime())
      .slice(0, limit);

    return createSuccessResponse(recentDonations);
  }

  // Process pending donations (admin function)
  async processPendingDonations(): Promise<
    MockApiResponse<{ processed: number; failed: number }>
  > {
    await simulateDelay(500, 1000);

    if (simulateError(0.03)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }

    const pendingDonations = donationsData.filter(d => d.status === 'pending');
    let processed = 0;
    let failed = 0;

    pendingDonations.forEach(donation => {
      const donationIndex = donationsData.findIndex(d => d.id === donation.id);
      if (donationIndex !== -1) {
        const success = Math.random() > 0.1; // 90% success rate
        donationsData[donationIndex] = {
          ...donationsData[donationIndex],
          status: success ? 'completed' : 'failed',
          updatedAt: new Date(),
        };

        if (success) {
          processed++;
        } else {
          failed++;
        }
      }
    });

    return createSuccessResponse(
      { processed, failed },
      `Processed ${processed} donations, ${failed} failed`
    );
  }
}

export const mockDonationService = new MockDonationService();

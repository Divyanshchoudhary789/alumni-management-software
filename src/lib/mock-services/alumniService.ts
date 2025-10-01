import { AlumniProfile } from '@/types';
import { mockData } from '@/lib/mock-data';
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
let alumniData = [...mockData.alumni];

export interface AlumniFilters {
  search?: string;
  graduationYear?: number;
  degree?: string;
  location?: string;
  company?: string;
  skills?: string[];
  isPublic?: boolean;
}

export interface AlumniSortOptions {
  field: keyof AlumniProfile;
  direction: 'asc' | 'desc';
}

class MockAlumniService {
  // Get all alumni with filtering, sorting, and pagination
  async getAlumni(
    filters?: AlumniFilters,
    sort?: AlumniSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<AlumniProfile>> {
    await simulateDelay();

    if (simulateError(0.02)) {
      // 2% error rate
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    let filteredAlumni = [...alumniData];

    // Apply filters
    if (filters) {
      if (filters.search) {
        filteredAlumni = filterByText(filteredAlumni, filters.search, [
          'firstName',
          'lastName',
          'currentCompany',
          'currentPosition',
          'degree',
        ]);
      }

      if (filters.graduationYear) {
        filteredAlumni = filteredAlumni.filter(
          a => a.graduationYear === filters.graduationYear
        );
      }

      if (filters.degree) {
        filteredAlumni = filteredAlumni.filter(a =>
          a.degree.toLowerCase().includes(filters.degree!.toLowerCase())
        );
      }

      if (filters.location) {
        filteredAlumni = filteredAlumni.filter(a =>
          a.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.company) {
        filteredAlumni = filteredAlumni.filter(a =>
          a.currentCompany
            ?.toLowerCase()
            .includes(filters.company!.toLowerCase())
        );
      }

      if (filters.skills && filters.skills.length > 0) {
        filteredAlumni = filteredAlumni.filter(a =>
          filters.skills!.some(skill =>
            a.skills.some(alumniSkill =>
              alumniSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      if (filters.isPublic !== undefined) {
        filteredAlumni = filteredAlumni.filter(
          a => a.isPublic === filters.isPublic
        );
      }
    }

    // Apply sorting
    if (sort) {
      filteredAlumni = sortByField(filteredAlumni, sort.field, sort.direction);
    }

    return createPaginatedResponse(filteredAlumni, page, limit);
  }

  // Get single alumni profile
  async getAlumniById(id: string): Promise<MockApiResponse<AlumniProfile>> {
    await simulateDelay(100, 300);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const alumni = alumniData.find(a => a.id === id);

    if (!alumni) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }

    return createSuccessResponse(alumni);
  }

  // Create new alumni profile
  async createAlumni(
    data: Omit<AlumniProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MockApiResponse<AlumniProfile>> {
    await simulateDelay(300, 600);

    if (simulateError(0.03)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }

    // Validate required fields
    if (
      !data.firstName ||
      !data.lastName ||
      !data.graduationYear
    ) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'First name, last name, and graduation year are required.',
      });
    }

    const newAlumni: AlumniProfile = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    alumniData.push(newAlumni);

    return createSuccessResponse(
      newAlumni,
      'Alumni profile created successfully'
    );
  }

  // Update alumni profile
  async updateAlumni(
    id: string,
    updates: Partial<AlumniProfile>
  ): Promise<MockApiResponse<AlumniProfile>> {
    await simulateDelay(200, 500);

    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }

    const alumniIndex = alumniData.findIndex(a => a.id === id);

    if (alumniIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }

    // Validate updates
    if (updates.firstName === '' || updates.lastName === '') {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'First name and last name cannot be empty.',
      });
    }

    const updatedAlumni = {
      ...alumniData[alumniIndex],
      ...updates,
      updatedAt: new Date(),
    };

    alumniData[alumniIndex] = updatedAlumni;

    return createSuccessResponse(
      updatedAlumni,
      'Alumni profile updated successfully'
    );
  }

  // Delete alumni profile
  async deleteAlumni(id: string): Promise<MockApiResponse<{ id: string }>> {
    await simulateDelay(200, 400);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }

    const alumniIndex = alumniData.findIndex(a => a.id === id);

    if (alumniIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }

    alumniData.splice(alumniIndex, 1);

    return createSuccessResponse({ id }, 'Alumni profile deleted successfully');
  }

  // Get alumni statistics
  async getAlumniStats(): Promise<
    MockApiResponse<{
      totalAlumni: number;
      publicProfiles: number;
      graduationYearDistribution: Record<string, number>;
      topCompanies: Array<{ company: string; count: number }>;
      topSkills: Array<{ skill: string; count: number }>;
      locationDistribution: Record<string, number>;
    }>
  > {
    await simulateDelay(150, 400);

    if (simulateError(0)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const totalAlumni = alumniData.length;
    const publicProfiles = alumniData.filter(a => a.isPublic).length;

    // Graduation year distribution
    const graduationYearDistribution = alumniData.reduce(
      (acc, alumni) => {
        const year = alumni.graduationYear.toString();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Top companies
    const companyCount = alumniData.reduce(
      (acc, alumni) => {
        if (alumni.currentCompany) {
          acc[alumni.currentCompany] = (acc[alumni.currentCompany] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const topCompanies = Object.entries(companyCount)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top skills
    const skillCount = alumniData.reduce(
      (acc, alumni) => {
        alumni.skills.forEach(skill => {
          acc[skill] = (acc[skill] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    const topSkills = Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Location distribution
    const locationDistribution = alumniData.reduce(
      (acc, alumni) => {
        if (alumni.location) {
          acc[alumni.location] = (acc[alumni.location] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const stats = {
      totalAlumni,
      publicProfiles,
      graduationYearDistribution,
      topCompanies,
      topSkills,
      locationDistribution,
    };

    return createSuccessResponse(stats);
  }

  // Search alumni with advanced options
  async searchAlumni(
    query: string,
    options?: {
      includePrivate?: boolean;
      limit?: number;
    }
  ): Promise<MockApiResponse<AlumniProfile[]>> {
    await simulateDelay(100, 300);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const { includePrivate = false, limit = 20 } = options || {};

    let searchResults = alumniData;

    // Filter by public profiles unless includePrivate is true
    if (!includePrivate) {
      searchResults = searchResults.filter(a => a.isPublic);
    }

    // Apply search
    if (query) {
      searchResults = filterByText(searchResults, query, [
        'firstName',
        'lastName',
        'currentCompany',
        'currentPosition',
        'degree',
        'location',
        'skills',
        'interests',
      ]);
    }

    // Limit results
    searchResults = searchResults.slice(0, limit);

    return createSuccessResponse(searchResults);
  }
}

export const mockAlumniService = new MockAlumniService();

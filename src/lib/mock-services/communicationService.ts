import { Communication } from '@/types';
import { mockData, mockCommunicationTemplates } from '@/lib/mock-data';
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
  PaginatedResponse
} from './base';

// In-memory storage for mock data
let communicationsData = [...mockData.communications];
let templatesData = [...mockCommunicationTemplates];

export interface CommunicationFilters {
  search?: string;
  type?: string;
  status?: Communication['status'];
  targetAudience?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CommunicationSortOptions {
  field: keyof Communication;
  direction: 'asc' | 'desc';
}

class MockCommunicationService {
  // Get all communications with filtering, sorting, and pagination
  async getCommunications(
    filters?: CommunicationFilters,
    sort?: CommunicationSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Communication>> {
    await simulateDelay();
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    let filteredCommunications = [...communicationsData];
    
    // Apply filters
    if (filters) {
      if (filters.search) {
        filteredCommunications = filterByText(filteredCommunications, filters.search, [
          'title', 'content', 'type'
        ]);
      }
      
      if (filters.type) {
        filteredCommunications = filteredCommunications.filter(c => c.type === filters.type);
      }
      
      if (filters.status) {
        filteredCommunications = filteredCommunications.filter(c => c.status === filters.status);
      }
      
      if (filters.targetAudience && filters.targetAudience.length > 0) {
        filteredCommunications = filteredCommunications.filter(c =>
          filters.targetAudience!.some(audience =>
            c.targetAudience.includes(audience)
          )
        );
      }
      
      if (filters.dateFrom) {
        filteredCommunications = filteredCommunications.filter(c => 
          c.sentDate && c.sentDate >= filters.dateFrom!
        );
      }
      
      if (filters.dateTo) {
        filteredCommunications = filteredCommunications.filter(c => 
          c.sentDate && c.sentDate <= filters.dateTo!
        );
      }
    }
    
    // Apply sorting
    if (sort) {
      filteredCommunications = sortByField(filteredCommunications, sort.field, sort.direction);
    } else {
      // Default sort by created date (newest first)
      filteredCommunications = sortByField(filteredCommunications, 'createdAt', 'desc');
    }
    
    return createPaginatedResponse(filteredCommunications, page, limit);
  }
  
  // Get single communication
  async getCommunicationById(id: string): Promise<MockApiResponse<Communication>> {
    await simulateDelay(100, 300);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const communication = communicationsData.find(c => c.id === id);
    
    if (!communication) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    return createSuccessResponse(communication);
  }
  
  // Create new communication
  async createCommunication(
    communicationData: Omit<Communication, 'id' | 'createdAt' | 'updatedAt' | 'sentDate' | 'status'>
  ): Promise<MockApiResponse<Communication>> {
    await simulateDelay(300, 600);
    
    if (simulateError(0.03)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    // Validate required fields
    if (!communicationData.title || !communicationData.content || !communicationData.type) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Title, content, and type are required.'
      });
    }
    
    if (!communicationData.targetAudience || communicationData.targetAudience.length === 0) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'At least one target audience must be selected.'
      });
    }
    
    const newCommunication: Communication = {
      ...communicationData,
      id: generateId(),
      status: 'draft',
      sentDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    communicationsData.push(newCommunication);
    
    return createSuccessResponse(newCommunication, 'Communication created successfully');
  }
  
  // Update communication
  async updateCommunication(id: string, updates: Partial<Communication>): Promise<MockApiResponse<Communication>> {
    await simulateDelay(200, 500);
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const communicationIndex = communicationsData.findIndex(c => c.id === id);
    
    if (communicationIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const existingCommunication = communicationsData[communicationIndex];
    
    // Don't allow editing sent communications
    if (existingCommunication.status === 'sent') {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Cannot edit communications that have already been sent.'
      });
    }
    
    // Validate updates
    if (updates.title === '') {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Communication title cannot be empty.'
      });
    }
    
    if (updates.targetAudience && updates.targetAudience.length === 0) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'At least one target audience must be selected.'
      });
    }
    
    const updatedCommunication = {
      ...existingCommunication,
      ...updates,
      updatedAt: new Date()
    };
    
    communicationsData[communicationIndex] = updatedCommunication;
    
    return createSuccessResponse(updatedCommunication, 'Communication updated successfully');
  }
  
  // Delete communication
  async deleteCommunication(id: string): Promise<MockApiResponse<{ id: string }>> {
    await simulateDelay(200, 400);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const communicationIndex = communicationsData.findIndex(c => c.id === id);
    
    if (communicationIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const communication = communicationsData[communicationIndex];
    
    // Don't allow deleting sent communications
    if (communication.status === 'sent') {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Cannot delete communications that have already been sent.'
      });
    }
    
    communicationsData.splice(communicationIndex, 1);
    
    return createSuccessResponse({ id }, 'Communication deleted successfully');
  }
  
  // Send communication
  async sendCommunication(id: string, scheduleDate?: Date): Promise<MockApiResponse<Communication>> {
    await simulateDelay(500, 1200); // Longer delay for sending
    
    if (simulateError(0.05)) { // Higher error rate for sending
      throw createErrorResponse({
        code: 'SEND_ERROR',
        message: 'Failed to send communication. Please try again.'
      });
    }
    
    const communicationIndex = communicationsData.findIndex(c => c.id === id);
    
    if (communicationIndex === -1) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    const communication = communicationsData[communicationIndex];
    
    if (communication.status === 'sent') {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Communication has already been sent.'
      });
    }
    
    // Validate content before sending
    if (!communication.title || !communication.content) {
      throw createErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Communication must have title and content before sending.'
      });
    }
    
    let status: Communication['status'] = 'sent';
    let sentDate: Date | null = new Date();
    
    if (scheduleDate && scheduleDate > new Date()) {
      status = 'scheduled';
      sentDate = scheduleDate;
    }
    
    const updatedCommunication = {
      ...communication,
      status,
      sentDate,
      updatedAt: new Date()
    };
    
    communicationsData[communicationIndex] = updatedCommunication;
    
    const message = status === 'scheduled' 
      ? `Communication scheduled for ${scheduleDate?.toLocaleDateString()}`
      : 'Communication sent successfully';
    
    return createSuccessResponse(updatedCommunication, message);
  }
  
  // Get communication templates
  async getTemplates(): Promise<MockApiResponse<typeof templatesData>> {
    await simulateDelay(100, 250);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    return createSuccessResponse(templatesData);
  }
  
  // Create communication from template
  async createFromTemplate(
    templateId: string,
    customizations: {
      title?: string;
      targetAudience: string[];
      variables?: Record<string, string>;
    }
  ): Promise<MockApiResponse<Communication>> {
    await simulateDelay(200, 400);
    
    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.SERVER_ERROR);
    }
    
    const template = templatesData.find(t => t.id === templateId);
    
    if (!template) {
      throw createErrorResponse(mockErrors.NOT_FOUND);
    }
    
    // Replace variables in template content
    let content = template.content;
    if (customizations.variables) {
      Object.entries(customizations.variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
      });
    }
    
    const newCommunication: Communication = {
      id: generateId(),
      title: customizations.title || template.subject,
      content,
      type: template.type,
      targetAudience: customizations.targetAudience,
      status: 'draft',
      sentDate: null,
      createdBy: 'current_user', // Would be actual user ID
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    communicationsData.push(newCommunication);
    
    return createSuccessResponse(newCommunication, 'Communication created from template');
  }
  
  // Get communication statistics
  async getCommunicationStats(): Promise<MockApiResponse<{
    totalCommunications: number;
    sent: number;
    scheduled: number;
    drafts: number;
    failed: number;
    typeBreakdown: Record<string, number>;
    monthlyActivity: Record<string, number>;
    audienceReach: Record<string, number>;
  }>> {
    await simulateDelay(150, 300);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const totalCommunications = communicationsData.length;
    const sent = communicationsData.filter(c => c.status === 'sent').length;
    const scheduled = communicationsData.filter(c => c.status === 'scheduled').length;
    const drafts = communicationsData.filter(c => c.status === 'draft').length;
    const failed = communicationsData.filter(c => c.status === 'failed').length;
    
    // Type breakdown
    const typeBreakdown = communicationsData.reduce((acc, comm) => {
      acc[comm.type] = (acc[comm.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Monthly activity (sent communications)
    const monthlyActivity = communicationsData
      .filter(c => c.status === 'sent' && c.sentDate)
      .reduce((acc, comm) => {
        const month = comm.sentDate!.toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    // Audience reach
    const audienceReach = communicationsData
      .filter(c => c.status === 'sent')
      .reduce((acc, comm) => {
        comm.targetAudience.forEach(audience => {
          acc[audience] = (acc[audience] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);
    
    const stats = {
      totalCommunications,
      sent,
      scheduled,
      drafts,
      failed,
      typeBreakdown,
      monthlyActivity,
      audienceReach
    };
    
    return createSuccessResponse(stats);
  }
  
  // Get recent communications
  async getRecentCommunications(limit: number = 5): Promise<MockApiResponse<Communication[]>> {
    await simulateDelay(100, 200);
    
    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }
    
    const recentCommunications = communicationsData
      .filter(c => c.status === 'sent')
      .sort((a, b) => {
        if (!a.sentDate || !b.sentDate) return 0;
        return b.sentDate.getTime() - a.sentDate.getTime();
      })
      .slice(0, limit);
    
    return createSuccessResponse(recentCommunications);
  }
}

export const mockCommunicationService = new MockCommunicationService();
import api, { ApiResponse, Tool, CalibrationRecord, UsageRecord } from '../api';

/**
 * Tool service for handling tool operations
 */
const toolService = {
  /**
   * Get all tools
   * @param params Query parameters
   * @returns Promise with tools
   */
  getTools: async (params?: {
    page?: number;
    limit?: number;
    department?: string;
    type?: string;
    status?: string;
    condition?: string;
    search?: string;
    calibrationStatus?: string;
  }): Promise<{ data: Tool[]; pagination: any }> => {
    try {
      const response = await api.get<ApiResponse<Tool[]>>('/tools', { params });
      
      if (response.data.success && response.data.data) {
        return {
          data: response.data.data,
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch tools');
      }
    } catch (error: any) {
      console.error('Get tools error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch tools');
    }
  },

  /**
   * Get single tool
   * @param id Tool ID
   * @returns Promise with tool
   */
  getTool: async (id: string): Promise<Tool> => {
    try {
      const response = await api.get<ApiResponse<Tool>>(`/tools/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch tool');
      }
    } catch (error: any) {
      console.error('Get tool error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch tool');
    }
  },

  /**
   * Create new tool
   * @param toolData Tool data
   * @returns Promise with created tool
   */
  createTool: async (toolData: Partial<Tool>): Promise<Tool> => {
    try {
      const response = await api.post<ApiResponse<Tool>>('/tools', toolData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create tool');
      }
    } catch (error: any) {
      console.error('Create tool error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create tool');
    }
  },

  /**
   * Update tool
   * @param id Tool ID
   * @param toolData Tool data
   * @returns Promise with updated tool
   */
  updateTool: async (id: string, toolData: Partial<Tool>): Promise<Tool> => {
    try {
      const response = await api.put<ApiResponse<Tool>>(`/tools/${id}`, toolData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update tool');
      }
    } catch (error: any) {
      console.error('Update tool error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update tool');
    }
  },

  /**
   * Delete tool
   * @param id Tool ID
   * @returns Promise with success message
   */
  deleteTool: async (id: string): Promise<string> => {
    try {
      const response = await api.delete<ApiResponse>(`/tools/${id}`);
      
      if (response.data.success) {
        return response.data.message || 'Tool deleted successfully';
      } else {
        throw new Error(response.data.message || 'Failed to delete tool');
      }
    } catch (error: any) {
      console.error('Delete tool error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete tool');
    }
  },

  /**
   * Add usage record
   * @param id Tool ID
   * @param usageData Usage record data
   * @returns Promise with usage record
   */
  addUsageRecord: async (id: string, usageData: Partial<UsageRecord>): Promise<UsageRecord> => {
    try {
      const response = await api.post<ApiResponse<UsageRecord>>(`/tools/${id}/usage`, usageData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add usage record');
      }
    } catch (error: any) {
      console.error('Add usage record error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add usage record');
    }
  },

  /**
   * Add calibration record
   * @param id Tool ID
   * @param calibrationData Calibration record data
   * @returns Promise with calibration record
   */
  addCalibrationRecord: async (id: string, calibrationData: Partial<CalibrationRecord>): Promise<CalibrationRecord> => {
    try {
      const response = await api.post<ApiResponse<CalibrationRecord>>(`/tools/${id}/calibration`, calibrationData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add calibration record');
      }
    } catch (error: any) {
      console.error('Add calibration record error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add calibration record');
    }
  }
};

export default toolService;

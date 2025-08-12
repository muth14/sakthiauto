import api, { ApiResponse, Machine, MaintenanceRecord } from '../api';

/**
 * Machine service for handling machine operations
 */
const machineService = {
  /**
   * Get all machines
   * @param params Query parameters
   * @returns Promise with machines
   */
  getMachines: async (params?: {
    page?: number;
    limit?: number;
    department?: string;
    status?: string;
    search?: string;
    maintenanceStatus?: string;
  }): Promise<{ data: Machine[]; pagination: any }> => {
    try {
      const response = await api.get<ApiResponse<Machine[]>>('/machines', { params });
      
      if (response.data.success && response.data.data) {
        return {
          data: response.data.data,
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch machines');
      }
    } catch (error: any) {
      console.error('Get machines error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch machines');
    }
  },

  /**
   * Get single machine
   * @param id Machine ID
   * @returns Promise with machine
   */
  getMachine: async (id: string): Promise<Machine> => {
    try {
      const response = await api.get<ApiResponse<Machine>>(`/machines/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch machine');
      }
    } catch (error: any) {
      console.error('Get machine error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch machine');
    }
  },

  /**
   * Create new machine
   * @param machineData Machine data
   * @returns Promise with created machine
   */
  createMachine: async (machineData: Partial<Machine>): Promise<Machine> => {
    try {
      const response = await api.post<ApiResponse<Machine>>('/machines', machineData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create machine');
      }
    } catch (error: any) {
      console.error('Create machine error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create machine');
    }
  },

  /**
   * Update machine
   * @param id Machine ID
   * @param machineData Machine data
   * @returns Promise with updated machine
   */
  updateMachine: async (id: string, machineData: Partial<Machine>): Promise<Machine> => {
    try {
      const response = await api.put<ApiResponse<Machine>>(`/machines/${id}`, machineData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update machine');
      }
    } catch (error: any) {
      console.error('Update machine error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update machine');
    }
  },

  /**
   * Delete machine
   * @param id Machine ID
   * @returns Promise with success message
   */
  deleteMachine: async (id: string): Promise<string> => {
    try {
      const response = await api.delete<ApiResponse>(`/machines/${id}`);
      
      if (response.data.success) {
        return response.data.message || 'Machine deleted successfully';
      } else {
        throw new Error(response.data.message || 'Failed to delete machine');
      }
    } catch (error: any) {
      console.error('Delete machine error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete machine');
    }
  },

  /**
   * Add maintenance record
   * @param id Machine ID
   * @param maintenanceData Maintenance record data
   * @returns Promise with maintenance record
   */
  addMaintenanceRecord: async (id: string, maintenanceData: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    try {
      const response = await api.post<ApiResponse<MaintenanceRecord>>(`/machines/${id}/maintenance`, maintenanceData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add maintenance record');
      }
    } catch (error: any) {
      console.error('Add maintenance record error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add maintenance record');
    }
  }
};

export default machineService;

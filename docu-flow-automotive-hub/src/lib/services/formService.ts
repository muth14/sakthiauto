import api, { ApiResponse, FormTemplate, FormSubmission } from '../api';

/**
 * Form service for handling form templates and submissions
 */
const formService = {
  // Form Templates
  /**
   * Get all form templates
   * @param params Query parameters
   * @returns Promise with form templates
   */
  getFormTemplates: async (params?: {
    page?: number;
    limit?: number;
    department?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<{ data: FormTemplate[]; pagination: any }> => {
    try {
      const response = await api.get<ApiResponse<FormTemplate[]>>('/forms/templates', { params });
      
      if (response.data.success && response.data.data) {
        return {
          data: response.data.data,
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch form templates');
      }
    } catch (error: any) {
      console.error('Get form templates error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch form templates');
    }
  },

  /**
   * Get single form template
   * @param id Template ID
   * @returns Promise with form template
   */
  getFormTemplate: async (id: string): Promise<FormTemplate> => {
    try {
      const response = await api.get<ApiResponse<FormTemplate>>(`/forms/templates/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch form template');
      }
    } catch (error: any) {
      console.error('Get form template error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch form template');
    }
  },

  /**
   * Create new form template
   * @param templateData Template data
   * @returns Promise with created template
   */
  createFormTemplate: async (templateData: Partial<FormTemplate>): Promise<FormTemplate> => {
    try {
      const response = await api.post<ApiResponse<FormTemplate>>('/forms/templates', templateData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create form template');
      }
    } catch (error: any) {
      console.error('Create form template error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create form template');
    }
  },

  /**
   * Update form template
   * @param id Template ID
   * @param templateData Template data
   * @returns Promise with updated template
   */
  updateFormTemplate: async (id: string, templateData: Partial<FormTemplate>): Promise<FormTemplate> => {
    try {
      const response = await api.put<ApiResponse<FormTemplate>>(`/forms/templates/${id}`, templateData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update form template');
      }
    } catch (error: any) {
      console.error('Update form template error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update form template');
    }
  },

  /**
   * Delete form template
   * @param id Template ID
   * @returns Promise with success message
   */
  deleteFormTemplate: async (id: string): Promise<string> => {
    try {
      const response = await api.delete<ApiResponse>(`/forms/templates/${id}`);
      
      if (response.data.success) {
        return response.data.message || 'Form template deleted successfully';
      } else {
        throw new Error(response.data.message || 'Failed to delete form template');
      }
    } catch (error: any) {
      console.error('Delete form template error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete form template');
    }
  },

  /**
   * Approve form template
   * @param id Template ID
   * @returns Promise with approved template
   */
  approveFormTemplate: async (id: string): Promise<FormTemplate> => {
    try {
      const response = await api.put<ApiResponse<FormTemplate>>(`/forms/templates/${id}/approve`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to approve form template');
      }
    } catch (error: any) {
      console.error('Approve form template error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to approve form template');
    }
  },

  // Form Submissions
  /**
   * Get all form submissions
   * @param params Query parameters
   * @returns Promise with form submissions
   */
  getFormSubmissions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    submittedBy?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<{ data: FormSubmission[]; pagination: any }> => {
    try {
      const response = await api.get<ApiResponse<FormSubmission[]>>('/forms/submissions', { params });
      
      if (response.data.success && response.data.data) {
        return {
          data: response.data.data,
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch form submissions');
      }
    } catch (error: any) {
      console.error('Get form submissions error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch form submissions');
    }
  },

  /**
   * Get single form submission
   * @param id Submission ID
   * @returns Promise with form submission
   */
  getFormSubmission: async (id: string): Promise<FormSubmission> => {
    try {
      const response = await api.get<ApiResponse<FormSubmission>>(`/forms/submissions/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch form submission');
      }
    } catch (error: any) {
      console.error('Get form submission error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch form submission');
    }
  },

  /**
   * Create new form submission
   * @param submissionData Submission data
   * @returns Promise with created submission
   */
  createFormSubmission: async (submissionData: Partial<FormSubmission>): Promise<FormSubmission> => {
    try {
      const response = await api.post<ApiResponse<FormSubmission>>('/forms/submissions', submissionData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create form submission');
      }
    } catch (error: any) {
      console.error('Create form submission error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create form submission');
    }
  },

  /**
   * Update form submission
   * @param id Submission ID
   * @param submissionData Submission data
   * @returns Promise with updated submission
   */
  updateFormSubmission: async (id: string, submissionData: Partial<FormSubmission>): Promise<FormSubmission> => {
    try {
      const response = await api.put<ApiResponse<FormSubmission>>(`/forms/submissions/${id}`, submissionData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update form submission');
      }
    } catch (error: any) {
      console.error('Update form submission error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update form submission');
    }
  },

  /**
   * Submit form (change status from Draft to Submitted)
   * @param id Submission ID
   * @returns Promise with submitted form
   */
  submitForm: async (id: string): Promise<FormSubmission> => {
    try {
      const response = await api.put<ApiResponse<FormSubmission>>(`/forms/submissions/${id}/submit`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to submit form');
      }
    } catch (error: any) {
      console.error('Submit form error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to submit form');
    }
  },

  /**
   * Verify form submission
   * @param id Submission ID
   * @param comments Verification comments
   * @returns Promise with verified form
   */
  verifyFormSubmission: async (id: string, comments?: string): Promise<FormSubmission> => {
    try {
      const response = await api.put<ApiResponse<FormSubmission>>(`/forms/submissions/${id}/verify`, { comments });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to verify form submission');
      }
    } catch (error: any) {
      console.error('Verify form submission error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to verify form submission');
    }
  },

  /**
   * Approve form submission
   * @param id Submission ID
   * @param comments Approval comments
   * @returns Promise with approved form
   */
  approveFormSubmission: async (id: string, comments?: string): Promise<FormSubmission> => {
    try {
      const response = await api.put<ApiResponse<FormSubmission>>(`/forms/submissions/${id}/approve`, { comments });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to approve form submission');
      }
    } catch (error: any) {
      console.error('Approve form submission error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to approve form submission');
    }
  },

  /**
   * Reject form submission
   * @param id Submission ID
   * @param comments Rejection comments
   * @param step Rejection step (verification or approval)
   * @returns Promise with rejected form
   */
  rejectFormSubmission: async (id: string, comments: string, step: 'verification' | 'approval'): Promise<FormSubmission> => {
    try {
      const response = await api.put<ApiResponse<FormSubmission>>(`/forms/submissions/${id}/reject`, { comments, step });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to reject form submission');
      }
    } catch (error: any) {
      console.error('Reject form submission error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reject form submission');
    }
  }
};

export default formService;

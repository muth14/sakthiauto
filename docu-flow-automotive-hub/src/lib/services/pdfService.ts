import api, { ApiResponse } from '../api';

/**
 * PDF service for handling PDF generation and downloads
 */
const pdfService = {
  /**
   * Generate PDF for form submission
   * @param submissionId Form submission ID
   * @param watermark Whether to include watermark (default: true)
   * @returns Promise with PDF generation result
   */
  generatePDF: async (submissionId: string, watermark: boolean = true): Promise<{
    pdfPath: string;
    submissionId: string;
    downloadUrl: string;
  }> => {
    try {
      const response = await api.post<ApiResponse<{
        pdfPath: string;
        submissionId: string;
        downloadUrl: string;
      }>>(`/pdf/generate/${submissionId}`, { watermark });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to generate PDF');
      }
    } catch (error: any) {
      console.error('Generate PDF error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to generate PDF');
    }
  },

  /**
   * Download PDF for form submission
   * @param submissionId Form submission ID
   * @returns Promise with PDF blob
   */
  downloadPDF: async (submissionId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/pdf/download/${submissionId}`, {
        responseType: 'blob',
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Download PDF error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to download PDF');
    }
  },

  /**
   * View PDF in browser (inline)
   * @param submissionId Form submission ID
   * @returns Promise with PDF blob
   */
  viewPDF: async (submissionId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/pdf/view/${submissionId}`, {
        responseType: 'blob',
      });
      
      return response.data;
    } catch (error: any) {
      console.error('View PDF error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to view PDF');
    }
  },

  /**
   * Delete PDF for form submission
   * @param submissionId Form submission ID
   * @returns Promise with success message
   */
  deletePDF: async (submissionId: string): Promise<string> => {
    try {
      const response = await api.delete<ApiResponse>(`/pdf/${submissionId}`);
      
      if (response.data.success) {
        return response.data.message || 'PDF deleted successfully';
      } else {
        throw new Error(response.data.message || 'Failed to delete PDF');
      }
    } catch (error: any) {
      console.error('Delete PDF error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete PDF');
    }
  },

  /**
   * Get PDF download URL
   * @param submissionId Form submission ID
   * @returns Download URL
   */
  getDownloadUrl: (submissionId: string): string => {
    return `${api.defaults.baseURL}/pdf/download/${submissionId}`;
  },

  /**
   * Get PDF view URL
   * @param submissionId Form submission ID
   * @returns View URL
   */
  getViewUrl: (submissionId: string): string => {
    return `${api.defaults.baseURL}/pdf/view/${submissionId}`;
  },

  /**
   * Download PDF and save as file
   * @param submissionId Form submission ID
   * @param filename Custom filename (optional)
   */
  downloadAndSave: async (submissionId: string, filename?: string): Promise<void> => {
    try {
      const blob = await pdfService.downloadPDF(submissionId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `form_${submissionId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download and save PDF error:', error);
      throw error;
    }
  },

  /**
   * Open PDF in new tab
   * @param submissionId Form submission ID
   */
  openInNewTab: async (submissionId: string): Promise<void> => {
    try {
      const blob = await pdfService.viewPDF(submissionId);
      
      // Create object URL and open in new tab
      const url = window.URL.createObjectURL(blob);
      const newTab = window.open(url, '_blank');
      
      if (!newTab) {
        throw new Error('Failed to open PDF in new tab. Please check your popup blocker settings.');
      }
      
      // Cleanup URL after a delay to allow the tab to load
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error: any) {
      console.error('Open PDF in new tab error:', error);
      throw error;
    }
  }
};

export default pdfService;

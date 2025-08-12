import api, { ApiResponse, FileAttachment } from '../api';

/**
 * File service for handling file uploads and downloads
 */
const fileService = {
  /**
   * Upload single file
   * @param file File to upload
   * @param relatedForm Related form ID (optional)
   * @param description File description (optional)
   * @returns Promise with file metadata
   */
  uploadFile: async (file: File, relatedForm?: string, description?: string): Promise<FileAttachment> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (relatedForm) formData.append('relatedForm', relatedForm);
      if (description) formData.append('description', description);

      const response = await api.post<ApiResponse<FileAttachment>>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to upload file');
      }
    } catch (error: any) {
      console.error('Upload file error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload file');
    }
  },

  /**
   * Upload multiple files
   * @param files Files to upload
   * @param relatedForm Related form ID (optional)
   * @param description Files description (optional)
   * @returns Promise with file metadata array
   */
  uploadMultipleFiles: async (files: File[], relatedForm?: string, description?: string): Promise<FileAttachment[]> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      if (relatedForm) formData.append('relatedForm', relatedForm);
      if (description) formData.append('description', description);

      const response = await api.post<ApiResponse<FileAttachment[]>>('/files/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to upload files');
      }
    } catch (error: any) {
      console.error('Upload multiple files error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload files');
    }
  },

  /**
   * Download file
   * @param filename File name
   * @returns Promise with file blob
   */
  downloadFile: async (filename: string): Promise<Blob> => {
    try {
      const response = await api.get(`/files/download/${filename}`, {
        responseType: 'blob',
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Download file error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to download file');
    }
  },

  /**
   * Delete file
   * @param filename File name
   * @returns Promise with success message
   */
  deleteFile: async (filename: string): Promise<string> => {
    try {
      const response = await api.delete<ApiResponse>(`/files/${filename}`);
      
      if (response.data.success) {
        return response.data.message || 'File deleted successfully';
      } else {
        throw new Error(response.data.message || 'Failed to delete file');
      }
    } catch (error: any) {
      console.error('Delete file error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete file');
    }
  },

  /**
   * Get file download URL
   * @param filename File name
   * @returns Download URL
   */
  getDownloadUrl: (filename: string): string => {
    return `${api.defaults.baseURL}/files/download/${filename}`;
  },

  /**
   * Validate file type
   * @param file File to validate
   * @param allowedTypes Allowed MIME types
   * @returns Boolean indicating if file type is valid
   */
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  /**
   * Validate file size
   * @param file File to validate
   * @param maxSizeInMB Maximum file size in MB
   * @returns Boolean indicating if file size is valid
   */
  validateFileSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  /**
   * Format file size for display
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get file extension from filename
   * @param filename File name
   * @returns File extension
   */
  getFileExtension: (filename: string): string => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  /**
   * Check if file is an image
   * @param file File to check
   * @returns Boolean indicating if file is an image
   */
  isImage: (file: File): boolean => {
    return file.type.startsWith('image/');
  },

  /**
   * Check if file is a PDF
   * @param file File to check
   * @returns Boolean indicating if file is a PDF
   */
  isPDF: (file: File): boolean => {
    return file.type === 'application/pdf';
  },

  /**
   * Check if file is an Excel file
   * @param file File to check
   * @returns Boolean indicating if file is an Excel file
   */
  isExcel: (file: File): boolean => {
    const excelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet'
    ];
    return excelTypes.includes(file.type);
  }
};

export default fileService;

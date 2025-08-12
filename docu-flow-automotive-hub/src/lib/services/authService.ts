import api, { ApiResponse, LoginCredentials, LoginResponse, User } from '../api';

/**
 * Authentication service for handling user authentication
 */
const authService = {
  /**
   * Login user with email and password
   * @param credentials User login credentials
   * @returns Promise with login response
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        // Store token and user data
        const { token, user } = response.data.data;
        localStorage.setItem('sakthiauto_token', token);
        localStorage.setItem('sakthiauto_user', JSON.stringify(user));
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post<ApiResponse>('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('sakthiauto_token');
      localStorage.removeItem('sakthiauto_user');
    }
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('sakthiauto_user', JSON.stringify(response.data.data));
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get user profile');
      }
    } catch (error: any) {
      console.error('Get user profile error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get user profile');
    }
  },

  /**
   * Update user profile
   * @param userData User data to update
   * @returns Promise with updated user data
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<ApiResponse<User>>('/auth/me', userData);
      
      if (response.data.success && response.data.data) {
        // Update stored user data
        const storedUser = JSON.parse(localStorage.getItem('sakthiauto_user') || '{}');
        const updatedUser = { ...storedUser, ...response.data.data };
        localStorage.setItem('sakthiauto_user', JSON.stringify(updatedUser));
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  },

  /**
   * Change user password
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Promise with success message
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
    try {
      const response = await api.put<ApiResponse>('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        return response.data.message || 'Password changed successfully';
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to change password');
    }
  },

  /**
   * Check if user is authenticated
   * @returns Boolean indicating if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('sakthiauto_token');
  },

  /**
   * Get stored user data
   * @returns User data from local storage
   */
  getStoredUser: (): User | null => {
    const userJson = localStorage.getItem('sakthiauto_user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }
};

export default authService;

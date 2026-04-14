import apiClient from './apiClient';

const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  verifyOTP: async (otpData) => {
    const response = await apiClient.post('/auth/verify-otp', otpData);
    return response.data;
  },

  resendOTP: async (otpToken) => {
    const response = await apiClient.post('/auth/resend-otp', { otpToken });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  createSubAdmin: async (userData) => {
    const response = await apiClient.post('/admin/create-sub-admin', userData);
    return response.data;
  },
};

export default authService;

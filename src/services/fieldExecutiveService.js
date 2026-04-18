import apiClient from './apiClient';

export const fieldExecutiveService = {
    // Get all field executives
    getAll: async ({ page = 1, limit = 50, search = '' } = {}) => {
        const res = await apiClient.get('/field-executives', { params: { page, limit, search } });
        if (res.data.success === false) throw new Error(res.data.message || 'Failed to fetch executives');
        return res.data;
    },

    // Get single field executive
    getById: async (id) => {
        const res = await apiClient.get(`/field-executives/${id}`);
        if (res.data.success === false) throw new Error(res.data.message || 'Failed to fetch executive');
        return res.data;
    },

    // Create field executive
    create: async (executiveData) => {
        const res = await apiClient.post('/field-executives', executiveData);
        if (res.data.success === false) throw new Error(res.data.message || 'Failed to create executive');
        return res.data;
    },

    // Update field executive
    update: async ({ id, executiveData }) => {
        const res = await apiClient.put(`/field-executives/${id}`, executiveData);
        if (res.data.success === false) throw new Error(res.data.message || 'Failed to update executive');
        return res.data;
    },

    // Delete field executive
    delete: async (id) => {
        const res = await apiClient.delete(`/field-executives/${id}`);
        if (res.data.success === false) throw new Error(res.data.message || 'Failed to delete executive');
        return res.data;
    },

    // Login
    login: async (credentials) => {
        const res = await apiClient.post('/field-executives/login', credentials);
        if (res.data.success === false) throw new Error(res.data.message || 'Login failed');
        return res.data;
    },
};

import apiClient from './apiClient';

export const fieldExecutiveService = {
    // Get all field executives
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        const { data } = await apiClient.get('/field-executives', { params: { page, limit } });
        return data;
    },

    // Get single field executive
    getById: async (id) => {
        const { data } = await apiClient.get(`/field-executives/${id}`);
        return data;
    },

    // Create field executive
    create: async (executiveData) => {
        const { data } = await apiClient.post('/field-executives', executiveData);
        return data;
    },

    // Update field executive
    update: async ({ id, executiveData }) => {
        const { data } = await apiClient.put(`/field-executives/${id}`, executiveData);
        return data;
    },

    // Delete field executive
    delete: async (id) => {
        const { data } = await apiClient.delete(`/field-executives/${id}`);
        return data;
    },

    // Login
    login: async (credentials) => {
        const { data } = await apiClient.post('/field-executives/login', credentials);
        return data;
    },
};

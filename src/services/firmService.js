import apiClient from './apiClient';

export const firmService = {
    // Get all firms
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        const { data } = await apiClient.get('/casefirm', { params: { page, limit } });
        return data;
    },

    // Get single firm
    getById: async (id) => {
        const { data } = await apiClient.get(`/casefirm/${id}`);
        return data;
    },

    // Create firm
    create: async (firmData) => {
        const { data } = await apiClient.post('/casefirm', firmData);
        return data;
    },

    // Update firm
    update: async ({ id, firmData }) => {
        const { data } = await apiClient.put(`/casefirm/${id}`, firmData);
        return data;
    },

    // Delete firm
    delete: async (id) => {
        const { data } = await apiClient.delete(`/casefirm/${id}`);
        return data;
    },
};

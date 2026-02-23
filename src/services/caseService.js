import apiClient from './apiClient';

export const caseService = {
    // Get all cases
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        const { data } = await apiClient.get('/cases', { params: { page, limit } });
        return data;
    },

    // Get single case
    getById: async (id) => {
        const { data } = await apiClient.get(`/cases/${id}`);
        return data;
    },

    // Create case
    create: async (caseData) => {
        const { data } = await apiClient.post('/cases', caseData);
        return data;
    },

    // Update case
    update: async ({ id, caseData }) => {
        const { data } = await apiClient.put(`/cases/${id}`, caseData);
        return data;
    },

    // Delete case
    delete: async (id) => {
        const { data } = await apiClient.delete(`/cases/${id}`);
        return data;
    },
};

import apiClient from './apiClient';

export const investigationService = {
    // Get paginated investigations or all
    getAll: async (params = {}) => {
        const { data } = await apiClient.get('/investigations', {
            params,
        });
        return data;
    },

    // Delete investigation
    delete: async (id) => {
        const { data } = await apiClient.delete(`/investigations/${id}`);
        return data;
    },
};

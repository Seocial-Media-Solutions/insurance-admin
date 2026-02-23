import apiClient from './apiClient';

export const assignmentService = {
    // Get all assignments
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        const { data } = await apiClient.get('/assignments', { params: { page, limit } });
        return data;
    },

    // Get single assignment
    getById: async (id) => {
        const { data } = await apiClient.get(`/assignments/${id}`);
        return data;
    },

    // Get assignments by case ID
    getByCaseId: async (caseId) => {
        // Note: Using /assignments/case/:id as per existing usage in CaseView.jsx
        // Adjust endpoint if strictly /assignments is required by backend standardisation
        const { data } = await apiClient.get(`/assignments/case/${caseId}`);
        return data;
    },

    // Create assignment
    create: async (assignmentData) => {
        const { data } = await apiClient.post('/assignments', assignmentData);
        return data;
    },

    // Update assignment
    update: async ({ id, assignmentData }) => {
        const { data } = await apiClient.put(`/assignments/${id}`, assignmentData);
        return data;
    },

    // Delete assignment
    delete: async (id) => {
        const { data } = await apiClient.delete(`/assignments/${id}`);
        return data;
    },
};

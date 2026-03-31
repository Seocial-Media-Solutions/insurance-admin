import toast from 'react-hot-toast';
import apiClient from './apiClient';

export const assignmentService = {
    // Get all assignments
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        return toast.promise(apiClient.get('/assignments', { params: { page, limit } }).then(res => res.data), {
            loading: 'Fetching assignments...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch assignments',
        });
    },

    // Get single assignment
    getById: async (id) => {
        return toast.promise(apiClient.get(`/assignments/${id}`).then(res => res.data), {
            loading: 'Fetching assignment details...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch assignment',
        });
    },

    // Get assignments by case ID
    getByCaseId: async (caseId) => {
        return toast.promise(apiClient.get(`/assignments/case/${caseId}`).then(res => res.data), {
            loading: 'Fetching case assignments...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch assignments',
        });
    },

    // Create assignment
    create: async (assignmentData) => {
        return toast.promise(apiClient.post('/assignments', assignmentData).then(res => res.data), {
            loading: 'Creating assignment...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to create assignment',
        });
    },

    // Update assignment
    update: async ({ id, assignmentData }) => {
        return toast.promise(apiClient.put(`/assignments/${id}`, assignmentData).then(res => res.data), {
            loading: 'Updating assignment...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to update assignment',
        });
    },

    // Delete assignment
    delete: async (id) => {
        return toast.promise(apiClient.delete(`/assignments/${id}`).then(res => res.data), {
            loading: 'Deleting assignment...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete assignment',
        });
    },
};

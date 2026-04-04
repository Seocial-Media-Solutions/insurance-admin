import toast from 'react-hot-toast';
import apiClient from './apiClient';

export const caseService = {
    // Get dashboard stats
    getStats: async () => {
        return toast.promise(apiClient.get('/dashboard/stats').then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to fetch stats');
            return res.data;
        }), {
            loading: 'Fetching dashboard stats...',
            success: (data) => data.message || 'Dashboard stats loaded',
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch stats',
        });
    },

    // Get all cases
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        return toast.promise(apiClient.get('/cases', { params: { page, limit } }).then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to fetch cases');
            return res.data;
        }), {
            loading: 'Fetching cases...',
            success: (data) => data.message || 'Cases loaded',
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch cases',
        });
    },

    // Get single case
    getById: async (id) => {
        return toast.promise(apiClient.get(`/cases/${id}`).then(res => res.data), {
            loading: 'Fetching case details...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch case',
        });
    },

    // Create case
    create: async (caseData) => {
        return toast.promise(apiClient.post('/cases', caseData).then(res => res.data), {
            loading: 'Creating case...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to create case',
        });
    },

    // Update case
    update: async ({ id, caseData }) => {
        return toast.promise(apiClient.put(`/cases/${id}`, caseData).then(res => res.data), {
            loading: 'Updating case...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to update case',
        });
    },

    // Delete case
    delete: async (id) => {
        return toast.promise(apiClient.delete(`/cases/${id}`).then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to delete case');
            return res.data;
        }), {
            loading: 'Deleting case...',
            success: (data) => data.message || 'Case deleted successfully',
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete case',
        });
    },
};

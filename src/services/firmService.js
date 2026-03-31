import toast from 'react-hot-toast';
import apiClient from './apiClient';

export const firmService = {
    // Get all firms
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        return toast.promise(apiClient.get('/casefirm', { params: { page, limit } }).then(res => res.data), {
            loading: 'Fetching firms...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch firms',
        });
    },

    // Get single firm
    getById: async (id) => {
        return toast.promise(apiClient.get(`/casefirm/${id}`).then(res => res.data), {
            loading: 'Fetching firm details...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch firm',
        });
    },

    // Create firm
    create: async (firmData) => {
        return toast.promise(apiClient.post('/casefirm', firmData).then(res => res.data), {
            loading: 'Creating firm...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to create firm',
        });
    },

    // Update firm
    update: async ({ id, firmData }) => {
        return toast.promise(apiClient.put(`/casefirm/${id}`, firmData).then(res => res.data), {
            loading: 'Updating firm...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to update firm',
        });
    },

    // Delete firm
    delete: async (id) => {
        return toast.promise(apiClient.delete(`/casefirm/${id}`).then(res => res.data), {
            loading: 'Deleting firm...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete firm',
        });
    },
};

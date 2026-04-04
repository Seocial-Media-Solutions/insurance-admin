import toast from 'react-hot-toast';
import apiClient from './apiClient';

export const fieldExecutiveService = {
    // Get all field executives
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        return toast.promise(apiClient.get('/field-executives', { params: { page, limit } }).then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to fetch executives');
            return res.data;
        }), {
            loading: 'Fetching executives...',
            success: (data) => data.message || 'Executives loaded',
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch executives',
        });
    },

    // Get single field executive
    getById: async (id) => {
        return toast.promise(apiClient.get(`/field-executives/${id}`).then(res => res.data), {
            loading: 'Fetching executive details...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch executive',
        });
    },

    // Create field executive
    create: async (executiveData) => {
        return toast.promise(apiClient.post('/field-executives', executiveData).then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to create executive');
            return res.data;
        }), {
            loading: 'Creating executive...',
            success: (data) => data.message || 'Executive created successfully',
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to create executive',
        });
    },

    // Update field executive
    update: async ({ id, executiveData }) => {
        return toast.promise(apiClient.put(`/field-executives/${id}`, executiveData).then(res => res.data), {
            loading: 'Updating executive...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to update executive',
        });
    },

    // Delete field executive
    delete: async (id) => {
        return toast.promise(apiClient.delete(`/field-executives/${id}`).then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to delete executive');
            return res.data;
        }), {
            loading: 'Deleting executive...',
            success: (data) => data.message || 'Executive deleted successfully',
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete executive',
        });
    },

    // Login
    login: async (credentials) => {
        return toast.promise(apiClient.post('/field-executives/login', credentials).then(res => res.data), {
            loading: 'Logging in...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Login failed',
        });
    },
};

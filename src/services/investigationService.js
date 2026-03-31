import toast from 'react-hot-toast';
import apiClient from './apiClient';

export const investigationService = {
    // Get paginated investigations or all
    getAll: async (params = {}) => {
        return toast.promise(apiClient.get('/investigations', { params }).then(res => res.data), {
            loading: 'Fetching investigations...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch investigations',
        });
    },

    // Delete investigation
    delete: async (id) => {
        return toast.promise(apiClient.delete(`/investigations/${id}`).then(res => res.data), {
            loading: 'Deleting investigation...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete investigation',
        });
    },
};

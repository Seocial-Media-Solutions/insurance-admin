import toast from 'react-hot-toast';
import apiClient from './apiClient';

export const theftCaseService = {
    // Get single theft case
    getById: async (caseId) => {
        return toast.promise(apiClient.get(`/theft-cases/${caseId}`).then(res => res.data), {
            loading: 'Fetching theft case details...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch theft case',
        });
    },

    // Get paginated theft cases
    getAll: async ({ page = 1, limit = 20 } = {}) => {
        return toast.promise(apiClient.get('/theft-cases', { params: { page, limit } }).then(res => res.data), {
            loading: 'Fetching theft cases...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch theft cases',
        });
    },

    // Update specific section
    updateSection: async ({ caseId, sectionPath, formData }) => {
        return toast.promise(
            apiClient.patch(
                `/theft-cases/${caseId}/${sectionPath}`,
                formData,
                {
                    headers: {
                        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
                    },
                }
            ).then(res => res.data),
            {
                loading: 'Saving section...',
                success: false,
                error: (err) => err?.response?.data?.message || err?.message || 'Failed to update section',
            }
        );
    },

    // Delete image from section
    deleteImage: async ({ caseId, sectionPath, fieldName, publicId }) => {
        return toast.promise(
            apiClient.delete(
                `/theft-cases/${caseId}/${sectionPath}/images`,
                {
                    data: { fieldName, publicId }
                }
            ).then(res => res.data),
            {
                loading: 'Deleting image...',
                success: false,
                error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete image',
            }
        );
    },

    // Delete theft case
    delete: async (caseId) => {
        return toast.promise(apiClient.delete(`/theft-cases/${caseId}`).then(res => res.data), {
            loading: 'Deleting theft case...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete theft case',
        });
    },
};

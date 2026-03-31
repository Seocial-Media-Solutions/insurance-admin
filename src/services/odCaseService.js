import toast from 'react-hot-toast';
import apiClient from './apiClient';

export const odCaseService = {
    // Get single OD case
    getById: async (caseId) => {
        return toast.promise(apiClient.get(`/od-cases/${caseId}`).then(res => res.data), {
            loading: 'Fetching OD case details...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch OD case',
        });
    },

    // Get paginated OD cases
    getAll: async ({ page = 1, limit = 20 } = {}) => {
        return toast.promise(apiClient.get('/od-cases', { params: { page, limit } }).then(res => res.data), {
            loading: 'Fetching OD cases...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch OD cases',
        });
    },

    // Update specific section
    updateSection: async ({ caseId, sectionPath, formData }) => {
        return toast.promise(
            apiClient.patch(
                `/od-cases/${caseId}/${sectionPath}`,
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
                `/od-cases/${caseId}/${sectionPath}/images`,
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

    // Delete OD case
    delete: async (caseId) => {
        return toast.promise(apiClient.delete(`/od-cases/${caseId}`).then(res => res.data), {
            loading: 'Deleting OD case...',
            success: false,
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete OD case',
        });
    },
};

import toast from 'react-hot-toast';
import apiClient from './apiClient';

export const odCaseService = {
    // Get single OD case
    getById: async (caseId) => {
        return toast.promise(apiClient.get(`/od-cases/${caseId}`).then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to fetch OD case');
            return res.data;
        }), {
            loading: 'Fetching OD case details...',
            success: (data) => data.message || 'OD case details loaded',
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to fetch OD case',
        });
    },

    // Get paginated OD cases
    getAll: async ({ page = 1, limit = 20 } = {}) => {
        return toast.promise(apiClient.get('/od-cases', { params: { page, limit } }).then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to fetch OD cases');
            return res.data;
        }), {
            loading: 'Fetching OD cases...',
            success: (data) => data.message || 'OD cases loaded',
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
            ).then(res => {
                if (res.data.success === false) throw new Error(res.data.message || 'Failed to update section');
                return res.data;
            }),
            {
                loading: 'Saving section...',
                success: (data) => data.message || 'Section updated successfully',
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
            ).then(res => {
                if (res.data.success === false) throw new Error(res.data.message || 'Failed to delete image');
                return res.data;
            }),
            {
                loading: 'Deleting image...',
                success: (data) => data.message || 'Image deleted successfully',
                error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete image',
            }
        );
    },

    // Delete OD case
    delete: async (caseId) => {
        return toast.promise(apiClient.delete(`/od-cases/${caseId}`).then(res => {
            if (res.data.success === false) throw new Error(res.data.message || 'Failed to delete OD Case');
            return res.data;
        }), {
            loading: 'Deleting OD case...',
            success: (data) => data.message || 'OD Case deleted successfully',
            error: (err) => err?.response?.data?.message || err?.message || 'Failed to delete OD case',
        });
    },
};

import apiClient from './apiClient';

export const odCaseService = {
    // Get single OD case
    getById: async (caseId) => {
        const { data } = await apiClient.get(`/od-cases/${caseId}`);
        return data;
    },

    // Get paginated OD cases
    getAll: async ({ page = 1, limit = 20 } = {}) => {
        const { data } = await apiClient.get('/od-cases', {
            params: { page, limit },
        });
        return data;
    },

    // Update specific section
    updateSection: async ({ caseId, sectionPath, formData }) => {
        const { data } = await apiClient.patch(
            `/od-cases/${caseId}/${sectionPath}`,
            formData,
            {
                headers: {
                    'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
                },
            }
        );
        return data;
    },

    // Delete image from section
    deleteImage: async ({ caseId, sectionPath, fieldName, publicId }) => {
        const { data } = await apiClient.delete(
            `/od-cases/${caseId}/${sectionPath}/images`,
            {
                data: { fieldName, publicId }
            }
        );
        return data;
    },

    // Delete OD case
    delete: async (caseId) => {
        const { data } = await apiClient.delete(`/od-cases/${caseId}`);
        return data;
    },
};

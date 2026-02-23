import apiClient from './apiClient';

export const theftCaseService = {
    // Get single theft case
    getById: async (caseId) => {
        const { data } = await apiClient.get(`/theft-cases/${caseId}`);
        return data;
    },

    // Get paginated theft cases
    getAll: async ({ page = 1, limit = 20 } = {}) => {
        const { data } = await apiClient.get('/theft-cases', {
            params: { page, limit },
        });
        return data;
    },

    // Update specific section
    updateSection: async ({ caseId, sectionPath, formData }) => {
        const { data } = await apiClient.patch(
            `/theft-cases/${caseId}/${sectionPath}`,
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
            `/theft-cases/${caseId}/${sectionPath}/images`,
            {
                data: { fieldName, publicId }
            }
        );
        return data;
    },

    // Delete theft case
    delete: async (caseId) => {
        const { data } = await apiClient.delete(`/theft-cases/${caseId}`);
        return data;
    },
};

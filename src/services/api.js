import apiClient from './apiClient';

// ============================================
// OD CASES API
// ============================================

export const odCaseApi = {
    // Get single OD case
    getById: async (caseId) => {
        const { data } = await apiClient.get(`/od-cases/${caseId}`);
        return data;
    },

    // Get paginated OD cases
    getAll: async ({ page = 1, limit = 10 } = {}) => {
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

// ============================================
// THEFT CASES API
// ============================================

export const theftCaseApi = {
    // Get single theft case
    getById: async (caseId) => {
        const { data } = await apiClient.get(`/theft-cases/${caseId}`);
        return data;
    },

    // Get paginated theft cases
    getAll: async ({ page = 1, limit = 10 } = {}) => {
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

// ============================================
// FIELD EXECUTIVES API
// ============================================

export const fieldExecutiveApi = {
    // Get all field executives
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        const { data } = await apiClient.get('/field-executives', { params: { page, limit } });
        return data;
    },

    // Get single field executive
    getById: async (id) => {
        const { data } = await apiClient.get(`/field-executives/${id}`);
        return data;
    },

    // Create field executive
    create: async (executiveData) => {
        const { data } = await apiClient.post('/field-executives', executiveData);
        return data;
    },

    // Update field executive
    update: async ({ id, executiveData }) => {
        const { data } = await apiClient.put(`/field-executives/${id}`, executiveData);
        return data;
    },

    // Delete field executive
    delete: async (id) => {
        const { data } = await apiClient.delete(`/field-executives/${id}`);
        return data;
    },

    // Login
    login: async (credentials) => {
        const { data } = await apiClient.post('/field-executives/login', credentials);
        return data;
    },
};

// ============================================
// CASE ASSIGNMENTS API
// ============================================

export const caseAssignmentApi = {
    // Get all assignments
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        const { data } = await apiClient.get('/case-assignments', { params: { page, limit } });
        return data;
    },

    // Get single assignment
    getById: async (id) => {
        const { data } = await apiClient.get(`/case-assignments/${id}`);
        return data;
    },

    // Create assignment
    create: async (assignmentData) => {
        const { data } = await apiClient.post('/case-assignments', assignmentData);
        return data;
    },

    // Update assignment
    update: async ({ id, assignmentData }) => {
        const { data } = await apiClient.put(`/case-assignments/${id}`, assignmentData);
        return data;
    },

    // Delete assignment
    delete: async (id) => {
        const { data } = await apiClient.delete(`/case-assignments/${id}`);
        return data;
    },
};

// ============================================
// CASES API (General)
// ============================================

export const caseApi = {
    // Get all cases
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        const { data } = await apiClient.get('/cases', { params: { page, limit } });
        return data;
    },

    // Get single case
    getById: async (id) => {
        const { data } = await apiClient.get(`/cases/${id}`);
        return data;
    },

    // Create case
    create: async (caseData) => {
        const { data } = await apiClient.post('/cases', caseData);
        return data;
    },

    // Update case
    update: async ({ id, caseData }) => {
        const { data } = await apiClient.put(`/cases/${id}`, caseData);
        return data;
    },

    // Delete case
    delete: async (id) => {
        const { data } = await apiClient.delete(`/cases/${id}`);
        return data;
    },
};

// ============================================
// CASE FIRMS API
// ============================================

export const caseFirmApi = {
    // Get all firms
    getAll: async ({ page = 1, limit = 10 } = {}) => {
        const { data } = await apiClient.get('/casefirm', { params: { page, limit } });
        return data;
    },

    // Get single firm
    getById: async (id) => {
        const { data } = await apiClient.get(`/casefirm/${id}`);
        return data;
    },

    // Create firm
    create: async (firmData) => {
        const { data } = await apiClient.post('/casefirm', firmData);
        return data;
    },

    // Update firm
    update: async ({ id, firmData }) => {
        const { data } = await apiClient.put(`/casefirm/${id}`, firmData);
        return data;
    },

    // Delete firm
    delete: async (id) => {
        const { data } = await apiClient.delete(`/casefirm/${id}`);
        return data;
    },
};

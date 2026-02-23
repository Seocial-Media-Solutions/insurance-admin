import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odCaseApi } from '../services/api';
import { toast } from 'react-hot-toast';

// ============================================
// QUERY KEYS
// ============================================
export const odCaseKeys = {
    all: ['od-cases'],
    lists: () => [...odCaseKeys.all, 'list'],
    list: (filters) => [...odCaseKeys.lists(), filters],
    details: () => [...odCaseKeys.all, 'detail'],
    detail: (id) => [...odCaseKeys.details(), id],
};

// ============================================
// QUERIES
// ============================================

// Get single OD case
export const useODCase = (caseId, options = {}) => {
    return useQuery({
        queryKey: odCaseKeys.detail(caseId),
        queryFn: () => odCaseApi.getById(caseId),
        enabled: !!caseId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};

// Get all OD cases (paginated)
export const useODCases = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: odCaseKeys.list(filters),
        queryFn: () => odCaseApi.getAll(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};

// ============================================
// MUTATIONS
// ============================================

// Update OD case section
export const useUpdateODCaseSection = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: odCaseApi.updateSection,
        onSuccess: (data, variables) => {
            // Invalidate and refetch the specific case
            queryClient.invalidateQueries({
                queryKey: odCaseKeys.detail(variables.caseId),
            });

            // Invalidate the list
            queryClient.invalidateQueries({
                queryKey: odCaseKeys.lists(),
            });

            toast.success(data.message || 'Section updated successfully');
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || 'Failed to update section';
            toast.error(message);
        },
        ...options,
    });
};

// Delete OD case
export const useDeleteODCase = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: odCaseApi.delete,
        onSuccess: (data, caseId) => {
            // Remove from cache
            queryClient.removeQueries({
                queryKey: odCaseKeys.detail(caseId),
            });

            // Invalidate lists
            queryClient.invalidateQueries({
                queryKey: odCaseKeys.lists(),
            });

            toast.success('Case deleted successfully');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to delete case';
            toast.error(message);
        },
        ...options,
    });
};

// Delete image from OD case
export const useDeleteODCaseImage = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: odCaseApi.deleteImage,
        onSuccess: (data, variables) => {
            // Invalidate and refetch the specific case
            queryClient.invalidateQueries({
                queryKey: odCaseKeys.detail(variables.caseId),
            });

            toast.success(data.message || 'Image deleted successfully');
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete image';
            toast.error(message);
        },
        ...options,
    });
};


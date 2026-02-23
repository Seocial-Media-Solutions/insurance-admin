import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theftCaseApi } from '../services/api';
import { toast } from 'react-hot-toast';

// ============================================
// QUERY KEYS
// ============================================
export const theftCaseKeys = {
    all: ['theft-cases'],
    lists: () => [...theftCaseKeys.all, 'list'],
    list: (filters) => [...theftCaseKeys.lists(), filters],
    details: () => [...theftCaseKeys.all, 'detail'],
    detail: (id) => [...theftCaseKeys.details(), id],
};

// ============================================
// QUERIES
// ============================================

// Get single theft case
export const useTheftCase = (caseId, options = {}) => {
    return useQuery({
        queryKey: theftCaseKeys.detail(caseId),
        queryFn: () => theftCaseApi.getById(caseId),
        enabled: !!caseId,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

// Get all theft cases (paginated)
export const useTheftCases = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: theftCaseKeys.list(filters),
        queryFn: () => theftCaseApi.getAll(filters),
        staleTime: 2 * 60 * 1000,
        ...options,
    });
};

// ============================================
// MUTATIONS
// ============================================

// Update theft case section
export const useUpdateTheftCaseSection = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: theftCaseApi.updateSection,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: theftCaseKeys.detail(variables.caseId),
            });

            queryClient.invalidateQueries({
                queryKey: theftCaseKeys.lists(),
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

// Delete theft case image
export const useDeleteTheftCaseImage = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: theftCaseApi.deleteImage,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: theftCaseKeys.detail(variables.caseId),
            });
            toast.success(data.message || 'Image deleted successfully');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to delete image';
            toast.error(message);
        },
        ...options,
    });
};

// Delete theft case
export const useDeleteTheftCase = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: theftCaseApi.delete,
        onSuccess: (data, caseId) => {
            queryClient.removeQueries({
                queryKey: theftCaseKeys.detail(caseId),
            });

            queryClient.invalidateQueries({
                queryKey: theftCaseKeys.lists(),
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

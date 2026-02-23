import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldExecutiveApi } from '../services/api';
import { toast } from 'react-hot-toast';

// ============================================
// QUERY KEYS
// ============================================
export const fieldExecutiveKeys = {
    all: ['field-executives'],
    lists: () => [...fieldExecutiveKeys.all, 'list'],
    list: (filters) => [...fieldExecutiveKeys.lists(), filters],
    details: () => [...fieldExecutiveKeys.all, 'detail'],
    detail: (id) => [...fieldExecutiveKeys.details(), id],
};

// ============================================
// QUERIES
// ============================================

// Get all field executives
export const useFieldExecutives = (options = {}) => {
    return useQuery({
        queryKey: fieldExecutiveKeys.lists(),
        queryFn: () => fieldExecutiveApi.getAll(),
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

// Get single field executive
export const useFieldExecutive = (id, options = {}) => {
    return useQuery({
        queryKey: fieldExecutiveKeys.detail(id),
        queryFn: () => fieldExecutiveApi.getById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

// ============================================
// MUTATIONS
// ============================================

// Create field executive
export const useCreateFieldExecutive = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: fieldExecutiveApi.create,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: fieldExecutiveKeys.lists(),
            });

            toast.success(data.message || 'Field Executive created successfully');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to create field executive';
            toast.error(message);
        },
        ...options,
    });
};

// Update field executive
export const useUpdateFieldExecutive = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: fieldExecutiveApi.update,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: fieldExecutiveKeys.detail(variables.id),
            });

            queryClient.invalidateQueries({
                queryKey: fieldExecutiveKeys.lists(),
            });

            toast.success(data.message || 'Field Executive updated successfully');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to update field executive';
            toast.error(message);
        },
        ...options,
    });
};

// Delete field executive
export const useDeleteFieldExecutive = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: fieldExecutiveApi.delete,
        onSuccess: (data, id) => {
            queryClient.removeQueries({
                queryKey: fieldExecutiveKeys.detail(id),
            });

            queryClient.invalidateQueries({
                queryKey: fieldExecutiveKeys.lists(),
            });

            toast.success('Field Executive deleted successfully');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Failed to delete field executive';
            toast.error(message);
        },
        ...options,
    });
};

// Login
export const useFieldExecutiveLogin = (options = {}) => {
    return useMutation({
        mutationFn: fieldExecutiveApi.login,
        onSuccess: (data) => {
            if (data.success && data.data) {
                // Store auth token if provided
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                toast.success('Login successful');
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
        },
        ...options,
    });
};

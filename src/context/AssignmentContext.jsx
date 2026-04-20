import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { assignmentService } from '../services/assignmentService';

const AssignmentContext = createContext();

export function AssignmentProvider({ children }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const [search, setSearch] = useState("");
    const limit = 50;

    const loadAssignments = useCallback(async (page = currentPage, currentSearch = search, force = false) => {
        // Skip if already loaded with same parameters unless forced
        if (initialized && page === currentPage && currentSearch === search && !force) {
            return;
        }

        setLoading(true);
        try {
            const resp = await assignmentService.getAll({ 
                page, 
                limit, 
                search: currentSearch 
            });
            setAssignments(resp.data || []);
            setTotalPages(resp.totalPages || 1);
            setTotal(resp.total || 0);
            setCurrentPage(resp.currentPage || page);
            setSearch(currentSearch);
        } catch (err) {
            console.error("Error loading assignments:", err);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [currentPage, search, initialized]);

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            loadAssignments(page);
        }
    }, [loadAssignments, totalPages]);

    const addAssignment = useCallback(async (data) => {
        try {
            await assignmentService.create(data);
            await loadAssignments(1, search, true);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [loadAssignments, search]);

    const updateAssignment = useCallback(async (id, data) => {
        try {
            await assignmentService.update({ id, assignmentData: data });
            await loadAssignments(currentPage, search, true);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [loadAssignments, currentPage, search]);

    const deleteAssignment = useCallback(async (id) => {
        try {
            await assignmentService.delete(id);
            await loadAssignments(currentPage, search, true);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [loadAssignments, currentPage, search]);

    const getAssignmentsByCaseId = useCallback(async (caseId) => {
        try {
            const resp = await assignmentService.getByCaseId(caseId);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch assignments for case");
            return [];
        }
    }, []);

    const getAssignmentById = useCallback(async (id) => {
        try {
            const resp = await assignmentService.getById(id);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch assignment details");
            return null;
        }
    }, []);

    // Initial fetch guard
    const initRef = useRef(false);
    useEffect(() => {
        if (!initRef.current) {
            initRef.current = true;
            loadAssignments(1);
        }
    }, [loadAssignments]);

    const value = useMemo(() => ({
        assignments,
        loading,
        currentPage,
        totalPages,
        total,
        limit,
        loadAssignments,
        goToPage,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        getAssignmentsByCaseId,
        getAssignmentById,
        initialized
    }), [
        assignments, loading, currentPage, totalPages, total, limit,
        loadAssignments, goToPage, addAssignment, updateAssignment, deleteAssignment,
        getAssignmentsByCaseId, getAssignmentById, initialized
    ]);

    return (
        <AssignmentContext.Provider value={value}>
            {children}
        </AssignmentContext.Provider>
    );
}

export function useAssignments() {
    const context = useContext(AssignmentContext);
    if (!context) {
        throw new Error('useAssignments must be used within an AssignmentProvider');
    }
    return context;
}

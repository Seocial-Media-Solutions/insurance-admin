import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { caseService } from '../services/caseService';

const CaseContext = createContext();

export function CaseProvider({ children }) {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const [dashboardStats, setDashboardStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        rejected: 0,
        caseFirms: 0,
        fieldExecutives: 0,
        assignments: 0,
        odCases: 0,
        theftCases: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const limit = 10;

    const loadStats = useCallback(async (force = false) => {
        if (dashboardStats.total > 0 && !force) return;
        setStatsLoading(true);
        try {
            const resp = await caseService.getStats();
            if (resp && resp.success) {
                setDashboardStats(resp.data);
            }
        } catch (err) {
            console.error("Error loading stats:", err);
        } finally {
            setStatsLoading(false);
        }
    }, [dashboardStats.total]);

    const loadCases = useCallback(async (page = currentPage) => {
        setLoading(true);
        try {
            const resp = await caseService.getAll({ page, limit });
            setCases(resp.data || []);
            setTotalPages(resp.totalPages || 1);
            setTotal(resp.total || 0);
            setCurrentPage(resp.currentPage || page);
        } catch (err) {
            console.error("Error loading cases:", err);
            toast.error("Failed to load cases");
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [currentPage]);

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            loadCases(page);
        }
    }, [loadCases, totalPages]);

    const addNewCase = useCallback(async (formData) => {
        try {
            await caseService.create(formData);
            toast.success("Case added successfully");
            loadCases(1);
            loadStats(true); // Refresh stats
        } catch (err) {
            console.error(err);
            toast.error("Failed to add case");
        }
    }, [loadCases, loadStats]);

    const updateExistingCase = useCallback(async (id, formData) => {
        try {
            await caseService.update({ id, caseData: formData });
            toast.success("Case updated successfully");
            loadCases();
            loadStats(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update case");
        }
    }, [loadCases, loadStats]);

    const removeCase = useCallback(async (id) => {
        try {
            await caseService.delete(id);
            toast.success("Case deleted successfully");
            loadCases();
            loadStats(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete case");
        }
    }, [loadCases, loadStats]);

    const getCaseById = useCallback(async (id) => {
        try {
            const resp = await caseService.getById(id);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to get case details");
            return null;
        }
    }, []);

    // Initial fetch guard
    const initRef = useRef(false);
    useEffect(() => {
        if (!initRef.current) {
            initRef.current = true;
            loadCases(1);
            loadStats();
        }
    }, [loadCases, loadStats]);

    const value = useMemo(() => ({
        cases,
        loading,
        currentPage,
        totalPages,
        total,
        limit,
        loadCases,
        goToPage,
        addNewCase,
        updateExistingCase,
        removeCase,
        getCaseById,
        initialized,
        dashboardStats,
        statsLoading,
        loadStats
    }), [
        cases, loading, currentPage, totalPages, total, initialized,
        dashboardStats, statsLoading, loadCases, goToPage, addNewCase,
        updateExistingCase, removeCase, getCaseById, loadStats
    ]);

    return (
        <CaseContext.Provider value={value}>
            {children}
        </CaseContext.Provider>
    );
}

export function useCases() {
    const context = useContext(CaseContext);
    if (!context) {
        throw new Error('useCases must be used within a CaseProvider');
    }
    return context;
}

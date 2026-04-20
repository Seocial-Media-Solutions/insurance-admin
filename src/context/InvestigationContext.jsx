import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { investigationService } from '../services/investigationService';

const InvestigationContext = createContext();

export function InvestigationProvider({ children }) {
    const [investigations, setInvestigations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const limit = 15;

    const loadInvestigations = useCallback(async (page = currentPage, force = false) => {
        if (initialized && page === currentPage && !force) return;

        setLoading(true);
        try {
            const resp = await investigationService.getAll({ page, limit });
            setInvestigations(resp.data || []);
            setTotalPages(resp.totalPages || 1);
            setTotal(resp.total || 0);
            setCurrentPage(resp.currentPage || page);
        } catch (err) {
            console.error("Error loading investigations:", err);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [currentPage, initialized]);

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            loadInvestigations(page);
        }
    }, [loadInvestigations, totalPages]);

    const deleteInvestigation = useCallback(async (id) => {
        try {
            await investigationService.delete(id);
            await loadInvestigations(currentPage, true);
        } catch (err) {
            console.error(err);
        }
    }, [loadInvestigations, currentPage]);

    // Initial fetch guard
    const initRef = useRef(false);
    useEffect(() => {
        if (!initRef.current) {
            initRef.current = true;
            loadInvestigations(1);
        }
    }, [loadInvestigations]);

    const value = useMemo(() => ({
        investigations,
        loading,
        currentPage,
        totalPages,
        total,
        limit,
        loadInvestigations,
        goToPage,
        deleteInvestigation,
        initialized
    }), [
        investigations, loading, currentPage, totalPages, total, 
        loadInvestigations, goToPage, deleteInvestigation, initialized
    ]);

    return (
        <InvestigationContext.Provider value={value}>
            {children}
        </InvestigationContext.Provider>
    );
}

export function useInvestigations() {
    const context = useContext(InvestigationContext);
    if (!context) {
        throw new Error('useInvestigations must be used within an InvestigationProvider');
    }
    return context;
}

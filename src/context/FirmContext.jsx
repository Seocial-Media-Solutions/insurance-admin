import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { firmService } from '../services/firmService';

const FirmContext = createContext();

export function FirmProvider({ children }) {
    const [firms, setFirms] = useState([]);
    const [allFirms, setAllFirms] = useState([]); // Cache for all firms (no pagination)
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Fetch firms list (paginated)
    const loadFirms = useCallback(async (page = currentPage) => {
        setLoading(true);
        try {
            const resp = await firmService.getAll({ page, limit });
            setFirms(resp.data || []);
            setTotalPages(resp.totalPages || 1);
            setTotal(resp.total || 0);
            setCurrentPage(resp.currentPage || page);

            // Also fetch a "Lookup" version for all IDs if the list is small or just use the current data to build the cache
            setAllFirms(prev => {
                const newAll = [...prev];
                (resp.data || []).forEach(f => {
                    if (!newAll.some(ef => ef._id === f._id)) newAll.push(f);
                });
                return newAll;
            });
        } catch (err) {
            console.error("Error loading firms:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit]);

    // Initial load for all firms to enable instant lookups
    const fetchAllFirms = useCallback(async () => {
        try {
            const resp = await firmService.getAll({ limit: 1000 }); // Large limit for full cache
            setAllFirms(resp.data || []);
        } catch (err) {
            console.error("Error fetching all firms for cache:", err);
        }
    }, []);

    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            loadFirms(page);
        }
    }, [loadFirms, totalPages]);

    const addFirm = useCallback(async (data) => {
        try {
            await firmService.create(data);
            toast.success("Firm created successfully");
            loadFirms(1);
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to create firm");
            return false;
        }
    }, [loadFirms]);

    const updateFirm = useCallback(async (id, data) => {
        try {
            await firmService.update({ id, firmData: data });
            toast.success("Firm updated successfully");
            loadFirms();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to update firm");
            return false;
        }
    }, [loadFirms]);

    const deleteFirm = useCallback(async (id) => {
        try {
            await firmService.delete(id);
            toast.success("Firm deleted successfully");
            loadFirms();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete firm");
            return false;
        }
    }, [loadFirms]);

    const getFirmById = useCallback(async (id) => {
        if (!id) return null;
        
        // 1. try from existing firms
        const existingFirm = firms.find(firm => firm._id === id);
        if (existingFirm) return existingFirm;

        // 2. fetch only if not found
        try {
            const resp = await firmService.getById(id);
            const firm = resp.data || null;

            // Cache it in firms list
            if (firm) {
                setFirms(prev => {
                    const exists = prev.some(f => f._id === firm._id);
                    return exists ? prev : [...prev, firm];
                });
            }
            return firm;
        } catch (err) {
            console.error("Error loading firm:", err);
            return null;
        }
    }, [firms]);

    // Fast sync lookup
    const getFirmSync = useCallback((id) => {
        if (!id) return null;
        return allFirms.find(firm => firm._id === id) || null;
    }, [allFirms]);

    const getFirmCode = useCallback((id) => {
        if (!id) return "--";
        const firm = allFirms.find(f => f._id === id);
        return firm ? firm.code : "--";
    }, [allFirms]);

    useEffect(() => {
        fetchAllFirms();
        loadFirms(1);
    }, [fetchAllFirms]);

    const value = useMemo(() => ({
        firms,
        loading,
        currentPage,
        totalPages,
        total,
        limit,
        loadFirms,
        goToPage,
        addFirm,
        updateFirm,
        deleteFirm,
        getFirmById,
        getFirmSync,
        getFirmCode,
        allFirms
    }), [
        firms, allFirms, loading, currentPage, totalPages, total, limit, 
        loadFirms, goToPage, addFirm, updateFirm, deleteFirm, getFirmById, getFirmSync, getFirmCode
    ]);

    return (
        <FirmContext.Provider value={value}>
            {children}
        </FirmContext.Provider>
    );
}

export function useFirms() {
    const context = useContext(FirmContext);
    if (!context) {
        throw new Error('useFirms must be used within a FirmProvider');
    }
    return context;
}

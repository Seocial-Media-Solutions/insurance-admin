import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { firmService } from '../services/firmService';

const FirmContext = createContext();

export function FirmProvider({ children }) {
    const [firms, setFirms] = useState([]);
    const [allFirms, setAllFirms] = useState([]); // Cache for all firms (no pagination)
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const [currentSearch, setCurrentSearch] = useState("");
    const limit = 10;

    // Use refs to track current data for stability
    const stateRef = useRef({ currentPage: 1, currentSearch: "", initialized: false });

    useEffect(() => {
      stateRef.current = { currentPage, currentSearch, initialized };
    }, [currentPage, currentSearch, initialized]);

    // Fetch firms list (paginated)
    const loadFirms = useCallback(async (page, search = "", force = false) => {
        const targetPage = page || 1;
        const targetSearch = search || "";
        const { currentPage: cp, currentSearch: cs, initialized: init } = stateRef.current;

        // Skip if already loaded (and not forced) and not currently loading
        if (!force && init && targetPage === cp && targetSearch === cs) {
          return;
        }

        setLoading(true);
        const requestId = Date.now();
        stateRef.current.lastRequestId = requestId;

        try {
            const resp = await firmService.getAll({ page: targetPage, limit, search: targetSearch });
            
            // Only update state if this is the most recent request
            if (stateRef.current.lastRequestId === requestId) {
                setFirms(resp.data || []);
                setTotalPages(resp.totalPages || 1);
                setTotal(resp.total || 0);
                setCurrentPage(resp.currentPage || targetPage);
                setCurrentSearch(targetSearch);

                // Update cache
                setAllFirms(prev => {
                    const newAll = [...prev];
                    (resp.data || []).forEach(f => {
                        if (!newAll.some(ef => ef._id === f._id)) newAll.push(f);
                    });
                    return newAll;
                });
                setInitialized(true);
            }
        } catch (err) {
            console.error("Error loading firms:", err);
        } finally {
            if (stateRef.current.lastRequestId === requestId) {
                setLoading(false);
            }
        }
    }, [limit]);

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
            const resp = await firmService.create(data);
            toast.success("Firm created successfully");
            // If we're on page 1, we could prepend, but reloading is safer for new items to ensure correct order
            // However, the user wants "one time", so let's try local prepend if we are on page 1
            if (stateRef.current.currentPage === 1) {
                const newFirm = resp.data || resp;
                setFirms(prev => [newFirm, ...prev.slice(0, limit - 1)]);
                setTotal(t => t + 1);
            } else {
                // If not on page 1, we still need to reload or just skip local update and let user navigate
                loadFirms(1, stateRef.current.currentSearch, true);
            }
            // Always update cache
            setAllFirms(prev => [resp.data || resp, ...prev]);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [loadFirms, limit]);

    const updateFirm = useCallback(async (id, data) => {
        try {
            const resp = await firmService.update({ id, firmData: data });
            const updatedFirm = resp.data || resp;
            
            toast.success("Firm updated successfully");
            
            // LOCAL STATE UPDATE (Avoid extra API hit)
            setFirms(prev => prev.map(f => f._id === id ? { ...f, ...updatedFirm } : f));
            setAllFirms(prev => prev.map(f => f._id === id ? { ...f, ...updatedFirm } : f));
            
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, []);

    const deleteFirm = useCallback(async (id) => {
        try {
            await firmService.delete(id);
            toast.success("Firm deleted successfully");
            
            // LOCAL STATE UPDATE
            setFirms(prev => prev.filter(f => f._id !== id));
            setAllFirms(prev => prev.filter(f => f._id !== id));
            setTotal(t => Math.max(0, t - 1));

            // If page is now empty and not page 1, go back
            if (firms.length <= 1 && stateRef.current.currentPage > 1) {
                loadFirms(stateRef.current.currentPage - 1, stateRef.current.currentSearch, true);
            }
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [firms.length, loadFirms]);

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

    // Use a ref for strict initialization control (prevents race conditions)
    const initRef = useRef(false);

    useEffect(() => {
        if (!initRef.current) {
            initRef.current = true;
            // Removed redundant loadFirms(1) - Page components will trigger this
            fetchAllFirms();
        }
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
        allFirms,
        fetchAllFirms,
        initialized
    }), [
        firms, allFirms, loading, currentPage, totalPages, total, limit, 
        loadFirms, goToPage, addFirm, updateFirm, deleteFirm, getFirmById, getFirmSync, getFirmCode, fetchAllFirms, initialized
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

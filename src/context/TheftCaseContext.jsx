import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { theftCaseService } from '../services/theftCaseService';

const TheftCaseContext = createContext();

export function TheftCaseProvider({ children }) {
    const [theftCases, setTheftCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const loadTheftCases = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await theftCaseService.getAll();
            setTheftCases(resp.data || []);
        } catch (err) {
            console.error("Error loading Theft cases:", err);
            toast.error("Failed to load Theft cases");
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, []);

    const deleteTheftCase = useCallback(async (id) => {
        try {
            await theftCaseService.delete(id);
            toast.success("Theft Case deleted successfully");
            loadTheftCases();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete Theft case");
        }
    }, [loadTheftCases]);

    const getTheftCaseById = useCallback(async (id) => {
        try {
            const resp = await theftCaseService.getById(id);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to get Theft case details");
            return null;
        }
    }, []);

    // Initial fetch guard
    const initRef = useRef(false);
    useEffect(() => {
        if (!initRef.current) {
            initRef.current = true;
            loadTheftCases();
        }
    }, [loadTheftCases]);

    const value = useMemo(() => ({
        theftCases,
        loading,
        loadTheftCases,
        deleteTheftCase,
        getTheftCaseById,
        initialized
    }), [theftCases, loading, loadTheftCases, deleteTheftCase, getTheftCaseById, initialized]);

    return (
        <TheftCaseContext.Provider value={value}>
            {children}
        </TheftCaseContext.Provider>
    );
}

export function useTheftCases() {
    const context = useContext(TheftCaseContext);
    if (!context) {
        throw new Error('useTheftCases must be used within a TheftCaseProvider');
    }
    return context;
}

import { createContext, useContext, useState, useEffect } from 'react';
import { fieldExecutiveService } from '../services/fieldExecutiveService';

const FieldExecutiveContext = createContext();

export function FieldExecutiveProvider({ children }) {
    const [executives, setExecutives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const [search, setSearch] = useState("");
    const limit = 50;

    const loadExecutives = async (page = currentPage, currentSearch = search, force = false) => {
        // Skip if already loaded with same parameters unless forced
        if (initialized && page === currentPage && currentSearch === search && !force) {
            return;
        }

        setLoading(true);
        try {
            const resp = await fieldExecutiveService.getAll({ 
              page, 
              limit, 
              search: currentSearch 
            });
            setExecutives(resp.data || []);
            setTotalPages(resp.totalPages || 1);
            setTotal(resp.total || 0);
            setCurrentPage(resp.currentPage || page);
            setSearch(currentSearch);
        } catch (err) {
            console.error("Error loading Field Executives:", err);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            loadExecutives(page);
        }
    };

    const addExecutive = async (data) => {
        try {
            await fieldExecutiveService.create(data);
            await loadExecutives(1, search, true);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const updateExecutive = async (id, data) => {
        try {
            await fieldExecutiveService.update({ id, executiveData: data });
            await loadExecutives(currentPage, search, true);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteExecutive = async (id) => {
        try {
            await fieldExecutiveService.delete(id);
            await loadExecutives(currentPage, search, true);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        // Initial load removed to avoid bulk fetches. 
        // Handles lazily by hook now.
    }, []);

    const value = {
        executives,
        loading,
        currentPage,
        totalPages,
        total,
        limit,
        loadExecutives,
        goToPage,
        addExecutive,
        updateExecutive,
        deleteExecutive,
        initialized
    };

    return (
        <FieldExecutiveContext.Provider value={value}>
            {children}
        </FieldExecutiveContext.Provider>
    );
}

export function useFieldExecutives() {
    const context = useContext(FieldExecutiveContext);
    if (!context) {
        throw new Error('useFieldExecutives must be used within a FieldExecutiveProvider');
    }

    // Lazy load when hook is used
    useEffect(() => {
        if (!context.initialized && !context.loading) {
            context.loadExecutives(1);
        }
    }, [context]);

    return context;
}

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fieldExecutiveService } from '../services/fieldExecutiveService';

const FieldExecutiveContext = createContext();

export function FieldExecutiveProvider({ children }) {
    const [executives, setExecutives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const loadExecutives = async (page = currentPage) => {
        setLoading(true);
        try {
            const resp = await fieldExecutiveService.getAll({ page, limit });
            setExecutives(resp.data || []);
            setTotalPages(resp.totalPages || 1);
            setTotal(resp.total || 0);
            setCurrentPage(resp.currentPage || page);
        } catch (err) {
            console.error("Error loading Field Executives:", err);
            toast.error("Failed to load Field Executives");
        } finally {
            setLoading(false);
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
            toast.success("Field Executive created successfully");
            loadExecutives(1);
        } catch (err) {
            console.error(err);
            toast.error("Failed to create Field Executive");
        }
    };

    const updateExecutive = async (id, data) => {
        try {
            await fieldExecutiveService.update({ id, executiveData: data });
            toast.success("Field Executive updated successfully");
            loadExecutives();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update Field Executive");
        }
    };

    const deleteExecutive = async (id) => {
        try {
            await fieldExecutiveService.delete(id);
            toast.success("Field Executive deleted successfully");
            loadExecutives();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete Field Executive");
        }
    };

    useEffect(() => {
        loadExecutives(1);
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
        deleteExecutive
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
    return context;
}

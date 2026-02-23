import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { caseService } from '../services/caseService';

const CaseContext = createContext();

export function CaseProvider({ children }) {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const loadCases = async (page = currentPage) => {
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
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            loadCases(page);
        }
    };

    const addNewCase = async (formData) => {
        try {
            await caseService.create(formData);
            toast.success("Case added successfully");
            loadCases(1);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add case");
        }
    };

    const updateExistingCase = async (id, formData) => {
        try {
            await caseService.update({ id, caseData: formData });
            toast.success("Case updated successfully");
            loadCases();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update case");
        }
    };

    const removeCase = async (id) => {
        try {
            await caseService.delete(id);
            toast.success("Case deleted successfully");
            loadCases();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete case");
        }
    };

    const getCaseById = async (id) => {
        try {
            const resp = await caseService.getById(id);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to get case details");
            return null;
        }
    };

    useEffect(() => {
        loadCases(1);
    }, []);

    const value = {
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
        getCaseById
    };

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

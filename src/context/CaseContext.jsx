import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { caseService } from '../services/caseService';

const CaseContext = createContext();

export function CaseProvider({ children }) {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCases = async () => {
        setLoading(true);
        try {
            const resp = await caseService.getAll();
            // Assuming response structure is { data: [...] } or { data: { data: [...] } }
            // Based on useCases.js: const { data } = await getCases(); setCases(data.data);
            // caseService.getAll() returns `data` from axios response directly.
            // So if API returns { success: true, data: [...] }, then resp is that object.
            // useCases.js had `setCases(data.data)`.
            // Let's assume standard response structure.
            setCases(resp.data || []);
        } catch (err) {
            console.error("Error loading cases:", err);
            toast.error("Failed to load cases");
        } finally {
            setLoading(false);
        }
    };

    const addNewCase = async (formData) => {
        try {
            await caseService.create(formData);
            toast.success("Case added successfully");
            loadCases();
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
        loadCases();
    }, []);

    const value = {
        cases,
        loading,
        loadCases,
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

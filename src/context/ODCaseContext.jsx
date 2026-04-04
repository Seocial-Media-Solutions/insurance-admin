import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { odCaseService } from '../services/odCaseService';

const ODCaseContext = createContext();

export function ODCaseProvider({ children }) {
    const [odCases, setOdCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const loadODCases = async (force = false) => {
        if (!force && (loading || initialized)) return; // Prevent duplicate or redundant calls
        setLoading(true);
        try {
            const resp = await odCaseService.getAll();
            setOdCases(resp.data || []);
            setInitialized(true);
        } catch (err) {
            console.error("Error loading OD cases:", err);
            toast.error("Failed to load OD cases");
        } finally {
            setLoading(false);
        }
    };

    const deleteODCase = async (id) => {
        try {
            await odCaseService.delete(id);
            // Force re-fetch the list after deletion
            loadODCases(true);
            toast.success("OD Case deleted successfully");
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const updateODSection = async (caseId, sectionPath, formData) => {
        try {
            await odCaseService.updateSection({ caseId, sectionPath, formData });
            toast.success("Section updated successfully");
            // Invalidate/Refresh details if needed - usually done via refetch in editor
            return true;
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update section");
            return false;
        }
    };

    const deleteODImage = async (caseId, sectionPath, fieldName, publicId) => {
        try {
            await odCaseService.deleteImage({ caseId, sectionPath, fieldName, publicId });
            return true;
        } catch (err) {
            console.error("Image delete error:", err);
            return false;
        }
    };

    // Add more methods as needed (updateSection, etc.)

    const getODCaseById = async (id) => {
        try {
            const resp = await odCaseService.getById(id);
            return resp.data;
        } catch (err) {
            console.error(err);
            // Service layer already showed the error toast
            return null;
        }
    };

    useEffect(() => {
        // Initial fetch is now lazy-loaded by the hook
    }, []);

    const value = {
        odCases,
        loading,
        loadODCases,
        deleteODCase,
        getODCaseById,
        updateODSection,
        deleteODImage,
        initialized
    };

    return (
        <ODCaseContext.Provider value={value}>
            {children}
        </ODCaseContext.Provider>
    );
}

export function useODCases() {
    const context = useContext(ODCaseContext);
    if (!context) {
        throw new Error('useODCases must be used within an ODCaseProvider');
    }

    // Lazy load: fetch data only when component uses this context
    useEffect(() => {
        if (!context.initialized && !context.loading) {
            context.loadODCases();
        }
    }, [context]);

    return context;
}

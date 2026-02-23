import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { odCaseService } from '../services/odCaseService';

const ODCaseContext = createContext();

export function ODCaseProvider({ children }) {
    const [odCases, setOdCases] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadODCases = async () => {
        setLoading(true);
        try {
            const resp = await odCaseService.getAll();
            setOdCases(resp.data || []);
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
            toast.success("OD Case deleted successfully");
            loadODCases();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete OD case");
        }
    };

    // Add more methods as needed (updateSection, etc.)

    const getODCaseById = async (id) => {
        try {
            const resp = await odCaseService.getById(id);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to get OD case details");
            return null;
        }
    };

    useEffect(() => {
        loadODCases();
    }, []);

    const value = {
        odCases,
        loading,
        loadODCases,
        deleteODCase,
        getODCaseById
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
    return context;
}

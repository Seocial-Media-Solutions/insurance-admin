import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { theftCaseService } from '../services/theftCaseService';

const TheftCaseContext = createContext();

export function TheftCaseProvider({ children }) {
    const [theftCases, setTheftCases] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadTheftCases = async () => {
        setLoading(true);
        try {
            const resp = await theftCaseService.getAll();
            setTheftCases(resp.data || []);
        } catch (err) {
            console.error("Error loading Theft cases:", err);
            toast.error("Failed to load Theft cases");
        } finally {
            setLoading(false);
        }
    };

    const deleteTheftCase = async (id) => {
        try {
            await theftCaseService.delete(id);
            toast.success("Theft Case deleted successfully");
            loadTheftCases();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete Theft case");
        }
    };

    useEffect(() => {
        loadTheftCases();
    }, []);

    const getTheftCaseById = async (id) => {
        try {
            const resp = await theftCaseService.getById(id);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to get Theft case details");
            return null;
        }
    };

    const value = {
        theftCases,
        loading,
        loadTheftCases,
        deleteTheftCase,
        getTheftCaseById
    };

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

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fieldExecutiveService } from '../services/fieldExecutiveService';

const FieldExecutiveContext = createContext();

export function FieldExecutiveProvider({ children }) {
    const [executives, setExecutives] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadExecutives = async () => {
        setLoading(true);
        try {
            const resp = await fieldExecutiveService.getAll();
            setExecutives(resp.data || []);
        } catch (err) {
            console.error("Error loading Field Executives:", err);
            toast.error("Failed to load Field Executives");
        } finally {
            setLoading(false);
        }
    };

    const addExecutive = async (data) => {
        try {
            await fieldExecutiveService.create(data);
            toast.success("Field Executive created successfully");
            loadExecutives();
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
        loadExecutives();
    }, []);

    const value = {
        executives,
        loading,
        loadExecutives,
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

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { firmService } from '../services/firmService';

const FirmContext = createContext();

export function FirmProvider({ children }) {
    const [firms, setFirms] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFirms = async () => {
        setLoading(true);
        try {
            const resp = await firmService.getAll();
            setFirms(resp.data || []);
        } catch (err) {
            console.error("Error loading firms:", err);
            toast.error("Failed to load firms");
        } finally {
            setLoading(false);
        }
    };

    const addFirm = async (data) => {
        try {
            await firmService.create(data);
            toast.success("Firm created successfully");
            loadFirms();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to create firm");
            return false;
        }
    };

    const updateFirm = async (id, data) => {
        try {
            await firmService.update({ id, firmData: data });
            toast.success("Firm updated successfully");
            loadFirms();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to update firm");
            return false;
        }
    };

    const deleteFirm = async (id) => {
        try {
            await firmService.delete(id);
            toast.success("Firm deleted successfully");
            loadFirms();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete firm");
            return false;
        }
    };

    useEffect(() => {
        loadFirms();
    }, []);

    const value = {
        firms,
        loading,
        loadFirms,
        addFirm,
        updateFirm,
        deleteFirm
    };

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

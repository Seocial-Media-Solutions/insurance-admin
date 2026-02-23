import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { assignmentService } from '../services/assignmentService';

const AssignmentContext = createContext();

export function AssignmentProvider({ children }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAssignments = async () => {
        setLoading(true);
        try {
            const resp = await assignmentService.getAll();
            setAssignments(resp.data || []);
        } catch (err) {
            console.error("Error loading assignments:", err);
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const addAssignment = async (data) => {
        try {
            await assignmentService.create(data);
            toast.success("Assignment created successfully");
            loadAssignments();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create assignment");
        }
    };

    const updateAssignment = async (id, data) => {
        try {
            await assignmentService.update({ id, assignmentData: data });
            toast.success("Assignment updated successfully");
            loadAssignments();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update assignment");
        }
    };

    const deleteAssignment = async (id) => {
        try {
            await assignmentService.delete(id);
            toast.success("Assignment deleted successfully");
            loadAssignments();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete assignment");
        }
    };

    useEffect(() => {
        loadAssignments();
    }, []);

    const getAssignmentsByCaseId = async (caseId) => {
        try {
            const resp = await assignmentService.getByCaseId(caseId);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch assignments for case");
            return [];
        }
    };

    const getAssignmentById = async (id) => {
        try {
            const resp = await assignmentService.getById(id);
            return resp.data;
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch assignment details");
            return null;
        }
    };

    const value = {
        assignments,
        loading,
        loadAssignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        getAssignmentsByCaseId,
        getAssignmentById
    };

    return (
        <AssignmentContext.Provider value={value}>
            {children}
        </AssignmentContext.Provider>
    );
}

export function useAssignments() {
    const context = useContext(AssignmentContext);
    if (!context) {
        throw new Error('useAssignments must be used within an AssignmentProvider');
    }
    return context;
}

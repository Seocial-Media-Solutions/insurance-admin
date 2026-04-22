// FILE: src/pages/AssignmentManagement.jsx
import React, { useState, useEffect } from "react";
import AssignCaseForm from "../../components/CaseAssignment/AssignCaseForm";
import AssignmentList from "../../components/CaseAssignment/AssignmentList";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const AssignmentManagement = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("assignments");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clean up state to prevent opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAssignmentCreated = async (
    assignmentPromise
  ) => {
    try {
      await toast.promise(
        assignmentPromise,
        {
          loading: "Creating assignment...",
          success: "Assignment created successfully!",
          error: (err) => err?.message || "Failed to create assignment",
        }
      );

      setActiveTab("assignments");
    } catch (error) {
      console.error("Assignment creation failed:", error);
    }
  };


  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        
     <button
            onClick={() => setActiveTab("assign")}
            className={`inline-flex  z-99 fixed bottom-5 right-5 items-center px-4 py-2  border text-sm font-medium rounded-md shadow-sm transition-colors ${activeTab === "assign"
              ? " hidden"
              : "bg-black text-white hover:bg-black"
              }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Case
          </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "assignments", name: "All Assignments" },
            { id: "assign", name: "Assign Case" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === "assignments" && <AssignmentList />}
        {activeTab === "assign" && (
          <AssignCaseForm onAssignmentCreated={handleAssignmentCreated} />
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;

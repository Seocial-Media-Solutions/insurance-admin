// FILE: src/pages/AssignmentManagement.jsx
import React, { useState } from "react";
import AssignCaseForm from "../../components/CaseAssignment/AssignCaseForm";
import AssignmentList from "../../components/CaseAssignment/AssignmentList";
import { Plus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const AssignmentManagement = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [refreshList, setRefreshList] = useState(0);

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
        },
        {
          position: "top-right",
          style: {
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
          },
        }
      );

      // ✅ Runs ONLY on success
      setActiveTab("assignments");
    } catch (error) {
      // ❌ Runs ONLY on error
      console.error("Assignment creation failed:", error);
    } finally {
      // 🔁 Runs ALWAYS (success or error)
      setRefreshList((prev) => prev + 1);
    }
  };


  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Assignment Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Assign cases to field executives and manage investigations
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setActiveTab("assign")}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-colors ${activeTab === "assign"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Case
          </button>
        </div>
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
        {activeTab === "assignments" && <AssignmentList key={refreshList} />}
        {activeTab === "assign" && (
          <AssignCaseForm onAssignmentCreated={handleAssignmentCreated} />
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;

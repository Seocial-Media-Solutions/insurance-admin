import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import {
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  UserCog,
  X
} from "lucide-react";
import Pagination from "../Ui/Pagination";
import TableSkeleton from "../Ui/TableSkeleton";
import { API } from "../../utils/api";
import { useGlobalSearch } from "../../context/SearchContext";
import { useFirms } from "../../context/FirmContext";
import { useAssignments } from "../../context/AssignmentContext";
import { useFieldExecutives } from "../../context/FieldExecutiveContext";

const FirmCodeCell = ({ firmId }) => {
  const { getFirmSync } = useFirms();
  const firm = getFirmSync(firmId);

  if (!firm) return <span className="text-gray-400 text-xs text-center">--</span>;

  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold text-blue-600 font-mono tracking-tighter uppercase whitespace-nowrap">
        {firm.code || "--"}
      </span>
      <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
        {firm.name}
      </span>
    </div>
  );
};


const AssignmentList = () => {
  const { 
    assignments, 
    loading: assignmentsLoading, 
    loadAssignments, 
    currentPage, 
    totalPages, 
    total, 
    goToPage, 
    deleteAssignment,
    updateAssignment 
  } = useAssignments();
  
  const { 
    executives, 
    loading: executivesLoading 
  } = useFieldExecutives();

  const { globalSearch } = useGlobalSearch();
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortField, setSortField] = useState("assignedDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [reassignModal, setReassignModal] = useState({ open: false, assignmentId: null, currentExecutiveId: null, newExecutiveId: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const limit = 50;

  useEffect(() => {
    loadAssignments(currentPage, globalSearch);
  }, [currentPage, globalSearch]);

  const handleReassign = async () => {
    if (!reassignModal.newExecutiveId) {
      toast.error("Please select an executive");
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("Reassigning case...");

    try {
      await updateAssignment(reassignModal.assignmentId, {
        fieldExecutiveId: reassignModal.newExecutiveId
      });
      toast.success("Case reassigned successfully", { id: toastId });
      setReassignModal({ open: false, assignmentId: null, currentExecutiveId: null, newExecutiveId: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reassign case", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (assignmentId) => {
    toast((t) => (
      <div className="bg-white text-gray-950">
        <p className="text-sm mb-2">
          Are you sure you want to delete this assignment?
        </p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                toast.dismiss(t.id);
                await toast.promise(
                  deleteAssignment(assignmentId),
                  {
                    loading: "Deleting assignment...",
                    success: "Assignment deleted successfully",
                    error: "Failed to delete assignment",
                  }
                );
              } catch (_err) {
                toast.error("Something went wrong");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition"
          >
            Confirm
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-xs transition"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-gray-100 text-gray-800",
      Medium: "bg-blue-100 text-blue-800",
      High: "bg-orange-100 text-orange-800",
      Urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.Pending;
  };

  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesSearch =
        !globalSearch ||
        assignment.caseId?.recordNumber
          ?.toLowerCase()
          .includes(globalSearch.toLowerCase()) ||
        assignment.caseId?.vehicleNo
          ?.toLowerCase()
          .includes(globalSearch.toLowerCase()) ||
        assignment.caseId?.nameOfInsured
          ?.toLowerCase()
          .includes(globalSearch.toLowerCase()) ||
        assignment.fieldExecutiveId?.fullName
          ?.toLowerCase()
          .includes(globalSearch.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || assignment.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || assignment.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "caseId") {
        aValue = a.caseId?.recordNumber;
        bValue = b.caseId?.recordNumber;
      } else if (sortField === "fieldExecutiveId") {
        aValue = a.fieldExecutiveId?.fullName;
        bValue = b.fieldExecutiveId?.fullName;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (assignmentsLoading) {
    return <TableSkeleton columns={8} rows={10} />;
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      {/* Filters */}
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-44 pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black uppercase tracking-wider text-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative group flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full sm:w-44 pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black uppercase tracking-wider text-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="relative">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-white">
              <tr className="border-b border-gray-100">
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Firm</th>
                <th
                  className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort("caseId")}
                >
                  <div className="flex items-center gap-1">
                    Case Details <SortIcon field="caseId" />
                  </div>
                </th>
                <th
                  className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort("fieldExecutiveId")}
                >
                  <div className="flex items-center gap-1">
                    Executive <SortIcon field="fieldExecutiveId" />
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visits</th>
                <th
                  className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center gap-1">
                    Priority <SortIcon field="priority" />
                  </div>
                </th>
                <th
                  className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 bg-white">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Filter className="w-8 h-8 text-gray-200" />
                      </div>
                      <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No assignments matching criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-6 py-5">
                      <FirmCodeCell firmId={assignment.caseId?.caseFirmId} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-gray-900 uppercase tracking-tight mb-0.5">
                        {assignment.caseId?.recordNumber}
                      </div>
                      <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 inline-block uppercase tracking-tight">
                        {assignment.caseId?.vehicleNo}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[11px] font-black text-gray-800 uppercase tracking-tight">
                        {assignment.fieldExecutiveId?.fullName}
                      </div>
                      <div className="text-[10px] font-medium text-gray-400">
                        {assignment.fieldExecutiveId?.contactNumber}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex -space-x-1 overflow-hidden">
                        {(assignment.investigationVisits || []).slice(0, 3).map((visit, idx) => (
                          <div 
                            key={idx} 
                            className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
                            title={visit.label}
                          >
                            <span className="text-[8px] font-black text-gray-400 uppercase">{visit.label[0]}</span>
                          </div>
                        ))}
                        {assignment.investigationVisits?.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
                            <span className="text-[8px] font-black text-gray-500">+{assignment.investigationVisits.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => setReassignModal({
                            open: true,
                            assignmentId: assignment._id,
                            currentExecutiveId: assignment.fieldExecutiveId?._id,
                            newExecutiveId: ""
                          })}
                          className="bg-white text-orange-600 p-2 rounded-xl border border-orange-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                          title="Reassign Case"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="bg-white text-red-600 p-2 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No assignments found</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div key={assignment._id} className="p-5 active:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FirmCodeCell firmId={assignment.caseId?.caseFirmId} />
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{assignment.caseId?.recordNumber}</span>
                      </div>
                      <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block uppercase tracking-tight">
                        {assignment.caseId?.vehicleNo}
                      </p>
                   </div>
                   <div className="flex gap-2">
                     <button
                        onClick={() => setReassignModal({
                          open: true,
                          assignmentId: assignment._id,
                          currentExecutiveId: assignment.fieldExecutiveId?._id,
                          newExecutiveId: ""
                        })}
                        className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 active:bg-orange-600 active:text-white transition-all"
                      >
                        <UserCog size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 active:bg-red-600 active:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Priority</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                   </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                   <div className="flex-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Field Executive</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{assignment.fieldExecutiveId?.fullName || "Unassigned"}</p>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Investigation Visits</p>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {(assignment.investigationVisits || []).length > 0 ? (
                          (assignment.investigationVisits || []).slice(0, 2).map((visit, idx) => (
                            <span 
                              key={idx} 
                              className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                visit.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                visit.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-gray-50 text-gray-600 border-gray-100'
                              }`}
                            >
                              {visit.label}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase italic">No visits yet</span>
                        )}
                        {(assignment.investigationVisits || []).length > 2 && (
                          <span className="px-2 py-0.5 rounded-lg bg-black text-white text-[8px] font-black uppercase tracking-widest">
                            +{assignment.investigationVisits.length - 2} More
                          </span>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reassign Modal */}
      {reassignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-50 p-4" onClick={() => setReassignModal({ ...reassignModal, open: false })} >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Reassign Case</h3>
              <button
                onClick={() => setReassignModal({ ...reassignModal, open: false })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select a new field executive to take over this investigation.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Field Executive
                  </label>
                  <select
                    value={reassignModal.newExecutiveId}
                    onChange={(e) => setReassignModal({ ...reassignModal, newExecutiveId: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Choose New Executive --</option>
                    {executives
                      .filter(ex => ex._id !== reassignModal.currentExecutiveId)
                      .map((exec) => (
                        <option key={exec._id} value={exec._id}>
                          {exec.fullName} - {exec.contactNumber}
                        </option>
                      )
                      )}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end p-4 border-t bg-gray-50 space-x-3">
              <button
                onClick={() => setReassignModal({ ...reassignModal, open: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={isUpdating || !reassignModal.newExecutiveId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Reassigning..." : "Confirm Reassign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {assignments.length} of {total} assignments
          </span>
          <div className="flex space-x-4">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
              Pending:{" "}
              {assignments.filter((a) => a.status === "Pending").length}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
              In Progress:{" "}
              {assignments.filter((a) => a.status === "In Progress").length}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
              Completed:{" "}
              {assignments.filter((a) => a.status === "Completed").length}
            </span>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={goToPage}
      />
    </div>
  );
};

export default AssignmentList;

import React, { useEffect, useState, useCallback } from "react";
// axios removed
import { useNavigate } from "react-router-dom";
import { investigationService } from "../../services/investigationService";
import { assignmentService } from "../../services/assignmentService";
import toast from "react-hot-toast";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  ClipboardList,
  X,
} from "lucide-react";

const ALL_COLUMNS = [
  { header: "File No", accessor: "caseId.ourFileNo" },
  { header: "Vehicle No", accessor: "caseId.vehicleNo" },
  { header: "Insured Name", accessor: "caseId.nameOfInsured" },
  { header: "Status", accessor: "status" },
  { header: "Case Status", accessor: "caseId.status" },
  { header: "Date", accessor: "createdAt", isDate: true },
];

/* -------------------------------------------------
   Helper to safely access nested objects
------------------------------------------------- */
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

/* -------------------------------------------------
   Main Component
------------------------------------------------- */
export default function CaseList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  const columns = ALL_COLUMNS;

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch paginated investigation reports which represent all cases
      const res = await investigationService.getAll({ page, limit: 15 });
      const reportsData = res.data?.caseDetails || res.data || [];
      setData(reportsData);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error("Failed to fetch data");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Delete
  const handleDelete = async (id, e) => {
    e.stopPropagation();

    // Custom confirmation toast
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">Delete Investigation?</p>
          <p className="text-sm text-gray-600 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading("Deleting investigation...");

              try {
                await investigationService.delete(id);
                toast.dismiss(loadingToast);
                toast.success("Investigation deleted successfully!", {
                  duration: 3000,
                  icon: "🗑️",
                });
                fetchData();
              } catch (error) {
                toast.dismiss(loadingToast);
                console.error("Error deleting:", error);
                toast.error("Failed to delete investigation", {
                  duration: 4000,
                });
              }
            }}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-center",
    });
  };

  // Handle View Assignments for Case
  const handleViewAssignments = async (caseId, e) => {
    if (e) e.stopPropagation();
    setSelectedCaseId(caseId);
    setShowAssignmentsModal(true);
    setLoadingAssignments(true);

    try {
      const res = await assignmentService.getByCaseId(caseId);
      setAssignments(res.data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to fetch assignments", { duration: 3000 });
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Filter Data (Client-side simple search for now)
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    // Unified search
    const str = (v) => (v || "").toString().toLowerCase();
    const caseIdObj = item.caseId || {};
    const refNo = getNestedValue(item, "letterDetails.referenceNumber") || "";

    return (
      str(item.status).includes(q) ||
      str(caseIdObj.ourFileNo).includes(q) ||
      str(caseIdObj.vehicleNo).includes(q) ||
      str(caseIdObj.nameOfInsured).includes(q) ||
      str(item._id).includes(q) ||
      refNo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage / Edit your cases
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Ref No, Vehicle No, or Insured Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              Loading cases...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">S.No</th>
                    {columns.map((col, idx) => (
                      <th key={idx} className={`px-6 py-4 ${col.width || ""}`}>
                        {col.header}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-500">
                        No cases found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                        onClick={() => {
                          const route = "OD" === item.caseType
                            ? `od-case/edit/${item.caseTypeId}`
                            : `theft-case/edit/${item.caseTypeId}`;
                          navigate(route);
                        }}
                      >
                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">{(page - 1) * 15 + idx + 1}</td>
                        {columns.map((col, colIdx) => (
                          <td key={colIdx} className="px-6 py-4">
                            {col.isDate ? (
                              <span className="flex items-center gap-1.5 text-gray-500">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(getNestedValue(item, col.accessor)).toLocaleDateString()}
                              </span>
                            ) : col.accessor === "status" ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "Draft" ? "bg-yellow-100 text-yellow-700" :
                                item.status === "Submitted" ? "bg-blue-100 text-blue-700" :
                                  item.status === "Approved" ? "bg-green-100 text-green-700" :
                                    item.status === "Rejected" ? "bg-red-100 text-red-700" :
                                      "bg-gray-100 text-gray-700"
                                }`}>
                                {item.status || "--"}
                              </span>
                            ) : col.accessor === "caseType" ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.caseType === "OD" ? "bg-purple-100 text-purple-700" :
                                item.caseType === "THEFT" ? "bg-orange-100 text-orange-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                {item.caseType || "--"}
                              </span>
                            ) : (
                              <span className={col.header === "Case ID" || col.header === "Investigation ID" ? "font-mono text-xs text-gray-400" : "font-medium text-gray-900"}>
                                {getNestedValue(item, col.accessor) || "--"}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button
                            className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Assignments"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAssignments(item.caseId?._id || item.caseId, e);
                            }}
                          >
                            <ClipboardList className="w-4 h-4" />
                          </button>

                          <button
                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete Investigation"
                            onClick={(e) => handleDelete(item._id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border rounded-md hover:bg-white disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border rounded-md hover:bg-white disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignments Modal */}
      {showAssignmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Case Assignments</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Case ID: <span className="font-mono text-blue-600">{selectedCaseId}</span>
                </p>
              </div>
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingAssignments ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">Loading assignments...</p>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No assignments found for this case</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Found <span className="font-semibold text-indigo-600">{assignments.length}</span> assignment{assignments.length !== 1 ? 's' : ''}
                  </p>

                  {/* Assignment Cards */}
                  <div className="space-y-4">
                    {assignments.map((assignment, idx) => (
                      <div key={assignment._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {/* Assignment Header */}
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-700">Assignment #{idx + 1}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                  assignment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {assignment.status || 'Pending'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${assignment.priority === 'high' ? 'bg-red-100 text-red-700' :
                                assignment.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                {assignment.priority || 'medium'} priority
                              </span>
                            </div>
                            <span className="font-mono text-xs text-gray-500">{assignment._id}</span>
                          </div>
                        </div>

                        {/* Assignment Details */}
                        <div className="p-4 bg-white">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Field Executive</p>
                              <p className="text-sm text-gray-900 font-medium">{assignment.fieldExecutiveId || '--'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Assigned Date</p>
                              <p className="text-sm text-gray-900">
                                {assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                }) : '--'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Contact Person</p>
                              <p className="text-sm text-gray-900">{assignment.contactPersonName || '--'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Contact Phone</p>
                              <p className="text-sm text-gray-900 font-mono">{assignment.contactPersonPhone || '--'}</p>
                            </div>
                          </div>

                          {/* Investigation Visits */}
                          {assignment.investigationVisits && assignment.investigationVisits.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
                                Investigation Visits ({assignment.investigationVisits.length})
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                {assignment.investigationVisits.map((visit, vIdx) => (
                                  <div key={vIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${visit.status === 'Completed' ? 'bg-green-500' :
                                        visit.status === 'In Progress' ? 'bg-blue-500' :
                                          'bg-gray-400'
                                        }`}></span>
                                      <span className="text-sm text-gray-700">{visit.label}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${visit.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                      visit.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-200 text-gray-600'
                                      }`}>
                                      {visit.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

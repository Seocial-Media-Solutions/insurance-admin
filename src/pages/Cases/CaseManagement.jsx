import React, { useEffect, useState, useCallback } from "react";
// axios removed
import { useNavigate } from "react-router-dom";
import { investigationService } from "../../services/investigationService";
import { assignmentService } from "../../services/assignmentService";
import { useFirms } from "../../context/FirmContext";

import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  ClipboardList,
  X,
} from "lucide-react";
import { useGlobalSearch } from "../../context/SearchContext";
import { useInvestigations } from "../../context/InvestigationContext";
import TableSkeleton from "../../components/Ui/TableSkeleton";

const ALL_COLUMNS = [
  { header: "Vehicle No", accessor: "caseId.vehicleNo" },
  { header: "Insured Name", accessor: "caseId.nameOfInsured" },
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
   Firm Display Cell (Handles populated or fetching)
------------------------------------------------- */
const FirmCell = ({ firmId, firmData, caseFileNo }) => {
  const { getFirmSync } = useFirms();

  // 1. If we have ourFileNo for THIS specific case, show it first
  if (caseFileNo) {
    return (
      <div className="flex flex-col">
        <span className="text-gray-900 font-semibold">{firmData?.name || "--"}</span>
        <span className="text-xs text-blue-600 font-mono font-bold tracking-tight">{caseFileNo}</span>
      </div>
    );
  }

  // 2. If we have populated data from backend
  if (firmData && typeof firmData === "object") {
    return (
      <div className="flex flex-col">
        <span className="text-gray-900 font-semibold">{firmData.name}</span>
        <span className="text-xs text-gray-400 font-mono">{firmData.code}</span>
      </div>
    );
  }

  // 2. Fallback to context sync lookup
  const cachedFirm = getFirmSync(firmId);
  if (cachedFirm) {
    return (
      <div className="flex flex-col">
        <span className="text-gray-900 font-semibold">{cachedFirm.name}</span>
        <span className="text-xs text-gray-500 font-mono">{cachedFirm.code}</span>
      </div>
    );
  }

  return <span className="text-gray-400 font-mono text-xs">{firmId || "--"}</span>;
};

/* -------------------------------------------------
   Main Component
------------------------------------------------- */
export default function CaseList() {
  const navigate = useNavigate();
  const { 
    investigations: data, 
    loading, 
    currentPage: page, 
    totalPages, 
    goToPage, 
    deleteInvestigation 
  } = useInvestigations();
  
  const { globalSearch } = useGlobalSearch();
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const { getFirmById } = useFirms();

  const columns = ALL_COLUMNS;

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
                await deleteInvestigation(id);
                toast.dismiss(loadingToast);
                toast.success("Investigation deleted successfully!", {
                  duration: 3000,
                  icon: "🗑️",
                });
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

  // Filter Data (Client-side simple search using global search)
  const filteredData = data.filter((item) => {
    if (!globalSearch) return true;
    const q = globalSearch.toLowerCase();

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
           
            <p className="text-gray-500 text-sm mt-1">
              Manage / Edit your cases
            </p>
          </div>
        </div>



        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {loading ? (
            <TableSkeleton columns={6} rows={10} />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase text-gray-400 font-black tracking-[0.2em]">
                      <th className="px-6 py-5 w-16">S.No</th>
                      <th className="px-6 py-5">Case Firm</th>
                      {columns.map((col, idx) => (
                        <th key={idx} className={`px-6 py-5 ${col.width || ""}`}>
                          {col.header}
                        </th>
                      ))}
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 2} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                              <ClipboardList className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No cases found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, idx) => (
                        <tr
                          key={item._id}
                          className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                          onClick={() => {
                            if (!item.caseTypeId) {
                              toast.error("First assign assignment for this case", {
                                icon: "⚠️",
                                duration: 4000
                              });
                              return;
                            }

                            const route = item.caseType === "OD"
                              ? `od-case/edit/${item.caseTypeId}`
                              : `theft-case/edit/${item.caseTypeId}`;
                            
                            navigate(route, { 
                              state: { 
                                parentCaseData: item.caseId 
                              } 
                            });
                          }}
                        >
                          <td className="px-6 py-4 text-gray-300 font-black text-[10px] w-16 group-hover:text-blue-600 transition-colors">
                             {((page - 1) * 15 + idx + 1).toString().padStart(2, '0')}
                          </td>
                           <td className="px-6 py-4 min-w-[150px]">
                              <FirmCell 
                                firmId={item?.caseId?.caseFirmId?._id || item?.caseId?.caseFirmId} 
                                firmData={item?.caseId?.caseFirmId}
                                caseFileNo={item?.caseId?.ourFileNo}
                              />
                           </td>
                          {columns.map((col, colIdx) => (
                            <td key={colIdx} className="px-6 py-4">
                              {col.isDate ? (
                                <span className="flex items-center gap-2 text-gray-500 text-[11px] font-bold uppercase">
                                  <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                  {new Date(getNestedValue(item, col.accessor)).toLocaleDateString('en-GB', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}
                                </span>
                              ) : col.accessor === "status" ? (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                    item.status === "Draft" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    item.status === "Submitted" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                    item.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    item.status === "Rejected" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    "bg-gray-50 text-gray-600 border-gray-100"
                                  }`}>
                                  {item.status || "--"}
                                </span>
                              ) : col.accessor === "caseId.status" ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border-b-2 ${
                                    item.caseId?.status === "Pending" ? "bg-orange-50 text-orange-600 border-orange-200" :
                                    item.caseId?.status === "Completed" ? "bg-green-50 text-green-600 border-green-200" :
                                    "bg-gray-50 text-gray-600 border-gray-200"
                                  }`}>
                                  {item.caseId?.status || "--"}
                                </span>
                              ) : (
                                <span className={col.header === "Vehicle No" ? "font-black text-xs text-gray-900 uppercase tracking-tight bg-gray-100 px-2 py-1 rounded" : "font-bold text-gray-800"}>
                                  {getNestedValue(item, col.accessor) || "--"}
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                              <button
                                className="bg-white text-blue-600 p-2 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="View Assignments"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewAssignments(item.caseId?._id || item.caseId, e);
                                }}
                              >
                                <ClipboardList className="w-4 h-4" />
                              </button>

                              <button
                                className="bg-white text-red-600 p-2 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Delete Investigation"
                                onClick={(e) => handleDelete(item._id, e)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                   <div className="p-12 text-center">
                      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No cases found</p>
                   </div>
                ) : (
                  filteredData.map((item, idx) => (
                    <div 
                      key={item._id} 
                      className="p-5 active:bg-gray-50 transition-colors"
                      onClick={() => {
                        if (!item.caseTypeId) {
                          toast.error("First assign assignment for this case");
                          return;
                        }
                        const route = item.caseType === "OD"
                          ? `od-case/edit/${item.caseTypeId}`
                          : `theft-case/edit/${item.caseTypeId}`;
                        navigate(route, { state: { parentCaseData: item.caseId } });
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <FirmCell 
                          firmId={item?.caseId?.caseFirmId?._id || item?.caseId?.caseFirmId} 
                          firmData={item?.caseId?.caseFirmId}
                          caseFileNo={item?.caseId?.ourFileNo}
                        />
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          item.status === "Draft" ? "bg-amber-50 text-amber-600 border-amber-100" :
                          item.status === "Submitted" ? "bg-blue-50 text-blue-600 border-blue-100" :
                          item.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          "bg-gray-50 text-gray-600 border-gray-100"
                        }`}>
                          {item.status || "N/A"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle No</p>
                           <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                             {item.caseId?.vehicleNo || "--"}
                           </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                           <p className="text-xs font-bold text-gray-700">
                             {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                           </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                         <div className="flex-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Insured Name</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{item.caseId?.nameOfInsured || "--"}</p>
                         </div>
                         <div className="flex gap-2">
                            <button
                              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 active:bg-blue-600 active:text-white transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewAssignments(item.caseId?._id || item.caseId, e);
                              }}
                            >
                              <ClipboardList className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 active:bg-red-600 active:text-white transition-all"
                              onClick={(e) => handleDelete(item._id, e)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 border rounded-md hover:bg-white disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
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
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {assignment.investigationVisits.map((visit, vIdx) => (
                                  <div key={vIdx} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-indigo-200 transition-all">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">
                                        {vIdx + 1}
                                      </div>
                                      <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{visit.label}</span>
                                    </div>
                                    <span className={`text-[8px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border ${
                                      visit.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                      visit.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                      'bg-gray-50 text-gray-600 border-gray-100'
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

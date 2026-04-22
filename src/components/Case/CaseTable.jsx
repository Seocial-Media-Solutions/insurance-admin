import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Filter,
  Download,
  FolderOpen,
  Edit,
  Phone,
  Car,
  User,
  AlertCircle,
  UserPlus
} from "lucide-react";
import Drawer from "../Ui/Drawer";
import AssignCaseForm from "../CaseAssignment/AssignCaseForm";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalSearch } from "../../context/SearchContext";

export default function CaseTable({ cases, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [viewingCase, setViewingCase] = useState(null);
  const [assigningCase, setAssigningCase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const { globalSearch } = useGlobalSearch();
  const [statusFilter] = useState("all");
  const [itemsPerPage] = useState(15);

  const handleDelete = useCallback(
    (id, recordNumber) => {
      toast((t) => (
        <div className="bg-white text-gray-950 ">
          <p className="text-sm mb-2">
            Are you sure you want to delete <b>case {recordNumber}</b>? <br />

          </p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  await onDelete(id);
                  toast.success(`Case ${recordNumber} deleted successfully`);
                } catch (err) {
                  toast.error(`Failed to delete case ${recordNumber}`);
                  console.error(err);
                } finally {
                  toast.dismiss(t.id);
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
    },
    [onDelete]
  );

  // Filter and search cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        !globalSearch ||
        c.ourFileNo?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.recordNumber?.toString().includes(globalSearch) ||
        c.policyNo?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.vehicleNo?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.nameOfInsured?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        c.contactNo?.includes(globalSearch);

      const matchesStatus =
        statusFilter === "all" ||
        c.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [cases, globalSearch, statusFilter]);

  // Sort cases
  const sortedCases = useMemo(() => {
    const sorted = [...filteredCases];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";

        // Handle date sorting
        if (sortConfig.key === "createdAt") {
          aVal = new Date(aVal).getTime() || 0;
          bVal = new Date(bVal).getTime() || 0;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredCases, sortConfig]);

  const totalPages = Math.ceil(sortedCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCases = sortedCases.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, statusFilter]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-40" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "var(--primary)" }} />
    ) : (
      <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "var(--primary)" }} />
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return { bg: "#10b981", text: "white" };
      case "pending":
        return { bg: "#f59e0b", text: "white" };
      case "rejected":
        return { bg: "#ef4444", text: "white" };
      default:
        return { bg: "var(--secondary)", text: "white" };
    }
  };

  // Removed unused stats count variables

  return (
    <>
      <div
        className=" max-w-8xl rounded-xl shadow-lg   overflow-hidden transition-all duration-300 hover:shadow-xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header with Stats */}




        {/* Table / Cards */}
        <div className="relative">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-white">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">#</th>
                  <th
                    onClick={() => handleSort("recordNumber")}
                    className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      File No <SortIcon column="ourFileNo" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("policyNo")}
                    className="hidden lg:table-cell px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Policy <SortIcon column="policyNo" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("vehicleNo")}
                    className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Vehicle <SortIcon column="vehicleNo" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("nameOfInsured")}
                    className="hidden xl:table-cell px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Insured <SortIcon column="nameOfInsured" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Status <SortIcon column="status" />
                    </div>
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 bg-white">
                {sortedCases.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <FolderOpen className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No cases found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentCases.map((c, index) => {
                    const statusColors = getStatusColor(c.status);
                    return (
                      <tr 
                        key={c._id} 
                        className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                        onClick={() => {
                          if (!c.caseTypeId) {
                            toast.error("First assign assignment for this case", { icon: "⚠️" });
                            return;
                          }
                          navigate(c.caseType === "OD" ? `/case/od-case/edit/${c.caseTypeId}` : `/case/theft-case/edit/${c.caseTypeId}`);
                        }}
                      >
                        <td className="px-6 py-5 text-[11px] font-black text-gray-400">{startIndex + index + 1}</td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{c.ourFileNo || c.recordNumber || "-"}</div>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-5">
                          <div className="text-[11px] font-black text-gray-500 uppercase tracking-tight">{c.policyNo || "-"}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block uppercase tracking-tight">
                            {c.vehicleNo || "-"}
                          </div>
                        </td>
                        <td className="hidden xl:table-cell px-6 py-5">
                          <div className="text-[11px] font-black text-gray-800 uppercase tracking-tight truncate max-w-[200px]">{c.nameOfInsured || "-"}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                            style={{ backgroundColor: `${statusColors.bg}15`, color: statusColors.bg, borderColor: `${statusColors.bg}30` }}
                          >
                            {c.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <Link to={`/cases/view/${c._id}`} onClick={(e) => e.stopPropagation()} className="p-2 bg-white text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                              <Eye size={14} />
                            </Link>
                            <Link to={`/cases/edit/${c._id}`} onClick={(e) => e.stopPropagation()} className="p-2 bg-white text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                              <Edit2 size={14} />
                            </Link>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setAssigningCase(c); }}
                              className="p-2 bg-white text-orange-600 rounded-xl border border-orange-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                            >
                              <UserPlus size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(c._id, c.recordNumber); }}
                              className="p-2 bg-white text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-gray-100">
            {sortedCases.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-black uppercase text-[10px] tracking-widest">No cases found</div>
            ) : (
              currentCases.map((c) => {
                const statusColors = getStatusColor(c.status);
                return (
                  <div 
                    key={c._id} 
                    className="p-5 active:bg-gray-50 transition-colors"
                    onClick={() => {
                      if (!c.caseTypeId) {
                        toast.error("First assign assignment for this case", { icon: "⚠️" });
                        return;
                      }
                      navigate(c.caseType === "OD" ? `/case/od-case/edit/${c.caseTypeId}` : `/case/theft-case/edit/${c.caseTypeId}`);
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File No</p>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{c.ourFileNo || c.recordNumber || "-"}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/cases/view/${c._id}`} onClick={(e) => e.stopPropagation()} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100"><Eye size={16} /></Link>
                        <Link to={`/cases/edit/${c._id}`} onClick={(e) => e.stopPropagation()} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100"><Edit2 size={16} /></Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle</p>
                        <span className="text-[10px] font-black text-blue-600 uppercase truncate block">{c.vehicleNo || "-"}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <span 
                          className="inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border"
                          style={{ backgroundColor: `${statusColors.bg}15`, color: statusColors.bg, borderColor: `${statusColors.bg}30` }}
                        >
                          {c.status || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex-1 overflow-hidden mr-4">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Insured Name</p>
                          <p className="text-xs font-bold text-gray-800 truncate">{c.nameOfInsured || "-"}</p>
                       </div>
                       <button 
                          onClick={(e) => { e.stopPropagation(); setAssigningCase(c); }}
                          className="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg"
                        >
                          Assign
                        </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drawer for Case Assignment */}
        <Drawer
          isOpen={!!assigningCase}
          onClose={() => setAssigningCase(null)}
          title="Direct Case Assignment"
        >
          {assigningCase && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">Assigning Case:</p>
                <p className="text-lg font-bold text-blue-700">{assigningCase.ourFileNo || assigningCase.recordNumber}</p>
                <div className="flex gap-4 mt-1 text-xs text-blue-800 opacity-80">
                  <span>Vehicle: {assigningCase.vehicleNo}</span>
                  <span>Type: {assigningCase.caseType}</span>
                </div>
              </div>

              <AssignCaseForm
                initialCaseId={assigningCase._id}
                initialCaseType={assigningCase.caseType}
                onAssignmentCreated={() => {
                  toast.success("Case assigned successfully");
                  setAssigningCase(null);
                  // Optional: trigger refresh if parent allows
                }}
              />
            </div>
          )}
        </Drawer>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-4 sm:px-6 py-4 flex items-center justify-between border-t"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
          >
            <div className="text-sm" style={{ color: "var(--secondary)" }}>
              Showing {startIndex + 1} to {Math.min(endIndex, sortedCases.length)} of{" "}
              {sortedCases.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
                style={{ borderColor: "var(--border)" }}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
                style={{ borderColor: "var(--border)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
                style={{ borderColor: "var(--border)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
                style={{ borderColor: "var(--border)" }}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {viewingCase && (
        <ViewCaseModal
          caseData={viewingCase}
          onClose={() => setViewingCase(null)}
          onEdit={onEdit}
        />
      )}
    </>
  );
}

function ViewCaseModal({ caseData, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 z-50">
      <div
        className="rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{ backgroundColor: "var(--primary)", color: "white" }}
        >
          <div>
            <h2 className="text-xl font-bold">{caseData.recordNumber}</h2>
            <p className="text-sm opacity-75 mt-0.5">Case Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto px-6 py-6"
          style={{
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          <div className="grid gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card)" }}>
              <p className="text-sm opacity-60 mb-1">Policy Number</p>
              <p className="font-semibold">{caseData.policyNo || "-"}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card)" }}>
              <p className="text-sm opacity-60 mb-1">Vehicle Number</p>
              <p className="font-semibold">{caseData.vehicleNo || "-"}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card)" }}>
              <p className="text-sm opacity-60 mb-1">Name of Insured</p>
              <p className="font-semibold">{caseData.nameOfInsured || "-"}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card)" }}>
              <p className="text-sm opacity-60 mb-1">Contact Number</p>
              <p className="font-semibold">{caseData.contactNo || "-"}</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--card)" }}>
              <p className="text-sm opacity-60 mb-1">Status</p>
              <p className="font-semibold">{caseData.status || "-"}</p>
            </div>
          </div>
        </div>
        <div
          className="px-6 py-4 flex justify-end gap-3 border-t"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-80"
            style={{ backgroundColor: "var(--secondary)", color: "white" }}
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit(caseData);
              onClose();
            }}
            className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-80"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            Edit Case
          </button>
        </div>
      </div>
    </div>
  );
}
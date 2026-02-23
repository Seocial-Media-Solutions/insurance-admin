import { useState, useMemo, useCallback } from "react";
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
  Search,
  Filter,
  Download,
  FolderOpen,
  Edit,
  Phone,
  Car,
  User,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function CaseTable({ cases, onEdit, onDelete }) {
  const [viewingCase, setViewingCase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const handleDelete = useCallback(
    (id, fileNo) => {
      toast((t) => (
        <div className="bg-white text-gray-950 ">
          <p className="text-sm mb-2">
            Are you sure you want to delete <b>case {fileNo}</b>? <br />
           
          </p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                try {
                  await onDelete(id);
                  toast.success(`Case ${fileNo} deleted successfully`);
                } catch (err) {
                  toast.error(`Failed to delete case ${fileNo}`);
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
        !searchQuery ||
        c.ourFileNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.policyNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.vehicleNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nameOfInsured?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactNo?.includes(searchQuery);

      const matchesStatus =
        statusFilter === "all" ||
        c.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);

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
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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

  const paidCount = cases.filter(c => c.status?.toLowerCase() === "paid").length;
  const pendingCount = cases.filter(c => c.status?.toLowerCase() === "pending").length;

  return (
    <>
      <div
        className=" max-w-8xl rounded-xl shadow-lg   overflow-hidden transition-all duration-300 hover:shadow-xl"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header with Stats */}
      

      

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead
              style={{
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            >
              <tr className="border-b border-b-gray-600" >
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  #
                </th>
                <th
                  onClick={() => handleSort("ourFileNo")}
                  className="px-3 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    File No <SortIcon column="ourFileNo" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("policyNo")}
                  className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Policy No <SortIcon column="policyNo" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("vehicleNo")}
                  className="px-3 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3 h-3" />
                    Vehicle <SortIcon column="vehicleNo" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("nameOfInsured")}
                  className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    Name <SortIcon column="nameOfInsured" />
                  </div>
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    Contact
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-3 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Status <SortIcon column="status" />
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody style={{ backgroundColor: "var(--card)" }}>
              {sortedCases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 sm:px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: "var(--border)" }}
                      >
                        {searchQuery || statusFilter !== "all" ? (
                          <AlertCircle className="w-8 h-8" style={{ color: "var(--secondary)" }} />
                        ) : (
                          <FolderOpen className="w-8 h-8" style={{ color: "var(--secondary)" }} />
                        )}
                      </div>
                      <p className="text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                        {searchQuery || statusFilter !== "all" ? "No matching cases" : "No cases found"}
                      </p>
                      <p className="text-sm" style={{ color: "var(--secondary)" }}>
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Create your first case to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentCases.map((c, index) => {
                  const statusColors = getStatusColor(c.status);
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-b-gray-200 hover:bg-black/5 transition-all duration-150"
                     
                    >
                      <td className="px-3 sm:px-6 py-4" style={{ color: "var(--secondary)" }}>
                        {startIndex + index + 1}
                      </td>
                      <td
                        className="px-3 sm:px-6 py-4 font-semibold"
                        style={{ color: "var(--primary)" }}
                      >
                        {c.ourFileNo || "-"}
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4" style={{ color: "var(--foreground)" }}>
                        {c.policyNo || "-"}
                      </td>
                      <td className="px-3 sm:px-6 py-4 font-medium" style={{ color: "var(--foreground)" }}>
                        {c.vehicleNo || "-"}
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4" style={{ color: "var(--foreground)" }}>
                        {c.nameOfInsured || "-"}
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4" style={{ color: "var(--foreground)" }}>
                        {c.contactNo || "-"}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs"
                          style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                          }}
                        >
                          {c.status?.toLowerCase() === "paid" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {c.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex justify-center items-center gap-1.5">
                          <Link
                            to={`/cases/view/${c._id}`}
                            className="p-2 rounded-lg text-white transition-all duration-200 hover:opacity-80 hover:scale-105"
                            style={{ backgroundColor: "#10b981" }}
                            title="View case"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/cases/edit/${c._id}`}
                            className="p-2 rounded-lg text-white transition-all duration-200 hover:opacity-80 hover:scale-105"
                            style={{ backgroundColor: "#6366f1" }}
                            title="Edit case"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(c._id, c.ourFileNo)}
                            className="p-2 rounded-lg text-white transition-all duration-200 hover:opacity-80 hover:scale-105"
                            style={{ backgroundColor: "#ef4444" }}
                            title="Delete case"
                          >
                            <Trash2 className="w-4 h-4" />
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
            <h2 className="text-xl font-bold">{caseData.ourFileNo}</h2>
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
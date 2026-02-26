import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCases } from "../context/useCases";
import CaseTable from "../components/Case/CaseTable";
import Pagination from "../components/Ui/Pagination";
import { Search, X, Plus, Download, Filter, Loader2 } from "lucide-react";
import { useGlobalSearch } from "../context/SearchContext";

export default function CaseManagement() {
  const { cases, loading, removeCase, currentPage, totalPages, total, limit, goToPage } = useCases();
  const { globalSearch } = useGlobalSearch();
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const query = globalSearch.toLowerCase();
      const match =
        !query ||
        c.ourFileNo?.toLowerCase().includes(query) ||
        c.policyNo?.toLowerCase().includes(query) ||
        c.vehicleNo?.toLowerCase().includes(query) ||
        c.nameOfInsured?.toLowerCase().includes(query);
      if (statusFilter === "all") return match;
      return match && c.status?.toLowerCase() === statusFilter;
    });
  }, [cases, globalSearch, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Loading cases...</p>
      </div>
    );
  }

  const handleExport = () => {
    const headers = [
      "Our File No",
      "Policy No",
      "Vehicle No",
      "Name of Insured",
      "Contact No",
      "Status",
      "Date of Case Rec",
      "Date of Loss",
    ];
    const rows = filteredCases.map((c) => [
      c.ourFileNo,
      c.policyNo,
      c.vehicleNo,
      c.nameOfInsured,
      c.contactNo,
      c.status,
      c.dtOfCaseRec,
      c.dateOfLoss,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cases_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Case Management</h1>
        <Link
          to="/cases/addcase"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          <Plus size={18} /> Add New Case
        </Link>
      </div>

      {/* Filter & Export */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="not paid">Not Paid</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <CaseTable
        cases={filteredCases}
        onView={(c) => navigate(`/cases/view/${c._id}`)}
        onEdit={(c) => navigate(`/cases/edit/${c._id}`)}
        onDelete={removeCase}
      />

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
}

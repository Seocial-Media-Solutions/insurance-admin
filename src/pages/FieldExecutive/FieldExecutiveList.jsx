import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function FieldExecutiveList() {
  const [fieldExecutives, setFieldExecutives] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // executives per page
  const navigate = useNavigate();

  // === Fetch all field executives ===
  const fetchExecutives = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/field-executives");
      const data = await res.json();
      if (data.success) setFieldExecutives(data.data);
      else toast.error("Failed to fetch executives");
    } catch (err) {
      toast.error("Error loading executives");
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, []);

  // === Delete executive ===
  const handleDelete = async (id) => {
    toast((t) => (
      <div>
        <p className="text-sm mb-2">Are you sure you want to delete?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const res = await fetch(
                  `http://localhost:5000/api/field-executives/${id}`,
                  { method: "DELETE" }
                );
                const result = await res.json();
                if (result.success) {
                  toast.success("Executive deleted");
                  fetchExecutives();
                } else {
                  toast.error(result.message || "Delete failed");
                }
              } catch {
                toast.error("Server error while deleting");
              }
              toast.dismiss(t.id);
            }}
            className="bg-red-600 text-white px-3 py-1 rounded-md text-xs"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 px-3 py-1 rounded-md text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  // === Edit executive ===
  const handleEdit = (exec) => {
    navigate(`/field-executives/edit/${exec._id}`);
  };

  // === Filter (search) ===
  const filteredExecutives = fieldExecutives.filter((e) => {
    const query = search.toLowerCase();
    return (
      e.fullName.toLowerCase().includes(query) ||
      e.username.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query)
    );
  });

  // === Pagination logic ===
  const totalPages = Math.ceil(filteredExecutives.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExecutives = filteredExecutives.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="min-h-screen max-w-full mx-auto">
      <Toaster position="top-right" />

      {/* === Header === */}
      <div className="bg-card rounded-lg shadow-lg p-6 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-black">
            <Users className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Field Executive Management</h1>
            <p className="text-gray-500">Manage your field executive team</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/field-executives/add")}
          className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-md bg-black text-white hover:bg-gray-800 transition"
        >
          <UserPlus size={20} /> Add New Executive
        </button>
      </div>

      {/* === Search === */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, username, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* === Table === */}
      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb]">
              <tr className="border-t-2 border-t-gray-200 p-2">
                {[
                  "Full Name",
                  "Username",
                  "Email",
                  "Contact",
                  "Aadhar",
                  "License",
                  "Status",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="px-5 py-2 text-left text-sm">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedExecutives.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No field executives found
                  </td>
                </tr>
              ) : (
                paginatedExecutives.map((exec) => (
                  <tr
                    key={exec._id}
                    onClick={() => handleEdit(exec)}
                    className="cursor-pointer transition-colors border border-gray-200 bg-white hover:bg-gray-100"
                  >
                    <td className="px-6 py-2 text-sm font-medium">
                      {exec.fullName}
                    </td>
                    <td className="px-6 py-2 text-sm">{exec.username}</td>
                    <td className="px-6 py-2 text-sm">{exec.email}</td>
                    <td className="px-6 py-2 text-sm">{exec.contactNumber}</td>
                    <td className="px-6 py-2 text-sm">{exec.aadharNumber}</td>
                    <td className="px-6 py-2 text-sm">
                      {exec.drivingLicenseNumber}
                    </td>
                    <td className="px-6 py-2 text-sm">
                      {exec.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <XCircle size={14} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-2 text-sm">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(exec._id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* === Pagination === */}

        <div className="px-2 sm:px-6 py-2 flex items-center justify-between border-t bg-white">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredExecutives.length)} of{" "}
            {filteredExecutives.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border transition-all disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border transition-all disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border transition-all disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border transition-all disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

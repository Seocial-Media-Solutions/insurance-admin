import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { fieldExecutiveService } from "../../services/fieldExecutiveService";
import Pagination from "../../components/Ui/Pagination";

export default function FieldExecutiveList() {
  const [fieldExecutives, setFieldExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const navigate = useNavigate();

  // === Fetch page of field executives ===
  const fetchExecutives = async (page = 1) => {
    setLoading(true);
    try {
      const data = await fieldExecutiveService.getAll({ page, limit });
      if (data.success) {
        setFieldExecutives(data.data);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setCurrentPage(data.currentPage || page);
      } else {
        toast.error("Failed to fetch executives");
      }
    } catch (err) {
      toast.error("Error loading executives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutives(1);
  }, []);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchExecutives(page);
    }
  };

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
                  `https://insurance-backend-hvk0.onrender.com/api/field-executives/${id}`,
                  { method: "DELETE" }
                );
                const result = await res.json();
                if (result.success) {
                  toast.success("Executive deleted");
                  fetchExecutives(currentPage);
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

  // Client-side search filter on current page data
  const filteredExecutives = fieldExecutives.filter((e) => {
    const query = search.toLowerCase();
    return (
      e.fullName?.toLowerCase().includes(query) ||
      e.username?.toLowerCase().includes(query) ||
      e.email?.toLowerCase().includes(query)
    );
  });

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
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredExecutives.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No field executives found
                  </td>
                </tr>
              ) : (
                filteredExecutives.map((exec) => (
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={goToPage}
        />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Pagination from "../../components/Ui/Pagination";
import { useGlobalSearch } from "../../context/SearchContext";
import { useFieldExecutives } from "../../context/FieldExecutiveContext";
import { confirmToast } from "../../components/Ui/ConfirmToast";
import TableSkeleton from "../../components/Ui/TableSkeleton";

export default function FieldExecutiveList() {
  const { 
    executives: fieldExecutives, 
    loading, 
    loadExecutives, 
    currentPage, 
    totalPages, 
    total, 
    limit, 
    goToPage, 
    deleteExecutive 
  } = useFieldExecutives();
  const { globalSearch } = useGlobalSearch();
  const navigate = useNavigate();

  // === Sync search with context ===
  useEffect(() => {
    loadExecutives(1, globalSearch);
  }, [globalSearch]);

  // === Delete executive ===
  const handleDelete = async (id) => {
    confirmToast("Are you sure you want to delete this field executive?", async () => {
      try {
        await toast.promise(deleteExecutive(id), {
          loading: 'Deleting executive...',
          success: 'Executive deleted successfully',
          error: (err) => err?.message || 'Failed to delete executive'
        });
      } catch (err) {
        console.error(err);
      }
    });
  };

  // === Edit executive ===
  const handleEdit = (exec) => {
    navigate(`/field-executives/edit/${exec._id}`);
  };

  return (
    <div className="min-h-screen max-w-full mx-auto">

      {/* === Header === */}
     <button
          onClick={() => navigate("/field-executives/add")}
          className="flex  fixed bottom-5 right-5 items-center gap-2 px-6 py-3 rounded-lg shadow-md bg-black text-white hover:bg-gray-800 transition"
        >
          <UserPlus size={20} /> Add New Executive
        </button>



      {loading ? (
        <TableSkeleton columns={8} rows={limit || 10} />
      ) : (
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
                {fieldExecutives.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No field executives found
                    </td>
                  </tr>
                ) : (
                    fieldExecutives.map((exec) => (
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
        </div>
      )}

        {/* === Pagination === */}
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

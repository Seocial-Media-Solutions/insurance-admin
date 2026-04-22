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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
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
                    <th key={head} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {fieldExecutives.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No field executives found
                    </td>
                  </tr>
                ) : (
                  fieldExecutives.map((exec) => (
                    <tr
                      key={exec._id}
                      onClick={() => handleEdit(exec)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {exec.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exec.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exec.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{exec.contactNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exec.aadharNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 uppercase">{exec.drivingLicenseNumber}</td>
                      <td className="px-6 py-4 text-sm">
                        {exec.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-green-100 text-green-700">
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-red-100 text-red-700">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
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

          {/* Mobile View */}
          <div className="md:hidden grid grid-cols-1 gap-4 p-4 bg-gray-50">
            {fieldExecutives.length === 0 ? (
              <div className="py-20 text-center text-gray-500 bg-white rounded-lg">
                No field executives found
              </div>
            ) : (
              fieldExecutives.map((exec) => (
                <div 
                  key={exec._id} 
                  onClick={() => handleEdit(exec)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-gray-900 text-sm uppercase">{exec.fullName}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{exec.username}</p>
                    </div>
                    {exec.isActive ? (
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-green-100 text-green-700 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-red-100 text-red-700 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Contact</p>
                      <p className="text-xs font-bold text-gray-900 font-mono">{exec.contactNumber || "--"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">License</p>
                      <p className="text-xs font-bold text-gray-900 uppercase">{exec.drivingLicenseNumber || "--"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Email</p>
                      <p className="text-[10px] font-medium text-gray-600 truncate max-w-[180px]">{exec.email}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(exec._id);
                      }}
                      className="p-2 bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
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

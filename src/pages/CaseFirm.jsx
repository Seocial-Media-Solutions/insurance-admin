import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useFirms } from "../context/FirmContext";
import Pagination from "../components/Ui/Pagination";
import TableSkeleton from "../components/Ui/TableSkeleton";
import {
  CASE_FIRM_INITIAL_STATE,
  CASE_FIRM_FIELDS,
  firmToFormData,
} from "../utils/caseFirmForm.utils";
import { INDIAN_STATES, STATE_CITIES } from "../utils/indianStates";
import { useGlobalSearch } from "../context/SearchContext";

function CaseFirmPage() {
  const {
    firms,
    loading,
    addFirm,
    updateFirm,
    deleteFirm,
    currentPage,
    totalPages,
    total,
    limit,
    loadFirms,
    goToPage,
    initialized,
  } = useFirms();
  const { globalSearch } = useGlobalSearch();

  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ ...CASE_FIRM_INITIAL_STATE });
  const [editingId, setEditingId] = useState(null);

  // Data fetching is handled by the context's loadFirms method
  useEffect(() => {
    loadFirms(currentPage, globalSearch);
  }, [currentPage, globalSearch, loadFirms]);

  useEffect(() => {
    if (location.state?.openAddFirm) {
      handleOpenDrawer();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setFormData({ ...CASE_FIRM_INITIAL_STATE });
    setEditingId(null);
  };

  const handleOpenDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    resetForm();
    setIsDrawerOpen(false);
  };

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const success = editingId
        ? await updateFirm(editingId, formData)
        : await addFirm(formData);
      if (success) handleCloseDrawer();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (firm) => {
    setFormData(firmToFormData(firm));
    setEditingId(firm._id);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="p-4 bg-white">
          <p className="font-bold text-gray-900 border-b pb-2 mb-3">Confirm Deletion</p>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to permanently delete this firm record?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await deleteFirm(id);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
            >
              Delete Firm
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: { padding: 0, borderRadius: '4px', overflow: 'hidden' }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex justify-between items-end border-b border-gray-300 pb-4">
          <div>
            {/* <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Case Firms</h1> */}
            <p className="text-sm text-gray-500">Manage agency partners and firm codes</p>
          </div>
          <button
            onClick={handleOpenDrawer}
            className={`${isDrawerOpen ? " hidden " : " sm:flex"} items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded hover:bg-gray-800 transition shadow-sm z-99`}
          >
            <Plus size={18} />
            <span>New Firm</span>
          </button>
          <button
            onClick={handleOpenDrawer}
            className="sm:hidden fixed right-4 bottom-4 w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center shadow-lg z-50"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {loading ? (
            <TableSkeleton columns={7} rows={10} />
          ) : firms.length === 0 ? (
            <div className="py-20 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-300" />
               </div>
               <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No firm records found</p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">
                      <th className="px-6 py-5">Firm Name</th>
                      <th className="px-6 py-5">City</th>
                      <th className="px-6 py-5">Regional Office</th>
                      <th className="px-6 py-5">Operation</th>
                      <th className="px-6 py-5">FY</th>
                      <th className="px-6 py-5">Firm Code</th>
                      <th className="px-6 py-5 text-right">Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {firms.map((firm) => (
                      <tr
                        key={firm._id}
                        className="hover:bg-blue-50/30 transition-all group"
                      >
                        <td className="px-6 py-5">
                          <p className="font-black text-gray-900 uppercase tracking-tight">
                            {firm.name || firm.recipientCompany || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-bold text-xs uppercase">
                          {firm.city || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-[11px] font-medium italic">
                          {firm.regionalOffice || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-widest">
                            {firm.operationType || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-black text-[11px]">
                          {firm.financialYear || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-tighter">
                            {firm.code || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <button
                              onClick={() => handleEdit(firm)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(firm._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-gray-50">
                {firms.map((firm) => (
                  <div key={firm._id} className="p-5 active:bg-gray-50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                         <h3 className="font-black text-gray-900 uppercase tracking-tight leading-tight mb-1">
                           {firm.name || firm.recipientCompany || "—"}
                         </h3>
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{firm.code || "—"}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{firm.city || "—"}</span>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(firm)}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 active:bg-blue-600 active:text-white transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(firm._id)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 active:bg-red-600 active:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Regional Office</p>
                          <p className="text-[10px] font-bold text-gray-700 truncate">{firm.regionalOffice || "—"}</p>
                       </div>
                       <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Type / FY</p>
                          <p className="text-[10px] font-bold text-gray-700">
                            {firm.operationType || "—"} • {firm.financialYear || "—"}
                          </p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination Bar */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <span>Total Records: {total}</span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={goToPage}
            />
          </div>
        </div>
      </div>

      {/* Slide-out Panel */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-gray-900/30"
            onClick={handleCloseDrawer}
          />
          <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Update Firm Details" : "Record New Firm"}
                </h2>
                <p className="text-xs text-gray-500">Enter information accurately</p>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} id="firm-form" className="grid grid-cols-2 gap-4">
                {CASE_FIRM_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className={`${field.type === "textarea" ? "col-span-2" : "col-span-2 sm:col-span-1"}`}
                  >
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        value={formData[field.key]}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                        rows={3}
                        required={field.required}
                      />
                    ) : field.type === "select" && field.key === "state" ? (
                      <select
                        value={formData[field.key]}
                        onChange={(e) => {
                          setField(field.key, e.target.value);
                          setField("city", "");
                        }}
                        className="w-full p-2.5 border border-gray-300 rounded bg-white text-sm focus:ring-1 focus:ring-gray-900"
                        required={field.required}
                      >
                        <option value="" disabled>Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : field.type === "select" && field.key === "city" ? (
                      <select
                        value={formData[field.key]}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded bg-white text-sm disabled:bg-gray-50"
                        required={field.required}
                        disabled={!formData.state}
                      >
                        <option value="" disabled>Select city</option>
                        {(STATE_CITIES[formData.state] || []).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 text-sm"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </form>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                form="firm-form"
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-gray-900 rounded hover:bg-black transition"
              >
                {editingId ? "Update Firm" : "Save Firm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseFirmPage;

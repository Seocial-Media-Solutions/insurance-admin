import React, { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useFirms } from "../context/FirmContext";
import Pagination from "../components/Ui/Pagination";
import {
  CASE_FIRM_INITIAL_STATE,
  CASE_FIRM_FIELDS,
  firmToFormData,
} from "../utils/caseFirmForm.utils";

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
    goToPage,
  } = useFirms();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ ...CASE_FIRM_INITIAL_STATE });
  const [editingId, setEditingId] = useState(null);

  /* ---- helpers ---- */
  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setFormData({ ...CASE_FIRM_INITIAL_STATE });
    setEditingId(null);
  };

  /* ---- drawer ---- */
  const handleOpenDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    resetForm();
    setIsDrawerOpen(false);
  };

  /* ---- submit ---- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = editingId
      ? await updateFirm(editingId, formData)
      : await addFirm(formData);
    if (success) handleCloseDrawer();
  };

  /* ---- edit ---- */
  const handleEdit = (firm) => {
    setFormData(firmToFormData(firm));
    setEditingId(firm._id);
    setIsDrawerOpen(true);
  };

  /* ---- delete ---- */
  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 pointer-events-auto">
          <div>
            <p className="font-semibold text-gray-900">Delete Case Firm?</p>
            <p className="text-sm text-gray-600 mt-1">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await deleteFirm(id);
              }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: { zIndex: 9999, pointerEvents: "auto" },
      }
    );
  };

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div
      className="min-h-screen px-4 py-8 md:px-6 md:py-10 relative overflow-hidden"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-8xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            Case Firms
          </h1>
          <button
            onClick={handleOpenDrawer}
            className="px-4 py-2 rounded-lg flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Add Firm</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>

        {/* Table Section */}
        <div
          className="rounded-xl border shadow-lg p-4 md:p-6 h-full flex flex-col w-full"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">All Case Firms</h2>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : firms.length === 0 ? (
            <p>No Case Firms Found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--border)" }}>
                    <th className="p-3 text-left whitespace-nowrap">Name</th>
                    <th className="p-3 text-left whitespace-nowrap">City</th>
                    <th className="p-3 text-left whitespace-nowrap">Regional Office</th>
                    <th className="p-3 text-left whitespace-nowrap">Operation Type</th>
                    <th className="p-3 text-left whitespace-nowrap">Financial Year</th>
                    <th className="p-3 text-left whitespace-nowrap">Generated Code</th>
                    <th className="p-3 text-left whitespace-nowrap">Recipient Company</th>
                    <th className="p-3 text-left whitespace-nowrap">Recipient Designation</th>
                    <th className="p-3 text-left whitespace-nowrap">Recipient Dept.</th>
                    <th className="p-3 text-left whitespace-nowrap">Recipient Address</th>
                    <th className="p-3 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {firms.map((firm) => (
                    <tr key={firm._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="p-3 whitespace-nowrap font-medium">{firm.name || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{firm.city || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{firm.regionalOffice || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{firm.operationType || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{firm.financialYear || "—"}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-mono text-xs">
                          {firm.code || "—"}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">{firm.recipientCompany || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{firm.recipientDesignation || "—"}</td>
                      <td className="p-3 whitespace-nowrap">{firm.recipientDepartment || "—"}</td>
                      <td className="p-3 max-w-[180px] truncate" title={firm.recipientAddress}>{firm.recipientAddress || "—"}</td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          <button
                            className="text-blue-500 hover:text-blue-700 transition"
                            onClick={() => handleEdit(firm)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 transition"
                            onClick={() => handleDelete(firm._id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={goToPage}
          />
        </div>
      </div>

      {/* ---- Right Side Drawer ---- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Drawer Panel */}
          <div
            className="relative w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out"
            style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Case Firm" : "Add New Case Firm"}
              </h2>
              <button
                onClick={handleCloseDrawer}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dynamic Form — driven by CASE_FIRM_FIELDS util */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {CASE_FIRM_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-sm font-medium opacity-70">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => setField(field.key, e.target.value)}
                      className="w-full p-3 rounded-md border bg-transparent resize-none"
                      rows={field.rows || 3}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) => setField(field.key, e.target.value)}
                      className="w-full p-3 rounded-md border bg-transparent"
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="flex-1 px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 rounded-lg flex items-center justify-center gap-2 text-white"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <Plus className="w-5 h-5" />
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseFirmPage;

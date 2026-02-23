import React, { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { confirmToast } from "../components/Ui/ConfirmToast";
import { useFirms } from "../context/FirmContext";

function CaseFirmPage() {
  const { firms, loading, addFirm, updateFirm, deleteFirm } = useFirms();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form data — backend requires 5 fields
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    regionalOffice: "",
    operationType: "",
    financialYear: "",
  });

  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      regionalOffice: "",
      operationType: "",
      financialYear: "",
    });
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

  // Create or Update CaseFirm
  const handleSubmit = async (e) => {
    e.preventDefault();

    let success = false;
    if (editingId) {
      success = await updateFirm(editingId, formData);
    } else {
      success = await addFirm(formData);
    }

    if (success) {
      handleCloseDrawer();
    }
  };

  // Edit handler
  const handleEdit = (firm) => {
    setFormData({
      name: firm.name,
      city: firm.city,
      regionalOffice: firm.regionalOffice || "",
      operationType: firm.operationType || "",
      financialYear: firm.financialYear || "",
    });

    setEditingId(firm._id);
    setIsDrawerOpen(true);
  };

  // Delete handler
  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 pointer-events-auto">
        <div>
          <p className="font-semibold text-gray-900">Delete Case Firm?</p>
          <p className="text-sm text-gray-600 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
            }}
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
    ), {
      duration: Infinity,
      position: "top-center",
      style: {
        zIndex: 9999, // Ensure it's on top
        pointerEvents: 'auto', // Force pointer events
      }
    });
  };

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
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "var(--border)" }}>
                    <th className="p-3 text-left whitespace-nowrap">Name</th>
                    <th className="p-3 text-left whitespace-nowrap">City</th>
                    <th className="p-3 text-left whitespace-nowrap">Generated Code</th>
                    <th className="p-3 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {firms.map((firm) => (
                    <tr key={firm._id} className="border-b">
                      <td className="p-3 whitespace-nowrap">{firm.name}</td>
                      <td className="p-3 whitespace-nowrap">{firm.city}</td>
                      <td className="p-3 whitespace-nowrap">{firm.code}</td>
                      <td className="p-3 flex gap-4">
                        <button
                          className="text-blue-500 hover:text-blue-700 transition"
                          onClick={() => handleEdit(firm)}
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          className="text-red-500 hover:text-red-700 transition"
                          onClick={() => handleDelete(firm._id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Drawer Panel */}
          <div
            className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out"
            style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
          >
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

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium opacity-70">Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-md border bg-transparent"
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-sm font-medium opacity-70">City</label>
                <input
                  type="text"
                  placeholder="Enter City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-3 rounded-md border bg-transparent"
                  required
                />
              </div>

              {/* Regional Office */}
              <div className="space-y-1">
                <label className="text-sm font-medium opacity-70">Regional Office</label>
                <input
                  type="text"
                  placeholder="Enter Regional Office (Ex: NIA-RO)"
                  value={formData.regionalOffice}
                  onChange={(e) =>
                    setFormData({ ...formData, regionalOffice: e.target.value })
                  }
                  className="w-full p-3 rounded-md border bg-transparent"
                  required
                />
              </div>

              {/* Operation Type */}
              <div className="space-y-1">
                <label className="text-sm font-medium opacity-70">Operation Type</label>
                <input
                  type="text"
                  placeholder="Enter Operation Type (Ex: OD)"
                  value={formData.operationType}
                  onChange={(e) =>
                    setFormData({ ...formData, operationType: e.target.value })
                  }
                  className="w-full p-3 rounded-md border bg-transparent"
                  required
                />
              </div>

              {/* Financial Year */}
              <div className="space-y-1">
                <label className="text-sm font-medium opacity-70">Financial Year</label>
                <input
                  type="text"
                  placeholder="Enter Financial Year (Ex: 24-25)"
                  value={formData.financialYear}
                  onChange={(e) =>
                    setFormData({ ...formData, financialYear: e.target.value })
                  }
                  className="w-full p-3 rounded-md border bg-transparent"
                  required
                />
              </div>

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

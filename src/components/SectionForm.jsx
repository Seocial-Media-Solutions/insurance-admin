import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DragDropUpload from "./Ui/DragDropUpload";
import { API } from "../../utils/api";
const API_BASE = API;
/* ---------------------------------------------------
   HELPER: Format camelCase to Title Case
--------------------------------------------------- */
const formatLabel = (str) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

/* ---------------------------------------------------
   HELPER: Determine Input Type
--------------------------------------------------- */
const getInputType = (fieldName) => {
  const lower = fieldName.toLowerCase();

  if (lower.includes("date") || lower.includes("dob")) return "date";

  if (
    lower.includes("details") ||
    lower.includes("description") ||
    lower.includes("opinion") ||
    lower.includes("narration") ||
    lower.includes("statement") ||
    lower.includes("address") ||
    lower.includes("particulars") ||
    lower.includes("record")
  ) {
    return "textarea";
  }

  return "text";
};

export default function SectionUnit({
  title,
  caseType,
  caseId,
  routePath,
  fieldsObj,
  form,
  setForm,
  fileFields = {},
  sectionKeyProp,
  sectionKey: explicitSectionKey // Alias for backward compatibility/clarity
}) {
  const normalize = (val) =>
    typeof val === "string" ? val.replace(/-/g, "").toLowerCase() : "";

  const normalizedRoute = normalize(routePath);

  // Fallback: try to find sectionKey from form keys if not provided
  // Priority: sectionKey prop > sectionKeyProp > derived from route
  const sectionKey = explicitSectionKey || sectionKeyProp || Object.keys(form).find(
    (key) => normalize(key) === normalizedRoute
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ---------------------------------------------------
      UPDATE FIELD
  --------------------------------------------------- */
  const updateField = (field, value) => {
    if (!sectionKey) {
      console.error(`Could not find section key for route ${routePath}`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));

    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  /* ---------------------------------------------------
      VALIDATION
  --------------------------------------------------- */
  const validate = () => {
    const newErrors = {};
    if (!sectionKey || !form[sectionKey]) return false;

    Object.keys(fieldsObj).forEach((field) => {
      // Skip file fields (handled separately or optional)
      if (fileFields[field]) return;

      const value = form[sectionKey][field];
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[field] = `${formatLabel(field)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------------------------------------------
      SUBMIT FUNCTION
  --------------------------------------------------- */
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill all required fields in this section.");
      return;
    }

    setLoading(true);

    try {
      if (!sectionKey) throw new Error("Section configuration error: Key not found");

      const url = `${API_BASE}/${caseType}-cases/${caseId}/${routePath}`;
      const sectionData = form[sectionKey];
      const hasFiles = Object.keys(fileFields).length > 0;

      let res;

      if (hasFiles) {
        const fd = new FormData();

        // Add non-file fields
        Object.entries(sectionData).forEach(([key, val]) => {
          if (!fileFields[key]) fd.append(key, val ?? "");
        });

        // Add file fields
        Object.entries(sectionData).forEach(([key, val]) => {
          if (!fileFields[key]) return;
          if (!val) return; // Skip empty/null files

          // Backend expects simple keys for files in this specific controller setup
          // or flattened keys.
          if (Array.isArray(val)) {
            val.forEach((f) => fd.append(key, f));
          } else {
            fd.append(key, val);
          }
        });

        res = await axios.patch(url, fd);
      } else {
        res = await axios.patch(url, sectionData);
      }

      toast.success("Saved Successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Save Failed");
    }

    setLoading(false);
  };

  /* ---------------------------------------------------
      RENDER
  --------------------------------------------------- */
  if (!sectionKey) {
    return <div className="p-4 text-red-500">Error: Could not map route {routePath} to form state.</div>;
  }

  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm mb-8">
      {/* SECTION TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wide">
          {sectionKey}
        </span>
      </div>

      {Object.keys(fieldsObj).length === 0 ? (
        <p className="text-gray-400 italic">No fields configured for this section.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(fieldsObj).map((field) => {
            const isFile = !!fileFields[field];
            const type = getInputType(field);
            const error = errors[field];


            if (isFile) {
              return (
                <div key={field} className={fileFields[field] === "multiple" ? "col-span-1 md:col-span-2 lg:col-span-3" : "col-span-1"}>
                  <DragDropUpload
                    id={`${sectionKey}-${field}`}
                    accept="image/*"
                    multiple={fileFields[field] === "multiple"}
                    value={form[sectionKey]?.[field]}
                    isOptional={true}
                    title={formatLabel(field)}
                    onChange={(e) => {
                      const files = e.target.files;

                      // If files is null or empty, it's a removal operation
                      if (!files || files.length === 0) {
                        updateField(field, fileFields[field] === "multiple" ? [] : null);
                        return;
                      }

                      // If files is already an array (from remove operation), just set it
                      if (Array.isArray(files)) {
                        updateField(field, files);
                        return;
                      }

                      // Otherwise, it's a new file selection - append to existing
                      const newFiles = Array.from(files);
                      updateField(
                        field,
                        fileFields[field] === "multiple"
                          ? [...(form[sectionKey]?.[field] || []), ...newFiles]
                          : newFiles[0]
                      );
                    }}
                  />
                </div>
              );
            }

            return (
              <div key={field} className={type === "textarea" ? "col-span-1 md:col-span-2 lg:col-span-3" : ""}>
                <label className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700">
                      {formatLabel(field)} <span className="text-red-500">*</span>
                    </span>
                  </div>

                  {type === "textarea" ? (
                    <textarea
                      className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      rows={3}
                      value={form[sectionKey]?.[field] || ""}
                      onChange={(e) => updateField(field, e.target.value)}
                      placeholder={`Enter ${formatLabel(field)}...`}
                    />
                  ) : (
                    <input
                      type={type}
                      className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      value={form[sectionKey]?.[field] || ""}
                      onChange={(e) => updateField(field, e.target.value)}
                      placeholder={type === 'date' ? '' : `Enter ${formatLabel(field)}`}
                    />
                  )}

                  {error && (
                    <span className="text-xs text-red-500 mt-1 block font-medium">
                      {error}
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors flex items-center ${loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Section"
          )}
        </button>
      </div>
    </div>
  );
}

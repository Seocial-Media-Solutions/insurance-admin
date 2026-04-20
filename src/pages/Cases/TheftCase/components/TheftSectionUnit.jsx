import React, { useState } from "react";
import { useUpdateTheftCaseSection } from "../../../../hooks/useTheftCases"; // Use correct hook
import { formatLabel, getInputType, getNestedValue, setNestedValue, cleanNumericInput } from "../../../../utils/odCaseHelpers";
import TheftImageGallery from "./TheftImageGallery";
import TheftDocumentUpload from "./TheftDocumentUpload";
import DragDropUpload from "../../../../components/Ui/DragDropUpload";
import { toast } from "react-hot-toast";
import { ChevronDown, ChevronUp } from "lucide-react";

function SectionUnit({
    id,
    caseId,
    apiPath,
    sectionKey,
    fieldsObj,
    form,
    setForm,
    fileFields = {},
    defaultFieldValues = {},
    isExpanded,
    onToggle,
    firmData,
}) {
    const [errors, setErrors] = useState({});
    const [fileMetadata, setFileMetadata] = useState({}); // Track metadata for file fields

    // Use correct mutation
    const { mutateAsync: updateSection, isLoading: loading } = useUpdateTheftCaseSection({
        onSuccess: () => {
            setFileMetadata({}); // Clear metadata on success
        },
    });

    const handleRefreshFromFirm = () => {
        if (!firmData) {
            toast.error("No firm data available to refresh.");
            return;
        }

        setForm((prev) => ({
            ...prev,
            letterDetails: {
                ...prev.letterDetails,
                referenceNumber: firmData.code || "",
                recipientDesignation: firmData.recipientDesignation || "",
                recipientDepartment: firmData.recipientDepartment || "",
                recipientCompany: firmData.recipientCompany || "",
                recipientAddress: firmData.recipientAddress || "",
            }
        }));
        toast.success("Letter details updated from firm data.");
    };

    const updateField = (field, value) => {
        setForm((prev) => {
            const newForm = { ...prev };
            const currentSection = getNestedValue(newForm, sectionKey) || {};
            const updatedSection = { ...currentSection, [field]: value };
            return setNestedValue(newForm, sectionKey, updatedSection);
        });

        // Clear error on change
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        // Validation removed as per user request to make all fields optional
        setErrors({});
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error("Please fill all required fields in this section.");
            return;
        }

        const data = getNestedValue(form, sectionKey);
        const hasFiles = Object.keys(fileFields).length > 0;

        let formData;

        if (hasFiles) {
            const fd = new FormData();

            // Non-file fields
            Object.entries(data).forEach(([key, val]) => {
                if (!fileFields[key]) fd.append(key, val ?? "");
            });

            // File fields
            Object.entries(data).forEach(([key, val]) => {
                if (!fileFields[key]) return;
                if (!val) return; // Skip empty files

                const fieldName = `${sectionKey}.${key}`;

                if (Array.isArray(val)) {
                    val.forEach((f) => fd.append(fieldName, f));
                } else {
                    fd.append(fieldName, val);
                }
            });

            // Append metadata if available
            if (Object.keys(fileMetadata).length > 0) {
                fd.append('imageMetadata', JSON.stringify(fileMetadata));
            }

            formData = fd;
        } else {
            formData = data;
        }

        // Use toast.promise with mutateAsync
        await toast.promise(
            updateSection({
                caseId,
                sectionPath: apiPath,
                formData,
            }),
            {
                loading: "Saving...",
                success: "Section saved successfully!",
                error: (err) => err.response?.data?.message || err.message || "Save failed",
            }
        );
    };

    // Safety check for fieldsObj
    if (!fieldsObj || typeof fieldsObj !== 'object') {
        return null;
    }

    return (
        <div id={id} className={`scroll-mt-48 border rounded-xl bg-white shadow-sm mb-8 transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-100' : ''}`}>
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors rounded-t-xl"
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {formatLabel(sectionKey)}
                        </span>
                    </div>

                    {/* Refresh Button for Letter Details */}
                    {sectionKey === "letterDetails" && isExpanded && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRefreshFromFirm();
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-bold transition-all border border-blue-200 uppercase tracking-wider"
                            title="Re-fill from Firm Data"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            Sync From Firm
                        </button>
                    )}
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wide">
                    {sectionKey}
                </span>
            </button>

            {/* Collapsible Content */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.keys(fieldsObj || {}).map((field) => {
                            const fileConfig = fileFields[field];
                            const isFile = !!fileConfig;
                            const type = getInputType(field);
                            const error = errors[field];
                            const currentSection = getNestedValue(form, sectionKey) || {};

                            if (field === "riskCoverPeriod") {
                                const currentVal = currentSection[field] || "";
                                const [fromStr, toStr] = currentVal.includes(" to ") ? currentVal.split(" to ") : ["", ""];

                                // Convert DD/MM/YYYY to YYYY-MM-DD for input
                                const toInputDate = (str) => {
                                    if (!str) return "";
                                    const parts = str.trim().split("/");
                                    if (parts.length !== 3) return "";
                                    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                                };

                                // Convert YYYY-MM-DD to DD/MM/YYYY for saving
                                const toStringDate = (val) => {
                                    if (!val) return "";
                                    const parts = val.split("-");
                                    if (parts.length !== 3) return "";
                                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                };

                                return (
                                    <div key={field} className="col-span-1 md:col-span-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Risk Cover Period</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="date"
                                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        value={toInputDate(fromStr)}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (!val) {
                                                                updateField(field, "");
                                                                return;
                                                            }
                                                            const newFrom = toStringDate(val);
                                                            
                                                            // Auto-calculate end date (1 year - 1 day)
                                                            const startDate = new Date(val);
                                                            const endDate = new Date(startDate);
                                                            endDate.setFullYear(startDate.getFullYear() + 1);
                                                            endDate.setDate(startDate.getDate() - 1);
                                                            
                                                            const ey = endDate.getFullYear();
                                                            const em = String(endDate.getMonth() + 1).padStart(2, '0');
                                                            const ed = String(endDate.getDate()).padStart(2, '0');
                                                            const newTo = toStringDate(`${ey}-${em}-${ed}`);
                                                            updateField(field, `${newFrom} to ${newTo}`);
                                                        }}
                                                    />
                                                    <span className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-bold text-indigo-500 uppercase">Starts</span>
                                                </div>
                                                <span className="text-gray-400 font-bold">→</span>
                                                <div className="flex-1 relative border-none">
                                                    <input
                                                        type="date"
                                                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50"
                                                        value={toInputDate(toStr)}
                                                        onChange={(e) => {
                                                            const newTo = toStringDate(e.target.value);
                                                            updateField(field, `${fromStr || ""} to ${newTo || ""}`);
                                                        }}
                                                    />
                                                    <span className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-bold text-indigo-500 uppercase">Ends</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (isFile) {
                                // Get existing uploaded images from fieldsObj (API data)
                                const existingImages = fieldsObj[field];
                                const isWitnessDoc = field === "witnessDocumentFront" || field === "witnessDocumentBack";

                                return (
                                    <div key={field} className={fileConfig === "multiple" ? "col-span-1 md:col-span-2 lg:col-span-3" : "col-span-1"}>

                                        {isWitnessDoc ? (
                                            <TheftDocumentUpload
                                                field={field}
                                                title={formatLabel(field)}
                                                value={currentSection[field]}
                                                onMetadataChange={(metadata) => {
                                                    setFileMetadata(prev => ({
                                                        ...prev,
                                                        [field]: metadata
                                                    }));
                                                }}
                                                onUpload={(e) => {
                                                    const files = e.target.files;
                                                    if (!files || files.length === 0) {
                                                        updateField(field, null);
                                                        return;
                                                    }
                                                    updateField(field, files[0]);
                                                }}
                                            />
                                        ) : (
                                            <DragDropUpload
                                                id={`${sectionKey}-${field}`}
                                                accept="image/*"
                                                multiple={fileConfig === "multiple" || fileConfig === "max-2"}
                                                value={currentSection[field]}
                                                isOptional={true}
                                                title={formatLabel(field)}
                                                limit={fileConfig === "max-2" ? 2 : (fileConfig === "max-1" ? 1 : null)}
                                                onMetadataChange={(metadata) => {
                                                    setFileMetadata(prev => ({
                                                        ...prev,
                                                        [field]: metadata
                                                    }));
                                                }}
                                                onChange={(e) => {
                                                    const files = e.target.files;

                                                    // If files is null or empty, it's a removal operation
                                                    if (!files || files.length === 0) {
                                                        updateField(field, fileConfig === "multiple" ? [] : null);
                                                        return;
                                                    }

                                                    // If files is already an array (from remove operation), just set it
                                                    if (Array.isArray(files)) {
                                                        updateField(field, files);
                                                        return;
                                                    }

                                                    // Otherwise, it's a new file selection - append to existing
                                                    const newFiles = Array.from(files);

                                                    // Check max limit
                                                    if (fileConfig === "max-2") {
                                                        const currentCount = Array.isArray(currentSection[field]) ? currentSection[field].length : (currentSection[field] ? 1 : 0);
                                                        if (currentCount + newFiles.length > 2) {
                                                            toast.error("Maximum 2 photos allowed");
                                                            return;
                                                        }
                                                    }

                                                    updateField(
                                                        field,
                                                        (fileConfig === "multiple" || fileConfig === "max-2")
                                                            ? [...(currentSection[field] || []), ...newFiles]
                                                            : newFiles[0]
                                                    );
                                                }}
                                            />
                                        )}

                                        {/* Display existing uploaded images */}
                                        {existingImages && (
                                            <TheftImageGallery
                                                images={existingImages}
                                                title={formatLabel(field)}
                                                caseId={caseId}
                                                sectionPath={apiPath}
                                                fieldName={field}
                                            />
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div key={field} className={type === "textarea" ? "col-span-1 md:col-span-2 lg:col-span-3" : ""}>
                                    <label className="block">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {formatLabel(field)}
                                            </span>
                                        </div>

                                        {type === "textarea" ? (
                                            <textarea
                                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"
                                                    }`}
                                                rows={3}
                                                value={currentSection[field] || ""}
                                                onChange={(e) => updateField(field, e.target.value)}
                                                placeholder={`Enter ${formatLabel(field)}...`}
                                            />
                                        ) : (
                                            <input
                                                type={type}
                                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"
                                                    }`}
                                                value={type === 'date' ? (() => {
                                                    const val = currentSection[field] || "";
                                                    if (!val) return "";
                                                    const parts = val.split("/");
                                                    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                                                    return val; // Fallback if already in wrong format
                                                })() : (currentSection[field] || (field === 'referenceNumber' ? defaultFieldValues?.referenceNumber : "") || "")}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (type === 'date' && val) {
                                                        const parts = val.split("-");
                                                        if (parts.length === 3) {
                                                            val = `${parts[2]}/${parts[1]}/${parts[0]}`;
                                                        }
                                                    } else if (field.toLowerCase().includes("latitude") || field.toLowerCase().includes("longitude")) {
                                                        val = cleanNumericInput(val);
                                                    }
                                                    updateField(field, val);
                                                }}
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

                    <div className="mt-6 flex justify-end pb-2">
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
            </div>
        </div>
    );
}

export default SectionUnit;

import React, { useState, useRef } from "react";
import { useUpdateODCaseSection, useODCase } from "../../../../hooks/useODCases";
import { odCaseApi } from "../../../../services/api";
import { formatLabel, getInputType, getNestedValue, setNestedValue, cleanNumericInput } from "../../../../utils/odCaseHelpers";
import ImageGallery from "./ImageGallery";
import DocumentUpload from "./DocumentUpload";
import DragDropUpload from "../../../../components/Ui/DragDropUpload";
import { toast } from "react-hot-toast";
import { Trash2, ChevronDown, ChevronUp, CreditCard, FileText, Shield ,Loader2 } from "lucide-react";
import { INDIAN_STATES, STATE_CITIES } from "../../../../utils/indianStates";
import { confirmToast } from "../../../../components/Ui/ConfirmToast";

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
    readonlyFields = []
}) {
    const [errors, setErrors] = useState({});
    const [fileMetadata, setFileMetadata] = useState({}); // Track metadata for file fields
    const [isSaving, setIsSaving] = useState(false);
    const submittingRef = useRef(false);
    // Use TanStack Query mutation (v5: isLoading → isPending)
    const { mutateAsync: updateSection, isPending: mutationPending } = useUpdateODCaseSection({
        onSuccess: () => {
            setFileMetadata({}); // Clear metadata on success
        },
        onError: () => {
            // Suppress default error toast, handled by toast.promise
        }
    });

    // Combined loading flag: mutation in-flight OR local submit guard
    const loading = mutationPending || isSaving;

    // Wrap handleSubmit calls so isSaving is always toggled
    const withSaving = async (fn) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            return await fn();
        } finally {
            setIsSaving(false);
        }
    };


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
        if (readonlyFields.includes(field)) return;
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
        // Validation removed as per user request
        setErrors({});
        return true;
    };


    //     if (!validate()) {
    //         toast.error("Please fill all required fields in this section.");
    //         return;
    //     }

    //     // Clone data to avoid mutating state
    //     const data = { ...getNestedValue(form, sectionKey) };

    //     // Merge default values if missing
    //     if (defaultFieldValues) {
    //         Object.keys(defaultFieldValues).forEach(key => {
    //             if (!data[key]) {
    //                 data[key] = defaultFieldValues[key];
    //             }
    //         });
    //     }

    //     const hasFiles = Object.keys(fileFields).length > 0;

    //     let formData;

    //     if (hasFiles) {
    //         const fd = new FormData();

    //         // Non-file fields
    //         Object.entries(data).forEach(([key, val]) => {
    //             if (!fileFields[key]) {
    //                 // Handle nested objects and arrays (like jobCardDetails, vehicleStatusAfter24Hrs, towingVendorDetails)
    //                 if (val && typeof val === 'object') {
    //                     fd.append(key, JSON.stringify(val));
    //                 } else {
    //                     fd.append(key, val ?? "");
    //                 }
    //             }
    //         });

    //         // File fields
    //         Object.entries(data).forEach(([key, val]) => {
    //             if (!fileFields[key]) return;
    //             if (!val) return; // Skip empty files

    //             const fieldName = `${sectionKey}.${key}`;

    //             if (Array.isArray(val)) {
    //                 val.forEach((f) => fd.append(fieldName, f));
    //             } else {
    //                 fd.append(fieldName, val);
    //             }
    //         });

    //         // Append metadata if available
    //         if (Object.keys(fileMetadata).length > 0) {
    //             fd.append('imageMetadata', JSON.stringify(fileMetadata));
    //         }

    //         formData = fd;
    //     } else {
    //         formData = data;
    //     }

    //     // Use toast.promise with mutateAsync
    //     await toast.promise(
    //         updateSection({
    //             caseId,
    //             sectionPath: apiPath,
    //             formData,
    //         }),
    //         {
    //             loading: "Saving...",
    //             success: "Section saved successfully!",
    //             error: (err) => err.response?.data?.message || err.message || "Save failed",
    //         }
    //     );
    // };
    const handleSubmit = async () => {
        if (!validate()) {
            throw new Error("Please fill all required fields in this section.");
        }

        const data = { ...getNestedValue(form, sectionKey) };

        if (defaultFieldValues) {
            Object.keys(defaultFieldValues).forEach(key => {
                if (!data[key]) {
                    data[key] = defaultFieldValues[key];
                }
            });
        }

        const hasFiles = Object.keys(fileFields).length > 0;

        let formData;

        if (hasFiles) {
            const fd = new FormData();

            Object.entries(data).forEach(([key, val]) => {
                if (!fileFields[key]) {
                    if (val && typeof val === 'object') {
                        fd.append(key, JSON.stringify(val));
                    } else {
                        fd.append(key, val ?? "");
                    }
                }
            });

            Object.entries(data).forEach(([key, val]) => {
                if (!fileFields[key]) return;
                if (!val) return;

                const fieldName = `${sectionKey}.${key}`;

                if (Array.isArray(val)) {
                    val.forEach((f) => {
                        if (f instanceof File) {
                            fd.append(fieldName, f);
                        }
                    });
                } else {
                    if (val instanceof File) {
                        fd.append(fieldName, val);
                    }
                }
            });

            if (Object.keys(fileMetadata).length > 0) {
                fd.append('imageMetadata', JSON.stringify(fileMetadata));
            }

            formData = fd;
        } else {
            formData = data;
        }

        // ✅ Return promise for toast support, sync state in .then
        return updateSection({
            caseId,
            sectionPath: apiPath,
            formData,
        }).then(res => {
            if (res?.success && res?.data) {
                setForm(prev => {
                    const newForm = { ...prev };
                    return setNestedValue(newForm, sectionKey, res.data);
                });
            }
            return res;
        });
    };
    // Custom Logic for Meeting Details (Manual Form)
    if (sectionKey === "meetingDetails") {
        const meetingFields = [
            { key: "insuredIntroduction", label: "Insured Introduction" },
            { key: "vehicleInformation", label: "Vehicle Information" },
            { key: "dateAndTimeOfLoss", label: "Date and Time of Loss" },
            { key: "travelingFromTo", label: "Traveling From To" },
            { key: "purposeOfTravel", label: "Purpose of Travel" },
            { key: "accidentVersionLocationDetails", label: "Exact Location" },
            { key: "accidentDetailsAsPerDriver", label: "Accident Details As Per Insured Cum Driver" },
            { key: "accidentDetailsAsPerInsured", label: "Accident Details As Per Insured" },
            { key: "accidentDetailsAsPerOccupant", label: "Accident Details As Per Occupant" },
            { key: "rehabilitationDetails", label: "Rehabilitation Details" },
            { key: "firstContactAfterAccident", label: "First Contact After Accident" },
        ];

        const currentSection = getNestedValue(form, sectionKey) || {};

        return (
            <div id={id} className={`scroll-mt-48 border rounded-xl bg-white shadow-sm mb-8 transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-100' : ''}`}>
                <div
                    onClick={onToggle}
                    className="w-full flex justify-between items-center p-6 bg-gray-50 rounded-t-xl border-b hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        <h2 className="text-xl font-bold text-gray-800 uppercase">MEETING DETAILS</h2>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wide">
                        {sectionKey}
                    </span>
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {meetingFields.map((f) => {
                                const type = getInputType(f.key);
                                const error = errors[f.key];
                                return (
                                    <div key={f.key} className={type === "textarea" ? "col-span-1 md:col-span-2 lg:col-span-3" : "col-span-1"}>
                                        <label className="block">
                                            <span className="text-sm font-semibold text-gray-700 mb-1 block">{f.label}</span>
                                            {type === "textarea" ? (
                                                <textarea
                                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${loading ? "bg-gray-50 text-gray-500" : ""}`}
                                                    rows={3}
                                                    disabled={loading}
                                                    value={currentSection[f.key] || ""}
                                                    onChange={(e) => updateField(f.key, e.target.value)}
                                                    placeholder={`Enter ${f.label}...`}
                                                />
                                            ) : (
                                                <input
                                                    type={type}
                                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${loading ? "bg-gray-50 text-gray-500" : ""}`}
                                                    disabled={loading}
                                                    value={currentSection[f.key] || ""}
                                                    onChange={(e) => updateField(f.key, e.target.value)}
                                                    placeholder={`Enter ${f.label}`}
                                                />
                                            )}
                                            {error && <span className="text-xs text-red-500 mt-1 block font-medium">{error}</span>}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t flex justify-end">
                        <button
                            onClick={() => withSaving(() => toast.promise(
                                handleSubmit(),
                                {
                                    loading: "Saving meeting details...",
                                    success: "Meeting details saved successfully!",
                                    error: (err) => err.message || "Save failed",
                                }
                            ))}
                            disabled={loading}
                            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Custom Logic for Name of DL Holders (dlParticulars)
    if (sectionKey === "dlParticulars") {
        const list = Array.isArray(fieldsObj) ? fieldsObj : [];

        const updateList = (newList) => {
            const newForm = { ...form };
            setNestedValue(newForm, sectionKey, newList);
            setForm(newForm);
        };

        const addHolder = () => {
            const newHolder = {
                nameOfDlHolder: "",
                dlNumber: "",
                driverDob: "",
                rtoName: "",
                validityNonTransport: "",
                validityTransport: "",
                driverAddress: "",
                dlStatus: ""
            };
            updateList([...list, newHolder]);
        };

        const updateHolder = (idx, field, value) => {
            const newList = [...list];
            newList[idx] = { ...newList[idx], [field]: value };
            updateList(newList);
        };

        const removeHolder = (idx) => {
            const newList = list.filter((_, i) => i !== idx);
            updateList(newList);
        };

        const handleDLSubmit = () => withSaving(() => toast.promise(
            updateSection({
                caseId,
                sectionPath: apiPath,
                formData: list,
            }),
            {
                loading: "Saving DL Particulars...",
                success: "DL Particulars saved successfully!",
                error: (err) => err.response?.data?.message || err.message || "Failed to save DL Particulars",
            }
        ));

        return (
            <div id={id} className={`scroll-mt-48 border rounded-xl bg-white shadow-sm mb-8 transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-100' : ''}`}>
                <div
                    onClick={onToggle}
                    className="w-full flex justify-between items-center p-6 bg-gray-50 rounded-t-xl border-b hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        <h2 className="text-xl font-bold text-gray-800 uppercase">NAME OF DL HOLDERS</h2>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wide">
                        {sectionKey}
                    </span>
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 space-y-6">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); addHolder(); }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span>+ Add Holder</span>
                            </button>
                        </div>

                        {list.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <p className="text-gray-500 italic">No DL Holders added yet.</p>
                                <button type="button" onClick={addHolder} className="mt-2 text-indigo-600 font-medium hover:underline">Add one now</button>
                            </div>
                        )}

                        {list.map((holder, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden relative group">
                                <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-700 text-sm">DL Holder #{idx + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeHolder(idx)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Remove Holder"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { key: "nameOfDlHolder", label: "Name of DL Holder" },
                                        { key: "dlNumber", label: "DL Number" },
                                        { key: "driverDob", label: "Driver DOB", type: "date" },
                                        { key: "rtoName", label: "RTO Name" },
                                        { key: "validityNonTransport", label: "Validity (Non-Transport)", type: "date" },
                                        { key: "validityTransport", label: "Validity (Transport)", type: "date" },
                                        { key: "driverAddress", label: "Driver Address" },
                                        { key: "dlStatus", label: "DL Status" }
                                    ].map((f) => (
                                        <div key={f.key} className="col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                                            <input
                                                type={f.type || "text"}
                                                className="w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={holder[f.key] || ""}
                                                onChange={(e) => updateHolder(idx, f.key, e.target.value)}
                                                placeholder={`Enter ${f.label}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-gray-50 border-t flex justify-end">
                        <button
                            onClick={handleDLSubmit}
                            disabled={loading}
                            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Custom Logic for GPS Timeline Driver (Persons with Images)
    if (sectionKey === "gpsTimelineDriver") {
        const persons = Array.isArray(fieldsObj?.persons) ? fieldsObj.persons : [];

        const updatePersons = (newPersons) => {
            const newForm = { ...form };
            setNestedValue(newForm, sectionKey, { persons: newPersons });
            setForm(newForm);
        };

        const addPerson = () => {
            updatePersons([...persons, { personName: "", images: [] }]);
        };

        const removePerson = (idx) => {
            updatePersons(persons.filter((_, i) => i !== idx));
        };

        const updatePersonName = (idx, name) => {
            const newPersons = [...persons];
            newPersons[idx] = { ...newPersons[idx], personName: name };
            updatePersons(newPersons);
        };

        const handleDeletePerson = (idx) => {
            const name = persons[idx]?.personName || `Person ${idx + 1}`;
            confirmToast(
                `Are you sure you want to delete ${name} and all their data?`,
                async () => {
                    // If the index exists in the last-synced data, it's in the DB
                    const isSavedInDb = idx < (fieldsObj?.persons?.length || 0);

                    if (isSavedInDb) {
                        await odCaseApi.deleteAllGpsPersonImages({ caseId, personIndex: idx });
                    }

                    // Remove locally
                    removePerson(idx);
                    toast.success("Person deleted successfully!");
                }
            );
        };

        const updatePersonImages = (idx, images) => {
            const newPersons = [...persons];
            newPersons[idx] = { ...newPersons[idx], images };
            updatePersons(newPersons);
        };

        const handleGpsSubmit = () => withSaving(async () => {
            const hasNewFiles = persons.some(p => Array.isArray(p.images) && p.images.some(img => img instanceof File));

            let formData;

            if (hasNewFiles) {
                const fd = new FormData();

                // Build persons metadata (without File objects)
                const personsMeta = persons.map(p => ({
                    personName: p.personName || "",
                    images: Array.isArray(p.images) ? p.images.filter(img => !(img instanceof File)) : []
                }));
                fd.append("persons", JSON.stringify(personsMeta));

                // Append image files per person
                persons.forEach((person, pIdx) => {
                    if (Array.isArray(person.images)) {
                        person.images.forEach((img) => {
                            if (img instanceof File) {
                                fd.append(`gpsTimelineDriver.persons_${pIdx}_images`, img);
                            }
                        });
                    }
                });

                formData = fd;
            } else {
                formData = {
                    persons: persons.map(p => ({
                        personName: p.personName || "",
                        images: Array.isArray(p.images) ? p.images.filter(img => !(img instanceof File)) : []
                    }))
                };
            }

            // ✅ Return promise for toast support, sync state in .then
            return updateSection({
                caseId,
                sectionPath: apiPath,
                formData,
            }).then(res => {
                if (res?.success && res?.data) {
                    setForm(prev => {
                        const newForm = { ...prev };
                        return setNestedValue(newForm, sectionKey, res.data);
                    });
                }
                return res;
            });
        });

        return (
            <div id={id} className={`scroll-mt-48 border rounded-xl bg-white shadow-sm mb-8 transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-100' : ''}`}>
                <div
                    onClick={onToggle}
                    className="w-full flex justify-between items-center p-6 bg-gray-50 rounded-t-xl border-b hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        <h2 className="text-xl font-bold text-gray-800 uppercase">GPS TIMELINE DRIVER</h2>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wide">
                        {sectionKey}
                    </span>
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 space-y-6">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); addPerson(); }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span>+ Add Person</span>
                            </button>
                        </div>

                        {persons.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <p className="text-gray-500 italic">No persons added yet.</p>
                                <button type="button" onClick={addPerson} className="mt-2 text-indigo-600 font-medium hover:underline">Add one now</button>
                            </div>
                        )}

                        {persons.map((person, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-700 text-sm">Person #{idx + 1}</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePerson(idx)}
                                            className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors text-xs font-semibold border border-red-200 flex items-center gap-1.5"
                                            title="Delete Person"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete Person
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    {/* Person Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name of Person</label>
                                        <input
                                            type="text"
                                            className="w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={person.personName || ""}
                                            onChange={(e) => updatePersonName(idx, e.target.value)}
                                            placeholder="Enter person name (e.g., Ram, Babu)"
                                        />
                                    </div>

                                    {/* Images Upload */}
                                    <div>
                                        <DragDropUpload
                                            id={`gps-person-${idx}-images`}
                                            accept="image/*"
                                            multiple={true}
                                            value={person.images}
                                            isOptional={true}
                                            title={`${person.personName || `Person ${idx + 1}`}'s GPS Timeline Photos`}
                                            onChange={(e) => {
                                                const files = e.target.files;

                                                if (!files || files.length === 0) {
                                                    updatePersonImages(idx, []);
                                                    return;
                                                }

                                                if (Array.isArray(files)) {
                                                    updatePersonImages(idx, files);
                                                    return;
                                                }

                                                const newFiles = Array.from(files);
                                                updatePersonImages(idx, [...(person.images || []), ...newFiles]);
                                            }}
                                        />

                                        {/* Display existing uploaded images */}
                                        {person.images && person.images.length > 0 && person.images.some(img => !(img instanceof File)) && (
                                            <ImageGallery
                                                images={person.images.filter(img => !(img instanceof File))}
                                                title={`${person.personName || `Person ${idx + 1}`}'s Photos`}
                                                caseId={caseId}
                                                sectionPath={apiPath}
                                                fieldName={`persons.${idx}.images`}
                                                setForm={setForm}
                                                sectionKey={sectionKey}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-gray-50 border-t flex justify-end">
                        <button
                            onClick={() => {
                                toast.promise(
                                    handleGpsSubmit(),
                                    {
                                        loading: "Saving GPS Timeline...",
                                        success: "GPS Timeline saved successfully!",
                                        error: (err) => err.response?.data?.message || err.message || "Failed to save GPS Timeline",
                                    }
                                );
                            }}
                            disabled={loading}
                            className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Custom Logic for Observation/Findings/Conclusion
    if (sectionKey === "observationFindingsConclusion") {
        const obsData = fieldsObj || { headerType: "Observation and Finding", points: [], discrepancy: "" };

        const updateObsField = (field, value) => {
            const newForm = { ...form };
            const currentSection = getNestedValue(newForm, sectionKey) || {};
            const updatedSection = { ...currentSection, [field]: value };
            setNestedValue(newForm, sectionKey, updatedSection);
            setForm(newForm);
        };

        const points = Array.isArray(obsData.points) ? obsData.points : [];

        const addPoint = () => {
            updateObsField("points", [...points, ""]);
        };

        const updatePoint = (idx, val) => {
            const newPoints = [...points];
            newPoints[idx] = val;
            updateObsField("points", newPoints);
        };

        const removePoint = (idx) => {
            const newPoints = points.filter((_, i) => i !== idx);
            updateObsField("points", newPoints);
        };

        return (
            <div id={id} className={`scroll-mt-48 border rounded-xl bg-white shadow-sm mb-8 transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-100' : ''}`}>
                <div
                    onClick={onToggle}
                    className="w-full flex justify-between items-center p-6 bg-gray-50 rounded-t-xl border-b hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        <h2 className="text-xl font-bold text-gray-800 uppercase">OBSERVATION / FINDINGS</h2>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wide">
                        {sectionKey}
                    </span>
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 space-y-6">

                        {/* Header Type Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Header Type</label>
                            <select
                                className="w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={obsData.headerType || "Observation and Finding"}
                                onChange={(e) => updateObsField("headerType", e.target.value)}
                            >
                                <option value="Observation and Finding">Observation and Finding</option>
                                <option value="Observation and Finding Conclusion">Observation and Finding Conclusion</option>
                            </select>
                        </div>

                        {/* Dynamic Points List */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {obsData.headerType === "Observation and Finding Conclusion" ? "Conclusions / Points" : "Observations / Points"}
                            </label>

                            {points.map((point, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <span className="text-gray-500 font-mono text-sm">{idx + 1}.</span>
                                    <textarea
                                        rows={2}
                                        className="flex-1 border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={point}
                                        onChange={(e) => updatePoint(idx, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                addPoint();
                                            }
                                        }}
                                        autoFocus={idx > 0 && idx === points.length - 1}
                                        placeholder={`Enter Point ${idx + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePoint(idx)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                                        title="Remove Point"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addPoint}
                                className="mt-2 text-indigo-600 font-medium hover:underline text-sm flex items-center gap-1"
                            >
                                + Add Point
                            </button>
                        </div>

                        {/* Discrepancy Box - Only visible for 'Observation and Finding' */}
                        {obsData.headerType === "Observation and Finding" && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Discrepancy (if any)</label>
                                <textarea
                                    className="w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={4}
                                    value={obsData.discrepancy || ""}
                                    onChange={(e) => updateObsField("discrepancy", e.target.value)}
                                    placeholder="Enter details about any discrepancy found..."
                                />
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-4 border-t flex justify-end">
                            <button
                                onClick={async () => {
                                    if (submittingRef.current) return;
                                    submittingRef.current = true;
                                    try {
                                        await toast.promise(
                                            handleSubmit(),
                                            {
                                                loading: "Saving observations...",
                                                success: "Observations saved successfully!",
                                                error: (err) => err.message || "Save failed",
                                            }
                                        );
                                    } finally {
                                        submittingRef.current = false;
                                    }
                                }}
                                disabled={loading}
                                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id={id} className={`scroll-mt-48 border rounded-xl bg-white shadow-sm mb-8 transition-all duration-300 ${isExpanded ? 'ring-2 ring-blue-100' : ''}`}>
            <div
                onClick={onToggle}
                className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors rounded-t-xl cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                        <h2 className="text-xl font-bold text-gray-800 text-left">
                            {(() => {
                                const sectionTitleMap = {
                                    'letter-details': 'LETTER DETAILS',
                                    'od-details/claim-summary': 'CLAIM SUMMARY',
                                    'od-details/insured-details': 'INSURED DETAILS',
                                    'od-details/vehicle-details': 'VEHICLE DETAILS',
                                    'meeting-details': 'MEETING DETAILS',
                                    'policy-break-in-details': 'POLICY DETAILS',
                                    'spot-visit': 'SPOT VISIT',
                                    'garage-visit': 'GARAGE VISIT',
                                    'police-record-details': 'POLICE RECORD DETAILS',
                                    'observation-findings-conclusion': 'OBSERVATION / FINDINGS',
                                    'opinion': 'OPINION',
                                    'insured-documents': 'INSURED DOCUMENTS',
                                    'gps-timeline-driver': 'GPS TIMELINE DRIVER',
                                };
                                return sectionTitleMap[apiPath] || apiPath.replace(/-/g, ' ').toUpperCase();
                            })()}
                        </h2>
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
            </div>

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

                            const customLabels = {
                                bloodOrBodyTraceInspection: "Found any blood marks or body parts",
                                type: sectionKey === "gpsTimelineDriver" ? "GPS Timeline Photos" : "Type",
                                accidentVersionLocationDetails: "Exact Location"
                            };

                            const uiLabel = customLabels[field] || formatLabel(field);

                            // Custom Logic for Police Record Details
                            if (sectionKey === "policeRecordDetails") {
                                if (field === "firStatus") {
                                    return (
                                        <div key={field} className="col-span-1">
                                            <label className="block">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        FIR Status
                                                    </span>
                                                </div>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="yes">Yes</option>
                                                    <option value="Not Available">Not Available</option>
                                                </select>
                                                {error && (
                                                    <span className="text-xs text-red-500 mt-1 block font-medium">
                                                        {error}
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    );
                                }

                                // Hide others if not yes
                                if (currentSection.firStatus !== "yes") {
                                    return null;
                                }

                                if (field === "state") {
                                    return (
                                        <div key={field} className="col-span-1">
                                            <label className="block">
                                                <span className="text-sm font-semibold text-gray-700 mb-1 block">State</span>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => {
                                                        updateField(field, e.target.value);
                                                        updateField("nameOfPoliceStationDistrict", "");
                                                        updateField("district", "");
                                                    }}
                                                >
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map(state => (
                                                        <option key={state} value={state}>{state}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                    );
                                }

                                const stateDependentFields = ["policeStationName", "nameOfPoliceStationDistrict", "district"];
                                if (stateDependentFields.includes(field) && !currentSection.state) {
                                    return null;
                                }

                                if (field === "nameOfPoliceStationDistrict" || field === "district") {
                                    const districts = STATE_CITIES[currentSection.state] || [];
                                    const label = field === "nameOfPoliceStationDistrict" ? "Name Of Police Station District" : "District";

                                    return (
                                        <div key={field} className="col-span-1">
                                            <label className="block">
                                                <span className="text-sm font-semibold text-gray-700 mb-1 block">{label}</span>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    {districts.map(dist => (
                                                        <option key={dist} value={dist}>{dist}</option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                    );
                                }
                            }

                            // Custom Logic for odDetails.claimSummary (General Diary Details)
                            if (sectionKey === "odDetails.claimSummary") {
                                const gdDependentFields = ["makeAndModel", "chassisNo", "engineNo", "hypDetails"];
                                const isGDAvailable = currentSection.generalDiaryDetails !== "Details Not Available";

                                if (field === "dateOfLossAndTime") {
                                    return (
                                        <div key={field} className="col-span-1">
                                            <label className="block">
                                                <span className="text-sm font-semibold text-gray-700 mb-1 block">
                                                    {uiLabel}
                                                </span>
                                                <input
                                                    type="text"
                                                    readOnly={readonlyFields.includes(field)}
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : ""} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                    placeholder="Enter Date and Time of Loss"
                                                />
                                                {error && <span className="text-xs text-red-500 mt-1 block font-medium">{error}</span>}
                                            </label>
                                        </div>
                                    );
                                }

                                if (field === "generalDiaryDetails") {
                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3">
                                            <label className="block">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        General Diary Details
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    <select
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-300 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={isGDAvailable ? "available" : "not_available"}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "not_available") {
                                                                updateField("generalDiaryDetails", "Details Not Available");
                                                            } else {
                                                                // Clear only if it was "Details Not Available", otherwise keep current text
                                                                if (currentSection.generalDiaryDetails === "Details Not Available") {
                                                                    updateField("generalDiaryDetails", "");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <option value="available">Details Available</option>
                                                        <option value="not_available">Details Not Available</option>
                                                    </select>

                                                    {isGDAvailable && (
                                                        <textarea
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            rows={3}
                                                            value={currentSection[field] || ""}
                                                            onChange={(e) => updateField(field, e.target.value)}
                                                            placeholder="Enter General Diary Details..."
                                                        />
                                                    )}
                                                </div>
                                                {error && (
                                                    <span className="text-xs text-red-500 mt-1 block font-medium">
                                                        {error}
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    );
                                }

                                // Hide dependent fields if GD is Not Available
                                if (gdDependentFields.includes(field) && !isGDAvailable) {
                                    return null;
                                }
                            }

                            // Custom Logic for Permit Details (odDetails.vehicleDetails)
                            if (sectionKey === "odDetails.vehicleDetails") {
                                const permitFields = ["permitType", "permitLocationType", "permitState", "permitCity"];
                                // Also include fields that depend on Date of Purchase
                                const purchaseDependentFields = [
                                    "dateOfPurchase",
                                    "sellerAddress",
                                    "sellerContactNumber",
                                    "purchaseAmount",
                                    "fitnessDetail"
                                ];

                                // PERMIT LOGIC
                                const isPermittedYes = (currentSection.permittedDetail || "").toLowerCase() === "yes";

                                if (field === "permittedDetail") {
                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3">
                                            <label className="block">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">Permit Detail</span>
                                                </div>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="Not Available">Not Available</option>
                                                </select>
                                                {error && <span className="text-xs text-red-500 mt-1 block font-medium">{error}</span>}
                                            </label>
                                        </div>
                                    );
                                }

                                if (permitFields.includes(field)) {
                                    if (!isPermittedYes) return null;

                                    if (field === "permitType") {
                                        return (
                                            <div key={field} className="col-span-1">
                                                <label className="block">
                                                    <span className="text-sm font-semibold text-gray-700 mb-1 block">Permit Type</span>
                                                    <select
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={currentSection[field] || ""}
                                                        onChange={(e) => updateField(field, e.target.value)}
                                                    >
                                                        <option value="">Select Type</option>
                                                        <option value="Goods">Goods</option>
                                                        <option value="Public">Public</option>
                                                    </select>
                                                </label>
                                            </div>
                                        );
                                    }

                                    if (field === "permitLocationType") {
                                        return (
                                            <div key={field} className="col-span-1">
                                                <label className="block">
                                                    <span className="text-sm font-semibold text-gray-700 mb-1 block">Locate</span>
                                                    <select
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={currentSection[field] || ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            updateField(field, val);
                                                            if (val !== 'State') {
                                                                updateField('permitState', '');
                                                                updateField('permitCity', '');
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select Location</option>
                                                        <option value="State">State</option>
                                                        <option value="National">National</option>
                                                    </select>
                                                </label>
                                            </div>
                                        );
                                    }

                                    if (field === "permitState") {
                                        if (currentSection.permitLocationType !== "State") return null;
                                        return (
                                            <div key={field} className="col-span-1">
                                                <label className="block">
                                                    <span className="text-sm font-semibold text-gray-700 mb-1 block">State</span>
                                                    <select
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={currentSection[field] || ""}
                                                        onChange={(e) => {
                                                            updateField(field, e.target.value);
                                                            updateField('permitCity', '');
                                                        }}
                                                    >
                                                        <option value="">Select State</option>
                                                        {INDIAN_STATES.map(state => (
                                                            <option key={state} value={state}>{state}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                        );
                                    }

                                    if (field === "permitCity") {
                                        if (currentSection.permitLocationType !== "State" || !currentSection.permitState) return null;
                                        const cities = STATE_CITIES[currentSection.permitState] || [];
                                        return (
                                            <div key={field} className="col-span-1">
                                                <label className="block">
                                                    <span className="text-sm font-semibold text-gray-700 mb-1 block">City</span>
                                                    <select
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={currentSection[field] || ""}
                                                        onChange={(e) => updateField(field, e.target.value)}
                                                    >
                                                        <option value="">Select City</option>
                                                        {cities.map(city => (
                                                            <option key={city} value={city}>{city}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                        );
                                    }
                                }

                                // DATE OF PURCHASE LOGIC (Existing)
                                const isPurchaseAvailable = currentSection.dateOfPurchaseAvailability === "Available";

                                if (field === "dateOfPurchaseAvailability") {
                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3">
                                            <label className="block">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        Date of Purchase Availability
                                                    </span>
                                                </div>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="Available">Available</option>
                                                    <option value="Not Available">Not Available</option>
                                                </select>
                                                {error && (
                                                    <span className="text-xs text-red-500 mt-1 block font-medium">
                                                        {error}
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    );
                                }

                                if (purchaseDependentFields.includes(field)) {
                                    if (!isPurchaseAvailable) return null;

                                    // Custom rendering for fitnessDetail: Yes/No + Calendar
                                    if (field === "fitnessDetail") {
                                        const fitnessVal = currentSection.fitnessDetail || "";
                                        const isFitnessYes = fitnessVal !== "" && fitnessVal !== "No";
                                        const dateValue = fitnessVal === "Yes" ? "" : fitnessVal;

                                        return (
                                            <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <label className="block">
                                                        <span className="text-sm font-semibold text-gray-700 mb-1 block">Fitness Detail</span>
                                                        <select
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={isFitnessYes ? "Yes" : fitnessVal}
                                                            onChange={(e) => {
                                                                updateField("fitnessDetail", e.target.value);
                                                            }}
                                                        >
                                                            <option value="">Select Option</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                        {error && <span className="text-xs text-red-500 mt-1 block font-medium">{error}</span>}
                                                    </label>

                                                    {isFitnessYes && (
                                                        <label className="block">
                                                            <span className="text-sm font-semibold text-gray-700 mb-1 block">Fitness Valid Upto</span>
                                                            <input
                                                                type="date"
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={dateValue}
                                                                onChange={(e) => updateField("fitnessDetail", e.target.value || "Yes")}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // If available, let it fall through to default rendering below
                                }
                            }

                            // Custom Logic for odDetails.insuredDetails (Details of Injured)
                            if (sectionKey === "odDetails.insuredDetails" && field === "detailsOfInjured") {
                                const injuredData = currentSection.detailsOfInjured || { availability: "", injuredPersons: [] };
                                const isAvailable = (injuredData.availability || "").toLowerCase() === "yes";
                                // ensure injuredPersons is array
                                const persons = Array.isArray(injuredData.injuredPersons) ? injuredData.injuredPersons : [];
                                const count = persons.length > 0 ? persons.length : 1;

                                const updateInjuredDetails = (newData) => {
                                    if (readonlyFields.includes(field)) return;
                                    updateField("detailsOfInjured", { ...injuredData, ...newData });
                                };

                                const handleCountChange = (e) => {
                                    const newCount = parseInt(e.target.value, 10);
                                    let newPersons = [...persons];
                                    if (newCount > newPersons.length) {
                                        while (newPersons.length < newCount) newPersons.push({});
                                    } else {
                                        newPersons = newPersons.slice(0, newCount);
                                    }
                                    updateInjuredDetails({ injuredPersons: newPersons });
                                };

                                const updatePerson = (index, key, val) => {
                                    const newPersons = [...persons];
                                    if (!newPersons[index]) newPersons[index] = {};
                                    newPersons[index][key] = val;
                                    updateInjuredDetails({ injuredPersons: newPersons });
                                };

                                return (
                                    <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 border p-4 rounded-lg bg-gray-50">
                                        <div className="flex flex-col md:flex-row gap-4 mb-4 border-b pb-4">
                                            <label className="flex-1">
                                                <span className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Details of Injured Available?
                                                </span>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={injuredData.availability || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "no" || val === "Not Available") {
                                                            updateInjuredDetails({ availability: "Not Available", injuredPersons: [] });
                                                        } else {
                                                            // If switching to Yes, ensure at least 1 person logic if empty
                                                            const newPersons = persons.length === 0 ? [{}] : persons;
                                                            updateInjuredDetails({ availability: "Yes", injuredPersons: newPersons });
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="Not Available">Not Available</option>
                                                </select>
                                            </label>

                                            {isAvailable && (
                                                <label className="flex-1">
                                                    <span className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Number of Injured (1-10)
                                                    </span>
                                                    <select
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={count}
                                                        onChange={handleCountChange}
                                                    >
                                                        {[...Array(10)].map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            )}
                                        </div>

                                        {isAvailable && persons.map((person, index) => person && (
                                            <div key={index} className="mb-6 last:mb-0 p-4 bg-white rounded border relative shadow-sm">
                                                <h4 className="font-bold text-gray-800 mb-3 border-b pb-2 flex justify-between">
                                                    <span>Injured Person #{index + 1}</span>
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <label>
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">Name of Injured</span>
                                                        <input
                                                            type="text"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.name || ""}
                                                            onChange={(e) => updatePerson(index, "name", e.target.value)}
                                                            placeholder="Enter Name"
                                                        />
                                                    </label>

                                                    <label>
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">Age of Injured</span>
                                                        <input
                                                            type="number"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.age || ""}
                                                            onChange={(e) => updatePerson(index, "age", e.target.value)}
                                                            placeholder="Enter Age"
                                                        />
                                                    </label>

                                                    <label className="md:col-span-2">
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">Address of Injured</span>
                                                        <input
                                                            type="text"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.address || ""}
                                                            onChange={(e) => updatePerson(index, "address", e.target.value)}
                                                            placeholder="Enter Address"
                                                        />
                                                    </label>

                                                    <label>
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">Type of Injury</span>
                                                        <select
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.injuryType || ""}
                                                            onChange={(e) => updatePerson(index, "injuryType", e.target.value)}
                                                        >
                                                            <option value="">Select Type</option>
                                                            <option value="Normal">Normal</option>
                                                            <option value="Grievous">Grievous</option>
                                                        </select>
                                                    </label>

                                                    {person.injuryType === "Grievous" && (
                                                        <label className="md:col-span-2">
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Injury Description (Grievous)</span>
                                                            <textarea
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                rows={2}
                                                                value={person.injuryDescription || ""}
                                                                onChange={(e) => updatePerson(index, "injuryDescription", e.target.value)}
                                                                placeholder="Describe the grievous injuries..."
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }

                            // Custom Logic for odDetails.insuredDetails (Details of Deceased)
                            if (sectionKey === "odDetails.insuredDetails" && field === "detailsOfDeceased") {
                                const deceasedData = currentSection.detailsOfDeceased || { availability: "", deceasedPersons: [] };
                                const isAvailable = (deceasedData.availability || "").toLowerCase() === "yes";
                                // ensure deceasedPersons is array
                                const persons = Array.isArray(deceasedData.deceasedPersons) ? deceasedData.deceasedPersons : [];
                                const count = persons.length > 0 ? persons.length : 1;

                                const updateDeceasedDetails = (newData) => {
                                    if (readonlyFields.includes(field)) return;
                                    updateField("detailsOfDeceased", { ...deceasedData, ...newData });
                                };

                                const handleCountChange = (e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (isNaN(val) || val < 1) return; // Ignore invalid

                                    const newCount = val; // limit handled by max logic if needed, but array handles scale
                                    let newPersons = [...persons];
                                    if (newCount > newPersons.length) {
                                        while (newPersons.length < newCount) {
                                            newPersons.push({ pmrDetails: {} });
                                        }
                                    } else {
                                        newPersons = newPersons.slice(0, newCount);
                                    }
                                    updateDeceasedDetails({ deceasedPersons: newPersons });
                                };

                                const updatePerson = (index, key, val, isPmrDetail = false) => {
                                    const newPersons = [...persons];
                                    if (!newPersons[index]) newPersons[index] = { pmrDetails: {} };

                                    if (isPmrDetail) {
                                        if (!newPersons[index].pmrDetails) newPersons[index].pmrDetails = {};
                                        newPersons[index].pmrDetails[key] = val;
                                    } else {
                                        newPersons[index][key] = val;
                                    }
                                    updateDeceasedDetails({ deceasedPersons: newPersons });
                                };

                                return (
                                    <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 border p-4 rounded-lg bg-gray-50 mt-4">
                                        <div className="flex flex-col md:flex-row gap-4 mb-4 border-b pb-4">
                                            <label className="flex-1">
                                                <span className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Details of Deceased Available?
                                                </span>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={deceasedData.availability || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "no" || val === "Not Available") {
                                                            updateDeceasedDetails({ availability: "Not Available", deceasedPersons: [] });
                                                        } else {
                                                            const newPersons = persons.length === 0 ? [{ pmrDetails: {} }] : persons;
                                                            updateDeceasedDetails({ availability: "Yes", deceasedPersons: newPersons });
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="Not Available">Not Available</option>
                                                </select>
                                            </label>

                                            {isAvailable && (
                                                <label className="flex-1">
                                                    <span className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Number of Deceased
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        readOnly={readonlyFields.includes(field)}
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={count}
                                                        onChange={handleCountChange}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {isAvailable && persons.map((person, index) => person && (
                                            <div key={index} className="mb-6 last:mb-0 p-4 bg-white rounded border relative shadow-sm">
                                                <h4 className="font-bold text-gray-800 mb-3 border-b pb-2 flex justify-between">
                                                    <span>Deceased Person #{index + 1}</span>
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Basic Details */}
                                                    <label>
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">Name of Deceased</span>
                                                        <input
                                                            type="text"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.name || ""}
                                                            onChange={(e) => updatePerson(index, "name", e.target.value)}
                                                            placeholder="Enter Name"
                                                        />
                                                    </label>

                                                    <label>
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">Age of Deceased</span>
                                                        <input
                                                            type="number"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.age || ""}
                                                            onChange={(e) => updatePerson(index, "age", e.target.value)}
                                                            placeholder="Enter Age"
                                                        />
                                                    </label>

                                                    <label className="md:col-span-2">
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">Address of Deceased</span>
                                                        <input
                                                            type="text"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.address || ""}
                                                            onChange={(e) => updatePerson(index, "address", e.target.value)}
                                                            placeholder="Enter Address"
                                                        />
                                                    </label>

                                                    <label>
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">Date of Death</span>
                                                        <input
                                                            type="date"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.dateOfDeath ? (typeof person.dateOfDeath === 'string' ? person.dateOfDeath.slice(0, 10) : "") : ""}
                                                            onChange={(e) => updatePerson(index, "dateOfDeath", e.target.value)}
                                                        />
                                                    </label>

                                                    {/* PMR Availability */}
                                                    <label>
                                                        <span className="text-xs font-semibold text-gray-600 block mb-1">PMR Available?</span>
                                                        <select
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={person.pmrAvailable || ""}
                                                            onChange={(e) => updatePerson(index, "pmrAvailable", e.target.value)}
                                                        >
                                                            <option value="">Select Option</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </label>

                                                    {/* PMR Logic */}
                                                    {person.pmrAvailable === "No" && (
                                                        <label className="md:col-span-2">
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Reason for No PMR / Details</span>
                                                            <textarea
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                rows={2}
                                                                value={person.pmrDetails?.noPmrReason || ""}
                                                                onChange={(e) => updatePerson(index, "noPmrReason", e.target.value, true)}
                                                                placeholder="Enter details..."
                                                            />
                                                        </label>
                                                    )}

                                                    {person.pmrAvailable === "Yes" && (
                                                        <>
                                                            <label>
                                                                <span className="text-xs font-semibold text-gray-600 block mb-1">PMR No</span>
                                                                <input
                                                                    type="text"
                                                                    readOnly={readonlyFields.includes(field)}
                                                                    disabled={readonlyFields.includes(field)}
                                                                    className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                    value={person.pmrDetails?.pmrNo || ""}
                                                                    onChange={(e) => updatePerson(index, "pmrNo", e.target.value, true)}
                                                                    placeholder="Enter PMR No"
                                                                />
                                                            </label>
                                                            <label>
                                                                <span className="text-xs font-semibold text-gray-600 block mb-1">Time of PMR</span>
                                                                <input
                                                                    type="datetime-local"
                                                                    readOnly={readonlyFields.includes(field)}
                                                                    disabled={readonlyFields.includes(field)}
                                                                    className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                    value={person.pmrDetails?.pmrTime ? (typeof person.pmrDetails.pmrTime === 'string' ? person.pmrDetails.pmrTime.slice(0, 16) : "") : ""}
                                                                    onChange={(e) => updatePerson(index, "pmrTime", e.target.value, true)}
                                                                />
                                                            </label>
                                                            <label>
                                                                <span className="text-xs font-semibold text-gray-600 block mb-1">Place of PMR</span>
                                                                <input
                                                                    type="text"
                                                                    readOnly={readonlyFields.includes(field)}
                                                                    disabled={readonlyFields.includes(field)}
                                                                    className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                    value={person.pmrDetails?.pmrPlace || ""}
                                                                    onChange={(e) => updatePerson(index, "pmrPlace", e.target.value, true)}
                                                                    placeholder="Enter Place"
                                                                />
                                                            </label>
                                                            <label className="md:col-span-2">
                                                                <span className="text-xs font-semibold text-gray-600 block mb-1">Doctor Opinion</span>
                                                                <textarea
                                                                    readOnly={readonlyFields.includes(field)}
                                                                    disabled={readonlyFields.includes(field)}
                                                                    className={`w-full border px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                    rows={2}
                                                                    value={person.pmrDetails?.doctorOpinion || ""}
                                                                    onChange={(e) => updatePerson(index, "doctorOpinion", e.target.value, true)}
                                                                    placeholder="Enter Doctor Opinion"
                                                                />
                                                            </label>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }

                            // Custom Logic for Police Record Details
                            if (sectionKey === "policeRecordDetails") {
                                if (field === "rtiDetailsAvailability") {
                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 mb-4 border-t pt-4">
                                            <span className="block text-sm font-bold text-gray-800 mb-3">RTI Details</span>
                                            <div className="mb-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Filled Any RTI Details?
                                                </label>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    value={currentSection.rtiDetailsAvailability || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        updateField("rtiDetailsAvailability", val);
                                                        if (val === "No") updateField("rtiDetails", []);
                                                    }}
                                                    className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }

                                if (field === "rtiDetails") {
                                    if (currentSection.rtiDetailsAvailability !== "Yes") return null;

                                    const rtiList = Array.isArray(currentSection.rtiDetails) ? currentSection.rtiDetails : [];

                                    const updateRtiDetail = (idx, val) => {
                                        if (readonlyFields.includes(field)) return;
                                        const newList = [...rtiList];
                                        newList[idx] = val;
                                        updateField("rtiDetails", newList);
                                    };

                                    const addRtiDetail = () => {
                                        if (readonlyFields.includes(field)) return;
                                        updateField("rtiDetails", [...rtiList, ""]);
                                    };

                                    const removeRtiDetail = (idx) => {
                                        if (readonlyFields.includes(field)) return;
                                        const newList = rtiList.filter((_, i) => i !== idx);
                                        updateField("rtiDetails", newList);
                                    };

                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-sm font-semibold text-gray-700">RTI Description List</h4>
                                                {!readonlyFields.includes(field) && (
                                                    <button
                                                        type="button"
                                                        onClick={addRtiDetail}
                                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1"
                                                    >
                                                        <span>+ Add Detail</span>
                                                    </button>
                                                )}
                                            </div>

                                            {rtiList.length === 0 && (
                                                <p className="text-xs text-gray-500 italic mb-2 text-center py-2 bg-white rounded border border-dashed border-gray-300">
                                                    No details added yet. Click "+ Add Detail" to start.
                                                </p>
                                            )}

                                            <div className="space-y-3">
                                                {rtiList.map((detail, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <span className="text-xs font-semibold text-gray-500 w-6">#{idx + 1}</span>
                                                        <input
                                                            type="text"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            value={detail}
                                                            onChange={(e) => updateRtiDetail(idx, e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addRtiDetail();
                                                                }
                                                            }}
                                                            autoFocus={idx === rtiList.length - 1 && idx !== 0}
                                                            className={`flex-1 border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            placeholder={`Enter RTI detail...`}
                                                        />
                                                        {!readonlyFields.includes(field) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRtiDetail(idx)}
                                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Remove"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                            }

                            // Custom Logic for Opinion (including Enclosures)
                            if (sectionKey === "opinion") {
                                if (field === "enclosures") {
                                    const docs = Array.isArray(currentSection.enclosures) ? currentSection.enclosures : [];

                                    const updateDoc = (idx, key, val) => {
                                        if (readonlyFields.includes(field)) return;
                                        const newDocs = [...docs];
                                        newDocs[idx] = { ...newDocs[idx], [key]: val };
                                        updateField("enclosures", newDocs);
                                    };

                                    const addDoc = () => {
                                        if (readonlyFields.includes(field)) return;
                                        updateField("enclosures", [...docs, { field: "", answer: "" }]);
                                    };

                                    const removeDoc = (idx) => {
                                        if (readonlyFields.includes(field)) return;
                                        const newDocs = docs.filter((_, i) => i !== idx);
                                        updateField("enclosures", newDocs);
                                    };

                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-sm font-semibold text-gray-700">Enclosure Documents</h4>
                                                {!readonlyFields.includes(field) && (
                                                    <button
                                                        type="button"
                                                        onClick={addDoc}
                                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1"
                                                    >
                                                        <span>+ Add Document</span>
                                                    </button>
                                                )}
                                            </div>

                                            {docs.length === 0 && (
                                                <p className="text-xs text-gray-500 italic mb-2 text-center py-2 bg-white rounded border border-dashed border-gray-300">
                                                    No documents added yet.
                                                </p>
                                            )}

                                            <div className="space-y-3">
                                                {docs.map((doc, idx) => (
                                                    <div key={idx} className="flex gap-2 items-start bg-white p-2 rounded border border-gray-100">
                                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Field Name</label>
                                                                <input
                                                                    type="text"
                                                                    readOnly={readonlyFields.includes(field)}
                                                                    disabled={readonlyFields.includes(field)}
                                                                    value={doc.field || ""}
                                                                    onChange={(e) => updateDoc(idx, "field", e.target.value)}
                                                                    className={`w-full border px-2 py-1.5 rounded text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                    placeholder="e.g. RC Status"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Answer/Value</label>
                                                                <select
                                                                    disabled={readonlyFields.includes(field)}
                                                                    value={doc.answer || ""}
                                                                    onChange={(e) => updateDoc(idx, "answer", e.target.value)}
                                                                    className={`w-full border px-2 py-1.5 rounded text-sm border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}`}
                                                                >
                                                                    <option value="" disabled>Select status</option>
                                                                    <option value="Enclosed">Enclosed</option>
                                                                    <option value="Not Enclosed">Not Enclosed</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        {!readonlyFields.includes(field) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDoc(idx)}
                                                                className="text-red-500 hover:text-red-700 p-2 mt-4 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Remove"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                            }

                            // Custom Logic for Observation Findings Conclusion
                            if (sectionKey === "observationFindingsConclusion") {
                                if (field === "findingType") {
                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 mb-4 border-t pt-4">
                                            <span className="block text-sm font-bold text-gray-800 mb-3">Conclusion Section</span>
                                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                                <label className={`flex items-center gap-2 cursor-pointer bg-white p-3 rounded border hover:bg-gray-50 ${readonlyFields.includes(field) ? "opacity-50 cursor-not-allowed" : ""}`}>
                                                    <input
                                                        type="radio"
                                                        disabled={readonlyFields.includes(field)}
                                                        name="findingType"
                                                        value="Observation and Finding Conclusion"
                                                        checked={currentSection.findingType === "Observation and Finding Conclusion"}
                                                        onChange={(e) => updateField("findingType", e.target.value)}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Observation and Finding Conclusion</span>
                                                </label>
                                                <label className={`flex items-center gap-2 cursor-pointer bg-white p-3 rounded border hover:bg-gray-50 ${readonlyFields.includes(field) ? "opacity-50 cursor-not-allowed" : ""}`}>
                                                    <input
                                                        type="radio"
                                                        disabled={readonlyFields.includes(field)}
                                                        name="findingType"
                                                        value="Observation and Finding"
                                                        checked={currentSection.findingType === "Observation and Finding"}
                                                        onChange={(e) => updateField("findingType", e.target.value)}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Observation and Finding</span>
                                                </label>
                                            </div>
                                        </div>
                                    );
                                }
                                if (field === "findingText") {
                                    const showTextarea = !!currentSection.findingType;
                                    if (!showTextarea) return null;

                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 mb-4">
                                            <label className="block">
                                                <span className="text-sm font-semibold text-gray-700 mb-1">
                                                    {currentSection.findingType} - Details
                                                </span>
                                                <textarea
                                                    readOnly={readonlyFields.includes(field)}
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    rows={6}
                                                    value={currentSection.findingText || ""}
                                                    onChange={(e) => updateField("findingText", e.target.value)}
                                                    placeholder={`Enter ${currentSection.findingType} details...`}
                                                />
                                            </label>
                                        </div>
                                    );
                                }
                                if (field === "discrepancy") {
                                    if (currentSection.findingType !== "Observation and Finding") return null;
                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 mb-4">
                                            <label className="block">
                                                <span className="text-sm font-semibold text-gray-700 mb-1">
                                                    Discrepancy
                                                </span>
                                                <textarea
                                                    readOnly={readonlyFields.includes(field)}
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    rows={4}
                                                    value={currentSection.discrepancy || ""}
                                                    onChange={(e) => updateField("discrepancy", e.target.value)}
                                                    placeholder="Enter discrepancy details..."
                                                />
                                            </label>
                                        </div>
                                    );
                                }
                            }

                            // Custom Logic for policyBreakInDetails
                            if (sectionKey === "policyBreakInDetails") {
                                const prevPolicyDependentFields = [
                                    "previousPolicyPeriod",
                                    "previousInsurer",
                                    "previousPolicyType",
                                    "anyClaimInPreviousPolicy",
                                    "previousClaimPhotosAvailable"
                                ];
                                const prevPolicyStatus = (currentSection.previousPolicyNo || "").toLowerCase();
                                const isPrevPolicyNo = prevPolicyStatus === "no";
                                const isNewVehicle = prevPolicyStatus === "new vehicle";

                                // Fields associated with breakout / break-in details
                                const breakInFields = [
                                    "breakIn",
                                    "breakInInspectionDate",
                                    "odometerReadingAtBreakIn",
                                    "breakInDiscrepancy"
                                ];

                                if (prevPolicyDependentFields.includes(field) && (isPrevPolicyNo || isNewVehicle)) {
                                    return null;
                                }

                                if (breakInFields.includes(field) && isNewVehicle) {
                                    return null;
                                }

                                if (field === "previousPolicyNo") {
                                    const isAvailable = (currentSection.previousPolicyNo || "").toLowerCase() !== "no";

                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3">
                                            <label className="block">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        Previous Policy Details
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    <select
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-gray-300 ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={isNewVehicle ? "new" : (isPrevPolicyNo ? "no" : "yes")}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "no") {
                                                                updateField("previousPolicyNo", "No");
                                                            } else if (val === "new") {
                                                                updateField("previousPolicyNo", "New Vehicle");
                                                            } else {
                                                                // If switching away from No/New, clear the field so user can enter a number
                                                                updateField("previousPolicyNo", "");
                                                            }
                                                        }}
                                                    >
                                                        <option value="yes">Yes</option>
                                                        <option value="no">No</option>
                                                        <option value="new">New Vehicle</option>
                                                    </select>

                                                    {(prevPolicyStatus !== "no" && prevPolicyStatus !== "new vehicle") && (
                                                        <input
                                                            type="text"
                                                            readOnly={readonlyFields.includes(field)}
                                                            disabled={readonlyFields.includes(field)}
                                                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                            value={currentSection[field] || ""}
                                                            onChange={(e) => updateField(field, e.target.value)}
                                                            placeholder="Enter Previous Policy No..."
                                                        />
                                                    )}
                                                </div>
                                                {error && (
                                                    <span className="text-xs text-red-500 mt-1 block font-medium">
                                                        {error}
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    );
                                }

                                if (field === "policyNo" || field === "policyPeriod" || field === "previousPolicyPeriod") {
                                    if (field === "policyPeriod" || field === "previousPolicyPeriod") {
                                        const [startDateStr, endDateStr] = (currentSection[field] || "").split(" to ");

                                        // HH.mm.ss is not needed, user asked according to DD.MM.YYYY
                                        const toInputDate = (dateStr) => {
                                            if (!dateStr) return "";
                                            const cleanStr = dateStr.trim().split(" ")[0]; // Take only the date part if time exists
                                            
                                            // Handle DD.MM.YYYY
                                            if (cleanStr.includes(".")) {
                                                const parts = cleanStr.split(".");
                                                if (parts.length === 3) {
                                                    const [day, month, year] = parts;
                                                    return `${year}-${month}-${day}`;
                                                }
                                            }
                                            
                                            // Handle YYYY-MM-DD (already in input format)
                                            if (cleanStr.includes("-")) {
                                                const parts = cleanStr.split("-");
                                                if (parts.length === 3 && parts[0].length === 4) {
                                                    return cleanStr;
                                                }
                                                // Handle DD-MM-YYYY if it exists
                                                if (parts.length === 3 && parts[2].length === 4) {
                                                    const [day, month, year] = parts;
                                                    return `${year}-${month}-${day}`;
                                                }
                                            }
                                            
                                            return "";
                                        };

                                        const toStorageDate = (dateStr) => {
                                            if (!dateStr) return "";
                                            const [year, month, day] = dateStr.split("-");
                                            return `${day}.${month}.${year}`;
                                        };

                                        const calculateEndDate = (inputDate) => {
                                            if (!inputDate) return "";
                                            const [year, month, day] = inputDate.split("-");
                                            const date = new Date(year, month - 1, day);
                                            date.setFullYear(date.getFullYear() + 1);
                                            date.setDate(date.getDate() - 1);
                                            const endDay = String(date.getDate()).padStart(2, '0');
                                            const endMonth = String(date.getMonth() + 1).padStart(2, '0');
                                            const endYear = date.getFullYear();
                                            return `${endDay}.${endMonth}.${endYear}`;
                                        };

                                        return (
                                            <div key={field} className="col-span-1 md:col-span-2">
                                                <label className="block">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            {uiLabel} {(field === "policyPeriod" || field === "policyNo") && <span className="text-red-500">*</span>}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-4 items-center">
                                                        <div className="flex-1">
                                                            <input
                                                                type="date"
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={toInputDate(startDateStr)}
                                                                onChange={(e) => {
                                                                    const inputVal = e.target.value;
                                                                    const newStart = toStorageDate(inputVal);
                                                                    const newEnd = calculateEndDate(inputVal);
                                                                    updateField(field, `${newStart} to ${newEnd}`);
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-gray-500 font-medium">to</span>
                                                        <div className="flex-1">
                                                            <input
                                                                type="date"
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={toInputDate(endDateStr)}
                                                                onChange={(e) => {
                                                                    const start = startDateStr || "";
                                                                    const newEnd = toStorageDate(e.target.value);
                                                                    updateField(field, `${start} to ${newEnd}`);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {error && (
                                                        <span className="text-xs text-red-500 mt-1 block font-medium">
                                                            {error}
                                                        </span>
                                                    )}
                                                </label>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={field} className={type === "textarea" ? "col-span-1 md:col-span-2 lg:col-span-3" : "col-span-1"}>
                                            <label className="block">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {uiLabel} <span className="text-red-500">*</span>
                                                    </span>
                                                </div>
                                                <input
                                                    type={type}
                                                    readOnly={readonlyFields.includes(field)}
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                    placeholder={`Enter ${uiLabel}...`}
                                                />
                                                {error && (
                                                    <span className="text-xs text-red-500 mt-1 block font-medium">
                                                        {error}
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    );
                                }

                                // Break In logic
                                const breakInDependentFields = [
                                    "breakInInspectionDate",
                                    "odometerReadingAtBreakIn",
                                    "breakInDiscrepancy"
                                ];
                                const isBreakInYes = (currentSection.breakIn || "").toLowerCase() === "yes";

                                if (field === "breakIn") {
                                    return (
                                        <div key={field} className="col-span-1">
                                            <label className="block">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {uiLabel}
                                                    </span>
                                                </div>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                                {error && (
                                                    <span className="text-xs text-red-500 mt-1 block font-medium">
                                                        {error}
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    );
                                }

                                if (breakInDependentFields.includes(field) && !isBreakInYes) {
                                    return null;
                                }
                            }

                            // Custom Logic for Spot Visit

                            // Custom Logic for Garage Visit (Towing Vendor Details)
                            if (sectionKey === "garageVisit" && field === "towingVendorDetails") {
                                // Parse existing value or default to empty array
                                let vendors = [];
                                const rawValue = currentSection[field];

                                if (Array.isArray(rawValue)) {
                                    vendors = rawValue.filter(v => v !== null && v !== undefined);
                                } else if (typeof rawValue === 'string') {
                                    try {
                                        const parsed = JSON.parse(rawValue);
                                        if (Array.isArray(parsed)) {
                                            vendors = parsed.filter(v => v !== null && v !== undefined);
                                        }
                                    } catch (e) {
                                        // Legacy string or empty
                                    }
                                }

                                const isAvailable = vendors.length > 0;
                                const vendorCount = vendors.length > 0 ? vendors.length : 1;

                                const updateVendor = (index, key, val) => {
                                    if (readonlyFields.includes(field)) return;
                                    const newVendors = [...vendors];
                                    if (!newVendors[index]) newVendors[index] = {};
                                    newVendors[index][key] = val;
                                    updateField(field, JSON.stringify(newVendors));
                                };

                                const handleAvailabilityChange = (e) => {
                                    if (readonlyFields.includes(field)) return;
                                    const val = e.target.value;
                                    if (val === "no") {
                                        updateField(field, JSON.stringify([])); // Empty array means No
                                    } else {
                                        // Initialize with 1 empty vendor if creating new
                                        if (vendors.length === 0) {
                                            updateField(field, JSON.stringify([{}]));
                                        }
                                    }
                                };

                                const handleCountChange = (e) => {
                                    if (readonlyFields.includes(field)) return;
                                    const count = parseInt(e.target.value, 10);
                                    let newVendors = [...vendors];
                                    if (count > newVendors.length) {
                                        while (newVendors.length < count) newVendors.push({});
                                    } else {
                                        newVendors = newVendors.slice(0, count);
                                    }
                                    updateField(field, JSON.stringify(newVendors));
                                };

                                return (
                                    <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 border p-4 rounded-lg bg-gray-50">
                                        <div className="flex flex-col md:flex-row gap-4 mb-4 border-b pb-4">
                                            <label className="flex-1">
                                                <span className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Towing Vendor Details Available?
                                                </span>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg bg-white ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={isAvailable ? "yes" : "no"}
                                                    onChange={handleAvailabilityChange}
                                                >
                                                    <option value="no">No</option>
                                                    <option value="yes">Yes</option>
                                                </select>
                                            </label>

                                            {isAvailable && (
                                                <label className="flex-1">
                                                    <span className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Number of Vendors
                                                    </span>
                                                    <select
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-3 py-2 rounded-lg bg-white ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={vendorCount}
                                                        onChange={handleCountChange}
                                                    >
                                                        <option value={1}>1</option>
                                                        <option value={2}>2</option>
                                                        <option value={3}>3</option>
                                                        <option value={4}>4</option>
                                                        <option value={5}>5</option>
                                                    </select>
                                                </label>
                                            )}
                                        </div>

                                        {isAvailable && vendors.map((v, index) => {
                                            const vendor = v || {};
                                            return (
                                                <div key={index} className="mb-6 last:mb-0 p-4 bg-white rounded border relative">
                                                    <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">
                                                        Vendor #{index + 1}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <label>
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Towing Vendor Name</span>
                                                            <input
                                                                type="text"
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={vendor.towingVendorName || ""}
                                                                onChange={(e) => updateVendor(index, "towingVendorName", e.target.value)}
                                                                placeholder="Enter Name"
                                                            />
                                                        </label>

                                                        <label>
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Contact No</span>
                                                            <input
                                                                type="text"
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={vendor.towingVendorContactNo || ""}
                                                                onChange={(e) => updateVendor(index, "towingVendorContactNo", e.target.value)}
                                                                placeholder="Enter Contact"
                                                            />
                                                        </label>

                                                        <label className="md:col-span-2">
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Address</span>
                                                            <input
                                                                type="text"
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={vendor.towingVendorAddress || ""}
                                                                onChange={(e) => updateVendor(index, "towingVendorAddress", e.target.value)}
                                                                placeholder="Enter Address"
                                                            />
                                                        </label>

                                                        <label>
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Invoice OD Towing</span>
                                                            <input
                                                                type="text"
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={vendor.invoiceOdTowing || ""}
                                                                onChange={(e) => updateVendor(index, "invoiceOdTowing", e.target.value)}
                                                                placeholder="Invoice Details"
                                                            />
                                                        </label>

                                                        <label>
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Where to Where</span>
                                                            <input
                                                                type="text"
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={vendor.whereToWhere || ""}
                                                                onChange={(e) => updateVendor(index, "whereToWhere", e.target.value)}
                                                                placeholder="Location Details"
                                                            />
                                                        </label>

                                                        <label>
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Towing Amount</span>
                                                            <input
                                                                type="text"
                                                                readOnly={readonlyFields.includes(field)}
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={vendor.towingAmount || ""}
                                                                onChange={(e) => updateVendor(index, "towingAmount", e.target.value)}
                                                                placeholder="Enter Amount"
                                                            />
                                                        </label>

                                                        <label>
                                                            <span className="text-xs font-semibold text-gray-600 block mb-1">Verified or Not</span>
                                                            <select
                                                                disabled={readonlyFields.includes(field)}
                                                                className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                                value={vendor.verifiedOrNot || ""}
                                                                onChange={(e) => updateVendor(index, "verifiedOrNot", e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="Verified">Verified</option>
                                                                <option value="Not Verified">Not Verified</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }

                            // Custom Logic for Garage Visit (Job Card Details)
                            if (sectionKey === "garageVisit" && field === "jobCardDetails") {
                                const jobCardData = currentSection[field] || {};
                                const isAvailable = jobCardData.availability === "yes";

                                const updateJobCardField = (subField, value) => {
                                    if (readonlyFields.includes(field)) return;
                                    const updated = { ...jobCardData, [subField]: value };
                                    updateField(field, updated);
                                };

                                return (
                                    <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 border p-4 rounded-lg bg-gray-50">
                                        <div className="mb-4">
                                            <label className="block">
                                                <span className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Job Card Details Available?
                                                </span>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg bg-white ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={jobCardData.availability || ""}
                                                    onChange={(e) => updateJobCardField("availability", e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="no">No</option>
                                                    <option value="yes">Yes</option>
                                                </select>
                                            </label>
                                        </div>

                                        {isAvailable && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                                                {/* Job Card No */}
                                                <label>
                                                    <span className="text-xs font-semibold text-gray-600 block mb-1">Job Card No</span>
                                                    <input
                                                        type="text"
                                                        readOnly={readonlyFields.includes(field)}
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={jobCardData.jobCardNo || ""}
                                                        onChange={(e) => updateJobCardField("jobCardNo", e.target.value)}
                                                        placeholder="Enter Job Card Number"
                                                    />
                                                </label>

                                                {/* Date of Job Card */}
                                                <label>
                                                    <span className="text-xs font-semibold text-gray-600 block mb-1">Date of Job Card</span>
                                                    <input
                                                        type="date"
                                                        readOnly={readonlyFields.includes(field)}
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={jobCardData.dateOfJobCard || ""}
                                                        onChange={(e) => updateJobCardField("dateOfJobCard", e.target.value)}
                                                    />
                                                </label>

                                                {/* Name of Garage */}
                                                <label>
                                                    <span className="text-xs font-semibold text-gray-600 block mb-1">Name of Garage</span>
                                                    <input
                                                        type="text"
                                                        readOnly={readonlyFields.includes(field)}
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={jobCardData.nameOfGarage || ""}
                                                        onChange={(e) => updateJobCardField("nameOfGarage", e.target.value)}
                                                        placeholder="Enter Garage Name"
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Custom Logic for Garage Visit (Vehicle Status After 24 Hours)
                            if (sectionKey === "garageVisit" && field === "vehicleStatusAfter24Hrs") {
                                const vehicleStatusData = currentSection[field] || {};
                                const isAvailable = vehicleStatusData.availability === "yes";

                                const updateVehicleStatusField = (subField, value) => {
                                    if (readonlyFields.includes(field)) return;
                                    const updated = { ...vehicleStatusData, [subField]: value };
                                    updateField(field, updated);
                                };

                                return (
                                    <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3 border p-4 rounded-lg bg-gray-50">
                                        <div className="mb-4">
                                            <label className="block">
                                                <span className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Vehicle Status After 24 Hours Available?
                                                </span>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg bg-white ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={vehicleStatusData.availability || ""}
                                                    onChange={(e) => updateVehicleStatusField("availability", e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="no">No</option>
                                                    <option value="yes">Yes</option>
                                                </select>
                                            </label>
                                        </div>

                                        {isAvailable && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                                {/* Check In Date and Time */}
                                                <label>
                                                    <span className="text-xs font-semibold text-gray-600 block mb-1">Check In Date and Time</span>
                                                    <input
                                                        type="datetime-local"
                                                        readOnly={readonlyFields.includes(field)}
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={vehicleStatusData.checkInDateTime || ""}
                                                        onChange={(e) => updateVehicleStatusField("checkInDateTime", e.target.value)}
                                                    />
                                                </label>

                                                {/* Check Out Date and Time */}
                                                <label>
                                                    <span className="text-xs font-semibold text-gray-600 block mb-1">Check Out Date and Time</span>
                                                    <input
                                                        type="datetime-local"
                                                        readOnly={readonlyFields.includes(field)}
                                                        disabled={readonlyFields.includes(field)}
                                                        className={`w-full border px-2 py-1.5 rounded ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                        value={vehicleStatusData.checkOutDateTime || ""}
                                                        onChange={(e) => updateVehicleStatusField("checkOutDateTime", e.target.value)}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Custom Logic for Spot Visit
                            if (sectionKey === "spotVisit") {
                                const spotVisitDependentFields = [
                                    "accidentSpotLatitude",
                                    "accidentSpotLongitude",
                                    "cctvAvailability"
                                ];
                                const isSpotVisitYes = (currentSection.spotVisitEnquiry || "").toLowerCase() === "yes";

                                if (field === "spotVisitEnquiry") {
                                    return (
                                        <div key={field} className="col-span-1 md:col-span-2 lg:col-span-3">
                                            <label className="block">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {uiLabel}
                                                    </span>
                                                </div>
                                                <select
                                                    disabled={readonlyFields.includes(field)}
                                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                                                    value={currentSection[field] || ""}
                                                    onChange={(e) => updateField(field, e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                                {error && (
                                                    <span className="text-xs text-red-500 mt-1 block font-medium">
                                                        {error}
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    );
                                }

                                if (spotVisitDependentFields.includes(field) && !isSpotVisitYes) {
                                    return null;
                                }
                            }




                            // ------------------------------------------------------------------------------------------------
                            // SPECIAL UI FOR INSURED DOCUMENTS (HIGH-END GRID)
                            // ------------------------------------------------------------------------------------------------
                            if (sectionKey === "insuredDocuments" && field === Object.keys(fieldsObj || {})[0]) {
                                // We render the ENTIRE section at once for the first field, then return null for others
                                const docs = fieldsObj || {};

                                const renderDocCard = (title, items, icon) => (
                                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8 last:mb-0 transition-all hover:shadow-md">
                                        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
                                                    {icon}
                                                </div>
                                                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">{title}</h3>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100 uppercase">Documents Group</span>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {items.map(itemKey => {
                                                const currentFileConfig = fileFields[itemKey];
                                                const currentUiLabel = itemKey
                                                    .replace(/rcPhoto/i, "RC Photo")
                                                    .replace(/rcverification/i, "RC Verification")
                                                    .replace(/dlPhoto/i, "DL Photo")
                                                    .replace(/dlverification/i, "DL Verification")
                                                    .replace(/insuredPanCardPhoto/i, "PAN Card Photo")
                                                    .replace(/insuredAadharCardPhoto/i, "Aadhar Card Photo")
                                                    .replace(/([A-Z])/g, ' $1')
                                                    .replace(/^./, str => str.toUpperCase())
                                                    .trim();

                                                const existingImgs = docs[itemKey];
                                                const isMultiple = currentFileConfig === "multiple" || currentFileConfig === "max-2";
                                                const limit = currentFileConfig === "max-2" ? 2 : (currentFileConfig === "max-1" ? 1 : null);

                                                return (
                                                    <div key={itemKey} className="space-y-5">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{currentUiLabel}</h4>
                                                            {limit && (
                                                                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                                    Max {limit} {limit > 1 ? 'Files' : 'File'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <DragDropUpload
                                                            id={`${sectionKey}-${itemKey}`}
                                                            accept="image/*"
                                                            multiple={isMultiple}
                                                            value={currentSection[itemKey]}
                                                            isOptional={true}
                                                            title="" // Clearing title as we have custom h4 above
                                                            limit={limit}
                                                            onMetadataChange={(metadata) => {
                                                                setFileMetadata(prev => ({ ...prev, [itemKey]: metadata }));
                                                            }}
                                                            onChange={(e) => {
                                                                const sFiles = e.target.files;

                                                                // Removal: sFiles is null/empty
                                                                if (!sFiles || sFiles.length === 0) {
                                                                    updateField(itemKey, isMultiple ? [] : null);
                                                                    return;
                                                                }

                                                                // Pre-array (from internal removal or something)
                                                                if (Array.isArray(sFiles)) {
                                                                    updateField(itemKey, sFiles);
                                                                    return;
                                                                }

                                                                // Selection append logic
                                                                const newFiles = Array.from(sFiles);

                                                                // Limit Enforcement
                                                                if (limit) {
                                                                    const currentCount = Array.isArray(currentSection[itemKey])
                                                                        ? currentSection[itemKey].length
                                                                        : (currentSection[itemKey] ? 1 : 0);

                                                                    if (currentCount + newFiles.length > limit) {
                                                                        toast.error(`Maximum ${limit} ${limit > 1 ? 'photos' : 'photo'} allowed for ${currentUiLabel}`);
                                                                        return;
                                                                    }
                                                                }

                                                                updateField(
                                                                    itemKey,
                                                                    isMultiple
                                                                        ? [...(currentSection[itemKey] || []), ...newFiles]
                                                                        : newFiles[0]
                                                                );
                                                            }}
                                                        />

                                                        {existingImgs && (
                                                            <div className="pt-2 border-t border-gray-50">
                                                                <ImageGallery
                                                                    images={existingImgs}
                                                                    title={currentUiLabel}
                                                                    caseId={caseId}
                                                                    sectionPath={apiPath}
                                                                    fieldName={itemKey}
                                                                    setForm={setForm}
                                                                    sectionKey={sectionKey}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );

                                return (
                                    <React.Fragment key="insured-docs-overide-wrapper">
                                        {/* GROUP 1: RC DETAILS */}
                                        {renderDocCard("1. Registration Certificate (RC)", ["rcPhoto", "rcverification"], <CreditCard className="w-5 h-5" />)}

                                        {/* GROUP 2: DL DETAILS */}
                                        {renderDocCard("2. Driving License (DL)", ["dlPhoto", "dlverification"], <FileText className="w-5 h-5" />)}

                                        {/* GROUP 3: PERSONAL IDS */}
                                        {renderDocCard("3. Identification Documents", ["insuredPanCardPhoto", "insuredAadharCardPhoto"], <Shield className="w-5 h-5" />)}
                                    </React.Fragment>
                                );
                            } else if (sectionKey === "insuredDocuments") {
                                // Skip individual rendering for other fields as they were handled as a group above
                                return null;
                            }

                            if (isFile) {
                                // Get existing uploaded images from fieldsObj (API data)
                                const existingImages = fieldsObj[field];
                                const isWitnessDoc = field === "witnessDocumentFront" || field === "witnessDocumentBack";

                                return (
                                    <div key={field} className={fileConfig === "multiple" ? "col-span-1 md:col-span-2 lg:col-span-3" : "col-span-1"}>

                                        {isWitnessDoc ? (
                                            <DocumentUpload
                                                field={field}
                                                title={uiLabel}
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
                                                title={uiLabel}
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
                                            <ImageGallery
                                                images={existingImages}
                                                title={uiLabel}
                                                caseId={caseId}
                                                sectionPath={apiPath}
                                                fieldName={field}
                                                setForm={setForm}
                                                sectionKey={sectionKey}
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
                                                {uiLabel}
                                            </span>
                                        </div>

                                        {type === "textarea" ? (
                                            <textarea
                                                readOnly={readonlyFields.includes(field)}
                                                disabled={loading || readonlyFields.includes(field)}
                                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all 
                                                    ${error ? "border-red-500 bg-red-50" : "border-gray-300"} 
                                                    ${readonlyFields.includes(field) ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}
                                                    ${loading ? "bg-gray-50 text-gray-500" : ""}
                                                `}
                                                rows={3}
                                                value={currentSection[field] || ""}
                                                onChange={(e) => updateField(field, e.target.value)}
                                                placeholder={`Enter ${uiLabel}...`}
                                            />
                                        ) : (
                                            <input
                                                type={type}
                                                readOnly={readonlyFields.includes(field)}
                                                disabled={loading || readonlyFields.includes(field)}
                                                step={type === 'number' ? "any" : undefined}
                                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all 
                                                    ${error ? "border-red-500 bg-red-50" : "border-gray-300"}
                                                    ${loading ? "bg-gray-50 text-gray-500" : ""}
                                                `}
                                                value={
                                                    (type === 'datetime-local' && currentSection[field])
                                                        ? (typeof currentSection[field] === 'string'
                                                            ? currentSection[field].slice(0, 16)
                                                            : (currentSection[field].$date ? currentSection[field].$date.slice(0, 16) : ""))
                                                        : (type === 'date' && currentSection[field])
                                                            ? (typeof currentSection[field] === 'string'
                                                                ? currentSection[field].slice(0, 10)
                                                                : (currentSection[field].$date ? currentSection[field].$date.slice(0, 10) : ""))
                                                            : (currentSection[field] || (field === 'referenceNumber' ? defaultFieldValues?.referenceNumber : "") || "")
                                                }
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (field.toLowerCase().includes("latitude") || field.toLowerCase().includes("longitude")) {
                                                        val = cleanNumericInput(val);
                                                    }
                                                    updateField(field, val);
                                                }}
                                                placeholder={type === 'date' ? '' : `Enter ${uiLabel}`}
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
                    </div >

                    <div className="mt-6 flex justify-end pb-2">
                        <button
                            onClick={() => withSaving(() => toast.promise(
                                handleSubmit(),
                                {
                                    loading: "Saving section...",
                                    success: "Section saved successfully!",
                                    error: (err) =>
                                        err?.response?.data?.message ||
                                        err.message ||
                                        "Failed to save section",
                                }
                            ))}
                            disabled={loading}
                            className={`px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
                </div >
            </div >
        </div >
    );
}

export default SectionUnit;

import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, X, Save, User } from "lucide-react";
import apiClient from "../services/apiClient";
import { confirmToast } from "./Ui/ConfirmToast";

const DOCUMENT_TYPES = ['Aadhar', 'PAN', 'DL', 'ID Card', 'Rashan Card'];

const WitnessManager = ({ caseId, witnesses = [], onUpdate, caseType = 'od' }) => {
    // Ensure witnesses is always an array
    const witnessArray = Array.isArray(witnesses) ? witnesses : [];

    // Determine the API base path based on case type
    const basePath = caseType === 'theft' ? '/theft-cases' : '/od-cases';

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        witnessName: "",
        witnessFatherName: "",
        witnessAddress: "",
        witnessPhone: "",
        witnessRelation: "",
        witnessStatement: "",
    });
    const [witnessPhoto, setWitnessPhoto] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [existingDocuments, setExistingDocuments] = useState([]);

    // Document Queue System
    const [queuedDocuments, setQueuedDocuments] = useState([]);
    const [currentDoc, setCurrentDoc] = useState({
        type: "",
        front: null,
        back: null
    });

    const frontDocRef = useRef(null);
    const backDocRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setFormData({
            witnessName: "",
            witnessFatherName: "",
            witnessAddress: "",
            witnessPhone: "",
            witnessRelation: "",
            witnessStatement: "",
        });
        setWitnessPhoto([]);
        setExistingPhotos([]);
        setExistingDocuments([]);
        setQueuedDocuments([]);
        setCurrentDoc({ type: "", front: null, back: null });
        if (frontDocRef.current) frontDocRef.current.value = "";
        if (backDocRef.current) backDocRef.current.value = "";
        setIsAdding(false);
        setEditingId(null);
    };

    const handleAddDocument = () => {
        const { type, front, back } = currentDoc;
        if (!type || !front || !back) {
            toast.error("Please provide Document Type, Front Image, and Back Image.");
            return;
        }
        setQueuedDocuments([...queuedDocuments, { ...currentDoc, id: Date.now() }]);
        setCurrentDoc({ type: "", front: null, back: null });
        if (frontDocRef.current) frontDocRef.current.value = "";
        if (backDocRef.current) backDocRef.current.value = "";
    };

    const handleRemoveDocument = (id) => {
        setQueuedDocuments(queuedDocuments.filter(doc => doc.id !== id));
    };

    const handleDeleteAsset = async (type, idOrPublicId) => {
        if (!editingId) return;
        confirmToast(
            `Delete this ${type}? This cannot be undone.`,
            async () => {
                const deletePromise = async () => {
                    const payload = type === 'photo'
                        ? { type: 'photo', publicId: idOrPublicId }
                        : { type: 'document', itemId: idOrPublicId };

                    const response = await apiClient.delete(`${basePath}/${caseId}/witnesses/${editingId}/assets`, {
                        data: payload
                    });

                    if (!response.data.success) {
                        throw new Error("Failed to delete asset");
                    }
                    return response.data;
                };

                await toast.promise(
                    deletePromise(),
                    {
                        loading: 'Deleting asset...',
                        success: 'Asset deleted successfully!',
                        error: "Failed to delete asset"
                    }
                ).then(() => {
                    if (type === 'photo') {
                        setExistingPhotos(prev => prev.filter(p => p.publicId !== idOrPublicId));
                    } else {
                        setExistingDocuments(prev => prev.filter(d => d._id !== idOrPublicId));
                    }
                });
            }
        );
    };

    // Validation removed as per user request

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        const submitPromise = async () => {
            if (formData.witnessPhone && !/^\d{10}$/.test(formData.witnessPhone)) {
                throw new Error("Please enter a valid 10-digit phone number");
            }
            
            // Validation: If there's unsaved document data, warn the user
            if (currentDoc.type || currentDoc.front || currentDoc.back) {
                throw new Error("You have unsaved document data. Please click 'Add Document to List' or clear it before saving the witness.");
            }

            const fd = new FormData();
            Object.keys(formData).forEach(key => {
                fd.append(key, formData[key]);
            });

            // Pass queued imageMetadata for backend processing titles/alts
            const imageMetadata = {
                witnessDocumentFront: [],
                witnessDocumentBack: [],
                witnessPhoto: []
            };

            // Pass queued Documents
            queuedDocuments.forEach((doc, _idx) => {
                fd.append('witnessDocumentFront', doc.front);
                fd.append('witnessDocumentBack', doc.back);
                // Metadata for this pair
                imageMetadata.witnessDocumentFront[_idx] = { title: doc.type };
                imageMetadata.witnessDocumentBack[_idx] = { title: doc.type };
            });

            // Pass Photos
            witnessPhoto.forEach((file, _idx) => {
                fd.append('witnessPhoto', file);
                imageMetadata.witnessPhoto[_idx] = { title: `Witness Photo ${_idx + 1}` };
            });

            fd.append('imageMetadata', JSON.stringify(imageMetadata));

            const url = editingId
                ? `${basePath}/${caseId}/witnesses/${editingId}`
                : `${basePath}/${caseId}/witnesses`;

            const response = editingId
                ? await apiClient.patch(url, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                : await apiClient.post(url, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            if (!response.data.success) {
                throw new Error(response.data.message || "Operation failed");
            }

            return response.data;
        };

        await toast.promise(
            submitPromise(),
            {
                loading: editingId ? 'Updating witness...' : 'Adding witness...',
                success: editingId ? 'Witness updated successfully!' : 'Witness added successfully!',
                error: (err) => {
                    console.error("Error submitting witness:", err);
                    const msg = err.response?.data?.message || err.message || "Failed to save witness";
                    if (msg.includes("witnessName_1 dup key")) {
                        return "A witness with this name already exists.";
                    }
                    return msg;
                }
            }
        ).then((data) => {
            onUpdate(data.data); // This updates the parent state
            resetForm();
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleEdit = (witness) => {
        setFormData({
            witnessName: witness.witnessName,
            witnessFatherName: witness.witnessFatherName || "",
            witnessAddress: witness.witnessAddress || "",
            witnessPhone: witness.witnessPhone || "",
            witnessRelation: witness.witnessRelation || "",
            witnessStatement: witness.witnessStatement || "",
        });
        setExistingPhotos(witness.witnessPhoto || []);
        setExistingDocuments(witness.witnessDocument || []);
        setEditingId(witness._id);
        setIsAdding(true);
        // Clean queue
        setQueuedDocuments([]);
        setWitnessPhoto([]);
    };

    const handleDelete = (witnessId) => {
        confirmToast(
            "Are you sure you want to delete this witness? This action cannot be undone.",
            async () => {
                const deletePromise = async () => {
                    const response = await apiClient.delete(`${basePath}/${caseId}/witnesses/${witnessId}`);
                    if (!response.data.success) {
                        throw new Error(response.data.message || "Failed to delete witness");
                    }
                    return response.data;
                };

                await toast.promise(
                    deletePromise(),
                    {
                        loading: 'Deleting witness...',
                        success: 'Witness deleted successfully!',
                        error: (err) => err.message || "Failed to delete witness"
                    }
                ).then(() => {
                    onUpdate(witnessArray.filter(w => w._id !== witnessId));
                });
            }
        );
    };

    return (
        <div className="p-6 border rounded-xl bg-white shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Witness Details</h2>
                <button
                    onClick={() => {
                        if (isAdding) {
                            resetForm();
                        } else {
                            resetForm();
                            setIsAdding(true);
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Cancel" : "Add Witness"}
                </button>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingId ? "Edit Witness" : "Add New Witness"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Witness Name
                            </label>
                            <input
                                type="text"
                                value={formData.witnessName}
                                onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter witness name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Father's Name
                            </label>
                            <input
                                type="text"
                                value={formData.witnessFatherName}
                                onChange={(e) => setFormData({ ...formData, witnessFatherName: e.target.value })}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter father's name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={formData.witnessPhone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setFormData({ ...formData, witnessPhone: val });
                                }}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="10-digit phone number"
                                maxLength={10}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Relation to Insured
                            </label>
                            <input
                                type="text"
                                value={formData.witnessRelation}
                                onChange={(e) => setFormData({ ...formData, witnessRelation: e.target.value })}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Friend, Relative, Passerby"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            value={formData.witnessAddress}
                            onChange={(e) => setFormData({ ...formData, witnessAddress: e.target.value })}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter witness address"
                            rows={2}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Witness Statement
                        </label>
                        <textarea
                            value={formData.witnessStatement}
                            onChange={(e) => setFormData({ ...formData, witnessStatement: e.target.value })}
                            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter witness statement or observations"
                            rows={4}
                        />
                    </div>


                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Witness Photos
                        </label>

                        {/* EXISTING PHOTOS */}
                        {existingPhotos.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Existing Photos:</p>
                                <div className="flex flex-wrap gap-2">
                                    {existingPhotos.map((photo, idx) => (
                                        <div key={idx} className="relative w-20 h-20 group">
                                            <img
                                                src={photo.imageUrl}
                                                alt={photo.title || `Existing photo`}
                                                className="w-full h-full object-cover rounded border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAsset('photo', photo.publicId)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                title="Delete this photo"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                    setWitnessPhoto(Array.from(files));
                                }
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                        {witnessPhoto.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs text-green-600 mb-2">✓ {witnessPhoto.length} new file(s) selected</p>
                                <div className="flex flex-wrap gap-2">
                                    {witnessPhoto.map((file, idx) => (
                                        <div key={idx} className="relative w-20 h-20 group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${idx}`}
                                                className="w-full h-full object-cover rounded border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setWitnessPhoto(witnessPhoto.filter((_, i) => i !== idx))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                            <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                Document Uploads
                            </label>
                        </div>

                        {/* EXISTING DOCUMENTS */}
                        {existingDocuments.length > 0 && (
                            <div className="mb-8 space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Saved Documents</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {existingDocuments.map((doc, idx) => (
                                        <div key={doc._id || idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                    <Save className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-sm text-gray-800">{doc.title || 'Document'}</span>
                                                    <div className="flex gap-2 text-[10px] font-semibold">
                                                        {doc.front && (
                                                            <a href={doc.front.imageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">VIEW FRONT</a>
                                                        )}
                                                        <span className="text-gray-300">|</span>
                                                        {doc.back && (
                                                            <a href={doc.back.imageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">VIEW BACK</a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAsset('document', doc._id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete this document"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Document Type</label>
                                    <select
                                        value={currentDoc.type}
                                        onChange={(e) => setCurrentDoc({ ...currentDoc, type: e.target.value })}
                                        className="w-full border border-gray-300 px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    >
                                        <option value="">Select Type</option>
                                        {DOCUMENT_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <p className="mt-3 text-[10px] text-gray-500 font-medium italic">Requirement: Both sides must be uploaded.</p>
                                </div>

                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Front Side</label>
                                    <div 
                                        onClick={() => frontDocRef.current?.click()}
                                        className={`relative h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${currentDoc.front ? 'border-indigo-500 bg-white' : 'border-gray-200 hover:border-indigo-400 bg-white'}`}
                                    >
                                        {currentDoc.front ? (
                                            <img src={URL.createObjectURL(currentDoc.front)} className="w-full h-full object-cover" alt="Front Preview" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Plus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <span className="text-[10px] font-bold text-gray-400">UPLOAD FRONT</span>
                                            </div>
                                        )}
                                        <input
                                            ref={frontDocRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setCurrentDoc({ ...currentDoc, front: e.target.files[0] })}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Back Side</label>
                                    <div 
                                        onClick={() => backDocRef.current?.click()}
                                        className={`relative h-40 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${currentDoc.back ? 'border-indigo-500 bg-white' : 'border-gray-200 hover:border-indigo-400 bg-white'}`}
                                    >
                                        {currentDoc.back ? (
                                            <img src={URL.createObjectURL(currentDoc.back)} className="w-full h-full object-cover" alt="Back Preview" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Plus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <span className="text-[10px] font-bold text-gray-400">UPLOAD BACK</span>
                                            </div>
                                        )}
                                        <input
                                            ref={backDocRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setCurrentDoc({ ...currentDoc, back: e.target.files[0] })}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentDoc({ type: "", front: null, back: null });
                                        if (frontDocRef.current) frontDocRef.current.value = "";
                                        if (backDocRef.current) backDocRef.current.value = "";
                                        toast.success("Document selection cleared");
                                    }}
                                    className="px-6 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Clear Selection
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddDocument}
                                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-indigo-100 shadow-lg active:scale-95"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Document to List
                                </button>
                            </div>
                        </div>

                        {queuedDocuments.length > 0 && (
                            <div className="mt-8">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Pending Uploads ({queuedDocuments.length})</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {queuedDocuments.map((doc, idx) => (
                                        <div key={doc.id} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                            <div className="grid grid-cols-2 h-28 border-b border-gray-50">
                                                <div className="relative overflow-hidden border-r border-gray-50">
                                                    <img src={URL.createObjectURL(doc.front)} className="w-full h-full object-cover" alt="Front" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/40 py-1 text-[8px] text-white text-center font-bold">FRONT</div>
                                                </div>
                                                <div className="relative overflow-hidden">
                                                    <img src={URL.createObjectURL(doc.back)} className="w-full h-full object-cover" alt="Back" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/40 py-1 text-[8px] text-white text-center font-bold">BACK</div>
                                                </div>
                                            </div>
                                            <div className="p-3 flex justify-between items-center bg-gray-50/30">
                                                <span className="font-bold text-xs text-indigo-900">{doc.type}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDocument(doc.id)}
                                                    className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                                                    title="Remove"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Saving..." : editingId ? "Update Witness" : "Add Witness"}
                        </button>
                    </div>
                </form>
            )}

            {/* Witnesses List */}
            <div className="space-y-4">
                {witnessArray.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No witnesses added yet</p>
                    </div>
                ) : (
                    witnessArray.map((witness, index) => (
                        <div key={witness._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Witness #{index + 1}: {witness.witnessName}
                                    </h4>
                                    {witness.witnessFatherName && (
                                        <p className="text-sm text-gray-600 mt-1">Father's Name: {witness.witnessFatherName}</p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-1">{witness.witnessAddress}</p>
                                    {witness.witnessPhone && (
                                        <p className="text-sm text-gray-600">Phone: {witness.witnessPhone}</p>
                                    )}
                                    {witness.witnessRelation && (
                                        <p className="text-sm text-gray-600">Relation: {witness.witnessRelation}</p>
                                    )}
                                    {witness.witnessStatement && (
                                        <p className="text-sm text-gray-600 mt-2 italic">"{witness.witnessStatement}"</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(witness)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit witness"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(witness._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete witness"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Display Photos */}
                            {witness.witnessPhoto && witness.witnessPhoto.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-600 mb-2">Photos:</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {witness.witnessPhoto.map((photo, idx) => (
                                            <img
                                                key={idx}
                                                src={photo.imageUrl}
                                                alt={photo.title || `Witness photo ${idx + 1}`}
                                                className="w-full h-20 object-cover rounded border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Display Documents */}
                            {witness.witnessDocument && witness.witnessDocument.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-600 mb-2">Documents:</p>
                                    <div className="space-y-2">
                                        {witness.witnessDocument.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-gray-700">{doc.title || 'Document'}:</span>
                                                {doc.front && (
                                                    <img src={doc.front.imageUrl} alt="Front" className="w-16 h-16 object-cover rounded border" />
                                                )}
                                                {doc.back && (
                                                    <img src={doc.back.imageUrl} alt="Back" className="w-16 h-16 object-cover rounded border" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WitnessManager;

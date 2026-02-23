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
                        success: () => {
                            if (type === 'photo') {
                                setExistingPhotos(prev => prev.filter(p => p.publicId !== idOrPublicId));
                            } else {
                                setExistingDocuments(prev => prev.filter(d => d._id !== idOrPublicId));
                            }
                            return "Asset deleted successfully";
                        },
                        error: "Failed to delete asset"
                    }
                );
            }
        );
    };

    // Validation removed as per user request

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitPromise = async () => {
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
            queuedDocuments.forEach((doc, idx) => {
                fd.append('witnessDocumentFront', doc.front);
                fd.append('witnessDocumentBack', doc.back);
                // Metadata for this pair
                imageMetadata.witnessDocumentFront[idx] = { title: doc.type };
                imageMetadata.witnessDocumentBack[idx] = { title: doc.type };
            });

            // Pass Photos
            witnessPhoto.forEach((file, idx) => {
                fd.append('witnessPhoto', file);
                imageMetadata.witnessPhoto[idx] = { title: `Witness Photo ${idx + 1}` };
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
                success: (data) => {
                    onUpdate(data.data); // This updates the parent state
                    if (resetForm) resetForm();
                    return editingId ? "Witness updated successfully" : "Witness added successfully";
                },
                error: (err) => {
                    console.error("Error submitting witness:", err);
                    const msg = err.response?.data?.message || err.message || "Failed to save witness";
                    if (msg.includes("witnessName_1 dup key")) {
                        return "A witness with this name already exists.";
                    }
                    return msg;
                }
            }
        );
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
                        success: () => {
                            onUpdate(witnessArray.filter(w => w._id !== witnessId));
                            return "Witness deleted successfully";
                        },
                        error: (err) => err.message || "Failed to delete witness"
                    }
                );
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
                                onChange={(e) => setFormData({ ...formData, witnessPhone: e.target.value })}
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

                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Document Uploads
                        </label>

                        {/* EXISTING DOCUMENTS */}
                        {existingDocuments.length > 0 && (
                            <div className="mb-4 space-y-2">
                                <h4 className="text-xs font-semibold text-gray-600">Existing Documents</h4>
                                {existingDocuments.map((doc, idx) => (
                                    <div key={doc._id || idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-sm text-gray-700">{doc.title || 'Document'}</span>
                                            <div className="flex gap-1 text-xs text-gray-500">
                                                {doc.front && (
                                                    <a href={doc.front.imageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Front</a>
                                                )}
                                                <span className="mx-1">|</span>
                                                {doc.back && (
                                                    <a href={doc.back.imageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Back</a>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAsset('document', doc._id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete this document"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mb-4">Add multiple documents (e.g. Aadhar, PAN). Front and Back images are required for each.</p>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Document Type</label>
                                <select
                                    value={currentDoc.type}
                                    onChange={(e) => setCurrentDoc({ ...currentDoc, type: e.target.value })}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Type</option>
                                    {DOCUMENT_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Front Side</label>
                                <input
                                    ref={frontDocRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCurrentDoc({ ...currentDoc, front: e.target.files[0] })}
                                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Back Side</label>
                                <input
                                    ref={backDocRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCurrentDoc({ ...currentDoc, back: e.target.files[0] })}
                                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddDocument}
                            className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                        >
                            + Add to List
                        </button>

                        {queuedDocuments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-xs font-semibold text-gray-600">Pending Documents ({queuedDocuments.length})</h4>
                                {queuedDocuments.map((doc, idx) => (
                                    <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-sm text-gray-700">{doc.type}</span>
                                            <div className="flex gap-1 text-xs text-gray-500">
                                                <span>Front: {doc.front.name}</span>
                                                <span className="mx-1">|</span>
                                                <span>Back: {doc.back.name}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDocument(doc.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
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

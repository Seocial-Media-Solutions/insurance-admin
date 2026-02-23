import React, { useState } from "react";
import DragDropUpload from "../../../components/Ui/DragDropUpload";

const DocumentUpload = ({
    field,
    value,
    title,
    onUpload,
    onMetadataChange,
    acceptedTypes
}) => {
    const [selectedTitle, setSelectedTitle] = useState("");

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setSelectedTitle(newTitle);

        // Pass metadata immediately when title changes
        if (onMetadataChange) {
            onMetadataChange({ title: newTitle });
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700 w-1/3">
                    {title}
                </label>
                <select
                    className="w-2/3 border px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedTitle}
                    onChange={handleTitleChange}
                // If this field requires a title, you might want strict validation, 
                // but for now we just provide the dropdown
                >
                    <option value="">Select Document Type</option>
                    {['Aadhar', 'PAN', 'DL', 'ID Card', 'Rashan Card'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>

            <div className={!selectedTitle ? "opacity-50 pointer-events-none" : ""}>
                <DragDropUpload
                    id={`doc-upload-${field}`}
                    accept={acceptedTypes || "image/*"}
                    multiple={false}
                    value={value}
                    isOptional={true}
                    title={`Upload ${title} ${selectedTitle ? `(${selectedTitle})` : ''}`}
                    // We've already handled metadata change above, but DragDrop might trigger it too if used strictly
                    // Here we ensure the file upload uses the current selected title
                    onMetadataChange={(meta) => onMetadataChange({ ...meta, title: selectedTitle })}
                    onChange={onUpload}
                />
            </div>
            {!selectedTitle && (
                <p className="text-xs text-orange-500">Please select a document type to enable upload.</p>
            )}
        </div>
    );
};

export default DocumentUpload;

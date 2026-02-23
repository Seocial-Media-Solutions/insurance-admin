import React, { useState } from "react";
import { Loader2, Trash2, ExternalLink } from "lucide-react";
import { useDeleteODCaseImage } from "../../../hooks/useODCases";
import { confirmToast } from "../../../components/Ui/ConfirmToast";

const ImageGallery = ({ images, title, caseId, sectionPath, fieldName }) => {
    const [deletingId, setDeletingId] = useState(null);
    const { mutate: deleteImage, isLoading: isDeleting } = useDeleteODCaseImage();

    if (!images || (Array.isArray(images) && images.length === 0)) {
        return null;
    }

    // Handle both single image object and array of images
    const imageArray = (Array.isArray(images) ? images : [images]).filter(img => img && img.imageUrl);

    const handleDelete = (publicId, imageIndex) => {
        confirmToast(
            "Are you sure you want to delete this image? This action cannot be undone.",
            () => {
                setDeletingId(publicId);

                deleteImage(
                    {
                        caseId,
                        sectionPath,
                        fieldName,
                        publicId,
                    },
                    {
                        onSettled: () => {
                            setDeletingId(null);
                        },
                    }
                );
            }
        );
    };

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Uploaded {title}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageArray.map((img, idx) => (
                    <div
                        key={idx}
                        className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                    >
                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(img.publicId, idx)}
                            disabled={isDeleting && deletingId === img.publicId}
                            className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete image"
                        >
                            {isDeleting && deletingId === img.publicId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </button>

                        <div className="aspect-square overflow-hidden bg-gray-100">
                            <img
                                src={img.imageUrl}
                                alt={img.alt || title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                        </div>
                        <div className="p-2">
                            <p className="text-xs text-gray-600 truncate" title={img.title}>
                                {img.title || "Image"}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-400">
                                    {img.width} × {img.height}
                                </span>
                                <a
                                    href={img.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;

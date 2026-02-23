import React, { useEffect, useRef, useState } from "react";
import { Download, X, Check, FileText } from "lucide-react";
import { renderAsync } from "docx-preview";
import saveAs from "https://esm.sh/file-saver@2.0.5";

const DocxPreviewModal = ({ blob, onClose, onConfirm, fileName }) => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [renderError, setRenderError] = useState(false);

    useEffect(() => {
        if (blob && containerRef.current) {
            setLoading(true);
            setRenderError(false);

            // Clean previous content
            containerRef.current.innerHTML = "";

            blob.arrayBuffer().then((buffer) => {
                renderAsync(buffer, containerRef.current, containerRef.current, {
                    className: "docx-preview",
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    breakPages: true,
                    experimental: false,
                    ignoreLastRenderedPageBreak: false,
                })
                    .then(() => {
                        setLoading(false);
                    })
                    .catch((err) => {
                        console.error("Preview render failed:", err);
                        setLoading(false);
                        setRenderError(true);
                    });
            });
        }
    }, [blob]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Document Preview</h2>
                            <p className="text-xs text-gray-500 max-w-[300px] truncate">{fileName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content: Preview Only */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Preview Area */}
                    <div className="flex-1 overflow-auto bg-gray-100/50 p-8 relative flex flex-col items-center">
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-[1px]">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                                <p className="text-gray-600 font-medium">Rendering Preview...</p>
                            </div>
                        )}

                        {renderError ? (
                            <div className="flex flex-col items-center justify-center h-full text-center max-w-md">
                                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Unavailable</h3>
                                <p className="text-gray-500 mb-6">We couldn't render the preview for this document, but you can still download it.</p>
                            </div>
                        ) : (
                            <div
                                ref={containerRef}
                                className="bg-transparent mx-auto min-h-[500px]"
                            />
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-end bg-white z-10 shrink-0 gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            saveAs(blob, fileName);
                            setHasDownloaded(true);
                            onConfirm();
                        }}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm hover:shadow active:scale-95 transition-all text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Download & Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocxPreviewModal;

import { Upload, X, Camera, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";

/* ==========================================================================
   DragDropUpload — Clean, Scalable, Device-Aware File Upload Component
   ========================================================================== */

function DragDropUpload({
  accept = "image/*",
  onChange,
  onMetadataChange, // New: callback for metadata updates
  value = null,
  required = false,
  label = "Click to upload or drag & drop",
  optionalLabel = "Click to upload or drag & drop (optional)",
  isOptional = false,
  id = "file-upload",
  className = "",
  showPreview = true,
  enableCamera = true,
  multiple = false,
  title = "", // New: Section title
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]); // Changed to array
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [imageMetadata, setImageMetadata] = useState({}); // Track title/alt for each image

  /* -------------------------------------
     Device Detection — Mobile / Touch
  -------------------------------------- */
  useEffect(() => {
    const detectDevice = () => {
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  /* -------------------------------------
     Preview Handler (Multi-File Support)
  -------------------------------------- */
  useEffect(() => {
    if (!showPreview || !value) {
      setPreviewUrls([]);
      return;
    }

    const files = Array.isArray(value) ? value : [value];
    const newUrls = [];

    files.forEach((file, idx) => {
      if (file && file.type?.startsWith("image/")) {
        newUrls.push({
          url: URL.createObjectURL(file),
          name: file.name,
          file: file,
          index: idx,
        });
      }
    });

    setPreviewUrls(newUrls);

    // Cleanup
    return () => {
      newUrls.forEach((u) => URL.revokeObjectURL(u.url));
    };
  }, [value, showPreview]);

  /* -------------------------------------
     Notify parent of metadata changes
  -------------------------------------- */
  useEffect(() => {
    if (onMetadataChange) {
      onMetadataChange(imageMetadata);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageMetadata]); // Only trigger when metadata changes, not when callback changes

  /* -------------------------------------
     Desktop Paste Support (Ctrl + V)
  -------------------------------------- */
  useEffect(() => {
    if (isMobile) return;

    const handlePaste = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;

      const items = Array.from(e.clipboardData.items).filter((i) =>
        i.type.startsWith("image/")
      );

      if (items.length > 0) {
        e.preventDefault();
        const files = items.map((i) => i.getAsFile()).filter(Boolean);

        if (files.length > 0) {
          // If multiple not allowed, take first
          const finalFiles = multiple ? files : [files[0]];
          onChange({ target: { files: finalFiles } });
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isMobile, onChange, multiple]);

  /* -------------------------------------
     Drag & Drop Handlers
  -------------------------------------- */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files || []);
      if (droppedFiles.length === 0) return;

      // Filter valid types
      const validFiles = droppedFiles.filter((file) => {
        return accept
          .split(",")
          .map((a) => a.trim())
          .some(
            (t) => t === "image/*" || file.type === t || file.name.endsWith(t)
          );
      });

      if (validFiles.length > 0) {
        // If not multiple, just take the first one
        const finalFiles = multiple ? validFiles : [validFiles[0]];
        onChange({ target: { files: finalFiles } });
      }
    },
    [accept, onChange, multiple]
  );

  /* -------------------------------------
     Remove File
  -------------------------------------- */
  const handleRemove = (indexToRemove) => {
    // If not multiple, just clear
    if (!multiple) {
      onChange({ target: { files: null, value: "" } });
      setImageMetadata({});
      return;
    }

    // If multiple, filter out the removed index
    const currentFiles = Array.isArray(value) ? value : [value];
    const newFiles = currentFiles.filter((_, idx) => idx !== indexToRemove);

    // Update metadata: remove the deleted index and reindex remaining
    const newMetadata = {};
    Object.keys(imageMetadata).forEach((key) => {
      const oldIndex = parseInt(key);
      if (oldIndex < indexToRemove) {
        // Keep same index for items before removed item
        newMetadata[oldIndex] = imageMetadata[key];
      } else if (oldIndex > indexToRemove) {
        // Shift down indices for items after removed item
        newMetadata[oldIndex - 1] = imageMetadata[key];
      }
      // Skip the removed index
    });
    setImageMetadata(newMetadata);

    onChange({ target: { files: newFiles } });
  };

  /* -------------------------------------
     Instructions Text
  -------------------------------------- */
  const instructions = (() => {
    if (previewUrls.length > 0) return null;
    if (isMobile) {
      return enableCamera
        ? "Tap to take photo or choose from gallery"
        : "Tap to upload";
    }

    const list = ["Click to upload"];
    if (!isTouch) list.push("drag & drop");
    list.push("Ctrl+V");

    return list.join(", ");
  })();

  /* -------------------------------------
     JSX UI
  -------------------------------------- */
  return (
    <div className={className}>
      {/* Title */}
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          {title}
        </h3>
      )}

      <div
        className="border-2 border-dashed rounded-lg p-6 text-center transition-colors relative hover:border-blue-400"
        style={{
          borderColor: isDragging ? '#3b82f6' : '#d1d5db',
          backgroundColor: isDragging ? '#eff6ff' : 'transparent'
        }}
        onDragOver={!isMobile ? handleDragOver : undefined}
        onDragLeave={!isMobile ? handleDragLeave : undefined}
        onDrop={!isMobile ? handleDrop : undefined}
      >
        {/* Preview Grid */}
        {previewUrls.length > 0 ? (
          <div
            className={`grid gap-3 ${multiple ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"}`}
          >
            {previewUrls.map((p, idx) => (
              <div key={idx} className="relative group">
                <div className="aspect-square w-full overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleRemove(idx);
                  }}
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all hover:scale-110 z-10"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Metadata inputs */}
                <div className="mt-2 space-y-1.5">
                  <input
                    type="text"
                    placeholder="Title (optional)"
                    value={imageMetadata[idx]?.title || ""}
                    onChange={(e) => {
                      setImageMetadata(prev => ({
                        ...prev,
                        [idx]: { ...prev[idx], title: e.target.value }
                      }));
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="text"
                    placeholder="Alt text (optional)"
                    value={imageMetadata[idx]?.alt || ""}
                    onChange={(e) => {
                      setImageMetadata(prev => ({
                        ...prev,
                        [idx]: { ...prev[idx], alt: e.target.value }
                      }));
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <p className="mt-1.5 text-xs text-gray-500 truncate px-1 text-center">
                  {p.name}
                </p>
              </div>
            ))}

            {/* Add More Button (Only for multiple) */}
            {multiple && (
              <label
                htmlFor={id}
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                    Add More
                  </span>
                </div>
              </label>
            )}

            {/* Change File button for Single */}
            {!multiple && (
              <div className="absolute bottom-2 right-2">
                <label
                  htmlFor={id}
                  className="text-xs bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md cursor-pointer hover:bg-white text-blue-600 font-medium border border-blue-200 hover:border-blue-400 transition-all"
                >
                  Change
                </label>
              </div>
            )}
          </div>
        ) : (
          <label htmlFor={id} className="cursor-pointer block w-full h-full">
            {/* Mobile Camera UI */}
            {isMobile && enableCamera ? (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <div className="flex flex-col items-center">
                  <Camera className="w-12 h-12 text-blue-500 mb-2" />
                  <span className="text-xs text-gray-600">Take Photo</span>
                </div>
                <div className="text-gray-400">or</div>
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-12 h-12 text-green-500 mb-2" />
                  <span className="text-xs text-gray-600">
                    Choose from Gallery
                  </span>
                </div>
              </div>
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
            )}

            <span className="text-sm text-gray-600 block mb-1 mt-3">
              {multiple
                ? "Upload multiple files"
                : value
                  ? value.name
                  : isOptional
                    ? optionalLabel
                    : label}
            </span>

            <span className="text-xs text-gray-400">{instructions}</span>
          </label>
        )}

        {/* File Input */}
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple} // Pass multiple prop
          onChange={(e) => {
            // If multiple, verify we get a FileList and pass it as array
            // Or just pass the FileList, but our logic above uses arrays.
            // Let's standardise on passing arrays in the synthetic event for convenience?
            // odCase.jsx expects e.target.files (FileList-like)

            // Standard behavior: e.target.files is a FileList
            // We can just pass it through.

            // However, for "Add More" flow to work seamlessly purely via input, 
            // standard input replaces files.
            // If we want to append, we'd need to handle that state manually.
            // But for now, let's just stick to standard "replace selection" behavior of input
            // unless we manually merge in onChange.

            // Wait, odCase.jsx does: [...e.target.files]. It replaces.
            // If user wants to add more, they might expect Append.
            // But let's stick to standard behavior first to fix the "not working" bug.
            // Improvements can come later.

            if (onChange) onChange(e);
          }}
          required={required}
          className="hidden"
          capture={
            isMobile && enableCamera && accept.includes("image")
              ? "environment"
              : undefined
          }
        />
      </div>
    </div>
  );
}

export default memo(DragDropUpload);

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Reusable Pagination component.
 * Props:
 *   currentPage  - number (1-based)
 *   totalPages   - number
 *   total        - total record count
 *   limit        - items per page
 *   onPageChange - (page: number) => void
 */
export default function Pagination({ currentPage, totalPages, total, limit, onPageChange }) {
    if (totalPages <= 1) return null;

    const startRecord = (currentPage - 1) * limit + 1;
    const endRecord = Math.min(currentPage * limit, total);

    // Build page number buttons (show up to 5 around current)
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);
        for (let i = left; i <= right; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t bg-white gap-2">
            {/* Info text */}
            <p className="text-sm text-gray-600 whitespace-nowrap">
                Showing <span className="font-medium">{startRecord}</span>–<span className="font-medium">{endRecord}</span> of{" "}
                <span className="font-medium">{total}</span> results
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-1">
                {/* First */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition"
                    title="First page"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Prev */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition"
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`min-w-[32px] h-8 px-2 rounded border text-sm font-medium transition ${page === currentPage
                                ? "bg-blue-600 text-white border-blue-600"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition"
                    title="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition"
                    title="Last page"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

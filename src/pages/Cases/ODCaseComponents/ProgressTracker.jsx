import React from "react";
import { formatLabel, getNestedValue } from "../../../utils/odCaseHelpers";
import { PanelRight } from "lucide-react";

const ProgressTracker = ({ sections, activeSection, onSectionClick, form, onToggle }) => {
    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-2">
                {sections.map((sec) => {
                    const isActive = activeSection === sec.key;
                    // Check if section has any data filled
                    let hasData = false;

                    if (sec.key === 'witnessDetails' || sec.key === 'enclosures' || sec.key === 'dlParticulars' || sec.key === 'policeRecordDetails') {
                        // Special check for arrays or complex objects
                        const val = getNestedValue(form, sec.key);
                        if (Array.isArray(val)) {
                            hasData = val.length > 0;
                        } else if (val && typeof val === 'object') {
                            // policeRecordDetails is object but has rtiDetails array inside
                            hasData = Object.values(val).some(v => v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== ""));
                        }
                    } else {
                        const currentData = getNestedValue(form, sec.key);
                        hasData = currentData && typeof currentData === 'object'
                            ? Object.values(currentData).some(v => v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== ""))
                            : false;
                    }

                    return (
                        <button
                            key={sec.key}
                            onClick={() => onSectionClick(sec.key)}
                            className={` w-full
                                flex items-center justify-between w-full px-2 py-1 rounded-lg text-left text-[12px] font-medium transition-all border
                                ${isActive
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200"
                                    : hasData
                                        ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }
                            `}
                        >
                            <span className="truncate mr-2">
                                {sec.label || formatLabel(sec.key.split('.').pop())}
                            </span>

                            {hasData && !isActive && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressTracker;

import React from "react";
import { formatLabel, getNestedValue } from "../../../../utils/odCaseHelpers";

const TheftProgressTracker = ({ sections, activeSection, onSectionClick, form }) => {
    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-2">
                {sections.map((sec) => {
                    const isActive = activeSection === sec.key;
                    // Check if section has any data filled
                    let hasData = false;

                    const val = getNestedValue(form, sec.key);
                    if (Array.isArray(val)) {
                        hasData = val.length > 0;
                    } else if (val && typeof val === 'object') {
                        hasData = Object.values(val).some(v => v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== ""));
                    }

                    return (
                        <button
                            key={sec.key}
                            onClick={() => onSectionClick(sec.key)}
                            className={` w-full
                                flex items-center justify-between w-full px-2 py-1 rounded-lg text-left text-[12px] font-medium transition-all border
                                ${isActive
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-200"
                                    : hasData
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }
                            `}
                        >
                            <span className="truncate mr-2">
                                {sec.label || formatLabel(sec.key.split('.').pop())}
                            </span>

                            {hasData && !isActive && (
                                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TheftProgressTracker;

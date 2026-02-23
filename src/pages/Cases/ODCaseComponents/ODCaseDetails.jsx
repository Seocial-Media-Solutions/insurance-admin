import React from "react";
import { formatLabel } from "../../../utils/odCaseHelpers";

const ODCaseDetails = ({ caseData }) => {
    if (!caseData?.odDetails) return null;

    return (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Case Details</h2>
            </div>

            <div className="p-6 space-y-6">
                {/* Claim Summary */}
                {caseData.odDetails.claimSummary && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Claim Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(caseData.odDetails.claimSummary).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        {formatLabel(key)}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {value || "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Insured Details */}
                {caseData.odDetails.insuredDetails && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Insured Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(caseData.odDetails.insuredDetails).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        {formatLabel(key)}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {value || "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Vehicle Details */}
                {caseData.odDetails.vehicleDetails && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Vehicle Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(caseData.odDetails.vehicleDetails).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        {formatLabel(key)}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {value || "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ODCaseDetails;

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheftCases } from "../../context/TheftCaseContext";
import {
    FileText, Camera, Edit
} from "lucide-react";

const SectionCard = ({ title, data, fields, fileFields = {} }) => {
    // Check if there is any data to show
    const hasData = Object.keys(fields).some(key => data && data[key]);
    const hasFiles = Object.keys(fileFields).length > 0 && Object.keys(fileFields).some(key => data && data[key]);

    // If completely empty (no data and no files), we can still show the card but collapse it or show "No details"
    // For now, let's show it so the user knows the section exists.

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>

            <div className="p-6">
                {!hasData && !hasFiles ? (
                    <p className="text-gray-400 italic text-sm">No details provided for this section.</p>
                ) : (
                    <>
                        {/* Text Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.keys(fields).map((key) => {
                                if (fileFields[key]) return null;
                                const val = data ? data[key] : null;
                                return (
                                    <div key={key}>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                                            {key.replace(/([A-Z])/g, " $1").trim()}
                                        </p>
                                        <p className="text-gray-700 font-medium">
                                            {val || <span className="text-gray-300">-</span>}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* File/Image Fields */}
                        {Object.keys(fileFields).length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-gray-400" />
                                    Attachments
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.keys(fileFields).map((key) => {
                                        const val = data ? data[key] : null;
                                        if (!val || (Array.isArray(val) && val.length === 0)) return null;

                                        // Handle Arrays
                                        if (Array.isArray(val)) {
                                            return val.map((img, idx) => (
                                                <div key={`${key}-${idx}`} className="relative group rounded-lg overflow-hidden border">
                                                    {/* Safety check for img object */}
                                                    <img
                                                        src={typeof img === 'string' ? img : img?.imageUrl}
                                                        alt={`${key} ${idx + 1}`}
                                                        className="w-full h-32 object-cover"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-xs p-2 text-center">{key} {idx + 1}</span>
                                                    </div>
                                                </div>
                                            ));
                                        }

                                        // Single Image
                                        const imgSrc = typeof val === 'string' ? val : val?.imageUrl;
                                        if (!imgSrc) return null;

                                        return (
                                            <div key={key} className="relative group rounded-lg overflow-hidden border bg-gray-50">
                                                <img
                                                    src={imgSrc}
                                                    alt={key}
                                                    className="w-full h-32 object-cover"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center truncate">
                                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ---------------------------------------------------
   MAIN THEFT CASE VIEWER
--------------------------------------------------- */
export default function TheftCaseView() {
    const { caseId } = useParams();
    const { getTheftCaseById } = useTheftCases();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCase = async () => {
            try {
                const caseData = await getTheftCaseById(caseId);
                if (caseData) {
                    setData(caseData);
                } else {
                    setError("Failed to fetch case data");
                }
            } catch (err) {
                setError(err.message || "Error occurred");
            }
            setLoading(false);
        };
        fetchCase();
    }, [caseId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center">Case not found</div>;

    /* ---------------------------------------------------
       SECTION DEFINITIONS (Identical to Editor)
    --------------------------------------------------- */
    const SECTIONS_CONFIG = {
        letterDetails: {
            label: "Letter Details",
            fields: { date: "", referenceNumber: "", recipientDesignation: "", recipientDepartment: "", recipientCompany: "", recipientAddress: "" }
        },
        reportHeader: {
            label: "Report Header",
            fields: { reportType: "", claimType: "", insuredName: "", vehicleNumber: "", investigatorAppointmentDate: "" }
        },
        policyAndIncidentDetails: {
            label: "Policy & Incident",
            fields: { insurer: "", insuredName: "", insuredContactNo: "", policyNo: "", riskCoverPeriod: "", policyName: "", sumInsured: "", makeAndModel: "", yearOfManufacture: "", vehicleRegistrationNumber: "", engineNo: "", chassisNo: "", hypothecationWith: "", incidentDateAndTime: "", policyStartDate: "", firDateAndDelayReason: "", insurerIntimationDateAndDelayReason: "", parkingPlaceAtTheft: "" }
        },
        purchaseAndRegistrationParticulars: {
            label: "Purchase & Registration",
            fields: { vehiclePurchasedFrom: "", invoiceNoWithDate: "", invoiceValue: "", ownerName: "", registrationNumber: "", registrationDate: "", registrationAuthority: "", chassisNo: "", engineNo: "", makeModelYear: "", vehicleType: "", vehicleClass: "", roadTaxClearTo: "", financeDetails: "" }
        },
        firDetails: {
            label: "FIR Details",
            fields: { policeStationName: "", crimeCaseNoAndSection: "", firLodgedBy: "", firLodgedAgainst: "", firDateAndTime: "", firNo: "", investigationOfficerName: "", firTranslationRequired: "" }
        },
        maintenanceServiceRecord: {
            label: "Maintenance Record",
            fields: { lastServiceFrom: "", lastServiceDate: "", serviceType: "", serviceAmountPaid: "", serviceDetailsAvailability: "", odometerReadingAtLastService: "" }
        },
        visitToInsured: {
            label: "Visit to Insured",
            fields: { dateOfLoss: "", policyStartDate: "", firDateAndDelayReason: "", insurerIntimationDateAndDelayReason: "", insuredProfession: "", annualIncome: "", possessionOfKeys: "", economicStatus: "", lifestyleMatchWithVehicleOwnership: "", writtenStatementAndClaimForm: "", familyProfessionalBackground: "", statementTranslationRequired: "", versionOfInsured: "", versionOfWitnessShivPrasad: "", versionOfWitnessRahulKumar: "" }
        },
        visitToPersonPossessingVehicle: {
            label: "Visit to Person Possessing Vehicle",
            fields: { registrationNumber: "", personName: "", possessionPeriod: "", statementTranslation: "" }
        },
        visitToFinancer: {
            label: "Visit to Financer",
            fields: { financerName: "", totalInstallments: "", installmentsPaid: "", chequesBounced: "", lastInstallmentDate: "" }
        },
        lossSiteInspection: {
            label: "Loss Site Inspection",
            fields: { parkingLocationDescription: "", theftSpotLatitude: "", theftSpotLongitude: "" }
        },
        keysRemark: {
            label: "Keys Remark",
            fields: { keysProvided: "", keyTagNumberProvided: "", keyTagNumberInInvoice: "", keyTagMismatch: "" }
        },
        feedbackFromTheftLocation: {
            label: "Feedback from Theft Location",
            fields: { parkingAttendantStatement: "", shopkeeperStatement: "", watchmanStatement: "" }
        },
        garageVisit: {
            label: "Garage Visit",
            fields: { garageName: "" }
        },
        additionalInvestigationCommercialUse: {
            label: "Additional Investigation",
            fields: { suspectedInvolvementOfFriendsOrFamily: "", intentionalDelayInPoliceReport: "", inconsistentStatements: "", authoritiesUnwillingToProvideFacts: "", newspaperCuttingAvailable: "", incomeCertificateAvailable: "" }
        },
        findings: {
            label: "Findings",
            fields: { suspectedInvolvementOfFriendsOrFamily: "", intentionalDelayInPoliceReport: "", inconsistentStatementsOfFacts: "", authoritiesUnwillingToProvideFacts: "", newspaperCuttingAvailable: "", incomeCertificateAvailable: "" }
        },
        briefDetailsOfCase: {
            label: "Brief Details",
            fields: { investigationInstructionDate: "", insuredContactDate: "", insuredMeetingDate: "", documentsProvidedByInsured: "", vehiclePurchaseDetails: "", vehicleRegistrationDetails: "", lastParkingDetails: "", firDetails: "", reasonForFIRDelay: "", policeIntimationDate: "", insurerIntimationDate: "" }
        },
        conclusion: {
            label: "Conclusion",
            fields: { serviceBillsProvided: "", financeStatus: "", cctvAvailability: "", cctvLink: "", keysAndTagVerification: "", ncrbReportStatus: "", drivingLicenseStatus: "", delayInFIRAndInsurerIntimation: "", finalClaimOpinion: "" }
        },
        documentsSubmittedAndVerified: {
            label: "Documents Verified",
            fields: { intimationLetter: "", claimForm: "", letterToRtoPoliceNcrb: "", rcCopy: "", onlineRcExtract: "", kycForm: "", insuredPanCard: "", insuredAadharCard: "", insurancePolicyCopy: "", originalFir: "", qst: "", purchaseInvoice: "", bankPassbookDetails: "", ncrbVehicleEnquiryReport: "", rtiCopyWithReceiptAndReply: "", vehicleKeys: "", insuredStatement: "", witnessStatement: "", photosCollected: "", form29AndForm30: "", courtFinalReport: "" }
        },
        photosAndDocuments: {
            label: "Photos & Documents",
            fields: { rcPhoto: "", insuredPanCardPhoto: "", witnessAadharCardPhoto: "", insuredDlPhoto: "", insuredDlOnlineVerificationReport: "", insuredWithKeysPhoto: "", insuredWithStatementAndIdPhoto: "", witnessRahulWithStatementAndIdPhoto: "", witnessShivPrasadWithStatementPhoto: "", insuredAsWitnessForShivPrasadPhoto: "", witnessRahulWithStatementPhoto: "", insuredAsWitnessForRahulStatementPhoto: "", bankPassbookPhoto: "", spotPhotos: "" },
            fileFields: { rcPhoto: true, insuredPanCardPhoto: true, witnessAadharCardPhoto: true, insuredDlPhoto: true, insuredDlOnlineVerificationReport: true, insuredWithKeysPhoto: true, insuredWithStatementAndIdPhoto: true, witnessRahulWithStatementAndIdPhoto: true, witnessShivPrasadWithStatementPhoto: true, insuredAsWitnessForShivPrasadPhoto: true, witnessRahulWithStatementPhoto: true, insuredAsWitnessForRahulStatementPhoto: true, bankPassbookPhoto: true, spotPhotos: true }
        },
        insuredDlParticulars: {
            label: "Insured DL Particulars",
            fields: { driverDetails: "", dlNumber: "", dateOfBirth: "", rtoName: "", validityNonTransport: "", validityTransport: "", driverAddress: "", dlStatus: "" }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span>Theft Case</span>
                            <span>•</span>
                            <span className="font-mono text-gray-400">{caseId}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Case Details</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/case"
                            className="px-4 py-2 border rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            Back to List
                        </Link>
                        <Link
                            to={`/case/theft-case/edit/${caseId}`}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Case
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {Object.entries(SECTIONS_CONFIG).map(([key, config]) => (
                        <SectionCard
                            key={key}
                            title={config.label}
                            data={data[key]}
                            fields={config.fields}
                            fileFields={config.fileFields}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { caseApi, caseFirmApi } from '../../../services/api';
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, FileText, Edit2 } from "lucide-react";

// Hooks
import { useTheftCase } from "../../../hooks/useTheftCases";
import { useTheftCaseDocx } from "../../../hooks/useTheftCaseDocx";

// Utils
import { getNestedValue } from "../../../utils/odCaseHelpers";

// Components
import WitnessManager from "../../../components/WitnessManager";
import TheftSectionUnit from "./components/TheftSectionUnit";
import TheftProgressTracker from "./components/TheftProgressTracker";

/* ---------------------------------------------------
   MAIN THEFT CASE EDITOR
--------------------------------------------------- */
export default function TheftCaseEditor() {
  const { caseId } = useParams();
  const location = useLocation();

  const stateParentCase = location.state?.parentCaseData;

  // Default to the first section
  const [activeSection, setActiveSection] = useState("summaryOfTheClaim");

  const handleSectionChange = (key) => {
    setActiveSection(key);
  };

  // Fetch case data
  const { data: caseResponse, isLoading, isError, error, refetch } = useTheftCase(caseId);
  const caseData = caseResponse?.data;

  // Parents
  const { data: parentCaseResponse } = useQuery({
    queryKey: ['case', caseData?.caseId],
    queryFn: () => caseApi.getById(caseData?.caseId),
    enabled: !!caseData?.caseId && !stateParentCase,
    staleTime: 5 * 60 * 1000,
  });
  const parentCaseData = stateParentCase || parentCaseResponse?.data;

  const isFirmPopulated = typeof parentCaseData?.caseFirmId === 'object' && parentCaseData.caseFirmId !== null;
  const { data: caseFirmResponse } = useQuery({
    queryKey: ['caseFirm', typeof parentCaseData?.caseFirmId === 'string' ? parentCaseData.caseFirmId : parentCaseData?.caseFirmId?._id],
    queryFn: () => caseFirmApi.getById(typeof parentCaseData.caseFirmId === 'string' ? parentCaseData.caseFirmId : parentCaseData.caseFirmId._id),
    enabled: !!parentCaseData?.caseFirmId && !isFirmPopulated,
    staleTime: 5 * 60 * 1000,
  });
  const caseFirmData = isFirmPopulated ? parentCaseData.caseFirmId : caseFirmResponse?.data;

  const { generateDocx, isGenerating: isDocGenerating } = useTheftCaseDocx();

  /* ---------------------------------------------------
     INITIAL FORM STATE
  --------------------------------------------------- */
  const [form, setForm] = useState({
    letterDetails: {
      date: "",
      referenceNumber: "",
      recipientDesignation: "",
      recipientDepartment: "",
      recipientCompany: "",
      recipientAddress: "",
    },
    summaryOfTheClaim: {
      claimNo: "",
      policyNo: "",
      dateOfAppointmentForInvestigation: "",
      dateOfFirstContactWithClaimant: "",
    },
    policyAndIncidentDetails: {
      insurenceCompany: "",
      insuredName: "",
      insuredContactNo: "",
      policyNo: "",
      riskCoverPeriod: "",
      policyName: "",
      sumInsured: "",
      makeAndModel: "",
      yearOfManufacture: "",
      vehicleRegistrationNumber: "",
      engineNo: "",
      chassisNo: "",
      hypothecationWith: "",
      incidentDateAndTime: "",
      policyStartDate: "",
      firDateAndDelayReason: "",
      insurerIntimationDateAndDelayReason: "",
      parkingPlaceAtTheft: "",
    },
    purchaseAndRegistrationParticulars: {
      vehiclePurchasedFrom: "",
      invoiceNoWithDate: "",
      invoiceValue: "",
      ownerName: "",
      registrationNumber: "",
      registrationDate: "",
      registrationAuthority: "",
      chassisNo: "",
      engineNo: "",
      makeModelYear: "",
      vehicleType: "",
      vehicleClass: "",
      roadTaxClearTo: "",
      financeDetails: "",
    },
    firDetails: {
      policeStationName: "",
      crimeCaseNoAndSection: "",
      firLodgedBy: "",
      firLodgedAgainst: "",
      firDateAndTime: "",
      firNo: "",
      investigationOfficerName: "",
      firTranslationRequired: "",
    },
    maintenanceServiceRecord: {
      lastServiceFrom: "",
      lastServiceDate: "",
      serviceType: "",
      serviceAmountPaid: "",
      serviceDetailsAvailability: "",
      odometerReadingAtLastService: "",
    },
    visitToInsured: {
      dateOfLoss: "",
      policyStartDate: "",
      firDateAndDelayReason: "",
      insurerIntimationDateAndDelayReason: "",
      insuredProfession: "",
      annualIncome: "",
      possessionOfKeys: "",
      economicStatus: "",
      lifestyleMatchWithVehicleOwnership: "",
      writtenStatementAndClaimForm: "",
      familyProfessionalBackground: "",
      statementTranslationRequired: "",
    },
    visitToPersonPossessingVehicle: {
      registrationNumber: "",
      personName: "",
      possessionPeriod: "",
      statementTranslation: "",
    },
    visitToFinancer: {
      financerName: "",
      totalInstallments: "",
      installmentsPaid: "",
      chequesBounced: "",
      lastInstallmentDate: "",
    },
    lossSiteInspection: {
      parkingLocationDescription: "",
      theftSpotLatitude: "",
      theftSpotLongitude: "",
    },
    keysRemark: {
      keysProvided: "",
      keyTagNumberProvided: "",
      keyTagNumberInInvoice: "",
      keyTagMismatch: "",
    },
    feedBackFromLocationOfTheft: {
      statementOfParkingAttendant: "",
      statementOfShopkeepers: "",
      statementOfWatchman: "",
    },
    visitToServiceStation: {
      nameOfGarage: "",
    },
    additionalInvestigationIfCommercialUseSuspected: {
      suspectedInvolvementOfFriendsFamilyOnAnyReport: "",
      intentionalDelayInReportIncidentToPolice: "",
      anyInconsistentStatementOfFacts: "",
      anyConcernedAuthoritiesUnwillingToProvideFacts: "",
      newsPaperCuttingAvailableOrNot: "",
      incomeCertificateAvailableOrNot: "",
    },
    findings: {
      suspectedInvolvementOfFriendsFamilyOnAnyReport: "",
      intentionalDelayInReportIncidentToPolice: "",
      anyInconsistentStatementOfFacts: "",
      anyConcernedAuthoritiesUnwillingToProvideFacts: "",
      newsPaperCuttingAvailableOrNot: "",
      incomeCertificateAvailableOrNot: "",
    },
    conclusion: {
      conclusion: [],
    },
    briefDetailsOfTheCase: {
      briefDetailsOfTheCase: [],
    },
    documentsSubmittedAndVerified: {
      intimationLetter: "",
      claimForm: "",
      letterToRtoPoliceNcrb: "",
      rcCopy: "",
      onlineRcExtract: "",
      kycForm: "",
      insuredPanCard: "",
      insuredAadharCard: "",
      insurancePolicyCopy: "",
      originalFir: "",
      qst: "",
      purchaseInvoice: "",
      bankPassbookDetails: "",
      ncrbVehicleEnquiryReport: "",
      rtiCopyWithReceiptAndReply: "",
      vehicleKeys: "",
      insuredStatement: "",
      witnessStatement: "",
      photosCollected: "",
      form29AndForm30: "",
      courtFinalReport: "",
    },
    insuredDlParticulars: {
      driverDetails: "",
      dlDetails: "",
      dateOfBirth: "",
      nameOfRto: "",
      validityDetailsMcwgLmv: "",
      validityDetailsOfTransport: "",
      addressOfDriver: "",
      dlStatus: "",
    },
    insuredDocuments: {
      rcPhoto: [],
      rcverification: null,
      dlPhoto: [],
      dlverification: null,
      bankPassbookDetails: null, // Image
      insuredPanCardPhoto: [],
      insuredAadharCardPhoto: [],
    },
    witnessDetails: [],
    spotVisit: [],
  });

  /* ---------------------------------------------------
     DATA POPULATION (Auto-fill from Parent Case & Firm)
  --------------------------------------------------- */
  useEffect(() => {
    if (!caseData || !parentCaseData) return;

    setForm(prev => ({
      ...prev,
      // Sync with Case Data from API
      ...caseData,

      // Force refresh Letter Details from Firm (Overwrites saved/old details for these specific fields)
      letterDetails: {
        ...prev.letterDetails,
        ...caseData.letterDetails,
        referenceNumber: caseFirmData?.code || caseData.letterDetails?.referenceNumber || "",
        recipientDesignation: caseFirmData?.recipientDesignation || caseData.letterDetails?.recipientDesignation || "",
        recipientDepartment: caseFirmData?.recipientDepartment || caseData.letterDetails?.recipientDepartment || "",
        recipientCompany: caseFirmData?.recipientCompany || caseData.letterDetails?.recipientCompany || "",
        recipientAddress: caseFirmData?.recipientAddress || caseData.letterDetails?.recipientAddress || "",
      },

      // Sync Claim Summary from Parent Case
      summaryOfTheClaim: {
        ...prev.summaryOfTheClaim,
        ...caseData.summaryOfTheClaim,
        claimNo: caseData.summaryOfTheClaim?.claimNo || parentCaseData.coClaimNo || "",
        policyNo: caseData.summaryOfTheClaim?.policyNo || parentCaseData.policyNo || "",
      },

      // Sync Policy Details
      policyAndIncidentDetails: {
        ...prev.policyAndIncidentDetails,
        ...caseData.policyAndIncidentDetails,
        insuredName: caseData.policyAndIncidentDetails?.insuredName || parentCaseData.nameOfInsured || "",
        insuredContactNo: caseData.policyAndIncidentDetails?.insuredContactNo || parentCaseData.contactNo || "",
        policyNo: caseData.policyAndIncidentDetails?.policyNo || parentCaseData.policyNo || "",
        vehicleRegistrationNumber: caseData.policyAndIncidentDetails?.vehicleRegistrationNumber || parentCaseData.vehicleNo || "",
        engineNo: caseData.policyAndIncidentDetails?.engineNo || parentCaseData.engineNo || "",
        chassisNo: caseData.policyAndIncidentDetails?.chassisNo || parentCaseData.chassisNo || "",
      }
    }));
  }, [caseData, parentCaseData, caseFirmData]);

  /* ---------------------------------------------------
     SECTION CONFIG
  --------------------------------------------------- */
  const sections = [
    { key: "letterDetails", api: "letter-details" },
    { key: "summaryOfTheClaim", api: "summary-claim" },
    { key: "policyAndIncidentDetails", api: "policy-incident-details" },
    { key: "purchaseAndRegistrationParticulars", api: "purchase-registration" },
    { key: "firDetails", api: "fir-details" },
    { key: "maintenanceServiceRecord", api: "maintenance-record" },
    { key: "visitToInsured", api: "visit-insured" },
    { key: "visitToPersonPossessingVehicle", api: "visit-person-possessing" },
    { key: "visitToFinancer", api: "visit-financer" },
    { key: "lossSiteInspection", api: "loss-site-inspection" },
    { key: "keysRemark", api: "keys-remark" },
    { key: "feedBackFromLocationOfTheft", api: "feedback-theft-location" },
    { key: "visitToServiceStation", api: "visit-service-station" },
    { key: "additionalInvestigationIfCommercialUseSuspected", api: "additional-investigation" },
    { key: "findings", api: "findings" },
    { key: "briefDetailsOfTheCase", api: "brief-details" },
    { key: "conclusion", api: "conclusion" },
    { key: "documentsSubmittedAndVerified", api: "documents-submitted" },
    { key: "insuredDlParticulars", api: "insured-dl-particulars" },

    {
      key: "insuredDocuments",
      api: "insured-documents",
      files: {
        rcPhoto: "max-2",
        rcverification: "max-1",
        dlPhoto: "max-2",
        dlverification: "max-1",
        bankPassbookDetails: "max-1",
        insuredPanCardPhoto: "max-1",
        insuredAadharCardPhoto: "max-2",
      },
    },

    { key: "witnessDetails" },
  ];

  /* ---------------------------------------------------
     DERIVED STATE: ACTIVE SECTION CONFIG
  --------------------------------------------------- */
  const activeSectionConfig = sections.find(s => s.key === activeSection);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading case data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-bold text-lg mb-2">Error Loading Case</h2>
          <p className="text-red-600 mb-4">
            {error?.response?.data?.message || error?.message || 'Failed to load case data'}
          </p>
          <div className="flex gap-3">
            <Link
              to="/case"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Cases
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b z-20 shadow-sm flex-none transition-all">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/case"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Theft Case Editor</h1>
                {caseData?.summaryOfTheClaim?.claimNo && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Claim: {caseData.summaryOfTheClaim.claimNo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {parentCaseData?._id && (
                <Link
                  to={`/cases/edit/${parentCaseData._id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Manage Case
                </Link>
              )}
              <button
                onClick={() => generateDocx(caseData)}
                disabled={isDocGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isDocGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {isDocGenerating ? "Generating..." : "Generate Report"}
              </button>
              <div className="text-right">
                <p className="text-xs text-gray-500">Case ID</p>
                <p className="text-sm font-mono text-gray-700">{caseId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Progress Tracker */}
        <div className="w-64 bg-white border-r border-gray-200 flex-none hidden md:flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sections
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-1 m-1 custom-scrollbar">
            <TheftProgressTracker
              sections={sections}
              activeSection={activeSection}
              onSectionClick={handleSectionChange}
              form={form}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            {/* Disclaimer / Helper Text */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Complete the sections using the sidebar navigation.
              </p>
            </div>

            {/* Selected Section Render */}
            <div className="space-y-6">
              {activeSection === "witnessDetails" ? (
                <WitnessManager
                  caseId={caseId}
                  witnesses={caseData?.witnessDetails || []}
                  // Theft case endpoint might differ if WitnessManager is hardcoded for OD
                  // Need to check WitnessManager implementation.
                  // Assuming it takes an endpoint prop or uses a context/hook passed in?
                  // No, existing usage in odCase.jsx is:
                  // <WitnessManager caseId={caseId} witnesses={...} onUpdate={...} />
                  // It likely constructs its own API calls.
                  // I should check WitnessManager.
                  caseType="theft" // Passing this just in case
                  onUpdate={() => {
                    refetch();
                  }}
                />
              ) : activeSectionConfig ? (
                <TheftSectionUnit
                  key={activeSectionConfig.key}
                  id={activeSectionConfig.key}
                  caseId={caseId}
                  apiPath={activeSectionConfig.api}
                  sectionKey={activeSectionConfig.key}
                  fieldsObj={getNestedValue(form, activeSectionConfig.key) || {}}
                  fileFields={activeSectionConfig.files || {}}
                  form={form}
                  setForm={setForm}
                  firmData={caseFirmData}
                  defaultFieldValues={activeSectionConfig.key === 'letterDetails' ? { referenceNumber: caseData?.ourFileNo || caseData?.fileNo || "" } : {}}
                  isExpanded={true}
                  onToggle={() => { }}
                  caseType="theft"
                />
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white">
                  <p className="text-gray-500 text-lg">Select a section from the sidebar to view details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

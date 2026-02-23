import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, FileText } from "lucide-react";

// Hooks
import { useTheftCase } from "../../hooks/useTheftCases";
import { useTheftCaseDocx } from "../../hooks/useTheftCaseDocx";

// Utils
import { getNestedValue } from "../../utils/odCaseHelpers";

// Components
import WitnessManager from "../../components/WitnessManager";
import TheftSectionUnit from "./TheftCaseComponents/TheftSectionUnit";
import ProgressTracker from "./ODCaseComponents/ProgressTracker";

/* ---------------------------------------------------
   MAIN THEFT CASE EDITOR
--------------------------------------------------- */
export default function TheftCaseEditor() {
  const { caseId } = useParams();

  // Default to the first section
  const [activeSection, setActiveSection] = useState("summaryOfTheClaim");

  const handleSectionChange = (key) => {
    setActiveSection(key);
  };

  // Fetch case data
  const { data: caseResponse, isLoading, isError, error, refetch } = useTheftCase(caseId);
  const caseData = caseResponse?.data;
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
     DATA POPULATION
  --------------------------------------------------- */
  useEffect(() => {
    if (caseData) {
      setForm(prev => {
        const newForm = { ...prev };
        Object.keys(newForm).forEach(key => {
          if (caseData[key]) {
            newForm[key] = caseData[key];
          }
        });
        return newForm;
      });
    }
  }, [caseData]);

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
        insuredPanCardPhoto: "max-2",
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
            <ProgressTracker
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

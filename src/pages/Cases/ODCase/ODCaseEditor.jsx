import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, FileText, PanelRight } from "lucide-react";

// Hooks
import { useQuery, useIsMutating } from '@tanstack/react-query';
import { useODCase } from "../../../hooks/useODCases";
import { useODCaseDocx } from "../../../hooks/useODCaseDocx";

// API
import { caseApi, caseFirmApi } from '../../../services/api';

// Utils
import { getNestedValue } from "../../../utils/odCaseHelpers";

// Components
import WitnessManager from "../../../components/WitnessManager";
import SectionUnit from "./components/SectionUnit";
import ProgressTracker from "./components/ProgressTracker";
import DocxPreviewModal from "./components/DocxPreviewModal";


/* ---------------------------------------------------
   MAIN OD CASE EDITOR
--------------------------------------------------- */
export default function OdCaseEditor() {
  const { caseId } = useParams();

  const location = useLocation();

  // 1. Check navigation state for parentCaseData
  const stateParentCase = location.state?.parentCaseData;

  // Default to the first section
  const [activeSection, setActiveSection] = useState("letterDetails");

  const handleSectionChange = (key) => {
    setActiveSection(key);
  };

  // Fetch case data using TanStack Query
  const { data: caseResponse, isLoading, isFetching, isError, error, refetch } = useODCase(caseId);
  const isMutating = useIsMutating();
  const caseData = caseResponse?.data;

  // Use state data or fetch fallback
  const { data: parentCaseResponse } = useQuery({
    queryKey: ['case', caseData?.caseId],
    queryFn: () => caseApi.getById(caseData?.caseId),
    enabled: !!caseData?.caseId && !stateParentCase, // Skip if state exists
    staleTime: 5 * 60 * 1000,
  });

  const parentCaseData = stateParentCase || parentCaseResponse?.data;

  // 2. Firm Data (Look in populated parentCaseData or fetch)
  const isFirmPopulated = typeof parentCaseData?.caseFirmId === 'object' && parentCaseData.caseFirmId !== null;

  const { data: caseFirmResponse } = useQuery({
    queryKey: ['caseFirm', typeof parentCaseData?.caseFirmId === 'string' ? parentCaseData.caseFirmId : parentCaseData?.caseFirmId?._id],
    queryFn: () => caseFirmApi.getById(typeof parentCaseData.caseFirmId === 'string' ? parentCaseData.caseFirmId : parentCaseData.caseFirmId._id),
    enabled: !!parentCaseData?.caseFirmId && !isFirmPopulated, // Skip if already populated object
    staleTime: 5 * 60 * 1000,
  });

  const caseFirmData = isFirmPopulated ? parentCaseData.caseFirmId : caseFirmResponse?.data;

  // 3. Form Initialization & Auto-fill
  // We consolidate all data sync logic into a single effect to prevent redundant updates
  useEffect(() => {
    if (!caseData) return;

    setForm(prev => {
      // 1. Start with a deep clone of the previous state (prev) to preserve default structures
      // We use JSON.parse(JSON.stringify()) to ensure a clean slate of defaults
      const newForm = JSON.parse(JSON.stringify(prev));

      // 2. Helper to deeply merge sections like odDetails and meetingDetails
      // This ensures we keep the keys from the default form even if the API returns an empty section
      const mergeDeepSection = (sectionKey) => {
        if (caseData[sectionKey] && typeof caseData[sectionKey] === 'object') {
          // Initialize section if for some reason it's missing in newForm
          if (!newForm[sectionKey]) newForm[sectionKey] = {};

          Object.keys(caseData[sectionKey]).forEach(subKey => {
            const val = caseData[sectionKey][subKey];
            if (val !== undefined && val !== null) {
              let repairedVal = val;

              // Corruption repair: Handle objects that are actually string characters
              if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length > 0 && Object.keys(val).every(k => !isNaN(k))) {
                repairedVal = Object.values(val).join('');
              }

              // If it's a second-level object (like odDetails.claimSummary), merge it
              if (typeof repairedVal === 'object' && !Array.isArray(repairedVal) && !(repairedVal.$date)) {
                newForm[sectionKey][subKey] = {
                  ...(newForm[sectionKey][subKey] || {}),
                  ...repairedVal
                };
              } else {
                // Otherwise override field or array
                newForm[sectionKey][subKey] = repairedVal;
              }
            }
          });
        }
      };

      // Merge top-level simple fields and arrays directly
      Object.keys(caseData).forEach(key => {
        const val = caseData[key];
        // We only handle non-objects here; objects are handled by mergeDeepSection
        if (typeof val !== 'object' || Array.isArray(val) || val === null) {
          if (val !== undefined && val !== null) {
            newForm[key] = val;
          }
        }
      });

      // List of all sections that need deep merging to preserve structure
      const sectionsToMerge = [
        'odDetails', 'meetingDetails', 'letterDetails', 'policyBreakInDetails',
        'spotVisit', 'garageVisit', 'policeRecordDetails',
        'observationFindingsConclusion', 'opinion', 'insuredDocuments', 'gpsTimelineDriver'
      ];

      sectionsToMerge.forEach(mergeDeepSection);

      if (newForm.odDetails?.claimSummary) {
        delete newForm.odDetails.claimSummary.policyNo;
        delete newForm.odDetails.claimSummary.policyDuration;
      }

      // 3. AUTO-FILL FROM PARENT CASE DATA
      if (parentCaseData) {
        const pc = parentCaseData;

        // Letter Details Sync
        const fileNo = pc.ourFileNo || caseData.ourFileNo || caseData.fileNo;
        if (fileNo) {
          newForm.letterDetails = {
            ...(newForm.letterDetails || {}),
            referenceNumber: fileNo, // Force sync
          };
        }

        // Claim Summary - Force sync from parent
        if (newForm.odDetails?.claimSummary) {
          const cs = newForm.odDetails.claimSummary;
          cs.vehicleNo = pc.vehicleNo || cs.vehicleNo || "";
          cs.insuredName = pc.nameOfInsured || cs.insuredName || "";
          cs.insuredContactNo = pc.contactNo || cs.insuredContactNo || "";
          cs.chassisNo = pc.chassisNo || cs.chassisNo || "";
          cs.engineNo = pc.engineNo || cs.engineNo || "";
          cs.claimNo = pc.coClaimNo || cs.claimNo || "";
        }

        // Vehicle & Insured Details - Force sync from parent
        if (newForm.odDetails?.vehicleDetails) {
          const vd = newForm.odDetails.vehicleDetails;
          vd.vehicleRegistrationNo = pc.vehicleNo || vd.vehicleRegistrationNo || "";
          vd.registeredOwnerName = pc.nameOfInsured || vd.registeredOwnerName || "";
        }
        if (newForm.odDetails?.insuredDetails) {
          const id = newForm.odDetails.insuredDetails;
          id.nameOfInsured = pc.nameOfInsured || id.nameOfInsured || "";
          id.addressAsPerRC = pc.addressOfInsured || id.addressAsPerRC || "";
        }
        if (newForm.policyBreakInDetails) {
          newForm.policyBreakInDetails.policyNo = pc.policyNo || newForm.policyBreakInDetails.policyNo || "";
          newForm.policyBreakInDetails.policyPeriod = pc.policyPeriod || newForm.policyBreakInDetails.policyPeriod || "";
        }
      }

      // 4. SYNC makeAndModel from Vehicle Details → Claim Summary
      if (newForm.odDetails?.claimSummary && newForm.odDetails?.vehicleDetails) {
        newForm.odDetails.claimSummary.makeAndModel = newForm.odDetails.vehicleDetails.makeAndModel || newForm.odDetails.claimSummary.makeAndModel || "";
      }

      // 5. AUTO-FILL FROM FIRM DATA
      if (caseFirmData) {
        const cf = caseFirmData;
        newForm.letterDetails = {
          ...(newForm.letterDetails || {}),
          recipientDesignation: newForm.letterDetails?.recipientDesignation || cf.recipientDesignation || "",
          recipientDepartment: newForm.letterDetails?.recipientDepartment || cf.recipientDepartment || "",
          recipientCompany: newForm.letterDetails?.recipientCompany || cf.recipientCompany || "",
          recipientAddress: newForm.letterDetails?.recipientAddress || cf.recipientAddress || "",
        };
      }

      return newForm;
    });
  }, [caseData, parentCaseData, caseFirmData]);

  // DOCX Generation Hook
  const { generateDocx, isGenerating } = useODCaseDocx();

  // Handle DOCX Generation
  /* ---------------------------------------------------
     DOCX Generation Handler
  --------------------------------------------------- */
  const handleGenerateDocx = async () => {
    if (!caseData) {
      toast.error("No case data available to generate document");
      return;
    }

    // Create sections configuration for DOCX generation
    const sectionsConfig = {
      letterDetails: {
        label: "Letter Details",
        fields: {
          date: true,
          recipientDesignation: true,
          recipientDepartment: true,
          recipientCompany: true,
          recipientAddress: true,
        },
      },
      gpsTimelineDriver: {
        label: "GPS Timeline Driver",
        fields: {},
        fileFields: {
          type: true,
        },
      },
      insuredDocuments: {
        label: "Insured Documents",
        fields: {},
        fileFields: {
          rcPhoto: true,
          rcverification: true,
          dlPhoto: true,
          dlverification: true,
          insuredPanCardPhoto: true,
          insuredAadharCardPhoto: true,
        },
      },
      observationFindingsConclusion: {
        label: "Observation / Findings",
        fields: {
          headerType: true,
          points: true,
          discrepancy: true,
        },
      },
      opinion: {
        label: "Opinion",
        fields: {
          claimAdmissibilityOpinion: true,
          enclosures: true,
        },
      },
    };

    await toast.promise(
      (async () => {
        const blob = await generateDocx(form, sectionsConfig);
        if (blob) {
          setPreviewData({
            blob,
            fileName: `OD_Case_${form?.odDetails?.claimSummary?.claimNo || "Report"}_${new Date().toISOString().split('T')[0]}.docx`
          });
          return;
        }
        throw new Error("Failed to generate document blob");
      })(),
      {
        loading: 'Generating DOCX...',
        success: "Report generated successfully!",
        error: (err) => {
          console.error("Error generating DOCX:", err);
          return "Failed to generate DOCX";
        }
      }
    );
  };

  const [previewData, setPreviewData] = useState(null);

  const handleDocxConfirm = () => {
    setPreviewData(null);
    toast.success("Document generated and downloaded successfully!");
  };

  /* ---------------------------------------------------
     INITIAL FORM STATE
  --------------------------------------------------- */
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    letterDetails: {
      date: new Date().toISOString().split("T")[0],
      referenceNumber: caseFirmData?.code,
      recipientDesignation: caseFirmData?.recipientDesignation,
      recipientDepartment: caseFirmData?.recipientDepartment,
      recipientCompany: caseFirmData?.recipientCompany,
      recipientAddress: caseFirmData?.recipientAddress,
    },
    odDetails: {
      claimSummary: {
        vehicleNo: "",
        claimNo: "",
        closeProximity: "",
        insuredName: "",
        insuredContactNo: "",
        driverName: "",
        generalDiaryDetails: "",
        makeAndModel: "",
        chassisNo: "",
        engineNo: "",
        hypDetails: "",
        dateOfClaimIntimated: "",
        delayIntimation: "",
        investigatorName: "Satyendra Kumar Garg",
        vehicleDamages: "",
        accidentSummary: "",
      },
      insuredDetails: {
        nameOfInsured: "",
        panCard: "",
        aadharCardNo: "",
        addressAsPerRC: "",
        insuredProfession: "",
        driverInjured: "",
        driverRelationshipWithInsured: "",
        nameOfDriver: "",
        attestedLetterFromDriver: "",
        driverConfirmation: "",
        detailsOfInjured: {
          availability: "",
          injuredPersons: [],
        },
        detailsOfDeceased: {
          availability: "",
          deceasedPersons: [],
        },
      },
      vehicleDetails: {
        vehicleRegistrationNo: "",
        registeredOwnerName: "",
        newVehicleInvoiceDetails: "",
        makeAndModel: "",
        registrationDate: "",
        yearOfManufacture: "",
        chassisNo: "",
        engineNo: "",
        hypDetails: "",
        mvTaxDetails: "",
        bodyType: "",
        seatingCapacity: "",
        ownerSerialNumber: "",
        dateOfPurchaseAvailability: "",
        dateOfPurchase: "",
        sellerAddress: "",
        sellerContactNumber: "",
        purchaseAmount: "",
        fitnessDetail: "",
        permittedDetail: "",
        permitType: "",
        permitLocationType: "",
        permitState: "",
        permitCity: "",

      },
    },

    meetingDetails: {

      insuredIntroduction: "",
      vehicleInformation: "",
      dateAndTimeOfLoss: "",
      travelingFromTo: "",
      purposeOfTravel: "",
      accidentVersionLocationDetails: "",
      accidentDetailsAsPerDriver: "",
      accidentDetailsAsPerInsured: "",
      accidentDetailsAsPerOccupant: "",
      rehabilitationDetails: "",
      firstContactAfterAccident: "",
    },
    policyBreakInDetails: {
      policyNo: "",
      policyPeriod: "",
      policyType: "",
      idv: "",
      previousPolicyNo: "",
      previousPolicyPeriod: "",
      previousInsurer: "",
      previousPolicyType: "",
      anyClaimInPreviousPolicy: "",
      previousClaimPhotosAvailable: "",
      breakIn: "",
      breakInInspectionDate: "",
      odometerReadingAtBreakIn: "",
      breakInDiscrepancy: "",
    },
    spotVisit: {
      spotVisitEnquiry: "",
      accidentSpotLatitude: "",
      accidentSpotLongitude: "",
      cctvAvailability: "",
      tollTaxReceiptConfirmation: "",
      ambulanceOrHighwayPatrollingCheck: "",
      discreetEnquiryAtLossLocation: "",
      photosExchanged: "",
      witnessRecords: "",
      narrationOrObservation: "",
      spotImages: [],
    },
    garageVisit: {
      vehicleInspected: "",
      placeOfInspection: "",
      lastServiceDate: "",
      damageCorrelationWithAccident: "",
      bloodOrBodyTraceInspection: "",
      towingVendorDetails: "",
      jobCardDetails: {
        availability: "",
        jobCardNo: "",
        dateOfJobCard: "",
        nameOfGarage: "",
      },
      vehicleStatusAfter24Hrs: {
        availability: "",
        checkInDateTime: "",
        checkOutDateTime: "",
      },
      garageImages: [],
    },
    policeRecordDetails: {
      firStatus: "",
      firDateAndTime: "",
      firNo: "",
      policeStationName: "",
      nameOfPoliceStationDistrict: "",
      district: "",
      state: "",
      rtiDetailsAvailability: "",
      rtiDetails: [],
    },
    observationFindingsConclusion: {
      headerType: "Observation and Finding",
      points: [],
      discrepancy: "",
    },
    opinion: {
      claimAdmissibilityOpinion: "",
      enclosures: [],
    },
    dlParticulars: [],
    witnessDetails: [],

    gpsTimelineDriver: {
      persons: [],
    },
    insuredDocuments: {
      rcPhoto: [],
      rcverification: null,
      dlPhoto: [],
      dlverification: null,
      insuredPanCardPhoto: [],
      insuredAadharCardPhoto: [],
    },
  });



  /* ---------------------------------------------------
     SECTION CONFIG
  --------------------------------------------------- */
  const sections = [
    {
      key: "letterDetails",
      api: "letter-details",
      readonlyFields: ["referenceNumber"]
    },
    {
      key: "odDetails.claimSummary",
      api: "od-details/claim-summary",
      readonlyFields: ["vehicleNo", "insuredName", "insuredContactNo", "chassisNo", "engineNo", "claimNo", "makeAndModel"]
    },
    {
      key: "odDetails.insuredDetails",
      api: "od-details/insured-details",
      readonlyFields: ["nameOfInsured"]
    },
    {
      key: "odDetails.vehicleDetails",
      api: "od-details/vehicle-details",
      readonlyFields: ["vehicleRegistrationNo", "registeredOwnerName"]
    },
    { key: "meetingDetails", api: "meeting-details" },
    {
      key: "policyBreakInDetails",
      api: "policy-break-in-details",
      label: "Policy Details",
      readonlyFields: ["policyNo", "policyPeriod"]
    },
    {
      key: "spotVisit",
      api: "spot-visit",
      files: {
        spotImages: "multiple",
      }
    },
    {
      key: "garageVisit",
      api: "garage-visit",
      files: {
        garageImages: "multiple",
      }
    },
    { key: "policeRecordDetails", api: "police-record-details" },
    { key: "observationFindingsConclusion", api: "observation-findings-conclusion" },
    { key: "opinion", api: "opinion" },

    { key: "dlParticulars", api: "dl-particulars", label: "Name of DL Holders" },
    { key: "witnessDetails" },

    {
      key: "insuredDocuments",
      api: "insured-documents",
      files: {
        rcPhoto: "max-2",
        rcverification: "max-1",
        dlPhoto: "max-2",
        dlverification: "max-1",
        insuredPanCardPhoto: "max-1",
        insuredAadharCardPhoto: "max-2",
      },
    },

    {
      key: "gpsTimelineDriver",
      api: "gps-timeline-driver",
    },
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
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden relative">
      {/* GLOBAL LOADING / REPAINT OVERLAY */}
      {(!isLoading && (isFetching || isMutating > 0)) && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center pointer-events-auto">
          <div className="bg-white border border-indigo-100 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4">
            <div className="bg-indigo-50 p-2 rounded-full">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-base">
                {isMutating > 0 ? "Saving Section..." : "Syncing Data..."}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {isMutating > 0 ? "Please wait, applying changes to server." : "Repainting latest information."}
              </span>
            </div>
          </div>
        </div>
      )}
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
                <h1 className="text-2xl font-bold text-gray-900">OD Case Editor</h1>
                {caseData?.odDetails?.claimSummary?.vehicleNo && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Vehicle: {caseData.odDetails.claimSummary.vehicleNo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Generate DOCX Button */}
              <button
                onClick={handleGenerateDocx}
                disabled={isGenerating || !caseData}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors ${isGenerating || !caseData ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    DOCX Preview
                  </>
                )}
              </button>

              {/* Case ID */}
              <div className="text-right">
                <p className="text-xs text-gray-500">Case ID</p>
                <div className="flex items-center gap-2 justify-end">
                  <p className="text-sm font-mono text-gray-700">{caseId}</p>
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`ml-2 p-1.5 rounded-md transition-all ${isSidebarOpen
                      ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                      }`}
                    title={isSidebarOpen ? "Hide Progress Tracker" : "Show Progress Tracker"}
                  >
                    <PanelRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 custom-scrollbar">
          <div className="w-full">
            {/* Disclaimer / Helper Text */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Complete the sections using the sidebar navigation.
              </p>
              <div className="md:hidden">
                {/* Mobile select dropdown could go here if we wanted fully responsive, 
                     but for now user just asked for vertical tracker */}
              </div>
            </div>

            {/* Selected Section Render */}
            <div className="space-y-6">
              {activeSection === "witnessDetails" ? (
                <WitnessManager
                  caseId={caseId}
                  witnesses={caseData?.witnessDetails || []}
                  onUpdate={() => {
                    refetch();
                  }}
                />
              ) : activeSectionConfig ? (
                <SectionUnit
                  key={activeSectionConfig.key}
                  id={activeSectionConfig.key}
                  caseId={caseId}
                  apiPath={activeSectionConfig.api}
                  sectionKey={activeSectionConfig.key}
                  fieldsObj={getNestedValue(form, activeSectionConfig.key) || {}}
                  files={activeSectionConfig.files || {}}
                  fileFields={activeSectionConfig.files || {}}
                  form={form}
                  setForm={setForm}
                  firmData={caseFirmData}
                  defaultFieldValues={activeSectionConfig.key === 'letterDetails' ? { referenceNumber: parentCaseData?.ourFileNo || caseData?.ourFileNo || caseData?.fileNo || "" } : {}}
                  isExpanded={true} // Always expanded in Tab view
                  onToggle={() => { }} // No toggle needed
                  readonlyFields={activeSectionConfig.readonlyFields || []}
                />
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white">
                  <p className="text-gray-500 text-lg">Select a section from the sidebar to view details.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Progress Tracker (Right Side) */}
        <div
          className={`
            bg-white border-l border-gray-200 flex-none flex flex-col 
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'w-34 opacity-100 translate-x-0' : 'w-0 opacity-0 overflow-hidden border-l-0 translate-x-full'}
          `}
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex-none whitespace-nowrap">
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
      </div>


      {
        previewData && (
          <DocxPreviewModal
            blob={previewData.blob}
            fileName={previewData.fileName}
            onClose={() => setPreviewData(null)}
            onConfirm={handleDocxConfirm}
          />
        )
      }
    </div >
  );
}

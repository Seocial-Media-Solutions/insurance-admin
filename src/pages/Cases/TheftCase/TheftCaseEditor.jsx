import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery, useIsMutating, useIsFetching } from '@tanstack/react-query';
import { caseApi, caseFirmApi } from '../../../services/api';
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, FileText, Edit2, PanelRight } from "lucide-react";

// Hooks
import { useTheftCase } from "../../../hooks/useTheftCases";
import { useTheftCaseDocx } from "../../../hooks/useTheftCaseDocx";

// Utils
import { getNestedValue } from "../../../utils/theftCaseHelpers";

// Components
import WitnessManager from "../../../components/WitnessManager";
import TheftSectionUnit from "./components/TheftSectionUnit";
import TheftProgressTracker from "./components/TheftProgressTracker";
import DocxPreviewModal from "../ODCase/components/DocxPreviewModal";

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
  const { data: caseResponse, isLoading, isFetching, isError, error, refetch } = useTheftCase(caseId);
  const isMutating = useIsMutating();
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

  const [previewData, setPreviewData] = useState(null);

  const handleGenerateDocx = async () => {
    if (!caseData) {
      toast.error("No case data available to generate document");
      return;
    }

    await toast.promise(
      (async () => {
        const blob = await generateDocx(form);
        if (blob) {
          setPreviewData({
            blob,
            fileName: `Theft_Report_${form?.summaryOfTheClaim?.claimNo || "Draft"}_${new Date().toISOString().split('T')[0]}.docx`
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

  const handleDocxConfirm = () => {
    setPreviewData(null);
    toast.success("Document generated and downloaded successfully!");
  };

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
    insuredDetails: {
      insuredName: "",
      currentAddress: "",
      permanentAddress: "",
      contactNumber: "",
      panNumber: "",
      aadharNumber: "",
      drivingLicenceNumber: "",
      drivingLicenceValidFor: "",
      drivingLicenceValidityPeriod: "",
      vehicleRegistrationNumber: "",
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
      statementOfInsured: "",
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
      remarks: "",
      installmentsPaid: "",
      chequesBounced: "",
      lastInstallmentDate: "",
    },
    lossSiteInspection: {
      parkingLocationDescription: "",
      theftSpotLatitude: "",
      theftSpotLongitude: "",
      spotImages: [],
    },
    keysRemark: {
      remarks: "",
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

      // Force refresh Letter Details (Sync Code Only)
      letterDetails: {
        ...prev.letterDetails,
        ...caseData.letterDetails,
        referenceNumber: caseFirmData?.code || caseData.letterDetails?.referenceNumber || parentCaseData.ourFileNo || "",
        recipientDesignation: caseData.letterDetails?.recipientDesignation || "",
        recipientDepartment: caseData.letterDetails?.recipientDepartment || "",
        recipientCompany: caseData.letterDetails?.recipientCompany || "",
        recipientAddress: caseData.letterDetails?.recipientAddress || "",
      },

      // Sync Claim Summary from Parent Case
      summaryOfTheClaim: {
        ...prev.summaryOfTheClaim,
        ...caseData.summaryOfTheClaim,
        claimNo: caseData.summaryOfTheClaim?.claimNo || parentCaseData.coClaimNo || "",
        policyNo: caseData.summaryOfTheClaim?.policyNo || parentCaseData.policyNo || "",
        dateOfAppointmentForInvestigation: caseData.summaryOfTheClaim?.dateOfAppointmentForInvestigation || parentCaseData.theftDetails?.claimSummary?.investigationAppointmentDate || "",
        dateOfFirstContactWithClaimant: caseData.summaryOfTheClaim?.dateOfFirstContactWithClaimant || parentCaseData.theftDetails?.claimSummary?.firstContactDate || "",
      },

      // Sync Insured Details
      insuredDetails: {
        ...prev.insuredDetails,
        ...caseData.insuredDetails,
        insuredName: caseData.insuredDetails?.insuredName || parentCaseData.nameOfInsured || parentCaseData.theftDetails?.insuredDetails?.insuredName || "",
        currentAddress: caseData.insuredDetails?.currentAddress || parentCaseData.addressOfInsured || parentCaseData.theftDetails?.insuredDetails?.currentAddress || "",
        permanentAddress: caseData.insuredDetails?.permanentAddress || parentCaseData.addressOfInsured || parentCaseData.theftDetails?.insuredDetails?.presentAddress || "",
        contactNumber: caseData.insuredDetails?.contactNumber || parentCaseData.contactNo || parentCaseData.theftDetails?.insuredDetails?.contactNumber || "",
        panNumber: caseData.insuredDetails?.panNumber || parentCaseData.theftDetails?.insuredDetails?.panNumber || "",
        aadharNumber: caseData.insuredDetails?.aadharNumber || parentCaseData.theftDetails?.insuredDetails?.aadharNumber || "",
        drivingLicenceNumber: caseData.insuredDetails?.drivingLicenceNumber || parentCaseData.theftDetails?.insuredDetails?.drivingLicenceNumber || "",
        drivingLicenceValidFor: caseData.insuredDetails?.drivingLicenceValidFor || parentCaseData.theftDetails?.insuredDetails?.drivingLicenceValidFor || "",
        drivingLicenceValidityPeriod: caseData.insuredDetails?.drivingLicenceValidityPeriod || parentCaseData.theftDetails?.insuredDetails?.drivingLicenceValidityPeriod || "",
        vehicleRegistrationNumber: caseData.insuredDetails?.vehicleRegistrationNumber || parentCaseData.vehicleNo || parentCaseData.theftDetails?.insuredDetails?.vehicleRegistrationNumber || "",
      },

      // Sync Policy Details
      policyAndIncidentDetails: {
        ...prev.policyAndIncidentDetails,
        ...caseData.policyAndIncidentDetails,
        insuredName: caseData.policyAndIncidentDetails?.insuredName || parentCaseData.nameOfInsured || parentCaseData.theftDetails?.insuredDetails?.insuredName || "",
        insuredContactNo: caseData.policyAndIncidentDetails?.insuredContactNo || parentCaseData.contactNo || parentCaseData.theftDetails?.insuredDetails?.contactNumber || "",
        policyNo: caseData.policyAndIncidentDetails?.policyNo || parentCaseData.policyNo || "",
        riskCoverPeriod: caseData.policyAndIncidentDetails?.riskCoverPeriod || parentCaseData.policyPeriod || "",
        makeAndModel: caseData.policyAndIncidentDetails?.makeAndModel || parentCaseData.theftDetails?.vehicleDetails?.makeAndModel || "",
        yearOfManufacture: caseData.policyAndIncidentDetails?.yearOfManufacture || parentCaseData.theftDetails?.vehicleDetails?.yearOfManufacture || "",
        vehicleRegistrationNumber: caseData.policyAndIncidentDetails?.vehicleRegistrationNumber || parentCaseData.vehicleNo || parentCaseData.theftDetails?.insuredDetails?.vehicleRegistrationNumber || "",
        engineNo: caseData.policyAndIncidentDetails?.engineNo || parentCaseData.engineNo || "",
        chassisNo: caseData.policyAndIncidentDetails?.chassisNo || parentCaseData.chassisNo || "",
        hypothecationWith: caseData.policyAndIncidentDetails?.hypothecationWith || parentCaseData.theftDetails?.vehicleDetails?.hypDetails || "",
        incidentDateAndTime: caseData.policyAndIncidentDetails?.incidentDateAndTime || parentCaseData.dateOfLoss || "",
      },

      // Sync Registration Particulars
      purchaseAndRegistrationParticulars: {
        ...prev.purchaseAndRegistrationParticulars,
        ...caseData.purchaseAndRegistrationParticulars,
        ownerName: caseData.purchaseAndRegistrationParticulars?.ownerName || parentCaseData.nameOfInsured || parentCaseData.theftDetails?.insuredDetails?.insuredName || "",
        registrationNumber: caseData.purchaseAndRegistrationParticulars?.registrationNumber || parentCaseData.vehicleNo || parentCaseData.theftDetails?.insuredDetails?.vehicleRegistrationNumber || "",
        registrationDate: caseData.purchaseAndRegistrationParticulars?.registrationDate || parentCaseData.theftDetails?.vehicleDetails?.registrationDate || "",
        chassisNo: caseData.purchaseAndRegistrationParticulars?.chassisNo || parentCaseData.chassisNo || "",
        engineNo: caseData.purchaseAndRegistrationParticulars?.engineNo || parentCaseData.engineNo || "",
        makeModelYear: caseData.purchaseAndRegistrationParticulars?.makeModelYear || parentCaseData.theftDetails?.vehicleDetails?.makeAndModel || "",
        financeDetails: caseData.purchaseAndRegistrationParticulars?.financeDetails || parentCaseData.theftDetails?.vehicleDetails?.hypDetails || "",
      },

      // Sync Insured DL Particulars
      insuredDlParticulars: {
        ...prev.insuredDlParticulars,
        ...caseData.insuredDlParticulars,
        driverDetails: caseData.insuredDlParticulars?.driverDetails || parentCaseData.theftDetails?.insuredDetails?.insuredName || "",
        dlDetails: caseData.insuredDlParticulars?.dlDetails || parentCaseData.theftDetails?.insuredDetails?.drivingLicenceNumber || "",
      },

      // Documents checklist pre-fill (Aids user in knowing what was mentioned in main case)
      documentsSubmittedAndVerified: {
        ...prev.documentsSubmittedAndVerified,
        ...caseData.documentsSubmittedAndVerified,
        insuredPanCard: caseData.documentsSubmittedAndVerified?.insuredPanCard || (parentCaseData.theftDetails?.insuredDetails?.panNumber ? "Yes" : ""),
        insuredAadharCard: caseData.documentsSubmittedAndVerified?.insuredAadharCard || (parentCaseData.theftDetails?.insuredDetails?.aadharNumber ? "Yes" : ""),
      },

      // Visit to Insured
      visitToInsured: {
        ...prev.visitToInsured,
        ...caseData.visitToInsured,
        dateOfLoss: caseData.visitToInsured?.dateOfLoss || parentCaseData.dateOfLoss || "",
      }
    }));
  }, [caseData, parentCaseData, caseFirmData]);

  /* ---------------------------------------------------
     REAL-TIME SYNC (Cross-section synchronization)
  --------------------------------------------------- */
  useEffect(() => {
    const policy = form.policyAndIncidentDetails;
    const purchase = form.purchaseAndRegistrationParticulars;

    let updates = {};

    // Sync Chassis No
    if (policy.chassisNo !== purchase.chassisNo) {
      if (policy.chassisNo) updates.chassisNo = policy.chassisNo;
      else if (purchase.chassisNo) updates.chassisNo = purchase.chassisNo;
    }

    // Sync Engine No
    if (policy.engineNo !== purchase.engineNo) {
      if (policy.engineNo) updates.engineNo = policy.engineNo;
      else if (purchase.engineNo) updates.engineNo = purchase.engineNo;
    }

    // Sync Make/Model
    if (policy.makeAndModel !== purchase.makeModelYear) {
      if (policy.makeAndModel) updates.makeAndModel = policy.makeAndModel;
      else if (purchase.makeModelYear) updates.makeAndModel = purchase.makeModelYear;
    }

    if (Object.keys(updates).length > 0) {
      setForm(prev => ({
        ...prev,
        policyAndIncidentDetails: {
          ...prev.policyAndIncidentDetails,
          chassisNo: updates.chassisNo || prev.policyAndIncidentDetails.chassisNo,
          engineNo: updates.engineNo || prev.policyAndIncidentDetails.engineNo,
          makeAndModel: updates.makeAndModel || prev.policyAndIncidentDetails.makeAndModel,
        },
        purchaseAndRegistrationParticulars: {
          ...prev.purchaseAndRegistrationParticulars,
          chassisNo: updates.chassisNo || prev.purchaseAndRegistrationParticulars.chassisNo,
          engineNo: updates.engineNo || prev.purchaseAndRegistrationParticulars.engineNo,
          makeModelYear: updates.makeAndModel || prev.purchaseAndRegistrationParticulars.makeModelYear,
        }
      }));
    }
  }, [form.policyAndIncidentDetails.chassisNo, form.policyAndIncidentDetails.engineNo, form.policyAndIncidentDetails.makeAndModel, 
      form.purchaseAndRegistrationParticulars.chassisNo, form.purchaseAndRegistrationParticulars.engineNo, form.purchaseAndRegistrationParticulars.makeModelYear]);

  /* ---------------------------------------------------
     SECTION CONFIG
  --------------------------------------------------- */
  const sections = [
    { key: "letterDetails", api: "letter-details" },
    { key: "summaryOfTheClaim", api: "summary-claim" },
    { key: "insuredDetails", api: "insured-details" },
    { key: "policyAndIncidentDetails", api: "policy-incident-details" },
    { key: "purchaseAndRegistrationParticulars", api: "purchase-registration" },
    { key: "firDetails", api: "fir-details" },
    { key: "maintenanceServiceRecord", api: "maintenance-record" },
    { key: "visitToInsured", api: "visit-insured" },
    { key: "visitToPersonPossessingVehicle", api: "visit-person-possessing" },
    { key: "visitToFinancer", api: "visit-financer" },
    { key: "lossSiteInspection", api: "loss-site-inspection", files: { spotImages: "multiple" } },
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

  const sectionLabels = {
    letterDetails: {
      date: "Date",
      referenceNumber: "Reference Number",
      recipientDesignation: "Recipient Designation",
      recipientDepartment: "Recipient Department",
      recipientCompany: "Recipient Company",
      recipientAddress: "Recipient Address",
    },
    summaryOfTheClaim: {
      claimNo: "Claim No.",
      dateOfAppointmentForInvestigation: "Date of Appointment for Investigation",
      dateOfFirstContactWithClaimant: "Date of First Contact with Claimant",
    },
    policyAndIncidentDetails: {
      insurenceCompany: "Insurer",
      insuredName: "Insured",
      insuredContactNo: "Insured contact No.",
      policyNo: "Policy No.",
      riskCoverPeriod: "Period of Risk Cover",
      policyName: "Policy Name",
      sumInsured: "Sum Insured",
      makeAndModel: "Make & Model of the Vehicle",
      yearOfManufacture: "Year of Manufacturing",
      vehicleRegistrationNumber: "Vehicle Registration Number",
      engineNo: "Engine No.",
      chassisNo: "Chassis No.",
      hypothecationWith: "Hypothecation with",
      incidentDateAndTime: "Date and Time of Incident",
      policyStartDate: "Date of Start of Policy",
      firDateAndDelayReason: "Date of FIR and reasons for delay, if any",
      insurerIntimationDateAndDelayReason: "Date of Intimation to Insurer and reasons if delay",
      parkingPlaceAtTheft: "Place of Parking at the time of theft & Location of Accident / Theft",
    },
    insuredDetails: {
      insuredName: "Name of Insured",
      currentAddress: "Current address of insured",
      permanentAddress: "Present address",
      contactNumber: "Contact Number",
      panNumber: "PAN Number",
      aadharNumber: "Aadhar Card Number",
      drivingLicenceNumber: "Driving Licence Details",
      drivingLicenceValidFor: "Driving Licence Valid For",
      drivingLicenceValidityPeriod: "Driving Licence Valid from to",
      vehicleRegistrationNumber: "Vehicle Registration Number",
    },
    purchaseAndRegistrationParticulars: {
      vehiclePurchasedFrom: "Vehicle Purchased From",
      invoiceNoWithDate: "Invoice No. With Date",
      invoiceValue: "Invoice Value",
      ownerName: "Owner’s Name",
      registrationNumber: "Registration Number",
      registrationDate: "Date of Registration",
      registrationAuthority: "Registration Authority",
      chassisNo: "Chassis No.",
      engineNo: "Engine No.",
      makeModelYear: "Make / Model of the Vehicle & Year",
      vehicleType: "Type of Vehicle",
      vehicleClass: "Class of Vehicle",
      roadTaxClearTo: "Road Tax Clear to",
      financeDetails: "Finance From (Hypothecation Details)",
    },
    firDetails: {
      policeStationName: "Name of Police Station where case was reported",
      crimeCaseNoAndSection: "Crime Case No. And Section of Crime",
      firLodgedBy: "FIR Lodged By",
      firLodgedAgainst: "FIR Lodged Against",
      firDateAndTime: "Date and Time of FIR",
      firNo: "FIR No.",
      investigationOfficerName: "Name of Investigation Officer",
      firTranslationRequired: "Translation of FIR",
    },
    maintenanceServiceRecord: {
      lastServiceFrom: "Vehicle Last Service From",
      lastServiceDate: "Date of Last Service",
      serviceType: "Service Free or Paid",
      serviceAmountPaid: "Amount Paid in the Service",
      serviceDetailsAvailability: "Availability of Service Details",
      odometerReadingAtLastService: "Odometer Reading during last Service with date",
    },
    visitToInsured: {
      dateOfLoss: "Date of Loss",
      policyStartDate: "Date of Start of Policy",
      firDateAndDelayReason: "Date of FIR and reasons for delay, if any",
      insurerIntimationDateAndDelayReason: "Date of Intimation to Insurer and reasons if delay",
      insuredProfession: "Profession of Insured",
      annualIncome: "Turnover / Annual Income",
      possessionOfKeys: "Possession of both / all Keys",
      economicStatus: "Economic Status / Live Style judged from residential accommodation",
      lifestyleMatchWithVehicleOwnership: "Do the life style / Economic Status match with the ownership of vehicle? Investigator’s view in this regard",
      writtenStatementAndClaimForm: "Written Statement and Claim Form (Insured’s Statement in Detail)",
      statementOfInsured: "Statement of Insured",
      familyProfessionalBackground: "Professional background of Father / Wife / Brother",
      statementTranslationRequired: "Translation of Insured Statement",
    },
    visitToPersonPossessingVehicle: {
      registrationNumber: "Registration Number",
      personName: "Name of the person",
      possessionPeriod: "Period of possession / employment",
      statementTranslation: "Statement Translation",
    },
    visitToFinancer: {
      financerName: "Name of Financier",
      totalInstallments: "No. of Total Instalments",
      remarks: "Financier Remarks (e.g. As per insured...)",
      installmentsPaid: "No. of Instalment paid",
      chequesBounced: "No. of Cheques Bounced",
      lastInstallmentDate: "Date of Last Instalment",
    },
    lossSiteInspection: {
      parkingLocationDescription: "Description of where it was parked",
      theftSpotLatitude: "Theft Spot Latitude",
      theftSpotLongitude: "Theft Spot Longitude",
      spotImages: "Spot Images",
    },
    keysRemark: {
      remarks: "Key Remarks (Detailed)",
    },
    feedBackFromLocationOfTheft: {
      statementOfParkingAttendant: "Statement of Parking Attendant",
      statementOfShopkeepers: "Statement of Shopkeeper’s",
      statementOfWatchman: "Statement of Watchman",
    },
    visitToServiceStation: {
      nameOfGarage: "Name of Garage",
    },
    documentsSubmittedAndVerified: {
      intimationLetter: "Intimation Letter",
      claimForm: "Claim Form",
      letterToRtoPoliceNcrb: "Letter to RTO / Police / NCRB",
      rcCopy: "RC Copy",
      onlineRcExtract: "Online RC Extract",
      kycForm: "KYC Form",
      insuredPanCard: "Insured PAN Card",
      insuredAadharCard: "Insured Aadhar Card",
      insurancePolicyCopy: "Insurance Policy Copy",
      originalFir: "Original FIR",
      qst: "QST",
      purchaseInvoice: "Purchase Invoice",
      bankPassbookDetails: "Bank Passbook Details",
      ncrbVehicleEnquiryReport: "NCRB Vehicle Enquiry Report",
      rtiCopyWithReceiptAndReply: "RTI Copy with Receipt & Reply",
      vehicleKeys: "Vehicle Keys",
      insuredStatement: "Insured Statement",
      witnessStatement: "Witness Statement",
      photosCollected: "Photos Collected",
      form29AndForm30: "Form 29 & Form 30",
      courtFinalReport: "Court Final Report",
    },
    insuredDlParticulars: {
      driverDetails: "Driver Details",
      dlDetails: "DL Details",
      dateOfBirth: "Date of Birth",
      nameOfRto: "Name of RTO",
      validityDetailsMcwgLmv: "Validity Details (MCWG/LMV)",
      validityDetailsOfTransport: "Validity Details (Transport)",
      addressOfDriver: "Address of Driver",
      dlStatus: "DL Status",
    },
    additionalInvestigationIfCommercialUseSuspected: {
      suspectedInvolvementOfFriendsFamilyOnAnyReport: "Suspected involvement of friend’s / family on any report",
      intentionalDelayInReportIncidentToPolice: "Intentional delay in report incident to the Police",
      anyInconsistentStatementOfFacts: "Any inconsistent statement of facts",
      anyConcernedAuthoritiesUnwillingToProvideFacts: "Any concerned authorities unwilling to provide facts",
      newsPaperCuttingAvailableOrNot: "News Paper cutting available or not",
      incomeCertificateAvailableOrNot: "Income Certificate available or not",
    },
    findings: {
      suspectedInvolvementOfFriendsFamilyOnAnyReport: "Suspected involvement of friend’s / family on any report",
      intentionalDelayInReportIncidentToPolice: "Intentional delay in report incident to the Police",
      anyInconsistentStatementOfFacts: "Any inconsistent statement of facts",
      anyConcernedAuthoritiesUnwillingToProvideFacts: "Any concerned authorities unwilling to provide facts",
      newsPaperCuttingAvailableOrNot: "News Paper cutting available or not",
      incomeCertificateAvailableOrNot: "Income Certificate available or not",
    },
    briefDetailsOfTheCase: {
      briefDetailsOfTheCase: "Detailed Case Brief (Multi-point)",
    },
    conclusion: {
      conclusion: "Final Conclusion & Recommendations (Multi-point)",
    }
  };

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
 else if  (isError) {
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
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/case"
                className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 uppercase tracking-tighter leading-tight">
                  Theft Case Editor
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded border border-indigo-100">
                    {caseId?.slice(-6).toUpperCase()}
                  </span>
                  {caseData?.summaryOfTheClaim?.claimNo && (
                    <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase truncate max-w-[150px]">
                      Claim: {caseData.summaryOfTheClaim.claimNo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              {parentCaseData?._id && (
                <Link
                  to={`/cases/edit/${parentCaseData._id}`}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-black uppercase rounded-lg border border-gray-200 transition-colors shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Manage Case</span>
                  <span className="sm:hidden text-[10px]">Case</span>
                </Link>
              )}
              <button
                onClick={handleGenerateDocx}
                disabled={isDocGenerating}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 text-white text-xs font-black uppercase rounded-lg shadow-sm transition-all disabled:opacity-50 shrink-0"
              >
                {isDocGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                {isDocGenerating ? "Generating..." : "DOCX Preview"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Section Selector (Tab Bar) */}
      <div className="md:hidden bg-white border-b overflow-x-auto flex-none sticky top-0 z-10 scrollbar-hide">
        <div className="flex px-4 py-2 gap-2">
          {sections.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => handleSectionChange(section.key)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                }`}
              >
                {section.key.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            );
          })}
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
                  caseType="theft"
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
                  form={form}
                  setForm={setForm}
                  firmData={caseFirmData}
                  fileFields={activeSectionConfig.files || {}}
                  defaultFieldValues={activeSectionConfig.key === 'letterDetails' ? { referenceNumber: caseData?.ourFileNo || caseData?.fileNo || "" } : {}}
                  isExpanded={true}
                  onToggle={() => { }}
                   labels={sectionLabels[activeSectionConfig.key] || {}}
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
      {previewData && (
        <DocxPreviewModal
          blob={previewData.blob}
          fileName={previewData.fileName}
          onClose={() => setPreviewData(null)}
          onConfirm={handleDocxConfirm}
        />
      )}
      </div>
    </div>
  );
}

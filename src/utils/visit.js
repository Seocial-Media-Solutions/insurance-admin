// utils/visit.js

/* ---------------------------------------------------------
   OD ROUTES
--------------------------------------------------------- */
const OD_VISIT_ROUTES = [
  { key: "letterDetails", label: "Letter Details", icon: "Mail", endpoint: "/letter-details" },
  { key: "reportReference", label: "Report Reference", icon: "FileText", endpoint: "/report-reference" },
  { key: "meetingDetails", label: "Meeting Details", icon: "Users", endpoint: "/meeting-details" },
  { key: "policyBreakInDetails", label: "Policy Break-In Details", icon: "ShieldAlert", endpoint: "/policy-break-in-details" },
  { key: "driverDetails", label: "Driver Details", icon: "User", endpoint: "/driver-details" },
  { key: "spotVisit", label: "Spot Visit", icon: "MapPin", endpoint: "/spot-visit" },
  { key: "garageVisit", label: "Garage Visit", icon: "Wrench", endpoint: "/garage-visit" },
  { key: "policeRecordDetails", label: "Police Record Details", icon: "BadgeCheck", endpoint: "/police-record-details" },
  { key: "observationFindingsConclusion", label: "Observation & Conclusion", icon: "SearchCheck", endpoint: "/observation-findings-conclusion" },
  { key: "opinion", label: "Opinion", icon: "MessageSquare", endpoint: "/opinion" },
  { key: "enclosures", label: "Enclosures", icon: "Folder", endpoint: "/enclosures" },
  { key: "photosAndDocuments", label: "Photos & Documents", icon: "Image", endpoint: "/photos-documents" },
  { key: "dlParticulars", label: "DL Particulars", icon: "IdCard", endpoint: "/dl-particulars" },
  { key: "dlDocuments", label: "DL Documents", icon: "FileBadge", endpoint: "/dl-documents" },
  { key: "driverDlParticulars", label: "Driver DL Particulars", icon: "UserCheck", endpoint: "/driver-dl-particulars" },
  { key: "occupantDlParticulars", label: "Occupant DL Particulars", icon: "UsersRound", endpoint: "/occupant-dl-particulars" },
  { key: "photosAndEvidence", label: "Photos & Evidence", icon: "Camera", endpoint: "/photos-evidence" },
];

/* ---------------------------------------------------------
   THEFT ROUTES
--------------------------------------------------------- */
export const THEFT_VISIT_ROUTES = [
  {
    key: "letterDetails", label: "Letter Details", icon: "Mail", endpoint: "/letter-details",
  },
  {
    key: "summaryOfTheClaim", label: "Summary of the Claim", icon: "FileText", endpoint: "/summary-of-claim",
  },
  {
    key: "policyAndIncidentDetails", label: "Policy & Incident Details", icon: "ShieldQuestion", endpoint: "/policy-incident-details",
  },
  {
    key: "purchaseAndRegistrationParticulars", label: "Purchase & Registration Details", icon: "ShoppingCart", endpoint: "/purchase-registration",
  },
  {
    key: "firDetails", label: "FIR Details", icon: "FileSearch", endpoint: "/fir-details",
  },
  {
    key: "maintenanceServiceRecord", label: "Maintenance Service Record", icon: "Wrench", endpoint: "/maintenance-record",
  },
  {
    key: "visitToInsured", label: "Visit to Insured", icon: "User", endpoint: "/visit-insured",
  },
  {
    key: "visitToPersonPossessingVehicle", label: "Visit to Person Possessing Vehicle", icon: "Users", endpoint: "/visit-person-possessing",
  },
  {
    key: "visitToFinancer", label: "Visit to Financer", icon: "Banknote", endpoint: "/visit-financer",
  },
  {
    key: "lossSiteInspection", label: "Loss Site Inspection", icon: "MapPin", endpoint: "/loss-site-inspection",
  },
  {
    key: "keysRemark", label: "Keys Remark", icon: "KeyRound", endpoint: "/keys-remark",
  },
  {
    key: "feedBackFromLocationOfTheft", label: "Feedback from Theft Location", icon: "MessageSquare", endpoint: "/feedback-theft-location",
  },
  {
    key: "visitToServiceStation", label: "Visit to Service Station", icon: "Wrench", endpoint: "/visit-service-station",
  },
  {
    key: "additionalInvestigationIfCommercialUseSuspected", label: "Commercial Use Investigation", icon: "Building", endpoint: "/additional-investigation",
  },
  {
    key: "findings", label: "Findings", icon: "Search", endpoint: "/findings",
  },
  {
    key: "conclusion", label: "Conclusion", icon: "FileCheck", endpoint: "/conclusion",
  },
  {
    key: "spotVisit", label: "Spot Visit", icon: "Image", endpoint: "/spot-visit",
  },
  {
    key: "documentsSubmittedAndVerified", label: "Documents Submitted & Verified", icon: "FolderCheck", endpoint: "/documents-submitted",
  },
  {
    key: "witnessDetails", label: "Witness Details", icon: "Users", endpoint: "/witness-details",
  },
  {
    key: "briefDetailsOfTheCase", label: "Brief Details of the Case", icon: "FileText", endpoint: "/brief-details",
  },
  {
    key: "insuredDlParticulars", label: "Insured DL Particulars", icon: "IdCard", endpoint: "/insured-dl-particulars",
  },
  {
    key: "insuredDocuments", label: "Insured Documents", icon: "FileBadge", endpoint: "/insured-documents",
  },
];

/* ---------------------------------------------------------
   SWITCH CASE — RETURN VISIT ARRAY BY CASE TYPE
--------------------------------------------------------- */
export function getVisitRoutes(caseType) {
  switch (caseType?.toUpperCase()) {
    case "OD":
      return OD_VISIT_ROUTES;

    case "THEFT":
      return THEFT_VISIT_ROUTES;

    default:
      return [];
  }
}

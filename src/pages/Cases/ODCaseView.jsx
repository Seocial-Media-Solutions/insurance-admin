import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Camera, Edit, FileText, Printer } from "lucide-react";
import { useODCases } from "../../context/ODCaseContext";
import { useODCaseDocx } from "../../hooks/useODCaseDocx";
import { useODCasePdf } from "../../hooks/useODCasePdf";
import saveAs from "https://esm.sh/file-saver@2.0.5";
import { toast } from "react-hot-toast";

/* ==================================================================================
   1. REUSABLE UI HELPERS
   ================================================================================== */

// Helper: Handle null/undefined/empty
const formatValue = (val) => {
  if (val === null || val === undefined || val === "") return "N/A";
  return val;
};

// Helper: Format Dates
const formatDate = (dateString) => {
  if (!dateString) return "__________";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Helper: Format Date Time (YYYY-MM-DD at hh:mm am/pm)
const formatDateTime = (dateString) => {
  if (!dateString) return "__________";
  const date = new Date(dateString);

  // Get YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePart = `${year}-${month}-${day}`;

  // Get Time with AM/PM
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const timePart = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

  return `${datePart} at ${timePart}`;
};

// ROW 1: Standard Label | Value
const TableRow = ({ label, value }) => (
  <tr className="border-b border-black">
    <td className="p-2 border-r border-black font-semibold text-gray-800 w-[40%] align-top text-sm md:text-base">
      {label}
    </td>
    <td className="p-2 text-gray-900 align-top text-sm md:text-base break-words font-medium">
      {formatValue(value)}
    </td>
  </tr>
);

// ROW 2: Split Value (Label | Val1 | Val2)
const SplitValueRow = ({ label, value1, value2 }) => (
  <tr className="border-b border-black">
    <td className="p-2 border-r border-black font-semibold text-gray-800 w-[40%] align-top text-sm md:text-base">
      {label}
    </td>
    <td className="p-0 text-gray-900 align-top text-sm md:text-base font-medium">
      <div className="flex h-full flex-col sm:flex-row">
        <div className="flex-1 p-2 border-b sm:border-b-0 sm:border-r border-black break-words">
          {formatValue(value1)}
        </div>
        <div className="flex-1 p-2 break-words">{formatValue(value2)}</div>
      </div>
    </td>
  </tr>
);

// ROW 3: Full Width Statement/Summary
const StatementRow = ({ label, value }) => {
  const displayValue =
    value && value.toString().trim() !== "" ? value : "Statement Enclosed";
  return (
    <tr className="border-b border-black">
      <td
        colSpan="2"
        className="p-2 align-top text-sm md:text-base text-gray-900"
      >
        <div className="font-bold mb-2 text-black underline underline-offset-2">
          {label}
        </div>
        <p className="text-justify leading-relaxed whitespace-pre-wrap pl-2 font-medium">
          {displayValue}
        </p>
        {!value && (
          <div className="mt-2 font-bold italic">Statement enclosed.</div>
        )}
      </td>
    </tr>
  );
};

// ROW 4: Enclosure Checklist Row
const EnclosureRow = ({ label, value }) => {
  const displayValue = value ? "Enclosed." : "Not Enclosed.";
  return (
    <tr className="border-b border-black">
      <td className="p-2 border-r border-black font-medium text-gray-900 w-[70%] text-sm md:text-base">
        {label}
      </td>
      <td className="p-2 text-gray-900 font-medium text-sm md:text-base">
        {displayValue}
      </td>
    </tr>
  );
};

/* ==================================================================================
   2. SECTION COMPONENTS (Matched to Document Images)
   ================================================================================== */

// - Letter Header & Reference
const GeneralDetails = ({ letterData, referenceData }) => {
  if (!letterData || !referenceData) return null;
  const letterDate = formatDate(letterData.date);
  const apptDate = formatDate(referenceData.investigatorAppointmentDate);

  return (
    <div className="bg-white shadow-sm rounded-sm border border-gray-200 p-8 md:p-12 mb-8 text-gray-900 font-sans leading-relaxed max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="font-bold text-sm md:text-base">
          Our Ref. No.: {letterData.referenceNumber || "________________"}
        </div>
        <div className="font-bold text-sm md:text-base underline underline-offset-4">
          Dt. {letterDate}
        </div>
      </div>

      <div className="mb-8 text-sm md:text-base space-y-1">
        <p className="font-bold">To,</p>
        <p className="font-bold">
          {letterData.recipientDesignation || "Manager"},
        </p>
        <p className="font-bold">
          {letterData.recipientDepartment || "Claim Tie-up Hub"},
        </p>
        <p className="font-bold">
          {letterData.recipientCompany || "Insurance Co. Ltd"},
        </p>
        <div className="font-bold max-w-sm whitespace-pre-line">
          {letterData.recipientAddress || "Address Line 1, City - Zipcode"}
        </div>
      </div>

      <div className="mb-6">
        <p className="font-bold text-sm md:text-base">
          <span className="underline underline-offset-2">Ref:</span> OD
          Investigation Report for claim of: -
          <span className="underline underline-offset-2 ml-1">
            {referenceData.insuredName || "Insured Name"}
          </span>{" "}
          ({referenceData.vehicleNumber || "Vehicle No"})
        </p>
      </div>

      <div className="text-justify text-sm md:text-base mb-4 font-medium">
        <p>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;In reference to the subject Own
          damage claim of Mr.{" "}
          <span className="font-bold underline underline-offset-2">
            {referenceData.insuredName || "___________"}
          </span>{" "}
          vehicle number{" "}
          <span className="font-bold underline underline-offset-2">
            {referenceData.vehicleNumber || "___________"}
          </span>
          , we have been appointed as an Investigator on {apptDate} by you. Our
          investigation report as follows:
        </p>
      </div>
    </div>
  );
};

// - Claim Summary
const ClaimSummary = ({ data }) => {
  if (!data) return null;
  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <h2 className="text-center text-xl md:text-2xl font-bold mb-4 uppercase text-black">
        Claim Summary
      </h2>
      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            <TableRow label="Vehicle No." value={data.vehicleNo} />
            <TableRow label="Claim No." value={data.claimNo} />
            <TableRow label="Policy No." value={data.policyNo} />
            <TableRow label="Policy Duration" value={data.policyDuration} />
            <TableRow label="Close Proximity" value={data.closeProximity} />
            <TableRow label="Insured Name" value={data.insuredName} />
            <TableRow
              label="Insured's Contact No."
              value={data.insuredContactNo}
            />
            <TableRow label="Name of the said driver" value={data.driverName} />
            <TableRow
              label="Date of loss & Time (As per claim Form)"
              value={data.dateOfLossAndTime}
            />
            <TableRow label="Date of FIR Details" value={data.firDetailsDate} />
            <TableRow
              label="General Diary Details"
              value={data.generalDiaryDetails}
            />
            <TableRow label="Make & Model" value={data.makeAndModel} />
            <TableRow label="Chassis No." value={data.chassisNo} />
            <TableRow label="Engine No." value={data.engineNo} />
            <TableRow
              label="Date of claim intimated to company"
              value={data.dateOfClaimIntimated}
            />
            <TableRow label="Delay Intimation" value={data.delayIntimation} />
            <TableRow label="Investigator Name" value={data.investigatorName} />
            <TableRow label="Vehicle Damages" value={data.vehicleDamages} />
            <StatementRow
              label="Summary of accident as per claim form:"
              value={data.accidentSummary}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

// - Insured cum Driver Details
const InsuredDetails = ({ data }) => {
  if (!data) return null;
  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <h2 className="text-center text-xl md:text-2xl font-bold mb-4 uppercase text-black">
        Insured cum driver Details
      </h2>
      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            <TableRow label="Name of Insured" value={data.nameOfInsured} />
            <TableRow label="PAN Card" value={data.panCard} />
            <TableRow label="Aadhar Card No." value={data.aadharCardNo} />
            <TableRow
              label="Address of Insured as per RC"
              value={data.addressAsPerRC}
            />
            <TableRow
              label="Address of Insured as per Aadhar Card"
              value={data.addressAsPerAadhar}
            />
            <TableRow
              label="Insured Profession"
              value={data.insuredProfession}
            />
            <TableRow
              label="Driver injured or not"
              value={data.driverInjured}
            />
            <TableRow
              label="Driver relationship"
              value={data.driverRelationship}
            />
            <TableRow
              label="Attested Letter Copy from the Driver"
              value={data.attestedLetterFromDriver}
            />
            <TableRow
              label="Driver Confirmation"
              value={data.driverConfirmation}
            />
            <TableRow
              label="Obtained Google GPS Timeline"
              value={data.googleGPSTimelineObtained}
            />
            <TableRow
              label="Any Photos/Videos taken by insured and anyone"
              value={data.photosOrVideosTaken}
            />
            <TableRow label="Emp. Stability" value={data.employmentStability} />
            <TableRow
              label="DL details/ Any Endorsements"
              value={data.dlNumber}
            />
            <TableRow
              label="Name of RTO (Licencing Authority)"
              value={data.rtoName}
            />
            <SplitValueRow
              label="Eligible to drive"
              value1={data.eligibleToDrive}
              value2="Transport"
            />
            <SplitValueRow
              label="Validity Details"
              value1={data.validityNonTransport}
              value2={data.validityTransport}
            />
            <TableRow
              label="Need to take account of how many Injuries and death in the accident"
              value={data.injuriesOrDeathDetails}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

// - Vehicle Details
const VehicleDetails = ({ data }) => {
  if (!data) return null;
  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <h2 className="text-center text-xl md:text-2xl font-bold mb-4 uppercase text-black">
        Vehicle Details
      </h2>
      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            <TableRow
              label="Vehicle Registration no."
              value={data.vehicleRegistrationNo}
            />
            <TableRow
              label="Name of Registered Owner"
              value={data.registeredOwnerName}
            />
            <TableRow
              label="New Vehicle Invoice Details (Purchase)"
              value={data.newVehicleInvoiceDetails}
            />
            <TableRow label="Make & Model" value={data.makeAndModel} />
            <TableRow label="Registration Date" value={data.registrationDate} />
            <TableRow
              label="Year of manufacture"
              value={data.yearOfManufacture}
            />
            <TableRow label="Chassis No." value={data.chassisNo} />
            <TableRow label="Engine No." value={data.engineNo} />
            <TableRow label="HYP Details" value={data.hypDetails} />
            <TableRow
              label="MV Tax details (Tax from)"
              value={data.mvTaxDetails}
            />
            <TableRow label="Permit" value={data.permit} />
            <TableRow label="Fitness" value={data.fitness} />
            <TableRow label="Body type" value={data.bodyType} />
            <TableRow label="Seating Capacity" value={data.seatingCapacity} />
            <TableRow
              label="Owner Serial Number"
              value={data.ownerSerialNumber}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

// - Meeting Details
const MeetingDetails = ({ data }) => {
  if (!data) return null;
  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <div className="border-2 border-b-0 border-black bg-white p-2 text-center">
        <h2 className="text-lg md:text-xl font-bold uppercase text-black">
          Details of meeting with Insured
        </h2>
      </div>
      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            <TableRow
              label="Insured introduction (name, address, profession, age)"
              value={data.insuredIntroduction}
            />
            <TableRow
              label="Vehicle information"
              value={data.vehicleInformation}
            />
            <TableRow
              label="Date and time of loss"
              value={data.dateAndTimeOfLoss}
            />
            <TableRow
              label="Travelling from where ____ to where____"
              value={data.travelingFromTo}
            />
            <TableRow label="Purpose of travel" value={data.purposeOfTravel} />
            <TableRow
              label="Accident version-- exact loss location details"
              value={data.accidentVersionLocationDetails}
            />
            <StatementRow
              label="Statement of the Insured's / deceased Wife:"
              value={data.accidentDetailsAsPerInsured}
            />
            <TableRow
              label="Accident details as per Occupant- True version"
              value={data.accidentDetailsAsPerOccupant}
            />
            <TableRow
              label="How Insured/driver rehabilitated from loss location?"
              value={data.rehabilitationDetails}
            />
            <TableRow
              label="After accident first contact details?"
              value={data.firstContactAfterAccident}
            />
            <TableRow
              label="Police intimation details (delay explanation)"
              value={data.policeIntimationDetails}
            />
            <TableRow
              label="Photos to be exchanged via Bluetooth"
              value={data.photosExchanged}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

// - Policy & Break in
const PolicyBreakInDetails = ({ data }) => {
  if (!data) return null;
  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <div className="border-2 border-b-0 border-black bg-white p-2 text-center">
        <h2 className="text-lg md:text-xl font-bold uppercase text-black">
          Policy & Break in Details
        </h2>
      </div>
      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            <TableRow label="Policy No." value={data.policyNo} />
            <TableRow label="Policy period" value={data.policyPeriod} />
            <TableRow label="Policy type" value={data.policyType} />
            <TableRow label="IDV" value={data.idv} />
            <tr className="border-b border-black">
              <td className="p-0 border-r border-black w-[40%] align-top">
                <div className="border-b border-black p-2 font-semibold text-sm md:text-base">
                  Previous Policy No.
                </div>
                <div className="border-b border-black p-2 font-semibold text-sm md:text-base">
                  Previous Policy period
                </div>
                <div className="border-b border-black p-2 font-semibold text-sm md:text-base">
                  Previous Insurer
                </div>
                <div className="border-b border-black p-2 font-semibold text-sm md:text-base">
                  Previous Policy Type
                </div>
                <div className="p-2 font-semibold text-sm md:text-base">
                  Any claim reported in previous policy
                </div>
              </td>
              <td className="p-0 align-middle text-center font-bold text-gray-600 bg-gray-50">
                <div className="p-8">
                  {data.anyClaimInPreviousPolicy || "N/A"}
                </div>
              </td>
            </tr>
            <TableRow label="Break in" value={data.breakIn} />
            <TableRow
              label="Break in Inspection date (if yes)"
              value={data.breakInInspectionDate}
            />
            <TableRow
              label="Odometer reading at the time of break in"
              value={data.odometerReadingAtBreakIn}
            />
            <TableRow
              label="Any discrepancy in break in and damaged photo"
              value={data.breakInDiscrepancy}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

// - Garage Visit
const GarageVisitDetails = ({ data }) => {
  if (!data) return null;
  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <div className="border-2 border-b-0 border-black bg-white p-2 text-center">
        <h2 className="text-lg md:text-xl font-bold uppercase text-black">
          Garage Visit
        </h2>
      </div>
      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            <TableRow label="Vehicle Inspected" value={data.vehicleInspected} />
            <TableRow
              label="Place of Inspection"
              value={data.placeOfInspection}
            />
            <TableRow
              label="Insured vehicle last service date"
              value={data.lastServiceDate}
            />
            <TableRow
              label="Co-relating the damages on vehicle with accident description"
              value={data.damageCorrelationWithAccident}
            />
            <TableRow
              label="Inspection of vehicle to find traces of blood/hair"
              value={data.bloodOrBodyTraceInspection}
            />
            {(() => {
              let vendors = [];
              try {
                if (data.towingVendorDetails) {
                  const parsed = Array.isArray(data.towingVendorDetails) ? data.towingVendorDetails : JSON.parse(data.towingVendorDetails);
                  if (Array.isArray(parsed)) vendors = parsed;
                  else if (typeof parsed === 'object') vendors = [parsed]; // Handle potential single object case safety
                }
              } catch (e) {
                // If parse fails and it's a non-empty string, show it as legacy text
                if (typeof data.towingVendorDetails === "string" && data.towingVendorDetails.trim() !== "") {
                  return <TableRow label="Towing vendor details" value={data.towingVendorDetails} />;
                }
              }

              if (vendors.length === 0) {
                return <TableRow label="Towing vendor details" value={data.towingVendorDetails || "N/A"} />;
              }

              return (
                <tr className="border-b border-black">
                  <td className="p-2 border-r border-black font-semibold text-gray-800 w-[40%] align-top text-sm md:text-base">
                    Towing Vendor Details
                  </td>
                  <td className="p-0 text-gray-900 align-top text-sm md:text-base break-words font-medium">
                    {vendors.map((vendor, index) => (
                      <div key={index} className={`p-2 ${index < vendors.length - 1 ? "border-b border-gray-300" : ""}`}>
                        {vendors.length > 1 && <div className="font-bold underline mb-1">Vendor #{index + 1}</div>}
                        <div className="grid grid-cols-1 gap-1">
                          <div><span className="font-semibold">Name:</span> {vendor.towingVendorName || "N/A"}</div>
                          <div><span className="font-semibold">Address:</span> {vendor.towingVendorAddress || "N/A"}</div>
                          <div><span className="font-semibold">Contact:</span> {vendor.towingVendorContactNo || "N/A"}</div>
                          <div><span className="font-semibold">Invoice:</span> {vendor.invoiceOdTowing || "N/A"}</div>
                          <div><span className="font-semibold">Route:</span> {vendor.whereToWhere || "N/A"}</div>
                          <div><span className="font-semibold">Amount:</span> {vendor.towingAmount || "N/A"}</div>
                          <div><span className="font-semibold">Status:</span> {vendor.verifiedOrNot || "N/A"}</div>
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })()}
            <TableRow
              label="Job card date and details"
              value={data.jobCardDetails}
            />
            <TableRow
              label="Vehicle status if > 24 hrs"
              value={data.vehicleStatusAfter24Hrs}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

// - Police Records
const PoliceRecordDetails = ({ data }) => {
  if (!data) return null;
  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <div className="border-2 border-b-0 border-black bg-white p-2 text-center">
        <h2 className="text-lg md:text-xl font-bold uppercase text-black">
          Police record details
        </h2>
      </div>
      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            <TableRow label="FIR Status" value={data.firStatus} />
            {data.firStatus === 'yes' && (
              <>
                <TableRow
                  label="Name of Police Station"
                  value={data.policeStationName}
                />
                <TableRow
                  label="Name of Police Station District"
                  value={data.nameOfPoliceStationDistrict}
                />
                <TableRow label="FIR No./ NCR No." value={data.firNo} />
                <TableRow
                  label="FIR Date & Time"
                  value={formatDateTime(data.firDateAndTime)}
                />
                <TableRow label="District" value={data.district} />
                <TableRow label="State" value={data.state} />
              </>
            )}
            <TableRow label="PMR" value={data.pmr || "Yes"} />
            <TableRow label="Hospital Records" value={data.hospitalRecords} />
            <TableRow
              label="Injury Details (Insured/Driver/ TP)"
              value={data.injuryDetails}
            />
            <tr>
              <td
                colSpan="2"
                className="p-2 align-top text-sm md:text-base text-gray-900"
              >
                <div className="font-bold mb-2 text-black">
                  Details of GD entry received from the police under RTI as
                  follows:
                </div>
                <p className="text-justify leading-relaxed font-bold text-lg text-gray-800 p-2 whitespace-pre-wrap">
                  {data.gdEntryText || data.generalDiaryDetails || "N/A"}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// - Findings
const ObservationFindings = ({ data }) => {
  if (!data) return null;
  const findingsList = [
    data.accidentSequenceDescription,
    data.policeActionStatus,
    data.ambiguityStatus,
    data.driverProfessionAndVehicleUsage,
    data.injuryStatus,
    data.conclusion,
  ].filter((item) => item && item.toString().trim() !== "");

  if (findingsList.length === 0) return null;

  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <div className="p-4 text-center mb-2">
        <h2 className="text-xl md:text-2xl font-bold text-black inline-block border-b-2 border-transparent">
          Observation, Findings & Conclusion
        </h2>
      </div>
      <div className="px-8 pb-8">
        <ol className="list-decimal pl-5 space-y-6 text-justify text-sm md:text-base font-medium leading-relaxed text-gray-800">
          {findingsList.map((text, index) => (
            <li key={index} className="pl-2">
              <span className="whitespace-pre-wrap">{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

// - Opinion & Enclosures
const OpinionEnclosures = ({ opinion, enclosures, investigatorName }) => {
  if (!opinion) return null;

  // Helper to get enclosure status safely
  const getEncValue = (key) => (enclosures ? enclosures[key] : null);

  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold underline text-black mb-4">
          Opinion
        </h2>
        <div className="text-justify font-bold leading-relaxed text-sm md:text-base px-4">
          {opinion.claimAdmissibilityOpinion ||
            "In our opinion the subject claim is not admissible due to violation of the original route permit, we recommend underwriters to go with as per the policy terms and conditions."}
        </div>
      </div>

      <div className="border-2 border-black mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th
                colSpan="2"
                className="p-2 text-left text-black font-bold text-sm md:text-base"
              >
                Enclosures:
              </th>
            </tr>
          </thead>
          <tbody>
            <EnclosureRow label="RC Verification" value={getEncValue("rc")} />
            <EnclosureRow
              label="DL extract (Insured Cum Driver)"
              value={getEncValue("dlExtractInsuredAndDriver")}
            />
            <EnclosureRow
              label="Statement Insured’s wife"
              value={getEncValue("insuredStatement")}
            />
            <EnclosureRow
              label="Insured’s wife photo while holding/writing the statement"
              value={getEncValue("insuredPhotoWithStatement")}
            />
            <EnclosureRow
              label="Insured’s neighbour statement"
              value={getEncValue("driverAndOccupantStatement")}
            />
            <EnclosureRow
              label="Insured’s neighbour photo while holding/writing the statement"
              value={getEncValue("driverAndOccupantPhotoWithStatement")}
            />
            <EnclosureRow label="GD Diary Entry" value={true} />
            <EnclosureRow
              label="Vehicle photo’s"
              value={getEncValue("vehiclePhotos")}
            />
            <EnclosureRow label="Court certified Charge Sheet" value={true} />
          </tbody>
        </table>
      </div>

      <div className="mt-12 px-4 flex flex-col items-end">
        <div className="w-full text-left font-bold text-sm md:text-base mb-12">
          This report is issued without Prejudice
        </div>

        <div className="text-right">
          <div className="font-bold text-sm md:text-base mb-16">
            For {investigatorName || "Satyendra Kumar Garg"}
          </div>
          <div className="font-bold text-sm md:text-base">Signature</div>
        </div>
      </div>
    </div>
  );
};

// Generic Fallback Table
const GenericTableSection = ({ title, data, fields, fileFields = {} }) => {
  if (!data) return null;
  const hasData = Object.keys(fields).some((key) => data[key]);
  if (!hasData) return null;

  return (
    <div className="bg-white max-w-5xl mx-auto mb-8 text-gray-900 font-sans shadow-sm">
      <div className="border-2 border-b-0 border-black bg-white p-2 text-center">
        <h2 className="text-lg md:text-xl font-bold uppercase text-black">
          {title}
        </h2>
      </div>
      <div className="border-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            {Object.keys(fields).map((key) => {
              if (fileFields[key]) return null;
              const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
              return <TableRow key={key} label={label} value={data[key]} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Image Gallery
const ImageGallery = ({ data, fileFields }) => {
  const attachments = Object.keys(fileFields)
    .map((key) => {
      const val = data ? data[key] : null;
      if (!val || (Array.isArray(val) && val.length === 0)) return null;
      return { key, val };
    })
    .filter(Boolean);

  if (attachments.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto mt-8 pt-6 border-t-2 border-gray-200">
      <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Camera className="w-5 h-5 text-gray-600" />
        Attachments & Evidence
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {attachments.map(({ key, val }) => {
          if (Array.isArray(val)) {
            return val.map((img, idx) => (
              <Thumbnail
                key={`${key}-${idx}`}
                src={typeof img === "string" ? img : img?.imageUrl}
                label={`${key} ${idx + 1}`}
              />
            ));
          }
          const imgSrc = typeof val === "string" ? val : val?.imageUrl;
          return <Thumbnail key={key} src={imgSrc} label={key} />;
        })}
      </div>
    </div>
  );
};

const Thumbnail = ({ src, label }) => (
  <div className="relative group rounded-lg overflow-hidden border bg-gray-50 aspect-[4/3] shadow-sm">
    <img
      src={src}
      alt={label}
      className="w-full h-full object-cover"
      onError={(e) => (e.target.style.display = "none")}
    />
    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-2 text-center truncate uppercase">
      {label.replace(/([A-Z])/g, " $1").trim()}
    </div>
  </div>
);

/* ==================================================================================
   3. MAIN COMPONENT
   ================================================================================== */

export default function ODCaseView() {
  const { caseId } = useParams();
  const { getODCaseById } = useODCases();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { generateDocx, isGenerating: isGeneratingDocx } = useODCaseDocx();
  const { generatePdf, isGenerating: isGeneratingPdf } = useODCasePdf();

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const caseData = await getODCaseById(caseId);
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

  // Handle Export
  const handleGenerate = async (generatorFn, fileExt = 'docx') => {
    const mergedData = { ...data, ...(data?.odDetails || {}) };
    const result = await generatorFn(mergedData, GENERIC_SECTIONS_CONFIG);
    if (result instanceof Blob) {
      const fileName = `OD_Case_${caseId}_${new Date().toISOString().split('T')[0]}.${fileExt}`;
      saveAs(result, fileName);
      toast.success(`${fileExt.toUpperCase()} Generated Successfully!`);
    }
  };

  /* Config for fallback Generic Tables */
  const GENERIC_SECTIONS_CONFIG = {
    spotVisit: {
      label: "Spot Visit Details",
      fields: {
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
      },
    },
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
        {error}
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Case not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        {/* TOP HEADER (Actions) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>OD Case</span>
              <span>•</span>
              <span className="font-mono text-gray-600 font-bold">
                {caseId}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Investigation Report
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleGenerate(generateDocx)}
              disabled={isGeneratingDocx}
              className="px-4 py-2 border rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isGeneratingDocx ? "Generating..." : "Docx"}
            </button>
            <button
              onClick={() => handleGenerate(generatePdf)}
              disabled={isGeneratingPdf}
              className="px-4 py-2 border rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {isGeneratingPdf ? "Generating..." : "PDF"}
            </button>
            <Link
              to="/case"
              className="px-4 py-2 border rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50"
            >
              Back
            </Link>
            <Link
              to={`/case/od-case/edit/${caseId}`}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit
            </Link>
          </div>
        </div>

        {/* --- REPORT CONTENT --- */}
        <div className="bg-white p-0 md:p-8 shadow-md print:shadow-none print:p-0 rounded-lg">
          {/* 1. Letter / General Details */}
          <GeneralDetails
            letterData={data.letterDetails}
            referenceData={data.reportReference}
          />

          {/* 2. OD Specific Nested Sections (if odDetails exists) */}
          {data.odDetails && (
            <>
              <ClaimSummary data={data.odDetails.claimSummary} />
              <InsuredDetails data={data.odDetails.insuredDetails} />
              <VehicleDetails data={data.odDetails.vehicleDetails} />
            </>
          )}

          {/* 3. Meeting & Policy Sections */}
          <MeetingDetails data={data.meetingDetails} />
          <PolicyBreakInDetails data={data.policyBreakInDetails} />

          {/* 4. Garage & Police Sections */}
          <GarageVisitDetails data={data.garageVisit} />
          <PoliceRecordDetails data={data.policeRecordDetails} />

          {/* 5. Findings & Observations */}
          <ObservationFindings data={data.observationFindingsConclusion} />

          {/* 6. Generic Tables for Remaining Sections */}
          {Object.entries(GENERIC_SECTIONS_CONFIG).map(([key, config]) => (
            <GenericTableSection
              key={key}
              title={config.label}
              data={data[key]}
              fields={config.fields}
            />
          ))}

          {/* 7. Opinion & Enclosures */}
          <OpinionEnclosures
            opinion={data.opinion}
            enclosures={data.enclosures}
            investigatorName={data.odDetails?.claimSummary?.investigatorName}
          />

          {/* 8. Attachments Gallery */}
          <ImageGallery
            data={{
              ...data.photosAndDocuments,
              ...data.photosAndEvidence,
              ...data.dlDocuments,
            }}
            fileFields={{
              rcPhoto: true,
              insuredPanCardPhoto: true,
              driverAadharCardPhoto: true,
              driverDlPhoto: true,
              spotPhotos: true,
              vehiclePhotos: true,
              insuredWithStatementPhoto: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
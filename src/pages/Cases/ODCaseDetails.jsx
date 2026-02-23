import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useODCase } from "../../hooks/useODCases";
import {
    ArrowLeft,
    Calendar,
    User,
    Car,
    FileText,
    MapPin,
    Shield,
    Image as ImageIcon,
    Download,
    Paperclip,
    ClipboardCheck,
    BadgeInfo,
    CreditCard,
    Loader2
} from "lucide-react";

export default function ODCaseDetails() {
    const { caseId } = useParams();

    // Use TanStack Query hook
    const { data, isLoading, isError, error } = useODCase(caseId);

    const caseData = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading case details...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 font-medium">
                        {error?.response?.data?.message || error?.message || 'Error loading case details'}
                    </p>
                    <Link to="/case" className="mt-4 inline-block text-blue-600 hover:underline">
                        ← Back to Cases
                    </Link>
                </div>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-600 font-medium">No case data found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
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
                            <h1 className="text-2xl font-bold text-gray-900">OD Case Details</h1>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Letter Details */}
                {caseData.letterDetails && (
                    <Section title="Letter Details" icon={FileText}>
                        <DetailGrid>
                            <DetailItem label="Date" value={formatDate(caseData.letterDetails.date)} />
                            <DetailItem label="Reference Number" value={caseData.letterDetails.referenceNumber} />
                            <DetailItem label="Recipient Designation" value={caseData.letterDetails.recipientDesignation} />
                            <DetailItem label="Recipient Department" value={caseData.letterDetails.recipientDepartment} />
                            <DetailItem label="Recipient Company" value={caseData.letterDetails.recipientCompany} />
                            <DetailItem label="Recipient Address" value={caseData.letterDetails.recipientAddress} span={2} />
                        </DetailGrid>
                    </Section>
                )}

                {/* Report Reference */}
                {caseData.reportReference && (
                    <Section title="Report Reference" icon={FileText}>
                        <DetailGrid>
                            <DetailItem label="Report Type" value={caseData.reportReference.reportType} />
                            <DetailItem label="Claim Type" value={caseData.reportReference.claimType} />
                            <DetailItem label="Insured Name" value={caseData.reportReference.insuredName} />
                            <DetailItem label="Vehicle Number" value={caseData.reportReference.vehicleNumber} />
                            <DetailItem label="Investigator Appointment Date" value={formatDate(caseData.reportReference.investigatorAppointmentDate)} />
                        </DetailGrid>
                    </Section>
                )}

                {/* OD Details - Claim Summary */}
                {caseData.odDetails?.claimSummary && (
                    <Section title="Claim Summary" icon={Shield}>
                        <DetailGrid>
                            <DetailItem label="Vehicle No" value={caseData.odDetails.claimSummary.vehicleNo} />
                            <DetailItem label="Claim No" value={caseData.odDetails.claimSummary.claimNo} />
                            <DetailItem label="Policy No" value={caseData.odDetails.claimSummary.policyNo} />
                            <DetailItem label="Policy Duration" value={caseData.odDetails.claimSummary.policyDuration} />
                            <DetailItem label="Close Proximity" value={caseData.odDetails.claimSummary.closeProximity} />
                            <DetailItem label="Insured Name" value={caseData.odDetails.claimSummary.insuredName} />
                            <DetailItem label="Contact No" value={caseData.odDetails.claimSummary.insuredContactNo} />
                            <DetailItem label="Driver Name" value={caseData.odDetails.claimSummary.driverName} />
                            <DetailItem label="Date & Time of Loss" value={caseData.odDetails.claimSummary.dateOfLossAndTime} />
                            <DetailItem label="Make & Model" value={caseData.odDetails.claimSummary.makeAndModel} />
                            <DetailItem label="Chassis No" value={caseData.odDetails.claimSummary.chassisNo} />
                            <DetailItem label="Engine No" value={caseData.odDetails.claimSummary.engineNo} />
                            {/* <DetailItem label="Investigator" value={caseData.odDetails.claimSummary.investigatorName} /> */}
                            <DetailItem label="Vehicle Damages" value={caseData.odDetails.claimSummary.vehicleDamages} span={2} />
                            <DetailItem label="Accident Summary" value={caseData.odDetails.claimSummary.accidentSummary} span={3} textarea />
                        </DetailGrid>
                    </Section>
                )}

                {/* OD Details - Insured Details */}
                {caseData.odDetails?.insuredDetails && (
                    <Section title="Insured Details" icon={User}>
                        <DetailGrid>
                            <DetailItem label="Name" value={caseData.odDetails.insuredDetails.nameOfInsured} />
                            <DetailItem label="PAN Card" value={caseData.odDetails.insuredDetails.panCard} />
                            <DetailItem label="Aadhar No" value={caseData.odDetails.insuredDetails.aadharCardNo} />
                            <DetailItem label="Address (RC)" value={caseData.odDetails.insuredDetails.addressAsPerRC} span={2} />
                            <DetailItem label="Profession" value={caseData.odDetails.insuredDetails.insuredProfession} />
                            <DetailItem label="Driver Injured" value={caseData.odDetails.insuredDetails.driverInjured} />
                            <DetailItem label="Driver Relationship with Insured" value={caseData.odDetails.insuredDetails.driverRelationshipWithInsured} />
                            <DetailItem label="Name of Driver" value={caseData.odDetails.insuredDetails.nameOfDriver} />

                            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 border-t pt-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Injured Persons Details</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <DetailItem label="Injuries Available?" value={caseData.odDetails.insuredDetails.detailsOfInjured?.availability || "Not Available"} />
                                </div>

                                {caseData.odDetails.insuredDetails.detailsOfInjured?.availability?.toLowerCase() === 'yes' &&
                                    caseData.odDetails.insuredDetails.detailsOfInjured.injuredPersons?.length > 0 && (
                                        <div className="mt-3 grid gap-3">
                                            {caseData.odDetails.insuredDetails.detailsOfInjured.injuredPersons.map((person, idx) => (
                                                <div key={idx} className="bg-gray-50 p-3 rounded-lg border text-sm">
                                                    <div className="font-semibold text-indigo-700 mb-2 border-b pb-1">Person {idx + 1}</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                        <div><span className="text-gray-500">Name:</span> <span className="font-medium">{person.name}</span></div>
                                                        <div><span className="text-gray-500">Age:</span> <span className="font-medium">{person.age}</span></div>
                                                        <div className="md:col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{person.address}</span></div>
                                                        <div><span className="text-gray-500">Type:</span> <span className="font-medium">{person.injuryType}</span></div>
                                                        {person.injuryType === 'Grievous' && (
                                                            <div className="md:col-span-2 mt-1 bg-white p-2 rounded border border-gray-100">
                                                                <span className="text-gray-500 block text-xs mb-1">Description:</span>
                                                                {person.injuryDescription}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>

                            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 border-t pt-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Deceased Persons Details</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    <DetailItem label="Deceased Available?" value={caseData.odDetails.insuredDetails.detailsOfDeceased?.availability || "Not Available"} />
                                </div>

                                {caseData.odDetails.insuredDetails.detailsOfDeceased?.availability?.toLowerCase() === 'yes' &&
                                    caseData.odDetails.insuredDetails.detailsOfDeceased.deceasedPersons?.length > 0 && (
                                        <div className="mt-3 grid gap-3">
                                            {caseData.odDetails.insuredDetails.detailsOfDeceased.deceasedPersons.map((person, idx) => (
                                                <div key={idx} className="bg-gray-50 p-3 rounded-lg border text-sm">
                                                    <div className="font-semibold text-red-600 mb-2 border-b pb-1">Deceased #{idx + 1}</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                        <div><span className="text-gray-500">Name:</span> <span className="font-medium">{person.name}</span></div>
                                                        <div><span className="text-gray-500">Age:</span> <span className="font-medium">{person.age}</span></div>
                                                        <div className="md:col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{person.address}</span></div>
                                                        <div><span className="text-gray-500">Date of Death:</span> <span className="font-medium">{person.dateOfDeath}</span></div>
                                                        <div><span className="text-gray-500">PMR Available:</span> <span className="font-medium">{person.pmrAvailable}</span></div>

                                                        {person.pmrAvailable === 'No' && (
                                                            <div className="md:col-span-2 mt-1 bg-white p-2 rounded border border-gray-100">
                                                                <span className="text-gray-500 block text-xs mb-1">Reason for No PMR:</span>
                                                                {person.pmrDetails?.noPmrReason}
                                                            </div>
                                                        )}

                                                        {person.pmrAvailable === 'Yes' && (
                                                            <>
                                                                <div><span className="text-gray-500">PMR No:</span> <span className="font-medium">{person.pmrDetails?.pmrNo}</span></div>
                                                                <div><span className="text-gray-500">Time:</span> <span className="font-medium">{person.pmrDetails?.pmrTime?.replace('T', ' ')}</span></div>
                                                                <div className="md:col-span-2"><span className="text-gray-500">Place:</span> <span className="font-medium">{person.pmrDetails?.pmrPlace}</span></div>
                                                                <div className="md:col-span-2 mt-1 bg-white p-2 rounded border border-gray-100">
                                                                    <span className="text-gray-500 block text-xs mb-1">Doctor Opinion:</span>
                                                                    {person.pmrDetails?.doctorOpinion}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </DetailGrid>
                    </Section>
                )}

                {/* OD Details - Vehicle Details */}
                {caseData.odDetails?.vehicleDetails && (
                    <Section title="Vehicle Details" icon={Car}>
                        <DetailGrid>
                            <DetailItem label="Registration No" value={caseData.odDetails.vehicleDetails.vehicleRegistrationNo} />
                            <DetailItem label="Owner Name" value={caseData.odDetails.vehicleDetails.registeredOwnerName} />
                            <DetailItem label="Make & Model" value={caseData.odDetails.vehicleDetails.makeAndModel} />
                            <DetailItem label="Registration Date" value={caseData.odDetails.vehicleDetails.registrationDate} />
                            <DetailItem label="Year of Manufacture" value={caseData.odDetails.vehicleDetails.yearOfManufacture} />
                            <DetailItem label="Chassis No" value={caseData.odDetails.vehicleDetails.chassisNo} />
                            <DetailItem label="Engine No" value={caseData.odDetails.vehicleDetails.engineNo} />
                            <DetailItem label="Hypothecation" value={caseData.odDetails.vehicleDetails.hypDetails} />
                            <DetailItem label="MV Tax Details" value={caseData.odDetails.vehicleDetails.mvTaxDetails} />
                            <DetailItem label="Body Type" value={caseData.odDetails.vehicleDetails.bodyType} />
                            <DetailItem label="Seating Capacity" value={caseData.odDetails.vehicleDetails.seatingCapacity} />
                            <DetailItem label="Owner Serial No" value={caseData.odDetails.vehicleDetails.ownerSerialNumber} />
                        </DetailGrid>
                    </Section>
                )}

                {/* Meeting Details */}
                {caseData.meetingDetails && hasContent(caseData.meetingDetails) && (
                    <Section title="Meeting Details" icon={User}>
                        <DetailGrid>
                            <DetailItem label="Insured Introduction" value={caseData.meetingDetails.insuredIntroduction} span={2} />
                            <DetailItem label="Vehicle Information" value={caseData.meetingDetails.vehicleInformation} span={2} />
                            <DetailItem label="Date & Time of Loss" value={formatDate(caseData.meetingDetails.dateAndTimeOfLoss)} />
                            <DetailItem label="Traveling From-To" value={caseData.meetingDetails.travelingFromTo} />
                            <DetailItem label="Purpose of Travel" value={caseData.meetingDetails.purposeOfTravel} span={2} />
                            <DetailItem label="Latitude" value={caseData.meetingDetails.accidentLocationLatitude} />
                            <DetailItem label="Longitude" value={caseData.meetingDetails.accidentLocationLongitude} />
                            <DetailItem label="Accident Details (Driver)" value={caseData.meetingDetails.accidentDetailsAsPerDriver} span={3} textarea />
                            <DetailItem label="Accident Details (Insured)" value={caseData.meetingDetails.accidentDetailsAsPerInsured} span={3} textarea />
                            <DetailItem label="Accident Details (Occupant)" value={caseData.meetingDetails.accidentDetailsAsPerOccupant} span={3} textarea />
                            <DetailItem label="Rehabilitation Details" value={caseData.meetingDetails.rehabilitationDetails} span={2} />
                            <DetailItem label="First Contact After Accident" value={caseData.meetingDetails.firstContactAfterAccident} span={2} />

                        </DetailGrid>
                    </Section>
                )}

                {/* Policy & Break-in Details */}
                {caseData.policyBreakInDetails && hasContent(caseData.policyBreakInDetails) && (
                    <Section title="Policy & Break-in Details" icon={Shield}>
                        <DetailGrid>
                            <DetailItem label="Policy No" value={caseData.policyBreakInDetails.policyNo} />
                            <DetailItem label="Policy Period" value={caseData.policyBreakInDetails.policyPeriod} />
                            <DetailItem label="Policy Type" value={caseData.policyBreakInDetails.policyType} />
                            <DetailItem label="IDV" value={caseData.policyBreakInDetails.idv} />
                            <DetailItem label="Previous Policy No" value={caseData.policyBreakInDetails.previousPolicyNo} />
                            <DetailItem label="Previous Policy Period" value={caseData.policyBreakInDetails.previousPolicyPeriod} />
                            <DetailItem label="Previous Insurer" value={caseData.policyBreakInDetails.previousInsurer} />
                            <DetailItem label="Previous Policy Type" value={caseData.policyBreakInDetails.previousPolicyType} />
                            <DetailItem label="Any Claim in Previous Policy" value={caseData.policyBreakInDetails.anyClaimInPreviousPolicy} span={2} />
                            <DetailItem label="Break In" value={caseData.policyBreakInDetails.breakIn} />
                            <DetailItem label="Break In Inspection Date" value={formatDate(caseData.policyBreakInDetails.breakInInspectionDate)} />
                            <DetailItem label="Odometer Reading at Break In" value={caseData.policyBreakInDetails.odometerReadingAtBreakIn} />
                            <DetailItem label="Break In Discrepancy" value={caseData.policyBreakInDetails.breakInDiscrepancy} span={2} />
                        </DetailGrid>
                    </Section>
                )}

                {/* Spot Visit */}
                {caseData.spotVisit && hasContent(caseData.spotVisit) && (
                    <Section title="Spot Visit" icon={MapPin}>
                        <DetailGrid>
                            <DetailItem label="Spot Visit Enquiry" value={caseData.spotVisit.spotVisitEnquiry} span={3} textarea />
                            <DetailItem label="Latitude" value={caseData.spotVisit.accidentSpotLatitude} />
                            <DetailItem label="Longitude" value={caseData.spotVisit.accidentSpotLongitude} />
                            <DetailItem label="CCTV Availability" value={caseData.spotVisit.cctvAvailability} />
                            <DetailItem label="Toll Tax Receipt" value={caseData.spotVisit.tollTaxReceiptConfirmation} />
                            <DetailItem label="Ambulance/Highway Patrol" value={caseData.spotVisit.ambulanceOrHighwayPatrollingCheck} />
                            <DetailItem label="Discreet Enquiry" value={caseData.spotVisit.discreetEnquiryAtLossLocation} span={2} />
                            <DetailItem label="Photos Exchanged" value={caseData.spotVisit.photosExchanged} />
                            <DetailItem label="Witness Records" value={caseData.spotVisit.witnessRecords} span={2} />
                            <DetailItem label="Narration/Observation" value={caseData.spotVisit.narrationOrObservation} span={3} textarea />
                        </DetailGrid>

                        {/* Spot Images */}
                        {caseData.spotVisit.spotImages && caseData.spotVisit.spotImages.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                    Spot Images ({caseData.spotVisit.spotImages.length})
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {caseData.spotVisit.spotImages.map((image, idx) => (
                                        <ImageCard key={idx} image={image} index={idx} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Section>
                )}

                {/* Police Record Details */}
                {/* Garage Visit */}
                {caseData.garageVisit && hasContent(caseData.garageVisit) && (
                    <Section title="Garage Visit" icon={MapPin}>
                        <DetailGrid>
                            <DetailItem label="Vehicle Inspected" value={caseData.garageVisit.vehicleInspected} />
                            <DetailItem label="Place of Inspection" value={caseData.garageVisit.placeOfInspection} />
                            <DetailItem label="Last Service Date" value={formatDate(caseData.garageVisit.lastServiceDate)} />
                            <DetailItem label="Blood/Body Trace Inspection" value={caseData.garageVisit.bloodOrBodyTraceInspection} span={2} />
                            <DetailItem label="Damage Correlation" value={caseData.garageVisit.damageCorrelationWithAccident} span={3} textarea />
                        </DetailGrid>

                        {/* Towing Vendor Details Table */}
                        {Array.isArray(caseData.garageVisit.towingVendorDetails) && caseData.garageVisit.towingVendorDetails.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Towing Vendor Details</h4>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From - To</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {caseData.garageVisit.towingVendorDetails.map((vendor, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{vendor.towingVendorName || "-"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{vendor.towingVendorContactNo || "-"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{vendor.towingVendorAddress || "-"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{vendor.whereToWhere || "-"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{vendor.towingAmount || "-"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{vendor.verifiedOrNot || "-"}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{vendor.invoiceOdTowing || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Job Card & Vehicle Status Tables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Job Card Details */}
                            {caseData.garageVisit.jobCardDetails?.availability === "Yes" && (
                                <div className="border rounded-lg overflow-hidden">
                                    <h4 className="text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 border-b">Job Card Details</h4>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500 text-sm">Job Card No:</span>
                                            <span className="font-medium text-gray-900 text-sm">{caseData.garageVisit.jobCardDetails.jobCardNo || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500 text-sm">Date:</span>
                                            <span className="font-medium text-gray-900 text-sm">{formatDate(caseData.garageVisit.jobCardDetails.dateOfJobCard)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-sm">Garage Name:</span>
                                            <span className="font-medium text-gray-900 text-sm">{caseData.garageVisit.jobCardDetails.nameOfGarage || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Status After 24 Hrs */}
                            {caseData.garageVisit.vehicleStatusAfter24Hrs?.availability === "Yes" && (
                                <div className="border rounded-lg overflow-hidden">
                                    <h4 className="text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-3 border-b">Vehicle Status (&gt;24 Hrs)</h4>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500 text-sm">Check-In Time:</span>
                                            <span className="font-medium text-gray-900 text-sm">{formatDateTime(caseData.garageVisit.vehicleStatusAfter24Hrs.checkInDateTime)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 text-sm">Check-Out Time:</span>
                                            <span className="font-medium text-gray-900 text-sm">{formatDateTime(caseData.garageVisit.vehicleStatusAfter24Hrs.checkOutDateTime)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Garage Images */}
                        {caseData.garageVisit.garageImages && caseData.garageVisit.garageImages.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                    Garage Images ({caseData.garageVisit.garageImages.length})
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {caseData.garageVisit.garageImages.map((image, idx) => (
                                        <ImageCard key={idx} image={image} index={idx} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Section>
                )}

                {caseData.policeRecordDetails && hasContent(caseData.policeRecordDetails) && (
                    <Section title="Police Record Details" icon={BadgeInfo}>
                        <DetailGrid>
                            <DetailItem label="FIR Status" value={caseData.policeRecordDetails.firStatus} />
                            <DetailItem label="FIR Date & Time" value={formatDateTime(caseData.policeRecordDetails.firDateAndTime)} />
                            <DetailItem label="FIR No" value={caseData.policeRecordDetails.firNo} />
                            <DetailItem label="Police Station Name" value={caseData.policeRecordDetails.policeStationName} />
                            <DetailItem label="PS District Name" value={caseData.policeRecordDetails.nameOfPoliceStationDistrict} />
                            <DetailItem label="District" value={caseData.policeRecordDetails.district} />
                            <DetailItem label="State" value={caseData.policeRecordDetails.state} />

                            {/* RTI Details */}
                            <DetailItem label="RTI Details Available?" value={caseData.policeRecordDetails.rtiDetailsAvailability} />
                            {caseData.policeRecordDetails.rtiDetailsAvailability === "Yes" && Array.isArray(caseData.policeRecordDetails.rtiDetails) && caseData.policeRecordDetails.rtiDetails.length > 0 && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        RTI Details
                                    </label>
                                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
                                        {caseData.policeRecordDetails.rtiDetails.map((detail, idx) => (
                                            <p key={idx} className="text-sm text-gray-900">• {detail}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </DetailGrid>
                    </Section>
                )}

                {/* Observation / Findings / Conclusion */}
                {caseData.observationFindingsConclusion && hasContent(caseData.observationFindingsConclusion) && (
                    <Section title="Observation / Findings / Conclusion" icon={ClipboardCheck}>
                        <DetailGrid>
                            <DetailItem label="Meeting Date Details" value={caseData.observationFindingsConclusion.meetingDateDetails} />
                            <DetailItem label="Accident Time Mismatch" value={caseData.observationFindingsConclusion.accidentTimeMismatchDetails} />
                            <DetailItem label="Accident Sequence" value={caseData.observationFindingsConclusion.accidentSequenceDescription} textarea span={3} />
                            <DetailItem label="Injury Status" value={caseData.observationFindingsConclusion.injuryStatus} />
                            <DetailItem label="Insured DL Availability" value={caseData.observationFindingsConclusion.insuredDrivingLicenseAvailability} />
                            <DetailItem label="Actual Driver DL Validity" value={caseData.observationFindingsConclusion.actualDriverDLValidity} />
                            <DetailItem label="Police Action Status" value={caseData.observationFindingsConclusion.policeActionStatus} />
                            <DetailItem label="Driver Profession & Vehicle Usage" value={caseData.observationFindingsConclusion.driverProfessionAndVehicleUsage} />
                            <DetailItem label="GPS Timeline Verification" value={caseData.observationFindingsConclusion.gpsTimelineVerification} />
                            <DetailItem label="Crane Bill Verification" value={caseData.observationFindingsConclusion.craneBillVerification} />
                            <DetailItem label="Ambiguity Status" value={caseData.observationFindingsConclusion.ambiguityStatus} />

                            {/* Conditional Conclusion/Finding */}
                            {(caseData.observationFindingsConclusion.findingType || caseData.observationFindingsConclusion.findingText) && (
                                <DetailItem
                                    label={caseData.observationFindingsConclusion.findingType || "Additional Findings"}
                                    value={caseData.observationFindingsConclusion.findingText}
                                    textarea
                                    span={3}
                                />
                            )}

                            {/* Discrepancy (Only for Option 2) */}
                            {caseData.observationFindingsConclusion.findingType === "Observation and Finding" && caseData.observationFindingsConclusion.discrepancy && (
                                <DetailItem
                                    label="Discrepancy"
                                    value={caseData.observationFindingsConclusion.discrepancy}
                                    textarea
                                    span={3}
                                />
                            )}
                        </DetailGrid>
                    </Section>
                )}

                {/* Opinion */}
                {caseData.opinion && hasContent(caseData.opinion) && (
                    <Section title="Opinion" icon={FileText}>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {caseData.opinion.claimAdmissibilityOpinion || "N/A"}
                            </p>
                        </div>
                    </Section>
                )}

                {/* Enclosures */}
                {caseData.enclosures && caseData.enclosures.documents && caseData.enclosures.documents.length > 0 && (
                    <Section title="Enclosures" icon={Paperclip}>
                        <DetailGrid>
                            {caseData.enclosures.documents.map((doc, idx) => (
                                <DetailItem
                                    key={idx}
                                    label={doc.field || `Enclosure ${idx + 1}`}
                                    value={doc.answer}
                                />
                            ))}
                        </DetailGrid>
                    </Section>
                )}

                {/* Name of DL Holders */}
                {caseData.dlParticulars && Array.isArray(caseData.dlParticulars) && caseData.dlParticulars.length > 0 && (
                    <Section title="Name of DL Holders" icon={CreditCard}>
                        {caseData.dlParticulars.map((holder, idx) => (
                            <div key={idx} className="mb-6 last:mb-0 border-b last:border-0 pb-6 last:pb-0">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 bg-gray-50 p-2 rounded">
                                    DL Holder #{idx + 1}
                                </h4>
                                <DetailGrid>
                                    <DetailItem label="Name of DL Holder" value={holder.nameOfDlHolder} />
                                    <DetailItem label="DL Number" value={holder.dlNumber} />
                                    <DetailItem label="Driver DOB" value={holder.driverDob} />
                                    <DetailItem label="RTO Name" value={holder.rtoName} />
                                    <DetailItem label="Validity (Non-Transport)" value={holder.validityNonTransport} />
                                    <DetailItem label="Validity (Transport)" value={holder.validityTransport} />
                                    <DetailItem label="Driver Address" value={holder.driverAddress} span={2} />
                                    <DetailItem label="DL Status" value={holder.dlStatus} />
                                </DetailGrid>
                            </div>
                        ))}
                    </Section>
                )}

                {/* Metadata */}
                <Section title="Case Metadata" icon={Calendar}>
                    <DetailGrid>
                        <DetailItem label="Case ID" value={caseData._id} span={2} />
                        <DetailItem label="Created At" value={formatDateTime(caseData.createdAt)} />
                        <DetailItem label="Last Updated" value={formatDateTime(caseData.updatedAt)} />
                    </DetailGrid>
                </Section>
            </div>
        </div>
    );
}

// Helper Components
function Section({ title, icon: Icon, children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5" />}
                    {title}
                </h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function DetailGrid({ children }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    );
}

function DetailItem({ label, value, span = 1, textarea = false }) {
    const displayValue = value || "N/A";
    const colSpan = span > 1 ? `md:col-span-${Math.min(span, 2)} lg:col-span-${Math.min(span, 3)}` : "";

    return (
        <div className={`${colSpan}`}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {label}
            </label>
            {textarea ? (
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-200 whitespace-pre-wrap leading-relaxed">
                    {displayValue}
                </p>
            ) : (
                <p className="text-sm text-gray-900 font-medium">{displayValue}</p>
            )}
        </div>
    );
}

function ImageCard({ image, index }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div
                className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all cursor-pointer bg-gray-100"
                onClick={() => setIsOpen(true)}
            >
                <img
                    src={image.imageUrl}
                    alt={image.alt || `Spot image ${index + 1} `}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs font-medium truncate">
                        {image.title || `Image ${index + 1}`}
                    </p>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="max-w-5xl max-h-[90vh] relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 text-sm font-medium"
                        >
                            Close ✕
                        </button>
                        <img
                            src={image.imageUrl}
                            alt={image.alt || `Spot image ${index + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <p className="text-white font-medium">{image.title || `Image ${index + 1}`}</p>
                            {image.alt && <p className="text-gray-300 text-sm mt-1">{image.alt}</p>}
                            <p className="text-gray-400 text-xs mt-2">
                                {image.width} × {image.height} • {image.format?.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Helper Functions
function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateString;
    }
}

function formatDateTime(dateString) {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateString;
    }
}

function hasContent(obj) {
    if (!obj) return false;
    return Object.values(obj).some((val) => {
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === "object" && val !== null) return hasContent(val);
        return val !== "" && val !== null && val !== undefined;
    });
}

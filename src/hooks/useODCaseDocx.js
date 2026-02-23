
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    HeadingLevel,
    Footer,
    PageNumber,
    PageBreak,
    BorderStyle,
} from "https://esm.sh/docx@8.5.0";
import saveAs from "https://esm.sh/file-saver@2.0.5";
import { useCallback, useState } from "react";
import { convertImageToBase64, getCurrentDate } from "../utils/helper";
import { toast } from "react-hot-toast";
import { AlignCenter } from "lucide-react";

// Helper for consistent table rows
const createStandardRow = (label, value, labelPercent = 40, align = AlignmentType.LEFT) => {
    const valuePercent = 100 - labelPercent;
    return new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 24, color: "000000" })] })],
                width: { size: labelPercent, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                },
            }),
            new TableCell({
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: String(value || "-"), size: 24, color: "000000" })],
                        alignment: align,
                    })
                ],
                width: { size: valuePercent, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                },
            }),
        ],
    });
};

export const useODCaseDocx = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateDocx = useCallback(async (data, sectionsConfig) => {
        if (!data) {
            toast.error("No data available to generate document");
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading("Generating DOCX...");

        try {
            const children = [];

            // Extract letter and reference data
            const letterData = data.letterDetails || {};
            const referenceData = data.reportReference || {};
            const odDetails = data.odDetails || {};
            const claimSummary = odDetails.claimSummary || {};
            const insuredDetails = odDetails.insuredDetails || {};

            // Date (Top Right)
            children.push(
                new Paragraph({
                    text: letterData.date ? new Date(letterData.date).toLocaleDateString('en-GB') : getCurrentDate(),
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 200 },
                })
            );

            // Reference Number
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Our Ref. No.: ${letterData.referenceNumber || 'JPR/NIA-Tie up Hub-OD/24-25/010'}`,
                            bold: true,
                        }),
                    ],
                    spacing: { after: 100 },
                })
            );

            // Recipient Details
            children.push(
                new Paragraph({
                    text: "To,",
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    text: letterData.recipientDesignation || "Manager,",
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    text: letterData.recipientDepartment || "Claim Tie-up Hub (NON-SUIT),",
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    text: letterData.recipientCompany || "The New India Assurance Co. Ltd,",
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    text: letterData.recipientAddress || "Address",
                    spacing: { after: 300 },
                })
            );

            // Subject Line
            const vehicleNo = claimSummary.vehicleNo || referenceData.vehicleNumber || "N/A";
            const insuredName = claimSummary.insuredName || referenceData.insuredName || insuredDetails.nameOfInsured || "N/A";

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Ref: OD Investigation Report for claim of - ${insuredName} (${vehicleNo})`,
                            bold: true,
                            underline: {},
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );

            // Opening Paragraph
            const claimNo = claimSummary.claimNo || "N/A";
            const appointmentDate = referenceData.investigatorAppointmentDate || claimSummary.dateOfClaimIntimated || getCurrentDate();

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `In reference to the subject Own damage claim of ${insuredName} vehicle number ${vehicleNo}, we have been appointed as an Investigator on ${appointmentDate} by you. Our investigation report as follows:`,
                        }),
                    ],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 400 },
                })
            );

            // Special Section: Claim Summary Table (if odDetails exists)
            if (odDetails && claimSummary && Object.keys(claimSummary).length > 0) {
                children.push(
                    new Paragraph({
                        text: "Claim Summary",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                // Create table rows for claim summary
                const claimSummaryRows = [];
                const claimFields = {
                    vehicleNo: "Vehicle No.",
                    claimNo: "Claim No.",
                    policyNo: "Policy No.",
                    policyDuration: "Policy Duration",
                    closeProximity: "Close Proximity",
                    insuredName: "Insured Name",
                    insuredContactNo: "Insured's Contact No.",
                    driverName: "Name of the said driver",
                    dateOfLossAndTime: "Date of loss & Time (As per claim Form)",
                    firDetailsDate: "Date of FIR Details",
                    generalDiaryDetails: "General Diary Details",
                    makeAndModel: "Make & Model",
                    chassisNo: "Chassis No.",
                    engineNo: "Engine No.",
                    dateOfClaimIntimated: "Date of claim Intimated to company",
                    delayIntimation: "Delay Intimation",
                    investigatorName: "Investigator Name",
                    vehicleDamages: "Vehicle Damages",
                    accidentSummary: "Summary of accident as per claim form:",
                };

                for (const [key, label] of Object.entries(claimFields)) {
                    claimSummaryRows.push(createStandardRow(label, claimSummary[key]));
                }

                children.push(
                    new Table({
                        rows: claimSummaryRows,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    })
                );

                // Add accident summary paragraph if exists
                if (claimSummary.accidentSummary) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Summary of accident as per claim form:",
                                    bold: true,
                                }),
                            ],
                            spacing: { before: 200, after: 100 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: claimSummary.accidentSummary,
                                }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                            spacing: { after: 300 },
                        })
                    );
                }
            }

            // Special Section: Insured Details Table
            if (odDetails && insuredDetails && Object.keys(insuredDetails).length > 0) {
                children.push(
                    new Paragraph({
                        text: "Insured cum driver Details",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                const insuredRows = [];
                const insuredFields = {
                    nameOfInsured: "Name of Insured",
                    panCard: "PAN Card",
                    aadharCardNo: "Aadhar Card No.",
                    addressAsPerRC: "Address of Insured as per RC",
                    addressAsPerAadharCard: "Address of Insured as per Aadhar Card",
                    insuredProfession: "Insured Profession",
                    driverInjured: "Driver injured or not",
                    driverRelationshipWithInsured: "Driver relationship",
                    nameOfDriver: "Name of Driver",
                    attestedLetterFromDriver: "Attested Letter Copy from the Driver with Sign Across his Photograph",
                    driverConfirmation: "Driver Confirmation",
                    employmentStability: "Emp. Stability",
                    dlDetails: "DL details/ Any Endorsements",
                    rtoName: "Name of RTO (Licencing Authority) from DL is issued",
                    eligibleToDrive: "Eligible to drive",
                    validityDetails: "validity details",
                };

                for (const [key, label] of Object.entries(insuredFields)) {
                    insuredRows.push(createStandardRow(label, insuredDetails[key]));
                }

                // Handle Details of Injured
                const detailsOfInjured = insuredDetails.detailsOfInjured;
                if (detailsOfInjured) {
                    insuredRows.push(createStandardRow("Injuries Details (Availability)", detailsOfInjured.availability));

                    if (detailsOfInjured.availability === 'Yes' && Array.isArray(detailsOfInjured.injuredPersons)) {
                        detailsOfInjured.injuredPersons.forEach((person, index) => {
                            const personInfo = `Name: ${person.name || '-'}, Age: ${person.age || '-'}, Type: ${person.injuryType || '-'}`;
                            insuredRows.push(createStandardRow(`Injured Person ${index + 1}`, personInfo));
                        });
                    }
                }

                // Handle Details of Deceased
                const detailsOfDeceased = insuredDetails.detailsOfDeceased;
                if (detailsOfDeceased) {
                    insuredRows.push(createStandardRow("Death Details (Availability)", detailsOfDeceased.availability));

                    if (detailsOfDeceased.availability === 'Yes' && Array.isArray(detailsOfDeceased.deceasedPersons)) {
                        detailsOfDeceased.deceasedPersons.forEach((person, index) => {
                            const personInfo = `Name: ${person.name || '-'}, Age: ${person.age || '-'}, Date of Death: ${person.dateOfDeath || '-'}`;
                            insuredRows.push(createStandardRow(`Deceased Person ${index + 1}`, personInfo));
                        });
                    }
                }

                children.push(new Table({ rows: insuredRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            // Special Section: Vehicle Details Table
            const vehicleDetails = odDetails?.vehicleDetails || {};
            if (vehicleDetails && Object.keys(vehicleDetails).length > 0) {
                children.push(
                    new Paragraph({
                        text: "Vehicle Details",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                const vehicleRows = [];
                const vehicleFields = {
                    vehicleRegistrationNo: "Vehicle Registration no.",
                    registeredOwnerName: "Name of Registered Owner",
                    newVehicleInvoiceDetails: "New Vehicle Invoice Details (Purchase)",
                    makeAndModel: "Make & Model",
                    registrationDate: "Registration Date",
                    yearOfManufacture: "Year of manufacture",
                    chassisNo: "Chassis No.",
                    engineNo: "Engine No.",
                    hypDetails: "HYP Details",
                    mvTaxDetails: "MV Tax details (Tax from)",
                    permittedDetail: "Permit",
                    permitType: "Permit Type",
                    permitLocationType: "Permit Location Type",
                    permitState: "Permit State",
                    permitCity: "Permit City",
                    fitnessDetail: "Fitness",
                    bodyType: "Body type",
                    seatingCapacity: "Seating Capacity",
                    ownerSerialNumber: "Owner Serial Number",
                    dateOfPurchaseAvailability: "Date of Purchase Availability",
                    dateOfPurchase: "Date of Purchase",
                    sellerAddress: "Seller Address",
                    sellerContactNumber: "Seller Contact Number",
                    purchaseAmount: "Purchase Amount",
                };

                for (const [key, label] of Object.entries(vehicleFields)) {
                    vehicleRows.push(createStandardRow(label, vehicleDetails[key]));
                }

                children.push(new Table({ rows: vehicleRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            // Special Section: DL Particulars Table
            const dlParticulars = data.dlParticulars || [];
            if (Array.isArray(dlParticulars) && dlParticulars.length > 0) {
                children.push(
                    new Paragraph({
                        text: "DL Particulars",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                dlParticulars.forEach((dl, index) => {
                    if (index > 0) {
                        children.push(
                            new Paragraph({
                                text: "",
                                spacing: { before: 200 },
                            })
                        );
                    }

                    const dlRows = [];
                    const dlFields = {
                        nameOfDlHolder: "Name of DL Holder",
                        dlNumber: "DL Number",
                        driverDob: "Date of Birth",
                        rtoName: "Issuing Authority (RTO)",
                        validityNonTransport: "Validity details MCWG & LMV (NT)",
                        validityTransport: "Validity details of Transport",
                        driverAddress: "Address",
                        dlStatus: "DL Status (Active/Expired)",
                    };

                    for (const [key, label] of Object.entries(dlFields)) {
                        dlRows.push(createStandardRow(label, dl[key]));
                    }

                    children.push(new Table({ rows: dlRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                });
            }

            // Special Section: Meeting Details Table
            const meetingData = data.meetingDetails || {};
            if (meetingData && Object.keys(meetingData).length > 0) {
                children.push(
                    new Paragraph({
                        text: "Details of meeting with Insured",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                const meetingRows = [];

                // Basic meeting details
                const basicMeetingFields = {
                    insuredIntroduction: "Insured introduction (name, address, profession, age)",
                    vehicleInformation: "Vehicle information (Reg. no./ make model)",
                    dateAndTimeOfLoss: "Date and time of loss",
                    travelingFromTo: "Travelling from where___ to where___",
                    purposeOfTravel: "Purpose of travel",
                    accidentVersionLocationDetails: "Accident version-- exact loss location details",
                };

                for (const [key, label] of Object.entries(basicMeetingFields)) {
                    const value = meetingData[key] || "";

                    meetingRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
                                    width: { size: 40, type: WidthType.PERCENTAGE },

                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: String(value || "-"), size: 20 })] })],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                            ],
                        })
                    );
                }

                // Statement of the Insured (Full width row)
                if (meetingData.accidentDetailsAsPerInsured) {
                    meetingRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: "Statement of the Insured / Representative:",
                                                    bold: true,

                                                    size: 20,
                                                }),
                                            ],
                                        }),
                                    ],
                                    columnSpan: 2,

                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: meetingData.accidentDetailsAsPerInsured,
                                                    size: 20,
                                                }),
                                            ],
                                            alignment: AlignmentType.JUSTIFIED,
                                        }),
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: "Statement enclosed.",
                                                    bold: true,
                                                    size: 20,
                                                }),
                                            ],
                                            spacing: { before: 100 },
                                        }),
                                    ],
                                    columnSpan: 2,
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                            ],
                        })
                    );
                }

                // Additional meeting fields
                const additionalFields = {
                    accidentDetailsAsPerOccupant: "Accident details as per Occupant- True version of statement submitted not brief",
                    rehabilitationDetails: "How Insured/driver rehabilitated from loss location to _______ by _______?",
                    firstContactAfterAccident: "After accident first contact details?",
                };

                for (const [key, label] of Object.entries(additionalFields)) {
                    const value = meetingData[key] || "";

                    meetingRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: String(value || "-"), size: 20 })],
                                        alignment: AlignmentType.JUSTIFIED,
                                    })],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                            ],
                        })
                    );
                }

                // Add Witness Statements
                const witnessDetails = data.witnessDetails || [];
                if (Array.isArray(witnessDetails) && witnessDetails.length > 0) {
                    witnessDetails.forEach((witness, index) => {
                        if (witness.witnessStatement) {
                            // Header Row
                            meetingRows.push(
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({
                                                            text: `Statement of the witness ${witness.witnessName || "Unknown"} ${witness.witnessFatherName ? `S/o ${witness.witnessFatherName}` : ""} - ${witness.witnessPhone || ""}, ${witness.witnessRelation || "Unknown"} R/o ${witness.witnessAddress || "Unknown"}`,
                                                            bold: true,
                                                            alignment: AlignmentType.CENTER,
                                                            size: 20,
                                                        }),
                                                    ],
                                                }),
                                            ],
                                            columnSpan: 2,
                                            borders: {
                                                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            },
                                        }),
                                    ],
                                })
                            );

                            // Content Row
                            meetingRows.push(
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({
                                                            text: witness.witnessStatement,
                                                            size: 20,
                                                        }),
                                                    ],
                                                    alignment: AlignmentType.JUSTIFIED,
                                                }),
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({
                                                            text: "Statement enclosed.",
                                                            bold: true,
                                                            size: 20,
                                                        }),
                                                    ],
                                                    spacing: { before: 100 },
                                                }),
                                            ],
                                            columnSpan: 2,
                                            borders: {
                                                top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                                bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            },
                                        }),
                                    ],
                                })
                            );
                        }
                    });
                }

                children.push(new Table({ rows: meetingRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            // Special Section: Policy & Break in Details Table
            const policyData = data.policyBreakInDetails || {};
            if (policyData && Object.keys(policyData).length > 0) {
                children.push(
                    new Paragraph({
                        text: "Policy & Break in Details",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                const policyRows = [];

                // Current Policy Details
                const currentPolicyFields = {
                    policyNo: "Policy No.",
                    policyPeriod: "Policy period",
                    policyType: "Policy type",
                    idv: "IDV",
                };

                for (const [key, label] of Object.entries(currentPolicyFields)) {
                    const value = policyData[key] || "";

                    policyRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: String(value || "-"), size: 20 })] })],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                            ],
                        })
                    );
                }

                // Previous Policy Details (with merged cell for "Not applicable, new vehicle")
                const previousPolicyFields = {
                    previousPolicyNo: "Previous Policy No.",
                    previousPolicyPeriod: "Previous Policy period",
                    previousInsurer: "Previous Insurer",
                    previousPolicyType: "Previous Policy Type",
                    anyClaimInPreviousPolicy: "Verified Policy in previous insurance co.",
                    previousClaimPhotosAvailable: "Any claim reported in previous policy",
                };

                // Check if it's a new vehicle
                const isNewVehicle = policyData.previousPolicyNo === "" ||
                    policyData.previousPolicyNo === "Not applicable" ||
                    policyData.previousPolicyNo === "N/A";

                if (isNewVehicle) {
                    // Add merged cell for new vehicle
                    const previousFieldLabels = Object.values(previousPolicyFields);
                    policyRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        ...previousFieldLabels.map(label =>
                                            new Paragraph({
                                                children: [new TextRun({ text: label, bold: true, size: 20 })],
                                                spacing: { after: 50 }
                                            })
                                        )
                                    ],
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: "Not applicable, new vehicle", bold: true, size: 20 })],
                                            alignment: AlignmentType.CENTER,
                                        })
                                    ],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                    verticalAlign: "center",
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                            ],
                        })
                    );
                } else {
                    // Add individual rows for previous policy
                    for (const [key, label] of Object.entries(previousPolicyFields)) {
                        const value = policyData[key] || "";

                        policyRows.push(
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
                                        width: { size: 40, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        },
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: String(value || "-"), size: 20 })] })],
                                        width: { size: 60, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        },
                                    }),
                                ],
                            })
                        );
                    }
                }

                // Add "Photographs available or previous claim" row
                policyRows.push(
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: "Photographs available or previous claim", bold: true, size: 20 })] })],
                                width: { size: 40, type: WidthType.PERCENTAGE },

                                borders: {
                                    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                },
                            }),
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: String(policyData.previousClaimPhotosAvailable || "-"), size: 20 })] })],
                                width: { size: 60, type: WidthType.PERCENTAGE },
                                borders: {
                                    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                },
                            }),
                        ],
                    })
                );

                // Break-in Details
                const breakInFields = {
                    breakIn: "Break in",
                    breakInInspectionDate: "Break In Inspection date (if yes)",
                    odometerReadingAtBreakIn: "Odometer reading at the time of break in",
                    breakInDiscrepancy: "Any discrepancy in break in and damaged photo",
                };

                for (const [key, label] of Object.entries(breakInFields)) {
                    const value = policyData[key] || "";

                    policyRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: String(value || "-"), size: 20 })] })],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                }),
                            ],
                        })
                    );
                }

                children.push(new Table({ rows: policyRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            // Special Section: Garage Visit Table
            const garageData = data.garageVisit || {};
            if (garageData && Object.keys(garageData).length > 0) {
                children.push(
                    new Paragraph({
                        text: "Garage Visit",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                const garageRows = [];

                // Garage Visit Fields
                // simple fields
                garageRows.push(createStandardRow("Vehicle Inspected", garageData.vehicleInspected, 50));
                garageRows.push(createStandardRow("Place of Inspection", garageData.placeOfInspection, 50));
                garageRows.push(createStandardRow("Insured vehicle last service date (Pvt Car and CV only)", garageData.lastServiceDate, 50));
                garageRows.push(createStandardRow("Co-relating the damages on vehicle with the description of accident provided by the insured / nominee of the driver claim form and the statement", garageData.damageCorrelationWithAccident, 50));
                garageRows.push(createStandardRow("Inspection of vehicle to find traces of blood/ hair/any other body parts", garageData.bloodOrBodyTraceInspection, 50));
                garageRows.push(createStandardRow("Vehicle status if the difference between garage entry and date of loss is more than 24 hrs.", String(garageData.vehicleStatusAfter24Hrs?.availability || "No"), 50));
                if (String(garageData.vehicleStatusAfter24Hrs?.availability).toLowerCase() === "yes") {
                    garageRows.push(createStandardRow("  - Check-in Date & Time", garageData.vehicleStatusAfter24Hrs.checkInDateTime, 50));
                    garageRows.push(createStandardRow("  - Check-out Date & Time", garageData.vehicleStatusAfter24Hrs.checkOutDateTime, 50));
                }

                children.push(new Table({ rows: garageRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

                // Towing Vendor Details Table
                if (Array.isArray(garageData.towingVendorDetails) && garageData.towingVendorDetails.length > 0) {
                    children.push(
                        new Paragraph({
                            text: "Towing Vendor Details",
                            heading: HeadingLevel.HEADING_4,
                            spacing: { before: 200, after: 100 },
                        })
                    );

                    const towingRows = [
                        new TableRow({
                            children: ["Vendor Name", "Contact", "Address", "From - To", "Amount"].map(header =>
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: header, bold: true, size: 18 })], alignment: AlignmentType.CENTER })],
                                    shading: { fill: "EEEEEE" },
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                    },
                                })
                            ),
                        })
                    ];

                    garageData.towingVendorDetails.forEach(t => {
                        towingRows.push(
                            new TableRow({
                                children: [
                                    t.towingVendorName || "-",
                                    t.towingVendorContactNo || "-",
                                    t.towingVendorAddress || "-",
                                    t.whereToWhere || "-",
                                    t.towingAmount || "-"
                                ].map(val =>
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: String(val), size: 18 })], alignment: AlignmentType.CENTER })],
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                                        },
                                    })
                                )
                            })
                        );
                    });

                    children.push(new Table({ rows: towingRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                }

                // Job Card Details Table
                if (String(garageData.jobCardDetails?.availability).toLowerCase() === "yes") {
                    children.push(
                        new Paragraph({
                            text: "Job Card Details",
                            heading: HeadingLevel.HEADING_4,
                            spacing: { before: 200, after: 100 },
                        })
                    );

                    const jobCardRows = [
                        createStandardRow("Job Card No", garageData.jobCardDetails.jobCardNo, 50),
                        createStandardRow("Date of Job Card", garageData.jobCardDetails.dateOfJobCard, 50),
                        createStandardRow("Name of Garage", garageData.jobCardDetails.nameOfGarage, 50),
                    ];
                    children.push(new Table({ rows: jobCardRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                } else {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Job Card Details: ", bold: true }),
                                new TextRun({ text: "Not Available" })
                            ],
                            spacing: { before: 200, after: 100 },
                        })
                    );
                }
            }

            // Special Section: Police record details Table
            const policeData = data.policeRecordDetails || {};
            if (policeData && Object.keys(policeData).length > 0) {
                children.push(
                    new Paragraph({
                        text: "Police record details",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                const policeRows = [];

                // Police Record Fields
                // Police Record Fields
                const policeFields = {
                    policeStationName: "Name of Police Station",
                    firNo: "FIR",
                    firDateAndTime: "FIR Date and Time",
                    nameOfPoliceStationDistrict: "Name of Police Station District",
                    state: "State",
                    district: "District",
                    rtiDetails: "Details of GD entry received from the police station (FIR/MLC/DD/Etc)",
                };

                for (const [key, label] of Object.entries(policeFields)) {
                    let value = policeData[key];

                    // Handle rtiDetails array
                    if (key === 'rtiDetails' && Array.isArray(value)) {
                        value = value.filter(v => v).join('\n');
                    }

                    value = value || "Detail not available";
                    policeRows.push(createStandardRow(label, value));
                }

                children.push(new Table({ rows: policeRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            // Special Section: Observation, Findings & Conclusion
            const observationData = data.observationFindingsConclusion || {};
            // check if section has data (headerType is default so check points or discrepancy)
            if (observationData && (observationData.points?.length > 0 || observationData.discrepancy)) {

                const headerTitle = observationData.headerType === "Observation and Finding Conclusion"
                    ? "Observation and Finding Conclusion"
                    : "Observation and Finding";

                children.push(
                    new PageBreak(), // Force new page
                    new Paragraph({
                        text: headerTitle,
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                // Create numbered list for observations from points array
                const points = Array.isArray(observationData.points) ? observationData.points : [];

                points.forEach((point, index) => {
                    if (point) {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${index + 1}. `,
                                        bold: true,
                                        size: 20,
                                    }),
                                    new TextRun({
                                        text: String(point),
                                        size: 20,
                                    }),
                                ],
                                alignment: AlignmentType.JUSTIFIED,
                                spacing: { after: 150 },
                                indent: { left: 360 },
                            })
                        );
                    }
                });

                // Discrepancy Field
                if (observationData.discrepancy) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Discrepancy: ",
                                    bold: true,
                                    size: 20,
                                    color: "FF0000" // Optional: make it stand out? Standard black is safer: "000000"
                                }),
                                new TextRun({
                                    text: observationData.discrepancy,
                                    size: 20,
                                }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                            spacing: { before: 200, after: 150 },
                        })
                    );
                }
            }

            // Special Section: Opinion
            const opinionData = data.opinion || {};
            const enclosuresList = Array.isArray(opinionData.enclosures) ? opinionData.enclosures : [];

            if (opinionData.claimAdmissibilityOpinion || enclosuresList.length > 0) {

                children.push(
                    new PageBreak(), // Force new page
                    new Paragraph({
                        text: "Opinion",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                // Opinion paragraph
                if (opinionData.claimAdmissibilityOpinion) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: opinionData.claimAdmissibilityOpinion,
                                    size: 20,
                                }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                            spacing: { after: 300 },
                        })
                    );
                }

                // Enclosures Table
                if (enclosuresList.length > 0) {
                    children.push(
                        new Paragraph({
                            text: "Enclosures",
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 200, after: 150 },
                        })
                    );

                    const enclosureRows = [];

                    enclosuresList.forEach(enc => {
                        if (enc.field || enc.answer) {
                            enclosureRows.push(createStandardRow(enc.field || "Document", enc.answer || "Enclosed", 60, AlignmentType.CENTER));
                        }
                    });

                    children.push(new Table({ rows: enclosureRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                }

                // Signature section
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `For ${claimSummary.investigatorName || "Satyendra Kumar Garg"}`,
                                bold: true,
                                size: 20,
                            }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 400 },
                    })
                );
            }

            // Special Section: Witness Documents & Photos
            const witnessDetails = data.witnessDetails || [];
            const hasWitnessDocs = witnessDetails.some(w => w.witnessDocument && w.witnessDocument.length > 0);
            const hasWitnessPhotos = witnessDetails.some(w => w.witnessPhoto && w.witnessPhoto.length > 0);

            if (hasWitnessDocs || hasWitnessPhotos) {
                children.push(
                    new PageBreak(), // Explicit page break before Witness section
                    new Paragraph({
                        text: "Witness Documents & Photos",
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                value: "single",
                                size: 6,
                            },
                        },
                    })
                );

                // 1. Process All Witness Documents First
                const witnessesWithDocs = witnessDetails.filter(w => w.witnessDocument && w.witnessDocument.length > 0);
                if (witnessesWithDocs.length > 0) {
                    children.push(
                        new Paragraph({
                            text: "Witness Documents",
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 200, after: 100 },
                        })
                    );

                    for (const witness of witnessesWithDocs) {
                        // Witness Name for Docs
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Witness: ${witness.witnessName || "Unknown"}`,
                                        bold: true,
                                        size: 22,
                                    }),
                                ],
                                spacing: { before: 100, after: 100 },
                            })
                        );

                        for (const doc of witness.witnessDocument) {
                            const title = doc.title || "Document";
                            const frontUrl = typeof doc.front === 'string' ? doc.front : doc.front?.imageUrl || doc.front?.url;
                            const backUrl = typeof doc.back === 'string' ? doc.back : doc.back?.imageUrl || doc.back?.url;

                            const docImages = [];

                            if (frontUrl) {
                                try {
                                    const base64 = await convertImageToBase64(frontUrl);
                                    if (base64) docImages.push({ base64, label: `${title} (Front)` });
                                } catch (e) {
                                    console.error("Error processing witness doc front image", e);
                                }
                            }
                            if (backUrl) {
                                try {
                                    const base64 = await convertImageToBase64(backUrl);
                                    if (base64) docImages.push({ base64, label: `${title} (Back)` });
                                } catch (e) {
                                    console.error("Error processing witness doc back image", e);
                                }
                            }

                            if (docImages.length > 0) {
                                const cells = [];

                                for (const img of docImages) {
                                    cells.push(new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new ImageRun({
                                                        data: Uint8Array.from(atob(img.base64), c => c.charCodeAt(0)),
                                                        transformation: { width: 240, height: 180 },
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                                spacing: { after: 100 },
                                            }),
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: img.label,
                                                        size: 18,
                                                        italics: true,
                                                        color: "000000",
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                                spacing: { after: 200 },
                                            })
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }));
                                }

                                // Fill remaining cells if less than 2
                                while (cells.length < 2) {
                                    cells.push(new TableCell({
                                        children: [],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }));
                                }

                                children.push(new Table({
                                    rows: [new TableRow({ children: cells })],
                                    width: { size: 100, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                }));
                            }
                        }
                    }
                }

                // 2. Process All Witness Photos Second
                const witnessesWithPhotos = witnessDetails.filter(w => w.witnessPhoto && w.witnessPhoto.length > 0);
                if (witnessesWithPhotos.length > 0) {
                    children.push(
                        new Paragraph({
                            text: "Witness Photos",
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 300, after: 100 },
                        })
                    );

                    for (const witness of witnessesWithPhotos) {
                        // Witness Name for Photos
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Witness: ${witness.witnessName || "Unknown"}`,
                                        bold: true,
                                        size: 22,
                                    }),
                                ],
                                spacing: { before: 100, after: 100 },
                            })
                        );

                        const witnessPhotos = [];

                        for (let idx = 0; idx < witness.witnessPhoto.length; idx++) {
                            const photo = witness.witnessPhoto[idx];
                            const photoUrl = typeof photo === 'string' ? photo : photo?.imageUrl || photo?.url;
                            const photoTitle = photo.title || `Witness Photo ${idx + 1}`;

                            if (photoUrl) {
                                try {
                                    const base64 = await convertImageToBase64(photoUrl);
                                    if (base64) witnessPhotos.push({ base64, label: photoTitle });
                                } catch (e) {
                                    console.error("Error processing witness photo", e);
                                }
                            }
                        }

                        // Add Witness Documents (ID Proofs etc)
                        if (Array.isArray(witness.witnessDocument)) {
                            // Use standard for loop for clarity and async compatibility
                            for (let idx = 0; idx < witness.witnessDocument.length; idx++) {
                                const doc = witness.witnessDocument[idx];
                                const docTitle = doc.title || "Document";

                                // Front Image
                                const frontImg = doc.front && (typeof doc.front === 'string' ? doc.front : (doc.front.imageUrl || doc.front.url));
                                if (frontImg) {
                                    try {
                                        const base64 = await convertImageToBase64(frontImg);
                                        if (base64) witnessPhotos.push({ base64, label: `${docTitle} (Front)` });
                                    } catch (e) {
                                        console.error("Error processing witness doc front", e);
                                    }
                                }

                                // Back Image
                                const backImg = doc.back && (typeof doc.back === 'string' ? doc.back : (doc.back.imageUrl || doc.back.url));
                                if (backImg) {
                                    try {
                                        const base64 = await convertImageToBase64(backImg);
                                        if (base64) witnessPhotos.push({ base64, label: `${docTitle} (Back)` });
                                    } catch (e) {
                                        console.error("Error processing witness doc back", e);
                                    }
                                }
                            }
                        }

                        if (witnessPhotos.length > 0) {
                            const tableRows = [];
                            for (let i = 0; i < witnessPhotos.length; i += 2) {
                                const img1 = witnessPhotos[i];
                                const img2 = witnessPhotos[i + 1];
                                const cells = [];

                                // Cell 1
                                cells.push(new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new ImageRun({
                                                    data: Uint8Array.from(atob(img1.base64), c => c.charCodeAt(0)),
                                                    transformation: { width: 240, height: 180 },
                                                }),
                                            ],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { after: 100 },
                                        }),
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: img1.label,
                                                    size: 18,
                                                    italics: true,
                                                    color: "000000",
                                                }),
                                            ],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { after: 200 },
                                        })
                                    ],
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                }));

                                // Cell 2
                                if (img2) {
                                    cells.push(new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new ImageRun({
                                                        data: Uint8Array.from(atob(img2.base64), c => c.charCodeAt(0)),
                                                        transformation: { width: 240, height: 180 },
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                                spacing: { after: 100 },
                                            }),
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: img2.label,
                                                        size: 18,
                                                        italics: true,
                                                        color: "000000",
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                                spacing: { after: 200 },
                                            })
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }));
                                } else {
                                    // Filler
                                    cells.push(new TableCell({
                                        children: [],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }));
                                }

                                tableRows.push(new TableRow({ children: cells }));
                            }

                            children.push(new Table({
                                rows: tableRows,
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                            }));
                        }
                    }
                }
            }

            // Photo sections configuration
            const photosDocsData = data.photosAndDocuments || {};
            const dlDocsData = data.dlDocuments || {};
            const evidenceData = data.photosAndEvidence || {};

            const allPhotoSections = [
                {
                    title: "RC & Identity Documents", data: photosDocsData, fields: {
                        rcPhoto: "RC Photo",
                        insuredPanCardPhoto: "Insured PAN Card Photo",
                        driverAadharCardPhoto: "Driver Aadhar Card Photo",
                        occupantAadharCardPhoto: "Occupant Aadhar Card Photo",
                    }
                },
                {
                    title: "Driving License Documents", data: dlDocsData, fields: {
                        driverDlPhoto: "Driver DL Photo",
                        driverDlOnlineVerificationReport: "Driver DL Online Verification Report",
                        occupantDlPhoto: "Occupant DL Photo",
                        occupantDlOnlineVerificationReport: "Occupant DL Online Verification Report",
                    }
                },
                {
                    title: "Statements & Evidence Photos", data: evidenceData, fields: {
                        insuredWithStatementPhoto: "Insured with Statement Photo",
                        insuredIdPhoto: "Insured ID Photo",
                        driverWithStatementPhoto: "Driver with Statement Photo",
                        occupantWithStatementPhoto: "Occupant with Statement Photo",
                        repairOrderHistory: "Repair Order History",
                        garageGateEntryRegisterPhoto: "Garage Gate Entry Register Photo",
                        ivPhotosAtGarage: "IV Photos at Garage",
                        spotPhotos: "Spot Photos",
                        gpsTimelineInsured: "GPS Timeline - Insured",
                        gpsTimelineDriver: "GPS Timeline - Driver",
                        gpsTimelineOccupant: "GPS Timeline - Occupant",
                        photosRetrievedFromDriverMobile: "Photos Retrieved from Driver Mobile",
                        craneBillVerification: "Crane Bill Verification",
                    }
                },
            ];

            for (const section of allPhotoSections) {
                const hasPhotos = section.data && Object.keys(section.fields).some(
                    key => section.data[key] && (
                        (Array.isArray(section.data[key]) && section.data[key].length > 0) ||
                        (!Array.isArray(section.data[key]) && section.data[key])
                    )
                );

                if (hasPhotos) {
                    children.push(
                        new PageBreak(), // Explicit page break before each Photo section
                        new Paragraph({
                            text: section.title,
                            heading: HeadingLevel.HEADING_2,
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 400, after: 200 },
                            border: {
                                bottom: {
                                    color: "000000",
                                    space: 1,
                                    value: "single",
                                    size: 6,
                                },
                            },
                        })
                    );

                    for (const [fieldKey, fieldLabel] of Object.entries(section.fields)) {
                        const fieldValue = section.data[fieldKey];
                        if (!fieldValue) continue;

                        // Add field label
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: fieldLabel,
                                        bold: true,
                                        size: 22,
                                    }),
                                ],
                                spacing: { before: 200, after: 100 },
                            })
                        );

                        // Normalize to array for uniform 2-column layout
                        const rawItems = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
                        const validImages = [];

                        for (let idx = 0; idx < rawItems.length; idx++) {
                            const imgItem = rawItems[idx];
                            const imgUrl = typeof imgItem === "string" ? imgItem : imgItem?.imageUrl;
                            if (!imgUrl) continue;

                            try {
                                const base64Data = await convertImageToBase64(imgUrl);
                                if (base64Data) {
                                    validImages.push({
                                        base64: base64Data,
                                        label: Array.isArray(fieldValue) ? `${fieldLabel} ${idx + 1}` : fieldLabel
                                    });
                                }
                            } catch (e) {
                                console.error(`Error processing image ${fieldKey}[${idx}]`, e);
                            }
                        }

                        if (validImages.length > 0) {
                            const tableRows = [];

                            for (let i = 0; i < validImages.length; i += 2) {
                                const img1 = validImages[i];
                                const img2 = validImages[i + 1]; // Can be undefined

                                const cells = [];

                                // Column 1
                                cells.push(new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new ImageRun({
                                                    data: Uint8Array.from(atob(img1.base64), c => c.charCodeAt(0)),
                                                    transformation: { width: 240, height: 180 },
                                                }),
                                            ],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { after: 100 },
                                        }),
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: img1.label,
                                                    size: 18,
                                                    italics: true,
                                                    color: "000000",
                                                }),
                                            ],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { after: 200 },
                                        })
                                    ],
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                }));

                                // Column 2
                                if (img2) {
                                    cells.push(new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new ImageRun({
                                                        data: Uint8Array.from(atob(img2.base64), c => c.charCodeAt(0)),
                                                        transformation: { width: 240, height: 180 },
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                                spacing: { after: 100 },
                                            }),
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: img2.label,
                                                        size: 18,
                                                        italics: true,
                                                        color: "000000",
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                                spacing: { after: 200 },
                                            })
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }));
                                } else {
                                    // Empty filler cell
                                    cells.push(new TableCell({
                                        children: [],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }));
                                }

                                tableRows.push(new TableRow({ children: cells }));
                            }

                            children.push(new Table({
                                rows: tableRows,
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                            }));
                        }
                    }
                }
            }

            // Sections details removed as per request (Statements & Evidence Photos is the last section)

            // Footer with page numbers
            const footer = new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun("Page "),
                            new TextRun({ children: [PageNumber.CURRENT] }),
                            new TextRun(" of "),
                            new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                        ],
                    }),
                ],
            });


            const doc = new Document({
                styles: {
                    default: {
                        document: {
                            run: {
                                size: 24, // 12pt
                            },
                        },
                    },
                },
                sections: [
                    {
                        properties: {
                            page: {
                                size: {
                                    width: 11906, // A4 Width in TWIPs
                                    height: 16838, // A4 Height in TWIPs
                                    orientation: "portrait",
                                },
                                watermark: {
                                    text: "invthirdeye@gmail.com",
                                    color: "000000",
                                    type: "diagonal",
                                    size: 540,
                                }
                            }
                        },
                        children: children,
                        footers: {
                            default: footer
                        }
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            return blob;

        } catch (err) {
            console.error(err);
            toast.error("Failed to generate DOCX", { id: toastId });
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return { generateDocx, isGenerating };
};

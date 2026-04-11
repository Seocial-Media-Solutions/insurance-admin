
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
    Header,
    PageNumber,
    PageBreak,
    BorderStyle,
    VerticalAlign,
} from "https://esm.sh/docx@8.5.0";
import { useCallback, useState } from "react";
import { convertImageToBase64, getCurrentDate, formatDate, formatDateTime } from "../utils/helper";
import { toast } from "react-hot-toast";
import { AlignCenter } from "lucide-react";

// Helper for consistent table rows
const createStandardRow = (label, value, labelPercent = 40, align = AlignmentType.LEFT) => {
    const valuePercent = 100 - labelPercent;

    // Safety check for objects
    let displayValue = value;
    if (typeof value === 'object' && value !== null) {
        if (value.$date) {
            displayValue = formatDate(value);
        } else if (Object.keys(value).every(k => !isNaN(k))) {
            // Case where a string was accidentally spread into an object
            displayValue = Object.values(value).join('');
        } else {
            // Check for potential nested values or arrays
            displayValue = String(value);
        }
    } else if (value === undefined || value === null) {
        displayValue = "-";
    }

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
                        children: [new TextRun({ text: String(displayValue || "-"), size: 24, color: "000000" })],
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

    const generateDocx = useCallback(async (data) => {
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

            // --- NEW HEADER SECTION (Matching design) ---
            const headerTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 15, color: "888888" },
                    bottom: { style: BorderStyle.NIL },
                    left: { style: BorderStyle.NIL },
                    right: { style: BorderStyle.NIL },
                    insideHorizontal: { style: BorderStyle.NIL },
                    insideVertical: { style: BorderStyle.NIL },
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 55, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Satyendra Kumar Garg",
                                                size: 32,
                                                bold: true,
                                                font: "Times New Roman",
                                                color: "333333",
                                            }),
                                        ],
                                        spacing: { before: 200 },
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "(Insurance Claim Investigation Service)",
                                                size: 20,
                                                font: "Times New Roman",
                                                color: "555555",
                                            }),
                                        ],
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `Contact: +91 9610339955`,
                                                size: 20,
                                                font: "Times New Roman",
                                                color: "555555",
                                            }),
                                        ],
                                    }),
                                ],
                                borders: {
                                    top: { style: BorderStyle.NIL },
                                    bottom: { style: BorderStyle.NIL },
                                    left: { style: BorderStyle.NIL },
                                    right: { style: BorderStyle.NIL },
                                },
                            }),
                            new TableCell({
                                width: { size: 45, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Flat No. H-207, Hanging Gardens,",
                                                size: 19,
                                                font: "Times New Roman",
                                                color: "333333",
                                            }),
                                        ],
                                        spacing: { before: 200 },
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Jaisinghpura Road, Bhankrota,",
                                                size: 19,
                                                font: "Times New Roman",
                                                color: "333333",
                                            }),
                                        ],
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Jaipur – 302026. (Raj)",
                                                size: 19,
                                                font: "Times New Roman",
                                                color: "333333",
                                            }),
                                        ],
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Email: ",
                                                size: 19,
                                                font: "Times New Roman",
                                                color: "333333",
                                            }),
                                            new TextRun({
                                                text: "invthirdeye@gmail.com",
                                                size: 19,
                                                font: "Times New Roman",
                                                color: "0000FF",
                                                underline: { type: "single", color: "0000FF" },
                                            }),
                                        ],
                                    }),
                                ],
                                borders: {
                                    top: { style: BorderStyle.NIL },
                                    bottom: { style: BorderStyle.NIL },
                                    left: { style: BorderStyle.NIL },
                                    right: { style: BorderStyle.NIL },
                                },
                            }),
                        ],
                    }),
                ],
            });

            children.push(new Paragraph({})); // Spacer

            // Date (Top Right)
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: letterData.date ? formatDate(letterData.date) : getCurrentDate() })],
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
                    children: [new TextRun({ text: "To," })],
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: String(letterData.recipientDesignation || "Manager,") })],
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: String(letterData.recipientDepartment || "Claim Tie-up Hub (NON-SUIT),") })],
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: String(letterData.recipientCompany || "The New India Assurance Co. Ltd,") })],
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: String(letterData.recipientAddress || "Address") })],
                    spacing: { after: 300 },
                })
            );

            children.push(new Paragraph({ spacing: { after: 200 } })); // Spacer instead of PageBreak

            // Subject Line
            const vehicleNo = claimSummary.vehicleNo || referenceData.vehicleNumber || "N/A";
            const insuredName = claimSummary.insuredName || referenceData.insuredName || insuredDetails.nameOfInsured || "N/A";

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Ref: OD Investigation Report for claim of - ${insuredName} (${vehicleNo})`,
                            bold: true,
                            underline: { type: "single" },
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );

            // Opening Paragraph
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
                        children: [new TextRun({ text: "Claim Summary" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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

                const policyData = data.policyBreakInDetails || {};
                const meetingData = data.meetingDetails || {};
                const policeData = data.policeRecordDetails || {};

                for (const [key, label] of Object.entries(claimFields)) {
                    let value = claimSummary[key];

                    // Policy details now pulled from special section
                    if (key === 'policyNo') {
                        value = policyData.policyNo || "-";
                    } else if (key === 'policyDuration') {
                        value = policyData.policyPeriod || "-";
                    } else if (key === 'dateOfLossAndTime') {
                        value = formatDateTime(meetingData.dateAndTimeOfLoss || claimSummary.dateOfLossAndTime);
                    } else if (key === 'firDetailsDate') {
                        value = formatDate(policeData.firDateAndTime);
                    }

                    claimSummaryRows.push(createStandardRow(label, value));
                }

                if (claimSummaryRows.length > 0) {
                    children.push(
                        new Table({
                            rows: claimSummaryRows,
                            width: { size: 100, type: WidthType.PERCENTAGE },
                        })
                    );
                }

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

            if (odDetails && insuredDetails && Object.keys(insuredDetails).length > 0) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: "Insured cum driver Details" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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
                    // addressAsPerAadharCard: "Address of Insured as per Aadhar Card",
                    insuredProfession: "Insured Profession",
                    driverInjured: "Driver injured or not",
                    driverRelationshipWithInsured: "Driver relationship",
                    nameOfDriver: "Name of Driver",
                    attestedLetterFromDriver: "Attested Letter Copy from the Driver with Sign Across his Photograph",
                    driverConfirmation: "Driver Confirmation",
                    // employmentStability: "Emp. Stability",
                    // dlDetails: "DL details/ Any Endorsements",
                    // rtoName: "Name of RTO (Licencing Authority) from DL is issued",
                    // eligibleToDrive: "Eligible to drive",
                    // validityDetails: "validity details",
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
                        children: [new TextRun({ text: "Vehicle Details" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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
                        children: [new TextRun({ text: "DL Particulars" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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
                        children: [new TextRun({ text: "Details of meeting with Insured" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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
                    let value = meetingData[key] || "";
                    if (key === 'dateAndTimeOfLoss') {
                        value = formatDateTime(value);
                    }

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
                    witnessDetails.forEach((witness) => {
                        if (witness && witness.witnessStatement) {
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
                        children: [new TextRun({ text: "Policy & Break in Details" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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
                                    verticalAlign: VerticalAlign.CENTER,
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
                        children: [new TextRun({ text: "Garage Visit" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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
                    garageRows.push(createStandardRow("  - Check-in Date & Time", formatDateTime(garageData.vehicleStatusAfter24Hrs.checkInDateTime), 50));
                    garageRows.push(createStandardRow("  - Check-out Date & Time", formatDateTime(garageData.vehicleStatusAfter24Hrs.checkOutDateTime), 50));
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
                        if (!t) return; // Skip null/undefined elements
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
                        children: [new TextRun({ text: "Police record details" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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

                    // Handle dates specifically
                    if (key === 'firDateAndTime') {
                        value = formatDate(value);
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
                    new Paragraph({ children: [new PageBreak()] }), // PageBreak must be inside a Paragraph
                    new Paragraph({
                        children: [new TextRun({ text: headerTitle })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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
                    new Paragraph({ children: [new PageBreak()] }), // PageBreak must be inside a Paragraph
                    new Paragraph({
                        children: [new TextRun({ text: "Opinion" })],
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
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
                            children: [new TextRun({ text: "Enclosures" })],
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

                    if (enclosureRows.length > 0) {
                        children.push(new Table({ rows: enclosureRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                    }
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

            // Photo Sections Consolidated into allPhotoSections loop for better memory management and structure

            // Photo sections configuration updated to match current data structure
            const allPhotoSections = [
                {
                    title: "Insured Documents",
                    data: data.insuredDocuments || {},
                    fields: {
                        rcPhoto: "RC Photo",
                        rcverification: "RC Verification",
                        dlPhoto: "DL Photo",
                        dlverification: "DL Verification",
                        insuredPanCardPhoto: "Insured PAN Card Photo",
                        insuredAadharCardPhoto: "Insured Aadhar Card Photo",
                    }
                },
                {
                    title: "Spot Visit Photos",
                    data: data.spotVisit || {},
                    fields: {
                        spotImages: "Spot Photos",
                    }
                },
                {
                    title: "GPS Timeline",
                    data: data.gpsTimelineDriver || {},
                    fields: {
                        type: "GPS Timeline Images",
                    }
                },
                {
                    title: "Garage Visit Photos",
                    data: data.garageVisit || {},
                    fields: {
                        garageImages: "Garage Photos",
                    }
                },
                {
                    title: "Police Records (RTI)",
                    data: data.policeRecordDetails || {},
                    fields: {
                        rtiDetails: "RTI Documents",
                    }
                },
                {
                    title: "Witness Photos & Documents",
                    data: data.witnessDetails ? {
                        allWitnessItems: (data.witnessDetails || []).flatMap(w => [
                            ...(Array.isArray(w.witnessPhoto) ? w.witnessPhoto : (w.witnessPhoto ? [w.witnessPhoto] : [])),
                            ...(Array.isArray(w.witnessDocument) ? w.witnessDocument : []).flatMap(doc => [
                                { 
                                    imageUrl: typeof doc.front === 'string' ? doc.front : doc.front?.imageUrl, 
                                    title: `${doc.title || 'Document'} (Front)` 
                                },
                                { 
                                    imageUrl: typeof doc.back === 'string' ? doc.back : doc.back?.imageUrl, 
                                    title: `${doc.title || 'Document'} (Back)` 
                                }
                            ])
                        ])
                    } : {},
                    fields: {
                        allWitnessItems: "Witness Evidence",
                    }
                }
            ];

            for (const section of allPhotoSections) {
                const hasPhotos = section.data && Object.keys(section.fields).some(
                    key => section.data[key] && (
                        (Array.isArray(section.data[key]) && section.data[key].length > 0) ||
                        (!Array.isArray(section.data[key]) && section.data[key])
                    )
                );

                if (hasPhotos) {
                    // Page Break
                    children.push(new Paragraph({ children: [new PageBreak()] }));

                    // Section Title
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: section.title.toUpperCase(),
                                    bold: true,
                                    size: 28,
                                    underline: { type: "single" },
                                    color: "CC0000",
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 400, after: 400 },
                        })
                    );

                    for (const [fieldKey, fieldLabel] of Object.entries(section.fields)) {
                        const fieldValue = section.data[fieldKey];
                        if (!fieldValue) continue;

                        const rawItems = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
                        
                        // Process images in parallel for this field
                        const processedResults = await Promise.all(
                            rawItems.map(async (imgItem, idx) => {
                                const imgUrl = typeof imgItem === "string" ? imgItem : imgItem?.imageUrl;
                                if (!imgUrl) return null;

                                try {
                                    const base64 = await convertImageToBase64(imgUrl);
                                    if (base64) {
                                        return {
                                            base64,
                                            label: Array.isArray(fieldValue) ? (imgItem.title || `${fieldLabel} ${idx + 1}`) : (imgItem.title || fieldLabel)
                                        };
                                    }
                                } catch (e) {
                                    console.error(`Error processing image ${fieldKey}[${idx}]`, e);
                                }
                                return null;
                            })
                        );

                        const validImages = processedResults.filter(img => img !== null);

                        if (validImages.length > 0) {
                            // Add sub-label for the field
                            children.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: fieldLabel,
                                            bold: true,
                                            size: 24,
                                            color: "333333",
                                        }),
                                    ],
                                    spacing: { before: 200, after: 100 },
                                })
                            );

                            const tableRows = [];

                            for (let i = 0; i < validImages.length; i += 2) {
                                const imagesInRow = validImages.slice(i, i + 2);
                                const cells = imagesInRow.map((img) => {
                                    // Robust base64 to Uint8Array conversion
                                    let binaryData;
                                    try {
                                        const binaryString = atob(img.base64);
                                        binaryData = new Uint8Array(binaryString.length);
                                        for (let j = 0; j < binaryString.length; j++) {
                                            binaryData[j] = binaryString.charCodeAt(j);
                                        }
                                    } catch (err) {
                                        console.error("Binary conversion failed", err);
                                        return new TableCell({ children: [] });
                                    }

                                    return new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new ImageRun({
                                                        data: binaryData,
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
                                                        italic: true,
                                                        color: "000000",
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                                spacing: { after: 200 },
                                            })
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.NIL },
                                            bottom: { style: BorderStyle.NIL },
                                            left: { style: BorderStyle.NIL },
                                            right: { style: BorderStyle.NIL }
                                        }
                                    });
                                });

                                // Fill remaining cell if odd number of images
                                if (cells.length === 1) {
                                    cells.push(new TableCell({
                                        children: [],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.NIL },
                                            bottom: { style: BorderStyle.NIL },
                                            left: { style: BorderStyle.NIL },
                                            right: { style: BorderStyle.NIL }
                                        }
                                    }));
                                }

                                tableRows.push(new TableRow({ children: cells }));
                            }

                            children.push(new Table({
                                rows: tableRows,
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                borders: {
                                    top: { style: BorderStyle.NIL },
                                    bottom: { style: BorderStyle.NIL },
                                    left: { style: BorderStyle.NIL },
                                    right: { style: BorderStyle.NIL },
                                    insideHorizontal: { style: BorderStyle.NIL },
                                    insideVertical: { style: BorderStyle.NIL }
                                }
                            }));
                        }
                    }
                }
            }

            // Sections details removed as per request (Statements & Evidence Photos is the last section)

            // New Footer Design
            const footerTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                    bottom: { style: BorderStyle.NIL },
                    left: { style: BorderStyle.NIL },
                    right: { style: BorderStyle.NIL },
                    insideHorizontal: { style: BorderStyle.NIL },
                    insideVertical: { style: BorderStyle.NIL },
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                children: ["Page ", PageNumber.CURRENT],
                                                color: "70a1d7",
                                                size: 24,
                                                bold: true,
                                            }),
                                            new TextRun({
                                                text: " |",
                                                color: "AAAAAA",
                                                size: 24,
                                            }),
                                        ],
                                        spacing: { before: 100, after: 100 },
                                    }),
                                ],
                                borders: {
                                    top: { style: BorderStyle.NIL },
                                    bottom: { style: BorderStyle.NIL },
                                    left: { style: BorderStyle.NIL },
                                    right: { style: BorderStyle.NIL },
                                },
                            }),
                        ],
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                shading: { fill: "e3f2f1" },
                                children: [new Paragraph({})],
                                borders: {
                                    top: { style: BorderStyle.NIL },
                                    bottom: { style: BorderStyle.NIL },
                                    left: { style: BorderStyle.NIL },
                                    right: { style: BorderStyle.NIL },
                                },
                            }),
                        ],
                    }),
                ],
            });

            const footer = new Footer({
                children: [footerTable],
            });

            const header = new Header({
                children: [headerTable],
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
                                margin: {
                                    top: 1000,
                                    bottom: 1000,
                                    left: 1000,
                                    right: 1000,
                                    header: 500,
                                    footer: 500,
                                },
                                size: {
                                    orientation: "portrait",
                                },
                            }
                        },
                        children: children,
                        headers: {
                            default: header
                        },
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

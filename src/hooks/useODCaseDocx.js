
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
    TableLayoutType,
} from "docx";
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
        displayValue = "";
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
                        children: [new TextRun({ text: String(displayValue || ""), size: 24, color: "000000" })],
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
                    top: { style: BorderStyle.NIL },
                    bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                    left: { style: BorderStyle.NIL },
                    right: { style: BorderStyle.NIL },
                    insideHorizontal: { style: BorderStyle.NIL },
                    insideVertical: { style: BorderStyle.NIL },
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Satyendra Kumar Garg",
                                                size: 44,
                                                font: "Times New Roman",
                                                color: "767676",
                                            }),
                                        ],
                                        spacing: { before: 50, after: 10 },
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "(Insurance Claim Investigation Service)",
                                                size: 30,
                                                font: "Times New Roman",
                                                color: "767676",
                                            }),
                                        ],
                                        spacing: { after: 10 },
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `Contact: +91 9610339955`,
                                                size: 30,
                                                font: "Times New Roman",
                                                color: "767676",
                                            }),
                                        ],
                                    }),
                                ],
                                borders: {
                                    top: { style: BorderStyle.NIL },
                                    bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                                    left: { style: BorderStyle.NIL },
                                    right: { style: BorderStyle.NIL },
                                },
                            }),
                            new TableCell({
                                width: { size: 60, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Flat No. H-207, Hanging Gardens,",
                                                size: 30,
                                                font: "Times New Roman",
                                                color: "767676",
                                            }),
                                        ],
                                        spacing: { before: 50 },
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Jaisinghpura Road, Bhankrota,",
                                                size: 30,
                                                font: "Times New Roman",
                                                color: "767676",
                                            }),
                                        ],
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Jaipur – 302026. (Raj)",
                                                size: 30,
                                                font: "Times New Roman",
                                                color: "767676",
                                            }),
                                        ],
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Email: ",
                                                size: 30,
                                                font: "Times New Roman",
                                                color: "767676",
                                            }),
                                            new TextRun({
                                                text: "invthirdeye@gmail.com",
                                                size: 30,
                                                font: "Times New Roman",
                                                color: "0000FF",
                                                underline: { type: "single", color: "0000FF" },
                                            }),
                                        ],
                                    }),
                                ],
                                borders: {
                                    top: { style: BorderStyle.NIL },
                                    bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
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
                            text: `Our Ref. No.: ${letterData.referenceNumber || "N/A"}`,
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
                    children: [new TextRun({ text: String(letterData.recipientDesignation || "N/A,") })],
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: String(letterData.recipientDepartment || "N/A,") })],
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: String(letterData.recipientCompany || "N/A,") })],
                    spacing: { after: 50 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: String(letterData.recipientAddress || "N/A") })],
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
                        children: [
                            new TextRun({
                                text: "  Claim Summary  ",
                                bold: true,
                                size: 32, // 16pt
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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
                };

                const policyData = data.policyBreakInDetails || {};
                const meetingData = data.meetingDetails || {};
                const policeData = data.policeRecordDetails || {};

                for (const [key, label] of Object.entries(claimFields)) {
                    let value = claimSummary[key];

                    // Policy details now pulled from special section
                    if (key === 'policyNo') {
                        value = policyData.policyNo || data.policyNo || "";
                    } else if (key === 'policyDuration') {
                        value = policyData.policyPeriod || data.policyPeriod || "";
                    } else if (key === 'dateOfLossAndTime') {
                        value = formatDateTime(meetingData.dateAndTimeOfLoss || claimSummary.dateOfLossAndTime);
                    } else if (key === 'firDetailsDate') {
                        value = formatDate(policeData.firDateAndTime);
                    }

                    claimSummaryRows.push(createStandardRow(label, value));
                }

                // Add accident summary inside a merged table row
                if (claimSummary.accidentSummary) {
                    claimSummaryRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    columnSpan: 2,
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: "Summary of accident as per claim form:",
                                                    bold: true,
                                                    size: 24, // 12pt
                                                }),
                                            ],
                                        }),
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: claimSummary.accidentSummary,
                                                    size: 24,
                                                }),
                                            ],
                                            alignment: AlignmentType.JUSTIFIED,
                                            spacing: { before: 100 },
                                        }),
                                    ],
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

                if (claimSummaryRows.length > 0) {
                    children.push(
                        new Table({
                            rows: claimSummaryRows,
                            width: { size: 100, type: WidthType.PERCENTAGE },
                        })
                    );
                }
            }

            if (odDetails && insuredDetails && Object.keys(insuredDetails).length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "  Insured cum driver Details  ",
                                bold: true,
                                size: 32, // 16pt
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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

                // Render main basic info table
                children.push(new Table({ rows: insuredRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

                // --- Handle Details of Injured (Separate Section Style) ---
                const detailsOfInjured = insuredDetails.detailsOfInjured || {};
                if (detailsOfInjured.availability === "Yes" && Array.isArray(detailsOfInjured.injuredPersons) && detailsOfInjured.injuredPersons.length > 0) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "  Details of Injured Persons  ",
                                    bold: true,
                                    size: 32,
                                    shading: {
                                        type: "clear",
                                        fill: "D9D9D9",
                                    }
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 400, after: 200 },
                        })
                    );

                    detailsOfInjured.injuredPersons.forEach((person, idx) => {
                        if (idx > 0) children.push(new Paragraph({ spacing: { before: 200 } }));

                        children.push(new Paragraph({
                            children: [new TextRun({ text: `Injured Person ${idx + 1}`, bold: true, size: 24, underline: {} })],
                            spacing: { after: 100 }
                        }));

                        const pRows = [
                            createStandardRow("Name", person.name),
                            createStandardRow("Age", person.age),
                            createStandardRow("Address", person.address),
                            createStandardRow("Injury Type", person.injuryType),
                            createStandardRow("Injury Description", person.injuryDescription),
                        ];
                        children.push(new Table({ rows: pRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                    });
                } else if (detailsOfInjured.availability) {
                    // Just show a row if NO is selected
                    children.push(
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [createStandardRow("Details of Injured Available?", detailsOfInjured.availability)]
                        })
                    );
                }

                // --- Handle Details of Deceased (Separate Section Style) ---
                const detailsOfDeceased = insuredDetails.detailsOfDeceased || {};
                if (detailsOfDeceased.availability === "Yes" && Array.isArray(detailsOfDeceased.deceasedPersons) && detailsOfDeceased.deceasedPersons.length > 0) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "  Details of Deceased Persons  ",
                                    bold: true,
                                    size: 32,
                                    shading: {
                                        type: "clear",
                                        fill: "D9D9D9",
                                    }
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 800, after: 200 },
                        })
                    );

                    detailsOfDeceased.deceasedPersons.forEach((person, idx) => {
                        if (idx > 0) children.push(new Paragraph({ spacing: { before: 200 } }));

                        children.push(new Paragraph({
                            children: [new TextRun({ text: `Deceased Person ${idx + 1}`, bold: true, size: 24, underline: {} })],
                            spacing: { after: 100 }
                        }));

                        const pmr = person.pmrDetails || {};
                        const pRows = [
                            createStandardRow("Name", person.name),
                            createStandardRow("Age", person.age),
                            createStandardRow("Address", person.address),
                            createStandardRow("Date of death", person.dateOfDeath),
                            createStandardRow("PMR Available", person.pmrAvailable),
                        ];

                        if (person.pmrAvailable === "Yes") {
                            pRows.push(createStandardRow("PMR No", pmr.pmrNo));
                            pRows.push(createStandardRow("PMR Time", pmr.pmrTime));
                            pRows.push(createStandardRow("PMR Place", pmr.pmrPlace));
                            pRows.push(createStandardRow("Doctor Opinion", pmr.doctorOpinion));
                        } else if (person.pmrAvailable === "No") {
                            pRows.push(createStandardRow("Reason for no PMR", pmr.noPmrReason));
                        }

                        children.push(new Table({ rows: pRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                    });
                } else if (detailsOfDeceased.availability) {
                    children.push(new Paragraph({ spacing: { before: 800 } })); // Spacer for margin
                    children.push(
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [createStandardRow("Details of Deceased Available?", detailsOfDeceased.availability)]
                        })
                    );
                }
            }

            // Special Section: Vehicle Details Table
            const vehicleDetails = odDetails?.vehicleDetails || {};
            if (vehicleDetails && Object.keys(vehicleDetails).length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "  Vehicle Details  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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

            // Special Section: Policy Details Table
            const policyDetailsData = data.policyBreakInDetails || {};
            if (policyDetailsData && Object.keys(policyDetailsData).length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "  Policy Details  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                    })
                );

                const policyRows = [];
                const policyFields = {
                    policyNo: "Policy No",
                    policyPeriod: "Policy Period",
                    policyType: "Policy Type",
                    idv: "IDV",
                    previousPolicyNo: "Previous Policy No",
                    previousPolicyPeriod: "Previous Policy Period",
                    previousInsurer: "Previous Insurer Name",
                    previousPolicyType: "Previous Policy Type",
                    anyClaimInPreviousPolicy: "Any Claim In Previous Policy",
                    previousClaimPhotosAvailable: "Previous Claim Photos Available",
                    breakIn: "Break In",
                    breakInInspectionDate: "Break In Inspection Date",
                    odometerReadingAtBreakIn: "Odometer Reading at Break In",
                    breakInDiscrepancy: "Break In Discrepancy",
                };

                for (const [key, label] of Object.entries(policyFields)) {
                    const value = policyDetailsData[key] || data[key] || "";
                    if (value !== undefined && value !== null && value !== "") {
                        policyRows.push(createStandardRow(label, value));
                    }
                }

                if (policyRows.length > 0) {
                    children.push(new Table({ rows: policyRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                } else {
                    children.push(new Paragraph({ text: "No details provided.", spacing: { before: 100 } }));
                }
            }

            // Special Section: DL Particulars Table
            const dlParticulars = data.dlParticulars || [];
            if (Array.isArray(dlParticulars) && dlParticulars.length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "  DL Particulars  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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
                        children: [
                            new TextRun({
                                text: "  Details of meeting with Insured  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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
                    accidentVersionLocationDetails: "Exact location ",
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
                                    children: [new Paragraph({ children: [new TextRun({ text: String(value || ""), size: 20 })] })],
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
                                        children: [new TextRun({ text: String(value || ""), size: 20 })],
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
                        children: [
                            new TextRun({
                                text: "  Policy & Break in Details  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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
                    const value = policyData[key] || data[key] || "";

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
                                    children: [new Paragraph({ children: [new TextRun({ text: String(value || ""), size: 20 })] })],
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

                // Check if it's a new vehicle or no previous policy
                const isNewVehicle = !policyData.previousPolicyNo ||
                    ["new vehicle", "no", "not applicable", "n/a"].includes(policyData.previousPolicyNo.toLowerCase());

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
                                        children: [new Paragraph({ children: [new TextRun({ text: String(value || ""), size: 20 })] })],
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
                                children: [new Paragraph({ children: [new TextRun({ text: String(policyData.previousClaimPhotosAvailable || ""), size: 20 })] })],
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
                if (!isNewVehicle) {
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
                                        children: [new Paragraph({ children: [new TextRun({ text: String(value || ""), size: 20 })] })],
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

                children.push(new Table({ rows: policyRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }

            // Special Section: Spot Visit Table
            const spotData = data.spotVisit || {};
            if (spotData && Object.keys(spotData).length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "  Spot Visit Details  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                    })
                );

                const spotRows = [];
                const spotFields = {
                    spotVisitEnquiry: "Accident Spot Enquiry",
                    accidentSpotLatitude: "Accident Spot Latitude",
                    accidentSpotLongitude: "Accident Spot Longitude",
                    cctvAvailability: "CCTV Availability",
                    tollTaxReceiptConfirmation: "Toll Tax Receipt Confirmation",
                    ambulanceOrHighwayPatrollingCheck: "Ambulance/Highway Patrolling Check",
                    discreetEnquiryAtLossLocation: "Discreet Enquiry at Loss Location",
                    photosExchanged: "Photos Exchanged",
                    witnessRecords: "Witness Records",
                    narrationOrObservation: "Narration/Observation",
                };

                for (const [key, label] of Object.entries(spotFields)) {
                    const value = spotData[key];
                    if (value !== undefined && value !== null && value !== "") {
                        spotRows.push(createStandardRow(label, value));
                    }
                }

                if (spotRows.length > 0) {
                    children.push(new Table({ rows: spotRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                }
            }

            // Special Section: Garage Visit Table
            const garageData = data.garageVisit || {};
            if (garageData && Object.keys(garageData).length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "  Garage Visit  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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

                // --- Towing Vendor Details (Vertical Property Table Style) ---
                if (Array.isArray(garageData.towingVendorDetails) && garageData.towingVendorDetails.length > 0) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "  Towing Vendor Details  ",
                                    bold: true,
                                    size: 32,
                                    shading: {
                                        type: "clear",
                                        fill: "D9D9D9",
                                    }
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 400, after: 200 },
                        })
                    );

                    garageData.towingVendorDetails.forEach((t, idx) => {
                        if (!t) return;
                        if (idx > 0) children.push(new Paragraph({ spacing: { before: 200 } }));

                        children.push(new Paragraph({
                            children: [new TextRun({ text: `Towing Vendor ${idx + 1}`, bold: true, size: 24, underline: {} })],
                            spacing: { after: 100 }
                        }));

                        const tRows = [
                            createStandardRow("Vendor Name", t.towingVendorName),
                            createStandardRow("Contact", t.towingVendorContactNo),
                            createStandardRow("Address", t.towingVendorAddress),
                            createStandardRow("From - To", t.whereToWhere),
                            createStandardRow("Amount", t.towingAmount),
                        ];

                        children.push(new Table({
                            rows: tRows,
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            layout: TableLayoutType.FIXED
                        }));
                    });
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
                        children: [
                            new TextRun({
                                text: "  Police record details  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `  ${headerTitle}  `,
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                    })
                );

                // Create numbered list for observations from points array
                const points = Array.isArray(observationData.points) ? observationData.points : [];

                points.forEach((point, index) => {
                    if (point) {
                        // Strip existing numbering (e.g., "1. " or "1 ") to avoid double numbering
                        const cleanText = String(point).replace(/^\d+[\.\s]+\s*/, "");

                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${index + 1}. `,
                                        bold: true,
                                        size: 20,
                                    }),
                                    new TextRun({
                                        text: cleanText,
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
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "  Opinion  ",
                                bold: true,
                                size: 32,
                                shading: {
                                    type: "clear",
                                    fill: "D9D9D9",
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
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
                        dlPhoto: "DL Photo",
                        insuredPanCardPhoto: "Insured PAN Card Photo",
                        insuredAadharCardPhoto: "Insured Aadhar Card Photo",
                        rcverification: "RC Verification",
                        dlverification: "DL Verification",
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
                    data: data.gpsTimelineDriver?.persons?.length > 0 ? {
                        allGpsImages: data.gpsTimelineDriver.persons.flatMap(p =>
                            (Array.isArray(p.images) ? p.images : []).map(img => ({
                                imageUrl: typeof img === 'string' ? img : img?.imageUrl || img?.url || img?.secure_url,
                                title: `${p.personName || 'Person'}'s GPS Timeline`
                            }))
                        )
                    } : {},
                    fields: {
                        allGpsImages: "GPS Timeline Images",
                    }
                },
                {
                    title: "Garage Visit Photos",
                    data: data.garageVisit || {},
                    fields: {
                        garageImages: "Garage Photos",
                    }
                },
                // {
                //     title: "Police Records (RTI)",
                //     data: data.policeRecordDetails || {},
                //     fields: {
                //         rtiDetails: "RTI Documents",
                //     }
                // },
                {
                    title: "Witness Photos & Documents",
                    data: data.witnessDetails ? {
                        allWitnessItems: (data.witnessDetails || []).flatMap(w => [
                            ...(Array.isArray(w.witnessPhoto) ? w.witnessPhoto : (w.witnessPhoto ? [w.witnessPhoto] : [])).map(img => ({
                                imageUrl: typeof img === 'string' ? img : img?.imageUrl || img?.url || img?.secure_url,
                                title: "Witness Photo",
                                isDocument: false
                            })),
                            ...(Array.isArray(w.witnessDocument) ? w.witnessDocument : []).flatMap(doc => [
                                {
                                    imageUrl: typeof doc.front === 'string' ? doc.front : doc.front?.imageUrl,
                                    title: `${doc.title || 'Document'} (Front)`,
                                    isDocument: true
                                },
                                {
                                    imageUrl: typeof doc.back === 'string' ? doc.back : doc.back?.imageUrl,
                                    title: `${doc.title || 'Document'} (Back)`,
                                    isDocument: true
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
                // Pre-fetch all valid images for all fields in this section to see if we should even render it
                const sectionFieldResults = await Promise.all(
                    Object.entries(section.fields).map(async ([fieldKey, fieldLabel]) => {
                        const fieldValue = section.data[fieldKey];
                        if (!fieldValue) return { fieldKey, fieldLabel, validImages: [] };

                        const rawItems = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
                        const processedResults = await Promise.all(
                            rawItems.map(async (imgItem, idx) => {
                                const imgUrl = typeof imgItem === "string" ? imgItem : (imgItem?.imageUrl || imgItem?.url || imgItem?.secure_url);
                                if (!imgUrl) return null;

                                try {
                                    const base64 = await convertImageToBase64(imgUrl);
                                    if (base64) {
                                        return {
                                            base64,
                                            label: Array.isArray(fieldValue) ? (imgItem.title || `${fieldLabel} ${idx + 1}`) : (imgItem.title || fieldLabel),
                                            isDocument: imgItem.isDocument
                                        };
                                    }
                                } catch (e) {
                                    console.error(`Error processing image ${fieldKey}[${idx}]`, e);
                                }
                                return null;
                            })
                        );

                        return {
                            fieldKey,
                            fieldLabel,
                            validImages: processedResults.filter(img => img !== null)
                        };
                    })
                );

                const hasValidImagesInAnyField = sectionFieldResults.some(res => res.validImages.length > 0);

                if (hasValidImagesInAnyField) {
                    // Start section on a new page
                    children.push(new Paragraph({ children: [new PageBreak()] }));

                    // Section Title
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `  ${section.title.toUpperCase()}  `,
                                    bold: true,
                                    size: 32,
                                    shading: {
                                        type: "clear",
                                        fill: "D9D9D9",
                                    }
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 400, after: 200 },
                        })
                    );

                    for (const { fieldKey, fieldLabel, validImages } of sectionFieldResults) {
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

                            const isGPSTimeline = section.title === "GPS Timeline";
                            const isVerification = fieldKey === "rcverification" || fieldKey === "dlverification";
                            const isStandardDoc = ["rcPhoto", "dlPhoto", "insuredPanCardPhoto", "insuredAadharCardPhoto"].includes(fieldKey);
                            const squareLayoutTitles = ["Spot Visit Photos", "Garage Visit Photos", "Witness Photos & Documents"];
                            const isSquareLayout = squareLayoutTitles.includes(section.title);

                            const columns = isVerification ? 1 : (isGPSTimeline ? 3 : 2);
                            const maxRowsPerPage = (isGPSTimeline || isSquareLayout) ? 2 : Infinity;

                            let imgWidth = 240;
                            let imgHeight = 180;

                            if (isGPSTimeline) {
                                imgWidth = 200;
                                imgHeight = 380;
                            } else if (isVerification) {
                                imgWidth = 600;
                                imgHeight = 600;
                            } else if (isStandardDoc) {
                                imgWidth = 316; // 1.6/1 ratio (400/250)
                                imgHeight = 200;
                            } else if (isSquareLayout) {
                                imgWidth = 300;
                                imgHeight = 300;
                            }

                            let currentTableRows = [];

                            for (let i = 0; i < validImages.length; i += columns) {
                                const imagesInRow = validImages.slice(i, i + columns);
                                const cells = imagesInRow.map((img, cellIdx) => {
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

                                    const currentIsDocument = isStandardDoc || img.isDocument;

                                    const horizontalAlign = currentIsDocument
                                        ? (cellIdx === 0 ? AlignmentType.RIGHT : AlignmentType.LEFT)
                                        : AlignmentType.CENTER;

                                    // Adjust sizes if it's a document but in a square layout section
                                    let currentWidth = imgWidth;
                                    let currentHeight = imgHeight;
                                    if (img.isDocument) {
                                        currentWidth = 316;
                                        currentHeight = 200;
                                    }

                                    return new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new ImageRun({
                                                        data: binaryData,
                                                        transformation: { width: currentWidth, height: currentHeight },
                                                    }),
                                                ],
                                                alignment: horizontalAlign,
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
                                                alignment: horizontalAlign,
                                                spacing: { after: 200 },
                                            })
                                        ],
                                        width: { size: Math.floor(100 / columns), type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.NIL },
                                            bottom: { style: BorderStyle.NIL },
                                            left: { style: BorderStyle.NIL },
                                            right: { style: BorderStyle.NIL }
                                        }
                                    });
                                });

                                // Fill remaining cell if odd number of images
                                while (cells.length < columns) {
                                    cells.push(new TableCell({
                                        children: [],
                                        width: { size: Math.floor(100 / columns), type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.NIL },
                                            bottom: { style: BorderStyle.NIL },
                                            left: { style: BorderStyle.NIL },
                                            right: { style: BorderStyle.NIL }
                                        }
                                    }));
                                }

                                currentTableRows.push(new TableRow({ children: cells }));

                                // Pagination
                                if (currentTableRows.length === maxRowsPerPage) {
                                    children.push(new Table({
                                        rows: currentTableRows,
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
                                    currentTableRows = [];
                                    if (i + columns < validImages.length) {
                                        children.push(new Paragraph({ children: [new PageBreak()] }));
                                        // Also add sub-label again on the new page
                                        children.push(
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: `${fieldLabel} (Continued)`,
                                                        bold: true,
                                                        size: 24,
                                                        color: "333333",
                                                    }),
                                                ],
                                                spacing: { before: 200, after: 100 },
                                            })
                                        );
                                    }
                                }
                            }

                            if (currentTableRows.length > 0) {
                                children.push(new Table({
                                    rows: currentTableRows,
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
            }

            // Sections details removed as per request (Statements & Evidence Photos is the last section)

            // New Footer Design
            const footerTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
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

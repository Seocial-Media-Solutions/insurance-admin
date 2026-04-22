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
    BorderStyle,
    VerticalAlign,
} from "docx";
import { useCallback, useState } from "react";
import { convertImageToBase64, getCurrentDate, formatDate, formatDateTime, formatDateRange } from "../utils/helper";
import { toast } from "react-hot-toast";

// Helper for consistent table rows
const createStandardRow = (label, value, labelPercent = 40, align = AlignmentType.LEFT) => {
    const valuePercent = 100 - labelPercent;

    // Safety check for objects
    let displayValue = value;
    if (typeof value === 'object' && value !== null) {
        if (value.$date) {
            displayValue = new Date(value.$date).toLocaleDateString('en-GB');
        } else if (Object.keys(value).every(k => !isNaN(k))) {
            displayValue = Object.values(value).join('');
        } else {
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

// Helper for Shaded Headings (OD Style)
const createShadedHeading = (text) =>
    new Paragraph({
        children: [
            new TextRun({
                text: `  ${text}  `,
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
    });

export const useTheftCaseDocx = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateDocx = useCallback(async (data) => {
        if (!data) {
            toast.error("No data available to generate document");
            return null;
        }

        setIsGenerating(true);
        const toastId = toast.loading("Generating Theft Case Report...");

        try {
            const children = [];

            // --- HEADER SECTION (Matching OD Design) ---
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

            // 1. Header Information (From Letter Details)
            const letter = data.letterDetails || {};
            const refNo = letter.referenceNumber || "N/A";
            const date = letter.date ? new Date(letter.date).toLocaleDateString('en-GB') : getCurrentDate();

            children.push(
                new Paragraph({
                    children: [new TextRun({ text: date })],
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: `Our Ref. No.: ${refNo}`, bold: true })],
                    spacing: { after: 100 },
                }),
                new Paragraph({ children: [new TextRun({ text: "To," })], spacing: { after: 50 } }),
                new Paragraph({ children: [new TextRun({ text: String(letter.recipientDesignation || "N/A,") })], spacing: { after: 50 } }),
                new Paragraph({ children: [new TextRun({ text: String(letter.recipientDepartment || "N/A,") })], spacing: { after: 50 } }),
                new Paragraph({ children: [new TextRun({ text: String(letter.recipientCompany || "N/A,") })], spacing: { after: 50 } }),
                new Paragraph({ children: [new TextRun({ text: String(letter.recipientAddress || "N/A") })], spacing: { after: 300 } })
            );
            // Subject
            const policyCheck = data.policyAndIncidentDetails || {};
            const insured = data.insuredDetails || {};
            const insuredName = policyCheck.insuredName || insured.insuredName || "N/A";
            const vehicleNo = policyCheck.vehicleRegistrationNumber || insured.vehicleRegistrationNumber || "N/A";

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Sub: Investigation Report of Theft Claim of Vehicle No. ${vehicleNo} (Insured: ${insuredName}).`,
                            bold: true,
                            underline: { type: "single" },
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: `In reference to the subject theft claim of ${insuredName} vehicle number ${vehicleNo}, we have been appointed as an Investigator to investigate the subject claim. Please find our investigative report as follows:` })],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 200 },
                })
            );

            // 2. Summary of Claim
            const summary = data.summaryOfTheClaim || {};
            if (summary && Object.keys(summary).length > 0) {
                children.push(createShadedHeading("SUMMARY OF THE CLAIM"));
                children.push(new Table({
                    width: { size: 130, type: WidthType.PERCENTAGE },
                    rows: [
                        createStandardRow("Claim No.", summary.claimNo || "N/A"),
                        createStandardRow("Policy No.", summary.policyNo || "N/A"),
                        createStandardRow("Date of Appointment for Investigation", formatDate(summary.dateOfAppointmentForInvestigation)),
                        createStandardRow("Date of First Contact with Claimant", formatDate(summary.dateOfFirstContactWithClaimant)),
                    ]
                }));
            }

            // 3. Policy & Incident Details
            const policy = data.policyAndIncidentDetails || {};
            children.push(createShadedHeading("INSURANCE POLICY & INCIDENT DETAILS"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Insurer", policy.insurenceCompany),
                    createStandardRow("Insured", policy.insuredName),
                    createStandardRow("Insured contact No.", policy.insuredContactNo),
                    createStandardRow("Policy No.", policy.policyNo),
                    createStandardRow("Period of Risk Cover", formatDateRange(policy.riskCoverPeriod)),
                    createStandardRow("Policy Name", policy.policyName),
                    createStandardRow("Sum Insured", policy.sumInsured),
                    createStandardRow("Make & Model of the Vehicle", policy.makeAndModel),
                    createStandardRow("Year of Manufacturing", policy.yearOfManufacture),
                    createStandardRow("Vehicle Registration Number", policy.vehicleRegistrationNumber),
                    createStandardRow("Engine No.", policy.engineNo),
                    createStandardRow("Chassis No.", policy.chassisNo),
                    createStandardRow("Hypothecation with", policy.hypothecationWith),
                    createStandardRow("Date and Time of Incident", policy.incidentDateAndTime),
                    createStandardRow("Date of Start of Policy", formatDate(policy.policyStartDate)),
                    createStandardRow("Date of FIR and reasons for delay, if any", policy.firDateAndDelayReason),
                    createStandardRow("Date of Intimation to Insurer and reasons if delay", policy.insurerIntimationDateAndDelayReason),
                    createStandardRow("Place of Parking at the time of theft & Location of Accident / Theft", policy.parkingPlaceAtTheft),
                ]
            }));




            // 4. Insured Details
            if (insured && (insured.insuredName || insured.contactNumber || insured.aadharNumber)) {
                children.push(createShadedHeading("Insured Details"));
                children.push(new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        createStandardRow("Name of Insured", insured.insuredName),
                        createStandardRow("Current address of insured", insured.currentAddress),
                        createStandardRow("Present address", insured.permanentAddress),
                        createStandardRow("Contact Number", insured.contactNumber),
                        createStandardRow("PAN Number", insured.panNumber),
                        createStandardRow("Aadhar Card Number", insured.aadharNumber),
                        createStandardRow("Driving Licence Details", insured.drivingLicenceNumber),
                        createStandardRow("Driving Licence Valid For", insured.drivingLicenceValidFor),
                        createStandardRow("Driving Licence Valid from to", formatDateRange(insured.drivingLicenceValidityPeriod)),
                        createStandardRow("Vehicle Registration Number", insured.vehicleRegistrationNumber),
                    ]
                }));
            }

            // 5. Purchase & Registration
            const purchase = data.purchaseAndRegistrationParticulars || {};
            children.push(createShadedHeading("PURCHASE & REGISTRATION PARTICULARS"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Vehicle Purchased From", purchase.vehiclePurchasedFrom),
                    createStandardRow("Invoice No. With Date", purchase.invoiceNoWithDate),
                    createStandardRow("Invoice Value", purchase.invoiceValue),
                    createStandardRow("Owner’s Name", purchase.ownerName),
                    createStandardRow("Registration Number", purchase.registrationNumber),
                    createStandardRow("Date of Registration", formatDate(purchase.registrationDate)),
                    createStandardRow("Registration Authority", purchase.registrationAuthority),
                    createStandardRow("Chassis No.", purchase.chassisNo),
                    createStandardRow("Engine No.", purchase.engineNo),
                    createStandardRow("Make / Model of the Vehicle & Year", purchase.makeModelYear),
                    createStandardRow("Type of Vehicle", purchase.vehicleType),
                    createStandardRow("Class of Vehicle", purchase.vehicleClass),
                    createStandardRow("Road Tax Clear to", purchase.roadTaxClearTo),
                    createStandardRow("Finance From (Hypothecation Details)", purchase.financeDetails),
                ]
            }));

            // 6. FIR Details
            const fir = data.firDetails || {};
            children.push(createShadedHeading("FIR Details"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Name of Police Station where case was reported", fir.policeStationName),
                    createStandardRow("Crime Case No. And Section of Crime", fir.crimeCaseNoAndSection),
                    createStandardRow("FIR Lodged By", fir.firLodgedBy),
                    createStandardRow("FIR Lodged Against", fir.firLodgedAgainst),
                    createStandardRow("Date and Time of FIR", fir.firDateAndTime),
                    createStandardRow("FIR No.", fir.firNo),
                    createStandardRow("Name of Investigation Officer", fir.investigationOfficerName),
                    createStandardRow("Translation of FIR", fir.firTranslationRequired),
                ]
            }));

            // 7. Maintenance & Service Record
            const maintenance = data.maintenanceServiceRecord || {};
            children.push(createShadedHeading("MAINTENANCE & SERVICE RECORD OF VEHICLE : As per Insured Statement"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Vehicle Last Service From", maintenance.lastServiceFrom),
                    createStandardRow("Date of Last Service", formatDate(maintenance.lastServiceDate)),
                    createStandardRow("Service Free or Paid", maintenance.serviceType),
                    createStandardRow("Amount Paid in the Service", maintenance.serviceAmountPaid),
                    createStandardRow("Availability of Service Details", maintenance.serviceDetailsAvailability),
                    createStandardRow("Odometer Reading during last Service with date", maintenance.odometerReadingAtLastService),
                ]
            }));

            // 8. Visit to Insured
            const visit = data.visitToInsured || {};
            children.push(createShadedHeading("VISIT TO INSURED"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Date of Loss", formatDateTime(visit.dateOfLoss)),
                    createStandardRow("Date of Start of Policy", formatDate(visit.policyStartDate)),
                    createStandardRow("Date of FIR and reasons for delay, if any", visit.firDateAndDelayReason),
                    createStandardRow("Date of Intimation to Insurer and reasons if delay", visit.insurerIntimationDateAndDelayReason),
                    createStandardRow("Profession of Insured", visit.insuredProfession),
                    createStandardRow("Turnover / Annual Income", visit.annualIncome),
                    createStandardRow("Possession of both / all Keys", visit.possessionOfKeys),
                    createStandardRow("Economic Status / Live Style judged from residential accommodation", visit.economicStatus),
                    createStandardRow("Do the life style / Economic Status match with the ownership of vehicle? Investigator’s view in this regard", visit.lifestyleMatchWithVehicleOwnership),
                    createStandardRow("Written Statement and Claim Form (Insured’s Statement in Detail)", visit.writtenStatementAndClaimForm),
                    createStandardRow("Professional background of Father / Wife / Brother", visit.familyProfessionalBackground),
                    createStandardRow("Translation of Insured Statement", visit.statementTranslationRequired),
                ]
            }));

            // 9. Witness Details
            if (data.witnessDetails && Array.isArray(data.witnessDetails) && data.witnessDetails.length > 0) {
                children.push(createShadedHeading("WITNESSES DETAILS"));
                data.witnessDetails.forEach((witness, wIdx) => {
                    // Title: Witness Details
                    children.push(new Paragraph({
                        children: [
                            new TextRun({ text: `Witness Details - ${witness.witnessName || "N/A"}`, bold: true, size: 24 }),
                        ],
                        spacing: { before: 300, after: 100 },
                    }));

                    // Structured Table
                    children.push(new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            createStandardRow("Name", witness.witnessName),
                            createStandardRow("Address", witness.witnessAddress),
                            createStandardRow("Relation with Insured", witness.relationWithInsured),

                        ]
                    }));

                    // Narrative Portion in a boxed cell
                    children.push(new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            // Title: Version of witness [Name]:-
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: `Version of witness ${witness.witnessName || "N/A"}:-`,
                                                        bold: true,
                                                        underline: {},
                                                        size: 24
                                                    }),
                                                ],
                                                spacing: { before: 200, after: 200 },
                                            }),
                                            // Statement (Narrative)
                                            ...(witness.witnessStatement ? [
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({ text: witness.witnessStatement, size: 22 }),
                                                        new TextRun({ text: '"', size: 22 }), // Ending quote like in image
                                                    ],
                                                    alignment: AlignmentType.JUSTIFY,
                                                    spacing: { after: 200 },
                                                })
                                            ] : []),
                                            // Footer: Statement enclosed.
                                            new Paragraph({
                                                children: [
                                                    new TextRun({ text: "Statement enclosed.", bold: true, size: 22 }),
                                                ],
                                                spacing: { after: 200 },
                                            }),
                                        ],
                                        margins: { top: 200, bottom: 200, left: 200, right: 200 }
                                    })
                                ]
                            })
                        ],
                        spacing: { before: 200, after: 400 }
                    }));
                });
            }

            // 10. Visit to Person Possessing Vehicle
            const possessor = data.visitToPersonPossessingVehicle || {};
            children.push(createShadedHeading("VIST TO THE PERSON POSSESSING THE VEHICLE AT THE TIME / BEFORE THE THEFT"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Registration Number", possessor.registrationNumber),
                    createStandardRow("Name of the person", possessor.personName),
                    createStandardRow("Period of possession / employment", possessor.possessionPeriod),
                    createStandardRow("Statement Translation", possessor.statementTranslation),
                ]
            }));

            // 11. Visit to Financer
            const financer = data.visitToFinancer || {};
            children.push(createShadedHeading("VISIT TO FINANCER’S OFFICE"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Name of Financier", financer.financerName),
                    createStandardRow("No. of Total Instalments", financer.totalInstallments),
                    createStandardRow("Note/Remarks", financer.remarks),
                    createStandardRow("No. of Instalment paid", financer.installmentsPaid),
                    createStandardRow("No. of Cheques Bounced", financer.chequesBounced),
                    createStandardRow("Date of Last Instalment", formatDate(financer.lastInstallmentDate)),
                ]
            }));

            // 3b. Inspection of Loss Site (Requested for dedicated section)
            const inspection = data.lossSiteInspection || {};
            if (inspection && (inspection.parkingLocationDescription || inspection.theftSpotLatitude)) {
                children.push(createShadedHeading("INSPECTION OF LOSS SITE"));

                if (inspection.parkingLocationDescription) {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: inspection.parkingLocationDescription, size: 24 })],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { before: 200, after: 200 }
                    }));
                }

                if (inspection.theftSpotLatitude || inspection.theftSpotLongitude) {
                    children.push(new Paragraph({
                        children: [
                            new TextRun({ text: "Theft Spot Latitude : ", bold: true, size: 24 }),
                            new TextRun({ text: inspection.theftSpotLatitude || "N/A", size: 24 }),
                            new TextRun({ text: "                                                              & Longitude: ", bold: true, size: 24 }),
                            new TextRun({ text: inspection.theftSpotLongitude || "N/A", size: 24 }),
                        ],
                        spacing: { after: 200 }
                    }));
                }
            }

            const keys = data.keysRemark || {};
            const hasData = keys.keysProvided || keys.keyTagNumberProvided || keys.keyTagNumberInInvoice || keys.remarks;

            if (hasData) {
                children.push(new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        // Heading Row
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: "REMARK ON KEYS OF THE VEHICLE",
                                                    bold: true,
                                                    underline: {},
                                                    size: 24
                                                })
                                            ],
                                            alignment: AlignmentType.CENTER,
                                        })
                                    ],
                                    verticalAlign: VerticalAlign.CENTER,
                                    shading: { fill: "F2F2F2" },
                                    columnSpan: 2
                                })
                            ]
                        }),
                        // Standard Rows
                        createStandardRow("Keys Provided", keys.keysProvided),
                        createStandardRow("Key Tag No (Provided)", keys.keyTagNumberProvided),
                        createStandardRow("Key Tag No (Invoice)", keys.keyTagNumberInInvoice),
                        createStandardRow("Mismatch?", keys.keyTagMismatch),
                        // Narrative content row (if remarks exist)
                        ...(keys.remarks ? [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [new TextRun({ text: "Detailed Remarks", bold: true, size: 24 })],
                                                spacing: { after: 100 }
                                            }),
                                            new Paragraph({
                                                children: [new TextRun({ text: keys.remarks, size: 24 })],
                                                alignment: AlignmentType.JUSTIFIED
                                            })
                                        ],
                                        columnSpan: 2,
                                        spacing: { before: 100, after: 100 }
                                    })
                                ]
                            })
                        ] : [])
                    ]
                }));
            }
            children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

            // 14. Feedback from Location
            const feedback = data.feedBackFromLocationOfTheft || {};
            children.push(createShadedHeading("FEED BACK FROM LOCATION OF THEFT"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Statement of Parking Attendant", feedback.statementOfParkingAttendant),
                    createStandardRow("Statement of Shopkeeper’s", feedback.statementOfShopkeepers),
                    createStandardRow("Statement of Watchman", feedback.statementOfWatchman),
                ]
            }));

            // 15. Visit to Service Station
            const garage = data.visitToServiceStation || {};
            children.push(createShadedHeading("VISIT TO SERVICE STATION/ GARAGE"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Name of Garage", garage.nameOfGarage),
                ]
            }));

            // 16. Additional Investigation
            const extra = data.additionalInvestigationIfCommercialUseSuspected || {};
            children.push(createShadedHeading("ADDITIONAL INVESTIGATION IF COMMERCIAL USE SUSPECTED"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Suspected involvement of friend’s / family on any report", extra.suspectedInvolvementOfFriendsFamilyOnAnyReport),
                    createStandardRow("Intentional delay in report incident to the Police", extra.intentionalDelayInReportIncidentToPolice),
                    createStandardRow("Any inconsistent statement of facts", extra.anyInconsistentStatementOfFacts),
                    createStandardRow("Any concerned authorities unwilling to provide facts", extra.anyConcernedAuthoritiesUnwillingToProvideFacts),
                    createStandardRow("News Paper cutting available or not", extra.newsPaperCuttingAvailableOrNot),
                    createStandardRow("Income Certificate available or not", extra.incomeCertificateAvailableOrNot),
                ]
            }));

            // 17. Findings
            const findings = data.findings || {};
            children.push(createShadedHeading("FINDINGS"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Is there any suspected involvement of friend’s/ family on any report", findings.suspectedInvolvementOfFriendsFamilyOnAnyReport),
                    createStandardRow("In there any intentional delay in report incident to the Police", findings.intentionalDelayInReportIncidentToPolice),
                    createStandardRow("Any inconsistent statements of facts", findings.anyInconsistentStatementOfFacts),
                    createStandardRow("Any concerned authorities unwilling to provide facts", findings.anyConcernedAuthoritiesUnwillingToProvideFacts),
                    createStandardRow("News Paper Cutting Available", findings.newsPaperCuttingAvailableOrNot),
                    createStandardRow("Income Certificate available or not", findings.incomeCertificateAvailableOrNot),
                ]
            }));

            // 18. Brief Details
            const brief = data.briefDetailsOfTheCase || {};
            children.push(createShadedHeading("BRIEF DETAILS OF THE CASE"));
            if (Array.isArray(brief.briefDetailsOfTheCase)) {
                brief.briefDetailsOfTheCase.forEach(line => {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: "• " + line })],
                        spacing: { after: 100 }
                    }));
                });
            }

            // 19. Conclusion
            const conclusion = data.conclusion || {};
            children.push(createShadedHeading("CONCLUSION"));
            if (Array.isArray(conclusion.conclusion)) {
                conclusion.conclusion.forEach(line => {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: "• " + line })],
                        spacing: { after: 100 }
                    }));
                });
            }

            // 20. Documents Verified
            const docs = data.documentsSubmittedAndVerified || {};
            children.push(createShadedHeading("LIST OF DOCUMENTS SUBMITTED & VERIFIED"));
            const docRows = Object.entries(docs).map(([key, val]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return createStandardRow(label, (Array.isArray(val) ? (val.length > 0 ? "Yes" : "No") : val) || "N/A");
            });
            if (docRows.length > 0) {
                children.push(new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: docRows
                }));
            }

            // PHOTOGRAPHS SECTION - ONE BY ONE

            // Function to generate image tables
            const createImageGallery = async (images, title) => {
                if (!images || images.length === 0) return;

                children.push(createShadedHeading(title));

                const validProcessed = [];
                for (const img of images) {
                    const url = img.imageUrl || img.url || img.secure_url;
                    if (url) {
                        try {
                            const b64 = await convertImageToBase64(url);
                            if (b64) {
                                const binaryString = atob(b64);
                                const uint8Array = new Uint8Array(binaryString.length);
                                for (let j = 0; j < binaryString.length; j++) {
                                    uint8Array[j] = binaryString.charCodeAt(j);
                                }
                                validProcessed.push({ ...img, uint8Array });
                            }
                        } catch (e) {
                            console.error(`Failed: ${url}`, e);
                        }
                    }
                }

                const rows = [];
                let cells = [];
                validProcessed.forEach((img, idx) => {
                    cells.push(new TableCell({
                        children: [
                            new Paragraph({
                                children: [new ImageRun({ data: img.uint8Array, transformation: { width: 300, height: 250 } })],
                                alignment: AlignmentType.CENTER
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: img.label || img.title || `Image ${idx + 1}` })],
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 200 }
                            })
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } }
                    }));

                    if (cells.length === 2) {
                        rows.push(new TableRow({ children: cells }));
                        cells = [];
                    }
                });
                if (cells.length > 0) rows.push(new TableRow({ children: cells }));

                if (rows.length > 0) {
                    children.push(new Table({
                        rows: rows,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.NIL },
                            bottom: { style: BorderStyle.NIL },
                            left: { style: BorderStyle.NIL },
                            right: { style: BorderStyle.NIL },
                            insideHorizontal: { style: BorderStyle.NIL },
                            insideVertical: { style: BorderStyle.NIL },
                        }
                    }));
                }
            };

            // 21. Insured Documents Photos
            const iDocs = data.insuredDocuments || {};
            const insuredImgs = [];
            [
                'rcPhoto', 'rcverification', 'dlPhoto', 'dlverification',
                'insuredPanCardPhoto', 'insuredAadharCardPhoto', 'bankPassbookDetails'
            ].forEach(k => {
                const val = iDocs[k];
                if (val) {
                    const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    if (Array.isArray(val)) val.forEach(img => insuredImgs.push({ ...img, label }));
                    else insuredImgs.push({ ...val, label });
                }
            });
            await createImageGallery(insuredImgs, "INSURED DOCUMENTS");

            // 22. Witness Document and Photos
            const witnessImgs = [];
            if (data.witnessDetails && Array.isArray(data.witnessDetails)) {
                data.witnessDetails.forEach(w => {
                    const wName = w.witnessName || "Witness";
                    if (Array.isArray(w.witnessPhoto)) {
                        w.witnessPhoto.forEach(img => witnessImgs.push({ ...img, label: `${wName} Photo` }));
                    }
                    if (Array.isArray(w.witnessDocument)) {
                        w.witnessDocument.forEach(d => {
                            if (d.front) witnessImgs.push({ ...d.front, label: `${wName} ${d.title || "ID"} Front` });
                            if (d.back) witnessImgs.push({ ...d.back, label: `${wName} ${d.title || "ID"} Back` });
                        });
                    }
                });
            }
            await createImageGallery(witnessImgs, "WITNESS DOCUMENTS & PHOTOS");

            // 23. Spot & Investigation Gallery (2x2 Grid)
            const investigationImgs = [];

            // From Loss Site Inspection
            if (data.lossSiteInspection?.spotImages && Array.isArray(data.lossSiteInspection.spotImages)) {
                data.lossSiteInspection.spotImages.forEach(img => investigationImgs.push({ ...img, label: 'Theft Spot' }));
            }

            // From Statements / Letters
            if (data.letterDetails?.letterImages && Array.isArray(data.letterDetails.letterImages)) {
                data.letterDetails.letterImages.forEach(img => investigationImgs.push({ ...img, label: 'Statement / Letter' }));
            }

            if (investigationImgs.length > 0) {
                await createImageGallery(investigationImgs, "INVESTIGATION & SPOT PHOTOS (2x2 Grid)");
            }

            // Footer Design (Matching OD)
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
                sections: [{
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
                        },
                    },
                    children: children,
                    headers: {
                        default: new Header({ children: [headerTable] }),
                    },
                    footers: {
                        default: new Footer({ children: [footerTable] }),
                    },
                }],
            });

            const blob = await Packer.toBlob(doc);
            return blob;

        } catch (error) {
            console.error("Doc Gen Error:", error);
            toast.error("Failed to generate report.");
            return null;
        } finally {
            setIsGenerating(false);
            toast.dismiss(toastId);
        }
    }, []);

    return { generateDocx, isGenerating };
};

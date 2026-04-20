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
import { convertImageToBase64, getCurrentDate } from "../utils/helper";
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
                children.push(createShadedHeading("Summary of Claim"));
                children.push(new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        createStandardRow("Claim No.", summary.claimNo),
                        createStandardRow("Insured Name", insuredName),
                        createStandardRow("Vehicle No.", vehicleNo),
                        createStandardRow("Make & Model", policyCheck.makeAndModel),
                        createStandardRow("Date of Appointment", summary.dateOfAppointmentForInvestigation),
                        createStandardRow("First Contact with Claimant", summary.dateOfFirstContactWithClaimant),
                    ]
                }));
            }

            // 2.5 New Insured Details
            if (insured && (insured.insuredName || insured.contactNumber || insured.aadharNumber)) {
                children.push(createShadedHeading("Insured Details"));
                children.push(new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        createStandardRow("Name of Insured", insured.insuredName),
                        createStandardRow("Contact Number", insured.contactNumber),
                        createStandardRow("Current Address", insured.currentAddress),
                        createStandardRow("Permanent Address", insured.permanentAddress),
                        createStandardRow("Aadhar Card No", insured.aadharNumber),
                        createStandardRow("PAN Card No", insured.panNumber),
                        createStandardRow("DL Number", insured.drivingLicenceNumber),
                        createStandardRow("DL Valid For", insured.drivingLicenceValidFor),
                        createStandardRow("DL Validity", insured.drivingLicenceValidityPeriod),
                        createStandardRow("Vehicle Reg No", insured.vehicleRegistrationNumber),
                    ]
                }));
            }

            // 3. Policy & Incident Details
            const policy = data.policyAndIncidentDetails || {};
            children.push(createShadedHeading("Policy & Incident Details"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Insurance Company", policy.insurenceCompany),
                    createStandardRow("Insured Name", policy.insuredName),
                    createStandardRow("Contact No", policy.insuredContactNo),
                    createStandardRow("Policy No", policy.policyNo),
                    createStandardRow("Cover Period", policy.riskCoverPeriod),
                    createStandardRow("Sum Insured (IDV)", policy.sumInsured),
                    createStandardRow("Vehicle Reg No", policy.vehicleRegistrationNumber),
                    createStandardRow("Make & Model", policy.makeAndModel),
                    createStandardRow("Mfg Year", policy.yearOfManufacture),
                    createStandardRow("Engine No", policy.engineNo),
                    createStandardRow("Chassis No", policy.chassisNo),
                    createStandardRow("Hypothecation", policy.hypothecationWith),
                    createStandardRow("Incident Date/Time", policy.incidentDateAndTime),
                    createStandardRow("Parking Place", policy.parkingPlaceAtTheft),
                ]
            }));

            // 4. Purchase & Registration
            const purchase = data.purchaseAndRegistrationParticulars || {};
            children.push(createShadedHeading("Purchase & Registration Particulars"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Purchased From", purchase.vehiclePurchasedFrom),
                    createStandardRow("Invoice No/Date", purchase.invoiceNoWithDate),
                    createStandardRow("Invoice Value", purchase.invoiceValue),
                    createStandardRow("Owner Name", purchase.ownerName),
                    createStandardRow("Date of Registration", purchase.registrationDate),
                    createStandardRow("RTO Authority", purchase.registrationAuthority),
                    createStandardRow("Vehicle Type/Class", `${purchase.vehicleType || ""} / ${purchase.vehicleClass || ""}`),
                    createStandardRow("Tax Valid Upto", purchase.roadTaxClearTo),
                    createStandardRow("Finance Details", purchase.financeDetails),
                ]
            }));

            // 5. FIR Details
            const fir = data.firDetails || {};
            children.push(createShadedHeading("FIR Details"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Police Station", fir.policeStationName),
                    createStandardRow("FIR No", fir.firNo),
                    createStandardRow("Date/Time", fir.firDateAndTime),
                    createStandardRow("Section", fir.crimeCaseNoAndSection),
                    createStandardRow("Lodged By", fir.firLodgedBy),
                    createStandardRow("Against", fir.firLodgedAgainst),
                    createStandardRow("Investigating Officer", fir.investigationOfficerName),
                ]
            }));

            // 6. Visit to Insured
            const visit = data.visitToInsured || {};
            children.push(createShadedHeading("Visit details to the Insured"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Insured Profession", visit.insuredProfession),
                    createStandardRow("Annual Income", visit.annualIncome),
                    createStandardRow("Keys Possession", visit.possessionOfKeys),
                    createStandardRow("Economic Status", visit.economicStatus),
                    createStandardRow("Delayed Intimation Reason", visit.insurerIntimationDateAndDelayReason),
                    createStandardRow("Family Background", visit.familyProfessionalBackground),
                ]
            }));

            // 7. Loss Site Inspection
            const lossSite = data.lossSiteInspection || {};
            children.push(createShadedHeading("Loss Site Inspection"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Description", lossSite.parkingLocationDescription),
                    createStandardRow("Coordinates", `${lossSite.theftSpotLatitude}, ${lossSite.theftSpotLongitude}`),
                ]
            }));

            // 8. Keys Remark
            const keys = data.keysRemark || {};
            children.push(createShadedHeading("Keys Remark"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Keys Provided", keys.keysProvided),
                    createStandardRow("Key Tag No (Provided)", keys.keyTagNumberProvided),
                    createStandardRow("Key Tag No (Invoice)", keys.keyTagNumberInInvoice),
                    createStandardRow("Mismatch?", keys.keyTagMismatch),
                ]
            }));

            // 9. Feedback from Location
            const feedback = data.feedBackFromLocationOfTheft || {};
            children.push(createShadedHeading("Feedback from Location"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Watchman Statement", feedback.statementOfWatchman),
                    createStandardRow("Parking Attendant", feedback.statementOfParkingAttendant),
                    createStandardRow("Shopkeepers", feedback.statementOfShopkeepers),
                ]
            }));

            // 10. Documents Verified
            const docs = data.documentsSubmittedAndVerified || {};
            children.push(createShadedHeading("Documents Verified"));
            const docRows = Object.entries(docs).map(([key, val]) => {
                // Formatting key to label (camelCase to Title Case)
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return createStandardRow(label, val);
            });

            // Only add table if there are rows
            if (docRows.length > 0) {
                children.push(new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: docRows
                }));
            } else {
                children.push(new Paragraph({
                    children: [new TextRun({ text: "No documents verified yet." })],
                    spacing: { after: 200 },
                    alignment: AlignmentType.CENTER,
                }));
            }

            // 11. Findings & Conclusion
            children.push(createShadedHeading("Findings"));
            if (data.findings) {
                const f = data.findings;
                children.push(new Paragraph({
                    children: [new TextRun({ text: String(f.suspectedInvolvementOfFriendsFamilyOnAnyReport || f.anyInconsistentStatementOfFacts || "Investigation findings enclosed.") })],
                    spacing: { after: 200 },
                    alignment: AlignmentType.JUSTIFIED,
                }));
            }

            children.push(createShadedHeading("Conclusion"));
            if (data.conclusion && Array.isArray(data.conclusion.conclusion)) {
                data.conclusion.conclusion.forEach(line => {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: "• " + line })],
                        spacing: { after: 100 }
                    }));
                });
            }

            // 12. Photographs
            children.push(createShadedHeading("Photographs"));

            // Gather images robustly
            let allImages = [];
            
            // 1. Specific sections images
            if (data.spotVisit && Array.isArray(data.spotVisit)) {
                allImages = [...allImages, ...data.spotVisit.map(img => ({ ...img, category: 'Spot Visit' }))];
            }

            // 2. Insured Documents (mixed arrays and objects)
            const iDocs = data.insuredDocuments || {};
            const docFields = [
                { key: 'rcPhoto', label: 'RC Photo' },
                { key: 'rcverification', label: 'RC Verification' },
                { key: 'dlPhoto', label: 'DL Photo' },
                { key: 'dlverification', label: 'DL Verification' },
                { key: 'insuredPanCardPhoto', label: 'PAN Card' },
                { key: 'insuredAadharCardPhoto', label: 'Aadhar Card' },
                { key: 'bankPassbookDetails', label: 'Bank Passbook' }
            ];

            docFields.forEach(({ key, label }) => {
                const val = iDocs[key];
                if (val) {
                    if (Array.isArray(val)) {
                        allImages = [...allImages, ...val.map(img => ({ ...img, category: label }))];
                    } else if (typeof val === 'object' && (val.imageUrl || val.url || val.secure_url)) {
                        allImages.push({ ...val, category: label });
                    }
                }
            });

            // 3. Witness Details
            if (data.witnessDetails && Array.isArray(data.witnessDetails)) {
                data.witnessDetails.forEach(w => {
                    if (w.witnessPhoto && Array.isArray(w.witnessPhoto)) {
                        allImages = [...allImages, ...w.witnessPhoto.map(img => ({ ...img, category: `Witness: ${w.witnessName}` }))];
                    }
                    if (w.witnessDocument && Array.isArray(w.witnessDocument)) {
                        w.witnessDocument.forEach(d => {
                            if (d.front) allImages.push({ ...d.front, category: `${w.witnessName} ${d.title || "ID"} Front` });
                            if (d.back) allImages.push({ ...d.back, category: `${w.witnessName} ${d.title || "ID"} Back` });
                        });
                    }
                });
            }

            if (allImages.length > 0) {
                // Process images in batches to prevent memory overflow
                const BATCH_SIZE = 10;
                const processedImages = [];

                for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
                    const batch = allImages.slice(i, i + BATCH_SIZE);
                    const batchResults = await Promise.all(
                        batch.map(async (img) => {
                            const url = img.imageUrl || img.url || img.secure_url;
                            if (url) {
                                try {
                                    const b64 = await convertImageToBase64(url);
                                    if (!b64) return null;

                                    // DOCX needs Uint8Array for browser
                                    const binaryString = atob(b64);
                                    const uint8Array = new Uint8Array(binaryString.length);
                                    for (let j = 0; j < binaryString.length; j++) {
                                        uint8Array[j] = binaryString.charCodeAt(j);
                                    }
                                    return { ...img, uint8Array };
                                } catch (e) {
                                    console.error(`Failed to process image: ${url}`, e);
                                    return null;
                                }
                            }
                            return null;
                        })
                    );
                    processedImages.push(...batchResults.filter(i => i !== null));

                    if (i + BATCH_SIZE < allImages.length) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }

                const validImages = processedImages.filter(i => i && i.uint8Array);

                const imageRows = [];
                let rowCells = [];
                validImages.forEach((img, idx) => {
                    const imgPara = new Paragraph({
                        children: [new ImageRun({
                            data: img.uint8Array,
                            transformation: { width: 250, height: 180 }
                        })],
                        alignment: AlignmentType.CENTER
                    });
                    const txtPara = new Paragraph({
                        children: [new TextRun({ text: String(img.category || img.title || `Image ${idx + 1}`) })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    });

                    rowCells.push(new TableCell({
                        children: [imgPara, txtPara],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } }
                    }));

                    if (rowCells.length === 2) {
                        imageRows.push(new TableRow({ children: rowCells }));
                        rowCells = [];
                    }
                });
                if (rowCells.length > 0) imageRows.push(new TableRow({ children: rowCells }));

                if (imageRows.length > 0) {
                    children.push(new Table({
                        rows: imageRows,
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

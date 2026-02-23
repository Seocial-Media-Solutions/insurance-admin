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
    BorderStyle,
} from "https://esm.sh/docx@8.5.0";
import saveAs from "https://esm.sh/file-saver@2.0.5";
import { useCallback, useState } from "react";
import { convertImageToBase64, getCurrentDate } from "../utils/helper";
import { toast } from "react-hot-toast";

// Helper: Standard Row
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

// Helper: Heading
const createHeading = (text) =>
    new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
        border: {
            bottom: { color: "000000", space: 1, value: "single", size: 6 },
        },
    });

export const useTheftCaseDocx = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateDocx = useCallback(async (data) => {
        if (!data) {
            toast.error("No data available to generate document");
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading("Generating Theft Case Report...");

        try {
            const children = [];

            // 1. Header Information (From Letter Details)
            const letter = data.letterDetails || {};
            const refNo = letter.referenceNumber || "N/A";
            const date = letter.date ? new Date(letter.date).toLocaleDateString('en-GB') : getCurrentDate();

            children.push(
                new Paragraph({
                    text: date,
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: `Ref No: ${refNo}`, bold: true })],
                    spacing: { after: 200 },
                }),
                new Paragraph({ text: "To,", spacing: { after: 50 } }),
                new Paragraph({ text: letter.recipientDesignation || "The Manager", spacing: { after: 50 } }),
                new Paragraph({ text: letter.recipientDepartment || "Claim Department", spacing: { after: 50 } }),
                new Paragraph({ text: letter.recipientCompany || "Insurance Co. Ltd.", spacing: { after: 50 } }),
                new Paragraph({ text: letter.recipientAddress || "", spacing: { after: 300 } })
            );

            // Subject
            const policyCheck = data.policyAndIncidentDetails || {};
            const insuredName = policyCheck.insuredName || "Unknown";
            const vehicleNo = policyCheck.vehicleRegistrationNumber || "Unknown";
            const claimNo = data.summaryOfTheClaim?.claimNo || "Unknown";

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Sub: Theft Investigation Report`,
                            bold: true,
                            underline: {},
                        }),
                        new TextRun({ text: `\nInsured: ${insuredName}` }),
                        new TextRun({ text: `\nVehicle No: ${vehicleNo}` }),
                        new TextRun({ text: `\nClaim No: ${claimNo}` }),
                    ],
                    spacing: { after: 300 },
                })
            );

            children.push(
                new Paragraph({
                    text: "Dear Sir/Madam,",
                    spacing: { after: 100 },
                }),
                new Paragraph({
                    text: "As per your instructions, we have visited the insured, local police station, and RTO to investigate the subject theft claim. Please find our detailed report below:",
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 200 },
                })
            );

            // 2. Summary of Claim
            const summary = data.summaryOfTheClaim || {};
            children.push(createHeading("1. Summary of Claim"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Claim No", summary.claimNo),
                    createStandardRow("Policy No", summary.policyNo),
                    createStandardRow("Date of Appointment", summary.dateOfAppointmentForInvestigation),
                    createStandardRow("Date of First Contact", summary.dateOfFirstContactWithClaimant),
                ]
            }));

            // 3. Policy & Incident Details
            const policy = data.policyAndIncidentDetails || {};
            children.push(createHeading("2. Policy & Incident Details"));
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
            children.push(createHeading("3. Purchase & Registration Particulars"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Purchased From", purchase.vehiclePurchasedFrom),
                    createStandardRow("Invoice No/Date", purchase.invoiceNoWithDate),
                    createStandardRow("Invoice Value", purchase.invoiceValue),
                    createStandardRow("Owner Name", purchase.ownerName),
                    createStandardRow("Date of Registration", purchase.registrationDate),
                    createStandardRow("RTO Authority", purchase.registrationAuthority),
                    createStandardRow("Vehicle Type/Class", `${purchase.vehicleType} / ${purchase.vehicleClass}`),
                    createStandardRow("Tax Valid Upto", purchase.roadTaxClearTo),
                    createStandardRow("Finance Details", purchase.financeDetails),
                ]
            }));

            // 5. FIR Details
            const fir = data.firDetails || {};
            children.push(createHeading("4. FIR Details"));
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
            children.push(createHeading("5. Visit details to the Insured"));
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
            children.push(createHeading("6. Loss Site Inspection"));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    createStandardRow("Description", lossSite.parkingLocationDescription),
                    createStandardRow("Coordinates", `${lossSite.theftSpotLatitude}, ${lossSite.theftSpotLongitude}`),
                ]
            }));

            // 8. Keys Remark
            const keys = data.keysRemark || {};
            children.push(createHeading("7. Keys Remark"));
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
            children.push(createHeading("8. Feedback from Location"));
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
            children.push(createHeading("9. Documents Verified"));
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
                    text: "No documents verified yet.",
                    spacing: { after: 200 },
                    alignment: AlignmentType.CENTER,
                }));
            }

            // 11. Findings & Conclusion
            children.push(createHeading("10. Findings"));
            if (data.findings) {
                const f = data.findings;
                children.push(new Paragraph({
                    text: f.suspectedInvolvementOfFriendsFamilyOnAnyReport || f.anyInconsistentStatementOfFacts || "Investigation findings enclosed.",
                    spacing: { after: 200 },
                    alignment: AlignmentType.JUSTIFIED,
                }));
            }

            children.push(createHeading("11. Conclusion"));
            if (data.conclusion && Array.isArray(data.conclusion.conclusion)) {
                data.conclusion.conclusion.forEach(line => {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: "• " + line })],
                        spacing: { after: 100 }
                    }));
                });
            }

            // 12. Photographs
            // Gather images
            let allImages = [];
            // Spot Visit
            if (data.spotVisit) allImages = [...allImages, ...data.spotVisit.map(img => ({ ...img, category: 'Spot Visit' }))];
            // Insured Docs
            const iDocs = data.insuredDocuments || {};
            ['rcPhoto', 'dlPhoto', 'insuredPanCardPhoto', 'insuredAadharCardPhoto'].forEach(key => {
                if (iDocs[key] && Array.isArray(iDocs[key])) {
                    allImages = [...allImages, ...iDocs[key].map(img => ({ ...img, category: key }))];
                }
            });
            // Witness Docs
            if (data.witnessDetails) {
                data.witnessDetails.forEach(w => {
                    if (w.witnessPhoto) allImages = [...allImages, ...w.witnessPhoto.map(img => ({ ...img, category: `Witness: ${w.witnessName}` }))];
                    if (w.witnessDocument) {
                        w.witnessDocument.forEach(d => {
                            if (d.front) allImages.push({ ...d.front, category: `${w.witnessName} ${d.title} Front` });
                            if (d.back) allImages.push({ ...d.back, category: `${w.witnessName} ${d.title} Back` });
                        });
                    }
                });
            }

            if (allImages.length > 0) {
                children.push(createHeading("12. Photographs"));

                // Process images in batches to prevent memory overflow
                const BATCH_SIZE = 10;
                const processedImages = [];

                for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
                    const batch = allImages.slice(i, i + BATCH_SIZE);
                    const batchResults = await Promise.all(
                        batch.map(async (img) => {
                            if (img.imageUrl) {
                                try {
                                    const b64 = await convertImageToBase64(img.imageUrl);
                                    return { ...img, b64 };
                                } catch (e) {
                                    console.error(`Failed to process image: ${img.imageUrl}`, e);
                                    return null;
                                }
                            }
                            return null;
                        })
                    );
                    processedImages.push(...batchResults);

                    // Allow garbage collection between batches
                    if (i + BATCH_SIZE < allImages.length) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }

                const validImages = processedImages.filter(i => i && i.b64);

                const imageRows = [];
                let rowCells = [];
                validImages.forEach((img, idx) => {
                    const imgPara = new Paragraph({
                        children: [new ImageRun({
                            data: img.b64,
                            transformation: { width: 250, height: 180 }
                        })],
                        alignment: AlignmentType.CENTER
                    });
                    const txtPara = new Paragraph({
                        text: img.category || img.title || `Image ${idx + 1}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    });

                    rowCells.push(new TableCell({
                        children: [imgPara, txtPara],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        borders: { style: BorderStyle.NONE } // Clean look
                    }));

                    if (rowCells.length === 2) {
                        imageRows.push(new TableRow({ children: rowCells }));
                        rowCells = [];
                    }
                });
                // Leftover
                if (rowCells.length > 0) {
                    imageRows.push(new TableRow({ children: rowCells }));
                }

                children.push(new Table({
                    rows: imageRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    }
                }));
            }

            // Generate
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: children,
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun("Theft Investigation Report - Page "),
                                        new TextRun({ children: [PageNumber.CURRENT] }),
                                        new TextRun(" of "),
                                        new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                })
                            ],
                        }),
                    },
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `Theft_Report_${data.summaryOfTheClaim?.claimNo || "Draft"}.docx`);
            toast.success("Report generated successfully!");

        } catch (error) {
            console.error("Doc Gen Error:", error);
            toast.error("Failed to generate report.");
        } finally {
            setIsGenerating(false);
            toast.dismiss(toastId);
        }
    }, []);

    return { generateDocx, isGenerating };
};


import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";
import { getCurrentDate, convertImageToBase64 } from "../utils/helper";

export const useODCasePdf = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = useCallback(async (data, sectionsConfig) => {
        if (!data) {
            toast.error("No data available to generate PDF");
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading("Generating PDF...");

        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.text("OD Case Details", 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${getCurrentDate()}`, 14, 28);

            let yPos = 35;

            for (const [key, config] of Object.entries(sectionsConfig)) {
                const sectionData = data[key];
                const sectionFields = config.fields || {};
                const sectionFiles = config.fileFields || {};

                const hasData = Object.keys(sectionFields).some(k => sectionData && sectionData[k]);
                const hasFiles = Object.keys(sectionFiles).length > 0 && Object.keys(sectionFiles).some(k => sectionData && sectionData[k]);

                if (!hasData && !hasFiles) continue;

                // Section Header in PDF
                doc.setFontSize(14);
                doc.setTextColor(40);

                // Check page break
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.text(config.label, 14, yPos);
                yPos += 10;

                // Data Table
                if (hasData) {
                    const tableBody = [];
                    // Filter out keys that are marked as file fields
                    const keys = Object.keys(sectionFields).filter(k => !sectionFiles[k]);

                    for (const k of keys) {
                        const label = k.replace(/([A-Z])/g, " $1").trim().toUpperCase();
                        const val = sectionData ? sectionData[k] : "-";
                        tableBody.push([label, val]);
                    }

                    if (tableBody.length > 0) {
                        autoTable(doc, {
                            startY: yPos,
                            head: [['Field', 'Value']],
                            body: tableBody,
                            theme: 'grid',
                            headStyles: { fillColor: [243, 244, 246], textColor: 20 },
                            styles: { fontSize: 10, cellPadding: 3 },
                            columnStyles: {
                                0: { fontStyle: 'bold', cellWidth: 80 }
                            },
                            margin: { left: 14, right: 14 }
                        });
                        yPos = doc.lastAutoTable.finalY + 10;
                    }
                }

                // Images
                if (hasFiles) {
                    if (yPos > 240) {
                        doc.addPage();
                        yPos = 20;
                    }
                    doc.setFontSize(12);
                    doc.text("Attachments", 14, yPos);
                    yPos += 10;

                    for (const [fieldKey, isFile] of Object.entries(sectionFiles)) {
                        if (!isFile) continue;
                        const val = sectionData ? sectionData[fieldKey] : null;
                        if (!val) continue;

                        // We need to handle async image loading carefully in loop
                        // For arrays
                        const imageItems = Array.isArray(val) ? val : [val];

                        for (let i = 0; i < imageItems.length; i++) {
                            const item = imageItems[i];
                            const imgUrl = typeof item === "string" ? item : item?.imageUrl;
                            if (!imgUrl) continue;

                            try {
                                const base64 = await convertImageToBase64(imgUrl);
                                if (base64) {
                                    if (yPos > 200) {
                                        doc.addPage();
                                        yPos = 20;
                                    }
                                    // Add image
                                    // We assume PNG for now as safety default or try to detect
                                    // doc.addImage supports base64
                                    doc.addImage(base64, "PNG", 14, yPos, 80, 60);
                                    doc.setFontSize(9);
                                    doc.text(`${fieldKey} ${i + 1}`, 14, yPos + 65);
                                    yPos += 75;
                                }
                            } catch (e) {
                                console.error("PDF Image error", e);
                            }
                        }
                    }
                }

                yPos += 5; // Spacing after section
            }

            // Save
            doc.save(`OD_Case_${getCurrentDate().replace(/\./g, "-")}.pdf`);
            toast.success("PDF Generated Successfully!", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate PDF", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return { generatePdf, isGenerating };
};

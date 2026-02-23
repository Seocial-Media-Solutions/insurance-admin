// src/hooks/usePdfGenerator.js

import { useState } from "react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCurrentDate } from "../utils/helper";

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPdf = async (investigation) => {
    if (!investigation) {
      toast.error("Investigation data is not available.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating PDF Report... 📄");

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const usableWidth = pageWidth - 2 * margin;

      // Helper function to check if new page is needed
      const checkPageBreak = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
          return true;
        }
        return false;
      };

      // Helper function to add page numbers
      const addPageNumbers = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        }
      };

      // --- LETTERHEAD ---
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("The New India Assurance Co. Ltd", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 7;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Claim Tie-up Hub (NON-SUIT)", pageWidth / 2, yPos, {
        align: "center",
      });
      yPos += 5;

      doc.setFontSize(9);
      doc.text(
        "C-18, Vaishali Marg, Near Sogani Jewellers, Vaishali Nagar, Jaipur, Rajasthan - 302021",
        pageWidth / 2,
        yPos,
        { align: "center", maxWidth: usableWidth }
      );
      yPos += 5;

      // Underline
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Date and Reference
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Dt. ${getCurrentDate()}`, margin, yPos);
      yPos += 6;

      doc.setFont("helvetica", "normal");
      doc.text("Our Ref. No.: ", margin, yPos);
      doc.text("JPR/NIA-Tie up Hub-OD/24-25 /010", margin + 25, yPos);
      yPos += 10;

      // Recipient Address
      const recipient = [
        "To,",
        "Manager,",
        "Claim Tie-up Hub (NON-SUIT),",
        "The New India Assurance Co. Ltd,",
        "C-18, Vaishali Marg, Near Sogani Jewellers,",
        "Vaishali Nagar, Jaipur,",
        "Rajasthan - 302021",
      ];

      recipient.forEach((line) => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 5;

      // Subject
      doc.setFont("helvetica", "bold");
      doc.text("Ref: OD Investigation Report for claim of: - N/A", margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      const introText =
        "In reference to the subject Own damage claim, we have been appointed as an Investigator. Our investigation report as follows:";
      const introLines = doc.splitTextToSize(introText, usableWidth);
      doc.text(introLines, margin, yPos);
      yPos += introLines.length * 5 + 10;

      // --- CLAIM SUMMARY SECTION ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Claim Summary", margin, yPos);
      yPos += 8;

      const claimSummaryData = [
        ["Vehicle No.", "N/A"],
        ["Claim No.", "N/A"],
        ["Policy No.", "N/A"],
        ["Policy Duration", "N/A"],
        ["Close Proximity", "N/A"],
        ["Insured Name", "N/A"],
        ["Insured's Contact No.", "N/A"],
        ["Name of the said driver", "N/A"],
        ["Date of loss & Time (As per claim Form)", "N/A"],
        ["Date of FIR Details", "N/A"],
        ["General Diary Details", "N/A"],
        ["Make & Model", "N/A"],
        ["Chassis No.", "N/A"],
        ["Engine No.", "N/A"],
        ["Date of claim intimated to company", "N/A"],
        ["Delay Intimation", "N/A"],
        ["Investigator Name", "N/A"],
        ["Vehicle Damages", "N/A"],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: claimSummaryData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 70 },
          1: { cellWidth: 110 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Accident Summary
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Summary of accident as per claim form:", margin, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.text("N/A", margin, yPos);
      yPos += 10;

      // --- INSURED CUM DRIVER DETAILS ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Insured cum driver Details", margin, yPos);
      yPos += 8;

      const driverDetailsData = [
        ["Name of Insured", "N/A"],
        ["PAN Card", "N/A"],
        ["Aadhar Card No.", "N/A"],
        ["Address of Insured as per RC", "N/A"],
        ["Address of Insured as per Aadhar Card", "N/A"],
        ["Insured Profession", "N/A"],
        ["Driver injured or not", "N/A"],
        ["Driver relationship", "N/A"],
        [
          "Attested Letter Copy from the Driver with Sign Across his Photograph",
          "N/A",
        ],
        ["Driver Confirmation", "N/A"],
        ["Obtained Google GPS Timeline", "N/A"],
        ["Any Photos/Videos taken by insured and anyone", "N/A"],
        ["Emp. Stability", "N/A"],
        ["DL details/ Any Endorsements", "N/A"],
        ["Name of RTO (Licencing Authority) from DL is issued", "N/A"],
        ["Eligible to drive", "N/A"],
        ["Validity details", "N/A"],
      ];

      autoTable(doc, {
        startY: yPos,
        body: driverDetailsData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 80 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Need to take account of how many Injuries and death in the accident",
        margin,
        yPos
      );
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.text("N/A", margin, yPos);
      yPos += 10;

      // --- VEHICLE DETAILS ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Vehicle Details", margin, yPos);
      yPos += 8;

      const vehicleDetailsData = [
        ["Vehicle Registration no.", "N/A"],
        ["Name of Registered Owner", "N/A"],
        ["New Vehicle Invoice Details (Purchase)", "N/A"],
        ["Make & Model", "N/A"],
        ["Registration Date", "N/A"],
        ["Year of manufacture", "N/A"],
        ["Chassis No.", "N/A"],
        ["Engine No.", "N/A"],
        ["HYP Details", "N/A"],
        ["MV Tax details (Tax from)", "N/A"],
        ["Permit", "N/A"],
        ["Fitness", "N/A"],
        ["Body type", "N/A"],
        ["Seating Capacity", "N/A"],
        ["Owner Serial Number", "N/A"],
      ];

      autoTable(doc, {
        startY: yPos,
        body: vehicleDetailsData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 80 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // --- MEETING WITH INSURED DETAILS ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Details of meeting with Insured", margin, yPos);
      yPos += 8;

      const meetingDetailsData = [
        ["Insured introduction (name, address, profession, age)", "N/A"],
        ["Vehicle information (Reg. no./ make model)", "N/A"],
        ["Date and time of loss", "N/A"],
        ["Travelling from where ___ to where___", "N/A"],
        ["Purpose of travel", "N/A"],
        ["Accident version-- exact loss location details", "N/A"],
      ];

      autoTable(doc, {
        startY: yPos,
        body: meetingDetailsData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 80 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Statements
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Statement of the Insured's / deceased Wife:", margin, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.text("N/A", margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "italic");
      doc.text("Statement enclosed.", margin, yPos);
      yPos += 10;

      const additionalMeetingData = [
        [
          "Accident details as per Occupant- True version of statement submitted not brief",
          "N/A",
        ],
        [
          "How Insured/driver rehabilitated from loss location to ______ by _________?",
          "N/A",
        ],
        ["After accident first contact details?", "N/A"],
        [
          "Police intimation details (clarification for delay in intimating FIR)",
          "N/A",
        ],
        [
          "Photos to be exchanged via Bluetooth or snapshot of insured mobile",
          "N/A",
        ],
      ];

      autoTable(doc, {
        startY: yPos,
        body: additionalMeetingData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 80 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Witness Statement
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Statement of the witness:", margin, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.text("N/A", margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "italic");
      doc.text("Statement enclosed.", margin, yPos);
      yPos += 10;

      // --- POLICY & BREAK-IN DETAILS ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Policy & Break in Details", margin, yPos);
      yPos += 8;

      const policyData = [
        ["Policy No.", "N/A"],
        ["Policy period", "N/A"],
        ["Policy type", "N/A"],
        ["IDV", "N/A"],
        ["Previous Policy No.", "N/A"],
        ["Previous Policy period", "N/A"],
        ["Previous Insurer", "N/A"],
        ["Previous Policy Type", "N/A"],
        ["Verified Policy in previous insurance co.", "N/A"],
        ["Any claim reported in previous policy", "N/A"],
        ["Photographs available of previous claim", "N/A"],
        ["Break in", "N/A"],
        ["Break in Inspection date (if yes)", "N/A"],
        ["Odometer reading at the time of break in", "N/A"],
        ["Any discrepancy in break in and damaged photo", "N/A"],
      ];

      autoTable(doc, {
        startY: yPos,
        body: policyData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 80 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // --- GARAGE VISIT DETAILS ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Garage Visit", margin, yPos);
      yPos += 8;

      const garageData = [
        ["Vehicle Inspected", "N/A"],
        ["Place of Inspection", "N/A"],
        ["Insured vehicle last service date (Pvt Car and CV only)", "N/A"],
        [
          "Co-relating the damages on vehicle with the description of accident provided by the insured / nominee of the driver claim form and the statement",
          "N/A",
        ],
        [
          "Inspection of vehicle to find traces of blood/ hair/any other body parts",
          "N/A",
        ],
        [
          "Towing vendor details (towed from ______ to _______ by whom date and time)",
          "N/A",
        ],
        ["Job card date and details", "N/A"],
        [
          "Vehicle status if the difference between garage entry and date of loss is more than 24 hrs.",
          "N/A",
        ],
      ];

      autoTable(doc, {
        startY: yPos,
        body: garageData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 80 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // --- POLICE RECORD DETAILS ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Police record details", margin, yPos);
      yPos += 8;

      const policeData = [
        ["Name of Police Station", "N/A"],
        ["FIR No./ NCR No.", "N/A"],
        ["PMR", "N/A"],
        ["Hospital Records", "N/A"],
        ["Injury Details (Insured/Driver/ TP)", "N/A"],
      ];

      autoTable(doc, {
        startY: yPos,
        body: policeData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 80 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // GD Entry
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Details of GD entry received from the police under RTI as follows:",
        margin,
        yPos
      );
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.text("N/A", margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "italic");
      doc.text("GD Entry report Enclosed.", margin, yPos);
      yPos += 10;

      // --- ACTUAL INVESTIGATION DATA ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Actual Investigation Data Available", margin, yPos);
      yPos += 8;

      const actualDetailsData = [
        ["Assignment ID", investigation.assignmentId?.$oid || "N/A"],
        ["Case ID", investigation.caseId?.$oid || "N/A"],
        [
          "Investigation Date",
          investigation.investigationDate
            ? new Date(investigation.investigationDate.$date).toLocaleDateString()
            : "N/A",
        ],
        ["Investigation Time", investigation.investigationTime || "N/A"],
        ["Location Visited", investigation.locationVisited || "N/A"],
        ["Status", investigation.status || "N/A"],
        [
          "Submitted Date",
          investigation.submittedDate
            ? new Date(investigation.submittedDate.$date).toLocaleDateString()
            : "N/A",
        ],
      ];

      autoTable(doc, {
        startY: yPos,
        body: actualDetailsData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 70 },
          1: { cellWidth: 110 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Investigation Summary
      if (investigation.investigationSummary) {
        checkPageBreak(20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Investigation Summary:", margin, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(
          investigation.investigationSummary,
          usableWidth
        );
        doc.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * 5 + 10;
      }

      // Observations
      if (investigation.observations) {
        checkPageBreak(20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Observations:", margin, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        const obsLines = doc.splitTextToSize(
          investigation.observations,
          usableWidth
        );
        doc.text(obsLines, margin, yPos);
        yPos += obsLines.length * 5 + 10;
      }

      // Recommendations
      if (investigation.recommendations) {
        checkPageBreak(20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Recommendations:", margin, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        const recLines = doc.splitTextToSize(
          investigation.recommendations,
          usableWidth
        );
        doc.text(recLines, margin, yPos);
        yPos += recLines.length * 5 + 10;
      }

      // --- PEOPLE/PERSONS INTERVIEWED ---
      if (investigation.people && investigation.people.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Persons Interviewed (Available Data)", margin, yPos);
        yPos += 8;

        investigation.people.forEach((person, index) => {
          checkPageBreak(40);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(
            `Person ${index + 1}: ${person.personName || "N/A"}`,
            margin,
            yPos
          );
          yPos += 8;

          const personData = [
            ["Name", person.personName || "N/A"],
            ["Age", person.age ? person.age.toString() : "N/A"],
            ["Gender", person.gender || "N/A"],
            ["Phone", person.phone || "N/A"],
            ["Address", person.address || "N/A"],
            ["Relation with Case", person.relationWithCase || "N/A"],
            ["Statement", person.statement || "N/A"],
          ];

          autoTable(doc, {
            startY: yPos,
            body: personData,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
              0: { fontStyle: "bold", fillColor: [243, 244, 246], cellWidth: 70 },
              1: { cellWidth: 110 },
            },
            margin: { left: margin, right: margin },
          });

          yPos = doc.lastAutoTable.finalY + 10;

          // Person's Documents
          if (person.documents && person.documents.length > 0) {
            checkPageBreak(20);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("Documents:", margin, yPos);
            yPos += 5;
            doc.setFont("helvetica", "normal");

            person.documents.forEach((doc_item, docIndex) => {
              const docText = `${docIndex + 1}. ${doc_item.documentType || "Document"} - ${doc_item.documentNumber || "N/A"}`;
              doc.text(docText, margin + 5, yPos);
              yPos += 5;

              if (doc_item.description) {
                doc.setFont("helvetica", "italic");
                const descLines = doc.splitTextToSize(
                  `Description: ${doc_item.description}`,
                  usableWidth - 5
                );
                doc.text(descLines, margin + 5, yPos);
                yPos += descLines.length * 5;
                doc.setFont("helvetica", "normal");
              }
            });
            yPos += 5;
          }
        });
      }

      // --- OBSERVATION, FINDINGS & CONCLUSION ---
      checkPageBreak(40);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Observation, Findings & Conclusion", margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const observations = [
        "N/A - No observation data available in the investigation record.",
        "N/A - No findings data available in the investigation record.",
        "N/A - No conclusion data available in the investigation record.",
      ];

      observations.forEach((obs, index) => {
        checkPageBreak(10);
        const obsLines = doc.splitTextToSize(`${index + 1}. ${obs}`, usableWidth);
        doc.text(obsLines, margin, yPos);
        yPos += obsLines.length * 5 + 3;
      });
      yPos += 10;

      // --- OPINION SECTION ---
      checkPageBreak(20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Opinion", margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "N/A - No opinion data available in the investigation record.",
        margin,
        yPos
      );
      yPos += 10;

      // --- ENCLOSURES SECTION ---
      checkPageBreak(60);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Enclosures:", margin, yPos);
      yPos += 8;

      const enclosures = [
        ["RC Verification", "N/A"],
        ["DL extract (Insured Cum Driver)", "N/A"],
        ["Statement Insured's wife", "N/A"],
        ["Insured's wife photo while holding/writing the statement", "N/A"],
        ["Insured's neighbour statement", "N/A"],
        ["Insured's neighbour photo while holding/writing the statement", "N/A"],
        ["GD Diary Entry", "N/A"],
        ["Vehicle photo's", "N/A"],
        ["Court certified Charge Sheet", "N/A"],
      ];

      autoTable(doc, {
        startY: yPos,
        body: enclosures,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 130 },
          1: { cellWidth: 50 },
        },
        margin: { left: margin, right: margin },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // --- SUPPORTING IMAGES SECTION ---
      if (investigation.images && investigation.images.length > 0) {
        doc.addPage();
        yPos = 20;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Available Investigation Images", margin, yPos);
        yPos += 10;

        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(
          "(Note: Image display in PDF requires base64 conversion - images listed below)",
          margin,
          yPos
        );
        yPos += 10;

        investigation.images.forEach((image, index) => {
          checkPageBreak(15);
          doc.setFont("helvetica", "normal");
          doc.text(
            `${index + 1}. ${image.description || `Image ${index + 1}`}`,
            margin,
            yPos
          );
          yPos += 5;
          if (image.photo?.imageUrl) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.text(`URL: ${image.photo.imageUrl}`, margin + 5, yPos);
            yPos += 5;
            doc.setFontSize(9);
          }
          yPos += 3;
        });
      }

      // --- FOOTER NOTE ---
      doc.addPage();
      yPos = pageHeight / 2;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(
        "This report is issued without Prejudice",
        pageWidth / 2,
        yPos,
        { align: "center" }
      );
      yPos += 30;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("For Satyendra Kumar Garg", pageWidth - margin - 20, yPos, {
        align: "right",
      });
      yPos += 10;
      doc.text("Signature", pageWidth - margin - 20, yPos, { align: "right" });

      // Add page numbers to all pages
      addPageNumbers();

      // Save the PDF
      doc.save(
        `Investigation_Report_${investigation._id?.$oid || "unknown"}_${getCurrentDate().replace(/\//g, "-")}.pdf`
      );

      toast.success("✅ PDF report generated successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error("❌ Failed to generate PDF report. See console for details.", {
        id: toastId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { downloadPdf, isGeneratingPdf: isGenerating };
};
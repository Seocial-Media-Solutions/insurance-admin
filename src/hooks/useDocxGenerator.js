// src/hooks/useDocxGenerator.js

import { useState } from "react";
import { toast } from "react-hot-toast";
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
} from "https://esm.sh/docx@8.5.0";
import saveAs from "https://esm.sh/file-saver@2.0.5";
import { getCurrentDate, convertImageToBase64 } from "../utils/helper";

export const useDocxGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadDocx = async (investigation) => {
    if (!investigation) {
      toast.error("Investigation data is not available.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating DOCX file... 📄");

    try {
      // Gather all image URLs
      const imageUrls = new Set();
      investigation.people?.forEach((person) => {
        if (person.photo?.imageUrl) imageUrls.add(person.photo.imageUrl);
        person.documents?.forEach((doc) => {
          if (doc.documentPhoto?.front?.imageUrl)
            imageUrls.add(doc.documentPhoto.front.imageUrl);
          if (doc.documentPhoto?.back?.imageUrl)
            imageUrls.add(doc.documentPhoto.back.imageUrl);
        });
      });
      investigation.images?.forEach((img) => {
        if (img.photo?.imageUrl) imageUrls.add(img.photo.imageUrl);
      });

      // Convert all unique images to base64
      const imagePromises = Array.from(imageUrls).map((url) =>
        convertImageToBase64(url).then((base64) => ({ url, base64 }))
      );
      const resolvedImages = await Promise.all(imagePromises);
      const imageMap = new Map(
        resolvedImages.map((img) => [img.url, img.base64])
      );

      // Document Structure Definition
      const createHeading = (text) =>
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_3,
          style: "Heading3",
          border: {
            bottom: { color: "auto", space: 1, value: "single", size: 6 },
          },
          spacing: { after: 200 },
        });

      const createSubHeading = (text) =>
        new Paragraph({
          children: [
            new TextRun({
              text: text,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 200, after: 100 },
        });

      const createSummaryTableRow = (label, value) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, bold: true })],
                }),
              ],
              shading: { fill: "F3F4F6" },
              width: { size: 35, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(value || "N/A")],
              width: { size: 65, type: WidthType.PERCENTAGE },
            }),
          ],
        });

      const createTwoColumnTableRow = (label, value) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, bold: true })],
                }),
              ],
              shading: { fill: "F3F4F6" },
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(value || "N/A")],
              width: { size: 60, type: WidthType.PERCENTAGE },
            }),
          ],
        });

      let docChildren = [];

      // --- HEADER SECTION ---
      const letterheadTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "The New India Assurance Co. Ltd",
                        bold: true,
                        size: 28,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Claim Tie-up Hub (NON-SUIT)",
                        size: 22,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "C-18, Vaishali Marg, Near Sogani Jewellers, Vaishali Nagar, Jaipur, Rajasthan - 302021",
                        size: 20,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                borders: { bottom: { style: "single", size: 8, color: "000000" } },
              }),
            ],
          }),
        ],
      });

      docChildren.push(letterheadTable);
      docChildren.push(new Paragraph({ text: "" }));

      // Date and Reference
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Dt. ${getCurrentDate()}`,
              bold: true,
            }),
          ],
        })
      );

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Our Ref. No.: ",
              bold: true,
            }),
            new TextRun({
              text: "JPR/NIA-Tie up Hub-OD/24-25 /010",
            }),
          ],
        })
      );

      docChildren.push(new Paragraph({ text: "" }));

      // Recipient
      docChildren.push(new Paragraph({ text: "To,", spacing: { after: 100 } }));
      docChildren.push(new Paragraph({ text: "Manager,", spacing: { after: 100 } }));
      docChildren.push(
        new Paragraph({ text: "Claim Tie-up Hub (NON-SUIT),", spacing: { after: 100 } })
      );
      docChildren.push(
        new Paragraph({
          text: "The New India Assurance Co. Ltd,",
          spacing: { after: 100 },
        })
      );
      docChildren.push(
        new Paragraph({
          text: "C-18, Vaishali Marg, Near Sogani Jewellers,",
          spacing: { after: 100 },
        })
      );
      docChildren.push(
        new Paragraph({
          text: "Vaishali Nagar, Jaipur,",
          spacing: { after: 100 },
        })
      );
      docChildren.push(new Paragraph({ text: "Rajasthan - 302021", spacing: { after: 200 } }));

      // Subject
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Ref: OD Investigation Report for claim of: - N/A",
              bold: true,
            }),
          ],
          spacing: { after: 200 },
        })
      );

      docChildren.push(
        new Paragraph({
          text: "In reference to the subject Own damage claim, we have been appointed as an Investigator. Our investigation report as follows:",
          spacing: { after: 400 },
        })
      );

      // --- CLAIM SUMMARY SECTION ---
      docChildren.push(createHeading("Claim Summary"));

      const claimSummaryRows = [
        createSummaryTableRow("Vehicle No.", investigation?.caseId?.vehicleNo || "N/A"),
        createSummaryTableRow("Claim No.", investigation?.caseId?.coClaimNo || "N/A"),
        createSummaryTableRow("Policy No.", investigation?.caseId?.policyNo || "N/A"),
        createSummaryTableRow("Policy Duration", investigation?.caseId?.policyPeriod || "N/A"),
        createSummaryTableRow("Close Proximity", investigation?.caseId?.closeProximity || "N/A"),
        createSummaryTableRow("Insured Name", investigation?.caseId?.nameOfInsured || "N/A"),
        createSummaryTableRow("Insured's Contact No.", investigation?.caseId?.contactNo || "N/A"),
        createSummaryTableRow("Name of the said driver", investigation?.people?.[0]?.personName || "N/A"),
        createSummaryTableRow("Date of loss & Time (As per claim Form)", investigation?.caseId?.dateOfLoss || "N/A"),
        createSummaryTableRow("Date of FIR Details", investigation?.caseId?.firDate || "N/A"),
        createSummaryTableRow("General Diary Details", investigation?.caseId?.generalDiary || "N/A"),
        createSummaryTableRow("Make & Model", investigation?.caseId?.makeModel || "N/A"),
        createSummaryTableRow("Chassis No.", investigation?.caseId?.chassisNo || "N/A"),
        createSummaryTableRow("Engine No.", investigation?.caseId?.engineNo || "N/A"),
        createSummaryTableRow("Date of claim intimated to company", investigation?.caseId?.dtCaseSub || "N/A"),
        createSummaryTableRow("Delay Intimation", investigation?.caseId?.delayIntimation || "N/A"),
        createSummaryTableRow("Investigator Name", investigation?.fieldExecutiveId?.fullName || "N/A"),
        createSummaryTableRow("Vehicle Damages", investigation?.images?.length ? `${investigation.images.length} photos uploaded` : "N/A"),
      ];


      const claimSummaryTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: claimSummaryRows,
      });

      docChildren.push(claimSummaryTable);
      docChildren.push(new Paragraph({ text: "" }));

      // Accident Summary
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Summary of accident as per claim form:",
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      docChildren.push(
        new Paragraph({
          text: "N/A",
          spacing: { after: 400 },
        })
      );

  // --- INSURED CUM DRIVER DETAILS ---
docChildren.push(createHeading("Insured cum driver Details"));

const insured = investigation?.caseId;
const driver = investigation?.people?.find(p => p.relationWithCase?.toLowerCase() === "driver") 
             || investigation?.people?.[0]; // fallback to first person if no explicit driver

// Helper functions
const getDocument = (person, type) =>
  person?.documents?.find(doc => doc.documentType?.toLowerCase() === type.toLowerCase())?.documentNumber || "N/A";

const driverDetailsRows = [
  createTwoColumnTableRow("Name of Insured", insured?.nameOfInsured || "N/A"),
  createTwoColumnTableRow("PAN Card", getDocument(driver, "PAN Card")),
  createTwoColumnTableRow("Aadhar Card No.", getDocument(driver, "Aadhar Card")),
  createTwoColumnTableRow("Address of Insured as per RC", insured?.addressOfInsured || "N/A"),
  createTwoColumnTableRow("Address of Insured as per Aadhar Card", driver?.address || "N/A"),
  createTwoColumnTableRow("Insured Profession", insured?.profession || "N/A"),
  createTwoColumnTableRow("Driver injured or not", driver?.injuredStatus || "N/A"),
  createTwoColumnTableRow("Driver relationship", driver?.relationWithCase || "N/A"),
  createTwoColumnTableRow("Attested Letter Copy from the Driver with Sign Across his Photograph", driver?.documents?.length ? "Available" : "Not Available"),
  createTwoColumnTableRow("Driver Confirmation", driver?.confirmationStatus || "N/A"),
  createTwoColumnTableRow("Obtained Google GPS Timeline", investigation?.gpsTimelineObtained || "N/A"),
  createTwoColumnTableRow("Any Photos/Videos taken by insured and anyone", investigation?.mediaAvailable ? "Yes" : "No"),
  createTwoColumnTableRow("Emp. Stability", insured?.employmentStatus || "N/A"),
  createTwoColumnTableRow("DL details/ Any Endorsements", getDocument(driver, "Driving License")),
  createTwoColumnTableRow("Name of RTO (Licencing Authority) from DL is issued", driver?.rtoName || "N/A"),
];


      // DL Validity Table
      const dlValidityRow = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Eligible to drive", bold: true })],
              }),
            ],
            shading: { fill: "F3F4F6" },
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("N/A")],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("N/A")],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
        ],
      });

      const dlValidityDetailsRow = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "validity details", bold: true })],
              }),
            ],
            shading: { fill: "F3F4F6" },
          }),
          new TableCell({
            children: [new Paragraph("N/A")],
          }),
          new TableCell({
            children: [new Paragraph("N/A")],
          }),
        ],
      });

      const driverDetailsTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [...driverDetailsRows, dlValidityRow, dlValidityDetailsRow],
      });

      docChildren.push(driverDetailsTable);

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Need to take account of how many Injuries and death in the accident",
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      docChildren.push(
        new Paragraph({
          text: "N/A",
          spacing: { after: 400 },
        })
      );

      docChildren.push(createHeading("Vehicle Details"));

const vehicle = investigation?.caseId || {};

// optional helper (for readability)
const safe = (val) => val || "N/A";

const vehicleDetailsRows = [
  createTwoColumnTableRow("Vehicle Registration No.", safe(vehicle.vehicleNo)),
  createTwoColumnTableRow("Name of Registered Owner", safe(vehicle.nameOfInsured)),
  createTwoColumnTableRow("New Vehicle Invoice Details (Purchase)", safe(vehicle.billNo ? `Bill No: ${vehicle.billNo}, Amount: ₹${vehicle.feeBillRs}` : "N/A")),
  createTwoColumnTableRow("Make & Model", safe(vehicle.makeModel)),
  createTwoColumnTableRow("Registration Date", safe(vehicle.registrationDate)),
  createTwoColumnTableRow("Year of Manufacture", safe(vehicle.yearOfManufacture)),
  createTwoColumnTableRow("Chassis No.", safe(vehicle.chassisNo)),
  createTwoColumnTableRow("Engine No.", safe(vehicle.engineNo)),
  createTwoColumnTableRow("HYP Details", safe(vehicle.hypDetails)),
  createTwoColumnTableRow("MV Tax Details (Tax from)", safe(vehicle.mvTaxFrom)),
  createTwoColumnTableRow("Permit", safe(vehicle.permitDetails)),
  createTwoColumnTableRow("Fitness", safe(vehicle.fitnessDetails)),
  createTwoColumnTableRow("Body Type", safe(vehicle.bodyType)),
  createTwoColumnTableRow("Seating Capacity", safe(vehicle.seatingCapacity)),
  createTwoColumnTableRow("Owner Serial Number", safe(vehicle.ownerSerialNo)),
];


      const vehicleDetailsTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: vehicleDetailsRows,
      });

      docChildren.push(vehicleDetailsTable);
      docChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));

      // --- MEETING WITH INSURED DETAILS ---
      docChildren.push(createHeading("Details of meeting with Insured"));

      const meetingDetailsRows = [
        createTwoColumnTableRow("Insured introduction (name, address, profession, age)", "N/A"),
        createTwoColumnTableRow("Vehicle information (Reg. no./ make model)", "N/A"),
        createTwoColumnTableRow("Date and time of loss", "N/A"),
        createTwoColumnTableRow("Travelling from where ___ to where___", "N/A"),
        createTwoColumnTableRow("Purpose of travel", "N/A"),
        createTwoColumnTableRow("Accident version-- exact loss location details", "N/A"),
      ];

      const meetingDetailsTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: meetingDetailsRows,
      });

      docChildren.push(meetingDetailsTable);

      // Statements
      docChildren.push(createSubHeading("Statement of the Insured's / deceased Wife:"));
      docChildren.push(new Paragraph({ text: "N/A", spacing: { after: 200 } }));
      docChildren.push(new Paragraph({ text: "Statement enclosed.", italic: true, spacing: { after: 200 } }));

      const additionalMeetingRows = [
        createTwoColumnTableRow("Accident details as per Occupant- True version of statement submitted not brief", "N/A"),
        createTwoColumnTableRow("How Insured/driver rehabilitated from loss location to ______ by _________?", "N/A"),
        createTwoColumnTableRow("After accident first contact details?", "N/A"),
        createTwoColumnTableRow("Police intimation details (clarification for delay in intimating FIR)", "N/A"),
        createTwoColumnTableRow("Photos to be exchanged via Bluetooth or snapshot of insured mobile", "N/A"),
      ];

      const additionalMeetingTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: additionalMeetingRows,
      });

      docChildren.push(additionalMeetingTable);

      // Witness Statement
      docChildren.push(createSubHeading("Statement of the witness:"));
      docChildren.push(new Paragraph({ text: "N/A", spacing: { after: 200 } }));
      docChildren.push(new Paragraph({ text: "Statement enclosed.", italic: true, spacing: { after: 400 } }));

      // --- POLICY & BREAK-IN DETAILS ---
      docChildren.push(createHeading("Policy & Break in Details"));

      const policyRows = [
        createTwoColumnTableRow("Policy No.", "N/A"),
        createTwoColumnTableRow("Policy period", "N/A"),
        createTwoColumnTableRow("Policy type", "N/A"),
        createTwoColumnTableRow("IDV", "N/A"),
        createTwoColumnTableRow("Previous Policy No.", "N/A"),
        createTwoColumnTableRow("Previous Policy period", "N/A"),
        createTwoColumnTableRow("Previous Insurer", "N/A"),
        createTwoColumnTableRow("Previous Policy Type", "N/A"),
        createTwoColumnTableRow("Verified Policy in previous insurance co.", "N/A"),
        createTwoColumnTableRow("Any claim reported in previous policy", "N/A"),
        createTwoColumnTableRow("Photographs available of previous claim", "N/A"),
        createTwoColumnTableRow("Break in", "N/A"),
        createTwoColumnTableRow("Break in Inspection date (if yes)", "N/A"),
        createTwoColumnTableRow("Odometer reading at the time of break in", "N/A"),
        createTwoColumnTableRow("Any discrepancy in break in and damaged photo", "N/A"),
      ];

      const policyTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: policyRows,
      });

      docChildren.push(policyTable);
      docChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));

      // --- GARAGE VISIT DETAILS ---
      docChildren.push(createHeading("Garage Visit"));

      const garageRows = [
        createTwoColumnTableRow("Vehicle Inspected", "N/A"),
        createTwoColumnTableRow("Place of Inspection", "N/A"),
        createTwoColumnTableRow("Insured vehicle last service date (Pvt Car and CV only)", "N/A"),
        createTwoColumnTableRow("Co-relating the damages on vehicle with the description of accident provided by the insured / nominee of the driver claim form and the statement", "N/A"),
        createTwoColumnTableRow("Inspection of vehicle to find traces of blood/ hair/any other body parts", "N/A"),
        createTwoColumnTableRow("Towing vendor details (towed from ______ to _______ by whom date and time)", "N/A"),
        createTwoColumnTableRow("Job card date and details", "N/A"),
        createTwoColumnTableRow("Vehicle status if the difference between garage entry and date of loss is more than 24 hrs.", "N/A"),
      ];

      const garageTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: garageRows,
      });

      docChildren.push(garageTable);
      docChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));

      // --- POLICE RECORD DETAILS ---
      docChildren.push(createHeading("Police record details"));

      const policeRows = [
        createTwoColumnTableRow("Name of Police Station", "N/A"),
        createTwoColumnTableRow("FIR No./ NCR No.", "N/A"),
        createTwoColumnTableRow("PMR", "N/A"),
        createTwoColumnTableRow("Hospital Records", "N/A"),
        createTwoColumnTableRow("Injury Details (Insured/Driver/ TP)", "N/A"),
      ];

      const policeTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: policeRows,
      });

      docChildren.push(policeTable);

      // GD Entry
      docChildren.push(createSubHeading("Details of GD entry received from the police under RTI as follows:"));
      docChildren.push(new Paragraph({ text: "N/A", spacing: { after: 200 } }));
      docChildren.push(new Paragraph({ text: "GD Entry report Enclosed.", italic: true, spacing: { after: 400 } }));

      // --- ACTUAL INVESTIGATION DATA SECTION ---
      docChildren.push(createHeading("Actual Investigation Data Available"));

      // Basic Investigation Details
      const actualDetailsRows = [
        createSummaryTableRow("Assignment ID", investigation.assignmentId?.$oid || "N/A"),
        createSummaryTableRow("Case ID", investigation.caseId?.$oid || "N/A"),
        createSummaryTableRow("Investigation Date", investigation.investigationDate ? new Date(investigation.investigationDate.$date).toLocaleDateString() : "N/A"),
        createSummaryTableRow("Investigation Time", investigation.investigationTime || "N/A"),
        createSummaryTableRow("Location Visited", investigation.locationVisited || "N/A"),
        createSummaryTableRow("Status", investigation.status || "N/A"),
        createSummaryTableRow("Submitted Date", investigation.submittedDate ? new Date(investigation.submittedDate.$date).toLocaleDateString() : "N/A"),
      ];

      const actualDetailsTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: actualDetailsRows,
      });

      docChildren.push(actualDetailsTable);

      // Investigation Summary
      if (investigation.investigationSummary) {
        docChildren.push(createSubHeading("Investigation Summary"));
        docChildren.push(new Paragraph({ text: investigation.investigationSummary, spacing: { after: 200 } }));
      }

      // Observations
      if (investigation.observations) {
        docChildren.push(createSubHeading("Observations"));
        docChildren.push(new Paragraph({ text: investigation.observations, spacing: { after: 200 } }));
      }

      // Recommendations
      if (investigation.recommendations) {
        docChildren.push(createSubHeading("Recommendations"));
        docChildren.push(new Paragraph({ text: investigation.recommendations, spacing: { after: 200 } }));
      }

      // --- PEOPLE/PERSONS INTERVIEWED ---
      if (investigation.people && investigation.people.length > 0) {
        docChildren.push(createHeading("Persons Interviewed (Available Data)"));

        investigation.people.forEach((person, index) => {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Person ${index + 1}: ${person.personName || "N/A"}`,
                  bold: true,
                  size: 20,
                }),
              ],
              spacing: { before: 200, after: 100 },
            })
          );

          const personDetailsRows = [
            createSummaryTableRow("Name", person.personName || "N/A"),
            createSummaryTableRow("Age", person.age ? person.age.toString() : "N/A"),
            createSummaryTableRow("Gender", person.gender || "N/A"),
            createSummaryTableRow("Phone", person.phone || "N/A"),
            createSummaryTableRow("Address", person.address || "N/A"),
            createSummaryTableRow("Relation with Case", person.relationWithCase || "N/A"),
            createSummaryTableRow("Statement", person.statement || "N/A"),
          ];

          const personDetailsTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: personDetailsRows,
          });

          docChildren.push(personDetailsTable);

          // Person's Documents
          if (person.documents && person.documents.length > 0) {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Documents:",
                    bold: true,
                  }),
                ],
                spacing: { before: 150, after: 100 },
              })
            );

            person.documents.forEach((doc, docIndex) => {
              docChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${docIndex + 1}. ${doc.documentType || "Document"} - ${doc.documentNumber || "N/A"}`,
                    }),
                  ],
                  spacing: { after: 50 },
                })
              );

              if (doc.description) {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Description: ${doc.description}`,
                        italic: true,
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );
              }
            });
          }

          docChildren.push(new Paragraph({ text: "" })); // Spacing between persons
        });
      }

      // --- OBSERVATION, FINDINGS & CONCLUSION ---
      docChildren.push(createHeading("Observation, Findings & Conclusion"));

      const observations = [
        "N/A - No observation data available in the investigation record.",
        "N/A - No findings data available in the investigation record.",
        "N/A - No conclusion data available in the investigation record."
      ];

      observations.forEach((obs, index) => {
        docChildren.push(
          new Paragraph({
            text: `${index + 1}. ${obs}`,
            spacing: { after: 150 },
          })
        );
      });

      docChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));

      // --- OPINION SECTION ---
      docChildren.push(createHeading("Opinion"));

      docChildren.push(
        new Paragraph({
          text: "N/A - No opinion data available in the investigation record.",
          spacing: { after: 400 },
        })
      );

      // --- ENCLOSURES SECTION ---
      docChildren.push(createHeading("Enclosures:"));

      const enclosures = [
        "RC Verification",
        "DL extract (Insured Cum Driver)",
        "Statement Insured's wife",
        "Insured's wife photo while holding/writing the statement",
        "Insured's neighbour statement",
        "Insured's neighbour photo while holding/writing the statement",
        "GD Diary Entry",
        "Vehicle photo's",
        "Court certified Charge Sheet"
      ];

      const enclosureRows = enclosures.map(enclosure =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(enclosure)],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph("N/A")],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
          ],
        })
      );

      const enclosureTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: enclosureRows,
      });

      docChildren.push(enclosureTable);
      docChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));

      // --- SUPPORTING IMAGES SECTION ---
      if (investigation.images && investigation.images.length > 0) {
        docChildren.push(createHeading("Available Investigation Images"));

        const imageRows = [];
        let rowCells = [];

        investigation.images.forEach((image, index) => {
          if (image.photo?.imageUrl && imageMap.has(image.photo.imageUrl)) {
            const imgParagraph = new Paragraph({
              children: [
                new ImageRun({
                  data: imageMap.get(image.photo.imageUrl),
                  transformation: { width: 300, height: 200 },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            });

            const captionParagraph = new Paragraph({
              text: `(${image.description || `Image ${index + 1}`})`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            });

            // Push both image and caption into one cell
            rowCells.push(
              new TableCell({
                children: [imgParagraph, captionParagraph],
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
              })
            );

            // Once we have 2 cells, create a row
            if (rowCells.length === 2) {
              imageRows.push(new TableRow({ children: rowCells }));
              rowCells = [];
            }
          }
        });

        // If odd number of images, add an empty cell for last one
        if (rowCells.length === 1) {
          rowCells.push(new TableCell({ children: [] }));
          imageRows.push(new TableRow({ children: rowCells }));
        }

        docChildren.push(
          new Table({
            rows: imageRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
          })
        );
      }


      // --- FOOTER NOTE ---
      docChildren.push(
        new Paragraph({
          text: "This report is issued without Prejudice",
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 200 },
        })
      );

      docChildren.push(
        new Paragraph({
          text: "For Satyendra Kumar Garg",
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
        })
      );

      docChildren.push(
        new Paragraph({
          text: "Signature",
          alignment: AlignmentType.RIGHT,
        })
      );

      // Create the Document instance
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "Heading3",
              name: "Heading 3",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { bold: true, size: 24 },
            },
          ],
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1000,
                  right: 1000,
                  bottom: 1000,
                  left: 1000,
                },
              },
            },
            footers: {
              default: new Footer({
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
              }),
            },
            children: docChildren,
          },
        ],
      });

      // Use Packer to generate a blob and save
      const blob = await Packer.toBlob(doc);
      saveAs(
        blob,
        `Investigation_Report_${investigation._id?.$oid || "unknown"}_${getCurrentDate().replace(/\//g, '-')}.docx`
      );

      toast.success("✅ DOCX report generated successfully!", { id: toastId });
    } catch (err) {
      console.error("DOCX Generation Error:", err);
      toast.error("❌ Failed to generate DOCX report. See console for details.", {
        id: toastId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { downloadDocx, isGeneratingDocx: isGenerating };
};
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    SectionType,
    PageBreak,
    AlignmentType,
    HeadingLevel,
} from "https://esm.sh/docx@8.5.0";
import saveAs from "https://esm.sh/file-saver@2.0.5";
import { useState } from "react";
import { toast } from "react-hot-toast";

/**
 * Hook to generate a grouped image report in DOCX format.
 * Follows SOLID principles and established stability patterns for docx@8.5.0.
 */
export const useImageReportGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    /**
     * Groups an array of image objects by their ID.
     * Large groups are split into chunks of 10 to satisfy memory and limit requirements.
     * 
     * @param {Array} images - Array of { id, image (base64/ArrayBuffer) }
     * @returns {Object} Grouped and chunked images
     */
    const groupAndChunkImages = (images) => {
        const groups = {};
        const CHUNK_SIZE = 10;

        images.forEach((item) => {
            if (!groups[item.id]) {
                groups[item.id] = [];
            }
            groups[item.id].push(item.image);
        });

        // Split large groups into chunks of 10
        const chunkedGroups = {};
        Object.entries(groups).forEach(([id, imageList]) => {
            chunkedGroups[id] = [];
            for (let i = 0; i < imageList.length; i += CHUNK_SIZE) {
                chunkedGroups[id].push(imageList.slice(i, i + CHUNK_SIZE));
            }
        });

        return chunkedGroups;
    };

    /**
     * Creates a Paragraph containing a single image with a page break.
     * 
     * @param {string|ArrayBuffer} imageData - Image data
     * @returns {Paragraph} Compliant Paragraph object
     */
    const createImageParagraph = (imageData) => {
        return new Paragraph({
            children: [
                new PageBreak(),
                new ImageRun({
                    data: imageData,
                    transformation: {
                        width: 600,
                        height: 450, // Default 4:3 ratio for 600px width
                    },
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
        });
    };

    /**
     * Main generation function.
     * 
     * @param {Array} inputImages - [{ id, image }]
     * @param {string} fileName - Output filename
     */
    const generateImageReport = async (inputImages, fileName = "Image_Report.docx") => {
        if (!inputImages || inputImages.length === 0) {
            toast.error("No images provided for report generation.");
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading("Processing images for DOCX... 🖼️");

        try {
            const chunkedGroups = groupAndChunkImages(inputImages);
            const sections = [];

            // Process each ID group
            for (const [id, chunks] of Object.entries(chunkedGroups)) {
                // Process each 10-image chunk as a separate section/view
                for (let i = 0; i < chunks.length; i++) {
                    const currentChunk = chunks[i];
                    const chunkLabel = chunks.length > 1 ? ` (Part ${i + 1})` : "";
                    
                    const sectionChildren = [
                        // Group Heading
                        new Paragraph({
                            children: [new TextRun({ text: `Group ID: ${id}${chunkLabel}`, bold: true, size: 32 })],
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                        }),
                    ];

                    // Add images to this section
                    currentChunk.forEach((imgData) => {
                        sectionChildren.push(createImageParagraph(imgData));
                    });

                    // Define section
                    sections.push({
                        properties: {
                            type: SectionType.NEXT_PAGE,
                        },
                        children: sectionChildren,
                    });

                    // Small delay between chunks to let event loop breathe (prevent UI freeze)
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            // Create Document
            const doc = new Document({
                title: "Grouped Image Report",
                description: "Automated Image Grouping Report",
                sections: sections,
            });

            // Generate Blob and Download
            const blob = await Packer.toBlob(doc);
            saveAs(blob, fileName);
            
            toast.success("Image report generated successfully!");
        } catch (error) {
            console.error("DOCX Image Generation Error:", error);
            toast.error("An error occurred while generating the image report.");
        } finally {
            setIsGenerating(false);
            toast.dismiss(toastId);
        }
    };

    return { generateImageReport, isGenerating };
};

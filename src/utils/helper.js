// src/utils/helpers.js

// Helper function to format date
export const formatDate = (date) => {
  if (!date) return "N/A";
  
  // Handle MongoDB $date objects
  const dateValue = (typeof date === 'object' && date.$date) ? date.$date : date;
  
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "N/A";
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

// Helper function to format date and time (useful for loss timestamps)
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  
  const dateValue = (typeof date === 'object' && date.$date) ? date.$date : date;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "N/A";
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

// Helper function to get current date
export const getCurrentDate = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

// Helper function to convert an image URL to a base64 string with compression
const blobToCompressedBase64 = async (blob, sourceLabel = "blob") => (
  new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
          return;
        }

        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height = (height * MAX_SIZE) / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = (width * MAX_SIZE) / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        URL.revokeObjectURL(objectUrl);
        resolve(base64.split(",")[1]);
      } catch (err) {
        console.error("Canvas error for image source:", sourceLabel, err);
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.error("Image load error for source:", sourceLabel);
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  })
);

export const getImageSource = (image) => {
  if (!image) return null;
  if (typeof image === "string" || image instanceof Blob) return image;

  return (
    image.imageUrl ||
    image.url ||
    image.previewUrl ||
    image.secure_url ||
    image.src ||
    image.file ||
    null
  );
};

export const convertImageToBase64 = async (source) => {
  const imageSource = getImageSource(source);

  if (!imageSource) {
    return null;
  }

  try {
    if (imageSource instanceof Blob) {
      return await blobToCompressedBase64(imageSource, imageSource.name || "local-file");
    }

    const response = await fetch(imageSource, { mode: "cors" });
    const blob = await response.blob();
    return await blobToCompressedBase64(blob, imageSource);
  } catch (err) {
    console.error("Error fetching or converting image:", imageSource, err);
    return null;
  }
};

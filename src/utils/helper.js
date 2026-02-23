// src/utils/helpers.js

// Helper function to format date
export const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
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
export const convertImageToBase64 = (url) => {
  return new Promise(async (resolve) => {
    try {
      // Using a proxy or ensuring CORS is enabled on the server is crucial
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();

      // Create an image element to get dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);

      img.onload = () => {
        try {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 800px on longest side)
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

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression (0.7 quality)
          const base64 = canvas.toDataURL('image/jpeg', 0.7);

          // Clean up
          URL.revokeObjectURL(objectUrl);

          // Return base64 without data URL prefix
          resolve(base64.split(",")[1]);
        } catch (err) {
          console.error("Canvas error for URL:", url, err);
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.error("Image load error for URL:", url);
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      img.src = objectUrl;
    } catch (err) {
      console.error("Error fetching or converting image:", url, err);
      resolve(null);
    }
  });
};
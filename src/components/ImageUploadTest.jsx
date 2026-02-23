import React, { useState } from 'react';
import axios from 'axios';
import { API } from '../utils/api';

const ImageUploadTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = API;

  // Upload Single Image
  const handleSingleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(response.data);
      console.log('Upload Success:', response.data);
    } catch (error) {
      console.error('Upload Error:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.message || 'Upload failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload Multiple Images
  const handleMultipleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(`${API_BASE}/upload/multiple`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(response.data);
      console.log('Multiple Upload Success:', response.data);
    } catch (error) {
      console.error('Multiple Upload Error:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.message || 'Upload failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Image
  const handleDeleteImage = async (publicId) => {
    if (!publicId) {
      alert('Please enter Public ID');
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE}/upload`, {
        data: { publicId }
      });
      setUploadResult(response.data);
      console.log('Delete Success:', response.data);
    } catch (error) {
      console.error('Delete Error:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.message || 'Delete failed'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📁 Image Upload APIs Test</h2>
      
      {/* Single File Upload */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Upload Single Image</h3>
        <div className="flex flex-col space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleSingleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Single Image'}
          </button>
        </div>
      </div>

      {/* Multiple Files Upload */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Upload Multiple Images</h3>
        <div className="flex flex-col space-y-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          <button
            onClick={handleMultipleUpload}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Upload Multiple Images'}
          </button>
        </div>
      </div>

      {/* Delete Image */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Delete Image</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Enter Public ID to delete"
            onChange={(e) => setUploadResult({ ...uploadResult, deletePublicId: e.target.value })}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleDeleteImage(uploadResult?.deletePublicId)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Delete Image
          </button>
        </div>
      </div>

      {/* Results */}
      {uploadResult && (
        <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h4 className="font-semibold mb-2">Result:</h4>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ImageUploadTest;
import React, { useState } from 'react';

const DashboardContent = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User', id: null };
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!user.id) {
      setUploadStatus('❌ User ID not found. Please log in again.');
      return;
    }

    if (!selectedFile) {
      setUploadStatus('⚠️ Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('user', user.id);           // Send user ID
    formData.append('image', selectedFile);     // Send image file

    try {
      const response = await fetch('http://localhost:8000/api/userimages/upload/', {
        method: 'POST',
        body: formData
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (response.ok) {
          setUploadStatus('✅ Image uploaded successfully!');
          setSelectedFile(null);
          console.log('Upload Response:', data);
        } else {
          setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
        }
      } else {
        setUploadStatus('❌ Server error: Unexpected response format.');
        console.error('Expected JSON but got:', await response.text());
      }
    } catch (err) {
      setUploadStatus(`❌ Upload failed: ${err.message}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome, {user.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Upload Skin Image</h2>
          <p className="text-gray-600 mb-4">Start a new diagnosis by uploading an image.</p>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleUpload}
          >
            Upload Image
          </button>

          {uploadStatus && (
            <p className="mt-3 text-sm text-gray-700">{uploadStatus}</p>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Last Diagnosis</h2>
          <p className="text-gray-600">No recent results found.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;

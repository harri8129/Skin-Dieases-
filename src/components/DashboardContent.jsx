import React, { useEffect,useState } from 'react';

const DashboardContent = () => {
  // const user = JSON.parse(localStorage.getItem('user')) || { username: 'User', id: null };
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [llmDetails, setLlmDetails] = useState(null);
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
  //   setUser(storedUser);
  // }, []);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadStatus('');
  
    if (file) {
      const preview = URL.createObjectURL(file); // Generate preview URL
      setPreviewUrl(preview);
    }
  };


  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('⚠️ Please select an image first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', selectedFile); // ✅ only send the image
  
    try {
      const response = await fetch('http://localhost:8000/api/userimages/upload/', {
        method: 'POST',
        body: formData,
        credentials: 'include', // ✅ send session cookie
      });
  
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
  
        if (response.ok) {
          setUploadStatus('✅ Image uploaded successfully!');
          setSelectedFile(null);
          setPreviewUrl(null);
  
          const disease = data.predicted_disease;
          const conf = data.confidence;
          const uploadedImageId = data.image?.id;
  
          setPrediction(disease || 'Prediction not available');
          setConfidence(conf !== undefined ? conf.toFixed(2) : null);
          setUploadedImageUrl(data.image?.image || null);
  
          // Call LLM info generator
          setIsLoadingLLM(true);
          const llmRes = await fetch(
            `http://localhost:8000/api/disease-info/${uploadedImageId}/generate-info/`,
            {
              method: 'POST',
              credentials: 'include', // ✅ send cookie again
            }
          );
  
          const llmData = await llmRes.json();
          setIsLoadingLLM(false);
  
          if (llmRes.ok) {
            setLlmDetails({
              symptoms: llmData.data.symptoms,
              remedies: llmData.data.remedies,
              cure: llmData.data.cure,
              prevention: llmData.data.prevention,
            });
          }
        } else {
          setUploadStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (err) {
      setUploadStatus(`❌ Upload failed: ${err.message}`);
    }
  };

  return (
    <div>
      {/* <h1 className="text-3xl font-bold text-gray-800 mb-4">
         {user ? `Welcome, ${user.username}` : "Welcome, Guest"}
      </h1> */}

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

          {/* ✅ Image Preview */}
          {previewUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Image Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-48 h-48 object-cover border rounded"
              />
            </div>
          )}

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

        {/* Result Card */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Last Diagnosis</h2>

          {prediction ? (
            <>
              {uploadedImageUrl && (
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="w-48 h-48 object-cover border rounded mb-4"
                />
              )}
              <p className="text-green-700 font-medium">
                🧬 Predicted Disease: <strong>{prediction}</strong>
              </p>
              {confidence && (
                <p className="text-blue-600 mt-2">
                  🔬 Confidence: <strong>{confidence}%</strong>
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-600">No recent results found.</p>
          )}
      </div>
    </div>

            {/* LLM Details Section */}
      {isLoadingLLM && (
        <div className="bg-white rounded-lg p-6 shadow mt-6 text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Generating AI-based report...</p>
          </div>
        </div>
      )}

      {!isLoadingLLM && llmDetails && (
        <div className="bg-white rounded-lg p-6 shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">AI-Generated Disease Information</h2>
          <p><strong>🧬 Disease:</strong> {prediction}</p>
          <p><strong>🩺 Symptoms:</strong> {llmDetails.symptoms}</p>
          <p><strong>💊 Remedies:</strong> {llmDetails.remedies}</p>
          <p><strong>✅ Cure:</strong> {llmDetails.cure}</p>
          <p><strong>🛡 Prevention:</strong> {llmDetails.prevention}</p>
        </div>
      )}

    </div>
  );
};

export default DashboardContent;

import React, { useState } from 'react';
import './XRayData.css';

const XRayData = () => {
  const [numImages, setNumImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!numImages || numImages === 0) {
      setError('Please select at least 1 image to generate');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Trigger file download through browser
      window.location.href = `http://127.0.0.1:6002/xray_generate?count=${numImages}`;
      
      // Reset loading after a short delay to account for download start
      setTimeout(() => setLoading(false), 1000);
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to generate X-Ray images');
      setLoading(false);
    }
  };

  // Calculate warning message based on number of images
  const getTimeWarning = () => {
    if (!numImages || numImages === 0) {
      return "⚠️ Please select at least 1 image to generate";
    } else if (numImages > 500) {
      return "⚠️ Generating over 500 images may take several minutes";
    } else if (numImages > 100) {
      return "⚠️ This may take a minute or two";
    } else if (numImages > 50) {
      return "⚠️ This may take a moment";
    }
    return null;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setNumImages('');
    } else {
      const num = parseInt(value);
      if (!isNaN(num)) {
        setNumImages(Math.min(1000, num));
      }
    }
  };

  return (
    <div className="xray-container">
      <div className="xray-header">
        <h1>X-Ray Image Generation</h1>
        <p>Generate synthetic chest X-Ray images using our advanced AI model</p>
      </div>

      <div className="xray-content">
        <div className="generation-section">
          <div className="input-group">
            <label htmlFor="numImages">Number of images to generate:</label>
            <input
              type="number"
              id="numImages"
              min="0"
              max="1000"
              value={numImages}
              onChange={handleInputChange}
              className="number-input"
            />
          </div>

          {getTimeWarning() && (
            <div className={`time-warning ${(!numImages || numImages === 0) ? 'warning-error' : ''}`}>
              {getTimeWarning()}
            </div>
          )}

          <button 
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !numImages || numImages === 0}
          >
            {loading ? 'Generating...' : 'Generate X-Ray Images'}
          </button>

          {error && <div className="error-message">{error}</div>}

          {loading && (
            <div className="loading-container">
              <div className="loader"></div>
              <p>
                Generating {numImages} X-Ray image{numImages > 1 ? 's' : ''}...
                {numImages > 50 && <br />}
                {numImages > 50 && <span className="loading-note">This may take a while for large batches</span>}
              </p>
            </div>
          )}

          <div className="info-section">
            <h3>About Generated X-Rays</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-icon">🔍</span>
                <p>High-quality synthetic chest X-Ray images</p>
              </div>
              <div className="info-item">
                <span className="info-icon">📊</span>
                <p>Generate up to 1000 images at once</p>
              </div>
              <div className="info-item">
                <span className="info-icon">⏱️</span>
                <p>Generation time varies with batch size</p>
              </div>
              <div className="info-item">
                <span className="info-icon">💾</span>
                <p>Images delivered as a convenient ZIP file</p>
              </div>
              <div className="info-item">
                <span className="info-icon">🎯</span>
                <p>Perfect for AI training and testing</p>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <p>No patient data or privacy concerns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XRayData; 
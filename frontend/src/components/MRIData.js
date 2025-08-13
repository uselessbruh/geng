import React, { useState } from 'react';
import axios from 'axios';

const MRIData = () => {
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
      window.location.href = `http://127.0.0.1:6002/mri_generate?count=${numImages}`;
      
      // Reset loading after a short delay to account for download start
      setTimeout(() => setLoading(false), 1000);
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to generate MRI images');
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
    <div style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #2c3e50, #3498db)',
        borderRadius: '10px',
        color: 'white'
      }}>
        <h1 style={{margin: '0', fontSize: '2.5rem', marginBottom: '1rem'}}>Brain MRI Generation</h1>
        <p style={{margin: '0', fontSize: '1.2rem', opacity: '0.9'}}>Generate synthetic brain MRI images using our advanced AI model</p>
      </div>

      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <div style={{marginBottom: '1.5rem'}}>
            <label htmlFor="numImages" style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
              Number of images to generate:
            </label>
            <input
              type="number"
              id="numImages"
              min="0"
              max="1000"
              value={numImages}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '6px'
              }}
            />
          </div>

          {getTimeWarning() && (
            <div style={{
              margin: '1rem 0',
              padding: '0.75rem',
              background: (!numImages || numImages === 0) ? '#ffe4e4' : '#fff8dc',
              borderLeft: `4px solid ${(!numImages || numImages === 0) ? '#ff4d4d' : '#ffd700'}`,
              borderRadius: '4px'
            }}>
              {getTimeWarning()}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={loading || !numImages || numImages === 0}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              background: loading || !numImages || numImages === 0 ? '#94a3b8' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !numImages || numImages === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generating...' : 'Generate MRI Images'}
          </button>

          {error && (
            <div style={{
              margin: '1rem 0',
              padding: '0.75rem',
              background: '#ffe4e4',
              borderLeft: '4px solid #ff4d4d',
              borderRadius: '4px',
              color: '#cc0000'
            }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{margin: '2rem 0', textAlign: 'center'}}>
              <div style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }} />
              <p>
                Generating {numImages} MRI image{numImages > 1 ? 's' : ''}...
                {numImages > 50 && <br />}
                {numImages > 50 && <span style={{fontSize: '0.9rem', color: '#666'}}>This may take a while for large batches</span>}
              </p>
            </div>
          )}

          <div style={{marginTop: '3rem'}}>
            <h3 style={{textAlign: 'center', marginBottom: '2rem'}}>About Generated MRIs</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <InfoCard icon="🧠" text="High-quality synthetic brain MRI scans" />
              <InfoCard icon="📊" text="Generate up to 1000 images at once" />
              <InfoCard icon="⏱️" text="Generation time varies with batch size" />
              <InfoCard icon="💾" text="Images delivered as a convenient ZIP file" />
              <InfoCard icon="🎯" text="Perfect for AI training and testing" />
              <InfoCard icon="🔒" text="No patient data or privacy concerns" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, text }) => (
  <div style={{
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '8px',
    textAlign: 'center',
    transition: 'transform 0.2s'
  }}>
    <span style={{fontSize: '2rem', marginBottom: '1rem', display: 'block'}}>{icon}</span>
    <p style={{margin: '0', color: '#4a5568'}}>{text}</p>
  </div>
);

export default MRIData; 
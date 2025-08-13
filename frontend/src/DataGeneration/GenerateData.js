import React from 'react';
import { useNavigate } from "react-router-dom";
import './GenerateData.css'

const GenerateData = () => {
  const navigate = useNavigate();

  return (
    <div className='butdiv'>
      <div className='generatebuttons'>
        <div className='genbut' onClick={() => navigate("/generate-data/patient-data")}>Patient Data</div>
        <div className='genbut' onClick={() => navigate("/generate-data/xray-data")}>X-Ray Data</div>
        <div className='genbut' onClick={() => navigate("/generate-data/mri-data")}>MRI Data</div>
      </div>
    </div>
  )
}

export default GenerateData

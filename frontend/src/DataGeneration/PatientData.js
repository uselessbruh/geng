import React from 'react';
import { useNavigate } from "react-router-dom";
import './GenerateData.css'

const PatientData = () => {
  const navigate = useNavigate();

  return (
    <div className='butdiv'>
      <div className='generatebuttons'>
        <div className='genbut' onClick={() => navigate("/generate-data/patient-data/patient-info")}>Patient Information</div>
        <div className='genbut' onClick={() => navigate("/generate-data/patient-data/diagnosis-conditions")}>Diagnosis & Conditions</div>
        <div className='genbut' onClick={() => navigate("/generate-data/patient-data/medication-treatments")}>Medications & Treatments</div>
        <div className='genbut' onClick={() => navigate("/generate-data/patient-data/care-nursing")}>Care Plans & Nursing</div>
        <div className='genbut' onClick={() => navigate("/generate-data/patient-data/vital-obsv")}>Vitals & Observations</div>
        <div className='genbut' onClick={() => navigate("/generate-data/patient-data/inandout")}>Intake & Output</div>
      </div>
    </div>
  )
}

export default PatientData 
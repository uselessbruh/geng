import React, { useState } from 'react'
import './DiaAndCond.css'
import { generateSyntheticData, downloadCSV } from '../../utils/api'

const DiaAndCond = () => {
  // Column name mappings for each table
  const diagnosisMapping = {
    diagnosisid: "Diagnosis ID",
    patientunitstayid: "Patient Unit Stay ID",
    activeupondischarge: "Active Upon Discharge",
    diagnosisoffset: "Diagnosis Offset",
    diagnosisstring: "Diagnosis String",
    icd9code: "ICD9 Code",
    diagnosispriority: "Diagnosis Priority"
  }

  const allergyMapping = {
    allergyid: "Allergy ID",
    patientunitstayid: "Patient Unit Stay ID",
    allergyoffset: "Allergy Offset",
    allergyenteredoffset: "Allergy Entered Offset",
    allergynotetype: "Allergy Note Type",
    specialtytype: "Specialty Type",
    usertype: "User Type",
    rxincluded: "Rx Included",
    writtenineicu: "Written in ICU",
    drugname: "Drug Name",
    allergytype: "Allergy Type",
    allergyname: "Allergy Name",
    drughiclseqno: "Drug HICL Seq No"
  }

  const admissionDxMapping = {
    admissiondxid: "Admission DX ID",
    patientunitstayid: "Patient Unit Stay ID",
    admitdxenteredoffset: "Admit DX Entered Offset",
    admitdxpath: "Admit DX Path",
    admitdxname: "Admit DX Name",
    admitdxtext: "Admit DX Text"
  }

  // Function to get the appropriate mapping based on section
  const getColumnMapping = (section) => {
    switch(section) {
      case 'diagnosis':
        return diagnosisMapping;
      case 'allergy':
        return allergyMapping;
      case 'admissionDx':
        return admissionDxMapping;
      default:
        return {};
    }
  }

  const [numRecords, setNumRecords] = useState({
    diagnosis: 10,
    allergy: 10,
    admissionDx: 10
  })
  const [showWarning, setShowWarning] = useState({
    diagnosis: false,
    allergy: false,
    admissionDx: false
  })
  const [isValidationEnabled, setIsValidationEnabled] = useState({
    diagnosis: false,
    allergy: false,
    admissionDx: false
  })
  const [selectedColumns, setSelectedColumns] = useState({
    diagnosis: '',
    allergy: '',
    admissionDx: ''
  })
  const [loading, setLoading] = useState({
    diagnosis: false,
    allergy: false,
    admissionDx: false
  })
  const [error, setError] = useState({
    diagnosis: '',
    allergy: '',
    admissionDx: ''
  })

  const handleNumRecordsChange = (section, value) => {
    const parsedValue = parseInt(value)
    setNumRecords(prev => ({
      ...prev,
      [section]: parsedValue
    }))
    setShowWarning(prev => ({
      ...prev,
      [section]: isNaN(parsedValue) || parsedValue <= 0
    }))
  }

  const handleColumnChange = (section, value) => {
    setSelectedColumns(prev => ({
      ...prev,
      [section]: value
    }))
  }

  const handleDownload = async (section, tableName) => {
    if (showWarning[section]) return;

    setLoading(prev => ({ ...prev, [section]: true }));
    setError(prev => ({ ...prev, [section]: '' }));

    try {
      const validationColumn = isValidationEnabled[section] ? selectedColumns[section] : null;
      const data = await generateSyntheticData(tableName, numRecords[section], validationColumn);
      
      // Always download the CSV
      downloadCSV(data.csv_base64, `${tableName}_synthetic.csv`);
      
      // If validation is enabled, also show JSON preview in new tab
      if (isValidationEnabled[section]) {
        const mapping = getColumnMapping(section);
        const validationInfo = {
          data,
          tableName: section === 'diagnosis' ? 'Diagnosis Data' :
                     section === 'allergy' ? 'Allergy Data' : 'Admission Diagnosis Data',
          validationColumn: validationColumn,
          validationColumnDisplay: mapping[validationColumn] || validationColumn
        };
        const jsonString = encodeURIComponent(JSON.stringify(validationInfo));
        window.open(`/generate-data/patient-data/data-validation?data=${jsonString}`, '_blank');
      }

    } catch (err) {
      setError(prev => ({ ...prev, [section]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  }

  const renderDownloadControls = (section, columnOptions, tableName) => {
    const mapping = getColumnMapping(section);
    
    return (
      <div className='download-controls'>
        <button 
          className={`download-button ${loading[section] ? 'loading' : ''}`}
          onClick={() => handleDownload(section, tableName)}
          disabled={loading[section] || showWarning[section]}
        >
          {loading[section] ? 'Generating...' : 'Download Data'}
        </button>
        <div className='control-group'>
          <label>Number of records:</label>
          <div className='input-with-warning'>
            <input 
              type="number" 
              min="1" 
              value={numRecords[section]}
              onChange={(e) => handleNumRecordsChange(section, e.target.value)}
              className={showWarning[section] ? 'input-error' : ''}
            />
            {showWarning[section] && (
              <div className='warning-message'>
                Please enter a number greater than 0
              </div>
            )}
          </div>
        </div>
        <div className='control-group'>
          <label>
            <input 
              type="checkbox" 
              checked={isValidationEnabled[section]}
              onChange={(e) => {
                setIsValidationEnabled(prev => ({
                  ...prev,
                  [section]: e.target.checked
                }));
                if (e.target.checked && !selectedColumns[section]) {
                  handleColumnChange(section, columnOptions[0]);
                }
              }}
            />
            Validate Data
          </label>
        </div>
        {isValidationEnabled[section] && (
          <div className='control-group'>
            <label>Validation Column:</label>
            <select 
              className='validation-select' 
              value={selectedColumns[section]}
              onChange={(e) => handleColumnChange(section, e.target.value)}
            >
              {columnOptions.map((option) => (
                <option key={option} value={option}>
                  {mapping[option] || option}
                </option>
              ))}
            </select>
          </div>
        )}
        {error[section] && (
          <div className='error-message'>
            {error[section]}
          </div>
        )}
      </div>
    )
  }

  const diagnosisColumns = [
    "diagnosisid",
    "patientunitstayid",
    "activeupondischarge",
    "diagnosisoffset",
    "diagnosisstring",
    "icd9code",
    "diagnosispriority"
  ]

  const allergyColumns = [
    "allergyid",
    "patientunitstayid",
    "allergyoffset",
    "allergyenteredoffset",
    "allergynotetype",
    "specialtytype",
    "usertype",
    "rxincluded",
    "writtenineicu",
    "drugname",
    "allergytype",
    "allergyname",
    "drughiclseqno"
  ]

  const admissionDxColumns = [
    "admissiondxid",
    "patientunitstayid",
    "admitdxenteredoffset",
    "admitdxpath",
    "admitdxname",
    "admitdxtext"
  ]

  return (
    <div className='patientpage'>
      <h1 className='main-page-title'>Diagnoses & Conditions</h1>

      <div className='table-section'>
        <h2 className='patienttitle'>Diagnosis Data</h2>
        <div className='table-container'>
<table>
            <thead>
    <tr>
        <th>Diagnosis ID</th>
        <th>Patient Unit Stay ID</th>
        <th>Active Upon Discharge</th>
        <th>Diagnosis Offset</th>
        <th>Diagnosis String</th>
        <th>ICD9 Code</th>
        <th>Diagnosis Priority</th>
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>7607199</td>
        <td>346380</td>
        <td>False</td>
        <td>5028</td>
        <td>cardiovascular|ventricular disorders|hypertension</td>
        <td>"401.9, I10"</td>
        <td>Other</td>
    </tr>
    <tr>
        <td>7570429</td>
        <td>346380</td>
        <td>False</td>
        <td>685</td>
        <td>neurologic|altered mental status / pain|change in mental status</td>
        <td>"780.09, R41.82"</td>
        <td>Major</td>
    </tr>
    <tr>
        <td>7705483</td>
        <td>346380</td>
        <td>True</td>
        <td>5035</td>
        <td>cardiovascular|shock / hypotension|hypotension</td>
        <td>"458.9, I95.9"</td>
        <td>Major</td>
    </tr>
    <tr>
        <td>7848601</td>
        <td>346380</td>
        <td>True</td>
        <td>5035</td>
        <td>neurologic|altered mental status / pain|schizophrenia</td>
        <td>"295.90, F20.9"</td>
        <td>Major</td>
    </tr>
    <tr>
        <td>7451475</td>
        <td>346380</td>
        <td>False</td>
        <td>5028</td>
        <td>pulmonary|disorders of vasculature|pulmonary embolism|thrombus</td>
        <td>"415.19, I26.99"</td>
        <td>Major</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('diagnosis', diagnosisColumns, 'diagnosis')}
      </div>

      <div className='table-section'>
        <h2 className='patienttitle'>Allergy Data</h2>
        <div className='table-container'>
<table>
            <thead>
    <tr>
        <th>Allergy ID</th>
        <th>Patient Unit Stay ID</th>
        <th>Allergy Offset</th>
        <th>Allergy Entered Offset</th>
        <th>Allergy Note Type</th>
        <th>Specialty Type</th>
        <th>User Type</th>
        <th>Rx Included</th>
                <th>Written in ICU</th>
                <th>Drug Name</th>
                <th>Allergy Type</th>
                <th>Allergy Name</th>
                <th>Drug HICL Seq No</th>
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>357144</td>
        <td>243097</td>
        <td>2549</td>
        <td>2552</td>
        <td>Comprehensive Progress</td>
        <td>eCM Primary</td>
        <td>THC Nurse</td>
        <td>True</td>
                <td>True</td>
                <td>""</td>
                <td>Non Drug</td>
                <td>penicillins</td>
                <td></td>
    </tr>
    <tr>
        <td>442253</td>
        <td>243097</td>
        <td>1288</td>
        <td>1294</td>
        <td>Comprehensive Progress</td>
        <td>eCM Primary</td>
        <td>THC Nurse</td>
        <td>True</td>
                <td>True</td>
                <td>CODEINE PHOSPHATE</td>
                <td>Drug</td>
                <td>CODEINE PHOSPHATE</td>
                <td>1721</td>
    </tr>
    <tr>
        <td>357143</td>
        <td>243097</td>
        <td>2549</td>
        <td>2552</td>
        <td>Comprehensive Progress</td>
        <td>eCM Primary</td>
        <td>THC Nurse</td>
        <td>True</td>
                <td>True</td>
                <td>CODEINE PHOSPHATE</td>
                <td>Drug</td>
                <td>CODEINE PHOSPHATE</td>
                <td>1721</td>
    </tr>
    <tr>
        <td>329929</td>
        <td>243097</td>
        <td>21</td>
        <td>28</td>
        <td>Admission</td>
        <td>eCM Primary</td>
        <td>THC Nurse</td>
        <td>True</td>
                <td>True</td>
                <td>""</td>
                <td>Non Drug</td>
                <td>penicillins</td>
                <td></td>
    </tr>
    <tr>
        <td>363374</td>
        <td>243097</td>
        <td>3988</td>
        <td>3989</td>
        <td>Comprehensive Progress</td>
        <td>eCM Primary</td>
        <td>THC Nurse</td>
        <td>True</td>
        <td>True</td>
        <td>CODEINE PHOSPHATE</td>
        <td>Drug</td>
        <td>CODEINE PHOSPHATE</td>
        <td>1721</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('allergy', allergyColumns, 'allergy')}
      </div>

      <div className='table-section'>
        <h2 className='patienttitle'>Admission Diagnosis Data</h2>
        <div className='table-container'>
<table>
            <thead>
    <tr>
        <th>Admission DX ID</th>
        <th>Patient Unit Stay ID</th>
        <th>Admit DX Entered Offset</th>
        <th>Admit DX Path</th>
        <th>Admit DX Name</th>
        <th>Admit DX Text</th>
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>7351978</td>
        <td>2900423</td>
        <td>162</td>
        <td>admission diagnosis|Non-operative Organ Systems|Organ System|Cardiovascular</td>
        <td>Cardiovascular</td>
        <td>Cardiovascular</td>
    </tr>
    <tr>
        <td>7351977</td>
        <td>2900423</td>
        <td>162</td>
        <td>admission diagnosis|Was the patient admitted from the O.R. or went to the O.R. within 4 hours of admission?|No</td>
        <td>No</td>
        <td>No</td>
    </tr>
    <tr>
        <td>7351979</td>
        <td>2900423</td>
        <td>162</td>
        <td>admission diagnosis|All Diagnosis|Non-operative|Diagnosis|Cardiovascular|Sepsis, pulmonary</td>
        <td>Sepsis, pulmonary</td>
        <td>Sepsis, pulmonary</td>
    </tr>
    <tr>
        <td>7745060</td>
        <td>2902156</td>
        <td>944</td>
        <td>admission diagnosis|All Diagnosis|Non-operative|Diagnosis|Cardiovascular|Rhythm disturbance (atrial, supraventricular)</td>
        <td>Rhythm disturbance (atrial, supraventricular)</td>
        <td>Rhythm disturbance (atrial, supraventricular)</td>
    </tr>
    <tr>
        <td>7745059</td>
        <td>2902156</td>
        <td>944</td>
        <td>admission diagnosis|Non-operative Organ Systems|Organ System|Cardiovascular</td>
        <td>Cardiovascular</td>
        <td>Cardiovascular</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('admissionDx', admissionDxColumns, 'admissionDx')}
      </div>
    </div>
  )
}

export default DiaAndCond
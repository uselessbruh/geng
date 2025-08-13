import React, { useState } from 'react'
import './InAndOut.css'
import { generateSyntheticData, downloadCSV } from '../../utils/api'

const InAndOut = () => {
  const [numRecords, setNumRecords] = useState({
    intakeOutput: 10
  })
  const [showWarning, setShowWarning] = useState({
    intakeOutput: false
  })
  const [isValidationEnabled, setIsValidationEnabled] = useState({
    intakeOutput: false
  })
  const [selectedColumns, setSelectedColumns] = useState({
    intakeOutput: ''
  })
  const [loading, setLoading] = useState({
    intakeOutput: false
  })
  const [error, setError] = useState({
    intakeOutput: ''
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
      if (isValidationEnabled[section] && validationColumn) {
        const validationInfo = {
          data,
          tableName: 'Intake Output Data',
          validationColumn: validationColumn,
          validationColumnDisplay: intakeOutputMapping[validationColumn]
        };
        const jsonString = encodeURIComponent(JSON.stringify(validationInfo));
        window.open(`/generate-data/patient-data/data-validation?data=${jsonString}`, '_blank');
      }

    } catch (err) {
      console.error('Error in handleDownload:', err);
      setError(prev => ({ ...prev, [section]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  }

  const intakeOutputMapping = {
    intakeoutputid: "Intake Output ID",
    patientunitstayid: "Patient Unit Stay ID",
    intakeoutputoffset: "Intake Output Offset",
    intaketotal: "Intake Total",
    outputtotal: "Output Total",
    dialysistotal: "Dialysis Total",
    nettotal: "Net Total",
    intakeoutputentryoffset: "Entry Offset",
    cellpath: "Cell Path",
    celllabel: "Cell Label",
    cellvaluenumeric: "Numeric Value",
    cellvaluetext: "Text Value"
  }

  const intakeOutputColumns = Object.keys(intakeOutputMapping)

  const renderDownloadControls = (section, tableName, columnOptions) => (
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
            value={numRecords[section] || ''}
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
            checked={isValidationEnabled[section] || false}
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
            value={selectedColumns[section] || ''}
            onChange={(e) => handleColumnChange(section, e.target.value)}
          >
            {columnOptions.map(option => (
              <option key={option} value={option}>
                {intakeOutputMapping[option]}
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

  return (
    <div className="patientpage">
      <h1 className="main-page-title">Intake & Output</h1>

      <div className='table-section'>
        <h2 className='patienttitle'>Intake Output</h2>
        <div className='table-container'>
          <div className='table-scroll'>
<table>
              <thead>
                <tr>
                  {intakeOutputColumns.map(col => (
                    <th key={col}>{intakeOutputMapping[col]}</th>
                  ))}
    </tr>
              </thead>
              <tbody>
    <tr>
        <td>9314532</td>
        <td>147307</td>
        <td>-394</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>-394</td>
                  <td>flowsheet|Flowsheet Cell Labels|I&O|Weight|Bodyweight (lb)</td>
                  <td>Bodyweight (lb)</td>
                  <td>159.8000</td>
                  <td>159.8</td>
    </tr>
    <tr>
        <td>9314533</td>
        <td>147307</td>
        <td>-394</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>-394</td>
                  <td>flowsheet|Flowsheet Cell Labels|I&O|Weight|Bodyweight (kg)</td>
                  <td>Bodyweight (kg)</td>
                  <td>72.5000</td>
                  <td>72.5</td>
    </tr>
    <tr>
        <td>9319306</td>
        <td>211715</td>
        <td>1533</td>
        <td>120.0000</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>120.0000</td>
        <td>1533</td>
                  <td>flowsheet|Flowsheet Cell Labels|I&O|Intake (ml)|Generic Intake (ml)|P.O.</td>
                  <td>P.O.</td>
                  <td>120.0000</td>
                  <td>120</td>
    </tr>
    <tr>
        <td>9319891</td>
        <td>219981</td>
        <td>6504</td>
        <td>120.0000</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>120.0000</td>
        <td>6504</td>
                  <td>flowsheet|Flowsheet Cell Labels|I&O|Intake (ml)|Generic Intake (ml)|P.O.</td>
                  <td>P.O.</td>
                  <td>120.0000</td>
                  <td>120</td>
    </tr>
    <tr>
        <td>9319987</td>
        <td>158057</td>
        <td>624</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>0.0000</td>
        <td>624</td>
        <td>flowsheet|Flowsheet Cell Labels|I&O|Weight|Bodyweight (lb)</td>
        <td>Bodyweight (lb)</td>
        <td>359.0000</td>
        <td>359</td>
    </tr>
              </tbody>
</table>
          </div>
          {renderDownloadControls('intakeOutput', 'intakeOutput', intakeOutputColumns)}
        </div>
      </div>
    </div>
  )
}

export default InAndOut

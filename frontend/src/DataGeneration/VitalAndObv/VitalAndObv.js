import React, { useState } from 'react'
import './VitalAndObv.css'
import { generateSyntheticData, downloadCSV } from '../../utils/api'

const VitalAndObv = () => {
  const [numRecords, setNumRecords] = useState({
    nurseAssessment: 10,
    nurseCare: 10,
    nurseCharting: 10
  })
  const [showWarning, setShowWarning] = useState({
    nurseAssessment: false,
    nurseCare: false,
    nurseCharting: false
  })
  const [isValidationEnabled, setIsValidationEnabled] = useState({
    nurseAssessment: false,
    nurseCare: false,
    nurseCharting: false
  })
  const [selectedColumns, setSelectedColumns] = useState({
    nurseAssessment: '',
    nurseCare: '',
    nurseCharting: ''
  })
  const [loading, setLoading] = useState({
    nurseAssessment: false,
    nurseCare: false,
    nurseCharting: false
  })
  const [error, setError] = useState({
    nurseAssessment: '',
    nurseCare: '',
    nurseCharting: ''
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
          tableName: section === 'nurseAssessment' ? 'Nurse Assessment Data' : 
                    section === 'nurseCare' ? 'Nurse Care Data' :
                    section === 'nurseCharting' ? 'Nurse Charting Data' : section,
          validationColumn: validationColumn,
          validationColumnDisplay: section === 'nurseAssessment' ? nurseAssessmentMapping[validationColumn] :
                                section === 'nurseCare' ? nurseCareMapping[validationColumn] :
                                section === 'nurseCharting' ? nurseChartingMapping[validationColumn] : validationColumn
        };
        const jsonString = encodeURIComponent(JSON.stringify(validationInfo));
        window.open(`/generate-data/patient-data/data-validation?data=${jsonString}`, '_blank');
      }

    } catch (err) {
      console.error('Error in handleDownload:', err); // Debug log
      setError(prev => ({ ...prev, [section]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  }

  const nurseAssessmentMapping = {
    nurseassessid: "Nurse Assessment ID",
    patientunitstayid: "Patient Unit Stay ID",
    nurseassessoffset: "Assessment Offset",
    nurseassessentryoffset: "Entry Offset",
    cellattributepath: "Attribute Path",
    celllabel: "Cell Label",
    cellattribute: "Cell Attribute",
    cellattributevalue: "Attribute Value"
  }

  const nurseCareMapping = {
    nursecareid: "Nurse Care ID",
    patientunitstayid: "Patient Unit Stay ID",
    celllabel: "Cell Label",
    nursecareoffset: "Care Offset",
    nursecareentryoffset: "Entry Offset",
    cellattributepath: "Attribute Path",
    cellattribute: "Cell Attribute",
    cellattributevalue: "Attribute Value"
  }

  const nurseChartingMapping = {
    nursingchartid: "Nursing Chart ID",
    patientunitstayid: "Patient Unit Stay ID",
    nursingchartoffset: "Chart Offset",
    nursingchartentryoffset: "Entry Offset",
    nursingchartcelltypecat: "Cell Type Category",
    nursingchartcelltypevallabel: "Cell Type Value Label",
    nursingchartcelltypevalname: "Cell Type Value Name",
    nursingchartvalue: "Chart Value"
  }

  const nurseAssessmentColumns = Object.keys(nurseAssessmentMapping)
  const nurseCareColumns = Object.keys(nurseCareMapping)
  const nurseChartingColumns = Object.keys(nurseChartingMapping)

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
                {section === 'nurseAssessment' ? nurseAssessmentMapping[option] :
                 section === 'nurseCare' ? nurseCareMapping[option] :
                 section === 'nurseCharting' ? nurseChartingMapping[option] : option}
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
      <h1 className="main-page-title">Vitals & Observations</h1>

      <div className='table-section'>
        <h2 className='patienttitle'>Nurse Assessment</h2>
        <div className='table-container'>
          <div className='table-scroll'>
<table>
              <thead>
                <tr>
                  {nurseAssessmentColumns.map(col => (
                    <th key={col}>{nurseAssessmentMapping[col]}</th>
                  ))}
    </tr>
              </thead>
              <tbody>
    <tr>
        <td>57436984</td>
        <td>1054428</td>
        <td>13791</td>
        <td>13819</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Assessment|Cardiovascular|Edema|Edema</td>
        <td>Edema</td>
        <td>Edema</td>
        <td>generalized</td>
    </tr>
    <tr>
        <td>57483728</td>
        <td>1036759</td>
        <td>4075</td>
        <td>4076</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Assessment|Respiratory|Secretions|Secretions</td>
        <td>Secretions</td>
        <td>Secretions</td>
        <td>minimal</td>
    </tr>
    <tr>
        <td>57483729</td>
        <td>1036759</td>
        <td>4075</td>
        <td>4076</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Assessment|Respiratory|Secretions|Secretions</td>
        <td>Secretions</td>
        <td>Secretions</td>
        <td>thin</td>
    </tr>
    <tr>
        <td>57483730</td>
        <td>1036759</td>
        <td>4075</td>
        <td>4076</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Assessment|Respiratory|Secretions|Secretions</td>
        <td>Secretions</td>
        <td>Secretions</td>
        <td>clear</td>
    </tr>
    <tr>
        <td>57505995</td>
        <td>1054428</td>
        <td>18051</td>
        <td>18065</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Assessment|Cardiovascular|Pacemaker/AICD|Pacemaker/AICD</td>
        <td>Pacemaker/AICD</td>
        <td>Pacemaker/AICD</td>
        <td>N/A</td>
    </tr>
              </tbody>
</table>
          </div>
          {renderDownloadControls('nurseAssessment', 'nurseAssessment', nurseAssessmentColumns)}
        </div>
      </div>

      <div className='table-section'>
        <h2 className='patienttitle'>Nurse Care</h2>
        <div className='table-container'>
          <div className='table-scroll'>
<table>
              <thead>
                <tr>
                  {nurseCareColumns.map(col => (
                    <th key={col}>{nurseCareMapping[col]}</th>
                  ))}
    </tr>
              </thead>
              <tbody>
    <tr>
        <td>20977673</td>
        <td>1014000</td>
        <td>Hygiene/ADLs</td>
        <td>2151</td>
        <td>2138</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Care|Hygiene/ADLs|Hygiene/ADLs|Hygiene/ADLs</td>
        <td>Hygiene/ADLs</td>
        <td>ADLs assist</td>
    </tr>
    <tr>
        <td>20977674</td>
        <td>1014000</td>
        <td>Hygiene/ADLs</td>
        <td>2151</td>
        <td>2138</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Care|Hygiene/ADLs|Hygiene/ADLs|Hygiene/ADLs</td>
        <td>Hygiene/ADLs</td>
        <td>oral care</td>
    </tr>
    <tr>
        <td>21023628</td>
        <td>1034813</td>
        <td>Equipment</td>
        <td>1680</td>
        <td>1694</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Care|Equipment|Equipment|Equipment</td>
        <td>Equipment</td>
        <td>air mattress</td>
    </tr>
    <tr>
        <td>21023629</td>
        <td>1034813</td>
        <td>Equipment</td>
        <td>1680</td>
        <td>1694</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Care|Equipment|Equipment|Equipment</td>
        <td>Equipment</td>
        <td>heels floated</td>
    </tr>
    <tr>
        <td>21023630</td>
        <td>1034813</td>
        <td>Equipment</td>
        <td>1680</td>
        <td>1694</td>
        <td>flowsheet|Flowsheet Cell Labels|Nursing Care|Equipment|Equipment|Equipment</td>
        <td>Equipment</td>
        <td>sling</td>
    </tr>
              </tbody>
</table>
          </div>
          {renderDownloadControls('nurseCare', 'nurseCare', nurseCareColumns)}
        </div>
      </div>

      <div className='table-section'>
        <h2 className='patienttitle'>Nurse Charting</h2>
        <div className='table-container'>
          <div className='table-scroll'>
<table>
              <thead>
                <tr>
                  {nurseChartingColumns.map(col => (
                    <th key={col}>{nurseChartingMapping[col]}</th>
                  ))}
    </tr>
              </thead>
              <tbody>
    <tr>
        <td>189336686</td>
        <td>143870</td>
        <td>-67</td>
        <td>-67</td>
        <td>Other Vital Signs and Infusions</td>
        <td>Eye, Ear, Nose, Throat Assessment</td>
        <td>Value</td>
        <td>WDL</td>
    </tr>
    <tr>
        <td>187848155</td>
        <td>143870</td>
        <td>239</td>
        <td>239</td>
        <td>Other Vital Signs and Infusions</td>
        <td>Gastrointestinal Assessment</td>
        <td>Value</td>
        <td>X</td>
    </tr>
    <tr>
        <td>281610014</td>
        <td>143870</td>
        <td>433</td>
        <td>433</td>
        <td>Other Vital Signs and Infusions</td>
        <td>Pain Assessment</td>
        <td>Value</td>
        <td>WDL</td>
    </tr>
    <tr>
        <td>237860915</td>
        <td>143870</td>
        <td>433</td>
        <td>433</td>
        <td>Other Vital Signs and Infusions</td>
        <td>Neurological Assessment</td>
        <td>Value</td>
        <td>WDL</td>
    </tr>
    <tr>
        <td>265486190</td>
        <td>143870</td>
        <td>1108</td>
        <td>1108</td>
        <td>Vital Signs</td>
        <td>Respiratory Rate</td>
        <td>Respiratory Rate</td>
        <td>15</td>
    </tr>
              </tbody>
</table>
          </div>
          {renderDownloadControls('nurseCharting', 'nurseCharting', nurseChartingColumns)}
        </div>
      </div>
    </div>
  )
}

export default VitalAndObv

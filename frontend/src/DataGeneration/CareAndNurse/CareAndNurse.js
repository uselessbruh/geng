import React, { useState } from 'react'
import './CareAndNurse.css'
import { generateSyntheticData, downloadCSV } from '../../utils/api'

const CareAndNurse = () => {
  // Column mappings for all tables
  const carePlanCareProviderMapping = {
    cplcareprovderid: "Care Plan Care Provider ID",
    patientunitstayid: "Patient Unit Stay ID",
    careprovidersaveoffset: "Care Provider Save Offset",
    providertype: "Provider Type",
    specialty: "Specialty",
    interventioncategory: "Intervention Category",
    managingphysician: "Managing Physician",
    activeupondischarge: "Active Upon Discharge"
  }

  const carePlanEOLMapping = {
    cpleolid: "Plan EOL ID",
    patientunitstayid: "Patient Unit Stay ID",
    cpleolsaveoffset: "CPL EOL Save Offset",
    cpleoldiscussionoffset: "CPL EOL Discussion Offset",
    activeupondischarge: "Active Upon Discharge"
  }

  const carePlanGeneralMapping = {
    cplgeneralid: "Care Plan General ID",
    patientunitstayid: "Patient Unit Stay ID",
    activeupondischarge: "Active Upon Discharge",
    cplitemoffset: "CPL Item Offset",
    cplgroup: "CPL Group",
    cplitemvalue: "CPL Item Value"
  }

  const carePlanGoalMapping = {
    cplgoalid: "Care Plan Goal ID",
    patientunitstayid: "Patient Unit Stay ID",
    cplgoaloffset: "Goal Time Offset",
    cplgoalcategory: "Goal Category",
    cplgoalvalue: "CPL Goal Value",
    cplgoalstatus: "Goal Status",
    activeupondischarge: "Active Upon Discharge"
  }

  const carePlanInfectiousDiseaseMapping = {
    cplinfectid: "Plan Infectious Disease ID",
    patientunitstayid: "Patient Unit Stay ID",
    activeupondischarge: "Active Upon Discharge",
    cplinfectdiseaseoffset: "Disease Time Offset",
    infectdiseasesite: "Disease Site",
    infectdiseaseassessment: "Disease Assessment",
    responsetotherapy: "Response to Therapy",
    treatment: "Treatment"
  }

  // Column arrays for each table
  const carePlanCareProviderColumns = Object.keys(carePlanCareProviderMapping)
  const carePlanEOLColumns = Object.keys(carePlanEOLMapping)
  const carePlanGeneralColumns = Object.keys(carePlanGeneralMapping)
  const carePlanGoalColumns = Object.keys(carePlanGoalMapping)
  const carePlanInfectiousDiseaseColumns = Object.keys(carePlanInfectiousDiseaseMapping)

  // State management
  const [numRecords, setNumRecords] = useState({
    carePlanCareProvider: 10,
    carePlanEOL: 10,
    carePlanGeneral: 10,
    carePlanGoal: 10,
    carePlanInfectiousDisease: 10
  })
  const [showWarning, setShowWarning] = useState({
    carePlanCareProvider: false,
    carePlanEOL: false,
    carePlanGeneral: false,
    carePlanGoal: false,
    carePlanInfectiousDisease: false
  })
  const [isValidationEnabled, setIsValidationEnabled] = useState({
    carePlanCareProvider: false,
    carePlanEOL: false,
    carePlanGeneral: false,
    carePlanGoal: false,
    carePlanInfectiousDisease: false
  })
  const [selectedColumns, setSelectedColumns] = useState({
    carePlanCareProvider: '',
    carePlanEOL: '',
    carePlanGeneral: '',
    carePlanGoal: '',
    carePlanInfectiousDisease: ''
  })
  const [loading, setLoading] = useState({
    carePlanCareProvider: false,
    carePlanEOL: false,
    carePlanGeneral: false,
    carePlanGoal: false,
    carePlanInfectiousDisease: false
  })
  const [error, setError] = useState({
    carePlanCareProvider: '',
    carePlanEOL: '',
    carePlanGeneral: '',
    carePlanGoal: '',
    carePlanInfectiousDisease: ''
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
        const getMapping = (section) => {
          switch(section) {
            case 'carePlanCareProvider':
              return carePlanCareProviderMapping;
            case 'carePlanEOL':
              return carePlanEOLMapping;
            case 'carePlanGeneral':
              return carePlanGeneralMapping;
            case 'carePlanGoal':
              return carePlanGoalMapping;
            case 'carePlanInfectiousDisease':
              return carePlanInfectiousDiseaseMapping;
            default:
              return {};
          }
        }

        const columnMapping = getMapping(section);
        const validationInfo = {
          data,
          tableName: getTableName(section),
          validationColumn: validationColumn,
          validationColumnDisplay: columnMapping[validationColumn] || validationColumn
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
    const getMapping = (section) => {
      switch(section) {
        case 'carePlanCareProvider':
          return carePlanCareProviderMapping;
        case 'carePlanEOL':
          return carePlanEOLMapping;
        case 'carePlanGeneral':
          return carePlanGeneralMapping;
        case 'carePlanGoal':
          return carePlanGoalMapping;
        case 'carePlanInfectiousDisease':
          return carePlanInfectiousDiseaseMapping;
        default:
          return {};
      }
    }

    const columnMapping = getMapping(section);

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
                  {columnMapping[option] || option}
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

  const getTableName = (section) => {
    switch(section) {
      case 'carePlanCareProvider':
        return 'Care Plan Care Provider Data';
      case 'carePlanEOL':
        return 'Care Plan EOL Data';
      case 'carePlanGeneral':
        return 'Care Plan General Data';
      case 'carePlanGoal':
        return 'Care Plan Goal Data';
      case 'carePlanInfectiousDisease':
        return 'Care Plan Infectious Disease Data';
      default:
        return '';
    }
  }

  return (
    <div className='patientpage'>
      <h1 className='main-page-title'>Care Plans & Nursing</h1>

      {/* Care Plan Care Provider Table */}
      <div className='table-section'>
        <h2 className='patienttitle'>Care Plan Care Provider Data</h2>
        <div className='table-container'>
<table>
            <thead>
              <tr>
                {carePlanCareProviderColumns.map(col => (
                  <th key={col}>{carePlanCareProviderMapping[col]}</th>
                ))}
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>1124435</td>
        <td>149713</td>
        <td>11</td>
        <td></td>
                <td>family practice</td>
        <td>I</td>
        <td>Managing</td>
        <td>True</td>
    </tr>
    <tr>
        <td>1196330</td>
        <td>157016</td>
        <td>2</td>
        <td></td>
                <td>obstetrics/gynecology</td>
        <td>I</td>
        <td>Managing</td>
        <td>True</td>
    </tr>
    <tr>
        <td>1115508</td>
        <td>165840</td>
        <td>26</td>
        <td></td>
                <td>internal medicine</td>
        <td>I</td>
        <td>Managing</td>
        <td>True</td>
    </tr>
    <tr>
        <td>1153793</td>
        <td>174826</td>
        <td>49</td>
        <td></td>
                <td>critical care medicine (CCM)</td>
        <td></td>
        <td>Managing</td>
        <td>True</td>
    </tr>
    <tr>
        <td>1135321</td>
        <td>174956</td>
        <td>3</td>
        <td></td>
                <td>cardiology</td>
        <td>Unknown</td>
        <td>Managing</td>
        <td>True</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('carePlanCareProvider', carePlanCareProviderColumns, 'carePlanCareProvider')}
      </div>

      {/* Care Plan EOL Table */}
      <div className='table-section'>
        <h2 className='patienttitle'>Care Plan EOL Data</h2>
        <div className='table-container'>
<table>
            <thead>
              <tr>
                {carePlanEOLColumns.map(col => (
                  <th key={col}>{carePlanEOLMapping[col]}</th>
                ))}
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>11340</td>
        <td>1054428</td>
        <td>304</td>
        <td>0</td>
        <td>True</td>
    </tr>
    <tr>
        <td>24686</td>
        <td>1593179</td>
        <td>3992</td>
        <td>0</td>
        <td>True</td>
    </tr>
    <tr>
        <td>34322</td>
        <td>2592641</td>
        <td>3998</td>
        <td>0</td>
        <td>True</td>
    </tr>
    <tr>
        <td>35600</td>
        <td>2611237</td>
        <td>303</td>
        <td>0</td>
        <td>True</td>
    </tr>
    <tr>
        <td>35303</td>
        <td>2621948</td>
        <td>987</td>
        <td>0</td>
        <td>True</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('carePlanEOL', carePlanEOLColumns, 'carePlanEOL')}
      </div>

      {/* Care Plan General Table */}
      <div className='table-section'>
        <h2 className='patienttitle'>Care Plan General Data</h2>
        <div className='table-container'>
<table>
            <thead>
              <tr>
                {carePlanGeneralColumns.map(col => (
                  <th key={col}>{carePlanGeneralMapping[col]}</th>
                ))}
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>3665765</td>
        <td>174826</td>
        <td>True</td>
        <td>49</td>
        <td>Ventilation</td>
        <td>Spontaneous - adequate</td>
    </tr>
    <tr>
        <td>3608330</td>
        <td>174826</td>
        <td>True</td>
        <td>49</td>
        <td>Care Limitation</td>
        <td>Full therapy</td>
    </tr>
    <tr>
        <td>3466711</td>
        <td>174826</td>
        <td>True</td>
        <td>49</td>
        <td>Stress Ulcer Prophylaxis</td>
        <td>Proton pump inhibitor</td>
    </tr>
    <tr>
        <td>3666045</td>
        <td>174826</td>
        <td>True</td>
        <td>49</td>
        <td>Airway</td>
        <td>Not intubated/normal airway</td>
    </tr>
    <tr>
        <td>3772790</td>
        <td>174826</td>
        <td>True</td>
        <td>49</td>
        <td>DVT Prophylaxis</td>
        <td>Compression devices</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('carePlanGeneral', carePlanGeneralColumns, 'carePlanGeneral')}
      </div>

      {/* Care Plan Goal Table */}
      <div className='table-section'>
        <h2 className='patienttitle'>Care Plan Goal Data</h2>
        <div className='table-container'>
<table>
            <thead>
              <tr>
                {carePlanGoalColumns.map(col => (
                  <th key={col}>{carePlanGoalMapping[col]}</th>
                ))}
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>2287240</td>
        <td>1318254</td>
        <td>800</td>
        <td>Infection/Labs</td>
        <td>Normal electrolytes</td>
        <td>Active</td>
        <td>True</td>
    </tr>
    <tr>
        <td>2287241</td>
        <td>1318254</td>
        <td>800</td>
        <td>Infection/Labs</td>
        <td>Absence of sepsis</td>
        <td>Active</td>
        <td>True</td>
    </tr>
    <tr>
        <td>2287239</td>
        <td>1318254</td>
        <td>800</td>
        <td>Infection/Labs</td>
        <td>Stable Hgb and Hct</td>
        <td>Active</td>
        <td>True</td>
    </tr>
    <tr>
        <td>2287237</td>
        <td>1318254</td>
        <td>800</td>
        <td>Cardiovascular</td>
        <td>Vital signs within normal parameters</td>
        <td>Active</td>
        <td>True</td>
    </tr>
    <tr>
        <td>2370651</td>
        <td>1318254</td>
        <td>36</td>
        <td>Cardiovascular</td>
        <td>Vital signs within normal parameters</td>
        <td>Active</td>
        <td>False</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('carePlanGoal', carePlanGoalColumns, 'carePlanGoal')}
      </div>

      {/* Care Plan Infectious Disease Table */}
      <div className='table-section'>
        <h2 className='patienttitle'>Care Plan Infectious Disease Data</h2>
        <div className='table-container'>
<table>
            <thead>
              <tr>
                {carePlanInfectiousDiseaseColumns.map(col => (
                  <th key={col}>{carePlanInfectiousDiseaseMapping[col]}</th>
                ))}
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>126795</td>
        <td>3150352</td>
        <td>False</td>
        <td>191</td>
        <td>Wound</td>
        <td>Definite infection</td>
        <td>No change</td>
        <td></td>
    </tr>
    <tr>
        <td>126795</td>
        <td>3150352</td>
        <td>False</td>
        <td>191</td>
        <td>Wound</td>
        <td>Definite infection</td>
        <td>No change</td>
        <td></td>
    </tr>
    <tr>
        <td>126795</td>
        <td>3150352</td>
        <td>False</td>
        <td>191</td>
        <td>Wound</td>
        <td>Definite infection</td>
        <td>No change</td>
        <td></td>
    </tr>
    <tr>
        <td>126795</td>
        <td>3150352</td>
        <td>False</td>
        <td>191</td>
        <td>Wound</td>
        <td>Definite infection</td>
        <td>No change</td>
        <td></td>
    </tr>
    <tr>
        <td>126795</td>
        <td>3150352</td>
        <td>False</td>
        <td>191</td>
        <td>Wound</td>
        <td>Definite infection</td>
        <td>No change</td>
        <td></td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('carePlanInfectiousDisease', carePlanInfectiousDiseaseColumns, 'carePlanInfectiousDisease')}
      </div>
    </div>
  )
}

export default CareAndNurse
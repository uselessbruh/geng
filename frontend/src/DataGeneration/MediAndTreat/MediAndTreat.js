import React, { useState } from 'react'
import './MediAndTreat.css'
import { generateSyntheticData, downloadCSV } from '../../utils/api'

const MediAndTreat = () => {
  // Column name mappings for each table
  const admissionDrugMapping = {
    admissiondrugid: "Admission Drug ID",
    patientunitstayid: "Patient Unit Stay ID",
    drugoffset: "Drug Offset",
    drugenteredoffset: "Drug Entered Offset",
    drugnotetype: "Drug Note Type",
    specialtytype: "Specialty Type",
    usertype: "User Type",
    rxincluded: "Rx Included",
    writtenineicu: "Written in ICU",
    drugname: "Drug Name",
    drugdosage: "Drug Dosage",
    drugunit: "Drug Unit",
    drugadmitfrequency: "Drug Admit Frequency",
    drughiclseqno: "Drug HICL Seq No"
  }
  
  const infusionDrugMapping = {
    infusiondrugid: "Infusion Drug ID",
    patientunitstayid: "Patient Unit Stay ID",
    infusionoffset: "Infusion Offset",
    drugname: "Drug Name",
    drugrate: "Drug Rate",
    infusionrate: "Infusion Rate",
    drugamount: "Drug Amount",
    volumeoffluid: "Volume of Fluid",
    patientweight: "Patient Weight"
  }
  
  const medicationMapping = {
    medicationid: "Medication ID",
    patientunitstayid: "Patient Unit Stay ID",
    drugorderoffset: "Drug Order Offset",
    drugstartoffset: "Drug Start Offset",
    drugivadmixture: "Drug IV Admixture",
    drugordercancelled: "Drug Order Cancelled",
    drugname: "Drug Name",
    drughiclseqno: "Drug HICL Seq No",
    dosage: "Dosage",
    routeadmin: "Route of Admin",
    frequency: "Frequency",
    loadingdose: "Loading Dose",
    prn: "PRN",
    drugstopoffset: "Drug Stop Offset",
    gtc: "GTC"
  }
  
  const treatmentMapping = {
    treatmentid: "Treatment ID",
    patientunitstayid: "Patient Unit Stay ID",
    treatmentoffset: "Treatment Offset",
    treatmentstring: "Treatment String",
    activeupondischarge: "Active Upon Discharge"
  }

  // Function to get the appropriate mapping based on section
  const getColumnMapping = (section) => {
    switch(section) {
      case 'admissionDrug':
        return admissionDrugMapping;
      case 'infusionDrug':
        return infusionDrugMapping;
      case 'medication':
        return medicationMapping;
      case 'treatment':
        return treatmentMapping;
      default:
        return {};
    }
  }

  const [numRecords, setNumRecords] = useState({
    admissionDrug: 10,
    infusionDrug: 10,
    medication: 10,
    treatment: 10
  })
  const [showWarning, setShowWarning] = useState({
    admissionDrug: false,
    infusionDrug: false,
    medication: false,
    treatment: false
  })
  const [isValidationEnabled, setIsValidationEnabled] = useState({
    admissionDrug: false,
    infusionDrug: false,
    medication: false,
    treatment: false
  })
  const [selectedColumns, setSelectedColumns] = useState({
    admissionDrug: '',
    infusionDrug: '',
    medication: '',
    treatment: ''
  })
  const [loading, setLoading] = useState({
    admissionDrug: false,
    infusionDrug: false,
    medication: false,
    treatment: false
  })
  const [error, setError] = useState({
    admissionDrug: '',
    infusionDrug: '',
    medication: '',
    treatment: ''
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
          tableName: section === 'admissionDrug' ? 'Admission Drug Data' :
                     section === 'infusionDrug' ? 'Infusion Drug Data' :
                     section === 'medication' ? 'Medication Data' : 'Treatment Data',
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

  const admissionDrugColumns = [
    "admissiondrugid",
    "patientunitstayid",
    "drugoffset",
    "drugenteredoffset",
    "drugnotetype",
    "specialtytype",
    "usertype",
    "rxincluded",
    "writtenineicu",
    "drugname",
    "drugdosage",
    "drugunit",
    "drugadmitfrequency",
    "drughiclseqno"
  ]

  const infusionDrugColumns = [
    "infusiondrugid",
    "patientunitstayid",
    "infusionoffset",
    "drugname",
    "drugrate",
    "infusionrate",
    "drugamount",
    "volumeoffluid",
    "patientweight"
  ]

  const medicationColumns = [
    "medicationid",
    "patientunitstayid",
    "drugorderoffset",
    "drugstartoffset",
    "drugivadmixture",
    "drugordercancelled",
    "drugname",
    "drughiclseqno",
    "dosage",
    "routeadmin",
    "frequency",
    "loadingdose",
    "prn",
    "drugstopoffset",
    "gtc"
  ]

  const treatmentColumns = [
    "treatmentid",
    "patientunitstayid",
    "treatmentoffset",
    "treatmentstring",
    "activeupondischarge"
  ]

  return (
    <div className='patientpage'>
      <h1 className='main-page-title'>Medications & Treatments</h1>
      <div className='table-section'>
        <h2 className='patienttitle'>Admission Drug Data</h2>
        <div className='table-container'>
<table>
            <thead>
    <tr>
        <th>Admission Drug ID</th>
        <th>Patient Unit Stay ID</th>
        <th>Drug Offset</th>
        <th>Drug Entered Offset</th>
        <th>Drug Note Type</th>
        <th>Specialty Type</th>
        <th>User Type</th>
        <th>Rx Included</th>
                <th>Written in ICU</th>
                <th>Drug Name</th>
                <th>Drug Dosage</th>
                <th>Drug Unit</th>
                <th>Drug Admit Frequency</th>
                <th>Drug HICL Seq No</th>
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>1373386</td>
        <td>281479</td>
        <td>420</td>
        <td>444</td>
        <td>Daily Progress</td>
        <td>eCM Primary</td>
        <td>THC Physician</td>
        <td>False</td>
                <td>True</td>
                <td>NOVOLOG</td>
                <td>0.0000</td>
                <td></td>
                <td></td>
                <td>20769</td>
    </tr>
    <tr>
        <td>1917810</td>
        <td>281479</td>
        <td>24</td>
        <td>31</td>
        <td>Admission</td>
        <td>eCM Primary</td>
        <td>THC Nurse</td>
        <td>True</td>
                <td>True</td>
                <td>NOVOLOG</td>
                <td>0.0000</td>
                <td></td>
                <td></td>
                <td>20769</td>
    </tr>
    <tr>
        <td>2118524</td>
        <td>292154</td>
        <td>242</td>
        <td>243</td>
        <td>Daily Progress</td>
        <td>eCM Primary</td>
        <td>Other</td>
        <td>False</td>
                <td>True</td>
                <td>ALLOPURINOL</td>
                <td>0.0000</td>
                <td></td>
                <td></td>
                <td>1100</td>
    </tr>
    <tr>
        <td>1984925</td>
        <td>292154</td>
        <td>53</td>
        <td>69</td>
        <td>Admission</td>
        <td>eCM Primary</td>
        <td>THC Nurse</td>
        <td>False</td>
                <td>True</td>
                <td>DILTIAZEM 24HR CD</td>
                <td>0.0000</td>
                <td></td>
                <td></td>
                <td>182</td>
    </tr>
    <tr>
        <td>2118526</td>
        <td>292154</td>
        <td>242</td>
        <td>243</td>
        <td>Daily Progress</td>
        <td>eCM Primary</td>
        <td>Other</td>
        <td>False</td>
        <td>True</td>
        <td>CALCIUM CARBONATE</td>
        <td>0.0000</td>
        <td></td>
        <td></td>
        <td>1163</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('admissionDrug', admissionDrugColumns, 'admissiondrug')}
      </div>

      <div className='table-section'>
        <h2 className='patienttitle'>Infusion Drug Data</h2>
        <div className='table-container'>
<table>
            <thead>
    <tr>
        <th>Infusion Drug ID</th>
        <th>Patient Unit Stay ID</th>
        <th>Infusion Offset</th>
        <th>Drug Name</th>
        <th>Drug Rate</th>
        <th>Infusion Rate</th>
        <th>Drug Amount</th>
        <th>Volume of Fluid</th>
                <th>Patient Weight</th>
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>40215081</td>
        <td>1461035</td>
        <td>768</td>
        <td>Volume (mL) Magnesium  (ml/hr)</td>
        <td>25</td>
        <td></td>
        <td></td>
        <td></td>
                <td></td>
    </tr>
    <tr>
        <td>38752780</td>
        <td>1461035</td>
        <td>648</td>
        <td>Volume (mL) Magnesium  (ml/hr)</td>
        <td>25</td>
        <td></td>
        <td></td>
        <td></td>
                <td></td>
    </tr>
    <tr>
        <td>36960718</td>
        <td>1461035</td>
        <td>-1812</td>
        <td>Volume (mL) Magnesium  (ml/hr)</td>
        <td>25</td>
        <td></td>
        <td></td>
        <td></td>
                <td></td>
    </tr>
    <tr>
        <td>38679313</td>
        <td>1461035</td>
        <td>-611</td>
        <td>Volume (mL) Magnesium  (ml/hr)</td>
        <td>25.42</td>
        <td></td>
        <td></td>
        <td></td>
                <td></td>
    </tr>
    <tr>
        <td>40681648</td>
        <td>1461035</td>
        <td>828</td>
        <td>Volume (mL) Magnesium  (ml/hr)</td>
        <td>25</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('infusionDrug', infusionDrugColumns, 'infusiondrug')}
      </div>

      <div className='table-section'>
        <h2 className='patienttitle'>Medication Data</h2>
        <div className='table-container'>
<table>
            <thead>
    <tr>
        <th>Medication ID</th>
        <th>Patient Unit Stay ID</th>
        <th>Drug Order Offset</th>
        <th>Drug Start Offset</th>
        <th>Drug IV Admixture</th>
        <th>Drug Order Cancelled</th>
        <th>Drug Name</th>
        <th>Drug HICL Seq No</th>
                <th>Dosage</th>
                <th>Route of Admin</th>
                <th>Frequency</th>
                <th>Loading Dose</th>
                <th>PRN</th>
                <th>Drug Stop Offset</th>
                <th>GTC</th>
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>7278819</td>
        <td>141765</td>
        <td>134</td>
        <td>1396</td>
        <td>No</td>
        <td>No</td>
        <td>WARFARIN SODIUM 5 MG PO TABS</td>
        <td>2812</td>
                <td>5 3</td>
                <td>PO</td>
                <td></td>
                <td></td>
                <td>No</td>
                <td>2739</td>
                <td>0</td>
    </tr>
    <tr>
        <td>9726266</td>
        <td>141765</td>
        <td>1</td>
        <td>-188</td>
        <td>No</td>
        <td>No</td>
        <td>5 ML VIAL : DILTIAZEM HCL 25 MG/5ML IV SOLN</td>
        <td>182</td>
                <td>15 3</td>
                <td>IV</td>
                <td>Once PRN</td>
                <td></td>
                <td>Yes</td>
                <td>171</td>
                <td>38</td>
    </tr>
    <tr>
        <td>10293599</td>
        <td>141765</td>
        <td>115</td>
        <td>856</td>
        <td>No</td>
        <td>No</td>
        <td>ASPIRIN EC 81 MG PO TBEC</td>
        <td>1820</td>
                <td>81 3</td>
                <td>PO</td>
                <td>Daily</td>
                <td></td>
                <td>No</td>
                <td>2739</td>
                <td>0</td>
    </tr>
    <tr>
        <td>10871534</td>
        <td>141765</td>
        <td>114</td>
        <td>316</td>
        <td>No</td>
        <td>No</td>
        <td>DILTIAZEM HCL 30 MG PO TABS</td>
        <td>182</td>
                <td>30 3</td>
                <td>PO</td>
                <td>Q6H SCH</td>
                <td></td>
                <td>No</td>
                <td>2739</td>
                <td>0</td>
    </tr>
    <tr>
        <td>10128716</td>
        <td>141765</td>
        <td>115</td>
        <td>856</td>
        <td>No</td>
        <td>No</td>
        <td>LISINOPRIL 5 MG PO TABS</td>
        <td>132</td>
        <td>5 3</td>
        <td>PO</td>
        <td>Daily</td>
        <td></td>
        <td>No</td>
        <td>2428</td>
        <td>0</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('medication', medicationColumns, 'medication')}
      </div>

      <div className='table-section'>
        <h2 className='patienttitle'>Treatment Data</h2>
        <div className='table-container'>
<table>
            <thead>
    <tr>
        <th>Treatment ID</th>
        <th>Patient Unit Stay ID</th>
        <th>Treatment Offset</th>
        <th>Treatment String</th>
        <th>Active Upon Discharge</th>
    </tr>
            </thead>
            <tbody>
    <tr>
        <td>9579899</td>
        <td>242895</td>
        <td>838</td>
        <td>cardiovascular|arrhythmias|anticoagulant administration|low molecular weight heparin|enoxaparin</td>
        <td>False</td>
    </tr>
    <tr>
        <td>8788989</td>
        <td>242895</td>
        <td>512</td>
        <td>cardiovascular|consultations|Cardiology consultation</td>
        <td>False</td>
    </tr>
    <tr>
        <td>10293108</td>
        <td>242895</td>
        <td>838</td>
        <td>cardiovascular|non-operative procedures|external pacemaker</td>
        <td>False</td>
    </tr>
    <tr>
        <td>9017080</td>
        <td>242895</td>
        <td>70</td>
        <td>pulmonary|vascular disorders|VTE prophylaxis|low molecular weight heparin|enoxaparin</td>
        <td>False</td>
    </tr>
    <tr>
        <td>9853526</td>
        <td>242895</td>
        <td>70</td>
        <td>cardiovascular|consultations|Cardiology consultation</td>
        <td>False</td>
    </tr>
            </tbody>
</table>
        </div>
        {renderDownloadControls('treatment', treatmentColumns, 'treatment')}
      </div>
    </div>
  )
}

export default MediAndTreat
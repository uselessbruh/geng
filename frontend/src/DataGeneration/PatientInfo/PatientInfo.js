import React, { useState } from 'react'
import './PatientInfo.css'
import { generateSyntheticData, downloadCSV } from '../../utils/api'

const PatientInfo = () => {
    // Column name mappings for each table
    const patientMapping = {
        patientunitstayid: "Patient Unit Stay ID",
        patienthealthsystemstayid: "Patient Health System Stay ID",
        gender: "Gender",
        age: "Age",
        ethnicity: "Ethnicity",
        hospitalid: "Hospital ID",
        wardid: "Ward ID",
        apacheadmissiondx: "Apache Admission DX",
        admissionheight: "Admission Height",
        hospitaladmittime24: "Hospital Admit Time 24",
        hospitaladmitoffset: "Hospital Admit Offset",
        hospitaladmitsource: "Hospital Admit Source",
        hospitaldischargeyear: "Hospital Discharge Year",
        hospitaldischargeoffset: "Hospital Discharge Offset",
        hospitaldischargelocation: "Hospital Discharge Location",
        hospitaldischargestatus: "Hospital Discharge Status",
        unittype: "Unit Type",
        unitadmittime24: "Unit Admit Time 24",
        unitadmitsource: "Unit Admit Source",
        unitvisitnumber: "Unit Visit Number",
        unitstaytype: "Unit Stay Type",
        admissionweight: "Admission Weight",
        dischargeweight: "Discharge Weight",
        unitdischargeoffset: "Unit Discharge Offset",
        unitdischargelocation: "Unit Discharge Location",
        unitdischargestatus: "Unit Discharge Status",
        uniquepid: "Unique PID"
    }

    const apacheApsMapping = {
        apacheapsvarid: "Apache APS ID",
        patientunitstayid: "Patient Unit Stay ID",
        intubated: "Intubated",
        vent: "Ventilation",
        dialysis: "Dialysis",
        eyes: "Eyes",
        motor: "Motor",
        verbal: "Verbal",
        meds: "Meds",
        urine: "Urine",
        wbc: "WBC",
        temperature: "Temperature",
        respiratoryrate: "Respiratory Rate",
        sodium: "Sodium",
        heartrate: "Heart Rate",
        meanbp: "Mean Blood Pressure",
        ph: "PH",
        hematocrit: "Hematocrit",
        creatinine: "Creatinine",
        albumin: "Albumin",
        pao2: "PAO2",
        pco2: "PCO2",
        bun: "BUN",
        glucose: "Glucose",
        bilirubin: "Bilirubin",
        fio2: "FIO2"
    }

    const apachePredVarMapping = {
        apachepredvarid: "Apache Pred Var ID",
        patientunitstayid: "Patient Unit Stay ID",
        apacheversion: "Apache Version",
        predictedhospitalmortality: "Predicted Hospital Mortality",
        actualicumortality: "Actual ICU Mortality",
        actualhospitalmortality: "Actual Hospital Mortality",
        predictedicumortality: "Predicted ICU Mortality",
        predictediculos: "Predicted ICU LOS",
        actualiculos: "Actual ICU LOS",
        predictedhospitallos: "Predicted Hospital LOS",
        actualhospitallos: "Actual Hospital LOS",
        preopmi: "Preop MI",
        preopcardiaccath: "Preop Cardiac Cath",
        ptcawithin24h: "PTCA Within 24h",
        unabridgedunitlos: "Unabridged Unit LOS",
        unabridgedhosplos: "Unabridged Hosp LOS",
        actualventdays: "Actual Vent Days",
        predventdays: "Pred Vent Days",
        unabridgedactualventdays: "Unabridged Actual Vent Days"
    }

    // Function to get the appropriate mapping based on section
    const getColumnMapping = (section) => {
        switch(section) {
            case 'patient':
                return patientMapping;
            case 'apacheAps':
                return apacheApsMapping;
            case 'apachePredVar':
                return apachePredVarMapping;
            default:
                return {};
        }
    }

    const [numRecords, setNumRecords] = useState({
        patient: 10,
        apacheAps: 10,
        apachePredVar: 10
    })
    const [showWarning, setShowWarning] = useState({
        patient: false,
        apacheAps: false,
        apachePredVar: false
    })
    const [isValidationEnabled, setIsValidationEnabled] = useState({
        patient: false,
        apacheAps: false,
        apachePredVar: false
    })
    const [selectedColumns, setSelectedColumns] = useState({
        patient: '',
        apacheAps: '',
        apachePredVar: ''
    })
    const [loading, setLoading] = useState({
        patient: false,
        apacheAps: false,
        apachePredVar: false
    })
    const [error, setError] = useState({
        patient: '',
        apacheAps: '',
        apachePredVar: ''
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
                    tableName: section === 'patient' ? 'Patient Data' :
                              section === 'apacheAps' ? 'Apache APS Data' : 'Apache Prediction Data',
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

    const patientColumns = [
        "patientunitstayid",
        "patienthealthsystemstayid",
        "gender",
        "age",
        "ethnicity",
        "hospitalid",
        "wardid",
        "apacheadmissiondx",
        "admissionheight",
        "hospitaladmittime24",
        "hospitaladmitoffset",
        "hospitaladmitsource",
        "hospitaldischargeyear",
        "hospitaldischargeoffset",
        "hospitaldischargelocation",
        "hospitaldischargestatus",
        "unittype",
        "unitadmittime24",
        "unitadmitsource",
        "unitvisitnumber",
        "unitstaytype",
        "admissionweight",
        "dischargeweight",
        "unitdischargeoffset",
        "unitdischargelocation",
        "unitdischargestatus",
        "uniquepid"
    ]

    const apacheApsColumns = [
        "apacheapsvarid",
        "patientunitstayid",
        "intubated",
        "vent",
        "dialysis",
        "eyes",
        "motor",
        "verbal",
        "meds",
        "urine",
        "wbc",
        "temperature",
        "respiratoryrate",
        "sodium",
        "heartrate",
        "meanbp",
        "ph",
        "hematocrit",
        "creatinine",
        "albumin",
        "pao2",
        "pco2",
        "bun",
        "glucose",
        "bilirubin",
        "fio2"
    ]

    const apachePredVarColumns = [
        "apachepredvarid",
        "patientunitstayid",
        "apacheversion",
        "predictedhospitalmortality",
        "actualicumortality",
        "actualhospitalmortality",
        "predictedicumortality",
        "predictediculos",
        "actualiculos",
        "predictedhospitallos",
        "actualhospitallos",
        "preopmi",
        "preopcardiaccath",
        "ptcawithin24h",
        "unabridgedunitlos",
        "unabridgedhosplos",
        "actualventdays",
        "predventdays",
        "unabridgedactualventdays"
    ]

    return (
        <div className='patientpage'>
            <h1 className='main-page-title'>Patient Information</h1>

            <div className='table-section'>
                <h2 className='patienttitle'>Patient Data</h2>
                <div className='table-container'>
            <table>
                        <thead>
                <tr>
                                <th>Patient Unit Stay ID</th>
                                <th>Patient Health System Stay ID</th>
                                <th>Gender</th>
                    <th>Age</th>
                                <th>Ethnicity</th>
                                <th>Hospital ID</th>
                                <th>Ward ID</th>
                                <th>Apache Admission DX</th>
                                <th>Admission Height</th>
                                <th>Hospital Admit Time 24</th>
                                <th>Hospital Admit Offset</th>
                                <th>Hospital Admit Source</th>
                                <th>Hospital Discharge Year</th>
                                <th>Hospital Discharge Offset</th>
                                <th>Hospital Discharge Location</th>
                                <th>Hospital Discharge Status</th>
                    <th>Unit Type</th>
                                <th>Unit Admit Time 24</th>
                                <th>Unit Admit Source</th>
                                <th>Unit Visit Number</th>
                                <th>Unit Stay Type</th>
                                <th>Admission Weight</th>
                                <th>Discharge Weight</th>
                                <th>Unit Discharge Offset</th>
                                <th>Unit Discharge Location</th>
                                <th>Unit Discharge Status</th>
                                <th>Unique PID</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>141764</td>
                                <td>002-1039</td>
                                <td>Female</td>
                                <td>87</td>
                                <td>Caucasian</td>
                                <td>59</td>
                                <td>91</td>
                                <td></td>
                                <td>157.50</td>
                                <td>23:36:00</td>
                                <td></td>
                                <td>ICU to SDU</td>
                                <td>2015</td>
                                <td></td>
                                <td></td>
                                <td>Alive</td>
                                <td>Med-Surg ICU</td>
                                <td>002-1039</td>
                                <td>ICU to SDU</td>
                                <td>1</td>
                                <td>Med-Surg ICU</td>
                                <td>157.50</td>
                                <td>157.50</td>
                                <td></td>
                                <td></td>
                                <td>002-1039</td>
                </tr>
                <tr>
                                <td>141765</td>
                    <td>002-1039</td>
                                <td>Female</td>
                    <td>87</td>
                                <td>Caucasian</td>
                                <td>59</td>
                                <td>91</td>
                                <td>Rhythm disturbance (atrial, supraventricular)</td>
                                <td>157.50</td>
                                <td>23:36:00</td>
                                <td></td>
                                <td>Emergency Department</td>
                                <td>2015</td>
                                <td>46.50</td>
                                <td>Alive</td>
                                <td>Med-Surg ICU</td>
                                <td>002-1039</td>
                                <td>Emergency Department</td>
                                <td>1</td>
                    <td>Med-Surg ICU</td>
                                <td>46.50</td>
                                <td>46.50</td>
                                <td>Rhythm disturbance (atrial, supraventricular)</td>
                                <td>002-1039</td>
                    <td>Alive</td>
                </tr>
                <tr>
                                <td>143870</td>
                    <td>002-12289</td>
                                <td>Male</td>
                    <td>76</td>
                                <td>Caucasian</td>
                                <td>68</td>
                                <td>103</td>
                    <td>Endarterectomy, carotid</td>
                                <td>167.00</td>
                                <td>20:46:00</td>
                                <td>Operating Room</td>
                                <td>77.50</td>
                                <td>SICU</td>
                                <td>Operating Room</td>
                                <td>Alive</td>
                                <td>SICU</td>
                                <td>002-12289</td>
                                <td>Operating Room</td>
                                <td>1</td>
                    <td>SICU</td>
                                <td>77.50</td>
                                <td>77.50</td>
                                <td>Endarterectomy, carotid</td>
                                <td>002-12289</td>
                    <td>Alive</td>
                </tr>
                <tr>
                                <td>144815</td>
                    <td>002-1116</td>
                                <td>Female</td>
                    <td>34</td>
                                <td>Caucasian</td>
                                <td>56</td>
                                <td>82</td>
                                <td>Overdose, other toxin, poison or drug</td>
                                <td>172.70</td>
                                <td>01:44:00</td>
                                <td>Emergency Department</td>
                                <td>60.30</td>
                                <td>Med-Surg ICU</td>
                                <td>Emergency Department</td>
                                <td>Alive</td>
                                <td>Med-Surg ICU</td>
                                <td>002-1116</td>
                                <td>Emergency Department</td>
                                <td>1</td>
                    <td>Med-Surg ICU</td>
                                <td>172.70</td>
                                <td>172.70</td>
                                <td>Overdose, other toxin, poison or drug</td>
                                <td>002-1116</td>
                    <td>Alive</td>
                </tr>
                <tr>
                                <td>145427</td>
                    <td>002-12243</td>
                                <td>Male</td>
                    <td>61</td>
                                <td>Caucasian</td>
                                <td>68</td>
                                <td>103</td>
                                <td>GI perforation/rupture, surgery for</td>
                                <td>177.80</td>
                                <td>23:48:00</td>
                                <td>Emergency Department</td>
                                <td>91.70</td>
                    <td>SICU</td>
                                <td>Operating Room</td>
                    <td>Alive</td>
                                <td>SICU</td>
                                <td>002-12243</td>
                                <td>Emergency Department</td>
                                <td>1</td>
                                <td>SICU</td>
                                <td>91.70</td>
                                <td>91.70</td>
                                <td>GI perforation/rupture, surgery for</td>
                                <td>002-12243</td>
                    <td>Alive</td>
                </tr>
                        </tbody>
            </table>
                </div>
                {renderDownloadControls('patient', patientColumns, 'patient')}
            </div>

            <div className='table-section'>
                <h2 className='patienttitle'>Apache APS Data</h2>
                <div className='table-container'>
                    <table>
                        <thead>
                            <tr>
                                <th>Apache APS ID</th>
                    <th>Patient Unit Stay ID</th>
                                <th>Intubated</th>
                                <th>Ventilation</th>
                                <th>Dialysis</th>
                                <th>Eyes</th>
                                <th>Motor</th>
                    <th>Verbal</th>
                    <th>Meds</th>
                    <th>Urine</th>
                    <th>WBC</th>
                    <th>Temperature</th>
                    <th>Respiratory Rate</th>
                    <th>Sodium</th>
                    <th>Heart Rate</th>
                                <th>Mean Blood Pressure</th>
                                <th>PH</th>
                    <th>Hematocrit</th>
                    <th>Creatinine</th>
                    <th>Albumin</th>
                                <th>PAO2</th>
                    <th>PCO2</th>
                    <th>BUN</th>
                    <th>Glucose</th>
                    <th>Bilirubin</th>
                                <th>FIO2</th>
                </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>92788</td>
                                <td>141765</td>
                                <td>IV</td>
                                <td>RHYTHATR</td>
                                <td>5</td>
                                <td>6</td>
                                <td>4</td>
                                <td>0</td>
                                <td>-1</td>
                    <td>10.2</td>
                    <td>36.2</td>
                    <td>39</td>
                    <td>139</td>
                    <td>88</td>
                    <td>108</td>
                    <td>-1</td>
                    <td>37.8</td>
                    <td>1.04</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>28</td>
                    <td>61</td>
                    <td>-1</td>
                    <td>-1</td>
                </tr>
                <tr>
                                <td>8893</td>
                                <td>143870</td>
                                <td>IVa</td>
                                <td>S-CAROTEND</td>
                                <td>5</td>
                                <td>6</td>
                                <td>4</td>
                                <td>0</td>
                                <td>-1</td>
                    <td>11.7</td>
                    <td>36.4</td>
                    <td>60</td>
                    <td>133</td>
                    <td>40</td>
                    <td>47</td>
                    <td>-1</td>
                    <td>34.1</td>
                    <td>1.14</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>14</td>
                    <td>140</td>
                    <td>-1</td>
                    <td>-1</td>
                </tr>
                <tr>
                                <td>79585</td>
                                <td>144815</td>
                                <td>IV</td>
                                <td>ODOTHER</td>
                                <td>5</td>
                                <td>6</td>
                                <td>4</td>
                                <td>0</td>
                                <td>-1</td>
                    <td>7.9</td>
                    <td>36.7</td>
                    <td>6</td>
                    <td>141</td>
                    <td>131</td>
                    <td>61</td>
                    <td>-1</td>
                    <td>36.6</td>
                    <td>0.63</td>
                    <td>3.6</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>6</td>
                    <td>82</td>
                    <td>0.5</td>
                    <td>-1</td>
                </tr>
                <tr>
                                <td>203242</td>
                                <td>145427</td>
                                <td>IV</td>
                                <td>S-GIPERFOR</td>
                                <td>5</td>
                                <td>6</td>
                                <td>4</td>
                                <td>0</td>
                                <td>-1</td>
                    <td>21.1</td>
                    <td>36.2</td>
                    <td>41</td>
                    <td>141</td>
                    <td>49</td>
                    <td>72</td>
                    <td>-1</td>
                    <td>40.4</td>
                    <td>1.05</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>14</td>
                    <td>118</td>
                    <td>-1</td>
                    <td>-1</td>
                </tr>
                <tr>
                                <td>154681</td>
                                <td>147307</td>
                                <td>IV</td>
                                <td>S-CAROTEND</td>
                                <td>5</td>
                                <td>6</td>
                                <td>4</td>
                                <td>0</td>
                                <td>-1</td>
                    <td>-1</td>
                    <td>36.8</td>
                    <td>33</td>
                    <td>-1</td>
                    <td>115</td>
                    <td>107</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                    <td>-1</td>
                </tr>
                        </tbody>
            </table>
                </div>
                {renderDownloadControls('apacheAps', apacheApsColumns, 'apacheApsVar')}
            </div>

            <div className='table-section'>
                <h2 className='patienttitle'>Apache Prediction Data</h2>
                <div className='table-container'>
                    <table>
                <thead>
                    <tr>
                                <th>Apache Pred Var ID</th>
                                <th>Patient Unit Stay ID</th>
                                <th>Apache Version</th>
                                <th>Predicted Hospital Mortality</th>
                                <th>Actual ICU Mortality</th>
                                <th>Actual Hospital Mortality</th>
                                <th>Predicted ICU Mortality</th>
                                <th>Predicted ICU LOS</th>
                                <th>Actual ICU LOS</th>
                                <th>Predicted Hospital LOS</th>
                                <th>Actual Hospital LOS</th>
                                <th>Preop MI</th>
                                <th>Preop Cardiac Cath</th>
                                <th>PTCA Within 24h</th>
                                <th>Unabridged Unit LOS</th>
                                <th>Unabridged Hosp LOS</th>
                                <th>Actual Vent Days</th>
                                <th>Pred Vent Days</th>
                                <th>Unabridged Actual Vent Days</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>4004</td>
                        <td>141765</td>
                                <td>IV</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>8.25E-3</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>2.8817</td>
                                <td>ALIVE</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                    </tr>
                    <tr>
                        <td>8047</td>
                        <td>143870</td>
                                <td>IVa</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>1.23E-2</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>3.1739</td>
                                <td>ALIVE</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                    </tr>
                    <tr>
                        <td>1798882</td>
                        <td>144815</td>
                                <td>IV</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>1.57E-2</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>6.0326</td>
                                <td>ALIVE</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                    </tr>
                    <tr>
                        <td>1485310</td>
                        <td>145427</td>
                                <td>IV</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>1.77E-2</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>2.1962</td>
                                <td>ALIVE</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                    </tr>
                    <tr>
                        <td>27991</td>
                        <td>147307</td>
                                <td>IV</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>1.83E-3</td>
                                <td>ALIVE</td>
                                <td>ALIVE</td>
                                <td>5.9553</td>
                                <td>ALIVE</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                    </tr>
                </tbody>
            </table>
                </div>
                {renderDownloadControls('apachePredVar', apachePredVarColumns, 'apachePredVar')}
            </div>
        </div>
    )
}

export default PatientInfo

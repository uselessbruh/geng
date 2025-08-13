import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ExplanationPage.css';
import Image from './img2.webp';
import SyntheticDataImage from './synthetic_data.png';
import ClinicalRecordsImage from './clincal_records.png';
import AdvancedAnalyticsImage from './advanced_analytics.png';
import ResearchIntegrationImage from './research_integration.png';

const ExplanationPage = () => {
    const navigate = useNavigate();

    // Sample patient data array
    const samplePatients = [
        {
            id: "PT001",
            name: "John Doe",
            age: 45,
            gender: "Male",
            admissionDate: "2024-03-15",
            primaryDiagnosis: "Type 2 Diabetes",
            vitals: {
                bloodPressure: "120/80",
                heartRate: "72 bpm",
                temperature: "98.6°F",
                spO2: "98%"
            },
            medications: [
                "Metformin 1000mg",
                "Lisinopril 10mg"
            ],
            allergies: ["Penicillin"],
            labResults: {
                glucose: "126 mg/dL",
                hba1c: "6.8%",
                cholesterol: "185 mg/dL"
            }
        },
        {
            id: "PT002",
            name: "Sarah Smith",
            age: 32,
            gender: "Female",
            admissionDate: "2024-03-14",
            primaryDiagnosis: "Asthma",
            vitals: {
                bloodPressure: "118/75",
                heartRate: "80 bpm",
                temperature: "98.2°F",
                spO2: "97%"
            },
            medications: [
                "Albuterol inhaler",
                "Fluticasone 250mcg"
            ],
            allergies: ["Dust", "Pollen"],
            labResults: {
                peakFlow: "380 L/min",
                eosinophils: "4%",
                ige: "290 IU/mL"
            }
        }
    ];

    return (
        <div className="explanation-container">
            <div className="top-nav">
                <div className="logo-nav" onClick={() => navigate('/home')}>
                    <img src={Image} alt="GenG Logo" className="nav-logo" />
                </div>
                <button 
                    className="nav-button"
                    onClick={() => navigate('/home')}
                >
                    Go to App
                </button>
            </div>

            <div className="explanation-content">
                <div className="logo-section">
                    <img src={Image} alt="GenG Logo" className="explanation-logo" />
                    <h1>Welcome to GenG</h1>
                    <p className="tagline">Advanced Healthcare Data Generation Platform</p>
                </div>
                
                <div className="explanation-text">
                    <section className="intro-section">
                        <h2>Revolutionizing Healthcare Research</h2>
                        <p>
                            GenG is a cutting-edge platform that leverages advanced machine learning algorithms 
                            to generate synthetic healthcare data. Our system creates realistic, statistically 
                            sound patient records while maintaining privacy and compliance with healthcare 
                            regulations.
                        </p>
                    </section>

                    <section className="key-features">
                        <h2>Key Features</h2>
                        <div className="feature-grid">
                            <div className="feature-item">
                                <h3>Synthetic Patient Profiles</h3>
                                <p>Generate demographically accurate patient profiles with complete medical histories, 
                                   ensuring realistic data distribution and correlation.</p>
                                <div className="feature-image">
                                    <img src={SyntheticDataImage} alt="Synthetic Patient Profiles" />
                                </div>
                            </div>
                            <div className="feature-item">
                                <h3>Clinical Records Generation</h3>
                                <p>Create detailed medical records including diagnoses, treatments, medications, 
                                   and progression timelines based on real-world medical patterns.</p>
                                <div className="feature-image">
                                    <img src={ClinicalRecordsImage} alt="Clinical Records Generation" />
                                </div>
                            </div>
                            <div className="feature-item">
                                <h3>Advanced Analytics</h3>
                                <p>Utilize machine learning models trained on extensive medical databases to generate 
                                   statistically valid healthcare data for research and analysis.</p>
                                <div className="feature-image">
                                    <img src={AdvancedAnalyticsImage} alt="Advanced Analytics Dashboard" />
                                </div>
                            </div>
                            <div className="feature-item">
                                <h3>Research Integration</h3>
                                <p>Seamlessly integrate with research workflows and access relevant medical literature 
                                   to support data generation and validation.</p>
                                <div className="feature-image">
                                    <img src={ResearchIntegrationImage} alt="Research Integration Flow" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="sample-data">
                        <h2>Sample Generated Data</h2>
                        <div className="data-tables">
                            <div className="patient-table">
                                <h3>Patient Profiles</h3>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Patient ID</th>
                                                <th>Name</th>
                                                <th>Age</th>
                                                <th>Gender</th>
                                                <th>Primary Diagnosis</th>
                                                <th>Admission Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {samplePatients.map(patient => (
                                                <tr key={patient.id}>
                                                    <td>{patient.id}</td>
                                                    <td>{patient.name}</td>
                                                    <td>{patient.age}</td>
                                                    <td>{patient.gender}</td>
                                                    <td>{patient.primaryDiagnosis}</td>
                                                    <td>{patient.admissionDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <h3>Vital Signs</h3>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Patient ID</th>
                                                <th>Blood Pressure</th>
                                                <th>Heart Rate</th>
                                                <th>Temperature</th>
                                                <th>SpO2</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {samplePatients.map(patient => (
                                                <tr key={patient.id}>
                                                    <td>{patient.id}</td>
                                                    <td>{patient.vitals.bloodPressure}</td>
                                                    <td>{patient.vitals.heartRate}</td>
                                                    <td>{patient.vitals.temperature}</td>
                                                    <td>{patient.vitals.spO2}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <h3>Medications & Allergies</h3>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Patient ID</th>
                                                <th>Medications</th>
                                                <th>Allergies</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {samplePatients.map(patient => (
                                                <tr key={patient.id}>
                                                    <td>{patient.id}</td>
                                                    <td>{patient.medications.join(", ")}</td>
                                                    <td>{patient.allergies.join(", ")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <h3>Lab Results</h3>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Patient ID</th>
                                                <th>Test</th>
                                                <th>Result</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {samplePatients.map(patient => (
                                                Object.entries(patient.labResults).map(([test, result], index) => (
                                                    <tr key={`${patient.id}-${index}`}>
                                                        <td>{patient.id}</td>
                                                        <td>{test.charAt(0).toUpperCase() + test.slice(1)}</td>
                                                        <td>{result}</td>
                                                    </tr>
                                                ))
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="use-cases">
                        <h2>Use Cases</h2>
                        <div className="use-case-grid">
                            <div className="use-case-item">
                                <h3>Medical Research</h3>
                                <p>Support clinical trials and medical research with realistic patient data.</p>
                            </div>
                            <div className="use-case-item">
                                <h3>Healthcare Education</h3>
                                <p>Provide realistic scenarios for medical training and education.</p>
                            </div>
                            <div className="use-case-item">
                                <h3>Software Testing</h3>
                                <p>Test healthcare applications with comprehensive synthetic data.</p>
                            </div>
                            <div className="use-case-item">
                                <h3>AI Model Training</h3>
                                <p>Train machine learning models for healthcare applications.</p>
                            </div>
                        </div>
                    </section>

                    <div className="cta-section">
                        <button 
                            className="enter-app-button"
                            onClick={() => navigate('/home')}
                        >
                            Enter Application
                        </button>
                        <p className="cta-subtext">Experience the future of healthcare data generation</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplanationPage; 
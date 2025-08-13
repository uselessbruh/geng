import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import Geng from "./Geng/Geng";
import VitalAndObv from "./DataGeneration/VitalAndObv/VitalAndObv";
import ExplanationPage from "./components/ExplanationPage";
import LiteratureReview from "./LitreatureReview/LiteratureReview";
import GenerateData from "./DataGeneration/GenerateData";
import PatientData from "./DataGeneration/PatientData";
import XRayData from "./XRayData/XRayData";
import MRIData from "./MRIData/MRIData";
import PatientInfo from "./DataGeneration/PatientInfo/PatientInfo";
import DiagAndCond from "./DataGeneration/DiaAndCond/DiaAndCond";
import MediAndTreat from "./DataGeneration/MediAndTreat/MediAndTreat";
import CareAndNurse from "./DataGeneration/CareAndNurse/CareAndNurse";
import InAndOut from "./DataGeneration/InAndOut/InAndOut";
import DataValidation from "./DataGeneration/DataValidation/DataValidation";
import "./App.css";

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      {user && <Header />}
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to="/home" /> : <ExplanationPage />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/home" />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Geng />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vitalandobv"
            element={
              <ProtectedRoute>
                <VitalAndObv />
              </ProtectedRoute>
            }
          />
          <Route
            path="/literature-review"
            element={
              <ProtectedRoute>
                <LiteratureReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data"
            element={
              <ProtectedRoute>
                <GenerateData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/patient-data"
            element={
              <ProtectedRoute>
                <PatientData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/xray-data"
            element={
              <ProtectedRoute>
                <XRayData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/mri-data"
            element={
              <ProtectedRoute>
                <MRIData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/patient-data/patient-info"
            element={
              <ProtectedRoute>
                <PatientInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/patient-data/diagnosis-conditions"
            element={
              <ProtectedRoute>
                <DiagAndCond />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/patient-data/medication-treatments"
            element={
              <ProtectedRoute>
                <MediAndTreat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/patient-data/care-nursing"
            element={
              <ProtectedRoute>
                <CareAndNurse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/patient-data/vital-obsv"
            element={
              <ProtectedRoute>
                <VitalAndObv />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/patient-data/inandout"
            element={
              <ProtectedRoute>
                <InAndOut />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate-data/patient-data/data-validation"
            element={
              <ProtectedRoute>
                <DataValidation />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {user && <Footer />}
    </div>
  );
};

export default App;

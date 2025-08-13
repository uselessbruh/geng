import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import './Explanation.css';

const Explanation = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleGoToApp = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="explanation-container">
      <h1>Welcome to GenG</h1>
      <p>Your AI-powered medical data generation platform</p>
      <button onClick={handleGoToApp} className="go-to-app-button">
        Go to Application
      </button>
    </div>
  );
};

export default Explanation; 
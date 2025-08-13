import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/home')}>
          <h1>GenG</h1>
        </div>
        <nav className="nav-links">
          <button onClick={() => navigate('/home')}>Home</button>
          <button onClick={() => navigate('/generate-data')}>Generate Data</button>
          <button onClick={() => navigate('/literature-review')}>Literature Review</button>
        </nav>
        <div className="user-section">
          {user && (
            <>
              <span className="user-email">{user.email}</span>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 
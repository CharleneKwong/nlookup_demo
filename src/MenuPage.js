import React from 'react';
import './MenuPage.css';
import sinchLogo from './sinch-logo.png';

function MenuPage({ onSelectApp }) {
  const apps = [
    {
      name: 'Onboarding',
      displayText: 'Use case: Onboarding',
      description: '1. Prevent sign-up from suspicious numbers\n2. Complete sign up using verification',
      color: '#4CAF50'
    },
    {
      name: 'Password Reset',
      displayText: 'Use case: Password Reset',
      description: '1. Check subscriber data for account takeover signals\n2. Complete verification to obtain password reset link',
      color: '#2196F3'
    }
  ];

  return (
    <div className="menu-page">
      <img src={sinchLogo} alt="Sinch Logo" className="logo"/>
      <h1>Identity and Verification</h1>
      <p className="subtitle">Network API and subscriber demonstration</p>
      <div className="app-grid">
        {apps.map((app) => (
          <div 
            key={app.name} 
            className="app-card"
            style={{ backgroundColor: app.color }}
            onClick={() => onSelectApp(app.name)}
          >
            <h2>{app.displayText}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{app.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuPage;

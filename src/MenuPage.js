import React from 'react';
import './MenuPage.css';
import sinchLogo from './sinch-logo.png';

function MenuPage({ onSelectApp }) {
  const apps = [
    {
      name: 'Onboarding',
      description: 'Number lookup and verification flow',
      color: '#4CAF50'
    },
    {
      name: 'Password Reset',
      description: 'SIM swap detection to mitigate account takeover',
      color: '#2196F3'
    },
    {
      name: '10DLC Compliant',
      description: '10DLC compliance check with Number Lookup',
      color: '#FFCC00'
    }
  ];

  return (
    <div className="menu-page">
      <img src={sinchLogo} alt="Sinch Logo" className="logo" />
      <h1>Verification and Identity Use Case Demo</h1>
      <div className="app-grid">
        {apps.map((app) => (
          <div 
            key={app.name} 
            className="app-card"
            style={{ backgroundColor: app.color }}
            onClick={() => onSelectApp(app.name)}
          >
            <h2>{app.name}</h2>
            <p>{app.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuPage;

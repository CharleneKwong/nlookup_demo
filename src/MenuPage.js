import React from 'react';
import './MenuPage.css';
import sinchLogo from './sinch-logo.png';

function MenuPage({ onSelectApp }) {
  const apps = [
    {
      name: 'Onboarding',
      description: 'Number lookup and verification flow to prevent suspicious nubmers from signing up',
      color: '#4CAF50'
    },
    {
      name: 'Password Reset',
      description: 'Preventing account takeover by SIM swap and recycled number detection',
      color: '#2196F3'
    }
  ];

  return (
    <div className="menu-page">
      <img src={sinchLogo} alt="Sinch Logo" className="logo"/>
      <h1>Identity and Verification prototype</h1>
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

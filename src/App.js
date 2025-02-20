import React, { useState } from 'react';
import './App.css';
import MenuPage from './MenuPage';
import OnboardingApp from './OnboardingApp';
import PasswordResetApp from './PasswordResetApp';

function App() {
  const [currentApp, setCurrentApp] = useState(null);

  const handleSelectApp = (appName) => {
    setCurrentApp(appName);
  };

  const handleBackToMenu = () => {
    setCurrentApp(null);
  };

  const renderSelectedApp = () => {
    switch (currentApp) {
      case 'Onboarding':
        return <OnboardingApp onBack={handleBackToMenu} />;
      case 'Password Reset':
        return <PasswordResetApp onBack={handleBackToMenu} />;
      default:
        return <MenuPage onSelectApp={handleSelectApp} />;
    }
  };

  return (
    <div className="App">
      {renderSelectedApp()}
    </div>
  );
}

export default App;
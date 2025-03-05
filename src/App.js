import React, { useState } from 'react';
import './App.css';
import MenuPage from './MenuPage';
import OnboardingApp from './OnboardingApp';
import PasswordResetApp from './PasswordResetApp';

function App() {
  const [currentApp, setCurrentApp] = useState(null);
  const [sharedPhoneNumber, setSharedPhoneNumber] = useState('');

  const handleSelectApp = (appName) => {
    setCurrentApp(appName);
  };

  const handleBackToMenu = () => {
    setCurrentApp(null);
  };

  const handlePhoneNumberUpdate = (phoneNumber) => {
    setSharedPhoneNumber(phoneNumber);
  };

  const renderSelectedApp = () => {
    switch (currentApp) {
      case 'Onboarding':
        return <OnboardingApp 
          onBack={handleBackToMenu} 
          phoneNumber={sharedPhoneNumber}
          onPhoneNumberChange={handlePhoneNumberUpdate}
        />;
      case 'Password Reset':
        return <PasswordResetApp 
          onBack={handleBackToMenu}
          phoneNumber={sharedPhoneNumber}
        />;
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
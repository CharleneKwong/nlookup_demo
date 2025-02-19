import React, { useState } from 'react';
import './App.css';
import sinchLogo from './sinch-logo.png';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [lineType, setLineType] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [lookupMessage, setLookupMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [currentScreen, setCurrentScreen] = useState('phoneInput');

  const lineTypes = ['VoIP', 'Temporary', 'Mobile', 'Landline'];
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const performNumberLookup = async () => {
    // Validate phone number
    if (!phoneNumber) {
      setWarningMessage('Please enter a phone number');
      return;
    }

    // Get the current line type
    const simulatedApiResponse = lineTypes[currentTypeIndex];
    setLineType(simulatedApiResponse);
    
    // Always go to verification loading screen first
    setCurrentScreen('verificationLoading');
    
    // Simulate API delay and then determine next screen based on line type
    setTimeout(() => {
      switch (simulatedApiResponse) {
        case 'VoIP':
        case 'Temporary':
          // For VoIP or Temporary numbers, show fraud warning
          setCurrentScreen('phoneInput');
          setWarningMessage(
            `This number has been identified as potentially fraudulent. Please contact <a href="mailto:support@sinch.com" style="color: blue; text-decoration: underline;">customer support</a>.`
          );
          break;
        case 'Mobile':
        case 'Landline':
          // For Mobile or Landline, proceed to OTP verification
          setCurrentScreen('otpVerification');
          break;
      }
      
      // Cycle through line types to cover all cases
      setCurrentTypeIndex((currentTypeIndex + 1) % lineTypes.length);
    }, 3000);
  };

  const verifyOtp = () => {
    if (otp.join('') === '600123') {
      setVerificationStatus('Verified successfully!');
      // Move to welcome screen after successful verification
      setCurrentScreen('welcomeScreen');
    } else {
      setVerificationStatus('Incorrect verification code. Please try again.');
    }
  };

  const handleSupportEmailClick = () => {
    window.location.href = 'mailto:support@sinch.com';
  };

  return (
    <div className="App">
      {currentScreen === 'phoneInput' && (
        <div>
          <header className="App-header">
            <img src={sinchLogo} alt="Sinch" className="logo" />
            <h1 style={{ color: 'black' }}>For security reasons, please add your telephone number to complete your registration.</h1>
          </header>
          <div className="verification-container">
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Enter your phone number"
              className="phone-input"
            />
            <p className="hint-text">Use your mobile or fixed line telephone numbers only</p>
            <button onClick={performNumberLookup} className="lookup-button">Register</button>
            {lookupMessage && <p>{lookupMessage}</p>}
            {warningMessage && (
              <div 
                className="fraud-warning" 
                dangerouslySetInnerHTML={{ 
                  __html: warningMessage 
                }} 
              />
            )}
            {lineType && (
              <div className="button-row">
                {lineType === 'Mobile' && <button onClick={performNumberLookup} className="otp-button">Send OTP via SMS</button>}
                {lineType === 'Landline' && <button onClick={performNumberLookup} className="otp-button">Call this number to get OTP</button>}
              </div>
            )}
          </div>
        </div>
      )}

      {currentScreen === 'verificationLoading' && (
        <div className="verification-loading-screen">
          <img src={sinchLogo} alt="Sinch" className="logo" />
          <div className="spinner"></div>
          <p className="verification-loading-text">
            We are checking the validity of this number provided against regulator information and third party sources to protect against fraud
          </p>
        </div>
      )}

      {currentScreen === 'otpVerification' && (
        <div className="otp-screen">
          <img src={sinchLogo} alt="Sinch" className="logo" />
          <h1>Verify your number</h1>
          <p>Enter the verification code</p>
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                maxLength="1"
                className="otp-input"
                id={`otp-input-${index}`}
              />
            ))}
          </div>
          <div>
            <button onClick={verifyOtp} className="verify-button">Verify</button>
          </div>
          {verificationStatus && <p className="status-message">{verificationStatus}</p>}
        </div>
      )}

      {currentScreen === 'welcomeScreen' && (
        <div className="welcome-screen">
          <img src={sinchLogo} alt="Sinch" className="logo" />
          <h1>Welcome Onboard</h1>
        </div>
      )}
    </div>
  );
}

export default App;

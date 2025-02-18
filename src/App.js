import React, { useState } from 'react';
import './App.css';
import sinchLogo from './sinch-logo.png';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [lineType, setLineType] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

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
    const simulatedApiResponse = lineTypes[currentTypeIndex];
    setLineType(simulatedApiResponse);
    setLookupMessage(`Performing Number lookup ... Detecting line type is: ${simulatedApiResponse}`);
    if (simulatedApiResponse === 'VoIP' || simulatedApiResponse === 'Temporary') {
      setWarningMessage('Risky number detected. Proceed with caution.');
    } else {
      setWarningMessage('');
    }
    setCurrentTypeIndex((currentTypeIndex + 1) % lineTypes.length);
  };

  const proceedToOtp = () => {
    setShowOtpScreen(true);
  };

  const blockNumber = () => {
    alert('This number is blocked due to risk.');
  };

  const verifyOtp = () => {
    if (otp.join('') === '600123') {
      setVerificationStatus('Verified successfully!');
    } else {
      setVerificationStatus('Verification failed. Try again.');
    }
  };

  return (
    <div className="App">
      {!showOtpScreen ? (
        <div>
          <header className="App-header">
            <img src={sinchLogo} alt="Sinch" className="logo" />
            <h1 style={{ color: 'black' }}>Optimize your onboarding with Number lookup and verification</h1>
          </header>
          <div className="verification-container">
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Enter your phone number"
              className="phone-input"
            />
            <button onClick={performNumberLookup} className="lookup-button">Register</button>
            {lookupMessage && <p>{lookupMessage}</p>}
            {warningMessage && <p style={{ color: 'red' }}>{warningMessage}</p>}
            {lineType && (
              <div className="button-row">
                {lineType === 'Mobile' && <button onClick={proceedToOtp} className="otp-button">Send OTP via SMS</button>}
                {lineType === 'Landline' && <button onClick={proceedToOtp} className="otp-button">Call this number to get OTP</button>}
                {(lineType === 'VoIP' || lineType === 'Temporary') && (
                  <>
                    <button onClick={proceedToOtp} className="otp-button">Proceed to OTP</button>
                    <button onClick={blockNumber} className="block-button">Block this number</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
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
    </div>
  );
}

export default App;

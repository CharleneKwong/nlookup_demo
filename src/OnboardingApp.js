import React, { useState } from 'react';
import './App.css';
import sinchLogo from './sinch-logo.png';

function OnboardingApp({ onBack, phoneNumber, onPhoneNumberChange }) {
  const [currentScreen, setCurrentScreen] = useState('phoneInput');
  const [lineType, setLineType] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [lookupMessage, setLookupMessage] = useState('');
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
  const [verificationId, setVerificationId] = useState(null);

  const lineTypes = ['VoIP', 'Temporary', 'Mobile', 'Landline'];

  const handlePhoneNumberChange = (e) => {
    onPhoneNumberChange(e.target.value);
  };

  const performNumberLookup = async () => {
    if (!phoneNumber) {
      setWarningMessage('Please enter a phone number');
      return;
    }

    setCurrentScreen('verificationLoading');
    
    try {
      const apiKey = "86fa126d-803b-4921-b16c-1bcf8729c87d";
      const apiSecret = "uYPbJirOq0qUNZBruQhAnQ==";
      const base64Credentials = btoa(`${apiKey}:${apiSecret}`);

      const response = await fetch('https://number-lookup.api.sinch.com/v1/lookups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Credentials}`
        },
        body: JSON.stringify({
          number: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error('Number lookup API request failed');
      }

      const data = await response.json();
      const lineType = data.line.type;
      setLineType(lineType);
      
      // Use the actual line type from the API response
      switch (lineType) {
        case 'VoIP':
        case 'Temporary':
          setCurrentScreen('phoneInput');
          setWarningMessage(
            `This number has been identified as potentially fraudulent. Please try again with a different number or contact <a href="mailto:support@sinch.com" style="color: blue; text-decoration: underline;">customer support</a>.`
          );
          break;
        case 'Mobile':
        case 'Landline':
          // Automatically send verification code
          try {
            const method = lineType === 'Mobile' ? 'sms' : 'callout';
            const verifyResponse = await fetch('https://verification.api.sinch.com/verification/v1/verifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Credentials}`
              },
              body: JSON.stringify({
                identity: {
                  type: 'number',
                  endpoint: phoneNumber
                },
                method: method
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Verification code request failed');
            }

            const verifyData = await verifyResponse.json();
            setCurrentScreen('otpVerification');
            setVerificationStatus(
              method === 'sms' 
                ? 'Verification code sent via SMS now.' 
                : 'Verification call initiated.'
            );
          } catch (verifyError) {
            console.error('Verification code request error:', verifyError);
            setCurrentScreen('phoneInput');
            setWarningMessage('Failed to send verification code. Please try again.');
          }
          break;
        default:
          setCurrentScreen('phoneInput');
          setWarningMessage('Unable to verify number type. Please try again.');
      }
    } catch (error) {
      console.error('Number lookup error:', error);
      setCurrentScreen('phoneInput');
      setWarningMessage('An error occurred while verifying the number. Please enter a valid number and try again.');
    }
  };

  const sendVerificationOtp = async () => {
    try {
      const apiKey = "86fa126d-803b-4921-b16c-1bcf8729c87d";
      const apiSecret = "uYPbJirOq0qUNZBruQhAnQ==";
      const base64Credentials = btoa(`${apiKey}:${apiSecret}`);

      const method = lineType === 'Mobile' ? 'sms' : 'callout';

      const response = await fetch('https://verification.api.sinch.com/verification/v1/verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Credentials}`
        },
        body: JSON.stringify({
          identity: {
            type: 'number',
            endpoint: phoneNumber
          },
          method: method
        })
      });

      if (!response.ok) {
        throw new Error('Verification OTP request failed');
      }

      const data = await response.json();
      setVerificationId(data.id);
      
      // Provide feedback about verification method
      const methodMessage = method === 'sms' 
        ? 'A verification code has been sent via SMS.' 
        : 'You will receive a verification call shortly.';
      setVerificationStatus(methodMessage);
    } catch (error) {
      console.error('Verification OTP error:', error);
      setVerificationStatus('Failed to send verification code. Please try again.');
    }
  };

  const verifyOtp = async () => {
    try {
      const apiKey = "86fa126d-803b-4921-b16c-1bcf8729c87d";
      const apiSecret = "uYPbJirOq0qUNZBruQhAnQ==";
      const base64Credentials = btoa(`${apiKey}:${apiSecret}`);

      const method = lineType === 'Mobile' ? 'sms' : 'callout';
      const enteredCode = otp.join('');

      console.log('Verification Details:', {
        phoneNumber,
        method,
        enteredCode
      });

      const response = await fetch(`https://verification.api.sinch.com/verification/v1/verifications/number/${phoneNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Credentials}`
        },
        body: JSON.stringify({
          method: method,
          [method]: {
            code: enteredCode
          }
        })
      });

      // Log the raw response
      const responseText = await response.text();
      console.log('Raw Response:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setVerificationStatus('Unexpected response from verification service.');
        return;
      }

      // Log the parsed data
      console.log('Parsed Response:', data);

      // More detailed status checking
      if (response.ok && (data.status === 'APPROVED' || data.status === 'SUCCESSFUL')) {
        setCurrentScreen('welcomeScreen');
      } else {
        // Provide more detailed error information
        const errorMessage = data.errorCode 
          ? `Verification failed with error code: ${data.errorCode}! Contact <a href="mailto:support@sinch.com" style="color: blue; text-decoration: underline;">support</a> for assistance.` 
          : 'Incorrect verification code. Please try again.';
        
        setVerificationStatus(errorMessage);
        console.error('Verification failed:', data);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setVerificationStatus('An error occurred during verification. Please try again.');
    }
  };

  const handleOtpChange = (index, value, event) => {
    // Create a copy of the current OTP array
    const newOtp = [...otp];
    
    // Check if backspace is pressed and current box is empty
    const isBackspaceOnEmptyBox = event.nativeEvent.inputType === 'deleteContentBackward' && value === '';
    
    if (isBackspaceOnEmptyBox && index > 0) {
      newOtp[index] = '';
      setOtp(newOtp);
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
      return;
    }
    
    // Only allow numeric input
    if (/^\d?$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Automatically move to next input if a digit is entered
      if (value !== '' && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  return (
    <div className="App">
      <button onClick={onBack} className="back-to-menu-small">&lt;</button>
      
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
          <img src={sinchLogo} alt="Sinch" className="logo" style={{marginBottom: '10px'}} />
          <h1>Enter the verification code to verify your number</h1>
         
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value, e)}
                maxLength="1"
                className="otp-input"
                id={`otp-input-${index}`}
              />
            ))}
          </div>
          <button 
            onClick={verifyOtp} 
            className="verify-button"
          >
            Verify
          </button>
          <div className="error-space" style={{height: '20px'}}></div>
          {verificationStatus && (
            <p 
              style={{
                color: verificationStatus.includes('failed') || 
                       verificationStatus.includes('error') || 
                       verificationStatus.includes('Incorrect') 
                  ? 'red' 
                  : 'inherit'
              }}
              dangerouslySetInnerHTML={{ __html: verificationStatus }}
            />
          )}
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

export default OnboardingApp;

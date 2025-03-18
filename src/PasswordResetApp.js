import React, { useState, useEffect } from 'react';
import sinchLogo from './profile-user.png';
import './App.css';

function BackButton({ onBack }) {
  return (
    <button onClick={onBack} className="back-to-menu-small">
      &lt;
    </button>
  );
}

function PasswordResetApp({ onBack, phoneNumber, onPhoneNumberChange }) {
  const [currentScreen, setCurrentScreen] = useState('userProfile');
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: phoneNumber
  });
  const [newPhoneNumber, setNewPhoneNumber] = useState(phoneNumber || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isTwoStepEnabled, setIsTwoStepEnabled] = useState(true);
  const [isBackendChecking, setIsBackendChecking] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [warningCycleIndex, setWarningCycleIndex] = useState(0);

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const toggleTwoStepVerification = () => {
    setIsTwoStepEnabled(!isTwoStepEnabled);
  };

  const handleVerifyOTP = async () => {
    const enteredCode = otp.join('');
    const apiKey = "86fa126d-803b-4921-b16c-1bcf8729c87d";
    const apiSecret = "uYPbJirOq0qUNZBruQhAnQ==";
    const base64Credentials = btoa(`${apiKey}:${apiSecret}`);

    try {
      const response = await fetch(`https://verification.api.sinch.com/verification/v1/verifications/number/${phoneNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Credentials}`
        },
        body: JSON.stringify({
          method: 'sms',
          sms: {
            code: enteredCode
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'APPROVED' || data.status === 'SUCCESSFUL') {
          setCurrentScreen('newPassword');
          setVerificationError('');
        } else {
          setVerificationError('Verification failed. Please try again.');
        }
      } else {
        throw new Error('Verification code verification failed');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setVerificationError('Failed to verify the OTP. Please try again.');
    }
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setPasswordError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordError('');
  };

  const validateAndSubmitPassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setCurrentScreen('passwordResetConfirmation');
  };

  const handleResetPassword = async () => {
    if (!isTwoStepEnabled) {
      setCurrentScreen('newPassword');
      return;
    }

    if (!phoneNumber) {
      setVerificationError('No phone number available. Please complete onboarding first.');
      return;
    }

    setIsBackendChecking(true);
    
    setTimeout(async () => {
      setIsBackendChecking(false);
      
      // Cycle through warning screens
      const warningScreens = ['simSwapWarning', 'rndWarning', 'otpVerification'];
      const nextScreenIndex = ((window.warningCycleIndex || 0) + 1) % warningScreens.length;
      const nextScreen = warningScreens[nextScreenIndex];
      window.warningCycleIndex = nextScreenIndex;
      setCurrentScreen(nextScreen);

      // Only trigger verification API if we're moving to OTP verification screen
      if (nextScreen === 'otpVerification') {
        const apiKey = "86fa126d-803b-4921-b16c-1bcf8729c87d";
        const apiSecret = "uYPbJirOq0qUNZBruQhAnQ==";
        const base64Credentials = btoa(`${apiKey}:${apiSecret}`);

        try {
          console.log('Sending verification request for phone number:', phoneNumber);
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
              method: 'sms'
            })
          });

          console.log('Response status:', verifyResponse.status);
          const responseData = await verifyResponse.json();
          console.log('Response data:', responseData);

          if (!verifyResponse.ok) {
            throw new Error(`Verification code request failed: ${responseData.message || 'Unknown error'}`);
          }

          setVerificationError('');
        } catch (error) {
          console.error('Detailed error:', error);
          setVerificationError(`Failed to send verification code: ${error.message}`);
          setCurrentScreen('phoneInput');
        }
      }
    }, 3000); // Simulating backend check delay
  };

  const maskPhoneNumber = (number) => {
    if (!number || number.length < 4) return number;
    const maskedPart = '*'.repeat(number.length - 4);
    const visiblePart = number.slice(-4);
    return maskedPart + visiblePart;
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (newPhoneNumber) {
        setUser(prev => ({
          ...prev,
          phoneNumber: newPhoneNumber
        }));
        onPhoneNumberChange(newPhoneNumber);
      }
    }, 1000); // 1 second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [newPhoneNumber]);

  const renderUserProfile = () => (
    <div className="App">
      <BackButton onBack={onBack} />
      <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
      <h1>User Profile</h1>
      <div className="verification-container">
        <div className="profile-info" style={{ textAlign: 'left', width: '100%' }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
              <p style={{ margin: 0 }}><strong>Phone Number:</strong></p>
              <input
                type="tel"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                placeholder="Enter a phone number"
                style={{
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '2px',
                  width: '135px'
                }}
              />
            </div>
          </div>
        </div>
        <button 
          className="lookup-button"
          onClick={() => setCurrentScreen('securitySettings')}
          style={{ marginTop: '40px' }}
        >
          Reset Password
        </button>
      </div>
    </div>
  );

  if (isBackendChecking) {
    return (
      <div className="verification-loading-screen">
        <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
        <div className="spinner"></div>
        <p className="verification-loading-text">
          We're checking with your mobile operator for signals which detect potential account takeover.
        </p>
      </div>
    );
  }

  if (currentScreen === 'userProfile') {
    return renderUserProfile();
  }

  if (currentScreen === 'simSwapWarning') {
    return (
      <div className="App">
        <BackButton onBack={onBack} />
        <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
        <h1>SIM swap detected</h1>
        <div className="verification-container">
          <p className="sim-swap-warning">
            A SIM swap has been detected in the last 4 hours. 
            Password reset rejected. Your account is locked.
          </p>
          <p className="support-contact">
            Please contact <a href="mailto:support@sinch.com">customer support</a> to unlock your account.
          </p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'rndWarning') {
    return (
      <div className="App">
        <BackButton onBack={onBack} />
        <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
        <h1>Number has been recycled</h1>
        <div className="verification-container">
          <p className="sim-swap-warning">
            This number has been recycled. 
            Password reset rejected. Your account is locked.
          </p>
          <p className="support-contact">
            Please contact <a href="mailto:support@sinch.com">customer support</a> to unlock your account.
          </p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'securitySettings') {
    return (
      <div>
        <BackButton onBack={onBack} />
        <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
        <h1>Account Settings</h1>
        <div className="verification-container">
          <div className="security-settings-box">
            <div className="two-step-header">
              <h3>Two-Step Verification</h3>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  id="twoStepToggle" 
                  checked={isTwoStepEnabled}
                  onChange={toggleTwoStepVerification}
                />
                <label htmlFor="twoStepToggle" className="toggle-label">
                  <span className="toggle-inner"></span>
                  <span className="toggle-switch-outer"></span>
                </label>
              </div>
            </div>
            {isTwoStepEnabled ? (
              <p className="security-description active">
                {phoneNumber ? (
                  <span> Your account is protected by two-step verification. We will confirm your password reset by first sending you an OTP code on {maskPhoneNumber(phoneNumber)}.</span>
                ) : (
                  <span>Your account is protected by two-step verification. We will confirm your password reset by first sending you an OTP code</span>
                )}
              </p>
            ) : (
              <p className="security-description recommendation">
                It is recommended to have two-step verification on to secure your account.
              </p>
            )}
          </div>
          
          <div className="error-placeholder">
            {isTwoStepEnabled && !phoneNumber && (
              <p className="error-message" style={{ color: 'red' }}>
                Please add a phone number in the user profile.
              </p>
            )}
          </div>
          <button 
            onClick={handleResetPassword} 
            className="lookup-button reset-password-button"
            disabled={isTwoStepEnabled && !phoneNumber}
          >
            Click to continue
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'newPassword') {
    return (
      <div>
        <BackButton onBack={onBack} />
        <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
        <h1>Reset Password</h1>
        <div className="verification-container">
          <div className="password-input-container">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              className="phone-input"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="phone-input"
            />
            <div className="error-placeholder">
              {passwordError && (
                <p className="error-message">{passwordError}</p>
              )}
            </div>
          </div>
          <button 
            onClick={validateAndSubmitPassword} 
            className="lookup-button"
          >
            Submit New Password
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'passwordResetConfirmation') {
    return (
      <div>
        <BackButton onBack={onBack} />
        <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
        <h1>Password Reset Successful</h1>
        <div className="verification-container">
          <p>Your password has been successfully reset.</p>
          <p>Please log in with your new password.</p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'otpVerification') {
    return (
      <div className="otp-screen">
        <BackButton onBack={onBack} />
        <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
        <h1>Verify Your Identity</h1>
        <p>Enter the 6-digit verification code</p>
        <div className="otp-input-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              maxLength="1"
              className="otp-input"
              id={`${`otp-input-${index}`}`}
            />
          ))}
        </div>
        <button onClick={handleVerifyOTP} className="verify-button">Verify</button>
        {verificationError && (
          <div className="error-message" style={{
            color: 'red', 
            marginTop: '15px', 
            marginBottom: '15px', // Add margin to the error message
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {verificationError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      {currentScreen !== 'menu' && <BackButton onBack={onBack} />}
      {currentScreen === 'securitySettings' && (
        <div>
          <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
          <h1>Account Settings</h1>
          <div className="verification-container">
            <div className="security-settings-box">
              <div className="two-step-header">
                <h3>Two-Step Verification</h3>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="twoStepToggle" 
                    checked={isTwoStepEnabled}
                    onChange={toggleTwoStepVerification}
                  />
                  <label htmlFor="twoStepToggle" className="toggle-label">
                    <span className="toggle-inner"></span>
                    <span className="toggle-switch-outer"></span>
                  </label>
                </div>
              </div>
              {isTwoStepEnabled ? (
                <p className="security-description active">
                  {phoneNumber ? (
                    <span> Your account is protected by two-step verification. We will confirm your password reset by first sending you an OTP code on {maskPhoneNumber(phoneNumber)}.</span>
                  ) : (
                    <span>Your account is protected by two-step verification. We will confirm your password reset by first sending you an OTP code</span>
                  )}
                </p>
              ) : (
                <p className="security-description recommendation">
                  It is recommended to have two-step verification on to secure your account.
                </p>
              )}
            </div>
            
            <div className="error-placeholder">
              {isTwoStepEnabled && !phoneNumber && (
                <p className="error-message" style={{ color: 'red' }}>
                  Please add a phone number in the profile settings.
                </p>
              )}
            </div>
            <button 
              onClick={handleResetPassword} 
              className="lookup-button reset-password-button"
              disabled={isTwoStepEnabled && !phoneNumber}
            >
              Click to continue
            </button>
          </div>
        </div>
      )}

      {currentScreen === 'newPassword' && (
        <div>
          <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
          <h1>Reset Password</h1>
          <div className="verification-container">
            <div className="password-input-container">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="phone-input"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="phone-input"
              />
              <div className="error-placeholder">
                {passwordError && (
                  <p className="error-message">{passwordError}</p>
                )}
              </div>
            </div>
            <button 
              onClick={validateAndSubmitPassword} 
              className="lookup-button"
            >
              Submit New Password
            </button>
          </div>
        </div>
      )}

      {currentScreen === 'passwordResetConfirmation' && (
        <div>
          <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
          <h1>Password Reset Successful</h1>
          <div className="verification-container">
            <p>Your password has been successfully reset.</p>
            <p>Please log in with your new password.</p>
          </div>
        </div>
      )}

      {currentScreen === 'otpVerification' && (
        <div className="otp-screen">
          <img src={sinchLogo} alt="Profile" className="logo profile-logo" />
          <h1>Verify Your Identity</h1>
          <p>Enter the 6-digit verification code</p>
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                maxLength="1"
                className="otp-input"
                id={`${`otp-input-${index}`}`}
              />
            ))}
          </div>
          <button onClick={handleVerifyOTP} className="verify-button">Verify</button>
          {verificationError && (
            <div className="error-message" style={{
              color: 'red', 
              marginTop: '15px', 
              marginBottom: '15px', // Add margin to the error message
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {verificationError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PasswordResetApp;
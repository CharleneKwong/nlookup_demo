import React, { useState } from 'react';
import sinchLogo from './profile-user.png';
import './App.css';

function PasswordResetApp({ onBack }) {
  const [currentScreen, setCurrentScreen] = useState('securitySettings');
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

  const handleVerifyOTP = () => {
    const otpInput = otp.join('');
    if (otpInput.length === 6) {
      // Simulated OTP verification
      if (otpInput === '600123') {
        setCurrentScreen('newPassword');
        setVerificationError(''); // Clear any previous errors
      } else {
        setVerificationError('Incorrect verification code. Please try again.');
      }
    } else {
      setVerificationError('Please enter a 6-digit verification code');
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

  const handleResetPassword = () => {
    if (!isTwoStepEnabled) {
      setCurrentScreen('newPassword');
      return;
    }

    setIsBackendChecking(true);
    
    setTimeout(() => {
      setIsBackendChecking(false);

      // Cycle through warning screens
      const warningScreens = ['simSwapWarning', 'rndWarning', 'otpVerification'];
      const nextScreenIndex = ((window.warningCycleIndex || 0) + 1) % warningScreens.length;
      const nextScreen = warningScreens[nextScreenIndex];
        
      window.warningCycleIndex = nextScreenIndex;
      setCurrentScreen(nextScreen);
    }, 3000); // Simulating backend check delay
  };

  // Rest of your component code remains the same...
  
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

  if (currentScreen === 'simSwapWarning') {
    return (
      <div className="App">
        <button onClick={onBack} className="back-to-menu-small">&lt;</button>
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
        <button onClick={onBack} className="back-to-menu-small">&lt;</button>
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

  return (
    <div className="App">
      <button onClick={onBack} className="back-to-menu-small">&lt;</button>
      
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
                  An additional layer of security is enabled to protect your account. You will receive a SMS one time passcode to verify it it you.
                </p>
              ) : (
                <p className="security-description recommendation">
                  It is recommended to have two-step verification on to secure your account.
                </p>
              )}
            </div>
            
            <button 
              onClick={handleResetPassword} 
              className="lookup-button reset-password-button"
            >
              Reset Password
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
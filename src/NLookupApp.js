import React from 'react';
import sinchLogo from './sinch-logo.png';

function NLookupApp({ onBack }) {
  return (
    <div className="App">
      <button onClick={onBack} className="back-to-menu-small">&lt;</button>
      <div>
        <img src={sinchLogo} alt="Sinch" className="logo" />
        <h1>10DLC Compliant</h1>
        <p>10DLC Number Validation and Compliance Check (Coming Soon)</p>
      </div>
    </div>
  );
}

export default NLookupApp;

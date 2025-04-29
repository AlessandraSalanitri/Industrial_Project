import React from 'react';

const ErrorModal = ({ triesLeft, onClose }) => (
  <div className="modal-overlay">
    <div className="modal">
      <p>Incorrect password. You have <strong>{triesLeft}</strong> {triesLeft === 1 ? "try" : "tries"} left.</p>
      <button className="button button-secondary" onClick={onClose}>
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorModal;
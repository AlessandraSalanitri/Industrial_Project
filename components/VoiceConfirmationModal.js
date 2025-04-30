import React from 'react';
import '../styles/voiceConfModal.css';

const VoiceConfirmationModal = ({ voice, onClose }) => {
  if (!voice) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Fabulous!</h2>
        <p>
          You've chosen your bedtime narrator voice. <strong>{voice.name}</strong> will read your story now 😊
        </p>
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default VoiceConfirmationModal;

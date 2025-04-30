import React, { useState, useEffect } from 'react';
import { fetchAvailableVoices, getUniqueLanguages, getVoicesByLanguage } from './voiceManager';
import { doc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '../firebase/firebaseConfig';
import VoiceConfirmationModal from './VoiceConfirmationModal';
import '../styles/voiceConfModal.css';

const VoiceSelector = ({ user }) => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [voices, setVoices] = useState([]);
  const [previewVoice, setPreviewVoice] = useState(null);
  const [confirmedVoice, setConfirmedVoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchAvailableVoices();
      const langs = getUniqueLanguages();
      setLanguages(langs);
    };
    initialize();
  }, []);

  const handleLanguageChange = (e) => {
    const languageCode = e.target.value;
    setSelectedLanguage(languageCode);
    const filteredVoices = getVoicesByLanguage(languageCode);
    setVoices(filteredVoices);
    setPreviewVoice(null);
  };

  const handleVoiceChange = (e) => {
    const voice = voices.find(v => v.name === e.target.value);
    setPreviewVoice(voice);
  };

  const handlePreview = () => {
    if (previewVoice) {
      const utterance = new SpeechSynthesisUtterance("Hello! I would love to be your bedtime narrator! ");
      utterance.voice = previewVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleConfirm = async () => {
    if (previewVoice && user) {
      setConfirmedVoice(previewVoice);
      setShowModal(true); // open the modal
  
      try {
        const userDocRef = doc(firestoreDB, "users", user.uid);
        await updateDoc(userDocRef, {
          selectedVoice: {
            name: previewVoice.name,
            lang: previewVoice.lang,
          },
        });
      } catch (error) {
        console.error("Error saving voice:", error);
        alert("Failed to save the voice. Please try again.");
      }
    }
  };
  
  // close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="speech-settings-box">
      <h3>Speech Settings</h3>
      <p> Here you can preview and select your preferred language and voice for your narrator. 
        Select first a language and available voice will be displayed to you next.
        You can then preview available voices and select your favourite </p>

      <div className="speech-form-row">
        <label htmlFor="language">Select Language:</label>
        <select id="language" value={selectedLanguage} onChange={handleLanguageChange}>
          <option value="">--Choose Language--</option>
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      {voices.length > 0 && (
        <>
          <div className="speech-form-row">
            <label htmlFor="voice">Choose a Voice:</label>
            <select id="voice" value={previewVoice?.name || ''} onChange={handleVoiceChange}>
              <option value="">--Choose Voice--</option>
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="speech-buttons-container">
            <div className="speech-button-group">
              <img src="/assets/ear.png" alt="Hear voice" />
              <button className="button button-secondary speech-button" onClick={handlePreview} disabled={!previewVoice}>
                Hear the voice
              </button>
            </div>
            <div className="speech-button-group">
              <img src="/assets/selected.png" alt="Select voice" />
              <button className="button button-primary speech-button" onClick={handleConfirm} disabled={!previewVoice}>
                Select this voice
              </button>
            </div>
          </div>
        </>
      )}
      {confirmedVoice && (
        <p className="selected-voice-display">
            Selected Voice: {confirmedVoice.name} ({confirmedVoice.lang})
        </p>
    )}
    {showModal && <VoiceConfirmationModal voice={confirmedVoice} onClose={closeModal} />}
    </div>
    );
};

export default VoiceSelector;

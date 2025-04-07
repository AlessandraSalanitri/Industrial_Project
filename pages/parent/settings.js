import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import '../../styles/settings.css';

const voicesList = [
  { name: 'Amy', lang: 'en-GB' },
  { name: 'Brian', lang: 'en-GB' },
  { name: 'Emma', lang: 'en-GB' },
  { name: 'Joanna', lang: 'en-US' },
];

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [childEmail, setChildEmail] = useState('');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleVoicePreview = (voiceName) => {
    const utterance = new SpeechSynthesisUtterance("Hi there! I'm your bedtime storyteller.");
    const selected = speechSynthesis.getVoices().find(v => v.name === voiceName);
    if (selected) {
      utterance.voice = selected;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceSelect = (voiceName) => {
    setSelectedVoice(voiceName);
  };

  const handleChildLink = () => {
    alert(`Child account linked with: ${childEmail}`);
    // Add logic to store this link in Firestore or context
  };

  return (
    <Layout>
      <div className="container settings-container">
        <h2 className="settings-title">SETTINGS</h2>

        {/* Mode Toggle */}
        <div className="setting-row">
          <span className="setting-label">Mode</span>
          <div className="toggle-group">
            <button className={`toggle-btn ${!darkMode ? 'active' : ''}`} onClick={() => setDarkMode(false)}>Light</button>
            <button className={`toggle-btn ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(true)}>Dark</button>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="setting-section">
          <h3>Speech Settings</h3>
          <div className="voice-grid">
            {voicesList.map((voice) => (
              <div key={voice.name} className={`voice-card ${selectedVoice === voice.name ? 'selected' : ''}`}>
                <p>{voice.name}</p>
                <button className="button button-secondary" onClick={() => handleVoicePreview(voice.name)}>Preview</button>
                <button className="button button-primary" onClick={() => handleVoiceSelect(voice.name)}>Select</button>
              </div>
            ))}
          </div>
        </div>

        {/* Parental Control */}
        <div className="setting-section">
          <h3>Parental Control</h3>
          <div className="link-child-container">
            <input
              type="email"
              placeholder="Enter child's email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
            />
            <button className="button button-primary" onClick={handleChildLink}>
              Link Account
            </button>
            </div>
            
          <div className="info-box">
            <h4>Why Link Your Account?</h4>
            <p>
              Linking your account with your child’s helps personalize their storytelling experience.
              When you create or edit stories, or choose a preferred narration voice, these changes
              will automatically reflect in your child’s account — ensuring they always enjoy the
              stories the way you intended. It’s a simple way to stay connected and enhance their
              bedtime experience with just one click.
            </p>
          
          </div>
        </div>

        {/* Navigation */}
        <div className="button-row">
          <button className="button button-secondary" onClick={() => window.history.back()}>Go back</button>
          <button className="button button-primary" onClick={() => alert('Settings saved!')}>Confirm</button>
        </div>
      </div>
    </Layout>
  );
}

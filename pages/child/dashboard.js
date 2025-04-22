import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StoryList from '../../components/StoryList';
import '../../styles/child_dashboard.css';
import '../../styles/darkMode.css'; // make sure this is present
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { firebaseAuth } from '../../firebase/firebaseConfig'; // adjust path if needed

export default function ChildDashboard() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    document.body.classList.toggle('dark-mode', isDark);

    // Check if the app is in restricted mode (only allow switching if not in restricted mode)
    const isRestricted = localStorage.getItem('restrictedMode') === 'true';
    if (isRestricted) {
      // Disable or hide any parent navigation (e.g., no option to navigate back)
      document.body.classList.add('restricted-mode');  // Add a restricted class
    }
  }, []);

  // Optional toggle UI for theme
  const handleThemeToggle = (mode) => {
    const isDark = mode === 'dark';
    setDarkMode(isDark);
    localStorage.setItem('theme', mode);
    document.body.classList.toggle('dark-mode', isDark);
  };

  // Function to handle exiting restricted mode (only available for parent)
  const exitRestrictedMode = async () => {
    const password = prompt('Enter parent password to exit restricted mode');
    if (!password) return;
  
    try {
      const user = firebaseAuth.currentUser;
  
      if (!user || !user.email) {
        alert('No user is currently logged in.');
        return;
      }
  
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
  
      localStorage.setItem('restrictedMode', 'false');
      alert('Exiting restricted mode...');
      window.location.href = '/parent/dashboard';
    } catch (error) {
      console.error('Failed to exit restricted mode:', error);
      alert('Incorrect password. Please try again.');
    }
  };
  return (
    <Layout>
      <div className="child-dashboard">
        {/* Theme toggle (optional) */}
        <div className="theme-toggle top-right" style={{ marginBottom: '1rem' }}>
          <button
            className={`toggle-btn ${!darkMode ? 'active' : ''}`}
            onClick={() => handleThemeToggle('light')}
          >
            Light
          </button>
          <button
            className={`toggle-btn ${darkMode ? 'active' : ''}`}
            onClick={() => handleThemeToggle('dark')}
          >
            Dark
          </button>
        </div>

        {/* Story List */}
        <StoryList />

        {/* Display restricted mode message */}
        

        {/* Allow parent to exit restricted mode */}
        <div className="exit-restricted-mode">
          <button className="button button-secondary" onClick={exitRestrictedMode}>
            Exit Restricted Mode (Parent Only)
          </button>
        </div>
      </div>
    </Layout>
  );
}

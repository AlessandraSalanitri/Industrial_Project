import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StoryList from '../../components/StoryList';
import '../../styles/child_dashboard.css';
import '../../styles/darkMode.css'; // make sure this is present

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
  const exitRestrictedMode = () => {
    localStorage.setItem('restrictedMode', 'false'); // Disable restricted mode
    window.location.href = '/parent/dashboard';  // Navigate back to parent dashboard
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
        <div className="restricted-access">
          <p>You are currently in restricted mode. Please contact the parent to exit.</p>
        </div>

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

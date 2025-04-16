// pages/child/dashboard.js
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
  }, []);

  // Optional toggle UI
  const handleThemeToggle = (mode) => {
    const isDark = mode === 'dark';
    setDarkMode(isDark);
    localStorage.setItem('theme', mode);
    document.body.classList.toggle('dark-mode', isDark);
  };

  return (
    <Layout>
      <div className="child-dashboard">
        {/* Optional: remove if you don't want toggle here */}
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

        <StoryList />
      </div>
    </Layout>
  );
}

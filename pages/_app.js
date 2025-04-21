import '@/styles/global.css'
import '@/styles/darkMode.css'
import { UserProvider } from '../context/UserContext';
import { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';


function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(false);

  // Clear dark mode on logout (when no user is saved)
  useEffect(() => {
    const unsubscribe = window.addEventListener('storage', () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) setDarkMode(false);
    });
    return () => window.removeEventListener('storage', unsubscribe);
  }, []);

  return (
    <UserProvider>
      <div className={darkMode ? 'dark' : ''}>
        <Component {...pageProps} setDarkMode={setDarkMode} darkMode={darkMode} />
      </div>
    </UserProvider>
  );
}

export default MyApp;

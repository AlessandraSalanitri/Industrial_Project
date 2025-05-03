import '@/styles/global.css'
import '@/styles/darkMode.css'
import { UserProvider } from '../context/UserContext';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {

  // Clear dark mode on logout (when no user is saved)
  useEffect(() => {
    const unsubscribe = window.addEventListener('storage', () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) setDarkMode(false);
    });
    return () => window.removeEventListener('storage', unsubscribe);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp;
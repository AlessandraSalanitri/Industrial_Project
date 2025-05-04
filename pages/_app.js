import '@/styles/global.css';
import '@/styles/darkMode.css';
import { UserProvider } from '../context/UserContext';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    const unsubscribe = window.addEventListener('storage', () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        document.documentElement.classList.remove('dark'); // safer fallback than calling setDarkMode
      }
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

export default appWithTranslation(MyApp);

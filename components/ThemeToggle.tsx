'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import '../styles/global.css';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('Theme mounted:', theme); 
  }, [theme]);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (

    <button
        onClick={toggleTheme}
        aria-label="Toggle Dark Mode"
        className="theme-toggle-btn"
        >
        {!mounted ? null : theme === 'dark' ? '🔆' : '🌙'}
        </button>
  );
  
};

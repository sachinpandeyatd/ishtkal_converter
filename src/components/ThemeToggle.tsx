import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-xl bg-divine-gold/30 dark:bg-divine-blue/50 text-divine-maroon dark:text-divine-pink hover:bg-divine-gold/50 dark:hover:bg-divine-blue/70 transition-all duration-300"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <FiMoon /> : <FiSun />}
    </button>
  );
};

export default ThemeToggle;
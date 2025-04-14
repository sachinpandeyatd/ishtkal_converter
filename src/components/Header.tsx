import React from 'react';
import ThemeToggle from './ThemeToggle';
import { FaOm } from 'react-icons/fa'; // Example icon

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl flex justify-between items-center p-4 rounded-lg shadow-md bg-white/50 dark:bg-black/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
         <FaOm className="text-3xl text-divine-saffron dark:text-divine-gold" />
        <h1 className="text-2xl sm:text-3xl font-bold font-devanagari text-divine-maroon dark:text-divine-pink">
          समय इष्टकाल परिवर्तक
        </h1>
         <span className="text-xs sm:text-sm font-sans mt-1 text-gray-600 dark:text-gray-300 hidden md:inline">Time to Ishtkaal Converter</span>
      </div>
      <ThemeToggle />
    </header>
  );
};

export default Header;
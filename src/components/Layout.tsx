import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { useTheme } from '../context/ThemeContext';

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {children}
      </main>
      <footer className={`py-6 text-center ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="text-sm">© {new Date().getFullYear()} AI Plagiarism Detector | Semantic Analysis Tool</p>
      </footer>
    </div>
  );
};

export default Layout;
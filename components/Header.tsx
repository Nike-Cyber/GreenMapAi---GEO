
import React from 'react';
import { View } from '../App';
import { FaMap, FaChartBar, FaListAlt, FaNewspaper, FaBrain, FaUser, FaUsers, FaSun, FaMoon, FaRobot, FaBullhorn } from 'react-icons/fa';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onLogout, theme, toggleTheme }) => {
  const navLinkClasses = (view: View) => 
    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      currentView === view 
        ? 'bg-forest-green text-cream' 
        : 'text-forest-green dark:text-dark-text-secondary hover:bg-lime-green/20 dark:hover:bg-gray-700'
    }`;

  const navLinks = [
    { view: View.MAP, label: 'Map', icon: <FaMap /> },
    { view: View.DASHBOARD, label: 'Dashboard', icon: <FaChartBar /> },
    { view: View.REPORTS, label: 'Reports', icon: <FaListAlt /> },
    { view: View.NEWS, label: 'News', icon: <FaNewspaper /> },
    { view: View.AI_ANALYSIS, label: 'AI Analysis', icon: <FaBrain /> },
    { view: View.CHATBOT, label: 'Chatbot', icon: <FaRobot /> },
    { view: View.FEEDBACK, label: 'Feedback', icon: <FaBullhorn /> },
    { view: View.PROFILE, label: 'Profile', icon: <FaUser /> },
    { view: View.ABOUT_US, label: 'About Us', icon: <FaUsers /> },
  ];

  return (
    <header className="bg-cream/80 dark:bg-dark-card/80 backdrop-blur-md shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <svg className="w-8 h-8 text-lime-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214C14.12 4.01 12.638 3.5 11.25 3.5c-1.286 0-2.485.45-3.44 1.25M12 21a8.25 8.25 0 005.962-13.952" />
           </svg>
          <h1 className="text-2xl font-bold text-forest-green dark:text-dark-text hidden sm:block">GreenMap</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-1 bg-lime-green/10 dark:bg-gray-900/50 p-1 rounded-lg">
          {navLinks.map(({ view, label, icon }) => (
            <button key={label} onClick={() => setCurrentView(view)} className={navLinkClasses(view)}>
              {icon}
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-forest-green dark:text-yellow-400 hover:bg-lime-green/20 dark:hover:bg-gray-700 transition-colors">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
            <button
                onClick={onLogout}
                className="bg-earth-red/10 text-earth-red px-4 py-2 rounded-md text-sm font-medium hover:bg-earth-red hover:text-white transition-colors duration-200"
            >
                Logout
            </button>
        </div>
      </div>
      {/* Mobile navigation */}
      <nav className="md:hidden flex items-center justify-around space-x-1 bg-lime-green/10 dark:bg-gray-900/50 p-1 overflow-x-auto">
          {navLinks.map(({ view, label, icon }) => (
            <button key={label} onClick={() => setCurrentView(view)} className={`${navLinkClasses(view)} flex-shrink-0 w-full flex-col h-14 justify-center text-xs px-1`}>
              {icon}
              <span>{label}</span>
            </button>
          ))}
      </nav>
    </header>
  );
};

export default Header;
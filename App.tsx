
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import ReportsView from './components/ReportsView';
import NewsView from './components/NewsView';
import AiAnalysisView from './components/AiAnalysisView';
import ProfileView from './components/ProfileView';
import AboutUsView from './components/AboutUsView';
import ChatbotView from './components/ChatbotView';
import FeedbackView from './components/FeedbackView';
import Footer from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { ErrorProvider } from './contexts/ErrorContext';


export enum View {
  MAP,
  DASHBOARD,
  REPORTS,
  NEWS,
  AI_ANALYSIS,
  PROFILE,
  ABOUT_US,
  CHATBOT,
  FEEDBACK,
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<View>(View.MAP);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const { theme, toggleTheme } = useTheme();
  const [welcomeUser, setWelcomeUser] = useState<string>('');

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('greenmap_user');
      if (storedUser) {
        let user;
        try {
          user = JSON.parse(storedUser); // Try to parse as object for new sessions
        } catch (e) {
          user = { username: storedUser, isAdmin: false }; // Fallback for old string-based sessions
        }
        
        if (user && user.username) {
            setUsername(user.username);
            setIsAdmin(user.isAdmin || false);
            setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error("Could not access session storage:", error);
    }
    
    const timer = setTimeout(() => setIsInitializing(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (welcomeUser) {
        const timer = setTimeout(() => {
            setWelcomeUser('');
        }, 3500); // Hide after 3.5 seconds
        return () => clearTimeout(timer);
    }
  }, [welcomeUser]);

  const handleLogin = (user: { username: string, isAdmin: boolean }) => {
    sessionStorage.setItem('greenmap_user', JSON.stringify(user)); // Persist user object
    setUsername(user.username);
    setIsAdmin(user.isAdmin);
    setIsLoggedIn(true);
    setWelcomeUser(user.username);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('greenmap_user'); // Clear user
    setUsername('');
    setIsAdmin(false);
    setIsLoggedIn(false);
    setCurrentView(View.MAP); // Reset to default view on logout
  };


  if (isInitializing) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-forest-green">
            <div className="flex flex-col items-center">
                <svg className="w-24 h-24 text-light-green animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8_0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-2xl font-semibold text-cream">GreenMap</p>
            </div>
        </div>
    );
  }


  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ErrorProvider>
      <div className={`flex flex-col min-h-screen font-sans transition-colors duration-300 bg-cream dark:bg-dark-bg`}>
        {welcomeUser && (
            <div className="fixed top-5 right-5 z-[100] bg-forest-green text-cream px-6 py-3 rounded-xl shadow-2xl animate-fade-in-up flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <p className="font-semibold">Welcome back, {welcomeUser}!</p>
            </div>
        )}
        <Header 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-grow">
          {currentView === View.MAP && <MapView theme={theme} isAdmin={isAdmin} />}
          {currentView === View.DASHBOARD && <Dashboard username={username} />}
          {currentView === View.REPORTS && <ReportsView isAdmin={isAdmin} />}
          {currentView === View.NEWS && <NewsView isAdmin={isAdmin} />}
          {currentView === View.AI_ANALYSIS && <AiAnalysisView />}
          {currentView === View.PROFILE && <ProfileView username={username} />}
          {currentView === View.ABOUT_US && <AboutUsView />}
          {currentView === View.CHATBOT && <ChatbotView />}
          {currentView === View.FEEDBACK && <FeedbackView isAdmin={isAdmin} />}
        </main>
        <Footer onFeedbackClick={() => setCurrentView(View.FEEDBACK)} />
      </div>
    </ErrorProvider>
  );
};

export default App;
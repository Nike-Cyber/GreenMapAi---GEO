import React, { createContext, useState, useCallback, useContext } from 'react';
import ErrorToast from '../components/ui/ErrorToast';

interface ErrorContextType {
  showError: (message: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleClose = useCallback(() => {
    setError(null);
  }, []);

  // Automatically clear the error after 5 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {error && <ErrorToast message={error} onClose={handleClose} />}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

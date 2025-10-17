import React from 'react';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  return (
    <div 
      role="alert"
      className="fixed top-5 right-5 z-[200] bg-earth-red text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in-up flex items-center gap-4 max-w-md"
    >
      <FaExclamationCircle className="text-2xl flex-shrink-0" />
      <p className="font-semibold flex-grow">{message}</p>
      <button 
        onClick={onClose} 
        className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0" 
        aria-label="Close error message"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default ErrorToast;

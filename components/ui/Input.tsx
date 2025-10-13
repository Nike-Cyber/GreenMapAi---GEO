import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-forest-green dark:text-dark-text-secondary mb-1">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 border border-lime-green/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-green focus:border-transparent transition duration-150 bg-white dark:bg-gray-700 dark:text-dark-text dark:border-gray-600 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
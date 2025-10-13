import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/70 dark:bg-dark-card backdrop-blur-sm rounded-xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
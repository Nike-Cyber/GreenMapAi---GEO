import React from 'react';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label={label}
        className="text-cream/80 hover:text-cream dark:text-dark-text-secondary dark:hover:text-dark-text transition-transform transform hover:scale-110"
    >
        {icon}
    </a>
);

interface FooterProps {
    onFeedbackClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onFeedbackClick }) => {
  return (
    <footer className="bg-forest-green dark:bg-gray-900 text-cream dark:text-dark-text-secondary p-6">
      <div className="container mx-auto text-center">
        <div className="mb-4">
            <button onClick={onFeedbackClick} className="text-sm text-cream/70 hover:text-cream dark:text-dark-text-secondary/80 dark:hover:text-dark-text hover:underline transition-colors">
                Submit Feedback
            </button>
        </div>
        <div className="flex justify-center items-center space-x-6 mb-4">
          <SocialLink href="https://www.linkedin.com" icon={<FaLinkedin size={24} />} label="LinkedIn" />
          <SocialLink href="https://www.github.com" icon={<FaGithub size={24} />} label="GitHub" />
          <SocialLink href="https://www.instagram.com" icon={<FaInstagram size={24} />} label="Instagram" />
        </div>
        <p>&copy; {new Date().getFullYear()} GreenMap. All rights reserved.</p>
        <p className="text-sm text-cream/70 dark:text-dark-text-secondary/80 mt-1">
          Join us in making the world a greener place, one report at a time.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
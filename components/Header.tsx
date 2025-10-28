import React from 'react';
import { View } from '../types';
import { LeafIcon } from './icons/LeafIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ChatIcon } from './icons/ChatIcon';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const navButtonClasses = (view: View) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      currentView === view
        ? 'bg-green-600 text-white shadow-md'
        : 'text-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-800/50'
    }`;

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <LeafIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-300 tracking-tight">
              FeatherFind AI
            </h1>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4 p-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg">
            <button onClick={() => setView('identifier')} className={navButtonClasses('identifier')}>
              <CameraIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Identifier</span>
            </button>
            <button onClick={() => setView('chat')} className={navButtonClasses('chat')}>
              <ChatIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Bird Chat</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
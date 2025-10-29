import React, { useState } from 'react';
import { BirdIdentifier } from './components/BirdIdentifier';
import { BirdChat } from './components/BirdChat';
import { Header } from './components/Header';
import { View } from './types';
import { BirdsongIdentifier } from './components/BirdsongIdentifier';

const App: React.FC = () => {
  const [view, setView] = useState<View>('identifier');

  return (
    <div className="min-h-screen bg-green-50/50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Header currentView={view} setView={setView} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {view === 'identifier' && <BirdIdentifier />}
        {view === 'chat' && <BirdChat />}
        {view === 'birdsong' && <BirdsongIdentifier />}
      </main>
      <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} FeatherFind AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;

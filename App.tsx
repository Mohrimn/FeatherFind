import React, { useState, useEffect } from 'react';
import { BirdIdentifier } from './components/BirdIdentifier';
import { BirdChat } from './components/BirdChat';
import { Header } from './components/Header';
import { View } from './types';
import { BirdsongIdentifier } from './components/BirdsongIdentifier';
import { isApiKeyConfigured } from './services/geminiService';
import { LeafIcon } from './components/icons/LeafIcon';

const App: React.FC = () => {
  const [view, setView] = useState<View>('identifier');
  const [isKeyConfigured, setIsKeyConfigured] = useState(true);

  useEffect(() => {
    setIsKeyConfigured(isApiKeyConfigured());
  }, []);

  if (!isKeyConfigured) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-red-200 dark:border-red-800">
            <LeafIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-red-800 dark:text-red-300">Configuration Error</h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                The Gemini API key is not configured for this environment.
            </p>
            <p className="mt-2 text-md text-gray-500 dark:text-gray-400">
                This application requires <code>process.env.API_KEY</code> to be set. This is done automatically when running in a supported environment like Google AI Studio. If you are running this project locally, you would need a development server that can provide this environment variable to the browser.
            </p>
        </div>
      </div>
    );
  }

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

import React, { useState, useEffect } from 'react';
import { BirdIdentifier } from './components/BirdIdentifier';
import { BirdChat } from './components/BirdChat';
import { Header } from './components/Header';
import { View } from './types';
import { BirdsongIdentifier } from './components/BirdsongIdentifier';
import { isApiKeyConfigured, initializeAi } from './services/geminiService';
import { LeafIcon } from './components/icons/LeafIcon';

const ApiKeySetup: React.FC<{ onKeySaved: () => void }> = ({ onKeySaved }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            sessionStorage.setItem('gemini_api_key', apiKey.trim());
            initializeAi(apiKey.trim());
            onKeySaved();
        }
    };

    return (
        <div className="min-h-screen bg-green-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                <LeafIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Enter Your Gemini API Key</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    To run this app locally, please provide your API key. It will be stored in your browser's session storage and only used for this session.
                </p>
                <div className="mt-6">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your API key here"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        onClick={handleSaveKey}
                        disabled={!apiKey.trim()}
                        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
                    >
                        Save & Start
                    </button>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('identifier');
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);

  useEffect(() => {
    const configured = isApiKeyConfigured();
    if(configured) {
        // If key is in process.env or session storage, initialize the AI service
        initializeAi(process.env.API_KEY || sessionStorage.getItem('gemini_api_key')!);
    }
    setIsKeyConfigured(configured);
  }, []);

  if (!isKeyConfigured) {
    return <ApiKeySetup onKeySaved={() => setIsKeyConfigured(true)} />;
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
        <p>Made by <a href="https://github.com/Mohrimn" target="_blank" rel="noopener noreferrer" className="hover:text-green-500">Mohrimn</a></p>
      </footer>
    </div>
  );
};

export default App;

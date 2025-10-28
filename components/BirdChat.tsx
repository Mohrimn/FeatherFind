
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { streamChatMessage, startChat } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { LeafIcon } from './icons/LeafIcon';

export const BirdChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChat();
    setMessages([
        {
            role: 'model',
            parts: [{text: "Hello! I'm your expert guide to the world of birds. Ask me anything about our feathered friends!"}]
        }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', parts: [{ text: input }] }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let fullResponse = '';
    const modelMessageIndex = newMessages.length;

    setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

    try {
      await streamChatMessage(input, newMessages, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[modelMessageIndex] = { role: 'model', parts: [{ text: fullResponse }] };
          return updatedMessages;
        });
      });
    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => {
            const updatedMessages = [...prev];
            updatedMessages[modelMessageIndex] = { role: 'model', parts: [{ text: "Sorry, I'm having a bit of trouble connecting right now. Please try again later." }] };
            return updatedMessages;
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white">Chat with a Bird Expert</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 flex-shrink-0 bg-green-500 text-white rounded-full flex items-center justify-center">
                <LeafIcon className="w-5 h-5"/>
              </div>
            )}
            <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user'
                ? 'bg-green-600 text-white rounded-br-none'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                 <div className="w-8 h-8 flex-shrink-0 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <LeafIcon className="w-5 h-5"/>
                </div>
                 <div className="max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-gray-700">
                    <SpinnerIcon />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about a bird..."
            className="flex-1 w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <SendIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};

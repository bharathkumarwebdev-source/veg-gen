import React, { useState, useEffect } from 'react';
import { DEFAULT_PRICES, DEFAULT_SETTINGS, APP_TITLE } from './constants';
import { PriceItem, Quote, QuoteSettings } from './types';
import { PriceManager } from './components/PriceManager';
import { Scanner } from './components/Scanner';
import { QuoteResult } from './components/QuoteResult';
import { Settings } from './components/Settings';
import { Inbox } from './components/Inbox';
import { ShoppingBag, ScanLine, DollarSign, Settings as SettingsIcon, MessageSquare } from 'lucide-react';

const App: React.FC = () => {
  // Initialize prices
  const [prices, setPrices] = useState<PriceItem[]>(() => {
    const saved = localStorage.getItem('veggiePrices');
    return saved ? JSON.parse(saved) : DEFAULT_PRICES;
  });

  // Initialize settings
  const [settings, setSettings] = useState<QuoteSettings>(() => {
    const saved = localStorage.getItem('veggieSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Initialize history
  const [history, setHistory] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('veggieHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist Data
  useEffect(() => { localStorage.setItem('veggiePrices', JSON.stringify(prices)); }, [prices]);
  useEffect(() => { localStorage.setItem('veggieSettings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('veggieHistory', JSON.stringify(history)); }, [history]);

  const [currentTab, setCurrentTab] = useState<'inbox' | 'scan' | 'prices' | 'settings'>('scan');
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);

  const handleQuoteGenerated = (quote: Quote) => {
    // Add to history immediately
    const newHistory = [quote, ...history];
    setHistory(newHistory);
    setActiveQuote(quote);
  };

  const handleUpdateQuote = (updatedQuote: Quote) => {
    // Update item in history
    const newHistory = history.map(q => q.id === updatedQuote.id ? updatedQuote : q);
    setHistory(newHistory);
    setActiveQuote(updatedQuote);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-green-100" />
            <h1 className="text-xl font-bold tracking-tight">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {activeQuote ? (
          <QuoteResult 
            quote={activeQuote} 
            settings={settings}
            onUpdateQuote={handleUpdateQuote}
            onBack={() => {
                setActiveQuote(null);
                setCurrentTab('inbox');
            }} 
          />
        ) : (
          <>
             {currentTab === 'inbox' && (
                <Inbox history={history} onSelectQuote={setActiveQuote} />
             )}

             {currentTab === 'scan' && (
                <div className="p-4 space-y-6">
                    <Scanner 
                      prices={prices} 
                      settings={settings}
                      onQuoteGenerated={handleQuoteGenerated} 
                    />
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <strong>Tip:</strong> Ensure your Price List is up to date in the "Prices" tab for accurate calculations.
                    </div>
                </div>
             )}

             {currentTab === 'prices' && (
                <div className="p-4">
                    <PriceManager prices={prices} setPrices={setPrices} />
                </div>
             )}

             {currentTab === 'settings' && (
                <div className="p-4">
                    <Settings settings={settings} setSettings={setSettings} />
                </div>
             )}
          </>
        )}
      </main>

      {/* Navigation Bar */}
      {!activeQuote && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-md mx-auto grid grid-cols-4">
                <button 
                    onClick={() => setCurrentTab('inbox')}
                    className={`flex flex-col items-center justify-center p-3 transition ${currentTab === 'inbox' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
                >
                    <MessageSquare size={22} />
                    <span className="text-[10px] font-bold mt-1">Inbox</span>
                </button>
                <button 
                    onClick={() => setCurrentTab('scan')}
                    className={`flex flex-col items-center justify-center p-3 transition ${currentTab === 'scan' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
                >
                    <ScanLine size={22} />
                    <span className="text-[10px] font-bold mt-1">Scan</span>
                </button>
                <button 
                    onClick={() => setCurrentTab('prices')}
                    className={`flex flex-col items-center justify-center p-3 transition ${currentTab === 'prices' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
                >
                    <DollarSign size={22} />
                    <span className="text-[10px] font-bold mt-1">Prices</span>
                </button>
                 <button 
                    onClick={() => setCurrentTab('settings')}
                    className={`flex flex-col items-center justify-center p-3 transition ${currentTab === 'settings' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
                >
                    <SettingsIcon size={22} />
                    <span className="text-[10px] font-bold mt-1">Settings</span>
                </button>
            </div>
        </nav>
      )}
    </div>
  );
};

export default App;
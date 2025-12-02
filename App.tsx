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
    const newHistory = [quote, ...history];
    setHistory(newHistory);
    setActiveQuote(quote);
  };

  const handleUpdateQuote = (updatedQuote: Quote) => {
    const newHistory = history.map(q => q.id === updatedQuote.id ? updatedQuote : q);
    setHistory(newHistory);
    setActiveQuote(updatedQuote);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-blue-50/30 text-slate-900 pb-28">
      
      {/* Dynamic Header */}
      {!activeQuote && (
        <header className="sticky top-0 z-30 glass border-b-0">
          <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-green-200">
                <ShoppingBag size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                {APP_TITLE}
              </h1>
            </div>
            <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200">
              v1.0
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="max-w-md mx-auto animate-in">
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

      {/* Floating Glass Navigation */}
      {!activeQuote && (
        <div className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto">
          <nav className="glass bg-white/90 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 p-2">
            <div className="grid grid-cols-4 gap-1">
                <NavButton 
                  active={currentTab === 'inbox'} 
                  onClick={() => setCurrentTab('inbox')} 
                  icon={<MessageSquare size={24} />} 
                  label="Inbox" 
                />
                <NavButton 
                  active={currentTab === 'scan'} 
                  onClick={() => setCurrentTab('scan')} 
                  icon={<ScanLine size={24} />} 
                  label="Scan" 
                />
                <NavButton 
                  active={currentTab === 'prices'} 
                  onClick={() => setCurrentTab('prices')} 
                  icon={<DollarSign size={24} />} 
                  label="Prices" 
                />
                <NavButton 
                  active={currentTab === 'settings'} 
                  onClick={() => setCurrentTab('settings')} 
                  icon={<SettingsIcon size={24} />} 
                  label="Settings" 
                />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${
      active 
      ? 'bg-green-50 text-green-600 scale-105 shadow-sm' 
      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? '-translate-y-0.5' : ''}`}>
      {React.cloneElement(icon as React.ReactElement, { 
        strokeWidth: active ? 2.5 : 2,
        size: 22
      })}
    </div>
    <span className={`text-[10px] font-bold mt-1 ${active ? 'opacity-100' : 'opacity-70'}`}>
      {label}
    </span>
  </button>
);

export default App;
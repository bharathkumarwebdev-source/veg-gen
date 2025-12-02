import React from 'react';
import { Quote } from '../types';
import { User, Check, Clock, ChevronRight } from 'lucide-react';

interface Props {
  history: Quote[];
  onSelectQuote: (quote: Quote) => void;
}

export const Inbox: React.FC<Props> = ({ history, onSelectQuote }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 p-8 text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-6 shadow-inner">
            <Clock size={48} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">No Orders Yet</h3>
        <p className="text-sm max-w-xs mx-auto leading-relaxed">
            Your recent quotes and orders will appear here. Tap the Scan button to start.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="flex items-center justify-between mb-2">
         <h2 className="text-xl font-bold text-slate-800">Inbox</h2>
         <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm">
            {history.length} Orders
         </span>
      </div>
      
      <div className="space-y-3 pb-20">
        {history.map((quote) => (
          <div 
            key={quote.id} 
            onClick={() => onSelectQuote(quote)}
            className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex justify-between items-center relative overflow-hidden"
          >
             {/* Status Line Indicator */}
             <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                 quote.status === 'confirmed' ? 'bg-green-500' : 
                 quote.status.includes('sent') ? 'bg-blue-500' : 'bg-slate-300'
             }`}></div>

            <div className="flex items-center gap-4 pl-2 overflow-hidden">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${
                    quote.status === 'confirmed' ? 'bg-gradient-to-br from-green-100 to-emerald-200 text-green-700' : 
                    'bg-slate-100 text-slate-500'
                }`}>
                    <User size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                         <div className="font-bold text-slate-800 truncate text-base">
                            {quote.customerName || `Customer ${quote.customerPhoneNumber?.slice(-4) ? '#' + quote.customerPhoneNumber.slice(-4) : ''}` || 'Draft Order'}
                        </div>
                        {quote.status === 'sent_api' && (
                            <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">API</span>
                        )}
                    </div>
                    
                    <div className="text-sm text-slate-500 truncate mt-0.5 font-medium flex items-center gap-1.5">
                        <span className="text-slate-700">₹{quote.total}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>{quote.items.length} items</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 pl-2">
                <span className="text-[11px] font-semibold text-slate-400">
                    {new Date(quote.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <div className="flex items-center gap-1">
                    {quote.status === 'confirmed' && <Check size={16} className="text-green-500" strokeWidth={3} />}
                    {quote.status.includes('sent') && <Check size={16} className="text-blue-500" strokeWidth={3} />}
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
import React from 'react';
import { Quote } from '../types';
import { User, Check, Clock, ChevronRight, Phone } from 'lucide-react';

interface Props {
  history: Quote[];
  onSelectQuote: (quote: Quote) => void;
}

export const Inbox: React.FC<Props> = ({ history, onSelectQuote }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Clock size={40} />
        </div>
        <h3 className="text-lg font-medium text-gray-600">No Orders Yet</h3>
        <p className="text-sm">Scan a list to start tracking orders.</p>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-2">
      <h2 className="text-xl font-bold text-gray-800 px-4 pt-4 mb-2">Order Inbox</h2>
      <div className="bg-white border-t border-b border-gray-200 divide-y">
        {history.map((quote) => (
          <div 
            key={quote.id} 
            onClick={() => onSelectQuote(quote)}
            className="p-4 hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer flex justify-between items-center"
          >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${quote.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                    <User size={20} />
                </div>
                <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
                        {quote.customerName || `Customer #${quote.customerPhoneNumber?.slice(-4) || 'Unknown'}`}
                        {quote.status === 'sent_api' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide">API</span>}
                    </div>
                    <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                        {quote.items.length} items • ₹{quote.total} • 
                        <span className="text-xs">{new Date(quote.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 pl-2">
                {quote.status === 'confirmed' && <span className="text-green-600"><Check size={16} /></span>}
                {quote.status.includes('sent') && <span className="text-blue-500"><Check size={16} /></span>}
                {quote.status === 'draft' && <span className="text-gray-300"><Clock size={16} /></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
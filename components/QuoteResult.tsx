import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote, QuoteSettings, QuoteStatus } from '../types';
import { Check, ArrowLeft, User, Send, Loader2, Smartphone } from 'lucide-react';
import { sendWhatsAppMessage } from '../services/whatsappService';

interface Props {
  quote: Quote;
  onBack: () => void;
  onUpdateQuote: (quote: Quote) => void;
  settings?: QuoteSettings;
}

const getSettings = (): QuoteSettings | null => {
    const saved = localStorage.getItem('veggieSettings');
    return saved ? JSON.parse(saved) : null;
};

export const QuoteResult: React.FC<Props> = ({ quote, onBack, onUpdateQuote, settings }) => {
  const [activeSettings, setActiveSettings] = useState<QuoteSettings | null>(settings || null);
  const [phone, setPhone] = useState('');
  const [messageText, setMessageText] = useState(quote.rawText);
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [autoSendCountdown, setAutoSendCountdown] = useState<number | null>(null);
  const hasAutoSentRef = useRef(false);

  useEffect(() => {
    if (!settings) setActiveSettings(getSettings());
    else setActiveSettings(settings);
  }, [settings]);

  // Sync state with prop
  useEffect(() => {
    if (quote.customerPhoneNumber && !phone) {
        const cleaned = quote.customerPhoneNumber.replace(/\D/g, '');
        if (cleaned.length >= 10) setPhone(cleaned);
    }
  }, [quote.customerPhoneNumber, phone]);

  useEffect(() => {
      setMessageText(quote.rawText);
  }, [quote.rawText]);

  const updateStatus = (newStatus: QuoteStatus) => {
      onUpdateQuote({ ...quote, status: newStatus });
  };

  const handleManualWhatsApp = useCallback(() => {
    updateStatus('sent_manual');
    const encodedText = encodeURIComponent(messageText);
    let url = `https://wa.me/?text=${encodedText}`;
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length >= 10) {
        let targetPhone = cleanPhone;
        // Ensure India code if missing (default assumption for this app context)
        if (targetPhone.length === 10) targetPhone = '91' + targetPhone;
        url = `https://wa.me/${targetPhone}?text=${encodedText}`;
    }
    
    // CRITICAL FIX: "wa.me refused to connect"
    // WhatsApp blocks being loaded in iframes (X-Frame-Options: DENY).
    // Using window.open(..., '_blank') forces a new tab/window, which bypasses this restriction.
    const win = window.open(url, '_blank');
    
    // Fallback detection for popup blockers (common when triggered by auto-timers)
    if (!win) {
        alert("Pop-up blocked! Please allow pop-ups for this site to open WhatsApp automatically.");
    }
  }, [messageText, phone, quote, onUpdateQuote]);

  const handleApiSend = useCallback(async () => {
      if (!activeSettings?.whatsappApi.enabled) return;
      setIsSending(true);
      setApiError(null);

      try {
          await sendWhatsAppMessage(activeSettings.whatsappApi, phone, messageText);
          updateStatus('sent_api');
      } catch (err: any) {
          setApiError(err.message || "Failed to send");
      } finally {
          setIsSending(false);
      }
  }, [activeSettings, phone, messageText, quote, onUpdateQuote]);

  // Auto Send Logic
  useEffect(() => {
      if (!activeSettings?.autoRedirectWhatsApp || quote.status !== 'draft') return;
      if (hasAutoSentRef.current) return;
      
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) return;

      // Handle Instant Send (No Timer)
      if (activeSettings.instantSend) {
           hasAutoSentRef.current = true;
           if (activeSettings.whatsappApi.enabled) {
              handleApiSend();
           } else {
              // Manual Redirect generally needs a timer/user gesture to avoid aggressive popup blocking,
              // but if "Instant" is requested, we try immediately.
              handleManualWhatsApp();
           }
           return;
      }

      // Handle Timer Send
      hasAutoSentRef.current = true;
      let count = 2;
      setAutoSendCountdown(count);

      const interval = setInterval(() => {
          count -= 1;
          if (count <= 0) {
              clearInterval(interval);
              setAutoSendCountdown(null);
              
              if (activeSettings.whatsappApi.enabled) {
                  handleApiSend();
              } else {
                  handleManualWhatsApp();
              }
          } else {
              setAutoSendCountdown(count);
          }
      }, 1000);
      return () => clearInterval(interval);
  }, [activeSettings, phone, quote.status, handleApiSend, handleManualWhatsApp]);

  const isReadyToSend = phone.replace(/\D/g, '').length >= 10;
  const isApiEnabled = activeSettings?.whatsappApi.enabled || false;

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      {/* WhatsApp-style Header */}
      <div className="bg-[#075e54] text-white p-3 flex items-center gap-3 shadow-md z-10 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-white/90">
          <ArrowLeft size={24} />
        </button>
        <div className="bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
            <User size={24} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="font-bold truncate text-base">
                {quote.customerName || (phone ? `+91 ${phone}` : 'New Customer')}
            </div>
            <div className="text-xs text-white/80 truncate">
                {quote.status === 'confirmed' ? 'Replied' : quote.status.includes('sent') ? 'Message Sent' : 'Drafting Order...'}
            </div>
        </div>
        {quote.status === 'sent_api' && (
            <button 
                onClick={() => updateStatus('confirmed')}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white flex items-center gap-1"
                title="Mark as Received Reply"
            >
                <Check size={14} /> Mark Reply
            </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
         
         {/* System Notice */}
         <div className="flex justify-center">
             <span className="bg-[#e1f3fb] text-gray-600 text-xs px-3 py-1 rounded shadow-sm">
                Order generated at {new Date(quote.timestamp).toLocaleTimeString()}
             </span>
         </div>

         {/* The Generated Quote Bubble (Outgoing) */}
         <div className="flex justify-end">
             <div className="bg-[#dcf8c6] rounded-lg p-2 shadow max-w-[85%] relative min-w-[200px]">
                 {/* Editable Text Area */}
                 <textarea
                     className="w-full bg-transparent border-none outline-none text-sm text-gray-900 font-sans leading-relaxed resize-none overflow-hidden"
                     value={messageText}
                     onChange={(e) => setMessageText(e.target.value)}
                     rows={messageText.split('\n').length + 1}
                     style={{ minHeight: '100px' }}
                 />
                 
                 <div className="flex justify-end items-center gap-1 mt-1">
                     <span className="text-[10px] text-gray-500">
                        {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                     <span className={`${quote.status === 'draft' ? 'text-gray-400' : 'text-blue-500'}`}>
                        {quote.status === 'draft' ? <Check size={14} /> : <div className="flex -space-x-1"><Check size={14} /><Check size={14} /></div>}
                     </span>
                 </div>
             </div>
         </div>

         {/* Error Bubble */}
         {apiError && (
             <div className="flex justify-center my-2">
                 <span className="bg-red-100 text-red-800 text-xs px-3 py-2 rounded shadow border border-red-200 flex items-center gap-2">
                     <Smartphone size={14} /> Failed to send: {apiError}
                 </span>
             </div>
         )}

         {/* Received Reply Simulation */}
         {quote.status === 'confirmed' && (
             <div className="flex justify-start">
                 <div className="bg-white rounded-lg p-3 shadow max-w-[80%]">
                     <div className="text-sm text-gray-800">
                         Got it, send it over.
                     </div>
                     <span className="text-[10px] text-gray-400 block text-right mt-1">Just now</span>
                 </div>
             </div>
         )}
      </div>

      {/* Input / Actions Area */}
      <div className="bg-[#f0f0f0] p-3 shrink-0 flex items-end gap-2">
        
        {/* Phone Input Overlay if missing */}
        <div className="flex-1 bg-white rounded-2xl flex items-center border border-gray-300 shadow-sm overflow-hidden px-4 py-2">
             <span className="text-gray-400 mr-2 text-sm">+91</span>
             <input 
                className="flex-1 outline-none text-gray-700 bg-transparent"
                placeholder="Customer Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
             />
        </div>

        {/* Action Buttons */}
        {isApiEnabled ? (
            <button 
                onClick={handleApiSend}
                disabled={isSending || !isReadyToSend}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
                    isSending || !isReadyToSend 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#00a884] hover:bg-[#008f6f] text-white'
                }`}
            >
                {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
        ) : (
             <button 
                onClick={handleManualWhatsApp}
                className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center shadow-md hover:bg-[#008f6f] text-white transition-all"
            >
                <Send size={20} />
            </button>
        )}
      </div>

      {/* API Toggle Notice for UX */}
      {isApiEnabled && !isReadyToSend && (
          <div className="bg-yellow-50 text-yellow-800 text-xs p-2 text-center">
              Enter phone number to enable Direct Sending
          </div>
      )}

      {/* Auto Send Overlay */}
      {(autoSendCountdown !== null || (activeSettings?.instantSend && isSending)) && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg text-center shadow-2xl max-w-sm mx-4">
                  <div className="animate-spin mb-4 text-green-600 mx-auto w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
                  <h3 className="text-lg font-bold mb-2">
                      {activeSettings?.whatsappApi.enabled ? 'Sending via API...' : 'Opening WhatsApp...'}
                  </h3>
                  {activeSettings?.instantSend && <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Instant Mode</p>}
                  
                  {!activeSettings?.whatsappApi.enabled && (
                      <p className="text-sm text-gray-500 mb-4">Please allow popups if blocked.</p>
                  )}
                  <button onClick={() => {hasAutoSentRef.current = true; setAutoSendCountdown(null);}} className="text-red-500 font-bold text-sm uppercase mt-2">Cancel</button>
              </div>
          </div>
      )}
    </div>
  );
};
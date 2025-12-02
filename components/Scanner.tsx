import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Loader2, Upload, ClipboardPaste, Share2, Image as ImageIcon } from 'lucide-react';
import { PriceItem, Quote, ParsedOrder, QuoteSettings, OrderItem } from '../types';
import { fileToGenerativePart, parseVegetableOrder } from '../services/geminiService';

interface Props {
  prices: PriceItem[];
  settings: QuoteSettings;
  onQuoteGenerated: (quote: Quote) => void;
}

export const Scanner: React.FC<Props> = ({ prices, settings, onQuoteGenerated }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateQuote = useCallback((parsedData: ParsedOrder): Quote => {
    let total = 0;
    const items: OrderItem[] = parsedData.items.map((pItem: any) => {
      const matchedPrice = prices.find(
        p => p.name.toLowerCase() === pItem.originalName.toLowerCase()
      );

      let cost = 0;
      if (matchedPrice) {
        let quantityInPriceUnit = pItem.quantity;
        if (pItem.unit === 'g' && matchedPrice.unit === 'kg') {
          quantityInPriceUnit = pItem.quantity / 1000;
        } else if (pItem.unit === 'kg' && matchedPrice.unit === 'g') {
           quantityInPriceUnit = pItem.quantity * 1000;
        }
        cost = quantityInPriceUnit * matchedPrice.price;
      }
      total += cost;
      return {
        originalName: pItem.originalName,
        matchedItemId: matchedPrice?.id,
        quantity: pItem.quantity,
        unit: pItem.unit,
        calculatedPrice: cost
      };
    });

    let rawText = "";
    if (settings.headerText) rawText += `*${settings.headerText}*\n`;
    if (settings.showDate) {
        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        rawText += `Date: ${dateStr}\n`;
    }
    if (settings.showCustomer && parsedData.customerName) {
        rawText += `Customer: *${parsedData.customerName}*\n`;
    }
    rawText += `------------------------\n`;
    items.forEach(item => {
      const priceStr = item.calculatedPrice > 0 ? `₹${item.calculatedPrice.toFixed(0)}` : 'N/A';
      rawText += `• ${item.originalName} (${item.quantity}${item.unit}): *${priceStr}*\n`;
    });
    rawText += `------------------------\n`;
    if (settings.showTotal) {
        rawText += `*Total Amount: ₹${Math.ceil(total)}*\n`;
        rawText += `------------------------\n`;
    }
    if (settings.footerText) rawText += `${settings.footerText}`;

    return { 
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: 'draft',
      items, 
      total: Math.ceil(total), 
      rawText,
      customerName: parsedData.customerName,
      customerPhoneNumber: parsedData.customerPhoneNumber
    };
  }, [prices, settings]);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Please upload an image file.");
        return;
    }
    setIsProcessing(true);
    try {
      const base64Data = await fileToGenerativePart(file);
      const parsedData = await parseVegetableOrder(base64Data, file.type, prices);
      const quote = calculateQuote(parsedData);
      onQuoteGenerated(quote);
    } catch (error) {
      alert("Error processing image. Please ensure the list is legible.");
      console.error(error);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [prices, calculateQuote, onQuoteGenerated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  useEffect(() => {
    const checkSharedFile = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('shared') === 'true' && 'caches' in window) {
        try {
          const cache = await caches.open('share-target-cache');
          const response = await cache.match('shared-image');
          if (response) {
            const blob = await response.blob();
            await cache.delete('shared-image');
            window.history.replaceState({}, '', window.location.pathname);
            const file = new File([blob], "shared-image.jpg", { type: blob.type });
            processFile(file);
          }
        } catch (e) {
          console.error("Failed to retrieve shared file", e);
        }
      }
    };
    checkSharedFile();
  }, [processFile]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files?.length) {
        const file = e.clipboardData.files[0];
        processFile(file);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteClick = async () => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
                const blob = await item.getType(imageType);
                const file = new File([blob], "pasted-image.png", { type: imageType });
                processFile(file);
                return;
            }
        }
        alert("No image found in clipboard.");
    } catch (err) {
        alert("Click anywhere and press Ctrl+V to paste.");
    }
  };

  return (
    <div className="relative">
      <div 
        className={`bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center justify-center min-h-[55vh] transition-all duration-300 border-2 ${isDragging ? 'border-green-500 bg-green-50 scale-[1.02]' : 'border-transparent'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-full shadow-inner ring-1 ring-black/5">
            <ImageIcon size={64} className="text-green-600/80 drop-shadow-sm" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg text-green-600">
             <Camera size={20} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Scan Order</h2>
        <p className="text-slate-500 text-center text-sm max-w-[240px] leading-relaxed mb-8">
          Take a photo, drag & drop, or paste from WhatsApp directly.
        </p>

        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div className="flex flex-col w-full max-w-xs gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="group relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-2xl text-lg font-bold shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={24} /> Processing...
              </>
            ) : (
              <>
                <Upload size={20} strokeWidth={2.5} /> Upload Photo
              </>
            )}
          </button>

          <button 
            onClick={handlePasteClick}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 hover:border-green-300 hover:bg-green-50/50 py-3.5 px-6 rounded-2xl font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <ClipboardPaste size={18} /> Paste from Clipboard
          </button>
        </div>
      </div>

      {/* Tip Card */}
      <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
         <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm shrink-0">
               <Share2 size={20} className="text-white" />
            </div>
            <div>
               <h3 className="font-bold text-sm mb-1">WhatsApp Integration</h3>
               <p className="text-xs text-blue-50 leading-relaxed opacity-90">
                 Tap <strong>Share</strong> on any image in WhatsApp and select this app to generate a quote instantly.
               </p>
            </div>
         </div>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-100 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-8 h-8 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="mt-6 font-bold text-xl text-slate-800 tracking-tight">Analyzing Order</div>
          <div className="text-sm text-slate-500 mt-2">Reading items & prices...</div>
        </div>
      )}
    </div>
  );
};
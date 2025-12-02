import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Loader2, Upload, ClipboardPaste, Share2, Download } from 'lucide-react';
import { PriceItem, Quote, OrderItem, ParsedOrder, QuoteSettings } from '../types';
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
      // Find matching price item by name (case insensitive)
      const matchedPrice = prices.find(
        p => p.name.toLowerCase() === pItem.originalName.toLowerCase()
      );

      let cost = 0;
      if (matchedPrice) {
        // Simple unit conversion logic
        let quantityInPriceUnit = pItem.quantity;
        
        // Convert g to kg if price is in kg
        if (pItem.unit === 'g' && matchedPrice.unit === 'kg') {
          quantityInPriceUnit = pItem.quantity / 1000;
        } 
        // Convert kg to g if price is in g
        else if (pItem.unit === 'kg' && matchedPrice.unit === 'g') {
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

    // --- Dynamic Text Generation based on Settings ---
    let rawText = "";

    // Header
    if (settings.headerText) {
        rawText += `*${settings.headerText}*\n`;
    }

    // Date
    if (settings.showDate) {
        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        rawText += `Date: ${dateStr}\n`;
    }
    
    // Customer
    if (settings.showCustomer) {
        if (parsedData.customerName) {
            rawText += `Customer: *${parsedData.customerName}*\n`;
        }
    }
    
    rawText += `------------------------\n`;
    
    // Items
    items.forEach(item => {
      const priceStr = item.calculatedPrice > 0 ? `₹${item.calculatedPrice.toFixed(0)}` : 'N/A';
      rawText += `• ${item.originalName} (${item.quantity}${item.unit}): *${priceStr}*\n`;
    });
    
    rawText += `------------------------\n`;
    
    // Total
    if (settings.showTotal) {
        rawText += `*Total Amount: ₹${Math.ceil(total)}*\n`;
        rawText += `------------------------\n`;
    }
    
    // Footer
    if (settings.footerText) {
        rawText += `${settings.footerText}`;
    }

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
      const mimeType = file.type;
      
      const parsedData = await parseVegetableOrder(base64Data, mimeType, prices);
      const quote = calculateQuote(parsedData);
      onQuoteGenerated(quote);
    } catch (error) {
      alert("Error processing image. Please ensure the list is legible.");
      console.error(error);
    } finally {
      setIsProcessing(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [prices, calculateQuote, onQuoteGenerated]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // --- Share Target Logic (Service Worker Cache) ---
  useEffect(() => {
    const checkSharedFile = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('shared') === 'true' && 'caches' in window) {
        try {
          const cache = await caches.open('share-target-cache');
          const response = await cache.match('shared-image');
          if (response) {
            const blob = await response.blob();
            // Clean up cache
            await cache.delete('shared-image');
            // Remove query param to prevent re-processing on reload
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

  // --- Clipboard Paste Logic ---
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

  // --- Drag & Drop Logic ---
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
        alert("No image found in clipboard. Copy an image from WhatsApp first.");
    } catch (err) {
        console.error("Clipboard access failed:", err);
        alert("To paste: Click anywhere on this page and press Ctrl+V (or Command+V).");
    }
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow space-y-6 min-h-[60vh] transition-colors relative ${isDragging ? 'bg-green-100 border-2 border-dashed border-green-500' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-green-50/90 rounded-lg">
           <div className="text-2xl font-bold text-green-700 animate-bounce">Drop Image Here!</div>
        </div>
      )}

      <div className="text-center space-y-3">
        <div className="bg-green-50 p-5 rounded-full inline-block ring-8 ring-green-50/50">
          <Upload size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Scan Order</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Upload photo, <strong>Drag & Drop</strong>, or Copy & Paste directly from WhatsApp.
        </p>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="flex flex-col w-full gap-3 max-w-xs">
        {/* Main Upload Button */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-lg hover:bg-green-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Camera /> Upload Photo
            </>
          )}
        </button>

        {/* Paste Button */}
        <button 
          onClick={handlePasteClick}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 bg-white text-green-700 border-2 border-green-100 py-3 px-6 rounded-xl font-semibold hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          <ClipboardPaste size={20} /> Paste from Clipboard
        </button>
      </div>

      {/* Pro Tip Section */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 w-full max-w-sm">
         <div className="font-bold flex items-center gap-2 mb-2 text-gray-800">
             <Share2 size={16} /> Receieve Directly from WhatsApp:
         </div>
         <ol className="list-decimal list-inside space-y-1 ml-1">
             <li>Install this app (Add to Home Screen).</li>
             <li>Open image in WhatsApp.</li>
             <li>Tap <strong>Share</strong> and select <strong>VeggieQuote</strong>.</li>
         </ol>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center rounded-lg">
          <Loader2 size={48} className="text-green-600 animate-spin mb-4" />
          <div className="font-bold text-lg text-gray-800">Analyzing Order...</div>
          <div className="text-sm text-gray-500 mt-1">Reading items & phone number</div>
        </div>
      )}
    </div>
  );
};

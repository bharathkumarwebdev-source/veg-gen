import React, { useState } from 'react';
import { QuoteSettings } from '../types';
import { MessageCircle, Key, Smartphone, AlertTriangle, Zap, Gauge } from 'lucide-react';

interface Props {
  settings: QuoteSettings;
  setSettings: (settings: QuoteSettings) => void;
}

export const Settings: React.FC<Props> = ({ settings, setSettings }) => {
  const handleChange = (field: keyof QuoteSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleApiChange = (field: keyof typeof settings.whatsappApi, value: any) => {
    setSettings({
      ...settings,
      whatsappApi: {
        ...settings.whatsappApi,
        [field]: value
      }
    });
  };

  const [showApiConfig, setShowApiConfig] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        Message Configuration
      </h2>

      <div className="space-y-6">
        {/* Header Text */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Header Text</label>
            <input 
                type="text" 
                value={settings.headerText}
                onChange={(e) => handleChange('headerText', e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                placeholder="e.g. Vegetable Bill"
            />
        </div>

        {/* Footer Text */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
            <textarea 
                value={settings.footerText}
                onChange={(e) => handleChange('footerText', e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition h-24 resize-none"
                placeholder="e.g. Thank you for shopping!"
            />
        </div>

        {/* Toggles */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Include Fields</h3>
            
            <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-800 font-medium">Show Date</span>
                <input 
                    type="checkbox" 
                    checked={settings.showDate}
                    onChange={(e) => handleChange('showDate', e.target.checked)}
                    className="w-6 h-6 accent-green-600 rounded"
                />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-800 font-medium">Show Customer Details</span>
                <input 
                    type="checkbox" 
                    checked={settings.showCustomer}
                    onChange={(e) => handleChange('showCustomer', e.target.checked)}
                    className="w-6 h-6 accent-green-600 rounded"
                />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-800 font-medium">Show Total Amount</span>
                <input 
                    type="checkbox" 
                    checked={settings.showTotal}
                    onChange={(e) => handleChange('showTotal', e.target.checked)}
                    className="w-6 h-6 accent-green-600 rounded"
                />
            </label>
        </div>

        {/* Automation Section */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 space-y-4">
             <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                <Zap size={16} /> Automation
             </h3>
             
             <label className="flex items-start justify-between cursor-pointer gap-2">
                <div className="flex flex-col">
                    <span className="text-gray-800 font-bold">Auto-Send / Redirect</span>
                    <span className="text-xs text-gray-600">
                        Automatically trigger send actions when a phone number is detected.
                    </span>
                </div>
                <input 
                    type="checkbox" 
                    checked={settings.autoRedirectWhatsApp}
                    onChange={(e) => handleChange('autoRedirectWhatsApp', e.target.checked)}
                    className="w-6 h-6 accent-green-600 rounded shrink-0 mt-1"
                />
            </label>

            {settings.autoRedirectWhatsApp && (
                <label className="flex items-start justify-between cursor-pointer gap-2 pt-2 border-t border-blue-100">
                    <div className="flex flex-col">
                        <span className="text-gray-800 font-bold flex items-center gap-1">
                             <Gauge size={14} className="text-red-500"/> Instant Send (No Timer)
                        </span>
                        <span className="text-xs text-gray-600">
                            Skip the 2-second countdown. Sends immediately.
                        </span>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={settings.instantSend}
                        onChange={(e) => handleChange('instantSend', e.target.checked)}
                        className="w-6 h-6 accent-red-500 rounded shrink-0 mt-1"
                    />
                </label>
            )}
        </div>

        {/* WhatsApp Cloud API Section */}
        <div className="border border-green-200 rounded-lg overflow-hidden">
            <button 
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="w-full flex items-center justify-between p-4 bg-green-50 text-green-900 font-medium"
            >
                <div className="flex items-center gap-2">
                    <MessageCircle size={20} />
                    WhatsApp Cloud API (Advanced)
                </div>
                <div className="text-xs bg-green-200 px-2 py-1 rounded">
                    {settings.whatsappApi.enabled ? 'Enabled' : 'Disabled'}
                </div>
            </button>
            
            {showApiConfig && (
                <div className="p-4 bg-white space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                        <AlertTriangle size={16} className="shrink-0" />
                        <p>Requires a Meta Developer Account and configured app. Tokens are stored locally in your browser.</p>
                    </div>

                    <label className="flex items-center justify-between cursor-pointer py-2">
                        <span className="text-gray-800 font-medium">Enable API Integration</span>
                        <input 
                            type="checkbox" 
                            checked={settings.whatsappApi.enabled}
                            onChange={(e) => handleApiChange('enabled', e.target.checked)}
                            className="w-6 h-6 accent-green-600 rounded"
                        />
                    </label>

                    {settings.whatsappApi.enabled && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                    <Smartphone size={12} /> Phone Number ID
                                </label>
                                <input 
                                    type="text" 
                                    value={settings.whatsappApi.phoneNumberId}
                                    onChange={(e) => handleApiChange('phoneNumberId', e.target.value)}
                                    className="w-full p-2 border rounded font-mono text-sm"
                                    placeholder="e.g. 104523..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                    <Key size={12} /> Access Token
                                </label>
                                <input 
                                    type="password" 
                                    value={settings.whatsappApi.accessToken}
                                    onChange={(e) => handleApiChange('accessToken', e.target.value)}
                                    className="w-full p-2 border rounded font-mono text-sm"
                                    placeholder="e.g. EAAG..."
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>

        <div className="text-xs text-gray-400 text-center pt-4">
            Settings are saved automatically.
        </div>
      </div>
    </div>
  );
};
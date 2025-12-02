import React, { useState } from 'react';
import { QuoteSettings } from '../types';
import { MessageCircle, Key, Smartphone, AlertTriangle, Zap, Gauge, Type, Layout, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="space-y-6">
      
      {/* Appearance Card */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
            <Layout size={20} className="text-green-600" />
            <span className="text-lg">Message Format</span>
        </h3>
        
        <div className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Header</label>
                <div className="relative">
                    <Type className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={settings.headerText}
                        onChange={(e) => handleChange('headerText', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-green-500 font-medium outline-none transition"
                        placeholder="e.g. Vegetable Bill"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Footer</label>
                <textarea 
                    value={settings.footerText}
                    onChange={(e) => handleChange('footerText', e.target.value)}
                    className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-green-500 font-medium outline-none transition h-24 resize-none leading-relaxed"
                    placeholder="e.g. Thank you for shopping!"
                />
            </div>

            <div className="pt-2 grid gap-4">
                <Toggle 
                    label="Show Date" 
                    checked={settings.showDate} 
                    onChange={(v) => handleChange('showDate', v)} 
                />
                <Toggle 
                    label="Show Customer Details" 
                    checked={settings.showCustomer} 
                    onChange={(v) => handleChange('showCustomer', v)} 
                />
                <Toggle 
                    label="Show Total Amount" 
                    checked={settings.showTotal} 
                    onChange={(v) => handleChange('showTotal', v)} 
                />
            </div>
        </div>
      </section>

      {/* Automation Card */}
      <section className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 shadow-lg shadow-blue-200 text-white">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
            <Zap size={20} className="text-yellow-300 fill-yellow-300" />
            <span className="text-lg">Automation</span>
        </h3>
        
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 space-y-4">
             <Toggle 
                label="Auto-Send / Redirect" 
                checked={settings.autoRedirectWhatsApp} 
                onChange={(v) => handleChange('autoRedirectWhatsApp', v)}
                dark
                description="Trigger send action when phone # is found"
            />
            
            {settings.autoRedirectWhatsApp && (
                <div className="pt-4 border-t border-white/10 animate-in">
                     <Toggle 
                        label="Instant Send (No Timer)" 
                        checked={settings.instantSend} 
                        onChange={(v) => handleChange('instantSend', v)}
                        dark
                        icon={<Gauge size={16} />}
                        activeColor="bg-red-500"
                        description="Skip the 2s safety countdown"
                    />
                </div>
            )}
        </div>
      </section>

      {/* WhatsApp API Card */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <button 
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="w-full p-6 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                    <MessageCircle size={20} />
                </div>
                <div className="text-left">
                    <div className="font-bold text-slate-800">WhatsApp Cloud API</div>
                    <div className="text-xs text-slate-500">Advanced Integration</div>
                </div>
            </div>
            {showApiConfig ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>
        
        {showApiConfig && (
            <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-5 animate-in">
                <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-xl text-xs text-yellow-800 border border-yellow-200/60 leading-relaxed">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>Meta Developer configuration required. Tokens are stored locally on this device only.</p>
                </div>

                <Toggle 
                    label="Enable API Integration" 
                    checked={settings.whatsappApi.enabled} 
                    onChange={(v) => handleApiChange('enabled', v)}
                />

                {settings.whatsappApi.enabled && (
                    <div className="space-y-4 animate-in">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <Smartphone size={12} /> Phone Number ID
                            </label>
                            <input 
                                type="text" 
                                value={settings.whatsappApi.phoneNumberId}
                                onChange={(e) => handleApiChange('phoneNumberId', e.target.value)}
                                className="w-full p-3 border-0 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <Key size={12} /> Access Token
                            </label>
                            <input 
                                type="password" 
                                value={settings.whatsappApi.accessToken}
                                onChange={(e) => handleApiChange('accessToken', e.target.value)}
                                className="w-full p-3 border-0 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>
        )}
      </section>

      <div className="text-center pb-6">
        <p className="text-xs text-slate-400">Settings autosave to local storage</p>
      </div>
    </div>
  );
};

// Reusable Toggle Component
const Toggle = ({ 
    label, 
    checked, 
    onChange, 
    dark = false, 
    description, 
    icon,
    activeColor = 'bg-green-500' 
}: { 
    label: string, 
    checked: boolean, 
    onChange: (v: boolean) => void, 
    dark?: boolean, 
    description?: string,
    icon?: React.ReactNode,
    activeColor?: string
}) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <div className="flex flex-col">
            <span className={`font-medium flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-700'}`}>
                {icon} {label}
            </span>
            {description && (
                <span className={`text-xs mt-0.5 ${dark ? 'text-blue-100' : 'text-slate-400'}`}>{description}</span>
            )}
        </div>
        <div className="relative">
            <input 
                type="checkbox" 
                className="sr-only peer"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 ${dark ? 'peer-focus:ring-blue-500 bg-white/20' : 'peer-focus:ring-green-300 bg-slate-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${checked ? activeColor.replace('bg-', 'peer-checked:bg-') : ''}`}></div>
        </div>
    </label>
);
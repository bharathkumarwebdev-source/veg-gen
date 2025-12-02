import { PriceItem, QuoteSettings } from './types';

export const DEFAULT_PRICES: PriceItem[] = [
  { id: '1', name: 'Tomato', price: 40, unit: 'kg' },
  { id: '2', name: 'Potato', price: 30, unit: 'kg' },
  { id: '3', name: 'Onion', price: 35, unit: 'kg' },
  { id: '4', name: 'Coriander', price: 20, unit: 'bunch' },
  { id: '5', name: 'Chilli', price: 80, unit: 'kg' },
  { id: '6', name: 'Carrot', price: 60, unit: 'kg' },
  { id: '7', name: 'Cucumber', price: 40, unit: 'kg' },
  { id: '8', name: 'Cauliflower', price: 50, unit: 'pc' },
  { id: '9', name: 'Cabbage', price: 40, unit: 'pc' },
  { id: '10', name: 'Lemon', price: 5, unit: 'pc' },
  { id: '11', name: 'Ginger', price: 120, unit: 'kg' },
  { id: '12', name: 'Garlic', price: 150, unit: 'kg' },
  { id: '13', name: 'Spinach', price: 25, unit: 'bunch' },
  { id: '14', name: 'Brinjal', price: 50, unit: 'kg' },
  { id: '15', name: 'Lady Finger', price: 60, unit: 'kg' },
];

export const APP_TITLE = "VeggieQuote AI";

export const DEFAULT_SETTINGS: QuoteSettings = {
  headerText: '🧾 Vegetable Order Estimate',
  footerText: 'Please confirm your order. Thank you! 🙏',
  showDate: true,
  showCustomer: true,
  showTotal: true,
  autoRedirectWhatsApp: false,
  instantSend: false,
  whatsappApi: {
    enabled: false,
    accessToken: '',
    phoneNumberId: ''
  }
};
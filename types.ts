export interface PriceItem {
  id: string;
  name: string;
  price: number;
  unit: 'kg' | 'g' | 'pc' | 'bunch' | 'dozen';
}

export interface OrderItem {
  originalName: string; // Name found in image
  matchedItemId?: string; // ID of the PriceItem if found
  quantity: number;
  unit: 'kg' | 'g' | 'pc' | 'bunch' | 'dozen';
  calculatedPrice: number;
}

export type QuoteStatus = 'draft' | 'sent_api' | 'sent_manual' | 'confirmed';

export interface Quote {
  id: string;
  timestamp: number;
  status: QuoteStatus;
  items: OrderItem[];
  total: number;
  rawText: string;
  customerName?: string;
  customerPhoneNumber?: string;
}

export interface ParsedOrder {
  items: {
    originalName: string;
    quantity: number;
    unit: string;
  }[];
  customerName?: string;
  customerPhoneNumber?: string;
}

export interface WhatsAppApiConfig {
  enabled: boolean;
  accessToken: string;
  phoneNumberId: string;
}

export interface QuoteSettings {
  headerText: string;
  footerText: string;
  showDate: boolean;
  showCustomer: boolean;
  showTotal: boolean;
  autoRedirectWhatsApp: boolean;
  instantSend: boolean;
  whatsappApi: WhatsAppApiConfig;
}
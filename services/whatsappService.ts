import { WhatsAppApiConfig } from "../types";

export const sendWhatsAppMessage = async (
  config: WhatsAppApiConfig,
  to: string,
  message: string
): Promise<boolean> => {
  if (!config.enabled || !config.accessToken || !config.phoneNumberId) {
    throw new Error("WhatsApp API is not configured.");
  }

  // Format phone number: remove non-digits
  let formattedPhone = to.replace(/\D/g, '');
  
  // Basic validation: must have at least 10 digits
  if (formattedPhone.length < 10) {
    throw new Error("Invalid phone number.");
  }
  
  // If exactly 10 digits, default to India +91.
  // The API requires the country code without the '+' sign.
  if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
  }

  const url = `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: { body: message }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API Error Response:", data);
      const errorMessage = data.error?.message || data.error?.title || "Failed to send message via API";
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error("Send Message Failed:", error);
    throw error;
  }
};
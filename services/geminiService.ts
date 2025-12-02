import { GoogleGenAI, Type } from "@google/genai";
import { PriceItem, ParsedOrder } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to Base64 with resizing for performance
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1024; // Resize to max 1024px for faster processing

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.8 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Remove data url prefix
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = reject;
      // Set src to trigger onload
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parseVegetableOrder = async (
  base64Image: string, 
  mimeType: string,
  availableItems: PriceItem[]
): Promise<ParsedOrder> => {
  
  const itemNames = availableItems.map(i => i.name).join(", ");

  const prompt = `
  Analyze this image of a vegetable list (handwritten or printed).
  
  Tasks:
  1. Extract the items and their quantities.
  2. IDENTIFY CUSTOMER DETAILS: Look for a Name and a Phone Number at the top or bottom.
     - Phone numbers are often 10 digits, sometimes with 'Mob', 'Ph', or just digits.
     - Capture the phone number exactly as written.

  3. MAP TO INVENTORY: Map extracted items to this list: [${itemNames}].
     - If the image says 'Batata', map to 'Potato'.
     - If the image says 'Kanda', map to 'Onion'.
     - If no match found, use the text from the image.

  Normalize units to: 'kg', 'g', 'pc', 'bunch', 'dozen'.
  Default to 1 if quantity is missing.
  
  Return a JSON object with 'items', 'customerName', and 'customerPhoneNumber'.
  If name or phone is not found, return an empty string for those fields.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // We always convert to JPEG in fileToGenerativePart
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalName: { type: Type.STRING, description: "Name as recognized or mapped" },
                  quantity: { type: Type.NUMBER, description: "Numeric quantity" },
                  unit: { type: Type.STRING, description: "kg, g, pc, bunch, or dozen" }
                },
                required: ["originalName", "quantity", "unit"]
              }
            },
            customerName: { type: Type.STRING, description: "Customer name if found, else empty string" },
            customerPhoneNumber: { type: Type.STRING, description: "Customer phone if found, else empty string" }
          },
          required: ["items"]
        }
      }
    });

    const text = response.text;
    if (!text) return { items: [] };
    
    return JSON.parse(text) as ParsedOrder;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process image. Please try again.");
  }
};
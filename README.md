# VeggieQuote AI 🥦

VeggieQuote AI is a Progressive Web App (PWA) designed for vegetable shopkeepers. It allows users to take a photo of a handwritten or printed vegetable list, instantly identifies items using Google Gemini AI, matches them with daily prices, and generates a formatted quote to send via WhatsApp.

## Features

- 📸 **AI Image Scanning**: Uses Gemini 2.5 Flash to extract items, quantities, and customer details (Name/Phone) from images.
- ⚡ **Instant Quote**: Automatically calculates totals based on daily price configurations.
- 💬 **WhatsApp Automation**:
  - **Direct API**: Send messages directly without opening the WhatsApp app (requires Meta Developer setup).
  - **Click-to-Chat**: Auto-redirects to the WhatsApp app with the message pre-filled.
  - **Share Target**: Receive images directly from the WhatsApp "Share" menu.
- 📱 **PWA Support**: Installable on Android/iOS with offline support.
- 🛠 **Customizable**: Configure daily prices, message headers/footers, and automation settings.

## Setup & Running

This application is built using React with ES Modules and requires no build step (`npm run build` is not needed). It uses `importmap` to load dependencies from a CDN.

1. **Clone the repository**
2. **Serve the files**: You need a static file server to run this locally (due to CORS restrictions with camera/service workers).
   
   If you have Python installed:
   ```bash
   python3 -m http.server 8000
   ```
   Or using Node.js `http-server`:
   ```bash
   npx http-server .
   ```

3. **Open in Browser**: Go to `http://localhost:8000`.

## Configuration

To use the AI features, you must have a valid Google Gemini API Key.
To use the Direct WhatsApp API features, you need a Meta Developer account, Access Token, and Phone Number ID.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Icons**: Lucide React

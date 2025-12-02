# VeggieQuote AI 🥦

VeggieQuote AI is a Progressive Web App (PWA) designed for vegetable shopkeepers. It allows users to take a photo of a handwritten or printed vegetable list, instantly identifies items using Google Gemini AI, matches them with daily prices, and generates a formatted quote to send via WhatsApp.

## Features

- 📸 **AI Image Scanning**: Uses Gemini 2.5 Flash to extract items, quantities, and customer details.
- ⚡ **Instant Quote**: Automatically calculates totals based on daily price configurations.
- 💬 **WhatsApp Automation**: Direct API integration and Click-to-Chat automation.
- 📱 **PWA Support**: Installable on Android/iOS with offline support.

## 🚀 How to Run & Deploy

This project uses **Vite**.

### 1. Installation
Run the following command to install dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and add your Google Gemini API Key:
```env
API_KEY=AIzaSy...YourKeyHere
```

### 3. Local Development
To start the app locally:
```bash
npm run dev
```
Open the link provided (usually `http://localhost:5173`).

### 4. Build & Deploy
To create a production-ready build:
```bash
npm run build
```
The `dist/` folder will contain the static files. You can drag and drop this folder into **Netlify** or upload the repository to **GitHub** and connect it to **Vercel** for automatic deployment.

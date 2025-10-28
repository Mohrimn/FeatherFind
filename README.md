# FeatherFind AI

FeatherFind AI is an intelligent web application designed for bird enthusiasts and curious minds alike. Leveraging the power of Google's Gemini API, this app allows you to identify bird species from a photo, access a wealth of detailed information, and even chat with an AI-powered ornithologist.

## Key Features

- **📸 AI Bird Identifier**: Simply upload a photo of a bird, and the AI will quickly identify its species, providing both the common and scientific names.
- **📚 Rich Species Profiles**: Get in-depth information for identified birds, including detailed descriptions, habitat, diet, conservation status, and a list of fun facts. This feature uses Gemini's "thinking mode" to handle complex queries and provide comprehensive data.
- **🗺️ Geographic Range Mapping**: Discover where in the world a bird can be found with descriptive range information, grounded with up-to-date data and links from Google Maps.
- **💬 Chat with an Expert**: Have a question about birds? The "Bird Chat" feature connects you to a friendly AI expert for a real-time, streaming conversation about all things avian.

## Technology Stack

- **Frontend**: Built with React, TypeScript, and styled with Tailwind CSS for a modern and responsive user interface.
- **AI & Machine Learning**: Powered by the Google Gemini API.
  - `gemini-2.5-flash` is used for fast tasks like initial image identification, chat, and fetching geographic range data.
  - `gemini-2.5-pro` is used with a `thinkingBudget` for more complex, in-depth data retrieval for the detailed bird profiles.

## Running the Application

This application is designed to run in an environment where the Google Gemini API key is securely managed as an environment variable.

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge).
- A Google Gemini API key.

### Setup

1.  **API Key Configuration**: The application requires a Google Gemini API key to function. The code expects this key to be available in `process.env.API_KEY`.
    
    If you are running this in an environment like Google AI Studio, the API key is typically configured for you. If running locally, you would need to set up an environment file (e.g., `.env`) with your key:
    
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```

2.  **Launching the App**: No complex build process is needed. Simply open the `index.html` file in your web browser. The necessary scripts are loaded via an import map from a CDN, and the app will be ready to use immediately.

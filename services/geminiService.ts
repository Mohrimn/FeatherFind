import { GoogleGenAI, Type, Chat } from "@google/genai";
import { BirdInfo, BirdsongResult, ChatMessage, RangeInfo } from '../types';

let ai: GoogleGenAI | null = null;
let chatInstance: Chat | null = null;

export const isApiKeyConfigured = () => !!process.env.API_KEY || !!sessionStorage.getItem('gemini_api_key');

export const initializeAi = (apiKey: string) => {
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
        chatInstance = null; // Reset chat instance when AI is re-initialized
    }
};

const getAi = () => {
    if (!ai) {
        throw new Error("Gemini AI service not initialized. Please configure the API key.");
    }
    return ai;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const audioFileToGenerativePart = async (file: Blob) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type || 'audio/webm' },
  };
};

export const identifyBirdFromImage = async (imageFile: File): Promise<string> => {
  const imagePart = await fileToGenerativePart(imageFile);
  const response = await getAi().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
        parts: [
            imagePart,
            { text: "Identify the bird in this image. Respond with only its common name and scientific name, separated by a pipe. Example: 'American Robin | Turdus migratorius'. If it's not a bird or you can't identify it, say 'Unknown'." }
        ],
    },
  });
  
  const text = response.text.trim();
  if (text.toLowerCase() === 'unknown' || !text.includes('|')) {
    throw new Error("Could not identify the bird in the image.");
  }
  return text;
};

export const identifyBirdFromSound = async (audioBlob: Blob): Promise<BirdsongResult[]> => {
    const audioPart = await audioFileToGenerativePart(audioBlob);

    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                audioPart,
                { text: "Analyze this audio recording of a birdsong. Identify up to 3 possible bird species. For each species, provide its common name, scientific name, a confidence level (High, Medium, or Low), and brief notes on the vocalization patterns heard (e.g., 'fast-paced trill', 'melodic whistles')." }
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    predictions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                commonName: { type: Type.STRING },
                                scientificName: { type: Type.STRING },
                                confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                vocalizationNotes: { type: Type.STRING }
                            },
                            required: ["commonName", "scientificName", "confidence", "vocalizationNotes"]
                        }
                    }
                },
                 required: ["predictions"]
            }
        }
    });

    const parsed = JSON.parse(response.text);
    if (!parsed.predictions || parsed.predictions.length === 0) {
      throw new Error("Could not identify any bird species from the audio.");
    }
    return parsed.predictions;
};


export const getBirdDetails = async (birdName: string): Promise<BirdInfo> => {
    const commonName = birdName.split('|')[0].trim();
    const scientificName = birdName.split('|')[1].trim();

    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Provide a detailed profile for the bird: ${commonName} (${scientificName}).`,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    commonName: { type: Type.STRING },
                    scientificName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    habitat: { type: Type.STRING },
                    diet: { type: Type.STRING },
                    funFacts: { 
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    conservationStatus: { type: Type.STRING },
                },
                required: ["commonName", "scientificName", "description", "habitat", "diet", "funFacts", "conservationStatus"]
            }
        }
    });

    return JSON.parse(response.text);
};


export const getBirdRange = async (birdName: string): Promise<RangeInfo> => {
    const commonName = birdName.split('|')[0].trim();
    
    const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `What is the geographic range of the ${commonName}? Describe its habitat range and migratory patterns.`,
        config: {
            tools: [{googleMaps: {}}],
        },
    });

    const rangeInfo: RangeInfo = {
        description: response.text,
    };

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      const mapsChunk = groundingChunks.find(chunk => chunk.maps);
      if (mapsChunk && mapsChunk.maps) {
        rangeInfo.mapsLink = {
            uri: mapsChunk.maps.uri,
            title: mapsChunk.maps.title
        };
      }
    }
    
    return rangeInfo;
};

export const startChat = () => {
  chatInstance = getAi().chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: 'You are a friendly and knowledgeable ornithologist (a bird expert). Answer questions about birds with enthusiasm and detail. Keep your answers concise and engaging for a general audience.',
    }
  });
};

export const streamChatMessage = async (
  message: string, 
  history: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  if (!chatInstance) {
    startChat();
  }
  
  if (!chatInstance) throw new Error("Chat not initialized");
  
  const result = await chatInstance.sendMessageStream({ message });

  for await (const chunk of result) {
    onChunk(chunk.text);
  }
};

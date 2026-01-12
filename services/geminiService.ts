
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChatMessage, ImageSize } from "../types";

// Helper function to get chat response from Gemini
export const getGeminiChatResponse = async (history: ChatMessage[]) => {
  // Always use a new GoogleGenAI instance before making a call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'You are Bsambh AI, an expert in the Base blockchain ecosystem, Farcaster, and decentralized finance. Be helpful, concise, and professional.',
    },
  });

  const lastMessage = history[history.length - 1].text;
  const response = await chat.sendMessage({ message: lastMessage });
  // Use .text property directly as per guidelines
  return response.text;
};

// Helper function to generate images with Gemini 3 Pro
export const generateImage = async (prompt: string, size: ImageSize) => {
  // Always use a new GoogleGenAI instance before making a call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    },
  });

  let imageUrl = "";
  // Safe extraction of image data from parts as per guidelines
  if (response.candidates && response.candidates[0] && response.candidates[0].content) {
    for (const part of response.candidates[0].content.parts) {
      // Find the image part, do not assume it is the first part
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        imageUrl = `data:image/png;base64,${base64EncodeString}`;
        break;
      }
    }
  }
  return imageUrl;
};

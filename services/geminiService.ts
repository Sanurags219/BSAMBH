
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChatMessage, ImageSize } from "../types";

// Faster response model for production chat
export const getGeminiChatResponse = async (history: ChatMessage[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are Bsambh AI, an expert in the Base blockchain ecosystem, Farcaster, and decentralized finance. Be helpful, concise, and professional. Provide data-driven insights about the Base ecosystem.',
    },
  });

  const lastMessage = history[history.length - 1].text;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text;
};

// High-fidelity image generation for production
export const generateImage = async (prompt: string, size: ImageSize) => {
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
  if (response.candidates && response.candidates[0] && response.candidates[0].content) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        imageUrl = `data:image/png;base64,${base64EncodeString}`;
        break;
      }
    }
  }
  return imageUrl;
};

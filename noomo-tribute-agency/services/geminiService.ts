import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCreativeIdea = async (topic: string): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are a world-class, avant-garde Creative Director at a top-tier digital design agency (like Noomo, Basic/Dept, Hello Monday).
      The user is asking for a concept or critique about: "${topic}".
      
      Provide a response that is:
      1. Short (under 50 words).
      2. Punchy, abstract, and sophisticated.
      3. Uses design industry jargon confidently.
      4. Inspiring but slightly mysterious.
      
      Do not be polite. Be creative.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "The creative void offers no response at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Our digital synapse is temporarily disconnected.");
  }
};

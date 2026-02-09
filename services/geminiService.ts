
import { GoogleGenAI } from "@google/genai";
import { ContactInfo } from "../types";

export const getGeminiAISuggestion = async (contact: ContactInfo): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O usuário está criando um arquivo de contato (vCard) para ${contact.firstName} ${contact.lastName} com o telefone ${contact.phone}. 
      Escreva uma mensagem curta e educada em português para ser enviada no WhatsApp junto com este arquivo de contato. 
      A mensagem deve ser enviada para um destinatário que receberá este contato. 
      Apenas o texto da mensagem, nada mais.`,
    });

    return response.text || `Olá! Segue o contato de ${contact.firstName} ${contact.lastName}.`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Olá! Segue o contato de ${contact.firstName} ${contact.lastName}.`;
  }
};

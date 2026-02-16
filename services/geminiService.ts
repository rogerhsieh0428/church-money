
import { GoogleGenAI } from "@google/genai";
import { DonationRecord } from "../types";

/**
 * Analyzes church donation records using Gemini AI.
 * Always initializes a fresh client instance to ensure latest configuration.
 */
export const analyzeDonations = async (records: DonationRecord[]): Promise<string> => {
  try {
    // Correct initialization using named parameter and process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const dataSummary = records.map(r => `${r.date} ${r.category} ${r.amount}`).join('\n');
    
    // Using gemini-3-pro-preview for complex reasoning and professional analysis tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `身為教會財務顧問，請根據以下奉獻數據進行簡單的現狀分析，並提供一些對於教會事工發展的專業建議：\n\n${dataSummary}`,
      config: {
        systemInstruction: "你是一位資深的非營利組織財務分析師，擅長用溫暖且專業的語氣給予教會建議。請使用繁體中文回答。",
      }
    });

    // Access the .text property directly (not a method).
    return response.text || "無法生成分析報告。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI 分析暫時無法使用。";
  }
};

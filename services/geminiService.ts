
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExtractionResult, FileData } from "../types";

export const extractFinancialData = async (
  files: FileData[]
): Promise<ExtractionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `
    You are a specialized financial data extraction assistant. 
    Process the provided bank statement documents (multiple images or PDFs).
    
    CRITICAL INSTRUCTIONS:
    1. CONSOLIDATE: If multiple files/images are provided, they represent different pages or parts of the same or multiple statements. Combine ALL transactions into a single chronologically ordered list.
    2. DEDUPLICATE: If pages overlap, ensure the same transaction is not counted twice.
    3. EXTRACT: Date, Description (Payment Information), Outflow, Inflow, and Balance.
    4. TRANSLATE: Convert cryptic transaction codes (e.g., "UPI/DR/ZOMATO/FOOD") into human-readable labels (e.g., "Zomato Food Delivery").
    5. CURRENCY: All amounts are in Indian Rupee (INR).
    6. CLEAN: Remove all non-transactional text like headers, footers, or ads.
    7. FORMAT: Use YYYY-MM-DD for dates.
    8. SUMMARY: Calculate the grand total of spending and income across all processed documents.

    IMPORTANT: DO NOT attempt to process password protected files. If a file appears encrypted or unreadable, skip it or return an error message in the first transaction's description.
  `;

  try {
    const parts = files.map(f => ({
      inlineData: {
        data: f.base64,
        mimeType: f.file.type,
      },
    }));

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          ...parts,
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  outflow: { type: Type.NUMBER },
                  inflow: { type: Type.NUMBER },
                  balance: { type: Type.NUMBER },
                },
                required: ["date", "description", "outflow", "inflow", "balance"],
              },
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                total_spend: { type: Type.NUMBER },
                total_received: { type: Type.NUMBER },
              },
              required: ["total_spend", "total_received"],
            },
          },
          required: ["transactions", "summary"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    
    return JSON.parse(text) as ExtractionResult;
  } catch (error) {
    console.error("Extraction failed:", error);
    throw new Error("Failed to process the statements. Ensure none of the files are password protected.");
  }
};

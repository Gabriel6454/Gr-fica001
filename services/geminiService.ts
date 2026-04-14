
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Order } from "../types";

// Lazy initialization of GoogleGenAI to prevent crashes when API key is missing
let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  // Check both Vite and generic process.env for maximum compatibility
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY || process.env?.API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const getBusinessInsights = async (products: Product[], orders: Order[]) => {
  try {
    const prompt = `Analise os seguintes dados de uma gráfica:
    Produtos: ${JSON.stringify(products.map(p => ({ name: p.name, category: p.category, salePrice: p.salePrice })))}
    Pedidos Recentes: ${JSON.stringify(orders.map(o => ({ id: o.id, status: o.status, total: o.total })))}
    
    Forneça 3 insights estratégicos curtos sobre a saúde do negócio, focando em lucratividade e mix de produtos. 
    Responda em Português do Brasil no formato JSON com as chaves: "insights" (lista de strings).`;

    const ai = getAi();
    if (!ai) throw new Error("AI not configured");

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["insights"],
        },
      }
    });

    const data = JSON.parse(response.text || '{"insights": []}');
    return data.insights as string[];
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return ["Revise as margens de lucro periodicamente.", "Foque nos produtos de maior valor agregado.", "Mantenha o catálogo atualizado com as tendências."];
  }
};

export const suggestDescription = async (productName: string, category: string) => {
  try {
    const prompt = `Gere uma descrição curta e profissional de vendas para o produto gráfico: "${productName}" da categoria "${category}".`;
    const ai = getAi();
    if (!ai) throw new Error("AI not configured");

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });
    return response.text || "Descrição personalizada para seus impressos de alta qualidade.";
  } catch (error) {
    return "Descrição personalizada para seus impressos de alta qualidade.";
  }
};

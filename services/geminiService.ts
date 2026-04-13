
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

export const generateMessageVariation = async (title: string, content: string) => {
  try {
    const prompt = `Atue como um copywriter sênior especializado em atendimento ao cliente de alto nível para gráficas e design.
    Sua tarefa é criar uma VARIAÇÃO CRIATIVA E DISTINTA de uma "Mensagem Rápida" de WhatsApp.
    
    Mensagem Original:
    Título: "${title}"
    Conteúdo: "${content}"

    INSTRUÇÕES CRÍTICAS:
    1. REESCREVA COMPLETAMENTE: Não apenas troque sinônimos. Mude a estrutura das frases, a saudação e o fechamento.
    2. ESTILO: A variação deve ser profissional, extremamente carismática e focada em conversão/atendimento de excelência.
    3. FORMATO WHATSAPP: Use emojis de forma moderada e profissional, e quebras de linha para facilitar a leitura.
    4. FOCO: Mantenha exatamente o mesmo objetivo da mensagem original, mas faça-a parecer uma nova forma de falar com o cliente.
    
    Responda EXCLUSIVAMENTE em formato JSON com as seguintes chaves:
    "title": Um novo título curto e chamativo que descreva esta versão.
    "content": O novo corpo da mensagem reescrito.`;

    const ai = getAi();
    if (!ai) throw new Error("AI not configured");

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["title", "content"],
        },
      }
    });

    return JSON.parse(response.text || '{}') as { title: string; content: string };
  } catch (error) {
    console.error("Error generating variation:", error);
    return {
      title: `${title} (Nova Versão)`,
      content: content ? `Olá! Passando para atualizar sobre ${title}. ${content}` : "Olá! Como podemos ajudar com seus impressos hoje?"
    };
  }
};



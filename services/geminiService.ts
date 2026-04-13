
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
    const prompt = `VOCÊ É UM EXPERT EM COPYWRITING E ATENDIMENTO PARA GRÁFICAS.
    Sua missão é gerar uma REPLICA TOTALMENTE REESCRITA de uma mensagem, mantendo apenas a ESSÊNCIA (o que o cliente precisa saber).
    
    MENSAGEM BASE:
    Título: "${title}"
    Conteúdo: "${content}"

    REGRAS DE OURO PARA A VARIAÇÃO:
    1. PROIBIDO REPETIR: Não use as mesmas frases da mensagem original. Mude o tom, a ordem e o vocabulário.
    2. EMOJIS OBRIGATÓRIOS: Use emojis relacionados a gráficas (🖨️, 🎨, 📏, 📦, 🖼️) e cordialidade (🤝, ✨, ✅, 🚀).
    3. ESTRUTURA IMPACTANTE: Use parágrafos curtos, tópicos se necessário, e uma chamada para ação clara.
    4. PERSONALIDADE: Escolha um tom (Pode ser mais entusiasmado, ou mais técnico-elegante, ou super amigável) que seja DIFERENTE do original.
    5. IDENTIDADE: Se o original for seco, faça a variação ser calorosa. Se o original for longo, faça a variação ser direta e eficiente.

    SAÍDA ESPERADA (JSON):
    {
      "title": "Novo título criativo com emoji",
      "content": "Novo texto 100% original, formatado para WhatsApp, rico em emojis e com estrutura moderna."
    }`;

    const ai = getAi();
    if (!ai) throw new Error("AI not configured");

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 1.0, // Máxima criatividade
        topP: 1.0,
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

    const result = JSON.parse(response.text || '{}');
    if (!result.content || result.content.length < 5) throw new Error("Invalid AI response");
    
    return result as { title: string; content: string };
  } catch (error) {
    console.error("Error generating variation:", error);
    // Fallback mais inteligente
    return {
      title: `✨ Nova: ${title}`,
      content: `Passei para deixar uma versão atualizada da nossa mensagem de ${title}! 🚀\n\nEstamos à disposição para garantir a melhor qualidade nos seus impressos. 🎨🖨️\n\nComo posso ajudar mais hoje? ✅`
    };
  }
};




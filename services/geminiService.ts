import { GoogleGenAI, Type } from "@google/genai";
import { Product, Order } from "../types";

// ─── Chat Types ───────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_PROMPT = `Você é o Atlas AI, assistente inteligente integrado ao sistema de gestão de gráfica Atlas.
Você pode ajudar com:
- Gerenciamento de pedidos e produção gráfica
- Dicas sobre papéis, tintas e acabamentos gráficos
- Análise de vendas e relatórios financeiros
- Gestão de clientes e investimentos em FIIs
- Dúvidas gerais sobre gestão de negócios

Seja direto, simpático e responda sempre em português brasileiro.
Use emojis moderadamente para deixar as respostas mais visuais.
Mantenha respostas concisas (máximo 3-4 parágrafos) a menos que o usuário peça mais detalhes.`;

// ─── Lazy AI instance ─────────────────────────────────────────────────────────
let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI | null => {
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' && (process.env.GEMINI_API_KEY || process.env.API_KEY));
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const isGeminiConfigured = (): boolean => {
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' && (process.env.GEMINI_API_KEY || process.env.API_KEY));
  return !!apiKey && String(apiKey).length > 10;
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const sendChatMessage = async (
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> => {
  const ai = getAi();
  if (!ai) throw new Error('Chave de API Gemini não configurada. Adicione VITE_GEMINI_API_KEY no arquivo .env');

  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
    { role: 'user', parts: [{ text: `[INSTRUÇÃO DO SISTEMA]\n${SYSTEM_PROMPT}\n[/INSTRUÇÃO]` }] },
    { role: 'model', parts: [{ text: 'Entendido! Sou o Atlas AI, seu assistente de gestão. Como posso ajudar hoje? 🚀' }] },
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-lite',
    contents,
  });

  return response.text ?? 'Sem resposta do modelo.';
};

export const streamChatMessage = async (
  userMessage: string,
  history: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  const ai = getAi();
  if (!ai) throw new Error('Chave de API Gemini não configurada. Adicione VITE_GEMINI_API_KEY no arquivo .env');

  const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
    { role: 'user', parts: [{ text: `[INSTRUÇÃO DO SISTEMA]\n${SYSTEM_PROMPT}\n[/INSTRUÇÃO]` }] },
    { role: 'model', parts: [{ text: 'Entendido! Sou o Atlas AI, seu assistente de gestão. Como posso ajudar hoje? 🚀' }] },
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash-lite',
    contents,
  });

  for await (const chunk of stream) {
    const text = chunk.text ?? '';
    if (text) onChunk(text);
  }
};

// ─── Business Insights (Dashboard) ───────────────────────────────────────────
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
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
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

// ─── Product Description ──────────────────────────────────────────────────────
export const suggestDescription = async (productName: string, category: string) => {
  try {
    const prompt = `Gere uma descrição curta e profissional de vendas para o produto gráfico: "${productName}" da categoria "${category}".`;
    const ai = getAi();
    if (!ai) throw new Error("AI not configured");

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt
    });
    return response.text || "Descrição personalizada para seus impressos de alta qualidade.";
  } catch (error) {
    return "Descrição personalizada para seus impressos de alta qualidade.";
  }
};

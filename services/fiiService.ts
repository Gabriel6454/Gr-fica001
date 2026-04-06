
import { PortfolioFII } from '../types';

// Nota: Se não quiser configurar no banco de dados ainda, cole seu token aqui:
const HARDCODED_BRA_TOKEN = ''; 
const BRAPI_BASE_URL = 'https://brapi.dev/api/quote';

// Interface para resposta simplificada do Brapi
interface BrapiResponse {
  results: {
    symbol: string;
    regularMarketPrice: number;
    logourl?: string;
    dividendsData?: {
      cashDividends: {
        rate: number;
        paymentDate: string;
      }[];
    };
  }[];
}

export const fiiService = {
  /**
   * Busca dados em tempo real para um Ticker (ex: MXRF11)
   */
  async getRealTimeData(ticker: string, token?: string): Promise<Partial<PortfolioFII> | null> {
    try {
      if (!ticker) return null;
      
      const cleanTicker = ticker.trim().toUpperCase();
      const currentToken = token || localStorage.getItem('brapi_token') || HARDCODED_BRA_TOKEN;
      const tokenUrl = currentToken ? `&token=${currentToken}` : '';
      
      console.log(`[fiiService] Buscando dados p/ ${cleanTicker}`);
      
      const response = await fetch(`${BRAPI_BASE_URL}/${cleanTicker}?dividends=true${tokenUrl}`);
      
      if (!response.ok) {
        if (response.status === 401) console.error("Brapi: Token Inválido ou Ausente (401)");
        return null;
      }

      const data: BrapiResponse = await response.json();
      
      if (!data.results || data.results.length === 0) return null;
      
      const res = data.results[0];
      
      let lastDiv = 0;
      if (res.dividendsData?.cashDividends && res.dividendsData.cashDividends.length > 0) {
        const sorted = [...res.dividendsData.cashDividends].sort((a, b) => 
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
        lastDiv = sorted[0].rate;
      }

      return {
        currentPrice: res.regularMarketPrice,
        lastDividend: lastDiv > 0 ? lastDiv : undefined
      };
    } catch (error) {
      console.error(`Falha ao buscar dados para ${ticker}:`, error);
      return null;
    }
  },

  /**
   * Atualiza uma lista inteira de FIIs
   */
  async updateAll(fiis: PortfolioFII[], token?: string): Promise<PortfolioFII[]> {
    if (fiis.length === 0) return [];

    const tickers = fiis.map(f => f.ticker.trim().toUpperCase()).join(',');
    const currentToken = token || localStorage.getItem('brapi_token') || HARDCODED_BRA_TOKEN;
    const tokenUrl = currentToken ? `&token=${currentToken}` : '';
    
    console.log(`[fiiService] Atualizando lote: ${tickers}`);
    
    try {
      const response = await fetch(`${BRAPI_BASE_URL}/${tickers}?dividends=true${tokenUrl}`);
      if (!response.ok) return fiis;

      const data: BrapiResponse = await response.json();
      
      return fiis.map(f => {
        const match = data.results.find(r => r.symbol === f.ticker.toUpperCase());
        if (!match) return f;

        let lastDiv = f.lastDividend;
        if (match.dividendsData?.cashDividends && match.dividendsData.cashDividends.length > 0) {
          const sorted = [...match.dividendsData.cashDividends].sort((a, b) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          );
          lastDiv = sorted[0].rate;
        }

        return {
          ...f,
          currentPrice: match.regularMarketPrice,
          lastDividend: lastDiv
        };
      });
    } catch (e) {
      console.error("Erro na atualização em lote:", e);
      return fiis;
    }
  }
};

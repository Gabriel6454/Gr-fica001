import express from 'express';
import cors from 'cors';
import { rastrearEncomendas } from 'correios-brasil';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/track/:code', async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    let response;
    try {
      response = await rastrearEncomendas([code]);
    } catch (apiError) {
      console.warn('Correios API blocked or failed, using simulated fallback for demonstration.', apiError.message);
      response = null;
    }
    
    if (response && response[0] && response[0].eventos && response[0].eventos.length > 0) {
      // Map to our required format
      const eventos = response[0].eventos.map(ev => {
        const city = ev.unidade?.endereco?.cidade || '';
        const uf = ev.unidade?.endereco?.uf || '';
        let location = city && uf ? `${city}/${uf}` : (ev.unidade?.tipo || 'Correios');
        
        let date = ev.dtHrCriado;
        if (date) {
            date = new Date(date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        }

        return {
            date: date || '',
            status: ev.descricao || '',
            location: location
        };
      });
      res.json({ events: eventos });
    } else {
      // Fallback
      const now = new Date();
      res.json({
        events: [
          {
            date: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            status: `Rastreamento Simulado para ${code} (API Indisponível)`,
            location: 'Sistema Central / BR'
          },
          {
            date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            status: 'Objeto encaminhado',
            location: 'Unidade de Tratamento / SP'
          },
          {
            date: new Date(now.getTime() - 48 * 60 * 60 * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            status: 'Objeto postado',
            location: 'Agência dos Correios / SP'
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error fetching tracking:', error);
    res.status(500).json({ error: 'Internal server error while tracking: ' + error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Correios Tracking API running on port ${PORT}`);
});

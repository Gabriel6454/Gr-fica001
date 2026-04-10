import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChatMessage, isGeminiConfigured, ChatMessage } from '../services/geminiService';

interface GeminiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { label: '📊 Análise de negócio', prompt: 'Quais são as melhores práticas para aumentar a lucratividade de uma gráfica?' },
  { label: '🖨️ Papéis e acabamentos', prompt: 'Qual a diferença entre papel couchê e offset? Quando usar cada um?' },
  { label: '💰 FIIs iniciante', prompt: 'Como montar uma carteira de FIIs para iniciantes com foco em dividendos mensais?' },
  { label: '📦 Gestão de pedidos', prompt: 'Dicas para organizar melhor o fluxo de produção e entrega de pedidos gráficos?' },
];

const BotAvatar = () => (
  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/30">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
      <circle cx="9" cy="14" r="1" fill="white" stroke="none"/>
      <circle cx="15" cy="14" r="1" fill="white" stroke="none"/>
    </svg>
  </div>
);

const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  // Simple markdown rendering
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="font-black text-white">{line.slice(2, -2)}</p>);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="text-sky-400 mt-1 shrink-0">▸</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    } else if (line.match(/^\*\*/)) {
      // Inline bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={i}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-black">{part}</strong> : part)}
        </p>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(<p key={i}>{line}</p>);
    }
  });

  return <div className="space-y-0.5 text-[13px] leading-relaxed">{elements}</div>;
};

const GeminiChat: React.FC<GeminiChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const configured = isGeminiConfigured();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'model',
        text: 'Olá! 👋 Sou o **Atlas AI**, seu assistente de gestão da gráfica.\n\nPosso ajudar com pedidos, análise de negócio, dicas de impressão, investimentos em FIIs e muito mais. O que você precisa hoje?'
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isStreaming) return;

    setInput('');
    setError('');
    const userMsg: ChatMessage = { role: 'user', text: messageText };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsStreaming(true);
    setStreamingText('');

    try {
      let fullText = '';
      await streamChatMessage(messageText, messages, (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
      });

      setMessages(prev => [...prev, { role: 'model', text: fullText }]);
      setStreamingText('');
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com a IA. Verifique sua chave de API.');
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[6rem] right-4 lg:bottom-6 lg:right-6 z-[200] w-[calc(100vw-2rem)] max-w-[420px] h-[70vh] max-h-[640px] flex flex-col glass-card bg-[#030c1a]/95 border border-white/10 rounded-[32px] shadow-2xl shadow-black/50 backdrop-blur-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0 bg-gradient-to-r from-sky-500/10 to-indigo-600/10">
        <div className="flex items-center gap-3">
          <BotAvatar />
          <div>
            <p className="text-white font-black text-sm tracking-tight">Atlas AI</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {configured ? 'Gemini 2.0 Flash · Grátis' : 'API Key necessária'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Not Configured Warning */}
      {!configured && (
        <div className="mx-4 mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 shrink-0">
          <p className="text-amber-400 font-black text-xs uppercase tracking-widest">⚠️ Configuração necessária</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Adicione sua chave gratuita do Google AI Studio no arquivo <code className="text-sky-400 bg-white/5 px-1 rounded">.env</code>:
          </p>
          <div className="bg-black/40 rounded-xl px-3 py-2 text-[11px] font-mono text-emerald-400 break-all">
            VITE_GEMINI_API_KEY=sua_chave_aqui
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-black text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-widest">
            Obter chave grátis →
          </a>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {/* Quick prompts shown only when just the welcome message exists */}
        {messages.length <= 1 && configured && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Sugestões rápidas</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => handleSend(qp.prompt)}
                  disabled={isStreaming}
                  className="text-left p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-sky-500/30 rounded-2xl text-[11px] text-slate-400 hover:text-white transition-all font-medium leading-tight"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'model' && <BotAvatar />}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-tr-sm ml-auto'
                : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-sm'
            }`}>
              {msg.role === 'model' ? (
                <MarkdownText text={msg.text} />
              ) : (
                <p className="text-[13px] leading-relaxed">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {isStreaming && streamingText && (
          <div className="flex gap-3">
            <BotAvatar />
            <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-slate-300 rounded-tl-sm">
              <MarkdownText text={streamingText} />
              <span className="inline-block w-1.5 h-4 bg-sky-400 ml-0.5 animate-pulse rounded-sm" />
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isStreaming && !streamingText && (
          <div className="flex gap-3">
            <BotAvatar />
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm">
              <div className="flex items-center gap-1.5 h-5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-white/5 shrink-0">
        <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-sky-500/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={configured ? "Pergunte algo ao Atlas AI..." : "Configure a API key primeiro..."}
            disabled={!configured || isStreaming}
            rows={1}
            className="flex-1 bg-transparent text-white text-[13px] outline-none resize-none placeholder-slate-600 disabled:cursor-not-allowed max-h-28"
            style={{ minHeight: '1.5rem' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming || !configured}
            className="w-8 h-8 shrink-0 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
          >
            {isStreaming ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-700 mt-2 font-medium">
          Gemini 2.0 Flash Lite · Grátis · Pressione Enter para enviar
        </p>
      </div>
    </div>
  );
};

export default GeminiChat;

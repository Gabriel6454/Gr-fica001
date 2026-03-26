import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';
import { QuickMessage } from '../types';
import { dbService } from '../services/dbService';

const QuickMessages: React.FC = () => {
  const [messages, setMessages] = useState<QuickMessage[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{title: string, content: string, audioUrl?: string}>({ title: '', content: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      const saved = await dbService.getQuickMessages();
      setMessages(saved);
    };
    loadMessages();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingId) {
      const updated = messages.map(m => 
        m.id === editingId ? { ...m, ...formData } : m
      );
      setMessages(updated);
      await dbService.saveQuickMessages(updated);
      setEditingId(null);
    } else {
      const newMessage: QuickMessage = {
        id: crypto.randomUUID(),
        ...formData,
        content: formData.content || ''
      };
      const updated = [...messages, newMessage];
      setMessages(updated);
      await dbService.saveQuickMessages(updated);
      setIsAdding(false);
    }
    setFormData({ title: '', content: '', audioUrl: undefined });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta mensagem?')) {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      await dbService.saveQuickMessages(updated);
    }
  };

  const handleCopy = (content: string, id: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, audioUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, audioUrl: reader.result as string }));
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Erro ao acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5 mb-10 px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase italic">Mensagens <span className="text-sky-500">Rápidas</span></h1>
          <p className="text-slate-500 text-sm font-medium">Templates e áudios para seu atendimento</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="w-full sm:w-auto px-8 py-4 bg-sky-500 text-white font-black uppercase rounded-2xl text-[11px] tracking-widest hover:bg-sky-400 transition-all active:scale-95 shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2"
        >
          {ICONS.Plus} Nova Mensagem
        </button>
      </div>

      {(isAdding || editingId) && (
        <section className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[32px] p-8 mb-10 animate-in zoom-in-95 duration-300 mx-4">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TÍTULO DO TEMPLATE</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Saudação Inicial"
                    className="w-full bg-[#030712]/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-sky-500/50 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CONTEÚDO DE TEXTO (OPCIONAL)</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o texto aqui..."
                    rows={4}
                    className="w-full bg-[#030712]/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-slate-300 outline-none focus:border-sky-500/50 font-medium resize-none"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ANEXO DE ÁUDIO</label>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="cursor-pointer bg-white/5 border border-white/5 hover:bg-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
                        <div className="text-sky-500 group-hover:scale-110 transition-transform">{ICONS.Paperclip}</div>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Upload Arquivo</span>
                        <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                      </label>
                      
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all group ${isRecording ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 animate-pulse' : 'bg-white/5 border-white/5 hover:bg-white/10 text-emerald-500'}`}
                      >
                        <div className="group-hover:scale-110 transition-transform">{isRecording ? ICONS.Square : ICONS.Mic}</div>
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                          {isRecording ? formatTime(recordingTime) : 'Gravar Áudio'}
                        </span>
                      </button>
                    </div>

                    {formData.audioUrl && (
                      <div className="bg-[#030712]/60 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                             {ICONS.Mic}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Áudio Pronto</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, audioUrl: undefined }))}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          {ICONS.Trash}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ title: '', content: '', audioUrl: undefined }); }}
                className="px-6 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-10 py-3 bg-sky-500 text-white font-black uppercase rounded-xl text-[10px] tracking-widest hover:bg-sky-400 transition-all font-black italic"
              >
                {editingId ? 'Salvar Alterações' : 'Criar Mensagem'}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {messages.length === 0 && !isAdding && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="scale-[3] text-slate-700">{ICONS.Messages}</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs pt-8">Nenhuma mensagem salva ainda</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="glass-card bg-[#0a1120]/40 border border-white/5 rounded-[28px] p-6 flex flex-col justify-between group hover:border-sky-500/30 transition-all duration-500">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 shadow-lg shadow-sky-500/5">
                  {message.audioUrl ? ICONS.Mic : ICONS.Messages}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(message.id);
                      setFormData({ title: message.title, content: message.content, audioUrl: message.audioUrl });
                    }}
                    className="p-2 text-slate-500 hover:text-sky-400 transition-colors"
                  >
                    {ICONS.Edit}
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    {ICONS.Trash}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-tight italic">{message.title}</h3>
                
                {message.content && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium bg-[#030712]/40 p-3 rounded-xl border border-white/5">
                    {message.content}
                  </p>
                )}

                {message.audioUrl && (
                   <AudioPlayer src={message.audioUrl} />
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {message.content && (
                <button
                  onClick={() => handleCopy(message.content, message.id)}
                  className={`w-full py-3 rounded-xl border flex items-center justify-center gap-3 transition-all duration-300 font-black uppercase text-[9px] tracking-widest ${
                    copiedId === message.id 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-sky-500 hover:border-sky-400 hover:text-white group-hover:shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                  }`}
                >
                  {copiedId === message.id ? (
                    <> {ICONS.CopyCheck} Texto Copiado! </>
                  ) : (
                    <> {ICONS.Copy} Copiar Texto </>
                  )}
                </button>
              )}

              {message.audioUrl && (
                 <a
                    href={message.audioUrl}
                    download={`${message.title.replace(/\s+/g, '_')}.wav`}
                    className="w-full py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-3 font-black uppercase text-[9px] tracking-widest"
                 >
                    {ICONS.Download} Baixar Áudio
                 </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="bg-[#030712]/60 border border-white/5 p-4 rounded-2xl space-y-3">
      <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate} onEnded={onEnded} className="hidden" />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 hover:scale-110 active:scale-95 transition-all"
        >
          {isPlaying ? ICONS.Pause : ICONS.Play}
        </button>
        <div className="flex-1 space-y-1.5">
           <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-tighter">
              <span>{isPlaying ? 'Reproduzindo' : 'Pronto para tocar'}</span>
              <span>{Math.round(progress)}%</span>
           </div>
           <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-sky-500 transition-all duration-300 shadow-[0_0_10px_#0ea5e9]" 
               style={{ width: `${progress}%` }}
             />
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMessages;

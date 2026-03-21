
import React, { useState, useRef } from 'react';
import { StoreSettings } from '../types';
import { ICONS } from '../constants';
import { ALL_MENU_ITEMS } from './Layout';

interface SettingsProps {
  settings: StoreSettings;
  onSave: (updates: StoreSettings) => void;
  onReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onReset }) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file as Blob);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Configurações salvas com sucesso!');
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5 mb-10 px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase italic">Ajustes do <span className="text-sky-500">Sistema</span></h1>
          <p className="text-slate-500 text-sm font-medium">Configuração de identidade e acessos</p>
        </div>
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-10 py-4 bg-rose-500/5 border border-rose-500/20 text-rose-500 font-black uppercase rounded-2xl text-[11px] tracking-widest hover:bg-rose-500/10 transition-all active:scale-95 shadow-xl shadow-rose-500/5 group"
        >
          <span className="group-hover:animate-pulse">Reiniciar Ecossistema</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-10">

        {/* Identidade */}
        <section className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[40px] p-8 sm:p-12 shadow-3xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <div className="scale-[4] text-sky-500">{ICONS.Palette}</div>
          </div>

          <h2 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3 mb-10 relative z-10">
            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]"></span>
            IDENTIDADE VISUAL
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">DENOMINAÇÃO DO SISTEMA</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#030712]/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-sky-500/50 font-black italic shadow-inner tracking-tight"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SLOGAN CORPORATIVO</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-[#030712]/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-sky-500/50 font-bold shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WHATSAPP DE ATENDIMENTO</label>
                <input
                  type="text"
                  value={formData.whatsapp || ''}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-[#030712]/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-emerald-500 outline-none focus:border-emerald-500/50 font-black shadow-inner"
                  placeholder="Ex: 5511999999999"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">BRanding / LOGOTIPO PRINCIPAL</label>
              <div className="flex items-center gap-6 bg-[#030712]/40 p-6 rounded-[32px] border border-white/5 shadow-inner">
                <div className="w-24 h-24 bg-[#0a111f] border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-2xl relative group/logo">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Logo" />
                  ) : (
                    <div className="text-slate-700">{ICONS.Palette}</div>
                  )}
                  <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex-1 space-y-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl border border-white/5 transition-all shadow-lg overflow-hidden relative group/btn"
                  >
                    <span className="relative z-10">ALTERAR ATIVOS</span>
                  </button>
                  <p className="text-[9px] text-slate-600 font-bold uppercase text-center tracking-tighter">Formatos: PNG, JPG ou SVG (Máx 2MB)</p>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ajuste de Escala do Sistema */}
        <section className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[40px] p-8 sm:p-12 shadow-3xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <div className="scale-[4] text-sky-500">{ICONS.Settings}</div>
          </div>

          <h2 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3 mb-10 relative z-10">
            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]"></span>
            EXPERIÊNCIA DO USUÁRIO
          </h2>

          <div className="space-y-10 relative z-10">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TAMANHO DA INTERFACE (ZOOM)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Compacto', value: 0.85, sub: '85% - Mais conteúdo' },
                  { label: 'Padrão', value: 1.0, sub: '100% - Equilibrado' },
                  { label: 'Confortável', value: 1.15, sub: '115% - Maior visibilidade' },
                ].map((scale) => (
                  <button
                    key={scale.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, systemScale: scale.value })}
                    className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-2 group ${
                      (formData.systemScale || 1) === scale.value
                        ? 'bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-500/20'
                        : 'bg-[#030712]/40 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{scale.label}</span>
                    <span className={`text-[9px] font-bold uppercase opacity-60 ${
                      (formData.systemScale || 1) === scale.value ? 'text-white' : 'text-slate-500'
                    }`}>
                      {scale.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rodapé do Catálogo */}
        <section className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[40px] p-8 sm:p-12 shadow-3xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <div className="scale-[4] text-sky-500">{ICONS.Catalog}</div>
          </div>

          <h2 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3 mb-10 relative z-10">
            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]"></span>
            RODAPÉ DA VITRINE PÚBLICA
          </h2>

          <div className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TÍTULO DE CHAMADA</label>
              <input
                type="text"
                value={formData.footerTitle}
                onChange={e => setFormData({ ...formData, footerTitle: e.target.value })}
                className="w-full bg-[#030712]/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-sky-500/50 font-black shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">MENSAGEM DE CONVERSÃO</label>
              <textarea
                rows={3}
                value={formData.footerDescription}
                onChange={e => setFormData({ ...formData, footerDescription: e.target.value })}
                className="w-full bg-[#030712]/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-slate-400 outline-none focus:border-sky-500/50 font-medium shadow-inner resize-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">DISCLAIMER / AVISO DE ISENÇÃO</label>
              <input
                type="text"
                value={formData.footerWarning}
                onChange={e => setFormData({ ...formData, footerWarning: e.target.value })}
                className="w-full bg-rose-500/5 border border-rose-500/10 rounded-2xl px-6 py-4 text-sm text-rose-400 outline-none focus:border-rose-500/50 font-black shadow-inner"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-10">
          <button
            type="submit"
            className="w-full sm:w-auto px-16 py-5 bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 hover:brightness-110 text-white font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-sky-500/30 transition-all active:scale-95 text-[11px] italic"
          >
            Consolidar Diretrizes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

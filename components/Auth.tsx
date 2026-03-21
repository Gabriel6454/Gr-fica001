import React, { useState } from 'react';
import { ICONS } from '../constants';
import { supabase } from '../services/supabase';

interface AuthProps {
  onLogin: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : error.message);
        if (data.user) {
          onLogin(data.user);
        }
      } else {
        if (password !== confirmPassword) {
            throw new Error('As senhas não coincidem.');
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });
        if (error) throw error;
        if (data.user) {
            if (data.session) {
                onLogin(data.user);
            } else {
                setError('Conta criada com sucesso! (Pode ser necessário confirmar o email e depois fazer login).');
                setIsLogin(true);
            }
        }
      }
    } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao processar a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0a111f]/60 backdrop-blur-xl border border-slate-800/60 rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-6 sm:p-12">
          
          {/* Logo Area */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0ea5e9] rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mx-auto mb-4 sm:mb-6 transform rotate-3">
              <svg width="24" height="24" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase mb-1 sm:mb-2 text-center">Atlas <span className="text-sky-500">System</span></h1>
            <p className="text-slate-500 text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em]">Gestão Gráfica Inteligente</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5 animate-in slide-in-from-left-4 fade-in duration-300">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome Completo</label>
                <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
                      {ICONS.Customers}
                   </div>
                   <input 
                    type="text" 
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700"
                  placeholder="exemplo@atlas.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5 animate-in slide-in-from-left-4 fade-in duration-300">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Confirmar Senha</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <input 
                    type="password" 
                    required={!isLogin}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                <div className="text-rose-500 shrink-0">{ICONS.Warning}</div>
                <p className="text-xs font-bold text-rose-500">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#0ea5e9] hover:bg-sky-400 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 text-xs flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Acessar Painel' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-xs font-bold text-slate-500">
              {isLogin ? 'Não possui acesso?' : 'Já tem uma conta?'}
            </p>
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="mt-2 text-sky-500 text-xs font-black uppercase tracking-widest hover:text-sky-400 transition-colors"
            >
              {isLogin ? 'Criar nova conta' : 'Fazer Login'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

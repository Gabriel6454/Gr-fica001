import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS } from '../constants';
import { StoreSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  settings: StoreSettings;
  currentUser?: { name: string; email: string };
  isOnline?: boolean;
}

export const ALL_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard },
  { id: 'customers', label: 'Clientes', icon: ICONS.Customers },
  { id: 'products', label: 'Produtos', icon: ICONS.Products },
  { id: 'orders', label: 'Pedidos', icon: ICONS.Orders },
  { id: 'sales', label: 'Vendas', icon: ICONS.Sales },
  { id: 'quick-messages', label: 'Mensagem Rápida', icon: ICONS.Messages },
  { id: 'reports', label: 'Relatórios', icon: ICONS.Reports },
  { id: 'investments', label: 'Investimento', icon: ICONS.Sales },
  { id: 'settings', label: 'Ajustes', icon: ICONS.Settings },
];

export const DefaultLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const Layout: React.FC<LayoutProps> = ({
  children, activeTab, setActiveTab, onLogout, settings, currentUser, isOnline = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Auto-detect device and adjust layout
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 768 && w < 1024) {
        // Tablet: sidebar collapsed (ícones apenas)
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      } else if (w >= 1024) {
        // Desktop: sidebar expandida
        setIsCollapsed(false);
        setIsMobileMenuOpen(false);
      }
      // Mobile (<768): sidebar controlada por isMobileMenuOpen
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Bottom nav items (mobile)
  const bottomNavItems = useMemo(() => [
    { id: 'dashboard', label: 'Início', icon: ICONS.Dashboard },
    { id: 'orders',    label: 'Pedidos', icon: ICONS.Orders },
    { id: 'sales',     label: 'Vendas', icon: ICONS.Sales },
    { id: 'customers', label: 'Clientes', icon: ICONS.Customers },
    { id: 'settings',  label: 'Ajustes', icon: ICONS.Settings },
  ], []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const userInitials = useMemo(() => {
    if (!currentUser?.name) return 'US';
    const names = currentUser.name.trim().split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }, [currentUser]);

  return (
    <div
      className="min-h-screen bg-[#020617] text-slate-200 selection:bg-sky-500/30 flex flex-col md:flex-row overflow-x-hidden antialiased"
      style={{ zoom: settings.systemScale || 1 }}
    >
      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[80] flex items-center justify-between px-4 bg-[#020617]/85 backdrop-blur-xl border-b border-white/5"
        style={{ height: '3.75rem', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0">
            {settings.logoUrl && settings.logoUrl.length > 10
              ? <img src={settings.logoUrl} className="w-full h-full object-cover rounded-xl" alt="Logo" />
              : <DefaultLogo className="w-5 h-5" />
            }
          </div>
          <span className="text-white font-black text-xs tracking-tighter uppercase italic leading-none">
            {settings.name || 'Atlas'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-sky-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500">{isOnline ? 'Hybrid Cloud' : 'Edge Mode'}</span>
          </div>
          <button className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl border border-sky-500/20 active:scale-90 transition-all font-black text-[9px] px-3">
             {ICONS.Dashboard} v2.9
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="btn-touch p-2 text-slate-400 hover:text-white transition-colors rounded-xl"
            aria-label="Abrir menu"
          >
            {ICONS.Menu}
          </button>
        </div>
      </header>

      {/* ── Bottom Navigation (mobile only) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[80] flex items-center justify-around bg-[#030712]/92 backdrop-blur-2xl border-t border-white/5 bottom-nav-safe"
        style={{ height: 'calc(3.75rem + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {bottomNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`btn-touch flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-2xl transition-all duration-200 flex-1 ${
                isActive ? 'text-sky-400' : 'text-slate-500'
              }`}
              aria-label={item.label}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider leading-none ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-[env(safe-area-inset-bottom)] w-8 h-0.5 bg-sky-500 rounded-full blur-sm" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Mobile Backdrop ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          'fixed md:sticky top-0 left-0 bottom-0 h-screen z-[100]',
          'glass-card bg-[#030712]/70 flex flex-col',
          'transition-all duration-300 ease-in-out',
          // Mobile: escondida ou visível
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full',
          // Tablet/Desktop override
          'md:translate-x-0',
          isCollapsed ? 'md:w-[4.5rem]' : 'md:w-64',
        ].join(' ')}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setIsCollapsed(c => !c)}
          className="hidden md:flex absolute -right-3 top-24 w-6 h-6 bg-sky-500 rounded-full border border-sky-400 items-center justify-center text-[#030712] shadow-xl z-[110] hover:scale-110 active:scale-95 transition-all"
        >
          <div className={`transition-transform duration-300 scale-75 ${isCollapsed ? '' : 'rotate-180'}`}>
            {ICONS.Chevron}
          </div>
        </button>

        {/* Logo */}
        <div className={`px-5 pt-6 pb-4 flex items-center gap-4 shrink-0 ${isCollapsed && !isMobileMenuOpen ? 'md:justify-center' : ''}`}>
          <div className="w-11 h-11 bg-sky-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-sky-500/40 overflow-hidden">
            {settings.logoUrl && settings.logoUrl.length > 10
              ? <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" />
              : <DefaultLogo className="w-6 h-6" />
            }
          </div>
          {(!isCollapsed || isMobileMenuOpen) && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
              <span className="text-white font-black text-lg tracking-tighter block leading-none italic uppercase">
                {settings.name || 'Atlas'}
              </span>
              <span className="text-[9px] text-sky-500 font-black uppercase tracking-[0.4em] block mt-0.5">
                GESTÃO
              </span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar py-2">
          {ALL_MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={[
                  'w-full flex items-center rounded-2xl transition-all duration-200 relative group',
                  isCollapsed && !isMobileMenuOpen ? 'md:justify-center px-0 py-3.5' : 'px-4 py-3 gap-3.5',
                  isActive ? 'bg-sky-500/10 text-sky-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
                ].join(' ')}
                title={isCollapsed && !isMobileMenuOpen ? item.label : undefined}
              >
                <div className={`shrink-0 transition-colors ${isActive ? 'text-sky-400' : 'group-hover:text-slate-300'}`}>
                  {item.icon}
                </div>
                {(!isCollapsed || isMobileMenuOpen) && (
                  <span className={`text-[13px] tracking-tight truncate ${isActive ? 'font-black' : 'font-semibold'}`}>
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-sky-500 rounded-r-full shadow-[0_0_12px_#0ea5e9]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Status */}
        <div
          className={`px-4 pb-3 flex items-center gap-2.5 ${isCollapsed && !isMobileMenuOpen ? 'md:justify-center' : ''}`}
          title={isOnline ? 'Conexão ativa' : 'Sem conexão'}
        >
          <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
            {isOnline ? (
              <>
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-40" />
                <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
              </>
            ) : (
              <span className="relative rounded-full h-2 w-2 bg-rose-500" />
            )}
          </div>
          {(!isCollapsed || isMobileMenuOpen) && (
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isOnline ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
              {isOnline ? 'Supabase Sync' : 'Offline / Falha'}
            </span>
          )}
        </div>

        {/* Profile */}
        <div className={`px-3 pb-4 border-t border-white/5 pt-3 shrink-0 ${isCollapsed && !isMobileMenuOpen ? 'md:flex md:justify-center' : ''}`}>
          <div className={`flex items-center bg-slate-900/40 rounded-2xl border border-slate-800/50 ${isCollapsed && !isMobileMenuOpen ? 'p-2' : 'p-2.5 gap-3 w-full'}`}>
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] font-black text-sky-500 shrink-0">
              {userInitials}
            </div>
            {(!isCollapsed || isMobileMenuOpen) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-white truncate">{currentUser?.name || 'Usuário'}</p>
                <button
                  onClick={onLogout}
                  className="text-[9px] text-rose-500 font-black uppercase tracking-widest hover:text-rose-400 transition-colors"
                >
                  Sair do Sistema
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main
        className="flex-1 min-w-0 overflow-x-hidden"
        style={{
          paddingTop: 'calc(3.75rem)',     // mobile header height
          paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom))', // bottom nav
        }}
      >
        {/* Remove top/bottom padding for md+ (sidebar handles layout) */}
        <style>{`
          @media (min-width: 768px) {
            main { padding-top: 1.5rem !important; padding-bottom: 2rem !important; }
          }
        `}</style>
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 max-w-full">
          {children}
        </div>

        {/* Novo v2.9: Assistente Virtual Interativo */}
        <div className="fixed bottom-20 right-6 md:bottom-10 md:right-10 z-[200]">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-full right-0 mb-6 w-80 bg-[#0a111f]/95 border border-sky-500/30 rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
              >
                <div className="bg-sky-500 p-5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white scale-110">
                         {ICONS.Dashboard}
                      </div>
                      <div>
                         <p className="text-xs font-black text-white uppercase tracking-widest leading-none">Atlas AI</p>
                         <p className="text-[8px] text-sky-100 font-bold uppercase tracking-[0.2em] mt-1">Sistemas v2.9</p>
                      </div>
                   </div>
                   <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                </div>
                <div className="p-6 h-64 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/5">
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-[11px] text-slate-300 font-medium leading-relaxed">
                      Olá! Ativado modo **Industrial v2.9**. Como posso ajudar no gerenciamento da gráfica hoje?
                   </div>
                   <div className="bg-sky-500/10 rounded-2xl p-4 border border-sky-500/20 text-[10px] text-sky-400 font-bold uppercase tracking-widest text-center cursor-pointer hover:bg-sky-500 hover:text-white transition-all">
                      Relatório de Produção
                   </div>
                   <div className="bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20 text-[10px] text-purple-400 font-bold uppercase tracking-widest text-center cursor-pointer hover:bg-purple-500 hover:text-white transition-all">
                      Previsão de Insumos
                   </div>
                </div>
                <div className="p-4 border-t border-white/5 bg-black/20">
                   <form onSubmit={(e) => {
                      e.preventDefault();
                      const input = (e.target as any).elements[0];
                      if (input.value.toLowerCase().includes('estoque')) {
                         alert('Atlas AI: Identificando itens abaixo do mínimo... Redirecionando para Insumos.');
                      } else {
                         alert('Atlas AI: Entendido. Estou processando sua solicitação sobre "' + input.value + '".');
                      }
                      input.value = '';
                   }}>
                      <input 
                         type="text" 
                         placeholder="Pergunte ao Atlas..." 
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[11px] text-white outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-600"
                      />
                   </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-[24px] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(14,165,233,0.4)] hover:scale-110 active:scale-95 transition-all relative group"
          >
             <div className="scale-150 absolute animate-ping bg-sky-500/40 w-full h-full rounded-[24px] group-hover:opacity-0 transition-opacity"></div>
             <div className="scale-125 relative z-10">{ICONS.Messages}</div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Layout;

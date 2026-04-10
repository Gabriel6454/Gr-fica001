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

  // Auto-detect device and adjust layout
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 768 && w < 1024) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      } else if (w >= 1024) {
        setIsCollapsed(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomNavItems = useMemo(() => [
    { id: 'dashboard', label: 'Início', icon: ICONS.Dashboard },
    { id: 'orders', label: 'Pedidos', icon: ICONS.Orders },
    { id: 'sales', label: 'Vendas', icon: ICONS.Sales },
    { id: 'customers', label: 'Clientes', icon: ICONS.Customers },
    { id: 'settings', label: 'Ajustes', icon: ICONS.Settings },
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
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-sky-500/30 flex flex-col md:flex-row overflow-x-hidden antialiased" style={{ zoom: settings.systemScale || 1 }}>
      
      {/* ── Mobile Top Bar ── */}
      <header className="lg:hidden flex items-center justify-between px-4 bg-[#020617]/85 backdrop-blur-xl border-b border-white/5" style={{ height: '3.75rem', paddingTop: 'env(safe-area-inset-top)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80 }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0">
            {settings.logoUrl && settings.logoUrl.length > 10 ? <img src={settings.logoUrl} className="w-full h-full object-cover rounded-xl" alt="Logo" /> : <DefaultLogo className="w-5 h-5" />}
          </div>
          <span className="text-white font-black text-xs tracking-tighter uppercase italic leading-none">{settings.name || 'Atlas'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-sky-500 animate-pulse' : 'bg-amber-500'}`} />
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">{ICONS.Menu}</button>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation (Floating Dock) ── */}
      <nav className="lg:hidden fixed z-[80] left-4 right-4 flex items-center justify-between px-2 bg-[#050914]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] rounded-3xl" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))', height: '4.5rem' }}>
        {bottomNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => handleTabChange(item.id)} 
              className={`relative flex flex-col items-center justify-center flex-1 h-full rounded-2xl transition-all duration-300 ${isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isActive && (
                  <motion.div 
                    layoutId="mob-nav-pill" 
                    className="absolute inset-x-1.5 inset-y-2 bg-sky-500/10 rounded-2xl border border-sky-500/20" 
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <div className={`relative z-10 flex flex-col items-center transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                <div className={`transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'scale-90 opacity-70'}`}>
                  {item.icon}
                </div>
                <span className={`text-[8.5px] font-black uppercase tracking-[0.1em] mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>{item.label}</span>
              </div>
            </button>
          )
        })}
      </nav>

      {/* ── Mobile Backdrop ── */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:sticky top-0 left-0 bottom-0 h-screen z-[100] glass-card bg-[#030712]/70 flex flex-col transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'lg:w-[4.5rem]' : 'lg:w-64'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-sky-500 rounded-full border border-sky-400 items-center justify-center text-[#030712] shadow-xl z-[110] hover:scale-110 active:scale-95 transition-all">
          <div className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}>{ICONS.Chevron}</div>
        </button>

        <div className={`px-5 pt-6 pb-4 flex items-center gap-4 shrink-0 ${isCollapsed && !isMobileMenuOpen ? 'lg:justify-center' : ''}`}>
          <div className="w-11 h-11 bg-sky-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-sky-500/40 overflow-hidden">
            {settings.logoUrl && settings.logoUrl.length > 10 ? <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" /> : <DefaultLogo className="w-6 h-6" />}
          </div>
          {(!isCollapsed || isMobileMenuOpen) && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
              <span className="text-white font-black text-lg tracking-tighter block leading-none italic uppercase">{settings.name || 'Atlas'}</span>
              <span className="text-[9px] text-sky-500 font-black uppercase tracking-[0.4em] block mt-0.5">GESTÃO</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar py-2">
          {ALL_MENU_ITEMS.map((item) => (
            <button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center rounded-2xl transition-all duration-200 relative group ${isCollapsed && !isMobileMenuOpen ? 'lg:justify-center px-0 py-3.5' : 'px-4 py-3 gap-3.5'} ${activeTab === item.id ? 'bg-sky-500/10 text-sky-400 font-black' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
              <div className={activeTab === item.id ? 'text-sky-400' : 'group-hover:text-slate-300'}>{item.icon}</div>
              {(!isCollapsed || isMobileMenuOpen) && <span className="text-[13px] tracking-tight truncate font-semibold">{item.label}</span>}
              {activeTab === item.id && <div className="absolute left-0 w-1 h-6 bg-sky-500 rounded-r-full shadow-[0_0_12px_#0ea5e9]" />}
            </button>
          ))}
        </nav>

        <div className={`px-3 pb-4 border-t border-white/5 pt-3 shrink-0 ${isCollapsed && !isMobileMenuOpen ? 'lg:flex lg:justify-center' : ''}`}>
          <div className={`flex items-center bg-slate-900/40 rounded-2xl border border-slate-800/50 ${isCollapsed && !isMobileMenuOpen ? 'p-2' : 'p-2.5 gap-3 w-full'}`}>
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] font-black text-sky-500 shrink-0">{userInitials}</div>
            {(!isCollapsed || isMobileMenuOpen) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-white truncate">{currentUser?.name || 'Usuário'}</p>
                <button onClick={onLogout} className="text-[9px] text-rose-500 font-black uppercase tracking-widest hover:text-rose-400 shadow-sm">Sair do Sistema</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 overflow-x-hidden" style={{ paddingTop: 'calc(4rem)', paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <style>{`@media (min-width: 1024px) { main { padding-top: 1.5rem !important; padding-bottom: 2rem !important; } }`}</style>
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 max-w-full">{children}</div>
      </main>

    </div>
  );
};

export default Layout;

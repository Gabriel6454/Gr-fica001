
import React, { useState, useMemo, useEffect } from 'react';
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
  { id: 'reports', label: 'Relatórios', icon: ICONS.Reports },
  { id: 'quick-messages', label: 'Mensagem Rápida', icon: ICONS.Messages },
  { id: 'investments', label: 'Investimento', icon: ICONS.Sales },
  { id: 'settings', label: 'Configurações', icon: ICONS.Settings },
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

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
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
      </main>
    </div>
  );
};

export default Layout;

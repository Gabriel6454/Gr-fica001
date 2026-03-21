
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
}

// Exportando para ser usado no Settings.tsx
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

// Componente de Logo Padrão (Ícone de Gestão)
export const DefaultLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, settings, currentUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Executa ao montar

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerClasses = "min-h-screen bg-[#020617] text-slate-200 selection:bg-sky-500/30 flex flex-col md:flex-row overflow-x-hidden antialiased";

  const headerClasses = "md:hidden fixed top-0 left-0 right-0 h-16 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-[80] flex items-center justify-between px-4 sm:px-6";

  const sidebarClasses = `fixed md:sticky top-0 left-0 bottom-0 glass-card bg-[#030712]/60 h-screen flex flex-col z-[100] transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'md:w-20' : 'md:w-64'}`;

  const mainClasses = "flex-1 pt-20 md:pt-6 pb-8 px-4 sm:px-6 md:pl-10 md:pr-6 max-w-full overflow-x-hidden transition-all duration-300";

  const menuItems = ALL_MENU_ITEMS;

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
    <div className={containerClasses} style={{ zoom: settings.systemScale || 1 }}>

      {/* Mobile Top Bar */}
      <header className={headerClasses}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <DefaultLogo className="w-6 h-6" />
          </div>
          <span className="text-white font-black text-xs tracking-tighter uppercase italic">{settings.name || 'Atlas'}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {ICONS.Menu}
        </button>
      </header>

      {/* Backdrop Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] md:hidden transition-all duration-500" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex absolute -right-3 top-24 w-6 h-6 bg-sky-500 rounded-full border border-sky-400 items-center justify-center text-[#030712] shadow-xl z-[110] hover:scale-110 active:scale-95 transition-all">
          <div className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'} scale-75`}>{ICONS.Chevron}</div>
        </button>

        {/* Logo */}
        <div className={`p-8 mb-4 flex items-center ${isCollapsed ? 'md:justify-center' : 'gap-4'}`}>
          <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-sky-500/40 overflow-hidden relative group/logo">
            {settings.logoUrl && settings.logoUrl.length > 10 ? (
              <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <DefaultLogo className="w-7 h-7" />
            )}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
          </div>
          {(!isCollapsed || isMobileMenuOpen) && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
              <span className="text-white font-black text-xl tracking-tighter block leading-none italic uppercase italic">{settings.name || 'Atlas'}</span>
              <span className="text-[9px] text-sky-500 font-black uppercase tracking-[0.4em] mt-1 block">GESTÃO</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center rounded-2xl transition-all duration-300 group relative ${isCollapsed && !isMobileMenuOpen ? 'md:justify-center px-0 py-4' : 'px-5 py-3.5 gap-4'} ${isActive ? 'bg-sky-500/10 text-sky-400 glow-sky' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                <div className={`${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors shrink-0 scale-110`}>{item.icon}</div>
                {(!isCollapsed || isMobileMenuOpen) && <span className={`text-[13px] tracking-tight truncate ${isActive ? 'font-black' : 'font-semibold'}`}>{item.label}</span>}
                {isActive && <div className="absolute left-0 w-1 h-6 bg-sky-500 rounded-r-full shadow-[0_0_15px_#0ea5e9]"></div>}
              </button>
            );
          })}
        </nav>

        {/* Profile with Logout */}
        <div className={`p-6 border-t border-white/5 mt-auto ${isCollapsed && !isMobileMenuOpen ? 'md:flex md:justify-center' : ''}`}>
          <div className={`flex items-center bg-slate-900/40 rounded-2xl border border-slate-800/50 group/profile ${isCollapsed && !isMobileMenuOpen ? 'p-2' : 'p-3 gap-3 w-full'}`}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[12px] font-black text-sky-500 shrink-0">
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

      <main className={mainClasses}>
        <div className="max-w-full ml-0">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, StoreSettings } from '../types';
import { ICONS } from '../constants';
import { DefaultLogo } from './Layout';

interface PublicTrackingProps {
  order: Order;
  settings: StoreSettings;
  onBackToAdmin?: () => void;
}

const PublicTracking: React.FC<PublicTrackingProps> = ({ order, settings, onBackToAdmin }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [realTimeEvents, setRealTimeEvents] = useState(order.trackingHistory || []);

  const steps = [
    { status: 'created', label: 'Pedido Recebido', sub: 'Aguardando início', icon: ICONS.Orders },
    { status: OrderStatus.ART, label: 'Criação de Arte', sub: 'Em desenvolvimento', icon: ICONS.Palette },
    { status: OrderStatus.PRODUCTION, label: 'Produção', sub: 'Impressão e acabamento', icon: ICONS.Settings },
    { status: OrderStatus.SHIPPING, label: 'Em Transporte', sub: 'Saiu para entrega', icon: ICONS.Shipping },
    { status: OrderStatus.DELIVERED, label: 'Entregue', sub: 'Recebido pelo cliente', icon: ICONS.Success },
  ];


  const getStatusIndex = (status: string) => {
    if (status === OrderStatus.COMPLETED) return 3; 
    if (status === OrderStatus.DELIVERED) return 4;
    if (status === OrderStatus.SHIPPING) return 3;
    if (status === OrderStatus.PRODUCTION) return 2;
    if (status === OrderStatus.ART) return 1;
    return 0;
  };

  const fetchRealTimeTracking = async () => {
    if (!order.trackingCode) return;
    
    setIsSearching(true);
    setSearchProgress(0);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Connect to our new backend API running concurrently
      const response = await fetch(`http://localhost:3001/api/track/${order.trackingCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.events && data.events.length > 0) {
           setRealTimeEvents(data.events);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tracking data', error);
    } finally {
      clearInterval(progressInterval);
      setSearchProgress(100);
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
  };

  useEffect(() => {
    // Initial fetch
    if (order.trackingCode) {
      fetchRealTimeTracking();
    }
    
    // Polling every 60 seconds
    const pollInterval = setInterval(() => {
        if (order.trackingCode && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED) {
            fetchRealTimeTracking();
        }
    }, 60000);

    return () => clearInterval(pollInterval);
  }, [order.trackingCode, order.status]);

  const currentIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-['Inter',sans-serif] pb-12">
      
      {/* Header Público */}
      <header className="bg-[#030712] border-b border-slate-900 p-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-sky-500/10">
                    {settings.logoUrl && settings.logoUrl.length > 10 ? (
                        <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                        <DefaultLogo className="w-5 h-5 text-white" />
                    )}
                </div>
                <div>
                    <h1 className="text-sm font-black text-white uppercase tracking-wider">{settings.name || 'Atlas'}</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tracking</p>
                </div>
            </div>
            {settings.whatsapp && (
                <a 
                  href={`https://wa.me/${settings.whatsapp}`}
                  className="bg-[#25D366]/10 text-[#25D366] p-2 rounded-full hover:bg-[#25D366] hover:text-white transition-all"
                  target="_blank" rel="noreferrer"
                >
                    {ICONS.Whatsapp}
                </a>
            )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8 mt-4">
        
        {/* Card Principal */}
        <div className="bg-[#0a111f] border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 pointer-events-none">
                {ICONS.Shipping}
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                            #{order.id}
                        </span>
                        <h2 className="text-2xl font-black text-white mt-4 uppercase tracking-tight">Olá, {order.customerName.split(' ')[0]}</h2>
                        <p className="text-sm text-slate-400 font-medium">Acompanhe a evolução do seu material.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#030712] border border-slate-800/50 p-4 rounded-2xl">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Previsão</p>
                        <p className="text-lg font-black text-white">{order.deliveryDate}</p>
                    </div>
                    <div className="bg-[#030712] border border-slate-800/50 p-4 rounded-2xl">
                         <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Status Atual</p>
                         <p className="text-lg font-black text-sky-500 truncate">{order.status}</p>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-2">
                {/* Linha de Conexão Vertical */}
                <div className="absolute left-[27px] top-4 bottom-10 w-1 bg-slate-800 rounded-full"></div>
                <div 
                  className="absolute left-[27px] top-4 w-1 bg-sky-500 rounded-full transition-all duration-1000"
                  style={{ height: `${(currentIndex / (steps.length - 1)) * 100}%`, maxHeight: 'calc(100% - 40px)' }}
                ></div>

                <div className="space-y-8 relative z-10">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    
                    return (
                      <div key={idx} className={`flex items-center gap-5 transition-all ${idx > currentIndex ? 'opacity-40' : 'opacity-100'}`}>
                        {/* Ícone do Passo */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-sky-500 border-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' 
                            : 'bg-[#030712] border-slate-700 text-slate-600'
                        }`}>
                          {isCompleted ? ICONS.Success : step.icon}
                        </div>

                        {/* Texto do Passo */}
                        <div className={`flex-1 p-4 rounded-2xl border transition-all ${
                            isCurrent 
                            ? 'bg-sky-500/10 border-sky-500/30' 
                            : 'bg-transparent border-transparent'
                        }`}>
                          <h4 className={`text-sm font-black uppercase tracking-tight ${isCurrent ? 'text-sky-400' : isCompleted ? 'text-white' : 'text-slate-500'}`}>
                            {step.label}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">{step.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>
        </div>

        {/* Real-time Logistics Tracking */}
        {order.trackingCode && (
            <div className="space-y-6">
                <div className="bg-sky-500/5 border border-sky-500/20 rounded-[32px] p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-500">
                                <div className="scale-125">{ICONS.Shipping}</div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Conectado via API Correios</h4>
                                <p className="text-xl font-black text-white italic uppercase">{order.carrier || 'Transporte'}</p>
                                <p className="text-[11px] text-sky-500 font-bold tracking-widest uppercase mt-0.5">{order.trackingCode}</p>
                            </div>
                        </div>
                        <button 
                            onClick={fetchRealTimeTracking}
                            className={`w-full sm:w-auto px-10 py-4 ${isSearching ? 'bg-slate-700 pointer-events-none' : 'bg-sky-500'} text-white font-black uppercase rounded-2xl text-[11px] tracking-[0.2em] shadow-2xl shadow-sky-500/20 hover:scale-[1.03] active:scale-95 transition-all text-center flex items-center justify-center gap-2`}
                        >
                            {isSearching ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Sincronizando...
                                </>
                            ) : (
                                <>Atualizar Status</>
                            )}
                        </button>
                    </div>
                    {isSearching && (
                        <div className="mt-6 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${searchProgress}%` }}></div>
                        </div>
                    )}
                </div>

                {/* Tracking Timeline (Real Events) */}
                {realTimeEvents && realTimeEvents.length > 0 && (
                    <div className="bg-[#0a111f] border border-slate-800 rounded-[32px] p-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${isSearching ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></span>
                                Status em Tempo Real
                            </div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Atualização Automática Ativa</span>
                        </h3>
                        <div className="space-y-8 relative pl-6">
                            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-800"></div>
                            {realTimeEvents.map((event, idx) => (
                                <div key={idx} className="relative group">
                                    <div className={`absolute -left-[24px] top-1.5 w-3 h-3 rounded-full border-2 border-[#0a111f] transition-all ${idx === 0 ? 'bg-emerald-500 scale-125 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <p className={`text-sm font-black uppercase tracking-tight ${idx === 0 ? 'text-white' : 'text-slate-400'}`}>{event.status}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{event.location}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest whitespace-nowrap">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}


        {/* Resumo do Pedido */}
        <div className="bg-[#0a111f] border border-slate-800 rounded-[32px] p-8">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                {ICONS.Orders} Resumo do Pedido
            </h3>
            <div className="space-y-4">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
                        <div>
                            <p className="text-sm font-bold text-white">Item de Venda</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{item.quantity} Unidades</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                 <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Investimento Total</span>
                 <span className="text-xl font-black text-white">R$ {order.total.toFixed(2).replace('.', ',')}</span>
            </div>
        </div>

        <div className="text-center pt-8 opacity-40">
             <div className="flex justify-center mb-2 text-slate-600">
               <DefaultLogo className="w-4 h-4" />
             </div>
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
                 {settings.name || 'Atlas'} System
             </p>
             {onBackToAdmin && (
               <button onClick={onBackToAdmin} className="mt-4 text-[9px] text-sky-500 underline uppercase tracking-widest">
                 Acesso Administrativo
               </button>
             )}
        </div>

      </main>
    </div>
  );
};

export default PublicTracking;

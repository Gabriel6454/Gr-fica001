import React from 'react';
import { ICONS } from '../constants';

const Ecommerce: React.FC = () => {
  const integrations = [
    { name: 'Mercado Livre', status: 'Online', orders: 12, color: 'bg-yellow-400' },
    { name: 'Shopify', status: 'Online', orders: 5, color: 'bg-emerald-500' },
    { name: 'Venda Direta (Balcão)', status: 'Ativo', orders: 28, color: 'bg-sky-500' },
    { name: 'WhatsApp Bot', status: 'Offline', orders: 0, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 sm:px-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Canais de <span className="text-sky-500">Venda</span></h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Integrações Omnichannel v2.9</p>
        </div>
        <button className="px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-sky-500 hover:text-white transition-all shadow-xl shadow-white/5">
           + Nova Integração
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrations.map((int, i) => (
          <div key={i} className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[32px] p-6 space-y-4 hover:border-white/10 transition-all group">
             <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-2xl ${int.color} flex items-center justify-center text-black`}>
                   {ICONS.Up}
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${int.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                   {int.status}
                </div>
             </div>
             <div>
                <h3 className="text-lg font-black text-white">{int.name}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{int.orders} pedidos hoje</p>
             </div>
             <button className="w-full py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-white/10 transition-all">
                Configurar API
             </button>
          </div>
        ))}
      </div>

      <div className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[32px] p-8">
         <div className="flex items-center gap-3 mb-8">
            <div className="text-sky-500 scale-125">{ICONS.Orders}</div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Fila Unificada de Pedidos (Edge)</h4>
         </div>
         <div className="space-y-4">
            {[
               { id: 'ML-8821', platform: 'Mercado Livre', product: '1000 Cartões de Visita', total: 'R$ 89,90', status: 'Validando Arte' },
               { id: 'SH-1022', platform: 'Shopify', product: 'Banner Lona 440g', total: 'R$ 145,00', status: 'Aguardando Arquivo' },
               { id: 'POS-001', platform: 'Balcão', product: 'Adesivo Vinil 10x10', total: 'R$ 35,00', status: 'Em Produção' },
            ].map((order, i) => (
               <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 gap-4">
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-slate-500 bg-black/40 px-3 py-1 rounded-lg border border-white/5">{order.id}</span>
                     <div>
                        <p className="text-xs font-black text-white uppercase">{order.product}</p>
                        <p className="text-[9px] text-sky-500 font-bold uppercase tracking-widest">{order.platform}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 justify-between sm:justify-end">
                     <div className="text-right">
                        <p className="text-xs font-black text-white">{order.total}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{order.status}</p>
                     </div>
                     <button className="p-3 bg-sky-500 rounded-xl text-white shadow-lg shadow-sky-500/20 active:scale-90 transition-all">
                        {ICONS.Chevron}
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Ecommerce;

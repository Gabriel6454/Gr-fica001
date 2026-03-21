
import React from 'react';
import { CatalogOrder, CatalogOrderStatus } from '../types';
import { ICONS } from '../constants';

interface CatalogOrdersProps {
  catalogOrders: CatalogOrder[];
  onUpdateStatus: (id: string, status: CatalogOrderStatus) => void;
}

const CatalogOrders: React.FC<CatalogOrdersProps> = ({ catalogOrders, onUpdateStatus }) => {
  const getStatusStyle = (status: CatalogOrderStatus) => {
    switch (status) {
      case CatalogOrderStatus.NEW: return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case CatalogOrderStatus.WAITING_PAYMENT: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case CatalogOrderStatus.APPROVED: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case CatalogOrderStatus.CANCELLED: return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl font-black text-white leading-tight tracking-tight">Pedidos do Catálogo</h1>
          <p className="text-slate-500 text-sm font-medium">Solicitações orçamentárias do seu link público</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#0a111f] border border-slate-800 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:text-white transition-all">
            {ICONS.Copy} Copiar Link do Catálogo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {catalogOrders.map((order) => (
          <div key={order.id} className="bg-[#0a111f] border border-slate-800/60 rounded-[32px] p-8 space-y-6 shadow-2xl hover:border-sky-500/30 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{order.id}</span>
                <h3 className="text-xl font-black text-white group-hover:text-sky-400 transition-colors mt-1">{order.customerName}</h3>
                <p className="text-xs text-sky-500 font-bold">{order.customerPhone}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="bg-[#030712] border border-slate-800/40 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">Produto</span>
                <span className="text-xs font-bold text-white">{order.productName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">Quantidade</span>
                <span className="text-xs font-black text-sky-500">{order.quantity} unidades</span>
              </div>
              <div className="pt-3 border-t border-slate-800/40 flex justify-between items-center">
                <span className="text-xs font-black text-white uppercase tracking-widest">Valor</span>
                <span className="text-lg font-black text-emerald-500">R$ {order.totalValue.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => onUpdateStatus(order.id, CatalogOrderStatus.APPROVED)}
                className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Converter p/ Pedido
              </button>
              <button 
                onClick={() => onUpdateStatus(order.id, CatalogOrderStatus.CANCELLED)}
                className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Recusar
              </button>
            </div>
          </div>
        ))}

        {catalogOrders.length === 0 && (
          <div className="col-span-full py-20 bg-[#0a111f]/40 border border-slate-800 border-dashed rounded-[40px] flex flex-col items-center justify-center text-slate-600">
            <div className="scale-[3] mb-8 opacity-20">{ICONS.Catalog}</div>
            <p className="text-sm font-black uppercase tracking-[0.2em]">Sem novos orçamentos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogOrders;

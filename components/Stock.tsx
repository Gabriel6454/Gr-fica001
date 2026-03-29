import React, { useState } from 'react';
import { StockItem } from '../types';
import { ICONS } from '../constants';

interface StockProps {
  items: StockItem[];
  onUpdate: (id: string, updates: Partial<StockItem>) => void;
  onAdd: (item: Partial<StockItem>) => void;
  onDelete: (id: string) => void;
}

const Stock: React.FC<StockProps> = ({ items, onUpdate, onAdd, onDelete }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(it => it.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-4 sm:px-8">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Controle de <span className="text-sky-500">Insumos</span></h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Gestão de Papéis e Matéria-Prima</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto px-8 py-3.5 bg-sky-500 text-white font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-sky-400 transition-all shadow-xl shadow-sky-500/20 active:scale-95 text-[11px] tracking-widest">
          {ICONS.Plus}
          Novo Insumo
        </button>
      </div>

      <div className="px-4 sm:px-8">
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">{ICONS.Search}</div>
          <input type="text" placeholder="Buscar papel, tinta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0a111f]/40 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700 shadow-xl backdrop-blur-md" />
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const isLow = item.quantity <= item.minQuantity;
            return (
              <div key={item.id} className={`glass-card bg-[#0a111f]/40 border ${isLow ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/5'} rounded-[32px] p-6 space-y-4 shadow-2xl backdrop-blur-xl relative group hover:border-sky-500/30 transition-all`}>
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-all">
                    {ICONS.Products}
                  </div>
                  {isLow && <span className="px-3 py-1 bg-rose-500/20 text-rose-500 text-[8px] font-black uppercase rounded-full border border-rose-500/30 animate-pulse">Estoque Baixo</span>}
                </div>
                
                <div>
                  <h3 className="font-black text-white text-lg uppercase tracking-tight truncate">{item.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Mínimo: {item.minQuantity} {item.unit}</p>
                </div>

                <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Disponível</span>
                    <p className={`text-2xl font-black tracking-tighter ${isLow ? 'text-rose-500' : 'text-sky-400'}`}>{item.quantity} <span className="text-xs opacity-40">{item.unit}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 transition-all">
                  <button onClick={() => onUpdate(item.id, { quantity: item.quantity + 10 })} className="py-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-500 text-[9px] font-black uppercase rounded-xl hover:bg-sky-500 hover:text-white transition-all shadow-lg active:scale-95 group-hover:bg-sky-500 group-hover:text-white">+ 10 UN</button>
                  <button onClick={() => onDelete(item.id)} className="py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase rounded-xl hover:bg-rose-500 hover:text-white transition-all opacity-40 hover:opacity-100">Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stock;

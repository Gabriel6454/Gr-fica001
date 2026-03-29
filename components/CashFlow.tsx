import React from 'react';
import { Order, StockItem } from '../types';
import { ICONS } from '../constants';

interface CashFlowProps {
  orders: Order[];
  stock: StockItem[];
}

const CashFlow: React.FC<CashFlowProps> = ({ orders, stock }) => {
  const totalReceivable = orders.reduce((sum, o) => sum + (o.remainingAmount || 0), 0);
  const totalReceived = orders.reduce((sum, o) => {
    const paid = (o.total || 0) - (o.remainingAmount || 0);
    return sum + paid;
  }, 0);

  const lowStockItems = stock.filter(s => s.quantity <= s.minQuantity);
  const criticalStockCost = lowStockItems.length * 150; // Estimativa simples

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="px-4 sm:px-8">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Fluxo de Caixa <span className="text-emerald-500">Industrial</span></h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Gestão Financeira e Previsibilidade v2.7</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[32px] p-8 space-y-2">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo em Carteira</p>
               <h3 className="text-4xl font-black text-white tracking-tighter">R$ {totalReceived.toFixed(2).replace('.', ',')}</h3>
               <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
                  {ICONS.Up} +12% vs mês anterior
               </div>
            </div>
            <div className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[32px] p-8 space-y-2">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A Receber (Inadimplência)</p>
               <h3 className="text-4xl font-black text-rose-500 tracking-tighter">R$ {totalReceivable.toFixed(2).replace('.', ',')}</h3>
               <div className="flex items-center gap-2 text-rose-500 text-[10px] font-bold">
                  {ICONS.Pending} 8 pedidos pendentes
               </div>
            </div>
          </div>

          <div className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[32px] p-8">
             <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Projeção de Reinvestimento</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div>
                      <p className="text-xs font-black text-white uppercase">Reposição de Insumos Críticos</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{lowStockItems.length} itens abaixo do mínimo</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-sky-400">R$ {criticalStockCost.toFixed(2)}</p>
                      <button className="text-[9px] font-black text-sky-500 uppercase tracking-widest mt-1 hover:underline">Comprar Agora</button>
                   </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50">
                   <div>
                      <p className="text-xs font-black text-white uppercase">Manutenção de Máquinas</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Agendado para 15/04</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-slate-400">R$ 1.200,00</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass-card bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] p-8">
              <div className="flex items-center gap-3 mb-4">
                 <div className="scale-110 text-emerald-500">{ICONS.Success}</div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">IA Financeira: Insight</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                 Seu fluxo de caixa está saudável. Sugerimos reinvestir 15% do lucro acumulado na compra antecipada de **Couché 150g**, prevendo alta de preço no próximo mês.
              </p>
           </div>
           
           <div className="glass-card bg-rose-500/10 border border-rose-500/20 rounded-[32px] p-8">
              <div className="flex items-center gap-3 mb-4">
                 <div className="scale-110 text-rose-500">{ICONS.Pending}</div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Alerta de Churn</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                 Identificamos que 3 clientes VIP não realizam pedidos há mais de 45 dias. 
                 <button className="block text-rose-500 font-black uppercase mt-2 hover:underline">Ver Clientes</button>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;

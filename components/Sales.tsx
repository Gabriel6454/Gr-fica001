
import React, { useMemo, useState, useEffect } from 'react';
import { Order, OrderStatus, Customer } from '../types';
import { ICONS, formatOrderId } from '../constants';
import { PAYMENT_METHODS } from './Orders';

interface SalesProps {
  orders: Order[];
  customers: Customer[];
  onEditOrder: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => void;
}

const Sales: React.FC<SalesProps> = ({ orders, customers, onEditOrder, onDeleteOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');


  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStr = today.toISOString().split('T')[0];

    if (period === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (period === 'last7') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (period === 'last30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (period === 'thisMonth') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  }, [period]);

  const registeredOrders = useMemo(() => {
    return orders.filter(o => o.isRegistered !== false);
  }, [orders]);


  // Cálculos e Filtros para a lista de vendas
  const filteredOrders = useMemo(() => {
    return registeredOrders.filter(order => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.includes(searchTerm);

      const isPaid = order.remainingAmount <= 0;
      const isPartial = order.remainingAmount > 0 && order.remainingAmount < order.total;
      const isPending = order.remainingAmount === order.total;

      if (filterType === 'paid') return matchesSearch && isPaid;
      if (filterType === 'partial') return matchesSearch && isPartial;
      if (filterType === 'pending') return matchesSearch && isPending;

      return matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [registeredOrders, searchTerm, filterType]);

  const stats = useMemo(() => {
    const totalRevenue = registeredOrders.reduce((acc, o) => acc + (o.total - o.remainingAmount), 0);
    const totalPending = registeredOrders.reduce((acc, o) => acc + o.remainingAmount, 0);
    const totalSalesValue = registeredOrders.reduce((acc, o) => acc + o.total, 0);
    const fullyPaidCount = registeredOrders.filter(o => o.remainingAmount <= 0).length;

    return { totalRevenue, totalPending, totalSalesValue, fullyPaidCount };
  }, [registeredOrders]);


  const handleDeleteSale = (orderId: string) => {
    if (window.confirm(`Deseja realmente excluir esta venda registrada? O pedido #${formatOrderId(orderId)} será removido permanentemente.`)) {
      onDeleteOrder(orderId);
    }
  };

  const getPaymentMethodIcon = (methodId?: string) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method ? method.icon : '💰';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* HEADER BAR PADRONIZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5 mb-10 px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase italic">Fluxo de <span className="text-sky-500">Caixa</span></h1>
          <p className="text-slate-500 text-sm font-medium">Gestão de faturamento e registros de vendas</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card bg-[#0a111f]/60 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group border border-white/5 hover:border-emerald-500/30 transition-all duration-500">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 shadow-inner group-hover:scale-110 transition-transform">
              {ICONS.Success}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">TOTAL RECEBIDO</p>
            <p className="text-3xl font-black text-emerald-500 italic uppercase italic tracking-tighter">R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Capital em conta</span>
            </div>
          </div>
        </div>

        <div className="glass-card bg-[#0a111f]/60 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group border border-white/5 hover:border-rose-500/30 transition-all duration-500">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 shadow-inner group-hover:scale-110 transition-transform">
              {ICONS.Warning}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">SALDO PENDENTE</p>
            <p className="text-3xl font-black text-rose-500 italic uppercase italic tracking-tighter">R$ {stats.totalPending.toFixed(2).replace('.', ',')}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500/50"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Crédito a recuperar</span>
            </div>
          </div>
        </div>

        <div className="glass-card bg-[#0a111f]/60 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group border border-white/5 hover:border-sky-500/30 transition-all duration-500 sm:col-span-2 lg:col-span-1">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 mb-6 shadow-inner group-hover:scale-110 transition-transform">
              {ICONS.Sales}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">CONVERSÃO TOTAL</p>
            <p className="text-3xl font-black text-white italic uppercase italic tracking-tighter">{stats.fullyPaidCount} <span className="text-sm text-slate-500 font-black">/ {registeredOrders.length}</span></p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Pedidos liquidados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col gap-6 bg-[#0a111f]/40 p-8 rounded-[40px] border border-white/5 shadow-3xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
              {ICONS.Search}
            </div>
            <input
              type="text"
              placeholder="Localizar protocolo ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl py-4 pl-14 pr-8 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700 shadow-inner"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full sm:w-56 bg-[#030712]/40 border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-sky-500/50 appearance-none cursor-pointer shadow-inner"
              >
                <option value="today" className="bg-[#0f172a]">Período: Hoje</option>
                <option value="last7" className="bg-[#0f172a]">Últimos 7 dias</option>
                <option value="last30" className="bg-[#0f172a]">Últimos 30 dias</option>
                <option value="thisMonth" className="bg-[#0f172a]">Este mês</option>
                <option value="custom" className="bg-[#0f172a]">Personalizado</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-bold">{ICONS.ChevronDown}</div>
            </div>
            {period === 'custom' && (
              <div className="flex items-center gap-3 bg-[#030712]/40 border border-white/5 rounded-2xl px-4 py-2 animate-in zoom-in-95 duration-300">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-white text-[10px] font-black outline-none cursor-pointer uppercase" />
                <span className="text-slate-600 font-black text-[10px]">→</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-white text-[10px] font-black outline-none cursor-pointer uppercase" />
              </div>
            )}
          </div>
        </div>

        <div className="flex bg-[#030712]/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto w-full no-scrollbar shadow-inner">
          {[
            { id: 'all', label: 'Toda Operação' },
            { id: 'paid', label: 'Liquidados' },
            { id: 'partial', label: 'Fluxo Parcial' },
            { id: 'pending', label: 'Saldo Devedor' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id as any)}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative overflow-hidden group/tab ${filterType === filter.id
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {filter.label}
              {filterType === filter.id && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/40"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="space-y-8">
        {filteredOrders.map(order => {
          const paidAmount = order.total - order.remainingAmount;
          const percentagePaid = (paidAmount / (order.total || 1)) * 100;

          let statusStyle = {
            color: 'text-slate-500',
            bg: 'bg-slate-500/10',
            border: 'border-slate-500/20',
            label: 'Pendente',
            glow: ''
          };

          if (order.remainingAmount <= 0) {
            statusStyle = { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'LIQUIDADO', glow: 'glow-emerald' };
          } else if (paidAmount > 0) {
            statusStyle = { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'PARCIAL', glow: 'glow-orange' };
          } else {
            statusStyle = { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'AGUARDANDO', glow: 'glow-rose' };
          }

          const transactionList = order.transactions && order.transactions.length > 0
            ? order.transactions
            : paidAmount > 0
              ? [{ id: 'legacy', date: order.date, amount: paidAmount, method: order.paymentMethod || 'Link Gerado' }]
              : [];

          return (
            <div key={order.id} className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all duration-500 group shadow-2xl flex flex-col lg:flex-row gap-10">

              <div className="flex-1 space-y-8">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-[#030712]/60 border border-white/5 flex items-center justify-center text-sky-500 font-black text-xs shadow-inner group-hover:scale-105 transition-transform">
                      #{formatOrderId(order.id)}
                    </div>
                    <div>
                      <h3 className="text-white font-black text-lg italic uppercase italic tracking-tight mb-2">{order.customerName}</h3>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} ${statusStyle.glow}`}>
                          {statusStyle.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {order.date ? new Date(order.date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Data Indefinida'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newStatus = prompt("Confirmar liquidação completa?", "Pago");
                        if (newStatus === 'Pago') onEditOrder(order.id, { remainingAmount: 0 });
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-slate-500 hover:text-sky-500 hover:bg-sky-500/10 transition-all"
                    >
                      {ICONS.Edit}
                    </button>
                    <button
                      onClick={() => handleDeleteSale(order.id)}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      {ICONS.Trash}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/5">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">VALOR NOMINAL</span>
                    <span className="text-2xl font-black text-white italic italic italic tracking-tight">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">CUSTO DO PROJETO</span>
                    <span className="text-base font-black text-rose-500/80 uppercase tracking-tighter">R$ {order.items.reduce((acc, item) => acc + (item.cost || 0), 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROGRESSO DE AMORTIZAÇÃO</span>
                    <span className={`text-[11px] font-black italic italic italic ${percentagePaid >= 100 ? 'text-emerald-500' : 'text-sky-500'}`}>{percentagePaid.toFixed(0)}% CONCLUÍDO</span>
                  </div>
                  <div className="h-4 w-full bg-[#030712]/60 rounded-full overflow-hidden border border-white/5 p-1 flex items-center">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${percentagePaid >= 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]'}`}
                      style={{ width: `${Math.max(percentagePaid, 2)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[400px] bg-[#030712]/40 border border-white/5 rounded-[32px] p-8 relative overflow-hidden flex flex-col shadow-inner">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <div className="scale-[3] text-sky-500">{ICONS.History}</div>
                </div>

                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3 relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></div>
                  LOG DE TRANSAÇÕES
                </h4>

                <div className="flex-1 space-y-4 relative z-10 max-h-[220px] overflow-y-auto no-scrollbar pr-2">
                  {transactionList.map((t, idx) => (
                    <div key={t.id || idx} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all border-l-2 border-l-emerald-500">
                      <div className="flex items-center gap-4">
                        <span className="text-xl bg-emerald-500/10 p-2 rounded-xl text-emerald-500">{getPaymentMethodIcon(t.method)}</span>
                        <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-tighter">{t.method || 'OPERACIONAL'}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                            {new Date(t.date).toLocaleDateString('pt-BR')} • {new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-500 italic italic tracking-tight">
                        +R$ {t.amount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}

                  {order.remainingAmount > 0 && (
                    <div className="flex justify-between items-center p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 border-l-2 border-l-rose-500 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 text-sm">
                          {ICONS.Warning}
                        </div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-tight">SALDO<br />RETIDO</p>
                      </div>
                      <span className="text-sm font-black text-rose-500 italic italic tracking-tight">
                        R$ {order.remainingAmount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  {transactionList.length === 0 && !order.remainingAmount && (
                    <div className="text-center py-10 opacity-30">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">AGUARDANDO INPUT</p>
                    </div>
                  )}
                </div>

                {order.remainingAmount > 0 && (
                  <button className="mt-6 w-full py-4 bg-sky-500 text-white font-black uppercase rounded-2xl text-[10px] tracking-widest hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all">
                    LIQUIDAR SALDO
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-slate-800">
              <div className="text-slate-600 scale-150">{ICONS.Search}</div>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Nenhuma venda encontrada</h3>
            <p className="text-slate-500 font-medium max-w-sm">
              Tente ajustar os filtros de busca ou o período selecionado para visualizar suas vendas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;

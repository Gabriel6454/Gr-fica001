import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS } from '../constants';
import { Product, Order, OrderStatus, Customer, StoreSettings } from '../types';
import { OrderModal, OrderPrintModal, PaymentModal, TrackingModal, contactCustomer } from './Orders';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  customerName: string | null;
  orders: Order[];
}

const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({ isOpen, onClose, onBack, customerName, orders }) => {
  if (!isOpen || !customerName) return null;

  const customerOrders = orders.filter(o => o.customerName === customerName);
  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lastOrderDate = customerOrders.length > 0 ? customerOrders[0].deliveryDate : 'N/A';

  const customerInfo = {
    type: 'Pessoa Física',
    document: '703.542.996-46',
    phone: '(38) 99122-4063',
    address: 'Joaquim de morais, 198 - Casa/MG - 39402-465'
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#030712] border border-slate-800/60 w-full max-w-5xl rounded-[24px] shadow-3xl flex flex-col h-full sm:h-auto max-h-[98vh] sm:max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">

        <div className="p-6 sm:p-8 pb-4 relative border-b border-slate-900/50">
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-6 right-4 sm:right-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800/40 rounded-lg"
          >
            {ICONS.X}
          </button>

          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-all">
              <div className="rotate-180 scale-110 sm:scale-125">{ICONS.Chevron}</div>
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate pr-8">Histórico: {customerName}</h2>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-sm font-medium ml-8 sm:ml-10">Detalhes completos e histórico de compras.</p>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-6 sm:space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
          <section className="bg-[#0a111f]/60 border border-slate-800/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 text-sky-500">
              {ICONS.Customers}
              <h3 className="font-bold text-white text-sm sm:text-base">Informações do Cliente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-slate-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Tipo:</span>
                  <span className="bg-sky-500 text-[9px] font-black px-3 py-1 rounded-full text-black uppercase">{customerInfo.type}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-slate-500 mt-0.5 shrink-0">{ICONS.Shipping}</div>
                  <span className="text-xs sm:text-sm font-bold text-slate-300 leading-relaxed">{customerInfo.address}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#0a111f]/60 border border-slate-800/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 text-sky-500">
              <div className="scale-110">{ICONS.History}</div>
              <h3 className="font-bold text-white text-sm sm:text-base">Resumo de Compras</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Gasto', value: `R$ ${(totalSpent || 0).toFixed(2).replace('.', ',')}`, icon: '$', color: 'text-emerald-500' },
                { label: 'Total de Compras', value: customerOrders.length.toString(), icon: ICONS.Orders, color: 'text-sky-500' },
                { label: 'Última Compra', value: lastOrderDate, icon: ICONS.Pending, color: 'text-sky-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-[#0d1729] border border-slate-800/60 p-4 sm:p-5 rounded-2xl flex items-center gap-4 text-slate-200">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 ${stat.color}`}>
                    {typeof stat.icon === 'string' ? <span className="text-xl font-black">{stat.icon}</span> : stat.icon}
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-base sm:text-lg font-black">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOpenHistory: (customerName: string) => void;
}

const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose, orders, onOpenHistory }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a111f] border border-slate-800/60 w-full max-w-6xl rounded-[24px] shadow-2xl flex flex-col h-full sm:h-auto max-h-[98vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8 pb-4 relative">
          <button onClick={onClose} className="absolute top-4 sm:top-6 right-4 sm:right-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800/40 rounded-lg">{ICONS.X}</button>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-emerald-500 scale-110 sm:scale-125">{ICONS.Sales}</div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Todas as Vendas</h2>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-4 sm:px-8 py-4">
          <div className="min-w-[600px] sm:min-w-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] border-b border-slate-800/40">
                  <th className="py-4 sm:py-6 px-2 sm:px-4">ID Venda</th>
                  <th className="py-4 sm:py-6 px-2 sm:px-4">Cliente</th>
                  <th className="py-4 sm:py-6 px-2 sm:px-4">Valor</th>
                  <th className="py-4 sm:py-6 px-2 sm:px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-slate-200">
                {orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-800/10 transition-all">
                    <td className="py-4 sm:py-5 px-2 sm:px-4"><span className="text-xs sm:text-sm font-bold opacity-80 group-hover:opacity-100">#{order.id.substring(0, 6)}</span></td>
                    <td className="py-4 sm:py-5 px-2 sm:px-4"><span className="text-xs sm:text-sm font-bold text-sky-500 cursor-pointer hover:underline">{order.customerName}</span></td>
                    <td className="py-4 sm:py-5 px-2 sm:px-4"><span className="text-xs sm:text-sm font-black">R$ {(order.total || 0).toFixed(2).replace('.', ',')}</span></td>
                    <td className="py-4 sm:py-5 px-2 sm:px-4 text-right">
                      <button onClick={() => onOpenHistory(order.customerName)} className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#0d1729] border border-slate-800/60 hover:border-slate-700 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all">
                        {ICONS.Customers} <span className="hidden sm:inline">Histórico</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  iconBgClass: string;
  glowColor: string;
  valueColorClass: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, subtext, icon, iconBgClass, glowColor, valueColorClass }) => (
  <div className="glass-card bg-[#0a111f]/40 rounded-[24px] p-5 flex items-center justify-between min-h-[125px] shadow-lg hover:border-white/10 transition-all duration-300 group relative overflow-hidden" style={{ border: `1px solid ${glowColor}30` }}>
    <div className="flex flex-col justify-center h-full relative z-10">
      <div className="space-y-1.5">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">{label}</p>
        <h3 className={`text-xl font-black tracking-tight ${valueColorClass}`}>{value}</h3>
      </div>
      {subtext && (
        <p
          className="text-[8px] mt-3 font-black uppercase tracking-[0.16em] border-l-2 border-white/5 pl-2 transition-all opacity-80"
          style={{ color: glowColor }}
        >
          {subtext}
        </p>
      )}
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${iconBgClass} shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 opacity-80`} style={{ boxShadow: `0 8px 20px -8px ${glowColor}50` }}>
      <div className="scale-110">{icon}</div>
    </div>
  </div>
);

const OrderCard: React.FC<{
  order: Order;
  onDelete: (id: string) => void;
  onEdit: (order: Order) => void;
  onPrint: (order: Order) => void;
  onPay: (order: Order) => void;
  onTrack: (order: Order) => void;
  onFinalize: (order: Order) => void;
  customers: Customer[];
  isDragging?: boolean;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  isCollapsed?: boolean;
}> = ({ order, onDelete, onEdit, onPrint, onPay, onTrack, onFinalize, customers, isDragging, onStatusChange, isCollapsed: initialCollapsed }) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed ?? true);

  useEffect(() => {
    if (initialCollapsed !== undefined) setIsCollapsed(initialCollapsed);
  }, [initialCollapsed]);

  const getNextStatus = (current: OrderStatus): OrderStatus => {
    const statuses = [
      OrderStatus.ART,
      OrderStatus.PRODUCTION,
      OrderStatus.SHIPPING,
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED
    ];
    const currentIndex = statuses.indexOf(current);
    if (currentIndex === -1 || currentIndex === statuses.length - 1) return statuses[0];
    return statuses[currentIndex + 1];
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onStatusChange) {
      onStatusChange(order.id, getNextStatus(order.status));
    }
  };

  const statusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ART: return { dot: 'bg-orange-400', glow: 'rgba(251,146,60,0.18)', border: 'rgba(251,146,60,0.35)', badge: 'text-orange-300 bg-orange-500/10 border-orange-500/25', accent: 'text-orange-400', label: 'Criando Arte' };
      case OrderStatus.PRODUCTION: return { dot: 'bg-sky-400', glow: 'rgba(56,189,248,0.18)', border: 'rgba(56,189,248,0.35)', badge: 'text-sky-300 bg-sky-500/10 border-sky-500/25', accent: 'text-sky-400', label: 'Em Produ\u00e7\u00e3o' };
      case OrderStatus.SHIPPING: return { dot: 'bg-violet-400', glow: 'rgba(167,139,250,0.18)', border: 'rgba(167,139,250,0.35)', badge: 'text-violet-300 bg-violet-500/10 border-violet-500/25', accent: 'text-violet-400', label: 'Em Transporte' };
      case OrderStatus.DELIVERED: return { dot: 'bg-cyan-400', glow: 'rgba(34,211,238,0.18)', border: 'rgba(34,211,238,0.35)', badge: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25', accent: 'text-cyan-400', label: 'Entregue' };
      case OrderStatus.COMPLETED: return { dot: 'bg-emerald-400', glow: 'rgba(52,211,153,0.18)', border: 'rgba(52,211,153,0.35)', badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25', accent: 'text-emerald-400', label: 'Conclu\u00eddo' };
      default: return { dot: 'bg-slate-500', glow: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', badge: 'text-slate-400 bg-slate-500/10 border-slate-500/20', accent: 'text-slate-400', label: status };
    }
  };

  const cfg = statusConfig(order.status);
  const customer = customers.find(c => c.id === order.customerId || c.name === order.customerName);
  const whatsappNumber = customer?.phone?.replace(/\D/g, '');

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('orderId', order.id);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('opacity-40');
  };

  const hasPendingBalance = (order.remainingAmount || 0) > 0;

  const orderProfit = order.items.reduce((acc, item) => {
    const cost = item.cost !== undefined ? item.cost : 0;
    return acc + (item.price - cost);
  }, 0);

  const shippingCost = order.shippingCost || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group/card relative w-full box-border rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 ${isDragging ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5'}`}
      style={{
        background: 'linear-gradient(145deg, #0d1526 0%, #080f1d 100%)',
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 4px 24px -4px ${cfg.glow}, 0 1px 0 0 rgba(255,255,255,0.04) inset`,
      }}
    >
      {/* Glow de fundo sutil */}
      <div
        className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-40 pointer-events-none transition-opacity duration-500 group-hover/card:opacity-70"
        style={{ background: cfg.glow.replace('0.18', '1') }}
      />

      {/* Header — sempre visível, clicável para colapsar */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setIsCollapsed(c => !c); }}
        className="relative w-full text-left focus:outline-none px-4 pt-4 pb-3"
      >
        {/* Linha 1: status pill + chevron */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Dot pulsante */}
            <span className={`relative flex h-2 w-2`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-60`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
            </span>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleStatusClick}
              className={`text-[9px] font-black uppercase tracking-[0.18em] border rounded-full px-2.5 py-0.5 transition-all hover:brightness-110 active:scale-95 cursor-pointer ${cfg.badge}`}
              title="Clique para avançar o status"
            >
              {cfg.label}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-600 font-bold">#{order.id.substring(0, 4)}</span>
            <svg
              className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Linha 2: nome do cliente */}
        <h4 className="text-[15px] font-black text-white tracking-tight leading-none truncate mb-2.5">
          {order.customerName}
        </h4>

        {/* Linha 3: total em destaque + data */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Total</p>
            <p className={`text-xl font-black tracking-tight leading-none ${cfg.accent}`}>
              R$ {(order.total || 0).toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Entrega</p>
            <p className="text-xs font-black text-slate-300">{order.deliveryDate}</p>
          </div>
        </div>
      </button>

      {/* Corpo recolhível */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {/* Divisor */}
            <div className="mx-4 mb-3" style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${cfg.border}, transparent)` }} />

            <div className="px-4 pb-4 space-y-3">
              {/* Grid de métricas */}
              <div className={`grid gap-2 ${shippingCost > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {[
                  { label: 'Restante', value: `R$ ${(order.remainingAmount || 0).toFixed(2).replace('.', ',')}`, color: hasPendingBalance ? 'text-rose-400' : 'text-emerald-400', bg: hasPendingBalance ? 'rgba(244,63,94,0.08)' : 'rgba(52,211,153,0.08)' },
                  { label: 'Lucro', value: `R$ ${orderProfit.toFixed(2).replace('.', ',')}`, color: orderProfit >= 0 ? 'text-emerald-400' : 'text-rose-400', bg: orderProfit >= 0 ? 'rgba(52,211,153,0.08)' : 'rgba(244,63,94,0.08)' },
                  ...(shippingCost > 0 ? [{ label: 'Frete', value: `R$ ${shippingCost.toFixed(2).replace('.', ',')}`, color: 'text-sky-400', bg: 'rgba(56,189,248,0.08)' }] : []),
                ].map(m => (
                  <div key={m.label} className="rounded-xl px-3 py-2.5 flex flex-col gap-1" style={{ background: m.bg, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{m.label}</span>
                    <span className={`text-xs font-black ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Botão principal */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onPay(order); }}
                className={`w-full py-3 mt-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] ${hasPendingBalance
                  ? 'text-white'
                  : 'text-emerald-400 border border-emerald-500/25'
                  }`}
                style={hasPendingBalance ? {
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: '0 4px 16px -2px rgba(249,115,22,0.45)',
                } : { background: 'rgba(52,211,153,0.08)' }}
              >
                {hasPendingBalance ? 'Pagar Saldo' : '✓ Pagamento Concluído'}
              </button>

              {/* Ícones de ação */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1">
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/55${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      title={`WhatsApp: ${customer?.phone}`}
                      className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.5l5.82-1.527A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.877 9.877 0 0 1-5.031-1.378l-.361-.214-3.733.979.995-3.638-.235-.374A9.869 9.869 0 0 1 2.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z" />
                      </svg>
                    </a>
                  )}
                  <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onPrint(order); }} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">{ICONS.Print}</button>
                  <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onEdit(order); }} className="p-2 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-all">{ICONS.Edit}</button>
                </div>
                <button onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDelete(order.id); }} className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all">{ICONS.Trash}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface DashboardProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  settings: StoreSettings;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onEditOrder: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => void;
  onReceivePayment: (orderId: string, amount: number, method: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, orders, customers, settings, onUpdateOrderStatus, onEditOrder, onDeleteOrder, onReceivePayment }) => {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (period === 'custom') return;
    const today = new Date();
    // Use local timezone to get the correct YYYY-MM-DD string
    const getLocalYYYYMMDD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalYYYYMMDD(today);

    if (period === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (period === 'last7') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      setStartDate(getLocalYYYYMMDD(sevenDaysAgo));
      setEndDate(todayStr);
    } else if (period === 'last30') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setStartDate(getLocalYYYYMMDD(thirtyDaysAgo));
      setEndDate(todayStr);
    } else if (period === 'thisMonth') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(getLocalYYYYMMDD(firstDayOfMonth));
      setEndDate(todayStr);
    } else if (period === 'all') {
      setStartDate('');
      setEndDate('');
    }
  }, [period]);

  const [activeEditingOrder, setActiveEditingOrder] = useState<Order | undefined>(undefined);
  const [activePrintOrder, setActivePrintOrder] = useState<Order | undefined>(undefined);
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | undefined>(undefined);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | undefined>(undefined);

  const statusColumns = [
    { id: OrderStatus.ART, label: 'CRIANDO ARTE', textColor: 'text-orange-500', icon: ICONS.Palette },
    { id: OrderStatus.PRODUCTION, label: 'EM PRODUÇÃO', textColor: 'text-sky-500', icon: ICONS.Pending },
    { id: OrderStatus.SHIPPING, label: 'EM TRANSPORTE', textColor: 'text-purple-600', icon: ICONS.Shipping },
    { id: OrderStatus.DELIVERED, label: 'ENTREGUE', textColor: 'text-sky-500', icon: ICONS.Success },
    { id: OrderStatus.COMPLETED, label: 'CONCLUIDO', textColor: 'text-emerald-500', icon: ICONS.Success },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (!startDate && !endDate) return true;
      const orderDate = new Date(order.date + 'T12:00:00');
      if (startDate && orderDate < new Date(startDate + 'T00:00:00')) return false;
      if (endDate && orderDate > new Date(endDate + 'T23:59:59')) return false;
      return true;
    });
  }, [orders, startDate, endDate]);

  const totalSales = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const totalCost = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      const orderItemCost = order.items.reduce((itemAcc, item) => {
        if (item.cost !== undefined) return itemAcc + item.cost;
        const product = products.find(p => p.id === item.productId);
        if (!product) return itemAcc;
        const tier = product.priceTiers.find(t => t.quantity === item.quantity);
        const cost = tier ? tier.costPrice : product.costPrice;
        return itemAcc + cost;
      }, 0);
      return acc + orderItemCost;
    }, 0);
  }, [filteredOrders, products]);

  const totalProfit = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
      const orderItemProfit = order.items.reduce((itemAcc, item) => {
        const cost = item.cost !== undefined ? item.cost : (() => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return 0;
          const tier = product.priceTiers.find(t => t.quantity === item.quantity);
          const totalCostPrice = tier ? tier.costPrice : product.costPrice;
          return totalCostPrice;
        })();
        return itemAcc + (item.price - cost);
      }, 0);
      return acc + orderItemProfit;
    }, 0);
  }, [filteredOrders, products]);

  const activeOrdersCount = filteredOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.COMPLETED).length;
  const finishedOrdersCount = filteredOrders.filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED).length;
  const uniqueBuyersCount = Array.from(new Set(filteredOrders.map(o => o.customerId || o.customerName))).length;
  const productsWithMarginCount = products.filter(p => (p.margin || 0) > 0).length;

  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      if (o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.COMPLETED) {
        counts[o.status] = (counts[o.status] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([status, count]) => `${count} em ${status.toLowerCase().replace('criando ', '')}`)
      .join(' • ') || "Nenhum pedido ativo";
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const statsByDate: Record<string, { sales: number; profit: number }> = {};
    filteredOrders.forEach(order => {
      const dateKey = order.date || new Date().toISOString().split('T')[0];
      if (!statsByDate[dateKey]) {
        statsByDate[dateKey] = { sales: 0, profit: 0 };
      }
      statsByDate[dateKey].sales += order.total;
      const orderProfit = order.items.reduce((acc, item) => {
        const cost = item.cost !== undefined ? item.cost : (() => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return 0;
          const tier = product.priceTiers.find(t => t.quantity === item.quantity);
          const totalCostPrice = tier ? tier.costPrice : product.costPrice;
          return totalCostPrice;
        })();
        return acc + (item.price - cost);
      }, 0);
      statsByDate[dateKey].profit += orderProfit;
    });
    const sortedDates = Object.keys(statsByDate).sort();
    if (sortedDates.length === 0) {
      const today = new Date();
      const dayStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return [{ date: dayStr, sales: 0, profit: 0 }];
    }
    return sortedDates.map(dateKey => {
      const [year, month, day] = dateKey.split('-');
      return { date: `${day}/${month}`, sales: statsByDate[dateKey].sales, profit: statsByDate[dateKey].profit };
    });
  }, [filteredOrders, products]);

  const topProducts = useMemo(() => {
    const productStats = products.map(p => {
      const profit = filteredOrders.reduce((acc, order) => {
        const itemProfit = order.items
          .filter(item => item.productId === p.id)
          .reduce((iAcc, item) => {
            const cost = item.cost !== undefined ? item.cost : (() => {
              const tier = p.priceTiers.find(t => t.quantity === item.quantity);
              const totalCostPrice = tier ? tier.costPrice : p.costPrice;
              return totalCostPrice;
            })();
            return iAcc + (item.price - cost);
          }, 0);
        return acc + itemProfit;
      }, 0);
      return { ...p, calculatedProfit: profit };
    });
    return productStats.sort((a, b) => b.calculatedProfit - a.calculatedProfit).filter(p => p.calculatedProfit > 0).slice(0, 5);
  }, [products, filteredOrders]);

  const handleOpenEdit = (order: Order) => {
    setActiveEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleOpenPrint = (order: Order) => {
    setActivePrintOrder(order);
    setIsPrintModalOpen(true);
  };

  const handleOpenPay = (order: Order) => {
    setActivePaymentOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handleOpenTrack = (order: Order) => {
    setActiveTrackingOrder(order);
    setIsTrackingModalOpen(true);
  };

  const handleFinalizeOrder = (order: Order) => {
    onUpdateOrderStatus(order.id, OrderStatus.COMPLETED);
  };

  const handleSaveOrderEdit = (data: Partial<Order>) => {
    if (activeEditingOrder) onEditOrder(activeEditingOrder.id, data);
    setIsOrderModalOpen(false);
  };

  const handleModalDelete = (id: string) => {
    onDeleteOrder(id);
    setIsOrderModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-full">
      <SalesModal isOpen={isSalesModalOpen} onClose={() => setIsSalesModalOpen(false)} orders={filteredOrders} onOpenHistory={(name) => { setSelectedCustomer(name); setIsHistoryModalOpen(true); setIsSalesModalOpen(false); }} />
      <CustomerHistoryModal isOpen={isHistoryModalOpen} customerName={selectedCustomer} orders={filteredOrders} onClose={() => setIsHistoryModalOpen(false)} onBack={() => { setIsHistoryModalOpen(false); setIsSalesModalOpen(true); }} />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrderEdit}
        onDelete={handleModalDelete}
        products={products}
        customers={customers}
        order={activeEditingOrder}
      />
      {activePrintOrder && <OrderPrintModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} order={activePrintOrder} products={products} customers={customers} settings={settings} />}
      {activePaymentOrder && <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} order={activePaymentOrder} onConfirm={onReceivePayment} />}
      {activeTrackingOrder && <TrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} order={activeTrackingOrder} customers={customers} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-slate-800/50 mb-6 px-4 sm:px-6 md:px-8">
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase">Painel de <span className="text-sky-500">Controle</span></h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-widest">Gestão de produção em tempo real</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800/50 w-full sm:w-auto overflow-x-auto no-scrollbar tabs-scroll">
            {[
              { id: 'today',     label: 'Hoje' },
              { id: 'last7',     label: '7D' },
              { id: 'last30',    label: '30D' },
              { id: 'thisMonth', label: 'Mês' },
              { id: 'all',       label: 'Tudo' },
              { id: 'custom',    label: '...' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`shrink-0 flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  period === p.id
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {period === 'custom' && (
              <div className="flex flex-1 items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-800 text-white text-[9px] font-bold p-2 px-2.5 rounded-xl focus:border-sky-500 outline-none transition-all"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-800 text-white text-[9px] font-bold p-2 px-2.5 rounded-xl focus:border-sky-500 outline-none transition-all"
                />
              </div>
            )}

            <button onClick={() => setIsSalesModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black uppercase rounded-2xl text-[9px] sm:text-[10px] tracking-widest shadow-xl transition-all active:scale-95">
              {ICONS.Eye}
              <span>Vendas</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid: 2 cols mobile → 3 tablet → 6 desktop */}
      <div className="kpi-grid pb-4 px-4 sm:px-6 md:px-8">
        <KpiCard label="Vendas"     value={`R$ ${(totalSales   || 0).toFixed(0)}`} subtext="Faturamento Bruto" icon={ICONS.Up}       iconBgClass="bg-[#14b8a6]" glowColor="#14b8a6" valueColorClass="text-[#14b8a6]" />
        <KpiCard label="Custo"      value={`R$ ${(totalCost    || 0).toFixed(0)}`} subtext="Gasto Materiais"  icon={ICONS.Products} iconBgClass="bg-[#ef4444]" glowColor="#ef4444" valueColorClass="text-[#ef4444]" />
        <KpiCard label="Lucro"      value={`R$ ${(totalProfit  || 0).toFixed(0)}`} subtext="Margem Líquida"   icon={ICONS.Success}  iconBgClass="bg-[#10b981]" glowColor="#10b981" valueColorClass="text-[#10b981]" />
        <KpiCard label="Ativos"     value={activeOrdersCount.toString()}            subtext="Pedidos em Aberto" icon={ICONS.Orders}   iconBgClass="bg-[#f59e0b]" glowColor="#f59e0b" valueColorClass="text-[#f59e0b]" />
        <KpiCard label="Clientes"   value={uniqueBuyersCount.toString()}            subtext="Base Ativa"       icon={ICONS.Customers}iconBgClass="bg-[#3b82f6]" glowColor="#3b82f6" valueColorClass="text-[#3b82f6]" />
        <KpiCard label="Finalizados"value={finishedOrdersCount.toString()}          subtext="Entregues"        icon={ICONS.Success}  iconBgClass="bg-[#10b981]" glowColor="#10b981" valueColorClass="text-[#10b981]" />
      </div>

      <div className="flex flex-col md:flex-row overflow-x-auto lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 items-start gap-6 -mx-4 px-4 md:mx-0 md:px-0 pb-10 no-scrollbar">
        {statusColumns.map(col => (
          <div
            key={col.id}
            data-column-id={col.id}
            onDragOver={(e) => { e.preventDefault(); setDragOverColumn(col.id); }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => { e.preventDefault(); setDragOverColumn(null); const id = e.dataTransfer.getData('orderId'); if (id) onUpdateOrderStatus(id, col.id as OrderStatus); }}
            className={`flex flex-col gap-4 min-h-[600px] w-[85vw] md:w-[320px] lg:w-full shrink-0 border-2 ${dragOverColumn === col.id ? 'border-sky-500 bg-sky-500/10' : 'border-white/5 bg-[#050914]/30'} rounded-[36px] p-4 backdrop-blur-xl transition-all duration-500 box-border`}
          >
            <div className="flex items-center justify-between px-4 shrink-0 mb-4 bg-white/5 py-3 rounded-[20px] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className={`${col.textColor} scale-100`}>{col.icon}</span>
                <h2 className={`text-[11px] font-black uppercase tracking-[0.2em] ${col.textColor}`}>{col.label}</h2>
              </div>
              <span className="text-[10px] font-black text-white bg-white/10 w-7 h-7 flex items-center justify-center rounded-xl border border-white/5 shadow-inner">
                {filteredOrders.filter(o => o.status === col.id).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-1 space-y-6 no-scrollbar pb-10">
              <AnimatePresence mode="popLayout">
                {col.id !== OrderStatus.COMPLETED ? (
                  filteredOrders.filter(o => o.status === col.id).map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onEdit={handleOpenEdit}
                      onPrint={handleOpenPrint}
                      onPay={handleOpenPay}
                      onTrack={handleOpenTrack}
                      onDelete={onDeleteOrder}
                      onFinalize={handleFinalizeOrder}
                      onStatusChange={onUpdateOrderStatus}
                      customers={customers}
                      isCollapsed={collapsedCols[col.id] ?? true}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full min-h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-emerald-500/10 rounded-[40px] opacity-30 hover:opacity-100 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all duration-500 p-8 text-center group"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 animate-bounce">
                      <div className="scale-[2]">{ICONS.Success}</div>
                    </div>
                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Finalizar Fluxo</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      Arraste aqui para concluir o pedido e arquivá-lo do painel ativo
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pb-20">
        <div className="bg-[#030712] border border-slate-800/40 rounded-[32px] p-8 shadow-2xl flex flex-col gap-10 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sky-500">{ICONS.Dashboard}</span>
            <h2 className="text-base font-black text-white tracking-tight leading-none uppercase">Desempenho Diário</h2>
          </div>
          <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0a111f] border border-slate-800/40 rounded-[32px] p-8 shadow-2xl flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-emerald-500">{ICONS.Products}</span>
              <div><h2 className="text-base font-black text-white tracking-tight leading-none mb-1">Top Performance</h2><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lucratividade Real por Item</p></div>
            </div>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 max-h-[300px]">
            {topProducts.map((product, idx) => {
              const currentProfit = product.calculatedProfit || 0;
              const percentage = totalProfit > 0 ? (currentProfit / totalProfit) * 100 : 0;
              return (
                <div key={product.id} className="bg-[#030712]/40 border border-slate-800/50 p-5 rounded-3xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-500 font-black text-xs">{idx + 1}</div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{product.name}</h4>
                    </div>
                    <span className="text-sm font-black text-white">R$ {(currentProfit || 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.max(5, percentage)}%` }}></div></div>
                </div>
              );
            })}
            {topProducts.length === 0 && (
              <div className="py-10 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Aguardando primeiras vendas</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

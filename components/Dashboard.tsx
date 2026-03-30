import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS, formatOrderId } from '../constants';
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <td className="py-4 sm:py-5 px-2 sm:px-4"><span className="text-xs sm:text-sm font-bold opacity-80 group-hover:opacity-100">#{formatOrderId(order.id)}</span></td>
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
  products: Product[];
  customers: Customer[];
  isDragging?: boolean;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  isCollapsed?: boolean;
}> = ({ order, onDelete, onEdit, onPrint, onPay, onTrack, onFinalize, products, customers, isDragging, onStatusChange, isCollapsed: initialCollapsed }) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed ?? true);

  useEffect(() => {
    if (initialCollapsed !== undefined) setIsCollapsed(initialCollapsed);
  }, [initialCollapsed]);

  const getNextStatus = (current: OrderStatus): OrderStatus => {
    const statuses = [
      OrderStatus.QUOTATION, OrderStatus.WAITING_PAYMENT, OrderStatus.WAITING_FILE,
      OrderStatus.ART, OrderStatus.WAITING_APPROVAL, OrderStatus.PRODUCTION,
      OrderStatus.READY_FOR_PICKUP, OrderStatus.SHIPPING, OrderStatus.DELIVERED,
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
      case OrderStatus.QUOTATION: return { dot: '#94a3b8', badge: 'Orçamento' };
      case OrderStatus.WAITING_PAYMENT: return { dot: '#fbbf24', badge: 'Aguard. Pagamento' };
      case OrderStatus.WAITING_FILE: return { dot: '#818cf8', badge: 'AGUARD. ARQUIVO' };
      case OrderStatus.ART: return { dot: '#fb923c', badge: 'Em Arte' };
      case OrderStatus.WAITING_APPROVAL: return { dot: '#f472b6', badge: 'Aguard. Aprovação' };
      case OrderStatus.PRODUCTION: return { dot: '#38bdf8', badge: 'Em Produção' };
      case OrderStatus.READY_FOR_PICKUP: return { dot: '#34d399', badge: 'PRONTO RETIRADA' };
      case OrderStatus.SHIPPING: return { dot: '#a78bfa', badge: 'LOGÍSTICA' };
      case OrderStatus.DELIVERED: return { dot: '#22d3ee', badge: 'ENTREGUE' };
      case OrderStatus.COMPLETED: return { dot: '#10b981', badge: 'CONCLUÍDO' };
      default: return { dot: '#64748b', badge: status.toUpperCase() };
    }
  };

  const cfg = statusConfig(order.status);
  const customer = customers.find(c => c.id === order.customerId || c.name === order.customerName);
  const whatsappNumber = customer?.phone?.replace(/\D/g, '');
  const hasPendingBalance = (order.remainingAmount || 0) > 0;
  const orderProfit = order.items.reduce((acc, item) => acc + (item.price - (item.cost || 0)), 0);
  const profitMargin = order.total > 0 ? (orderProfit / order.total) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('orderId', order.id);
        e.dataTransfer.effectAllowed = 'move';
        (e.currentTarget as HTMLElement).classList.add('opacity-40');
      }}
      onDragEnd={(e) => {
        (e.currentTarget as HTMLElement).classList.remove('opacity-40');
      }}
      className={`group/card relative w-full box-border rounded-[24px] overflow-hidden border border-white/5 cursor-grab active:cursor-grabbing transition-all duration-300 ${isDragging ? 'opacity-40' : 'hover:border-white/10'}`}
      style={{
        background: '#0a1122',
        padding: isCollapsed ? '16px 20px' : '20px 24px',
      }}
    >
      {/* HEADER COMPACTO */}
      <div className={`flex items-center justify-between mb-4`}>
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}60` }} />
           <button
             onClick={handleStatusClick}
             className="bg-[#121b33] border border-sky-500/10 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] text-sky-200 transition-all hover:bg-sky-500/10 active:scale-95"
           >
             {cfg.badge}
           </button>
           {!isCollapsed && (
             <div className="bg-[#10192e] px-2 py-1 rounded-lg border border-white/5 hidden sm:block">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">#{formatOrderId(order.id)}</span>
             </div>
           )}
        </div>
        <span className="text-emerald-500 text-xs">★</span>
      </div>

      {/* CUSTOMER NAME */}
      <div className="space-y-2 mb-4">
        <h3 className={`font-black text-white tracking-tight leading-none group-hover/card:text-sky-400 transition-colors uppercase truncate ${isCollapsed ? 'text-base' : 'text-lg'}`}>
          {order.customerName}
        </h3>
        
        {!isCollapsed && (
          <div className="flex flex-wrap gap-1.5">
            {order.items.map((it, i) => {
              const p = products.find(prod => prod.id === it.productId);
              return (
                <span key={i} className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-[#161f35] border border-white/5 px-2 py-1 rounded-lg">
                  {it.quantity}X {p?.name || 'Item'}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {!isCollapsed && <div className="h-[1px] bg-white/5 w-full mb-4" />}

      {/* FOOTER: PREÇO E EXPANDIR */}
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.2em]">Investimento</p>
          <div className="flex items-baseline gap-0.5">
             <span className="text-[10px] font-black text-sky-600 italic uppercase">r$</span>
             <span className={`${isCollapsed ? 'text-xl' : 'text-2xl'} font-black text-sky-200 tracking-tighter leading-none transition-all`}>
               {order.total.toFixed(0)}
               <span className="text-sm opacity-50">,{(order.total % 1).toFixed(2).split('.')[1] || '00'}</span>
             </span>
          </div>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`group/expand flex items-center justify-center rounded-xl bg-[#161f35] border border-white/5 text-slate-500 hover:text-white transition-all shadow-lg ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10 rotate-180 bg-sky-500/10 text-sky-400 border-sky-500/20'}`}
        >
          <div className="transition-transform group-hover/expand:scale-110">{ICONS.ChevronDown}</div>
        </button>
      </div>

      {/* ÁREA EXPANDIDA (DRAWER INDUSTRIAL) */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6 flex flex-col gap-4 border-t border-white/5 pt-6"
          >
            {/* GRID FINANCEIRO */}
            <div className="grid grid-cols-2 gap-2">
               <div className="bg-[#050a16] border border-white/5 rounded-2xl p-4 flex flex-col gap-1 ring-1 ring-inset ring-white/[0.02]">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em]">Pendente</span>
                  <span className={`text-[13px] font-black ${hasPendingBalance ? 'text-rose-500' : 'text-emerald-500'}`}>R$ {order.remainingAmount.toFixed(2).replace('.', ',')}</span>
               </div>
               <div className="bg-[#050a16] border border-white/5 rounded-2xl p-4 flex flex-col gap-1 ring-1 ring-inset ring-white/[0.02]">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em]">Margem</span>
                  <span className="text-[13px] font-black text-sky-400">{profitMargin.toFixed(0)}%</span>
               </div>
            </div>

            {/* BOTÕES DE AÇÃO PRIMÁRIA */}
            <div className="flex gap-2">
               <button 
                 onClick={() => onPay(order)} 
                 className={`flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${hasPendingBalance ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95' : 'bg-[#161f35] text-emerald-500 border border-emerald-500/10'}`}
               >
                 {hasPendingBalance ? 'RECEBER VALOR' : 'PAGAMENTO OK'}
               </button>
               <button 
                 onClick={() => onPrint(order)} 
                 className="flex-1 flex items-center justify-center rounded-2xl bg-[#161f35] border border-white/5 text-slate-400 hover:text-white hover:bg-sky-500/10 transition-all active:scale-95"
               >
                 {ICONS.Print}
               </button>
            </div>

            {/* BARRA DE FERRAMENTAS (FOOTER) */}
            <div className="flex items-center justify-between bg-[#080d1a] border border-white/5 p-2 rounded-2xl">
               <div className="flex gap-1">
                  <button 
                    onClick={() => onEdit(order)} 
                    className="p-3 bg-white/5 rounded-xl border border-white/5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
                    title="Editar Pedido"
                  >
                    {ICONS.Edit}
                  </button>
                  {whatsappNumber && (
                    <button 
                      onClick={() => contactCustomer(order, customer)} 
                      className="p-3 bg-white/5 rounded-xl border border-white/5 text-emerald-600 hover:bg-emerald-500/10 transition-all"
                      title="Enviar WhatsApp"
                    >
                      {ICONS.Whatsapp}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      const link = `${window.location.origin}?tracking=${order.id}`;
                      navigator.clipboard.writeText(link);
                      alert('Link de rastreamento copiado!');
                    }}
                    className="p-3 bg-white/5 rounded-xl border border-white/5 text-sky-500 hover:bg-sky-500/10 transition-all"
                    title="Copiar Link de Rastreio"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </button>
               </div>
               <button 
                 onClick={() => onDelete(order.id)} 
                 className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                 title="Excluir Pedido"
               >
                 {ICONS.Trash}
               </button>
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

  const [period, setPeriod] = useState('all');
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
    { id: 'entrance', label: 'ENTRADA', textColor: 'text-amber-500', icon: ICONS.Pending, statuses: [OrderStatus.QUOTATION, OrderStatus.WAITING_PAYMENT, OrderStatus.WAITING_FILE] },
    { id: 'art', label: 'ARTE & APROVAÇÃO', textColor: 'text-orange-500', icon: ICONS.Palette, statuses: [OrderStatus.ART, OrderStatus.WAITING_APPROVAL] },
    { id: 'production', label: 'PRODUÇÃO', textColor: 'text-sky-500', icon: ICONS.Settings, statuses: [OrderStatus.PRODUCTION, OrderStatus.READY_FOR_PICKUP] },
    { id: 'logistics', label: 'LOGÍSTICA', textColor: 'text-purple-600', icon: ICONS.Shipping, statuses: [OrderStatus.SHIPPING, OrderStatus.DELIVERED] },
    { id: 'finished', label: 'CONCLUÍDOS', textColor: 'text-emerald-500', icon: ICONS.Success, statuses: [OrderStatus.COMPLETED] },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Se não há filtro de data, mostra tudo
      if (!startDate && !endDate) return true;
      
      // Sanitização da data do pedido
      if (!order.date) return false;

      // Se o filtro for para "HOJE", usamos comparação direta de strings para evitar problemas de fuso horário
      const orderDateStr = order.date.includes('T') ? order.date.split('T')[0] : order.date;
      
      if (startDate === endDate && startDate) {
         // Filtro de um único dia (Hoje) com resiliência para drift de fuso horário UTC (manter compatibilidade)
         const tomorrowUtc = new Date();
         tomorrowUtc.setDate(tomorrowUtc.getDate() + 1);
         const tomorrowUtcStr = tomorrowUtc.toISOString().split('T')[0];
         
         return orderDateStr === startDate || orderDateStr === tomorrowUtcStr;
      }

      // Filtro de intervalo
      const orderDate = new Date(orderDateStr + 'T12:00:00');
      if (isNaN(orderDate.getTime())) return false;

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

  const activeOrdersCount = filteredOrders.filter(o => ![OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(o.status)).length;
  const finishedOrdersCount = filteredOrders.filter(o => [OrderStatus.COMPLETED, OrderStatus.DELIVERED].includes(o.status)).length;
  const uniqueBuyersCount = Array.from(new Set(filteredOrders.map(o => o.customerId || o.customerName))).length;
  const productsWithMarginCount = products.filter(p => (p.margin || 0) > 0).length;

  const statusSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      if (![OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(o.status)) {
        counts[o.status] = (counts[o.status] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([status, count]) => `${count} em ${status.toLowerCase()}`)
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
              { id: 'today', label: 'Hoje' },
              { id: 'last7', label: '7D' },
              { id: 'last30', label: '30D' },
              { id: 'thisMonth', label: 'Mês' },
              { id: 'all', label: 'Tudo' },
              { id: 'custom', label: '...' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`shrink-0 flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${period === p.id
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
            <button
              onClick={() => {
                const productionOrders = orders.filter(o => o.status === OrderStatus.PRODUCTION);
                const items = productionOrders.flatMap(o => o.items);
                const summary = items.reduce((acc, it) => {
                  acc[it.productId] = (acc[it.productId] || 0) + it.quantity;
                  return acc;
                }, {} as Record<string, number>);

                let text = "RELATÓRIO DE PRODUÇÃO ATIVA\n==========================\n\n";
                Object.entries(summary).forEach(([pid, qty]) => {
                  const p = products.find(prod => prod.id === pid);
                  text += `- ${p?.name || 'Item'}: ${qty} unidades\n`;
                });

                if (productionOrders.length === 0) text += "Nenhum pedido em produção no momento.";

                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `producao_${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-black uppercase rounded-2xl text-[9px] sm:text-[10px] tracking-widest shadow-xl shadow-sky-500/20 transition-all active:scale-95"
            >
              {ICONS.Print}
              <span>Produção</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid: 2 cols mobile → 3 tablet → 6 desktop */}
      <div className="kpi-grid pb-4 px-4 sm:px-6 md:px-8">
        <KpiCard label="Vendas" value={`R$ ${(totalSales || 0).toFixed(0)}`} subtext="Faturamento Bruto" icon={ICONS.Up} iconBgClass="bg-[#14b8a6]" glowColor="#14b8a6" valueColorClass="text-[#14b8a6]" />
        <KpiCard label="Custo" value={`R$ ${(totalCost || 0).toFixed(0)}`} subtext="Gasto Materiais" icon={ICONS.Products} iconBgClass="bg-[#ef4444]" glowColor="#ef4444" valueColorClass="text-[#ef4444]" />
        <KpiCard label="Lucro" value={`R$ ${(totalProfit || 0).toFixed(0)}`} subtext="Margem Líquida" icon={ICONS.Success} iconBgClass="bg-[#10b981]" glowColor="#10b981" valueColorClass="text-[#10b981]" />
        <KpiCard label="Ativos" value={activeOrdersCount.toString()} subtext="Pedidos em Aberto" icon={ICONS.Orders} iconBgClass="bg-[#f59e0b]" glowColor="#f59e0b" valueColorClass="text-[#f59e0b]" />
        <KpiCard label="Clientes" value={uniqueBuyersCount.toString()} subtext="Base Ativa" icon={ICONS.Customers} iconBgClass="bg-[#3b82f6]" glowColor="#3b82f6" valueColorClass="text-[#3b82f6]" />
        <KpiCard label="Finalizados" value={finishedOrdersCount.toString()} subtext="Entregues" icon={ICONS.Success} iconBgClass="bg-[#10b981]" glowColor="#10b981" valueColorClass="text-[#10b981]" />
      </div>

      <div className="flex flex-col md:flex-row overflow-x-auto lg:grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 items-start gap-6 -mx-4 px-4 md:mx-0 md:px-0 pb-10 no-scrollbar">
        {statusColumns.map(col => (
          <div
            key={col.id}
            data-column-id={col.id}
            onDragOver={(e) => { e.preventDefault(); setDragOverColumn(col.id); }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverColumn(null);
              const id = e.dataTransfer.getData('orderId');
              if (id) {
                // Ao soltar em uma coluna, move para o PRIMEIRO status dessa coluna
                onUpdateOrderStatus(id, col.statuses[0]);
              }
            }}
            className={`flex flex-col gap-4 min-h-[600px] w-[85vw] md:w-[320px] lg:w-full shrink-0 border-2 ${dragOverColumn === col.id ? 'border-sky-500 bg-sky-500/10' : 'border-white/5 bg-[#050914]/30'} rounded-[36px] p-4 backdrop-blur-xl transition-all duration-500 box-border`}
          >
            <div className="flex items-center justify-between px-4 shrink-0 mb-4 bg-white/5 py-3 rounded-[20px] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className={`${col.textColor} scale-100`}>{col.icon}</span>
                <h2 className={`text-[11px] font-black uppercase tracking-[0.2em] ${col.textColor}`}>{col.label}</h2>
              </div>
              <span className="text-[10px] font-black text-white bg-white/10 w-7 h-7 flex items-center justify-center rounded-xl border border-white/5 shadow-inner">
                {filteredOrders.filter(o => col.statuses.includes(o.status)).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-1 space-y-6 no-scrollbar pb-10">
              <AnimatePresence mode="popLayout">
                {filteredOrders.filter(o => col.statuses.includes(o.status)).map(order => (
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
                    products={products}
                    customers={customers}
                    isCollapsed={collapsedCols[col.id] ?? true}
                  />
                ))}

                {/* Drop Zone Visual quando a coluna está vazia */}
                {filteredOrders.filter(o => col.statuses.includes(o.status)).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="h-full min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] p-8 text-center"
                  >
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      Livre
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

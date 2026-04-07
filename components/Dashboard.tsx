import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS, formatOrderId } from '../constants';
import { Product, Order, OrderStatus, Customer, StoreSettings, StockItem } from '../types';
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

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  stock: StockItem[];
}

const ProductionModal: React.FC<ProductionModalProps> = ({ isOpen, onClose, orders, products, stock }) => {
  if (!isOpen) return null;

  const productionOrders = orders.filter(o => o.status === OrderStatus.PRODUCTION);
  
  const productionSummary = useMemo(() => {
    const summary: Record<string, { product: Product; quantity: number; details: any[] }> = {};
    
    productionOrders.forEach(order => {
      order.items.forEach(item => {
        if (!summary[item.productId]) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            summary[item.productId] = { product, quantity: 0, details: [] };
          }
        }
        if (summary[item.productId]) {
          summary[item.productId].quantity += item.quantity;
          summary[item.productId].details.push({
            orderId: order.id,
            customerName: order.customerName,
            quantity: item.quantity,
            paperType: item.paperType,
            finishing: item.finishing,
            deliveryDate: order.deliveryDate
          });
        }
      });
    });
    return Object.values(summary);
  }, [productionOrders, products]);

  const stockAlerts = useMemo(() => {
    const alerts: { name: string; needed: number; available: number; ok: boolean }[] = [];
    productionSummary.forEach(s => {
      s.details.forEach(d => {
        if (d.paperType) {
          const stockItem = stock.find(si => si.name.toLowerCase().includes(d.paperType.toLowerCase()));
          if (stockItem) {
            const existing = alerts.find(a => a.name === stockItem.name);
            if (existing) {
              existing.needed += d.quantity;
              existing.ok = existing.available >= existing.needed;
            } else {
              alerts.push({
                name: stockItem.name,
                needed: d.quantity,
                available: stockItem.quantity,
                ok: stockItem.quantity >= d.quantity
              });
            }
          }
        }
      });
    });
    return alerts;
  }, [productionSummary, stock]);

  const handleExportText = () => {
    let text = "RELATÓRIO DE PRODUÇÃO ATIVA\n==========================\n\n";
    productionSummary.forEach(s => {
      text += `- ${s.product.name}: ${s.quantity} unidades\n`;
      s.details.forEach(d => {
        text += `  • Pedido #${formatOrderId(d.orderId)} - ${d.customerName} (${d.paperType || 'N/A'})\n`;
      });
      text += "\n";
    });

    if (productionSummary.length === 0) text += "Nenhum pedido em produção no momento.";

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `producao_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a111f] border border-slate-800/60 w-full max-w-6xl rounded-[24px] shadow-2xl flex flex-col h-full max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8 pb-4 relative border-b border-white/5">
          <button onClick={onClose} className="absolute top-4 sm:top-6 right-4 sm:right-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800/40 rounded-lg">{ICONS.X}</button>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-sky-500 scale-110 sm:scale-125">{ICONS.Settings}</div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase tracking-widest">Produção Industrial</h2>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Gestão de demanda e materiais ativos</p>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-[#10192e] border border-white/5 p-5 rounded-2xl">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Pedidos Ativos</p>
                <h4 className="text-2xl font-black text-white mt-1">{productionOrders.length}</h4>
             </div>
             <div className="bg-[#10192e] border border-white/5 p-5 rounded-2xl">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Itens em Fila</p>
                <h4 className="text-2xl font-black text-sky-400 mt-1">{productionSummary.reduce((acc, s) => acc + s.quantity, 0)}</h4>
             </div>
             <div className="sm:col-span-2 flex items-center justify-end gap-3">
                <button onClick={handleExportText} className="px-6 py-3 bg-[#161f35] border border-white/5 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
                  {ICONS.Print} Gerar Lista TXT
                </button>
             </div>
          </div>

          {stockAlerts.length > 0 && (
            <div className="bg-[#0c1425] border border-white/5 rounded-[24px] p-6 space-y-4">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                Verificação de Materiais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stockAlerts.map((alert, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border transition-all ${alert.ok ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/20'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-black text-slate-200 uppercase truncate pr-2">{alert.name}</p>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${alert.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {alert.ok ? 'ESTOQUE OK' : 'FALTANTE'}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold">Necessário: {alert.needed} | Disponível: {alert.available}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_#38bdf8]" />
              Fila de Produção Detalhada
            </h3>
            <div className="overflow-x-auto rounded-[24px] border border-white/5 bg-[#050914]/50 backdrop-blur-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="py-5 px-6">Produto</th>
                    <th className="py-5 px-6">Quantidade</th>
                    <th className="py-5 px-6">Especificações</th>
                    <th className="py-5 px-6">Pedidos Vinculados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {productionSummary.map((s, idx) => (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 px-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-black text-sky-500">
                             {s.product.name[0]}
                          </div>
                          <p className="text-xs font-black text-white uppercase pr-4">{s.product.name}</p>
                        </div>
                      </td>
                      <td className="py-5 px-6 border-b border-white/5">
                        <span className="text-lg font-black text-sky-400 font-mono tracking-tighter">{s.quantity}</span>
                      </td>
                      <td className="py-5 px-6 border-b border-white/5">
                         <div className="flex flex-wrap gap-1">
                            {Array.from(new Set(s.details.map(d => `${d.paperType || 'S/ Papel'} • ${d.finishing || 'S/ Acab.'}`))).map((detail, dIdx) => (
                              <span key={dIdx} className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                {detail}
                              </span>
                            ))}
                         </div>
                      </td>
                      <td className="py-5 px-6 border-b border-white/5">
                         <div className="space-y-1.5 max-h-24 overflow-y-auto no-scrollbar py-1">
                            {s.details.map((d, dIdx) => (
                              <div key={dIdx} className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span className="font-black text-sky-500/60 leading-none">#{formatOrderId(d.orderId)}</span>
                                <span className="font-bold truncate max-w-[120px]">{d.customerName}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${new Date(d.deliveryDate) < new Date() ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-500'}`}>
                                  {d.deliveryDate}
                                </span>
                              </div>
                            ))}
                         </div>
                      </td>
                    </tr>
                  ))}
                  {productionSummary.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] opacity-30">Vazio em Produção</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
}> = ({ order, onDelete, onEdit, onPrint, onPay, onTrack, onFinalize, products, customers, isDragging, onStatusChange }) => {
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
      case OrderStatus.QUOTATION:
      case OrderStatus.WAITING_PAYMENT:
      case OrderStatus.WAITING_FILE:
        return { 
          badge: status === OrderStatus.WAITING_FILE ? 'AGUARD. ARQUIVO' : (status === OrderStatus.QUOTATION ? 'Orçamento' : 'Aguard. Pagamento'), 
          borderClass: 'border-amber-500', 
          shadowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]', 
          bgClass: 'bg-amber-500', 
          textClass: 'text-amber-500', 
          hoverBgClass: 'hover:bg-amber-600', 
          btnShadowClass: 'shadow-amber-500/20' 
        };
      case OrderStatus.ART:
      case OrderStatus.WAITING_APPROVAL:
        return { 
          badge: status === OrderStatus.ART ? 'CRIANDO ARTE' : 'Aguard. Aprovação', 
          borderClass: 'border-orange-500', 
          shadowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]', 
          bgClass: 'bg-orange-500', 
          textClass: 'text-orange-500', 
          hoverBgClass: 'hover:bg-orange-600', 
          btnShadowClass: 'shadow-orange-500/20' 
        };
      case OrderStatus.PRODUCTION:
      case OrderStatus.READY_FOR_PICKUP:
        return { 
          badge: status === OrderStatus.PRODUCTION ? 'PRODUÇÃO' : 'PRONTO RETIRADA', 
          borderClass: 'border-sky-500', 
          shadowClass: 'shadow-[0_0_20px_rgba(14,165,233,0.15)]', 
          bgClass: 'bg-sky-500', 
          textClass: 'text-sky-500', 
          hoverBgClass: 'hover:bg-sky-600', 
          btnShadowClass: 'shadow-sky-500/20' 
        };
      case OrderStatus.SHIPPING:
      case OrderStatus.DELIVERED:
        return { 
          badge: status === OrderStatus.SHIPPING ? 'LOGÍSTICA' : 'ENTREGUE', 
          borderClass: 'border-purple-500', 
          shadowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]', 
          bgClass: 'bg-purple-500', 
          textClass: 'text-purple-500', 
          hoverBgClass: 'hover:bg-purple-600', 
          btnShadowClass: 'shadow-purple-500/20' 
        };
      case OrderStatus.COMPLETED:
        return { 
          badge: 'CONCLUÍDO', 
          borderClass: 'border-emerald-500', 
          shadowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', 
          bgClass: 'bg-emerald-500', 
          textClass: 'text-emerald-500', 
          hoverBgClass: 'hover:bg-emerald-600', 
          btnShadowClass: 'shadow-emerald-500/20' 
        };
      default:
        return { 
          badge: status.toUpperCase(), 
          borderClass: 'border-slate-500', 
          shadowClass: 'shadow-[0_0_20px_rgba(100,116,139,0.15)]', 
          bgClass: 'bg-slate-500', 
          textClass: 'text-slate-500', 
          hoverBgClass: 'hover:bg-slate-600', 
          btnShadowClass: 'shadow-slate-500/20' 
        };
    }
  };

  const cfg = statusConfig(order.status);
  const customer = customers.find(c => c.id === order.customerId || c.name === order.customerName);
  const whatsappNumber = customer?.phone?.replace(/\D/g, '');
  
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
      className={`glass-card bg-[#030712]/40 border-2 ${cfg.borderClass} ${cfg.shadowClass} rounded-[32px] p-6 shadow-2xl transition-all cursor-grab active:cursor-grabbing group/card w-full box-border relative hover:bg-[#030712]/60 hover:brightness-110 ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-base text-white tracking-tight truncate">{order.customerName}</h4>
          <button
            onClick={handleStatusClick}
            className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${cfg.bgClass} text-white shrink-0`}
          >
            {cfg.badge}
          </button>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-slate-500">#{formatOrderId(order.id)}</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span className={`${cfg.textClass} uppercase text-[9px]`}>ENTREGA:</span>
            <span>{order.deliveryDate}</span>
          </div>
        </div>
        <div className="py-3 space-y-2 border-y border-slate-800/50">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL:</span>
            <span className="text-sm font-black text-white">R$ {order.total.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RESTANTE:</span>
            <span className="text-sm font-black text-rose-500">R$ {order.remainingAmount.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        <div className="pt-3 mt-1 border-t border-white/5 space-y-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onPay(order); }}
            className={`w-full whitespace-nowrap ${cfg.bgClass} ${cfg.hoverBgClass} text-white text-[10px] font-black uppercase py-2.5 px-4 rounded-[14px] transition-all active:scale-95 shadow-lg ${cfg.btnShadowClass}`}
          >
            PAGAR SALDO
          </button>
          <div className="flex justify-center gap-1.5 text-slate-500">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const trackingCode = order.trackingCode || order.id;
                const link = `${window.location.origin}?tracking=${trackingCode}`;
                navigator.clipboard.writeText(link);
                alert('Link de rastreamento copiado com sucesso!');
              }}
              className="p-1.5 text-slate-500 hover:text-sky-400 transition-colors bg-[#0f172a]/50 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
              title="Copiar Link de Rastreio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </button>
            {whatsappNumber && (
              <button 
                onClick={(e) => { e.stopPropagation(); contactCustomer(order, customer); }} 
                className="p-1.5 text-slate-500 hover:text-emerald-500 transition-colors bg-[#0f172a]/50 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5" 
                title="Enviar WhatsApp"
              >
                {ICONS.Whatsapp}
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onPrint(order); }} 
              className="p-1.5 text-slate-500 hover:text-white transition-colors bg-[#0f172a]/50 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
              title="Imprimir"
            >
              {ICONS.Print}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(order); }} 
              className="p-1.5 text-slate-500 hover:text-sky-500 transition-colors bg-[#0f172a]/50 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
              title="Editar"
            >
              {ICONS.Edit}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(order.id); }} 
              className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors bg-[#0f172a]/50 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
              title="Excluir"
            >
              {ICONS.Trash}
            </button>
          </div>
        </div>
      </div>
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
  stock: StockItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, orders, customers, settings, onUpdateOrderStatus, onEditOrder, onDeleteOrder, onReceivePayment, stock }) => {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [collapsedCols, setCollapsedCols] = useState<Record<string, boolean>>({});

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);

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
    { id: 'finished', label: 'CONCLUÍDO', textColor: 'text-emerald-500', icon: ICONS.Success, statuses: [OrderStatus.COMPLETED] },
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
      <ProductionModal 
        isOpen={isProductionModalOpen} 
        onClose={() => setIsProductionModalOpen(false)} 
        orders={orders} 
        products={products} 
        stock={stock} 
      />

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
                {col.id !== 'finished' ? (
                  filteredOrders.filter(o => col.statuses.includes(o.status)).map(order => (
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
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 opacity-40 border-2 border-dashed border-emerald-500/20 rounded-[40px]">
                    <div className="text-emerald-500 mb-2">{ICONS.Success}</div>
                    <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest text-center leading-relaxed">
                      Solte para<br/>Arquivar
                    </p>
                  </div>
                )}

                {/* Drop Zone Visual quando a coluna está vazia (exceto concluído que já tem o placeholder) */}
                {col.id !== 'finished' && filteredOrders.filter(o => col.statuses.includes(o.status)).length === 0 && (
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

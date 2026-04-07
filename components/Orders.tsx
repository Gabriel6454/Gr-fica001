
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, Product, Customer, StoreSettings } from '../types';
import { ICONS, formatOrderId } from '../constants';
import { DefaultLogo } from './Layout';

const TRACKING_STEPS = [
  { status: 'created', label: 'Pedido Recebido', sub: 'Aguardando início', icon: ICONS.Orders },
  { status: OrderStatus.ART, label: 'Criação de Arte', sub: 'Em desenvolvimento', icon: ICONS.Palette },
  { status: OrderStatus.PRODUCTION, label: 'Produção', sub: 'Impressão e acabamento', icon: ICONS.Settings },
  { status: OrderStatus.SHIPPING, label: 'Em Transporte', sub: 'Saiu para entrega', icon: ICONS.Shipping },
  { status: OrderStatus.DELIVERED, label: 'Entregue', sub: 'Recebido pelo cliente', icon: ICONS.Success },
  { status: OrderStatus.COMPLETED, label: 'Finalizado', sub: 'Pedido concluído', icon: ICONS.Success },
];

const getStatusIndex = (status: string) => {
  const statuses = [
    'created',
    OrderStatus.QUOTATION,
    OrderStatus.WAITING_PAYMENT,
    OrderStatus.WAITING_FILE,
    OrderStatus.ART,
    OrderStatus.WAITING_APPROVAL,
    OrderStatus.PRODUCTION,
    OrderStatus.READY_FOR_PICKUP,
    OrderStatus.SHIPPING,
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETED
  ];
  const idx = statuses.indexOf(status);
  return idx === -1 ? 0 : idx;
};

export const contactCustomer = (order: Order, customer?: Customer) => {
  const phone = customer?.phone?.replace(/\D/g, '') || '';
  const statusLabel = order.status.toUpperCase();
  const trackingLink = `${window.location.origin}?tracking=${order.id}`;
  
  const text = `Olá ${order.customerName}, aqui é da Gráfica. 👋\n\nReferente ao seu pedido *#${formatOrderId(order.id)}*:\nStatus Atual: *${statusLabel}*\nTotal: *R$ ${order.total.toFixed(2).replace('.', ',')}*\n\nAcompanhe o rastreamento em tempo real aqui: ${trackingLink}\n\nGostaria de tratar sobre o andamento do material ou tirar alguma dúvida?`;

  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: '⚡' },
  { id: 'credito', label: 'Crédito', icon: '💳' },
  { id: 'debito', label: 'Débito', icon: '🏦' },
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { id: 'boleto', label: 'Boleto', icon: '📄' },
  { id: 'transferencia', label: 'Transf.', icon: '📲' },
];

export const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirm: (orderId: string, amount: number, method: string) => void;
}> = ({ isOpen, onClose, order, onConfirm }) => {
  const [amount, setAmount] = useState(order.remainingAmount);
  const [method, setMethod] = useState('pix');

  useEffect(() => {
    if (isOpen) setAmount(order.remainingAmount);
  }, [isOpen, order]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card bg-[#0a111f]/60 w-full max-w-lg rounded-[32px] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase italic">Quitar <span className="text-emerald-500">Saldo</span></h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Pedido #{formatOrderId(order.id)} • {order.customerName}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5">{ICONS.X}</button>
        </div>

        <div className="space-y-8">
          <div className="bg-[#030712]/40 border border-white/5 rounded-[24px] p-8 text-center shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Montante em Aberto</span>
            <p className="text-4xl font-black text-emerald-500 glow-emerald">R$ {order.remainingAmount.toFixed(2).replace('.', ',')}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block px-1">Valor do Recebimento</label>
              <button 
                onClick={() => setAmount(order.remainingAmount / 2)}
                className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
              >
                [ Pagar Metade ]
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">R$</span>
              <input
                type="number"
                max={order.remainingAmount}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-14 py-5 text-3xl font-black text-emerald-500 outline-none focus:border-emerald-500/50 shadow-inner transition-all no-scrollbar"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block px-1">Forma de Pagamento</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === m.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button onClick={onClose} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase rounded-2xl text-[11px] tracking-widest border border-white/5">Cancelar</button>
          <button
            onClick={() => { onConfirm(order.id, amount, method); onClose(); }}
            className="flex-[2] py-4 bg-emerald-500 text-white font-black uppercase rounded-2xl text-[11px] tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Confirmar Baixa
          </button>
        </div>
      </div>
    </div>
  );
};

export const TrackingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  customers: Customer[];
}> = ({ isOpen, onClose, order, customers }) => {
  if (!isOpen) return null;
  const currentIndex = getStatusIndex(order.status);
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card bg-[#0a111f]/60 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto max-h-[95vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="bg-white/5 backdrop-blur-md p-8 sm:p-10 border-b border-white/5 relative">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-sky-500 rounded-[20px] flex items-center justify-center text-white shadow-2xl shadow-sky-500/20">
              <div className="scale-125">{ICONS.Shipping}</div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase italic">Fluxo de <span className="text-sky-500">Produção</span></h2>
              <p className="text-sky-500/80 font-bold text-sm tracking-widest uppercase">Protocolo #{formatOrderId(order.id)}</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 transition-all">{ICONS.X}</button>
        </div>
        <div className="p-8 sm:p-12 overflow-y-auto no-scrollbar flex-1">
          <div className="space-y-8 relative">
            {/* Timeline Line */}
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-white/5"></div>

            {TRACKING_STEPS.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-6 relative z-10 ${idx > currentIndex ? 'opacity-30' : 'opacity-100'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${idx <= currentIndex ? 'bg-sky-500 border-sky-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-[#030712]/60 border-white/5 text-slate-500'}`}>
                  {idx < currentIndex ? ICONS.Success : <div className="scale-110">{step.icon}</div>}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-black uppercase tracking-widest text-white">{step.label}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {order.trackingCode && (
            <div className="mt-12 p-8 bg-sky-500/5 border border-sky-500/20 rounded-[32px] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500">
                    <div className="scale-125">{ICONS.Shipping}</div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black uppercase tracking-widest text-sky-500">{order.carrier || 'Transportadora'}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Código: {order.trackingCode}</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(`/?tracking=${order.trackingCode}`, '_blank')}
                  className="w-full sm:w-auto px-8 py-3 bg-sky-500 text-white font-black uppercase rounded-xl text-[10px] tracking-[0.2em] shadow-xl shadow-sky-500/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="scale-75">{ICONS.Shipping}</span>
                  </div>
                  Página Pública (Cliente)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const OrderPrintModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
}> = ({ isOpen, onClose, order, products, customers, settings }) => {
  if (!isOpen) return null;
  const customer = customers.find(c => c.id === order.customerId);
  const paidAmount = order.total - order.remainingAmount;
  const subtotal = order.items.reduce((acc, item) => acc + item.price, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white text-slate-900 w-full max-w-[800px] sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[95vh] overflow-hidden print:shadow-none print:rounded-none">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              {ICONS.Print}
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Comprovante de Pedido</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visualização de Impressão</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">Fechar</button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-black transition-all flex items-center gap-2"
            >
              {ICONS.Print} Imprimir
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div id="print-area" className="flex-1 overflow-y-auto p-10 sm:p-16 bg-white print:p-0 print:overflow-visible font-sans">

          {/* Cabeçalho */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <DefaultLogo className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{settings.name || 'Atlas'}</h1>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5">{settings.subtitle || 'Soluções em Impressão'}</p>
                </div>
              </div>
              <div className="space-y-1">
                {settings.whatsapp && <p className="text-slate-900 text-xs font-bold flex items-center gap-2 uppercase">WhatsApp: {settings.whatsapp}</p>}
                {settings.email && <p className="text-slate-500 text-[10px] font-bold uppercase">{settings.email}</p>}
              </div>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Pedido nº</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">#{formatOrderId(order.id)}</span>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Data: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Cliente</h4>
                <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{order.customerName}</p>
                {customer && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-slate-800 text-xs font-bold">Documento: {customer.document}</p>
                    <p className="text-slate-800 text-xs font-bold">Telefone: {customer.phone}</p>
                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed max-w-[300px]">{customer.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Detalhes da Entrega</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Previsão</span>
                    <p className="text-sm font-black text-slate-900">{order.deliveryDate}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                    <p className="text-sm font-black text-slate-900 uppercase">{order.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div className="mb-12">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-6">Itens do Pedido</h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200">
                  <th className="py-4 text-[9px] font-black uppercase tracking-widest">Descrição do Produto</th>
                  <th className="py-4 text-[9px] font-black uppercase tracking-widest text-center w-24">Qtd</th>
                  <th className="py-4 text-[9px] font-black uppercase tracking-widest text-right w-32">Unitário</th>
                  <th className="py-4 text-[9px] font-black uppercase tracking-widest text-right w-32">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => {
                  const prod = products.find(p => p.id === item.productId);
                  return (
                    <tr key={idx}>
                      <td className="py-5">
                        <p className="font-bold text-slate-900 uppercase text-sm">{prod?.name || 'Produto'}</p>
                        {prod?.description && <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{prod.description}</p>}
                      </td>
                      <td className="py-5 text-center">
                        <span className="text-sm font-bold text-slate-900">{item.quantity}</span>
                      </td>
                      <td className="py-5 text-right text-sm font-medium text-slate-600">R$ {(item.price / item.quantity).toFixed(2).replace('.', ',')}</td>
                      <td className="py-5 text-right text-sm font-black text-slate-900">R$ {item.price.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resumo Financeiro */}
          <div className="flex justify-between items-start gap-12 mb-16">
            <div className="flex-1">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informações de Pagamento</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Método:</span>
                    <span className="text-[11px] font-black text-slate-900 uppercase">{order.paymentMethod || 'Pendente'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Status Financeiro:</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${order.remainingAmount <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {order.remainingAmount <= 0 ? 'Totalmente Pago' : 'Pagamento Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-72 space-y-3">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                <span>Subtotal</span>
                <span className="text-slate-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                <span>Frete</span>
                <span className="text-slate-900">{order.shippingCost > 0 ? `R$ ${order.shippingCost.toFixed(2).replace('.', ',')}` : 'Grátis'}</span>
              </div>
              <div className="h-px bg-slate-200 my-4"></div>
              <div className="flex justify-between items-center text-xs font-black text-slate-900 uppercase">
                <span>Total do Pedido</span>
                <span className="text-lg">R$ {order.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-emerald-600 uppercase">
                <span>Valor Pago</span>
                <span>- R$ {paidAmount.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="pt-4 mt-2 border-t-2 border-slate-900">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase">Saldo Devedor</span>
                  <span className={`text-2xl font-black ${order.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    R$ {order.remainingAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="grid grid-cols-2 gap-16 border-t border-slate-100 pt-10">
            <div className="space-y-3">
              <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Termos e Condições</h5>
              <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                1. Variação de cor de até 10% é inerente ao processo gráfico.<br />
                2. O prazo de entrega conta a partir da aprovação da arte.<br />
                3. Reclamações apenas no ato da entrega do material.
              </p>
            </div>
            <div className="flex flex-col items-center justify-end">
              <div className="w-full border-b border-slate-900 mb-3"></div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{order.customerName}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assinatura do Cliente</p>
            </div>
          </div>

          <div className="text-center mt-16 opacity-20 text-[8px] font-black uppercase tracking-[0.6em] text-slate-900">
            Atlas Management System
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 15mm;
            size: A4;
          }
          body {
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};


interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Partial<Order>) => void;
  onDelete?: (id: string) => void;
  products: Product[];
  customers: Customer[];
  order?: Order;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSave, onDelete, products, customers, order }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    deliveryDate: '',
    items: [] as { productId: string; quantity: number; price: number; cost?: number }[],
    shippingCost: 0,
    paidAmount: 0,
    status: OrderStatus.QUOTATION,
    paymentMethod: 'pix',
    trackingCode: '',
    carrier: 'Correios',
    trackingHistory: [] as { date: string; status: string; location: string }[]
  });

  useEffect(() => {
    if (order && isOpen) {
      let isoDate = '';
      if (order.deliveryDate.includes('/')) {
        const [d, m, y] = order.deliveryDate.split('/');
        isoDate = `${y}-${m}-${d}`;
      }
      setFormData({
        customerId: order.customerId || '',
        deliveryDate: isoDate,
        items: order.items || [],
        shippingCost: order.shippingCost || 0,
        paidAmount: order.total - order.remainingAmount,
        status: order.status,
        paymentMethod: order.paymentMethod || 'pix',
        trackingCode: order.trackingCode || '',
        carrier: order.carrier || 'Correios',
        trackingHistory: order.trackingHistory || []
      });
    } else if (isOpen) {
      setFormData({ 
        customerId: '', 
        deliveryDate: '', 
        items: [], 
        shippingCost: 0, 
        paidAmount: 0, 
        status: OrderStatus.QUOTATION, 
        paymentMethod: 'pix', 
        trackingCode: '', 
        carrier: 'Correios', 
        trackingHistory: [] 
      });
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  const totalValue = formData.items.reduce((acc, item) => acc + item.price, 0) + formData.shippingCost;
  const remainingValue = totalValue - formData.paidAmount;
  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  const addItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Padrão: usa o primeiro tier de preço
    const firstTier = product.priceTiers?.[0];
    const newItem = {
      productId: product.id,
      quantity: firstTier?.quantity || 1,
      price: firstTier?.salePrice || product.salePrice,
      cost: firstTier?.costPrice || product.costPrice,
      paperType: product.defaultPaper || 'Couché 150g',
      grammage: product.defaultGrammage || '150g',
      finishing: product.defaultFinishing || 'Nenhum',
      colors: '4x4'
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    
    // Se mudar a quantidade, tenta recalcular o preço baseando-se nos tiers
    if (field === 'quantity') {
      const product = products.find(p => p.id === newItems[idx].productId);
      if (product) {
        const tier = product.priceTiers.find(t => t.quantity === value);
        if (tier) {
          newItems[idx].price = tier.salePrice;
          newItems[idx].cost = tier.costPrice;
        }
      }
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = () => {
    if (!formData.customerId || formData.items.length === 0 || !formData.deliveryDate) {
      alert('Preencha os campos obrigatórios (Cliente, Itens e Prazo).');
      return;
    }
    const localNow = new Date();
    const localDate = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, '0')}-${String(localNow.getDate()).padStart(2, '0')}`;

    onSave({
      date: order?.date || localDate, 
      customerName: selectedCustomer?.name || 'Cliente Avulso',
      customerId: formData.customerId,
      deliveryDate: new Date(formData.deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR'),
      status: formData.status,
      total: totalValue,
      shippingCost: formData.shippingCost,
      remainingAmount: remainingValue,
      paid: remainingValue <= 0,
      paymentMethod: formData.paymentMethod,
      trackingCode: formData.trackingCode,
      carrier: formData.carrier,
      trackingHistory: formData.trackingHistory,
      statusHistory: order?.statusHistory || formData.statusHistory,
      items: formData.items
    });
    onClose();
  };

  const handleModalDelete = () => {
    if (order && onDelete) {
      const id = String(order.id).trim();
      if (window.confirm(`Excluir permanentemente o pedido #${id}?`)) {
        onDelete(id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card bg-[#0a1224]/90 border border-white/10 w-full max-w-[1200px] rounded-[48px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col h-full sm:h-auto max-h-[98vh] sm:max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-200 relative">
              <div className="absolute top-0 right-0 w-[40%] h-[30%] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="px-8 sm:px-12 py-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20">{order ? ICONS.Edit : ICONS.Plus}</div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{order ? 'Refinar' : 'Novo'} <span className="text-sky-500">Pedido</span></h2>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">{order ? 'ATUALIZAÇÃO DE PEDIDO' : 'SISTEMA DE GESTÃO GRAPHIC'}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-rose-500/20 transition-all border border-white/5">{ICONS.X}</button>
        </div>

        <div className="flex-1 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto no-scrollbar bg-gradient-to-b from-transparent to-white/[0.02] relative z-10">

          {/* Coluna Esquerda: Cliente e Prazos */}
          <div className="lg:col-span-3 space-y-8 lg:border-r border-white/5 lg:pr-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_12px_#0ea5e9]"></span>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">IDENTIFICAÇÃO</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Cliente</label>
                <div className="relative group">
                  <select value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })} className="w-full bg-[#030712]/60 border border-white/10 rounded-[24px] px-5 py-4 text-xs text-white outline-none focus:border-sky-500 appearance-none font-bold transition-all shadow-xl">
                    <option value="">Buscar na base...</option>
                    {customers.map(c => <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.name}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">{ICONS.ChevronDown}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Prazo de Entrega</label>
                <input type="date" value={formData.deliveryDate} onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })} className="w-full bg-[#030712]/60 border border-white/10 rounded-[24px] px-5 py-4 text-xs text-white outline-none focus:border-sky-500 font-bold transition-all shadow-xl" />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Status Operacional</label>
                <div className="relative group">
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as OrderStatus })} className="w-full bg-[#030712]/60 border border-white/10 rounded-[24px] px-5 py-4 text-xs text-white outline-none focus:border-sky-500 appearance-none font-bold transition-all shadow-xl">
                    {Object.values(OrderStatus).map(st => <option key={st} value={st} className="bg-[#0f172a]">{st}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">{ICONS.ChevronDown}</div>
                </div>
              </div>
            </div>

            {/* Timeline de Status */}
            {order?.statusHistory && order.statusHistory.length > 0 && (
              <div className="pt-8 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_12px_#f97316]"></span>
                  <h3 className="text-[11px] font-black text-orange-400 uppercase tracking-[0.2em]">LINHA DO TEMPO</h3>
                </div>
                <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar pl-2 border-l border-white/5">
                  {order.statusHistory.slice().reverse().map((h, i) => (
                    <div key={i} className="relative pl-6 pb-2 last:pb-0">
                      <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-slate-700 border border-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.4)]"></div>
                      <p className="text-[10px] font-black text-white uppercase tracking-wider">{h.status}</p>
                      <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                        {new Date(h.date).toLocaleDateString('pt-BR')} às {new Date(h.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Central: Itens do Pedido */}
          <div className="lg:col-span-6 space-y-8 lg:border-r border-white/5 lg:pr-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7]"></span>
                <h3 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em]">ITENS DO PEDIDO</h3>
              </div>
              <div className="relative">
                <select 
                  onChange={(e) => { if(e.target.value) addItem(e.target.value); e.target.value = ""; }}
                  className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase px-4 py-2 rounded-xl outline-none hover:bg-purple-500 hover:text-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">+ Adicionar Item</option>
                  {products.map(p => <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {formData.items.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px] opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nenhum item adicionado</p>
                </div>
              ) : (
                formData.items.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-purple-500/30 transition-all group relative">
                      <button onClick={() => removeItem(idx)} className="absolute top-4 right-4 text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">{ICONS.Trash}</button>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#030712] border border-white/5 flex items-center justify-center text-purple-500 shrink-0">
                          {ICONS.Products}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-white uppercase truncate">{product?.name || 'Produto'}</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{product?.category}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Papel</label>
                          <input type="text" value={item.paperType} onChange={e => updateItem(idx, 'paperType', e.target.value)} className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white font-bold outline-none focus:border-purple-500" placeholder="Ex: Couché" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Gramatura</label>
                          <input type="text" value={item.grammage} onChange={e => updateItem(idx, 'grammage', e.target.value)} className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white font-bold outline-none focus:border-purple-500" placeholder="Ex: 250g" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Acabamento</label>
                          <input type="text" value={item.finishing} onChange={e => updateItem(idx, 'finishing', e.target.value)} className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white font-bold outline-none focus:border-purple-500" placeholder="Ex: Verniz UV" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Cores</label>
                          <input type="text" value={item.colors} onChange={e => updateItem(idx, 'colors', e.target.value)} className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white font-bold outline-none focus:border-purple-500" placeholder="Ex: 4x0" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 bg-purple-500/5 p-3 rounded-2xl border border-purple-500/10">
                         <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                             <span>Pantone / Especial</span>
                           </label>
                           <input type="text" value={item.pantone || ''} onChange={e => updateItem(idx, 'pantone', e.target.value)} className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-1.5 text-[10px] text-white outline-none focus:border-purple-500" placeholder="Ex: PMS 200C" />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-1">Equipamento (ID)</label>
                           <input type="text" value={item.machineId || ''} onChange={e => updateItem(idx, 'machineId', e.target.value)} className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-1.5 text-[10px] text-white outline-none focus:border-purple-500" placeholder="Ex: OFFSET-01" />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-1">Tempo (min)</label>
                           <input type="number" value={item.estimatedMachineTime || 0} onChange={e => updateItem(idx, 'estimatedMachineTime', Number(e.target.value))} className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-1.5 text-[10px] text-white outline-none focus:border-purple-500" />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-1">Energia + Desperdício (kg)</label>
                           <div className="grid grid-cols-2 gap-2">
                             <div className="relative">
                               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-600">R$</span>
                               <input type="number" step="0.01" value={item.estimatedEnergyCost || 0} onChange={e => updateItem(idx, 'estimatedEnergyCost', Number(e.target.value))} className="w-full bg-[#030712] border border-white/5 rounded-xl pl-6 pr-2 py-1.5 text-[9px] text-emerald-500 font-bold outline-none focus:border-purple-500" />
                             </div>
                             <div className="relative">
                               <input type="number" step="0.01" value={item.predictedWaste || 0} onChange={e => updateItem(idx, 'predictedWaste', Number(e.target.value))} className="w-full bg-[#030712] border border-white/5 rounded-xl px-2 py-1.5 text-[9px] text-rose-400 font-bold outline-none focus:border-purple-500" placeholder="Waste" />
                             </div>
                           </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Qtd</label>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} 
                            className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-2 text-xs text-white font-black outline-none focus:border-purple-500" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Valor Unit.</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={item.price} 
                            onChange={e => updateItem(idx, 'price', Number(e.target.value))} 
                            className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-2 text-xs text-white font-black outline-none focus:border-purple-500" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Subtotal</label>
                          <div className="w-full bg-[#030712]/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-emerald-400 font-black flex items-center">
                            R$ {(item.price).toFixed(2).replace('.', ',')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Financeiro e Frete */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]"></span>
              <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">CUSTOS & LOGÍSTICA</h3>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Frete / Transporte</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-black">R$</span>
                  <input type="number" step="0.01" value={formData.shippingCost} onChange={e => setFormData({ ...formData, shippingCost: Number(e.target.value) })} className="w-full bg-[#030712]/60 border border-white/10 rounded-[24px] pl-10 pr-4 py-4 text-sm text-white font-black outline-none focus:border-emerald-500 transition-all shadow-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Valor Já Pago</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-black">R$</span>
                  <input type="number" step="0.01" value={formData.paidAmount} onChange={e => setFormData({ ...formData, paidAmount: Number(e.target.value) })} className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-[24px] pl-10 pr-4 py-4 text-sm text-emerald-400 font-black outline-none focus:border-emerald-500 shadow-xl" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer com Totais */}
        <div className="px-10 py-10 bg-white/5 border-t border-white/10 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-10 shadow-[0_-20px_80px_rgba(0,0,0,0.4)] relative z-20">
          <div className="flex flex-wrap gap-12 w-full sm:w-auto justify-between sm:justify-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">MONTANTE TOTAL</span>
              <p className="text-4xl font-black text-white tracking-tighter">
                <span className="text-lg opacity-40 mr-1.5 not-italic">R$</span>
                {totalValue.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="h-14 w-px bg-white/10 hidden sm:block"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] block">SALDO DEVEDOR</span>
              <p className={`text-4xl font-black tracking-tighter ${remainingValue <= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                <span className="text-lg opacity-40 mr-1.5 not-italic">R$</span>
                {Math.max(0, remainingValue).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {order && (
              <button 
                onClick={handleModalDelete}
                className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                title="Excluir Pedido"
              >
                {ICONS.Trash}
              </button>
            )}
            <button onClick={onClose} className="flex-1 sm:flex-none px-10 py-4 bg-white/5 border border-white/10 text-slate-400 font-black uppercase rounded-2xl transition-all text-[11px] tracking-widest min-w-[140px]">Fechar</button>
            <button onClick={handleSubmit} className="flex-[2] sm:flex-none px-16 py-4 bg-sky-500 text-white font-black uppercase rounded-2xl hover:bg-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all text-[11px] tracking-widest active:scale-95 min-w-[200px]">
              {order ? 'Salvar Alterações' : 'Finalizar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OrdersProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  onCreateOrder: (data: Partial<Order>) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onEditOrder: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => void;
  onReceivePayment: (orderId: string, amount: number, method: string) => void;
  onAttachPdf: (orderId: string, pdfUrl: string) => void;
}

const getNextStatus = (current: OrderStatus): OrderStatus => {
  const statuses = [
    OrderStatus.QUOTATION,
    OrderStatus.WAITING_PAYMENT,
    OrderStatus.WAITING_FILE,
    OrderStatus.ART,
    OrderStatus.WAITING_APPROVAL,
    OrderStatus.PRODUCTION,
    OrderStatus.READY_FOR_PICKUP,
    OrderStatus.SHIPPING,
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETED
  ];
  const currentIndex = statuses.indexOf(current);
  if (currentIndex === -1 || currentIndex === statuses.length - 1) return statuses[0];
  return statuses[currentIndex + 1];
};

const Orders: React.FC<OrdersProps> = ({
  orders, products, customers, settings,
  onCreateOrder, onUpdateStatus, onEditOrder, onDeleteOrder, onReceivePayment, onAttachPdf
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'entrada' | 'producao' | 'logistica' | 'finalizados'>('entrada');
  const [searchTerm, setSearchTerm] = useState('');

  const isEntrada = (status: OrderStatus) => [OrderStatus.QUOTATION, OrderStatus.WAITING_PAYMENT, OrderStatus.WAITING_FILE].includes(status);
  const isProduction = (status: OrderStatus) => [
    OrderStatus.ART, OrderStatus.WAITING_APPROVAL, OrderStatus.PRODUCTION, OrderStatus.READY_FOR_PICKUP
  ].includes(status);
  const isLogistic = (status: OrderStatus) => [OrderStatus.SHIPPING, OrderStatus.DELIVERED].includes(status);
  const isFinished = (status: OrderStatus) => status === OrderStatus.COMPLETED;

  const filteredOrders = orders.filter(o => {
    const idStr = String(o.id).toLowerCase();
    const customerName = (o.customerName || '').toLowerCase();
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) || idStr.includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'entrada' ? isEntrada(o.status) :
                        activeTab === 'producao' ? isProduction(o.status) :
                        activeTab === 'logistica' ? isLogistic(o.status) :
                        isFinished(o.status);
    return matchesSearch && matchesTab;
  });

  const handleNewOrder = () => { setSelectedOrder(undefined); setIsModalOpen(true); };
  const handleEditOrder = (order: Order) => { setSelectedOrder(order); setIsModalOpen(true); };
  const handlePrintOrder = (order: Order) => { setSelectedOrder(order); setIsPrintModalOpen(true); };
  const handleTrackOrder = (order: Order) => { setSelectedOrder(order); setIsTrackingModalOpen(true); };
  const handlePayOrder = (order: Order) => { setSelectedOrder(order); setIsPaymentModalOpen(true); };
  const handleSaveOrder = (data: Partial<Order>) => { if (selectedOrder) onEditOrder(selectedOrder.id, data); else onCreateOrder(data); };

  const handleDelete = (orderId: string) => {
    const id = String(orderId).trim();
    if (window.confirm(`Deseja realmente excluir permanentemente o pedido #${id}?`)) {
      onDeleteOrder(id);
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.QUOTATION: return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case OrderStatus.WAITING_PAYMENT: return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case OrderStatus.WAITING_FILE: return 'bg-sky-500/10 text-sky-500 border-sky-500/30';
      case OrderStatus.ART: return 'bg-[#1a1410] text-[#f97316] border-[#f97316]/30';
      case OrderStatus.PRODUCTION: return 'bg-[#10172a] text-[#0ea5e9] border-[#0ea5e9]/30';
      case OrderStatus.SHIPPING: return 'bg-[#1a102a] text-[#a855f7] border-[#a855f7]/30';
      case OrderStatus.DELIVERED: return 'bg-[#0f1a1a] text-[#14b8a6] border-[#14b8a6]/30';
      case OrderStatus.COMPLETED: return 'bg-[#0f2a1a] text-[#10b981] border-[#10b981]/30';
      default: return 'bg-slate-900 text-slate-500 border-slate-800';
    }
  };

  const formats = {
    date: (dateStr: string) => {
      if (!dateStr) return 'N/A';
      return dateStr.split('-').reverse().join('/');
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 max-w-full">
      <div className="space-y-6 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-white/5 mb-6 px-4 sm:px-6 md:px-8">
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase">
              Gestão de <span className="text-sky-500">Pedidos</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Fluxo de produção e recebimentos financeiros</p>
          </div>
          <button 
            onClick={handleNewOrder}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white font-black uppercase rounded-2xl text-[10px] sm:text-[11px] tracking-widest shadow-xl shadow-sky-500/20 hover:brightness-110 transition-all active:scale-95 w-full sm:w-auto"
          >
            {ICONS.Plus} <span>Criar Novo Pedido</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs-scroll flex items-center gap-2 px-4 sm:px-6 md:px-8 pb-1">
          {[
            { id: 'entrada', label: 'Entrada', labelShort: 'Entrada', count: orders.filter(o => isEntrada(o.status)).length, icon: <div className="scale-125">{ICONS.Orders}</div>, activeClass: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' },
            { id: 'producao', label: 'Arte/Produção', labelShort: 'Arte', count: orders.filter(o => isProduction(o.status)).length, icon: <div className="scale-125">{ICONS.Settings}</div>, activeClass: 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' },
            { id: 'logistica', label: 'Logística', labelShort: 'Logística', count: orders.filter(o => isLogistic(o.status)).length, icon: <div className="scale-125">{ICONS.Shipping}</div>, activeClass: 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' },
            { id: 'finalizados', label: 'Histórico', labelShort: 'Histórico', count: orders.filter(o => isFinished(o.status)).length, icon: <div className="scale-125">{ICONS.Success}</div>, activeClass: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap border transition-all ${
                activeTab === tab.id 
                ? tab.activeClass + ' border-transparent' 
                : 'bg-white/5 text-slate-500 hover:text-slate-300 border-white/5'
              }`}
            >
              {tab.icon}
              <span className="hidden xs:inline">{tab.label}</span>
              <span className="inline xs:hidden">{tab.labelShort}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative group px-4 sm:px-6 md:px-8">
          <div className="absolute left-10 sm:left-14 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
            {ICONS.Search}
          </div>
          <input 
            placeholder="Buscar por cliente ou ID..." 
            className="w-full bg-[#0a111f]/40 border border-white/5 rounded-[24px] py-3.5 sm:py-4 pl-10 sm:pl-14 pr-5 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700 shadow-xl backdrop-blur-md"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Desktop View */}
        <div className="px-4 sm:px-8">
          <div className="hidden lg:block glass-card bg-[#0a111f]/40 border border-white/5 rounded-[40px] overflow-hidden shadow-3xl backdrop-blur-xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] border-b border-white/5 bg-white/5">
                    <th className="py-8 px-10">ID</th>
                    <th className="py-8 px-10">CLIENTE</th>
                    <th className="py-8 px-10 text-center">DATA PEDIDO</th>
                    <th className="py-8 px-10 text-center">TOTAL / PAGO</th>
                    <th className="py-8 px-10 text-center">STATUS ENTRADA</th>
                    <th className="py-8 px-10 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center opacity-20">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Lista Vazia</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="group hover:bg-white/[0.03] transition-all">
                        <td className="py-6 px-10">
                          <span className="text-[10px] font-black text-slate-600 uppercase">#{formatOrderId(order.id)}</span>
                        </td>
                        <td className="py-6 px-10">
                          <div className="flex flex-col gap-1">
                            <h4 className="font-bold text-slate-100 text-[13px] uppercase tracking-tight">{order.customerName}</h4>
                          </div>
                        </td>
                        <td className="py-6 px-10 text-center">
                          <span className="text-[14px] font-black text-slate-400">{formats.date(order.date)}</span>
                        </td>
                        <td className="py-6 px-10 text-center">
                          <div className="space-y-1">
                            <p className="text-[15px] font-black text-white italic">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                              PAGO R$ {(order.total - order.remainingAmount).toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </td>
                        <td className="py-6 px-10 flex justify-center">
                          <button 
                            onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
                            className={`w-fit px-8 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-lg text-center min-w-[140px] ${getStatusBadgeClass(order.status)}`}
                          >
                            {order.status}
                          </button>
                        </td>
                        <td className="py-6 px-10 text-right">
                          <div className="flex justify-end gap-2.5">
                            <button onClick={() => contactCustomer(order, customers.find(c => c.id === order.customerId))} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center" title="Enviar WhatsApp">{ICONS.Whatsapp}</button>
                            <button onClick={() => { const link = `${window.location.origin}?tracking=${order.id}`; navigator.clipboard.writeText(link); alert('Link copiado!'); }} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-sky-500 hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center" title="Copiar Link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>
                            <button onClick={() => handlePrintOrder(order)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center" title="Imprimir">{ICONS.Print}</button>
                            <button onClick={() => handleTrackOrder(order)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-sky-500 transition-all flex items-center justify-center" title="Logística">{ICONS.Shipping}</button>
                            <button onClick={() => handleEditOrder(order)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-sky-500 transition-all flex items-center justify-center" title="Editar">{ICONS.Edit}</button>
                            <button onClick={() => handleDelete(order.id)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center" title="Excluir">{ICONS.Trash}</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-6 pb-20 px-4 sm:px-8">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Lista Vazia</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[32px] p-6 space-y-6 shadow-2xl backdrop-blur-xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-600 block leading-none tracking-widest uppercase italic">ID #{formatOrderId(order.id)}</span>
                    <h4 className="font-black text-white text-lg uppercase leading-tight tracking-tight">{order.customerName}</h4>
                  </div>
                  <button 
                    onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
                    className={`px-6 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all shadow-lg ${getStatusBadgeClass(order.status)}`}
                  >
                    {order.status}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block italic">Transporte</span>
                    <p className="text-xs font-black text-sky-400">{order.carrier || 'N/A'}</p>
                  </div>
                </div>

                {order.remainingAmount > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Saldo Pendente</span>
                    <span className="text-sm font-black text-rose-500 italic">R$ {order.remainingAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  <button 
                    onClick={() => contactCustomer(order, customers.find(c => c.id === order.customerId))}
                    className="flex-1 min-w-[45%] h-12 bg-white/5 border border-white/5 rounded-2xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    {ICONS.Whatsapp} Zap
                  </button>
                  <button 
                    onClick={() => handlePayOrder(order)}
                    className="flex-1 min-w-[45%] h-12 bg-emerald-500 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                  >
                    $ Pagar
                  </button>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => handleEditOrder(order)} className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-sky-500 transition-all flex items-center justify-center gap-2">{ICONS.Edit} Editar</button>
                    <button onClick={() => { const link = `${window.location.origin}?tracking=${order.id}`; navigator.clipboard.writeText(link); alert('Link copiado!'); }} className="flex-1 py-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest text-sky-400 hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> Link</button>
                    <button onClick={() => handlePrintOrder(order)} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">{ICONS.Print}</button>
                  </div>
                  <button onClick={() => handleDelete(order.id)} className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-slate-600 hover:text-rose-500 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest">{ICONS.Trash} Excluir</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveOrder} onDelete={onDeleteOrder} products={products} customers={customers} order={selectedOrder} />
      {selectedOrder && (
        <>
          <OrderPrintModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} order={selectedOrder} products={products} customers={customers} settings={settings} />
          <TrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} order={selectedOrder} customers={customers} />
          <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} order={selectedOrder} onConfirm={onReceivePayment} />
        </>
      )}
    </div>
  );
};

export default Orders;

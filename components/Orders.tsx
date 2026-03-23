
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, Product, Customer, StoreSettings } from '../types';
import { ICONS } from '../constants';
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
  if (status === OrderStatus.COMPLETED) return 5;
  if (status === OrderStatus.DELIVERED) return 4;
  if (status === OrderStatus.SHIPPING) return 3;
  if (status === OrderStatus.PRODUCTION) return 2;
  if (status === OrderStatus.ART) return 1;
  return 0;
};

export const contactCustomer = (order: Order, customer?: Customer) => {
  const phone = customer?.phone?.replace(/\D/g, '') || '';
  const text = `Olá ${order.customerName}, tudo bem? Gostaria de falar sobre o pedido #${order.id}.`;

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
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Pedido #{order.id} • {order.customerName}</p>
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
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block px-1">Valor do Recebimento</label>
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
              <p className="text-sky-500/80 font-bold text-sm tracking-widest uppercase">Protocolo #{order.id}</p>
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
                  onClick={() => window.open(`https://www.linkcorreios.com.br/${order.trackingCode}`, '_blank')}
                  className="w-full sm:w-auto px-8 py-3 bg-sky-500 text-white font-black uppercase rounded-xl text-[10px] tracking-[0.2em] shadow-xl shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Rastrear em Tempo Real
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
                <span className="text-3xl font-black text-slate-900 tracking-tighter">#{order.id}</span>
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
    productId: '',
    tierIndex: 0,
    shippingCost: 0,
    paidAmount: 0,
    status: OrderStatus.ART,
    paymentMethod: 'pix',
    trackingCode: '',
    carrier: 'Correios',
    trackingHistory: [] as { date: string; status: string; location: string }[]
  });

  useEffect(() => {
    if (order && isOpen) {
      const productId = order.items[0]?.productId || '';
      const quantity = order.items[0]?.quantity || 0;
      const product = products.find(p => p.id === productId);
      const tierIndex = product?.priceTiers.findIndex(t => t.quantity === quantity) ?? 0;
      let isoDate = '';
      if (order.deliveryDate.includes('/')) {
        const [d, m, y] = order.deliveryDate.split('/');
        isoDate = `${y}-${m}-${d}`;
      }
      setFormData({
        customerId: order.customerId || '',
        deliveryDate: isoDate,
        productId: productId,
        tierIndex: tierIndex === -1 ? 0 : tierIndex,
        shippingCost: order.shippingCost || 0,
        paidAmount: order.total - order.remainingAmount,
        status: order.status,
        paymentMethod: order.paymentMethod || 'pix',
        trackingCode: order.trackingCode || '',
        carrier: order.carrier || 'Correios',
        trackingHistory: order.trackingHistory || []
      });
    } else if (isOpen) {
      setFormData({ customerId: '', deliveryDate: '', productId: '', tierIndex: 0, shippingCost: 0, paidAmount: 0, status: OrderStatus.ART, paymentMethod: 'pix', trackingCode: '', carrier: 'Correios', trackingHistory: [] });
    }
  }, [order, isOpen, products]);

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const activeTier = selectedProduct?.priceTiers?.[formData.tierIndex];
  const subtotalValue = activeTier?.salePrice || 0;
  const totalValue = subtotalValue + formData.shippingCost;
  const remainingValue = totalValue - formData.paidAmount;

  const handleSubmit = () => {
    if (!formData.customerId || !formData.productId || !formData.deliveryDate) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    onSave({
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
      items: [{
        productId: formData.productId,
        quantity: activeTier?.quantity || 0,
        price: subtotalValue,
        cost: (activeTier?.costPrice || selectedProduct?.costPrice || 0)
      }]
    });
    onClose();
  };

  const handleModalDelete = () => {
    if (order && onDelete) {
      const id = String(order.id).trim();
      console.log('Orders.tsx: Exclusão via Modal para ID:', id);
      if (window.confirm(`Excluir permanentemente o pedido #${id}?`)) {
        onDelete(id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card bg-[#070b14]/60 border border-white/5 w-full max-w-[1000px] rounded-[40px] shadow-3xl overflow-hidden flex flex-col h-full sm:h-auto max-h-[98vh] sm:max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-200">

        <div className="px-8 sm:px-12 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shadow-inner">{order ? ICONS.Edit : ICONS.Plus}</div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase italic">{order ? 'Refinar' : 'Gerar Novo'} <span className="text-sky-500">Pedido</span></h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Console de Operação Industrial</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5">{ICONS.X}</button>
        </div>

        <div className="flex-1 p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-10 overflow-y-auto no-scrollbar bg-gradient-to-b from-transparent to-white/[0.02]">

          <div className="space-y-8 md:border-r border-white/5 md:pr-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_12px_#0ea5e9]"></span>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">IDENTIFICAÇÃO</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Selecione o Cliente</label>
                <select value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })} className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-sky-500/50 appearance-none font-bold shadow-inner transition-all">
                  <option value="">Buscar na base...</option>
                  {customers.map(c => <option key={c.id} value={c.id} className="bg-[#0f172a] text-white">{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Prazo de Entrega</label>
                  <input type="date" value={formData.deliveryDate} onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })} className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-sky-500/50 font-bold shadow-inner transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Status Operacional</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as OrderStatus })} className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-sky-500/50 appearance-none font-bold shadow-inner transition-all">
                    {Object.values(OrderStatus).map(st => <option key={st} value={st} className="bg-[#0f172a] text-white">{st}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 md:border-r border-white/5 md:pr-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_#a855f7]"></span>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">ESPECIFICAÇÕES</h3>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Item do Portfólio</label>
                <select value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value, tierIndex: 0 })} className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-sky-500/50 appearance-none font-bold shadow-inner transition-all">
                  <option value="">Selecione o serviço...</option>
                  {products.map(p => <option key={p.id} value={p.id} className="bg-[#0f172a] text-white">{p.name}</option>)}
                </select>
              </div>

              {selectedProduct && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Lote de Produção</label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProduct.priceTiers?.map((tier, idx) => (
                      <button key={idx} onClick={() => setFormData({ ...formData, tierIndex: idx })} className={`py-4 rounded-2xl border text-xs font-black transition-all duration-500 relative overflow-hidden group/btn ${formData.tierIndex === idx ? 'bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-500/20 scale-[1.02]' : 'bg-[#030712]/40 border-white/5 text-slate-500 hover:text-white hover:bg-white/5'}`}>
                        {tier.quantity} un
                        {formData.tierIndex === idx && <div className="absolute inset-0 bg-white/10"></div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]"></span>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">CAPITAL & FLUXO</h3>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] px-1">Frete (R$)</label>
                  <input type="number" step="0.01" value={formData.shippingCost} onChange={e => setFormData({ ...formData, shippingCost: Number(e.target.value) })} className="w-full bg-[#030712]/40 border border-sky-500/20 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-sky-500/50 font-black shadow-inner transition-all" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] px-1">Entrada Inicial (R$)</label>
                  <input type="number" value={formData.paidAmount} onChange={e => setFormData({ ...formData, paidAmount: Number(e.target.value) })} className="w-full bg-[#030712]/40 border border-emerald-500/20 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/50 font-black shadow-inner transition-all" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Canal de Recebimento</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.slice(0, 6).map(method => (
                    <button key={method.id} onClick={() => setFormData({ ...formData, paymentMethod: method.id })} className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all gap-1.5 ${formData.paymentMethod === method.id ? 'bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-500/20' : 'bg-[#030712]/40 border-white/5 text-slate-500 hover:text-white'}`}>
                      <span className="text-lg">{method.icon}</span>
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5 bg-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_12px_#f97316]"></span>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">LOGÍSTICA / ENVIO</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Transportadora</label>
                    <select value={formData.carrier} onChange={e => setFormData({ ...formData, carrier: e.target.value })} className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-3 text-xs text-white outline-none focus:border-sky-500/50 appearance-none font-bold shadow-inner transition-all">
                      <option value="Correios" className="bg-[#0f172a] text-white">Correios</option>
                      <option value="SEDEX" className="bg-[#0f172a] text-white">SEDEX</option>
                      <option value="PAC" className="bg-[#0f172a] text-white">PAC</option>
                      <option value="Jadlog" className="bg-[#0f172a] text-white">Jadlog</option>
                      <option value="Azul Cargo" className="bg-[#0f172a] text-white">Azul Cargo</option>
                      <option value="Outro" className="bg-[#0f172a] text-white">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Rastreio</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Código" value={formData.trackingCode} onChange={e => setFormData({ ...formData, trackingCode: e.target.value })} className="flex-1 bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-3 text-xs text-white outline-none focus:border-sky-500/50 font-bold shadow-inner transition-all" />
                        {formData.trackingCode && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    // Mock de sincronização real
                                    const newHistory = [
                                        { date: new Date().toLocaleString('pt-BR'), status: 'Objeto Postado', location: 'Centro de Distribuição' },
                                        ...(order?.trackingHistory || [])
                                    ];
                                    setFormData(prev => ({ ...prev, trackingHistory: newHistory }));
                                    alert('Sincronização com transportadora simulada com sucesso!');
                                }}
                                className="px-3 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-xl hover:bg-sky-500 hover:text-white transition-all"
                                title="Sincronizar Rastreio Real"
                            >
                                {ICONS.Refresh || '🔄'}
                            </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 bg-white/5 border-t border-white/5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-8 shadow-[0_-15px_40px_rgba(0,0,0,0.5)]">
          <div className="flex gap-12 w-full sm:w-auto justify-between sm:justify-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">TOTAL DO PEDIDO</span>
              <p className="text-3xl font-black text-white italic uppercase italic tracking-tighter">R$ {totalValue.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="h-12 w-px bg-white/5 hidden sm:block"></div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] block">EM ABERTO</span>
              <p className={`text-3xl font-black italic uppercase italic tracking-tighter ${remainingValue <= 0 ? 'text-emerald-500 glow-emerald' : 'text-rose-500'}`}>
                R$ {Math.max(0, remainingValue).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-10 py-4 bg-white/5 border border-white/10 text-slate-400 font-black uppercase rounded-2xl hover:bg-white/10 transition-all text-[11px] tracking-widest">Cancelar</button>
            <button onClick={handleSubmit} className="flex-[2] sm:flex-none px-16 py-4 bg-sky-500 text-white font-black uppercase rounded-2xl hover:bg-sky-400 shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all text-[11px] tracking-widest active:scale-95">
              {order ? 'Salvar Alterações' : 'Gerar Pedido'}
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

const Orders: React.FC<OrdersProps> = ({
  orders, products, customers, settings,
  onCreateOrder, onUpdateStatus, onEditOrder, onDeleteOrder, onReceivePayment, onAttachPdf
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'producao' | 'logistica' | 'finalizados'>('producao');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm);
    const isFinished = o.status === OrderStatus.COMPLETED;
    const isLogistic = o.status === OrderStatus.SHIPPING || o.status === OrderStatus.DELIVERED;
    const isProduction = o.status === OrderStatus.ART || o.status === OrderStatus.PRODUCTION;

    const matchesTab = activeTab === 'producao' 
        ? isProduction 
        : activeTab === 'logistica' 
            ? isLogistic 
            : isFinished;

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
    console.log('Orders.tsx: Botão excluir clicado para ID:', id);
    if (window.confirm(`Deseja realmente excluir permanentemente o pedido #${id}?`)) {
      onDeleteOrder(id);
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ART: return 'bg-[#1a1410] text-[#f97316] border-[#f97316]/30 shadow-[#f97316]/5';
      case OrderStatus.PRODUCTION: return 'bg-[#10172a] text-[#0ea5e9] border-[#0ea5e9]/30 shadow-[#0ea5e9]/5';
      case OrderStatus.SHIPPING: return 'bg-[#1a102a] text-[#a855f7] border-[#a855f7]/30 shadow-[#a855f7]/5';
      case OrderStatus.DELIVERED: return 'bg-[#0f1a1a] text-[#14b8a6] border-[#14b8a6]/30 shadow-[#14b8a6]/5';
      case OrderStatus.COMPLETED: return 'bg-[#0f2a1a] text-[#10b981] border-[#10b981]/30 shadow-[#10b981]/5';
      default: return 'bg-slate-900 text-slate-500 border-slate-800';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5 mb-10 px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase">Gestão de <span className="text-sky-500">Pedidos</span></h1>
          <p className="text-slate-500 text-sm font-medium">Fluxo de produção e recebimentos financeiros</p>
        </div>
        <button onClick={handleNewOrder} className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-sky-500 text-white font-black uppercase rounded-2xl text-[11px] tracking-widest shadow-xl shadow-sky-500/20 hover:brightness-110 transition-all active:scale-95">
          {ICONS.Plus} CRIAR NOVO PEDIDO
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-8">
        {[
          { id: 'producao', label: 'Evolução Arte/Produção', icon: ICONS.Settings, color: 'sky', count: orders.filter(o => o.status === OrderStatus.ART || o.status === OrderStatus.PRODUCTION).length },
          { id: 'logistica', label: 'Logística / Envio', icon: ICONS.Shipping, color: 'purple', count: orders.filter(o => o.status === OrderStatus.SHIPPING || o.status === OrderStatus.DELIVERED).length },
          { id: 'finalizados', label: 'Histórico Concluído', icon: ICONS.Success, color: 'emerald', count: orders.filter(o => o.status === OrderStatus.COMPLETED).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
              activeTab === tab.id 
                ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/20` 
                : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-white/5'
            }`}
          >
            {tab.icon} {tab.label}
            <span className={`px-2 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative group px-8">
        <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors scale-125">{ICONS.Search}</div>
        <input type="text" placeholder="Rastrear por cliente ou protocolo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0a111f]/40 border border-white/5 rounded-[28px] py-5 pl-14 pr-8 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700 shadow-2xl backdrop-blur-md" />
      </div>

      <div className="px-4 sm:px-8">
        {/* Desktop Table View */}
        <div className="hidden lg:block glass-card bg-[#0a111f]/40 border border-white/5 rounded-[40px] overflow-hidden shadow-3xl backdrop-blur-xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] border-b border-white/5 bg-white/5">
                  <th className="py-8 px-10">ID</th>
                  <th className="py-8 px-10">CLIENTE</th>
                  
                  {activeTab === 'producao' && (
                    <>
                      <th className="py-8 px-10">PRAZO ENTREGA</th>
                      <th className="py-8 px-10">TOTAL / PENDENTE</th>
                      <th className="py-8 px-10">STATUS PRODUÇÃO</th>
                    </>
                  )}

                  {activeTab === 'logistica' && (
                    <>
                      <th className="py-8 px-10">TRANSPORTADORA</th>
                      <th className="py-8 px-10">CÓDIGO RASTREIO</th>
                      <th className="py-8 px-10">STATUS ENVIO</th>
                    </>
                  )}

                  {activeTab === 'finalizados' && (
                    <>
                      <th className="py-8 px-10">DATA FINALIZAÇÃO</th>
                      <th className="py-8 px-10">TOTAL PAGO</th>
                      <th className="py-8 px-10">PAGAMENTO</th>
                    </>
                  )}

                  <th className="py-8 px-10 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-white/[0.03] transition-all">
                    <td className="py-6 px-10">
                      <span className="text-[10px] font-black text-slate-600">#{order.id.substring(0,6)}</span>
                    </td>
                    <td className="py-6 px-10">
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-slate-100 text-[13px] uppercase tracking-tight">{order.customerName}</h4>
                      </div>
                    </td>

                    {activeTab === 'producao' && (
                      <>
                        <td className="py-6 px-10">
                          <span className="text-[11px] text-slate-100 font-black">{order.deliveryDate}</span>
                        </td>
                        <td className="py-6 px-10">
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-black text-white italic uppercase">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            {order.remainingAmount > 0 && (
                              <span className="text-[9px] text-rose-500 font-bold uppercase tracking-widest">Falta R$ {order.remainingAmount.toFixed(2).replace('.', ',')}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-6 px-10">
                          <button onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))} className={`w-fit px-8 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-lg text-center min-w-[140px] ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </button>
                        </td>
                      </>
                    )}

                    {activeTab === 'logistica' && (
                      <>
                        <td className="py-6 px-10">
                          <span className="text-[11px] text-sky-500 font-black uppercase tracking-widest">{order.carrier || 'Correios'}</span>
                        </td>
                        <td className="py-6 px-10">
                           <div className="flex items-center gap-3">
                             <span className="text-[11px] text-slate-400 font-black font-mono">{order.trackingCode || 'Sem código'}</span>
                             {order.trackingCode && <div className="w-5 h-5 bg-sky-500/10 rounded-md flex items-center justify-center text-sky-500 animate-pulse">{ICONS.Shipping}</div>}
                           </div>
                        </td>
                        <td className="py-6 px-10">
                          <button onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))} className={`w-fit px-8 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-lg text-center min-w-[140px] ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </button>
                        </td>
                      </>
                    )}

                    {activeTab === 'finalizados' && (
                      <>
                        <td className="py-6 px-10">
                          <span className="text-[11px] text-slate-100 font-black">{order.deliveryDate}</span>
                        </td>
                        <td className="py-6 px-10">
                          <span className="text-[13px] font-black text-emerald-500 italic uppercase">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                        </td>
                        <td className="py-6 px-10">
                           <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                             {order.paymentMethod || 'PIX'} - PAGO
                           </span>
                        </td>
                      </>
                    )}

                    <td className="py-6 px-10 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button onClick={() => contactCustomer(order, customers.find(c => c.id === order.customerId))} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center">{ICONS.Whatsapp}</button>
                        <button onClick={() => handlePrintOrder(order)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center">{ICONS.Print}</button>
                        <button onClick={() => handleTrackOrder(order)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-sky-500 transition-all flex items-center justify-center">{ICONS.Shipping}</button>
                        <button onClick={() => handleEditOrder(order)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-sky-500 transition-all flex items-center justify-center">{ICONS.Edit}</button>
                        <button onClick={() => handleDelete(order.id)} className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center">{ICONS.Trash}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:hidden space-y-6 pb-20">
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[32px] p-6 space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-600 block leading-none tracking-widest uppercase italic">ID #{order.id.substring(0,6)}</span>
                  <h4 className="font-black text-white text-lg uppercase leading-tight tracking-tight">{order.customerName}</h4>
                </div>
                {activeTab !== 'finalizados' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
                    className={`px-6 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all shadow-lg ${getStatusBadgeClass(order.status)}`}
                  >
                    {order.status}
                  </button>
                )}
                {activeTab === 'finalizados' && (
                   <span className="px-6 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                     CONCLUÍDO
                   </span>
                )}
              </div>

              {activeTab === 'producao' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block italic">Previsão</span>
                    <p className="text-xs font-black text-white">{order.deliveryDate}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block italic">Total</span>
                    <p className="text-lg font-black text-sky-500 leading-none">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              )}

              {activeTab === 'logistica' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block italic">Transporte</span>
                    <p className="text-xs font-black text-sky-400">{order.carrier || 'Correios'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block italic">Rastreio</span>
                    <p className="text-xs font-black text-slate-200 font-mono tracking-tighter">{order.trackingCode || 'N/A'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'finalizados' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block italic">Pagamento</span>
                    <p className="text-xs font-black text-emerald-500">{order.paymentMethod || 'PIX'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block italic">Valor Pago</span>
                    <p className="text-lg font-black text-emerald-500 leading-none">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              )}

              {order.remainingAmount > 0 && activeTab !== 'finalizados' && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Saldo Pendente</span>
                  <span className="text-sm font-black text-rose-500 italic">R$ {order.remainingAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                <button onClick={() => contactCustomer(order, customers.find(c => c.id === order.customerId))} className="flex-1 min-w-[45%] h-12 bg-white/5 border border-white/5 rounded-2xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  {ICONS.Whatsapp} Zap
                </button>
                {order.remainingAmount > 0 && (
                  <button onClick={() => handlePayOrder(order)} className="flex-1 min-w-[45%] h-12 bg-emerald-500 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                    $ Pagar
                  </button>
                )}
                <button onClick={() => handlePrintOrder(order)} className="flex-1 min-w-[30%] h-12 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  {ICONS.Print}
                </button>
                <button onClick={() => handleTrackOrder(order)} className="flex-1 min-w-[30%] h-12 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-sky-500 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  {ICONS.Shipping}
                </button>
                <button onClick={() => handleEditOrder(order)} className="flex-1 min-w-[30%] h-12 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-sky-500 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  {ICONS.Edit}
                </button>
                <button onClick={() => handleDelete(order.id)} className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl text-slate-600 hover:text-rose-500 transition-all flex items-center justify-center">
                  {ICONS.Trash}
                </button>
              </div>
            </div>
          ))}
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


import React, { useMemo, useState, useEffect } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { ICONS } from '../constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface ReportsProps {
  products: Product[];
  orders: Order[];
}

const Reports: React.FC<ReportsProps> = ({ products, orders }) => {
  const COLORS_LIST = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
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
    }
  }, [period]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => (
      (!startDate || o.date >= startDate) &&
      (!endDate || o.date <= endDate)
    ));
  }, [orders, startDate, endDate]);

  const paymentMethodData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const rawMethod = o.paymentMethod || 'Outros';
      const label = rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1);
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const salesOverTimeData = useMemo(() => {
    const sales: Record<string, number> = {};
    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sortedOrders.forEach(o => {
      const dateObj = new Date(o.date + 'T12:00:00');
      const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      sales[dateStr] = (sales[dateStr] || 0) + o.total;
    });
    return Object.entries(sales).map(([date, total]) => ({ date, total }));
  }, [filteredOrders]);

  const topProductsData = useMemo(() => {
    const productStats = products.map(p => {
      const profit = filteredOrders.reduce((acc, order) => {
        const itemProfit = order.items
          .filter(item => item.productId === p.id)
          .reduce((iAcc, item) => {
            const tier = p.priceTiers.find(t => t.quantity === item.quantity);
            const totalCostPrice = tier ? tier.costPrice : p.costPrice;
            return iAcc + (item.price - totalCostPrice);
          }, 0);
        return acc + itemProfit;
      }, 0);

      return {
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        lucro: profit
      };
    });

    return productStats.sort((a, b) => b.lucro - a.lucro).slice(0, 5);
  }, [products, filteredOrders]);

  const stats = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const avgTicket = filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0;
    const pendingAmount = filteredOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
    const completionRate = filteredOrders.length > 0
      ? (filteredOrders.filter(o => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.COMPLETED).length / filteredOrders.length) * 100
      : 0;

    return { totalSales, avgTicket, pendingAmount, completionRate };
  }, [filteredOrders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">

      {/* HEADER BAR PADRONIZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5 mb-10 px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase italic">Relatórios <span className="text-sky-500">Inteligentes</span></h1>
          <p className="text-slate-500 text-sm font-medium">Análise de desempenho e métricas avançadas</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TICKET MÉDIO', value: `R$ ${stats.avgTicket.toFixed(2)}`, icon: ICONS.Sales, color: 'text-sky-500', glow: 'glow-sky' },
          { label: 'CAPITAL RETIDO', value: `R$ ${stats.pendingAmount.toFixed(2)}`, icon: ICONS.Warning, color: 'text-rose-500', glow: 'glow-rose' },
          { label: 'CONVERSÃO REAL', value: `${stats.completionRate.toFixed(1)}%`, icon: ICONS.Success, color: 'text-emerald-500', glow: 'glow-emerald' },
          { label: 'ORDENS TOTAIS', value: orders.length.toString(), icon: ICONS.Orders, color: 'text-purple-500', glow: 'glow-purple' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card bg-[#0a111f]/60 p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative shadow-2xl">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
            <div className="flex items-center gap-5 relative z-10">
              <div className={`p-4 rounded-2xl bg-[#030712]/60 border border-white/5 shadow-inner transition-transform group-hover:scale-110 ${kpi.color}`}>
                {kpi.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1 truncate">{kpi.label}</p>
                <p className={`text-xl font-black italic italic italic tracking-tight ${kpi.color} ${kpi.glow}`}>{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[48px] p-8 md:p-12 shadow-3xl xl:col-span-2 min-w-0 relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <div className="scale-[6] text-emerald-500">{ICONS.Dashboard}</div>
          </div>
          <h2 className="text-[11px] font-black text-white tracking-[0.3em] flex items-center gap-3 mb-12 uppercase relative z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            DIAGNÓSTICO DE ESCALABILIDADE (FATURAMENTO)
          </h2>
          <div className="h-[300px] md:h-[450px] w-full relative z-10" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={salesOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#1e293b" opacity={0.15} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} tickFormatter={(value) => `R$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', fontSize: '11px', fontWeight: 900, color: '#fff', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#10b981', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[48px] p-8 md:p-12 shadow-3xl min-w-0 relative overflow-hidden backdrop-blur-3xl">
          <h2 className="text-[11px] font-black text-white tracking-[0.3em] flex items-center gap-3 mb-12 uppercase relative z-10">
            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]"></span>
            MODALIDADES DE LIQUIDEZ
          </h2>
          <div className="h-[300px] md:h-[350px] w-full relative z-10" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_LIST[index % COLORS_LIST.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', fontSize: '10px', fontWeight: 900, color: '#fff', backdropFilter: 'blur(20px)' }}
                />
                <Legend verticalAlign="bottom" height={40} wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[48px] p-8 md:p-12 shadow-3xl min-w-0 relative overflow-hidden backdrop-blur-3xl">
          <h2 className="text-[11px] font-black text-white tracking-[0.3em] flex items-center gap-3 mb-12 uppercase relative z-10">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#8b5cf6]"></span>
            TOP PERFORMANCE INDIVIDUAL
          </h2>
          <div className="h-[300px] md:h-[350px] w-full relative z-10" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="8 8" horizontal={true} vertical={false} stroke="#1e293b" opacity={0.15} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} width={100} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', fontSize: '11px', fontWeight: 900, color: '#fff' }}
                />
                <Bar dataKey="lucro" fill="#8b5cf6" radius={[0, 12, 12, 0]} barSize={20} shadow="0 10px 15px -3px rgba(139, 92, 246, 0.3)">
                  {topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_LIST[index % COLORS_LIST.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;

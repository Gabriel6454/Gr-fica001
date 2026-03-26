import React, { useState, useCallback, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { PortfolioFII } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FundConfig {
  label: string;
  sharePrice: number;
  lastDividend: number;
  initialShares: number;
  splitPct: number; // 0-100
}

interface SimulatorInputs {
  monthlyInvestment: number;
  dividendGoal: number;
  period: number;
  periodUnit: 'Anos' | 'Meses';
  reinvest: boolean;
  dualMode: boolean;
  funds: [FundConfig, FundConfig];
}

interface MonthRow {
  month: number;
  shares: number;
  invested: number;
  reinvested: number;
  dividend: number;
}

interface SimResult {
  totalInvested: number;
  totalReinvested: number;
  finalMonthlyDividend: number;
  goalMonthHit: number | null; // month when dividend goal was first reached
  years: MonthRow[][];
}

interface FIIEntry {
  id: string;
  ticker: string;
  shares: number;
  avgPrice: number;
  lastDividend: number;
}

// ─── Simulator Core ───────────────────────────────────────────────────────────
function simulateFund(
  monthlyInvestment: number,
  sharePrice: number,
  lastDividend: number,
  initialShares: number,
  totalMonths: number,
  reinvest: boolean,
  dividendGoal: number = 0
): { result: SimResult } {
  let shares = initialShares;
  let totalInvested = 0;
  let totalReinvested = 0;
  const allMonths: MonthRow[] = [];
  let availableCash = 0;
  let goalMonthHit: number | null = null;

  for (let m = 1; m <= totalMonths; m++) {
    availableCash += monthlyInvestment;
    totalInvested += monthlyInvestment;

    const newSharesBought = Math.floor(availableCash / sharePrice);
    shares += newSharesBought;
    availableCash -= newSharesBought * sharePrice;

    const sharesSnapshot = shares;
    const dividend = shares * lastDividend;

    if (reinvest) {
      availableCash += dividend;
      totalReinvested += dividend;
    }

    if (goalMonthHit === null && dividendGoal > 0 && dividend >= dividendGoal) {
      goalMonthHit = m;
    }

    allMonths.push({ month: m, shares: sharesSnapshot, invested: monthlyInvestment, reinvested: availableCash, dividend });
  }

  const years: MonthRow[][] = [];
  for (let y = 0; y < Math.ceil(totalMonths / 12); y++) {
    years.push(allMonths.slice(y * 12, y * 12 + 12));
  }

  return {
    result: {
      totalInvested,
      totalReinvested,
      finalMonthlyDividend: allMonths[allMonths.length - 1]?.dividend ?? 0,
      goalMonthHit,
      years,
    },
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Input Field ─────────────────────────────────────────────────────────────
const InputField: React.FC<{
  label: string; value: string; onChange: (v: string) => void; suffix?: React.ReactNode; type?: string;
}> = ({ label, value, onChange, suffix, type = 'number' }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="flex">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-[#030712]/60 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-sky-500/50 font-bold shadow-inner"
        style={{ borderRadius: suffix ? '16px 0 0 16px' : '16px' }}
      />
      {suffix}
    </div>
  </div>
);

// ─── Year Table ───────────────────────────────────────────────────────────────
const YearTable: React.FC<{ year: number; rows: MonthRow[]; color?: string }> = ({ year, rows, color = 'text-sky-400' }) => {
  const [open, setOpen] = useState(year === 0);
  return (
    <div className="rounded-[28px] overflow-hidden border border-white/5 bg-[#0a111f]/40">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-8 py-5 text-white font-black uppercase tracking-widest hover:bg-white/5 transition-colors">
        <span className="text-sm">{year + 1}º Ano</span>
        <svg className={`w-4 h-4 transition-transform duration-300 text-slate-500 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-white/5">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest bg-[#030712]/40">
                <th className="py-4 px-6 text-left">Mês</th>
                <th className="py-4 px-6 text-right">Cotas</th>
                <th className="py-4 px-6 text-right">Valor Investido</th>
                <th className="py-4 px-6 text-right">Reinvestimento</th>
                <th className="py-4 px-6 text-right">Dividendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-6 text-slate-400 font-bold">{year * 12 + row.month}º</td>
                  <td className={`py-3 px-6 text-right font-black ${color}`}>{row.shares.toLocaleString('pt-BR')}</td>
                  <td className="py-3 px-6 text-right text-white font-bold">{fmt(row.invested)}</td>
                  <td className="py-3 px-6 text-right text-emerald-400 font-bold">{fmt(row.reinvested)}</td>
                  <td className="py-3 px-6 text-right text-sky-300 font-black">{fmt(row.dividend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard: React.FC<{
  label: string;
  result: SimResult;
  period: number;
  periodUnit: string;
  sharePrice: number;
  lastDividend: number;
  gradient: string;
}> = ({ label, result, period, periodUnit, sharePrice, lastDividend, gradient }) => (
  <div className={`${gradient} rounded-[40px] p-8 grid grid-cols-2 gap-5 content-start shadow-2xl`}>
    <div className="col-span-2 pb-2 border-b border-white/20">
      <span className="text-xs font-black text-white/70 uppercase tracking-widest">{label}</span>
    </div>
    {[
      { label: 'Prazo', value: `${period} ${periodUnit}`, big: true },
      { label: 'Preço da Cota', value: fmt(sharePrice), big: true },
      { label: 'Último Rendimento', value: fmt(lastDividend) },
      { label: 'Total Investido', value: fmt(result.totalInvested) },
      { label: 'Total Reinvestido', value: fmt(result.totalReinvested) },
      { label: 'Dividendo/mês no Final', value: fmt(result.finalMonthlyDividend) },
    ].map((item) => (
      <div key={item.label} className="flex flex-col gap-1">
        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{item.label}</span>
        <span className={`font-black text-white tracking-tight ${item.big ? 'text-xl' : 'text-base'}`}>{item.value}</span>
      </div>
    ))}
  </div>
);

// ─── Fund Form ────────────────────────────────────────────────────────────────
const FundForm: React.FC<{
  fund: FundConfig;
  index: number;
  dualMode: boolean;
  onChange: (field: keyof FundConfig, val: string) => void;
  accentColor: string;
}> = ({ fund, index, dualMode, onChange, accentColor }) => (
  <div className={`glass-card bg-[#0a111f]/60 border rounded-[32px] p-6 space-y-4 backdrop-blur-xl ${accentColor === 'sky' ? 'border-sky-500/20' : 'border-violet-500/20'}`}>
    <div className="flex items-center gap-3 mb-2">
      <span className={`w-2 h-2 rounded-full ${accentColor === 'sky' ? 'bg-sky-500 shadow-[0_0_10px_#0ea5e9]' : 'bg-violet-500 shadow-[0_0_10px_#8b5cf6]'}`} />
      <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] ${accentColor === 'sky' ? 'text-sky-400' : 'text-violet-400'}`}>
        {dualMode ? fund.label : 'Fundo'}
      </h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Preço da cota" value={String(fund.sharePrice)} onChange={(v) => onChange('sharePrice', v)} />
      <InputField label="Último rendimento" value={String(fund.lastDividend)} onChange={(v) => onChange('lastDividend', v)} />
    </div>
    <InputField label="Qtde de cotas inicial" value={String(fund.initialShares)} onChange={(v) => onChange('initialShares', v)} />
    {dualMode && (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">% do Investimento</label>
          <span className={`text-[10px] font-black ${accentColor === 'sky' ? 'text-sky-400' : 'text-violet-400'}`}>{fund.splitPct}%</span>
        </div>
        <input
          type="range" min="10" max="90" value={fund.splitPct}
          onChange={(e) => onChange('splitPct', e.target.value)}
          className="w-full accent-sky-500 cursor-pointer"
        />
      </div>
    )}
  </div>
);
const SECTORS = ['Papel', 'Tijolo', 'Híbrido', 'CRI/CRA', 'Fundo de Fundos', 'Logística', 'Shoppings', 'Lajes Corp.', 'Residencial', 'Agro'];
const SECTOR_COLORS: Record<string, string> = {
  'Papel': 'bg-sky-500/20 text-sky-400',
  'Tijolo': 'bg-amber-500/20 text-amber-400',
  'Híbrido': 'bg-violet-500/20 text-violet-400',
  'CRI/CRA': 'bg-rose-500/20 text-rose-400',
  'Fundo de Fundos': 'bg-emerald-500/20 text-emerald-400',
  'Logística': 'bg-orange-500/20 text-orange-400',
  'Shoppings': 'bg-pink-500/20 text-pink-400',
  'Lajes Corp.': 'bg-cyan-500/20 text-cyan-400',
  'Residencial': 'bg-teal-500/20 text-teal-400',
  'Agro': 'bg-lime-500/20 text-lime-400',
};

// ─── Portfolio View ───────────────────────────────────────────────────────────
const PortfolioView: React.FC = () => {
  const [fiis, setFiis] = useState<PortfolioFII[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'ticker' | 'patrimony' | 'dividend' | 'dy' | 'result'>('patrimony');
  const [activeView, setActiveView] = useState<'lista' | 'dividendos'>('lista');
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await dbService.getFiis();
        setFiis(data);
      } catch (err) {
        console.error("Erro ao carregar carteira:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Form state
  const [form, setForm] = useState({ ticker: '', sector: 'Papel', shares: '', avgPrice: '', currentPrice: '', lastDividend: '' });
  const resetForm = () => setForm({ ticker: '', sector: 'Papel', shares: '', avgPrice: '', currentPrice: '', lastDividend: '' });

  const totalPatrimony = fiis.reduce((s, f) => s + f.shares * f.currentPrice, 0);
  const totalCost = fiis.reduce((s, f) => s + f.shares * f.avgPrice, 0);
  const totalMonthlyDiv = fiis.reduce((s, f) => s + f.shares * f.lastDividend, 0);
  const avgDY = fiis.length > 0 ? fiis.reduce((s, f) => s + (f.lastDividend / f.currentPrice) * 100, 0) / fiis.length : 0;
  const totalResult = totalPatrimony - totalCost;

  const addOrUpdate = async () => {
    if (!form.ticker || !form.shares || !form.avgPrice) return;
    const entry: PortfolioFII = {
      id: editingId ?? crypto.randomUUID(),
      ticker: form.ticker.toUpperCase(),
      sector: form.sector,
      shares: Number(form.shares),
      avgPrice: Number(form.avgPrice),
      currentPrice: Number(form.currentPrice) || Number(form.avgPrice),
      lastDividend: Number(form.lastDividend),
    };

    try {
      if (editingId) {
        setFiis((p) => p.map((f) => (f.id === editingId ? entry : f)));
        setEditingId(null);
      } else {
        setFiis((p) => [...p, entry]);
      }
      await dbService.saveFii(entry);
      resetForm();
    } catch (err) {
      alert("Erro ao salvar no banco de dados. Verifique o console.");
    }
  };

  const handleReset = async () => {
    if (confirm("Deseja realmente ZERAR TODA a sua carteira de investimentos? Esta ação não pode ser desfeita.")) {
      try {
        await dbService.resetFiis();
        setFiis([]);
      } catch (err) {
        alert("Erro ao redefinir carteira.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir este fundo da carteira?")) {
      await dbService.deleteFii(id);
      setFiis((p) => p.filter((x) => x.id !== id));
    }
  };

  const startEdit = (f: PortfolioFII) => {
    setEditingId(f.id);
    setForm({ ticker: f.ticker, sector: f.sector, shares: String(f.shares), avgPrice: String(f.avgPrice), currentPrice: String(f.currentPrice), lastDividend: String(f.lastDividend) });
  };

  const sorted = [...fiis].sort((a, b) => {
    if (sortBy === 'ticker') return a.ticker.localeCompare(b.ticker);
    if (sortBy === 'patrimony') return (b.shares * b.currentPrice) - (a.shares * a.currentPrice);
    if (sortBy === 'dividend') return (b.shares * b.lastDividend) - (a.shares * a.lastDividend);
    if (sortBy === 'dy') return (b.lastDividend / b.currentPrice) - (a.lastDividend / a.currentPrice);
    if (sortBy === 'result') return ((b.currentPrice - b.avgPrice) / b.avgPrice) - ((a.currentPrice - a.avgPrice) / a.avgPrice);
    return 0;
  });

  // Sector distribution
  const sectorMap: Record<string, number> = {};
  fiis.forEach((f) => { sectorMap[f.sector] = (sectorMap[f.sector] ?? 0) + f.shares * f.currentPrice; });

  const SortBtn: React.FC<{ field: typeof sortBy; label: string }> = ({ field, label }) => (
    <button onClick={() => setSortBy(field)} className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all ${sortBy === field ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{label}</button>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
        <div className="w-8 h-8 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest">Carregando Carteira Cloud...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Patrimônio Total', value: fmt(totalPatrimony), sub: `custo ${fmt(totalCost)}`, color: 'text-sky-400' },
          { label: 'Resultado', value: fmt(totalResult), sub: `${totalCost > 0 ? ((totalResult / totalCost) * 100).toFixed(1) : 0}% valorização`, color: totalResult >= 0 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Dividendo Mensal', value: fmt(totalMonthlyDiv), sub: `${fmt(totalMonthlyDiv * 12)}/ano`, color: 'text-emerald-400' },
          { label: 'DY Médio', value: `${avgDY.toFixed(2)}%`, sub: `${fiis.length} FII${fiis.length !== 1 ? 's' : ''}`, color: 'text-amber-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[28px] p-6">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className={`text-2xl font-black tracking-tight ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-slate-600 font-medium mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Sector Distribution */}
      {fiis.length > 0 && totalPatrimony > 0 && (
        <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[32px] p-6 space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Distribuição por Setor</h3>
          <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5">
            {Object.entries(sectorMap).map(([sector, val]) => (
              <div key={sector} title={`${sector}: ${((val / totalPatrimony) * 100).toFixed(1)}%`}
                className="h-full rounded-sm first:rounded-l-full last:rounded-r-full transition-all duration-500"
                style={{ width: `${(val / totalPatrimony) * 100}%`, background: `hsl(${Object.keys(sectorMap).indexOf(sector) * 35 + 190}, 70%, 55%)` }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(sectorMap).map(([sector, val], i) => (
              <div key={sector} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `hsl(${i * 35 + 190}, 70%, 55%)` }} />
                <span className="text-[10px] font-bold text-slate-400">{sector}</span>
                <span className="text-[10px] font-black text-slate-500">{((val / totalPatrimony) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[32px] p-8">
        <h3 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em] mb-6">{editingId ? '✏️ Editar FII' : '+ Adicionar FII'}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Ticker', key: 'ticker', type: 'text', placeholder: 'MXRF11' },
            { label: 'Qtd. Cotas', key: 'shares', type: 'number', placeholder: '100' },
            { label: 'Preço Médio (R$)', key: 'avgPrice', type: 'number', placeholder: '79,97' },
            { label: 'Preço Atual (R$)', key: 'currentPrice', type: 'number', placeholder: '82,50' },
            { label: 'Último Dividendo (R$)', key: 'lastDividend', type: 'number', placeholder: '1,21' },
          ].map((f) => (
            <div key={f.key} className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                className="bg-[#030712]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500/50 font-bold shadow-inner" />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Setor</label>
            <select value={form.sector} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
              className="bg-[#030712]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500/50 font-bold">
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={addOrUpdate} className="px-8 py-3 bg-gradient-to-br from-sky-500 to-sky-600 text-white font-black uppercase tracking-widest rounded-xl text-[11px] shadow-xl shadow-sky-500/20 hover:brightness-110 transition-all active:scale-95">
            {editingId ? 'Salvar' : '+ Adicionar'}
          </button>
          {editingId && <button onClick={() => { resetForm(); setEditingId(null); }} className="px-6 py-3 bg-white/5 text-slate-400 font-black uppercase tracking-widest rounded-xl text-[11px] hover:bg-white/10 transition-all">Cancelar</button>}
        </div>
      </div>

      {/* View Toggle + Sort */}
      {fiis.length > 0 && (
        <>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 bg-[#0a111f] rounded-2xl p-1.5 border border-white/5">
                {[{ id: 'lista', label: 'Lista' }, { id: 'dividendos', label: 'Dividendos' }].map((t) => (
                  <button key={t.id} onClick={() => setActiveView(t.id as any)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === t.id ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-white'}`}>
                    {t.label}
                  </button>
                ))}
            </div>
            
            <button 
              onClick={handleReset}
              className="px-5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/20"
            >
              Redefinir Carteira
            </button>
          </div>
            {activeView === 'lista' && (
              <div className="flex items-center gap-2 text-[9px]">
                <span className="text-slate-600 font-black uppercase tracking-widest">Ordenar:</span>
                <SortBtn field="patrimony" label="Patrimônio" />
                <SortBtn field="dividend" label="Dividendo" />
                <SortBtn field="dy" label="DY" />
                <SortBtn field="result" label="Resultado" />
                <SortBtn field="ticker" label="Ticker" />
              </div>
            )}

          {/* Table View */}
          {activeView === 'lista' && (
            <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[32px] overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-slate-500 text-[9px] font-black uppercase tracking-widest border-b border-white/5 bg-[#030712]/40">
                    <th className="py-4 px-6 text-left">FII</th>
                    <th className="py-4 px-6 text-right">Cotas</th>
                    <th className="py-4 px-6 text-right">P. Médio</th>
                    <th className="py-4 px-6 text-right">P. Atual</th>
                    <th className="py-4 px-6 text-right">Resultado</th>
                    <th className="py-4 px-6 text-right">Patrimônio</th>
                    <th className="py-4 px-6 text-right">Div/mês</th>
                    <th className="py-4 px-6 text-right">DY</th>
                    <th className="py-4 px-6 text-right">Peso</th>
                    <th className="py-4 px-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sorted.map((f) => {
                    const patrimony = f.shares * f.currentPrice;
                    const monthDiv = f.shares * f.lastDividend;
                    const dy = f.currentPrice > 0 ? (f.lastDividend / f.currentPrice) * 100 : 0;
                    const result = ((f.currentPrice - f.avgPrice) / f.avgPrice) * 100;
                    const weight = totalPatrimony > 0 ? (patrimony / totalPatrimony) * 100 : 0;
                    return (
                      <tr key={f.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-sky-400 text-sm">{f.ticker}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full w-fit ${SECTOR_COLORS[f.sector] ?? 'bg-slate-500/20 text-slate-400'}`}>{f.sector}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-white font-bold">{f.shares.toLocaleString('pt-BR')}</td>
                        <td className="py-4 px-6 text-right text-slate-400 font-bold">{fmt(f.avgPrice)}</td>
                        <td className="py-4 px-6 text-right text-white font-bold">{fmt(f.currentPrice)}</td>
                        <td className={`py-4 px-6 text-right font-black ${result >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{result >= 0 ? '+' : ''}{result.toFixed(2)}%</td>
                        <td className="py-4 px-6 text-right text-white font-black">{fmt(patrimony)}</td>
                        <td className="py-4 px-6 text-right text-emerald-400 font-black">{fmt(monthDiv)}</td>
                        <td className="py-4 px-6 text-right"><span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-black">{dy.toFixed(2)}%</span></td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${weight}%` }} />
                            </div>
                            <span className="text-[9px] font-black text-slate-500">{weight.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(f)} className="text-sky-500/60 hover:text-sky-500 transition-colors text-xs">✏️</button>
                            <button onClick={() => handleDelete(f.id)} className="text-rose-500/50 hover:text-rose-500 transition-colors text-xs">✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Dividends View */}
          {activeView === 'dividendos' && (
            <div className="space-y-4">
              <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-6">Dividendo Mensal por FII</h3>
                <div className="space-y-4">
                  {[...fiis].sort((a, b) => b.shares * b.lastDividend - a.shares * a.lastDividend).map((f) => {
                    const div = f.shares * f.lastDividend;
                    const pct = totalMonthlyDiv > 0 ? (div / totalMonthlyDiv) * 100 : 0;
                    return (
                      <div key={f.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-sky-400 text-sm w-20">{f.ticker}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${SECTOR_COLORS[f.sector] ?? 'bg-slate-500/20 text-slate-400'}`}>{f.sector}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-black text-sm">{fmt(div)}</span>
                            <span className="text-slate-600 text-[9px] font-bold ml-2">{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-white/5 mt-6 pt-6 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Mensal</span>
                  <span className="text-2xl font-black text-emerald-400">{fmt(totalMonthlyDiv)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projeção Anual</span>
                  <span className="text-lg font-black text-white">{fmt(totalMonthlyDiv * 12)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Investments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulador' | 'carteira'>('simulador');
  const [inputs, setInputs] = useState<SimulatorInputs>({
    monthlyInvestment: 5000,
    dividendGoal: 0,
    period: 5,
    periodUnit: 'Anos',
    reinvest: true,
    dualMode: false,
    funds: [
      { label: 'Fundo A', sharePrice: 79.97, lastDividend: 1.21, initialShares: 0, splitPct: 50 },
      { label: 'Fundo B', sharePrice: 10.50, lastDividend: 0.12, initialShares: 0, splitPct: 50 },
    ],
  });
  const [results, setResults] = useState<[SimResult | null, SimResult | null]>([null, null]);

  const updateFund = (index: 0 | 1, field: keyof FundConfig, val: string) => {
    setInputs((prev) => {
      const funds = [...prev.funds] as [FundConfig, FundConfig];
      if (field === 'splitPct') {
        const pct = Math.min(90, Math.max(10, Number(val)));
        funds[0] = { ...funds[0], splitPct: index === 0 ? pct : 100 - pct };
        funds[1] = { ...funds[1], splitPct: index === 1 ? pct : 100 - pct };
      } else {
        funds[index] = { ...funds[index], [field]: field === 'label' ? val : Number(val) };
      }
      return { ...prev, funds };
    });
  };

  const handleCalc = useCallback(() => {
    const totalMonths = inputs.periodUnit === 'Anos' ? inputs.period * 12 : inputs.period;
    const inv0 = inputs.dualMode ? inputs.monthlyInvestment * (inputs.funds[0].splitPct / 100) : inputs.monthlyInvestment;
    const inv1 = inputs.dualMode ? inputs.monthlyInvestment * (inputs.funds[1].splitPct / 100) : 0;

    const r0 = simulateFund(inv0, inputs.funds[0].sharePrice, inputs.funds[0].lastDividend, inputs.funds[0].initialShares, totalMonths, inputs.reinvest, inputs.dividendGoal).result;
    const r1 = inputs.dualMode
      ? simulateFund(inv1, inputs.funds[1].sharePrice, inputs.funds[1].lastDividend, inputs.funds[1].initialShares, totalMonths, inputs.reinvest, inputs.dividendGoal).result
      : null;

    setResults([r0, r1]);
  }, [inputs]);

  const [r0, r1] = results;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5 px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Área de <span className="text-sky-500">Investimento</span></h1>
          <p className="text-slate-500 text-sm font-medium">Simule e gerencie seus Fundos Imobiliários</p>
        </div>
        <div className="flex gap-2 bg-[#0a111f] rounded-2xl p-1.5 border border-white/5">
          {[{ id: 'simulador', label: 'Simulador FII' }, { id: 'carteira', label: 'Carteira' }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 space-y-8">
        {activeTab === 'simulador' ? (
          <>
            {/* Global Controls */}
            <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[40px] p-8 space-y-6 backdrop-blur-xl">
              <h2 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" />
                SIMULADOR DE FUNDOS IMOBILIÁRIOS
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <InputField label="Investimento Mensal Total" value={String(inputs.monthlyInvestment)} onChange={(v) => setInputs((p) => ({ ...p, monthlyInvestment: Number(v) }))} />
                <InputField
                  label="Prazo"
                  value={String(inputs.period)}
                  onChange={(v) => setInputs((p) => ({ ...p, period: Number(v) }))}
                  suffix={
                    <select value={inputs.periodUnit} onChange={(e) => setInputs((p) => ({ ...p, periodUnit: e.target.value as any }))}
                      className="bg-sky-600 border border-sky-500 text-white text-[11px] font-black uppercase px-3 rounded-r-2xl outline-none cursor-pointer">
                      <option>Anos</option>
                      <option>Meses</option>
                    </select>
                  }
                />
                <InputField
                  label="🎯 Meta de Dividendo Mensal (R$)"
                  value={String(inputs.dividendGoal)}
                  onChange={(v) => setInputs((p) => ({ ...p, dividendGoal: Number(v) }))}
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={inputs.reinvest} onChange={(e) => setInputs((p) => ({ ...p, reinvest: e.target.checked }))} className="w-4 h-4 accent-sky-500" />
                  <span className="text-xs text-slate-400 font-medium">Reinvestir dividendos</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={inputs.dualMode} onChange={(e) => setInputs((p) => ({ ...p, dualMode: e.target.checked }))} className="w-4 h-4 accent-violet-500" />
                  <span className="text-xs text-violet-400 font-black uppercase tracking-widest">Dividir em 2 fundos</span>
                </label>
              </div>
            </div>

            {/* Fund Forms */}
            <div className={`grid gap-6 ${inputs.dualMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-lg'}`}>
              <FundForm fund={inputs.funds[0]} index={0} dualMode={inputs.dualMode} onChange={(f, v) => updateFund(0, f, v)} accentColor="sky" />
              {inputs.dualMode && (
                <FundForm fund={inputs.funds[1]} index={1} dualMode={inputs.dualMode} onChange={(f, v) => updateFund(1, f, v)} accentColor="violet" />
              )}
            </div>

            {/* Split Preview */}
            {inputs.dualMode && (
              <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[32px] p-6 flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-sky-400">{inputs.funds[0].label} — {inputs.funds[0].splitPct}% ({fmt(inputs.monthlyInvestment * inputs.funds[0].splitPct / 100)})</span>
                    <span className="text-violet-400">{inputs.funds[1].label} — {inputs.funds[1].splitPct}% ({fmt(inputs.monthlyInvestment * inputs.funds[1].splitPct / 100)})</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-300" style={{ width: `${inputs.funds[0].splitPct}%` }} />
                    <div className="bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-300 flex-1" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button onClick={handleCalc}
                className="w-full sm:w-auto px-16 py-4 bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-sky-500/20 hover:brightness-110 transition-all active:scale-95 text-[11px]">
                Calcular Simulação
              </button>
            </div>

            {/* Results */}
            {r0 && (
              <>
                <div className={`grid gap-6 ${inputs.dualMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  <SummaryCard label={inputs.dualMode ? inputs.funds[0].label : 'Resultado'} result={r0} period={inputs.period} periodUnit={inputs.periodUnit} sharePrice={inputs.funds[0].sharePrice} lastDividend={inputs.funds[0].lastDividend} gradient="bg-gradient-to-br from-sky-600 to-indigo-700" />
                  {inputs.dualMode && r1 && (
                    <SummaryCard label={inputs.funds[1].label} result={r1} period={inputs.period} periodUnit={inputs.periodUnit} sharePrice={inputs.funds[1].sharePrice} lastDividend={inputs.funds[1].lastDividend} gradient="bg-gradient-to-br from-violet-600 to-purple-800" />
                  )}
                </div>

                {/* Dividend Goal Card */}
                {inputs.dividendGoal > 0 && (() => {
                  const combinedFinal = r0.finalMonthlyDividend + (inputs.dualMode && r1 ? r1.finalMonthlyDividend : 0);
                  const pct = Math.min(100, (combinedFinal / inputs.dividendGoal) * 100);
                  const goalHit = r0.goalMonthHit ?? (inputs.dualMode && r1 ? r1.goalMonthHit : null);
                  const reached = pct >= 100;
                  return (
                    <div className={`rounded-[40px] p-8 border ${reached ? 'bg-gradient-to-br from-emerald-900/40 to-[#0a111f]/60 border-emerald-500/30' : 'bg-gradient-to-br from-amber-900/20 to-[#0a111f]/60 border-amber-500/20'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${reached ? 'text-emerald-400' : 'text-amber-400'}`}>
                            🎯 Meta de Dividendo Mensal
                          </span>
                          <p className="text-slate-400 text-xs font-medium mt-1">Objetivo: {fmt(inputs.dividendGoal)}/mês</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-3xl font-black tracking-tight ${reached ? 'text-emerald-400' : 'text-amber-400'}`}>{pct.toFixed(1)}%</span>
                          <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold mt-1">atingido</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Dividendo Final</span>
                          <span className={`text-base font-black ${reached ? 'text-emerald-400' : 'text-white'}`}>{fmt(combinedFinal)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Meta</span>
                          <span className="text-base font-black text-white">{fmt(inputs.dividendGoal)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Mês que Atingiu</span>
                          <span className={`text-base font-black ${reached ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {goalHit ? `${goalHit}º mês` : reached ? '—' : 'Não atingido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Combined Card */}
                {inputs.dualMode && r1 && (
                  <div className="glass-card bg-gradient-to-br from-emerald-900/30 to-[#0a111f]/60 border border-emerald-500/20 rounded-[40px] p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="col-span-2 sm:col-span-4">
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em]">Total Combinado</span>
                    </div>
                    {[
                      { label: 'Total Investido', value: fmt(r0.totalInvested + r1.totalInvested) },
                      { label: 'Total Reinvestido', value: fmt(r0.totalReinvested + r1.totalReinvested) },
                      { label: 'Dividendo Mensal Final', value: fmt(r0.finalMonthlyDividend + r1.finalMonthlyDividend) },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xl font-black text-emerald-400 tracking-tight">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tables */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    {inputs.dualMode && <h3 className="text-[11px] font-black text-sky-400 uppercase tracking-[0.4em] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" />{inputs.funds[0].label} — Projeção</h3>}
                    {!inputs.dualMode && <h3 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" />PROJEÇÃO DETALHADA</h3>}
                    {r0.years.map((rows, y) => <YearTable key={y} year={y} rows={rows} color="text-sky-400" />)}
                  </div>
                  {inputs.dualMode && r1 && (
                    <div className="space-y-4">
                      <h3 className="text-[11px] font-black text-violet-400 uppercase tracking-[0.4em] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500" />{inputs.funds[1].label} — Projeção</h3>
                      {r1.years.map((rows, y) => <YearTable key={y} year={y} rows={rows} color="text-violet-400" />)}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <PortfolioView />
        )}
      </div>
    </div>
  );
};

export default Investments;

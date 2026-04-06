import React, { useState, useCallback, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { fiiService } from '../services/fiiService';
import { PortfolioFII, StoreSettings } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FundConfig {
  label: string;
  sharePrice: number;
  lastDividend: number;
  initialShares: number;
  splitPct: number; // 0-100
  ticker?: string; // Ticker mapping
}

interface SimulatorInputs {
  monthlyInvestment: number;
  dividendGoal: number;
  period: number;
  periodUnit: 'Anos' | 'Meses';
  reinvest: boolean;
  multiFundMode: boolean;
  funds: FundConfig[];
}

interface SavedSimulation {
  id: string;
  config: SimulatorInputs;
  currentMonth: number;
  startDate: string;
  lastUpdate: string;
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
  
  if (sharePrice <= 0) return { result: { totalInvested, totalReinvested, finalMonthlyDividend: 0, goalMonthHit: null, years: [] } };

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
const parseNum = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

const fmt = (val: number) => {
  if (!isFinite(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

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
  onRemove?: () => void;
}> = ({ label, result, period, periodUnit, sharePrice, lastDividend, gradient, onRemove }) => (
  <div className={`${gradient} rounded-[40px] p-8 grid grid-cols-2 gap-5 content-start shadow-2xl relative group`}>
    {onRemove && (
      <button onClick={onRemove} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100">✕</button>
    )}
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
  multiFundMode: boolean;
  onChange: (field: keyof FundConfig, val: string) => void;
  onRemove?: () => void;
  accent: typeof ACCENT_COLORS[0];
}> = ({ fund, index, multiFundMode, onChange, onRemove, accent }) => (
  <div className={`glass-card bg-[#0a111f]/60 border rounded-[32px] p-6 space-y-4 backdrop-blur-xl ${accent.border} relative group`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full ${accent.bg} ${accent.shadow}`} />
        <input 
          value={fund.label} 
          onChange={(e) => onChange('label', e.target.value)}
          className={`bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-[0.3em] ${accent.text} w-32`}
        />
      </div>
      {onRemove && (
        <button onClick={onRemove} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">✕</button>
      )}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Preço da cota" value={String(fund.sharePrice)} onChange={(v) => onChange('sharePrice', v)} />
      <InputField label="Último rendimento" value={String(fund.lastDividend)} onChange={(v) => onChange('lastDividend', v)} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <InputField label="Ticker do FII" value={fund.ticker || ''} onChange={(v) => onChange('ticker', v)} type="text" />
      <InputField label="Qtde de cotas inicial" value={String(fund.initialShares)} onChange={(v) => onChange('initialShares', v)} />
    </div>
    {multiFundMode && (
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex justify-between">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">% do Investimento</label>
          <span className={`text-[10px] font-black ${accent.text}`}>{fund.splitPct}%</span>
        </div>
        <input
          type="range" min="0" max="100" value={fund.splitPct}
          onChange={(e) => onChange('splitPct', e.target.value)}
          className={`w-full ${accent.range} cursor-pointer`}
        />
      </div>
    )}
  </div>
);

const ACCENT_COLORS = [
  { slug: 'sky', bg: 'bg-sky-500', shadow: 'shadow-[0_0_10px_#0ea5e9]', border: 'border-sky-500/20', text: 'text-sky-400', range: 'accent-sky-500', gradient: 'bg-gradient-to-br from-sky-600 to-indigo-700' },
  { slug: 'violet', bg: 'bg-violet-500', shadow: 'shadow-[0_0_10px_#8b5cf6]', border: 'border-violet-500/20', text: 'text-violet-400', range: 'accent-violet-500', gradient: 'bg-gradient-to-br from-violet-600 to-purple-800' },
  { slug: 'emerald', bg: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_#10b981]', border: 'border-emerald-500/20', text: 'text-emerald-400', range: 'accent-emerald-500', gradient: 'bg-gradient-to-br from-emerald-600 to-teal-700' },
  { slug: 'amber', bg: 'bg-amber-500', shadow: 'shadow-[0_0_10px_#f59e0b]', border: 'border-amber-500/20', text: 'text-amber-400', range: 'accent-amber-500', gradient: 'bg-gradient-to-br from-amber-600 to-orange-700' },
  { slug: 'rose', bg: 'bg-rose-500', shadow: 'shadow-[0_0_10px_#f43f5e]', border: 'border-rose-500/20', text: 'text-rose-400', range: 'accent-rose-500', gradient: 'bg-gradient-to-br from-rose-600 to-pink-700' },
  { slug: 'orange', bg: 'bg-orange-500', shadow: 'shadow-[0_0_10px_#f97316]', border: 'border-orange-500/20', text: 'text-orange-400', range: 'accent-orange-500', gradient: 'bg-gradient-to-br from-orange-600 to-red-700' },
];
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

// ─── Progress Report ──────────────────────────────────────────────────────────
const ProgressReport: React.FC<{ 
  simulation: SavedSimulation; 
  wallet: PortfolioFII[]; 
  results: SimResult[];
  onUpdateMonth: (m: number) => void;
  onConfirmPurchase: (ticker: string, shares: number) => void;
}> = ({ simulation, wallet, results, onUpdateMonth, onConfirmPurchase }) => {
  const m = simulation.currentMonth || 1;
  const yearIdx = Math.floor((m - 1) / 12);
  const monthIdx = (m - 1) % 12;

  const fmt = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const monthTotalInvested = simulation.config.funds.reduce((s, f, i) => {
    const targetPrevRow = monthIdx === 0 && yearIdx === 0 ? null : (monthIdx === 0 ? results[i]?.years[yearIdx-1]?.[11] : results[i]?.years[yearIdx]?.[monthIdx-1]);
    const prevTarget = targetPrevRow ? targetPrevRow.shares : f.initialShares;
    const targetNow = results[i]?.years[yearIdx]?.[monthIdx]?.shares || 0;
    return s + (Math.max(0, targetNow - prevTarget) * f.sharePrice);
  }, 0);

  const allAchiereved = simulation.config.funds.every((fund, i) => {
    const targetRow = results[i]?.years[yearIdx]?.[monthIdx];
    const actualShares = wallet.find(f => f.ticker === fund.ticker)?.shares || 0;
    return actualShares >= (targetRow?.shares || 0);
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Month Control */}
      <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[32px] p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-sky-500/10 flex items-center justify-center text-2xl shadow-inner border border-sky-500/20">
            {allAchiereved ? '✅' : '📅'}
          </div>
          <div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
              Progresso: <span className={allAchiereved ? 'text-emerald-400' : 'text-sky-500'}>Mês {m}</span> de {results[0]?.years.length * 12}
            </h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">
              {allAchiereved ? 'Todas as compras deste mês foram concluídas!' : 'Siga sua meta mensal para atingir a independência'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-[24px] border border-white/5">
          <button 
            disabled={m <= 1}
            onClick={() => onUpdateMonth(m - 1)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
          >
            ←
          </button>
          <div className="px-8 py-3 bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-sky-500/20 text-sm">
            {m}º Mês
          </div>
          <button 
            disabled={m >= results[0]?.years.length * 12}
            onClick={() => onUpdateMonth(m + 1)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
          >
            →
          </button>
        </div>
      </div>

      {/* Buy List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[40px] p-8 space-y-6 relative overflow-hidden">
          {allAchiereved && (
             <div className="absolute top-0 right-0 p-4">
                <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                   <span className="text-xs">✔</span> Visto
                </span>
             </div>
          )}
          <h4 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" />
            Lista de Compras do Mês
          </h4>
          
          <div className="space-y-4">
            {simulation.config.funds.map((fund, i) => {
              const targetRow = results[i]?.years[yearIdx]?.[monthIdx];
              const targetShares = targetRow ? targetRow.shares : 0;
              const actualShares = wallet.find(f => f.ticker === fund.ticker)?.shares || 0;
              const diff = Math.max(0, targetShares - actualShares);
              const cost = diff * fund.sharePrice;

              return (
                <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${diff === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5 hover:border-sky-500/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${diff === 0 ? 'bg-emerald-500' : ACCENT_COLORS[i % ACCENT_COLORS.length].bg} text-white text-xs`}>
                      {diff === 0 ? '✔' : (fund.ticker?.substring(0, 4) || fund.label.substring(0, 1))}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{fund.ticker || fund.label}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Alvo para Mês {m}: {targetShares} cotas</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-right">
                      {diff > 0 ? (
                        <>
                          <p className="text-emerald-400 font-black text-base">+{diff} cotas</p>
                          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{fmt(cost)} aprox.</p>
                        </>
                      ) : (
                        <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Concluído</span>
                      )}
                    </div>
                    {diff > 0 && fund.ticker && (
                       <button 
                         onClick={() => onConfirmPurchase(fund.ticker!, diff)}
                         className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-lg shadow-sky-500/10"
                         title="Confirmar compra destas cotas"
                       >
                         ✔
                       </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Estimado</span>
              <p className="text-xl font-black text-white leading-tight">{fmt(monthTotalInvested)}</p>
            </div>
            
            {!allAchiereved && (
              <button 
                onClick={() => {
                   if (confirm("Confirmar a compra de TODAS as cotas pendentes para este mês?")) {
                      simulation.config.funds.forEach((fund, i) => {
                         const targetRow = results[i]?.years[yearIdx]?.[monthIdx];
                         const actualShares = wallet.find(f => f.ticker === fund.ticker)?.shares || 0;
                         const diff = Math.max(0, (targetRow?.shares || 0) - actualShares);
                         if (diff > 0 && fund.ticker) onConfirmPurchase(fund.ticker, diff);
                      });
                   }
                }}
                className="px-6 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl text-[10px] hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
              >
                ✔ Confirmar Todas
              </button>
            )}
            
            {allAchiereved && m < results[0]?.years.length * 12 && (
               <button 
                 onClick={() => onUpdateMonth(m + 1)}
                 className="px-6 py-3 bg-sky-500 text-white font-black uppercase tracking-widest rounded-xl text-[10px] hover:brightness-110 transition-all shadow-lg shadow-sky-500/20 animate-pulse"
               >
                 Próximo Mês →
               </button>
            )}
          </div>
        </div>

        <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[40px] p-8 space-y-6">
           <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Progresso Geral
          </h4>
          
          <div className="space-y-6">
            <div>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Renda Mensal Atual vs Alvo</span>
                 <span className="text-xs font-black text-emerald-400">
                    {((wallet.reduce((s,f) => s + (f.shares * f.lastDividend), 0) / results.reduce((s,r) => s + (r.years[yearIdx]?.[monthIdx]?.dividend || 0), 0)) * 100).toFixed(1)}%
                 </span>
               </div>
               <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (wallet.reduce((s,f) => s + (f.shares * f.lastDividend), 0) / results.reduce((s,r) => s + (r.years[yearIdx]?.[monthIdx]?.dividend || 0), 0)) * 100)}%` }} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Renda Atual', value: fmt(wallet.reduce((s,f) => s + (f.shares * f.lastDividend), 0)), color: 'text-emerald-400' },
                 { label: 'Renda Alvo Mês', value: fmt(results.reduce((s,r) => s + (r.years[yearIdx]?.[monthIdx]?.dividend || 0), 0)), color: 'text-white' },
                 { label: 'Patrimônio Atual', value: fmt(wallet.reduce((s,f) => s + (f.shares * f.currentPrice), 0)), color: 'text-sky-400' },
                 { label: 'P. Alvo Mês', value: fmt(results.reduce((s,r) => s + (r.years[yearIdx]?.[monthIdx]?.shares * simulation.config.funds[results.indexOf(r)].sharePrice || 0), 0)), color: 'text-white' },
               ].map(item => (
                 <div key={item.label} className="p-4 bg-[#030712]/40 rounded-2xl border border-white/5">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{item.label}</p>
                   <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Portfolio View ───────────────────────────────────────────────────────────
const PortfolioView: React.FC<{ 
  settings: StoreSettings; 
  onUpdateSettings: (s: StoreSettings) => void;
  fiis: PortfolioFII[];
  setFiis: React.Dispatch<React.SetStateAction<PortfolioFII[]>>;
}> = ({ settings, onUpdateSettings, fiis, setFiis }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'ticker' | 'patrimony' | 'dividend' | 'dy' | 'result'>('patrimony');
  const [activeView, setActiveView] = useState<'lista' | 'dividendos'>('lista');
  const [loading, setLoading] = useState(true);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [tempToken, setTempToken] = useState(settings.brapiToken || localStorage.getItem('brapi_token') || '');

  useEffect(() => {
    setTempToken(settings.brapiToken || localStorage.getItem('brapi_token') || '');
  }, [settings.brapiToken]);

  // Load from Supabase on mount
  useEffect(() => {
    const loadAndSync = async () => {
      try {
        setLoading(true);
        const savedFiis = await dbService.getFiis();
        setFiis(savedFiis);
        
        if (savedFiis.length > 0 && navigator.onLine && settings.brapiToken) {
          try {
            const updated = await fiiService.updateAll(savedFiis, settings.brapiToken);
            setFiis(updated);
            // Salvar atualizações no banco de fundo (sem travar se um falhar)
            await Promise.allSettled(updated.map(f => dbService.saveFii(f)));
          } catch (apiErr) {
            console.error("Erro na atualização via Brapi:", apiErr);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar e sincronizar:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAndSync();
  }, [settings.brapiToken]); // Keep this deps

  // Form state
  const [form, setForm] = useState({ ticker: '', sector: 'Papel', shares: '', avgPrice: '', currentPrice: '', lastDividend: '' });
  const resetForm = () => setForm({ ticker: '', sector: 'Papel', shares: '', avgPrice: '', currentPrice: '', lastDividend: '' });

  const totalPatrimony = fiis.reduce((s, f) => s + (parseNum(f.shares) * parseNum(f.currentPrice)), 0);
  const totalCost = fiis.reduce((s, f) => s + (parseNum(f.shares) * parseNum(f.avgPrice)), 0);
  const totalMonthlyDiv = fiis.reduce((s, f) => s + (parseNum(f.shares) * parseNum(f.lastDividend)), 0);
  
  const avgDY = fiis.length > 0 
    ? fiis.reduce((s, f) => {
        const price = parseNum(f.currentPrice);
        const div = parseNum(f.lastDividend);
        return s + (price > 0 ? (div / price) * 100 : 0);
      }, 0) / fiis.length 
    : 0;
    
  const totalResult = totalPatrimony - totalCost;

  const fmt = (v: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleRefreshAll = async () => {
    if (!navigator.onLine || !settings.brapiToken) {
       if (!settings.brapiToken) setShowApiConfig(true);
       return;
    }
    try {
      setLoading(true);
      const updated = await fiiService.updateAll(fiis, settings.brapiToken);
      setFiis(updated);
      for (const f of updated) {
        await dbService.saveFii(f);
      }
    } catch (e) {
      console.error("Erro ao atualizar dados reais:", e);
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdate = async () => {
    if (!form.ticker || !form.shares || !form.avgPrice) return;
    const entry: PortfolioFII = {
      id: editingId ?? (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString()),
      ticker: form.ticker.trim().toUpperCase(),
      sector: form.sector,
      shares: parseNum(form.shares),
      avgPrice: parseNum(form.avgPrice),
      currentPrice: parseNum(form.currentPrice) || parseNum(form.avgPrice),
      lastDividend: parseNum(form.lastDividend),
    };

    try {
      if (editingId) {
        setFiis(fiis.map((f) => (f.id === editingId ? entry : f)));
      } else {
        setFiis([...fiis, entry]);
      }
      setEditingId(null);
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
      setFiis(fiis.filter((x) => x.id !== id));
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
    if (sortBy === 'dy') {
        const dyA = a.currentPrice > 0 ? (a.lastDividend / a.currentPrice) : 0;
        const dyB = b.currentPrice > 0 ? (b.lastDividend / b.currentPrice) : 0;
        return dyB - dyA;
    }
    if (sortBy === 'result') {
        const resA = a.avgPrice > 0 ? (a.currentPrice - a.avgPrice) / a.avgPrice : 0;
        const resB = b.avgPrice > 0 ? (b.currentPrice - b.avgPrice) / b.avgPrice : 0;
        return resB - resA;
    }
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
              <input type={f.type} value={(form as any)[f.key]} 
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} 
                onBlur={async () => {
                  if (f.key === 'ticker' && form.ticker.length >= 5) {
                    const data = await fiiService.getRealTimeData(form.ticker, settings.brapiToken);
                    if (data) {
                      setForm(p => ({
                        ...p,
                        currentPrice: String(data.currentPrice ?? p.currentPrice),
                        lastDividend: String(data.lastDividend ?? p.lastDividend)
                      }));
                    }
                  }
                }}
                placeholder={f.placeholder}
                className="bg-[#030712]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500/50 font-bold shadow-inner transition-all" />
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
      {/* API Configuration Button */}
      {!settings.brapiToken && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-relaxed">
                As cotações automáticas estão desativadas. Obtenha seu token gratuito <a href="https://brapi.dev/register" target="_blank" className="underline">aqui</a>.
              </p>
           </div>
           <button onClick={() => setShowApiConfig(true)} className="px-4 py-2 bg-amber-500 text-black text-[9px] font-black uppercase rounded-lg hover:brightness-110 transition-all">Configurar</button>
        </div>
      )}

      {showApiConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
           <div className="bg-[#0a111f] border border-white/10 p-8 rounded-[32px] w-full max-w-md shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Configurar API Brapi</h3>
                 <button onClick={() => setShowApiConfig(false)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Para carregar cotações e dividendos em tempo real, crie uma conta gratuita no <a href="https://brapi.dev/" target="_blank" className="text-sky-400 underline">brapi.dev</a> e cole seu token abaixo.
              </p>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brapi Token</label>
                 <input type="text" value={tempToken} onChange={(e) => setTempToken(e.target.value)} 
                   className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-xs text-white" placeholder="Sua chave API..." />
              </div>
              <button 
                onClick={() => {
                  onUpdateSettings({ ...settings, brapiToken: tempToken });
                  localStorage.setItem('brapi_token', tempToken);
                  setShowApiConfig(false);
                }}
                className="w-full py-4 bg-sky-500 text-white font-black uppercase tracking-widest rounded-xl text-[10px]"
              >
                Salvar Configurações
              </button>
           </div>
        </div>
      )}

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
                <button 
                  onClick={handleRefreshAll}
                  className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 rounded-lg font-black uppercase tracking-widest transition-all border border-sky-500/20 mr-2"
                >
                  <span className="text-xs">🔄</span> Atualizar Cotações
                </button>
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
                    const shares = parseNum(f.shares);
                    const currPrice = parseNum(f.currentPrice);
                    const avgPrice = parseNum(f.avgPrice);
                    const lastDiv = parseNum(f.lastDividend);

                    const patrimony = shares * currPrice;
                    const monthDiv = shares * lastDiv;
                    const dy = currPrice > 0 ? (lastDiv / currPrice) * 100 : 0;
                    const result = avgPrice > 0 ? ((currPrice - avgPrice) / avgPrice) * 100 : 0;
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
                  {[...fiis].sort((a, b) => (parseNum(b.shares) * parseNum(b.lastDividend)) - (parseNum(a.shares) * parseNum(a.lastDividend))).map((f) => {
                    const div = parseNum(f.shares) * parseNum(f.lastDividend);
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
const Investments: React.FC<{ settings: StoreSettings; onUpdateSettings: (s: StoreSettings) => void }> = ({ settings, onUpdateSettings }) => {
  const [inputs, setInputs] = useState<SimulatorInputs>({
    monthlyInvestment: 5000,
    dividendGoal: 0,
    period: 5,
    periodUnit: 'Anos',
    reinvest: true,
    multiFundMode: true,
    funds: [
      { label: 'Fundo A', sharePrice: 79.97, lastDividend: 1.21, initialShares: 0, splitPct: 17 },
      { label: 'Fundo B', sharePrice: 100, lastDividend: 0.80, initialShares: 0, splitPct: 17 },
      { label: 'Fundo C', sharePrice: 100, lastDividend: 1.10, initialShares: 0, splitPct: 17 },
      { label: 'Fundo D', sharePrice: 10, lastDividend: 0.10, initialShares: 0, splitPct: 17 },
      { label: 'Fundo E', sharePrice: 100, lastDividend: 1, initialShares: 0, splitPct: 16 },
      { label: 'Fundo F', sharePrice: 100, lastDividend: 1, initialShares: 0, splitPct: 16 },
    ],
  });
  const [activeTab, setActiveTab] = useState<'simulador' | 'carteira' | 'acompanhamento'>('simulador');
  const [results, setResults] = useState<SimResult[]>([]);
  const [fiis, setFiis] = useState<PortfolioFII[]>([]);
  const [savedSim, setSavedSim] = useState<SavedSimulation | null>(null);

  useEffect(() => {
    const loadSim = async () => {
      const sim = await dbService.getSimulation();
      if (sim) {
        setSavedSim(sim);
        setInputs(sim.config);
      }
    };
    loadSim();
  }, []);

  useEffect(() => {
    if (savedSim && activeTab !== 'simulador') {
       // Auto calculate if we have a saved sim and are tracking
       const totalMonths = inputs.periodUnit === 'Anos' ? inputs.period * 12 : inputs.period;
       const newResults = inputs.funds.map(fund => {
          const inv = inputs.multiFundMode ? (inputs.monthlyInvestment * (fund.splitPct || 0) / 100) : inputs.monthlyInvestment;
          return simulateFund(inv, fund.sharePrice || 0.01, fund.lastDividend || 0, fund.initialShares || 0, totalMonths, inputs.reinvest, inputs.dividendGoal).result;
       });
       setResults(newResults);
    }
  }, [savedSim, activeTab]);

  const addFund = () => {
    if (inputs.funds.length >= 6) return;
    setInputs(p => ({
      ...p,
      multiFundMode: true,
      funds: [...p.funds, { label: `Fundo ${String.fromCharCode(65 + p.funds.length)}`, sharePrice: 100, lastDividend: 1, initialShares: 0, splitPct: 0 }]
    }));
  };

  const removeFund = (idx: number) => {
    if (inputs.funds.length <= 1) {
      setInputs(p => ({ ...p, multiFundMode: false }));
      return;
    }
    setInputs(p => {
      const newFunds = p.funds.filter((_, i) => i !== idx);
      return { ...p, funds: newFunds, multiFundMode: newFunds.length > 1 };
    });
  };

  const updateFund = (index: number, field: keyof FundConfig, val: string) => {
    setInputs((prev) => {
      const funds = [...prev.funds];
      const numVal = field === 'label' ? val : Number(val);
      funds[index] = { ...funds[index], [field]: numVal } as FundConfig;
      
      // Basic splitPct rebalancing if needed
      if (field === 'splitPct' && funds.length === 2) {
        const otherIdx = index === 0 ? 1 : 0;
        funds[otherIdx].splitPct = 100 - (numVal as number);
      }
      
      return { ...prev, funds };
    });
  };

  const redistributeEqually = () => {
    setInputs(p => {
      const count = p.funds.length;
      if (count === 0) return p;
      const share = Math.floor(100 / count);
      const remainder = 100 % count;
      return {
        ...p,
        funds: p.funds.map((f, i) => ({ 
          ...f, 
          splitPct: i === 0 ? share + remainder : share 
        }))
      };
    });
  };

  const handleCalc = useCallback(() => {
    const totalMonths = inputs.periodUnit === 'Anos' ? inputs.period * 12 : inputs.period;
    const totalSplit = inputs.funds.reduce((s, f) => s + f.splitPct, 0);
    
    if (inputs.multiFundMode && totalSplit !== 100 && inputs.funds.length > 1) {
      alert(`A soma das porcentagens deve ser 100% (atual: ${totalSplit}%).\nUse o botão "Distribuir Igual" se desejar.`);
      return;
    }

    const newResults = inputs.funds.map(fund => {
      const inv = inputs.multiFundMode ? (inputs.monthlyInvestment * (fund.splitPct || 0) / 100) : inputs.monthlyInvestment;
      const sPrice = fund.sharePrice || 0.01; // Avoid 0
      return simulateFund(inv, sPrice, fund.lastDividend || 0, fund.initialShares || 0, totalMonths, inputs.reinvest, inputs.dividendGoal).result;
    });

    setResults(newResults);
  }, [inputs]);

  const handleSaveSimulation = async () => {
    try {
      const simOb: Partial<SavedSimulation> = {
        id: savedSim?.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString()),
        config: inputs,
        currentMonth: savedSim?.currentMonth || 1,
        startDate: savedSim?.startDate || new Date().toISOString(),
      };
      await dbService.saveSimulation(simOb);
      setSavedSim(simOb as SavedSimulation);
      alert("Simulação salva com sucesso! Você pode acompanhá-la na aba 'Acompanhamento'.");
    } catch (err) {
      alert("Erro ao salvar simulação.");
    }
  };

  const handleUpdateMonth = async (m: number) => {
    if (!savedSim) return;
    const updated = { ...savedSim, currentMonth: m };
    setSavedSim(updated);
    await dbService.saveSimulation(updated);
  };

  const handleConfirmPurchase = async (ticker: string, addedShares: number) => {
    try {
      const existing = fiis.find(f => f.ticker === ticker);
      let updatedFii: PortfolioFII;

      if (existing) {
        updatedFii = { ...existing, shares: existing.shares + addedShares };
      } else {
        // Find in simulation to get some defaults
        const simFund = inputs.funds.find(f => f.ticker === ticker);
        updatedFii = {
          id: typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(),
          ticker,
          shares: addedShares,
          avgPrice: simFund?.sharePrice || 0,
          currentPrice: simFund?.sharePrice || 0,
          lastDividend: simFund?.lastDividend || 0,
          sector: 'Híbrido'
        };
      }

      const updatedFiis = existing 
        ? fiis.map(f => f.ticker === ticker ? updatedFii : f)
        : [...fiis, updatedFii];

      setFiis(updatedFiis);
      await dbService.saveFii(updatedFii);
      // Optional: alert or visual feedback
    } catch (err) {
      alert("Erro ao confirmar compra no banco de dados.");
    }
  };

  // Use results.map for rendering instead of r0, r1

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5 px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Área de <span className="text-sky-500">Investimento</span></h1>
          <p className="text-slate-500 text-sm font-medium">Simule e gerencie seus Fundos Imobiliários</p>
        </div>
        <div className="flex gap-2 bg-[#0a111f] rounded-2xl p-1.5 border border-white/5">
          {[
            { id: 'simulador', label: 'Simulador' }, 
            { id: 'acompanhamento', label: 'Acompanhamento' },
            { id: 'carteira', label: 'Minha Carteira' }
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-white'}`}>
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
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={inputs.reinvest} onChange={(e) => setInputs((p) => ({ ...p, reinvest: e.target.checked }))} className="w-4 h-4 accent-sky-500" />
                  <span className="text-xs text-slate-400 font-medium">Reinvestir dividendos</span>
                </label>
                <div className="h-6 w-px bg-white/10 hidden sm:block" />
                <button onClick={addFund} disabled={inputs.funds.length >= 6} className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-sky-500/20 disabled:opacity-30">
                  + Adicionar Fundo
                </button>
                {inputs.funds.length > 1 && (
                  <button onClick={redistributeEqually} className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-violet-500/20">
                    Distribuir Igual (%)
                  </button>
                )}
              </div>
            </div>

              </div>

            {/* Fund Forms */}
            <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${inputs.funds.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
              {inputs.funds.map((f, i) => (
                <FundForm 
                  key={i} 
                  fund={f} 
                  index={i} 
                  multiFundMode={inputs.multiFundMode} 
                  onChange={(field, v) => updateFund(i, field, v)} 
                  onRemove={inputs.funds.length > 1 ? () => removeFund(i) : undefined}
                  accent={ACCENT_COLORS[i % ACCENT_COLORS.length]} 
                />
              ))}
            </div>

            {/* Split Preview */}
            {inputs.multiFundMode && inputs.funds.length > 1 && (
              <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[32px] p-6 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Divisão do Investimento Total</span>
                  <span className={inputs.funds.reduce((s, f) => s + f.splitPct, 0) === 100 ? 'text-emerald-400' : 'text-rose-400'}>
                    Total: {inputs.funds.reduce((s, f) => s + f.splitPct, 0)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5">
                  {inputs.funds.map((f, i) => (
                    <div key={i} title={`${f.label}: ${f.splitPct}%`}
                      className={`h-full transition-all duration-500 ${ACCENT_COLORS[i % ACCENT_COLORS.length].bg}`}
                      style={{ width: `${f.splitPct}%` }} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button onClick={handleCalc}
                className="px-16 py-4 bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-sky-500/20 hover:brightness-110 transition-all active:scale-95 text-[11px]">
                Calcular Simulação
              </button>
              <button onClick={handleSaveSimulation}
                className="px-10 py-4 bg-white/5 text-slate-300 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all border border-white/5 text-[11px]">
                💾 Salvar e Acompanhar
              </button>
            </div>

            {/* Results Grid */}
            {results.length > 0 && (
              <>
                <div className={`grid gap-6 grid-cols-1 ${results.length > 1 ? 'md:grid-cols-2' : ''} ${results.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                  {results.map((res, i) => (
                    <SummaryCard 
                      key={i}
                      label={inputs.funds[i].label} 
                      result={res} 
                      period={inputs.period} 
                      periodUnit={inputs.periodUnit} 
                      sharePrice={inputs.funds[i].sharePrice} 
                      lastDividend={inputs.funds[i].lastDividend} 
                      gradient={ACCENT_COLORS[i % ACCENT_COLORS.length].gradient} 
                    />
                  ))}
                </div>

                {/* Combined Card (Always show if > 1 fund) */}
                {results.length > 1 && (
                  <div className="glass-card bg-gradient-to-br from-emerald-900/30 to-[#0a111f]/60 border border-emerald-500/20 rounded-[40px] p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-3">
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em]">Total Combinado de Todos os Fundos</span>
                    </div>
                    {[
                      { label: 'Total Investido', value: fmt(results.reduce((s, r) => s + r.totalInvested, 0)) },
                      { label: 'Total Reinvestido', value: fmt(results.reduce((s, r) => s + r.totalReinvested, 0)) },
                      { label: 'Dividendo Mensal Final', value: fmt(results.reduce((s, r) => s + r.finalMonthlyDividend, 0)) },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xl font-black text-emerald-400 tracking-tight">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Dividend Goal Card */}
                {inputs.dividendGoal > 0 && (() => {
                  const combinedFinal = results.reduce((s, r) => s + r.finalMonthlyDividend, 0);
                  const pct = Math.min(100, (combinedFinal / inputs.dividendGoal) * 100);
                  // Approximate goal hit month by taking the best performing one or combined logic? 
                  // For simplicity, we check if any reached it, or just show final status.
                  const goalHit = results.find(r => r.goalMonthHit !== null)?.goalMonthHit;
                  const reached = pct >= 100;
                  return (
                    <div className={`rounded-[40px] p-8 border ${reached ? 'bg-gradient-to-br from-emerald-900/40 to-[#0a111f]/60 border-emerald-500/30' : 'bg-gradient-to-br from-amber-900/20 to-[#0a111f]/60 border-amber-500/20'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${reached ? 'text-emerald-400' : 'text-amber-400'}`}>
                            🎯 Meta de Dividendo Mensal Combinado
                          </span>
                          <p className="text-slate-400 text-xs font-medium mt-1">Objetivo: {fmt(inputs.dividendGoal)}/mês</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-3xl font-black tracking-tight ${reached ? 'text-emerald-400' : 'text-amber-400'}`}>{pct.toFixed(1)}%</span>
                          <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold mt-1">atingido</p>
                        </div>
                      </div>

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
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status</span>
                          <span className={`text-base font-black ${reached ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {reached ? 'META ATINGIDA' : 'EM PROGRESSO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Projections */}
                <div className="space-y-10">
                  {results.map((res, i) => (
                    <div key={i} className="space-y-4">
                      <h3 className={`text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-2 ${ACCENT_COLORS[i % ACCENT_COLORS.length].text}`}>
                        <span className={`w-2 h-2 rounded-full ${ACCENT_COLORS[i % ACCENT_COLORS.length].bg}`} />
                        {inputs.funds[i].label} — Projeções Mensais
                      </h3>
                      {res.years.map((rows, y) => (
                        <YearTable key={y} year={y} rows={rows} color={ACCENT_COLORS[i % ACCENT_COLORS.length].text} />
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : activeTab === 'acompanhamento' ? (
          savedSim && results.length > 0 ? (
            <ProgressReport 
              simulation={savedSim} 
              wallet={fiis} 
              results={results} 
              onUpdateMonth={handleUpdateMonth}
              onConfirmPurchase={handleConfirmPurchase}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-6 glass-card bg-[#0a111f]/60 rounded-[40px] border border-white/5">
              <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center text-3xl">🎯</div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-white uppercase italic">Nenhuma meta ativa</h3>
                <p className="text-xs font-medium max-w-xs mx-auto">Vá para o simulador, defina seu plano e clique em "Salvar e Acompanhar" para ver seu progresso mensal aqui.</p>
              </div>
              <button onClick={() => setActiveTab('simulador')} className="px-8 py-3 bg-sky-500 text-white font-black uppercase tracking-widest rounded-xl text-[10px] hover:brightness-110 transition-all">Ir para o Simulador</button>
            </div>
          )
        ) : (
          <PortfolioView 
            settings={settings} 
            onUpdateSettings={onUpdateSettings} 
            fiis={fiis} 
            setFiis={setFiis} 
          />
        )}
      </div>
    </div>
  );
};

export default Investments;

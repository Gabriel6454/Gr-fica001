
import React, { useState, useEffect, useMemo } from 'react';
import { FinanceRecord, TransactionType, PayableAccount, AccountStatus } from '../types';
import { ICONS } from '../constants';

interface FinanceProps {
  records: FinanceRecord[];
  payables: PayableAccount[];
  onPayAccount: (id: string) => void;
  onCreatePayable: (data: Partial<PayableAccount>) => void;
}

const Finance: React.FC<FinanceProps> = ({ records, payables, onPayAccount, onCreatePayable }) => {
  const [goalName, setGoalName] = useState(() => localStorage.getItem('atlas_goal_title') || 'Minha Meta');
  const [goalTarget, setGoalTarget] = useState(() => Number(localStorage.getItem('atlas_goal_value')) || 10000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const totalIncome = records.filter(r => r.type === TransactionType.INCOME).reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === TransactionType.EXPENSE).reduce((sum, r) => sum + r.amount, 0);
  const netSalary = totalIncome - totalExpense;
  const progress = Math.min(100, (netSalary / (goalTarget || 1)) * 100);

  useEffect(() => {
    localStorage.setItem('atlas_goal_title', goalName);
    localStorage.setItem('atlas_goal_value', goalTarget.toString());
  }, [goalName, goalTarget]);

  const recentTransactions = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [records]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-white/5 mb-10 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase italic">Controle <span className="text-sky-500">Financeiro</span></h1>
          <p className="text-slate-500 text-sm font-medium">Gestão de contas e metas de crescimento</p>
        </div>
        <button
          onClick={() => setIsEditingGoal(!isEditingGoal)}
          className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all shadow-xl active:scale-95"
        >
          {isEditingGoal ? 'Consolidar Meta' : 'Ajustar Objetivos'}
        </button>
      </div>

      {/* CARD DE META */}
      <div className="relative group">
        <div className="absolute inset-0 bg-sky-500/5 blur-[120px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="glass-card bg-[#0a111f]/60 border border-white/5 rounded-[48px] p-8 sm:p-20 shadow-3xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none grayscale translate-x-1/4 -translate-y-1/4">
            <div className="scale-[8]">{ICONS.Dashboard}</div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12 lg:gap-20">
            <div className="space-y-10 flex-1 text-center lg:text-left">
              {isEditingGoal ? (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] ml-1">TÍTULO DA META</label>
                    <input
                      type="text"
                      value={goalName}
                      onChange={e => setGoalName(e.target.value)}
                      className="bg-[#030712]/40 border border-white/10 px-6 py-4 rounded-2xl text-2xl font-black text-white outline-none focus:border-sky-500/50 w-full shadow-inner"
                      placeholder="Identifique seu objetivo..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] ml-1">VALOR ALVO (R$)</label>
                    <input
                      type="number"
                      value={goalTarget}
                      onChange={e => setGoalTarget(Number(e.target.value))}
                      className="bg-[#030712]/40 border border-white/10 px-6 py-4 rounded-2xl text-xl font-black text-sky-400 outline-none focus:border-sky-500/50 w-full shadow-inner"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_12px_#0ea5e9] animate-pulse"></span>
                    <span className="text-sky-500 text-[10px] font-black uppercase tracking-[0.4em]">OBJETIVO ESTRATÉGICO</span>
                  </div>
                  <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-none italic italic italic break-words drop-shadow-2xl">{goalName}</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                    <span className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Target: <span className="text-white">R$ {goalTarget.toLocaleString('pt-BR')}</span></span>
                  </div>
                </div>
              )}

              <div className="space-y-5 pt-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">PROGRESSO OPERACIONAL</span>
                  <span className="text-2xl sm:text-4xl font-black text-white italic italic italic tracking-tighter">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-6 bg-[#030712]/60 rounded-full border border-white/5 p-1.5 overflow-hidden flex items-center shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-1000 ease-out relative group/bar"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-right space-y-4 pt-10 lg:pt-0 border-t lg:border-t-0 border-white/5 lg:border-l lg:pl-16">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">SALDO DISPONÍVEL</p>
              <h3 className="text-5xl sm:text-8xl font-black text-white tracking-tighter italic italic italic leading-none">
                <span className="text-sky-500 glow-sky">R$ {netSalary.toLocaleString('pt-BR')}</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-black uppercase tracking-widest pt-4">
                {netSalary >= goalTarget ? '✨ MISSÃO CUMPRIDA!' : `Faltam R$ ${(goalTarget - netSalary).toLocaleString('pt-BR')} para o alvo`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'ENTRADAS TOTAIS', value: totalIncome, color: 'text-emerald-500', iconColor: 'text-emerald-500', barColor: 'bg-emerald-500', icon: ICONS.Up, glow: 'glow-emerald' },
          { label: 'SAÍDAS OPERACIONAIS', value: totalExpense, color: 'text-rose-500', iconColor: 'text-rose-500', barColor: 'bg-rose-500', icon: ICONS.Down, glow: 'glow-rose' },
          { label: 'RESULTADO LÍQUIDO', value: netSalary, color: 'text-sky-500', iconColor: 'text-sky-500', barColor: 'bg-sky-500', icon: ICONS.Sales, glow: 'glow-sky' },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card bg-[#0a111f]/40 border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all group overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <div className="scale-[2.5]">{kpi.icon}</div>
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{kpi.label}</span>
              <div className={`${kpi.iconColor} bg-white/5 p-2 rounded-xl border border-white/5 shadow-inner`}>{kpi.icon}</div>
            </div>
            <p className={`text-3xl font-black italic italic italic tracking-tighter relative z-10 ${kpi.color} ${kpi.glow}`}>R$ {kpi.value.toLocaleString('pt-BR')}</p>
            <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden relative z-10">
              <div className={`h-full ${kpi.barColor} w-full opacity-30`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* LISTAS VERTICAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        <div className="space-y-6">
          <div className="flex items-baseline gap-3 px-4">
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Extrato de Fluxo</h4>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <div className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            {recentTransactions.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 shadow-inner group-hover:scale-110 transition-transform ${rec.type === TransactionType.INCOME ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                    {rec.type === TransactionType.INCOME ? ICONS.Up : ICONS.Down}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white uppercase tracking-tighter truncate">{rec.description}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(rec.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className={`text-lg font-black italic italic italic tracking-tighter whitespace-nowrap ml-4 ${rec.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {rec.type === TransactionType.INCOME ? '+' : '-'} R$ {rec.amount.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="p-16 text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">DATABASE EMPTY</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-baseline gap-3 flex-1">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Passivo Circulante</h4>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>
            <button onClick={() => onCreatePayable({})} className="ml-4 text-sky-500 text-[10px] font-black uppercase tracking-widest hover:text-white px-4 py-2 bg-sky-500/10 rounded-xl border border-sky-500/20 transition-all">
              + Inserir Conta
            </button>
          </div>
          <div className="glass-card bg-[#0a111f]/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            {payables.filter(p => p.status !== AccountStatus.PAID).map((acc) => (
              <div key={acc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 last:border-0 gap-6 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#030712]/60 border border-white/5 flex items-center justify-center text-slate-500 shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    {ICONS.Calendar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white uppercase tracking-tighter truncate">{acc.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">VENCIMENTO {acc.dueDate}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 pl-16 sm:pl-0">
                  <span className="text-lg font-black text-white italic italic italic tracking-tighter">R$ {acc.amount.toLocaleString('pt-BR')}</span>
                  <button onClick={() => onPayAccount(acc.id)} className="px-6 py-3 bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 active:scale-95 hover:bg-sky-400 transition-all">
                    Liquidar
                  </button>
                </div>
              </div>
            ))}
            {payables.filter(p => p.status !== AccountStatus.PAID).length === 0 && (
              <div className="p-16 text-center text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] italic">OPERATIONAL CLEARance</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Finance;

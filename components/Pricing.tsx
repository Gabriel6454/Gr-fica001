
import React, { useState, useMemo } from 'react';
import { Product, Category, StoreSettings } from '../types';
import { ICONS } from '../constants';
import PriceTableImage from './PriceTableImage';

interface PricingProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
}

const Pricing: React.FC<PricingProps> = ({ products, categories, settings, onUpdateProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const avgMargin = useMemo(() => {
    if (products.length === 0) return 0;
    const totalMargin = products.reduce((sum, p) => sum + (p.margin || 0), 0);
    return totalMargin / products.length;
  }, [products]);

  const handleUpdateMargin = (id: string, newMargin: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newSalePrice = product.costPrice * newMargin;
    onUpdateProduct(id, { 
      margin: newMargin, 
      salePrice: newSalePrice 
    });
  };

  const handleUpdateCost = (id: string, newCost: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newSalePrice = newCost * product.margin;
    onUpdateProduct(id, { 
      costPrice: newCost, 
      salePrice: newSalePrice 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {previewProduct && (
        <PriceTableImage 
          product={previewProduct} 
          settings={settings} 
          onClose={() => setPreviewProduct(null)} 
        />
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Engenharia de Preços</h1>
          <p className="text-slate-500 text-sm font-medium">Controle de margens de lucro, custos e markup</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-[#0a111f] border border-slate-800 rounded-2xl p-4 flex items-center justify-between sm:justify-start gap-6 shadow-lg">
             <div className="flex flex-col">
               <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Margem Média</span>
               <span className="text-2xl font-black text-sky-500">{(avgMargin * 100 - 100).toFixed(1)}%</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
               {ICONS.Sales}
             </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors">
             {ICONS.Search}
          </div>
          <input 
            type="text" 
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a111f] border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-sky-500/50 transition-all font-bold placeholder:text-slate-700 shadow-lg"
          />
        </div>
        
        <select 
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="bg-[#0a111f] border border-slate-800 text-sm text-white px-6 py-4 rounded-2xl outline-none focus:border-sky-500/50 font-bold appearance-none w-full md:w-auto"
        >
          <option value="">Todas Categorias</option>
          {categories.map(cat => <option key={cat.id} value={cat.title}>{cat.title}</option>)}
        </select>
      </div>

      {/* VIEW MOBILE: CARDS VERTICAIS */}
      <div className="md:hidden space-y-6">
        {filteredProducts.map(product => {
          const markup = product.margin || 1;
          const profit = product.salePrice - product.costPrice;
          const healthColor = markup >= 1.8 ? 'text-emerald-500' : markup >= 1.4 ? 'text-sky-500' : 'text-rose-500';

          return (
            <div key={product.id} className="bg-[#0a111f] border border-slate-800/60 rounded-[32px] p-6 space-y-6 shadow-2xl relative overflow-hidden">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-600">{ICONS.Palette}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-base leading-tight truncate">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <button 
                        onClick={() => setPreviewProduct(product)}
                        className="text-sky-500 hover:text-sky-400 transition-colors"
                        title="Exportar Tabela"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 bg-[#050914]/50 p-4 rounded-2xl border border-slate-800/30">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Custo (R$)</label>
                    <input 
                       type="number" 
                       step="0.01"
                       value={product.costPrice}
                       onChange={(e) => handleUpdateCost(product.id, Number(e.target.value))}
                       className="w-full bg-[#0a111f] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-black outline-none focus:border-sky-500/50"
                     />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Markup (x)</label>
                    <input 
                       type="number" 
                       step="0.1"
                       value={product.margin}
                       onChange={(e) => handleUpdateMargin(product.id, Number(e.target.value))}
                       className="w-full bg-[#0a111f] border border-slate-800 rounded-xl px-3 py-2 text-sm text-sky-500 font-black outline-none focus:border-sky-500/50"
                     />
                  </div>
               </div>

               <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Venda Final</p>
                    <p className="text-xl font-black text-white">R$ {product.salePrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Lucro Un.</p>
                    <p className={`text-xl font-black ${profit > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      R$ {profit.toFixed(2)}
                    </p>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {/* VIEW DESKTOP: TABELA */}
      <div className="hidden md:block bg-[#0a111f] border border-slate-800/60 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-[11px] font-black uppercase tracking-[0.15em] border-b border-slate-800/20">
                <th className="py-6 px-8">Produto</th>
                <th className="py-6 px-8">Custo Unit. (R$)</th>
                <th className="py-6 px-8">Markup (x)</th>
                <th className="py-6 px-8">Venda Final (R$)</th>
                <th className="py-6 px-8">Lucro / Un. (R$)</th>
                <th className="py-6 px-8 text-right">Saúde Financeira</th>
                <th className="py-6 px-8 text-right w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {filteredProducts.map(product => {
                const markup = product.margin || 1;
                const profit = product.salePrice - product.costPrice;
                const healthColor = markup >= 1.8 ? 'text-emerald-500' : markup >= 1.4 ? 'text-sky-500' : 'text-rose-500';
                
                return (
                  <tr key={product.id} className="group hover:bg-slate-800/10 transition-all">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80" />
                          ) : (
                            <div className="text-slate-600 scale-75">{ICONS.Palette}</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{product.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                       <input 
                         type="number" 
                         step="0.01"
                         value={product.costPrice}
                         onChange={(e) => handleUpdateCost(product.id, Number(e.target.value))}
                         className="bg-[#030712] border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-black w-28 outline-none focus:border-sky-500/50"
                       />
                    </td>
                    <td className="py-5 px-8">
                       <input 
                         type="number" 
                         step="0.1"
                         value={product.margin}
                         onChange={(e) => handleUpdateMargin(product.id, Number(e.target.value))}
                         className="bg-[#030712] border border-slate-800 rounded-xl px-4 py-2 text-sm text-sky-500 font-black w-24 outline-none focus:border-sky-500/50"
                       />
                    </td>
                    <td className="py-5 px-8">
                       <span className="text-sm font-black text-white">R$ {product.salePrice.toFixed(2).replace('.', ',')}</span>
                    </td>
                    <td className="py-5 px-8">
                       <span className={`text-sm font-black ${profit > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         R$ {profit.toFixed(2).replace('.', ',')}
                       </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${healthColor}`}>
                            {markup >= 1.8 ? 'Ótima' : markup >= 1.4 ? 'Regular' : 'Crítica'}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${markup >= 1.8 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : markup >= 1.4 ? 'bg-sky-500 shadow-[0_0_8px_#0ea5e9]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></div>
                       </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                       <button 
                         onClick={() => setPreviewProduct(product)}
                         className="w-10 h-10 flex items-center justify-center bg-[#030712] border border-slate-800 rounded-xl text-sky-500 hover:text-sky-400 hover:border-sky-500/40 transition-all"
                         title="Exportar Tabela"
                       >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

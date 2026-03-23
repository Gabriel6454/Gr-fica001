
import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';
import { Product, Category, PriceTier, StoreSettings } from '../types';
import { suggestDescription } from '../services/geminiService';
import PriceTableImage from './PriceTableImage';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: Partial<Category>) => void;
  onDelete?: (id: string) => void;
  onReorder: (newOrder: Category[]) => void;
  categories: Category[];
  editingCategory?: Category;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, onDelete, onReorder, categories, editingCategory }) => {
  const [title, setTitle] = useState('');
  const [iconName, setIconName] = useState('Settings');

  useEffect(() => {
    if (editingCategory) {
      setTitle(editingCategory.title);
      setIconName(editingCategory.iconName);
    } else {
      setTitle('');
      setIconName('Settings');
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const iconOptions = [
    { name: 'Print', icon: ICONS.Print },
    { name: 'Palette', icon: ICONS.Palette },
    { name: 'Customers', icon: ICONS.Customers },
    { name: 'Settings', icon: ICONS.Settings },
    { name: 'Catalog', icon: ICONS.Catalog },
    { name: 'Products', icon: ICONS.Products },
  ];

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      onReorder(newOrder);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card bg-[#0a111f]/60 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto max-h-[95vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight italic uppercase italic">Categorias <span className="text-sky-500">Atlas</span></h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Organize seu portfólio</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5">{ICONS.X}</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          <div className="space-y-6 bg-white/5 p-6 rounded-[28px] border border-white/5">
            <h3 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">{editingCategory ? 'GESTÃO' : 'NOVO REGISTRO'}</h3>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Nome da Categoria</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-sky-500/50 font-bold transition-all"
                placeholder="Ex: Cartões de Visita"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Ícone Visual</label>
              <div className="grid grid-cols-6 gap-2">
                {iconOptions.map(opt => (
                  <button
                    key={opt.name}
                    onClick={() => setIconName(opt.name)}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all ${iconName === opt.name
                      ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/30 border-sky-400'
                      : 'bg-[#030712]/40 border-white/5 text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <div className="scale-100">{opt.icon}</div>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => { onSave({ title, iconName }); setTitle(''); }}
              className="w-full py-4 bg-sky-500 text-white font-black rounded-2xl hover:bg-sky-400 shadow-xl shadow-sky-500/20 transition-all uppercase text-[11px] tracking-widest active:scale-[0.98]"
            >
              {editingCategory ? 'Atualizar Categoria' : 'Confirmar Categoria'}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Ordem de Prioridade</h3>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-sky-500 bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/10">{iconOptions.find(o => o.name === cat.iconName)?.icon || ICONS.Settings}</span>
                    <span className="text-sm font-bold text-slate-200">{cat.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-2 text-slate-400 hover:text-sky-500 disabled:opacity-10 transition-all"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg></button>
                    <button onClick={() => handleMove(idx, 'down')} disabled={idx === categories.length - 1} className="p-2 text-slate-400 hover:text-sky-500 disabled:opacity-10 transition-all"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></button>
                    <button
                      onClick={() => onDelete?.(cat.id)}
                      className="text-slate-400 hover:text-rose-500 p-2 transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PreviewModal removido

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prod: Partial<Product>) => void;
  categories: Category[];
  product?: Product;
  onManageCategories: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, categories, product, onManageCategories }) => {
  const initialTiers = [
    { quantity: 100, costPrice: 0, margin: 2.0, salePrice: 0 },
    { quantity: 250, costPrice: 0, margin: 1.8, salePrice: 0 },
    { quantity: 500, costPrice: 0, margin: 1.6, salePrice: 0 },
    { quantity: 1000, costPrice: 0, margin: 1.5, salePrice: 0 },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: categories[0]?.title || 'Outro',
    imageUrl: '',
    priceTiers: initialTiers
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        priceTiers: product.priceTiers?.length ? product.priceTiers : initialTiers,
        pdfBrandName: product.pdfBrandName || '',
        pdfSubtitle: product.pdfSubtitle || '',
        pdfBadge: product.pdfBadge || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: categories[0]?.title || 'Outro',
        imageUrl: '',
        priceTiers: initialTiers,
        pdfBrandName: '',
        pdfSubtitle: '',
        pdfBadge: ''
      });
    }
  }, [product, isOpen, categories]);

  const updateTier = (index: number, field: keyof PriceTier, value: number) => {
    const newTiers = [...(formData.priceTiers || [])];
    const tier = { ...newTiers[index], [field]: value };
    if (field === 'costPrice' || field === 'margin') {
      tier.salePrice = Number((tier.costPrice * tier.margin).toFixed(2));
    } else if (field === 'salePrice') {
      if (tier.costPrice > 0) tier.margin = Number((tier.salePrice / tier.costPrice).toFixed(2));
      else tier.margin = 0;
    }
    newTiers[index] = tier;
    setFormData({ ...formData, priceTiers: newTiers });
  };

  const addTier = () => {
    const tiers = formData.priceTiers || [];
    const lastTier = tiers[tiers.length - 1] || { quantity: 0, costPrice: 0, margin: 2.0, salePrice: 0 };
    const newTier = {
      quantity: lastTier.quantity + 500,
      costPrice: lastTier.costPrice,
      margin: Math.max(1.1, Number((lastTier.margin - 0.1).toFixed(2))),
      salePrice: 0
    };
    newTier.salePrice = Number((newTier.costPrice * newTier.margin).toFixed(2));
    setFormData({ ...formData, priceTiers: [...tiers, newTier] });
  };

  const removeTier = (index: number) => {
    const newTiers = [...(formData.priceTiers || [])];
    newTiers.splice(index, 1);
    setFormData({ ...formData, priceTiers: newTiers });
  };

  const copyFirstCostToAll = () => {
    const firstCost = formData.priceTiers?.[0]?.costPrice || 0;
    const newTiers = (formData.priceTiers || []).map(t => ({
      ...t,
      costPrice: firstCost,
      salePrice: Number((firstCost * t.margin).toFixed(2))
    }));
    setFormData({ ...formData, priceTiers: newTiers });
  };

  const handleAiSuggest = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    const suggestion = await suggestDescription(formData.name, formData.category || '');
    setFormData(prev => ({ ...prev, description: suggestion }));
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const baseTier = formData.priceTiers?.[0];
    onSave({
      ...formData,
      salePrice: baseTier?.salePrice || 0,
      costPrice: baseTier?.costPrice || 0,
      margin: baseTier?.margin || 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card bg-[#0a111f]/60 w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto max-h-[98vh] sm:max-h-[94vh] animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl ${product ? 'bg-sky-500 shadow-sky-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              <div className="scale-125">{product ? ICONS.Edit : ICONS.Plus}</div>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight italic uppercase italic">{product ? 'Editar' : 'Novo'} <span className="text-sky-500">Produto</span></h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{product ? 'REFINE AS ESPECIFICAÇÕES' : 'EXPANDA SEU CATÁLOGO'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5">{ICONS.X}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Capa do Item</label>
              <div onClick={() => fileInputRef.current?.click()} className="aspect-square w-full rounded-[32px] border-2 border-dashed border-white/5 bg-[#030712]/40 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Preview" /> : <div className="text-center p-8 text-slate-600 group-hover:text-sky-500 transition-all duration-500"><div className="scale-150 mb-6 opacity-40 group-hover:opacity-100 group-hover:scale-175 transition-all">{ICONS.Palette}</div><p className="text-[10px] font-black uppercase tracking-[0.2em]">Upload de Imagem</p></div>}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Título do Produto</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white font-bold outline-none focus:border-sky-500/50 transition-all shadow-inner" placeholder="Ex: Cartão de Visita 4x4" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Segmentação</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white font-bold outline-none appearance-none focus:border-sky-500/50 transition-all shadow-inner">
                        {categories.map(cat => <option key={cat.id} value={cat.title}>{cat.title}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none scale-100">{ICONS.ChevronDown}</div>
                    </div>
                    <button 
                      type="button"
                      onClick={onManageCategories}
                      className="px-4 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-2xl hover:bg-sky-500 hover:text-white transition-all shadow-lg"
                      title="Gerenciar Categorias"
                    >
                      {ICONS.Plus}
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição do Material</label>
                  <button onClick={handleAiSuggest} disabled={isGenerating || !formData.name} className="flex items-center gap-1.5 text-[9px] font-black text-sky-500 uppercase bg-sky-500/10 px-3 py-1.5 rounded-full border border-sky-500/20 hover:bg-sky-500/20 transition-all">
                    {isGenerating ? <div className="w-3 h-3 border-2 border-sky-500/50 border-t-sky-500 rounded-full animate-spin"></div> : 'IA Autocomplete'}
                  </button>
                </div>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-[#030712] border border-slate-800 rounded-2xl px-5 py-4 text-xs text-slate-300 outline-none focus:border-sky-500/50 transition-all resize-none leading-relaxed" placeholder="Descreva o papel, gramatura e acabamento..." />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Aparência na Tabela de Preços</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Personalize os letreiros gerados na exportação deste produto.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Complemento Nome</label>
                     <input type="text" value={formData.pdfBrandName || ''} onChange={e => setFormData({ ...formData, pdfBrandName: e.target.value })} className="w-full bg-[#030712] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-sky-500/50 transition-all placeholder-slate-600" placeholder="Padrão: (Vazio)" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Subtítulo da Marca</label>
                     <input type="text" value={formData.pdfSubtitle || ''} onChange={e => setFormData({ ...formData, pdfSubtitle: e.target.value })} className="w-full bg-[#030712] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-sky-500/50 transition-all placeholder-slate-600" placeholder="Padrão: Soluções Gráficas..." />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Texto do Selo</label>
                     <input type="text" value={formData.pdfBadge || ''} onChange={e => setFormData({ ...formData, pdfBadge: e.target.value })} className="w-full bg-[#030712] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-sky-500/50 transition-all placeholder-slate-600" placeholder="Padrão: Tabela de Preço" />
                   </div>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Matriz de Preços</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure o Markup por volume</p>
              </div>
              <button onClick={addTier} className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-[10px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all">
                {ICONS.Plus} Adicionar Lote
              </button>
              <button onClick={copyFirstCostToAll} className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all ml-auto">
                {ICONS.Copy} Sincronizar Custo
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {formData.priceTiers?.map((tier, idx) => {
                const profit = tier.salePrice - tier.costPrice;
                return (
                  <div key={idx} className="bg-[#050914] border border-slate-800 rounded-[24px] p-5 hover:border-sky-500/20 transition-all group/tier relative">
                    {formData.priceTiers && formData.priceTiers.length > 1 && (
                      <button
                        onClick={() => removeTier(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/tier:opacity-100 transition-opacity shadow-lg z-10"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tier.quantity}
                          onChange={e => updateTier(idx, 'quantity', Number(e.target.value))}
                          className="w-16 bg-[#0a111f] border border-white/5 rounded-md px-2 py-1 text-xs font-black text-sky-500 outline-none focus:border-sky-500/50"
                        />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">un</span>
                      </div>
                      {profit > 0 && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full">+{((profit / tier.salePrice) * 100).toFixed(0)}%</span>}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Custo Operacional</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-black">R$</span>
                          <input type="number" step="0.01" value={tier.costPrice} onChange={e => updateTier(idx, 'costPrice', Number(e.target.value))} className="w-full bg-[#0a111f] border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white font-bold outline-none focus:border-sky-500/50" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Markup</label>
                          <input type="number" step="0.1" value={tier.margin} onChange={e => updateTier(idx, 'margin', Number(e.target.value))} className="w-full bg-[#0a111f] border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 font-black outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Venda</label>
                          <input type="number" step="0.01" value={tier.salePrice} onChange={e => updateTier(idx, 'salePrice', Number(e.target.value))} className="w-full bg-[#0a111f] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-400 font-black outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-6 bg-[#0d1729]/60 border-t border-slate-800/50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 backdrop-blur-md">
          <button onClick={onClose} className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-slate-800 text-slate-400 font-black uppercase rounded-2xl hover:bg-slate-800 transition-all text-[11px] tracking-widest">Descartar</button>
          <button onClick={handleSubmit} className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:brightness-110 text-white font-black uppercase rounded-2xl shadow-2xl shadow-sky-500/20 transition-all text-[11px] tracking-widest active:scale-95">Salvar Produto</button>
        </div>
      </div>
    </div>
  );
};

interface CatalogProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onAddCategory: (cat: Partial<Category>) => void;
  onEditCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories: (newOrder: Category[]) => void;
  onAddProduct: (prod: Partial<Product>) => void;
  onEditProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

// Image export dimensions standardized to 732x980 (2x HD)
const EXPORT_WIDTH = 732;
const EXPORT_HEIGHT = 1040;

const Catalog: React.FC<CatalogProps> = ({
  products, categories, settings,
  onAddCategory, onEditCategory, onDeleteCategory, onReorderCategories,
  onAddProduct, onEditProduct, onDeleteProduct
}) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [selectedTierIndices, setSelectedTierIndices] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(window.innerWidth < 1024 ? 'grid' : 'table');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode('grid');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredProducts = activeCategoryFilter
    ? products.filter(p => p.category === activeCategoryFilter)
    : products;

  const handleOpenAddProduct = () => {
    setEditingProduct(undefined);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const [selectedProductForImage, setSelectedProductForImage] = useState<Product | null>(null);

  const handleTierSelect = (productId: string, index: number) => {
    setSelectedTierIndices(prev => ({ ...prev, [productId]: index }));
  };

  const confirmDeleteProduct = (product: Product) => {
    onDeleteProduct(product.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto px-4 sm:px-8 pb-20 mt-4">
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onReorder={onReorderCategories}
        onSave={(data) => {
          if (data.id) onEditCategory(data.id, data);
          else onAddCategory(data);
        }}
        onDelete={onDeleteCategory}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={(data) => {
          if (editingProduct) onEditProduct(editingProduct.id, data);
          else onAddProduct(data);
          setIsProductModalOpen(false);
        }}
        categories={categories}
        product={editingProduct}
        onManageCategories={() => setIsCategoryModalOpen(true)}
      />

      {previewProduct && (
        <PriceTableImage 
          product={previewProduct} 
          settings={settings} 
          onClose={() => setPreviewProduct(null)} 
        />
      )}

      {/* Hero Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6 pb-10 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-sky-500 rounded-full"></div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase italic">
              Portfólio <span className="text-sky-500/80">Soluções</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] ml-5">
            Gerencie seus produtos com elegância e eficiência
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex bg-[#030712]/80 backdrop-blur-md border border-white/5 p-1 rounded-2xl shadow-2xl">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${viewMode === 'table' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              Lista
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${viewMode === 'grid' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Grade
            </button>
          </div>

          <button
            onClick={handleOpenAddProduct}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black uppercase rounded-2xl text-[11px] tracking-widest shadow-xl shadow-sky-500/20 transition-all active:scale-95 group"
          >
            <span className="group-hover:rotate-90 transition-transform duration-300">{ICONS.Plus}</span>
            ADICIONAR PRODUTO
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveCategoryFilter(null)}
          className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${!activeCategoryFilter ? 'bg-white border-white text-black shadow-lg shadow-white/5' : 'bg-[#0a111f]/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'}`}
        >
          Todos os Materiais
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryFilter(cat.title)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeCategoryFilter === cat.title ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20' : 'bg-[#0a111f]/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'}`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="bg-[#0a111f]/60 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5">
                  <th className="py-5 px-8">Identificação</th>
                  <th className="py-5 px-8">Lotes & Quantidades</th>
                  <th className="py-5 px-8">Preço de Tabela</th>
                  <th className="py-5 px-8 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map(product => {
                  const tierIndex = selectedTierIndices[product.id] || 0;
                  const activeTier = product.priceTiers?.[tierIndex] || { quantity: 0, salePrice: 0 };
                  return (
                    <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-[#030712] border border-white/5 overflow-hidden shrink-0 shadow-lg group-hover:border-sky-500/30 transition-all duration-500">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover:text-sky-500 transition-colors">
                                {ICONS.Palette}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-sky-400 transition-colors">{product.name}</h3>
                            <span className="inline-block mt-1 text-[8px] text-sky-500 font-black uppercase tracking-[0.2em] bg-sky-500/5 px-2 py-0.5 rounded border border-sky-500/10">{product.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-wrap gap-1.5">
                          {product.priceTiers?.map((tier, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleTierSelect(product.id, idx)}
                              className={`px-3 py-1.5 text-[10px] font-black rounded-lg border transition-all duration-300 ${tierIndex === idx ? 'bg-sky-500 border-sky-400 text-white shadow-lg' : 'bg-[#030712] border-white/5 text-slate-500 hover:text-slate-300'}`}
                            >
                              {tier.quantity}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Valor Atual</span>
                          <span className="text-lg font-black text-emerald-400 tracking-tighter">
                             R$ {activeTier.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setPreviewProduct(product)}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                            title="Exportar"
                          >
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          </button>
                          <button 
                            onClick={() => handleOpenEditProduct(product)} 
                            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all shadow-sm"
                          >
                            {ICONS.Edit}
                          </button>
                          <button 
                            onClick={() => confirmDeleteProduct(product)} 
                            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-all shadow-sm"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
          {filteredProducts.map(product => {
            const tierIndex = selectedTierIndices[product.id] || 0;
            const activeTier = product.priceTiers?.[tierIndex] || { quantity: 0, salePrice: 0 };
            return (
              <div key={product.id} className="group bg-[#0a111f]/60 backdrop-blur-md border border-white/5 rounded-[32px] overflow-hidden hover:border-sky-500/20 hover:bg-[#0a111f]/80 transition-all duration-500 flex flex-col shadow-xl">
                <div className="aspect-[1.2/1] relative overflow-hidden bg-[#030712] border-b border-white/5">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-800 group-hover:text-sky-500 transition-colors">
                      <div className="scale-[1.5]">{ICONS.Palette}</div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-[8px] font-black text-white uppercase tracking-widest">
                      {product.category}
                    </span>
                  </div>

                  <div className="absolute inset-x-4 bottom-4 flex justify-between gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button 
                      onClick={() => setPreviewProduct(product)}
                      className="flex-1 py-2 bg-white/95 text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 hover:bg-sky-500 hover:text-white transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      PDF
                    </button>
                    <button 
                      onClick={() => handleOpenEditProduct(product)} 
                      className="w-10 h-10 bg-sky-500 text-white rounded-xl shadow-2xl flex items-center justify-center hover:bg-sky-400 transition-all"
                    >
                      {ICONS.Edit}
                    </button>
                    <button 
                      onClick={() => confirmDeleteProduct(product)}
                      className="w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-xl flex items-center justify-center hover:bg-rose-500 transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /></svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-sky-400 transition-colors leading-tight mb-1.5">{product.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed min-h-[30px]">{product.description}</p>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-white/5">
                    <div className="flex flex-wrap gap-1.5">
                      {product.priceTiers?.map((tier, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTierSelect(product.id, idx)}
                          className={`flex-1 min-w-[45px] py-1.5 text-[9px] font-black rounded-lg border transition-all duration-300 ${tierIndex === idx ? 'bg-sky-500 border-sky-400 text-white' : 'bg-[#030712] border-white/5 text-slate-600 hover:text-slate-300'}`}
                        >
                          {tier.quantity}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Lote Final</span>
                        <span className="text-2xl font-black text-emerald-400 tracking-tighter block leading-none">
                          R$ {activeTier.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#030712] border border-white/5 flex items-center justify-center text-slate-700 opacity-40 group-hover:opacity-100 transition-opacity">
                        {ICONS.Products}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="py-24 text-center bg-[#0a111f]/20 border border-white/5 border-dashed rounded-[40px] animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-[#030712] border border-white/5 rounded-2xl flex items-center justify-center text-slate-700 mx-auto mb-6 shadow-inner">
            <div className="scale-125">{ICONS.Products}</div>
          </div>
          <h3 className="text-base font-black text-white uppercase tracking-widest">Nenhum item encontrado</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 px-10">Tente ajustar seus filtros ou cadastre um novo produto.</p>
        </div>
      )}

      {/* Simple Table Styles Enhancement */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) {
          table { border-spacing: 0 12px; border-collapse: separate; }
          thead { display: none; }
          tbody tr { 
            display: flex; 
            flex-direction: column; 
            background: rgba(10, 17, 31, 0.4); 
            border-radius: 24px; 
            padding: 20px; 
            border: 1px solid rgba(255,255,255,0.05); 
            margin-bottom: 16px; 
            width: 100%; 
            transition: none !important; 
          }
          tbody td { padding: 0 !important; border: none !important; }
          tbody td:not(:last-child) { margin-bottom: 16px; }
          tbody td:last-child { width: 100%; }
          tbody .flex-wrap { justify-content: flex-start; }
          tbody .justify-end { justify-content: flex-start; gap: 8px; }
        }
      `}</style>
    </div>
  );
};

export default Catalog;

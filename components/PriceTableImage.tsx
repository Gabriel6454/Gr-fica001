import React, { useRef, useState } from 'react';
import { Product, PriceTier, StoreSettings } from '../types';
import { ICONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';

interface PriceTableImageProps {
  product: Product;
  settings: StoreSettings;
  onClose: () => void;
}

const PriceTableImage: React.FC<PriceTableImageProps> = ({ product, settings, onClose }) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    
    setIsDownloading(true);
    try {
      // Ensure the capture area is fully rendered and not clipped
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2, // 2x resolution for premium look
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      
      const link = document.createElement('a');
      link.download = `Tabela-${product.name.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      alert("Erro ao gerar imagem. Tente tirar um print da tela como alternativa.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-500 py-12">
      <div className="relative w-full max-w-[640px] flex flex-col gap-6">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center px-4 sticky top-0 z-50">
          <div className="flex flex-col">
            <h3 className="text-white font-black uppercase tracking-[0.3em] text-[10px] opacity-50">Preview de Exportação</h3>
            <span className="text-sky-500/50 text-[8px] font-bold uppercase tracking-widest mt-1">Design Obsidian Glass Ativo</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-rose-500/20 hover:text-rose-500 transition-all shadow-xl"
          >
            {ICONS.X}
          </button>
        </div>

        {/* THE PRICE TABLE IMAGE (Target for capture) */}
        <div className="relative group perspective-1000">
          <div 
            ref={captureRef}
            id="price-table-capture"
            className="w-full bg-[#030712] rounded-[48px] overflow-hidden border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col relative"
            style={{ 
              // We remove aspect-ratio to let it grow with content
              minHeight: 'auto',
            }}
          >
            {/* Grainy Texture / Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            
            {/* Background Decorative Elements */}
            <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>

            {/* Top Bar - Brand */}
            <div className="p-8 pb-4 flex justify-between items-center relative z-10">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                   <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                      {settings.name} {product.pdfBrandName?.trim() && <span className="text-sky-500">{product.pdfBrandName.trim()}</span>}
                   </h1>
                 </div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-0.5">{(product.pdfSubtitle?.trim()) || 'Soluções Gráficas de Alta Performance'}</p>
              </div>
              <div className="text-right flex items-center">
                 <span className="inline-flex items-center justify-center px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-[9px] font-black text-sky-400 uppercase tracking-widest leading-none">{(product.pdfBadge?.trim()) || 'Tabela de Preço'}</span>
              </div>
            </div>

            {/* Product Section */}
            <div className="px-8 py-5 flex gap-6 items-center relative z-10">
              <div className="w-28 h-28 rounded-[32px] overflow-hidden border border-white/10 bg-[#050914] shadow-2xl shrink-0">
                 {product.imageUrl ? (
                   <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-800 scale-150">
                      {ICONS.Palette}
                   </div>
                 )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-sky-500 uppercase tracking-[0.2em] mb-2 block">{product.category}</span>
                <h2 className="text-xl font-black text-white tracking-tight leading-tight uppercase mb-2 truncate-2-lines line-clamp-2">{product.name}</h2>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                  {product.description || 'Material de alta qualidade com acabamento profissional.'}
                </p>
              </div>
            </div>

            {/* Price Matrix */}
            <div className="flex-1 px-8 py-6 relative z-10 overflow-visible">
               <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-sm shadow-inner">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                           <th className="py-4 px-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantidade</th>
                           <th className="py-4 px-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor Unit.</th>
                           <th className="py-4 px-6 text-right text-[10px] font-black text-white uppercase tracking-widest bg-sky-500/10">Total Lote</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {product.priceTiers.map((tier, idx) => {
                          const unitPrice = tier.quantity > 0 ? (tier.salePrice / tier.quantity).toFixed(2) : "0,00";
                          return (
                            <motion.tr 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group/row hover:bg-white/[0.02] transition-colors"
                            >
                               <td className="py-3 px-6">
                                  <span className="text-base font-black text-white">{tier.quantity}</span>
                                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-2">un</span>
                               </td>
                               <td className="py-3 px-6 text-right">
                                  <span className="text-[10px] text-slate-500 font-bold mr-1">R$</span>
                                  <span className="text-sm font-bold text-slate-400">{unitPrice.replace('.', ',')}</span>
                               </td>
                               <td className="py-3 px-6 text-right bg-sky-500/[0.02] group-hover/row:bg-sky-500/[0.05] transition-colors">
                                  <span className="text-[11px] text-sky-500/50 font-black mr-1">R$</span>
                                  <span className="text-xl font-black text-sky-400 tracking-tighter">
                                    {tier.salePrice.toFixed(2).replace('.', ',')}
                                  </span>
                               </td>
                            </motion.tr>
                          );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Footer Card */}
            <div className="px-8 pb-8 pt-2 relative z-10 mt-auto">
               <div className="bg-gradient-to-br from-[#0a111f] to-[#050914] border border-white/5 p-6 rounded-[32px] flex items-center justify-between shadow-2xl">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                   </div>
                   <div>
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Frete Fixo Nacional</p>
                     <p className="text-sm font-black text-white">R$ 21,00</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Qualidade Premium</p>
                   <div className="flex gap-1 justify-end">
                     {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-500 opacity-30"></div>)}
                   </div>
                 </div>
               </div>
            </div>
            
            {/* Subtle Bottom Border Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 opacity-50"></div>
          </div>
        </div>

        {/* Action Buttons (Not in capture) */}
        <div className="flex justify-center px-4 mb-10">
          <button 
            disabled={isDownloading}
            onClick={handleDownload}
            className="w-fit px-8 py-3.5 bg-gradient-to-br from-sky-400 to-sky-600 text-white font-black rounded-full shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/save"
          >
            {isDownloading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover/save:scale-110 transition-transform">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </div>
                <span>Salvar Tabela como Imagem</span>
              </>
            )}
          </button>
        </div>
        <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-[0.2em]">Visual em alta definição otimizado para WhatsApp</p>
            <div className="flex gap-1">
              {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-800"></div>)}
            </div>
          </div>
      </div>
    </div>
  );
};

export default PriceTableImage;

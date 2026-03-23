
import React, { useState } from 'react';
import { Customer } from '../types';
import { ICONS } from '../constants';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Partial<Customer>) => void;
  customer?: Customer;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSave, customer }) => {
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || { name: '', type: 'PF', document: '', phone: '', email: '', address: '', number: '', neighborhood: '', city: '', state: '', cep: '' }
  );
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  React.useEffect(() => {
    if (customer) setFormData(customer);
    else setFormData({ name: '', type: 'PF', document: '', phone: '', email: '', address: '', number: '', neighborhood: '', city: '', state: '', cep: '' });
  }, [customer, isOpen]);

  const handleCepBlur = async () => {
    const cep = formData.cep?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card bg-[#0a111f]/60 w-full max-w-2xl rounded-[32px] shadow-2xl p-8 flex flex-col h-full sm:h-auto max-h-[95vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h2 className="text-2xl font-black text-white italic uppercase">
            {customer ? 'Editar' : 'Novo'} <span className="text-sky-500">Cliente</span>
          </h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5">{ICONS.X}</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            {/* Informações Básicas */}
            <div className="col-span-full space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nome / Razão Social</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
                placeholder="Ex: João Silva ou Gráfica Rápida LTDA"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Tipo de Cliente</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as 'PF' | 'PJ' })}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold appearance-none transition-all"
              >
                <option value="PF">Pessoa Física (PF)</option>
                <option value="PJ">Pessoa Jurídica (PJ)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Cpf / Cnpj</label>
              <input
                type="text"
                value={formData.document}
                onChange={e => setFormData({ ...formData, document: e.target.value })}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Whatsapp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
              />
            </div>

            {/* Endereço */}
            <div className="col-span-full pt-4 border-t border-white/5 mt-4">
               <h3 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                 Endereço de Entrega
               </h3>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex justify-between">
                CEP 
                {isLoadingCep && <span className="text-sky-500 animate-pulse lowercase text-[8px]">Inspecionando...</span>}
              </label>
              <input
                type="text"
                value={formData.cep}
                onChange={e => setFormData({ ...formData, cep: e.target.value })}
                onBlur={handleCepBlur}
                placeholder="00000-000"
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
              />
            </div>

            <div className="md:col-span-3 lg:col-span-1 grid grid-cols-4 gap-4 col-span-full">
               <div className="col-span-3 space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Logradouro / Rua</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
                  />
               </div>
               <div className="col-span-1 space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nº</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all text-center"
                  />
               </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Bairro</label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Complemento</label>
                <input
                  type="text"
                  value={formData.complement}
                  onChange={e => setFormData({ ...formData, complement: e.target.value })}
                  className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all"
                  placeholder="Ex: Apto 101"
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">UF</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  maxLength={2}
                  className="w-full bg-[#030712]/40 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500/50 font-bold transition-all text-center uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 shrink-0">
          <button onClick={onClose} className="flex-1 px-8 py-4 bg-white/5 text-slate-400 font-black uppercase rounded-2xl hover:bg-white/10 transition-all text-[11px] tracking-widest border border-white/5">Cancelar</button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-8 py-4 bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black uppercase rounded-2xl hover:brightness-110 shadow-xl shadow-sky-500/20 transition-all text-[11px] tracking-widest active:scale-95"
          >
            {customer ? 'Salvar Alterações' : 'Concluir Cadastro'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CustomersProps {
  customers: Customer[];
  onAddCustomer: (c: Partial<Customer>) => void;
  onEditCustomer: (custId: string, updates: Partial<Customer>) => void;
  onDeleteCustomer: (custId: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onAddCustomer, onEditCustomer, onDeleteCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  const handleOpenAdd = () => {
    setEditingCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setIsModalOpen(true);
  };

  const confirmDelete = (c: Customer) => {
    onDeleteCustomer(c.id);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          if (editingCustomer) onEditCustomer(editingCustomer.id, data);
          else onAddCustomer(data);
          setIsModalOpen(false);
        }}
        customer={editingCustomer}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-white/5 mb-6 px-4 sm:px-6 md:px-8">
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none uppercase italic">Base de <span className="text-sky-500">Clientes</span></h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Gestão de contatos e histórico de parcerias</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-sky-500 to-sky-600 text-white font-black uppercase rounded-2xl text-[10px] sm:text-[11px] tracking-widest shadow-xl shadow-sky-500/20 hover:brightness-110 transition-all active:scale-95 w-full sm:w-auto">
          {ICONS.Plus} Cadastrar Cliente
        </button>
      </div>

      <div className="glass-card bg-[#0a111f]/40 rounded-[28px] sm:rounded-[40px] overflow-hidden shadow-2xl mx-4 sm:mx-6 md:mx-8">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse" style={{ minWidth: '560px' }}>
            <thead>
              <tr className="text-slate-500 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] bg-white/5 backdrop-blur-md">
                <th className="py-5 px-5 sm:px-8">Cliente</th>
                <th className="py-5 px-5 sm:px-8">Tipo</th>
                <th className="py-5 px-5 sm:px-8 hidden sm:table-cell">Identificação</th>
                <th className="py-5 px-5 sm:px-8">Localidade</th>
                <th className="py-5 px-5 sm:px-8 text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-slate-800/10 transition-all">
                  <td className="py-4 px-5 sm:px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 font-black text-xs shrink-0">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate max-w-[120px] sm:max-w-none">{customer.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px] sm:max-w-none">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 sm:px-8">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${customer.type === 'PF' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'}` }>
                      {customer.type}
                    </span>
                  </td>
                  <td className="py-4 px-5 sm:px-8 text-sm text-slate-400 font-medium hidden sm:table-cell">
                    {customer.document}
                  </td>
                  <td className="py-4 px-5 sm:px-8">
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-white">{customer.phone}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-black truncate max-w-[120px] sm:max-w-[180px]">
                        {customer.city}/{customer.state}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 sm:px-8 text-right">
                    <div className="flex justify-end gap-1.5 sm:gap-2">
                      <button onClick={() => handleOpenEdit(customer)} className="p-2.5 bg-[#0d1729] border border-slate-800/60 rounded-xl text-slate-400 hover:text-white transition-all">
                        {ICONS.Edit}
                      </button>
                      <button onClick={() => confirmDelete(customer)} className="p-2.5 bg-[#0d1729] border border-slate-800/60 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;

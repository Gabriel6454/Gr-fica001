
import { Product, Order, OrderStatus, FinanceRecord, TransactionType, PayableAccount, AccountStatus, Category, PriceTier, Customer, StoreSettings } from './types';

export const INITIAL_SETTINGS: StoreSettings = {
  name: 'Atlas',
  subtitle: 'Gestão de Revenda Gráfica',
  // Deixamos vazio para usar o ícone de gestão padrão do sistema até o usuário fazer upload
  logoUrl: '',
  menuOrder: ['dashboard', 'customers', 'products', 'orders', 'sales', 'quick-messages', 'investments', 'reports', 'settings'],
  systemScale: 1
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Cliente Padrão',
    type: 'PF',
    document: '000.000.000-00',
    phone: '(00) 00000-0000',
    email: 'cliente@atlas.com',
    address: 'Endereço Padrão',
    number: '0',
    neighborhood: 'Centro',
    city: 'Cidade',
    state: 'UF',
    cep: '00000-000'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', title: 'Impresso', iconName: 'Print' },
  { id: '2', title: 'Digital', iconName: 'Palette' },
  { id: '3', title: 'Serviço', iconName: 'Customers' },
];

export const INITIAL_PRODUCTS: Product[] = [];

// Lista de pedidos vazia para início do uso real
export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_FINANCE: FinanceRecord[] = [
  {
    id: 'f1',
    description: 'Saldo Inicial Caixa',
    amount: 140.00, // Saldo em mãos
    type: TransactionType.INCOME,
    date: '2024-05-20',
    category: 'Saldo'
  }
];

export const INITIAL_PAYABLES: PayableAccount[] = [
  {
    id: 'p1',
    description: 'Fatura Fornecedor Gráfica',
    amount: 450.00, // Pagar Gráfica
    dueDate: '2024-06-05',
    category: 'Produção',
    status: AccountStatus.PENDING
  }
];

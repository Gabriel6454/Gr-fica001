
import React from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerId?: string;
  date: string;
  deliveryDate: string;
  status: OrderStatus;
  total: number;
  shippingCost?: number;
  remainingAmount: number;
  paid: boolean;
  paymentMethod?: string;
  transactions?: PaymentTransaction[];
  items: { 
    productId: string; 
    quantity: number; 
    price: number; 
    cost?: number;
    paperType?: string;
    grammage?: string;
    finishing?: string;
    colors?: string;
    pantone?: string;
    estimatedMachineTime?: number; // minutos
    estimatedEnergyCost?: number;
    predictedWaste?: number; // m² ou kg
    machineId?: string; // v2.9
  }[];
  source?: 'direct' | 'ml' | 'shopify' | 'mercado_livre' | 'local'; // v2.9
  pdfUrl?: string; // URL ou Base64 do PDF anexado
  isRegistered?: boolean;
  trackingCode?: string;
  carrier?: string;
  trackingHistory?: { date: string; status: string; location: string }[];
  statusHistory?: { date: string; status: OrderStatus; user?: string }[];
  blockchainHash?: string; // Novo v2.8
  co2Avoided?: number; // kg
  stockDeducted?: boolean; // Novo v2.9
}

export enum OrderStatus {
  QUOTATION = 'Orçamento',
  WAITING_PAYMENT = 'Aguardando Pagamento',
  WAITING_FILE = 'Aguardando Arquivo',
  ART = 'Em Arte',
  WAITING_APPROVAL = 'Aguardando Aprovação',
  PRODUCTION = 'Em Produção',
  READY_FOR_PICKUP = 'Pronto p/ Retirada',
  SHIPPING = 'Em Transporte',
  DELIVERED = 'Entregue',
  COMPLETED = 'Concluído',
  CANCELLED = 'Cancelado'
}

export enum TransactionType {
  INCOME = 'Receita',
  EXPENSE = 'Despesa'
}

export enum AccountStatus {
  PENDING = 'Pendente',
  OVERDUE = 'Atrasado',
  PAID = 'Pago'
}

export enum CatalogOrderStatus {
  NEW = 'Novo',
  WAITING_PAYMENT = 'Aguardando Pagamento',
  APPROVED = 'Aprovado',
  CANCELLED = 'Cancelado'
}

export interface StoreSettings {
  name: string;
  subtitle: string;
  logoUrl: string;
  whatsapp?: string;
  footerTitle?: string;
  footerDescription?: string;
  footerWarning?: string;
  menuOrder?: string[];
  systemScale?: number;
}

export interface Customer {
  id: string;
  name: string;
  type: 'PF' | 'PJ';
  document: string;
  phone: string;
  email: string;
  address: string; // Logradouro / Rua
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  loyaltyPoints?: number; // Novo v2.8
  aiProfileNotes?: string;
}

export interface Category {
  id: string;
  title: string;
  iconName: string;
}

export interface PriceTier {
  quantity: number;
  costPrice: number;
  margin: number;
  salePrice: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  costPrice: number;
  margin: number;
  salePrice: number;
  imageUrl: string;
  totalProfit: number;
  priceTiers: PriceTier[];
  
  // Novos campos técnicos v2.6
  defaultPaper?: string;
  defaultGrammage?: string;
  defaultFinishing?: string;
  
  pdfBrandName?: string;
  pdfSubtitle?: string;
  pdfBadge?: string;
  
  // Novo v2.7
  templates?: { name: string; url: string }[];
  machineRequirements?: string[];
}

export interface ProductionMachine {
  id: string;
  name: string;
  type: 'offset' | 'digital' | 'finishing' | 'plotter';
  status: 'idle' | 'running' | 'maintenance' | 'offline';
  hourlyRate: number;
  energyConsumption: number; // kWh
}

export interface CatalogOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  status: CatalogOrderStatus;
  productName: string;
  quantity: number;
  totalValue: number;
}

export interface FinanceRecord {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
}

export interface PayableAccount {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  status: AccountStatus;
}

export interface QuickMessage {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
}

export interface PortfolioFII {
  id: string;
  ticker: string;
  sector: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  lastDividend: number;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string; // ex: kg, un, resma
  lastRestock: string;
  supplierPrice?: number; // Preço em tempo real do fornecedor
  supplierAvailability?: boolean;
  predictedUsageNext15Days?: number; // ML prediction
}

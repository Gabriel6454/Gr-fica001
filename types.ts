
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
  paymentMethod?: string; // Mantido para compatibilidade, mas o ideal é usar transactions
  transactions?: PaymentTransaction[]; // Novo campo para histórico
  items: { productId: string; quantity: number; price: number; cost?: number }[];
  pdfUrl?: string; // URL ou Base64 do PDF anexado
  isRegistered?: boolean;
}

export enum OrderStatus {
  ART = 'Criando Arte',
  PRODUCTION = 'Em Produção',
  SHIPPING = 'Em Transporte',
  DELIVERED = 'Entregue',
  COMPLETED = 'Concluído'
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
  totalSold: number;
  totalProfit: number;
  priceTiers: PriceTier[];
  pdfBrandName?: string;
  pdfSubtitle?: string;
  pdfBadge?: string;
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

import { Product, Order, Category, Customer, StoreSettings, QuickMessage } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'atlas_products',
  ORDERS: 'atlas_orders',
  CATEGORIES: 'atlas_categories',
  CUSTOMERS: 'atlas_customers',
  SETTINGS: 'atlas_settings',
  QUICK_MESSAGES: 'atlas_quick_messages'
};

export const dbService = {
  // Products
  async getProducts(): Promise<Product[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  async saveProduct(product: Product) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  async deleteProduct(id: string) {
    const products = await this.getProducts();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products.filter(p => p.id !== id)));
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  async saveOrder(order: Order) {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },
  async deleteOrder(id: string) {
    const orders = await this.getOrders();
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders.filter(o => o.id !== id)));
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },
  async saveCategory(category: Category) {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },
  async deleteCategory(id: string) {
    const categories = await this.getCategories();
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories.filter(c => c.id !== id)));
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },
  async saveCustomer(customer: Customer) {
    const customers = await this.getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index !== -1) {
      customers[index] = customer;
    } else {
      customers.push(customer);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  async deleteCustomer(id: string) {
    const customers = await this.getCustomers();
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers.filter(c => c.id !== id)));
  },

  // Settings
  async getSettings(): Promise<StoreSettings | null> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },
  async saveSettings(settings: StoreSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Quick Messages
  async getQuickMessages(): Promise<QuickMessage[]> {
    const data = localStorage.getItem(STORAGE_KEYS.QUICK_MESSAGES);
    return data ? JSON.parse(data) : [];
  },
  async saveQuickMessages(messages: QuickMessage[]) {
    localStorage.setItem(STORAGE_KEYS.QUICK_MESSAGES, JSON.stringify(messages));
  }
};

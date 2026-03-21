import { supabase } from './supabase';
import { Product, Order, Category, Customer, StoreSettings, QuickMessage } from '../types';

export const dbService = {
  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data || [];
  },
  async saveProduct(product: Product) {
    const { error } = await supabase.from('products').upsert(product);
    if (error) console.error('Error saving product:', error);
  },
  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error('Error deleting product:', error);
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    return data || [];
  },
  async saveOrder(order: Order) {
    const { error } = await supabase.from('orders').upsert(order);
    if (error) console.error('Error saving order:', error);
  },
  async deleteOrder(id: string) {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) console.error('Error deleting order:', error);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  },
  async saveCategory(category: Category) {
    const { error } = await supabase.from('categories').upsert(category);
    if (error) console.error('Error saving category:', error);
  },
  async deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error('Error deleting category:', error);
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
    return data || [];
  },
  async saveCustomer(customer: Customer) {
    const { error } = await supabase.from('customers').upsert(customer);
    if (error) console.error('Error saving customer:', error);
  },
  async deleteCustomer(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) console.error('Error deleting customer:', error);
  },

  // Settings
  async getSettings(): Promise<StoreSettings | null> {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'store_config').single();
    if (error) {
      if (error.code !== 'PGRST116') { // not found
        console.error('Error fetching settings:', error);
      }
      return null;
    }
    // Remove the id wrapper used for the database row
    const { id, ...settings } = data;
    return settings as StoreSettings;
  },
  async saveSettings(settings: StoreSettings) {
    const { error } = await supabase.from('settings').upsert({ id: 'store_config', ...settings });
    if (error) console.error('Error saving settings:', error);
  },

  // Quick Messages
  async getQuickMessages(): Promise<QuickMessage[]> {
    const { data, error } = await supabase.from('quick_messages').select('*');
    if (error) {
      console.error('Error fetching quick messages:', error);
      return [];
    }
    return data || [];
  },
  async saveQuickMessages(messages: QuickMessage[]) {
    // Exclui mensagens que não estão na lista (sync) e upsert das atuais
    if (messages.length > 0) {
      const ids = messages.map(m => m.id);
      await supabase.from('quick_messages').delete().not('id', 'in', `(${ids.join(',')})`);
      const { error } = await supabase.from('quick_messages').upsert(messages);
      if (error) console.error('Error saving quick messages:', error);
    } else {
      await supabase.from('quick_messages').delete().neq('id', 'dummy');
    }
  }
};

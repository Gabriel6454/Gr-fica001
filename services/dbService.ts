import { supabase } from './supabase';
import { Product, Order, Category, Customer, StoreSettings, QuickMessage } from '../types';

const getUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user.id;
};

export const dbService = {
  // Products
  async getProducts(): Promise<Product[]> {
    const user_id = await getUserId();
    if (!user_id) return [];
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user_id);
      
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data || [];
  },
  async saveProduct(product: Product) {
    const user_id = await getUserId();
    if (!user_id) throw new Error('Usuário não autenticado');
    
    const { error } = await supabase.from('products').upsert({ ...product, user_id });
    if (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  },
  async deleteProduct(id: string) {
    const user_id = await getUserId();
    if (!user_id) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', user_id);
    if (error) console.error('Error deleting product:', error);
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const user_id = await getUserId();
    if (!user_id) return [];
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id);
      
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    return data || [];
  },
  async saveOrder(order: Order) {
    const user_id = await getUserId();
    if (!user_id) throw new Error('Usuário não autenticado');
    
    console.log('Salvando pedido no Supabase:', order.id);
    const { error } = await supabase.from('orders').upsert({ ...order, user_id });
    
    if (error) {
      console.error('Erro detalhado do Supabase ao salvar pedido:', error);
      throw error;
    }
    return true;
  },
  async deleteOrder(id: string) {
    const user_id = await getUserId();
    if (!user_id) return;
    
    const { error } = await supabase.from('orders').delete().eq('id', id).eq('user_id', user_id);
    if (error) console.error('Error deleting order:', error);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const user_id = await getUserId();
    if (!user_id) return [];
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user_id);
      
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  },
  async saveCategory(category: Category) {
    const user_id = await getUserId();
    if (!user_id) return;
    
    const { error } = await supabase.from('categories').upsert({ ...category, user_id });
    if (error) console.error('Error saving category:', error);
  },
  async deleteCategory(id: string) {
    const user_id = await getUserId();
    if (!user_id) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', user_id);
    if (error) console.error('Error deleting category:', error);
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const user_id = await getUserId();
    if (!user_id) return [];
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user_id);
      
    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
    return data || [];
  },
  async saveCustomer(customer: Customer) {
    const user_id = await getUserId();
    if (!user_id) throw new Error('Usuário não autenticado');
    
    const { error } = await supabase.from('customers').upsert({ ...customer, user_id });
    if (error) {
       console.error('Error saving customer:', error);
       throw error;
    }
  },
  async deleteCustomer(id: string) {
    const user_id = await getUserId();
    if (!user_id) return;
    
    const { error } = await supabase.from('customers').delete().eq('id', id).eq('user_id', user_id);
    if (error) console.error('Error deleting customer:', error);
  },

  // Settings
  async getSettings(): Promise<StoreSettings | null> {
    const user_id = await getUserId();
    if (!user_id) return null;

    const { data, error } = await supabase.from('settings').select('*').eq('user_id', user_id).single();
    if (error) {
      if (error.code !== 'PGRST116') { // not found
        console.error('Error fetching settings:', error);
      }
      return null;
    }
    // Remove database specific fields
    const { id, user_id: _, ...settings } = data;
    return settings as StoreSettings;
  },
  async saveSettings(settings: StoreSettings) {
    const user_id = await getUserId();
    if (!user_id) return;

    const { error } = await supabase.from('settings').upsert({ 
        id: `config_${user_id}`, // ID único por usuário
        user_id, 
        ...settings 
    });
    if (error) console.error('Error saving settings:', error);
  },

  // Quick Messages
  async getQuickMessages(): Promise<QuickMessage[]> {
    const user_id = await getUserId();
    if (!user_id) return [];
    
    const { data, error } = await supabase.from('quick_messages').select('*').eq('user_id', user_id);
    if (error) {
      console.error('Error fetching quick messages:', error);
      return [];
    }
    return data || [];
  },
  async saveQuickMessages(messages: QuickMessage[]) {
    const user_id = await getUserId();
    if (!user_id) return;

    if (messages.length > 0) {
      const ids = messages.map(m => m.id);
      // Garantir que só deletamos mensagens DO USUÁRIO que não estão na lista
      await supabase.from('quick_messages').delete().eq('user_id', user_id).not('id', 'in', `(${ids.join(',')})`);
      
      const messagesWithUser = messages.map(m => ({ ...m, user_id }));
      const { error } = await supabase.from('quick_messages').upsert(messagesWithUser);
      if (error) console.error('Error saving quick messages:', error);
    } else {
      await supabase.from('quick_messages').delete().eq('user_id', user_id);
    }
  }
};

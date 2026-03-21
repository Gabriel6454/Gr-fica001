
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import Pricing from './components/Pricing';
import Orders from './components/Orders';
import Sales from './components/Sales';
import Customers from './components/Customers';
import Reports from './components/Reports';
import Settings from './components/Settings';
import QuickMessages from './components/QuickMessages';
import Investments from './components/Investments';
import PublicTracking from './components/PublicTracking';
import { Auth } from './components/Auth';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CATEGORIES, INITIAL_CUSTOMERS, INITIAL_SETTINGS } from './data';
import { Product, Order, OrderStatus, Category, Customer, StoreSettings, PaymentTransaction } from './types';
import { ICONS } from './constants';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // App Data State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Helper to load with strict null check
  const load = (key: string, fallback: any) => {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    try {
      const parsed = JSON.parse(val);
      if (parsed === null) return fallback;
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item !== null && item !== undefined);
      }
      return parsed;
    } catch (e) {
      return fallback;
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from LocalStorage when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        console.log('Starting LocalStorage fetch...');
        const [dbProducts, dbOrders, dbCategories, dbCustomers, dbSettings] = await Promise.all([
          dbService.getProducts(),
          dbService.getOrders(),
          dbService.getCategories(),
          dbService.getCustomers(),
          dbService.getSettings()
        ]);
        
        console.log('LocalStorage fetch successful:', { dbProducts, dbOrders, dbCategories, dbCustomers, dbSettings });

        setProducts(dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);
        setOrders(dbOrders);
        setCategories(dbCategories.length > 0 ? dbCategories : INITIAL_CATEGORIES);
        setCustomers(dbCustomers);
        if (dbSettings) setSettings(dbSettings);
      } catch (error) {
        console.error('Error fetching data from LocalStorage:', error);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    document.body.classList.add('bg-[#030712]');
    
    // Check current session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);

    // Listen for auth changes (no-op for now)
    const subscription = { unsubscribe: () => {} };


    const urlParams = new URLSearchParams(window.location.search);
    const trackingId = urlParams.get('tracking');
    if (trackingId) {
      setTrackingOrderId(trackingId);
    }

    return () => subscription.unsubscribe();
  }, []);

  // Sync settings to localStorage for quick UI load
  useEffect(() => { localStorage.setItem('atlas_settings', JSON.stringify(settings)); }, [settings]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    setProducts([]);
    setOrders([]);
    setCustomers([]);
    setCategories(INITIAL_CATEGORIES);
    setActiveTab('dashboard');
  };

  // --- Handlers de Pedidos ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    const order = updatedOrders.find(o => o.id === orderId);
    if (order) await dbService.saveOrder(order);
  };

  const handleEditOrder = async (orderId: string, updates: Partial<Order>) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
    setOrders(updatedOrders);
    const order = updatedOrders.find(o => o.id === orderId);
    if (order) await dbService.saveOrder(order);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const idToDelete = String(orderId).trim();
      console.log('App.tsx: Iniciando exclusão do pedido ID:', idToDelete);
      
      // Update local state first for responsiveness
      setOrders(prev => prev.filter(o => String(o.id).trim() !== idToDelete));
      
      // Delete from local storage
      const result = await dbService.deleteOrder(idToDelete);
      console.log('App.tsx: Pedido excluído com sucesso do LocalStorage');
    } catch (error: any) {
      console.error('App.tsx: Erro ao excluir pedido:', error);
      alert(`Erro ao excluir pedido: ${error.message || 'Erro desconhecido'}`);
      
      // Re-fetch data to sync state if delete failed
      const dbOrders = await dbService.getOrders();
      setOrders(dbOrders);
    }
  };

  const handleReceivePayment = async (orderId: string, amount: number, method: string) => {
    let updatedOrder: Order | null = null;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newTransaction: PaymentTransaction = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          amount: amount,
          method: method
        };
        const currentTransactions = o.transactions || [];
        const updatedTransactions = [...currentTransactions, newTransaction];
        const totalPaid = updatedTransactions.reduce((sum, t) => sum + t.amount, 0);
        const newRemaining = Math.max(0, o.total - totalPaid);
        updatedOrder = { 
          ...o, 
          transactions: updatedTransactions,
          remainingAmount: newRemaining, 
          paid: newRemaining <= 0,
          paymentMethod: method 
        };
        return updatedOrder;
      }
      return o;
    }));
    if (updatedOrder) await dbService.saveOrder(updatedOrder);
  };

  const handleCreateOrder = async (data: Partial<Order>) => {
    const initialPaid = (data.total || 0) - (data.remainingAmount || 0);
    let initialTransactions: PaymentTransaction[] = [];
    if (initialPaid > 0) {
      initialTransactions.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: initialPaid,
        method: data.paymentMethod || 'pix'
      });
    }
    const newOrder: Order = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      customerName: data.customerName || 'Cliente Avulso',
      customerId: data.customerId,
      date: data.date || new Date().toISOString().split('T')[0],
      deliveryDate: data.deliveryDate || 'A definir',
      status: data.status || OrderStatus.ART,
      total: data.total || 0,
      remainingAmount: data.remainingAmount || 0,
      paid: data.paid || false,
      paymentMethod: data.paymentMethod || 'pix',
      shippingCost: data.shippingCost || 0,
      transactions: initialTransactions,
      items: data.items || []
    };
    setOrders(prev => [newOrder, ...prev]);
    await dbService.saveOrder(newOrder);
  };

  const handleAttachPdf = async (orderId: string, pdfUrl: string) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, pdfUrl } : o);
    setOrders(updatedOrders);
    const order = updatedOrders.find(o => o.id === orderId);
    if (order) await dbService.saveOrder(order);
  };

  // --- Handlers de Produtos ---
  const handleAddProduct = async (prod: Partial<Product>) => {
    const newProduct = { ...prod, id: Math.random().toString(), totalSold: 0, totalProfit: 0 } as Product;
    setProducts(prev => [...prev, newProduct]);
    await dbService.saveProduct(newProduct);
  };
  const handleEditProduct = async (prodId: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(p => p.id === prodId ? { ...p, ...updates } : p);
    setProducts(updatedProducts);
    const product = updatedProducts.find(p => p.id === prodId);
    if (product) await dbService.saveProduct(product);
  };
  const handleDeleteProduct = async (prodId: string) => {
    setProducts(prev => prev.filter(p => p.id !== prodId));
    await dbService.deleteProduct(prodId);
  };

  // --- Handlers de Categorias ---
  const handleAddCategory = async (cat: Partial<Category>) => {
    const newCategory = { ...cat, id: Math.random().toString() } as Category;
    setCategories(prev => [...prev, newCategory]);
    await dbService.saveCategory(newCategory);
  };
  const handleEditCategory = async (catId: string, updates: Partial<Category>) => {
    const updatedCategories = categories.map(c => c.id === catId ? { ...c, ...updates } : c);
    setCategories(updatedCategories);
    const category = updatedCategories.find(c => c.id === catId);
    if (category) await dbService.saveCategory(category);
  };
  const handleDeleteCategory = async (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    await dbService.deleteCategory(catId);
  };
  const handleReorderCategories = async (newOrder: Category[]) => {
    setCategories(newOrder);
    // Sync all categories with their new order_index if needed
    for (let i = 0; i < newOrder.length; i++) {
      await dbService.saveCategory({ ...newOrder[i], order_index: i } as any);
    }
  };

  // --- Handlers de Clientes ---
  const handleAddCustomer = async (cust: Partial<Customer>) => {
    const newCustomer = { ...cust, id: Math.random().toString() } as Customer;
    setCustomers(prev => [...prev, newCustomer]);
    await dbService.saveCustomer(newCustomer);
  };
  const handleEditCustomer = async (custId: string, updates: Partial<Customer>) => {
    const updatedCustomers = customers.map(c => c.id === custId ? { ...c, ...updates } : c);
    setCustomers(updatedCustomers);
    const customer = updatedCustomers.find(c => c.id === custId);
    if (customer) await dbService.saveCustomer(customer);
  };
  const handleDeleteCustomer = async (custId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== custId));
    await dbService.deleteCustomer(custId);
  };

  const handleResetApp = () => {
    if (confirm("Deseja realmente apagar TODOS os seus dados? Esta ação não pode ser desfeita.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          products={products} 
          orders={orders} 
          customers={customers}
          settings={settings}
          onUpdateOrderStatus={handleUpdateOrderStatus} 
          onEditOrder={handleEditOrder}
          onDeleteOrder={handleDeleteOrder} 
          onReceivePayment={handleReceivePayment}
        />;
      case 'sales':
        return <Sales 
          orders={orders} 
          customers={customers} 
          onEditOrder={handleEditOrder} 
          onDeleteOrder={handleDeleteOrder} 
        />;
      case 'investments':
        return <Investments />;
      case 'customers':
        return <Customers 
          customers={customers} 
          onAddCustomer={handleAddCustomer} 
          onEditCustomer={handleEditCustomer} 
          onDeleteCustomer={handleDeleteCustomer} 
        />;
      case 'products':
        return <Catalog 
          products={products} 
          categories={categories} 
          settings={settings}
          onAddCategory={handleAddCategory} 
          onEditCategory={handleEditCategory} 
          onDeleteCategory={handleDeleteCategory} 
          onReorderCategories={handleReorderCategories}
          onAddProduct={handleAddProduct} 
          onEditProduct={handleEditProduct} 
          onDeleteProduct={handleDeleteProduct} 
        />;
      case 'orders':
        return <Orders 
          orders={orders} 
          products={products} 
          customers={customers} 
          settings={settings}
          onCreateOrder={handleCreateOrder} 
          onUpdateStatus={handleUpdateOrderStatus} 
          onEditOrder={handleEditOrder} 
          onDeleteOrder={handleDeleteOrder} 
          onReceivePayment={handleReceivePayment} 
          onAttachPdf={handleAttachPdf} 
        />;
      case 'reports':
        return <Reports products={products} orders={orders} />;
      case 'quick-messages':
        return <QuickMessages />;
      case 'settings':
        return <Settings settings={settings} onSave={(s) => { setSettings(s); dbService.saveSettings(s); }} onReset={handleResetApp} />;
      default:
        return <Dashboard 
          products={products} 
          orders={orders} 
          customers={customers}
          settings={settings}
          onUpdateOrderStatus={handleUpdateOrderStatus} 
          onEditOrder={handleEditOrder}
          onDeleteOrder={handleDeleteOrder} 
          onReceivePayment={handleReceivePayment}
        />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Carregando Atlas System...</p>
         </div>
      </div>
    );
  }

  if (trackingOrderId) {
    const trackedOrder = orders.find(o => o.id === trackingOrderId);
    if (!trackedOrder) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
             {ICONS.Search}
          </div>
          <h1 className="text-2xl font-black text-white">Pedido não encontrado</h1>
          <p className="text-slate-500">O link pode estar expirado ou incorreto.</p>
          <a href="/" className="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl uppercase text-xs tracking-widest hover:bg-sky-400 transition-all">
            Voltar ao Início
          </a>
        </div>
      );
    }
    return (
      <PublicTracking 
        order={trackedOrder} 
        settings={settings} 
        onBackToAdmin={() => {
           window.history.pushState({}, '', window.location.pathname);
           setTrackingOrderId(null);
        }} 
      />
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
      settings={settings}
      currentUser={currentUser}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

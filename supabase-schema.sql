-- SQL Schema for Supabase with Full Isolation (Multi-tenant)
-- Execute this script in your Supabase SQL Editor

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    "costPrice" NUMERIC,
    margin NUMERIC,
    "salePrice" NUMERIC,
    "imageUrl" TEXT,
    "totalSold" NUMERIC,
    "totalProfit" NUMERIC,
    "priceTiers" JSONB,
    "pdfBrandName" TEXT,
    "pdfSubtitle" TEXT,
    "pdfBadge" TEXT
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    "customerName" TEXT,
    "customerId" TEXT,
    date TEXT,
    "deliveryDate" TEXT,
    status TEXT,
    total NUMERIC,
    "shippingCost" NUMERIC,
    "remainingAmount" NUMERIC,
    paid BOOLEAN,
    "paymentMethod" TEXT,
    transactions JSONB,
    items JSONB,
    "pdfUrl" TEXT,
    "isRegistered" BOOLEAN,
    "trackingCode" TEXT,
    "carrier" TEXT
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT,
    "iconName" TEXT
);

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT,
    type TEXT,
    document TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    cep TEXT
);

-- 5. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT,
    subtitle TEXT,
    "logoUrl" TEXT,
    whatsapp TEXT,
    "footerTitle" TEXT,
    "footerDescription" TEXT,
    "footerWarning" TEXT,
    "menuOrder" JSONB,
    "systemScale" NUMERIC
);

-- 6. Quick Messages Table
CREATE TABLE IF NOT EXISTS quick_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT,
    content TEXT,
    "audioUrl" TEXT
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_messages ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES

-- Products
CREATE POLICY "Users can see only their own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can see only their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own orders" ON orders FOR DELETE USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users can see only their own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Customers
CREATE POLICY "Users can see only their own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- Settings
CREATE POLICY "Users can see only their own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON settings FOR DELETE USING (auth.uid() = user_id);

-- Quick Messages
CREATE POLICY "Users can see only their own quick_messages" ON quick_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quick_messages" ON quick_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quick_messages" ON quick_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quick_messages" ON quick_messages FOR DELETE USING (auth.uid() = user_id);

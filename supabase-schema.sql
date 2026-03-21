-- SQL Schema for Supabase
-- Execute this script in your Supabase SQL Editor

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    "isRegistered" BOOLEAN
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    "iconName" TEXT
);

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    title TEXT,
    content TEXT,
    "audioUrl" TEXT
);

-- Note: Depending on how the frontend handles IDs, they might be custom text IDs (like uuid strings generated on client side).
-- If the client manages UUIDs, we just leave them as TEXT or UUID, but here we enforce UUID for some tables. 
-- You might want to change `UUID` to `TEXT` if you generate non-uuid strings on the frontend.
-- e.g. `ALTER TABLE products ALTER COLUMN id TYPE TEXT;`

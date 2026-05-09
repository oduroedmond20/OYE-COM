import { Product, Customer, User, Discount } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Premium Coffee Beans', sku: 'COB-001', barcode: '1234567890123', price: 18.50, cost: 10.00, stock: 45, category: 'Beverages' },
  { id: '2', name: 'Organic Green Tea', sku: 'GTE-002', barcode: '9876543210987', price: 12.00, cost: 6.00, stock: 120, category: 'Beverages' },
  { id: '3', name: 'Artisan Sourdough', sku: 'BRD-003', price: 6.50, cost: 2.50, stock: 15, category: 'Bakery' },
  { id: '4', name: 'Whole Grain Bread', sku: 'BRD-004', price: 5.50, cost: 2.00, stock: 20, category: 'Bakery' },
  { id: '5', name: 'Sea Salt Dark Chocolate', sku: 'CHO-005', price: 4.99, cost: 1.50, stock: 85, category: 'Confectionery' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101', totalSpent: 450.25, lastPurchaseDate: new Date().toISOString() },
  { id: 'c2', name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102', totalSpent: 120.50, lastPurchaseDate: new Date().toISOString() },
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Super Admin', email: 'admin@stockflow.com', role: 'ADMIN' },
  { id: 'u2', name: 'John Manager', email: 'john@stockflow.com', role: 'MANAGER' },
  { id: 'u3', name: 'Sarah Cashier', email: 'sarah@stockflow.com', role: 'CASHIER' },
];

export const INITIAL_DISCOUNTS: Discount[] = [
  { id: 'd1', code: 'WELCOME10', type: 'percentage', value: 10, active: true },
  { id: 'd2', code: 'FLAT5', type: 'fixed', value: 5, active: true, minSpend: 30 },
];

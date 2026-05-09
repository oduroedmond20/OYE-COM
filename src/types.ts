/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastLogin?: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  active: boolean;
  minSpend?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  description?: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount?: number;
  discountCode?: string;
  total: number;
  timestamp: string;
  customerId?: string;
  cashierId: string;
  paymentMethod: 'cash' | 'card';
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  priceAtSale: number;
}

export interface Restock {
  id: string;
  productId: string;
  quantity: number;
  costPrice: number;
  timestamp: string;
  supplier?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  lastPurchaseDate: string;
}

export type AppState = {
  products: Product[];
  sales: Sale[];
  restocks: Restock[];
  customers: Customer[];
  discounts: Discount[];
  users: User[];
  currentUser: User | null;
};

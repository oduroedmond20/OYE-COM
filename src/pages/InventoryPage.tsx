import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  MoreVertical, 
  ArrowUpDown, 
  Filter,
  PackageCheck,
  PackageX,
  AlertTriangle
} from 'lucide-react';
import { AppState, Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function InventoryPage({ state, setState }: { 
  state: AppState; 
  setState: Dispatch<SetStateAction<AppState>> 
}) {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0
  });

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku) return;

    const product: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name || '',
      sku: newProduct.sku || '',
      category: newProduct.category || 'General',
      price: Number(newProduct.price) || 0,
      cost: Number(newProduct.cost) || 0,
      stock: Number(newProduct.stock) || 0,
      description: newProduct.description
    };

    setState(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));

    setIsAddModalOpen(false);
    setNewProduct({ name: '', sku: '', category: '', price: 0, cost: 0, stock: 0 });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Inventory & Products</h1>
          <p className="text-sm text-gray-400">Manage your product catalog and keep track of stock levels.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
        >
          <Plus size={20} />
          New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Products</p>
            <p className="text-2xl font-bold text-slate-800">{state.products.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <PackageCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock Units</p>
            <p className="text-2xl font-bold text-slate-800">{state.products.reduce((acc, p) => acc + p.stock, 0)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold text-red-500">{state.products.filter(p => p.stock < 10).length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products or SKU..."
              className="w-full pl-11 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={14} />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowUpDown size={14} />
              Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Product Details</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">SKU Code</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Price Points</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Inventory</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100">
                        <Package size={20} />
                      </div>
                      <span className="font-semibold text-sm text-slate-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 bg-gray-50 px-2.5 py-1 rounded-full">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-800">{formatCurrency(product.price)}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Cost: {formatCurrency(product.cost)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded",
                        product.stock > 10 ? "text-green-600 bg-green-50" : product.stock > 0 ? "text-orange-500 bg-orange-50" : "text-red-500 bg-red-50"
                      )}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-gray-300">
                <PackageX size={32} />
              </div>
              <p className="text-gray-400 font-medium">No results found for your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.98, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl space-y-6 border border-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h3 className="text-xl font-bold text-slate-800">New Product Registry</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Information</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    placeholder="SKU-001"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    placeholder="e.g. Apparel"
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Retail Price ($)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Cost ($)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    placeholder="0.00"
                    value={newProduct.cost}
                    onChange={e => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 text-sm border border-gray-200 rounded-lg font-bold text-slate-500 hover:bg-gray-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  Create Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { X } from 'lucide-react';

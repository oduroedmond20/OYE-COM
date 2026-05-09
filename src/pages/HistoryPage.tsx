import { useState } from 'react';
import { 
  History, 
  ShoppingCart, 
  RefreshCcw, 
  Search, 
  Calendar,
  ChevronRight,
  User,
  Package,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { AppState, Sale, Restock } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function HistoryPage({ state }: { state: AppState }) {
  const [activeTab, setActiveTab] = useState<'sales' | 'restock'>('sales');
  const [search, setSearch] = useState('');

  const filteredSales = state.sales.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) || 
    s.items.some(item => item.name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredRestocks = state.restocks.filter(r => {
    const product = state.products.find(p => p.id === r.productId);
    return r.id.toLowerCase().includes(search.toLowerCase()) || 
           (product?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Transaction History</h1>
          <p className="text-sm text-gray-400">Review all your processed sales and inventory replenishments.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={activeTab === 'sales' ? "Search receipts..." : "Search restock logs..."}
            className="w-full pl-11 pr-4 py-2 bg-white border border-gray-100 rounded-full text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-xl border border-gray-100 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('sales')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'sales' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-400 hover:text-slate-600 hover:bg-gray-50"
          )}
        >
          <ShoppingCart size={14} />
          Sales Log
        </button>
        <button
          onClick={() => setActiveTab('restock')}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'restock' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-400 hover:text-slate-600 hover:bg-gray-50"
          )}
        >
          <RefreshCcw size={14} />
          Restock Log
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'sales' ? (
          <motion.div
            key="sales-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredSales.map((sale) => (
              <div key={sale.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all group shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100 shadow-sm">
                      <ArrowUpRight size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        Order #{sale.id.split('-')[1]}
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full border border-gray-100">
                          {sale.paymentMethod}
                        </span>
                      </h4>
                      <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar size={12} />
                        {format(new Date(sale.timestamp), 'MMM dd, yyyy • HH:mm')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {sale.customerId ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <User size={14} className="text-indigo-600" />
                        <span className="font-bold text-indigo-700">{state.customers.find(c => c.id === sale.customerId)?.name}</span>
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-400 font-bold uppercase tracking-widest text-[9px] border border-gray-100">Guest Checkout</div>
                    )}
                    <div className="h-4 w-[1px] bg-gray-100" />
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <Package size={14} className="text-slate-400" />
                      <span className="font-bold text-slate-600">{sale.items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0 border-gray-50">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Net Revenue</p>
                      <p className="text-xl font-black text-slate-800">{formatCurrency(sale.total)}</p>
                    </div>
                    <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all group-hover:translate-x-1 shadow-sm border border-gray-100">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSales.length === 0 && (
              <div className="py-24 text-center space-y-4">
                 <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-gray-200">
                    <ShoppingCart size={40} strokeWidth={1} />
                 </div>
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No matching sales records</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="restock-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredRestocks.map((restock) => {
              const product = state.products.find(p => p.id === restock.productId);
              return (
                <div key={restock.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                        <ArrowDownLeft size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{product?.name || 'Archived Product'}</h4>
                        <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <Calendar size={12} />
                          {format(new Date(restock.timestamp), 'MMM dd, yyyy • HH:mm')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 max-w-lg">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inbound Units</p>
                        <p className="font-black text-slate-800">+{restock.quantity}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Cost</p>
                        <p className="font-bold text-slate-600">{formatCurrency(restock.costPrice)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auth. Supplier</p>
                        <p className="font-bold text-slate-600 truncate">{restock.supplier || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Outflow</p>
                      <p className="text-xl font-black text-red-500">{formatCurrency(restock.quantity * restock.costPrice)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredRestocks.length === 0 && (
              <div className="py-24 text-center space-y-4">
                 <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-gray-200">
                    <RefreshCcw size={40} strokeWidth={1} />
                 </div>
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No restocking activity found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

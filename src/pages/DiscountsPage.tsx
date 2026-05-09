import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Tag, 
  Trash2, 
  X,
  Target,
  Percent,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { AppState, Discount } from '../types';
import { cn } from '../lib/utils';

interface DiscountsPageProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export default function DiscountsPage({ state, setState }: DiscountsPageProps) {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    code: '',
    type: 'percentage',
    value: 0,
    active: true,
    minSpend: 0
  });

  const filteredDiscounts = state.discounts.filter(d => 
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDiscount = () => {
    if (!newDiscount.code || !newDiscount.value) return;

    const discount: Discount = {
      id: crypto.randomUUID(),
      code: newDiscount.code.toUpperCase(),
      type: newDiscount.type || 'percentage',
      value: Number(newDiscount.value),
      active: true,
      minSpend: Number(newDiscount.minSpend) || 0
    };

    setState(prev => ({
      ...prev,
      discounts: [discount, ...prev.discounts]
    }));
    setIsAddModalOpen(false);
    setNewDiscount({ code: '', type: 'percentage', value: 0, active: true, minSpend: 0 });
  };

  const toggleDiscount = (id: string) => {
    setState(prev => ({
      ...prev,
      discounts: prev.discounts.map(d => d.id === id ? { ...d, active: !d.active } : d)
    }));
  };

  const deleteDiscount = (id: string) => {
    setState(prev => ({
      ...prev,
      discounts: prev.discounts.filter(d => d.id !== id)
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Promotions & Discounts</h1>
          <p className="text-sm text-gray-400">Campaign management and seasonal markdown oversight.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
        >
          <Plus size={20} />
          Launch Campaign
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search campaign codes..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-gray-50">
          {filteredDiscounts.map((discount) => (
            <div key={discount.id} className="p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-colors",
                  discount.active ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-gray-50 text-gray-400 border-gray-100"
                )}>
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {discount.code}
                    {!discount.active && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">Inactive</span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {discount.type === 'percentage' ? `${discount.value}% OFF` : `Fixed $${discount.value} OFF`}
                    {discount.minSpend ? ` • Min Spend: $${discount.minSpend}` : ' • No Minimum'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleDiscount(discount.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    discount.active 
                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {discount.active ? 'Active' : 'Disabled'}
                </button>
                <button 
                  onClick={() => deleteDiscount(discount.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {filteredDiscounts.length === 0 && (
            <div className="py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-gray-200">
                 <Tag size={40} strokeWidth={1} />
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No promotions found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.98, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 border border-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h3 className="text-xl font-bold text-slate-800">New Campaign</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Target Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-bold uppercase"
                    placeholder="SALE2024"
                    value={newDiscount.code}
                    onChange={e => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Discount Logic</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setNewDiscount({ ...newDiscount, type: 'percentage' })}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-all",
                        newDiscount.type === 'percentage' 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                          : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                      )}
                    >
                      <Percent size={14} />
                      Percentage
                    </button>
                    <button 
                      onClick={() => setNewDiscount({ ...newDiscount, type: 'fixed' })}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-all",
                        newDiscount.type === 'fixed' 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                          : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                      )}
                    >
                      <Banknote size={14} />
                      Fixed Amount
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Benefit Value</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm pr-8"
                        placeholder="0"
                        value={newDiscount.value || ''}
                        onChange={e => setNewDiscount({ ...newDiscount, value: Number(e.target.value) })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs pointer-events-none">
                        {newDiscount.type === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Min Threshold</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm pr-8"
                        placeholder="0"
                        value={newDiscount.minSpend || ''}
                        onChange={e => setNewDiscount({ ...newDiscount, minSpend: Number(e.target.value) })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs pointer-events-none">$</span>
                    </div>
                  </div>
                </div>

                {newDiscount.type === 'percentage' && newDiscount.value! > 100 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    <AlertCircle size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Percentage cannot exceed 100%</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 text-sm border border-gray-200 rounded-lg font-bold text-slate-500 hover:bg-gray-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleAddDiscount}
                  disabled={!newDiscount.code || !newDiscount.value || (newDiscount.type === 'percentage' && newDiscount.value > 100)}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deploy Campaign
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

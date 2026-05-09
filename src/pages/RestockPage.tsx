import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { 
  RefreshCcw, 
  Search, 
  ArrowRight,
  Plus,
  Truck,
  History,
  CheckCircle2,
  Scan,
  Check
} from 'lucide-react';
import { AppState, Restock, Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import BarcodeScanner from '../components/BarcodeScanner';

export default function RestockPage({ state, setState }: { 
  state: AppState; 
  setState: Dispatch<SetStateAction<AppState>> 
}) {
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  );

  // Auto-select if barcode matches exactly in search
  useEffect(() => {
    if (search.length >= 8) {
      const product = state.products.find(p => p.barcode === search || p.sku === search);
      if (product) {
        setSelectedProductId(product.id);
        setCostPrice(product.cost);
        setSearch(''); // Clear search after scan
      }
    }
  }, [search, state.products]);

  const handleScan = (code: string) => {
    const product = state.products.find(p => p.barcode === code || p.sku === code);
    if (product) {
      setSelectedProductId(product.id);
      setCostPrice(product.cost);
      setIsScannerOpen(false);
    }
  };

  const selectedProduct = state.products.find(p => p.id === selectedProductId);

  const handleRestock = async () => {
    if (!selectedProductId || quantity <= 0) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newRestock: Restock = {
      id: `restock-${Date.now()}`,
      productId: selectedProductId,
      quantity,
      costPrice,
      supplier,
      timestamp: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      restocks: [newRestock, ...prev.restocks],
      products: prev.products.map(p => 
        p.id === selectedProductId 
          ? { ...p, stock: p.stock + quantity, cost: costPrice || p.cost } 
          : p
      )
    }));

    setIsProcessing(false);
    setShowSuccess(true);
    setSelectedProductId(null);
    setQuantity(0);
    setCostPrice(0);
    setSupplier('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Restock Products</h1>
          <p className="text-sm text-gray-400">Add inventory units and update unit cost prices.</p>
        </div>
        <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm text-slate-500">
          <History size={16} className="text-gray-400" />
          <span>{state.restocks.length} Logs recorded</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Selection Area */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">1. Product Selection</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsScannerOpen(true)}
                className="p-2.5 bg-white border border-gray-100 rounded-full text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
                title="Open Barcode Scanner"
              >
                <Scan size={20} />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="SKU or Barcode Scanner..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setSelectedProductId(null);
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setCostPrice(product.cost);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                    selectedProductId === product.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
                      : "bg-gray-50/50 border-transparent hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", selectedProductId === product.id ? "bg-white/10" : "bg-white border border-gray-100 text-gray-400 group-hover:text-indigo-500")}>
                      <RefreshCcw size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate">{product.name}</p>
                      <p className={cn("text-[10px] font-mono tracking-tighter", selectedProductId === product.id ? "text-white/60" : "text-gray-400")}>{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{product.stock}</p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", selectedProductId === product.id ? "text-white/40" : "text-gray-400")}>Units</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Restock Form */}
        <div className="space-y-6 sticky top-24">
          <AnimatePresence mode="wait">
            {selectedProduct ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Truck size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">{selectedProduct.name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inbound Logistics for {selectedProduct.sku}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Quantity to Inbound</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full pl-4 pr-12 py-4 bg-gray-50 rounded-xl text-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        value={quantity || ''}
                        onChange={e => setQuantity(Number(e.target.value))}
                      />
                      <Plus className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300" size={24} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">New Batch Cost ($)</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full pl-4 pr-12 py-4 bg-gray-50 rounded-xl text-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        value={costPrice || ''}
                        onChange={e => setCostPrice(Number(e.target.value))}
                      />
                      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300" size={24} />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Validated Supplier</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm"
                      placeholder="e.g. Acme Distributions"
                      value={supplier}
                      onChange={e => setSupplier(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="bg-gray-50 p-5 rounded-xl flex items-center justify-between mb-8">
                    <div className="text-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">New Total Units</p>
                      <p className="font-black text-2xl text-slate-800">{selectedProduct.stock + quantity}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Incremental Value</p>
                      <p className="font-black text-2xl text-indigo-600">{formatCurrency(quantity * costPrice)}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleRestock}
                    disabled={quantity <= 0 || isProcessing}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                      quantity <= 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-100"
                    )}
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Commit Inventory Update</>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[440px] border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300 p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <RefreshCcw size={40} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Inventory Workflow</h3>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">Please select a product from the registry to begin the inbound stock process.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="bg-slate-900 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                <Check size={14} strokeWidth={3} />
              </div>
              <p className="font-bold text-xs uppercase tracking-widest">Batch Successfully Logged</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <BarcodeScanner 
            onScan={handleScan}
            onClose={() => setIsScannerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

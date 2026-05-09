import { useState, useMemo, useRef, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2,
  UserPlus,
  CreditCard,
  Banknote,
  Package,
  Scan,
  Tag,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { AppState, Product, SaleItem, Sale, Discount } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useReactToPrint } from 'react-to-print';
import { Receipt } from '../components/Receipt';
import BarcodeScanner from '../components/BarcodeScanner';

export default function SalesPage({ state, setState }: { 
  state: AppState; 
  setState: Dispatch<SetStateAction<AppState>> 
}) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  
  // Barcode & Discounts
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  const filteredProducts = useMemo(() => {
    return state.products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search)
    );
  }, [state.products, search]);

  // Auto-add if barcode matches exactly in search
  useEffect(() => {
    if (search.length >= 8) {
      const product = state.products.find(p => p.barcode === search || p.sku === search);
      if (product) {
        addToCart(product);
        setSearch(''); // Clear search after scan
      }
    }
  }, [search, state.products]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        priceAtSale: product.price
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = state.products.find(p => p.id === productId);
        const newQty = Math.max(0, item.quantity + delta);
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleScan = (code: string) => {
    const product = state.products.find(p => p.barcode === code || p.sku === code);
    if (product) {
      addToCart(product);
      setIsScannerOpen(false);
    }
  };

  const applyDiscount = () => {
    if (!couponCode) return;
    const discount = state.discounts.find(d => d.code.toUpperCase() === couponCode.toUpperCase() && d.active);
    
    if (!discount) {
      setDiscountError('Invalid or inactive code');
      return;
    }

    if (discount.minSpend && cartSubtotal < discount.minSpend) {
      setDiscountError(`Minimum spend of $${discount.minSpend} required`);
      return;
    }

    setAppliedDiscount(discount);
    setDiscountError(null);
    setCouponCode('');
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.priceAtSale * item.quantity), 0);
  
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percentage') {
      return (cartSubtotal * appliedDiscount.value) / 100;
    }
    return Math.min(appliedDiscount.value, cartSubtotal);
  }, [appliedDiscount, cartSubtotal]);

  const cartTotal = cartSubtotal - discountAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const newSale: Sale = {
      id: `sale-${Math.random().toString(36).substr(2, 9)}`,
      items: cart,
      subtotal: cartSubtotal,
      discountAmount: discountAmount || undefined,
      discountCode: appliedDiscount?.code,
      total: cartTotal,
      timestamp: new Date().toISOString(),
      customerId: selectedCustomerId || undefined,
      cashierId: state.currentUser?.id || 'anonymous',
      paymentMethod
    };

    setState(prev => {
      // Update inventory levels
      const updatedProducts = prev.products.map(p => {
        const cartItem = cart.find(item => item.productId === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      });

      // Update customer stats if selected
      const updatedCustomers = selectedCustomerId 
        ? prev.customers.map(c => c.id === selectedCustomerId ? {
            ...c, 
            totalSpent: c.totalSpent + cartTotal,
            lastPurchaseDate: new Date().toISOString()
          } : c)
        : prev.customers;

      return {
        ...prev,
        sales: [newSale, ...prev.sales],
        products: updatedProducts,
        customers: updatedCustomers
      };
    });

    setLastSale(newSale);
    setCart([]);
    setSelectedCustomerId(null);
    setAppliedDiscount(null);
    setIsProcessing(false);
    setShowSuccess(true);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row gap-8 overflow-hidden">
      {/* Product Selection */}
      <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Stock Registry</h1>
            <p className="text-sm text-gray-400">Scan or select products to process a new sale.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="p-2.5 bg-white border border-gray-100 rounded-full text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
              title="Open Barcode Scanner"
            >
              <Scan size={20} />
            </button>
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="SKU or Barcode Input..."
                className="w-full pl-11 pr-4 py-2 bg-white border border-gray-100 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5 pb-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={cn(
                "group relative bg-white border border-gray-100 rounded-xl p-4 text-left transition-all hover:shadow-md active:scale-[0.98] shadow-sm",
                product.stock <= 0 && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                <Package size={32} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{product.category}</span>
                <h3 className="font-bold text-sm text-slate-800 truncate">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(product.price)}</span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter",
                    product.stock > 10 ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {product.stock} left
                  </span>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Plus size={18} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingCart size={18} />
            </div>
            <h2 className="font-bold text-slate-800">New Order</h2>
          </div>
          <button 
            onClick={() => setCart([])}
            className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-3 py-20">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <ShoppingCart size={40} strokeWidth={1} />
                </div>
                <p className="text-sm font-semibold tracking-tight">Your cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 group"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                    <span className="text-xs font-mono text-gray-400">{formatCurrency(item.priceAtSale)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-100 p-1">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-gray-50 rounded transition-colors text-slate-400"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-gray-50 rounded transition-colors text-slate-400"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-right min-w-[65px]">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(item.priceAtSale * item.quantity)}</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-gray-50/50 space-y-6 border-t border-gray-100">
          <div className="space-y-4">
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Assign Customer</label>
               <div className="flex items-center gap-2">
                  <select 
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    value={selectedCustomerId || ''}
                    onChange={e => setSelectedCustomerId(e.target.value || null)}
                  >
                    <option value="">Guest Walk-in</option>
                    {state.customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button className="p-2.5 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 text-slate-400 transition-colors shadow-sm">
                    <UserPlus size={18} />
                  </button>
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Promotion Code</label>
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                      <input 
                        type="text"
                        placeholder="SUMMER20..."
                        className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={couponCode}
                        onChange={e => {
                          setCouponCode(e.target.value.toUpperCase());
                          setDiscountError(null);
                        }}
                      />
                    </div>
                    <button 
                      onClick={applyDiscount}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold uppercase transition-colors hover:bg-slate-200"
                    >
                      Apply
                    </button>
                  </div>
                  {discountError && (
                    <div className="flex items-center gap-1.5 text-red-500 px-1">
                      <AlertCircle size={10} />
                      <span className="text-[9px] font-bold uppercase tracking-tight">{discountError}</span>
                    </div>
                  )}
                  {appliedDiscount && (
                    <div className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-700 uppercase">{appliedDiscount.code}</span>
                      </div>
                      <button onClick={() => setAppliedDiscount(null)} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                        <Minus size={14} />
                      </button>
                    </div>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider",
                  paymentMethod === 'cash' 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "bg-white border-gray-100 text-slate-500 hover:border-indigo-400 shadow-sm"
                )}
              >
                <Banknote size={16} />
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider",
                  paymentMethod === 'card' 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "bg-white border-gray-100 text-slate-500 hover:border-indigo-400 shadow-sm"
                )}
              >
                <CreditCard size={16} />
                Card
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-gray-200/50 pt-4">
            <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-tight">
              <span>Subtotal</span>
              <span className="text-slate-900">{formatCurrency(cartSubtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs font-semibold text-red-500 uppercase tracking-tight">
                <span>Discount ({appliedDiscount?.code})</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2">
              <span className="font-bold text-slate-800">Grand Total</span>
              <span className="text-2xl font-black text-indigo-600">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              cart.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-indigo-600 active:scale-[0.98] shadow-xl shadow-slate-200"
            )}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>Complete Transaction</>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.98, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 border border-gray-100"
            >
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800">Order Successful</h3>
                <p className="text-sm text-gray-400">Inventory levels have been adjusted automatically.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handlePrint}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all"
                >
                  <Printer size={16} />
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  New Transaction
                </button>
              </div>
            </motion.div>
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

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        {lastSale && <Receipt ref={receiptRef} sale={lastSale} state={state} />}
      </div>
    </div>
  );
}

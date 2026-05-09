/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { 
  Tag,
  ShieldCheck,
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Users, 
  RefreshCcw, 
  TrendingUp,
  Store,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, Role } from './types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_USERS, INITIAL_DISCOUNTS } from './constants';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import SalesPage from './pages/SalesPage';
import InventoryPage from './pages/InventoryPage';
import RestockPage from './pages/RestockPage';
import HistoryPage from './pages/HistoryPage';
import CustomersPage from './pages/CustomersPage';
import DiscountsPage from './pages/DiscountsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('stockflow_data');
    if (saved) return JSON.parse(saved);
    return {
      products: INITIAL_PRODUCTS,
      sales: [],
      restocks: [],
      customers: INITIAL_CUSTOMERS,
      discounts: INITIAL_DISCOUNTS,
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0], // Default as Admin for demo
    };
  });

  useEffect(() => {
    localStorage.setItem('stockflow_data', JSON.stringify(state));
  }, [state]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { title: 'New Sale', icon: ShoppingCart, path: '/sales', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { title: 'Products', icon: Package, path: '/inventory', roles: ['ADMIN', 'MANAGER'] },
    { title: 'Restock', icon: RefreshCcw, path: '/restock', roles: ['ADMIN', 'MANAGER'] },
    { title: 'Discounts', icon: Tag, path: '/discounts', roles: ['ADMIN', 'MANAGER'] },
    { title: 'History', icon: History, path: '/history', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { title: 'Customers', icon: Users, path: '/customers', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { title: 'Staff', icon: ShieldCheck, path: '/users', roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    state.currentUser && item.roles.includes(state.currentUser.role)
  );

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const switchUser = (role: Role) => {
    const user = INITIAL_USERS.find(u => u.role === role);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      setIsUserMenuOpen(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-gray-50 text-slate-900 font-sans overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform md:relative md:translate-x-0 font-sans",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  <Store size={20} />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-slate-800 uppercase">StockFlow</h1>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-500 hover:bg-gray-100 hover:text-slate-900"
                  )}
                >
                  <item.icon size={18} />
                  {item.title}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100 relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white overflow-hidden flex items-center justify-center font-bold text-indigo-600">
                    {state.currentUser?.name.charAt(0) || 'A'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold truncate max-w-[100px]">{state.currentUser?.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{state.currentUser?.role}</p>
                  </div>
                </div>
                <ChevronDown size={14} className={cn("text-gray-400 transition-transform", isUserMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60]"
                  >
                    <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch Role (Dev)</p>
                    {INITIAL_USERS.map(user => (
                      <button 
                        key={user.id}
                        onClick={() => switchUser(user.role)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="font-medium">{user.role}</span>
                        {state.currentUser?.role === user.role && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                      </button>
                    ))}
                    <div className="h-[1px] bg-gray-100 my-2" />
                    <button className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 font-medium">
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">StockFlow /</span>
              <span className="text-sm font-medium">Dashboard Overview</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="Search globally..." 
                  className="pl-10 pr-4 py-2 text-sm bg-gray-100 border-none rounded-full w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <Store className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              </div>
              <button className="md:hidden p-2 text-gray-400 hover:text-indigo-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </header>

          {/* Content Wrapper */}
          <div className="flex-1 p-8 overflow-y-auto w-full">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard state={state} />} />
                <Route path="/sales" element={<SalesPage state={state} setState={setState} />} />
                <Route path="/inventory" element={<InventoryPage state={state} setState={setState} />} />
                <Route path="/restock" element={<RestockPage state={state} setState={setState} />} />
                <Route path="/history" element={<HistoryPage state={state} />} />
                <Route path="/customers" element={<CustomersPage state={state} setState={setState} />} />
                <Route path="/discounts" element={<DiscountsPage state={state} setState={setState} />} />
                <Route path="/users" element={<UsersPage state={state} setState={setState} />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}


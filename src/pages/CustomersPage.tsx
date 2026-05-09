import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { AppState, Customer } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomersPage({ state, setState }: { 
  state: AppState; 
  setState: Dispatch<SetStateAction<AppState>> 
}) {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const filteredCustomers = state.customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleAddCustomer = () => {
    if (!newCustomer.name) return;

    const customer: Customer = {
      id: `c-${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      totalSpent: 0,
      lastPurchaseDate: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      customers: [customer, ...prev.customers]
    }));

    setIsAddModalOpen(false);
    setNewCustomer({ name: '', email: '', phone: '' });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Customer CRM</h1>
          <p className="text-sm text-gray-400">Manage client relationships and track purchasing behavior.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
        >
          <UserPlus size={20} />
          Append Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Reach</p>
            <p className="text-3xl font-black text-slate-800">{state.customers.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl border border-green-100">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Average Transaction</p>
            <p className="text-3xl font-black text-slate-800">
              {formatCurrency(state.customers.reduce((acc, c) => acc + c.totalSpent, 0) / (state.customers.length || 1))}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Filter by identifier, email, or contact..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-gray-50">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
              <div className="flex items-center gap-4 min-w-[300px]">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-xl font-black text-slate-400 border border-gray-100 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{customer.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <Mail size={12} className="text-indigo-400" />
                      {customer.email || 'No email registered'}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <Phone size={12} className="text-indigo-400" />
                      {customer.phone || 'No phone provided'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 flex-1 max-w-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <DollarSign size={10} className="text-green-500" />
                    LTV Yield
                  </div>
                  <p className="text-lg font-black text-slate-800">{formatCurrency(customer.totalSpent)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Calendar size={10} className="text-indigo-400" />
                    Latest Event
                  </div>
                  <p className="text-sm font-bold text-slate-600">{format(new Date(customer.lastPurchaseDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3">
                <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 opacity-0 group-hover:opacity-100 transition-all">
                  Profile
                  <ChevronRight size={14} />
                </button>
                <button className="p-2 text-gray-300 hover:text-slate-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-gray-200">
                 <Users size={40} strokeWidth={1} />
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No matching profiles found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
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
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 border border-gray-100"
            >
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Lead Onboarding</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Identity</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm"
                    placeholder="John Doe"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Electronic Route</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm"
                    placeholder="john@example.com"
                    value={newCustomer.email}
                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Contact Sequence</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm"
                    placeholder="+1 (000) 000-0000"
                    value={newCustomer.phone}
                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
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
                  onClick={handleAddCustomer}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  Append Global CRM
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

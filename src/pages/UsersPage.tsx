import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  ShieldCheck, 
  Trash2, 
  X,
  Mail,
  Shield,
  Clock,
  UserPlus
} from 'lucide-react';
import { AppState, User, Role } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface UsersPageProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export default function UsersPage({ state, setState }: UsersPageProps) {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'CASHIER'
  });

  const filteredUsers = state.users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;

    const user: User = {
      id: crypto.randomUUID(),
      name: newUser.name,
      email: newUser.email.toLowerCase(),
      role: newUser.role || 'CASHIER',
    };

    setState(prev => ({
      ...prev,
      users: [...prev.users, user]
    }));
    setIsAddModalOpen(false);
    setNewUser({ name: '', email: '', role: 'CASHIER' });
  };

  const deleteUser = (id: string) => {
    if (id === state.currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
  };

  const roles: Role[] = ['ADMIN', 'MANAGER', 'CASHIER'];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Staff Access Management</h1>
          <p className="text-sm text-gray-400">Manage internal roles, permissions, and operational access.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
        >
          <UserPlus size={20} />
          Onboard Staff
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Filter by name or identity..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-gray-50">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
              <div className="flex items-center gap-4 min-w-[300px]">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border font-black shadow-sm",
                  user.role === 'ADMIN' ? "bg-red-50 text-red-600 border-red-100" :
                  user.role === 'MANAGER' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                  "bg-gray-50 text-gray-400 border-gray-100"
                )}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {user.name}
                    {user.id === state.currentUser?.id && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-600 text-white rounded-full">YOU</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <Mail size={12} className="text-gray-300" />
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 flex-1 max-w-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Shield size={10} className="text-indigo-400" />
                    Security Role
                  </div>
                  <p className={cn(
                    "text-xs font-black uppercase tracking-widest",
                    user.role === 'ADMIN' ? "text-red-500" :
                    user.role === 'MANAGER' ? "text-indigo-500" :
                    "text-slate-500"
                  )}>{user.role}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Clock size={10} className="text-gray-300" />
                    Last Entry
                  </div>
                  <p className="text-xs font-bold text-slate-600">
                    {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, HH:mm') : 'No recent activity'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => deleteUser(user.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                title="Deauthorize staff"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
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
                <h3 className="text-xl font-bold text-slate-800">Assign Authority</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Legal Identity</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm"
                    placeholder="Full Name"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Professional Route</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm"
                    placeholder="email@stockflow.com"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Role Permission</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map(role => (
                      <button 
                        key={role}
                        onClick={() => setNewUser({ ...newUser, role })}
                        className={cn(
                          "py-2 px-1 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
                          newUser.role === role 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                            : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
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
                  onClick={handleAddUser}
                  disabled={!newUser.name || !newUser.email}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Grant Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

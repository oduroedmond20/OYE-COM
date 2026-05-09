import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { AppState } from '../types';
import { formatCurrency } from '../lib/utils';
import { subDays, format, isSameDay, startOfDay } from 'date-fns';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Package, DollarSign } from 'lucide-react';

export default function Dashboard({ state }: { state: AppState }) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const todaySales = state.sales.filter(s => isSameDay(new Date(s.timestamp), today));
    const todayRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);
    
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      const daySales = state.sales.filter(s => isSameDay(new Date(s.timestamp), date));
      return {
        name: format(date, 'MMM dd'),
        revenue: daySales.reduce((acc, s) => acc + s.total, 0),
        count: daySales.length
      };
    });

    const totalCustomers = state.customers.length;
    const lowStockItems = state.products.filter(p => p.stock < 10).length;

    return {
      todayRevenue,
      todaySalesCount: todaySales.length,
      totalCustomers,
      lowStockItems,
      chartData: last7Days
    };
  }, [state]);

  const cards = [
    { title: 'Today\'s Revenue', value: formatCurrency(stats.todayRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Today\'s Sales', value: stats.todaySalesCount, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Customers', value: stats.totalCustomers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Low Stock Alerts', value: stats.lowStockItems, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Dashboard Overview</h1>
        <p className="text-sm text-gray-400">Welcome back. Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
              <div className={cn("p-1.5 rounded-lg", card.bg)}>
                <card.icon className={card.color} size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between capitalize">
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <div className="flex items-center text-xs text-green-500 font-medium">
                <ArrowUpRight size={14} className="mr-0.5" />
                12%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800">Sales Performance</h3>
            <select className="text-xs bg-gray-50 border border-gray-200 rounded px-3 py-1.5 outline-none font-semibold text-slate-600">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Volume Trends</h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366F1" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
             <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1">Growth Tip</p>
             <p className="text-sm text-indigo-600 leading-relaxed">Your sales volume is up 12% compared to last Tuesday. Keep it up!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal cn helper for the component as well
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

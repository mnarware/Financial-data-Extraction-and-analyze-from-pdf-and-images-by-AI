
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, AreaChart, Area, Legend 
} from 'recharts';
import { Transaction, Summary } from '../types';

interface Props {
  transactions: Transaction[];
  summary: Summary;
  mode: 'overview' | 'spending' | 'income';
}

const Charts: React.FC<Props> = ({ transactions, summary, mode }) => {
  const barData = [
    { name: 'Spending', value: summary.total_spend, color: '#ef4444' },
    { name: 'Income', value: summary.total_received, color: '#10b981' },
  ];

  const trendData = [...transactions].reverse().map((t) => ({
    name: t.date,
    balance: t.balance,
    outflow: t.outflow,
    inflow: t.inflow,
    displayDate: new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }));

  const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (mode === 'overview') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl shadow-xl h-[400px]">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Balance Trend</h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [formatINR(value), 'Balance']}
              />
              <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel p-6 rounded-3xl shadow-xl h-[400px]">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Volume Mix</h4>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={barData}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={10}
                dataKey="value"
                stroke="none"
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatINR(v)} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (mode === 'spending') {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-8 rounded-[40px] shadow-2xl h-[450px]">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Spending Magnitude over Time</h4>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(v: number) => formatINR(v)}
              />
              <Bar dataKey="outflow" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (mode === 'income') {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-8 rounded-[40px] shadow-2xl h-[450px]">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Income Accumulation</h4>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(v: number) => formatINR(v)}
              />
              <Area type="stepAfter" dataKey="inflow" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
};

export default Charts;

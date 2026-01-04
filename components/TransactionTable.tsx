
import React from 'react';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

const TransactionTable: React.FC<Props> = ({ transactions }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);

  const exportToCSV = () => {
    const headers = ['Date', 'Payment Information', 'Outflow', 'Inflow', 'Balance'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.outflow,
      t.inflow,
      t.balance
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Statement_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // We use the browser's built-in print to PDF functionality as it is the most reliable
    // without introducing massive external libraries. We'll trigger a print of the table container.
    window.print();
  };

  return (
    <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-white/50 print:shadow-none print:border-none">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Transaction History</h3>
          <p className="text-sm text-slate-400 font-medium">Clear insights extracted from your document</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition font-semibold text-sm border border-indigo-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition font-semibold text-sm shadow-lg shadow-slate-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Save PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Information</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Transaction</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t, idx) => {
              const isDebit = t.outflow > 0;
              const isCredit = t.inflow > 0;
              const amount = isDebit ? t.outflow : t.inflow;
              
              return (
                <tr key={idx} className="hover:bg-indigo-50/30 transition group">
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap font-mono">{t.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">{t.description}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{isDebit ? 'Outgoing' : 'Incoming'}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm text-right font-black ${isDebit ? 'text-red-500' : isCredit ? 'text-emerald-500' : 'text-slate-900'}`}>
                    {isDebit ? `- ${formatCurrency(amount)}` : isCredit ? `+ ${formatCurrency(amount)}` : formatCurrency(0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-slate-700 bg-slate-50/30">{formatCurrency(t.balance)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
        <div className="p-20 text-center">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
             <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
           </div>
           <p className="text-slate-400 font-medium">No transaction data available</p>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;

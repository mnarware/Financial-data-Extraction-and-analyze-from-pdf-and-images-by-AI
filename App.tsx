
import React, { useState } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import TransactionTable from './components/TransactionTable';
import Charts from './components/Charts';
import { AppState, FileData } from './types';
import { extractFinancialData } from './services/geminiService';

type TabType = 'overview' | 'spending' | 'income' | 'transactions';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [state, setState] = useState<AppState>({
    isProcessing: false,
    result: null,
    error: null,
    tempFiles: [],
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) resolve(base64String);
        else reject(new Error("Failed to convert file to base64"));
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileData[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      try {
        const base64 = await fileToBase64(file);
        newFiles.push({ file, previewUrl, base64 });
      } catch (err) {
        console.error("Failed to process file:", file.name);
      }
    }

    setState(prev => ({ 
      ...prev,
      result: null, 
      error: null, 
      tempFiles: [...prev.tempFiles, ...newFiles]
    }));
  };

  const removeFile = (index: number) => {
    setState(prev => {
      const newFiles = [...prev.tempFiles];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return { ...prev, tempFiles: newFiles };
    });
  };

  const processFiles = async () => {
    if (state.tempFiles.length === 0) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await extractFinancialData(state.tempFiles);
      setState(prev => ({ ...prev, isProcessing: false, result }));
      setActiveTab('overview');
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: err.message || "An unexpected error occurred." 
      }));
    }
  };

  const TabButton = ({ id, label, icon }: { id: TabType, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-y-[-2px]' 
          : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-800 border border-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col relative z-10 print:bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Next-Gen Batch Processing</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.9]">
            Financial <br className="md:hidden" /><span className="text-indigo-600">Intelligence</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Consolidate your financial footprint across multiple accounts. 
            Upload, analyze, and visualize with surgical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Upload Hub */}
          <div className="lg:col-span-4 space-y-8 print:hidden">
            <div className="glass-panel p-8 rounded-[32px] shadow-2xl border border-white/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </div>
              <h2 className="text-xl font-black mb-6 text-slate-800 tracking-tight flex items-center gap-2">
                Document Hub
                <span className="px-2 py-0.5 bg-slate-100 text-[10px] rounded-md text-slate-500">SECURE</span>
              </h2>
              
              <div className="relative border-4 border-dashed border-slate-100 rounded-3xl p-8 hover:border-indigo-300 transition-all cursor-pointer group bg-white/50 hover:bg-white transition-all duration-300">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={state.isProcessing}
                />
                <div className="text-center relative z-0">
                  <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-md font-bold text-slate-800">Add Statements</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Multiple Images or PDFs</p>
                  <div className="mt-4 py-2.5 px-3 bg-red-50/50 rounded-xl border border-red-100/50">
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest text-center">
                      Non password protected only
                    </p>
                  </div>
                </div>
              </div>

              {state.tempFiles.length > 0 && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Processing Queue ({state.tempFiles.length})</p>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, tempFiles: [] }))}
                      className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {state.tempFiles.map((fileData, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/80 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {fileData.file.type.startsWith('image/') ? (
                            <img src={fileData.previewUrl} className="w-9 h-9 rounded-xl object-cover bg-slate-100 shadow-sm" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                            </div>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="text-[11px] font-black text-slate-800 truncate">{fileData.file.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{(fileData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={processFiles}
                    disabled={state.isProcessing || state.tempFiles.length === 0}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-[0px] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {state.isProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="uppercase tracking-widest text-xs">Computing...</span>
                      </div>
                    ) : 'LAUNCH EXTRACTION'}
                  </button>
                </div>
              )}
            </div>

            {state.error && (
              <div className="p-6 bg-rose-50/80 backdrop-blur rounded-3xl border border-rose-100 flex items-start space-x-4 animate-in zoom-in-95 shadow-xl shadow-rose-100/50">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-black text-rose-900 text-sm uppercase tracking-tight">System Fault</h4>
                  <p className="text-xs text-rose-700 mt-1 font-semibold leading-relaxed">{state.error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dashboard & Analysis */}
          <div className="lg:col-span-8 space-y-8">
            {state.isProcessing ? (
              <div className="glass-panel rounded-[48px] shadow-2xl p-24 flex flex-col items-center justify-center text-center h-[550px] border-white/40">
                <div className="relative mb-12">
                  <div className="w-24 h-24 border-[6px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Synthesizing Data</h3>
                <p className="text-slate-500 max-w-md mx-auto text-xl leading-relaxed font-medium">
                  Merging {state.tempFiles.length} data sources into a unified intelligent ledger.
                </p>
              </div>
            ) : state.result ? (
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-8">
                <div className="flex flex-wrap gap-4 mb-8 print:hidden">
                  <TabButton id="overview" label="Overview" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
                  <TabButton id="spending" label="Expenditure" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                  <TabButton id="income" label="Growth" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                  <TabButton id="transactions" label="Ledger" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
                </div>

                <div className="transition-all duration-700">
                  {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-6">
                      <SummaryCards summary={state.result.summary} />
                      <Charts transactions={state.result.transactions} summary={state.result.summary} mode="overview" />
                    </div>
                  )}
                  {activeTab === 'spending' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-6">
                      <div className="glass-panel p-8 rounded-[32px] border-l-[12px] border-rose-500 shadow-xl">
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">Consolidated Spending</h4>
                        <p className="text-slate-500 font-medium mt-1">Total aggregated outlays identified across all documents.</p>
                      </div>
                      <Charts transactions={state.result.transactions} summary={state.result.summary} mode="spending" />
                    </div>
                  )}
                  {activeTab === 'income' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-6">
                      <div className="glass-panel p-8 rounded-[32px] border-l-[12px] border-emerald-500 shadow-xl">
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">Inflow Analytics</h4>
                        <p className="text-slate-500 font-medium mt-1">Revenue streams and capital gains visualized.</p>
                      </div>
                      <Charts transactions={state.result.transactions} summary={state.result.summary} mode="income" />
                    </div>
                  )}
                  {activeTab === 'transactions' && (
                    <div className="animate-in fade-in slide-in-from-left-6">
                      <TransactionTable transactions={state.result.transactions} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-[48px] shadow-2xl p-24 flex flex-col items-center justify-center text-center h-[550px] border-white/50 border-2">
                <div className="w-36 h-36 bg-indigo-50 rounded-[44px] flex items-center justify-center mb-12 rotate-3 hover:rotate-0 transition-all duration-700 shadow-xl shadow-indigo-100/50">
                  <svg className="w-20 h-20 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">Intelligent Workspace</h3>
                <p className="text-slate-400 max-w-sm mx-auto text-xl font-medium leading-relaxed">
                  Provide your statements and we'll generate a high-fidelity financial dashboard.
                </p>
                <div className="mt-12 flex gap-6">
                  <div className="w-4 h-4 bg-indigo-200 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-indigo-100 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-4 h-4 bg-indigo-50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-20 mt-20 print:hidden relative overflow-hidden">
        {/* Decorative elements for footer */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px]"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Batch Extraction Engine V1.4</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                 <div className="flex flex-col items-center md:items-start group">
                    <div className="flex items-center gap-2.5 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="w-5 h-5 text-indigo-400">
                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Powered by</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="text-lg font-black italic tracking-tighter text-white/80">Google</span>
                       <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400 tracking-tighter">Gemini 3</span>
                    </div>
                 </div>
                 <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                 <div className="flex flex-col items-center md:items-start group cursor-default">
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5 group-hover:text-indigo-400 transition-colors">Visionary Lead Developer</p>
                   <p className="text-xl font-black tracking-tight text-white hover:text-indigo-400 hover:scale-[1.05] transition-all duration-500 ease-out cursor-pointer active:scale-95">
                     Manoj C. Narware
                   </p>
                 </div>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-end gap-5 opacity-40 hover:opacity-100 transition-opacity">
              <a 
                href="https://github.com/mnarware" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-all hover:scale-110"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/manoj-narware-8521b414b/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-all hover:scale-110"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
              </a>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <p>&copy; 2025 FinExtract AI Laboratories</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Architecture</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Intelligence</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

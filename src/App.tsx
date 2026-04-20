import { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  Line,
  Bar,
  Cell
} from 'recharts';
import { 
  History,
  LayoutDashboard,
  Users,
  Activity,
  MapPin,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from './lib/utils';
import { RAW_SALES_DATA } from './data';
import { BRANCH_MONTHLY_DATA } from './branchData';
import { SalesEntry } from './types';

export default function App() {
  const stats = useMemo(() => {
    const totalSales = RAW_SALES_DATA.reduce((acc, curr) => acc + curr.sales, 0);
    const aliaMallData = RAW_SALES_DATA.filter(d => d.mall === 'Al-Aliya Mall');
    const noorMallData = RAW_SALES_DATA.filter(d => d.mall === 'Al-Noor Mall');

    const getMallStats = (data: SalesEntry[]) => {
      const sales = data.reduce((acc, curr) => acc + curr.sales, 0);
      const days = data.length || 1;
      return {
        totalSales: sales,
        avgDailySales: sales / days
      };
    };

    return {
      totalSales,
      alia: getMallStats(aliaMallData),
      noor: getMallStats(noorMallData),
      all: RAW_SALES_DATA
    };
  }, []);

  const chartData = useMemo(() => {
    return stats.all.map(d => ({
      ...d,
      displayDate: format(parseISO(d.date), 'MMM d'),
      alia: d.mall === 'Al-Aliya Mall' ? d.sales : null,
      noor: d.mall === 'Al-Noor Mall' ? d.sales : null,
      aliaAtv: d.mall === 'Al-Aliya Mall' ? (d.atv || (d.sales / (d.transactions || 1))) : null,
      noorAtv: d.mall === 'Al-Noor Mall' ? (d.atv || (d.sales / (d.transactions || 1))) : null,
    }));
  }, [stats]);

  const branchSummary = useMemo(() => {
    const months = Array.from(new Set(BRANCH_MONTHLY_DATA.map(d => d.month))).sort();
    return months.map(m => {
      const alia = BRANCH_MONTHLY_DATA.find(d => d.month === m && d.mall === 'Al-Aliya Mall');
      const noor = BRANCH_MONTHLY_DATA.find(d => d.month === m && d.mall === 'Al-Noor Mall');
      return {
        month: format(parseISO(`${m}-01`), 'MMM yy'),
        aliaSales: alia?.totalSales || 0,
        noorSales: noor?.totalSales || 0,
        aliaVisitors: alia?.totalVisitors || 0,
        noorVisitors: noor?.totalVisitors || 0,
      };
    });
  }, []);

  const formatNumber = (val: number) => Math.round(val).toLocaleString('en-US');

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans selection:bg-indigo-50 leading-relaxed italic-text-none">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Simplified Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-500 mb-3">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Basma Al-Sahli Record</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-none">
              Basma Al-Sahli Record
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-semibold tracking-widest tracking-[0.1em] uppercase italic">Between 20-05-2025 and 19-04-2026</p>
          </div>
        </header>

        {/* 1. Trajectory Chart */}
        <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 italic">Individual Performance</h2>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 px-4">
              <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Al-Aliya</span>
              </div>
              <div className="flex items-center px-4 py-2 gap-2 text-slate-400 opacity-60">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Al-Noor</span>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="softAlia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="softNoor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 900 }} minTickGap={60} />
                <YAxis hide />
                <Tooltip 
                  formatter={(v: number) => [formatNumber(v), 'Sales']}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', padding: '20px' }} 
                  labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }} 
                />
                <Area type="monotone" dataKey="alia" stroke="#6366f1" strokeWidth={4} fill="url(#softAlia)" dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }} />
                <Area type="monotone" dataKey="noor" stroke="#10b981" strokeWidth={4} fill="url(#softNoor)" dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-50">
             <span className="w-12 h-px bg-slate-100" />
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] font-mono whitespace-nowrap">Transition Event: Nov 25, 2025</p>
             <span className="w-12 h-px bg-slate-100" />
          </div>
        </section>

        {/* 2. Branch Penetration Chart with Correct Totals */}
        <section className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="mb-14 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 italic mb-2">Monthly Sales</h2>
            </div>
            <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Audit Verification</p>
               <div className="text-sm font-bold text-emerald-600 uppercase tracking-widest leading-none flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                 Verified: Apr 2026
               </div>
            </div>
          </div>

          <div className="h-[550px] w-full bg-slate-50/30 rounded-[2.5rem] p-8 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={branchSummary} barGap={10}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6366f1', fontWeight: 900 }} tickFormatter={v => `${Math.round(v/1000).toLocaleString()}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} tickFormatter={v => `${Math.round(v).toLocaleString()} Vis.`} />
                <Tooltip 
                  formatter={(v: number, name: string) => [formatNumber(v), name.includes('Sales') ? 'Sales' : 'Visitors']}
                  contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.05)', padding: '24px' }} 
                  cursor={{fill: '#fff'}} 
                />
                <Legend verticalAlign="top" align="right" height={60} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingBottom: '30px', tracking: '0.2em' }} />
                
                <Bar yAxisId="left" dataKey="aliaSales" fill="#c7d2fe" name="Alia Sales" radius={[8, 8, 0, 0]} barSize={25} />
                <Bar yAxisId="left" dataKey="noorSales" fill="#a7f3d0" name="Noor Sales" radius={[8, 8, 0, 0]} barSize={25} />
                
                <Line yAxisId="right" type="monotone" dataKey="aliaVisitors" stroke="#6366f1" strokeWidth={5} dot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }} name="Alia Visitors" />
                <Line yAxisId="right" type="monotone" dataKey="noorVisitors" stroke="#10b981" strokeWidth={5} dot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} name="Noor Visitors" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. Simplified ATV Consistency only */}
        <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-indigo-50 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic">ATV</h3>
               </div>
            </div>
            <div className="h-[300px] w-full bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="displayDate" hide />
                  <Tooltip labelStyle={{ display: 'none' }} formatter={(v: number) => [`${formatNumber(v)}`, 'Record']} contentStyle={{ borderRadius: '24px', border: 'none shadow-2xl' }} />
                  <Area type="stepBefore" dataKey="aliaAtv" stroke="#6366f1" strokeWidth={4} fillOpacity={0.05} fill="#6366f1" dot={false} name="Alia ATV" />
                  <Area type="stepBefore" dataKey="noorAtv" stroke="#10b981" strokeWidth={4} fillOpacity={0.05} fill="#10b981" dot={false} name="Noor ATV" />
                </AreaChart>
               </ResponsiveContainer>
            </div>
        </section>

        {/* 4. Soft Executive Record Summary */}
        <footer className="pt-24 pb-24 space-y-16">
          <div className="flex flex-col items-center gap-6">
             <div className="h-px w-24 bg-slate-200" />
             <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.8em] font-mono text-center">Medina Institutional Data Summary | Confidential Audit</p>
          </div>
        </footer>

      </div>
    </div>
  );
}

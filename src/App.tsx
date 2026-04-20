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
  BarChart,
  Cell,
  LabelList
} from 'recharts';
import { 
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Clock,
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { cn } from './lib/utils';
import { RAW_SALES_DATA } from './data';
import { BRANCH_MONTHLY_DATA } from './branchData';
import { ATT_DATA } from './attendanceData';
import { SalesEntry } from './types';

export default function App() {
  const stats = useMemo(() => {
    const totalSales = RAW_SALES_DATA.reduce((acc, curr) => acc + curr.sales, 0);
    const aliaMallData = RAW_SALES_DATA.filter(d => d.mall === 'Al-Aliya Mall');
    const noorMallData = RAW_SALES_DATA.filter(d => d.mall === 'Al-Noor Mall');

    // Ramadan interval: 2026-02-18 to 2026-03-19
    const ramadanInterval = {
      start: parseISO('2026-02-18'),
      end: parseISO('2026-03-19')
    };

    const noorRamadanData = noorMallData.filter(d => 
      isWithinInterval(parseISO(d.date), ramadanInterval)
    );
    const noorNonRamadanData = noorMallData.filter(d => 
      !isWithinInterval(parseISO(d.date), ramadanInterval)
    );

    const getMallStats = (data: SalesEntry[]) => {
      const sales = data.reduce((acc, curr) => acc + curr.sales, 0);
      const days = data.filter(d => d.sales > 0).length || 1;
      const transactions = data.reduce((acc, curr) => acc + curr.transactions, 0);
      return {
        totalSales: sales,
        avgDailySales: sales / days,
        avgAtv: transactions > 0 ? (sales / transactions) : 0
      };
    };

    return {
      totalSales,
      alia: getMallStats(aliaMallData),
      noor: getMallStats(noorMallData),
      noorRamadan: getMallStats(noorRamadanData),
      noorNonRamadan: getMallStats(noorNonRamadanData),
      all: RAW_SALES_DATA
    };
  }, []);

  const averagesData = useMemo(() => [
    { name: 'Alia Avg', value: stats.alia.avgDailySales, color: '#6366f1' },
    { name: 'Noor (Reg)', value: stats.noorNonRamadan.avgDailySales, color: '#10b981' },
    { name: 'Noor (Ram)', value: stats.noorRamadan.avgDailySales, color: '#f59e0b' }
  ], [stats]);

  const atvData = useMemo(() => [
    { name: 'Alia ATV', value: stats.alia.avgAtv, color: '#6366f1' },
    { name: 'Noor ATV', value: stats.noor.avgAtv, color: '#10b981' }
  ], [stats]);

  const formatWithCommas = (val: number) => Math.round(val).toLocaleString('en-US');

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

  const attStats = useMemo(() => {
    const parseDuration = (dur: string) => {
      if (!dur || dur === '-' || dur === '00:00') return 0;
      const [h, m] = dur.split(':').map(Number);
      return h + m / 60;
    };

    const aliaAtt = ATT_DATA.filter(d => d.mall === 'Al-Aliya Mall' && d.status === 'حاضر');
    const noorAtt = ATT_DATA.filter(d => d.mall === 'Al-Noor Mall' && d.status === 'حاضر');

    const getAvgHours = (data: typeof ATT_DATA) => {
      const total = data.reduce((acc, curr) => acc + parseDuration(curr.totalHours), 0);
      return data.length > 0 ? (total / data.length) : 0;
    };

    return [
      { name: 'Alia Avg Hours', value: getAvgHours(aliaAtt), color: '#6366f1' },
      { name: 'Noor Avg Hours', value: getAvgHours(noorAtt), color: '#10b981' }
    ];
  }, []);

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
        <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 italic">Individual Performance</h2>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 px-4">
              <div className="flex items-center bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-indigo-100 shadow-sm gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span className="text-[9px] md:text-[10px] font-black uppercase text-indigo-600 tracking-widest">Al-Aliya</span>
              </div>
              <div className="flex items-center px-3 md:px-4 py-1.5 md:py-2 gap-2 text-slate-400 opacity-60">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Al-Noor</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
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

        {/* 2. Branch Penetration Chart (Responsive) */}
        <section className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="mb-10 md:mb-14 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 italic mb-2">Monthly Sales</h2>
            </div>
            <div className="bg-slate-50 px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-slate-100">
               <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Audit Verification</p>
               <div className="text-xs md:text-sm font-bold text-emerald-600 uppercase tracking-widest leading-none flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                 Verified: Apr 2026
               </div>
            </div>
          </div>

          <div className="h-[400px] md:h-[550px] w-full bg-slate-50/30 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={branchSummary} barGap={2} margin={{ left: -25, right: -15, top: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 900 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#6366f1', fontWeight: 900 }} tickFormatter={v => `${Math.round(v/1000)}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 900 }} tickFormatter={v => `${Math.round(v/1000)}k`} />
                <Tooltip 
                  formatter={(v: number, name: string) => [formatNumber(v), name.includes('Sales') ? 'Sales' : 'Visitors']}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.05)', padding: '16px' }} 
                  cursor={{fill: '#fff'}} 
                />
                <Legend 
                  verticalAlign="top" 
                  align="center" 
                  height={120} 
                  iconType="circle" 
                  layout="horizontal"
                  wrapperStyle={{ 
                    fontSize: '8px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    paddingBottom: '20px', 
                    width: '100%',
                    left: 0
                  }} 
                />
                
                <Bar yAxisId="left" dataKey="aliaSales" fill="#c7d2fe" name="Alia Sales" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar yAxisId="left" dataKey="noorSales" fill="#a7f3d0" name="Noor Sales" radius={[4, 4, 0, 0]} barSize={12} />
                
                <Line yAxisId="right" type="monotone" dataKey="aliaVisitors" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} name="Alia Visitors" />
                <Line yAxisId="right" type="monotone" dataKey="noorVisitors" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} name="Noor Visitors" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. Consolidated Performance Indices */}
        <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-slate-100 shadow-sm space-y-10 md:space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="p-4 md:p-5 bg-slate-900 rounded-[1.2rem] md:rounded-[1.5rem] shadow-xl shadow-slate-200">
              <Activity className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-900 italic leading-none">Operational Metrics</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] md:tracking-[0.3em]">Cross-Branch Analysis</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Daily Sales Averages */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Daily Averages</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={averagesData} layout="vertical" margin={{ left: -30, right: 40 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} 
                      width={80}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '20px', border: 'none' }} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                      <LabelList 
                        dataKey="value" 
                        position="right" 
                        formatter={formatWithCommas} 
                        style={{ fontSize: '10px', fontWeight: 900, fill: '#6366f1' }} 
                        offset={10}
                      />
                      {averagesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ATV Benchmarks */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">ATV Benchmarks</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={atvData} barSize={32}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                    <YAxis hide domain={[0, 'dataMax + 20']} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '20px', border: 'none' }} />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        formatter={(v: number) => Math.round(v)} 
                        style={{ fontSize: '10px', fontWeight: 900, fill: '#10b981' }} 
                      />
                      {atvData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shift Averages */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Working Hours</h3>
              </div>
              <div className="space-y-3">
                 {attStats.map((stat) => (
                    <div key={stat.name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                       <div>
                          <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{stat.name}</p>
                          <h4 className="text-lg font-black text-slate-900 leading-none">{stat.value.toFixed(1)} <span className="text-[10px] text-slate-300">Hrs</span></h4>
                       </div>
                       <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm" style={{ color: stat.color }}>
                          <Clock className="w-3.5 h-3.5" />
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Soft Executive Record Summary */}
        <footer className="pt-24 pb-24 space-y-16">
          <div className="flex flex-col items-center gap-6">
             <div className="h-px w-24 bg-slate-200" />
          </div>
        </footer>

      </div>
    </div>
  );
}

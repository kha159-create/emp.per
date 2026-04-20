export interface SalesEntry {
  date: string;
  sales: number;
  baseValue: number;
  percentage: number;
  transactions: number;
  atv: number;
  efficiency: number;
  mall: 'Al-Aliya Mall' | 'Al-Noor Mall' | 'None';
}

export interface BranchMonthlyData {
  month: string; // e.g., '2025-05'
  totalSales: number;
  totalVisitors: number;
  mall: 'Al-Aliya Mall' | 'Al-Noor Mall';
}

export interface MallStats {
  totalSales: number;
  totalTransactions: number;
  avgATV: number;
  avgEfficiency: number;
  daysActive: number;
  avgDailySales: number;
}

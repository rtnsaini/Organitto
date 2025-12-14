import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import StatsCard from '../components/StatsCard';
import InvestmentExpenseChart from '../components/InvestmentExpenseChart';
import ExpenseCategoryChart from '../components/ExpenseCategoryChart';
import ActivityFeed from '../components/ActivityFeed';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInvestments: 0,
    totalExpenses: 0,
    activeProducts: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  const monthlyData = [
    { month: 'Jul', investments: 85000, expenses: 52000 },
    { month: 'Aug', investments: 92000, expenses: 61000 },
    { month: 'Sep', investments: 78000, expenses: 48000 },
    { month: 'Oct', investments: 105000, expenses: 72000 },
    { month: 'Nov', investments: 118000, expenses: 68000 },
    { month: 'Dec', investments: 125000, expenses: 75000 },
  ];

  const categoryData = [
    { name: 'Raw Materials', value: 125000 },
    { name: 'Labor', value: 85000 },
    { name: 'Marketing', value: 42000 },
    { name: 'Packaging', value: 38000 },
    { name: 'Utilities', value: 28000 },
    { name: 'Other', value: 22000 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [investmentsRes, expensesRes, productsRes, activitiesRes] = await Promise.all([
        supabase
          .from('investments')
          .select('amount')
          .eq('user_id', user.id),
        supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id),
        supabase
          .from('products')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['planning', 'testing', 'production']),
        supabase
          .from('activity_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const totalInvestments = investmentsRes.data?.reduce(
        (sum, item) => sum + parseFloat(item.amount.toString()),
        0
      ) || 0;

      const totalExpenses = expensesRes.data?.reduce(
        (sum, item) => sum + parseFloat(item.amount.toString()),
        0
      ) || 0;

      setStats({
        totalInvestments,
        totalExpenses,
        activeProducts: productsRes.data?.length || 0,
      });

      setActivities(activitiesRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const netBalance = stats.totalInvestments - stats.totalExpenses;
  const netBalanceColor = netBalance >= 0 ? 'text-sage' : 'text-soft-red';

  return (
    <div className="page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="dashboard-hero">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="greeting">
                  Namaste, <span className="greeting-accent">{user?.name || 'User'}</span>
                </h1>
                <p className="date-time mt-1">{currentDate}</p>
                {user?.role === 'admin' && (
                  <div className="role-badge">
                    <Leaf className="w-3 h-3" />
                    <span>Admin</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-[#6B7280] text-[0.6875rem] uppercase tracking-wider font-medium mb-1">Net Balance</p>
                <p className={`text-2xl md:text-[1.875rem] font-semibold ${
                  netBalance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}>
                  ₹{netBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-container">
            <div className="stat-card hover-lift">
              <div className="label">Total Investments</div>
              <div className="number">₹{(stats.totalInvestments / 100000).toFixed(2)}L</div>
              <div className="trend positive mt-2">
                <span>↑</span>
                <span>12%</span>
                <span className="text-[#757575] text-xs ml-1">this month</span>
              </div>
            </div>

            <div className="stat-card hover-lift">
              <div className="label">Total Expenses</div>
              <div className="number">₹{(stats.totalExpenses / 100000).toFixed(2)}L</div>
              <div className="trend negative mt-2">
                <span>↓</span>
                <span>8%</span>
                <span className="text-[#757575] text-xs ml-1">vs last month</span>
              </div>
            </div>

            <div className="stat-card hover-lift">
              <div className="label">Net Balance</div>
              <div className={`number ${netBalance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                ₹{(Math.abs(netBalance) / 100000).toFixed(2)}L
              </div>
              <div className={`trend mt-2 ${netBalance >= 0 ? 'positive' : 'negative'}`}>
                <span>{netBalance >= 0 ? '↑' : '↓'}</span>
                <span>{netBalance >= 0 ? 'Positive' : 'Negative'}</span>
              </div>
            </div>

            <div className="stat-card hover-lift">
              <div className="label">Active Products</div>
              <div className="number">{stats.activeProducts}</div>
              <div className="trend mt-2 text-[#2D5016]">
                <span>●</span>
                <span>In Pipeline</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <InvestmentExpenseChart data={monthlyData} />
            <ExpenseCategoryChart data={categoryData} />
          </div>

        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}

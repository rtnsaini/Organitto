import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Receipt, TrendingUp, Scale, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import InvestmentExpenseChart from '../components/InvestmentExpenseChart';
import ExpenseCategoryChart from '../components/ExpenseCategoryChart';
import ActivityFeed from '../components/ActivityFeed';
import { FloatingLeaves } from '../components/ui/FloatingLeaves';
import { GlassCard } from '../components/ui/GlassCard';

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
    <div className="min-h-screen bg-[#0A1F0A] relative overflow-hidden">
      <FloatingLeaves />

      <Header />

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="dashboard-hero mb-8">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-2xl shadow-[0_8px_24px_rgba(255,215,0,0.4)]">
                  <Sparkles className="w-10 h-10 text-[#0A1F0A]" />
                </div>
                <div>
                  <h1 className="hero-greeting text-3xl md:text-5xl">
                    Namaste, {user?.name || 'User'}
                  </h1>
                  <p className="hero-subtitle mt-2">{currentDate}</p>
                  {user?.role === 'admin' && (
                    <div className="admin-badge mt-3">
                      <Leaf className="w-4 h-4" />
                      <span>Admin</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-[#9CA3AF] text-sm uppercase tracking-wider font-semibold">Net Balance</p>
                  <p className={`text-4xl font-black font-[JetBrains_Mono] bg-gradient-to-r ${
                    netBalance >= 0 ? 'from-[#10B981] to-[#059669]' : 'from-[#EF4444] to-[#DC2626]'
                  } bg-clip-text text-transparent`}>
                    ₹{netBalance.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-container">
            <div className="stat-card">
              <div className="label">Total Investments</div>
              <div className="number">₹{(stats.totalInvestments / 100000).toFixed(2)}L</div>
              <div className="trend mt-3">
                <span className="text-xl">↑</span>
                <span>12%</span>
                <span className="text-[#9CA3AF] text-xs ml-1">this month</span>
              </div>
              <div className="absolute top-6 right-6 opacity-20">
                <Leaf className="w-12 h-12 text-[#FFD700]" />
              </div>
            </div>

            <div className="stat-card">
              <div className="label">Total Expenses</div>
              <div className="number" style={{ background: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ₹{(stats.totalExpenses / 100000).toFixed(2)}L
              </div>
              <div className="trend mt-3" style={{ color: '#FB923C' }}>
                <span className="text-xl">↓</span>
                <span>8%</span>
                <span className="text-[#9CA3AF] text-xs ml-1">vs last month</span>
              </div>
              <div className="absolute top-6 right-6 opacity-20">
                <Receipt className="w-12 h-12 text-[#FB923C]" />
              </div>
            </div>

            <div className="stat-card">
              <div className="label">Net Balance</div>
              <div className="number" style={{
                background: netBalance >= 0 ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ₹{(Math.abs(netBalance) / 100000).toFixed(2)}L
              </div>
              <div className="trend mt-3" style={{ color: netBalance >= 0 ? '#10B981' : '#EF4444' }}>
                <span className="text-xl">{netBalance >= 0 ? '↑' : '↓'}</span>
                <span>{netBalance >= 0 ? 'Positive' : 'Negative'}</span>
              </div>
              <div className="absolute top-6 right-6 opacity-20">
                <Scale className="w-12 h-12 text-[#10B981]" />
              </div>
            </div>

            <div className="stat-card">
              <div className="label">Active Products</div>
              <div className="number" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stats.activeProducts}
              </div>
              <div className="trend mt-3" style={{ color: '#A78BFA' }}>
                <span className="text-xl">●</span>
                <span>In Pipeline</span>
              </div>
              <div className="absolute top-6 right-6 opacity-20">
                <TrendingUp className="w-12 h-12 text-[#A78BFA]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <InvestmentExpenseChart data={monthlyData} />
            <ExpenseCategoryChart data={categoryData} />
          </div>

          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}

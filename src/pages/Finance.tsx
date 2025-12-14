import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Receipt, PiggyBank, Calendar } from 'lucide-react';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import ExpenseCategoryChart from '../components/ExpenseCategoryChart';
import InvestmentExpenseChart from '../components/InvestmentExpenseChart';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ExpenseSummary {
  total: number;
  thisMonth: number;
  lastMonth: number;
  byCategory: { category: string; total: number }[];
}

interface InvestmentSummary {
  total: number;
  thisMonth: number;
  count: number;
}

export default function Finance() {
  const { user } = useAuth();
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    byCategory: []
  });
  const [investmentSummary, setInvestmentSummary] = useState<InvestmentSummary>({
    total: 0,
    thisMonth: 0,
    count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, [user?.id]);

  const fetchFinancialData = async () => {
    if (!user?.id) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;

      const thisMonthExpenses = expenses?.filter(e => new Date(e.expense_date) >= startOfMonth) || [];
      const lastMonthExpenses = expenses?.filter(
        e => new Date(e.expense_date) >= startOfLastMonth && new Date(e.expense_date) <= endOfLastMonth
      ) || [];

      const categoryTotals = expenses?.reduce((acc: any, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
        return acc;
      }, {}) || {};

      setExpenseSummary({
        total: expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
        thisMonth: thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        lastMonth: lastMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        byCategory: Object.entries(categoryTotals).map(([category, total]) => ({
          category,
          total: total as number
        }))
      });

      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .order('investment_date', { ascending: false });

      if (investmentsError) {
        console.error('Error fetching investments:', investmentsError);
      }

      const thisMonthInvestments = investments?.filter(i => new Date(i.investment_date) >= startOfMonth) || [];

      setInvestmentSummary({
        total: investments?.reduce((sum, i) => sum + parseFloat(i.amount), 0) || 0,
        thisMonth: thisMonthInvestments.reduce((sum, i) => sum + parseFloat(i.amount), 0),
        count: investments?.length || 0
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthChangePercent = expenseSummary.lastMonth > 0
    ? ((expenseSummary.thisMonth - expenseSummary.lastMonth) / expenseSummary.lastMonth) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-colored">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Finance Overview</h1>
              <p className="text-dark-brown/70 font-medium mt-1">Track expenses, investments, and financial insights</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Expenses"
            value={`₹${expenseSummary.total.toLocaleString()}`}
            icon={Receipt}
            trend={monthChangePercent > 0 ? 'up' : monthChangePercent < 0 ? 'down' : undefined}
            trendValue={`${Math.abs(monthChangePercent).toFixed(1)}% vs last month`}
            iconColor="bg-gradient-to-br from-red-500 to-pink-600"
          />
          <StatsCard
            title="This Month"
            value={`₹${expenseSummary.thisMonth.toLocaleString()}`}
            icon={Calendar}
            iconColor="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <StatsCard
            title="Investments"
            value={`₹${investmentSummary.total.toLocaleString()}`}
            icon={PiggyBank}
            trend="up"
            trendValue={`${investmentSummary.count} total`}
            iconColor="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Net Balance"
            value={`₹${(investmentSummary.total - expenseSummary.total).toLocaleString()}`}
            icon={TrendingUp}
            trend={investmentSummary.total > expenseSummary.total ? 'up' : 'down'}
            iconColor="bg-gradient-gold"
          />
        </div>

        {!loading && expenseSummary.byCategory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Expense by Category
              </h2>
              <ExpenseCategoryChart
                data={expenseSummary.byCategory.map(cat => ({
                  name: cat.category,
                  value: cat.total
                }))}
              />
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Monthly Overview
              </h2>
              <InvestmentExpenseChart
                data={[
                  {
                    month: 'Last Month',
                    investments: investmentSummary.total - investmentSummary.thisMonth,
                    expenses: expenseSummary.lastMonth
                  },
                  {
                    month: 'This Month',
                    investments: investmentSummary.thisMonth,
                    expenses: expenseSummary.thisMonth
                  }
                ]}
              />
            </div>
          </div>
        ) : !loading ? (
          <div className="glass-card p-8 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No financial data available yet</p>
            <p className="text-sm text-gray-400 mt-2">Add expenses and investments to see insights</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

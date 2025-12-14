import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Receipt, PiggyBank, Calendar, ArrowRight, FileText, Plus } from 'lucide-react';
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
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
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
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      const thisMonthExpenses = expenses?.filter(e => new Date(e.date) >= startOfMonth) || [];
      const lastMonthExpenses = expenses?.filter(
        e => new Date(e.date) >= startOfLastMonth && new Date(e.date) <= endOfLastMonth
      ) || [];

      const categoryTotals = expenses?.reduce((acc: any, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {}) || {};

      setExpenseSummary({
        total: expenses?.reduce((sum, e) => sum + e.amount, 0) || 0,
        thisMonth: thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
        lastMonth: lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
        byCategory: Object.entries(categoryTotals).map(([category, total]) => ({
          category,
          total: total as number
        }))
      });

      setRecentExpenses(expenses?.slice(0, 5) || []);

      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (investmentsError) throw investmentsError;

      const thisMonthInvestments = investments?.filter(i => new Date(i.date) >= startOfMonth) || [];

      setInvestmentSummary({
        total: investments?.reduce((sum, i) => sum + i.amount, 0) || 0,
        thisMonth: thisMonthInvestments.reduce((sum, i) => sum + i.amount, 0),
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/expenses/add"
            className="glass-card p-6 hover:shadow-soft-lg transition-all duration-300 group hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-colored group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1">Add Expense</h3>
                <p className="text-sm text-dark-brown/60">Record new expense</p>
              </div>
            </div>
          </Link>

          <Link
            to="/expenses"
            className="glass-card p-6 hover:shadow-soft-lg transition-all duration-300 group hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-colored group-hover:scale-110 transition-transform duration-300">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1">Expense List</h3>
                <p className="text-sm text-dark-brown/60">{recentExpenses.length} total expenses</p>
              </div>
            </div>
          </Link>

          <Link
            to="/expenses/reports"
            className="glass-card p-6 hover:shadow-soft-lg transition-all duration-300 group hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-colored group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1">Reports</h3>
                <p className="text-sm text-dark-brown/60">View detailed analytics</p>
              </div>
            </div>
          </Link>

          <Link
            to="/investments"
            className="glass-card p-6 hover:shadow-soft-lg transition-all duration-300 group hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-colored group-hover:scale-110 transition-transform duration-300">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1">Investments</h3>
                <p className="text-sm text-dark-brown/60">{investmentSummary.count} active</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Expense by Category
            </h2>
            <ExpenseCategoryChart />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Investment vs Expenses
            </h2>
            <InvestmentExpenseChart />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Recent Expenses
            </h2>
            <Link
              to="/expenses"
              className="flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors group"
            >
              View All
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            </div>
          ) : recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <Link
                  key={expense.id}
                  to={`/expenses/edit/${expense.id}`}
                  className="flex items-center justify-between p-4 bg-cream/50 rounded-xl hover:shadow-soft transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary/10 rounded-xl flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary group-hover:text-primary-dark transition-colors">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-dark-brown/60 font-medium">{expense.category}</span>
                        <span className="text-sm text-dark-brown/40">•</span>
                        <span className="text-sm text-dark-brown/60 font-medium">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-secondary">
                      ₹{expense.amount.toLocaleString()}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                      expense.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : expense.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {expense.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-4">No expenses recorded yet</p>
              <Link
                to="/expenses/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-semibold rounded-button hover:shadow-colored transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Add Your First Expense
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

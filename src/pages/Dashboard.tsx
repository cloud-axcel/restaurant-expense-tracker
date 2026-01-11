import { useMemo } from 'react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { format, subDays, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const Dashboard = () => {
  const { expenses } = useExpenses();

  const stats = useMemo(() => {
    const today = new Date();
    const last7Days = subDays(today, 7);

    const recentExpenses = expenses.filter((e) => {
      const expenseDate = parseISO(e.date);
      return isWithinInterval(expenseDate, {
        start: startOfDay(last7Days),
        end: endOfDay(today),
      });
    });

    const totalAmount = recentExpenses.reduce((sum, e) => sum + e.total, 0);
    const avgDaily = totalAmount / 7;
    const totalTransactions = recentExpenses.length;

    // Daily data for chart
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayExpenses = expenses.filter((e) => e.date === dateStr);
      const dayTotal = dayExpenses.reduce((sum, e) => sum + e.total, 0);

      dailyData.push({
        date: format(date, 'MMM dd'),
        total: dayTotal,
        count: dayExpenses.length,
      });
    }

    // Calculate trend
    const firstHalf = dailyData.slice(0, 3).reduce((sum, d) => sum + d.total, 0);
    const secondHalf = dailyData.slice(4).reduce((sum, d) => sum + d.total, 0);
    const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    return { totalAmount, avgDaily, totalTransactions, dailyData, trend };
  }, [expenses]);

  const allTimeTotal = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.total, 0);
  }, [expenses]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your restaurant expenses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">A${stats.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">A${stats.avgDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <p className="text-xs text-muted-foreground">Per day (last 7 days)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trend</CardTitle>
              {stats.trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.trend >= 0 ? '+' : ''}{stats.trend.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.trend >= 0 ? 'Spending increased' : 'Spending decreased'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Time Total</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">A${allTimeTotal.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{expenses.length} total expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Expenses - Last 7 Days</CardTitle>
            <CardDescription>Track your spending patterns over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {stats.dailyData.some((d) => d.total > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `A$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`A$${value.toLocaleString()}`, 'Total']}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No expense data for the past 7 days</p>
                    <p className="text-sm">Start adding expenses to see your chart</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;

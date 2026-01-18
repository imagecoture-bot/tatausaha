import { useMemo } from 'react';
import { DollarSign, Users, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Student, Transaction, BiayaAdministrasi } from '@/app/types';

interface DashboardPageProps {
  students: Student[];
  transactions: Transaction[];
  biayaAdmin: BiayaAdministrasi[];
}

export function DashboardPage({ students, transactions, biayaAdmin }: DashboardPageProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Daily
    const todayTransactions = transactions.filter(t => {
      const tDate = new Date(t.tanggal);
      return tDate.toDateString() === today.toDateString();
    });
    const dailyIncome = todayTransactions.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const dailyExpense = todayTransactions.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);

    // Monthly
    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.tanggal);
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });
    const monthlyIncome = monthlyTransactions.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const monthlyExpense = monthlyTransactions.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);

    // Yearly
    const yearlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.tanggal);
      return tDate.getFullYear() === thisYear;
    });
    const yearlyIncome = yearlyTransactions.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const yearlyExpense = yearlyTransactions.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);

    // Balance
    const totalIncome = transactions.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
    const totalExpense = transactions.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
    const currentBalance = totalIncome - totalExpense;

    // Students
    const totalStudents = students.length;
    const studentsWithArrears = students.filter(s => s.tunggakan > 0).length;
    const totalArrears = students.reduce((sum, s) => sum + s.tunggakan, 0);

    return {
      dailyIncome,
      dailyExpense,
      monthlyIncome,
      monthlyExpense,
      yearlyIncome,
      yearlyExpense,
      currentBalance,
      totalStudents,
      studentsWithArrears,
      totalArrears,
    };
  }, [students, transactions]);

  // Chart data for monthly income/expense trend
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.tanggal);
        return tDate.getMonth() === index && tDate.getFullYear() === currentYear;
      });
      
      const income = monthTransactions.filter(t => t.tipe === 'Pemasukan').reduce((sum, t) => sum + t.jumlah, 0);
      const expense = monthTransactions.filter(t => t.tipe === 'Pengeluaran').reduce((sum, t) => sum + t.jumlah, 0);
      
      return {
        name: month,
        Pemasukan: income,
        Pengeluaran: expense,
      };
    });
  }, [transactions]);

  // Pie chart data for fee categories
  const feeDistribution = useMemo(() => {
    return biayaAdmin.map(b => ({
      name: b.nama,
      value: b.jumlah,
    }));
  }, [biayaAdmin]);

  // Payment status distribution
  const paymentStatusData = useMemo(() => {
    const paidFull = students.filter(s => s.tunggakan === 0).length;
    const hasArrears = students.filter(s => s.tunggakan > 0).length;
    
    return [
      { name: 'Lunas', value: paidFull },
      { name: 'Tunggakan', value: hasArrears },
    ];
  }, [students]);

  const COLORS = ['#10b981', '#ef4444'];
  const FEE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.currentBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total saldo keseluruhan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.studentsWithArrears} siswa dengan tunggakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pemasukan bulanan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.monthlyExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pengeluaran bulanan</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Keuangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Harian (Hari Ini)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pemasukan:</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats.dailyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pengeluaran:</span>
                  <span className="font-medium text-red-600">{formatCurrency(stats.dailyExpense)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Selisih:</span>
                  <span className={`font-semibold ${stats.dailyIncome - stats.dailyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.dailyIncome - stats.dailyExpense)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bulanan (Bulan Ini)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pemasukan:</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats.monthlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pengeluaran:</span>
                  <span className="font-medium text-red-600">{formatCurrency(stats.monthlyExpense)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Selisih:</span>
                  <span className={`font-semibold ${stats.monthlyIncome - stats.monthlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.monthlyIncome - stats.monthlyExpense)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tahunan (Tahun Ini)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pemasukan:</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats.yearlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pengeluaran:</span>
                  <span className="font-medium text-red-600">{formatCurrency(stats.yearlyExpense)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Selisih:</span>
                  <span className={`font-semibold ${stats.yearlyIncome - stats.yearlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.yearlyIncome - stats.yearlyExpense)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pemasukan & Pengeluaran (Tahun 2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Pemasukan" fill="#10b981" />
                <Bar dataKey="Pengeluaran" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Pembayaran Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fee Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Biaya Administrasi Sekolah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {biayaAdmin.map((biaya) => (
                <div key={biaya.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{biaya.nama}</p>
                    <p className="text-sm text-gray-500">{biaya.keterangan}</p>
                  </div>
                  <span className="font-semibold text-blue-600">{formatCurrency(biaya.jumlah)}</span>
                </div>
              ))}
            </div>
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FEE_COLORS[index % FEE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arrears Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Tunggakan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Tunggakan</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalArrears)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Siswa dengan Tunggakan</p>
                <p className="text-2xl font-bold">{stats.studentsWithArrears} dari {stats.totalStudents}</p>
              </div>
            </div>
            
            {stats.studentsWithArrears > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Siswa dengan Tunggakan Tertinggi:</h4>
                {students
                  .filter(s => s.tunggakan > 0)
                  .sort((a, b) => b.tunggakan - a.tunggakan)
                  .slice(0, 5)
                  .map((student) => (
                    <div key={student.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{student.nama}</p>
                        <p className="text-sm text-gray-500">{student.kelas} - {student.nis}</p>
                      </div>
                      <span className="font-semibold text-red-600">{formatCurrency(student.tunggakan)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

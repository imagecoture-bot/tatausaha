import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Eye, ChevronDown, ChevronUp, FileText, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { LaporanRincianBiayaPage } from '@/app/components/admin/LaporanRincianBiayaPage';
import type { Student, Transaction, BiayaItem } from '@/app/types';

interface LaporanPageProps {
  students: Student[];
  transactions: Transaction[];
}

export function LaporanPage({ students, transactions }: LaporanPageProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate financial reports
  const financialReport = useMemo(() => {
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

    return {
      dailyIncome,
      dailyExpense,
      monthlyIncome,
      monthlyExpense,
      yearlyIncome,
      yearlyExpense,
      currentBalance,
    };
  }, [transactions]);

  // Get students with arrears
  const studentsWithArrears = useMemo(() => {
    return students
      .filter(s => s.tunggakan > 0)
      .sort((a, b) => b.tunggakan - a.tunggakan);
  }, [students]);

  // Calculate payment completion percentage
  const paymentStats = useMemo(() => {
    const totalExpected = students.reduce((sum, s) => sum + s.totalBiaya, 0);
    const totalPaid = students.reduce((sum, s) => sum + s.terbayar, 0);
    const totalArrears = students.reduce((sum, s) => sum + s.tunggakan, 0);
    const completionRate = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;
    
    const fullyPaid = students.filter(s => s.tunggakan === 0).length;
    const withArrears = students.filter(s => s.tunggakan > 0).length;

    return {
      totalExpected,
      totalPaid,
      totalArrears,
      completionRate,
      fullyPaid,
      withArrears,
    };
  }, [students]);

  // Recent income transactions
  const recentIncome = useMemo(() => {
    return transactions
      .filter(t => t.tipe === 'Pemasukan')
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Recent expense transactions
  const recentExpense = useMemo(() => {
    return transactions
      .filter(t => t.tipe === 'Pengeluaran')
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 5);
  }, [transactions]);

  // State to toggle visibility of detailed arrears
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  const toggleStudentDetail = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  return (
    <Tabs defaultValue="keuangan" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="keuangan" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Laporan Keuangan
        </TabsTrigger>
        <TabsTrigger value="rincian-biaya" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          Rincian Biaya Siswa
        </TabsTrigger>
      </TabsList>

      <TabsContent value="keuangan" className="space-y-6">
        {/* Current Balance */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 mb-1">Saldo Saat Ini</p>
                <h2 className="text-4xl font-bold">{formatCurrency(financialReport.currentBalance)}</h2>
              </div>
              <DollarSign className="h-16 w-16 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Financial Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Laporan Harian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pemasukan:</span>
                <span className="font-semibold text-green-600">{formatCurrency(financialReport.dailyIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pengeluaran:</span>
                <span className="font-semibold text-red-600">{formatCurrency(financialReport.dailyExpense)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold">Selisih:</span>
                <span className={`font-bold ${financialReport.dailyIncome - financialReport.dailyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialReport.dailyIncome - financialReport.dailyExpense)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Laporan Bulanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pemasukan:</span>
                <span className="font-semibold text-green-600">{formatCurrency(financialReport.monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pengeluaran:</span>
                <span className="font-semibold text-red-600">{formatCurrency(financialReport.monthlyExpense)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold">Selisih:</span>
                <span className={`font-bold ${financialReport.monthlyIncome - financialReport.monthlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialReport.monthlyIncome - financialReport.monthlyExpense)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Laporan Tahunan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pemasukan:</span>
                <span className="font-semibold text-green-600">{formatCurrency(financialReport.yearlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pengeluaran:</span>
                <span className="font-semibold text-red-600">{formatCurrency(financialReport.yearlyExpense)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold">Selisih:</span>
                <span className={`font-bold ${financialReport.yearlyIncome - financialReport.yearlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialReport.yearlyIncome - financialReport.yearlyExpense)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Income */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Pemasukan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentIncome.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Belum ada data pemasukan</p>
                ) : (
                  recentIncome.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{transaction.kategori}</p>
                        <p className="text-sm text-gray-500">{transaction.keterangan}</p>
                        {transaction.namaSiswa && (
                          <p className="text-xs text-gray-400 mt-1">Siswa: {transaction.namaSiswa}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="font-semibold text-green-600 whitespace-nowrap">
                        {formatCurrency(transaction.jumlah)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Pengeluaran Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentExpense.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Belum ada data pengeluaran</p>
                ) : (
                  recentExpense.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{transaction.kategori}</p>
                        <p className="text-sm text-gray-500">{transaction.keterangan}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="font-semibold text-red-600 whitespace-nowrap">
                        {formatCurrency(transaction.jumlah)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Rekapitulasi Administrasi Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Keseluruhan</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(paymentStats.totalExpected)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Terbayar</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(paymentStats.totalPaid)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Tunggakan</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(paymentStats.totalArrears)}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Persentase Pembayaran</span>
                  <span className="text-sm font-bold">{paymentStats.completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={paymentStats.completionRate} className="h-3" />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                  <span>{paymentStats.fullyPaid} siswa lunas</span>
                  <span>{paymentStats.withArrears} siswa dengan tunggakan</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arrears Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Rincian Tunggakan Per Siswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsWithArrears.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-green-600 font-medium">Tidak ada tunggakan! Semua siswa telah melunasi pembayaran.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Detail</TableHead>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Total Biaya</TableHead>
                      <TableHead>Terbayar</TableHead>
                      <TableHead>Tunggakan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsWithArrears.flatMap((student, index) => {
                      const rows = [
                        <TableRow key={student.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStudentDetail(student.id)}
                            >
                              {expandedStudents.has(student.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{student.nama}</TableCell>
                          <TableCell>{student.kelas}</TableCell>
                          <TableCell>{student.nis}</TableCell>
                          <TableCell>{formatCurrency(student.totalBiaya)}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(student.terbayar)}</TableCell>
                          <TableCell className="text-red-600 font-semibold">{formatCurrency(student.tunggakan)}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Menunggak</Badge>
                          </TableCell>
                        </TableRow>
                      ];

                      // Add expanded detail row if needed
                      if (expandedStudents.has(student.id) && student.rincianBiaya && student.rincianBiaya.length > 0) {
                        rows.push(
                          <TableRow key={`${student.id}-detail`} className="bg-blue-50">
                            <TableCell colSpan={9} className="p-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-gray-700 mb-3">Detail Rincian Biaya:</h4>
                                <div className="bg-white rounded-lg border overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Nama Biaya</th>
                                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Jumlah</th>
                                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Terbayar</th>
                                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Tunggakan</th>
                                        <th className="text-center py-2 px-4 font-semibold text-gray-700">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {student.rincianBiaya.map((item: BiayaItem, idx: number) => (
                                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          <td className="py-2 px-4">{item.namaBiaya}</td>
                                          <td className="text-right py-2 px-4">{formatCurrency(item.jumlah)}</td>
                                          <td className="text-right py-2 px-4 text-green-600 font-medium">
                                            {formatCurrency(item.terbayar)}
                                          </td>
                                          <td className="text-right py-2 px-4 text-red-600 font-medium">
                                            {formatCurrency(item.tunggakan)}
                                          </td>
                                          <td className="text-center py-2 px-4">
                                            <Badge 
                                              variant={item.status === 'Lunas' ? 'default' : 'destructive'}
                                              className="text-xs"
                                            >
                                              {item.status}
                                            </Badge>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return rows;
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rincian-biaya" className="space-y-6">
        <LaporanRincianBiayaPage students={students} />
      </TabsContent>
    </Tabs>
  );
}
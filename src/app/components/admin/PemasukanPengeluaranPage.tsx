import { useState } from 'react';
import { Plus, History, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import type { Transaction, Student } from '@/app/types';

interface PemasukanPengeluaranPageProps {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  students: Student[];
  setStudents: (students: Student[]) => void;
}

export function PemasukanPengeluaranPage({ 
  transactions, 
  setTransactions, 
  students, 
  setStudents 
}: PemasukanPengeluaranPageProps) {
  const [tipe, setTipe] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [kategori, setKategori] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!kategori || !jumlah || !tanggal) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const amount = parseFloat(jumlah);
    if (isNaN(amount) || amount <= 0) {
      alert('Jumlah harus berupa angka positif');
      return;
    }

    // Create new transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      tanggal,
      tipe,
      kategori,
      jumlah: amount,
      keterangan,
    };

    // If it's a student payment, update student's payment record
    if (tipe === 'Pemasukan' && selectedStudentId && selectedStudentId !== 'none') {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) {
        newTransaction.siswaId = student.id;
        newTransaction.namaSiswa = student.nama;

        // Update student's payment
        const updatedStudents = students.map(s => {
          if (s.id === selectedStudentId) {
            const newTerbayar = s.terbayar + amount;
            const newTunggakan = Math.max(0, s.totalBiaya - newTerbayar);
            return {
              ...s,
              terbayar: newTerbayar,
              tunggakan: newTunggakan,
            };
          }
          return s;
        });
        setStudents(updatedStudents);
      }
    }

    setTransactions([...transactions, newTransaction]);

    // Reset form
    setKategori('');
    setJumlah('');
    setKeterangan('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setSelectedStudentId('');

    alert('Transaksi berhasil ditambahkan!');
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      const transaction = transactions.find(t => t.id === transactionId);
      
      // If it's a student payment, revert the payment
      if (transaction && transaction.tipe === 'Pemasukan' && transaction.siswaId) {
        const updatedStudents = students.map(s => {
          if (s.id === transaction.siswaId) {
            const newTerbayar = Math.max(0, s.terbayar - transaction.jumlah);
            const newTunggakan = s.totalBiaya - newTerbayar;
            return {
              ...s,
              terbayar: newTerbayar,
              tunggakan: newTunggakan,
            };
          }
          return s;
        });
        setStudents(updatedStudents);
      }

      setTransactions(transactions.filter(t => t.id !== transactionId));
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="form">Tambah Transaksi</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Form Tab */}
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Tambah Pemasukan / Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipe">Tipe Transaksi *</Label>
                    <Select value={tipe} onValueChange={(value: 'Pemasukan' | 'Pengeluaran') => setTipe(value)}>
                      <SelectTrigger id="tipe">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                        <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tanggal">Tanggal *</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {tipe === 'Pemasukan' && (
                  <div>
                    <Label htmlFor="student">Pembayaran dari Siswa (Opsional)</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger id="student">
                        <SelectValue placeholder="Pilih siswa jika ini pembayaran siswa..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Bukan pembayaran siswa</SelectItem>
                        {students
                          .filter(s => s.tunggakan > 0)
                          .sort((a, b) => a.nama.localeCompare(b.nama))
                          .map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.nama} - {student.kelas} (Tunggakan: {formatCurrency(student.tunggakan)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Jika pembayaran dari siswa, data keuangan siswa akan otomatis diperbarui
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kategori">Kategori *</Label>
                    <Input
                      id="kategori"
                      placeholder="Contoh: SPP, Operasional, dll"
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="jumlah">Jumlah (Rp) *</Label>
                    <Input
                      id="jumlah"
                      type="number"
                      placeholder="Masukkan jumlah"
                      value={jumlah}
                      onChange={(e) => setJumlah(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="keterangan">Keterangan</Label>
                  <Textarea
                    id="keterangan"
                    placeholder="Masukkan keterangan transaksi..."
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Transaksi
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Riwayat Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">Belum ada transaksi</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead>Siswa</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(transaction.tanggal).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.tipe === 'Pemasukan' ? 'default' : 'destructive'}>
                              {transaction.tipe}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{transaction.kategori}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{transaction.keterangan}</TableCell>
                          <TableCell>
                            {transaction.namaSiswa ? (
                              <span className="text-sm text-blue-600">{transaction.namaSiswa}</span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-semibold ${transaction.tipe === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.tipe === 'Pemasukan' ? '+' : '-'}{formatCurrency(transaction.jumlah)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              Hapus
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {sortedTransactions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Pemasukan</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        transactions
                          .filter(t => t.tipe === 'Pemasukan')
                          .reduce((sum, t) => sum + t.jumlah, 0)
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Pengeluaran</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(
                        transactions
                          .filter(t => t.tipe === 'Pengeluaran')
                          .reduce((sum, t) => sum + t.jumlah, 0)
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Saldo</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        transactions
                          .filter(t => t.tipe === 'Pemasukan')
                          .reduce((sum, t) => sum + t.jumlah, 0) -
                        transactions
                          .filter(t => t.tipe === 'Pengeluaran')
                          .reduce((sum, t) => sum + t.jumlah, 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
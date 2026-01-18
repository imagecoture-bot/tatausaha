import { useState, useMemo, useEffect } from 'react';
import { Wallet, Edit, Trash2, Filter, Download, Settings, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import type { Student, Transaction, SPPBulanan } from '@/app/types';

interface InfaqBulananPageProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  sppBulanan: SPPBulanan[];
  setSppBulanan: (spp: SPPBulanan[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
}

export function InfaqBulananPage({ 
  students, 
  setStudents,
  sppBulanan, 
  setSppBulanan,
  transactions,
  setTransactions 
}: InfaqBulananPageProps) {
  const [selectedTab, setSelectedTab] = useState<'mukim' | 'non-mukim'>('mukim');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterTahun, setFilterTahun] = useState<string>('all');
  const [isKelolaDialogOpen, setIsKelolaDialogOpen] = useState(false);
  const [isNominalDialogOpen, setIsNominalDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Nominal Infaq State
  const [nominalInfaq, setNominalInfaq] = useState(() => {
    const saved = localStorage.getItem('nominalInfaq');
    return saved ? JSON.parse(saved) : {
      mukim: 600000,
      nonMukim: 400000
    };
  });

  useEffect(() => {
    localStorage.setItem('nominalInfaq', JSON.stringify(nominalInfaq));
  }, [nominalInfaq]);

  const [nominalFormData, setNominalFormData] = useState({
    mukim: nominalInfaq.mukim.toString(),
    nonMukim: nominalInfaq.nonMukim.toString()
  });

  // Form state for adding payment
  const [paymentFormData, setPaymentFormData] = useState({
    bulan: '',
    tahun: new Date().getFullYear().toString(),
    nominal: '',
    tanggalBayar: new Date().toISOString().split('T')[0],
    keterangan: '',
  });

  // Editing payment
  const [editingPayment, setEditingPayment] = useState<SPPBulanan | null>(null);
  const [editFormData, setEditFormData] = useState({
    bulan: '',
    tahun: '',
    nominal: '',
    terbayar: '',
    tanggalBayar: '',
    keterangan: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(y => y.toString());
  }, []);

  const getMonthName = (monthStr: string) => {
    const monthObj = months.find(m => m.value === monthStr);
    return monthObj?.label || '';
  };

  // Get unique kelas and tahun
  const uniqueKelas = useMemo(() => {
    return Array.from(new Set(students.map(s => s.kelas))).sort();
  }, [students]);

  const uniqueTahun = useMemo(() => {
    return Array.from(new Set(students.map(s => s.tahunAjaran))).sort();
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    const status = selectedTab === 'mukim' ? 'Mukim' : 'Non Mukim';
    return students.filter(s => {
      const matchStatus = s.status === status;
      const matchKelas = filterKelas === 'all' || s.kelas === filterKelas;
      const matchTahun = filterTahun === 'all' || s.tahunAjaran === filterTahun;
      return matchStatus && matchKelas && matchTahun;
    });
  }, [students, selectedTab, filterKelas, filterTahun]);

  // Calculate SPP data for each student
  const studentsWithSPP = useMemo(() => {
    return filteredStudents.map(student => {
      const payments = sppBulanan.filter(p => p.siswaId === student.id);
      const totalTerbayar = payments.reduce((sum, p) => sum + p.terbayar, 0);
      
      // Default expected payment: 12 months × nominal
      const nominalPerBulan = student.status === 'Mukim' ? nominalInfaq.mukim : nominalInfaq.nonMukim;
      const expectedTotal = 12 * nominalPerBulan; // Asumsi 12 bulan
      const tunggakan = Math.max(0, expectedTotal - totalTerbayar);

      return {
        ...student,
        pembayaranSPP: payments,
        totalSPPTerbayar: totalTerbayar,
        totalSPPTunggakan: tunggakan,
        jumlahPembayaran: payments.length,
        nominalPerBulan,
      };
    });
  }, [filteredStudents, sppBulanan, nominalInfaq]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSiswa = studentsWithSPP.length;
    const totalTerbayar = studentsWithSPP.reduce((sum, s) => sum + s.totalSPPTerbayar, 0);
    const totalTunggakan = studentsWithSPP.reduce((sum, s) => sum + s.totalSPPTunggakan, 0);
    const totalSeharusnya = totalTerbayar + totalTunggakan;
    const siswaLunas = studentsWithSPP.filter(s => s.totalSPPTunggakan === 0).length;
    const siswaBelumBayar = studentsWithSPP.filter(s => s.totalSPPTerbayar === 0).length;
    
    return {
      totalSiswa,
      totalSeharusnya,
      totalTerbayar,
      totalTunggakan,
      siswaLunas,
      siswaBelumBayar,
      persentaseLunas: totalSiswa > 0 ? Math.round((siswaLunas / totalSiswa) * 100) : 0,
    };
  }, [studentsWithSPP]);

  const handleOpenKelola = (student: Student) => {
    setSelectedStudent(student);
    setIsKelolaDialogOpen(true);
    resetPaymentForm();
    setEditingPayment(null);
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      bulan: '',
      tahun: new Date().getFullYear().toString(),
      nominal: '',
      tanggalBayar: new Date().toISOString().split('T')[0],
      keterangan: '',
    });
  };

  const handleAddPayment = () => {
    if (!selectedStudent) return;

    if (!paymentFormData.bulan || !paymentFormData.tahun || !paymentFormData.nominal) {
      toast.error('Harap lengkapi bulan, tahun, dan nominal pembayaran');
      return;
    }

    const nominal = parseFloat(paymentFormData.nominal);
    if (isNaN(nominal) || nominal <= 0) {
      toast.error('Nominal harus berupa angka positif');
      return;
    }

    // Check if payment for this month already exists
    const existingPayments = sppBulanan.filter(p => p.siswaId === selectedStudent.id);
    const duplicate = existingPayments.find(
      p => p.bulan === paymentFormData.bulan && p.tahunAjaran === selectedStudent.tahunAjaran
    );

    if (duplicate) {
      toast.error(`Pembayaran untuk ${getMonthName(paymentFormData.bulan)} ${selectedStudent.tahunAjaran} sudah ada`);
      return;
    }

    const newPayment: SPPBulanan = {
      id: `SPP-${Date.now()}`,
      siswaId: selectedStudent.id,
      namaSiswa: selectedStudent.nama,
      nis: selectedStudent.nis,
      kelas: selectedStudent.kelas,
      status: selectedStudent.status,
      bulan: paymentFormData.bulan,
      tahunAjaran: selectedStudent.tahunAjaran,
      jumlahSPP: nominal,
      terbayar: nominal,
      tunggakan: 0,
      statusPembayaran: 'Lunas',
      tanggalBayar: paymentFormData.tanggalBayar,
      keterangan: paymentFormData.keterangan,
    };

    setSppBulanan([...sppBulanan, newPayment]);

    // Create transaction
    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      siswaId: selectedStudent.id,
      namaSiswa: selectedStudent.nama,
      nis: selectedStudent.nis,
      kelas: selectedStudent.kelas,
      jumlah: nominal,
      tanggal: paymentFormData.tanggalBayar,
      waktu: new Date().toLocaleTimeString('id-ID'),
      jenisPembayaran: `SPP ${selectedStudent.status} - ${getMonthName(paymentFormData.bulan)} ${selectedStudent.tahunAjaran}`,
      keterangan: paymentFormData.keterangan || `Pembayaran SPP ${getMonthName(paymentFormData.bulan)} ${selectedStudent.tahunAjaran}`,
      status: 'success',
    };
    setTransactions([...transactions, newTransaction]);

    toast.success('Pembayaran SPP berhasil ditambahkan!');
    resetPaymentForm();
  };

  const handleEditPayment = (payment: SPPBulanan) => {
    setEditingPayment(payment);
    setEditFormData({
      bulan: payment.bulan,
      tahun: payment.tahunAjaran.split('/')[0], // Extract year from "2024/2025"
      nominal: payment.jumlahSPP.toString(),
      terbayar: payment.terbayar.toString(),
      tanggalBayar: payment.tanggalBayar || '',
      keterangan: payment.keterangan || '',
    });
  };

  const handleSaveEdit = () => {
    if (!selectedStudent || !editingPayment) return;

    const nominal = parseFloat(editFormData.nominal);
    if (isNaN(nominal) || nominal <= 0) {
      toast.error('Nominal harus berupa angka positif');
      return;
    }

    const terbayar = parseFloat(editFormData.terbayar);
    if (isNaN(terbayar) || terbayar < 0) {
      toast.error('Terbayar harus berupa angka non-negatif');
      return;
    }

    // Update all sppBulanan array, not just filtered ones
    const updatedSppBulanan = sppBulanan.map(p => 
      p.id === editingPayment.id 
        ? {
            ...p,
            bulan: editFormData.bulan,
            jumlahSPP: nominal,
            terbayar: terbayar,
            tunggakan: nominal - terbayar,
            statusPembayaran: (terbayar >= nominal ? 'Lunas' : terbayar > 0 ? 'Sebagian' : 'Belum Lunas') as 'Lunas' | 'Belum Lunas' | 'Sebagian',
            tanggalBayar: editFormData.tanggalBayar,
            keterangan: editFormData.keterangan,
          }
        : p
    );

    setSppBulanan(updatedSppBulanan);

    toast.success('Pembayaran SPP berhasil diupdate!');
    setEditingPayment(null);
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!selectedStudent) return;

    if (!confirm('Yakin ingin menghapus pembayaran ini?')) return;

    // Update all sppBulanan array, not just filtered ones
    const updatedSppBulanan = sppBulanan.filter(p => p.id !== paymentId);

    setSppBulanan(updatedSppBulanan);

    toast.success('Pembayaran SPP berhasil dihapus!');
  };

  const handleSaveNominal = () => {
    const mukim = parseFloat(nominalFormData.mukim);
    const nonMukim = parseFloat(nominalFormData.nonMukim);

    if (isNaN(mukim) || mukim <= 0) {
      toast.error('Nominal Infaq Mukim harus berupa angka positif');
      return;
    }

    if (isNaN(nonMukim) || nonMukim <= 0) {
      toast.error('Nominal Infaq Non Mukim harus berupa angka positif');
      return;
    }

    setNominalInfaq({ mukim, nonMukim });
    toast.success('Nominal Infaq Bulanan berhasil diperbarui!');
    setIsNominalDialogOpen(false);
  };

  const handleExportCSV = () => {
    const status = selectedTab === 'mukim' ? 'Mukim' : 'Non Mukim';
    let csvContent = `Data Infaq Bulanan (SPP) - Siswa ${status}\n\n`;
    csvContent += 'No,Nama Siswa,NIS,Kelas,Tahun Ajaran,Status,Total Terbayar,Total Tunggakan,Jumlah Pembayaran\n';
    
    studentsWithSPP.forEach((student, index) => {
      csvContent += `${index + 1},"${student.nama}","${student.nis}","${student.kelas}","${student.tahunAjaran}","${student.status}",${student.totalSPPTerbayar},${student.totalSPPTunggakan},${student.jumlahPembayaran}\n`;
    });

    csvContent += `\nTotal,,,,,${statistics.totalTerbayar},${statistics.totalTunggakan},\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infaq-spp-${status.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get current student payments for modal
  const currentPayments = selectedStudent ? (sppBulanan.filter(p => p.siswaId === selectedStudent.id) || []) : [];
  const currentTotalTerbayar = currentPayments.reduce((sum, p) => sum + p.terbayar, 0);
  const currentNominal = selectedStudent 
    ? (selectedStudent.status === 'Mukim' ? nominalInfaq.mukim : nominalInfaq.nonMukim)
    : 0;
  const currentExpectedTotal = 12 * currentNominal;
  const currentTunggakan = Math.max(0, currentExpectedTotal - currentTotalTerbayar);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                Infaq Bulanan (SPP)
              </CardTitle>
              <CardDescription>
                Kelola pembayaran SPP bulanan siswa - Input manual per siswa
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Dialog open={isNominalDialogOpen} onOpenChange={setIsNominalDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-purple-50 hover:bg-purple-100 border-purple-200">
                    <Settings className="h-4 w-4 mr-2" />
                    Atur Nominal Infaq
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Atur Nominal Infaq Bulanan</DialogTitle>
                    <DialogDescription>
                      Tetapkan nominal infaq bulanan untuk siswa Mukim dan Non Mukim
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Nominal Saat Ini:</p>
                      <div className="space-y-1">
                        <p className="text-sm text-blue-800">
                          • Siswa Mukim: <span className="font-bold">{formatCurrency(nominalInfaq.mukim)}</span>
                        </p>
                        <p className="text-sm text-blue-800">
                          • Siswa Non Mukim: <span className="font-bold">{formatCurrency(nominalInfaq.nonMukim)}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nominal-mukim">Nominal Infaq Siswa Mukim (Rp) *</Label>
                      <Input
                        id="nominal-mukim"
                        type="number"
                        value={nominalFormData.mukim}
                        onChange={(e) => setNominalFormData({ ...nominalFormData, mukim: e.target.value })}
                        placeholder="Contoh: 600000"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nominal-non-mukim">Nominal Infaq Siswa Non Mukim (Rp) *</Label>
                      <Input
                        id="nominal-non-mukim"
                        type="number"
                        value={nominalFormData.nonMukim}
                        onChange={(e) => setNominalFormData({ ...nominalFormData, nonMukim: e.target.value })}
                        placeholder="Contoh: 400000"
                        min="0"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveNominal} className="flex-1">
                        Simpan Perubahan
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsNominalDialogOpen(false)} 
                        className="flex-1"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Kelas</Label>
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {uniqueKelas.map(kelas => (
                    <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tahun Ajaran</Label>
              <Select value={filterTahun} onValueChange={setFilterTahun}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {uniqueTahun.map(tahun => (
                    <SelectItem key={tahun} value={tahun}>{tahun}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
              <p className="text-3xl font-bold text-blue-600">{statistics.totalSiswa}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Seharusnya</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(statistics.totalSeharusnya)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Terbayar</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(statistics.totalTerbayar)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Tunggakan</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(statistics.totalTunggakan)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Persentase Lunas</p>
              <p className="text-3xl font-bold text-indigo-700">{statistics.persentaseLunas}%</p>
              <p className="text-xs text-gray-500">{statistics.siswaLunas}/{statistics.totalSiswa} siswa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Mukim/Non Mukim */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'mukim' | 'non-mukim')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mukim">
            SPP Siswa Mukim ({formatCurrency(nominalInfaq.mukim)}/bulan)
          </TabsTrigger>
          <TabsTrigger value="non-mukim">
            SPP Siswa Non Mukim ({formatCurrency(nominalInfaq.nonMukim)}/bulan)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Pembayaran SPP Siswa {selectedTab === 'mukim' ? 'Mukim' : 'Non Mukim'}</CardTitle>
              <CardDescription>
                Klik tombol "Kelola Pembayaran" untuk input manual pembayaran SPP per siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Tahun Ajaran</TableHead>
                      <TableHead className="text-right">Total Terbayar</TableHead>
                      <TableHead className="text-right">Total Tunggakan</TableHead>
                      <TableHead className="text-center">Jumlah Bayar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsWithSPP.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          Tidak ada data siswa
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentsWithSPP.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{student.nama}</TableCell>
                          <TableCell>{student.nis}</TableCell>
                          <TableCell>{student.kelas}</TableCell>
                          <TableCell>{student.tahunAjaran}</TableCell>
                          <TableCell className="text-right font-semibold text-green-700">
                            {formatCurrency(student.totalSPPTerbayar)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-700">
                            {formatCurrency(student.totalSPPTunggakan)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{student.jumlahPembayaran} bulan</Badge>
                          </TableCell>
                          <TableCell>
                            {student.totalSPPTunggakan === 0 ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Lunas
                              </Badge>
                            ) : student.totalSPPTerbayar > 0 ? (
                              <Badge variant="secondary">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Sebagian
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Belum Bayar
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenKelola(student)}
                                className="bg-blue-50 hover:bg-blue-100"
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Kelola Pembayaran
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Kelola Pembayaran SPP */}
      <Dialog open={isKelolaDialogOpen} onOpenChange={setIsKelolaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Pembayaran SPP</DialogTitle>
            <DialogDescription>
              Input dan kelola pembayaran SPP untuk {selectedStudent?.nama}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Nama Siswa</p>
                    <p className="font-semibold">{selectedStudent.nama}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">NIS</p>
                    <p className="font-semibold">{selectedStudent.nis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Kelas</p>
                    <p className="font-semibold">{selectedStudent.kelas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <Badge variant={selectedStudent.status === 'Mukim' ? 'default' : 'secondary'}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-600 mb-1">Nominal/Bulan</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(currentNominal)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-600 mb-1">Total Terbayar</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(currentTotalTerbayar)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-600 mb-1">Tunggakan</p>
                    <p className="text-lg font-bold text-red-700">{formatCurrency(currentTunggakan)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Add Payment Form */}
              {!editingPayment && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base">Tambah Pembayaran Baru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="payment-bulan">Bulan *</Label>
                        <Select value={paymentFormData.bulan} onValueChange={(value) => setPaymentFormData({ ...paymentFormData, bulan: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih bulan..." />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map(month => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="payment-tahun">Tahun *</Label>
                        <Select value={paymentFormData.tahun} onValueChange={(value) => setPaymentFormData({ ...paymentFormData, tahun: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="payment-nominal">Nominal (Rp) *</Label>
                        <Input
                          id="payment-nominal"
                          type="number"
                          value={paymentFormData.nominal}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, nominal: e.target.value })}
                          placeholder="Masukkan nominal"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-tanggal">Tanggal Bayar *</Label>
                        <Input
                          id="payment-tanggal"
                          type="date"
                          value={paymentFormData.tanggalBayar}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, tanggalBayar: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="payment-keterangan">Keterangan</Label>
                      <Input
                        id="payment-keterangan"
                        value={paymentFormData.keterangan}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, keterangan: e.target.value })}
                        placeholder="Keterangan pembayaran (opsional)"
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleAddPayment} className="flex-1">
                        Tambah Pembayaran
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const nominal = selectedStudent.status === 'Mukim' ? nominalInfaq.mukim : nominalInfaq.nonMukim;
                          setPaymentFormData({ ...paymentFormData, nominal: nominal.toString() });
                        }}
                      >
                        Isi Nominal Default
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* List of Payments */}
              <div>
                <h3 className="font-semibold mb-3">Daftar Pembayaran ({currentPayments.length} bulan)</h3>
                {currentPayments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    Belum ada pembayaran. Tambahkan pembayaran baru di atas.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentPayments.map((payment) => (
                      <div key={payment.id} className={`p-4 border rounded-lg ${editingPayment?.id === payment.id ? 'bg-yellow-50 border-yellow-300' : 'bg-white'}`}>
                        {editingPayment?.id === payment.id ? (
                          // Edit Mode - Compact inline form
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-yellow-700">✏️ Mode Edit</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              <div>
                                <Label className="text-xs">Bulan *</Label>
                                <Select value={editFormData.bulan} onValueChange={(value) => setEditFormData({ ...editFormData, bulan: value })}>
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {months.map(month => (
                                      <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Tahun *</Label>
                                <Select value={editFormData.tahun} onValueChange={(value) => setEditFormData({ ...editFormData, tahun: value })}>
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {years.map(year => (
                                      <SelectItem key={year} value={year}>
                                        {year}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Nominal (Rp) *</Label>
                                <Input
                                  type="number"
                                  className="h-9"
                                  value={editFormData.nominal}
                                  onChange={(e) => setEditFormData({ ...editFormData, nominal: e.target.value })}
                                  min="0"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Tanggal Bayar *</Label>
                                <Input
                                  type="date"
                                  className="h-9"
                                  value={editFormData.tanggalBayar}
                                  onChange={(e) => setEditFormData({ ...editFormData, tanggalBayar: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Aksi</Label>
                                <div className="flex gap-1">
                                  <Button size="sm" onClick={handleSaveEdit} className="h-9 flex-1">
                                    ✓ Simpan
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingPayment(null)} className="h-9 flex-1">
                                    ✕ Batal
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Keterangan</Label>
                              <Input
                                className="h-9"
                                value={editFormData.keterangan}
                                onChange={(e) => setEditFormData({ ...editFormData, keterangan: e.target.value })}
                                placeholder="Keterangan pembayaran"
                              />
                            </div>
                          </div>
                        ) : (
                          // View Mode - Fixed height layout
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div>
                                <p className="text-xs text-gray-600">Periode</p>
                                <p className="font-semibold text-sm">{getMonthName(payment.bulan)} {payment.tahunAjaran}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Nominal</p>
                                <p className="font-semibold text-sm text-green-700">{formatCurrency(payment.jumlahSPP)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Tanggal Bayar</p>
                                <p className="font-semibold text-sm">{payment.tanggalBayar || '-'}</p>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <p className="text-xs text-gray-600">Keterangan</p>
                                <p className="text-sm truncate" title={payment.keterangan || '-'}>
                                  {payment.keterangan || '-'}
                                </p>
                              </div>
                              <div className="flex items-end">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEditPayment(payment)} className="h-9">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleDeletePayment(payment.id)} className="h-9">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsKelolaDialogOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
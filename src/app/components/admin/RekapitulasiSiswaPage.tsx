import { useState, useMemo } from 'react';
import { FileSpreadsheet, Download, Printer, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import type { Student, BiayaItem, BiayaAdministrasi } from '@/app/types';

interface RekapitulasiSiswaPageProps {
  students: Student[];
  biayaAdmin: BiayaAdministrasi[];
}

export function RekapitulasiSiswaPage({ students, biayaAdmin }: RekapitulasiSiswaPageProps) {
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterTahunAjaran, setFilterTahunAjaran] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get unique values for filters
  const uniqueKelas = useMemo(() => {
    return Array.from(new Set(students.map(s => s.kelas))).sort();
  }, [students]);

  const uniqueTahunAjaran = useMemo(() => {
    return Array.from(new Set(students.map(s => s.tahunAjaran))).sort();
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchKelas = filterKelas === 'all' || student.kelas === filterKelas;
      const matchTahun = filterTahunAjaran === 'all' || student.tahunAjaran === filterTahunAjaran;
      const matchStatus = filterStatus === 'all' || student.status === filterStatus;
      const matchSearch = searchQuery === '' || 
        student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nis.includes(searchQuery) ||
        student.nisn.includes(searchQuery);

      return matchKelas && matchTahun && matchStatus && matchSearch;
    });
  }, [students, filterKelas, filterTahunAjaran, filterStatus, searchQuery]);

  // Calculate total biaya administrasi masuk (from master data)
  const totalBiayaAdministrasiMasuk = useMemo(() => {
    return biayaAdmin.reduce((sum, biaya) => sum + biaya.jumlah, 0);
  }, [biayaAdmin]);

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    const jumlahSeharusnya = filteredStudents.reduce((sum, s) => sum + s.totalBiaya, 0);
    const jumlahPemasukan = filteredStudents.reduce((sum, s) => sum + s.terbayar, 0);
    const jumlahKekurangan = jumlahSeharusnya - jumlahPemasukan;
    
    return { jumlahSeharusnya, jumlahPemasukan, jumlahKekurangan };
  }, [filteredStudents]);

  const toggleStudentDetail = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const handleExportCSV = () => {
    let csvContent = 'No,Nama Siswa,NIS,NISN,Kelas,Status,Tahun Ajaran,Jumlah Seharusnya,Jumlah Pemasukan,Jumlah Kekurangan\n';
    
    filteredStudents.forEach((student, index) => {
      const kekurangan = student.totalBiaya - student.terbayar;
      csvContent += `${index + 1},"${student.nama}","${student.nis}","${student.nisn}","${student.kelas}","${student.status}","${student.tahunAjaran}",${student.totalBiaya},${student.terbayar},${kekurangan}\n`;
      
      // Add detail rows
      if (student.rincianBiaya && student.rincianBiaya.length > 0) {
        student.rincianBiaya.forEach(item => {
          csvContent += `,"${item.namaBiaya}","","","","","",${item.jumlah},${item.terbayar},${item.tunggakan}\n`;
        });
      }
    });

    // Add grand totals
    csvContent += `\nGRAND TOTAL,,,,,,,${grandTotals.jumlahSeharusnya},${grandTotals.jumlahPemasukan},${grandTotals.jumlahKekurangan}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekapitulasi-siswa-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6" />
                Rekapitulasi Siswa
              </CardTitle>
              <CardDescription>
                Rekapitulasi lengkap administrasi dan pembayaran setiap siswa
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Cetak
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
              <p className="text-3xl font-bold text-blue-600">{filteredStudents.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Jumlah Seharusnya</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(grandTotals.jumlahSeharusnya)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Jumlah Pemasukan</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(grandTotals.jumlahPemasukan)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Jumlah Kekurangan</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(grandTotals.jumlahKekurangan)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Biaya Administrasi Info */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Rincian Biaya Masuk (Master Data)</p>
              <p className="text-sm text-gray-500">Dari {biayaAdmin.length} jenis biaya administrasi</p>
            </div>
            <p className="text-3xl font-bold text-indigo-700">{formatCurrency(totalBiayaAdministrasiMasuk)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Select value={filterTahunAjaran} onValueChange={setFilterTahunAjaran}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {uniqueTahunAjaran.map(tahun => (
                    <SelectItem key={tahun} value={tahun}>{tahun}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Mukim">Mukim</SelectItem>
                  <SelectItem value="Non Mukim">Non Mukim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cari Siswa</Label>
              <Input
                placeholder="Nama, NIS, atau NISN"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Administrasi Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Detail</TableHead>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Jumlah Seharusnya</TableHead>
                  <TableHead className="text-right">Jumlah Pemasukan</TableHead>
                  <TableHead className="text-right">Jumlah Kekurangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredStudents.flatMap((student, index) => {
                      const kekurangan = student.totalBiaya - student.terbayar;
                      const rows = [
                        <TableRow key={student.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStudentDetail(student.id)}
                              disabled={!student.rincianBiaya || student.rincianBiaya.length === 0}
                            >
                              {student.rincianBiaya && student.rincianBiaya.length > 0 ? (
                                expandedStudents.has(student.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{student.nama}</TableCell>
                          <TableCell>{student.nis}</TableCell>
                          <TableCell>{student.nisn}</TableCell>
                          <TableCell>{student.kelas}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === 'Mukim' ? 'default' : 'secondary'}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-700">
                            {formatCurrency(student.totalBiaya)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-700">
                            {formatCurrency(student.terbayar)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-700">
                            {formatCurrency(kekurangan)}
                          </TableCell>
                        </TableRow>
                      ];

                      // Add expanded detail row if needed
                      if (expandedStudents.has(student.id) && student.rincianBiaya && student.rincianBiaya.length > 0) {
                        rows.push(
                          <TableRow key={`${student.id}-detail`} className="bg-blue-50">
                            <TableCell colSpan={10} className="p-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-gray-700 mb-3">Perincian Administrasi:</h4>
                                <div className="bg-white rounded-lg border overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">No</th>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Nama Biaya</th>
                                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Jumlah Seharusnya</th>
                                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Pemasukan Terbayar</th>
                                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Kekurangan</th>
                                        <th className="text-center py-2 px-4 font-semibold text-gray-700">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {student.rincianBiaya.map((item: BiayaItem, idx: number) => (
                                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          <td className="py-2 px-4">{idx + 1}</td>
                                          <td className="py-2 px-4">{item.namaBiaya}</td>
                                          <td className="text-right py-2 px-4 font-medium text-blue-700">
                                            {formatCurrency(item.jumlah)}
                                          </td>
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
                                      {/* Subtotal for this student */}
                                      <tr className="bg-blue-100 font-semibold border-t-2 border-blue-300">
                                        <td colSpan={2} className="py-2 px-4 text-right">TOTAL PEMASUKAN:</td>
                                        <td className="text-right py-2 px-4 text-blue-700">
                                          {formatCurrency(student.totalBiaya)}
                                        </td>
                                        <td className="text-right py-2 px-4 text-green-700">
                                          {formatCurrency(student.terbayar)}
                                        </td>
                                        <td className="text-right py-2 px-4 text-red-700">
                                          {formatCurrency(student.tunggakan)}
                                        </td>
                                        <td></td>
                                      </tr>
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
                    
                    {/* Grand Total Row */}
                    <TableRow className="bg-gradient-to-r from-indigo-100 to-blue-100 border-t-4 border-indigo-300">
                      <TableCell colSpan={7} className="font-bold text-right text-lg py-4">
                        GRAND TOTAL:
                      </TableCell>
                      <TableCell className="text-right font-bold text-xl text-blue-700 py-4">
                        {formatCurrency(grandTotals.jumlahSeharusnya)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xl text-green-700 py-4">
                        {formatCurrency(grandTotals.jumlahPemasukan)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xl text-red-700 py-4">
                        {formatCurrency(grandTotals.jumlahKekurangan)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

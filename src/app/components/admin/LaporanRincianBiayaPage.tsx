import { useState, useMemo } from 'react';
import { FileText, Download, Filter, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import type { Student, BiayaItem } from '@/app/types';

interface LaporanRincianBiayaPageProps {
  students: Student[];
}

export function LaporanRincianBiayaPage({ students }: LaporanRincianBiayaPageProps) {
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
      const matchStatus = filterStatus === 'all' || 
        (filterStatus === 'lunas' && student.tunggakan === 0) ||
        (filterStatus === 'belum-lunas' && student.tunggakan > 0);
      const matchSearch = searchQuery === '' || 
        student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nis.includes(searchQuery) ||
        student.nisn.includes(searchQuery);

      return matchKelas && matchTahun && matchStatus && matchSearch;
    });
  }, [students, filterKelas, filterTahunAjaran, filterStatus, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalBiaya = filteredStudents.reduce((sum, s) => sum + s.totalBiaya, 0);
    const totalTerbayar = filteredStudents.reduce((sum, s) => sum + s.terbayar, 0);
    const totalTunggakan = filteredStudents.reduce((sum, s) => sum + s.tunggakan, 0);
    return { totalBiaya, totalTerbayar, totalTunggakan };
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
    let csvContent = 'No,Nama Siswa,Kelas,NIS,NISN,Status,Tahun Ajaran,Total Biaya,Terbayar,Tunggakan,Status Pembayaran\n';
    
    filteredStudents.forEach((student, index) => {
      csvContent += `${index + 1},"${student.nama}","${student.kelas}","${student.nis}","${student.nisn}","${student.status}","${student.tahunAjaran}",${student.totalBiaya},${student.terbayar},${student.tunggakan},"${student.tunggakan === 0 ? 'Lunas' : 'Belum Lunas'}"\n`;
      
      // Add detail rows
      if (student.rincianBiaya && student.rincianBiaya.length > 0) {
        student.rincianBiaya.forEach(item => {
          csvContent += `,"${item.namaBiaya}","","","","","",${item.jumlah},${item.terbayar},${item.tunggakan},"${item.status}"\n`;
        });
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-rincian-biaya-${new Date().toISOString().split('T')[0]}.csv`;
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
                <FileText className="h-6 w-6" />
                Laporan Rincian Biaya Per Siswa
              </CardTitle>
              <CardDescription>
                Laporan lengkap rincian biaya administrasi setiap siswa
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Biaya</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(totals.totalBiaya)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Terbayar</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totals.totalTerbayar)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Tunggakan</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.totalTunggakan)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <Label>Status Pembayaran</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="belum-lunas">Belum Lunas</SelectItem>
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
          <CardTitle>Detail Rincian Biaya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Detail</TableHead>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Biaya</TableHead>
                  <TableHead className="text-right">Terbayar</TableHead>
                  <TableHead className="text-right">Tunggakan</TableHead>
                  <TableHead>Status</TableHead>
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
                  filteredStudents.flatMap((student, index) => {
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
                        <TableCell>{student.kelas}</TableCell>
                        <TableCell>{student.nis}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'Mukim' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(student.totalBiaya)}</TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">{formatCurrency(student.terbayar)}</TableCell>
                        <TableCell className="text-right text-red-600 font-semibold">{formatCurrency(student.tunggakan)}</TableCell>
                        <TableCell>
                          <Badge variant={student.tunggakan === 0 ? 'default' : 'destructive'}>
                            {student.tunggakan === 0 ? 'Lunas' : 'Belum Lunas'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ];

                    // Add expanded detail row if needed
                    if (expandedStudents.has(student.id) && student.rincianBiaya && student.rincianBiaya.length > 0) {
                      rows.push(
                        <TableRow key={`${student.id}-detail`} className="bg-blue-50">
                          <TableCell colSpan={10} className="p-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm text-gray-700 mb-3">Detail Rincian Biaya:</h4>
                              <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="text-left py-2 px-4 font-semibold text-gray-700">No</th>
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
                                        <td className="py-2 px-4">{idx + 1}</td>
                                        <td className="py-2 px-4">{item.namaBiaya}</td>
                                        <td className="text-right py-2 px-4 font-medium">{formatCurrency(item.jumlah)}</td>
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
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

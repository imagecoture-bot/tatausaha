import { useState, useMemo } from 'react';
import { Search, Filter, Eye, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { KelolaRincianBiayaModal } from '@/app/components/admin/KelolaRincianBiayaModal';
import type { Student, BiayaItem } from '@/app/types';

interface DataSiswaPageProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

export function DataSiswaPage({ students, setStudents }: DataSiswaPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterTahun, setFilterTahun] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRincianBiayaOpen, setIsRincianBiayaOpen] = useState(false);
  const [studentForRincian, setStudentForRincian] = useState<Student | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get unique values for filters
  const uniqueKelas = useMemo(() => {
    const kelasSet = new Set(students.map(s => s.kelas));
    return Array.from(kelasSet).sort();
  }, [students]);

  const uniqueTahun = useMemo(() => {
    const tahunSet = new Set(students.map(s => s.tahunAjaran));
    return Array.from(tahunSet).sort().reverse();
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch = 
        student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nisn.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchKelas = filterKelas === 'all' || student.kelas === filterKelas;
      const matchTahun = filterTahun === 'all' || student.tahunAjaran === filterTahun;
      const matchStatus = filterStatus === 'all' || student.status === filterStatus;

      return matchSearch && matchKelas && matchTahun && matchStatus;
    });
  }, [students, searchQuery, filterKelas, filterTahun, filterStatus]);

  // Group students by class
  const studentsByClass = useMemo(() => {
    const grouped: { [key: string]: Student[] } = {};
    filteredStudents.forEach(student => {
      if (!grouped[student.kelas]) {
        grouped[student.kelas] = [];
      }
      grouped[student.kelas].push(student);
    });
    return grouped;
  }, [filteredStudents]);

  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleEditRincianBiaya = (student: Student) => {
    setStudentForRincian(student);
    setIsRincianBiayaOpen(true);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedStudents = students.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    );
    setStudents(updatedStudents);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Data Siswa</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total: {filteredStudents.length} siswa
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Label>Cari Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nama, NIS, atau NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Students by Class */}
      {Object.keys(studentsByClass).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Tidak ada data siswa yang ditemukan</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(studentsByClass).sort().map(([kelas, siswaList]) => (
          <Card key={kelas}>
            <CardHeader>
              <CardTitle>
                Kelas {kelas}
                <Badge variant="secondary" className="ml-3">{siswaList.length} siswa</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>NISN</TableHead>
                      <TableHead>Alamat</TableHead>
                      <TableHead>Nama Orang Tua</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tahun Ajaran</TableHead>
                      <TableHead>Tunggakan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsByClass[kelas].map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{student.nama}</TableCell>
                        <TableCell>{student.nis}</TableCell>
                        <TableCell>{student.nisn}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{student.alamat}</TableCell>
                        <TableCell>{student.namaOrangTua || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'Mukim' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.tahunAjaran}</TableCell>
                        <TableCell>
                          <span className={student.tunggakan > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                            {formatCurrency(student.tunggakan)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRincianBiaya(student)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Detail Siswa</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Nama Lengkap</Label>
                  <p className="font-medium mt-1">{selectedStudent.nama}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Kelas</Label>
                  <p className="font-medium mt-1">{selectedStudent.kelas}</p>
                </div>
                <div>
                  <Label className="text-gray-500">NIS</Label>
                  <p className="font-medium mt-1">{selectedStudent.nis}</p>
                </div>
                <div>
                  <Label className="text-gray-500">NISN</Label>
                  <p className="font-medium mt-1">{selectedStudent.nisn}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Alamat</Label>
                  <p className="font-medium mt-1">{selectedStudent.alamat}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Nama Orang Tua/Wali</Label>
                  <p className="font-medium mt-1">{selectedStudent.namaOrangTua || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <p className="font-medium mt-1">
                    <Badge variant={selectedStudent.status === 'Mukim' ? 'default' : 'secondary'}>
                      {selectedStudent.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Tahun Ajaran</Label>
                  <p className="font-medium mt-1">{selectedStudent.tahunAjaran}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Rincian Keuangan</h4>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Biaya:</span>
                    <span className="font-semibold">{formatCurrency(selectedStudent.totalBiaya)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terbayar:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedStudent.terbayar)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Tunggakan:</span>
                    <span className={`font-bold text-lg ${selectedStudent.tunggakan > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedStudent.tunggakan)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rincian Biaya Detail */}
              {selectedStudent.rincianBiaya && Array.isArray(selectedStudent.rincianBiaya) && selectedStudent.rincianBiaya.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Rincian Detail Biaya</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Biaya</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                          <TableHead className="text-right">Terbayar</TableHead>
                          <TableHead className="text-right">Tunggakan</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStudent.rincianBiaya.map((item: BiayaItem) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.namaBiaya}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.jumlah)}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(item.terbayar)}</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(item.tunggakan)}</TableCell>
                            <TableCell>
                              <Badge variant={item.status === 'Lunas' ? 'default' : 'destructive'} className="text-xs">
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Kelola Rincian Biaya Modal */}
      <KelolaRincianBiayaModal
        isOpen={isRincianBiayaOpen}
        onClose={() => setIsRincianBiayaOpen(false)}
        student={studentForRincian}
        onUpdateStudent={handleUpdateStudent}
      />
    </div>
  );
}
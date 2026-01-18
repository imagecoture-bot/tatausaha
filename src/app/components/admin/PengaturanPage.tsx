import { useState } from 'react';
import { Settings as SettingsIcon, Plus, Pencil, Trash2, Upload, Download, DollarSign, FileSpreadsheet, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { ImportDataModal } from '@/app/components/admin/ImportDataModal';
import { EditStudentModal } from '@/app/components/admin/EditStudentModal';
import { RincianBiayaModal } from '@/app/components/admin/RincianBiayaModal';
import { toast } from 'sonner';
import type { Student, BiayaAdministrasi, BiayaItem } from '@/app/types';

interface PengaturanPageProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  biayaAdmin: BiayaAdministrasi[];
  setBiayaAdmin: (biaya: BiayaAdministrasi[]) => void;
}

export function PengaturanPage({ students, setStudents, biayaAdmin, setBiayaAdmin }: PengaturanPageProps) {
  // Student Form State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRincianBiayaOpen, setIsRincianBiayaOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [managingBiayaStudent, setManagingBiayaStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    nama: '',
    kelas: '',
    nis: '',
    nisn: '',
    alamat: '',
    namaOrangTua: '',
    status: 'Non Mukim' as 'Mukim' | 'Non Mukim',
    tahunAjaran: '2024/2025',
    totalBiaya: '',
  });

  // Biaya Form State
  const [isAddBiayaOpen, setIsAddBiayaOpen] = useState(false);
  const [isEditBiayaOpen, setIsEditBiayaOpen] = useState(false);
  const [editingBiaya, setEditingBiaya] = useState<BiayaAdministrasi | null>(null);
  const [biayaForm, setBiayaForm] = useState({
    nama: '',
    jumlah: '',
    keterangan: '',
  });

  // Rekapitulasi State
  const [showRekapitulasi, setShowRekapitulasi] = useState(false);
  const [rekapFilterKelas, setRekapFilterKelas] = useState<string>('all');
  const [rekapFilterTahun, setRekapFilterTahun] = useState<string>('all');
  const [rekapFilterStatus, setRekapFilterStatus] = useState<string>('all');
  const [rekapSearchQuery, setRekapSearchQuery] = useState('');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddStudent = () => {
    if (!studentForm.nama || !studentForm.kelas || !studentForm.nis || !studentForm.nisn || !studentForm.totalBiaya) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const totalBiaya = parseFloat(studentForm.totalBiaya);
    if (isNaN(totalBiaya) || totalBiaya < 0) {
      alert('Total biaya harus berupa angka positif');
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      nama: studentForm.nama,
      kelas: studentForm.kelas,
      nis: studentForm.nis,
      nisn: studentForm.nisn,
      alamat: studentForm.alamat,
      namaOrangTua: studentForm.namaOrangTua,
      status: studentForm.status,
      tahunAjaran: studentForm.tahunAjaran,
      totalBiaya,
      terbayar: 0,
      tunggakan: totalBiaya,
      rincianBiaya: [], // Initialize with empty array
    };

    setStudents([...students, newStudent]);
    setIsAddStudentOpen(false);
    setStudentForm({
      nama: '',
      kelas: '',
      nis: '',
      nisn: '',
      alamat: '',
      namaOrangTua: '',
      status: 'Non Mukim',
      tahunAjaran: '2024/2025',
      totalBiaya: '',
    });
    toast.success('Siswa berhasil ditambahkan!');
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      setStudents(students.filter(s => s.id !== studentId));
      toast.success('Data siswa berhasil dihapus!');
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedStudents = students.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    );
    setStudents(updatedStudents);
  };

  const handleImportData = (importedStudents: Student[]) => {
    const updatedStudents = [...students, ...importedStudents];
    setStudents(updatedStudents);
  };

  const handleManageRincianBiaya = (student: Student) => {
    setManagingBiayaStudent(student);
    setIsRincianBiayaOpen(true);
  };

  const handleAddBiaya = () => {
    if (!biayaForm.nama || !biayaForm.jumlah) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const jumlah = parseFloat(biayaForm.jumlah);
    if (isNaN(jumlah) || jumlah < 0) {
      alert('Jumlah harus berupa angka positif');
      return;
    }

    const newBiaya: BiayaAdministrasi = {
      id: Date.now().toString(),
      nama: biayaForm.nama,
      jumlah,
      keterangan: biayaForm.keterangan,
    };

    setBiayaAdmin([...biayaAdmin, newBiaya]);
    setIsAddBiayaOpen(false);
    setBiayaForm({
      nama: '',
      jumlah: '',
      keterangan: '',
    });
    toast.success('Biaya administrasi berhasil ditambahkan!');
  };

  const handleDeleteBiaya = (biayaId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus biaya ini?')) {
      setBiayaAdmin(biayaAdmin.filter(b => b.id !== biayaId));
      toast.success('Biaya administrasi berhasil dihapus!');
    }
  };

  const handleEditBiaya = (biaya: BiayaAdministrasi) => {
    setEditingBiaya(biaya);
    setBiayaForm({
      nama: biaya.nama,
      jumlah: biaya.jumlah.toString(),
      keterangan: biaya.keterangan,
    });
    setIsEditBiayaOpen(true);
  };

  const handleUpdateBiaya = () => {
    if (!biayaForm.nama || !biayaForm.jumlah) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const jumlah = parseFloat(biayaForm.jumlah);
    if (isNaN(jumlah) || jumlah < 0) {
      alert('Jumlah harus berupa angka positif');
      return;
    }

    if (!editingBiaya) return;

    const updatedBiaya: BiayaAdministrasi = {
      ...editingBiaya,
      nama: biayaForm.nama,
      jumlah,
      keterangan: biayaForm.keterangan,
    };

    setBiayaAdmin(biayaAdmin.map(b => b.id === editingBiaya.id ? updatedBiaya : b));
    setIsEditBiayaOpen(false);
    setEditingBiaya(null);
    setBiayaForm({
      nama: '',
      jumlah: '',
      keterangan: '',
    });
    toast.success('Biaya administrasi berhasil diupdate!');
  };

  const handleExportData = () => {
    const data = {
      students,
      biayaAdmin,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-sekolah-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate total biaya administrasi
  const totalBiayaAdministrasi = biayaAdmin.reduce((sum, biaya) => sum + biaya.jumlah, 0);

  // Rekapitulasi Functions
  const uniqueKelasRekap = Array.from(new Set(students.map(s => s.kelas))).sort();
  const uniqueTahunRekap = Array.from(new Set(students.map(s => s.tahunAjaran))).sort();

  const filteredStudentsRekap = students.filter(student => {
    const matchKelas = rekapFilterKelas === 'all' || student.kelas === rekapFilterKelas;
    const matchTahun = rekapFilterTahun === 'all' || student.tahunAjaran === rekapFilterTahun;
    const matchStatus = rekapFilterStatus === 'all' || student.status === rekapFilterStatus;
    const matchSearch = rekapSearchQuery === '' || 
      student.nama.toLowerCase().includes(rekapSearchQuery.toLowerCase()) ||
      student.nis.includes(rekapSearchQuery) ||
      student.nisn.includes(rekapSearchQuery);

    return matchKelas && matchTahun && matchStatus && matchSearch;
  });

  const grandTotalsRekap = {
    jumlahSeharusnya: filteredStudentsRekap.reduce((sum, s) => sum + s.totalBiaya, 0),
    jumlahPemasukan: filteredStudentsRekap.reduce((sum, s) => sum + s.terbayar, 0),
    jumlahKekurangan: filteredStudentsRekap.reduce((sum, s) => sum + (s.totalBiaya - s.terbayar), 0),
  };

  const toggleStudentDetail = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const handleExportRekapCSV = () => {
    let csvContent = 'No,Nama Siswa,NIS,NISN,Kelas,Status,Tahun Ajaran,Jumlah Seharusnya,Jumlah Pemasukan,Jumlah Kekurangan\n';
    
    filteredStudentsRekap.forEach((student, index) => {
      const kekurangan = student.totalBiaya - student.terbayar;
      csvContent += `${index + 1},"${student.nama}","${student.nis}","${student.nisn}","${student.kelas}","${student.status}","${student.tahunAjaran}",${student.totalBiaya},${student.terbayar},${kekurangan}\n`;
      
      if (student.rincianBiaya && student.rincianBiaya.length > 0) {
        student.rincianBiaya.forEach(item => {
          csvContent += `,"${item.namaBiaya}","","","","","",${item.jumlah},${item.terbayar},${item.tunggakan}\n`;
        });
      }
    });

    csvContent += `\nGRAND TOTAL,,,,,,,${grandTotalsRekap.jumlahSeharusnya},${grandTotalsRekap.jumlahPemasukan},${grandTotalsRekap.jumlahKekurangan}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekapitulasi-siswa-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data rekapitulasi berhasil diexport!');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="siswa" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="siswa">Data Siswa</TabsTrigger>
          <TabsTrigger value="biaya">Biaya Administrasi</TabsTrigger>
        </TabsList>

        {/* Student Settings Tab */}
        <TabsContent value="siswa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manajemen Data Siswa</CardTitle>
                  <CardDescription>Kelola data siswa dan informasi pembayaran</CardDescription>
                </div>
                <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Siswa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Siswa Baru</DialogTitle>
                      <DialogDescription>Masukkan data siswa baru</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nama">Nama Lengkap *</Label>
                          <Input
                            id="nama"
                            value={studentForm.nama}
                            onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                        <div>
                          <Label htmlFor="kelas">Kelas *</Label>
                          <Input
                            id="kelas"
                            value={studentForm.kelas}
                            onChange={(e) => setStudentForm({ ...studentForm, kelas: e.target.value })}
                            placeholder="Contoh: X RPL 1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nis">NIS *</Label>
                          <Input
                            id="nis"
                            value={studentForm.nis}
                            onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                            placeholder="Nomor Induk Siswa"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nisn">NISN *</Label>
                          <Input
                            id="nisn"
                            value={studentForm.nisn}
                            onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                            placeholder="Nomor Induk Siswa Nasional"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="alamat">Alamat</Label>
                          <Input
                            id="alamat"
                            value={studentForm.alamat}
                            onChange={(e) => setStudentForm({ ...studentForm, alamat: e.target.value })}
                            placeholder="Alamat lengkap"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="namaOrangTua">Nama Orang Tua</Label>
                          <Input
                            id="namaOrangTua"
                            value={studentForm.namaOrangTua}
                            onChange={(e) => setStudentForm({ ...studentForm, namaOrangTua: e.target.value })}
                            placeholder="Nama lengkap orang tua"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status *</Label>
                          <Select 
                            value={studentForm.status} 
                            onValueChange={(value: 'Mukim' | 'Non Mukim') => setStudentForm({ ...studentForm, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mukim">Mukim</SelectItem>
                              <SelectItem value="Non Mukim">Non Mukim</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tahunAjaran">Tahun Ajaran *</Label>
                          <Input
                            id="tahunAjaran"
                            value={studentForm.tahunAjaran}
                            onChange={(e) => setStudentForm({ ...studentForm, tahunAjaran: e.target.value })}
                            placeholder="Contoh: 2024/2025"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="totalBiaya">Total Biaya (Rp) *</Label>
                          <Input
                            id="totalBiaya"
                            type="number"
                            value={studentForm.totalBiaya}
                            onChange={(e) => setStudentForm({ ...studentForm, totalBiaya: e.target.value })}
                            placeholder="Masukkan total biaya"
                            min="0"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddStudent} className="w-full">
                        Simpan Data Siswa
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import dari Excel
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>NIS</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tahun Ajaran</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Belum ada data siswa
                          </TableCell>
                        </TableRow>
                      ) : (
                        students.map((student, index) => (
                          <TableRow key={student.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{student.nama}</TableCell>
                            <TableCell>{student.kelas}</TableCell>
                            <TableCell>{student.nis}</TableCell>
                            <TableCell>{student.status}</TableCell>
                            <TableCell>{student.tahunAjaran}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleManageRincianBiaya(student)}
                              >
                                <DollarSign className="h-4 w-4 text-green-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rekapitulasi Administrasi Siswa */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Rekapitulasi Administrasi Siswa
                  </CardTitle>
                  <CardDescription>
                    Lihat rekapitulasi lengkap administrasi dan pembayaran setiap siswa
                  </CardDescription>
                </div>
                <Button 
                  variant={showRekapitulasi ? "default" : "outline"} 
                  onClick={() => setShowRekapitulasi(!showRekapitulasi)}
                >
                  {showRekapitulasi ? 'Sembunyikan' : 'Tampilkan'} Rekapitulasi
                </Button>
              </div>
            </CardHeader>
            
            {showRekapitulasi && (
              <CardContent>
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
                          <p className="text-3xl font-bold text-blue-600">{filteredStudentsRekap.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Jumlah Seharusnya</p>
                          <p className="text-xl font-bold text-purple-600">{formatCurrency(grandTotalsRekap.jumlahSeharusnya)}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Jumlah Pemasukan</p>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(grandTotalsRekap.jumlahPemasukan)}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Jumlah Kekurangan</p>
                          <p className="text-xl font-bold text-red-600">{formatCurrency(grandTotalsRekap.jumlahKekurangan)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Filter Rekapitulasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Cari Siswa</Label>
                          <Input
                            placeholder="Nama, NIS, atau NISN..."
                            value={rekapSearchQuery}
                            onChange={(e) => setRekapSearchQuery(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Kelas</Label>
                          <Select value={rekapFilterKelas} onValueChange={setRekapFilterKelas}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Kelas</SelectItem>
                              {uniqueKelasRekap.map(kelas => (
                                <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tahun Ajaran</Label>
                          <Select value={rekapFilterTahun} onValueChange={setRekapFilterTahun}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Tahun</SelectItem>
                              {uniqueTahunRekap.map(tahun => (
                                <SelectItem key={tahun} value={tahun}>{tahun}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select value={rekapFilterStatus} onValueChange={setRekapFilterStatus}>
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
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={handleExportRekapCSV}>
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>
                          <Printer className="h-4 w-4 mr-2" />
                          Cetak
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rekapitulasi Table */}
                  <div className="overflow-x-auto border rounded-lg">
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
                        {filteredStudentsRekap.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                              Tidak ada data yang sesuai dengan filter
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            {filteredStudentsRekap.flatMap((student, index) => {
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
                                        <span className="h-4 w-4" />
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
                                  <TableCell className="text-right font-semibold">
                                    {formatCurrency(student.totalBiaya)}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-green-600">
                                    {formatCurrency(student.terbayar)}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-red-600">
                                    {formatCurrency(kekurangan)}
                                  </TableCell>
                                </TableRow>
                              ];

                              // Add detail rows if expanded
                              if (expandedStudents.has(student.id) && student.rincianBiaya && student.rincianBiaya.length > 0) {
                                student.rincianBiaya.forEach((item: BiayaItem) => {
                                  rows.push(
                                    <TableRow key={`${student.id}-${item.id}`} className="bg-blue-50">
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                      <TableCell colSpan={5} className="pl-8 italic text-sm">
                                        ↳ {item.namaBiaya}
                                      </TableCell>
                                      <TableCell className="text-right text-sm">{formatCurrency(item.jumlah)}</TableCell>
                                      <TableCell className="text-right text-sm text-green-600">{formatCurrency(item.terbayar)}</TableCell>
                                      <TableCell className="text-right text-sm text-red-600">{formatCurrency(item.tunggakan)}</TableCell>
                                    </TableRow>
                                  );
                                });
                              }

                              return rows;
                            })}
                            
                            {/* Grand Total Row */}
                            <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold">
                              <TableCell colSpan={7} className="text-right text-lg">GRAND TOTAL</TableCell>
                              <TableCell className="text-right text-lg">{formatCurrency(grandTotalsRekap.jumlahSeharusnya)}</TableCell>
                              <TableCell className="text-right text-lg">{formatCurrency(grandTotalsRekap.jumlahPemasukan)}</TableCell>
                              <TableCell className="text-right text-lg">{formatCurrency(grandTotalsRekap.jumlahKekurangan)}</TableCell>
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Biaya Administrasi Tab */}
        <TabsContent value="biaya" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manajemen Biaya Administrasi</CardTitle>
                  <CardDescription>Kelola jenis dan jumlah biaya administrasi sekolah</CardDescription>
                </div>
                <Dialog open={isAddBiayaOpen} onOpenChange={setIsAddBiayaOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Biaya
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Biaya Administrasi</DialogTitle>
                      <DialogDescription>Masukkan jenis biaya baru</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="namaBiaya">Nama Biaya *</Label>
                        <Input
                          id="namaBiaya"
                          value={biayaForm.nama}
                          onChange={(e) => setBiayaForm({ ...biayaForm, nama: e.target.value })}
                          placeholder="Contoh: SPP Bulanan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="jumlahBiaya">Jumlah (Rp) *</Label>
                        <Input
                          id="jumlahBiaya"
                          type="number"
                          value={biayaForm.jumlah}
                          onChange={(e) => setBiayaForm({ ...biayaForm, jumlah: e.target.value })}
                          placeholder="Masukkan jumlah"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="keteranganBiaya">Keterangan</Label>
                        <Input
                          id="keteranganBiaya"
                          value={biayaForm.keterangan}
                          onChange={(e) => setBiayaForm({ ...biayaForm, keterangan: e.target.value })}
                          placeholder="Keterangan tambahan"
                        />
                      </div>
                      <Button onClick={handleAddBiaya} className="w-full">
                        Simpan Biaya
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isEditBiayaOpen} onOpenChange={setIsEditBiayaOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Biaya Administrasi</DialogTitle>
                      <DialogDescription>Perbarui jenis biaya</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="namaBiaya">Nama Biaya *</Label>
                        <Input
                          id="namaBiaya"
                          value={biayaForm.nama}
                          onChange={(e) => setBiayaForm({ ...biayaForm, nama: e.target.value })}
                          placeholder="Contoh: SPP Bulanan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="jumlahBiaya">Jumlah (Rp) *</Label>
                        <Input
                          id="jumlahBiaya"
                          type="number"
                          value={biayaForm.jumlah}
                          onChange={(e) => setBiayaForm({ ...biayaForm, jumlah: e.target.value })}
                          placeholder="Masukkan jumlah"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="keteranganBiaya">Keterangan</Label>
                        <Input
                          id="keteranganBiaya"
                          value={biayaForm.keterangan}
                          onChange={(e) => setBiayaForm({ ...biayaForm, keterangan: e.target.value })}
                          placeholder="Keterangan tambahan"
                        />
                      </div>
                      <Button onClick={handleUpdateBiaya} className="w-full">
                        Update Biaya
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Biaya</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {biayaAdmin.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Belum ada data biaya administrasi
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {biayaAdmin.map((biaya, index) => (
                          <TableRow key={biaya.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{biaya.nama}</TableCell>
                            <TableCell className="font-semibold text-blue-600">{formatCurrency(biaya.jumlah)}</TableCell>
                            <TableCell>{biaya.keterangan}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBiaya(biaya.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditBiaya(biaya)}
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow className="bg-blue-50 border-t-2 border-blue-200">
                          <TableCell colSpan={2} className="font-bold text-right">TOTAL BIAYA MASUK</TableCell>
                          <TableCell className="font-bold text-lg text-blue-700">
                            {formatCurrency(totalBiayaAdministrasi)}
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Data Modal */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportData}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={editingStudent}
        onUpdate={handleUpdateStudent}
      />

      {/* Rincian Biaya Modal */}
      <RincianBiayaModal
        isOpen={isRincianBiayaOpen}
        onClose={() => setIsRincianBiayaOpen(false)}
        student={managingBiayaStudent}
        onUpdate={handleUpdateStudent}
        biayaAdmin={biayaAdmin}
      />
    </div>
  );
}
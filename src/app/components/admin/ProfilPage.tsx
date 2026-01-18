import { UserCircle, Mail, Shield, Calendar, Building, MapPin, Phone, Globe, FileText, Briefcase, GraduationCap, Edit, User as UserIcon, IdCard, Award, CreditCard, Cake, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import type { User } from '@/app/types';

interface ProfilPageProps {
  currentUser: User;
}

export function ProfilPage({ currentUser }: ProfilPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(currentUser);
  const [isEditingSekolah, setIsEditingSekolah] = useState(false);
  
  // Profil Admin State (simpan di localStorage)
  const getProfilAdmin = () => {
    const saved = localStorage.getItem('profilAdmin');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      namaLengkap: 'Siti Nurjanah, S.Pd',
      nip: '197203151998022003',
      nik: '3603155203720002',
      jabatan: 'Kepala Tata Usaha',
      statusKepegawaian: 'PNS',
      golongan: 'III/c',
      tempatLahir: 'Tangerang',
      tanggalLahir: '1972-03-15',
      jenisKelamin: 'Perempuan',
      agama: 'Islam',
      alamat: 'Jl. Merpati No. 45, Cisauk, Tangerang',
      noTelepon: '0812-3456-7890',
      email: 'siti.nurjanah@smkalishlah.sch.id',
      pendidikanTerakhir: 'S1 Pendidikan',
      jurusan: 'Administrasi Pendidikan',
      tahunMasuk: '1998',
      noRekening: '1234567890',
      namaBank: 'Bank BRI',
      atasNama: 'Siti Nurjanah',
      npwp: '12.345.678.9-012.345',
    };
  };
  
  const [profilAdmin, setProfilAdmin] = useState(getProfilAdmin());
  
  const saveProfilAdmin = (data: any) => {
    localStorage.setItem('profilAdmin', JSON.stringify(data));
    setProfilAdmin(data);
    toast.success('Profil admin berhasil diperbarui!');
    setIsEditing(false);
  };
  
  // Profil Sekolah State (simpan di localStorage)
  const getProfilSekolah = () => {
    const saved = localStorage.getItem('profilSekolah');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      namaSekolah: 'SMK AL-ISHLAH CISAUK',
      npsn: '20604285',
      statusSekolah: 'Swasta',
      akreditasi: 'A',
      alamat: 'Jl. Raya Cisauk No. 123, Cisauk, Tangerang',
      kelurahan: 'Cisauk',
      kecamatan: 'Cisauk',
      kabupaten: 'Tangerang',
      provinsi: 'Banten',
      kodePos: '15345',
      noTelepon: '021-12345678',
      email: 'info@smkalishlah.sch.id',
      website: 'www.smkalishlah.sch.id',
      kepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd',
      nipKepalaSekolah: '196512251990031007',
      kepalaTataUsaha: 'Siti Nurjanah, S.Pd',
      nipKepalaTU: '197203151998022003',
      bendahara: 'Rina Wati, S.E',
      nipBendahara: '198006102005012008',
    };
  };
  
  const [profilSekolah, setProfilSekolah] = useState(getProfilSekolah());
  
  const saveProfilSekolah = (data: any) => {
    localStorage.setItem('profilSekolah', JSON.stringify(data));
    setProfilSekolah(data);
    toast.success('Profil sekolah berhasil diperbarui!');
    setIsEditingSekolah(false);
  };
  
  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const hitungUsia = (tanggalLahir: string) => {
    const today = new Date();
    const birthDate = new Date(tanggalLahir);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const hitungMasaKerja = (tahunMasuk: string) => {
    const currentYear = new Date().getFullYear();
    const masaKerja = currentYear - parseInt(tahunMasuk);
    return masaKerja;
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Simulate saving the edited user
    toast.success('Profil berhasil diperbarui');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(currentUser);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profil Pribadi Administrator */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profil Pribadi Administrator
              </CardTitle>
              <CardDescription className="mt-2">
                Informasi lengkap data pribadi dan kepegawaian
              </CardDescription>
            </div>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profil Pribadi</DialogTitle>
                  <DialogDescription>
                    Perbarui informasi pribadi dan kepegawaian Anda
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Data Pribadi */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      Data Pribadi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nama Lengkap *</Label>
                        <Input
                          value={profilAdmin.namaLengkap}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, namaLengkap: e.target.value })}
                          placeholder="Nama lengkap dengan gelar"
                        />
                      </div>
                      <div>
                        <Label>NIK *</Label>
                        <Input
                          value={profilAdmin.nik}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, nik: e.target.value })}
                          placeholder="Nomor Induk Kependudukan"
                        />
                      </div>
                      <div>
                        <Label>Tempat Lahir *</Label>
                        <Input
                          value={profilAdmin.tempatLahir}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, tempatLahir: e.target.value })}
                          placeholder="Kota/Kabupaten"
                        />
                      </div>
                      <div>
                        <Label>Tanggal Lahir *</Label>
                        <Input
                          type="date"
                          value={profilAdmin.tanggalLahir}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, tanggalLahir: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Jenis Kelamin *</Label>
                        <Select
                          value={profilAdmin.jenisKelamin}
                          onValueChange={(value) => setProfilAdmin({ ...profilAdmin, jenisKelamin: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Agama *</Label>
                        <Select
                          value={profilAdmin.agama}
                          onValueChange={(value) => setProfilAdmin({ ...profilAdmin, agama: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Islam">Islam</SelectItem>
                            <SelectItem value="Kristen">Kristen</SelectItem>
                            <SelectItem value="Katolik">Katolik</SelectItem>
                            <SelectItem value="Hindu">Hindu</SelectItem>
                            <SelectItem value="Buddha">Buddha</SelectItem>
                            <SelectItem value="Konghucu">Konghucu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Alamat Lengkap *</Label>
                      <Textarea
                        value={profilAdmin.alamat}
                        onChange={(e) => setProfilAdmin({ ...profilAdmin, alamat: e.target.value })}
                        placeholder="Alamat tempat tinggal"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Data Kepegawaian */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Data Kepegawaian
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>NIP *</Label>
                        <Input
                          value={profilAdmin.nip}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, nip: e.target.value })}
                          placeholder="Nomor Induk Pegawai"
                        />
                      </div>
                      <div>
                        <Label>Jabatan *</Label>
                        <Input
                          value={profilAdmin.jabatan}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, jabatan: e.target.value })}
                          placeholder="Jabatan/Posisi"
                        />
                      </div>
                      <div>
                        <Label>Status Kepegawaian *</Label>
                        <Select
                          value={profilAdmin.statusKepegawaian}
                          onValueChange={(value) => setProfilAdmin({ ...profilAdmin, statusKepegawaian: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PNS">PNS</SelectItem>
                            <SelectItem value="PPPK">PPPK</SelectItem>
                            <SelectItem value="GTY/PTY">GTY/PTY (Guru/Pegawai Tetap Yayasan)</SelectItem>
                            <SelectItem value="Honorer">Honorer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Golongan/Ruang</Label>
                        <Input
                          value={profilAdmin.golongan}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, golongan: e.target.value })}
                          placeholder="Contoh: III/c"
                        />
                      </div>
                      <div>
                        <Label>Tahun Masuk *</Label>
                        <Input
                          type="number"
                          value={profilAdmin.tahunMasuk}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, tahunMasuk: e.target.value })}
                          placeholder="Tahun mulai bekerja"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pendidikan */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Pendidikan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Pendidikan Terakhir *</Label>
                        <Select
                          value={profilAdmin.pendidikanTerakhir}
                          onValueChange={(value) => setProfilAdmin({ ...profilAdmin, pendidikanTerakhir: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                            <SelectItem value="D3">D3</SelectItem>
                            <SelectItem value="S1">S1</SelectItem>
                            <SelectItem value="S1 Pendidikan">S1 Pendidikan</SelectItem>
                            <SelectItem value="S2">S2</SelectItem>
                            <SelectItem value="S3">S3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Jurusan/Program Studi *</Label>
                        <Input
                          value={profilAdmin.jurusan}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, jurusan: e.target.value })}
                          placeholder="Nama jurusan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kontak */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Kontak
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>No. Telepon/HP *</Label>
                        <Input
                          value={profilAdmin.noTelepon}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, noTelepon: e.target.value })}
                          placeholder="08xx-xxxx-xxxx"
                        />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={profilAdmin.email}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, email: e.target.value })}
                          placeholder="email@domain.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Bank & Pajak */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Data Bank & Pajak
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nama Bank</Label>
                        <Input
                          value={profilAdmin.namaBank}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, namaBank: e.target.value })}
                          placeholder="Nama bank"
                        />
                      </div>
                      <div>
                        <Label>No. Rekening</Label>
                        <Input
                          value={profilAdmin.noRekening}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, noRekening: e.target.value })}
                          placeholder="Nomor rekening"
                        />
                      </div>
                      <div>
                        <Label>Atas Nama</Label>
                        <Input
                          value={profilAdmin.atasNama}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, atasNama: e.target.value })}
                          placeholder="Nama pemilik rekening"
                        />
                      </div>
                      <div>
                        <Label>NPWP</Label>
                        <Input
                          value={profilAdmin.npwp}
                          onChange={(e) => setProfilAdmin({ ...profilAdmin, npwp: e.target.value })}
                          placeholder="XX.XXX.XXX.X-XXX.XXX"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Batal
                  </Button>
                  <Button onClick={() => saveProfilAdmin(profilAdmin)}>
                    Simpan Profil Pribadi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header dengan Avatar */}
            <div className="flex items-start gap-6 pb-6 border-b">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                <UserCircle className="h-16 w-16 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{profilAdmin.namaLengkap}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge className="bg-indigo-600">{profilAdmin.jabatan}</Badge>
                  <Badge variant="secondary">{profilAdmin.statusKepegawaian}</Badge>
                  {profilAdmin.golongan && <Badge variant="outline">Gol. {profilAdmin.golongan}</Badge>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <p className="text-xs text-gray-600">Usia</p>
                    <p className="text-lg font-bold text-indigo-600">{hitungUsia(profilAdmin.tanggalLahir)} Tahun</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <p className="text-xs text-gray-600">Masa Kerja</p>
                    <p className="text-lg font-bold text-green-600">{hitungMasaKerja(profilAdmin.tahunMasuk)} Tahun</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <p className="text-xs text-gray-600">Pendidikan</p>
                    <p className="text-lg font-bold text-purple-600">{profilAdmin.pendidikanTerakhir}</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="text-lg font-bold text-orange-600">Aktif</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Pribadi */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <IdCard className="h-4 w-4" />
                Data Pribadi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">NIK</p>
                  <p className="font-semibold">{profilAdmin.nik}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">NIP</p>
                  <p className="font-semibold">{profilAdmin.nip}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Tempat, Tanggal Lahir</p>
                  <p className="font-semibold">{profilAdmin.tempatLahir}, {formatTanggal(profilAdmin.tanggalLahir)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Jenis Kelamin</p>
                  <p className="font-semibold">{profilAdmin.jenisKelamin}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Agama</p>
                  <p className="font-semibold">{profilAdmin.agama}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg col-span-1 md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Alamat</p>
                  <p className="font-semibold">{profilAdmin.alamat}</p>
                </div>
              </div>
            </div>

            {/* Data Kepegawaian */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Data Kepegawaian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-500 mb-1">Jabatan</p>
                  <p className="font-bold text-lg text-blue-900">{profilAdmin.jabatan}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <p className="text-xs text-gray-500 mb-1">Status Kepegawaian</p>
                  <p className="font-bold text-lg text-green-900">{profilAdmin.statusKepegawaian}</p>
                </div>
                {profilAdmin.golongan && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Golongan/Ruang</p>
                    <p className="font-semibold">{profilAdmin.golongan}</p>
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Tahun Masuk</p>
                  <p className="font-semibold">{profilAdmin.tahunMasuk}</p>
                </div>
              </div>
            </div>

            {/* Pendidikan */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Pendidikan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Pendidikan Terakhir</p>
                  <p className="font-semibold">{profilAdmin.pendidikanTerakhir}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Jurusan/Program Studi</p>
                  <p className="font-semibold">{profilAdmin.jurusan}</p>
                </div>
              </div>
            </div>

            {/* Kontak */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Kontak
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">No. Telepon/HP</p>
                  <p className="font-semibold">{profilAdmin.noTelepon}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-semibold">{profilAdmin.email}</p>
                </div>
              </div>
            </div>

            {/* Data Bank & Pajak */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Data Bank & Pajak
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Bank & No. Rekening</p>
                  <p className="font-semibold">{profilAdmin.namaBank} - {profilAdmin.noRekening}</p>
                  <p className="text-xs text-gray-600 mt-1">a.n. {profilAdmin.atasNama}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">NPWP</p>
                  <p className="font-semibold">{profilAdmin.npwp}</p>
                </div>
              </div>
            </div>

            {/* Info Login */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Informasi Login</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600">Username</p>
                      <p className="font-medium text-blue-900">{currentUser.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Role</p>
                      <p className="font-medium text-blue-900">{currentUser.role.toUpperCase()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-blue-600">Login Terakhir</p>
                      <p className="font-medium text-blue-900">{new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profil Sekolah untuk Laporan */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Profil Sekolah untuk Laporan
              </CardTitle>
              <CardDescription className="mt-2">
                Informasi sekolah yang akan digunakan dalam laporan dan kwitansi resmi
              </CardDescription>
            </div>
            <Dialog open={isEditingSekolah} onOpenChange={setIsEditingSekolah}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profil Sekolah</DialogTitle>
                  <DialogDescription>
                    Perbarui informasi sekolah yang akan muncul di laporan dan dokumen resmi
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nama Sekolah *</Label>
                      <Input
                        value={profilSekolah.namaSekolah}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, namaSekolah: e.target.value })}
                        placeholder="Nama lengkap sekolah"
                      />
                    </div>
                    <div>
                      <Label>NPSN *</Label>
                      <Input
                        value={profilSekolah.npsn}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, npsn: e.target.value })}
                        placeholder="Nomor Pokok Sekolah Nasional"
                      />
                    </div>
                    <div>
                      <Label>Status Sekolah *</Label>
                      <Select
                        value={profilSekolah.statusSekolah}
                        onValueChange={(value) => setProfilSekolah({ ...profilSekolah, statusSekolah: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Negeri">Negeri</SelectItem>
                          <SelectItem value="Swasta">Swasta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Akreditasi *</Label>
                      <Select
                        value={profilSekolah.akreditasi}
                        onValueChange={(value) => setProfilSekolah({ ...profilSekolah, akreditasi: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="Belum Terakreditasi">Belum Terakreditasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Alamat Lengkap *</Label>
                    <Textarea
                      value={profilSekolah.alamat}
                      onChange={(e) => setProfilSekolah({ ...profilSekolah, alamat: e.target.value })}
                      placeholder="Alamat lengkap sekolah"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Kelurahan *</Label>
                      <Input
                        value={profilSekolah.kelurahan}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, kelurahan: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Kecamatan *</Label>
                      <Input
                        value={profilSekolah.kecamatan}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, kecamatan: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Kabupaten/Kota *</Label>
                      <Input
                        value={profilSekolah.kabupaten}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, kabupaten: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Provinsi *</Label>
                      <Input
                        value={profilSekolah.provinsi}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, provinsi: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Kode Pos *</Label>
                      <Input
                        value={profilSekolah.kodePos}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, kodePos: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>No. Telepon *</Label>
                      <Input
                        value={profilSekolah.noTelepon}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, noTelepon: e.target.value })}
                        placeholder="021-12345678"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        value={profilSekolah.email}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, email: e.target.value })}
                        placeholder="email@sekolah.sch.id"
                      />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input
                        value={profilSekolah.website}
                        onChange={(e) => setProfilSekolah({ ...profilSekolah, website: e.target.value })}
                        placeholder="www.sekolah.sch.id"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Pejabat Sekolah
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nama Kepala Sekolah *</Label>
                          <Input
                            value={profilSekolah.kepalaSekolah}
                            onChange={(e) => setProfilSekolah({ ...profilSekolah, kepalaSekolah: e.target.value })}
                            placeholder="Nama lengkap dengan gelar"
                          />
                        </div>
                        <div>
                          <Label>NIP Kepala Sekolah *</Label>
                          <Input
                            value={profilSekolah.nipKepalaSekolah}
                            onChange={(e) => setProfilSekolah({ ...profilSekolah, nipKepalaSekolah: e.target.value })}
                            placeholder="NIP"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nama Kepala Tata Usaha *</Label>
                          <Input
                            value={profilSekolah.kepalaTataUsaha}
                            onChange={(e) => setProfilSekolah({ ...profilSekolah, kepalaTataUsaha: e.target.value })}
                            placeholder="Nama lengkap dengan gelar"
                          />
                        </div>
                        <div>
                          <Label>NIP Kepala TU *</Label>
                          <Input
                            value={profilSekolah.nipKepalaTU}
                            onChange={(e) => setProfilSekolah({ ...profilSekolah, nipKepalaTU: e.target.value })}
                            placeholder="NIP"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nama Bendahara *</Label>
                          <Input
                            value={profilSekolah.bendahara}
                            onChange={(e) => setProfilSekolah({ ...profilSekolah, bendahara: e.target.value })}
                            placeholder="Nama lengkap dengan gelar"
                          />
                        </div>
                        <div>
                          <Label>NIP Bendahara *</Label>
                          <Input
                            value={profilSekolah.nipBendahara}
                            onChange={(e) => setProfilSekolah({ ...profilSekolah, nipBendahara: e.target.value })}
                            placeholder="NIP"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditingSekolah(false)}>
                    Batal
                  </Button>
                  <Button onClick={() => saveProfilSekolah(profilSekolah)}>
                    Simpan Profil Sekolah
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Informasi Dasar Sekolah */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Nama Sekolah</p>
                  <p className="font-semibold text-blue-900">{profilSekolah.namaSekolah}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">NPSN</p>
                  <p className="font-semibold">{profilSekolah.npsn}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status Sekolah</p>
                  <Badge variant={profilSekolah.statusSekolah === 'Negeri' ? 'default' : 'secondary'}>
                    {profilSekolah.statusSekolah}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Akreditasi</p>
                  <Badge className="bg-green-600">{profilSekolah.akreditasi}</Badge>
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Alamat
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <p className="font-medium">{profilSekolah.alamat}</p>
                <p className="text-sm text-gray-600">
                  Kel. {profilSekolah.kelurahan}, Kec. {profilSekolah.kecamatan}, {profilSekolah.kabupaten}
                </p>
                <p className="text-sm text-gray-600">
                  {profilSekolah.provinsi} - {profilSekolah.kodePos}
                </p>
              </div>
            </div>

            {/* Kontak */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Kontak
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Telepon</p>
                  <p className="font-medium">{profilSekolah.noTelepon}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-sm">{profilSekolah.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Website</p>
                  <p className="font-medium text-sm">{profilSekolah.website}</p>
                </div>
              </div>
            </div>

            {/* Pejabat Sekolah */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Pejabat Sekolah
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600">Kepala Sekolah</Badge>
                  </div>
                  <p className="font-semibold text-lg">{profilSekolah.kepalaSekolah}</p>
                  <p className="text-sm text-gray-600">NIP: {profilSekolah.nipKepalaSekolah}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Kepala Tata Usaha</Badge>
                    </div>
                    <p className="font-semibold">{profilSekolah.kepalaTataUsaha}</p>
                    <p className="text-sm text-gray-600">NIP: {profilSekolah.nipKepalaTU}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Bendahara</Badge>
                    </div>
                    <p className="font-semibold">{profilSekolah.bendahara}</p>
                    <p className="text-sm text-gray-600">NIP: {profilSekolah.nipBendahara}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Informasi Penting</h4>
                  <p className="text-sm text-yellow-800">
                    Data profil sekolah ini akan digunakan dalam semua laporan resmi, kwitansi pembayaran, 
                    dan dokumen administrasi lainnya. Pastikan semua informasi akurat dan up-to-date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hak Akses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Dashboard</span>
              <Badge variant="default">Full Access</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Data Siswa</span>
              <Badge variant="default">Full Access</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Laporan Keuangan</span>
              <Badge variant="default">Full Access</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Pemasukan & Pengeluaran</span>
              <Badge variant="default">Full Access</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Pengaturan</span>
              <Badge variant="default">Full Access</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Versi Sistem</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Tanggal Update Terakhir</span>
              <span className="font-medium">15 Januari 2025</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Status Sistem</span>
              <Badge variant="default" className="bg-green-600">Aktif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Keamanan Akun</h4>
              <p className="text-sm text-blue-700">
                Selalu jaga kerahasiaan username dan password Anda. Jangan membagikan informasi login kepada pihak lain.
                Logout setelah selesai menggunakan sistem untuk menjaga keamanan data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-4" onClick={handleEdit}>
            Edit Profil
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>
              Ubah informasi profil Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={editedUser.nama}
                onChange={(e) => setEditedUser({ ...editedUser, nama: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editedUser.username}
                onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editedUser.role}
                onValueChange={(value) => setEditedUser({ ...editedUser, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih role">{editedUser.role}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
            >
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import type { Student } from '@/app/types';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdate: (student: Student) => void;
}

export function EditStudentModal({ isOpen, onClose, student, onUpdate }: EditStudentModalProps) {
  const [formData, setFormData] = useState<Student>({
    id: '',
    nama: '',
    kelas: '',
    nis: '',
    nisn: '',
    alamat: '',
    namaOrangTua: '',
    status: 'Non Mukim',
    tahunAjaran: '',
    totalBiaya: 0,
    terbayar: 0,
    tunggakan: 0,
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  const handleChange = (field: keyof Student, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate tunggakan when totalBiaya or terbayar changes
      if (field === 'totalBiaya' || field === 'terbayar') {
        const totalBiaya = field === 'totalBiaya' ? parseFloat(value) || 0 : updated.totalBiaya;
        const terbayar = field === 'terbayar' ? parseFloat(value) || 0 : updated.terbayar;
        updated.tunggakan = totalBiaya - terbayar;
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nama || !formData.kelas || !formData.nis || !formData.nisn) {
      toast.error('Harap lengkapi data wajib (Nama, Kelas, NIS, NISN)');
      return;
    }

    if (formData.terbayar > formData.totalBiaya) {
      toast.error('Jumlah terbayar tidak boleh lebih besar dari total biaya');
      return;
    }

    onUpdate(formData);
    toast.success('Data siswa berhasil diperbarui!');
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Siswa</DialogTitle>
          <DialogDescription>Perbarui informasi siswa dengan benar.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => handleChange('nama', e.target.value)}
                placeholder="Nama lengkap siswa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas <span className="text-red-500">*</span></Label>
              <Input
                id="kelas"
                value={formData.kelas}
                onChange={(e) => handleChange('kelas', e.target.value)}
                placeholder="Contoh: X RPL 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nis">NIS <span className="text-red-500">*</span></Label>
              <Input
                id="nis"
                value={formData.nis}
                onChange={(e) => handleChange('nis', e.target.value)}
                placeholder="Nomor Induk Siswa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nisn">NISN <span className="text-red-500">*</span></Label>
              <Input
                id="nisn"
                value={formData.nisn}
                onChange={(e) => handleChange('nisn', e.target.value)}
                placeholder="Nomor Induk Siswa Nasional"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                value={formData.alamat}
                onChange={(e) => handleChange('alamat', e.target.value)}
                placeholder="Alamat lengkap"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaOrangTua">Nama Orang Tua / Wali</Label>
              <Input
                id="namaOrangTua"
                value={formData.namaOrangTua}
                onChange={(e) => handleChange('namaOrangTua', e.target.value)}
                placeholder="Nama orang tua/wali"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mukim">Mukim</SelectItem>
                  <SelectItem value="Non Mukim">Non Mukim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tahunAjaran">Tahun Ajaran</Label>
              <Input
                id="tahunAjaran"
                value={formData.tahunAjaran}
                onChange={(e) => handleChange('tahunAjaran', e.target.value)}
                placeholder="Contoh: 2024/2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalBiaya">Total Biaya</Label>
              <Input
                id="totalBiaya"
                type="number"
                value={formData.totalBiaya}
                onChange={(e) => handleChange('totalBiaya', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terbayar">Terbayar</Label>
              <Input
                id="terbayar"
                type="number"
                value={formData.terbayar}
                onChange={(e) => handleChange('terbayar', e.target.value)}
                placeholder="0"
                min="0"
                max={formData.totalBiaya}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tunggakan">Tunggakan</Label>
              <Input
                id="tunggakan"
                type="number"
                value={formData.tunggakan}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={handleClose} variant="outline" className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
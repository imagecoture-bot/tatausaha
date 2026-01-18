import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, DollarSign, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import type { Student, BiayaItem, BiayaAdministrasi } from '@/app/types';

interface RincianBiayaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdate: (updatedStudent: Student) => void;
  biayaAdmin?: BiayaAdministrasi[];
}

export function RincianBiayaModal({ isOpen, onClose, student, onUpdate, biayaAdmin = [] }: RincianBiayaModalProps) {
  const [rincianBiaya, setRincianBiaya] = useState<BiayaItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedBiayaAdmin, setSelectedBiayaAdmin] = useState<string>('');
  const [formData, setFormData] = useState({
    namaBiaya: '',
    jumlah: '',
    terbayar: '',
  });

  // Form for inline row editing
  const [editFormData, setEditFormData] = useState<Record<string, { namaBiaya: string; jumlah: string; terbayar: string }>>({});

  useEffect(() => {
    if (student) {
      setRincianBiaya(student.rincianBiaya || []);
    }
  }, [student]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotals = (items: BiayaItem[]) => {
    const totalBiaya = items.reduce((sum, item) => sum + item.jumlah, 0);
    const totalTerbayar = items.reduce((sum, item) => sum + item.terbayar, 0);
    const totalTunggakan = items.reduce((sum, item) => sum + item.tunggakan, 0);
    return { totalBiaya, totalTerbayar, totalTunggakan };
  };

  const handleSelectBiayaAdmin = (biayaId: string) => {
    setSelectedBiayaAdmin(biayaId);
    const selectedBiaya = biayaAdmin.find(b => b.id === biayaId);
    if (selectedBiaya) {
      setFormData({
        namaBiaya: selectedBiaya.nama,
        jumlah: selectedBiaya.jumlah.toString(),
        terbayar: '0',
      });
    }
  };

  const handleAddItem = () => {
    if (!formData.namaBiaya || !formData.jumlah) {
      toast.error('Mohon lengkapi nama biaya dan jumlah!');
      return;
    }

    const jumlah = parseFloat(formData.jumlah);
    const terbayar = formData.terbayar ? parseFloat(formData.terbayar) : 0;

    if (isNaN(jumlah) || jumlah < 0) {
      toast.error('Jumlah harus berupa angka positif!');
      return;
    }

    if (isNaN(terbayar) || terbayar < 0 || terbayar > jumlah) {
      toast.error('Terbayar tidak valid!');
      return;
    }

    const tunggakan = jumlah - terbayar;
    const status: 'Lunas' | 'Belum Lunas' = tunggakan === 0 ? 'Lunas' : 'Belum Lunas';

    const newItem: BiayaItem = {
      id: `${student?.id}-${Date.now()}`,
      namaBiaya: formData.namaBiaya,
      jumlah,
      terbayar,
      tunggakan,
      status,
    };
    setRincianBiaya([...rincianBiaya, newItem]);
    toast.success('Item biaya berhasil ditambahkan!');

    // Reset form
    setFormData({ namaBiaya: '', jumlah: '', terbayar: '' });
    setSelectedBiayaAdmin('');
  };

  const handleEditItem = (item: BiayaItem) => {
    setEditingItemId(item.id);
    setEditFormData({
      ...editFormData,
      [item.id]: {
        namaBiaya: item.namaBiaya,
        jumlah: item.jumlah.toString(),
        terbayar: item.terbayar.toString(),
      }
    });
  };

  const handleSaveEdit = (itemId: string) => {
    const editData = editFormData[itemId];
    if (!editData || !editData.namaBiaya || !editData.jumlah) {
      toast.error('Mohon lengkapi nama biaya dan jumlah!');
      return;
    }

    const jumlah = parseFloat(editData.jumlah);
    const terbayar = editData.terbayar ? parseFloat(editData.terbayar) : 0;

    if (isNaN(jumlah) || jumlah < 0) {
      toast.error('Jumlah harus berupa angka positif!');
      return;
    }

    if (isNaN(terbayar) || terbayar < 0 || terbayar > jumlah) {
      toast.error('Terbayar tidak valid!');
      return;
    }

    const tunggakan = jumlah - terbayar;
    const status: 'Lunas' | 'Belum Lunas' = tunggakan === 0 ? 'Lunas' : 'Belum Lunas';

    const updatedItems = rincianBiaya.map(item =>
      item.id === itemId
        ? { ...item, namaBiaya: editData.namaBiaya, jumlah, terbayar, tunggakan, status }
        : item
    );
    setRincianBiaya(updatedItems);
    toast.success('Item biaya berhasil diupdate!');
    setEditingItemId(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus item biaya ini?')) {
      const updatedItems = rincianBiaya.filter(item => item.id !== itemId);
      setRincianBiaya(updatedItems);
      toast.success('Item biaya berhasil dihapus!');
    }
  };

  const handleSave = () => {
    if (!student) return;

    const { totalBiaya, totalTerbayar, totalTunggakan } = calculateTotals(rincianBiaya);

    const updatedStudent: Student = {
      ...student,
      rincianBiaya,
      totalBiaya,
      terbayar: totalTerbayar,
      tunggakan: totalTunggakan,
    };

    onUpdate(updatedStudent);
    toast.success('Rincian biaya berhasil disimpan!');
    onClose();
  };

  const { totalBiaya, totalTerbayar, totalTunggakan } = calculateTotals(rincianBiaya);

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Kelola Rincian Biaya - {student.nama}
          </DialogTitle>
          <DialogDescription>
            Tambah, edit, atau hapus rincian biaya untuk siswa ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total Biaya</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(totalBiaya)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Terbayar</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(totalTerbayar)}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600">Tunggakan</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(totalTunggakan)}</p>
            </div>
          </div>

          {/* Table with inline add/edit */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Biaya</TableHead>
                  <TableHead className="text-right w-32">Jumlah</TableHead>
                  <TableHead className="text-right w-32">Terbayar</TableHead>
                  <TableHead className="text-right w-32">Tunggakan</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="text-right w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Add New Row - Always visible at top */}
                <TableRow className="bg-blue-50 border-blue-200">
                  <TableCell className="font-bold text-blue-700">+</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {biayaAdmin.length > 0 && (
                        <Select
                          value={selectedBiayaAdmin}
                          onValueChange={handleSelectBiayaAdmin}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Pilih dari master..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Input Manual</SelectItem>
                            {biayaAdmin.map(biaya => (
                              <SelectItem key={biaya.id} value={biaya.id}>
                                {biaya.nama} - {formatCurrency(biaya.jumlah)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Input
                        className="h-8"
                        value={formData.namaBiaya}
                        onChange={(e) => setFormData({ ...formData, namaBiaya: e.target.value })}
                        placeholder="Nama biaya..."
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="h-8 text-right"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="h-8 text-right"
                      value={formData.terbayar}
                      onChange={(e) => setFormData({ ...formData, terbayar: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="text-right text-gray-400">
                    <span className="text-xs">auto</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">Baru</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={handleAddItem}
                      className="h-8 px-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Existing Items */}
                {rincianBiaya.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500 text-sm">
                      Belum ada rincian biaya. Tambahkan di baris biru di atas.
                    </TableCell>
                  </TableRow>
                ) : (
                  rincianBiaya.map((item, index) => (
                    <TableRow 
                      key={item.id} 
                      className={editingItemId === item.id ? 'bg-yellow-50' : ''}
                    >
                      <TableCell>{index + 1}</TableCell>
                      {editingItemId === item.id ? (
                        // Edit Mode
                        <>
                          <TableCell>
                            <Input
                              className="h-8"
                              value={editFormData[item.id]?.namaBiaya || ''}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                [item.id]: { ...editFormData[item.id], namaBiaya: e.target.value }
                              })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="h-8 text-right"
                              value={editFormData[item.id]?.jumlah || ''}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                [item.id]: { ...editFormData[item.id], jumlah: e.target.value }
                              })}
                              min="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="h-8 text-right"
                              value={editFormData[item.id]?.terbayar || ''}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                [item.id]: { ...editFormData[item.id], terbayar: e.target.value }
                              })}
                              min="0"
                            />
                          </TableCell>
                          <TableCell className="text-right text-gray-400">
                            <span className="text-xs">auto</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">Edit...</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveEdit(item.id)}
                                className="h-8 px-2"
                              >
                                <span className="text-green-600">✓</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="h-8 px-2"
                              >
                                <span className="text-red-600">✕</span>
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <TableCell className="font-medium">{item.namaBiaya}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(item.jumlah)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(item.terbayar)}</TableCell>
                          <TableCell className="text-right text-red-600">{formatCurrency(item.tunggakan)}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'Lunas' ? 'default' : 'destructive'} className="text-xs">
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                                className="h-8 px-2"
                              >
                                <Pencil className="h-3 w-3 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="h-8 px-2"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              Simpan Semua Perubahan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

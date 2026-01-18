import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Calculator, Save, X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import type { Student, BiayaItem } from '@/app/types';

interface KelolaRincianBiayaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateStudent: (student: Student) => void;
}

export function KelolaRincianBiayaModal({ 
  isOpen, 
  onClose, 
  student, 
  onUpdateStudent 
}: KelolaRincianBiayaModalProps) {
  const [rincianBiaya, setRincianBiaya] = useState<BiayaItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    namaBiaya: '',
    jumlah: '',
    terbayar: ''
  });

  // Form for inline row editing
  const [editFormData, setEditFormData] = useState<Record<string, { namaBiaya: string; jumlah: string; terbayar: string }>>({});

  // Initialize rincian biaya when student changes
  useEffect(() => {
    if (student) {
      // Ensure rincianBiaya is always an array, even if undefined
      setRincianBiaya(Array.isArray(student.rincianBiaya) ? [...student.rincianBiaya] : []);
    } else {
      setRincianBiaya([]);
    }
  }, [student]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const calculateTotals = (items: BiayaItem[]) => {
    const totalBiaya = items.reduce((sum, item) => sum + item.jumlah, 0);
    const totalTerbayar = items.reduce((sum, item) => sum + item.terbayar, 0);
    const totalTunggakan = totalBiaya - totalTerbayar;
    
    return { totalBiaya, totalTerbayar, totalTunggakan };
  };

  const totals = calculateTotals(rincianBiaya);

  const handleAddBiaya = () => {
    if (!formData.namaBiaya.trim()) {
      toast.error('Nama biaya harus diisi');
      return;
    }

    const jumlah = parseFloat(formData.jumlah);
    const terbayar = parseFloat(formData.terbayar || '0');

    if (isNaN(jumlah) || jumlah <= 0) {
      toast.error('Jumlah biaya harus berupa angka positif');
      return;
    }

    if (isNaN(terbayar) || terbayar < 0) {
      toast.error('Jumlah terbayar harus berupa angka positif atau 0');
      return;
    }

    if (terbayar > jumlah) {
      toast.error('Jumlah terbayar tidak boleh melebihi jumlah biaya');
      return;
    }

    const tunggakan = jumlah - terbayar;
    const status: 'Lunas' | 'Belum Lunas' = tunggakan <= 0 ? 'Lunas' : 'Belum Lunas';

    const newItem: BiayaItem = {
      id: `BIAYA-${Date.now()}`,
      namaBiaya: formData.namaBiaya.trim(),
      jumlah,
      terbayar,
      tunggakan,
      status
    };

    const updatedRincian = [...rincianBiaya, newItem];
    setRincianBiaya(updatedRincian);

    toast.success('Item biaya berhasil ditambahkan!');
    setFormData({ namaBiaya: '', jumlah: '', terbayar: '' });
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
    if (!editData || !editData.namaBiaya.trim()) {
      toast.error('Nama biaya harus diisi');
      return;
    }

    const jumlah = parseFloat(editData.jumlah);
    const terbayar = parseFloat(editData.terbayar);

    if (isNaN(jumlah) || jumlah <= 0) {
      toast.error('Jumlah biaya harus berupa angka positif');
      return;
    }

    if (isNaN(terbayar) || terbayar < 0) {
      toast.error('Jumlah terbayar harus berupa angka positif atau 0');
      return;
    }

    if (terbayar > jumlah) {
      toast.error('Jumlah terbayar tidak boleh melebihi jumlah biaya');
      return;
    }

    const tunggakan = jumlah - terbayar;
    const status: 'Lunas' | 'Belum Lunas' = tunggakan <= 0 ? 'Lunas' : 'Belum Lunas';

    const updatedRincian = rincianBiaya.map(item =>
      item.id === itemId
        ? { ...item, namaBiaya: editData.namaBiaya.trim(), jumlah, terbayar, tunggakan, status }
        : item
    );
    setRincianBiaya(updatedRincian);

    toast.success('Item biaya berhasil diupdate!');
    setEditingItemId(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleDeleteBiaya = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus item biaya ini?')) {
      const updatedRincian = rincianBiaya.filter(item => item.id !== id);
      setRincianBiaya(updatedRincian);
      toast.success('Item biaya berhasil dihapus!');
    }
  };

  const handleSaveRincian = () => {
    if (!student) return;

    const { totalBiaya, totalTerbayar, totalTunggakan } = calculateTotals(rincianBiaya);

    const updatedStudent: Student = {
      ...student,
      rincianBiaya: [...rincianBiaya],
      totalBiaya,
      terbayar: totalTerbayar,
      tunggakan: totalTunggakan
    };

    onUpdateStudent(updatedStudent);
    toast.success('Rincian biaya berhasil disimpan!');
    onClose();
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            Kelola Rincian Biaya - {student.nama}
          </DialogTitle>
          <DialogDescription className="text-xs">
            NIS: {student.nis} | Kelas: {student.kelas} | Status: {student.status}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-3">
          {/* Summary Statistics - Compact */}
          <div className="grid grid-cols-3 gap-3 flex-shrink-0">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-gray-600">Total Biaya</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(totals.totalBiaya)}</p>
              <p className="text-xs text-gray-500">{rincianBiaya.length} item</p>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-xs text-gray-600">Terbayar</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(totals.totalTerbayar)}</p>
              <p className="text-xs text-gray-500">
                {totals.totalBiaya > 0 ? Math.round((totals.totalTerbayar / totals.totalBiaya) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <p className="text-xs text-gray-600">Tunggakan</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(totals.totalTunggakan)}</p>
              <p className="text-xs text-gray-500">
                {totals.totalTunggakan <= 0 ? 'Lunas' : 'Belum Lunas'}
              </p>
            </div>
          </div>

          {/* Table with inline add/edit - Scrollable */}
          <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Biaya</TableHead>
                    <TableHead className="text-right w-32">Jumlah</TableHead>
                    <TableHead className="text-right w-32">Terbayar</TableHead>
                    <TableHead className="text-right w-32">Tunggakan</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="text-right w-20">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Add New Row - Always visible at top */}
                  <TableRow className="bg-blue-50 border-blue-200 sticky top-10 z-10">
                    <TableCell className="font-bold text-blue-700">+</TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-sm"
                        value={formData.namaBiaya}
                        onChange={(e) => setFormData({ ...formData, namaBiaya: e.target.value })}
                        placeholder="Nama biaya..."
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-8 text-right text-sm"
                        value={formData.jumlah}
                        onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-8 text-right text-sm"
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
                        onClick={handleAddBiaya}
                        className="h-7 px-2"
                      >
                        <Plus className="h-3 w-3" />
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
                        <TableCell className="text-sm">{index + 1}</TableCell>
                        {editingItemId === item.id ? (
                          // Edit Mode
                          <>
                            <TableCell>
                              <Input
                                className="h-8 text-sm"
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
                                className="h-8 text-right text-sm"
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
                                className="h-8 text-right text-sm"
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
                                  className="h-7 px-2"
                                >
                                  <span className="text-green-600 text-lg">✓</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="h-7 px-2"
                                >
                                  <span className="text-red-600 text-lg">✕</span>
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          // View Mode
                          <>
                            <TableCell className="font-medium text-sm">{item.namaBiaya}</TableCell>
                            <TableCell className="text-right font-semibold text-blue-700 text-sm">
                              {formatCurrency(item.jumlah)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-700 text-sm">
                              {formatCurrency(item.terbayar)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-red-700 text-sm">
                              {formatCurrency(item.tunggakan)}
                            </TableCell>
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
                                  className="h-7 px-2"
                                >
                                  <Edit className="h-3 w-3 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteBiaya(item.id)}
                                  className="h-7 px-2"
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

                  {/* Total Row */}
                  {rincianBiaya.length > 0 && (
                    <TableRow className="bg-gray-100 font-bold sticky bottom-0">
                      <TableCell colSpan={2} className="text-right text-sm">TOTAL:</TableCell>
                      <TableCell className="text-right text-blue-700 text-sm">
                        {formatCurrency(totals.totalBiaya)}
                      </TableCell>
                      <TableCell className="text-right text-green-700 text-sm">
                        {formatCurrency(totals.totalTerbayar)}
                      </TableCell>
                      <TableCell className="text-right text-red-700 text-sm">
                        {formatCurrency(totals.totalTunggakan)}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0 border-t pt-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleSaveRincian} className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Simpan Rincian Biaya
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}